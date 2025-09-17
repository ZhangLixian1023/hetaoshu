import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link} from 'react-router-dom';
import { toast } from 'react-toastify';
import PostCard from '../components/posts/PostCard';
import './xiaohongshu.css'; // 我们将在同一个文件中包含CSS
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';
const HomePage = ({ user, handleLogout }) => {
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
        // 这里只添加新帖子，不重新排列已有帖子
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
          {posts.map(post => (
           <a href={`/themes/${post.theme.id}/`} key={post.id}  target='_blank' rel='noreferrer'>
           <PostCard key={post.id} post={post}/>
           </a>
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
      {!hasMore && !loading && posts.length > 0 && (
        <div className="text-center mt-8 text-gray-500 mb-12">
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
