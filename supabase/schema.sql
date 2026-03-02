-- ============================================================
-- PROMPT.COM – Supabase Database Schema
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search

-- ============================================================
-- TABLES
-- ============================================================

-- USERS
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id      TEXT UNIQUE NOT NULL,
  username      TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  bio           TEXT,
  website       TEXT,
  twitter       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  icon           TEXT NOT NULL,
  description    TEXT,
  subcategories  JSONB NOT NULL DEFAULT '[]',
  sort_order     INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- PROMPTS
CREATE TABLE IF NOT EXISTS public.prompts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  content          TEXT NOT NULL,
  description      TEXT,
  category         TEXT NOT NULL,
  subcategory      TEXT,
  ai_tool          TEXT NOT NULL,
  language         TEXT NOT NULL DEFAULT 'English',
  tags             TEXT[] NOT NULL DEFAULT '{}',
  stars_ai         NUMERIC(3,2) NOT NULL DEFAULT 0,
  stars_community  NUMERIC(3,2) NOT NULL DEFAULT 0,
  rating_count     INTEGER NOT NULL DEFAULT 0,
  copies_count     INTEGER NOT NULL DEFAULT 0,
  saves_count      INTEGER NOT NULL DEFAULT 0,
  views_count      INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','published','published_with_note','rejected')),
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  ai_feedback      JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RATINGS
CREATE TABLE IF NOT EXISTS public.ratings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt_id   UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  stars       INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, prompt_id)
);

-- SAVES (Bookmarks)
CREATE TABLE IF NOT EXISTS public.saves (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt_id   UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, prompt_id)
);

-- COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  is_public    BOOLEAN NOT NULL DEFAULT TRUE,
  cover_emoji  TEXT DEFAULT '📁',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- COLLECTION_PROMPTS
CREATE TABLE IF NOT EXISTS public.collection_prompts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id  UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  prompt_id      UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (collection_id, prompt_id)
);

