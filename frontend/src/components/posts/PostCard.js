import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post }) => {
  // 确定边框颜色 - 个人分享(红色)，话题讨论(蓝色)
  const borderColor = post.post_type === 'share' ? 'border-red-500' : 'border-blue-500';
  
  // 获取帖子的第一张图片
  const firstImage = post.images && post.images.length > 0 
    ? post.images[0].image 
    : 'https://picsum.photos/400/300?random=' + post.id;
  
  return (
    <Link to={`/posts/${post.id}`}>
      <div className={`rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow border-2 ${borderColor}`}>
        {/* 帖子图片 */}
        <div className="relative w-full pb-[75%]">
          <img 
            src={firstImage} 
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        
        {/* 帖子信息 */}
        <div className="p-4 bg-white">
          <h3 className="font-semibold text-gray-800 line-clamp-1">{post.title}</h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.content.substring(0, 60)}...</p>
          
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500">
              {post.author.student_id}
            </span>
            <span className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
          
          {/* 评论数量 */}
          {post.comments_count > 0 && (
            <div className="mt-2 text-xs text-gray-500 flex items-center">
              <i className="fa fa-comment-o mr-1"></i>
              {post.comments_count} 条评论
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
