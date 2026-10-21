import { setupServer } from "msw/node";

/**
 * MSW server shared by every test. Add default handlers here and override
 * them per test with `server.use()`. Unhandled requests fail the test.
 */
export const server = setupServer();
