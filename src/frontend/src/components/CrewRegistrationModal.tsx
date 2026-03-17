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
import { Loader2, Wrench } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterCrewMember } from "../hooks/useQueries";

interface CrewRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CrewRegistrationModal({
  open,
  onOpenChange,
  onSuccess,
}: CrewRegistrationModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const { mutateAsync: registerCrewMember, isPending } =
    useRegisterCrewMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerCrewMember({ name, phone });
      toast.success("Welcome to the Cleanzo crew!");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-sm"
        data-ocid="crew_registration.dialog"
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Wrench className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl font-display">
                Join the Crew
              </DialogTitle>
              <DialogDescription className="text-sm">
                Register as a Cleanzo crew member.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
            <Label htmlFor="crew-phone">Phone Number</Label>
            <Input
              id="crew-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              data-ocid="crew_registration.input"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              data-ocid="crew_registration.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="crew_registration.submit_button"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                  Registering...
                </>
              ) : (
                "Join the Crew"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
