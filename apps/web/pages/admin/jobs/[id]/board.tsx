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
                <div key={a.id} style={{ border: '1px solid #eee', borderRadius: 6, padding: 8 }}>
                  <div>{a.user?.email}</div>
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

