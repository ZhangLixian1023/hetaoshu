from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User
from posts.models import Post, Comment, PostLink, PostImage
from unittest.mock import patch

class PostViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # 创建测试用户
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
        # 创建另一个测试用户
        self.other_user = User.objects.create_user(
            student_id='20210002',
            email='20210002@slai.edu.cn',
            password='testpassword456'
        )
        # 创建测试帖子
        self.post = Post.objects.create(
            title='测试帖子标题',
            content='测试帖子内容',
            type='article',
            author=self.user
        )
        # 认证客户端
        self.client.force_authenticate(user=self.user)
    
    def test_get_post_list(self):
        """测试获取帖子列表"""
        url = reverse('post-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # 应该只返回一个帖子
        self.assertEqual(response.data[0]['title'], '测试帖子标题')
    
    def test_create_post(self):
        """测试创建帖子"""
        url = reverse('post-list')
        data = {
            'title': '新帖子标题',
            'content': '新帖子内容',
            'type': 'article'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], '新帖子标题')
        self.assertEqual(response.data['author'], self.user.student_id)
        
        # 验证帖子是否被创建
        self.assertTrue(Post.objects.filter(title='新帖子标题').exists())
    
    def test_get_post_detail(self):
        """测试获取帖子详情"""
        url = reverse('post-detail', args=[self.post.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], '测试帖子标题')
        self.assertEqual(response.data['content'], '测试帖子内容')
    
    def test_update_own_post(self):
        """测试更新自己的帖子"""
        url = reverse('post-detail', args=[self.post.id])
        data = {
            'title': '更新后的标题',
            'content': '更新后的内容'
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], '更新后的标题')
        
        # 验证帖子是否被更新
        self.post.refresh_from_db()
        self.assertEqual(self.post.title, '更新后的标题')
    
    def test_update_other_users_post(self):
        """测试更新其他用户的帖子（应该被拒绝）"""
        # 创建另一个用户的帖子
        other_post = Post.objects.create(
            title='其他用户的帖子',
            content='其他用户的内容',
            type='article',
            author=self.other_user
        )
        
        url = reverse('post-detail', args=[other_post.id])
        data = {
            'title': '尝试更新的标题',
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_own_post(self):
        """测试删除自己的帖子"""
        url = reverse('post-detail', args=[self.post.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # 验证帖子是否被删除
        self.assertFalse(Post.objects.filter(id=self.post.id).exists())
    
    def test_add_post_link(self):
        """测试添加帖子链接"""
        # 创建另一个帖子
        target_post = Post.objects.create(
            title='目标帖子',
            content='目标帖子内容',
            type='article',
            author=self.user
        )
        
        url = reverse('post-add-link', args=[self.post.id])
        data = {
            'target_post_id': str(target_post.id)
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], '链接添加成功')
        
        # 验证链接是否被创建
        self.assertTrue(PostLink.objects.filter(
            source_post=self.post,
            target_post=target_post
        ).exists())
    
    def test_add_duplicate_post_link(self):
        """测试添加重复的帖子链接（应该失败）"""
        # 创建另一个帖子
        target_post = Post.objects.create(
            title='目标帖子',
            content='目标帖子内容',
            type='article',
            author=self.user
        )
        
        # 先添加一个链接
        PostLink.objects.create(
            source_post=self.post,
            target_post=target_post
        )
        
        # 尝试添加相同的链接
        url = reverse('post-add-link', args=[self.post.id])
        data = {
            'target_post_id': str(target_post.id)
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class CommentViewSetTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # 创建测试用户
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
        # 创建另一个测试用户
        self.other_user = User.objects.create_user(
            student_id='20210002',
            email='20210002@slai.edu.cn',
            password='testpassword456'
        )
        # 创建测试帖子
        self.post = Post.objects.create(
            title='测试帖子标题',
            content='测试帖子内容',
            type='article',
            author=self.user
        )
        # 创建测试评论
        self.comment = Comment.objects.create(
            post=self.post,
            author=self.user,
            content='测试评论内容'
        )
        # 认证客户端
        self.client.force_authenticate(user=self.user)
    
    def test_get_comments_for_post(self):
        """测试获取帖子的评论列表"""
        url = reverse('comment-list')
        response = self.client.get(url, {'post': self.post.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # 应该只返回一个评论
        self.assertEqual(response.data[0]['content'], '测试评论内容')
    
    def test_create_comment(self):
        """测试创建评论"""
        url = reverse('comment-list')
        data = {
            'post': str(self.post.id),
            'content': '新评论内容'
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], '新评论内容')
        self.assertEqual(response.data['author'], self.user.student_id)
        
        # 验证评论是否被创建
        self.assertTrue(Comment.objects.filter(content='新评论内容').exists())
    
    def test_create_reply_to_comment(self):
        """测试回复评论"""
        url = reverse('comment-list')
        data = {
            'post': str(self.post.id),
            'content': '回复评论',
            'parent_comment': str(self.comment.id)
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], '回复评论')
        self.assertEqual(response.data['parent_comment'], str(self.comment.id))
    
    def test_update_own_comment(self):
        """测试更新自己的评论"""
        url = reverse('comment-detail', args=[self.comment.id])
        data = {
            'content': '更新后的评论内容'
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['content'], '更新后的评论内容')
        
        # 验证评论是否被更新
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.content, '更新后的评论内容')
    
    def test_update_other_users_comment(self):
        """测试更新其他用户的评论（应该被拒绝）"""
        # 创建另一个用户的评论
        other_comment = Comment.objects.create(
            post=self.post,
            author=self.other_user,
            content='其他用户的评论'
        )
        
        url = reverse('comment-detail', args=[other_comment.id])
        data = {
            'content': '尝试更新的评论内容',
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
    
    def test_delete_own_comment(self):
        """测试删除自己的评论"""
        url = reverse('comment-detail', args=[self.comment.id])
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # 验证评论是否被删除
        self.assertFalse(Comment.objects.filter(id=self.comment.id).exists())
    
    def test_post_author_delete_other_users_comment(self):
        """测试帖子作者可以删除其他用户的评论"""
        # 创建另一个用户的评论
        other_comment = Comment.objects.create(
            post=self.post,  # 帖子作者是当前用户
            author=self.other_user,
            content='其他用户的评论'
        )
        
        url = reverse('comment-detail', args=[other_comment.id])
        response = self.client.delete(url)  # 当前用户是帖子作者
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # 验证评论是否被删除
        self.assertFalse(Comment.objects.filter(id=other_comment.id).exists())
    
    def test_unauthenticated_access(self):
        """测试未认证访问需要认证的API"""
        unauthenticated_client = APIClient()
        
        # 测试创建评论
        url = reverse('comment-list')
        data = {
            'post': str(self.post.id),
            'content': '未认证用户的评论'
        }
        response = unauthenticated_client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # 测试更新评论
        url = reverse('comment-detail', args=[self.comment.id])
        response = unauthenticated_client.patch(url, {'content': '修改'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)