from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet,PostImageViewSet,ThemeViewSet

# 创建路由器并注册视图集
router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'themes', ThemeViewSet, basename='theme')
router.register(r'images', PostImageViewSet, basename='image')

urlpatterns = [path('', include(router.urls)),
    path('posts/<uuid:pk>/comments/', PostViewSet.as_view({'get': 'get_comment'}), name='post-comments'),
    path('posts/<uuid:pk>/images/', PostViewSet.as_view({'get': 'get_images'}), name='post-images'),
    path('themes/<uuid:pk>/reply_tree/', ThemeViewSet.as_view({'get': 'get_reply_tree'}), name='theme-reply-tree'),
]
