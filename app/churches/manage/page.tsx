"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import MenuBar from "../../../components/MenuBar";

export default function ManageChurchPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [churches, setChurches] = useState([]);
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    
    if (isLoaded && isSignedIn) {
      // Fetch user's churches
      fetchUserChurches();
    }
  }, [isLoaded, isSignedIn, router]);
  
  const fetchUserChurches = async () => {
    try {
      const response = await fetch('/api/churches/user');
      
      if (!response.ok) {
        throw new Error('Failed to fetch churches');
      }
      
      const data = await response.json();
      setChurches(data.churches);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-deep-navy dark:text-light-lavender mb-8">Manage Churches</h1>
        
        {churches.length === 0 ? (
          <div className="text-center p-8 bg-white dark:bg-soft-indigo rounded-xl shadow-md">
            <h2 className="text-xl font-semibold text-deep-navy dark:text-light-lavender mb-4">You don't have any churches yet</h2>
            <p className="text-deep-navy/70 dark:text-light-lavender/70 mb-6">Create your first church to start adding games and sermons.</p>
            <button 
              onClick={() => router.push('/churches/new')}
              className="bg-soft-purple text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:opacity-90 transition-opacity"
            >
              Create Your First Church
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {churches.map((church: any) => (
              <div key={church._id} className="bg-white dark:bg-soft-indigo rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-deep-navy dark:text-light-lavender">{church.name}</h3>
                  <p className="text-deep-navy/70 dark:text-light-lavender/70 mt-2">{church.location}</p>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-end">
                  <button 
                    onClick={() => router.push(`/churches/${church._id}/dashboard`)}
                    className="bg-baby-blue/70 dark:bg-deep-blue-grey/70 text-deep-navy dark:text-light-lavender px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Manage
                  </button>
                </div>
              </div>
            ))}
            
            <div 
              onClick={() => router.push('/churches/new')}
              className="bg-white dark:bg-soft-indigo rounded-xl shadow-md flex items-center justify-center p-8 cursor-pointer hover:opacity-90 transition-opacity border-2 border-dashed border-gray-200 dark:border-gray-700"
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-baby-blue/50 dark:bg-deep-blue-grey/50 flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-deep-navy dark:text-light-lavender" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-deep-navy dark:text-light-lavender">Add New Church</h3>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}