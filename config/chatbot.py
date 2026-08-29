import re
from pathlib import Path

from django.conf import settings


def _reference_documents():
    reference_dir = Path(settings.BASE_DIR) / "ai-reference"
    if not reference_dir.exists():
        return []

    documents = []
    for path in sorted(reference_dir.rglob("*")):
        if path.is_file():
            text = path.read_text(encoding="utf-8", errors="ignore").strip()
            if text:
                documents.append((path.name, text))
    return documents


def answer_from_references(question):
    question_words = set(re.findall(r"\w+", question.lower()))
    documents = _reference_documents()
    if not documents:
        return {
            "answer": "Sumber referensi belum tersedia di folder ai-reference.",
            "sources": [],
        }

    ranked = []
    for name, text in documents:
        sentences = [
            re.sub(r"^#+\s*", "", part.strip())
            for part in re.split(r"(?<=[.!?])\s+|\n+", text)
            if part.strip()
        ]
        for sentence in sentences:
            sentence_words = set(re.findall(r"\w+", sentence.lower()))
            score = len(question_words & sentence_words)
            ranked.append((score, name, sentence))

    ranked.sort(key=lambda item: item[0], reverse=True)
    minimum_score = 2 if len(question_words) > 1 else 1
    matches = [item for item in ranked if item[0] >= minimum_score][:3]
    if not matches:
        return {
            "answer": "Maaf, saya tidak menemukan jawaban untuk pertanyaan itu di sumber referensi.",
            "sources": [name for name, _ in documents],
        }

    return {
        "answer": " ".join(item[2] for item in matches),
        "sources": sorted({item[1] for item in matches}),
    }
