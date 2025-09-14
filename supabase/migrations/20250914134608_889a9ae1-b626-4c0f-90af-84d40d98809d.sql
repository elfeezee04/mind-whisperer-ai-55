-- Add gender and age to profiles table
ALTER TABLE public.profiles 
ADD COLUMN age INTEGER,
ADD COLUMN gender TEXT;

-- Create mental health goals table
CREATE TABLE public.mental_health_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default mental health goals
INSERT INTO public.mental_health_goals (name, description, icon_name) VALUES 
('Feel calm', 'Find peace and tranquility in your daily life', 'heart'),
('Improve relationships', 'Build stronger connections with others', 'users'),
('Be more productive', 'Enhance focus and accomplish your goals', 'target'),
('Overcome sadness', 'Work through difficult emotions and find joy', 'sun'),
('Feel more balanced', 'Create harmony between work and personal life', 'scale'),
('Overcome shyness', 'Build confidence in social situations', 'smile');

-- Create user goals junction table
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_id UUID NOT NULL REFERENCES public.mental_health_goals(id),
  selected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, goal_id)
);

-- Enable RLS on new tables
ALTER TABLE public.mental_health_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- Policies for mental health goals (public read)
CREATE POLICY "Everyone can view mental health goals" 
ON public.mental_health_goals 
FOR SELECT 
USING (true);

-- Policies for user goals
CREATE POLICY "Users can view their own goals" 
ON public.user_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.user_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.user_goals 
FOR DELETE 
USING (auth.uid() = user_id);