"use client";

import type { ReactNode } from "react";

import { RefreshCwIcon, SearchIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

import { ApiError } from "@/lib/api";

import {
  Avatar,
  AvatarFallback,
  Button,
  Input,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { getInitials } from "@/features/landing/helpers";
import { useUsers } from "@/features/landing/hooks";

/**
 * Demonstrates server-state fetching & caching with TanStack Query.
 */
export function UsersDemo() {
  const { data, isLoading, isError, error, refetch, isFetching } = useUsers();
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""));

  const filteredData = data?.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase()),
  );

  const header = (
    <div className="mb-4">
      <h4 className="text-base font-semibold text-foreground md:text-lg">Recent Users</h4>
      <p className="mt-1 text-sm text-pretty text-muted-foreground">
        Fetch and cache data with{" "}
        <span className="font-semibold text-foreground">TanStack Query</span>, synced to the URL via{" "}
        <span className="font-semibold text-foreground">nuqs</span>.
      </p>
    </div>
  );

  const toolbar = (
    <div className="mb-3 flex items-center justify-between gap-2">
      <div className="relative w-full max-w-[200px] min-w-0">
        <SearchIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          className="h-8 w-full bg-background/50 pl-8 text-xs"
          value={search}
          onChange={(event) => setSearch(event.target.value || null)}
        />
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={() => refetch()}
        disabled={isFetching || isLoading}
      >
        <RefreshCwIcon className={`size-3 ${isFetching ? "animate-spin" : ""}`} />
        {isFetching ? "Refreshing..." : "Refresh"}
      </Button>
    </div>
  );

  const tableShell = (children: ReactNode) => (
    <div className="min-h-0 flex-1 overflow-hidden rounded border border-border/40 bg-background">
      <Table>{children}</Table>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        {header}
        {toolbar}
        {tableShell(
          <>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 px-3 text-xs">User</TableHead>
                <TableHead className="h-9 px-3 text-right text-xs">City</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <Skeleton className="h-3.5 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-3 text-right">
                    <Skeleton className="ml-auto h-3.5 w-16" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </>,
        )}
      </div>
    );
  }

  if (isError) {
    const message =
      error instanceof ApiError
        ? `Request failed with status ${error.status}.`
        : "Failed to load users. Check your network connection.";

    return (
      <div className="flex h-full min-h-0 flex-col">
        {header}
        {toolbar}
        {tableShell(
          <TableBody>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={2} className="py-8 text-center text-sm text-destructive">
                {message}
              </TableCell>
            </TableRow>
          </TableBody>,
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      {header}
      {toolbar}
      {tableShell(
        <>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 px-3 text-xs">User</TableHead>
              <TableHead className="h-9 px-3 text-right text-xs">City</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData?.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="py-8 text-center text-sm text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-[11px] font-medium text-primary">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right text-xs text-muted-foreground">
                    {user.address.city}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </>,
      )}
    </div>
  );
}
