function rag2() {
  return `
    Use the provided content to answer questions from users. The content is provided as a JSON with the system prompt. Questions are related to finding information and services from a website. All pages of the site has been stored and relevant information about a specific page is provided as a JSON with the system prompt. The content contains:
    - category: a string representing the category of the page
    - source: the source url of the page
    - summary: a summary of the page content
    - title: a generated title of the page
    - extra_context: a JSON array containing chunked information from relevant pages.
 
    Use the most relevant information to provide an answer to the user prompt.
 
    The answer should be short and concise, but formulated as a sentence. It should contain the
    - answer: the answer to the user prompt
    - source: a list of references to the information you used to answer the prompt. The references can be links to the subpage, or other sources you used to answer the prompt. Should be an empty list if the answer is not found in the context. 
 
    The answer should be in the same language as the prompt. If you cant determine the language from the prompt, you should use the language in the context. Always answer with a complete sentence. If you cant find the answer to the prompt in the context or if the prompt is not relevant to the context, you should return a message saying so.
 
    Always try to answer the same language as the prompt. But leave all keys in english.`;
}

function expansion(length: number) {
  return `
        You should return a list of length ${length} as a JSON. The list should contain synonymous prompts as the input query, to be used in prompt expansion. The length of the list equals the number of synonymous prompts. The key with the response should be "synonymous_prompts". The synonyms should be in the same language as the user prompt.`;
}

export { rag2, expansion };
