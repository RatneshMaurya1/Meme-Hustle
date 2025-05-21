import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from './config.js';

const app = express();
const httpServer = createServer(app);

// Configure CORS
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL // Vercel deployment URL
];

// Configure Socket.IO with CORS
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Configure Express CORS
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Initialize Supabase client
const supabase = createClient(
  config.supabase.url,
  config.supabase.key
);

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// In-memory cache for Gemini API responses
const geminiCache = new Map();

// Default meme images for fallback
const DEFAULT_MEME_IMAGES = [
  'https://i.imgflip.com/65efzo.jpg', // Stonks
  'https://i.imgflip.com/1bij.jpg',   // One Does Not Simply
  'https://i.imgflip.com/4/2b5p.jpg', // Batman Slapping Robin
  'https://i.imgflip.com/26am.jpg',   // Futurama Fry
];

// In-memory cache for leaderboard with TTL
const LEADERBOARD_CACHE_TTL = 60 * 1000; // 1 minute
let leaderboardCache = {
  data: null,
  lastUpdated: null
};

// Cyberpunk-themed mock users
const MOCK_USERS = [
  'CyberPunk420',
  'NeonHacker69',
  'MatrixBreaker',
  'ByteRebel',
  'GlitchQueen',
  'DataPirate',
  'SynthWave_88',
  'PixelPunk',
  'VaporWave_92',
  'HoloHacker'
];

// Helper to get random mock user
function getRandomUser() {
  return MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
}

// Helper to get random default image
function getRandomDefaultImage() {
  return DEFAULT_MEME_IMAGES[Math.floor(Math.random() * DEFAULT_MEME_IMAGES.length)];
}

// Middleware
app.use(express.json());

// Generate AI caption and vibe
async function generateAIContent(tags, title) {
  const cacheKey = `${title}-${tags.join(',')}`;
  
  if (geminiCache.has(cacheKey)) {
    return geminiCache.get(cacheKey);
  }

  try {
    const captionPrompt = `Generate a funny, cyberpunk-themed caption for a meme with title "${title}" and tags: ${tags.join(', ')}. Keep it under 100 characters and make it witty.`;
    const vibePrompt = `Describe the vibe of a meme with title "${title}" and tags: ${tags.join(', ')} in 3-4 words. Make it sound cyberpunk and edgy.`;

    const [captionResult, vibeResult] = await Promise.all([
      model.generateContent(captionPrompt),
      model.generateContent(vibePrompt)
    ]);

    const result = {
      aiCaption: captionResult.response.text().trim(),
      aiVibe: vibeResult.response.text().trim()
    };

    geminiCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      aiCaption: "Error: AI malfunction. Defaulting to human consciousness.",
      aiVibe: "Digital Chaos Energy"
    };
  }
}

// Routes
app.get('/api/memes', async (req, res) => {
  try {
    const { data: memes, error } = await supabase
      .from('memes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(memes);
  } catch (error) {
    console.error('Error fetching memes:', error);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

app.post('/api/memes', async (req, res) => {
  try {
    const { title, imageUrl, tags } = req.body;
    const owner = getRandomUser();

    // Generate AI content
    const { aiCaption, aiVibe } = await generateAIContent(tags, title);

    // Insert meme
    const { data: meme, error } = await supabase
      .from('memes')
      .insert([{
        title,
        image_url: imageUrl || getRandomDefaultImage(),
        tags,
        ai_caption: aiCaption,
        ai_vibe: aiVibe,
        owner_id: owner,
        current_bid: 100 // Starting bid
      }])
      .select()
      .single();

    if (error) throw error;

    // Broadcast new meme
    io.emit('newMeme', meme);
    res.status(201).json(meme);
  } catch (error) {
    console.error('Error creating meme:', error);
    res.status(500).json({ error: 'Failed to create meme' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const { data: memes, error } = await supabase
      .from('memes')
      .select('*')
      .order('upvotes', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json(memes);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Add bid route
app.post('/api/memes/:id/bid', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, credits: amount } = req.body;

    // Validate bid data
    if (!id || !userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid bid data' });
    }

    // Get current highest bid
    const { data: currentBids, error: fetchError } = await supabase
      .from('bids')
      .select('amount')
      .eq('meme_id', id)
      .order('amount', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    const currentHighestBid = currentBids?.[0]?.amount || 0;

    // Ensure new bid is higher
    if (amount <= currentHighestBid) {
      return res.status(400).json({ 
        error: `Bid must be higher than ${currentHighestBid} credits` 
      });
    }

    // Insert new bid
    const { data: newBid, error: insertError } = await supabase
      .from('bids')
      .insert([{
        meme_id: id,
        user_id: userId,
        amount: amount
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Update meme's current bid
    const { error: updateError } = await supabase
      .from('memes')
      .update({ current_bid: amount })
      .eq('id', id);

    if (updateError) throw updateError;

    // Broadcast bid update through Socket.IO
    io.emit('bid_update', {
      memeId: id,
      userId,
      credits: amount,
      timestamp: new Date().toISOString()
    });

    res.status(200).json(newBid);
  } catch (error) {
    console.error('Error processing bid:', error);
    res.status(500).json({ error: 'Failed to process bid' });
  }
});

// Add vote route
app.post('/api/memes/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body;

    // Validate vote data
    if (!id || !['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote data' });
    }

    // Get current vote count
    const { data: meme, error: fetchError } = await supabase
      .from('memes')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Calculate new vote count - simple increment/decrement
    const currentVotes = meme.upvotes || 0;
    const newVotes = voteType === 'up' ? currentVotes + 1 : currentVotes - 1;

    // Update vote count
    const { error: updateError } = await supabase
      .from('memes')
      .update({ upvotes: newVotes })
      .eq('id', id);

    if (updateError) throw updateError;

    const response = {
      memeId: id,
      voteCount: newVotes
    };

    // Send response with updated data
    res.status(200).json(response);

    // Broadcast update through WebSocket
    io.emit('voteUpdate', response);
  } catch (error) {
    console.error('Error processing vote:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Start server
const PORT = config.port;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 