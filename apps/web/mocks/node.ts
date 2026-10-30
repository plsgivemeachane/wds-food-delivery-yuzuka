import { setupServer } from "msw/node";
import {
  createOrderHandlers,
  handlers,
  type OrderHandlerOptions,
} from "@/mocks/handlers";

export function createServer(options?: OrderHandlerOptions) {
  return setupServer(
    ...(options ? createOrderHandlers(options) : handlers),
  );
}

export const server = setupServer(...handlers);
