"use client";

import { useChat } from "@ai-sdk/react";
import { PromptInputBasic } from "./chatinput";
import { Markdown } from "./ui/markdown";
import { ChangeEvent, useEffect } from "react";
import { ChatContainer } from "./ui/chat-container";
import { Message } from "ai";
import { ToolMessage } from "./tools";

export default function Chat(props: {
  appId: string;
  initialMessages: Message[];
  isLoading?: boolean;
  topBar?: React.ReactNode;
  unsentMessage?: string;
}) {
  const { messages, handleSubmit, input, handleInputChange, status, append } =
    useChat({
      initialMessages: props.initialMessages,
      generateId: () => {
        return "cs-" + crypto.randomUUID();
      },
      sendExtraMessageFields: true,
      headers: {
        "Adorable-App-Id": props.appId,
      },
      api: (() => {
        // ALWAYS use Claude Code for premium website generation
        const apiRoute = "/api/chat-claude-code";
        console.log(`[Chat] Using API route: ${apiRoute} (Claude Code ALWAYS enabled)`);
        return apiRoute;
      })(),
      experimental_prepareRequestBody: (request) => {
        const lastMessage = request.messages.at(-1) ?? null;
        return {
          message: lastMessage,
          threadId: props.appId,
          resourceId: props.appId,
        };
      },
    });

  useEffect(() => {
    const url = new URL(window.location.href);
    const unsentMessageRaw = url.searchParams.get("unsentMessage");
    url.searchParams.delete("unsentMessage");

    const unsentMessage = unsentMessageRaw
      ? decodeURIComponent(unsentMessageRaw)
      : null;

    if (unsentMessage) {
      window.history.replaceState(undefined, "", url.toString());

      append({
        content: unsentMessage,
        role: "user",
      });
    }
  });

  const onValueChange = (value: string) => {
    handleInputChange({
      target: { value },
    } as ChangeEvent<HTMLTextAreaElement>);
  };

  const onSubmit = (e?: Event) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    handleSubmit(e);
  };

  return (
    <div
      className="flex flex-col h-full bg-black"
      style={{ transform: "translateZ(0)" }}
    >
      {props.topBar}
      <div
        className="flex-1 overflow-y-auto flex flex-col space-y-6 min-h-0"
        style={{ overflowAnchor: "auto" }}
      >
        <ChatContainer autoScroll>
          {messages.map((message) => (
            <MessageBody key={message.id} message={message} />
          ))}
        </ChatContainer>
      </div>
      <div className="flex-shrink-0 p-3 transition-all bg-black/80 backdrop-blur-sm border-t border-white/10">
        <PromptInputBasic
          input={input || ""}
          onSubmit={onSubmit}
          onValueChange={onValueChange}
          isGenerating={
            props.isLoading || status === "streaming" || status === "submitted"
          }
        />
      </div>
    </div>
  );
}

function MessageBody({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end py-1 mb-4">
        <div className="gradient-card border border-white/10 rounded-xl px-4 py-2 max-w-[80%] ml-auto text-white">
          {message.content}
        </div>
      </div>
    );
  }

  if (Array.isArray(message.parts) && message.parts.length !== 0) {
    return (
      <div className="mb-4">
        {message.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <div key={index} className="mb-4">
                <Markdown className="prose prose-sm dark:prose-invert max-w-none">
                  {part.text}
                </Markdown>
              </div>
            );
          }

          if (part.type === "tool-invocation") {
            // if (
            //   part.toolInvocation.state === "result" &&
            //   part.toolInvocation.result.isError
            // ) {
            //   return (
            //     <div
            //       key={index}
            //       className="border-red-500 border text-sm text-red-800 rounded bg-red-100 px-2 py-1 mt-2 mb-4"
            //     >
            //       {part.toolInvocation.result?.content?.map(
            //         (content: { type: "text"; text: string }, i: number) => (
            //           <div key={i}>{content.text}</div>
            //         )
            //       )}
            //       {/* Unexpectedly failed while using tool{" "}
            //       {part.toolInvocation.toolName}. Please try again. again. */}
            //     </div>
            //   );
            // }

            // if (
            //   message.parts!.length - 1 == index &&
            //   part.toolInvocation.state !== "result"
            // ) {
            return (
              <ToolMessage key={index} toolInvocation={part.toolInvocation} />
            );
            // } else {
            //   return undefined;
            // }
          }
        })}
      </div>
    );
  }

  if (message.content) {
    return (
      <Markdown className="prose prose-sm dark:prose-invert max-w-none">
        {message.content}
      </Markdown>
    );
  }

  return (
    <div>
      <p className="text-gray-500">Something went wrong</p>
    </div>
  );
}
