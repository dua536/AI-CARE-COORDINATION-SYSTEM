import { useState, useRef, useEffect } from "react";
import { askMedicalAI, getPatients, getCarePlan } from "./api/api";
import "./style.css";

const SUGGESTIONS = [
  "What is the recommended treatment for Type 2 Diabetes?",
  "Generate a care plan for a hypertensive patient aged 55",
  "What are early signs of cardiac arrhythmia?",
  "Summarize medication interactions for metformin",
];

const MOCK_PATIENTS = [
  { id: 1, name: "Ahmed Khan" },
  { id: 2, name: "Sara Ali" },
  { id: 3, name: "Omar Sheikh" },
];

export default function MedicalAI() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your AI medical assistant powered by RAG. I can answer clinical questions, generate care plans, and summarize medical records. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [carePlan, setCarePlan] = useState(null);
  const [carePlanLoading, setCarePlanLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    getPatients()
      .then((r) => setPatients(r.data || []))
      .catch(() => setPatients(MOCK_PATIENTS));
  }, []);

  const sendMessage = async (text) => {
    const q = text || input.trim();
    if (!q) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await askMedicalAI({
        question: q,
        patient_id: selectedPatient || null,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            res.data.ai_response ||
            res.data.answer ||
            res.data.response ||
            "No response received.",
        },
      ]);
    } catch (err) {
      const detail =
        err?.response?.data?.detail || err?.message || "Unknown error";
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: `⚠️ Request failed: ${detail}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateCarePlan = async () => {
    if (!selectedPatient) return alert("Please select a patient first.");
    setCarePlanLoading(true);
    setCarePlan(null);
    try {
      const res = await getCarePlan(selectedPatient);
      setCarePlan(res.data);
    } catch (err) {
      const detail =
        err?.response?.data?.detail || err?.message || "Unknown error";
      setCarePlan({
        error: true,
        message: `⚠️ Care plan failed: ${detail}`,
      });
    } finally {
      setCarePlanLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Medical AI Assistant 🤖</h1>
        <p>
          RAG-powered clinical intelligence — ask questions, get care plans, and
          summarize records.
        </p>
      </div>

      <div className="two-col" style={{ alignItems: "start" }}>
        {/* Chat */}
        <div
          className="card"
          style={{ display: "flex", flexDirection: "column", height: 600 }}
        >
          <div className="section-header">
            <span className="card-title">Clinical Chat</span>
            <select
              className="form-select"
              style={{ maxWidth: 200, fontSize: 13 }}
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
            >
              <option value="">No patient selected</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="chat-window" style={{ flex: 1 }}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.role}`}>
                <div className="chat-avatar">{m.role === "ai" ? "🤖" : "👤"}</div>
                <div
                  className="chat-bubble"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-message ai">
                <div className="chat-avatar">🤖</div>
                <div
                  className="chat-bubble"
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    color: "var(--text-muted)",
                  }}
                >
                  <div className="spinner" /> Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row" style={{ marginTop: 0 }}>
            <input
              className="form-input"
              placeholder="Ask a clinical question…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Suggestions */}
          <div className="card">
            <span className="card-title">💡 Suggested Questions</span>
            <div
              style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}
            >
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="btn btn-outline btn-sm"
                  style={{ justifyContent: "flex-start", textAlign: "left" }}
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Care Plan Generator */}
          <div className="card">
            <span className="card-title">📋 Care Plan Generator</span>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-muted)",
                marginBottom: 12,
                marginTop: 4,
              }}
            >
              Select a patient above and generate an AI-powered care plan from
              their records.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={generateCarePlan}
              disabled={carePlanLoading || !selectedPatient}
            >
              {carePlanLoading ? "Generating…" : "⚡ Generate Care Plan"}
            </button>

            {carePlan && (
              <div style={{ marginTop: 14 }}>
                {carePlan.error ? (
                  <div className="error-msg">{carePlan.message}</div>
                ) : (
                  <div
                    style={{
                      background: "#f9fafb",
                      borderRadius: 8,
                      padding: 14,
                      fontSize: 13,
                      lineHeight: 1.7,
                      whiteSpace: "pre-wrap",
                      border: "1px solid var(--border)",
                    }}
                  >
                    {carePlan.care_plan ||
                      carePlan.plan ||
                      JSON.stringify(carePlan, null, 2)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}