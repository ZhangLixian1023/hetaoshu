from django.db import models
from django.conf import settings
import uuid
from django.utils import timezone

class Theme(models.Model):
    THEME_TYPES = (
        ('share', '分享'),
        ('discussion', '讨论'),
        ('ad', '广告'),
        ('notice', '通知')
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False, verbose_name='主题帖ID')
    title = models.CharField(max_length=100, verbose_name='主题帖标题')
    theme_type = models.CharField(max_length=20, choices=THEME_TYPES, default='share', verbose_name='主题帖类型')
    description = models.TextField(blank=True, null=True, verbose_name='主题帖描述')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='themes', verbose_name='作者')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    is_active = models.BooleanField(default=True, verbose_name='是否有效')
    valid_until = models.DateTimeField(null=True, blank=True, verbose_name='有效期到')
    first_post = models.ForeignKey('Post', null=True, blank=True, on_delete=models.SET_NULL, related_name='theme_first_post', verbose_name='第一个帖子')

    
    class Meta:
        verbose_name = '主题帖'
        verbose_name_plural = '主题帖'
        ordering = ['-created_at']
    def __str__(self):
        return self.title

class Post(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, blank=True, null=True, verbose_name='标题')
    content = models.TextField(blank=True, null=True, verbose_name='内容')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts', verbose_name='作者')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    is_active = models.BooleanField(default=True, verbose_name='是否有效')
    theme = models.ForeignKey(Theme, blank=False, null=False, on_delete=models.CASCADE, related_name='posts', verbose_name='主题帖')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies', verbose_name='父帖子')
    
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
