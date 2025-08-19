import useSWR from 'swr';
import Link from 'next/link';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function AdminJobs() {
  const { data } = useSWR(`${apiBase}/jobs`, fetcher);
  return (
    <main style={{ padding: 24 }}>
      <h1>لوحة إدارة الوظائف</h1>
      <p>
        <Link href="/login">تسجيل الدخول</Link> ·{' '}
        <Link href="/register">تسجيل</Link> ·{' '}
        <Link href="/applications">طلباتي</Link>
      </p>
      <ul>
        {(data?.items || []).map((j: any) => (
          <li key={j.id}>
            {j.title} — <Link href={`/admin/jobs/${j.id}/board`}>لوحة المتقدمين</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

