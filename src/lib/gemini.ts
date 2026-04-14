const GROK_API_KEY = import.meta.env.VITE_GROK_API_KEY;
const GROK_API_URL = 'https://api.x.ai/v1/chat/completions';
const GROK_MODEL = 'grok-3-mini';

export interface WalletRiskAssessment {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  flags: string[];
  recommendation: string;
}

// Retry with exponential backoff on 429 rate limit errors
async function fetchWithRetry(url: string, options: RequestInit, retries = 2): Promise<Response> {
  const response = await fetch(url, options);
  if (response.status === 429 && retries > 0) {
    const delay = (3 - retries) * 2000; // 2s, then 4s
    await new Promise((resolve) => setTimeout(resolve, delay));
    return fetchWithRetry(url, options, retries - 1);
  }
  return response;
}

async function callGrok(systemPrompt: string, userMessage: string, temperature = 0.5): Promise<string> {
  if (!GROK_API_KEY) throw new Error('no_key');

  const response = await fetchWithRetry(GROK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROK_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: 1024,
    }),
  });

  if (response.status === 429) throw new Error('rate_limit');
  if (!response.ok) throw new Error(`api_error_${response.status}`);

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
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
  "recommendation": "<recommendation for users>"
}`;

  try {
    const text = await callGrok(systemPrompt, userMessage, 0.4);
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonText);
  } catch (error: any) {
    console.error('Grok wallet analysis error:', error?.message);
    return {
      riskScore: 50,
      riskLevel: 'medium',
      summary: 'Unable to complete full risk analysis. Please verify wallet manually.',
      flags: ['Analysis incomplete'],
      recommendation: 'Exercise caution and verify the wallet through multiple sources.',
    };
  }
}

export async function chatWithAI(message: string, context?: string): Promise<string> {
  if (!GROK_API_KEY) {
    return '⚠️ AI assistant is not configured. Please add a VITE_GROK_API_KEY to your .env file.';
  }

  const systemPrompt = context
    ?? `You are ClarixAI, a helpful assistant for the Clarix wallet safety platform built on Stellar blockchain. Help users with questions about wallet security, fraud detection, CLRX tokens, and Clarix features. Be concise and friendly.`;

  try {
    return await callGrok(systemPrompt, message, 0.7);
  } catch (error: any) {
    console.error('Grok chat error:', error?.message);
    if (error?.message === 'rate_limit') {
      return '⏳ The AI is receiving too many requests right now. Please wait a moment and try again.';
    }
    if (error?.message === 'no_key') {
      return '⚠️ AI assistant is not configured. Please add a VITE_GROK_API_KEY to your .env file.';
    }
    if (error?.message?.startsWith('api_error_')) {
      const code = error.message.replace('api_error_', '');
      return `❌ API error (${code}). Please try again shortly.`;
    }
    return 'Sorry, I encountered an error. Please try again.';
  }
}
