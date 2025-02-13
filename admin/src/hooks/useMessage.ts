import { message } from 'antd';
import { useCallback } from 'react';

export const useMessage = () => {
  const success = useCallback((content: string) => {
    message.success(content);
  }, []);

  const error = useCallback((content: string) => {
    message.error(content);
  }, []);

  const warning = useCallback((content: string) => {
    message.warning(content);
  }, []);

  const info = useCallback((content: string) => {
    message.info(content);
  }, []);

  return {
    success,
    error,
    warning,
    info,
  };
};

export default useMessage;
