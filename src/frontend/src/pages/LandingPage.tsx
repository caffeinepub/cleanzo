import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Shield,
  Sparkles,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { Suspense, useEffect, useState } from "react";
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

const FEATURES = [
  {
    icon: Clock,
    title: "Morning service, every day",
    desc: "Our crew arrives between 5am and 10am, so your car is ready when you need it.",
  },
  {
    icon: Calendar,
    title: "Flexible skip days",
    desc: "Travelling? Skip up to 7 days per month with a single tap on your dashboard.",
  },
  {
    icon: Shield,
    title: "Professional dry cleaning",
    desc: "No water, no spots. Waterless cleaning technology for a perfect finish every time.",
  },
];

const PLAN_FEATURES = [
  "Daily dry clean 5am–10am",
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

  const handleRegistrationSuccess = () => {
    setTimeout(() => {
      if (carOwnerProfile || ownerModalOpen) navigate({ to: "/owner" });
      else if (crewProfile || crewModalOpen) navigate({ to: "/crew" });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onJoinOwner={handleJoinOwner}
        onJoinCrew={handleJoinCrew}
        onWaitlist={() => setWaitlistOpen(true)}
      />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden noise-bg">
        {/* 3D Canvas background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <Hero3D />
          </Suspense>
        </div>
        {/* gradient overlay so text is legible */}
        <div className="absolute inset-0 z-[1] gradient-mesh" />
        <div className="absolute inset-0 z-[2] bg-gradient-to-r from-background/90 via-background/60 to-transparent" />

        {/* Hero image — right side */}
        <div className="absolute right-0 top-0 bottom-0 z-[2] w-1/2 hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-background/20 to-background/80 z-10" />
          <img
            src="/assets/generated/hero-crew-seltos.dim_1200x800.jpg"
            alt="Cleanzo crew member with Kia Seltos"
            className="w-full h-full object-cover object-center"
          />
        </div>

        <div className="relative z-[3] max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <motion.div
            className="max-w-xl space-y-6"
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Badge className="bg-primary/15 text-primary border-primary/25 hover:bg-primary/15 mb-4 font-medium gap-1.5">
                <Clock className="w-3 h-3" />
                5:00 AM – 10:00 AM · Daily Service
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-800 leading-[1.05] tracking-tight">
                Your car, <span className="text-gradient-blue">spotless</span>
                <br />
                every morning.
              </h1>
            </motion.div>

            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Cleanzo brings professional dry cleaning to your doorstep at dawn.
              Subscribe once, wake up to a gleaming car every single day.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={handleJoinOwner}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-blue"
                data-ocid="landing.primary_button"
              >
                <Car className="w-4 h-4 mr-2" />
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
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
                className="text-accent font-semibold hover:underline"
                data-ocid="landing.link"
              >
                Sign up now →
              </button>
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-5 pt-2"
            >
              {[
                { icon: Sparkles, text: "Waterless tech" },
                { icon: Shield, text: "No water spots" },
                { icon: Clock, text: "5am–10am daily" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                >
                  <Icon className="w-3.5 h-3.5 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Waitlist / Noida Launch ──────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/8" />
        <div className="absolute inset-0 noise-bg opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col lg:flex-row items-center gap-10"
          >
            <motion.div
              variants={fadeUp}
              className="flex-1 text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase bg-primary/15 text-primary border border-primary/25 px-3 py-1.5 rounded-full">
                  <MapPin className="w-3 h-3" />
                  Coming Soon to Noida
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-display font-800 mb-4 leading-tight">
                Cleanzo is launching in{" "}
                <span className="text-gradient-blue">Noida</span>! 🎉
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-6">
                We're bringing our premium car exterior dry cleaning service to
                Noida residents. Be among the first to experience Cleanzo in
                your society — sign up for early access and get notified the
                moment we go live in your area.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6 text-left">
                {[
                  "Early bird pricing locked for waitlist members",
                  "Priority slot booking when we launch",
                  "Exclusive first-week offer",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center gap-4"
            >
              <div className="w-full lg:w-80 p-8 rounded-2xl bg-card border border-primary/20 shadow-card text-center">
                <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-700 text-xl mb-2">
                  Get Early Access
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Join 100+ Noida residents already on the waitlist.
                </p>
                <Button
                  size="lg"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-blue"
                  onClick={() => setWaitlistOpen(true)}
                  data-ocid="waitlist.primary_button"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Join the Waitlist
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────── */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-display font-700 mb-3"
            >
              Why thousands love Cleanzo
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">
              The smarter way to keep your car clean.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-6"
          >
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="p-7 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-all hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-700 text-foreground mb-2 text-lg">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing preview ─────────────────────────── */}
      <section className="py-24 bg-secondary/20" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-display font-700 mb-3"
            >
              Simple, transparent pricing
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">
              One subscription. All mornings covered.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          >
            {/* Standard Plan */}
            <motion.div
              variants={fadeUp}
              className="bg-card rounded-2xl p-8 border border-border/60 hover:border-primary/40 transition-all"
            >
              <div className="mb-6">
                <h3 className="text-xl font-display font-700 mb-1">
                  Standard Plan
                </h3>
                <p className="text-sm text-muted-foreground">
                  For everyday cars
                </p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-display font-800">₹399</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {["Hatchback, Sedan, Mid-SUV", ...PLAN_FEATURES].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleJoinOwner}
                data-ocid="pricing.primary_button"
              >
                Get Started
              </Button>
            </motion.div>

            {/* SUV Plan */}
            <motion.div
              variants={fadeUp}
              className="relative rounded-2xl p-8 overflow-hidden border border-accent/30 bg-gradient-to-br from-card via-card to-accent/5"
            >
              <div className="absolute top-4 right-4">
                <Badge className="bg-accent/15 text-accent border-accent/25 text-xs">
                  SUV
                </Badge>
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-display font-700 mb-1">SUV Plan</h3>
                <p className="text-sm text-muted-foreground">
                  For large SUVs & 7-seaters
                </p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-display font-800">₹449</span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {["Large SUV & 7-seaters", ...PLAN_FEATURES].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                onClick={handleJoinOwner}
                data-ocid="pricing.secondary_button"
              >
                Get Started
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-display font-800 mb-4"
            >
              Ready for a spotless morning?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground mb-3 text-lg"
            >
              Subscribe today and wake up to a freshly cleaned car every day.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-sm text-muted-foreground mb-8"
            >
              Don't have an account?{" "}
              <button
                type="button"
                onClick={handleJoinOwner}
                className="text-accent font-semibold hover:underline"
                data-ocid="cta.link"
              >
                Sign up now →
              </button>
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={handleJoinOwner}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="cta.primary_button"
              >
                <Car className="w-4 h-4 mr-2" />
                Join as Car Owner
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleJoinCrew}
                className="border-border/60 hover:bg-secondary/60"
                data-ocid="cta.secondary_button"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Join the Crew
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />

      <CarOwnerRegistrationModal
        open={ownerModalOpen}
        onOpenChange={setOwnerModalOpen}
        onSuccess={handleRegistrationSuccess}
      />
      <CrewRegistrationModal
        open={crewModalOpen}
        onOpenChange={setCrewModalOpen}
        onSuccess={handleRegistrationSuccess}
      />
      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
