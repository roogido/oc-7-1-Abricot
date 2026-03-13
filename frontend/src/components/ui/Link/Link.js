import NextLink from 'next/link';
import styles from './Link.module.css';

/**
 * Lien UI standard du design system
 */
export default function Link({ href = '#', children }) {
	return (
		<NextLink href={href} className={styles.link}>
			{children}
		</NextLink>
	);
}
