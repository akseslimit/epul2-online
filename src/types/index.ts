export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'sales' | 'outlet' | 'gudang';
  area: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  created_at: string;
}

export interface Store {
  id: string;
  name: string;
  area: string;
  created_at: string;
}

export interface Stock {
  id: string;
  product_id: string;
  store_id: string;
  quantity: number;
  product?: Product;
  store?: Store;
}

export interface SalesTransaction {
  id: string;
  product_id: string;
  salesman_id: string;
  store_id: string;
  quantity: number;
  total_price: number;
  transaction_date: string;
  product?: Product;
  salesman?: User;
  store?: Store;
}

export interface Distribution {
  id: string;
  product_id: string;
  from_store_id: string;
  to_store_id: string;
  quantity: number;
  distribution_date: string;
  status: 'pending' | 'completed';
  product?: Product;
  from_store?: Store;
  to_store?: Store;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  area: string;
}