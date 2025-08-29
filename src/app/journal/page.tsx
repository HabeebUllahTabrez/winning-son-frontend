import { Suspense } from 'react';
import JournalClient from './JournalClient';

// You can create a more detailed loading skeleton component if you wish
function JournalLoading() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <h1 className="text-4xl font-bold">Loading Journal...</h1>
            <p className="text-lg text-gray-600">Getting everything ready for you.</p>
        </div>
    );
}

export default function JournalPage() {
    return (
        <Suspense fallback={<JournalLoading />}>
            <JournalClient />
        </Suspense>
    );
}
