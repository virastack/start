import { Tooltip, TooltipContent, TooltipTrigger } from "@/ui";

export function StackList({ data }: { data: { icon: React.ElementType; text: string }[] }) {
  return (
    <div className="flex items-center justify-center gap-6 py-8">
      {data.map((stack) => (
        <Tooltip key={stack.text}>
          <TooltipTrigger aria-label={stack.text}>
            <stack.icon className="size-6" />
          </TooltipTrigger>
          <TooltipContent>
            <p>{stack.text}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
