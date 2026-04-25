import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout, RootErrorBoundary } from './layouts/RootLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Landing } from './pages/Landing';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
import { Dashboard } from './pages/Dashboard';
import { Scanner } from './pages/Scanner';
import { ReportFraud } from './pages/ReportFraud';
import { WatchWallets } from './pages/WatchWallets';
import { CompareWallets } from './pages/CompareWallets';
import { Profile } from './pages/Profile';
import { Docs } from './pages/Docs';
import Metrics from './pages/Metrics';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RootErrorBoundary,
    children: [
      {
        index: true,
        Component: Landing,
      },
      {
        path: 'auth',
        Component: AuthLayout,
        children: [
          {
            path: 'signup',
            Component: SignUp,
          },
          {
            path: 'signin',
            Component: SignIn,
          },
        ],
      },
      {
        path: 'app',
        Component: DashboardLayout,
        children: [
          {
            index: true,
            Component: Dashboard,
          },
          {
            path: 'scanner',
            Component: Scanner,
          },
          {
            path: 'report',
            Component: ReportFraud,
          },
          {
            path: 'watch',
            Component: WatchWallets,
          },
          {
            path: 'compare',
            Component: CompareWallets,
          },
          {
            path: 'profile',
            Component: Profile,
          },
          {
            path: 'docs',
            Component: Docs,
          },
          {
            path: 'metrics',
            Component: Metrics,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
