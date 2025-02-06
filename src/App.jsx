// App.jsx
import { useState } from "react";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import InputArea from "./components/InputArea";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  const [messages, setMessages] = useState([{}]);
  const [inputText, setInputText] = useState("");
  const [isDark, setIsDark] = useState(true);

  const handleResponse = () => {
    
  }

  const handleSend = () => {
    if (!inputText.trim()) {
      return;
    }
    const newMessage = {
      id: Date.now(),
      input: inputText,
      sender: "user",
    };
    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate a response from the llm


  };

  return (
    <div
      className={`flex flex-col h-screen w-full ${
        isDark ? "dark bg-gray-900" : "bg-gray-100"
      }`}
    >
      <Header isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
      <ChatWindow messages={messages} isDark={isDark} />
      <InputArea
        inputText={inputText}
        setInputText={setInputText}
        handleSend={handleSend}
        isDark={isDark}
      />
    </div>
  );
}

export default App;
