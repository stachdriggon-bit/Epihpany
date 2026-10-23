// Vercel serverless endpoint: keep the Google API key in Vercel environment variables.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Natural voice is not configured yet' });
  const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
  const rate = Number(req.body?.rate);
  if (!text || text.length > 1800) return res.status(400).json({ error: 'Text must contain 1–1800 characters' });
  const speakingRate = Number.isFinite(rate) ? Math.max(0.75, Math.min(1.05, rate)) : 0.92;
  try {
    const response = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + encodeURIComponent(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'en-US', name: 'en-US-Neural2-F' },
        audioConfig: { audioEncoding: 'MP3', speakingRate, pitch: 0 }
      })
    });
    const data = await response.json();
    if (!response.ok || !data.audioContent) {
      console.error('Google TTS request failed:', response.status, data.error?.status || 'unknown');
      return res.status(502).json({ error: 'Natural voice service failed' });
    }
    const audio = Buffer.from(data.audioContent, 'base64');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    return res.status(200).send(audio);
  } catch (error) {
    console.error('Google TTS request error:', error?.message || 'unknown');
    return res.status(502).json({ error: 'Natural voice service unavailable' });
  }
}
