import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { Email } from '../../domain/valueObjects/Email';
import { Password } from '../../domain/valueObjects/Password';
import { UserModel, IUserDocument } from './mongoose/userModel';

/**
 * Implémentation MongoDB du repository User.
 * Fait le pont entre le domaine (entités) et la persistance (Mongoose).
 *
 * Pattern Repository :
 * - Encapsule la logique d'accès aux données
 * - Transforme les documents MongoDB en entités du domaine
 * - Transforme les entités du domaine en documents MongoDB
 *
 * @class MongoUserRepository
 * @implements {IUserRepository}
 */
export class MongoUserRepository implements IUserRepository {
  /**
   * Sauvegarde un utilisateur en base de données.
   *
   * @param {User} user - L'entité User à sauvegarder
   * @returns {Promise<User>} L'utilisateur sauvegardé
   * @throws {Error} Si la sauvegarde échoue
   */
  public async save(user: User): Promise<User> {
    try {
      // Don't set _id - let MongoDB generate the ObjectId automatically
      const userDocument = new UserModel({
        email: user.getEmail().getValue(),
        password: user.getPassword().getHash(),
        createdAt: user.getCreatedAt(),
      });

      await userDocument.save();

      return this.toDomain(userDocument);
    } catch (error: unknown) {
      // Gestion des erreurs de duplication MongoDB
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code: number }).code === 11000
      ) {
        throw new Error('Email already exists');
      }
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to save user: ${errorMessage}`);
    }
  }

  /**
   * Recherche un utilisateur par son email.
   *
   * @param {Email} email - L'email à rechercher
   * @returns {Promise<User | null>} L'utilisateur trouvé ou null
   */
  public async findByEmail(email: Email): Promise<User | null> {
    const userDocument = await UserModel.findOne({
      email: email.getValue(),
    }).exec();

    if (!userDocument) {
      return null;
    }

    return this.toDomain(userDocument);
  }

  /**
   * Recherche un utilisateur par son identifiant.
   *
   * @param {string} id - L'identifiant de l'utilisateur
   * @returns {Promise<User | null>} L'utilisateur trouvé ou null
   */
  public async findById(id: string): Promise<User | null> {
    const userDocument = await UserModel.findById(id).exec();

    if (!userDocument) {
      return null;
    }

    return this.toDomain(userDocument);
  }

  /**
   * Vérifie si un utilisateur avec cet email existe.
   *
   * @param {Email} email - L'email à vérifier
   * @returns {Promise<boolean>} True si l'email existe
   */
  public async existsByEmail(email: Email): Promise<boolean> {
    const count = await UserModel.countDocuments({
      email: email.getValue(),
    }).exec();

    return count > 0;
  }

  /**
   * Transforme un document Mongoose en entité du domaine.
   *
   * @private
   * @param {IUserDocument} document - Le document Mongoose
   * @returns {User} L'entité User du domaine
   */
  private toDomain(document: IUserDocument): User {
    const email = new Email(document.email);
    const password = Password.fromHash(document.password);

    return new User(
      (document._id as string).toString(),
      email,
      password,
      document.createdAt
    );
  }
}
