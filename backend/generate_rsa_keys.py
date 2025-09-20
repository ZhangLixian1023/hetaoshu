import rsa
import os

# 生成2048位的RSA密钥对
public_key, private_key = rsa.newkeys(2048)

# 确保密钥存储目录存在
key_dir = os.path.join(BASE_DIR, 'backend', 'keys')
if not os.path.exists(key_dir):
    os.makedirs(key_dir)

# 保存公钥
with open(os.path.join(key_dir, 'public.pem'), 'wb') as f:
    f.write(public_key.save_pkcs1())

# 保存私钥
with open(os.path.join(key_dir, 'private.pem'), 'wb') as f:
    f.write(private_key.save_pkcs1())

print("RSA keys generated.")
