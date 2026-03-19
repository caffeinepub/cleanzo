import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  Shield,
  Sparkles,
  Star,
  UserPlus,
} from "lucide-react";
import { motion } from "motion/react";
import { Suspense, useEffect, useRef, useState } from "react";
import { UserRole } from "../backend";
import { CarOwnerRegistrationModal } from "../components/CarOwnerRegistrationModal";
import { CrewRegistrationModal } from "../components/CrewRegistrationModal";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero3D } from "../components/Hero3D";
import { WaitlistModal } from "../components/WaitlistModal";
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

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const PLAN_FEATURES = [
  "Daily dry clean 5am to 10am",
  "Up to 7 skip days/month",
  "Real-time schedule tracking",
];

export function LandingPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const navigate = useNavigate();

  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [crewModalOpen, setCrewModalOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

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

  const pendingNavRef = useRef<"owner" | "crew" | null>(null);

  const handleRegistrationSuccess = (type: "owner" | "crew") => {
    pendingNavRef.current = type;
    setTimeout(() => {
      if (pendingNavRef.current === "owner") navigate({ to: "/owner" });
      else if (pendingNavRef.current === "crew") navigate({ to: "/crew" });
      pendingNavRef.current = null;
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onJoinOwner={handleJoinOwner}
        onJoinCrew={handleJoinCrew}
        onWaitlist={() => setWaitlistOpen(true)}
      />

      {/* ── Section 1: Hero ─────────────────────────── */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden noise-bg">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <Hero3D />
          </Suspense>
        </div>
        <div className="absolute inset-0 z-[1] gradient-mesh" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background/95 via-background/70 to-transparent" />

        <div className="relative z-[3] max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-32">
          <motion.div
            className="max-w-2xl space-y-8"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <div className="flex flex-wrap items-center gap-3 mb-5">
                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground border border-primary/50 text-sm font-bold px-4 py-2 rounded-full shadow-md">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Book your 2 days trial at ₹19
                </span>
                <span className="hidden sm:block w-px h-5 bg-border/60" />
                <Badge className="bg-primary/15 text-primary border-primary/25 hover:bg-primary/15 font-medium gap-1.5 text-sm px-3 py-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  5:00 AM – 10:00 AM · Daily Service
                </Badge>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-9xl font-display font-extrabold leading-[1.02] tracking-tight">
                Your car, <span className="text-gradient-blue">spotless</span>
                <br />
                every morning.
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-xl font-medium text-muted-foreground leading-relaxed max-w-lg"
            >
              Cleanzo brings professional dry cleaning to your doorstep at dawn.
              Subscribe once, wake up to a gleaming car every single day.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={handleJoinOwner}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-blue text-base px-8 py-6 h-auto"
                data-ocid="landing.primary_button"
              >
                <Car className="w-5 h-5 mr-2" />
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-sm text-muted-foreground"
            >
              Don't have an account?{" "}
              <button
                type="button"
                onClick={handleJoinOwner}
                className="text-primary font-semibold hover:underline"
                data-ocid="landing.link"
              >
                Sign up now →
              </button>
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-6 pt-2"
            >
              {[
                {
                  icon: Sparkles,
                  text: "Waterless tech — zero water spots, ever",
                  highlight: true,
                },
                { icon: Shield, text: "100% chemical-safe dry clean process" },
                {
                  icon: Clock,
                  text: "We arrive 5am–10am. Done before your day starts.",
                },
              ].map(({ icon: Icon, text, highlight }) => (
                <div
                  key={text}
                  className={`flex items-center gap-2 text-sm ${
                    highlight
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Section 2: How It Works ──────────────────── */}
      <section className="py-32 relative border-t border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/60 via-white/40 to-blue-50/30 dark:from-slate-800/60 dark:via-slate-900/40 dark:to-blue-950/30" />
        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.div variants={fadeUp} className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full">
                Simple Process
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-4"
            >
              How It Works
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-lg"
            >
              Clean car in 3 simple steps
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "01",
                icon: UserPlus,
                title: "Sign Up",
                desc: "Register your car and choose your plan. Takes less than 2 minutes.",
              },
              {
                step: "02",
                icon: Car,
                title: "Crew Arrives (5am–10am)",
                desc: "Our trained crew arrives between 5am and 10am, rain or shine. You get a notification when they're on their way.",
              },
              {
                step: "03",
                icon: Sparkles,
                title: "Car is Clean",
                desc: "Your car is spotless before you start your day. Every single morning.",
              },
            ].map(({ step, icon: Icon, title, desc }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className="relative p-9 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-all hover:-translate-y-1.5 group overflow-hidden"
              >
                <span className="absolute -top-4 -right-2 text-9xl font-display font-extrabold text-foreground/5 select-none">
                  {step}
                </span>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-3 text-2xl">
                    {title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 2.5: VIP Waitlist ────────────────── */}
      <section className="py-20 relative border-t border-border/30 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-sky-400/15 to-blue-600/10 dark:from-indigo-900/40 dark:via-sky-900/30 dark:to-blue-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_oklch(0.65_0.18_245/0.12)_0%,_transparent_70%)]" />
        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div variants={fadeUp} className="mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-400/30 px-3 py-1.5 rounded-full">
                <Star className="w-3 h-3 fill-current" />
                Noida Launch — Limited Spots
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl font-display font-extrabold mb-4"
            >
              Launching in <span className="text-gradient-blue">Noida</span>{" "}
              Soon
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-lg mb-8"
            >
              Be among the first to experience Cleanzo in your area. VIP members
              get priority scheduling, exclusive launch pricing, and early
              access to all premium features.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Button
                size="lg"
                onClick={() => setWaitlistOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-base px-10 py-6 h-auto shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
                data-ocid="waitlist.primary_button"
              >
                <Star className="w-5 h-5 mr-2 fill-current" />
                Claim Your VIP Access
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
            <motion.p
              variants={fadeUp}
              className="mt-4 text-sm text-muted-foreground"
            >
              Join 100+ Noida residents already on the list
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Section 3: Pricing Preview ───────────────── */}
      <section
        className="py-32 relative overflow-hidden border-t border-border/30"
        id="pricing"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-950/40 dark:via-slate-900 dark:to-indigo-950/20" />
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-4"
            >
              Simple, transparent pricing
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-lg"
            >
              One subscription. All mornings covered.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
          >
            {/* Standard Plan */}
            <motion.div variants={fadeUp}>
              <div className="luxury-card-wrapper">
                <div className="bg-card rounded-[1.2rem] p-10 h-full">
                  <div className="mb-7">
                    <h3 className="text-2xl font-display font-bold mb-1">
                      Standard Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Hatchback, Sedan, Mid-SUV
                    </p>
                  </div>
                  <div className="mb-7 flex items-end gap-1">
                    <span className="text-6xl font-display font-extrabold text-gradient-gold">
                      ₹399
                    </span>
                    <span className="text-muted-foreground mb-2">/month</span>
                  </div>
                  <ul className="space-y-3 mb-9">
                    {["Hatchback, Sedan, Mid-SUV", ...PLAN_FEATURES].map(
                      (f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2.5 text-sm"
                        >
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                          {f}
                        </li>
                      ),
                    )}
                  </ul>
                  <Button
                    className="w-full py-6 h-auto text-base bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleJoinOwner}
                    data-ocid="pricing.primary_button"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* SUV Plan */}
            <motion.div variants={fadeUp}>
              <div className="luxury-card-wrapper-featured">
                <div className="bg-card rounded-[1.2rem] p-10 h-full">
                  <div className="mb-7">
                    <h3 className="text-2xl font-display font-bold mb-1">
                      SUV Plan
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      For large SUVs and 7-seaters
                    </p>
                  </div>
                  <div className="mb-7 flex items-end gap-1">
                    <span className="text-6xl font-display font-extrabold text-gradient-gold">
                      ₹449
                    </span>
                    <span className="text-muted-foreground mb-2">/month</span>
                  </div>
                  <ul className="space-y-3 mb-9">
                    {["Large SUV and 7-seaters", ...PLAN_FEATURES].map((f) => (
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
                    }}
                    onClick={handleJoinOwner}
                    data-ocid="pricing.secondary_button"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* See all pricing link */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mt-10"
          >
            <Link
              to="/pricing"
              className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline text-sm"
              data-ocid="pricing.link"
            >
              See all pricing details and features →
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />

      <CarOwnerRegistrationModal
        open={ownerModalOpen}
        onOpenChange={() => setOwnerModalOpen(false)}
        onSuccess={() => handleRegistrationSuccess("owner")}
      />
      <CrewRegistrationModal
        open={crewModalOpen}
        onOpenChange={() => setCrewModalOpen(false)}
        onSuccess={() => handleRegistrationSuccess("crew")}
      />
      <WaitlistModal
        open={waitlistOpen}
        onOpenChange={() => setWaitlistOpen(false)}
      />
    </div>
  );
}
