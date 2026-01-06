'use client';

import { useEffect, useState, useMemo } from 'react';
import { Loader2, Utensils } from 'lucide-react';
import TabLayout, { Tab } from "@/components/ui/TabLayout";
import type { FuelRecommendations, FuelDaySummary } from '@/types/fuel';
import { getLocalDateKey, normalizeToLocalMidnight } from '@/lib/utils';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to fetch');
    }
    return res.json();
}

interface DailyTotals {
    date: Date;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

interface Averages {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

function getPercentageDifference(actual: number, target: number): string | null {
    if (!target || target === 0) return null;

    const diff = ((actual - target) / target) * 100;
    const sign = diff >= 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}%`;
}

function convertSummariesToDailyTotals(summaries: FuelDaySummary[]): DailyTotals[] {
    return summaries
        .map(summary => ({
            date: normalizeToLocalMidnight(summary.date),
            calories: summary.calories || 0,
            protein: summary.macros?.protein || 0,
            carbs: summary.macros?.carbs || 0,
            fat: summary.macros?.fat || 0,
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function calculateAverage(dailyTotals: DailyTotals[]): Averages {
    if (dailyTotals.length === 0) {
        return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    const sum = dailyTotals.reduce(
        (acc, daily) => ({
            calories: acc.calories + daily.calories,
            protein: acc.protein + daily.protein,
            carbs: acc.carbs + daily.carbs,
            fat: acc.fat + daily.fat,
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return {
        calories: Math.round(sum.calories / dailyTotals.length),
        protein: Math.round(sum.protein / dailyTotals.length),
        carbs: Math.round(sum.carbs / dailyTotals.length),
        fat: Math.round(sum.fat / dailyTotals.length),
    };
}

function AdherenceTab() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summaries, setSummaries] = useState<FuelDaySummary[]>([]);
    const [recommendations, setRecommendations] = useState<FuelRecommendations | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                // Calculate date range (last 30 days)
                const today = new Date();
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(today.getDate() - 30);
                thirtyDaysAgo.setHours(0, 0, 0, 0);

                // Fetch fuel day summaries and recommendations
                const [summariesRes, recommendationsRes] = await Promise.all([
                    fetchJson<{ summaries: FuelDaySummary[] }>(
                        `/api/fuel/day-summary?dateFrom=${thirtyDaysAgo.toISOString()}&dateTo=${today.toISOString()}`
                    ),
                    fetchJson<{ recommendations: FuelRecommendations | null }>('/api/fuel/recommendations'),
                ]);

                if (cancelled) return;

                // Convert date strings to Date objects
                const summariesWithDates = summariesRes.summaries.map(summary => ({
                    ...summary,
                    date: new Date(summary.date),
                }));

                setSummaries(summariesWithDates);

                // Set recommendations from API
                if (recommendationsRes.recommendations) {
                    setRecommendations(recommendationsRes.recommendations);
                }
            } catch (err: any) {
                if (!cancelled) {
                    console.error('Failed to load adherence data', err);
                    setError(err.message || 'Failed to load adherence data');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const { dailyTotals, sevenDayAverage, thirtyDayAverage } = useMemo(() => {
        const totals = convertSummariesToDailyTotals(summaries);

        // Get last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const last7Days = totals.filter(daily => daily.date >= sevenDaysAgo);

        return {
            dailyTotals: totals,
            sevenDayAverage: calculateAverage(last7Days),
            thirtyDayAverage: calculateAverage(totals),
        };
    }, [summaries]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card p-6 border border-border rounded-(--radius)">
                <p className="text-muted-foreground text-sm">{error}</p>
            </div>
        );
    }

    const targets = recommendations?.macros;
    const calorieTarget = recommendations?.calorieTarget;

    return (
        <div className="space-y-6">
            <div className="bg-card p-6 border border-border rounded-(--radius)">
                <h3 className="mb-6 font-semibold text-lg">Macro Adherence</h3>

                <div className="space-y-6">
                    {/* Calories */}
                    <div>
                        <p className="mb-2 font-medium text-muted-foreground text-xs">Calories</p>
                        <div className="flex gap-4">
                            {/* 7-Day Average */}
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-bold text-foreground text-2xl">
                                        {sevenDayAverage.calories.toLocaleString()}
                                    </p>
                                    {calorieTarget && (
                                        <span className="text-muted-foreground text-xs">
                                            {getPercentageDifference(sevenDayAverage.calories, calorieTarget)}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-muted-foreground text-xs">7-day avg</p>
                            </div>
                            {/* 30-Day Average */}
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-bold text-foreground text-2xl">
                                        {thirtyDayAverage.calories.toLocaleString()}
                                    </p>
                                    {calorieTarget && (
                                        <span className="text-muted-foreground text-xs">
                                            {getPercentageDifference(thirtyDayAverage.calories, calorieTarget)}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-muted-foreground text-xs">30-day avg</p>
                            </div>
                        </div>
                        {calorieTarget && (
                            <p className="mt-2 text-muted-foreground text-xs">
                                Target: {calorieTarget.toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Protein */}
                    <div>
                        <p className="mb-2 font-medium text-muted-foreground text-xs">Protein</p>
                        <div className="flex gap-4">
                            {/* 7-Day Average */}
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-bold text-foreground text-2xl">
                                        {sevenDayAverage.protein}g
                                    </p>
                                    {targets?.protein && (
                                        <span className="text-muted-foreground text-xs">
                                            {getPercentageDifference(sevenDayAverage.protein, targets.protein)}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-muted-foreground text-xs">7-day avg</p>
                            </div>
                            {/* 30-Day Average */}
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-bold text-foreground text-2xl">
                                        {thirtyDayAverage.protein}g
                                    </p>
                                    {targets?.protein && (
                                        <span className="text-muted-foreground text-xs">
                                            {getPercentageDifference(thirtyDayAverage.protein, targets.protein)}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-muted-foreground text-xs">30-day avg</p>
                            </div>
                        </div>
                        {targets?.protein && (
                            <p className="mt-2 text-muted-foreground text-xs">
                                Target: {targets.protein}g
                            </p>
                        )}
                    </div>

                    {/* Carbs */}
                    <div>
                        <p className="mb-2 font-medium text-muted-foreground text-xs">Carbs</p>
                        <div className="flex gap-4">
                            {/* 7-Day Average */}
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-bold text-foreground text-2xl">
                                        {sevenDayAverage.carbs}g
                                    </p>
                                    {targets?.carbs && (
                                        <span className="text-muted-foreground text-xs">
                                            {getPercentageDifference(sevenDayAverage.carbs, targets.carbs)}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-muted-foreground text-xs">7-day avg</p>
                            </div>
                            {/* 30-Day Average */}
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-bold text-foreground text-2xl">
                                        {thirtyDayAverage.carbs}g
                                    </p>
                                    {targets?.carbs && (
                                        <span className="text-muted-foreground text-xs">
                                            {getPercentageDifference(thirtyDayAverage.carbs, targets.carbs)}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-muted-foreground text-xs">30-day avg</p>
                            </div>
                        </div>
                        {targets?.carbs && (
                            <p className="mt-2 text-muted-foreground text-xs">
                                Target: {targets.carbs}g
                            </p>
                        )}
                    </div>

                    {/* Fat */}
                    <div>
                        <p className="mb-2 font-medium text-muted-foreground text-xs">Fat</p>
                        <div className="flex gap-4">
                            {/* 7-Day Average */}
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-bold text-foreground text-2xl">
                                        {sevenDayAverage.fat}g
                                    </p>
                                    {targets?.fat && (
                                        <span className="text-muted-foreground text-xs">
                                            {getPercentageDifference(sevenDayAverage.fat, targets.fat)}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-muted-foreground text-xs">7-day avg</p>
                            </div>
                            {/* 30-Day Average */}
                            <div className="flex-1">
                                <div className="flex items-baseline gap-2">
                                    <p className="font-bold text-foreground text-2xl">
                                        {thirtyDayAverage.fat}g
                                    </p>
                                    {targets?.fat && (
                                        <span className="text-muted-foreground text-xs">
                                            {getPercentageDifference(thirtyDayAverage.fat, targets.fat)}
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-muted-foreground text-xs">30-day avg</p>
                            </div>
                        </div>
                        {targets?.fat && (
                            <p className="mt-2 text-muted-foreground text-xs">
                                Target: {targets.fat}g
                            </p>
                        )}
                    </div>
                </div>

                {(!calorieTarget || !targets) && (
                    <div className="mt-6 bg-muted/50 p-4 border border-border rounded-(--radius)">
                        <p className="text-muted-foreground text-sm">
                            Targets not available. Please complete your profile and set up goals to see adherence metrics.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TrackingTab() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [summaries, setSummaries] = useState<FuelDaySummary[]>([]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                // Fetch fuel day summaries (last 30 days)
                const dateFrom = new Date();
                dateFrom.setDate(dateFrom.getDate() - 30);
                dateFrom.setHours(0, 0, 0, 0);
                const dateTo = new Date();
                dateTo.setHours(23, 59, 59, 999);

                const summariesRes = await fetchJson<{ summaries: FuelDaySummary[] }>(
                    `/api/fuel/day-summary?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`
                );

                if (cancelled) return;

                // Convert date strings to Date objects
                const summariesWithDates = summariesRes.summaries.map(summary => ({
                    ...summary,
                    date: new Date(summary.date),
                }));

                setSummaries(summariesWithDates);

            } catch (err: any) {
                if (!cancelled) {
                    console.error('Failed to load tracking data', err);
                    setError(err.message || 'Failed to load tracking data');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const { sortedSummaries } = useMemo(() => {
        // Sort summaries by date in descending order (most recent first)
        const sorted = [...summaries].sort((a, b) => {
            const dateA = normalizeToLocalMidnight(a.date);
            const dateB = normalizeToLocalMidnight(b.date);
            return dateB.getTime() - dateA.getTime();
        });

        return { sortedSummaries: sorted };
    }, [summaries]);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-card p-6 border border-border rounded-lg">
                <p className="text-muted-foreground text-sm">{error}</p>
            </div>
        );
    }

    if (summaries.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center px-4 py-12 text-center">
                <Utensils className="mb-4 w-12 h-12 text-muted-foreground" />
                <h3 className="font-medium text-muted-foreground text-lg">No meal tracking data</h3>
                <p className="mt-2 text-muted-foreground text-sm">
                    Your meal tracking will appear here once you start logging meals.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6">
            {sortedSummaries.map((summary) => {
                const dateKey = getLocalDateKey(summary.date);
                const normalizedDate = normalizeToLocalMidnight(summary.date);
                
                // Get daily totals from summary
                const dailyTotal = {
                    calories: summary.calories || 0,
                    protein: summary.macros?.protein || 0,
                    carbs: summary.macros?.carbs || 0,
                    fat: summary.macros?.fat || 0,
                };

                // Calculate calories from each macro
                const proteinCalories = dailyTotal.protein * 4;
                const carbsCalories = dailyTotal.carbs * 4;
                const fatCalories = dailyTotal.fat * 9;
                const totalCalories = dailyTotal.calories || (proteinCalories + carbsCalories + fatCalories);
                
                // Calculate percentages
                const proteinPercent = totalCalories > 0 ? (proteinCalories / totalCalories) * 100 : 0;
                const carbsPercent = totalCalories > 0 ? (carbsCalories / totalCalories) * 100 : 0;
                const fatPercent = totalCalories > 0 ? (fatCalories / totalCalories) * 100 : 0;

                return (
                    <div
                        key={summary.id}
                        className="bg-card p-4 border border-border rounded-lg"
                    >
                        <div className="flex md:flex-row flex-col justify-between items-start gap-2">
                            <div className="flex justify-between gap-2 w-full">
                                <h3 className="w-[50%] font-semibold text-foreground text-sm">
                                    {dateKey}
                                </h3>
                                <span className="w-[40%] text-right">
                                    {Math.round(dailyTotal.calories)} cal
                                </span>
                            </div>
                            <div className="flex w-full text-right">
                                <span className="pr-1 border-border border-r w-[33%] text-muted-foreground text-xs text-center">
                                    {Math.round(dailyTotal.protein)}g P ({proteinPercent.toFixed(0)}%)
                                </span>
                                <span className="pr-1 border-border border-r w-[33%] text-muted-foreground text-xs text-center">
                                    {Math.round(dailyTotal.carbs)}g C ({carbsPercent.toFixed(0)}%)
                                </span>
                                <span className="pl-1 w-[33%] text-muted-foreground text-xs text-center">
                                    {Math.round(dailyTotal.fat)}g F ({fatPercent.toFixed(0)}%)
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function MacrosDashboard() {
    const tabs: Tab[] = [
        {
            id: 'adherence',
            label: 'Adherence',
            content: <AdherenceTab />,
        },
        {
            id: 'tracking',
            label: 'Tracking',
            content: <TrackingTab />,
        },
    ];

    return <TabLayout tabs={tabs} defaultTab="adherence" />;
}