import { useParams } from 'react-router-dom';

export function FlagsPage() {
  const { projectId } = useParams<{ projectId: string }>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Feature Flags</h1>
      <p className="text-gray-600 mt-2">Project ID: {projectId}</p>
      <p className="text-gray-600">Feature flags management will go here</p>
    </div>
  );
}
