import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollText } from "lucide-react";
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
    id: "acceptance",
    title: "Acceptance of Terms",
    content: `By accessing or using Cleanzo (available at trycleanzo.in), you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree, please do not use our services.

These terms constitute a legally binding agreement between you and Cleanzo. By creating an account, you confirm that you are at least 18 years of age and have the legal capacity to enter into contracts.`,
  },
  {
    id: "service-scope",
    title: "Service Scope & Hours",
    content: `Cleanzo provides professional car exterior cleaning services, including:

• Dust and dirt removal
• Bird dropping removal
• Tree leaves and debris removal
• Exterior surface wiping

Service hours: 5:00 AM to 10:00 AM, seven days a week (subject to availability).

Cleanzo does not offer: interior cleaning, car washing with water, polishing, waxing, or any mechanical services. We are an exterior dry-cleaning subscription service only.`,
  },
  {
    id: "subscription",
    title: "Subscription & Pricing",
    content: `Cleanzo operates on a monthly auto-renewing subscription model:

• Standard Plan (Hatchback / Sedan / Mid-SUV): Rs.399 per month
• SUV Plan (Large SUV / 7-seaters): Rs.449 per month

Subscriptions auto-renew on the same date each month. By subscribing, you authorise Cleanzo to charge your chosen payment method via Razorpay on the renewal date.

Pricing may change with 30 days' prior notice to active subscribers. Continued use after the price change constitutes acceptance of the new pricing.`,
  },
  {
    id: "skip-days",
    title: "Skip Days Policy",
    content: `Subscribers may skip service on up to 7 days per calendar month.

• Skip requests must be submitted in advance via the customer dashboard.
• Skipped days do not carry over to the next month.
• Skip days are reset at the start of each billing cycle.
• Skipping does not entitle the subscriber to a pro-rata refund; please refer to our Refund Policy for details.

If you require more than 7 skip days in a month, please contact support@trycleanzo.in.`,
  },
  {
    id: "user-obligations",
    title: "User Obligations",
    content: `As a Cleanzo subscriber, you agree to:

• Ensure your vehicle is accessible (parked in the designated spot) before 5:00 AM on scheduled service days.
• Provide accurate vehicle information (car number, model, and type) during registration.
• Not provide false identity information.
• Refrain from harassing, threatening, or mistreating crew members.
• Notify us of any changes to your vehicle or address via the dashboard or at support@trycleanzo.in.

Violation of these obligations may result in immediate suspension or termination of your subscription without refund.`,
  },
  {
    id: "crew-terms",
    title: "Crew Member Terms",
    content: `Crew members joining the Cleanzo workforce agree to:

• Upload two valid government-issued identity documents: Aadhaar card or Voter ID, AND PAN card. Both are mandatory for onboarding.
• Commit to working a minimum of 5 hours daily per assigned shift.
• Complete all assigned cleaning tasks within the 5:00 AM to 10:00 AM window.
• Maintain professional conduct and respect subscribers' property.

Payment for crew members is processed weekly, subject to satisfactory completion of assigned work. Disputes are resolved within 14 business days.

Crew members are engaged as independent service partners, not employees, unless a separate written employment agreement exists.`,
  },
  {
    id: "availability",
    title: "Service Availability & Force Majeure",
    content: `Cleanzo will make every effort to provide daily service. However, service may be suspended or delayed due to:

• Adverse weather conditions (heavy rain, storms, heatwaves)
• Public holidays and government-declared lockdowns
• Force majeure events including natural disasters, pandemics, or civil unrest
• Crew unavailability due to illness or unforeseen emergencies

In such cases, Cleanzo will notify subscribers as early as possible. Suspended days due to force majeure are not eligible for refunds but will not count against your monthly skip day quota.`,
  },
  {
    id: "liability",
    title: "Limitation of Liability",
    content: `Cleanzo is not responsible for:

• Pre-existing damage to your vehicle prior to service commencement.
• Damage caused by unknown contaminants already present on the vehicle surface.
• Loss of personal items left in or on the vehicle.
• Consequential or indirect losses arising from service interruptions.

Our total liability to you for any claim arising out of or in connection with these Terms shall not exceed the total subscription fees paid by you in the 3 months preceding the claim.

Nothing in these Terms limits liability for fraud, gross negligence, or death/personal injury caused by our negligence.`,
  },
  {
    id: "governing-law",
    title: "Governing Law & Jurisdiction",
    content: `These Terms & Conditions are governed by and construed in accordance with the laws of the Republic of India.

Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts in India.

For legal correspondence, write to: legal@trycleanzo.in

We encourage all disputes to first be resolved through our grievance redressal process before initiating legal proceedings.`,
  },
  {
    id: "termination",
    title: "Termination",
    content: `Either party may terminate the subscription at any time:

• Customers: Cancel anytime from the dashboard. Service continues until end of the current billing cycle. See our Refund Policy for pro-rata refund eligibility.
• Cleanzo: We reserve the right to terminate accounts for violation of these Terms, fraudulent activity, or non-payment. We will provide reasonable notice where possible.

Upon termination, your personal data will be handled as described in our Privacy Policy.`,
  },
];

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header onJoinOwner={() => {}} onJoinCrew={() => {}} />

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute inset-0 z-0 pointer-events-none">
          <PageDecor3D variant="sparkles" />
        </div>
        <div className="relative z-[1] max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex justify-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                <ScrollText className="w-7 h-7 text-accent" />
              </div>
            </motion.div>
            <motion.div
              variants={fadeUp}
              className="flex justify-center gap-2 mb-4"
            >
              <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
                India Law
              </Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                Consumer Protection Act 2019
              </Badge>
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl font-display font-800 leading-tight mb-5"
            >
              Terms that <span className="text-gradient-blue">make sense</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
            >
              No legalese walls of text. We've written our terms to be clear,
              fair, and actually readable.
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
                defaultValue={["acceptance", "service-scope"]}
              >
                {SECTIONS.map((section) => (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="bg-card border border-border/60 rounded-xl px-6 overflow-hidden"
                    data-ocid="terms.panel"
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
              className="mt-10 p-6 rounded-2xl bg-accent/5 border border-accent/20"
            >
              <p className="text-sm text-foreground font-semibold mb-2">
                Legal questions?
              </p>
              <p className="text-sm text-muted-foreground">
                Reach our legal team at{" "}
                <a
                  href="mailto:legal@trycleanzo.in"
                  className="text-accent hover:underline font-medium"
                >
                  legal@trycleanzo.in
                </a>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
