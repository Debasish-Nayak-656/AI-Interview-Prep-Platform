"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/create-interview", label: "New Interview" },
  { href: "/upload-resume", label: "Resume" },
  { href: "/history", label: "History" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-card !rounded-none border-x-0 border-t-0 backdrop-blur-xl">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
          AI Interview Prep
        </Link>

        {user && (
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-sm font-medium transition hover:text-primary-600",
                  pathname === l.href ? "text-primary-600" : "text-slate-600 dark:text-slate-300"
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-full glass-card hover:scale-105 transition"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <>
              <button onClick={logout} className="hidden sm:flex items-center gap-1.5 btn-secondary !py-2 text-sm">
                <LogOut size={16} /> Logout
              </button>
              <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
                {open ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-secondary !py-2 text-sm">Login</Link>
              <Link href="/register" className="btn-primary !py-2 text-sm">Sign Up</Link>
            </div>
          )}
        </div>
      </nav>

      {user && open && (
        <div className="md:hidden flex flex-col gap-3 px-4 pb-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-sm font-medium">
              {l.label}
            </Link>
          ))}
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-rose-500">
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </header>
  );
}
