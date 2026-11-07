window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 4 - Créer des APIs avec ASP.NET Core
// Chapitre : HTTP et ASP.NET Core
// =====================================================================

// =====================================================================
// 4.1 HTTP en clair
// =====================================================================
window.COURSE.push({
  key: "api-http",
  title: "HTTP en clair : requêtes, réponses, verbes et codes de statut",
  summary: "Tu sauras lire et écrire une requête et une réponse HTTP, choisir le bon verbe et interpréter un code de statut.",
  objectives: [
    "Décrire les quatre parties d'une requête HTTP et les trois parties d'une réponse",
    "Choisir entre GET, POST, PUT, PATCH et DELETE",
    "Reconnaître les familles de codes de statut (2xx, 4xx, 5xx) et les codes courants",
    "Tester un endpoint avec curl et lire la réponse brute"
  ],
  analogy: `<p>HTTP, c'est comme commander au <strong>comptoir d'une boulangerie</strong>. Tu dis ce que tu veux faire (« je voudrais… », c'est le <strong>verbe</strong>), tu montres le produit (« la baguette du haut », c'est l'<strong>URL</strong>), et tu ajoutes des précisions (« bien cuite, avec un sac », ce sont les <strong>en-têtes</strong>).</p>
<p>La boulangère te répond d'abord par un mot qui résume tout : « voilà » (200), « il n'y en a plus » (404), « je ne comprends pas votre commande » (400), « le four est en panne » (500). C'est le <strong>code de statut</strong>. Ensuite seulement elle te tend le produit : c'est le <strong>corps</strong> de la réponse.</p>`,
  lesson: `<h3>Une API, c'est un serveur qui parle HTTP</h3>
<p>Côté Angular, tu écris déjà <code>this.http.get&lt;Product[]&gt;('/api/products')</code>. Ce que tu n'as pas encore vu, c'est l'autre bout du fil : le programme qui reçoit cette demande et fabrique la réponse. Ce programme, c'est une <strong>API web</strong> (une interface que d'autres programmes appellent). Dans cette partie, tu vas l'écrire en C# avec <strong>ASP.NET Core</strong>, le framework web de .NET.</p>
<p>Le client (navigateur, appli Angular, curl) et le serveur se parlent avec <strong>HTTP</strong> (HyperText Transfer Protocol) : un format de messages en texte. Le client envoie une <strong>requête</strong>, le serveur renvoie une <strong>réponse</strong>. Une requête, une réponse, et c'est fini : le serveur ne garde aucun souvenir entre deux requêtes (on dit que HTTP est <strong>sans état</strong>).</p>
<div class="flow"><span>Client Angular</span><span>Requête HTTP</span><span>API ASP.NET Core</span><span>Réponse HTTP</span></div>

<h3>Anatomie d'une requête</h3>
<p>Une requête a quatre parties : la <strong>méthode</strong> (le verbe), la <strong>cible</strong> (le chemin et la <em>query string</em>, la partie après le <code>?</code>), des <strong>en-têtes</strong> (des paires <code>Nom: valeur</code>) et parfois un <strong>corps</strong> (les données envoyées, souvent du JSON).</p>
<pre class="diagram">
POST /api/orders?notify=true HTTP/1.1   &lt;- verbe + cible
Host: localhost:5080                    &lt;- en-têtes
Content-Type: application/json
Accept-Language: fr-FR
                                        &lt;- ligne vide
{ "productId": 7, "quantity": 2 }       &lt;- corps
</pre>
<p>L'en-tête <code>Content-Type</code> dit au serveur dans quel format est le corps. <code>Accept</code> dit dans quel format le client veut la réponse. En Angular, <code>HttpClient</code> ajoute ces en-têtes pour toi.</p>

<h3>Anatomie d'une réponse</h3>
<p>Une réponse a trois parties : la <strong>ligne de statut</strong> (version, code, petite phrase), des en-têtes, et un corps éventuel.</p>
<pre class="diagram">
HTTP/1.1 201 Created                    &lt;- statut
Content-Type: application/json          &lt;- en-têtes
Location: /api/orders/1001

{ "id": 1001, "status": "Pending" }     &lt;- corps
</pre>
<p>Le code de statut est la première chose que lit un client. C'est lui qui dit si l'appel a réussi, pas le corps. Un <code>200</code> avec <code>{ "error": "introuvable" }</code> dans le corps est une mauvaise réponse : Angular passera dans le <code>next</code> de ton <code>subscribe</code> au lieu du <code>error</code>.</p>

<h3>Les verbes</h3>
<p>Le verbe dit ce que tu veux <em>faire</em> sur la ressource. Deux propriétés comptent. Un verbe est <strong>sûr</strong> s'il ne modifie rien sur le serveur. Il est <strong>idempotent</strong> si l'envoyer une fois ou dix fois laisse le serveur dans le même état : on peut alors le renvoyer sans risque après une coupure réseau.</p>
<table>
<tr><th>Verbe</th><th>Usage</th><th>Sûr</th><th>Idempotent</th><th>Corps</th></tr>
<tr><td>GET</td><td>Lire</td><td>Oui</td><td>Oui</td><td>Non</td></tr>
<tr><td>POST</td><td>Créer, déclencher une action</td><td>Non</td><td>Non</td><td>Oui</td></tr>
<tr><td>PUT</td><td>Remplacer entièrement</td><td>Non</td><td>Oui</td><td>Oui</td></tr>
<tr><td>PATCH</td><td>Modifier une partie</td><td>Non</td><td>Pas forcément</td><td>Oui</td></tr>
<tr><td>DELETE</td><td>Supprimer</td><td>Non</td><td>Oui</td><td>Rarement</td></tr>
</table>
<p>Pourquoi POST n'est pas idempotent ? Envoyer deux fois « crée une commande » crée deux commandes. Supprimer deux fois la commande 1001, en revanche, laisse le même état : elle n'existe plus.</p>

<h3>Les codes de statut</h3>
<p>Le premier chiffre donne la famille. Retiens-la avant les détails : <strong>2xx</strong> = succès, <strong>3xx</strong> = va voir ailleurs, <strong>4xx</strong> = c'est la faute du client, <strong>5xx</strong> = c'est la faute du serveur.</p>
<table>
<tr><th>Code</th><th>Sens</th><th>Exemple</th></tr>
<tr><td>200 OK</td><td>Succès avec un corps</td><td>GET d'un produit</td></tr>
<tr><td>201 Created</td><td>Ressource créée</td><td>POST d'une commande</td></tr>
<tr><td>204 No Content</td><td>Succès sans corps</td><td>DELETE réussi</td></tr>
<tr><td>400 Bad Request</td><td>Requête invalide</td><td>Quantité négative</td></tr>
<tr><td>401 / 403</td><td>Pas connecté / pas le droit</td><td>Jeton absent / rôle insuffisant</td></tr>
<tr><td>404 Not Found</td><td>Introuvable</td><td>Produit 999</td></tr>
<tr><td>405 Method Not Allowed</td><td>Verbe non géré sur cette URL</td><td>POST sur une route GET</td></tr>
<tr><td>409 Conflict</td><td>Conflit avec l'état actuel</td><td>Email déjà utilisé</td></tr>
<tr><td>500 Internal Server Error</td><td>Bug côté serveur</td><td>Exception non gérée</td></tr>
</table>
<div class="tip">Pour voir la réponse brute, utilise <code>curl -i URL</code> (le <code>-i</code> affiche le statut et les en-têtes). Visual Studio, VS Code et Rider savent aussi exécuter des fichiers <code>.http</code> qui contiennent tes requêtes. Pour tester les exemples : <code>dotnet new web -n Demo</code>, colle le code dans <code>Program.cs</code>, lance <code>dotnet run</code> et appelle l'adresse affichée (dans ce cours : <code>http://localhost:5080</code>). La leçon 3 détaille ce code.</div>
<div class="note">L'idempotence n'est pas qu'une théorie. Les clients HTTP, les proxys et les bibliothèques de résilience rejouent automatiquement les requêtes idempotentes en cas d'erreur réseau. Si ton PUT ou ton DELETE ont des effets de bord (envoyer un email à chaque appel), tu casses cette garantie.</div>`,
  examples: [
    {
      title: "Une requête, une réponse brute",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// GET /hello renvoie un simple texte
app.MapGet("/hello", () => "Bonjour !");

app.Run();`,
      output: `$ curl -i http://localhost:5080/hello
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8
Date: Sat, 07 Nov 2026 00:17:27 GMT
Server: Kestrel
Transfer-Encoding: chunked

Bonjour !

$ curl -i -X POST http://localhost:5080/hello
HTTP/1.1 405 Method Not Allowed
Content-Length: 0
Date: Sat, 07 Nov 2026 00:17:27 GMT
Server: Kestrel
Allow: GET

$ curl -i http://localhost:5080/bye
HTTP/1.1 404 Not Found
Content-Length: 0
Date: Sat, 07 Nov 2026 00:17:27 GMT
Server: Kestrel`,
      steps: [
        "<code>app.MapGet(\"/hello\", ...)</code> : on déclare qu'une requête <strong>GET</strong> sur le chemin <code>/hello</code> est gérée par cette petite fonction.",
        "<code>() =&gt; \"Bonjour !\"</code> : la fonction renvoie une string. ASP.NET Core en fait un corps texte avec <code>Content-Type: text/plain</code> et le statut 200.",
        "<code>Server: Kestrel</code> : c'est le nom du serveur web intégré à ASP.NET Core qui a répondu.",
        "<code>curl -i -X POST</code> : le chemin existe mais pas pour POST. Le serveur répond <code>405</code> et l'en-tête <code>Allow: GET</code> indique les verbes acceptés.",
        "<code>/bye</code> : aucune route ne correspond, le serveur répond <code>404</code> sans corps."
      ],
      explain: "Tu n'as écrit qu'une ligne utile, et le framework a choisi tout seul 200, 404 ou 405."
    },
    {
      title: "Ce que le serveur reçoit vraiment",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Renvoie ce que le serveur a reçu
app.MapPost("/echo", async (HttpRequest request) =>
{
    using var reader = new StreamReader(request.Body);
    string body = await reader.ReadToEndAsync();

    return new
    {
        Method = request.Method,
        Path = request.Path.Value,
        Query = request.QueryString.Value,
        ContentType = request.ContentType,
        Language = request.Headers.AcceptLanguage.ToString(),
        Body = body
    };
});

app.Run();`,
      output: `$ curl -i -X POST "http://localhost:5080/echo?notify=true" -H "Content-Type: application/json" -H "Accept-Language: fr-FR" -d '{"productId":7,"quantity":2}'
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"method":"POST","path":"/echo","query":"?notify=true","contentType":"application/json","language":"fr-FR","body":"{\\"productId\\":7,\\"quantity\\":2}"}`,
      steps: [
        "<code>app.MapPost(\"/echo\", ...)</code> : cette route ne répond qu'aux requêtes POST.",
        "<code>(HttpRequest request)</code> : ASP.NET Core te donne l'objet qui représente la requête entière. Tu demandes, il fournit.",
        "<code>new StreamReader(request.Body)</code> : le corps arrive comme un flux d'octets. On le lit en texte avec <code>ReadToEndAsync</code>.",
        "<code>request.QueryString.Value</code> et <code>request.Headers.AcceptLanguage</code> : la query string et un en-tête, exactement comme dans le schéma de la leçon.",
        "<code>return new { ... }</code> : un objet anonyme est automatiquement converti en JSON. Les noms passent en camelCase (<code>Method</code> devient <code>method</code>), comme en TypeScript.",
        "Dans la sortie, on n'a gardé que les en-têtes utiles. <code>Date</code>, <code>Server</code> et <code>Transfer-Encoding</code> sont toujours là, mais on les omettra désormais."
      ]
    },
    {
      title: "Un endpoint, trois codes de statut",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

string[] products = ["Clavier", "Souris", "Écran"];

// Un endpoint, trois réponses possibles
app.MapGet("/products/{id:int}", (int id) =>
{
    if (id <= 0)
        return Results.BadRequest("L'id doit être positif.");

    if (id > products.Length)
        return Results.NotFound();

    return Results.Ok(new { Id = id, Name = products[id - 1] });
});

app.Run();`,
      output: `$ curl -i http://localhost:5080/products/2
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":2,"name":"Souris"}

$ curl -i http://localhost:5080/products/99
HTTP/1.1 404 Not Found
Content-Length: 0

$ curl -i http://localhost:5080/products/0
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

"L'id doit être positif."

$ curl -i http://localhost:5080/products/abc
HTTP/1.1 404 Not Found
Content-Length: 0`,
      steps: [
        "<code>\"/products/{id:int}\"</code> : <code>{id}</code> est un <strong>paramètre de route</strong>, et <code>:int</code> une <strong>contrainte</strong> : la route ne correspond que si ce morceau est un entier.",
        "<code>(int id)</code> : la valeur trouvée dans l'URL est convertie et passée à la fonction, comme <code>ActivatedRoute</code> te donne les paramètres en Angular.",
        "<code>Results.BadRequest(...)</code> : le client a envoyé une valeur absurde, c'est un 400 (faute du client).",
        "<code>Results.NotFound()</code> : la valeur est valide mais le produit n'existe pas : 404.",
        "<code>Results.Ok(...)</code> : succès, 200 avec le produit en JSON.",
        "<code>/products/abc</code> : la contrainte <code>:int</code> refuse \"abc\", donc aucune route ne correspond : 404 sans même entrer dans la fonction."
      ],
      explain: "Choisir le bon code, c'est dire au client ce qui s'est passé avant même qu'il lise le corps."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Le bon verbe, le bon code",
      prompt: `<p>Pour chaque situation, écris le verbe HTTP et le code de statut attendu : (1) lire la liste des produits ; (2) créer un client ; (3) supprimer la commande 1001 qui existe ; (4) lire le produit 999 qui n'existe pas ; (5) créer un client avec un email déjà pris. Mets tes réponses en commentaires dans un fichier C#, puis affiche-les avec <code>Console.WriteLine</code>.</p>`,
      hint: `<p>Création réussie : 201. Suppression sans corps : 204. Conflit avec une donnée existante : 409.</p>`,
      solution: `string[] answers =
[
    "1. GET    -> 200 OK",
    "2. POST   -> 201 Created",
    "3. DELETE -> 204 No Content",
    "4. GET    -> 404 Not Found",
    "5. POST   -> 409 Conflict"
];

foreach (var answer in answers)
    Console.WriteLine(answer);`
    },
    {
      level: "moyen",
      title: "Lire un en-tête et la query string",
      prompt: `<p>Écris une API avec <code>GET /greet?name=Ana</code>. Elle répond <code>Bonjour Ana</code> si l'en-tête <code>Accept-Language</code> commence par <code>fr</code>, sinon <code>Hello Ana</code>. Si <code>name</code> est absent, réponds 400. Teste avec <code>curl -i "http://localhost:5080/greet?name=Ana" -H "Accept-Language: fr-FR"</code>.</p>`,
      hint: `<p>Déclare <code>string? name</code> et <code>HttpRequest request</code> en paramètres. <code>request.Headers.AcceptLanguage.ToString()</code> donne le texte de l'en-tête.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/greet", (string? name, HttpRequest request) =>
{
    if (string.IsNullOrWhiteSpace(name))
        return Results.BadRequest("Le paramètre name est obligatoire.");

    string language = request.Headers.AcceptLanguage.ToString();
    string word = language.StartsWith("fr") ? "Bonjour" : "Hello";
    return Results.Ok($"{word} {name}");
});

app.Run();`
    },
    {
      level: "difficile",
      title: "Un stock qui répond juste",
      prompt: `<p>Crée <code>GET /stock/{productId:int}</code> avec un dictionnaire en mémoire (<code>{ 1: 12, 2: 0 }</code>). Réponds 404 si le produit est inconnu, 200 avec <code>{ productId, quantity, available }</code> sinon. Ajoute <code>DELETE /stock/{productId:int}</code> qui retire le produit du dictionnaire et répond 204, puis vérifie qu'un second DELETE renvoie 404 : l'état du serveur n'a pas changé, c'est bien idempotent.</p>`,
      hint: `<p><code>Dictionary.TryGetValue</code> pour lire, <code>Remove</code> renvoie <code>true</code> si la clé existait.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

Dictionary<int, int> stock = new() { [1] = 12, [2] = 0 };

app.MapGet("/stock/{productId:int}", (int productId) =>
    stock.TryGetValue(productId, out int quantity)
        ? Results.Ok(new { productId, quantity, available = quantity > 0 })
        : Results.NotFound());

app.MapDelete("/stock/{productId:int}", (int productId) =>
    stock.Remove(productId) ? Results.NoContent() : Results.NotFound());

app.Run();`
    }
  ],
  quiz: [
    {
      q: `Où se trouve le code de statut dans une réponse HTTP ?`,
      options: ["Dans le corps JSON", "Dans la première ligne, la ligne de statut", "Dans l'en-tête <code>Content-Type</code>"],
      answer: 1,
      why: `Le code est dans la ligne de statut (<code>HTTP/1.1 404 Not Found</code>). Le mettre dans le corps est un piège classique : le client verrait un succès.`
    },
    {
      q: `Quel verbe n'est <strong>pas</strong> idempotent ?`,
      options: ["PUT", "DELETE", "GET", "POST"],
      answer: 3,
      why: `Chaque POST de création crée une nouvelle ressource : deux envois, deux commandes. PUT remplace par la même chose, DELETE supprime ce qui est déjà supprimé, GET ne change rien.`
    },
    {
      q: `Ton API plante sur une exception non gérée. Quel code reçoit le client ?`,
      options: ["500", "400", "404"],
      answer: 0,
      why: `Les 5xx signalent une erreur du serveur. 400 et 404 sont des 4xx : ils disent que c'est la requête du client qui pose problème.`
    },
    {
      q: `Que veut dire <code>405 Method Not Allowed</code> ?`,
      options: ["La ressource n'existe pas", "L'URL existe mais pas avec ce verbe", "Le client n'est pas connecté"],
      answer: 1,
      why: `Le chemin correspond à une route, mais pas pour ce verbe. La réponse contient un en-tête <code>Allow</code> qui liste les verbes acceptés. Une URL inconnue donnerait 404, un client non connecté 401.`
    }
  ],
  project: `<p><strong>OrderFlow : le contrat HTTP.</strong> Avant d'écrire l'API, écris son contrat. Crée un fichier <code>OrderFlow.http</code> (ou un simple fichier texte) et liste les appels que l'API acceptera, avec le code attendu : lire tous les produits (GET, 200), lire un produit (GET, 200 ou 404), créer un produit (POST, 201 ou 400), lire une commande (GET, 200 ou 404), annuler une commande déjà expédiée (quel code ? indice : conflit avec l'état actuel).</p>
<p>Pour chaque ligne, note aussi si la requête a un corps. Tu compléteras les URLs exactes dans la leçon suivante.</p>`,
  resources: [
    { label: "Vue d'ensemble de HTTP (MDN)", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Overview" },
    { label: "Codes de réponse HTTP (MDN)", url: "https://developer.mozilla.org/fr/docs/Web/HTTP/Status" }
  ]
});

// =====================================================================
// 4.2 Concevoir une API REST
// =====================================================================
window.COURSE.push({
  key: "api-rest",
  title: "Concevoir une API REST : ressources, URLs et bonnes réponses",
  summary: "Tu sauras dessiner les URLs d'une API REST et renvoyer la bonne réponse pour chaque opération (200, 201 + Location, 204, 400, 404).",
  objectives: [
    "Identifier les ressources d'une application et les nommer en URL",
    "Associer chaque opération CRUD à un verbe et une URL",
    "Renvoyer 201 avec l'en-tête Location après une création",
    "Utiliser la query string pour filtrer, trier et paginer"
  ],
  analogy: `<p>Pense à une <strong>médiathèque bien rangée</strong>. Chaque rayon a un nom au pluriel (« Romans », « BD ») et chaque document a une cote unique. Pour tout ce que tu veux faire, tu utilises les mêmes gestes : consulter, ajouter, remplacer, retirer.</p>
<p>REST, c'est la même idée : les <strong>URLs sont les rayons et les cotes</strong>, les <strong>verbes HTTP sont les gestes</strong>. Tu n'inventes pas un nouveau guichet pour chaque action.</p>`,
  lesson: `<h3>REST en une phrase</h3>
<p><strong>REST</strong> (REpresentational State Transfer) est un style pour concevoir une API : on expose des <strong>ressources</strong> (des choses : produits, clients, commandes), chacune avec une URL, et on agit dessus avec les verbes HTTP standard. Ce n'est pas une bibliothèque, c'est un ensemble de conventions. Les respecter rend ton API prévisible : un développeur Angular devine tes URLs avant de lire la doc.</p>

<h3>Des noms, pas des verbes, dans l'URL</h3>
<p>L'URL désigne <em>quoi</em>, le verbe HTTP dit <em>quoi faire</em>. On utilise des noms au pluriel, en minuscules, avec des tirets si besoin. Une collection et un élément ont chacun leur URL.</p>
<div class="compare"><div><h4>À éviter</h4><p><code>GET /getAllProducts</code><br><code>POST /createProduct</code><br><code>POST /deleteProduct?id=3</code><br><code>GET /api/Product_List</code></p></div><div><h4>REST</h4><p><code>GET /api/products</code><br><code>POST /api/products</code><br><code>DELETE /api/products/3</code><br><code>GET /api/products</code></p></div></div>
<p>Quand une ressource appartient à une autre, on peut imbriquer : <code>/api/customers/42/orders</code> = les commandes du client 42. Ne descends pas plus de deux niveaux : <code>/api/orders/1001/lines</code> suffit, pas besoin de <code>/api/customers/42/orders/1001/lines</code>.</p>

<h3>Le tableau CRUD à connaître</h3>
<p><strong>CRUD</strong>, ce sont les quatre opérations de base : Create, Read, Update, Delete. En REST, elles tombent toujours sur les mêmes couples verbe + URL.</p>
<table>
<tr><th>Opération</th><th>Verbe et URL</th><th>Succès</th><th>Erreurs courantes</th></tr>
<tr><td>Lister</td><td><code>GET /api/products</code></td><td>200 + liste (même vide)</td><td>400 si filtre invalide</td></tr>
<tr><td>Lire un</td><td><code>GET /api/products/3</code></td><td>200 + élément</td><td>404</td></tr>
<tr><td>Créer</td><td><code>POST /api/products</code></td><td>201 + <code>Location</code> + élément</td><td>400, 409</td></tr>
<tr><td>Remplacer</td><td><code>PUT /api/products/3</code></td><td>204 (ou 200 + élément)</td><td>400, 404</td></tr>
<tr><td>Supprimer</td><td><code>DELETE /api/products/3</code></td><td>204</td><td>404</td></tr>
</table>
<div class="tip">Une liste vide n'est pas une erreur : <code>GET /api/products?inStock=true</code> sans résultat renvoie <code>200</code> avec <code>[]</code>, pas 404. Le 404 est réservé à une ressource précise qui n'existe pas.</div>

<h3>201 Created et l'en-tête Location</h3>
<p>Après une création, le serveur a fabriqué une nouvelle ressource avec un nouvel id. Il répond <code>201 Created</code>, renvoie l'élément créé dans le corps, et indique son adresse dans l'en-tête <code>Location</code>. Le client sait ainsi où la retrouver.</p>
<div class="flow"><span>POST /api/products</span><span>201 Created</span><span>Location: /api/products/4</span><span>GET /api/products/4</span></div>

<h3>La query string pour filtrer, trier, paginer</h3>
<p>Ce qui <em>identifie</em> une ressource va dans le chemin (<code>/products/3</code>). Ce qui <em>affine</em> une liste va dans la query string : <code>?inStock=true</code>, <code>?sort=price</code>, <code>?page=2&amp;pageSize=20</code>. Dans ASP.NET Core, un paramètre de ta fonction qui n'est pas dans la route est automatiquement cherché dans la query string.</p>

<h3>Le même contrat vu d'Angular</h3>
<p>Une API REST propre donne un service Angular très régulier : <code>getAll()</code> fait <code>http.get('/api/products')</code>, <code>create(p)</code> fait <code>http.post('/api/products', p)</code>, <code>update(id, p)</code> fait <code>http.put(\`/api/products/\${id}\`, p)</code>, <code>remove(id)</code> fait <code>http.delete(\`/api/products/\${id}\`)</code>. Si ton service Angular contient des URLs bizarres, c'est souvent l'API qui est mal conçue.</p>
<p>Pour les données envoyées, on sépare souvent le modèle d'entrée du modèle stocké : le client envoie un <code>ProductInput</code> (sans id), le serveur répond avec un <code>Product</code> (avec id). On approfondira ces <strong>DTO</strong> (Data Transfer Objects, des classes faites pour voyager) plus loin dans la partie.</p>
<div class="note">Préfixe tes routes par <code>/api</code> : le front Angular et l'API peuvent ainsi vivre sur le même domaine sans collision, et le proxy de développement d'Angular (<code>proxy.conf.json</code>) n'a qu'une règle à connaître. Pense aussi dès le départ au versionnement (<code>/api/v1/...</code> ou un en-tête) si d'autres équipes consomment ton API.</div>`,
  examples: [
    {
      title: "Lire la collection et un élément",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<Product> products =
[
    new(1, "Clavier", 49.90m, 12),
    new(2, "Souris", 19.90m, 0),
    new(3, "Écran 27 pouces", 229.00m, 4)
];

// La collection, avec un filtre optionnel dans la query string
app.MapGet("/api/products", (bool? inStock) =>
    inStock == true ? products.Where(p => p.Stock > 0) : products);

// Un élément de la collection
app.MapGet("/api/products/{id:int}", (int id) =>
{
    var product = products.FirstOrDefault(p => p.Id == id);
    return product is null ? Results.NotFound() : Results.Ok(product);
});

app.Run();

record Product(int Id, string Name, decimal Price, int Stock);`,
      output: `$ curl -i "http://localhost:5080/api/products?inStock=true"
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"name":"Clavier","price":49.90,"stock":12},{"id":3,"name":"Écran 27 pouces","price":229.00,"stock":4}]

$ curl -i http://localhost:5080/api/products/3
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":3,"name":"Écran 27 pouces","price":229.00,"stock":4}

$ curl -i http://localhost:5080/api/products/42
HTTP/1.1 404 Not Found
Content-Length: 0`,
      steps: [
        "<code>record Product(...)</code> : un record (vu en partie 1) est parfait pour transporter une donnée. Il est converti en JSON automatiquement.",
        "<code>(bool? inStock)</code> : <code>inStock</code> n'est pas dans la route, donc ASP.NET Core le lit dans la query string. Le <code>?</code> le rend facultatif : absent, il vaut <code>null</code>.",
        "<code>products.Where(p =&gt; p.Stock &gt; 0)</code> : du LINQ classique. Le framework sérialise le résultat en tableau JSON.",
        "<code>\"/api/products/{id:int}\"</code> : l'élément est identifié dans le chemin, pas dans la query string.",
        "<code>product is null ? Results.NotFound() : Results.Ok(product)</code> : 404 si l'id n'existe pas, 200 avec l'élément sinon."
      ]
    },
    {
      title: "Créer : 201, Location, ou 400",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<Product> products = [new(1, "Clavier", 49.90m, 12)];

// POST sur la collection = créer un élément
app.MapPost("/api/products", (ProductInput input) =>
{
    if (string.IsNullOrWhiteSpace(input.Name) || input.Price <= 0)
        return Results.BadRequest("Nom obligatoire et prix positif.");

    var product = new Product(products.Max(p => p.Id) + 1, input.Name, input.Price, input.Stock);
    products.Add(product);

    // 201 Created + en-tête Location vers la nouvelle ressource
    return Results.Created($"/api/products/{product.Id}", product);
});

app.Run();

record Product(int Id, string Name, decimal Price, int Stock);
record ProductInput(string Name, decimal Price, int Stock);`,
      output: `$ curl -i -X POST http://localhost:5080/api/products -H "Content-Type: application/json" -d '{"name":"Webcam","price":59.00,"stock":8}'
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/products/2

{"id":2,"name":"Webcam","price":59.00,"stock":8}

$ curl -i -X POST http://localhost:5080/api/products -H "Content-Type: application/json" -d '{"name":"","price":0,"stock":1}'
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

"Nom obligatoire et prix positif."`,
      steps: [
        "<code>(ProductInput input)</code> : un paramètre de type complexe est lu dans le <strong>corps JSON</strong>. <code>\"name\"</code> remplit <code>Name</code> : la correspondance ignore la casse.",
        "<code>record ProductInput</code> : le client n'envoie pas d'id, c'est le serveur qui le choisit. D'où deux records distincts.",
        "<code>Results.BadRequest(...)</code> : on refuse une donnée invalide avant de toucher à la liste.",
        "<code>products.Max(p =&gt; p.Id) + 1</code> : un id calculé à la main, juste pour l'exemple. Une base de données le fera pour toi en partie 3.",
        "<code>Results.Created($\"/api/products/{product.Id}\", product)</code> : statut 201, en-tête <code>Location</code> et l'élément créé dans le corps."
      ],
      explain: "On verra plus loin une validation automatique et des messages d'erreur standard ; ici, l'important est le bon code."
    },
    {
      title: "Remplacer et supprimer : 204 ou 404",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<Product> products = [new(1, "Clavier", 49.90m, 12), new(2, "Souris", 19.90m, 0)];

// PUT = remplacer entièrement la ressource
app.MapPut("/api/products/{id:int}", (int id, ProductInput input) =>
{
    int index = products.FindIndex(p => p.Id == id);
    if (index == -1) return Results.NotFound();

    products[index] = new Product(id, input.Name, input.Price, input.Stock);
    return Results.NoContent();
});

// DELETE = supprimer la ressource
app.MapDelete("/api/products/{id:int}", (int id) =>
{
    int removed = products.RemoveAll(p => p.Id == id);
    return removed == 0 ? Results.NotFound() : Results.NoContent();
});

app.MapGet("/api/products", () => products);

app.Run();

record Product(int Id, string Name, decimal Price, int Stock);
record ProductInput(string Name, decimal Price, int Stock);`,
      output: `$ curl -i -X PUT http://localhost:5080/api/products/2 -H "Content-Type: application/json" -d '{"name":"Souris sans fil","price":24.90,"stock":30}'
HTTP/1.1 204 No Content

$ curl -i -X DELETE http://localhost:5080/api/products/1
HTTP/1.1 204 No Content

$ curl -i -X DELETE http://localhost:5080/api/products/1
HTTP/1.1 404 Not Found
Content-Length: 0

$ curl -i http://localhost:5080/api/products
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":2,"name":"Souris sans fil","price":24.90,"stock":30}]`,
      steps: [
        "<code>(int id, ProductInput input)</code> : l'id vient de la route, les nouvelles valeurs du corps. ASP.NET Core sait trouver chacun au bon endroit.",
        "<code>products[index] = new Product(...)</code> : PUT <strong>remplace</strong> tout l'élément. Un champ oublié dans le corps prendrait sa valeur par défaut.",
        "<code>Results.NoContent()</code> : 204, succès sans corps. Le client sait déjà ce qu'il a envoyé.",
        "<code>products.RemoveAll(...)</code> : renvoie le nombre d'éléments supprimés, 0 si l'id n'existait pas.",
        "Le second DELETE répond 404, mais l'état du serveur est le même qu'après le premier : DELETE reste idempotent."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Corriger des URLs",
      prompt: `<p>Réécris ces routes à la manière REST (verbe + URL) et affiche-les dans la console : <code>POST /getCustomers</code>, <code>POST /customer/add</code>, <code>GET /deleteOrder?id=7</code>, <code>POST /updateProductPrice/3</code> (remplacement complet), <code>GET /ordersOfCustomer?customerId=42</code>.</p>`,
      hint: `<p>Des noms au pluriel, l'id dans le chemin, le verbe HTTP porte l'action.</p>`,
      solution: `string[] routes =
[
    "GET    /api/customers",
    "POST   /api/customers",
    "DELETE /api/orders/7",
    "PUT    /api/products/3",
    "GET    /api/customers/42/orders"
];

foreach (var route in routes)
    Console.WriteLine(route);`
    },
    {
      level: "moyen",
      title: "Une collection de clients",
      prompt: `<p>Crée <code>record Customer(int Id, string Name, string Email)</code> et une liste en mémoire. Écris <code>GET /api/customers</code>, <code>GET /api/customers/{id:int}</code> (404 si absent) et <code>POST /api/customers</code> qui renvoie 201 avec <code>Location</code>. Refuse (400) un email sans <code>@</code>.</p>`,
      hint: `<p>Utilise un <code>record CustomerInput(string Name, string Email)</code> pour le corps du POST, et <code>Results.Created</code>.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<Customer> customers = [new(1, "Ana", "ana@mail.com")];

app.MapGet("/api/customers", () => customers);

app.MapGet("/api/customers/{id:int}", (int id) =>
    customers.FirstOrDefault(c => c.Id == id) is { } customer
        ? Results.Ok(customer)
        : Results.NotFound());

app.MapPost("/api/customers", (CustomerInput input) =>
{
    if (!input.Email.Contains('@'))
        return Results.BadRequest("Email invalide.");

    var customer = new Customer(customers.Max(c => c.Id) + 1, input.Name, input.Email);
    customers.Add(customer);
    return Results.Created($"/api/customers/{customer.Id}", customer);
});

app.Run();

record Customer(int Id, string Name, string Email);
record CustomerInput(string Name, string Email);`
    },
    {
      level: "difficile",
      title: "Pagination et conflit",
      prompt: `<p>Reprends l'exercice précédent. (1) Ajoute à <code>GET /api/customers</code> les paramètres <code>page</code> (défaut 1) et <code>pageSize</code> (défaut 10, 400 si supérieur à 50). (2) Dans le POST, renvoie <code>409 Conflict</code> si un client a déjà cet email (sans tenir compte de la casse).</p>`,
      hint: `<p><code>int page = 1</code> en paramètre donne une valeur par défaut. Pagine avec <code>Skip((page - 1) * pageSize).Take(pageSize)</code>. Pour 409 : <code>Results.Conflict(...)</code>.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<Customer> customers = [new(1, "Ana", "ana@mail.com")];

app.MapGet("/api/customers", (int page = 1, int pageSize = 10) =>
{
    if (page < 1 || pageSize < 1 || pageSize > 50)
        return Results.BadRequest("page >= 1 et pageSize entre 1 et 50.");

    return Results.Ok(customers.Skip((page - 1) * pageSize).Take(pageSize));
});

app.MapPost("/api/customers", (CustomerInput input) =>
{
    if (!input.Email.Contains('@'))
        return Results.BadRequest("Email invalide.");

    if (customers.Any(c => c.Email.Equals(input.Email, StringComparison.OrdinalIgnoreCase)))
        return Results.Conflict("Cet email est déjà utilisé.");

    var customer = new Customer(customers.Max(c => c.Id) + 1, input.Name, input.Email);
    customers.Add(customer);
    return Results.Created($"/api/customers/{customer.Id}", customer);
});

app.Run();

record Customer(int Id, string Name, string Email);
record CustomerInput(string Name, string Email);`
    }
  ],
  quiz: [
    {
      q: `Quelle URL respecte les conventions REST pour lire les commandes du client 42 ?`,
      options: ["<code>GET /api/getOrders?customer=42</code>", "<code>POST /api/customers/42/orders/list</code>", "<code>GET /api/customers/42/orders</code>"],
      answer: 2,
      why: `Des noms au pluriel, l'id dans le chemin, et GET pour lire. Les deux autres mettent un verbe dans l'URL et la seconde utilise POST pour une lecture.`
    },
    {
      q: `Après un <code>POST /api/products</code> réussi, que renvoie une API bien conçue ?`,
      options: ["201 Created, l'en-tête Location et l'élément créé", "200 OK et le texte \"créé\"", "204 No Content"],
      answer: 0,
      why: `201 dit « une ressource est née », <code>Location</code> dit où la trouver, et le corps évite au client un second appel pour connaître l'id. 204 ne permettrait pas de connaître l'id.`
    },
    {
      q: `<code>GET /api/products?inStock=true</code> ne trouve aucun produit. Que répondre ?`,
      options: ["404 Not Found", "200 OK avec <code>[]</code>", "400 Bad Request"],
      answer: 1,
      why: `La collection existe, elle est juste vide pour ce filtre. 404 ferait croire au client que l'URL est fausse.`
    },
    {
      q: `Dans <code>app.MapPut("/api/products/{id:int}", (int id, ProductInput input) =&gt; ...)</code>, d'où vient <code>input</code> ?`,
      options: ["De la query string", "Du corps JSON de la requête", "D'un en-tête HTTP"],
      answer: 1,
      why: `<code>id</code> est dans la route, il vient du chemin. Un type complexe comme <code>ProductInput</code> est lu par défaut dans le corps JSON.`
    }
  ],
  project: `<p><strong>OrderFlow : dessiner les URLs.</strong> Reprends ton contrat de la leçon précédente et écris les routes exactes pour les ressources <code>Customers</code>, <code>Products</code> et <code>Orders</code> : liste, détail, création, remplacement, suppression. Ajoute <code>GET /api/customers/{id}/orders</code> et <code>GET /api/orders/{id}/lines</code>.</p>
<p>Pour l'annulation d'une commande, choisis : <code>PUT /api/orders/{id}</code> avec un nouveau <code>Status</code>, ou une sous-ressource <code>POST /api/orders/{id}/cancel</code>. Note en une phrase pourquoi (indice : une action métier avec des règles, ce n'est pas un simple remplacement).</p>`,
  resources: [
    { label: "Conception d'API web RESTful (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/azure/architecture/best-practices/api-design" }
  ]
});

