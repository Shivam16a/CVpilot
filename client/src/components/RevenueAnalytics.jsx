// client/src/components/RevenueAnalytics.jsx
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function RevenueAnalytics({ stats = {}, monthlyGrowth = [] }) {
    const {
        totalRevenue = 0,
        upgradedUsers = 0,
        freeTrialUsers = 0,
        expiredUsers = 0
    } = stats;

    return (
        <div className="mb-4">
            {/* 1. Subscription & Revenue Metric Cards */}
            <div className="row g-3 mb-3">
                {/* Total Platform Revenue */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="p-3 bg-dark border border-success border-opacity-30 rounded-4 h-100 shadow-sm position-relative overflow-hidden">
                        <div style={{
                            position: 'absolute', top: '-15px', right: '-15px',
                            width: '70px', height: '70px',
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)'
                        }} />
                        <span className="text-success extra-small font-monospace fw-bold">TOTAL REVENUE (INR)</span>
                        <h2 className="fw-extrabold text-white mb-0 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</h2>
                        <span className="text-white-50 extra-small">Razorpay verified earnings</span>
                    </div>
                </div>

                {/* Paid Upgraded Users */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="p-3 bg-dark border border-info border-opacity-30 rounded-4 h-100 shadow-sm">
                        <span className="text-info extra-small font-monospace fw-bold">PRO PAID SUBSCRIBERS</span>
                        <h2 className="fw-extrabold text-info mb-0 mt-1">{upgradedUsers}</h2>
                        <span className="text-white-50 extra-small">Active Monthly / Annual plans</span>
                    </div>
                </div>

                {/* Active Free Trial Users */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="p-3 bg-dark border border-primary border-opacity-30 rounded-4 h-100 shadow-sm">
                        <span className="text-primary extra-small font-monospace fw-bold">ACTIVE FREE TRIALS</span>
                        <h2 className="fw-extrabold text-primary mb-0 mt-1">{freeTrialUsers}</h2>
                        <span className="text-white-50 extra-small">In 30-day initial trial window</span>
                    </div>
                </div>

                {/* Expired Unconverted Users */}
                <div className="col-12 col-sm-6 col-xl-3">
                    <div className="p-3 bg-dark border border-warning border-opacity-30 rounded-4 h-100 shadow-sm">
                        <span className="text-warning extra-small font-monospace fw-bold">EXPIRED / LOCKED USERS</span>
                        <h2 className="fw-extrabold text-warning mb-0 mt-1">{expiredUsers}</h2>
                        <span className="text-white-50 extra-small">Requires plan upgrade to use</span>
                    </div>
                </div>
            </div>

            {/* 2. Monthly Revenue Growth Interactive Line Chart */}
            <div className="p-3.5 bg-dark border border-secondary border-opacity-25 rounded-4 shadow-lg">
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                    <div>
                        <h5 className="fw-bold text-white mb-0 d-flex align-items-center gap-2">
                            <span>📈</span> Monthly Revenue Growth & Conversions
                        </h5>
                        <span className="text-white-50 extra-small">Track revenue trajectory and subscriber conversion performance</span>
                    </div>
                    <span className="badge bg-success bg-opacity-15 text-white border border-success border-opacity-30 px-3 py-1.5 rounded-pill font-monospace extra-small">
                        ● LIVE METRICS
                    </span>
                </div>

                <div style={{ width: '100%', height: '230px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyGrowth} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                            <XAxis dataKey="month" stroke="#6b7280" fontSize={11} tickLine={false} />
                            <YAxis stroke="#6b7280" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    fontSize: '0.8rem'
                                }}
                                formatter={(val, name) => [
                                    name === 'revenue' ? `₹${val.toLocaleString('en-IN')}` : val,
                                    name === 'revenue' ? 'Revenue' : 'Upgrades'
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#10b981"
                                strokeWidth={3}
                                dot={{ fill: '#10b981', r: 4 }}
                                activeDot={{ r: 6, stroke: '#34d399', strokeWidth: 2 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="conversions"
                                stroke="#38bdf8"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={{ fill: '#38bdf8', r: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}