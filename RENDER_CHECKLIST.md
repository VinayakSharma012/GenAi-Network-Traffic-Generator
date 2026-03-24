# Render Deployment Checklist

## Pre-Deployment ✅

- [x] Log download feature implemented in LogsPage
- [x] API_URL configured for environment variables
- [x] Backend requirements.txt includes gunicorn
- [x] render.yaml created with proper configuration
- [x] .env.example template created
- [x] RENDER_DEPLOYMENT.md guide created
- [x] All API calls updated to use API_URL constant
- [x] Frontend build configuration verified (Vite)
- [x] Flask API endpoints functional
- [x] CORS configuration ready for production

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Deploy to Render with log download feature"
git push origin main
```

### 2. Create Backend Service on Render
- [ ] Go to https://dashboard.render.com
- [ ] Click "New+" → "Web Service"
- [ ] Connect your GitHub repository
- [ ] Set Name: `genai-network-traffic-generator-backend`
- [ ] Set Build Command: `cd backend && pip install -r requirements.txt`
- [ ] Set Start Command: `cd backend && gunicorn --bind 0.0.0.0:10000 --workers 2 --timeout 120 api:app`
- [ ] Add env vars:
  - [ ] `FLASK_ENV=production`
  - [ ] `PYTHONUNBUFFERED=1`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 min)
- [ ] Copy backend URL: `https://genai-network-traffic-generator-backend.onrender.com`

### 3. Create Frontend Service on Render
- [ ] Go to https://dashboard.render.com
- [ ] Click "New+" → "Static Site"
- [ ] Connect your GitHub repository
- [ ] Set Name: `genai-network-traffic-generator-frontend`
- [ ] Set Build Command: `cd frontend && npm install && npm run build`
- [ ] Set Publish Directory: `frontend/dist`
- [ ] Add env var:
  - [ ] `VITE_API_URL=https://genai-network-traffic-generator-backend.onrender.com`
- [ ] Click "Create Static Site"
- [ ] Wait for build (3-5 min)
- [ ] Copy frontend URL from dashboard

## Post-Deployment Testing

### Test Backend
- [ ] Open terminal and test health endpoint:
  ```bash
  curl https://your-backend-url/api/health
  ```
  Expected: `{"status":"ok","version":"1.0.0",...}`

### Test Frontend
- [ ] Open `https://your-frontend-url` in browser
- [ ] Verify all pages load without errors
- [ ] Check Console (F12) for errors

### Test API Integration
- [ ] Go to Generator page
- [ ] Configure traffic parameters
- [ ] Click "LAUNCH TRAFFIC" button
- [ ] Verify Dashboard updates with data
- [ ] Check browser console for successful API calls

### Test Log Download Feature
- [ ] Go to Logs page
- [ ] Click "DOWNLOAD" button
- [ ] Verify file downloads as `traffic_log_YYYY-MM-DD_HH-MM-SS.txt`
- [ ] Check file content contains log lines

### Test Stop Functionality
- [ ] On Generator page, click "STOP" button
- [ ] Verify traffic generation stops
- [ ] Check backend logs for success message

## Performance Checks

- [ ] Frontend loads in < 3 seconds
- [ ] Dashboard updates every 2 seconds
- [ ] No console errors on page load
- [ ] API responses < 2 second latency
- [ ] Memory usage stable (no memory leak)

## Troubleshooting

### If Backend Shows 502 Error
1. Check Render dashboard → Backend service → Logs tab
2. Look for error messages
3. Verify PYTHONUNBUFFERED=1 is set
4. Check if Flask service crashed

### If CORS Errors in Browser
1. Verify VITE_API_URL matches actual backend URL
2. Go to Render → Frontend → Environment
3. Update VITE_API_URL if needed
4. Trigger rebuild

### If Log Download Fails
1. Check backend `/api/logs` endpoint
2. Verify `traffic_log.txt` exists on backend
3. Check browser console for fetch error
4. Verify CORS headers in backend response

### If Traffic Generation Fails
1. Check backend system resources (Free tier may be limited)
2. Verify Flask service is running
3. Check backend logs for subprocess errors
4. Ensure all Python dependencies are installed

## Post-Deployment Optimization

- [ ] Monitor backend logs for errors
- [ ] Check frontend build size (should be < 500KB)
- [ ] Set up error tracking (optional)
- [ ] Configure auto-restart (default in Render)
- [ ] Plan for scaling if traffic increases

## Success Criteria

- ✅ Backend service running and responding to /api/health
- ✅ Frontend loads without errors
- ✅ API calls successful from frontend
- ✅ Log download feature works
- ✅ Traffic generation produces data
- ✅ All pages navigate correctly
- ✅ No console errors in browser

## Important Notes

1. **Free Tier Limitations**:
   - Services spin down after 15 min inactivity
   - Limited CPU/RAM for traffic generation
   - For production, upgrade to paid tier

2. **Domain Setup** (Optional):
   - Render provides free `.onrender.com` domain
   - Custom domain available with paid plans

3. **Monitoring**:
   - Use Render dashboard Logs tab for debugging
   - Set up alerts for service failures (Render Pro)
   - Monitor API response times

4. **Security**:
   - Don't commit `.env` files to GitHub
   - Use `.env.example` for templates
   - Keep credentials in environment variables only

---

**Status**: Ready for Deployment ✅
**Last Updated**: 2024
**Estimated Deployment Time**: 15-20 minutes
