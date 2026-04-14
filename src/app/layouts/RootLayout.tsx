import { Outlet } from 'react-router';
import { AuthProvider } from '../../contexts/AuthContext';

export function RootLayout() {
  return (
    <AuthProvider>
      <div className="size-full">
        <Outlet />
      </div>
    </AuthProvider>
  );
}
