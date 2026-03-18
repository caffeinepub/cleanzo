import { useNavigate } from "@tanstack/react-router";
import { Heart, Users, Zap } from "lucide-react";
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

const VALUES = [
  {
    icon: Zap,
    title: "Reliability",
    desc: "We show up every single morning, rain or shine, ready to deliver a spotless clean.",
  },
  {
    icon: Heart,
    title: "Care",
    desc: "We treat your car with the same care we'd give our own. Every detail matters.",
  },
  {
    icon: Users,
    title: "Convenience",
    desc: "No bookings, no hassle. Just subscribe and let us handle the rest.",
  },
];

export function AboutPage() {
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
          <PageDecor3D variant="orbs" />
        </div>
        <div className="relative z-[1] max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.p
              variants={fadeUp}
              className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-4"
            >
              About Us
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl font-display font-extrabold leading-tight mb-6"
            >
              The story behind{" "}
              <span className="text-gradient-blue">Cleanzo</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
            >
              We started Cleanzo because we believed your car deserved to shine
              every morning without the hassle of traditional car washes.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeUp}>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-4">
                Our Mission
              </p>
              <h2 className="text-3xl font-display font-bold mb-5 leading-tight">
                Daily professional dry cleaning at your doorstep
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Every morning between 5am and 10am, our trained crew arrives at
                your location and delivers a thorough, waterless dry clean.
                leaving your car spotless before your day even begins.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We use professional-grade waterless cleaning solutions that
                protect your car's paint, leave zero water spots, and are kinder
                to the environment than traditional car washes.
              </p>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="rounded-3xl bg-card border border-border/50 p-10 text-center"
            >
              <img
                src="/assets/uploads/Logo-1.png"
                alt="Cleanzo logo"
                className="h-20 w-auto mx-auto mb-5 object-contain"
              />
              <p className="text-2xl font-display font-bold text-gradient-blue mb-2">
                Daily Shine | Zero Hassle
              </p>
              <p className="text-sm text-muted-foreground">
                Our promise to you, every single morning.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-secondary/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent mb-3">
                What drives us
              </p>
              <h2 className="text-3xl font-display font-bold">Our values</h2>
            </motion.div>
            <motion.div
              variants={stagger}
              className="grid md:grid-cols-3 gap-6"
            >
              {VALUES.map(({ icon: Icon, title, desc }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="p-7 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {desc}
                  </p>
                </motion.div>
              ))}
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
