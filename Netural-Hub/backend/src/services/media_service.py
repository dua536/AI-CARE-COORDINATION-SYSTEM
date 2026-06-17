import os
import io
import re
import pdfplumber
from src.worker import process_document
from src.db import db

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def clean_text(text: str) -> str:
    """PostgreSQL ke liye invalid characters hatao"""
    if not text:
        return ""
    text = text.replace("\x00", "")
    text = "".join(ch for ch in text if ch == "\n" or ch == "\t" or ord(ch) >= 32)
    return text


def extract_text_from_pdf(content: bytes) -> str:
    """pdfplumber se text + tables properly extract karo, current result ko explicitly highlight karo"""
    output_parts = []

    with pdfplumber.open(io.BytesIO(content)) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            # 1️⃣ Normal page text
            page_text = page.extract_text() or ""
            if page_text.strip():
                output_parts.append(page_text)

            # 2️⃣ Tables — clean columns only
            tables = page.extract_tables()
            for t_idx, table in enumerate(tables, start=1):
                if not table or len(table) < 2:
                    continue

                headers = [str(h).strip() if h else f"col{i}" for i, h in enumerate(table[0])]
                output_parts.append(f"\n--- TABLE {t_idx} (Page {page_num}) ---")

                for row in table[1:]:
                    row_parts = []
                    for header, cell in zip(headers, row):
                        cell_value = str(cell).strip() if cell else ""
                        # ✅ Sirf chote/clean values use karo (lambi messy strings skip)
                        if header and cell_value and len(cell_value) < 50:
                            row_parts.append(f"{header}: {cell_value}")
                    if row_parts:
                        output_parts.append(" | ".join(row_parts))

                # 3️⃣ ✅ Explicit "Current Result" highlight banao
                # Header mein "Current Result" wala column dhundo, uski value nikalo
                current_col_idx = None
                for idx, h in enumerate(headers):
                    if h and "current" in h.lower():
                        current_col_idx = idx
                        break

                if current_col_idx is not None:
                    for row in table[1:]:
                        if current_col_idx < len(row) and row[current_col_idx]:
                            current_val = str(row[current_col_idx]).strip()
                            if current_val and len(current_val) < 20:
                                output_parts.append(
                                    f"\nIMPORTANT — VERIFIED CURRENT RESULT: {current_val}"
                                )

    return "\n".join(output_parts)


def extract_text(filename: str, content: bytes) -> str:
    ext = filename.split(".")[-1].lower()

    if ext == "pdf":
        try:
            text = extract_text_from_pdf(content)
            return clean_text(text)
        except Exception as e:
            print(f"PDF extract error: {e}")
            return ""

    elif ext in ["txt"]:
        return clean_text(content.decode("utf-8", errors="ignore"))

    else:
        return clean_text(content.decode("utf-8", errors="ignore"))


async def save_file(file) -> dict:
    content = await file.read()
    text_content = extract_text(file.filename, content)

    if not text_content.strip():
        return {"error": "Could not extract text from this file. Try a TXT file instead."}

    document = await db.document.create(
        data={
            "fileName": file.filename,
            "content": text_content,
        }
    )

    file_path = os.path.join(UPLOAD_DIR, f"{document.id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(content)

    await process_document(text_content)

    return {
        "file_id": document.id,
        "filename": file.filename,
        "file_path": file_path,
        "status": "processed"
    }


async def list_files() -> list:
    documents = await db.document.find_many()
    return [
        {
            "file_id": doc.id,
            "filename": doc.fileName,
            "createdAt": doc.createdAt
        }
        for doc in documents
    ]


async def delete_file(file_id: str) -> dict:
    document = await db.document.find_unique(where={"id": file_id})
    if not document:
        return {"error": "File not found"}

    file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{document.fileName}")
    if os.path.exists(file_path):
        os.remove(file_path)

    await db.document.delete(where={"id": file_id})
    return {"message": "File deleted successfully"}