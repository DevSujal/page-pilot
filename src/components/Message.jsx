// components/Message.jsx
import { useEffect, useRef } from "react";

export default function Message({ text, isDark }) {
  const messageRef = useRef(null);

  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.classList.add("animate-slide-in");
    }
  }, []);

  return (
    <div
      ref={messageRef}
      className={`max-w-xs lg:max-w-md p-3 rounded-lg rounded-tr-none ${
        isDark ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      } shadow`}
    >
      {console.log("isDark", isDark)}
      <div className="max-w-xs lg:max-w-md p-1 transition-all duration-200 transform hover:scale-105">
        <p className="break-words">{text}</p>
      </div>
    </div>
  );
}
