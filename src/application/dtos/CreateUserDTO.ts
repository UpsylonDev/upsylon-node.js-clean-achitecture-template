/**
 * Data Transfer Object pour la création d'un utilisateur.
 * Représente les données entrantes depuis la couche présentation.
 *
 * @interface CreateUserDTO
 */
export interface CreateUserDTO {
  /**
   * L'adresse email de l'utilisateur
   */
  email: string;

  /**
   * Le mot de passe en clair de l'utilisateur
   */
  password: string;
}
