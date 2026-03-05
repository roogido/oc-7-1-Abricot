/**
 * @file @/lib/authConstants.js
 * @description 
 * Constantes utilisées pour l'authentification.
 * Centralise le nom du cookie JWT et sa durée de validité
 * afin d'éviter les duplications dans les route handlers.
 *
 * @author Salem Hadjali
 * @date 05-03-2026
 */

export const TOKEN_COOKIE = 'abr_token';
export const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;