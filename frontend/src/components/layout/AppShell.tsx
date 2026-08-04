import { ReactNode, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Rocket, BarChart3, Settings, LogOut,
  Moon, Sun, Menu, X, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { FallingLeaves } from '@/components/fx/FallingLeaves';
import { Katana } from '@/components/fx/Katana';
import { useTheme } from '@/context/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/startups/new', label: 'New Idea', icon: Rocket },
  { to: '/analytics', label: 'Activity', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const NavContent = () => (
    <>
      <div className="flex items-center gap-2.5 px-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-crimson to-ember flex items-center justify-center shadow-glow">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">StartupForge</span>
      </div>
      <div className="flex items-center gap-2 px-3 mb-6">
        <Katana variant="hilt" glow className="w-7 h-7 shrink-0 opacity-80 pointer-events-none select-none" />
        <div className="h-px flex-1 bg-gradient-to-r from-crimson/30 to-transparent" />
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              hover:translate-x-0.5 active:scale-[0.97]
              ${isActive ? 'text-fg' : 'text-fg-muted hover:text-fg hover:bg-bg-soft'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-crimson/10 border border-crimson/20 rounded-xl shadow-glow"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="w-[18px] h-[18px] relative z-10" />
                <span className="relative z-10">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-border-soft space-y-1">
        <button
          onClick={toggle}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-fg-muted hover:text-fg hover:bg-bg-soft transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-fg-muted hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px]" />
          Sign out
        </button>
        {user && (
          <div className="px-3 pt-3 text-xs text-fg-subtle truncate" title={user.email}>
            {user.email}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col p-4 border-r border-border-soft bg-bg-soft/40 sticky top-0 h-screen">
        <NavContent />
      </aside>

      {/* Mobile top bar + drawer */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 glass border-b border-border-soft flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-crimson to-ember flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">StartupForge</span>
        </div>
        <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-0 bottom-0 w-72 bg-bg-elev p-4 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end mb-2 text-fg-subtle hover:text-fg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              <NavContent />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative flex-1 min-w-0 pt-14 lg:pt-0">
        <FallingLeaves density={10} />
        <div className="relative z-10">{children}</div>
      </main>
    </div>
  );
}
