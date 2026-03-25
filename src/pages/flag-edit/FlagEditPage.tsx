import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/shared/ui/page-header';
import { toast } from '@/shared/lib/toast';
import { useFeatureFlagById, useUpdateFeatureFlag, useUpdateFeatureFlagValue } from '@/entities/flag';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ScopePermission, ProjectPermission } from '@/shared/types/entities';
import { canPerformScopeAction } from '@/shared/lib/permissions';
import { Skeleton } from '@/shared/ui/skeleton';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Switch } from '@/shared/ui/switch';
import { Button } from '@/shared/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { TargetingRulesSection } from '@/features/flag/ui/TargetingRulesSection';
import { DeleteFeatureFlagDialog } from '@/features/flag/ui/DeleteFeatureFlagDialog';
import type { ProblemDetails } from '@/shared/types/auth';
import type { FeatureFlagValue } from '@/shared/types';

const flagSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  key: z
    .string()
    .min(2, 'Key must be at least 2 characters')
    .max(255, 'Key must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable(),
});

type FlagFormData = z.infer<typeof flagSchema>;

export function FlagEditPage() {
  const { projectId, flagId } = useParams<{ projectId: string; flagId: string }>();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { data: flag, isLoading: flagLoading, error: flagError } = useFeatureFlagById(projectId, flagId);
  const { permissions, canPerformProjectAction, isLoading: permissionsLoading } = usePermissions(projectId);
  const updateFlag = useUpdateFeatureFlag();
  const updateFlagValue = useUpdateFeatureFlagValue();

  const form = useForm<FlagFormData>({
    resolver: zodResolver(flagSchema) as Resolver<FlagFormData>,
    defaultValues: { name: '', key: '', description: '' },
  });

  useEffect(() => {
    if (flag) {
      form.reset({
        name: flag.name,
        key: flag.key,
        description: flag.description ?? '',
      });
    }
  }, [flag, form]);

  if (flagLoading || permissionsLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-4 w-32" />
        <div className="space-y-1">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="border rounded-lg p-5 space-y-4">
          <Skeleton className="h-5 w-28" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="border rounded-lg p-5 space-y-4">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (flagError || !flag || !flagId || !projectId) {
    return (
      <div className="p-8">
        <ErrorMessage
          title="Failed to load feature flag"
          message="The feature flag could not be found or there was an error loading it."
        />
      </div>
    );
  }

  const onSubmitMeta = async (data: FlagFormData) => {
    try {
      await updateFlag.mutateAsync({
        flagId,
        data: {
          name: data.name,
          key: data.key,
          description: data.description || null,
        },
      });
      toast.success('feature flag', 'updated');
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('feature flag', 'update', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  const handleToggleDefaultValue = async (flagValue: FeatureFlagValue, checked: boolean) => {
    try {
      await updateFlagValue.mutateAsync({
        flagId,
        data: { scopeId: flagValue.scopeId, isEnabled: checked },
      });
      toast.info(`Default value ${checked ? 'enabled' : 'disabled'} for ${flagValue.scopeName}`);
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('flag value', 'update', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  const sortedValues = flag.values;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <PageHeader
        title={flag.name}
        subtitle={<span className="font-mono">{flag.key}</span>}
        backTo={`/projects/${projectId}`}
        actions={
          <>
            <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
              Delete
            </Button>
            <DeleteFeatureFlagDialog
              flag={flag}
              open={deleteOpen}
              onOpenChange={setDeleteOpen}
              onDeleted={() => navigate(`/projects/${projectId}`)}
            />
          </>
        }
      />

      <div className="space-y-6">
      {/* Metadata edit form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium">Flag Settings</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitMeta)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="New Dashboard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Key</FormLabel>
                    <FormControl>
                      <Input placeholder="new_dashboard" className="font-mono" {...field} />
                    </FormControl>
                    <FormDescription>Used to identify this flag in your code.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enables the new redesigned dashboard"
                        {...field}
                        value={field.value ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={updateFlag.isPending}>
                  {updateFlag.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Scope tabs */}
      {sortedValues.length > 0 ? (
        <Tabs defaultValue={sortedValues[0].scopeId}>
          <TabsList>
            {sortedValues.map((flagValue) => (
              <TabsTrigger key={flagValue.scopeId} value={flagValue.scopeId}>
                {flagValue.scopeName}
              </TabsTrigger>
            ))}
          </TabsList>

          {sortedValues.map((flagValue) => {
            const canManage =
              canPerformProjectAction(ProjectPermission.ManageTargetingRules) &&
              canPerformScopeAction(permissions, flagValue.scopeId, ScopePermission.UpdateFeatureFlags);

            return (
              <TabsContent key={flagValue.scopeId} value={flagValue.scopeId}>
                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {/* Default value toggle */}
                    <div className="flex items-center gap-4 p-4 rounded-lg border">
                      <Switch
                        id={`default-${flagValue.scopeId}`}
                        checked={flagValue.isEnabled}
                        onCheckedChange={(checked) => handleToggleDefaultValue(flagValue, checked)}
                        disabled={!canManage || updateFlagValue.isPending}
                      />
                      <label
                        htmlFor={`default-${flagValue.scopeId}`}
                        className={canManage ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
                      >
                        <div className="font-medium">
                          Default Value:{' '}
                          <span className={flagValue.isEnabled ? 'text-green-600' : 'text-muted-foreground'}>
                            {flagValue.isEnabled ? 'ON' : 'OFF'}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Returned when no rule matches
                        </div>
                      </label>
                    </div>

                    {/* Targeting rules */}
                    <TargetingRulesSection
                      flagValueId={flagValue.id}
                      projectId={projectId}
                      canManage={canManage}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">No scopes configured for this flag.</p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
