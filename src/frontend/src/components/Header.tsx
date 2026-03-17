import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Droplets, Loader2, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface HeaderProps {
  onJoinOwner?: () => void;
  onJoinCrew?: () => void;
  showNav?: boolean;
}

export function Header({
  onJoinOwner,
  onJoinCrew,
  showNav = false,
}: HeaderProps) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group"
          data-ocid="nav.link"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Droplets className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display font-700 text-lg text-foreground tracking-tight">
            Cleanzo
          </span>
        </Link>

        {/* Desktop Nav */}
        {showNav && isLoggedIn && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/owner"
              className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
              data-ocid="nav.link"
            >
              My Dashboard
            </Link>
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isInitializing ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="hidden sm:flex text-xs font-medium"
              >
                {identity.getPrincipal().toString().slice(0, 8)}…
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
              {onJoinOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onJoinOwner}
                  className="hidden sm:flex text-sm"
                  data-ocid="nav.button"
                >
                  Join as Owner
                </Button>
              )}
              {onJoinCrew && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onJoinCrew}
                  className="hidden sm:flex text-sm"
                  data-ocid="nav.button"
                >
                  Join as Crew
                </Button>
              )}
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
              {/* Mobile menu */}
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
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
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && !isLoggedIn && (
        <div className="sm:hidden border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 flex flex-col gap-2">
          {onJoinOwner && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onJoinOwner();
                setMobileOpen(false);
              }}
              className="justify-start"
              data-ocid="nav.button"
            >
              Join as Car Owner
            </Button>
          )}
          {onJoinCrew && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onJoinCrew();
                setMobileOpen(false);
              }}
              className="justify-start"
              data-ocid="nav.button"
            >
              Join as Crew Member
            </Button>
          )}
        </div>
      )}
    </header>
  );
}
