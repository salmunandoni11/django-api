from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

from .chatbot import answer_from_references


def api_home(request):
    return JsonResponse({
        "name": "Kursus Studio API",
        "status": "ok",
        "courses": "/api/courses/",
        "admin": "/admin/",
    })


@csrf_exempt
def chat(request):
    if request.method != "POST":
        return JsonResponse({"error": "Gunakan method POST."}, status=405)

    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Body harus berupa JSON yang valid."}, status=400)

    question = str(payload.get("question", "")).strip()
    if not question:
        return JsonResponse({"error": "Pertanyaan wajib diisi."}, status=400)

    return JsonResponse(answer_from_references(question))

# ---------------------------------------------------------------------------
# Weather endpoint
# ---------------------------------------------------------------------------
def get_weather(request):
    """Return cuaca untuk kota yang diminta melalui query parameter `q`.

    Contoh request: ``/api/weather/?q=Jakarta``
    ``WEATHER_API_KEY`` di‑load otomatis dari ``settings`` yang membaca
    ``.env``.
    """
    from django.conf import settings
    import requests

    city = request.GET.get("q")
    if not city:
        return JsonResponse({"error": "Parameter 'q' (nama kota) diperlukan"}, status=400)

    if not getattr(settings, "WEATHER_API_KEY", None):
        return JsonResponse({"error": "API key cuaca belum dikonfigurasi"}, status=500)

    params = {
        "q": city,
        "appid": settings.WEATHER_API_KEY,
        "units": request.GET.get("units", "metric"),
    }
    try:
        resp = requests.get(settings.WEATHER_API_BASE_URL, params=params, timeout=5)
        resp.raise_for_status()
    except Exception as exc:
        return JsonResponse({"error": f"Gagal memanggil layanan cuaca: {exc}"}, status=502)

    data = resp.json()
    # Pilih beberapa field yang penting bagi klien
    result = {
        "city": data.get("name"),
        "temperature": data.get("main", {}).get("temp"),
        "description": data.get("weather", [{}])[0].get("description"),
        "humidity": data.get("main", {}).get("humidity"),
        "wind_speed": data.get("wind", {}).get("speed"),
    }
    return JsonResponse(result)
