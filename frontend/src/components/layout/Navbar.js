/**
 * @file app/components/Navbar.js
 * @description
 *
 *
 */

'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
	const { user, logout, isAuthenticated } = useAuth();

	async function handleLogout() {
		await logout();
	}

	return (
		<nav style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
			<Link href="/" style={{ marginRight: 16 }}>
				Abricot
			</Link>

			{isAuthenticated && (
				<>
					<Link href="/dashboard" style={{ marginRight: 16 }}>
						Dashboard
					</Link>

					<Link href="/projects" style={{ marginRight: 16 }}>
						Projects
					</Link>
				</>
			)}

			<span style={{ float: 'right' }}>
				{isAuthenticated ? (
					<>
						{user?.email}
						<button
							onClick={handleLogout}
							style={{ marginLeft: 12 }}
						>
							Logout
						</button>
					</>
				) : (
					<Link href="/login">Login</Link>
				)}
			</span>
		</nav>
	);
}
