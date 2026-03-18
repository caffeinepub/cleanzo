import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Principal } from "@icp-sdk/core/principal";
import { Link, useNavigate } from "@tanstack/react-router";
import { format, parseISO, startOfWeek } from "date-fns";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  DollarSign,
  Droplets,
  Info,
  Loader2,
  LogOut,
  SkipForward,
  Timer,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { ApprovalStatus, CarType } from "../backend";
import type { CrewMemberProfile } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  AssignmentStatus,
  useActiveCarOwners,
  useActiveCrewMembers,
  useAllCarOwners,
  useAllCrewMembers,
  useApproveCrewMember,
  useAssignCarOwnerToCrewMember,
  useAttendanceLogs,
  useDailySchedule,
  useGetWaitlistEntries,
  useRejectCrewMember,
  useReleaseWeeklyPayment,
  useWeeklyHoursSummary,
} from "../hooks/useQueries";

const CAR_TYPE_LABELS: Record<CarType, string> = {
  [CarType.hatchback]: "Hatchback",
  [CarType.sedan]: "Sedan",
  [CarType.midSUV]: "Mid-SUV",
  [CarType.SUV]: "SUV",
};

const statusConfig = {
  [AssignmentStatus.pending]: {
    label: "Pending",
    icon: Clock,
    className: "bg-secondary text-secondary-foreground",
  },
  [AssignmentStatus.done]: {
    label: "Done",
    icon: CheckCircle2,
    className: "bg-green-900/40 text-green-300",
  },
  [AssignmentStatus.skipped]: {
    label: "Skipped",
    icon: SkipForward,
    className: "bg-amber-400/20 text-amber-300",
  },
};

function formatNsTime(ns: bigint): string {
  return format(new Date(Number(ns) / 1_000_000), "hh:mm a");
}

