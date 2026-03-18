import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { motion } from "motion/react";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { PageDecor3D } from "../components/PageDecor3D";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const SECTIONS = [
  {
    id: "data-collected",
    title: "What data we collect",
    content: `We collect the following personal information when you register or use Cleanzo:

• Full name, email address, and phone number
• Vehicle details: car number, car model, and car type (Hatchback / Sedan / Mid-SUV / SUV)
• Identity documents for crew members: Aadhaar card, Voter ID, and PAN card (uploaded securely)
• Payment information processed via Razorpay (we do not store card details directly)
• Device and usage data: IP address, browser type, and pages visited (via cookies)

All data is collected with your explicit consent at the time of registration.`,
  },
  {
    id: "how-used",
    title: "How we use your data",
    content: `Your data is used solely for the following purposes:

• Service delivery: scheduling and completing your daily car exterior cleaning
• Crew onboarding and assignment management
• Subscription billing and payment processing via Razorpay
• Customer support and grievance resolution
• Fraud prevention and platform security
• Sending service notifications (SMS/email), only with your consent

We do NOT use your data for targeted advertising or sell it to third parties.`,
  },
  {
    id: "data-sharing",
    title: "Data sharing & third parties",
    content: `Cleanzo does not sell, rent, or trade your personal data. Limited sharing occurs only in these cases:

• Razorpay: Payment processing only. Governed by Razorpay's own Privacy Policy.
• Government authorities: If required by law under the IT Act 2000 or any court order.
• Internal crew: Your car number and location are shared with the assigned crew member to complete your service.

All third-party partners are contractually bound to handle your data with equivalent data protection standards.`,
  },
  {
    id: "user-rights",
    title: "Your rights (DPDP Act 2023)",
    content: `Under India's Digital Personal Data Protection Act 2023, you have the following rights:

• Right to Access: Request a copy of all personal data we hold about you.
• Right to Correction: Request correction of inaccurate or incomplete data.
• Right to Erasure: Request deletion of your personal data. We will process this within 30 days.
• Right to Grievance Redressal: Lodge a complaint with our Grievance Officer (see section below).
• Right to Nominate: Nominate another person to exercise your rights in case of incapacity or death.

To exercise any of these rights, email us at: grievance@trycleanzo.in`,
  },
  {
    id: "retention",
    title: "Data retention",
    content: `We retain your data as follows:

• Active subscribers: Data is retained for the duration of your active subscription.
• Post-cancellation: Data is retained for 90 days after subscription cancellation to handle disputes and refund claims.
• Crew members: Identity documents are retained for 1 year after the end of engagement for compliance purposes.
• After the retention period, all personal data is securely deleted or anonymised.

You may request early deletion by contacting grievance@trycleanzo.in`,
  },
  {
    id: "security",
    title: "Data security",
    content: `Cleanzo takes the security of your personal data seriously:

• All data is transmitted over HTTPS (TLS encryption).
• Identity documents are stored with access-controlled, encrypted storage.
• Payment data is handled exclusively by Razorpay; Cleanzo does not store raw card or bank details.
• We conduct periodic security reviews and follow industry best practices.
• In case of a data breach, we will notify affected users and the relevant authority within 72 hours as required by applicable law.`,
  },
  {
    id: "cookies",
    title: "Cookie policy",
    content: `Cleanzo uses cookies for the following purposes:

• Functional cookies: Required for login sessions, preferences (light/dark mode), and core app functionality. These cannot be disabled without affecting service.
• Analytics cookies: Used via privacy-friendly analytics to understand how users navigate the platform (no cross-site tracking).

You may disable non-essential cookies through your browser settings. Functional cookies are necessary for the platform to work correctly.

We do NOT use advertising or cross-site tracking cookies.`,
  },
  {
    id: "grievance",
    title: "Grievance Officer (IT Rules 2021)",
    content: `As required under Rule 5(9) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, Cleanzo has appointed a Grievance Officer:

Name: Grievance Officer, Cleanzo
Email: grievance@trycleanzo.in
Address: India

Response timeline: All grievances will be acknowledged within 48 hours and resolved within 30 working days of receipt.

If you believe your data has been mishandled or your rights have been violated, you may also approach the Data Protection Board of India once constituted under the DPDP Act 2023.`,
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: `We may update this Privacy Policy from time to time. When we make significant changes, we will:

• Post the updated policy on this page with a revised "Last Updated" date.
• Notify active subscribers via email or in-app notification.

Continued use of Cleanzo after changes are posted constitutes your acceptance of the updated policy.

Effective Date: April 1, 2025
Last Updated: March 18, 2026`,
  },
];

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header onJoinOwner={() => {}} onJoinCrew={() => {}} />

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageDecor3D variant="orbs" />
        </div>
        <div className="relative z-[1] max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="w-7 h-7 text-primary" />
              </div>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="flex justify-center gap-2 mb-4"
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                IT Act 2000
              </Badge>
              <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                DPDP Act 2023
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl font-display font-extrabold leading-tight mb-5"
            >
              Your data, <span className="text-gradient-blue">your rules</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
            >
              We believe in full transparency. Here's exactly what we collect,
              why, and how you can control it.
            </motion.p>
            <motion.p
              variants={fadeUp}
              className="text-xs text-muted-foreground mt-4"
            >
              Effective: April 1, 2025 · Last updated: March 18, 2026
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <Accordion
                type="multiple"
                className="space-y-3"
                defaultValue={["data-collected"]}
              >
                {SECTIONS.map((section) => (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="bg-card border border-border/60 rounded-xl px-6 overflow-hidden"
                    data-ocid="privacy.panel"
                  >
                    <AccordionTrigger className="text-base font-semibold hover:no-underline py-5">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5 whitespace-pre-line">
                      {section.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/20"
            >
              <p className="text-sm text-foreground font-semibold mb-2">
                📬 Questions about your data?
              </p>
              <p className="text-sm text-muted-foreground">
                Email us at{" "}
                <a
                  href="mailto:grievance@trycleanzo.in"
                  className="text-primary hover:underline font-medium"
                >
                  grievance@trycleanzo.in
                </a>{" "}
                and we'll get back to you within 30 working days.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
