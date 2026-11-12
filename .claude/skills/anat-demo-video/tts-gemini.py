"""Hebrew narration for demo.cjs via Gemini TTS: the voice of the Partitura film (Anat, 2026-11-11: "excellent in voice and music").
Same interface as the Edge tts.py that sits next to demo.cjs, so copy this file over it as tts.py:
usage: python3 -I tts.py <voice> <out.mp3> <text> [rate]      voice: Aoede (the chosen one)
Needs: ffmpeg, and two environment variables:
  TTS_URL    the edge function that wraps Gemini TTS (today: .../functions/v1/musicprompt-tts, temporary)
  TTS_TOKEN  its access token. It is NEVER stored in the repo: Anat gives it per session (MP_TTS_TOKEN is read as a fallback).
The function answers {audio: base64 PCM, mime}; ffmpeg turns it into mp3 and trims the silence at both ends. Up to 4 tries."""
import base64, json, os, ssl, subprocess, sys, time, urllib.request

URL = os.environ.get('TTS_URL', 'https://ktqmwpbzcnzkhjskqisy.supabase.co/functions/v1/musicprompt-tts')
STYLE = 'קראי בעברית, בקול חם, חי וטבעי, כמו קריינית של סרט תדמית קצר. קצב שיחה זורם, עם חיוך בקול, בלי הטעמה מוגזמת:'


def main(voice, out, text, rate='+0%'):
    token = os.environ.get('TTS_TOKEN') or os.environ.get('MP_TTS_TOKEN') or ''
    if not token:
        sys.exit('tts: no TTS_TOKEN in the environment (ask Anat for it; it is not stored in the repo)')
    ca = '/root/.ccr/ca-bundle.crt'
    ctx = ssl.create_default_context(cafile=ca) if os.path.exists(ca) else None
    last = ''
    for attempt in range(4):
        try:
            req = urllib.request.Request(URL, data=json.dumps({'token': token, 'text': text, 'voice': voice, 'style': STYLE}).encode(), headers={'Content-Type': 'application/json'})
            j = json.loads(urllib.request.urlopen(req, timeout=120, context=ctx).read())
            pcm = base64.b64decode(j['audio'])
            sr = '24000'
            for part in j.get('mime', '').split(';'):
                if 'rate=' in part:
                    sr = part.split('=')[1]
            trim = 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse'
            p = subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', sr, '-ac', '1', '-i', 'pipe:0', '-af', trim, '-b:a', '128k', out], input=pcm)
            if p.returncode == 0 and os.path.getsize(out) > 1000:
                return
            last = 'ffmpeg failed'
        except Exception as e:
            last = str(e)
        time.sleep(3 * (attempt + 1))
    sys.exit('tts failed: ' + last)


if __name__ == '__main__':
    main(*sys.argv[1:5])
