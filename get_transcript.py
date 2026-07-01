import sys
import json
import re
from youtube_transcript_api import YouTubeTranscriptApi

def get_video_id(url):
    match = re.search(r"(?:v=|\/)([0-9A-Za-z_-]{11}).*", url)
    return match.group(1) if match else url

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No URL provided"}))
        sys.exit(1)
        
    url = sys.argv[1]
    video_id = get_video_id(url)
    
    try:
        # Get transcripts list
        data = YouTubeTranscriptApi.get_transcript(video_id, languages=['es', 'en'])
        
        # Format similar to what node expected: "[seconds] text"
        formatted_lines = []
        for item in data:
            sec = int(item['start'])
            text = item['text'].replace('\n', ' ')
            formatted_lines.append(f"[{sec}] {text}")
            
        print(json.dumps({"text": "\n".join(formatted_lines), "title": "Tutorial Guardado (Python)"}))
        
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
