from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.conf import settings

class Command(BaseCommand):
    help = 'Test email sending functionality'
    
    def handle(self, *args, **options):
        self.stdout.write('Testing email sending...')
        
        # 使用硬编码的测试邮箱和内容
        subject = '测试邮件'
        message = '这是一封测试邮件'
        from_email = settings.DEFAULT_FROM_EMAIL
        # 使用一个假的邮箱地址进行测试
        recipient_list = ['test@example.com']
        
        try:
            # 发送邮件
            send_mail(subject, message, from_email, recipient_list)
            self.stdout.write(self.style.SUCCESS('邮件发送成功!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'邮件发送失败: {str(e)}'))
            # 打印完整的异常信息，包括堆栈跟踪
            import traceback
            self.stdout.write(traceback.format_exc())