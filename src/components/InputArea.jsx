// components/InputArea.jsx
export default function InputArea({
  inputText,
  setInputText,
  handleSend,
  isDark,
}) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={`p-4 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-t"
      }`}
    >
      <div className="flex space-x-2">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          className={`flex-1 p-2 border ${
            isDark
              ? "border-gray-100 text-white"
              : "border-gray-900 text-gray-900"
          } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
          rows="1"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 transform hover:scale-105 active:scale-95"
        >
          Send
        </button>
      </div>
    </div>
  );
}
