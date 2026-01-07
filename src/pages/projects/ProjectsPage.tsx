import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/entities/project/model/useProjects';
import { CreateProjectDialog } from '@/features/project/ui/CreateProjectDialog';
import { Button } from '@/shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FolderOpen, Plus } from 'lucide-react';
import type { Project } from '@/shared/types';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading, error, refetch } = useProjects();
  const [showArchived, setShowArchived] = useState(false);

  const filteredProjects = projects?.filter((project) =>
    showArchived ? project.isArchived : !project.isArchived
  );

  const activeCount = projects?.filter((p) => !p.isArchived).length ?? 0;
  const archivedCount = projects?.filter((p) => p.isArchived).length ?? 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <LoadingSpinner text="Loading projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage
          title="Failed to load projects"
          message="There was an error loading your projects. Please try again."
          retry={() => refetch()}
        />
      </div>
    );
  }

  const handleRowClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your feature flag projects
          </p>
        </div>
        <CreateProjectDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </CreateProjectDialog>
      </div>

      <div className="flex gap-2 mb-4">
        <Button
          variant={!showArchived ? 'default' : 'outline'}
          onClick={() => setShowArchived(false)}
        >
          Active ({activeCount})
        </Button>
        <Button
          variant={showArchived ? 'default' : 'outline'}
          onClick={() => setShowArchived(true)}
        >
          Archived ({archivedCount})
        </Button>
      </div>

      {!filteredProjects || filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderOpen className="h-16 w-16" />}
          title={showArchived ? 'No archived projects' : 'No projects yet'}
          description={
            showArchived
              ? 'Archived projects will appear here.'
              : 'Get started by creating your first project.'
          }
          action={
            !showArchived && (
              <CreateProjectDialog>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </CreateProjectDialog>
            )
          }
        />
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Alias</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(project)}
                >
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {project.alias}
                    </code>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {project.description || (
                      <span className="text-muted-foreground italic">
                        No description
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(project.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {project.isArchived ? (
                      <Badge variant="secondary">Archived</Badge>
                    ) : (
                      <Badge variant="default">Active</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
