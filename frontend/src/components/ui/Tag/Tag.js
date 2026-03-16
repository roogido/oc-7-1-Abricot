/**
 * @file src/components/ui/Tag/Tag.js
 * @description
 * Composant Tag reutilisable de l'interface Abricot.
 */

import styles from './Tag.module.css';

export default function Tag({ children, variant = 'grey', active = false }) {
	const className = [
		styles.tag,
		styles[variant],
		active ? styles.active : '',
	]
		.filter(Boolean)
		.join(' ');

	return <span className={className}>{children}</span>;
}
