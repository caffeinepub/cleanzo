import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { UserRole } from "./backend";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useCarOwnerProfile,
  useCrewMemberProfile,
  useUserRole,
} from "./hooks/useQueries";
import { AdminDashboard } from "./pages/AdminDashboard";
import { CrewDashboard } from "./pages/CrewDashboard";
import { LandingPage } from "./pages/LandingPage";
import { OwnerDashboard } from "./pages/OwnerDashboard";

function RootLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const navigate = useNavigate();

  const { data: role, isLoading: roleLoading } = useUserRole();
  const principal = isLoggedIn ? identity.getPrincipal() : undefined;
  const { data: carOwnerProfile, isLoading: ownerLoading } =
    useCarOwnerProfile(principal);
  const { data: crewProfile, isLoading: crewLoading } =
    useCrewMemberProfile(principal);

  const anyLoading =
    isInitializing ||
    (isLoggedIn && (roleLoading || ownerLoading || crewLoading));

  useEffect(() => {
    if (!isLoggedIn || roleLoading) return;
    if (role === UserRole.admin) {
      navigate({ to: "/admin" });
      return;
    }
    if (ownerLoading || crewLoading) return;
    if (carOwnerProfile) {
      navigate({ to: "/owner" });
    } else if (crewProfile) {
      navigate({ to: "/crew" });
    }
    // else: stay on landing, intent-based modal will open
  }, [
    isLoggedIn,
    role,
    roleLoading,
    carOwnerProfile,
    crewProfile,
    ownerLoading,
    crewLoading,
    navigate,
  ]);

  if (anyLoading && isLoggedIn && roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">
            Loading your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Outlet />
      <Toaster richColors position="top-right" />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

const ownerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/owner",
  component: OwnerDashboard,
});

const crewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crew",
  component: CrewDashboard,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  ownerRoute,
  crewRoute,
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
