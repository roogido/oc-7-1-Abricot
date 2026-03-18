/**
 * @file src/components/tasks/TaskDateField/TaskDateField.js
 * @description
 * Champ partagé de sélection de date d'échéance pour les modales de tâche.
 */

'use client';

import { useRef } from 'react';
import Image from 'next/image';

import calendarTaskIcon from '@/assets/icons/calendar-task-icon.png';

import styles from './TaskDateField.module.css';

export default function TaskDateField({
	id,
	name = 'dueDate',
	label = 'Échéance*',
	value = '',
	onChange,
}) {
	const dateInputRef = useRef(null);

	function handleOpenDatePicker() {
		if (!dateInputRef.current) {
			return;
		}

		if (typeof dateInputRef.current.showPicker === 'function') {
			dateInputRef.current.showPicker();
			return;
		}

		dateInputRef.current.focus();
	}

	return (
		<div className={styles.field}>
			<label htmlFor={id} className={styles.label}>
				{label}
			</label>

			<div className={styles.dateInputWrapper}>
				<input
					ref={dateInputRef}
					id={id}
					name={name}
					type="date"
					value={value}
					onChange={onChange}
					className={styles.dateInput}
				/>

				<button
					type="button"
					className={styles.dateIconButton}
					onClick={handleOpenDatePicker}
					aria-label="Choisir une échéance"
				>
					<Image
						src={calendarTaskIcon}
						alt=""
						aria-hidden="true"
						className={styles.dateIcon}
					/>
				</button>
			</div>
		</div>
	);
}
