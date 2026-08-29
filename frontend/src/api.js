// Base URL for the generic API (courses). Jika VITE_API_URL tidak diset, gunakan localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/courses/'

// URL khusus untuk layanan cuaca. Kami meng‑derive‑kan dari base API (tanpa "courses/").
// Remove the trailing "courses/" segment from the base URL so we can reuse it for the weather endpoint.
const WEATHER_BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/').replace(/courses\/?/, '')
const WEATHER_URL = `${WEATHER_BASE_URL}weather/`

async function request(url, options = {}) {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options })
  if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || 'Permintaan gagal')
  return response.status === 204 ? null : response.json()
}

export const courseApi = {
  list: (search = '') => request(`${API_URL}${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  create: (payload) => request(API_URL, { method: 'POST', body: JSON.stringify(payload) }),
  update: (id, payload) => request(`${API_URL}${id}/`, { method: 'PUT', body: JSON.stringify(payload) }),
  patch: (id, payload) => request(`${API_URL}${id}/`, { method: 'PATCH', body: JSON.stringify(payload) }),
  remove: (id) => request(`${API_URL}${id}/`, { method: 'DELETE' })
}

/** Weather API helper **/
export const weatherApi = {
  /**
   * Fetch cuaca untuk kota yang diberikan.
   * @param {string} city Nama kota (parameter `q` pada OpenWeatherMap).
   * @returns {Promise<Object>} Data cuaca JSON.
   */
  get: (city) => {
    const url = `${WEATHER_URL}?q=${encodeURIComponent(city)}`
    return request(url)
  }
}

export const chatApi = {
  ask: (question) => request('http://127.0.0.1:8000/api/chat/', {
    method: 'POST',
    body: JSON.stringify({ question }),
  }),
}
