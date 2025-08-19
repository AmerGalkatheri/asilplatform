import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

function Nav() {
	const [user, setUser] = useState<{role?: string} | null>(null);
	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) return;
		fetch(`${apiBase}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
			.then(r => r.ok ? r.json() : null)
			.then(j => setUser(j)).catch(() => setUser(null));
	}, []);
	const logout = () => { localStorage.removeItem('token'); location.reload(); };
	const isAdmin = user?.role === 'ADMIN';
	return (
		<nav style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
			<Link href="/">الرئيسية</Link>
			<Link href="/courses">الدورات</Link>
			<Link href="/applications">طلباتي</Link>
			<Link href="/resumes/upload">رفع السيرة</Link>
			<Link href="/me/notifications">إشعاراتي</Link>
			<Link href="/me/points">نقاطي</Link>
			<span style={{ flex: 1 }} />
			{isAdmin && <Link href="/admin/jobs">إدارة الوظائف</Link>}
			{isAdmin && <Link href="/admin/users">إدارة المستخدمين</Link>}
			{!user ? (
				<>
					<Link href="/login">دخول</Link>
					<Link href="/register">تسجيل</Link>
				</>
			) : (
				<button onClick={logout}>خروج</button>
			)}
		</nav>
	);
}

export default function App({ Component, pageProps }: AppProps) {
	return (
		<div style={{ fontFamily: 'system-ui, sans-serif' }}>
			<Nav />
			<Component {...pageProps} />
		</div>
	);
}

