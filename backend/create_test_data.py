from users.models import User
from posts.models import Post, PostImage
import datetime

# 获取管理员用户
user = User.objects.get(student_id='admin')

# 创建测试帖子
post = Post.objects.create(
    title='测试帖子',
    content='这是一个测试帖子内容',
    author=user,
    post_type='share',
    created_at=datetime.datetime.now()
)

print('测试数据创建成功')