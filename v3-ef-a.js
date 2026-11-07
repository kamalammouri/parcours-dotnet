window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 3 - EF Core : les bases
// 3.1 Un ORM, c'est quoi ?
// =====================================================================
window.COURSE.push({
  key: "ef-what",
  title: "Un ORM, c'est quoi ? EF Core face à ADO.NET",
  summary: "Tu sauras expliquer ce que fait un ORM, ce qu'EF Core t'épargne par rapport à ADO.NET et Dapper, et quand le choisir.",
  objectives: [
    "Définir un ORM avec tes propres mots",
    "Comparer ADO.NET, Dapper et EF Core sur un même besoin",
    "Comprendre qu'une requête LINQ devient du SQL",
    "Savoir ce qu'EF Core ne fait pas à ta place"
  ],
  analogy: `<p>Imagine un <strong>interprète</strong> entre toi et un fournisseur qui ne parle que chinois. Tu dis « je veux les produits à plus de 10 € », l'interprète traduit, le fournisseur répond, et l'interprète te rend la réponse en français.</p>
<p>Avec ADO.NET, tu parlais chinois toi-même (le SQL) et tu rangeais toi-même chaque réponse. Avec un ORM comme EF Core, tu parles C#, et l'interprète s'occupe de la traduction dans les deux sens. Mais un bon client sait quand même un peu de chinois, pour vérifier que la traduction est juste.</p>`,
  lesson: `<h3>Deux mondes qui ne parlent pas pareil</h3>
<p>Ton code C# manipule des <strong>objets</strong> : un <code>Product</code> avec des propriétés <code>Name</code> et <code>Price</code>, une <code>List&lt;Product&gt;</code>. Ta base SQL Server manipule des <strong>tables</strong> : des lignes, des colonnes, des clés. Ce ne sont pas les mêmes formes, et il faut sans cesse traduire de l'un vers l'autre.</p>
<p>En partie 2, cette traduction, c'est toi qui la faisais. Avec ADO.NET, tu écrivais le SQL, tu ajoutais les paramètres, puis tu lisais chaque colonne avec <code>reader.GetString(1)</code> pour remplir tes objets. Dapper t'a déjà soulagé de la lecture : il remplit les objets tout seul. Mais le SQL, tu l'écris toujours.</p>

<h3>ORM : Object-Relational Mapper</h3>
<p>Un <strong>ORM</strong> (en français « correspondance objet-relationnel ») est une bibliothèque qui fait le lien entre tes classes et tes tables. Tu décris une fois la correspondance (la classe <code>Product</code> va dans la table <code>Products</code>), puis tu travailles uniquement avec des objets. L'ORM génère le SQL, l'exécute, et te rend des objets.</p>
<p><strong>EF Core</strong> (Entity Framework Core) est l'ORM officiel de .NET, maintenu par Microsoft. Dans ce cours, on utilise EF Core 10 avec SQL Server.</p>
<div class="flow"><span>Ton code LINQ</span><span>EF Core</span><span>Fournisseur SQL Server</span><span>SQL envoyé</span><span>Objets C#</span></div>
<p>Le <strong>fournisseur</strong> (en anglais <em>provider</em>), c'est le traducteur spécialisé pour une base précise. Ici le package <code>Microsoft.EntityFrameworkCore.SqlServer</code> sait écrire du SQL pour SQL Server. Il en existe aussi pour PostgreSQL, SQLite ou MySQL : ton code C# reste presque le même.</p>

<h3>Ce qu'EF Core fait pour toi</h3>
<ul>
<li><strong>Le mapping</strong> : il sait quelle propriété va dans quelle colonne, sans <code>GetInt32(0)</code>.</li>
<li><strong>Les requêtes</strong> : tu écris du LINQ (<code>Where</code>, <code>OrderBy</code>, <code>Select</code>) et il le traduit en SQL paramétré, donc protégé contre l'injection SQL.</li>
<li><strong>Le suivi des changements</strong> : tu modifies un objet chargé, tu appelles <code>SaveChanges()</code>, il écrit l'<code>UPDATE</code> tout seul.</li>
<li><strong>Le schéma</strong> : avec les migrations, il crée et fait évoluer les tables à partir de tes classes.</li>
</ul>

<h3>ADO.NET, Dapper ou EF Core ?</h3>
<table>
<tr><th></th><th>ADO.NET</th><th>Dapper</th><th>EF Core</th></tr>
<tr><td>Qui écrit le SQL ?</td><td>Toi</td><td>Toi</td><td>EF Core (tu peux aussi l'écrire)</td></tr>
<tr><td>Remplir les objets</td><td>À la main</td><td>Automatique</td><td>Automatique</td></tr>
<tr><td>Détecter ce qui a changé</td><td>Non</td><td>Non</td><td>Oui</td></tr>
<tr><td>Créer les tables</td><td>Scripts SQL</td><td>Scripts SQL</td><td>Migrations</td></tr>
<tr><td>Quantité de code</td><td>Beaucoup</td><td>Moyenne</td><td>Peu</td></tr>
<tr><td>Contrôle du SQL</td><td>Total</td><td>Total</td><td>Bon, à surveiller</td></tr>
</table>
<p>Ces outils ne s'excluent pas. Beaucoup d'équipes utilisent EF Core pour 90 % du code (le CRUD de tous les jours) et Dapper pour quelques requêtes de reporting très optimisées. Ils s'appuient tous les deux sur le même <code>Microsoft.Data.SqlClient</code> que tu connais.</p>
<div class="compare"><div><h4>EF Core brille quand…</h4><p>tu as beaucoup d'entités, du CRUD, des règles métier, et un schéma qui évolue avec le code.</p></div><div><h4>Dapper reste utile quand…</h4><p>tu veux un SQL précis, écrit à la main, pour une requête complexe ou très sollicitée.</p></div></div>

<h3>Ce qu'EF Core ne fait pas</h3>
<p>EF Core ne te dispense pas de connaître SQL. Il traduit ce que tu demandes : si tu demandes mal (charger 100 000 lignes pour en afficher 10), il exécutera fidèlement une mauvaise requête. Le bon réflexe, dès le début : <strong>regarder le SQL généré</strong>. La méthode <code>ToQueryString()</code> te le montre sans rien exécuter.</p>
<div class="tip">Une requête LINQ sur un <code>DbSet</code> n'est pas exécutée quand tu l'écris, mais quand tu demandes les résultats (<code>ToList()</code>, <code>First()</code>, <code>Count()</code>, un <code>foreach</code>). C'est la même exécution différée que LINQ sur les collections, sauf qu'ici le travail est fait par SQL Server.</div>
<div class="note">En entretien, la question « EF Core ou Dapper ? » attend une réponse nuancée : EF Core pour la productivité et le suivi des changements, Dapper pour le contrôle fin du SQL, et souvent les deux dans le même projet. Ce qui compte, c'est de savoir lire le SQL que produit l'ORM.</div>`,
  examples: [
    {
      title: "Lire des produits avec EF Core",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using System.Globalization;
using Microsoft.EntityFrameworkCore;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture; // 49.90 partout

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted(); // démo : on repart d'une base vide
db.Database.EnsureCreated(); // crée la base et la table Products

db.Products.Add(new Product { Name = "Clavier", Price = 49.90m });
db.Products.Add(new Product { Name = "Souris", Price = 19.90m });
db.Products.Add(new Product { Name = "Câble USB", Price = 5.50m });
db.SaveChanges(); // un INSERT par produit

// Une requête LINQ, traduite en SQL par EF Core
var products = db.Products
    .Where(p => p.Price > 10)
    .OrderBy(p => p.Name)
    .ToList();

foreach (var p in products)
    Console.WriteLine($"{p.Id} - {p.Name} : {p.Price} €");

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `1 - Clavier : 49.90 €
2 - Souris : 19.90 €`,
      steps: [
        "<code>class OrderFlowDbContext : DbContext</code> : le contexte, c'est ta porte d'entrée vers la base. On le détaille dans la leçon suivante.",
        "<code>db.Database.EnsureDeleted(); db.Database.EnsureCreated();</code> : pour la démo, on supprime puis recrée la base à partir des classes. Attention, <code>EnsureDeleted</code> efface vraiment la base.",
        "<code>db.Products.Add(...)</code> : on ajoute des objets C#, sans écrire une ligne de SQL.",
        "<code>db.SaveChanges();</code> : EF Core génère et exécute les <code>INSERT</code>, puis remplit les <code>Id</code>.",
        "<code>.Where(p =&gt; p.Price &gt; 10).OrderBy(p =&gt; p.Name)</code> : du LINQ classique, traduit en <code>WHERE</code> et <code>ORDER BY</code>.",
        "<code>.ToList()</code> : c'est ici que la requête part vers SQL Server. Le câble à 5.50 est filtré par la base, pas par C#."
      ],
      explain: "Pas de SqlCommand, pas de reader : tu ne manipules que des objets."
    },
    {
      title: "Voir le SQL généré avec ToQueryString",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();

// On construit la requête... sans l'exécuter
decimal minPrice = 10;
var query = db.Products
    .Where(p => p.Price > minPrice)
    .OrderBy(p => p.Name)
    .Select(p => new { p.Name, p.Price });

// ToQueryString() montre le SQL qu'EF Core enverra
Console.WriteLine(query.ToQueryString());

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `DECLARE @minPrice decimal(18,2) = 10.0;
SELECT [p].[Name], [p].[Price]
FROM [Products] AS [p]
WHERE [p].[Price] > @minPrice
ORDER BY [p].[Name]`,
      steps: [
        "<code>var query = db.Products.Where(...)</code> : la variable contient une requête <em>en construction</em> (un <code>IQueryable</code>), rien n'est encore exécuté.",
        "<code>p.Price &gt; minPrice</code> : comme <code>minPrice</code> est une variable, EF Core en fait un <strong>paramètre</strong> SQL <code>@minPrice</code>. Pas de concaténation, donc pas d'injection SQL.",
        "<code>.Select(p =&gt; new { p.Name, p.Price })</code> : on ne demande que deux colonnes. Le SQL ne lit pas <code>Id</code> : c'est une <strong>projection</strong>.",
        "<code>query.ToQueryString()</code> : renvoie le texte SQL que la requête produira, sans contacter la base pour l'exécuter.",
        "<code>DECLARE @minPrice decimal(18,2)</code> : le <code>DECLARE</code> est ajouté seulement pour l'affichage, afin que tu puisses copier-coller le SQL dans un outil."
      ],
      explain: "Prends l'habitude de regarder le SQL de chaque nouvelle requête : c'est le meilleur moyen d'apprendre ce qu'EF Core fait vraiment."
    },
    {
      title: "La même lecture en ADO.NET, pour comparer",
      code: `// La même lecture en ADO.NET (sur la table créée par l'exemple 1)
using System.Globalization;
using Microsoft.Data.SqlClient;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture; // 49.90 partout

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
using var connection = new SqlConnection(cs);
connection.Open();

using var command = new SqlCommand(
    "SELECT Id, Name, Price FROM Products WHERE Price > @min ORDER BY Name", connection);
command.Parameters.AddWithValue("@min", 10m);

using var reader = command.ExecuteReader();
var products = new List<Product>();
while (reader.Read())
{
    // Le mapping colonne -> propriété, c'est toi qui l'écris
    products.Add(new Product
    {
        Id = reader.GetInt32(0),
        Name = reader.GetString(1),
        Price = reader.GetDecimal(2)
    });
}

foreach (var p in products)
    Console.WriteLine($"{p.Id} - {p.Name} : {p.Price} €");

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}`,
      output: `1 - Clavier : 49.90 €
2 - Souris : 19.90 €`,
      steps: [
        "<code>new SqlConnection(cs)</code> puis <code>connection.Open()</code> : avec ADO.NET, tu gères la connexion toi-même. EF Core le fait pour toi.",
        "<code>\"SELECT Id, Name, Price FROM Products WHERE Price &gt; @min ...\"</code> : le SQL est écrit à la main, dans une chaîne que le compilateur ne vérifie pas.",
        "<code>command.Parameters.AddWithValue(\"@min\", 10m)</code> : le paramètre, que EF Core créait tout seul dans l'exemple 2.",
        "<code>reader.GetInt32(0)</code>, <code>reader.GetString(1)</code> : le mapping colonne par colonne. Une colonne déplacée dans le SELECT, et tout casse à l'exécution.",
        "<code>foreach (var p in products)</code> : le résultat est identique à l'exemple 1, pour trois fois plus de code."
      ],
      explain: "Même résultat, même base : EF Core écrit pour toi le SQL et le mapping que tu tapais en partie 2."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire le SQL d'un tri",
      prompt: `<p>Reprends l'exemple 2. Change la requête pour obtenir les produits triés du plus cher au moins cher (<code>OrderByDescending</code>), sans filtre, en ne gardant que le nom. Affiche le SQL avec <code>ToQueryString()</code> et repère le mot SQL qui correspond au tri décroissant.</p>`,
      hint: `<p>Le tri décroissant s'écrit <code>DESC</code> en SQL. Le <code>Select</code> se termine par <code>p =&gt; p.Name</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();

var query = db.Products
    .OrderByDescending(p => p.Price)
    .Select(p => p.Name);

Console.WriteLine(query.ToQueryString());
// SELECT [p].[Name]
// FROM [Products] AS [p]
// ORDER BY [p].[Price] DESC

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`
    },
    {
      level: "moyen",
      title: "Compter côté base",
      prompt: `<p>Toujours sur la table <code>Products</code> de l'exemple 1, écris deux requêtes : le nombre de produits à plus de 10 € (<code>Count</code>) et le prix moyen (<code>Average</code>). Affiche le résultat, puis affiche le SQL de la première avec <code>ToQueryString()</code>. Astuce : <code>Count()</code> exécute tout de suite, il faut donc afficher le SQL de la requête <em>avant</em> le <code>Count</code>.</p>`,
      hint: `<p>Garde <code>var expensive = db.Products.Where(p =&gt; p.Price &gt; 10);</code> dans une variable, puis appelle <code>expensive.Count()</code> et <code>expensive.ToQueryString()</code>.</p>`,
      solution: `using System.Globalization;
using Microsoft.EntityFrameworkCore;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

using var db = new OrderFlowDbContext();

var expensive = db.Products.Where(p => p.Price > 10);
Console.WriteLine($"Produits à plus de 10 € : {expensive.Count()}");      // 2
Console.WriteLine($"Prix moyen : {db.Products.Average(p => p.Price):0.00}"); // 25.10
Console.WriteLine(expensive.ToQueryString());

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`
    },
    {
      level: "difficile",
      title: "Le même besoin avec Dapper",
      prompt: `<p>Tu connais Dapper depuis la partie 2. Réécris la lecture de l'exemple 3 (produits à plus de 10 €, triés par nom) avec Dapper et <code>Query&lt;Product&gt;</code>. Compare ensuite les trois versions : laquelle est la plus courte ? Dans laquelle écris-tu le SQL ?</p>`,
      hint: `<p><code>dotnet add package Dapper</code>, puis <code>connection.Query&lt;Product&gt;(sql, new { min = 10m })</code>. Dapper ouvre la connexion tout seul si elle est fermée.</p>`,
      solution: `// dotnet add package Dapper
using Dapper;
using Microsoft.Data.SqlClient;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
using var connection = new SqlConnection(cs);

var products = connection.Query<Product>(
    "SELECT Id, Name, Price FROM Products WHERE Price > @min ORDER BY Name",
    new { min = 10m });

foreach (var p in products)
    Console.WriteLine($"{p.Id} - {p.Name}");
// Dapper : SQL écrit à la main, mapping automatique.
// EF Core : SQL et mapping automatiques.

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
}`
    }
  ],
  quiz: [
    {
      q: `Que fait un ORM comme EF Core ?`,
      options: ["Il remplace SQL Server par une base en mémoire", "Il fait la correspondance entre tes classes C# et les tables, et génère le SQL", "Il convertit ton code C# en procédures stockées"],
      answer: 1,
      why: `Un ORM traduit dans les deux sens : objets vers lignes (INSERT, UPDATE) et lignes vers objets (SELECT). La base reste une vraie base SQL Server.`
    },
    {
      q: `Quand la requête <code>db.Products.Where(p =&gt; p.Price &gt; 10)</code> est-elle envoyée à SQL Server ?`,
      options: ["Dès qu'on écrit la ligne", "Au prochain <code>SaveChanges()</code>", "Quand on demande les résultats, par exemple avec <code>ToList()</code>"],
      answer: 2,
      why: `C'est l'exécution différée : tant que tu ne consommes pas les résultats, tu ne fais que construire la requête. <code>SaveChanges()</code> sert à écrire, pas à lire.`
    },
    {
      q: `Que montre <code>ToQueryString()</code> ?`,
      options: ["Le SQL que la requête va produire", "Le nombre de lignes renvoyées", "La chaîne de connexion utilisée"],
      answer: 0,
      why: `<code>ToQueryString()</code> renvoie le texte SQL généré, sans exécuter la requête. C'est l'outil n°1 pour vérifier ce que fait EF Core.`
    },
    {
      q: `Quelle affirmation est juste ?`,
      options: ["Avec EF Core, on n'a plus jamais besoin de connaître SQL", "On peut utiliser EF Core et Dapper dans le même projet", "EF Core ne fonctionne qu'avec SQL Server"],
      answer: 1,
      why: `EF Core et Dapper s'appuient sur la même connexion ADO.NET et cohabitent très bien. Connaître SQL reste indispensable pour vérifier le SQL généré, et EF Core a des fournisseurs pour plusieurs bases.`
    }
  ],
  project: `<p><strong>OrderFlow : faire le point avant EF Core.</strong> Dans ton projet OrderFlow de la partie 2, liste les méthodes qui lisent ou écrivent en base (ADO.NET ou Dapper). Pour chacune, note dans un commentaire ce qu'EF Core prendrait en charge : le SQL, le mapping, ou les deux. Garde cette liste : dans les prochaines leçons, tu vas réécrire ces accès avec un <code>OrderFlowDbContext</code>.</p>`,
  resources: [
    { label: "Vue d'ensemble d'Entity Framework Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/" },
    { label: "Fonctionnement des requêtes (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/querying/how-query-works" }
  ]
});

