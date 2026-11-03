import { cn } from "cn"

type ZustandIconProps = {
  className?: string
}

/** The artwork is 60 KB, so it stays a file in `public` instead of going into the page bundle. */
export function ZustandIcon({ className }: ZustandIconProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block bg-[url(/icons/zustand.svg)] bg-contain bg-center bg-no-repeat",
        className
      )}
    />
  )
}
