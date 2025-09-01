from django.urls import path
from .views import (
    SendVerificationCodeView,
    VerifyCodeAndSetPasswordView,
    LoginView,
    LogoutView,
    UserDetailView
)

urlpatterns = [
    path('send-code/', SendVerificationCodeView.as_view(), name='send_verification_code'),
    path('set-password/', VerifyCodeAndSetPasswordView.as_view(), name='verify_code_and_set_password'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', UserDetailView.as_view(), name='user_profile'),
]