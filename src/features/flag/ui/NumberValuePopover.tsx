import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useUpdateFeatureFlagValue } from '@/entities/flag';
import { FeatureFlagType } from '@/shared/types/entities';
import { toast } from '@/shared/lib/toast';
import type { ProblemDetails } from '@/shared/types/auth';

interface NumberValuePopoverProps {
  position: { top: number; left: number };
  flagId: string;
  projectId: string;
  scopeId: string;
  currentValue: number | null | undefined;
  onClose: () => void;
}

export function NumberValuePopover({ position, flagId, projectId, scopeId, currentValue, onClose }: NumberValuePopoverProps) {
  const [inputValue, setInputValue] = useState(currentValue != null ? String(currentValue) : '');
  const [error, setError] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const updateValue = useUpdateFeatureFlagValue();

  const handleConfirm = async () => {
    const trimmed = inputValue.trim();
    if (trimmed === '') {
      setError('Value is required');
      return;
    }
    const parsed = Number(trimmed);
    if (isNaN(parsed)) {
      setError('Must be a valid number');
      return;
    }

    try {
      await updateValue.mutateAsync({
        flagId,
        projectId,
        data: { scopeId, type: FeatureFlagType.Number, numberValue: parsed },
      });
      toast.success('flag value', 'updated');
      onCloseRef.current();
    } catch (err: any) {
      const pd = err.response?.data as ProblemDetails | undefined;
      toast.error('flag value', 'update', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  useEffect(() => {
    const handleMousedown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onCloseRef.current();
      }
    };
    document.addEventListener('mousedown', handleMousedown);
    return () => document.removeEventListener('mousedown', handleMousedown);
  }, []);

  return createPortal(
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: 'translateX(-50%)',
        zIndex: 9999,
      }}
      className="bg-card border rounded-lg shadow-xl p-3 w-44"
    >
      <Input
        type="number"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setError('');
        }}
        placeholder="0"
        className="text-sm"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleConfirm();
          if (e.key === 'Escape') onCloseRef.current();
        }}
      />
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      <div className="flex justify-end gap-1 mt-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => onCloseRef.current()}
          type="button"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-[hsl(var(--success))] hover:text-[hsl(var(--success))]"
          onClick={handleConfirm}
          disabled={updateValue.isPending}
          type="button"
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>,
    document.body
  );
}
