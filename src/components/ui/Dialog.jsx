import React from 'react';

export function Dialog({ open, onOpenChange, children }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50" 
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 max-h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ children, className = '', ...props }) {
  return (
    <div className={`relative bg-white rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = '', ...props }) {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = '', ...props }) {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h2>
  );
}