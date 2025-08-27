// src/app/submissions/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { toast } from "react-hot-toast"; // 1. Import toast

type Entry = { local_date: string; topics: string; rating: number };

// --- SVG Icons ---
const PencilIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.033-2.134H8.033C6.91 2.75 6 3.704 6 4.884v.916m7.5 0a48.667 48.667 0 0 0--7.5 0" />
    </svg>
);


function SubmissionsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="card h-36"></div>
            <div className="card h-36"></div>
            <div className="card h-36"></div>
        </div>
    );
}

export default function SubmissionsPage() {
    const [data, setData] = useState<Entry[]>([]);
    const [loading, setLoading] = useState(true);
    // 2. The old error state is no longer needed
    // const [error, setError] = useState("");
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<{ topics: string; rating: number } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);


    useEffect(() => {
        const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
        const fetchSubmissions = async () => {
            try {
                const res = await apiFetch("/api/journal", { headers: authHeader() });
                if (!res.ok) throw new Error(await res.text());
                setData(await res.json());
            } catch (e) {
                // 3. Use toast for fetch errors
                toast.error(e instanceof Error ? e.message : "Failed to load submissions.");
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    const handleEditClick = (entry: Entry) => {
        setEditingId(entry.local_date);
        setEditData({ topics: entry.topics, rating: entry.rating });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData(null);
    };

    const handleSaveEdit = async (date: string) => {
        if (!editData) return;
        setIsSaving(true);
        try {
            const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
            const res = await apiFetch("/api/journal", {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ ...editData, local_date: date }),
            });
            if (!res.ok) throw new Error(await res.text());
            setData(current => current.map(e => e.local_date === date ? { ...e, ...editData } : e));
            handleCancelEdit();
            toast.success("Entry saved successfully!"); // 4. Add success toast
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to save changes."); // 5. Add error toast
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteConfirm = (date: string) => {
        setEntryToDelete(date);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!entryToDelete) return;
        setIsDeleting(true);
        try {
            const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });
            const res = await apiFetch(`/api/journal`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json", ...authHeader() },
                body: JSON.stringify({ local_date: entryToDelete }),
            });
            if (!res.ok) throw new Error(await res.text() || "Failed to delete from server.");
            setData(currentData => currentData.filter(entry => entry.local_date !== entryToDelete));
            setIsConfirmOpen(false);
            setEntryToDelete(null);
            toast.success("Entry deleted successfully!"); // 4. Add success toast
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to delete entry."); // 5. Add error toast
            setIsConfirmOpen(false);
        } finally {
            setIsDeleting(false);
        }
    };
    
    const ratingOptions = Array.from({ length: 10 }, (_, i) => i + 1);

    const renderContent = () => {
        if (loading) return <SubmissionsSkeleton />;

        // 6. The main error card is no longer needed. The toast will handle it.
        // if (error) { ... }

        if (!loading && data.length === 0) {
            return (
                <div className="card text-center py-12">
                    <h2 className="text-2xl font-bold mb-2">No Journal Submissions Yet</h2>
                    <p className="text-gray-600 mb-4">Create your first entry to see it here.</p>
                    <Link href="/journal" className="btn text-lg">Write in Journal</Link>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {data.map((entry) => (
                    <div className="card" key={entry.local_date}>
                        {editingId === entry.local_date && editData ? (
                            <div className="space-y-4">
                                <textarea className="input w-full min-h-[120px] text-lg" value={editData.topics} onChange={(e) => setEditData({ ...editData, topics: e.target.value })} disabled={isSaving} />
                                <div className="flex flex-wrap items-center gap-2">
                                    {ratingOptions.map(num => <button key={num} onClick={() => setEditData({...editData, rating: num})} disabled={isSaving} className={`w-10 h-10 text-md font-bold border-2 border-black rounded-full transition-colors ${editData.rating === num ? 'bg-black text-white' : 'bg-white text-black'}`}>{num}</button>)}
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                    <button className="btn text-lg" onClick={() => handleSaveEdit(entry.local_date)} disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
                                    <button className="underline" onClick={handleCancelEdit} disabled={isSaving}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex flex-wrap justify-between items-center gap-2 border-b-2 border-black/10 pb-3 mb-3">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xl font-bold">{entry.local_date}</span>
                                        <span className="text-lg font-bold bg-black text-white py-1 px-3 rounded-full">Rating: {entry.rating}/10</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-full hover:bg-gray-200 transition-colors" onClick={() => handleEditClick(entry)} aria-label="Edit"><PencilIcon /></button>
                                        <button className="p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors" onClick={() => openDeleteConfirm(entry.local_date)} aria-label="Delete"><TrashIcon /></button>
                                    </div>
                                </div>
                                <p className="whitespace-pre-wrap text-lg leading-relaxed">{entry.topics}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            <ConfirmDialog
                isOpen={isConfirmOpen}
                title="Delete Entry"
                onConfirm={handleConfirmDelete}
                onCancel={() => setIsConfirmOpen(false)}
                confirmText="Delete"
                isConfirming={isDeleting}
            >
                Are you sure you want to delete this journal entry? This action cannot be undone.
            </ConfirmDialog>

            <div className="max-w-5xl mx-auto px-4 py-10">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold">Journal Submissions</h1>
                    <p className="text-lg text-gray-600">A complete history of your journal entries. Click the icons to edit or delete.</p>
                </header>
                {renderContent()}
            </div>
        </>
    );
}
