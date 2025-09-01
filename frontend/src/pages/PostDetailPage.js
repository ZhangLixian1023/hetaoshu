import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CommentList from '../components/comments/CommentList';
import CommentForm from '../components/comments/CommentForm';

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
  const fetchPost = async () => {
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
  };
  
  useEffect(() => {
    fetchPost();
  }, [id]);
  
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
  
  // 处理评论提交
  const handleCommentSubmit = async (content) => {
    if (!user) {
      toast.info('请先登录');
      return;
    }
    
    try {
      await axios.post('/comments/', {
        post: id,
        content: content
      });
      toast.success('评论成功');
      fetchPost(); // 重新加载帖子以显示新评论
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('评论失败');
    }
  };
  
  // 处理删除评论
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`/comments/${commentId}/`);
      toast.success('评论已删除');
      fetchPost(); // 重新加载帖子
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('删除评论失败');
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
  
  // 帖子类型样式 - 个人分享(红色)，话题讨论(蓝色)
  const borderColor = post.post_type === 'share' ? 'border-red-500' : 'border-blue-500';
  const headerBgColor = post.post_type === 'share' ? 'bg-red-50' : 'bg-blue-50';
  const typeText = post.post_type === 'share' ? '个人分享' : '话题讨论';
  const typeColor = post.post_type === 'share' ? 'text-red-600' : 'text-blue-600';
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* 帖子标题栏 */}
      <div className={`rounded-t-lg p-4 ${headerBgColor} border-b ${borderColor}`}>
        <div className="flex justify-between items-center">
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${typeColor} bg-opacity-20`}>
            {typeText}
          </span>
          
          {/* 作者操作按钮 */}
          {isAuthor && (
            <div className="flex space-x-2">
              {post.post_type === 'share' && ( // 只有个人分享可以编辑
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
      <div className={`p-6 bg-white border-l border-r ${borderColor}`}>
        {/* 帖子图片 */}
        {post.images && post.images.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {post.images.map(image => (
              <div key={image.id} className="rounded-lg overflow-hidden">
                <img 
                  src={image.image} 
                  alt={`${post.title}的图片`}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        )}
        
        {/* 帖子文本内容 */}
        <div className="prose max-w-none mb-6">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="my-3">{paragraph}</p>
          ))}
        </div>
        
        {/* 相关帖子链接 */}
        {post.outgoing_links && post.outgoing_links.length > 0 && (
          <div className="mt-8 pt-4 border-t border-gray-200">
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
      
      {/* 评论区 */}
      <div className={`rounded-b-lg bg-white border-t border-l border-r ${borderColor} p-6`}>
        <h2 className="text-xl font-bold mb-6">评论 ({post.comments_count || 0})</h2>
        
        {/* 评论表单 */}
        <CommentForm onSubmit={handleCommentSubmit} />
        
        {/* 评论列表 */}
        {post.comments && post.comments.length > 0 ? (
          <CommentList 
            comments={post.comments} 
            isPostAuthor={isAuthor}
            postType={post.post_type}
            onDeleteComment={handleDeleteComment}
          />
        ) : (
          <p className="text-gray-500 mt-6">暂无评论，来发表第一条评论吧~</p>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
