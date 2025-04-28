// netlify/functions/test-api.js
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  
  exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }
  
    try {
      const { provider, model, apiKey } = JSON.parse(event.body);
      console.log('Testing API connection for provider:', provider);
      
      // Validate inputs
      if (!provider || !model || !apiKey) {
        return {
          statusCode: 400,
          body: JSON.stringify({ 
            success: false, 
            error: 'Missing required parameters' 
          })
        };
      }
      
      // Test the connection based on provider
      let result;
      
      switch (provider) {
        case 'gemini':
          result = await testGeminiConnection(apiKey, model);
          break;
        case 'openai':
          result = await testOpenAIConnection(apiKey, model);
          break;
        case 'anthropic':
          result = await testAnthropicConnection(apiKey, model);
          break;
        case 'groq':
          result = await testGroqConnection(apiKey, model);
          break;
        case 'deepseek':
          result = await testDeepseekConnection(apiKey, model);
          break;
        default:
          return {
            statusCode: 400,
            body: JSON.stringify({ 
              success: false, 
              error: 'Invalid provider' 
            })
          };
      }
      
      return {
        statusCode: 200,
        body: JSON.stringify(result)
      };
      
    } catch (error) {
      console.error('Test API Error:', error);
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          success: false, 
          error: error.message || 'Internal server error' 
        })
      };
    }
  };
  
  // Test Gemini connection
  async function testGeminiConnection(apiKey, model) {
    try {
      // Construct API URL
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      // Simple test request
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hi there! This is a test message. Please respond with "Connection successful".'
            }]
          }],
          generationConfig: {
            maxOutputTokens: 10
          }
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Gemini API error:', errorData);
        return { 
          success: false, 
          error: `API responded with status code ${response.status}` 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Gemini connection test error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to connect to Gemini' 
      };
    }
  }
  
  // Test OpenAI connection
  async function testOpenAIConnection(apiKey, model) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ 
            role: 'user', 
            content: 'This is a test message. Please respond with "Connection successful".' 
          }],
          max_tokens: 10
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('OpenAI API error:', errorData);
        return { 
          success: false, 
          error: `API responded with status code ${response.status}` 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('OpenAI connection test error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to connect to OpenAI' 
      };
    }
  }
  
  // Test Anthropic connection
  async function testAnthropicConnection(apiKey, model) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ 
            role: 'user', 
            content: 'This is a test message. Please respond with "Connection successful".' 
          }],
          max_tokens: 10
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Anthropic API error:', errorData);
        return { 
          success: false, 
          error: `API responded with status code ${response.status}` 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Anthropic connection test error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to connect to Anthropic' 
      };
    }
  }
  
  // Test Groq connection
  async function testGroqConnection(apiKey, model) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ 
            role: 'user', 
            content: 'This is a test message. Please respond with "Connection successful".' 
          }],
          max_tokens: 10
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Groq API error:', errorData);
        return { 
          success: false, 
          error: `API responded with status code ${response.status}` 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Groq connection test error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to connect to Groq' 
      };
    }
  }
  
  // Test DeepSeek connection
  async function testDeepseekConnection(apiKey, model) {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{ 
            role: 'user', 
            content: 'This is a test message. Please respond with "Connection successful".' 
          }],
          max_tokens: 10
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('DeepSeek API error:', errorData);
        return { 
          success: false, 
          error: `API responded with status code ${response.status}` 
        };
      }
      
      return { success: true };
    } catch (error) {
      console.error('DeepSeek connection test error:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to connect to DeepSeek' 
      };
    }
  }