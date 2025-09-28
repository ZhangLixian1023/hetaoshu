import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FileUploadModal from '../components/files/FileUploadModal';
import FileList from '../components/files/FileList';
import CategoryTabs from '../components/files/CategoryTabs';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const FileServicePage = ({ user, handleLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [activeCourse, setActiveCourse] = useState('machine-learning');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'link'
  const [currentCategory, setCurrentCategory] = useState('courses');

  // 课程分类
  const courseCategories = [
    { id: 'machine-learning', name: '机器学习系统' },
    { id: 'deep-representation', name: '深度表征学习原理' },
    { id: 'nlp-llm', name: '自然语言处理与大语言模型' },
    { id: 'optimization', name: '最优化方法与原理' },
    { id: 'ai-math', name: '人工智能数学原理' },
    { id: 'numerical-analysis', name: '数值分析' },
    { id: '3d-vision', name: '三维视觉' },
    { id: 'high-performance', name: '高性能计算' },
    { id: 'ideological', name: '思政课' },
    { id: 'deep-learning-basic', name: '深度学习基础' },
    { id: 'advanced-ml', name: '进阶机器学习' }
  ];

  // 模拟文件数据
  const mockFiles = {
    courses: {
      'machine-learning': [
        { id: 1, name: '张三', time: '2024-09-01 10:30', description: '机器学习系统讲义第一部分', type: 'file', size: '2.5MB' },
        { id: 2, name: '李四', time: '2024-09-02 14:15', description: '机器学习系统作业参考答案', type: 'file', size: '1.8MB' },
      ],
      'deep-representation': [
        { id: 3, name: '王五', time: '2024-09-03 09:45', description: '深度表征学习原理课件', type: 'file', size: '3.2MB' },
      ],
      // 其他课程的模拟数据
      'nlp-llm': [
        { id: 4, name: '赵六', time: '2024-09-04 11:20', description: '自然语言处理基础概念链接', type: 'link' }
      ]
    },
    public: [
      { id: 5, name: '管理员', time: '2024-09-05 16:40', description: '公共资源汇总', type: 'file', size: '5.7MB' },
    ],
    other: [
      { id: 6, name: '用户123', time: '2024-09-06 13:10', description: '其他资源分享', type: 'file', size: '0.9MB' },
    ]
  };

  const handleUploadClick = (type) => {
    setUploadType(type);
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    setShowUploadModal(false);
  };

  const handleUploadSuccess = (fileData) => {
    // 这里应该处理文件上传成功后的逻辑，例如刷新文件列表
    toast.success('文件上传成功');
    setShowUploadModal(false);
    // 在实际应用中，这里应该调用API刷新文件列表
  };

  const getCurrentFiles = () => {
    if (activeTab === 'courses') {
      return mockFiles.courses[activeCourse] || [];
    }
    return mockFiles[activeTab] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={handleLogout} />
      
      <div className="container mx-auto max-w-[1200px] px-4 py-20">
        <h1 className="text-3xl font-bold mb-8 text-center">公共文件和链接服务</h1>
        
        <div className="mb-6 flex justify-end">
          {user && (
            <div className="flex space-x-2">
              <button 
                onClick={() => handleUploadClick('file')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <i className="fa fa-upload mr-1"></i> 上传文件
              </button>
              <button 
                onClick={() => handleUploadClick('link')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <i className="fa fa-link mr-1"></i> 添加链接
              </button>
            </div>
          )}
        </div>
        
        <CategoryTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          activeCourse={activeCourse} 
          setActiveCourse={setActiveCourse} 
          courseCategories={courseCategories}
        />
        
        <FileList 
          files={getCurrentFiles()} 
          currentCategory={activeTab}
          currentSubCategory={activeTab === 'courses' ? activeCourse : null}
        />
      </div>
      
      {showUploadModal && (
        <FileUploadModal 
          isOpen={showUploadModal} 
          onClose={handleCloseModal} 
          onSuccess={handleUploadSuccess}
          uploadType={uploadType}
          user={user}
          currentCategory={activeTab}
          currentSubCategory={activeTab === 'courses' ? activeCourse : null}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default FileServicePage;