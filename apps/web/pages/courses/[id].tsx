import { useRouter } from 'next/router';
import useSWR from 'swr';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function CourseDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { data } = useSWR(id ? `${apiBase}/courses/${id}` : null, fetcher);

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

  if (!id || !data) return <main style={{ padding: 24 }}>Loading...</main>;
  return (
    <main style={{ padding: 24 }}>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <button onClick={enroll}>تسجيل</button>
      <button onClick={checkProgress} style={{ marginInlineStart: 8 }}>عرض التقدم</button>
    </main>
  );
}

