import axios from 'axios';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

/**
 * 递归渲染评论树的组件
 * 使用get_reply_tree接口一次性获取全部评论树
 */
const CommentList = ({ themeId, onRefresh, onReply }) => {
  const [commentTree, setCommentTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // 获取当前登录用户
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchCommentTree();
  },[themeId]);

  // 监听评论刷新事件
  useEffect(() => {
    fetchCommentTree();
  }, [onRefresh]);

  // 一次性获取完整的评论树
  const fetchCommentTree = async () => {
    try {
      setLoading(true);
      // 使用新的get_reply_tree接口获取完整评论树
      const response = await axios.get(`themes/${themeId}/reply_tree/`);
      setCommentTree(response.data.reply_tree.replies || []);
    } catch (error) {
      console.error('获取评论树失败:', error);
      toast.error('获取评论失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId) => {
    if (window.confirm('确定要删除这条评论吗？')) {
      try {
        await axios.delete(`posts/${commentId}/`);
        fetchCommentTree(); // 重新获取评论树
        toast.success('评论已删除');
      } catch (error) {
        console.error('删除评论失败:', error);
        toast.error('删除评论失败，请稍后重试');
      }
    }
  };

  // 递归渲染评论及其所有子回复
  const renderCommentNode = (comment, depth = 0) => {
    const isCurrentUserComment = currentUser && currentUser.id === comment.author.id;
    
    // 限制嵌套深度，避免过深的嵌套导致UI问题
    const maxDepth = 5;
    const shouldShowReplyButton = depth < maxDepth;
    const hasReplies = comment.replies && comment.replies.length > 0;
    
    return (
      <div key={comment.id} className={`mb-4 ${depth > 0 ? 'ml-3 mt-2 pl-2 border-l-2 border-gray-200' : ''}`}>
        <div className="flex items-start">
          {/* 评论内容 */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-gray-900">
                  {comment.author.name || comment.author.student_id}
                </span>
                
                {/* 回复按钮 - 所有评论和回复都可被回复 */}
                {shouldShowReplyButton && (
                  <button
                    onClick={() => onReply(comment)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    <i className="fa fa-reply"></i>
                  </button>
                )}
                
                {/* 删除按钮 - 仅评论作者可见 */}
                {isCurrentUserComment && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    <i className="fa fa-trash-o"></i>
                  </button>
                )}
                
                {comment.reply_to && (
                <span className="text-xs text-blue-600">
                  @{comment.reply_to.author.name || comment.reply_to.author.student_id}
                </span>
              )}
              </div>
              
              <div className="flex items-center">
                <span className="text-xs text-gray-500">
                  {new Date(comment.updated_at).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="mt-1 text-sm text-gray-700">
              {comment.content}
            </div>
          </div>
        </div>

        {/* 递归渲染子回复 - 一次性渲染所有层级的回复 */}
        {hasReplies && depth < maxDepth && (
          <div className="mt-2">
            {comment.replies.map((reply) => 
              renderCommentNode(reply, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // 计算总评论数（包括所有层级的回复）
  const calculateTotalComments = (comments) => {
    let count = 0;
    
    const countComments = (node) => {
      count++;
      if (node.replies && node.replies.length > 0) {
        node.replies.forEach(reply => countComments(reply));
      }
    };
    
    comments.forEach(comment => countComments(comment));
    return count;
  };


  const totalComments = calculateTotalComments(commentTree);
  
  if (totalComments === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>暂无评论</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">共 {totalComments} 条评论</h3>
      </div>
      
      <div className="space-y-4">
        {commentTree.map((comment) => renderCommentNode(comment))}
      </div>
    </div>
  );
};

export default CommentList;