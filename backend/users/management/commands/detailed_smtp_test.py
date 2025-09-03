from django.core.management.base import BaseCommand
import smtplib
import os
import base64
from django.conf import settings

class Command(BaseCommand):
    help = '执行详细的SMTP连接测试，检查邮件配置和连接问题'

    def handle(self, *args, **options):
        # 打印当前邮件配置，查看实际值
        self.stdout.write(self.style.WARNING('===== 当前邮件配置 ====='))
        self.stdout.write(f'EMAIL_BACKEND: {settings.EMAIL_BACKEND}')
        self.stdout.write(f'EMAIL_HOST: {settings.EMAIL_HOST}')
        self.stdout.write(f'EMAIL_PORT: {settings.EMAIL_PORT}')
        self.stdout.write(f'EMAIL_USE_SSL: {settings.EMAIL_USE_SSL}')
        self.stdout.write(f'EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}')
        self.stdout.write(f'EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}')
        # 不要打印密码，出于安全考虑
        self.stdout.write(f'EMAIL_HOST_PASSWORD: {"已设置" if settings.EMAIL_HOST_PASSWORD else "未设置"}')
        self.stdout.write(f'DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}')
        self.stdout.write(self.style.WARNING('======================'))

        # 检查必要的配置是否存在
        if not settings.EMAIL_HOST:
            self.stdout.write(self.style.ERROR('错误: EMAIL_HOST 未设置，请在环境变量中配置'))
            return
        
        if not settings.EMAIL_HOST_USER:
            self.stdout.write(self.style.ERROR('错误: EMAIL_HOST_USER 未设置，请在环境变量中配置'))
            return
        
        if not settings.EMAIL_HOST_PASSWORD:
            self.stdout.write(self.style.ERROR('错误: EMAIL_HOST_PASSWORD 未设置，请在环境变量中配置'))
            return

        try:
            # 根据EMAIL_USE_SSL设置选择合适的SMTP类
            if settings.EMAIL_USE_SSL:
                self.stdout.write('尝试使用SSL连接...')
                server = smtplib.SMTP_SSL(settings.EMAIL_HOST, settings.EMAIL_PORT)
            else:
                self.stdout.write('尝试使用普通SMTP连接...')
                server = smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT)
                
                # 如果需要TLS，启用它
                if settings.EMAIL_USE_TLS:
                    self.stdout.write('启用TLS...')
                    server.starttls()

            # 显示服务器响应
            self.stdout.write(f'连接成功，服务器响应: {server.ehlo()}')
            
            # 尝试登录
            self.stdout.write('尝试登录到SMTP服务器...')
            server.login(settings.EMAIL_HOST_USER, settings.EMAIL_HOST_PASSWORD)
            self.stdout.write(self.style.SUCCESS('登录成功！'))
            
            # 发送测试邮件
            self.stdout.write('尝试发送测试邮件...')
            from_email = settings.DEFAULT_FROM_EMAIL or settings.EMAIL_HOST_USER
            to_email = from_email  # 发送给自己
            subject = 'SMTP测试邮件'
            body = '这是一封测试邮件，用于验证SMTP配置是否正确。'
            
            # 构建邮件内容，使用正确的编码
            message = f'From: {from_email}\nTo: {to_email}\nSubject: =?UTF-8?B?{base64.b64encode(subject.encode()).decode()}?=\nMIME-Version: 1.0\nContent-Type: text/plain; charset=utf-8\n\n{body}'
            
            # 发送邮件，编码为UTF-8
            server.sendmail(from_email, [to_email], message.encode('utf-8'))
            self.stdout.write(self.style.SUCCESS('测试邮件发送成功！'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'SMTP测试失败: {str(e)}'))
            self.stdout.write(self.style.ERROR(f'错误类型: {type(e).__name__}'))
            import traceback
            self.stdout.write(self.style.ERROR('详细错误堆栈:'))
            self.stdout.write(traceback.format_exc())
        finally:
            # 关闭连接
            try:
                if 'server' in locals():
                    server.quit()
                    self.stdout.write('SMTP连接已关闭')
            except:
                pass