// =====================================================================
// 3.2 Installer EF Core et créer son DbContext
// =====================================================================
window.COURSE.push({
  key: "ef-setup",
  title: "Installer EF Core et créer son DbContext",
  summary: "Tu sauras installer les packages et l'outil dotnet-ef, écrire ton premier DbContext et vérifier qu'il se connecte à SQL Server.",
  objectives: [
    "Installer les bons packages NuGet et l'outil dotnet-ef",
    "Écrire un DbContext avec ses DbSet",
    "Configurer la connexion avec OnConfiguring ou par le constructeur",
    "Vérifier le modèle et le script de création"
  ],
  analogy: `<p>Le <code>DbContext</code>, c'est le <strong>guichet</strong> d'une banque. Tu ne vas pas toi-même dans la salle des coffres : tu t'adresses au guichetier, qui sait où tout est rangé.</p>
<p>Chaque <code>DbSet</code> est un <strong>guichet spécialisé</strong> : un pour les clients, un pour les produits. Et la chaîne de connexion, c'est l'adresse de l'agence où le guichetier va chercher les coffres.</p>`,
  lesson: `<h3>Les trois pièces à installer</h3>
<p>EF Core est découpé en plusieurs packages NuGet, pour que tu n'installes que ce dont tu as besoin. Pour SQL Server, il t'en faut deux, plus un outil en ligne de commande.</p>
<table>
<tr><th>Pièce</th><th>Commande</th><th>Rôle</th></tr>
<tr><td>Fournisseur SQL Server</td><td><code>dotnet add package Microsoft.EntityFrameworkCore.SqlServer</code></td><td>EF Core lui-même + la traduction vers SQL Server</td></tr>
<tr><td>Outils de conception</td><td><code>dotnet add package Microsoft.EntityFrameworkCore.Design</code></td><td>Nécessaire pour créer les migrations</td></tr>
<tr><td>Outil <code>dotnet-ef</code></td><td><code>dotnet tool install --global dotnet-ef</code></td><td>Ajoute les commandes <code>dotnet ef ...</code> au terminal</td></tr>
</table>
<p>Le package SqlServer embarque déjà <code>Microsoft.Data.SqlClient</code> : tu retrouves sous le capot la même connexion qu'en ADO.NET. Vérifie l'outil avec <code>dotnet ef --version</code>. Garde la même version majeure partout (10.x pour les packages et pour l'outil).</p>
<div class="tip">Pour une équipe, préfère un outil <strong>local</strong> : <code>dotnet new tool-manifest</code> puis <code>dotnet tool install dotnet-ef</code>. La version est alors notée dans <code>dotnet-tools.json</code>, versionné avec le code, et chacun lance <code>dotnet tool restore</code>.</div>

<h3>Le DbContext et ses DbSet</h3>
<p>Le <strong>DbContext</strong> est une classe qui hérite de <code>DbContext</code>. Elle représente une session de travail avec la base : elle ouvre les connexions, envoie les requêtes et retient les objets chargés pour savoir ce qui a changé.</p>
<p>Chaque <code>DbSet&lt;T&gt;</code> déclaré dedans représente une table. <code>DbSet&lt;Product&gt; Products</code> veut dire : « la classe <code>Product</code> est une <strong>entité</strong>, rangée dans une table <code>Products</code> ». Une entité, c'est simplement une classe qu'EF Core sait enregistrer en base.</p>
<pre class="diagram">
 OrderFlowDbContext
 +--------------------------+
 | Customers : DbSet        |----&gt; table Customers
 | Products  : DbSet        |----&gt; table Products
 | Database  (connexion)    |----&gt; SQL Server
 +--------------------------+
</pre>
<p>On écrit souvent <code>public DbSet&lt;Product&gt; Products =&gt; Set&lt;Product&gt;();</code>. Cette propriété en lecture seule évite un avertissement du mode nullable, et <code>Set&lt;T&gt;()</code> renvoie le DbSet géré par le contexte.</p>

<h3>Donner la chaîne de connexion</h3>
<p>EF Core doit savoir à quelle base parler. Deux façons de le dire :</p>
<div class="compare"><div><h4>OnConfiguring</h4><p>Le contexte se configure lui-même en redéfinissant <code>OnConfiguring</code>. Simple pour une application console et pour apprendre.</p></div><div><h4>Constructeur avec options</h4><p>Le contexte reçoit un <code>DbContextOptions&lt;OrderFlowDbContext&gt;</code>. C'est ce qu'utilise l'injection de dépendances d'ASP.NET Core (partie 4).</p></div></div>
<p>Dans les deux cas, c'est <code>UseSqlServer(chaîne)</code> qui choisit le fournisseur. Dans ce cours, on écrit <code>Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True</code>. Avec LocalDB, remplace <code>localhost</code> par <code>(localdb)\\MSSQLLocalDB</code> ; avec SQL Server dans Docker, garde <code>localhost</code> et utilise <code>User Id=sa;Password=...</code> à la place de <code>Trusted_Connection=True</code>.</p>
<div class="tip">Ne laisse jamais un vrai mot de passe dans le code. En partie 4, la chaîne de connexion ira dans <code>appsettings.json</code> et dans les secrets utilisateur. Pour l'instant, avec <code>Trusted_Connection=True</code>, il n'y a pas de mot de passe du tout.</div>

<h3>Créer la base sans migrations (pour apprendre)</h3>
<p><code>db.Database.EnsureCreated()</code> crée la base et toutes les tables d'après tes classes, si elle n'existe pas encore. <code>EnsureDeleted()</code> la supprime. C'est parfait pour des démos et des tests, et on l'utilise dans les premières leçons.</p>
<div class="flow"><span>Classes C#</span><span>Modèle EF Core</span><span>EnsureCreated()</span><span>Tables SQL</span></div>
<p>Mais <code>EnsureCreated</code> ne sait pas <strong>faire évoluer</strong> une base existante : si tu ajoutes une propriété, il ne touche à rien. Pour une vraie application, on utilise les <strong>migrations</strong> (leçon 3.6). Et une base créée par <code>EnsureCreated</code> ne peut pas être migrée ensuite : il faudra la supprimer.</p>
<div class="note">Un DbContext est léger et prévu pour une courte durée : une unité de travail (une requête HTTP, une action de l'utilisateur), puis <code>Dispose</code>. Ne le garde pas en champ statique pour toute la vie de l'application, et ne le partage pas entre threads : il n'est pas thread-safe.</div>`,
  examples: [
    {
      title: "Un premier contexte qui se connecte",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();

Console.WriteLine($"Fournisseur : {db.Database.ProviderName}");
Console.WriteLine($"Base supprimée : {db.Database.EnsureDeleted()}");
Console.WriteLine($"Base créée : {db.Database.EnsureCreated()}");
Console.WriteLine($"Déjà là, recréée ? {db.Database.EnsureCreated()}");
Console.WriteLine($"Connexion possible : {db.Database.CanConnect()}");
Console.WriteLine($"Clients en base : {db.Customers.Count()}");

class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `Fournisseur : Microsoft.EntityFrameworkCore.SqlServer
Base supprimée : True
Base créée : True
Déjà là, recréée ? False
Connexion possible : True
Clients en base : 0`,
      steps: [
        "<code>class OrderFlowDbContext : DbContext</code> : notre contexte hérite de la classe de base d'EF Core.",
        "<code>public DbSet&lt;Customer&gt; Customers =&gt; Set&lt;Customer&gt;();</code> : déclare l'entité <code>Customer</code> et la table <code>Customers</code>.",
        "<code>OnConfiguring(...) =&gt; options.UseSqlServer(...)</code> : choisit le fournisseur SQL Server et la base à utiliser.",
        "<code>db.Database.EnsureDeleted()</code> : renvoie <code>True</code> si une base existait et a été supprimée (ici, celle de la leçon précédente).",
        "<code>EnsureCreated()</code> : <code>True</code> la première fois (base créée), <code>False</code> la seconde (elle existe déjà, rien n'est fait).",
        "<code>db.Customers.Count()</code> : une vraie requête <code>SELECT COUNT(*)</code> sur la table vide."
      ],
      explain: "CanConnect() est pratique pour diagnostiquer une chaîne de connexion : il renvoie False au lieu de lever une exception."
    },
    {
      title: "Recevoir ses options par le constructeur",
      code: `using Microsoft.EntityFrameworkCore;

// On prépare les options à l'extérieur du contexte
var options = new DbContextOptionsBuilder<OrderFlowDbContext>()
    .UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True")
    .Options;

using var db = new OrderFlowDbContext(options);

// Le modèle : ce qu'EF Core a compris de tes classes
foreach (var entity in db.Model.GetEntityTypes())
    Console.WriteLine($"{entity.ClrType.Name} -> table {entity.GetTableName()}");

class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

// Le contexte reçoit ses options par le constructeur
class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
}`,
      output: `Customer -> table Customers
Product -> table Products`,
      steps: [
        "<code>new DbContextOptionsBuilder&lt;OrderFlowDbContext&gt;()</code> : un constructeur d'options, typé pour notre contexte.",
        "<code>.UseSqlServer(...).Options</code> : on configure le fournisseur puis on récupère l'objet d'options terminé.",
        "<code>class OrderFlowDbContext(DbContextOptions&lt;OrderFlowDbContext&gt; options) : DbContext(options)</code> : un constructeur principal qui transmet les options à la classe de base. Plus besoin d'<code>OnConfiguring</code>.",
        "<code>db.Model.GetEntityTypes()</code> : le <strong>modèle</strong>, c'est la description que se fait EF Core de tes entités. On peut l'inspecter.",
        "<code>entity.GetTableName()</code> : le nom de table déduit, ici le nom du <code>DbSet</code>."
      ],
      explain: "C'est exactement ce que fera AddDbContext en partie 4 : construire les options et les injecter dans le constructeur, comme un service Angular reçoit HttpClient."
    },
    {
      title: "Lire le script de création",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();

// Le script SQL qu'EF Core exécuterait pour créer la base
Console.WriteLine(db.Database.GenerateCreateScript());

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `CREATE TABLE [Products] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    [Price] decimal(18,2) NOT NULL,
    [Stock] int NOT NULL,
    CONSTRAINT [PK_Products] PRIMARY KEY ([Id])
);
GO`,
      steps: [
        "<code>db.Database.GenerateCreateScript()</code> : renvoie le SQL de création des tables, sans rien exécuter.",
        "<code>[Id] int NOT NULL IDENTITY</code> et <code>PRIMARY KEY ([Id])</code> : la propriété <code>Id</code> devient automatiquement la clé, numérotée par SQL Server.",
        "<code>[Name] nvarchar(max) NOT NULL</code> : un <code>string</code> non nullable donne une colonne obligatoire, sans longueur maximale.",
        "<code>[Price] decimal(18,2)</code> : la précision par défaut pour un <code>decimal</code>. Notre schéma OrderFlow veut <code>decimal(10,2)</code> : on verra comment le dire.",
        "<code>GO</code> : le séparateur de lots de SQL Server, ajouté pour que tu puisses exécuter le script dans un outil."
      ],
      explain: "Ces choix automatiques s'appellent des conventions : c'est le sujet de la leçon 3.4."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Installer l'environnement",
      prompt: `<p>Crée un projet console <code>OrderFlow.Ef</code>, ajoute les deux packages EF Core (SqlServer et Design) et installe l'outil <code>dotnet-ef</code> en local. Vérifie avec <code>dotnet ef --version</code>.</p>`,
      hint: `<p>Un outil local demande d'abord un manifeste : <code>dotnet new tool-manifest</code>.</p>`,
      solution: `dotnet new console -n OrderFlow.Ef
cd OrderFlow.Ef
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Design
dotnet new tool-manifest
dotnet tool install dotnet-ef
dotnet ef --version`
    },
    {
      level: "moyen",
      title: "Un contexte à deux tables",
      prompt: `<p>Dans ce projet, écris les classes <code>Customer</code> (Id, Name, Email, CreatedAt) et <code>Product</code> (Id, Name, Price, Stock), puis un <code>OrderFlowDbContext</code> avec deux <code>DbSet</code>. Appelle <code>EnsureCreated()</code> et affiche le nombre de clients et de produits.</p>`,
      hint: `<p>Utilise <code>OnConfiguring</code> avec <code>UseSqlServer</code>. Les deux <code>Count()</code> doivent afficher 0.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted(); // repartir d'une base neuve avec les deux tables
db.Database.EnsureCreated();
Console.WriteLine($"Clients : {db.Customers.Count()}, produits : {db.Products.Count()}");

class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`
    },
    {
      level: "difficile",
      title: "Diagnostiquer une mauvaise chaîne",
      prompt: `<p>Écris une méthode <code>CheckConnection(string connectionString)</code> qui construit un <code>OrderFlowDbContext</code> avec des options (constructeur, pas <code>OnConfiguring</code>) et affiche « OK » ou « Impossible de se connecter » grâce à <code>CanConnect()</code>. Teste-la avec la bonne chaîne, puis avec <code>Server=serveur-inconnu;...;Connect Timeout=3</code>.</p>`,
      hint: `<p><code>CanConnect()</code> renvoie <code>false</code> au lieu de lever une exception. <code>Connect Timeout=3</code> évite d'attendre 15 secondes.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

CheckConnection("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
CheckConnection("Server=serveur-inconnu;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True;Connect Timeout=3");

void CheckConnection(string connectionString)
{
    var options = new DbContextOptionsBuilder<OrderFlowDbContext>()
        .UseSqlServer(connectionString)
        .Options;
    using var db = new OrderFlowDbContext(options);
    Console.WriteLine(db.Database.CanConnect() ? "OK" : "Impossible de se connecter");
}

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}

class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
}`
    }
  ],
  quiz: [
    {
      q: `Quel package faut-il ajouter pour pouvoir créer des migrations ?`,
      options: ["<code>Microsoft.Data.SqlClient</code>", "<code>Microsoft.EntityFrameworkCore.Design</code>", "<code>Dapper</code>"],
      answer: 1,
      why: `Le package Design contient le code utilisé par <code>dotnet ef</code> au moment de la conception (migrations, scaffolding). <code>Microsoft.Data.SqlClient</code> est déjà inclus par le fournisseur SqlServer.`
    },
    {
      q: `Que représente un <code>DbSet&lt;Product&gt;</code> dans le contexte ?`,
      options: ["Une liste chargée en mémoire de tous les produits", "Une connexion ouverte en permanence", "L'ensemble des produits en base, sur lequel on peut écrire des requêtes"],
      answer: 2,
      why: `Un DbSet ne charge rien tout seul : c'est le point de départ des requêtes LINQ et des ajouts. Le piège est de le voir comme une <code>List</code> déjà remplie.`
    },
    {
      q: `Pourquoi préférer le constructeur avec <code>DbContextOptions</code> dans une API ?`,
      options: ["Parce que l'injection de dépendances fournit les options au contexte", "Parce qu'<code>OnConfiguring</code> est interdit dans ASP.NET Core", "Parce que c'est plus rapide à l'exécution"],
      answer: 0,
      why: `<code>AddDbContext</code> enregistre les options dans le conteneur et les passe au constructeur, comme Angular injecte un service. <code>OnConfiguring</code> reste autorisé, mais moins souple.`
    },
    {
      q: `Ta base a été créée avec <code>EnsureCreated()</code>. Tu ajoutes une propriété <code>Stock</code> et relances. Que se passe-t-il ?`,
      options: ["La colonne est ajoutée automatiquement", "Rien : la base existe déjà, la colonne manque", "La table est recréée avec ses données"],
      answer: 1,
      why: `<code>EnsureCreated</code> ne fait rien si la base existe. Pour faire évoluer un schéma, il faut les migrations.`
    }
  ],
  project: `<p><strong>OrderFlow : le contexte.</strong> Crée un projet <code>OrderFlow.Data</code> (bibliothèque de classes) avec les packages EF Core. Ajoute les classes <code>Customer</code> et <code>Product</code> du schéma OrderFlow (Id, Name, Email, CreatedAt / Id, Name, Price, Stock) et un <code>OrderFlowDbContext</code> avec un constructeur qui reçoit <code>DbContextOptions&lt;OrderFlowDbContext&gt;</code> et deux <code>DbSet</code>. Dans ton application console, construis les options avec ta chaîne de connexion et affiche le résultat de <code>CanConnect()</code>. Pas encore d'<code>EnsureCreated</code> sur la vraie base OrderFlow : on la créera avec une migration.</p>`,
  resources: [
    { label: "Installation d'EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/get-started/overview/install" },
    { label: "Configuration d'un DbContext (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/dbcontext-configuration/" }
  ]
});

