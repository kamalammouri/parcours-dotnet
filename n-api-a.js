window.COURSE = window.COURSE || [];

/* ============================================================
   Jour 37 : HTTP et REST pour concevoir une API
   ============================================================ */
window.COURSE.push({
  key: "w-http-rest",
  title: "HTTP et REST pour concevoir une API",
  summary: "Avant d'écrire une ligne d'ASP.NET Core, apprendre à concevoir une API propre : verbes, codes de statut, en-têtes, URLs et pagination.",
  objectives: [
    "Décrire précisément une requête et une réponse HTTP",
    "Choisir le bon verbe et savoir lesquels sont sûrs et idempotents",
    "Renvoyer le bon code de statut dans chaque situation (201, 204, 404, 409, 422…)",
    "Nommer des ressources et des URLs selon les conventions REST",
    "Concevoir le contrat complet de l'API OrderFlow et le tester avec un fichier .http"
  ],
  lesson: `
<h3>Pourquoi commencer par HTTP</h3>
<p>Une API web n'est rien d'autre qu'un programme qui reçoit des requêtes HTTP et renvoie des réponses HTTP. ASP.NET Core, Express ou Spring ne font que t'aider à écrire ce programme. Si tu maîtrises HTTP, tu sauras concevoir une bonne API dans n'importe quel framework ; si tu ne le maîtrises pas, le meilleur framework du monde produira une API confuse : des <code>POST /getOrders</code>, des erreurs renvoyées avec un code 200, des clients Angular qui doivent lire le corps de la réponse pour savoir si l'appel a marché. Cette journée est donc volontairement sans framework : on conçoit le contrat, on code demain.</p>

<h3>Anatomie d'une requête et d'une réponse</h3>
<p>Une requête HTTP contient quatre choses : une <strong>méthode</strong> (le verbe), une <strong>cible</strong> (le chemin et la query string), des <strong>en-têtes</strong> et éventuellement un <strong>corps</strong>.</p>
<pre><code>POST /api/orders?notify=true HTTP/1.1
Host: localhost:5001
Content-Type: application/json
Accept: application/json
Authorization: Bearer eyJhbGciOi...

{ "customerId": 42, "lines": [ { "productId": 7, "quantity": 2 } ] }</code></pre>
<p>La réponse contient une <strong>ligne de statut</strong> (code + raison), des en-têtes et un corps éventuel :</p>
<pre><code>HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/orders/1001

{ "id": 1001, "status": "Pending", "total": 59.80 }</code></pre>
<p>Retiens que le code de statut est la première chose que lit un client. Le corps sert à donner des détails, jamais à dire si l'appel a réussi.</p>

<h3>Les verbes : sûrs et idempotents</h3>
<p>Deux propriétés comptent. Une méthode est <strong>sûre</strong> si elle ne modifie rien côté serveur (on peut la rejouer, la mettre en cache, la précharger). Elle est <strong>idempotente</strong> si l'exécuter une fois ou dix fois laisse le serveur dans le même état. L'idempotence est cruciale : le réseau est peu fiable, un client (ou un proxy) peut renvoyer une requête dont il n'a pas reçu la réponse.</p>
<table>
<thead><tr><th>Verbe</th><th>Usage</th><th>Sûr</th><th>Idempotent</th><th>Corps</th><th>Réponse typique</th></tr></thead>
<tbody>
<tr><td>GET</td><td>Lire une ressource ou une collection</td><td>Oui</td><td>Oui</td><td>Non</td><td>200</td></tr>
<tr><td>POST</td><td>Créer une ressource, déclencher une action</td><td>Non</td><td>Non</td><td>Oui</td><td>201 + Location, ou 202</td></tr>
<tr><td>PUT</td><td>Remplacer entièrement une ressource</td><td>Non</td><td>Oui</td><td>Oui</td><td>200 ou 204</td></tr>
<tr><td>PATCH</td><td>Modifier une partie d'une ressource</td><td>Non</td><td>Pas forcément</td><td>Oui</td><td>200 ou 204</td></tr>
<tr><td>DELETE</td><td>Supprimer une ressource</td><td>Non</td><td>Oui</td><td>Rarement</td><td>204</td></tr>
</tbody>
</table>
<p>Piège classique : un <code>DELETE</code> rejoué sur une ressource déjà supprimée. L'état final est le même (la ressource n'existe pas), donc l'opération reste idempotente même si la seconde réponse est un 404. Autre piège : utiliser <code>PUT</code> pour une mise à jour partielle. Avec <code>PUT</code>, un champ absent du corps signifie « remets-le à sa valeur par défaut ». Pour modifier seulement le statut d'une commande, c'est <code>PATCH</code>.</p>

<h3>Les codes de statut à connaître par cœur</h3>
<table>
<thead><tr><th>Code</th><th>Signification</th><th>Quand l'utiliser</th></tr></thead>
<tbody>
<tr><td>200 OK</td><td>Succès avec corps</td><td>GET réussi, PUT/PATCH qui renvoie la ressource</td></tr>
<tr><td>201 Created</td><td>Ressource créée</td><td>POST de création, avec l'en-tête <code>Location</code> vers la nouvelle ressource</td></tr>
<tr><td>202 Accepted</td><td>Pris en compte, traité plus tard</td><td>Traitement asynchrone (export, import)</td></tr>
<tr><td>204 No Content</td><td>Succès sans corps</td><td>DELETE, PUT qui ne renvoie rien</td></tr>
<tr><td>400 Bad Request</td><td>Requête mal formée</td><td>JSON invalide, paramètre manquant, validation échouée</td></tr>
<tr><td>401 Unauthorized</td><td>Non authentifié</td><td>Pas de token ou token invalide/expiré</td></tr>
<tr><td>403 Forbidden</td><td>Authentifié mais pas autorisé</td><td>Un client essaie de lire la commande d'un autre</td></tr>
<tr><td>404 Not Found</td><td>Ressource inexistante</td><td><code>GET /orders/999</code> qui n'existe pas</td></tr>
<tr><td>409 Conflict</td><td>Conflit avec l'état actuel</td><td>Email déjà utilisé, conflit de concurrence, annuler une commande déjà expédiée</td></tr>
<tr><td>422 Unprocessable Content</td><td>Syntaxe correcte, règle métier violée</td><td>Quantité supérieure au stock (certaines équipes utilisent 400 pour tout)</td></tr>
<tr><td>500 Internal Server Error</td><td>Bug côté serveur</td><td>Jamais volontairement : c'est une exception non gérée</td></tr>
</tbody>
</table>
<p>La règle simple : 4xx veut dire « le client doit changer quelque chose », 5xx veut dire « le serveur a un problème ». Un client Angular peut afficher un message à l'utilisateur sur un 4xx, et réessayer ou alerter sur un 5xx.</p>

<h3>Les en-têtes utiles</h3>
<ul>
<li><code>Content-Type</code> : format du corps envoyé (<code>application/json</code>).</li>
<li><code>Accept</code> : format attendu en réponse. C'est la base de la <strong>négociation de contenu</strong> : le client dit ce qu'il comprend, le serveur choisit (et renvoie 406 s'il ne sait rien produire d'acceptable, si on le configure ainsi).</li>
<li><code>Authorization</code> : le jeton, en général <code>Bearer &lt;jwt&gt;</code>.</li>
<li><code>ETag</code> et <code>If-None-Match</code> : une empreinte de la version de la ressource. Le client renvoie l'ETag, et le serveur répond 304 Not Modified si rien n'a changé. Avec <code>If-Match</code>, l'ETag sert aussi à la concurrence optimiste (412 Precondition Failed si quelqu'un a modifié entre-temps).</li>
<li><code>Cache-Control</code> : <code>no-store</code>, <code>max-age=60</code>, <code>private</code>… indique aux navigateurs et proxys ce qu'ils peuvent mettre en cache.</li>
<li><code>Location</code> : l'URL de la ressource créée après un 201.</li>
</ul>

<h3>Nommer les ressources et les URLs</h3>
<p>REST raisonne en <strong>ressources</strong> (des noms) sur lesquelles on applique des verbes HTTP. Les conventions qui font consensus :</p>
<ul>
<li>Des noms au pluriel : <code>/api/orders</code>, <code>/api/products</code>.</li>
<li>Un identifiant pour un élément : <code>/api/orders/1001</code>.</li>
<li>La hiérarchie pour les sous-ressources qui n'existent pas seules : <code>/api/orders/1001/lines</code>. Ne descends pas au-delà de deux niveaux, sinon les URLs deviennent illisibles.</li>
<li>Pas de verbes dans l'URL : pas de <code>/api/getOrders</code> ni de <code>/api/orders/delete/5</code>. Le verbe est la méthode HTTP.</li>
<li>Des minuscules et des tirets : <code>/api/order-statuses</code>.</li>
<li>Pour une action qui ne rentre pas dans le CRUD (annuler une commande), deux écoles : <code>PATCH /orders/1001</code> avec <code>{"status":"Cancelled"}</code>, ou une sous-ressource action <code>POST /orders/1001/cancel</code>. La seconde est pragmatique et très répandue quand l'action a des règles métier.</li>
</ul>

<h3>Filtrer, trier, paginer</h3>
<p>Tout ce qui affine une collection passe par la query string, jamais par le chemin :</p>
<pre><code>GET /api/orders?status=Pending&amp;customerId=42&amp;sort=-createdAt&amp;page=2&amp;pageSize=20</code></pre>
<p>Ne renvoie jamais une collection sans limite : une table de 2 millions de commandes renvoyée d'un bloc fait tomber le serveur et le navigateur. Fixe une taille de page par défaut (20) et un maximum (100). Renvoie aussi les métadonnées (nombre total, page courante) dans le corps ou dans des en-têtes.</p>

<h3>Stateless et niveaux de maturité</h3>
<p>REST impose que chaque requête soit <strong>autonome</strong> : le serveur ne garde pas de session entre deux appels, le client renvoie à chaque fois son jeton et tout le contexte nécessaire. C'est ce qui permet de lancer dix instances de ton API derrière un load balancer sans problème.</p>
<p>Le modèle de maturité de Richardson classe les API en quatre niveaux : niveau 0, un seul endpoint qui reçoit tout (SOAP, RPC) ; niveau 1, des ressources distinctes ; niveau 2, des ressources plus les bons verbes et codes de statut ; niveau 3, de l'hypermédia (HATEOAS : la réponse contient les liens des actions possibles). En pratique, presque toutes les API professionnelles visent le <strong>niveau 2</strong>, et c'est notre objectif.</p>

<h3>REST n'est pas le seul choix</h3>
<table>
<thead><tr><th>Style</th><th>Principe</th><th>Points forts</th><th>Quand le choisir</th></tr></thead>
<tbody>
<tr><td>REST / JSON</td><td>Ressources + verbes HTTP</td><td>Universel, cache HTTP, simple à consommer depuis Angular</td><td>API publique ou front web, le cas par défaut</td></tr>
<tr><td>RPC JSON</td><td>Appel de procédures (<code>POST /calculateShipping</code>)</td><td>Direct pour des actions</td><td>Opérations qui ne sont pas des ressources</td></tr>
<tr><td>GraphQL</td><td>Un endpoint, le client décrit les champs voulus</td><td>Pas de sur-récupération, idéal pour des fronts variés</td><td>Beaucoup de clients aux besoins différents</td></tr>
<tr><td>gRPC</td><td>Contrats Protobuf, HTTP/2, binaire</td><td>Très rapide, streaming, typage fort</td><td>Communication entre services internes</td></tr>
</tbody>
</table>

<h3>Tester une API sans écrire de client</h3>
<p>Visual Studio et VS Code (extension REST Client) savent exécuter des fichiers <code>.http</code> versionnés avec le projet : c'est la meilleure façon de documenter et rejouer tes scénarios. <code>curl</code> est utile en ligne de commande et dans les scripts, et Postman ou Bruno pour des collections partagées. Prends l'habitude d'écrire le fichier <code>.http</code> en même temps que l'endpoint.</p>

<div class="note">Un senior conçoit le contrat avant le code et le fait valider par le consommateur (l'équipe Angular). Il pense dès le départ aux cas d'erreur (que renvoie-t-on si le produit n'existe plus ? si le stock est insuffisant ?), à la pagination de chaque collection et à la compatibilité future : on peut ajouter un champ à une réponse sans casser les clients, mais on ne peut ni en retirer, ni en renommer, ni changer son type sans versionner l'API.</div>
`,
  examples: [
    {
      title: "Fichier OrderFlow.Api.http : scénario complet",
      code: `@baseUrl = https://localhost:5001
@token = eyJhbGciOiJIUzI1NiJ9.exemple

### Lister les commandes en attente, page 1
GET {{baseUrl}}/api/orders?status=Pending&page=1&pageSize=20
Accept: application/json
Authorization: Bearer {{token}}

### Lire une commande
GET {{baseUrl}}/api/orders/1001
Accept: application/json

### Créer une commande (attendu : 201 + Location)
POST {{baseUrl}}/api/orders
Content-Type: application/json

{
  "customerId": 42,
  "lines": [
    { "productId": 7, "quantity": 2 },
    { "productId": 9, "quantity": 1 }
  ]
}

### Modifier partiellement (attendu : 204)
PATCH {{baseUrl}}/api/orders/1001
Content-Type: application/json

{ "shippingAddress": "12 rue des Lilas, Lyon" }

### Annuler (action métier, attendu : 204 ou 409 si déjà expédiée)
POST {{baseUrl}}/api/orders/1001/cancel

### Supprimer (attendu : 204)
DELETE {{baseUrl}}/api/orders/1001`,
      explain: `Les variables <code>@baseUrl</code> et <code>@token</code> évitent la répétition ; <code>###</code> sépare les requêtes, que tu lances une par une depuis l'éditeur.`
    },
    {
      title: "Les mêmes appels avec curl",
      code: `# Lire avec les en-têtes de réponse (-i)
curl -i https://localhost:5001/api/orders/1001 -H "Accept: application/json"

# Créer : -X POST, corps JSON avec -d
curl -i -X POST https://localhost:5001/api/orders -H "Content-Type: application/json" -d '{"customerId":42,"lines":[{"productId":7,"quantity":2}]}'

# Requête conditionnelle avec un ETag reçu précédemment (attendu : 304)
curl -i https://localhost:5001/api/products/7 -H 'If-None-Match: "a1b2c3"'

# Supprimer
curl -i -X DELETE https://localhost:5001/api/orders/1001`,
      explain: `L'option <code>-i</code> affiche la ligne de statut et les en-têtes : c'est elle qui te montre le 201 et le <code>Location</code>.`
    },
    {
      title: "Réponses attendues : création, erreur de validation, conflit",
      code: `HTTP/1.1 201 Created
Location: /api/orders/1001
Content-Type: application/json

{ "id": 1001, "customerId": 42, "status": "Pending", "total": 59.80 }

---

HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "Lines[0].Quantity": [ "La quantité doit être comprise entre 1 et 100." ] }
}

---

HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{
  "title": "Commande déjà expédiée",
  "status": 409,
  "detail": "La commande 1001 a été expédiée le 2026-11-02 et ne peut plus être annulée."
}`,
      explain: `Les erreurs suivent le format standard ProblemDetails (<code>application/problem+json</code>), que l'on mettra en place au jour 42.`
    },
    {
      title: "Réponse paginée avec métadonnées",
      code: `GET /api/products?category=books&sort=price&page=2&pageSize=2

HTTP/1.1 200 OK
Content-Type: application/json

{
  "items": [
    { "id": 12, "name": "Clean Code", "price": 32.90 },
    { "id": 15, "name": "Domain-Driven Design", "price": 54.00 }
  ],
  "page": 2,
  "pageSize": 2,
  "totalCount": 37,
  "totalPages": 19
}`,
      explain: `Envelopper la collection dans un objet laisse la place aux métadonnées et permet d'ajouter des champs plus tard sans casser le client.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Verbe et code de statut",
      prompt: `<p>Pour chaque situation, donne le verbe HTTP, l'URL et le code de statut de la réponse :</p><ol><li>Lire le produit 7.</li><li>Créer un client.</li><li>Supprimer la ligne 3 de la commande 1001.</li><li>Lire la commande 999 qui n'existe pas.</li><li>Créer un client avec un email déjà utilisé.</li><li>Appeler <code>GET /api/orders</code> sans jeton alors que l'endpoint est protégé.</li></ol>`,
      hint: `<p>Pense au tableau des codes : 201 pour une création, 204 pour une suppression, 409 pour un conflit avec l'état existant, 401 quand l'identité manque.</p>`,
      solution: `1. GET    /api/products/7                 -> 200 OK (corps : le produit)
2. POST   /api/customers                  -> 201 Created + Location: /api/customers/{id}
3. DELETE /api/orders/1001/lines/3        -> 204 No Content
4. GET    /api/orders/999                 -> 404 Not Found (corps ProblemDetails)
5. POST   /api/customers                  -> 409 Conflict (email déjà utilisé)
6. GET    /api/orders  (sans Authorization) -> 401 Unauthorized

Remarque : si l'utilisateur est authentifié mais n'a pas le droit
de voir les commandes, la réponse est 403 Forbidden, pas 401.`
    },
    {
      level: "moyen",
      title: "Corriger une API mal conçue",
      prompt: `<p>Voici une API existante. Réécris chaque endpoint selon les conventions REST (verbe, URL, code de succès) :</p><pre><code>POST /api/getAllProducts
POST /api/product/create
GET  /api/product/delete?id=5
POST /api/updateProductPrice   { "id": 5, "price": 12.5 }
GET  /api/orders/list/customer/42
POST /api/orders/42/cancelOrder   (renvoie 200 avec { "success": false } si impossible)</code></pre>`,
      hint: `<p>Retire les verbes des URLs, mets les noms au pluriel, utilise la méthode HTTP pour l'action, et remplace le <code>success: false</code> par un vrai code d'erreur.</p>`,
      solution: `GET    /api/products                         -> 200 (paginé)
POST   /api/products                         -> 201 + Location
DELETE /api/products/5                       -> 204
PATCH  /api/products/5   { "price": 12.5 }   -> 200 ou 204
GET    /api/orders?customerId=42             -> 200 (filtre en query string)
       (ou GET /api/customers/42/orders si on veut une sous-ressource)
POST   /api/orders/42/cancel                 -> 204 si annulée
                                             -> 409 Conflict + ProblemDetails si impossible

Problèmes corrigés :
- un GET ne doit jamais modifier l'état (delete en GET = un robot d'indexation peut tout supprimer)
- les verbes sont dans la méthode HTTP, pas dans l'URL
- une erreur métier se signale par un code 4xx, pas par un 200 avec un booléen`
    },
    {
      level: "difficile",
      title: "Mise à jour concurrente avec ETag",
      prompt: `<p>Deux administrateurs modifient le prix du produit 7 en même temps. Décris, requêtes et réponses HTTP complètes à l'appui, un protocole basé sur <code>ETag</code> et <code>If-Match</code> qui empêche le second d'écraser silencieusement la modification du premier. Écris-le sous forme de fichier <code>.http</code> commenté.</p>`,
      hint: `<p>Le GET renvoie un ETag (par exemple dérivé d'une colonne rowversion). Le PUT ou PATCH renvoie cet ETag dans <code>If-Match</code>. Si la version a changé, le serveur répond 412 Precondition Failed.</p>`,
      solution: `### Admin A lit le produit
GET https://localhost:5001/api/products/7
# Réponse : 200 OK
# ETag: "v1"
# { "id": 7, "name": "Clavier", "price": 49.90 }

### Admin B lit le même produit (même version)
GET https://localhost:5001/api/products/7
# Réponse : 200 OK, ETag: "v1"

### Admin A modifie en précisant la version qu'il a lue
PATCH https://localhost:5001/api/products/7
Content-Type: application/json
If-Match: "v1"

{ "price": 44.90 }
# Réponse : 204 No Content
# ETag: "v2"   (la version a changé côté serveur)

### Admin B modifie avec une version périmée
PATCH https://localhost:5001/api/products/7
Content-Type: application/json
If-Match: "v1"

{ "price": 39.90 }
# Réponse : 412 Precondition Failed
# Content-Type: application/problem+json
# { "title": "La ressource a été modifiée", "status": 412,
#   "detail": "Rechargez le produit puis réessayez." }

### Admin B recharge, voit 44.90 et décide en connaissance de cause
GET https://localhost:5001/api/products/7
# 200 OK, ETag: "v2"

# Côté serveur, l'ETag vient typiquement d'une colonne rowversion SQL Server
# ou d'un hash de la ressource ; EF Core la compare dans le WHERE de l'UPDATE.
# Sans If-Match, le serveur peut répondre 428 Precondition Required.`
    }
  ],
  project: `<p><strong>Concevoir le contrat de OrderFlow.Api sur papier.</strong> Crée un fichier <code>docs/api-contract.md</code> avec un tableau des endpoints pour les ressources Customers, Products, Orders et OrderLines : verbe, URL, corps attendu, codes de succès et codes d'erreur possibles. Prévois la pagination sur chaque collection, le filtre <code>status</code> sur les commandes et l'action <code>POST /api/orders/{id}/cancel</code>. Écris ensuite le fichier <code>OrderFlow.Api.http</code> qui contient un appel par endpoint. Il servira de test manuel tout au long du module.</p>`,
  resources: [
    { label: "Codes de statut renvoyés par ASP.NET Core (types de retour des actions)", url: "https://learn.microsoft.com/aspnet/core/web-api/action-return-types" },
    { label: "Utiliser les fichiers .http dans Visual Studio", url: "https://learn.microsoft.com/aspnet/core/test/http-files" },
    { label: "Créer des API web avec ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/web-api/" }
  ]
});

