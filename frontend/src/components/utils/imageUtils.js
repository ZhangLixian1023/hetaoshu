import { toast } from 'react-toastify';

/**
 * 处理图片上传的通用函数
 * @param {Event} e - 文件输入事件
 * @param {Function} setImages - 设置图片状态的函数
 * @param {Array} existingImages - 已有的图片数组（可选）
 * @param {number} maxImages - 最大允许上传的图片数量
 */
export const handleImageChange = (e, setImages, existingImages = []) => {
  const maxImages = 10;
  const selectedImages = Array.from(e.target.files);
  const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB
  
  // 限制最多上传图片数量
  if (selectedImages.length + existingImages.length > maxImages) {
    toast.error(`最多只能上传${maxImages}张图片`);
    return;
  }
  
  // 检查是否有图片超过30MB
  for (let i = 0; i < selectedImages.length; i++) {
    if (selectedImages[i].size > MAX_FILE_SIZE) {
      toast.error(`第${i+1}张图片超过30MB大小限制`);
      return;
    }
  }
  
  // 将新选择的图片添加到现有图片数组中，而不是替换
  setImages(prevImages => [...prevImages, ...selectedImages]);
};

export default handleImageChange;