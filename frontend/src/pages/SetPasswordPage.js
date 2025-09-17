import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SetPasswordPage = () => {
  const [studentId, setStudentId] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 从localStorage获取之前保存的学号
    const savedStudentId = localStorage.getItem('temp_student_id');
    if (savedStudentId) {
      setStudentId(savedStudentId);
    } else {
      // 如果没有保存的学号，返回发送验证码页面
      navigate('/send-code');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!studentId.trim()) {
      toast.error('请输入学号');
      return;
    }
    
    if (!code.trim()) {
      toast.error('请输入验证码');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/users/set-password/', {
        student_id: studentId,
        code: code,
        password: password
      });
      
      toast.success(response.data.message);
      // 清除临时保存的学号
      localStorage.removeItem('temp_student_id');
      // 登录成功，调用父组件的登录回调
      if (window.opener && window.opener.handleLogin) {
        window.opener.handleLogin(response.data.user, response.data.token);
        window.close();
      } else if (window.parent && window.parent.handleLogin) {
        window.parent.handleLogin(response.data.user, response.data.token);
      } else if (window.handleLogin) {
        window.handleLogin(response.data.user, response.data.token);
      } else {
        // 如果没有回调，直接跳转到首页
        navigate('/');
      }
    } catch (error) {
      console.error('设置密码失败:', error);
      toast.error(error.response?.data?.error || '设置密码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            核桃书 - 设置密码
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            输入验证码并设置您的新密码
          </p>
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
                  placeholder="您的学号"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="code" className="sr-only">
                验证码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa fa-shield text-gray-400"></i>
                </div>
                <input
                  id="code"
                  name="code"
                  type="text"
                  required
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">
                新密码
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
                  placeholder="请设置新密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >确认设置
          </button>
        </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => {
              localStorage.removeItem('temp_student_id');
              navigate('/send-code');
            }}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            重新发送验证码
          </button>
          <span className="mx-2 text-gray-500">|</span>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            返回登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetPasswordPage;