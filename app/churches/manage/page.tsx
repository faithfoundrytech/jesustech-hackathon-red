"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import MenuBar from "../../../components/MenuBar";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

// Define the interfaces for our data types
interface Metrics {
  usersCount: number;
  gamesPlayedCount: number;
  totalGamesCount: number;
  shopItemsCount: number;
}

interface Church {
  _id: string;
  name: string;
  location: string;
  description?: string;
  imageUrl?: string;
  metrics: Metrics;
  games: SermonGame[];
}

interface SermonGame {
  _id: string;
  title: string;
  status: 'pending' | 'generated' | 'rejected' | 'live' | 'archived';
  createdAt: string;
  pointsAvailable: number;
}

// Helper component for Metric Cards
function MetricCard({ title, value, isLoading }: { title: string; value: number | string; isLoading: boolean }) {
  return (
    <div className="bg-baby-blue/80 dark:bg-soft-indigo rounded-xl shadow-lg p-5 border border-deep-navy/30 dark:border-light-lavender/30 transition-all hover:shadow-xl">
      <p className="text-deep-navy dark:text-light-lavender text-sm font-bold mb-1 tracking-wide uppercase">{title}</p>
      {isLoading ? (
        <Skeleton className="h-10 w-20" />
      ) : (
        <p className="text-4xl font-bold text-deep-navy dark:text-white tracking-tight">{value}</p>
      )}
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
    case 'generated':
      specificStyle = "bg-blue-200 text-blue-900 dark:bg-blue-300/40 dark:text-blue-200";
      break;
    case 'rejected':
      specificStyle = "bg-red-200 text-red-900 dark:bg-red-300/40 dark:text-red-200";
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

// Skeletons for loading state
function ChurchInfoSkeleton() {
  return (
    <div className="w-full mb-8">
      <Skeleton className="h-64 w-full rounded-xl mb-4" />
      <Skeleton className="h-10 w-80 mb-2" />
      <Skeleton className="h-6 w-48" />
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-baby-blue/80 dark:bg-soft-indigo rounded-xl shadow-lg p-5 border border-deep-navy/30 dark:border-light-lavender/30">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-20" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-baby-blue/50 dark:bg-soft-indigo rounded-xl shadow-lg overflow-hidden border border-deep-navy/30 dark:border-light-lavender/30">
      <div className="flex justify-between items-center px-6 py-4 border-b border-deep-navy/20 dark:border-light-lavender/30 bg-baby-blue/70 dark:bg-deep-blue-grey/80">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-24" />
      </div>
      <div className="p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center border-b border-deep-navy/10 dark:border-light-lavender/10 py-4">
            <Skeleton className="h-6 w-40" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add this new component for the pending game banner
function PendingGameBanner({ pendingGames, refreshGames }: { 
  pendingGames: SermonGame[]; 
  refreshGames: () => void;
}) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fun messages to show while processing
  const messages = [
    "Reading the Word...",
    "Reflecting on the sermon...",
    "Discerning key insights...",
    "Crafting amazing questions...",
    "Finding biblical connections...",
    "Seeking divine inspiration...",
    "Connecting scripture dots...",
    "Pondering the meaning...",
    "Creating meaningful challenges...",
    "Making learning fun..."
  ];
  
  // Cycle through messages every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [messages.length]);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshGames();
    setIsRefreshing(false);
  };
  
  if (pendingGames.length === 0) return null;
  
  return (
    <div className="bg-soft-purple/20 dark:bg-soft-purple/30 border border-soft-purple/30 rounded-xl p-4 mb-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative mr-3">
            <div className="h-8 w-8 rounded-full bg-soft-purple flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <div>
            <p className="text-deep-navy dark:text-light-lavender font-medium">
              {pendingGames.length > 1 
                ? `${pendingGames.length} sermon games are being processed` 
                : `"${pendingGames[0].title}" is being processed`}
            </p>
            <p className="text-deep-navy/80 dark:text-light-lavender/80 text-sm mt-1">{messages[currentMessageIndex]}</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            isRefreshing 
              ? 'bg-soft-purple/30 text-white/70 cursor-not-allowed' 
              : 'bg-soft-purple text-white hover:bg-soft-purple/90'
          } transition-colors`}
        >
          {isRefreshing ? 'Checking...' : 'Check Status'}
        </button>
      </div>
    </div>
  );
}

export default function ManageChurchPage() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [pendingGames, setPendingGames] = useState<SermonGame[]>([]);
  const [isPendingLoading, setIsPendingLoading] = useState(false);
  
  useEffect(() => {
    if (isAuthLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    
    if (isAuthLoaded && isSignedIn) {
      // Fetch user's churches
      fetchUserChurches();
    }
  }, [isAuthLoaded, isSignedIn, router]);
  
  // Add useEffect for checking pending games
  useEffect(() => {
    // Check for lastCreatedGameId in localStorage when page loads
    const lastCreatedGameId = localStorage.getItem('lastCreatedGameId');
    const lastCreatedGameTitle = localStorage.getItem('lastCreatedGameTitle');
    
    if (lastCreatedGameId && lastCreatedGameTitle && selectedChurch) {
      // Add the newly created game to the pending list
      setPendingGames(prev => {
        // Only add if not already in the list
        if (!prev.some(game => game._id === lastCreatedGameId)) {
          return [...prev, {
            _id: lastCreatedGameId,
            title: lastCreatedGameTitle,
            status: 'pending',
            createdAt: new Date().toISOString(),
            pointsAvailable: 0
          }];
        }
        return prev;
      });
      
      // Clear the localStorage values
      localStorage.removeItem('lastCreatedGameId');
      localStorage.removeItem('lastCreatedGameTitle');
    }
  }, [selectedChurch]);
  
  // Add polling mechanism for pending games
  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;
    
    if (selectedChurch && pendingGames.length > 0) {
      // Initial check
      checkPendingGames();
      
      // Set up polling
      pollingInterval = setInterval(() => {
        checkPendingGames();
      }, 10000); // Check every 10 seconds
    }
    
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [selectedChurch, pendingGames.length]);
  
  // Function to check pending games status
  const checkPendingGames = async () => {
    if (!selectedChurch || isPendingLoading) return;
    
    try {
      setIsPendingLoading(true);
      
      const response = await fetch(`/api/churches/pending-games?churchId=${selectedChurch._id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch pending games');
      }
      
      const data = await response.json();
      
      // If games have changed from pending, refresh the full list
      const pendingGameIds = pendingGames.map(game => game._id);
      const foundPendingGames = data.games.filter((game: SermonGame) => 
        pendingGameIds.includes(game._id) && game.status === 'pending'
      );
      
      // If we have fewer pending games than before, refresh the full list
      if (foundPendingGames.length < pendingGames.length) {
        await fetchUserChurches();
      }
      
      // Update the pending games list
      setPendingGames(foundPendingGames);
      
    } catch (error) {
      console.error('Error checking pending games:', error);
    } finally {
      setIsPendingLoading(false);
    }
  };
  
  // Modify the existing fetchUserChurches function to also refresh pending games
  const fetchUserChurches = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/churches/user');
      
      if (!response.ok) {
        throw new Error('Failed to fetch churches');
      }
      
      const data = await response.json();
      setChurches(data.churches);
      
      // Set the first church as selected if available
      if (data.churches && data.churches.length > 0) {
        const newSelectedChurch = data.churches[0];
        setSelectedChurch(newSelectedChurch);
        
        // Get pending games for this church
        if (newSelectedChurch._id) {
          try {
            const pendingResponse = await fetch(`/api/churches/pending-games?churchId=${newSelectedChurch._id}`);
            if (pendingResponse.ok) {
              const pendingData = await pendingResponse.json();
              setPendingGames(pendingData.pendingGames || []);
            }
          } catch (err) {
            console.error('Error fetching pending games:', err);
          }
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
    }
  };

  // Add a function to handle game approval
  const handleApproveGame = async (gameId: string, title: string) => {
    try {
      const response = await fetch(`/api/churches/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve game');
      }

      // Show success toast with animation
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-lg p-4 shadow-md flex items-center"
        >
          <CheckCircle className="text-green-600 dark:text-green-400 mr-3 h-6 w-6" />
          <div>
            <h3 className="font-medium text-green-800 dark:text-green-300">Game Approved!</h3>
            <p className="text-sm text-green-700 dark:text-green-300">"{title}" is now live and ready to be played.</p>
          </div>
        </motion.div>
      ));

      // Refresh the games list
      fetchUserChurches();
    } catch (error) {
      console.error('Error approving game:', error);
      toast.error('Failed to approve game');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-white/90 dark:bg-deep-blue-grey">
        <MenuBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <ChurchInfoSkeleton />
          <MetricsSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-12">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
          <TableSkeleton />
        </main>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        {selectedChurch && (
          <div className="mb-10">
            <div className="relative h-64 w-full rounded-xl overflow-hidden mb-6 shadow-lg">
              <Image 
                src={selectedChurch.imageUrl || "/church-default.jpg"}
                alt={selectedChurch.name}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-6">
                  <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
                    {selectedChurch.name}
                  </h1>
                  <p className="text-white/90 text-lg">
                    {selectedChurch.location}
                  </p>
                </div>
              </div>
            </div>
        
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div className="text-deep-navy dark:text-light-lavender mb-4 md:mb-0">
                <p className="text-lg">{selectedChurch.description}</p>
              </div>
              
              {churches.length > 1 && (
                <select 
                  value={selectedChurch._id}
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
          
            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <MetricCard 
                title="Church Members" 
                value={selectedChurch.metrics.usersCount} 
                isLoading={isLoading} 
              />
              <MetricCard 
                title="Games Played" 
                value={selectedChurch.metrics.gamesPlayedCount}
                isLoading={isLoading}
              />
              <MetricCard 
                title="Total Games" 
                value={selectedChurch.metrics.totalGamesCount}
                isLoading={isLoading}
              />
              <MetricCard 
                title="Shop Items" 
                value={selectedChurch.metrics.shopItemsCount}
                isLoading={isLoading}
              />
            </div>

            {/* Action Buttons */}
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

            {/* Add the pending game banner */}
            <PendingGameBanner pendingGames={pendingGames} refreshGames={checkPendingGames} />

            {/* List of Sermon Games */}
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
                    {selectedChurch.games.map((game) => (
                      <tr key={game._id} className="hover:bg-baby-blue/80 dark:hover:bg-deep-blue-grey/90 transition-colors duration-150 ease-in-out">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-deep-navy dark:text-white">{game.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <StatusBadge status={game.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-deep-navy dark:text-white">
                          {new Date(game.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-deep-navy dark:text-white">{game.pointsAvailable}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {game.status === 'generated' && (
                            <button
                              onClick={() => handleApproveGame(game._id, game.title)}
                              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-3 rounded-md mr-4 transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={() => router.push(`/churches/manage/edit-sermon/${game._id}`)}
                            className="text-soft-purple hover:text-soft-purple/90 dark:text-coral-pink dark:hover:text-coral-pink/90 mr-4 transition-colors font-semibold"
                          >
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 transition-colors font-semibold">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {(!selectedChurch.games || selectedChurch.games.length === 0) && (
                <div className="text-center py-10 px-6">
                  <p className="text-deep-navy dark:text-light-lavender">No sermon games found. Create your first game!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}