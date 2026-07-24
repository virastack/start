import { api } from "@/lib/api";

import type { User } from "@/features/landing/types";

export function getUsers(signal?: AbortSignal) {
  return api.get<User[]>("https://jsonplaceholder.typicode.com/users?_limit=5", { signal });
}
