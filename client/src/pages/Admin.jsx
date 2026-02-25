import React from 'react';
import Login from '../components/Login';
import ConfigPanel from '../components/ConfigPanel';
import { useAuth } from '../hooks/useAuth';

export default function Admin() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <Login />
      </div>
    );
  }

  return <ConfigPanel />;
}
