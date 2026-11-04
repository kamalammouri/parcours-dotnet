# Parcours .NET

Cours .NET 10 / C# 14 en 60 jours (3 h par jour) pour passer de développeur fullstack à développeur .NET confirmé. Base de données : SQL Server.

| Module | Jours | Contenu |
|---|---|---|
| 1 · Fondamentaux .NET et C# | 1 à 20 | Plateforme, projets, syntaxe, POO, class/struct/record, collections, génériques, LINQ, JSON, async, concurrence |
| 2 · SQL Server et ADO.NET | 21 à 26 | SQL, connexions, commandes, paramètres, transactions, procédures stockées, bulk, Dapper |
| 3 · Maîtrise d'EF Core | 27 à 36 | Modélisation, relations, migrations, requêtes, change tracker, concurrence, performance, tests |
| 4 · Créer des APIs avec ASP.NET Core | 37 à 49 | HTTP/REST, middleware, DI, controllers, Minimal APIs, validation, erreurs, OpenAPI, JWT, sécurité, tests |
| 5 · Architecture, patterns et tests | 50 à 56 | SOLID, Clean Architecture, design patterns, CQRS, DDD |
| 6 · Mise en production | 57 à 60 | Cache, jobs, Docker, CI/CD, entretien |
| Bonus | 7 journées | Performance, observabilité, SignalR, anti-patterns, documentation |

Chaque journée contient un cours, des exemples de code, trois exercices corrigés et une tâche sur le projet fil rouge OrderFlow.

**Ouvrir le cours :** https://kamalammouri.github.io/parcours-dotnet/

La progression est enregistrée dans le navigateur (localStorage), séparément sur chaque appareil.

## Structure

- `index.html` : l'interface et l'ordre du parcours (`MODULES`)
- `*.js` : le contenu, une entrée `window.COURSE.push({...})` par journée