/* ============================================================
   Jour 38 : Hébergement et pipeline middleware
   ============================================================ */
window.COURSE.push({
  key: "w-hosting",
  title: "Hébergement et pipeline middleware",
  summary: "Comprendre ce qui se passe entre l'arrivée d'une requête sur Kestrel et l'exécution de ton code : Program.cs, environnements et middlewares.",
  objectives: [
    "Créer un projet webapi et expliquer chaque ligne de Program.cs",
    "Configurer les profils de lancement et les environnements",
    "Expliquer le pipeline middleware : ordre, next et court-circuit",
    "Écrire un middleware personnalisé sous forme de classe",
    "Placer les middlewares officiels dans le bon ordre"
  ],
  lesson: `
<h3>Créer le projet</h3>
<p>Le modèle de départ s'obtient avec <code>dotnet new webapi -n OrderFlow.Api</code>. Ajoute <code>--use-controllers</code> si tu veux un projet avec controllers ; sans cette option, le modèle génère des Minimal APIs. Le projet contient un <code>Program.cs</code>, un <code>appsettings.json</code>, un <code>appsettings.Development.json</code>, un dossier <code>Properties</code> avec <code>launchSettings.json</code>, et un fichier <code>.http</code>. Le fichier projet utilise le SDK <code>Microsoft.NET.Sdk.Web</code>, qui référence automatiquement tout ASP.NET Core : aucun paquet NuGet n'est nécessaire pour démarrer.</p>

<h3>L'anatomie de Program.cs</h3>
<p><code>Program.cs</code> se lit en deux phases séparées par <code>builder.Build()</code>.</p>
<ol>
<li><strong>Phase de configuration</strong> : <code>WebApplication.CreateBuilder(args)</code> crée l'hôte avec des valeurs par défaut (configuration depuis appsettings, variables d'environnement et ligne de commande ; logging console ; Kestrel). Tu enregistres ensuite les services dans <code>builder.Services</code> : c'est le conteneur d'injection de dépendances (vu au jour 39).</li>
<li><strong>Phase de pipeline</strong> : <code>var app = builder.Build();</code> construit l'application. À partir de là, tu ne peux plus ajouter de services. Tu décris le pipeline avec <code>app.Use...</code>, puis les endpoints avec <code>app.Map...</code> ou <code>app.MapControllers()</code>, et enfin <code>app.Run()</code> démarre le serveur et bloque jusqu'à l'arrêt.</li>
</ol>
<p>Comparé à Angular, <code>builder.Services</code> joue le rôle des <code>providers</code>, et le pipeline ressemble à une chaîne d'intercepteurs HTTP, mais côté serveur.</p>

<h3>Kestrel et les profils de lancement</h3>
<p><strong>Kestrel</strong> est le serveur web intégré, multiplateforme et très performant. En production, il tourne seul dans un conteneur, ou derrière un reverse proxy (IIS, Nginx, YARP, un load balancer cloud). <code>Properties/launchSettings.json</code> ne sert qu'en développement local : il définit des <strong>profils</strong> (http, https, IIS Express) avec les URLs d'écoute et les variables d'environnement. Ce fichier n'est pas déployé : en production, les URLs viennent de la configuration (<code>ASPNETCORE_URLS</code>, ou <code>ASPNETCORE_HTTP_PORTS</code> dans les images Docker).</p>

<h3>Les environnements</h3>
<p>La variable <code>ASPNETCORE_ENVIRONMENT</code> vaut <code>Development</code>, <code>Staging</code>, <code>Production</code> ou un nom personnalisé. En son absence, la valeur est <strong>Production</strong> : c'est volontaire, une erreur de configuration ne doit pas exposer les pages d'erreur détaillées. L'environnement sélectionne <code>appsettings.{Environment}.json</code>, qui surcharge <code>appsettings.json</code>, et se teste avec <code>app.Environment.IsDevelopment()</code>. On l'utilise pour activer en développement seulement le document OpenAPI, la page d'exception détaillée, ou les données de test.</p>

<h3>Le pipeline middleware</h3>
<p>Un <strong>middleware</strong> est une fonction qui reçoit le <code>HttpContext</code> et une référence au middleware suivant (<code>next</code>). Il peut agir avant d'appeler <code>next</code>, appeler <code>next</code>, puis agir après, quand la réponse remonte. Le pipeline forme donc des poupées russes : la requête descend du premier middleware au dernier, la réponse remonte dans l'ordre inverse.</p>
<pre><code>Requête  → [Exception handler] → [HTTPS] → [CORS] → [Auth] → [Endpoint]
Réponse  ← [Exception handler] ← [HTTPS] ← [CORS] ← [Auth] ← [Endpoint]</code></pre>
<p>Trois façons d'ajouter un middleware :</p>
<ul>
<li><code>app.Use(async (context, next) =&gt; { ...; await next(context); ... })</code> : middleware en ligne qui passe la main.</li>
<li><code>app.Run(async context =&gt; { ... })</code> : middleware <strong>terminal</strong>, qui n'a pas de <code>next</code>. Tout ce qui est déclaré après lui n'est jamais exécuté.</li>
<li><code>app.Map("/health", branch =&gt; ...)</code> : crée une branche du pipeline pour un préfixe de chemin.</li>
</ul>
<p>Un middleware qui n'appelle pas <code>next</code> <strong>court-circuite</strong> le pipeline. C'est exactement ce que fait le middleware d'authentification quand il refuse une requête, ou le middleware de fichiers statiques quand il trouve le fichier demandé.</p>

<h3>Écrire un middleware en classe</h3>
<p>Pour un vrai middleware, écris une classe avec un constructeur qui reçoit un <code>RequestDelegate next</code>, et une méthode <code>InvokeAsync(HttpContext context)</code>. Le middleware est créé une seule fois au démarrage : c'est de fait un <strong>singleton</strong>. Les services scoped (comme le <code>DbContext</code>) ne doivent donc pas être injectés dans son constructeur, mais en paramètres supplémentaires de <code>InvokeAsync</code>, où ils sont résolus à chaque requête. On l'enregistre avec <code>app.UseMiddleware&lt;T&gt;()</code>, souvent enveloppé dans une méthode d'extension <code>app.UseCorrelationId()</code>.</p>

<h3>L'ordre recommandé</h3>
<p>L'ordre compte : un middleware ne voit que ce qui passe par lui. L'ordre conseillé par Microsoft pour une API :</p>
<table>
<thead><tr><th>Ordre</th><th>Middleware</th><th>Pourquoi à cette place</th></tr></thead>
<tbody>
<tr><td>1</td><td><code>UseExceptionHandler</code></td><td>En premier pour attraper les exceptions de tous les suivants</td></tr>
<tr><td>2</td><td><code>UseHsts</code> (hors développement)</td><td>Ajoute l'en-tête HSTS sur les réponses</td></tr>
<tr><td>3</td><td><code>UseHttpsRedirection</code></td><td>Redirige HTTP vers HTTPS avant tout traitement</td></tr>
<tr><td>4</td><td>Middlewares personnalisés transverses (corrélation, chronométrage)</td><td>Tôt pour couvrir toute la requête</td></tr>
<tr><td>5</td><td><code>UseRouting</code> (implicite)</td><td>Choisit l'endpoint ; WebApplication l'ajoute automatiquement</td></tr>
<tr><td>6</td><td><code>UseCors</code></td><td>Après le routage, avant l'authentification, pour répondre aux requêtes preflight</td></tr>
<tr><td>7</td><td><code>UseAuthentication</code></td><td>Établit l'identité (lit le JWT)</td></tr>
<tr><td>8</td><td><code>UseAuthorization</code></td><td>Vérifie les droits ; il a besoin de l'identité et de l'endpoint choisi</td></tr>
<tr><td>9</td><td><code>UseRateLimiter</code>, <code>UseOutputCache</code></td><td>Après l'identité, si les politiques dépendent de l'utilisateur</td></tr>
<tr><td>10</td><td><code>MapControllers</code> / <code>MapGet</code>…</td><td>Les endpoints, en bout de chaîne</td></tr>
</tbody>
</table>
<p>Avec <code>WebApplication</code>, l'appel explicite à <code>UseRouting</code> est facultatif : il est ajouté au début, et les endpoints à la fin. On l'écrit explicitement seulement si un middleware a besoin de connaître l'endpoint choisi et doit être placé avant un autre.</p>

<h3>HttpContext</h3>
<p><code>HttpContext</code> contient tout ce qui concerne la requête en cours. <code>Request</code> donne accès au chemin, à la méthode, aux en-têtes, à la query string et au corps. <code>Response</code> permet de fixer le code de statut, les en-têtes et le corps. <code>User</code> contient l'identité (les claims). <code>Items</code> est un dictionnaire qui ne vit que le temps de la requête, utile pour passer une donnée entre middlewares. <code>RequestAborted</code> est un <code>CancellationToken</code> déclenché quand le client ferme la connexion. <code>TraceIdentifier</code> est un identifiant unique de requête.</p>
<p>Piège important : on ne peut plus modifier les en-têtes une fois que le corps de la réponse a commencé à partir. Pour ajouter un en-tête de réponse depuis un middleware, utilise <code>context.Response.OnStarting(...)</code> ou ajoute-le avant d'appeler <code>next</code>.</p>

<h3>Fichiers statiques et tâches de démarrage</h3>
<p><code>app.UseStaticFiles()</code> sert le contenu de <code>wwwroot</code>. C'est utile pour héberger le build Angular dans la même application, mais en général le front est servi séparément. Pour exécuter du code au démarrage, comme appliquer des migrations en développement ou préchauffer un cache, implémente <code>IHostedService</code> (ou <code>BackgroundService</code>) et enregistre-le avec <code>AddHostedService</code>. Son <code>StartAsync</code> s'exécute avant que Kestrel accepte les requêtes.</p>

<h3>Démarrage et arrêt de l'hôte</h3>
<p>L'application tourne dans un <strong>hôte générique</strong> qui gère le cycle de vie. Au démarrage, il construit le conteneur, lance les services hébergés, puis Kestrel. À l'arrêt (Ctrl+C, <code>docker stop</code>, redéploiement Kubernetes), il reçoit un signal, arrête d'accepter de nouvelles connexions, laisse les requêtes en cours se terminer pendant un délai (30 secondes par défaut, réglable avec <code>HostOptions.ShutdownTimeout</code>), puis appelle <code>StopAsync</code> sur les services hébergés. <code>IHostApplicationLifetime</code> expose les événements <code>ApplicationStarted</code>, <code>ApplicationStopping</code> et <code>ApplicationStopped</code>. C'est cet arrêt propre qui permet de redéployer sans couper les commandes en cours de validation, à condition que ton code respecte les <code>CancellationToken</code>.</p>

<h3>Les erreurs fréquentes du débutant</h3>
<ul>
<li><strong>Ajouter un service après <code>Build()</code></strong> : exception au démarrage, car le conteneur est figé.</li>
<li><strong>Appeler <code>app.Run(...)</code> avec un délégué au milieu du pipeline</strong> : tout ce qui suit est ignoré sans avertissement. Ne confonds pas ce middleware terminal avec <code>app.Run()</code> sans argument, qui démarre le serveur.</li>
<li><strong>Écrire dans la réponse puis appeler <code>next</code></strong> : le middleware suivant tente de modifier des en-têtes déjà envoyés, ce qui provoque une <code>InvalidOperationException</code> (« Headers are read-only »).</li>
<li><strong>Lire le corps de la requête dans un middleware</strong> sans <code>Request.EnableBuffering()</code> : le flux est consommé et le controller reçoit un corps vide.</li>
<li><strong>Mettre des secrets dans <code>launchSettings.json</code></strong> : ce fichier est versionné. Utilise <code>dotnet user-secrets</code> en développement.</li>
<li><strong>Oublier que l'environnement par défaut est Production</strong> : un déploiement sans variable n'affiche pas la page d'erreur détaillée. C'est voulu, mais surprenant la première fois.</li>
</ul>

<div class="note">Un senior sait lire un pipeline et diagnostiquer un problème d'ordre. Une erreur CORS apparaît alors que la politique est correcte ? <code>UseCors</code> est sûrement placé après <code>UseAuthorization</code>. Un 401 renvoyé sans body ProblemDetails ? L'exception handler ne couvre pas ce cas. Garde Program.cs court et lisible : regroupe les enregistrements dans des méthodes d'extension (<code>builder.Services.AddPersistence(config)</code>, <code>app.UseCorrelationId()</code>), et ne mets jamais de logique métier dans un middleware.</div>
`,
  examples: [
    {
      title: "Program.cs commenté",
      code: `var builder = WebApplication.CreateBuilder(args);

// ---- Phase 1 : enregistrement des services (conteneur DI) ----
builder.Services.AddControllers();
builder.Services.AddOpenApi();          // document OpenAPI (.NET 9+)
builder.Services.AddProblemDetails();   // format d'erreur standard

var app = builder.Build();              // plus aucun service après cette ligne

// ---- Phase 2 : pipeline middleware, dans l'ordre ----
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();                   // /openapi/v1.json en dev seulement
}
else
{
    app.UseExceptionHandler();          // ProblemDetails sur exception
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseAuthorization();

// ---- Endpoints ----
app.MapControllers();
app.MapGet("/ping", () => "pong");

app.Run();                              // démarre Kestrel et bloque`,
      explain: `Tout ce qui précède <code>Build()</code> configure, tout ce qui suit décrit le traitement d'une requête.`
    },
    {
      title: "Visualiser l'ordre et le court-circuit avec Use et Run",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Use(async (context, next) =>
{
    Console.WriteLine("1 - avant");
    await next(context);                // passe au middleware suivant
    Console.WriteLine("1 - après");     // exécuté quand la réponse remonte
});

app.Use(async (context, next) =>
{
    if (context.Request.Path == "/blocked")
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        await context.Response.WriteAsync("Accès refusé");
        return;                         // court-circuit : next n'est pas appelé
    }
    Console.WriteLine("2 - avant");
    await next(context);
    Console.WriteLine("2 - après");
});

app.Map("/health", health => health.Run(async ctx => await ctx.Response.WriteAsync("OK")));

app.Run(async context =>
{
    Console.WriteLine("3 - terminal");
    await context.Response.WriteAsync("Bonjour OrderFlow");
});

app.Run();

// GET /        -> 1 avant, 2 avant, 3 terminal, 2 après, 1 après
// GET /blocked -> 1 avant, 1 après (403)
// GET /health  -> 1 avant, 1 après ("OK"), le middleware 2 n'est pas traversé`,
      explain: `Lance l'application et appelle les trois URLs : la console montre l'aller-retour à travers les poupées russes.`
    },
    {
      title: "Middleware de corrélation et de chronométrage",
      code: `using System.Diagnostics;

namespace OrderFlow.Api.Middleware;

public sealed class CorrelationIdMiddleware(RequestDelegate next, ILogger<CorrelationIdMiddleware> logger)
{
    public const string HeaderName = "X-Correlation-Id";

    public async Task InvokeAsync(HttpContext context)
    {
        // Réutilise l'identifiant du client s'il existe, sinon en crée un
        var correlationId = context.Request.Headers.TryGetValue(HeaderName, out var value)
            && !string.IsNullOrWhiteSpace(value)
                ? value.ToString()
                : Guid.NewGuid().ToString("N");

        context.Items[HeaderName] = correlationId;

        // Les en-têtes doivent être posés avant l'envoi du corps
        context.Response.OnStarting(() =>
        {
            context.Response.Headers[HeaderName] = correlationId;
            return Task.CompletedTask;
        });

        var stopwatch = Stopwatch.StartNew();

        // Toutes les lignes de log de la requête porteront le CorrelationId
        using (logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = correlationId }))
        {
            await next(context);
            stopwatch.Stop();
            logger.LogInformation("{Method} {Path} -> {StatusCode} en {ElapsedMs} ms",
                context.Request.Method, context.Request.Path,
                context.Response.StatusCode, stopwatch.ElapsedMilliseconds);
        }
    }
}

public static class CorrelationIdMiddlewareExtensions
{
    public static IApplicationBuilder UseCorrelationId(this IApplicationBuilder app)
        => app.UseMiddleware<CorrelationIdMiddleware>();
}

// Program.cs : app.UseCorrelationId(); juste après UseExceptionHandler`,
      explain: `Le constructeur principal (C# 12+) reçoit <code>next</code> et le logger, qui sont des singletons. Le front Angular peut envoyer son propre <code>X-Correlation-Id</code> pour suivre un appel de bout en bout.`
    },
    {
      title: "Middleware qui a besoin d'un service scoped",
      code: `namespace OrderFlow.Api.Middleware;

// Exemple : marquer la dernière activité d'un client authentifié
public sealed class LastSeenMiddleware(RequestDelegate next)
{
    // Le DbContext (scoped) est injecté ici, à chaque requête,
    // et surtout pas dans le constructeur (le middleware vit toute l'application)
    public async Task InvokeAsync(HttpContext context, OrderFlowDbContext db)
    {
        await next(context);

        if (context.User.Identity?.IsAuthenticated == true
            && int.TryParse(context.User.FindFirst("customer_id")?.Value, out var customerId))
        {
            await db.Customers
                .Where(c => c.Id == customerId)
                .ExecuteUpdateAsync(s => s.SetProperty(c => c.LastSeenAt, DateTime.UtcNow),
                                    context.RequestAborted);
        }
    }
}`,
      explain: `ASP.NET Core résout les paramètres supplémentaires d'<code>InvokeAsync</code> depuis le scope de la requête : c'est la façon correcte d'utiliser un service scoped dans un middleware.`
    },
    {
      title: "launchSettings.json et appsettings par environnement",
      code: `{
  "profiles": {
    "https": {
      "commandName": "Project",
      "launchBrowser": false,
      "applicationUrl": "https://localhost:5001;http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "staging-local": {
      "commandName": "Project",
      "applicationUrl": "http://localhost:5100",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Staging"
      }
    }
  }
}`,
      explain: `<code>dotnet run --launch-profile staging-local</code> démarre avec l'environnement Staging et charge <code>appsettings.Staging.json</code> par-dessus <code>appsettings.json</code>.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Middleware d'en-tête de version",
      prompt: `<p>Ajoute, avec <code>app.Use</code>, un middleware qui pose l'en-tête <code>X-Api-Version: 1.0</code> sur toutes les réponses. Vérifie avec <code>curl -i</code>.</p>`,
      hint: `<p>Pose l'en-tête avant d'appeler <code>next</code>, ou utilise <code>Response.OnStarting</code>.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Use(async (context, next) =>
{
    // Avant next : le corps n'a pas encore été envoyé, on peut poser l'en-tête
    context.Response.Headers["X-Api-Version"] = "1.0";
    await next(context);
});

app.MapGet("/ping", () => "pong");
app.Run();

// curl -i http://localhost:5000/ping
// HTTP/1.1 200 OK
// X-Api-Version: 1.0`
    },
    {
      level: "moyen",
      title: "Mode maintenance qui court-circuite",
      prompt: `<p>Écris une classe <code>MaintenanceMiddleware</code> qui lit le booléen <code>Maintenance:Enabled</code> dans la configuration. S'il vaut <code>true</code>, toutes les requêtes reçoivent <code>503 Service Unavailable</code> avec un en-tête <code>Retry-After: 120</code> et un corps ProblemDetails, sauf <code>/health</code> qui doit continuer à répondre. Fournis la méthode d'extension et sa place dans Program.cs.</p>`,
      hint: `<p>Injecte <code>IConfiguration</code> dans <code>InvokeAsync</code> (ou dans le constructeur, c'est un singleton) et relis la valeur à chaque requête pour pouvoir activer la maintenance sans redémarrer. <code>Results.Problem(...).ExecuteAsync(context)</code> écrit une ProblemDetails.</p>`,
      solution: `namespace OrderFlow.Api.Middleware;

public sealed class MaintenanceMiddleware(RequestDelegate next, IConfiguration configuration)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var enabled = configuration.GetValue<bool>("Maintenance:Enabled");

        if (enabled && !context.Request.Path.StartsWithSegments("/health"))
        {
            context.Response.Headers.RetryAfter = "120";
            await Results.Problem(
                title: "Maintenance en cours",
                detail: "L'API est temporairement indisponible. Réessayez dans 2 minutes.",
                statusCode: StatusCodes.Status503ServiceUnavailable)
                .ExecuteAsync(context);
            return; // court-circuit
        }

        await next(context);
    }
}

public static class MaintenanceMiddlewareExtensions
{
    public static IApplicationBuilder UseMaintenanceMode(this IApplicationBuilder app)
        => app.UseMiddleware<MaintenanceMiddleware>();
}

// Program.cs
// app.UseExceptionHandler();
// app.UseMaintenanceMode();      // tôt, pour bloquer avant tout traitement coûteux
// app.UseHttpsRedirection();
// ...
// app.MapGet("/health", () => Results.Ok("OK"));

// appsettings.json : { "Maintenance": { "Enabled": false } }
// IConfiguration relit appsettings.json modifié à chaud (reloadOnChange par défaut).`
    },
    {
      level: "difficile",
      title: "Journaliser les requêtes lentes avec l'endpoint choisi",
      prompt: `<p>Écris un middleware <code>SlowRequestMiddleware</code> qui chronomètre chaque requête et écrit un log <code>Warning</code> si elle dépasse un seuil configurable (<code>Diagnostics:SlowRequestMs</code>, 500 par défaut). Le log doit contenir le nom de l'endpoint exécuté (son <code>DisplayName</code>), le code de statut et le CorrelationId placé dans <code>HttpContext.Items</code> par le middleware du cours. Indique où le placer dans le pipeline et pourquoi.</p>`,
      hint: `<p><code>context.GetEndpoint()</code> renvoie l'endpoint choisi par le routage. Il n'est connu qu'après <code>UseRouting</code>, mais comme tu le lis après <code>await next</code>, il est déjà renseigné. Lis le seuil une fois avec <code>IOptions</code> ou <code>IConfiguration</code>.</p>`,
      solution: `using System.Diagnostics;

namespace OrderFlow.Api.Middleware;

public sealed class SlowRequestMiddleware(
    RequestDelegate next,
    IConfiguration configuration,
    ILogger<SlowRequestMiddleware> logger)
{
    private readonly long _thresholdMs = configuration.GetValue("Diagnostics:SlowRequestMs", 500L);

    public async Task InvokeAsync(HttpContext context)
    {
        var start = Stopwatch.GetTimestamp();
        try
        {
            await next(context);
        }
        finally
        {
            // finally : on mesure aussi les requêtes qui lèvent une exception
            var elapsed = Stopwatch.GetElapsedTime(start);
            if (elapsed.TotalMilliseconds > _thresholdMs)
            {
                var endpoint = context.GetEndpoint()?.DisplayName ?? "(aucun endpoint)";
                var correlationId = context.Items[CorrelationIdMiddleware.HeaderName] as string ?? "-";

                logger.LogWarning(
                    "Requête lente {Method} {Path} [{Endpoint}] -> {StatusCode} en {ElapsedMs:F0} ms (seuil {ThresholdMs} ms, corrélation {CorrelationId})",
                    context.Request.Method, context.Request.Path, endpoint,
                    context.Response.StatusCode, elapsed.TotalMilliseconds, _thresholdMs, correlationId);
            }
        }
    }
}

// Program.cs
// app.UseExceptionHandler();
// app.UseCorrelationId();                       // pose l'identifiant dans Items
// app.UseMiddleware<SlowRequestMiddleware>();    // après : lit l'identifiant
// app.UseHttpsRedirection();
// app.UseAuthentication();
// app.UseAuthorization();
// app.MapControllers();
//
// Placé tôt, il mesure presque toute la durée de la requête (auth comprise).
// GetEndpoint() est lu après next : le routage (ajouté automatiquement par
// WebApplication au début du pipeline) a déjà sélectionné l'endpoint.`
    }
  ],
  project: `<p><strong>Créer OrderFlow.Api.</strong> Dans la solution, crée le projet avec <code>dotnet new webapi -n OrderFlow.Api --use-controllers</code>, référence le projet qui contient <code>OrderFlowDbContext</code>, puis enregistre le contexte avec la chaîne de connexion SQL Server de <code>appsettings.Development.json</code>. Ajoute le <code>CorrelationIdMiddleware</code> du cours avec sa méthode d'extension, place-le juste après <code>UseExceptionHandler</code>, et vérifie dans les logs et avec <code>curl -i</code> que l'en-tête <code>X-Correlation-Id</code> revient bien. Termine en ajoutant <code>GET /health</code>.</p>`,
  resources: [
    { label: "Middleware ASP.NET Core (ordre et écriture)", url: "https://learn.microsoft.com/aspnet/core/fundamentals/middleware/" },
    { label: "Écrire un middleware personnalisé", url: "https://learn.microsoft.com/aspnet/core/fundamentals/middleware/write" },
    { label: "Utiliser plusieurs environnements", url: "https://learn.microsoft.com/aspnet/core/fundamentals/environments" },
    { label: "Serveur web Kestrel", url: "https://learn.microsoft.com/aspnet/core/fundamentals/servers/kestrel" }
  ]
});

