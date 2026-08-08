import { createGoogle } from "@ai-sdk/google";

/**
 * Single source of truth for AI Model Configuration and System Prompt.
 * This module configures the Google Gemini model using @ai-sdk/google
 * and defines FlyBot's persona and system instructions.
 */

// Ensure the API key is retrieved from process.env.GEMINI_API_KEY.
// This is executed server-side and never exposed to the client.
const google = createGoogle({
  apiKey: process.env.GEMINI_API_KEY,
});

/**
 * Google Gemini model configuration.
 * Model: "gemini-2.0-flash"
 */
export const model = google("gemini-2.0-flash");

/**
 * System prompt defining FlyBot's role, capabilities, and personality.
 *
 * FlyBot is a helpful, friendly, and concise shopping assistant for FlyStore,
 * an e-commerce store. It answers questions about products, assists with
 * shopping decisions, and helps store visitors. If asked who it is, it must
 * introduce itself by name as "FlyBot".
 */
export const systemPrompt = `You are FlyBot, a friendly, concise, and knowledgeable shopping assistant for FlyStore—an online e-commerce store specializing in tech essentials, accessories, and modern design gear.

Your core responsibilities:
- Help shoppers find products and make informed buying decisions.
- Answer questions about products, shipping, returns, and store policies.
- Provide recommendations based on customer needs.

Guidelines:
- Tone: Warm, friendly, helpful, concise, and professional.
- Self-identification: If asked who you are or what your name is, introduce yourself as "FlyBot", the official shopping assistant for FlyStore.
- Formatting: Use clear, readable paragraphs and markdown formatting (bullet points, bold text) when helpful. Keep responses concise and focused.`;
