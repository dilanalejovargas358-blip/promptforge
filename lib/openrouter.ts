import OpenAI from "openai";

const openrouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

export const MODELS = {
  FAST: "google/gemini-2.5-flash",
  CHEAP: "deepseek/deepseek-chat",
  SMART: "anthropic/claude-3.5-sonnet",
  BEST: "openai/gpt-4o",
  BALANCED: "google/gemini-3.6-flash",
};

export async function callOpenRouter(
  prompt: string,
  systemPrompt?: string,
  model: string = MODELS.BALANCED
) {
  try {
    const response = await openrouter.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt || "Eres un asistente útil." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 500, // ✅ AÑADE ESTO - límite de 500 tokens por respuesta
    });

    return response.choices[0].message.content || "";
  } catch (error) {
    console.error("Error en OpenRouter:", error);
    throw error;
  }
}