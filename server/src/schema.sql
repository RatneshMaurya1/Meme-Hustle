-- Create exec_sql function for running SQL commands
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create tables first
CREATE TABLE IF NOT EXISTS memes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    ai_caption TEXT,
    ai_vibe TEXT,
    upvotes INTEGER DEFAULT 0,
    current_bid INTEGER DEFAULT 100,
    owner_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS memes_tags_idx ON memes USING GIN (tags);
CREATE INDEX IF NOT EXISTS memes_upvotes_idx ON memes (upvotes DESC);

CREATE TABLE IF NOT EXISTS bids (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS bids_meme_id_idx ON bids (meme_id); 