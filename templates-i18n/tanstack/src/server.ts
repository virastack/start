import handler from "@tanstack/react-start/server-entry"

import { paraglideMiddleware } from "@/paraglide/server.js"

export default {
  fetch(req: Request): Promise<Response> {
    // TanStack Router owns URL rewriting — pass the original request to avoid redirect loops.
    return paraglideMiddleware(req, () => handler.fetch(req))
  }
}
