import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Link, useNavigate } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import {
  AlertCircle,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Droplets,
  Loader2,
  LogOut,
  SkipForward,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Assignment } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  AssignmentStatus,
  useCrewAssignments,
  useCrewMemberProfile,
  useMarkAssignmentDone,
} from "../hooks/useQueries";

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

interface AssignmentCardProps {
  assignment: Assignment;
  index: number;
  onMarkDone: (carOwnerId: Principal, date: string) => void;
  isMarkingDone: boolean;
}

function AssignmentCard({
  assignment,
  index,
  onMarkDone,
  isMarkingDone,
}: AssignmentCardProps) {
  const config = statusConfig[assignment.status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-xs hover:shadow-card transition-all"
      data-ocid={`crew.assignment.item.${index + 1}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Car className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {assignment.carOwnerId.toString().slice(0, 12)}…
          </p>
          <p className="text-xs text-muted-foreground">
            {format(parseISO(assignment.date), "EEEE, MMMM d")}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={config.className}>
          <Icon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
        {assignment.status === AssignmentStatus.pending && (
          <Button
            size="sm"
            onClick={() => onMarkDone(assignment.carOwnerId, assignment.date)}
            disabled={isMarkingDone}
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            data-ocid={`crew.mark_done.button.${index + 1}`}
          >
            {isMarkingDone ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Done
              </>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function CrewDashboard() {
  const { identity, clear } = useInternetIdentity();
  const navigate = useNavigate();
  const principal = identity?.getPrincipal();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  const { data: profile, isLoading: profileLoading } =
    useCrewMemberProfile(principal);
  const { data: assignments = [], isLoading: assignmentsLoading } =
    useCrewAssignments(principal, selectedDate);
  const { mutateAsync: markDone, isPending: isMarkingDone } =
    useMarkAssignmentDone();

  const handleMarkDone = async (carOwnerId: Principal, date: string) => {
    try {
      await markDone({ carOwnerId, date });
      toast.success("Assignment marked as done!");
    } catch {
      toast.error("Failed to update assignment.");
    }
  };

  const pendingCount = assignments.filter(
    (a) => a.status === AssignmentStatus.pending,
  ).length;
  const doneCount = assignments.filter(
    (a) => a.status === AssignmentStatus.done,
  ).length;

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
            onClick={async () => {
              await clear();
              navigate({ to: "/" });
            }}
            className="text-muted-foreground"
            data-ocid="nav.button"
          >
            <LogOut className="w-4 h-4 mr-1.5" /> Sign out
          </Button>
        </div>
      </header>

      <main
        className="max-w-4xl mx-auto px-4 py-8 space-y-6"
        data-ocid="crew.dashboard.panel"
      >
        {/* Waiting for approval banner */}
        {profile && !profile.isActive && (
          <div
            className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4"
            data-ocid="crew.dashboard.panel"
          >
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                Your account is waiting for admin approval.
              </p>
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
                We will notify you once your profile is verified and activated.
                Usually takes 24 to 48 hours.
              </p>
            </div>
          </div>
        )}
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-foreground p-6 shadow-hero"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full -translate-y-20 translate-x-20" />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Crew Dashboard</p>
              <h1 className="text-3xl font-display font-800 text-white">
                {profileLoading
                  ? "Loading..."
                  : (profile?.name ?? "Crew Member")}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Service hours: 5:00 AM – 10:00 AM
              </p>
            </div>
            <Badge
              className={
                profile?.isActive
                  ? "bg-green-400/20 text-green-100"
                  : "bg-red-400/20 text-red-100"
              }
            >
              {profile?.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="relative mt-4 flex gap-6">
            <div>
              <p className="text-2xl font-display font-800 text-white">
                {pendingCount}
              </p>
              <p className="text-xs text-white/60">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-display font-800 text-accent">
                {doneCount}
              </p>
              <p className="text-xs text-white/60">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-display font-800 text-white">
                {assignments.length}
              </p>
              <p className="text-xs text-white/60">Total today</p>
            </div>
          </div>
        </motion.div>

        {/* Date picker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border"
        >
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-primary shrink-0" />
            <div className="flex-1">
              <Label htmlFor="crew-date" className="text-sm font-semibold">
                View assignments for
              </Label>
              <Input
                id="crew-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 w-full max-w-xs"
                data-ocid="crew.dashboard.input"
              />
            </div>
          </div>
        </motion.div>

        {/* Assignments list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <h2 className="text-xl font-display font-700 mb-4">
            Assignments · {format(parseISO(selectedDate), "MMM d, yyyy")}
          </h2>

          {assignmentsLoading ? (
            <div className="space-y-3" data-ocid="crew.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : assignments.length === 0 ? (
            <div
              className="text-center py-10"
              data-ocid="crew.assignment.empty_state"
            >
              <AlertCircle className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground">
                No assignments for this date.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment, idx) => (
                <AssignmentCard
                  key={`${assignment.carOwnerId.toString()}-${assignment.date}`}
                  assignment={assignment}
                  index={idx}
                  onMarkDone={handleMarkDone}
                  isMarkingDone={isMarkingDone}
                />
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <footer className="py-6 border-t border-border mt-8">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
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
