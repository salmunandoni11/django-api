# Kursus Studio

Aplikasi katalog kursus dengan backend Django REST Framework, SQLite, dan frontend React + Vite.

## Menjalankan backend

```powershell
C:/Users/lenovo/AppData/Local/Python/pythoncore-3.14-64/python.exe -m pip install -r requirements.txt
C:/Users/lenovo/AppData/Local/Python/pythoncore-3.14-64/python.exe manage.py migrate
C:/Users/lenovo/AppData/Local/Python/pythoncore-3.14-64/python.exe manage.py runserver
```

API tersedia di `http://127.0.0.1:8000/api/courses/`.

| Method | URL | Kegunaan |
| --- | --- | --- |
| GET | `/api/courses/` | Daftar kursus; dukung `?search=` |
| POST | `/api/courses/` | Membuat kursus |
| GET | `/api/courses/{id}/` | Detail kursus |
| PUT | `/api/courses/{id}/` | Mengganti seluruh data kursus |
| PATCH | `/api/courses/{id}/` | Mengubah sebagian data, misalnya `is_published` |
| DELETE | `/api/courses/{id}/` | Menghapus kursus |

## Menjalankan frontend

```powershell
cd frontend
npm install
npm run dev
```

Buka `http://localhost:5173`. URL API dapat diganti dengan environment variable `VITE_API_URL`.

## Model Course

`title`, `slug`, `description`, `instructor`, `category`, `level`, `duration`, `price`, `image_url`, dan `is_published`. Admin Django tersedia di `/admin/` setelah membuat superuser dengan `manage.py createsuperuser`.
