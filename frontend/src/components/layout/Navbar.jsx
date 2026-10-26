import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../notifications/NotificationCenter';
import {
  LayoutDashboard,
  LogOut,
  Send,
  Heart,
  Truck,
  ShieldCheck,
  Leaf,
  Map,
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Donor Portal', path: '/donor', icon: Send },
    { name: 'NGO Recipient', path: '/recipient', icon: Heart },
    { name: 'Volunteer Hub', path: '/volunteer', icon: Truck },
    { name: 'Admin Console', path: '/admin', icon: ShieldCheck },
  ];

  // Derive display name dynamically without hardcoded person names
  const displayName =
    profile?.organizationName ||
    profile?.fullName ||
    user?.name ||
    user?.email?.split('@')[0] ||
    (user ? 'User Profile' : '');

  const initial = displayName ? displayName.charAt(0).toUpperCase() : 'U';
  const roleName = user?.role ? user.role.toUpperCase() : 'GUEST';

  const isMapActive = location.pathname === '/live-map' || location.pathname === '/map';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E5E2DC] shadow-subtle">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group focus:outline-none shrink-0">
          <div className="w-8 h-8 rounded-xl bg-[#1b4332] flex items-center justify-center text-white shadow-sm group-hover:bg-[#143527] transition-colors">
            <Leaf className="w-4 h-4 fill-white stroke-white" />
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-extrabold text-lg text-slate-900 tracking-tight">Food</span>
              <span className="font-bold text-lg text-[#1b4332] tracking-tight">Flow</span>
            </div>
            <p className="text-[9px] font-bold tracking-wider text-slate-400 -mt-1 uppercase">
              RESCUE NETWORK
            </p>
          </div>
        </Link>

        {/* Center Portal Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'text-[#1b4332] bg-[#f0f7f3] border border-[#b9ddc8] font-bold shadow-subtle'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#FAF8F5]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#1b4332]' : 'text-slate-400'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* Live Tracking Map Button */}
          <Link
            to="/live-map"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ml-1.5 ${
              isMapActive
                ? 'bg-[#1b4332] text-white shadow-sm'
                : 'text-[#1b4332] bg-[#f0f7f3] hover:bg-[#e2f0e8] border border-[#b9ddc8]'
            }`}
          >
            <Map className={`w-3.5 h-3.5 ${isMapActive ? 'text-white' : 'text-[#1b4332]'}`} />
            <span>Live Map</span>
          </Link>
        </nav>

        {/* Right Section: Notification Center & Dynamic User Profile */}
        <div className="flex items-center gap-3">
          {/* Notification Center */}
          <NotificationCenter />

          {/* Dynamic Authenticated User Pill */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5 pl-1 border-l border-[#E5E2DC]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#f0f7f3] border border-[#b9ddc8] text-[#1b4332] flex items-center justify-center font-bold text-xs shadow-subtle">
                  {initial}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[150px]">
                    {displayName}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 leading-tight">
                    {roleName}
                  </div>
                </div>
              </div>

              {/* Logout Icon */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold px-3.5 py-1.5 rounded-xl text-slate-700 hover:text-slate-900 bg-white border border-[#E5E2DC] shadow-subtle hover:bg-[#FAF8F5]"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
