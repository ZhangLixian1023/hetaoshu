import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { handleImageChange } from '../components/utils/imageUtils';

const EditPostPage = () => {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('share'); // 'share' 或 'discussion'
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
        setPostType(post.post_type);
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
          post_type: postType,
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

  const handleDeleteExistingImage = async (imageId) => {
    try {
      //await axios.delete(`/posts/images/${imageId}/`);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('删除图片失败:', error);
      toast.error('删除图片失败，请稍后重试');
    }
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">编辑帖子</h1>
          <p className="text-gray-600 mt-2">修改你的帖子内容</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 帖子类型 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              帖子类型
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="postType"
                  value="share"
                  checked={postType === 'share'}
                  onChange={(e) => setPostType(e.target.value)}
                  className="form-radio h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">个人分享</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="postType"
                  value="discussion"
                  checked={postType === 'discussion'}
                  onChange={(e) => setPostType(e.target.value)}
                  className="form-radio h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-sm text-gray-700">话题讨论</span>
              </label>
            </div>
          </div>
          
          {/* 标题 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              标题
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入标题"
            />
          </div>
          
          {/* 内容 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              内容
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="请输入帖子内容..."
            ></textarea>
          </div>
          
          {/* 已有图片 */}
          {existingImages.length > 0 && (
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                已有图片
              </label>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative h-24 w-24 border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={image.image}
                      alt={image.id}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center"
                      onClick={() => handleDeleteExistingImage(image.id)}
                    >
                      <i className="fa fa-times text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* 图片上传 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              上传图片（可选，总共最多10张，30MB）
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={(e) => {
                  handleImageChange(e, setImages, existingImages);
                }}/>
              </label>
            {images.length > 0 && (
              <div className="mt-4">
                <div className="flex flex-wrap gap-2">
                  {images.map((image, index) => (
                    <div key={index} className="relative h-24 w-24 border border-gray-200 rounded-md overflow-hidden">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`预览 ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center"
                        onClick={() => {
                          const newImages = [...images];
                          newImages.splice(index, 1);
                          setImages(newImages);
                        }}
                      >
                        <i className="fa fa-times text-xs"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* 提交按钮 */}
          <div className="flex justify-end space-x-4">
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
                <span>保存修改</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;