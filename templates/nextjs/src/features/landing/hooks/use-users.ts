import { useQuery } from "@tanstack/react-query";

import { getUsers } from "@/features/landing/api/get-users.api";
import { userKeys } from "@/features/landing/api/query-keys";

export function useUsers() {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: ({ signal }) => getUsers(signal),
    select: (data) => data.slice(0, 5)
  });
}
