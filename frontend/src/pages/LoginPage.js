import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { usePublicKey, encryptWithPublicKey } from '../components/utils/encryptionUtils';

const LoginPage = ({ onLogin }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const { publicKey } = usePublicKey();
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!studentId.trim()) {
      toast.error('请输入学号');
      return;
    }
    
    if (!password) {
      toast.error('请输入密码');
      return;
    }

    try {
      // 1. 获取公钥
      if (!publicKey) {
        toast.error('获取公钥失败，请稍后重试');
        return;
      }
      
      // 2. 使用 JSEncrypt 进行 RSA 加密
      const encryptedPassword = encryptWithPublicKey(password, publicKey);
      
      if (!encryptedPassword) {
        toast.error('密码加密失败，请稍后重试');
        return;
      }
      
      // 3. 发送加密后的密码到登录接口
      const response = await axios.post('/users/login/', {
        student_id: studentId,
        password: encryptedPassword
      });
      
      toast.success('登录成功');
      // 调用父组件的登录回调
      if (onLogin) {
        onLogin(response.data.user, response.data.token);
      }
      // 跳转到首页
      navigate('/');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('学号或密码错误，请重新输入');
      } else {
        toast.error('登录失败，请稍后再试');
        console.error('登录错误:', error);
      }
    }
  };

  return (
    <div className="h-dvh flex flex-col items-center justify-center bg-gray-100 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="h-16 w-16 flex items-center justify-center">
              <img src="/favicon.ico" alt="Logo" className="h-10 w-10" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            核桃书 - 登录
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md -space-y-px">
            <div>
              <label htmlFor="studentId" className="sr-only">
                学号
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa fa-id-card text-gray-400"></i>
                </div>
                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md"
                  placeholder="输入SLAI学号"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa fa-lock text-gray-400"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md"
                  placeholder="输入您的密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
                      
            <div>
              <button
                type="button"
                onClick={() => navigate('/send-code')}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                忘记密码？
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              登录
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-gray-600">
            首次使用请先注册：
            <button
              onClick={() => navigate('/send-code')}
              className="ml-1 text-blue-600 hover:text-blue-500 font-medium"
            >
              立即注册
            </button>
          </p>
        </div>
        
        <div className="flex items-center justify-center">
          <a 
            href="https://github.com/ZhangLixian1023/hetaoshu" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="mr-1 text-sm">项目</span>
            <i className="fa fa-github text-lg"></i>
          </a>
          
          <a href="https://www.slai.edu.cn" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:text-purple-800 font-medium">
            <i className="fa fa-university"></i><span className="mr-1 text-sm">SLAI官网</span> 
          </a>

                      <a 
              href="mailto:250010020@slai.edu.cn?subject=关于核桃书的投诉" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="mr-1 text-sm">投诉</span>
              <i className="fa fa-envelope-o text-lg"></i>
            </a>


        </div>
      </div>
      
      {/* 备案号链接 */}
      <div className="mt-8 py-2 border-gray-200 flex justify-center items-center text-sm text-gray-500">
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">
          豫ICP备2024090343号-2
        </a>
      </div>
    </div>
  );
};

export default LoginPage;