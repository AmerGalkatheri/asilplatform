import useSWR from 'swr';
import Link from 'next/link';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Home() {
  const { data } = useSWR(`${apiBase}/jobs`, fetcher);
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>obar talent hub</h1>
      <p>وظائف متاحة</p>
      <ul>
        {(data?.items || []).map((j: any) => (
          <li key={j.id}>
            <Link href={`/jobs/${j.id}`}>{j.title}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

