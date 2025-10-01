import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Video Studio | App",
  description: "Create videos with AI",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="app-container min-h-screen bg-black text-white">
      {children}
    </div>
  );
}
