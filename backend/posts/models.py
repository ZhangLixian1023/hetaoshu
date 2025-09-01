from django.db import models
from django.conf import settings
import uuid

class Post(models.Model):
    POST_TYPES = (
        ('share', '个人分享'),
        ('discussion', '话题讨论'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name='标题')
    content = models.TextField(verbose_name='内容')
    post_type = models.CharField(max_length=20, choices=POST_TYPES, verbose_name='帖子类型')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts', verbose_name='作者')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    is_active = models.BooleanField(default=True, verbose_name='是否有效')
    
    def __str__(self):
        return f"{self.title} ({self.get_post_type_display()})"
    
    class Meta:
        verbose_name = '帖子'
        verbose_name_plural = '帖子'
        ordering = ['-created_at']

class PostImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images', verbose_name='帖子')
    image = models.ImageField(upload_to='post_images/', verbose_name='图片')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    order = models.PositiveIntegerField(default=0, verbose_name='排序')
    
    class Meta:
        verbose_name = '帖子图片'
        verbose_name_plural = '帖子图片'
        ordering = ['order']

class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments', verbose_name='帖子')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments', verbose_name='作者')
    content = models.TextField(verbose_name='内容')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies', verbose_name='父评论')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    is_active = models.BooleanField(default=True, verbose_name='是否有效')
    
    def __str__(self):
        return f"评论 by {self.author.student_id} on {self.post.title}"
    
    class Meta:
        verbose_name = '评论'
        verbose_name_plural = '评论'
        ordering = ['created_at']

class PostLink(models.Model):
    """用于帖子之间的链接关系"""
    source_post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='outgoing_links', verbose_name='源帖子')
    target_post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='incoming_links', verbose_name='目标帖子')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    
    class Meta:
        verbose_name = '帖子链接'
        verbose_name_plural = '帖子链接'
        unique_together = ('source_post', 'target_post')  # 避免重复链接
