// client/src/components/SubscriptionGuard.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function SubscriptionGuard({ children }) {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // 1. Admin ko full unrestricted access
    if (user?.isAdmin) {
        return children;
    }

    const now = new Date();
    const trialEnd = new Date(user?.subscription?.trialEndsAt || user?.createdAt || 0);
    const periodEnd = new Date(user?.subscription?.currentPeriodEnd || trialEnd);

    const isTrialActive = user?.subscription?.plan === 'TRIAL' && now <= trialEnd;
    const isPaidActive = ['PRO_MONTHLY', 'PRO_YEARLY'].includes(user?.subscription?.plan) && now <= periodEnd;

    // 2. Agar expired hai aur already upgrade page par nahi hai
    if (!isTrialActive && !isPaidActive) {
        return <Navigate to="/upgrade-plan" state={{ from: location }} replace />;
    }

    return children;
}