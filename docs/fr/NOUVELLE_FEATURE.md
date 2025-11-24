# Implémenter une Nouvelle Fonctionnalité

Ce guide décrit le cheminement logique pour ajouter une nouvelle fonctionnalité en respectant la Clean Architecture. Nous allons prendre l'exemple de l'ajout d'une fonctionnalité "Créer un Article de Blog".

## Étape 1 : Le Domaine (`src/domain`)

Commencez toujours par le cœur du métier. De quoi avons-nous besoin ?

1.  **Créer l'Entité** : Définissez la structure de votre objet et ses règles métier.
    - _Fichier :_ `src/domain/entities/Article.ts`
    - _Contenu :_ Classe `Article` avec `id`, `title`, `content`, `authorId`, etc. Ajoutez des méthodes de validation si nécessaire.

2.  **Définir l'Interface du Repository** : Comment allons-nous sauvegarder cet objet ? (Sans se soucier de la base de données réelle).
    - _Fichier :_ `src/domain/repositories/IArticleRepository.ts`
    - _Contenu :_ Interface avec des méthodes comme `save(article: Article): Promise<void>`, `findById(id: string): Promise<Article | null>`.

## Étape 2 : L'Infrastructure (`src/infrastructure`)

Maintenant, implémentez la persistance réelle.

3.  **Implémenter le Repository** : Créez la classe concrète qui parle à la base de données.
    - _Fichier :_ `src/infrastructure/persistence/PostgresArticleRepository.ts` (ou Mongo, etc.)
    - _Contenu :_ Classe qui implémente `IArticleRepository`. Elle utilise votre ORM (TypeORM, Mongoose) pour sauvegarder les données.

## Étape 3 : L'Application (`src/application`)

Orchestrez la logique.

4.  **Créer le Service (Use Case)** : C'est ici que la magie opère.
    - _Fichier :_ `src/application/services/CreateArticleService.ts`
    - _Contenu :_ Une classe qui prend en dépendance `IArticleRepository`.
      - Méthode `execute(data: CreateArticleDto)` :
        1.  Valide les données.
        2.  Crée une nouvelle instance de l'entité `Article`.
        3.  Appelle `articleRepository.save(article)`.
        4.  Retourne le résultat.

## Étape 4 : La Présentation (`src/presentation`)

Exposez votre fonctionnalité au monde.

5.  **Créer le Controller** : Gérez la requête HTTP.
    - _Fichier :_ `src/presentation/controllers/ArticleController.ts`
    - _Contenu :_ Une méthode `create` qui :
      1.  Extrait les données du `req.body`.
      2.  Appelle `createArticleService.execute()`.
      3.  Renvoie une réponse HTTP (201 Created) avec le résultat.

6.  **Définir la Route** : Liez l'URL au Controller.
    - _Fichier :_ `src/presentation/routes/articleRoutes.ts`
    - _Contenu :_ `router.post('/articles', articleController.create)`.

7.  **Enregistrer la Route** : Ajoutez votre nouveau routeur dans le fichier principal des routes (`src/app.ts` ou `src/presentation/routes/index.ts`).

## Résumé du Flux

1.  **Domain** (Entité + Interface Repo) -> _Je définis ce que je veux faire._
2.  **Infrastructure** (Implémentation Repo) -> _Je définis comment je le sauvegarde._
3.  **Application** (Service) -> _J'assemble le tout._
4.  **Presentation** (Controller + Route) -> _Je le rends accessible._
