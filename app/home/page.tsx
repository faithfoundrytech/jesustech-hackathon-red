"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import MenuBar from "@/components/MenuBar";
import GameList from "@/components/GameList";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    } else if (isLoaded) {
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-soft-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-white dark:bg-deep-blue-grey">
      <MenuBar />
      <main className="max-w-6xl mx-auto px-4 pt-20 pb-12">
        <h1 className="text-3xl font-bold text-deep-navy dark:text-light-lavender mb-8">Available Games</h1>
        <GameList />
      </main>
    </div>
  );
}
