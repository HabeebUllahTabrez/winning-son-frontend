import type { Metadata } from "next";
import { Patrick_Hand } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const scribble = Patrick_Hand({ weight: "400", subsets: ["latin"], variable: "--font-scribble" });

export const metadata: Metadata = {
  title: "Daily Progress",
  description: "Sketchbook-style daily journal",
};

function Nav() {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-black/10">
      <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">Daily Progress</Link>
        <div className="flex gap-4 text-base">
          <Link href="/dashboard" className="underline">Dashboard</Link>
          <Link href="/journal" className="underline">Journal</Link>
          <Link href="/submissions" className="underline">Submissions</Link>
          <Link href="/analyzer" className="underline">Analyzer</Link>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={`${scribble.variable} min-h-screen bg-white text-black`} style={{ fontFamily: "var(--font-scribble), system-ui, -apple-system, Segoe UI, Roboto" }}>
        <Nav />
				<div className="max-w-3xl mx-auto p-6">{children}</div>
			</body>
		</html>
	);
}
