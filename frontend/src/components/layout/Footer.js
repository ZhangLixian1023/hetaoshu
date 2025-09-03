const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white fixed bottom-0 left-0 right-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} 核桃书论坛 版权所有</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;