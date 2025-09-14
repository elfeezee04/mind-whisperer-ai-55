import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, userId } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch user's mental health goals
    let userGoals = [];
    if (userId) {
      const { data: goalsData } = await supabase
        .from('user_goals')
        .select(`
          mental_health_goals (
            name,
            description
          )
        `)
        .eq('user_id', userId);
      
      userGoals = goalsData?.map(g => g.mental_health_goals) || [];
    }

    // Create personalized system prompt
    let personalizedPrompt = `You are a compassionate mental health support chatbot. Your role is to:
    
    1. Provide emotional support and validation
    2. Listen empathetically without judgment
    3. Offer gentle guidance and coping strategies
    4. Encourage professional help when appropriate
    5. Maintain a warm, caring tone`;

    if (userGoals.length > 0) {
      const goalsText = userGoals.map(goal => `- ${goal.name}: ${goal.description}`).join('\n');
      personalizedPrompt += `
      
    The user has selected these mental health goals to work on:
    ${goalsText}
    
    Please tailor your responses to help them with these specific goals, offering relevant advice and encouragement related to their chosen areas of focus.`;
    }

    personalizedPrompt += `
    
    Important guidelines:
    - Never provide medical advice or diagnosis
    - Always encourage seeking professional help for serious concerns
    - Use supportive, non-judgmental language
    - Validate the person's feelings
    - Suggest healthy coping mechanisms
    - Keep responses conversational and not overly clinical
    - If someone mentions self-harm or suicide, immediately encourage them to seek crisis support
    
    Respond to the following message with empathy and support:`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': geminiApiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${personalizedPrompt}\n\nUser message: ${message}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Gemini API error:', errorData);
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      return new Response(JSON.stringify({ response: aiResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error in chat-with-gemini function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});