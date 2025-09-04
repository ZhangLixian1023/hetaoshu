from .views import PostViewSet,PostImageViewSet, CommentViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, PostImageViewSet

# 创建路由器并注册视图集
router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'images', PostImageViewSet, basename='image')

urlpatterns = [path('', include(router.urls))]
