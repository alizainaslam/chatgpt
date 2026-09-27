import { Pinecone } from "@pinecone-database/pinecone";

// 1. Instantiate the client using the PINECONE_API_KEY environment variable
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY as string,
});

const indexCohort = pc.index({ name: "chatgpt" });

export const createMemory = async (
  vector: number[],
  messageId: string,
  metadata: {},
) => {
  const result = await indexCohort.upsert({
    records: [
      {
        id: messageId,
        values: vector,
        metadata: metadata,
      },
    ],
  });

  return result;
};

export const queryMemory = async (vector: number[]) => {
  const result = await indexCohort.query({
    vector: vector,
    topK: 3,
    filter: { metadata: {} },
    includeMetadata: true,
  });

  return result.matches;
};
