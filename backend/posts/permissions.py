from rest_framework import permissions

class IsAuthorOrReadOnly(permissions.BasePermission):
    """只允许作者修改自己的内容"""
    
    def has_object_permission(self, request, view, obj):
        # 读取权限允许任何请求
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 写入权限只允许作者
        return obj.author == request.user

class CanDeleteComment(permissions.BasePermission):
    """允许作者或帖子作者删除评论"""
    
    def has_object_permission(self, request, view, obj):
        # 读取权限允许任何请求
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # 写入权限允许评论作者或帖子作者
        return obj.author == request.user or obj.post.author == request.user