import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Droplets,
  Shield,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { UserRole } from "../backend";
import { CarOwnerRegistrationModal } from "../components/CarOwnerRegistrationModal";
import { CrewRegistrationModal } from "../components/CrewRegistrationModal";
import { Header } from "../components/Header";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useCarOwnerProfile,
  useCrewMemberProfile,
  useUserRole,
} from "../hooks/useQueries";

const INTENT_KEY = "cleanzo_pending_intent";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export function LandingPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const navigate = useNavigate();

  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [crewModalOpen, setCrewModalOpen] = useState(false);

  const { data: role } = useUserRole();
  const principal = isLoggedIn ? identity.getPrincipal() : undefined;
  const { data: carOwnerProfile } = useCarOwnerProfile(principal);
  const { data: crewProfile } = useCrewMemberProfile(principal);

  // After login, redirect if already has profile
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
    // New user — check pending intent
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
    } else {
      setOwnerModalOpen(true);
    }
  };

  const handleJoinCrew = () => {
    if (!isLoggedIn) {
      localStorage.setItem(INTENT_KEY, "crew");
      login();
    } else {
      setCrewModalOpen(true);
    }
  };

  const handleRegistrationSuccess = () => {
    // Re-check profile on next render cycle
    setTimeout(() => {
      if (carOwnerProfile || ownerModalOpen) navigate({ to: "/owner" });
      else if (crewProfile || crewModalOpen) navigate({ to: "/crew" });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onJoinOwner={handleJoinOwner} onJoinCrew={handleJoinCrew} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-mesh absolute inset-0 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-6"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.div variants={fadeUp}>
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10 mb-4 font-medium">
                  <Clock className="w-3 h-3 mr-1.5" />
                  5:00 AM – 10:00 AM · Daily Service
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-display font-800 text-foreground leading-[1.1] tracking-tight">
                  Your car, <span className="text-primary">spotless</span> every
                  morning.
                </h1>
              </motion.div>
              <motion.p
                variants={fadeUp}
                className="text-lg text-muted-foreground leading-relaxed max-w-md"
              >
                Cleanzo brings professional dry cleaning to your doorstep at
                dawn. Subscribe once, wake up to a gleaming car every single
                day.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={handleJoinOwner}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-hero"
                  data-ocid="landing.primary_button"
                >
                  <Car className="w-4 h-4 mr-2" />
                  Join as Car Owner
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleJoinCrew}
                  className="border-border hover:bg-secondary"
                  data-ocid="landing.secondary_button"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Join as Crew Member
                </Button>
              </motion.div>
              <motion.div
                variants={fadeUp}
                className="flex items-center gap-6 pt-2"
              >
                {[
                  { icon: Star, text: "4.9 rated service" },
                  { icon: Shield, text: "Trusted by 500+ owners" },
                  { icon: Sparkles, text: "Dry clean tech" },
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

            <motion.div
              initial={{ opacity: 0, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-hero">
                <img
                  src="/assets/generated/cleanzo-hero.dim_1200x600.jpg"
                  alt="Cleanzo car cleaning service"
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>
              {/* Floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-4 -left-4 glass rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Droplets className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Next service
                    </p>
                    <p className="text-xs text-primary font-medium">
                      Tomorrow, 6:30 AM
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-secondary/30" id="pricing">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center mb-12"
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-display font-700 text-foreground mb-3"
            >
              Simple, transparent pricing
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground">
              One subscription, all mornings covered.
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
              className="bg-card rounded-2xl p-8 shadow-card border border-border hover:shadow-hero transition-shadow"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-display font-700 text-foreground">
                    Standard Plan
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    For everyday cars
                  </p>
                </div>
                <Badge className="bg-secondary text-secondary-foreground border-0">
                  Most Popular
                </Badge>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-display font-800 text-foreground">
                  ₹399
                </span>
                <span className="text-muted-foreground ml-1">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["Hatchback", "Sedan", "Mid-SUV"].map((type) => (
                  <li key={type} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{type}</span>
                  </li>
                ))}
                {[
                  "Daily dry clean 5am–10am",
                  "Up to 4 skip days/month",
                  "Real-time schedule tracking",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleJoinOwner}
                data-ocid="landing.primary_button"
              >
                Get Started
              </Button>
            </motion.div>

            {/* Premium Plan */}
            <motion.div
              variants={fadeUp}
              className="bg-foreground rounded-2xl p-8 shadow-hero relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -translate-y-16 translate-x-16" />
              <div className="relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-display font-700 text-primary-foreground">
                      Premium Plan
                    </h3>
                    <p className="text-sm text-white/60 mt-1">For large SUVs</p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground border-0">
                    SUV
                  </Badge>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-display font-800 text-white">
                    ₹449
                  </span>
                  <span className="text-white/60 ml-1">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {["Large SUV & 7-seaters"].map((type) => (
                    <li
                      key={type}
                      className="flex items-center gap-2 text-sm text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      <span>{type}</span>
                    </li>
                  ))}
                  {[
                    "Daily dry clean 5am–10am",
                    "Up to 4 skip days/month",
                    "Priority crew assignment",
                    "Real-time schedule tracking",
                  ].map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={handleJoinOwner}
                  data-ocid="landing.primary_button"
                >
                  Get Started
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Clock,
                title: "Morning service, every day",
                desc: "Our crew arrives between 5am and 10am, so your car is ready when you need it.",
              },
              {
                icon: Calendar,
                title: "Flexible skip days",
                desc: "Travelling? Skip up to 4 days per month with a single tap on your dashboard.",
              },
              {
                icon: Shield,
                title: "Professional dry cleaning",
                desc: "No water, no water spots. Waterless cleaning technology for a perfect finish.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className="p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-hero transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display font-700 text-foreground mb-2">
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

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl font-display font-800 text-primary-foreground mb-4"
            >
              Ready for a spotless morning?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-primary-foreground/80 mb-8 text-lg"
            >
              Join hundreds of car owners who wake up to a clean car every day.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Button
                size="lg"
                onClick={handleJoinOwner}
                className="bg-white text-primary hover:bg-white/90 shadow-hero"
                data-ocid="landing.primary_button"
              >
                <Car className="w-4 h-4 mr-2" />
                Join as Car Owner
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleJoinCrew}
                className="border-white/40 text-white hover:bg-white/10"
                data-ocid="landing.secondary_button"
              >
                <Wrench className="w-4 h-4 mr-2" />
                Join the Crew
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-primary" />
            <span className="font-display font-600 text-sm text-foreground">
              Cleanzo
            </span>
            <span className="text-muted-foreground text-xs ml-2">
              Morning dry cleaning, 5am–10am daily
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>

      {/* Modals */}
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
    </div>
  );
}
