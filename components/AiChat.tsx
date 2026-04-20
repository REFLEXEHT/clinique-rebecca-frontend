'use client'
import { useState, useRef, useEffect } from 'react'
import { chatApi } from '@/lib/api'
import { ChatMessage } from '@/types'
import { Send } from 'lucide-react'

export default function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Bonjour ! Je suis Rebecca, l'assistante IA de la Clinique de la Rebecca. Comment puis-je vous aider aujourd'hui ? 😊",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: ChatMessage = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const historique = messages.map((m) => ({ role: m.role, content: m.content }))
      const { data } = await chatApi.send(text, historique)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Désolée, je rencontre une difficulté. Appelez-nous au +509 3888-0000." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const now = new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-[#1a4fc4] px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg">🏥</div>
        <div>
          <h4 className="text-white font-extrabold text-[13.5px]">Rebecca — IA Clinique</h4>
          <span className="text-white/70 text-[11px]">Assistant médical</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 bg-green-400 rounded-full border-2 border-white/50 animate-blink" />
          <span className="text-white/60 text-xs">En ligne</span>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 flex flex-col gap-3 h-72 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col max-w-[84%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
            <div
              className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? 'msg-user rounded-2xl rounded-tr-sm'
                  : 'msg-bot rounded-2xl rounded-tl-sm'
              }`}
              dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
            />
            <span className="text-[10.5px] text-gray-400 mt-1 px-1">{now}</span>
          </div>
        ))}

        {loading && (
          <div className="self-start max-w-[84%]">
            <div className="msg-bot px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5">
              {[0, 150, 300].map((d) => (
                <div
                  key={d}
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${d}ms` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-gray-100">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && send()}
          placeholder="Posez votre question..."
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm
          outline-none focus:border-[#1a4fc4] focus:bg-white transition-all"
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="w-9 h-9 bg-[#1a4fc4] rounded-full flex items-center justify-center
          text-white transition-all hover:bg-[#0f3399] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
