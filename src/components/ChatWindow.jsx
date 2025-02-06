// components/ChatWindow.jsx
import { useEffect, useRef } from "react";
import Message from "./Message";
import Response from "./Response";

export default function ChatWindow({ messages, isDark }) {
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]); // Scroll when messages change

  return (
    <div
      ref={chatRef}
      className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth custom-scrollbar"
    >
      {messages.map((input, output, id) => (
        <div className="w-full" key={id}>
          <div className="flex justify-end" key={id}>
            <Message text={input} isDark={isDark} />
          </div>
          {output && <Response className="mt-2" htmlString={output} />}
        </div>
      ))}
    </div>
  );
}
