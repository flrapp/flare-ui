import { useParams } from 'react-router-dom';

export function ScopesPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Scopes</h1>
      <p className="text-gray-600 mt-2">Project ID: {projectId}</p>
      <p className="text-gray-600">Scopes management will go here</p>
    </div>
  );
}
