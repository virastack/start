import type { Table } from "@tanstack/react-table";

export interface DataTableProps<TData> {
  table: Table<TData>;
  isPending: boolean;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  searchPlaceholder: string;
  loadingText: string;
  noResultsText: string;
}
