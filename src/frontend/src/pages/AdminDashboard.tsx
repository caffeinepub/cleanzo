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
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Droplets,
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
    className: "bg-green-100 text-green-800",
  },
  [AssignmentStatus.skipped]: {
    label: "Skipped",
    icon: SkipForward,
    className: "bg-accent/20 text-accent-foreground",
  },
};

export function AdminDashboard() {
  const { clear } = useInternetIdentity();
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
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Droplets className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="font-display font-700 text-base">Cleanzo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Badge className="bg-primary/10 text-primary border-primary/20">
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
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
              color: "text-accent-foreground",
            },
            {
              icon: UserCheck,
              label: "Active Owners",
              value: activeOwners.length,
              color: "text-green-600",
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
              className="bg-card rounded-2xl p-4 shadow-card border border-border"
            >
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <p className="text-2xl font-display font-800 text-foreground">
                {value}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </motion.div>

        <Tabs defaultValue="owners">
          <TabsList className="mb-6" data-ocid="admin.tab">
            <TabsTrigger value="owners" data-ocid="admin.tab">
              Car Owners
            </TabsTrigger>
            <TabsTrigger value="crew" data-ocid="admin.tab">
              Crew Members
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
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
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
                <Table data-ocid="admin.schedule.table">
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
                    {allCarOwners.map((owner) => (
                      <TableRow key={`${owner.email}-${owner.carNumber}`}>
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
                                ? "bg-green-100 text-green-800"
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
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
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
                    {allCrewMembers.map((member) => (
                      <TableRow key={`${member.name}-${member.phone}`}>
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
                                ? "bg-green-100 text-green-800"
                                : "bg-destructive/10 text-destructive"
                            }
                          >
                            {member.isActive ? "Active" : "Inactive"}
                          </Badge>
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
            <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
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
            <div className="bg-card rounded-2xl shadow-card border border-border p-6 max-w-lg">
              <h2 className="text-lg font-display font-700 mb-5">
                Assign Car Owner to Crew
              </h2>
              <form onSubmit={handleAssign} className="space-y-4">
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
                        activeOwners.map(([principal, profile]) => (
                          <SelectItem
                            key={principal.toString()}
                            value={principal.toString()}
                          >
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
                        activeCrew.map(([principal, profile]) => (
                          <SelectItem
                            key={principal.toString()}
                            value={principal.toString()}
                          >
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
