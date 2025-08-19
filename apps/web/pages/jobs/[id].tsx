import { useRouter } from 'next/router';
import useSWR from 'swr';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function JobDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const { data } = useSWR(id ? `${apiBase}/jobs/${id}` : null, fetcher);
  const apply = async () => {
    const token = localStorage.getItem('token');
    if (!token) { alert('سجّل الدخول أولاً'); return; }
    await fetch(`${apiBase}/applications`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ jobId: id }) });
    alert('تم التقديم');
  };

  if (!id) return null;
  if (!data) return <p style={{ padding: 24 }}>Loading...</p>;

  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>{data.title}</h1>
      <p>{data.location} • {data.contractType} • {data.experienceLevel}</p>
      <p>الراتب: {data.salaryMin} - {data.salaryMax}</p>
      <button onClick={apply}>تقديم</button>
    </main>
  );
}

