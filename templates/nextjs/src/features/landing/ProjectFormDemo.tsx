"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { projectSchema, type ProjectInput } from "@/schemas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProjectFormDemo() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: ProjectInput) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    toast.success(`Created project: ${values.name}`);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4 py-2">
      <div className="flex flex-col gap-2.5 text-left">
        <Label htmlFor="name">Project Name</Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              id="name"
              type="text"
              placeholder="virastack-app"
              aria-invalid={!!errors.name}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? "Creating…" : "Create Project"}
      </Button>
    </form>
  );
}
