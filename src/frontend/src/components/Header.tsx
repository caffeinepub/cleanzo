import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import { HardHat, Loader2, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  onJoinOwner?: () => void;
  onJoinCrew?: () => void;
  onWaitlist?: () => void;
  showNav?: boolean;
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/why-cleanzo", label: "Why Cleanzo" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
  { to: "/referral", label: "Referral" },
  { to: "/contact", label: "Contact" },
];

export function Header({ onJoinOwner, onJoinCrew }: HeaderProps) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const handleSignUp = () => {
    if (onJoinOwner) onJoinOwner();
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo + Slogan */}
        <Link to="/" className="flex shrink-0" data-ocid="nav.link">
          <div className="flex flex-col items-start">
            <img
              src="/assets/uploads/9A7DD908-5829-4627-A957-C41626D3EE30-1-1.png"
              alt="Cleanzo"
              className="h-8 w-auto object-contain"
            />
            <span className="text-[9px] font-semibold tracking-widest uppercase text-blue-600 leading-tight">
              Daily Shine | Zero Hassle
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
          {navLinks.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-foreground bg-secondary/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
                data-ocid="nav.link"
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
          {/* Join as Crew */}
          {onJoinCrew && (
            <button
              type="button"
              onClick={onJoinCrew}
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg transition-colors flex items-center gap-1.5"
              data-ocid="nav.link"
            >
              <HardHat className="w-3.5 h-3.5" />
              Join as Crew
            </button>
          )}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isInitializing ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="hidden sm:flex text-xs font-medium"
              >
                {identity.getPrincipal().toString().slice(0, 8)}&hellip;
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="text-muted-foreground hover:text-destructive"
                data-ocid="nav.button"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5">Sign out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
                New here?{" "}
                <button
                  type="button"
                  onClick={handleSignUp}
                  className="text-primary font-semibold hover:text-primary/80 underline-offset-2 hover:underline transition-colors"
                  data-ocid="nav.link"
                >
                  Sign up now
                </button>
              </span>
              <Button
                size="sm"
                onClick={login}
                disabled={isLoggingIn}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-ocid="nav.primary_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span className="ml-1.5">
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </span>
              </Button>
            </div>
          )}
          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            data-ocid="nav.toggle"
          >
            {mobileOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border/40 bg-card/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-1">
          {navLinks.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? "text-foreground bg-secondary/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
                onClick={() => setMobileOpen(false)}
                data-ocid="nav.link"
              >
                {label}
              </Link>
            );
          })}
          {onJoinCrew && (
            <button
              type="button"
              onClick={() => {
                onJoinCrew();
                setMobileOpen(false);
              }}
              className="px-3 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 rounded-lg transition-colors flex items-center gap-1.5 text-left"
              data-ocid="nav.link"
            >
              <HardHat className="w-3.5 h-3.5" />
              Join as Crew
            </button>
          )}

          {/* Mobile auth section */}
          <div className="pt-3 mt-1 border-t border-border/30 flex flex-col gap-2">
            {isLoggedIn ? (
              <>
                <div className="px-3 py-1.5">
                  <p className="text-xs text-muted-foreground mb-1">
                    Signed in as
                  </p>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {identity.getPrincipal().toString().slice(0, 12)}&hellip;
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clear();
                    setMobileOpen(false);
                  }}
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-3"
                  data-ocid="nav.button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground px-3">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      handleSignUp();
                      setMobileOpen(false);
                    }}
                    className="text-primary font-semibold"
                    data-ocid="nav.link"
                  >
                    Sign up now
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
