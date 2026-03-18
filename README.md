# 🎥 VidSearchAI

### 🔍 Semantic Video Search with Timestamp Navigation (Web + Chrome Extension)

---

## 🚀 Overview

VidSearchAI is an AI-powered system that enables users to **search inside videos using natural language queries** and instantly jump to the **exact timestamp** where the topic is discussed.

The system is implemented as:

* 🌐 A **Web Application**
* 🧩 A **Chrome Extension for YouTube**

It combines **speech recognition, semantic search, and vector databases** to deliver an intelligent video navigation experience.

---

## 🎯 Problem Statement

With the explosion of video content (YouTube, lectures, tutorials), finding specific information inside long videos is inefficient and time-consuming.

VidSearchAI solves this by allowing users to:

* Ask questions in natural language
* Automatically locate the relevant moment in a video
* Jump directly to that timestamp

---

## ✨ Features

### 🌐 Web Application

* 🔗 Input YouTube URLs
* 📁 Upload local videos
* 🎙️ Automatic transcription (Whisper)
* 🧠 Semantic search (not keyword-based)
* ⏱️ Accurate timestamp retrieval
* ▶️ Video playback from relevant moment

### 🧩 Chrome Extension

* Works directly on **YouTube videos**
* Detects current video automatically
* Popup search interface
* Instant timestamp jumping inside YouTube player
* No need to leave the video page

---

## 🧠 How It Works

1. User provides a video (YouTube URL or upload)
2. Backend downloads video (if YouTube)
3. Audio is extracted using FFmpeg
4. Speech is converted into text using Whisper
5. Transcript is split into timestamped chunks
6. Each chunk is converted into embeddings
7. Embeddings are stored in ChromaDB
8. User query is converted into embedding
9. Semantic similarity search is performed
10. Best matching timestamp is returned
11. Video plays from that timestamp

---

## 🏗️ System Architecture

User Input (Web / Extension)
→ Backend API (FastAPI)
→ Video Processing (yt-dlp / Upload)
→ Audio Extraction (FFmpeg)
→ Speech-to-Text (Whisper)
→ Chunking + Embeddings
→ ChromaDB (Vector Storage)
→ Query Embedding
→ Semantic Search
→ Timestamp Retrieval
→ Video Playback / YouTube Seek

---

## 🛠️ Tech Stack

### 🧠 AI / ML

* Whisper (Speech-to-Text)
* Sentence Transformers (Embeddings)

### ⚙️ Backend

* FastAPI (Python 3.10+)
* yt-dlp (YouTube downloads)
* ffmpeg-python (Audio extraction)
* ChromaDB (Vector database)

### 🌐 Frontend

* React.js (Vite)
* Tailwind CSS

### 🧩 Chrome Extension

* Manifest V3
* JavaScript / React (optional)
* Chrome Extension APIs
* Content Scripts (YouTube player control)

---

## 📁 Project Structure

```
VidSearchAI/
│
├── backend/        # FastAPI backend (ML + APIs)
├── frontend/       # React web app
├── extension/      # Chrome extension
└── README.md
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone https://github.com/karthik5649/VidSearchAI.git
cd VidSearchAI
```

---

### 2️⃣ Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### 4️⃣ Chrome Extension Setup

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer Mode**
3. Click **Load Unpacked**
4. Select the `/extension` folder

---

## 📡 API Endpoints

### POST /process

* Input: YouTube URL or video file
* Output: Processes video and stores embeddings

---

### GET /search

* Input: video_id + query
* Output:

```json
{
  "timestamp": 125,
  "text": "Relevant segment from video"
}
```

---

## 🧪 Verification Plan

### ✅ Automated Tests

* FastAPI endpoint testing
* Embedding validation
* Vector search correctness

### ✅ Manual Testing

#### Backend

* Run FastAPI server
* Test `/process` and `/search` via Swagger UI

#### Web App

* Paste YouTube URL / upload video
* Process video
* Search queries and verify timestamps

#### Chrome Extension

* Load extension
* Open YouTube video
* Search via popup
* Verify video jumps to correct timestamp

---

## ⚠️ Important Notes

* ⚡ Requires **high RAM (8GB+ recommended)**
* 🚀 GPU recommended for faster Whisper processing
* 📉 yt-dlp may face **rate limits from YouTube**
* ⏳ Initial video processing may take time

---

## 🚀 Future Enhancements

* 🌍 Multi-language support
* 💬 Chat with video (LLM integration)
* 📊 Timeline highlighting
* 🧾 Automatic summarization
* ☁️ Cloud deployment (AWS/GCP)
* 🔄 Background processing queue
* 📦 Caching processed videos

---

## 🎯 Use Cases

* 🎓 Online learning platforms
* 📺 YouTube content navigation
* 🏢 Meeting recordings analysis
* 📞 Customer support call insights
* 🎬 Media search systems

---

## 🧠 Key Concepts

* Semantic Search
* Vector Embeddings
* Speech Recognition
* Retrieval Systems
* Approximate Nearest Neighbor (ANN)

---

## 👨‍💻 Author

**Karthik Reddy**
📧 [palakolukarthikreddy@gmail.com](mailto:palakolukarthikreddy@gmail.com)
🔗 https://github.com/karthik5649

---

## ⭐ Support

If you find this project useful, please give it a ⭐ on GitHub!

---
