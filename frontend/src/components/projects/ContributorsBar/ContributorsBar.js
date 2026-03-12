/**
 * @file ContributorsBar.js
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
	return (
		<section
			className={styles.container}
			aria-label="Contributeurs du projet"
		>
			<div className={styles.left}>
				<span className={styles.title}>Contributeurs</span>
				<span className={styles.count}>
					{contributors.length} personnes
				</span>
			</div>

			<div className={styles.right}>
				{contributors.map((user) => {
					const isOwner = isOwnerUser(user);

					return (
						<div key={user.id} className={styles.user}>
							<UserAvatar
								initials={user.initials}
								variant={isOwner ? 'owner' : 'member'}
							/>

							{isOwner && user.role && (
								<Tag variant="brand">{user.role}</Tag>
							)}

							{!isOwner && user.name && (
								<Tag variant="grey">{user.name}</Tag>
							)}
						</div>
					);
				})}
			</div>
		</section>
	);
}
