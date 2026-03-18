import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { RefreshCw } from "lucide-react";
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
    id: "cancellation",
    title: "Cancellation Policy",
    content: `You can cancel your Cleanzo subscription at any time, with no questions asked:

• Login to your dashboard and navigate to Subscription Settings.
• Click "Cancel Subscription" and confirm.
• Your service will continue until the last day of your current billing cycle.
• No further charges will be made after cancellation.

You will not be charged for the next month once you cancel. If you cancel mid-cycle, please refer to the Refund Eligibility section below.`,
  },
  {
    id: "refund-eligibility",
    title: "Refund Eligibility (7-Day Window)",
    content: `Cleanzo offers a partial refund under the following conditions:

• If you cancel within 7 days of your payment date, you are eligible for a 50% refund on unused subscription days.
• Example: If you paid Rs.399 on March 1 and cancel on March 5 (having used 4 days), you will receive a 50% refund on the remaining 26 days, calculated proportionally.
• If you cancel after 7 days from the payment date, no refund is applicable for that billing cycle.
• Refunds are not applicable for skip days -- skipping a day does not entitle you to a refund of that day's service cost.

This policy is in accordance with the Consumer Protection Act 2019, India.`,
  },
  {
    id: "refund-process",
    title: "Refund Processing",
    content: `Approved refunds are processed as follows:

• Refund method: Original payment method (credit card, debit card, UPI, or net banking via Razorpay).
• Processing time: 7 to 10 business days from the date your refund is approved.
• You will receive a confirmation email once the refund is initiated.

If you do not receive the refund within 10 business days, please contact us at support@trycleanzo.in with your booking ID and payment details.`,
  },
  {
    id: "crew-payments",
    title: "Crew Member Payments & Disputes",
    content: `Crew members are paid on a weekly basis, subject to the following:

• Payment eligibility: Completion of assigned service tasks during the week.
• Payment schedule: Every Friday for work completed Mon through Sun of the previous week.
• Minimum hours: Crew must complete at least 5 hours of work per day to be eligible for daily pay.

Payment Disputes:
• If a crew member believes their payment is incorrect, they must raise a dispute within 7 days of the payment date.
• Disputes are reviewed and resolved within 14 business days.
• To raise a dispute, email: support@trycleanzo.in with your crew ID and the week in question.`,
  },
  {
    id: "non-refundable",
    title: "Non-Refundable Situations",
    content: `The following situations are not eligible for refunds:

• Cancellation after the 7-day window from payment date.
• Service skipped at the customer's request (skip days).
• Service interrupted due to force majeure (weather, government orders, natural disasters).
• Account terminated due to violation of our Terms & Conditions.
• Partial service completion due to vehicle inaccessibility caused by the customer.

In disputed cases, our support team will review the situation fairly and in good faith.`,
  },
  {
    id: "contact",
    title: "Refund Queries & Support",
    content: `For all refund-related queries:

Email: support@trycleanzo.in
Response time: Within 2 business days

Please include in your email:
• Your registered email address
• Your subscription plan (Standard or SUV)
• Payment date and amount
• Reason for refund request

We are committed to resolving all refund queries fairly and promptly.`,
  },
];

export function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header onJoinOwner={() => {}} onJoinCrew={() => {}} />

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageDecor3D variant="rings" />
        </div>
        <div className="relative z-[1] max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <RefreshCw className="w-7 h-7 text-primary" />
              </div>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="flex justify-center gap-2 mb-4"
            >
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                Consumer Protection Act 2019
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl font-display font-800 leading-tight mb-5"
            >
              Fair & <span className="text-gradient-blue">transparent</span>{" "}
              refunds
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
            >
              We keep it simple. Cancel anytime, get a pro-rata refund within 7
              days of payment.
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

      <section className="py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid sm:grid-cols-3 gap-4"
          >
            {[
              { emoji: "Cancel Anytime", desc: "No lock-in, no exit fees" },
              {
                emoji: "50% Back in 7 Days",
                desc: "On unused subscription days",
              },
              {
                emoji: "7-10 Business Days",
                desc: "For refund to hit your account",
              },
            ].map((item) => (
              <motion.div
                key={item.emoji}
                variants={fadeUp}
                className="text-center p-5 rounded-xl bg-card border border-border/60"
              >
                <p className="font-semibold text-foreground text-sm">
                  {item.emoji}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-10 pb-20">
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
                defaultValue={["cancellation", "refund-eligibility"]}
              >
                {SECTIONS.map((section) => (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="bg-card border border-border/60 rounded-xl px-6 overflow-hidden"
                    data-ocid="refund.panel"
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
                Need help with a refund?
              </p>
              <p className="text-sm text-muted-foreground">
                Email us at{" "}
                <a
                  href="mailto:support@trycleanzo.in"
                  className="text-primary hover:underline font-medium"
                >
                  support@trycleanzo.in
                </a>{" "}
                and we'll sort it within 2 business days.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
