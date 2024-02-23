"use client";
import { Button, Input, Typography, Spinner } from "@material-tailwind/react";
import React from "react";
import { QuestionAnswer } from "../types/questionAnswer";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";

const fetcher = (url: string, { arg }: { arg: { question: string } }) =>
  fetch(url, {
    method: "POST",
    body: JSON.stringify(arg),
  })
    .then((res) => res.json())
    .catch((error) => {
      console.error("Error:", error);
    });

export default function Home() {
  const [question, setQuestion] = React.useState("");
  const { isMutating, trigger, error } = useSWRMutation("/api/ask", fetcher);
  const [questionAnswer, setQuestionAnswer] = React.useState<QuestionAnswer>({
    question: "",
    answer: "",
    sources: [],
  });

  const onClick = async () => {
    const data = await trigger({ question });
    setQuestionAnswer(data.questionAnswer);
    setQuestion("");
    console.log(data);
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setQuestion(event.target.value);

  return (
    <main className="flex min-h-screen items-stretch p-2">
      <div className="container mx-auto max-w-md mt-8">
        <div>
          <Typography placeholder={"Toph1"} variant="h2">
            Exempel
          </Typography>
        </div>
        <div>
          <Typography placeholder={"Toph1"} variant="paragraph">
            - Vad finns det för förskolor i Lund?
          </Typography>
        </div>
        <div>
          <Typography placeholder={"Toph1"} variant="paragraph">
            - Vad kan jag göra i Lund?
          </Typography>
        </div>
        <div className="mb-8">
          <Typography placeholder={"Toph1"} variant="paragraph">
            - Hur startar jag en förening?
          </Typography>
        </div>
        <div className=" mb-2">
          <Input
            type="email"
            label="Ställ din fråga"
            value={question}
            onChange={onChange}
            crossOrigin={"anonymous"}
          />
        </div>
        <div>
          <Button
            size="sm"
            color={question ? "gray" : "blue-gray"}
            disabled={!question || isMutating}
            className="top-1 rounded"
            placeholder={"Fråga"}
            fullWidth
            onClick={onClick}
          >
            SKICKA
          </Button>
        </div>
        <div className="mb-2 mt-8">
          {isMutating ? (
            <Spinner />
          ) : (
            questionAnswer.answer && (
              <div>
                <div>
                  <Typography placeholder={"Toph1"} variant="paragraph">
                    - {questionAnswer.question}
                  </Typography>
                </div>
                <hr className="h-px my-4 bg-gray-400 border-0" />

                <Typography placeholder={"Toph1"} variant="paragraph">
                  {questionAnswer.answer}
                </Typography>
                <div className="mt-2 text-right">
                  {questionAnswer.sources.map((source, index) => {
                    return (
                      <a
                        href={source}
                        key={index}
                        className="block font-sans text-base antialiased font-normal leading-relaxed transition-colors text-blue-gray-900 hover:text-blue-500 focus:text-blue-500"
                      >
                        <Typography placeholder={"listitem"} variant="small">
                          {source}
                        </Typography>
                      </a>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </main>
  );
}
