import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const toastVariants = {
  initial: { opacity: 0, y: 50, scale: 0.3 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
};

const toastTypes = {
  success: {
    icon: CheckCircle,
    className: "bg-green-50 border-green-200 text-green-800",
    iconClassName: "text-green-500"
  },
  error: {
    icon: AlertCircle,
    className: "bg-red-50 border-red-200 text-red-800",
    iconClassName: "text-red-500"
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-800",
    iconClassName: "text-yellow-500"
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-800",
    iconClassName: "text-blue-500"
  }
};

const AdvancedToast = ({ 
  toast, 
  type = 'info', 
  title, 
  description, 
  duration = 5000,
  onClose,
  className,
  ...props 
}) => {
  const toastConfig = toastTypes[type] || toastTypes.info;
  const Icon = toastConfig.icon;

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <motion.div
      variants={toastVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={cn(
        "relative flex w-full max-w-sm items-start space-x-3 rounded-lg border p-4 shadow-lg",
        toastConfig.className,
        className
      )}
      {...props}
    >
      {/* Ícone */}
      <div className="flex-shrink-0">
        <Icon className={cn("h-5 w-5", toastConfig.iconClassName)} />
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-medium leading-5">
            {title}
          </p>
        )}
        {description && (
          <p className="mt-1 text-sm leading-4 opacity-90">
            {description}
          </p>
        )}
      </div>

      {/* Botão de fechar */}
      <button
        onClick={onClose}
        className="flex-shrink-0 rounded-md p-1 transition-colors hover:bg-black/10"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Barra de progresso */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-current opacity-20"
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      )}
    </motion.div>
  );
};

// Hook para usar o toast avançado
export const useAdvancedToast = () => {
  const { toast } = useToast();

  return {
    success: (title, description, options = {}) => 
      toast({
        title,
        description,
        type: 'success',
        ...options
      }),
    
    error: (title, description, options = {}) => 
      toast({
        title,
        description,
        type: 'error',
        ...options
      }),
    
    warning: (title, description, options = {}) => 
      toast({
        title,
        description,
        type: 'warning',
        ...options
      }),
    
    info: (title, description, options = {}) => 
      toast({
        title,
        description,
        type: 'info',
        ...options
      }),
    
    // Toast com ação
    action: (title, description, action, options = {}) => 
      toast({
        title,
        description,
        action: (
          <button
            onClick={action.onClick}
            className="bg-white text-black px-3 py-1 rounded text-sm font-medium hover:bg-gray-100"
          >
            {action.label}
          </button>
        ),
        ...options
      }),
    
    // Toast com progresso
    progress: (title, description, progress, options = {}) => 
      toast({
        title,
        description,
        duration: Infinity,
        action: (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        ),
        ...options
      })
  };
};

// Container de toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <AdvancedToast
            key={toast.id}
            type={toast.type}
            title={toast.title}
            description={toast.description}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
            action={toast.action}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedToast; 