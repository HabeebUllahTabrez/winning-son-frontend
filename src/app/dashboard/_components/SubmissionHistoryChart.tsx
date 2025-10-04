// src/app/dashboard/_components/SubmissionHistoryChart.tsx
"use client";

import { useEffect, useState } from "react";
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

export function SubmissionHistoryChart() {
    const [data, setData] = useState<SubmissionHistoryData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());

    useEffect(() => {
        loadHistory();
    }, [viewMode, selectedMonth, selectedYear]);

    const loadHistory = async () => {
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
        if (!data) return [];

        const monthsData: { [key: string]: { monthName: string; weeks: HistoryItem[][] } } = {};

        data.history.forEach(item => {
            const date = new Date(item.local_date + 'T00:00:00');
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('en-US', { month: 'short' });

            if (!monthsData[monthKey]) {
                monthsData[monthKey] = { monthName, weeks: [] };
            }
        });

        // Group days into weeks (rows)
        data.history.forEach(item => {
            const date = new Date(item.local_date + 'T00:00:00');
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const dayOfWeek = date.getDay();

            // Find or create the appropriate week
            const monthData = monthsData[monthKey];
            let currentWeek = monthData.weeks[monthData.weeks.length - 1];

            if (!currentWeek || (currentWeek.length > 0 && dayOfWeek === 0)) {
                currentWeek = [];
                monthData.weeks.push(currentWeek);
            }

            // Add empty days if this is the first item in first week
            if (monthData.weeks.length === 1 && currentWeek.length === 0) {
                for (let i = 0; i < dayOfWeek; i++) {
                    currentWeek.push({ local_date: '', has_submission: false });
                }
            }

            currentWeek.push(item);
        });

        return Object.values(monthsData);
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
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border-2 border-black">
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
                                {data.history.map((item) => (
                                    <div
                                        key={item.local_date}
                                        className={`
                                            aspect-square rounded transition-all cursor-pointer hover:scale-105
                                            ${item.has_submission ? 'bg-green-500' : 'bg-gray-200'}
                                        `}
                                        title={`${item.local_date}: ${item.has_submission ? 'Entry created' : 'No entry'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Year View - GitHub Style */
                        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
                            <div className="min-w-max">
                                {/* Month Labels */}
                                <div className="flex gap-[2px] sm:gap-1 mb-2 ml-6 sm:ml-8">
                                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, idx) => {
                                        const monthData = groupByWeekAndMonth()[idx];
                                        if (!monthData) return null;
                                        const weekCount = monthData.weeks.length;
                                        const cellSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 7 : 10;
                                        return (
                                            <div
                                                key={month}
                                                className="text-[9px] sm:text-[10px] font-medium text-gray-600"
                                                style={{ width: `${weekCount * cellSize}px` }}
                                            >
                                                {month}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Grid with Day Labels */}
                                <div className="flex gap-[2px] sm:gap-1">
                                    {/* Day of week labels */}
                                    <div className="flex flex-col gap-[2px] sm:gap-1 justify-between text-[9px] sm:text-[10px] text-gray-600 pr-1 sm:pr-2">
                                        <div>Mon</div>
                                        <div className="invisible">Tue</div>
                                        <div>Wed</div>
                                        <div className="invisible">Thu</div>
                                        <div>Fri</div>
                                        <div className="invisible">Sat</div>
                                        <div className="invisible">Sun</div>
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="flex gap-[2px] sm:gap-1">
                                        {groupByWeekAndMonth().map((monthData, monthIdx) => (
                                            <div key={monthIdx} className="flex gap-[2px] sm:gap-1">
                                                {monthData.weeks.map((week, weekIdx) => (
                                                    <div key={weekIdx} className="flex flex-col gap-[2px] sm:gap-1">
                                                        {week.map((item, dayIdx) => (
                                                            <div
                                                                key={`${weekIdx}-${dayIdx}`}
                                                                className={`
                                                                    w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-sm transition-all cursor-pointer hover:scale-110 sm:hover:scale-125
                                                                    ${item.local_date ? (item.has_submission ? 'bg-green-500' : 'bg-gray-200') : ''}
                                                                `}
                                                                title={item.local_date ? `${item.local_date}: ${item.has_submission ? 'Entry created' : 'No entry'}` : ''}
                                                            />
                                                        ))}
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
