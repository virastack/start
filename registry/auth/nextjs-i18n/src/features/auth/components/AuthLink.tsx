import type { ComponentProps } from "react"

import { Link } from "@/i18n/routing"

type AuthLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string }

/** next-intl's link: it adds the visitor's locale to the path and stays a client navigation. */
export function AuthLink(props: AuthLinkProps) {
  return <Link {...props} />
}
