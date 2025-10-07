import React, { useState, useEffect } from "react";
import { Stock } from "../../types";
import { Package, Search, Plus, CreditCard as Edit } from "lucide-react";

const StockManagement: React.FC = () => {
  const [stockItems, setStockItems] = useState<Stock[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    product_id: "",
    store_id: "",
    quantity: "",
  });

  useEffect(() => {
    Promise.all([fetchStockItems(), fetchProducts(), fetchStores()]);
  }, []);

  // ====== FETCH STOCK dari Express API ======
  const fetchStockItems = async () => {
    try {
      const res = await fetch("http://localhost:3000/stock");
      const data = await res.json();
      console.log("✅ Stock API response:", data);

      if (Array.isArray(data)) {
        setStockItems(data);
      } else {
        setStockItems([]); // fallback
      }
    } catch (error) {
      console.error("❌ Error fetching stock items:", error);
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ====== FETCH PRODUCTS ======
  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/products");
      const data = await res.json();
      console.log("✅ Products API response:", data);

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("❌ Error fetching products:", error);
      setProducts([]);
    }
  };

  // ====== FETCH STORES ======
  const fetchStores = async () => {
    try {
      const res = await fetch("http://localhost:3000/stores");
      const data = await res.json();
      console.log("✅ Stores API response:", data);

      if (Array.isArray(data)) {
        setStores(data);
      } else {
        setStores([]);
      }
    } catch (error) {
      console.error("❌ Error fetching stores:", error);
      setStores([]);
    }
  };

  // ====== SUBMIT FORM ======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const stockData = {
        product_id: formData.product_id,
        store_id: formData.store_id,
        quantity: parseInt(formData.quantity),
      };

      if (editingStock) {
        // Update
        await fetch(`http://localhost:3000/stock/${editingStock.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stockData),
        });
      } else {
        // Insert
        await fetch("http://localhost:3000/stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stockData),
        });
      }

      await fetchStockItems();
      setShowModal(false);
      setEditingStock(null);
      setFormData({ product_id: "", store_id: "", quantity: "" });
    } catch (error) {
      console.error("❌ Error saving stock:", error);
      alert("Error saving stock");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (stock: Stock) => {
    setEditingStock(stock);
    setFormData({
      product_id: stock.product_id,
      store_id: stock.store_id,
      quantity: stock.quantity.toString(),
    });
    setShowModal(true);
  };

  // ====== SEARCH FILTER (aman null) ======
  const filteredStockItems = stockItems.filter((item) =>
    (item.product_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||
    (item.store_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ====== LOADING SPINNER ======
  if (loading && stockItems.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-800">Stock Management</h1>
          <p className="text-gray-600">Monitor and manage inventory</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Stock</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by product or store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Quantity</th>
              <th className="px-6 py-3 text-right text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredStockItems.map((stock) => (
              <tr key={stock.id}>
                <td className="px-6 py-4">{stock.product_name}</td>
                <td className="px-6 py-4">{stock.store_name}</td>
                <td className="px-6 py-4">{stock.quantity}</td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleEdit(stock)}
                    className="text-purple-600 p-1"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit Stock */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingStock ? "Update Stock" : "Add Stock"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) =>
                    setFormData({ ...formData, product_id: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Store</label>
                <select
                  value={formData.store_id}
                  onChange={(e) =>
                    setFormData({ ...formData, store_id: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Store</option>
                  {stores.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  {editingStock ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
