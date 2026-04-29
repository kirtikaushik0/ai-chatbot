import { useState, useRef, useEffect } from "react";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      id: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", content: trimmed, id: Date.now() };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to get response.");

      setMessages((prev) => [...prev, { ...data.message, id: Date.now() }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: "assistant",
      content: "Chat cleared! Start a new conversation.",
      id: Date.now(),
    }]);
    setError(null);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <div className="logo">⚡</div>
          <div>
            <div className="title">AI<span>Chat</span></div>
            <div className="status">● online</div>
          </div>
        </div>
        <button className="clear-btn" onClick={clearChat}>↺ Clear</button>
      </header>

      <main className="chat-container">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="avatar">{msg.role === "user" ? "👤" : "⚡"}</div>
            <div className="bubble">
              <div className="role">{msg.role === "user" ? "You" : "Assistant"}</div>
              <div className="content">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant">
            <div className="avatar">⚡</div>
            <div className="bubble">
              <div className="role">Assistant</div>
              <div className="typing">
                <span/><span/><span/>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="error-banner">
            ⚠ {error}
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="input-area">
        <div className="input-box">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send)"
            rows={1}
            disabled={isLoading}
          />
          <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            ➤
          </button>
        </div>
        <p className="hint">Powered by OpenAI · Enter to send</p>
      </footer>
    </div>
  );
}

export default App;