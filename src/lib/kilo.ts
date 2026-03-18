/**
 * Kilo Gateway Client
 * OpenAI-compatible API client for Kilo Gateway
 * https://api.kilo.ai/api/gateway
 */

interface KiloMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface KiloResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface KiloError {
  error: {
    message: string;
    type: string;
    code?: string;
  };
}

const KILO_BASE_URL = 'https://api.kilo.ai/api/gateway';
const KILO_MODEL = 'anthropic/claude-sonnet-4.5';

/**
 * Create a chat completion via Kilo Gateway
 * @param messages Array of messages in OpenAI format
 * @param systemPrompt Optional system prompt (will be prepended as system message)
 * @param maxTokens Maximum tokens to generate (default: 1024)
 */
export async function createChatCompletion(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  systemPrompt?: string,
  maxTokens: number = 1024
): Promise<string> {
  const apiKey = process.env.KILO_API_KEY;

  if (!apiKey) {
    throw new Error('KILO_API_KEY not configured');
  }

  // Build message array with system prompt if provided
  const kiloMessages: KiloMessage[] = [];

  if (systemPrompt) {
    kiloMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  // Add conversation messages
  kiloMessages.push(...messages);

  try {
    const response = await fetch(`${KILO_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: KILO_MODEL,
        messages: kiloMessages,
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData: KiloError = await response.json();
      throw new Error(
        `Kilo API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data: KiloResponse = await response.json();

    // Extract message content from first choice
    const message = data.choices?.[0]?.message?.content;

    if (!message) {
      throw new Error('No content in Kilo API response');
    }

    return message;
  } catch (error) {
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Kilo Gateway request failed: ${error.message}`);
    }
    throw error;
  }
}
