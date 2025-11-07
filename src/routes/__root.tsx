import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import Header from "../components/header";

import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />
      <Outlet />
    </>
  ),
});
