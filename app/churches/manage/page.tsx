"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Play, Award, Zap, Calendar, ChevronRight, BookOpen, Star, Trophy, Users, Gamepad2, Library, ShoppingBag, Settings, Plus, ChevronDown, Search } from "lucide-react";
import MenuBar from "@/components/MenuBar";
import Leaderboard from "@/components/Leaderboard";
// import { Skeleton } from "../../../components/ui/skeleton";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
// import { Button } from "../../../components/ui/button";
// import { Input } from "../../../components/ui/input";

// Mock implementations - using inline styles instead of missing component imports
// These will be replaced once the proper shadcn components are installed
const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-lg shadow ${className}`} {...props}>{children}</div>
);

const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 ${className}`} {...props}>{children}</div>
);

// Mock the Select component and its parts
const Select = ({ children, onValueChange, value }: { 
  children: React.ReactNode, 
  onValueChange: (value: string) => void,
  value?: string
}) => {
  return children;
};

const SelectTrigger = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

const SelectValue = ({ placeholder }: { placeholder: string }) => (
  <span>{placeholder}</span>
);

const SelectContent = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

const SelectItem = ({ className, value, children }: { 
  className?: string, 
  value: string,
  children: React.ReactNode 
}) => (
  <div className={className}>{children}</div>
);

// Mock Button component
const Button = ({ 
  variant = "default", 
  className, 
  children,
  onClick,
  ...props 
}: { 
  variant?: string, 
  className?: string, 
  children: React.ReactNode,
  onClick?: () => void,
  [key: string]: any
}) => (
  <button className={className} onClick={onClick} {...props}>{children}</button>
);

// Mock Input component
const Input = ({ 
  type, 
  placeholder, 
  value, 
  onChange, 
  className 
}: { 
  type: string, 
  placeholder?: string,
  value?: string,
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
  className?: string
}) => (
  <input 
    type={type} 
    placeholder={placeholder} 
    value={value} 
    onChange={onChange} 
    className={className} 
  />
);

// Mock Skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={className}></div>
);

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
  status: 'live' | 'pending' | 'archived';
  createdAt: Date;
  pointsAvailable: number;
  description?: string;
  mainVerses?: string[];
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  gamesPlayed: number;
  streak?: number;
  avatar?: string;
}

