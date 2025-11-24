# Implementing a New Feature

This guide describes the logical flow for adding a new feature while respecting Clean Architecture. We will take the example of adding a "Create Blog Article" feature.

## Step 1: The Domain (`src/domain`)

Always start with the core of the business. What do we need?

1.  **Create the Entity**: Define the structure of your object and its business rules.
    - _File:_ `src/domain/entities/Article.ts`
    - _Content:_ `Article` class with `id`, `title`, `content`, `authorId`, etc. Add validation methods if necessary.

2.  **Define the Repository Interface**: How will we save this object? (Without worrying about the actual database).
    - _File:_ `src/domain/repositories/IArticleRepository.ts`
    - _Content:_ Interface with methods like `save(article: Article): Promise<void>`, `findById(id: string): Promise<Article | null>`.

## Step 2: The Infrastructure (`src/infrastructure`)

Now, implement the actual persistence.

3.  **Implement the Repository**: Create the concrete class that talks to the database.
    - _File:_ `src/infrastructure/persistence/PostgresArticleRepository.ts` (or Mongo, etc.)
    - _Content:_ Class that implements `IArticleRepository`. It uses your ORM (TypeORM, Mongoose) to save data.

## Step 3: The Application (`src/application`)

Orchestrate the logic.

4.  **Create the Service (Use Case)**: This is where the magic happens.
    - _File:_ `src/application/services/CreateArticleService.ts`
    - _Content:_ A class that takes `IArticleRepository` as a dependency.
      - Method `execute(data: CreateArticleDto)`:
        1.  Validates the data.
        2.  Creates a new instance of the `Article` entity.
        3.  Calls `articleRepository.save(article)`.
        4.  Returns the result.

## Step 4: The Presentation (`src/presentation`)

Expose your feature to the world.

5.  **Create the Controller**: Handle the HTTP request.
    - _File:_ `src/presentation/controllers/ArticleController.ts`
    - _Content:_ A `create` method that:
      1.  Extracts data from `req.body`.
      2.  Calls `createArticleService.execute()`.
      3.  Returns an HTTP response (201 Created) with the result.

6.  **Define the Route**: Bind the URL to the Controller.
    - _File:_ `src/presentation/routes/articleRoutes.ts`
    - _Content:_ `router.post('/articles', articleController.create)`.

7.  **Register the Route**: Add your new router to the main routes file (`src/app.ts` or `src/presentation/routes/index.ts`).

## Flow Summary

1.  **Domain** (Entity + Repo Interface) -> _I define what I want to do._
2.  **Infrastructure** (Repo Implementation) -> _I define how I save it._
3.  **Application** (Service) -> _I assemble everything._
4.  **Presentation** (Controller + Route) -> _I make it accessible._
