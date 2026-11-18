// `/server`: the same API without `"use client"`, for files the server reads too.
import { definePreset } from "@virastack/mask/server"
import { definePolicy } from "@virastack/password/strength"

/** DummyJSON's sign-in. Point it at your API's. */
export const LOGIN_PATH = "/auth/login"
/** DummyJSON answers as if the account was created, but it does not store it. */
export const REGISTER_PATH = "/users/add"

/** Where the pages live in this app. The forms link to each other through these. */
export const LOGIN_ROUTE = "/login"
export const REGISTER_ROUTE = "/register"

/**
 * One of DummyJSON's own users, filled into the sign-in form so the demo signs in with one click.
 * Delete it, and use empty default values in `LoginForm`, once you connect your API.
 */
export const DEMO_ACCOUNT = { username: "emilys", password: "emilyspass" } as const

/**
 * NIST SP 800-63B-4: 15 to 64 characters, no common passwords, repeats or personal details, and
 * no composition rules. Shared by the form and, through `@virastack/password/server`, your server.
 */
export const PASSWORD_POLICY = definePolicy({ preset: "nist" })

/** The longest username, for the mask and the schema. */
export const USERNAME_MAX_LENGTH = 50
/** The longest first or last name: the `fullName` preset's own limit, which the schema follows. */
export const NAME_MAX_LENGTH = 70

/**
 * What a username can hold, as the schema checks it: lowercase letters, digits, dots, hyphens and
 * underscores, up to 50. A capital letter typed becomes lowercase; anything else is not typed.
 */
const usernamePreset = definePreset("username", {
  mask: `u[${"u".repeat(USERNAME_MAX_LENGTH - 1)}]`,
  tokens: { u: /[a-z0-9._-]/i },
  transform: "lowercase",
  autoComplete: "username"
})

/** The masks, shared by each form and its resolver. */
export const LOGIN_MASKS = { username: usernamePreset } as const

/** `fullName` takes letters of any language, Turkish ones included, and single spaces. */
export const REGISTER_MASKS = {
  firstName: { preset: "fullName", autoComplete: "given-name" },
  lastName: { preset: "fullName", autoComplete: "family-name" },
  username: usernamePreset
} as const
