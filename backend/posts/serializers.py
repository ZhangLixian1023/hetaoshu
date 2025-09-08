from rest_framework import serializers
from .models import Post, PostImage, Theme
from users.serializers import UserSerializer
from django.core.files.uploadedfile import InMemoryUploadedFile
from rest_framework.response import Response
from collections import defaultdict

class PostReplySerializer(serializers.ModelSerializer):
    """帖子回复序列化器，用于嵌套展示回复"""
    author = UserSerializer(read_only=True)
    images = serializers.SerializerMethodField()
    def get_images(self, obj):
        return PostImageSerializer(obj.images,many=True).data
    class Meta:
        model = Post
        fields = ['id', 'content', 'author', 'updated_at','images']
        read_only_fields = fields

class ThemeReplyTreeSerializer(serializers.ModelSerializer):
    """简化的主题回复树序列化器"""
    author = UserSerializer(read_only=True)
    reply_tree = serializers.SerializerMethodField()
    class Meta:
        model = Theme
        fields = ['id','title','author', 'reply_tree']
        read_only_fields = fields
    def get_reply_tree(self, obj):
        """获取主题下的所有帖子，在内存中构建回复树"""
        # 一次性获取该主题下的所有有效帖子
        all_posts = list(obj.posts.filter(is_active=True))
        # 创建帖子ID到帖子对象的映射
        post_id_map = {post.id: post for post in all_posts}
        # 创建父帖子ID到子帖子列表的映射
        parent_child_map = defaultdict(list)
        for post in all_posts:
            if post.parent_id and post.parent_id in post_id_map:
                parent_child_map[post.parent_id].append(post)
        # 递归构建回复树结构
        def build_reply_tree(post):
            post_data = PostReplySerializer(post).data
            post_data['replies'] = [build_reply_tree(child) for child in parent_child_map.get(post.id, [])]
            return post_data
        # 从根帖子开始构建回复树
        result=build_reply_tree(obj.first_post)
        return result
    
class ThemeSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    post_count = serializers.SerializerMethodField()
    class Meta:
        model = Theme
        fields = ('id', 'title', 'theme_type', 'description','valid_until','author', 'created_at', 'updated_at', 'post_count','first_post')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at', 'post_count')
    
    def get_post_count(self, obj):
        return obj.posts.count()
    def create(self, validated_data):
        request = self.context.get('request')
        # 创建主题
        theme = Theme.objects.create(author=request.user, **validated_data)
        data={
            'title':request.data.get('title'),
            'content':request.data.get('content')
        }
        # 构建帖子
        serializer = PostSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            # 设置作者为当前登录用户, 主题帖为刚刚创建的主题帖
            post=serializer.save(author=request.user, theme=theme)
        theme.first_post = post
        theme.save()
        return theme

class PostImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostImage
        fields = ('id', 'image', 'created_at', 'order')
        read_only_fields = ('id', 'created_at')

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    theme = ThemeSerializer(read_only=True)
    image_count = serializers.SerializerMethodField()
    comment_count = serializers.SerializerMethodField()
    first_image = serializers.SerializerMethodField()  # 新增：返回第一张图片
    
    class Meta:
        model = Post
        fields = ('id', 'title', 'content', 'author', 'created_at', 'updated_at', 'image_count', 'comment_count', 'first_image', 'theme','parent')
        read_only_fields = ('id', 'author', 'created_at', 'updated_at', 'image_count', 'comment_count', 'first_image') 
    
    def get_image_count(self, obj):
        return obj.images.count()
    
    def get_comment_count(self, obj):
        return obj.replies.filter(is_active=True).count()
    
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
                for (order,image) in enumerate(request.FILES.getlist('images[]')):
                    PostImage.objects.create(post=post, image=image,order=order)        
        return post