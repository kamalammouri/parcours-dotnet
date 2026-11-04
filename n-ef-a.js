window.COURSE = window.COURSE || [];

/* ============================================================
   Jour 27 — EF Core : premiers pas
   ============================================================ */
window.COURSE.push({
  key: "e-intro",
  title: "EF Core : premiers pas",
  summary: "Comprendre ce qu'un ORM fait à ta place, créer ton premier DbContext sur SQL Server, générer la base avec une migration et écrire un CRUD complet en voyant le SQL produit.",
  objectives: [
    "Expliquer ce qu'EF Core automatise par rapport au code ADO.NET écrit au jour 26",
    "Installer les bons packages et l'outil dotnet-ef",
    "Écrire un DbContext, l'enregistrer dans la DI avec AddDbContext et une chaîne de connexion",
    "Créer la base avec une première migration",
    "Écrire un CRUD asynchrone complet et lire le SQL généré avec LogTo et ToQueryString",
    "Choisir entre code-first et database-first, et scaffolder une base existante"
  ],
  lesson: `
<h3>Ce que fait un ORM, et ce qu'il ne fait pas</h3>
<p>Au jour 26, tu as écrit un repository ADO.NET : ouvrir une <code>SqlConnection</code>, créer une <code>SqlCommand</code>, ajouter des <code>SqlParameter</code>, lire un <code>SqlDataReader</code> colonne par colonne, puis recopier chaque valeur dans un objet <code>Product</code>. Ça marche, c'est rapide, mais pour chaque table il faut réécrire le même code de plomberie, et chaque renommage de colonne casse des chaînes SQL que le compilateur ne voit pas.</p>
<p>Un <strong>ORM</strong> (Object-Relational Mapper) fait ce travail à ta place. Tu décris tes classes C#, l'ORM sait à quelles tables et colonnes elles correspondent, et il :</p>
<ul>
<li><strong>traduit tes requêtes LINQ en SQL</strong> (<code>Where</code> devient <code>WHERE</code>, <code>OrderBy</code> devient <code>ORDER BY</code>), toujours paramétrées, donc sans injection SQL ;</li>
<li><strong>matérialise</strong> les lignes en objets (fini le <code>reader.GetInt32(0)</code>) ;</li>
<li><strong>suit les modifications</strong> des objets chargés (le <em>change tracker</em>) et génère les <code>INSERT</code>, <code>UPDATE</code> et <code>DELETE</code> au moment de <code>SaveChanges</code>, dans une transaction ;</li>
<li><strong>fait évoluer le schéma</strong> de la base grâce aux migrations.</li>
</ul>
<p>Ce qu'il ne fait pas : te dispenser de connaître SQL. EF Core génère du SQL, et un développeur senior lit ce SQL, repère une requête qui charge 50 000 lignes ou qui part en N+1, et sait quand repasser à du SQL écrit à la main. C'est pour ça que ce module vient après SQL Server et ADO.NET.</p>

<table>
<thead><tr><th>Tâche</th><th>ADO.NET (jour 26)</th><th>EF Core</th></tr></thead>
<tbody>
<tr><td>Lire des produits</td><td><code>SqlCommand</code> + <code>SqlDataReader</code> + mapping manuel</td><td><code>await db.Products.Where(p =&gt; p.Price &gt; 10).ToListAsync()</code></td></tr>
<tr><td>Paramètres</td><td><code>cmd.Parameters.Add(...)</code> à la main</td><td>Automatiques</td></tr>
<tr><td>Insérer une commande et ses lignes</td><td>Plusieurs <code>INSERT</code>, récupération de l'identité avec <code>OUTPUT</code>, transaction manuelle</td><td><code>db.Orders.Add(order); await db.SaveChangesAsync();</code></td></tr>
<tr><td>Changer le schéma</td><td>Scripts SQL versionnés à la main</td><td>Migrations générées puis relues</td></tr>
<tr><td>Performance brute</td><td>Maximale</td><td>Très proche pour les cas courants, avec un coût de suivi des entités</td></tr>
</tbody>
</table>

<h3>Les packages</h3>
<p>EF Core est découpé en packages NuGet. Pour SQL Server, il t'en faut trois dans le projet qui contient le DbContext, plus un outil global :</p>
<ul>
<li><code>Microsoft.EntityFrameworkCore.SqlServer</code> : le <em>provider</em> SQL Server. Il tire <code>Microsoft.EntityFrameworkCore</code> (le cœur) et <code>Microsoft.Data.SqlClient</code>, le même driver que tu as utilisé en ADO.NET. EF Core est construit <em>au-dessus</em> d'ADO.NET.</li>
<li><code>Microsoft.EntityFrameworkCore.Design</code> : nécessaire aux commandes de migration, à ajouter dans le projet de démarrage.</li>
<li><code>Microsoft.EntityFrameworkCore.Tools</code> : seulement si tu utilises la console du gestionnaire de packages de Visual Studio (<code>Add-Migration</code>, <code>Update-Database</code>).</li>
<li><code>dotnet-ef</code> : l'outil en ligne de commande, installé une fois avec <code>dotnet tool install --global dotnet-ef</code>.</li>
</ul>
<p>Garde toutes les versions EF Core alignées (même version majeure 10.x partout). Mélanger un cœur en 10 et un provider en 9 donne des erreurs de chargement incompréhensibles.</p>

<h3>DbContext et DbSet</h3>
<p>Le <code>DbContext</code> est le point d'entrée : il représente une <em>session</em> de travail avec la base. Il contient la configuration du modèle, une connexion, et le change tracker. Chaque <code>DbSet&lt;T&gt;</code> est une table que tu peux interroger avec LINQ.</p>
<pre><code>public class OrderFlowDbContext(DbContextOptions&lt;OrderFlowDbContext&gt; options) : DbContext(options)
{
    public DbSet&lt;Product&gt; Products =&gt; Set&lt;Product&gt;();
}</code></pre>
<p>Deux points importants :</p>
<ul>
<li>Un <code>DbContext</code> est <strong>léger et de courte durée</strong>. On en crée un par unité de travail : une requête HTTP, un message traité, une commande console. On ne le garde jamais en singleton.</li>
<li>Il <strong>n'est pas thread-safe</strong>. Deux requêtes lancées en parallèle sur le même contexte lèvent <code>InvalidOperationException: A second operation was started on this context</code>.</li>
</ul>

<h3>OnConfiguring ou AddDbContext</h3>
<p>Il existe deux façons de dire au contexte quelle base utiliser.</p>
<p><strong>OnConfiguring</strong> : le contexte se configure lui-même. Pratique pour une app console ou un test rapide, mais la chaîne de connexion se retrouve codée en dur dans la classe.</p>
<p><strong>AddDbContext</strong> : le contexte reçoit ses <code>DbContextOptions</code> par son constructeur, et c'est l'application qui le configure au démarrage, en lisant la chaîne de connexion dans <code>appsettings.json</code> ou dans les secrets. C'est <strong>la façon standard</strong> dans une application ASP.NET Core ou un worker : le contexte est enregistré en durée de vie <em>Scoped</em> (un par requête HTTP) et injecté où on en a besoin.</p>
<p>Dans une app console sans hôte, tu peux construire les options toi-même avec <code>new DbContextOptionsBuilder&lt;OrderFlowDbContext&gt;().UseSqlServer(cs).Options</code>.</p>

<h3>Première migration</h3>
<p>En <strong>code-first</strong>, tu écris les classes, puis EF Core génère le schéma. La commande <code>dotnet ef migrations add InitialCreate</code> compare ton modèle C# au dernier état connu (vide au départ) et génère trois fichiers dans un dossier <code>Migrations</code> :</p>
<ul>
<li><code>20261104_InitialCreate.cs</code> : les méthodes <code>Up</code> (créer) et <code>Down</code> (annuler) ;</li>
<li><code>20261104_InitialCreate.Designer.cs</code> : les métadonnées de la migration ;</li>
<li><code>OrderFlowDbContextModelSnapshot.cs</code> : l'état complet du modèle, qui sert de base de comparaison à la prochaine migration.</li>
</ul>
<p><code>dotnet ef database update</code> applique ensuite les migrations en attente et les note dans la table <code>__EFMigrationsHistory</code>. On verra tout ça en détail au jour 30.</p>

<h3>Le CRUD de base</h3>
<table>
<thead><tr><th>Opération</th><th>Code</th><th>SQL envoyé</th></tr></thead>
<tbody>
<tr><td>Créer</td><td><code>db.Products.Add(p); await db.SaveChangesAsync();</code></td><td><code>INSERT ... OUTPUT INSERTED.[Id]</code></td></tr>
<tr><td>Lire par clé</td><td><code>await db.Products.FindAsync(id)</code></td><td><code>SELECT TOP(1) ... WHERE [Id] = @p0</code>, sauf si l'entité est déjà suivie (aucun aller-retour)</td></tr>
<tr><td>Lire avec filtre</td><td><code>await db.Products.Where(...).ToListAsync()</code></td><td><code>SELECT ... WHERE ...</code></td></tr>
<tr><td>Modifier</td><td>Changer une propriété d'une entité chargée, puis <code>SaveChangesAsync()</code></td><td><code>UPDATE</code> des seules colonnes modifiées</td></tr>
<tr><td>Supprimer</td><td><code>db.Products.Remove(p); await db.SaveChangesAsync();</code></td><td><code>DELETE ... WHERE [Id] = @p0</code></td></tr>
</tbody>
</table>
<p>Retiens que <strong>rien n'est envoyé à la base avant <code>SaveChangesAsync</code></strong> (pour les écritures) ou avant un opérateur qui exécute la requête : <code>ToListAsync</code>, <code>FirstOrDefaultAsync</code>, <code>CountAsync</code>, <code>foreach</code>. Une requête LINQ non exécutée n'est qu'une description.</p>
<p>Pour modifier une entité, il n'est pas nécessaire d'appeler <code>Update</code> si elle a été chargée par le même contexte : le change tracker voit tout seul quelles propriétés ont changé. <code>Update(entity)</code> sert aux entités <em>détachées</em> (reçues d'un client par exemple), et il marque alors <strong>toutes</strong> les colonnes comme modifiées.</p>

<h3>Voir le SQL généré</h3>
<p>C'est le réflexe numéro un. Trois outils :</p>
<ul>
<li><code>optionsBuilder.LogTo(Console.WriteLine, LogLevel.Information)</code> affiche chaque commande SQL exécutée, avec sa durée. Dans ASP.NET Core, le logger par défaut le fait déjà si la catégorie <code>Microsoft.EntityFrameworkCore.Database.Command</code> est au niveau <code>Information</code>.</li>
<li><code>query.ToQueryString()</code> renvoie le SQL d'une requête <em>sans l'exécuter</em>. Idéal pour comprendre une requête LINQ complexe.</li>
<li><code>EnableSensitiveDataLogging()</code> affiche les <em>valeurs</em> des paramètres. Utile en développement, mais <strong>jamais en production</strong> : les logs contiendraient des emails, des montants, voire des mots de passe hachés.</li>
</ul>

<h3>Code-first ou database-first</h3>
<p><strong>Code-first</strong> : les classes C# sont la source de vérité, les migrations créent et font évoluer la base. C'est le choix par défaut pour un nouveau projet.</p>
<p><strong>Database-first</strong> : la base existe déjà (souvent gérée par un DBA, ou partagée avec d'autres applications). La commande <code>dotnet ef dbcontext scaffold</code> lit le schéma et génère les entités et le DbContext. Tu peux la relancer avec <code>--force</code> quand le schéma change, à condition de ne pas modifier les fichiers générés à la main (utilise des <code>partial class</code> pour ajouter du code).</p>
<p>En ESN, tu rencontreras souvent le second cas : une base SQL Server de dix ans, des centaines de tables, et une nouvelle API à brancher dessus. Le scaffold te fait gagner des jours.</p>

<h3>Pièges courants</h3>
<ul>
<li>Oublier <code>await</code> ou utiliser <code>ToList()</code> synchrone dans une API : tu bloques un thread du pool pendant l'attente réseau.</li>
<li>Garder un <code>DbContext</code> vivant longtemps : le change tracker grossit, la mémoire aussi, et les données deviennent périmées.</li>
<li>Appeler <code>SaveChangesAsync</code> dans une boucle : un aller-retour par élément. Ajoute tout, puis sauvegarde une fois.</li>
<li>Croire que <code>FindAsync</code> va toujours en base : il renvoie d'abord l'entité déjà suivie.</li>
</ul>

<div class="note">Un senior regarde le SQL avant de regarder le code C#. En revue de code, demande systématiquement « quelle requête ça génère, et combien de fois elle s'exécute ? ». Active <code>LogTo</code> en développement dès le premier jour, et garde <code>EnableSensitiveDataLogging</code> derrière un test <code>IsDevelopment()</code>.</div>
`,
  examples: [
    {
      title: "Installer les outils et créer le projet",
      code: `dotnet new classlib -n OrderFlow.Data.Ef
dotnet add OrderFlow.Data.Ef package Microsoft.EntityFrameworkCore.SqlServer
dotnet add OrderFlow.Data.Ef package Microsoft.EntityFrameworkCore.Design

dotnet tool install --global dotnet-ef
dotnet ef --version`,
      explain: "Le package <code>Design</code> doit aussi être présent dans le projet de démarrage (l'API) quand tu lances les migrations depuis la solution complète."
    },
    {
      title: "Premier DbContext et première entité",
      code: `using Microsoft.EntityFrameworkCore;

namespace OrderFlow.Data.Ef;

public class Product
{
    public int Id { get; set; }                       // clé primaire par convention
    public required string Name { get; set; }         // NOT NULL car non nullable
    public string? Description { get; set; }          // NULL autorisé
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

public class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // précision obligatoire pour decimal, sinon EF émet un avertissement
        modelBuilder.Entity<Product>().Property(p => p.Price).HasPrecision(18, 2);
    }
}`,
      explain: "Le constructeur principal reçoit les options : le contexte ne sait rien de la chaîne de connexion, c'est l'application qui la fournit."
    },
    {
      title: "Enregistrer le contexte dans une API et logger le SQL",
      code: `// Program.cs de OrderFlow.Api
using Microsoft.EntityFrameworkCore;
using OrderFlow.Data.Ef;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<OrderFlowDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow"));

    if (builder.Environment.IsDevelopment())
    {
        options.LogTo(Console.WriteLine, LogLevel.Information)
               .EnableSensitiveDataLogging()   // valeurs des paramètres : dev uniquement
               .EnableDetailedErrors();
    }
});

var app = builder.Build();

app.MapGet("/products", async (OrderFlowDbContext db) =>
    await db.Products.OrderBy(p => p.Name).ToListAsync());

app.Run();

// appsettings.Development.json
// "ConnectionStrings": {
//   "OrderFlow": "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=<secret>;TrustServerCertificate=True"
// }`,
      explain: "<code>AddDbContext</code> enregistre le contexte en <em>Scoped</em> : une instance par requête HTTP, libérée à la fin de la requête. Le mot de passe va dans les user-secrets, pas dans le fichier versionné."
    },
    {
      title: "CRUD complet avec le SQL généré",
      code: `using Microsoft.EntityFrameworkCore;
using OrderFlow.Data.Ef;

var options = new DbContextOptionsBuilder<OrderFlowDbContext>()
    .UseSqlServer("Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=<secret>;TrustServerCertificate=True")
    .LogTo(Console.WriteLine, Microsoft.Extensions.Logging.LogLevel.Information)
    .Options;

await using var db = new OrderFlowDbContext(options);

// CREATE
var keyboard = new Product { Name = "Clavier", Price = 49.90m, Stock = 10 };
db.Products.Add(keyboard);
await db.SaveChangesAsync();
// INSERT INTO [Products] ([Description], [Name], [Price], [Stock])
// OUTPUT INSERTED.[Id] VALUES (@p0, @p1, @p2, @p3);
Console.WriteLine($"Id généré : {keyboard.Id}");

// READ
var cheap = await db.Products.Where(p => p.Price < 100).OrderBy(p => p.Price).ToListAsync();
// SELECT [p].[Id], ... FROM [Products] AS [p] WHERE [p].[Price] < 100.0 ORDER BY [p].[Price]

// UPDATE : pas besoin d'appeler Update, l'entité est suivie
keyboard.Stock -= 1;
await db.SaveChangesAsync();
// UPDATE [Products] SET [Stock] = @p0 OUTPUT 1 WHERE [Id] = @p1;   (seule la colonne modifiée)

// DELETE
db.Products.Remove(keyboard);
await db.SaveChangesAsync();
// DELETE FROM [Products] OUTPUT 1 WHERE [Id] = @p0;

// Voir le SQL sans exécuter
var query = db.Products.Where(p => p.Stock == 0).Select(p => p.Name);
Console.WriteLine(query.ToQueryString());`,
      explain: "Observe que l'<code>UPDATE</code> ne touche que <code>Stock</code> : le change tracker compare les valeurs actuelles aux valeurs chargées."
    },
    {
      title: "Database-first : scaffolder la base OrderFlow existante",
      code: `dotnet ef dbcontext scaffold "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=<secret>;TrustServerCertificate=True" Microsoft.EntityFrameworkCore.SqlServer --output-dir Entities --context-dir Data --context OrderFlowDbContext --no-onconfiguring --table Customers --table Products --table Orders --table OrderLines

# Pour régénérer après un changement de schéma :
# ajoute --force (et n'édite jamais les fichiers générés, utilise des partial class)`,
      explain: "<code>--no-onconfiguring</code> évite de générer la chaîne de connexion en dur dans le contexte. <code>--table</code> limite le scaffold aux tables utiles."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ton premier contexte Customer",
      prompt: "<p>Crée une entité <code>Customer</code> (<code>Id</code>, <code>FullName</code> obligatoire, <code>Email</code> obligatoire, <code>Phone</code> optionnel), ajoute un <code>DbSet</code> au contexte, puis dans une app console insère deux clients et affiche ceux dont l'email se termine par <code>@example.com</code>.</p>",
      hint: "<p><code>EndsWith</code> est traduit en <code>LIKE N'%@example.com'</code>. N'oublie pas de générer et d'appliquer une migration après avoir ajouté le <code>DbSet</code>.</p>",
      solution: `public class Customer
{
    public int Id { get; set; }
    public required string FullName { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
}

// Dans OrderFlowDbContext :
// public DbSet<Customer> Customers => Set<Customer>();

// dotnet ef migrations add AddCustomers
// dotnet ef database update

await using var db = new OrderFlowDbContext(options);

db.Customers.AddRange(
    new Customer { FullName = "Alice Martin", Email = "alice@example.com" },
    new Customer { FullName = "Karim Benali", Email = "karim@contoso.com", Phone = "0600000000" });
await db.SaveChangesAsync();   // un seul SaveChanges pour les deux

var exampleCustomers = await db.Customers
    .Where(c => c.Email.EndsWith("@example.com"))
    .ToListAsync();

foreach (var c in exampleCustomers)
    Console.WriteLine($"{c.Id} - {c.FullName} - {c.Email}");`
    },
    {
      level: "moyen",
      title: "Service de stock avec FindAsync",
      prompt: "<p>Écris une classe <code>StockService</code> qui reçoit un <code>OrderFlowDbContext</code> par son constructeur et expose <code>Task&lt;bool&gt; RemoveStockAsync(int productId, int quantity)</code>. La méthode renvoie <code>false</code> si le produit n'existe pas ou si le stock est insuffisant, sinon elle décrémente et sauvegarde. Enregistre ensuite le contexte et le service dans la DI d'une API et expose <code>POST /products/{id}/remove-stock</code>.</p>",
      hint: "<p><code>FindAsync</code> renvoie <code>null</code> si la clé n'existe pas. Le service doit être <em>Scoped</em>, comme le contexte.</p>",
      solution: `public class StockService(OrderFlowDbContext db)
{
    public async Task<bool> RemoveStockAsync(int productId, int quantity, CancellationToken ct = default)
    {
        if (quantity <= 0) return false;

        var product = await db.Products.FindAsync([productId], ct);
        if (product is null || product.Stock < quantity) return false;

        product.Stock -= quantity;            // suivi par le change tracker
        await db.SaveChangesAsync(ct);        // UPDATE [Products] SET [Stock] = @p0 WHERE [Id] = @p1
        return true;
    }
}

// Program.cs
builder.Services.AddDbContext<OrderFlowDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));
builder.Services.AddScoped<StockService>();

app.MapPost("/products/{id:int}/remove-stock", async (int id, int quantity, StockService stock, CancellationToken ct) =>
    await stock.RemoveStockAsync(id, quantity, ct)
        ? Results.NoContent()
        : Results.BadRequest("Produit introuvable ou stock insuffisant"));

// Remarque : deux requêtes simultanées peuvent lire le même stock et survendre.
// On corrigera ça au jour 33 avec la concurrence optimiste (RowVersion).`
    },
    {
      level: "difficile",
      title: "Comparer ADO.NET et EF Core sur la même requête",
      prompt: "<p>Reprends la méthode ADO.NET du jour 26 qui renvoie les produits en rupture de stock. Écris l'équivalent EF Core, affiche le SQL avec <code>ToQueryString()</code>, puis mesure les deux versions avec un <code>Stopwatch</code> sur 1 000 exécutions. Ajoute ensuite <code>AsNoTracking()</code> à la version EF et compare à nouveau. Explique en commentaire l'écart observé.</p>",
      hint: "<p>Fais une exécution « à blanc » avant de mesurer : la première requête EF Core construit le modèle et compile la requête. <code>AsNoTracking</code> évite d'enregistrer chaque entité dans le change tracker.</p>",
      solution: `using System.Diagnostics;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

const string cs = "Server=localhost,1433;Database=OrderFlow;User Id=sa;Password=<secret>;TrustServerCertificate=True";

async Task<List<Product>> OutOfStockAdoAsync()
{
    var result = new List<Product>();
    await using var conn = new SqlConnection(cs);
    await conn.OpenAsync();
    await using var cmd = new SqlCommand("SELECT Id, Name, Description, Price, Stock FROM Products WHERE Stock = 0", conn);
    await using var reader = await cmd.ExecuteReaderAsync();
    while (await reader.ReadAsync())
    {
        result.Add(new Product
        {
            Id = reader.GetInt32(0),
            Name = reader.GetString(1),
            Description = reader.IsDBNull(2) ? null : reader.GetString(2),
            Price = reader.GetDecimal(3),
            Stock = reader.GetInt32(4)
        });
    }
    return result;
}

var options = new DbContextOptionsBuilder<OrderFlowDbContext>().UseSqlServer(cs).Options;

async Task<List<Product>> OutOfStockEfAsync(bool noTracking)
{
    await using var db = new OrderFlowDbContext(options);
    IQueryable<Product> q = db.Products.Where(p => p.Stock == 0);
    if (noTracking) q = q.AsNoTracking();
    return await q.ToListAsync();
}

await using (var db = new OrderFlowDbContext(options))
    Console.WriteLine(db.Products.Where(p => p.Stock == 0).ToQueryString());

// échauffement
await OutOfStockAdoAsync();
await OutOfStockEfAsync(false);

async Task MeasureAsync(string label, Func<Task> action)
{
    var sw = Stopwatch.StartNew();
    for (var i = 0; i < 1000; i++) await action();
    Console.WriteLine($"{label} : {sw.ElapsedMilliseconds} ms");
}

await MeasureAsync("ADO.NET", OutOfStockAdoAsync);
await MeasureAsync("EF Core tracking", () => OutOfStockEfAsync(false));
await MeasureAsync("EF Core no-tracking", () => OutOfStockEfAsync(true));

// Constat habituel : ADO.NET est le plus rapide, EF no-tracking est très proche,
// EF avec tracking est un peu plus lent car chaque entité est enregistrée et copiée
// (snapshot) dans le change tracker. Pour une lecture seule, AsNoTracking est le bon choix.
// Pour une mesure sérieuse, on utiliserait BenchmarkDotNet plutôt qu'un Stopwatch.`
    }
  ],
  project: "<p>Crée le projet <code>OrderFlow.Data.Ef</code> dans la solution. Ajoute <code>OrderFlowDbContext</code> avec un seul <code>DbSet&lt;Product&gt;</code>, enregistre-le dans <code>OrderFlow.Api</code> avec <code>AddDbContext</code> et la chaîne de connexion <code>OrderFlow</code> stockée dans les user-secrets. Utilise une <strong>nouvelle base</strong> <code>OrderFlowEf</code> pour ne pas casser la base ADO.NET du module précédent. Génère la migration <code>InitialCreate</code>, applique-la, et expose <code>GET /ef/products</code> et <code>POST /ef/products</code>. Active <code>LogTo</code> en développement et vérifie dans la console le SQL de chaque appel.</p>",
  resources: [
    { label: "EF Core : vue d'ensemble", url: "https://learn.microsoft.com/ef/core/" },
    { label: "Durée de vie et configuration du DbContext", url: "https://learn.microsoft.com/ef/core/dbcontext-configuration/" },
    { label: "Provider SQL Server", url: "https://learn.microsoft.com/ef/core/providers/sql-server/" },
    { label: "Reverse engineering (scaffolding)", url: "https://learn.microsoft.com/ef/core/managing-schemas/scaffolding/" },
    { label: "Logging simple", url: "https://learn.microsoft.com/ef/core/logging-events-diagnostics/simple-logging" }
  ]
});

