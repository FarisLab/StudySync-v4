'use client';

import { useState, useCallback } from 'react';

interface ToastOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error';
  duration?: number;
}

export function useToast() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');

  const showToast = useCallback(({ message, type = 'success' }: ToastOptions) => {
    setMessage(message);
    setType(type);
    setShow(true);
  }, []);

  const hideToast = useCallback(() => {
    setShow(false);
  }, []);

  return {
    show,
    message,
    type,
    showToast,
    hideToast,
  };
}
