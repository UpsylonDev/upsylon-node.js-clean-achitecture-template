/**
 * Command pour la création d'un utilisateur.
 * Encapsule l'intention de créer un utilisateur avec ses données.
 *
 * Pattern CQRS (Command Query Responsibility Segregation) :
 * Les Commands modifient l'état du système.
 *
 * @class CreateUserCommand
 */
export class CreateUserCommand {
  /**
   * Crée une nouvelle commande de création d'utilisateur.
   *
   * @param {string} email - L'adresse email de l'utilisateur
   * @param {string} password - Le mot de passe en clair
   */
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}
}
