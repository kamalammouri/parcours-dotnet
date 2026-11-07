window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 4 - Construire les endpoints
// 4.x Les controllers
// =====================================================================
window.COURSE.push({
  key: "api-controllers",
  title: "Les controllers : ControllerBase, actions et ActionResult",
  summary: "Tu sauras écrire un controller d'API qui répond aux verbes HTTP avec le bon code de statut.",
  objectives: [
    "Brancher les controllers dans Program.cs avec AddControllers et MapControllers",
    "Écrire des actions avec [HttpGet], [HttpPost] et [HttpDelete]",
    "Choisir entre T, IActionResult et ActionResult&lt;T&gt;",
    "Renvoyer 200, 201, 204 et 404 avec Ok, CreatedAtAction, NoContent et NotFound"
  ],
  analogy: `<p>Pense à un grand restaurant. Chaque <strong>chef de rang</strong> s'occupe d'une zone de tables : l'un des entrées, l'autre des desserts. Dans une API, un <strong>controller</strong> est ce chef de rang : il s'occupe d'une seule ressource, par exemple les produits.</p>
<p>Chaque type de demande qu'il sait traiter (« la carte », « le plat n°3 », « annuler ma commande ») est une <strong>action</strong>. Et ce qu'il rapporte en cuisine n'est pas qu'une assiette : c'est l'assiette <em>plus</em> un ticket qui dit si tout s'est bien passé. C'est l'<code>ActionResult</code> : des données et un code de statut.</p>`,
  lesson: `<h3>Un controller, c'est quoi ?</h3>
<p>Un <strong>controller</strong> est une classe C# qui regroupe les endpoints d'une même ressource. Un <strong>endpoint</strong> (point d'entrée), c'est un couple « verbe HTTP + URL » auquel ton API sait répondre, comme <code>GET /api/products</code>. Chaque méthode publique du controller qui répond à un endpoint s'appelle une <strong>action</strong>.</p>
<p>Pour une API, ton controller hérite de <code>ControllerBase</code>. Il existe aussi une classe <code>Controller</code>, mais elle ajoute la gestion des vues HTML (Razor) : inutile pour une API qui renvoie du JSON.</p>

<h3>Brancher les controllers</h3>
<p>Deux lignes suffisent dans <code>Program.cs</code>. <code>builder.Services.AddControllers()</code> enregistre dans la DI tout ce qu'il faut pour les controllers. <code>app.MapControllers()</code> parcourt tes classes, lit leurs attributs de route et crée les endpoints. Voici le trajet d'une requête :</p>
<div class="flow"><span>Requête HTTP</span><span>Routage</span><span>Controller créé (DI)</span><span>Action</span><span>Réponse JSON</span></div>
<p>Important : ASP.NET Core crée une <strong>nouvelle instance</strong> du controller à chaque requête. Ses dépendances (par exemple ton <code>OrderFlowDbContext</code>) arrivent par le constructeur, exactement comme un service injecté dans un composant Angular.</p>

<h3>Les attributs qui font tout</h3>
<p>Un <strong>attribut</strong>, c'est une étiquette entre crochets posée sur une classe ou une méthode, comme un décorateur <code>@Component</code> en Angular. Trois attributs reviennent sans cesse :</p>
<ul>
<li><code>[ApiController]</code> sur la classe : active les comportements « API » (réponse 400 automatique si les données sont invalides, erreurs au format standard). Mets-le toujours.</li>
<li><code>[Route("api/products")]</code> sur la classe : le préfixe d'URL de toutes les actions. Le jeton <code>[controller]</code> est remplacé par le nom de la classe sans « Controller ».</li>
<li><code>[HttpGet]</code>, <code>[HttpPost]</code>, <code>[HttpPut]</code>, <code>[HttpDelete]</code> sur chaque action : le verbe accepté, avec un morceau d'URL en option, comme <code>[HttpGet("{id}")]</code>.</li>
</ul>
<table>
<tr><th>Opération</th><th>Attribut</th><th>Réponse de succès</th><th>Méthode d'aide</th></tr>
<tr><td>Lister</td><td><code>[HttpGet]</code></td><td>200 OK</td><td><code>Ok(liste)</code></td></tr>
<tr><td>Lire un élément</td><td><code>[HttpGet("{id}")]</code></td><td>200 ou 404</td><td><code>Ok(x)</code> / <code>NotFound()</code></td></tr>
<tr><td>Créer</td><td><code>[HttpPost]</code></td><td>201 Created</td><td><code>CreatedAtAction(…)</code></td></tr>
<tr><td>Remplacer</td><td><code>[HttpPut("{id}")]</code></td><td>204 No Content</td><td><code>NoContent()</code></td></tr>
<tr><td>Supprimer</td><td><code>[HttpDelete("{id}")]</code></td><td>204 No Content</td><td><code>NoContent()</code></td></tr>
</table>

<h3>Que renvoie une action ?</h3>
<p>Tu as trois choix de type de retour. Le plus simple : renvoyer directement un objet (<code>IEnumerable&lt;Product&gt;</code>), et ASP.NET Core répond toujours 200 avec ce JSON. Mais tu ne peux pas renvoyer un 404. À l'opposé, <code>IActionResult</code> peut renvoyer n'importe quel code, mais il ne dit plus quel type de données sort.</p>
<div class="compare"><div><h4>IActionResult</h4><p>Tous les codes possibles, mais le type des données est perdu. Bien pour une action sans corps (DELETE, 204).</p></div><div><h4>ActionResult&lt;T&gt;</h4><p>Tous les codes possibles <em>et</em> le type <code>T</code> est connu. Tu peux écrire <code>return product;</code> ou <code>return NotFound();</code>.</p></div></div>
<p>Les petites méthodes <code>Ok()</code>, <code>NotFound()</code>, <code>NoContent()</code>, <code>BadRequest()</code> et <code>CreatedAtAction()</code> sont fournies par <code>ControllerBase</code>. Elles fabriquent la réponse avec le bon code. <code>CreatedAtAction</code> ajoute en plus l'en-tête <code>Location</code>, qui indique au client l'URL de la ressource créée.</p>
<div class="tip">Ne garde jamais de données dans un champ normal du controller : il est recréé à chaque requête, tout serait perdu. Dans les exemples, une liste <code>static</code> joue le rôle de base de données. Dans OrderFlow, ce sera ton <code>OrderFlowDbContext</code>.</div>

<h3>Et l'asynchrone ?</h3>
<p>En vrai, une action lit la base : elle est donc <code>async</code> et renvoie <code>Task&lt;ActionResult&lt;T&gt;&gt;</code>. Le principe ne change pas : <code>return await …</code> ou <code>return NotFound();</code>.</p>
<div class="note">Ajoute un paramètre <code>CancellationToken cancellationToken</code> à tes actions async et passe-le à EF Core (<code>ToListAsync(cancellationToken)</code>). ASP.NET Core le remplit tout seul : si le client ferme la page, la requête SQL est annulée au lieu de travailler pour rien.</div>`,
  examples: [
    {
      title: "Un premier controller qui liste les produits",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();   // enregistre les services MVC

var app = builder.Build();
app.MapControllers();                // branche les routes des controllers
app.Run();

// Fichier : Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private static readonly List<Product> Products =
    [
        new(1, "Clavier", 49.90m, 12),
        new(2, "Souris", 19.90m, 30)
    ];

    // GET /api/products
    [HttpGet]
    public IEnumerable<Product> GetAll() => Products;
}

public record Product(int Id, string Name, decimal Price, int Stock);`,
      output: `GET /api/products
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"name":"Clavier","price":49.90,"stock":12},{"id":2,"name":"Souris","price":19.90,"stock":30}]`,
      steps: [
        "<code>builder.Services.AddControllers();</code> : on enregistre les services nécessaires aux controllers.",
        "<code>app.MapControllers();</code> : ASP.NET Core cherche toutes les classes controllers et crée leurs routes.",
        "<code>[ApiController]</code> et <code>[Route(\"api/products\")]</code> : la classe devient un controller d'API, et toutes ses actions commencent par <code>/api/products</code>.",
        "<code>public class ProductsController : ControllerBase</code> : on hérite de <code>ControllerBase</code>, la version sans vues.",
        "<code>[HttpGet]</code> : cette action répond à <code>GET /api/products</code>, sans morceau d'URL en plus.",
        "<code>public IEnumerable&lt;Product&gt; GetAll() =&gt; Products;</code> : on renvoie directement la liste. Le framework la transforme en JSON et répond 200. Les noms passent en camelCase (<code>Id</code> devient <code>id</code>)."
      ],
      explain: "Renvoyer directement un objet suffit tant que la réponse est toujours un 200."
    },
    {
      title: "ActionResult<T> : 200 ou 404",
      code: `// Fichier : Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    private static readonly List<Product> Products =
    [
        new(1, "Clavier", 49.90m, 12),
        new(2, "Souris", 19.90m, 30)
    ];

    // GET /api/products/1
    [HttpGet("{id}")]
    public ActionResult<Product> GetById(int id)
    {
        var product = Products.FirstOrDefault(p => p.Id == id);
        if (product is null)
            return NotFound();     // 404

        return product;            // 200 + JSON (conversion implicite)
    }
}

public record Product(int Id, string Name, decimal Price, int Stock);`,
      output: `GET /api/products/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Clavier","price":49.90,"stock":12}

GET /api/products/42
HTTP/1.1 404 Not Found
Content-Type: application/problem+json; charset=utf-8

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.5","title":"Not Found","status":404,"traceId":"00-db5c18876f1ff85a36834bacc55b811b-d0a6dfe12200d2ed-00"}`,
      steps: [
        "<code>[HttpGet(\"{id}\")]</code> : la route devient <code>/api/products/{id}</code>. La partie entre accolades est une variable.",
        "<code>public ActionResult&lt;Product&gt; GetById(int id)</code> : le paramètre <code>id</code> est rempli avec la valeur de l'URL, convertie en <code>int</code>.",
        "<code>return NotFound();</code> : si le produit n'existe pas, on répond 404. Grâce à <code>[ApiController]</code>, le corps est un petit JSON d'erreur standard (on le détaille dans la leçon sur les erreurs).",
        "<code>return product;</code> : un <code>Product</code> se convertit tout seul en <code>ActionResult&lt;Product&gt;</code>, ce qui donne un 200.",
        "<code>Program.cs</code> : identique à l'exemple précédent (<code>AddControllers</code> puis <code>MapControllers</code>)."
      ]
    },
    {
      title: "Créer (201) et supprimer (204)",
      code: `// Fichier : Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]   // [controller] = "products"
public class ProductsController : ControllerBase
{
    private static readonly List<Product> Products = [new(1, "Clavier", 49.90m, 12), new(2, "Souris", 19.90m, 30)];

    [HttpGet("{id}")]
    public ActionResult<Product> GetById(int id)
    {
        var product = Products.FirstOrDefault(p => p.Id == id);
        return product is null ? NotFound() : Ok(product);
    }

    // POST /api/products
    [HttpPost]
    public ActionResult<Product> Create(Product input)
    {
        var product = input with { Id = Products.Max(p => p.Id) + 1 };
        Products.Add(product);
        // 201 + en-tête Location vers GetById
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    // DELETE /api/products/2
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var removed = Products.RemoveAll(p => p.Id == id);
        return removed == 0 ? NotFound() : NoContent();   // 404 ou 204
    }
}

public record Product(int Id, string Name, decimal Price, int Stock);`,
      output: `POST /api/products  {"name":"Webcam","price":189.00,"stock":5}
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: http://localhost:5099/api/Products/3

{"id":3,"name":"Webcam","price":189.00,"stock":5}

GET /api/products/3
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":3,"name":"Webcam","price":189.00,"stock":5}

DELETE /api/products/2
HTTP/1.1 204 No Content

DELETE /api/products/2
HTTP/1.1 404 Not Found
Content-Type: application/problem+json; charset=utf-8

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.5","title":"Not Found","status":404,"traceId":"00-edc6817c2da4df39d01bd114de50b502-032b06414540ff71-00"}`,
      steps: [
        "<code>[Route(\"api/[controller]\")]</code> : le jeton <code>[controller]</code> vaut <code>Products</code>. Regarde l'en-tête <code>Location</code> : il garde la majuscule.",
        "<code>public ActionResult&lt;Product&gt; Create(Product input)</code> : avec <code>[ApiController]</code>, un paramètre de type objet est lu dans le corps JSON de la requête.",
        "<code>input with { Id = … }</code> : on copie le record en remplaçant l'id. C'est le serveur qui choisit l'id, pas le client.",
        "<code>CreatedAtAction(nameof(GetById), new { id = product.Id }, product)</code> : réponse 201, l'en-tête <code>Location</code> pointe vers l'action <code>GetById</code> avec cet id, et le corps contient le produit créé.",
        "<code>public IActionResult Delete(int id)</code> : pas de données à renvoyer, donc <code>IActionResult</code> suffit.",
        "<code>removed == 0 ? NotFound() : NoContent()</code> : le premier DELETE renvoie 204, le second 404 car le produit n'existe plus."
      ],
      explain: "Program.cs est le même qu'avant : seul le controller change."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un CustomersController",
      prompt: `<p>Crée un <code>CustomersController</code> sur la route <code>api/customers</code> avec une action <code>GET</code> qui renvoie une liste statique de deux clients (record <code>Customer(int Id, string Name, string Email)</code>). Teste avec <code>curl http://localhost:5000/api/customers</code> (adapte le port).</p>`,
      hint: `<p>Reprends le premier exemple : <code>[ApiController]</code>, <code>[Route(…)]</code>, <code>: ControllerBase</code>, puis une action <code>[HttpGet]</code>.</p>`,
      solution: `// Fichier : Controllers/CustomersController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private static readonly List<Customer> Customers =
    [
        new(1, "Alice", "alice@example.com"),
        new(2, "Bob", "bob@example.com")
    ];

    [HttpGet]
    public IEnumerable<Customer> GetAll() => Customers;
}

public record Customer(int Id, string Name, string Email);`
    },
    {
      level: "moyen",
      title: "Lire un client par son id",
      prompt: `<p>Ajoute au <code>CustomersController</code> une action <code>GetById</code> sur <code>GET api/customers/{id}</code> qui renvoie 200 avec le client, ou 404 s'il n'existe pas. Utilise <code>ActionResult&lt;Customer&gt;</code>.</p>`,
      hint: `<p><code>FirstOrDefault</code> renvoie <code>null</code> si rien ne correspond. Teste <code>null</code> avec <code>is null</code>.</p>`,
      solution: `[HttpGet("{id}")]
public ActionResult<Customer> GetById(int id)
{
    var customer = Customers.FirstOrDefault(c => c.Id == id);
    if (customer is null)
        return NotFound();
    return customer;
}`
    },
    {
      level: "difficile",
      title: "Modifier un produit avec PUT",
      prompt: `<p>Dans le <code>ProductsController</code> du troisième exemple, ajoute <code>PUT api/products/{id}</code> qui reçoit un <code>Product</code> dans le corps. Règles : si l'id de l'URL et celui du corps diffèrent, réponds 400 (<code>BadRequest()</code>) ; si le produit n'existe pas, 404 ; sinon remplace-le dans la liste et réponds 204.</p>`,
      hint: `<p><code>Products.FindIndex(p =&gt; p.Id == id)</code> renvoie -1 si rien n'est trouvé. Ensuite <code>Products[index] = input;</code>.</p>`,
      solution: `[HttpPut("{id}")]
public IActionResult Update(int id, Product input)
{
    if (id != input.Id)
        return BadRequest();          // 400 : incohérence URL / corps

    var index = Products.FindIndex(p => p.Id == id);
    if (index == -1)
        return NotFound();            // 404

    Products[index] = input;          // on remplace l'ancien produit
    return NoContent();               // 204
}`
    }
  ],
  quiz: [
    {
      q: `De quelle classe hérite un controller d'API ?`,
      options: ["<code>Controller</code>", "<code>ControllerBase</code>", "<code>ApiController</code>"],
      answer: 1,
      why: `<code>ControllerBase</code> fournit tout ce qu'il faut pour une API (<code>Ok</code>, <code>NotFound</code>…). <code>Controller</code> ajoute les vues HTML, inutiles ici. <code>[ApiController]</code> est un attribut, pas une classe de base.`
    },
    {
      q: `Ton action doit renvoyer un produit (200) ou 404. Quel type de retour est le plus adapté ?`,
      options: ["<code>Product</code>", "<code>ActionResult&lt;Product&gt;</code>", "<code>void</code>"],
      answer: 1,
      why: `<code>ActionResult&lt;Product&gt;</code> accepte à la fois un <code>Product</code> (200) et <code>NotFound()</code>. Renvoyer <code>Product</code> seul ne permet pas de répondre 404.`
    },
    {
      q: `Que fait <code>CreatedAtAction(nameof(GetById), new { id = 3 }, product)</code> ?`,
      options: ["Répond 200 avec le produit", "Répond 204 sans corps", "Répond 201 avec le produit et un en-tête Location vers GetById"],
      answer: 2,
      why: `C'est la réponse standard d'une création réussie : 201 Created, l'URL de la nouvelle ressource dans <code>Location</code>, et la ressource dans le corps.`
    },
    {
      q: `Combien d'instances de <code>ProductsController</code> ASP.NET Core crée-t-il ?`,
      options: ["Une par requête", "Une seule pour toute l'application", "Une par action"],
      answer: 0,
      why: `Le controller est recréé à chaque requête. C'est pour ça qu'on ne stocke rien dans ses champs : les données doivent vivre en base (ou, dans nos démos, dans une liste <code>static</code>).`
    }
  ],
  project: `<p><strong>OrderFlow : ton premier controller.</strong> Dans <code>OrderFlow.Api</code>, vérifie que <code>Program.cs</code> appelle <code>AddControllers()</code> et <code>MapControllers()</code>, puis crée <code>Controllers/ProductsController.cs</code> sur <code>api/products</code>. Injecte <code>OrderFlowDbContext</code> par le constructeur et écris deux actions async : <code>GET /api/products</code> (<code>ToListAsync</code>) et <code>GET /api/products/{id}</code> (<code>FindAsync</code>, 404 si <code>null</code>). Ajoute ensuite <code>POST</code> (201 avec <code>CreatedAtAction</code>) et <code>DELETE</code> (204 ou 404). Pour l'instant tu renvoies l'entité <code>Product</code> : on corrigera ça dans la leçon sur les DTOs.</p>`,
  resources: [
    { label: "Créer des API web avec ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/web-api/" },
    { label: "Types de retour des actions (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/web-api/action-return-types" }
  ]
});

