from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote
import json

ROOT = Path(__file__).parent
FILES = ROOT / "files"
ALLOWED = {".exe", ".xll", ".docx"}


class FileDepotHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/api/files":
            items = []
            for path in sorted(FILES.iterdir() if FILES.exists() else [], key=lambda item: item.name.lower()):
                if path.is_file() and path.suffix.lower() in ALLOWED:
                    items.append({
                        "name": path.name,
                        "extension": path.suffix[1:].upper(),
                        "size": path.stat().st_size,
                        "modified": datetime.fromtimestamp(path.stat().st_mtime).strftime("%b %d, %Y"),
                        "url": f"/files/{quote(path.name)}",
                    })
            payload = json.dumps(items).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()

    def translate_path(self, path):
        if path.startswith("/files/"):
            return str(FILES / Path(path.removeprefix("/files/")).name)
        return super().translate_path(path)


if __name__ == "__main__":
    FILES.mkdir(exist_ok=True)
    print("File Depot running at http://localhost:8000")
    ThreadingHTTPServer(("localhost", 8000), FileDepotHandler).serve_forever()