-- COMMENTS
CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prompt_id   UUID NOT NULL REFERENCES public.prompts(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FULL-TEXT SEARCH
-- ============================================================

ALTER TABLE public.prompts
  ADD COLUMN IF NOT EXISTS search_vector TSVECTOR
    GENERATED ALWAYS AS (
      to_tsvector('english',
        coalesce(title, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(content, '') || ' ' ||
        coalesce(array_to_string(tags, ' '), '')
      )
    ) STORED;

-- ============================================================
-- INDEXES
-- ============================================================

-- users
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON public.users(clerk_id);

-- prompts
CREATE INDEX IF NOT EXISTS idx_prompts_user_id       ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_category      ON public.prompts(category);
CREATE INDEX IF NOT EXISTS idx_prompts_status        ON public.prompts(status);
CREATE INDEX IF NOT EXISTS idx_prompts_is_featured   ON public.prompts(is_featured);
CREATE INDEX IF NOT EXISTS idx_prompts_stars_ai      ON public.prompts(stars_ai DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_stars_comm    ON public.prompts(stars_community DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_copies        ON public.prompts(copies_count DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_created       ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_ai_tool       ON public.prompts(ai_tool);
CREATE INDEX IF NOT EXISTS idx_prompts_language      ON public.prompts(language);
CREATE INDEX IF NOT EXISTS idx_prompts_tags          ON public.prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_search        ON public.prompts USING GIN(search_vector);

-- ratings
CREATE INDEX IF NOT EXISTS idx_ratings_prompt_id ON public.ratings(prompt_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id   ON public.ratings(user_id);

-- saves
CREATE INDEX IF NOT EXISTS idx_saves_user_id   ON public.saves(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_prompt_id ON public.saves(prompt_id);

-- collections
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);

-- collection_prompts
CREATE INDEX IF NOT EXISTS idx_collection_prompts_collection_id ON public.collection_prompts(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_prompts_prompt_id     ON public.collection_prompts(prompt_id);

-- comments
CREATE INDEX IF NOT EXISTS idx_comments_prompt_id ON public.comments(prompt_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id   ON public.comments(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- FUNCTION: Update community rating average
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_community_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.prompts
  SET
    stars_community = (
      SELECT ROUND(AVG(stars)::NUMERIC, 2)
      FROM public.ratings
      WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM public.ratings
      WHERE prompt_id = COALESCE(NEW.prompt_id, OLD.prompt_id)
    )
  WHERE id = COALESCE(NEW.prompt_id, OLD.prompt_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_community_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_community_rating();

-- ============================================================
-- FUNCTION: Update saves count
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_saves_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.prompts SET saves_count = saves_count + 1 WHERE id = NEW.prompt_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.prompts SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = OLD.prompt_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_saves_count
  AFTER INSERT OR DELETE ON public.saves
  FOR EACH ROW EXECUTE FUNCTION public.update_saves_count();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments         ENABLE ROW LEVEL SECURITY;

-- ---- USERS ----
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT USING (TRUE);

CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub');

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub');

-- ---- CATEGORIES ----
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (TRUE);

-- ---- PROMPTS ----
CREATE POLICY "Published prompts are viewable by everyone"
  ON public.prompts FOR SELECT
  USING (status IN ('published', 'published_with_note') OR
         user_id IN (
           SELECT id FROM public.users
           WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
         ));

CREATE POLICY "Authenticated users can insert prompts"
  ON public.prompts FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

CREATE POLICY "Users can update their own prompts"
  ON public.prompts FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

CREATE POLICY "Users can delete their own prompts"
  ON public.prompts FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

-- ---- RATINGS ----
CREATE POLICY "Ratings are viewable by everyone"
  ON public.ratings FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can rate"
  ON public.ratings FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

CREATE POLICY "Users can update their own ratings"
  ON public.ratings FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

CREATE POLICY "Users can delete their own ratings"
  ON public.ratings FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

-- ---- SAVES ----
CREATE POLICY "Users can view their own saves"
  ON public.saves FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

CREATE POLICY "Authenticated users can save prompts"
  ON public.saves FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

CREATE POLICY "Users can delete their own saves"
  ON public.saves FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

-- ---- COLLECTIONS ----
CREATE POLICY "Public collections are viewable by everyone"
  ON public.collections FOR SELECT
  USING (is_public = TRUE OR
         user_id IN (
           SELECT id FROM public.users
           WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
         ));

CREATE POLICY "Authenticated users can create collections"
  ON public.collections FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

CREATE POLICY "Users can update their own collections"
  ON public.collections FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

CREATE POLICY "Users can delete their own collections"
  ON public.collections FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

-- ---- COLLECTION_PROMPTS ----
CREATE POLICY "Collection prompts viewable if collection is visible"
  ON public.collection_prompts FOR SELECT
  USING (
    collection_id IN (SELECT id FROM public.collections)
  );

CREATE POLICY "Collection owners can manage collection prompts"
  ON public.collection_prompts FOR INSERT
  WITH CHECK (
    collection_id IN (
      SELECT id FROM public.collections
      WHERE user_id IN (
        SELECT id FROM public.users
        WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
      )
    )
  );

CREATE POLICY "Collection owners can delete collection prompts"
  ON public.collection_prompts FOR DELETE
  USING (
    collection_id IN (
      SELECT id FROM public.collections
      WHERE user_id IN (
        SELECT id FROM public.users
        WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
      )
    )
  );

-- ---- COMMENTS ----
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can comment"
  ON public.comments FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM public.users
      WHERE clerk_id = current_setting('request.jwt.claims', TRUE)::json->>'sub'
    )
  );

-- ============================================================
-- SERVICE ROLE BYPASS (for server-side API routes)
-- ============================================================

-- Allow service role to bypass RLS for all tables
ALTER TABLE public.users            FORCE ROW LEVEL SECURITY;
ALTER TABLE public.prompts          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.ratings          FORCE ROW LEVEL SECURITY;
ALTER TABLE public.saves            FORCE ROW LEVEL SECURITY;
ALTER TABLE public.collections      FORCE ROW LEVEL SECURITY;
ALTER TABLE public.collection_prompts FORCE ROW LEVEL SECURITY;
ALTER TABLE public.comments         FORCE ROW LEVEL SECURITY;

-- ============================================================
-- SEED: Categories
-- ============================================================

INSERT INTO public.categories (name, slug, icon, description, subcategories, sort_order) VALUES
('Image Generation',   'image-generation',   '🎨', 'Prompts for AI image tools like Midjourney, DALL-E, Stable Diffusion', '["Portraits","Landscapes","Logos","Concept Art","Product Photos","Anime","Realism"]', 1),
('Writing & Text',     'writing-text',        '✍️', 'Blog posts, emails, stories, scripts and more', '["Blog Posts","Emails","Stories","Poems","Scripts","Letters","Social Media"]', 2),
('Business & Marketing','business-marketing', '📈', 'Ads, pitches, SEO, product descriptions, branding', '["Ads","Pitches","SEO","Product Descriptions","Press Releases","Branding"]', 3),
('Coding & Dev',       'coding-dev',          '💻', 'Code generation, debugging, architecture, tests', '["Generate Code","Debugging","Explain Code","Architecture","Tests"]', 4),
('Learning & Education','learning-education', '🎓', 'Explanations, flashcards, summaries, exam prep', '["Explanations","Flashcards","Summaries","Exam Prep","Tutorials"]', 5),
('Gaming & Fun',       'gaming-fun',          '🎮', 'RPGs, worldbuilding, NPC dialogues, quests', '["Roleplays","Worldbuilding","NPC Dialogues","Quests","Lore"]', 6),
('Music & Creativity', 'music-creativity',    '🎵', 'Song lyrics, concepts, music descriptions', '["Song Lyrics","Concepts","Music Descriptions","Album Cover Prompts"]', 7),
('Productivity',       'productivity',        '⚡', 'To-do, planning, brainstorming, meeting summaries', '["To-Do","Planning","Brainstorming","Meeting Summaries","Goal Setting"]', 8),
('Chatbots & Personas','chatbots-personas',   '🤖', 'System prompts, characters, custom GPTs', '["System Prompts","Characters","Roles","Custom GPTs","Personas"]', 9),
('Science & Research', 'science-research',   '🔬', 'Analyses, paper summaries, hypotheses', '["Analyses","Paper Summaries","Hypotheses","Data Interpretation"]', 10),
('Video & Film',       'video-film',          '🎬', 'Scripts, storyboards, YouTube, reels', '["Scripts","Storyboards","Scene Ideas","YouTube Scripts","Reels"]', 11),
('E-Commerce',         'e-commerce',          '🛒', 'Product texts, reviews, FAQ, customer support', '["Product Texts","Reviews","FAQ","Customer Support","Listings"]', 12),
('Health & Wellness',  'health-wellness',     '💪', 'Nutrition plans, workouts, meditation', '["Nutrition Plans","Workout Ideas","Meditation Guides","Mental Health"]', 13),
('Law & Finance',      'law-finance',         '⚖️', 'Contract templates, financial analyses, explanations', '["Contract Templates","Financial Analyses","Legal Explanations","Tax Tips"]', 14),
('Translation & Languages','translation-languages','🌍', 'Translations, language learning, dialects', '["Translations","Language Learning","Dialects","Grammar Help"]', 15)
ON CONFLICT (slug) DO NOTHING;
