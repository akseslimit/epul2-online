import React, { useState, useEffect } from "react";
import { Distribution } from "../../types";
import { Plus, Search, Truck as TruckIcon, CheckCircle, Clock } from "lucide-react";

const DistributionManagement: React.FC = () => {
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    product_id: "",
    from_store_id: "",
    to_store_id: "",
    quantity: "",
  });

  useEffect(() => {
    Promise.all([fetchDistributions(), fetchProducts(), fetchStores()]);
  }, []);

  const fetchDistributions = async () => {
    const res = await fetch("http://localhost:3000/distribution/api");
    const data = await res.json();
    setDistributions(data || []);
    setLoading(false);
  };

  const fetchProducts = async () => {
    const res = await fetch("http://localhost:3000/products");
    setProducts(await res.json());
  };

  const fetchStores = async () => {
    const res = await fetch("http://localhost:3000/stores");
    setStores(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await fetch("http://localhost:3000/distribution/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    await fetchDistributions();
    setShowModal(false);
    setFormData({ product_id: "", from_store_id: "", to_store_id: "", quantity: "" });
  };

  const handleCompleteDistribution = async (id: string) => {
    await fetch(`http://localhost:3000/distribution/api/${id}/complete`, { method: "PATCH" });
    await fetchDistributions();
  };

  const filtered = distributions.filter(
    (d) =>
      d.product?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.from_store?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.to_store?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Distribution Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" /> New Distribution
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
          />
        </div>
      </div>

      {/* Table */}
      <table className="w-full border rounded">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-2 text-left">Product</th>
            <th className="px-6 py-2 text-left">From → To</th>
            <th className="px-6 py-2">Status</th>
            <th className="px-6 py-2">Date</th>
            <th className="px-6 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="px-6 py-2">{d.product}</td>
              <td className="px-6 py-2">
                {d.from_store} → {d.to_store}
              </td>
              <td className="px-6 py-2">
                {d.status === "completed" ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" /> Completed
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> Pending
                  </span>
                )}
              </td>
              <td className="px-6 py-2">{new Date(d.distribution_date).toLocaleDateString()}</td>
              <td className="px-6 py-2">
                {d.status === "pending" && (
                  <button
                    onClick={() => handleCompleteDistribution(d.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Complete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Add */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-lg font-bold mb-4">New Distribution</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select
                required
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                required
                value={formData.from_store_id}
                onChange={(e) => setFormData({ ...formData, from_store_id: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="">From Store</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                required
                value={formData.to_store_id}
                onChange={(e) => setFormData({ ...formData, to_store_id: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="">To Store</option>
                {stores
                  .filter((s) => s.id !== formData.from_store_id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Quantity"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1 bg-purple-600 text-white rounded">
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

export default DistributionManagement;
