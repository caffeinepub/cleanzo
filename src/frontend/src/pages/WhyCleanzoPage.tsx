import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Droplets,
  Leaf,
  Sparkles,
  X,
} from "lucide-react";
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
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const COMPARISON = [
  {
    feature: "Water usage",
    cleanzo: "Zero water",
    traditional: "150–200 litres per wash",
  },
  {
    feature: "Time required",
    cleanzo: "5am–10am, while you sleep",
    traditional: "30–60 min wait",
  },
  {
    feature: "Booking needed",
    cleanzo: "No, subscription auto-enrolls",
    traditional: "Yes, every time",
  },
  {
    feature: "Water spots",
    cleanzo: "None",
    traditional: "Common without wipe-down",
  },
  {
    feature: "Flexibility",
    cleanzo: "Skip up to 4 days/month",
    traditional: "Cancel-reschedule hassle",
  },
  {
    feature: "Cost predictability",
    cleanzo: "Fixed monthly rate",
    traditional: "Variable per wash",
  },
];

const BENEFITS = [
  {
    icon: Leaf,
    title: "Eco-friendly waterless tech",
    desc: "We use professional-grade waterless cleaning solutions that require zero water and are biodegradable, saving up to 200 litres per session.",
  },
  {
    icon: Clock,
    title: "Morning slot, car ready when you leave",
    desc: "Our crew works between 5am and 10am, so your car is freshly cleaned and waiting the moment you step out the door.",
  },
  {
    icon: CreditCard,
    title: "No booking, ever again",
    desc: "Subscribe once and we take care of the rest. Your subscription auto-enrolls you for daily service. No apps, no reminders.",
  },
  {
    icon: Calendar,
    title: "Skip days, total flexibility",
    desc: "Travelling? On a holiday? Just skip up to 4 service days per month from your dashboard. No questions asked.",
  },
];

export function WhyCleanzoPage() {
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

      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageDecor3D variant="rings" />
        </div>
        <div className="relative z-[1] max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-4"
            >
              Why Cleanzo
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl font-display font-800 leading-tight mb-6"
            >
              A smarter way to <span className="text-gradient-blue">shine</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              Dry cleaning isn't just better. It's the future of car care.
              Here's why Cleanzo leaves traditional car washes in the dust.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl font-display font-700">
                Four reasons to switch today
              </h2>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-6">
              {BENEFITS.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="p-7 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display font-700 text-lg mb-2">
                        {title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 bg-secondary/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <h2 className="text-3xl font-display font-700 mb-3">
                Cleanzo vs Traditional Car Wash
              </h2>
              <p className="text-muted-foreground">
                The comparison speaks for itself.
              </p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="rounded-2xl border border-border/50 overflow-hidden"
            >
              <div className="grid grid-cols-3 bg-card/80 border-b border-border/50">
                <div className="p-4 text-sm font-semibold text-muted-foreground">
                  Feature
                </div>
                <div className="p-4 text-sm font-semibold text-primary border-l border-border/50">
                  Cleanzo ✨
                </div>
                <div className="p-4 text-sm font-semibold text-muted-foreground border-l border-border/50">
                  Traditional Wash
                </div>
              </div>
              {COMPARISON.map(({ feature, cleanzo, traditional }, i) => (
                <div
                  key={feature}
                  className={`grid grid-cols-3 border-b border-border/30 last:border-0 ${i % 2 === 0 ? "bg-card/30" : "bg-transparent"}`}
                >
                  <div className="p-4 text-sm text-foreground font-medium">
                    {feature}
                  </div>
                  <div className="p-4 text-sm text-primary border-l border-border/30 flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                    {cleanzo}
                  </div>
                  <div className="p-4 text-sm text-muted-foreground border-l border-border/30 flex items-center gap-2">
                    <X className="w-3.5 h-3.5 text-destructive shrink-0" />
                    {traditional}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Dry clean explainer */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.div variants={fadeUp}>
              <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-3xl font-display font-700 mb-5">
                Why dry cleaning?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4 max-w-2xl mx-auto">
                Waterless car cleaning uses specially formulated sprays that
                lift and encapsulate dirt particles, which are then safely wiped
                away with microfibre cloths. No water is needed, and the results
                are phenomenal.
              </p>
              <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                This technique is widely used by luxury car detailers worldwide.
                We've brought it to your doorstep at a fraction of the cost, on
                a convenient daily subscription.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="mt-10">
              <Button
                size="lg"
                onClick={handleJoinOwner}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="why.primary_button"
              >
                Get Started Today
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={handleJoinOwner}
                  className="text-accent font-semibold hover:underline"
                  data-ocid="why.link"
                >
                  Sign up now →
                </button>
              </p>
            </motion.div>
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
