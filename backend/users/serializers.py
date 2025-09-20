from rest_framework import serializers
from django.conf import settings
from .models import User, VerificationCode
import rsa
import base64



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'student_id', 'email', 'name', 'is_active', 'is_staff','date_joined')
        read_only_fields = ('id', 'is_active', 'is_staff','date_joined')

class LoginSerializer(serializers.Serializer):
    student_id = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        student_id = data.get('student_id')
        encrypted_password = data.get('password')

        if not student_id or not encrypted_password:
            raise serializers.ValidationError('请提供学号和密码')
        try:
            # 加载RSA私钥
            with open(settings.RSA_PRIVATE_KEY_PATH, 'rb') as f:
                private_key = rsa.PrivateKey.load_pkcs1(f.read())
            # 解码base64并解密
            encrypted_bytes = base64.b64decode(encrypted_password)
            decrypted_password = rsa.decrypt(encrypted_bytes, private_key).decode('utf-8')
            data['password'] = decrypted_password
        except Exception as e:
            raise serializers.ValidationError('密码解密失败')
        return data

class VerificationCodeSerializer(serializers.Serializer):
    student_id = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        student_id = data.get('student_id')
        encrypted_code = data.get('code')
        encrypted_password = data.get('password')
        
        if not all([student_id, encrypted_code, encrypted_password]):
            raise serializers.ValidationError('请提供学号、验证码和密码')
        
        try:
            with open(settings.RSA_PRIVATE_KEY_PATH, 'rb') as f:
                private_key = rsa.PrivateKey.load_pkcs1(f.read())
            
            # 解密验证码
            code_bytes = base64.b64decode(encrypted_code)
            decrypted_code = rsa.decrypt(code_bytes, private_key).decode('utf-8')
            
            # 解密密码
            password_bytes = base64.b64decode(encrypted_password)
            decrypted_password = rsa.decrypt(password_bytes, private_key).decode('utf-8')
            
            data['code'] = decrypted_code
            data['password'] = decrypted_password
            data['student_id'] = student_id
            
        except Exception as e:
            raise serializers.ValidationError(f'验证码或密码解密失败: {str(e)}')
        
        return data


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True,write_only=True)

    def validate(self, data):
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        if not current_password or not new_password:
            raise serializers.ValidationError('请提供当前密码和新密码')
        try:
            with open(settings.RSA_PRIVATE_KEY_PATH, 'rb') as f:
                private_key = rsa.PrivateKey.load_pkcs1(f.read())
            encrypted_bytes = base64.b64decode(current_password)
            decrypted_password = rsa.decrypt(encrypted_bytes, private_key).decode('utf-8')
            encrypted_bytes_new = base64.b64decode(new_password)
            decrypted_password_new = rsa.decrypt(encrypted_bytes_new, private_key).decode('utf-8')
            data['current_password'] = decrypted_password
            data['new_password'] = decrypted_password_new
        except Exception as e:
            raise serializers.ValidationError('密码解密失败')
        return data