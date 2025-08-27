// src/app/dashboard/_components/CallToAction.tsx

type CallToActionProps = {
    hasEntryToday: boolean;
};

export function CallToAction({ hasEntryToday }: CallToActionProps) {
    if (hasEntryToday) {
        return (
            <div className="card bg-green-50 border-green-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-green-800">All Set for Today!</h2>
                    <p className="text-green-700">You&apos;ve completed your journal entry. Great job!</p>
                </div>
                <a href="/journal" className="btn-secondary whitespace-nowrap">
                    View Today&apos;s Journal
                </a>
            </div>
        );
    }

    return (
        <div className="card bg-blue-50 border-blue-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
                <h2 className="text-xl font-bold text-blue-800">Ready to Start Your Day?</h2>
                <p className="text-blue-700">Log your thoughts and feelings in today&apos;s journal.</p>
            </div>
            <a href="/journal" className="btn whitespace-nowrap">
                Start Today&apos;s Journal
            </a>
        </div>
    );
}