// =====================================================================
// 3.3 Le CRUD avec EF Core
// =====================================================================
window.COURSE.push({
  key: "ef-first-crud",
  title: "Ajouter, lire, modifier et supprimer avec EF Core",
  summary: "Tu sauras écrire les quatre opérations CRUD avec EF Core et comprendre le rôle de SaveChanges et du suivi des changements.",
  objectives: [
    "Ajouter des entités avec Add et SaveChanges",
    "Lire par clé avec Find et filtrer avec LINQ",
    "Modifier et supprimer grâce au suivi des changements",
    "Utiliser ExecuteUpdate, ExecuteDelete et AsNoTracking à bon escient"
  ],
  analogy: `<p>Pense à un <strong>panier de courses en ligne</strong>. Tu ajoutes un article, tu en retires un autre, tu changes une quantité : rien n'est encore payé. Tout est noté dans le panier.</p>
<p>Puis tu cliques sur « Valider la commande » : tout part d'un coup. Le DbContext est ce panier, et <code>SaveChanges()</code> est le bouton « Valider ».</p>`,
  lesson: `<h3>CRUD : quatre opérations, un seul bouton</h3>
<p>CRUD veut dire <strong>C</strong>reate, <strong>R</strong>ead, <strong>U</strong>pdate, <strong>D</strong>elete : créer, lire, modifier, supprimer. Avec ADO.NET, chaque opération était une commande SQL exécutée tout de suite. Avec EF Core, la lecture part tout de suite, mais les écritures sont <strong>notées</strong> dans le contexte, puis envoyées ensemble par <code>SaveChanges()</code>.</p>
<p><code>SaveChanges()</code> regroupe toutes les modifications en attente dans une <strong>transaction</strong> : soit tout réussit, soit rien n'est écrit. Il renvoie le nombre de lignes touchées. Sa version asynchrone, <code>SaveChangesAsync()</code>, est celle qu'on utilisera dans une API.</p>

<h3>Le suivi des changements (change tracking)</h3>
<p>Chaque entité connue du contexte a un <strong>état</strong>. C'est grâce à cet état que <code>SaveChanges()</code> sait quel SQL écrire.</p>
<table>
<tr><th>État</th><th>Signification</th><th>SQL au SaveChanges</th></tr>
<tr><td><code>Added</code></td><td>Ajoutée avec <code>Add</code>, pas encore en base</td><td><code>INSERT</code></td></tr>
<tr><td><code>Unchanged</code></td><td>Chargée depuis la base, pas modifiée</td><td>Rien</td></tr>
<tr><td><code>Modified</code></td><td>Chargée puis modifiée</td><td><code>UPDATE</code> des colonnes changées</td></tr>
<tr><td><code>Deleted</code></td><td>Marquée avec <code>Remove</code></td><td><code>DELETE</code></td></tr>
<tr><td><code>Detached</code></td><td>Inconnue du contexte</td><td>Rien</td></tr>
</table>
<div class="flow"><span>Add / modif / Remove</span><span>États notés</span><span>SaveChanges()</span><span>INSERT / UPDATE / DELETE</span><span>Unchanged</span></div>
<p>Quand tu charges une entité, le contexte garde une copie de ses valeurs d'origine (un « instantané »). Au moment de <code>SaveChanges()</code>, il compare les valeurs actuelles avec cet instantané : c'est ce qu'on appelle <strong>détecter les changements</strong>. Tu n'as pas besoin d'appeler <code>Update()</code> sur une entité déjà suivie.</p>

<h3>Créer et lire</h3>
<p>Pour créer, tu fais <code>db.Products.Add(product)</code> (ou <code>AddRange</code> pour plusieurs) puis <code>SaveChanges()</code>. Juste après, EF Core remplit la propriété <code>Id</code> avec la valeur générée par SQL Server : plus besoin du <code>SCOPE_IDENTITY()</code> de la partie 2.</p>
<p>Pour lire, deux familles de méthodes :</p>
<ul>
<li><code>Find(id)</code> cherche par clé primaire. Il regarde d'abord dans le contexte, et ne va en base que si l'entité n'y est pas. Il renvoie <code>null</code> si rien n'est trouvé.</li>
<li>Les méthodes LINQ : <code>Where</code>, <code>OrderBy</code>, <code>Select</code>, puis <code>ToList()</code>, <code>First()</code>, <code>FirstOrDefault()</code>, <code>Single()</code>, <code>Count()</code>, <code>Any()</code>.</li>
</ul>
<div class="tip"><code>First()</code> lève une exception s'il n'y a aucun résultat, <code>FirstOrDefault()</code> renvoie <code>null</code>. <code>Single()</code> lève aussi une exception s'il y a <em>plusieurs</em> résultats : utilise-le quand il ne doit y en avoir qu'un, par exemple une recherche par email unique.</div>

<h3>Modifier et supprimer</h3>
<p>Le schéma classique est « charger, changer, sauvegarder ». Tu charges l'entité, tu modifies ses propriétés comme un objet normal, puis <code>SaveChanges()</code> écrit un <code>UPDATE</code> limité aux colonnes changées. Pour supprimer, tu passes l'entité à <code>Remove</code>, puis <code>SaveChanges()</code>. Après la suppression, l'entité devient <code>Detached</code> : le contexte l'oublie.</p>
<p>Pour des modifications <strong>en masse</strong>, charger chaque ligne serait du gaspillage. <code>ExecuteUpdate</code> et <code>ExecuteDelete</code> envoient directement un seul <code>UPDATE</code> ou <code>DELETE</code> avec un <code>WHERE</code>, sans charger d'entité et <strong>sans passer par SaveChanges</strong> : ils s'exécutent immédiatement.</p>
<div class="compare"><div><h4>Charger + SaveChanges</h4><p>Pour une ou quelques entités, avec de la logique C# entre la lecture et l'écriture. Le contexte reste à jour.</p></div><div><h4>ExecuteUpdate / ExecuteDelete</h4><p>Pour beaucoup de lignes à la fois, avec une règle simple. Une requête SQL, mais le contexte n'est pas mis au courant.</p></div></div>

<h3>Lecture seule : AsNoTracking</h3>
<p>Le suivi des changements a un coût : le contexte garde une copie de chaque entité chargée. Si tu lis seulement pour afficher, ajoute <code>AsNoTracking()</code> à la requête : les entités ne sont pas suivies, la lecture est plus légère. Et si tu fais un <code>Select</code> vers un autre type (une projection), rien n'est suivi non plus.</p>
<div class="note">Le contexte suit tout ce qu'il charge et ne l'oublie qu'à son <code>Dispose</code>. Un contexte qui vit trop longtemps grossit et peut renvoyer des données périmées (<code>Find</code> renvoie la copie en mémoire). D'où la règle pro : un contexte par unité de travail, et <code>AsNoTracking</code> pour les lectures.</div>`,
  examples: [
    {
      title: "Créer puis lire",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted(); // démo : base neuve
db.Database.EnsureCreated();

// CREATE : Add puis SaveChanges
var keyboard = new Product { Name = "Clavier", Price = 49.90m, Stock = 10 };
db.Products.Add(keyboard);
Console.WriteLine($"Id avant SaveChanges : {keyboard.Id}");
db.SaveChanges();
Console.WriteLine($"Id après SaveChanges : {keyboard.Id}");

db.Products.AddRange(
    new Product { Name = "Souris", Price = 19.90m, Stock = 25 },
    new Product { Name = "Écran", Price = 189m, Stock = 3 });
Console.WriteLine($"Lignes insérées : {db.SaveChanges()}");

// READ : par clé, puis avec un filtre
Console.WriteLine($"Find(2) : {db.Products.Find(2)?.Name}");
var lowStock = db.Products.Where(p => p.Stock < 15).Select(p => p.Name).ToList();
Console.WriteLine($"Stock faible : {string.Join(", ", lowStock)}");
Console.WriteLine($"Find(99) est null : {db.Products.Find(99) is null}");

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `Id avant SaveChanges : 0
Id après SaveChanges : 1
Lignes insérées : 2
Find(2) : Souris
Stock faible : Clavier, Écran
Find(99) est null : True`,
      steps: [
        "<code>db.Database.EnsureDeleted(); db.Database.EnsureCreated();</code> : on repart d'une base neuve pour la démo, avec la table <code>Products</code> vide.",
        "<code>db.Products.Add(keyboard);</code> : l'objet passe à l'état <code>Added</code>. Aucun SQL n'est encore parti, l'<code>Id</code> vaut toujours 0.",
        "<code>db.SaveChanges();</code> : l'<code>INSERT</code> est exécuté et EF Core recopie l'identité générée dans <code>keyboard.Id</code>.",
        "<code>AddRange(...)</code> puis <code>db.SaveChanges()</code> : deux ajouts envoyés ensemble, dans une seule transaction. La valeur renvoyée indique 2 lignes.",
        "<code>db.Products.Find(2)</code> : recherche par clé primaire. Ici la souris est déjà suivie par le contexte : pas besoin d'aller en base.",
        "<code>.Where(p =&gt; p.Stock &lt; 15).Select(p =&gt; p.Name).ToList()</code> : une requête SQL qui ne ramène que les noms.",
        "<code>Find(99) is null</code> : pas de produit 99, <code>Find</code> renvoie <code>null</code> au lieu de lever une exception."
      ],
      explain: "Les exemples 2 et 3 réutilisent cette base : lance-les dans l'ordre."
    },
    {
      title: "Modifier et supprimer, en suivant les états",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext(); // base remplie par l'exemple 1

// UPDATE : on charge, on modifie, on sauvegarde
var mouse = db.Products.Single(p => p.Name == "Souris");
Console.WriteLine($"Après chargement : {db.Entry(mouse).State}");
mouse.Stock -= 5;
db.ChangeTracker.DetectChanges(); // pour voir l'état tout de suite
Console.WriteLine($"Après modification : {db.Entry(mouse).State}");
db.SaveChanges();
Console.WriteLine($"Après SaveChanges : {db.Entry(mouse).State}");

// DELETE : Remove puis SaveChanges
var screen = db.Products.Single(p => p.Name == "Écran");
db.Products.Remove(screen);
Console.WriteLine($"Après Remove : {db.Entry(screen).State}");
db.SaveChanges();
Console.WriteLine($"Après SaveChanges : {db.Entry(screen).State}");

Console.WriteLine($"Produits restants : {db.Products.Count()}");
Console.WriteLine($"Stock souris : {db.Products.Single(p => p.Name == "Souris").Stock}");

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `Après chargement : Unchanged
Après modification : Modified
Après SaveChanges : Unchanged
Après Remove : Deleted
Après SaveChanges : Detached
Produits restants : 2
Stock souris : 20`,
      steps: [
        "<code>db.Products.Single(p =&gt; p.Name == \"Souris\")</code> : charge la souris. Elle est suivie, à l'état <code>Unchanged</code>.",
        "<code>db.Entry(mouse).State</code> : <code>Entry</code> donne accès aux informations de suivi d'une entité, dont son état.",
        "<code>mouse.Stock -= 5;</code> : une simple modification d'objet. Pas de méthode <code>Update</code> à appeler.",
        "<code>db.ChangeTracker.DetectChanges();</code> : force la comparaison avec l'instantané pour afficher <code>Modified</code>. <code>SaveChanges</code> le fait tout seul, tu n'en as pas besoin en temps normal.",
        "<code>db.SaveChanges();</code> : écrit <code>UPDATE Products SET Stock = ...</code> pour la seule colonne changée, puis l'entité redevient <code>Unchanged</code>.",
        "<code>db.Products.Remove(screen);</code> : l'écran passe à <code>Deleted</code> ; après <code>SaveChanges</code>, la ligne est supprimée et l'objet devient <code>Detached</code>."
      ]
    },
    {
      title: "En asynchrone, en masse et en lecture seule",
      code: `using Microsoft.EntityFrameworkCore;

await using var db = new OrderFlowDbContext(); // base de l'exemple 2

// Version asynchrone : même code, avec Async et await
db.Products.Add(new Product { Name = "Câble USB", Price = 5.50m, Stock = 100 });
await db.SaveChangesAsync();

// UPDATE en masse : un seul UPDATE SQL, sans rien charger
int updated = await db.Products
    .Where(p => p.Stock >= 10)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - 1));
Console.WriteLine($"Produits mis à jour : {updated}");

// DELETE en masse : un seul DELETE SQL
int deleted = await db.Products.Where(p => p.Price < 10).ExecuteDeleteAsync();
Console.WriteLine($"Produits supprimés : {deleted}");

// Lecture seule : AsNoTracking, pas de suivi des changements
var names = await db.Products.AsNoTracking()
    .OrderBy(p => p.Name)
    .Select(p => $"{p.Name} ({p.Stock})")
    .ToListAsync();
Console.WriteLine(string.Join(" | ", names));

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `Produits mis à jour : 3
Produits supprimés : 1
Clavier (9) | Souris (19)`,
      steps: [
        "<code>await using var db = ...</code> : en code asynchrone, on libère le contexte avec <code>await using</code>.",
        "<code>await db.SaveChangesAsync();</code> : même rôle que <code>SaveChanges</code>, sans bloquer le thread pendant l'attente de SQL Server.",
        "<code>.ExecuteUpdateAsync(s =&gt; s.SetProperty(p =&gt; p.Stock, p =&gt; p.Stock - 1))</code> : génère <code>UPDATE Products SET Stock = Stock - 1 WHERE Stock &gt;= 10</code>. Les trois produits sont touchés, aucun n'est chargé.",
        "<code>ExecuteDeleteAsync()</code> : un <code>DELETE ... WHERE Price &lt; 10</code> immédiat. Le câble disparaît, sans <code>SaveChanges</code>.",
        "<code>.AsNoTracking()</code> : les produits lus ne sont pas suivis. Ici le <code>Select</code> vers une chaîne suffirait déjà, mais c'est un bon réflexe sur les lectures.",
        "<code>.ToListAsync()</code> : la version asynchrone de <code>ToList()</code>. Toutes les méthodes qui exécutent ont leur version <code>Async</code>."
      ],
      explain: "Attention : ExecuteUpdate et ExecuteDelete ne mettent pas à jour les entités déjà chargées dans le contexte."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ajouter trois clients",
      prompt: `<p>Avec une entité <code>Customer</code> (Id, Name, Email, CreatedAt), ajoute trois clients en un seul <code>SaveChanges()</code>, avec <code>CreatedAt = DateTime.UtcNow</code>. Affiche le nombre de lignes insérées, puis l'Id et le nom de chaque client, triés par nom.</p>`,
      hint: `<p><code>AddRange</code> accepte plusieurs entités. Après <code>SaveChanges()</code>, les <code>Id</code> sont remplis.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted(); // repartir d'une base neuve
db.Database.EnsureCreated();

db.Customers.AddRange(
    new Customer { Name = "Alice", Email = "alice@example.com", CreatedAt = DateTime.UtcNow },
    new Customer { Name = "Bob", Email = "bob@example.com", CreatedAt = DateTime.UtcNow },
    new Customer { Name = "Chloé", Email = "chloe@example.com", CreatedAt = DateTime.UtcNow });
Console.WriteLine($"Insérés : {db.SaveChanges()}");

foreach (var c in db.Customers.OrderBy(c => c.Name))
    Console.WriteLine($"{c.Id} - {c.Name}");

class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`
    },
    {
      level: "moyen",
      title: "Changer l'email d'un client",
      prompt: `<p>Écris une méthode <code>bool ChangeEmail(OrderFlowDbContext db, int customerId, string newEmail)</code> : elle charge le client avec <code>Find</code>, renvoie <code>false</code> s'il n'existe pas, sinon change l'email, sauvegarde et renvoie <code>true</code>. Teste-la avec un Id existant et avec 999.</p>`,
      hint: `<p>Pas besoin d'<code>Update</code> : le client chargé par <code>Find</code> est suivi, modifier sa propriété suffit.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
Console.WriteLine(ChangeEmail(db, 1, "alice@orderflow.fr")); // True
Console.WriteLine(ChangeEmail(db, 999, "x@y.z"));             // False

bool ChangeEmail(OrderFlowDbContext db, int customerId, string newEmail)
{
    var customer = db.Customers.Find(customerId);
    if (customer is null) return false;

    customer.Email = newEmail; // suivi : l'état passe à Modified
    db.SaveChanges();          // UPDATE Customers SET Email = ...
    return true;
}

class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`
    },
    {
      level: "difficile",
      title: "Soldes en une requête",
      prompt: `<p>Sur la table <code>Products</code>, applique une remise de 10 % à tous les produits dont le stock dépasse 15, en <strong>une seule</strong> requête SQL, de façon asynchrone. Puis supprime en une requête les produits dont le stock est à 0. Affiche le nombre de lignes touchées par chaque opération et la liste finale (nom et prix), sans suivi des changements.</p>`,
      hint: `<p><code>SetProperty(p =&gt; p.Price, p =&gt; p.Price * 0.9m)</code> dans <code>ExecuteUpdateAsync</code>, puis <code>ExecuteDeleteAsync</code>. Pour la liste : <code>AsNoTracking()</code> et <code>ToListAsync()</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

await using var db = new OrderFlowDbContext();

int discounted = await db.Products
    .Where(p => p.Stock > 15)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Price, p => p.Price * 0.9m));
Console.WriteLine($"Produits remisés : {discounted}");

int removed = await db.Products.Where(p => p.Stock == 0).ExecuteDeleteAsync();
Console.WriteLine($"Produits supprimés : {removed}");

var products = await db.Products.AsNoTracking().OrderBy(p => p.Name).ToListAsync();
foreach (var p in products)
    Console.WriteLine($"{p.Name} : {p.Price}");

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`
    }
  ],
  quiz: [
    {
      q: `Juste après <code>db.Products.Add(p);</code>, sans <code>SaveChanges()</code>, que s'est-il passé en base ?`,
      options: ["La ligne est insérée", "Rien : l'entité est seulement marquée <code>Added</code>", "La ligne est insérée, mais sans Id"],
      answer: 1,
      why: `<code>Add</code> ne fait que noter l'ajout dans le contexte. C'est <code>SaveChanges()</code> qui envoie l'<code>INSERT</code> et remplit l'Id.`
    },
    {
      q: `Tu charges un produit, puis tu écris <code>product.Price = 25m;</code>. Que faut-il encore faire pour l'enregistrer ?`,
      options: ["Appeler <code>db.Products.Update(product)</code> puis <code>SaveChanges()</code>", "Appeler <code>db.Entry(product).Reload()</code>", "Appeler seulement <code>SaveChanges()</code>"],
      answer: 2,
      why: `L'entité est suivie : <code>SaveChanges()</code> détecte le changement et écrit l'<code>UPDATE</code>. <code>Update()</code> ne sert que pour une entité <em>non</em> suivie, et <code>Reload()</code> annulerait ta modification.`
    },
    {
      q: `Quelle différence entre <code>ExecuteDelete()</code> et <code>Remove()</code> + <code>SaveChanges()</code> ?`,
      options: ["<code>ExecuteDelete()</code> envoie directement un DELETE sans charger les entités", "<code>ExecuteDelete()</code> attend le prochain <code>SaveChanges()</code>", "Aucune, ce sont des synonymes"],
      answer: 0,
      why: `<code>ExecuteDelete()</code> s'exécute immédiatement avec un <code>DELETE ... WHERE</code>. <code>Remove()</code> demande d'avoir chargé l'entité et attend <code>SaveChanges()</code>.`
    },
    {
      q: `Quand utiliser <code>AsNoTracking()</code> ?`,
      options: ["Pour toute requête qui modifie des données", "Pour des lectures que tu ne vas pas modifier, par exemple un affichage", "Pour forcer EF Core à relire la base au lieu du cache"],
      answer: 1,
      why: `Sans suivi, EF Core ne garde pas d'instantané : la lecture est plus légère. Mais des entités non suivies ne seront pas sauvegardées par <code>SaveChanges()</code> si tu les modifies.`
    }
  ],
  project: `<p><strong>OrderFlow : un ProductRepository avec EF Core.</strong> Dans <code>OrderFlow.Data</code>, crée une classe <code>ProductRepository</code> qui reçoit un <code>OrderFlowDbContext</code> et propose des méthodes asynchrones : <code>AddAsync(Product)</code>, <code>GetByIdAsync(int)</code> (avec <code>FindAsync</code>), <code>GetAllAsync()</code> (triée par nom, <code>AsNoTracking</code>), <code>UpdateStockAsync(int id, int newStock)</code> et <code>DeleteAsync(int id)</code>. Compare avec ta version ADO.NET de la partie 2 : combien de lignes as-tu économisées ?</p>`,
  resources: [
    { label: "Enregistrement de base (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/saving/basic" },
    { label: "ExecuteUpdate et ExecuteDelete (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/saving/execute-insert-update-delete" }
  ]
});

