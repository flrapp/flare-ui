import { useState } from 'react';
import { toast } from '@/shared/lib/toast';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { useRegenerateApiKey } from '@/entities/project/model/useProjects';
import { Eye, EyeOff, Copy, RefreshCw, AlertTriangle } from 'lucide-react';
import type { ProjectDetail, ProblemDetails } from '@/shared/types';

interface ApiKeySectionProps {
  project: ProjectDetail;
  canView: boolean;
  canRegenerate: boolean;
}

export function ApiKeySection({ project, canView, canRegenerate }: ApiKeySectionProps) {
  const [showKey, setShowKey] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const regenerateApiKey = useRegenerateApiKey();

  const maskApiKey = (key: string) => {
    if (key.length <= 12) return key;
    const prefix = key.substring(0, 6);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${'*'.repeat(20)}${suffix}`;
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
      setShowKey(true);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('API key', 'regenerate', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  if (!canView) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>
            You don't have permission to view the API key for this project.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key</CardTitle>
        <CardDescription>
          Use this key to authenticate requests to the Flare API for this project.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {project.apiKey ? (
          <>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded font-mono text-sm">
                {showKey ? project.apiKey : maskApiKey(project.apiKey)}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowKey(!showKey)}
                title={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleCopy} title="Copy API key">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {canRegenerate && (
              <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate API Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Regenerate API Key
                    </DialogTitle>
                    <DialogDescription>
                      This will invalidate the current API key. Any applications using the old key
                      will stop working until updated with the new key.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Before proceeding:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>Make sure you have access to update all services using this key</li>
                      <li>The old key will stop working immediately</li>
                      <li>You'll need to update your applications with the new key</li>
                    </ul>
                  </div>
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
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No API key available</p>
        )}
      </CardContent>
    </Card>
  );
}
