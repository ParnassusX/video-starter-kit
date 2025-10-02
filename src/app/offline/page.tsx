import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Offline - FAL Video Studio",
  description: "You are currently offline",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter">
            You're Offline
          </h1>
          <p className="text-muted-foreground">
            It looks like you've lost your internet connection. Some features
            may be unavailable until you're back online.
          </p>
        </div>

        <div className="space-y-4 pt-6">
          <h2 className="text-xl font-semibold">What you can do:</h2>
          <ul className="space-y-2 text-left list-disc list-inside">
            <li>
              Continue working on your current project (changes will sync when
              you're back online)
            </li>
            <li>Access previously cached projects</li>
            <li>Use basic editing features that don't require AI processing</li>
          </ul>
        </div>

        <div className="pt-8">
          <Link
            href="/app"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Go to App
          </Link>
        </div>
      </div>
    </div>
  );
}
