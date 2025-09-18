# 核桃书

一个基于Django后端和React前端的网站项目，简单的社区平台。

投币支持：
![image](https://github.com/ZhangLixian1023/hetaoshu/blob/main/frontend/public/payqrcode.jpg)

## 项目结构

```text
├── .env                 # 环境变量配置文件
├── .vscode              # 调试环境vscode配置
├── .env.example         # 环境变量示例文件
├── backend/             # Django后端项目
│   ├── Dockerfile       # 后端Docker配置
│   ├── entrypoint.sh    # 后端启动脚本
│   ├── requirements.txt # Python依赖文件
│   ├── hetaoshu/        # Django主应用
│   ├── posts/           # 帖子应用
│   └── users/           # 用户应用
├── frontend/            # React前端项目
│   ├── Dockerfile       # 前端Docker配置（仅用于上线时）
│   ├── public/          # 静态资源目录
│   ├── src/             # React源代码
│   ├── .env.development # 前端开发环境配置
│   └─── .env.production  # 前端生产环境配置
├── nginx/               # Nginx配置
│   └── conf.d/          # Nginx配置文件
├── docker-compose.debug.yml   # Docker Compose配置（用于开发调试）
└── docker-compose.yml   # Docker Compose配置（用于上线）

```

## 环境要求

- 已安装VSCode和Python扩展
- 已安装Docker
- 为了docker下载加速，推荐换源  "registry-mirrors": [
    "https://docker.xuanyuan.run"
  ]

## 开发调试指南

### 先拉取仓库
``` bash
git pull https://github.com/ZhangLixian1023/hetaoshu.git
cd hetaoshu
```

### 1. 配置环境变量

把.env.example复制到.env，根据需要修改.env的内容。

特别是ip地址，根据需要来修改（localhost，或者局域网ip，或者公网ip）

- 注意：如果.env文件里面设定了django邮件客户端为 console，那么是将邮件内容输出到控制台，而不是发送到真实的邮箱。

### 2. 构建并启动项目
``` bash
docker compose -f docker-compose.debug.yml up --build -d
```

初次使用时，需要加入--build参数来构建，之后就不需要这个选项了

这个命令会：

- 构建所有服务（包括backend、db、frontend和nginx）
- 启动backend服务，并在端口5678上监听调试连接
- **等待VSCode调试器连接后再继续执行代码**

### 3. 在VSCode中开始调试

1. 在VSCode中打开项目文件夹
2. 在你想要调试的Python代码中设置断点
3. 点击VSCode左侧的调试图标（或按Ctrl+Shift+D）
4. 在顶部的配置下拉菜单中选择"Docker: Python - Django"或"Docker: Python - Django Debug Server"
5. **点击绿色的按钮开始调试（必须！否则后端会持续等待，不会启动！）**

#### 可用的调试配置

我们在`.vscode/launch.json`中配置了两个调试选项：

- **Docker: Python - Django**: 仅调试你自己的代码（justMyCode=true）
- **Docker: Python - Django Debug Server**: 调试所有代码，包括第三方库（justMyCode=false）

### 4. 打开浏览器看到前端页面，调试前端

1. 打开浏览器，访问[http://localhost](http://localhost) （或者项目所在的ip地址）

- Django管理后台: [http://localhost/admin](http://localhost/admin)  （或者项目所在的ip地址）

2. 你应该能看到项目的首页

3. 按F12 进入开发者模式，右侧源代码 tab 页可以设置断点，用来调试前端代码

4. 点击浏览器中的元素，在开发者模式中可以查看元素的属性和样式

5. 可以在开发者模式中查看控制台输出，用来调试前端代码


## 注意事项

完成后用以下命令停止并清理容器：

```bash
docker-compose -f docker-compose.debug.yml down
```

