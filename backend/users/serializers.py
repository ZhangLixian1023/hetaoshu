from rest_framework import serializers
from .models import User, VerificationCode
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'student_id', 'email', 'name', 'is_active', 'is_staff')
        read_only_fields = ('id', 'is_active', 'is_staff')

class LoginSerializer(serializers.Serializer):
    student_id = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        student_id = data.get('student_id')
        password = data.get('password')
        
        if not student_id or not password:
            raise serializers.ValidationError('请提供学号和密码')
        
        return data

class VerificationCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationCode
        fields = ('id', 'code', 'created_at', 'expires_at', 'is_used')
        read_only_fields = ('id', 'code', 'created_at', 'expires_at', 'is_used')

class SetPasswordSerializer(serializers.Serializer):
    student_id = serializers.CharField(required=True)
    code = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError('两次输入的密码不一致')
        return data