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
  const [selectedLanguage, setSelectedLanguage] = useState("Python");
  const messagesEndRef = useRef(null);

  const languages = [
    { code: "Python", name: "Python", icon: "🐍" },
    { code: "JavaScript", name: "JavaScript", icon: "🟨" },
    { code: "TypeScript", name: "TypeScript", icon: "🔷" },
    { code: "Java", name: "Java", icon: "☕" },
    { code: "C++", name: "C++", icon: "⚡" },
    { code: "C#", name: "C#", icon: "💜" },
    { code: "Go", name: "Go", icon: "🔵" },
    { code: "Rust", name: "Rust", icon: "🦀" },
    { code: "PHP", name: "PHP", icon: "🐘" },
    { code: "Ruby", name: "Ruby", icon: "💎" },
    { code: "Swift", name: "Swift", icon: "🍎" },
    { code: "Kotlin", name: "Kotlin", icon: "🟠" },
    { code: "Scala", name: "Scala", icon: "🔴" },
    { code: "R", name: "R", icon: "📊" },
    { code: "MATLAB", name: "MATLAB", icon: "🧮" },
    { code: "SQL", name: "SQL", icon: "🗄️" },
    { code: "HTML", name: "HTML", icon: "🌐" },
    { code: "CSS", name: "CSS", icon: "🎨" },
    { code: "Bash", name: "Bash", icon: "💻" },
    { code: "PowerShell", name: "PowerShell", icon: "🔧" }
  ];

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
    }, 5); // faster streaming speed
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setMessages((msgs) => [...msgs, { sender: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    setStreamedText("");

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_message: userMsg,
          language: selectedLanguage 
        }),
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
          <div className="header-content">
            <div className="bot-title">
              <span role="img" aria-label="bot">🤖</span> BlueBot
            </div>
            <div className="language-selector">
              <select 
                value={selectedLanguage} 
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="language-dropdown"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.icon} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="tagline">
            Your AI companion for intelligent conversations and problem-solving! 🚀
          </div>
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
        <div className="footer-content">
          <div className="tech-stack">
            <span>Powered by FastAPI + Gemini + React</span>
          </div>
          <div className="developer-credits">
            <div className="developer-info">
              <span className="developer-name">Abdullah Malik</span>
              <span className="developer-title">Full Stack Developer & Automation Engineer</span>
            </div>
            <div className="developer-links">
              <a href="https://github.com/teeps-heisenberg" target="_blank" rel="noopener noreferrer" className="dev-link">
                <span role="img" aria-label="github">📱</span> Portfolio
              </a>
              <a href="https://www.linkedin.com/in/abdullah-malik-dev/" target="_blank" rel="noopener noreferrer" className="dev-link">
                <span role="img" aria-label="linkedin">💼</span> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
