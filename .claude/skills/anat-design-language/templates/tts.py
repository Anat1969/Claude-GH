"""Hebrew narration for demo.cjs (Microsoft Edge read-aloud voices, free, no key).
usage: python3 -I tts.py <voice> <out.mp3> <text> [rate]
voices: he-IL-HilaNeural (Anat's choice, 2026-11-03), he-IL-AvriNeural. rate like "+0%" or "-5%".
Unofficial use of the Edge service: it works today, with no guarantee. The official route is Google Cloud TTS (key + billing).
Needs: pip install edge-tts. Behind the cloud proxy the CA is /root/.ccr/ca-bundle.crt (edge-tts reads certifi directly).
"""
import asyncio, os, sys
import certifi
CA = '/root/.ccr/ca-bundle.crt'
if os.path.exists(CA):
    certifi.where = lambda: CA
import edge_tts


async def main(voice, out, text, rate='+0%'):
    proxy = os.environ.get('HTTPS_PROXY') or os.environ.get('https_proxy') or None
    # The service sometimes answers with no audio (load, throttling): up to 4 tries, waiting 2, 4 and 8 seconds.
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, voice, rate=rate, proxy=proxy).save(out)
            if os.path.getsize(out) > 1000:
                return
        except edge_tts.exceptions.NoAudioReceived:
            pass
        await asyncio.sleep(2 ** (attempt + 1))
    raise SystemExit(f'tts: no audio after 4 tries ({voice})')


asyncio.run(main(*sys.argv[1:5]))
