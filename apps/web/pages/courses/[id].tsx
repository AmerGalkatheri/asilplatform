import { useRouter } from 'next/router';
import useSWR from 'swr';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { data, mutate } = useSWR(id ? `${apiBase}/courses/${id}` : null, fetcher);

  const enroll = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('سجّل الدخول أولاً'); return; }
    await fetch(`${apiBase}/courses/${id}/enroll`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    alert('تم التسجيل');
  };

  const checkProgress = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('سجّل الدخول أولاً'); return; }
    const res = await fetch(`${apiBase}/courses/${id}/progress`, { headers: { Authorization: `Bearer ${token}` } });
    const j = await res.json();
    alert(`التقدم: ${j.progress}% — ${j.status}`);
  };

  const updateProgress = async (progress: number) => {
    const token = localStorage.getItem('token');
    if (!token) { alert('سجّل الدخول أولاً'); return; }
    await fetch(`${apiBase}/courses/${id}/progress`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ progress }) });
    await checkProgress();
  };

  if (!id || !data) return <main style={{ padding: 24 }}>Loading...</main>;
  return (
    <main style={{ padding: 24 }}>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <button onClick={enroll}>تسجيل</button>
      <button onClick={checkProgress} style={{ marginInlineStart: 8 }}>عرض التقدم</button>
      <div style={{ marginTop: 12 }}>
        <span>تحديث التقدم:</span>
        {[25,50,75,100].map(p => <button key={p} onClick={() => updateProgress(p)} style={{ marginInlineStart: 6 }}>{p}%</button>)}
      </div>
      <h3 style={{ marginTop: 24 }}>الدروس</h3>
      <ol>
        {(data?.lessons || []).map((l: any) => (
          <li key={l.id}><strong>{l.order}. {l.title}</strong><div>{l.content}</div></li>
        ))}
      </ol>
    </main>
  );
}

