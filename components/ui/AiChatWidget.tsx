'use client'
// components/ui/AiChatWidget.tsx — Widget AI flottant (s'ouvre/ferme au clic)
import { useState, useRef, useEffect } from 'react'
import { chatApi } from '@/lib/api'
import { ChatMessage } from '@/types'
import { useTranslation } from '@/context/TranslationContext'
import { Send, X, MessageCircle } from 'lucide-react'

export default function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const { lang } = useTranslation()
  
  // Le message de bienvenue s'adapte à la langue
  const welcomeMessages: Record<string, string> = {
    fr: "Bonjour ! Je suis Rebecca, l'assistante de la Clinique. Comment puis-je vous aider ?",
    en: "Hello! I'm Rebecca, the Clinic's assistant. How can I help you?",
    es: "¡Hola! Soy Rebecca, la asistente de la Clínica. ¿Cómo puedo ayudarle?",
    ht: "Bonjou! Mwen se Rebecca, asistan Klinik la. Kijan mwen ka ede ou?",
    zh: "您好！我是丽贝卡诊所的助手Rebecca。有什么可以帮助您的吗？",
    pt: "Olá! Sou Rebecca, a assistente da Clínica. Como posso ajudá-lo?",
    ar: "مرحباً! أنا ريبيكا، مساعدة العيادة. كيف يمكنني مساعدتك؟",
  }
  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  // Mettre à jour le message de bienvenue quand la langue change
  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: welcomeMessages[lang] || welcomeMessages.fr
    }])
  }, [lang])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const hist = messages.map(m => ({ role: m.role, content: m.content }))
      // Envoyer la langue courante pour que Claude réponde dans la bonne langue
      const { data } = await chatApi.send(
        lang !== 'fr' ? `[Réponds en ${lang === 'en' ? 'anglais' : lang === 'es' ? 'espagnol' : lang === 'ht' ? 'créole haïtien' : lang === 'zh' ? 'mandarin' : lang === 'pt' ? 'portugais' : lang === 'ar' ? 'arabe' : 'français'}] ${text}` : text,
        hist
      )
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Désolée, une difficulté technique est survenue. Appelez-nous au +509 3888-0000.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ai-chat-widget">
      {open && (
        <div className="ai-chat-window mb-3">
          {/* Header */}
          <div className="bg-[#1641C8] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white">
              <i className="fa-solid fa-hospital-user text-sm" />
            </div>
            <div className="flex-1">
              <h4 className="text-white font-extrabold text-[13.5px]">Rebecca — Assistante</h4>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-blink" />
                <span className="text-white/65 text-[11px]">En ligne · Clinique de la Rebecca</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border-none cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages */}
          <div className="p-4 flex flex-col gap-3 h-72 overflow-y-auto bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col max-w-[85%] ${msg.role === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
                <div className={`px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl
                  ${msg.role === 'user'
                    ? 'bg-[#1641C8] text-white rounded-tr-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                  }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="self-start">
                <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 shadow-sm">
                  {[0, 150, 300].map(d => (
                    <div key={d} className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3 border-t border-slate-100 bg-white">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && send()}
              placeholder="Posez votre question..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-full
                text-sm outline-none focus:border-[#1641C8] focus:bg-white transition-all"
            />
            <button onClick={send} disabled={loading || !input.trim()}
              className="w-9 h-9 bg-[#1641C8] rounded-full flex items-center justify-center
                text-white transition-all hover:bg-[#0f2fa3] disabled:opacity-40
                disabled:cursor-not-allowed border-none cursor-pointer flex-shrink-0">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="ai-chat-toggle"
        title="Parler à l'assistante"
      >
        {open
          ? <X size={22} />
          : <MessageCircle size={22} />
        }
      </button>
    </div>
  )
}
