import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Film, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="fixed top-0 w-full border-b border-white/10 bg-black/50 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex flex-1">
          <Link href="/" className="flex items-center space-x-2">
            <Film className="w-6 h-6 text-purple-400" />
            <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Kinetic Canvas</span>
          </Link>
        </div>

        <nav className="flex-1 hidden md:flex items-center justify-center space-x-8">
          <Link
            href="#features"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Features
          </Link>
          <Link
            href="#community"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Community
          </Link>
          <Link
            href="#pricing"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Pricing
          </Link>
        </nav>

        <div className="flex flex-1 justify-end items-center space-x-4">
          <Link href="/app">
            <Button className="bg-white text-black hover:bg-gray-200">
              Try it now
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
