import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  isFuture,
  isToday,
  parseISO,
  startOfMonth,
} from "date-fns";
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  CreditCard,
  Droplets,
  Lock,
  LogOut,
  SkipForward,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CarType } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  AssignmentStatus,
  useCarOwnerProfile,
  useScheduleForUser,
  useSkipDay,
  useSkipDays,
} from "../hooks/useQueries";

const CAR_TYPE_LABELS: Record<CarType, string> = {
  [CarType.hatchback]: "Hatchback",
  [CarType.sedan]: "Sedan",
  [CarType.midSUV]: "Mid-SUV",
  [CarType.SUV]: "SUV",
};

const DAY_HEADERS = [
  { key: "sun", label: "S" },
  { key: "mon", label: "M" },
  { key: "tue", label: "T" },
  { key: "wed", label: "W" },
  { key: "thu", label: "T" },
  { key: "fri", label: "F" },
  { key: "sat", label: "S" },
];

const MAX_SKIPS = 7;

const statusConfig = {
  [AssignmentStatus.pending]: {
    label: "Pending",
    icon: Clock,
    className: "bg-secondary text-secondary-foreground",
  },
  [AssignmentStatus.done]: {
    label: "Done",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800",
  },
  [AssignmentStatus.skipped]: {
    label: "Skipped",
    icon: SkipForward,
    className: "bg-accent/20 text-accent-foreground",
  },
};

