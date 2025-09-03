# Django项目Docker调试指南

本指南将帮助你在Docker容器中设置VSCode断点调试Django后端代码。

## 前提条件

- 已安装VSCode和Python扩展
- 已安装Docker Desktop
- 已安装docker-compose

## 1. 安装debugpy依赖

首先需要确保backend项目中安装了debugpy包。请在backend/requirements.txt中添加debugpy依赖：

```bash
# 在backend目录下执行
echo "debugpy>=1.6.0,<2.0" >> requirements.txt
```

## 2. 使用调试配置启动Docker环境

使用我们创建的专用调试配置文件启动Docker容器：

```bash
docker-compose -f docker-compose.debug.yml up --build
```

这个命令会：

- 构建所有服务（包括backend、db、frontend和nginx）
- 启动backend服务，并在端口5678上监听调试连接
- 等待VSCode调试器连接后再继续执行代码

## 3. 在VSCode中设置断点并开始调试

1. 在VSCode中打开项目文件夹
2. 在你想要调试的Python代码中设置断点（点击代码行号左侧的空白处）
3. 点击VSCode左侧的调试图标（或按Ctrl+Shift+D）
4. 在顶部的配置下拉菜单中选择"Docker: Python - Django"或"Docker: Python - Django Debug Server"
5. 点击绿色的播放按钮开始调试

## 可用的调试配置

我们在`.vscode/launch.json`中配置了两个调试选项：

- **Docker: Python - Django**: 仅调试你自己的代码（justMyCode=true）
- **Docker: Python - Django Debug Server**: 调试所有代码，包括第三方库（justMyCode=false）

## 调试技巧

1. 调试时可以使用VSCode的调试控制台查看变量值和执行Python命令
2. 可以使用步进、跳过、进入等控制按钮控制代码执行
3. 调试过程中修改代码后需要重新构建容器才能生效

## 注意事项

1. 确保docker-compose.debug.yml中的端口映射与launch.json中的配置一致
2. 调试模式下，容器会等待调试器连接后再执行代码
3. 调试完成后，可以使用以下命令停止并清理容器：

```bash
docker-compose -f docker-compose.debug.yml down
```

如需恢复正常运行模式，使用原始的docker-compose.yml文件：

```bash
docker-compose up --build
```
