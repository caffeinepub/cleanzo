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
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSubmitWaitlist } from "../hooks/useQueries";

const INDIAN_CAR_MODELS = [
  // Maruti Suzuki
  "Maruti Suzuki Alto",
  "Maruti Suzuki Alto K10",
  "Maruti Suzuki Alto 800",
  "Maruti Suzuki Swift",
  "Maruti Suzuki Swift Dzire",
  "Maruti Suzuki Dzire",
  "Maruti Suzuki Baleno",
  "Maruti Suzuki Wagon R",
  "Maruti Suzuki Celerio",
  "Maruti Suzuki Ignis",
  "Maruti Suzuki S-Presso",
  "Maruti Suzuki Ertiga",
  "Maruti Suzuki XL6",
  "Maruti Suzuki Brezza (Vitara Brezza)",
  "Maruti Suzuki Grand Vitara",
  "Maruti Suzuki Fronx",
  "Maruti Suzuki Jimny",
  "Maruti Suzuki Ciaz",
  "Maruti Suzuki S-Cross",
  "Maruti Suzuki Ritz",
  "Maruti Suzuki Eeco",
  "Maruti Suzuki Omni",
  // Hyundai
  "Hyundai i10",
  "Hyundai Grand i10",
  "Hyundai Grand i10 Nios",
  "Hyundai i20",
  "Hyundai i20 Active",
  "Hyundai Aura",
  "Hyundai Verna",
  "Hyundai Elantra",
  "Hyundai Creta",
  "Hyundai Venue",
  "Hyundai Alcazar",
  "Hyundai Tucson",
  "Hyundai Santa Fe",
  "Hyundai Ioniq 5",
  "Hyundai Kona Electric",
  "Hyundai Xcent",
  "Hyundai Santro",
  "Hyundai EON",
  // Tata Motors
  "Tata Tiago",
  "Tata Tigor",
  "Tata Altroz",
  "Tata Nexon",
  "Tata Harrier",
  "Tata Safari",
  "Tata Punch",
  "Tata Hexa",
  "Tata Bolt",
  "Tata Zest",
  "Tata Manza",
  "Tata Indica",
  "Tata Indigo",
  "Tata Nexon EV",
  "Tata Tiago EV",
  "Tata Tigor EV",
  "Tata Nano",
  // Mahindra
  "Mahindra Scorpio",
  "Mahindra Scorpio N",
  "Mahindra Scorpio Classic",
  "Mahindra XUV 500",
  "Mahindra XUV 300",
  "Mahindra XUV 400",
  "Mahindra XUV 700",
  "Mahindra Thar",
  "Mahindra Bolero",
  "Mahindra Bolero Neo",
  "Mahindra KUV100",
  "Mahindra Marazzo",
  "Mahindra Alturas G4",
  "Mahindra e2o",
  "Mahindra e-Verito",
  "Mahindra BE 6e",
  // Kia
  "Kia Seltos",
  "Kia Sonet",
  "Kia Carens",
  "Kia EV6",
  "Kia Carnival",
  // Toyota
  "Toyota Innova Crysta",
  "Toyota Innova HyCross",
  "Toyota Fortuner",
  "Toyota Glanza",
  "Toyota Urban Cruiser",
  "Toyota Urban Cruiser Hyryder",
  "Toyota Camry",
  "Toyota Vellfire",
  "Toyota Hilux",
  "Toyota Etios",
  "Toyota Etios Liva",
  "Toyota Corolla Altis",
  "Toyota Land Cruiser",
  "Toyota bZ4X",
  // Honda
  "Honda Amaze",
  "Honda City",
  "Honda City e:HEV",
  "Honda Jazz",
  "Honda WR-V",
  "Honda BR-V",
  "Honda CR-V",
  "Honda Elevate",
  "Honda Accord",
  "Honda Brio",
  "Honda Mobilio",
  // Renault
  "Renault Kwid",
  "Renault Kiger",
  "Renault Triber",
  "Renault Duster",
  "Renault Lodgy",
  "Renault Captur",
  // Nissan
  "Nissan Magnite",
  "Nissan Micra",
  "Nissan Sunny",
  "Nissan Terrano",
  "Nissan Kicks",
  "Nissan X-Trail",
  // Volkswagen
  "Volkswagen Polo",
  "Volkswagen Vento",
  "Volkswagen Ameo",
  "Volkswagen Taigun",
  "Volkswagen Virtus",
  "Volkswagen Tiguan",
  "Volkswagen T-Roc",
  // Skoda
  "Skoda Rapid",
  "Skoda Octavia",
  "Skoda Superb",
  "Skoda Kushaq",
  "Skoda Slavia",
  "Skoda Kodiaq",
  "Skoda Karoq",
  // Ford (discontinued but used)
  "Ford Figo",
  "Ford Aspire",
  "Ford EcoSport",
  "Ford Freestyle",
  "Ford Endeavour",
  "Ford Mustang",
  // MG Motor
  "MG Hector",
  "MG Hector Plus",
  "MG Gloster",
  "MG Astor",
  "MG ZS EV",
  "MG Comet EV",
  "MG Windsor EV",
  // Jeep
  "Jeep Compass",
  "Jeep Meridian",
  "Jeep Wrangler",
  "Jeep Grand Cherokee",
  // BMW
  "BMW 3 Series",
  "BMW 5 Series",
  "BMW X1",
  "BMW X3",
  "BMW X5",
  "BMW X7",
  "BMW i4",
  "BMW iX",
  // Mercedes-Benz
  "Mercedes-Benz A-Class",
  "Mercedes-Benz C-Class",
  "Mercedes-Benz E-Class",
  "Mercedes-Benz S-Class",
  "Mercedes-Benz GLA",
  "Mercedes-Benz GLC",
  "Mercedes-Benz GLE",
  "Mercedes-Benz EQS",
  // Audi
  "Audi A4",
  "Audi A6",
  "Audi Q3",
  "Audi Q5",
  "Audi Q7",
  "Audi Q8",
  "Audi e-tron",
  // Others
  "Citroen C3",
  "Citroen C3 Aircross",
  "Citroen C5 Aircross",
  "Isuzu D-Max",
  "Isuzu MU-X",
  "Mitsubishi Pajero Sport",
  "Mitsubishi Outlander",
  "Land Rover Defender",
  "Land Rover Discovery",
  "Land Rover Range Rover",
  "Volvo XC40",
  "Volvo XC60",
  "Volvo XC90",
  "Porsche Cayenne",
  "Porsche Macan",
  "BYD Atto 3",
  "BYD Seal",
  "BYD eMax 7",
];

