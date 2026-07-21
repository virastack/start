"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input
} from "@/ui";
import { createAuthSchema, type AuthFormValues } from "@/features/landing/schemas/auth.schema";

export function AuthForm() {
  const tForm = useTranslations("AuthForm");
  const tSchema = useTranslations("AuthSchema");

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(createAuthSchema(tSchema)),
    defaultValues: { username: "", password: "" }
  });

  const onSubmit = form.handleSubmit((data) => {
    toast("", {
      description: <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>,
      duration: 5000
    });
  });

  return (
    <section className="col-span-3 mt-16 space-y-5 lg:col-span-1">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("usernameLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={tForm("usernamePlaceholder")}
                    autoComplete="username"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tForm("passwordLabel")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={tForm("passwordPlaceholder")}
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {tForm("submit")}
          </Button>
        </form>
      </Form>
    </section>
  );
}
