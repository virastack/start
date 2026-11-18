import type { ComponentProps } from "react"
import Link from "next/link"

type AuthLinkProps = ComponentProps<typeof Link> & { href: string }

/** The framework's link, so moving between the forms stays a client navigation. */
export function AuthLink(props: AuthLinkProps) {
  return <Link {...props} />
}
