import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import { toast } from '@/shared/lib/toast';
import { Button } from '@/shared/ui/button';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Pagination } from '@/shared/ui/Pagination';
import { PageSizeSelect } from '@/shared/ui/PageSizeSelect';
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
import { useDebounce } from '@/shared/lib/useDebounce';
import type { ProblemDetails } from '@/shared/types/auth';

interface SegmentMembersSectionProps {
  segmentId: string;
  canManage: boolean;
}

function RemoveMemberButton({ member, segmentId }: { member: SegmentMember; segmentId: string }) {
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
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          disabled={remove.isPending}
        >
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
  const [pageSize, setPageSize] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const isMounted = useRef(false);

  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isFetching, error, refetch } = useSegmentMembers(segmentId, {
    page,
    pageSize,
    search: debouncedSearch || undefined,
  });

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setPage(1);
  }, [debouncedSearch]);

  const members = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

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

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by targeting key..."
        isLoading={isFetching && !isLoading}
      />

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
      ) : members.length === 0 ? (
        <EmptyState
          icon={<Search className="h-12 w-12" />}
          title={debouncedSearch ? 'No members found' : 'No members yet'}
          description={
            debouncedSearch
              ? `No members match "${debouncedSearch}".`
              : 'Add targeting keys to this segment to use it in flag rules.'
          }
          action={
            !debouncedSearch && canManage ? (
              <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Members
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className={`border rounded-lg divide-y transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between px-4 py-2">
                <span className="font-mono text-sm">{member.targetingKey}</span>
                {canManage && <RemoveMemberButton member={member} segmentId={segmentId} />}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <PageSizeSelect
                value={pageSize}
                onChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                disabled={isFetching}
              />
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                disabled={isFetching}
              />
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'member' : 'members'} total
          </p>
        </>
      )}

      <AddMembersModal segmentId={segmentId} open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
