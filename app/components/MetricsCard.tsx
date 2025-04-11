import React from 'react';

interface MetricsCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
  subtitle?: string;
  percentage?: number;
  isPositive?: boolean;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  icon,
  color = 'indigo',
  subtitle,
  percentage,
  isPositive,
}) => {
  const colorClasses = {
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  };
  
  const textColor = colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        {icon && <div className={`${textColor}`}>{icon}</div>}
      </div>
      <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      
      {(subtitle || percentage !== undefined) && (
        <div className="mt-4 flex items-center text-sm">
          {percentage !== undefined && (
            <span 
              className={`mr-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}
            >
              {isPositive ? '+' : '-'}{percentage}%
            </span>
          )}
          {subtitle && <span className="text-gray-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};

export default MetricsCard; 