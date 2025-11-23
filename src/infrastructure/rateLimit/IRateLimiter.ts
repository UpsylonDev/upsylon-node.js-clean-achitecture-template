/**
 * Interface pour l'abstraction du rate limiting.
 * Permet de différentes implémentations (Memory, Redis, etc.)
 *
 * @interface IRateLimiter
 */
export interface IRateLimiter {
  /**
   * Récupère ou crée une clé de rate limit pour un client.
   * Retourne le nombre de requêtes restantes.
   *
   * @param key - Clé unique du client (IP, user ID, etc.)
   * @returns Le nombre de requêtes restantes
   */
  getRemainingRequests(key: string): Promise<number>;

  /**
   * Réinitialise le compteur de rate limit pour une clé.
   *
   * @param key - Clé unique du client
   */
  reset(key: string): Promise<void>;

  /**
   * Réinitialise tous les compteurs de rate limit.
   */
  resetAll(): Promise<void>;
}
