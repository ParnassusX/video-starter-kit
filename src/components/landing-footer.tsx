import Link from "next/link";
import { Film, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t flex w-full border-white/10 py-12 bg-gradient-to-b from-black to-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 max-w-screen-md md:grid-cols-3 gap-8 mx-auto">
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2 mb-4">
              <Film className="w-6 h-6 text-purple-400" />
              <span className="font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                Kinetic Canvas
              </span>
            </div>
            <p className="text-sm text-gray-300">
              AI-powered content creation platform
              <br />
              for the modern creator.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link
                  href="#features"
                  className="hover:text-purple-300 transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="hover:text-purple-300 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-purple-300 transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center text-center">
            <h4 className="font-semibold mb-4 text-white">Connect</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link
                  href="https://twitter.com/genaistudio"
                  target="_blank"
                  className="hover:text-blue-300 transition-colors"
                >
                  Twitter
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.instagram.com/genaistudio"
                  target="_blank"
                  className="hover:text-pink-300 transition-colors"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:contact@genaistudio.com"
                  className="hover:text-purple-300 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
