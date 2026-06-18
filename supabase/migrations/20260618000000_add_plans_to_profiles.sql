-- Migration to add plan and user onboarding columns to public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS user_data JSONB,
ADD COLUMN IF NOT EXISTS questionnaire_answers JSONB,
ADD COLUMN IF NOT EXISTS calculated_plan JSONB,
ADD COLUMN IF NOT EXISTS meal_plan JSONB,
ADD COLUMN IF NOT EXISTS workout_plan JSONB,
ADD COLUMN IF NOT EXISTS subscription_data JSONB,
ADD COLUMN IF NOT EXISTS target_calories INTEGER,
ADD COLUMN IF NOT EXISTS macros JSONB,
ADD COLUMN IF NOT EXISTS tdee INTEGER,
ADD COLUMN IF NOT EXISTS selected_plan_type TEXT;
