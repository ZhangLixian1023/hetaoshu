from rest_framework import viewsets, permissions, status, filters,status
from rest_framework.decorators import action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from users.models import User
from .models import Post, PostImage, Comment, PostLink
from .serializers import (
    PostSerializer, PostDetailSerializer, PostImageSerializer,
    CommentSerializer, PostLinkSerializer
)
from .permissions import IsAuthorOrReadOnly, CanDeleteComment
class ImageViewSet(viewsets.ModelViewSet):
    queryset = PostImage.objects.all()
    serializer_class = PostImageSerializer

    # 自定义分页类
class PostPagination(PageNumberPagination):
    page_size = 8  # 每页显示8条
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['post_type', 'author']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at']
    
    @permission_classes([AllowAny])
    def get_all_posts(self,request):
        """获取所有活跃帖子"""
        posts = Post.objects.filter(is_active=True).order_by('-created_at')
        
        # 应用分页
        paginator = PostPagination()
        paginated_posts = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(paginated_posts, many=True)
        
        # 返回分页后的响应，包含results和next字段
        return paginator.get_paginated_response(serializer.data)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PostDetailSerializer
        return PostSerializer
    
    def get_permissions(self):
        # 为create操作明确设置权限
        if self.action == 'create':
            # 创建帖子需要登录
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            # 个人分享帖可以修改和删除，话题讨论帖只能删除不能修改
            return [permissions.IsAuthenticated(), IsAuthorOrReadOnly()]
        # 其他操作允许未登录用户读取
        return [permissions.AllowAny()]
    
    def create(self, request, *args, **kwargs):
        """创建新帖子的API入口"""
        # 验证用户是否已登录
        if not request.user.is_authenticated:
            return Response({'detail': '请先登录'}, status=status.HTTP_401_UNAUTHORIZED)
            
        # 使用序列化器验证和保存数据，将request对象传递给context
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # 设置作者为当前登录用户
            serializer.save(author=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def user_posts(self, request,user_id=None):
        """获取指定用户的所有帖子"""
        user = get_object_or_404(User, id=user_id)
        posts = Post.objects.filter(author=user, is_active=True).order_by('-created_at')
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)

    @permission_classes([AllowAny])
    def get_post_detail(self, request,pk):
        """获取单个帖子详情"""
        post = Post.objects.filter(pk=pk, is_active=True).first()
        if not post:
            return Response({'detail': '帖子不存在或已被删除'}, status=404)
        serializer = PostDetailSerializer(post)
        return Response(serializer.data)
    
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
    queryset = Comment.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['post', 'parent', 'author']
    ordering_fields = ['created_at', 'updated_at']
    
    @permission_classes([AllowAny])
    def get_post_comments(self,request,pk):
        """获取帖子的所有评论"""
        post = Post.objects.filter(pk=pk, is_active=True).first()
        if not post:
            return Response({'detail': '帖子不存在或已被删除'}, status=404)
        comments = Comment.objects.filter(post=post, is_active=True).order_by('created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    def get_queryset(self):
        return Comment.objects.filter(is_active=True)
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), CanDeleteComment()]
        return [permissions.IsAuthenticatedOrReadOnly()]
    def create(self, request, *args, **kwargs):
        """创建新评论的API入口"""
        # 验证用户是否已登录
        if not request.user.is_authenticated:
            return Response({'detail': '请先登录'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # 验证帖子是否存在
        post_id = self.kwargs.get('pk')
        post = get_object_or_404(Post, pk=post_id, is_active=True)
        
        # 验证评论内容
        content = request.data.get('content')
        if not content or not content.strip():
            return Response({'detail': '评论内容不能为空'}, status=status.HTTP_400_BAD_REQUEST)
        
        # 创建评论
        comment = Comment.objects.create(
            post=post,
            author=request.user,
            content=content
        )
        
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

