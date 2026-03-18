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
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  AlertCircle,
  Bell,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Droplets,
  Info,
  Loader2,
  LogOut,
  SkipForward,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { CarType } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  AssignmentStatus,
  useActiveCarOwners,
  useActiveCrewMembers,
  useAllCarOwners,
  useAllCrewMembers,
  useAssignCarOwnerToCrewMember,
  useDailySchedule,
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

export function AdminDashboard() {
  const { clear, identity } = useInternetIdentity();
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
  const { mutateAsync: assignOwner, isPending: isAssigning } =
    useAssignCarOwnerToCrewMember();

  const activeOwners = activeOwnersData?.[0] ?? [];
  const activeCrew = activeCrewData?.[0] ?? [];

  const activeOwnersCount = allCarOwners.filter(
    (o) => o.subscriptionActive,
  ).length;
  const inactiveOwnersCount = allCarOwners.length - activeOwnersCount;
  const activeCrewCount = allCrewMembers.filter((m) => m.isActive).length;
  const inactiveCrewCount = allCrewMembers.length - activeCrewCount;

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

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/60">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-700 text-base">Cleanzo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge className="bg-amber-400/15 text-amber-300 border-amber-400/30">
              Admin
            </Badge>
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
              <p className="text-3xl font-display font-800 text-foreground">
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
            {/* Active/Inactive summary */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-green-900/20 border border-green-700/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-2xl font-display font-800 text-green-400">
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
                  <p className="text-2xl font-display font-800 text-destructive">
                    {inactiveOwnersCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="text-lg font-display font-700">
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
                          {owner.carNumber} · {owner.carModel}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {CAR_TYPE_LABELS[owner.carType]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{Number(owner.priceSegment)}
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
            {/* Active/Inactive summary */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="p-4 rounded-xl bg-green-900/20 border border-green-700/30 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-2xl font-display font-800 text-green-400">
                    {activeCrewCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Crew</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3">
                <XCircle className="w-5 h-5 text-destructive" />
                <div>
                  <p className="text-2xl font-display font-800 text-destructive">
                    {inactiveCrewCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Inactive / Pending
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="text-lg font-display font-700">
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
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allCrewMembers.map((member, idx) => (
                      <TableRow
                        key={`${member.name}-${member.phone}`}
                        data-ocid={`admin.crew.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {member.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {member.phone}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              member.isActive
                                ? "bg-green-900/40 text-green-300 border-green-700/30"
                                : "bg-destructive/10 text-destructive"
                            }
                          >
                            {member.isActive ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 mr-1" /> Inactive
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

          {/* Waitlist Tab */}
          <TabsContent value="waitlist">
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-start gap-3">
                <Bell className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground mb-1">
                    Waitlist Data Access
                  </p>
                  <p className="text-muted-foreground">
                    Waitlist submissions are collected via the Join Waitlist
                    form on the homepage. To view and export waitlist data, you
                    can connect the form to a backend database or email
                    notification service. Contact the development team to enable
                    full waitlist backend integration with data export
                    (CSV/Excel) and automated notification features.
                  </p>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Bell className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-display font-700 mb-2">
                  Waitlist Backend Coming Soon
                </h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                  Once the waitlist backend is integrated, you'll be able to
                  view all registrants here with their name, email, phone, car
                  model, society, and family car count. Entries will be sortable
                  and exportable.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
                  {[
                    { label: "Fields Collected", value: "6 fields per entry" },
                    {
                      label: "Form Location",
                      value: "Homepage waitlist section",
                    },
                    {
                      label: "Integration",
                      value: "Backend API ready to connect",
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="p-3 rounded-xl bg-secondary/30 border border-border/50"
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Daily Schedule Tab */}
          <TabsContent value="schedule">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex items-center gap-4">
                <h2 className="text-lg font-display font-700">
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
                            {a.carOwnerId.toString().slice(0, 14)}…
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {a.crewMemberId.toString().slice(0, 14)}…
                          </TableCell>
                          <TableCell>
                            {format(new Date(a.date), "MMM d, yyyy")}
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
              <h2 className="text-lg font-display font-700 mb-6">
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
                        activeOwners.map(([p, profile]) => (
                          <SelectItem key={p.toString()} value={p.toString()}>
                            {profile.name} · {profile.carNumber}
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
                        activeCrew.map(([p, profile]) => (
                          <SelectItem key={p.toString()} value={p.toString()}>
                            {profile.name} · {profile.phone}
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
