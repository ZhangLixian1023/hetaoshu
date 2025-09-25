import '../../pages/xiaohongshu.css'
const PostCard = ({ theme}) => {
  
  // 获取帖子内容的前100个字符作为摘要
  const getSummary = (content) => {
    return content ? content.substring(0, 100) : '';
  };

  return (
    <div className='post-card'>
      {/* 根据image_count决定显示图片还是摘要 */}
      {theme.image ? (
        // 有图片时直接使用first_image
        <div className='post-image-container' >
       <img
          src={theme.image.image} 
          alt={theme.title}
          className='post-image'
        />
        </div>
      ) : (
        // 没有图片时显示摘要
        <div className="post-image-container" >
          <p className="text-gray-700 text-center text-lg">
            {getSummary(theme.post.content)}
          </p>
        </div>
      )}
      
      {/* 帖子信息 - 保留内边距 */}
      <div className={`p-3 bg-white`}>
        <h3 className="font-semibold text-gray-800 h-12 overflow-hidden">{theme.title}</h3>
        
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {theme.author.name || theme.author.student_id}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(theme.created_at).toLocaleDateString()}
          </span>
        </div>
        
        {/* 评论数量 */}
        {theme.post_count > 1 && (
          <div className="mt-1 text-xs text-gray-500 flex items-center">
            <i className="fa fa-comment-o mr-1"></i>
            {theme.post_count-1} 
          </div>
        )}
    </div>
    </div>
  );
};

export default PostCard;
