const ALLOWED_HOSTS = new Set([
  'maps.app.goo.gl',
  'goo.gl',
  'www.google.com',
  'www.google.es',
  'maps.google.com',
])

function coordinatesFromUrl(value) {
  const decoded = decodeURIComponent(value)
  const patterns = [
    /[?&]query=(-?\d+(?:\.\d+)?),\+?(-?\d+(?:\.\d+)?)/,
    /\/maps\/search\/(-?\d+(?:\.\d+)?),\+?(-?\d+(?:\.\d+)?)/,
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
  ]
  for (const pattern of patterns) {
    const match = decoded.match(pattern)
    if (match) return { lat: Number(match[1]), lng: Number(match[2]) }
  }
  return null
}

export default async function handler(request, response) {
  const rawUrl = typeof request.query?.url === 'string' ? request.query.url : ''
  let input
  try {
    input = new URL(rawUrl)
  } catch {
    return response.status(400).json({ error: 'Enllaç no vàlid' })
  }
  if (!ALLOWED_HOSTS.has(input.hostname)) {
    return response.status(400).json({ error: 'Només s’accepten enllaços de Google Maps' })
  }

  try {
    const directCoordinates = coordinatesFromUrl(input.href)
    if (directCoordinates) return response.status(200).json({ url: input.href, ...directCoordinates })

    const result = await fetch(input.href, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    const coordinates = coordinatesFromUrl(result.url)
    if (!coordinates) return response.status(422).json({ error: 'No hem pogut extraure les coordenades' })
    return response.status(200).json({ url: result.url, ...coordinates })
  } catch {
    return response.status(502).json({ error: 'No hem pogut obrir l’enllaç' })
  }
}
