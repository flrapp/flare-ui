import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/shared/lib/toast';
import { useProject, useUpdateProject, useRegenerateApiKey } from '@/entities/project/model/useProjects';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { PageLoader } from '@/shared/ui/PageLoader';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { ChevronLeft, Eye, EyeOff, Copy, RefreshCw } from 'lucide-react';
import type { ProblemDetails } from '@/shared/types';

const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters'),
});

type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

export function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const { canPerformProjectAction, isLoading: permissionsLoading } = usePermissions(projectId);
  const updateProject = useUpdateProject();
  const regenerateApiKey = useRegenerateApiKey();

  const [showApiKey, setShowApiKey] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);

  const canManageSettings = canPerformProjectAction(ProjectPermission.ManageProjectSettings);
  const canViewApiKey = canPerformProjectAction(ProjectPermission.ViewApiKey);
  const canRegenerateApiKey = canPerformProjectAction(ProjectPermission.RegenerateApiKey);

  const form = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema) as Resolver<UpdateProjectFormData>,
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description || '',
      });
    }
  }, [project, form]);

  if (isLoading || permissionsLoading) {
    return <PageLoader message="Loading settings..." />;
  }

  if (error || !project) {
    return (
      <div className="p-8">
        <ErrorMessage
          title="Failed to load project"
          message="There was an error loading the project settings. Please try again."
          retry={() => refetch()}
        />
      </div>
    );
  }

  const onSubmit = async (data: UpdateProjectFormData) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          name: data.name,
          description: data.description || null,
        },
      });
      toast.success('project', 'updated');
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('project', 'update', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  const handleCopy = async () => {
    if (!project.apiKey) return;
    try {
      await navigator.clipboard.writeText(project.apiKey);
      toast.info('API key copied to clipboard');
    } catch {
      toast.info('Failed to copy API key');
    }
  };

  const handleRegenerate = async () => {
    try {
      await regenerateApiKey.mutateAsync(project.id);
      toast.success('API key', 'regenerated');
      setRegenerateDialogOpen(false);
      setShowApiKey(true);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('API key', 'regenerate', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl p-6 space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link to={`/projects/${project.id}`}>
              <ChevronLeft className="size-4" />
              Back to Project
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Project Settings</h1>
        </div>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  {...form.register('name')}
                  placeholder="Enter project name"
                  disabled={!canManageSettings || updateProject.isPending}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alias">Project Alias</Label>
                <Input
                  id="alias"
                  value={project.alias}
                  readOnly
                  disabled
                  placeholder="Enter project alias"
                />
                <p className="text-xs text-muted-foreground">
                  The project alias cannot be changed after creation.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Enter project description"
                  rows={3}
                  disabled={!canManageSettings || updateProject.isPending}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!canManageSettings || updateProject.isPending}>
                  {updateProject.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* API Keys */}
        {canViewApiKey && (
          <Card>
            <CardHeader>
              <CardTitle>API Key</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {project.apiKey ? (
                  <>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={showApiKey ? 'text' : 'password'}
                          value={project.apiKey}
                          readOnly
                          className="pr-10 font-mono text-sm"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </Button>
                      </div>
                      <Button variant="outline" size="icon" onClick={handleCopy}>
                        <Copy className="size-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Keep this key secret.
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">No API key available</p>
                )}
              </div>

              {canRegenerateApiKey && (
                <div className="pt-2">
                  <Button
                    variant="destructive"
                    className="gap-2"
                    onClick={() => setRegenerateDialogOpen(true)}
                  >
                    <RefreshCw className="size-4" />
                    Regenerate API Key
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Warning: Regenerating will invalidate the current key and may break existing integrations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Regenerate confirmation dialog */}
      <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate API Key</DialogTitle>
            <DialogDescription>
              This will invalidate the current API key. Any applications using the old key
              will stop working until updated with the new key.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRegenerateDialogOpen(false)}
              disabled={regenerateApiKey.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRegenerate}
              disabled={regenerateApiKey.isPending}
            >
              {regenerateApiKey.isPending ? 'Regenerating...' : 'Regenerate Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
