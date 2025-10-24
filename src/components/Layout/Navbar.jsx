
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '/images/logoo.png';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-emerald-800' : 'hover:bg-emerald-600';
  };

  return (
    <nav className="bg-emerald-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
             <img src={logo} alt="EcoTrack Logo" className="w-10 h-10 md:w-12 md:h-12 z-10 opacity-100 block"  /* 40px on mobile, 48px on desktop */
/>
           {/*  <i data-feather="leaf" className="h-6 w-6 mr-2 text-emerald-300"></i> */}
            <span className="text-xl font-bold">EcoTrack</span>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>
                Dashboard
              </Link>
              <Link to="/transport" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/transport')}`}>
                Transport
              </Link>
              <Link to="/food" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/food')}`}>
                Food
              </Link>
              <Link to="/energy" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/energy')}`}>
                Energy
              </Link>
              <Link to="/insights" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/insights')}`}>
                Insights
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button className="p-1 rounded-full text-emerald-200 hover:text-white focus:outline-none">
              <i data-feather="user"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;