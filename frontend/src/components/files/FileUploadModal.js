import React, { useState } from 'react';
import { toast } from 'react-toastify';

const FileUploadModal = ({ isOpen, onClose, onSuccess, uploadType, user, currentCategory, currentSubCategory }) => {
  const [description, setDescription] = useState('');
  const [details, setDetails] = useState('');
  const [file, setFile] = useState(null);
  const [link, setLink] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_DESCRIPTION_LENGTH = 20;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        setErrors(prev => ({ ...prev, file: '文件大小不能超过50MB' }));
        setFile(null);
      } else {
        setErrors(prev => ({ ...prev, file: '' }));
        setFile(selectedFile);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // 验证描述
    if (!description.trim()) {
      newErrors.description = '描述不能为空';
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `描述不能超过${MAX_DESCRIPTION_LENGTH}个字符`;
    }
    
    // 根据上传类型验证
    if (uploadType === 'file') {
      if (!file) {
        newErrors.file = '请选择文件';
      }
    } else {
      if (!link.trim()) {
        newErrors.link = '请输入链接';
      } else {
        try {
          new URL(link);
        } catch (e) {
          newErrors.link = '请输入有效的URL';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 模拟文件上传过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 构造文件数据
      const fileData = {
        description,
        details,
        type: uploadType,
        category: currentCategory,
        subCategory: currentSubCategory,
        user: user?.name || '匿名用户',
        uploadTime: new Date().toLocaleString('zh-CN'),
      };
      
      if (uploadType === 'file') {
        fileData.fileName = file.name;
        fileData.fileSize = formatFileSize(file.size);
      } else {
        fileData.link = link;
      }
      
      onSuccess(fileData);
      
      // 重置表单
      setDescription('');
      setDetails('');
      setFile(null);
      setLink('');
      setErrors({});
      
    } catch (error) {
      toast.error('上传失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {uploadType === 'file' ? '上传文件' : '添加链接'}
          </h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <i className="fa fa-times text-xl"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* 文件描述 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述 <span className="text-red-500">*</span> ({description.length}/{MAX_DESCRIPTION_LENGTH})
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="请输入描述（必填，20字符以内）"
              maxLength={MAX_DESCRIPTION_LENGTH}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>
          
          {/* 详细内容 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              详细内容（选填）
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入详细内容（选填）"
              rows="3"
            />
          </div>
          
          {/* 文件上传区域 */}
          {uploadType === 'file' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                选择文件 <span className="text-red-500">*</span>
              </label>
              <div className={`flex items-center justify-center w-full border-2 ${errors.file ? 'border-red-500' : 'border-dashed border-gray-300'} rounded-md p-4`}>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <i className="fa fa-cloud-upload text-3xl text-gray-400 mb-2"></i>
                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">点击上传</span> 或拖拽文件至此处</p>
                    <p className="text-xs text-gray-500">支持单个文件（最大50MB）</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              {errors.file && (
                <p className="mt-1 text-sm text-red-500">{errors.file}</p>
              )}
              {file && (
                <div className="mt-2 p-2 bg-gray-50 rounded-md flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
                  <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                </div>
              )}
            </div>
          )}
          
          {/* 链接输入区域 */}
          {uploadType === 'link' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                链接地址 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className={`w-full px-3 py-2 border ${errors.link ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="请输入链接地址（http:// 或 https:// 开头）"
              />
              {errors.link && (
                <p className="mt-1 text-sm text-red-500">{errors.link}</p>
              )}
            </div>
          )}
          
          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <i className="fa fa-spinner fa-spin mr-2"></i> 提交中...
                </span>
              ) : (
                '确认提交'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FileUploadModal;