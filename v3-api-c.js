window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 4 - Une API complète
// 1. Journaliser avec ILogger
// =====================================================================
window.COURSE.push({
  key: "api-logging",
  title: "Journaliser avec ILogger : niveaux et logs structurés",
  summary: "Tu sauras écrire des logs utiles dans ton API avec ILogger, choisir le bon niveau, filtrer par configuration et produire des logs structurés.",
  objectives: [
    "Injecter un ILogger&lt;T&gt; et écrire un log",
    "Choisir le bon niveau parmi les six disponibles",
    "Filtrer les logs dans appsettings.json",
    "Écrire des logs structurés avec des modèles de message et des portées"
  ],
  analogy: `<p>Un avion de ligne embarque une <strong>boîte noire</strong>. Pendant le vol, elle note tout : l'altitude, la vitesse, les alarmes. Personne ne la lit tant que tout va bien. Mais le jour d'un problème, c'est elle qui permet de comprendre ce qui s'est passé.</p>
<p>Les <strong>logs</strong> sont la boîte noire de ton API. En production, tu n'as pas de débogueur ni de point d'arrêt : il ne te reste que ce que l'application a écrit. Et comme dans un cockpit, chaque message a une <strong>importance</strong> : une simple note, une alerte orange, une alarme rouge.</p>`,
  lesson: `<h3>Pourquoi journaliser ?</h3>
<p>En développement, tu lances l'API depuis ton éditeur et tu poses des points d'arrêt. En production, l'API tourne sur un serveur, sans toi. Quand un client dit « ma commande a échoué à 14 h 03 », la seule trace est le <strong>journal</strong> (en anglais <em>log</em>) : une suite de messages horodatés écrits par l'application.</p>
<p>Côté Angular, tu utilises <code>console.log</code>. En .NET, on ne fait pas <code>Console.WriteLine</code> : on passe par <code>ILogger</code>, une interface fournie par le framework, qui sait filtrer, enrichir et envoyer les messages vers plusieurs destinations.</p>

<h3>ILogger&lt;T&gt; : un journal fourni par l'injection de dépendances</h3>
<p>Tu n'as rien à installer : ASP.NET Core enregistre la journalisation au démarrage. Il suffit de demander un <code>ILogger&lt;T&gt;</code> dans un constructeur ou dans les paramètres d'un endpoint. Le <code>T</code> donne la <strong>catégorie</strong> du log : en général le nom de la classe qui écrit, par exemple <code>OrderService</code>. C'est elle qui s'affiche dans la console et qui sert à filtrer.</p>
<div class="flow"><span>Ton code : logger.LogWarning(…)</span><span>ILogger (filtre par niveau)</span><span>Fournisseurs : console, debug, fichier, Seq…</span></div>
<p>Les <strong>fournisseurs</strong> (en anglais <em>providers</em>) sont les destinations. Par défaut : la console et la fenêtre de débogage. En production, on en ajoute un qui envoie les logs vers un outil de recherche (on le verra en partie 6). Ton code, lui, ne change jamais.</p>

<h3>Les six niveaux</h3>
<p>Chaque message a un <strong>niveau</strong> (en anglais <em>log level</em>). Une méthode existe pour chacun.</p>
<table>
<tr><th>Niveau</th><th>Méthode</th><th>Quand l'utiliser</th></tr>
<tr><td>Trace</td><td><code>LogTrace</code></td><td>Détail très fin, pour un bug coriace. Jamais activé en production.</td></tr>
<tr><td>Debug</td><td><code>LogDebug</code></td><td>Infos utiles au développeur : valeurs intermédiaires, choix faits.</td></tr>
<tr><td>Information</td><td><code>LogInformation</code></td><td>Événements normaux du métier : « commande 42 créée ».</td></tr>
<tr><td>Warning</td><td><code>LogWarning</code></td><td>Situation anormale mais gérée : produit introuvable, stock insuffisant.</td></tr>
<tr><td>Error</td><td><code>LogError</code></td><td>Une opération a échoué : exception, service externe en panne.</td></tr>
<tr><td>Critical</td><td><code>LogCritical</code></td><td>L'application entière est en danger : base de données injoignable.</td></tr>
</table>
<p>Dans la console, chaque niveau a une abréviation : <code>trce</code>, <code>dbug</code>, <code>info</code>, <code>warn</code>, <code>fail</code>, <code>crit</code>.</p>

<h3>Filtrer dans appsettings.json</h3>
<p>Tu ne veux pas tout voir tout le temps. La section <code>Logging:LogLevel</code> fixe un <strong>niveau minimum</strong> par catégorie. <code>Default</code> s'applique à tout le monde ; une catégorie plus précise l'emporte. Le modèle de projet met <code>"Microsoft.AspNetCore": "Warning"</code> pour cacher le bavardage du framework.</p>
<p>Avec <code>"Default": "Warning"</code> et <code>"OrderService": "Debug"</code>, tu vois tout ce qu'écrit <code>OrderService</code> à partir de Debug, et seulement les Warning et plus graves pour le reste. Le fichier <code>appsettings.Development.json</code> peut surcharger ces valeurs sur ton poste.</p>
<div class="tip">Pour voir le SQL généré par EF Core, ajoute <code>"Microsoft.EntityFrameworkCore.Database.Command": "Information"</code>. C'est l'astuce la plus utile de ce chapitre : on s'en servira dans les leçons suivantes.</div>

<h3>Logs structurés : un modèle, pas une chaîne</h3>
<p>Écris <code>logger.LogInformation("Commande {OrderId} payée", orderId)</code> et <strong>jamais</strong> <code>$"Commande {orderId} payée"</code>. La première forme est un <strong>modèle de message</strong> (en anglais <em>message template</em>) : le logger garde le texte final <em>et</em> une propriété <code>OrderId = 42</code> à part. Un outil comme Seq ou Application Insights peut alors chercher « tous les logs où OrderId vaut 42 ».</p>
<div class="compare"><div><h4>Interpolation $"…"</h4><p>Le texte est fabriqué avant d'arriver au logger. Il ne reste qu'une chaîne : impossible de filtrer par commande, et la chaîne est construite même si le niveau est désactivé.</p></div><div><h4>Modèle "{OrderId}"</h4><p>Le logger reçoit le modèle et les valeurs séparément. Il produit le texte, garde les propriétés, et ne fait rien si le niveau est filtré.</p></div></div>
<p>Attention : les valeurs sont associées aux trous <strong>par position</strong>, pas par nom. Le premier argument remplit le premier <code>{…}</code>.</p>

<h3>Exceptions et portées</h3>
<p>Pour une exception, passe-la en <strong>premier argument</strong> : <code>logger.LogError(ex, "Paiement refusé pour {OrderId}", id)</code>. Le logger affiche alors le type, le message et la pile d'appels.</p>
<p>Une <strong>portée</strong> (en anglais <em>scope</em>) ajoute un contexte à tous les logs écrits dans un bloc : <code>using (logger.BeginScope("Commande {OrderId}", id)) { … }</code>. ASP.NET Core en ouvre déjà une par requête, avec le chemin et un <code>TraceId</code> qui relie tous les logs d'une même requête.</p>
<div class="note">Ne journalise jamais de mot de passe, de jeton, de numéro de carte ni de données personnelles inutiles : les logs sont copiés partout et lus par beaucoup de monde. Pour du code appelé très souvent, utilise le générateur <code>[LoggerMessage]</code> (exercice difficile) : il produit un code optimisé qui évite toute allocation quand le niveau est désactivé.</div>`,
  examples: [
    {
      title: "Un service qui journalise",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<ProductCatalog>();
var app = builder.Build();

app.MapGet("/api/products/{id:int}", (int id, ProductCatalog catalog) =>
    catalog.Find(id) is { } name
        ? Results.Ok(new { id, name })
        : Results.NotFound());

app.Run();

class ProductCatalog(ILogger<ProductCatalog> logger)
{
    private readonly Dictionary<int, string> _names = new()
    {
        [1] = "Clavier",
        [2] = "Souris sans fil"
    };

    public string? Find(int id)
    {
        // Message template : {ProductId} devient une propriété du log
        logger.LogInformation("Recherche du produit {ProductId}", id);

        if (_names.TryGetValue(id, out var name))
            return name;

        logger.LogWarning("Produit {ProductId} introuvable", id);
        return null;
    }
}`,
      output: `> GET /api/products/1   puis   > GET /api/products/9
(console de l'API)
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
info: Microsoft.Hosting.Lifetime[0]
      Content root path: C:\\dev\\OrderFlow.Api
info: ProductCatalog[0]
      Recherche du produit 1
info: ProductCatalog[0]
      Recherche du produit 9
warn: ProductCatalog[0]
      Produit 9 introuvable`,
      steps: [
        "<code>class ProductCatalog(ILogger&lt;ProductCatalog&gt; logger)</code> : le constructeur principal demande un logger. L'injection de dépendances le fournit, rien à enregistrer.",
        "<code>logger.LogInformation(\"Recherche du produit {ProductId}\", id);</code> : un log de niveau Information. <code>{ProductId}</code> est un trou rempli par <code>id</code>.",
        "<code>logger.LogWarning(\"Produit {ProductId} introuvable\", id);</code> : produit absent, c'est anormal mais géré, donc Warning.",
        "<code>info: ProductCatalog[0]</code> : dans la sortie, on lit le niveau abrégé, la catégorie (le nom de la classe) et un numéro d'événement (0 par défaut).",
        "<code>Microsoft.Hosting.Lifetime</code> : les quatre premières lignes viennent du framework au démarrage. Elles aussi passent par ILogger."
      ],
      explain: "Dans les sorties de ce chapitre, une ligne qui commence par > est la requête envoyée (avec curl ou un fichier .http)."
    },
    {
      title: "Niveaux, filtres et exceptions",
      code: `// Fichier : appsettings.json -> "Logging": { "LogLevel": { "Default": "Warning", "OrderService": "Debug" } }

// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<OrderService>();
var app = builder.Build();

app.MapPost("/api/orders/{id:int}/pay", (int id, OrderService service, ILogger<Program> logger) =>
{
    logger.LogInformation("Requête de paiement reçue"); // filtré : Program est en Warning
    return service.Pay(id) ? Results.NoContent() : Results.Conflict();
});

app.Run();

class OrderService(ILogger<OrderService> logger)
{
    public bool Pay(int orderId)
    {
        logger.LogTrace("Entrée dans Pay");                      // filtré : sous Debug
        logger.LogDebug("Calcul du total de la commande {OrderId}", orderId);
        if (orderId == 2)
        {
            try
            {
                throw new InvalidOperationException("Banque indisponible");
            }
            catch (Exception ex)
            {
                // L'exception se passe en PREMIER argument
                logger.LogError(ex, "Paiement refusé pour la commande {OrderId}", orderId);
                return false;
            }
        }
        logger.LogInformation("Commande {OrderId} payée", orderId);
        return true;
    }
}`,
      output: `> POST /api/orders/1/pay
HTTP/1.1 204 No Content

> POST /api/orders/2/pay
HTTP/1.1 409 Conflict

(console de l'API)
dbug: OrderService[0]
      Calcul du total de la commande 1
info: OrderService[0]
      Commande 1 payée
dbug: OrderService[0]
      Calcul du total de la commande 2
fail: OrderService[0]
      Paiement refusé pour la commande 2
      System.InvalidOperationException: Banque indisponible
         at OrderService.Pay(Int32 orderId) in C:\\dev\\OrderFlow.Api\\Program.cs:line 23`,
      steps: [
        "<code>\"Default\": \"Warning\"</code> : par défaut, on ne garde que Warning, Error et Critical. Les lignes de démarrage (Information) disparaissent donc.",
        "<code>\"OrderService\": \"Debug\"</code> : exception pour la catégorie <code>OrderService</code>, qui affiche à partir de Debug.",
        "<code>logger.LogInformation(\"Requête de paiement reçue\");</code> : catégorie <code>Program</code>, niveau Information, sous le minimum Warning : rien ne s'affiche.",
        "<code>logger.LogTrace(\"Entrée dans Pay\");</code> : Trace est sous Debug, donc filtré lui aussi.",
        "<code>logger.LogError(ex, \"Paiement refusé…\", orderId);</code> : l'exception est passée en premier. La console affiche le message puis le type, le texte et la pile d'appels de l'exception."
      ],
      explain: "Le code ne change pas d'une machine à l'autre : seul le fichier de configuration décide de ce qui est affiché."
    },
    {
      title: "Logs structurés en JSON avec une portée",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);

// On remplace l'affichage texte par du JSON (une ligne par log)
builder.Logging.ClearProviders();
builder.Logging.AddJsonConsole(options =>
{
    options.IncludeScopes = true;
    options.JsonWriterOptions = new() { Indented = true };
});

var app = builder.Build();

app.MapPost("/api/orders/{id:int}/ship", (int id, ILogger<Program> logger) =>
{
    // Toutes les lignes écrites dans ce bloc porteront OrderId
    using (logger.BeginScope("Envoi de la commande {OrderId}", id))
    {
        logger.LogInformation("Colis remis au transporteur {Carrier}, {Weight} kg",
            "Colissimo", 1.25);
    }
    return Results.NoContent();
});

app.Run();`,
      output: `> POST /api/orders/7/ship
HTTP/1.1 204 No Content

(console de l'API)
{
  "EventId": 0,
  "LogLevel": "Information",
  "Category": "Program",
  "Message": "Colis remis au transporteur Colissimo, 1.25 kg",
  "State": {
    "Carrier": "Colissimo",
    "Weight": 1.25,
    "{OriginalFormat}": "Colis remis au transporteur {Carrier}, {Weight} kg"
  },
  "Scopes": [
    {
      "Message": "SpanId:5665716e329a7c20, TraceId:0b340e0aeeafca0073cfc98ac5d17dd3, ParentId:0000000000000000",
      "SpanId": "5665716e329a7c20",
      "TraceId": "0b340e0aeeafca0073cfc98ac5d17dd3",
      "ParentId": "0000000000000000"
    },
    {
      "Message": "ConnectionId:0HNPSCP0OUKG1",
      "ConnectionId": "0HNPSCP0OUKG1"
    },
    {
      "Message": "RequestPath:/api/orders/7/ship RequestId:0HNPSCP0OUKG1:00000001",
      "RequestId": "0HNPSCP0OUKG1:00000001",
      "RequestPath": "/api/orders/7/ship"
    },
    {
      "Message": "Envoi de la commande 7",
      "OrderId": 7,
      "{OriginalFormat}": "Envoi de la commande {OrderId}"
    }
  ]
}`,
      steps: [
        "<code>builder.Logging.ClearProviders();</code> : on retire les fournisseurs par défaut (console texte, debug).",
        "<code>AddJsonConsole(…)</code> : on ajoute une console qui écrit chaque log en JSON. <code>IncludeScopes</code> inclut les portées, <code>Indented</code> rend le JSON lisible (en production, on garde une ligne par log).",
        "<code>using (logger.BeginScope(\"Envoi de la commande {OrderId}\", id))</code> : ouvre une portée. Elle se ferme à la fin du bloc <code>using</code>.",
        "<code>\"State\"</code> : les propriétés <code>Carrier</code> et <code>Weight</code> sont rangées à part, avec leur vrai type (1.25 est un nombre, pas du texte).",
        "<code>\"Scopes\"</code> : les trois premières portées viennent d'ASP.NET Core (TraceId, connexion, chemin de la requête). La dernière est la nôtre, avec <code>OrderId</code>."
      ],
      explain: "C'est ce JSON que des outils comme Seq, Elasticsearch ou Application Insights indexent : tu peux ensuite chercher par OrderId ou par TraceId."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Journaliser la lecture d'un client",
      prompt: `<p>Crée un endpoint <code>GET /api/customers/{id:int}</code> qui cherche un client dans un dictionnaire en mémoire (1 : « Alice Martin », 2 : « Bruno Petit »). Ajoute un log <strong>Information</strong> « Client {CustomerId} lu » quand il existe, et un log <strong>Warning</strong> « Client {CustomerId} introuvable » sinon (avec un 404).</p>`,
      hint: `<p>Ajoute <code>ILogger&lt;Program&gt; logger</code> dans les paramètres de la lambda, à côté de <code>int id</code>.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var customers = new Dictionary<int, string> { [1] = "Alice Martin", [2] = "Bruno Petit" };

app.MapGet("/api/customers/{id:int}", (int id, ILogger<Program> logger) =>
{
    if (customers.TryGetValue(id, out var name))
    {
        logger.LogInformation("Client {CustomerId} lu", id);
        return Results.Ok(new { id, name });
    }
    logger.LogWarning("Client {CustomerId} introuvable", id);
    return Results.NotFound();
});

app.Run();`
    },
    {
      level: "moyen",
      title: "Régler les filtres",
      prompt: `<p>Écris la section <code>Logging</code> d'un <code>appsettings.Development.json</code> qui : affiche Information et plus pour tout le monde ; n'affiche que Warning et plus pour <code>Microsoft.AspNetCore</code> ; affiche Debug pour ta classe <code>OrderService</code> ; affiche les requêtes SQL d'EF Core.</p>`,
      hint: `<p>Une ligne par catégorie dans <code>LogLevel</code>. La catégorie des requêtes SQL est <code>Microsoft.EntityFrameworkCore.Database.Command</code>.</p>`,
      solution: `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "OrderService": "Debug",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}`
    },
    {
      level: "difficile",
      title: "Des logs générés avec [LoggerMessage]",
      prompt: `<p>Déclare une classe <code>static partial class Log</code> avec une méthode marquée <code>[LoggerMessage]</code> : niveau Warning, message « Stock insuffisant pour le produit {ProductId} : {Requested} demandés, {Available} en stock ». Appelle-la depuis un endpoint <code>POST /api/stock-check</code> qui reçoit <code>productId</code> et <code>quantity</code> en query string, avec un stock fixe de 3.</p>`,
      hint: `<p>La méthode est <code>public static partial void StockTooLow(ILogger logger, int productId, int requested, int available);</code>. Le compilateur écrit le corps pour toi.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/api/stock-check", (int productId, int quantity, ILogger<Program> logger) =>
{
    const int available = 3;
    if (quantity > available)
    {
        Log.StockTooLow(logger, productId, quantity, available);
        return Results.Conflict();
    }
    return Results.Ok();
});

app.Run();

static partial class Log
{
    // Le générateur de code écrit le corps de cette méthode
    [LoggerMessage(Level = LogLevel.Warning,
        Message = "Stock insuffisant pour le produit {ProductId} : {Requested} demandés, {Available} en stock")]
    public static partial void StockTooLow(ILogger logger, int productId, int requested, int available);
}`
    }
  ],
  quiz: [
    {
      q: `Quel niveau choisir pour « le client a demandé un produit qui n'existe pas » ?`,
      options: ["Critical", "Warning", "Trace"],
      answer: 1,
      why: `C'est une situation anormale mais gérée (on renvoie 404) : Warning. Critical est réservé à une application en danger, Trace au détail très fin de débogage.`
    },
    {
      q: `Pourquoi préférer <code>LogInformation("Commande {OrderId}", id)</code> à <code>LogInformation($"Commande {id}")</code> ?`,
      options: ["Le modèle garde OrderId comme propriété recherchable", "L'interpolation ne compile pas avec ILogger", "Il n'y a aucune différence"],
      answer: 0,
      why: `Avec un modèle, le logger conserve la valeur à part (log structuré) et ne construit rien si le niveau est filtré. L'interpolation compile, mais ne laisse qu'une chaîne figée.`
    },
    {
      q: `Avec <code>"Default": "Warning"</code> et <code>"OrderService": "Debug"</code>, que devient un <code>LogInformation</code> écrit par <code>ILogger&lt;Program&gt;</code> ?`,
      options: ["Il s'affiche", "Il provoque une exception", "Il est filtré"],
      answer: 2,
      why: `La catégorie <code>Program</code> n'a pas de règle propre : elle suit <code>Default</code>, donc Warning minimum. Information est en dessous, le log est ignoré.`
    },
    {
      q: `Comment journaliser correctement une exception attrapée dans <code>ex</code> ?`,
      options: ["<code>logger.LogError(ex.ToString())</code>", "<code>logger.LogError(ex, \"Échec pour {OrderId}\", id)</code>", "<code>Console.WriteLine(ex)</code>"],
      answer: 1,
      why: `La surcharge qui prend l'exception en premier argument la transmet aux fournisseurs, qui l'affichent ou l'indexent proprement, tout en gardant un message structuré. <code>ex.ToString()</code> perd la structure.`
    }
  ],
  project: `<p><strong>OrderFlow : un journal utile.</strong> Dans ton endpoint de création de commande, demande un <code>ILogger&lt;Program&gt;</code> (ou un logger dans ton service de commandes). Écris un log Information « Commande {OrderId} créée pour le client {CustomerId}, total {Total} » après le <code>SaveChangesAsync</code>, et un Warning « Stock insuffisant pour {ProductId} » quand tu refuses une ligne. Dans <code>appsettings.Development.json</code>, active la catégorie <code>Microsoft.EntityFrameworkCore.Database.Command</code> pour voir le SQL de chaque requête.</p>`,
  resources: [
    { label: "Journalisation dans .NET et ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/logging/" },
    { label: "Génération de source pour la journalisation (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/logger-message-generator" }
  ]
});

// =====================================================================
// 2. Un CRUD complet branché sur EF Core
// =====================================================================
window.COURSE.push({
  key: "api-crud-ef",
  title: "Un CRUD complet branché sur EF Core",
  summary: "Tu sauras écrire les endpoints créer, lire, modifier et supprimer d'une ressource, branchés sur un vrai DbContext, et créer une commande sur plusieurs tables en une seule transaction.",
  objectives: [
    "Injecter le DbContext dans des endpoints et lire avec une projection en DTO",
    "Créer, modifier et supprimer avec les bons codes HTTP (201, 204, 404)",
    "Valider les DTOs et renvoyer des erreurs ProblemDetails",
    "Créer une commande et ses lignes dans une seule transaction"
  ],
  analogy: `<p>Pense au comptoir d'une <strong>pharmacie</strong>. Le client ne va jamais dans la réserve : il parle au pharmacien. Le pharmacien vérifie l'ordonnance, va chercher les boîtes, met à jour le stock et tend un <strong>sachet</strong> au client.</p>
<p>Dans ton API, l'endpoint est le pharmacien, le DbContext est la réserve, la validation vérifie l'ordonnance, et le <strong>DTO</strong> est le sachet : on ne donne jamais l'étagère entière (l'entité EF Core), seulement ce que le client doit recevoir.</p>`,
  lesson: `<h3>CRUD : quatre opérations, quatre verbes</h3>
<p><strong>CRUD</strong> veut dire <em>Create, Read, Update, Delete</em> : créer, lire, modifier, supprimer. Presque toutes les ressources d'une API (produits, clients, commandes) ont ces quatre opérations. Chacune correspond à un verbe HTTP et à des codes de réponse précis, que le front Angular attend.</p>
<table>
<tr><th>Opération</th><th>Verbe et route</th><th>Succès</th><th>Échecs courants</th></tr>
<tr><td>Lire la liste</td><td><code>GET /api/products</code></td><td>200 + tableau</td><td></td></tr>
<tr><td>Lire un élément</td><td><code>GET /api/products/4</code></td><td>200 + objet</td><td>404</td></tr>
<tr><td>Créer</td><td><code>POST /api/products</code></td><td>201 + en-tête <code>Location</code></td><td>400 (données invalides)</td></tr>
<tr><td>Remplacer</td><td><code>PUT /api/products/4</code></td><td>204 (pas de corps)</td><td>400, 404</td></tr>
<tr><td>Supprimer</td><td><code>DELETE /api/products/4</code></td><td>204</td><td>404, 409 (encore utilisé)</td></tr>
</table>

<h3>Brancher le DbContext</h3>
<p>Tu connais <code>OrderFlowDbContext</code> depuis la partie 3. Dans une API, on l'enregistre avec <code>AddDbContext</code> et la chaîne de connexion de <code>appsettings.json</code> (<code>"Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True"</code>). ASP.NET Core crée alors <strong>un DbContext par requête</strong> (durée de vie <em>scoped</em>) et le jette à la fin. Il suffit d'ajouter un paramètre <code>OrderFlowDbContext db</code> à l'endpoint pour le recevoir.</p>
<div class="flow"><span>Requête HTTP</span><span>Endpoint</span><span>OrderFlowDbContext</span><span>SQL Server</span><span>DTO en JSON</span></div>

<h3>Lire : AsNoTracking et projection</h3>
<p>Pour une lecture, ajoute <code>AsNoTracking()</code> : EF Core ne surveille pas les objets lus, c'est plus rapide. Puis <strong>projette</strong> en DTO avec <code>Select(p =&gt; new ProductDto(…))</code> : EF Core traduit la projection en SQL et ne lit que les colonnes utiles.</p>
<p>Ne renvoie jamais l'entité directement. Elle peut contenir des colonnes internes (ici <code>ImageFileName</code>), des propriétés de navigation qui créent des boucles en JSON, et chaque changement de la base casserait ton contrat avec le front.</p>

<h3>Créer, modifier, supprimer</h3>
<p><strong>Créer</strong> : <code>db.Products.Add(product)</code> puis <code>SaveChangesAsync()</code>. Après l'INSERT, EF Core remplit <code>product.Id</code> avec la valeur générée par la base. On répond <code>Results.Created(url, dto)</code> : code 201 et en-tête <code>Location</code> qui indique où lire la nouvelle ressource.</p>
<p><strong>Modifier</strong> : on charge l'entité avec <code>FindAsync(id)</code>, on change ses propriétés, puis <code>SaveChangesAsync()</code>. Le <em>suivi des modifications</em> d'EF Core détecte ce qui a changé et génère un UPDATE sur ces seules colonnes.</p>
<p><strong>Supprimer</strong> : <code>ExecuteDeleteAsync()</code> envoie directement un DELETE en une seule requête SQL, sans charger l'entité. Il renvoie le nombre de lignes supprimées : 0 veut dire « n'existait pas », donc 404. Attention aux lignes liées : par convention, EF Core crée les clés étrangères obligatoires en <code>ON DELETE CASCADE</code>. Supprimer un produit déjà commandé effacerait aussi ses lignes de commande (exercice difficile).</p>
<div class="tip">Depuis .NET 10, <code>builder.Services.AddValidation()</code> valide automatiquement les attributs (<code>[Required]</code>, <code>[Range]</code>…) des paramètres des Minimal APIs et répond 400 avec un ProblemDetails. Piège vérifié : le générateur ignore les types <code>internal</code>. Déclare tes DTOs <code>public record</code>, sinon aucune validation n'a lieu.</div>

<h3>Une commande : plusieurs tables, une transaction</h3>
<p>Créer une commande touche trois tables : <code>Orders</code>, <code>OrderLines</code> et <code>Products</code> (le stock baisse). Bonne nouvelle : un seul <code>SaveChangesAsync()</code> envoie tous ces changements dans <strong>une transaction</strong>. Soit tout est enregistré, soit rien.</p>
<p>Deux règles métier importantes. Le <strong>prix vient de la base</strong>, jamais du corps de la requête : sinon un client malin achète un clavier à 1 €. Et si une vérification échoue (stock insuffisant), on renvoie l'erreur <em>avant</em> <code>SaveChangesAsync</code> : les objets modifiés en mémoire sont simplement abandonnés avec le DbContext de la requête.</p>
<pre class="diagram">
 POST /api/orders
   |
   +-- client existe ?          non -&gt; 400
   +-- charger les produits     (1 requête SQL)
   +-- pour chaque ligne :
   |     produit connu ?        non -&gt; 400
   |     stock suffisant ?      non -&gt; 409
   |     stock -= quantité, prix = prix en base
   +-- SaveChangesAsync()       (1 transaction)
   +-- 201 Created
</pre>
<div class="note">Deux réflexes pro. Si deux personnes modifient le même produit en même temps, la dernière écrase la première : une colonne <code>rowversion</code> et l'exception <code>DbUpdateConcurrencyException</code> permettent de détecter ce conflit et de répondre 409. Et quand la logique grossit, on la sort des endpoints vers un service (<code>OrderService</code>) : c'est le sujet de la partie 5.</div>`,
  examples: [
    {
      title: "Lire : la liste et un produit",
      code: `// Fichier : Program.cs
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
var app = builder.Build();

var products = app.MapGroup("/api/products");

// GET /api/products : toute la liste, projetée en DTO
products.MapGet("/", async (OrderFlowDbContext db) =>
    await db.Products
        .AsNoTracking()
        .OrderBy(p => p.Id)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price, p.Stock))
        .ToListAsync());

// GET /api/products/4 : un produit ou 404
products.MapGet("/{id:int}", async (int id, OrderFlowDbContext db) =>
    await db.Products
        .AsNoTracking()
        .Where(p => p.Id == id)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price, p.Stock))
        .FirstOrDefaultAsync() is { } dto
            ? Results.Ok(dto)
            : Results.NotFound());

app.Run();

public record ProductDto(int Id, string Name, decimal Price, int Stock);`,
      output: `> GET /api/products
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":1,"name":"Clavier","price":89.90,"stock":15},
 {"id":2,"name":"Souris sans fil","price":29.90,"stock":40},
 {"id":3,"name":"Casque audio","price":59.90,"stock":0},
 {"id":4,"name":"Webcam HD","price":45.50,"stock":12},
 {"id":5,"name":"Tapis de souris","price":9.90,"stock":100},
 {"id":6,"name":"Lampe de bureau","price":34.00,"stock":7},
 {"id":7,"name":"Station USB-C","price":119.00,"stock":5},
 {"id":8,"name":"Micro USB","price":69.00,"stock":9},
 {"id":9,"name":"Support portable","price":39.90,"stock":20},
 {"id":10,"name":"Chargeur rapide","price":24.90,"stock":30},
 {"id":11,"name":"Hub HDMI","price":19.90,"stock":0},
 {"id":12,"name":"Disque SSD 1 To","price":99.00,"stock":11}]

> GET /api/products/4
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":4,"name":"Webcam HD","price":45.50,"stock":12}

> GET /api/products/999
HTTP/1.1 404 Not Found`,
      steps: [
        "<code>builder.Services.AddDbContext&lt;OrderFlowDbContext&gt;(…)</code> : enregistre le DbContext (un par requête) avec la chaîne de connexion nommée <code>OrderFlow</code>. La base contient ici 12 produits.",
        "<code>app.MapGroup(\"/api/products\")</code> : un groupe de routes, pour ne pas répéter le préfixe.",
        "<code>.AsNoTracking()</code> : lecture seule, EF Core ne garde pas les objets en mémoire.",
        "<code>.Select(p =&gt; new ProductDto(…))</code> : la projection devient un <code>SELECT [Id], [Name], [Price], [Stock]</code>. La colonne <code>ImageFileName</code> n'est même pas lue.",
        "<code>.FirstOrDefaultAsync() is { } dto</code> : le motif <code>{ }</code> teste « non null » et nomme le résultat <code>dto</code>. Sinon on renvoie 404.",
        "<code>public record ProductDto(…)</code> : le DTO. En JSON, les noms passent en camelCase (<code>id</code>, <code>name</code>) automatiquement."
      ]
    },
    {
      title: "Créer, remplacer, supprimer",
      code: `// Fichier : Program.cs
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
builder.Services.AddValidation();      // valide les DataAnnotations des DTOs (.NET 10)
builder.Services.AddProblemDetails();  // erreurs au format ProblemDetails
var app = builder.Build();
var products = app.MapGroup("/api/products");

products.MapPost("/", async (SaveProductRequest request, OrderFlowDbContext db) =>
{
    var product = new Product { Name = request.Name, Price = request.Price, Stock = request.Stock };
    db.Products.Add(product);
    await db.SaveChangesAsync();           // INSERT, puis product.Id est rempli
    return Results.Created($"/api/products/{product.Id}",
        new ProductDto(product.Id, product.Name, product.Price, product.Stock));
});
products.MapPut("/{id:int}", async (int id, SaveProductRequest request, OrderFlowDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();
    product.Name = request.Name;           // EF Core suit ces changements
    product.Price = request.Price;
    product.Stock = request.Stock;
    await db.SaveChangesAsync();           // UPDATE
    return Results.NoContent();
});
products.MapDelete("/{id:int}", async (int id, OrderFlowDbContext db) =>
{
    int deleted = await db.Products.Where(p => p.Id == id).ExecuteDeleteAsync();
    return deleted == 1 ? Results.NoContent() : Results.NotFound();
});
app.Run();

public record SaveProductRequest([Required, StringLength(100)] string Name,
    [Range(0.01, 100000)] decimal Price, [Range(0, 100000)] int Stock);
public record ProductDto(int Id, string Name, decimal Price, int Stock);`,
      output: `> POST /api/products
{"name":"Ecran 27 pouces","price":249.00,"stock":8}
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/products/13

{"id":13,"name":"Ecran 27 pouces","price":249.00,"stock":8}

> POST /api/products
{"name":"","price":0,"stock":5}
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1",
 "title":"One or more validation errors occurred.","status":400,
 "errors":{"Name":["The Name field is required."],
           "Price":["The field Price must be between 0,01 and 100000."]},
 "traceId":"00-ec5718553897940e8afc55ca7f9ec13d-2601965bd10b44b2-00"}

> PUT /api/products/13
{"name":"Ecran 27 pouces","price":229.00,"stock":6}
HTTP/1.1 204 No Content

> PUT /api/products/999
{"name":"Fantome","price":1,"stock":1}
HTTP/1.1 404 Not Found

> DELETE /api/products/13
HTTP/1.1 204 No Content

> DELETE /api/products/13
HTTP/1.1 404 Not Found`,
      steps: [
        "<code>builder.Services.AddValidation();</code> : active la validation automatique. Le second POST (nom vide, prix 0) est refusé avant même d'entrer dans l'endpoint : 400 avec la liste des erreurs par champ.",
        "<code>db.Products.Add(product); await db.SaveChangesAsync();</code> : l'INSERT part en base et l'identifiant généré (13) est recopié dans <code>product.Id</code>.",
        "<code>Results.Created($\"/api/products/{product.Id}\", …)</code> : code 201, en-tête <code>Location</code> et le DTO créé dans le corps.",
        "<code>await db.Products.FindAsync(id)</code> : charge l'entité <strong>suivie</strong>. Modifier ses propriétés suffit : <code>SaveChangesAsync</code> génère l'UPDATE.",
        "<code>ExecuteDeleteAsync()</code> : un <code>DELETE … WHERE Id = @id</code> direct. Le second DELETE trouve 0 ligne, d'où le 404.",
        "<code>public record SaveProductRequest(…)</code> : un seul DTO pour POST et PUT, car PUT remplace tous les champs. Il est <code>public</code> pour que la validation le voie."
      ],
      explain: "Le message « between 0,01 and 100000 » utilise la culture de la machine (ici française). Le texte peut varier d'un serveur à l'autre ; le code 400 et la structure, eux, ne changent pas."
    },
    {
      title: "Créer une commande sur trois tables",
      code: `// Fichier : Program.cs (début identique à l'exemple 2 : AddDbContext, AddValidation, AddProblemDetails)
app.MapPost("/api/orders", async (CreateOrderRequest request, OrderFlowDbContext db) =>
{
    if (!await db.Customers.AnyAsync(c => c.Id == request.CustomerId))
        return Results.Problem(statusCode: 400, title: "Client inconnu");

    // Un seul aller-retour SQL pour charger tous les produits demandés
    var ids = request.Lines.Select(l => l.ProductId).ToList();
    var products = await db.Products.Where(p => ids.Contains(p.Id)).ToDictionaryAsync(p => p.Id);

    var order = new Order { CustomerId = request.CustomerId, OrderDate = DateTime.UtcNow, Status = OrderStatus.Pending };
    foreach (var line in request.Lines)
    {
        if (!products.TryGetValue(line.ProductId, out var product))
            return Results.Problem(statusCode: 400, title: $"Produit {line.ProductId} inconnu");
        if (product.Stock < line.Quantity)
            return Results.Problem(statusCode: 409, title: "Stock insuffisant",
                detail: $"{product.Name} : {product.Stock} en stock, {line.Quantity} demandé(s)");

        product.Stock -= line.Quantity;  // le prix vient de la base, jamais du client
        order.Lines.Add(new OrderLine { ProductId = product.Id, Quantity = line.Quantity, UnitPrice = product.Price });
    }

    db.Orders.Add(order);
    await db.SaveChangesAsync();         // commande + lignes + stocks : une seule transaction
    var total = order.Lines.Sum(l => l.Quantity * l.UnitPrice);
    return Results.Created($"/api/orders/{order.Id}", new OrderCreatedDto(order.Id, order.Status.ToString(), total));
});

app.Run();

public record CreateOrderRequest(int CustomerId, [MinLength(1)] List<OrderLineRequest> Lines);
public record OrderLineRequest(int ProductId, [Range(1, 100)] int Quantity);
public record OrderCreatedDto(int Id, string Status, decimal Total);`,
      output: `> POST /api/orders
{"customerId":1,"lines":[{"productId":2,"quantity":3},{"productId":5,"quantity":2}]}
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/orders/2

{"id":2,"status":"Pending","total":109.50}

> POST /api/orders
{"customerId":1,"lines":[{"productId":1,"quantity":1},{"productId":3,"quantity":2}]}
HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.10","title":"Stock insuffisant",
 "status":409,"detail":"Casque audio : 0 en stock, 2 demandé(s)",
 "traceId":"00-538aeca665dbcb150ea3ab4b291b0f99-c30bd3017a9ea3eb-00"}

> POST /api/orders
{"customerId":1,"lines":[]}
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1",
 "title":"One or more validation errors occurred.","status":400,
 "errors":{"Lines":["The field Lines must be a string or array type with a minimum length of '1'."]},
 "traceId":"00-1096979aacbbbf23226471b7c244ae2e-b5c37e0203fd4760-00"}`,
      steps: [
        "<code>await db.Customers.AnyAsync(…)</code> : vérifie l'existence du client avec un <code>SELECT CASE WHEN EXISTS…</code>, sans charger la ligne.",
        "<code>Where(p =&gt; ids.Contains(p.Id)).ToDictionaryAsync(p =&gt; p.Id)</code> : un seul <code>WHERE Id IN (…)</code> pour tous les produits, rangés dans un dictionnaire par Id.",
        "<code>if (product.Stock &lt; line.Quantity) return Results.Problem(statusCode: 409, …)</code> : le Casque audio a 0 en stock. On sort <em>avant</em> SaveChanges : le stock du Clavier, déjà baissé en mémoire, n'est jamais enregistré.",
        "<code>UnitPrice = product.Price</code> : le prix est recopié depuis la base au moment de la commande. Il restera figé même si le prix du produit change ensuite.",
        "<code>await db.SaveChangesAsync();</code> : un INSERT dans Orders, deux dans OrderLines, deux UPDATE dans Products, le tout dans une transaction.",
        "<code>[MinLength(1)] List&lt;OrderLineRequest&gt; Lines</code> : une commande sans ligne est refusée par la validation. Total de la première commande : 3 × 29,90 + 2 × 9,90 = 109,50."
      ],
      explain: "L'Id vaut 2 car la base contenait déjà une commande. Le statut est renvoyé en texte grâce à order.Status.ToString()."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire les clients",
      prompt: `<p>Ajoute un groupe <code>/api/customers</code> avec <code>GET /</code> (tous les clients triés par nom) et <code>GET /{id:int}</code> (un client ou 404). Renvoie un <code>CustomerDto(int Id, string Name, string Email)</code>, jamais l'entité.</p>`,
      hint: `<p>Reprends l'exemple 1 : <code>AsNoTracking()</code>, <code>OrderBy(c =&gt; c.Name)</code>, puis <code>Select(c =&gt; new CustomerDto(…))</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
var app = builder.Build();

var customers = app.MapGroup("/api/customers");

customers.MapGet("/", async (OrderFlowDbContext db) =>
    await db.Customers.AsNoTracking()
        .OrderBy(c => c.Name)
        .Select(c => new CustomerDto(c.Id, c.Name, c.Email))
        .ToListAsync());

customers.MapGet("/{id:int}", async (int id, OrderFlowDbContext db) =>
    await db.Customers.AsNoTracking()
        .Where(c => c.Id == id)
        .Select(c => new CustomerDto(c.Id, c.Name, c.Email))
        .FirstOrDefaultAsync() is { } dto
            ? Results.Ok(dto)
            : Results.NotFound());

app.Run();

public record CustomerDto(int Id, string Name, string Email);`
    },
    {
      level: "moyen",
      title: "Créer un client sans doublon d'email",
      prompt: `<p>Écris <code>POST /api/customers</code> avec un DTO validé (<code>[Required, StringLength(100)] Name</code>, <code>[Required, EmailAddress] Email</code>). Si un client a déjà cet email, réponds <strong>409</strong> avec un ProblemDetails « Email déjà utilisé ». Sinon, crée le client (avec <code>CreatedAt = DateTime.UtcNow</code>) et réponds 201.</p>`,
      hint: `<p>Teste d'abord <code>await db.Customers.AnyAsync(c =&gt; c.Email == request.Email)</code>. N'oublie pas <code>AddValidation()</code> et un DTO <code>public</code>.</p>`,
      solution: `using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
builder.Services.AddValidation();
builder.Services.AddProblemDetails();
var app = builder.Build();

app.MapPost("/api/customers", async (CreateCustomerRequest request, OrderFlowDbContext db) =>
{
    if (await db.Customers.AnyAsync(c => c.Email == request.Email))
        return Results.Problem(statusCode: 409, title: "Email déjà utilisé");

    var customer = new Customer { Name = request.Name, Email = request.Email, CreatedAt = DateTime.UtcNow };
    db.Customers.Add(customer);
    await db.SaveChangesAsync();
    return Results.Created($"/api/customers/{customer.Id}",
        new CustomerDto(customer.Id, customer.Name, customer.Email));
});

app.Run();

public record CreateCustomerRequest([Required, StringLength(100)] string Name, [Required, EmailAddress] string Email);
public record CustomerDto(int Id, string Name, string Email);`
    },
    {
      level: "difficile",
      title: "Refuser de supprimer un produit déjà commandé",
      prompt: `<p>Essaie <code>DELETE /api/products/1</code> avec l'exemple 2 : réponse 204. Problème : le Clavier figurait dans une commande, et par convention EF Core a créé la clé étrangère <code>OrderLines → Products</code> avec <code>ON DELETE CASCADE</code>. SQL Server a donc effacé <strong>en silence</strong> les lignes de commande qui le contenaient ! Réécris l'endpoint DELETE pour renvoyer <strong>409</strong> avec un ProblemDetails clair si le produit apparaît dans <code>OrderLines</code>, 404 s'il n'existe pas, et 204 sinon.</p>`,
      hint: `<p>Vérifie <code>await db.OrderLines.AnyAsync(l =&gt; l.ProductId == id)</code> avant le <code>ExecuteDeleteAsync()</code>. Pour une protection en base en plus, configure la relation avec <code>.OnDelete(DeleteBehavior.Restrict)</code> dans <code>OnModelCreating</code> et crée une migration.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
builder.Services.AddProblemDetails();
var app = builder.Build();

app.MapDelete("/api/products/{id:int}", async (int id, OrderFlowDbContext db) =>
{
    if (await db.OrderLines.AnyAsync(l => l.ProductId == id))
        return Results.Problem(statusCode: 409, title: "Produit déjà commandé",
            detail: $"Le produit {id} figure dans au moins une commande : il ne peut pas être supprimé.");

    int deleted = await db.Products.Where(p => p.Id == id).ExecuteDeleteAsync();
    return deleted == 1 ? Results.NoContent() : Results.NotFound();
});

app.Run();`
    }
  ],
  quiz: [
    {
      q: `Que doit renvoyer un POST qui a bien créé un produit ?`,
      options: ["200 OK sans corps", "204 No Content", "201 Created avec un en-tête Location"],
      answer: 2,
      why: `201 signale une création, et <code>Location</code> indique l'URL de la nouvelle ressource. 204 sert aux opérations réussies sans corps, comme PUT ou DELETE.`
    },
    {
      q: `Dans un PUT, tu fais <code>FindAsync</code>, tu changes <code>product.Price</code>, puis <code>SaveChangesAsync()</code>. Pourquoi aucun appel à <code>Update()</code> n'est nécessaire ?`,
      options: ["Parce que l'entité chargée est suivie : EF Core détecte le changement", "Parce que SaveChangesAsync réécrit toute la table", "Parce que PUT est géré automatiquement par ASP.NET Core"],
      answer: 0,
      why: `<code>FindAsync</code> renvoie une entité suivie par le DbContext. Au <code>SaveChangesAsync</code>, EF Core compare les valeurs et génère un UPDATE sur les seules colonnes modifiées.`
    },
    {
      q: `Pourquoi le prix unitaire d'une ligne de commande est-il lu en base et pas dans la requête ?`,
      options: ["Pour éviter un appel réseau", "Parce que le client pourrait envoyer n'importe quel prix", "Parce qu'un decimal ne passe pas en JSON"],
      answer: 1,
      why: `Tout ce qui vient du client est modifiable par lui. Le prix fait partie des règles métier du serveur : on le lit dans la table Products au moment de la commande.`
    },
    {
      q: `Tes DTOs ont des attributs <code>[Required]</code> mais aucune requête n'est jamais refusée, malgré <code>AddValidation()</code>. Cause la plus probable ?`,
      options: ["Les DTOs sont déclarés <code>internal</code> (ou sans modificateur)", "Il manque <code>[ApiController]</code>", "SQL Server n'est pas démarré"],
      answer: 0,
      why: `Le générateur de validation de .NET 10 ne prend en compte que les types publics. <code>[ApiController]</code> concerne les controllers, pas les Minimal APIs.`
    }
  ],
  project: `<p><strong>OrderFlow : le CRUD des produits et la prise de commande.</strong> Crée le groupe <code>/api/products</code> avec les cinq endpoints (liste, détail, POST, PUT, DELETE avec le 409 de l'exercice difficile), puis <code>POST /api/orders</code> comme l'exemple 3. Ajoute <code>GET /api/orders/{id}</code> qui renvoie un <code>OrderDto(int Id, string CustomerName, DateTime OrderDate, string Status, List&lt;OrderLineDto&gt; Lines, decimal Total)</code>, construit par projection (<code>o.Customer!.Name</code>, <code>o.Lines.Select(…)</code>, <code>o.Lines.Sum(l =&gt; l.Quantity * l.UnitPrice)</code>). Teste tout avec un fichier <code>OrderFlow.http</code>.</p>`,
  resources: [
    { label: "Tutoriel : créer une API minimale avec ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/tutorials/min-web-api" },
    { label: "Enregistrer des données avec EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/saving/basic" }
  ]
});

// =====================================================================
// 3. Pagination, filtres et tri
// =====================================================================
window.COURSE.push({
  key: "api-paging-filtering",
  title: "Pagination, filtres et tri",
  summary: "Tu sauras renvoyer une liste découpée en pages, filtrable et triable, en laissant SQL Server faire tout le travail.",
  objectives: [
    "Paginer avec Skip et Take et renvoyer le nombre total d'éléments",
    "Ajouter des filtres optionnels en composant un IQueryable",
    "Trier selon une liste blanche de champs",
    "Regrouper les paramètres de query string avec [AsParameters]"
  ],
  analogy: `<p>Sur un site marchand, tu ne vois jamais les 50 000 articles d'un coup. Tu vois <strong>20 résultats par page</strong>, une barre de <strong>filtres</strong> à gauche (prix, marque, en stock) et un menu <strong>« trier par »</strong>. En bas : « page 2 sur 37 ».</p>
<p>Ton API doit offrir la même chose au front Angular. Et comme un bon magasinier qui ne sort de la réserve que les cartons demandés, elle doit demander à la base <em>seulement</em> les lignes de la page, déjà filtrées et triées.</p>`,
  lesson: `<h3>Pourquoi ne pas tout renvoyer ?</h3>
<p>Aujourd'hui, OrderFlow a 12 produits. Dans un an, il en aura peut-être 50 000, et des centaines de milliers de commandes. Renvoyer toute la table à chaque appel, c'est charger la base, saturer la mémoire du serveur, alourdir le réseau et figer l'écran Angular. La <strong>pagination</strong> découpe la liste en pages de taille fixe.</p>

<h3>Skip et Take</h3>
<p>Le client envoie <code>?page=2&amp;pageSize=5</code>. Il faut sauter les éléments des pages précédentes avec <code>Skip((page - 1) * pageSize)</code>, puis en garder <code>pageSize</code> avec <code>Take(pageSize)</code>. EF Core traduit cela en <code>OFFSET … ROWS FETCH NEXT … ROWS ONLY</code> : seules 5 lignes sortent de SQL Server.</p>
<pre class="diagram">
 Produits triés par Id, pageSize = 5

 [ 1  2  3  4  5 ] [ 6  7  8  9 10 ] [ 11 12 ]
     page 1            page 2          page 3

 page 2 : Skip((2 - 1) * 5) = Skip(5), Take(5)
          =&gt; produits 6 à 10
</pre>
<p>Deux règles à ne jamais oublier. D'abord, <strong>trier avant de paginer</strong> : sans <code>OrderBy</code>, SQL Server ne garantit aucun ordre, et un produit pourrait apparaître sur deux pages. Ensuite, <strong>borner les paramètres</strong> : <code>Math.Max(page, 1)</code> et <code>Math.Clamp(pageSize, 1, 50)</code>. Sinon un appel avec <code>pageSize=1000000</code> annule tout l'intérêt de la pagination.</p>

<h3>Renvoyer le total</h3>
<p>Pour afficher « page 2 sur 3 », le front a besoin du <strong>nombre total</strong> d'éléments. On le calcule avec <code>CountAsync()</code> sur la même requête, <em>avant</em> <code>Skip</code> et <code>Take</code>. On renvoie le tout dans un petit record générique <code>PagedResult&lt;T&gt;</code> : les éléments, la page, la taille, le total et le nombre de pages. C'est le format qu'attend un composant de pagination Angular (par exemple <code>mat-paginator</code>).</p>
<div class="tip">Les deux pièges classiques : appeler <code>CountAsync()</code> <em>après</em> <code>Take</code> (le total vaut alors au plus <code>pageSize</code>), et appeler <code>ToListAsync()</code> <em>avant</em> <code>Skip</code> (toute la table est chargée en mémoire, puis découpée en C#).</div>

<h3>Filtres : composer un IQueryable</h3>
<p>Un <code>IQueryable&lt;Product&gt;</code> n'est pas une liste : c'est une <strong>requête en construction</strong>. Chaque <code>Where</code> ajoute une condition, mais rien n'est envoyé à la base tant que tu n'appelles pas <code>ToListAsync()</code>, <code>CountAsync()</code> ou <code>FirstOrDefaultAsync()</code>. On peut donc ajouter un filtre seulement s'il est présent dans l'URL : <code>if (minPrice is not null) query = query.Where(…)</code>.</p>
<div class="flow"><span>db.Products</span><span>+ Where si search</span><span>+ Where si minPrice</span><span>+ OrderBy</span><span>ToListAsync : 1 seule requête SQL</span></div>
<p>Les paramètres de filtre sont <strong>nullables</strong> (<code>string?</code>, <code>decimal?</code>, <code>bool?</code>) : s'ils sont absents de l'URL, ils valent <code>null</code> et le filtre est ignoré. <code>p.Name.Contains(search)</code> devient un <code>LIKE '%souris%'</code>. Avec la collation par défaut de SQL Server, la comparaison ignore la casse : « souris » trouve aussi « Souris sans fil ».</p>

<h3>Tri : une liste blanche</h3>
<p>Le client envoie <code>?sort=price</code> ou <code>?sort=-price</code> (le signe moins veut dire « décroissant », une convention répandue). On ne construit jamais le tri à partir du texte brut : on fait un <code>switch</code> sur une <strong>liste blanche</strong> de valeurs connues, avec un tri par défaut pour tout le reste. Ajoute toujours <code>ThenBy(p =&gt; p.Id)</code> après un tri sur une colonne qui peut avoir des doublons (deux produits au même prix) : l'ordre reste stable d'une page à l'autre.</p>

<h3>[AsParameters] : ranger les paramètres</h3>
<p>Quand un endpoint a six paramètres de query string, la lambda devient illisible. <code>[AsParameters]</code> permet de les regrouper dans un record : <code>public record ProductQuery(string? Search, string? Sort, int? Page, int? PageSize);</code>. Chaque propriété est lue dans la query string comme si c'était un paramètre de la lambda.</p>
<table>
<tr><th>Paramètre</th><th>Exemple</th><th>Effet SQL</th></tr>
<tr><td><code>search</code></td><td><code>?search=souris</code></td><td><code>WHERE Name LIKE '%souris%'</code></td></tr>
<tr><td><code>minPrice</code>, <code>maxPrice</code></td><td><code>?minPrice=30&amp;maxPrice=70</code></td><td><code>WHERE Price &gt;= 30 AND Price &lt;= 70</code></td></tr>
<tr><td><code>sort</code></td><td><code>?sort=-price</code></td><td><code>ORDER BY Price DESC, Id</code></td></tr>
<tr><td><code>page</code>, <code>pageSize</code></td><td><code>?page=2&amp;pageSize=5</code></td><td><code>OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY</code></td></tr>
</table>
<div class="note">La pagination par <code>OFFSET</code> ralentit sur les pages très lointaines : SQL Server doit quand même parcourir les lignes sautées. Pour un défilement infini sur de gros volumes, on utilise la <strong>pagination par curseur</strong> (<em>keyset pagination</em>) : « donne-moi les 20 produits dont l'Id est supérieur à 4520 » (<code>Where(p =&gt; p.Id &gt; lastId).Take(20)</code>), qui reste rapide grâce à l'index.</div>`,
  examples: [
    {
      title: "Une page de produits avec le total",
      code: `// Fichier : Program.cs
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
var app = builder.Build();

// GET /api/products?page=2&pageSize=5
app.MapGet("/api/products", async (OrderFlowDbContext db, int page = 1, int pageSize = 5) =>
{
    page = Math.Max(page, 1);                // jamais de page 0 ou négative
    pageSize = Math.Clamp(pageSize, 1, 50);  // jamais 10 000 lignes d'un coup

    var query = db.Products.AsNoTracking().OrderBy(p => p.Id); // tri stable AVANT Skip
    int total = await query.CountAsync();                       // compte AVANT Skip/Take
    var items = await query
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price, p.Stock))
        .ToListAsync();

    return Results.Ok(new PagedResult<ProductDto>(items, page, pageSize, total));
});

app.Run();

public record ProductDto(int Id, string Name, decimal Price, int Stock);

public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}`,
      output: `> GET /api/products?page=2&pageSize=5
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"items":[{"id":6,"name":"Lampe de bureau","price":34.00,"stock":7},
          {"id":7,"name":"Station USB-C","price":119.00,"stock":5},
          {"id":8,"name":"Micro USB","price":69.00,"stock":9},
          {"id":9,"name":"Support portable","price":39.90,"stock":20},
          {"id":10,"name":"Chargeur rapide","price":24.90,"stock":30}],
 "page":2,"pageSize":5,"totalCount":12,"totalPages":3}

> GET /api/products?page=3&pageSize=5
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"items":[{"id":11,"name":"Hub HDMI","price":19.90,"stock":0},
          {"id":12,"name":"Disque SSD 1 To","price":99.00,"stock":11}],
 "page":3,"pageSize":5,"totalCount":12,"totalPages":3}

(SQL envoyé pour la page 2, vu dans les logs EF Core)
SELECT COUNT(*)
FROM [Products] AS [p]

SELECT [p].[Id], [p].[Name], [p].[Price], [p].[Stock]
FROM [Products] AS [p]
ORDER BY [p].[Id]
OFFSET @p ROWS FETCH NEXT @p ROWS ONLY`,
      steps: [
        "<code>int page = 1, int pageSize = 5</code> : des paramètres simples avec valeur par défaut sont lus dans la query string. Absents, ils valent 1 et 5.",
        "<code>Math.Clamp(pageSize, 1, 50)</code> : borne la taille entre 1 et 50. Un appel <code>?page=0&amp;pageSize=1000</code> donne en réalité la page 1 avec 50 éléments maximum.",
        "<code>db.Products.AsNoTracking().OrderBy(p =&gt; p.Id)</code> : on construit la requête, rien n'est encore exécuté.",
        "<code>await query.CountAsync()</code> : premier aller-retour SQL, un <code>SELECT COUNT(*)</code> sur toute la table (12).",
        "<code>.Skip((page - 1) * pageSize).Take(pageSize)</code> : devient <code>OFFSET … FETCH NEXT …</code>. Pour la page 2, on saute 5 lignes et on en prend 5 (ici les deux valeurs sont égales, EF Core réutilise le même paramètre <code>@p</code>).",
        "<code>public int TotalPages =&gt; …</code> : une propriété calculée du record, sérialisée en JSON comme les autres : 12 / 5 arrondi au supérieur = 3."
      ]
    },
    {
      title: "Des filtres optionnels",
      code: `// Fichier : Program.cs (même début que l'exemple 1)
// GET /api/products?search=souris&minPrice=5&maxPrice=50&inStock=true
app.MapGet("/api/products", async (OrderFlowDbContext db,
    string? search, decimal? minPrice, decimal? maxPrice, bool? inStock) =>
{
    IQueryable<Product> query = db.Products.AsNoTracking();

    // Chaque filtre n'est ajouté que s'il est présent dans l'URL
    if (!string.IsNullOrWhiteSpace(search))
        query = query.Where(p => p.Name.Contains(search));
    if (minPrice is not null)
        query = query.Where(p => p.Price >= minPrice);
    if (maxPrice is not null)
        query = query.Where(p => p.Price <= maxPrice);
    if (inStock == true)
        query = query.Where(p => p.Stock > 0);

    return await query
        .OrderBy(p => p.Id)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price, p.Stock))
        .ToListAsync();   // une seule requête SQL, avec tous les WHERE
});

app.Run();

public record ProductDto(int Id, string Name, decimal Price, int Stock);`,
      output: `> GET /api/products?search=souris
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":2,"name":"Souris sans fil","price":29.90,"stock":40},
 {"id":5,"name":"Tapis de souris","price":9.90,"stock":100}]

> GET /api/products?minPrice=30&maxPrice=70&inStock=true
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":4,"name":"Webcam HD","price":45.50,"stock":12},
 {"id":6,"name":"Lampe de bureau","price":34.00,"stock":7},
 {"id":8,"name":"Micro USB","price":69.00,"stock":9},
 {"id":9,"name":"Support portable","price":39.90,"stock":20}]

(SQL envoyé pour la seconde requête)
SELECT [p].[Id], [p].[Name], [p].[Price], [p].[Stock]
FROM [Products] AS [p]
WHERE [p].[Price] >= @minPrice AND [p].[Price] <= @maxPrice AND [p].[Stock] > 0
ORDER BY [p].[Id]`,
      steps: [
        "<code>string? search, decimal? minPrice, …</code> : des paramètres nullables. Absents de l'URL, ils valent <code>null</code>.",
        "<code>IQueryable&lt;Product&gt; query = db.Products.AsNoTracking();</code> : on type explicitement en <code>IQueryable&lt;Product&gt;</code> pour pouvoir réaffecter <code>query</code> après chaque <code>Where</code>.",
        "<code>query.Where(p =&gt; p.Name.Contains(search))</code> : devient <code>LIKE</code>. « souris » trouve « Souris sans fil » car la collation SQL Server ignore la casse.",
        "<code>if (inStock == true)</code> : <code>inStock</code> est un <code>bool?</code>, on le compare à <code>true</code> pour gérer le cas <code>null</code>.",
        "<code>.ToListAsync()</code> : c'est seulement ici que la requête part. Les trois conditions de la seconde requête sont combinées par <code>AND</code> dans un seul <code>WHERE</code>. Le Casque audio (59,90) est exclu car son stock vaut 0."
      ]
    },
    {
      title: "Tri en liste blanche et [AsParameters]",
      code: `// Fichier : Program.cs (même début que l'exemple 1)
// GET /api/products?sort=-price&page=1&pageSize=3
app.MapGet("/api/products", async (OrderFlowDbContext db, [AsParameters] ProductQuery q) =>
{
    IQueryable<Product> query = db.Products.AsNoTracking();
    if (!string.IsNullOrWhiteSpace(q.Search))
        query = query.Where(p => p.Name.Contains(q.Search));

    // Liste blanche : seules ces valeurs sont acceptées
    query = q.Sort switch
    {
        "name"   => query.OrderBy(p => p.Name),
        "-name"  => query.OrderByDescending(p => p.Name),
        "price"  => query.OrderBy(p => p.Price).ThenBy(p => p.Id),
        "-price" => query.OrderByDescending(p => p.Price).ThenBy(p => p.Id),
        _        => query.OrderBy(p => p.Id)
    };

    int pageSize = Math.Clamp(q.PageSize ?? 10, 1, 50);
    int page = Math.Max(q.Page ?? 1, 1);
    return await query
        .Skip((page - 1) * pageSize).Take(pageSize)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price, p.Stock))
        .ToListAsync();
});

app.Run();

// Les propriétés sont lues dans la query string (?search=...&sort=...)
public record ProductQuery(string? Search, string? Sort, int? Page, int? PageSize);
public record ProductDto(int Id, string Name, decimal Price, int Stock);`,
      output: `> GET /api/products?sort=-price&pageSize=3
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":7,"name":"Station USB-C","price":119.00,"stock":5},
 {"id":12,"name":"Disque SSD 1 To","price":99.00,"stock":11},
 {"id":1,"name":"Clavier","price":89.90,"stock":15}]

(SQL envoyé)
SELECT [p].[Id], [p].[Name], [p].[Price], [p].[Stock]
FROM [Products] AS [p]
ORDER BY [p].[Price] DESC, [p].[Id]
OFFSET @p ROWS FETCH NEXT @p1 ROWS ONLY`,
      steps: [
        "<code>[AsParameters] ProductQuery q</code> : ASP.NET Core remplit chaque propriété du record depuis la query string (<code>?sort=-price</code> remplit <code>Sort</code>).",
        "<code>q.Sort switch { … }</code> : une expression switch sur les seules valeurs autorisées. Une valeur inconnue (<code>?sort=DROP</code>) tombe dans <code>_</code> : tri par Id.",
        "<code>.ThenBy(p =&gt; p.Id)</code> : départage les produits au même prix, pour un ordre identique à chaque appel.",
        "<code>q.PageSize ?? 10</code> : l'opérateur <code>??</code> donne 10 si le paramètre est absent.",
        "<code>ORDER BY [p].[Price] DESC, [p].[Id]</code> : dans les logs, on voit que le tri et la pagination sont faits par SQL Server, pas en mémoire."
      ],
      explain: "Le même record ProductQuery pourra servir dans un service ou dans un test : c'est plus propre que six paramètres dans la lambda."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Paginer les clients",
      prompt: `<p>Écris <code>GET /api/customers?page=1&amp;pageSize=10</code> qui renvoie un <code>PagedResult&lt;CustomerDto&gt;</code> trié par nom puis par Id. Borne <code>pageSize</code> entre 1 et 50.</p>`,
      hint: `<p>Copie l'exemple 1 en remplaçant <code>Products</code> par <code>Customers</code> et <code>OrderBy(p =&gt; p.Id)</code> par <code>OrderBy(c =&gt; c.Name).ThenBy(c =&gt; c.Id)</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
var app = builder.Build();

app.MapGet("/api/customers", async (OrderFlowDbContext db, int page = 1, int pageSize = 10) =>
{
    page = Math.Max(page, 1);
    pageSize = Math.Clamp(pageSize, 1, 50);

    var query = db.Customers.AsNoTracking().OrderBy(c => c.Name).ThenBy(c => c.Id);
    int total = await query.CountAsync();
    var items = await query
        .Skip((page - 1) * pageSize).Take(pageSize)
        .Select(c => new CustomerDto(c.Id, c.Name, c.Email))
        .ToListAsync();

    return Results.Ok(new PagedResult<CustomerDto>(items, page, pageSize, total));
});

app.Run();

public record CustomerDto(int Id, string Name, string Email);
public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}`
    },
    {
      level: "moyen",
      title: "Filtrer les commandes",
      prompt: `<p>Écris <code>GET /api/orders</code> avec trois filtres optionnels : <code>status</code> (de type <code>OrderStatus?</code>, par exemple <code>?status=Paid</code>), <code>from</code> et <code>to</code> (de type <code>DateTime?</code>) sur <code>OrderDate</code>. Renvoie <code>Id</code>, <code>CustomerId</code>, <code>OrderDate</code> et <code>Status</code> (en texte), triés par date décroissante.</p>`,
      hint: `<p>Une enum se lit directement depuis la query string par son nom. Pour le DTO, <code>o.Status.ToString()</code> est traduit par EF Core car la colonne est déjà stockée en texte.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
var app = builder.Build();

app.MapGet("/api/orders", async (OrderFlowDbContext db, OrderStatus? status, DateTime? from, DateTime? to) =>
{
    IQueryable<Order> query = db.Orders.AsNoTracking();
    if (status is not null)
        query = query.Where(o => o.Status == status);
    if (from is not null)
        query = query.Where(o => o.OrderDate >= from);
    if (to is not null)
        query = query.Where(o => o.OrderDate <= to);

    return await query
        .OrderByDescending(o => o.OrderDate).ThenBy(o => o.Id)
        .Select(o => new OrderSummaryDto(o.Id, o.CustomerId, o.OrderDate, o.Status.ToString()))
        .ToListAsync();
});

app.Run();

public record OrderSummaryDto(int Id, int CustomerId, DateTime OrderDate, string Status);`
    },
    {
      level: "difficile",
      title: "Une méthode d'extension de pagination",
      prompt: `<p>Tu vas paginer produits, clients et commandes : factorise ! Écris une méthode d'extension générique <code>ToPagedResultAsync&lt;T&gt;(this IQueryable&lt;T&gt; query, int page, int pageSize)</code> qui borne les paramètres, compte, pagine et renvoie un <code>PagedResult&lt;T&gt;</code>. Utilise-la dans <code>GET /api/products</code>.</p>`,
      hint: `<p>Mets-la dans une <code>static class QueryableExtensions</code>. La requête reçue doit être déjà triée et projetée : la méthode ne fait que <code>CountAsync</code>, <code>Skip</code>, <code>Take</code> et <code>ToListAsync</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
var app = builder.Build();

app.MapGet("/api/products", async (OrderFlowDbContext db, int page = 1, int pageSize = 10) =>
    await db.Products.AsNoTracking()
        .OrderBy(p => p.Id)
        .Select(p => new ProductDto(p.Id, p.Name, p.Price, p.Stock))
        .ToPagedResultAsync(page, pageSize));

app.Run();

public record ProductDto(int Id, string Name, decimal Price, int Stock);
public record PagedResult<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public static class QueryableExtensions
{
    // La requête doit déjà être triée (OrderBy) avant l'appel
    public static async Task<PagedResult<T>> ToPagedResultAsync<T>(
        this IQueryable<T> query, int page, int pageSize)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);
        int total = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<T>(items, page, pageSize, total);
    }
}`
    }
  ],
  quiz: [
    {
      q: `Pour la page 3 avec <code>pageSize = 20</code>, quel appel est correct ?`,
      options: ["<code>Skip(60).Take(20)</code>", "<code>Skip(40).Take(20)</code>", "<code>Skip(3).Take(20)</code>"],
      answer: 1,
      why: `On saute les pages 1 et 2, soit (3 - 1) × 20 = 40 éléments, puis on en prend 20. <code>Skip(60)</code> donnerait la page 4.`
    },
    {
      q: `Où placer <code>CountAsync()</code> pour obtenir le nombre total d'éléments ?`,
      options: ["Après <code>Take</code>", "Après <code>ToListAsync()</code>", "Sur la requête filtrée, avant <code>Skip</code> et <code>Take</code>"],
      answer: 2,
      why: `Le total doit tenir compte des filtres mais pas de la pagination. Après <code>Take</code>, on obtiendrait au plus <code>pageSize</code>.`
    },
    {
      q: `Dans l'exemple 2, quand la requête SQL est-elle réellement envoyée ?`,
      options: ["À chaque <code>Where</code>", "Au <code>ToListAsync()</code>", "Dès <code>db.Products</code>"],
      answer: 1,
      why: `Un <code>IQueryable</code> se construit pas à pas sans rien exécuter. L'appel final (<code>ToListAsync</code>, <code>CountAsync</code>…) traduit le tout en une seule requête SQL.`
    },
    {
      q: `Pourquoi trier avec un <code>switch</code> sur des valeurs connues plutôt que d'utiliser directement le texte de <code>?sort=</code> ?`,
      options: ["Pour n'accepter que des tris prévus, indexés et sans erreur", "Parce que LINQ ne sait pas trier par prix", "Parce que les query strings sont limitées à 5 caractères"],
      answer: 0,
      why: `La liste blanche garantit qu'on ne trie que sur des colonnes prévues, avec un comportement par défaut pour toute valeur inattendue. Rien de ce que tape le client ne finit tel quel dans la requête.`
    }
  ],
  project: `<p><strong>OrderFlow : une liste de commandes exploitable.</strong> Transforme <code>GET /api/orders</code> en endpoint paginé avec un record <code>OrderQuery(int? CustomerId, OrderStatus? Status, string? Sort, int? Page, int? PageSize)</code> passé en <code>[AsParameters]</code>. Tris acceptés : <code>date</code>, <code>-date</code> (par défaut) et <code>-total</code>. Renvoie un <code>PagedResult&lt;OrderSummaryDto&gt;</code> avec le nom du client et le total de chaque commande calculé par SQL (<code>o.Lines.Sum(l =&gt; l.Quantity * l.UnitPrice)</code>). Active le log SQL et vérifie qu'il n'y a que deux requêtes : le COUNT et la page.</p>`,
  resources: [
    { label: "Pagination avec EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/querying/pagination" },
    { label: "Liaison de paramètres dans les API minimales (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/minimal-apis/parameter-binding" }
  ]
});

// =====================================================================
// 4. PATCH et envoi de fichiers
// =====================================================================
window.COURSE.push({
  key: "api-patch-files",
  title: "Mises à jour partielles (PATCH) et envoi de fichiers",
  summary: "Tu sauras modifier seulement quelques champs d'une ressource avec PATCH, recevoir un fichier envoyé par le front en toute sécurité, puis le renvoyer en téléchargement.",
  objectives: [
    "Choisir entre PUT et PATCH",
    "Écrire un PATCH avec un DTO à champs optionnels",
    "Recevoir un fichier avec IFormFile en appliquant les règles de sécurité",
    "Renvoyer un fichier avec Results.File"
  ],
  analogy: `<p>Tu changes d'adresse. Ta banque peut te faire remplir <strong>tout un nouveau dossier</strong> (nom, date de naissance, adresse, téléphone…) : c'est un <strong>PUT</strong>. Ou bien te donner un petit formulaire « changement d'adresse » où tu n'écris que ce qui change : c'est un <strong>PATCH</strong>.</p>
<p>Pour les fichiers, pense à un <strong>dépôt de colis</strong> au bureau de poste. L'employé pèse le colis (taille), vérifie qu'il ne contient rien d'interdit (type), et colle sa propre étiquette avec un numéro de suivi (un nom généré) : il ne se fie jamais à ce que tu as griffonné sur le carton.</p>`,
  lesson: `<h3>PUT ou PATCH ?</h3>
<p>Tu as écrit un PUT dans la leçon CRUD : le client envoie <strong>toute</strong> la ressource et elle est remplacée. Pour changer seulement le prix d'un produit, le front devrait d'abord lire le produit, puis tout renvoyer. Et si deux écrans modifient deux champs différents en même temps, le second écrase le premier. <strong>PATCH</strong> règle ça : le client n'envoie que les champs à modifier.</p>
<div class="compare"><div><h4>PUT</h4><p>Remplace tout. Le corps contient tous les champs. Un champ oublié est écrasé par sa valeur par défaut. Idéal pour un formulaire d'édition complet.</p></div><div><h4>PATCH</h4><p>Modifie une partie. Le corps ne contient que ce qui change : <code>{"price": 24.90}</code>. Idéal pour une action ciblée (changer un prix, un statut, un stock).</p></div></div>

<h3>PATCH avec un DTO à champs optionnels</h3>
<p>La méthode la plus simple : un DTO dont <strong>toutes les propriétés sont nullables</strong>. Quand le client n'envoie pas un champ, il vaut <code>null</code> dans le DTO, et on n'y touche pas. Ce format, « JSON partiel où l'absence veut dire ne pas changer », s'appelle <em>JSON Merge Patch</em>. Côté Angular, c'est naturel : <code>http.patch(url, { price: 24.9 })</code>.</p>
<p>La validation marche toujours : <code>[Range(0, 100000)] int? Stock</code> refuse <code>-3</code> mais accepte l'absence du champ. Et grâce au suivi des modifications d'EF Core, l'UPDATE ne contient que les colonnes réellement modifiées.</p>
<div class="tip">Limite de cette méthode : on ne peut pas distinguer « champ absent » de « mettre ce champ à null ». Pour les rares champs qu'on doit pouvoir vider, ajoute un endpoint dédié (<code>DELETE /api/products/5/image</code>). Il existe aussi le format <em>JSON Patch</em> (une liste d'opérations <code>replace</code>, <code>remove</code>…), géré en .NET 10 par le package <code>Microsoft.AspNetCore.JsonPatch.SystemTextJson</code>, mais il est plus complexe à valider.</div>

<h3>Recevoir un fichier : IFormFile</h3>
<p>Un navigateur envoie un fichier dans une requête <code>multipart/form-data</code> : le corps est découpé en parties, une par champ ou par fichier. Côté Angular, tu construis un <code>FormData</code> et tu fais <code>formData.append('file', fichier)</code>. Côté API, il suffit d'un paramètre <code>IFormFile file</code>.</p>
<table>
<tr><th>Membre de IFormFile</th><th>Contenu</th><th>Fiable ?</th></tr>
<tr><td><code>FileName</code></td><td>Le nom envoyé par le client, « clavier.png »</td><td>Non : peut contenir <code>../../</code></td></tr>
<tr><td><code>ContentType</code></td><td>Le type annoncé, « image/png »</td><td>Non : choisi par le client</td></tr>
<tr><td><code>Length</code></td><td>La taille en octets</td><td>Oui</td></tr>
<tr><td><code>CopyToAsync(stream)</code></td><td>Copie le contenu vers un flux (un fichier)</td><td></td></tr>
<tr><td><code>OpenReadStream()</code></td><td>Lit le contenu, par exemple ses premiers octets</td><td></td></tr>
</table>
<p>Les Minimal APIs protègent par défaut les formulaires contre l'attaque CSRF avec un jeton <em>antiforgery</em>. Ce jeton concerne les sites qui s'authentifient par cookie. Une API appelée par Angular avec un jeton dans l'en-tête <code>Authorization</code> le désactive sur l'endpoint avec <code>.DisableAntiforgery()</code>.</p>

<h3>Les règles de sécurité</h3>
<p>Un fichier envoyé est une donnée <strong>non fiable</strong>, au même titre qu'un champ de formulaire. Quatre règles :</p>
<div class="flow"><span>Taille limitée</span><span>Extension en liste blanche</span><span>Nom généré (Guid)</span><span>Stockage hors wwwroot</span></div>
<p><strong>Limite la taille</strong> : Kestrel refuse déjà les corps de plus de 30 Mo environ, mais vérifie <code>file.Length</code> pour ta propre limite. <strong>Filtre l'extension</strong> sur une liste blanche (<code>.jpg</code>, <code>.png</code>), et pour aller plus loin vérifie les premiers octets du contenu (exercice moyen). <strong>Ne réutilise jamais le nom envoyé</strong> : génère un nom avec <code>Guid.NewGuid()</code> et garde l'extension contrôlée. <strong>Range les fichiers hors de <code>wwwroot</code></strong>, pour qu'aucun fichier envoyé ne soit servi directement.</p>
<p>En base, on ne stocke pas le fichier, seulement son nom : ici une colonne <code>ImageFileName</code> (texte, nullable) ajoutée à <code>Products</code> par une migration.</p>

<h3>Renvoyer un fichier</h3>
<p><code>Results.File(chemin, typeMime, nomDeTéléchargement)</code> envoie le fichier <strong>en flux</strong> : il n'est jamais chargé entièrement en mémoire. Avec un nom de téléchargement, la réponse contient un en-tête <code>Content-Disposition: attachment</code> et le navigateur propose d'enregistrer le fichier sous ce nom. Il existe aussi une surcharge qui prend un tableau d'octets, pratique pour un export CSV généré à la volée.</p>
<div class="note">En production, on ne garde pas les fichiers sur le disque du serveur : s'il y a plusieurs instances de l'API, chacune aurait son propre disque. On utilise un stockage objet (Azure Blob Storage, Amazon S3) et la base ne garde que la clé du fichier. Pour les très gros fichiers, le front envoie directement au stockage avec une URL signée, sans passer par l'API.</div>`,
  examples: [
    {
      title: "PATCH avec un DTO nullable",
      code: `// Fichier : Program.cs
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
builder.Services.AddValidation();
builder.Services.AddProblemDetails();
var app = builder.Build();

// PATCH /api/products/2  corps : {"price": 24.90}
app.MapPatch("/api/products/{id:int}", async (int id, PatchProductRequest patch, OrderFlowDbContext db) =>
{
    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    // null = "le client n'a pas envoyé ce champ" : on n'y touche pas
    if (patch.Name is not null) product.Name = patch.Name;
    if (patch.Price is not null) product.Price = patch.Price.Value;
    if (patch.Stock is not null) product.Stock = patch.Stock.Value;

    await db.SaveChangesAsync();   // UPDATE des seules colonnes modifiées
    return Results.Ok(new ProductDto(product.Id, product.Name, product.Price, product.Stock));
});

app.Run();

// Tous les champs sont optionnels (nullables)
public record PatchProductRequest(
    [StringLength(100, MinimumLength = 1)] string? Name,
    [Range(0.01, 100000)] decimal? Price,
    [Range(0, 100000)] int? Stock);

public record ProductDto(int Id, string Name, decimal Price, int Stock);`,
      output: `> PATCH /api/products/2
{"price":24.90}
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":2,"name":"Souris sans fil","price":24.90,"stock":40}

> PATCH /api/products/2
{"stock":-3}
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1",
 "title":"One or more validation errors occurred.","status":400,
 "errors":{"Stock":["The field Stock must be between 0 and 100000."]},
 "traceId":"00-70a4426e1e4d54e9e45e9a49e91158bd-216eae986ffc9302-00"}

(SQL envoyé pour le premier PATCH)
UPDATE [Products] SET [Price] = @p0
OUTPUT 1
WHERE [Id] = @p1;`,
      steps: [
        "<code>app.MapPatch(…)</code> : comme <code>MapPut</code>, mais pour le verbe PATCH.",
        "<code>decimal? Price</code> : le JSON <code>{\"price\":24.90}</code> ne contient ni <code>name</code> ni <code>stock</code>, qui restent donc <code>null</code>.",
        "<code>if (patch.Price is not null) product.Price = patch.Price.Value;</code> : on n'applique que les champs reçus. <code>.Value</code> extrait le <code>decimal</code> du <code>decimal?</code>.",
        "<code>[Range(0, 100000)] int? Stock</code> : <code>-3</code> est refusé par la validation (400), alors qu'un champ absent passe sans problème.",
        "<code>UPDATE [Products] SET [Price] = @p0</code> : EF Core n'écrit que la colonne modifiée. Nom et stock ne sont pas touchés en base.",
        "<code>return Results.Ok(new ProductDto(…))</code> : on renvoie la ressource complète à jour, ce qui évite au front un GET supplémentaire."
      ]
    },
    {
      title: "Recevoir une image de produit",
      code: `// Fichier : Program.cs (même début que l'exemple 1)
string[] allowedExtensions = [".jpg", ".jpeg", ".png"];
const long maxSize = 2 * 1024 * 1024; // 2 Mo

app.MapPost("/api/products/{id:int}/image", async (int id, IFormFile file,
    OrderFlowDbContext db, IWebHostEnvironment env) =>
{
    var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (!allowedExtensions.Contains(extension))
        return Results.Problem(statusCode: 400, title: "Format refusé", detail: "Formats acceptés : jpg, png.");
    if (file.Length == 0 || file.Length > maxSize)
        return Results.Problem(statusCode: 400, title: "Taille refusée", detail: "Maximum 2 Mo.");

    var product = await db.Products.FindAsync(id);
    if (product is null) return Results.NotFound();

    // Nom généré par le serveur : jamais le nom envoyé par le client
    var fileName = $"{Guid.NewGuid()}{extension}";
    var folder = Path.Combine(env.ContentRootPath, "uploads");
    Directory.CreateDirectory(folder);
    await using (var stream = File.Create(Path.Combine(folder, fileName)))
        await file.CopyToAsync(stream);

    product.ImageFileName = fileName;
    await db.SaveChangesAsync();
    return Results.Ok(new { product.Id, product.ImageFileName, file.Length });
})
.DisableAntiforgery(); // API appelée sans cookie : pas de jeton antiforgery

app.Run();`,
      output: `> POST /api/products/1/image   (formulaire multipart, fichier clavier.png)
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"imageFileName":"b312df55-98eb-4bcb-a8fe-871a102d4123.png","length":44}

> POST /api/products/1/image   (fichier setup.exe)
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.1","title":"Format refusé",
 "status":400,"detail":"Formats acceptés : jpg, png.",
 "traceId":"00-4074096b4c8edc9e17d8374731ac5143-25e5ed8457e27040-00"}`,
      steps: [
        "<code>IFormFile file</code> : ASP.NET Core lit le corps <code>multipart/form-data</code> et remplit ce paramètre avec le champ nommé <code>file</code>. Pour tester : <code>curl -F \"file=@clavier.png\" http://localhost:5000/api/products/1/image</code>.",
        "<code>Path.GetExtension(file.FileName).ToLowerInvariant()</code> : on extrait l'extension et on la met en minuscules pour accepter aussi « .PNG ». Elle est comparée à la liste blanche.",
        "<code>var fileName = $\"{Guid.NewGuid()}{extension}\";</code> : le nom stocké est un identifiant unique généré par le serveur.",
        "<code>Path.Combine(env.ContentRootPath, \"uploads\")</code> : un dossier à la racine du projet, hors de <code>wwwroot</code>, donc jamais servi directement.",
        "<code>await file.CopyToAsync(stream)</code> : copie le contenu reçu dans le fichier créé. Le bloc <code>await using</code> ferme le fichier juste après.",
        "<code>.DisableAntiforgery()</code> : sans cette ligne, un endpoint avec <code>IFormFile</code> exige un jeton antiforgery, que notre API (sans cookie) ne fournit pas."
      ],
      explain: "Le nom généré change à chaque envoi : c'est voulu. Le nom d'origine pourrait être gardé dans une autre colonne, seulement pour l'affichage."
    },
    {
      title: "Télécharger l'image",
      code: `// Fichier : Program.cs (même début que l'exemple 1)
app.MapGet("/api/products/{id:int}/image", async (int id, OrderFlowDbContext db, IWebHostEnvironment env) =>
{
    var fileName = await db.Products
        .Where(p => p.Id == id)
        .Select(p => p.ImageFileName)
        .FirstOrDefaultAsync();
    if (fileName is null) return Results.NotFound();

    var path = Path.Combine(env.ContentRootPath, "uploads", fileName);
    if (!File.Exists(path)) return Results.NotFound();

    var contentType = Path.GetExtension(fileName) == ".png" ? "image/png" : "image/jpeg";
    // Results.File envoie le fichier en flux, sans le charger en mémoire
    return Results.File(path, contentType, fileDownloadName: $"produit-{id}{Path.GetExtension(fileName)}");
});

app.Run();`,
      output: `> GET /api/products/1/image
HTTP/1.1 200 OK
Content-Length: 44
Content-Type: image/png
Last-Modified: Sat, 07 Nov 2026 00:44:40 GMT
Content-Disposition: attachment; filename=produit-1.png; filename*=UTF-8''produit-1.png

(… les 44 octets de l'image …)

> GET /api/products/2/image
HTTP/1.1 404 Not Found`,
      steps: [
        "<code>.Select(p =&gt; p.ImageFileName).FirstOrDefaultAsync()</code> : on ne lit qu'une colonne. Si le produit n'existe pas <em>ou</em> n'a pas d'image, on obtient <code>null</code>, donc 404.",
        "<code>File.Exists(path)</code> : la base peut pointer vers un fichier supprimé du disque. On vérifie avant de répondre.",
        "<code>contentType</code> : on déduit le type MIME de l'extension que nous avons nous-mêmes contrôlée à l'envoi.",
        "<code>Results.File(path, contentType, fileDownloadName: …)</code> : envoie le fichier en flux et ajoute <code>Content-Disposition: attachment</code> avec un nom propre.",
        "<code>Last-Modified</code> : ASP.NET Core ajoute la date de modification du fichier, utile au cache du navigateur."
      ],
      explain: "Pour afficher l'image dans une balise img plutôt que la télécharger, enlève simplement fileDownloadName."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "PATCH d'un client",
      prompt: `<p>Écris <code>PATCH /api/customers/{id:int}</code> avec un DTO <code>PatchCustomerRequest(string? Name, string? Email)</code> validé (<code>[StringLength(100, MinimumLength = 1)]</code> et <code>[EmailAddress]</code>). Applique seulement les champs reçus, renvoie 404 si le client n'existe pas et 204 sinon.</p>`,
      hint: `<p>Même structure que l'exemple 1 : <code>FindAsync</code>, des <code>if (… is not null)</code>, puis <code>SaveChangesAsync</code>.</p>`,
      solution: `using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
builder.Services.AddValidation();
builder.Services.AddProblemDetails();
var app = builder.Build();

app.MapPatch("/api/customers/{id:int}", async (int id, PatchCustomerRequest patch, OrderFlowDbContext db) =>
{
    var customer = await db.Customers.FindAsync(id);
    if (customer is null) return Results.NotFound();

    if (patch.Name is not null) customer.Name = patch.Name;
    if (patch.Email is not null) customer.Email = patch.Email;

    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

public record PatchCustomerRequest(
    [StringLength(100, MinimumLength = 1)] string? Name,
    [EmailAddress] string? Email);`
    },
    {
      level: "moyen",
      title: "Vérifier le vrai contenu du fichier",
      prompt: `<p>Un fichier <code>virus.exe</code> renommé en <code>photo.png</code> passe le contrôle d'extension. Écris une fonction <code>async Task&lt;bool&gt; IsPngOrJpegAsync(IFormFile file)</code> qui lit les premiers octets : un PNG commence par <code>89 50 4E 47</code>, un JPEG par <code>FF D8 FF</code>. Utilise-la dans l'endpoint d'envoi d'image.</p>`,
      hint: `<p><code>await using var stream = file.OpenReadStream();</code> puis <code>var header = new byte[4];</code> et <code>await stream.ReadAtLeastAsync(header, 4, throwOnEndOfStream: false)</code> qui renvoie le nombre d'octets lus.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapPost("/api/upload-check", async (IFormFile file) =>
    await IsPngOrJpegAsync(file)
        ? Results.Ok(new { file.FileName, valid = true })
        : Results.Problem(statusCode: 400, title: "Ce fichier n'est pas une image PNG ou JPEG"))
   .DisableAntiforgery();

app.Run();

// Vérifie la "signature" (magic number) au début du fichier
static async Task<bool> IsPngOrJpegAsync(IFormFile file)
{
    await using var stream = file.OpenReadStream();
    var header = new byte[4];
    int read = await stream.ReadAtLeastAsync(header, 4, throwOnEndOfStream: false);

    bool isPng = read == 4 && header[0] == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;
    bool isJpeg = read >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF;
    return isPng || isJpeg;
}`
    },
    {
      level: "difficile",
      title: "Exporter les produits en CSV",
      prompt: `<p>Écris <code>GET /api/products/export</code> qui renvoie un fichier <code>produits.csv</code> (type <code>text/csv</code>) avec une ligne d'en-tête <code>Id;Name;Price;Stock</code> puis une ligne par produit. Les prix doivent s'écrire avec un point (<code>89.90</code>) quelle que soit la culture du serveur.</p>`,
      hint: `<p>Construis le texte avec un <code>StringBuilder</code>, formate le prix avec <code>p.Price.ToString(CultureInfo.InvariantCulture)</code>, puis <code>Results.File(Encoding.UTF8.GetBytes(csv), \"text/csv\", \"produits.csv\")</code>.</p>`,
      solution: `using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
var app = builder.Build();

app.MapGet("/api/products/export", async (OrderFlowDbContext db) =>
{
    var products = await db.Products.AsNoTracking().OrderBy(p => p.Id).ToListAsync();

    var csv = new StringBuilder();
    csv.AppendLine("Id;Name;Price;Stock");
    foreach (var p in products)
        csv.AppendLine($"{p.Id};{p.Name};{p.Price.ToString(CultureInfo.InvariantCulture)};{p.Stock}");

    return Results.File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv", "produits.csv");
});

app.Run();`
    }
  ],
  quiz: [
    {
      q: `Le front veut seulement changer le stock d'un produit. Quel verbe et quel corps ?`,
      options: ["<code>PATCH</code> avec <code>{\"stock\": 12}</code>", "<code>PUT</code> avec <code>{\"stock\": 12}</code>", "<code>POST</code> avec tout le produit"],
      answer: 0,
      why: `PATCH modifie une partie de la ressource. Un PUT avec seulement le stock remplacerait le nom et le prix par des valeurs vides ou par défaut.`
    },
    {
      q: `Dans un DTO de PATCH à champs nullables, que signifie <code>Price == null</code> ?`,
      options: ["Mettre le prix à 0", "Le client n'a pas envoyé le prix : ne pas le modifier", "Supprimer le produit"],
      answer: 1,
      why: `Avec cette approche (JSON Merge Patch), l'absence d'un champ veut dire « ne pas toucher ». C'est aussi sa limite : on ne peut pas exprimer « mettre à null ».`
    },
    {
      q: `Quelle information d'un <code>IFormFile</code> peut-on croire sans vérification ?`,
      options: ["<code>FileName</code>", "<code>ContentType</code>", "Aucune des deux : elles sont fournies par le client"],
      answer: 2,
      why: `Le nom et le type annoncé sont écrits par le client et peuvent être faux ou dangereux (<code>../../web.config</code>). On contrôle l'extension, la taille, voire les premiers octets, et on génère notre propre nom.`
    },
    {
      q: `Pourquoi appeler <code>.DisableAntiforgery()</code> sur l'endpoint d'envoi d'image ?`,
      options: ["Pour accepter des fichiers plus gros", "Parce que la protection antiforgery vise les sites authentifiés par cookie, pas notre API", "Pour désactiver la validation"],
      answer: 1,
      why: `Un endpoint avec <code>IFormFile</code> exige par défaut un jeton antiforgery (protection CSRF). Une API appelée avec un jeton dans l'en-tête Authorization n'est pas exposée à cette attaque et désactive donc cette exigence.`
    }
  ],
  project: `<p><strong>OrderFlow : faire avancer une commande.</strong> Écris <code>PATCH /api/orders/{id}/status</code> avec un corps <code>{"status": "Paid"}</code>. Seules ces transitions sont permises : Pending vers Paid ou Cancelled, Paid vers Shipped. Toute autre transition renvoie <strong>409</strong> avec un ProblemDetails qui explique pourquoi (« Une commande Shipped ne peut plus être annulée »). Bonus : quand une commande passe à Cancelled, remets les quantités de ses lignes dans le stock des produits, dans le même <code>SaveChangesAsync</code>. Ajoute aussi l'envoi et le téléchargement de l'image produit vus dans les exemples.</p>`,
  resources: [
    { label: "Charger des fichiers dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/mvc/models/file-uploads" },
    { label: "Créer des réponses dans les API minimales (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/minimal-apis/responses" }
  ]
});

// =====================================================================
// 5. Documenter l'API avec OpenAPI
// =====================================================================
window.COURSE.push({
  key: "api-openapi",
  title: "Documenter l'API avec OpenAPI",
  summary: "Tu sauras générer la description OpenAPI de ton API, l'enrichir (résumés, tags, réponses, commentaires XML) et l'explorer avec Scalar ou Swagger UI.",
  objectives: [
    "Comprendre ce qu'est un document OpenAPI et à quoi il sert",
    "Activer OpenAPI avec AddOpenApi et MapOpenApi",
    "Décrire les réponses avec TypedResults, WithSummary, WithTags et ProducesProblem",
    "Afficher une documentation interactive en développement"
  ],
  analogy: `<p>Un restaurant affiche sa <strong>carte</strong> : le nom de chaque plat, ses ingrédients, son prix, les allergènes. Le client sait ce qu'il peut commander sans aller en cuisine. Et un livreur peut reprendre cette carte pour l'afficher dans son application.</p>
<p>Le document <strong>OpenAPI</strong> est la carte de ton API : chaque route, ce qu'elle attend, ce qu'elle renvoie. Les humains la lisent dans une jolie interface, et les outils s'en servent pour générer automatiquement le code client Angular.</p>`,
  lesson: `<h3>OpenAPI, c'est quoi ?</h3>
<p><strong>OpenAPI</strong> est un format standard (un fichier JSON ou YAML) qui décrit une API HTTP : ses routes, leurs paramètres, les corps attendus, les réponses possibles et la forme des objets échangés (les <em>schémas</em>). Tu entendras aussi le nom <strong>Swagger</strong> : c'est l'ancien nom du format, resté attaché à certains outils.</p>
<p>Ce document sert à trois choses : afficher une <strong>documentation interactive</strong> où l'on peut tester chaque endpoint, <strong>générer un client</strong> typé (des services Angular et des interfaces TypeScript, avec des outils comme openapi-generator ou NSwag), et partager un <strong>contrat</strong> clair avec les autres équipes.</p>
<div class="flow"><span>Endpoints + DTOs</span><span>AddOpenApi()</span><span>/openapi/v1.json</span><span>Scalar, Swagger UI, client Angular</span></div>

<h3>Deux lignes pour l'activer</h3>
<p>Depuis .NET 9, ASP.NET Core génère le document lui-même grâce au package <code>Microsoft.AspNetCore.OpenApi</code> (déjà présent dans le modèle <code>dotnet new webapi</code>). <code>builder.Services.AddOpenApi()</code> enregistre le générateur, <code>app.MapOpenApi()</code> publie le document à l'adresse <code>/openapi/v1.json</code>. Le document est construit en lisant tes endpoints au démarrage : tu n'écris aucun JSON à la main.</p>

<h3>Ce qu'ASP.NET Core devine tout seul</h3>
<p>Le générateur lit les routes, les types des paramètres (<code>{id:int}</code> devient un entier obligatoire) et la forme des DTOs reçus ou renvoyés. Pour les <strong>réponses</strong>, tout dépend de ce que retourne la lambda :</p>
<div class="compare"><div><h4>Results.Ok(…) / Results.NotFound()</h4><p>Le type de retour est <code>IResult</code> : le générateur ne sait pas ce qu'il y a dedans. La doc annonce juste « 200 », sans schéma.</p></div><div><h4>TypedResults + Results&lt;Ok&lt;T&gt;, NotFound&gt;</h4><p>Le type de retour liste les réponses possibles. La doc annonce « 200 avec un ProductDto » <em>et</em> « 404 ». C'est aussi plus facile à tester.</p></div></div>
<p>Tu remarqueras dans les schémas des types comme <code>["integer", "string"]</code> : les APIs web acceptent par défaut les nombres écrits entre guillemets (<code>"15"</code>), et la doc le dit honnêtement. Autre détail : un <code>decimal</code> est annoncé au format <code>double</code>.</p>

<h3>Enrichir la documentation</h3>
<p>Un document généré sans effort liste les routes, mais il est pauvre. Des méthodes d'extension permettent de le compléter, endpoint par endpoint ou sur tout un groupe :</p>
<table>
<tr><th>Méthode</th><th>Effet dans le document</th></tr>
<tr><td><code>WithTags("Produits")</code></td><td>Range les endpoints par section dans l'interface</td></tr>
<tr><td><code>WithSummary("…")</code></td><td>Résumé d'une ligne affiché à côté de la route</td></tr>
<tr><td><code>WithDescription("…")</code></td><td>Texte détaillé</td></tr>
<tr><td><code>WithName("GetProductById")</code></td><td><code>operationId</code> : nom de la méthode dans le client généré</td></tr>
<tr><td><code>Produces(204)</code>, <code>ProducesProblem(409)</code></td><td>Déclare une réponse que le code de retour ne montre pas</td></tr>
</table>
<p>Tu peux aussi écrire des <strong>commentaires XML</strong> (<code>/// &lt;summary&gt;</code>) sur tes DTOs. En .NET 10, ils sont repris dans le document dès que tu ajoutes <code>&lt;GenerateDocumentationFile&gt;true&lt;/GenerateDocumentationFile&gt;</code> au fichier <code>.csproj</code>. Enfin, un <strong>transformer de document</strong> modifie le document juste avant l'envoi, par exemple pour changer le titre (qui vaut par défaut le nom du projet).</p>
<div class="tip">Dans la doc, chaque endpoint doit annoncer ses vraies réponses d'erreur. Si ton code renvoie un 409 via <code>Results.Problem</code>, ajoute <code>.ProducesProblem(StatusCodes.Status409Conflict)</code> : sinon le client Angular généré ne saura pas que ce cas existe.</div>

<h3>Une interface pour explorer et tester</h3>
<p>Le JSON brut n'est pas fait pour être lu. Deux interfaces web le mettent en forme et permettent d'envoyer de vraies requêtes depuis le navigateur. <strong>Scalar</strong> (package <code>Scalar.AspNetCore</code>, <code>app.MapScalarApiReference()</code>, adresse <code>/scalar</code>) est moderne et génère des exemples d'appel dans plusieurs langages. <strong>Swagger UI</strong> (package <code>Swashbuckle.AspNetCore.SwaggerUI</code>, <code>app.UseSwaggerUI(…)</code>, adresse <code>/swagger</code>) est l'interface historique, que tu croiseras dans beaucoup de projets existants. Les deux lisent le même <code>/openapi/v1.json</code>.</p>
<p>On les active seulement en développement, dans un <code>if (app.Environment.IsDevelopment())</code>. En production, une documentation publique révèle toutes tes routes à n'importe qui.</p>
<div class="note">Dans une équipe, le document OpenAPI devient un contrat versionné : on peut le générer à la compilation, le comparer d'un commit à l'autre pour détecter un changement cassant, et regénérer le client Angular dans la CI. Garde des <code>operationId</code> stables (<code>WithName</code>) : ce sont les noms des méthodes du client généré.</div>`,
  examples: [
    {
      title: "Activer OpenAPI et lire le document",
      code: `// Fichier : Program.cs
// dotnet add package Microsoft.AspNetCore.OpenApi   (déjà présent avec dotnet new webapi)
using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();   // 1. génère la description de l'API

var app = builder.Build();
app.MapOpenApi();                // 2. l'expose sur /openapi/v1.json

// Results<Ok<ProductDto>, NotFound> annonce les DEUX réponses possibles
app.MapGet("/api/products/{id:int}", Results<Ok<ProductDto>, NotFound> (int id) =>
    id == 1
        ? TypedResults.Ok(new ProductDto(1, "Clavier", 89.90m, 15))
        : TypedResults.NotFound());

app.Run();

public record ProductDto(int Id, string Name, decimal Price, int Stock);`,
      output: `> GET /openapi/v1.json
HTTP/1.1 200 OK
Content-Type: application/json;charset=utf-8

(extrait : le début du document, jusqu'à la fin de "paths")
{
  "openapi": "3.1.1",
  "info": {
    "title": "OrderFlow.Api | v1",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "http://localhost:5000/"
    }
  ],
  "paths": {
    "/api/products/{id}": {
      "get": {
        "tags": [
          "OrderFlow.Api"
        ],
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "schema": {
              "pattern": "^-?(?:0|[1-9]\\\\d*)$",
              "type": "integer",
              "format": "int32"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "OK",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ProductDto"
                }
              }
            }
          },
          "404": {
            "description": "Not Found"
          }
        }
      }
    }
  },`,
      steps: [
        "<code>builder.Services.AddOpenApi();</code> : enregistre le générateur. Par défaut, il produit un document nommé <code>v1</code>.",
        "<code>app.MapOpenApi();</code> : publie le document sur <code>/openapi/v1.json</code>.",
        "<code>Results&lt;Ok&lt;ProductDto&gt;, NotFound&gt; (int id) =&gt; …</code> : on annonce le type de retour de la lambda. Il liste les deux réponses possibles.",
        "<code>TypedResults.Ok(…)</code> : comme <code>Results.Ok</code>, mais avec un type précis (<code>Ok&lt;ProductDto&gt;</code>) au lieu de <code>IResult</code>.",
        "<code>\"responses\"</code> : le document annonce un 200 dont le corps suit le schéma <code>ProductDto</code> (décrit plus bas dans <code>components</code>), et un 404.",
        "<code>\"title\": \"OrderFlow.Api | v1\"</code> et le tag <code>OrderFlow.Api</code> : par défaut, le titre et le tag viennent du nom du projet. On les change dans l'exemple suivant."
      ]
    },
    {
      title: "Résumés, tags, réponses et titre",
      code: `// Fichier : Program.cs
using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi(options =>
{
    // Transformer : retouche le document avant de l'envoyer
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "OrderFlow API";
        document.Info.Description = "Produits, clients et commandes d'OrderFlow.";
        return Task.CompletedTask;
    });
});
var app = builder.Build();
app.MapOpenApi();

var products = app.MapGroup("/api/products").WithTags("Produits");

products.MapGet("/{id:int}", Results<Ok<ProductDto>, NotFound> (int id) =>
        id == 1 ? TypedResults.Ok(new ProductDto(1, "Clavier", 89.90m, 15)) : TypedResults.NotFound())
    .WithName("GetProductById")
    .WithSummary("Lire un produit")
    .WithDescription("Renvoie le produit demandé, ou 404 s'il n'existe pas.");

products.MapDelete("/{id:int}", (int id) =>
        id == 1 ? Results.NoContent() : Results.Problem(statusCode: 409, title: "Produit déjà commandé"))
    .WithSummary("Supprimer un produit")
    .Produces(StatusCodes.Status204NoContent)
    .ProducesProblem(StatusCodes.Status409Conflict);

app.Run();

public record ProductDto(int Id, string Name, decimal Price, int Stock);`,
      output: `> GET /openapi/v1.json
HTTP/1.1 200 OK
Content-Type: application/json;charset=utf-8

(extrait : "info" et la route DELETE)
  "info": {
    "title": "OrderFlow API",
    "description": "Produits, clients et commandes d'OrderFlow.",
    "version": "1.0.0"
  },
  …
      "delete": {
        "tags": [
          "Produits"
        ],
        "summary": "Supprimer un produit",
        "parameters": [ … ],
        "responses": {
          "204": {
            "description": "No Content"
          },
          "409": {
            "description": "Conflict",
            "content": {
              "application/problem+json": {
                "schema": {
                  "$ref": "#/components/schemas/ProblemDetails"
                }
              }
            }
          }
        }
      }

(et pour la route GET : "tags": ["Produits"], "summary": "Lire un produit",
 "description": "Renvoie le produit demandé, ou 404 s'il n'existe pas.",
 "operationId": "GetProductById")`,
      steps: [
        "<code>options.AddDocumentTransformer(…)</code> : une fonction appelée à chaque génération du document. On y remplace le titre par défaut et on ajoute une description.",
        "<code>app.MapGroup(\"/api/products\").WithTags(\"Produits\")</code> : le tag s'applique à tous les endpoints du groupe. L'interface les affichera dans une section « Produits ».",
        "<code>.WithName(\"GetProductById\")</code> : devient l'<code>operationId</code>, le nom de la méthode dans un client généré.",
        "<code>.WithSummary(…)</code> et <code>.WithDescription(…)</code> : le résumé court et le texte détaillé de l'opération.",
        "<code>.Produces(204)</code> et <code>.ProducesProblem(409)</code> : cet endpoint renvoie un <code>IResult</code> non typé, on déclare donc ses réponses à la main. Le 409 est décrit avec le schéma standard <code>ProblemDetails</code>."
      ]
    },
    {
      title: "Scalar, Swagger UI et commentaires XML",
      code: `// Fichier : OrderFlow.Api.csproj (dans le PropertyGroup)
//   <GenerateDocumentationFile>true</GenerateDocumentationFile>
// dotnet add package Scalar.AspNetCore
// dotnet add package Swashbuckle.AspNetCore.SwaggerUI   (au choix)

// Fichier : Program.cs
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
var app = builder.Build();

if (app.Environment.IsDevelopment())   // la doc interactive : seulement en dev
{
    app.MapOpenApi();                  // /openapi/v1.json
    app.MapScalarApiReference();       // interface Scalar sur /scalar
    app.UseSwaggerUI(options =>        // ou Swagger UI sur /swagger
        options.SwaggerEndpoint("/openapi/v1.json", "OrderFlow v1"));
}

app.MapGet("/api/products/{id:int}", (int id) => new ProductDto(id, "Clavier", 89.90m, 15));

app.Run();

/// <summary>Un produit du catalogue.</summary>
/// <param name="Id">Identifiant unique.</param>
/// <param name="Name">Nom affiché dans la boutique.</param>
/// <param name="Price">Prix TTC en euros.</param>
/// <param name="Stock">Quantité disponible.</param>
public record ProductDto(int Id, string Name, decimal Price, int Stock);`,
      output: `> GET /scalar/
HTTP/1.1 200 OK            (la page de Scalar)

> GET /swagger/index.html
HTTP/1.1 200 OK            (la page de Swagger UI)
Content-Type: text/html;charset=utf-8

> GET /openapi/v1.json
(extrait : le schéma ProductDto)
      "ProductDto": {
        "required": [ "id", "name", "price", "stock" ],
        "type": "object",
        "properties": {
          "id": {
            "pattern": "^-?(?:0|[1-9]\\\\d*)$",
            "type": [ "integer", "string" ],
            "description": "Identifiant unique.",
            "format": "int32"
          },
          "name": {
            "type": "string",
            "description": "Nom affiché dans la boutique."
          },
          "price": {
            "pattern": "^-?(?:0|[1-9]\\\\d*)(?:\\\\.\\\\d+)?$",
            "type": [ "number", "string" ],
            "description": "Prix TTC en euros.",
            "format": "double"
          },
          "stock": {
            "pattern": "^-?(?:0|[1-9]\\\\d*)$",
            "type": [ "integer", "string" ],
            "description": "Quantité disponible.",
            "format": "int32"
          }
        },
        "description": "Un produit du catalogue."
      }`,
      steps: [
        "<code>&lt;GenerateDocumentationFile&gt;true&lt;/GenerateDocumentationFile&gt;</code> : demande au compilateur de produire le fichier des commentaires XML. Le générateur OpenAPI de .NET 10 les reprend alors.",
        "<code>if (app.Environment.IsDevelopment())</code> : le document et les interfaces ne sont publiés qu'en développement.",
        "<code>app.MapScalarApiReference();</code> : publie l'interface Scalar sur <code>/scalar</code>. Elle lit le document <code>/openapi/v1.json</code>.",
        "<code>app.UseSwaggerUI(options =&gt; options.SwaggerEndpoint(…))</code> : on n'utilise que l'interface de Swashbuckle, branchée sur le document natif. En pratique, choisis l'une des deux.",
        "<code>/// &lt;param name=\"Price\"&gt;Prix TTC en euros.&lt;/param&gt;</code> : pour un record positionnel, on documente chaque propriété avec un <code>param</code>. Le texte devient la <code>description</code> de la propriété dans le schéma.",
        "<code>\"type\": [ \"number\", \"string\" ]</code> : le prix peut être envoyé comme nombre ou comme texte, car les APIs web lisent les nombres entre guillemets par défaut."
      ],
      explain: "Ouvre /scalar dans ton navigateur : tu vois la route, le schéma documenté, et un bouton pour envoyer une requête de test."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ranger et résumer les endpoints des commandes",
      prompt: `<p>Tu as un groupe <code>/api/orders</code> avec <code>GET /{id:int}</code> et <code>POST /</code>. Ajoute le tag « Commandes » au groupe, et un résumé à chaque endpoint : « Lire une commande » et « Passer une commande ». Vérifie le résultat dans <code>/openapi/v1.json</code>.</p>`,
      hint: `<p><code>WithTags</code> sur le groupe, <code>WithSummary</code> sur chaque <code>MapGet</code> et <code>MapPost</code>.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
var app = builder.Build();
app.MapOpenApi();

var orders = app.MapGroup("/api/orders").WithTags("Commandes");

orders.MapGet("/{id:int}", (int id) => Results.Ok(new { id, status = "Pending" }))
    .WithSummary("Lire une commande");

orders.MapPost("/", () => Results.Created("/api/orders/1", new { id = 1 }))
    .WithSummary("Passer une commande");

app.Run();`
    },
    {
      level: "moyen",
      title: "Passer aux TypedResults",
      prompt: `<p>Réécris cet endpoint pour que sa documentation annonce exactement ses réponses : <code>app.MapGet("/api/orders/{id:int}", (int id) =&gt; id == 1 ? Results.Ok(new OrderDto(1, "Pending")) : Results.NotFound());</code>. Puis ajoute un <code>DELETE /api/orders/{id:int}</code> qui renvoie 204, 404, ou 409 (ProblemDetails) si la commande n'est plus en Pending, avec un type de retour <code>Results&lt;NoContent, NotFound, ProblemHttpResult&gt;</code>.</p>`,
      hint: `<p><code>TypedResults.Problem(statusCode: 409, title: …)</code> renvoie un <code>ProblemHttpResult</code>. Il faut <code>using Microsoft.AspNetCore.Http.HttpResults;</code>.</p>`,
      solution: `using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
var app = builder.Build();
app.MapOpenApi();

app.MapGet("/api/orders/{id:int}", Results<Ok<OrderDto>, NotFound> (int id) =>
    id == 1 ? TypedResults.Ok(new OrderDto(1, "Pending")) : TypedResults.NotFound());

app.MapDelete("/api/orders/{id:int}", Results<NoContent, NotFound, ProblemHttpResult> (int id) =>
    id switch
    {
        1 => TypedResults.NoContent(),
        2 => TypedResults.Problem(statusCode: 409, title: "Commande déjà payée"),
        _ => TypedResults.NotFound()
    });

app.Run();

public record OrderDto(int Id, string Status);`
    },
    {
      level: "difficile",
      title: "Un transformer complet",
      prompt: `<p>Écris un transformer de document qui fixe le titre « OrderFlow API », la version « 1.0 » et un contact (nom « Équipe OrderFlow », email « api@orderflow.example »). Publie la doc avec Scalar uniquement en développement.</p>`,
      hint: `<p>En .NET 10, les classes du document sont dans l'espace de noms <code>Microsoft.OpenApi</code> : <code>document.Info.Contact = new OpenApiContact { Name = …, Email = … };</code>.</p>`,
      solution: `using Microsoft.OpenApi;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "OrderFlow API";
        document.Info.Version = "1.0";
        document.Info.Contact = new OpenApiContact
        {
            Name = "Équipe OrderFlow",
            Email = "api@orderflow.example"
        };
        return Task.CompletedTask;
    });
});
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.MapGet("/api/ping", () => "pong");

app.Run();`
    }
  ],
  quiz: [
    {
      q: `À quelle adresse <code>app.MapOpenApi()</code> publie-t-il le document par défaut ?`,
      options: ["<code>/swagger</code>", "<code>/openapi/v1.json</code>", "<code>/api/docs</code>"],
      answer: 1,
      why: `Le document par défaut s'appelle <code>v1</code> et est servi sur <code>/openapi/v1.json</code>. <code>/swagger</code> est l'adresse de l'interface Swagger UI, qui lit ce document.`
    },
    {
      q: `Un endpoint renvoie <code>Results.Ok(dto)</code> ou <code>Results.NotFound()</code>. Que sait le document OpenAPI de ses réponses ?`,
      options: ["Presque rien : le type de retour est IResult", "Tout : 200 avec le schéma du DTO et 404", "Il plante au démarrage"],
      answer: 0,
      why: `Avec <code>IResult</code>, le générateur ne voit pas le contenu. Avec <code>TypedResults</code> et <code>Results&lt;Ok&lt;T&gt;, NotFound&gt;</code>, ou avec <code>Produces</code>, les réponses sont décrites précisément.`
    },
    {
      q: `Pourquoi n'active-t-on Scalar ou Swagger UI qu'en développement ?`,
      options: ["Parce qu'ils ne fonctionnent pas en production", "Parce qu'ils ralentissent toutes les requêtes", "Pour ne pas exposer publiquement la carte complète de l'API"],
      answer: 2,
      why: `Une documentation interactive publique montre toutes les routes et permet de les appeler facilement. On la réserve au développement, ou on la protège par une authentification.`
    },
    {
      q: `À quoi sert <code>WithName("GetProductById")</code> ?`,
      options: ["À changer l'URL de la route", "À donner l'operationId, utilisé comme nom de méthode par les clients générés", "À traduire le résumé"],
      answer: 1,
      why: `<code>WithName</code> fixe l'<code>operationId</code> de l'opération. Les générateurs de client (pour Angular par exemple) s'en servent pour nommer les méthodes : il doit rester stable.`
    }
  ],
  project: `<p><strong>OrderFlow : une API documentée.</strong> Active OpenAPI et Scalar (en développement seulement). Range tes endpoints avec trois tags : « Produits », « Clients », « Commandes ». Passe tes endpoints de lecture aux <code>TypedResults</code>, ajoute un <code>WithSummary</code> et un <code>WithName</code> à chacun, et déclare les erreurs avec <code>ProducesProblem</code> (409 pour le stock insuffisant). Active <code>GenerateDocumentationFile</code> et documente <code>ProductDto</code> et <code>CreateOrderRequest</code> en XML. Ouvre <code>/scalar</code> et passe une commande de test depuis l'interface.</p>`,
  resources: [
    { label: "Vue d'ensemble d'OpenAPI dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/openapi/overview" },
    { label: "Générer des documents OpenAPI (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/openapi/aspnetcore-openapi" }
  ]
});

// =====================================================================
// 6. Versionner son API
// =====================================================================
window.COURSE.push({
  key: "api-versioning",
  title: "Versionner son API",
  summary: "Tu sauras reconnaître un changement cassant, faire cohabiter deux versions d'un endpoint avec Asp.Versioning, et annoncer la fin d'une ancienne version.",
  objectives: [
    "Distinguer un changement cassant d'un changement compatible",
    "Comparer les façons de transmettre la version (URL, query string, en-tête)",
    "Versionner des Minimal APIs avec Asp.Versioning.Http",
    "Déprécier une version et l'annoncer aux clients"
  ],
  analogy: `<p>Une ville veut changer le trajet de la <strong>ligne de bus 12</strong>. Si elle le fait du jour au lendemain, des centaines de personnes attendent à un arrêt où plus aucun bus ne passe. Alors elle crée la <strong>ligne 12 bis</strong> avec le nouveau trajet, laisse rouler l'ancienne quelques mois avec une affiche « cette ligne s'arrêtera le 30 juin », puis la supprime.</p>
<p>Versionner une API, c'est exactement ça : la v2 roule à côté de la v1, la v1 affiche qu'elle va disparaître, et chaque client migre à son rythme.</p>`,
  lesson: `<h3>Pourquoi versionner ?</h3>
<p>Quand tu modifies ton front Angular et ton API ensemble, tu déploies les deux en même temps : pas de problème. Mais une API a souvent d'autres clients : une application mobile que les utilisateurs ne mettent pas à jour, un partenaire, un script d'un autre service. Tu ne contrôles pas leur rythme. Si tu changes la forme d'une réponse, leur code casse.</p>
<p>Le <strong>versionnage</strong> permet de publier une nouvelle forme d'un endpoint <em>sans retirer l'ancienne</em>. Mais il a un coût : chaque version doit être maintenue et testée. On ne crée donc une version que pour un <strong>changement cassant</strong>.</p>

<h3>Cassant ou compatible ?</h3>
<table>
<tr><th>Changement</th><th>Cassant ?</th><th>Pourquoi</th></tr>
<tr><td>Ajouter un champ dans une réponse</td><td>Non</td><td>Les clients ignorent les champs qu'ils ne connaissent pas</td></tr>
<tr><td>Ajouter un endpoint</td><td>Non</td><td>Personne ne l'appelait avant</td></tr>
<tr><td>Ajouter un paramètre <em>optionnel</em></td><td>Non</td><td>Les anciens appels restent valides</td></tr>
<tr><td>Renommer ou supprimer un champ</td><td>Oui</td><td>Le client lit un champ qui n'existe plus</td></tr>
<tr><td>Changer le type d'un champ (nombre vers objet)</td><td>Oui</td><td>Le client attend un nombre</td></tr>
<tr><td>Rendre un champ obligatoire, changer un code de retour</td><td>Oui</td><td>Des appels valides deviennent des erreurs</td></tr>
</table>
<p>Dans OrderFlow, la v2 va transformer <code>"price": 89.90</code> en <code>"price": { "amount": 89.90, "currency": "EUR" }</code> pour préparer la vente en plusieurs devises. C'est un changement de type : cassant.</p>

<h3>Où mettre la version ?</h3>
<table>
<tr><th>Méthode</th><th>Exemple</th><th>Avantages et limites</th></tr>
<tr><td>Segment d'URL</td><td><code>/api/v2/products/1</code></td><td>Très visible, facile à tester dans un navigateur et à router. Le plus répandu.</td></tr>
<tr><td>Query string</td><td><code>/api/products/1?api-version=2</code></td><td>L'URL de la ressource ne change pas. Facile à oublier.</td></tr>
<tr><td>En-tête</td><td><code>X-Api-Version: 2</code></td><td>URL propre, mais invisible dans un navigateur et dans les logs d'accès.</td></tr>
</table>
<p>Il n'y a pas de bonne réponse universelle. Choisis une méthode et tiens-t'y dans toute l'API. Pour débuter, le segment d'URL est le plus simple à comprendre et à déboguer.</p>

<h3>Version « à la main » ou Asp.Versioning ?</h3>
<p>On peut versionner sans aucun package : deux groupes de routes, <code>/api/v1/products</code> et <code>/api/v2/products</code> (exemple 1). Ça marche, mais rien n'indique aux clients quelles versions existent, ni lesquelles vont disparaître. Le package <strong>Asp.Versioning.Http</strong> (bibliothèque maintenue par la communauté .NET, la référence du domaine) ajoute tout ça :</p>
<div class="flow"><span>Requête /api/v1/…</span><span>Lecteur de version (URL, query, en-tête)</span><span>Endpoint de la v1</span><span>Réponse + api-supported-versions</span></div>
<p>On l'enregistre avec <code>AddApiVersioning</code>, en choisissant le <strong>lecteur</strong> de version (<code>UrlSegmentApiVersionReader</code>, <code>QueryStringApiVersionReader</code>, <code>HeaderApiVersionReader</code>, ou plusieurs combinés). On déclare ensuite un <strong>ensemble de versions</strong> (<code>NewApiVersionSet()</code>), on l'attache à un groupe (<code>WithApiVersionSet</code>), et chaque endpoint dit à quelle version il appartient (<code>MapToApiVersion</code>). Dans la route, la contrainte <code>{version:apiVersion}</code> capte le numéro.</p>
<div class="tip">Avec <code>ReportApiVersions = true</code>, chaque réponse contient l'en-tête <code>api-supported-versions</code>, et <code>api-deprecated-versions</code> pour les versions dépréciées. Un client peut les surveiller automatiquement et prévenir l'équipe qu'il faut migrer.</div>

<h3>Faire vivre plusieurs versions</h3>
<pre class="diagram">
 temps ---------------------------------------&gt;

 v1  [ active ]--[ dépréciée (annoncée) ]--X  retirée
 v2              [ active ...................... ]
                 ^                          ^
           publication v2            date de fin de v1
</pre>
<p>Une version <strong>dépréciée</strong> fonctionne encore, mais elle est annoncée comme condamnée : les clients ont le temps de migrer. On communique une date de fin, on surveille dans les logs qui appelle encore la v1, puis on la retire. Partage un maximum de code entre versions : seuls le DTO et la projection changent, la logique métier (service, requêtes EF Core) reste commune.</p>
<div class="note">Pour les controllers, le package est <code>Asp.Versioning.Mvc</code> : on écrit <code>[ApiVersion(1, Deprecated = true)]</code> et <code>[ApiVersion(2)]</code> sur la classe, puis <code>[MapToApiVersion(2)]</code> sur une action. Pour publier un document OpenAPI par version (<code>/openapi/v1.json</code> et <code>/openapi/v2.json</code>), regarde le package <code>Asp.Versioning.OpenApi</code>, qui relie le versionnage au générateur OpenAPI natif.</div>`,
  examples: [
    {
      title: "Deux versions à la main",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// v1 : le prix est un simple nombre
var v1 = app.MapGroup("/api/v1/products");
v1.MapGet("/{id:int}", (int id) => new ProductV1(id, "Clavier", 89.90m));

// v2 : le prix devient un objet { amount, currency } -> changement cassant
var v2 = app.MapGroup("/api/v2/products");
v2.MapGet("/{id:int}", (int id) => new ProductV2(id, "Clavier", new Money(89.90m, "EUR")));

app.Run();

public record ProductV1(int Id, string Name, decimal Price);
public record Money(decimal Amount, string Currency);
public record ProductV2(int Id, string Name, Money Price);`,
      output: `> GET /api/v1/products/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Clavier","price":89.90}

> GET /api/v2/products/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":1,"name":"Clavier","price":{"amount":89.90,"currency":"EUR"}}`,
      steps: [
        "<code>app.MapGroup(\"/api/v1/products\")</code> : un groupe par version, la version est écrite en dur dans le préfixe.",
        "<code>new ProductV1(id, \"Clavier\", 89.90m)</code> : la v1 garde exactement l'ancienne forme. Les clients existants ne voient aucune différence.",
        "<code>public record Money(decimal Amount, string Currency);</code> : le nouveau type du prix en v2.",
        "<code>public record ProductV2(int Id, string Name, Money Price);</code> : chaque version a son propre DTO. On ne modifie jamais le DTO d'une version publiée."
      ],
      explain: "Simple et lisible, mais aucun en-tête n'annonce les versions disponibles, et une v3 inconnue répond juste 404."
    },
    {
      title: "Asp.Versioning avec la version dans l'URL",
      code: `// Fichier : Program.cs
// dotnet add package Asp.Versioning.Http
using Asp.Versioning;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1);
    options.ReportApiVersions = true;                         // en-têtes api-supported-versions...
    options.ApiVersionReader = new UrlSegmentApiVersionReader(); // version lue dans l'URL
});
var app = builder.Build();

var versions = app.NewApiVersionSet()
    .HasDeprecatedApiVersion(new ApiVersion(1))  // v1 marche encore, mais est dépréciée
    .HasApiVersion(new ApiVersion(2))
    .Build();

var products = app.MapGroup("/api/v{version:apiVersion}/products")
    .WithApiVersionSet(versions);

products.MapGet("/{id:int}", (int id) => new ProductV1(id, "Clavier", 89.90m))
    .MapToApiVersion(1);
products.MapGet("/{id:int}", (int id) => new ProductV2(id, "Clavier", new Money(89.90m, "EUR")))
    .MapToApiVersion(2);

app.Run();

public record ProductV1(int Id, string Name, decimal Price);
public record Money(decimal Amount, string Currency);
public record ProductV2(int Id, string Name, Money Price);`,
      output: `> GET /api/v1/products/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
api-supported-versions: 2
api-deprecated-versions: 1

{"id":1,"name":"Clavier","price":89.90}

> GET /api/v2/products/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
api-supported-versions: 2
api-deprecated-versions: 1

{"id":1,"name":"Clavier","price":{"amount":89.90,"currency":"EUR"}}

> GET /api/v3/products/1
HTTP/1.1 404 Not Found`,
      steps: [
        "<code>AddApiVersioning(options =&gt; …)</code> : active le versionnage. <code>UrlSegmentApiVersionReader</code> lit la version dans l'URL.",
        "<code>HasDeprecatedApiVersion(new ApiVersion(1))</code> : la v1 reste servie mais est annoncée comme dépréciée.",
        "<code>\"/api/v{version:apiVersion}/products\"</code> : la contrainte <code>apiVersion</code> capte le numéro (1, 2…) dans le segment <code>v…</code>.",
        "<code>.MapToApiVersion(1)</code> et <code>.MapToApiVersion(2)</code> : deux endpoints sur la même route, chacun lié à sa version. Asp.Versioning choisit le bon.",
        "<code>api-supported-versions: 2</code> et <code>api-deprecated-versions: 1</code> : grâce à <code>ReportApiVersions</code>, le client sait que la v1 va disparaître et que la v2 est la version à utiliser.",
        "<code>GET /api/v3/products/1</code> : aucune route ne correspond à une v3, la réponse est 404."
      ]
    },
    {
      title: "La version en query string ou en en-tête",
      code: `// Fichier : Program.cs
// dotnet add package Asp.Versioning.Http
using Asp.Versioning;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1);
    options.AssumeDefaultVersionWhenUnspecified = true;  // pas de version => v1
    options.ReportApiVersions = true;
    // Version lue dans ?api-version=2 OU dans l'en-tête X-Api-Version: 2
    options.ApiVersionReader = ApiVersionReader.Combine(
        new QueryStringApiVersionReader("api-version"),
        new HeaderApiVersionReader("X-Api-Version"));
});
var app = builder.Build();

var versions = app.NewApiVersionSet()
    .HasApiVersion(new ApiVersion(1))
    .HasApiVersion(new ApiVersion(2))
    .Build();

// L'URL ne change plus : /api/products/1 pour toutes les versions
var products = app.MapGroup("/api/products").WithApiVersionSet(versions);
products.MapGet("/{id:int}", (int id) => new { id, name = "Clavier", price = 89.90m })
    .MapToApiVersion(1);
products.MapGet("/{id:int}", (int id) => new { id, name = "Clavier", price = new { amount = 89.90m, currency = "EUR" } })
    .MapToApiVersion(2);

app.Run();`,
      output: `> GET /api/products/1
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
api-supported-versions: 1, 2

{"id":1,"name":"Clavier","price":89.90}

> GET /api/products/1?api-version=2
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
api-supported-versions: 1, 2

{"id":1,"name":"Clavier","price":{"amount":89.90,"currency":"EUR"}}

> GET /api/products/1   (en-tête X-Api-Version: 2)
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
api-supported-versions: 1, 2

{"id":1,"name":"Clavier","price":{"amount":89.90,"currency":"EUR"}}

> GET /api/products/1?api-version=3
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json
api-supported-versions: 1, 2

{"type":"https://docs.api-versioning.org/problems#unsupported","title":"Unsupported API version",
 "status":400,"detail":"The HTTP resource that matches the request URI 'http://localhost:5000/api/products/1' does not support the API version '3'.",
 "code":"UnsupportedApiVersion","traceId":"00-2d975aeab4a866335d9172bf482d048f-4e7aacca2f855102-00"}`,
      steps: [
        "<code>AssumeDefaultVersionWhenUnspecified = true</code> : un appel sans version reçoit la v1. Pratique pour les anciens clients qui ne connaissaient pas le versionnage.",
        "<code>ApiVersionReader.Combine(…)</code> : la version peut venir de la query string <em>ou</em> de l'en-tête. Le premier lecteur qui trouve une valeur gagne.",
        "<code>app.MapGroup(\"/api/products\")</code> : plus de <code>v{version}</code> dans la route, l'URL de la ressource est la même pour toutes les versions.",
        "<code>new { id, name = \"Clavier\", … }</code> : ici des objets anonymes, pour rester court. Dans un vrai projet, garde des records nommés par version.",
        "<code>?api-version=3</code> : la route existe mais pas cette version. Asp.Versioning répond 400 avec un ProblemDetails qui contient le code <code>UnsupportedApiVersion</code>."
      ],
      explain: "Compare avec l'exemple 2 : une version inconnue donne 404 quand elle est dans l'URL (aucune route ne correspond), mais 400 quand l'URL existe et que seule la version est refusée."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Renommer un champ proprement",
      prompt: `<p>Ton endpoint <code>GET /api/v1/customers/{id:int}</code> renvoie <code>{ "id", "name", "email" }</code>. L'équipe veut renommer <code>name</code> en <code>fullName</code>. C'est cassant : crée une v2 « à la main » (deux groupes de routes) avec deux records <code>CustomerV1</code> et <code>CustomerV2</code>, sans toucher la v1.</p>`,
      hint: `<p>Deux <code>MapGroup</code> (<code>/api/v1/customers</code> et <code>/api/v2/customers</code>) et deux records qui ne diffèrent que par le nom de la propriété.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGroup("/api/v1/customers")
   .MapGet("/{id:int}", (int id) => new CustomerV1(id, "Alice Martin", "alice@example.com"));

app.MapGroup("/api/v2/customers")
   .MapGet("/{id:int}", (int id) => new CustomerV2(id, "Alice Martin", "alice@example.com"));

app.Run();

public record CustomerV1(int Id, string Name, string Email);
public record CustomerV2(int Id, string FullName, string Email);`
    },
    {
      level: "moyen",
      title: "Versionner les commandes avec Asp.Versioning",
      prompt: `<p>Avec Asp.Versioning (version dans l'URL), crée <code>GET /api/v{version}/orders/{id:int}</code> en deux versions : la v1 renvoie <code>{ id, status, total }</code> avec <code>total</code> en nombre, la v2 renvoie <code>total</code> sous forme d'objet <code>Money</code>. Déclare la v1 comme dépréciée et active <code>ReportApiVersions</code>.</p>`,
      hint: `<p>Reprends l'exemple 2 : <code>NewApiVersionSet().HasDeprecatedApiVersion(new ApiVersion(1)).HasApiVersion(new ApiVersion(2)).Build()</code>, puis <code>MapToApiVersion</code> sur chaque endpoint.</p>`,
      solution: `using Asp.Versioning;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1);
    options.ReportApiVersions = true;
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
});
var app = builder.Build();

var versions = app.NewApiVersionSet()
    .HasDeprecatedApiVersion(new ApiVersion(1))
    .HasApiVersion(new ApiVersion(2))
    .Build();

var orders = app.MapGroup("/api/v{version:apiVersion}/orders").WithApiVersionSet(versions);

orders.MapGet("/{id:int}", (int id) => new OrderV1(id, "Paid", 149.70m))
    .MapToApiVersion(1);
orders.MapGet("/{id:int}", (int id) => new OrderV2(id, "Paid", new Money(149.70m, "EUR")))
    .MapToApiVersion(2);

app.Run();

public record Money(decimal Amount, string Currency);
public record OrderV1(int Id, string Status, decimal Total);
public record OrderV2(int Id, string Status, Money Total);`
    },
    {
      level: "difficile",
      title: "Un client qui surveille la dépréciation",
      prompt: `<p>Écris une petite application console qui appelle <code>http://localhost:5000/api/v1/products/1</code> avec <code>HttpClient</code>, lit les en-têtes <code>api-supported-versions</code> et <code>api-deprecated-versions</code>, et affiche « Attention : la version 1 est dépréciée, versions disponibles : 2 » quand la version appelée figure dans la liste des versions dépréciées.</p>`,
      hint: `<p><code>response.Headers.TryGetValues(\"api-deprecated-versions\", out var values)</code> renvoie les valeurs de l'en-tête. Une valeur peut contenir plusieurs versions séparées par des virgules : <code>Split(',')</code> puis <code>Trim()</code>.</p>`,
      solution: `using var http = new HttpClient { BaseAddress = new Uri("http://localhost:5000") };
const string calledVersion = "1";

using var response = await http.GetAsync($"/api/v{calledVersion}/products/1");
Console.WriteLine($"Statut : {(int)response.StatusCode}");

string[] deprecated = ReadVersions(response, "api-deprecated-versions");
string[] supported = ReadVersions(response, "api-supported-versions");

if (deprecated.Contains(calledVersion))
    Console.WriteLine($"Attention : la version {calledVersion} est dépréciée, versions disponibles : {string.Join(", ", supported)}");
else
    Console.WriteLine($"La version {calledVersion} est à jour.");

static string[] ReadVersions(HttpResponseMessage response, string header) =>
    response.Headers.TryGetValues(header, out var values)
        ? values.SelectMany(v => v.Split(',')).Select(v => v.Trim()).ToArray()
        : [];`
    }
  ],
  quiz: [
    {
      q: `Lequel de ces changements impose une nouvelle version de l'API ?`,
      options: ["Ajouter un champ <code>imageUrl</code> à la réponse", "Ajouter un endpoint <code>GET /api/categories</code>", "Transformer <code>price</code> (nombre) en objet <code>{ amount, currency }</code>"],
      answer: 2,
      why: `Changer le type d'un champ casse les clients qui attendent un nombre. Ajouter un champ ou un endpoint est compatible : les clients existants ne sont pas affectés.`
    },
    {
      q: `À quoi sert <code>.MapToApiVersion(2)</code> sur un endpoint ?`,
      options: ["À lier cet endpoint à la version 2 de l'ensemble de versions", "À rediriger la v1 vers la v2", "À supprimer la v1"],
      answer: 0,
      why: `Plusieurs endpoints partagent la même route ; <code>MapToApiVersion</code> indique lequel répond pour quelle version. Asp.Versioning choisit selon la version lue dans la requête.`
    },
    {
      q: `Que signifie une version annoncée dans <code>api-deprecated-versions</code> ?`,
      options: ["Elle ne répond plus", "Elle fonctionne encore mais va être retirée : il faut migrer", "Elle est en cours de test"],
      answer: 1,
      why: `Dépréciée ne veut pas dire supprimée : la version est servie normalement, mais les clients sont prévenus qu'elle disparaîtra. Cela leur laisse le temps de migrer.`
    },
    {
      q: `Avec <code>AssumeDefaultVersionWhenUnspecified = true</code> et <code>DefaultApiVersion = 1</code>, que reçoit un appel sans aucune version ?`,
      options: ["Une erreur 400", "La dernière version", "La version 1"],
      answer: 2,
      why: `L'option dit « si le client ne précise rien, considère qu'il demande la version par défaut ». Sans elle, la requête serait refusée.`
    }
  ],
  project: `<p><strong>OrderFlow : préparer l'avenir.</strong> Installe <code>Asp.Versioning.Http</code> et place tes routes sous <code>/api/v{version:apiVersion}/…</code> avec un ensemble de versions commun (v1 par défaut, <code>ReportApiVersions</code> activé). Crée une v2 de <code>GET /api/orders/{id}</code> où le total devient un objet <code>Money</code>, en réutilisant la même requête EF Core et seulement une projection différente. Déclare la v1 dépréciée, vérifie les en-têtes avec ton fichier <code>.http</code>, et note dans le README de l'API la date prévue de fin de la v1.</p>`,
  resources: [
    { label: "Bonnes pratiques de conception d'API web (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/azure/architecture/best-practices/api-design" },
    { label: "Asp.Versioning : documentation officielle (GitHub)", url: "https://github.com/dotnet/aspnet-api-versioning/wiki" }
  ]
});