/* ============================================================
   Jour 40 : Controllers en détail
   ============================================================ */
window.COURSE.push({
  key: "w-controllers",
  title: "Controllers en détail",
  summary: "Construire des endpoints avec ControllerBase : routing par attributs, model binding, types de retour et un OrdersController branché sur EF Core.",
  objectives: [
    "Expliquer ce qu'active l'attribut [ApiController]",
    "Définir des routes par attributs avec paramètres et contraintes",
    "Choisir le bon type de retour (ActionResult<T>, CreatedAtAction, NoContent…)",
    "Maîtriser les sources de binding ([FromRoute], [FromQuery], [FromBody]…)",
    "Écrire un controller mince qui délègue à un service et propage le CancellationToken"
  ],
  lesson: `
<h3>ControllerBase et [ApiController]</h3>
<p>Un controller d'API est une classe qui hérite de <code>ControllerBase</code> (et non de <code>Controller</code>, qui ajoute le support des vues MVC dont une API n'a pas besoin). Chaque méthode publique qui correspond à une route est une <strong>action</strong>. On active les controllers avec <code>builder.Services.AddControllers()</code> et <code>app.MapControllers()</code>.</p>
<p>L'attribut <code>[ApiController]</code> change plusieurs comportements, et il faut les connaître :</p>
<ul>
<li><strong>Validation automatique</strong> : si le modèle est invalide (DataAnnotations), l'action n'est même pas exécutée et le framework renvoie un 400 avec une <code>ValidationProblemDetails</code>. Plus besoin d'écrire <code>if (!ModelState.IsValid)</code>.</li>
<li><strong>Inférence des sources de binding</strong> : un type complexe vient du corps, un paramètre présent dans le modèle de route vient de la route, les types simples viennent de la query string, et les services enregistrés sont injectés.</li>
<li><strong>Routage par attributs obligatoire</strong> : les routes conventionnelles ne s'appliquent pas.</li>
<li><strong>ProblemDetails pour les erreurs</strong> : un <code>return NotFound()</code> produit un corps standard <code>application/problem+json</code>.</li>
</ul>
<p>Pour éviter de répéter l'attribut, tu peux l'appliquer à tout l'assembly avec <code>[assembly: ApiController]</code>, ou créer une classe de base <code>ApiControllerBase</code>.</p>

<h3>Le routage par attributs</h3>
<p><code>[Route("api/[controller]")]</code> sur la classe définit le préfixe : <code>[controller]</code> est remplacé par le nom de la classe sans le suffixe Controller (<code>OrdersController</code> donne <code>api/Orders</code>, et les routes ne sont pas sensibles à la casse). Sur chaque action, <code>[HttpGet]</code>, <code>[HttpPost]</code>, <code>[HttpPut]</code>, <code>[HttpPatch]</code> et <code>[HttpDelete]</code> indiquent le verbe et complètent la route : <code>[HttpGet("{id:int}")]</code> donne <code>GET api/orders/5</code>.</p>
<p>Les <strong>contraintes de route</strong> (<code>{id:int}</code>, <code>{id:guid}</code>, <code>{code:length(3)}</code>, <code>{page:min(1)}</code>) servent à choisir entre deux routes qui se ressemblent, par exemple <code>orders/5</code> et <code>orders/pending</code>. Elles ne servent pas à valider : une contrainte non respectée donne un 404 et non un 400. Pour <code>orders/abc</code>, mieux vaut un 404 qu'une erreur de conversion, mais la validation métier, elle, se fait ailleurs. Un nom de route (<code>[HttpGet("{id:int}", Name = "GetOrderById")]</code>) permet de générer des liens.</p>

<h3>Les types de retour</h3>
<table>
<thead><tr><th>Type</th><th>Usage</th></tr></thead>
<tbody>
<tr><td><code>ActionResult&lt;T&gt;</code></td><td>Le choix par défaut : renvoie un <code>T</code> (200) ou un résultat comme <code>NotFound()</code>. Le type <code>T</code> apparaît dans OpenAPI.</td></tr>
<tr><td><code>IActionResult</code></td><td>Plusieurs résultats possibles sans type de corps unique (souvent pour 204/404).</td></tr>
<tr><td><code>Ok(value)</code></td><td>200 avec corps.</td></tr>
<tr><td><code>CreatedAtAction(nameof(GetById), new { id }, value)</code></td><td>201 + en-tête <code>Location</code> calculé à partir de l'action de lecture.</td></tr>
<tr><td><code>NoContent()</code></td><td>204, après un DELETE ou un PUT.</td></tr>
<tr><td><code>NotFound()</code>, <code>Conflict()</code>, <code>BadRequest()</code></td><td>404, 409, 400 avec ProblemDetails.</td></tr>
<tr><td><code>Problem(title, detail, statusCode)</code></td><td>N'importe quelle erreur au format ProblemDetails.</td></tr>
<tr><td><code>ValidationProblem(ModelState)</code></td><td>400 avec le détail des erreurs par champ.</td></tr>
</tbody>
</table>
<p>Avec <code>ActionResult&lt;OrderResponse&gt;</code>, écrire <code>return order;</code> fonctionne grâce à une conversion implicite qui produit un 200. Les attributs <code>[ProducesResponseType(StatusCodes.Status404NotFound)]</code> documentent les autres codes pour OpenAPI.</p>

<h3>Le model binding en détail</h3>
<table>
<thead><tr><th>Attribut</th><th>Source</th><th>Exemple</th></tr></thead>
<tbody>
<tr><td><code>[FromRoute]</code></td><td>Segment de l'URL</td><td><code>orders/{id}</code></td></tr>
<tr><td><code>[FromQuery]</code></td><td>Query string</td><td><code>?status=Pending&amp;page=2</code></td></tr>
<tr><td><code>[FromBody]</code></td><td>Corps JSON (un seul par action)</td><td><code>CreateOrderRequest</code></td></tr>
<tr><td><code>[FromHeader(Name = "X-Correlation-Id")]</code></td><td>En-tête</td><td>Corrélation, idempotency key</td></tr>
<tr><td><code>[FromForm]</code></td><td>Formulaire multipart</td><td>Upload de fichier (<code>IFormFile</code>)</td></tr>
<tr><td><code>[FromServices]</code></td><td>Conteneur DI</td><td>Un service utilisé par une seule action</td></tr>
<tr><td><code>[AsParameters]</code> / objet complexe <code>[FromQuery]</code></td><td>Regroupe plusieurs paramètres dans un objet</td><td><code>OrderQuery</code> avec filtre, tri et page</td></tr>
</tbody>
</table>
<p>Les pièges courants : il ne peut y avoir qu'un seul <code>[FromBody]</code> par action. Un type complexe passé en GET sans <code>[FromQuery]</code> est lu depuis le corps, que les GET n'ont pas, d'où des valeurs nulles. Les noms de la query string doivent correspondre aux propriétés, sans tenir compte de la casse. Et la désérialisation JSON utilise <code>System.Text.Json</code> en camelCase par défaut, ce qui convient très bien à Angular.</p>

<h3>CancellationToken et async partout</h3>
<p>Ajoute un paramètre <code>CancellationToken cancellationToken</code> à chaque action asynchrone : ASP.NET Core le lie automatiquement à <code>HttpContext.RequestAborted</code>. Passe-le à EF Core (<code>ToListAsync(cancellationToken)</code>) et aux appels HTTP. Si l'utilisateur ferme l'onglet Angular pendant une recherche lourde, la requête SQL est annulée au lieu de consommer la base pour rien. Toutes les actions qui font de l'I/O sont <code>async Task&lt;...&gt;</code>. Ne bloque jamais avec <code>.Result</code> ou <code>.Wait()</code>, qui épuisent le pool de threads sous charge.</p>

<h3>Un controller mince</h3>
<p>Le rôle d'un controller est de traduire HTTP en appels applicatifs : lire les entrées, appeler un service et traduire le résultat en code de statut. Il ne contient pas de règles métier ni de requêtes EF complexes. Une règle pratique : si une action dépasse une quinzaine de lignes, une partie de son code appartient à un service. On commence parfois avec le <code>DbContext</code> directement dans le controller pour un CRUD simple. C'est acceptable, et c'est ce que montre l'exemple de lecture ci-dessous. Dès qu'apparaît une règle métier, comme annuler une commande seulement si elle n'est pas expédiée, cette règle part dans un service.</p>

<h3>La sérialisation JSON</h3>
<p>Les objets renvoyés sont sérialisés par <code>System.Text.Json</code>. Les réglages par défaut d'ASP.NET Core sont adaptés au web : noms en camelCase (<code>CustomerId</code> devient <code>customerId</code>), lecture insensible à la casse, nombres acceptés depuis des chaînes. On les ajuste globalement avec <code>AddControllers().AddJsonOptions(o =&gt; ...)</code>. Les deux réglages les plus courants : <code>o.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter())</code> pour sérialiser <code>OrderStatus.Pending</code> en <code>"Pending"</code> plutôt qu'en <code>0</code> (beaucoup plus lisible côté Angular et stable si l'ordre de l'énumération change), et <code>DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull</code> pour omettre les champs nuls. Les dates <code>DateTime</code> sortent au format ISO 8601 : stocke-les en UTC et laisse le front les convertir dans le fuseau de l'utilisateur. Pour un montant, <code>decimal</code> est sérialisé sans perte de précision, contrairement à <code>double</code>.</p>

<h3>Les filtres MVC</h3>
<p>Les controllers disposent d'un système de <strong>filtres</strong> qui s'exécutent autour des actions, à l'intérieur du pipeline MVC. Les plus utiles pour une API sont :</p>
<ul>
<li><strong>Action filters</strong> (<code>IAsyncActionFilter</code>) : avant et après l'action, avec accès aux arguments liés et au résultat. Exemple : vérifier qu'un en-tête obligatoire est présent.</li>
<li><strong>Exception filters</strong> (<code>IExceptionFilter</code>) : interceptent les exceptions levées par l'action. On leur préfère aujourd'hui un <code>IExceptionHandler</code> global, qui couvre aussi les Minimal APIs (jour 43).</li>
<li><strong>Result filters</strong> : autour de l'exécution du résultat, par exemple pour ajouter un en-tête.</li>
<li><strong>Authorization filters</strong> : c'est le mécanisme qui fait fonctionner <code>[Authorize]</code>.</li>
</ul>
<p>Un filtre s'applique par attribut sur une action ou un controller (<code>[ServiceFilter(typeof(AuditFilter))]</code> pour un filtre qui a des dépendances), ou globalement avec <code>AddControllers(o =&gt; o.Filters.Add&lt;AuditFilter&gt;())</code>. La différence avec un middleware : le filtre connaît l'action choisie et ses arguments, mais ne s'applique qu'aux controllers.</p>

<h3>Les pièges fréquents</h3>
<ul>
<li><strong>Méthodes publiques non voulues</strong> : toute méthode publique d'un controller peut devenir une action. Marque les méthodes utilitaires <code>private</code>, ou <code>[NonAction]</code>.</li>
<li><strong>Routes ambiguës</strong> : deux actions qui correspondent à la même URL et au même verbe provoquent une <code>AmbiguousMatchException</code> à l'exécution. Les contraintes de route et des chemins littéraux distincts règlent le problème.</li>
<li><strong>Le suffixe Async</strong> : par défaut, MVC retire le suffixe <code>Async</code> des noms d'action. <code>nameof(GetByIdAsync)</code> dans <code>CreatedAtAction</code> ne trouve alors plus l'action, d'où une erreur « No route matches the supplied values ». Nomme les actions sans suffixe, ou désactive l'option <code>SuppressAsyncSuffixInActionNames</code>.</li>
<li><strong>Le <code>DbContext</code> stocké dans un champ statique</strong> ou partagé entre requêtes : un controller est recréé à chaque requête, ses dépendances scoped aussi. Ne contourne jamais ce cycle de vie.</li>
<li><strong>Renvoyer <code>null</code></strong> depuis une action <code>ActionResult&lt;T&gt;</code> produit un 204 et non un 404. Sois explicite avec <code>NotFound()</code>.</li>
</ul>

<div class="note">En revue de code, un senior vérifie : chaque action renvoie le bon code (201 avec Location pour une création, 204 pour une suppression), le <code>CancellationToken</code> est propagé jusqu'à la base, aucune entité EF n'est renvoyée directement, les erreurs prévisibles (404, 409) sont des résultats explicites et non des exceptions, et les <code>[ProducesResponseType]</code> rendent le contrat lisible dans OpenAPI pour l'équipe Angular. Un controller qui injecte huit services est un signal : il fait trop de choses et doit être découpé.</div>
`,
  examples: [
    {
      title: "ProductsController : lecture directe avec EF Core",
      code: `using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace OrderFlow.Api.Controllers;

public sealed record ProductResponse(int Id, string Name, decimal Price, int Stock);

[ApiController]
[Route("api/[controller]")]
public sealed class ProductsController(OrderFlowDbContext db) : ControllerBase
{
    // GET api/products?category=books
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductResponse>>> GetAll(
        [FromQuery] string? category,
        CancellationToken cancellationToken)
    {
        var query = db.Products.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        var products = await query
            .OrderBy(p => p.Name)
            .Select(p => new ProductResponse(p.Id, p.Name, p.Price, p.Stock)) // projection SQL
            .ToListAsync(cancellationToken);

        return products;   // conversion implicite en 200 OK
    }

    // GET api/products/7
    [HttpGet("{id:int}")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var product = await db.Products.AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductResponse(p.Id, p.Name, p.Price, p.Stock))
            .FirstOrDefaultAsync(cancellationToken);

        return product is null ? NotFound() : product;
    }
}`,
      explain: `<code>AsNoTracking</code> et la projection <code>Select</code> font que seules les colonnes utiles sont lues, sans suivi des modifications : c'est le bon réflexe pour une lecture.`
    },
    {
      title: "Le service applicatif des commandes",
      code: `using Microsoft.EntityFrameworkCore;

namespace OrderFlow.Api.Orders;

public sealed record CreateOrderLine(int ProductId, int Quantity);
public sealed record CreateOrderRequest(int CustomerId, IReadOnlyList<CreateOrderLine> Lines);
public sealed record OrderLineResponse(int ProductId, string ProductName, int Quantity, decimal UnitPrice);
public sealed record OrderResponse(int Id, int CustomerId, string Status, decimal Total, IReadOnlyList<OrderLineResponse> Lines);

public enum CancelOutcome { Cancelled, NotFound, AlreadyShipped }

public sealed class OrderService(OrderFlowDbContext db)
{
    public Task<OrderResponse?> GetAsync(int id, CancellationToken ct) =>
        db.Orders.AsNoTracking()
            .Where(o => o.Id == id)
            .Select(o => new OrderResponse(o.Id, o.CustomerId, o.Status.ToString(),
                o.Lines.Sum(l => l.Quantity * l.UnitPrice),
                o.Lines.Select(l => new OrderLineResponse(l.ProductId, l.Product.Name, l.Quantity, l.UnitPrice)).ToList()))
            .FirstOrDefaultAsync(ct);

    public async Task<int> CreateAsync(CreateOrderRequest request, CancellationToken ct)
    {
        var productIds = request.Lines.Select(l => l.ProductId).ToList();
        var prices = await db.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Price, ct);

        var order = new Order { CustomerId = request.CustomerId, Status = OrderStatus.Pending };
        foreach (var line in request.Lines)
            order.Lines.Add(new OrderLine { ProductId = line.ProductId, Quantity = line.Quantity, UnitPrice = prices[line.ProductId] });

        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);
        return order.Id;
    }

    public async Task<CancelOutcome> CancelAsync(int id, CancellationToken ct)
    {
        var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);
        if (order is null) return CancelOutcome.NotFound;
        if (order.Status is OrderStatus.Shipped or OrderStatus.Delivered) return CancelOutcome.AlreadyShipped;

        order.Status = OrderStatus.Cancelled;
        await db.SaveChangesAsync(ct);
        return CancelOutcome.Cancelled;
    }
}

// Program.cs : builder.Services.AddScoped<OrderService>();`,
      explain: `La règle « on n'annule pas une commande expédiée » vit dans le service, pas dans le controller. Le service ne connaît rien de HTTP. La vérification que tous les produits existent sera ajoutée avec la validation, au jour 42.`
    },
    {
      title: "OrdersController mince",
      code: `using Microsoft.AspNetCore.Mvc;
using OrderFlow.Api.Orders;

namespace OrderFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class OrdersController(OrderService orders) : ControllerBase
{
    [HttpGet("{id:int}", Name = "GetOrderById")]
    [ProducesResponseType<OrderResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var order = await orders.GetAsync(id, cancellationToken);
        return order is null ? NotFound() : order;
    }

    [HttpPost]
    [ProducesResponseType<OrderResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<OrderResponse>> Create(CreateOrderRequest request, CancellationToken cancellationToken)
    {
        var id = await orders.CreateAsync(request, cancellationToken);
        var created = await orders.GetAsync(id, cancellationToken);
        // 201 + Location: /api/orders/{id}
        return CreatedAtAction(nameof(GetById), new { id }, created);
    }

    [HttpPost("{id:int}/cancel")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Cancel(int id, CancellationToken cancellationToken)
    {
        var outcome = await orders.CancelAsync(id, cancellationToken);
        return outcome switch
        {
            CancelOutcome.Cancelled => NoContent(),
            CancelOutcome.NotFound => NotFound(),
            CancelOutcome.AlreadyShipped => Problem(
                title: "Commande déjà expédiée",
                detail: $"La commande {id} ne peut plus être annulée.",
                statusCode: StatusCodes.Status409Conflict),
            _ => throw new InvalidOperationException()
        };
    }
}`,
      explain: `Chaque action fait trois choses : lire les entrées, appeler le service et traduire le résultat en code HTTP. Le <code>switch</code> sur l'énumération rend la traduction explicite et lisible.`
    },
    {
      title: "Binding : objet de requête, en-tête et contraintes",
      code: `using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

namespace OrderFlow.Api.Controllers;

public sealed class OrderQuery
{
    public string? Status { get; init; }
    public int? CustomerId { get; init; }
    [Range(1, int.MaxValue)] public int Page { get; init; } = 1;
    [Range(1, 100)] public int PageSize { get; init; } = 20;
}

[ApiController]
[Route("api/customers/{customerId:int}/orders")]
public sealed class CustomerOrdersController : ControllerBase
{
    // GET api/customers/42/orders?status=Pending&page=2
    [HttpGet]
    public IActionResult List(
        [FromRoute] int customerId,
        [FromQuery] OrderQuery query,                                  // plusieurs paramètres regroupés
        [FromHeader(Name = "X-Correlation-Id")] string? correlationId)  // en-tête optionnel
    {
        // [ApiController] a déjà renvoyé 400 si PageSize > 100
        return Ok(new { customerId, query.Status, query.Page, query.PageSize, correlationId });
    }

    // GET api/customers/42/orders/latest   (route littérale)
    [HttpGet("latest")]
    public IActionResult Latest(int customerId) => Ok(new { customerId, latest = true });

    // GET api/customers/42/orders/1001     (seulement si l'id est un entier)
    [HttpGet("{orderId:int}")]
    public IActionResult Get(int customerId, int orderId) => Ok(new { customerId, orderId });
}`,
      explain: `Sans <code>[FromQuery]</code>, l'objet <code>OrderQuery</code> serait cherché dans le corps de la requête GET et resterait vide. La contrainte <code>:int</code> sépare clairement <code>latest</code> d'un identifiant.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "DELETE et PUT pour les produits",
      prompt: `<p>Ajoute à <code>ProductsController</code> une action <code>DELETE api/products/{id}</code> qui renvoie 204, ou 404 si le produit n'existe pas, ainsi qu'une action <code>PUT api/products/{id}</code> qui remplace le nom, le prix et le stock à partir d'un record <code>UpdateProductRequest</code>.</p>`,
      hint: `<p>Pour le DELETE, <code>ExecuteDeleteAsync</code> renvoie le nombre de lignes supprimées. Pour le PUT, charge l'entité, modifie-la, puis appelle <code>SaveChangesAsync</code>.</p>`,
      solution: `public sealed record UpdateProductRequest(string Name, decimal Price, int Stock);

// Dans ProductsController(OrderFlowDbContext db)

[HttpDelete("{id:int}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
{
    var deleted = await db.Products
        .Where(p => p.Id == id)
        .ExecuteDeleteAsync(cancellationToken);   // une seule requête DELETE, sans chargement

    return deleted == 0 ? NotFound() : NoContent();
}

[HttpPut("{id:int}")]
[ProducesResponseType(StatusCodes.Status204NoContent)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<IActionResult> Update(int id, UpdateProductRequest request, CancellationToken cancellationToken)
{
    var product = await db.Products.FindAsync([id], cancellationToken);
    if (product is null) return NotFound();

    // PUT = remplacement complet des champs modifiables
    product.Name = request.Name;
    product.Price = request.Price;
    product.Stock = request.Stock;

    await db.SaveChangesAsync(cancellationToken);
    return NoContent();
}`
    },
    {
      level: "moyen",
      title: "Clé d'idempotence sur la création de commande",
      prompt: `<p>Un client Angular qui renvoie un POST après un timeout crée des commandes en double. Modifie l'action <code>Create</code> pour accepter un en-tête obligatoire <code>Idempotency-Key</code>. Si une commande a déjà été créée avec cette clé, renvoie un 200 avec la commande existante au lieu d'en créer une nouvelle. Si l'en-tête manque, renvoie un 400. Ajoute une colonne <code>IdempotencyKey</code> (unique) à <code>Order</code>.</p>`,
      hint: `<p>Utilise <code>[FromHeader(Name = "Idempotency-Key")]</code>. Ajoute un index unique côté EF (<code>HasIndex(...).IsUnique()</code>) pour que la base protège aussi contre deux requêtes simultanées.</p>`,
      solution: `// Entité : public string? IdempotencyKey { get; set; }
// Configuration EF : builder.HasIndex(o => o.IdempotencyKey).IsUnique().HasFilter("[IdempotencyKey] IS NOT NULL");

// OrderService
public async Task<int?> FindByIdempotencyKeyAsync(string key, CancellationToken ct) =>
    await db.Orders.Where(o => o.IdempotencyKey == key)
        .Select(o => (int?)o.Id)
        .FirstOrDefaultAsync(ct);

public async Task<int> CreateAsync(CreateOrderRequest request, string idempotencyKey, CancellationToken ct)
{
    var productIds = request.Lines.Select(l => l.ProductId).ToList();
    var prices = await db.Products
        .Where(p => productIds.Contains(p.Id))
        .ToDictionaryAsync(p => p.Id, p => p.Price, ct);

    var order = new Order
    {
        CustomerId = request.CustomerId,
        Status = OrderStatus.Pending,
        IdempotencyKey = idempotencyKey     // seule différence avec la version du cours
    };
    foreach (var line in request.Lines)
        order.Lines.Add(new OrderLine { ProductId = line.ProductId, Quantity = line.Quantity, UnitPrice = prices[line.ProductId] });

    db.Orders.Add(order);
    await db.SaveChangesAsync(ct);
    return order.Id;
}

// OrdersController
[HttpPost]
[ProducesResponseType<OrderResponse>(StatusCodes.Status201Created)]
[ProducesResponseType<OrderResponse>(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<ActionResult<OrderResponse>> Create(
    CreateOrderRequest request,
    [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
    CancellationToken cancellationToken)
{
    if (string.IsNullOrWhiteSpace(idempotencyKey))
        return Problem(title: "En-tête Idempotency-Key manquant",
                       statusCode: StatusCodes.Status400BadRequest);

    // Requête rejouée : on renvoie la commande déjà créée
    var existingId = await orders.FindByIdempotencyKeyAsync(idempotencyKey, cancellationToken);
    if (existingId is int id)
        return Ok(await orders.GetAsync(id, cancellationToken));

    var newId = await orders.CreateAsync(request, idempotencyKey, cancellationToken);
    return CreatedAtAction(nameof(GetById), new { id = newId }, await orders.GetAsync(newId, cancellationToken));
}

// Cas de course : deux requêtes identiques simultanées passent toutes les deux
// la vérification ; l'index unique fait échouer la seconde (DbUpdateException).
// On peut l'attraper dans le service et relire la commande existante.`
    },
    {
      level: "difficile",
      title: "Classe de base et conventions communes",
      prompt: `<p>Tous tes controllers répètent <code>[ApiController]</code>, <code>[Route("api/[controller]")]</code>, <code>[Produces("application/json")]</code> et le même <code>switch</code> pour transformer un résultat métier en code HTTP. Crée une classe abstraite <code>ApiControllerBase</code> qui porte ces attributs et une méthode protégée <code>FromResult</code>. Elle doit transformer un <code>OperationResult&lt;T&gt;</code> (succès avec valeur, NotFound, Conflict avec message, Invalid avec message) en <code>ActionResult&lt;T&gt;</code>. Réécris l'action <code>Cancel</code> avec ce mécanisme.</p>`,
      hint: `<p>Les attributs de route et <code>[ApiController]</code> placés sur une classe de base sont hérités. <code>OperationResult&lt;T&gt;</code> peut être un record avec un statut énuméré, une valeur et un message, ainsi que des méthodes de fabrique statiques.</p>`,
      solution: `using Microsoft.AspNetCore.Mvc;

namespace OrderFlow.Api.Common;

public enum OperationStatus { Ok, NotFound, Conflict, Invalid }

public sealed record OperationResult<T>(OperationStatus Status, T? Value = default, string? Message = null)
{
    public static OperationResult<T> Ok(T value) => new(OperationStatus.Ok, value);
    public static OperationResult<T> NotFound() => new(OperationStatus.NotFound);
    public static OperationResult<T> Conflict(string message) => new(OperationStatus.Conflict, Message: message);
    public static OperationResult<T> Invalid(string message) => new(OperationStatus.Invalid, Message: message);
}

// Valeur "vide" pour les opérations sans retour
public readonly record struct Unit;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public abstract class ApiControllerBase : ControllerBase
{
    protected ActionResult<T> FromResult<T>(OperationResult<T> result) => result.Status switch
    {
        OperationStatus.Ok when typeof(T) == typeof(Unit) => NoContent(),
        OperationStatus.Ok => Ok(result.Value),
        OperationStatus.NotFound => NotFound(),
        OperationStatus.Conflict => Problem(title: "Conflit", detail: result.Message, statusCode: StatusCodes.Status409Conflict),
        OperationStatus.Invalid => Problem(title: "Requête invalide", detail: result.Message, statusCode: StatusCodes.Status422UnprocessableEntity),
        _ => throw new ArgumentOutOfRangeException(nameof(result))
    };
}

// Service
public async Task<OperationResult<Unit>> CancelAsync(int id, CancellationToken ct)
{
    var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);
    if (order is null) return OperationResult<Unit>.NotFound();
    if (order.Status is OrderStatus.Shipped or OrderStatus.Delivered)
        return OperationResult<Unit>.Conflict($"La commande {id} est déjà expédiée.");

    order.Status = OrderStatus.Cancelled;
    await db.SaveChangesAsync(ct);
    return OperationResult<Unit>.Ok(new Unit());
}

// Controller : plus d'attributs répétés, plus de switch
public sealed class OrdersController(OrderService orders) : ApiControllerBase
{
    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<Unit>> Cancel(int id, CancellationToken cancellationToken)
        => FromResult(await orders.CancelAsync(id, cancellationToken));
}

// Ce Result pattern sera approfondi au jour consacré aux erreurs et à la résilience.`
    }
  ],
  project: `<p><strong>ProductsController et OrdersController.</strong> Implémente le CRUD complet des produits (GET liste, GET par id, POST, PUT, DELETE) et, pour les commandes, GET par id, POST (création avec ses lignes, réponse 201 et Location) et <code>POST {id}/cancel</code>, via un <code>OrderService</code>. Chaque action doit être asynchrone, propager le <code>CancellationToken</code> et documenter ses codes avec <code>[ProducesResponseType]</code>. Complète le fichier <code>OrderFlow.Api.http</code> du jour 37 et vérifie chaque code de statut prévu dans le contrat.</p>`,
  resources: [
    { label: "Créer des API web avec des controllers", url: "https://learn.microsoft.com/aspnet/core/web-api/" },
    { label: "Types de retour des actions", url: "https://learn.microsoft.com/aspnet/core/web-api/action-return-types" },
    { label: "Routage vers les actions des controllers", url: "https://learn.microsoft.com/aspnet/core/mvc/controllers/routing" },
    { label: "Model binding", url: "https://learn.microsoft.com/aspnet/core/mvc/models/model-binding" }
  ]
});

