

import { useState, useEffect, useRef } from "react";
import { uploadDocument, getDocuments, deleteDocument } from "./api/api";  // ✅ deleteDocument add
import "./style.css";

export default function Upload() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileRef = useRef();

  const fetchDocs = async () => {
    try {
      const res = await getDocuments();
      setDocuments(res.data || []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (files) => {
    if (!files || files.length === 0) return;
    setError(""); setSuccess(""); setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        await uploadDocument(formData);
      }
      setSuccess(`✅ ${files.length} file(s) uploaded successfully. The RAG index will update shortly.`);
      await fetchDocs();
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Ensure the backend /documents/upload endpoint is running.");
    } finally {
      setUploading(false);
    }
  };

  // ✅ Delete handler
  const handleDelete = async (fileId, filename) => {
    if (!confirm(`Delete "${filename}"?`)) return;
    try {
      await deleteDocument(fileId);
      setSuccess(`✅ "${filename}" deleted successfully.`);
      await fetchDocs();
    } catch {
      setError("Failed to delete document.");
    }
  };

  const onFileChange = (e) => handleUpload(e.target.files);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const fileIcon = (name) => {
    const ext = (name || "").split(".").pop().toLowerCase();
    if (ext === "pdf") return "📕";
    if (["doc", "docx"].includes(ext)) return "📘";
    if (["xls", "xlsx"].includes(ext)) return "📗";
    if (["png", "jpg", "jpeg"].includes(ext)) return "🖼️";
    return "📄";
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Upload Documents 📄</h1>
        <p>Upload medical records, PDFs, and clinical documents to power the RAG knowledge base.</p>
      </div>

      {/* Dropzone */}
      <div
        className={`dropzone ${dragOver ? "active" : ""}`}
        style={{ marginBottom: 24 }}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className="dropzone-icon">{uploading ? "⏳" : "📁"}</div>
        <h3>{uploading ? "Uploading…" : "Drop files here or click to upload"}</h3>
        <p>Supports PDF, DOCX, TXT, PNG, JPG — max 20MB per file</p>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          style={{ display: "none" }}
          onChange={onFileChange}
        />
        {!uploading && (
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
          >
            Choose Files
          </button>
        )}
      </div>

      {success && <div className="success-msg">{success}</div>}
      {error && <div className="error-msg">{error}</div>}

      {/* RAG Info Banner */}
      <div style={{ background: "var(--primary-light)", border: "1px solid #b6ddd6", borderRadius: 10, padding: "14px 18px", marginBottom: 24, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <span style={{ fontSize: 22 }}>🧠</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: "var(--primary-dark)" }}>How RAG works</p>
          <p style={{ fontSize: 13, color: "var(--primary-dark)", marginTop: 2 }}>
            Uploaded documents are automatically chunked, embedded, and stored in a vector database. When you ask the Medical AI a question, it retrieves the most relevant document chunks and sends them to the LLM alongside your query to produce grounded, accurate responses.
          </p>
        </div>
      </div>

      {/* Documents list */}
      <div className="card">
        <div className="section-header">
          <span className="card-title">Uploaded Documents ({documents.length})</span>
          <button className="btn btn-sm btn-outline" onClick={fetchDocs}>🔄 Refresh</button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /> Loading documents…</div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No documents yet</h3>
            <p>Upload documents above to build the AI knowledge base.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>File</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                  <th>RAG Status</th>
                  <th>Action</th>  {/* ✅ New column */}
                </tr>
              </thead>
              <tbody>
                {documents.map((d, i) => (
                  <tr key={d.file_id || i}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{fileIcon(d.filename)}</span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{d.filename}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{(d.filename || "").split(".").pop().toUpperCase()}</td>
                    <td style={{ fontSize: 13 }}>{formatSize(d.size)}</td>
                    <td style={{ fontSize: 13, color: "var(--text-muted)" }}>
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <span className="badge badge-success">✓ Indexed</span>
                    </td>
                    <td>  {/* ✅ Delete button */}
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(d.file_id, d.filename)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}