// =====================================================================
// 3.4 Les conventions
// =====================================================================
window.COURSE.push({
  key: "ef-conventions",
  title: "Les conventions : ce qu'EF Core devine tout seul",
  summary: "Tu sauras prévoir la table qu'EF Core va créer à partir d'une classe : clé, types de colonnes, NULL ou NOT NULL, et repérer quand une convention ne suffit pas.",
  objectives: [
    "Connaître les conventions de nom de table et de clé primaire",
    "Prévoir le type SQL de chaque type C#",
    "Comprendre le lien entre types nullables et NULL / NOT NULL",
    "Repérer les conventions à corriger (decimal, nvarchar(max))"
  ],
  analogy: `<p>Quand tu arrives dans un nouvel appartement, tu n'as pas besoin qu'on te dise que la cuisine sert à cuisiner et la salle de bain à se laver : ce sont des <strong>conventions</strong>, tout le monde les connaît.</p>
<p>EF Core fait pareil avec tes classes. Une propriété qui s'appelle <code>Id</code> ? C'est sûrement la clé. Un <code>string?</code> ? La colonne accepte <code>NULL</code>. Tu ne précises que ce qui sort de l'ordinaire.</p>`,
  lesson: `<h3>Le principe : convention plutôt que configuration</h3>
<p>Quand EF Core rencontre ton contexte pour la première fois, il construit le <strong>modèle</strong> : la carte qui relie chaque classe à une table et chaque propriété à une colonne. Pour remplir cette carte, il applique d'abord des <strong>conventions</strong>, des règles par défaut basées sur les noms et les types.</p>
<p>Ensuite seulement, il applique ta configuration (annotations et Fluent API, leçon suivante) pour corriger ce qui ne lui convient pas. Bien connaître les conventions, c'est savoir quoi <em>ne pas</em> écrire.</p>
<div class="flow"><span>Tes classes</span><span>Conventions</span><span>Ta configuration</span><span>Modèle final</span><span>Tables SQL</span></div>

<h3>Tables et clés primaires</h3>
<ul>
<li><strong>Nom de table</strong> : le nom de la propriété <code>DbSet</code> dans le contexte. <code>DbSet&lt;Product&gt; Products</code> donne la table <code>Products</code>. Sans DbSet, c'est le nom de la classe.</li>
<li><strong>Clé primaire</strong> : une propriété nommée <code>Id</code> ou <code>&lt;NomDeLaClasse&gt;Id</code> (par exemple <code>ProductId</code>).</li>
<li><strong>Identité</strong> : si la clé est un <code>int</code> ou un <code>long</code>, SQL Server génère les valeurs (<code>IDENTITY</code>). Tu laisses 0 à l'ajout, la base choisit.</li>
</ul>
<p>Si EF Core ne trouve aucune clé, il refuse de construire le modèle et lève une exception au premier usage du contexte. C'est voulu : sans clé, il ne pourrait ni mettre à jour ni supprimer une ligne précise.</p>

<h3>Des types C# aux types SQL</h3>
<table>
<tr><th>Type C#</th><th>Colonne SQL Server</th></tr>
<tr><td><code>int</code> / <code>long</code></td><td><code>int</code> / <code>bigint</code></td></tr>
<tr><td><code>string</code></td><td><code>nvarchar(max)</code></td></tr>
<tr><td><code>decimal</code></td><td><code>decimal(18,2)</code> (avec un avertissement)</td></tr>
<tr><td><code>bool</code></td><td><code>bit</code></td></tr>
<tr><td><code>DateTime</code></td><td><code>datetime2</code></td></tr>
<tr><td><code>DateOnly</code> / <code>TimeOnly</code></td><td><code>date</code> / <code>time</code></td></tr>
<tr><td><code>Guid</code></td><td><code>uniqueidentifier</code></td></tr>
<tr><td>un <code>enum</code></td><td>le type entier sous-jacent, donc <code>int</code></td></tr>
</table>
<p>Toutes les propriétés publiques avec un <code>get</code> et un <code>set</code> deviennent des colonnes. Une propriété calculée sans <code>set</code> (<code>public bool IsAvailable =&gt; Stock &gt; 0;</code>) est ignorée.</p>

<h3>NULL ou NOT NULL : le mode nullable décide</h3>
<p>Avec le mode nullable activé (c'est le cas par défaut en .NET 10), EF Core lit tes annotations de type :</p>
<div class="compare"><div><h4><code>string Name</code></h4><p>Non nullable en C#, donc colonne <code>NOT NULL</code>. EF Core refusera d'enregistrer un <code>null</code>.</p></div><div><h4><code>string? Comment</code></h4><p>Nullable en C#, donc colonne <code>NULL</code>. La valeur est facultative.</p></div></div>
<p>Pour les types valeur, c'est pareil : <code>int</code> donne <code>NOT NULL</code>, <code>int?</code> donne <code>NULL</code>. Ton code C# et ta base disent ainsi la même chose, ce qui évite beaucoup de <code>NullReferenceException</code>.</p>

<h3>Les conventions à corriger</h3>
<p>Deux conventions sont presque toujours à revoir sur un vrai projet :</p>
<ul>
<li><code>nvarchar(max)</code> pour tous les <code>string</code> : pas de limite de longueur, et une colonne <code>max</code> ne peut pas servir de clé d'index. Notre schéma veut <code>nvarchar(100)</code> pour un nom.</li>
<li><code>decimal(18,2)</code> par défaut : EF Core t'avertit qu'il a choisi pour toi, car des valeurs pourraient être tronquées. Notre schéma veut <code>decimal(10,2)</code> pour un prix.</li>
</ul>
<pre class="diagram">
 class Product              table Products
 +------------------+       +---------------------------+
 | int Id           | ----&gt; | Id int IDENTITY  PK       |
 | string Name      | ----&gt; | Name nvarchar(max) !      |
 | decimal Price    | ----&gt; | Price decimal(18,2) !     |
 | int Stock        | ----&gt; | Stock int NOT NULL        |
 +------------------+       +---------------------------+
   ! = convention à préciser dans ta configuration
</pre>
<div class="tip">Un <code>enum</code> est stocké en <code>int</code> par défaut : en base, tu verras <code>1</code> au lieu de <code>Paid</code>. C'est compact, mais illisible dans une requête SQL et fragile si quelqu'un réordonne l'enum. On verra comment le stocker en texte.</div>
<div class="note">Pour vérifier ce qu'EF Core a compris, deux outils suffisent : <code>db.Database.GenerateCreateScript()</code> pour voir le SQL, et les logs de niveau <code>Warning</code> pour voir ses avertissements. Regarde-les à chaque nouvelle entité, avant d'écrire la première migration.</div>`,
  examples: [
    {
      title: "Prévoir les colonnes d'une entité Order",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
Console.WriteLine(db.Database.GenerateCreateScript());

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

class Order
{
    public int Id { get; set; }               // clé primaire + IDENTITY
    public int CustomerId { get; set; }       // simple int pour l'instant
    public DateTime OrderDate { get; set; }   // datetime2
    public OrderStatus Status { get; set; }   // enum -> int
    public bool IsGift { get; set; }          // bit
    public string? Comment { get; set; }      // string? -> NULL autorisé
    public string Reference { get; set; } = ""; // string -> NOT NULL
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `CREATE TABLE [Orders] (
    [Id] int NOT NULL IDENTITY,
    [CustomerId] int NOT NULL,
    [OrderDate] datetime2 NOT NULL,
    [Status] int NOT NULL,
    [IsGift] bit NOT NULL,
    [Comment] nvarchar(max) NULL,
    [Reference] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Orders] PRIMARY KEY ([Id])
);
GO`,
      steps: [
        "<code>public DbSet&lt;Order&gt; Orders</code> : la table s'appellera <code>Orders</code>, comme le DbSet.",
        "<code>public int Id</code> : reconnu comme clé primaire ; comme c'est un <code>int</code>, la colonne est <code>IDENTITY</code>.",
        "<code>public int CustomerId</code> : pour l'instant, une simple colonne <code>int</code>. La vraie clé étrangère vers <code>Customers</code> viendra avec les relations, au chapitre suivant.",
        "<code>public OrderStatus Status</code> : un enum, donc stocké en <code>int</code>. <code>Paid</code> deviendra <code>1</code>.",
        "<code>string? Comment</code> donne <code>NULL</code>, <code>string Reference</code> donne <code>NOT NULL</code> : le <code>?</code> fait toute la différence.",
        "<code>db.Database.GenerateCreateScript()</code> : on vérifie le résultat sans toucher à la base."
      ],
      explain: "Sans une ligne de configuration, la table est déjà correcte à deux détails près : les nvarchar(max) et l'enum en int."
    },
    {
      title: "Quand EF Core ne trouve pas de clé",
      code: `using Microsoft.EntityFrameworkCore;

try
{
    using var db = new OrderFlowDbContext();
    var model = db.Model; // construit le modèle à partir des conventions
}
catch (InvalidOperationException ex)
{
    Console.WriteLine(ex.Message);
}

class Product
{
    public int ProductId { get; set; } // <Classe>Id : reconnu comme clé
    public string Name { get; set; } = "";
}

class Coupon
{
    public int Number { get; set; }    // ni Id, ni CouponId : pas de clé !
    public string Code { get; set; } = "";
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `The entity type 'Coupon' requires a primary key to be defined. If you intended to use a keyless entity type, call 'HasNoKey' in 'OnModelCreating'. For more information on keyless entity types, see https://go.microsoft.com/fwlink/?linkid=2141943.`,
      steps: [
        "<code>public int ProductId</code> : la convention accepte aussi <code>&lt;NomDeLaClasse&gt;Id</code>. <code>Product</code> a donc bien une clé.",
        "<code>public int Number</code> : ce nom ne correspond à aucune convention. <code>Coupon</code> n'a pas de clé.",
        "<code>var model = db.Model;</code> : accéder au modèle force EF Core à le construire. N'importe quelle requête aurait le même effet.",
        "<code>catch (InvalidOperationException ex)</code> : EF Core refuse le modèle et explique pourquoi, en anglais.",
        "<code>call 'HasNoKey'</code> : le message propose une piste pour les entités sans clé (vues SQL, résultats de rapports). Pour une vraie table, la solution est de déclarer une clé."
      ],
      explain: "Pour corriger : renomme Number en Id, ou marque-la comme clé avec [Key] (leçon suivante)."
    },
    {
      title: "L'avertissement sur les decimal",
      code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

using var db = new OrderFlowDbContext();
_ = db.Model; // construire le modèle déclenche les avertissements

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; } // aucune précision indiquée
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options
            .UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True")
            .LogTo(Console.WriteLine, LogLevel.Warning, DbContextLoggerOptions.None); // affiche les avertissements
}`,
      output: `No store type was specified for the decimal property 'Price' on entity type 'Product'. This will cause values to be silently truncated if they do not fit in the default precision and scale. Explicitly specify the SQL server column type that can accommodate all the values in 'OnModelCreating' using 'HasColumnType', specify precision and scale using 'HasPrecision', or configure a value converter using 'HasConversion'.`,
      steps: [
        "<code>.LogTo(Console.WriteLine, LogLevel.Warning, ...)</code> : envoie dans la console tous les messages d'EF Core de niveau avertissement ou plus grave.",
        "<code>DbContextLoggerOptions.None</code> : n'affiche que le message, sans date ni catégorie, pour une sortie lisible.",
        "<code>_ = db.Model;</code> : le <code>_</code> signifie « je n'utilise pas le résultat ». On force juste la construction du modèle.",
        "<code>public decimal Price</code> : sans précision, EF Core choisit <code>decimal(18,2)</code> et prévient que des valeurs pourraient être <em>silencieusement tronquées</em>.",
        "<code>using 'HasPrecision'</code> : le message donne lui-même la solution, qu'on applique dans la leçon suivante."
      ],
      explain: "Sans LogTo, cet avertissement passe inaperçu : active les logs pendant le développement."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Deviner avant de vérifier",
      prompt: `<p>Écris sur papier la table que produira cette classe, puis vérifie avec <code>GenerateCreateScript()</code> : <code>class Customer { public int CustomerId { get; set; } public string Name { get; set; } = ""; public string? Phone { get; set; } public DateTime CreatedAt { get; set; } public bool IsVip { get; set; } }</code>, avec <code>DbSet&lt;Customer&gt; Customers</code>.</p>`,
      hint: `<p>Cherche la clé (<code>CustomerId</code> suit la convention <code>&lt;Classe&gt;Id</code>), puis le <code>?</code> sur chaque type.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
Console.WriteLine(db.Database.GenerateCreateScript());
// CREATE TABLE [Customers] (
//     [CustomerId] int NOT NULL IDENTITY,
//     [Name] nvarchar(max) NOT NULL,
//     [Phone] nvarchar(max) NULL,
//     [CreatedAt] datetime2 NOT NULL,
//     [IsVip] bit NOT NULL,
//     CONSTRAINT [PK_Customers] PRIMARY KEY ([CustomerId])
// );

class Customer
{
    public int CustomerId { get; set; }
    public string Name { get; set; } = "";
    public string? Phone { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsVip { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`
    },
    {
      level: "moyen",
      title: "Inspecter le modèle",
      prompt: `<p>Pour l'entité <code>Product</code> (Id, Name, Price, Stock), parcours ses propriétés dans le modèle et affiche pour chacune : son nom, son type de colonne et si elle accepte <code>NULL</code>. Utilise <code>db.Model.FindEntityType(typeof(Product))</code>, puis <code>GetProperties()</code>, <code>GetColumnType()</code> et <code>IsNullable</code>.</p>`,
      hint: `<p><code>FindEntityType</code> peut renvoyer <code>null</code> : utilise <code>!</code> si tu es sûr que l'entité existe.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
var entity = db.Model.FindEntityType(typeof(Product))!;

foreach (var property in entity.GetProperties())
    Console.WriteLine($"{property.Name} : {property.GetColumnType()} (NULL : {property.IsNullable})");
// Id : int (NULL : False)
// Name : nvarchar(max) (NULL : False)
// Price : decimal(18,2) (NULL : False)
// Stock : int (NULL : False)

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`
    },
    {
      level: "difficile",
      title: "Réparer une entité sans clé",
      prompt: `<p>Reprends l'exemple 2. Corrige <code>Coupon</code> de deux façons : d'abord en renommant <code>Number</code> en <code>Id</code>, puis (en revenant à <code>Number</code>) en ajoutant une propriété <code>public int CouponId { get; set; }</code>. Dans chaque cas, affiche le script de création et observe quelle colonne porte la clé et l'<code>IDENTITY</code>.</p>`,
      hint: `<p>Dans le second cas, <code>Number</code> reste une colonne normale et <code>CouponId</code> devient la clé.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
Console.WriteLine(db.Database.GenerateCreateScript());
// [CouponId] int NOT NULL IDENTITY,
// [Number] int NOT NULL,
// [Code] nvarchar(max) NOT NULL,
// CONSTRAINT [PK_Coupons] PRIMARY KEY ([CouponId])

class Coupon
{
    public int CouponId { get; set; } // convention <Classe>Id
    public int Number { get; set; }
    public string Code { get; set; } = "";
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`
    }
  ],
  quiz: [
    {
      q: `Quelle propriété EF Core reconnaît-il comme clé primaire de la classe <code>Order</code> par convention ?`,
      options: ["<code>OrderNumber</code>", "<code>Key</code>", "<code>OrderId</code>"],
      answer: 2,
      why: `Les conventions acceptent <code>Id</code> et <code>&lt;NomDeLaClasse&gt;Id</code>, donc <code>OrderId</code>. Les autres noms demandent une configuration explicite.`
    },
    {
      q: `Avec le mode nullable activé, quelle colonne donne <code>public string? Comment { get; set; }</code> ?`,
      options: ["<code>nvarchar(max) NULL</code>", "<code>nvarchar(max) NOT NULL</code>", "<code>nvarchar(100) NULL</code>"],
      answer: 0,
      why: `Le <code>?</code> rend la propriété nullable, donc la colonne accepte <code>NULL</code>. Sans longueur précisée, un string devient <code>nvarchar(max)</code>.`
    },
    {
      q: `Comment est stockée par défaut une propriété de type <code>enum OrderStatus</code> ?`,
      options: ["En texte : <code>'Paid'</code>", "En entier : <code>1</code>", "Elle n'est pas stockée"],
      answer: 1,
      why: `Par convention, un enum est stocké avec son type entier sous-jacent. Pour du texte, il faut une conversion explicite.`
    },
    {
      q: `Pourquoi EF Core affiche-t-il un avertissement pour un <code>decimal</code> sans précision ?`,
      options: ["Parce que <code>decimal</code> n'est pas supporté par SQL Server", "Parce que la colonne sera en <code>float</code>", "Parce qu'il a choisi <code>decimal(18,2)</code> à ta place et que des valeurs pourraient être tronquées"],
      answer: 2,
      why: `EF Core choisit une précision par défaut mais ne peut pas savoir si elle convient à tes données. Il te demande de la préciser avec <code>HasPrecision</code> ou <code>[Precision]</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : un audit des conventions.</strong> Ajoute à ton <code>OrderFlowDbContext</code> l'enum <code>OrderStatus</code> (Pending, Paid, Shipped, Cancelled) et l'entité <code>Order</code> (Id, CustomerId, OrderDate, Status), avec son <code>DbSet</code>. Active <code>LogTo(Console.WriteLine, LogLevel.Warning)</code> et affiche <code>GenerateCreateScript()</code>. Compare le résultat au schéma OrderFlow attendu et note chaque écart (longueurs des textes, précision des prix, Email unique, statut en texte) : ce sera ta liste de travail pour la prochaine leçon.</p>`,
  resources: [
    { label: "Créer et configurer un modèle (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/modeling/" },
    { label: "Propriétés d'entité (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/modeling/entity-properties" }
  ]
});

// =====================================================================
// 3.5 Annotations ou Fluent API
// =====================================================================
window.COURSE.push({
  key: "ef-annotations-fluent",
  title: "Configurer le modèle : annotations ou Fluent API",
  summary: "Tu sauras corriger les conventions d'EF Core avec des attributs ou avec la Fluent API, et ranger la configuration de chaque entité dans sa propre classe.",
  objectives: [
    "Utiliser les annotations courantes : [Key], [MaxLength], [Precision], [NotMapped]",
    "Écrire la même configuration avec la Fluent API dans OnModelCreating",
    "Créer un index unique, une valeur par défaut et un enum stocké en texte",
    "Organiser la configuration avec IEntityTypeConfiguration"
  ],
  analogy: `<p>Tu peux donner des consignes à un déménageur de deux façons. Soit tu colles une <strong>étiquette sur chaque carton</strong> : « fragile », « cuisine ». C'est direct, l'info est sur l'objet. Soit tu lui donnes un <strong>plan détaillé</strong> de l'appartement avec toutes les consignes à un seul endroit.</p>
<p>Les annotations, ce sont les étiquettes sur tes classes. La Fluent API, c'est le plan, écrit dans le contexte. Les deux marchent, et le plan permet des consignes plus précises.</p>`,
  lesson: `<h3>Deux façons de dire la même chose</h3>
<p>Les conventions font une bonne partie du travail, mais pas tout : il faut préciser les longueurs, la précision des prix, les index. EF Core propose deux outils, qui produisent exactement le même modèle :</p>
<div class="compare"><div><h4>Annotations (attributs)</h4><p>Des attributs posés sur les propriétés, comme <code>[MaxLength(100)]</code>. Lisibles, proches du code, mais limités aux cas simples.</p></div><div><h4>Fluent API</h4><p>Des appels de méthodes dans <code>OnModelCreating</code>, comme <code>Property(p =&gt; p.Name).HasMaxLength(100)</code>. Tout est possible, et tes classes restent propres.</p></div></div>
<p>Si les deux disent des choses différentes, c'est la <strong>Fluent API qui gagne</strong> : elle est appliquée en dernier. L'ordre complet est : conventions, puis annotations, puis Fluent API.</p>
<p>Les attributs te rappelleront les décorateurs Angular (<code>@Input()</code>, <code>@Injectable()</code>) : des métadonnées posées sur le code, lues par le framework.</p>

<h3>Les annotations les plus utiles</h3>
<table>
<tr><th>Annotation</th><th>Effet</th><th>Namespace</th></tr>
<tr><td><code>[Key]</code></td><td>Cette propriété est la clé primaire</td><td><code>System.ComponentModel.DataAnnotations</code></td></tr>
<tr><td><code>[Required]</code></td><td>Colonne <code>NOT NULL</code> (utile sans le mode nullable)</td><td>idem</td></tr>
<tr><td><code>[MaxLength(100)]</code></td><td><code>nvarchar(100)</code> au lieu de <code>max</code></td><td>idem</td></tr>
<tr><td><code>[Table("Products")]</code></td><td>Nom de la table</td><td><code>...DataAnnotations.Schema</code></td></tr>
<tr><td><code>[Column("product_name")]</code></td><td>Nom de la colonne</td><td>idem</td></tr>
<tr><td><code>[NotMapped]</code></td><td>Pas de colonne pour cette propriété</td><td>idem</td></tr>
<tr><td><code>[Precision(10, 2)]</code></td><td><code>decimal(10,2)</code></td><td><code>Microsoft.EntityFrameworkCore</code></td></tr>
<tr><td><code>[Index(nameof(Email), IsUnique = true)]</code></td><td>Index unique (sur la classe)</td><td><code>Microsoft.EntityFrameworkCore</code></td></tr>
</table>
<p>La plupart de ces attributs font partie de .NET lui-même, pas d'EF Core : d'autres bibliothèques les lisent aussi (la validation d'ASP.NET Core, par exemple). Seuls <code>[Precision]</code> et <code>[Index]</code> viennent d'EF Core. Avec le mode nullable activé, <code>[Required]</code> est rarement utile : un <code>string</code> sans <code>?</code> donne déjà une colonne <code>NOT NULL</code>.</p>

<h3>La Fluent API dans OnModelCreating</h3>
<p>Tu redéfinis la méthode <code>OnModelCreating(ModelBuilder modelBuilder)</code> du contexte. <code>modelBuilder.Entity&lt;Customer&gt;()</code> te donne un « constructeur » pour l'entité, sur lequel tu enchaînes des méthodes. On dit « fluent » (fluide) parce que les appels se lisent comme une phrase.</p>
<table>
<tr><th>Fluent API</th><th>Effet</th></tr>
<tr><td><code>HasKey(c =&gt; c.Number)</code></td><td>Clé primaire</td></tr>
<tr><td><code>Property(c =&gt; c.Name).HasMaxLength(100)</code></td><td>Longueur maximale</td></tr>
<tr><td><code>Property(p =&gt; p.Price).HasPrecision(10, 2)</code></td><td>Précision d'un decimal</td></tr>
<tr><td><code>HasIndex(c =&gt; c.Email).IsUnique()</code></td><td>Index unique</td></tr>
<tr><td><code>Property(c =&gt; c.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()")</code></td><td>Valeur par défaut calculée par SQL Server</td></tr>
<tr><td><code>Property(o =&gt; o.Status).HasConversion&lt;string&gt;()</code></td><td>Enum stocké en texte</td></tr>
<tr><td><code>Ignore(p =&gt; p.IsAvailable)</code></td><td>Pas de colonne</td></tr>
</table>
<p>Certaines choses n'existent <strong>qu'en Fluent API</strong> : les valeurs par défaut SQL, les conversions, les filtres globaux, la plupart des réglages de relations. C'est pour ça que beaucoup d'équipes choisissent la Fluent API partout, pour tout trouver au même endroit.</p>

<h3>Ranger : une classe de configuration par entité</h3>
<p>Avec dix entités, <code>OnModelCreating</code> devient vite un pavé. La solution : une classe par entité qui implémente <code>IEntityTypeConfiguration&lt;T&gt;</code>, avec une seule méthode <code>Configure</code>. Le contexte les charge toutes d'une ligne avec <code>ApplyConfigurationsFromAssembly</code>.</p>
<div class="flow"><span>CustomerConfiguration</span><span>ProductConfiguration</span><span>OrderConfiguration</span><span>ApplyConfigurationsFromAssembly</span><span>Modèle</span></div>
<p>Chaque entité a ainsi son fichier de configuration, facile à retrouver et à relire en revue de code.</p>
<div class="tip">Les annotations comme <code>[MaxLength]</code> et <code>[Required]</code> servent aussi à la <strong>validation</strong> dans ASP.NET Core. Mais attention : sur une entité EF Core, <code>[MaxLength]</code> ne fait que définir la colonne. Si tu envoies un texte trop long, c'est SQL Server qui refusera l'INSERT, au moment du <code>SaveChanges()</code>.</div>
<div class="note">En pratique pro : Fluent API rangée dans des <code>IEntityTypeConfiguration</code>, et des entités sans attributs. Tes classes métier ne dépendent alors pas d'EF Core, ce qui sera précieux en partie 5 avec l'architecture en couches. Choisis une approche et tiens-la dans tout le projet.</div>`,
  examples: [
    {
      title: "Product configuré avec des annotations",
      code: `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
Console.WriteLine(db.Database.GenerateCreateScript());

[Table("Products")]
class Product
{
    public int Id { get; set; }

    [MaxLength(100)]
    public string Name { get; set; } = "";

    [Precision(10, 2)]
    public decimal Price { get; set; }

    public int Stock { get; set; }

    [NotMapped] // calculée en C#, pas de colonne
    public bool IsAvailable => Stock > 0;
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `CREATE TABLE [Products] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Price] decimal(10,2) NOT NULL,
    [Stock] int NOT NULL,
    CONSTRAINT [PK_Products] PRIMARY KEY ([Id])
);
GO`,
      steps: [
        "<code>using System.ComponentModel.DataAnnotations;</code> et <code>.Schema</code> : les namespaces des attributs standards de .NET.",
        "<code>[Table(\"Products\")]</code> : fixe le nom de table, même si le DbSet changeait de nom.",
        "<code>[MaxLength(100)]</code> : la colonne <code>Name</code> passe de <code>nvarchar(max)</code> à <code>nvarchar(100)</code>.",
        "<code>[Precision(10, 2)]</code> : <code>decimal(10,2)</code>, comme le veut notre schéma. Plus d'avertissement.",
        "<code>[NotMapped]</code> : <code>IsAvailable</code> n'a pas de colonne. Ici elle n'a pas de <code>set</code> et serait déjà ignorée, mais l'attribut rend l'intention claire."
      ],
      explain: "Tout est visible directement sur la classe : c'est la force des annotations."
    },
    {
      title: "Customer configuré avec la Fluent API",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
Console.WriteLine(db.Database.GenerateCreateScript());

class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var customer = modelBuilder.Entity<Customer>();
        customer.Property(c => c.Name).HasMaxLength(100);
        customer.Property(c => c.Email).HasMaxLength(200);
        customer.HasIndex(c => c.Email).IsUnique();           // email unique
        customer.Property(c => c.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");      // rempli par SQL Server
    }
}`,
      output: `CREATE TABLE [Customers] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(100) NOT NULL,
    [Email] nvarchar(200) NOT NULL,
    [CreatedAt] datetime2 NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
);
GO


CREATE UNIQUE INDEX [IX_Customers_Email] ON [Customers] ([Email]);
GO`,
      steps: [
        "<code>protected override void OnModelCreating(ModelBuilder modelBuilder)</code> : la méthode où l'on écrit la Fluent API. EF Core l'appelle une fois, en construisant le modèle.",
        "<code>var customer = modelBuilder.Entity&lt;Customer&gt;();</code> : on récupère le constructeur de l'entité pour lui donner des consignes.",
        "<code>.Property(c =&gt; c.Name).HasMaxLength(100)</code> : même effet que <code>[MaxLength(100)]</code>, mais la classe <code>Customer</code> reste sans attribut.",
        "<code>.HasIndex(c =&gt; c.Email).IsUnique()</code> : crée l'index <code>IX_Customers_Email</code>. SQL Server refusera deux clients avec le même email.",
        "<code>.HasDefaultValueSql(\"SYSUTCDATETIME()\")</code> : une valeur par défaut calculée par SQL Server. Impossible avec une annotation."
      ],
      explain: "Les noms IX_Customers_Email et PK_Customers suivent eux aussi une convention : IX_ pour les index, PK_ pour les clés primaires."
    },
    {
      title: "Une classe de configuration pour Order",
      code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using var db = new OrderFlowDbContext();
Console.WriteLine(db.Database.GenerateCreateScript());

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; }
}

// Toute la configuration d'Order, rangée dans sa propre classe
class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.Property(o => o.Status)
               .HasConversion<string>()   // "Paid" au lieu de 1
               .HasMaxLength(20);
        builder.HasIndex(o => o.CustomerId);
    }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderFlowDbContext).Assembly);
}`,
      output: `CREATE TABLE [Orders] (
    [Id] int NOT NULL IDENTITY,
    [CustomerId] int NOT NULL,
    [OrderDate] datetime2 NOT NULL,
    [Status] nvarchar(20) NOT NULL,
    CONSTRAINT [PK_Orders] PRIMARY KEY ([Id])
);
GO


