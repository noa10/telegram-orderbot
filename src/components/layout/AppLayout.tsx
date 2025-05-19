import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8 pb-20 md:pb-8">
        <Outlet />
      </main>
      {/* Consider adding a Footer component here later */}
    </div>
  );
};

export default AppLayout; 