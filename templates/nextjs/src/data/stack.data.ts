export type StackItem = {
  name: string;
  description: string;
  href: string;
};

export const stackData: StackItem[] = [
  { name: "Next.js", description: "App Router & React 19", href: "https://nextjs.org" },
  {
    name: "Tailwind CSS",
    description: "Design tokens & utility CSS",
    href: "https://tailwindcss.com",
  },
  { name: "Base UI", description: "Unstyled, accessible primitives", href: "https://base-ui.com" },
  {
    name: "TanStack Query",
    description: "Server-state caching",
    href: "https://tanstack.com/query",
  },
];
