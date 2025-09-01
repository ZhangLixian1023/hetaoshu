import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../ui/LoadingSpinner';

const CommentForm = ({ postId, replyToComment = null, onCommentSuccess }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(!!replyToComment);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!content.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    setLoading(true);
    try {
      // 构建评论数据
      const commentData = {
        content: content,
        post: postId
      };
      
      // 如果是回复，添加回复目标
      if (replyToComment) {
        commentData.reply_to = replyToComment.id;
      }
      
      await axios.post('/comments/', commentData);
      
      toast.success(replyToComment ? '回复成功' : '评论成功');
      
      // 清空表单
      setContent('');
      setIsReplying(false);
      
      // 通知父组件刷新评论列表
      if (onCommentSuccess) {
        onCommentSuccess();
      }
    } catch (error) {
      console.error('发表评论失败:', error);
      toast.error(error.response?.data?.error || '发表评论失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReply = () => {
    setIsReplying(false);
    setContent('');
  };

  return (
    <div className={`bg-white p-4 rounded-lg shadow-sm ${isReplying && replyToComment ? 'border-l-4 border-blue-500' : ''}`}>
      {isReplying && replyToComment && (
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center text-sm">
            <i className="fa fa-reply text-blue-500 mr-2"></i>
            <span className="text-gray-700">回复 </span>
            <span className="text-blue-600 font-medium">{replyToComment.author.student_id}</span>
            {replyToComment.content && (
              <span className="text-gray-500 ml-2">：{replyToComment.content.substring(0, 30)}...</span>
            )}
          </div>
          <button
            onClick={handleCancelReply}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={isReplying ? 2 : 3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder={isReplying ? `回复 @${replyToComment?.author.student_id}...` : "写下你的评论..."}
        ></textarea>
        
        <div className="flex justify-end">
          {isReplying && (
            <button
              type="button"
              onClick={handleCancelReply}
              className="px-3 py-1.5 mr-2 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none"
            >
              取消
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">发布中...</span>
              </div>
            ) : (
              <span>{isReplying ? '回复' : '发表评论'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;