import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number | null | undefined;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  readOnly?: boolean;
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' };

export function StarRating({ value, onChange, size = 'md', readOnly = false }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const displayValue = hover ?? value ?? 0;
  const starSize = sizeMap[size];

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(null)}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${!readOnly && 'hover:scale-110'}`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={`${starSize} ${
              star <= displayValue ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
