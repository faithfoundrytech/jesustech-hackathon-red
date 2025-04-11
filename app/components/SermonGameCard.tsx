import React from 'react';
import Link from 'next/link';

interface SermonGameCardProps {
  id: number;
  title: string;
  players: number;
  avgScore: number;
  createdAt: string;
}

const SermonGameCard: React.FC<SermonGameCardProps> = ({
  id,
  title,
  players,
  avgScore,
  createdAt,
}) => {
  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center">
            <p className="text-xs uppercase text-gray-500">Players</p>
            <p className="font-semibold text-indigo-600">{players}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase text-gray-500">Avg Score</p>
            <p className="font-semibold text-green-600">{avgScore}</p>
          </div>
          <div className="text-center">
            <p className="text-xs uppercase text-gray-500">Created</p>
            <p className="font-semibold text-gray-700">{createdAt}</p>
          </div>
        </div>
        
        <div className="flex justify-between">
          <Link href={`/dashboard/sermon-games/${id}`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View Details
          </Link>
          <div className="space-x-2">
            <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Edit
            </button>
            <button className="text-red-600 hover:text-red-800 text-sm font-medium">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SermonGameCard; 