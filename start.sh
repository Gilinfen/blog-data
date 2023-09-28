#!/bin/bash

# 检查环境变量是否存在
if [ -z "$PRIVATE_KEY" ] || [ -z "$SERVER" ]; then
  echo "Error: PRIVATE_KEY and SERVER environment variables are required!"
  exit 1
fi

# 创建私钥文件
printf "%s" "$PRIVATE_KEY" > private_key.pem
ssh-keygen -p -m PEM -f private_key.pem
chmod 600 private_key.pem

# 运行 SSH 命令
ssh -i private_key.pem -o StrictHostKeyChecking=no root@$SERVER 'cd /home/Glinfen-Server-Config/; git pull; pnpm dev glinfen-blog-data reStop'

# 删除私钥文件
rm -f private_key.pem
