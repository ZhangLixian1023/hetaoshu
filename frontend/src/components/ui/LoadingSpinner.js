const LoadingSpinner = ({ size = 'md' }) => {
  // 根据size设置样式
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-5 w-5';
      case 'lg':
        return 'h-12 w-12';
      case 'xl':
        return 'h-16 w-16';
      default: // md
        return 'h-8 w-8';
    }
  };

  const getColorClass = () => {
    return 'border-blue-600 border-t-transparent';
  };

  return (
    <div className={`animate-spin rounded-full ${getSizeClass()} ${getColorClass()} border-4`} />
  );
};

export default LoadingSpinner;