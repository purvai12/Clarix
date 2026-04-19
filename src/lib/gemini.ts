const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.0-flash';

export interface WalletRiskAssessment {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  flags: string[];
  recommendation: string;
  subScores: {
    activity: number;
    age: number;
    pattern: number;
    network: number;
  };
}

// Retry with exponential backoff on 429 or 503 errors
async function fetchWithRetry(url: string, options: RequestInit, retries = 3): Promise<Response> {
  const response = await fetch(url, options);
  if ((response.status === 429 || response.status === 503) && retries > 0) {
    const delay = (3 - retries) * 2000; // 2s, then 4s
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1);
  }
  return response;
}

async function callGemini(systemPrompt: string, userMessage: string, temperature = 0.5): Promise<string> {
  if (!GEMINI_API_KEY) throw new Error('no_key');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const response = await fetchWithRetry(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        { role: "user", parts: [{ text: userMessage }] }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        temperature,
        maxOutputTokens: 1024,
      }
    }),
  });

  if (response.status === 429) throw new Error('rate_limit');
  if (!response.ok) {
    console.error('Gemini API Error:', await response.text());
    throw new Error(`api_error_${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('empty_response');
  return text;
}

export async function analyzeWallet(
  walletAddress: string,
  blockchainData?: { balance: string; transactions: any[] }
): Promise<WalletRiskAssessment> {
  const systemPrompt = `You are a blockchain security AI assistant. Analyze Stellar wallet addresses for potential risks based on their transaction history and balance. Always respond with valid JSON only, no markdown.`;
  
  let userMessage = `Analyze this Stellar wallet address for potential risks: ${walletAddress}\n\n`;
  
  if (blockchainData) {
    userMessage += `Blockchain Context:\n`;
    userMessage += `- Current Balance: ${blockchainData.balance} XLM\n`;
    userMessage += `- Recent Transactions: ${JSON.stringify(blockchainData.transactions, null, 2)}\n\n`;
  }

  userMessage += `Return ONLY a JSON object with this exact structure:
{
  "riskScore": <number 0-100>,
  "riskLevel": "<low|medium|high|critical>",
  "summary": "<brief summary>",
  "flags": ["<flag1>", "<flag2>"],
  "recommendation": "<recommendation for users>",
  "subScores": {
    "activity": <number 0-100>,
    "age": <number 0-100>,
    "pattern": <number 0-100>,
    "network": <number 0-100>
  }
}`;

  try {
    const text = await callGemini(systemPrompt, userMessage, 0.4);
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error('Gemini wallet analysis error:', error?.message);
    return {
      riskScore: 50,
      riskLevel: 'medium',
      summary: 'Unable to complete full risk analysis. Please verify wallet manually.',
      flags: ['Analysis incomplete'],
      recommendation: 'Exercise caution and verify the wallet through multiple sources.',
      subScores: {
        activity: 50,
        age: 50,
        pattern: 50,
        network: 50,
      }
    };
  }
}

export async function chatWithAI(message: string, context?: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return '⚠️ AI assistant is not configured. Please add a VITE_GEMINI_API_KEY to your .env file.';
  }

  const systemPrompt = context
    ?? `You are ClarixAI, a helpful assistant for the Clarix wallet safety platform built on Stellar blockchain. Help users with questions about wallet security, fraud detection, CLRX tokens, and Clarix features. Be concise and friendly.`;

  try {
    return await callGemini(systemPrompt, message, 0.7);
  } catch (error: any) {
    console.error('Gemini chat error:', error?.message);
    if (error?.message === 'rate_limit') {
      return '⏳ The AI is receiving too many requests right now. Please wait a moment and try again.';
    }
    if (error?.message === 'no_key') {
      return '⚠️ AI assistant is not configured. Please add a VITE_GEMINI_API_KEY to your .env file.';
    }
    if (error?.message?.startsWith('api_error_')) {
      const code = error.message.replace('api_error_', '');
      return `❌ API error (${code}). Please try again shortly.`;
    }
    return 'Sorry, I encountered an error. Please try again.';
  }
}
