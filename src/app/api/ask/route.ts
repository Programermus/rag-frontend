import OpenAI from "openai";
import { ChromaClient } from "chromadb";
import { OpenAIEmbeddingFunction } from "chromadb";
import { rag2, expansion, rag } from "./prompts";
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
  sources: string[];
};

export async function POST(req: Request) {
  const body = await req.json();

  const prompt_expansion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    response_format: { type: "json_object" },
    temperature: 0.2,
    seed: 10,
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
  let exp: PromptExpansion = { synonymous_prompts: [] };

  const res = prompt_expansion.choices[0].message.content;
  if (res) {
    exp = JSON.parse(res);

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
    ragContext = JSON.stringify({
      context: [...summaries, ...chunks],
    });
  }

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: rag(),
    },
    {
      role: "system",
      content: ragContext,
    },
    {
      role: "user",
      content: body.question,
    },
  ];

  const openai_resp = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.5,
    seed: 2,
    response_format: { type: "json_object" },
    messages: messages,
  });

  console.log(openai_resp);

  const queryResponse: UserPromptResponse = JSON.parse(
    openai_resp.choices[0].message.content || ""
  );

  console.log(queryResponse);

  const questionAnswer = {
    question: body.question,
    answer: queryResponse.answer,
    sources: queryResponse.sources,
  };
  return new Response(
    JSON.stringify({
      questionAnswer,
    }),
    { status: 201 }
  );
}
