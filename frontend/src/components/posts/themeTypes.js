// 主题类型颜色配置字典
const themeTypes = {
  share: {
    borderColor: 'border-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    label: '分享'
  },
  discussion: {
    borderColor: 'border-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: '讨论'
  },
  ad: {
    borderColor: 'border-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    label: '广告'
  },
  notice: {
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    label: '通知'
  }
};

// 获取主题配置
export const getThemeConfig = (themeType) => {
  // 如果找不到对应的主题类型，默认返回通知主题
  return themeTypes[themeType] || themeTypes.notice;
};

export default themeTypes;