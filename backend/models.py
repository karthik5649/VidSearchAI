from pydantic import BaseModel
from typing import List

class ProcessYoutubeRequest(BaseModel):
    video_id: str

class SearchRequest(BaseModel):
    video_id: str
    query: str

class ProcessYoutubeResponse(BaseModel):
    message: str
    video_id: str

class SearchResult(BaseModel):
    start: float
    end: float
    text: str
    score: float

class SearchResponse(BaseModel):
    results: List[SearchResult]
