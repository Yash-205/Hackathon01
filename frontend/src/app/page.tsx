"use client";

import dynamic from "next/dynamic";
import { ChatWindow } from "@/components/chat-window";

// Dynamic import for Particles to avoid SSR issues with WebGL/canvas
const Particles = dynamic(
  () => import("@/components/backgrounds/Particles"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#030303]">
      {/* Particles background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Particles
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleColors={["#ffffff"]}
          moveParticlesOnHover
          particleHoverFactor={1}
          alphaParticles
          particleBaseSize={100}
          sizeRandomness={1}
          cameraDistance={20}
          className="opacity-40"
        />
      </div>

      {/* Chat UI */}
      <div className="relative z-10 flex flex-col h-full w-full">
        <ChatWindow />
      </div>
    </main>
  );
}