CREATE INDEX [IX_Orders_CustomerId] ON [Orders] ([CustomerId]);
GO`,
      steps: [
        "<code>class OrderConfiguration : IEntityTypeConfiguration&lt;Order&gt;</code> : une classe dédiée à la configuration d'<code>Order</code>.",
        "<code>public void Configure(EntityTypeBuilder&lt;Order&gt; builder)</code> : <code>builder</code> joue le même rôle que <code>modelBuilder.Entity&lt;Order&gt;()</code>.",
        "<code>.HasConversion&lt;string&gt;()</code> : l'enum est enregistré sous forme de texte (<code>'Paid'</code>) et relu en <code>OrderStatus.Paid</code>. La colonne devient un <code>nvarchar</code>.",
        "<code>.HasMaxLength(20)</code> : on borne la colonne à 20 caractères, comme dans le schéma OrderFlow.",
        "<code>builder.HasIndex(o =&gt; o.CustomerId)</code> : un index simple, pour retrouver vite les commandes d'un client.",
        "<code>ApplyConfigurationsFromAssembly(...)</code> : EF Core cherche toutes les classes <code>IEntityTypeConfiguration</code> du projet et les applique."
      ],
      explain: "Ajouter une entité, c'est ajouter un fichier de configuration : le contexte, lui, ne change plus."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une clé avec [Key]",
      prompt: `<p>Reprends la classe <code>Coupon</code> de la leçon précédente (propriétés <code>Number</code> et <code>Code</code>). Sans renommer <code>Number</code>, déclare-la comme clé avec une annotation, limite <code>Code</code> à 30 caractères, et affiche le script de création.</p>`,
      hint: `<p><code>[Key]</code> et <code>[MaxLength(30)]</code> viennent de <code>System.ComponentModel.DataAnnotations</code>.</p>`,
      solution: `using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
