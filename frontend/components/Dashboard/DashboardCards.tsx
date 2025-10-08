import React from 'react';
import { Package, Users, TrendingUp, Warehouse } from 'lucide-react';

interface DashboardCardsProps {
  stats: {
    totalProducts: number;
    totalStores: number;
    totalSales: number;
    totalStock: number;
  };
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-50',
    },
    {
      title: 'Total Stores',
      value: stats.totalStores,
      icon: Warehouse,
      color: 'bg-green-500',
      lightColor: 'bg-green-50',
    },
    {
      title: 'Sales Today',
      value: stats.totalSales,
      icon: TrendingUp,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-50',
    },
    {
      title: 'Total Stock',
      value: stats.totalStock,
      icon: Users,
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">{card.title}</p>
                <p className="text-3xl font-bold text-gray-800">{card.value.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.lightColor}`}>
                <IconComponent className={`h-6 w-6 text-white`} style={{color: card.color.replace('bg-', '').replace('-500', '')}} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;