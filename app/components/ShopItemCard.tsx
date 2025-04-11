import React from 'react';
import Image from 'next/image';

interface ShopItemProps {
  id: number;
  name: string;
  type: 'product' | 'service' | 'donation';
  price?: number;
  image?: string;
  description?: string;
  stock?: number;
  donor?: string;
  verified?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

const ShopItemCard: React.FC<ShopItemProps> = ({
  id,
  name,
  type,
  price,
  image,
  description,
  stock,
  donor,
  verified = false,
  onEdit,
  onDelete
}) => {
  const typeColor = {
    product: 'bg-blue-100 text-blue-800',
    service: 'bg-purple-100 text-purple-800',
    donation: 'bg-green-100 text-green-800'
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="relative">
        {image ? (
          <div className="h-40 w-full relative">
            <Image 
              src={image} 
              alt={name}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="h-40 w-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm font-medium">No Image</span>
          </div>
        )}
        <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full ${typeColor[type]}`}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
        {type === 'donation' && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs ${verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {verified ? 'Verified' : 'Pending'}
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-800 truncate">{name}</h3>
          {price !== undefined && (
            <span className="font-semibold text-indigo-600">${price.toFixed(2)}</span>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        )}
        
        <div className="flex justify-between items-center text-sm">
          <div>
            {type === 'product' && stock !== undefined && (
              <span className={`font-medium ${stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stock > 0 ? `In stock (${stock})` : 'Out of stock'}
              </span>
            )}
            
            {type === 'donation' && donor && (
              <span className="text-gray-600">
                From: {donor}
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            {onEdit && (
              <button 
                onClick={() => onEdit(id)}
                className="text-indigo-600 hover:text-indigo-900"
              >
                Edit
              </button>
            )}
            
            {onDelete && (
              <button 
                onClick={() => onDelete(id)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopItemCard; 