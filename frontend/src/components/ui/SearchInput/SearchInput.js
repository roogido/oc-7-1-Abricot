// src/components/ui/SearchInput/SearchInput.js
'use client';

import Image from 'next/image';
import searchIcon from '@/assets/icons/search-icon.png';
import styles from './SearchInput.module.css';

/**
 * Champ de recherche reutilisable avec icone a droite.
 *
 * @param {Object} props
 * @param {string} [props.value] Valeur controlee du champ
 * @param {(event: React.ChangeEvent<HTMLInputElement>) => void} [props.onChange] Gestionnaire de changement
 * @param {string} [props.placeholder='Rechercher'] Placeholder affiche
 * @param {string} [props.ariaLabel='Champ de recherche'] Libelle accessible
 * @param {string} [props.name] Nom du champ
 * @param {boolean} [props.disabled=false] Desactive le champ
 * @param {string} [props.className=''] Classe CSS supplementaire
 * @returns {JSX.Element}
 */
export default function SearchInput({
	value,
	onChange,
	placeholder = 'Rechercher',
	ariaLabel = 'Champ de recherche',
	name,
	disabled = false,
	className = '',
}) {
	const inputProps = {
		type: 'search',
		name,
		placeholder,
		'aria-label': ariaLabel,
		disabled,
		className: styles.input,
	};

	if (typeof value === 'string' && typeof onChange === 'function') {
		inputProps.value = value;
		inputProps.onChange = onChange;
	}

	return (
		<div className={`${styles.wrapper} ${className}`.trim()}>
			<input {...inputProps} />

			<Image
				src={searchIcon}
				alt=""
				aria-hidden="true"
				className={styles.icon}
			/>
		</div>
	);
}
