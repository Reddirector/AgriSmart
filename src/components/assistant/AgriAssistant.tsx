import { Button } from '@/components/ui';
import { askAgriAssistant,runtimeStatus,type AssistantResponse } from '@/services/agrismartApi';
import { useAppStore } from '@/store';
import { AnimatePresence,motion } from 'framer-motion';
import { Bot,ChevronRight,Loader2,MessageCircle,Send,Sparkles,X } from 'lucide-react';
import { useEffect,useMemo,useRef,useState,type ChangeEvent,type FormEvent } from 'react';
import { useLocation,useNavigate } from 'react-router-dom';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  suggestedRoute?: string;
};

const starterMessages: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Namaste. I am AgriSmart Copilot. I can guide crop-image diagnosis, farm mapping, drone missions, treatment planning, IoT, verification, and payments.',
  },
];

const quickPrompts = [
  'Analyse a crop disease photo',
  'How do I map my farm?',
  'Explain plant-specific spraying',
  'Check the patent claim coverage',
];

export function AgriAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = useAppStore((state) => state.role);
  const reducedMotion = useAppStore((state) => state.reducedMotion);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(starterMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const statusLabel = useMemo(
    () => runtimeStatus.mode === 'connected' ? 'Connected assistant' : 'Local guidance',
    [],
  );

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'end' });
  }, [loading, messages, reducedMotion]);

  useEffect(() => {
    const openAssistant = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail;
      setOpen(true);
      if (detail?.prompt) setInput(detail.prompt);
      window.setTimeout(() => inputRef.current?.focus(), 120);
    };
    window.addEventListener('agrismart:open-assistant', openAssistant);
    return () => window.removeEventListener('agrismart:open-assistant', openAssistant);
  }, []);

  const submitMessage = async (message: string) => {
    const cleanMessage = message.trim();
    if (!cleanMessage || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: cleanMessage,
    };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);

    let diagnosisContext = '';
    try {
      const activeDiagnosis = JSON.parse(localStorage.getItem('agrismart-active-diagnosis') || 'null') as { summary?: string } | null;
      diagnosisContext = activeDiagnosis?.summary || '';
    } catch {
      diagnosisContext = '';
    }
    const response: AssistantResponse = await askAgriAssistant({
      message: cleanMessage,
      pathname: location.pathname,
      role: role || undefined,
      context: diagnosisContext || undefined,
    });

    setMessages((current) => [...current, {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      text: response.answer,
      suggestedRoute: response.suggestedRoute,
    }]);
    setLoading(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void submitMessage(input);
  };

  return (
    <div className={`fixed right-4 z-[120] sm:right-6 ${role ? 'bottom-20 lg:bottom-6' : 'bottom-4 sm:bottom-6'}`}>
      <AnimatePresence>
        {open && (
          <motion.section
            initial={reducedMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: 14, scale: 0.97 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mb-3 flex h-[min(70vh,560px)] w-[min(calc(100vw-2rem),390px)] flex-col overflow-hidden rounded-2xl border border-brand-border/90 bg-brand-card/95 shadow-[0_24px_70px_-24px_rgba(8,42,29,0.4)] backdrop-blur-xl"
            aria-label="AgriSmart Copilot"
          >
            <header className="relative overflow-hidden border-b border-brand-border bg-gradient-to-br from-brand-dark via-brand-primary to-brand-teal px-4 py-3.5 text-white">
              <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" aria-hidden="true" />
              <div className="relative flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-inner">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold">AgriSmart Copilot 🌿</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-white/75"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />{statusLabel}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white" aria-label="Close assistant">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-gradient-to-b from-[#F8FBF8] to-[#F2F5F1] p-4" aria-live="polite">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={reducedMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={message.role === 'user' ? 'ml-8' : 'mr-8'}
                >
                  <div className={message.role === 'user'
                    ? 'rounded-2xl rounded-br-md bg-brand-primary px-3.5 py-2.5 text-sm leading-relaxed text-white shadow-soft'
                    : 'rounded-2xl rounded-bl-md border border-brand-border bg-white px-3.5 py-2.5 text-sm leading-relaxed text-brand-text shadow-card'}>
                    {message.text}
                  </div>
                  {message.suggestedRoute && (
                    <button
                      type="button"
                      className="mt-1.5 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-primary transition hover:bg-brand-soft"
                      onClick={() => {
                        navigate(message.suggestedRoute || '/');
                        setOpen(false);
                      }}
                    >
                      Open relevant screen <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
              {loading && (
                <div className="mr-8 flex items-center gap-2 rounded-2xl rounded-bl-md border border-brand-border bg-white px-3.5 py-2.5 text-sm text-brand-muted shadow-card">
                  <Loader2 className="h-4 w-4 animate-spin" /> Reviewing your farm workflow…
                </div>
              )}
              <div ref={messageEndRef} aria-hidden="true" />
            </div>

            <div className="border-t border-brand-border bg-white/90 p-3">
              {messages.length <= 2 && (
                <div className="mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {quickPrompts.map((prompt) => (
                    <button key={prompt} type="button" onClick={() => void submitMessage(prompt)} className="shrink-0 rounded-full border border-brand-border bg-brand-cream px-3 py-1.5 text-xs font-semibold text-brand-muted transition hover:border-brand-primary/40 hover:text-brand-primary">
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              <form className="flex items-center gap-2" onSubmit={handleSubmit}>
                <label className="sr-only" htmlFor="agrismart-assistant-input">Message AgriSmart Copilot</label>
                <input
                  ref={inputRef}
                  id="agrismart-assistant-input"
                  className="input min-h-10 flex-1 py-2"
                  value={input}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)}
                  placeholder="Ask about your farm…"
                  maxLength={600}
                />
                <Button type="submit" size="sm" disabled={!input.trim() || loading} aria-label="Send message" icon={<Send className="h-4 w-4" />} />
              </form>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        whileHover={reducedMotion ? undefined : { scale: 1.04, y: -2 }}
        whileTap={reducedMotion ? undefined : { scale: 0.97 }}
        onClick={() => {
          setOpen((current) => !current);
          window.setTimeout(() => inputRef.current?.focus(), 120);
        }}
        className="group relative ml-auto flex min-h-12 items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-brand-primary via-brand-teal to-brand-sky px-4 py-3 font-semibold text-white shadow-[0_14px_35px_-14px_rgba(8,42,29,0.8)] ring-1 ring-white/30"
        aria-expanded={open}
        aria-label={open ? 'Close AgriSmart Copilot' : 'Open AgriSmart Copilot'}
      >
        <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-[120%]" aria-hidden="true" />
        {open ? <X className="relative h-5 w-5" /> : <MessageCircle className="relative h-5 w-5" />}
        <span className="relative hidden sm:inline">Ask AgriSmart</span>
        {!open && <Sparkles className="relative h-3.5 w-3.5 text-amber-200" />}
      </motion.button>
    </div>
  );
}
