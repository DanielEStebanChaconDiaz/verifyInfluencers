import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const TwitterFeed = ({ username }) => {
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTweets = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/${username}`);
        if (!response.ok) throw new Error('Failed to fetch tweets');
        const data = await response.json();
        setTweets(data.tweets);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchTweets();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 text-red-400 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle size={20} />
        <span>Failed to load tweets: {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tweets.map(tweet => (
        <div key={tweet.id} className="bg-gray-800/50 p-4 rounded-lg">
          <div className="text-gray-400 text-sm mb-2">
            {new Date(tweet.created_at).toLocaleDateString()}
          </div>
          <p className="text-white">{tweet.text}</p>
        </div>
      ))}
    </div>
  );
};

export default TwitterFeed;