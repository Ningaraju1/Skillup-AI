# Skillup AI — Complete Run Guide (Windows)

This guide will help you set up, verify, and run the Skillup AI Resume Analyzer project on Windows, including the Django backend API and the React Vite frontend.

---

## 📋 Prerequisites

- **Windows 10/11**
- **Python 3.10+** (Django & LangGraph backend)
- **Node.js 18+** (Vite & React frontend)
- **Internet connection** (for package installations and Sentence Transformer model downloading)
- **Groq API Key** (for processing the LangGraph multi-agent requests)

---

## 🚀 Quick Start (3 Steps)

### Step 1: Clone & Environment Configuration

1. In the `Skillup AI` folder, locate the file named `.env.example` or create a new file named `.env`.
2. Open the `.env` file and insert your Groq API key:

```env
GROQ_API_KEY=gsk_YOUR_ACTUAL_GROQ_API_KEY
```

> 💡 **Tip:** You can get a free, fast API key from the [Groq Console](https://console.groq.com).

---

### Step 2: Set Up & Launch Django Backend

Open PowerShell, navigate to the `Skillup AI` directory, and run the following commands:

#### 1. Create and Activate Virtual Environment (Optional but Recommended)
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

#### 2. Install Python Packages
```powershell
pip install -r requirements.txt
```
*This will install Django, django-cors-headers, djangorestframework, groq, python-dotenv, pypdf, python-docx, sentence-transformers, chromadb, and langgraph.*

#### 3. Run Database Migrations
```powershell
python manage.py migrate
```

#### 4. Launch Django Server
```powershell
python manage.py runserver
```
The backend API server will start on: **[`http://127.0.0.1:8000`](http://127.0.0.1:8000)**.

---

### Step 3: Set Up & Launch React Frontend

Open a new PowerShell window, navigate to the `Skillup AI/frontend` directory, and execute:

#### 1. Install Node Dependencies
```powershell
npm install
```

#### 2. Start Vite Development Server
```powershell
npm run dev
```
The frontend interface will launch on: **[`http://localhost:5173`](http://localhost:5173)**.

---

## 🎮 Testing & Verifying the Installation

### 1. Check Backend API Endpoint
Visit `http://127.0.0.1:8000/api/resume/upload/` in your browser. You should see a DRF API page or a response indicating that the method is not allowed (GET), confirming the backend server is running and listening.

### 2. Verify model download
When you perform the very first resume scan, the backend will automatically download the sentence embedding model `all-MiniLM-L6-v2` (about ~90MB) into your local cache. This might take a few seconds on the first request. Subsequent scans will be nearly instant.

### 3. Verify RAG Storage
After a successful scan, you will notice a folder named `chroma_db` created in the root of the `Skillup AI` project. This folder holds the persistent vector databases containing your resume embeddings and metadata matching records.

---

## 🐛 Troubleshooting

### Issue: "Invalid JSON from model" or Groq API Error
**Solution:**
- Check your `.env` file structure. Ensure the variable name is exactly `GROQ_API_KEY` and does not contain spaces.
- Log in to your Groq console and test if your key has expired or reached rate limits.

### Issue: "pypdf or docx not found"
**Solution:**
- Ensure you have activated your virtual environment (`.\venv\Scripts\Activate.ps1`) before running `pip install -r requirements.txt` and `python manage.py runserver`.

### Issue: "CORS blocks frontend requests"
**Solution:**
- Check `backend/settings.py` to ensure `corsheaders` is in `INSTALLED_APPS` and `corsheaders.middleware.CorsMiddleware` is at the top of the middlewares.

### Issue: "Model download times out"
**Solution:**
- The sentence-transformers library requires internet access on the first run to fetch the weights from Hugging Face. Ensure your firewall or proxy doesn't block python connections to Hugging Face (`huggingface.co`).

---

## 📁 Project Structure

```
Skillup AI/
├── .env                     # Configuration keys (API Keys)
├── .gitignore               # Ignored local files
├── requirements.txt         # Backend Python requirements (NEW)
├── README.md                # Project landing documentation (NEW)
├── RUN_GUIDE.md             # Complete step-by-step runner guide (NEW)
├── manage.py                # Django entry point script
├── backend/                 # Django settings & URL configurations
├── analyzer/                # Resume analysis Django App
│   ├── models.py            # SQLite database schemas for history
│   ├── views.py             # HTTP handlers and compliance engines
│   ├── services/            # Custom parsers & AI logic wrapper
│   │   └── pdf_parser.py    # Custom PDF, DOC, DOCX extractor
│   ├── agents/              # LangGraph coordination layer
│   │   ├── nodes/           # Individual agent node definitions
│   │   └── langgraph_flow.py# StateGraph orchestration flow
│   └── memory/              # ChromaDB vector embedding handlers
├── frontend/                # React Vite project UI
│   ├── src/                 # JS & CSS React sources
│   ├── package.json         # Frontend configuration
│   └── index.html           # HTML5 Entry
└── chroma_db/               # Local vector storage databases
```

---

**Enjoy your experience with Skillup AI! 🚀✨**
