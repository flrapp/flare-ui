import { useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { toast } from '@/shared/lib/toast';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { useSegmentMembers, useRemoveSegmentMember } from '@/entities/segment';
import type { SegmentMember } from '@/entities/segment';
import { AddMembersModal } from './AddMembersModal';
import type { ProblemDetails } from '@/shared/types/auth';

interface SegmentMembersSectionProps {
  segmentId: string;
  canManage: boolean;
}

function RemoveMemberButton({
  member,
  segmentId,
}: {
  member: SegmentMember;
  segmentId: string;
}) {
  const remove = useRemoveSegmentMember();

  const handleRemove = async () => {
    try {
      await remove.mutateAsync({ segmentId, memberKey: member.targetingKey });
      toast.info(`Removed "${member.targetingKey}" from segment.`);
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('member', 'remove', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={remove.isPending}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member?</AlertDialogTitle>
          <AlertDialogDescription>
            Remove &ldquo;{member.targetingKey}&rdquo; from this segment?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function SegmentMembersSection({ segmentId, canManage }: SegmentMembersSectionProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  const pageSize = 20;
  const { data: members, isLoading, error, refetch } = useSegmentMembers(segmentId, {
    page,
    pageSize,
    search: search || undefined,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Members</h3>
        {canManage && (
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Members
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by targeting key..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[120px]">
          <LoadingSpinner text="Loading members..." />
        </div>
      ) : error ? (
        <ErrorMessage
          title="Failed to load members"
          message="There was an error loading segment members."
          retry={() => refetch()}
        />
      ) : !members || members.length === 0 ? (
        <EmptyState
          icon={<Search className="h-12 w-12" />}
          title={search ? 'No members found' : 'No members yet'}
          description={
            search
              ? `No members match "${search}".`
              : 'Add targeting keys to this segment to use it in flag rules.'
          }
          action={
            !search && canManage ? (
              <Button size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Members
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="border rounded-lg divide-y">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-4 py-2">
              <span className="font-mono text-sm">{member.targetingKey}</span>
              {canManage && <RemoveMemberButton member={member} segmentId={segmentId} />}
            </div>
          ))}
        </div>
      )}

      {members && members.length === pageSize && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="flex items-center text-sm text-muted-foreground px-2">Page {page}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      <AddMembersModal segmentId={segmentId} open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
