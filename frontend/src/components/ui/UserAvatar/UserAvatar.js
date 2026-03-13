import styles from './UserAvatar.module.css';

/**
 * Avatar utilisateur base sur des initiales.
 *
 * @param {Object} props
 * @param {string} props.initials Initiales affichees
 * @param {'owner'|'member'} [props.variant='owner'] Variante visuelle
 * @returns {JSX.Element}
 */
export default function UserAvatar({ initials = '?', variant = 'owner' }) {
	const className = `${styles.avatar} ${
		variant === 'member' ? styles.member : styles.owner
	}`.trim();

	return (
		<span className={className} aria-hidden="true">
			{initials}
		</span>
	);
}
