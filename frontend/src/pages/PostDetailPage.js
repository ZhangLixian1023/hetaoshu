import { useState, useEffect,useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CommentList from '../components/posts/CommentList';
import CommentForm from '../components/posts/CommentForm';
import ImageCarousel from '../components/posts/ImageCarousel';
import { getThemeConfig } from '../components/posts/themeTypes';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // 获取当前登录用户
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  // 获取帖子详情
  const fetchPost =useCallback( async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/posts/${id}/`);
      setPost(response.data);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('加载帖子失败');
    } finally {
      setLoading(false);
    }
  },[id]);
  
  useEffect(() => {
    fetchPost();
  }, [id,fetchPost]);

  // 处理删除帖子
  const handleDeletePost = async () => {
    if (!window.confirm('确定要删除这个帖子吗？')) {
      return;
    }
    
    try {
      await axios.delete(`/posts/${id}/`);
      toast.success('帖子已删除');
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('删除帖子失败');
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!post) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">帖子不存在或已被删除</p>
        <Link to="/" className="mt-4 inline-block text-blue-600">返回首页</Link>
      </div>
    );
  }
  
  // 判断当前用户是否是帖子作者
  const isAuthor = user && post.author && user.student_id === post.author.student_id;
  
  // 帖子类型样式 - 使用主题配置字典
  const themeType = post.theme_type; // 兼容旧数据
  const { borderColor, bgColor, label, textColor } = getThemeConfig(themeType);
  const headerBgColor = bgColor;
  const typeText = label;
  const typeColor = textColor;
  
  return (
    <div className="w-full">
      {/* 帖子标题栏 */}
      <div className={`${headerBgColor} border ${borderColor}`}>
        <div className="flex justify-between items-center">
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${typeColor} bg-opacity-20`}>
            {typeText}
          </span>
          
          {/* 作者操作按钮 */}
          {isAuthor && (
            <div className="flex space-x-2">
              {themeType === 'share' && ( // 只有个人分享可以编辑
                <Link 
                  to={`/posts/${id}/edit`}
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  编辑
                </Link>
              )}
              <button
                onClick={handleDeletePost}
                className="text-sm text-gray-600 hover:text-red-600"
              >
                删除
              </button>
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold mt-4 mb-2">{post.title}</h1>
        
        <div className="flex items-center text-gray-600 text-sm">
          <span>作者: {post.author.student_id}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>
      </div>
      
      {/* 帖子内容 */}
      <div className={`bg-white `}>
        {/* 帖子图片 - 使用轮播组件（全宽度显示） */}
        {post.images && post.images.length > 0 && (
          <div className="w-full">
            <ImageCarousel images={post.images} alt={`${post.title}的图片`} />
          </div>
        )}
        
        {/* 帖子文本内容 - 保留内边距 */}
        <div className="prose max-w-none p-3">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="my-3">{paragraph}</p>
          ))}
        </div>
        
        {/* 相关帖子链接 - 保留内边距 */}
        {post.outgoing_links && post.outgoing_links.length > 0 && (
          <div className="mt-0 pt-4 border-t border-gray-200 p-6">
            <h3 className="font-semibold text-gray-700 mb-3">相关帖子:</h3>
            <ul className="list-disc pl-5 space-y-1">
              {post.outgoing_links.map(link => (
                <li key={link.id}>
                  <Link 
                    to={`/posts/${link.target_post.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {link.target_post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* 评论区 - 保留内边距 */}
      <div className={`bg-white p-2`}>
        <h2 className="text-xl font-bold mb-2">评论</h2>
        
        {/* 评论表单 */}
        <CommentForm postId={id} onCommentSuccess={fetchPost} />
        
        {/* 评论列表 */}
        <CommentList 
            postId={id}
            onRefresh={fetchPost}
          />
      </div>
    </div>
  );
};

export default PostDetailPage;
