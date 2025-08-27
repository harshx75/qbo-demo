'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DashboardContent() {
    const searchParams = useSearchParams();
    const userId = searchParams.get('userId');
    const [user, setUser] = useState(null);
    const [qboData, setQboData] = useState({});
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState(false);
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(
        `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    );

    useEffect(() => {
        if (userId) {
            fetchUser();
            checkConnection();
        }
    }, [userId]);

    const fetchUser = async () => {
        try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        }
    };

    const checkConnection = async () => {
        try {
            const response = await fetch(`/api/qbo/${userId}/profile`);
            if (response.ok) {
                setConnected(true);
            } else if (response.status === 400 || response.status === 500) {
                setConnected(false);
            }
        } catch (error) {
            console.error('Error checking connection:', error);
            setConnected(false);
        }
    };

    const connectQuickBooks = () => {
        window.location.href = `/api/auth/connect?userId=${userId}`;
    };

    const fetchQboData = async () => {
        setLoading(true);
        try {
            // Fetch all data with selected month
            const [revenueRes, profileRes, invoicesRes] = await Promise.all([
                fetch(`/api/qbo/${userId}/revenue-expense?month=${selectedMonth}`),
                fetch(`/api/qbo/${userId}/profile`),
                fetch(`/api/qbo/${userId}/invoices`),
            ]);

            const revenue = revenueRes.ok ? await revenueRes.json() : null;
            const profile = profileRes.ok ? await profileRes.json() : null;
            const invoices = invoicesRes.ok ? await invoicesRes.json() : null;

            setQboData({ revenue, profile, invoices });
        } catch (error) {
            console.error('Error fetching QBO data:', error);
        }
        setLoading(false);
    };

    const disconnectQuickBooks = async () => {
        try {
            const response = await fetch(`/api/qbo/${userId}/disconnect`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setQboData({});
                setConnected(false);
            }
        } catch (error) {
            console.error('Error disconnecting:', error);
        }
    };

    const generateMonthOptions = () => {
        const options = [];
        const today = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

            // Local YYYY-MM
            const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

            options.unshift({ value, label });
        }

        return options;
    };


    const monthOptions = generateMonthOptions();

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    // Format date
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <div className="ml-4 text-slate-600 font-medium">Loading user...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-800 mb-2">Dashboard</h1>
                </div>

                {/* User Information Card */}
                <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-slate-200">
                    <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800 ml-3">User Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4">
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Name</span>
                            <p className="text-lg font-semibold text-slate-900 mt-1">{user.name}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Email</span>
                            <p className="text-lg font-semibold text-slate-900 mt-1">{user.email}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4">
                            <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">User ID</span>
                            <p className="text-lg font-semibold text-slate-900 mt-1">{user._id}</p>
                        </div>
                    </div>
                </div>

                {!connected ? (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-2xl p-8 mb-6 border border-blue-200">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">Connect to QuickBooks</h2>
                            <button
                                onClick={connectQuickBooks}
                                disabled={loading}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                                </svg>
                                Connect to QuickBooks
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        {/* Connection Status Card */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg rounded-2xl p-6 mb-6 border border-green-200">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h2 className="text-xl font-semibold text-slate-800">QuickBooks Connected</h2>
                                        <p className="text-green-600 font-medium">Successfully connected to your QuickBooks account</p>
                                    </div>
                                </div>
                                <button
                                    onClick={disconnectQuickBooks}
                                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-200 border border-red-200"
                                >
                                    Disconnect
                                </button>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                    <label htmlFor="month-select" className="block text-sm font-medium text-slate-700 mb-1">
                                        Select Month
                                    </label>
                                    <select
                                        id="month-select"
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {monthOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={fetchQboData}
                                    disabled={loading}
                                    className="mt-4 sm:mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Refreshing Data...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                            </svg>
                                            Load Data
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Company Info */}
                        {qboData.profile && (
                            <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-slate-200">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 ml-3">Company Information</h2>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2">Basic Information</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-medium text-slate-600">Company Name:</span>
                                                <span className="text-slate-900 font-semibold">{qboData.profile.CompanyName}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-medium text-slate-600">Legal Name:</span>
                                                <span className="text-slate-900 font-semibold">{qboData.profile.LegalName}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-medium text-slate-600">Email:</span>
                                                <span className="text-slate-900 font-semibold">{qboData.profile.Email?.Address}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-medium text-slate-600">Country:</span>
                                                <span className="text-slate-900 font-semibold">{qboData.profile.Country}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-medium text-slate-600">Time Zone:</span>
                                                <span className="text-slate-900 font-semibold">{qboData.profile.DefaultTimeZone}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-slate-700 border-b border-slate-200 pb-2">Address</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-medium text-slate-600">Street:</span>
                                                <span className="text-slate-900 font-semibold">{qboData.profile.CompanyAddr?.Line1}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-medium text-slate-600">City:</span>
                                                <span className="text-slate-900 font-semibold">{qboData.profile.CompanyAddr?.City}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-medium text-slate-600">State:</span>
                                                <span className="text-slate-900 font-semibold">{qboData.profile.CompanyAddr?.CountrySubDivisionCode}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="font-medium text-slate-600">Postal Code:</span>
                                                <span className="text-slate-900 font-semibold">{qboData.profile.CompanyAddr?.PostalCode}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Revenue & Expense */}
                        {qboData.revenue && (
                            <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-slate-200">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <h2 className="text-2xl font-bold text-slate-800">Revenue & Expenses</h2>
                                            <p className="text-slate-600 font-medium">
                                                Period: {qboData.revenue.start} to {qboData.revenue.end}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                                        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                                            </svg>
                                            Summary
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                                                <span className="font-medium text-slate-700">Total Income:</span>
                                                <span className={qboData.revenue.revenue_expense["Total Income"] ? "text-emerald-600 font-bold text-lg" : "text-slate-500"}>
                                                    {qboData.revenue.revenue_expense["Total Income"] || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                                                <span className="font-medium text-slate-700">Gross Profit:</span>
                                                <span className={parseFloat(qboData.revenue.revenue_expense["Gross Profit"] || 0) >= 0 ? "text-emerald-600 font-bold text-lg" : "text-red-600 font-bold text-lg"}>
                                                    ${qboData.revenue.revenue_expense["Gross Profit"]}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-slate-200">
                                                <span className="font-medium text-slate-700">Total Expenses:</span>
                                                <span className="text-red-600 font-bold text-lg">${qboData.revenue.revenue_expense["Total Expenses"]}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                                                <span className="font-bold text-slate-800">Net Income:</span>
                                                <span className={parseFloat(qboData.revenue.revenue_expense["Net Income"] || 0) >= 0 ? "text-emerald-600 font-bold text-xl" : "text-red-600 font-bold text-xl"}>
                                                    ${qboData.revenue.revenue_expense["Net Income"]}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Breakdown */}
                                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                                        <h3 className="text-lg font-semibold text-slate-700 mb-4 flex items-center">
                                            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                            </svg>
                                            Detailed Breakdown
                                        </h3>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {Object.entries(qboData.revenue.revenue_expense).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center p-2 bg-white rounded-md text-sm border border-blue-100">
                                                    <span className="text-slate-700 font-medium">{key}:</span>
                                                    <span className="text-slate-900 font-semibold">{value ? `$${value}` : "N/A"}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Invoices */}
                        {qboData.invoices && qboData.invoices.length > 0 && (
                            <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-slate-200">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 ml-3">Invoices</h2>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Invoice #</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Customer</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Date</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Due Date</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Amount</th>
                                                <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Balance</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            {qboData.invoices.map((invoice) => (
                                                <tr key={invoice.Id} className="hover:bg-slate-50">
                                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{invoice.DocNumber}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{invoice.CustomerRef?.name}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{formatDate(invoice.TxnDate)}</td>
                                                    <td className="px-4 py-3 text-sm text-slate-700">{formatDate(invoice.DueDate)}</td>
                                                    <td className="px-4 py-3 text-sm text-right font-medium text-slate-900">
                                                        {formatCurrency(invoice.TotalAmt)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right font-medium">
                                                        <span className={invoice.Balance === 0 ? "text-emerald-600" : "text-orange-600"}>
                                                            {formatCurrency(invoice.Balance)}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${invoice.Balance === 0
                                                            ? "bg-emerald-100 text-emerald-800"
                                                            : "bg-orange-100 text-orange-800"
                                                            }`}>
                                                            {invoice.Balance === 0 ? "Paid" : "Unpaid"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-slate-50">
                                            <tr>
                                                <td colSpan="4" className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                                                    Total:
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                                                    {formatCurrency(qboData.invoices.reduce((sum, invoice) => sum + (invoice.TotalAmt || 0), 0))}
                                                </td>
                                                <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                                                    {formatCurrency(qboData.invoices.reduce((sum, invoice) => sum + (invoice.Balance || 0), 0))}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        {qboData.invoices && qboData.invoices.length === 0 && (
                            <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-slate-200">
                                <div className="text-center py-8">
                                    <svg className="w-12 h-12 text-slate-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                    </svg>
                                    <h3 className="mt-4 text-lg font-medium text-slate-900">No invoices found</h3>
                                    <p className="mt-2 text-sm text-slate-600">No invoices were found for the selected month.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <div className="mt-4 text-slate-600 font-medium">Loading QuickBooks data...</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}