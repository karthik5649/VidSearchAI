from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import ProcessYoutubeRequest, SearchRequest, ProcessYoutubeResponse, SearchResponse, SearchResult
import processor

app = FastAPI(title="Video Semantic Search API")

# Enable CORS for frontend and extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Video Semantic Search API is running"}

@app.post("/process_youtube", response_model=ProcessYoutubeResponse)
async def process_youtube(req: ProcessYoutubeRequest):
    try:
        if processor.is_processed(req.video_id):
            return ProcessYoutubeResponse(message="Video already processed", video_id=req.video_id)
        
        processor.process_youtube_video(req.video_id)
        return ProcessYoutubeResponse(message="Video processed successfully", video_id=req.video_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search", response_model=SearchResponse)
async def search_video(req: SearchRequest):
    try:
        results = processor.search_video(req.video_id, req.query)
        # Convert dict to namedtuple or objects matching Pydantic SearchResult
        formatted_results = [
            SearchResult(
                start=res['start'], 
                end=res['end'], 
                text=res['text'], 
                score=res['score']
            ) for res in results
        ]
        return SearchResponse(results=formatted_results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
