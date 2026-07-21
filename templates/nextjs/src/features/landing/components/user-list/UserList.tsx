"use client";

import { useMemo, useState } from "react";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui";
import { useUsers } from "@/features/landing/hooks/use-users";
import type { User } from "@/features/landing/types/user.types";

export function UserList() {
  const { data = [], isPending, isError, error } = useUsers();
  const t = useTranslations("UserList");

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: "id",
        header: ({ column }) => (
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 [&_svg]:size-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("id")}
            <ArrowUpDown />
          </button>
        )
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <button
            type="button"
            className="flex cursor-pointer items-center gap-2 [&_svg]:size-4"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("name")}
            <ArrowUpDown />
          </button>
        )
      },
      {
        accessorKey: "email",
        header: () => <span>{t("email")}</span>,
        enableSorting: false,
        cell: ({ row }) => <div className="lowercase">{row.getValue<string>("email")}</div>
      }
    ],
    [t]
  );

  /**
   * @remarks
   * We suppress `react-hooks/incompatible-library` because TanStack Table's `useReactTable`
   * is a valid hook but might trigger this rule due to version mismatch or specific lint configuration.
   */
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: data ?? [],
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    state: { sorting, globalFilter }
  });

  if (isError) {
    return (
      <section className="mt-10">
        <div>
          {t("error")}: {error instanceof Error ? error.message : String(error)}
        </div>
      </section>
    );
  }

  return (
    <section className="col-span-3 lg:col-span-2">
      <div className="flex items-center py-4">
        <Input
          placeholder={t("searchPlaceholder")}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-56"
        />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {t("noResults")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
