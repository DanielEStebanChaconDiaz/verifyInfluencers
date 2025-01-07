import React, { useState, useEffect } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import Header from './header';
import axios from 'axios';

const InfluencerProfile = ({ influencer }) => {
  const [activeTab, setActiveTab] = useState('Claims Analysis');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [verificationStatus, setVerificationStatus] = useState('All Statuses');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Date');
  const [tweets, setTweets] = useState([])

  const categories = ['All Categories', 'Sleep', 'Performance', 'Hormones', 'Nutrition', 'Exercise', 'Stress', 'Cognition', 'Motivation', 'Recovery', 'Mental Health'];
  const statuses = ['All Statuses', 'Verified', 'Questionable', 'Debunked'];

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        const response = await axios.get(`https://verify-influencers-28rr-btcud4qop.vercel.app/users/${influencer.id}`);  // Ajusta el endpoint según sea necesario
        console.log(response.data)
        setTweets(response.data.tweets);  // Suponiendo que la API devuelve la lista completa de influencers
      } catch (error) {
        console.error("Error fetching influencers:", error.message);
      }
    };

    fetchTweets();
  }, [influencer.username]);
  console.log(tweets)

  const claims = [
    {
      id: 1,
      status: 'verified',
      date: '14/01/2024',
      claim: 'Viewing sunlight within 30-60 minutes of waking enhances cortisol release',
      trustScore: 92,
      analysis: 'Multiple studies confirm morning light exposure affects cortisol rhythms. Timing window supported by research.'
    },
    {
      id: 2,
      status: 'verified',
      date: '08/12/2023',
      claim: 'Non-sleep deep rest (NSDR) protocols can accelerate learning and recovery',
      trustScore: 88,
      analysis: 'Research supports the effectiveness of structured rest periods.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white">
      <Header />
      <div className="flex items-start gap-6 mb-8">
        <img src={influencer.avatar} alt={influencer.name} className="rounded-full w-24 h-24" />
        <div>
          <h1 className="text-2xl font-bold mb-2">{influencer.name}</h1>
          <div className="flex gap-2 flex-wrap mb-3">
            {influencer.expertise.map(tag => (
              <span key={tag} className="bg-gray-800 px-3 py-1 rounded-full text-sm">{tag}</span>
            ))}
          </div>
          <p className="text-gray-400">{influencer.bio}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400">Trust Score</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{influencer.trustScore}%</div>
          <div className="text-sm text-gray-400">Based on {influencer.claims} verified claims</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Yearly Revenue</div>
          <div className="text-2xl font-bold text-emerald-400">{influencer.yearlyRevenue}</div>
          <div className="text-sm text-gray-400">Estimated earnings</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Products</div>
          <div className="text-2xl font-bold text-emerald-400">{influencer.products}</div>
          <div className="text-sm text-gray-400">Recommended products</div>
        </div>
        <div className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-gray-400 mb-1">Followers</div>
          <div className="text-2xl font-bold text-emerald-400">{influencer.followers}</div>
          <div className="text-sm text-gray-400">Total following</div>
        </div>
      </div>

      <div className="flex gap-6 border-b border-gray-800 mb-6">
        {['Claims Analysis', 'Recommended Products', 'Monetization'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 ${activeTab === tab ? 'text-emerald-400 border-b-2 border-emerald-400' : 'text-gray-400'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search claims..."
            className="w-full bg-gray-900 rounded-lg pl-10 pr-4 py-2 text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <h3 className="mb-3">Categories</h3>
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setVerificationStatus(status)}
                className={`px-3 py-1 rounded-full text-sm ${verificationStatus === status ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 rounded px-3 py-1 text-white"
          >
            <option>Date</option>
            <option>Trust Score</option>
          </select>
        </div>

        <div className="space-y-6">
          {tweets.map(claim => (
            <div key={claim.id} className="border-b border-gray-700 pb-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {claim.verified && (
                    <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-sm">
                      Verified
                    </span>
                  )}
                  <span className="text-gray-400">{claim.created_at}</span>
                </div>
                <div className="text-emerald-400">{claim.trustScore}%</div>
              </div>
              <h3 className="font-medium mb-2">{claim.claim}</h3>
              <div className="bg-gray-900/50 p-4 rounded">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-400">i</span>
                  AI Analysis
                </div>
                <p className="text-gray-400">{claim.text}</p>
                <button className="text-emerald-400 text-sm mt-2">View Research ↗</button>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default InfluencerProfile;