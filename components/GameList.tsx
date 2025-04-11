"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

interface Church {
  _id: string;
  name: string;
  imageUrl?: string;
}

interface Game {
  _id: string;
  title: string;
  description?: string;
  status: string;
  churchId: string;
  pointsAvailable: number;
}

interface GroupedGames {
  [churchId: string]: {
    church: Church;
    games: Game[];
  };
}

export default function GameList() {
  const { isLoaded, user, isSignedIn } = useUser();
  const [groupedGames, setGroupedGames] = useState<GroupedGames>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        
        if (!response.ok) {
          throw new Error('Failed to fetch games');
        }
        
        const data = await response.json();
        const games: Game[] = data.games;
        const churches: Church[] = data.churches;
        
        // Group games by church
        const grouped: GroupedGames = {};
        
        games.forEach(game => {
          const church = churches.find(c => c._id === game.churchId);
          
          if (church) {
            if (!grouped[game.churchId]) {
              grouped[game.churchId] = {
                church,
                games: []
              };
            }
            
            grouped[game.churchId].games.push(game);
          }
        });
        
        setGroupedGames(grouped);
      } catch (err) {
        console.error(err);
        setError('Failed to load games. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [isLoaded, isSignedIn]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-soft-purple border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          className="mt-4 bg-soft-purple text-white px-4 py-2 rounded-lg"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (Object.keys(groupedGames).length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-deep-navy dark:text-light-lavender text-lg">No games available right now.</p>
        <p className="text-deep-navy/70 dark:text-light-lavender/70">Check back later or join a church to play their games.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {Object.values(groupedGames).map(({ church, games }) => (
        <div key={church._id} className="bg-white dark:bg-soft-indigo rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              {church.imageUrl ? (
                <img 
                  src={church.imageUrl} 
                  alt={church.name} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-baby-blue dark:bg-deep-blue-grey flex items-center justify-center mr-4">
                  <span className="text-xl font-bold text-deep-navy dark:text-light-lavender">
                    {church.name.charAt(0)}
                  </span>
                </div>
              )}
              <h2 className="text-xl font-bold text-deep-navy dark:text-light-lavender">{church.name}</h2>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {games.map(game => (
              <div key={game._id} className="p-6 hover:bg-baby-blue/10 dark:hover:bg-deep-blue-grey/30 transition-colors">
                <Link href={`/games/${game._id}`} className="block">
                  <h3 className="font-semibold text-lg text-deep-navy dark:text-light-lavender">{game.title}</h3>
                  {game.description && (
                    <p className="mt-1 text-deep-navy/70 dark:text-light-lavender/70 line-clamp-2">{game.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-sm font-medium text-soft-purple dark:text-coral-pink">
                      {game.pointsAvailable} points available
                    </span>
                    <span 
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        game.status === 'live' 
                          ? 'bg-soft-mint/70 dark:bg-soft-mint/30 text-deep-navy dark:text-light-lavender' 
                          : 'bg-warm-peach/70 dark:bg-warm-peach/30 text-deep-navy dark:text-light-lavender'
                      }`}
                    >
                      {game.status === 'live' ? 'Ready to Play' : 'Coming Soon'}
                    </span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 