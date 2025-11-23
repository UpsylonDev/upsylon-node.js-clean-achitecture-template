/**
 * Value Object représentant un email valide.
 * Immutable et auto-validé.
 *
 * @class Email
 * @throws {Error} Si l'email n'est pas au format valide
 */
export class Email {
  private readonly value: string;

  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Crée une nouvelle instance d'Email.
   *
   * @param {string} email - L'adresse email à valider
   * @throws {Error} Si l'email est vide ou invalide
   */
  constructor(email: string) {
    this.validate(email);
    this.value = email.toLowerCase().trim();
  }

  /**
   * Valide le format de l'email.
   *
   * @private
   * @param {string} email - L'email à valider
   * @throws {Error} Si l'email est invalide
   */
  private validate(email: string): void {
    const trimmedEmail = email?.trim();

    if (!trimmedEmail) {
      throw new Error('Email cannot be empty');
    }

    if (!Email.EMAIL_REGEX.test(trimmedEmail)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Retourne la valeur de l'email.
   *
   * @returns {string} L'adresse email
   */
  public getValue(): string {
    return this.value;
  }

  /**
   * Compare deux emails pour vérifier leur égalité.
   *
   * @param {Email} other - L'autre email à comparer
   * @returns {boolean} True si les emails sont identiques
   */
  public equals(other: Email): boolean {
    return this.value === other.value;
  }

  /**
   * Retourne la représentation string de l'email.
   *
   * @returns {string} L'adresse email
   */
  public toString(): string {
    return this.value;
  }
}
