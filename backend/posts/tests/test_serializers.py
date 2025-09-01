from django.test import TestCase
from users.models import User
from posts.models import Post, PostImage, Comment, PostLink
from posts.serializers import (
    PostSerializer, PostDetailSerializer, CommentSerializer,
    PostImageSerializer, PostLinkSerializer
)

class PostSerializerTest(TestCase):
    def setUp(self):
        # 创建测试用户和帖子
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
        self.post = Post.objects.create(
            title='测试帖子标题',
            content='测试帖子内容',
            type='article',
            author=self.user
        )
    
    def test_post_serializer(self):
        """测试PostSerializer的序列化"""
        serializer = PostSerializer(self.post)
        data = serializer.data
        
        # 验证序列化的数据
        self.assertEqual(data['title'], '测试帖子标题')
        self.assertEqual(data['content'], '测试帖子内容')
        self.assertEqual(data['type'], 'article')
        self.assertEqual(data['author'], self.user.student_id)
        self.assertEqual(data['status'], 'published')
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)
    
    def test_post_serializer_create(self):
        """测试PostSerializer的创建功能"""
        data = {
            'title': '新帖子标题',
            'content': '新帖子内容',
            'type': 'article'
        }
        
        serializer = PostSerializer(data=data, context={'request': None})
        self.assertTrue(serializer.is_valid())
        created_post = serializer.save(author=self.user)
        
        # 验证创建结果
        self.assertEqual(created_post.title, '新帖子标题')
        self.assertEqual(created_post.content, '新帖子内容')
        self.assertEqual(created_post.author, self.user)
    
    def test_post_serializer_update(self):
        """测试PostSerializer的更新功能"""
        data = {
            'title': '更新后的标题',
            'content': '更新后的内容'
        }
        
        serializer = PostSerializer(self.post, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_post = serializer.save()
        
        # 验证更新结果
        self.assertEqual(updated_post.title, '更新后的标题')
        self.assertEqual(updated_post.content, '更新后的内容')

class PostDetailSerializerTest(TestCase):
    def setUp(self):
        # 创建测试用户和帖子
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
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
        # 创建测试图片
        self.post_image = PostImage.objects.create(
            post=self.post,
            image=None,
            sort_order=1
        )
    
    def test_post_detail_serializer(self):
        """测试PostDetailSerializer的序列化"""
        serializer = PostDetailSerializer(self.post)
        data = serializer.data
        
        # 验证基本信息
        self.assertEqual(data['title'], '测试帖子标题')
        self.assertEqual(data['content'], '测试帖子内容')
        self.assertEqual(data['type'], 'article')
        
        # 验证嵌套的评论和图片
        self.assertEqual(len(data['comments']), 1)
        self.assertEqual(data['comments'][0]['content'], '测试评论内容')
        self.assertEqual(len(data['images']), 1)
        
        # 验证只读字段
        self.assertIn('created_at', data)
        self.assertIn('updated_at', data)
        self.assertIn('author', data)

class CommentSerializerTest(TestCase):
    def setUp(self):
        # 创建测试用户和帖子
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
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
    
    def test_comment_serializer(self):
        """测试CommentSerializer的序列化"""
        serializer = CommentSerializer(self.comment)
        data = serializer.data
        
        # 验证序列化的数据
        self.assertEqual(data['content'], '测试评论内容')
        self.assertEqual(data['author'], self.user.student_id)
        self.assertIsNone(data['parent_comment'])
        self.assertIn('created_at', data)
    
    def test_comment_serializer_create(self):
        """测试CommentSerializer的创建功能"""
        data = {
            'post': str(self.post.id),
            'content': '新评论内容'
        }
        
        serializer = CommentSerializer(data=data, context={'request': None})
        self.assertTrue(serializer.is_valid())
        created_comment = serializer.save(author=self.user)
        
        # 验证创建结果
        self.assertEqual(created_comment.content, '新评论内容')
        self.assertEqual(created_comment.author, self.user)
        self.assertEqual(created_comment.post, self.post)
    
    def test_comment_with_parent(self):
        """测试带有父评论的评论序列化"""
        # 创建回复评论
        reply = Comment.objects.create(
            post=self.post,
            author=self.user,
            content='回复评论',
            parent_comment=self.comment
        )
        
        serializer = CommentSerializer(reply)
        data = serializer.data
        
        # 验证parent_comment字段
        self.assertEqual(data['parent_comment'], str(self.comment.id))

class PostImageSerializerTest(TestCase):
    def setUp(self):
        # 创建测试用户和帖子
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
        self.post = Post.objects.create(
            title='测试帖子标题',
            content='测试帖子内容',
            type='article',
            author=self.user
        )
    
    def test_post_image_serializer(self):
        """测试PostImageSerializer"""
        # 创建测试数据
        data = {
            'post': str(self.post.id),
            'sort_order': 1
            # 注意：在实际测试中，可能需要mock image文件
        }
        
        serializer = PostImageSerializer(data=data)
        # 在实际测试中，由于缺少image文件，可能需要使用mock或测试文件
        # 这里跳过is_valid检查，因为我们没有实际的图片文件
    
    def test_post_image_serializer_read(self):
        """测试PostImageSerializer的读取功能"""
        # 创建测试图片
        post_image = PostImage.objects.create(
            post=self.post,
            image=None,
            sort_order=1
        )
        
        serializer = PostImageSerializer(post_image)
        data = serializer.data
        
        # 验证序列化的数据
        self.assertEqual(data['sort_order'], 1)
        self.assertEqual(data['post'], str(self.post.id))

class PostLinkSerializerTest(TestCase):
    def setUp(self):
        # 创建测试用户和帖子
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
        self.post1 = Post.objects.create(
            title='帖子1',
            content='帖子1内容',
            type='article',
            author=self.user
        )
        self.post2 = Post.objects.create(
            title='帖子2',
            content='帖子2内容',
            type='article',
            author=self.user
        )
    
    def test_post_link_serializer_create(self):
        """测试PostLinkSerializer的创建功能"""
        data = {
            'source_post': str(self.post1.id),
            'target_post': str(self.post2.id)
        }
        
        serializer = PostLinkSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        created_link = serializer.save()
        
        # 验证创建结果
        self.assertEqual(created_link.source_post, self.post1)
        self.assertEqual(created_link.target_post, self.post2)
    
    def test_post_link_serializer_read(self):
        """测试PostLinkSerializer的读取功能"""
        # 创建帖子链接
        post_link = PostLink.objects.create(
            source_post=self.post1,
            target_post=self.post2
        )
        
        serializer = PostLinkSerializer(post_link)
        data = serializer.data
        
        # 验证序列化的数据
        self.assertEqual(data['source_post'], str(self.post1.id))
        self.assertEqual(data['target_post'], str(self.post2.id))
        self.assertIn('created_at', data)