// =====================================================================
// 4.3 Ta première API
// =====================================================================
window.COURSE.push({
  key: "api-first-app",
  title: "Ta première API : Program.cs, WebApplication et Kestrel",
  summary: "Tu sauras créer un projet ASP.NET Core, comprendre chaque ligne de Program.cs et lancer ton API sur Kestrel.",
  objectives: [
    "Créer un projet avec dotnet new web et reconnaître ses fichiers",
    "Distinguer la phase builder (configuration) et la phase app (requêtes)",
    "Comprendre le rôle de Kestrel, des ports et de launchSettings.json",
    "Déclarer des endpoints avec MapGet, MapPost et MapGroup"
  ],
  analogy: `<p>Ouvrir une API, c'est comme ouvrir un <strong>restaurant</strong>. D'abord la <strong>préparation</strong> : tu embauches le personnel, tu remplis les frigos, tu fixes les réglages (le <code>builder</code>). Puis tu <strong>ouvres le restaurant</strong> (<code>Build()</code>) et tu affiches la <strong>carte</strong> : tel plat, telle recette (les <code>Map...</code>).</p>
<p>Enfin le <strong>serveur à l'entrée</strong> accueille les clients et transmet les commandes à la cuisine : c'est <strong>Kestrel</strong>, lancé par <code>Run()</code>. Une fois la porte ouverte, on n'embauche plus : on sert.</p>`,
  lesson: `<h3>Créer le projet</h3>
<p>Une commande suffit : <code>dotnet new web -n OrderFlow.Api</code>. Le modèle <code>web</code> crée l'API la plus petite possible. (Le modèle <code>webapi</code> ajoute un exemple et la génération de documentation OpenAPI, on le verra plus tard.) Voici ce que tu obtiens :</p>
<pre class="diagram">
OrderFlow.Api/
 +-- OrderFlow.Api.csproj    projet (SDK Web, net10.0)
 +-- Program.cs              point d'entrée, 4 lignes
 +-- appsettings.json        configuration
 +-- appsettings.Development.json
 +-- Properties/
      +-- launchSettings.json  ports, environnement
</pre>
<p>Le <code>.csproj</code> commence par <code>&lt;Project Sdk="Microsoft.NET.Sdk.Web"&gt;</code> : ce SDK Web donne accès à tout ASP.NET Core sans installer de package. Lance ensuite <code>dotnet run</code> (ou <code>dotnet watch</code> pour redémarrer à chaque modification, comme <code>ng serve</code>).</p>

<h3>Program.cs en quatre temps</h3>
<p>Le modèle génère quatre lignes. Elles suivent toujours le même ordre :</p>
<div class="flow"><span>CreateBuilder</span><span>Build</span><span>Map...</span><span>Run</span></div>
<p><code>WebApplication.CreateBuilder(args)</code> prépare tout : lecture de la configuration, logs, conteneur de services. <code>builder.Build()</code> fige ces réglages et fabrique la <code>WebApplication</code>. Les <code>app.Map...</code> déclarent les <strong>endpoints</strong> (un endpoint = un verbe + une URL + le code qui répond). <code>app.Run()</code> démarre le serveur et bloque jusqu'à l'arrêt (Ctrl+C).</p>
<p>C'est l'équivalent de <code>main.ts</code> en Angular : <code>bootstrapApplication(AppComponent, appConfig)</code> rassemble la configuration puis démarre l'application. Ici, Program.cs fait les deux.</p>

<h3>builder ou app : deux phases</h3>
<div class="compare"><div><h4>builder (WebApplicationBuilder)</h4><p>Avant <code>Build()</code>. On <strong>configure</strong> : <code>builder.Services</code> (les services), <code>builder.Configuration</code> (les réglages), <code>builder.Environment</code>, <code>builder.Logging</code>.</p></div><div><h4>app (WebApplication)</h4><p>Après <code>Build()</code>. On décrit le <strong>traitement des requêtes</strong> : les middlewares (<code>app.Use...</code>, leçon suivante) et les endpoints (<code>app.Map...</code>).</p></div></div>
<div class="tip">Après <code>Build()</code>, ajouter un service avec <code>builder.Services.Add...</code> lève une exception : la liste des services est en lecture seule. Tout ce qui concerne les services se fait <strong>avant</strong> <code>Build()</code>.</div>

<h3>Kestrel, le serveur intégré</h3>
<p><strong>Kestrel</strong> est le serveur web livré avec ASP.NET Core. Il ouvre un <strong>port</strong> (un numéro de « porte » sur ta machine, comme 5080), écoute les connexions, lit les requêtes HTTP et les passe à ton code. Pas besoin d'IIS ni d'Apache : ton API est un simple programme console qui contient son serveur.</p>
<p>D'où vient le port ? En développement, <code>dotnet run</code> lit <code>Properties/launchSettings.json</code> : le champ <code>applicationUrl</code> (par exemple <code>http://localhost:5080</code>) et la variable <code>ASPNETCORE_ENVIRONMENT</code> (<code>Development</code>). Tu peux aussi forcer l'adresse avec <code>dotnet run --urls http://localhost:5080</code> ou <code>app.Run("http://localhost:5080")</code>. Au démarrage, la console affiche <code>Now listening on: ...</code>.</p>

<h3>Déclarer des endpoints</h3>
<p>Il existe une méthode par verbe : <code>MapGet</code>, <code>MapPost</code>, <code>MapPut</code>, <code>MapDelete</code>, <code>MapPatch</code>. Chacune prend une route et un <strong>handler</strong> (la fonction qui répond, souvent une lambda). ASP.NET Core remplit tout seul les paramètres du handler : depuis la route, la query string, le corps JSON, ou les services. On appelle ça le <strong>binding</strong>.</p>
<p>Ce que tu renvoies devient la réponse : une <code>string</code> donne du texte, un objet donne du JSON (via <code>System.Text.Json</code>, en camelCase), un <code>Results.Xxx(...)</code> te laisse choisir le code de statut. Pour ne pas répéter <code>/api/products</code> partout, <code>app.MapGroup("/api/products")</code> crée un groupe de routes avec un préfixe commun.</p>
<div class="note">Cette façon d'écrire s'appelle les <strong>Minimal APIs</strong>. L'autre style, les <strong>contrôleurs</strong> (des classes avec des attributs <code>[HttpGet]</code>), existe aussi et reste très répandu en entreprise. Les deux tournent sur le même moteur (routing, middleware, DI) : ce que tu apprends dans ce chapitre vaut pour les deux.</div>`,
  examples: [
    {
      title: "Le Program.cs minimal, commenté",
      code: `// 1. Préparer : on crée le "builder" (le chantier)
var builder = WebApplication.CreateBuilder(args);

// 2. Construire : on obtient l'application
var app = builder.Build();

// 3. Brancher les routes
app.MapGet("/", () => "Bienvenue sur OrderFlow !");

// 4. Démarrer Kestrel et écouter
app.Run("http://localhost:5080");`,
      output: `$ dotnet run
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5080
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
info: Microsoft.Hosting.Lifetime[0]
      Content root path: C:\\dev\\OrderFlow.Api

$ curl -i http://localhost:5080/
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8

Bienvenue sur OrderFlow !`,
      steps: [
        "<code>WebApplication.CreateBuilder(args)</code> : charge la configuration (appsettings, variables d'environnement, arguments), prépare les logs et le conteneur de services.",
        "<code>builder.Build()</code> : fige la configuration et crée l'objet <code>app</code> qui va traiter les requêtes.",
        "<code>app.MapGet(\"/\", ...)</code> : un endpoint GET sur la racine qui renvoie du texte.",
        "<code>app.Run(\"http://localhost:5080\")</code> : démarre Kestrel sur ce port. Le programme reste bloqué ici tant que l'API tourne.",
        "<code>Now listening on</code> et <code>Hosting environment: Development</code> : les logs de démarrage confirment l'adresse et l'environnement (on y revient en leçon 6)."
      ]
    },
    {
      title: "Les deux phases et le binding des paramètres",
      code: `var builder = WebApplication.CreateBuilder(args);

// Phase "builder" : on enregistre des services, on lit la config
builder.Services.AddProblemDetails();
Console.WriteLine($"Environnement : {builder.Environment.EnvironmentName}");

var app = builder.Build();

// Phase "app" : on décrit comment répondre aux requêtes
app.MapGet("/api/hello/{name}", (string name, int? times) =>
    string.Join(" ", Enumerable.Repeat($"Salut {name} !", times ?? 1)));

// Un message quand Kestrel est prêt
app.Lifetime.ApplicationStarted.Register(() =>
    app.Logger.LogInformation("OrderFlow est prêt."));

app.Run();`,
      output: `$ dotnet run
Environnement : Development
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5080
...
info: OrderFlow.Api[0]
      OrderFlow est prêt.

$ curl -i "http://localhost:5080/api/hello/Kamal?times=2"
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8

Salut Kamal ! Salut Kamal !`,
      steps: [
        "<code>builder.Services.AddProblemDetails()</code> : un exemple d'enregistrement de service, toujours avant <code>Build()</code>. On le reverra avec la gestion d'erreurs.",
        "<code>builder.Environment.EnvironmentName</code> : l'environnement courant, ici <code>Development</code> grâce à launchSettings.json.",
        "<code>(string name, int? times)</code> : <code>name</code> est dans la route, il vient du chemin ; <code>times</code> n'y est pas, il vient de la query string.",
        "<code>times ?? 1</code> : si <code>times</code> est absent, on répète une seule fois.",
        "<code>app.Lifetime.ApplicationStarted.Register(...)</code> : un rappel exécuté quand Kestrel a démarré. <code>app.Logger</code> écrit un log dont la catégorie est le nom de l'application, <code>OrderFlow.Api</code>."
      ],
      explain: "Les trois points (...) remplacent les autres logs de démarrage, identiques à l'exemple 1."
    },
    {
      title: "Grouper les routes avec MapGroup",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<Product> products =
[
    new(1, "Clavier", 49.90m, 12),
    new(2, "Souris", 19.90m, 0)
];

// Toutes les routes de ce groupe commencent par /api/products
var group = app.MapGroup("/api/products");

group.MapGet("/", () => products);

group.MapGet("/{id:int}", (int id) =>
    products.FirstOrDefault(p => p.Id == id) is { } product
        ? Results.Ok(product)
        : Results.NotFound());

group.MapGet("/count", () => new { Count = products.Count });

app.Run();

record Product(int Id, string Name, decimal Price, int Stock);`,
      output: `$ curl -i http://localhost:5080/api/products/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Clavier","price":49.90,"stock":12}

$ curl -i http://localhost:5080/api/products/count
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"count":2}`,
      steps: [
        "<code>app.MapGroup(\"/api/products\")</code> : crée un groupe. Chaque route ajoutée au groupe reçoit ce préfixe.",
        "<code>group.MapGet(\"/\", ...)</code> : répond donc à <code>GET /api/products</code>.",
        "<code>is { } product</code> : un <strong>motif</strong> (pattern) qui teste « n'est pas null » et range la valeur dans <code>product</code> en même temps.",
        "<code>\"/{id:int}\"</code> et <code>\"/count\"</code> : pas de conflit, car <code>count</code> n'est pas un entier et ne passe pas la contrainte <code>:int</code>.",
        "<code>new { Count = products.Count }</code> : un objet anonyme devient <code>{\"count\":2}</code>."
      ],
      explain: "Plus tard, tu ajouteras l'autorisation ou la documentation une seule fois sur le groupe au lieu de chaque route."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une route d'état",
      prompt: `<p>Crée un projet avec <code>dotnet new web -n HealthDemo</code>. Ajoute <code>GET /api/health</code> qui renvoie <code>{ status: "OK", environment: "Development" }</code> (l'environnement lu dans <code>app.Environment.EnvironmentName</code>). Lance avec <code>dotnet run</code> et appelle-la avec curl.</p>`,
      hint: `<p>Renvoie un objet anonyme : <code>new { Status = "OK", Environment = app.Environment.EnvironmentName }</code>.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/health", () => new
{
    Status = "OK",
    Environment = app.Environment.EnvironmentName
});

app.Run();`
    },
    {
      level: "moyen",
      title: "Une calculatrice HTTP",
      prompt: `<p>Crée un groupe <code>/api/math</code> avec <code>GET /add?a=2&amp;b=3</code> qui renvoie <code>{ result: 5 }</code> et <code>GET /divide?a=10&amp;b=4</code> qui renvoie <code>{ result: 2.5 }</code>. Si <code>b</code> vaut 0 pour la division, renvoie 400 avec un message.</p>`,
      hint: `<p>Déclare <code>(double a, double b)</code> : sans <code>?</code>, les paramètres sont obligatoires et ASP.NET Core répond 400 tout seul s'ils manquent.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var math = app.MapGroup("/api/math");

math.MapGet("/add", (double a, double b) => new { Result = a + b });

math.MapGet("/divide", (double a, double b) =>
    b == 0
        ? Results.BadRequest("Division par zéro impossible.")
        : Results.Ok(new { Result = a / b }));

app.Run();`
    },
    {
      level: "difficile",
      title: "Port et message de démarrage",
      prompt: `<p>Modifie <code>Properties/launchSettings.json</code> pour que le profil <code>http</code> écoute sur <code>http://localhost:5080</code>. Dans Program.cs, enregistre un rappel sur <code>app.Lifetime.ApplicationStarted</code> qui logue toutes les adresses écoutées (<code>app.Urls</code>), et un autre sur <code>ApplicationStopping</code> qui logue « Arrêt d'OrderFlow ». Lance, puis arrête avec Ctrl+C pour voir les deux messages.</p>`,
      hint: `<p><code>app.Urls</code> n'est rempli qu'une fois Kestrel démarré, d'où l'intérêt du rappel <code>ApplicationStarted</code>. Utilise <code>string.Join(", ", app.Urls)</code>.</p>`,
      solution: `// Fichier : Properties/launchSettings.json (extrait du profil "http")
// "applicationUrl": "http://localhost:5080",

// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "OrderFlow");

app.Lifetime.ApplicationStarted.Register(() =>
    app.Logger.LogInformation("Écoute sur : {Urls}", string.Join(", ", app.Urls)));

app.Lifetime.ApplicationStopping.Register(() =>
    app.Logger.LogInformation("Arrêt d'OrderFlow"));

app.Run();`
    }
  ],
  quiz: [
    {
      q: `Où doit-on enregistrer un service avec <code>builder.Services.Add...</code> ?`,
      options: ["Après <code>app.Run()</code>", "Entre <code>Build()</code> et <code>Run()</code>", "Avant <code>builder.Build()</code>"],
      answer: 2,
      why: `<code>Build()</code> fige la liste des services. Ajouter un service ensuite lève une exception. Entre <code>Build()</code> et <code>Run()</code>, on déclare les middlewares et les endpoints.`
    },
    {
      q: `Qu'est-ce que Kestrel ?`,
      options: ["Le serveur web intégré qui écoute les requêtes HTTP", "Un outil pour tester les API", "Le format JSON de .NET"],
      answer: 0,
      why: `Kestrel est le serveur HTTP livré avec ASP.NET Core. Il ouvre le port, lit les requêtes et les passe à ton code. Les tests se font avec curl, un fichier .http ou un outil comme Postman.`
    },
    {
      q: `Dans <code>app.MapGet("/api/hello/{name}", (string name, int? times) =&gt; ...)</code>, d'où vient <code>times</code> ?`,
      options: ["Du corps JSON", "De la query string", "D'un en-tête"],
      answer: 1,
      why: `<code>times</code> n'apparaît pas dans la route, et c'est un type simple : ASP.NET Core le cherche dans la query string (<code>?times=2</code>). Un GET n'a de toute façon pas de corps.`
    },
    {
      q: `Avec <code>dotnet run</code>, d'où viennent le port et l'environnement <code>Development</code> ?`,
      options: ["Du fichier <code>.csproj</code>", "De <code>appsettings.json</code>", "De <code>Properties/launchSettings.json</code>"],
      answer: 2,
      why: `<code>launchSettings.json</code> contient <code>applicationUrl</code> et <code>ASPNETCORE_ENVIRONMENT</code>. Il ne sert qu'en local : en production, on passe ces réglages par variables d'environnement.`
    }
  ],
  project: `<p><strong>OrderFlow : premier démarrage.</strong> Crée le projet de l'API : <code>dotnet new web -n OrderFlow.Api</code>. Dans <code>launchSettings.json</code>, fixe le port du profil <code>http</code> à <code>5080</code>. Dans Program.cs, ajoute <code>GET /api/health</code> qui renvoie <code>{ status: "OK" }</code>.</p>
<p>Ajoute ensuite un groupe <code>/api/products</code> avec un <code>record Product(int Id, string Name, decimal Price, int Stock)</code> et une liste de trois produits en mémoire : <code>GET /</code> (la liste) et <code>GET /{id:int}</code> (200 ou 404). Teste les trois appels avec curl ou un fichier <code>OrderFlow.http</code>. Branche enfin ton front Angular dessus avec <code>HttpClient</code> si tu en as un sous la main.</p>`,
  resources: [
    { label: "Tutoriel : créer une API minimale (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/tutorials/min-web-api" },
    { label: "Serveur web Kestrel (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/servers/kestrel" }
  ]
});

