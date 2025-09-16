-- Clear existing goals and insert new ones
DELETE FROM public.mental_health_goals;

-- Insert the new mental health goals
INSERT INTO public.mental_health_goals (name, icon_name, description) VALUES
('Mental Health', 'brain', 'Focus on overall mental wellness'),
('Anxiety', 'heart', 'Manage anxiety and worry'),
('Stress', 'scale', 'Find balance and reduce stress'),
('Depression', 'sun', 'Overcome depression and find hope'),
('Sadness', 'smile', 'Work through sadness and find joy'),
('Low self esteem', 'userCheck', 'Build confidence and self-worth');