import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import PostCard from '../components/posts/PostCard';

const ProfilePage = ({ user, setUser }) => {
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'posts', 'password'

  useEffect(() => {
    // 初始化用户信息
    if (user) {
      setName(user.name || '');
      fetchUserPosts();
    }
    setLoading(false);
  }, [user]);

  // 获取用户发布的帖子
  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`/users/${user.id}/posts/`);
      // 后端返回的直接是帖子列表，不需要访问results字段
      setUserPosts(response.data || []);
    } catch (error) {
      console.error('获取用户帖子失败:', error);
      toast.error('获取用户帖子失败，请稍后重试');
    }
  };

  // 更新用户信息
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    
    setUpdating(true);
    try {
      const response = await axios.put('/users/profile/update/', {
        name: name
      });
      
      toast.success('个人信息更新成功');
      // 更新父组件中的用户信息
      if (setUser) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('更新个人信息失败:', error);
      toast.error(error.response?.data?.error || '更新个人信息失败，请稍后重试');
    } finally {
      setUpdating(false);
    }
  };

  // 更改密码
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!currentPassword) {
      toast.error('请输入当前密码');
      return;
    }
    
    
    setUpdating(true);
    try {
      await axios.put('/users/change-password/', {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      toast.success('密码更新成功，请重新登录');
      // 清除密码表单
      setCurrentPassword('');
      setNewPassword('');
      // 切换到信息标签页
      setActiveTab('info');
    } catch (error) {
      console.error('更新密码失败:', error);
      toast.error(error.response?.data?.error || '更新密码失败，请稍后重试');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">个人中心</h1>
          <p className="text-gray-600 mt-2">管理您的个人信息</p>
        </div>
        
        {/* 标签页导航 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'info' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              基本信息
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'posts' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              我的帖子
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'password' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              修改密码
            </button>
          </nav>
        </div>
        
        {/* 基本信息 */}
        {activeTab === 'info' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <form onSubmit={handleUpdateInfo} className="space-y-6">
              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                  学号
                </label>
                <input
                  type="text"
                  id="studentId"
                  value={user.student_id}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱
                </label>
                <input
                  type="email"
                  id="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  姓名
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入您的姓名"
                />
              </div>
              
              <div>
                <label htmlFor="dateJoined" className="block text-sm font-medium text-gray-700 mb-1">
                  注册日期
                </label>
                <input
                  type="text"
                  id="dateJoined"
                  value={new Date(user.date_joined).toLocaleDateString()}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {updating ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">保存中...</span>
                    </div>
                  ) : (
                    <span>保存修改</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* 我的帖子 */}
        {activeTab === 'posts' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-medium text-gray-900">我发布的帖子</h2>
            </div>
            
            {userPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fa fa-file-o text-4xl mb-2"></i>
                <p>您还没有发布任何帖子</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {userPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* 修改密码 */}
        {activeTab === 'password' && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  当前密码
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入当前密码"
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  新密码
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="请输入新密码"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {updating ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">修改中...</span>
                    </div>
                  ) : (
                    <span>修改密码</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;