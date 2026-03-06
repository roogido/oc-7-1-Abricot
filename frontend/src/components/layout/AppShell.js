/**
 * @file app/components/AppShell.js
 * @description
 *
 *
 */

'use client';

import Navbar from './Navbar';

export default function AppShell({ children }) {
	return (
		<>
			<Navbar />
			<main style={{ padding: 24 }}>{children}</main>
		</>
	);
}
