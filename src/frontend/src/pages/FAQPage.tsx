import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { PageDecor3D } from "../components/PageDecor3D";

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
  {
    q: "How do I sign up?",
    a: "Click 'Get Started' on the homepage, fill in your car details, and choose your plan. The entire process takes less than 2 minutes.",
  },
  {
    q: "Is Cleanzo available in my area?",
    a: "We are currently launching in Noida. If you live in Noida, join our waitlist to get priority access. We're expanding rapidly and will be in more cities soon.",
  },
];

export function FAQPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Page Hero */}
      <section className="py-24 relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/60 via-white to-blue-50/30 dark:from-slate-800/60 dark:via-slate-900/40 dark:to-blue-950/30" />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageDecor3D variant="helix" />
        </div>
        <div className="relative z-[1] max-w-4xl mx-auto px-6 sm:px-10 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full mb-6">
            FAQs
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold mb-5 leading-tight">
            Common questions,
            <br />
            <span className="text-gradient-blue">honest answers</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Everything you need to know before you subscribe. Still have a
            question? WhatsApp us and we'll reply within minutes.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 relative">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div
                key={faq.q}
                className="bg-card border border-border/60 rounded-2xl overflow-hidden"
                data-ocid={`faq.item.${i + 1}`}
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

          <div className="mt-14 p-8 rounded-2xl bg-primary/5 border border-primary/20 text-center">
            <p className="font-semibold text-foreground mb-2">
              Still have a question?
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Our team is available every day from 5am to 10am on WhatsApp.
            </p>
            <a
              href="https://wa.me/919555860362"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-6 py-3 rounded-full transition-colors"
              data-ocid="faq.primary_button"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
