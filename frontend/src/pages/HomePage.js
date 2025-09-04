import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HomePage = () => {
  const navigate = useNavigate();
  // 状态管理
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // 加载帖子数据 - 使用useCallback防止重复创建
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`posts/?page=${page}`);
      if (page === 1) {
        setPosts(response.data.results);
      } else {
        setPosts(prev => [...prev, ...response.data.results]);
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
    loadPosts();
  }, [page]);
  
  // 监听滚动，实现无限加载
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 500 && !loading && hasMore) { // 调整阈值为500，提前触发加载
        setPage(prev => prev + 1);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);
  

  
  // 处理点击帖子卡片的函数
  const handlePostClick = (postId) => {
    // 使用React Router的navigate函数进行导航
    navigate(`/posts/${postId}/`);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">核桃书</h1>
      </div>
      
      {/* 改进的瀑布流布局 - 确保帖子位置稳定 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {posts.map(post => (
          <div key={post.id} className="mb-6">
            <div onClick={() => handlePostClick(post.id)} className="cursor-pointer">
              <PostCard post={post} />
            </div>
          </div>
        ))}
      </div>
      
      {/* 加载状态 */}
      {loading && (
        <div className="flex justify-center mt-8">
          <LoadingSpinner />
        </div>
      )}
      
      {/* 没有更多内容 */}
      {!hasMore && !loading && posts.length > 0 && (
        <div className="text-center mt-8 text-gray-500">
          已经到底啦
        </div>
      )}
      
      {/* 没有帖子 */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">暂无帖子</p>
          <Link 
            to="/posts/create" 
            className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            发布第一个帖子
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;
