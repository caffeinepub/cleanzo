import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Principal } from "@icp-sdk/core/principal";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  parseISO,
  startOfWeek,
} from "date-fns";
import {
  AlertCircle,
  CalendarDays,
  Camera,
  Car,
  CheckCircle2,
  Clock,
  Droplets,
  Image,
  Loader2,
  LogIn,
  LogOut,
  SkipForward,
  Timer,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ApprovalStatus } from "../backend";
import type { Assignment } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { usePhotoUpload } from "../hooks/usePhotoUpload";
import {
  AssignmentStatus,
  useAttendanceLogs,
  useClockIn,
  useClockOut,
  useCrewAssignments,
  useCrewMemberProfile,
  useMarkAssignmentDone,
  usePayReleaseHistory,
  useSaveServicePhoto,
  useServicePhotosForCarOwner,
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
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  },
  [AssignmentStatus.skipped]: {
    label: "Skipped",
    icon: SkipForward,
    className: "bg-accent/20 text-accent-foreground",
  },
};

function PhotoUploadCard({
  assignment,
  index,
}: {
  assignment: Assignment;
  index: number;
}) {
  const { uploadPhoto, isUploading } = usePhotoUpload();
  const { mutateAsync: saveServicePhoto, isPending: isSaving } =
    useSaveServicePhoto();
  const { data: existingPhotos = [] } = useServicePhotosForCarOwner(
    assignment.carOwnerId,
  );

  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");

  const existingPhoto = existingPhotos.find((p) => p.date === assignment.date);

  const handleFileChange = (
    file: File,
    setFile: (f: File) => void,
    setPreview: (s: string) => void,
  ) => {
    setFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleSubmitPhotos = async () => {
    if (!beforeFile || !afterFile) {
      toast.error("Please upload both before and after photos.");
      return;
    }
    try {
      const [beforeHash, afterHash] = await Promise.all([
        uploadPhoto(beforeFile),
        uploadPhoto(afterFile),
      ]);
      await saveServicePhoto({
        carOwnerId: assignment.carOwnerId,
        date: assignment.date,
        beforePhotoId: beforeHash,
        afterPhotoId: afterHash,
      });
      toast.success("Service photos uploaded successfully!");
    } catch {
      toast.error("Failed to upload photos. Please try again.");
    }
  };

  if (existingPhoto) {
    return (
      <div className="mt-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
        <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Service photos uploaded
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Before</p>
            <PhotoThumb hash={existingPhoto.beforePhotoId} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">After</p>
            <PhotoThumb hash={existingPhoto.afterPhotoId} />
          </div>
        </div>
      </div>
    );
  }

  if (assignment.status !== AssignmentStatus.done) return null;

  return (
    <div
      className="mt-3 p-3 rounded-xl bg-secondary/40 border border-border"
      data-ocid={`crew.photos.panel.${index + 1}`}
    >
      <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
        <Camera className="w-3.5 h-3.5 text-primary" /> Upload service photos
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Before photo</p>
          {beforePreview ? (
            <img
              src={beforePreview}
              alt="before"
              className="w-full h-20 object-cover rounded-lg border border-border mb-1"
            />
          ) : (
            <div className="w-full h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center mb-1">
              <Image className="w-5 h-5 text-muted-foreground/40" />
            </div>
          )}
          <input
            ref={beforeRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileChange(f, setBeforeFile, setBeforePreview);
            }}
            data-ocid={`crew.photos.upload_button.${index + 1}`}
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
            onClick={() => beforeRef.current?.click()}
          >
            <Camera className="w-3 h-3 mr-1" /> Before
          </Button>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">After photo</p>
          {afterPreview ? (
            <img
              src={afterPreview}
              alt="after"
              className="w-full h-20 object-cover rounded-lg border border-border mb-1"
            />
          ) : (
            <div className="w-full h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center mb-1">
              <Image className="w-5 h-5 text-muted-foreground/40" />
            </div>
          )}
          <input
            ref={afterRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFileChange(f, setAfterFile, setAfterPreview);
            }}
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs h-7"
            onClick={() => afterRef.current?.click()}
          >
            <Camera className="w-3 h-3 mr-1" /> After
          </Button>
        </div>
      </div>
      {(beforeFile || afterFile) && (
        <Button
          size="sm"
          className="w-full mt-3 h-8 text-xs"
          onClick={handleSubmitPhotos}
          disabled={isUploading || isSaving || !beforeFile || !afterFile}
          data-ocid={`crew.photos.submit_button.${index + 1}`}
        >
          {isUploading || isSaving ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <CheckCircle2 className="w-3 h-3 mr-1" />
          )}
          {isUploading
            ? "Uploading..."
            : isSaving
              ? "Saving..."
              : "Submit Photos"}
        </Button>
      )}
    </div>
  );
}

