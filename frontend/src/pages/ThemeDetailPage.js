import { useState, useEffect,useCallback } from 'react';
import { useParams} from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PostList from '../components/posts/PostList';
import PostTree from '../components/posts/PostTree';

const ThemeDetailPage = () => {
  const { id } = useParams();
  const [postId, setPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(null);
  
  // 获取帖子详情
  const fetchPost = useCallback( async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/themes/${id}/`);
      setTheme(response.data);

      const firstPost = response.data.first_post;
      setPostId(firstPost);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('加载帖子失败');
    } finally {
      setLoading(false);
    }
  },[id]);
  
  useEffect(() => {
    fetchPost();
  }, [id,fetchPost]);
  
  if (loading) {
    return <div>Loading...</div>;
  }
  if (theme.theme_type === 'discussion') {
    return (
      <div className="container w-full">
        <PostList theme={theme} postId={postId}/>
      </div>
    );
  }
  else {
    return (
      <div className="container w-full">
        <PostTree theme={theme} postId={postId} />
      </div>
    );
  }
};

export default ThemeDetailPage;
