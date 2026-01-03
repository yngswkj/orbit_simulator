import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

interface ToastProviderProps {
    children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {createPortal(
                <div style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    zIndex: 9999,
                    pointerEvents: 'none' // Allow clicking through the container area
                }}>
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            style={{
                                pointerEvents: 'auto', // Re-enable clicks for the toast itself
                                background: 'rgba(20, 20, 30, 0.9)',
                                backdropFilter: 'blur(12px)',
                                border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.3)' :
                                        toast.type === 'error' ? 'rgba(239, 68, 68, 0.3)' :
                                            'rgba(59, 130, 246, 0.3)'
                                    }`,
                                borderRadius: '8px',
                                padding: '12px 16px',
                                minWidth: '300px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                color: 'white',
                                fontSize: '0.9rem',
                                animation: 'slideIn 0.3s ease-out forwards',
                                transform: 'translateX(0)',
                                opacity: 1,
                            }}
                        >
                            <div style={{
                                color: toast.type === 'success' ? '#10b981' :
                                    toast.type === 'error' ? '#ef4444' :
                                        '#3b82f6',
                                display: 'flex', alignItems: 'center'
                            }}>
                                {toast.type === 'success' && <CheckCircle2 size={18} />}
                                {toast.type === 'error' && <AlertCircle size={18} />}
                                {toast.type === 'info' && <Info size={18} />}
                            </div>
                            <span style={{ flex: 1 }}>{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.4)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>,
                document.body
            )}
            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </ToastContext.Provider>
    );
};