function CrewAttendanceRow({
  crewPrincipal,
  crewProfile,
  index,
}: {
  crewPrincipal: Principal;
  crewProfile: CrewMemberProfile;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [weekStart, setWeekStart] = useState(
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd"),
  );
  const [payAmount, setPayAmount] = useState("");

  const { data: logs = [], isLoading: logsLoading } = useAttendanceLogs(
    expanded ? crewPrincipal : undefined,
  );
  const { data: weeklySummary } = useWeeklyHoursSummary(
    expanded ? crewPrincipal : undefined,
    weekStart,
  );
  const { mutateAsync: releasePayment, isPending: isReleasing } =
    useReleaseWeeklyPayment();

  const handleRelease = async () => {
    const amount = Number.parseFloat(payAmount);
    if (!amount || amount <= 0) {
      toast.error("Enter a valid payment amount.");
      return;
    }
    const totalHours = weeklySummary?.totalHours ?? 0;
    try {
      await releasePayment({
        crewMemberId: crewPrincipal,
        weekStart,
        amount: BigInt(Math.round(amount * 100)),
        totalHours,
      });
      toast.success(`Payment of ₹${amount} released for ${crewProfile.name}`);
      setPayAmount("");
    } catch {
      toast.error("Failed to release payment.");
    }
  };

  return (
    <div
      className="border border-border rounded-xl overflow-hidden"
      data-ocid={`admin.attendance.row.${index + 1}`}
    >
      <button
        type="button"
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
        data-ocid={`admin.attendance.toggle.${index + 1}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Timer className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">
              {crewProfile.name}
            </p>
            <p className="text-xs text-muted-foreground">{crewProfile.phone}</p>
          </div>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-border p-5 space-y-5 bg-secondary/20">
          {/* Attendance logs */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Attendance Logs</h4>
            {logsLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No attendance records found.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Clock In</TableHead>
                    <TableHead>Clock Out</TableHead>
                    <TableHead>Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.slice(0, 14).map((log, i) => (
                    <TableRow key={`${log.date}-${i}`}>
                      <TableCell className="text-sm">{log.date}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.clockIn ? formatNsTime(log.clockIn) : "--"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.clockOut ? formatNsTime(log.clockOut) : "--"}
                      </TableCell>
                      <TableCell>
                        {log.hoursWorked !== undefined ? (
                          <Badge className="bg-green-900/30 text-green-300 text-xs">
                            {log.hoursWorked.toFixed(1)}h
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            --
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Release pay form */}
          <div className="p-4 rounded-xl bg-card border border-border">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Release Weekly Payment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Week Starting</Label>
                <Input
                  type="date"
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value)}
                  className="h-8 text-sm"
                  data-ocid={`admin.pay.input.${index + 1}`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Total Hours
                  {weeklySummary && (
                    <span className="text-muted-foreground ml-1">
                      (auto: {weeklySummary.totalHours.toFixed(1)}h)
                    </span>
                  )}
                </Label>
                <Input
                  type="number"
                  placeholder={weeklySummary?.totalHours.toFixed(1) ?? "0"}
                  className="h-8 text-sm"
                  readOnly
                  value={weeklySummary?.totalHours.toFixed(1) ?? ""}
                  data-ocid={`admin.pay.hours.${index + 1}`}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Amount (&#8377;)</Label>
                <Input
                  type="number"
                  placeholder="e.g. 2000"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="h-8 text-sm"
                  data-ocid={`admin.pay.amount.${index + 1}`}
                />
              </div>
            </div>
            <Button
              size="sm"
              className="mt-3 bg-green-600 hover:bg-green-700 text-white text-xs"
              onClick={handleRelease}
              disabled={isReleasing || !payAmount}
              data-ocid={`admin.pay.submit_button.${index + 1}`}
            >
              {isReleasing ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <DollarSign className="w-3 h-3 mr-1" />
              )}
              Release Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminDashboard() {
  const { clear, identity } = useInternetIdentity();
  const navigate = useNavigate();
  const principal = identity?.getPrincipal().toString();
  const [scheduleDate, setScheduleDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [assignCarOwnerId, setAssignCarOwnerId] = useState("");
  const [assignCrewId, setAssignCrewId] = useState("");
  const [assignDate, setAssignDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  const { data: allCarOwners = [], isLoading: ownersLoading } =
    useAllCarOwners();
  const { data: allCrewMembers = [], isLoading: crewLoading } =
    useAllCrewMembers();
  const { data: dailySchedule = [], isLoading: scheduleLoading } =
    useDailySchedule(scheduleDate);
  const { data: activeOwnersData } = useActiveCarOwners();
  const { data: activeCrewData } = useActiveCrewMembers();
  const { data: waitlistEntries = [], isLoading: waitlistLoading } =
    useGetWaitlistEntries();
  const { mutateAsync: assignOwner, isPending: isAssigning } =
    useAssignCarOwnerToCrewMember();
  const { mutateAsync: approveCrew } = useApproveCrewMember();
  const { mutateAsync: rejectCrew } = useRejectCrewMember();

  const activeOwners = activeOwnersData?.[0] ?? [];
  const activeCrew = activeCrewData?.[0] ?? [];

  const activeOwnersCount = allCarOwners.filter(
    (o) => o.subscriptionActive,
  ).length;
  const inactiveOwnersCount = allCarOwners.length - activeOwnersCount;
  const activeCrewCount = allCrewMembers.filter((m) => m.isActive).length;
  const inactiveCrewCount = allCrewMembers.length - activeCrewCount;
  const pendingCrewCount = allCrewMembers.filter(
    (m) => m.approvalStatus === ApprovalStatus.pending,
  ).length;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignCarOwnerId || !assignCrewId || !assignDate) return;
    try {
      const ownerEntry = activeOwners.find(
        ([p]) => p.toString() === assignCarOwnerId,
      );
      const crewEntry = activeCrew.find(([p]) => p.toString() === assignCrewId);
      if (!ownerEntry || !crewEntry) {
        toast.error("Invalid selection.");
        return;
      }
      await assignOwner({
        carOwnerId: ownerEntry[0],
        crewMemberId: crewEntry[0],
        date: assignDate,
      });
      toast.success("Assignment created successfully!");
      setAssignCarOwnerId("");
      setAssignCrewId("");
    } catch {
      toast.error("Failed to create assignment.");
    }
  };

  const handleApprove = async (
    crewEntry: [
      import("@icp-sdk/core/principal").Principal,
      import("../backend").CrewMemberProfile,
    ],
  ) => {
    try {
      await approveCrew(crewEntry[0]);
      toast.success(`${crewEntry[1].name} has been approved.`);
    } catch {
      toast.error("Failed to approve crew member.");
    }
  };

  const handleReject = async (
    crewEntry: [
      import("@icp-sdk/core/principal").Principal,
      import("../backend").CrewMemberProfile,
    ],
  ) => {
    try {
      await rejectCrew(crewEntry[0]);
      toast.success(`${crewEntry[1].name} has been rejected.`);
    } catch {
      toast.error("Failed to reject crew member.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/60">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-base">Cleanzo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-400/15 text-amber-300 border-amber-400/30">
              Admin
            </Badge>
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
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        {/* Admin access note */}
        <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-foreground">
              Admin Access:{" "}
            </span>
            <span className="text-muted-foreground">
              To become admin, sign in and share your Principal ID with support.
              Your Principal ID:{" "}
            </span>
            {principal ? (
              <code className="text-xs bg-secondary px-2 py-0.5 rounded font-mono text-foreground">
                {principal}
              </code>
            ) : (
              <span className="text-muted-foreground">Sign in to view</span>
            )}
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10"
        >
          {[
            {
              icon: Car,
              label: "Total Owners",
              value: allCarOwners.length,
              color: "text-primary",
            },
            {
              icon: Users,
              label: "Crew Members",
              value: allCrewMembers.length,
              color: "text-amber-400",
            },
            {
              icon: UserCheck,
              label: "Active Owners",
              value: activeOwnersCount,
              color: "text-green-400",
            },
            {
              icon: CalendarDays,
              label: "Today's Jobs",
              value: dailySchedule.length,
              color: "text-primary",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="bg-card rounded-2xl p-5 border border-border"
            >
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-3xl font-display font-extrabold text-foreground">
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>

        <Tabs defaultValue="owners">
          <TabsList className="mb-7" data-ocid="admin.tab">
            <TabsTrigger value="owners" data-ocid="admin.tab">
              Car Owners
            </TabsTrigger>
            <TabsTrigger value="crew" data-ocid="admin.tab">
              Crew Members
              {pendingCrewCount > 0 && (
                <span className="ml-1.5 bg-amber-400 text-black text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {pendingCrewCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="attendance" data-ocid="admin.tab">
              Attendance
            </TabsTrigger>
            <TabsTrigger value="waitlist" data-ocid="admin.tab">
              Waitlist
            </TabsTrigger>
            <TabsTrigger value="schedule" data-ocid="admin.tab">
              Daily Schedule
            </TabsTrigger>
            <TabsTrigger value="assign" data-ocid="admin.tab">
              Assign
            </TabsTrigger>
          </TabsList>

          {/* Car Owners Tab */}
          <TabsContent value="owners">
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-green-900/20 border border-green-700/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-2xl font-display font-extrabold text-green-400">
                    {activeOwnersCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active Subscribers
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-2xl font-display font-extrabold text-destructive">
                    {inactiveOwnersCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="text-lg font-display font-bold">
                  All Car Owners
                </h2>
              </div>
              {ownersLoading ? (
                <div className="p-5 space-y-3" data-ocid="admin.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : allCarOwners.length === 0 ? (
                <div
                  className="text-center py-10"
                  data-ocid="admin.owners.empty_state"
                >
                  <AlertCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No car owners registered yet.
                  </p>
                </div>
              ) : (
                <Table data-ocid="admin.owners.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Car</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCarOwners.map((owner, idx) => (
                      <TableRow
                        key={`${owner.email}-${owner.carNumber}`}
                        data-ocid={`admin.owners.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {owner.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {owner.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {owner.phone}
                        </TableCell>
                        <TableCell className="text-sm">
                          {owner.carNumber} &middot; {owner.carModel}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {CAR_TYPE_LABELS[owner.carType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          &#8377;{Number(owner.priceSegment)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              owner.subscriptionActive
                                ? "bg-green-900/40 text-green-300 border-green-700/30"
                                : "bg-destructive/10 text-destructive"
                            }
                          >
                            {owner.subscriptionActive ? (
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Crew Tab */}
          <TabsContent value="crew">
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-green-900/20 border border-green-700/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-2xl font-display font-extrabold text-green-400">
                    {activeCrewCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Crew</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-2xl font-display font-extrabold text-amber-400">
                    {pendingCrewCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Pending Approval
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-2xl font-display font-extrabold text-destructive">
                    {inactiveCrewCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Inactive / Rejected
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="text-lg font-display font-bold">
                  All Crew Members
                </h2>
              </div>
              {crewLoading ? (
                <div className="p-5 space-y-3" data-ocid="admin.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : allCrewMembers.length === 0 ? (
                <div
                  className="text-center py-10"
                  data-ocid="admin.crew.empty_state"
                >
                  <AlertCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No crew members registered yet.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Approval Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCrewMembers.map((member, idx) => {
                      const crewWithPrincipal = activeCrew.find(
                        ([, m]) => m.phone === member.phone,
                      );
                      return (
                        <TableRow
                          key={`${member.name}-${member.phone}`}
                          data-ocid={`admin.crew.row.${idx + 1}`}
                        >
                          <TableCell className="font-medium">
                            {member.name}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {member.email}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {member.phone}
                          </TableCell>
                          <TableCell>
                            {member.approvalStatus ===
                            ApprovalStatus.pending ? (
                              <Badge className="bg-amber-400/15 text-amber-500 border-amber-400/30">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending Approval
                              </Badge>
                            ) : member.approvalStatus ===
                              ApprovalStatus.approved ? (
                              <Badge className="bg-green-900/40 text-green-300 border-green-700/30">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                              </Badge>
                            ) : (
                              <Badge className="bg-destructive/10 text-destructive">
                                <XCircle className="w-3 h-3 mr-1" /> Rejected
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {member.approvalStatus === ApprovalStatus.pending &&
                            crewWithPrincipal ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs h-7"
                                  onClick={() =>
                                    handleApprove(crewWithPrincipal)
                                  }
                                  data-ocid={`admin.crew.confirm_button.${idx + 1}`}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="text-xs h-7"
                                  onClick={() =>
                                    handleReject(crewWithPrincipal)
                                  }
                                  data-ocid={`admin.crew.delete_button.${idx + 1}`}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                No actions
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance">
            <div className="mb-5">
              <h2 className="text-lg font-display font-bold mb-1">
                Crew Attendance &amp; Work Hours
              </h2>
              <p className="text-sm text-muted-foreground">
                Expand any crew member to view their attendance logs and release
                weekly pay.
              </p>
            </div>

            {activeCrew.length === 0 ? (
              <div
                className="text-center py-16 bg-card rounded-2xl border border-border"
                data-ocid="admin.attendance.empty_state"
              >
                <Timer className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  No active crew members found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeCrew.map(([p, profile], idx) => (
                  <CrewAttendanceRow
                    key={p.toString()}
                    crewPrincipal={p}
                    crewProfile={profile}
                    index={idx}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Waitlist Tab */}
          <TabsContent value="waitlist">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-display font-bold">
                    Waitlist Submissions
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    People who signed up for the Noida launch
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {waitlistEntries.length} entries
                </Badge>
              </div>
              {waitlistLoading ? (
                <div className="p-5 space-y-3" data-ocid="admin.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : waitlistEntries.length === 0 ? (
                <div
                  className="text-center py-12"
                  data-ocid="admin.waitlist.empty_state"
                >
                  <Bell className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No waitlist submissions yet.
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Submissions from the homepage will appear here.
                  </p>
                </div>
              ) : (
                <Table data-ocid="admin.waitlist.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Car Model</TableHead>
                      <TableHead>Sector / Society</TableHead>
                      <TableHead>Cars in Family</TableHead>
                      <TableHead>Submitted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {waitlistEntries.map((entry, idx) => (
                      <TableRow
                        key={`${entry.email}-${idx}`}
                        data-ocid={`admin.waitlist.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {entry.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {entry.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {entry.phone}
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.carModel}
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.sectorSociety}
                        </TableCell>
                        <TableCell className="text-sm">
                          {Number(entry.carsInFamily) || "N/A"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(
                            new Date(Number(entry.submittedAt) / 1_000_000),
                            "MMM d, yyyy",
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Daily Schedule Tab */}
          <TabsContent value="schedule">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex items-center gap-4">
                <h2 className="text-lg font-display font-bold">
                  Daily Schedule
                </h2>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-40"
                  data-ocid="admin.schedule.input"
                />
              </div>
              {scheduleLoading ? (
                <div className="p-5 space-y-3" data-ocid="admin.loading_state">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : dailySchedule.length === 0 ? (
                <div
                  className="text-center py-10"
                  data-ocid="admin.schedule.empty_state"
                >
                  <AlertCircle className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-muted-foreground text-sm">
                    No assignments for this date.
                  </p>
                </div>
              ) : (
                <Table data-ocid="admin.schedule.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Car Owner ID</TableHead>
                      <TableHead>Crew Member ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailySchedule.map((a, idx) => {
                      const config = statusConfig[a.status];
                      const Icon = config.icon;
                      return (
                        <TableRow
                          key={`${a.carOwnerId.toString()}-${a.date}`}
                          data-ocid={`admin.schedule.row.${idx + 1}`}
                        >
                          <TableCell className="text-sm font-mono">
                            {a.carOwnerId.toString().slice(0, 14)}&hellip;
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {a.crewMemberId.toString().slice(0, 14)}&hellip;
                          </TableCell>
                          <TableCell>
                            {format(parseISO(a.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge className={config.className}>
                              <Icon className="w-3 h-3 mr-1" />
                              {config.label}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          {/* Assign Tab */}
          <TabsContent value="assign">
            <div className="bg-card rounded-2xl border border-border p-7 max-w-lg">
              <h2 className="text-lg font-display font-bold mb-6">
                Assign Car Owner to Crew
              </h2>
              <form onSubmit={handleAssign} className="space-y-5">
                <div className="space-y-1.5">
                  <Label>Car Owner</Label>
                  <Select
                    value={assignCarOwnerId}
                    onValueChange={setAssignCarOwnerId}
                  >
                    <SelectTrigger data-ocid="admin.assign.select">
                      <SelectValue placeholder="Select car owner" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeOwners.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No active owners
                        </SelectItem>
                      ) : (
                        activeOwners.map(([p, ownerProfile]) => (
                          <SelectItem key={p.toString()} value={p.toString()}>
                            {ownerProfile.name} &middot;{" "}
                            {ownerProfile.carNumber}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Crew Member</Label>
                  <Select value={assignCrewId} onValueChange={setAssignCrewId}>
                    <SelectTrigger data-ocid="admin.assign.select">
                      <SelectValue placeholder="Select crew member" />
                    </SelectTrigger>
                    <SelectContent>
                      {activeCrew.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No active crew
                        </SelectItem>
                      ) : (
                        activeCrew.map(([p, crewProfile]) => (
                          <SelectItem key={p.toString()} value={p.toString()}>
                            {crewProfile.name} &middot; {crewProfile.phone}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="assign-date">Date</Label>
                  <Input
                    id="assign-date"
                    type="date"
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    data-ocid="admin.assign.input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isAssigning || !assignCarOwnerId || !assignCrewId}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  data-ocid="admin.assign.submit_button"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Create Assignment"
                  )}
                </Button>
              </form>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="py-6 border-t border-border mt-8">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()}. Built with &hearts; using{" "}
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
