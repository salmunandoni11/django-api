import { useState } from 'react'
import { Bot, Send, X } from 'lucide-react'
import { chatApi } from './api'

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Halo! Tanyakan sesuatu berdasarkan user guide.' },
  ])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const value = question.trim()
    if (!value || loading) return
    setMessages((current) => [...current, { role: 'user', text: value }])
    setQuestion('')
    setLoading(true)
    try {
      const result = await chatApi.ask(value)
      setMessages((current) => [...current, {
        role: 'bot',
        text: result.answer,
        sources: result.sources,
      }])
    } catch (error) {
      setMessages((current) => [...current, { role: 'bot', text: error.message }])
    } finally {
      setLoading(false)
    }
  }

  return <div className={`chatbot-widget ${open ? 'is-open' : ''}`}>
    {open && <section className="chatbot" aria-label="Chat dengan user guide">
      <div className="chatbot-heading">
        <div><p className="eyebrow">AI REFERENCE ASSISTANT</p><h2>Chat dengan user guide</h2></div>
        <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Tutup chatbot"><X size={19} /></button>
      </div>
      <div className="chat-messages" aria-live="polite">
        {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
          <p>{message.text}</p>
          {message.sources?.length > 0 && <small>Sumber: {message.sources.join(', ')}</small>}
        </div>)}
        {loading && <div className="chat-message bot"><p>Mencari di referensi...</p></div>}
      </div>
      <form className="chat-form" onSubmit={submit}>
        <input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Tulis pertanyaan..." aria-label="Pertanyaan chatbot" />
        <button type="submit" aria-label="Kirim pertanyaan"><Send size={17} /></button>
      </form>
    </section>}
    <button className="chatbot-toggle" onClick={() => setOpen((current) => !current)} aria-label={open ? 'Tutup chatbot' : 'Buka chatbot'}>
      {open ? <X size={24} /> : <Bot size={24} />}
    </button>
  </div>
}
