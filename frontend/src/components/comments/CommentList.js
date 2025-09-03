import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../ui/LoadingSpinner';

const CommentList = ({ postId, onRefresh }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // 获取当前登录用户
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    fetchComments();
  }, [postId]);

  // 监听评论刷新事件
  useEffect(() => {
    fetchComments();
  }, [onRefresh]);

  // 获取评论列表
  const fetchComments = async () => {
    try {
      const response = await axios.get(`/posts/${postId}/comments/`);
      setComments(response.data || []);
    } catch (error) {
      console.error('获取评论失败:', error);
      toast.error('获取评论失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('确定要删除这条评论吗？')) {
      try {
        await axios.delete(`/posts/${postId}/comments/${commentId}/`);
        fetchComments(); // 重新获取评论列表
        toast.success('评论已删除');
      } catch (error) {
        console.error('删除评论失败:', error);
        toast.error('删除评论失败，请稍后重试');
      }
    }
  };

  // 切换回复展开/收起
  const toggleReplies = (commentId) => {
    const newExpandedReplies = new Set(expandedReplies);
    if (newExpandedReplies.has(commentId)) {
      newExpandedReplies.delete(commentId);
    } else {
      newExpandedReplies.add(commentId);
    }
    setExpandedReplies(newExpandedReplies);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <i className="fa fa-comments-o text-3xl mb-2"></i>
        <p>还没有评论，快来抢沙发吧！</p>
      </div>
    );
  }

  // 渲染单个评论
  const renderComment = (comment, isReply = false) => {
    const isCurrentUserComment = currentUser && currentUser.id === comment.author.id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);
    
    return (
      <div key={comment.id} className={`mb-4 ${isReply ? 'ml-8 mt-2 pl-4 border-l-2 border-gray-200' : ''}`}>
        <div className="flex items-start">
          {/* 用户头像（用首字母代替） */}
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="text-blue-600 text-xs font-medium">
              {comment.author.student_id.charAt(0)}
            </span>
          </div>
          
          {/* 评论内容 */}
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-900">
                  {comment.author.student_id}
                </span>
                {isReply && (
                  <span className="mx-2 text-xs text-gray-500">回复</span>
                )}
                {isReply && comment.reply_to && (
                  <span className="text-xs text-blue-600">
                    @{comment.reply_to.author.student_id}
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
                
                {/* 删除按钮 - 仅评论作者可见 */}
                {isCurrentUserComment && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    <i className="fa fa-trash-o"></i>
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-1 text-sm text-gray-700">
              {comment.content}
            </div>
            
            {/* 回复展开/收起按钮 */}
            {hasReplies && !isReply && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-500"
              >
                {isExpanded ? (
                  <span className="flex items-center">
                    <i className="fa fa-chevron-up mr-1"></i>
                    收起回复 ({comment.replies.length})
                  </span>
                ) : (
                  <span className="flex items-center">
                    <i className="fa fa-chevron-down mr-1"></i>
                    查看回复 ({comment.replies.length})
                  </span>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* 回复列表 */}
        {hasReplies && isExpanded && !isReply && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  // 分离主评论和回复
  const mainComments = comments.filter(comment => !comment.reply_to);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">共 {comments.length} 条评论</h3>
      </div>
      
      <div className="space-y-4">
        {mainComments.map((comment) => renderComment(comment))}
      </div>
    </div>
  );
};

export default CommentList;