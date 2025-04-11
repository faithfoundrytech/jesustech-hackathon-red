"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import MenuBar from "../../../components/MenuBar";

// Define the interfaces for our data types
interface Church {
  _id: string;
  name: string;
  location: string;
  description?: string;
  imageUrl?: string;
}

interface Metrics {
  usersCount: number;
  gamesPlayedCount: number;
  totalGamesCount: number;
  shopItemsCount: number;
}

interface SermonGame {
  _id: string;
  title: string;
  status: 'pending' | 'generated' | 'rejected' | 'live' | 'archived';
  createdAt: Date;
  pointsAvailable: number;
}

// Helper component for Metric Cards
function MetricCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="bg-baby-blue/80 dark:bg-soft-indigo rounded-xl shadow-lg p-5 border border-deep-navy/30 dark:border-light-lavender/30 transition-all hover:shadow-xl">
      <p className="text-deep-navy dark:text-light-lavender text-sm font-bold mb-1 tracking-wide uppercase">{title}</p>
      <p className="text-4xl font-bold text-deep-navy dark:text-white tracking-tight">{value}</p>
    </div>
  );
}

// Helper component for Action Buttons
function ActionButton({ onClick, children, bgColor, textColor, hoverBgColor }: {
  onClick: () => void;
  children: React.ReactNode;
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
}) {
  return (
    <button 
      onClick={onClick}
      className={`${bgColor} ${textColor} ${hoverBgColor} px-5 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out text-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-cream-white dark:focus:ring-offset-deep-blue-grey focus:ring-soft-purple/70 hover:scale-105 hover:brightness-105 border-2 border-transparent hover:border-white/20 flex items-center justify-center gap-2`}
    >
      {children}
    </button>
  );
}

