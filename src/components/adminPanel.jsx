import React, { useState } from 'react';
import Header from './header';
import axios from 'axios';
const ResearchDashboard = () => {
    const [selectedTimeRange, setSelectedTimeRange] = useState('lastMonth');
    const [includeRevenue, setIncludeRevenue] = useState(false);
    const [verifyJournals, setVerifyJournals] = useState(false);
    const [influencerName, setInfluencerName] = useState('');
    const [claimsCount, setClaimsCount] = useState(50);
    const [productsCount, setProductsCount] = useState(10);
    const [notes, setNotes] = useState('');
    const [analysisResults, setAnalysisResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [selectedJournals, setSelectedJournals] = useState(new Set([
        'PubMed Central', 'Nature', 'Science', 'Cell',
        'The Lancet', 'New England Journal of Medicine', 'JAMA Network'
    ]));

    const handleSelectAllJournals = () => {
        setSelectedJournals(new Set([
            'PubMed Central', 'Nature', 'Science', 'Cell',
            'The Lancet', 'New England Journal of Medicine', 'JAMA Network'
        ]));
    };

    const handleDeselectAllJournals = () => {
        setSelectedJournals(new Set());
    };

    const toggleJournal = (journal) => {
        const newSelected = new Set(selectedJournals);
        if (newSelected.has(journal)) {
            newSelected.delete(journal);
        } else {
            newSelected.add(journal);
        }
        setSelectedJournals(newSelected);
    };

    const handleStartResearch = async () => {
        setIsAnalyzing(true);
        try {
            const response = await axios.post('http://localhost:3000/api/analyze/twitter', {
                influencerName,
                selectedTimeRange,
                claimsCount,
                productsCount,
                includeRevenue,
                verifyJournals,
                selectedJournals: Array.from(selectedJournals),
                notes
            });
            
            setAnalysisResults(response.data);
        } catch (error) {
            console.error('Error in research:', error);
            // You could add a toast notification here
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    // Add this component to display the results
    const AnalysisResults = ({ results, onClose }) => {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 overflow-auto">
                <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Analysis Results</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            ✕
                        </button>
                    </div>
    
                    {/* Profile Information */}
                    <div className="mb-6 flex items-center gap-4">
                        <img 
                            src={results.profile.profileImage} 
                            alt={results.profile.name}
                            className="w-16 h-16 rounded-full"
                        />
                        <div>
                            <h3 className="font-bold">{results.profile.name}</h3>
                            <p className="text-gray-400">@{results.profile.username}</p>
                            <p className="text-sm">{results.profile.description}</p>
                            <p className="text-sm text-gray-400">
                                {results.profile.followers.toLocaleString()} followers · 
                                {results.profile.following.toLocaleString()} following
                            </p>
                        </div>
                    </div>
    
                    {/* Claims Analysis */}
                    <div className="mb-6">
                        <h3 className="font-bold mb-3">Health Claims Analysis</h3>
                        {results.tweets.map((tweet, index) => (
                            <div key={tweet.id} className="mb-4 bg-gray-700/50 p-4 rounded">
                                <p className="mb-2">{tweet.text}</p>
                                <div className="text-sm text-gray-400">
                                    {new Date(tweet.created_at).toLocaleDateString()} · 
                                    {tweet.likes} likes · {tweet.retweets} retweets
                                </div>
                                
                                {tweet.claims.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="font-medium mb-2">Claims Detected:</h4>
                                        {tweet.claims.map((claim, claimIndex) => (
                                            <div key={claimIndex} className="bg-gray-800/50 p-2 rounded mb-2">
                                                <p>{claim.text}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="h-2 bg-gray-700 rounded-full w-24">
                                                        <div 
                                                            className="h-2 bg-emerald-400 rounded-full"
                                                            style={{width: `${claim.confidence}%`}}
                                                        />
                                                    </div>
                                                    <span className="text-sm text-gray-400">
                                                        {Math.round(claim.confidence)}% confidence
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {tweet.products.length > 0 && (
                                    <div className="mt-2">
                                        <h4 className="font-medium mb-2">Products Mentioned:</h4>
                                        <ul className="list-disc list-inside">
                                            {tweet.products.map((product, productIndex) => (
                                                <li key={productIndex} className="text-gray-300">
                                                    {product}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {tweet.revenue && (
                                    <div className="mt-2">
                                        <h4 className="font-medium mb-2">Revenue Analysis:</h4>
                                        <div className="text-sm">
                                            {tweet.revenue.hasAffiliate && (
                                                <span className="bg-yellow-600/50 text-yellow-200 px-2 py-1 rounded mr-2">
                                                    Affiliate
                                                </span>
                                            )}
                                            {tweet.revenue.hasSponsored && (
                                                <span className="bg-purple-600/50 text-purple-200 px-2 py-1 rounded">
                                                    Sponsored
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const handleNumberInput = (setter) => (e) => {
        const value = e.target.value;
        if (value === '') {
            setter(0);
            return;
        }
        const numValue = Math.max(0, parseInt(value) || 0);
        setter(numValue);
    };

    return (
        <div className="w-full min-h-screen bg-gray-900 text-white p-6">
            <Header />

            <div className="flex items-center gap-3 mb-6">
                <a href="#/leaderboard" className="text-emerald-400 flex items-center gap-2">
                    <span>←</span>
                    <span>Back to Dashboard</span>
                </a>
                <h1 className="text-2xl font-bold">Research Tasks</h1>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <span className="text-emerald-400">⬡</span>
                    Research Configuration
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Specific Influencer</h3>
                        <p className="text-sm text-gray-400">Research a known health influencer by name</p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Discover New</h3>
                        <p className="text-sm text-gray-400">Find and analyze new health influencers</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <div className="mb-6">
                            <h3 className="mb-3">Time Range</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    className={`p-2 rounded ${selectedTimeRange === 'lastWeek' ? 'bg-emerald-600' : 'bg-gray-700'}`}
                                    onClick={() => setSelectedTimeRange('lastWeek')}
                                >
                                    Last Week
                                </button>
                                <button
                                    className={`p-2 rounded ${selectedTimeRange === 'lastMonth' ? 'bg-emerald-600' : 'bg-gray-700'}`}
                                    onClick={() => setSelectedTimeRange('lastMonth')}
                                >
                                    Last Month
                                </button>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-3">Influencer Name</h3>
                            <input
                                type="text"
                                placeholder="Enter influencer name"
                                className="w-full bg-gray-700 rounded p-2 text-white"
                                value={influencerName}
                                onChange={(e) => setInfluencerName(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-3">Claims to Analyze Per Influencer</h3>
                            <input
                                type="number"
                                value={claimsCount || ''}
                                onChange={handleNumberInput(setClaimsCount)}
                                min="0"
                                className="w-full bg-gray-700 rounded p-2 text-white"
                            />
                            <p className="text-sm text-gray-400 mt-1">Recommended: 50-100 claims for comprehensive analysis</p>
                        </div>
                    </div>

                    <div>
                        <div className="mb-6">
                            <h3 className="mb-3">Products to Find Per Influencer</h3>
                            <input
                                type="number"
                                value={productsCount || ''}
                                onChange={handleNumberInput(setProductsCount)}
                                min="0"
                                className="w-full bg-gray-700 rounded p-2 text-white"
                            />
                            <p className="text-sm text-gray-400 mt-1">Set to 0 to skip product research</p>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">Include Revenue Analysis</h3>
                                    <p className="text-sm text-gray-400">Analyze monetization methods and estimate earnings</p>
                                </div>
                                <button
                                    className={`w-12 h-6 rounded-full relative ${includeRevenue ? 'bg-emerald-400' : 'bg-gray-600'}`}
                                    onClick={() => setIncludeRevenue(!includeRevenue)}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${includeRevenue ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium">Verify with Scientific Journals</h3>
                                    <p className="text-sm text-gray-400">Cross-reference claims with scientific literature</p>
                                </div>
                                <button
                                    className={`w-12 h-6 rounded-full relative ${verifyJournals ? 'bg-emerald-400' : 'bg-gray-600'}`}
                                    onClick={() => setVerifyJournals(!verifyJournals)}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${verifyJournals ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3>Scientific Journals</h3>
                        <div className="space-x-4 text-sm">
                            <button onClick={handleSelectAllJournals} className="text-emerald-400">Select All</button>
                            <button onClick={handleDeselectAllJournals} className="text-gray-400">Deselect All</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {Array.from(selectedJournals).map((journal) => (
                            <div key={journal} className="flex justify-between items-center p-3 bg-gray-700/50 rounded">
                                <span>{journal}</span>
                                <button
                                    onClick={() => toggleJournal(journal)}
                                    className="w-6 h-6 rounded-full border-2 border-emerald-400 flex items-center justify-center"
                                >
                                    <div className="w-4 h-4 bg-emerald-400 rounded-full" />
                                </button>
                            </div>
                        ))}
                        <button className="flex items-center gap-2 p-3 text-emerald-400">
                            <span>+</span>
                            Add New Journal
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="mb-3">Notes for Research Assistant</h3>
                    <textarea
                        placeholder="Add any specific instructions or focus areas..."
                        className="w-full h-24 bg-gray-700/50 rounded p-3 text-white"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                <div className="mt-8 flex justify-end">
                    <button
                        onClick={handleStartResearch}
                        className="bg-emerald-500 text-white px-6 py-2 rounded flex items-center gap-2"
                    >
                        <span>+</span>
                        Start Research
                    </button>
                </div>
            </div>
            {isAnalyzing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
                        <p className="text-lg">Analizando contenido...</p>
                    </div>
                </div>
            )}

            {analysisResults && (
                <AnalysisResults 
                    results={analysisResults} 
                    onClose={() => setAnalysisResults(null)} 
                />
            )}
        </div>
    );
};

export default ResearchDashboard;