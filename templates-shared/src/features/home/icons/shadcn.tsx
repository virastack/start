import type { ComponentProps } from "react"

export function ShadcnIcon(props: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 256 256" aria-hidden {...props}>
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="25"
        strokeLinecap="round"
        d="M208 128l-80 80M192 40L40 192"
      />
    </svg>
  )
}
