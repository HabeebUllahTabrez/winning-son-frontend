// src/app/dashboard/_components/StatCard.tsx
import { ReactNode } from 'react';

type StatCardProps = {
    title: string;
    value: string | number;
    icon?: ReactNode;
    isSmall?: boolean;
};

export function StatCard({ title, value, icon, isSmall = false }: StatCardProps) {
    return (
        <div className="card p-6 flex items-center justify-between">
            <div>
                <h3 className={`font-semibold text-gray-500 ${isSmall ? 'text-base' : 'text-lg'}`}>
                    {title}
                </h3>
                <p className={`font-bold text-gray-900 ${isSmall ? 'text-3xl' : 'text-5xl'}`}>
                    {value}
                </p>
            </div>
            {icon && <div className="text-4xl">{icon}</div>}
        </div>
    );
}
