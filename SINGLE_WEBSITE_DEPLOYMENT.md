# Single-Website Deployment on Render

This guide deploys both frontend and backend as a **single website** on Render.

## How It Works

- **Frontend (React)** is built into `frontend/dist/`
- **Backend (Flask)** serves static files from `frontend/dist/` and API routes from `/api/*`
- **Single domain** for entire application
- **Simpler setup** - only one service needed

---

## Deployment Steps

### 1. Build Frontend Locally

```bash
cd frontend
npm install
npm run build
```

This creates `frontend/dist/` with all production files.

### 2. Push to GitHub

```bash
git add .
git commit -m "Build frontend for single-website deployment"
git push origin main
```

### 3. Create Service on Render

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository (`GenAi-Network-Traffic-Generator`)

### 4. Configure Web Service

Set these values:

| Field | Value |
|-------|-------|
| **Name** | `genai-network-traffic-generator` |
| **Runtime** | Python 3 |
| **Build Command** | `cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt` |
| **Start Command** | `cd backend && gunicorn --bind 0.0.0.0:10000 --workers 2 --timeout 120 api:app` |
| **Plan** | Free (or Standard for production) |

### 5. Add Environment Variables

In Render dashboard → Web Service → Environment:

```
FLASK_ENV=production
PYTHONUNBUFFERED=1
```

### 6. Deploy

Click **"Create Web Service"** and wait (10-15 minutes for first build).

Once deployed, your app will be live at the Render URL (e.g., `https://genai-network-traffic-generator.onrender.com`).

---

## URL Structure

- **Frontend**: `https://your-app.onrender.com/`
- **Dashboard**: `https://your-app.onrender.com/`
- **API**: `https://your-app.onrender.com/api/health`
- **API Traffic**: `https://your-app.onrender.com/api/traffic/start`

All on the **same domain**! ✨

---

## Local Testing

Before deploying, test locally:

```bash
# Build frontend
cd frontend
npm run build

# Run backend serving frontend
cd ../backend
pip install -r requirements.txt
python api.py
```

Then visit `http://localhost:5000/` - you should see the dashboard!

---

## Troubleshooting

### Build fails with "npm not found"
- Render's Python images include Node.js
- If issue persists, use `node --version` in build logs

### Frontend not loading
- Check that `frontend/dist/` exists after build
- Verify build command runs `npm run build`

### API not working
- Check Render logs for Python errors
- Ensure environment variables are set
- Verify backend is running on correct port

### Pages blank
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors (F12)

---

## Advantages of Single-Website Deployment

✅ **Simpler setup** - One service instead of two  
✅ **Lower cost** - One service = no extra fees  
✅ **Better UX** - No CORS issues, same domain  
✅ **Easier maintenance** - One URL to monitor  
✅ **Faster** - No cross-domain requests  

---

## Switching Back to Separate Deployment

If you need separate frontend/backend later:

1. Remove static file routes from `backend/api.py`
2. Deploy frontend as Static Site
3. Update `VITE_API_URL` to backend service URL

See `RENDER_DEPLOYMENT.md` for separate deployment guide.
