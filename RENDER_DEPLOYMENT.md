# Render Deployment Guide - GenAI Network Traffic Generator

This project deploys best on Render as one web service:

- React is built into `frontend/dist` during deploy
- Flask serves both the frontend and `/api/*`
- One Render URL handles the whole app

## Recommended Deployment

Use Render Blueprint so it reads [`render.yaml`](/Users/vinayaksharma/genai-project/render.yaml).

1. Push your latest code to GitHub.
2. In Render, click `New +` and choose `Blueprint`.
3. Connect this repository.
4. Render will detect the `genai-network-traffic-generator` web service.
5. Click `Apply`.

## Commands Render Should Use

Build command:

```bash
cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
```

Start command:

```bash
cd backend && gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 api:app
```

Environment variables:

```env
FLASK_ENV=production
PYTHONUNBUFFERED=1
```

## Fix For Your Current Error

Your deploy log shows Render starting this:

```bash
gunicorn your_application.wsgi
```

That is Render's default placeholder, not this app's entrypoint. Update the service settings to the commands above, then redeploy.

## Manual Setup In Render

If you do not use Blueprint, create one `Web Service` with:

- Runtime: `Python 3`
- Root Directory: blank
- Build Command: `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt`
- Start Command: `cd backend && gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 api:app`

Add:

- `FLASK_ENV=production`
- `PYTHONUNBUFFERED=1`

## Verify After Deploy

Open:

```bash
https://YOUR-SERVICE.onrender.com/
https://YOUR-SERVICE.onrender.com/api/health
```

Expected health response:

```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "genai-traffic-api"
}
```

## Troubleshooting

`ModuleNotFoundError: No module named 'your_application'`

- Cause: wrong start command
- Fix: use `cd backend && gunicorn --bind 0.0.0.0:$PORT --workers 2 --timeout 120 api:app`

`Frontend build not found`

- Cause: frontend build step did not run
- Fix: make sure the build command includes `cd frontend && npm install && npm run build`

`Blank page but API works`

- Cause: built frontend files were not present
- Fix: redeploy after a successful frontend build

`Service works locally but not on Render`

- Cause: server not listening on Render's assigned port
- Fix: keep `$PORT` in the Gunicorn command

## Relevant Files

- Blueprint config: [`render.yaml`](/Users/vinayaksharma/genai-project/render.yaml)
- Flask entrypoint: [`backend/api.py`](/Users/vinayaksharma/genai-project/backend/api.py)
- Single-service notes: [`SINGLE_WEBSITE_DEPLOYMENT.md`](/Users/vinayaksharma/genai-project/SINGLE_WEBSITE_DEPLOYMENT.md)
