"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button, ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createProject } from "@/app/actions/project-management";

interface CreateProjectButtonProps extends ButtonProps {}

export function CreateProjectButton({
  variant = "outline",
  ...props
}: CreateProjectButtonProps) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createProject(formData);

      if (result.error) {
        setError(
          typeof result.error === "string"
            ? result.error
            : "Failed to create project",
        );
        return;
      }

      setIsDialogOpen(false);
      router.push(`/app/${result.data?.id}`);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        onClick={() => setIsDialogOpen(true)}
        {...props}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Project
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new project</DialogTitle>
            <DialogDescription>
              Create a new project to start generating and editing videos with
              AI.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="bg-destructive/15 text-destructive p-3 rounded-md mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Awesome Video"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="A brief description of your project"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
