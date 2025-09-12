from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid
import random
import string
from datetime import timedelta
from django.utils import timezone

# 生成验证码过期时间的函数 - 这个函数将在数据库层面提供默认值
def get_default_expires_at():
    return timezone.now() + timedelta(minutes=10)

class UserManager(BaseUserManager):
    def create_user(self, student_id, email, password=None, **extra_fields):
        if not student_id:
            raise ValueError('必须提供学号')
        if not email:
            raise ValueError('必须提供邮箱')
        
        user = self.model(
            student_id=student_id,
            email=self.normalize_email(email),** extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user
    

class User(AbstractBaseUser, PermissionsMixin):
    student_id = models.CharField(max_length=20, unique=True, verbose_name='学号')
    email = models.EmailField(max_length=255, unique=True, verbose_name='邮箱')
    name = models.CharField(max_length=100, blank=True, null=True, verbose_name='姓名')
    is_active = models.BooleanField(default=True, verbose_name='是否激活')
    is_staff = models.BooleanField(default=False, verbose_name='是否为管理员')
    date_joined = models.DateTimeField(auto_now_add=True, verbose_name='加入日期')
    
    objects = UserManager()
    
    USERNAME_FIELD = 'student_id'
    REQUIRED_FIELDS = ['email']
    
    def __str__(self):
        return self.student_id
    
    class Meta:
        verbose_name = '用户'
        verbose_name_plural = '用户'

class VerificationCode(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='verification_codes')
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=get_default_expires_at)
    is_used = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if self._state.adding:   # 新建记录时生成验证码
            # 生成6位数字验证码
            self.code = ''.join(random.choices(string.digits, k=6))
        super().save(*args, **kwargs)
    
    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at
    
    class Meta:
        verbose_name = '验证码'
        verbose_name_plural = '验证码'