interface WaitlistModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  carModel: string;
  sectorSociety: string;
  carCount: string;
}

export function WaitlistModal({ open, onOpenChange }: WaitlistModalProps) {
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    carModel: "",
    sectorSociety: "",
    carCount: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const { mutateAsync: submitWaitlist, isPending: submitting } =
    useSubmitWaitlist();

  const validate = () => {
    const e: Partial<FormData> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email))
      e.email = "Valid email is required";
    if (
      !form.phone.trim() ||
      !/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))
    )
      e.phone = "Valid 10-digit Indian mobile number required";
    if (!form.carModel) e.carModel = "Please select your car model";
    if (!form.sectorSociety.trim())
      e.sectorSociety = "Sector/Society name is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    try {
      await submitWaitlist({
        name: form.name,
        email: form.email,
        phone: form.phone,
        carModel: form.carModel,
        sectorSociety: form.sectorSociety,
        carsInFamily: BigInt(Number(form.carCount) || 0),
      });
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) {
      setSubmitted(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        carModel: "",
        sectorSociety: "",
        carCount: "",
      });
      setErrors({});
    }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {submitted ? (
          <div className="py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-display font-bold mb-2">
                You're on the list!
              </h3>
              <p className="text-muted-foreground">
                Thanks{" "}
                <span className="font-semibold text-foreground">
                  {form.name.split(" ")[0]}
                </span>
                ! We'll notify you as soon as Cleanzo launches in your area in
                Noida.
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-5 h-5 text-primary" />
                <DialogTitle className="text-xl font-display font-bold">
                  Join the Waitlist for Noida
                </DialogTitle>
              </div>
              <DialogDescription>
                We're launching in Noida soon! Be the first to know when Cleanzo
                arrives at your doorstep. Fill in your details below.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="wl-name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="wl-name"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, name: e.target.value }));
                    setErrors((p) => ({ ...p, name: undefined }));
                  }}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="wl-email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="wl-email"
                  type="email"
                  placeholder="e.g. rahul@gmail.com"
                  value={form.email}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, email: e.target.value }));
                    setErrors((p) => ({ ...p, email: undefined }));
                  }}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="wl-phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="wl-phone"
                  type="tel"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) => {
                    setForm((p) => ({
                      ...p,
                      phone: e.target.value.replace(/\D/g, ""),
                    }));
                    setErrors((p) => ({ ...p, phone: undefined }));
                  }}
                />
                {errors.phone && (
                  <p className="text-xs text-destructive">{errors.phone}</p>
                )}
              </div>

              {/* Car Model */}
              <div className="space-y-1.5">
                <Label htmlFor="wl-car">
                  Car Model <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.carModel}
                  onValueChange={(val) => {
                    setForm((p) => ({ ...p, carModel: val }));
                    setErrors((p) => ({ ...p, carModel: undefined }));
                  }}
                >
                  <SelectTrigger id="wl-car">
                    <SelectValue placeholder="Select your car model" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {INDIAN_CAR_MODELS.map((car) => (
                      <SelectItem key={car} value={car}>
                        {car}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.carModel && (
                  <p className="text-xs text-destructive">{errors.carModel}</p>
                )}
              </div>

              {/* Sector/Society */}
              <div className="space-y-1.5">
                <Label htmlFor="wl-sector">
                  Sector / Society Name{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="wl-sector"
                  placeholder="e.g. Sector 62, ATS Greens"
                  value={form.sectorSociety}
                  onChange={(e) => {
                    setForm((p) => ({ ...p, sectorSociety: e.target.value }));
                    setErrors((p) => ({ ...p, sectorSociety: undefined }));
                  }}
                />
                {errors.sectorSociety && (
                  <p className="text-xs text-destructive">
                    {errors.sectorSociety}
                  </p>
                )}
              </div>

              {/* Optional: Car count */}
              <div className="space-y-1.5">
                <Label htmlFor="wl-carcount">
                  How many cars do you have in your family?{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    (optional)
                  </span>
                </Label>
                <Select
                  value={form.carCount}
                  onValueChange={(val) =>
                    setForm((p) => ({ ...p, carCount: val }))
                  }
                >
                  <SelectTrigger id="wl-carcount">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 car</SelectItem>
                    <SelectItem value="2">2 cars</SelectItem>
                    <SelectItem value="3">3 cars</SelectItem>
                    <SelectItem value="4">4 or more</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Joining...
                  </>
                ) : (
                  "Join the Waitlist"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