// Helper component for Status Badge
function StatusBadge({ status }: { status: SermonGame['status'] }) {
  const baseStyle = "inline-block px-3 py-1 rounded-full text-xs font-semibold leading-tight";
  let specificStyle = "";

  switch (status) {
    case 'live':
      specificStyle = "bg-green-200 text-green-900 dark:bg-green-300/40 dark:text-green-200";
      break;
    case 'pending':
      specificStyle = "bg-yellow-200 text-yellow-900 dark:bg-yellow-300/40 dark:text-yellow-200";
      break;
    case 'archived':
      specificStyle = "bg-gray-200 text-gray-800 dark:bg-gray-700/60 dark:text-gray-300";
      break;
    default:
      specificStyle = "bg-gray-200 text-gray-800 dark:bg-gray-700/60 dark:text-gray-300";
  }

  return (
    <span className={`${baseStyle} ${specificStyle}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ManageChurchPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    usersCount: 0,
    gamesPlayedCount: 0,
    totalGamesCount: 0,
    shopItemsCount: 0
  });
  const [sermonGames, setSermonGames] = useState<SermonGame[]>([]);
  
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

  useEffect(() => {
    if (selectedChurch) {
      fetchChurchData(selectedChurch._id);
    }
  }, [selectedChurch]);
  
  const fetchUserChurches = async () => {
    try {
      // --- TEMPORARY MOCK DATA --- 
      const mockChurches = [
        { _id: 'church1', name: 'First Community Church', location: 'Springfield, IL' },
        { _id: 'church2', name: 'Grace Chapel', location: 'Metropolis, NY' }
      ];
      
      setChurches(mockChurches);
      
      if (mockChurches.length > 0) {
        setSelectedChurch(mockChurches[0]);
      }
      // --- END MOCK DATA ---
      
      /* Original fetch logic - temporarily commented out
      const response = await fetch('/api/churches/user');
      
      if (!response.ok) {
        throw new Error('Failed to fetch churches');
      }
      
      const data = await response.json();
      setChurches(data.churches);
      
      // Set the first church as selected if available
      if (data.churches.length > 0) {
        setSelectedChurch(data.churches[0]);
      }
      */
      
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  const fetchChurchData = async (churchId: string) => {
    try {
      // This would be a real API call to fetch metrics and games
      // For now we'll use mock data
      setMetrics({
        usersCount: 24,
        gamesPlayedCount: 156,
        totalGamesCount: 12,
        shopItemsCount: 8
      });
      
      setSermonGames([
        {
          _id: '1',
          title: 'Love Your Neighbor',
          status: 'live',
          createdAt: new Date('2023-05-15'),
          pointsAvailable: 100
        },
        {
          _id: '2',
          title: 'Faith and Works',
          status: 'archived',
          createdAt: new Date('2023-05-08'),
          pointsAvailable: 150
        },
        {
          _id: '3',
          title: 'Fruits of the Spirit',
          status: 'pending',
          createdAt: new Date('2023-05-22'),
          pointsAvailable: 200
        }
      ]);
    } catch (error) {
      console.error('Error fetching church data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-soft-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (churches.length === 0) {
    return (
      <div className="min-h-screen bg-cream-white dark:bg-deep-blue-grey">
        <MenuBar />
        <main className="max-w-6xl mx-auto px-4 pt-20 pb-12">
          <h1 className="text-3xl font-bold text-deep-navy dark:text-light-lavender mb-8">Manage Churches</h1>
          
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-white/90 dark:bg-deep-blue-grey">
      <MenuBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <h1 className="text-3xl font-bold text-deep-navy dark:text-light-lavender mb-4 md:mb-0 tracking-tight">
            Manage {selectedChurch ? selectedChurch.name : 'Church'}
          </h1>
          
          {churches.length > 1 && (
            <select 
              value={selectedChurch?._id}
              onChange={(e) => {
                const church = churches.find(c => c._id === e.target.value);
                setSelectedChurch(church || null);
              }}
              className="mt-2 md:mt-0 p-2 border bg-baby-blue/90 dark:bg-soft-indigo/90 border-deep-navy/30 dark:border-light-lavender/40 rounded-lg text-deep-navy dark:text-white focus:ring-2 focus:ring-soft-purple/80 focus:border-soft-purple text-sm font-semibold shadow-md"
            >
              {churches.map((church) => (
                <option key={church._id} value={church._id}>{church.name}</option>
              ))}
            </select>
          )}
        </div>
        
        {selectedChurch && (
          <>
            {/* Engagement Metrics First */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <MetricCard title="Church Members" value={metrics.usersCount} />
              <MetricCard title="Games Played" value={metrics.gamesPlayedCount} />
              <MetricCard title="Total Games" value={metrics.totalGamesCount} />
              <MetricCard title="Shop Items" value={metrics.shopItemsCount} />
            </div>

            {/* Action Buttons Second */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
              <ActionButton 
                onClick={() => router.push('/churches/manage/create-sermon')}
                bgColor="bg-soft-purple"
                hoverBgColor="hover:bg-soft-purple/90"
                textColor="text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Sermon Game
              </ActionButton>
              <ActionButton 
                onClick={() => router.push(`/churches/${selectedChurch._id}/shop`)}
                bgColor="bg-baby-blue"
                hoverBgColor="hover:bg-baby-blue/90"
                textColor="text-deep-navy"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Manage Shop Items
              </ActionButton>
              <ActionButton 
                onClick={() => router.push(`/churches/${selectedChurch._id}/users`)}
                bgColor="bg-coral-pink"
                hoverBgColor="hover:bg-coral-pink/90"
                textColor="text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                View Users
              </ActionButton>
            </div>

            {/* List of Sermon Games Last */}
            <div className="bg-baby-blue/50 dark:bg-soft-indigo rounded-xl shadow-lg overflow-hidden border border-deep-navy/30 dark:border-light-lavender/30">
              <div className="flex justify-between items-center px-6 py-4 border-b border-deep-navy/20 dark:border-light-lavender/30 bg-baby-blue/70 dark:bg-deep-blue-grey/80">
                <h2 className="text-xl font-bold text-deep-navy dark:text-light-lavender tracking-tight">Sermon Games</h2>
                <button 
                  onClick={() => router.push('/churches/manage/create-sermon')}
                  className="text-soft-purple hover:text-soft-purple/90 dark:text-coral-pink dark:hover:text-coral-pink/90 text-sm font-semibold flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add New
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-baby-blue dark:bg-deep-blue-grey">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-deep-navy dark:text-white uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-deep-navy dark:text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-deep-navy dark:text-white uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-deep-navy dark:text-white uppercase tracking-wider">Points</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-deep-navy dark:text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-deep-navy/20 dark:divide-light-lavender/30">
                    {sermonGames.map((game) => (
                      <tr key={game._id} className="hover:bg-baby-blue/80 dark:hover:bg-deep-blue-grey/90 transition-colors duration-150 ease-in-out">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-deep-navy dark:text-white">{game.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <StatusBadge status={game.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-deep-navy dark:text-white">{game.createdAt.toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-deep-navy dark:text-white">{game.pointsAvailable}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-soft-purple hover:text-soft-purple/90 dark:text-coral-pink dark:hover:text-coral-pink/90 mr-4 transition-colors font-semibold">Edit</button>
                          <button className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors font-semibold">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {sermonGames.length === 0 && (
                <div className="text-center py-10 px-6">
                  <p className="text-deep-navy dark:text-light-lavender">No sermon games found. Create your first game!</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}