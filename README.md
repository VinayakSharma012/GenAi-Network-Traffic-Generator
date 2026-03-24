# 🚀 GenAI Network Traffic Generator

A production-ready **React + Flask** application for simulating and monitoring network traffic across multiple protocols with a real-time dashboard.

## ✨ Features

- **6-Page React Dashboard**: Dashboard, Generator, Monitor, GenAI Engine, Logs, Config
- **7 REST API Endpoints**: Flask backend with traffic control
- **4 Protocol Support**: HTTP, DNS, SMTP, FTP traffic simulation
- **Real-time Monitoring**: Live charts, KPIs, and log streaming
- **Log Download**: Export traffic logs as timestamped files
- **Dark UI Theme**: Terminal-style interface with protocol-specific colors
- **Production Ready**: Gunicorn configured, environment-based URLs, error handling

## 🛠️ Tech Stack

**Frontend:**
- React 18.2.0
- Vite (build tool)
- Recharts (data visualization)
- Lucide React (icons)

**Backend:**
- Flask 3.1.3
- Gunicorn 21.2.0 (production WSGI server)
- Flask-CORS 4.0.0
- Python 3.11.7

## 📁 Project Structure

```
.
├── README.md                    # This file
├── DEPLOYMENT.md                # API documentation
├── RENDER_DEPLOYMENT.md         # Render deployment guide
├── render.yaml                  # Render configuration
├── .env.example                 # Environment template
├── backend/
│   ├── api.py                   # Flask REST API
│   ├── main.py                  # Traffic generator
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── App.jsx                  # React dashboard
│   ├── main.jsx                 # Entry point
│   ├── index.html               # HTML template
│   ├── index.css                # Styles
│   ├── package.json             # NPM dependencies
│   └── vite.config.js           # Vite config
└── test-deployment.sh           # API tests
```

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/GenAi-Network-Traffic-Generator.git
cd GenAi-Network-Traffic-Generator
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python api.py
```
Backend runs on `http://localhost:5000`

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### 4. Access Dashboard
Visit `http://localhost:5173`

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Service health check |
| GET | `/api/defaults` | Get default configuration |
| POST | `/api/traffic/start` | Start traffic generation |
| POST | `/api/traffic/stop` | Stop traffic generation |
| GET | `/api/traffic/status` | Get traffic status |
| GET | `/api/metrics` | Get traffic metrics |
| GET | `/api/logs` | Get traffic logs |

## 🎯 Dashboard Pages

1. **Dashboard**: Real-time KPIs, charts, and system health
2. **Generator**: Configure traffic for each protocol
3. **Monitor**: Live protocol-specific logs
4. **GenAI**: Prompt templates and generation history
5. **Logs**: Search, filter, and download logs
6. **Config**: Manage targets and test servers

## 🌐 Deployment

### Deploy to Render

1. Push code to GitHub
2. Go to https://dashboard.render.com
3. Click "New+" → "Web Service"
4. Connect your GitHub repository
5. Render auto-detects `render.yaml` and deploys

**Time**: 10-15 minutes

See `RENDER_DEPLOYMENT.md` for detailed steps.

## 🔐 Security

- ✅ No secrets in repository
- ✅ Enhanced `.gitignore`
- ✅ Environment variables for configuration
- ✅ CORS properly configured
- ✅ Safe for public GitHub

## 📚 Documentation

- **DEPLOYMENT.md** - API reference with examples
- **RENDER_DEPLOYMENT.md** - Render deployment guide

## 🧪 Testing

```bash
bash test-deployment.sh
```

## 💡 Environment Variables

Create `.env` from `.env.example`:

```env
FLASK_ENV=production
PYTHONUNBUFFERED=1
VITE_API_URL=https://your-backend-url.com
```

## 📝 License

MIT - Use freely

## 📞 Need Help?

Check the documentation files for detailed guides.

---

**Ready to deploy?** Follow `RENDER_DEPLOYMENT.md`

**Want to test locally?** Follow the Quick Start above
