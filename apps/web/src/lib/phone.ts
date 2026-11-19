export type WaNormalizeResult = { value: string | null; error?: string };

export function normalizeWa(input: unknown): WaNormalizeResult {
	const raw = String(input ?? '').trim();
	if (!raw) return { value: null };
	let s = raw.replace(/[\s-]/g, '');
	if (s.startsWith('+')) {
		// keep as is
	} else if (s.startsWith('00')) {
		s = '+' + s.slice(2);
	} else if (s.startsWith('0')) {
		s = '+62' + s.slice(1);
	} else if (s.startsWith('62')) {
		s = '+' + s;
	} else if (s.startsWith('8')) {
		s = '+62' + s;
	} else {
		return { value: null, error: 'Format nomor WhatsApp tidak valid' };
	}
	if (!/^\+62\d{10,15}$/.test(s)) {
		return { value: null, error: 'Nomor WhatsApp harus 10–15 digit setelah +62' };
	}
	return { value: s };
}