Console.WriteLine(db.Database.GenerateCreateScript());
// [Number] int NOT NULL IDENTITY,
// [Code] nvarchar(30) NOT NULL,
// CONSTRAINT [PK_Coupons] PRIMARY KEY ([Number])

class Coupon
{
    [Key]
    public int Number { get; set; }

    [MaxLength(30)]
    public string Code { get; set; } = "";
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Coupon> Coupons => Set<Coupon>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");
}`
    },
    {
      level: "moyen",
      title: "Product en Fluent API",
      prompt: `<p>Réécris la configuration de l'exemple 1 (<code>Product</code>) avec la Fluent API, dans <code>OnModelCreating</code>, sans aucun attribut sur la classe. Ajoute en plus un index unique sur <code>Name</code>. Vérifie que le script est identique, plus l'index.</p>`,
      hint: `<p>Pour la propriété calculée : <code>Ignore(p =&gt; p.IsAvailable)</code>. Pour le nom de table : <code>ToTable(\"Products\")</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
Console.WriteLine(db.Database.GenerateCreateScript());

class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public bool IsAvailable => Stock > 0;
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var product = modelBuilder.Entity<Product>();
        product.ToTable("Products");
        product.Property(p => p.Name).HasMaxLength(100);
        product.Property(p => p.Price).HasPrecision(10, 2);
        product.HasIndex(p => p.Name).IsUnique();
        product.Ignore(p => p.IsAvailable);
    }
}`
    },
    {
      level: "difficile",
      title: "Vérifier l'enum stocké en texte",
      prompt: `<p>Avec l'exemple 3, crée la base (<code>EnsureDeleted</code> puis <code>EnsureCreated</code>), ajoute une commande au statut <code>OrderStatus.Paid</code> et sauvegarde. Relis ensuite la colonne brute avec une requête SQL : <code>db.Database.SqlQuery&lt;string&gt;($\"SELECT Status AS Value FROM Orders\")</code>, et affiche ce qu'elle contient. Relis aussi la commande avec EF Core et affiche <code>Status</code>.</p>`,
      hint: `<p><code>SqlQuery&lt;string&gt;</code> attend une colonne nommée <code>Value</code>. Les deux affichages doivent montrer <code>Paid</code>, mais l'un vient de la base brute, l'autre de l'enum.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();

db.Orders.Add(new Order { CustomerId = 1, OrderDate = DateTime.UtcNow, Status = OrderStatus.Paid });
db.SaveChanges();

var raw = db.Database.SqlQuery<string>($"SELECT Status AS Value FROM Orders").ToList();
Console.WriteLine($"En base : {raw[0]}");            // Paid (du texte)

var order = db.Orders.AsNoTracking().First();
Console.WriteLine($"En C# : {order.Status}");        // Paid (l'enum)
Console.WriteLine(order.Status == OrderStatus.Paid); // True

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public DateTime OrderDate { get; set; }
    public OrderStatus Status { get; set; }
}

// Toute la configuration d'Order, rangée dans sa propre classe
class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.Property(o => o.Status)
               .HasConversion<string>()   // "Paid" au lieu de 1
               .HasMaxLength(20);
        builder.HasIndex(o => o.CustomerId);
    }
}

class OrderFlowDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderFlowDbContext).Assembly);
}`
    }
  ],
  quiz: [
    {
      q: `Une annotation dit <code>[MaxLength(50)]</code> et la Fluent API dit <code>HasMaxLength(100)</code> sur la même propriété. Que vaut la colonne ?`,
      options: ["<code>nvarchar(50)</code>", "<code>nvarchar(100)</code>", "Erreur au démarrage"],
      answer: 1,
      why: `L'ordre d'application est conventions, puis annotations, puis Fluent API. La Fluent API passe en dernier, c'est donc elle qui gagne.`
    },
    {
      q: `Laquelle de ces configurations n'est possible <strong>qu'en Fluent API</strong> ?`,
      options: ["Une longueur maximale", "Une clé primaire", "Une valeur par défaut calculée par SQL Server"],
      answer: 2,
      why: `<code>HasDefaultValueSql</code> n'a pas d'équivalent en attribut. Longueur (<code>[MaxLength]</code>) et clé (<code>[Key]</code>) existent dans les deux styles.`
    },
    {
      q: `Que fait <code>HasConversion&lt;string&gt;()</code> sur une propriété <code>OrderStatus Status</code> ?`,
      options: ["Elle stocke le nom de la valeur (<code>'Paid'</code>) au lieu du nombre", "Elle transforme la propriété C# en <code>string</code>", "Elle valide que le texte reçu est un statut connu"],
      answer: 0,
      why: `La conversion ne touche que le stockage : en C#, la propriété reste un <code>OrderStatus</code>. EF Core convertit dans les deux sens à l'écriture et à la lecture.`
    },
    {
      q: `À quoi sert <code>ApplyConfigurationsFromAssembly</code> ?`,
      options: ["À créer la base de données", "À appliquer toutes les classes <code>IEntityTypeConfiguration</code> trouvées dans le projet", "À générer une migration"],
      answer: 1,
      why: `Elle évite d'appeler chaque configuration à la main : EF Core trouve toutes les classes de configuration de l'assembly et les applique au modèle.`
    }
  ],
  project: `<p><strong>OrderFlow : un modèle conforme au schéma.</strong> Dans <code>OrderFlow.Data</code>, crée un dossier <code>Configurations</code> avec <code>CustomerConfiguration</code> (Name 100, Email 200 et unique, CreatedAt par défaut <code>SYSUTCDATETIME()</code>), <code>ProductConfiguration</code> (Name 100, Price <code>decimal(10,2)</code>) et <code>OrderConfiguration</code> (Status en texte, 20 caractères). Appelle <code>ApplyConfigurationsFromAssembly</code> dans <code>OnModelCreating</code>, puis compare <code>GenerateCreateScript()</code> à ta liste d'écarts de la leçon précédente : elle doit être vide.</p>`,
  resources: [
    { label: "Créer et configurer un modèle (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/modeling/" },
    { label: "Conversions de valeurs (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/modeling/value-conversions" }
  ]
});

