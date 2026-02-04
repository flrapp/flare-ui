import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';

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
    <div className="space-y-3">
      {permissions.map((permission) => {
        const isChecked = selectedPermissions.includes(permission.value);
        return (
          <div key={permission.value} className="flex items-center space-x-2">
            <Checkbox
              id={`${idPrefix}-permission-${permission.value}`}
              checked={isChecked}
              onCheckedChange={(checked) => handleToggle(permission.value, checked as boolean)}
              disabled={disabled}
            />
            <Label
              htmlFor={`${idPrefix}-permission-${permission.value}`}
              className={`text-sm font-normal cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {permission.label}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
