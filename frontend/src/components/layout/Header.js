import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    }
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo 和标题 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-bold">核</span>
              </div>
              <span className="text-xl font-bold text-gray-900">核桃书</span>
            </Link>
            
            {/* 导航链接 - 仅在登录时显示 */}
            {user && (
              <nav className="ml-10 hidden md:flex space-x-8">
                <Link to="/posts/create" className="text-gray-700 hover:text-blue-600 font-medium">
                  发布帖子
                </Link>
                
              </nav>
            )}
          </div>
          
          {/* 用户登录登出操作 */}
          <div className="flex items-center space-x-4">
            {user ? (
              // 已登录状态
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium">
                  <span className="text-gray-700">{user.student_id}</span>
                  {user.name && (
                    <span className="text-gray-500 text-sm">({user.name})</span>
                  )}
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  <i className="fa fa-sign-out mr-1"></i>
                  退出登录
                </button>
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