// src/app/dashboard/_components/TrendChart.tsx
"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type TrendChartProps = {
    data: { local_date: string; points: number }[];
};

export function TrendChart({ data }: TrendChartProps) {
    // Format date for display on X-axis (e.g., "Mon", "Tue")
    const formattedData = data.map(item => ({
        ...item,
        name: new Date(item.local_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                    cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
                    contentStyle={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                    }}
                    labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="points" fill="#111827" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}
