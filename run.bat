@echo off
echo Starting Noodles King local server...
echo Pointing to http://localhost:8000
start "" "http://localhost:8000"
python -m http.server 8000
