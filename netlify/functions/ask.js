// netlify/functions/ask.js
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

exports.handler = async function(event, context) {
  console.log('Function called with method:', event.httpMethod);
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { question, systemPrompt, provider, model, apiKey, temperature, maxTokens, topP, topK } = JSON.parse(event.body);
    console.log('Received question:', question);
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
    const temperatureToUse = temperature !== undefined ? temperature : 0.7;
    const maxTokensToUse = maxTokens !== undefined ? maxTokens : 1024;
    const topPToUse = topP !== undefined ? topP : 0.8;
    const topKToUse = topK !== undefined ? topK : 40;
    
    // Call the appropriate API based on provider
    let answer;
    switch (providerToUse) {
      case 'gemini':
        answer = await askGemini(question, systemPrompt, modelToUse, apiKeyToUse, temperatureToUse, maxTokensToUse, topPToUse, topKToUse);
        break;
      case 'openai':
        answer = await askOpenAI(question, systemPrompt, modelToUse, apiKeyToUse, temperatureToUse, maxTokensToUse, topPToUse);
        break;
      case 'anthropic':
        answer = await askAnthropic(question, systemPrompt, modelToUse, apiKeyToUse, temperatureToUse, maxTokensToUse, topPToUse);
        break;
      case 'groq':
        answer = await askGroq(question, systemPrompt, modelToUse, apiKeyToUse, temperatureToUse, maxTokensToUse);
        break;
      case 'deepseek':
        answer = await askDeepseek(question, systemPrompt, modelToUse, apiKeyToUse, temperatureToUse, maxTokensToUse);
        break;
      default:
        throw new Error(`Unsupported provider: ${providerToUse}`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ answer })
    };
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};

// Ask using Gemini API
async function askGemini(question, systemPrompt, model, apiKey, temperature, maxTokens, topP, topK) {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `${systemPrompt}\n\nQuestion: ${question}`
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
  console.log('Gemini response status:', response.status);
  
  if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
    console.error('Unexpected response structure:', data);
    throw new Error('Invalid response structure from Gemini API');
  }
  
  return data.candidates[0].content.parts[0].text;
}

// Ask using OpenAI API
async function askOpenAI(question, systemPrompt, model, apiKey, temperature, maxTokens, topP) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
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

// Ask using Anthropic API
async function askAnthropic(question, systemPrompt, model, apiKey, temperature, maxTokens, topP) {
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
      messages: [
        {
          role: 'user',
          content: question
        }
      ],
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

// Ask using Groq API
async function askGroq(question, systemPrompt, model, apiKey, temperature, maxTokens) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
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

// Ask using DeepSeek API
async function askDeepseek(question, systemPrompt, model, apiKey, temperature, maxTokens) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ],
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