// =====================================================================
// 4.4 Le pipeline de middleware
// =====================================================================
window.COURSE.push({
  key: "api-middleware",
  title: "Le pipeline de middleware",
  summary: "Tu sauras écrire un middleware, prévoir l'ordre d'exécution du pipeline et court-circuiter une requête.",
  objectives: [
    "Expliquer ce qu'est un middleware et le rôle de next",
    "Prévoir l'ordre « avant / après » dans un pipeline",
    "Court-circuiter une requête (401, erreur) sans appeler la suite",
    "Écrire un middleware sous forme de classe et connaître l'ordre des middlewares intégrés"
  ],
  analogy: `<p>Imagine les <strong>contrôles d'un aéroport</strong>. Avant d'arriver à l'avion, tu passes l'enregistrement, puis la sécurité, puis la douane. Chaque poste peut te laisser passer au suivant… ou t'arrêter net (« pas de passeport, demi-tour »).</p>
<p>Au retour, tu repasses les mêmes postes dans l'autre sens. Chaque poste est un <strong>middleware</strong>, l'avion est ton <strong>endpoint</strong>, et la file des postes est le <strong>pipeline</strong>.</p>`,
  lesson: `<h3>Un middleware, c'est quoi ?</h3>
<p>Entre Kestrel, qui reçoit la requête, et ton endpoint, qui fabrique la réponse, la requête traverse une chaîne de petits composants : les <strong>middlewares</strong>. Chacun peut regarder la requête, faire quelque chose (loguer, vérifier, mesurer), puis décider d'appeler le suivant ou non. Cette chaîne s'appelle le <strong>pipeline</strong>.</p>
<p>Tu connais déjà ce principe côté Angular : un <strong>intercepteur</strong> HTTP reçoit <code>(req, next)</code>, fait son travail et appelle <code>next(req)</code>. Un middleware ASP.NET Core reçoit <code>(context, next)</code> et appelle <code>await next(context)</code>. Même idée, mais côté serveur, et pour <em>toutes</em> les requêtes reçues.</p>
<div class="flow"><span>Kestrel</span><span>Middleware 1</span><span>Middleware 2</span><span>Endpoint</span></div>

<h3>app.Use : avant et après</h3>
<p>Le plus simple est <code>app.Use(async (context, next) =&gt; { ... })</code>. <code>context</code> est le <code>HttpContext</code> : il contient la requête (<code>context.Request</code>) et la réponse en cours (<code>context.Response</code>). <code>next</code> représente <strong>tout le reste du pipeline</strong>.</p>
<p>Le code écrit avant <code>await next(context)</code> s'exécute à l'aller ; le code écrit après s'exécute au retour, quand la réponse est prête. C'est pour ça qu'on parle souvent d'un modèle en <strong>poupées russes</strong> :</p>
<pre class="diagram">
requête --&gt; [ A avant
               [ B avant
                   [ endpoint ]
                 B après ]
             A après ] --&gt; réponse
</pre>

<h3>L'ordre compte</h3>
<p>Les middlewares s'exécutent <strong>dans l'ordre où tu les ajoutes</strong> dans Program.cs. Un middleware ajouté après un autre ne voit la requête que si le premier l'a laissée passer. C'est la source de bugs n°1 : par exemple, un middleware d'autorisation placé après les endpoints ne protège rien.</p>
<p>Voici l'ordre recommandé pour les middlewares intégrés que tu rencontreras dans cette partie :</p>
<table>
<tr><th>Ordre</th><th>Middleware</th><th>Rôle</th></tr>
<tr><td>1</td><td><code>UseExceptionHandler</code></td><td>Attrape les exceptions de tout ce qui suit</td></tr>
<tr><td>2</td><td><code>UseHttpsRedirection</code></td><td>Redirige HTTP vers HTTPS</td></tr>
<tr><td>3</td><td><code>UseCors</code></td><td>Autorise le front Angular d'un autre domaine</td></tr>
<tr><td>4</td><td><code>UseAuthentication</code></td><td>Qui es-tu ? (lit le jeton)</td></tr>
<tr><td>5</td><td><code>UseAuthorization</code></td><td>As-tu le droit ?</td></tr>
<tr><td>6</td><td>Endpoints (<code>Map...</code>)</td><td>Fabriquent la réponse</td></tr>
</table>
<p>Bonne nouvelle : avec <code>WebApplication</code>, le routage est ajouté automatiquement. Tu n'as pas besoin d'appeler <code>UseRouting</code> ni <code>UseEndpoints</code> comme dans les anciens tutoriels.</p>

<h3>Court-circuiter</h3>
<p>Un middleware n'est pas obligé d'appeler <code>next</code>. S'il écrit lui-même la réponse et fait <code>return</code>, la requête s'arrête là : les middlewares suivants et l'endpoint ne sont jamais exécutés. C'est un <strong>court-circuit</strong>. C'est exactement ce que fait l'autorisation (401/403), le cache (réponse déjà connue) ou une gestion d'erreur.</p>
<div class="compare"><div><h4>Intercepteur Angular</h4><p>Côté client. Modifie les requêtes <em>envoyées</em> par l'appli (ajout du jeton, gestion des 401). Il appelle <code>next(req)</code>.</p></div><div><h4>Middleware ASP.NET Core</h4><p>Côté serveur. Traite les requêtes <em>reçues</em> de tous les clients (logs, sécurité, erreurs). Il appelle <code>await next(context)</code>.</p></div></div>
<div class="tip">On ne peut plus modifier le statut ni les en-têtes une fois que la réponse a commencé à partir vers le client. Dans un middleware, change <code>StatusCode</code> et <code>Headers</code> <strong>avant</strong> <code>await next(context)</code> ou avant d'écrire le corps.</div>

<h3>Un middleware en classe</h3>
<p>Dès que ton middleware grossit, mets-le dans une classe. La convention : un constructeur qui reçoit <code>RequestDelegate next</code> (le suivant), et une méthode <code>public async Task InvokeAsync(HttpContext context)</code>. Tu l'ajoutes avec <code>app.UseMiddleware&lt;TaClasse&gt;()</code>. Le constructeur peut aussi recevoir des services, comme un <code>ILogger</code> : c'est l'injection de dépendances, sujet de la leçon suivante.</p>
<div class="note">La classe de middleware est créée <strong>une seule fois</strong> au démarrage, puis réutilisée pour toutes les requêtes, en parallèle. Ne stocke donc jamais une donnée propre à une requête dans un champ de la classe : passe par <code>context</code> (par exemple <code>context.Items</code>).</div>`,
  examples: [
    {
      title: "Un middleware qui logue chaque requête",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Un middleware "maison" : il voit passer TOUTES les requêtes
app.Use(async (context, next) =>
{
    // Avant : la requête arrive
    Console.WriteLine($"--> {context.Request.Method} {context.Request.Path}");

    await next(context); // on passe la main au suivant

    // Après : la réponse repart
    Console.WriteLine($"<-- {context.Response.StatusCode}");
});

app.MapGet("/api/products", () => new[] { "Clavier", "Souris" });

app.Run();`,
      output: `$ curl -i http://localhost:5080/api/products
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

["Clavier","Souris"]

$ curl http://localhost:5080/api/nothing

Console de l'API :
--> GET /api/products
<-- 200
--> GET /api/nothing
<-- 404`,
      steps: [
        "<code>app.Use(async (context, next) =&gt; ...)</code> : ajoute un middleware au pipeline. Il est placé avant les endpoints, donc il voit tout passer.",
        "<code>context.Request.Method</code> et <code>context.Request.Path</code> : on lit la requête, sans la modifier.",
        "<code>await next(context);</code> : on appelle la suite du pipeline (ici, l'endpoint) et on attend qu'elle ait fini.",
        "<code>context.Response.StatusCode</code> : au retour, la réponse est prête, on peut lire son statut.",
        "<code>/api/nothing</code> : aucun endpoint ne correspond, mais le middleware a quand même vu passer la requête et le 404."
      ],
      explain: "C'est le cousin serveur d'un intercepteur Angular qui logue les appels."
    },
    {
      title: "L'ordre et le court-circuit",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Use(async (context, next) =>
{
    Console.WriteLine("A : avant");
    await next(context);
    Console.WriteLine("A : après");
});

// Ce middleware peut COUPER le pipeline (court-circuit)
app.Use(async (context, next) =>
{
    if (context.Request.Headers["X-Api-Key"] != "secret")
    {
        Console.WriteLine("B : clé absente, on s'arrête là");
        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
        return; // next n'est jamais appelé
    }
    Console.WriteLine("B : clé OK");
    await next(context);
});

app.MapGet("/api/orders", () =>
{
    Console.WriteLine("Endpoint : je calcule la réponse");
    return new[] { 1001, 1002 };
});

app.Run();`,
      output: `$ curl -i http://localhost:5080/api/orders -H "X-Api-Key: secret"
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[1001,1002]

$ curl -i http://localhost:5080/api/orders
HTTP/1.1 401 Unauthorized
Content-Length: 0

Console de l'API :
A : avant
B : clé OK
Endpoint : je calcule la réponse
A : après
A : avant
B : clé absente, on s'arrête là
A : après`,
      steps: [
        "<code>A : avant</code> puis <code>B</code> : les middlewares s'exécutent dans l'ordre où ils sont déclarés.",
        "<code>context.Request.Headers[\"X-Api-Key\"]</code> : on lit un en-tête personnalisé envoyé par le client.",
        "<code>context.Response.StatusCode = StatusCodes.Status401Unauthorized;</code> : on fixe le statut 401. <code>StatusCodes</code> contient des constantes pour tous les codes.",
        "<code>return;</code> : sans appel à <code>next</code>, l'endpoint n'est jamais exécuté. C'est le court-circuit.",
        "<code>A : après</code> s'affiche dans les deux cas : A avait appelé <code>next</code>, il reprend la main au retour, que B ait coupé ou non."
      ],
      explain: "Une vraie API utilise l'authentification intégrée, pas une clé en dur : cet exemple sert seulement à voir le mécanisme."
    },
    {
      title: "Un middleware en classe qui attrape les erreurs",
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Le premier du pipeline : il attrape les erreurs de tous les suivants
app.UseMiddleware<ErrorHandlingMiddleware>();

app.MapGet("/api/orders/{id:int}", (int id) =>
    id == 13 ? throw new InvalidOperationException("Commande corrompue")
             : Results.Ok(new { Id = id, Status = "Pending" }));

app.Run();

// Un middleware écrit sous forme de classe
class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Erreur sur {Path}", context.Request.Path);
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;
            await context.Response.WriteAsJsonAsync(new { Error = "Une erreur est survenue." });
        }
    }
}`,
      output: `$ curl -i http://localhost:5080/api/orders/7
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":7,"status":"Pending"}

$ curl -i http://localhost:5080/api/orders/13
HTTP/1.1 500 Internal Server Error
Content-Type: application/json; charset=utf-8

{"error":"Une erreur est survenue."}

Console de l'API :
fail: ErrorHandlingMiddleware[0]
      Erreur sur /api/orders/13
      System.InvalidOperationException: Commande corrompue
         at ...`,
      steps: [
        "<code>class ErrorHandlingMiddleware(RequestDelegate next, ILogger&lt;...&gt; logger)</code> : un constructeur principal (vu en partie 1). <code>next</code> est le suivant du pipeline, <code>logger</code> est fourni par l'injection de dépendances.",
        "<code>public async Task InvokeAsync(HttpContext context)</code> : le nom et la signature imposés par la convention. ASP.NET Core l'appelle pour chaque requête.",
        "<code>try { await next(context); }</code> : toute exception levée plus loin dans le pipeline remonte jusqu'ici.",
        "<code>logger.LogError(ex, ...)</code> : on garde le détail technique dans les logs, côté serveur.",
        "<code>WriteAsJsonAsync(...)</code> : le client reçoit un 500 propre, sans pile d'appels qui révélerait l'intérieur de l'API.",
        "<code>app.UseMiddleware&lt;ErrorHandlingMiddleware&gt;()</code> : placé en premier, pour envelopper tout le reste."
      ],
      explain: "ASP.NET Core fournit déjà UseExceptionHandler pour ce rôle : on l'utilisera avec ProblemDetails. L'écrire une fois à la main t'aide à comprendre ce qu'il fait."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un en-tête sur toutes les réponses",
      prompt: `<p>Ajoute un middleware qui place l'en-tête <code>X-App: OrderFlow</code> sur <strong>toutes</strong> les réponses, puis un endpoint <code>GET /</code>. Vérifie avec <code>curl -i</code>.</p>`,
      hint: `<p>Écris l'en-tête <strong>avant</strong> d'appeler <code>next</code> : <code>context.Response.Headers["X-App"] = "OrderFlow";</code>.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Use(async (context, next) =>
{
    // Avant next : la réponse n'est pas encore partie
    context.Response.Headers["X-App"] = "OrderFlow";
    await next(context);
});

app.MapGet("/", () => "Bonjour");

app.Run();`
    },
    {
      level: "moyen",
      title: "Mesurer la durée des requêtes",
      prompt: `<p>Écris un middleware qui mesure la durée de chaque requête avec <code>System.Diagnostics.Stopwatch</code> et l'écrit dans la console : <code>GET /api/slow : 503 ms</code>. Ajoute <code>GET /api/slow</code> qui attend 500 ms avec <code>await Task.Delay(500)</code>.</p>`,
      hint: `<p><code>var watch = Stopwatch.StartNew();</code> avant <code>next</code>, puis <code>watch.ElapsedMilliseconds</code> après.</p>`,
      solution: `using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.Use(async (context, next) =>
{
    var watch = Stopwatch.StartNew();
    await next(context);
    watch.Stop();
    Console.WriteLine($"{context.Request.Method} {context.Request.Path} : {watch.ElapsedMilliseconds} ms");
});

app.MapGet("/api/slow", async () =>
{
    await Task.Delay(500);
    return "Fini";
});

app.Run();`
    },
    {
      level: "difficile",
      title: "Un mode maintenance en classe",
      prompt: `<p>Écris une classe <code>MaintenanceMiddleware</code>. Si la variable d'environnement <code>MAINTENANCE</code> vaut <code>on</code>, elle répond <code>503 Service Unavailable</code> avec <code>{ message: "Maintenance en cours" }</code> pour toutes les routes sauf <code>/api/health</code>. Sinon, elle laisse passer. Enregistre-la avec <code>UseMiddleware</code>.</p>`,
      hint: `<p><code>Environment.GetEnvironmentVariable("MAINTENANCE")</code> lit la variable. <code>context.Request.Path.StartsWithSegments("/api/health")</code> teste le chemin proprement.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseMiddleware<MaintenanceMiddleware>();

app.MapGet("/api/health", () => new { Status = "OK" });
app.MapGet("/api/products", () => new[] { "Clavier" });

app.Run();

class MaintenanceMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        bool maintenance = Environment.GetEnvironmentVariable("MAINTENANCE") == "on";

        if (maintenance && !context.Request.Path.StartsWithSegments("/api/health"))
        {
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await context.Response.WriteAsJsonAsync(new { Message = "Maintenance en cours" });
            return; // court-circuit
        }

        await next(context);
    }
}`
    }
  ],
  quiz: [
    {
      q: `Que se passe-t-il si un middleware n'appelle pas <code>next</code> ?`,
      options: ["Une exception est levée", "Le pipeline s'arrête : les middlewares suivants et l'endpoint ne s'exécutent pas", "ASP.NET Core appelle <code>next</code> automatiquement"],
      answer: 1,
      why: `C'est le court-circuit, et c'est voulu : un contrôle d'accès ou un cache répondent sans aller plus loin. Rien n'appelle <code>next</code> à ta place.`
    },
    {
      q: `On ajoute A, puis B, puis l'endpoint. Dans quel ordre s'affichent les messages « avant » et « après » ?`,
      options: ["A avant, B avant, endpoint, B après, A après", "A avant, A après, B avant, B après, endpoint", "B avant, A avant, endpoint, A après, B après"],
      answer: 0,
      why: `Chaque middleware enveloppe les suivants, comme des poupées russes : on entre dans l'ordre d'ajout et on ressort dans l'ordre inverse.`
    },
    {
      q: `Pourquoi placer le gestionnaire d'exceptions en <strong>premier</strong> dans le pipeline ?`,
      options: ["Pour qu'il s'exécute plus vite", "Parce qu'il ne peut attraper que les erreurs des middlewares placés après lui", "Parce que c'est obligatoire pour compiler"],
      answer: 1,
      why: `Une exception remonte vers les middlewares qui ont appelé <code>next</code>. Placé en premier, il enveloppe tout le pipeline. Placé en dernier, il ne verrait presque rien.`
    },
    {
      q: `Quel est l'équivalent Angular le plus proche d'un middleware ASP.NET Core ?`,
      options: ["Un composant", "Un pipe", "Un intercepteur HTTP"],
      answer: 2,
      why: `Un intercepteur reçoit <code>(req, next)</code> et décide d'appeler <code>next</code>, exactement comme un middleware avec <code>(context, next)</code>. La différence : il agit côté client sur les requêtes envoyées.`
    }
  ],
  project: `<p><strong>OrderFlow : un journal des requêtes.</strong> Dans ton projet <code>OrderFlow.Api</code>, crée un fichier <code>Middlewares/RequestLoggingMiddleware.cs</code> avec une classe qui, pour chaque requête, logue avec <code>ILogger</code> : <code>GET /api/products -&gt; 200 (12 ms)</code>.</p>
<p>Ajoute aussi un en-tête de réponse <code>X-Request-Id</code> qui reprend <code>context.TraceIdentifier</code> (l'identifiant unique que Kestrel donne à chaque requête). Enregistre le middleware en premier avec <code>app.UseMiddleware&lt;RequestLoggingMiddleware&gt;()</code>. Bonus côté Angular : affiche ce <code>X-Request-Id</code> dans la console grâce à un intercepteur, pour relier une erreur du front à une ligne de log du serveur.</p>`,
  resources: [
    { label: "Intergiciel (middleware) ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/middleware/" },
    { label: "Écrire un middleware personnalisé (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/middleware/write" }
  ]
});

