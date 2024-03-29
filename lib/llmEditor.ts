export async function edit(apiKey: string, text: string, context: string, signal?: AbortSignal) {
  console.log(`Editing text: "${text}"`);


const systemMessageContent = "You revise text to be free of spelling mistakes, have proper grammar, and error free prose while maintaining the original message, word for word, as much as possible (THIS IS IMPORTANT). You will be given text that add some point will have special tokens marked [EDIT_START] and [EDIT_END]. You must replace the text between these tokens with the revised text. You must not change the text outside of these tokens. RETURN ONLY THE REVISED TEXT DO NOT EXPLAIN YOURSELF."


  // Constructing the messages
  const systemMessage = {
    role: "system",
    content: systemMessageContent,
  };

  const userMessageContent = `Return revised version of the text in between [EDIT_START] and [EDIT_END]. DO NOT WRITE THESE TOKENS IN THE OUTPUT:

  ${context}[EDIT_START]${text}[EDIT_END]`;

  const userMessage = {
    role: "user",
    content: userMessageContent,
  };

  const messages = [systemMessage, userMessage];

  const model = "gpt-3.5-turbo";
  const body = {
    model: model,
    messages: messages,
    temperature: 0.1,
    stream: false,
    max_tokens: 1000,
  };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  const json = await resp.json();
  let message = json.choices[0].message.content;

  // if context is at start of the message, replace it with empty string
  const contextRegex = new RegExp(`^${context}`);
  message = message.replace(contextRegex, "");
  
  return message;
}
