import useSWR from 'swr';
import Link from 'next/link';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function Courses() {
  const { data } = useSWR(`${apiBase}/courses`, fetcher);
  return (
    <main style={{ padding: 24 }}>
      <h1>الدورات</h1>
      <ul>
        {(data?.items || []).map((c: any) => (
          <li key={c.id}><Link href={`/courses/${c.id}`}>{c.title}</Link></li>
        ))}
      </ul>
    </main>
  );
}

