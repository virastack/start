import { queryOptions } from "@tanstack/react-query";

import { getUsers } from "@/features/landing/api/get-users.api";
import { userKeys } from "@/features/landing/api/query-keys";

export const usersQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.list(),
    queryFn: ({ signal }) => getUsers(signal),
  });
