import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white text-black fixed bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto max-w-[800px] px-4">
        <div className="flex justify-center items-center h-10">
          {/* 中间的发帖按钮 */}
          <Link to="/posts/create" className="flex items-center justify-center h-8 w-10 bg-purple-400 rounded-lg text-white text-xl shadow-lg hover:bg-purple-500 transition-colors">
            <i className="fa fa-plus"></i>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;