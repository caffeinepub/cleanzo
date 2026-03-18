import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { UserRole } from "../backend";
import { CarOwnerRegistrationModal } from "../components/CarOwnerRegistrationModal";
import { CrewRegistrationModal } from "../components/CrewRegistrationModal";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { PageDecor3D } from "../components/PageDecor3D";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCarOwnerProfile,
  useCrewMemberProfile,
  useUserRole,
} from "../hooks/useQueries";

const INTENT_KEY = "cleanzo_pending_intent";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const PLAN_FEATURES = [
  "Daily dry clean 5am to 10am",
  "Up to 7 skip days/month",
  "Real-time schedule tracking",
];

const FAQ = [
  {
    q: "Can I cancel my subscription?",
    a: "Yes, you can cancel anytime from your dashboard. Your subscription stays active until the end of the billing period.",
  },
  {
    q: "What if I need to skip a day?",
    a: "You can skip up to 7 days per month directly from your owner dashboard. No phone calls needed.",
  },
  {
    q: "Which cars qualify for the Standard Plan?",
    a: "Hatchbacks, sedans, and mid-SUVs qualify for the Rs.399/month Standard Plan.",
  },
  {
    q: "What about large SUVs?",
    a: "Large SUVs and 7-seaters are on the SUV Plan at Rs.449/month. Same great service, calibrated for larger vehicles.",
  },
];

export function PricingPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const navigate = useNavigate();
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [crewModalOpen, setCrewModalOpen] = useState(false);
  const { data: role } = useUserRole();
  const principal = isLoggedIn ? identity.getPrincipal() : undefined;
  const { data: carOwnerProfile } = useCarOwnerProfile(principal);
  const { data: crewProfile } = useCrewMemberProfile(principal);

  useEffect(() => {
    if (!isLoggedIn || !role) return;
    if (role === UserRole.admin) {
      navigate({ to: "/admin" });
      return;
    }
    if (carOwnerProfile) {
      navigate({ to: "/owner" });
      return;
    }
    if (crewProfile) {
      navigate({ to: "/crew" });
      return;
    }
    const intent = localStorage.getItem(INTENT_KEY);
    if (intent === "owner") {
      localStorage.removeItem(INTENT_KEY);
      setOwnerModalOpen(true);
    } else if (intent === "crew") {
      localStorage.removeItem(INTENT_KEY);
      setCrewModalOpen(true);
    }
  }, [isLoggedIn, role, carOwnerProfile, crewProfile, navigate]);

  const handleJoinOwner = () => {
    if (!isLoggedIn) {
      localStorage.setItem(INTENT_KEY, "owner");
      login();
    } else setOwnerModalOpen(true);
  };
  const handleJoinCrew = () => {
    if (!isLoggedIn) {
      localStorage.setItem(INTENT_KEY, "crew");
      login();
    } else setCrewModalOpen(true);
  };
  const handleSuccess = () => {
    setTimeout(() => {
      if (carOwnerProfile || ownerModalOpen) navigate({ to: "/owner" });
      else if (crewProfile || crewModalOpen) navigate({ to: "/crew" });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onJoinOwner={handleJoinOwner} onJoinCrew={handleJoinCrew} />

      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageDecor3D variant="sparkles" />
        </div>
        <div className="relative z-[1] max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400 mb-4"
            >
              Pricing
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-800 leading-tight mb-7"
            >
              Simple, <span className="text-gradient-blue">transparent</span>{" "}
              pricing
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              One subscription. All mornings covered. No hidden fees, no
              surprises.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto"
          >
            {/* Standard */}
            <motion.div variants={fadeUp}>
              <div className="luxury-card-wrapper h-full">
                <div className="bg-card rounded-[1.2rem] p-10 h-full flex flex-col">
                  <div className="mb-9">
                    <h2 className="text-2xl font-display font-700 mb-1">
                      Standard Plan
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      For everyday cars
                    </p>
                  </div>
                  <div className="mb-9 flex items-end gap-1">
                    <span className="text-7xl font-display font-800 text-gradient-gold">
                      &#8377;399
                    </span>
                    <span className="text-muted-foreground text-lg mb-2">
                      /month
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                    Covers
                  </p>
                  <ul className="space-y-3 mb-4">
                    {["Hatchback", "Sedan", "Mid-SUV"].map((t) => (
                      <li key={t} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 mt-7">
                    Includes
                  </p>
                  <ul className="space-y-3 mb-9 flex-1">
                    {PLAN_FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 h-auto text-base"
                    size="lg"
                    onClick={handleJoinOwner}
                    data-ocid="pricing.primary_button"
                  >
                    Get Started
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={handleJoinOwner}
                      className="text-amber-300 hover:underline"
                      data-ocid="pricing.link"
                    >
                      Sign up now
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* SUV Plan */}
            <motion.div variants={fadeUp}>
              <div className="luxury-card-wrapper-featured h-full">
                <div className="bg-card rounded-[1.2rem] p-10 h-full flex flex-col relative overflow-hidden">
                  {/* Subtle gold shimmer accent top-right */}
                  <div
                    className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, oklch(0.78 0.15 75), transparent 70%)",
                    }}
                  />
                  <div className="mb-9">
                    <h2 className="text-2xl font-display font-700 mb-1">
                      SUV Plan
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      For large SUVs and 7-seaters
                    </p>
                  </div>
                  <div className="mb-9 flex items-end gap-1">
                    <span className="text-7xl font-display font-800 text-gradient-gold">
                      &#8377;449
                    </span>
                    <span className="text-muted-foreground text-lg mb-2">
                      /month
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                    Covers
                  </p>
                  <ul className="space-y-3 mb-4">
                    {["Large SUV", "7-seaters"].map((t) => (
                      <li key={t} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 mt-7">
                    Includes
                  </p>
                  <ul className="space-y-3 mb-9 flex-1">
                    {PLAN_FEATURES.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full py-6 h-auto text-base"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.78 0.15 75), oklch(0.65 0.18 60))",
                      color: "oklch(0.12 0.01 255)",
                      fontWeight: 700,
                    }}
                    size="lg"
                    onClick={handleJoinOwner}
                    data-ocid="pricing.secondary_button"
                  >
                    Get Started
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={handleJoinOwner}
                      className="text-amber-300 hover:underline"
                      data-ocid="pricing.link"
                    >
                      Sign up now
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Razorpay Badge */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 p-5 rounded-2xl bg-card border border-border/50 max-w-2xl mx-auto"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm">
                Secure payments powered by{" "}
                <span className="font-semibold text-foreground">Razorpay</span>
              </span>
            </div>
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
              Coming Soon
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:block">
              · PCI-DSS compliant · UPI, Cards, Net Banking
            </span>
          </motion.div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-14">
              <h2 className="text-4xl font-display font-700">
                Frequently asked questions
              </h2>
            </motion.div>
            <div className="space-y-5">
              {FAQ.map(({ q, a }) => (
                <motion.div
                  key={q}
                  variants={fadeUp}
                  className="p-7 rounded-2xl bg-card border border-border/50"
                >
                  <p className="font-semibold text-foreground mb-2 text-lg">
                    {q}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">{a}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <CarOwnerRegistrationModal
        open={ownerModalOpen}
        onOpenChange={setOwnerModalOpen}
        onSuccess={handleSuccess}
      />
      <CrewRegistrationModal
        open={crewModalOpen}
        onOpenChange={setCrewModalOpen}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
