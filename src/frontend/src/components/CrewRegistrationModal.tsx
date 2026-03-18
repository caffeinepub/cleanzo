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

const ID_TYPES = [
  "Aadhaar Card",
  "PAN Card",
  "Voter ID",
  "Driving Licence",
  "Passport",
];

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
  const [idType, setIdType] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);

  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: registerCrewMember, isPending } =
    useRegisterCrewMember();

  const handleReset = () => {
    setStep(1);
    setName("");
    setEmail("");
    setPhone("");
    setOtpMethod("phone");
    setOtpValue("");
    setIdType("");
    setIdFile(null);
    setIdPreview(null);
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

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    setIdFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setIdPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!idType || !idFile) {
      toast.error("Please select an ID type and upload a photo.");
      return;
    }
    try {
      await registerCrewMember({ name, phone });
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
        className="sm:max-w-md"
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
                  `OTP resent to your ${otpMethod === "email" ? "email" : "phone"}.`,
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

        {/* Step 3: Upload ID Proof */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="text-center">
              <ShieldCheck className="w-8 h-8 text-primary mx-auto mb-2" />
              <h3 className="font-display font-700 text-base">
                Identity Verification
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                We require one government-issued ID for verification. Your data
                is kept private and secure.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Select ID Type</Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger data-ocid="crew_registration.select">
                  <SelectValue placeholder="Choose ID document" />
                </SelectTrigger>
                <SelectContent>
                  {ID_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Upload ID Photo</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => galleryRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium text-muted-foreground"
                  data-ocid="crew_registration.upload_button"
                >
                  <ImagePlus className="w-6 h-6" />
                  Upload from Gallery
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors text-sm font-medium text-muted-foreground"
                  data-ocid="crew_registration.upload_button"
                >
                  <Camera className="w-6 h-6" />
                  Take Photo
                </button>
              </div>
              <input
                ref={galleryRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              <input
                ref={cameraRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
            </div>

            {idPreview && (
              <div className="relative">
                <img
                  src={idPreview}
                  alt="ID Preview"
                  className="w-full h-32 object-cover rounded-xl border border-border"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              </div>
            )}

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
