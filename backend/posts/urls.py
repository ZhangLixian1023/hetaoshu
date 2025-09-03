from django.urls import path
from .views import PostViewSet, ImageViewSet, CommentViewSet
# 直接定义所有需要的路由，不使用DefaultRouter
urlpatterns = [
    # 帖子相关路由
    path('', PostViewSet.as_view({'get': 'get_all_posts'}), name='get_all_posts'),  # GET /api/posts/
    path('create/', PostViewSet.as_view({'post': 'create'}), name='create_post'),  # POST /api/posts/create/
    # 注意：Post模型使用UUID作为主键，所以路由参数应该是<uuid:pk>而不是<int:pk>
    # 帖子更新、删除、详情路由
    # POST\DELETE\GET /api/posts/{id}/
    path('<uuid:pk>/', PostViewSet.as_view(
        {
            'post': 'update', 
            'delete': 'destroy',
            'get':'get_post_detail'
        }), name='one_post'),  
    # 定义一个图片删除路由 用于响应axios.delete(`/posts/images/${imageId}/`);
    path('images/<uuid:pk>/', ImageViewSet.as_view({'delete': 'destroy'}), name='delete_post_image'),  # DELETE /api/posts/images/{id}/delete/

    # 帖子评论相关路由
    path('<uuid:pk>/comments/', CommentViewSet.as_view({'get': 'get_post_comments'}), name='get_post_comments'),  # GET /api/posts/{id}/comments/
    # 评论创建路由
    path('<uuid:pk>/comments/create/', CommentViewSet.as_view({'post': 'create'}), name='create_comment'),  # POST /api/posts/{id}/comments/create/
    # 评论更新、删除路由
    # POST\DELETE\GET /api/posts/{id}/comments/{comment_id}/
    path('<uuid:post_pk>/comments/<uuid:pk>/', CommentViewSet.as_view(
        {
            'post': 'update', 
            'delete': 'destroy'
        }), name='one_comment'),  

    # 帖子链接相关路由
    path('<uuid:pk>/links/', PostViewSet.as_view({'get': 'get_post_links'}), name='get_post_links'),  # GET /api/posts/{id}/links/
    # 定义一个链接删除路由 用于响应axios.delete(`/posts/links/${linkId}/`);
    path('links/<uuid:pk>/delete/', PostViewSet.as_view({'delete': 'destroy_link'}), name='delete_post_link'),  # DELETE /api/posts/links/{id}/delete/
    path('<uuid:pk>/links/', PostViewSet.as_view({'get': 'get_post_links'}), name='get_post_links'),  # GET /api/posts/{id}/links/
    # 定义一个链接创建路由 用于响应axios.post(`/posts/links/${linkId}/`);
    path('<uuid:pk>/links/create/', PostViewSet.as_view({'post': 'create_link'}), name='create_post_link'),  # POST /api/posts/{id}/links/create/
]