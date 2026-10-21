import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api";

import { getUsers } from "@/features/landing/api";
import type { User } from "@/features/landing/types";
import { server } from "@/test/server";

const USERS_URL = "https://jsonplaceholder.typicode.com/users";

const users: User[] = [
  {
    id: 1,
    name: "Ada Lovelace",
    username: "ada",
    email: "ada@example.com",
    address: { city: "London" },
  },
];

describe("getUsers", () => {
  it("returns the users from the API", async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.json(users)));

    await expect(getUsers()).resolves.toEqual(users);
  });

  it("throws an ApiError when the API fails", async () => {
    server.use(http.get(USERS_URL, () => HttpResponse.json({ message: "Down" }, { status: 503 })));

    await expect(getUsers()).rejects.toBeInstanceOf(ApiError);
  });
});