export default function ManageChurchPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [pageIsLoading, setPageIsLoading] = useState(true);
  const [churches, setChurches] = useState<Church[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<Church | null>(null);
  const [metrics, setMetrics] = useState<Metrics>({
    usersCount: 0,
    gamesPlayedCount: 0,
    totalGamesCount: 0,
    shopItemsCount: 0
  });
  const [sermonGames, setSermonGames] = useState<SermonGame[]>([]);
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
      return;
    }
    
    if (isLoaded && isSignedIn) {
      fetchUserChurches();
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (selectedChurch) {
      fetchChurchData(selectedChurch._id);
    } else if (churches.length > 0) {
      setSelectedChurch(churches[0]);
    }
  }, [selectedChurch, churches]);
  
  const fetchUserChurches = async () => {
    setPageIsLoading(true);
    try {
      const mockChurches: Church[] = [
        {
          _id: "church1",
          name: "First Community Church",
          location: "Seattle, WA",
          description: "Serving the community with love and faith.",
          imageUrl: "/placeholder-church1.jpg",
        },
        {
          _id: "church2",
          name: "Hope Fellowship",
          location: "Portland, OR",
          description: "A place to belong and grow.",
          imageUrl: "/placeholder-church2.jpg",
        },
      ];
      setChurches(mockChurches);
      if (!selectedChurch && mockChurches.length > 0) {
        setSelectedChurch(mockChurches[0]);
      }
    } catch (error) {
      console.error('Error fetching user churches:', error);
    } finally {
    }
  };

  const fetchChurchData = async (churchId: string) => {
    setPageIsLoading(true);
    try {
      setMetrics({
        usersCount: Math.floor(Math.random() * 100) + 50,
        gamesPlayedCount: Math.floor(Math.random() * 500) + 100,
        totalGamesCount: Math.floor(Math.random() * 20) + 5,
        shopItemsCount: Math.floor(Math.random() * 30) + 10
      });
      
      const mockGames: SermonGame[] = [
        {
          _id: 'sg1_' + churchId,
          title: 'Love Your Neighbor',
          status: 'live',
          createdAt: new Date('2023-10-15'),
          pointsAvailable: 100,
          description: "Exploring the meaning of Jesus' command.",
          mainVerses: ['Matthew 22:39']
        },
        {
          _id: 'sg2_' + churchId,
          title: 'Faith and Works',
          status: 'archived',
          createdAt: new Date('2023-10-08'),
          pointsAvailable: 150,
          description: "Understanding the relationship between faith and action.",
          mainVerses: ['James 2:17']
        },
        {
          _id: 'sg3_' + churchId,
          title: 'Fruits of the Spirit',
          status: 'pending',
          createdAt: new Date('2023-10-22'),
          pointsAvailable: 200,
          description: "Living a life filled with God's spirit.",
          mainVerses: ['Galatians 5:22-23']
        }
      ];
      setSermonGames(mockGames);

      const mockLeaderboard: LeaderboardEntry[] = [
        { rank: 1, name: "Sarah J.", points: Math.floor(Math.random() * 500) + 1000, gamesPlayed: 15, streak: 5 },
        { rank: 2, name: "Michael C.", points: Math.floor(Math.random() * 400) + 800, gamesPlayed: 12, streak: 3 },
        { rank: 3, name: "Emily D.", points: Math.floor(Math.random() * 300) + 700, gamesPlayed: 10, streak: 2 },
        { rank: 4, name: "James W.", points: Math.floor(Math.random() * 200) + 600, gamesPlayed: 8 },
        { rank: 5, name: "Lisa A.", points: Math.floor(Math.random() * 150) + 500, gamesPlayed: 7 },
      ];
      setLeaderboardEntries(mockLeaderboard);

    } catch (error) {
      console.error('Error fetching church data:', error);
    } finally {
      setPageIsLoading(false);
    }
  };

  const handleChurchChange = (churchId: string) => {
    const church = churches.find(c => c._id === churchId);
    setSelectedChurch(church || null);
  };

  const filteredSermonGames = sermonGames.filter(game => 
    game.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (pageIsLoading && !selectedChurch) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <motion.div 
          className="w-20 h-20 relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-playful opacity-20"></div>
          <div className="animate-pulse-custom absolute inset-2 rounded-full bg-gradient-playful opacity-40"></div>
          <div className="absolute inset-4 rounded-full bg-gradient-playful opacity-60"></div>
          <div className="absolute inset-6 rounded-full bg-background"></div>
        </motion.div>
        <p className="mt-6 text-foreground/70 font-medium text-lg">Loading Church Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <MenuBar />


      <div className="pt-20 pb-6 bg-gradient-pastoral relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-white opacity-10 rounded-full"></div>
        <div className="absolute left-12 bottom-0 w-32 h-32 bg-white opacity-10 rounded-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="mb-6 md:mb-0">
              <motion.h1 
                className="text-3xl md:text-4xl font-bold font-fredoka mb-2 text-white"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {selectedChurch ? `${selectedChurch.name} Dashboard` : 'Manage Church'} ✨
              </motion.h1>
              <motion.p 
                className="text-white/80 text-lg max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {selectedChurch ? selectedChurch.description : "Manage your church's games, sermons, and community."}
              </motion.p>
            </div>
          
          {churches.length > 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Select onValueChange={handleChurchChange} value={selectedChurch?._id}>
                  <SelectTrigger className="w-[220px] bg-white/20 backdrop-blur-sm border-none text-white font-medium rounded-xl shadow-playful py-3 px-4 hover:bg-white/30 transition-colors">
                    <SelectValue placeholder="Select Church" />
                  </SelectTrigger>
                  <SelectContent className="bg-soft-indigo border-soft-purple/30 text-white">
              {churches.map((church) => (
                      <SelectItem 
                        key={church._id} 
                        value={church._id}
                        className="hover:bg-soft-purple/20 focus:bg-soft-purple/30 cursor-pointer"
                      >
                        {church.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </div>
        </div>
            </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="space-y-8">
          
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ 
              hidden: { opacity: 0 }, 
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } } 
            }}
          >
            {pageIsLoading ? (
              [...Array(4)].map((_, i) => (
                <motion.div key={i} variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                  <Skeleton className="h-[110px] rounded-2xl bg-soft-indigo/80" />
                </motion.div>
              ))
            ) : (
              <>
                <StatsCard icon={Users} title="Total Users" value={metrics.usersCount} color="soft-purple" />
                <StatsCard icon={Gamepad2} title="Games Played" value={metrics.gamesPlayedCount} color="warm-peach" subtitle="Past 30 days" />
                <StatsCard icon={Library} title="Total Games" value={metrics.totalGamesCount} color="baby-blue" subtitle="Available" />
                <StatsCard icon={ShoppingBag} title="Shop Items" value={metrics.shopItemsCount} color="soft-mint" subtitle="Active Rewards" />
              </>
            )}
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
              <ActionButton 
              icon={Plus} 
              onClick={() => router.push(`/churches/manage/create-sermon?churchId=${selectedChurch?._id}`)} 
              variant="default"
            >
              New Sermon
              </ActionButton>
              <ActionButton 
              icon={ShoppingBag} 
              onClick={() => router.push(`/churches/manage/shop?churchId=${selectedChurch?._id}`)} 
            >
              Manage Shop
              </ActionButton>
              <ActionButton 
              icon={Settings} 
              onClick={() => router.push(`/churches/manage/settings?churchId=${selectedChurch?._id}`)} 
            >
              Settings
              </ActionButton>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <motion.div
              className="lg:col-span-2 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold font-fredoka text-foreground flex items-center">
                  Sermon Games
                </h2>
                <div className="relative w-full max-w-xs">
                  <Input 
                    type="text" 
                    placeholder="Search games..." 
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="bg-soft-indigo border-soft-purple/30 focus:border-soft-purple focus:ring-soft-purple/50 rounded-xl pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
                </div>
              </div>

              {pageIsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-[120px] rounded-2xl bg-soft-indigo/80" />
                  ))}
                </div>
              ) : filteredSermonGames.length > 0 ? (
                <div className="space-y-4">
                  {filteredSermonGames.map((game) => (
                    <SermonGameListItem key={game._id} game={game} router={router} />
                  ))}
              </div>
              ) : (
                <Card className="border-dashed border-soft-purple/30 bg-soft-indigo/50 shadow-none">
                  <CardContent className="pt-6 text-center text-foreground/60">
                    <p>No sermon games found{searchTerm ? " matching your search" : ""}.</p>
                    {!searchTerm && (
                      <Button 
                        variant="default"
                        size="sm"
                        className="mt-4"
                        onClick={() => router.push(`/churches/manage/create-sermon?churchId=${selectedChurch?._id}`)}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Create First Game
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div 
              className="lg:col-span-1 sticky top-24"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {pageIsLoading ? (
                <Skeleton className="h-[400px] rounded-2xl bg-soft-indigo/80 w-full max-w-[280px]" /> 
              ) : (
                <div className="w-full max-w-[280px]"> 
                  <Leaderboard entries={leaderboardEntries} />
                </div>
              )}
            </motion.div>
          </div>
          
        </div>
            </div>
    </div>
  );
}

function StatsCard({ icon: Icon, title, value, subtitle, color = "soft-purple" }: {
  icon: React.ElementType;
  title: string;
  value: number | string;
  subtitle?: string;
  color?: "soft-purple" | "warm-peach" | "baby-blue" | "soft-mint";
}) {
  const colorClasses = {
    "soft-purple": "bg-soft-purple/10 text-soft-purple",
    "warm-peach": "bg-warm-peach/10 text-warm-peach",
    "baby-blue": "bg-baby-blue/10 text-baby-blue",
    "soft-mint": "bg-soft-mint/10 text-soft-mint",
  };
  
  return (
    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
      <Card className="border-none bg-soft-indigo shadow-playful hover:shadow-playful-hover transition-shadow duration-300">
        <CardContent className="p-3 flex items-center">
          <div className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center mr-3 flex-shrink-0`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-foreground/70 text-xs mb-0">{title}</p>
            <h3 className="text-lg font-bold font-fredoka text-foreground leading-tight">{value}</h3>
            {subtitle && <p className="text-foreground/50 text-[10px] mt-0">{subtitle}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ActionButton({ icon: Icon, children, onClick, variant = 'secondary', ...props }: {
  icon?: React.ElementType;
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'secondary';
  [key: string]: any;
}) {
  return (
    <Button 
      variant={variant}
      onClick={onClick}
      className="w-full justify-center gap-2 py-3 h-auto text-base font-medium shadow-playful hover:shadow-playful-hover transition-all duration-300 hover:scale-[1.03]"
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </Button>
  );
}

function SermonGameListItem({ game, router }: { 
  game: SermonGame; 
  router: ReturnType<typeof useRouter>;
}) {
  const getStatusStyles = (status: SermonGame['status']) => {
    switch (status) {
      case 'live': return { chip: "bg-soft-mint/20 text-soft-mint", icon: <Zap className="w-3 h-3" /> };
      case 'pending': return { chip: "bg-warm-peach/20 text-warm-peach", icon: <Calendar className="w-3 h-3" /> };
      case 'archived': return { chip: "bg-gray-500/20 text-gray-400", icon: <Library className="w-3 h-3" /> };
      default: return { chip: "bg-gray-500/20 text-gray-400", icon: <Library className="w-3 h-3" /> };
    }
  };

  const statusStyle = getStatusStyles(game.status);

  return (
    <Card 
      className="border-none bg-soft-indigo shadow-playful hover:shadow-playful-hover transition-all duration-300 group overflow-hidden cursor-pointer"
      onClick={() => router.push(`/churches/manage/sermon/${game._id}`)}
    >
      <div className="flex items-center justify-between p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-soft-purple/10 flex items-center justify-center flex-shrink-0 group-hover:bg-soft-purple/20 transition-colors duration-200">
            <Library className="h-6 w-6 text-soft-purple" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-lg truncate mb-1 group-hover:text-soft-purple transition-colors duration-200">{game.title}</h3>
            <p className="text-sm text-foreground/60 truncate">{game.description || `Created ${new Date(game.createdAt).toLocaleDateString()}`}</p>
            {game.mainVerses && game.mainVerses.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {game.mainVerses.map((verse, i) => (
                  <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-baby-blue/10 text-baby-blue text-xs font-medium">
                    <BookOpen className="w-3 h-3 mr-1" /> {verse}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.chip}`}>
            {statusStyle.icon}
            {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
          </span>
          <div className="text-right">
            <span className="block text-foreground font-bold text-base">
              {game.pointsAvailable} pts
            </span>
            <span className="text-foreground/60 text-xs">Available</span>
          </div>
          <ChevronRight className="w-5 h-5 text-foreground/40 group-hover:text-soft-purple group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>
    </Card>
  );
}