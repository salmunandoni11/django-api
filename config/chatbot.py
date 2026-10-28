import re
from pathlib import Path
from django.conf import settings
from django.db.models import Q
from courses.models import Course

def _reference_documents():
    reference_dir = Path(settings.BASE_DIR) / "ai-reference"
    if not reference_dir.exists():
        return []

    documents = []
    for path in sorted(reference_dir.rglob("*")):
        if path.is_file():
            try:
                text = path.read_text(encoding="utf-8", errors="ignore").strip()
                if text:
                    documents.append((path.name, text))
            except Exception:
                continue
    return documents

def get_suggestions(question):
    """Provide relevant follow-up questions based on the current conversation context."""
    q = question.lower()
    
    # Main Menu / Greeting
    greetings = {"halo", "hai", "hello", "pagi", "siang", "malam", "apa kabar"}
    if any(word in q for word in greetings) or not q:
        return ["Metode Pembayaran", "Lokasi Kursus", "Informasi Umum", "Daftar Kursus"]

    # Payment Related
    pay_keywords = {"bayar", "pembayaran", "biaya", "harga", "transfer", "qris", "cicilan"}
    if any(word in q for word in pay_keywords):
        return ["Lokasi Kursus", "Cara Pendaftaran", "Informasi Umum", "Kembali ke Menu Utama"]

    # Location Related
    loc_keywords = {"lokasi", "alamat", "kantor", "dimana", "tempat", "surabaya", "jakarta"}
    if any(word in q for word in loc_keywords):
        return ["Metode Pembayaran", "Jam Operasional", "Informasi Umum", "Kembali ke Menu Utama"]

    # Course/General Related
    course_keywords = {"kursus", "belajar", "materi", "kelas", "level", "kategori", "tersedia", "info", "umum"}
    if any(word in q for word in course_keywords):
        return ["Metode Pembayaran", "Lokasi Kursus", "Cara Pendaftaran", "Kembali ke Menu Utama"]

    # Documentation / Guide Related
    guide_keywords = {"cara", "panduan", "tutorial", "penggunaan", "akun", "daftar"}
    if any(word in q for word in guide_keywords):
        return ["Metode Pembayaran", "Lokasi Kursus", "Hubungi Admin", "Kembali ke Menu Utama"]

    # Default suggestions
    return ["Metode Pembayaran", "Lokasi Kursus", "Daftar Kursus", "Hubungi Admin"]

def answer_from_courses(question):
    """Search for courses in the database based on the question keywords."""
    question_words = re.findall(r"\w+", question.lower())
    if not question_words:
        return None

    q_objects = Q()
    for word in question_words:
        q_objects |= Q(title__icontains=word)
        q_objects |= Q(category__icontains=word)
        q_objects |= Q(instructor__icontains=word)
        q_objects |= Q(description__icontains=word)

    courses = Course.objects.filter(q_objects, is_published=True)[:3]
    
    if not courses:
        return None

    course_info = []
    for course in courses:
        info = (f"- {course.title} ({course.category}, Level: {course.level}): "
                f"{course.description[:100]}... Harga: Rp{course.price}, Durasi: {course.duration}")
        course_info.append(info)

    return {
        "answer": "Berikut adalah kursus yang relevan:\n" + "\n".join(course_info),
        "sources": ["Database Kursus"],
    }

def answer_from_references(question):
    question_lower = question.lower()
    question_words = set(re.findall(r"\w+", question_lower))
    
    # Get suggestions based on the current question
    suggestions = get_suggestions(question_lower)
    
    # 1. Search in reference documents FIRST
    documents = _reference_documents()
    if documents:
        ranked = []
        for name, text in documents:
            # Split by ## (Major Sections) instead of simple newlines to keep context together
            sections = re.split(r"(?=##\s*\d+\.\s*)", text)
            for section in sections:
                section = section.strip()
                if not section:
                    continue
                
                section_words = set(re.findall(r"\w+", section.lower()))
                score = len(question_words & section_words)
                if score > 0:
                    ranked.append((score, name, section))

        ranked.sort(key=lambda item: item[0], reverse=True)
        
        minimum_score = 1 if len(question_words) <= 2 else 2
        
        if ranked and ranked[0][0] >= minimum_score:
            best_match = ranked[0]
            clean_answer = re.sub(r"^##\s*\d+\.\s*", "", best_match[2]).strip()
            clean_answer = re.sub(r"^###\s*", "", clean_answer, flags=re.MULTILINE)
            
            return {
                "answer": clean_answer,
                "sources": [best_match[1]],
                "suggestions": suggestions,
            }

    # 2. Try searching for course-specific information in Database
    course_keywords = {"kursus", "belajar", "materi", "kelas", "harga", "level", "kategori", "tersedia"}
    if any(word in question_words for word in course_keywords):
        course_answer = answer_from_courses(question)
        if course_answer:
            return {**course_answer, "suggestions": suggestions}

    # 3. Handle greetings or no results
    greetings = {"halo", "hai", "hello", "pagi", "siang", "malam", "apa kabar"}
    if any(word in question_words for word in greetings):
        return {
            "answer": "Halo! Saya asisten Kursus Studio. Ada yang bisa saya bantu mengenai aplikasi atau kursus kami?",
            "sources": [],
            "suggestions": suggestions,
        }
        
    return {
        "answer": "Maaf, saya tidak menemukan jawaban yang tepat untuk pertanyaan itu. Coba gunakan kata kunci lain seperti 'lokasi', 'pembayaran', atau tanya tentang kursus yang tersedia.",
        "sources": [],
        "suggestions": suggestions,
    }


