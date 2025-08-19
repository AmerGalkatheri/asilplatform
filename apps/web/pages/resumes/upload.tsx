import { useEffect, useState } from 'react';

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function UploadResume() {
	const [token, setToken] = useState('');
	const [file, setFile] = useState<File | null>(null);
	const [last, setLast] = useState<any>(null);
	useEffect(() => { setToken(localStorage.getItem('token') || ''); }, []);

	const onUpload = async () => {
		if (!token || !file) return;
		const fd = new FormData();
		fd.append('file', file);
		const up = await fetch(`${apiBase}/resumes/upload`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd });
		const j = await up.json();
		const pr = await fetch(`${apiBase}/resumes/${j.id}/parse`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
		const pj = await pr.json();
		setLast(pj);
	};

	return (
		<main style={{ padding: 24 }}>
			<h1>رفع السيرة الذاتية</h1>
			<input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} />
			<button onClick={onUpload} disabled={!file}>رفع وتحليل</button>
			{last && (
				<div style={{ marginTop: 16 }}>
					<h3>نتيجة التحليل</h3>
					<div>Skills: {last.skillsCsv || '-'}</div>
					<div>Summary: {last.summary || '-'}</div>
				</div>
			)}
		</main>
	);
}