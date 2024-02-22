export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const questionAnswer = {
    question: searchParams.get("question") || "",
    answer: "Hej jag är en bot",
    sources: ["www.dssd.sa", "dssa.ss.se"],
  };
  return new Response(
    JSON.stringify({
      message: "Hello, world!",
    }),
    { status: 200 }
  );
}
