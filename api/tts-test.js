// Epihpany ElevenLabs voice audition endpoint.
// Only fixed sample phrases and two preset voices are allowed; the API key stays server-side.
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
  if (!apiKey) return res.status(503).json({ error: 'Add ELEVENLABS_API_KEY in Vercel Environment Variables first.' });
  const samples = {
    hello: 'Hello! Let’s practise English together.',
    comfortable: 'comfortable',
    thought: 'thought',
    through: 'through',
    repeat: 'Could you repeat that, please?'
  };
  const voices = {
    female: '21m00Tcm4TlvDq8ikWAM',
    male: 'JBFqnCBsd6RMkjVDRZzb'
  };
  const sample = samples[req.body?.sample];
  const voiceId = voices[req.body?.voice];
  if (!sample || !voiceId) return res.status(400).json({ error: 'Choose a valid sample and voice.' });
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voiceId + '?output_format=mp3_44100_128', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
      body: JSON.stringify({
        text: sample,
        model_id: 'eleven_flash_v2_5',
        voice_settings: { stability: 0.55, similarity_boost: 0.75, style: 0, use_speaker_boost: true }
      })
    });
    if (!response.ok) {
      const detail = await response.text();
      console.error('ElevenLabs TTS failed:', response.status, detail.slice(0, 300));
      return res.status(502).json({ error: response.status === 401 || response.status === 403 ? 'ElevenLabs API key was rejected. Check the key and API access.' : response.status === 429 ? 'Free plan quota or rate limit reached.' : 'ElevenLabs could not generate this sample.' });
    }
    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(audio);
  } catch (error) {
    console.error('ElevenLabs TTS request error:', error?.message || 'unknown');
    return res.status(502).json({ error: 'ElevenLabs voice service is temporarily unavailable.' });
  }
}
