import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CommentForm = ({ replyToComment , onCommentSuccess, isVisible = true }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  console.log('CommentForm: before everything, replyToComment is:',replyToComment);

  // 当组件可见时，自动聚焦到评论框
  useEffect(() => {
    if (isVisible && textareaRef.current) {
      // 使用setTimeout确保DOM已经渲染完成
      const timer = setTimeout(() => {
        textareaRef.current.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);
  
  // 如果组件不可见，则直接返回null
  if (!isVisible) {
    return null;
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('CommentForm: before submit, replyToComment is:',replyToComment);
    // 验证表单
    if (!content.trim()) {
      toast.error('请输入评论内容');
      return;
    }

    setLoading(true);
    try {
      // 构建评论数据，与发帖的格式一致
      const commentData = {
        'title':replyToComment.title,
        'content': content,
        'images': [],
        'parent': replyToComment.id
      };
      
      await axios.postForm(`/posts/`, commentData);
      
      toast.success('评论成功');
      
      // 清空表单
      setContent('');
      
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

  return (
    <div className="w-full">
      {/* 回复信息显示 - 保持简单的回复提示 */}
      {replyToComment && (
        <div className="mb-3 text-sm text-gray-500">
          <span>回复 @{replyToComment.author.name}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder={`写下你的评论...`}
        />
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {loading ? (
              <div className="flex items-center">
                <span className="ml-2">发布中...</span>
              </div>
            ) : (
              <span>发表评论</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;