/* ============================================================
   Jour 28 — Modélisation : conventions, annotations, Fluent API
   ============================================================ */
window.COURSE.push({
  key: "e-modeling",
  title: "Modélisation : conventions, annotations, Fluent API",
  summary: "Contrôler précisément le schéma SQL généré par EF Core : conventions, attributs, Fluent API, classes de configuration, clés composites, valeurs par défaut, colonnes calculées et conversions de valeurs.",
  objectives: [
    "Connaître les conventions d'EF Core et le schéma qu'elles produisent",
    "Choisir entre data annotations et Fluent API",
    "Organiser la configuration avec IEntityTypeConfiguration et ApplyConfigurationsFromAssembly",
    "Configurer clés composites, index uniques, valeurs par défaut et colonnes calculées",
    "Stocker un enum en texte et un value object avec HasConversion",
    "Définir des conventions globales avec ConfigureConventions"
  ],
  lesson: `
<h3>Le modèle : la carte entre tes classes et tes tables</h3>
<p>Au démarrage, EF Core construit un <strong>modèle</strong> : pour chaque entité, sa table, ses colonnes, leurs types SQL, les clés, les index et les relations. Ce modèle sert à générer le SQL des requêtes et le schéma des migrations. Il est construit à partir de trois sources, appliquées dans cet ordre (la dernière gagne) :</p>
<ol>
<li>les <strong>conventions</strong> : les règles par défaut ;</li>
<li>les <strong>data annotations</strong> : des attributs posés sur les classes ;</li>
<li>la <strong>Fluent API</strong> : du code dans <code>OnModelCreating</code>.</li>
</ol>
<p>Le but de cette journée : ne plus subir le schéma généré, mais le décider. Une base de production mal typée (des <code>nvarchar(max)</code> partout, des <code>decimal(18,2)</code> implicites, aucun index) est coûteuse à corriger une fois remplie.</p>

<h3>Les conventions</h3>
<ul>
<li>Une propriété nommée <code>Id</code> ou <code>&lt;Type&gt;Id</code> devient la <strong>clé primaire</strong>. Si elle est de type <code>int</code> ou <code>long</code>, elle devient une colonne <code>IDENTITY</code>.</li>
<li>Le nom de la table est le nom du <code>DbSet</code> (<code>Products</code>), ou à défaut le nom de la classe.</li>
<li>Les types <strong>non nullables</strong> (<code>int</code>, <code>decimal</code>, et <code>string</code> quand les nullable reference types sont activés) deviennent <code>NOT NULL</code>. <code>string?</code> et <code>int?</code> deviennent <code>NULL</code>.</li>
<li>Une <code>string</code> sans longueur devient <code>nvarchar(max)</code>, sauf si elle fait partie d'une clé ou d'un index, où elle devient <code>nvarchar(450)</code>.</li>
<li>Une propriété nommée <code>&lt;Navigation&gt;Id</code> à côté d'une navigation devient une <strong>clé étrangère</strong> (on le verra au jour 29).</li>
</ul>

<table>
<thead><tr><th>Type C#</th><th>Type SQL Server par défaut</th><th>À configurer ?</th></tr></thead>
<tbody>
<tr><td><code>int</code> / <code>long</code></td><td><code>int</code> / <code>bigint</code></td><td>Non</td></tr>
<tr><td><code>string</code></td><td><code>nvarchar(max)</code></td><td>Oui : une longueur maximale</td></tr>
<tr><td><code>decimal</code></td><td><code>decimal(18,2)</code> avec un avertissement</td><td>Oui : toujours la précision</td></tr>
<tr><td><code>bool</code></td><td><code>bit</code></td><td>Non</td></tr>
<tr><td><code>DateTime</code></td><td><code>datetime2</code></td><td>Préfère <code>DateTimeOffset</code> ou des valeurs UTC</td></tr>
<tr><td><code>DateTimeOffset</code></td><td><code>datetimeoffset</code></td><td>Non</td></tr>
<tr><td><code>DateOnly</code> / <code>TimeOnly</code></td><td><code>date</code> / <code>time</code></td><td>Non</td></tr>
<tr><td><code>Guid</code></td><td><code>uniqueidentifier</code></td><td>Attention à la fragmentation si c'est une clé clustered</td></tr>
<tr><td><code>enum</code></td><td><code>int</code></td><td>Souvent stocké en texte pour la lisibilité</td></tr>
<tr><td><code>byte[]</code></td><td><code>varbinary(max)</code></td><td>Selon l'usage</td></tr>
</tbody>
</table>

<h3>Data annotations</h3>
<p>Les attributs se posent directement sur l'entité : <code>[Key]</code>, <code>[Required]</code>, <code>[MaxLength(200)]</code>, <code>[Column("product_name", TypeName = "varchar(200)")]</code>, <code>[Precision(18, 2)]</code>, <code>[Table("Products", Schema = "catalog")]</code>, et sur la classe <code>[Index(nameof(Email), IsUnique = true)]</code> ou <code>[PrimaryKey(nameof(OrderId), nameof(ProductId))]</code>.</p>
<p>Avantage : tout est visible au même endroit. Inconvénient : l'entité du domaine dépend d'EF Core, et certaines configurations (conversions, relations complexes, colonnes calculées) n'existent pas en attribut.</p>

<h3>Fluent API</h3>
<p>La Fluent API se trouve dans <code>OnModelCreating</code> et couvre <strong>tout</strong> :</p>
<pre><code>modelBuilder.Entity&lt;Product&gt;(b =&gt;
{
    b.ToTable("Products", "catalog");
    b.HasKey(p =&gt; p.Id);
    b.Property(p =&gt; p.Name).IsRequired().HasMaxLength(200);
    b.Property(p =&gt; p.Price).HasPrecision(18, 2);
    b.HasIndex(p =&gt; p.Sku).IsUnique();
});</code></pre>
<p>Elle garde les entités propres (aucun attribut EF), ce qui compte quand tu fais du DDD et de la Clean Architecture au module suivant. C'est le choix recommandé pour un projet d'entreprise. Les annotations restent acceptables pour un petit projet ou pour des DTO.</p>

<table>
<thead><tr><th>Besoin</th><th>Annotation</th><th>Fluent API</th></tr></thead>
<tbody>
<tr><td>Clé primaire</td><td><code>[Key]</code></td><td><code>HasKey(x =&gt; x.Id)</code></td></tr>
<tr><td>Clé composite</td><td><code>[PrimaryKey(nameof(A), nameof(B))]</code></td><td><code>HasKey(x =&gt; new { x.A, x.B })</code></td></tr>
<tr><td>Obligatoire</td><td><code>[Required]</code></td><td><code>IsRequired()</code></td></tr>
<tr><td>Longueur</td><td><code>[MaxLength(200)]</code></td><td><code>HasMaxLength(200)</code></td></tr>
<tr><td>Précision</td><td><code>[Precision(18, 2)]</code></td><td><code>HasPrecision(18, 2)</code></td></tr>
<tr><td>Type SQL exact</td><td><code>[Column(TypeName = "varchar(20)")]</code></td><td><code>HasColumnType("varchar(20)")</code></td></tr>
<tr><td>Index unique</td><td><code>[Index(nameof(Sku), IsUnique = true)]</code></td><td><code>HasIndex(x =&gt; x.Sku).IsUnique()</code></td></tr>
<tr><td>Ignorer une propriété</td><td><code>[NotMapped]</code></td><td><code>Ignore(x =&gt; x.Temp)</code></td></tr>
<tr><td>Valeur par défaut SQL</td><td>non</td><td><code>HasDefaultValueSql("SYSUTCDATETIME()")</code></td></tr>
<tr><td>Colonne calculée</td><td>non</td><td><code>HasComputedColumnSql("...")</code></td></tr>
<tr><td>Conversion</td><td>non</td><td><code>HasConversion(...)</code></td></tr>
</tbody>
</table>

<h3>Organiser la configuration</h3>
<p>Avec vingt entités, <code>OnModelCreating</code> devient illisible. La bonne pratique : une classe par entité qui implémente <code>IEntityTypeConfiguration&lt;T&gt;</code>, et une seule ligne dans le contexte :</p>
<pre><code>modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderFlowDbContext).Assembly);</code></pre>
<p>EF Core trouve toutes les classes de configuration de l'assembly et les applique.</p>

<h3>Clés, index, valeurs par défaut, colonnes calculées</h3>
<ul>
<li><strong>Clé composite</strong> : pour une table de jointure ou une table d'historique, <code>HasKey(x =&gt; new { x.OrderId, x.ProductId })</code>.</li>
<li><strong>Index</strong> : <code>HasIndex(p =&gt; p.Sku).IsUnique()</code> crée un index unique. Un index peut couvrir plusieurs colonnes (<code>HasIndex(o =&gt; new { o.CustomerId, o.CreatedAt })</code>), être filtré (<code>HasFilter("[DeletedAt] IS NULL")</code>) ou inclure des colonnes (<code>IncludeProperties</code>, propre à SQL Server).</li>
<li><strong>Valeur par défaut</strong> : <code>HasDefaultValue(OrderStatus.Pending)</code> pour une constante, <code>HasDefaultValueSql("SYSUTCDATETIME()")</code> pour une expression calculée par SQL Server. La valeur n'est utilisée que si EF n'envoie pas la colonne.</li>
<li><strong>Colonne calculée</strong> : <code>HasComputedColumnSql("[Quantity] * [UnitPrice]", stored: true)</code>. SQL Server calcule la valeur, EF la relit après l'insertion. <code>stored: true</code> la persiste physiquement, ce qui permet de l'indexer.</li>
</ul>

<h3>Conversions de valeurs</h3>
<p>Une conversion transforme une valeur C# en valeur SQL et inversement. Deux cas très courants :</p>
<ul>
<li><strong>Enum en texte</strong> : <code>Property(o =&gt; o.Status).HasConversion&lt;string&gt;().HasMaxLength(20)</code>. La base contient <code>'Shipped'</code> au lieu de <code>3</code> : lisible par un humain et robuste si quelqu'un réordonne l'enum. Le coût : un peu plus de place, et renommer une valeur de l'enum demande une migration de données.</li>
<li><strong>Value object</strong> : un type <code>Email</code> ou <code>Sku</code> qui valide son format. <code>HasConversion(e =&gt; e.Value, v =&gt; new Email(v))</code> le stocke dans une simple colonne <code>nvarchar</code>. Pour un value object à plusieurs colonnes (<code>Money</code> avec montant et devise), on utilisera les <em>complex types</em> au jour 34.</li>
</ul>
<p>Attention : une requête qui filtre sur une propriété convertie compare la valeur <em>convertie</em>. <code>Where(c =&gt; c.Email == new Email("a@b.fr"))</code> fonctionne, mais <code>Where(c =&gt; c.Email.Value.Contains("@b"))</code> ne peut pas être traduit en SQL.</p>

<h3>Conventions globales</h3>
<p>Plutôt que de répéter <code>HasPrecision(18, 2)</code> sur chaque <code>decimal</code>, surcharge <code>ConfigureConventions</code> :</p>
<pre><code>protected override void ConfigureConventions(ModelConfigurationBuilder b)
{
    b.Properties&lt;decimal&gt;().HavePrecision(18, 2);
    b.Properties&lt;string&gt;().HaveMaxLength(256);
    b.Properties&lt;OrderStatus&gt;().HaveConversion&lt;string&gt;();
}</code></pre>
<p>Ces règles s'appliquent avant la Fluent API : tu peux toujours les surcharger propriété par propriété (une description longue en <code>HasMaxLength(4000)</code> par exemple).</p>

<h3>Pièges courants</h3>
<ul>
<li>Laisser des <code>nvarchar(max)</code> partout : impossible à indexer, et plus lent.</li>
<li>Utiliser <code>float</code> ou <code>double</code> pour de l'argent : erreurs d'arrondi garanties. Toujours <code>decimal</code> avec une précision explicite.</li>
<li>Oublier qu'un <code>string</code> non nullable devient <code>NOT NULL</code> : une colonne ajoutée à une table déjà remplie a besoin d'une valeur par défaut, sinon la migration échoue.</li>
<li>Mettre un <code>Guid</code> aléatoire en clé clustered sur une grosse table : les insertions se font au hasard dans l'index et le fragmentent. Utilise un <code>int</code>/<code>long</code> identité, ou des GUID séquentiels.</li>
<li>Configurer la même propriété à la fois par attribut et par Fluent API avec des valeurs différentes : la Fluent API gagne, et le lecteur de l'attribut est trompé.</li>
</ul>

<div class="note">Le schéma vit plus longtemps que le code. Un senior relit chaque migration générée comme du SQL écrit à la main : types, longueurs, nullabilité, index. Pose les conventions globales dès le premier jour (précision des <code>decimal</code>, longueur par défaut des chaînes, enums en texte) : c'est beaucoup plus simple que de corriger 40 colonnes en production.</div>
`,
  examples: [
    {
      title: "La même entité avec des annotations",
      code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

[Table("Products", Schema = "catalog")]
[Index(nameof(Sku), IsUnique = true)]
public class Product
{
    [Key]
    public int Id { get; set; }

    [Required, MaxLength(30)]
    [Column(TypeName = "varchar(30)")]   // un SKU n'a pas besoin d'Unicode
    public string Sku { get; set; } = "";

    [Required, MaxLength(200)]
    public string Name { get; set; } = "";

    [Precision(18, 2)]
    public decimal Price { get; set; }

    [NotMapped]                           // non stocké en base
    public bool IsExpensive => Price > 1000;
}

// CREATE TABLE [catalog].[Products] (
//   [Id] int NOT NULL IDENTITY, [Sku] varchar(30) NOT NULL,
//   [Name] nvarchar(200) NOT NULL, [Price] decimal(18,2) NOT NULL,
//   CONSTRAINT [PK_Products] PRIMARY KEY ([Id]));
// CREATE UNIQUE INDEX [IX_Products_Sku] ON [catalog].[Products] ([Sku]);`,
      explain: "Pratique pour un petit projet, mais l'entité dépend maintenant d'EF Core et des annotations de validation."
    },
    {
      title: "La même entité configurée avec IEntityTypeConfiguration",
      code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class Product                     // entité propre, aucun attribut
{
    public int Id { get; set; }
    public required string Sku { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.ToTable("Products", "catalog");
        b.HasKey(p => p.Id);

        b.Property(p => p.Sku).HasMaxLength(30).IsUnicode(false).IsRequired();
        b.Property(p => p.Name).HasMaxLength(200).IsRequired();
        b.Property(p => p.Price).HasPrecision(18, 2);
        b.Property(p => p.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");

        b.HasIndex(p => p.Sku).IsUnique();
    }
}

public class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderFlowDbContext).Assembly);
}`,
      explain: "Une classe de configuration par entité, retrouvée automatiquement. C'est la structure à reprendre dans tous tes projets."
    },
    {
      title: "Clé composite, colonne calculée et enum en texte",
      code: `public enum OrderStatus { Pending, Paid, Shipped, Cancelled }

public class Order
{
    public int Id { get; set; }
    public OrderStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class OrderLine
{
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; private set; }   // calculée par SQL Server
}

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.Property(o => o.Status)
         .HasConversion<string>()                    // 'Pending', 'Paid'...
         .HasMaxLength(20)
         .HasDefaultValue(OrderStatus.Pending);

        b.Property(o => o.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
        b.HasIndex(o => o.CreatedAt);
    }
}

public class OrderLineConfiguration : IEntityTypeConfiguration<OrderLine>
{
    public void Configure(EntityTypeBuilder<OrderLine> b)
    {
        b.HasKey(l => new { l.OrderId, l.ProductId });   // clé composite
        b.Property(l => l.UnitPrice).HasPrecision(18, 2);
        b.Property(l => l.LineTotal)
         .HasPrecision(18, 2)
         .HasComputedColumnSql("[Quantity] * [UnitPrice]", stored: true);
        b.ToTable(t => t.HasCheckConstraint("CK_OrderLines_Quantity", "[Quantity] > 0"));
    }
}

// [Status] nvarchar(20) NOT NULL DEFAULT N'Pending'
// [LineTotal] AS [Quantity] * [UnitPrice] PERSISTED`,
      explain: "La contrainte <code>CHECK</code> protège la donnée même si un autre programme écrit dans la table. La base reste la dernière ligne de défense."
    },
    {
      title: "Value object Email avec HasConversion",
      code: `public sealed record Email
{
    public string Value { get; }

    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.Contains('@'))
            throw new ArgumentException("Email invalide", nameof(value));
        Value = value.Trim().ToLowerInvariant();
    }

    public override string ToString() => Value;
}

public class Customer
{
    public int Id { get; set; }
    public required string FullName { get; set; }
    public required Email Email { get; set; }
}

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> b)
    {
        b.Property(c => c.FullName).HasMaxLength(150);
        b.Property(c => c.Email)
         .HasConversion(email => email.Value, value => new Email(value))
         .HasMaxLength(254);
        b.HasIndex(c => c.Email).IsUnique();
    }
}

// Requête : on compare des Email entre eux, EF compare les chaînes converties
// var c = await db.Customers.SingleOrDefaultAsync(x => x.Email == new Email("Alice@Example.com"));
// SELECT ... WHERE [c].[Email] = @email   (@email = 'alice@example.com')`,
      explain: "L'entité manipule un <code>Email</code> toujours valide, la base stocke une simple colonne <code>nvarchar(254)</code>."
    },
    {
      title: "Conventions globales avec ConfigureConventions",
      code: `public class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void ConfigureConventions(ModelConfigurationBuilder b)
    {
        b.Properties<decimal>().HavePrecision(18, 2);       // tout l'argent en decimal(18,2)
        b.Properties<string>().HaveMaxLength(256);          // plus de nvarchar(max) par accident
        b.Properties<OrderStatus>().HaveConversion<string>().HaveMaxLength(20);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("orderflow");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderFlowDbContext).Assembly);
        // une Fluent API explicite reste prioritaire :
        // b.Property(p => p.Description).HasMaxLength(4000);
    }
}`,
      explain: "Les conventions s'appliquent d'abord, la configuration de chaque entité ensuite. Tu poses la règle générale une fois et tu ne gères que les exceptions."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire le schéma d'une migration",
      prompt: "<p>Sans configuration particulière, écris une entité <code>Supplier</code> avec <code>Id</code>, <code>Name</code> (<code>string</code>), <code>Website</code> (<code>string?</code>), <code>Rating</code> (<code>decimal</code>) et <code>IsActive</code> (<code>bool</code>). Génère une migration et note pour chaque colonne le type SQL et la nullabilité obtenus. Corrige ensuite le modèle en Fluent API : <code>Name</code> en 150 caractères, <code>Website</code> en 300, <code>Rating</code> en <code>decimal(3,1)</code>.</p>",
      hint: "<p>Regarde la méthode <code>Up</code> de la migration générée et l'avertissement affiché pour le <code>decimal</code>. Après correction, supprime la première migration avec <code>dotnet ef migrations remove</code> si elle n'a pas été appliquée.</p>",
      solution: `public class Supplier
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Website { get; set; }
    public decimal Rating { get; set; }
    public bool IsActive { get; set; }
}

// Sans configuration :
// Id      int IDENTITY NOT NULL
// Name    nvarchar(max) NOT NULL
// Website nvarchar(max) NULL
// Rating  decimal(18,2) NOT NULL  + avertissement "No store type was specified for the decimal property"
// IsActive bit NOT NULL

public class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> b)
    {
        b.Property(s => s.Name).HasMaxLength(150);
        b.Property(s => s.Website).HasMaxLength(300);
        b.Property(s => s.Rating).HasPrecision(3, 1);   // de 0.0 à 99.9
        b.Property(s => s.IsActive).HasDefaultValue(true);
    }
}

// dotnet ef migrations remove
// dotnet ef migrations add AddSuppliers
// Name nvarchar(150) NOT NULL, Website nvarchar(300) NULL, Rating decimal(3,1) NOT NULL`
    },
    {
      level: "moyen",
      title: "Value object Sku et index unique",
      prompt: "<p>Crée un value object <code>Sku</code> (record) qui accepte uniquement 3 lettres majuscules, un tiret et 4 chiffres (ex. <code>KEY-0042</code>). Stocke-le dans <code>Product</code> en <code>varchar(8)</code> avec un index unique. Écris une requête qui retrouve un produit par son SKU, et affiche le SQL avec <code>ToQueryString()</code>.</p>",
      hint: "<p>Utilise <code>Regex.IsMatch</code> dans le constructeur du record, <code>HasConversion</code> puis <code>IsUnicode(false).HasMaxLength(8)</code>.</p>",
      solution: `using System.Text.RegularExpressions;

public sealed partial record Sku
{
    public string Value { get; }

    public Sku(string value)
    {
        if (value is null || !SkuRegex().IsMatch(value))
            throw new ArgumentException($"SKU invalide : {value}", nameof(value));
        Value = value;
    }

    [GeneratedRegex("^[A-Z]{3}-[0-9]{4}$")]
    private static partial Regex SkuRegex();

    public override string ToString() => Value;
}

public class Product
{
    public int Id { get; set; }
    public required Sku Sku { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.Property(p => p.Sku)
         .HasConversion(sku => sku.Value, value => new Sku(value))
         .IsUnicode(false)
         .HasMaxLength(8);
        b.HasIndex(p => p.Sku).IsUnique();
    }
}

var wanted = new Sku("KEY-0042");
var query = db.Products.Where(p => p.Sku == wanted);
Console.WriteLine(query.ToQueryString());
// DECLARE @wanted varchar(8) = 'KEY-0042';
// SELECT [p].[Id], [p].[Name], [p].[Price], [p].[Sku] FROM [Products] AS [p] WHERE [p].[Sku] = @wanted
var product = await query.SingleOrDefaultAsync();`
    },
    {
      level: "difficile",
      title: "Configuration complète d'OrderFlow avec conventions globales",
      prompt: "<p>Écris la configuration complète de <code>Customer</code>, <code>Product</code>, <code>Order</code> et <code>OrderLine</code> (sans les relations, elles viennent demain) : une classe <code>IEntityTypeConfiguration</code> par entité, un schéma par défaut <code>orderflow</code>, des conventions globales (decimal 18,2 ; chaînes 256 ; enum <code>OrderStatus</code> en texte), une date de création par défaut côté SQL, une colonne calculée <code>LineTotal</code>, une contrainte <code>CHECK</code> sur la quantité et un index sur <code>(CustomerId, CreatedAt)</code>. Génère la migration et vérifie chaque colonne.</p>",
      hint: "<p>Pour l'index de <code>Order</code>, ajoute la propriété <code>CustomerId</code> dès maintenant (int), la navigation viendra au jour 29. La contrainte se déclare avec <code>b.ToTable(t =&gt; t.HasCheckConstraint(...))</code>.</p>",
      solution: `public enum OrderStatus { Pending, Paid, Shipped, Cancelled }

public class Customer { public int Id { get; set; } public required string FullName { get; set; } public required Email Email { get; set; } public DateTimeOffset CreatedAt { get; set; } }
public class Product  { public int Id { get; set; } public required Sku Sku { get; set; } public required string Name { get; set; } public string? Description { get; set; } public decimal Price { get; set; } public int Stock { get; set; } }
public class Order    { public int Id { get; set; } public int CustomerId { get; set; } public OrderStatus Status { get; set; } public DateTimeOffset CreatedAt { get; set; } }
public class OrderLine { public int OrderId { get; set; } public int ProductId { get; set; } public int Quantity { get; set; } public decimal UnitPrice { get; set; } public decimal LineTotal { get; private set; } }

public class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();

    protected override void ConfigureConventions(ModelConfigurationBuilder b)
    {
        b.Properties<decimal>().HavePrecision(18, 2);
        b.Properties<string>().HaveMaxLength(256);
        b.Properties<OrderStatus>().HaveConversion<string>().HaveMaxLength(20);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("orderflow");
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderFlowDbContext).Assembly);
    }
}

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> b)
    {
        b.Property(c => c.FullName).HasMaxLength(150);
        b.Property(c => c.Email).HasConversion(e => e.Value, v => new Email(v)).HasMaxLength(254);
        b.HasIndex(c => c.Email).IsUnique();
        b.Property(c => c.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
    }
}

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> b)
    {
        b.Property(p => p.Sku).HasConversion(s => s.Value, v => new Sku(v)).IsUnicode(false).HasMaxLength(8);
        b.HasIndex(p => p.Sku).IsUnique();
        b.Property(p => p.Name).HasMaxLength(200);
        b.Property(p => p.Description).HasMaxLength(4000);   // exception à la convention
        b.ToTable(t => t.HasCheckConstraint("CK_Products_Stock", "[Stock] >= 0"));
    }
}

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.Property(o => o.Status).HasDefaultValue(OrderStatus.Pending);
        b.Property(o => o.CreatedAt).HasDefaultValueSql("SYSDATETIMEOFFSET()");
        b.HasIndex(o => new { o.CustomerId, o.CreatedAt });
    }
}

public class OrderLineConfiguration : IEntityTypeConfiguration<OrderLine>
{
    public void Configure(EntityTypeBuilder<OrderLine> b)
    {
        b.HasKey(l => new { l.OrderId, l.ProductId });
        b.Property(l => l.LineTotal).HasComputedColumnSql("[Quantity] * [UnitPrice]", stored: true);
        b.ToTable(t => t.HasCheckConstraint("CK_OrderLines_Quantity", "[Quantity] > 0"));
    }
}

// dotnet ef migrations add FullModel
// Vérifier dans Up() : schéma orderflow, decimal(18,2), nvarchar(256), Status nvarchar(20),
// DEFAULT SYSDATETIMEOFFSET(), LineTotal AS ... PERSISTED, CHECK constraints, index composite.`
    }
  ],
  project: "<p>Dans <code>OrderFlow.Data.Ef</code>, crée un dossier <code>Configurations</code> avec une classe par entité (<code>Customer</code>, <code>Product</code>, <code>Order</code>, <code>OrderLine</code>, <code>Category</code>). Retire tous les attributs des entités, ajoute les conventions globales dans <code>ConfigureConventions</code>, les value objects <code>Email</code> et <code>Sku</code>, l'enum <code>OrderStatus</code> stocké en texte, la colonne calculée <code>LineTotal</code> et les contraintes <code>CHECK</code>. Génère une migration <code>FullModel</code> et relis-la ligne par ligne : compare chaque colonne au schéma SQL que tu avais écrit à la main dans le module SQL Server.</p>",
  resources: [
    { label: "Créer et configurer un modèle", url: "https://learn.microsoft.com/ef/core/modeling/" },
    { label: "Propriétés d'entité", url: "https://learn.microsoft.com/ef/core/modeling/entity-properties" },
    { label: "Index", url: "https://learn.microsoft.com/ef/core/modeling/indexes" },
    { label: "Valeurs générées", url: "https://learn.microsoft.com/ef/core/modeling/generated-properties" },
    { label: "Conversions de valeurs", url: "https://learn.microsoft.com/ef/core/modeling/value-conversions" },
    { label: "Configuration de conventions (bulk configuration)", url: "https://learn.microsoft.com/ef/core/modeling/bulk-configuration" }
  ]
});

