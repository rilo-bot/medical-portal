/**
 * AI service adapter — RILO managed AI (OpenAI-compatible).
 * Uses baseURL + apiKey from env. Never names the upstream provider.
 */
import OpenAI from 'openai';
import { env } from '../../config/env.js';

function getClient(): OpenAI {
  return new OpenAI({
    apiKey: env.openaiApiKey,
    baseURL: env.openaiBaseUrl,
  });
}

export async function createEmbedding(text: string): Promise<number[]> {
  if (!env.openaiApiKey) throw Object.assign(new Error('AI service not configured'), { status: 503 });
  const client = getClient();
  const resp = await client.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return resp.data[0].embedding;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function streamChatCompletion(
  messages: ChatMessage[],
  onToken: (token: string) => void,
): Promise<string> {
  if (!env.openaiApiKey) throw Object.assign(new Error('AI service not configured'), { status: 503 });
  const client = getClient();
  const stream = await client.chat.completions.create({
    model: env.openaiModel,
    messages,
    stream: true,
    temperature: 0.2,
    max_tokens: 2048,
  });

  let full = '';
  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? '';
    if (token) {
      full += token;
      onToken(token);
    }
  }
  return full;
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  if (!env.openaiApiKey) throw Object.assign(new Error('AI service not configured'), { status: 503 });
  const client = getClient();
  const resp = await client.chat.completions.create({
    model: env.openaiModel,
    messages,
    temperature: 0.2,
    max_tokens: 2048,
  });
  return resp.choices[0]?.message?.content ?? '';
}
