// netlify/functions/chat.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Utility function to log detailed request/response info
function logApiInfo(provider, request, response) {
  console.log(`===== ${provider.toUpperCase()} API REQUEST =====`);
  console.log(JSON.stringify(request, null, 2));
  console.log(`===== ${provider.toUpperCase()} API RESPONSE =====`);
  console.log(JSON.stringify(response, null, 2));
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
  
  // Create content array for Gemini
  let contents = [];
  
  // Check if there are any messages
  if (messages && messages.length > 0) {
    // Create a clean conversation array
    const conversation = [];
    
    // Add system prompt as a user instruction at the beginning
    if (systemPrompt) {
      conversation.push({
        role: "user",
        parts: [{ text: `${systemPrompt}` }]
      });
      
      // Add a placeholder model response to the system prompt
      conversation.push({
        role: "model",
        parts: [{ text: "I'll follow these instructions." }]
      });
    }
    
    // Format conversation history for Gemini properly
    for (const msg of messages) {
      // Map 'bot' to 'model' for Gemini
      const role = msg.role === 'user' ? 'user' : 'model';
      conversation.push({
        role: role,
        parts: [{ text: msg.content }]
      });
    }
    
    // For Gemini, we need to make sure the last message is from 'user'
    // If it's not, we need to handle this case (unlikely in normal chat flow)
    if (conversation.length > 0 && conversation[conversation.length - 1].role !== 'user') {
      console.log('Warning: Last message in conversation is not from user. This may cause issues with Gemini API.');
    }
    
    contents = conversation;
  } else {
    // If no messages, just use the system prompt as the initial user message
    contents = [
      {
        role: "user",
        parts: [{ text: systemPrompt || "Hello" }]
      }
    ];
  }
  
  console.log('Gemini API request:', JSON.stringify({
    contents: contents,
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxTokens,
      topP: topP,
      topK: topK
    }
  }, null, 2));
  
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: contents,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: maxTokens,
        topP: topP,
        topK: topK
      }
    })
  });

  // Handle errors and log detailed information
  if (!response.ok) {
    let errorText = '';
    try {
      const errorData = await response.text();
      errorText = errorData;
      console.error('Gemini API error response:', errorData);
      
      // Try to parse the error as JSON for more details
      try {
        const errorJson = JSON.parse(errorData);
        console.error('Gemini API error details:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        // If it's not valid JSON, just use the text
      }
    } catch (e) {
      console.error('Could not read error response:', e);
    }
    
    throw new Error(`Gemini API error: ${response.status} - ${errorText.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log('Gemini API success response:', JSON.stringify(data, null, 2));
  
  // More robust error handling for response structure
  if (!data.candidates || data.candidates.length === 0) {
    console.error('No candidates in response:', data);
    throw new Error('No response candidates from Gemini API');
  }
  
  // Handle potential failures in the response
  if (data.candidates[0].content === undefined || 
      data.candidates[0].content === null) {
    console.error('Invalid candidate content:', data.candidates[0]);
    
    // Check if there's a finishReason that indicates an error
    if (data.candidates[0].finishReason && data.candidates[0].finishReason !== 'STOP') {
      throw new Error(`Gemini API error: ${data.candidates[0].finishReason}`);
    }
    
    throw new Error('Missing content in Gemini API response');
  }
  
  // Extract the text from the response
  if (!data.candidates[0].content.parts || 
      data.candidates[0].content.parts.length === 0 ||
      !data.candidates[0].content.parts[0].text) {
    console.error('Missing text in response parts:', data.candidates[0].content);
    throw new Error('Missing text in Gemini API response');
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
    // Convert 'bot' role to 'assistant' for OpenAI API compatibility
    const role = msg.role === 'user' ? 'user' : 'assistant';
    formattedMessages.push({
      role: role,
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
    // Convert 'bot' role to 'assistant' for Anthropic API compatibility
    const role = msg.role === 'user' ? 'user' : 'assistant';
    formattedMessages.push({
      role: role,
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
    // Convert 'bot' role to 'assistant' for Groq API compatibility
    const role = msg.role === 'user' ? 'user' : 'assistant';
    formattedMessages.push({
      role: role,
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
    // Convert 'bot' role to 'assistant' for DeepSeek API compatibility
    const role = msg.role === 'user' ? 'user' : 'assistant';
    formattedMessages.push({
      role: role,
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