import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_KEY as string,
});

export const aiInteraction = async (input: string) => {
  const interaction = await ai.interactions.create({
    model: "gemini-3.5-flash-lite",
    input,
  });

  return interaction.output_text;
};

export const aiEmbedding = async (message: string) => {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: message,
    config: { outputDimensionality: 768 },
  });
  if (!response.embeddings?.[0]) {
    throw new Error("No embedding was returned");
  }

  return response.embeddings[0].values;
};
