/**
 * @file src/components/ui/ModalShell/ModalShell.js
 * @description
 * Coquille de modale reutilisable avec fermeture clavier et clic exterieur.
 */

'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

import closeIcon from '@/assets/icons/close-icon.png';

import styles from './ModalShell.module.css';

/**
 * Affiche une modale reutilisable autour d'un contenu libre.
 */
export default function ModalShell({
	isOpen,
	onClose,
	children,
	ariaLabel = 'Modal',
}) {
	const dialogRef = useRef(null);
	const onCloseRef = useRef(onClose);
	const previousFocusedElementRef = useRef(null);

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		previousFocusedElementRef.current = document.activeElement;

		// Place le focus dans la modale a l'ouverture, puis le confine avec Tab.
		function focusFirstElement() {
			if (!dialogRef.current) {
				return;
			}

			const focusableElements = dialogRef.current.querySelectorAll(
				'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
			);

			const firstFocusableElement = focusableElements[0];

			if (firstFocusableElement instanceof HTMLElement) {
				firstFocusableElement.focus();
				return;
			}

			dialogRef.current.focus();
		}

		function handleKeyDown(event) {
			if (event.key === 'Escape') {
				onCloseRef.current();
				return;
			}

			if (event.key !== 'Tab' || !dialogRef.current) {
				return;
			}

			const focusableElements = Array.from(
				dialogRef.current.querySelectorAll(
					'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
				),
			).filter((element) => element instanceof HTMLElement);

			if (focusableElements.length === 0) {
				event.preventDefault();
				dialogRef.current.focus();
				return;
			}

			const firstFocusableElement = focusableElements[0];
			const lastFocusableElement =
				focusableElements[focusableElements.length - 1];
			const activeElement = document.activeElement;

			if (
				event.shiftKey &&
				(activeElement === firstFocusableElement ||
					activeElement === dialogRef.current)
			) {
				event.preventDefault();
				lastFocusableElement.focus();
				return;
			}

			if (!event.shiftKey && activeElement === lastFocusableElement) {
				event.preventDefault();
				firstFocusableElement.focus();
			}
		}

		document.addEventListener('keydown', handleKeyDown);
		focusFirstElement();

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.body.style.overflow = previousOverflow;

			if (
				previousFocusedElementRef.current instanceof HTMLElement &&
				document.contains(previousFocusedElementRef.current)
			) {
				previousFocusedElementRef.current.focus();
			}
		};
	}, [isOpen]);

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
				ref={dialogRef}
				className={styles.modal}
				role="dialog"
				aria-modal="true"
				aria-label={ariaLabel}
				tabIndex="-1"
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
