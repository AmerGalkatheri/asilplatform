import type { AppProps } from 'next/app';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function Nav() {
  const [hasToken, setHasToken] = useState(false);
  useEffect(() => { setHasToken(!!localStorage.getItem('token')); }, []);
  const logout = () => { localStorage.removeItem('token'); location.reload(); };
  return (
    <nav style={{ display: 'flex', gap: 12, alignItems: 'center', padding: 12, borderBottom: '1px solid #eee', position: 'sticky', top: 0, background: '#fff', zIndex: 10 }}>
      <Link href="/">الرئيسية</Link>
      <Link href="/courses">الدورات</Link>
      <Link href="/applications">طلباتي</Link>
      <Link href="/resumes/upload">رفع السيرة</Link>
      <Link href="/me/notifications">إشعاراتي</Link>
      <Link href="/me/points">نقاطي</Link>
      <span style={{ flex: 1 }} />
      <Link href="/admin/jobs">إدارة الوظائف</Link>
      <Link href="/admin/users">إدارة المستخدمين</Link>
      {!hasToken ? (
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

