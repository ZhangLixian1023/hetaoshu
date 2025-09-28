import React from 'react';

const CategoryTabs = ({ activeTab, setActiveTab, activeCourse, setActiveCourse, courseCategories }) => {
  const mainCategories = [
    { id: 'courses', name: '课程' },
    { id: 'public', name: '公共' },
    { id: 'other', name: '其他' }
  ];

  return (
    <div className="mb-8">
      {/* 主分类标签 */}
      <div className="flex border-b border-gray-200 mb-4">
        {mainCategories.map(category => (
          <button
            key={category.id}
            className={`px-6 py-3 font-medium ${activeTab === category.id ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* 课程子分类标签 */}
      {activeTab === 'courses' && (
        <div className="flex flex-wrap gap-2">
          {courseCategories.map(course => (
            <button
              key={course.id}
              className={`px-4 py-2 rounded-md text-sm ${activeCourse === course.id ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              onClick={() => setActiveCourse(course.id)}
            >
              {course.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryTabs;