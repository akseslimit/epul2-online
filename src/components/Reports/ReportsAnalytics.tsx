import React, { useState, useEffect } from "react";
import { BarChart3, Download, Filter, Calendar, TrendingUp } from "lucide-react";

const ReportsAnalytics: React.FC = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedStore, setSelectedStore] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [summaryStats, setSummaryStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalProducts: 0,
    averageOrderValue: 0,
  });

  // 🧮 Fungsi Format Rupiah (PENTING)
  const formatRupiah = (value: number): string => {
    if (!value || isNaN(value)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setDateTo(today.toISOString().split("T")[0]);
    setDateFrom(thirtyDaysAgo.toISOString().split("T")[0]);

    fetchFilters();
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) fetchSalesData();
  }, [dateFrom, dateTo, selectedProduct, selectedStore]);

  // Ambil daftar produk dan toko
  const fetchFilters = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/reports/filters");
      const data = await res.json();
      setProducts(data.products || []);
      setStores(data.stores || []);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  // Ambil data penjualan
  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        from: dateFrom,
        to: dateTo,
        ...(selectedProduct ? { productId: selectedProduct } : {}),
        ...(selectedStore ? { storeId: selectedStore } : {}),
      });

      const res = await fetch(`http://localhost:3000/api/reports?${params.toString()}`);
      const data = await res.json();

      setSalesData(data || []);

      // Hitung ringkasan
      const totalSales = data.length;
      const totalRevenue = data.reduce((sum: number, s: any) => sum + Number(s.total_price), 0);
      const totalProducts = data.reduce((sum: number, s: any) => sum + Number(s.quantity), 0);
      const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      setSummaryStats({
        totalSales,
        totalRevenue,
        totalProducts,
        averageOrderValue,
      });
    } catch (error) {
      console.error("Error fetching sales data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export ke CSV
  const exportToCSV = () => {
    const headers = ["Date", "Product", "Salesman", "Store", "Quantity", "Total"];
    const csvData = salesData.map((sale: any) => [
      new Date(sale.transaction_date).toLocaleDateString(),
      sale.product_name,
      sale.salesman_name,
      sale.store_name,
      sale.quantity,
      sale.total_price,
    ]);
    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales_report_${dateFrom}_to_${dateTo}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Top produk
  const getTopProducts = () => {
    const productStats = salesData.reduce((acc: any, sale: any) => {
      const name = sale.product_name || "Unknown";
      if (!acc[name]) acc[name] = { quantity: 0, revenue: 0 };
      acc[name].quantity += Number(sale.quantity);
      acc[name].revenue += Number(sale.total_price);
      return acc;
    }, {});
    return Object.entries(productStats)
      .map(([name, stats]: [string, any]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  // Top store
  const getTopStores = () => {
    const storeStats = salesData.reduce((acc: any, sale: any) => {
      const name = sale.store_name || "Unknown";
      if (!acc[name]) acc[name] = { revenue: 0, count: 0 };
      acc[name].revenue += Number(sale.total_price);
      acc[name].count++;
      return acc;
    }, {});
    return Object.entries(storeStats)
      .map(([name, stats]: [string, any]) => ({ name, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports & Analytics</h1>
          <p className="text-gray-600">Comprehensive sales analysis and insights</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={salesData.length === 0}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Products</option>
              {products.map((product: any) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Stores</option>
              {stores.map((store: any) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard title="Total Sales" value={summaryStats.totalSales} icon={<BarChart3 />} color="blue" />
        <SummaryCard title="Total Revenue" value={formatRupiah(summaryStats.totalRevenue)} icon={<TrendingUp />} color="green" />
        <SummaryCard title="Products Sold" value={summaryStats.totalProducts} icon={<BarChart3 />} color="purple" />
        <SummaryCard title="Avg Order Value" value={formatRupiah(summaryStats.averageOrderValue)} icon={<Calendar />} color="orange" />
      </div>

      {/* Top Products & Stores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TopList title="Top Products" data={getTopProducts()} formatRupiah={formatRupiah} type="product" />
        <TopList title="Top Stores" data={getTopStores()} formatRupiah={formatRupiah} type="store" />
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salesman</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {salesData.slice(0, 10).map((sale: any) => (
                <tr key={sale.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(sale.transaction_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{sale.product_name}</div>
                    <div className="text-sm text-gray-500">{sale.sku}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.salesman_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.store_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.quantity} units</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatRupiah(Number(sale.total_price))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Subcomponent untuk ringkasan
const SummaryCard = ({ title, value, icon, color }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 bg-${color}-100 rounded-lg text-${color}-600`}>{icon}</div>
    </div>
  </div>
);

// Subcomponent untuk daftar Top
const TopList = ({ title, data, formatRupiah, type }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="space-y-4">
      {data.map((item: any, index: number) => (
        <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <div>
              <p className="font-medium text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-600">
                {type === "product"
                  ? `${item.quantity} units sold`
                  : `${item.count} transactions`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-green-600">{formatRupiah(item.revenue)}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ReportsAnalytics;
