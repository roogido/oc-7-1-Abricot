// src/components/projects/ContributorsBar/ContributorsBar.js

import UserAvatar from '@/components/ui/UserAvatar/UserAvatar';
import Tag from '@/components/ui/Tag/Tag';
import styles from './ContributorsBar.module.css';

/**
 * Barre affichant les contributeurs d'un projet.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.contributors=[]]
 * @returns {JSX.Element}
 */
export default function ContributorsBar({ contributors = [] }) {
	const ownerUser =
		contributors.find((user) => user?.isOwner === true) ?? null;

	const memberUsers = contributors.filter((user) => user?.isOwner !== true);
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
				{ownerUser ? (
					<div className={styles.user}>
						<UserAvatar
							initials={ownerUser.initials}
							variant="owner"
						/>
						<Tag variant="brand">{ownerUser.name}</Tag>
					</div>
				) : null}

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
