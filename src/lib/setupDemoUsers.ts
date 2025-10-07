import { supabase } from './supabase';

export const createDemoUsers = async () => {
  const demoUsers = [
    { email: 'admin@example.com', password: '123456', name: 'Admin User', role: 'admin', area: 'Jakarta' },
    { email: 'sales@example.com', password: '123456', name: 'Sales User', role: 'sales', area: 'Jakarta' },
    { email: 'outlet@example.com', password: '123456', name: 'Outlet User', role: 'outlet', area: 'Jakarta' },
    { email: 'gudang@example.com', password: '123456', name: 'Warehouse User', role: 'gudang', area: 'Jakarta' },
  ];

  const results = [];
  
  for (const user of demoUsers) {
    try {
      // Try to sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
            role: user.role,
            area: user.area
          }
        }
      });

      if (error && error.message !== 'User already registered') {
        console.error(`Error creating user ${user.email}:`, error);
        results.push({ email: user.email, success: false, error: error.message });
      } else {
        console.log(`User ${user.email} created or already exists`);
        results.push({ email: user.email, success: true });
        
        // If user was created successfully, add to users table
        if (data.user && !error) {
          await supabase.from('users').insert({
            id: data.user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            area: user.area
          });
        }
      }
    } catch (err) {
      console.error(`Unexpected error creating user ${user.email}:`, err);
      results.push({ email: user.email, success: false, error: 'Unexpected error' });
    }
  }

  return results;
};