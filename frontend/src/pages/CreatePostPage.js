import axios from 'axios';
import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { handleImageChange } from '../components/utils/imageUtils';

/**
 * 模仿小红书的创建帖子页面
 */
const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 处理帖子提交
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

    // 发帖时，发给后端的theme接口。后端会创建一个theme，同时创建一个post作为它的第一个孩子
    setLoading(true);
    try {
      // 直接使用axios.postForm上传文件
      const data = {
        'title': title,
        'content': content,
        'theme_type': 'share', // 默认使用分享类型，由前序页面设置
        'images': images,
        'description': '',
      };
      
      const response = await axios.postForm('/themes/', data);
      
      toast.success('帖子发布成功');
      // 跳转到帖子详情页
      navigate(`/themes/${response.data.id}`);
    } catch (error) {
      console.error('发布帖子失败:', error);
      toast.error(error.response?.data?.error || '发布帖子失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 处理图片点击 - 选中图片
  const handleImageClick = (index, e) => {
    e.stopPropagation(); // 阻止事件冒泡，避免触发全局取消选中
    setSelectedImage(selectedImage===index? null:index);
  };

  // 处理全局点击 - 取消选中
  const handleGlobalClick = () => {
    setSelectedImage(null);
  };

  // 处理竖线点击 - 插入图片
  const handleLineClick = (insertPosition, e) => {
    e.stopPropagation(); // 阻止事件冒泡
    if (selectedImage === null) return;

    const newImages = [...images];
    const [imageToMove] = newImages.splice(selectedImage, 1);
    
    // 计算实际插入位置
    let actualPosition = insertPosition;
    if (selectedImage < insertPosition) {
      // 如果被选中的图片在插入位置的左边，则实际插入位置减1
      actualPosition = insertPosition - 1;
    }
    
    newImages.splice(actualPosition, 0, imageToMove);
    setImages(newImages);
    setSelectedImage(null); // 插入后取消选中
  };

  // 删除图片
  const handleDeleteImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    if (selectedImage !== null && selectedImage >= index) {
      setSelectedImage(null);
    }
  };

  // 在新标签页打开图片
  const openImageInNewTab = (image, e) => {
    e.stopPropagation();
    const imageUrl = URL.createObjectURL(image);
    window.open(imageUrl, '_blank');
  };

  useEffect(() => {
    // 添加全局点击事件监听器
    document.addEventListener('click', handleGlobalClick);
    // 清理函数
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-4 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* 页面标题 */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-500"
          >
            取消
          </button>
          <h1 className="text-lg font-medium text-gray-900">发布新帖子</h1>
          <span className="w-10"></span> {/* 占位元素，保持标题居中 */}
        </div>

        <form onSubmit={handleSubmit} className="bg-white">
          {/* 图片上传与预览区 - 置顶 */}
          <div className="p-4 border-b border-gray-200">
            {/* 添加图片按钮 - 单独一行 */}
            {images.length < 9 && (
              <div 
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 mb-3"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa fa-plus text-gray-400 text-xl mb-1"></i>
                <span className="text-xs text-gray-400">添加图片</span>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="hidden"
                  onChange={(e) => handleImageChange(e, setImages)}
                />
              </div>
            )}
            
            {/* 预览已上传的图片 - 水平可滚动容器 */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 hide-scrollbar">
              <div className="flex min-w-max">
                {/* 第一张图片左侧的竖线 - 只在有选中图片且当前选中图片不是第一张时显示 */}
                {selectedImage !== null && selectedImage !== 0 && (
                  <div
                    className={`h-24 w-2 my-auto bg-blue-300 cursor-pointer hover:bg-blue-500`}
                    onClick={(e) => handleLineClick(0, e)}
                    title="点击插入图片"
                  ></div>
                )}
                
                {images.map((image, index) => (
                  <>
                    <div
                      key={`image-${index}`}
                      className={'w-24 h-24 relative aspect-square border border-gray-200 rounded-md overflow-hidden transition-all duration-200'}
                    onClick={(e) => handleImageClick(index, e)}
                    >
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`图片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* 选中时显示的蒙版和按钮 */}
                      {selectedImage === index && (
                        <>
                        <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-start justify-between p-1">
                          {/* 右上角放大按钮 */}
                          <button
                            type="button"
                            className="bg-white bg-opacity-80 text-blue-600 rounded-full h-5 w-5 flex items-center justify-center hover:bg-opacity-100"
                            onClick={(e) => openImageInNewTab(image, e)}
                            title="在新标签页中查看"
                          >
                            <i className="fa fa-search-plus text-xs"></i>
                          </button>
                        </div>
                           {/* 右下角删除按钮 */}
                      <button
                        type="button"
                        className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white rounded-full h-5 w-5 flex items-center justify-center hover:bg-opacity-70"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(index);
                        }}
                        title="删除图片"
                      >
                        <i className="fa fa-trash text-xs"></i>
                      </button>
                        </>
                        

                      )}
                      
                      
                    </div>
                    
                    {/* 图片之间的竖线 - 只在有选中图片且不是选中图片的左右两侧时显示 */}
                    {selectedImage !== null && index !== selectedImage && index !== selectedImage - 1 && (
                      <div
                        className={`h-24 w-2 my-auto bg-blue-300 cursor-pointer hover:bg-blue-500`}
                        onClick={(e) => handleLineClick(index + 1, e)}
                        title="点击插入图片"
                      ></div>
                    )}
                  </>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">最多上传9张图片（点击图片后再点击蓝线可移到该处）</p>
          </div>
          
          {/* 标题输入区 */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-0 py-2 text-lg border-0 focus:outline-none placeholder-gray-300"
              placeholder="添加标题..."
              maxLength={50}
            />
          </div>
          
          {/* 内容输入区 */}
          <div className="p-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              className="w-full px-0 py-2 border-0 focus:outline-none resize-none placeholder-gray-300"
              placeholder="添加正文..."
            ></textarea>
          </div>
        </form>
        
        {/* 底部发布按钮 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-end">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || !title.trim() || !content.trim()}
            className={`px-8 py-2 rounded-full text-sm font-medium transition-colors ${loading || !title.trim() || !content.trim() ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
          >
            {loading ? (
              <div className="flex items-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2">发布中...</span>
              </div>
            ) : (
              <span>发布</span>
            )}
          </button>
        </div>
        

      </div>
    </div>
  );
};

export default CreatePostPage;