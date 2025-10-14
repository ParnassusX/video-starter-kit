import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Upload, Film, Wand2 } from "lucide-react";
import { LaptopMockup } from "@/components/ui/landing-laptop-mockup";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          <div className="text-left w-full lg:w-1/2">
            <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm mb-8">
              <Film className="h-4 w-4 text-purple-400 mr-2" />
              <span className="text-purple-200">AI-Powered Video Creation</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
              Unleash Your Creative Vision
            </h1>

            <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-12">
              Transform ideas into stunning videos with Kinetic Canvas. Our
              AI-powered platform makes video creation effortless with intuitive
              tools and cutting-edge AI models.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4 mb-8">
              <Link href="/app">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 w-full sm:min-w-[200px] group"
                >
                  <Wand2 className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  Create Now
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:min-w-[200px] group"
                >
                  <ArrowRight className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  Explore Features
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-4 md:gap-8 mt-8 justify-center sm:justify-start">
              <div className="flex flex-col items-center">
                <div className="text-xl md:text-2xl font-bold text-purple-400">Fast</div>
                <div className="text-xs md:text-sm text-gray-400">Creation</div>
              </div>
              <div className="h-8 border-r border-white/10"></div>
              <div className="flex flex-col items-center">
                <div className="text-xl md:text-2xl font-bold text-pink-400">Easy</div>
                <div className="text-xs md:text-sm text-gray-400">Uploads</div>
              </div>
              <div className="h-8 border-r border-white/10"></div>
              <div className="flex flex-col items-center">
                <div className="text-xl md:text-2xl font-bold text-blue-400">Powerful</div>
                <div className="text-xs md:text-sm text-gray-400">Editing</div>
              </div>
            </div>
          </div>
          
          {/* App Screenshot */}
          <div className="relative group w-full lg:w-1/2 mt-12 lg:mt-0">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-blue-900/40 blur-3xl opacity-30" />

            {/* Upload indicator animation */}
            <div className="absolute -top-8 right-8 z-10 animate-bounce hidden md:block">
              <div className="bg-purple-500/80 backdrop-blur-sm p-3 rounded-full shadow-lg shadow-purple-500/20">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div className="w-0 h-0 border-l-8 border-l-transparent border-t-8 border-t-purple-500/80 border-r-8 border-r-transparent mx-auto" />
            </div>

            <div className="transform hover:scale-105 transition-transform duration-500">
              <LaptopMockup>
                <Image
                  src="/screenshot.webp?height=800&width=1200"
                  width={1200}
                  height={800}
                  alt="Kinetic Canvas interface"
                  className="w-full h-auto rounded-md"
                  priority
                />
              </LaptopMockup>
            </div>

            {/* Floating gradient elements */}
            <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl opacity-10 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
