import { useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function Login() {
  const [email, setEmail] = useState('demo@obar.local');
  const [password, setPassword] = useState('password123');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${apiBase}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!res.ok) { setError('فشل تسجيل الدخول'); return; }
    const data = await res.json();
    setToken(data.token);
    localStorage.setItem('token', data.token);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>تسجيل الدخول</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">دخول</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {token && <p>Token saved</p>}
    </main>
  );
}

