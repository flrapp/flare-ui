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
  flagId: string;
  projectId: string;
  scopeId: string;
  currentValue: number | null | undefined;
}

export function NumberValuePopover({ flagId, projectId, scopeId, currentValue }: NumberValuePopoverProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const updateValue = useUpdateFeatureFlagValue();

  const display = currentValue ?? '—';

  const handleOpen = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelPos({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
    setInputValue(currentValue != null ? String(currentValue) : '');
    setError('');
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

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
      setOpen(false);
    } catch (err: any) {
      const pd = err.response?.data as ProblemDetails | undefined;
      toast.error('flag value', 'update', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handleMousedown = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleMousedown);
    return () => document.removeEventListener('mousedown', handleMousedown);
  }, [open]);

  return (
    <div className="inline-flex justify-center">
      <button
        ref={triggerRef}
        onClick={handleOpen}
        className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors px-1"
      >
        {display}
      </button>

      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: panelPos.top,
              left: panelPos.left,
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
                if (e.key === 'Escape') handleClose();
              }}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
            <div className="flex justify-end gap-1 mt-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={handleClose}
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
        )}
    </div>
  );
}
