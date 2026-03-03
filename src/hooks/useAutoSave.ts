import { useEffect, useRef } from 'react';

export const useAutoSave = (callback: () => void | Promise<void>, delay = 1000) => {
  const timer = useRef<number | null>(null);

  const trigger = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void callback();
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return { trigger };
};
