/*
  # Create Blog Enhancement Tables

  1. New Tables
    - `post_views`
      - `id` (uuid, primary key)
      - `post_slug` (text, unique) - URL slug of the post
      - `view_count` (integer) - Total number of views
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `comments`
      - `id` (uuid, primary key)
      - `post_slug` (text) - URL slug of the post being commented on
      - `author_name` (text) - Name of the commenter
      - `author_email` (text) - Email of the commenter (not displayed)
      - `content` (text) - Comment content
      - `created_at` (timestamptz) - When comment was created
      - `approved` (boolean) - Whether comment is approved for display
    
    - `search_index`
      - `id` (uuid, primary key)
      - `post_slug` (text, unique) - URL slug of the post
      - `title` (text) - Post title for searching
      - `content` (text) - Post content for searching
      - `categories` (text) - Post categories
      - `created_at` (timestamptz) - Post creation date

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated and public access
    - Restrict write operations appropriately

  3. Important Notes
    - post_views tracks page views per post
    - comments require approval before display
    - search_index enables fast full-text search
*/

-- Create post_views table
CREATE TABLE IF NOT EXISTS post_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text UNIQUE NOT NULL,
  view_count integer DEFAULT 0 NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE post_views ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read view counts
CREATE POLICY "Anyone can view post view counts"
  ON post_views FOR SELECT
  USING (true);

-- Allow anyone to increment views (will be controlled by edge function)
CREATE POLICY "Anyone can update view counts"
  ON post_views FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow insert for new posts
CREATE POLICY "Anyone can insert new post views"
  ON post_views FOR INSERT
  WITH CHECK (true);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text NOT NULL,
  author_name text NOT NULL,
  author_email text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  approved boolean DEFAULT false NOT NULL
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read approved comments
CREATE POLICY "Anyone can view approved comments"
  ON comments FOR SELECT
  USING (approved = true);

-- Allow anyone to insert comments (will be unapproved by default)
CREATE POLICY "Anyone can insert comments"
  ON comments FOR INSERT
  WITH CHECK (approved = false);

-- Create search_index table
CREATE TABLE IF NOT EXISTS search_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  categories text DEFAULT '' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

-- Allow anyone to search posts
CREATE POLICY "Anyone can search posts"
  ON search_index FOR SELECT
  USING (true);

-- Allow insert/update for indexing (will be done via edge function)
CREATE POLICY "Anyone can insert search index"
  ON search_index FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update search index"
  ON search_index FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_post_views_slug ON post_views(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_approved ON comments(approved);
CREATE INDEX IF NOT EXISTS idx_search_slug ON search_index(post_slug);
CREATE INDEX IF NOT EXISTS idx_search_title ON search_index USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_search_content ON search_index USING gin(to_tsvector('english', content));