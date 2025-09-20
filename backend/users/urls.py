from django.urls import path
from .views import (
    SendVerificationCodeView,
    VerifyCodeAndSetPasswordView,
    LoginView,
    LogoutView,
    UserDetailView,
    UpdateProfileView,
    ChangePasswordView,
    get_public_key,
)
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework.permissions import AllowAny
from rest_framework.decorators import permission_classes
from users.models import User
from posts.serializers import ThemeSerializer
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_posts(request, user_id):
    """获取指定用户的所有帖子"""
    user = get_object_or_404(User, id=user_id)
    themes= user.themes.filter(is_active=True).order_by('-created_at')
    serializer = ThemeSerializer(themes, many=True)
    return Response(serializer.data)

urlpatterns = [
    path('send-code/', SendVerificationCodeView.as_view(), name='send_verification_code'),
    path('set-password/', VerifyCodeAndSetPasswordView.as_view(), name='verify_code_and_set_password'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserDetailView.as_view(), name='user_profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='update_profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    # 添加用户帖子路由，格式为 /api/users/{user_id}/posts/
    path('<int:user_id>/posts/', get_user_posts, name='user_posts'),
    path('public-key/', get_public_key, name='get_public_key'),
]