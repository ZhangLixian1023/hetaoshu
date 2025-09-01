from rest_framework import serializers
from .models import Post, PostImage, Comment, PostLink
from users.serializers import UserSerializer

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
    
    class Meta:
        model = Post
        fields = ('id', 'title', 'content', 'post_type', 'author', 'created_at', 'updated_at', 'image_count', 'comment_count')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at', 'image_count', 'comment_count')
    
    def get_image_count(self, obj):
        return obj.images.count()
    
    def get_comment_count(self, obj):
        return obj.comments.filter(is_active=True).count()

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