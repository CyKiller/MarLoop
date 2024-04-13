const axios = require('axios');

const openAiApiKey = process.env.OPENAI_API_KEY;

// Function to interact with OpenAI GPT-3.5
async function fetchOpenAiResponse(prompt) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v4/completions',
      {
        model: 'text-davinci-003',
        prompt: prompt,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${openAiApiKey}`
        },
      }
    );
    console.log("OpenAI response successfully fetched.");
    return response.data.choices[0].text;
  } catch (error) {
    console.error('Error fetching response from OpenAI:', error.message, error.stack);
    throw new Error('Failed to fetch response from OpenAI GPT-3.5');
  }
}

module.exports = { fetchOpenAiResponse };