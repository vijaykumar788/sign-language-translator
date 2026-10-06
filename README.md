# Sign Language Translator

A simple web app for translating a few hand gestures into text and spoken output for speech-impaired communication.

## Features
- Uses webcam + MediaPipe hand tracking
- Detects sample ASL-like signs: A, B, L, V
- Shows the detected letter on screen
- Builds a simple transcript
- Speaks the recognized letter via browser speech synthesis

## Prerequisites
- Python 3.9+
- A webcam

## Setup

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Then open:
- http://localhost:5000

## If localhost is not opening
Check these:
- Make sure the app is running with `python app.py`
- Confirm you are visiting `http://localhost:5000`
- If port 5000 is already used, change it in `app.py` to a free port, such as 5001
- Verify Flask is installed successfully
- Check terminal output for any errors

## Important note
This is an MVP and detects only a small set of gestures. It is intended as a project starter and can be extended with a full trained ASL model for wider language support.
