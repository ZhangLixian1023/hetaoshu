import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white text-black fixed bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="flex justify-between items-center h-10">
          {/* 左侧的GitHub链接 */}
          <a 
            href="https://github.com/ZhangLixian1023/hetaoshu" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="mr-1 text-sm">项目地址：</span>
            <i className="fa fa-github text-lg"></i>
          </a>
          
          {/* 中间的发帖按钮 */}
          <Link to="/posts/create" className="flex items-center justify-center h-8 w-10 bg-purple-400 rounded-lg text-white text-xl shadow-lg hover:bg-purple-500 transition-colors" target="_blank">
            <i className="fa fa-plus"></i>
          </Link>
          
          {/* 右侧的投币支持链接 */}
          <a 
            href="/payqrcode.jpg" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="mr-1 text-sm">投币支持</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;