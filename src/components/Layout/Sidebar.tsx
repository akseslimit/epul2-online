import React from 'react';
import { Home, Users, Package, Warehouse, ShoppingCart, Truck as TruckIcon, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, signOut } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'sales', 'outlet', 'gudang'] },
    { id: 'users', label: 'User Management', icon: Users, roles: ['admin'] },
    { id: 'products', label: 'Products', icon: Package, roles: ['admin', 'gudang'] },
    { id: 'stock', label: 'Stock Management', icon: Warehouse, roles: ['admin', 'gudang', 'outlet'] },
    { id: 'sales', label: 'Sales Transactions', icon: ShoppingCart, roles: ['admin', 'sales', 'outlet'] },
    { id: 'distribution', label: 'Distribution', icon: TruckIcon, roles: ['admin', 'gudang'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Belgian Parfum" className="h-10 w-10 rounded-full" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Belgian Parfum</h1>
            <p className="text-sm text-gray-600">Consignment System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-800">{user?.name}</p>
          <p className="text-xs text-gray-600 capitalize">{user?.role} - {user?.area}</p>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;