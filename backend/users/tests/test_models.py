from django.test import TestCase
from django.utils import timezone
from users.models import User, VerificationCode
from datetime import timedelta

class UserModelTest(TestCase):
    def setUp(self):
        # 创建测试用户
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
    
    def test_user_creation(self):
        """测试用户模型创建"""
        self.assertEqual(self.user.student_id, '20210001')
        self.assertEqual(self.user.email, '20210001@slai.edu.cn')
        self.assertTrue(self.user.check_password('testpassword123'))
        self.assertTrue(self.user.is_active)
        self.assertFalse(self.user.is_staff)
        self.assertFalse(self.user.is_superuser)
    
    def test_superuser_creation(self):
        """测试超级用户创建"""
        admin_user = User.objects.create_superuser(
            student_id='admin001',
            email='admin001@slai.edu.cn',
            password='adminpassword123'
        )
        self.assertEqual(admin_user.student_id, 'admin001')
        self.assertTrue(admin_user.is_active)
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
    
    def test_user_str_representation(self):
        """测试用户的字符串表示"""
        self.assertEqual(str(self.user), '20210001')
    
    def test_user_without_student_id(self):
        """测试创建没有学号的用户应该抛出异常"""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                student_id='',
                email='test@example.com',
                password='testpassword123'
            )
    
    def test_user_without_email(self):
        """测试创建没有邮箱的用户应该抛出异常"""
        with self.assertRaises(ValueError):
            User.objects.create_user(
                student_id='20210002',
                email='',
                password='testpassword123'
            )

class VerificationCodeModelTest(TestCase):
    def setUp(self):
        # 创建测试用户
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123'
        )
        # 创建验证码
        self.verification_code = VerificationCode.objects.create(user=self.user)
    
    def test_verification_code_creation(self):
        """测试验证码模型创建"""
        self.assertEqual(self.verification_code.user, self.user)
        self.assertEqual(len(self.verification_code.code), 6)  # 验证码应为6位
        self.assertTrue(self.verification_code.code.isdigit())  # 验证码应为数字
        self.assertFalse(self.verification_code.is_used)  # 初始状态应为未使用
        # 过期时间应为创建时间加10分钟
        self.assertAlmostEqual(
            self.verification_code.expires_at, 
            self.verification_code.created_at + timedelta(minutes=10),
            delta=timedelta(seconds=1)
        )
    
    def test_is_valid_method(self):
        """测试is_valid方法"""
        # 初始状态应为有效
        self.assertTrue(self.verification_code.is_valid())
        
        # 标记为已使用后应为无效
        self.verification_code.is_used = True
        self.verification_code.save()
        self.assertFalse(self.verification_code.is_valid())
        
        # 重置is_used状态
        self.verification_code.is_used = False
        self.verification_code.save()
        self.assertTrue(self.verification_code.is_valid())
        
        # 过期后应为无效
        self.verification_code.expires_at = timezone.now() - timedelta(minutes=5)
        self.verification_code.save()
        self.assertFalse(self.verification_code.is_valid())
    
    def test_save_method(self):
        """测试save方法的行为"""
        # 新建记录时应该生成验证码和过期时间
        new_code = VerificationCode(user=self.user)
        new_code.save()
        self.assertIsNotNone(new_code.code)
        self.assertIsNotNone(new_code.expires_at)
        
        # 更新现有记录时不应更改验证码和过期时间
        original_code = new_code.code
        original_expires_at = new_code.expires_at
        new_code.is_used = True
        new_code.save()
        self.assertEqual(new_code.code, original_code)
        self.assertEqual(new_code.expires_at, original_expires_at)