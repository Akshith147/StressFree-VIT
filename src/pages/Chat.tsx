import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import CrisisCard from '../components/CrisisCard';
import { Button, PageHeader } from '../components/ui';
import chatData from '../data/chatbot.json';
import { getReply } from '../lib/chatbot';

interface Message {
  id: number;
  from: 'user' | 'bot';
  text: string;
  crisis: boolean;
}

const MESSAGE_MAX = 500;
const TYPING_DELAY_MS = 500; // a short pause so replies don't appear instantly

export default function Chat() {
  // Messages live only in this component, so nothing is saved and a refresh clears the chat.
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: 'bot', text: chatData.greeting, crisis: false }]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const nextId = useRef(1);
  const timer = useRef<number | undefined>(undefined);
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // Stop a pending reply if the student leaves the page while the bot is "typing".
  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Scroll only the message box, not the whole page. Aiming at the top of the newest message
  // keeps a long crisis reply readable from its first line; short messages just end up at the bottom.
  useEffect(() => {
    const box = log.current;
    const newest = box?.lastElementChild;
    if (box && newest instanceof HTMLElement) box.scrollTop = newest.offsetTop - 16;
  }, [messages, typing]);

  const hasUserMessage = messages.some((message) => message.from === 'user');

  function send(text: string) {
    const message = text.trim();
    // One reply at a time; the draft stays in the box so nothing typed is lost.
    if (message === '' || typing) return;
    const userId = nextId.current++;
    setMessages((current) => [...current, { id: userId, from: 'user', text: message, crisis: false }]);
    setDraft('');
    setTyping(true);
    timer.current = window.setTimeout(() => {
      const reply = getReply(message);
      const botId = nextId.current++;
      setMessages((current) => [...current, { id: botId, from: 'bot', text: reply.text, crisis: reply.crisis }]);
      setTyping(false);
    }, TYPING_DELAY_MS);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(draft);
  }

  // The starter buttons disappear after the first message, so move focus back to the input.
  function sendStarter(text: string) {
    send(text);
    input.current?.focus();
  }

  return <>
    <PageHeader title="Talk it through" subtitle="A simple support bot with tips written by our team. It doesn’t understand everything, and it isn’t a counsellor." />
    <p className="mb-4 text-xs text-stone-600">Chats are not saved. Refreshing the page clears them.</p>

    <div ref={log} role="log" aria-label="Conversation" className="relative h-[60dvh] min-h-72 space-y-4 overflow-y-auto rounded-lg border border-stone-300 bg-white p-4 sm:p-6">
      {messages.map((message, index) => message.from === 'user'
        ? <div key={message.id} className="flex justify-end">
          <p className="max-w-[80%] rounded-lg bg-orange-800 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap text-white wrap-anywhere"><span className="sr-only">You: </span>{message.text}</p>
        </div>
        : <div key={message.id}>
          <div className="max-w-[80%]">
            <p className="rounded-lg border border-stone-300 bg-amber-50 px-4 py-3 text-sm leading-relaxed text-stone-800"><span className="sr-only">Support bot: </span>{message.text}</p>
            {/* Every reply offers the counsellor route; the greeting is not a reply. */}
            {index > 0 && <Link to="/counsellor" className="mt-1 inline-flex min-h-8 items-center text-xs font-semibold text-orange-800 underline underline-offset-4 hover:text-orange-900">Talk to a counsellor →</Link>}
          </div>
          {message.crisis && <div className="mt-3"><CrisisCard /></div>}
        </div>)}
      {typing && <p className="w-fit rounded-lg border border-stone-300 bg-amber-50 px-4 py-3 text-sm text-stone-600">typing…</p>}
    </div>

    {!hasUserMessage && <div role="group" aria-label="Suggested messages" className="mt-4 flex flex-wrap gap-2">
      {chatData.starters.map((starter) => <Button key={starter} variant="secondary" onClick={() => sendStarter(starter)}>{starter}</Button>)}
    </div>}

    <form onSubmit={submit} className="mt-4 flex gap-2">
      <label htmlFor="chat-message" className="sr-only">Your message</label>
      {/* text-base keeps iPhones from zooming in when the input is focused */}
      <input ref={input} id="chat-message" type="text" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={MESSAGE_MAX} autoComplete="off" placeholder="Type a message" className="min-h-11 min-w-0 flex-1 rounded-md border border-stone-300 bg-white px-3 text-base placeholder:text-stone-500" />
      <Button type="submit">Send</Button>
    </form>
  </>;
}
