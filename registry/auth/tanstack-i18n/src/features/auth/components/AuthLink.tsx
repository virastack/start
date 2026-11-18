import type { ComponentProps } from "react"

import { Link } from "@tanstack/react-router"

import { localizeHref } from "@/paraglide/runtime"

type AuthLinkProps = Omit<ComponentProps<typeof Link>, "to" | "params" | "search"> & {
  href: string
}

/**
 * The router's link with the visitor's locale in the path, so moving between the forms stays a
 * client navigation. The path is a plain string, so it type-checks before the pages it points at
 * are in the route tree.
 */
export function AuthLink({ href, ...props }: AuthLinkProps) {
  const to: string = localizeHref(href)
  return <Link to={to} {...props} />
}
