/**
 * @file src/app/(protected)/projects/page.js
 * @description
 * Page listant les projets accessibles a l'utilisateur authentifie.
 */

import Button from '@/components/ui/Button/Button';
import PageIntro from '@/components/layout/PageIntro/PageIntro';
import ProjectsGrid from '@/components/projects/ProjectsGrid/ProjectsGrid';
import styles from './page.module.css';

const projects = [
	{
		id: 1,
		name: 'API Authentification',
		description:
			"Développement de la nouvelle version de l'API REST avec authentification JWT",
		progress: 20,
		completedTasks: 1,
		totalTasks: 5,
		ownerInitials: 'AD',
		memberInitials: ['BC', 'CV'],
	},
	{
		id: 2,
		name: 'Dashboard Analytics',
		description:
			"Mise en place d'un tableau de bord pour le suivi des statistiques utilisateurs",
		progress: 45,
		completedTasks: 5,
		totalTasks: 11,
		ownerInitials: 'AD',
		memberInitials: ['JD', 'ML'],
	},
	{
		id: 3,
		name: 'Migration Base de données',
		description:
			"Migration de l'ancienne base MySQL vers une architecture PostgreSQL optimisée",
		progress: 70,
		completedTasks: 7,
		totalTasks: 10,
		ownerInitials: 'AD',
		memberInitials: ['BC'],
	},
	{
		id: 4,
		name: 'Application Mobile',
		description:
			'Création de l’application mobile pour la gestion des projets en mobilité',
		progress: 10,
		completedTasks: 1,
		totalTasks: 8,
		ownerInitials: 'AD',
		memberInitials: ['CV', 'ML', 'JD'],
	},
];

/**
 * Page principale des projets.
 *
 * @returns {JSX.Element} Interface des projets
 */
export default function ProjectsPage() {
	return (
		<section className={styles.page}>
			<PageIntro
				title="Mes projets"
				subtitle="Gérez vos projets"
				actions={<Button>+ Créer un projet</Button>}
			/>

			<ProjectsGrid projects={projects} />
		</section>
	);
}
