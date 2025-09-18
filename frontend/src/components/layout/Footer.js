import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white text-black fixed bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto max-w-[1200px] px-4">
        <div className="flex items-center h-10">
          {/* 左侧的GitHub链接 */}
          <a 
            href="https://github.com/ZhangLixian1023/hetaoshu" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="mr-1 text-sm">项目地址</span>
            <i className="fa fa-github text-lg"></i>
          </a>
          
          {/* 占位元素，确保中间按钮居中 */}
          <div className="flex-1"></div>
          
          {/* 中间的发帖按钮 */}
          <Link to="/posts/create" className="flex items-center justify-center h-8 w-10 bg-purple-400 rounded-lg text-white text-xl shadow-lg hover:bg-purple-500 transition-colors" target="_blank">
            <i className="fa fa-plus"></i>
          </Link>
          
          {/* 占位元素，确保中间按钮居中 */}
          <div className="flex-1"></div>
          
          {/* 右侧的链接组：投币和投诉 */}
          <div className="flex">
            <a 
              href="/payqrcode.jpg" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-2"
            >
              <span className="mr-1 text-sm">投币</span>
            </a>

            <a 
              href="mailto:250010020@slai.edu.cn?subject=关于核桃书的投诉" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="mr-1 text-sm">投诉</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;