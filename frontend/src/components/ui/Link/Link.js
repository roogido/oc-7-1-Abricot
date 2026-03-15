// src/components/ui/Link/Link.js
import NextLink from 'next/link';
import styles from './Link.module.css';

/**
 * Lien UI standard du design system
 *
 * @param {Object} props
 * @param {string} [props.href]
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.disabled=false]
 * @param {boolean} [props.ariaDisabled=false]
 * @param {string} [props.title]
 * @returns {JSX.Element}
 */
export default function Link({
	href = '#',
	children,
	disabled = false,
	ariaDisabled = false,
	title,
}) {
	const className = `${styles.link} ${
		disabled ? styles.disabled : ''
	}`.trim();

	if (disabled) {
		return (
			<span
				className={className}
				aria-disabled={ariaDisabled}
				title={title}
			>
				{children}
			</span>
		);
	}

	return (
		<NextLink href={href} className={className} title={title}>
			{children}
		</NextLink>
	);
}
