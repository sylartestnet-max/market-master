import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Ürün ara..." }: SearchBarProps) => {
  return (
    <div className={cn(
      "relative flex items-center gap-2 px-4 py-2 rounded-lg",
      "bg-muted/30 border border-border/50",
      "focus-within:border-primary/50 focus-within:neon-glow",
      "transition-all duration-300"
    )}>
      <Search className="w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 bg-transparent outline-none text-foreground",
          "placeholder:text-muted-foreground/60"
        )}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
