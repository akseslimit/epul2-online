import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { Plus, Edit, Trash2, Search, Package } from 'lucide-react';

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    discount: '',
    image: null as File | null,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:3000/products");
      const data = await res.json();
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();
      form.append("name", formData.name);
      form.append("sku", formData.sku);
      form.append("price", formData.price);
      form.append("discount", formData.discount || "0");
      if (formData.image) {
        form.append("image", formData.image);
      }

      if (editingProduct) {
        const res = await fetch(`http://localhost:3000/products/${editingProduct.id}`, {
          method: "PUT",
          body: form,
        });
        if (!res.ok) throw new Error("Failed to update product");
      } else {
        const res = await fetch("http://localhost:3000/products", {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error("Failed to create product");
      }

      await fetchProducts();
      setShowModal(false);
      setEditingProduct(null);
      setFormData({ name: '', sku: '', price: '', discount: '', image: null });
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      discount: product.discount?.toString() || "0",
      image: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`http://localhost:3000/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      await fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Error deleting product");
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && products.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
          <p className="text-gray-600">Manage perfume products and inventory</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:bg-gray-100 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              {product.image_url ? (
                <img
                  src={`http://localhost:3000${product.image_url}`}
                  alt={product.name}
                  className="h-16 w-16 object-cover rounded-lg cursor-pointer"
                  onClick={() => setPreviewImage(`http://localhost:3000${product.image_url}`)}
                />
              ) : (
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Package className="h-6 w-6 text-purple-600" />
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="text-purple-600 hover:text-purple-900 p-1"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="text-red-600 hover:text-red-900 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
            <div className="space-y-1">
              <p className="text-sm text-gray-600">SKU: <span className="font-medium">{product.sku}</span></p>
              <p className="text-sm text-gray-600">Price: <span className="font-medium text-green-600">Rp {Number(product.price).toLocaleString()}</span></p>
              <p className="text-sm text-gray-600">Discount: <span className="font-medium text-red-600">{product.discount || 0}%</span></p>
              <p className="text-xs text-gray-500">Created: {new Date(product.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* No Products */}
      {filteredProducts.length === 0 && !loading && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'No products match your search criteria.' : 'Get started by adding your first product.'}
          </p>
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product Name"
                required
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU"
                required
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Price"
                required
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="number"
                value={formData.discount}
                onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                placeholder="Discount %"
                className="w-full px-3 py-2 border rounded-lg"
              />

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })}
                className="w-full"
              />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    setFormData({ name: '', sku: '', price: '', discount: '', image: null });
                  }}
                  className="px-4 py-2 text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg"
                >
                  {loading ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Image Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] flex flex-col">
            <img
              src={previewImage}
              alt="Preview"
              className="object-contain max-h-[80vh] rounded-lg"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg self-center"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
