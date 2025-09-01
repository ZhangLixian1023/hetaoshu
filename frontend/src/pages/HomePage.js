import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import PostCard from '../components/posts/PostCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 加载帖子数据
  const loadPosts = async () => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/posts/?page=${page}`);
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
  };

  useEffect(() => {
    loadPosts();
  }, [page]);

  // 监听滚动，实现无限加载
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop 
        >= document.documentElement.offsetHeight - 300 && !loading && hasMore) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore]);

  // 切换帖子类型的筛选
  const [filterType, setFilterType] = useState('all');
  
  const filteredPosts = filterType === 'all' 
    ? posts 
    : posts.filter(post => post.post_type === filterType);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">核桃书</h1>
        
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 rounded-full ${
              filterType === 'all' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={() => setFilterType('all')}
          >
            全部
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              filterType === 'share' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={() => setFilterType('share')}
          >
            个人分享
          </button>
          <button
            className={`px-4 py-2 rounded-full ${
              filterType === 'discussion' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
            onClick={() => setFilterType('discussion')}
          >
            话题讨论
          </button>
        </div>
      </div>
      
      {/* 瀑布流布局 */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6">
        {filteredPosts.map(post => (
          <div key={post.id} className="mb-6 break-inside-avoid">
            <PostCard post={post} />
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
      {!hasMore && !loading && filteredPosts.length > 0 && (
        <div className="text-center mt-8 text-gray-500">
          已经到底啦
        </div>
      )}
      
      {/* 没有帖子 */}
      {!loading && filteredPosts.length === 0 && (
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
