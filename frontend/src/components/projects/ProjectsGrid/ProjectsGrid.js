// src/components/projects/ProjectsGrid/ProjectsGrid.js
import styles from './ProjectsGrid.module.css';
import ProjectCard from '../ProjectCard/ProjectCard';

/**
 * Grille d'affichage des projets.
 *
 * @param {Object} props
 * @param {Array} props.projects
 * @returns {JSX.Element}
 */
export default function ProjectsGrid({ projects = [] }) {
	return (
		<section className={styles.grid}>
			{projects.map((project) => (
				<ProjectCard key={project.id} {...project} />
			))}
		</section>
	);
}
