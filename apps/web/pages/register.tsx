import { useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await fetch(`${apiBase}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!res.ok) { setError('فشل التسجيل'); return; }
    setOk(true);
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>إنشاء حساب</h1>
      <form onSubmit={onSubmit}>
        <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">تسجيل</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {ok && <p>تم إنشاء الحساب</p>}
    </main>
  );
}

