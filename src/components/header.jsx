import React from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center mb-8">
      <div className="text-emerald-400 text-xl font-semibold">VerifyInfluencers</div>
      <div className="flex gap-6">
        <a href="#/leaderboard" className="text-gray-300 hover:text-white">Leaderboard</a>
        <a href="#/products" className="text-gray-300 hover:text-white">Products</a>
        <a href="#/monetization" className="text-gray-300 hover:text-white">Monetization</a>
        <a href="#/about" className="text-gray-300 hover:text-white">About</a>
        <a href="#/contact" className="text-gray-300 hover:text-white">Contact</a>
        <a href="#/admin" className="text-gray-300 hover:text-white">Admin</a>
        <button onClick={handleSignOut} className="text-gray-300 hover:text-white">Sign Out</button>
      </div>
    </nav>
  );
};

export default Header;