// =====================================================================
// 4.5 L'injection de dépendances
// =====================================================================
window.COURSE.push({
  key: "api-di",
  title: "L'injection de dépendances et les durées de vie (Singleton, Scoped, Transient)",
  summary: "Tu sauras enregistrer un service, le recevoir dans un endpoint ou un constructeur, et choisir la bonne durée de vie.",
  objectives: [
    "Comprendre pourquoi on évite les new dans le code métier",
    "Enregistrer un service avec son interface et le faire injecter",
    "Choisir entre Singleton, Scoped et Transient",
    "Éviter la dépendance captive (un singleton qui garde un service scoped)"
  ],
  analogy: `<p>Au bureau, tu ne fabriques pas ta machine à café ni ton gobelet : tu les <strong>demandes</strong>, et quelqu'un te les fournit. C'est l'<strong>injection de dépendances</strong>.</p>
<p>Et chaque objet a sa durée de vie. La <strong>machine à café</strong> est unique et partagée par tout l'étage toute l'année (Singleton). Le <strong>plateau-repas</strong> est donné à chaque client pour son repas, puis débarrassé (Scoped : une requête). Le <strong>gobelet jetable</strong> est neuf à chaque fois que tu en demandes un (Transient).</p>`,
  lesson: `<h3>Le problème des new partout</h3>
<p>Imagine un endpoint qui fait <code>var calculator = new PriceCalculator();</code>, puis <code>PriceCalculator</code> qui fait lui-même <code>new TaxService()</code>, etc. Chaque classe choisit et fabrique ses outils. Résultat : impossible de remplacer <code>TaxService</code> par une version de test, et changer un constructeur oblige à modifier tous ceux qui l'appellent.</p>
<p>L'<strong>injection de dépendances</strong> (en anglais <em>Dependency Injection</em>, DI) renverse la situation. Une classe <strong>déclare</strong> ce dont elle a besoin (dans son constructeur ou les paramètres d'un endpoint), et un composant central, le <strong>conteneur de services</strong>, le lui <strong>fournit</strong>. Une <strong>dépendance</strong>, c'est simplement un objet dont ta classe a besoin pour travailler.</p>

<h3>Enregistrer, puis demander</h3>
<p>Ça se passe en deux temps. Avant <code>Build()</code>, tu <strong>enregistres</strong> les services dans <code>builder.Services</code> : « quand quelqu'un demande <code>IPriceCalculator</code>, donne-lui un <code>PriceCalculator</code> ». Ensuite, partout où tu en as besoin, tu le <strong>demandes</strong> : ASP.NET Core le crée (avec ses propres dépendances) et te le passe.</p>
<div class="flow"><span>builder.Services.AddScoped</span><span>Build()</span><span>requête</span><span>le conteneur crée et injecte</span></div>
<p>On enregistre souvent une <strong>interface</strong> avec son <strong>implémentation</strong> : le code qui utilise le service ne connaît que l'interface. Pour les tests (partie 5), tu pourras donner une fausse implémentation sans toucher au reste.</p>

<h3>Où peut-on recevoir un service ?</h3>
<p>Dans les paramètres d'un handler de Minimal API : <code>(int id, IProductRepository repo) =&gt; ...</code>. ASP.NET Core voit que <code>IProductRepository</code> est enregistré et l'injecte. Dans le <strong>constructeur</strong> d'une classe elle-même créée par le conteneur : un service qui dépend d'un autre service, un middleware, et plus tard un contrôleur.</p>
<p>Côté Angular, c'est le même mécanisme : un service <code>@Injectable({ providedIn: 'root' })</code> est enregistré, et un composant le reçoit avec <code>inject(ProductService)</code> ou par son constructeur. Seule la syntaxe d'enregistrement change.</p>

<h3>Les trois durées de vie</h3>
<p>En enregistrant un service, tu choisis combien de temps vit chaque instance. C'est la décision la plus importante de la DI.</p>
<table>
<tr><th>Durée de vie</th><th>Une instance…</th><th>Exemple typique</th><th>Équivalent Angular</th></tr>
<tr><td><code>AddSingleton</code></td><td>pour toute l'application</td><td>cache en mémoire, horloge, configuration</td><td><code>providedIn: 'root'</code></td></tr>
<tr><td><code>AddScoped</code></td><td>par requête HTTP</td><td><code>DbContext</code> d'EF Core, panier de la requête</td><td>proche d'un service fourni dans <code>providers</code> d'un composant</td></tr>
<tr><td><code>AddTransient</code></td><td>à chaque demande</td><td>petit service léger et sans état</td><td>pas d'équivalent direct</td></tr>
</table>
<p>Une requête HTTP crée un <strong>scope</strong> (une portée) : tous les services Scoped demandés pendant cette requête sont partagés, puis jetés à la fin de la requête. Le Singleton, lui, est créé une fois et vit jusqu'à l'arrêt de l'API. Il est donc partagé par toutes les requêtes <strong>en même temps</strong> : il doit être <em>thread-safe</em> (supporter des accès simultanés).</p>

<h3>Le piège : la dépendance captive</h3>
<p>Un service ne doit jamais dépendre d'un service qui vit <strong>moins longtemps</strong> que lui. Si un Singleton reçoit un service Scoped dans son constructeur, il le garde pour toujours : le service « d'une requête » devient partagé par toutes les requêtes. Avec un <code>DbContext</code>, ce sont des données mélangées et des plantages aléatoires.</p>
<pre class="diagram">
 Singleton  ===========================&gt; vit toujours
   |  garde
   v
 Scoped     [req 1]  (devrait mourir ici)
             ...mais reste capturé !

 Règle : Singleton -&gt; Singleton seulement
         Scoped    -&gt; Scoped ou Singleton
         Transient -&gt; tout
</pre>
<div class="tip">En environnement <code>Development</code>, ASP.NET Core vérifie ces règles au moment de <code>Build()</code> et refuse de démarrer si un Singleton dépend d'un Scoped. En production, cette vérification est désactivée : corrige le problème dès qu'il apparaît sur ton poste.</div>
<div class="note">Par défaut, choisis <strong>Scoped</strong> pour ce qui touche aux données (repositories, services métier qui utilisent un <code>DbContext</code>), <strong>Singleton</strong> seulement pour ce qui est sans état ou explicitement thread-safe, et <strong>Transient</strong> pour les petits utilitaires. Et n'utilise pas <code>new HttpClient()</code> à la main : <code>builder.Services.AddHttpClient()</code> gère pour toi la réutilisation des connexions.</div>`,
  examples: [
    {
      title: "Enregistrer une interface et l'injecter",
      code: `var builder = WebApplication.CreateBuilder(args);

// 1. Enregistrer : "quand on demande IPriceCalculator, donne un PriceCalculator"
builder.Services.AddScoped<IPriceCalculator, PriceCalculator>();

var app = builder.Build();

// 2. Demander : ASP.NET Core injecte le service en paramètre
app.MapGet("/api/price", (decimal unitPrice, int quantity, IPriceCalculator calculator) =>
    new { Total = calculator.TotalWithVat(unitPrice, quantity) });

app.Run();

interface IPriceCalculator
{
    decimal TotalWithVat(decimal unitPrice, int quantity);
}

class PriceCalculator : IPriceCalculator
{
    private const decimal VatRate = 0.20m;

    public decimal TotalWithVat(decimal unitPrice, int quantity) =>
        Math.Round(unitPrice * quantity * (1 + VatRate), 2);
}`,
      output: `$ curl -i "http://localhost:5080/api/price?unitPrice=19.90&quantity=3"
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"total":71.64}`,
      steps: [
        "<code>builder.Services.AddScoped&lt;IPriceCalculator, PriceCalculator&gt;()</code> : on associe l'interface à son implémentation, avec une instance par requête.",
        "<code>(decimal unitPrice, int quantity, IPriceCalculator calculator)</code> : les deux premiers viennent de la query string ; le troisième est un service enregistré, il est injecté par le conteneur.",
        "L'endpoint ne fait jamais <code>new PriceCalculator()</code> : il ne connaît que l'interface.",
        "<code>Math.Round(19.90 * 3 * 1.20, 2)</code> : 59,70 × 1,2 = 71,64."
      ],
      explain: "Pour changer de calcul (TVA réduite, version de test), tu modifies une seule ligne : l'enregistrement."
    },
    {
      title: "Voir les trois durées de vie",
      code: `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<SingletonService>();
builder.Services.AddScoped<ScopedService>();
builder.Services.AddTransient<TransientService>();

var app = builder.Build();

// On demande DEUX fois chaque service dans la même requête
app.MapGet("/lifetimes", (
    SingletonService s1, SingletonService s2,
    ScopedService sc1, ScopedService sc2,
    TransientService t1, TransientService t2) =>
    $"Singleton {s1.Id}/{s2.Id} | Scoped {sc1.Id}/{sc2.Id} | Transient {t1.Id}/{t2.Id}");

app.Run();

// Chaque classe numérote ses instances : 1, 2, 3...
class SingletonService { static int count; public int Id { get; } = Interlocked.Increment(ref count); }
class ScopedService { static int count; public int Id { get; } = Interlocked.Increment(ref count); }
class TransientService { static int count; public int Id { get; } = Interlocked.Increment(ref count); }`,
      output: `$ curl http://localhost:5080/lifetimes
Singleton 1/1 | Scoped 1/1 | Transient 1/2
$ curl http://localhost:5080/lifetimes
Singleton 1/1 | Scoped 2/2 | Transient 3/4`,
      steps: [
        "<code>AddSingleton</code>, <code>AddScoped</code>, <code>AddTransient</code> : on enregistre une classe directement, sans interface. C'est permis.",
        "<code>Interlocked.Increment(ref count)</code> : un compteur partagé par toutes les instances de la classe, incrémenté de façon sûre même si deux requêtes arrivent en même temps. Chaque nouvelle instance reçoit le numéro suivant.",
        "Singleton <code>1/1</code> puis <code>1/1</code> : une seule instance pour toute la vie de l'API.",
        "Scoped <code>1/1</code> puis <code>2/2</code> : la même instance dans une requête, une nouvelle à la requête suivante.",
        "Transient <code>1/2</code> puis <code>3/4</code> : une nouvelle instance à chaque fois qu'on en demande une."
      ],
      explain: "Retiens cette sortie : c'est la meilleure façon d'expliquer les trois durées de vie en entretien."
    },
    {
      title: "La dépendance captive détectée au démarrage",
      code: `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<ShoppingCart>();      // un panier par requête
builder.Services.AddSingleton<CartReporter>();   // un seul pour toute l'appli

try
{
    var app = builder.Build(); // en Development, .NET vérifie les durées de vie ici
    app.Run();
}
catch (AggregateException ex)
{
    Console.WriteLine(ex.InnerExceptions[0].Message);
}

class ShoppingCart
{
    public List<int> ProductIds { get; } = [];
}

// ERREUR : un singleton qui garde un service scoped
class CartReporter(ShoppingCart cart)
{
    public int Count => cart.ProductIds.Count;
}`,
      output: `Error while validating the service descriptor 'ServiceType: CartReporter Lifetime: Singleton ImplementationType: CartReporter': Cannot consume scoped service 'ShoppingCart' from singleton 'CartReporter'.`,
      steps: [
        "<code>AddScoped&lt;ShoppingCart&gt;()</code> : chaque requête doit avoir son propre panier.",
        "<code>class CartReporter(ShoppingCart cart)</code> : le constructeur demande un <code>ShoppingCart</code>, donc le conteneur doit en fournir un.",
        "<code>AddSingleton&lt;CartReporter&gt;()</code> : le reporter vivrait toujours et garderait le premier panier pour toutes les requêtes.",
        "<code>builder.Build()</code> : en Development, le conteneur valide toutes les dépendances et lève une <code>AggregateException</code> qui regroupe les problèmes trouvés.",
        "Le message dit exactement quoi corriger : passer <code>CartReporter</code> en Scoped (ou ne pas lui injecter le panier)."
      ],
      explain: "Le try/catch sert à afficher un message lisible ; sans lui, l'API s'arrête au démarrage avec la même erreur."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un service d'horloge",
      prompt: `<p>Crée une interface <code>IClock</code> avec une propriété <code>DateTime Now</code>, et une classe <code>SystemClock</code> qui renvoie <code>DateTime.UtcNow</code>. Enregistre-la en Singleton et utilise-la dans <code>GET /api/time</code>.</p>`,
      hint: `<p><code>builder.Services.AddSingleton&lt;IClock, SystemClock&gt;();</code> puis un paramètre <code>IClock clock</code> dans l'endpoint.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IClock, SystemClock>();
var app = builder.Build();

app.MapGet("/api/time", (IClock clock) => new { Utc = clock.Now });

app.Run();

interface IClock
{
    DateTime Now { get; }
}

class SystemClock : IClock
{
    public DateTime Now => DateTime.UtcNow;
}`
    },
    {
      level: "moyen",
      title: "Un service qui dépend d'un autre",
      prompt: `<p>Crée <code>IProductRepository</code> (méthode <code>IEnumerable&lt;Product&gt; GetAll()</code>) avec une implémentation en mémoire, et un <code>CatalogService</code> qui la reçoit dans son constructeur et expose <code>GetAvailable()</code> (produits avec du stock). Enregistre les deux, et utilise <code>CatalogService</code> dans <code>GET /api/catalog</code>.</p>`,
      hint: `<p>Le repository en mémoire peut être Singleton (il garde sa liste). <code>CatalogService</code> en Scoped dépend d'un Singleton : c'est autorisé.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<IProductRepository, InMemoryProductRepository>();
builder.Services.AddScoped<CatalogService>();
var app = builder.Build();

app.MapGet("/api/catalog", (CatalogService catalog) => catalog.GetAvailable());

app.Run();

record Product(int Id, string Name, decimal Price, int Stock);

interface IProductRepository
{
    IEnumerable<Product> GetAll();
}

class InMemoryProductRepository : IProductRepository
{
    private readonly List<Product> _products =
        [new(1, "Clavier", 49.90m, 12), new(2, "Souris", 19.90m, 0)];

    public IEnumerable<Product> GetAll() => _products;
}

class CatalogService(IProductRepository repository)
{
    public IEnumerable<Product> GetAvailable() => repository.GetAll().Where(p => p.Stock > 0);
}`
    },
    {
      level: "difficile",
      title: "Un compteur de visites qui tient la route",
      prompt: `<p>Écris un service <code>VisitCounter</code> avec une méthode <code>int Increment()</code>, utilisé par <code>GET /api/visits</code> qui renvoie le nombre total de visites depuis le démarrage. Choisis la bonne durée de vie, et rends le compteur sûr quand plusieurs requêtes arrivent en même temps. Explique en commentaire ce qui se passerait avec Scoped.</p>`,
      hint: `<p>Le compteur doit survivre entre les requêtes : Singleton. Pour les accès simultanés, <code>Interlocked.Increment(ref _count)</code>.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);

// Singleton : une seule instance qui survit entre les requêtes.
// En Scoped, chaque requête aurait un compteur neuf : on verrait toujours 1.
builder.Services.AddSingleton<VisitCounter>();

var app = builder.Build();

app.MapGet("/api/visits", (VisitCounter counter) => new { Visits = counter.Increment() });

app.Run();

class VisitCounter
{
    private int _count;

    // Thread-safe : plusieurs requêtes peuvent appeler Increment en même temps
    public int Increment() => Interlocked.Increment(ref _count);
}`
    }
  ],
  quiz: [
    {
      q: `Quelle durée de vie donne <strong>une instance par requête HTTP</strong> ?`,
      options: ["Singleton", "Transient", "Scoped"],
      answer: 2,
      why: `Scoped = une instance par scope, et ASP.NET Core crée un scope par requête. Singleton = une pour toute l'appli ; Transient = une à chaque demande, même dans la même requête.`
    },
    {
      q: `Pourquoi un Singleton ne doit-il pas recevoir un service Scoped dans son constructeur ?`,
      options: ["Parce qu'il le garderait pour toujours et le partagerait entre toutes les requêtes", "Parce que les Singletons ne peuvent pas avoir de constructeur", "Parce que c'est plus lent"],
      answer: 0,
      why: `C'est la dépendance captive : le service censé vivre une requête devient éternel et partagé. En Development, <code>Build()</code> refuse d'ailleurs de démarrer.`
    },
    {
      q: `Où doit-on appeler <code>builder.Services.AddScoped&lt;IOrderService, OrderService&gt;()</code> ?`,
      options: ["Dans l'endpoint qui utilise le service", "Avant <code>builder.Build()</code>", "Dans le constructeur de <code>OrderService</code>"],
      answer: 1,
      why: `L'enregistrement se fait une fois, au démarrage, avant <code>Build()</code>. Ensuite, on ne fait que demander le service (paramètre ou constructeur).`
    },
    {
      q: `En Angular, <code>@Injectable({ providedIn: 'root' })</code> correspond le mieux à…`,
      options: ["<code>AddTransient</code>", "<code>AddSingleton</code>", "<code>AddScoped</code>"],
      answer: 1,
      why: `<code>providedIn: 'root'</code> crée une seule instance partagée par toute l'application Angular, comme un Singleton. Attention : côté serveur, ce singleton est partagé par tous les utilisateurs à la fois.`
    }
  ],
  project: `<p><strong>OrderFlow : un repository injecté.</strong> Sors la liste de produits de Program.cs. Crée <code>IProductRepository</code> avec <code>GetAll()</code>, <code>GetById(int id)</code> et <code>Add(Product product)</code>, et une implémentation <code>InMemoryProductRepository</code> qui garde une <code>List&lt;Product&gt;</code>.</p>
<p>Enregistre-la avec <code>builder.Services.AddSingleton&lt;IProductRepository, InMemoryProductRepository&gt;()</code> (Singleton, car la liste en mémoire doit survivre entre les requêtes) et fais-la injecter dans tes endpoints <code>/api/products</code>. Ajoute un commentaire : en partie 3, la version EF Core de ce repository sera <strong>Scoped</strong>, comme le <code>OrderFlowDbContext</code> qu'elle utilisera. Ton code d'endpoint, lui, ne changera pas.</p>`,
  resources: [
    { label: "Injection de dépendances dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/dependency-injection" },
    { label: "Durées de vie des services (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/dependency-injection#service-lifetimes" }
  ]
});

