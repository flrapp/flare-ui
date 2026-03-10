import { useState } from 'react';
import { toast } from '@/shared/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { useAddSegmentMembers } from '@/entities/segment';
import type { ProblemDetails } from '@/shared/types/auth';

interface AddMembersModalProps {
  segmentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMembersModal({ segmentId, open, onOpenChange }: AddMembersModalProps) {
  const [value, setValue] = useState('');
  const addMembers = useAddSegmentMembers();

  const handleSubmit = async () => {
    const targetingKeys = value
      .split('\n')
      .map((k) => k.trim())
      .filter(Boolean);

    if (targetingKeys.length === 0) {
      toast.info('Enter at least one targeting key.');
      return;
    }

    try {
      await addMembers.mutateAsync({ segmentId, targetingKeys });
      toast.success('members', 'added');
      setValue('');
      onOpenChange(false);
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('members', 'add', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) setValue(''); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>
            Enter one targeting key per line. Existing keys will be ignored.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="targeting-keys">Targeting Keys</Label>
          <Textarea
            id="targeting-keys"
            placeholder={'user-123\nuser-456\nuser-789'}
            rows={8}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => { setValue(''); onOpenChange(false); }}
            disabled={addMembers.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={addMembers.isPending}>
            {addMembers.isPending ? 'Adding...' : 'Add Members'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