// =====================================================================
// Routage et model binding
// =====================================================================
window.COURSE.push({
  key: "api-routing-binding",
  title: "Routage et model binding : d'où viennent les paramètres",
  summary: "Tu sauras écrire des routes avec contraintes et dire, pour chaque paramètre d'action, d'où vient sa valeur.",
  objectives: [
    "Combiner la route du controller et celle de l'action",
    "Ajouter des contraintes de route comme <code>{id:int}</code>",
    "Lire des valeurs depuis la route, la query string, le corps et les en-têtes",
    "Comprendre la réponse 400 automatique quand une valeur ne peut pas être convertie"
  ],
  analogy: `<p>Imagine un colis qui arrive à l'accueil d'une entreprise. L'<strong>adresse</strong> sur l'enveloppe dit pour quel bureau il est (la route). Des <strong>mentions</strong> sur l'étiquette précisent « urgent » ou « fragile » (la query string). Les <strong>tampons</strong> de la poste donnent des infos techniques (les en-têtes). Et le <strong>contenu</strong> du carton, c'est le corps de la requête.</p>
<p>Le <strong>model binding</strong>, c'est l'employé de l'accueil : il ouvre le colis, trie chaque élément et te le tend déjà rangé, au bon format. Toi, tu n'as plus qu'à travailler.</p>`,
  lesson: `<h3>Le routage par attributs</h3>
<p>Le <strong>routage</strong>, c'est le mécanisme qui choisit quelle action exécuter pour une URL donnée. Avec les controllers, on décrit les routes directement sur le code avec des attributs : c'est le <strong>routage par attributs</strong>. La route de la classe et celle de l'action se mettent bout à bout.</p>
<pre class="diagram">
[Route("api/products")]        sur la classe
        +
[HttpGet("by-name/{name}")]    sur l'action
        =
GET /api/products/by-name/{name}
</pre>
<p>Un morceau entre accolades, comme <code>{id}</code>, est un <strong>paramètre de route</strong> : il accepte n'importe quelle valeur à cet endroit de l'URL. Avec <code>{id?}</code>, il devient optionnel. C'est le même principe que <code>path: 'products/:id'</code> dans le routeur Angular.</p>

<h3>Les contraintes de route</h3>
<p>Une <strong>contrainte</strong> limite les valeurs acceptées par un paramètre de route. On l'écrit après deux-points : <code>{id:int}</code> n'accepte que des entiers. Si l'URL ne respecte pas la contrainte, la route ne correspond tout simplement pas : le client reçoit un <strong>404</strong>, pas un 400.</p>
<table>
<tr><th>Contrainte</th><th>Accepte</th><th>Exemple</th></tr>
<tr><td><code>{id:int}</code></td><td>un entier</td><td><code>/api/products/5</code></td></tr>
<tr><td><code>{id:guid}</code></td><td>un Guid</td><td><code>/api/files/3f2c…</code></td></tr>
<tr><td><code>{id:min(1)}</code></td><td>un entier ≥ 1</td><td><code>/api/orders/10</code></td></tr>
<tr><td><code>{code:length(3)}</code></td><td>exactement 3 caractères</td><td><code>/api/currencies/EUR</code></td></tr>
</table>
<div class="tip">Les contraintes servent à <strong>choisir la bonne route</strong> (par exemple distinguer <code>/api/products/5</code> de <code>/api/products/by-name/…</code>), pas à valider des données. La validation a sa propre leçon.</div>

<h3>Le model binding : quatre sources principales</h3>
<p>Le <strong>model binding</strong> (liaison de modèle) remplit les paramètres de ton action à partir de la requête HTTP. Il convertit aussi le texte en bon type : <code>"5"</code> devient l'entier <code>5</code>. Tu peux indiquer la source avec un attribut :</p>
<table>
<tr><th>Attribut</th><th>Source</th><th>Exemple de requête</th></tr>
<tr><td><code>[FromRoute]</code></td><td>un paramètre de la route</td><td><code>/api/products/<strong>7</strong></code></td></tr>
<tr><td><code>[FromQuery]</code></td><td>la query string (après le <code>?</code>)</td><td><code>?page=<strong>2</strong></code></td></tr>
<tr><td><code>[FromBody]</code></td><td>le corps JSON</td><td><code>{"name":"Clavier"}</code></td></tr>
<tr><td><code>[FromHeader]</code></td><td>un en-tête HTTP</td><td><code>X-Request-Id: abc</code></td></tr>
<tr><td><code>[FromServices]</code></td><td>la DI (pas la requête)</td><td>un service enregistré</td></tr>
</table>
<p>Il existe aussi <code>[FromForm]</code> pour les formulaires HTML et l'envoi de fichiers.</p>

<h3>Les règles par défaut avec [ApiController]</h3>
<p>Bonne nouvelle : tu n'as presque jamais besoin d'écrire ces attributs. Avec <code>[ApiController]</code>, ASP.NET Core <strong>devine</strong> la source :</p>
<div class="flow"><span>Nom présent dans la route ?</span><span>→ route</span><span>Type simple ?</span><span>→ query</span><span>Objet → corps JSON</span></div>
<p>Un <strong>type simple</strong>, c'est un <code>int</code>, <code>decimal</code>, <code>bool</code>, <code>string</code>, <code>DateTime</code>, <code>Guid</code>… Un type enregistré dans la DI est injecté automatiquement. Seuls les en-têtes demandent toujours <code>[FromHeader]</code>. Les noms sont comparés sans tenir compte des majuscules : <code>?MinPrice=</code> et <code>?minprice=</code> remplissent le même paramètre.</p>
<p>Un paramètre avec une valeur par défaut (<code>int page = 1</code>) devient optionnel. Un type nullable (<code>decimal? minPrice</code>) vaut <code>null</code> si la valeur est absente : pratique pour les filtres.</p>

<h3>Quand la conversion échoue</h3>
<p>Si le client envoie <code>?page=abc</code>, impossible d'en faire un <code>int</code>. Grâce à <code>[ApiController]</code>, ton action n'est même pas appelée : le client reçoit directement un <strong>400 Bad Request</strong> qui liste les champs en erreur. Pareil si le JSON du corps est mal formé ou contient un mauvais type.</p>
<div class="compare"><div><h4>La route ne correspond pas</h4><p><code>/api/products/abc</code> avec <code>{id:int}</code> : aucune action trouvée, <strong>404</strong>.</p></div><div><h4>La valeur ne se convertit pas</h4><p><code>?page=abc</code> pour un <code>int page</code> : action trouvée mais données invalides, <strong>400</strong>.</p></div></div>
<div class="note">Une action ne peut avoir qu'<strong>un seul</strong> paramètre lu dans le corps : le corps est un flux qu'on ne lit qu'une fois. Si tu as besoin de plusieurs valeurs, regroupe-les dans un seul objet (un record de requête). Et ne mets jamais de données sensibles dans la query string : les URL finissent dans les logs.</div>`,
  examples: [
    {
      title: "Route, contrainte et query string",
      code: `// Fichier : Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    // GET /api/products?minPrice=20&page=2
    [HttpGet]
    public IActionResult Search(decimal? minPrice, int page = 1, int pageSize = 10)
        => Ok(new { minPrice, page, pageSize });

    // GET /api/products/5  (id doit être un entier)
    [HttpGet("{id:int}")]
    public IActionResult GetById(int id)
        => Ok(new { action = "GetById", id });

    // GET /api/products/by-name/souris
    [HttpGet("by-name/{name}")]
    public IActionResult GetByName(string name)
        => Ok(new { action = "GetByName", name });
}`,
      output: `GET /api/products?minPrice=20&page=2
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"minPrice":20,"page":2,"pageSize":10}

GET /api/products
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"minPrice":null,"page":1,"pageSize":10}

GET /api/products/5
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"action":"GetById","id":5}

GET /api/products/by-name/souris
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"action":"GetByName","name":"souris"}

GET /api/products/abc
HTTP/1.1 404 Not Found`,
      steps: [
        "<code>Search(decimal? minPrice, int page = 1, int pageSize = 10)</code> : trois types simples absents de la route, donc lus dans la query string.",
        "<code>?minPrice=20&amp;page=2</code> : <code>minPrice</code> vaut 20, <code>page</code> vaut 2, et <code>pageSize</code> garde sa valeur par défaut 10.",
        "<code>GET /api/products</code> sans query : <code>minPrice</code> vaut <code>null</code> car il est nullable.",
        "<code>[HttpGet(\"{id:int}\")]</code> : la route n'accepte que des entiers. <code>/api/products/5</code> arrive ici.",
        "<code>[HttpGet(\"by-name/{name}\")]</code> : un segment fixe <code>by-name</code> puis un paramètre texte.",
        "<code>GET /api/products/abc</code> : <code>abc</code> n'est pas un entier et aucune autre route ne correspond, d'où un 404 sans corps."
      ],
      explain: "Program.cs est le même que dans la leçon sur les controllers."
    },
    {
      title: "Quatre sources dans une seule action",
      code: `// Fichier : Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    // PUT /api/products/7?dryRun=true
    [HttpPut("{id:int}")]
    public IActionResult Update(
        [FromRoute] int id,                                    // l'URL
        [FromBody] ProductInput input,                         // le corps JSON
        [FromHeader(Name = "X-Request-Id")] string? requestId, // un en-tête
        [FromQuery] bool dryRun = false)                       // la query string
    {
        return Ok(new { id, input.Name, input.Price, requestId, dryRun });
    }
}

public record ProductInput(string Name, decimal Price);`,
      output: `PUT /api/products/7?dryRun=true  {"name":"Clavier RGB","price":59.90}
X-Request-Id: abc-123
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":7,"name":"Clavier RGB","price":59.90,"requestId":"abc-123","dryRun":true}`,
      steps: [
        "<code>[FromRoute] int id</code> : la valeur 7 vient de l'URL <code>/api/products/7</code>.",
        "<code>[FromBody] ProductInput input</code> : le JSON du corps est converti en record <code>ProductInput</code>.",
        "<code>[FromHeader(Name = \"X-Request-Id\")]</code> : on lit l'en-tête <code>X-Request-Id</code>. Le paramètre est nullable car l'en-tête peut manquer.",
        "<code>[FromQuery] bool dryRun = false</code> : <code>?dryRun=true</code> donne <code>true</code>.",
        "<code>Ok(new { id, input.Name, … })</code> : un objet anonyme pour renvoyer tout ce qu'on a reçu et vérifier le binding."
      ],
      explain: "Ici les attributs sont écrits pour être explicites ; seul [FromHeader] est vraiment obligatoire."
    },
    {
      title: "Tableau en query et erreurs de binding",
      code: `// Fichier : Controllers/ProductsController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/products")]
public class ProductsController : ControllerBase
{
    // GET /api/products/batch?ids=1&ids=3
    [HttpGet("batch")]
    public IActionResult GetMany([FromQuery] int[] ids)
        => Ok(new { count = ids.Length, ids });

    // GET /api/products?page=2
    [HttpGet]
    public IActionResult List(int page = 1) => Ok(new { page });

    // POST /api/products  (corps JSON)
    [HttpPost]
    public IActionResult Create(ProductInput input) => Ok(input);
}

public record ProductInput(string Name, decimal Price);`,
      output: `GET /api/products/batch?ids=1&ids=3
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"count":2,"ids":[1,3]}

GET /api/products?page=abc
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json; charset=utf-8

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1","title":"One or more validation errors occurred.","status":400,"errors":{"page":["The value 'abc' is not valid."]},"traceId":"00-9700f0687bc7aaad3bb17cd7b05c4981-72b23615f5f4c442-00"}

POST /api/products  {"name":"Clavier","price":"cher"}
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json; charset=utf-8

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1","title":"One or more validation errors occurred.","status":400,"errors":{"input":["The input field is required."],"$.price":["The JSON value could not be converted to ProductInput. Path: $.price | LineNumber: 0 | BytePositionInLine: 32."]},"traceId":"00-8e8f89451511be94c21ab8bbc9b880a5-fcd231bc0e0acc8b-00"}`,
      steps: [
        "<code>[FromQuery] int[] ids</code> : on répète la clé dans l'URL (<code>?ids=1&amp;ids=3</code>) pour obtenir un tableau.",
        "<code>GET /api/products?page=abc</code> : impossible de convertir <code>abc</code> en <code>int</code>. L'action n'est pas appelée, la réponse est un 400.",
        "<code>\"errors\":{\"page\":[…]}</code> : la réponse dit précisément quel champ pose problème.",
        "<code>{\"price\":\"cher\"}</code> : le JSON contient du texte là où on attend un <code>decimal</code>. Le désérialiseur échoue, d'où l'erreur sur <code>$.price</code>.",
        "<code>\"input\":[\"The input field is required.\"]</code> : comme le corps n'a pas pu être lu, le paramètre <code>input</code> est considéré comme manquant."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Filtrer les commandes",
      prompt: `<p>Dans un <code>OrdersController</code> (route <code>api/orders</code>), écris une action <code>GET</code> qui reçoit <code>string? status</code> et <code>int page = 1</code> depuis la query string, et renvoie simplement <code>Ok(new { status, page })</code>. Teste <code>/api/orders?status=Pending</code>.</p>`,
      hint: `<p>Pas besoin d'attribut : deux types simples absents de la route sont lus dans la query string.</p>`,
      solution: `// Fichier : Controllers/OrdersController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    // GET /api/orders?status=Pending&page=1
    [HttpGet]
    public IActionResult Search(string? status, int page = 1)
        => Ok(new { status, page });
}`
    },
    {
      level: "moyen",
      title: "Les commandes d'un client",
      prompt: `<p>Ajoute une action sur <code>GET api/customers/{customerId}/orders</code> où <code>customerId</code> doit être un entier supérieur ou égal à 1. Renvoie <code>Ok(new { customerId })</code>. Vérifie que <code>/api/customers/0/orders</code> donne 404.</p>`,
      hint: `<p>Les contraintes se combinent : <code>{customerId:int:min(1)}</code>. Une route qui commence par <code>/</code> ou <code>~/</code> sur l'action ignore le préfixe du controller.</p>`,
      solution: `// Dans OrdersController
// Le "/" initial ignore le [Route("api/orders")] de la classe
[HttpGet("/api/customers/{customerId:int:min(1)}/orders")]
public IActionResult GetByCustomer(int customerId)
    => Ok(new { customerId });`
    },
    {
      level: "difficile",
      title: "Ajuster le stock",
      prompt: `<p>Écris <code>PATCH api/products/{id:int}/stock</code> qui reçoit dans le corps un record <code>StockChange(int Delta)</code> et un en-tête obligatoire <code>X-User</code>. L'action part d'un stock fictif de 10 et renvoie <code>{ id, newStock, changedBy }</code>. Teste avec <code>curl -X PATCH … -H "Content-Type: application/json" -H "X-User: kamal" -d '{"delta":-3}'</code>.</p>`,
      hint: `<p><code>[HttpPatch(\"{id:int}/stock\")]</code>. Pour l'en-tête : <code>[FromHeader(Name = \"X-User\")] string user</code>. Comme <code>string</code> n'est pas nullable, l'en-tête devient obligatoire et son absence donne un 400.</p>`,
      solution: `[HttpPatch("{id:int}/stock")]
public IActionResult ChangeStock(
    int id,
    StockChange change,
    [FromHeader(Name = "X-User")] string user)
{
    var newStock = 10 + change.Delta;   // stock fictif de départ : 10
    return Ok(new { id, newStock, changedBy = user });
}

public record StockChange(int Delta);`
    }
  ],
  quiz: [
    {
      q: `Avec <code>[ApiController]</code>, d'où vient le paramètre <code>int page</code> d'une action routée sur <code>api/products</code> ?`,
      options: ["Du corps JSON", "De la query string", "D'un en-tête"],
      answer: 1,
      why: `<code>page</code> est un type simple et n'apparaît pas dans la route : il est donc lu dans la query string (<code>?page=2</code>). Seuls les objets complexes sont lus dans le corps.`
    },
    {
      q: `La route est <code>{id:int}</code> et le client appelle <code>/api/products/abc</code>. Que reçoit-il ?`,
      options: ["400 Bad Request", "500 Internal Server Error", "404 Not Found"],
      answer: 2,
      why: `La contrainte empêche la route de correspondre : aucune action n'est trouvée, donc 404. Le 400 arrive quand l'action est trouvée mais qu'une valeur ne se convertit pas (par exemple <code>?page=abc</code>).`
    },
    {
      q: `Quel attribut est indispensable pour lire un en-tête HTTP ?`,
      options: ["<code>[FromHeader]</code>", "<code>[FromQuery]</code>", "Aucun, c'est automatique"],
      answer: 0,
      why: `L'inférence de <code>[ApiController]</code> ne regarde jamais les en-têtes. Il faut écrire <code>[FromHeader(Name = "X-…")]</code>.`
    },
    {
      q: `Combien de paramètres une action peut-elle lire dans le corps de la requête ?`,
      options: ["Autant qu'on veut", "Un seul", "Deux maximum"],
      answer: 1,
      why: `Le corps est un flux lu une seule fois. Pour plusieurs valeurs, on les regroupe dans un seul objet, par exemple un record <code>CreateOrderRequest</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : filtres et routes propres.</strong> Dans <code>ProductsController</code>, ajoute la contrainte <code>{id:int}</code> sur toutes les routes avec id, puis fais accepter à <code>GET /api/products</code> les filtres optionnels <code>minPrice</code>, <code>maxPrice</code>, <code>page</code> (défaut 1) et <code>pageSize</code> (défaut 20) : applique-les avec <code>Where</code>, <code>Skip</code> et <code>Take</code> avant <code>ToListAsync</code>. Crée aussi <code>OrdersController</code> avec <code>GET /api/orders?status=Pending</code> (filtre optionnel sur <code>Status</code>) et <code>GET /api/orders/{id:int}</code>.</p>`,
  resources: [
    { label: "Routage vers les actions de contrôleur (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/mvc/controllers/routing" },
    { label: "Liaison de données (model binding) (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/mvc/models/model-binding" }
  ]
});

// =====================================================================
// Minimal APIs
// =====================================================================
window.COURSE.push({
  key: "api-minimal",
  title: "Les Minimal APIs : MapGet, MapPost et groupes de routes",
  summary: "Tu sauras écrire des endpoints sans controller, les regrouper avec MapGroup et les ranger proprement dans des fichiers.",
  objectives: [
    "Déclarer un endpoint avec MapGet, MapPost, MapPut et MapDelete",
    "Renvoyer des réponses avec Results et TypedResults",
    "Regrouper des routes sous un préfixe commun avec MapGroup",
    "Organiser les endpoints d'une ressource dans une méthode d'extension"
  ],
  analogy: `<p>Un controller, c'est le restaurant classique : salle, chefs de rang, carte reliée. Une <strong>Minimal API</strong>, c'est le <strong>food truck</strong> : la même cuisine, mais sans la salle. Tu commandes au comptoir, on te sert directement.</p>
<p>Moins de structure, donc moins de cérémonie. Mais si le food truck vend vingt plats, il lui faut quand même une carte bien rangée : ce sont les <strong>groupes de routes</strong>.</p>`,
  lesson: `<h3>Un endpoint en une ligne</h3>
<p>Avec les Minimal APIs, pas de classe ni d'attribut : tu déclares chaque endpoint directement sur <code>app</code>, dans <code>Program.cs</code>. <code>app.MapGet("/api/products", () =&gt; products)</code> signifie « pour un <code>GET</code> sur cette URL, exécute cette fonction ». Il existe <code>MapGet</code>, <code>MapPost</code>, <code>MapPut</code>, <code>MapPatch</code> et <code>MapDelete</code>.</p>
<p>La fonction s'appelle le <strong>handler</strong> (gestionnaire). Ce peut être une lambda, comme une fonction fléchée en TypeScript, ou une méthode classique. Ce qu'elle renvoie devient la réponse : un objet donne un 200 avec du JSON, une <code>string</code> donne un 200 en texte brut.</p>

<h3>Les paramètres : mêmes règles que les controllers</h3>
<p>Les paramètres du handler sont remplis par le même mécanisme de binding que tu connais. Un nom présent dans la route vient de la route, un type simple vient de la query string, un objet vient du corps JSON, et un service enregistré dans la DI est injecté. Les attributs <code>[FromQuery]</code>, <code>[FromHeader]</code>… fonctionnent aussi.</p>
<div class="flow"><span>Requête</span><span>Route trouvée</span><span>Paramètres remplis</span><span>Handler</span><span>IResult</span></div>
<p>Pas besoin de <code>AddControllers()</code> ni de <code>[ApiController]</code> : tout est déjà actif.</p>

<h3>Results ou TypedResults ?</h3>
<p>Pour choisir le code de statut, on renvoie un <code>IResult</code>, l'équivalent de <code>IActionResult</code>. Deux classes en fabriquent : <code>Results</code> et <code>TypedResults</code>. Elles ont les mêmes méthodes : <code>Ok</code>, <code>NotFound</code>, <code>Created</code>, <code>NoContent</code>, <code>BadRequest</code>…</p>
<div class="compare"><div><h4>Results.Ok(x)</h4><p>Renvoie le type général <code>IResult</code>. Pratique, mais l'outil de documentation (OpenAPI) ne sait pas quelles réponses sont possibles.</p></div><div><h4>TypedResults.Ok(x)</h4><p>Renvoie le type précis <code>Ok&lt;Product&gt;</code>. La documentation et les tests unitaires savent exactement ce qui sort.</p></div></div>
<p>Quand un handler peut renvoyer deux réponses différentes, on déclare un type union : <code>Results&lt;Ok&lt;Product&gt;, NotFound&gt;</code>. Ça ressemble à <code>Product | null</code> en TypeScript : le compilateur vérifie que tu ne renvoies rien d'autre.</p>
<div class="tip">Préfère <code>TypedResults</code> dans du vrai code. Garde <code>Results</code> pour les petits tests rapides, ou quand le handler doit renvoyer <code>IResult</code> sans type union.</div>

<h3>Les groupes de routes</h3>
<p>Répéter <code>"/api/products"</code> sur chaque endpoint est pénible et source de fautes de frappe. <code>app.MapGroup("/api/products")</code> crée un <strong>groupe</strong> : chaque <code>Map…</code> fait sur le groupe ajoute son morceau d'URL au préfixe. C'est l'équivalent de <code>[Route]</code> sur un controller.</p>
<pre class="diagram">
group = MapGroup("/api/products")
  |
  +-- MapGet("/{id:int}")   GET    /api/products/5
  +-- MapPost("/")          POST   /api/products
  +-- MapDelete("/{id:int}") DELETE /api/products/5
</pre>
<p>Un groupe permet aussi d'appliquer un réglage à tous ses endpoints d'un coup : un tag pour la documentation (<code>WithTags</code>), plus tard une autorisation (<code>RequireAuthorization</code>).</p>

<h3>Ranger ses endpoints</h3>
<p>Si tout reste dans <code>Program.cs</code>, il devient vite illisible. La convention : une classe statique par ressource avec une <strong>méthode d'extension</strong> (tu les as vues en partie 1) comme <code>MapProductEndpoints</code>. <code>Program.cs</code> n'a plus qu'une ligne par ressource, et les handlers deviennent des méthodes nommées, faciles à lire et à tester.</p>
<table>
<tr><th></th><th>Controllers</th><th>Minimal APIs</th></tr>
<tr><td>Structure</td><td>Classe + attributs</td><td><code>MapGet</code> + handlers</td></tr>
<tr><td>Préfixe commun</td><td><code>[Route]</code> sur la classe</td><td><code>MapGroup</code></td></tr>
<tr><td>Réponses</td><td><code>ActionResult&lt;T&gt;</code></td><td><code>Results&lt;…&gt;</code> / <code>TypedResults</code></td></tr>
<tr><td>Validation automatique</td><td>Avec <code>[ApiController]</code></td><td>Avec <code>AddValidation()</code> (.NET 10)</td></tr>
</table>
<div class="note">Microsoft recommande les Minimal APIs pour les nouveaux projets : elles démarrent plus vite et sont un peu plus performantes. Les controllers restent très présents en entreprise. Les deux cohabitent sans problème dans la même application : apprends à lire les deux.</div>`,
  examples: [
    {
      title: "Deux endpoints dans Program.cs",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<Product> products =
[
    new(1, "Clavier", 49.90m, 12),
    new(2, "Souris", 19.90m, 30)
];

// GET /api/products?maxPrice=30
app.MapGet("/api/products", (decimal? maxPrice) =>
    products.Where(p => maxPrice is null || p.Price <= maxPrice));

// GET /api/products/1
app.MapGet("/api/products/{id:int}", (int id) =>
{
    var product = products.FirstOrDefault(p => p.Id == id);
    return product is null ? Results.NotFound() : Results.Ok(product);
});

app.Run();

record Product(int Id, string Name, decimal Price, int Stock);`,
      output: `GET /api/products?maxPrice=30
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":2,"name":"Souris","price":19.90,"stock":30}]

GET /api/products/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Clavier","price":49.90,"stock":12}

GET /api/products/9
HTTP/1.1 404 Not Found`,
      steps: [
        "<code>List&lt;Product&gt; products = [...]</code> : une liste en mémoire qui joue le rôle de la base. Les lambdas peuvent l'utiliser car elle est dans la même portée.",
        "<code>app.MapGet(\"/api/products\", (decimal? maxPrice) =&gt; …)</code> : <code>maxPrice</code> n'est pas dans la route, il vient donc de la query string.",
        "<code>products.Where(…)</code> : on renvoie directement la séquence filtrée, sérialisée en JSON avec un 200.",
        "<code>\"/api/products/{id:int}\"</code> : les contraintes de route marchent exactement comme avec les controllers.",
        "<code>Results.NotFound()</code> / <code>Results.Ok(product)</code> : on choisit le code de statut. Ici, le 404 n'a pas de corps : sans configuration, les Minimal APIs ne produisent pas de JSON d'erreur (on verra comment dans la leçon sur les erreurs)."
      ],
      explain: "Pas de AddControllers, pas d'attribut : l'API tient dans un seul fichier."
    },
    {
      title: "Un groupe avec TypedResults",
      code: `// Fichier : Program.cs
using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<Product> products = [new(1, "Clavier", 49.90m, 12)];

// Toutes les routes du groupe commencent par /api/products
var group = app.MapGroup("/api/products");

group.MapGet("/{id:int}", Results<Ok<Product>, NotFound> (int id) =>
{
    var product = products.FirstOrDefault(p => p.Id == id);
    return product is null ? TypedResults.NotFound() : TypedResults.Ok(product);
});

group.MapPost("/", (Product input) =>
{
    var product = input with { Id = products.Max(p => p.Id) + 1 };
    products.Add(product);
    return TypedResults.Created($"/api/products/{product.Id}", product);
});

group.MapDelete("/{id:int}", Results<NoContent, NotFound> (int id) =>
    products.RemoveAll(p => p.Id == id) > 0
        ? TypedResults.NoContent()
        : TypedResults.NotFound());

app.Run();

record Product(int Id, string Name, decimal Price, int Stock);`,
      output: `POST /api/products  {"name":"Webcam","price":89.00,"stock":5}
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/products/2

{"id":2,"name":"Webcam","price":89.00,"stock":5}

GET /api/products/2
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":2,"name":"Webcam","price":89.00,"stock":5}

DELETE /api/products/1
HTTP/1.1 204 No Content

GET /api/products/1
HTTP/1.1 404 Not Found`,
      steps: [
        "<code>using Microsoft.AspNetCore.Http.HttpResults;</code> : l'espace de noms des types <code>Ok&lt;T&gt;</code>, <code>NotFound</code>, <code>Results&lt;…&gt;</code>.",
        "<code>var group = app.MapGroup(\"/api/products\");</code> : toutes les routes du groupe commencent par ce préfixe.",
        "<code>Results&lt;Ok&lt;Product&gt;, NotFound&gt; (int id) =&gt;</code> : on écrit le type de retour devant la lambda. Le handler ne peut renvoyer que ces deux réponses.",
        "<code>group.MapPost(\"/\", (Product input) =&gt; …)</code> : un objet en paramètre est lu dans le corps JSON.",
        "<code>TypedResults.Created($\"/api/products/{product.Id}\", product)</code> : 201 avec l'en-tête <code>Location</code> qu'on construit nous-mêmes.",
        "<code>RemoveAll(…) &gt; 0 ? TypedResults.NoContent() : TypedResults.NotFound()</code> : 204 si on a supprimé quelque chose, 404 sinon."
      ]
    },
    {
      title: "Ranger les endpoints dans une classe",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<ProductStore>();   // un service injectable

var app = builder.Build();
app.MapProductEndpoints();                        // une ligne par fonctionnalité
app.Run();

// Fichier : Endpoints/ProductEndpoints.cs
public static class ProductEndpoints
{
    public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/products").WithTags("Products");

        group.MapGet("/", GetAll);
        group.MapGet("/{id:int}", GetById).WithName("GetProductById");
        return app;
    }

    // ProductStore vient de la DI, id vient de la route
    static IResult GetAll(ProductStore store) => TypedResults.Ok(store.Items);

    static IResult GetById(int id, ProductStore store) =>
        store.Items.FirstOrDefault(p => p.Id == id) is { } product
            ? TypedResults.Ok(product)
            : TypedResults.NotFound();
}

public class ProductStore
{
    public List<Product> Items { get; } = [new(1, "Clavier", 49.90m, 12)];
}

public record Product(int Id, string Name, decimal Price, int Stock);`,
      output: `GET /api/products
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"name":"Clavier","price":49.90,"stock":12}]

GET /api/products/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Clavier","price":49.90,"stock":12}`,
      steps: [
        "<code>builder.Services.AddSingleton&lt;ProductStore&gt;();</code> : on enregistre un service qui contient les données.",
        "<code>app.MapProductEndpoints();</code> : <code>Program.cs</code> reste court, une ligne par ressource.",
        "<code>public static IEndpointRouteBuilder MapProductEndpoints(this IEndpointRouteBuilder app)</code> : une méthode d'extension sur <code>app</code>. Elle renvoie <code>app</code> pour pouvoir enchaîner les appels.",
        "<code>.WithTags(\"Products\")</code> et <code>.WithName(\"GetProductById\")</code> : des métadonnées utiles pour la documentation OpenAPI et pour générer des liens.",
        "<code>static IResult GetById(int id, ProductStore store)</code> : <code>id</code> vient de la route, <code>store</code> vient de la DI. Le binding fonctionne aussi avec des méthodes nommées.",
        "<code>is { } product</code> : un motif qui teste « non null » et range la valeur dans <code>product</code> en une seule fois."
      ],
      explain: "C'est la structure à reprendre dans un vrai projet : un fichier Endpoints par ressource."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un endpoint de santé",
      prompt: `<p>Dans une application vide, ajoute <code>GET /api/ping</code> qui renvoie l'objet <code>{ status = "ok", time = DateTime.UtcNow }</code>. Teste-le avec <code>curl</code>.</p>`,
      hint: `<p><code>app.MapGet("/api/ping", () =&gt; new { … });</code> : un objet anonyme est sérialisé en JSON.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/api/ping", () => new { status = "ok", time = DateTime.UtcNow });

app.Run();`
    },
    {
      level: "moyen",
      title: "Un groupe pour les clients",
      prompt: `<p>Crée un groupe <code>/api/customers</code> avec une liste en mémoire de clients (record <code>Customer(int Id, string Name)</code>). Ajoute <code>GET /</code> (toute la liste) et <code>GET /{id:int}</code> qui renvoie <code>Results&lt;Ok&lt;Customer&gt;, NotFound&gt;</code>.</p>`,
      hint: `<p>Reprends le deuxième exemple. N'oublie pas <code>using Microsoft.AspNetCore.Http.HttpResults;</code>.</p>`,
      solution: `using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

List<Customer> customers = [new(1, "Alice"), new(2, "Bob")];
var group = app.MapGroup("/api/customers");

group.MapGet("/", () => TypedResults.Ok(customers));

group.MapGet("/{id:int}", Results<Ok<Customer>, NotFound> (int id) =>
    customers.FirstOrDefault(c => c.Id == id) is { } customer
        ? TypedResults.Ok(customer)
        : TypedResults.NotFound());

app.Run();

record Customer(int Id, string Name);`
    },
    {
      level: "difficile",
      title: "CustomerEndpoints dans son fichier",
      prompt: `<p>Déplace le groupe de l'exercice précédent dans une classe statique <code>CustomerEndpoints</code> avec une méthode d'extension <code>MapCustomerEndpoints</code>. Les données viennent d'un service <code>CustomerStore</code> enregistré en singleton. Ajoute un <code>POST /</code> qui crée un client (id = max + 1) et renvoie 201 avec <code>Location</code>.</p>`,
      hint: `<p>Les handlers deviennent des méthodes <code>static</code> avec <code>CustomerStore store</code> en paramètre. Pour le POST : <code>TypedResults.Created($\"/api/customers/{customer.Id}\", customer)</code>.</p>`,
      solution: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<CustomerStore>();
var app = builder.Build();
app.MapCustomerEndpoints();
app.Run();

// Fichier : Endpoints/CustomerEndpoints.cs
public static class CustomerEndpoints
{
    public static IEndpointRouteBuilder MapCustomerEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/customers").WithTags("Customers");
        group.MapGet("/", (CustomerStore store) => TypedResults.Ok(store.Items));
        group.MapPost("/", Create);
        return app;
    }

    static IResult Create(Customer input, CustomerStore store)
    {
        var customer = input with { Id = store.Items.Max(c => c.Id) + 1 };
        store.Items.Add(customer);
        return TypedResults.Created($"/api/customers/{customer.Id}", customer);
    }
}

public class CustomerStore
{
    public List<Customer> Items { get; } = [new(1, "Alice")];
}

public record Customer(int Id, string Name);`
    }
  ],
  quiz: [
    {
      q: `Dans <code>app.MapGet("/api/orders/{id:int}", (int id, OrderStore store) =&gt; …)</code>, d'où vient <code>store</code> ?`,
      options: ["De la query string", "Du conteneur d'injection de dépendances", "Du corps de la requête"],
      answer: 1,
      why: `Un type enregistré dans la DI est injecté automatiquement dans le handler. <code>id</code>, lui, vient de la route car son nom y figure.`
    },
    {
      q: `Quel est l'intérêt principal de <code>TypedResults</code> par rapport à <code>Results</code> ?`,
      options: ["Il est plus rapide à taper", "Il renvoie des codes de statut différents", "Le type exact de la réponse est connu (documentation OpenAPI, tests)"],
      answer: 2,
      why: `Les deux produisent les mêmes réponses HTTP. <code>TypedResults.Ok(x)</code> renvoie <code>Ok&lt;T&gt;</code> au lieu de <code>IResult</code>, ce que la documentation et les tests peuvent exploiter.`
    },
    {
      q: `<code>var g = app.MapGroup("/api/products"); g.MapDelete("/{id:int}", …);</code> Quelle URL répond ?`,
      options: ["<code>DELETE /api/products/5</code>", "<code>DELETE /5</code>", "<code>DELETE /api/products/{id}/5</code>"],
      answer: 0,
      why: `Le groupe ajoute son préfixe devant chaque route déclarée dessus : <code>/api/products</code> + <code>/{id:int}</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : les clients en Minimal APIs.</strong> Crée <code>Endpoints/CustomerEndpoints.cs</code> avec <code>MapCustomerEndpoints</code> : un groupe <code>/api/customers</code> qui injecte <code>OrderFlowDbContext</code> dans ses handlers async. Écris <code>GET /</code>, <code>GET /{id:int}</code> (<code>Results&lt;Ok&lt;Customer&gt;, NotFound&gt;</code>) et <code>POST /</code> (201 avec <code>Location</code>). Appelle <code>app.MapCustomerEndpoints();</code> dans <code>Program.cs</code>, à côté de <code>MapControllers()</code> : tes controllers Products et Orders continuent de fonctionner.</p>`,
  resources: [
    { label: "Vue d'ensemble des API minimales (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/minimal-apis/overview" },
    { label: "Créer des réponses dans les API minimales (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/minimal-apis/responses" }
  ]
});

// =====================================================================
// DTOs
// =====================================================================
window.COURSE.push({
  key: "api-dtos",
  title: "Les DTOs : ne jamais exposer ses entités",
  summary: "Tu sauras séparer ce que stocke ta base de ce que voit le client, avec des DTOs d'entrée et de sortie et un mapping simple.",
  objectives: [
    "Expliquer les trois dangers d'une entité exposée dans une API",
    "Écrire des DTOs en records : un pour l'entrée, un pour la sortie",
    "Convertir entité et DTO avec des méthodes de mapping",
    "Construire un DTO directement avec une projection <code>Select</code>"
  ],
  analogy: `<p>Quand tu postules à un emploi, tu envoies ton <strong>CV</strong>, pas ton dossier médical ni tes relevés bancaires. Le CV est une version choisie de toi, adaptée à celui qui le lit.</p>
<p>Un <strong>DTO</strong> est le CV de tes données. L'entité, c'est le dossier complet rangé en base. Et dans l'autre sens, le formulaire de candidature ne te laisse remplir que certaines cases : tu ne choisis pas toi-même ton salaire ni ton numéro d'employé.</p>`,
  lesson: `<h3>Le problème : renvoyer l'entité telle quelle</h3>
<p>Jusqu'ici, nos actions renvoyaient directement l'entité (<code>Product</code>, <code>Customer</code>). C'est rapide, mais dangereux. Une <strong>entité</strong> est la classe qui représente une table pour EF Core. Elle a été pensée pour la base, pas pour le client. La renvoyer pose trois problèmes :</p>
<ul>
<li><strong>Fuite de données</strong> : toutes les propriétés partent en JSON, y compris un <code>PasswordHash</code> ou une note interne.</li>
<li><strong>Overposting</strong> (sur-affectation) : si tu reçois une entité en entrée, le client peut envoyer des champs qu'il ne devrait pas contrôler, comme <code>Id</code>, <code>Stock</code> ou <code>Status</code>.</li>
<li><strong>Couplage</strong> : renommer une colonne casse le contrat de l'API et donc le front Angular. Et les propriétés de navigation qui se pointent l'une l'autre (<code>Order.Lines</code> → <code>OrderLine.Order</code>) font planter la sérialisation JSON avec une erreur de cycle.</li>
</ul>

<h3>Un DTO, c'est quoi ?</h3>
<p>Un <strong>DTO</strong> (<em>Data Transfer Object</em>, objet de transfert de données) est une petite classe sans logique, qui décrit exactement la forme des données échangées avec le client. En C#, on l'écrit presque toujours en <code>record</code> positionnel : une ligne, immuable, avec l'égalité par valeur.</p>
<p>C'est l'équivalent de tes <code>interface ProductDto { … }</code> côté Angular : d'ailleurs, ces deux définitions doivent correspondre, c'est le <strong>contrat</strong> entre le front et le back.</p>
<div class="flow"><span>JSON du client</span><span>DTO d'entrée</span><span>Entité</span><span>Base de données</span></div>
<div class="flow"><span>Base de données</span><span>Entité</span><span>DTO de sortie</span><span>JSON du client</span></div>

<h3>Un DTO par usage</h3>
<p>On ne fait pas un DTO unique par entité, mais un par <strong>usage</strong>. L'entrée et la sortie n'ont presque jamais les mêmes champs : le client ne fournit pas l'id à la création, mais il le reçoit dans la réponse.</p>
<table>
<tr><th>DTO</th><th>Sens</th><th>Contient</th></tr>
<tr><td><code>CreateProductRequest</code></td><td>entrée (POST)</td><td>Name, Price</td></tr>
<tr><td><code>UpdateProductRequest</code></td><td>entrée (PUT)</td><td>Name, Price, Stock</td></tr>
<tr><td><code>ProductDto</code></td><td>sortie</td><td>Id, Name, Price, InStock</td></tr>
<tr><td><code>OrderDto</code></td><td>sortie</td><td>Id, CustomerName, Lines, Total</td></tr>
</table>
<p>Remarque que la sortie peut contenir des champs <strong>calculés</strong> (<code>InStock</code>, <code>Total</code>) ou <strong>aplatis</strong> (<code>CustomerName</code> au lieu de tout l'objet <code>Customer</code>). Le client reçoit ce dont il a besoin, rien de plus.</p>

<h3>Le mapping : passer de l'un à l'autre</h3>
<p>Le <strong>mapping</strong>, c'est la conversion entité ↔ DTO. Le plus simple et le plus lisible : des méthodes d'extension écrites à la main, rangées à côté des DTOs. <code>product.ToDto()</code> et <code>request.ToEntity()</code> se lisent comme une phrase.</p>
<div class="compare"><div><h4>Mapping manuel</h4><p>Quelques lignes, tout est visible, le compilateur signale un champ oublié dans un constructeur de record. Aucune dépendance.</p></div><div><h4>Bibliothèque (AutoMapper, Mapster)</h4><p>Moins de code à écrire, mais des règles cachées et des erreurs découvertes à l'exécution. Utile surtout sur de très gros modèles.</p></div></div>
<div class="tip">Dans le mapping d'entrée, c'est le <strong>serveur</strong> qui fixe les champs sensibles : l'id vient de la base, le prix unitaire d'une ligne de commande vient du produit en base, jamais du client.</div>

<h3>La projection avec Select</h3>
<p>Pour les lectures, il y a mieux que charger l'entité puis la mapper : construire le DTO directement dans la requête LINQ avec <code>Select</code>. Avec EF Core, <code>db.Products.Select(p =&gt; new ProductDto(p.Id, p.Name, p.Price, p.Stock &gt; 0))</code> est traduit en SQL : seules les colonnes utiles sont lues, et pas besoin de <code>Include</code> pour les navigations utilisées dans le <code>Select</code>.</p>
<div class="note">Considère tes DTOs comme une API publique : une fois qu'un front les utilise, ne supprime pas un champ et ne change pas son type sans prévenir. Tu peux en revanche faire évoluer tes entités et ta base librement, il suffit d'adapter le mapping. C'est tout l'intérêt de la séparation.</div>`,
  examples: [
    {
      title: "La fuite de données en direct",
      code: `// Fichier : Program.cs
var app = WebApplication.CreateBuilder(args).Build();

var customer = new Customer
{
    Id = 1, Name = "Alice", Email = "alice@example.com",
    PasswordHash = "$2a$11$Qk9...", InternalNote = "Client difficile"
};

// MAUVAIS : on renvoie l'entité telle quelle
app.MapGet("/api/bad/customers/1", () => customer);

// BON : on renvoie un DTO qui ne contient que le nécessaire
app.MapGet("/api/customers/1", () =>
    new CustomerDto(customer.Id, customer.Name, customer.Email));

app.Run();

// L'entité (ce que stocke la base)
class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string InternalNote { get; set; } = "";
}

// Le DTO (ce que voit le client)
record CustomerDto(int Id, string Name, string Email);`,
      output: `GET /api/bad/customers/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Alice","email":"alice@example.com","passwordHash":"$2a$11$Qk9...","internalNote":"Client difficile"}

GET /api/customers/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Alice","email":"alice@example.com"}`,
      steps: [
        "<code>class Customer</code> : l'entité, avec toutes les colonnes de la table, y compris <code>PasswordHash</code> et <code>InternalNote</code>.",
        "<code>app.MapGet(\"/api/bad/customers/1\", () =&gt; customer);</code> : on renvoie l'entité. Le sérialiseur JSON publie <strong>toutes</strong> ses propriétés publiques.",
        "<code>\"passwordHash\":\"$2a$11$Qk9...\"</code> : la réponse contient le hash du mot de passe et une note interne. N'importe quel client peut les lire.",
        "<code>record CustomerDto(int Id, string Name, string Email);</code> : le DTO ne déclare que les trois champs publics.",
        "<code>new CustomerDto(customer.Id, customer.Name, customer.Email)</code> : on copie seulement ce qu'on veut montrer. La deuxième réponse est propre."
      ],
      explain: "Une propriété ajoutée plus tard à l'entité ne fuira jamais : le DTO la filtre par construction."
    },
    {
      title: "DTO d'entrée, DTO de sortie et mapping",
      code: `// Fichier : Program.cs
var app = WebApplication.CreateBuilder(args).Build();
List<Product> products = [];

app.MapPost("/api/products", (CreateProductRequest request) =>
{
    var product = request.ToEntity();        // DTO -> entité
    product.Id = products.Count + 1;         // c'est le serveur qui décide
    products.Add(product);
    return TypedResults.Created($"/api/products/{product.Id}", product.ToDto());
});

app.Run();

class Product   // l'entité
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

record CreateProductRequest(string Name, decimal Price);         // entrée
record ProductDto(int Id, string Name, decimal Price, bool InStock); // sortie

static class ProductMappings
{
    public static Product ToEntity(this CreateProductRequest r) =>
        new() { Name = r.Name, Price = r.Price, Stock = 0 };

    public static ProductDto ToDto(this Product p) =>
        new(p.Id, p.Name, p.Price, p.Stock > 0);
}`,
      output: `POST /api/products  {"id":999,"name":"Webcam","price":89.00,"stock":1000000}
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/products/1

{"id":1,"name":"Webcam","price":89.00,"inStock":false}`,
      steps: [
        "<code>record CreateProductRequest(string Name, decimal Price);</code> : le client ne peut envoyer que ces deux champs.",
        "<code>{\"id\":999, …, \"stock\":1000000}</code> : le client tente de choisir l'id et le stock. Ces champs n'existent pas dans le DTO : le désérialiseur les ignore. L'overposting est impossible.",
        "<code>request.ToEntity()</code> : la méthode d'extension crée l'entité et fixe elle-même <code>Stock = 0</code>.",
        "<code>product.Id = products.Count + 1;</code> : c'est le serveur qui attribue l'id (en vrai, la base le fait).",
        "<code>product.ToDto()</code> : la sortie a un champ calculé <code>InStock</code> au lieu du stock exact.",
        "<code>static class ProductMappings</code> : les deux conversions sont rangées au même endroit, faciles à retrouver."
      ]
    },
    {
      title: "Projection : une commande avec ses lignes et son total",
      code: `// Fichier : Program.cs
var app = WebApplication.CreateBuilder(args).Build();

var alice = new Customer { Id = 1, Name = "Alice" };
List<Order> orders =
[
    new() { Id = 10, Customer = alice, Status = "Pending", Lines =
    [
        new() { ProductName = "Clavier", Quantity = 2, UnitPrice = 49.90m },
        new() { ProductName = "Souris", Quantity = 1, UnitPrice = 19.90m }
    ]}
];

// Projection : on construit le DTO directement avec Select
app.MapGet("/api/orders", () => orders.Select(o => new OrderDto(
    o.Id,
    o.Customer.Name,
    o.Status,
    o.Lines.Select(l => new OrderLineDto(l.ProductName, l.Quantity, l.UnitPrice)).ToList(),
    o.Lines.Sum(l => l.Quantity * l.UnitPrice))));

app.Run();

class Customer { public int Id { get; set; } public string Name { get; set; } = ""; }
class OrderLine { public string ProductName { get; set; } = ""; public int Quantity { get; set; } public decimal UnitPrice { get; set; } }
class Order
{
    public int Id { get; set; }
    public Customer Customer { get; set; } = null!;
    public string Status { get; set; } = "";
    public List<OrderLine> Lines { get; set; } = [];
}

record OrderLineDto(string Product, int Quantity, decimal UnitPrice);
record OrderDto(int Id, string CustomerName, string Status, List<OrderLineDto> Lines, decimal Total);`,
      output: `GET /api/orders
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":10,"customerName":"Alice","status":"Pending","lines":[{"product":"Clavier","quantity":2,"unitPrice":49.90},{"product":"Souris","quantity":1,"unitPrice":19.90}],"total":119.70}]`,
      steps: [
        "<code>class Order</code> : l'entité a une navigation <code>Customer</code> et une liste <code>Lines</code>, comme avec EF Core.",
        "<code>orders.Select(o =&gt; new OrderDto(…))</code> : on construit le DTO directement. Avec EF Core, ce même <code>Select</code> serait traduit en une requête SQL.",
        "<code>o.Customer.Name</code> : on aplatit le client en un simple <code>CustomerName</code>.",
        "<code>o.Lines.Select(l =&gt; new OrderLineDto(…)).ToList()</code> : les lignes deviennent une liste de DTOs imbriqués.",
        "<code>o.Lines.Sum(l =&gt; l.Quantity * l.UnitPrice)</code> : le total est calculé : 2 × 49.90 + 19.90 = 119.70.",
        "<code>record OrderDto(…)</code> : aucun cycle possible, le DTO ne pointe jamais vers l'objet parent."
      ],
      explain: "Le front reçoit une commande prête à afficher, sans connaître la structure des tables."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "ProductDto et ToDto",
      prompt: `<p>Écris le record <code>ProductDto(int Id, string Name, decimal Price)</code> et une méthode d'extension <code>ToDto()</code> sur la classe <code>Product</code> (propriétés <code>Id</code>, <code>Name</code>, <code>Price</code>, <code>Stock</code>). Dans <code>Program.cs</code>, crée un produit, convertis-le et affiche le DTO avec <code>Console.WriteLine</code>.</p>`,
      hint: `<p>Une méthode d'extension se déclare dans une classe <code>static</code>, avec <code>this</code> devant le premier paramètre. Un record affiche ses champs avec <code>ToString()</code>.</p>`,
      solution: `var product = new Product { Id = 1, Name = "Clavier", Price = 49.90m, Stock = 12 };
Console.WriteLine(product.ToDto());
// ProductDto { Id = 1, Name = Clavier, Price = 49.90 } (séparateur selon la culture)

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

record ProductDto(int Id, string Name, decimal Price);

static class ProductMappings
{
    public static ProductDto ToDto(this Product p) => new(p.Id, p.Name, p.Price);
}`
    },
    {
      level: "moyen",
      title: "Appliquer une mise à jour",
      prompt: `<p>Écris <code>UpdateProductRequest(string Name, decimal Price, int Stock)</code> et une méthode d'extension <code>ApplyTo(this UpdateProductRequest r, Product p)</code> qui recopie les trois valeurs dans une entité <strong>existante</strong>. Branche-la sur <code>PUT /api/products/{id:int}</code> (Minimal API, liste en mémoire) : 404 si le produit n'existe pas, sinon 200 avec le <code>ProductDto</code> à jour.</p>`,
      hint: `<p>On ne crée pas une nouvelle entité pour un PUT : on modifie celle qui est déjà suivie (avec EF Core, il suffira ensuite d'appeler <code>SaveChangesAsync</code>).</p>`,
      solution: `var app = WebApplication.CreateBuilder(args).Build();
List<Product> products = [new() { Id = 1, Name = "Clavier", Price = 49.90m, Stock = 12 }];

app.MapPut("/api/products/{id:int}", (int id, UpdateProductRequest request) =>
{
    var product = products.FirstOrDefault(p => p.Id == id);
    if (product is null) return Results.NotFound();

    request.ApplyTo(product);
    return Results.Ok(product.ToDto());
});

app.Run();

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

record UpdateProductRequest(string Name, decimal Price, int Stock);
record ProductDto(int Id, string Name, decimal Price, int Stock);

static class ProductMappings
{
    public static ProductDto ToDto(this Product p) => new(p.Id, p.Name, p.Price, p.Stock);

    public static void ApplyTo(this UpdateProductRequest r, Product p)
    {
        p.Name = r.Name;
        p.Price = r.Price;
        p.Stock = r.Stock;
    }
}`
    },
    {
      level: "difficile",
      title: "Un résumé de commande",
      prompt: `<p>En partant du troisième exemple, ajoute <code>GET /api/orders/summary</code> qui renvoie une liste de <code>OrderSummaryDto(int Id, string CustomerName, int LineCount, decimal Total)</code>, triée par total décroissant. Une seule requête LINQ avec <code>Select</code> et <code>OrderByDescending</code>.</p>`,
      hint: `<p><code>LineCount</code> vaut <code>o.Lines.Count</code>. Tu peux trier après le <code>Select</code>, sur la propriété <code>Total</code> du DTO.</p>`,
      solution: `app.MapGet("/api/orders/summary", () => orders
    .Select(o => new OrderSummaryDto(
        o.Id,
        o.Customer.Name,
        o.Lines.Count,
        o.Lines.Sum(l => l.Quantity * l.UnitPrice)))
    .OrderByDescending(s => s.Total)
    .ToList());

record OrderSummaryDto(int Id, string CustomerName, int LineCount, decimal Total);`
    }
  ],
  quiz: [
    {
      q: `Un client envoie <code>{"name":"Webcam","price":89,"stock":1000000}</code> à un endpoint qui reçoit <code>CreateProductRequest(string Name, decimal Price)</code>. Que devient <code>stock</code> ?`,
      options: ["Il est ignoré", "Il remplit le stock de l'entité", "Il provoque un 400"],
      answer: 0,
      why: `Le DTO n'a pas de propriété <code>Stock</code> : le désérialiseur ignore ce champ. C'est précisément ce qui protège de l'overposting. Avec l'entité en paramètre, le client aurait pu fixer le stock.`
    },
    {
      q: `Pourquoi renvoyer une entité <code>Order</code> avec ses navigations peut-il faire planter la réponse ?`,
      options: ["Les entités ne sont pas sérialisables", "Les navigations croisées créent un cycle (Order → Lines → Order…)", "Le JSON est limité à 1 Mo"],
      answer: 1,
      why: `<code>Order.Lines</code> contient des lignes dont <code>OrderLine.Order</code> pointe vers la commande : le sérialiseur tourne en rond et lève une exception de cycle. Un DTO n'a pas ce lien retour.`
    },
    {
      q: `Quel avantage apporte <code>db.Products.Select(p =&gt; new ProductDto(…))</code> avec EF Core ?`,
      options: ["Il désactive le suivi des modifications", "Il valide les données", "Le SQL généré ne lit que les colonnes utilisées par le DTO"],
      answer: 2,
      why: `La projection est traduite en SQL : seules les colonnes nécessaires sont lues, et les navigations utilisées dans le <code>Select</code> deviennent des jointures, sans <code>Include</code>.`
    },
    {
      q: `Lors de la création d'une ligne de commande, d'où doit venir <code>UnitPrice</code> ?`,
      options: ["Du DTO envoyé par le client", "Du produit lu en base par le serveur", "D'une valeur par défaut à 0"],
      answer: 1,
      why: `Le client ne doit jamais fixer un prix : il pourrait envoyer 0,01 €. Le serveur lit le prix du produit en base et le copie dans la ligne.`
    }
  ],
  project: `<p><strong>OrderFlow : passer aux DTOs.</strong> Crée un dossier <code>Products/</code> avec <code>ProductDto</code>, <code>CreateProductRequest</code>, <code>UpdateProductRequest</code> et une classe <code>ProductMappings</code>, puis un dossier <code>Orders/</code> avec <code>OrderDto</code>, <code>OrderLineDto</code> et <code>CreateOrderRequest(int CustomerId, List&lt;CreateOrderLineRequest&gt; Lines)</code> où <code>CreateOrderLineRequest(int ProductId, int Quantity)</code>. Remplace toutes les entités dans les signatures de tes controllers et endpoints. Les lectures utilisent une projection <code>Select</code> ; à la création d'une commande, lis chaque produit en base pour remplir <code>UnitPrice</code>, fixe <code>Status = OrderStatus.Pending</code> et <code>OrderDate = DateTime.UtcNow</code> côté serveur.</p>`,
  resources: [
    { label: "Tutoriel : empêcher la sur-publication avec des DTOs (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/tutorials/first-web-api#prevent-over-posting" },
    { label: "Requêtes de projection avec EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/querying/" }
  ]
});

// =====================================================================
// Validation
// =====================================================================
window.COURSE.push({
  key: "api-validation",
  title: "Valider les données entrantes",
  summary: "Tu sauras rejeter proprement une requête invalide avec un 400 détaillé, aussi bien avec des controllers qu'avec des Minimal APIs.",
  objectives: [
    "Décrire les règles de format avec les attributs DataAnnotations",
    "Profiter de la réponse 400 automatique de <code>[ApiController]</code>",
    "Activer la validation des Minimal APIs avec <code>AddValidation()</code> (.NET 10)",
    "Vérifier une règle métier et renvoyer un <code>ValidationProblem</code>"
  ],
  analogy: `<p>À l'entrée d'un concert, le <strong>contrôleur</strong> vérifie ton billet : la bonne date, un code-barres lisible, un nom rempli. Il ne sait pas si ta place est libre : ça, c'est la <strong>billetterie</strong> qui le sait, car elle a la liste des réservations.</p>
<p>La validation d'une API fonctionne pareil, en deux étapes. D'abord le <strong>format</strong> (champ rempli, nombre dans la bonne plage), vérifié à la porte par des attributs. Ensuite les <strong>règles métier</strong> (le produit existe, le stock suffit), vérifiées par ton code qui a accès aux données.</p>`,
  lesson: `<h3>Pourquoi valider côté serveur ?</h3>
<p>Ton formulaire Angular valide déjà les champs, alors pourquoi recommencer ? Parce que n'importe qui peut appeler ton API sans passer par ton front : avec <code>curl</code>, Postman ou un script. La validation Angular sert le <strong>confort</strong> de l'utilisateur. La validation du serveur sert la <strong>sécurité</strong> et l'intégrité de tes données : elle est obligatoire.</p>
<p>La règle : on valide à la <strong>frontière</strong>, c'est-à-dire dès que les données entrent dans l'API, sur le DTO d'entrée. Une donnée invalide ne doit jamais atteindre la base.</p>

<h3>Les attributs DataAnnotations</h3>
<p>Les <strong>DataAnnotations</strong> sont des attributs de l'espace de noms <code>System.ComponentModel.DataAnnotations</code>. Tu les poses sur les propriétés de ton DTO pour décrire les règles. C'est l'équivalent de <code>Validators.required</code> ou <code>Validators.maxLength(100)</code> dans un formulaire réactif Angular.</p>
<table>
<tr><th>Attribut</th><th>Règle</th><th>Exemple</th></tr>
<tr><td><code>[Required]</code></td><td>valeur présente, et pas de chaîne vide</td><td>le nom du client</td></tr>
<tr><td><code>[StringLength(100, MinimumLength = 2)]</code></td><td>longueur entre 2 et 100</td><td>le nom d'un produit</td></tr>
<tr><td><code>[MaxLength(200)]</code></td><td>longueur ou nombre d'éléments maximum</td><td>un email</td></tr>
<tr><td><code>[Range(1, 100)]</code></td><td>nombre dans une plage (bornes incluses)</td><td>une quantité</td></tr>
<tr><td><code>[EmailAddress]</code></td><td>forme d'adresse email</td><td><code>alice@example.com</code></td></tr>
<tr><td><code>[MinLength(1)]</code></td><td>au moins un élément dans une liste</td><td>les lignes d'une commande</td></tr>
</table>
<p>Sur un record positionnel, on écrit simplement l'attribut devant le paramètre : <code>record CreateProductRequest([Required] string Name, [Range(1, 10000)] decimal Price);</code>.</p>

<h3>Controllers : le 400 est automatique</h3>
<p>Avec <code>[ApiController]</code>, après le model binding, ASP.NET Core vérifie les attributs. Les erreurs sont rangées dans le <code>ModelState</code> (l'état de validation de la requête). S'il y en a, ton action n'est <strong>pas appelée</strong> : le client reçoit directement un 400 avec toutes les erreurs, champ par champ.</p>
<div class="flow"><span>JSON reçu</span><span>Binding vers le DTO</span><span>Attributs vérifiés</span><span>Erreur ? → 400</span><span>Sinon → ton action</span></div>
<p>Résultat : dans ton action, tu sais que le DTO est valide. Pas de <code>if</code> pour vérifier chaque champ.</p>

<h3>Minimal APIs : AddValidation (.NET 10)</h3>
<p>Depuis .NET 10, les Minimal APIs savent faire pareil. Une ligne dans <code>Program.cs</code> : <code>builder.Services.AddValidation();</code>. Le framework repère alors les paramètres de tes handlers qui portent des attributs de validation et renvoie un 400 automatique en cas d'erreur.</p>
<p>Ajoute aussi <code>builder.Services.AddProblemDetails();</code> : sans lui, la réponse d'erreur contient seulement <code>title</code> et <code>errors</code> ; avec lui, elle a le format standard complet (<code>type</code>, <code>status</code>, <code>traceId</code>), identique à celui des controllers. On détaille ce format dans la leçon suivante.</p>
<div class="tip">La réponse 400 de validation a toujours la même forme : un objet <code>errors</code> dont chaque clé est un nom de champ et chaque valeur une liste de messages. Côté Angular, tu peux la lire dans le <code>HttpErrorResponse</code> et afficher chaque message sous le bon champ du formulaire.</div>

<h3>Format ou règle métier ?</h3>
<p>Un attribut ne voit que la donnée elle-même. Il ne peut pas savoir si le produit 42 existe ou s'il en reste en stock : pour ça, il faut interroger la base. Ces <strong>règles métier</strong> se vérifient dans ton code, après la validation automatique.</p>
<div class="compare"><div><h4>Validation de format</h4><p>Sans accès aux données : champ requis, longueur, plage, email. Attributs + 400 automatique.</p></div><div><h4>Règle métier</h4><p>Avec accès aux données : le produit existe, le stock suffit, l'email n'est pas déjà pris. Code dans l'action ou le service.</p></div></div>
<p>Pour renvoyer une erreur métier au même format que les autres, utilise <code>ValidationProblem</code> : <code>Results.ValidationProblem(errors)</code> en Minimal API, ou <code>ModelState.AddModelError("Quantity", "…")</code> puis <code>return ValidationProblem();</code> dans un controller. Le front n'a qu'un seul format d'erreur à gérer.</p>
<div class="note">Quand les règles deviennent nombreuses ou conditionnelles (« la date de fin doit suivre la date de début si le statut est X »), beaucoup d'équipes utilisent la bibliothèque <strong>FluentValidation</strong> : les règles sont écrites en C# dans une classe séparée, faciles à tester. Les DataAnnotations restent parfaites pour les règles simples, et ce sont elles que tu croiseras partout.</div>`,
  examples: [
    {
      title: "Controller : le 400 automatique",
      code: `// Fichier : Controllers/ProductsController.cs
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

[ApiController]   // active la réponse 400 automatique
[Route("api/products")]
public class ProductsController : ControllerBase
{
    [HttpPost]
    public IActionResult Create(CreateProductRequest request)
    {
        // Si on arrive ici, request est déjà valide
        return Ok($"Produit {request.Name} accepté");
    }
}

public record CreateProductRequest(
    [Required, StringLength(100, MinimumLength = 2)] string Name,
    [Range(1, 10000)] decimal Price,
    [Range(0, 1000)] int Stock);`,
      output: `POST /api/products  {"name":"Webcam","price":89.00,"stock":5}
HTTP/1.1 200 OK
Content-Type: text/plain; charset=utf-8

Produit Webcam accepté

POST /api/products  {"name":"W","price":0,"stock":5000}
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json; charset=utf-8

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1","title":"One or more validation errors occurred.","status":400,"errors":{"Name":["The field Name must be a string with a minimum length of 2 and a maximum length of 100."],"Price":["The field Price must be between 1 and 10000."],"Stock":["The field Stock must be between 0 and 1000."]},"traceId":"00-35b99309bcfaebec517e5579f46b00ca-c0bfac71d27f3fd7-00"}`,
      steps: [
        "<code>using System.ComponentModel.DataAnnotations;</code> : l'espace de noms des attributs de validation.",
        "<code>[Required, StringLength(100, MinimumLength = 2)] string Name</code> : on peut cumuler plusieurs attributs dans les mêmes crochets.",
        "<code>[Range(1, 10000)] decimal Price</code> et <code>[Range(0, 1000)] int Stock</code> : des bornes incluses.",
        "<code>public IActionResult Create(CreateProductRequest request)</code> : l'action ne contient aucun <code>if</code>. Si on y arrive, les données sont valides.",
        "<code>{\"name\":\"W\",\"price\":0,\"stock\":5000}</code> : trois règles cassées. L'action n'est pas appelée, le 400 liste les trois erreurs d'un coup.",
        "<code>Program.cs</code> : le même que dans les leçons précédentes (<code>AddControllers</code> + <code>MapControllers</code>)."
      ],
      explain: "Les messages sont en anglais par défaut ; chaque attribut accepte un ErrorMessage pour les personnaliser."
    },
    {
      title: "Minimal API : AddValidation",
      code: `// Fichier : Program.cs
using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddValidation();   // nouveau en .NET 10 pour les Minimal APIs
builder.Services.AddProblemDetails(); // réponses d'erreur au format standard

var app = builder.Build();

app.MapPost("/api/customers", (CreateCustomerRequest request) =>
    TypedResults.Ok($"Client {request.Name} créé"));

app.Run();

public record CreateCustomerRequest(
    [Required, MaxLength(100)] string Name,
    [Required, EmailAddress] string Email);`,
      output: `POST /api/customers  {"name":"Alice","email":"alice@example.com"}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

"Client Alice créé"

POST /api/customers  {"name":"","email":"pas-un-email"}
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1","title":"One or more validation errors occurred.","status":400,"errors":{"Name":["The Name field is required."],"Email":["The Email field is not a valid e-mail address."]},"traceId":"00-9ec633e1855163bc79064ade0805d4dc-6c4e6d899858d4a7-00"}`,
      steps: [
        "<code>builder.Services.AddValidation();</code> : active la validation automatique des paramètres des Minimal APIs.",
        "<code>builder.Services.AddProblemDetails();</code> : les réponses d'erreur prennent le format standard complet, avec <code>type</code>, <code>status</code> et <code>traceId</code>.",
        "<code>public record CreateCustomerRequest(…)</code> : le DTO est <code>public</code>, avec ses attributs devant les paramètres.",
        "<code>[Required, EmailAddress] string Email</code> : <code>pas-un-email</code> n'a pas de <code>@</code>, la règle échoue.",
        "<code>\"name\":\"\"</code> : une chaîne vide ne passe pas <code>[Required]</code>.",
        "<code>TypedResults.Ok($\"Client {request.Name} créé\")</code> : n'est exécuté que pour la première requête, la seule valide."
      ]
    },
    {
      title: "Règle métier : le stock",
      code: `// Fichier : Program.cs
using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddValidation();
builder.Services.AddProblemDetails();
var app = builder.Build();

Dictionary<int, int> stockByProduct = new() { [1] = 12, [2] = 0 };

app.MapPost("/api/orders", (CreateOrderRequest request) =>
{
    // 1. Le format est déjà validé par les attributs
    // 2. Les règles métier ont besoin des données : on les vérifie ici
    var errors = new Dictionary<string, string[]>();
    if (!stockByProduct.TryGetValue(request.ProductId, out var stock))
        errors["ProductId"] = [$"Le produit {request.ProductId} n'existe pas."];
    else if (stock < request.Quantity)
        errors["Quantity"] = [$"Stock insuffisant : {stock} disponible(s)."];

    if (errors.Count > 0)
        return Results.ValidationProblem(errors);

    return Results.Ok("Commande acceptée");
});

app.Run();

public record CreateOrderRequest(
    [Range(1, int.MaxValue)] int ProductId,
    [Range(1, 100)] int Quantity);`,
      output: `POST /api/orders  {"productId":1,"quantity":2}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

"Commande acceptée"

POST /api/orders  {"productId":2,"quantity":1}
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1","title":"One or more validation errors occurred.","status":400,"errors":{"Quantity":["Stock insuffisant : 0 disponible(s)."]},"traceId":"00-4e8abd5568ef57300467e2e5276f9f8f-cd0d3df1c8e20fb6-00"}

POST /api/orders  {"productId":1,"quantity":0}
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1","title":"One or more validation errors occurred.","status":400,"errors":{"Quantity":["The field Quantity must be between 1 and 100."]},"traceId":"00-0e70dbadbbaff08492b07687065ee7d3-720f6036d979723e-00"}`,
      steps: [
        "<code>Dictionary&lt;int, int&gt; stockByProduct</code> : simule la table Products (id → stock). Le produit 2 est en rupture.",
        "<code>[Range(1, 100)] int Quantity</code> : la règle de format est vérifiée automatiquement. La troisième requête (quantité 0) n'entre même pas dans le handler.",
        "<code>var errors = new Dictionary&lt;string, string[]&gt;();</code> : on collecte les erreurs métier, avec le nom du champ en clé.",
        "<code>stock &lt; request.Quantity</code> : une règle qui a besoin des données. Impossible à écrire avec un attribut.",
        "<code>Results.ValidationProblem(errors)</code> : renvoie un 400 exactement au même format que la validation automatique.",
        "<code>Results.Ok(\"Commande acceptée\")</code> : produit 1, quantité 2, stock 12 : tout est bon."
      ],
      explain: "Format à la porte, règles métier dans le code : le client reçoit toujours le même type de réponse."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Valider un client",
      prompt: `<p>Écris le record <code>CreateCustomerRequest</code> avec <code>Name</code> (obligatoire, 100 caractères max) et <code>Email</code> (obligatoire, adresse valide, 200 caractères max). Branche-le sur un <code>POST api/customers</code> de controller et vérifie qu'un nom vide renvoie 400.</p>`,
      hint: `<p><code>[Required, MaxLength(100)]</code> devant <code>Name</code>, trois attributs devant <code>Email</code>.</p>`,
      solution: `// Fichier : Controllers/CustomersController.cs
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    [HttpPost]
    public IActionResult Create(CreateCustomerRequest request)
        => Ok($"Client {request.Name} valide");
}

public record CreateCustomerRequest(
    [Required, MaxLength(100)] string Name,
    [Required, EmailAddress, MaxLength(200)] string Email);`
    },
    {
      level: "moyen",
      title: "Messages en français",
      prompt: `<p>En Minimal API avec <code>AddValidation()</code>, crée <code>PUT /api/products/{id:int}/stock</code> qui reçoit <code>UpdateStockRequest(int Stock)</code>. Le stock doit être entre 0 et 10000, avec le message « Le stock doit être compris entre 0 et 10000. ». Renvoie <code>TypedResults.NoContent()</code> si tout va bien.</p>`,
      hint: `<p>Chaque attribut a une propriété <code>ErrorMessage</code> : <code>[Range(0, 10000, ErrorMessage = "…")]</code>.</p>`,
      solution: `using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddValidation();
builder.Services.AddProblemDetails();
var app = builder.Build();

app.MapPut("/api/products/{id:int}/stock", (int id, UpdateStockRequest request) =>
    TypedResults.NoContent());

app.Run();

public record UpdateStockRequest(
    [Range(0, 10000, ErrorMessage = "Le stock doit être compris entre 0 et 10000.")] int Stock);`
    },
    {
      level: "difficile",
      title: "Une commande sans doublon",
      prompt: `<p>Crée <code>CreateOrderRequest(int CustomerId, List&lt;CreateOrderLineRequest&gt; Lines)</code> avec <code>CreateOrderLineRequest(int ProductId, int Quantity)</code>. Règles de format : <code>CustomerId</code> ≥ 1 et au moins une ligne. Règle supplémentaire dans le handler : un même produit ne doit pas apparaître deux fois ; sinon, renvoie un <code>ValidationProblem</code> sur le champ <code>Lines</code>.</p>`,
      hint: `<p><code>[MinLength(1)]</code> fonctionne sur une liste. Pour les doublons : <code>request.Lines.GroupBy(l =&gt; l.ProductId).Any(g =&gt; g.Count() &gt; 1)</code>.</p>`,
      solution: `using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddValidation();
builder.Services.AddProblemDetails();
var app = builder.Build();

app.MapPost("/api/orders", (CreateOrderRequest request) =>
{
    var hasDuplicates = request.Lines
        .GroupBy(l => l.ProductId)
        .Any(g => g.Count() > 1);

    if (hasDuplicates)
        return Results.ValidationProblem(new Dictionary<string, string[]>
        {
            ["Lines"] = ["Un produit ne peut apparaître qu'une fois par commande."]
        });

    return Results.Ok($"{request.Lines.Count} ligne(s) acceptée(s)");
});

app.Run();

public record CreateOrderRequest(
    [Range(1, int.MaxValue)] int CustomerId,
    [MinLength(1)] List<CreateOrderLineRequest> Lines);

public record CreateOrderLineRequest(int ProductId, [Range(1, 100)] int Quantity);`
    }
  ],
  quiz: [
    {
      q: `Ton front Angular valide déjà le formulaire. Faut-il valider aussi dans l'API ?`,
      options: ["Oui, car l'API peut être appelée sans passer par le front", "Non, c'est du travail en double", "Seulement en production"],
      answer: 0,
      why: `N'importe qui peut envoyer une requête avec curl ou Postman. La validation du front améliore l'expérience utilisateur ; celle du serveur protège les données.`
    },
    {
      q: `Dans un controller avec <code>[ApiController]</code>, que se passe-t-il si le DTO reçu viole un <code>[Range]</code> ?`,
      options: ["L'action est appelée avec <code>ModelState</code> invalide", "Le client reçoit un 400 et l'action n'est pas appelée", "Une exception est levée et le client reçoit un 500"],
      answer: 1,
      why: `<code>[ApiController]</code> vérifie le <code>ModelState</code> avant l'action et renvoie un 400 automatiquement. Sans cet attribut, l'action serait appelée et tu devrais tester <code>ModelState.IsValid</code> toi-même.`
    },
    {
      q: `Quelle ligne active la validation automatique dans une Minimal API en .NET 10 ?`,
      options: ["<code>app.UseValidation();</code>", "<code>builder.Services.AddControllers();</code>", "<code>builder.Services.AddValidation();</code>"],
      answer: 2,
      why: `<code>AddValidation()</code> enregistre la validation des paramètres des handlers. C'est un service, pas un middleware : il n'y a pas de <code>UseValidation</code>.`
    },
    {
      q: `« Le produit commandé doit exister en base ». Où vérifier cette règle ?`,
      options: ["Avec un attribut <code>[Required]</code>", "Dans le code (action, handler ou service), puis renvoyer un <code>ValidationProblem</code>", "Dans le front uniquement"],
      answer: 1,
      why: `Un attribut ne voit que la valeur, pas la base. Une règle qui a besoin des données se vérifie dans le code. <code>[Required]</code> vérifie seulement que la valeur est présente.`
    }
  ],
  project: `<p><strong>OrderFlow : valider les entrées.</strong> Ajoute les attributs sur tous tes DTOs d'entrée : <code>Name</code> de produit obligatoire (100 max), <code>Price</code> entre 0.01 et 100000, <code>Stock</code> ≥ 0, <code>Email</code> de client obligatoire et valide (200 max), <code>Quantity</code> entre 1 et 100, au moins une ligne par commande. Appelle <code>AddValidation()</code> et <code>AddProblemDetails()</code> pour les endpoints Customers. Dans la création de commande, vérifie en base que le client et chaque produit existent et que le stock suffit ; sinon, renvoie un <code>ValidationProblem</code> avec le bon nom de champ.</p>`,
  resources: [
    { label: "Validation de modèle dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/mvc/models/validation" },
    { label: "Validation dans les API minimales (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/minimal-apis#validation" }
  ]
});

// =====================================================================
// Erreurs : ProblemDetails et gestionnaire global
// =====================================================================
window.COURSE.push({
  key: "api-errors",
  title: "Gérer les erreurs : ProblemDetails et gestionnaire d'exceptions global",
  summary: "Tu sauras faire répondre toute ton API avec un format d'erreur unique, sans jamais laisser fuir une stack trace.",
  objectives: [
    "Lire et produire une réponse ProblemDetails (RFC 9457)",
    "Activer AddProblemDetails, UseExceptionHandler et UseStatusCodePages",
    "Transformer des exceptions métier en 404 ou 409 avec un IExceptionHandler",
    "Distinguer une erreur prévue (renvoyée) d'une erreur imprévue (exception)"
  ],
  analogy: `<p>Appelle le standard d'une grande entreprise. Que la panne soit à la compta, à l'entrepôt ou au service informatique, la standardiste te répond toujours de la même façon : poliment, avec un message clair et un <strong>numéro de dossier</strong>. Elle ne te passe jamais le brouhaha interne.</p>
<p>Le <strong>gestionnaire d'exceptions global</strong> est cette standardiste. Et <strong>ProblemDetails</strong> est le modèle de réponse qu'elle utilise à chaque appel, avec le <code>traceId</code> comme numéro de dossier pour retrouver l'incident dans les logs.</p>`,
  lesson: `<h3>Le problème : des erreurs dans tous les sens</h3>
<p>Sans configuration, une API renvoie ses erreurs sous des formes variées : parfois un 404 vide, parfois un texte, parfois une page HTML avec la stack trace complète. Le front Angular doit deviner le format à chaque fois. Pire : une <strong>stack trace</strong> (la liste des méthodes traversées lors d'une exception) montre à un attaquant tes noms de classes, tes chemins de fichiers, parfois des morceaux de requêtes SQL.</p>
<p>L'objectif de cette leçon : <strong>une seule forme d'erreur</strong> pour toute l'API, et aucun détail interne qui sort.</p>

<h3>ProblemDetails : le format standard</h3>
<p><strong>ProblemDetails</strong> est un format JSON d'erreur standardisé par la RFC 9457 (un document officiel de l'IETF, l'organisme qui normalise HTTP). Il est reconnu au type de contenu <code>application/problem+json</code>. Tu l'as déjà croisé : c'est le corps des 404 et 400 renvoyés par <code>[ApiController]</code>.</p>
<table>
<tr><th>Champ</th><th>Rôle</th><th>Exemple</th></tr>
<tr><td><code>type</code></td><td>une URL qui identifie le genre d'erreur</td><td>lien vers la RFC 9110</td></tr>
<tr><td><code>title</code></td><td>un résumé court, stable</td><td>« Not Found »</td></tr>
<tr><td><code>status</code></td><td>le code HTTP, répété dans le corps</td><td>404</td></tr>
<tr><td><code>detail</code></td><td>l'explication pour <em>ce</em> cas précis</td><td>« La commande 99 n'existe pas. »</td></tr>
<tr><td><code>instance</code></td><td>la requête concernée</td><td>« GET /api/orders/99 »</td></tr>
<tr><td><code>traceId</code></td><td>une extension ajoutée par ASP.NET Core</td><td>l'identifiant pour retrouver les logs</td></tr>
</table>

<h3>Trois lignes pour tout activer</h3>
<p><code>builder.Services.AddProblemDetails()</code> enregistre le service qui sait écrire ce format. <code>app.UseExceptionHandler()</code> ajoute un middleware qui attrape <strong>toute</strong> exception non gérée et répond un 500 au format ProblemDetails, sans détail interne. <code>app.UseStatusCodePages()</code> donne un corps ProblemDetails aux réponses d'erreur qui n'en ont pas, comme un 404 de route inconnue.</p>
<div class="flow"><span>Exception levée</span><span>UseExceptionHandler</span><span>IExceptionHandler(s)</span><span>ProblemDetails JSON</span></div>
<p>Comme tout middleware, l'ordre compte : place <code>UseExceptionHandler()</code> <strong>tout en haut</strong> du pipeline, pour qu'il entoure tout le reste. C'est le même rôle qu'un intercepteur <code>HttpInterceptor</code> qui attrape les erreurs côté Angular, mais côté serveur.</p>
<div class="tip">L'exception n'est pas perdue : le middleware l'écrit dans les logs avec le niveau <code>Error</code> (<code>fail:</code> dans la console), message et stack trace compris. Le client, lui, ne reçoit que le <code>traceId</code>, qui permet de retrouver la bonne ligne de log.</div>

<h3>Tes propres exceptions : IExceptionHandler</h3>
<p>Par défaut, toute exception donne un 500. Mais certaines sont prévisibles : « commande introuvable » devrait donner un 404, « commande déjà expédiée » un 409 Conflict. Pour ça, on crée des <strong>exceptions métier</strong> (<code>NotFoundException</code>, <code>ConflictException</code>) et une classe qui implémente <code>IExceptionHandler</code>.</p>
<p>Cette interface a une seule méthode, <code>TryHandleAsync</code>. Elle reçoit l'exception, décide du code HTTP et écrit la réponse. Elle renvoie <code>true</code> si elle a géré l'exception, <code>false</code> pour laisser la main au comportement par défaut (le 500). On l'enregistre avec <code>builder.Services.AddExceptionHandler&lt;T&gt;()</code>.</p>
<pre class="diagram">
  OrdersService                  DomainExceptionHandler
  throw NotFoundException  ----&gt; NotFound  -&gt; 404
  throw ConflictException  ----&gt; Conflict  -&gt; 409
  throw SqlException       ----&gt; autre     -&gt; false
                                   |
                                   v
                      handler par défaut -&gt; 500
</pre>

<h3>Erreur prévue ou imprévue ?</h3>
<p>Deux façons de produire une erreur coexistent, et c'est normal. Une erreur <strong>prévue</strong> fait partie du fonctionnement normal : tu la renvoies directement avec <code>Problem(…)</code> dans un controller ou <code>TypedResults.Problem(…)</code> en Minimal API. Une erreur <strong>imprévue</strong> ou levée loin dans un service remonte en exception jusqu'au gestionnaire global.</p>
<div class="compare"><div><h4>Renvoyer (Problem, NotFound)</h4><p>Le cas est attendu et tu es dans l'endpoint : c'est explicite et ça ne coûte rien.</p></div><div><h4>Lever une exception</h4><p>Le cas est détecté au fond d'un service, ou c'est une vraie panne : le gestionnaire global traduit en code HTTP.</p></div></div>
<div class="note">Ne recopie jamais <code>exception.Message</code> dans la réponse d'un 500 : le message d'une <code>SqlException</code> peut contenir le nom de tes tables. Seuls les messages de <em>tes</em> exceptions métier, que tu as écrits pour le client, peuvent aller dans <code>detail</code>. Et pour personnaliser toutes les réponses d'un coup (ajouter <code>instance</code>, un code d'erreur maison), utilise l'option <code>CustomizeProblemDetails</code> de <code>AddProblemDetails</code>.</div>`,
  examples: [
    {
      title: "Le filet de sécurité global",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();   // format d'erreur standard

var app = builder.Build();
app.UseExceptionHandler();   // attrape toute exception non gérée -> 500
app.UseStatusCodePages();    // donne un corps aux 4xx/5xx qui n'en ont pas

app.MapGet("/api/products/{id:int}", (int id) =>
    id == 1 ? Results.Ok(new { id, name = "Clavier" }) : Results.NotFound());

app.MapGet("/api/crash", () =>
{
    throw new InvalidOperationException("La base de données ne répond pas");
});

app.Run();`,
      output: `GET /api/products/9
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.5","title":"Not Found","status":404,"traceId":"00-9cc7fcd91ffd8630e192fff87e1a7d03-7c66dfc96f319c87-00"}

GET /api/crash
HTTP/1.1 500 Internal Server Error
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.6.1","title":"An error occurred while processing your request.","status":500,"traceId":"00-9c193a309930ea179948741e63a0931c-3002e57f2756716f-00"}

GET /api/inconnu
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.5","title":"Not Found","status":404,"traceId":"00-ffaf21e9562666223a76196bc1dd5b25-e4639181622fcc30-00"}`,
      steps: [
        "<code>builder.Services.AddProblemDetails();</code> : enregistre le service qui écrit les réponses <code>application/problem+json</code>.",
        "<code>app.UseExceptionHandler();</code> : en premier dans le pipeline, il attrape toute exception venant des middlewares et endpoints suivants.",
        "<code>app.UseStatusCodePages();</code> : le <code>Results.NotFound()</code> sans corps reçoit maintenant un corps ProblemDetails.",
        "<code>throw new InvalidOperationException(…)</code> : le client reçoit un 500 générique. Le message « La base de données ne répond pas » n'apparaît pas dans la réponse.",
        "<code>GET /api/inconnu</code> : aucune route ne correspond. <code>UseStatusCodePages</code> donne aussi un corps à ce 404.",
        "<code>fail: Microsoft.AspNetCore.Diagnostics.ExceptionHandlerMiddleware[1]</code> : cette ligne apparaît dans la console du serveur, avec le vrai message et la stack trace."
      ],
      explain: "Avec ces trois lignes, toutes les erreurs de l'API ont la même forme, en développement comme en production."
    },
    {
      title: "Un IExceptionHandler pour les exceptions métier",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<DomainExceptionHandler>();
var app = builder.Build();
app.UseExceptionHandler();
app.MapGet("/api/orders/{id:int}", (int id) =>
    { throw new NotFoundException($"La commande {id} n'existe pas."); });
app.MapPost("/api/orders/{id:int}/ship", (int id) =>
    { throw new ConflictException("Une commande annulée ne peut pas être expédiée."); });
app.Run();

public class NotFoundException(string message) : Exception(message);  // exceptions
public class ConflictException(string message) : Exception(message);  // métier

// Fichier : Errors/DomainExceptionHandler.cs
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
public class DomainExceptionHandler(IProblemDetailsService problemDetails,
    ILogger<DomainExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http, Exception exception, CancellationToken ct)
    {
        int status = exception switch   // quelle exception -> quel code HTTP ?
        {
            NotFoundException => StatusCodes.Status404NotFound,
            ConflictException => StatusCodes.Status409Conflict,
            _ => 0
        };
        if (status == 0) return false;   // pas pour nous : 500 par défaut

        logger.LogWarning("Erreur métier {Status} : {Message}", status, exception.Message);
        http.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = http,
            ProblemDetails = new ProblemDetails { Status = status, Detail = exception.Message }
        });
    }
}`,
      output: `GET /api/orders/99
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.5","title":"Not Found","status":404,"detail":"La commande 99 n'existe pas.","traceId":"00-e319e3e0ae32c7a319f3a6491b9e2c0d-68e0b1a16d2c2afa-00"}

POST /api/orders/10/ship
HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.10","title":"Conflict","status":409,"detail":"Une commande annulée ne peut pas être expédiée.","traceId":"00-5e2a32fd355a5f2b5a7435f04b5ce9d1-a524e675bbe6d9a1-00"}`,
      steps: [
        "<code>public class NotFoundException(string message) : Exception(message);</code> : une exception métier en une ligne grâce au constructeur principal.",
        "<code>builder.Services.AddExceptionHandler&lt;DomainExceptionHandler&gt;();</code> : on enregistre notre gestionnaire. Il sera appelé par <code>UseExceptionHandler()</code>.",
        "<code>int status = exception switch { … }</code> : une expression <code>switch</code> sur le type de l'exception choisit le code HTTP.",
        "<code>if (status == 0) return false;</code> : une exception inconnue n'est pas pour nous. On renvoie <code>false</code> et ASP.NET Core répond 500 comme avant.",
        "<code>logger.LogWarning(…)</code> : une erreur métier n'est pas une panne, on la journalise en <code>Warning</code> et non en <code>Error</code>.",
        "<code>problemDetails.TryWriteAsync(…)</code> : <code>IProblemDetailsService</code> écrit la réponse. Il complète tout seul <code>type</code>, <code>title</code> et <code>traceId</code> à partir du code de statut."
      ]
    },
    {
      title: "Une erreur prévue avec Problem() et CustomizeProblemDetails",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddProblemDetails(options =>
    options.CustomizeProblemDetails = ctx =>
    {
        // Ajouté à TOUTES les réponses ProblemDetails
        ctx.ProblemDetails.Instance =
            $"{ctx.HttpContext.Request.Method} {ctx.HttpContext.Request.Path}";
    });

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.MapControllers();
app.Run();

// Fichier : Controllers/OrdersController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    [HttpPost("{id:int}/cancel")]
    public IActionResult Cancel(int id)
    {
        var status = "Shipped";   // en vrai : lu dans la base
        if (status == "Shipped")
        {
            // Erreur prévue : on la renvoie, on ne lance pas d'exception
            return Problem(
                title: "Annulation impossible",
                detail: $"La commande {id} est déjà expédiée.",
                statusCode: StatusCodes.Status409Conflict);
        }
        return NoContent();
    }
}`,
      output: `POST /api/orders/10/cancel
HTTP/1.1 409 Conflict
Content-Type: application/problem+json; charset=utf-8

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.10","title":"Annulation impossible","status":409,"detail":"La commande 10 est déjà expédiée.","instance":"POST /api/orders/10/cancel","traceId":"00-d5dd8a91666b52382cf290baa59cf07c-2bc0cbc536fe6bc9-00"}

GET /api/orders/10
HTTP/1.1 404 Not Found
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.5","title":"Not Found","status":404,"instance":"GET /api/orders/10","traceId":"00-041a02f8678f72b402a5f807b58489ae-1612fdd1fbca65b6-00"}`,
      steps: [
        "<code>options.CustomizeProblemDetails = ctx =&gt; { … }</code> : ce code s'exécute pour <strong>chaque</strong> réponse ProblemDetails de l'application.",
        "<code>ctx.ProblemDetails.Instance = …</code> : on renseigne le champ <code>instance</code> avec le verbe et le chemin de la requête.",
        "<code>return Problem(title: …, detail: …, statusCode: StatusCodes.Status409Conflict);</code> : une méthode de <code>ControllerBase</code> qui renvoie un ProblemDetails, sans exception.",
        "<code>\"title\":\"Annulation impossible\"</code> : nos valeurs sont gardées, et <code>type</code> et <code>traceId</code> sont ajoutés automatiquement.",
        "<code>GET /api/orders/10</code> : aucune action GET n'existe. Le 404 de <code>UseStatusCodePages</code> reçoit lui aussi le champ <code>instance</code>."
      ],
      explain: "Erreurs prévues, exceptions métier et pannes : toutes finissent au même format."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Installer le filet",
      prompt: `<p>Dans une application vide, ajoute les trois lignes du premier exemple et un endpoint <code>GET /api/boom</code> qui lève une <code>Exception("secret interne")</code>. Vérifie avec <code>curl -i</code> que la réponse est un 500 <code>application/problem+json</code> et que « secret interne » n'y figure pas, puis retrouve le message dans la console.</p>`,
      hint: `<p>Le handler doit avoir un corps entre accolades pour pouvoir contenir un <code>throw</code> : <code>() =&gt; { throw new Exception("…"); }</code>.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();

app.MapGet("/api/boom", () =>
{
    throw new Exception("secret interne");
});

app.Run();`
    },
    {
      level: "moyen",
      title: "Le stock insuffisant en 409",
      prompt: `<p>Ajoute une exception <code>InsufficientStockException(int productId, int available)</code> dont le message est « Stock insuffisant pour le produit {productId} : {available} disponible(s). ». Modifie <code>DomainExceptionHandler</code> pour qu'elle donne un 409. Lève-la depuis un endpoint <code>POST /api/orders</code> pour tester.</p>`,
      hint: `<p>Un constructeur principal peut construire le message passé à la base : <code>: Exception($"…{productId}…")</code>. Dans le <code>switch</code>, ajoute un cas <code>InsufficientStockException =&gt; StatusCodes.Status409Conflict</code>.</p>`,
      solution: `// Fichier : Program.cs (extrait)
app.MapPost("/api/orders", () =>
{
    throw new InsufficientStockException(2, 0);
});

public class InsufficientStockException(int productId, int available)
    : Exception($"Stock insuffisant pour le produit {productId} : {available} disponible(s).");

// Fichier : Errors/DomainExceptionHandler.cs (extrait)
int status = exception switch
{
    NotFoundException => StatusCodes.Status404NotFound,
    ConflictException => StatusCodes.Status409Conflict,
    InsufficientStockException => StatusCodes.Status409Conflict,
    _ => 0
};`
    },
    {
      level: "difficile",
      title: "Un code d'erreur pour le front",
      prompt: `<p>Le front veut afficher un message traduit selon un code stable. Crée une classe de base <code>DomainException(string code, string message, int status)</code> avec les propriétés <code>Code</code> et <code>Status</code>, et fais-en hériter <code>NotFoundException</code> (code <code>"not_found"</code>, 404). Réécris le gestionnaire pour qu'il traite toute <code>DomainException</code> et ajoute une extension <code>errorCode</code> au ProblemDetails.</p>`,
      hint: `<p><code>if (exception is not DomainException domain) return false;</code>. Les extensions s'ajoutent avec <code>problem.Extensions["errorCode"] = domain.Code;</code>.</p>`,
      solution: `// Fichier : Errors/DomainException.cs
public class DomainException(string code, string message, int status) : Exception(message)
{
    public string Code { get; } = code;
    public int Status { get; } = status;
}

public class NotFoundException(string message)
    : DomainException("not_found", message, StatusCodes.Status404NotFound);

// Fichier : Errors/DomainExceptionHandler.cs
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

public class DomainExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext http,
        Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not DomainException domain) return false;

        http.Response.StatusCode = domain.Status;
        var problem = new ProblemDetails { Status = domain.Status, Detail = domain.Message };
        problem.Extensions["errorCode"] = domain.Code;

        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = http,
            ProblemDetails = problem
        });
    }
}`
    }
  ],
  quiz: [
    {
      q: `Quel type de contenu identifie une réponse ProblemDetails ?`,
      options: ["<code>application/json</code>", "<code>application/problem+json</code>", "<code>text/problem</code>"],
      answer: 1,
      why: `La RFC 9457 définit <code>application/problem+json</code>. Un client peut ainsi reconnaître une erreur standard avant même de lire le corps.`
    },
    {
      q: `Ton endpoint lève une <code>InvalidOperationException</code> et <code>UseExceptionHandler()</code> est actif. Que contient la réponse ?`,
      options: ["Le message et la stack trace de l'exception", "Un 500 ProblemDetails générique avec un <code>traceId</code>", "Une réponse vide avec le code 200"],
      answer: 1,
      why: `Le middleware répond un 500 au format ProblemDetails sans aucun détail interne. Le message et la stack trace partent dans les logs, que le <code>traceId</code> permet de retrouver.`
    },
    {
      q: `Que signifie <code>return false;</code> dans <code>TryHandleAsync</code> ?`,
      options: ["« Cette exception n'est pas pour moi » : le comportement suivant s'applique (500 par défaut)", "L'exception est ignorée et la requête réussit", "La réponse est un 400"],
      answer: 0,
      why: `<code>false</code> passe la main au gestionnaire suivant, puis au comportement par défaut. Seul <code>true</code> indique que la réponse a été écrite.`
    },
    {
      q: `« La commande est déjà expédiée, on ne peut plus l'annuler. » Quel code HTTP convient ?`,
      options: ["400 Bad Request", "404 Not Found", "409 Conflict"],
      answer: 2,
      why: `La requête est bien formée et la commande existe, mais elle entre en conflit avec l'état actuel de la ressource : c'est le rôle du 409. Le 400 est pour des données mal formées.`
    }
  ],
  project: `<p><strong>OrderFlow : une seule forme d'erreur.</strong> Crée <code>NotFoundException</code> et <code>ConflictException</code> dans le projet du domaine, puis <code>Errors/DomainExceptionHandler.cs</code> dans <code>OrderFlow.Api</code>. Dans <code>Program.cs</code> : <code>AddProblemDetails</code> (avec <code>CustomizeProblemDetails</code> qui remplit <code>instance</code>), <code>AddExceptionHandler&lt;DomainExceptionHandler&gt;</code>, puis <code>UseExceptionHandler()</code> et <code>UseStatusCodePages()</code> en tête du pipeline. Ajoute <code>POST /api/orders/{id:int}/cancel</code> : 404 si la commande n'existe pas, 409 si son statut est <code>Shipped</code>, sinon passe-la à <code>Cancelled</code>, remets les quantités en stock et réponds 204. Vérifie avec <code>curl -i</code> que chaque erreur est en <code>application/problem+json</code>.</p>`,
  resources: [
    { label: "Gérer les erreurs dans les API ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/error-handling-api" },
    { label: "Gérer les erreurs dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/error-handling" }
  ]
});
