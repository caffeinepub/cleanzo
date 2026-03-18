import { Badge } from "@/components/ui/badge";
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
import { Car, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CarType, useRegisterCarOwner } from "../hooks/useQueries";

interface CarOwnerRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CAR_TYPE_LABELS: Record<CarType, string> = {
  [CarType.hatchback]: "Hatchback",
  [CarType.sedan]: "Sedan",
  [CarType.midSUV]: "Mid-SUV",
  [CarType.SUV]: "SUV",
};

function getPriceForCarType(carType: CarType | "") {
  if (carType === CarType.SUV) return 449;
  if (carType) return 399;
  return null;
}

export function CarOwnerRegistrationModal({
  open,
  onOpenChange,
  onSuccess,
}: CarOwnerRegistrationModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [carNumber, setCarNumber] = useState("");
  const [carModel, setCarModel] = useState("");
  const [carType, setCarType] = useState<CarType | "">("");

  const { mutateAsync: registerCarOwner, isPending } = useRegisterCarOwner();

  const price = getPriceForCarType(carType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!carType) return;
    try {
      await registerCarOwner({
        name,
        email,
        phone,
        carNumber,
        carModel,
        carType,
      });
      toast.success("Welcome to Cleanzo! Your account is ready.");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        data-ocid="car_owner_registration.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">
                Join as Car Owner
              </DialogTitle>
              <DialogDescription className="text-sm">
                Set up your Cleanzo subscription in seconds.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="co-name">Full Name</Label>
              <Input
                id="co-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                required
                data-ocid="car_owner_registration.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="co-email">Email Address</Label>
              <Input
                id="co-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                required
                data-ocid="car_owner_registration.input"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="co-phone">Phone Number</Label>
              <Input
                id="co-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                required
                data-ocid="car_owner_registration.input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="co-car-number">Car Number</Label>
                <Input
                  id="co-car-number"
                  value={carNumber}
                  onChange={(e) => setCarNumber(e.target.value.toUpperCase())}
                  placeholder="MH 01 AB 1234"
                  required
                  data-ocid="car_owner_registration.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="co-car-model">Car Model</Label>
                <Input
                  id="co-car-model"
                  value={carModel}
                  onChange={(e) => setCarModel(e.target.value)}
                  placeholder="Swift Dzire"
                  required
                  data-ocid="car_owner_registration.input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Car Type</Label>
              <Select
                value={carType}
                onValueChange={(val) => setCarType(val as CarType)}
                required
              >
                <SelectTrigger data-ocid="car_owner_registration.select">
                  <SelectValue placeholder="Select your car type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CAR_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {price && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Your Plan: ₹{price}/month
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {carType === CarType.SUV
                      ? "Standard Plan (SUV)"
                      : "Standard plan for hatchbacks, sedans & mid-SUVs"}
                  </p>
                </div>
                <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                  ₹{price}
                </Badge>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-ocid="car_owner_registration.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !carType}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="car_owner_registration.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Registering...
                </>
              ) : (
                "Join Cleanzo"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
