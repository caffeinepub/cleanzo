import { Link } from "@tanstack/react-router";
import { SiFacebook, SiInstagram } from "react-icons/si";

export function Footer() {
  return (
    <footer className="py-12 border-t border-border/40 bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/assets/uploads/9A7DD908-5829-4627-A957-C41626D3EE30-1-1.png"
                alt="Cleanzo"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Professional dry cleaning at your doorstep, every morning from 5am
              to 10am.
            </p>
            <p className="text-xs text-primary font-medium mt-2 tracking-widest uppercase">
              Daily Shine | Zero Hassle
            </p>
          </div>

          {/* Pages */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Pages
            </p>
            <ul className="space-y-2">
              {[
                { to: "/", label: "Home" },
                { to: "/about", label: "About Us" },
                { to: "/why-cleanzo", label: "Why Cleanzo" },
                { to: "/pricing", label: "Pricing" },
                { to: "/contact", label: "Contact" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="footer.link"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Resources
            </p>
            <ul className="space-y-2">
              {[
                { to: "/faq", label: "FAQ" },
                { to: "/referral", label: "Referral Program" },
                { to: "/privacy-policy", label: "Privacy Policy" },
                { to: "/terms", label: "Terms & Conditions" },
                { to: "/refund-policy", label: "Refund Policy" },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-ocid="footer.link"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Connect
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://instagram.com/trycleanzo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="footer.link"
                >
                  <SiInstagram className="w-3.5 h-3.5" />
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://facebook.com/trycleanzo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid="footer.link"
                >
                  <SiFacebook className="w-3.5 h-3.5" />
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Cleanzo. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with <span className="text-red-400">&#9829;</span> using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
