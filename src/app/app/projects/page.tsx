import { Metadata } from 'next';
import { listProjects } from '@/app/actions/project-management';
import { ProjectCard } from '@/components/projects/project-card';
import { CreateProjectButton } from '@/components/projects/create-project-button';
import { EmptyProjects } from '@/components/projects/empty-projects';

export const metadata: Metadata = {
  title: 'Projects - FAL Video Studio',
  description: 'Manage your video projects',
};

export default async function ProjectsPage() {
  // Server-side data fetching
  const { data: projects, error } = await listProjects();
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Projects</h1>
        <CreateProjectButton />
      </div>
      
      {error && (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
          <p>Error loading projects: {error}</p>
        </div>
      )}
      
      {!error && projects && projects.length === 0 && <EmptyProjects />}
      
      {!error && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}