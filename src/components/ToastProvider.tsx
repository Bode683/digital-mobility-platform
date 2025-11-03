import React from 'react';
import Toast from 'react-native-toast-message';

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toast />
    </>
  );
}

export const showToast = (type: 'success' | 'error' | 'info', text1: string, text2?: string) => {
  Toast.show({
    type: type,
    text1: text1,
    text2: text2,
    position: 'bottom',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 30,
    bottomOffset: 40,
  });
};