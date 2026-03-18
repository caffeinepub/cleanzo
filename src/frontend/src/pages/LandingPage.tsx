import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Bell,
  Calendar,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  Gift,
  MapPin,
  Shield,
  Sparkles,
  Star,
  UserPlus,
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
  "Daily dry clean 5am to 10am",
  "Up to 7 skip days/month",
  "Real-time schedule tracking",
];

const FAQS = [
  {
    q: "What if it rains?",
    a: "Our waterless dry cleaning process is 100% rain-proof. We clean your car even on rainy mornings — water spots are never a concern because we don't use water at all.",
  },
  {
    q: "What products do you use?",
    a: "We use professional-grade, chemical-safe waterless cleaning solutions that are imported and tested for Indian climate conditions. They remove dust, grime, and light stains without scratching your paint.",
  },
  {
    q: "Can I pause my subscription?",
    a: "Yes. You can skip up to 7 days per month from your dashboard with a single tap. Need a longer break? Just reach out to us on WhatsApp and we'll sort it out.",
  },
  {
    q: "What time does the crew arrive?",
    a: "Our crew operates between 5am and 10am daily. You'll receive a notification when they're on their way, so you always know when to expect them.",
  },
  {
    q: "Which car types do you service?",
    a: "We service all car types — hatchbacks, sedans, mid-SUVs at ₹399/month, and full-size SUVs and 7-seaters at ₹449/month. If you're unsure about your car type, WhatsApp us and we'll confirm.",
  },
  {
    q: "Is there a contract or lock-in period?",
    a: "No lock-ins. Cleanzo is month-to-month. You can cancel anytime from your dashboard. We earn your trust every morning — not through contracts.",
  },
];

export function LandingPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const navigate = useNavigate();

  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [crewModalOpen, setCrewModalOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

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
      <section className="relative min-h-[95vh] flex items-center overflow-hidden noise-bg">
        {/* 3D Canvas background */}
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            <Hero3D />
          </Suspense>
        </div>
        {/* gradient overlay so text is legible */}
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
              {/* Trial offer + Service hours INLINE */}
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

      {/* ── How It Works ─────────────────────────────── */}
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

      {/* ── Waitlist / Noida Launch ──────────────────── */}
      <section className="py-28 relative overflow-hidden border-t border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-amber-400/5" />
        <div className="absolute inset-0 noise-bg opacity-30" />
        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col lg:flex-row items-center gap-14"
          >
            <motion.div
              variants={fadeUp}
              className="flex-1 text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase bg-primary/15 text-primary border border-primary/25 px-3 py-1.5 rounded-full">
                  <MapPin className="w-3 h-3" />
                  Coming Soon to Noida
                </span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold mb-5 leading-tight">
                Cleanzo is launching in{" "}
                <span className="text-gradient-blue">Noida</span>! 🎉
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-7">
                We're bringing our premium car exterior dry cleaning service to
                Noida residents. Be among the first to experience Cleanzo in
                your society.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground mb-6 text-left">
                {[
                  "Early bird pricing locked for waitlist members",
                  "Priority slot booking when we launch",
                  "Exclusive first-week offer",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center gap-4"
            >
              <div className="luxury-card-wrapper-featured">
                <div className="w-full lg:w-96 p-10 rounded-[1.2rem] bg-card text-center">
                  <div className="w-16 h-16 rounded-full bg-amber-400/15 flex items-center justify-center mx-auto mb-5">
                    <Bell className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="font-display font-bold text-2xl mb-2">
                    Get Early Access
                  </h3>
                  <p className="text-sm text-muted-foreground mb-7">
                    Join 100+ Noida residents already on the waitlist.
                  </p>
                  <Button
                    size="lg"
                    className="w-full text-base py-6 h-auto"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.78 0.15 75), oklch(0.65 0.18 60))",
                      color: "oklch(0.12 0.01 255)",
                    }}
                    onClick={() => setWaitlistOpen(true)}
                    data-ocid="waitlist.primary_button"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Join the Waitlist
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Features / Why Choose Cleanzo ────────────── */}
      <section className="py-32 relative border-t border-border/30">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
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
              Why choose Cleanzo?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground text-lg"
            >
              The smarter way to keep your car clean.
            </motion.p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="p-9 rounded-2xl bg-card border border-border/60 hover:border-primary/40 transition-all hover:-translate-y-1.5 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-3 text-2xl">
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Pricing preview ─────────────────────────── */}
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
                <div className="bg-card rounded-[1.2rem] p-10 h-full relative overflow-hidden">
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
        </div>
      </section>

      {/* ── Referral Program ─────────────────────────── */}
      <section className="py-28 relative overflow-hidden border-t border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/20" />
        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* left: text */}
            <div className="flex-1 text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 px-3 py-1.5 rounded-full mb-5">
                <Gift className="w-3 h-3" />
                Referral Program
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold mb-5 leading-tight">
                Share Cleanzo,
                <br />
                <span className="text-gradient-blue">save ₹100</span> next month
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-lg">
                Love having a clean car every morning? Tell a friend. When they
                subscribe, you both get ₹100 off your next month. No limits —
                refer as many friends as you want.
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground text-left max-w-sm mx-auto lg:mx-0">
                {[
                  "Share your unique referral link from your dashboard",
                  "Friend subscribes using your link",
                  "You both get ₹100 off next month — automatically",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* right: card */}
            <div className="flex-shrink-0 w-full lg:w-96">
              <div className="p-10 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 shadow-xl shadow-indigo-100/50 dark:shadow-indigo-900/20 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-5">
                  <Gift className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-2">
                  Refer a Friend
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Get ₹100 off your next month
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 mb-6">
                  <p className="text-3xl font-display font-extrabold text-indigo-600 dark:text-indigo-300">
                    ₹100
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    credited per successful referral
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full py-6 h-auto text-base bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleJoinOwner}
                  data-ocid="referral.primary_button"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Join and Start Referring
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────── */}
      <section className="py-28 relative border-t border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/40 dark:from-slate-900/80 dark:via-slate-950 dark:to-blue-950/20" />
        <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-4">
              Common questions
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to know before you subscribe.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="bg-white dark:bg-slate-800 border border-border/60 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === faq.q ? null : faq.q)}
                  className="w-full flex items-center justify-between px-7 py-5 text-left hover:bg-secondary/30 transition-colors"
                  data-ocid="faq.toggle"
                >
                  <span className="font-semibold text-base text-foreground">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ml-4 ${
                      openFaq === faq.q ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === faq.q && (
                  <div className="px-7 pb-6 text-muted-foreground leading-relaxed text-sm border-t border-border/30 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden border-t border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-background to-amber-400/8" />
        <div className="relative max-w-4xl mx-auto px-6 sm:px-10 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold mb-5"
            >
              Ready for a spotless morning?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-muted-foreground mb-3 text-xl font-medium"
            >
              Subscribe today and wake up to a freshly cleaned car every day.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-sm text-muted-foreground mb-10"
            >
              Don't have an account?{" "}
              <button
                type="button"
                onClick={handleJoinOwner}
                className="text-primary font-semibold hover:underline"
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
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 h-auto text-base"
                data-ocid="cta.primary_button"
              >
                <Car className="w-5 h-5 mr-2" />
                Join as Car Owner
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleJoinCrew}
                className="border-border/60 hover:bg-secondary/60 px-8 py-6 h-auto text-base"
                data-ocid="cta.secondary_button"
              >
                <Wrench className="w-5 h-5 mr-2" />
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
