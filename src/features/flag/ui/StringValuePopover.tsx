import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useUpdateFeatureFlagValue } from '@/entities/flag';
import { FeatureFlagType } from '@/shared/types/entities';
import { toast } from '@/shared/lib/toast';
import type { ProblemDetails } from '@/shared/types/auth';

interface StringValuePopoverProps {
  flagId: string;
  projectId: string;
  scopeId: string;
  currentValue: string | null | undefined;
}

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max) + '…';
}

export function StringValuePopover({ flagId, projectId, scopeId, currentValue }: StringValuePopoverProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const updateValue = useUpdateFeatureFlagValue();

  const display = currentValue != null ? truncate(currentValue, 16) : '—';

  const handleOpen = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPanelPos({ top: rect.bottom + 4, left: rect.left + rect.width / 2 });
    setInputValue(currentValue ?? '');
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleConfirm = async () => {
    try {
      await updateValue.mutateAsync({
        flagId,
        projectId,
        data: { scopeId, type: FeatureFlagType.String, stringValue: inputValue },
      });
      toast.success('flag value', 'updated');
      setOpen(false);
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
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
        className="inline-block font-mono text-xs bg-muted rounded px-1.5 py-0.5 cursor-pointer hover:bg-accent max-w-[120px] truncate transition-colors"
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
            className="bg-card border rounded-lg shadow-xl p-3 w-56"
          >
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter string value"
              className="text-sm font-mono"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirm();
                if (e.key === 'Escape') handleClose();
              }}
            />
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
