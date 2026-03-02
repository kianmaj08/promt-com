'use client';

import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      style: {
        background: 'var(--color-bg-card)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      },
      iconTheme: { primary: '#F5C518', secondary: '#0a0a0a' },
    }),

  error: (message: string) =>
    toast.error(message, {
      style: {
        background: 'var(--color-bg-card)',
        color: 'var(--color-text)',
        border: '1px solid #ef4444',
      },
    }),

  loading: (message: string) =>
    toast.loading(message, {
      style: {
        background: 'var(--color-bg-card)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      },
    }),

  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) =>
    toast.promise(promise, messages, {
      style: {
        background: 'var(--color-bg-card)',
        color: 'var(--color-text)',
        border: '1px solid var(--color-border)',
      },
      success: {
        iconTheme: { primary: '#F5C518', secondary: '#0a0a0a' },
      },
    }),

  dismiss: toast.dismiss,
};

export { toast };
export default showToast;