function PhotoThumb({ hash }: { hash: string }) {
  const [url, setUrl] = useState("");
  const { getPhotoUrl } = usePhotoUpload();

  useState(() => {
    if (hash) {
      getPhotoUrl(hash)
        .then(setUrl)
        .catch(() => {});
    }
  });

  if (!url) {
    return (
      <div className="w-full h-20 rounded-lg bg-muted flex items-center justify-center">
        <Image className="w-5 h-5 text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <img
      src={url}
      alt="Completed service"
      className="w-full h-20 object-cover rounded-lg border border-border"
    />
  );
}

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
      className="p-4 rounded-xl bg-card border border-border shadow-xs hover:shadow-card transition-all"
      data-ocid={`crew.assignment.item.${index + 1}`}
    >
      <div className="flex items-center justify-between">
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
      </div>
      <PhotoUploadCard assignment={assignment} index={index} />
    </motion.div>
  );
}

function formatTime(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return format(new Date(ms), "hh:mm a");
}

export function CrewDashboard() {
  const { identity, clear } = useInternetIdentity();
  const navigate = useNavigate();
  const principal = identity?.getPrincipal();
  const today = format(new Date(), "yyyy-MM-dd");
  const [selectedDate, setSelectedDate] = useState(today);

  const weekDays = eachDayOfInterval({
    start: startOfWeek(new Date(), { weekStartsOn: 1 }),
    end: endOfWeek(new Date(), { weekStartsOn: 1 }),
  });

  const { data: profile, isLoading: profileLoading } =
    useCrewMemberProfile(principal);
  const { data: assignments = [], isLoading: assignmentsLoading } =
    useCrewAssignments(principal, selectedDate);
  const { data: attendanceLogs = [], isLoading: attendanceLoading } =
    useAttendanceLogs(principal);
  const { data: payHistory = [] } = usePayReleaseHistory(principal);
  const { mutateAsync: markDone, isPending: isMarkingDone } =
    useMarkAssignmentDone();
  const { mutateAsync: clockIn, isPending: isClockinIn } = useClockIn();
  const { mutateAsync: clockOut, isPending: isClockingOut } = useClockOut();

  const todayLog = attendanceLogs.find((l) => l.date === today);
  const hasClockedIn = !!todayLog?.clockIn;
  const hasClockedOut = !!todayLog?.clockOut;

  const weekLogs = weekDays.map((day) => {
    const dateStr = format(day, "yyyy-MM-dd");
    const log = attendanceLogs.find((l) => l.date === dateStr);
    return { dateStr, day, log };
  });

  const handleMarkDone = async (carOwnerId: Principal, date: string) => {
    try {
      await markDone({ carOwnerId, date });
      toast.success("Assignment marked as done!");
    } catch {
      toast.error("Failed to update assignment.");
    }
  };

  const handleClockIn = async () => {
    try {
      await clockIn(today);
      toast.success("Clocked in successfully!");
    } catch {
      toast.error("Failed to clock in.");
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut(today);
      toast.success("Clocked out. Have a great day!");
    } catch {
      toast.error("Failed to clock out.");
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
            <span className="font-display font-bold text-base">Cleanzo</span>
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
        {profile && profile.approvalStatus === ApprovalStatus.pending && (
          <div
            className="flex items-start gap-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4"
            data-ocid="crew.approval.panel"
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
              <h1 className="text-3xl font-display font-extrabold text-white">
                {profileLoading
                  ? "Loading..."
                  : (profile?.name ?? "Crew Member")}
              </h1>
              <p className="text-white/60 text-sm mt-1">
                Service hours: 5:00 AM to 10:00 AM
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
              <p className="text-2xl font-display font-extrabold text-white">
                {pendingCount}
              </p>
              <p className="text-xs text-white/60">Pending</p>
            </div>
            <div>
              <p className="text-2xl font-display font-extrabold text-accent">
                {doneCount}
              </p>
              <p className="text-xs text-white/60">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-display font-extrabold text-white">
                {assignments.length}
              </p>
              <p className="text-xs text-white/60">Total today</p>
            </div>
          </div>
        </motion.div>

        {/* Today's Attendance */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.07 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
          data-ocid="crew.attendance.panel"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Timer className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold">
                Today's Attendance
              </h2>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {attendanceLoading ? (
            <Skeleton
              className="h-16 w-full rounded-xl"
              data-ocid="crew.loading_state"
            />
          ) : hasClockedIn && hasClockedOut ? (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
              <CheckCircle2 className="w-8 h-8 text-green-500 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-green-700 dark:text-green-300">
                  Shift complete!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Clocked in: {formatTime(todayLog!.clockIn)} &bull; Clocked
                  out: {formatTime(todayLog!.clockOut!)}
                </p>
                {todayLog?.hoursWorked !== undefined && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Total: {todayLog.hoursWorked.toFixed(1)} hours
                  </p>
                )}
              </div>
            </div>
          ) : hasClockedIn ? (
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div>
                <p className="font-semibold text-foreground">
                  Shift in progress
                </p>
                <p className="text-sm text-muted-foreground">
                  Clocked in at {formatTime(todayLog!.clockIn)}
                </p>
              </div>
              <Button
                onClick={handleClockOut}
                disabled={isClockingOut}
                className="bg-foreground text-background hover:bg-foreground/90"
                data-ocid="crew.clock_out.button"
              >
                {isClockingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <LogOut className="w-4 h-4 mr-2" />
                )}
                Clock Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/40 border border-border">
              <div>
                <p className="font-semibold text-foreground">Ready to start?</p>
                <p className="text-sm text-muted-foreground">
                  Tap to clock in for today's shift
                </p>
              </div>
              <Button
                onClick={handleClockIn}
                disabled={isClockinIn}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="crew.clock_in.button"
              >
                {isClockinIn ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}
                Clock In
              </Button>
            </div>
          )}
        </motion.div>

        {/* This Week's Hours */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold">
                This Week's Hours
              </h2>
              <p className="text-xs text-muted-foreground">
                Week of{" "}
                {format(startOfWeek(new Date(), { weekStartsOn: 1 }), "MMM d")}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-display font-extrabold text-primary">
                {weekLogs
                  .reduce((sum, { log }) => sum + (log?.hoursWorked ?? 0), 0)
                  .toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">hrs this week</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weekLogs.map(({ dateStr, day, log }) => (
                  <TableRow key={dateStr}>
                    <TableCell className="font-medium text-sm">
                      {format(day, "EEE, MMM d")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log?.clockIn ? formatTime(log.clockIn) : "--"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log?.clockOut ? formatTime(log.clockOut) : "--"}
                    </TableCell>
                    <TableCell>
                      {log?.hoursWorked !== undefined ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
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
          </div>
        </motion.div>

        {/* Date picker */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.13 }}
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
          transition={{ delay: 0.17 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <h2 className="text-xl font-display font-bold mb-4">
            Assignments &middot; {format(parseISO(selectedDate), "MMM d, yyyy")}
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

        {/* Pay History */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-display font-bold">Pay History</h2>
          </div>
          {payHistory.length === 0 ? (
            <div className="text-center py-8" data-ocid="crew.pay.empty_state">
              <Wallet className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                No payments released yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week Starting</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Released</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payHistory.map((release, idx) => (
                  <TableRow
                    key={`${release.weekStart}-${idx}`}
                    data-ocid={`crew.pay.item.${idx + 1}`}
                  >
                    <TableCell className="font-medium text-sm">
                      {format(parseISO(release.weekStart), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-sm">
                      {release.totalHours.toFixed(1)}h
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-green-600">
                      &#8377;{(Number(release.amount) / 100).toFixed(0)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(
                        new Date(Number(release.releasedAt) / 1_000_000),
                        "MMM d, yyyy",
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </motion.div>

        {/* Weekly pay summary */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.23 }}
          className="bg-card rounded-2xl p-5 shadow-card border border-border"
        >
          <p className="text-xs text-muted-foreground">
            Your pay is released weekly by the admin. Work 5 hours daily,
            Mon&ndash;Sat, to qualify for the full weekly payout.
          </p>
        </motion.div>
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
