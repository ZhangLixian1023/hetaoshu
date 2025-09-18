import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
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
      const response = await axios.post('/users/login/', {
        student_id: studentId,
        password: password
      });
      
      toast.success('登录成功');
      // 调用父组件的登录回调
      if (onLogin) {
        onLogin(response.data.user, response.data.token);
      }
      // 跳转到首页
      navigate('/');
    } catch  {
      // 确保停留在登录页面，不进行任何跳转
      toast.error('学号或密码错误，请重新输入');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
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
          <input type="hidden" name="remember" value="true" />
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
      </div>
    </div>
  );
};

export default LoginPage;