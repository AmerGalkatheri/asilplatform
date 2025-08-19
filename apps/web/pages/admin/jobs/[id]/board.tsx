import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useEffect, useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const fetcherAuthed = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

const STATUSES = ['RECEIVED', 'UNDER_REVIEW', 'INTERVIEW', 'REJECTED', 'HIRED'];

export default function Board() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [token, setToken] = useState('');
  useEffect(() => { setToken(localStorage.getItem('token') || ''); }, []);
  const { data, mutate } = useSWR(id && token ? [`${apiBase}/jobs/${id}/applicants/board`, token] : null, ([url, t]) => fetcherAuthed(url, t));

  const updateStatus = async (appId: string, status: string) => {
    if (!token) return alert('سجّل الدخول');
    await fetch(`${apiBase}/applications/${appId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status }) });
    mutate();
  };

  const setRating = async (appId: string, rating: number) => {
    if (!token) return alert('سجّل الدخول');
    await fetch(`${apiBase}/applications/${appId}/rating`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ rating }) });
    mutate();
  };

  const addNote = async (appId: string, content: string) => {
    if (!token) return alert('سجّل الدخول');
    await fetch(`${apiBase}/applications/${appId}/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ content }) });
    mutate();
  };

  if (!id) return null;
  if (!data) return <main style={{ padding: 24 }}>Loading...</main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>لوحة المتقدمين</h1>
      <div style={{ display: 'flex', gap: 16 }}>
        {STATUSES.map((s) => (
          <div key={s} style={{ flex: 1, border: '1px solid #ddd', borderRadius: 8, padding: 8 }}>
            <h3>{s}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(data?.columns?.[s] || []).map((a: any) => (
                <div key={a.id} style={{ border: '1px solid #eee', borderRadius: 6, padding: 8, display:'flex', flexDirection:'column', gap:6 }}>
                  <div>{a.user?.email}</div>
                  <div>Rating: {a.rating ?? '-'} { [1,2,3,4,5].map(n => (<button key={n} onClick={() => setRating(a.id, n)}>{n}</button>)) }</div>
                  <div>Notes: {a._count?.notes ?? 0}</div>
                  <form onSubmit={(e) => { e.preventDefault(); const input = (e.currentTarget.elements.namedItem('note') as HTMLInputElement); const val = input.value.trim(); if (val) { addNote(a.id, val); input.value=''; } }}>
                    <input name="note" placeholder="أضف ملاحظة" />
                    <button type="submit">إضافة</button>
                  </form>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    {STATUSES.filter(st => st !== s).map(st => (
                      <button key={st} onClick={() => updateStatus(a.id, st)}>{st}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

