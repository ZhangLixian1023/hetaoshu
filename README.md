# 核桃书应用

## 项目介绍

这是一个基于Django后端和React前端的全栈项目，用于构建一个简单的社区平台。

项目名称：核桃书

该网站是供核桃学院的数百名博士生使用的。

## 项目结构

```text
├── .env                 # 环境变量配置文件
├── .env.example         # 环境变量示例文件
├── backend/             # Django后端项目
│   ├── Dockerfile       # 后端Docker配置
│   ├── entrypoint.sh    # 后端启动脚本
│   ├── requirements.txt # Python依赖文件
│   ├── hetaoshu/        # Django主应用
│   ├── posts/           # 帖子应用
│   └── users/           # 用户应用
├── frontend/            # React前端项目
│   ├── Dockerfile       # 前端Docker配置
│   ├── public/          # 静态资源目录
│   ├── src/             # React源代码
│   ├── .env.development # 前端开发环境配置
│   ├── .env.production  # 前端生产环境配置
│   └── .env.test        # 前端测试环境配置
├── nginx/               # Nginx配置
│   └── conf.d/          # Nginx配置文件
└── docker-compose.yml   # Docker Compose配置
```

## 环境要求

- Docker
- Docker Compose

## 快速开始

### 1. 配置环境变量

复制`.env.example`文件并重命名为`.env`，然后根据您的需求修改其中的配置：

```bash
cp .env.example .env
# 使用文本编辑器修改.env文件
```

### 2. 构建和启动容器

在项目根目录执行以下命令：

```bash
docker-compose up --build -d
```

这个命令会：

- 构建所有服务的Docker镜像
- 创建并启动容器
- 初始化数据库并执行迁移
- 创建超级用户（如果在.env中配置了）
- 收集静态文件

### 3. 访问应用

应用启动后，可以通过以下地址访问：

- 主应用: [http://localhost](http://localhost)
- Django管理后台: [http://localhost/admin](http://localhost/admin)

### 4. 停止容器

```bash
docker-compose down
```

## 开发、测试和生产环境配置

以下详细说明在不同环境下需要修改的关键设置。

### 开发环境配置

#### 后端配置 (.env文件)

```env
# Django设置
SECRET_KEY=your_random_secret_key_here
DEBUG=True  # 开发环境设置为True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:3000

# 数据库设置
DB_NAME=hetaoshu
DB_USER=root
DB_PASSWORD=your_secure_db_password
DB_HOST=db
DB_PORT=3306

# Django超级用户设置
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_EMAIL=admin@example.com
DJANGO_SUPERUSER_PASSWORD=your_secure_admin_password

# 邮件设置（开发环境可使用模拟邮件服务器）
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend  # 开发环境可使用控制台输出
# EMAIL_HOST=smtp.your-email-provider.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=your_email@example.com
# EMAIL_HOST_PASSWORD=your_email_password
# DEFAULT_FROM_EMAIL=your_email@example.com
```

#### 前端配置 (frontend/.env.development)

```env
# 开发环境配置
REACT_APP_API_URL=http://localhost/api
REACT_APP_ENV=development
REACT_APP_DEBUG=true
```

#### 开发环境特有操作

1. 运行开发服务器时，可以使用热重载功能：

   ```bash
   # 后端开发
   docker-compose exec backend python manage.py runserver 0.0.0.0:8000
   
   # 前端开发
   cd frontend
   npm start
   ```

2. 数据库迁移：

   ```bash
   docker-compose exec backend python manage.py makemigrations
   docker-compose exec backend python manage.py migrate
   ```

### 测试环境配置

#### 后端配置 (.env.test文件)

创建专用的测试环境配置文件：

```bash
cp .env .env.test
```

然后修改以下设置：

```env
# Django设置
SECRET_KEY=test_random_secret_key_here
DEBUG=True  # 测试环境可保持True以便调试
ALLOWED_HOSTS=localhost,127.0.0.1,test-server
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:3000,http://test-frontend

# 测试数据库设置（可选，可使用独立数据库）
# DB_NAME=hetaoshu_test
# DB_USER=test_user
# DB_PASSWORD=test_password
```

#### 前端配置 (frontend/.env.test)

```env
# 测试环境配置
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_ENV=test
REACT_APP_DEBUG=true
```

#### 测试环境特有操作

1. 运行后端测试：

   ```bash
   docker-compose exec backend pytest
   ```

2. 运行前端测试：

   ```bash
   cd frontend
   npm test
   ```

### 生产环境配置

#### 生产环境后端配置 (.env文件)

```env
# Django设置
SECRET_KEY=a_very_secure_randomly_generated_key  # 务必使用随机生成的安全密钥
DEBUG=False  # 生产环境必须设置为False
ALLOWED_HOSTS=your_domain.com,www.your_domain.com  # 添加您的域名
CORS_ALLOWED_ORIGINS=https://your_domain.com,https://www.your_domain.com  # 生产环境前端域名

# 数据库设置（使用安全的凭证）
DB_NAME=production_db_name
DB_USER=secure_db_user
DB_PASSWORD=very_secure_db_password
DB_HOST=db
DB_PORT=3306

# 邮件设置（配置真实的邮件服务器）
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.your-email-provider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@example.com
EMAIL_HOST_PASSWORD=your_email_password
DEFAULT_FROM_EMAIL=your_email@example.com
```

#### 前端配置 (frontend/.env.production)

```env
# 生产环境配置
REACT_APP_API_URL=https://api.yourdomain.com/api  # 生产环境API地址
REACT_APP_ENV=production
REACT_APP_DEBUG=false
```

#### 生产环境特有操作和注意事项

1. 构建优化的前端静态文件：

   ```bash
   cd frontend
   npm run build
   ```

2. 收集Django静态文件：

   ```bash
   docker-compose exec backend python manage.py collectstatic --noinput
   ```

3. 安全注意事项：
   - 永远不要将包含真实凭证的`.env`文件提交到代码仓库
   - 定期更新SECRET_KEY
   - 确保使用HTTPS
   - 考虑使用安全的数据库连接
   - 配置适当的文件权限

4. 性能优化：
   - 配置缓存
   - 优化数据库查询
   - 考虑使用CDN分发静态文件

## 使用说明

### 用户认证

1. 注册新用户：访问首页并点击注册按钮
2. 登录：使用注册的用户名和密码登录
3. 管理员登录：使用创建的超级用户账号访问admin页面

### 帖子管理

1. 创建帖子：登录后点击"创建帖子"按钮
2. 浏览帖子：在首页查看所有帖子
3. 查看帖子详情：点击帖子标题查看详情
4. 编辑/删除帖子：在帖子详情页进行操作（仅限作者和管理员）

### 管理员功能

1. 用户管理：在admin页面管理用户账号
2. 帖子审核：管理和审核用户发布的帖子
3. 系统设置：通过修改配置文件调整系统行为

## 数据库操作

如果需要执行数据库操作，可以使用以下命令：

```bash
# 进入后端容器
docker-compose exec backend bash

# 在容器内执行Django命令
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## 日志查看

```bash
# 查看所有服务的日志
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs -f backend
```

## 故障排除

如果遇到问题，可以尝试以下方法：

```text
1. 检查容器状态：`docker-compose ps`
2. 查看服务日志：`docker-compose logs service_name`
3. 确保.env文件中的配置正确
4. 确保端口没有被其他应用占用
5. 检查数据库连接是否正常：`docker-compose exec db mysql -u${DB_USER} -p${DB_PASSWORD}`
6. 验证环境变量是否正确加载：`docker-compose exec backend printenv`
```
