import React, { useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import InfluencerProfile from './influencerPage';
import Header from './header';

const InfluencerLeaderboard = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('Highest First');
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);

  const categories = ['All', 'Nutrition', 'Fitness', 'Medicine', 'Mental Health'];
  
  const influencers = [
    {
      id: 1,
      name: 'Dr. Peter Attia',
      category: 'Medicine',
      trustScore: 94,
      trending: true,
      followers: '1.2M+',
      claims: 203,
      avatar: '/api/placeholder/40/40',
      bio: 'Leading expert in longevity medicine and performance optimization.',
      expertise: ['Longevity', 'Performance', 'Nutrition', 'Exercise Science'],
      yearlyRevenue: '$4.8M',
      products: 3
    },
    {
      id: 4,
      name: 'Andrew Huberman',
      category: 'Neuroscience',
      trustScore: 89,
      trending: true,
      followers: '4.2M+',
      claims: 127,
      avatar: '/api/placeholder/40/40',
      bio: 'Stanford Professor of Neurobiology and Ophthalmology, focusing on neural development, brain plasticity, and neural regeneration.',
      expertise: ['Sleep', 'Performance', 'Hormones', 'Stress Management', 'Exercise Science', 'Light Exposure', 'Circadian Biology'],
      yearlyRevenue: '$5.0M',
      products: 1
    },
    // ... other influencers
  ];

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
          <div className="text-2xl font-bold text-emerald-400">1,234</div>
          <div className="text-gray-400">Active Influencers</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-400">25,431</div>
          <div className="text-gray-400">Claims Verified</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-emerald-400">85.7%</div>
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