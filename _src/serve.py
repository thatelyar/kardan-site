"""Local preview server for the site. Sends no-store so edits always show up.
   python3 site/_src/serve.py [port]"""
import functools
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4173
    handler = functools.partial(Handler, directory=ROOT)
    http.server.ThreadingHTTPServer(("127.0.0.1", port), handler).serve_forever()
