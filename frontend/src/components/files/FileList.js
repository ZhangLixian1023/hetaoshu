import React from 'react';
import { toast } from 'react-toastify';

const FileList = ({ files, currentCategory, currentSubCategory }) => {
  const handleDownload = (file) => {
    // 在实际应用中，这里应该处理文件下载逻辑
    toast.info('文件下载功能待实现');
  };

  const handleLinkClick = (file) => {
    // 在实际应用中，这里应该处理链接点击逻辑
    toast.info('链接打开功能待实现');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {files.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          暂无文件
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上传人</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">上传时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件/链接描述</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {file.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {file.time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    {file.type === 'file' ? (
                      <i className="fa fa-file-text-o text-blue-500 mr-2"></i>
                    ) : (
                      <i className="fa fa-link text-green-500 mr-2"></i>
                    )}
                    {file.description}
                    {file.size && <span className="ml-2 text-xs text-gray-500">({file.size})</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {file.type === 'file' ? (
                    <button 
                      onClick={() => handleDownload(file)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <i className="fa fa-download"></i> 下载
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleLinkClick(file)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <i className="fa fa-external-link"></i> 打开
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FileList;