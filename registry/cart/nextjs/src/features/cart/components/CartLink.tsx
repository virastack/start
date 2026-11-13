import type { ComponentProps } from "react"
import Link from "next/link"

type CartLinkProps = ComponentProps<typeof Link> & { href: string }

/** The framework's link, so opening a product stays a client navigation. */
export function CartLink(props: CartLinkProps) {
  return <Link {...props} />
}
