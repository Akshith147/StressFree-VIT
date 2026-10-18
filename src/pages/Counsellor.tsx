import { Card, PageHeader } from '../components/ui';

export default function Counsellor() {
  return <>
    <PageHeader title="Talk to a counsellor" subtitle="Demo only. No request is sent and no counsellor will contact you through this page." />
    <Card><p className="text-sm font-semibold text-orange-800">Coming soon</p><p className="mt-2 text-sm leading-relaxed text-stone-500">The demo request screen is coming soon. For help now, use the helpline in the footer.</p></Card>
  </>;
}
