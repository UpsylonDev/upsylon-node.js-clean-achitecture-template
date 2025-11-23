/**
 * Data Transfer Object for creating a user.
 * Used to transfer data from the presentation layer to the application layer.
 */
export interface CreateUserDTO {
  email: string;
  password: string;
}
