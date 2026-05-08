'use client'
// components/ui/AiChat.tsx
import { useState, useRef, useEffect } from 'react'
import { chatApi } from '@/lib/api'
import { ChatMessage } from '@/types'
import { Send } from 'lucide-react'

export default function AiChat() {
 const [messages, setMessages] = useState<ChatMessage[]>([
 { role: 'assistant', content: "Bonjour ! Je suis Rebecca, l'assistante IA de la clinique. Comment puis-je vous aider ? " },
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
 setMessages(prev => [...prev, { role: 'user', content: text }])
 setInput('')
 setLoading(true)
 try {
 const hist = messages.map(m => ({ role: m.role, content: m.content }))
 const { data } = await chatApi.send(text, hist)
 setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
 } catch {
 setMessages(prev => [...prev, {
 role: 'assistant',
 content: 'Désolée, difficulté technique. Appelez le +509 3888-0000.'
 }])
 } finally {
 setLoading(false)
 }
 }

 return (
 <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
 {/* Header */}
 <div className="bg-[#1641C8] px-4 py-3 flex items-center gap-3">
 <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-lg"></div>
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
 <div className={`px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl
 ${msg.role === 'user'
 ? 'bg-[#1641C8] text-white rounded-tr-sm'
 : 'bg-slate-100 border border-slate-200 text-slate-900 rounded-tl-sm'
 }`}>
 {msg.content}
 </div>
 <span className="text-[10.5px] text-slate-400 mt-1 px-1">
 {new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 ))}

 {loading && (
 <div className="self-start max-w-[84%]">
 <div className="bg-slate-100 border border-slate-200 px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5">
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
 <div className="flex gap-2 p-3 border-t border-slate-100">
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
 disabled:cursor-not-allowed border-none cursor-pointer">
 <Send size={14} />
 </button>
 </div>
 </div>
 )
}
