import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Camera,
  CheckCircle2,
  Clock,
  ImagePlus,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useRegisterCrewMember } from "../hooks/useQueries";

interface CrewRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AADHAAR_VOTER_TYPES = ["Aadhaar Card", "Voter ID"];

export function CrewRegistrationModal({
  open,
  onOpenChange,
  onSuccess,
}: CrewRegistrationModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpMethod, setOtpMethod] = useState<"email" | "phone">("phone");
  const [otpValue, setOtpValue] = useState("");

  // First ID: Aadhaar or Voter ID
  const [idType1, setIdType1] = useState("");
  const [idFile1, setIdFile1] = useState<File | null>(null);
  const [idPreview1, setIdPreview1] = useState<string | null>(null);

  // Second ID: PAN Card (mandatory)
  const [idFile2, setIdFile2] = useState<File | null>(null);
  const [idPreview2, setIdPreview2] = useState<string | null>(null);

  const gallery1Ref = useRef<HTMLInputElement>(null);
  const camera1Ref = useRef<HTMLInputElement>(null);
  const gallery2Ref = useRef<HTMLInputElement>(null);
  const camera2Ref = useRef<HTMLInputElement>(null);

  const { mutateAsync: registerCrewMember, isPending } =
    useRegisterCrewMember();

  const handleReset = () => {
    setStep(1);
    setName("");
    setEmail("");
    setPhone("");
    setOtpMethod("phone");
    setOtpValue("");
    setIdType1("");
    setIdFile1(null);
    setIdPreview1(null);
    setIdFile2(null);
    setIdPreview2(null);
  };

  const handleClose = (val: boolean) => {
    if (!val) handleReset();
    onOpenChange(val);
  };

  const handleSendOtp = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    toast.success(
      `OTP sent to your ${
        otpMethod === "email" ? `email (${email})` : `phone (+91 ${phone})`
      }`,
    );
    setStep(2);
  };

  const handleVerifyOtp = () => {
    if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    toast.success("OTP verified!");
    setStep(3);
  };

  const handleFileChange1 = (file: File | null) => {
    if (!file) return;
    setIdFile1(file);
    const reader = new FileReader();
    reader.onload = (e) => setIdPreview1(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleFileChange2 = (file: File | null) => {
    if (!file) return;
    setIdFile2(file);
    const reader = new FileReader();
    reader.onload = (e) => setIdPreview2(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!idType1 || !idFile1) {
      toast.error("Please select and upload your Aadhaar Card or Voter ID.");
      return;
    }
    if (!idFile2) {
      toast.error("Please upload your PAN Card. It is mandatory.");
      return;
    }
    try {
      await registerCrewMember({ name, email, phone });
      toast.success("Application submitted! You'll be notified once approved.");
      handleClose(false);
      onSuccess?.();
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  const stepLabels = ["Contact", "Verify OTP", "ID Proof"];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        data-ocid="crew_registration.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">
                Join the Crew
              </DialogTitle>
              <DialogDescription className="text-sm">
                Complete all steps to apply as a Cleanzo crew member.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step Progress */}
        <div className="flex items-center gap-2 mb-4">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step > i + 1
                    ? "bg-primary text-primary-foreground"
                    : step === i + 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {step > i + 1 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  step === i + 1 ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
              {i < stepLabels.length - 1 && (
                <div className="flex-1 h-px bg-border" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Contact Details */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="crew-name">Full Name</Label>
              <Input
                id="crew-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Suresh Kumar"
                required
                data-ocid="crew_registration.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="crew-email">Email Address</Label>
              <Input
                id="crew-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="suresh@example.com"
                required
                data-ocid="crew_registration.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="crew-phone">Phone Number</Label>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-lg border border-border">
                  +91
                </span>
                <Input
                  id="crew-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="98765 43210"
                  required
                  className="flex-1"
                  data-ocid="crew_registration.input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Receive OTP via</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setOtpMethod("phone")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    otpMethod === "phone"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                  data-ocid="crew_registration.toggle"
                >
                  <Smartphone className="w-4 h-4" />
                  Send to Phone
                </button>
                <button
                  type="button"
                  onClick={() => setOtpMethod("email")}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                    otpMethod === "email"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                  data-ocid="crew_registration.toggle"
                >
                  <Mail className="w-4 h-4" />
                  Send to Email
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                className="flex-1"
                data-ocid="crew_registration.cancel_button"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSendOtp}
                className="flex-1"
                data-ocid="crew_registration.submit_button"
              >
                Send OTP
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm text-center">
              <Clock className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="font-medium text-foreground">
                Enter the OTP sent to your{" "}
                {otpMethod === "email"
                  ? `email (${email})`
                  : `phone (+91 ${phone})`}
              </p>
              <p className="text-muted-foreground text-xs mt-0.5">
                OTP is valid for 10 minutes
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="crew-otp">6-Digit OTP</Label>
              <Input
                id="crew-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otpValue}
                onChange={(e) =>
                  setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                className="text-center text-2xl font-mono tracking-widest"
                data-ocid="crew_registration.input"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                toast.success(
                  `OTP resent to your ${
                    otpMethod === "email" ? "email" : "phone"
                  }.`,
                );
              }}
              className="text-sm text-primary hover:underline"
              data-ocid="crew_registration.button"
            >
              <RefreshCw className="w-3 h-3 inline mr-1" />
              Resend OTP
            </button>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1"
                data-ocid="crew_registration.cancel_button"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleVerifyOtp}
                className="flex-1"
                data-ocid="crew_registration.submit_button"
              >
                Verify OTP
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Upload ID Proofs */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-display font-bold text-base">
                Identity Verification
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                We require two government-issued IDs for verification. Your data
                is kept private and secure.
              </p>
            </div>

            {/* ID 1: Aadhaar or Voter ID */}
            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <Label className="font-semibold">Aadhaar Card / Voter ID</Label>
                <span className="text-xs text-destructive font-medium">
                  Required
                </span>
              </div>
              <Select value={idType1} onValueChange={setIdType1}>
                <SelectTrigger data-ocid="crew_registration.select">
                  <SelectValue placeholder="Choose document type" />
                </SelectTrigger>
                <SelectContent>
                  {AADHAAR_VOTER_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => gallery1Ref.current?.click()}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium text-muted-foreground"
                  data-ocid="crew_registration.upload_button"
                >
                  <ImagePlus className="w-5 h-5" />
                  Gallery
                </button>
                <button
                  type="button"
                  onClick={() => camera1Ref.current?.click()}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium text-muted-foreground"
                  data-ocid="crew_registration.upload_button"
                >
                  <Camera className="w-5 h-5" />
                  Camera
                </button>
              </div>
              <input
                ref={gallery1Ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange1(e.target.files?.[0] ?? null)}
              />
              <input
                ref={camera1Ref}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange1(e.target.files?.[0] ?? null)}
              />
              {idPreview1 && (
                <div className="relative">
                  <img
                    src={idPreview1}
                    alt="ID 1 Preview"
                    className="w-full h-28 object-cover rounded-xl border border-border"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>

            {/* ID 2: PAN Card */}
            <div className="rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <Label className="font-semibold">PAN Card</Label>
                <span className="text-xs text-destructive font-medium">
                  Required
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => gallery2Ref.current?.click()}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium text-muted-foreground"
                  data-ocid="crew_registration.upload_button"
                >
                  <ImagePlus className="w-5 h-5" />
                  Gallery
                </button>
                <button
                  type="button"
                  onClick={() => camera2Ref.current?.click()}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium text-muted-foreground"
                  data-ocid="crew_registration.upload_button"
                >
                  <Camera className="w-5 h-5" />
                  Camera
                </button>
              </div>
              <input
                ref={gallery2Ref}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange2(e.target.files?.[0] ?? null)}
              />
              <input
                ref={camera2Ref}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange2(e.target.files?.[0] ?? null)}
              />
              {idPreview2 && (
                <div className="relative">
                  <img
                    src={idPreview2}
                    alt="PAN Card Preview"
                    className="w-full h-28 object-cover rounded-xl border border-border"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle2 className="w-3 h-3" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(2)}
                className="flex-1"
                data-ocid="crew_registration.cancel_button"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1"
                data-ocid="crew_registration.submit_button"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit for Approval"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
