"use client";

import { useState } from "react";
import {
  BarChart,
  PieChart,
  LineChart,
  Activity,
  Clock,
  Users,
  ThumbsUp,
  MessageSquare,
  Eye,
  Award,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface VideoAnalysisProps {
  videoUrl: string;
}

interface AnalysisResult {
  engagement: {
    score: number;
    retention: number[];
    dropoffPoints: { time: number; reason: string }[];
  };
  content: {
    pacing: number;
    clarity: number;
    visualAppeal: number;
    audioQuality: number;
  };
  audience: {
    demographics: { group: string; percentage: number }[];
    interests: { topic: string; relevance: number }[];
  };
  suggestions: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }[];
}

export function VideoAnalysis({ videoUrl }: VideoAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("engagement");
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisResult(null);

    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 5;
      });
    }, 300);

    // Simulate API call with timeout
    setTimeout(() => {
      clearInterval(progressInterval);
      setAnalysisProgress(100);

      // Mock analysis result
      const mockResult: AnalysisResult = {
        engagement: {
          score: 78,
          retention: [100, 95, 90, 85, 80, 75, 70, 68, 65, 62],
          dropoffPoints: [
            { time: 45, reason: "Slow pacing in explanation section" },
            { time: 120, reason: "Technical content may be too complex" },
            { time: 180, reason: "Competing call-to-action messages" },
          ],
        },
        content: {
          pacing: 72,
          clarity: 85,
          visualAppeal: 90,
          audioQuality: 88,
        },
        audience: {
          demographics: [
            { group: "Tech professionals", percentage: 45 },
            { group: "Students", percentage: 30 },
            { group: "Content creators", percentage: 15 },
            { group: "Others", percentage: 10 },
          ],
          interests: [
            { topic: "AI/Machine Learning", relevance: 90 },
            { topic: "Video Production", relevance: 85 },
            { topic: "Software Development", relevance: 75 },
            { topic: "Digital Marketing", relevance: 60 },
          ],
        },
        suggestions: [
          {
            title: "Optimize intro sequence",
            description:
              "Shorten the introduction by 20% to improve retention. The current 25-second intro may be causing early dropoffs.",
            priority: "high",
          },
          {
            title: "Improve technical explanations",
            description:
              "Add more visual aids during the technical explanation at 1:45-2:30 to improve clarity and retention.",
            priority: "medium",
          },
          {
            title: "Enhance call-to-action",
            description:
              "Make the call-to-action more prominent and focused on a single objective to reduce confusion.",
            priority: "medium",
          },
          {
            title: "Add chapter markers",
            description:
              "Include chapter markers to help viewers navigate to specific sections of interest.",
            priority: "low",
          },
        ],
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 5000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="mr-2 h-5 w-5" />
          AI Video Analysis
        </CardTitle>
        <CardDescription>
          Get AI-powered insights and suggestions to improve your video content
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!analysisResult && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Analyze Your Video</h3>
              <p className="text-sm text-muted-foreground">
                Our AI will analyze your video and provide insights on
                engagement, content quality, and audience fit.
              </p>
            </div>
            <Button onClick={handleAnalyze}>Start Analysis</Button>
          </div>
        )}

        {isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Analyzing Your Video</h3>
              <p className="text-sm text-muted-foreground">
                This may take a few moments. We're examining multiple aspects of
                your content.
              </p>
            </div>
            <div className="w-full max-w-md space-y-2">
              <Progress value={analysisProgress} className="h-2" />
              <p className="text-xs text-right text-muted-foreground">
                {analysisProgress}%
              </p>
            </div>
          </div>
        )}

        {analysisResult && (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="engagement">Engagement</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            </TabsList>

            <TabsContent value="engagement" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <ThumbsUp className="mr-2 h-4 w-4 text-primary" />
                      Engagement Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {analysisResult.engagement.score}/100
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {analysisResult.engagement.score > 75
                        ? "Above average"
                        : "Needs improvement"}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-primary" />
                      Avg. Watch Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">72%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Of total video duration
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Eye className="mr-2 h-4 w-4 text-primary" />
                      Retention Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">68%</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Viewers who watched {">"}50%
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Audience Retention
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    {/* In a real implementation, this would be a chart component */}
                    <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                      <LineChart className="h-8 w-8 text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Retention Chart
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Drop-off Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.engagement.dropoffPoints.map(
                      (point, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm"
                        >
                          <span className="font-medium">
                            {formatTime(point.time)}:
                          </span>
                          <span className="text-muted-foreground">
                            {point.reason}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Content Quality Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Pacing</span>
                        <span className="text-sm font-medium">
                          {analysisResult.content.pacing}/100
                        </span>
                      </div>
                      <Progress
                        value={analysisResult.content.pacing}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Clarity</span>
                        <span className="text-sm font-medium">
                          {analysisResult.content.clarity}/100
                        </span>
                      </div>
                      <Progress
                        value={analysisResult.content.clarity}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Visual Appeal</span>
                        <span className="text-sm font-medium">
                          {analysisResult.content.visualAppeal}/100
                        </span>
                      </div>
                      <Progress
                        value={analysisResult.content.visualAppeal}
                        className="h-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Audio Quality</span>
                        <span className="text-sm font-medium">
                          {analysisResult.content.audioQuality}/100
                        </span>
                      </div>
                      <Progress
                        value={analysisResult.content.audioQuality}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Content Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      {/* In a real implementation, this would be a chart component */}
                      <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                        <PieChart className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Content Distribution Chart
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Key Moments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-start space-x-2 text-sm">
                      <span className="font-medium">0:00-0:25:</span>
                      <span className="text-muted-foreground">
                        Introduction (too long, consider shortening)
                      </span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <span className="font-medium">0:26-1:15:</span>
                      <span className="text-muted-foreground">
                        Main concept explanation (good engagement)
                      </span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <span className="font-medium">1:16-2:30:</span>
                      <span className="text-muted-foreground">
                        Technical details (needs more visual aids)
                      </span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <span className="font-medium">2:31-3:15:</span>
                      <span className="text-muted-foreground">
                        Demonstration (high engagement)
                      </span>
                    </li>
                    <li className="flex items-start space-x-2 text-sm">
                      <span className="font-medium">3:16-3:45:</span>
                      <span className="text-muted-foreground">
                        Call to action (confusing messaging)
                      </span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audience" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Users className="mr-2 h-4 w-4 text-primary" />
                      Audience Demographics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      {/* In a real implementation, this would be a chart component */}
                      <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                        <PieChart className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Demographics Chart
                        </span>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {analysisResult.audience.demographics.map(
                        (demo, index) => (
                          <li
                            key={index}
                            className="flex items-center justify-between text-sm"
                          >
                            <span>{demo.group}</span>
                            <span className="font-medium">
                              {demo.percentage}%
                            </span>
                          </li>
                        ),
                      )}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium flex items-center">
                      <Award className="mr-2 h-4 w-4 text-primary" />
                      Audience Interests
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] w-full">
                      {/* In a real implementation, this would be a chart component */}
                      <div className="w-full h-full flex items-center justify-center bg-muted rounded-md">
                        <BarChart className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Interests Chart
                        </span>
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2">
                      {analysisResult.audience.interests.map(
                        (interest, index) => (
                          <li key={index} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{interest.topic}</span>
                              <span className="font-medium">
                                {interest.relevance}%
                              </span>
                            </div>
                            <Progress
                              value={interest.relevance}
                              className="h-1"
                            />
                          </li>
                        ),
                      )}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4 text-primary" />
                    Audience Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Positive</span>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                      <Progress value={65} className="h-2 bg-muted" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Neutral</span>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                      <Progress value={25} className="h-2 bg-muted" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Negative</span>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                      <Progress value={10} className="h-2 bg-muted" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-4">
              {analysisResult.suggestions.map((suggestion, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${suggestion.priority === "high" ? "border-l-destructive" : suggestion.priority === "medium" ? "border-l-warning" : "border-l-muted"}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-start">
                      <span className="mr-2">{suggestion.title}</span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${suggestion.priority === "high" ? "bg-destructive/10 text-destructive" : suggestion.priority === "medium" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}
                      >
                        {suggestion.priority}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                  </CardContent>
                </Card>
              ))}

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    AI-Generated Improvement Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li className="text-muted-foreground">
                      Focus on shortening the introduction to under 15 seconds
                    </li>
                    <li className="text-muted-foreground">
                      Add animated diagrams during technical explanations
                      (1:45-2:30)
                    </li>
                    <li className="text-muted-foreground">
                      Simplify the call-to-action to focus on a single clear
                      objective
                    </li>
                    <li className="text-muted-foreground">
                      Add chapter markers for easier navigation
                    </li>
                    <li className="text-muted-foreground">
                      Consider adding subtitles to improve accessibility
                    </li>
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {analysisResult ? (
          <Button variant="outline" onClick={handleAnalyze}>
            Re-analyze
          </Button>
        ) : (
          <div></div>
        )}
      </CardFooter>
    </Card>
  );
}
