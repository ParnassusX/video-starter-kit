import { Button } from "@/components/ui/button";
import { Film, Mail, MessageCircle, Twitter } from "lucide-react";
import Link from "next/link";

export default function Community() {
  return (
    <section id="community" className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
            Join Our Creative Community
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Connect with fellow creators and get support from our team to make
            the most of Kinetic Canvas's powerful video creation tools.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Link href="mailto:support@kineticcanvas.com">
              <Button
                variant="outline"
                className="w-full group hover:bg-purple-900/20 hover:border-purple-500/30 transition-all hover:scale-105"
              >
                <Mail className="mr-2 h-5 w-5 text-purple-400 group-hover:text-purple-300" />
                Email Support
              </Button>
            </Link>
            <Link href="https://twitter.com/kineticcanvas">
              <Button
                variant="outline"
                className="w-full group hover:bg-blue-900/20 hover:border-blue-500/30 transition-all hover:scale-105"
              >
                <Twitter className="mr-2 h-5 w-5 text-blue-400 group-hover:text-blue-300" />
                Twitter
              </Button>
            </Link>
            <Link href="https://discord.gg/kineticcanvas">
              <Button
                variant="outline"
                className="w-full group hover:bg-indigo-900/20 hover:border-indigo-500/30 transition-all hover:scale-105"
              >
                <MessageCircle className="mr-2 h-5 w-5 text-indigo-400 group-hover:text-indigo-300" />
                Discord
              </Button>
            </Link>
          </div>

          <div className="mt-16 p-8 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 text-white">
              Ready to transform your video creation process?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of creators who are already using Kinetic Canvas to
              bring their creative visions to life.
            </p>
            <Link href="/app">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-200 min-w-[200px] group"
              >
                <Film className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Start Creating Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
