import React from 'react';
import Image from 'next/image';

interface TeamMemberCardProps {
  id: number;
  name: string;
  role: string;
  avatar?: string;
  email?: string;
  phone?: string;
  onEdit?: (id: number) => void;
  onRemove?: (id: number) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  id,
  name,
  role,
  avatar,
  email,
  phone,
  onEdit,
  onRemove,
}) => {
  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center mb-4">
        <div className="mr-4">
          {avatar ? (
            <Image
              src={avatar}
              alt={`${name}'s avatar`}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-semibold text-lg">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-gray-800">{name}</h3>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
      </div>
      
      {(email || phone) && (
        <div className="mb-4 text-sm">
          {email && (
            <p className="text-gray-600 truncate">
              {email}
            </p>
          )}
          {phone && (
            <p className="text-gray-600">
              {phone}
            </p>
          )}
        </div>
      )}
      
      <div className="flex justify-end">
        {onEdit && (
          <button 
            onClick={() => onEdit(id)} 
            className="text-indigo-600 hover:text-indigo-900 text-sm mr-3"
          >
            Edit
          </button>
        )}
        {onRemove && (
          <button 
            onClick={() => onRemove(id)} 
            className="text-red-600 hover:text-red-900 text-sm"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default TeamMemberCard; 