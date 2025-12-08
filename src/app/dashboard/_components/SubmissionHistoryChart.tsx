// src/app/dashboard/_components/SubmissionHistoryChart.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSubmissionHistory } from "@/lib/api";
import { formatDateForAPI } from "@/lib/dateUtils";

type HistoryItem = {
    local_date: string;
    has_submission: boolean;
};

type SubmissionHistoryData = {
    start_date: string;
    end_date: string;
    history: HistoryItem[];
};

type ViewMode = 'month' | 'year';

type JournalEntry = {
    local_date: string;
    has_submission: boolean;
};

export function SubmissionHistoryChart({ isGuest, journalEntries = [] }: { isGuest?: boolean; journalEntries?: JournalEntry[] }) {

    const router = useRouter();
    const [data, setData] = useState<SubmissionHistoryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

    // Navigate to submissions page with the selected date in daily view
    const handleDayClick = (date: string) => {
        if (!date) return;
        router.push(`/submissions?date=${date}`);
    };

    useEffect(() => {
        loadHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, selectedMonth, selectedYear, isGuest]);

    const loadHistory = async () => {
        if (isGuest) {
            // For guests: generate full calendar view from sparse journal entries
            // Create a Set of dates that have journal entries for O(1) lookup
            const entryDatesSet = new Set((journalEntries || []).map(entry => entry.local_date));

            // Determine the date range based on view mode
            let startDate: Date;
            let endDate: Date;

            if (viewMode === 'month') {
                // Month view: show selected month
                const [year, month] = selectedMonth.split('-').map(Number);
                startDate = new Date(year, month - 1, 1);
                endDate = new Date(year, month, 0);
            } else {
                // Year view: show selected year
                startDate = new Date(selectedYear, 0, 1);
                endDate = new Date(selectedYear, 11, 31);
            }

            // Build complete history for the selected period
            const fullHistory: HistoryItem[] = [];
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                const dateStr = currentDate.toISOString().split('T')[0];
                fullHistory.push({
                    local_date: dateStr,
                    has_submission: entryDatesSet.has(dateStr)
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }

            setData({
                start_date: fullHistory[0].local_date,
                end_date: fullHistory[fullHistory.length - 1].local_date,
                history: fullHistory,
            });
            return;
        }
        setLoading(true);
        setError("");
        try {
            let start: Date;
            let end: Date;

            if (viewMode === 'month') {
                const [year, month] = selectedMonth.split('-').map(Number);
                start = new Date(year, month - 1, 1);
                end = new Date(year, month, 0);
            } else {
                start = new Date(selectedYear, 0, 1);
                end = new Date(selectedYear, 11, 31);
            }

            const result = await fetchSubmissionHistory(formatDateForAPI(start), formatDateForAPI(end));
            setData(result);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to load submission history";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const getSubmissionRate = () => {
        if (!data || !data.history.length) return 0;
        const submitted = data.history.filter(item => item.has_submission).length;
        return Math.round((submitted / data.history.length) * 100);
    };

    const groupByWeekAndMonth = () => {
        if (!data || !data.history.length) return [];

        // Create a map of dates for quick lookup
        const dateMap = new Map<string, HistoryItem>();
        data.history.forEach(item => {
            dateMap.set(item.local_date, item);
        });

        const firstDate = new Date(data.history[0].local_date + 'T00:00:00');
        const lastDate = new Date(data.history[data.history.length - 1].local_date + 'T00:00:00');

        // Find the Sunday before or on the first date
        const startDate = new Date(firstDate);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        // Find the Saturday after or on the last date
        const endDate = new Date(lastDate);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

        // Build weeks as columns (each week is an array of 7 days)
        const weeks: HistoryItem[][] = [];
        const currentDate = new Date(startDate);

        while (currentDate <= endDate) {
            const week: HistoryItem[] = [];

            for (let day = 0; day < 7; day++) {
                const dateStr = currentDate.toISOString().split('T')[0];
                const item = dateMap.get(dateStr);

                if (item) {
                    week.push(item);
                } else {
                    week.push({ local_date: '', has_submission: false });
                }

                currentDate.setDate(currentDate.getDate() + 1);
            }

            weeks.push(week);
        }

        // Group weeks by month for labels
        const monthsData: { monthName: string; weeks: HistoryItem[][] }[] = [];
        let currentMonth = -1;
        let currentMonthData: { monthName: string; weeks: HistoryItem[][] } | null = null;

        weeks.forEach(week => {
            // Use the first real date in the week to determine the month
            const firstRealDay = week.find(d => d.local_date !== '');
            if (!firstRealDay) return;

            const date = new Date(firstRealDay.local_date + 'T00:00:00');
            const month = date.getMonth();

            if (month !== currentMonth) {
                if (currentMonthData) {
                    monthsData.push(currentMonthData);
                }
                currentMonth = month;
                currentMonthData = {
                    monthName: date.toLocaleDateString('en-US', { month: 'short' }),
                    weeks: []
                };
            }

            if (currentMonthData) {
                currentMonthData.weeks.push(week);
            }
        });

        if (currentMonthData) {
            monthsData.push(currentMonthData);
        }

        return monthsData;
    };

    return (
        <div className="space-y-4">
            {/* View Mode Toggle and Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setViewMode('month')}
                        className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium border-2 transition-colors ${
                            viewMode === 'month'
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-black hover:bg-gray-100'
                        }`}
                    >
                        Month
                    </button>
                    <button
                        onClick={() => setViewMode('year')}
                        className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium border-2 transition-colors ${
                            viewMode === 'year'
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-black hover:bg-gray-100'
                        }`}
                    >
                        Year
                    </button>

                    {viewMode === 'month' ? (
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            max={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`}
                            className="px-3 py-2 border-2 border-black rounded-md text-sm font-medium"
                        />
                    ) : (
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                            className="px-3 py-2 border-2 border-black rounded-md text-sm font-medium bg-white"
                        >
                            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    )}
                </div>
                {data && (
                    <div className="text-sm font-medium">
                        <span className="text-gray-600">Completion: </span>
                        <span className="text-lg font-bold">{getSubmissionRate()}%</span>
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border-2 border-red-500 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            ) : data ? (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-2 border-black min-h-[200px] overflow-y-hidden">
                    {viewMode === 'month' ? (
                        /* Month View with Weekday Labels */
                        <div className="max-w-xs mx-auto">
                            {/* Weekday Labels */}
                            <div className="grid grid-cols-7 gap-0.5 mb-1.5">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-gray-600">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-0.5">
                                {/* Add empty cells for days before month starts */}
                                {data.history.length > 0 && Array.from({
                                    length: new Date(data.history[0].local_date + 'T00:00:00').getDay()
                                }).map((_, i) => (
                                    <div key={`empty-${i}`} className="aspect-square" />
                                ))}

                                {/* Render days */}
                                {data.history.map((item) => {
                                    const formattedDate = new Date(item.local_date + 'T00:00:00').toLocaleDateString('en-US', {
                                        weekday: 'short',
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    });
                                    return (
                                        <div
                                            key={item.local_date}
                                            onClick={() => handleDayClick(item.local_date)}
                                            className={`
                                                aspect-square rounded transition-all cursor-pointer hover:scale-105 hover:ring-2 hover:ring-black hover:ring-offset-1
                                                ${item.has_submission ? 'bg-green-500' : 'bg-gray-200'}
                                            `}
                                            title={`${formattedDate}: ${item.has_submission ? 'Entry created' : 'No entry'} - Click to view`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Year View - GitHub Style */
                        <div className="overflow-x-auto overflow-y-hidden">
                            <div className="inline-block min-w-full">
                                {/* Month Labels */}
                                <div className="flex items-center mb-3">
                                    <div className="w-12 flex-shrink-0"></div>
                                    <div className="flex gap-1">
                                        {groupByWeekAndMonth().map((monthData, idx) => (
                                            <div
                                                key={idx}
                                                className="text-xs font-semibold text-gray-700"
                                                style={{ width: `${monthData.weeks.length * 12 + (monthData.weeks.length - 1) * 4}px` }}
                                            >
                                                {monthData.monthName}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Grid with Day Labels */}
                                <div className="flex items-start">
                                    {/* Day of week labels */}
                                    <div className="w-12 flex-shrink-0 flex flex-col gap-1 text-xs font-medium text-gray-600 pr-3 sticky left-0 bg-gray-50 z-10">
                                        <div className="h-3 flex items-center">Sun</div>
                                        <div className="h-3 flex items-center">Mon</div>
                                        <div className="h-3 flex items-center">Tue</div>
                                        <div className="h-3 flex items-center">Wed</div>
                                        <div className="h-3 flex items-center">Thu</div>
                                        <div className="h-3 flex items-center">Fri</div>
                                        <div className="h-3 flex items-center">Sat</div>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="flex gap-1">
                                        {groupByWeekAndMonth().map((monthData, monthIdx) => (
                                            <div key={monthIdx} className="flex gap-1">
                                                {monthData.weeks.map((week, weekIdx) => (
                                                    <div key={weekIdx} className="flex flex-col gap-1">
                                                        {week.map((item, dayIdx) => {
                                                            const formattedDate = item.local_date
                                                                ? new Date(item.local_date + 'T00:00:00').toLocaleDateString('en-US', {
                                                                    weekday: 'short',
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                  })
                                                                : '';
                                                            return (
                                                                <div
                                                                    key={`${weekIdx}-${dayIdx}`}
                                                                    onClick={() => item.local_date && handleDayClick(item.local_date)}
                                                                    className={`
                                                                        w-3 h-3 rounded transition-all cursor-pointer hover:scale-110 hover:ring-2 hover:ring-black hover:ring-offset-1
                                                                        ${item.local_date ? (item.has_submission ? 'bg-green-500' : 'bg-gray-200') : ''}
                                                                    `}
                                                                    title={item.local_date ? `${formattedDate}: ${item.has_submission ? 'Entry created' : 'No entry'} - Click to view` : ''}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs mt-4">
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded"></div>
                            <span>Entry</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-200 rounded"></div>
                            <span>No Entry</span>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
