import  { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const SendCodePage = () => {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!studentId.trim()) {
      toast.error('请输入学号');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/users/send-code/', {
        student_id: studentId
      });
      
      toast.success(response.data.message);
      // 保存学号到localStorage，方便下一步使用
      localStorage.setItem('temp_student_id', studentId);
      // 跳转到设置密码页面
      navigate('/set-password');
    } catch (error) {
      console.error('发送验证码失败:', error);
      // 显示更详细的错误信息
      const errorMessage = error.response?.data?.error || '发送验证码失败，请稍后重试';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            核桃书 - 发送验证码
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            输入学号，我们将发送验证码到您的学校邮箱
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
                  placeholder="请输入您的学号"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <span className="flex items-center">
                  <i className="fa fa-paper-plane mr-2"></i>
                  发送验证码
                </span>
              )}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            已有账号？返回登录
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendCodePage;