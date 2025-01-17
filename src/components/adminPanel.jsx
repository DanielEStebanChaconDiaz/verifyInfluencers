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
    const [error, setError] = useState(null);
    const [selectedJournals, setSelectedJournals] = useState(new Set([
        'PubMed Central'
    ]));

    const handleSelectAllJournals = () => {
        setSelectedJournals(new Set([
            'PubMed Central'
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
        setError(null);
        
        try {
            const response = await axios.post('https://verifyinfluencers.onrender.com/api/analyze-influencer', {
                influencerName,
                timeRange: selectedTimeRange,
                claimsCount,
                productsCount,
                includeRevenue,
                verifyJournals,
                selectedJournals: Array.from(selectedJournals),
                notes,
                config: {
                    includeProducts: productsCount > 0,
                    includeRevenue,
                    verifyJournals,
                }
            });

            setAnalysisResults(response.data);
        } catch (error) {
            console.error('Error in research:', error);
            setError(error.response?.data?.message || 'An error occurred during analysis');
        } finally {
            setIsAnalyzing(false);
        }
    };
    // Add this component to display the results
    const AnalysisResults = ({ results, onClose }) => {
        if (!results || !results.data) return null;
    
        const { data } = results;
        const { analysis, influencerName, timeRange, verificationEnabled } = data;
        if (!analysis) {
            return <div>No hay análisis disponibles</div>;
          }
        const { claims, platforms, summary, topClaims } = analysis;
    
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-gray-800 pb-4 flex justify-between items-center">
                        <h3 className="text-2xl font-bold text-green-400">Analysis Results</h3>
                        <button 
                            onClick={onClose}
                            className="bg-gray-700 p-2 rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
    
                    {/* Influencer Information */}
                    <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                        <h4 className="text-xl font-semibold text-green-400 mb-2">Influencer Details</h4>
                        <p><span className="font-semibold text-green-300">Name:</span> {influencerName}</p>
                        <p><span className="font-semibold text-green-300">Time Range:</span> {timeRange}</p>
                        <p><span className="font-semibold text-green-300">Platforms:</span> {platforms.join(', ')}</p>
                    </div>
    
                    {/* Summary Statistics */}
                    <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
                        <h4 className="text-xl font-semibold text-green-400 mb-4">Analysis Summary</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                                <p className="text-green-300 font-semibold">Total Claims</p>
                                <p className="text-2xl">{summary.totalClaims}</p>
                            </div>
                            <div>
                                <p className="text-green-300 font-semibold">Verified Claims</p>
                                <p className="text-2xl">{summary.verifiedCount}</p>
                            </div>
                            <div>
                                <p className="text-green-300 font-semibold">Verification Rate</p>
                                <p className="text-2xl">{summary.verificationRate}%</p>
                            </div>
                            <div>
                                <p className="text-green-300 font-semibold">Avg. Confidence</p>
                                <p className="text-2xl">{summary.averageConfidence.toFixed(1)}%</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-green-300 font-semibold">Likes</p>
                                <p className="text-xl">{summary.totalEngagement.likes}</p>
                            </div>
                            <div>
                                <p className="text-green-300 font-semibold">Retweets</p>
                                <p className="text-xl">{summary.totalEngagement.retweets}</p>
                            </div>
                            <div>
                                <p className="text-green-300 font-semibold">Replies</p>
                                <p className="text-xl">{summary.totalEngagement.replies}</p>
                            </div>
                        </div>
                    </div>
    
                    {/* Claims Analysis */}
                    <div className="mb-6">
                        <h4 className="text-xl font-semibold text-green-400 mb-4">Claims Analysis</h4>
                        {claims.map((claim, index) => (
                            <div key={index} className="mb-4 p-4 bg-gray-700/50 rounded-lg">
                                <p className="mb-2"><span className="font-semibold text-green-300">Claim:</span> {claim.text}</p>
                                <p className="mb-2"><span className="font-semibold text-green-300">Type:</span> {claim.type}</p>
                                <p className="mb-2"><span className="font-semibold text-green-300">Confidence:</span> {claim.confidence * 100}%</p>
                                <p className="mb-2"><span className="font-semibold text-green-300">Source:</span> {claim.source}</p>
                                {claim.verification && (
                                    <div className="mt-2">
                                        <p className="font-semibold text-green-300">Verification Status:</p>
                                        <div className="ml-4 mt-1">
                                            <p>Status: {claim.verification.verified ? 'Verified' : 'Not Verified'}</p>
                                            {claim.verification.supportingEvidence && (
                                                <div className="mt-2">
                                                    <p className="font-semibold text-green-300">Supporting Evidence:</p>
                                                    <ul className="list-disc ml-4">
                                                        {claim.verification.supportingEvidence.map((evidence, evIndex) => (
                                                            <li key={evIndex} className="mt-1">
                                                                {evidence.title} ({evidence.relevanceScore}% relevance)
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
    
                    {/* Top Claims */}
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                        <h4 className="text-xl font-semibold text-green-400 mb-4">Top Claims by Engagement</h4>
                        {topClaims.map((claim, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                                <p className="mb-1"><span className="font-semibold text-green-300">#{index + 1}:</span> {claim.text}</p>
                                {claim.engagement && (
                                    <p className="text-sm text-gray-400">
                                        Engagement: {claim.engagement.likes} likes, {claim.engagement.retweets} retweets, {claim.engagement.replies} replies
                                    </p>
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
                        <p className="text-lg">Analyzing content...</p>
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