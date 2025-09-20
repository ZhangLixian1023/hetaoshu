import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
const MessagePage = () => {
  const location = useLocation();
  const { messages } = location.state || { messages: [] };
  const navigate = useNavigate();
  return (
    <div style={{ padding: '20px' }}>
      <h1>未读消息</h1>
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '4px' }}>
        <pre style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(messages, null, 2)}
        </pre>
      </div>
      <button 
        onClick={() => navigate(-1)}
        style={{ padding: '8px 16px', marginBottom: '20px' }}
      >
        返回
      </button>
    </div>
  );
};

export default MessagePage;
