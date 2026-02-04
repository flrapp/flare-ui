import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/shared/lib/toast';
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
import { useDeleteProject } from '@/entities/project/model/useProjects';
import type { ProjectDetail, ProblemDetails } from '@/shared/types';
import { AlertCircle } from 'lucide-react';

interface DeleteProjectDialogProps {
  project: ProjectDetail;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function DeleteProjectDialog({
  project,
  open: controlledOpen,
  onOpenChange,
  children,
}: DeleteProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const navigate = useNavigate();
  const deleteProject = useDeleteProject();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const isConfirmValid = confirmName === project.name;

  const handleDelete = async () => {
    if (!isConfirmValid) return;

    try {
      await deleteProject.mutateAsync(project.id);
      toast.success('project', 'deleted');
      setOpen(false);
      setConfirmName('');
      navigate('/projects');
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('project', 'delete', problemDetails?.detail ?? problemDetails?.title ?? undefined);
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
            Delete Project
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the project and all
            associated data including scopes, feature flags, and user permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">The following will be deleted:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>All feature flags and their configurations</li>
              <li>All scopes and environments</li>
              <li>All user permissions for this project</li>
              <li>Project API key and access</li>
            </ul>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Type <code className="bg-muted px-1 py-0.5 rounded">{project.name}</code> to
              confirm:
            </label>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={project.name}
              className={confirmName && !isConfirmValid ? 'border-destructive' : ''}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={deleteProject.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || deleteProject.isPending}
          >
            {deleteProject.isPending ? 'Deleting...' : 'Delete Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
