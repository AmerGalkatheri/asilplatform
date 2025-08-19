import useSWR from 'swr';
import { useEffect, useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const fetcher = (url: string, token: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());

export default function MyApplications() {
  const [token, setToken] = useState('');
  useEffect(() => { setToken(localStorage.getItem('token') || ''); }, []);
  const { data } = useSWR(token ? [`${apiBase}/applications/me`, token] : null, ([url, t]) => fetcher(url, t));
  return (
    <main style={{ padding: 24 }}>
      <h1>طلباتي</h1>
      <ul>
        {(data?.items || []).map((a: any) => (
          <li key={a.id}>{a.jobId} — {a.status}</li>
        ))}
      </ul>
    </main>
  );
}

