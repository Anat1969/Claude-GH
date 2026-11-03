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
    await edge_tts.Communicate(text, voice, rate=rate, proxy=proxy).save(out)


asyncio.run(main(*sys.argv[1:5]))
