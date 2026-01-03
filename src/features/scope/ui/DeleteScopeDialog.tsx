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
import { useDeleteScope } from '@/entities/scope/model/useScopes';
import type { Scope, ProblemDetails } from '@/shared/types';
import { AlertCircle } from 'lucide-react';

interface DeleteScopeDialogProps {
  scope: Scope;
  children?: React.ReactNode;
}

export function DeleteScopeDialog({ scope, children }: DeleteScopeDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const deleteScope = useDeleteScope();

  const isConfirmValid = confirmName === scope.name;

  const handleDelete = async () => {
    if (!isConfirmValid) return;

    try {
      await deleteScope.mutateAsync(scope.id);
      toast.success('Scope deleted successfully');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error(problemDetails?.detail || problemDetails?.title || 'Failed to delete scope');
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
      <DialogTrigger asChild>
        {children || <Button variant="destructive">Delete Scope</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Delete Scope
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the scope and all associated
            data.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">The following will be deleted:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>All feature flag values for this scope</li>
              <li>All scope-specific user permissions</li>
              <li>Scope configuration and settings</li>
            </ul>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Type <code className="bg-muted px-1 py-0.5 rounded">{scope.name}</code> to confirm:
            </label>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={scope.name}
              className={confirmName && !isConfirmValid ? 'border-destructive' : ''}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={deleteScope.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || deleteScope.isPending}
          >
            {deleteScope.isPending ? 'Deleting...' : 'Delete Scope'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
