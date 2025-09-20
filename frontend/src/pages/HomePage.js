import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate ,Link} from 'react-router-dom';
import { toast } from 'react-toastify';
import PostCard from '../components/posts/PostCard';
import './xiaohongshu.css'; // 我们将在同一个文件中包含CSS
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
const HomePage = ({ user, handleLogout }) => {
  // 状态管理
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 加载帖子数据 - 使用useCallback防止重复创建
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/themes/?page=${page}`);
      if (page === 1) {
        setThemes(response.data.results);
      } else {
        // 这里只添加新帖子，不重新排列已有帖子
        setThemes(prev => [...prev, ...response.data.results]);
      }
      // 检查是否有更多页
      setHasMore(!!response.data.next);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('加载帖子失败');
    } finally {
      setLoading(false);
    }
  }, [page]);
  
  // 初始加载和分页加载
  useEffect(() => {
    if(hasMore){
      loadPosts();
    }
  }, [page, hasMore, loadPosts]);
  
  // 加载更多帖子的处理函数
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };
  


  
  
  return (
    <div >
      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
    <Footer/>
    <Header user={user} onLogout={handleLogout} />

    <div className="xiaohongshu-feed">
      <div className="feed-columns">
          {themes.map(theme => (
           <Link to={`/themes/${theme.id}/`} key={theme.id} >
           <PostCard key={theme.id} theme={theme}/>
           </Link>
          ))}
      </div>
    </div>
      
      {/* 加载更多按钮 */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-8 mb-12">
          <button 
            onClick={handleLoadMore}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            加载更多
          </button>
        </div>
      )}
      
      {/* 没有更多内容 */}
      {!hasMore && !loading && themes.length > 0 && (
        <div className="text-center mt-8 text-gray-500 mb-12">
          已经到底啦
        </div>
      )}
      
    </div>
  );
};

export default HomePage;
