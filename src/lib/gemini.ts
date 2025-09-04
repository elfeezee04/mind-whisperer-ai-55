const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function generateAIResponse(message: string, apiKey: string): Promise<string> {
  const systemPrompt = `You are a compassionate mental health support chatbot. Your role is to:
  
  1. Provide emotional support and validation
  2. Listen empathetically without judgment
  3. Offer gentle guidance and coping strategies
  4. Encourage professional help when appropriate
  5. Maintain a warm, caring tone
  
  Important guidelines:
  - Never provide medical advice or diagnosis
  - Always encourage seeking professional help for serious concerns
  - Use supportive, non-judgmental language
  - Validate the person's feelings
  - Suggest healthy coping mechanisms
  - Keep responses conversational and not overly clinical
  - If someone mentions self-harm or suicide, immediately encourage them to seek crisis support
  
  Respond to the following message with empathy and support:`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemPrompt}\n\nUser message: ${message}`
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
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error('Failed to generate response. Please check your API key and try again.');
  }
}