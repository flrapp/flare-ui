import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useDeleteFeatureFlag } from '@/entities/flag';
import type { FeatureFlag, ProblemDetails } from '@/shared/types';
import { AlertCircle } from 'lucide-react';

interface DeleteFeatureFlagDialogProps {
  flag: FeatureFlag;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function DeleteFeatureFlagDialog({
  flag,
  open: controlledOpen,
  onOpenChange,
  children,
}: DeleteFeatureFlagDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const deleteFlag = useDeleteFeatureFlag();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const isConfirmValid = confirmName === flag.name;

  const handleDelete = async () => {
    if (!isConfirmValid) return;

    try {
      await deleteFlag.mutateAsync(flag.id);
      toast.success('Feature flag deleted successfully');
      setOpen(false);
      setConfirmName('');
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error(
        problemDetails?.detail || problemDetails?.title || 'Failed to delete feature flag'
      );
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setConfirmName('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Delete Feature Flag
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the feature flag and all
            associated data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">The following will be deleted:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>Feature flag: {flag.name}</li>
              <li>Alias: {flag.key}</li>
              <li>All flag values across all scopes ({flag.values.length} scopes)</li>
            </ul>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Type <code className="bg-muted px-1 py-0.5 rounded">{flag.name}</code> to confirm:
            </label>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={flag.name}
              className={confirmName && !isConfirmValid ? 'border-destructive' : ''}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={deleteFlag.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || deleteFlag.isPending}
          >
            {deleteFlag.isPending ? 'Deleting...' : 'Delete Flag'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
