# MemeHustle - Cyberpunk Meme Marketplace

A neon-drenched cyberpunk marketplace for creating, trading, and upvoting memes. Built with MERN stack and powered by Google Gemini AI.

## 🌟 Features

- 🎨 Create and share memes with AI-generated captions
- 💰 Real-time bidding system
- ⚡ Live upvote/downvote with leaderboard
- 🤖 AI-powered vibe analysis
- 🎮 Cyberpunk UI with glitch effects

## 🚀 Quick Start

1. Clone the repository:
\`\`\`bash
git clone [your-repo-url]
cd meme-hustle
\`\`\`

2. Install dependencies:
\`\`\`bash
npm run install:all
\`\`\`

3. Set up environment variables:
- Create \`.env\` in server directory
- Create \`.env.local\` in client directory

4. Start the development servers:
\`\`\`bash
npm start
\`\`\`

## 🛠️ Tech Stack

- Frontend: React, TailwindCSS, Socket.IO Client
- Backend: Node.js, Express, Socket.IO
- Database: Supabase (PostgreSQL)
- AI: Google Gemini API
- Real-time: WebSocket

## 🎯 Environment Variables

### Backend (.env)
\`\`\`
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
\`\`\`

### Frontend (.env.local)
\`\`\`
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:5000
\`\`\`

## 🎮 Features in Detail

- **Meme Creation**: Upload memes with titles and tags
- **Real-time Bidding**: Bid on memes with live updates
- **Voting System**: Upvote/downvote with real-time leaderboard
- **AI Integration**: Automatic captions and vibe analysis
- **Cyberpunk UI**: Neon aesthetics and glitch effects

## 🌐 API Endpoints

- `POST /api/memes` - Create new meme
- `GET /api/memes` - Get all memes
- `POST /api/memes/:id/bid` - Place bid
- `POST /api/memes/:id/vote` - Vote on meme
- `GET /api/leaderboard` - Get trending memes

## 🎨 Cyberpunk Design

The UI features a neon-soaked aesthetic with:
- Glitch effects
- Neon gradients
- Terminal-style animations
- Cyberpunk color palette 