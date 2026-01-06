import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface NotificationToastProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
}

export const NotificationToast = ({ message, type, isVisible }: NotificationToastProps) => {
  return (
    <div
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-3 px-6 py-4 rounded-xl",
        "glass border transition-all duration-300",
        type === 'success' 
          ? "border-primary/50 neon-glow" 
          : "border-destructive/50",
        isVisible 
          ? "opacity-100 translate-y-0" 
          : "opacity-0 -translate-y-4 pointer-events-none"
      )}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-6 h-6 text-primary" />
      ) : (
        <XCircle className="w-6 h-6 text-destructive" />
      )}
      <span className={cn(
        "font-medium",
        type === 'success' ? "text-primary" : "text-destructive"
      )}>
        {message}
      </span>
    </div>
  );
};
