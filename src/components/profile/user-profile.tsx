"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/ui/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export function UserProfile() {
  const { data: session, update } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      update();
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, email });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
            <AvatarFallback className="text-xl">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and API keys
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal information and email address
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending && (
                      <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Profile
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your API keys for different AI providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ApiKeyManager provider="fal" label="fal.ai" />
                <Separator />
                <ApiKeyManager provider="replicate" label="Replicate" />
                <Separator />
                <ApiKeyManager provider="bytedance" label="Bytedance" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  View your API usage and costs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UsageStats userId={session?.user?.id} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription plan and billing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionInfo userId={session?.user?.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ApiKeyManager({ provider, label }: { provider: string; label: string }) {
  const [apiKey, setApiKey] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const { data: existingKey } = useQuery({
    queryKey: ["api-key", provider],
    queryFn: async () => {
      const response = await fetch(`/api/user/keys/${provider}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  const saveKeyMutation = useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch(`/api/user/keys/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key }),
      });

      if (!response.ok) {
        throw new Error("Failed to save API key");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success(`${label} API key saved successfully`);
      setIsEditing(false);
      setApiKey("");
    },
    onError: () => {
      toast.error(`Failed to save ${label} API key`);
    },
  });

  const handleSaveKey = () => {
    saveKeyMutation.mutate(apiKey);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        {existingKey ? (
          <Badge variant="outline">Configured</Badge>
        ) : (
          <Badge variant="secondary">Not configured</Badge>
        )}
      </div>
      
      {isEditing ? (
        <div className="space-y-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter your ${label} API key`}
          />
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleSaveKey}
              disabled={saveKeyMutation.isPending || !apiKey}
            >
              {saveKeyMutation.isPending && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsEditing(true)}
        >
          {existingKey ? "Update" : "Add"} API Key
        </Button>
      )}
    </div>
  );
}

function UsageStats({ userId }: { userId?: string }) {
  const { data: usage } = useQuery({
    queryKey: ["usage", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/user/usage`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  if (!usage) {
    return <p>No usage data available</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Total Cost</p>
          <p className="text-2xl font-bold">${usage.totalCost.toFixed(2)}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Total Requests</p>
          <p className="text-2xl font-bold">{usage.totalRequests}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">This Month</p>
          <p className="text-2xl font-bold">${usage.thisMonth.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}

function SubscriptionInfo({ userId }: { userId?: string }) {
  const { data: subscription } = useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch("/api/user/subscription");
      if (!response.ok) return null;
      return response.json();
    },
  });

  if (!subscription) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          You are on the Free plan
        </p>
        <Button>Upgrade to Pro</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium capitalize">{subscription.plan} Plan</p>
          <p className="text-sm text-muted-foreground">
            Status: <span className="capitalize">{subscription.status}</span>
          </p>
        </div>
        <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
          {subscription.status}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Current period: {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{" "}
          {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
        </p>
      </div>

      {subscription.plan === "free" && (
        <Button>Upgrade to Pro</Button>
      )}
    </div>
  );
}