import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SiWhatsapp } from "react-icons/si";

export function WhatsAppChat() {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href="https://wa.me/919555860362"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Live HelpDesk on WhatsApp"
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 whatsapp-pulse"
            style={{
              background: "linear-gradient(135deg, #25d366, #128c3e)",
            }}
            data-ocid="helpdesk.button"
          >
            <SiWhatsapp className="w-7 h-7 text-white" />
          </a>
        </TooltipTrigger>
        <TooltipContent
          side="left"
          className="bg-gray-900 text-white text-sm font-semibold px-3 py-1.5 rounded-lg"
        >
          💬 Live HelpDesk
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
