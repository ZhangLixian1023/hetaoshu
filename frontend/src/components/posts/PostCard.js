import React from 'react';
import ImageCarousel from './ImageCarousel';
import { getThemeConfig } from './themeTypes';

const PostCard = ({ post }) => {
  // 使用主题类型配置获取边框颜色
  const { borderColor } = getThemeConfig(post.theme.theme_type);
  
  // 获取帖子内容的前20个字符作为摘要
  const getSummary = (content) => {
    return content ? content.substring(0, 20) : '';
  };

  return (
    <div className={`w-full overflow-hidden shadow-md hover:shadow-lg transition-shadow border-[1px] ${borderColor}`}>
      {/* 根据image_count决定显示图片还是摘要 */}
      {post.image_count > 0 && post.first_image ? (
        // 有图片时直接使用first_image
        <ImageCarousel images={[post.first_image]} alt={post.title} />
      ) : (
        // 没有图片时显示摘要
        <div className="bg-gray-100 h-40 flex items-center justify-center p-4">
          <p className="text-gray-700 text-center text-lg">
            {getSummary(post.content)}
          </p>
        </div>
      )}
      
      {/* 帖子信息 - 保留内边距 */}
      <div className={`p-4 bg-white`}>
        <h3 className="font-semibold text-gray-800 line-clamp-1">{post.title}</h3>
        
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500">
            {post.author.student_id}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        
        {/* 评论数量 */}
        {post.comment_count > 0 && (
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <i className="fa fa-comment-o mr-1"></i>
            {post.comment_count} 条评论
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
