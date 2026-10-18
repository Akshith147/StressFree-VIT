import { Card, PageHeader } from '../components/ui';

export default function Chat() {
  return <>
    <PageHeader title="Chat" subtitle="Keyword support chatbot." />
    <Card><p className="text-sm font-semibold text-orange-800">Coming soon</p><p className="mt-2 text-sm leading-relaxed text-stone-500">The chatbot is coming soon. No chat messages are collected or sent in this build.</p></Card>
  </>;
}
