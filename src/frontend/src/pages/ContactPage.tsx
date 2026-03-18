import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import { Globe, Mail, Send, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { SiFacebook, SiInstagram } from "react-icons/si";
import { toast } from "sonner";
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

export function ContactPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const navigate = useNavigate();
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);
  const [crewModalOpen, setCrewModalOpen] = useState(false);
  const { data: role } = useUserRole();
  const principal = isLoggedIn ? identity.getPrincipal() : undefined;
  const { data: carOwnerProfile } = useCarOwnerProfile(principal);
  const { data: crewProfile } = useCrewMemberProfile(principal);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    setSending(false);
    setName("");
    setEmail("");
    setMessage("");
    toast.success("Message sent! We'll get back to you soon.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onJoinOwner={handleJoinOwner} onJoinCrew={handleJoinCrew} />

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
              Contact
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl font-display font-800 leading-tight mb-6"
            >
              Get in <span className="text-gradient-blue">touch</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
            >
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
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
            className="grid md:grid-cols-2 gap-12"
          >
            <motion.div variants={fadeUp}>
              <h2 className="text-2xl font-display font-700 mb-6">
                Send us a message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="contact-name">Your name</Label>
                  <Input
                    id="contact-name"
                    placeholder="Rahul Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-card border-border/60"
                    data-ocid="contact.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-email">Email address</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="rahul@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-card border-border/60"
                    data-ocid="contact.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us how we can help..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    className="bg-card border-border/60 resize-none"
                    data-ocid="contact.textarea"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="contact.submit_button"
                >
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-8">
              <div>
                <h2 className="text-2xl font-display font-700 mb-6">
                  Connect with us
                </h2>
                <div className="space-y-4">
                  <a
                    href="https://instagram.com/trycleanzo.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all group"
                    data-ocid="contact.link"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <SiInstagram className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Instagram
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @trycleanzo.in
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://facebook.com/trycleanzo.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all group"
                    data-ocid="contact.link"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <SiFacebook className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Facebook
                      </p>
                      <p className="text-xs text-muted-foreground">
                        trycleanzo.in
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://trycleanzo.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all group"
                    data-ocid="contact.link"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Website
                      </p>
                      <p className="text-xs text-muted-foreground">
                        trycleanzo.in
                      </p>
                    </div>
                  </a>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-card border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Service hours
                </p>
                <p className="text-sm text-muted-foreground">
                  Daily — 5:00 AM to 10:00 AM
                </p>
                <p className="text-xs text-primary font-medium mt-3 tracking-widest uppercase">
                  Daily Shine | Zero Hassle
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Grievance Officer */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              className="rounded-2xl bg-card border border-border/60 p-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-display font-700 mb-1">
                    Grievance Officer
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    As required under IT Rules 2021 (India)
                  </p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-secondary/40">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        Name
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        Grievance Officer, Cleanzo
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/40">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        Email
                      </p>
                      <a
                        href="mailto:grievance@trycleanzo.in"
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        grievance@trycleanzo.in
                      </a>
                    </div>
                    <div className="p-4 rounded-xl bg-secondary/40 sm:col-span-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                        Response Time
                      </p>
                      <p className="text-sm text-foreground">
                        Within{" "}
                        <span className="font-semibold">30 working days</span>{" "}
                        of receiving your complaint, as mandated by IT Rules
                        2021.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
