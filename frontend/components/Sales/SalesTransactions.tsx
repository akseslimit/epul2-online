import React, { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";

// Type sesuai JSON dari backend Express
export interface SalesTransaction {
  id: string;
  product_name: string;
  salesman_name: string;
  store_name: string;
  quantity: number;
  total_price: number;
  transaction_date: string;
}

const SalesTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    product_id: "",
    salesman_id: "",
    store_id: "",
    quantity: "",
  });

  // ===== FETCH DATA DARI BACKEND =====
  useEffect(() => {
    fetchTransactions();
    fetchProducts();
    fetchStores();
    fetchUsers();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:3000/sales/api");
      const data = await res.json();
      console.log("Fetched transactions:", data);
      setTransactions(data || []);
    } catch (err) {
      console.error("Error fetching sales:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:3000/products");
    const data = await res.json();
    setProducts(data || []);
  };

  const fetchStores = async () => {
    const res = await fetch("http://localhost:3000/stores");
    const data = await res.json();
    setStores(data || []);
  };

  const fetchUsers = async () => {
    const res = await fetch("http://localhost:3000/users");
    const data = await res.json();
    setUsers(data || []);
  };

  // ====== SUBMIT FORM ======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const transactionData = {
        product_id: formData.product_id,
        salesman_id: formData.salesman_id,
        store_id: formData.store_id,
        quantity: parseInt(formData.quantity),
      };

      await fetch("http://localhost:3000/sales/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData),
      });

      await fetchTransactions();
      setShowModal(false);
      setFormData({ product_id: "", salesman_id: "", store_id: "", quantity: "" });
    } catch (err) {
      console.error("Error saving transaction:", err);
      alert("Error saving transaction");
    } finally {
      setLoading(false);
    }
  };

  // ====== FILTERING ======
  const filteredTransactions = transactions.filter(
    (t) =>
      t.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.salesman_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.store_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales Transactions</h1>
          <p className="text-gray-600">Manage and track all sales</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Salesman</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Total Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredTransactions.map((t) => (
              <tr key={t.id}>
                <td className="px-6 py-4">{t.product_name}</td>
                <td className="px-6 py-4">{t.salesman_name}</td>
                <td className="px-6 py-4">{t.store_name}</td>
                <td className="px-6 py-4">{t.quantity}</td>
                <td className="px-6 py-4">Rp {Number(t.total_price).toLocaleString("id-ID")}</td>
                <td className="px-6 py-4">
                  {new Date(t.transaction_date).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Sales</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label>Product</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Product</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Salesman</label>
                <select
                  value={formData.salesman_id}
                  onChange={(e) => setFormData({ ...formData, salesman_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Salesman</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Store</label>
                <select
                  value={formData.store_id}
                  onChange={(e) => setFormData({ ...formData, store_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Store</option>
                  {stores.map((s: any) => (
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
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesTransactions;
