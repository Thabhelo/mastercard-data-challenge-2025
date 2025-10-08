#!/usr/bin/env python3
"""Simple HTTP server for the dashboard."""

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000
DIRECTORY = Path(__file__).parent

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

if __name__ == '__main__':
    with socketserver.TCPServer(('', PORT), Handler) as httpd:
        print(f'Dashboard running at http://localhost:{PORT}')
        print('Press Ctrl+C to stop')
        httpd.serve_forever()