// =====================================================================
// 3.6 Les migrations
// =====================================================================
window.COURSE.push({
  key: "ef-migrations",
  title: "Les migrations : faire évoluer la base avec le code",
  summary: "Tu sauras créer, lire, appliquer et annuler une migration, et faire évoluer le schéma OrderFlow à chaque changement de tes entités.",
  objectives: [
    "Comprendre ce qu'est une migration et la table __EFMigrationsHistory",
    "Créer et appliquer une migration avec dotnet ef",
    "Lire les méthodes Up et Down d'une migration générée",
    "Revenir en arrière et appliquer les migrations depuis le code"
  ],
  analogy: `<p>Pense à l'<strong>historique de versions</strong> d'un document partagé : « v1 : création », « v2 : ajout du chapitre stock », « v3 : correction du titre ». Chaque version décrit ce qui change par rapport à la précédente, et on peut revenir à n'importe laquelle.</p>
<p>Les migrations, c'est cet historique pour ta base de données. Chaque migration dit comment passer à la version suivante (<code>Up</code>) et comment revenir à la précédente (<code>Down</code>). Et la base retient à quelle version elle est.</p>`,
  lesson: `<h3>Le problème : la base doit suivre le code</h3>
<p>Ton modèle C# change tout le temps : une nouvelle propriété <code>Stock</code>, un email qui devient unique, une nouvelle table. La base doit suivre, sur ton poste, sur celui de tes collègues et en production. <code>EnsureCreated</code> ne sait que créer une base vide, pas la faire évoluer sans perdre les données.</p>
<p>Une <strong>migration</strong> est une classe C# qui décrit un changement de schéma. EF Core la génère en comparant ton modèle actuel avec le modèle tel qu'il était à la migration précédente. Toi, tu relis, tu ajustes si besoin, et tu appliques.</p>
<div class="flow"><span>Modifier une entité</span><span>migrations add</span><span>Relire Up / Down</span><span>database update</span><span>Base à jour</span></div>

<h3>Les commandes essentielles</h3>
<table>
<tr><th>Commande</th><th>Ce qu'elle fait</th></tr>
<tr><td><code>dotnet ef migrations add NomDeLaMigration</code></td><td>Compare le modèle et génère une nouvelle migration</td></tr>
<tr><td><code>dotnet ef migrations list</code></td><td>Liste les migrations, avec <code>(Pending)</code> pour celles non appliquées</td></tr>
<tr><td><code>dotnet ef database update</code></td><td>Applique toutes les migrations en attente</td></tr>
<tr><td><code>dotnet ef database update NomDeLaMigration</code></td><td>Va jusqu'à cette migration, en avant ou en arrière (exécute les <code>Down</code>)</td></tr>
<tr><td><code>dotnet ef migrations remove</code></td><td>Supprime la dernière migration, si elle n'est pas appliquée</td></tr>
<tr><td><code>dotnet ef database drop</code></td><td>Supprime la base (demande confirmation)</td></tr>
</table>
<p>Donne des noms qui décrivent le changement, comme un message de commit : <code>InitialCreate</code>, <code>AddProductStock</code>, <code>MakeCustomerEmailUnique</code>.</p>

<h3>Les fichiers générés</h3>
<p>La première migration crée un dossier <code>Migrations</code> avec trois fichiers :</p>
<pre class="diagram">
 Migrations/
 +-- 20261107003708_InitialCreate.cs
 |     Up()   : CreateTable, CreateIndex...
 |     Down() : DropTable...
 +-- 20261107003708_InitialCreate.Designer.cs
 |     (le modèle à cet instant, ne pas toucher)
 +-- OrderFlowDbContextModelSnapshot.cs
       (le modèle actuel complet, mis à jour
        à chaque migration)
</pre>
<p>Le préfixe est un horodatage : il garde les migrations dans l'ordre. Le <strong>snapshot</strong> (instantané) est la photo du modèle après la dernière migration : c'est avec lui qu'EF Core compare ton modèle pour savoir quoi générer la fois suivante. Tous ces fichiers vont dans Git, avec le reste du code.</p>

<h3>Comment la base sait où elle en est</h3>
<p>Au premier <code>database update</code>, EF Core crée une table spéciale, <code>__EFMigrationsHistory</code>. Il y inscrit l'identifiant de chaque migration appliquée. Au <code>update</code> suivant, il compare cette liste aux migrations du projet et n'exécute que celles qui manquent.</p>
<pre class="diagram">
 Projet (code)                 Base : __EFMigrationsHistory
 ...003708_InitialCreate       ...003708_InitialCreate
 ...003914_AddProductStock     (absente : à appliquer)
</pre>
<p>Chaque migration est appliquée dans une transaction : si une instruction échoue, la migration entière est annulée et la base reste dans son état précédent.</p>
<div class="tip">Une base créée avec <code>EnsureCreated</code> n'a pas de table <code>__EFMigrationsHistory</code>. <code>database update</code> essaierait de recréer des tables qui existent déjà et échouerait. Avant ta première migration, supprime la base de démo avec <code>dotnet ef database drop</code>.</div>

<h3>Ce dont dotnet ef a besoin</h3>
<p>Pour générer une migration, l'outil compile ton projet et crée une instance de ton contexte, pour lire son modèle. Avec <code>OnConfiguring</code>, il y arrive tout seul. Si ton contexte reçoit ses options par le constructeur (ce sera le cas dans l'API), ajoute une classe qui implémente <code>IDesignTimeDbContextFactory&lt;OrderFlowDbContext&gt;</code> : l'outil l'utilisera pour fabriquer le contexte. Si le contexte est dans une bibliothèque séparée, précise les projets : <code>dotnet ef migrations add Nom --project OrderFlow.Data --startup-project OrderFlow.Console</code>.</p>

<h3>Appliquer depuis le code</h3>
<p><code>db.Database.Migrate()</code> fait la même chose que <code>database update</code>, depuis ton programme. <code>GetAppliedMigrations()</code> et <code>GetPendingMigrations()</code> listent les migrations appliquées et en attente. Pratique en développement ou dans les tests ; pour la production, on verra des méthodes plus sûres dans la leçon suivante.</p>
<div class="note">Depuis EF Core 9, <code>Migrate()</code> lève une exception si ton modèle a changé sans migration correspondante (tu as oublié <code>migrations add</code>). C'est un garde-fou précieux : ne le désactive pas, ajoute la migration manquante.</div>`,
  examples: [
    {
      title: "Créer la base avec une première migration",
      code: `# Dans le dossier du projet qui contient OrderFlowDbContext
# (Customer et Product configurés comme en leçon 3.5)

# 1. Générer la migration à partir du modèle
dotnet ef migrations add InitialCreate

# 2. Voir son état
dotnet ef migrations list

# 3. L'appliquer à la base
dotnet ef database update`,
      output: `Build started...
Build succeeded.
Done. To undo this action, use 'ef migrations remove'
Build started...
Build succeeded.
20261107003708_InitialCreate (Pending)
Build started...
Build succeeded.
Acquiring an exclusive lock for migration application. See https://aka.ms/efcore-docs-migrations-lock for more information if this takes too long.
Applying migration '20261107003708_InitialCreate'.
Done.`,
      steps: [
        "<code>dotnet ef migrations add InitialCreate</code> : compile le projet (<code>Build started...</code>), lit le modèle et crée les trois fichiers dans <code>Migrations/</code>. La base n'est pas touchée.",
        "<code>dotnet ef migrations list</code> : la migration existe dans le code, mais <code>(Pending)</code> indique qu'elle n'est pas encore appliquée.",
        "<code>dotnet ef database update</code> : crée la base si besoin, puis la table <code>__EFMigrationsHistory</code>, puis exécute le <code>Up</code> de la migration.",
        "<code>Acquiring an exclusive lock...</code> : EF Core pose un verrou pour que deux programmes n'appliquent pas les migrations en même temps.",
        "<code>Applying migration '20261107003708_InitialCreate'.</code> : chez toi, l'horodatage sera différent, c'est l'heure de création de la migration."
      ],
      explain: "Les messages de dotnet ef sont en anglais, même sur un système en français."
    },
    {
      title: "Ajouter une colonne : lire la migration générée",
      code: `// Fichier : Models.cs (on ajoute une propriété à Product)
//   public int Stock { get; set; }

// Terminal : dotnet ef migrations add AddProductStock

// Fichier : Migrations/20261107003914_AddProductStock.cs (généré)
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace OrderFlow.Migrations
{
    /// <inheritdoc />
    public partial class AddProductStock : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Stock",
                table: "Products",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Stock",
                table: "Products");
        }
    }
}

// Terminal : dotnet ef database update`,
      output: `Build started...
Build succeeded.
Acquiring an exclusive lock for migration application. See https://aka.ms/efcore-docs-migrations-lock for more information if this takes too long.
Applying migration '20261107003914_AddProductStock'.
Done.`,
      steps: [
        "<code>public int Stock { get; set; }</code> : le seul changement côté code. Le snapshot, lui, ne connaît pas encore cette colonne.",
        "<code>public partial class AddProductStock : Migration</code> : chaque migration hérite de <code>Migration</code> et porte le nom que tu as choisi.",
        "<code>Up(...)</code> : <code>AddColumn&lt;int&gt;</code> ajoute la colonne <code>Stock</code> à <code>Products</code>.",
        "<code>defaultValue: 0</code> : la colonne est <code>NOT NULL</code> ; les produits déjà en base reçoivent donc 0, sinon SQL Server refuserait l'ajout.",
        "<code>Down(...)</code> : l'opération inverse, <code>DropColumn</code>, utilisée si tu reviens en arrière.",
        "<code>dotnet ef database update</code> : seule <code>AddProductStock</code> est appliquée, car <code>InitialCreate</code> figure déjà dans l'historique."
      ],
      explain: "Relis toujours le Up et le Down avant d'appliquer : c'est du code qui va modifier une vraie base."
    },
    {
      title: "Revenir en arrière, puis migrer depuis le code",
      code: `// Terminal, avant de lancer : on annule la dernière migration
//   dotnet ef database update InitialCreate
//   (affiche : Reverting migration '20261107003914_AddProductStock'.)

// Fichier : Program.cs
using Microsoft.EntityFrameworkCore;
using OrderFlow;

using var db = new OrderFlowDbContext();

Console.WriteLine("Appliquées :");
foreach (var name in db.Database.GetAppliedMigrations())
    Console.WriteLine($"  {name}");

Console.WriteLine("En attente :");
foreach (var name in db.Database.GetPendingMigrations())
    Console.WriteLine($"  {name}");

db.Database.Migrate(); // applique tout ce qui manque
Console.WriteLine($"Après Migrate, en attente : {db.Database.GetPendingMigrations().Count()}");

db.Products.Add(new Product { Name = "Clavier", Price = 49.90m, Stock = 10 });
db.SaveChanges();
Console.WriteLine($"Produits : {db.Products.Count()}");`,
      output: `Appliquées :
  20261107003708_InitialCreate
En attente :
  20261107003914_AddProductStock
Après Migrate, en attente : 0
Produits : 1`,
      steps: [
        "<code>dotnet ef database update InitialCreate</code> : on demande d'aller à <code>InitialCreate</code>. EF Core exécute le <code>Down</code> d'<code>AddProductStock</code> : la colonne <code>Stock</code> disparaît.",
        "<code>db.Database.GetAppliedMigrations()</code> : lit la table <code>__EFMigrationsHistory</code>. Seule <code>InitialCreate</code> y figure.",
        "<code>db.Database.GetPendingMigrations()</code> : les migrations du projet absentes de l'historique.",
        "<code>db.Database.Migrate();</code> : applique <code>AddProductStock</code>, exactement comme <code>dotnet ef database update</code>.",
        "<code>db.Products.Add(... Stock = 10 ...)</code> : la colonne existe de nouveau, l'insertion fonctionne."
      ],
      explain: "Revenir en arrière exécute les Down : une colonne supprimée emporte ses données. Sur une base partagée, on préfère créer une nouvelle migration corrective."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Le cycle complet",
      prompt: `<p>Dans ton projet, supprime la base de démo, crée une migration <code>InitialCreate</code> pour <code>Customer</code> et <code>Product</code>, applique-la, puis liste les migrations. Ouvre ensuite la base dans ton outil SQL et trouve la table <code>__EFMigrationsHistory</code> : que contient-elle ?</p>`,
      hint: `<p><code>dotnet ef database drop</code> demande une confirmation : ajoute <code>--force</code> pour l'éviter.</p>`,
      solution: `dotnet ef database drop --force
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet ef migrations list

-- Dans SQL Server :
SELECT MigrationId, ProductVersion FROM __EFMigrationsHistory;
-- 20261107003708_InitialCreate | 10.0.14 (la version d'EF Core utilisée)`
    },
    {
      level: "moyen",
      title: "Une fabrique pour dotnet ef",
      prompt: `<p>Ton <code>OrderFlowDbContext</code> reçoit ses options par le constructeur et n'a plus d'<code>OnConfiguring</code>. <code>dotnet ef migrations add</code> ne sait plus le créer. Écris une classe <code>OrderFlowDbContextFactory</code> qui implémente <code>IDesignTimeDbContextFactory&lt;OrderFlowDbContext&gt;</code> et vérifie avec <code>dotnet ef migrations list</code>.</p>`,
      hint: `<p>L'interface est dans <code>Microsoft.EntityFrameworkCore.Design</code> et n'a qu'une méthode : <code>CreateDbContext(string[] args)</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace OrderFlow;

// Utilisée uniquement par les outils (dotnet ef), pas par l'application
public class OrderFlowDbContextFactory : IDesignTimeDbContextFactory<OrderFlowDbContext>
{
    public OrderFlowDbContext CreateDbContext(string[] args)
    {
        var options = new DbContextOptionsBuilder<OrderFlowDbContext>()
            .UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True")
            .Options;
        return new OrderFlowDbContext(options);
    }
}`
    },
    {
      level: "difficile",
      title: "Une colonne facultative, puis un retour arrière",
      prompt: `<p>Ajoute à <code>Customer</code> une propriété <code>string? Phone</code> limitée à 20 caractères (Fluent API). Crée la migration <code>AddCustomerPhone</code>, relis son <code>Up</code> (y a-t-il un <code>defaultValue</code> cette fois ? pourquoi ?), applique-la, puis reviens à la migration précédente et supprime <code>AddCustomerPhone</code> du projet.</p>`,
      hint: `<p>Une colonne <code>NULL</code> n'a pas besoin de valeur par défaut : les lignes existantes reçoivent <code>NULL</code>. Pour supprimer une migration déjà appliquée, il faut d'abord la retirer de la base avec <code>database update</code>.</p>`,
      solution: `// Dans CustomerConfiguration (ou OnModelCreating) :
//   builder.Property(c => c.Phone).HasMaxLength(20);

dotnet ef migrations add AddCustomerPhone
// Up : migrationBuilder.AddColumn<string>(name: "Phone", table: "Customers",
//      type: "nvarchar(20)", maxLength: 20, nullable: true);
// Pas de defaultValue : les clients existants auront Phone = NULL.

dotnet ef database update
dotnet ef database update AddProductStock   // exécute le Down : DropColumn Phone
dotnet ef migrations remove                 // supprime les fichiers et remet le snapshot`
    }
  ],
  quiz: [
    {
      q: `Que fait <code>dotnet ef migrations add AddProductStock</code> ?`,
      options: ["Il ajoute la colonne <code>Stock</code> dans la base", "Il génère une classe de migration en comparant le modèle au snapshot", "Il applique toutes les migrations en attente"],
      answer: 1,
      why: `<code>migrations add</code> ne touche jamais la base : il génère du code. C'est <code>database update</code> (ou <code>Migrate()</code>) qui l'exécute.`
    },
    {
      q: `Comment EF Core sait-il quelles migrations sont déjà appliquées sur une base ?`,
      options: ["Il lit la table <code>__EFMigrationsHistory</code> de cette base", "Il compare les tables existantes au modèle", "Il lit le fichier snapshot"],
      answer: 0,
      why: `Chaque migration appliquée est inscrite dans <code>__EFMigrationsHistory</code>. Le snapshot sert à générer la prochaine migration, pas à savoir ce qui est appliqué.`
    },
    {
      q: `Que contient la méthode <code>Down</code> d'une migration ?`,
      options: ["Les données de test", "Le SQL de sauvegarde de la base", "Les opérations inverses de <code>Up</code>, pour revenir en arrière"],
      answer: 2,
      why: `<code>Down</code> défait ce que fait <code>Up</code> : <code>DropColumn</code> pour un <code>AddColumn</code>, <code>DropTable</code> pour un <code>CreateTable</code>. Il ne sauvegarde pas les données.`
    },
    {
      q: `Tu ajoutes une propriété <code>int Stock</code> (non nullable) à une table qui contient déjà des lignes. Que met la migration générée ?`,
      options: ["Rien de spécial, SQL Server mettra NULL", "Un <code>defaultValue: 0</code> pour remplir les lignes existantes", "Une suppression puis recréation de la table"],
      answer: 1,
      why: `Une colonne <code>NOT NULL</code> ajoutée à une table non vide a besoin d'une valeur pour les lignes existantes : EF Core met la valeur par défaut du type, 0.`
    }
  ],
  project: `<p><strong>OrderFlow : la vraie base, enfin.</strong> Ajoute <code>OrderFlowDbContextFactory</code> à <code>OrderFlow.Data</code> (ton contexte reçoit ses options par le constructeur). Supprime toute base créée avec <code>EnsureCreated</code>, puis crée la migration <code>InitialCreate</code> avec <code>Customers</code>, <code>Products</code> et <code>Orders</code> configurés en leçon 3.5, et applique-la avec <code>--project OrderFlow.Data --startup-project</code> ton application console. Ajoute ensuite <code>Stock</code> à <code>Product</code> si ce n'est pas déjà fait, et fais-le passer par une deuxième migration. Committe le dossier <code>Migrations</code>.</p>`,
  resources: [
    { label: "Vue d'ensemble des migrations (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/managing-schemas/migrations/" },
    { label: "Gestion des migrations (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/managing-schemas/migrations/managing" }
  ]
});

