import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { cn } from '@/shared/lib/utils';

const DELETE_PROJECT_LABEL = 'Delete Project';

interface PermissionCheckboxGroupProps {
  permissions: Array<{ value: number; label: string }>;
  selectedPermissions: number[];
  onChange: (selectedPermissions: number[]) => void;
  disabled?: boolean;
  idPrefix: string;
}

export function PermissionCheckboxGroup({
  permissions,
  selectedPermissions,
  onChange,
  disabled = false,
  idPrefix,
}: PermissionCheckboxGroupProps) {
  const handleToggle = (permission: number, checked: boolean) => {
    if (checked) {
      onChange([...selectedPermissions, permission]);
    } else {
      onChange(selectedPermissions.filter((p) => p !== permission));
    }
  };

  return (
    <div className="space-y-0">
      {permissions.map((permission) => {
        const isChecked = selectedPermissions.includes(permission.value);
        const isDestructive = permission.label === DELETE_PROJECT_LABEL;
        return (
          <div key={permission.value} className="flex items-center space-x-2 py-1.5">
            <Checkbox
              id={`${idPrefix}-permission-${permission.value}`}
              checked={isChecked}
              onCheckedChange={(checked) => handleToggle(permission.value, checked as boolean)}
              disabled={disabled}
            />
            <Label
              htmlFor={`${idPrefix}-permission-${permission.value}`}
              className={cn(
                'text-sm font-normal cursor-pointer',
                disabled && 'opacity-50 cursor-not-allowed',
                isDestructive && 'text-destructive'
              )}
            >
              {permission.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
