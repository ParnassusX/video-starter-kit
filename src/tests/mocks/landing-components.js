// Mock implementation of landing page components for testing

import React from "react";

// Mock Header component
export function Header() {
  return <header data-testid="landing-header">Header</header>;
}

// Mock Hero component with Get Started button
export function Hero() {
  const handleGetStarted = () => {
    // This will be mocked in tests
    const router = require("next/router").useRouter();
    router.push("/app");
  };

  return (
    <div data-testid="landing-hero">
      <h1>Create stunning videos</h1>
      <p>with AI-powered tools</p>
      <button onClick={handleGetStarted}>Get Started</button>
    </div>
  );
}

// Mock Features component
export function Features() {
  return <div data-testid="landing-features">Features</div>;
}

// Mock Community component
export function Community() {
  return <div data-testid="landing-community">Community</div>;
}

// Mock Footer component
export function Footer() {
  return <footer data-testid="landing-footer">Footer</footer>;
}

// Default exports to match the actual components
export default {
  Header,
  Hero,
  Features,
  Community,
  Footer,
};