/* ============================================================
   Jour 29 — Relations
   ============================================================ */
window.COURSE.push({
  key: "e-relations",
  title: "Relations : un-à-plusieurs, un-à-un, plusieurs-à-plusieurs",
  summary: "Modéliser toutes les relations d'OrderFlow, choisir les comportements de suppression, éviter les pièges des cascades SQL Server et encapsuler les collections avec des backing fields.",
  objectives: [
    "Configurer une relation un-à-plusieurs, un-à-un et plusieurs-à-plusieurs",
    "Comprendre le rôle des navigations et des clés étrangères",
    "Distinguer relation obligatoire et optionnelle",
    "Choisir un OnDelete adapté et éviter l'erreur des chemins de cascade multiples",
    "Modéliser une relation auto-référencée (arborescence de catégories)",
    "Encapsuler une collection avec un backing field"
  ],
  lesson: `
<h3>Vocabulaire</h3>
<p>Une relation relie deux entités par une <strong>clé étrangère</strong> (FK) en base. Côté C#, on la manipule avec des <strong>propriétés de navigation</strong>.</p>
<ul>
<li><strong>Entité principale</strong> (<em>principal</em>) : celle qui est référencée, par exemple <code>Order</code>.</li>
<li><strong>Entité dépendante</strong> (<em>dependent</em>) : celle qui porte la clé étrangère, par exemple <code>OrderLine</code> avec sa colonne <code>OrderId</code>.</li>
<li><strong>Navigation de référence</strong> : une propriété vers une seule entité (<code>OrderLine.Order</code>).</li>
<li><strong>Navigation de collection</strong> : une propriété vers plusieurs entités (<code>Order.Lines</code>).</li>
</ul>
<p>Tu n'es pas obligé d'avoir les navigations des deux côtés, ni même la propriété de clé étrangère : EF Core peut créer une FK <em>fantôme</em> (shadow property). Mais en pratique, <strong>déclare la propriété FK explicitement</strong> (<code>public int OrderId { get; set; }</code>) : tu pourras filtrer dessus et créer une ligne sans charger l'entité principale.</p>

<h3>Un-à-plusieurs</h3>
<p>Le cas le plus fréquent : une commande a plusieurs lignes, un client a plusieurs commandes. Par convention, la présence de <code>Order.Lines</code> (collection) et de <code>OrderLine.OrderId</code> + <code>OrderLine.Order</code> suffit. Mais écris la configuration explicitement, c'est de la documentation :</p>
<pre><code>b.HasMany(o =&gt; o.Lines)
 .WithOne(l =&gt; l.Order)
 .HasForeignKey(l =&gt; l.OrderId)
 .OnDelete(DeleteBehavior.Cascade);</code></pre>
<p>La lecture se fait de gauche à droite : « une commande a plusieurs lignes, chaque ligne a une commande, reliée par <code>OrderId</code> ». La configuration peut se faire de l'un ou de l'autre côté, mais <strong>une seule fois</strong>.</p>

<h3>Obligatoire ou optionnelle</h3>
<p>Une relation est <strong>obligatoire</strong> si la FK n'est pas nullable (<code>int OrderId</code>) : une ligne ne peut pas exister sans commande. Elle est <strong>optionnelle</strong> si la FK est nullable (<code>int? ShipperId</code>) : une commande peut ne pas encore avoir de transporteur. Avec les nullable reference types, la navigation suit la même logique : <code>Order Order</code> (obligatoire) contre <code>Shipper? Shipper</code> (optionnelle).</p>
<p>Astuce pour les navigations obligatoires non initialisées : <code>public Order Order { get; set; } = null!;</code>. EF Core les remplit au chargement, le <code>null!</code> évite l'avertissement du compilateur.</p>

<h3>Un-à-un</h3>
<p>Un client a un profil (préférences, adresse de livraison par défaut). Il faut dire à EF quel côté porte la FK, car il ne peut pas le deviner :</p>
<pre><code>b.HasOne(c =&gt; c.Profile)
 .WithOne(p =&gt; p.Customer)
 .HasForeignKey&lt;CustomerProfile&gt;(p =&gt; p.CustomerId);</code></pre>
<p>EF crée un <strong>index unique</strong> sur <code>CustomerId</code>, ce qui garantit l'unicité côté base. Avant de créer une relation un-à-un, demande-toi si un <em>owned type</em> ou un <em>complex type</em> (jour 34) ne serait pas plus simple : une adresse n'a pas d'identité propre, elle peut vivre dans les colonnes de la table <code>Customers</code>.</p>

<h3>Plusieurs-à-plusieurs</h3>
<p>Un produit appartient à plusieurs catégories, une catégorie contient plusieurs produits. Deux façons :</p>
<ul>
<li><strong>Jointure implicite</strong> : <code>Product.Categories</code> et <code>Category.Products</code>, et EF crée seul la table <code>CategoryProduct</code> avec une clé composite. Tu ajoutes une catégorie avec <code>product.Categories.Add(category)</code>. Simple, mais la table de jointure ne peut rien contenir d'autre.</li>
<li><strong>Entité de jointure explicite</strong> : une classe <code>ProductCategory</code> avec <code>ProductId</code>, <code>CategoryId</code> et des données en plus (<code>IsPrimary</code>, <code>AddedAt</code>, <code>DisplayOrder</code>). C'est deux relations un-à-plusieurs. Dès qu'une donnée appartient au lien lui-même, c'est la seule option.</li>
</ul>
<p>Conseil : si tu hésites, pars sur l'entité explicite. Passer de l'implicite à l'explicite plus tard demande une migration délicate.</p>

<h3>OnDelete : que se passe-t-il quand on supprime le parent ?</h3>
<table>
<thead><tr><th>Comportement</th><th>Effet</th><th>Usage typique</th></tr></thead>
<tbody>
<tr><td><code>Cascade</code></td><td>Supprime les dépendants (en base et en mémoire)</td><td>Les lignes d'une commande : elles n'ont pas de sens seules</td></tr>
<tr><td><code>Restrict</code> / <code>NoAction</code></td><td>Refuse la suppression s'il reste des dépendants</td><td>Un client qui a des commandes : on ne supprime pas l'historique</td></tr>
<tr><td><code>SetNull</code></td><td>Met la FK à <code>NULL</code> (relation optionnelle uniquement)</td><td>Un transporteur supprimé : les commandes restent sans transporteur</td></tr>
<tr><td><code>ClientCascade</code></td><td>Supprime les dépendants <em>chargés en mémoire</em>, mais sans cascade en base</td><td>Contourner l'erreur des chemins multiples de SQL Server</td></tr>
</tbody>
</table>
<p>Par défaut, EF Core met <code>Cascade</code> sur les relations obligatoires et <code>ClientSetNull</code> sur les optionnelles. Ne laisse pas ces choix au hasard : une cascade sur <code>Customer → Orders</code> efface tout l'historique de facturation d'un client d'un seul <code>DELETE</code>.</p>

<h3>Le piège SQL Server : chemins de cascade multiples</h3>
<p>SQL Server refuse une table qui peut être atteinte par <strong>deux chemins de cascade</strong>. Exemple : <code>Customer → Orders → OrderLines</code> et <code>Customer → Reviews</code> où <code>Review</code> référence aussi <code>OrderLine</code>. La migration échoue au moment du <code>database update</code> avec l'erreur 1785 : <em>may cause cycles or multiple cascade paths</em>. La solution : passer l'une des relations en <code>Restrict</code> ou <code>ClientCascade</code>, et gérer cette suppression dans le code. En règle générale, n'utilise la cascade qu'à l'intérieur d'un agrégat (une commande et ses lignes), jamais entre agrégats.</p>

<h3>Relation auto-référencée</h3>
<p>Une catégorie peut avoir une catégorie parente : <code>Informatique → Périphériques → Claviers</code>. L'entité se référence elle-même :</p>
<pre><code>b.HasOne(c =&gt; c.Parent)
 .WithMany(c =&gt; c.Children)
 .HasForeignKey(c =&gt; c.ParentId)
 .OnDelete(DeleteBehavior.Restrict);</code></pre>
<p>La FK est nullable (les catégories racines n'ont pas de parent) et la suppression est en <code>Restrict</code> : SQL Server interdit de toute façon une cascade sur une relation réflexive. Pour charger tout l'arbre, charge toutes les catégories en une requête : EF recolle automatiquement les parents et les enfants en mémoire (c'est le <em>fix-up</em> des navigations).</p>

<h3>Encapsuler une collection avec un backing field</h3>
<p>Si <code>Order.Lines</code> est une <code>List&lt;OrderLine&gt;</code> publique, n'importe quel code peut faire <code>order.Lines.Add(...)</code> sans vérifier le stock ni recalculer le total. En DDD, on expose une collection en lecture seule et une méthode métier :</p>
<pre><code>private readonly List&lt;OrderLine&gt; _lines = [];
public IReadOnlyCollection&lt;OrderLine&gt; Lines =&gt; _lines;

public void AddLine(int productId, int quantity, decimal unitPrice) { ... }</code></pre>
<p>EF Core trouve tout seul le champ <code>_lines</code> par convention (même nom, avec un tiret bas) et l'utilise pour remplir la collection. Tu peux le rendre explicite avec <code>b.Navigation(o =&gt; o.Lines).UsePropertyAccessMode(PropertyAccessMode.Field)</code>.</p>

<h3>Pièges courants</h3>
<ul>
<li>Configurer la même relation des deux côtés avec des options différentes : EF crée parfois deux relations et deux FK (<code>OrderId</code> et <code>OrderId1</code>). Si tu vois une colonne <code>...Id1</code> dans une migration, c'est ce bug.</li>
<li>Oublier qu'une navigation non chargée vaut <code>null</code> (ou une collection vide) : ça ne veut pas dire « pas de données ». On verra le chargement au jour 31.</li>
<li>Créer des références circulaires que <code>System.Text.Json</code> ne peut pas sérialiser : ne renvoie jamais une entité avec ses navigations dans une API, projette vers un DTO.</li>
<li>Mettre une cascade partout « pour simplifier » : c'est la suppression accidentelle de données en production.</li>
</ul>

<div class="note">Les relations dessinent les frontières de tes agrégats. Une cascade ou une collection de navigation, c'est une affirmation : « ces objets vivent et meurent ensemble ». Entre agrégats (<code>Order</code> et <code>Customer</code>), garde seulement la clé étrangère (<code>CustomerId</code>) et une suppression en <code>Restrict</code>. Ton modèle sera plus simple, tes requêtes plus prévisibles, et tu éviteras les chargements involontaires de la moitié de la base.</div>
`,
  examples: [
    {
      title: "Un-à-plusieurs : Order et OrderLines",
      code: `public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }                 // FK vers un autre agrégat
    public List<OrderLine> Lines { get; set; } = [];
}

public class OrderLine
{
    public int Id { get; set; }
    public int OrderId { get; set; }                    // FK explicite, non nullable : obligatoire
    public Order Order { get; set; } = null!;           // navigation de référence
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.HasMany(o => o.Lines)
         .WithOne(l => l.Order)
         .HasForeignKey(l => l.OrderId)
         .OnDelete(DeleteBehavior.Cascade);            // les lignes meurent avec la commande
    }
}

// Insertion d'un graphe : un seul SaveChanges, EF insère la commande,
// récupère son Id, puis insère les lignes avec le bon OrderId.
var order = new Order
{
    CustomerId = 1,
    Lines = [ new OrderLine { ProductId = 3, Quantity = 2, UnitPrice = 49.90m } ]
};
db.Orders.Add(order);
await db.SaveChangesAsync();`,
      explain: "Grâce à la navigation, tu n'as jamais besoin de remplir <code>OrderId</code> à la main : EF le déduit au moment de l'insertion."
    },
    {
      title: "Un-à-un : Customer et CustomerProfile",
      code: `public class Customer
{
    public int Id { get; set; }
    public required string FullName { get; set; }
    public CustomerProfile? Profile { get; set; }       // optionnel côté client
}

public class CustomerProfile
{
    public int Id { get; set; }
    public int CustomerId { get; set; }                 // la FK est ici
    public Customer Customer { get; set; } = null!;
    public string? PreferredLanguage { get; set; }
    public bool AcceptsNewsletter { get; set; }
}

public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> b)
    {
        b.HasOne(c => c.Profile)
         .WithOne(p => p.Customer)
         .HasForeignKey<CustomerProfile>(p => p.CustomerId)
         .OnDelete(DeleteBehavior.Cascade);
    }
}

// CREATE UNIQUE INDEX [IX_CustomerProfiles_CustomerId] ON [CustomerProfiles] ([CustomerId]);`,
      explain: "Le type générique de <code>HasForeignKey&lt;CustomerProfile&gt;</code> indique le côté dépendant. L'index unique empêche deux profils pour le même client."
    },
    {
      title: "Plusieurs-à-plusieurs : implicite puis avec une entité de jointure",
      code: `// 1) Jointure implicite : EF crée la table CategoryProduct
public class Product  { public int Id { get; set; } public required string Name { get; set; } public List<Category> Categories { get; set; } = []; }
public class Category { public int Id { get; set; } public required string Name { get; set; } public List<Product> Products { get; set; } = []; }

// product.Categories.Add(category); await db.SaveChangesAsync();
// INSERT INTO [CategoryProduct] ([CategoriesId], [ProductsId]) VALUES (@p0, @p1);

// 2) Entité de jointure explicite avec des données sur le lien
public class ProductCategory
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public bool IsPrimary { get; set; }                 // donnée propre au lien
    public int DisplayOrder { get; set; }
}

public class ProductCategoryConfiguration : IEntityTypeConfiguration<ProductCategory>
{
    public void Configure(EntityTypeBuilder<ProductCategory> b)
    {
        b.HasKey(pc => new { pc.ProductId, pc.CategoryId });
        b.HasOne(pc => pc.Product).WithMany(p => p.ProductCategories).HasForeignKey(pc => pc.ProductId);
        b.HasOne(pc => pc.Category).WithMany(c => c.ProductCategories).HasForeignKey(pc => pc.CategoryId);
    }
}

// Dans ce cas, Product et Category ont une List<ProductCategory> ProductCategories.
// db.Add(new ProductCategory { ProductId = 3, CategoryId = 7, IsPrimary = true });`,
      explain: "Dès que le lien porte une information (catégorie principale, ordre d'affichage), l'entité explicite devient obligatoire."
    },
    {
      title: "Catégories en arbre et choix des OnDelete",
      code: `public class Category
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public int? ParentId { get; set; }                 // null pour une racine
    public Category? Parent { get; set; }
    public List<Category> Children { get; set; } = [];
}

public class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> b)
    {
        b.HasOne(c => c.Parent)
         .WithMany(c => c.Children)
         .HasForeignKey(c => c.ParentId)
         .OnDelete(DeleteBehavior.Restrict);            // pas de cascade réflexive en SQL Server
    }
}

public class OrderToCustomerConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.HasOne<Customer>()                            // pas de navigation : frontière d'agrégat
         .WithMany()
         .HasForeignKey(o => o.CustomerId)
         .OnDelete(DeleteBehavior.Restrict);            // on ne supprime pas l'historique
    }
}

// Charger tout l'arbre en une requête : EF recolle Parent/Children en mémoire
var all = await db.Categories.ToListAsync();
var roots = all.Where(c => c.ParentId == null).ToList();
void Print(Category c, int depth)
{
    Console.WriteLine(new string(' ', depth * 2) + c.Name);
    foreach (var child in c.Children) Print(child, depth + 1);
}
roots.ForEach(r => Print(r, 0));`,
      explain: "<code>HasOne&lt;Customer&gt;().WithMany()</code> crée la clé étrangère et la contrainte sans aucune navigation : la commande ne charge jamais le client par accident."
    },
    {
      title: "Backing field : une commande qui protège ses lignes",
      code: `public class Order
{
    private readonly List<OrderLine> _lines = [];      // EF remplit ce champ

    public int Id { get; private set; }
    public int CustomerId { get; private set; }
    public IReadOnlyCollection<OrderLine> Lines => _lines;
    public decimal Total => _lines.Sum(l => l.Quantity * l.UnitPrice);

    private Order() { }                                 // pour EF Core

    public Order(int customerId) => CustomerId = customerId;

    public void AddLine(int productId, int quantity, decimal unitPrice)
    {
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity));

        var existing = _lines.FirstOrDefault(l => l.ProductId == productId);
        if (existing is not null) existing.Increase(quantity);
        else _lines.Add(new OrderLine(productId, quantity, unitPrice));
    }
}

public class OrderLine
{
    public int Id { get; private set; }
    public int OrderId { get; private set; }
    public int ProductId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }

    private OrderLine() { }
    internal OrderLine(int productId, int quantity, decimal unitPrice)
        => (ProductId, Quantity, UnitPrice) = (productId, quantity, unitPrice);

    internal void Increase(int quantity) => Quantity += quantity;
}

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.Ignore(o => o.Total);
        b.HasMany(o => o.Lines).WithOne().HasForeignKey(l => l.OrderId).OnDelete(DeleteBehavior.Cascade);
        b.Navigation(o => o.Lines).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}`,
      explain: "Le reste du code ne peut plus faire <code>order.Lines.Add</code> : il doit passer par <code>AddLine</code>, qui applique les règles métier. EF Core, lui, écrit directement dans <code>_lines</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Relation optionnelle Order → Shipper",
      prompt: "<p>Ajoute une entité <code>Shipper</code> (<code>Id</code>, <code>Name</code>) et une relation <strong>optionnelle</strong> depuis <code>Order</code>. Si un transporteur est supprimé, ses commandes doivent rester en base avec <code>ShipperId = NULL</code>. Écris la configuration, génère la migration et vérifie la clause <code>ON DELETE</code>.</p>",
      hint: "<p>FK nullable (<code>int?</code>), navigation nullable, et <code>DeleteBehavior.SetNull</code>.</p>",
      solution: `public class Shipper
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public List<Order> Orders { get; set; } = [];
}

// Dans Order :
// public int? ShipperId { get; set; }
// public Shipper? Shipper { get; set; }

public class ShipperConfiguration : IEntityTypeConfiguration<Shipper>
{
    public void Configure(EntityTypeBuilder<Shipper> b)
    {
        b.Property(s => s.Name).HasMaxLength(100);
        b.HasMany(s => s.Orders)
         .WithOne(o => o.Shipper)
         .HasForeignKey(o => o.ShipperId)
         .IsRequired(false)
         .OnDelete(DeleteBehavior.SetNull);
    }
}

// Migration : FOREIGN KEY ([ShipperId]) REFERENCES [Shippers] ([Id]) ON DELETE SET NULL`
    },
    {
      level: "moyen",
      title: "Passer d'une jointure implicite à une entité explicite",
      prompt: "<p>Tu as une relation plusieurs-à-plusieurs implicite <code>Product ↔ Category</code> en production. Le métier veut maintenant marquer une catégorie « principale » par produit. Crée l'entité <code>ProductCategory</code> avec <code>IsPrimary</code>, configure-la pour qu'elle réutilise la table existante <code>CategoryProduct</code> et ses colonnes, puis écris une requête qui liste chaque produit avec le nom de sa catégorie principale.</p>",
      hint: "<p>Utilise <code>ToTable(\"CategoryProduct\")</code> et <code>HasColumnName</code> pour pointer vers les colonnes existantes <code>ProductsId</code> et <code>CategoriesId</code>. La migration ne doit alors ajouter que la colonne <code>IsPrimary</code>.</p>",
      solution: `public class ProductCategory
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public bool IsPrimary { get; set; }
}

// Product : public List<ProductCategory> ProductCategories { get; set; } = [];
// Category : public List<ProductCategory> ProductCategories { get; set; } = [];
// (on supprime les anciennes collections Product.Categories et Category.Products)

public class ProductCategoryConfiguration : IEntityTypeConfiguration<ProductCategory>
{
    public void Configure(EntityTypeBuilder<ProductCategory> b)
    {
        b.ToTable("CategoryProduct");                                 // table existante
        b.HasKey(pc => new { pc.CategoryId, pc.ProductId });
        b.Property(pc => pc.ProductId).HasColumnName("ProductsId");   // colonnes existantes
        b.Property(pc => pc.CategoryId).HasColumnName("CategoriesId");
        b.Property(pc => pc.IsPrimary).HasDefaultValue(false);

        b.HasOne(pc => pc.Product).WithMany(p => p.ProductCategories).HasForeignKey(pc => pc.ProductId);
        b.HasOne(pc => pc.Category).WithMany(c => c.ProductCategories).HasForeignKey(pc => pc.CategoryId);
    }
}

// dotnet ef migrations add ProductCategoryPayload
// Up() doit seulement contenir : AddColumn<bool>("IsPrimary", "CategoryProduct", defaultValue: false)
// Si la migration veut supprimer et recréer la table, la configuration ne correspond pas encore à l'existant.

var rows = await db.Products
    .Select(p => new
    {
        p.Name,
        PrimaryCategory = p.ProductCategories
            .Where(pc => pc.IsPrimary)
            .Select(pc => pc.Category.Name)
            .FirstOrDefault()
    })
    .ToListAsync();`
    },
    {
      level: "difficile",
      title: "Diagnostiquer une erreur de cascades multiples",
      prompt: "<p>Ajoute une entité <code>Review</code> (avis client) avec une FK obligatoire vers <code>Customer</code> et une FK obligatoire vers <code>Product</code>, en plus de la relation existante <code>Customer → Orders → OrderLines</code> avec cascade. Ajoute ensuite <code>OrderLineId</code> sur <code>Review</code> (l'avis porte sur un achat précis). Lance la migration : explique l'erreur SQL Server obtenue, puis corrige le modèle de deux façons (Restrict et ClientCascade) et explique les conséquences de chacune au moment d'une suppression.</p>",
      hint: "<p>Supprimer un client peut atteindre <code>Reviews</code> par deux chemins : directement, et via <code>Orders → OrderLines</code>. SQL Server refuse ça au moment du <code>CREATE TABLE</code>.</p>",
      solution: `public class Review
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int ProductId { get; set; }
    public int OrderLineId { get; set; }
    public OrderLine OrderLine { get; set; } = null!;
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

// Erreur au database update :
// Introducing FOREIGN KEY constraint 'FK_Reviews_OrderLines_OrderLineId' on table 'Reviews'
// may cause cycles or multiple cascade paths. Specify ON DELETE NO ACTION or ON UPDATE NO ACTION.
// Chemins : Customers -> Reviews  ET  Customers -> Orders -> OrderLines -> Reviews

// Correction 1 : Restrict sur la relation la moins "propriétaire"
public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> b)
    {
        b.Property(r => r.Comment).HasMaxLength(2000);
        b.ToTable(t => t.HasCheckConstraint("CK_Reviews_Rating", "[Rating] BETWEEN 1 AND 5"));

        b.HasOne(r => r.Customer).WithMany().HasForeignKey(r => r.CustomerId)
         .OnDelete(DeleteBehavior.Cascade);
        b.HasOne<Product>().WithMany().HasForeignKey(r => r.ProductId)
         .OnDelete(DeleteBehavior.Restrict);
        b.HasOne(r => r.OrderLine).WithMany().HasForeignKey(r => r.OrderLineId)
         .OnDelete(DeleteBehavior.Restrict);
        // Conséquence : supprimer une commande qui a des lignes avec des avis échoue
        // (erreur de contrainte FK). Le code doit d'abord supprimer ou détacher les avis.
    }
}

// Correction 2 : ClientCascade
// b.HasOne(r => r.OrderLine).WithMany().HasForeignKey(r => r.OrderLineId)
//  .OnDelete(DeleteBehavior.ClientCascade);
// Conséquence : en base, la contrainte est NO ACTION. EF supprime les avis
// uniquement s'ils sont CHARGÉS dans le contexte au moment du SaveChanges.
// Si on supprime une commande sans charger les avis, SQL Server lève une erreur FK.
// => Pour supprimer proprement : charger les avis concernés, puis Remove(order).

// Recommandation : les avis sont un autre agrégat que la commande.
// On garde Restrict, et on gère explicitement la suppression dans un service applicatif
// (ou on n'autorise pas la suppression d'une commande payée : on l'annule).`
    }
  ],
  project: "<p>Ajoute toutes les relations d'OrderFlow dans les classes de configuration : <code>Order → OrderLines</code> en cascade avec un backing field <code>_lines</code> et une méthode <code>AddLine</code> ; <code>Order → Customer</code> par clé étrangère seule, en <code>Restrict</code> ; <code>OrderLine → Product</code> en <code>Restrict</code> ; <code>Customer → CustomerProfile</code> en un-à-un ; <code>Product ↔ Category</code> avec une entité de jointure explicite <code>ProductCategory</code> (<code>IsPrimary</code>) ; et l'arborescence <code>Category.Parent/Children</code>. Génère la migration <code>Relations</code>, vérifie chaque clause <code>ON DELETE</code> et écris un petit programme qui crée une commande de trois lignes en un seul <code>SaveChangesAsync</code>.</p>",
  resources: [
    { label: "Relations : vue d'ensemble", url: "https://learn.microsoft.com/ef/core/modeling/relationships" },
    { label: "Relations un-à-plusieurs", url: "https://learn.microsoft.com/ef/core/modeling/relationships/one-to-many" },
    { label: "Relations un-à-un", url: "https://learn.microsoft.com/ef/core/modeling/relationships/one-to-one" },
    { label: "Relations plusieurs-à-plusieurs", url: "https://learn.microsoft.com/ef/core/modeling/relationships/many-to-many" },
    { label: "Suppression en cascade", url: "https://learn.microsoft.com/ef/core/saving/cascade-delete" },
    { label: "Backing fields", url: "https://learn.microsoft.com/ef/core/modeling/backing-field" }
  ]
});

