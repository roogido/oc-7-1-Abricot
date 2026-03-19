/**
 * @file src/components/projects/ProjectAiTaskGenerationAction/ProjectAiTaskGenerationAction.js
 * @description
 * Action client de génération, relecture et création réelle de tâches via l'IA.
 */

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import AiTaskPromptModal from '@/components/projects/AiTaskPromptModal/AiTaskPromptModal';
import AiTaskSuggestionsModal from '@/components/projects/AiTaskSuggestionsModal/AiTaskSuggestionsModal';
import { generateTaskSuggestionsClient } from '@/services/aiTaskClientService';
import { createTaskClient } from '@/services/taskClientService';

// Securise les brouillons IA pour garder un format exploitable dans l'UI.
function normalizeSuggestedTask(task, index) {
	return {
		id:
			typeof task?.id === 'string' && task.id.trim() !== ''
				? task.id
				: `suggested-task-${index + 1}`,
		title: typeof task?.title === 'string' ? task.title.trim() : '',
		description:
			typeof task?.description === 'string'
				? task.description.trim()
				: '',
		dueDate: typeof task?.dueDate === 'string' ? task.dueDate.trim() : '',
		priority:
			typeof task?.priority === 'string' && task.priority.trim() !== ''
				? task.priority.trim()
				: 'LOW',
		status:
			typeof task?.status === 'string' && task.status.trim() !== ''
				? task.status.trim()
				: 'TODO',
	};
}

/**
 * Orchestre la generation, la revision et la creation des taches IA.
 */
export default function ProjectAiTaskGenerationAction({
	projectId,
	projectName,
	projectDescription,
	isOpen,
	onClose,
}) {
	const router = useRouter();

	const [isGenerating, setIsGenerating] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [promptErrorMessage, setPromptErrorMessage] = useState('');
	const [suggestionsErrorMessage, setSuggestionsErrorMessage] = useState('');
	const [generatedTasks, setGeneratedTasks] = useState([]);
	const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

	const normalizedProjectDescription = useMemo(() => {
		return typeof projectDescription === 'string' ? projectDescription : '';
	}, [projectDescription]);

	function handleClosePrompt() {
		if (isGenerating || isCreating) {
			return;
		}

		setPromptErrorMessage('');
		onClose();
	}

	function handleCloseSuggestions() {
		if (isGenerating || isCreating) {
			return;
		}

		setSuggestionsErrorMessage('');
		setGeneratedTasks([]);
		setIsSuggestionsOpen(false);
	}

	// Ouvre l'etape de relecture seulement si des taches valides existent.
	async function handleGenerate(prompt) {
		setIsGenerating(true);
		setPromptErrorMessage('');
		setSuggestionsErrorMessage('');

		try {
			const response = await generateTaskSuggestionsClient({
				projectId,
				projectName,
				projectDescription: normalizedProjectDescription,
				prompt,
			});

			const tasks = Array.isArray(response?.data?.tasks)
				? response.data.tasks.map(normalizeSuggestedTask)
				: [];

			if (tasks.length === 0) {
				throw new Error("Aucune tâche exploitable n'a été générée.");
			}

			setGeneratedTasks(tasks);
			setIsSuggestionsOpen(true);
			onClose();
		} catch (error) {
			setPromptErrorMessage(
				error instanceof Error
					? error.message
					: 'Impossible de générer les tâches.',
			);
		} finally {
			setIsGenerating(false);
		}
	}

	function handleDeleteTask(taskId) {
		setGeneratedTasks((prev) => prev.filter((task) => task.id !== taskId));
	}

	function handleUpdateTask(updatedTask) {
		setGeneratedTasks((prev) =>
			prev.map((task) =>
				task.id === updatedTask.id
					? normalizeSuggestedTask(updatedTask)
					: task,
			),
		);
	}

	// Cree les taches validees une a une puis recharge la page projet.
	async function handleCreateTasks() {
		if (generatedTasks.length === 0) {
			return;
		}

		setIsCreating(true);
		setSuggestionsErrorMessage('');

		try {
			for (const task of generatedTasks) {
				await createTaskClient({
					projectId,
					title: task.title,
					description: task.description,
					dueDate: task.dueDate,
					priority: task.priority,
					assigneeIds: [],
				});
			}

			setGeneratedTasks([]);
			setIsSuggestionsOpen(false);
			router.refresh();
		} catch (error) {
			setSuggestionsErrorMessage(
				error instanceof Error
					? error.message
					: 'Impossible de créer les tâches générées.',
			);
		} finally {
			setIsCreating(false);
		}
	}

	return (
		<>
			<AiTaskPromptModal
				isOpen={isOpen}
				onClose={handleClosePrompt}
				onSubmit={handleGenerate}
				projectName={projectName}
				projectDescription={normalizedProjectDescription}
				isSubmitting={isGenerating}
				errorMessage={promptErrorMessage}
			/>

			<AiTaskSuggestionsModal
				isOpen={isSuggestionsOpen}
				onClose={handleCloseSuggestions}
				tasks={generatedTasks}
				onDeleteTask={handleDeleteTask}
				onUpdateTask={handleUpdateTask}
				onCreateTasks={handleCreateTasks}
				isSubmitting={isCreating}
				errorMessage={suggestionsErrorMessage}
			/>
		</>
	);
}
