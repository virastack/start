import { api } from "@/lib/api";

import { UserSchema, type User } from "@/features/landing/schemas/user.schema";

export const getUsers = async (signal?: AbortSignal): Promise<User[]> => {
  const { data } = await api.get("/users", { signal });
  return UserSchema.array().parse(data);
};
