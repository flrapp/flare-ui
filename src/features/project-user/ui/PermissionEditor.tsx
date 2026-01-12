import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/shared/ui/accordion';
import { Button } from '@/shared/ui/button';
import { PermissionCheckboxGroup } from '@/shared/ui/PermissionCheckboxGroup';
import { useScopes } from '@/entities/scope';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import {
  getAllProjectPermissions,
  getAllScopePermissions,
  getProjectPermissionLabel,
  getScopePermissionLabel,
} from '@/shared/lib/permissions';
import { Copy } from 'lucide-react';

interface PermissionEditorValue {
  projectPermissions: number[];
  scopePermissions: Record<string, number[]>;
}

interface PermissionEditorProps {
  projectId: string;
  value: PermissionEditorValue;
  onChange: (value: PermissionEditorValue) => void;
  disabledPermissions?: {
    project?: number[];
    scopes?: Record<string, number[]>;
  };
}

export function PermissionEditor({ projectId, value, onChange, disabledPermissions }: PermissionEditorProps) {
  const { data: scopes, isLoading } = useScopes(projectId);

  const projectPermissions = getAllProjectPermissions().map((p) => ({
    value: p,
    label: getProjectPermissionLabel(p),
  }));

  const scopePermissions = getAllScopePermissions().map((p) => ({
    value: p,
    label: getScopePermissionLabel(p),
  }));

  const handleProjectPermissionsChange = (selectedPermissions: number[]) => {
    onChange({
      ...value,
      projectPermissions: selectedPermissions,
    });
  };

  const handleScopePermissionsChange = (scopeId: string, selectedPermissions: number[]) => {
    onChange({
      ...value,
      scopePermissions: {
        ...value.scopePermissions,
        [scopeId]: selectedPermissions,
      },
    });
  };

  const handleApplyToAllScopes = () => {
    if (!scopes || scopes.length === 0) return;

    // Use permissions from the first scope, or default to all permissions if none selected
    const firstScopeId = scopes[0].id;
    const permissionsToApply = value.scopePermissions[firstScopeId] || getAllScopePermissions();

    const newScopePermissions: Record<string, number[]> = {};
    scopes.forEach((scope) => {
      newScopePermissions[scope.id] = [...permissionsToApply];
    });

    onChange({
      ...value,
      scopePermissions: newScopePermissions,
    });
  };

  if (isLoading) {
    return <LoadingSpinner text="Loading scopes..." />;
  }

  return (
    <div className="space-y-6">
      {/* Project Permissions */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Project Permissions</h3>
        <div className="border rounded-lg p-4 bg-muted/50">
          <PermissionCheckboxGroup
            permissions={projectPermissions}
            selectedPermissions={value.projectPermissions}
            onChange={handleProjectPermissionsChange}
            disabled={false}
          />
        </div>
      </div>

      {/* Scope Permissions */}
      {scopes && scopes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Scope Permissions</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleApplyToAllScopes}>
              <Copy className="h-3 w-3 mr-2" />
              Apply to All Scopes
            </Button>
          </div>
          <Accordion type="single" collapsible className="border rounded-lg">
            {scopes.map((scope, index) => {
              const scopePerms = value.scopePermissions[scope.id] || [];
              const isDisabled = disabledPermissions?.scopes?.[scope.id] !== undefined;

              return (
                <AccordionItem key={scope.id} value={scope.id} className={index === scopes.length - 1 ? 'border-0' : ''}>
                  <AccordionTrigger className="px-4 hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{scope.name}</span>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{scope.alias}</code>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {scopePerms.length} {scopePerms.length === 1 ? 'permission' : 'permissions'}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <PermissionCheckboxGroup
                      permissions={scopePermissions}
                      selectedPermissions={scopePerms}
                      onChange={(perms) => handleScopePermissionsChange(scope.id, perms)}
                      disabled={isDisabled}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      )}

      {(!scopes || scopes.length === 0) && (
        <div className="border rounded-lg p-4 text-center text-muted-foreground">
          <p className="text-sm">No scopes available in this project.</p>
          <p className="text-xs mt-1">Create scopes to assign scope-level permissions.</p>
        </div>
      )}
    </div>
  );
}
