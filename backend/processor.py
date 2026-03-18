import os
import yt_dlp
import whisper
from sentence_transformers import SentenceTransformer
import chromadb
from typing import List, Dict, Any
import warnings
import uuid

warnings.filterwarnings("ignore", category=UserWarning)

# Initialize paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_DIR = os.path.join(BASE_DIR, "chroma_db")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(DB_DIR, exist_ok=True)

# Initialize models (singleton-like)
print("Loading Whisper model (base)...")
try:
    whisper_model = whisper.load_model("base") # "base" is relatively small/fast
except Exception as e:
    print("Warning: could not load whisper initially", e)
    whisper_model = None

print("Loading SentenceTransformer model...")
try:
    embed_model = SentenceTransformer('all-MiniLM-L6-v2') 
except Exception as e:
    print("Warning: could not load sentence transformer initially", e)
    embed_model = None

# Initialize ChromaDB
chroma_client = chromadb.PersistentClient(path=DB_DIR)
collection = chroma_client.get_or_create_collection(name="video_chunks")

def is_processed(video_id: str) -> bool:
    try:
        results = collection.get(where={"video_id": video_id})
        return len(results.get('ids', [])) > 0
    except Exception:
        return False

def download_audio(video_id: str) -> str:
    url = f"https://www.youtube.com/watch?v={video_id}"
    out_tmpl = os.path.join(DATA_DIR, f"{video_id}.%(ext)s")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': out_tmpl,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': True,
        'no_warnings': True
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
        
    return os.path.join(DATA_DIR, f"{video_id}.mp3")

def process_youtube_video(video_id: str):
    print(f"Starting processing for video: {video_id}")
    
    if is_processed(video_id):
        print("Already processed.")
        return

    # 1. Download
    print("Downloading audio...")
    audio_path = download_audio(video_id)
    
    # 2. Transcribe
    print("Transcribing audio...")
    result = whisper_model.transcribe(audio_path)
    segments = result.get("segments", [])
    
    # 3. Process segments, generate embeddings, and store
    print("Generating embeddings and storing in DB...")
    
    ids = []
    documents = []
    metadatas = []
    embeddings = []
    
    for seg in segments:
        text = seg['text'].strip()
        if not text:
            continue
            
        start = seg['start']
        end = seg['end']
        
        chunk_id = f"{video_id}_{start}_{end}_{uuid.uuid4().hex[:8]}"
        
        emb = embed_model.encode(text).tolist()
        
        ids.append(chunk_id)
        documents.append(text)
        metadatas.append({
            "video_id": video_id,
            "start": start,
            "end": end
        })
        embeddings.append(emb)
        
    # Batch adding to chroma DB
    if ids:
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        
    print("Processing complete. Cleanup audio file...")
    if os.path.exists(audio_path):
        os.remove(audio_path)

def search_video(video_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    print(f"Searching video: {video_id} for query '{query}'")
    
    query_emb = embed_model.encode(query).tolist()
    
    results = collection.query(
        query_embeddings=[query_emb],
        n_results=top_k,
        where={"video_id": video_id}
    )
    
    formatted_results = []
    
    if not results or not results['ids'] or not results['ids'][0]:
        return formatted_results
        
    for i in range(len(results['ids'][0])):
        dist = results['distances'][0][i] if 'distances' in results and results['distances'] else 0.0
        # Convert distance to a similarity score (assuming L2 dist, roughly inverted or exp)
        score = 1.0 / (1.0 + dist)
        
        meta = results['metadatas'][0][i]
        text = results['documents'][0][i]
        
        formatted_results.append({
            "start": meta['start'],
            "end": meta['end'],
            "text": text,
            "score": score
        })
        
    # Sort by score descending (though chroma already does by distance ascending)
    formatted_results.sort(key=lambda x: x['score'], reverse=True)
    return formatted_results
