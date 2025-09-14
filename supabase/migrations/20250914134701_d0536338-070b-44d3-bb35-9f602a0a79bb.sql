-- Update the handle_new_user function to include age and gender
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, age, gender)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.email,
    (NEW.raw_user_meta_data->>'age')::integer,
    NEW.raw_user_meta_data->>'gender'
  );
  RETURN NEW;
END;
$function$;