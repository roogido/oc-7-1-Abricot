import styles from './Tag.module.css';

export default function Tag({ children, variant = 'grey' }) {
	const className = `${styles.tag} ${styles[variant]}`;

	return <span className={className}>{children}</span>;
}
