import useSWR from 'swr';
import { useEffect, useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function Notifications() {
	const [token, setToken] = useState('');
	useEffect(() => { setToken(localStorage.getItem('token') || ''); }, []);
	const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
	const { data, mutate } = useSWR(token ? `${apiBase}/me/notifications` : null, fetcher);
	const mark = async (id: string) => {
		await fetch(`${apiBase}/me/notifications/${id}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
		mutate();
	};
	return (
		<main style={{ padding: 24 }}>
			<h1>الإشعارات</h1>
			<ul>
				{(data?.items || []).map((n: any) => (
					<li key={n.id}>
						<span>{n.message}</span>
						{!n.readAt && <button onClick={() => mark(n.id)} style={{ marginInlineStart: 8 }}>تعليم كمقروء</button>}
					</li>
				))}
			</ul>
		</main>
	);
}