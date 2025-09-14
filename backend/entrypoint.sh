#!/bin/sh

# 等待数据库服务就绪
until python -c "import mysql.connector; mysql.connector.connect(host='$DB_HOST', user='$DB_USER', password='$DB_PASSWORD')"; do
  echo "等待数据库服务就绪..."
  sleep 2
done


# 创建 django superuser
python manage.py createsuperuser --noinput --student_id $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL
# 执行数据库迁移
python manage.py migrate

# 收集静态文件
python manage.py collectstatic --noinput


# 启动主应用程序
exec "$@"