import React, { useState, useEffect ,useRef,useCallback} from 'react';
import './xiaohongshu.css'; // 我们将在同一个文件中包含CSS
import PostCard from '../components/posts/PostCard';
import { toast } from 'react-toastify';
// 模拟帖子数据
const mockPosts = [
  {
    id: 1,
    imageUrl: 'http://192.168.33.23/media/post_images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20241210233945_MY7uPfc.jpg', // 高宽比 > 1.34
    title: '今天发现的超好用化妆技巧分享给大家～',
    likes: 2453,
    comments: 132,
    avatar: 'https://picsum.photos/seed/user1/100/100',
    username: '美妆达人'
  },
  
  {
    id: 7,
    imageUrl: 'https://picsum.photos/seed/post7/800/1100', // 高宽比 = 1.375
    title: '新手学做饭 | 简单又美味的家常菜',
    likes: 2103,
    comments: 156,
    avatar: 'https://picsum.photos/seed/user7/100/100',
    username: '厨房小白'
  },
  {
    id: 9,
    imageUrl: 'http://192.168.33.23/media/post_images/%E8%83%A1%E9%92%B0%E8%AF%BE%E8%A1%A8_xAPVgwC.png', // 高宽比 = 1
    title: '周末探店分享，这家咖啡馆的提拉米苏太绝了！',
    likes: 1892,
    comments: 87,
    avatar: 'https://picsum.photos/seed/user2/100/100',
    username: '美食探店家'
  },
  {
    id: 3,
    imageUrl: 'http://192.168.33.23/media/post_images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20250110115044.jpg', // 高宽比 = 1.5
    title: '夏季穿搭灵感，简单舒适又好看',
    likes: 3241,
    comments: 215,
    avatar: 'https://picsum.photos/seed/user3/100/100',
    username: '时尚博主'
  },
  {
    id: 8,
    imageUrl: 'https://picsum.photos/seed/post8/800/700', // 高宽比 = 0.875
    title: '周末去看的艺术展，拍照超好看',
    likes: 1876,
    comments: 76,
    avatar: 'https://picsum.photos/seed/user8/100/100',
    username: '艺术爱好者'
  },
  {
    id: 4,
    imageUrl: 'http://192.168.33.23/media/post_images/QQ%E5%9B%BE%E7%89%8720241216220037_rhdYM0F.jpeg', // 高宽比 = 0.75
    title: '居家健身打卡第30天，坚持就是胜利！',
    likes: 987,
    comments: 56,
    avatar: 'https://picsum.photos/seed/user4/100/100',
    username: '健身达人'
  },
  {
    id: 5,
    imageUrl: 'http://192.168.33.23/media/post_images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20241210233201_WMnQ6tW.jpg', // 高宽比 = 1.34
    title: '旅行vlog | 海边日出真的太美了',
    likes: 5643,
    comments: 321,
    avatar: 'https://picsum.photos/seed/user5/100/100',
    username: '旅行日记'
  },
  {
    id: 6,
    imageUrl: 'http://192.168.33.23/media/post_images/Screenshot_20250905_102052_VWVuawb.jpg', // 高宽比 = 1.125
    title: '分享我的读书笔记，这本书真的改变了我',
    likes: 1254,
    comments: 98,
    avatar: 'https://picsum.photos/seed/user6/100/100',
    username: '阅读爱好者'
  }
];

const XiaohongshuFeed = ({posts}) => {
  // 将帖子分为两列
  const column1 = posts.filter((_, index) => index % 2 === 0);
  const column2 = posts.filter((_, index) => index % 2 === 1);
 const [containerWidth, setContainerWidth] = useState(document.documentElement.clientWidth*0.47);

 // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(document.documentElement.clientWidth*0.47);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);


  return (
    <div className="xiaohongshu-feed">
      <div className="feed-columns">
        <div className="feed-column">
          {column1.map(post => (
            <PostCard key={post.id} post={post} containerWidth={containerWidth} />
          ))}
        </div>
        <div className="feed-column">
          {column2.map(post => (
            <PostCard key={post.id} post={post} containerWidth={containerWidth} />
          ))}
        </div>
      </div>
    </div>
  );
};

// const PostCard = ({ post, containerWidth }) => {
//    console.log(post)
//   const imageRatio = useRef(0.1);
//   const imageContainerRef = useRef(null); 
//   // 图片加载完成后计算宽高比
//   const handleImageLoad = (e) => {
//     const width = e.target.naturalWidth;
//     const height = e.target.naturalHeight;
//     const ratio = height / width; // 计算高宽比
//     // 设置图片容器高度
//     if (imageContainerRef.current) {
//       // 最大高宽比限制为1.34
//       const appliedRatio = Math.min(ratio, 1.34); 
//       imageRatio.current = appliedRatio;     
//      // 设置容器高度, 这只在图片初次加载时有效，窗口变化时就不会再设定了
//       imageContainerRef.current.style.height = `${containerWidth * imageRatio.current}px`;
//       imageContainerRef.current.style.width = `${containerWidth}px`;
//     }
//   };
// return (
//     <div className="post-card">
//       <div 
//         className="post-image-container" 
//         ref={imageContainerRef}
//         style={{width:`${containerWidth}px`,height:`${containerWidth * imageRatio.current}px`, margin: '0 auto' }} // 最大宽度不超过400px
//       >
//         <img 
//           src={post.first_image.image} 
//           alt={post.title} 
//           className="post-image"
//           onLoad={handleImageLoad}
//         />
//       </div>
      
//     </div>
//   );
// };

export default XiaohongshuFeed;