/* ============================================================
   Jour 30 — Migrations en profondeur
   ============================================================ */
window.COURSE.push({
  key: "e-migrations",
  title: "Migrations en profondeur",
  summary: "Maîtriser le cycle de vie des migrations, les modifier sans perdre de données, initialiser la base, et déployer le schéma en production de façon sûre avec des scripts idempotents ou des bundles.",
  objectives: [
    "Utiliser add, update, remove, list et revenir à une migration précédente",
    "Lire et modifier Up/Down, ajouter des scripts de données avec migrationBuilder.Sql",
    "Renommer une colonne sans perte de données",
    "Choisir entre HasData et UseSeeding/UseAsyncSeeding",
    "Générer un script idempotent et un migration bundle",
    "Organiser les migrations : projet séparé, plusieurs DbContext, travail en équipe"
  ],
  lesson: `
<h3>À quoi sert une migration</h3>
<p>Une migration est une <strong>étape versionnée</strong> de l'évolution du schéma. Elle contient deux méthodes : <code>Up</code> applique le changement, <code>Down</code> l'annule. EF Core les génère en comparant ton modèle actuel au <strong>snapshot</strong> (<code>OrderFlowDbContextModelSnapshot.cs</code>), qui décrit le modèle tel qu'il était après la dernière migration.</p>
<p>En base, la table <code>__EFMigrationsHistory</code> liste les migrations déjà appliquées. Au moment d'un <code>update</code>, EF applique dans l'ordre celles qui n'y sont pas encore.</p>
<p>Point essentiel : une migration générée est un <strong>brouillon</strong>. EF ne connaît que les différences de modèle, pas tes intentions. Il ne sait pas qu'un champ a été renommé plutôt que supprimé puis recréé, ni qu'une nouvelle colonne obligatoire doit être remplie à partir des données existantes. Relire chaque migration fait partie du travail.</p>

<h3>Les commandes</h3>
<table>
<thead><tr><th>Commande</th><th>Rôle</th></tr></thead>
<tbody>
<tr><td><code>dotnet ef migrations add AddShipper</code></td><td>Génère une migration depuis les changements du modèle</td></tr>
<tr><td><code>dotnet ef migrations list</code></td><td>Liste les migrations et indique celles qui sont appliquées</td></tr>
<tr><td><code>dotnet ef migrations remove</code></td><td>Supprime la dernière migration <strong>non appliquée</strong> et restaure le snapshot</td></tr>
<tr><td><code>dotnet ef database update</code></td><td>Applique toutes les migrations en attente</td></tr>
<tr><td><code>dotnet ef database update AddCustomers</code></td><td>Revient à (ou avance jusqu'à) cette migration, en exécutant les <code>Down</code> nécessaires</td></tr>
<tr><td><code>dotnet ef database update 0</code></td><td>Annule toutes les migrations</td></tr>
<tr><td><code>dotnet ef migrations script</code></td><td>Génère le SQL des migrations</td></tr>
<tr><td><code>dotnet ef migrations bundle</code></td><td>Génère un exécutable autonome qui applique les migrations</td></tr>
<tr><td><code>dotnet ef migrations has-pending-model-changes</code></td><td>Échoue si le modèle a changé sans migration (utile en CI)</td></tr>
</tbody>
</table>
<p>Règle d'or : <strong>ne modifie et ne supprime jamais une migration déjà appliquée ailleurs que sur ta machine</strong> (base de recette, collègues, production). Si elle est fausse, crée une nouvelle migration qui corrige.</p>

<h3>Lire et modifier une migration</h3>
<p>Le fichier généré utilise le <code>MigrationBuilder</code> : <code>CreateTable</code>, <code>AddColumn</code>, <code>AlterColumn</code>, <code>CreateIndex</code>, <code>DropColumn</code>... Tu peux le modifier librement tant qu'il n'est pas appliqué. Deux modifications fréquentes :</p>
<ul>
<li><strong>Ajouter du SQL de données</strong> avec <code>migrationBuilder.Sql("UPDATE ...")</code>, par exemple pour remplir une nouvelle colonne obligatoire à partir d'une autre.</li>
<li><strong>Corriger une opération mal devinée</strong>, typiquement un renommage.</li>
</ul>

<h3>Renommer sans perdre de données</h3>
<p>Si tu renommes <code>Customer.Name</code> en <code>Customer.FullName</code>, EF détecte souvent le renommage et génère <code>RenameColumn</code>. Mais s'il y a aussi un changement de type ou de longueur, il peut générer <code>DropColumn("Name")</code> + <code>AddColumn("FullName")</code> : la colonne est supprimée avec ses données. Relis toujours, et remplace par :</p>
<pre><code>migrationBuilder.RenameColumn(name: "Name", table: "Customers", newName: "FullName");</code></pre>
<p>Pour un changement plus complexe (scinder <code>FullName</code> en <code>FirstName</code> et <code>LastName</code>), procède en trois temps dans la même migration : ajouter les nouvelles colonnes en nullable, les remplir avec <code>migrationBuilder.Sql</code>, puis les rendre obligatoires et supprimer l'ancienne. Sur un système à forte disponibilité, on étale même ces étapes sur plusieurs déploiements (<em>expand / contract</em>) pour que l'ancienne et la nouvelle version de l'application fonctionnent pendant la transition.</p>

<h3>Initialiser des données (seed)</h3>
<p>Deux mécanismes très différents :</p>
<table>
<thead><tr><th></th><th><code>HasData</code></th><th><code>UseSeeding</code> / <code>UseAsyncSeeding</code> (EF 9+)</th></tr></thead>
<tbody>
<tr><td>Où</td><td>Dans le modèle (<code>OnModelCreating</code>)</td><td>Dans les options du contexte</td></tr>
<tr><td>Quand</td><td>Inclus dans les migrations (<code>InsertData</code>)</td><td>Exécuté après <code>Migrate</code>, <code>EnsureCreated</code> ou <code>database update</code></td></tr>
<tr><td>Clés</td><td>Doivent être fixées à la main</td><td>Générées normalement</td></tr>
<tr><td>Logique</td><td>Aucune (valeurs constantes)</td><td>Tout ce que tu veux : vérifier l'existence, appeler un service</td></tr>
<tr><td>Usage</td><td>Données de référence stables : statuts, pays, catégories racines</td><td>Données de démonstration, comptes initiaux, données dépendantes de l'environnement</td></tr>
</tbody>
</table>
<p>Le code de <code>UseSeeding</code> doit être <strong>idempotent</strong> : il est appelé à chaque migration, donc il vérifie d'abord si les données existent. Microsoft recommande de fournir les deux versions (synchrone et asynchrone), car les outils <code>dotnet ef</code> appellent la version synchrone.</p>

<h3>Déployer en production</h3>
<p>Le réflexe du débutant est d'appeler <code>db.Database.Migrate()</code> au démarrage de l'API. C'est pratique en développement, mais dangereux en production :</p>
<ul>
<li>avec plusieurs instances de l'API, elles tentent toutes de migrer en même temps ;</li>
<li>le compte SQL de l'application doit avoir les droits de modifier le schéma (<code>ALTER</code>, <code>CREATE</code>), ce qui viole le principe du moindre privilège ;</li>
<li>une migration qui échoue à moitié empêche l'application de démarrer, et personne n'a relu le SQL ;</li>
<li>une migration longue (index sur une grosse table) bloque le démarrage et peut déclencher les health checks.</li>
</ul>
<p>Les alternatives :</p>
<ul>
<li><strong>Script idempotent</strong> : <code>dotnet ef migrations script --idempotent -o migrate.sql</code>. Le script vérifie <code>__EFMigrationsHistory</code> avant chaque migration, il peut donc être rejoué sans risque. Il peut être relu par un DBA, joint au ticket de mise en production, et exécuté par la CI avec <code>sqlcmd</code>.</li>
<li><strong>Migration bundle</strong> : <code>dotnet ef migrations bundle</code> produit un exécutable <code>efbundle</code> qui contient les migrations. La CI le construit une fois, puis le pipeline de déploiement l'exécute avec <code>--connection</code> avant de déployer l'application.</li>
</ul>
<p>Depuis EF Core 9, <code>Migrate</code> lève aussi une erreur si le modèle contient des changements non capturés par une migration (avertissement <code>PendingModelChangesWarning</code>). C'est un bon garde-fou : ajoute <code>dotnet ef migrations has-pending-model-changes</code> dans ta CI pour attraper l'oubli avant le déploiement.</p>

<h3>Organiser les migrations</h3>
<ul>
<li><strong>Projet séparé</strong> : en Clean Architecture, le DbContext vit dans <code>Infrastructure</code> et l'API est le projet de démarrage. Les commandes prennent alors <code>--project</code> (où sont les migrations) et <code>--startup-project</code> (qui lit la configuration). Si tu veux les migrations dans un autre assembly que le contexte, utilise <code>UseSqlServer(cs, x =&gt; x.MigrationsAssembly("OrderFlow.Data.Migrations"))</code>.</li>
<li><strong>Plusieurs DbContext</strong> : chaque contexte a ses propres migrations et sa propre table d'historique. Utilise <code>--context</code> et des dossiers distincts (<code>--output-dir Migrations/Orders</code>), voire des schémas différents.</li>
<li><strong>En équipe</strong> : deux développeurs créent une migration le même jour sur deux branches. Au merge, les deux fichiers coexistent sans problème, mais le <strong>snapshot</strong> entre en conflit. La méthode sûre : garder la version de <code>main</code> du snapshot, supprimer ta migration, rebaser, puis la régénérer avec <code>migrations add</code>. Le nouveau fichier contiendra exactement tes changements, au-dessus de ceux de ton collègue.</li>
</ul>

<h3>Pièges courants</h3>
<ul>
<li>Ajouter une colonne non nullable sur une table remplie sans valeur par défaut : la migration échoue en production alors qu'elle passait en développement sur une base vide.</li>
<li>Créer un index sur une très grosse table en heure de pointe : verrous et lenteurs. Planifie, ou utilise <code>migrationBuilder.Sql</code> avec <code>WITH (ONLINE = ON)</code> si ton édition de SQL Server le permet.</li>
<li>Oublier d'écrire le <code>Down</code> quand on ajoute du SQL personnalisé : le retour arrière devient impossible.</li>
<li>Utiliser <code>EnsureCreated()</code> avec des migrations : il crée la base sans historique, et les migrations ne peuvent plus s'appliquer. Réserve-le aux tests.</li>
</ul>

<div class="note">En production, une migration se traite comme une mise en production de code : elle est relue, testée sur une copie de la base de prod, exécutée par la CI avec un compte dédié, et elle a un plan de retour arrière. Le schéma doit rester compatible avec la version précédente de l'application pendant le déploiement : on ajoute d'abord, on supprime plus tard.</div>
`,
  examples: [
    {
      title: "Le cycle de vie complet en ligne de commande",
      code: `# Depuis la racine de la solution : migrations dans Infrastructure, configuration lue dans l'API
dotnet ef migrations add AddShipper --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api

dotnet ef migrations list --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api
# 20261101_InitialCreate
# 20261102_FullModel
# 20261103_Relations
# 20261104_AddShipper (Pending)

# Oups, il manque une propriété : on retire la migration non appliquée
dotnet ef migrations remove --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api

# On corrige le modèle, puis on régénère et on applique
dotnet ef migrations add AddShipper --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api
dotnet ef database update --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api

# Revenir en arrière en local (exécute le Down de AddShipper)
dotnet ef database update Relations --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api`,
      explain: "<code>migrations remove</code> ne fonctionne que sur une migration non appliquée. Si elle l'est déjà en local, reviens d'abord à la précédente avec <code>database update</code>."
    },
    {
      title: "Migration modifiée : nouvelle colonne obligatoire remplie à partir de l'existant",
      code: `using Microsoft.EntityFrameworkCore.Migrations;

public partial class AddOrderNumber : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // 1) Ajouter la colonne en nullable
        migrationBuilder.AddColumn<string>(
            name: "OrderNumber", table: "Orders", schema: "orderflow",
            type: "varchar(20)", nullable: true);

        // 2) Remplir les lignes existantes
        migrationBuilder.Sql("""
            UPDATE orderflow.Orders
            SET OrderNumber = CONCAT('OF-', FORMAT(CreatedAt, 'yyyy'), '-', RIGHT('000000' + CAST(Id AS varchar(10)), 6))
            WHERE OrderNumber IS NULL;
            """);

        // 3) La rendre obligatoire et unique
        migrationBuilder.AlterColumn<string>(
            name: "OrderNumber", table: "Orders", schema: "orderflow",
            type: "varchar(20)", nullable: false,
            oldClrType: typeof(string), oldType: "varchar(20)", oldNullable: true);

        migrationBuilder.CreateIndex(
            name: "IX_Orders_OrderNumber", table: "Orders", schema: "orderflow",
            column: "OrderNumber", unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(name: "IX_Orders_OrderNumber", table: "Orders", schema: "orderflow");
        migrationBuilder.DropColumn(name: "OrderNumber", table: "Orders", schema: "orderflow");
    }
}`,
      explain: "EF avait généré une seule <code>AddColumn</code> non nullable, qui échouait sur une table remplie. Le découpage en trois étapes rend la migration sûre sur des données réelles."
    },
    {
      title: "Renommer et scinder une colonne sans perte",
      code: `public partial class SplitCustomerName : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // EF avait généré DropColumn("FullName") + AddColumn("FirstName") + AddColumn("LastName") :
        // la colonne et ses données auraient disparu. On réécrit à la main.
        migrationBuilder.RenameColumn(name: "FullName", table: "Customers", schema: "orderflow", newName: "LastName");

        migrationBuilder.AddColumn<string>(
            name: "FirstName", table: "Customers", schema: "orderflow",
            type: "nvarchar(75)", maxLength: 75, nullable: false, defaultValue: "");

        // Tout ce qui est avant le premier espace devient le prénom
        migrationBuilder.Sql("""
            UPDATE orderflow.Customers
            SET FirstName = LEFT(LastName, CHARINDEX(' ', LastName) - 1),
                LastName  = SUBSTRING(LastName, CHARINDEX(' ', LastName) + 1, 200)
            WHERE CHARINDEX(' ', LastName) > 0;
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            UPDATE orderflow.Customers
            SET LastName = LTRIM(CONCAT(FirstName, ' ', LastName));
            """);
        migrationBuilder.DropColumn(name: "FirstName", table: "Customers", schema: "orderflow");
        migrationBuilder.RenameColumn(name: "LastName", table: "Customers", schema: "orderflow", newName: "FullName");
    }
}`,
      explain: "Le <code>Down</code> recolle prénom et nom : la migration est réversible. Teste-la dans les deux sens sur une copie de la base avant de la livrer."
    },
    {
      title: "Données de référence avec HasData et seed avec UseAsyncSeeding",
      code: `// 1) Données de référence stables : dans le modèle, clés fixées
public class ShipperConfiguration : IEntityTypeConfiguration<Shipper>
{
    public void Configure(EntityTypeBuilder<Shipper> b)
    {
        b.HasData(
            new Shipper { Id = 1, Name = "Colissimo" },
            new Shipper { Id = 2, Name = "Chronopost" },
            new Shipper { Id = 3, Name = "Retrait en magasin" });
    }
}
// La migration suivante contient : migrationBuilder.InsertData(table: "Shippers", ...)

// 2) Données de démonstration : logique et idempotence, exécutées après la migration
builder.Services.AddDbContext<OrderFlowDbContext>(options => options
    .UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow"))
    .UseSeeding((context, _) =>
    {
        if (!context.Set<Customer>().Any())
        {
            context.Set<Customer>().Add(new Customer { FullName = "Client Démo", Email = new Email("demo@orderflow.local") });
            context.SaveChanges();
        }
    })
    .UseAsyncSeeding(async (context, _, ct) =>
    {
        if (!await context.Set<Customer>().AnyAsync(ct))
        {
            context.Set<Customer>().Add(new Customer { FullName = "Client Démo", Email = new Email("demo@orderflow.local") });
            await context.SaveChangesAsync(ct);
        }
    }));`,
      explain: "<code>HasData</code> fait partie du schéma versionné. <code>UseSeeding</code> est du code exécuté à chaque migration : il doit vérifier l'existence avant d'insérer."
    },
    {
      title: "Déploiement : script idempotent, bundle et garde-fou en CI",
      code: `# Script SQL rejouable, à relire et à joindre à la mise en production
dotnet ef migrations script --idempotent --output artifacts/migrate.sql --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api

# Script entre deux versions précises (ce qui part dans cette livraison)
dotnet ef migrations script Relations AddOrderNumber --output artifacts/release-1.4.sql --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api

# Bundle exécutable pour Linux
dotnet ef migrations bundle --self-contained --runtime linux-x64 --output artifacts/efbundle --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api

# Dans le pipeline de déploiement, avec un compte SQL qui a les droits de schéma
./artifacts/efbundle --connection "$ORDERFLOW_MIGRATIONS_CONNECTION"

# Garde-fou en CI : échoue si quelqu'un a modifié le modèle sans créer de migration
dotnet ef migrations has-pending-model-changes --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api`,
      explain: "L'application tourne avec un compte qui lit et écrit les données. Seul le pipeline possède un compte capable de modifier le schéma."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Aller-retour entre migrations",
      prompt: "<p>Sur ta base locale, ajoute une propriété <code>string? Notes</code> à <code>Order</code>, crée la migration <code>AddOrderNotes</code> et applique-la. Vérifie <code>__EFMigrationsHistory</code> avec une requête SQL. Reviens ensuite à la migration précédente, supprime <code>AddOrderNotes</code> et vérifie que le snapshot ne contient plus <code>Notes</code>.</p>",
      hint: "<p>L'ordre compte : <code>database update &lt;migration précédente&gt;</code> d'abord, <code>migrations remove</code> ensuite.</p>",
      solution: `# 1) Ajouter Notes dans Order, puis :
dotnet ef migrations add AddOrderNotes
dotnet ef database update

# 2) Vérifier dans SQL Server
# SELECT MigrationId, ProductVersion FROM __EFMigrationsHistory ORDER BY MigrationId;
# -> la dernière ligne est ..._AddOrderNotes

# 3) Revenir en arrière (exécute AddOrderNotes.Down : DROP COLUMN Notes)
dotnet ef migrations list
dotnet ef database update Relations

# 4) Supprimer la migration désormais non appliquée
dotnet ef migrations remove

# 5) Retirer la propriété Notes du code (sinon la prochaine migration la recréera)
# Le fichier OrderFlowDbContextModelSnapshot.cs ne contient plus "Notes".`
    },
    {
      level: "moyen",
      title: "Transformer un booléen en enum sans perdre l'information",
      prompt: "<p>La table <code>Products</code> a une colonne <code>bit IsDiscontinued</code>. Le métier veut un statut <code>ProductStatus { Active, OutOfCatalog, Discontinued }</code> stocké en texte. Écris la migration à la main pour : ajouter <code>Status</code>, la remplir à partir de <code>IsDiscontinued</code>, puis supprimer l'ancienne colonne. Écris aussi le <code>Down</code>.</p>",
      hint: "<p>Ajoute <code>Status</code> avec une valeur par défaut <code>'Active'</code>, puis un <code>UPDATE ... WHERE IsDiscontinued = 1</code>. Dans le <code>Down</code>, recrée le booléen et remplis-le à partir du statut.</p>",
      solution: `public enum ProductStatus { Active, OutOfCatalog, Discontinued }

// Product : public ProductStatus Status { get; set; }  (et on supprime IsDiscontinued)
// Configuration : b.Property(p => p.Status).HasConversion<string>().HasMaxLength(20).HasDefaultValue(ProductStatus.Active);

public partial class ProductStatusFromBool : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "Status", table: "Products", schema: "orderflow",
            type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "Active");

        migrationBuilder.Sql("UPDATE orderflow.Products SET Status = 'Discontinued' WHERE IsDiscontinued = 1;");

        migrationBuilder.DropColumn(name: "IsDiscontinued", table: "Products", schema: "orderflow");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "IsDiscontinued", table: "Products", schema: "orderflow",
            type: "bit", nullable: false, defaultValue: false);

        // OutOfCatalog n'existait pas : on le considère comme actif dans l'ancien modèle
        migrationBuilder.Sql("UPDATE orderflow.Products SET IsDiscontinued = 1 WHERE Status = 'Discontinued';");

        migrationBuilder.DropColumn(name: "Status", table: "Products", schema: "orderflow");
    }
}`
    },
    {
      level: "difficile",
      title: "Pipeline de migration sûr",
      prompt: "<p>Écris un workflow GitHub Actions <code>db.yml</code> qui, sur chaque pull request, vérifie qu'aucun changement de modèle n'a été oublié et publie le script idempotent en artefact. Sur la branche <code>main</code>, il construit un bundle et l'applique sur la base de recette avec une chaîne de connexion stockée en secret. Retire ensuite tout appel à <code>Database.Migrate()</code> du <code>Program.cs</code> de l'API, sauf en développement.</p>",
      hint: "<p><code>dotnet tool restore</code> avec un manifeste local (<code>dotnet new tool-manifest</code> puis <code>dotnet tool install dotnet-ef</code>) évite d'installer l'outil globalement en CI. Conditionne les étapes avec <code>if: github.ref == 'refs/heads/main'</code>.</p>",
      solution: `name: db
on:
  pull_request:
  push:
    branches: [main]

jobs:
  migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
      - run: dotnet tool restore
      - run: dotnet build --configuration Release

      - name: Verifier les changements de modele oublies
        run: dotnet ef migrations has-pending-model-changes --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api --no-build --configuration Release

      - name: Generer le script idempotent
        run: dotnet ef migrations script --idempotent --output artifacts/migrate.sql --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api --no-build --configuration Release

      - uses: actions/upload-artifact@v4
        with:
          name: migrate-sql
          path: artifacts/migrate.sql

      - name: Construire le bundle
        if: github.ref == 'refs/heads/main'
        run: dotnet ef migrations bundle --self-contained --runtime linux-x64 --output artifacts/efbundle --project src/OrderFlow.Data.Ef --startup-project src/OrderFlow.Api --configuration Release

      - name: Appliquer sur la recette
        if: github.ref == 'refs/heads/main'
        run: ./artifacts/efbundle --connection "\${{ secrets.ORDERFLOW_RECETTE_MIGRATIONS }}"

# Program.cs de l'API :
# if (app.Environment.IsDevelopment())
# {
#     using var scope = app.Services.CreateScope();
#     var db = scope.ServiceProvider.GetRequiredService<OrderFlowDbContext>();
#     await db.Database.MigrateAsync();   // confort en local uniquement
# }
# En recette et en production, c'est le pipeline qui migre, avec un compte dédié.`
    }
  ],
  project: "<p>Dans OrderFlow : ajoute un manifeste d'outils local avec <code>dotnet-ef</code>, des données de référence <code>HasData</code> pour les transporteurs et les catégories racines, et un <code>UseSeeding</code>/<code>UseAsyncSeeding</code> idempotent qui crée 20 produits et 5 clients de démonstration en développement. Ajoute une colonne <code>OrderNumber</code> obligatoire et unique avec une migration modifiée à la main en trois étapes. Génère enfin le script idempotent et le bundle, et retire <code>Migrate()</code> du démarrage hors développement.</p>",
  resources: [
    { label: "Migrations : vue d'ensemble", url: "https://learn.microsoft.com/ef/core/managing-schemas/migrations/" },
    { label: "Gérer les migrations", url: "https://learn.microsoft.com/ef/core/managing-schemas/migrations/managing" },
    { label: "Appliquer les migrations (scripts, bundles)", url: "https://learn.microsoft.com/ef/core/managing-schemas/migrations/applying" },
    { label: "Migrations dans un projet séparé", url: "https://learn.microsoft.com/ef/core/managing-schemas/migrations/projects" },
    { label: "Migrations en équipe", url: "https://learn.microsoft.com/ef/core/managing-schemas/migrations/teams" },
    { label: "Seeding des données", url: "https://learn.microsoft.com/ef/core/modeling/data-seeding" }
  ]
});

