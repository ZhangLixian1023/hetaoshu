import { useState, useEffect,useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../ui/LoadingSpinner';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import ImageCarousel from './ImageCarousel';
import { getThemeConfig } from './themeTypes';

const PostTree = ({theme,postId}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [post, setPost] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyToItem, setReplyToItem] = useState(null);
const [images, setImages] = useState([]);
  // 获取当前登录用户
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  

  
  // 处理评论成功后的回调
  const handleCommentSuccess = () => {
    fetchPost();
    setShowReplyModal(false);
    setReplyToItem(null);
  };
  
  // 打开回复弹窗
  const openReplyModal = (item) => {
    setReplyToItem(item);
    setShowReplyModal(true);
  };
  
  // 关闭回复弹窗
  const closeReplyModal = () => {
    setShowReplyModal(false);
    setReplyToItem(null);
  };
  
  // 获取帖子详情
  const fetchPost = useCallback( async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/posts/${postId}/`);
      setPost(response.data);
      const imagesResponse = await axios.get(`/posts/${postId}/images/`);
      setImages(imagesResponse.data);
      
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('加载帖子失败');
    } finally {
      setLoading(false);
      console.log('PostTree: after fetch, post is:',post);
    }
  },[postId]);
  
  useEffect(() => {
    fetchPost();
  }, [postId,fetchPost]);

  // 处理删除帖子
  const handleDeletePost = async () => {
    if (!window.confirm('确定要删除这个帖子吗？')) {
      return;
    }
    
    try {
      await axios.delete(`/posts/${post.id}/`);
      toast.success('帖子已删除');
      navigate('/');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('删除帖子失败');
    }
  };
  
  if (!loading && !post) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">帖子不存在或已被删除</p>
        <Link to="/" className="mt-4 inline-block text-blue-600">返回首页</Link>
      </div>
    );
  }
  
  
 
  console.log('PostTree: before return, post is:',post);
  if(post && !loading){
    // 判断当前用户是否是帖子作者
  const isAuthor = user && post.author && user.student_id === post.author.student_id;
  // 帖子类型样式 - 使用主题配置字典
  const themeType = theme.theme_type;
  const { borderColor, bgColor, label, textColor } = getThemeConfig(themeType);
  const headerBgColor = bgColor;
  const typeText = label;
  const typeColor = textColor;
    return (
    <div className="w-full">
      {/* 帖子标题栏 */}
      <div className={`${headerBgColor}`}>
        <div className="flex justify-between items-center">
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full bg-opacity-20`}>
          </span>
          
          {/* 作者操作按钮 */}
          {isAuthor && (
            <div className="flex space-x-2 mr-2">
              <button
                onClick={handleDeletePost}
                className="text-sm text-gray-600 hover:text-red-600"
              >
                删除
              </button>
            </div>
          )}
        </div>
        
        <h1 className="text-2xl font-bold m-2">{post.title}</h1>
        
        <div className="flex items-center text-gray-600 text-sm p-2">
          <span>作者: {post.author.name || post.author.student_id}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>
      </div>
      
      {/* 帖子内容 */}
      <div className={`bg-white `}>
        {/* 帖子图片 - 使用轮播组件（全宽度显示） */}
        {images && images.length > 0 && (
          <div className="w-full">
            <ImageCarousel images={images} alt={`${post.title}的图片`} />
          </div>
        )}
        
        {/* 帖子文本内容 - 保留内边距 */}
        <div className="prose max-w-none p-3">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="my-3">{paragraph}</p>
          ))}
        </div>
      </div>

      {/* 发表评论按钮 - 点击后打开底部弹窗 */}
      <div className="w-full">
        <div 
          className="bg-white p-4 rounded-lg shadow-sm border border-dashed border-gray-300 cursor-pointer hover:border-blue-500 transition-colors duration-200"
          onClick={() => openReplyModal(post)}
        >
          <div className="flex items-center text-gray-400">
            <i className="fa fa-comment-o mr-2"></i>
            <span>写下你的评论...</span>
          </div>
        </div>
      </div>
      {/* 评论列表 */}
      <div className="w-full">
      <CommentList 
        themeId={theme.id} 
        onRefresh={fetchPost} 
        onReply={openReplyModal}
      />
      </div>
      
      {/* 底部回复弹窗和蒙版 */}
      {showReplyModal && (
        <>
          {/* 灰色蒙版 */}
          <div 
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40" 
            onClick={closeReplyModal}
          ></div>
          
          {/* 底部评论框 */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  发表评论
                </h3>
                <button 
                  onClick={closeReplyModal} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <i className="fa fa-times"></i>
                </button>
              </div>
              <CommentForm 
                replyToComment={replyToItem}
                onCommentSuccess={handleCommentSuccess}
                isVisible={true}
              />
            </div>
          </div>
        </>
      )}
  
    </div>
  );

  }
  
};

export default PostTree;