// =====================================================================
// 3.7 Migrations en équipe et en production
// =====================================================================
window.COURSE.push({
  key: "ef-migrations-team",
  title: "Migrations en équipe et en production (scripts, bundles)",
  summary: "Tu sauras déployer des migrations en production avec un script SQL ou un bundle, retoucher une migration à la main sans perdre de données, et éviter les pièges du travail en équipe.",
  objectives: [
    "Générer un script SQL, simple ou idempotent",
    "Créer et exécuter un bundle de migrations",
    "Modifier une migration générée pour protéger les données existantes",
    "Appliquer les règles d'équipe : ne jamais réécrire une migration publiée"
  ],
  analogy: `<p>Sur ton poste, tu cuisines pour toi : tu goûtes, tu rattrapes, tu recommences. En production, tu es dans la <strong>cuisine d'un restaurant</strong> : la recette doit être écrite, relue et suivie à la lettre, et on ne jette pas le plat d'un client pour recommencer.</p>
<p>Le script SQL et le bundle sont ces recettes écrites : relues avant le service, exécutées de la même façon à chaque fois, par quelqu'un qui n'a pas besoin de ton code source.</p>`,
  lesson: `<h3>Pourquoi pas dotnet ef database update en production ?</h3>
<p>Sur ton poste, <code>dotnet ef database update</code> est parfait. En production, c'est une autre histoire : le serveur n'a ni le SDK .NET, ni le code source, et le DBA (l'administrateur de la base) veut voir <em>exactement</em> quel SQL va tourner avant de l'autoriser. Appeler <code>Migrate()</code> au démarrage de l'application pose aussi problème : si trois instances de l'API démarrent en même temps, elles migrent en même temps, et l'application a besoin de droits très élevés sur la base.</p>
<p>EF Core propose deux solutions qui séparent « appliquer les migrations » et « démarrer l'application ».</p>
<div class="compare"><div><h4>Script SQL</h4><p>Un fichier <code>.sql</code> généré, relu, puis exécuté par un DBA ou un pipeline avec <code>sqlcmd</code>. Le plus transparent.</p></div><div><h4>Bundle</h4><p>Un exécutable autonome (<code>efbundle.exe</code>) qui applique les migrations en attente. Le plus simple à automatiser.</p></div></div>

<h3>Les scripts SQL</h3>
<p><code>dotnet ef migrations script</code> génère le SQL de toutes les migrations. Tu peux donner un point de départ et d'arrivée : <code>dotnet ef migrations script InitialCreate AddProductStock</code> ne contient que ce qui sépare ces deux migrations. Ajoute <code>-o deploy.sql</code> pour écrire dans un fichier.</p>
<p>Problème : un script « de A à B » suppose que la base est exactement en A. Avec l'option <code>--idempotent</code>, chaque migration est entourée d'un test sur <code>__EFMigrationsHistory</code> : le script peut être lancé sur une base dans n'importe quel état, et même plusieurs fois. <strong>Idempotent</strong> veut dire « qui donne le même résultat qu'on l'exécute une ou dix fois ».</p>

<h3>Les bundles</h3>
<p><code>dotnet ef migrations bundle</code> compile un petit exécutable qui contient tes migrations. Sur le serveur, on le lance avec la chaîne de connexion : <code>./efbundle.exe --connection "..."</code>. Il applique ce qui manque et ne fait rien si la base est à jour. Avec <code>--self-contained -r linux-x64</code>, il tourne même sans .NET installé.</p>
<div class="flow"><span>Commit</span><span>CI : migrations script / bundle</span><span>Relecture</span><span>Exécution sur la base</span><span>Déploiement de l'app</span></div>

<h3>Retoucher une migration générée</h3>
<p>EF Core génère le schéma, mais il ne connaît pas tes <strong>données</strong>. Exemple : tu ajoutes un code produit <code>Sku</code> obligatoire et unique. La migration ajoute la colonne avec <code>''</code> pour les produits existants, puis crée l'index unique... qui échoue, car tous les produits ont le même <code>''</code>. La correction : insérer un <code>migrationBuilder.Sql("UPDATE ...")</code> entre les deux, pour donner une valeur unique à chaque ligne.</p>
<p>Autres cas à surveiller à la relecture :</p>
<ul>
<li><strong>Renommage</strong> : EF Core détecte un simple changement de nom de propriété et génère <code>RenameColumn</code>. Mais si tu changes aussi le type, il peut générer <code>DropColumn</code> + <code>AddColumn</code> : les données sont perdues.</li>
<li><strong>Perte de données</strong> : quand une migration supprime une colonne ou une table, la commande affiche <code>An operation was scaffolded that may result in the loss of data</code>. Lis ce message comme un feu orange.</li>
</ul>

<h3>Les règles du travail en équipe</h3>
<table>
<tr><th>Règle</th><th>Pourquoi</th></tr>
<tr><td>Ne modifie jamais une migration déjà appliquée ailleurs (poussée, déployée)</td><td>Les autres bases l'ont déjà dans leur historique : ta modification ne serait jamais exécutée chez elles</td></tr>
<tr><td>Pour corriger, crée une nouvelle migration</td><td>L'historique avance toujours, comme des commits</td></tr>
<tr><td><code>migrations remove</code> seulement sur une migration locale, jamais poussée</td><td>Elle supprime les fichiers et remet le snapshot en arrière</td></tr>
<tr><td>Conflit Git sur le snapshot : garde la migration du collègue, supprime la tienne, refais <code>migrations add</code></td><td>Le snapshot doit refléter toutes les migrations, dans l'ordre</td></tr>
</table>
<div class="tip">Ajoute <code>dotnet ef migrations has-pending-model-changes</code> à ta CI : la commande échoue (code de sortie 1) si quelqu'un a modifié une entité sans créer la migration correspondante.</div>
<div class="note">En production, sauvegarde la base avant de migrer, fais exécuter les migrations par un compte dédié avec les droits de modifier le schéma, et donne à l'application un compte qui n'a que les droits de lire et écrire les données. Et privilégie les migrations « compatibles » : ajouter une colonne facultative avant de déployer le code qui l'utilise, supprimer l'ancienne colonne dans une migration ultérieure.</div>`,
  examples: [
    {
      title: "Un script SQL idempotent",
      code: `# Le SQL entre deux migrations (ici : seulement AddProductStock)
dotnet ef migrations script InitialCreate AddProductStock

# La même chose, rejouable sans risque sur n'importe quelle base
dotnet ef migrations script InitialCreate AddProductStock --idempotent

# En vrai, on écrit dans un fichier pour le relire et l'archiver
dotnet ef migrations script --idempotent -o deploy.sql`,
      output: `Build started...
Build succeeded.
BEGIN TRANSACTION;
ALTER TABLE [Products] ADD [Stock] int NOT NULL DEFAULT 0;

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20261107003914_AddProductStock', N'10.0.14');

COMMIT;
GO


Build started...
Build succeeded.
BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261107003914_AddProductStock'
)
BEGIN
    ALTER TABLE [Products] ADD [Stock] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261107003914_AddProductStock'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261107003914_AddProductStock', N'10.0.14');
END;

COMMIT;
GO


Build started...
Build succeeded.`,
      steps: [
        "<code>dotnet ef migrations script InitialCreate AddProductStock</code> : le SQL pour passer de la première à la deuxième migration. Rien n'est exécuté, le script est seulement affiché.",
        "<code>ALTER TABLE [Products] ADD [Stock] ...</code> : la traduction SQL de l'<code>AddColumn</code> que tu as lu dans la migration.",
        "<code>INSERT INTO [__EFMigrationsHistory] ...</code> : le script inscrit lui-même la migration dans l'historique, comme le ferait <code>database update</code>.",
        "<code>--idempotent</code> : chaque bloc est protégé par <code>IF NOT EXISTS (SELECT * FROM [__EFMigrationsHistory] ...)</code>. Sur une base déjà à jour, le script ne fait rien.",
        "<code>-o deploy.sql</code> : écrit le script dans un fichier, à joindre à la demande de mise en production."
      ],
      explain: "Le script idempotent est le choix par défaut pour un pipeline : on n'a pas besoin de savoir dans quel état est la base cible."
    },
    {
      title: "Un bundle de migrations",
      code: `# 1. Construire l'exécutable (en CI, à côté du build de l'application)
dotnet ef migrations bundle --force

# 2. Sur le serveur : appliquer les migrations sur une base neuve
./efbundle.exe --connection "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True"

# 3. Relancer : rien à faire, la base est à jour
./efbundle.exe --connection "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True"`,
      output: `Build started...
Build succeeded.
Building bundle...
Done. Migrations Bundle: C:\\src\\OrderFlow\\efbundle.exe
Acquiring an exclusive lock for migration application. See https://aka.ms/efcore-docs-migrations-lock for more information if this takes too long.
Applying migration '20261107003708_InitialCreate'.
Applying migration '20261107003914_AddProductStock'.
Applying migration '20261107004222_AddProductSku'.
Done.
Acquiring an exclusive lock for migration application. See https://aka.ms/efcore-docs-migrations-lock for more information if this takes too long.
No migrations were applied. The database is already up to date.
Done.`,
      steps: [
        "<code>dotnet ef migrations bundle --force</code> : compile <code>efbundle.exe</code> dans le dossier courant. <code>--force</code> écrase un bundle existant.",
        "<code>./efbundle.exe --connection \"...\"</code> : la chaîne de connexion est donnée au lancement. Le même exécutable sert pour la recette et la production.",
        "<code>Applying migration ...</code> : sur une base neuve, les trois migrations sont appliquées dans l'ordre, puis inscrites dans l'historique.",
        "<code>No migrations were applied.</code> : au second lancement, tout est déjà dans <code>__EFMigrationsHistory</code>. Le bundle est donc sans risque à relancer.",
        "<code>Acquiring an exclusive lock</code> : si deux déploiements lancent le bundle en même temps, le second attend que le premier ait fini."
      ],
      explain: "Le bundle se suffit à lui-même : ni SDK, ni code source, ni dotnet-ef sur le serveur."
    },
    {
      title: "Corriger une migration avant qu'elle casse",
      code: `// Fichier : Migrations/20261107004222_AddProductSku.cs (généré, puis retouché)
protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AddColumn<string>(
        name: "Sku",
        table: "Products",
        type: "nvarchar(20)",
        maxLength: 20,
        nullable: false,
        defaultValue: "");

    // Ajouté à la main : un SKU unique pour les lignes existantes
    migrationBuilder.Sql("UPDATE Products SET Sku = CONCAT('SKU-', Id)");

    migrationBuilder.CreateIndex(
        name: "IX_Products_Sku",
        table: "Products",
        column: "Sku",
        unique: true);
}

// Sans la ligne Sql, database update échouait avec :
//   The CREATE UNIQUE INDEX statement terminated because a duplicate key
//   was found for the object name 'dbo.Products' and the index name
//   'IX_Products_Sku'. The duplicate key value is ().

// Terminal : dotnet ef database update`,
      output: `Build started...
Build succeeded.
Acquiring an exclusive lock for migration application. See https://aka.ms/efcore-docs-migrations-lock for more information if this takes too long.
Applying migration '20261107004222_AddProductSku'.
Done.`,
      steps: [
        "<code>migrationBuilder.AddColumn&lt;string&gt;(... defaultValue: \"\")</code> : généré par EF Core. Les deux produits existants reçoivent tous les deux un SKU vide.",
        "<code>migrationBuilder.CreateIndex(... unique: true)</code> : l'index unique refuse deux <code>''</code>. Sans retouche, SQL Server lève l'erreur rappelée en commentaire.",
        "<code>migrationBuilder.Sql(\"UPDATE Products SET Sku = CONCAT('SKU-', Id)\")</code> : notre ajout. Chaque produit reçoit un SKU unique (<code>SKU-1</code>, <code>SKU-2</code>) avant la création de l'index.",
        "<code>// Ajouté à la main</code> : un commentaire indispensable pour que tes collègues sachent que cette ligne n'est pas générée.",
        "<code>dotnet ef database update</code> : la migration passe. Comme elle s'exécute dans une transaction, la tentative ratée n'avait rien laissé en base."
      ],
      explain: "On ne retouche ainsi qu'une migration qui n'a encore été appliquée nulle part ailleurs que sur ta base locale."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Préparer une livraison",
      prompt: `<p>Génère dans un dossier <code>deploy</code> un script idempotent de toutes les migrations d'OrderFlow, nommé <code>orderflow-migrations.sql</code>. Ouvre-le et compte combien de blocs <code>IF NOT EXISTS</code> il contient pour la migration <code>InitialCreate</code>. Exécute-le deux fois sur une base vide avec <code>sqlcmd</code> : que se passe-t-il la seconde fois ?</p>`,
      hint: `<p><code>-o deploy/orderflow-migrations.sql</code>. Avec <code>sqlcmd</code>, l'option <code>-i</code> exécute un fichier.</p>`,
      solution: `dotnet ef migrations script --idempotent -o deploy/orderflow-migrations.sql

sqlcmd -S localhost -E -Q "CREATE DATABASE OrderFlowRecette"
sqlcmd -S localhost -E -d OrderFlowRecette -i deploy/orderflow-migrations.sql
sqlcmd -S localhost -E -d OrderFlowRecette -i deploy/orderflow-migrations.sql
# 2e exécution : tous les IF NOT EXISTS sont faux, rien n'est modifié.
# InitialCreate a un bloc par instruction (CREATE TABLE, CREATE INDEX)
# plus un bloc pour l'INSERT dans __EFMigrationsHistory.`
    },
    {
      level: "moyen",
      title: "Un garde-fou en CI",
      prompt: `<p>Écris les étapes d'un script de CI (en commandes shell) qui : restaure les outils, échoue si le modèle a des changements sans migration, génère le script idempotent et construit un bundle autonome pour Linux. Explique en commentaire ce que fait chaque ligne.</p>`,
      hint: `<p><code>dotnet tool restore</code> installe la version de dotnet-ef du manifeste. Le bundle autonome demande <code>--self-contained -r linux-x64</code>.</p>`,
      solution: `# Installe dotnet-ef dans la version notée dans dotnet-tools.json
dotnet tool restore

# Code de sortie 1 si une entité a changé sans migration : la CI échoue
dotnet ef migrations has-pending-model-changes

# Script à relire et à archiver avec la livraison
dotnet ef migrations script --idempotent -o artifacts/migrations.sql

# Exécutable autonome, utilisable sur un serveur Linux sans .NET
dotnet ef migrations bundle --self-contained -r linux-x64 -o artifacts/efbundle --force`
    },
    {
      level: "difficile",
      title: "Renommer sans perdre de données",
      prompt: `<p>Tu renommes <code>Customer.Name</code> en <code>FullName</code>. Génère la migration <code>RenameCustomerName</code> et vérifie qu'elle contient un <code>RenameColumn</code> et non un <code>DropColumn</code>. Puis imagine que tu veux en même temps passer la longueur de 100 à 150 : écris à la main un <code>Up</code> qui renomme <strong>puis</strong> agrandit la colonne, et le <code>Down</code> correspondant.</p>`,
      hint: `<p><code>migrationBuilder.RenameColumn(name, table, newName)</code> puis <code>migrationBuilder.AlterColumn&lt;string&gt;(...)</code> avec <code>oldType</code> et <code>oldMaxLength</code>. Le <code>Down</code> fait l'inverse, dans l'ordre inverse.</p>`,
      solution: `protected override void Up(MigrationBuilder migrationBuilder)
{
    migrationBuilder.RenameColumn(
        name: "Name", table: "Customers", newName: "FullName");

    migrationBuilder.AlterColumn<string>(
        name: "FullName", table: "Customers",
        type: "nvarchar(150)", maxLength: 150, nullable: false,
        oldClrType: typeof(string),
        oldType: "nvarchar(100)", oldMaxLength: 100);
}

protected override void Down(MigrationBuilder migrationBuilder)
{
    migrationBuilder.AlterColumn<string>(
        name: "FullName", table: "Customers",
        type: "nvarchar(100)", maxLength: 100, nullable: false,
        oldClrType: typeof(string),
        oldType: "nvarchar(150)", oldMaxLength: 150);

    migrationBuilder.RenameColumn(
        name: "FullName", table: "Customers", newName: "Name");
}`
    }
  ],
  quiz: [
    {
      q: `Que garantit l'option <code>--idempotent</code> d'un script de migrations ?`,
      options: ["Le script peut être exécuté plusieurs fois, sur une base dans n'importe quel état", "Le script supprime et recrée la base", "Le script ne contient pas de transaction"],
      answer: 0,
      why: `Chaque migration est protégée par un test sur <code>__EFMigrationsHistory</code> : ce qui est déjà appliqué est sauté. Le script ne supprime rien.`
    },
    {
      q: `Une migration a déjà été appliquée sur la base de recette. Tu y trouves une erreur. Que fais-tu ?`,
      options: ["Je modifie la migration et je relance <code>database update</code>", "Je fais <code>migrations remove</code> et je la recrée", "Je crée une nouvelle migration qui corrige"],
      answer: 2,
      why: `La recette a déjà inscrit la migration dans son historique : une version modifiée ne serait jamais réexécutée. On avance toujours avec une nouvelle migration.`
    },
    {
      q: `Quel est l'avantage principal d'un bundle de migrations ?`,
      options: ["Il est plus rapide que le SQL", "C'est un exécutable autonome qui applique les migrations sans SDK ni code source", "Il sauvegarde automatiquement la base"],
      answer: 1,
      why: `Le bundle embarque les migrations et la logique d'application. Sur le serveur, on n'a besoin que de l'exécutable et de la chaîne de connexion. Il ne fait pas de sauvegarde.`
    },
    {
      q: `<code>migrations add</code> affiche « An operation was scaffolded that may result in the loss of data ». Que faut-il faire ?`,
      options: ["Ignorer, c'est un message habituel", "Relire la migration : une colonne ou une table va être supprimée", "Relancer la commande avec <code>--force</code>"],
      answer: 1,
      why: `Ce message signale un <code>DropColumn</code> ou un <code>DropTable</code>. C'est parfois voulu, mais parfois un renommage mal détecté : relis avant d'appliquer.`
    }
  ],
  project: `<p><strong>OrderFlow : prêt pour la production.</strong> Ajoute un dossier <code>deploy</code> à ta solution et un petit script <code>deploy/migrate.ps1</code> (ou <code>.sh</code>) qui génère le script idempotent et le bundle d'OrderFlow. Ajoute ensuite la colonne <code>Sku</code> (20 caractères, unique) à <code>Product</code> et retouche la migration pour donner un SKU unique aux produits existants. Teste le tout sur une copie de ta base contenant des produits, avec le bundle. Note dans un <code>README</code> la règle de l'équipe : « une migration poussée ne se modifie plus ».</p>`,
  resources: [
    { label: "Application des migrations (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/managing-schemas/migrations/applying" },
    { label: "Migrations dans les environnements d'équipe (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/managing-schemas/migrations/teams" }
  ]
});
