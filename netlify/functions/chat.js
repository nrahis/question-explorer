// netlify/functions/chat.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

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
    const { 
      messages, 
      systemPrompt, 
      provider, 
      model, 
      apiKey, 
      temperature, 
      maxTokens, 
      topP, 
      topK 
    } = JSON.parse(event.body);
    
    console.log('Message count:', messages.length);
    console.log('Using provider:', provider || 'default');
    
    // Determine which provider to use - custom or environment default
    let providerToUse = provider || 'gemini';
    let modelToUse = model;
    let apiKeyToUse = apiKey;
    
    // Use environment variables as fallback
    if (!apiKeyToUse) {
      switch (providerToUse) {
        case 'gemini':
          apiKeyToUse = process.env.GEMINI_API_KEY;
          if (!modelToUse) modelToUse = 'gemini-2.0-flash';
          break;
        case 'openai':
          apiKeyToUse = process.env.OPENAI_API_KEY;
          if (!modelToUse) modelToUse = 'gpt-3.5-turbo';
          break;
        case 'anthropic':
          apiKeyToUse = process.env.ANTHROPIC_API_KEY;
          if (!modelToUse) modelToUse = 'claude-3-haiku';
          break;
        case 'groq':
          apiKeyToUse = process.env.GROQ_API_KEY;
          if (!modelToUse) modelToUse = 'llama3-8b-8192';
          break;
        case 'deepseek':
          apiKeyToUse = process.env.DEEPSEEK_API_KEY;
          if (!modelToUse) modelToUse = 'deepseek-chat';
          break;
      }
    }
    
    if (!apiKeyToUse) {
      console.error(`${providerToUse} API key not found in environment variables or request`);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }
    
    // Set generation parameters (with defaults if not provided)
    const temperatureToUse = temperature !== undefined ? temperature : 0.8;
    const maxTokensToUse = maxTokens !== undefined ? maxTokens : 256;
    const topPToUse = topP !== undefined ? topP : 0.9;
    const topKToUse = topK !== undefined ? topK : 40;
    
    // Call the appropriate API based on provider
    let response;
    switch (providerToUse) {
      case 'gemini':
        response = await chatWithGemini(messages, systemPrompt, modelToUse, apiKeyToUse, temperatureToUse, maxTokensToUse, topPToUse, topKToUse);
        break;
      case 'openai':
        response = await chatWithOpenAI(messages, systemPrompt, modelToUse, apiKeyToUse, temperatureToUse, maxTokensToUse, topPToUse);
        break;
      case 'anthropic':
        response = await chatWithAnthropic(messages, systemPrompt, modelToUse, apiKeyToUse, temperatureToUse, maxTokensToUse, topPToUse);
        break;
      case 'groq':
        response = await chatWithGroq(messages, systemPrompt, modelToUse, apiKeyToUse, temperatureToUse, maxTokensToUse);
        break;
      case 'deepseek':
        response = await chatWithDeepseek(messages, systemPrompt, modelToUse, apiKeyToUse, temperatureToUse, maxTokensToUse);
        break;
      default:
        throw new Error(`Unsupported provider: ${providerToUse}`);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ response })
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

// Chat with Gemini API
async function chatWithGemini(messages, systemPrompt, model, apiKey, temperature, maxTokens, topP, topK) {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  // Format conversation history for Gemini
  const conversationHistory = messages.map(msg => {
    return msg.role === 'user' 
      ? `User: ${msg.content}`
      : `Assistant: ${msg.content}`;
  }).join('\n');
  
  // Combine system prompt with conversation history
  const fullPrompt = `${systemPrompt}\n\n${conversationHistory ? 'Conversation history:\n' + conversationHistory + '\n\n' : ''}Assistant:`;
  
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
        temperature: temperature,
        maxOutputTokens: maxTokens,
        topP: topP,
        topK: topK
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Gemini API error:', errorData);
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
    console.error('Unexpected response structure:', data);
    throw new Error('Invalid response structure from Gemini API');
  }
  
  return data.candidates[0].content.parts[0].text;
}

// Chat with OpenAI API
async function chatWithOpenAI(messages, systemPrompt, model, apiKey, temperature, maxTokens, topP) {
  // Format messages for OpenAI
  const formattedMessages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];
  
  // Add conversation history
  messages.forEach(msg => {
    formattedMessages.push({
      role: msg.role,
      content: msg.content
    });
  });
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: formattedMessages,
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: topP
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('OpenAI API error:', errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
    console.error('Unexpected response structure:', data);
    throw new Error('Invalid response structure from OpenAI API');
  }
  
  return data.choices[0].message.content;
}

// Chat with Anthropic API
async function chatWithAnthropic(messages, systemPrompt, model, apiKey, temperature, maxTokens, topP) {
  // Format messages for Anthropic
  const formattedMessages = [];
  
  // Add conversation history
  messages.forEach(msg => {
    formattedMessages.push({
      role: msg.role,
      content: msg.content
    });
  });
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: model,
      system: systemPrompt,
      messages: formattedMessages,
      temperature: temperature,
      max_tokens: maxTokens,
      top_p: topP
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Anthropic API error:', errorData);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.content || !data.content.length || !data.content[0].text) {
    console.error('Unexpected response structure:', data);
    throw new Error('Invalid response structure from Anthropic API');
  }
  
  return data.content[0].text;
}

// Chat with Groq API
async function chatWithGroq(messages, systemPrompt, model, apiKey, temperature, maxTokens) {
  // Format messages for Groq (using OpenAI format)
  const formattedMessages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];
  
  // Add conversation history
  messages.forEach(msg => {
    formattedMessages.push({
      role: msg.role,
      content: msg.content
    });
  });
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: formattedMessages,
      temperature: temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('Groq API error:', errorData);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
    console.error('Unexpected response structure:', data);
    throw new Error('Invalid response structure from Groq API');
  }
  
  return data.choices[0].message.content;
}

// Chat with DeepSeek API
async function chatWithDeepseek(messages, systemPrompt, model, apiKey, temperature, maxTokens) {
  // Format messages for DeepSeek (using OpenAI format)
  const formattedMessages = [
    {
      role: 'system',
      content: systemPrompt
    }
  ];
  
  // Add conversation history
  messages.forEach(msg => {
    formattedMessages.push({
      role: msg.role,
      content: msg.content
    });
  });
  
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: formattedMessages,
      temperature: temperature,
      max_tokens: maxTokens
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('DeepSeek API error:', errorData);
    throw new Error(`DeepSeek API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
    console.error('Unexpected response structure:', data);
    throw new Error('Invalid response structure from DeepSeek API');
  }
  
  return data.choices[0].message.content;
}