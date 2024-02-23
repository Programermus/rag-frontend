import OpenAI from "openai";
import { ChromaClient } from "chromadb";
import { OpenAIEmbeddingFunction } from "chromadb";
import { rag2, expansion } from "./prompts";
import { get_chunked_documents, get_summary_documents } from "./chroma";

const openai = new OpenAI();
const chroma = new ChromaClient({ path: "http://localhost:8000" });
const embeddingFunction = new OpenAIEmbeddingFunction({
  openai_api_key: process.env.OPENAI_API_KEY || "",
  openai_model: "text-embedding-3-small",
});

type PromptExpansion = {
  synonymous_prompts: string[];
};

type UserPromptResponse = {
  answer: string;
  source: string[];
};

export async function POST(req: Request) {
  const body = await req.json();

  const prompt_expansion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: expansion(3),
      },
      {
        role: "user",
        content: body.question,
      },
    ],
  });

  let ragContext = "";

  const res = prompt_expansion.choices[0].message.content;
  if (res) {
    const exp: PromptExpansion = JSON.parse(res);

    const chunksPromise = get_chunked_documents(
      exp.synonymous_prompts,
      chroma,
      embeddingFunction
    );
    const summariesPromise = get_summary_documents(
      exp.synonymous_prompts,
      chroma,
      embeddingFunction
    );

    const [chunks, summaries] = await Promise.all([
      chunksPromise,
      summariesPromise,
    ]);

    ragContext = JSON.stringify([summaries, { extra_context: chunks }]);
  }

  const openai_resp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: rag2(),
      },
      {
        role: "system",
        content: ragContext,
      },
      {
        role: "user",
        content: body.question,
      },
    ],
  });

  const queryResponse: UserPromptResponse = JSON.parse(
    openai_resp.choices[0].message.content || ""
  );

  const questionAnswer = {
    question: body.question,
    answer: queryResponse.answer,
    sources: queryResponse.source,
  };
  return new Response(
    JSON.stringify({
      questionAnswer,
    }),
    { status: 201 }
  );
}
