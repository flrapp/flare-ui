import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/entities/project/model/useProjects';
import { CreateProjectDialog } from '@/features/project/ui/CreateProjectDialog';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { TableSkeleton } from '@/shared/ui/TableSkeleton';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FolderOpen, Plus } from 'lucide-react';
import type { Project } from '@/shared/types';

export function ProjectsPage() {
  const navigate = useNavigate();
  const { data: projects, isLoading, error, refetch } = useProjects();
  const [showArchived, setShowArchived] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl p-6">
          <TableSkeleton rows={5} columns={5} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl p-6">
          <ErrorMessage
            title="Failed to load projects"
            message="There was an error loading your projects. Please try again."
            retry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  const projectList = Array.isArray(projects) ? projects : [];
  const filteredProjects = projectList.filter((project) =>
    showArchived ? project.isArchived : !project.isArchived
  );
  const activeCount = projectList.filter((p) => !p.isArchived).length;
  const archivedCount = projectList.filter((p) => p.isArchived).length;

  const handleRowClick = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold">Projects</h1>
          </div>
          <CreateProjectDialog>
            <Button>
              <Plus className="size-4 mr-2" />
              New Project
            </Button>
          </CreateProjectDialog>
        </div>

        {/* Projects Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Projects</CardTitle>
              </div>
              <Tabs
                value={showArchived ? 'archived' : 'active'}
                onValueChange={(value) => setShowArchived(value === 'archived')}
              >
                <TabsList>
                  <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
                  <TabsTrigger value="archived">Archived ({archivedCount})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {!filteredProjects || filteredProjects.length === 0 ? (
              <EmptyState
                icon={<FolderOpen className="size-16" />}
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
                        <Plus className="size-4 mr-2" />
                        Create Your First Project
                      </Button>
                    </CreateProjectDialog>
                  )
                }
              />
            ) : (
              <div className="rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Alias</TableHead>
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
                          <code className="text-sm bg-muted px-2 py-1 rounded text-muted-foreground">
                            {project.alias}
                          </code>
                        </TableCell>
                        <TableCell>
                          {new Date(project.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={project.isArchived ? 'secondary' : 'default'}>
                            {project.isArchived ? 'Archived' : 'Active'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
