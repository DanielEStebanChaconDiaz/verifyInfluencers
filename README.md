# Verify Influencers Admin Panel

## Project Overview
This project, **"Verify Influencers"**, is an admin panel designed to verify health claims made by online influencers. The platform pulls content from various sources, identifies health claims, and cross-references them with credible scientific research to assign trust scores and verification statuses.

## High-Level Features
- **Influencer Discovery**: Automatically pulls recent health-related tweets and podcast transcripts.
- **Claim Detection**: Identifies health claims and categorizes them into topics like Nutrition, Medicine, and Mental Health.
- **Claim Verification**: Uses AI logic to cross-reference claims with reliable journals and assigns a trust score.
- **Dashboard Display**: Provides a leaderboard showcasing influencers, trust scores, follower counts, and claim statistics.
- **Research Configuration**: Allows users to configure date ranges, the number of claims to analyze, and the journals to be used.

## Environment Variables
To run this project, you need to set the following environment variables:

```bash
TWITTER_API_KEY=YH0kbfpNe2OmrTx6ZTdx5GU6y
TWITTER_API_SECRET=bSYo1ihetF9mHoECMCZDJdObKqRFj8yx9kNdCK4WT0swcayiDp
PODCAST_API_KEY=tu_clave_api_de_listen_notes
TWITTER_TOKEN=AAAAAAAAAAAAAAAAAAAAAG%2BfxwEAAAAAescG%2Bi6cubzJzjaqR652NH7gUrg%3Dtveaa6SDP9n0485J89nvIO4SQjwqUxWeLb78xzTLGtcvdAnea
VITE_HOST=localhost
VITE_PORT_FRONTEND=5000
PORT=3000
MONGO_URI=mongodb+srv://danielestebancd:danielesteban23@cluster0.qfj5f.mongodb.net/varifyInfluencers
JWT_SECRET='*#ñ:?**#*##*#545Vsar**!|°°1'
RAPID_API_KEY=60c0b8f59bmshb8d3920516e1c27p15151djsn79cfdb969902
RAPID_API_HOST=twitter-api47.p.rapidapi.com
PUBMED_API_KEY=9c51af0eac77361a4aa7ca6ae34acfca8309
```

---

## **Scripts** 🛠️
Use the following commands to run the project:

### **Frontend** 🌐
```bash
npm run dev
```

### **Backend** 

```bash
npm run srtart
```

## Tools and Technologies
- Node.js: Backend server
- Express.js: Web framework for Node.js
- MongoDB: NoSQL database for storing influencer and claim data
- Perplexity API: Used for content analysis and verification
- RapidAPI: Integration for external APIs
- Listen Notes API: For fetching podcast transcripts
## How It Works
- Content Collection: The admin panel retrieves tweets and podcast transcripts of influencers.
- Claim Analysis: AI logic identifies and categorizes health claims.
- Verification: Claims are checked against trusted sources, and verification statuses are assigned.
- Display: Results are shown in a user-friendly dashboard, including a leaderboard and detailed influencer pages.
## Deployment
This project is designed to be deployed on platforms like Netlify and Render. Ensure all environment variables are correctly set before deploying.

## Additional Requirements
- Functional demo with user input capability for testing API outputs.

## Conclusion
This project aims to bring clarity and credibility to online health information by verifying influencer claims through AI and scientific research. By participating in this challenge, you contribute to solving a real-world problem and showcase your skills in data integration, content parsing, and verification logic.