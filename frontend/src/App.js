import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import 'tailwindcss/tailwind.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

// 布局组件
import Header from './components/layout/Header';

// 认证组件
import LoginPage from './pages/LoginPage';
import SendCodePage from './pages/SendCodePage';
import SetPasswordPage from './pages/SetPasswordPage';

// 帖子组件
import HomePage from './pages/HomePage';
import PostDetailPage from './pages/PostDetailPage';
import ThemeDetailPage from './pages/ThemeDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import XiaohongshuPage from './pages/xiaohongshu';

// 个人组件
import ProfilePage from './pages/ProfilePage';

// 配置axios - 使用环境变量
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const ENV = process.env.REACT_APP_ENV || 'development';
const DEBUG = process.env.REACT_APP_DEBUG === 'true';

// 全局配置
window.appConfig = {
  API_URL,
  ENV,
  DEBUG
};

if (DEBUG) {
  console.log('App running in', ENV, 'environment');
  console.log('API URL:', API_URL);
}

// 全局axios配置
axios.defaults.baseURL = API_URL;
// 设置请求大小限制为30MB (30 * 1024 * 1024)
axios.defaults.maxContentLength = Infinity;
axios.defaults.maxBodyLength = Infinity;

// 请求拦截器添加token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// 响应拦截器处理错误
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // 未授权，清除token并跳转登录
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 私有路由组件
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储中的用户信息
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  // 处理登录成功
  const handleLogin = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      await axios.post('/users/logout/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-gray-100">加载中...</div>;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="flex flex-col min-h-screen">
        
        <main className="flex-grow container mx-auto max-w-[800px] pt-[20px] pb-[20px]">
          <Routes>
            {/* 公共路由 */}
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
            <Route path="/send-code" element={user ? <Navigate to="/" /> : <SendCodePage />} />
            <Route path="/set-password" element={user ? <Navigate to="/" /> : <SetPasswordPage onLogin={handleLogin} />} />
            
            {/* 首页 - 公开访问，但登录后有更多功能 */}
            <Route path="/" element={<HomePage user={user} handleLogout={handleLogout} />} />
            {/*<Route path="/xiaohongshu" element={<XiaohongshuPage/>} />*/}
            {/* 帖子详情页 - 公开访问 */}
            <Route path="/posts/:id" element={<PostDetailPage />} />
             {/* 主题帖详情页 - 公开访问 */}
            <Route path="/themes/:id" element={<ThemeDetailPage />} />
            
            {/* 私有路由 */}
            <Route path="/posts/create" element={
              <PrivateRoute>
                <CreatePostPage />
              </PrivateRoute>
            } />

            <Route path="/posts/:id/edit" element={
              <PrivateRoute>
                <EditPostPage />
              </PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute>
                <ProfilePage user={user} setUser={setUser} onLogout={handleLogout} />
              </PrivateRoute>
            } />
            
            {/* 404页面 */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          
        </main>
        
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={true} />
      </div>
    </Router>
  );
}

export default App;
