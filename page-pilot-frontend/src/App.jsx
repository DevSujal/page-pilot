// App.jsx
import { useState } from "react";
import axios from "axios";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import InputArea from "./components/InputArea";
import ThemeToggle from "./components/ThemeToggle";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isDark, setIsDark] = useState(true);

  // Updated handleResponse function using axios
  const handleResponse = async (query, url) => {
    try {
      const response = await axios.post(url, {
        session_id: "1", // use actual session id here
        query: query,
      });
      return response.data.answer;
    } catch (error) {
      console.error(error);
      return "Error fetching answer";
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) {
      return;
    }
    const newMessage = {
      id: Date.now(),
      query: inputText,
      response: "",
    };
    setMessages([...messages, newMessage]);
    setInputText("");

    // Simulate a response from the llm
    const response = await handleResponse(inputText, "http://127.0.0.1:5000/query");
    setMessages((prevMessages) =>
      prevMessages.map((message) => {
        if (message.id === newMessage.id) {
          return { ...message, response };
        }
        return message;
      })
    );
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
