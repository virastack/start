import type { ComponentProps } from "react"

import { Link } from "@tanstack/react-router"

import { localizeHref } from "@/paraglide/runtime"

type CartLinkProps = Omit<ComponentProps<typeof Link>, "to" | "params" | "search"> & {
  href: string
}

/**
 * The router's link with the visitor's locale in the path, so opening a product stays a client
 * navigation. The path is a plain string, so it type-checks before the pages it points at are in
 * the route tree.
 */
export function CartLink({ href, ...props }: CartLinkProps) {
  const to: string = localizeHref(href)
  return <Link to={to} {...props} />
}
