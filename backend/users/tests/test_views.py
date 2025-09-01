from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from users.models import User, VerificationCode
from unittest.mock import patch, MagicMock

@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class UserViewsTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        # 创建测试用户
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
        # 认证客户端
        self.client.force_authenticate(user=self.user)
    
    def test_send_verification_code(self):
        """测试发送验证码API"""
        url = reverse('send-verification-code')
        data = {
            'student_id': '20210002',
            'email': '20210002@slai.edu.cn'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], '验证码已发送')
        
        # 验证用户和验证码是否被创建
        self.assertTrue(User.objects.filter(student_id='20210002').exists())
        new_user = User.objects.get(student_id='20210002')
        self.assertTrue(VerificationCode.objects.filter(user=new_user).exists())
    
    def test_send_verification_code_existing_user(self):
        """测试向已存在用户发送验证码"""
        url = reverse('send-verification-code')
        data = {
            'student_id': '20210001',
            'email': '20210001@slai.edu.cn'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证新的验证码是否被创建
        self.assertTrue(VerificationCode.objects.filter(user=self.user).exists())
    
    def test_verify_code_and_set_password(self):
        """测试验证验证码并设置密码"""
        # 创建一个未设置密码的用户
        new_user = User.objects.create_user(
            student_id='20210002',
            email='20210002@slai.edu.cn',
            password=None  # 未设置密码
        )
        # 创建验证码
        code = VerificationCode.objects.create(user=new_user)
        
        url = reverse('verify-code-set-password')
        data = {
            'student_id': '20210002',
            'code': code.code,
            'password': 'NewPassword123',
            'confirm_password': 'NewPassword123'
        }
        
        # 注意：这里使用未认证的客户端，因为用户还没有设置密码
        unauthenticated_client = APIClient()
        response = unauthenticated_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        
        # 验证密码是否被正确设置
        new_user.refresh_from_db()
        self.assertTrue(new_user.check_password('NewPassword123'))
        
        # 验证验证码是否被标记为已使用
        code.refresh_from_db()
        self.assertTrue(code.is_used)
    
    def test_verify_code_and_set_password_invalid_code(self):
        """测试使用无效验证码设置密码"""
        url = reverse('verify-code-set-password')
        data = {
            'student_id': '20210001',
            'code': 'invalid123',  # 无效验证码
            'password': 'NewPassword123',
            'confirm_password': 'NewPassword123'
        }
        
        unauthenticated_client = APIClient()
        response = unauthenticated_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_login(self):
        """测试登录API"""
        url = reverse('login')
        data = {
            'student_id': '20210001',
            'password': 'testpassword123'
        }
        
        unauthenticated_client = APIClient()
        response = unauthenticated_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)
    
    def test_login_invalid_credentials(self):
        """测试使用无效凭据登录"""
        url = reverse('login')
        data = {
            'student_id': '20210001',
            'password': 'wrongpassword'
        }
        
        unauthenticated_client = APIClient()
        response = unauthenticated_client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
    
    def test_logout(self):
        """测试登出API"""
        url = reverse('logout')
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], '退出登录成功')
    
    def test_get_user_detail(self):
        """测试获取用户详情API"""
        url = reverse('user-detail')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['student_id'], '20210001')
        self.assertEqual(response.data['email'], '20210001@slai.edu.cn')
    
    def test_update_user_detail(self):
        """测试更新用户详情API"""
        url = reverse('user-detail')
        data = {
            'name': '新用户名'
        }
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], '新用户名')
        
        # 验证用户数据已更新
        self.user.refresh_from_db()
        self.assertEqual(self.user.name, '新用户名')
    
    def test_unauthenticated_access(self):
        """测试未认证访问需要认证的API"""
        unauthenticated_client = APIClient()
        
        # 测试获取用户详情
        url = reverse('user-detail')
        response = unauthenticated_client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # 测试登出
        url = reverse('logout')
        response = unauthenticated_client.post(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)