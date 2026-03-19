/**
 * @file src/app/api/ai/task-suggestions/route.js
 * @description
 * Route interne Next.js pour générer des suggestions de tâches via Mistral.
 */

import {
	createInternalErrorResponse,
	createNotAuthenticatedResponse,
	getAuthToken,
	parseJsonBody,
} from '@/app/api/_shared/routeHelpers';
import { NextResponse } from 'next/server';

const MISTRAL_API_URL = 'https://api.mistral.ai/v1/chat/completions';
const MISTRAL_MODEL = 'mistral-small-latest';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];
const STATUS_VALUE = 'TODO';

// Schéma JSON attendu pour encadrer strictement la réponse de l'IA.
const TASK_SUGGESTIONS_JSON_SCHEMA = {
	name: 'task_suggestions',
	schema: {
		type: 'object',
		additionalProperties: false,
		properties: {
			tasks: {
				type: 'array',
				minItems: 1,
				maxItems: 8,
				items: {
					type: 'object',
					additionalProperties: false,
					properties: {
						title: {
							type: 'string',
							minLength: 3,
							maxLength: 120,
						},
						description: {
							type: 'string',
							minLength: 3,
							maxLength: 500,
						},
						dueDate: {
							type: 'string',
							pattern: '^\\d{4}-\\d{2}-\\d{2}$',
						},
						priority: {
							type: 'string',
							enum: PRIORITY_OPTIONS,
						},
						status: {
							type: 'string',
							enum: [STATUS_VALUE],
						},
					},
					required: [
						'title',
						'description',
						'dueDate',
						'priority',
						'status',
					],
				},
			},
		},
		required: ['tasks'],
	},
};

// Nettoie une valeur texte et supprime les espaces inutiles.
function normalizeText(value) {
	return typeof value === 'string' ? value.trim() : '';
}

