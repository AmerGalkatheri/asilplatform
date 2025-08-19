import useSWR from 'swr';
import { useEffect, useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function Points() {
	const [token, setToken] = useState('');
	useEffect(() => { setToken(localStorage.getItem('token') || ''); }, []);
	const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
	const { data } = useSWR(token ? `${apiBase}/me/points` : null, fetcher);
	return (
		<main style={{ padding: 24 }}>
			<h1>النقاط</h1>
			<div>الإجمالي: {data?.total ?? 0}</div>
			<ul>
				{(data?.items || []).map((t: any) => (
					<li key={t.id}>{t.points} — {t.reason} — {new Date(t.createdAt).toLocaleString()}</li>
				))}
			</ul>
		</main>
	);
}