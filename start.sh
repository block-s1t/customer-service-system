#!/bin/bash

# 安装pnpm
npm install -g pnpm

# 安装依赖
pnpm install

# 给node_modules www 755权限
chmod 755 node_modules
chown www node_modules

# 生成prisma client
npx prisma generate

# 生成数据库并且push数据
npx prisma db push

# 给prisma/customer-service-system.db 755 www 用户权限
chmod 755 prisma/customer-service-system.db
chown www prisma/customer-service-system.db

# 检查是否存在.env文件
if [ -f .env ]; then
    # 检查BOT_TOKEN是否设置
    if grep -q "^BOT_TOKEN=" .env; then
        bot_token_value=$(grep "^BOT_TOKEN=" .env | cut -d '=' -f 2)
        if [ -z "$bot_token_value" ]; then
            echo "BOT_TOKEN 已设置，但未设置值"
            exit
        else
            echo "BOT_TOKEN 已设置，值为: $bot_token_value"
        fi
    else
        echo "BOT_TOKEN 未设置"
        exit
    fi

    # 检查ADMIN_ID是否设置
    if grep -q "^ADMIN_ID=" .env; then
        admin_id_value=$(grep "^ADMIN_ID=" .env | cut -d '=' -f 2)
        if [ -z "$admin_id_value" ]; then
            echo "ADMIN_ID 已设置，但未设置值"
            exit
        else
            echo "ADMIN_ID 已设置，值为: $admin_id_value"
        fi
    else
        echo "ADMIN_ID 未设置"
        exit
    fi
else
    echo ".env 文件不存在"
    exit
fi

# 初始化数据库
pnpm run start:db:init



# 给logs和dist文件夹755 www 用户权限

if [ -d "logs" ]; then
    chmod 755 logs
    chown www logs
else
    mkdir logs
    chmod 755 logs
    chown www logs
fi

if [ -d "dist" ]; then
    rm -rf dist
fi

# build
pnpm run build

chmod 755 dist
chown www dist


pnpm run pm2

pm2 save --force

# 输出执行结果
echo "[@customer-service-system]已经完成所有初始化操作，项目已经启动。 pm2 list 可查看启动列表，pm2 log @customer-service-system 可查看日志"