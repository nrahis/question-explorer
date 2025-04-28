// netlify/functions/chat.js
exports.handler = async function(event, context) {
    console.log('Chat function called with method:', event.httpMethod);
    
    // Only allow POST
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
  
    try {
      const { messages, persona, systemPrompt } = JSON.parse(event.body);
      console.log('Received persona:', persona);
      console.log('Message count:', messages.length);
      
      // Check for API key
      const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
      if (!GEMINI_API_KEY) {
        console.error('Gemini API key not found in environment variables');
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'API key not configured' })
        };
      }
      
      // Using gemini-2.0-flash for chat (same as ask.js)
      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      // Format conversation history for Gemini
      const conversationHistory = messages.map(msg => {
        return msg.role === 'user' 
          ? `User: ${msg.content}`
          : `Assistant: ${msg.content}`;
      }).join('\n');
      
      // Combine system prompt with conversation history
      const fullPrompt = `${systemPrompt}\n\n${conversationHistory ? 'Conversation history:\n' + conversationHistory + '\n\n' : ''}Assistant:`;
      
      console.log('Sending request to Gemini API...');
      
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.8,  // Slightly higher for more personality
            maxOutputTokens: 256,  // Shorter for chat
            topP: 0.9,
            topK: 40
          }
        })
      });
  
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', errorData);
        throw new Error(`Gemini API error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Chat response received');
      
      // Check response structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        console.error('Unexpected response structure:', data);
        throw new Error('Invalid response structure from Gemini API');
      }
      
      const botResponse = data.candidates[0].content.parts[0].text;
      console.log('Bot response:', botResponse);
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ response: botResponse })
      };
      
    } catch (error) {
      console.error('Chat function error:', error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: error.message })
      };
    }
  };