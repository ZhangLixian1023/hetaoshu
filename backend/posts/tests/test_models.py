from django.test import TestCase
from users.models import User
from posts.models import Post, PostImage, Comment, PostLink
from django.utils import timezone

class PostModelTest(TestCase):
    def setUp(self):
        # 创建测试用户
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
        # 创建测试帖子
        self.post = Post.objects.create(
            title='测试帖子标题',
            content='测试帖子内容',
            type='article',
            author=self.user
        )
    
    def test_post_creation(self):
        """测试帖子模型创建"""
        self.assertEqual(self.post.title, '测试帖子标题')
        self.assertEqual(self.post.content, '测试帖子内容')
        self.assertEqual(self.post.type, 'article')
        self.assertEqual(self.post.author, self.user)
        self.assertEqual(self.post.status, 'published')
        self.assertIsNotNone(self.post.created_at)
        self.assertIsNotNone(self.post.updated_at)
    
    def test_post_str_representation(self):
        """测试帖子的字符串表示"""
        self.assertEqual(str(self.post), '测试帖子标题')
    
    def test_post_update(self):
        """测试更新帖子"""
        # 记录原始更新时间
        original_updated_at = self.post.updated_at
        
        # 更新帖子
        self.post.title = '更新后的标题'
        self.post.save()
        
        # 验证更新结果
        self.assertEqual(self.post.title, '更新后的标题')
        self.assertGreater(self.post.updated_at, original_updated_at)

class PostImageModelTest(TestCase):
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
        # 创建测试图片（这里使用None作为图片文件路径，实际测试可能需要使用mock文件）
        self.post_image = PostImage.objects.create(
            post=self.post,
            image=None,
            sort_order=1
        )
    
    def test_post_image_creation(self):
        """测试帖子图片模型创建"""
        self.assertEqual(self.post_image.post, self.post)
        self.assertEqual(self.post_image.image, None)  # 在实际测试中可能需要mock文件
        self.assertEqual(self.post_image.sort_order, 1)
        self.assertIsNotNone(self.post_image.created_at)
    
    def test_post_image_ordering(self):
        """测试帖子图片的排序"""
        # 创建更多图片
        image2 = PostImage.objects.create(
            post=self.post,
            image=None,
            sort_order=2
        )
        image0 = PostImage.objects.create(
            post=self.post,
            image=None,
            sort_order=0
        )
        
        # 按sort_order排序
        images = PostImage.objects.filter(post=self.post).order_by('sort_order')
        self.assertEqual(list(images), [image0, self.post_image, image2])

class CommentModelTest(TestCase):
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
    
    def test_comment_creation(self):
        """测试评论模型创建"""
        self.assertEqual(self.comment.post, self.post)
        self.assertEqual(self.comment.author, self.user)
        self.assertEqual(self.comment.content, '测试评论内容')
        self.assertEqual(self.comment.parent_comment, None)  # 顶级评论
        self.assertEqual(self.comment.status, 'published')
        self.assertIsNotNone(self.comment.created_at)
    
    def test_comment_str_representation(self):
        """测试评论的字符串表示"""
        self.assertTrue(str(self.comment).startswith('评论'))
        self.assertIn('测试评论内容', str(self.comment))
    
    def test_comment_with_parent(self):
        """测试带有父评论的评论"""
        reply = Comment.objects.create(
            post=self.post,
            author=self.user,
            content='回复评论',
            parent_comment=self.comment
        )
        
        self.assertEqual(reply.parent_comment, self.comment)
        # 验证反向关系
        self.assertIn(reply, self.comment.replies.all())

class PostLinkModelTest(TestCase):
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
        # 创建帖子链接
        self.post_link = PostLink.objects.create(
            source_post=self.post1,
            target_post=self.post2
        )
    
    def test_post_link_creation(self):
        """测试帖子链接模型创建"""
        self.assertEqual(self.post_link.source_post, self.post1)
        self.assertEqual(self.post_link.target_post, self.post2)
        self.assertIsNotNone(self.post_link.created_at)
    
    def test_post_link_unique_constraint(self):
        """测试帖子链接的唯一约束"""
        # 尝试创建相同的链接应该抛出异常
        with self.assertRaises(Exception):
            PostLink.objects.create(
                source_post=self.post1,
                target_post=self.post2
            )
    
    def test_post_link_reverse_relationship(self):
        """测试帖子链接的反向关系"""
        # 验证source_post的outgoing_links
        self.assertIn(self.post_link, self.post1.outgoing_links.all())
        # 验证target_post的incoming_links
        self.assertIn(self.post_link, self.post2.incoming_links.all())