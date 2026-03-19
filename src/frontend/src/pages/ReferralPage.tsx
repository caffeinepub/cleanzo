import { Button } from "@/components/ui/button";
import { CheckCircle2, Gift } from "lucide-react";
import { useState } from "react";
import { CarOwnerRegistrationModal } from "../components/CarOwnerRegistrationModal";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { PageDecor3D } from "../components/PageDecor3D";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export function ReferralPage() {
  const { identity, login } = useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();
  const [ownerModalOpen, setOwnerModalOpen] = useState(false);

  const handleJoinOwner = () => {
    if (!isLoggedIn) {
      login();
    } else {
      setOwnerModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onJoinOwner={handleJoinOwner} />

      {/* Page Hero */}
      <section className="py-24 relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/20" />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageDecor3D variant="stars" />
        </div>
        <div className="relative z-[1] max-w-4xl mx-auto px-6 sm:px-10 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 px-3 py-1.5 rounded-full mb-6">
            <Gift className="w-3 h-3" />
            Referral Program
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold mb-5 leading-tight">
            Share Cleanzo,
            <br />
            <span className="text-gradient-blue">earn ₹100 every month</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Love having a spotless car every morning? Tell a friend. When a
            friend subscribes using your link, you get ₹100 off your next
            month's subscription. The discount is your reward for spreading the
            word. No limits on how many friends you can refer.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-14">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                step: "01",
                title: "Share your link",
                desc: "Log in to your dashboard and copy your unique referral link. Share it with friends, family, or your housing society WhatsApp group.",
              },
              {
                step: "02",
                title: "Friend subscribes",
                desc: "Your friend signs up using your referral link and activates a Cleanzo subscription for their car.",
              },
              {
                step: "03",
                title: "You save ₹100",
                desc: "You automatically get ₹100 credited to your next month's subscription as a thank-you for the referral. No forms, no waiting — just a lower bill next month.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="relative p-8 rounded-2xl bg-card border border-border/60 hover:border-indigo-400/40 transition-all hover:-translate-y-1.5 overflow-hidden"
                data-ocid={`referral.item.${step}`}
              >
                <span className="absolute -top-4 -right-2 text-9xl font-display font-extrabold text-foreground/5 select-none">
                  {step}
                </span>
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-5">
                    <Gift className="w-6 h-6 text-indigo-500" />
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Reward card */}
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-5">
                Why our referral program is different
              </h2>
              <ul className="space-y-4">
                {[
                  "You get ₹100 off your next month when your friend subscribes",
                  "No limit on how many friends you refer",
                  "Credit is applied automatically — no claim process",
                  "Works with all Cleanzo subscription plans",
                  "Referral link available in your dashboard immediately after signup",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-muted-foreground"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-shrink-0 w-full lg:w-96">
              <div className="p-10 rounded-2xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 shadow-xl shadow-indigo-100/50 dark:shadow-indigo-900/20 text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-5">
                  <Gift className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-2">
                  Refer a Friend
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Get ₹100 off your next month
                </p>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-5 mb-7">
                  <p className="text-4xl font-display font-extrabold text-indigo-600 dark:text-indigo-300">
                    ₹100
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    credited to you per successful referral
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
                <p className="text-xs text-muted-foreground mt-3">
                  Sign up first to get your referral link
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <CarOwnerRegistrationModal
        open={ownerModalOpen}
        onOpenChange={() => setOwnerModalOpen(false)}
        onSuccess={() => setOwnerModalOpen(false)}
      />
    </div>
  );
}
