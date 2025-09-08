import { useState, useRef, useEffect } from 'react';

const ImageCarousel = ({ images, alt = '' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState('auto');
  const containerRef = useRef(null);
  const [imageAspectRatios, setImageAspectRatios] = useState([]);

  // 预加载所有图片并获取它们的高宽比
  useEffect(() => {
    const loadImages = async () => {
      const ratios = [];
      
      for (const image of images) {
        await new Promise((resolve) => {
          const img = new Image();
          img.src = image.image;
          img.onload = () => {
            // 计算高宽比 (高度/宽度)
            const aspectRatio = img.naturalHeight / img.naturalWidth;
            ratios.push(aspectRatio);
            resolve();
          };
          // 处理图片加载失败的情况
          img.onerror = resolve;
        });
      }
      
      setImageAspectRatios(ratios);
    };

    loadImages();
  }, [images]);

  // 根据所有图片的最大高宽比计算容器高度
  useEffect(() => {
    if (imageAspectRatios.length > 0 && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      // 找到最大的高宽比
      const maxAspectRatio = Math.max(...imageAspectRatios);
      // 计算基于最大比例的图片高度
      const maxImageHeight = maxAspectRatio * containerWidth;
      // 计算允许的最大高度 (1.34倍宽度)
      const maxAllowedHeight = 1.34 * containerWidth;
      
      // 取两者中的较小值作为最终高度
      const finalHeight = Math.min(maxImageHeight, maxAllowedHeight);
      setContainerHeight(`${finalHeight}px`);
    }
  }, [imageAspectRatios]);
  
  // 处理容器高度变化
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.height = containerHeight;
    }
  }, [containerHeight]);
  
  // 如果没有图片或只有一张图片，不需要轮播
  if (!images || images.length === 0) {
    return null;
  }
  if (images.length === 1) {
    return (
   <div className="relative h-full pb-[75%] overflow-hidden" ref={containerRef}>
      {/* 图片容器 */}
      <div 
        className="absolute inset-0 flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
          <div key={images[0].id} className=" h-full w-full">
             <img 
          src={images[0].image} 
          alt={alt || 'Post image'}
          className="h-full  w-full object-contain "
        />
          </div>
      </div>
      </div>
    );
  }
  
  // 前进到下一张图片
  const nextImage = () => {
    if (currentIndex!==images.length-1){
      setCurrentIndex(currentIndex+1);
    }
  };
  
  // 后退到上一张图片
  const prevImage = () => {
    if (currentIndex!==0){
      setCurrentIndex(currentIndex-1);
    }
  };
  
  // 点击指示点跳转到对应图片
  const goToImage = (index) => {
    setCurrentIndex(index);
  };
  
  return (
    <div className="relative w-full pb-[75%] overflow-hidden">
      {/* 图片容器 */}
      <div 
        className="absolute inset-0 flex transition-transform duration-300 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={image.id} className=" h-full min-w-full">
            <img 
              src={image.image} 
              alt={`${alt} ${index + 1}`}
              className="h-full  object-contain w-full"
            />
          </div>
        ))}
      </div>
      
      {/* 左右切换按钮 */}
      <button
        onClick={prevImage}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
        aria-label="Previous image"
      >
        <i className="fa fa-chevron-left"></i>
      </button>
      
      <button
        onClick={nextImage}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
        aria-label="Next image"
      >
        <i className="fa fa-chevron-right"></i>
      </button>
      
      {/* 图片指示点 */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToImage(index)}
            className={`w-2 h-2 rounded-full transition-all ${currentIndex === index ? 'bg-white w-6' : 'bg-white bg-opacity-50'}`}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
      
      {/* 图片计数 */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

export default ImageCarousel;