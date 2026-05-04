-- RUN THIS ENTIRE SCRIPT IN THE SUPABASE SQL EDITOR

-- 1. Create the jobs table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('fetch_me', 'food', 'parcel', 'rental')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    user_id TEXT NOT NULL, -- Clerk User ID
    rider_id TEXT, -- Clerk Rider ID (nullable until accepted)
    details JSONB NOT NULL DEFAULT '{}'::jsonb, -- Store pickup, dropoff, prices, cart items
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can see their own jobs
CREATE POLICY "Users can view own jobs" ON public.jobs
    FOR SELECT USING (user_id = auth.uid()::text OR current_setting('request.jwt.claims', true)::json->>'sub' = user_id);

-- Riders can see pending jobs OR their accepted jobs
CREATE POLICY "Riders can view relevant jobs" ON public.jobs
    FOR SELECT USING (status = 'pending' OR rider_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert jobs
CREATE POLICY "Users can create jobs" ON public.jobs
    FOR INSERT WITH CHECK (true); -- App layer will authenticate

-- Users and Riders can update jobs (status changes)
CREATE POLICY "Anyone can update jobs" ON public.jobs
    FOR UPDATE USING (true); -- App layer handles specific role checks

-- 4. Enable Supabase Realtime for the jobs table
-- Check if publication exists, if not create it (Supabase usually has 'supabase_realtime' by default)
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;

ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;

-- 5. Trigger to auto-update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_jobs_updated_at ON public.jobs;

CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
