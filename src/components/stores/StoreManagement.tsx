import React, { useEffect, useState } from "react";

interface Store {
  id: number;
  name: string;
  location: string;
  created_at: string;
}

const StoreManagement: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    fetch("http://localhost:3000/stores")
      .then((res) => res.json())
      .then((data) => setStores(data))
      .catch((err) => console.error("Error fetching stores:", err));
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Store Management</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Nama</th>
            <th className="p-2">Lokasi</th>
            <th className="p-2">Dibuat</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((s) => (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.location}</td>
              <td className="p-2">{new Date(s.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StoreManagement;
