import React, { createContext, useState, useContext } from "react";
import toast from 'react-toastify';

// Toast Context
const ToastContext = createContext<{
  addToast: (message: string) => void;
}>({
  addToast: () => {},
});

export const useToast = () => useContext(ToastContext);

function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContext.Provider value={{ addToast: toast.error }}>
      {children}
    </ToastContext.Provider>
  );
}

export default ToastProvider;
