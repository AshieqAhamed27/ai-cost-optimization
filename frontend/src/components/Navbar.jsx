import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { getPlanName, getUser, hasActivePlan, isEarlyAccessActive, isLoggedIn, isTrialActive, logout } from '../utils/api';

export default function Navbar() {
  const navigate = useNavigate();
  const loggedIn = isLoggedIn();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const planLabel = isEarlyAccessActive(user)
    ? 'Early Access'
    : isTrialActive(user)
    ? 'Free Access'
    : hasActivePlan(user)
      ? getPlanName(user.activePlan)
      : 'Choose Plan';

  const navClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-bold transition ${
      isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
    }`;

  return (
    <header className="sticky top-3 z-50 mx-auto mt-3 w-[min(1180px,calc(100%-1.25rem))] rounded-lg border border-white/10 bg-slate-950/90 px-3 py-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:w-[min(1180px,calc(100%-2rem))]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/spendguard-logo.png"
            alt="SpendGuard Audit logo"
            className="h-11 w-11 rounded-lg object-cover"
          />
          <span>
            <span className="block text-base font-black text-white">SpendGuard Audit</span>
            <span className="block text-xs font-bold text-zinc-500">AI API cost audits</span>
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/company" className={navClass}>Company</NavLink>
          <NavLink to="/security" className={navClass}>Security</NavLink>
          <NavLink to="/pricing" className={navClass}>Pricing</NavLink>
          {loggedIn && (
            <>
              <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
              <NavLink to={hasActivePlan(user) ? '/audits/new' : '/pricing'} className={navClass}>New Audit</NavLink>
            </>
          )}
          {!loggedIn ? (
            <>
              <NavLink to="/login" className={navClass}>Login</NavLink>
              <Link to="/signup" className="btn-primary">Start Free</Link>
            </>
          ) : (
            <>
              <span className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black uppercase tracking-widest text-emerald-200">
                {planLabel}
              </span>
              <button type="button" onClick={handleLogout} className="btn-secondary px-4 py-2">
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
