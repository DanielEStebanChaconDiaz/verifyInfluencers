import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import InfluencerProfile from './influencerPage';
import Header from './header';
import axios from 'axios';

const InfluencerLeaderboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('Highest First');
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [influencers, setInfluencers] = useState([]);
  
  const categories = ['All', 'Nutrition', 'Fitness', 'Medicine', 'Mental Health'];

  // Fetch influencers data on component mount
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users/hola');
        setInfluencers(response.data);
      } catch (error) {
        console.error("Error fetching influencers:", error.message);
      }
    };

    fetchInfluencers();
  }, []);

  // Calculate statistics from loaded influencers
  const stats = {
    activeInfluencers: influencers.length,
    totalClaims: influencers.reduce((sum, inf) => sum + (inf.claims || 0), 0),
    averageTrustScore: influencers.length > 0 
      ? (influencers.reduce((sum, inf) => sum + (inf.trustScore || 0), 0) / influencers.length).toFixed(1)
      : 0
  };

  if (selectedInfluencer) {
    return (
      <div>
        <InfluencerProfile influencer={selectedInfluencer} />
      </div>
    );
  }

  const filteredInfluencers = selectedCategory === 'All' 
    ? influencers 
    : influencers.filter(inf => inf.category === selectedCategory);

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-6">
      <Header />
      <h1 className="text-2xl font-bold mb-2">Influencer Trust Leaderboard</h1>
      <p className="text-gray-400 mb-8">
        Real-time rankings of health influencers based on scientific accuracy, credibility, and transparency.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-400">{stats.activeInfluencers}</div>
          <div className="text-gray-400">Active Influencers</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-400">{stats.totalClaims}</div>
          <div className="text-gray-400">Claims Verified</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-400">{stats.averageTrustScore}%</div>
          <div className="text-gray-400">Average Trust Score</div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === category 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-800 text-gray-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortOrder(prev => prev === 'Highest First' ? 'Lowest First' : 'Highest First')}
          className="flex items-center gap-2 text-gray-400"
        >
          ↕ {sortOrder}
        </button>
      </div>

      <div className="bg-gray-800/50 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-400">
              <th className="p-4">RANK</th>
              <th className="p-4">INFLUENCER</th>
              <th className="p-4">CATEGORY</th>
              <th className="p-4">TRUST SCORE</th>
              <th className="p-4">TREND</th>
              <th className="p-4">FOLLOWERS</th>
              <th className="p-4">VERIFIED CLAIMS</th>
            </tr>
          </thead>
          <tbody>
            {filteredInfluencers.map((inf, index) => (
              <tr 
                key={inf.id} 
                className="border-t border-gray-700 cursor-pointer hover:bg-gray-800"
                onClick={() => setSelectedInfluencer(inf)}
              >
                <td className="p-4">#{index + 1}</td>
                <td className="p-4 flex items-center gap-3">
                  <img src={inf.avatar} alt="" className="w-10 h-10 rounded-full"/>
                  {inf.name}
                </td>
                <td className="p-4">{inf.category}</td>
                <td className="p-4 text-emerald-400">{inf.trustScore}%</td>
                <td className="p-4">
                  {inf.trending ? (
                    <TrendingUp className="text-emerald-400" size={20} />
                  ) : (
                    <TrendingDown className="text-red-400" size={20} />
                  )}
                </td>
                <td className="p-4">{inf.followers}</td>
                <td className="p-4">{inf.claims}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InfluencerLeaderboard;