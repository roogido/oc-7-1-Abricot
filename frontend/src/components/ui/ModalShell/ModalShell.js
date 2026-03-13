// src/components/ui/ModalShell/ModalShell.js
'use client';

import { useEffect } from 'react';
import Image from 'next/image';

import closeIcon from '@/assets/icons/close-icon.png';

import styles from './ModalShell.module.css';

export default function ModalShell({
	isOpen,
	onClose,
	children,
	ariaLabel = 'Modal',
}) {
	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		function handleKeyDown(event) {
			if (event.key === 'Escape') {
				onClose();
			}
		}

		document.addEventListener('keydown', handleKeyDown);

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen, onClose]);

	if (!isOpen) {
		return null;
	}

	function handleBackdropClick(event) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}

	return (
		<div
			className={styles.backdrop}
			onClick={handleBackdropClick}
			role="presentation"
		>
			<div
				className={styles.modal}
				role="dialog"
				aria-modal="true"
				aria-label={ariaLabel}
			>
				<button
					type="button"
					className={styles.closeButton}
					onClick={onClose}
					aria-label="Fermer"
				>
					<Image
						src={closeIcon}
						alt=""
						aria-hidden="true"
						className={styles.closeIcon}
					/>
				</button>

				{children}
			</div>
		</div>
	);
}
