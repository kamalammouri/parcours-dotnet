# Parcours .NET

Cours .NET 10 / C# 14 à suivre à ton rythme, des bases de C# jusqu'à la création d'APIs avec ADO.NET, EF Core et ASP.NET Core. Base de données : SQL Server.

**Ouvrir le cours :** https://kamalammouri.github.io/parcours-dotnet/

## Le parcours

| Partie | Contenu |
|---|---|
| 1 · Fondamentaux .NET et C# | 6 chapitres, 67 leçons courtes : découvrir .NET, bases du langage, programmation orientée objet, types et mémoire, collections/génériques/LINQ, fichiers/JSON/asynchrone |
| 2 · SQL Server et ADO.NET | 3 chapitres, 19 leçons : SQL pour développeurs, ADO.NET pas à pas, transactions, procédures stockées, SqlBulkCopy, repository et Dapper |
| 3 · Maîtrise d'EF Core | 3 chapitres, 21 leçons : DbContext et migrations, relations et requêtes, change tracker, concurrence, performance, tests |
| 4 · Créer des APIs avec ASP.NET Core | 4 chapitres, 22 leçons : HTTP/REST, middleware, DI, controllers et Minimal APIs, DTOs, validation, erreurs, CRUD EF Core, OpenAPI, versioning, JWT, CORS, HttpClient |
| 5 · Architecture, patterns et tests | 3 chapitres, 20 leçons : xUnit, NSubstitute, tests d'intégration, SOLID, Clean Architecture, CQRS, DDD, Result pattern, design patterns |
| 6 · Mise en production | 9 leçons : cache, tâches de fond, files de messages, résilience, observabilité, Docker, CI/CD, checklist, entretien |
| Bonus | 7 leçons : performance, SignalR, gRPC, .NET Aspire, projet final, documentation, revue de code |

## Format d'une leçon

Une analogie « Pour comprendre », un cours court avec schémas, des exemples de code expliqués ligne par ligne avec le résultat console, trois exercices corrigés (facile, moyen, difficile), un mini-quiz et une étape du fil rouge : le mini-projet Bibliothèque en partie 1, puis OrderFlow (une API de prise de commandes) à partir de la partie 2.

La progression est enregistrée dans le navigateur (localStorage), séparément sur chaque appareil.

## Structure

- `index.html` : l'interface et l'ordre du parcours (`PARTS`)
- `v2-ch*.js` : les leçons de la partie 1
- `v3-*.js` : les leçons des parties 2 à 6 et du bonus
