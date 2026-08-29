import { useEffect, useState } from 'react'
import { BookOpen, CirclePlus, Edit3, Layers3, Search, Trash2, X, CloudSun } from 'lucide-react'
import { courseApi, weatherApi } from './api'
import Chatbot from './Chatbot'

const empty = { title: '', slug: '', description: '', instructor: '', category: 'Development', level: 'Beginner', duration: '4 minggu', price: 0, image_url: '', is_published: true }
const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
/* test */
function App() {
  const [courses, setCourses] = useState([]); const [form, setForm] = useState(empty); const [editing, setEditing] = useState(null)
  const [query, setQuery] = useState(''); const [loading, setLoading] = useState(true); const [error, setError] = useState('')
  // State untuk cuaca
  const [city, setCity] = useState('Jakarta')
  const [weather, setWeather] = useState(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState('')
  const load = async (search = query) => { setLoading(true); try { const data = await courseApi.list(search); setCourses(data.results || data); setError('') } catch (e) { setError(e.message) } finally { setLoading(false) } }
  useEffect(() => { load('') }, [])
  // Load cuaca ketika komponen mount atau ketika city berubah
  useEffect(() => {
    const fetchWeather = async () => {
      setWeatherLoading(true)
      setWeatherError('')
      try {
        const data = await weatherApi.get(city)
        setWeather(data)
      } catch (e) {
        setWeatherError(e.message)
      } finally {
        setWeatherLoading(false)
      }
    }
    fetchWeather()
  }, [city])
  const submit = async (event) => { event.preventDefault(); try { if (editing) await courseApi.update(editing, form); else await courseApi.create({ ...form, slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }); setForm(empty); setEditing(null); load('') } catch (e) { setError(e.message) } }
  const edit = (course) => { setEditing(course.id); setForm(course); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const remove = async (id) => { if (!window.confirm('Hapus kursus ini?')) return; try { await courseApi.remove(id); load() } catch (e) { setError(e.message) } }
  const toggle = async (course) => { try { await courseApi.patch(course.id, { is_published: !course.is_published }); load() } catch (e) { setError(e.message) } }
  return <main><header><div className="brand"><span className="brand-mark"><BookOpen size={20} /></span><span>kursus<span className="accent">.studio</span></span></div><span className="status"><i /> API connected</span></header>
    {/* Weather Section */}
    <section className="weather" style={{ padding: '1rem', backgroundColor: '#f0f8ff', marginBottom: '1rem', borderRadius: '8px' }}>
      <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CloudSun size={20} /> Cuaca di {city}</h2>
      <div style={{ marginTop: '0.5rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Kota:</label>
        <input type="text" value={city} onChange={e => setCity(e.target.value)} style={{ padding: '0.3rem' }} />
      </div>
      {weatherLoading && <p>Memuat data cuaca…</p>}
      {weatherError && <p style={{ color: 'red' }}>{weatherError}</p>}
      {weather && (
        <div style={{ marginTop: '0.5rem' }}>
          <p><strong>{weather.city || weather.name}</strong></p>
          <p>{weather.temperature}°C – {weather.description}</p>
          <p>Kelembapan: {weather.humidity}% | Angin: {weather.wind_speed} m/s</p>
        </div>
      )}
    </section>
    <section className="intro"><div><p className="eyebrow">COURSE ADMINISTRATION</p><h1>Bangun keahlian.<br /><em>Bagikan dampak.</em></h1><p className="lead">Kelola katalog kursus yang mengubah rasa ingin tahu menjadi kemampuan nyata.</p></div><div className="stats"><div><strong>{courses.length}</strong><span>Total kursus</span></div><div><strong>{courses.filter(c => c.is_published).length}</strong><span>Dipublikasikan</span></div></div></section>
    <Chatbot />
    <section className="workspace"><div className="panel form-panel"><div className="panel-heading"><div><p className="eyebrow">{editing ? 'EDIT COURSE' : 'NEW COURSE'}</p><h2>{editing ? 'Perbarui kursus' : 'Tambah kursus'}</h2></div>{editing && <button className="icon-btn" onClick={() => { setEditing(null); setForm(empty) }} aria-label="Batal"><X size={18} /></button>}</div><form onSubmit={submit}>{[['title','Judul kursus'],['instructor','Instruktur'],['category','Kategori'],['duration','Durasi'],['price','Harga']].map(([key,label]) => <label key={key}>{label}<input required={['title','instructor'].includes(key)} type={key === 'price' ? 'number' : 'text'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} /></label>)}<label>Level<select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label><label>Deskripsi<textarea required value={form.description} rows="4" onChange={e => setForm({ ...form, description: e.target.value })} /></label><button className="primary" type="submit"><CirclePlus size={17} /> {editing ? 'Simpan perubahan' : 'Terbitkan kursus'}</button></form></div>
      <div className="catalog"><div className="catalog-top"><div><p className="eyebrow">YOUR CATALOG</p><h2>Semua kursus</h2></div><form className="search" onSubmit={e => { e.preventDefault(); load() }}><Search size={17} /><input placeholder="Cari kursus..." value={query} onChange={e => setQuery(e.target.value)} /></form></div>{error && <div className="error">{error}</div>}{loading ? <div className="empty">Memuat katalog...</div> : courses.length === 0 ? <div className="empty">Belum ada kursus. Tambahkan kursus pertama Anda.</div> : <div className="course-grid">{courses.map(course => <article className="course-card" key={course.id}><div className="course-art"><Layers3 size={28} /><span>{course.category}</span></div><div className="course-body"><div className="card-meta"><span>{course.level}</span><button className={`toggle ${course.is_published ? 'on' : ''}`} onClick={() => toggle(course)}>{course.is_published ? 'Live' : 'Draft'}</button></div><h3>{course.title}</h3><p>{course.description}</p><div className="course-footer"><span>{money.format(course.price)}</span><span>{course.duration}</span></div><div className="actions"><button onClick={() => edit(course)}><Edit3 size={15} /> Edit</button><button className="delete" onClick={() => remove(course.id)}><Trash2 size={15} /> Hapus</button></div></div></article>)}</div>}</div></section>
  </main>
}
export default App
