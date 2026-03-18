import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";

const WA_NUMBER = "919555860362";

const MESSAGES = [
  "Hi Cleanzo! I'd like to book a car cleaning subscription. Can you help me?",
  "Hello! I have a question about Cleanzo's pricing and service schedule.",
  "Hi! I want to know more about the 2-day trial offer at \u20b919. How do I get started?",
];

export function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const openChat = (msg: string) => {
    window.open(
      `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`,
      "_blank",
    );
    setOpen(false);
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      ref={panelRef}
    >
      {open && (
        <div className="w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "linear-gradient(135deg, #25d366, #128c3e)" }}
          >
            <div className="flex items-center gap-2">
              <SiWhatsapp className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">
                Chat with us on WhatsApp
              </span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
              data-ocid="helpdesk.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Subtext */}
          <p className="text-xs text-gray-500 dark:text-gray-400 px-4 pt-3 pb-1">
            Select a message to start a conversation
          </p>

          {/* Message Options */}
          <div className="p-3 space-y-2">
            {MESSAGES.map((msg) => (
              <button
                key={msg}
                type="button"
                onClick={() => openChat(msg)}
                className="w-full text-left text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-700 transition-colors text-gray-700 dark:text-gray-200"
                data-ocid="helpdesk.button"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Live HelpDesk on WhatsApp"
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-110 whatsapp-pulse"
        style={{ background: "linear-gradient(135deg, #25d366, #128c3e)" }}
        data-ocid="helpdesk.button"
      >
        <SiWhatsapp className="w-7 h-7 text-white" />
      </button>
    </div>
  );
}
