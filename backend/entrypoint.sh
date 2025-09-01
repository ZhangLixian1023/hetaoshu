#!/bin/sh

# 等待数据库服务就绪
until python -c "import mysql.connector; mysql.connector.connect(host='$DB_HOST', user='$DB_USER', password='$DB_PASSWORD')"; do
  echo "等待数据库服务就绪..."
  sleep 2
done

# 执行数据库迁移
python manage.py migrate --noinput

# 收集静态文件
python manage.py collectstatic --noinput

# 创建超级用户（如果需要）
if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
  python manage.py createsuperuser --noinput || true
fi

# 启动主应用程序
exec "$@"