// =====================================================================
// 4.6 Configuration, Options pattern et environnements
// =====================================================================
window.COURSE.push({
  key: "api-config",
  title: "Configuration, Options pattern et environnements",
  summary: "Tu sauras lire des réglages depuis appsettings.json et les variables d'environnement, les regrouper dans une classe typée et adapter ton API à chaque environnement.",
  objectives: [
    "Lire une valeur de configuration avec IConfiguration",
    "Comprendre l'ordre des sources et qui gagne en cas de doublon",
    "Utiliser le pattern Options avec validation au démarrage",
    "Adapter le comportement à Development ou Production sans changer le code"
  ],
  analogy: `<p>Pense aux <strong>réglages de ton téléphone</strong>. Il sort de l'usine avec des valeurs par défaut (<code>appsettings.json</code>). Ton profil « travail » en change quelques-unes (<code>appsettings.Development.json</code>). Et l'administrateur de l'entreprise peut en imposer certaines, qui passent devant tout le reste (les variables d'environnement).</p>
<p>Le téléphone, lui, ne change pas : seuls les réglages changent. C'est l'idée : <strong>le même code</strong> tourne partout, la configuration s'adapte à l'endroit.</p>`,
  lesson: `<h3>Pourquoi sortir les réglages du code</h3>
<p>Une chaîne de connexion à la base, une URL d'API externe, un nombre maximum d'articles par commande : ces valeurs changent entre ton poste, le serveur de test et la production. Si elles sont écrites en dur dans le code, il faut recompiler pour chaque environnement. Avec la <strong>configuration</strong>, on compile une fois et on change les réglages à l'extérieur.</p>
<p>En Angular, tu as <code>environment.ts</code> et <code>environment.prod.ts</code>, remplacés <strong>au build</strong>. ASP.NET Core lit sa configuration <strong>au démarrage</strong> : le même binaire peut tourner en test et en production, avec des réglages différents.</p>

<h3>appsettings.json et IConfiguration</h3>
<p><code>WebApplication.CreateBuilder</code> charge automatiquement la configuration dans <code>builder.Configuration</code>, de type <code>IConfiguration</code>. Les sections du JSON s'imbriquent, et on les traverse avec <code>:</code> : <code>config["OrderFlow:ShopName"]</code>. Les valeurs sont toujours lues comme du texte ; <code>config.GetValue&lt;int&gt;("OrderFlow:MaxItemsPerOrder")</code> convertit pour toi. <code>config.GetConnectionString("OrderFlow")</code> est un raccourci pour la section <code>ConnectionStrings</code>.</p>

<h3>Plusieurs sources, la dernière gagne</h3>
<p>La configuration n'est pas un seul fichier : c'est une pile de <strong>sources</strong>, lues dans cet ordre. Si une clé existe dans plusieurs sources, <strong>la dernière lue gagne</strong>.</p>
<div class="flow"><span>appsettings.json</span><span>appsettings.{Env}.json</span><span>user secrets (Dev)</span><span>variables d'env.</span><span>ligne de commande</span></div>
<p>Dans une variable d'environnement, le <code>:</code> est remplacé par un <strong>double tiret bas</strong> <code>__</code>, car certains systèmes refusent les deux-points : <code>OrderFlow__MaxItemsPerOrder=50</code> remplace <code>OrderFlow:MaxItemsPerOrder</code>. C'est ainsi qu'on configure une API dans Docker ou dans le cloud.</p>
<div class="tip">Ne mets jamais de mot de passe dans <code>appsettings.json</code> : ce fichier part dans Git. En développement, utilise les <strong>user secrets</strong> (<code>dotnet user-secrets set "ConnectionStrings:OrderFlow" "..."</code>), stockés hors du projet sur ta machine. En production, utilise des variables d'environnement ou un coffre-fort comme Azure Key Vault.</div>

<h3>Le pattern Options : des réglages typés</h3>
<p>Écrire <code>config["OrderFlow:MaxItemsPerOrder"]</code> partout, c'est fragile : une faute de frappe et tu obtiens <code>null</code> sans erreur. Le <strong>pattern Options</strong> relie une section à une classe C#. Tu déclares <code>class OrderFlowOptions { ShopName, MaxItemsPerOrder }</code>, tu l'enregistres avec <code>builder.Services.AddOptions&lt;OrderFlowOptions&gt;().BindConfiguration("OrderFlow")</code>, puis tu reçois <code>IOptions&lt;OrderFlowOptions&gt;</code> par injection et tu lis <code>options.Value.MaxItemsPerOrder</code>, avec l'autocomplétion.</p>
<p>Encore mieux : ajoute des attributs de validation (<code>[Required]</code>, <code>[Range(1, 100)]</code>), puis <code>.ValidateDataAnnotations().ValidateOnStart()</code>. Si un réglage est faux, l'API refuse de démarrer avec un message clair, au lieu de planter au premier client.</p>
<table>
<tr><th>Interface</th><th>Durée de vie</th><th>Relit les changements ?</th></tr>
<tr><td><code>IOptions&lt;T&gt;</code></td><td>Singleton</td><td>Non, valeur lue une fois</td></tr>
<tr><td><code>IOptionsSnapshot&lt;T&gt;</code></td><td>Scoped</td><td>Oui, à chaque requête</td></tr>
<tr><td><code>IOptionsMonitor&lt;T&gt;</code></td><td>Singleton</td><td>Oui, avec notification</td></tr>
</table>

<h3>Les environnements</h3>
<p>L'environnement est un simple nom, lu dans la variable <code>ASPNETCORE_ENVIRONMENT</code> : <code>Development</code>, <code>Staging</code> ou <code>Production</code>. Si elle n'est pas définie, c'est <strong>Production</strong> : sécurisé par défaut. En local, <code>launchSettings.json</code> la fixe à <code>Development</code>.</p>
<p>Il sert à deux choses : charger <code>appsettings.{Environnement}.json</code> par-dessus <code>appsettings.json</code>, et adapter le code avec <code>app.Environment.IsDevelopment()</code> (par exemple, n'exposer la documentation ou une page de diagnostic qu'en développement).</p>
<div class="note">Valide toujours ta configuration au démarrage (<code>ValidateOnStart</code>). Une API qui démarre avec une chaîne de connexion vide semble « en ligne » pour l'orchestrateur, puis échoue sur chaque requête. Une API qui refuse de démarrer est détectée tout de suite par le déploiement.</div>`,
  examples: [
    {
      title: "Lire appsettings.json avec IConfiguration",
      code: `// Fichier : appsettings.json
{
  "ConnectionStrings": {
    "OrderFlow": "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "OrderFlow": {
    "ShopName": "OrderFlow Démo",
    "MaxItemsPerOrder": 10
  }
}

// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

// Lire une valeur : le ":" descend dans les sections du JSON
string? shopName = config["OrderFlow:ShopName"];

// Lire en convertissant le type, avec une valeur par défaut
int maxItems = config.GetValue<int>("OrderFlow:MaxItemsPerOrder", 5);

// Raccourci pour la section ConnectionStrings
string? connection = config.GetConnectionString("OrderFlow");

Console.WriteLine($"Boutique : {shopName}");
Console.WriteLine($"Max articles : {maxItems}");
Console.WriteLine($"Base : {connection?.Split(';')[1]}");

var app = builder.Build();
app.MapGet("/api/shop", () => new { shopName, maxItems });
app.Run();`,
      output: `$ dotnet run
Boutique : OrderFlow Démo
Max articles : 10
Base : Database=OrderFlow
...

$ curl -i http://localhost:5080/api/shop
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"shopName":"OrderFlow Démo","maxItems":10}`,
      steps: [
        "<code>\"OrderFlow\": { \"ShopName\": ... }</code> : une section à nous dans appsettings.json, à côté de la section standard <code>ConnectionStrings</code>.",
        "<code>config[\"OrderFlow:ShopName\"]</code> : renvoie un <code>string?</code>, <code>null</code> si la clé n'existe pas.",
        "<code>config.GetValue&lt;int&gt;(\"OrderFlow:MaxItemsPerOrder\", 5)</code> : convertit le texte en int, et utilise 5 si la clé est absente.",
        "<code>config.GetConnectionString(\"OrderFlow\")</code> : équivaut à <code>config[\"ConnectionStrings:OrderFlow\"]</code>.",
        "<code>new { shopName, maxItems }</code> : un objet anonyme dont les propriétés prennent le nom des variables."
      ]
    },
    {
      title: "Le pattern Options, validé au démarrage",
      code: `using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

// Relier la section "OrderFlow" à la classe, et la valider au démarrage
builder.Services.AddOptions<OrderFlowOptions>()
    .BindConfiguration(OrderFlowOptions.Section)
    .ValidateDataAnnotations()
    .ValidateOnStart();

var app = builder.Build();

// On reçoit un objet typé, plus de chaînes "OrderFlow:..." partout
app.MapGet("/api/shop", (IOptions<OrderFlowOptions> options) =>
{
    OrderFlowOptions settings = options.Value;
    return new { settings.ShopName, settings.MaxItemsPerOrder };
});

app.Run();

class OrderFlowOptions
{
    public const string Section = "OrderFlow";

    [Required]
    public string ShopName { get; set; } = "";

    [Range(1, 100)]
    public int MaxItemsPerOrder { get; set; }
}`,
      output: `$ curl -i http://localhost:5080/api/shop
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"shopName":"OrderFlow Démo","maxItemsPerOrder":10}

Avec "MaxItemsPerOrder": 0, l'API refuse de démarrer :
Unhandled exception. Microsoft.Extensions.Options.OptionsValidationException: DataAnnotation validation failed for 'OrderFlowOptions' members: 'MaxItemsPerOrder' with the error: 'The field MaxItemsPerOrder must be between 1 and 100.'.`,
      steps: [
        "<code>class OrderFlowOptions</code> : une classe simple avec des propriétés <code>get; set;</code> qui portent les mêmes noms que les clés du JSON.",
        "<code>AddOptions&lt;OrderFlowOptions&gt;().BindConfiguration(\"OrderFlow\")</code> : remplit la classe avec la section <code>OrderFlow</code>.",
        "<code>[Required]</code> et <code>[Range(1, 100)]</code> : des attributs de validation (namespace <code>System.ComponentModel.DataAnnotations</code>).",
        "<code>.ValidateDataAnnotations().ValidateOnStart()</code> : vérifie ces règles dès le démarrage, pas au premier appel.",
        "<code>(IOptions&lt;OrderFlowOptions&gt; options)</code> : injecté comme n'importe quel service ; <code>options.Value</code> donne l'objet rempli.",
        "La seconde partie de la sortie montre l'erreur obtenue en mettant <code>MaxItemsPerOrder</code> à 0 : le message nomme la propriété et la règle violée."
      ],
      explain: "Le fichier appsettings.json est celui de l'exemple précédent."
    },
    {
      title: "Un même code, trois environnements",
      code: `// Fichier : appsettings.Development.json
{
  "OrderFlow": {
    "ShopName": "OrderFlow (DEV)"
  }
}

// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Seulement sur ton poste : une route de diagnostic
    app.MapGet("/debug/config", (IConfiguration config) => new
    {
        Environment = app.Environment.EnvironmentName,
        ShopName = config["OrderFlow:ShopName"],
        MaxItems = config["OrderFlow:MaxItemsPerOrder"]
    });
}

app.MapGet("/api/shop", (IConfiguration config) =>
    $"{config["OrderFlow:ShopName"]} ({app.Environment.EnvironmentName}), max {config["OrderFlow:MaxItemsPerOrder"]} articles");

app.Run();`,
      output: `# 1. dotnet run (Development)
$ curl http://localhost:5080/api/shop
OrderFlow (DEV) (Development), max 10 articles
$ curl http://localhost:5080/debug/config
{"environment":"Development","shopName":"OrderFlow (DEV)","maxItems":"10"}

# 2. ASPNETCORE_ENVIRONMENT=Production
$ curl http://localhost:5080/api/shop
OrderFlow Démo (Production), max 10 articles
$ curl -i http://localhost:5080/debug/config
HTTP/1.1 404 Not Found

# 3. Production + OrderFlow__MaxItemsPerOrder=50
$ curl http://localhost:5080/api/shop
OrderFlow Démo (Production), max 50 articles`,
      steps: [
        "<code>appsettings.Development.json</code> : ne contient que ce qui change. Il est lu après <code>appsettings.json</code>, donc son <code>ShopName</code> gagne en Development.",
        "<code>app.Environment.IsDevelopment()</code> : la route <code>/debug/config</code> n'est déclarée qu'en Development. En Production, elle n'existe pas : 404.",
        "<code>(IConfiguration config)</code> : la configuration elle-même est un service injectable.",
        "Cas 2 : en Production, <code>appsettings.Development.json</code> est ignoré, on retrouve le nom de <code>appsettings.json</code>.",
        "Cas 3 : la variable <code>OrderFlow__MaxItemsPerOrder=50</code> est lue après les fichiers JSON, elle gagne. Le <code>__</code> remplace le <code>:</code>."
      ],
      explain: "Aucune ligne de C# n'a changé entre les trois lancements : seul l'environnement a changé."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire un réglage",
      prompt: `<p>Ajoute dans <code>appsettings.json</code> une section <code>"Support": { "Email": "support@orderflow.test", "Phone": "01 23 45 67 89" }</code>. Écris <code>GET /api/support</code> qui renvoie ces deux valeurs lues avec <code>IConfiguration</code>.</p>`,
      hint: `<p>Injecte <code>IConfiguration config</code> dans l'endpoint et lis <code>config["Support:Email"]</code>.</p>`,
      solution: `// Fichier : appsettings.json (extrait)
// "Support": { "Email": "support@orderflow.test", "Phone": "01 23 45 67 89" }

// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/support", (IConfiguration config) => new
{
    Email = config["Support:Email"],
    Phone = config["Support:Phone"]
});

app.Run();`
    },
    {
      level: "moyen",
      title: "Des options pour la pagination",
      prompt: `<p>Crée une classe <code>PagingOptions</code> (<code>DefaultPageSize</code>, <code>MaxPageSize</code>) liée à la section <code>"Paging"</code>. Valide que <code>MaxPageSize</code> est entre 1 et 200, au démarrage. Utilise ces options dans <code>GET /api/paging</code> qui renvoie les deux valeurs. Teste ensuite avec la variable d'environnement <code>Paging__MaxPageSize=500</code> : l'API doit refuser de démarrer.</p>`,
      hint: `<p>Reprends l'exemple 2 : <code>AddOptions&lt;PagingOptions&gt;().BindConfiguration("Paging").ValidateDataAnnotations().ValidateOnStart()</code>.</p>`,
      solution: `// Fichier : appsettings.json (extrait)
// "Paging": { "DefaultPageSize": 20, "MaxPageSize": 100 }

// Fichier : Program.cs
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<PagingOptions>()
    .BindConfiguration("Paging")
    .ValidateDataAnnotations()
    .ValidateOnStart();

var app = builder.Build();

app.MapGet("/api/paging", (IOptions<PagingOptions> options) => options.Value);

app.Run();

class PagingOptions
{
    [Range(1, 200)]
    public int DefaultPageSize { get; set; } = 20;

    [Range(1, 200)]
    public int MaxPageSize { get; set; } = 100;
}`
    },
    {
      level: "difficile",
      title: "Une règle métier pilotée par la configuration",
      prompt: `<p>Avec <code>OrderFlowOptions</code> (de l'exemple 2), écris <code>POST /api/orders/check</code> qui reçoit <code>{ "quantity": 12 }</code>. Si la quantité dépasse <code>MaxItemsPerOrder</code>, réponds 400 avec un message qui cite la limite ; sinon 200. Ajoute une validation personnalisée avec <code>.Validate(o =&gt; !o.ShopName.Contains("TODO"), "ShopName n'est pas configuré")</code>. Enfin, crée <code>appsettings.Development.json</code> qui fixe la limite à 3 pour tester facilement.</p>`,
      hint: `<p><code>.Validate(...)</code> se chaîne après <code>BindConfiguration</code>, avant <code>ValidateOnStart()</code>. Le corps se lit avec un <code>record CheckRequest(int Quantity)</code>.</p>`,
      solution: `// Fichier : appsettings.Development.json
// { "OrderFlow": { "MaxItemsPerOrder": 3 } }

// Fichier : Program.cs
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<OrderFlowOptions>()
    .BindConfiguration(OrderFlowOptions.Section)
    .ValidateDataAnnotations()
    .Validate(o => !o.ShopName.Contains("TODO"), "ShopName n'est pas configuré")
    .ValidateOnStart();

var app = builder.Build();

app.MapPost("/api/orders/check", (CheckRequest request, IOptions<OrderFlowOptions> options) =>
{
    int max = options.Value.MaxItemsPerOrder;
    return request.Quantity > max
        ? Results.BadRequest($"Maximum {max} articles par commande.")
        : Results.Ok(new { Accepted = true });
});

app.Run();

record CheckRequest(int Quantity);

class OrderFlowOptions
{
    public const string Section = "OrderFlow";

    [Required]
    public string ShopName { get; set; } = "";

    [Range(1, 100)]
    public int MaxItemsPerOrder { get; set; }
}`
    }
  ],
  quiz: [
    {
      q: `<code>appsettings.json</code> dit <code>MaxItemsPerOrder: 10</code> et la variable d'environnement <code>OrderFlow__MaxItemsPerOrder</code> vaut 50. Quelle valeur lit l'API ?`,
      options: ["10", "50", "Une erreur : la clé est en double"],
      answer: 1,
      why: `Les variables d'environnement sont lues après les fichiers JSON, et la dernière source lue gagne. C'est voulu : on surcharge un réglage en production sans toucher aux fichiers.`
    },
    {
      q: `Quelle est la valeur de l'environnement si <code>ASPNETCORE_ENVIRONMENT</code> n'est pas définie ?`,
      options: ["Development", "Staging", "Production"],
      answer: 2,
      why: `Par défaut, c'est Production : le choix le plus prudent. En local, c'est <code>launchSettings.json</code> qui fixe Development quand tu fais <code>dotnet run</code>.`
    },
    {
      q: `Quel est le principal intérêt de <code>ValidateOnStart()</code> ?`,
      options: ["L'API refuse de démarrer si un réglage est invalide, au lieu d'échouer plus tard sur une requête", "Accélérer la lecture de la configuration", "Recharger la configuration à chaud"],
      answer: 0,
      why: `Sans <code>ValidateOnStart</code>, la validation n'a lieu qu'au premier accès à <code>options.Value</code>, donc au premier client. Le rechargement à chaud, c'est le rôle d'<code>IOptionsMonitor</code>.`
    },
    {
      q: `Où ranger le mot de passe de la base pendant le développement ?`,
      options: ["Dans <code>appsettings.json</code>", "Dans les user secrets (<code>dotnet user-secrets</code>)", "En constante dans Program.cs"],
      answer: 1,
      why: `Les user secrets sont stockés sur ta machine, hors du dossier du projet : ils ne partent pas dans Git. <code>appsettings.json</code> et le code source, eux, sont versionnés.`
    }
  ],
  project: `<p><strong>OrderFlow : la configuration.</strong> Dans <code>appsettings.json</code>, ajoute la chaîne de connexion <code>"ConnectionStrings": { "OrderFlow": "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True" }</code> (elle servira en partie 3) et une section <code>"OrderFlow": { "ShopName": "OrderFlow", "MaxItemsPerOrder": 20 }</code>.</p>
<p>Crée <code>OrderFlowOptions</code> avec validation (<code>[Required]</code>, <code>[Range(1, 100)]</code>) et <code>ValidateOnStart()</code>. Fais renvoyer <code>ShopName</code> et l'environnement par <code>GET /api/health</code>. Dans <code>appsettings.Development.json</code>, mets <code>ShopName</code> à <code>"OrderFlow (DEV)"</code>, et vérifie que <code>OrderFlow__MaxItemsPerOrder=0</code> empêche bien l'API de démarrer.</p>`,
  resources: [
    { label: "Configuration dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/configuration/" },
    { label: "Modèle d'options dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/configuration/options" }
  ]
});
