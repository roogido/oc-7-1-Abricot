'use client';

import styles from './Input.module.css';

/**
 * Champ de formulaire générique.
 */
export default function Input({
	label,
	type = 'text',
	placeholder,
	value,
	onChange,
	disabled = false,
}) {
	return (
		<div className={styles.wrapper}>
			{label && <label className={styles.label}>{label}</label>}

			<input
				type={type}
				className={styles.input}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				disabled={disabled}
			/>
		</div>
	);
}
