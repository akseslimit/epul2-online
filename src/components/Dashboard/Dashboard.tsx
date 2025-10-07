import React, { useState, useEffect } from "react";
import DashboardCards from "./DashboardCards";
import { BarChart3, Package, Users, TrendingUp } from "lucide-react";

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStores: 0,
    totalSales: 0,
    totalStock: 0,
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/dashboard");
      const data = await res.json();

      setStats({
        totalProducts: data.totalProducts || 0,
        totalStores: data.totalStores || 0,
        totalSales: data.salesToday || 0,
        totalStock: data.totalStock || 0,
      });

      setRecentSales(data.recentSales || []);
    } catch (error) {
      console.error("❌ Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to Belgian Parfum Consignment Management System
        </p>
      </div>

      {/* Dashboard summary cards */}
      <DashboardCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Recent Sales</h2>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentSales.length > 0 ? (
              recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {sale.product_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sale.salesman_name} - {sale.store_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      Rp {Number(sale.total_price).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {sale.quantity} pcs
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">No recent sales</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <button className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-3 rounded-lg text-left transition-colors">
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5" />
                <span>Add New Product</span>
              </div>
            </button>
            <button className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-3 rounded-lg text-left transition-colors">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5" />
                <span>Record Sale</span>
              </div>
            </button>
            <button className="w-full bg-green-100 hover:bg-green-200 text-green-700 px-4 py-3 rounded-lg text-left transition-colors">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5" />
                <span>View Reports</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
