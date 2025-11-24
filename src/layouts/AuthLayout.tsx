import { Outlet } from 'react-router-dom';

export default function AuthLayout(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}

