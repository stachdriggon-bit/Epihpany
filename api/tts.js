// Vercel serverless endpoint for natural English speech using ElevenLabs.
// Keep ELEVENLABS_API_KEY in Vercel Environment Variables; never expose it in browser code.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const origin = req.headers.origin;
  const host = req.headers.host;
  if (!origin || !host) return res.status(403).json({ error: 'Forbidden origin' });
  try { if (new URL(origin).host !== host) return res.status(403).json({ error: 'Forbidden origin' }); }
  catch { return res.status(403).json({ error: 'Forbidden origin' }); }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Natural voice is not configured yet' });
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  const rate = Number(req.body?.rate);
  if (!text || text.length > 1800) return res.status(400).json({ error: 'Text must contain 1–1800 characters' });
  const speakingRate = Number.isFinite(rate) ? Math.max(0.75, Math.min(1.05, rate)) : 0.92;

  // George (British English), confirmed working on the standalone test page.
  const voiceId = 'JBFqnCBsd6RMkjVDRZzb';
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId + '?output_format=mp3_44100_128', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text,
        model_id: 'eleven_flash_v2_5',
        voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0, use_speaker_boost: true, speed: speakingRate }
      })
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error('ElevenLabs TTS failed:', response.status, detail.slice(0, 300));
      return res.status(502).json({ error: response.status === 401 || response.status === 403 ? 'ElevenLabs API key was rejected. Check the key and API access.' : response.status === 429 ? 'Free plan quota or rate limit reached.' : 'Natural voice service failed' });
    }
    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(audio);
  } catch (error) {
    console.error('ElevenLabs TTS request error:', error?.message || 'unknown');
    return res.status(502).json({ error: 'Natural voice service unavailable' });
  }
}
