"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslations } from "next-intl"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FieldDescription, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getProjectSchema, type ProjectInput } from "@/features/landing/schemas/project.schema"

export function ProjectFormDemo() {
  const t = useTranslations("Index")
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProjectInput>({
    resolver: zodResolver(getProjectSchema(t)),
    defaultValues: { name: "" }
  })

  async function onSubmit(values: ProjectInput) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    toast.success(t("project_success", { name: values.name }))
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5 text-left">
        <Label htmlFor="name">{t("project_label")}</Label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input
              id="name"
              type="text"
              placeholder={t("project_placeholder")}
              aria-invalid={!!errors.name}
              value={field.value}
              onChange={(event) => field.onChange(event.target.value)}
              onBlur={field.onBlur}
              ref={field.ref}
            />
          )}
        />
        {errors.name ? (
          <FieldError>{errors.name.message}</FieldError>
        ) : (
          <FieldDescription>{t("project_desc")}</FieldDescription>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? t("project_submitting") : t("project_submit")}
      </Button>
    </form>
  )
}
