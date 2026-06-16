import { useState, useEffect, useRef } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>
    return part
  })
}

function MarkdownText({ text }) {
  const lines = text.split('\n')
  return (
    <div className="space-y-0.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (/^#{1,3} /.test(line)) {
          const level = line.match(/^(#+) /)[1].length
          const content = line.replace(/^#+\s/, '')
          const cls = level === 1
            ? 'font-bold text-base mt-3 mb-0.5'
            : level === 2
            ? 'font-bold mt-2 mb-0.5'
            : 'font-semibold mt-1.5 mb-0.5 text-slate-700'
          return <p key={i} className={cls}>{renderInline(content)}</p>
        }
        if (/^\s*[\*\-]\s+/.test(line)) {
          const content = line.replace(/^\s*[\*\-]\s+/, '')
          return (
            <div key={i} className="flex gap-1.5 ml-3">
              <span className="shrink-0 mt-1 w-1 h-1 rounded-full bg-slate-400 inline-block" />
              <span>{renderInline(content)}</span>
            </div>
          )
        }
        if (/^\d+\.\s/.test(line)) {
          const num = line.match(/^(\d+)\./)[1]
          const content = line.replace(/^\d+\.\s+/, '')
          return (
            <div key={i} className="flex gap-2 ml-3">
              <span className="shrink-0 text-slate-400 font-medium">{num}.</span>
              <span>{renderInline(content)}</span>
            </div>
          )
        }
        if (/^-{3,}$/.test(line.trim()))
          return <hr key={i} className="border-slate-200 my-2" />
        if (line.trim() === '')
          return <div key={i} className="h-2" />
        return <p key={i}>{renderInline(line)}</p>
      })}
    </div>
  )
}

function ThinkingDots() {
  return (
    <div className="flex items-end gap-3 max-w-[80%]">
      <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mb-0.5">
        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

function Message({ role, content }) {
  const isUser = role === 'user'
  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse max-w-[80%] ml-auto' : 'max-w-[80%]'}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mb-0.5">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className={`rounded-2xl px-4 py-3 shadow-sm ${
        isUser
          ? 'bg-emerald-500 text-white rounded-br-sm'
          : 'bg-white text-slate-800 rounded-bl-sm'
      }`}>
        {isUser
          ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          : <MarkdownText text={content} />
        }
      </div>
    </div>
  )
}

export default function KiAssist() {
  const [history, setHistory] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history, loading])

  const sendMessage = async () => {
    const message = input.trim()
    if (!message || loading) return

    setInput('')
    setError(null)
    setLoading(true)

    // Optimistic update: show user message immediately
    setHistory(prev => [...prev, { role: 'user', parts: message }])

    try {
      const res = await fetch(API_URL + '/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Fehler ${res.status}`)
      }
      const data = await res.json()
      setHistory(data.history)
    } catch (e) {
      setError(e.message)
      // Remove the optimistic user message on error
      setHistory(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setHistory([])
    setError(null)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900">KI Finanzassistent</h1>
            <p className="text-xs text-slate-500">Kennt deine persönlichen Finanzdaten</p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Chat leeren
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {history.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-slate-700 mb-1">Wie kann ich dir helfen?</p>
              <p className="text-sm text-slate-400 max-w-sm">
                Ich kenne deine Finanzdaten und kann dir personalisierte Empfehlungen geben.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 w-full max-w-md">
              {[
                'Wie ist meine aktuelle Sparquote?',
                'Kann ich meine Ziele erreichen?',
                'Wie viel Notgroschen brauche ich?',
                'Was ist mein Nettovermögen?',
              ].map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => { setInput(suggestion); textareaRef.current?.focus() }}
                  className="text-left text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <Message key={i} role={msg.role} content={msg.parts} />
        ))}

        {loading && <ThinkingDots />}

        {error && (
          <div className="flex justify-center">
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {error}
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-white border-t border-slate-200 px-4 py-4">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Schreibe eine Nachricht… (Enter zum Senden, Shift+Enter für neue Zeile)"
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:opacity-50 max-h-36 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
            onInput={e => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 144) + 'px'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
          >
            {loading
              ? <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            }
          </button>
        </div>
        <p className="text-center text-xs text-slate-300 mt-2">
          KI-Assistent · Powered by Gemini · Antworten können Fehler enthalten
        </p>
      </div>
    </div>
  )
}