/* ============================================================
   Jour 31 — Requêtes LINQ to Entities
   ============================================================ */
window.COURSE.push({
  key: "e-querying",
  title: "Requêtes LINQ to Entities",
  summary: "Comprendre comment LINQ devient SQL, écrire des requêtes projetées et paginées, maîtriser le chargement des relations et éliminer le problème N+1.",
  objectives: [
    "Expliquer la différence entre IQueryable et IEnumerable et ce qui est exécuté en base",
    "Reconnaître une requête non traduisible et la corriger",
    "Projeter vers des DTO avec Select, la pratique par défaut",
    "Filtrer, trier et paginer correctement",
    "Choisir entre chargement eager, explicite et lazy, et savoir pourquoi éviter le lazy loading",
    "Détecter et corriger un N+1, choisir entre single query et split query"
  ],
  lesson: `
<h3>Comment LINQ devient SQL</h3>
<p>Quand tu écris <code>db.Products.Where(p =&gt; p.Price &gt; 10)</code>, rien n'est exécuté. <code>db.Products</code> est un <code>IQueryable&lt;Product&gt;</code> : chaque opérateur ajoute un nœud à un <strong>arbre d'expressions</strong>, une description de la requête. Ce n'est qu'au moment où tu demandes un résultat (<code>ToListAsync</code>, <code>FirstOrDefaultAsync</code>, <code>CountAsync</code>, <code>await foreach</code>) qu'EF Core parcourt cet arbre, le traduit en SQL, l'exécute et matérialise les résultats.</p>
<p>La lambda <code>p =&gt; p.Price &gt; 10</code> n'est donc jamais exécutée en C# : elle est <em>lue</em> par EF. C'est pour ça que tu ne peux pas y mettre n'importe quoi.</p>
<table>
<thead><tr><th></th><th><code>IQueryable&lt;T&gt;</code></th><th><code>IEnumerable&lt;T&gt;</code></th></tr></thead>
<tbody>
<tr><td>Où s'exécute le filtre</td><td>En base, dans le SQL</td><td>En mémoire, en C#</td></tr>
<tr><td>Ce qui transite sur le réseau</td><td>Uniquement les lignes du résultat</td><td>Toutes les lignes chargées avant le filtre</td></tr>
<tr><td>La lambda est</td><td>Un arbre d'expressions, traduit</td><td>Un delegate, exécuté</td></tr>
</tbody>
</table>
<p>Le piège classique : une méthode de repository qui renvoie <code>IEnumerable&lt;Product&gt;</code> après un <code>ToList()</code>, et un appelant qui fait ensuite <code>.Where(...)</code> : toute la table est chargée, puis filtrée en mémoire.</p>

<h3>Évaluation client et requêtes non traduisibles</h3>
<p>Depuis EF Core 3, la règle est simple : <strong>tout ce qui filtre, trie ou regroupe doit être traduisible en SQL</strong>, sinon EF lève une <code>InvalidOperationException</code> (« The LINQ expression ... could not be translated »). Exemple : <code>Where(p =&gt; IsPromo(p))</code> avec une méthode C# à toi. EF ne sait pas ce que fait <code>IsPromo</code>.</p>
<p>Seule exception autorisée : le <strong><code>Select</code> final</strong>. Si tu appelles une méthode C# dans la projection finale, EF récupère les colonnes nécessaires puis appelle la méthode en mémoire. C'est acceptable pour formater une valeur, pas pour calculer quelque chose qui devrait filtrer.</p>
<p>Ce qui est traduit : les opérateurs de comparaison, <code>&amp;&amp;</code>, <code>||</code>, <code>Contains</code>, <code>StartsWith</code>, <code>EndsWith</code> sur les chaînes (en <code>LIKE</code>), <code>list.Contains(x)</code> (en <code>IN</code> ou via <code>OPENJSON</code>), la plupart des méthodes de <code>Math</code>, des propriétés de dates (<code>.Year</code>, <code>.Month</code>), <code>EF.Functions.Like</code>, <code>EF.Functions.DateDiffDay</code>... En cas de doute : <code>ToQueryString()</code>.</p>

<h3>Projeter avec Select : la pratique par défaut</h3>
<p>Charger une entité complète pour afficher trois champs, c'est lire toutes les colonnes, les copier dans le change tracker, et souvent sérialiser des navigations inutiles. La bonne pratique pour toute lecture : <strong>projeter vers un DTO</strong>.</p>
<pre><code>var items = await db.Orders
    .Where(o =&gt; o.CustomerId == customerId)
    .Select(o =&gt; new OrderSummaryDto(o.Id, o.OrderNumber, o.CreatedAt, o.Lines.Sum(l =&gt; l.Quantity * l.UnitPrice)))
    .ToListAsync();</code></pre>
<p>EF génère un <code>SELECT</code> avec seulement les colonnes utiles, calcule la somme en SQL, et ne suit rien (une projection vers un type non entité n'est jamais trackée). Tu peux traverser les navigations dans un <code>Select</code> <strong>sans <code>Include</code></strong> : EF fait les jointures nécessaires.</p>

<h3>Filtrer, trier, paginer</h3>
<ul>
<li>Compose les filtres conditionnellement : <code>if (search is not null) query = query.Where(...)</code>. La requête reste un <code>IQueryable</code> jusqu'à l'exécution.</li>
<li>Toujours un <code>OrderBy</code> avant <code>Skip</code>/<code>Take</code>, sinon l'ordre n'est pas garanti et des éléments peuvent apparaître sur deux pages. Ajoute un critère unique en dernier (<code>.ThenBy(o =&gt; o.Id)</code>).</li>
<li>La pagination par décalage (<code>Skip(page * size)</code>) devient lente sur des millions de lignes : SQL Server doit parcourir toutes les lignes sautées. Pour un défilement infini, préfère la <strong>pagination par clé</strong> (<em>keyset</em>) : <code>Where(o =&gt; o.Id &gt; lastId).OrderBy(o =&gt; o.Id).Take(20)</code>.</li>
<li>Pour renvoyer le nombre total, fais un <code>CountAsync()</code> séparé sur la même requête filtrée, sans tri.</li>
</ul>

<h3>Charger les relations</h3>
<table>
<thead><tr><th>Stratégie</th><th>Code</th><th>Quand</th></tr></thead>
<tbody>
<tr><td><strong>Eager</strong></td><td><code>Include(o =&gt; o.Lines).ThenInclude(l =&gt; l.Product)</code></td><td>Tu as besoin des entités complètes pour les modifier</td></tr>
<tr><td><strong>Filtered include</strong></td><td><code>Include(o =&gt; o.Lines.Where(l =&gt; l.Quantity &gt; 1))</code></td><td>Seule une partie de la collection est utile</td></tr>
<tr><td><strong>Explicite</strong></td><td><code>await db.Entry(order).Collection(o =&gt; o.Lines).LoadAsync()</code></td><td>Le besoin dépend d'une condition, après coup</td></tr>
<tr><td><strong>Lazy</strong></td><td>Navigations <code>virtual</code> + <code>UseLazyLoadingProxies()</code></td><td>Presque jamais dans une API</td></tr>
<tr><td><strong>Projection</strong></td><td><code>Select(o =&gt; new { o.Id, Lines = o.Lines.Select(...) })</code></td><td>Toutes les lectures : c'est le premier choix</td></tr>
</tbody>
</table>
<p>Pourquoi éviter le lazy loading ? Chaque accès à une navigation non chargée déclenche <strong>une requête SQL invisible</strong> dans le code. Une boucle sur 100 commandes qui lit <code>order.Customer.Name</code> fait 101 requêtes. En plus, ça casse dès que le contexte est libéré, et ça se combine mal avec la sérialisation JSON, qui parcourt toutes les navigations.</p>

<h3>Le problème N+1</h3>
<p>C'est la cause numéro un des API lentes avec un ORM. Le code charge une liste (1 requête), puis, pour chaque élément, va chercher une donnée liée (N requêtes). Il peut venir du lazy loading, mais aussi d'un code tout à fait explicite :</p>
<pre><code>var orders = await db.Orders.ToListAsync();
foreach (var o in orders)
    o.Total = await db.OrderLines.Where(l =&gt; l.OrderId == o.Id).SumAsync(l =&gt; l.Quantity * l.UnitPrice);</code></pre>
<p>En développement, avec 10 commandes, c'est invisible. En production, avec 2 000, c'est 2 001 allers-retours. La correction : <strong>une seule requête</strong>, avec une projection (<code>Select</code> + <code>Sum</code>) ou un <code>Include</code>. Pour le détecter : le log SQL (des dizaines de requêtes identiques à la suite), ou un compteur de commandes SQL dans les tests d'intégration.</p>

<h3>Single query ou split query</h3>
<p>Par défaut, un <code>Include</code> de collection est traduit en <code>LEFT JOIN</code> dans une seule requête. Avec deux collections (<code>Include(o =&gt; o.Lines).Include(o =&gt; o.Payments)</code>), le résultat est un <strong>produit cartésien</strong> : une commande de 50 lignes et 3 paiements renvoie 150 lignes, avec toutes les colonnes de la commande répétées 150 fois. C'est l'<em>explosion cartésienne</em>, et EF affiche un avertissement.</p>
<p><code>AsSplitQuery()</code> envoie une requête par collection (commandes, puis lignes, puis paiements) et recolle les résultats en mémoire. Moins de données dupliquées, mais plusieurs allers-retours, et pas de garantie de cohérence si les données changent entre deux requêtes (sauf transaction). Règle pratique : single query pour une collection, split query pour plusieurs collections volumineuses, et une projection quand c'est possible. Tu peux changer le comportement par défaut avec <code>UseSqlServer(cs, o =&gt; o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))</code>.</p>

<h3>GroupBy et agrégats</h3>
<p>EF traduit <code>GroupBy</code> en <code>GROUP BY</code> quand il est suivi d'agrégats : <code>GroupBy(o =&gt; o.Status).Select(g =&gt; new { g.Key, Count = g.Count(), Total = g.Sum(...) })</code>. En revanche, récupérer les groupes avec leurs éléments (<code>GroupBy(...).ToListAsync()</code>) n'a pas d'équivalent SQL simple.</p>

<h3>Requêtes asynchrones et streaming</h3>
<p>Dans une API, utilise toujours les versions asynchrones (<code>ToListAsync</code>, <code>FirstOrDefaultAsync</code>, <code>SingleOrDefaultAsync</code>, <code>AnyAsync</code>, <code>CountAsync</code>) avec un <code>CancellationToken</code> : si le client annule la requête HTTP, la requête SQL est annulée aussi. Pour un export volumineux, <code>AsAsyncEnumerable()</code> avec <code>await foreach</code> lit les lignes au fil de l'eau au lieu de tout charger en mémoire. Et utilise <code>AnyAsync()</code> plutôt que <code>CountAsync() &gt; 0</code> pour tester l'existence.</p>

<div class="note">Dans une API, la règle par défaut est : <strong>lecture = projection en DTO + AsNoTracking implicite</strong>, <strong>écriture = chargement de l'agrégat avec Include + modification + SaveChanges</strong>. Désactive le lazy loading, active le log SQL en développement, et considère qu'un endpoint qui exécute plus de deux ou trois requêtes SQL mérite une explication en revue de code.</div>
`,
  examples: [
    {
      title: "IQueryable contre IEnumerable : où s'exécute le filtre",
      code: `// MAUVAIS : ToList trop tôt, toute la table est chargée puis filtrée en mémoire
List<Product> all = await db.Products.ToListAsync();
var expensive1 = all.Where(p => p.Price > 500).ToList();
// SQL : SELECT [p].[Id], [p].[Name], ... FROM [Products] AS [p]   (aucun WHERE)

// BON : le filtre fait partie de la requête
var expensive2 = await db.Products.Where(p => p.Price > 500).ToListAsync();
// SQL : SELECT ... FROM [Products] AS [p] WHERE [p].[Price] > 500.0

// Le même piège caché derrière un type de retour
IEnumerable<Product> GetProducts() => db.Products;     // perd IQueryable
var trap = GetProducts().Where(p => p.Price > 500).ToList();  // filtre en mémoire !

// Requête non traduisible : méthode C# dans un Where
static bool IsPromo(Product p) => p.Price < 20 && p.Stock > 100;
try
{
    await db.Products.Where(p => IsPromo(p)).ToListAsync();
}
catch (InvalidOperationException ex)
{
    Console.WriteLine(ex.Message);  // The LINQ expression ... could not be translated
}

// Correction : exprimer la condition directement
var promo = await db.Products.Where(p => p.Price < 20 && p.Stock > 100).ToListAsync();`,
      explain: "Le type de retour compte : un repository qui renvoie <code>IEnumerable</code> force l'appelant à filtrer en mémoire sans qu'il s'en rende compte."
    },
    {
      title: "Recherche paginée projetée en DTO",
      code: `public record ProductListItem(int Id, string Name, decimal Price, string? PrimaryCategory);
public record PagedResult<T>(IReadOnlyList<T> Items, int TotalCount, int Page, int PageSize);

public static async Task<PagedResult<ProductListItem>> SearchProductsAsync(
    OrderFlowDbContext db, string? search, decimal? maxPrice, int page, int pageSize, CancellationToken ct)
{
    pageSize = Math.Clamp(pageSize, 1, 100);            // ne jamais faire confiance au client
    page = Math.Max(page, 1);

    IQueryable<Product> query = db.Products;
    if (!string.IsNullOrWhiteSpace(search))
        query = query.Where(p => p.Name.Contains(search));
    if (maxPrice is not null)
        query = query.Where(p => p.Price <= maxPrice);

    var total = await query.CountAsync(ct);

    var items = await query
        .OrderBy(p => p.Name).ThenBy(p => p.Id)          // ordre stable
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(p => new ProductListItem(
            p.Id,
            p.Name,
            p.Price,
            p.ProductCategories.Where(pc => pc.IsPrimary).Select(pc => pc.Category.Name).FirstOrDefault()))
        .ToListAsync(ct);

    return new PagedResult<ProductListItem>(items, total, page, pageSize);
}

// SQL (simplifié) :
// SELECT [p].[Id], [p].[Name], [p].[Price],
//   (SELECT TOP(1) [c].[Name] FROM [ProductCategories] AS [pc]
//      INNER JOIN [Categories] AS [c] ON [pc].[CategoryId] = [c].[Id]
//      WHERE [p].[Id] = [pc].[ProductId] AND [pc].[IsPrimary] = CAST(1 AS bit))
// FROM [Products] AS [p] WHERE [p].[Name] LIKE @search_contains
// ORDER BY [p].[Name], [p].[Id] OFFSET @p ROWS FETCH NEXT @p0 ROWS ONLY`,
      explain: "Une requête de comptage et une requête de page, toutes deux avec uniquement les colonnes utiles. Aucun <code>Include</code> : la projection fait la jointure."
    },
    {
      title: "Le problème N+1 démontré et corrigé",
      code: `// N+1 : 1 requête pour les commandes + 1 requête par commande pour son client
var orders = await db.Orders.Where(o => o.CreatedAt >= since).ToListAsync();
foreach (var o in orders)
{
    var customer = await db.Customers.FindAsync(o.CustomerId);     // une requête par tour
    Console.WriteLine($"{o.Id} - {customer!.FullName}");
}
// Log : SELECT ... FROM Orders ...  puis 200 fois  SELECT TOP(1) ... FROM Customers WHERE Id = @p

// Correction 1 : une seule requête projetée avec jointure
var report = await db.Orders
    .Where(o => o.CreatedAt >= since)
    .Join(db.Customers, o => o.CustomerId, c => c.Id, (o, c) => new { o.Id, c.FullName })
    .ToListAsync();

// Correction 2 : si Order a une navigation Customer, la projection suffit
// var report = await db.Orders.Where(...).Select(o => new { o.Id, o.Customer.FullName }).ToListAsync();

// Correction 3 : charger les clients nécessaires en une requête, puis assembler en mémoire
var customerIds = orders.Select(o => o.CustomerId).Distinct().ToList();
var customers = await db.Customers
    .Where(c => customerIds.Contains(c.Id))                // WHERE Id IN (...) via OPENJSON
    .ToDictionaryAsync(c => c.Id, c => c.FullName);
foreach (var o in orders)
    Console.WriteLine($"{o.Id} - {customers[o.CustomerId]}");`,
      explain: "Trois corrections, deux requêtes au maximum au lieu de N+1. La troisième est utile quand les données viennent de deux sources différentes."
    },
    {
      title: "Include, filtered include, explicit loading et split query",
      code: `// Eager : charger l'agrégat complet pour le modifier
var order = await db.Orders
    .Include(o => o.Lines)
        .ThenInclude(l => l.Product)
    .SingleAsync(o => o.Id == orderId);
order.AddLine(productId: 5, quantity: 1, unitPrice: 19.90m);
await db.SaveChangesAsync();

// Filtered include : seulement les lignes importantes
var withBigLines = await db.Orders
    .Include(o => o.Lines.Where(l => l.Quantity >= 10).OrderByDescending(l => l.Quantity))
    .Where(o => o.Status == OrderStatus.Paid)
    .ToListAsync();

// Chargement explicite : seulement si nécessaire
var o2 = await db.Orders.SingleAsync(o => o.Id == orderId);
if (o2.Status == OrderStatus.Paid)
{
    await db.Entry(o2).Collection(o => o.Lines).LoadAsync();
    // ou une requête sur la collection : db.Entry(o2).Collection(o => o.Lines).Query().CountAsync()
}

// Deux collections : éviter l'explosion cartésienne
var full = await db.Orders
    .Include(o => o.Lines)
    .Include(o => o.Payments)
    .AsSplitQuery()                 // 3 requêtes au lieu d'un JOIN de 50 x 3 lignes
    .Where(o => o.CustomerId == customerId)
    .ToListAsync();`,
      explain: "<code>Include</code> sert quand tu as besoin des <em>entités</em> (pour les modifier). Pour afficher, une projection est presque toujours meilleure."
    },
    {
      title: "Agrégats, GroupBy et streaming asynchrone",
      code: `// Chiffre d'affaires par statut : GROUP BY traduit en SQL
var byStatus = await db.Orders
    .GroupBy(o => o.Status)
    .Select(g => new
    {
        Status = g.Key,
        Count = g.Count(),
        Revenue = g.SelectMany(o => o.Lines).Sum(l => l.Quantity * l.UnitPrice)
    })
    .ToListAsync();

// Top 5 des produits par quantité vendue sur 30 jours
var since = DateTimeOffset.UtcNow.AddDays(-30);
var top = await db.OrderLines
    .Where(l => db.Orders.Any(o => o.Id == l.OrderId && o.CreatedAt >= since))
    .GroupBy(l => l.ProductId)
    .Select(g => new { ProductId = g.Key, Quantity = g.Sum(l => l.Quantity) })
    .OrderByDescending(x => x.Quantity)
    .Take(5)
    .ToListAsync();

// Existence : AnyAsync et pas CountAsync() > 0
bool hasPending = await db.Orders.AnyAsync(o => o.Status == OrderStatus.Pending);

// Export volumineux en streaming : une ligne à la fois en mémoire
await using var writer = new StreamWriter("orders.csv");
await foreach (var row in db.Orders
    .AsNoTracking()
    .OrderBy(o => o.Id)
    .Select(o => new { o.Id, o.OrderNumber, o.CreatedAt })
    .AsAsyncEnumerable())
{
    await writer.WriteLineAsync($"{row.Id};{row.OrderNumber};{row.CreatedAt:O}");
}`,
      explain: "Les calculs (<code>Count</code>, <code>Sum</code>, <code>GROUP BY</code>) restent en base, et l'export ne charge jamais toutes les commandes en mémoire."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Projection et tri",
      prompt: "<p>Écris une requête qui renvoie les 10 produits les plus chers dont le stock est supérieur à 0, sous la forme d'un record <code>ProductPriceDto(string Name, decimal Price, int Stock)</code>, triés par prix décroissant puis par nom. Affiche le SQL avec <code>ToQueryString()</code> et vérifie qu'il ne lit que trois colonnes.</p>",
      hint: "<p><code>Where</code>, <code>OrderByDescending</code>, <code>ThenBy</code>, <code>Take</code>, puis <code>Select</code>.</p>",
      solution: `public record ProductPriceDto(string Name, decimal Price, int Stock);

var query = db.Products
    .Where(p => p.Stock > 0)
    .OrderByDescending(p => p.Price)
    .ThenBy(p => p.Name)
    .Take(10)
    .Select(p => new ProductPriceDto(p.Name, p.Price, p.Stock));

Console.WriteLine(query.ToQueryString());
// DECLARE @p int = 10;
// SELECT TOP(@p) [p].[Name], [p].[Price], [p].[Stock]
// FROM [Products] AS [p]
// WHERE [p].[Stock] > 0
// ORDER BY [p].[Price] DESC, [p].[Name]

var top10 = await query.ToListAsync();`
    },
    {
      level: "moyen",
      title: "Corriger un endpoint lent",
      prompt: "<p>Cet endpoint renvoie les commandes d'un client avec leur total, mais il est lent en production :</p><pre><code>app.MapGet(\"/customers/{id}/orders\", async (int id, OrderFlowDbContext db) =&gt;\n{\n    var orders = db.Orders.ToList().Where(o =&gt; o.CustomerId == id);\n    var result = new List&lt;object&gt;();\n    foreach (var o in orders)\n    {\n        var lines = db.OrderLines.Where(l =&gt; l.OrderId == o.Id).ToList();\n        result.Add(new { o.Id, o.CreatedAt, Total = lines.Sum(l =&gt; l.Quantity * l.UnitPrice) });\n    }\n    return result;\n});</code></pre><p>Liste tous les problèmes, puis réécris-le en une seule requête SQL asynchrone, annulable, paginée (20 par page) et triée de la plus récente à la plus ancienne.</p>",
      hint: "<p>Il y a au moins cinq problèmes : chargement de toute la table, filtre en mémoire, N+1, appels synchrones, pas de pagination ni d'annulation. La navigation <code>o.Lines</code> peut être utilisée dans le <code>Select</code>.</p>",
      solution: `// Problèmes :
// 1) db.Orders.ToList() charge TOUTES les commandes de la base
// 2) le Where s'exécute en mémoire (IEnumerable)
// 3) une requête OrderLines par commande : N+1
// 4) appels synchrones (ToList) : un thread bloqué pendant chaque aller-retour
// 5) aucune pagination ni annulation, et un type anonyme non documenté dans l'API

public record CustomerOrderDto(int Id, DateTimeOffset CreatedAt, decimal Total, int LineCount);

app.MapGet("/customers/{id:int}/orders", async (int id, int? page, OrderFlowDbContext db, CancellationToken ct) =>
{
    const int pageSize = 20;
    var p = Math.Max(page ?? 1, 1);

    var orders = await db.Orders
        .Where(o => o.CustomerId == id)
        .OrderByDescending(o => o.CreatedAt).ThenByDescending(o => o.Id)
        .Skip((p - 1) * pageSize)
        .Take(pageSize)
        .Select(o => new CustomerOrderDto(
            o.Id,
            o.CreatedAt,
            o.Lines.Sum(l => l.Quantity * l.UnitPrice),
            o.Lines.Count))
        .ToListAsync(ct);

    return Results.Ok(orders);
});

// Une seule requête :
// SELECT [o].[Id], [o].[CreatedAt],
//   (SELECT COALESCE(SUM(CAST([l].[Quantity] AS decimal(18,2)) * [l].[UnitPrice]), 0.0) FROM [OrderLines] AS [l] WHERE [o].[Id] = [l].[OrderId]),
//   (SELECT COUNT(*) FROM [OrderLines] AS [l0] WHERE [o].[Id] = [l0].[OrderId])
// FROM [Orders] AS [o] WHERE [o].[CustomerId] = @id
// ORDER BY [o].[CreatedAt] DESC, [o].[Id] DESC OFFSET @p ROWS FETCH NEXT @p0 ROWS ONLY`
    },
    {
      level: "difficile",
      title: "Détecter les N+1 dans un test",
      prompt: "<p>Écris un <code>DbCommandInterceptor</code> qui compte les commandes SQL exécutées, enregistre-le dans un contexte de test, puis écris un test xUnit qui appelle ton service de rapport « commandes du mois avec client et total » et échoue si plus de 2 commandes SQL sont exécutées. Fais d'abord échouer le test avec une version N+1, puis corrige le service.</p>",
      hint: "<p>Hérite de <code>DbCommandInterceptor</code> et surcharge <code>ReaderExecutingAsync</code> et <code>ReaderExecuting</code>. Ajoute l'intercepteur avec <code>optionsBuilder.AddInterceptors(counter)</code>. Utilise une vraie base SQL Server (Testcontainers ou LocalDB) : le provider InMemory ne génère pas de SQL.</p>",
      solution: `using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Xunit;

public sealed class CommandCounter : DbCommandInterceptor
{
    private int _count;
    public int Count => _count;
    public void Reset() => _count = 0;

    public override InterceptionResult<DbDataReader> ReaderExecuting(
        DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result)
    {
        Interlocked.Increment(ref _count);
        return result;
    }

    public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
        DbCommand command, CommandEventData eventData, InterceptionResult<DbDataReader> result,
        CancellationToken cancellationToken = default)
    {
        Interlocked.Increment(ref _count);
        return ValueTask.FromResult(result);
    }
}

public record MonthlyOrderDto(int OrderId, string CustomerName, decimal Total);

public class ReportService(OrderFlowDbContext db)
{
    // Version corrigée : une seule requête
    public Task<List<MonthlyOrderDto>> MonthlyOrdersAsync(int year, int month, CancellationToken ct = default)
    {
        var from = new DateTimeOffset(year, month, 1, 0, 0, 0, TimeSpan.Zero);
        var to = from.AddMonths(1);
        return db.Orders
            .Where(o => o.CreatedAt >= from && o.CreatedAt < to)
            .Join(db.Customers, o => o.CustomerId, c => c.Id, (o, c) => new { o, c })
            .Select(x => new MonthlyOrderDto(
                x.o.Id,
                x.c.FullName,
                x.o.Lines.Sum(l => l.Quantity * l.UnitPrice)))
            .ToListAsync(ct);
    }

    // Version N+1 qui fait échouer le test :
    // var orders = await db.Orders.Where(...).ToListAsync(ct);
    // foreach (var o in orders) { var c = await db.Customers.FindAsync(o.CustomerId); var total = await db.OrderLines.Where(...).SumAsync(...); }
}

public class ReportServiceTests
{
    // Chaîne d'une base de test (conteneur SQL Server démarré par Testcontainers dans un vrai projet)
    private const string TestConnection = "Server=localhost,1433;Database=OrderFlowTests;User Id=sa;Password=<secret>;TrustServerCertificate=True";

    [Fact]
    public async Task MonthlyOrders_executes_at_most_two_sql_commands()
    {
        var counter = new CommandCounter();
        var options = new DbContextOptionsBuilder<OrderFlowDbContext>()
            .UseSqlServer(TestConnection)
            .AddInterceptors(counter)
            .Options;

        await using var db = new OrderFlowDbContext(options);
        await db.Database.EnsureDeletedAsync();
        await db.Database.EnsureCreatedAsync();          // acceptable pour une base de test jetable
        await SeedAsync(db);                             // 3 clients, 30 commandes de 2 lignes
        counter.Reset();

        var result = await new ReportService(db).MonthlyOrdersAsync(2026, 11);

        Assert.Equal(30, result.Count);
        Assert.True(counter.Count <= 2, $"N+1 détecté : {counter.Count} commandes SQL exécutées");
    }

    private static async Task SeedAsync(OrderFlowDbContext db)
    {
        var customers = Enumerable.Range(1, 3)
            .Select(i => new Customer { FullName = $"Client {i}", Email = new Email($"c{i}@test.local") })
            .ToList();
        db.Customers.AddRange(customers);
        await db.SaveChangesAsync();

        for (var i = 0; i < 30; i++)
        {
            var order = new Order(customers[i % 3].Id) { CreatedAt = new DateTimeOffset(2026, 11, 1 + i % 28, 10, 0, 0, TimeSpan.Zero) };
            order.AddLine(productId: 1, quantity: 2, unitPrice: 10m);
            order.AddLine(productId: 2, quantity: 1, unitPrice: 5m);
            db.Orders.Add(order);
        }
        await db.SaveChangesAsync();
    }
}
// Remarque : les produits 1 et 2 doivent exister si la FK OrderLine -> Product est active ;
// ajoute-les dans SeedAsync dans ton propre projet.`
    }
  ],
  project: "<p>Ajoute un service <code>OrderQueries</code> dans OrderFlow avec quatre requêtes de lecture, toutes projetées en DTO, asynchrones et annulables : la recherche paginée de produits (texte, prix max, catégorie), le détail d'une commande avec ses lignes et le nom des produits, le chiffre d'affaires par mois sur les 12 derniers mois (<code>GroupBy</code>), et l'export CSV des commandes en streaming avec <code>AsAsyncEnumerable</code>. Branche-les sur des endpoints <code>GET</code> de l'API. Ajoute l'intercepteur de comptage de l'exercice difficile dans les tests d'intégration et vérifie qu'aucun endpoint n'exécute plus de deux requêtes SQL.</p>",
  resources: [
    { label: "Interroger des données", url: "https://learn.microsoft.com/ef/core/querying/" },
    { label: "Fonctionnement des requêtes", url: "https://learn.microsoft.com/ef/core/querying/how-query-works" },
    { label: "Évaluation client et serveur", url: "https://learn.microsoft.com/ef/core/querying/client-eval" },
    { label: "Charger les données associées", url: "https://learn.microsoft.com/ef/core/querying/related-data/" },
    { label: "Single query et split query", url: "https://learn.microsoft.com/ef/core/querying/single-split-queries" },
    { label: "Pagination", url: "https://learn.microsoft.com/ef/core/querying/pagination" },
    { label: "Opérateurs de requête complexes (GroupBy, Join)", url: "https://learn.microsoft.com/ef/core/querying/complex-query-operators" }
  ]
});