/* ============================================================
   Jour 41 : Minimal APIs
   ============================================================ */
window.COURSE.push({
  key: "w-minimal-apis",
  title: "Minimal APIs",
  summary: "Écrire des endpoints sans controllers : MapGet, TypedResults, groupes de routes, filtres et organisation du code pour une vraie application.",
  objectives: [
    "Déclarer des endpoints avec MapGet, MapPost, MapPut et MapDelete",
    "Comprendre le binding des paramètres d'un handler",
    "Utiliser TypedResults et Results<…> pour un contrat précis",
    "Organiser les endpoints en groupes et en fichiers d'extension",
    "Écrire un endpoint filter et choisir entre controllers et Minimal APIs"
  ],
  lesson: `
<h3>Le principe</h3>
<p>Les Minimal APIs associent directement une route à une fonction : <code>app.MapGet("/api/products/{id}", handler)</code>. Pas de classe, pas d'héritage, pas de convention de nommage. Le handler est une lambda ou une méthode, et ses paramètres sont résolus automatiquement. Cette approche est plus proche d'Express ou de Fastify, donc familière pour un développeur JavaScript. Elle est aussi plus légère à l'exécution et compatible avec la compilation Native AOT. Depuis .NET 7, avec les groupes, les filtres et <code>TypedResults</code>, les Minimal APIs couvrent les besoins d'une vraie application, et le modèle <code>dotnet new webapi</code> les utilise par défaut.</p>

<h3>Le binding des paramètres</h3>
<p>ASP.NET Core déduit la source de chaque paramètre du handler :</p>
<ul>
<li>un nom présent dans le modèle de route (<code>{id}</code>) vient de la <strong>route</strong> ;</li>
<li>un type simple (<code>int</code>, <code>string</code>, <code>DateOnly</code>…) absent de la route vient de la <strong>query string</strong> ;</li>
<li>un type enregistré dans le conteneur DI est <strong>injecté</strong> (<code>OrderFlowDbContext db</code>) ;</li>
<li>les types spéciaux <code>HttpContext</code>, <code>HttpRequest</code>, <code>CancellationToken</code>, <code>ClaimsPrincipal</code> sont fournis directement ;</li>
<li>un type complexe vient du <strong>corps JSON</strong> pour POST, PUT et PATCH.</li>
</ul>
<p>Tu peux forcer la source avec <code>[FromRoute]</code>, <code>[FromQuery]</code>, <code>[FromHeader]</code>, <code>[FromBody]</code> ou <code>[FromServices]</code>. Pour regrouper beaucoup de paramètres, <code>[AsParameters]</code> appliqué à un record ou à une classe répartit ses propriétés selon les mêmes règles. Un paramètre nullable (<code>string? status</code>) ou avec une valeur par défaut (<code>int page = 1</code>) est optionnel. Un paramètre requis absent provoque un 400. Piège : un type simple que le framework ne sait pas convertir depuis une chaîne doit exposer une méthode <code>TryParse</code>, sinon il est cherché dans le corps.</p>

<h3>Results, TypedResults et Results&lt;…&gt;</h3>
<p>Un handler peut renvoyer un objet (sérialisé en JSON avec un 200) ou un <code>IResult</code>. Deux fabriques existent :</p>
<ul>
<li><code>Results.Ok(x)</code>, <code>Results.NotFound()</code> renvoient le type général <code>IResult</code> : pratique, mais OpenAPI ne connaît ni le type du corps ni les codes possibles.</li>
<li><code>TypedResults.Ok(x)</code> renvoie <code>Ok&lt;T&gt;</code>, un type précis que les tests unitaires peuvent inspecter et qu'OpenAPI documente automatiquement.</li>
</ul>
<p>Quand un handler peut renvoyer plusieurs résultats, déclare le type union <code>Results&lt;Ok&lt;ProductResponse&gt;, NotFound&gt;</code>. Le compilateur vérifie que chaque <code>return</code> est l'un de ces types, et la documentation OpenAPI liste les deux réponses sans aucun attribut. C'est l'équivalent typé des <code>[ProducesResponseType]</code> des controllers. Préfère <code>TypedResults</code> partout.</p>

<h3>Les groupes de routes</h3>
<p><code>app.MapGroup("/api/products")</code> crée un groupe : tous les endpoints déclarés dessus héritent du préfixe et de la configuration du groupe. On peut ainsi appliquer d'un coup <code>.RequireAuthorization()</code>, <code>.WithTags("Products")</code>, un filtre ou une politique de rate limiting. Les groupes s'imbriquent : un groupe <code>/api</code> qui exige l'authentification, contenant un groupe <code>/products</code>.</p>

<h3>Organiser le code</h3>
<p>Tout écrire dans Program.cs devient vite illisible. La convention : un fichier par ressource, avec une méthode d'extension sur <code>IEndpointRouteBuilder</code> (<code>MapProductEndpoints</code>) qui déclare le groupe et ses routes, et des handlers sous forme de <strong>méthodes statiques privées</strong> plutôt que de longues lambdas. Les handlers nommés se lisent mieux, se testent unitairement et donnent des traces d'appel claires. Program.cs ne contient plus qu'un <code>app.MapProductEndpoints();</code> par ressource.</p>

<h3>Les endpoint filters</h3>
<p>Un <strong>endpoint filter</strong> s'exécute autour d'un handler, comme un middleware mais ciblé sur un endpoint ou un groupe. Il a accès aux arguments déjà liés (<code>context.Arguments</code>, ou <code>context.GetArgument&lt;T&gt;(index)</code>). On l'utilise pour la validation, le logging métier ou la vérification de propriété d'une ressource. Il peut court-circuiter en renvoyant un résultat sans appeler <code>next</code>. Il s'ajoute avec <code>.AddEndpointFilter&lt;T&gt;()</code> sur un endpoint ou un groupe. Une classe qui implémente <code>IEndpointFilter</code> peut recevoir des services par son constructeur, par exemple un validateur FluentValidation.</p>

<h3>La validation</h3>
<p>Historiquement, les Minimal APIs ne validaient pas automatiquement les DataAnnotations, contrairement à <code>[ApiController]</code>. .NET 10 ajoute une validation intégrée qu'on active avec <code>builder.Services.AddValidation()</code>, et qui renvoie automatiquement un 400 avec une ValidationProblemDetails sur les paramètres annotés. Comme cette fonctionnalité est récente, vérifie son comportement exact dans la documentation de ta version. La technique éprouvée, qui fonctionne sur toutes les versions et avec FluentValidation, reste un <strong>endpoint filter de validation</strong> générique : c'est celle de l'exemple et celle que l'on généralisera au jour 42.</p>

<h3>Les métadonnées</h3>
<p>Chaque endpoint peut être enrichi pour OpenAPI et le routage : <code>.WithName("GetProductById")</code> (nom unique, utilisé pour générer des liens avec <code>CreatedAtRoute</code>), <code>.WithSummary(...)</code> et <code>.WithDescription(...)</code>, <code>.WithTags(...)</code>, <code>.Produces&lt;T&gt;(201)</code> et <code>.ProducesProblem(409)</code> quand le type de retour ne suffit pas, ou encore <code>.RequireAuthorization("Admin")</code>.</p>

<h3>Controllers ou Minimal APIs ?</h3>
<table>
<thead><tr><th>Critère</th><th>Controllers</th><th>Minimal APIs</th></tr></thead>
<tbody>
<tr><td>Structure</td><td>Classes, conventions, attributs</td><td>Fonctions, organisation libre</td></tr>
<tr><td>Validation automatique</td><td>Oui avec [ApiController]</td><td>AddValidation (.NET 10) ou filtre</td></tr>
<tr><td>Filtres</td><td>Action, resource, exception, result filters</td><td>Endpoint filters (plus simples)</td></tr>
<tr><td>Performance et Native AOT</td><td>Bonne, AOT non supporté</td><td>Meilleure, compatible AOT</td></tr>
<tr><td>Documentation OpenAPI</td><td>Via [ProducesResponseType]</td><td>Automatique avec TypedResults</td></tr>
<tr><td>Code existant, équipe habituée à MVC</td><td>Idéal</td><td>Changement d'habitudes</td></tr>
<tr><td>Nouveau projet, microservice, vertical slices</td><td>Possible</td><td>Idéal</td></tr>
</tbody>
</table>
<p>Les deux coexistent dans la même application et partagent tout le reste : DI, middleware, authentification et OpenAPI. Le choix est une question de style et d'équipe, pas de capacité. Une fois choisi, sois cohérent dans un même projet.</p>

<h3>Configurer le JSON et les options globales</h3>
<p>Les Minimal APIs n'utilisent pas les options JSON de MVC : elles se configurent séparément, avec <code>builder.Services.ConfigureHttpJsonOptions(o =&gt; o.SerializerOptions.Converters.Add(new JsonStringEnumConverter()))</code>. C'est un piège fréquent dans une application qui mélange les deux styles : les énumérations sortent en texte côté controllers et en nombres côté Minimal APIs. Configure les deux de la même façon, idéalement dans une seule méthode d'extension. Pour la compilation Native AOT, la sérialisation doit passer par un <code>JsonSerializerContext</code> généré à la compilation (<code>[JsonSerializable(typeof(CustomerResponse))]</code>), ajouté avec <code>o.SerializerOptions.TypeInfoResolverChain.Insert(0, AppJsonContext.Default)</code>. Le modèle <code>dotnet new webapiaot</code> montre cette configuration. Sans AOT, c'est facultatif, mais cela accélère le démarrage et réduit les allocations.</p>

<h3>Tester un handler</h3>
<p>Un handler nommé qui renvoie un <code>TypedResults</code> se teste comme une simple méthode : on l'appelle avec ses arguments (un <code>DbContext</code> de test, un identifiant) et on inspecte le résultat. <code>Assert.IsType&lt;Ok&lt;CustomerResponse&gt;&gt;(result.Result)</code> vérifie à la fois le code de statut et le type du corps, sans démarrer de serveur. C'est un vrai avantage sur <code>Results.Ok</code>, dont le type <code>IResult</code> ne révèle rien. Pour vérifier le comportement HTTP complet (routage, binding, filtres, sérialisation), on utilisera <code>WebApplicationFactory</code> au jour des tests d'intégration. Les deux niveaux sont complémentaires : le test unitaire du handler est rapide, le test d'intégration prouve que tout est bien câblé.</p>

<h3>Les pièges fréquents</h3>
<ul>
<li><strong>L'ordre des paramètres optionnels</strong> : dans une méthode nommée, les paramètres avec une valeur par défaut doivent venir en dernier. On les place donc après <code>CancellationToken</code> ou on regroupe tout avec <code>[AsParameters]</code>.</li>
<li><strong>Un type complexe en GET</strong> : il est cherché dans le corps, que la requête n'a pas, d'où un 400 ou une erreur de binding. Utilise <code>[AsParameters]</code> ou des paramètres simples.</li>
<li><strong>Mélanger Results et TypedResults</strong> dans un type union : <code>Results&lt;Ok&lt;T&gt;, NotFound&gt;</code> n'accepte que des <code>TypedResults</code>. Avec <code>Results.Ok</code>, la compilation échoue.</li>
<li><strong>Oublier le <code>CancellationToken</code></strong> : il suffit de le déclarer en paramètre, il est fourni automatiquement, comme dans les controllers.</li>
<li><strong>Une lambda asynchrone qui renvoie deux types différents</strong> : l'inférence échoue (« cannot infer return type »). Passe par une méthode avec un type de retour explicite.</li>
<li><strong>Croire que les endpoint filters remplacent les middlewares</strong> : un filtre ne s'exécute que si un endpoint a été trouvé. Une requête sur une URL inconnue ne passe par aucun filtre.</li>
</ul>

<div class="note">Le risque des Minimal APIs, c'est le Program.cs de 800 lignes et les lambdas de 40 lignes qui mélangent accès aux données et règles métier. Un senior impose dès le départ un fichier d'endpoints par ressource, des handlers nommés courts qui délèguent aux mêmes services que les controllers, des <code>TypedResults</code> partout pour un contrat documenté automatiquement, et une configuration commune (autorisation, tags, filtres) posée au niveau des groupes plutôt que recopiée sur chaque route.</div>
`,
  examples: [
    {
      title: "CRUD complet en quelques lignes",
      code: `using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
var app = builder.Build();

// Lecture : id depuis la route, db injecté, CancellationToken fourni
app.MapGet("/api/customers/{id:int}", async (int id, OrderFlowDbContext db, CancellationToken ct) =>
    await db.Customers.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id, ct) is { } customer
        ? Results.Ok(new CustomerResponse(customer.Id, customer.Name, customer.Email))
        : Results.NotFound());

// Liste filtrée : search et page depuis la query string
app.MapGet("/api/customers", async (string? search, int page, OrderFlowDbContext db, CancellationToken ct) =>
{
    var query = db.Customers.AsNoTracking();
    if (!string.IsNullOrWhiteSpace(search)) query = query.Where(c => c.Name.Contains(search));
    return await query.OrderBy(c => c.Name)
        .Skip((Math.Max(page, 1) - 1) * 20).Take(20)
        .Select(c => new CustomerResponse(c.Id, c.Name, c.Email))
        .ToListAsync(ct);
});

// Création : corps JSON lié au record
app.MapPost("/api/customers", async (CreateCustomerRequest request, OrderFlowDbContext db, CancellationToken ct) =>
{
    var customer = new Customer { Name = request.Name, Email = request.Email };
    db.Customers.Add(customer);
    await db.SaveChangesAsync(ct);
    return Results.Created($"/api/customers/{customer.Id}", new CustomerResponse(customer.Id, customer.Name, customer.Email));
});

app.MapDelete("/api/customers/{id:int}", async (int id, OrderFlowDbContext db, CancellationToken ct) =>
    await db.Customers.Where(c => c.Id == id).ExecuteDeleteAsync(ct) == 0
        ? Results.NotFound()
        : Results.NoContent());

app.Run();

public sealed record CreateCustomerRequest(string Name, string Email);
public sealed record CustomerResponse(int Id, string Name, string Email);`,
      explain: `Pratique pour comprendre et prototyper. Remarque que <code>page</code> est requis ici, donc son absence donne un 400 : on corrigera ça avec une valeur par défaut dans la version organisée.`
    },
    {
      title: "Version organisée : groupe, handlers nommés, TypedResults",
      code: `using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace OrderFlow.Api.Endpoints;

public static class CustomerEndpoints
{
    public static IEndpointRouteBuilder MapCustomerEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/customers")
            .WithTags("Customers");               // configuration commune au groupe

        group.MapGet("/", GetAll).WithSummary("Liste paginée des clients");
        group.MapGet("/{id:int}", GetById).WithName("GetCustomerById");
        group.MapPost("/", Create);
        group.MapDelete("/{id:int}", Delete).RequireAuthorization("Admin");

        return routes;
    }

    private static async Task<Ok<List<CustomerResponse>>> GetAll(
        OrderFlowDbContext db, CancellationToken ct, string? search = null, int page = 1)
    {
        var query = db.Customers.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(c => c.Name.Contains(search));

        var items = await query.OrderBy(c => c.Name)
            .Skip((Math.Max(page, 1) - 1) * 20).Take(20)
            .Select(c => new CustomerResponse(c.Id, c.Name, c.Email))
            .ToListAsync(ct);
        return TypedResults.Ok(items);
    }

    // Le type union documente les deux réponses possibles dans OpenAPI
    private static async Task<Results<Ok<CustomerResponse>, NotFound>> GetById(
        int id, OrderFlowDbContext db, CancellationToken ct)
    {
        var customer = await db.Customers.AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new CustomerResponse(c.Id, c.Name, c.Email))
            .FirstOrDefaultAsync(ct);

        return customer is null ? TypedResults.NotFound() : TypedResults.Ok(customer);
    }

    private static async Task<CreatedAtRoute<CustomerResponse>> Create(
        CreateCustomerRequest request, OrderFlowDbContext db, CancellationToken ct)
    {
        var customer = new Customer { Name = request.Name, Email = request.Email };
        db.Customers.Add(customer);
        await db.SaveChangesAsync(ct);

        // 201 + Location calculé depuis le nom de route
        return TypedResults.CreatedAtRoute(
            new CustomerResponse(customer.Id, customer.Name, customer.Email),
            "GetCustomerById", new { id = customer.Id });
    }

    private static async Task<Results<NoContent, NotFound>> Delete(int id, OrderFlowDbContext db, CancellationToken ct)
        => await db.Customers.Where(c => c.Id == id).ExecuteDeleteAsync(ct) == 0
            ? TypedResults.NotFound()
            : TypedResults.NoContent();
}

// Program.cs : app.MapCustomerEndpoints();`,
      explain: `Les paramètres optionnels avec valeur par défaut (<code>search</code>, <code>page</code>) doivent être placés après les paramètres requis dans la signature d'une méthode C#.`
    },
    {
      title: "Endpoint filter de validation générique",
      code: `using System.ComponentModel.DataAnnotations;

namespace OrderFlow.Api.Endpoints;

// Valide par DataAnnotations le premier argument de type T du handler
public sealed class ValidationFilter<T> : IEndpointFilter where T : class
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var argument = context.Arguments.OfType<T>().FirstOrDefault();
        if (argument is null)
            return TypedResults.Problem(title: "Corps de requête manquant", statusCode: StatusCodes.Status400BadRequest);

        var results = new List<ValidationResult>();
        if (!Validator.TryValidateObject(argument, new ValidationContext(argument), results, validateAllProperties: true))
        {
            var errors = results
                .SelectMany(r => r.MemberNames.DefaultIfEmpty(string.Empty), (r, member) => (member, r.ErrorMessage ?? "Invalide"))
                .GroupBy(e => e.member)
                .ToDictionary(g => g.Key, g => g.Select(e => e.Item2).ToArray());

            return TypedResults.ValidationProblem(errors);   // 400 + ValidationProblemDetails
        }

        return await next(context);                           // valide : on exécute le handler
    }
}

public sealed record CreateCustomerRequest(
    [property: Required, StringLength(100, MinimumLength = 2)] string Name,
    [property: Required, EmailAddress] string Email);

// Utilisation :
// group.MapPost("/", Create).AddEndpointFilter<ValidationFilter<CreateCustomerRequest>>();
//
// Alternative .NET 10 : builder.Services.AddValidation();
// (validation intégrée des paramètres annotés ; vérifier le comportement dans la doc)`,
      explain: `Sur un record positionnel, la cible <code>property:</code> place les attributs sur les propriétés générées, là où <code>Validator</code> les cherche.`
    },
    {
      title: "Le même endpoint écrit des deux façons",
      code: `// ---- Version controller ----
[ApiController]
[Route("api/products")]
public sealed class ProductsController(OrderFlowDbContext db) : ControllerBase
{
    [HttpGet("{id:int}")]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductResponse>> GetById(int id, CancellationToken ct)
    {
        var product = await db.Products.AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductResponse(p.Id, p.Name, p.Price, p.Stock))
            .FirstOrDefaultAsync(ct);
        return product is null ? NotFound() : product;
    }
}

// ---- Version Minimal API ----
public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder routes) =>
        routes.MapGroup("/api/products").MapGet("/{id:int}", GetById);

    private static async Task<Results<Ok<ProductResponse>, NotFound>> GetById(
        int id, OrderFlowDbContext db, CancellationToken ct)
    {
        var product = await db.Products.AsNoTracking()
            .Where(p => p.Id == id)
            .Select(p => new ProductResponse(p.Id, p.Name, p.Price, p.Stock))
            .FirstOrDefaultAsync(ct);
        return product is null ? TypedResults.NotFound() : TypedResults.Ok(product);
    }
}`,
      explain: `La logique est identique : seule l'enveloppe change. Les deux versions produisent la même documentation OpenAPI, l'une grâce aux attributs, l'autre grâce au type union.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Endpoint de recherche avec [AsParameters]",
      prompt: `<p>Écris un endpoint <code>GET /api/products/search</code> qui accepte <code>name</code>, <code>minPrice</code>, <code>maxPrice</code> (tous optionnels) et <code>page</code> (1 par défaut), regroupés dans un record <code>ProductSearch</code> lié avec <code>[AsParameters]</code>. Il renvoie la liste filtrée avec <code>TypedResults.Ok</code>.</p>`,
      hint: `<p>Avec <code>[AsParameters]</code>, les propriétés nullables du record sont optionnelles et sont lues depuis la query string. Applique chaque filtre seulement s'il a une valeur.</p>`,
      solution: `public sealed record ProductSearch(string? Name, decimal? MinPrice, decimal? MaxPrice, int Page = 1);

app.MapGet("/api/products/search", async ([AsParameters] ProductSearch search, OrderFlowDbContext db, CancellationToken ct) =>
{
    var query = db.Products.AsNoTracking();

    if (!string.IsNullOrWhiteSpace(search.Name))
        query = query.Where(p => p.Name.Contains(search.Name));
    if (search.MinPrice is decimal min)
        query = query.Where(p => p.Price >= min);
    if (search.MaxPrice is decimal max)
        query = query.Where(p => p.Price <= max);

    var page = Math.Max(search.Page, 1);
    var items = await query
        .OrderBy(p => p.Price)
        .Skip((page - 1) * 20).Take(20)
        .Select(p => new ProductResponse(p.Id, p.Name, p.Price, p.Stock))
        .ToListAsync(ct);

    return TypedResults.Ok(items);
});

// GET /api/products/search?name=clavier&maxPrice=50&page=2`
    },
    {
      level: "moyen",
      title: "Filtre de journalisation sur un groupe",
      prompt: `<p>Écris un endpoint filter <code>AuditFilter</code> qui, pour chaque appel d'un endpoint du groupe <code>/api/orders</code>, écrit un log avec le nom de l'utilisateur (ou « anonyme »), la méthode, le chemin, le code de statut renvoyé si le résultat expose un <code>StatusCode</code> et la durée. Applique-le au groupe entier avec une seule ligne.</p>`,
      hint: `<p><code>context.HttpContext.User.Identity?.Name</code> donne l'utilisateur. Le résultat de <code>next</code> est un <code>object?</code> : teste s'il implémente <code>IStatusCodeHttpResult</code>.</p>`,
      solution: `using System.Diagnostics;
using Microsoft.AspNetCore.Http.Metadata;

namespace OrderFlow.Api.Endpoints;

public sealed class AuditFilter(ILogger<AuditFilter> logger) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var http = context.HttpContext;
        var start = Stopwatch.GetTimestamp();

        var result = await next(context);

        var statusCode = result is IStatusCodeHttpResult { StatusCode: int code } ? code : http.Response.StatusCode;
        logger.LogInformation("Audit {User} {Method} {Path} -> {StatusCode} ({ElapsedMs:F0} ms)",
            http.User.Identity?.Name ?? "anonyme",
            http.Request.Method, http.Request.Path, statusCode,
            Stopwatch.GetElapsedTime(start).TotalMilliseconds);

        return result;
    }
}

// Dans OrderEndpoints
// var group = routes.MapGroup("/api/orders")
//     .WithTags("Orders")
//     .AddEndpointFilter<AuditFilter>();   // une ligne : tous les endpoints du groupe
//
// Note : IStatusCodeHttpResult est dans Microsoft.AspNetCore.Http (namespace des
// interfaces de résultats) ; ajuster le using selon l'erreur du compilateur si besoin.`
    },
    {
      level: "difficile",
      title: "Filtre de propriété de ressource",
      prompt: `<p>Un client authentifié ne doit pouvoir lire ou annuler que <strong>ses propres</strong> commandes. Écris un endpoint filter <code>OrderOwnershipFilter</code> qui récupère l'argument <code>id</code> de la route, charge le <code>CustomerId</code> de la commande et le compare à la claim <code>customer_id</code> de l'utilisateur. Il renvoie 404 si la commande n'existe pas et 403 si elle appartient à un autre client. Les administrateurs (rôle <code>Admin</code>) passent toujours. Applique-le aux endpoints <code>GET /api/orders/{id}</code> et <code>POST /api/orders/{id}/cancel</code>.</p>`,
      hint: `<p>Lis la valeur de route avec <code>context.HttpContext.Request.RouteValues["id"]</code>, ou avec <code>context.GetArgument&lt;int&gt;(0)</code> si <code>id</code> est le premier paramètre. Le <code>DbContext</code> peut être obtenu depuis <code>context.HttpContext.RequestServices</code>, ou injecté dans le constructeur du filtre, qui est résolu par requête.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

namespace OrderFlow.Api.Endpoints;

public sealed class OrderOwnershipFilter(OrderFlowDbContext db) : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var http = context.HttpContext;

        if (http.User.IsInRole("Admin"))
            return await next(context);                       // l'admin voit tout

        if (!int.TryParse(http.Request.RouteValues["id"]?.ToString(), out var orderId))
            return TypedResults.BadRequest();

        // On ne charge que la colonne nécessaire
        var ownerId = await db.Orders
            .Where(o => o.Id == orderId)
            .Select(o => (int?)o.CustomerId)
            .FirstOrDefaultAsync(http.RequestAborted);

        if (ownerId is null)
            return TypedResults.NotFound();

        if (!int.TryParse(http.User.FindFirst("customer_id")?.Value, out var customerId) || customerId != ownerId)
            return TypedResults.Problem(title: "Accès refusé",
                detail: "Cette commande ne vous appartient pas.",
                statusCode: StatusCodes.Status403Forbidden);

        return await next(context);
    }
}

// OrderEndpoints
// var group = routes.MapGroup("/api/orders").RequireAuthorization();
// group.MapGet("/{id:int}", GetById).AddEndpointFilter<OrderOwnershipFilter>();
// group.MapPost("/{id:int}/cancel", Cancel).AddEndpointFilter<OrderOwnershipFilter>();
//
// Choix de sécurité : beaucoup d'API renvoient 404 au lieu de 403 pour ne pas
// révéler l'existence de commandes d'autres clients. À décider avec l'équipe.`
    }
  ],
  project: `<p><strong>Réécrire les endpoints Customers en Minimal APIs.</strong> Supprime <code>CustomersController</code> s'il existe et crée <code>Endpoints/CustomerEndpoints.cs</code> : un groupe <code>/api/customers</code> avec la liste paginée, la lecture par id (nom de route <code>GetCustomerById</code>), la création (<code>CreatedAtRoute</code>), la modification et la suppression. Les handlers sont des méthodes statiques avec <code>TypedResults</code> et des types union. Ajoute le <code>ValidationFilter&lt;CreateCustomerRequest&gt;</code> sur le POST. Products et Orders restent en controllers : vérifie dans le document OpenAPI que les deux styles cohabitent.</p>`,
  resources: [
    { label: "Vue d'ensemble des Minimal APIs", url: "https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis/overview" },
    { label: "Binding des paramètres dans les Minimal APIs", url: "https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis/parameter-binding" },
    { label: "Créer des réponses (TypedResults)", url: "https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis/responses" },
    { label: "Filtres dans les Minimal APIs", url: "https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis/min-api-filters" },
    { label: "Choisir entre controllers et Minimal APIs", url: "https://learn.microsoft.com/aspnet/core/fundamentals/apis" }
  ]
});

