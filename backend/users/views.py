from django.contrib.auth import authenticate, login
from django.utils import timezone
from datetime import timedelta
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from .models import User, VerificationCode
from .serializers import UserSerializer, LoginSerializer, VerificationCodeSerializer
from django.core.mail import send_mail
from django.conf import settings

class SendVerificationCodeView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        student_id = request.data.get('student_id')
        if not student_id:
            return Response({'error': '请提供学号'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 构建邮箱地址
        email = f"{student_id}@slai.edu.cn"
        
        # 查找或创建用户
        try:
            user = User.objects.get(student_id=student_id, email=email)
        except User.DoesNotExist:
            # 创建新用户，初始密码为None（未设置）
            # 设置默认name为学号的后4位
            default_name = student_id[-4:] if len(student_id) >= 4 else student_id
            user = User.objects.create_user(
                student_id=student_id,
                email=email,
                password=None,
                name=default_name
            )
        
        # 生成验证码，明确设置expires_at的值
        verification_code = VerificationCode.objects.create(user=user, expires_at=timezone.now() + timedelta(minutes=10))
        
        # 发送邮件
        subject = '核桃书论坛验证码'
        message = f'你的验证码是: {verification_code.code}，10分钟内有效。'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        
        try:
            send_mail(subject, message, from_email, recipient_list)
            return Response({
                'message': '验证码已发送到你的邮箱',
                'student_id': student_id
            }, status=status.HTTP_200_OK)
        except Exception as e:
            verification_code.delete()  # 发送失败，删除验证码
            return Response({'error': f'发送邮件失败: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyCodeAndSetPasswordView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        student_id = request.data.get('student_id')
        code = request.data.get('code')
        password = request.data.get('password')
        
        if not all([student_id, code, password]):
            return Response({'error': '请提供学号、验证码和密码'}, status=status.HTTP_400_BAD_REQUEST)
        
        email = f"{student_id}@slai.edu.cn"
        
        try:
            user = User.objects.get(student_id=student_id, email=email)
        except User.DoesNotExist:
            return Response({'error': '用户不存在'}, status=status.HTTP_404_NOT_FOUND)
        
        # 验证验证码
        try:
            verification_code = VerificationCode.objects.get(
                user=user,
                code=code,
                is_used=False,
                expires_at__gt=timezone.now()
            )
        except VerificationCode.DoesNotExist:
            return Response({'error': '验证码无效或已过期'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 设置密码
        user.set_password(password)
        user.save()
        
        # 标记验证码为已使用
        verification_code.is_used = True
        verification_code.save()
        
        # 生成token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': '密码设置成功',
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            student_id = serializer.validated_data['student_id']
            password = serializer.validated_data['password']
            
            user = authenticate(request, username=student_id, password=password)
            
            if user:
                token, created = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': UserSerializer(user).data
                }, status=status.HTTP_200_OK)
            else:
                return Response({'error': '学号或密码错误'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # 删除token实现登出
        request.user.auth_token.delete()
        return Response({'message': '成功登出'}, status=status.HTTP_200_OK)

class UserDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user


class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        name = request.data.get('name')
        
        if name is not None:
            user.name = name
            user.save()
            
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        user = request.user
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        # 验证参数是否完整
        if not current_password or not new_password:
            return Response({'error': '请提供当前密码和新密码'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 验证当前密码是否正确
        if not user.check_password(current_password):
            return Response({'error': '当前密码错误'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 更新密码
        user.set_password(new_password)
        user.save()
        
        # 重新生成token（可选，增强安全性）
        Token.objects.filter(user=user).delete()
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'message': '密码修改成功',
            'token': token.key
        }, status=status.HTTP_200_OK)
