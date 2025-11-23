/**
 * Command for creating a new user.
 * Encapsulates the data needed to create a user.
 */
export class CreateUserCommand {
  constructor(
    public readonly email: string,
    public readonly password: string
  ) {}
}
