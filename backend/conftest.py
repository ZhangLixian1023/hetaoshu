import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from users.models import User
import os

@pytest.fixture
def api_client():
    """提供API客户端实例"""
    return APIClient()

@pytest.fixture
def admin_user():
    """创建并返回管理员用户"""
    user = User.objects.create_superuser(
        student_id='admin001',
        email='admin001@slai.edu.cn',
        password='admin@123'
    )
    return user

@pytest.fixture
def regular_user():
    """创建并返回普通用户"""
    user = User.objects.create_user(
        student_id='student001',
        email='student001@slai.edu.cn',
        password='student@123'
    )
    return user

@pytest.fixture
def authenticated_client(api_client, regular_user):
    """提供已认证的API客户端"""
    api_client.force_authenticate(user=regular_user)
    return api_client

@pytest.fixture
def admin_client(api_client, admin_user):
    """提供管理员用户的API客户端"""
    api_client.force_authenticate(user=admin_user)
    return api_client

# 配置测试环境
def pytest_configure(config):
    # 设置测试环境变量
    os.environ['DJANGO_SETTINGS_MODULE'] = 'hetaoshu.settings'
    os.environ['DEBUG'] = 'True'
    os.environ['EMAIL_BACKEND'] = 'django.core.mail.backends.locmem.EmailBackend'  # 使用内存邮件后端

# 清理测试数据库
def pytest_sessionfinish(session, exitstatus):
    """测试会话结束时的清理工作"""
    pass