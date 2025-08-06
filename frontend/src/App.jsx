import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamedText, setStreamedText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedText]);

  // Simulate streaming by splitting the response and updating state
  const streamResponse = (fullText) => {
    setStreamedText("");
    let i = 0;
    const interval = setInterval(() => {
      setStreamedText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) {
        clearInterval(interval);
        setMessages((msgs) => [...msgs, { sender: "bot", text: fullText }]);
        setStreamedText("");
        setLoading(false);
      }
    }, 10); // speed of streaming
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((msgs) => [...msgs, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    setStreamedText("");

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_message: userMsg }),
      });
      let data;
      try {
        data = await res.json();
      } catch {
        const text = await res.text();
        setMessages((msgs) => [
          ...msgs,
          { sender: "bot", text: "Error: Invalid JSON response. " + text },
        ]);
        setLoading(false);
        return;
      }
      if (res.ok && data.response) {
        // Simulate streaming
        streamResponse(data.response);
      } else if (data.detail) {
        setMessages((msgs) => [
          ...msgs,
          { sender: "bot", text: "Error: " + data.detail },
        ]);
        setLoading(false);
      } else {
        setMessages((msgs) => [
          ...msgs,
          { sender: "bot", text: "Error: Unexpected response from server." },
        ]);
        setLoading(false);
      }
    } catch (e) {
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Error: " + e.message },
      ]);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chat-root">
      <div className="chat-container">
        <header className="chat-header">
          <span role="img" aria-label="bot">🤖</span> BlueBot
        </header>
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
            >
              <div className="chat-bubble">
                {msg.sender === "bot" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          {loading && streamedText && (
            <div className="chat-message bot">
              <div className="chat-bubble">
                <ReactMarkdown>{streamedText + "|"}</ReactMarkdown>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            className="chat-input"
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            autoFocus
          />
          <button
            className="chat-send"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
      <footer className="chat-footer">
        <span>Powered by FastAPI + Gemini + React</span>
      </footer>
    </div>
  );
}

export default App;
