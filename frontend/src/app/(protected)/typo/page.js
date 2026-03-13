import Button from '@/components/ui/Button/Button';
import Input from '@/components/ui/Input/Input';
import Tag from '@/components/ui/Tag/Tag';
import Chip from '@/components/ui/Chip/Chip';

import checkedIcon from '@/assets/icons/checked-icon.png';
import kanbanIcon from '@/assets/icons/kanban-icon.png';
import projectIcon from '@/assets/icons/project-icon.png';
import Link from '@/components/ui/Link/Link';


const demoProject = {
	name: 'Nom du projet',
	description:
		"Developpement de la nouvelle version de l'API REST avec authentification JWT",
	progress: 0,
	completedTasks: 0,
	totalTasks: 2,
	ownerInitials: 'AD',
	memberInitials: ['BC', 'CV'],
};

export default function DashboardPage() {
	return (
		<>
			<h1>Typo. et composants réutilisable</h1>

			<h2>Button</h2>
			<Button>Test creer</Button>
			<Button variant="outline">Annuler</Button>
			<Button disabled>Creer</Button>

			<h2>Input</h2>
			<Input label="Nom du projet" placeholder="Ex: Plateforme SaaS" />

			<h2>Tags</h2>
			<Tag variant="green">Termine</Tag>
			<Tag variant="red">Bloque</Tag>
			<Tag variant="orange">En attente</Tag>
			<Tag variant="blue">En cours</Tag>
			<Tag variant="brand">Projet</Tag>
			<Tag variant="grey">Neutre</Tag>

			<h2>Chips</h2>
			<Chip icon={checkedIcon}>Mes taches</Chip>
			<Chip icon={kanbanIcon}>Kanban</Chip>
			<Chip icon={projectIcon}>Mes projets</Chip>

			<h2>Link</h2>
			<Link href="#">Modifier</Link>
		</>
	);
}
