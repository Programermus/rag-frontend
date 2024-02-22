export async function POST(req: Request) {
  const body = await req.json();
  const questionAnswer = {
    question: body.question,
    answer: "Hej jag är en bot",
    sources: ["www.dssd.sa", "dssa.ss.se"],
  };
  return new Response(
    JSON.stringify({
      questionAnswer,
    }),
    { status: 201 }
  );
}
