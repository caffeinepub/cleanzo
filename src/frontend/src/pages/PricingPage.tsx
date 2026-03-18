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
    a: "You can skip up to 7 days per month directly from your owner dashboard -- no phone calls needed.",
  },
  {
    q: "Which cars qualify for the Standard Plan?",
    a: "Hatchbacks, sedans, and mid-SUVs qualify for the Rs.399/month Standard Plan.",
  },
  {
    q: "What about large SUVs?",
    a: "Large SUVs and 7-seaters are on the SUV Plan at Rs.449/month -- same great service, calibrated for larger vehicles.",
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

      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageDecor3D variant="sparkles" />
        </div>
        <div className="relative z-[1] max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-4"
            >
              Pricing
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl font-display font-800 leading-tight mb-6"
            >
              Simple, <span className="text-gradient-blue">transparent</span>{" "}
              pricing
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              One subscription. All mornings covered. No hidden fees, no
              surprises.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-8"
          >
            {/* Standard */}
            <motion.div
              variants={fadeUp}
              className="bg-card rounded-2xl p-9 border border-border/60 hover:border-primary/40 transition-all"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-display font-700 mb-1">
                  Standard Plan
                </h2>
                <p className="text-sm text-muted-foreground">
                  For everyday cars
                </p>
              </div>
              <div className="mb-8">
                <span className="text-6xl font-display font-800">
                  &#8377;399
                </span>
                <span className="text-muted-foreground text-lg ml-2">
                  /month
                </span>
              </div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Covers
              </p>
              <ul className="space-y-2.5 mb-4">
                {["Hatchback", "Sedan", "Mid-SUV"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 mt-6">
                Includes
              </p>
              <ul className="space-y-2.5 mb-8">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
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
                  className="text-accent hover:underline"
                  data-ocid="pricing.link"
                >
                  Sign up now
                </button>
              </p>
            </motion.div>

            {/* SUV Plan */}
            <motion.div
              variants={fadeUp}
              className="relative bg-gradient-to-br from-card via-card to-accent/5 rounded-2xl p-9 border border-accent/30 hover:border-accent/60 transition-all"
            >
              <div className="absolute top-5 right-5">
                <Badge className="bg-accent/15 text-accent border-accent/25 text-xs">
                  SUV
                </Badge>
              </div>
              <div className="mb-8">
                <h2 className="text-2xl font-display font-700 mb-1">
                  SUV Plan
                </h2>
                <p className="text-sm text-muted-foreground">
                  For large SUVs & 7-seaters
                </p>
              </div>
              <div className="mb-8">
                <span className="text-6xl font-display font-800">
                  &#8377;449
                </span>
                <span className="text-muted-foreground text-lg ml-2">
                  /month
                </span>
              </div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Covers
              </p>
              <ul className="space-y-2.5 mb-4">
                {["Large SUV", "7-seaters"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 mt-6">
                Includes
              </p>
              <ul className="space-y-2.5 mb-8">
                {PLAN_FEATURES.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
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
                  className="text-accent hover:underline"
                  data-ocid="pricing.link"
                >
                  Sign up now
                </button>
              </p>
            </motion.div>
          </motion.div>

          {/* Razorpay Badge */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 p-4 rounded-xl bg-card border border-border/50"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm">
                Secure payments powered by{" "}
                <span className="font-semibold text-foreground">Razorpay</span>
              </span>
            </div>
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
              Coming Soon
            </Badge>
            <span className="text-xs text-muted-foreground hidden sm:block">
              · PCI-DSS compliant · UPI, Cards, Net Banking
            </span>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-secondary/20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl font-display font-700">
                Frequently asked questions
              </h2>
            </motion.div>
            <div className="space-y-4">
              {FAQ.map(({ q, a }) => (
                <motion.div
                  key={q}
                  variants={fadeUp}
                  className="p-6 rounded-xl bg-card border border-border/50"
                >
                  <p className="font-semibold text-foreground mb-2">{q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {a}
                  </p>
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
