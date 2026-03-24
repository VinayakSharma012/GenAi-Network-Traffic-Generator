# GenAI Network Traffic Generator - Deployment Guide

## ✅ Deployment Checklist

### Backend Status
- [x] Flask API with full CORS support
- [x] Traffic start/stop endpoints working
- [x] Metrics and logs endpoints functional
- [x] Error handling and logging configured
- [x] Production-ready configuration

### Frontend Status
- [x] React dashboard with 6 pages
- [x] All buttons functional (LAUNCH, STOP, EXPORT, RUN TESTS)
- [x] Real-time data updates
- [x] API integration complete
- [x] Error handling with user feedback

### API Endpoints

#### Health & Status
```
GET  /api/health              → Check API health
GET  /api/status/traffic      → Get traffic generation status
GET  /api/defaults            → Get default configuration
```

#### Traffic Control
```
POST /api/traffic/start       → Start traffic generation (accepts JSON config)
POST /api/traffic/stop        → Stop traffic generation
GET  /api/traffic/status      → Get current traffic status
```

#### Monitoring
```
GET  /api/logs                → Get traffic logs (last 100 lines)
GET  /api/metrics             → Get traffic metrics (packets by protocol)
```

## 🚀 How to Run

### Development Mode

**Terminal 1 - Backend:**
```bash
cd /Users/vinayaksharma/genai-project
/Users/vinayaksharma/genai-project/.venv/bin/python backend/api.py --dev
```

**Terminal 2 - Frontend:**
```bash
cd /Users/vinayaksharma/genai-project/frontend
npm run dev
```

Access: http://localhost:5173

### Production Deployment

**Backend (Production):**
```bash
cd /Users/vinayaksharma/genai-project
/Users/vinayaksharma/genai-project/.venv/bin/python backend/api.py
```

Runs on: `http://0.0.0.0:5000` (available on network)

**Frontend (Production Build):**
```bash
cd /Users/vinayaksharma/genai-project/frontend
npm run build
npm run preview
```

## 🔧 Button Functions - All Working

### Dashboard Page
- ✅ Navigation between pages

### Traffic Generator Page
- ✅ **LAUNCH TRAFFIC GENERATION** - Starts traffic generation with configured parameters
- ✅ **[Copy]** CLI Command - Copies command to clipboard
- ✅ Protocol configuration toggles (HTTP, DNS, SMTP, FTP)

### Configuration Page
- ✅ **Run Tests** - Shows test information (can run pytest)
- ✅ **Export Config** - Downloads JSON configuration file
- ✅ Copy Wireshark filters to clipboard

### Header Controls
- ✅ **STOP** Button - Stops all running traffic
- ✅ Menu toggle - Collapse/expand sidebar
- ✅ Live clock display
- ✅ Status pills showing protocol states

### Log Viewer
- ✅ Search logs functionality
- ✅ Filter by protocol (ALL, HTTP, DNS, SMTP, FTP, ERROR)
- ✅ Clear logs
- ✅ Export logs

## 📊 Traffic Configuration Schema

When launching traffic, send this JSON to `/api/traffic/start`:

```json
{
  "http_target": "http://httpbin.org",
  "http_count": 10,
  "dns_server": "8.8.8.8",
  "dns_count": 10,
  "smtp_host": "localhost",
  "smtp_port": 1025,
  "smtp_count": 5,
  "ftp_host": "ftp.dlptest.com",
  "ftp_count": 5,
  "enable_all": true
}
```

## 🐛 Testing All Functions

### Test 1: Start Traffic
```bash
curl -X POST http://localhost:5000/api/traffic/start \
  -H "Content-Type: application/json" \
  -d '{"http_count": 5, "dns_count": 5}'
```

**Expected Response:**
```json
{
  "status": "started",
  "pid": 12345,
  "message": "Traffic generation started successfully"
}
```

### Test 2: Stop Traffic
```bash
curl -X POST http://localhost:5000/api/traffic/stop \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "status": "stopped",
  "message": "Traffic generation stopped successfully"
}
```

### Test 3: Get Health
```bash
curl http://localhost:5000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "service": "genai-traffic-api"
}
```

### Test 4: Get Metrics
```bash
curl http://localhost:5000/api/metrics
```

**Expected Response:**
```json
{
  "total_packets": 847293,
  "http_packets": 234,
  "dns_packets": 156,
  "smtp_packets": 89,
  "ftp_packets": 45,
  "errors": 0
}
```

### Test 5: Get Status
```bash
curl http://localhost:5000/api/traffic/status
```

**Expected Response (Running):**
```json
{
  "running": true,
  "pid": 12345
}
```

**Expected Response (Not Running):**
```json
{
  "running": false,
  "pid": null
}
```

## 🌐 CORS Configuration

The API accepts requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternative port)
- `http://127.0.0.1:5173`
- Production: Configure in `backend/api.py`

## 📦 Dependencies

### Python Backend
- Flask 3.1.3
- Flask-CORS 4.0.0
- aiohttp 3.9.5
- Faker 24.4.0

### JavaScript Frontend
- React 18.2.0
- recharts 2.10.3
- lucide-react (icons)
- Vite (build tool)
- Tailwind CSS

## 🔒 Security Notes for Deployment

1. **Disable Debug Mode**: Set `--dev` to run only in development
2. **CORS Origins**: Limit to specific domains in production
3. **Host Binding**: Backend binds to `0.0.0.0` in production (restrict in firewall)
4. **Subprocess**: Validate all user inputs before passing to subprocess
5. **Log Files**: Ensure `traffic_log.txt` is in correct directory

## 📝 Common Issues & Fixes

### Issue: "Cannot POST /api/traffic/start"
**Fix**: Ensure backend is running on port 5000

### Issue: CORS errors in browser console
**Fix**: Check Flask is running with CORS enabled, backend is accessible from frontend URL

### Issue: Traffic doesn't start
**Fix**: Check `backend/main.py` is in the backend directory, Python paths are correct

### Issue: Buttons not responding
**Fix**: Open browser console (F12), check for JavaScript errors, ensure network tab shows successful API calls

## ✨ Features Ready for Deployment

✅ Complete traffic generation system  
✅ Real-time dashboard with live updates  
✅ 4-protocol support (HTTP, DNS, SMTP, FTP)  
✅ GenAI content engine simulation  
✅ Log streaming and filtering  
✅ Configuration export  
✅ Error handling & logging  
✅ Responsive UI with dark theme  
✅ Mobile-friendly design  
✅ Full API documentation  

## 🎯 Next Steps for Production

1. Deploy backend to cloud service (AWS, GCP, Heroku, etc.)
2. Build and deploy frontend to CDN or static hosting
3. Configure environment variables for API URL
4. Set up logging and monitoring
5. Configure domain and SSL certificates
6. Run security tests
7. Load testing with expected traffic

---

**Version**: 1.0.0  
**Last Updated**: March 24, 2026  
**Status**: ✅ Production Ready
