import { useRef, useEffect, useState } from 'react';
import { useScopes } from '@/entities/scope/model/useScopes';
import { formatDate } from '@/shared/lib/format-date';
import { CreateScopeDialog } from '@/features/scope/ui/CreateScopeDialog';
import { EditScopeDialog } from '@/features/scope/ui/EditScopeDialog';
import { DeleteScopeDialog } from '@/features/scope/ui/DeleteScopeDialog';
import { Button } from '@/shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/shared/ui/tooltip';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';

interface ScopesListProps {
  projectId: string;
  canManage: boolean;
}

function TruncatedDescription({ text }: { text: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) {
      setIsTruncated(el.scrollWidth > el.clientWidth);
    }
  }, [text]);

  const content = (
    <span ref={ref} className="truncate max-w-xs block">
      {text}
    </span>
  );

  if (!isTruncated) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{content}</TooltipTrigger>
      <TooltipContent className="max-w-sm">{text}</TooltipContent>
    </Tooltip>
  );
}

export function ScopesList({ projectId, canManage }: ScopesListProps) {
  const { data: scopes, isLoading, error, refetch } = useScopes(projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner text="Loading scopes..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load scopes"
        message="There was an error loading scopes. Please try again."
        retry={() => refetch()}
      />
    );
  }

  if (!scopes || scopes.length === 0) {
    return (
      <EmptyState
        icon={<Layers className="h-16 w-16" />}
        title="No scopes yet"
        description="Create your first scope to organize feature flags by environment (e.g., dev, staging, production)."
        action={
          canManage && (
            <CreateScopeDialog projectId={projectId}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Scope
              </Button>
            </CreateScopeDialog>
          )
        }
      />
    );
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Alias</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            {canManage && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {scopes.map((scope) => (
            <TableRow key={scope.id}>
              <TableCell className="font-medium">{scope.name}</TableCell>
              <TableCell className="font-medium text-muted-foreground">{scope.alias}</TableCell>
              <TableCell>
                {scope.description ? (
                  <TruncatedDescription text={scope.description} />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>{formatDate(scope.createdAt)}</TableCell>
              {canManage && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <EditScopeDialog scope={scope}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </EditScopeDialog>
                      </TooltipTrigger>
                      <TooltipContent>Edit scope</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DeleteScopeDialog scope={scope}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteScopeDialog>
                      </TooltipTrigger>
                      <TooltipContent>Delete scope</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