export function OwnerDashboard() {
  const { identity, clear } = useInternetIdentity();
  const principal = identity?.getPrincipal();
  const [currentMonth] = useState(new Date());

  const { data: profile, isLoading: profileLoading } =
    useCarOwnerProfile(principal);
  const { data: skipDays = [], isLoading: skipLoading } =
    useSkipDays(principal);
  const { data: schedule = [], isLoading: scheduleLoading } =
    useScheduleForUser(principal);
  const { mutateAsync: skipDay, isPending: isSkipping } = useSkipDay();

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const thisMonthSkips = skipDays.filter((d) => {
    const date = parseISO(d);
    return (
      date.getMonth() === currentMonth.getMonth() &&
      date.getFullYear() === currentMonth.getFullYear()
    );
  });

  const remainingSkips = MAX_SKIPS - thisMonthSkips.length;

  const handleSkipDay = async (date: Date) => {
    if (remainingSkips <= 0) {
      toast.error("You've used all 7 skip days this month.");
      return;
    }
    const dateStr = format(date, "yyyy-MM-dd");
    if (skipDays.includes(dateStr)) {
      toast.info("This day is already skipped.");
      return;
    }
    try {
      await skipDay(dateStr);
      toast.success(`Skipped ${format(date, "MMMM d")} successfully.`);
    } catch {
      toast.error("Failed to skip day. Please try again.");
    }
  };

  const upcomingAssignments = schedule
    .filter((a) => {
      const date = parseISO(a.date);
      return isFuture(date) || isToday(date);
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 10);

  const firstDayOffset = monthDays[0].getDay();
  const emptySlots = Array.from({ length: firstDayOffset }, (_, i) => i);

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton
            className="h-24 w-full rounded-2xl"
            data-ocid="owner.loading_state"
          />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/60">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-700 text-base">Cleanzo</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={clear}
            className="text-muted-foreground"
            data-ocid="nav.button"
          >
            <LogOut className="w-4 h-4 mr-1.5" /> Sign out
          </Button>
        </div>
      </header>

      <main
        className="max-w-4xl mx-auto px-4 py-8 space-y-8"
        data-ocid="owner.dashboard.panel"
      >
        {/* Welcome card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-primary p-6 shadow-hero"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-24 translate-x-24" />
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-primary-foreground/70 text-sm font-medium mb-1">
                  Welcome back,
                </p>
                <h1 className="text-3xl font-display font-800 text-white">
                  {profile?.name ?? "Car Owner"}
                </h1>
              </div>
              <Badge
                className={
                  profile?.subscriptionActive
                    ? "bg-green-400/20 text-green-100 border-green-400/30"
                    : "bg-red-400/20 text-red-100 border-red-400/30"
                }
              >
                {profile?.subscriptionActive ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
            {profile && (
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                  <Car className="w-4 h-4" />
                  <span>
                    {profile.carNumber} · {profile.carModel}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-primary-foreground/80">
                  <span className="font-medium">
                    {CAR_TYPE_LABELS[profile.carType]}
                  </span>
                  <span>·</span>
                  <span>&#8377;{Number(profile.priceSegment)}/month</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment Gateway Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl p-6 border border-border shadow-card"
          data-ocid="owner.payment.card"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-display font-700">Payment</h2>
                <p className="text-xs text-muted-foreground">
                  Subscription billing
                </p>
              </div>
            </div>
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
              Coming Soon
            </Badge>
          </div>
          <div className="rounded-xl border border-dashed border-border/70 bg-secondary/30 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Lock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Razorpay Gateway
                </p>
                <p className="text-xs text-muted-foreground">
                  UPI · Credit/Debit Cards · Net Banking · Wallets
                </p>
              </div>
            </div>
            {profile && (
              <div className="text-right">
                <p className="text-xl font-display font-800 text-foreground">
                  &#8377;{Number(profile.priceSegment)}
                </p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Razorpay integration is being activated. You'll be notified when
            payments go live.
          </p>
        </motion.div>

        {/* Skip Day Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-display font-700">Skip Days</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Click a future date to skip service that day.
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-display font-800 text-foreground">
                {remainingSkips}
              </p>
              <p className="text-xs text-muted-foreground">of 7 skips left</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold text-center text-muted-foreground mb-3">
              {format(currentMonth, "MMMM yyyy")}
            </p>
            <div className="grid grid-cols-7 mb-1">
              {DAY_HEADERS.map(({ key, label }) => (
                <div
                  key={key}
                  className="text-center text-xs font-semibold text-muted-foreground py-1"
                >
                  {label}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {emptySlots.map((slot) => (
                <div key={`empty-${slot}`} />
              ))}
              {monthDays.map((day) => {
                const dateStr = format(day, "yyyy-MM-dd");
                const isSkipped = skipDays.includes(dateStr);
                const isClickable =
                  (isFuture(day) || isToday(day)) && !isSkipped;
                const isPast = !isFuture(day) && !isToday(day);
                return (
                  <button
                    type="button"
                    key={dateStr}
                    onClick={() => isClickable && handleSkipDay(day)}
                    disabled={isSkipping || !isClickable}
                    className={[
                      "relative flex items-center justify-center h-9 w-full rounded-lg text-sm font-medium transition-all",
                      isSkipped
                        ? "bg-accent/20 text-accent-foreground font-bold"
                        : isToday(day)
                          ? "bg-primary text-primary-foreground"
                          : isPast
                            ? "text-muted-foreground/50 cursor-default"
                            : "hover:bg-secondary text-foreground cursor-pointer",
                    ].join(" ")}
                    data-ocid="owner.skip_day.button"
                  >
                    {day.getDate()}
                    {isSkipped && <span className="skip-day-dot" />}
                  </button>
                );
              })}
            </div>
          </div>

          {thisMonthSkips.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Skipped:</span>{" "}
                {thisMonthSkips
                  .map((d) => format(parseISO(d), "MMM d"))
                  .join(", ")}
              </p>
            </div>
          )}

          {skipLoading && (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground mt-2"
              data-ocid="owner.loading_state"
            >
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              Loading skip days...
            </div>
          )}
        </motion.div>

        {/* Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <h2 className="text-xl font-display font-700 mb-5">
            Upcoming Schedule
          </h2>

          {scheduleLoading ? (
            <div className="space-y-3" data-ocid="owner.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : upcomingAssignments.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="owner.schedule.empty_state"
            >
              <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No upcoming assignments found.
              </p>
              <p className="text-muted-foreground/60 text-xs mt-1">
                Your schedule will appear once crew is assigned.
              </p>
            </div>
          ) : (
            <ul className="space-y-2" data-ocid="owner.schedule.list">
              {upcomingAssignments.map((assignment, idx) => {
                const config = statusConfig[assignment.status];
                const Icon = config.icon;
                return (
                  <li
                    key={assignment.date}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors"
                    data-ocid={`owner.schedule.item.${idx + 1}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {format(parseISO(assignment.date), "EEEE, MMMM d")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Service: 5:00 AM to 10:00 AM
                        </p>
                      </div>
                    </div>
                    <Badge className={config.className}>
                      <Icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      </main>

      <footer className="py-6 border-t border-border mt-8">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