// Vérifie que la date suit bien le format YYYY-MM-DD.
function isValidDueDate(value) {
	return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// Nettoie et valide une tâche renvoyée par l'IA avant usage.
function sanitizeTask(task, index) {
	const title = normalizeText(task?.title);
	const description = normalizeText(task?.description);
	const dueDate = normalizeText(task?.dueDate);
	const priority = normalizeText(task?.priority).toUpperCase();
	const status = normalizeText(task?.status).toUpperCase();

	if (title.length < 3) {
		throw new Error(
			`La tâche ${index + 1} ne contient pas de titre valide.`,
		);
	}

	if (description.length < 3) {
		throw new Error(
			`La tâche ${index + 1} ne contient pas de description valide.`,
		);
	}

	if (!isValidDueDate(dueDate)) {
		throw new Error(
			`La tâche ${index + 1} ne contient pas de date d'échéance valide.`,
		);
	}

	if (!PRIORITY_OPTIONS.includes(priority)) {
		throw new Error(
			`La tâche ${index + 1} ne contient pas de priorité valide.`,
		);
	}

	if (status !== STATUS_VALUE) {
		throw new Error(
			`La tâche ${index + 1} ne contient pas de statut valide.`,
		);
	}

	return {
		id: `suggested-task-${index + 1}`,
		title,
		description,
		dueDate,
		priority,
		status,
	};
}

// Récupère le texte utile dans la réponse brute de Mistral.
function extractMessageContent(data) {
	const content = data?.choices?.[0]?.message?.content;

	if (typeof content === 'string') {
		return content;
	}

	if (Array.isArray(content)) {
		const textChunk = content.find(
			(item) => item?.type === 'text' && typeof item?.text === 'string',
		);

		return textChunk?.text ?? '';
	}

	return '';
}

// Construit les règles globales envoyées au modèle.
function buildSystemPrompt() {
	return [
		'Tu es un assistant de gestion de projet pour une application SaaS francophone.',
		'Tu proposes une première décomposition de tâches claire, exploitable et concise.',
		'Tu dois répondre uniquement avec un JSON valide conforme au schéma fourni.',
		'Tu ne dois ajouter aucun texte hors JSON.',
		'Chaque tâche doit être réaliste, orientée exécution, et adaptée à un projet web.',
		`Le statut doit toujours être "${STATUS_VALUE}".`,
		'La date d’échéance doit être au format YYYY-MM-DD.',
		`La priorité doit être l'une des valeurs suivantes : ${PRIORITY_OPTIONS.join(', ')}.`,
	].join(' ');
}

// Construit le contexte projet transmis avec la demande utilisateur.
function buildUserPrompt({ projectName, projectDescription, userPrompt }) {
	return [
		`Nom du projet : ${projectName}`,
		`Description du projet : ${projectDescription || 'Aucune description fournie.'}`,
		`Demande utilisateur : ${userPrompt}`,
		'Génère entre 3 et 6 tâches pertinentes.',
		'Les tâches doivent être prêtes à être relues par un humain avant création.',
	].join('\n');
}

// Gère la génération de suggestions de tâches via l'API Mistral.
export async function POST(request) {
	const token = getAuthToken(request);

	// Refuse l'accès si l'utilisateur n'est pas authentifié.
	if (!token) {
		return createNotAuthenticatedResponse();
	}

	// Lit et normalise les données envoyées par le client.
	const body = await parseJsonBody(request);

	const projectId = normalizeText(body?.projectId);
	const projectName = normalizeText(body?.projectName);
	const projectDescription = normalizeText(body?.projectDescription);
	const userPrompt = normalizeText(body?.prompt);

	// Vérifie que les informations minimales sont bien présentes.
	if (projectId === '' || projectName === '' || userPrompt.length < 10) {
		return NextResponse.json(
			{
				success: false,
				message:
					'Données invalides. Le projet et la demande IA sont requis.',
			},
			{ status: 400 },
		);
	}

	const apiKey = normalizeText(process.env.MISTRAL_API_KEY);

	// Stoppe la requête si la clé API Mistral manque côté serveur.
	if (apiKey === '') {
		return NextResponse.json(
			{
				success: false,
				message: "La clé API Mistral n'est pas configurée.",
			},
			{ status: 500 },
		);
	}

	try {
		// Envoie la demande à Mistral avec un schéma JSON imposé.
		const mistralResponse = await fetch(MISTRAL_API_URL, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey}`,
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body: JSON.stringify({
				model: MISTRAL_MODEL,
				temperature: 0.2,
				max_tokens: 1200,
				response_format: {
					type: 'json_schema',
					json_schema: TASK_SUGGESTIONS_JSON_SCHEMA,
				},
				messages: [
					{
						role: 'system',
						content: buildSystemPrompt(),
					},
					{
						role: 'user',
						content: buildUserPrompt({
							projectName,
							projectDescription,
							userPrompt,
						}),
					},
				],
			}),
			cache: 'no-store',
		});

		// Tente de lire la réponse JSON même en cas d'erreur HTTP.
		const mistralData = await mistralResponse.json().catch(() => null);

		// Relaye proprement l'erreur renvoyée par Mistral.
		if (!mistralResponse.ok) {
			const message =
				typeof mistralData?.message === 'string' &&
				mistralData.message.trim() !== ''
					? mistralData.message
					: 'Impossible de générer les tâches avec Mistral.';

			return NextResponse.json(
				{
					success: false,
					message,
				},
				{ status: mistralResponse.status || 502 },
			);
		}

		// Extrait le contenu texte généré par le modèle.
		const rawContent = extractMessageContent(mistralData);

		if (rawContent === '') {
			return NextResponse.json(
				{
					success: false,
					message: 'Réponse IA vide ou invalide.',
				},
				{ status: 502 },
			);
		}

		// Parse le JSON puis récupère la liste des tâches proposées.
		const parsedContent = JSON.parse(rawContent);
		const rawTasks = Array.isArray(parsedContent?.tasks)
			? parsedContent.tasks
			: [];

		// Refuse une réponse vide ou inutilisable.
		if (rawTasks.length === 0) {
			return NextResponse.json(
				{
					success: false,
					message: "Aucune tâche exploitable n'a été générée.",
				},
				{ status: 422 },
			);
		}

		// Nettoie chaque tâche avant de la renvoyer au front.
		const tasks = rawTasks.map((task, index) => sanitizeTask(task, index));

		return NextResponse.json({
			success: true,
			message: 'Suggestions générées avec succès.',
			data: {
				projectId,
				tasks,
			},
		});
	} catch (error) {
		// Gère un JSON invalide renvoyé malgré le schéma demandé.
		if (error instanceof SyntaxError) {
			return NextResponse.json(
				{
					success: false,
					message: 'Réponse IA non conforme au JSON attendu.',
				},
				{ status: 502 },
			);
		}

		// Journalise l'erreur puis renvoie une réponse interne standard.
		console.error('[AI_TASK_SUGGESTIONS_ERROR]', error);
		return createInternalErrorResponse();
	}
}
