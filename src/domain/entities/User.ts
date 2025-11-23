import { Email } from '../valueObjects/Email';
import { Password } from '../valueObjects/Password';

/**
 * Entité User représentant un utilisateur dans le domaine.
 * Contient la logique métier pure sans dépendances externes.
 *
 * @class User
 */
export class User {
  private readonly id: string;
  private readonly email: Email;
  private readonly password: Password;
  private readonly createdAt: Date;

  /**
   * Crée une nouvelle instance d'User.
   *
   * @param {string} id - Identifiant unique de l'utilisateur
   * @param {Email} email - Email de l'utilisateur (Value Object)
   * @param {Password} password - Mot de passe haché (Value Object)
   * @param {Date} createdAt - Date de création
   */
  constructor(
    id: string,
    email: Email,
    password: Password,
    createdAt: Date = new Date()
  ) {
    this.validate(id);
    this.id = id;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
  }

  /**
   * Valide les données de l'utilisateur.
   *
   * @private
   * @param {string} id - L'identifiant à valider
   * @throws {Error} Si l'identifiant est invalide
   */
  private validate(id: string): void {
    if (!id || id.trim().length === 0) {
      throw new Error('User ID cannot be empty');
    }
  }

  /**
   * Retourne l'identifiant de l'utilisateur.
   *
   * @returns {string} L'identifiant unique
   */
  public getId(): string {
    return this.id;
  }

  /**
   * Retourne l'email de l'utilisateur.
   *
   * @returns {Email} Le Value Object Email
   */
  public getEmail(): Email {
    return this.email;
  }

  /**
   * Retourne le mot de passe de l'utilisateur.
   *
   * @returns {Password} Le Value Object Password
   */
  public getPassword(): Password {
    return this.password;
  }

  /**
   * Retourne la date de création de l'utilisateur.
   *
   * @returns {Date} La date de création
   */
  public getCreatedAt(): Date {
    return this.createdAt;
  }

  /**
   * Vérifie si un mot de passe en clair correspond au mot de passe de l'utilisateur.
   *
   * @param {string} plainPassword - Le mot de passe en clair
   * @returns {Promise<boolean>} True si le mot de passe correspond
   */
  public async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.password.compare(plainPassword);
  }

  /**
   * Retourne une représentation simple de l'utilisateur (sans le mot de passe).
   *
   * @returns {object} Représentation publique de l'utilisateur
   */
  public toPublicObject(): {
    id: string;
    email: string;
    createdAt: Date;
  } {
    return {
      id: this.id,
      email: this.email.getValue(),
      createdAt: this.createdAt,
    };
  }
}
