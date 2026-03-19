import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { UserRole } from "./backend";
import { WhatsAppChat } from "./components/WhatsAppChat";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import {
  useCarOwnerProfile,
  useCrewMemberProfile,
  useUserRole,
} from "./hooks/useQueries";
import { AboutPage } from "./pages/AboutPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ContactPage } from "./pages/ContactPage";
import { CrewDashboard } from "./pages/CrewDashboard";
import { FAQPage } from "./pages/FAQPage";
import { LandingPage } from "./pages/LandingPage";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { PricingPage } from "./pages/PricingPage";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";
import { ReferralPage } from "./pages/ReferralPage";
import { RefundPolicyPage } from "./pages/RefundPolicyPage";
import { TermsPage } from "./pages/TermsPage";
import { WhyCleanzoPage } from "./pages/WhyCleanzoPage";

function ScrollToTop() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers scroll
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname triggers scroll
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
      <ScrollToTop />
      <Outlet />
      <WhatsAppChat />
      <Toaster richColors position="top-right" />
    </>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: AboutPage,
});
const whyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/why-cleanzo",
  component: WhyCleanzoPage,
});
const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pricing",
  component: PricingPage,
});
const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  component: ContactPage,
});
const faqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/faq",
  component: FAQPage,
});
const referralRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/referral",
  component: ReferralPage,
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
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy-policy",
  component: PrivacyPolicyPage,
});
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: TermsPage,
});
const refundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/refund-policy",
  component: RefundPolicyPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  whyRoute,
  pricingRoute,
  contactRoute,
  faqRoute,
  referralRoute,
  ownerRoute,
  crewRoute,
  adminRoute,
  privacyRoute,
  termsRoute,
  refundRoute,
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
