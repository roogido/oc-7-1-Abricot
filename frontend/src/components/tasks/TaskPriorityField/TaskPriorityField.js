/**
 * @file src/components/tasks/TaskPriorityField/TaskPriorityField.js
 * @description
 * Champ partagé de sélection de priorité pour les modales de tâche.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import arrowDownIcon from '@/assets/icons/arrow-down-icon.png';

import styles from './TaskPriorityField.module.css';

const PRIORITY_OPTIONS = [
	{ value: 'LOW', label: 'Faible' },
	{ value: 'MEDIUM', label: 'Moyenne' },
	{ value: 'HIGH', label: 'Haute' },
];

export default function TaskPriorityField({
	id,
	label = 'Priorité*',
	value = 'LOW',
	onChange,
}) {
	const [isOpen, setIsOpen] = useState(false);
	const boxRef = useRef(null);
	const triggerRef = useRef(null);
	const optionRefs = useRef([]);

	const labelId = `${id}-label`;
	const panelId = `${id}-panel`;

	// Gere le clic exterieur pour se comporter comme un select custom.
	useEffect(() => {
		function handleDocumentClick(event) {
			if (boxRef.current && !boxRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}

		document.addEventListener('mousedown', handleDocumentClick);

		return () => {
			document.removeEventListener('mousedown', handleDocumentClick);
		};
	}, []);

	// Traduit la valeur interne en libelle lisible pour l'interface.
	const currentPriorityLabel =
		PRIORITY_OPTIONS.find((option) => option.value === value)?.label ??
		'Faible';
	const currentOptionIndex = Math.max(
		0,
		PRIORITY_OPTIONS.findIndex((option) => option.value === value),
	);

	function focusTrigger() {
		if (triggerRef.current instanceof HTMLButtonElement) {
			triggerRef.current.focus();
		}
	}

	function focusOptionAt(index) {
		const target = optionRefs.current[index];

		if (target instanceof HTMLButtonElement) {
			target.focus();
		}
	}

	function closePanel({ returnFocus = false } = {}) {
		setIsOpen(false);

		if (returnFocus) {
			requestAnimationFrame(() => {
				focusTrigger();
			});
		}
	}

	function handleSelect(priority) {
		onChange(priority);
		closePanel({ returnFocus: true });
	}

	function handleTriggerKeyDown(event) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();

			if (!isOpen) {
				setIsOpen(true);

				requestAnimationFrame(() => {
					focusOptionAt(currentOptionIndex);
				});

				return;
			}

			focusOptionAt(currentOptionIndex);
		}

		if (event.key === 'Escape' && isOpen) {
			event.preventDefault();
			closePanel();
		}
	}

	function handleOptionKeyDown(event, index) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closePanel({ returnFocus: true });
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			focusOptionAt((index + 1) % PRIORITY_OPTIONS.length);
			return;
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault();
			focusOptionAt(
				(index - 1 + PRIORITY_OPTIONS.length) %
					PRIORITY_OPTIONS.length,
			);
		}
	}

	return (
		<div className={styles.field}>
			<label id={labelId} htmlFor={id} className={styles.label}>
				{label}
			</label>

			<div ref={boxRef} className={styles.priorityBox}>
				<button
					ref={triggerRef}
					id={id}
					type="button"
					className={styles.selectLike}
					onClick={() => setIsOpen((prev) => !prev)}
					onKeyDown={handleTriggerKeyDown}
					aria-expanded={isOpen}
					aria-controls={panelId}
					aria-haspopup="listbox"
					aria-labelledby={`${labelId} ${id}`}
				>
					<span className={styles.selectPlaceholder}>
						{currentPriorityLabel}
					</span>

					<Image
						src={arrowDownIcon}
						alt=""
						aria-hidden="true"
						className={styles.selectIcon}
					/>
				</button>

				{isOpen ? (
					<div
						id={panelId}
						className={styles.priorityPanel}
						role="listbox"
						aria-labelledby={labelId}
					>
						{PRIORITY_OPTIONS.map((option, index) => (
							<button
								key={option.value}
								ref={(element) => {
									optionRefs.current[index] = element;
								}}
								type="button"
								className={styles.priorityItem}
								onClick={() => handleSelect(option.value)}
								onKeyDown={(event) =>
									handleOptionKeyDown(event, index)
								}
								role="option"
								aria-selected={option.value === value}
							>
								{option.label}
							</button>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
}
