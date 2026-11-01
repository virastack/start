import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it } from "vitest"

import { FavoriteButton } from "@/features/users/components/FavoriteButton"
import { FavoritesCount } from "@/features/users/components/FavoritesCount"
import { useFavoritesStore } from "@/features/users/stores/favorites.store"
import { renderWithProviders } from "@/test/render"

function renderFavorites() {
  return renderWithProviders(
    <>
      <FavoritesCount />
      <FavoriteButton userId={1} userName="Ada Lovelace" />
      <FavoriteButton userId={2} userName="Grace Hopper" />
    </>
  )
}

describe("favorites", () => {
  beforeEach(() => {
    useFavoritesStore.setState({ ids: [] })
  })

  it("adds a user and updates the count", async () => {
    const user = userEvent.setup()
    renderFavorites()
    expect(screen.getByText(/favorites/)).toHaveTextContent("0 favorites")

    const ada = screen.getByRole("button", { name: "Favorite Ada Lovelace" })
    await user.click(ada)

    expect(ada).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Favorite Grace Hopper" })).toHaveAttribute(
      "aria-pressed",
      "false"
    )
    expect(screen.getByText(/favorite$/)).toHaveTextContent("1 favorite")
  })

  it("removes a user on the second press", async () => {
    const user = userEvent.setup()
    renderFavorites()

    const ada = screen.getByRole("button", { name: "Favorite Ada Lovelace" })
    await user.click(ada)
    await user.click(ada)

    expect(ada).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByText(/favorites/)).toHaveTextContent("0 favorites")
  })

  it("counts every favorite and remembers them in the browser", async () => {
    const user = userEvent.setup()
    renderFavorites()

    await user.click(screen.getByRole("button", { name: "Favorite Ada Lovelace" }))
    await user.click(screen.getByRole("button", { name: "Favorite Grace Hopper" }))

    expect(screen.getByText(/favorites/)).toHaveTextContent("2 favorites")
    expect(localStorage.getItem("favorite-users")).toContain("[1,2]")
  })
})
