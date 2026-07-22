import type { ComponentProps } from "react";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

export function Tabs({ className, ...props }: ComponentProps<typeof BaseTabs.Root>) {
  return (
    <BaseTabs.Root data-slot="tabs" className={cn("flex flex-col gap-3", className)} {...props} />
  );
}

export function TabsList({ className, ...props }: ComponentProps<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      data-slot="tabs-list"
      className={cn(
        "relative inline-flex h-9 w-fit items-center rounded-lg bg-muted p-[3px] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none",
        "text-foreground data-[selected]:bg-background data-[selected]:shadow-sm",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: ComponentProps<typeof BaseTabs.Panel>) {
  return (
    <BaseTabs.Panel data-slot="tabs-content" className={cn("outline-none", className)} {...props} />
  );
}
