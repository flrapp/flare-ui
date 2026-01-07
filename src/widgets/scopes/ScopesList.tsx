import { useScopes } from '@/entities/scope/model/useScopes';
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
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Plus, Pencil, Trash2, Layers } from 'lucide-react';

interface ScopesListProps {
  projectId: string;
  canManage: boolean;
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
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <CreateScopeDialog projectId={projectId}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Scope
            </Button>
          </CreateScopeDialog>
        </div>
      )}

      <div className="border rounded-lg">
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
                <TableCell className="max-w-md truncate">
                  {scope.description || (
                    <span className="text-muted-foreground italic">No description</span>
                  )}
                </TableCell>
                <TableCell>{new Date(scope.createdAt).toLocaleDateString()}</TableCell>
                {canManage && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <EditScopeDialog scope={scope}>
                        <Button variant="ghost" size="sm">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </EditScopeDialog>
                      <DeleteScopeDialog scope={scope}>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DeleteScopeDialog>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
