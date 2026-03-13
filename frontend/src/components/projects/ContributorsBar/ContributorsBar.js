/**
 * @file src/components/projects/ContributorsBar/ContributorsBar.js
 * @description
 * Barre affichant les contributeurs d'un projet.
 */

import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Tag from '@/components/ui/Tag/Tag';
import styles from './ContributorsBar.module.css';

/**
 * Determine si l'utilisateur est proprietaire.
 *
 * @param {Object} user
 * @returns {boolean}
 */
function isOwnerUser(user) {
	return (
		typeof user?.role === 'string' &&
		user.role.trim().toLowerCase() === 'proprietaire'
	);
}

/**
 * Barre des contributeurs.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.contributors=[]]
 * @returns {JSX.Element}
 */
export default function ContributorsBar({ contributors = [] }) {
	const ownerUsers = contributors.filter(isOwnerUser);
	const memberUsers = contributors.filter((user) => !isOwnerUser(user));
	const contributorsCount = memberUsers.length;

	return (
		<section
			className={styles.container}
			aria-label="Contributeurs du projet"
		>
			<div className={styles.left}>
				<span className={styles.title}>Contributeurs</span>
				<span className={styles.count}>
					{contributorsCount}{' '}
					{contributorsCount > 1 ? 'personnes' : 'personne'}
				</span>
			</div>

			<div className={styles.right}>
				{ownerUsers.map((user) => (
					<div key={user.id} className={styles.user}>
						<UserAvatar initials={user.initials} variant="owner" />
						<Tag variant="brand">{user.role}</Tag>
					</div>
				))}

				{memberUsers.map((user) => (
					<div key={user.id} className={styles.user}>
						<UserAvatar
							initials={user.initials}
							variant={user.variant || 'member'}
						/>
						{user.name ? (
							<Tag variant="grey">{user.name}</Tag>
						) : null}
					</div>
				))}
			</div>
		</section>
	);
}
