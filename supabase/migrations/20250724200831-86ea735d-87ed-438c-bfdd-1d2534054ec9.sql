-- Create storage buckets for image uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('crop-images', 'crop-images', true);

-- Create tables for storing AI interactions
CREATE TABLE public.crop_diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  image_url TEXT,
  diagnosis JSONB,
  confidence NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.voice_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  transcript TEXT NOT NULL,
  response TEXT NOT NULL,
  language TEXT DEFAULT 'en-IN',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.market_queries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  crop TEXT NOT NULL,
  location TEXT NOT NULL,
  analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crop_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_queries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust based on auth needs)
CREATE POLICY "Allow all operations on crop_diagnoses" ON public.crop_diagnoses FOR ALL USING (true);
CREATE POLICY "Allow all operations on voice_interactions" ON public.voice_interactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on market_queries" ON public.market_queries FOR ALL USING (true);

-- Storage policies for crop images
CREATE POLICY "Allow public access to crop images" ON storage.objects FOR ALL USING (bucket_id = 'crop-images');