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
  ShieldAlert,
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
    { name: 'Admin Console', path: '/admin', icon: ShieldAlert },
  ];

  // Derive display name and initial
  const displayName =
    profile?.organizationName ||
    profile?.fullName ||
    user?.name ||
    user?.email?.split('@')[0] ||
    'Dharshan (Admin)';
  const initial = displayName.charAt(0).toUpperCase() || 'D';
  const roleName = (user?.role || 'admin').toUpperCase();

  const isMapActive = location.pathname === '/live-map' || location.pathname === '/map';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Leaf className="w-5 h-5 fill-white stroke-white" />
          </div>
          <div>
            <div className="flex items-center">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">Food</span>
              <span className="font-bold text-xl text-emerald-600 tracking-tight">Flow</span>
            </div>
            <p className="text-[9px] font-bold tracking-wider text-slate-400 -mt-1 uppercase">
              AI FOOD NETWORK
            </p>
          </div>
        </Link>

        {/* Center Portal Links */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* Live Map Button */}
          <Link
            to="/live-map"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ml-1 ${
              isMapActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Map className={`w-4 h-4 ${isMapActive ? 'text-white' : 'text-emerald-600'}`} />
            <span>Live Map</span>
          </Link>
        </nav>

        {/* Right Section: Notification Center, User Info */}
        <div className="flex items-center gap-3">
          {/* Notification Center */}
          <NotificationCenter />

          {/* User Profile Pill */}
          {isAuthenticated || user ? (
            <div className="flex items-center gap-2.5 pl-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center font-bold text-xs shadow-sm">
                  {initial}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {displayName}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 leading-tight">
                    {roleName}
                  </div>
                </div>
              </div>

              {/* Logout Icon */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-bold px-3.5 py-2 rounded-xl text-slate-700 hover:text-slate-900 bg-white border border-slate-200 shadow-sm"
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
