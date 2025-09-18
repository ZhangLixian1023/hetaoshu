import '../../pages/xiaohongshu.css'
const PostCard = ({ post}) => {   
  
  // 获取帖子内容的前100个字符作为摘要
  const getSummary = (content) => {
    return content ? content.substring(0, 100) : '';
  };

  return (
    <div className='post-card'>
      {/* 根据image_count决定显示图片还是摘要 */}
      {post.image_count > 0 && post.first_image ? (
        // 有图片时直接使用first_image
        <div className='post-image-container' >
       <img
          src={post.first_image.image} 
          alt={post.title}
          className='post-image'
        />
        </div>
      ) : (
        // 没有图片时显示摘要
        <div className="post-image-container" >
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
            {post.author.name || post.author.student_id}
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
