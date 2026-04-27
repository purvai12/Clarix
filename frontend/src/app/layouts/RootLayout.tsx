import { Outlet, useRouteError, isRouteErrorResponse } from 'react-router';
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

export function RootErrorBoundary() {
  const error = useRouteError();
  

  if (error) {
    Exception(error);
  }

  if (isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-4xl font-bold">{error.status} {error.statusText}</h1>
        <p className="text-muted-foreground">{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold">Unknown Error</h1>
    </div>
  );
}
