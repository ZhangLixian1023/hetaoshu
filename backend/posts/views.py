from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Post, PostImage, Comment, PostLink
from .serializers import (
    PostSerializer, PostDetailSerializer, PostImageSerializer,
    CommentSerializer, PostLinkSerializer
)
from .permissions import IsAuthorOrReadOnly, CanDeleteComment

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['post_type', 'author']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostSerializer
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            # 个人分享帖可以修改和删除，话题讨论帖只能删除不能修改
            return [permissions.IsAuthenticated(), IsAuthorOrReadOnly()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
    
    @action(detail=True, methods=['post'])
    def add_link(self, request, pk=None):
        """为帖子添加链接到其他帖子"""
        post = self.get_object()
        target_post_id = request.data.get('target_post_id')
        
        if not target_post_id:
            return Response({'error': '请提供目标帖子ID'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            target_post = Post.objects.get(pk=target_post_id, is_active=True)
        except Post.DoesNotExist:
            return Response({'error': '目标帖子不存在'}, status=status.HTTP_404_NOT_FOUND)
        
        # 检查是否已存在链接
        if PostLink.objects.filter(source_post=post, target_post=target_post).exists():
            return Response({'error': '链接已存在'}, status=status.HTTP_400_BAD_REQUEST)
        
        post_link = PostLink.objects.create(source_post=post, target_post=target_post)
        return Response(
            PostLinkSerializer(post_link).data,
            status=status.HTTP_201_CREATED
        )

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['post', 'parent', 'author']
    ordering_fields = ['created_at', 'updated_at']
    
    def get_queryset(self):
        return Comment.objects.filter(is_active=True)
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), CanDeleteComment()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
