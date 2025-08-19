import useSWR from 'swr';
import { useEffect, useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function useToken() {
	const [token, setToken] = useState('');
	useEffect(() => { setToken(localStorage.getItem('token') || ''); }, []);
	return token;
}

export default function AdminUsers() {
	const token = useToken();
	const fetcher = (url: string) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
	const { data, mutate } = useSWR(token ? `${apiBase}/admin/users` : null, fetcher);
	const roles = ['ADMIN','RECRUITER','INSTRUCTOR','TALENT'];

	const setRole = async (id: string, role: string) => {
		await fetch(`${apiBase}/admin/users/${id}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ role }) });
		mutate();
	};

	return (
		<main style={{ padding: 24 }}>
			<h1>إدارة المستخدمين</h1>
			<table style={{ width: '100%', borderCollapse: 'collapse' }}>
				<thead>
					<tr>
						<th style={{ textAlign: 'start' }}>Email</th>
						<th style={{ textAlign: 'start' }}>Role</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{(data?.items || []).map((u: any) => (
						<tr key={u.id}>
							<td>{u.email}</td>
							<td>{u.role}</td>
							<td>
								{roles.map(r => (
									<button key={r} disabled={u.role===r} onClick={() => setRole(u.id, r)} style={{ marginInlineEnd: 6 }}>{r}</button>
								))}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</main>
	);
}