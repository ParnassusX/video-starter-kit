import { FolderPlus } from "lucide-react";
import { CreateProjectButton } from "./create-project-button";

export function EmptyProjects() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <FolderPlus className="h-10 w-10 text-primary" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">No projects yet</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Create your first project to start generating and editing videos with
        AI.
      </p>
      <div className="mt-6">
        <CreateProjectButton variant="default" />
      </div>
    </div>
  );
}
