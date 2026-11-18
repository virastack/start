import { definePolicy } from "@virastack/password/strength"

/** DummyJSON's sign-in. Point it at your API's. */
export const LOGIN_PATH = "/auth/login"
/** DummyJSON answers as if the account was created, but it does not store it. */
export const REGISTER_PATH = "/users/add"

/** Where the pages live in this app. The forms link to each other through these. */
export const LOGIN_ROUTE = "/login"
export const REGISTER_ROUTE = "/register"

/**
 * One of DummyJSON's own users, offered on the sign-in page so the demo works. Delete it, and its
 * hint in `LoginForm`, once you connect your API.
 */
export const DEMO_ACCOUNT = { username: "emilys", password: "emilyspass" } as const

/**
 * NIST SP 800-63B-4: 15 to 64 characters, no common passwords, repeats or personal details, and
 * no composition rules. Shared by the form and, through `@virastack/password/server`, your server.
 */
export const PASSWORD_POLICY = definePolicy({ preset: "nist" })
