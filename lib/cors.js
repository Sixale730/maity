export function setCors(req, res) {
  const allowed = (process.env.CORS_ORIGINS
    || 'https://maity.com.mx,https://www.maity.com.mx,http://localhost:8080'
  ).split(',').map(s => s.trim());

  const origin = req.headers.origin || '';
  if (allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Vary', 'Origin');

  const reqHeaders = req.headers['access-control-request-headers'];
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', reqHeaders || 'authorization, content-type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true; // ya respondimos
  }
  return false;
}