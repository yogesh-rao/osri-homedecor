"""Local preview server for the OSRI site.

    python serve.py          -> http://localhost:8000/
    python serve.py 8080     -> another port

Fixes two stdlib defaults that break in browsers:
  * http.server binds IPv4 only, but `localhost` often resolves to ::1 first,
    so this binds a dual-stack socket.
  * socketserver.TCPServer is single-threaded; browsers open several parallel
    keep-alive connections and it stalls. ThreadingMixIn fixes that.
Also sends no-cache headers so edits show up on a normal refresh.
"""
import http.server
import os
import socket
import socketserver
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    address_family = socket.AF_INET6
    daemon_threads = True
    allow_reuse_address = True

    def server_bind(self):
        # Turn off v6-only so the same socket also accepts IPv4.
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


if __name__ == "__main__":
    with Server(("::", PORT), Handler) as httpd:
        print("OSRI preview: http://localhost:%d/  (Ctrl+C to stop)" % PORT, flush=True)
        httpd.serve_forever()
