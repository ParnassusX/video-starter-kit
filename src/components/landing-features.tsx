import { Sparkles, Zap, Image, Video, Music, Type, Scissors, Upload, Activity, Wand2 } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "AI Video Creation",
    description:
      "Transform text prompts into professional-quality videos with our advanced AI models.",
  },
  {
    icon: Scissors,
    title: "Smart Video Editing",
    description:
      "Edit and enhance your videos with AI-powered tools that make professional editing accessible to everyone.",
  },
  {
    icon: Upload,
    title: "Seamless File Upload",
    description: "Drag and drop your media files with our intuitive upload system that handles videos, images, and audio.",
  },
  {
    icon: Activity,
    title: "Video Analysis",
    description: "Gain insights from your videos with AI analysis tools that help optimize your content.",
  },
  {
    icon: Wand2,
    title: "One-Click Enhancement",
    description: "Instantly improve video quality, stabilization, and color grading with our AI enhancement tools.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Experience rapid video generation and editing with our optimized AI infrastructure.",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
            Powerful Video Creation Tools
          </h2>
          <p className="text-gray-300 text-lg">
            Kinetic Canvas provides everything you need to create, edit, and enhance videos with AI assistance.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7 text-purple-300" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white group-hover:text-purple-300 transition-colors">{feature.title}</h3>
              <p className="text-gray-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
