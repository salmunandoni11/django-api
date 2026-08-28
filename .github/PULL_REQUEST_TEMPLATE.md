---
name: Add Docker deployment for Railway
about: Adds Dockerfile, run script, Procfile, and production deps for Railway deployment.

---

This PR prepares the repository to build and run the Django application inside a Docker container suitable for deployment on Railway. Changes included:

- Add Dockerfile for Python 3.11-slim
- Add run.sh to run migrations/collectstatic and start Gunicorn on container start
- Add Procfile for platforms that use Procfile
- Add .dockerignore
- Update requirements.txt to include production dependencies: gunicorn, dj-database-url, psycopg2-binary, whitenoise

How to test locally
1. docker build -t django-api .
2. docker run --rm -e SECRET_KEY="test" -e DEBUG="True" -e PORT=8000 -p 8000:8000 django-api

Notes
- Ensure config.settings reads SECRET_KEY, DEBUG, ALLOWED_HOSTS from env and uses dj-database-url to parse DATABASE_URL.
- Do not commit .env with secrets; add them via Railway UI.