/* ============================================================
   Jour 42 : DTOs, mapping et validation
   ============================================================ */
window.COURSE.push({
  key: "w-dtos-validation",
  title: "DTOs, mapping et validation",
  summary: "Séparer le contrat de l'API du modèle de données, valider chaque entrée et renvoyer des erreurs au format standard ProblemDetails.",
  objectives: [
    "Expliquer pourquoi on n'expose jamais les entités EF Core",
    "Concevoir des DTOs de requête et de réponse en records",
    "Mapper à la main, avec Mapster ou par projection EF",
    "Valider avec DataAnnotations puis avec FluentValidation",
    "Produire des ProblemDetails cohérentes et les exploiter dans Angular"
  ],
  lesson: `
<h3>Pourquoi ne jamais exposer les entités</h3>
<p>Il est tentant de renvoyer directement l'entité <code>Order</code> d'EF Core, ou de la recevoir en paramètre d'un POST. C'est une des erreurs les plus coûteuses, pour quatre raisons :</p>
<ul>
<li><strong>Over-posting</strong> (mass assignment) : si l'action reçoit un <code>Customer</code>, un client malveillant peut envoyer <code>"isAdmin": true</code> ou <code>"creditLimit": 99999</code>, et EF Core l'enregistrera. Un DTO de requête ne contient que les champs que l'utilisateur a le droit de fournir.</li>
<li><strong>Cycles et sur-exposition</strong> : <code>Order.Customer.Orders[0].Customer</code>… La sérialisation boucle ou renvoie un graphe énorme, avec des champs sensibles (hash de mot de passe, notes internes).</li>
<li><strong>Couplage</strong> : renommer une colonne ou découper une table casse le contrat de l'API et donc le front Angular. Avec des DTOs, le schéma de base et le contrat évoluent séparément.</li>
<li><strong>Performance</strong> : une entité chargée entière avec ses navigations lit bien plus de données que l'écran n'en affiche.</li>
</ul>

<h3>Concevoir les DTOs</h3>
<p>Un DTO (Data Transfer Object) est un type sans comportement qui décrit exactement ce qui traverse le réseau. Les <strong>records</strong> sont parfaits pour ça : immuables, concis, et avec une égalité par valeur pratique dans les tests. Prévois un type par usage, pas un DTO universel :</p>
<ul>
<li><code>CreateOrderRequest</code> : ce que le client envoie pour créer (pas d'Id, pas de statut, pas de total).</li>
<li><code>UpdateOrderAddressRequest</code> : ce qui est modifiable, et rien d'autre.</li>
<li><code>OrderResponse</code> : ce que l'écran de détail affiche, avec des champs calculés comme le total.</li>
<li><code>OrderSummaryResponse</code> : une version allégée pour les listes.</li>
</ul>
<p>Range-les par fonctionnalité (<code>Orders/CreateOrderRequest.cs</code>) plutôt que dans un dossier global <code>Dtos</code> de cent fichiers. Côté Angular, ces records correspondent à des interfaces TypeScript, que tu peux générer depuis le document OpenAPI.</p>

<h3>Le mapping</h3>
<p>Trois approches :</p>
<table>
<thead><tr><th>Approche</th><th>Avantages</th><th>Inconvénients</th></tr></thead>
<tbody>
<tr><td>Mapping manuel (méthodes d'extension <code>ToResponse()</code>)</td><td>Explicite, rapide, vérifié à la compilation, facile à déboguer</td><td>Un peu de code à écrire</td></tr>
<tr><td>Projection EF (<code>Select(o =&gt; new OrderResponse(...))</code>)</td><td>Traduit en SQL : ne lit que les colonnes nécessaires</td><td>Limité à ce qu'EF sait traduire</td></tr>
<tr><td>Bibliothèque (Mapster, AutoMapper)</td><td>Moins de code répétitif</td><td>Erreurs détectées à l'exécution, « magie » à déboguer, licence</td></tr>
</tbody>
</table>
<p>Pour les lectures, la projection EF est la meilleure option : elle évite de charger l'entité et ses navigations. Pour les écritures et les conversions simples, le mapping manuel suffit largement. Sur les bibliothèques : <strong>AutoMapper est passé sous licence commerciale en 2025</strong> (tout comme MediatR, du même auteur). Beaucoup d'équipes se sont tournées vers Mapster (open source) ou, plus souvent, vers le mapping manuel. Mapster sait aussi générer des projections <code>ProjectToType&lt;T&gt;()</code> pour EF. Une bonne règle : mapping manuel par défaut, bibliothèque seulement si le volume le justifie vraiment.</p>

<h3>Valider avec DataAnnotations</h3>
<p>Les attributs de <code>System.ComponentModel.DataAnnotations</code> décrivent les règles simples directement sur le DTO : <code>[Required]</code>, <code>[StringLength(100, MinimumLength = 2)]</code>, <code>[Range(1, 100)]</code>, <code>[EmailAddress]</code>, <code>[RegularExpression(...)]</code>, <code>[MinLength(1)]</code> sur une collection. Pour une règle qui porte sur plusieurs champs, comme une date de fin postérieure à la date de début, le DTO implémente <code>IValidatableObject</code> et sa méthode <code>Validate</code>. Avec <code>[ApiController]</code>, la validation est automatique et produit un 400. Avec les Minimal APIs, utilise le filtre du jour 41 ou <code>AddValidation()</code> en .NET 10.</p>
<p>Leurs limites : règles conditionnelles peu lisibles, pas de validation asynchrone (vérifier en base qu'un email n'est pas déjà pris), règles mélangées au contrat, et validation des collections imbriquées peu pratique.</p>

<h3>Valider avec FluentValidation</h3>
<p>FluentValidation (paquet <code>FluentValidation</code>, open source sous licence Apache 2.0) sépare les règles dans une classe <code>AbstractValidator&lt;T&gt;</code> : <code>RuleFor(x =&gt; x.Email).NotEmpty().EmailAddress()</code>. Elle gère les règles conditionnelles (<code>When</code>), les collections (<code>RuleForEach(x =&gt; x.Lines).SetValidator(new LineValidator())</code>), les messages personnalisés et la <strong>validation asynchrone</strong> avec <code>MustAsync</code>, qui peut interroger la base. Les validateurs s'enregistrent dans la DI (<code>AddValidatorsFromAssemblyContaining&lt;T&gt;()</code>, du paquet <code>FluentValidation.DependencyInjectionExtensions</code>) et s'invoquent explicitement, ou depuis un endpoint filter. Le paquet d'intégration automatique au pipeline MVC n'est plus recommandé par ses auteurs : préfère l'appel explicite ou un filtre.</p>
<p>Fais la distinction entre deux niveaux. La <strong>validation d'entrée</strong> (format, champs obligatoires, bornes) produit un 400 et se fait au bord de l'API. Les <strong>règles métier</strong> (stock suffisant, commande pas encore expédiée) appartiennent au domaine ou au service et produisent un 409 ou un 422. Une règle comme « le produit existe » peut se vérifier dans le validateur de façon asynchrone, mais une règle qui dépend de l'état au moment de l'écriture, comme le stock, doit être vérifiée dans la transaction.</p>

<h3>ProblemDetails : un seul format d'erreur</h3>
<p>La RFC 9457 (qui remplace la RFC 7807) définit le format <code>application/problem+json</code>, avec les champs <code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code> et <code>instance</code>, et autorise des extensions libres. <code>ValidationProblemDetails</code> y ajoute un dictionnaire <code>errors</code> qui associe chaque champ à ses messages. Avec <code>builder.Services.AddProblemDetails()</code>, toutes les erreurs du framework (404 sans corps, exceptions via <code>UseExceptionHandler</code>, codes de statut via <code>UseStatusCodePages</code>) adoptent ce format. L'option <code>CustomizeProblemDetails</code> permet d'ajouter partout le <code>traceId</code> ou le <code>correlationId</code>, précieux quand un utilisateur te transmet une erreur.</p>
<p>L'enjeu, c'est la cohérence : le front Angular doit pouvoir écrire <strong>un seul</strong> intercepteur qui lit <code>status</code>, affiche <code>title</code> ou <code>detail</code>, et place les messages de <code>errors</code> sous les bons champs du formulaire. Une API qui renvoie tantôt une chaîne, tantôt <code>{ "message": ... }</code> et tantôt une ProblemDetails oblige le front à multiplier les cas particuliers.</p>

<h3>La mise à jour partielle (PATCH)</h3>
<p>Pour un PATCH, le DTO doit distinguer « champ absent » de « champ envoyé ». La solution la plus simple : un record dont toutes les propriétés sont <strong>nullables</strong> (<code>UpdateOrderRequest(string? ShippingAddress, string? Notes)</code>), et on ne modifie que ce qui n'est pas nul. Sa limite : impossible de remettre volontairement un champ à <code>null</code>. Si ce besoin existe, on passe au format JSON Patch (RFC 6902, une liste d'opérations <code>replace</code>, <code>remove</code>…), qui est plus puissant mais plus lourd à valider. Dans la majorité des API métier, des endpoints dédiés (<code>PUT /orders/{id}/address</code>) sont plus clairs qu'un PATCH générique.</p>

<h3>Validation côté Angular et côté serveur</h3>
<p>Le formulaire Angular valide déjà les champs (<code>Validators.required</code>, <code>Validators.email</code>) : pourquoi recommencer côté serveur ? Parce que la validation du front n'est qu'un <strong>confort</strong> pour l'utilisateur, alors que celle du serveur est une <strong>garantie</strong>. N'importe qui peut appeler l'API avec curl en contournant le formulaire, une autre application peut la consommer, et le front peut avoir un bug. Le serveur valide donc toujours tout, et le front réutilise ses messages : en associant les clés de <code>errors</code> aux contrôles du formulaire (<code>form.get(key)?.setErrors({ server: message })</code>), les règles vérifiables seulement côté serveur (email déjà pris) s'affichent sous le bon champ. Garde des noms de propriétés identiques en camelCase dans les deux mondes, et le mapping devient automatique.</p>

<h3>Les pièges fréquents</h3>
<ul>
<li><strong>Le DTO universel</strong> réutilisé pour créer, modifier et afficher : il finit avec des champs qui n'ont de sens que dans un cas, et la validation devient conditionnelle partout.</li>
<li><strong>Le mapping dans le mauvais sens</strong> : charger l'entité entière avec <code>Include</code> pour ensuite la mapper vers un DTO de trois champs. La projection fait mieux, en une requête.</li>
<li><strong>Les erreurs métier lancées comme exceptions</strong> puis transformées en 500 : un stock insuffisant est un cas prévu, il mérite un 409 ou un 422 explicite.</li>
<li><strong>Des messages d'erreur qui révèlent des détails internes</strong> (nom de table, trace de pile) : en production, <code>detail</code> reste générique pour les 500, et la trace part dans les logs, retrouvable grâce au <code>traceId</code>.</li>
</ul>

<div class="note">Le contrat de l'API est une frontière de sécurité et de stabilité. Un senior applique trois règles sans exception : chaque entrée est un DTO dédié qui ne contient que les champs autorisés, toute entrée est validée avant d'atteindre le domaine, et toutes les erreurs sortent au format ProblemDetails avec un identifiant de trace. Il garde aussi le mapping ennuyeux et explicite : une ligne de mapping manuel lisible coûte moins cher qu'une heure à chercher pourquoi un champ arrive nul à cause d'une convention de bibliothèque.</div>
`,
  examples: [
    {
      title: "Le piège de l'over-posting",
      code: `// MAUVAIS : l'entité sert de modèle d'entrée
[HttpPut("{id:int}")]
public async Task<IActionResult> Update(int id, Customer customer, CancellationToken ct)
{
    customer.Id = id;
    db.Customers.Update(customer);   // TOUTES les colonnes sont écrasées
    await db.SaveChangesAsync(ct);
    return NoContent();
}
// Requête malveillante :
// PUT /api/customers/42   { "name": "Bob", "email": "bob@x.fr", "isVip": true, "creditLimit": 100000 }
// -> Bob devient VIP avec un crédit de 100 000.

// BON : un DTO qui ne contient que ce qui est modifiable
public sealed record UpdateCustomerRequest(string Name, string Email);

[HttpPut("{id:int}")]
public async Task<IActionResult> Update(int id, UpdateCustomerRequest request, CancellationToken ct)
{
    var customer = await db.Customers.FindAsync([id], ct);
    if (customer is null) return NotFound();

    customer.Name = request.Name;     // seuls les champs autorisés sont copiés
    customer.Email = request.Email;
    await db.SaveChangesAsync(ct);
    return NoContent();
}`,
      explain: `Le champ <code>isVip</code> envoyé par le client est simplement ignoré à la désérialisation : il n'existe pas dans le DTO.`
    },
    {
      title: "DTOs en records, mapping manuel et projection EF",
      code: `namespace OrderFlow.Api.Orders;

public sealed record CreateOrderLineRequest(int ProductId, int Quantity);
public sealed record CreateOrderRequest(int CustomerId, string? ShippingAddress, IReadOnlyList<CreateOrderLineRequest> Lines);

public sealed record OrderLineResponse(int ProductId, string ProductName, int Quantity, decimal UnitPrice, decimal LineTotal);
public sealed record OrderResponse(int Id, int CustomerId, string Status, DateTime CreatedAt, decimal Total, IReadOnlyList<OrderLineResponse> Lines);
public sealed record OrderSummaryResponse(int Id, string Status, DateTime CreatedAt, decimal Total);

public static class OrderMappings
{
    // Mapping manuel en mémoire (après une écriture, l'entité est déjà chargée)
    public static OrderResponse ToResponse(this Order order) => new(
        order.Id,
        order.CustomerId,
        order.Status.ToString(),
        order.CreatedAt,
        order.Lines.Sum(l => l.Quantity * l.UnitPrice),
        order.Lines.Select(l => new OrderLineResponse(
            l.ProductId, l.Product?.Name ?? string.Empty, l.Quantity, l.UnitPrice, l.Quantity * l.UnitPrice)).ToList());

    // Projection réutilisable pour les lectures : traduite en SQL par EF Core
    public static IQueryable<OrderSummaryResponse> ToSummaries(this IQueryable<Order> orders) =>
        orders.Select(o => new OrderSummaryResponse(
            o.Id, o.Status.ToString(), o.CreatedAt,
            o.Lines.Sum(l => l.Quantity * l.UnitPrice)));
}

// Utilisation :
// var list = await db.Orders.AsNoTracking()
//     .Where(o => o.CustomerId == customerId)
//     .OrderByDescending(o => o.CreatedAt)
//     .ToSummaries()
//     .ToListAsync(ct);   // SELECT Id, Status, CreatedAt, SUM(...) : rien de plus`,
      explain: `La projection <code>ToSummaries</code> est écrite une fois et réutilisée partout. EF Core la traduit en un seul SELECT avec la somme calculée côté SQL Server.`
    },
    {
      title: "DataAnnotations et IValidatableObject",
      code: `using System.ComponentModel.DataAnnotations;

namespace OrderFlow.Api.Promotions;

public sealed record CreatePromotionRequest : IValidatableObject
{
    [Required, StringLength(50, MinimumLength = 3)]
    public string Code { get; init; } = string.Empty;

    [Range(1, 90, ErrorMessage = "La remise doit être comprise entre 1 et 90 %.")]
    public int DiscountPercent { get; init; }

    public DateOnly StartsOn { get; init; }
    public DateOnly EndsOn { get; init; }

    [MinLength(1, ErrorMessage = "Au moins un produit est requis.")]
    public List<int> ProductIds { get; init; } = [];

    // Règle qui concerne plusieurs champs
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (EndsOn <= StartsOn)
            yield return new ValidationResult(
                "La date de fin doit être postérieure à la date de début.",
                [nameof(EndsOn)]);
    }
}

// Avec [ApiController], une requête invalide n'atteint pas l'action :
// 400 { "title": "One or more validation errors occurred.",
//       "errors": { "DiscountPercent": ["La remise doit être comprise entre 1 et 90 %."],
//                   "EndsOn": ["La date de fin doit être postérieure à la date de début."] } }`,
      explain: `Bon choix pour des règles simples et stables. Dès qu'il faut interroger la base ou exprimer des conditions, passe à FluentValidation.`
    },
    {
      title: "FluentValidation avec règle asynchrone et collections",
      code: `using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace OrderFlow.Api.Orders;

public sealed class CreateOrderLineRequestValidator : AbstractValidator<CreateOrderLineRequest>
{
    public CreateOrderLineRequestValidator()
    {
        RuleFor(l => l.ProductId).GreaterThan(0);
        RuleFor(l => l.Quantity).InclusiveBetween(1, 100)
            .WithMessage("La quantité doit être comprise entre 1 et 100.");
    }
}

public sealed class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator(OrderFlowDbContext db)
    {
        RuleFor(o => o.CustomerId)
            .GreaterThan(0)
            .MustAsync((id, ct) => db.Customers.AnyAsync(c => c.Id == id, ct))
            .WithMessage("Client inconnu.");

        RuleFor(o => o.ShippingAddress)
            .MaximumLength(250)
            .When(o => o.ShippingAddress is not null);

        RuleFor(o => o.Lines)
            .NotEmpty().WithMessage("Une commande contient au moins une ligne.")
            .Must(lines => lines.Select(l => l.ProductId).Distinct().Count() == lines.Count)
            .WithMessage("Un produit ne peut apparaître qu'une fois par commande.");

        RuleForEach(o => o.Lines).SetValidator(new CreateOrderLineRequestValidator());

        // Tous les produits doivent exister (une seule requête SQL)
        RuleFor(o => o.Lines)
            .MustAsync(async (lines, ct) =>
            {
                var ids = lines.Select(l => l.ProductId).Distinct().ToList();
                return await db.Products.CountAsync(p => ids.Contains(p.Id), ct) == ids.Count;
            })
            .WithMessage("Un ou plusieurs produits n'existent pas.")
            .When(o => o.Lines is { Count: > 0 });
    }
}

// Program.cs (paquet FluentValidation.DependencyInjectionExtensions) :
// builder.Services.AddValidatorsFromAssemblyContaining<CreateOrderRequestValidator>();`,
      explain: `Le validateur reçoit le <code>DbContext</code> par injection : enregistré en scoped (la valeur par défaut d'<code>AddValidatorsFromAssemblyContaining</code>), il partage le contexte de la requête.`
    },
    {
      title: "ProblemDetails côté serveur et intercepteur Angular",
      code: `// ---- Program.cs ----
builder.Services.AddProblemDetails(options =>
{
    options.CustomizeProblemDetails = context =>
    {
        // Ajoute partout un identifiant à communiquer au support
        context.ProblemDetails.Extensions["traceId"] = context.HttpContext.TraceIdentifier;
        if (context.HttpContext.Items["X-Correlation-Id"] is string correlationId)
            context.ProblemDetails.Extensions["correlationId"] = correlationId;
    };
});
// ...
app.UseExceptionHandler();     // exceptions -> 500 ProblemDetails
app.UseStatusCodePages();      // 404/405 sans corps -> ProblemDetails

// ---- Angular : problem-details.interceptor.ts ----
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  traceId?: string;
  errors?: Record<string, string[]>;
}

export const problemDetailsInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const problem = error.error as ProblemDetails | null;
      // Les erreurs de champ (400) sont laissées au formulaire ;
      // les autres sont affichées globalement avec la référence de trace
      if (!problem?.errors) {
        notifications.error((problem?.title ?? 'Erreur inattendue') + ' (réf. ' + (problem?.traceId ?? '-') + ')');
      }
      return throwError(() => problem ?? error);
    })
  );
};`,
      explain: `Côté Angular, un seul intercepteur gère toutes les erreurs. Les formulaires lisent <code>problem.errors</code> pour afficher chaque message sous le bon champ.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "DTOs du client",
      prompt: `<p>L'entité <code>Customer</code> contient <code>Id</code>, <code>Name</code>, <code>Email</code>, <code>PasswordHash</code>, <code>IsVip</code>, <code>CreditLimit</code>, <code>CreatedAt</code> et <code>Orders</code>. Écris les records <code>CreateCustomerRequest</code>, <code>UpdateCustomerRequest</code> et <code>CustomerResponse</code>, ainsi qu'une méthode d'extension <code>ToResponse()</code>. Justifie en commentaire chaque champ exclu.</p>`,
      hint: `<p>Demande-toi pour chaque champ : le client a-t-il le droit de le fournir ? L'écran en a-t-il besoin ? Un champ sensible n'apparaît jamais dans une réponse.</p>`,
      solution: `namespace OrderFlow.Api.Customers;

// Création : le client fournit son identité et son mot de passe en clair
// (haché côté serveur). Pas d'Id (généré), pas d'IsVip ni de CreditLimit
// (décidés par l'entreprise), pas de CreatedAt (horodaté par le serveur).
public sealed record CreateCustomerRequest(string Name, string Email, string Password);

// Modification : seulement ce que le client peut changer lui-même.
// Le mot de passe a son propre endpoint (avec l'ancien mot de passe).
public sealed record UpdateCustomerRequest(string Name, string Email);

// Réponse : jamais PasswordHash ; pas de CreditLimit côté client public ;
// pas d'Orders (ressource séparée /api/customers/{id}/orders, évite les cycles).
public sealed record CustomerResponse(int Id, string Name, string Email, bool IsVip, DateTime CreatedAt);

public static class CustomerMappings
{
    public static CustomerResponse ToResponse(this Customer customer) =>
        new(customer.Id, customer.Name, customer.Email, customer.IsVip, customer.CreatedAt);
}`
    },
    {
      level: "moyen",
      title: "Validateur FluentValidation du client avec unicité de l'email",
      prompt: `<p>Écris <code>CreateCustomerRequestValidator</code> : nom obligatoire de 2 à 100 caractères, email valide et <strong>pas déjà utilisé</strong> (vérification asynchrone en base, sans tenir compte de la casse), mot de passe d'au moins 12 caractères contenant un chiffre. Appelle-le ensuite explicitement dans l'action <code>Create</code> et renvoie un <code>ValidationProblem</code> en cas d'échec.</p>`,
      hint: `<p><code>MustAsync</code> pour l'unicité, <code>Matches("[0-9]")</code> pour le chiffre. Dans l'action, injecte <code>IValidator&lt;CreateCustomerRequest&gt;</code>, appelle <code>ValidateAsync</code> et convertis <code>result.ToDictionary()</code> en <code>ValidationProblem</code>.</p>`,
      solution: `using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace OrderFlow.Api.Customers;

public sealed class CreateCustomerRequestValidator : AbstractValidator<CreateCustomerRequest>
{
    public CreateCustomerRequestValidator(OrderFlowDbContext db)
    {
        RuleFor(c => c.Name).NotEmpty().Length(2, 100);

        RuleFor(c => c.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(254)
            .MustAsync(async (email, ct) =>
                !await db.Customers.AnyAsync(c => c.Email.ToLower() == email.ToLower(), ct))
            .WithMessage("Cet email est déjà utilisé.");

        RuleFor(c => c.Password)
            .NotEmpty()
            .MinimumLength(12)
            .Matches("[0-9]").WithMessage("Le mot de passe doit contenir au moins un chiffre.");
    }
}

// CustomersController
[HttpPost]
[ProducesResponseType<CustomerResponse>(StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
public async Task<ActionResult<CustomerResponse>> Create(
    CreateCustomerRequest request,
    [FromServices] IValidator<CreateCustomerRequest> validator,
    CancellationToken cancellationToken)
{
    var validation = await validator.ValidateAsync(request, cancellationToken);
    if (!validation.IsValid)
        return ValidationProblem(new ValidationProblemDetails(validation.ToDictionary()));

    var customer = new Customer
    {
        Name = request.Name,
        Email = request.Email,
        PasswordHash = passwordHasher.Hash(request.Password)   // service injecté, hors sujet ici
    };
    db.Customers.Add(customer);
    await db.SaveChangesAsync(cancellationToken);

    return CreatedAtAction(nameof(GetById), new { id = customer.Id }, customer.ToResponse());
}

// Remarques :
// - Avec une collation SQL Server insensible à la casse (le cas par défaut),
//   c.Email == email suffit et peut utiliser l'index ; ToLower empêche l'index.
// - Garde aussi un index unique sur Email : deux inscriptions simultanées
//   peuvent passer le validateur, la base reste la dernière protection.`
    },
    {
      level: "difficile",
      title: "Filtre de validation FluentValidation générique",
      prompt: `<p>Écris un endpoint filter générique <code>FluentValidationFilter&lt;T&gt;</code> pour les Minimal APIs. Il résout <code>IValidator&lt;T&gt;</code> depuis la DI, valide l'argument de type <code>T</code> et renvoie un <code>TypedResults.ValidationProblem</code> avec les erreurs par champ, en noms camelCase pour correspondre au JSON reçu par Angular. Ajoute une méthode d'extension <code>.WithValidation&lt;T&gt;()</code> sur <code>RouteHandlerBuilder</code>. Si aucun validateur n'est enregistré pour <code>T</code>, le filtre laisse passer.</p>`,
      hint: `<p><code>context.HttpContext.RequestServices.GetService&lt;IValidator&lt;T&gt;&gt;()</code> renvoie null si le validateur n'existe pas. <code>JsonNamingPolicy.CamelCase.ConvertName</code> convertit un nom de propriété. Attention aux chemins imbriqués comme <code>Lines[0].Quantity</code> : convertis chaque segment.</p>`,
      solution: `using System.Text.Json;
using FluentValidation;

namespace OrderFlow.Api.Endpoints;

public sealed class FluentValidationFilter<T> : IEndpointFilter where T : class
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var validator = context.HttpContext.RequestServices.GetService<IValidator<T>>();
        if (validator is null)
            return await next(context);                     // pas de validateur : on laisse passer

        var argument = context.Arguments.OfType<T>().FirstOrDefault();
        if (argument is null)
            return TypedResults.Problem(title: "Corps de requête manquant", statusCode: StatusCodes.Status400BadRequest);

        var result = await validator.ValidateAsync(argument, context.HttpContext.RequestAborted);
        if (result.IsValid)
            return await next(context);

        var errors = result.Errors
            .GroupBy(e => ToCamelCasePath(e.PropertyName))
            .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).Distinct().ToArray());

        return TypedResults.ValidationProblem(errors, title: "La requête contient des erreurs.");
    }

    // "Lines[0].Quantity" -> "lines[0].quantity"
    private static string ToCamelCasePath(string path) =>
        string.Join('.', path.Split('.').Select(segment =>
        {
            var bracket = segment.IndexOf('[');
            return bracket < 0
                ? JsonNamingPolicy.CamelCase.ConvertName(segment)
                : JsonNamingPolicy.CamelCase.ConvertName(segment[..bracket]) + segment[bracket..];
        }));
}

public static class ValidationEndpointExtensions
{
    public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) where T : class
        => builder
            .AddEndpointFilter<FluentValidationFilter<T>>()
            .ProducesValidationProblem();                    // documente le 400 dans OpenAPI
}

// Utilisation :
// group.MapPost("/", CreateOrder).WithValidation<CreateOrderRequest>();
//
// Réponse :
// 400 { "title": "La requête contient des erreurs.",
//       "errors": { "lines[0].quantity": ["La quantité doit être comprise entre 1 et 100."] } }`
    }
  ],
  project: `<p><strong>DTOs, FluentValidation et ProblemDetails dans OrderFlow.Api.</strong> Remplace toutes les entités qui apparaissent encore dans les signatures des controllers et des endpoints par des DTOs en records, rangés par fonctionnalité, avec des méthodes de mapping manuel et des projections <code>Select</code> pour les lectures. Installe <code>FluentValidation.DependencyInjectionExtensions</code>, écris les validateurs de création de commande, de client et de produit, applique-les (appel explicite dans les controllers, <code>.WithValidation&lt;T&gt;()</code> dans les Minimal APIs), et configure <code>AddProblemDetails</code> avec le <code>traceId</code> et le <code>correlationId</code>. Teste chaque cas d'erreur avec le fichier <code>.http</code> et vérifie que toutes les réponses d'erreur ont le même format.</p>`,
  resources: [
    { label: "Validation des modèles dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/mvc/models/validation" },
    { label: "Gérer les erreurs dans les API (ProblemDetails)", url: "https://learn.microsoft.com/aspnet/core/fundamentals/error-handling-api" },
    { label: "Protection contre l'over-posting (tutoriel API web)", url: "https://learn.microsoft.com/aspnet/core/tutorials/first-web-api" },
    { label: "Gérer les erreurs dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/error-handling" }
  ]
});
