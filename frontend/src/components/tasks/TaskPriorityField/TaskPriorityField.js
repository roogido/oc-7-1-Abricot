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

	const currentPriorityLabel =
		PRIORITY_OPTIONS.find((option) => option.value === value)?.label ??
		'Faible';

	function handleSelect(priority) {
		onChange(priority);
		setIsOpen(false);
	}

	return (
		<div className={styles.field}>
			<label htmlFor={id} className={styles.label}>
				{label}
			</label>

			<div ref={boxRef} className={styles.priorityBox}>
				<button
					id={id}
					type="button"
					className={styles.selectLike}
					onClick={() => setIsOpen((prev) => !prev)}
					aria-expanded={isOpen}
					aria-controls={`${id}-panel`}
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
					<div id={`${id}-panel`} className={styles.priorityPanel}>
						{PRIORITY_OPTIONS.map((option) => (
							<button
								key={option.value}
								type="button"
								className={styles.priorityItem}
								onClick={() => handleSelect(option.value)}
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
