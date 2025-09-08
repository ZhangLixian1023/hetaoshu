from rest_framework import viewsets, permissions, status, filters,status,exceptions
from rest_framework.response import Response
from rest_framework import status, viewsets, permissions, filters
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from users.models import User
from .models import Post, PostImage, Theme
from .serializers import (
    PostSerializer, PostImageSerializer, ThemeSerializer,ThemeReplyTreeSerializer
)
from .permissions import IsAuthorOrReadOnly, CanDeleteComment

class ThemeViewSet(viewsets.ModelViewSet):
    queryset = Theme.objects.filter(is_active=True)
    serializer_class = ThemeSerializer
    permission_classes = [IsAuthenticated]
    def create(self, request):
        """创建新主题的API入口"""
        # 验证数据
        serializer = ThemeSerializer(data=request.data, context={'request': request})
        try:
            serializer.is_valid(raise_exception=True)
        except exceptions.ValidationError as e:
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        # save方法内会处理帖子和图片
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def get_reply_tree(self, request, pk):
        """获取主题的评论树"""
        theme = self.get_object()
        serializer = ThemeReplyTreeSerializer(theme)
        return Response(serializer.data)

class PostImageViewSet(viewsets.ModelViewSet):
    queryset = PostImage.objects.all()
    serializer_class = PostImageSerializer
    permission_classes = [IsAuthenticated]

# 自定义分页类
class PostPagination(PageNumberPagination):
    page_size = 8  # 每页显示20条
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.filter(is_active=True)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['author']
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'updated_at']
    pagination_class = PostPagination
    
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
    
    def list(self, request):
        """获取所有活跃帖子（重写父类的list方法）"""
        posts = Post.objects.filter(is_active=True,parent__isnull=True).order_by('-created_at')
        # 应用分页
        paginator = PostPagination()
        paginated_posts = paginator.paginate_queryset(posts, request)
        serializer = PostSerializer(paginated_posts, many=True)
        # 返回分页后的响应，包含results和next字段
        return paginator.get_paginated_response(serializer.data)
    
    def create(self, request):
        """创建新帖子的API入口"""
        # 使用序列化器验证和保存数据，将request对象传递给context
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # 验证父帖子是否存在
            if 'parent' in request.data and request.data['parent']:
                parent = get_object_or_404(Post, id=request.data['parent'])
            # 设置作者为当前登录用户
            serializer.save(author=request.user,theme=parent.theme,parent=parent)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def retrieve(self, request,*args, **kwargs):
        """获取单个帖子详情（重写retrieve方法，对应get_post_detail）"""
        instance = self.get_object()
        if not instance.is_active:
            return Response({'detail': '帖子不存在或已被删除'}, status=404)
        serializer = PostSerializer(instance)
        print(serializer.data)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        """更新帖子内容和批量更新图片：删除指定ID以外的图片，添加新图片"""
        post = self.get_object()
        serializer=PostSerializer(post,data=request.data,partial=True,context={'request':request})
        if serializer.is_valid():
            serializer.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        # 保留的图片ID列表
        keep_image_ids = request.data.getlist('keep_image_ids[]')
        print(keep_image_ids)
        # 删除不需要保留的图片
        PostImage.objects.filter(post=post).exclude(id__in=keep_image_ids).delete()
        # 添加新图片
        for image in request.FILES.getlist('images[]'):
            PostImage.objects.create(post=post, image=image)
        serializer.save()
        # 返回更新后的完整帖子数据
        updated_post = self.get_object()  # 重新获取以确保获取最新状态
        return Response(serializer.data)
    
    def get_comment(self,request,pk):
        """获取帖子的评论"""
        post=self.get_object()
        #post = get_object_or_404(Post, id=post_id)
        comments = post.replies.filter(is_active=True).order_by('-created_at')
        serializer = PostSerializer(comments, many=True)
        return Response(serializer.data)

    def get_images(self,request,pk):
        """获取帖子的图片"""
        post = self.get_object()
        images = post.images.all()
        serializer = PostImageSerializer(images, many=True)
        return Response(serializer.data)

