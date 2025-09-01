from django.test import TestCase
from users.models import User
from users.serializers import UserSerializer, LoginSerializer, SetPasswordSerializer

class UserSerializerTest(TestCase):
    def setUp(self):
        # 创建测试用户
        self.user = User.objects.create_user(
            student_id='20210001',
            email='20210001@slai.edu.cn',
            password='testpassword123',
            name='张三'
        )
    
    def test_user_serializer(self):
        """测试UserSerializer的序列化"""
        serializer = UserSerializer(self.user)
        data = serializer.data
        
        # 验证序列化的数据
        self.assertEqual(data['student_id'], '20210001')
        self.assertEqual(data['email'], '20210001@slai.edu.cn')
        self.assertEqual(data['name'], '张三')
        # 检查只读字段是否存在
        self.assertIn('id', data)
        self.assertIn('is_active', data)
        self.assertIn('is_staff', data)
        self.assertIn('date_joined', data)
    
    def test_user_serializer_update(self):
        """测试UserSerializer的更新"""
        # 准备更新数据
        update_data = {
            'name': '李四',
        }
        
        # 尝试更新用户
        serializer = UserSerializer(self.user, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()
        
        # 验证更新结果
        self.assertEqual(updated_user.name, '李四')
    
    def test_user_serializer_cannot_update_readonly_fields(self):
        """测试无法更新只读字段"""
        # 尝试更新只读字段
        update_data = {
            'is_staff': True,  # 只读字段
            'date_joined': '2023-01-01T00:00:00Z'  # 只读字段
        }
        
        serializer = UserSerializer(self.user, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid())  # 序列化器会忽略只读字段
        updated_user = serializer.save()
        
        # 验证只读字段未被更新
        self.assertFalse(updated_user.is_staff)
        self.assertNotEqual(updated_user.date_joined.isoformat(), '2023-01-01T00:00:00+00:00')

class LoginSerializerTest(TestCase):
    def test_login_serializer_valid_data(self):
        """测试LoginSerializer使用有效数据"""
        valid_data = {
            'student_id': '20210001',
            'password': 'testpassword123'
        }
        
        serializer = LoginSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
        self.assertEqual(serializer.validated_data['student_id'], '20210001')
        self.assertEqual(serializer.validated_data['password'], 'testpassword123')
    
    def test_login_serializer_missing_student_id(self):
        """测试LoginSerializer缺少学号"""
        invalid_data = {
            'password': 'testpassword123'
        }
        
        serializer = LoginSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_login_serializer_missing_password(self):
        """测试LoginSerializer缺少密码"""
        invalid_data = {
            'student_id': '20210001'
        }
        
        serializer = LoginSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_login_serializer_empty_fields(self):
        """测试LoginSerializer字段为空"""
        invalid_data = {
            'student_id': '',
            'password': ''
        }
        
        serializer = LoginSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)

class SetPasswordSerializerTest(TestCase):
    def test_set_password_serializer_valid_data(self):
        """测试SetPasswordSerializer使用有效数据"""
        valid_data = {
            'student_id': '20210001',
            'code': '123456',
            'password': 'NewPassword123',
            'confirm_password': 'NewPassword123'
        }
        
        serializer = SetPasswordSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())
    
    def test_set_password_serializer_password_mismatch(self):
        """测试SetPasswordSerializer密码不匹配"""
        invalid_data = {
            'student_id': '20210001',
            'code': '123456',
            'password': 'NewPassword123',
            'confirm_password': 'DifferentPassword456'
        }
        
        serializer = SetPasswordSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('non_field_errors', serializer.errors)
    
    def test_set_password_serializer_invalid_password(self):
        """测试SetPasswordSerializer密码不满足验证规则"""
        # 这里假设Django的密码验证规则要求至少8个字符
        invalid_data = {
            'student_id': '20210001',
            'code': '123456',
            'password': '123',  # 太短的密码
            'confirm_password': '123'
        }
        
        serializer = SetPasswordSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
    
    def test_set_password_serializer_missing_fields(self):
        """测试SetPasswordSerializer缺少必要字段"""
        invalid_data = {
            'student_id': '20210001',
            'code': '123456'
            # 缺少password和confirm_password
        }
        
        serializer = SetPasswordSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)
        self.assertIn('confirm_password', serializer.errors)