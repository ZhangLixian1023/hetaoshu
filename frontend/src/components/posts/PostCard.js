import { useRef} from 'react';
import '../../pages/xiaohongshu.css'
import { getThemeConfig } from './themeTypes';

const PostCard = ({ post, containerWidth }) => {
  const imageRatio = useRef(1);
  const imageContainerRef = useRef(null); 
 // 图片加载完成后计算宽高比
  const handleImageLoad = (e) => {
    const width = e.target.naturalWidth;
    const height = e.target.naturalHeight;
    const ratio = height / width; // 计算高宽比
    // 设置图片容器高度
    if (imageContainerRef.current) {
      // 最大高宽比限制为1.34
      const appliedRatio = Math.min(ratio, 1.34); 
      imageRatio.current = appliedRatio;     
     // 设置容器高度, 这只在图片初次加载时有效，窗口变化时就不会再设定了
     imageContainerRef.current.style.width = `${containerWidth}px`;
     imageContainerRef.current.style.height = `${containerWidth * imageRatio.current}px`;
    }
  };

 
  // 使用主题类型配置获取边框颜色
  const { borderColor } = getThemeConfig(post.theme.theme_type);
  
  // 获取帖子内容的前20个字符作为摘要
  const getSummary = (content) => {
    return content ? content.substring(0, 20) : '';
  };

  return (
    <div className='post-card'>
      {/* 根据image_count决定显示图片还是摘要 */}
      {post.image_count > 0 && post.first_image ? (
        // 有图片时直接使用first_image
        <div className='post-image-container'  ref={imageContainerRef} style={{width:`${containerWidth}px`,height:`${containerWidth * imageRatio.current}px` }}>
       <img
          src={post.first_image.image} 
          alt={post.title}
          onLoad={handleImageLoad}
          className='post-image'
        />
        </div>
      ) : (
        // 没有图片时显示摘要
        <div className="post-image-container" style={{height:'100px'}}>
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
