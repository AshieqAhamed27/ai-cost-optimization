import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, getTrialDaysLeft, getUser, hasActivePlan, isLoggedIn, isTrialActive, setSession } from '../utils/api';

export default function TrialCallout({ compact = false }) {
  const navigate = useNavigate();
  const user = getUser();
  const trialActive = isTrialActive(user);
  const accessActive = hasActivePlan(user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startTrial = async () => {
    if (!isLoggedIn()) {
      navigate('/signup');
      return;
    }

    if (accessActive) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiRequest('/auth/trial/start', { method: 'POST' });
      setSession({ user: data.user });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = trialActive
    ? `Continue Trial (${getTrialDaysLeft(user)} days left)`
    : accessActive
      ? 'Go to Dashboard'
      : loading
        ? 'Starting...'
        : 'Start 7-Day Free Trial';

  return (
    <section className={`rounded-lg border border-emerald-300/20 bg-emerald-300/[0.06] ${compact ? 'p-5' : 'p-6 md:p-7'}`}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="label text-emerald-200">7-Day Free Trial</p>
          <h2 className={`${compact ? 'mt-2 text-2xl' : 'mt-3 text-3xl md:text-4xl'} font-black text-white`}>
            Use the audit workflow before paying.
          </h2>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-relaxed text-zinc-400">
            Create reports, review the savings workflow, and understand the business value for 7 days. No card is required to start the trial.
          </p>
        </div>

        <div className="grid gap-3">
          <button type="button" onClick={startTrial} disabled={loading} className="btn-primary w-full lg:w-auto">
            {buttonLabel}
          </button>
          <p className="text-center text-xs font-bold text-zinc-500">
            Payment is needed after the trial to keep creating reports.
          </p>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-300/20 bg-red-300/10 p-3 text-sm font-bold text-red-100">
          {error}
        </p>
      )}
    </section>
  );
}
