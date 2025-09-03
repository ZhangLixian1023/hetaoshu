from rest_framework import serializers
from .models import Post, PostImage, Comment, PostLink
from users.serializers import UserSerializer
from django.core.files.uploadedfile import InMemoryUploadedFile

class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ('id', 'image', 'created_at', 'order')
        read_only_fields = ('id', 'created_at')

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ('id', 'post', 'author', 'content', 'parent', 'replies', 'created_at', 'updated_at')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at')
    
    def get_replies(self, obj):
        # 获取一级回复
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_active=True), many=True).data
        return []

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    image_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    first_image = serializers.SerializerMethodField()  # 新增：返回第一张图片
    
    class Meta:
        model = Post
        fields = ('id', 'title', 'content', 'post_type', 'author', 'created_at', 'updated_at', 'image_count', 'comment_count', 'first_image')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at', 'image_count', 'comment_count', 'first_image')
    
    def get_image_count(self, obj):
        return obj.images.count()
    
    def get_comment_count(self, obj):
        return obj.comments.filter(is_active=True).count()
    
    def get_first_image(self, obj):
        # 获取帖子的第一张图片
        first_image = obj.images.order_by('order').first()
        if first_image:
            # 使用PostImageSerializer序列化第一张图片
            return PostImageSerializer(first_image).data
        return None
        
    def create(self, validated_data):
        # 创建帖子
        post = Post.objects.create(**validated_data)
        # 处理图片上传
        request = self.context.get('request')
        if request and 'images[]' in request.FILES:
            # 如果是单个文件
            if isinstance(request.FILES.get('images[]'), InMemoryUploadedFile):
                for image in request.FILES.getlist('images[]'):
                    PostImage.objects.create(post=post, image=image)        
        return post

class PostDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    outgoing_links = serializers.SerializerMethodField()
    incoming_links = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = (
            'id', 'title', 'content', 'post_type', 'author', 'created_at', 'updated_at', 
            'images', 'comments', 'outgoing_links', 'incoming_links'
        )
        read_only_fields = ('id', 'author', 'created_at', 'updated_at', 'images', 'comments', 'outgoing_links', 'incoming_links')
    
    def get_outgoing_links(self, obj):
        return PostLinkSerializer(obj.outgoing_links.all(), many=True).data
    
    def get_incoming_links(self, obj):
        return PostLinkSerializer(obj.incoming_links.all(), many=True).data

class PostLinkSerializer(serializers.ModelSerializer):
    source_post = PostSerializer(read_only=True)
    target_post = PostSerializer(read_only=True)
    
    class Meta:
        model = PostLink
        fields = ('id', 'source_post', 'target_post', 'created_at')
        read_only_fields = ('id', 'source_post', 'target_post', 'created_at')