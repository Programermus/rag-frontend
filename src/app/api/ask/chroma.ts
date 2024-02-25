import { ChromaClient, OpenAIEmbeddingFunction, IncludeEnum } from "chromadb";

async function get_chunked_documents(
  queries: string[],
  client: ChromaClient,
  openaiEf: OpenAIEmbeddingFunction
) {
  const collection = client.getCollection({
    name: "lund_rasmus_chunks",
    embeddingFunction: openaiEf,
  });
  const chunked_docs = [];
  const encountered_ids = new Set();
  const responses = await (
    await collection
  ).query({
    queryTexts: queries,
    nResults: 5,
  });
  for (let i = 0; i < responses.metadatas.length; i++) {
    const metadata = responses.metadatas[i];
    const document = responses.documents[i];
    const id_list = responses.ids[i];
    const id = id_list[0];

    const source = metadata[0]?.source;
    const prompt_id = metadata[0]?.prompt_id;

    const doc = document[0];

    if (encountered_ids.has(id)) {
      continue;
    } else {
      encountered_ids.add(id);
    }

    const new_dict = {
      //id: id,
      source: source,
      //prompt_id: prompt_id,
      document: doc,
    };
    chunked_docs.push(new_dict);
  }

  return chunked_docs;
}

async function get_summary_documents(
  queries: string[],
  client: ChromaClient,
  openaiEf: OpenAIEmbeddingFunction
) {
  const collection = await client.getCollection({
    name: "lund_rasmus",
    embeddingFunction: openaiEf,
  });

  const responses = await collection.query({
    queryTexts: queries,
    nResults: 1,
    include: ["documents", "metadatas"] as IncludeEnum[],
  });

  const documents = [];
  const encounteredIds = new Set();
  for (let i = 0; i < responses.metadatas.length; i++) {
    const metadata = responses.metadatas[i];
    const document = responses.documents[i];
    const idList = responses.ids[i];

    const category = metadata[0]?.category;
    const source = metadata[0]?.source;
    const title = metadata[0]?.title;
    const summary = document[0];
    const idValue = idList[0];

    if (encounteredIds.has(idValue)) {
      continue;
    } else {
      encounteredIds.add(idValue);
    }

    const newDict = {
      //category: category,
      source: source,
      //title: title,
      document: summary,
      //id: idValue,
    };
    documents.push(newDict);
  }

  return documents;
}

export { get_chunked_documents, get_summary_documents };
