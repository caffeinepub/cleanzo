import { ArrowLeft, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";

const WA_NUMBER = "919555860362";

type Role = "owner" | "crew" | null;

const MESSAGES: Record<"owner" | "crew", string[]> = {
  owner: [
    "Hi Cleanzo! I'd like to subscribe and get my car cleaned daily. Can you guide me?",
    "Hello! I have a question about the \u20b919 trial offer. How do I get started?",
    "Hi! I need help with my existing subscription or skip days.",
  ],
  crew: [
    "Hi Cleanzo! I want to apply to join the cleaning crew. How do I sign up?",
    "Hello! I have a question about work hours, schedule, or weekly payment.",
    "Hi! I need help uploading my ID proof documents during onboarding.",
  ],
};

export function WhatsAppChat() {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [showOther, setShowOther] = useState(false);
  const [otherText, setOtherText] = useState("");
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

  const handleClose = () => {
    setOpen(false);
    setRole(null);
    setShowOther(false);
    setOtherText("");
  };

  const handleBack = () => {
    setRole(null);
    setShowOther(false);
    setOtherText("");
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      ref={panelRef}
    >
      {open && (
        <div className="w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "linear-gradient(135deg, #25d366, #128c3e)" }}
          >
            <div className="flex items-center gap-2">
              {role && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="text-white/80 hover:text-white transition-colors mr-1"
                  aria-label="Back"
                  data-ocid="helpdesk.button"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <SiWhatsapp className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">
                {role ? "Select your message" : "Hi! How can we help?"}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Close"
              data-ocid="helpdesk.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step 1: Role selection */}
          {!role && (
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 font-medium">
                I am a...
              </p>
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setRole("owner")}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-left group"
                  data-ocid="helpdesk.button"
                >
                  <span className="text-2xl">🚗</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                      Car Owner
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      I want to subscribe or need help with my service
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("crew")}
                  className="flex items-center gap-3 px-4 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all text-left group"
                  data-ocid="helpdesk.button"
                >
                  <span className="text-2xl">🧹</span>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                      Cleanzo Crew
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      I want to join or need help with onboarding
                    </p>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Messages */}
          {role && !showOther && (
            <div className="p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 px-1 pt-1 pb-2">
                Tap a message to start chatting
              </p>
              <div className="space-y-2">
                {MESSAGES[role].map((msg) => (
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
                {/* Other option */}
                <button
                  type="button"
                  onClick={() => setShowOther(true)}
                  className="w-full text-left text-sm px-3 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-400 transition-colors text-gray-500 dark:text-gray-400"
                  data-ocid="helpdesk.button"
                >
                  Other — I have a different question
                </button>
              </div>
            </div>
          )}

          {/* Step 2b: Other free text */}
          {role && showOther && (
            <div className="p-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-medium">
                Tell us how we can help
              </p>
              <textarea
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 px-3 py-2.5 resize-none focus:outline-none focus:border-green-400 transition-colors"
                rows={4}
                placeholder="Write your message here..."
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                data-ocid="helpdesk.textarea"
              />
              <button
                type="button"
                onClick={() => {
                  if (otherText.trim()) openChat(otherText.trim());
                }}
                disabled={!otherText.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #25d366, #128c3e)",
                }}
                data-ocid="helpdesk.button"
              >
                <Send className="w-4 h-4" />
                Send on WhatsApp
              </button>
            </div>
          )}
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
