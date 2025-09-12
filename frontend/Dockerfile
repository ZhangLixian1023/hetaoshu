# 开发环境Dockerfile
FROM node:22-alpine
WORKDIR /app

# 添加包管理工具
RUN npm install -g npm@latest

# 安装依赖
COPY package.json ./
RUN npm install

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动开发服务器
CMD ["npm", "start"]
