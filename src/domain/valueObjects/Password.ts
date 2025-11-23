import * as bcrypt from 'bcryptjs';

/**
 * Value Object représentant un mot de passe sécurisé.
 * Gère la validation et le hachage du mot de passe.
 *
 * @class Password
 * @throws {Error} Si le mot de passe ne respecte pas les critères de sécurité
 */
export class Password {
  private readonly hashedValue: string;

  private static readonly MIN_LENGTH = 8;
  private static readonly SALT_ROUNDS = 10;

  /**
   * Crée une nouvelle instance de Password avec un mot de passe en clair.
   *
   * @param {string} plainPassword - Le mot de passe en clair
   * @returns {Promise<Password>} Instance de Password avec mot de passe haché
   * @throws {Error} Si le mot de passe ne respecte pas les critères
   */
  public static async create(plainPassword: string): Promise<Password> {
    Password.validate(plainPassword);
    const hashedPassword = await bcrypt.hash(plainPassword, Password.SALT_ROUNDS);
    return new Password(hashedPassword);
  }

  /**
   * Crée une instance de Password à partir d'un hash existant.
   * Utilisé lors de la récupération depuis la base de données.
   *
   * @param {string} hashedPassword - Le mot de passe déjà haché
   * @returns {Password} Instance de Password
   */
  public static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  /**
   * Constructeur privé pour empêcher l'instanciation directe.
   *
   * @private
   * @param {string} hashedValue - Le mot de passe haché
   */
  private constructor(hashedValue: string) {
    this.hashedValue = hashedValue;
  }

  /**
   * Valide les critères de sécurité du mot de passe.
   *
   * @private
   * @static
   * @param {string} password - Le mot de passe à valider
   * @throws {Error} Si le mot de passe ne respecte pas les critères
   */
  private static validate(password: string): void {
    if (!password || password.trim().length === 0) {
      throw new Error('Password cannot be empty');
    }

    if (password.length < Password.MIN_LENGTH) {
      throw new Error(`Password must be at least ${Password.MIN_LENGTH} characters long`);
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUpperCase) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!hasLowerCase) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!hasNumber) {
      throw new Error('Password must contain at least one number');
    }
  }

  /**
   * Compare un mot de passe en clair avec le hash stocké.
   *
   * @param {string} plainPassword - Le mot de passe en clair à comparer
   * @returns {Promise<boolean>} True si le mot de passe correspond
   */
  public async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  /**
   * Retourne le hash du mot de passe.
   *
   * @returns {string} Le mot de passe haché
   */
  public getHash(): string {
    return this.hashedValue;
  }
}
