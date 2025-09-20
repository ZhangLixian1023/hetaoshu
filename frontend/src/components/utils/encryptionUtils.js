import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import JSEncrypt from 'jsencrypt';

/**
 * 自定义Hook：用于获取和管理公钥
 * @returns {Object} 包含公钥和加载状态的对象
 */
export const usePublicKey = () => {
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPublicKey = async () => {
      if (publicKey) return; // 如果已有公钥，则不再获取
      
      setLoading(true);
      try {
        const response = await axios.get('/users/public-key/');
        setPublicKey(response.data.publicKey);
      } catch (error) {
        console.error('获取公钥失败:', error);
        toast.error('获取公钥失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicKey();
  }, [publicKey]);

  return { publicKey, loading };
};

/**
 * 使用JSEncrypt和公钥加密数据
 * @param {string} data - 需要加密的数据
 * @param {string} publicKey - RSA公钥
 * @returns {string|null} 加密后的数据，如果加密失败则返回null
 */
export const encryptWithPublicKey = (data, publicKey) => {
  try {
    if (!data || !publicKey) {
      console.error('加密数据或公钥为空');
      return null;
    }
    
    const encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    const encryptedData = encrypt.encrypt(data);
    
    if (!encryptedData) {
      console.error('加密失败');
      return null;
    }
    
    return encryptedData;
  } catch (error) {
    console.error('加密过程中发生错误:', error);
    return null;
  }
};

export default {
  usePublicKey,
  encryptWithPublicKey
};