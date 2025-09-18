import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Header = ({ user }) => {
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (user) {
      // 从localStorage读取缓存的name，如果存在则使用它
      const USER_NAME_CACHE_KEY = `user_${user.id}_name`;
      const cachedName = localStorage.getItem(USER_NAME_CACHE_KEY);
      
      if (cachedName) {
        setDisplayName(cachedName);
      } else {
        setDisplayName(user.name || '');
      }
    }
  }, [user]);

  return (
    <header className="bg-white  fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="flex justify-between items-center h-16">
          {/* 左侧区域 */}
          <div className="flex items-center">
            <Link to="/" className="text-blue-600">
              <i className="fa fa-search text-xl"></i>
              <span className="ml-1 text-sm text-gray-500">搜索功能待开发</span>
            </Link>
          </div>
          
          {/* 用户登录登出操作 */}
          <div className="flex items-center space-x-4">
            {user ? (
              // 已登录状态
              <div className="flex items-center space-x-4">
                <div className=" md:flex items-center space-x-2">
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium">
                    <span className="text-gray-700">{displayName}</span>                  
                  </Link>
                </div>
              </div>
            ) : (
              // 未登录状态
              <Link
                to="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
              >
                登录 / 注册
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;