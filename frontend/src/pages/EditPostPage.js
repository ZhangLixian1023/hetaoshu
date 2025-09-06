import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { handleImageChange } from '../components/utils/imageUtils';
import ImageCarousel from '../components/posts/ImageCarousel';
import { getThemeConfig } from '../components/posts/themeTypes';

const EditPostPage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [themeType, setThemeType] = useState('share'); // 'share', 'discussion', 'ad', 'notification'
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // 已有的图片
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // 获取帖子详情
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/posts/${id}/`);
        const post = response.data;
        setTitle(post.title);
        setContent(post.content);
        setThemeType(post.theme_type); 
        setExistingImages(post.images || []);
      } catch (error) {
        console.error('获取帖子详情失败:', error);
        toast.error('获取帖子详情失败，请稍后重试');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, navigate]);

  // 帖子类型样式
  const { borderColor, bgColor, label, textColor } = getThemeConfig(themeType);
  const headerBgColor = bgColor;
  const typeText = label;
  const typeColor = textColor;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 验证表单
    if (!title.trim()) {
      toast.error('请输入标题');
      return;
    }
    
    if (!content.trim()) {
      toast.error('请输入内容');
      return;
    }

    setSubmitting(true);
    try {
      await axios.putForm(`/posts/${id}/`,
        {
          title,
          content,
          theme_type: themeType,
          images: images,
          keep_image_ids: existingImages.map(img => img.id),
        }
      );
      toast.success('帖子更新成功');
      // 跳转到帖子详情页
      navigate(`/posts/${id}`);
    } catch (error) {
      console.error('更新帖子失败:', error);
      toast.error(error.response?.data?.error || '更新帖子失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 准备用于ImageCarousel的图片数据
  const getImagesForCarousel = () => {
    // 合并现有图片和新上传的图片用于预览
    const allImages = [...existingImages];
    const newImagesFormatted = images.map((image, index) => ({
      id: `new-${index}`,
      image: URL.createObjectURL(image)
    }));
    return [...allImages, ...newImagesFormatted];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 border-[1px] ${borderColor}`}>
      <div className={`p-4 ${headerBgColor}`}>
        <h2 className={`text-xl font-semibold ${typeColor}`}>{typeText}</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 bg-white">
        {/* 表单内容 - 标题、内容、图片上传等 */}
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">标题</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="请输入标题"
            maxLength={100}
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="themeType" className="block text-sm font-medium text-gray-700 mb-1">主题类型</label>
          <select
            id="themeType"
            value={themeType}
            onChange={(e) => setThemeType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="share">分享</option>
            <option value="discussion">讨论</option>
            <option value="ad">广告</option>
            <option value="notification">通知</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">内容</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[200px]"
            placeholder="请输入内容"
          />
        </div>
        
        {/* 图片上传部分 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">图片</label>
          
          {/* 已有的图片和新上传的图片预览 */}
          {getImagesForCarousel().length > 0 && (
            <div className="mb-4">
              <ImageCarousel images={getImagesForCarousel()} alt={title} />
            </div>
          )}
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleImageChange(e, setImages, existingImages)}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            取消
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {submitting ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">保存中...</span>
              </div>
            ) : (
              '保存'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPostPage;