import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { EditScopeDialog } from './EditScopeDialog';
import { DeleteScopeDialog } from './DeleteScopeDialog';
import type { Scope } from '@/shared/types';
import { Pencil, Trash2 } from 'lucide-react';

interface ScopeDetailsProps {
  scope: Scope;
  canManage: boolean;
}

export function ScopeDetails({ scope, canManage }: ScopeDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{scope.name}</CardTitle>
            <CardDescription className="mt-1">
              <code className="text-sm bg-muted px-2 py-1 rounded">{scope.alias}</code>
            </CardDescription>
          </div>
          {canManage && (
            <div className="flex gap-2">
              <EditScopeDialog scope={scope}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </EditScopeDialog>
              <DeleteScopeDialog scope={scope}>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DeleteScopeDialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium mb-1">Description</h4>
          <p className="text-sm text-muted-foreground">
            {scope.description || 'No description provided'}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Created</h4>
          <p className="text-sm text-muted-foreground">
            {new Date(scope.createdAt).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
