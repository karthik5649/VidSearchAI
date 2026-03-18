document.addEventListener('DOMContentLoaded', () => {
  const processBtn = document.getElementById('process-btn');
  const searchBtn = document.getElementById('search-btn');
  const searchInput = document.getElementById('search-input');
  const searchSection = document.getElementById('search-section');
  const statusDiv = document.getElementById('status');

  const API_URL = 'http://localhost:8000'; // Make sure the backend is running here
  let currentVideoId = null;

  // Helper to update status
  const setStatus = (msg, type = 'normal') => {
    statusDiv.textContent = msg;
    statusDiv.className = type;
  };

  // Setup: check if we are on youtube and get the video id
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab.url && tab.url.includes("youtube.com/watch")) {
      const url = new URL(tab.url);
      currentVideoId = url.searchParams.get("v");
      if (currentVideoId) {
        setStatus("Ready to process Video ID: " + currentVideoId);
      } else {
        setStatus("Could not detect YouTube video ID", "error");
        processBtn.disabled = true;
      }
    } else {
      setStatus("Please navigate to a YouTube video.", "error");
      processBtn.disabled = true;
    }
  });

  // Process Video
  processBtn.addEventListener('click', async () => {
    if (!currentVideoId) return;

    processBtn.disabled = true;
    setStatus("Processing video (this may take a while)...");

    try {
      const response = await fetch(`${API_URL}/process_youtube`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: currentVideoId })
      });

      if (response.ok) {
        setStatus("Video processed! Ready for search.", "success");
        processBtn.style.display = 'none';
        searchSection.style.display = 'block';
      } else {
        const err = await response.json();
        setStatus("Error: " + (err.detail || "Failed to process"), "error");
        processBtn.disabled = false;
      }
    } catch (e) {
      setStatus("Connection error. Is the backend running?", "error");
      processBtn.disabled = false;
    }
  });

  // Search Context
  searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (!query || !currentVideoId) return;

    searchBtn.disabled = true;
    setStatus("Searching...");

    try {
      const response = await fetch(`${API_URL}/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ video_id: currentVideoId, query: query })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const bestMatch = data.results[0];
          setStatus(`Found! Jumping to ${Math.floor(bestMatch.start)}s`, "success");
          
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: "SEEK_VIDEO",
              time: bestMatch.start
            });
          });
        } else {
          setStatus("No relevant context found.", "error");
        }
      } else {
        setStatus("Search failed", "error");
      }
    } catch (e) {
      setStatus("Connection error.", "error");
    } finally {
      searchBtn.disabled = false;
    }
  });
});
