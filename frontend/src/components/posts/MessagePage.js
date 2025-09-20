import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const MessagePage = () => {
  const location = useLocation();
  const { messages } = location.state || { messages: [] };
  const navigate = useNavigate();

  // 格式化时间，不显示秒
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  return (
    <div className="p-5">
      <div className='flex justify-between items-center mb-6'>
        <h1 className="text-2xl font-bold text-gray-800">消息</h1>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md cursor-pointer text-sm transition-colors duration-200"
        >
          返回
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {messages.length === 0 ? (
          <div className="text-center p-10 text-gray-600 bg-gray-100 rounded-lg">
            暂无消息
          </div>
        ) : (
          messages.map((message, index) => (
            <Link 
              key={index}
              to={`/themes/${message.theme.id}/#${message.id}`} 
              className="block text-decoration-none border border-gray-200 p-5 rounded-lg bg-white shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300"
            >
                           <div className="mb-3">
                {message.theme.title}
              </div>
              {message.parent_content && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md border-l-4 border-gray-300">
                  <div className="text-xs text-gray-500 mb-1">您的原文：</div>
                  <p className="text-gray-600 text-sm m-0 leading-relaxed">{message.parent_content}</p>
                </div>
              )}
              <div className="mb-4 flex justify-between items-center">
                <span className="text-gray-600 font-medium">{message.author.name} 的回复</span>
                <span className="text-gray-400 text-xs">{formatDate(message.created_at)}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-md border-l-4 border-blue-500">
                <p className="m-0 leading-relaxed text-gray-700">{message.content}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagePage;
