import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 关于我们 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">关于核桃书</h3>
            <p className="text-gray-300 text-sm">
              核桃书是核桃学院的官方论坛，致力于为学院师生提供一个交流、分享和学习的平台。
            </p>
          </div>
          
          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  学院官网
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  图书馆
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  教务系统
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  学生社团
                </a>
              </li>
            </ul>
          </div>
          
          {/* 联系我们 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">联系我们</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-gray-300">
                <i className="fa fa-envelope-o mr-2"></i>
                <span>contact@hetaoshu.com</span>
              </li>
              <li className="flex items-center text-gray-300">
                <i className="fa fa-phone mr-2"></i>
                <span>010-12345678</span>
              </li>
              <li className="flex items-center text-gray-300">
                <i className="fa fa-map-marker mr-2"></i>
                <span>北京市海淀区核桃学院</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} 核桃书论坛 版权所有</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;