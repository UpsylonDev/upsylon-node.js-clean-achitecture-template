import { User } from '../entities/User';
import { Email } from '../valueObjects/Email';

/**
 * Interface du repository User.
 * Définit le contrat d'abstraction pour la persistence des utilisateurs.
 * Cette interface appartient au domaine mais sera implémentée par l'infrastructure.
 *
 * Principe d'Inversion de Dépendances (DIP) :
 * Le domaine définit ce dont il a besoin, l'infrastructure l'implémente.
 *
 * @interface IUserRepository
 */
export interface IUserRepository {
  /**
   * Sauvegarde un nouvel utilisateur en base de données.
   *
   * @param {User} user - L'utilisateur à sauvegarder
   * @returns {Promise<User>} L'utilisateur sauvegardé
   * @throws {Error} Si la sauvegarde échoue
   */
  save(user: User): Promise<User>;

  /**
   * Recherche un utilisateur par son email.
   *
   * @param {Email} email - L'email à rechercher
   * @returns {Promise<User | null>} L'utilisateur trouvé ou null
   */
  findByEmail(email: Email): Promise<User | null>;

  /**
   * Recherche un utilisateur par son identifiant.
   *
   * @param {string} id - L'identifiant de l'utilisateur
   * @returns {Promise<User | null>} L'utilisateur trouvé ou null
   */
  findById(id: string): Promise<User | null>;

  /**
   * Vérifie si un utilisateur avec cet email existe déjà.
   *
   * @param {Email} email - L'email à vérifier
   * @returns {Promise<boolean>} True si l'email existe déjà
   */
  existsByEmail(email: Email): Promise<boolean>;
}
