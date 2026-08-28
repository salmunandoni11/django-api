import React, { useEffect, useState } from "react"
import { CloudSun } from "lucide-react"
import { weatherApi } from "./api"

/**
 * Simple page that shows current weather for a city.
 * Rendered into the #root element of weather.html.
 */
export default function WeatherPage() {
  const [city, setCity] = useState("Jakarta")
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await weatherApi.get(city)
        setWeather(data)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [city])

  return (
    <main style={{ padding: "1rem", maxWidth: "500px", margin: "0 auto" }}>
      <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <CloudSun size={24} /> Weather in {city}
      </h1>
      <div style={{ marginTop: "0.5rem" }}>
        <label>Kota: </label>
        <input value={city} onChange={e => setCity(e.target.value)} />
      </div>
      {loading && <p>Memuat data cuaca…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {weather && (
        <div style={{ marginTop: "1rem" }}>
          <p><strong>{weather.city || weather.name}</strong></p>
          <p>{weather.temperature}°C – {weather.description}</p>
          <p>Kelembapan: {weather.humidity}% | Angin: {weather.wind_speed} m/s</p>
        </div>
      )}
    </main>
  )
}

// Mount when script is loaded directly
import { createRoot } from "react-dom/client"
const container = document.getElementById("root")
if (container) {
  const root = createRoot(container)
  root.render(<WeatherPage />)
}