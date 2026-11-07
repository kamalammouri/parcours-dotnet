window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 3 - Relations et requêtes
// 1. Relation un-à-plusieurs
// =====================================================================
window.COURSE.push({
  key: "ef-one-to-many",
  title: "Relation un-à-plusieurs : un client, ses commandes",
  summary: "Tu sauras relier deux entités par une clé étrangère, enregistrer un parent avec ses enfants en un seul SaveChanges et choisir ce qui se passe quand on supprime le parent.",
  objectives: [
    "Reconnaître le parent (principal) et l'enfant (dépendant) d'une relation",
    "Déclarer une clé étrangère et des propriétés de navigation",
    "Configurer la relation en Fluent API avec HasMany / WithOne",
    "Choisir le comportement à la suppression : Cascade ou Restrict"
  ],
  analogy: `<p>Pense à un <strong>classeur de factures</strong>. Chaque client a sa fiche, et chaque facture porte, en haut à droite, le <strong>numéro du client</strong> à qui elle appartient. La fiche client ne liste pas ses factures : c'est chaque facture qui dit « j'appartiens au client n° 12 ».</p>
<p>Une relation un-à-plusieurs, c'est exactement ça : un client, plusieurs commandes, et chaque commande garde le numéro de son client.</p>`,
  lesson: `<h3>Le vocabulaire d'une relation</h3>
<p>Une <strong>relation</strong> relie deux tables. Dans « un client a plusieurs commandes », le client est le <strong>principal</strong> (le parent) et la commande est le <strong>dépendant</strong> (l'enfant). Le dépendant porte une colonne qui contient l'Id de son parent : c'est la <strong>clé étrangère</strong> (en anglais <em>foreign key</em>, souvent abrégée <strong>FK</strong>).</p>
<p>Côté C#, tu ajoutes en plus des <strong>propriétés de navigation</strong> : des propriétés qui pointent vers l'objet lié. <code>Customer.Orders</code> est une navigation de <em>collection</em> (une liste), <code>Order.Customer</code> est une navigation de <em>référence</em> (un seul objet).</p>
<pre class="diagram">
 Customers                 Orders
+----+-------+           +----+------------+
| Id | Name  |           | Id | CustomerId |
+----+-------+           +----+------------+
| 1  | Alice |&lt;----------| 1  | 1          |
|    |       |&lt;----------| 2  | 1          |
| 2  | Bob   |&lt;----------| 3  | 2          |
+----+-------+           +----+------------+
   principal          dépendant (porte la FK)
</pre>

<h3>Les conventions font presque tout</h3>
<p>Tu te souviens des conventions du chapitre précédent ? Elles marchent aussi pour les relations. Si <code>Order</code> a une propriété <code>int CustomerId</code> et une navigation <code>Customer</code>, EF Core comprend tout seul que <code>CustomerId</code> est la clé étrangère vers <code>Customers.Id</code>. Il crée la contrainte <code>FOREIGN KEY</code> et un index sur la colonne.</p>
<table>
<tr><th>Dans la classe</th><th>Rôle</th><th>En base</th></tr>
<tr><td><code>List&lt;Order&gt; Orders</code> dans <code>Customer</code></td><td>Navigation de collection</td><td>Rien (c'est juste du C#)</td></tr>
<tr><td><code>int CustomerId</code> dans <code>Order</code></td><td>Clé étrangère</td><td>Colonne <code>CustomerId</code> + contrainte FK + index</td></tr>
<tr><td><code>Customer Customer</code> dans <code>Order</code></td><td>Navigation de référence</td><td>Rien (c'est juste du C#)</td></tr>
</table>
<p>Avec <code>int</code>, la relation est <strong>obligatoire</strong> : une commande a toujours un client (colonne <code>NOT NULL</code>). Avec <code>int?</code>, elle devient <strong>optionnelle</strong> : une commande peut exister sans client.</p>
<div class="tip">Garde toujours la propriété <code>CustomerId</code> en plus de la navigation. Elle te permet de relier une commande à un client existant sans le charger : <code>new Order { CustomerId = 12 }</code>.</div>

<h3>Ajouter un parent et ses enfants d'un coup</h3>
<p>Si tu ajoutes des commandes dans <code>alice.Orders</code> puis fais <code>db.Customers.Add(alice)</code>, EF Core ajoute le client <strong>et</strong> toutes les commandes. Au <code>SaveChanges()</code>, il insère d'abord le client, récupère son Id, puis remplit tout seul le <code>CustomerId</code> de chaque commande avant de les insérer.</p>
<div class="flow"><span>Add(alice)</span><span>INSERT Customers</span><span>Id = 1 récupéré</span><span>CustomerId = 1</span><span>INSERT Orders</span></div>
<p>C'est un gros confort par rapport à ADO.NET, où tu devais faire tout ça à la main.</p>

<h3>La Fluent API : dire les choses explicitement</h3>
<p>Quand les conventions ne suffisent pas (nom de FK inhabituel, comportement de suppression), tu décris la relation dans <code>OnModelCreating</code>. La phrase se lit presque en français : « un client <code>HasMany</code> commandes, chaque commande <code>WithOne</code> client, avec la clé étrangère <code>CustomerId</code> ».</p>
<p>Tu peux aussi partir de l'autre côté : <code>Entity&lt;Order&gt;().HasOne(o =&gt; o.Customer).WithMany(c =&gt; c.Orders)</code>. Les deux écritures décrivent la même relation : n'en écris qu'une.</p>

<h3>Que se passe-t-il quand on supprime le parent ?</h3>
<p>Si tu supprimes Alice, que deviennent ses commandes ? C'est le <strong>comportement de suppression</strong>, réglé avec <code>OnDelete(...)</code>.</p>
<div class="compare"><div><h4>Cascade</h4><p>Les enfants sont supprimés avec le parent. C'est le défaut pour une relation obligatoire. Parfait pour les lignes d'une commande.</p></div><div><h4>Restrict</h4><p>La suppression est refusée tant qu'il reste des enfants. Idéal pour un client : on ne veut pas effacer son historique de commandes par accident.</p></div></div>
<div class="note">En pro, réfléchis à chaque relation : <code>Cascade</code> pour ce qui n'a pas de sens sans le parent (lignes de commande), <code>Restrict</code> pour ce qui a une valeur propre (commandes, factures). Et sache que SQL Server refuse deux chemins de cascade qui mènent à la même table : si une migration échoue avec « may cause cycles or multiple cascade paths », passe une des relations en <code>Restrict</code>.</div>`,
  examples: [
    {
      title: "Un client et ses commandes en un seul SaveChanges",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted(); // base de démo jetable
db.Database.EnsureCreated();

var alice = new Customer { Name = "Alice" };
alice.Orders.Add(new Order { OrderDate = new DateTime(2026, 11, 2) });
alice.Orders.Add(new Order { OrderDate = new DateTime(2026, 11, 5) });
db.Customers.Add(alice); // un seul Add pour le client ET ses commandes
db.SaveChanges();

Console.WriteLine($"{alice.Name} a l'Id {alice.Id}");
foreach (var order in alice.Orders)
    Console.WriteLine($"Commande {order.Id} : CustomerId = {order.CustomerId}");
Console.WriteLine($"Commandes en base : {db.Orders.Count()}");

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Order> Orders { get; set; } = []; // navigation de collection
}

public class Order
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public int CustomerId { get; set; }            // clé étrangère
    public Customer Customer { get; set; } = null!; // navigation de référence
}

public class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `Alice a l'Id 1
Commande 1 : CustomerId = 1
Commande 2 : CustomerId = 1
Commandes en base : 2`,
      steps: [
        "<code>db.Database.EnsureDeleted(); db.Database.EnsureCreated();</code> : pour la démo, on repart d'une base neuve <code>OrderFlowDemo</code> à chaque exécution. Dans ton vrai projet, ce sont les migrations qui créent le schéma.",
        "<code>public List&lt;Order&gt; Orders { get; set; } = [];</code> : la liste est initialisée vide, comme ça on peut faire <code>alice.Orders.Add(...)</code> sans risque de <code>null</code>.",
        "<code>public Customer Customer { get; set; } = null!;</code> : le <code>null!</code> dit au compilateur « EF remplira cette propriété, ne t'inquiète pas ».",
        "<code>db.Customers.Add(alice);</code> : EF suit le graphe d'objets et marque aussi les deux commandes comme « à ajouter ».",
        "<code>db.SaveChanges();</code> : trois INSERT. EF remplit <code>alice.Id</code>, puis le <code>CustomerId</code> de chaque commande, sans que tu l'aies écrit.",
        "<code>db.Orders.Count()</code> : une requête <code>SELECT COUNT(*)</code> confirme que les deux lignes sont bien en base."
      ],
      explain: "Tu manipules des objets reliés entre eux, EF s'occupe des Id et des clés étrangères."
    },
    {
      title: "Voir la clé étrangère créée par EF",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
// Affiche le SQL que EF utiliserait pour créer les tables
Console.WriteLine(db.Database.GenerateCreateScript());

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Order> Orders { get; set; } = [];
}

public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
}

public class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>()
            .HasMany(c => c.Orders)          // un client a plusieurs commandes
            .WithOne(o => o.Customer)        // une commande a un client
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict); // interdit de supprimer un client qui a des commandes
    }
}`,
      output: `CREATE TABLE [Customers] (
    [Id] int NOT NULL IDENTITY,
    [Name] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Customers] PRIMARY KEY ([Id])
);
GO


CREATE TABLE [Orders] (
    [Id] int NOT NULL IDENTITY,
    [CustomerId] int NOT NULL,
    CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_Orders_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE NO ACTION
);
GO


CREATE INDEX [IX_Orders_CustomerId] ON [Orders] ([CustomerId]);
GO`,
      steps: [
        "<code>db.Database.GenerateCreateScript()</code> : renvoie le script SQL de création du schéma, sans rien exécuter. Pratique pour vérifier ce que EF a compris de ton modèle.",
        "<code>.HasMany(c =&gt; c.Orders).WithOne(o =&gt; o.Customer)</code> : on décrit les deux côtés de la relation, avec leurs navigations.",
        "<code>.HasForeignKey(o =&gt; o.CustomerId)</code> : on nomme la clé étrangère. Ici, la convention l'aurait trouvée seule, mais l'écrire rend la relation lisible.",
        "<code>.OnDelete(DeleteBehavior.Restrict)</code> : dans le script, cela devient <code>ON DELETE NO ACTION</code> : SQL Server refusera la suppression.",
        "<code>CONSTRAINT [FK_Orders_Customers_CustomerId]</code> : la contrainte garantit qu'une commande pointe toujours vers un client qui existe.",
        "<code>CREATE INDEX [IX_Orders_CustomerId]</code> : EF ajoute un index sur la FK, car on cherche très souvent « les commandes du client X »."
      ]
    },
    {
      title: "Restrict : supprimer un client qui a des commandes",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Customers.Add(new Customer { Name = "Alice", Orders = [new Order(), new Order()] });
db.SaveChanges();
db.ChangeTracker.Clear(); // on oublie tout, comme dans une nouvelle requête HTTP

var alice = db.Customers.Single(c => c.Name == "Alice"); // sans ses commandes
db.Customers.Remove(alice);
try { db.SaveChanges(); }
catch (DbUpdateException ex) { Console.WriteLine("Refusé : " + ex.InnerException!.Message.Split(". ")[0]); }
Console.WriteLine($"Clients : {db.Customers.Count()}, commandes : {db.Orders.Count()}");

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Order> Orders { get; set; } = [];
}
public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.Entity<Order>().HasOne(o => o.Customer).WithMany(c => c.Orders)
            .OnDelete(DeleteBehavior.Restrict); // Cascade : supprimerait aussi les commandes
}`,
      output: `Refusé : The DELETE statement conflicted with the REFERENCE constraint "FK_Orders_Customers_CustomerId"
Clients : 1, commandes : 2`,
      steps: [
        "<code>db.ChangeTracker.Clear();</code> : on vide la mémoire du contexte. La suite se comporte comme une nouvelle requête qui ne connaît pas encore les commandes.",
        "<code>db.Customers.Remove(alice);</code> : on demande la suppression du client seul.",
        "<code>try { db.SaveChanges(); }</code> : EF envoie le <code>DELETE</code>, SQL Server le refuse à cause de la contrainte FK.",
        "<code>catch (DbUpdateException ex)</code> : EF enveloppe l'erreur SQL dans une <code>DbUpdateException</code>. Le message de SQL Server est dans <code>InnerException</code>.",
        "<code>Clients : 1, commandes : 2</code> : rien n'a été supprimé, les données sont intactes.",
        "<code>.OnDelete(DeleteBehavior.Restrict)</code> : remplace par <code>DeleteBehavior.Cascade</code> et relance : la suppression passe et le programme affiche <code>Clients : 0, commandes : 0</code>."
      ],
      explain: "Restrict protège tes données : pour supprimer un client, il faudra d'abord décider quoi faire de ses commandes."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ajouter une commande par la clé étrangère",
      prompt: `<p>Reprends le modèle de l'exemple 1. Après le premier <code>SaveChanges()</code>, ajoute une troisième commande à Alice <strong>sans passer par</strong> <code>alice.Orders</code> : crée un <code>new Order { CustomerId = alice.Id, ... }</code> et ajoute-le avec <code>db.Orders.Add(...)</code>. Affiche ensuite le nombre de commandes d'Alice en base.</p>`,
      hint: `<p>Pour compter en base : <code>db.Orders.Count(o =&gt; o.CustomerId == alice.Id)</code>.</p>`,
      solution: `// Modèle : celui de l'exemple 1, à la suite du premier SaveChanges()
db.Orders.Add(new Order { CustomerId = alice.Id, OrderDate = new DateTime(2026, 11, 7) });
db.SaveChanges();

int count = db.Orders.Count(o => o.CustomerId == alice.Id);
Console.WriteLine($"Alice a {count} commandes"); // Alice a 3 commandes`
    },
    {
      level: "moyen",
      title: "Une commande sans client",
      prompt: `<p>OrderFlow veut accepter des commandes « invité », sans client. Modifie <code>Order</code> pour rendre la relation <strong>optionnelle</strong>, enregistre une commande sans client, puis affiche <code>GenerateCreateScript()</code> et repère ce qui a changé sur la colonne <code>CustomerId</code>.</p>`,
      hint: `<p>Il suffit de rendre la FK et la navigation nullables : <code>int?</code> et <code>Customer?</code>.</p>`,
      solution: `// Dans Order :
public int? CustomerId { get; set; }      // optionnelle
public Customer? Customer { get; set; }   // peut être null

// Dans Program.cs :
db.Orders.Add(new Order { OrderDate = DateTime.Now }); // aucun client
db.SaveChanges();
Console.WriteLine(db.Orders.Count(o => o.CustomerId == null)); // 1

// Dans le script : [CustomerId] int NULL (au lieu de NOT NULL)`
    },
    {
      level: "difficile",
      title: "Les lignes d'une commande en cascade",
      prompt: `<p>Ajoute une entité <code>OrderLine</code> (<code>Id</code>, <code>OrderId</code>, <code>Quantity</code>) et une collection <code>Lines</code> dans <code>Order</code>, <strong>sans</strong> navigation <code>OrderLine.Order</code>. Configure la relation en Fluent API avec suppression en cascade. Crée une commande avec deux lignes, supprime la commande et prouve que les lignes ont disparu.</p>`,
      hint: `<p>Sans navigation inverse, on écrit <code>.WithOne()</code> sans argument. Pense à ajouter un <code>DbSet&lt;OrderLine&gt;</code> pour pouvoir compter les lignes.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();

var order = new Order { Lines = [new() { Quantity = 2 }, new() { Quantity = 1 }] };
db.Orders.Add(order);
db.SaveChanges();
Console.WriteLine($"Avant : {db.OrderLines.Count()} ligne(s)"); // 2

db.Orders.Remove(order);
db.SaveChanges(); // la cascade supprime aussi les lignes
Console.WriteLine($"Après : {db.OrderLines.Count()} ligne(s)"); // 0

public class Order
{
    public int Id { get; set; }
    public List<OrderLine> Lines { get; set; } = [];
}
public class OrderLine
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int Quantity { get; set; }
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderLine> OrderLines => Set<OrderLine>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.Entity<Order>()
            .HasMany(o => o.Lines)
            .WithOne()                        // pas de navigation OrderLine.Order
            .HasForeignKey(l => l.OrderId)
            .OnDelete(DeleteBehavior.Cascade);
}`
    }
  ],
  quiz: [
    {
      q: `Dans la relation « un client a plusieurs commandes », quelle table porte la clé étrangère ?`,
      options: ["<code>Customers</code>", "<code>Orders</code>", "Une table de jointure créée par EF"],
      answer: 1,
      why: `C'est toujours le côté « plusieurs » (le dépendant) qui porte la FK : chaque commande stocke l'Id de son client. Une table de jointure n'existe que pour le plusieurs-à-plusieurs.`
    },
    {
      q: `Tu fais <code>alice.Orders.Add(new Order())</code> puis <code>db.Customers.Add(alice)</code> et <code>SaveChanges()</code>. Que vaut le <code>CustomerId</code> de la commande ?`,
      options: ["0, il faut le remplir à la main", "L'Id d'Alice, rempli par EF", "<code>null</code>"],
      answer: 1,
      why: `EF insère d'abord le client, récupère son Id, puis le recopie dans la FK de chaque commande de la navigation. Tu n'as pas à le faire toi-même.`
    },
    {
      q: `Quelle écriture rend la relation commande → client <strong>optionnelle</strong> ?`,
      options: ["<code>public int CustomerId</code>", "<code>.OnDelete(DeleteBehavior.Restrict)</code>", "<code>public int? CustomerId</code>"],
      answer: 2,
      why: `Une FK nullable (<code>int?</code>) donne une colonne <code>NULL</code> : la commande peut exister sans client. <code>Restrict</code> règle la suppression, pas le caractère obligatoire.`
    },
    {
      q: `Avec <code>DeleteBehavior.Restrict</code>, que se passe-t-il si on supprime un client qui a des commandes ?`,
      options: ["SQL Server refuse et EF lève une <code>DbUpdateException</code>", "Les commandes sont supprimées aussi", "Le <code>CustomerId</code> des commandes passe à 0"],
      answer: 0,
      why: `<code>Restrict</code> interdit de supprimer un parent qui a encore des enfants. La suppression en chaîne, c'est <code>Cascade</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : relier les tables.</strong> Dans tes entités, ajoute les navigations <code>Customer.Orders</code>, <code>Order.Customer</code>, <code>Order.Lines</code> et <code>OrderLine.Product</code>. Dans <code>OrderFlowDbContext.OnModelCreating</code>, configure : <code>Customer → Orders</code> en <code>Restrict</code>, <code>Order → OrderLines</code> en <code>Cascade</code>, <code>OrderLine → Product</code> en <code>Restrict</code>. Génère la migration <code>AddOrderRelations</code>, lis-la pour retrouver les trois contraintes FK, puis applique-la.</p>`,
  resources: [
    { label: "Relations un-à-plusieurs (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/modeling/relationships/one-to-many" },
    { label: "Suppression en cascade (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/saving/cascade-delete" }
  ]
});

// =====================================================================
// 2. Relation un-à-un
// =====================================================================
window.COURSE.push({
  key: "ef-one-to-one",
  title: "Relation un-à-un",
  summary: "Tu sauras relier une entité à au plus une autre (un client et son profil), choisir quel côté porte la clé étrangère et comprendre l'index unique que crée EF.",
  objectives: [
    "Reconnaître une relation un-à-un et savoir quand l'utiliser",
    "Choisir le côté dépendant qui porte la clé étrangère",
    "Configurer la relation avec HasOne / WithOne / HasForeignKey<T>",
    "Prévoir le comportement quand on remplace ou supprime le profil"
  ],
  analogy: `<p>Pense à une <strong>voiture et sa carte grise</strong>. Une voiture a une seule carte grise, et une carte grise correspond à une seule voiture. C'est la carte grise qui porte le numéro de la voiture, pas l'inverse : sans voiture, elle n'a pas de sens.</p>
<p>Dans OrderFlow, c'est pareil pour un client et sa fiche de profil (téléphone, ville) : un profil appartient à un seul client.</p>`,
  lesson: `<h3>Un-à-un : un seul de chaque côté</h3>
<p>Une relation <strong>un-à-un</strong> relie une ligne d'une table à <em>au plus une</em> ligne d'une autre table. Exemple dans OrderFlow : un <code>Customer</code> peut avoir un <code>CustomerProfile</code> (téléphone, ville, adresse de livraison), et chaque profil appartient à un seul client.</p>
<p>Pourquoi ne pas tout mettre dans <code>Customers</code> ? Parce que le profil est facultatif, rarement lu, ou géré par une autre partie de l'application. Le séparer garde la table <code>Customers</code> légère.</p>

<h3>Qui porte la clé étrangère ?</h3>
<p>Dans un un-à-plusieurs, la question ne se pose pas : la FK est côté « plusieurs ». En un-à-un, les deux côtés sont « un », donc <strong>c'est toi qui choisis</strong>. La règle simple : la FK va sur le <strong>dépendant</strong>, celui qui ne peut pas exister sans l'autre. Un profil sans client n'a pas de sens, donc <code>CustomerProfile</code> porte <code>CustomerId</code>.</p>
<pre class="diagram">
 Customers              CustomerProfiles
+----+-------+         +----+-------+------------+
| Id | Name  |         | Id | City  | CustomerId |
+----+-------+         +----+-------+------------+
| 1  | Alice |&lt;--------| 1  | Lyon  | 1 (unique) |
| 2  | Bob   |         +----+-------+------------+
+----+-------+          Bob n'a pas de profil : OK
</pre>
<p>Pour que EF devine tout seul, il faut que la FK ait un nom qu'il reconnaît (<code>CustomerId</code>) et qu'elle soit dans une seule des deux classes. S'il hésite, il te le dit avec une erreur au démarrage, et tu le précises en Fluent API.</p>

<h3>La configuration en Fluent API</h3>
<p>La phrase se lit comme d'habitude : un client <code>HasOne</code> profil, un profil <code>WithOne</code> client. La seule nouveauté est <code>HasForeignKey&lt;CustomerProfile&gt;(p =&gt; p.CustomerId)</code> : le type entre chevrons indique <strong>quelle entité porte la FK</strong>, puisque EF ne peut pas le déduire du côté « plusieurs ».</p>
<table>
<tr><th>Relation</th><th>Fluent API</th><th>Où est la FK</th></tr>
<tr><td>Un-à-plusieurs</td><td><code>HasMany(...).WithOne(...)</code></td><td>Toujours côté « plusieurs »</td></tr>
<tr><td>Un-à-un</td><td><code>HasOne(...).WithOne(...)</code></td><td>Là où tu le dis avec <code>HasForeignKey&lt;T&gt;</code></td></tr>
</table>

<h3>L'index unique : la garantie du « un seul »</h3>
<p>Qu'est-ce qui empêche d'avoir deux profils pour Alice ? Un <strong>index unique</strong> sur <code>CustomerProfiles.CustomerId</code>. EF le crée automatiquement pour une relation un-à-un. Si tu essaies d'insérer un deuxième profil pour le même client, SQL Server refuse.</p>
<div class="compare"><div><h4>Un-à-plusieurs</h4><p>Index simple sur la FK : plusieurs commandes peuvent avoir le même <code>CustomerId</code>.</p></div><div><h4>Un-à-un</h4><p>Index <strong>unique</strong> sur la FK : un seul profil par <code>CustomerId</code>.</p></div></div>

<h3>Remplacer et supprimer</h3>
<p>Le profil est un dépendant obligatoire (<code>int CustomerId</code>), donc la suppression est en <code>Cascade</code> : supprimer le client supprime son profil. Et si tu charges un client avec son profil puis écris <code>alice.Profile = new CustomerProfile { ... }</code>, EF comprend que l'ancien profil est devenu <strong>orphelin</strong> (sans parent) : il le supprime et insère le nouveau.</p>
<div class="tip">Côté principal, déclare la navigation nullable : <code>CustomerProfile? Profile</code>. Un client <em>peut</em> ne pas avoir de profil, et le compilateur t'obligera à tester <code>null</code> avant de l'utiliser.</div>
<div class="note">Une variante existe : la <strong>clé primaire partagée</strong>, où l'Id du profil est aussi la FK vers le client (pas de colonne <code>Id</code> à part). C'est plus compact, mais moins courant. Et si les données du profil n'ont pas besoin de leur propre table, regarde les <em>owned types</em> ou les <em>complex types</em> : ils rangent ces propriétés directement dans la table <code>Customers</code>.</div>`,
  examples: [
    {
      title: "Un client, un profil (ou aucun)",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Customers.Add(new Customer
{
    Name = "Alice",
    Profile = new CustomerProfile { Phone = "06 12 34 56 78", City = "Lyon" }
});
db.Customers.Add(new Customer { Name = "Bob" }); // pas de profil : c'est permis
db.SaveChanges();
db.ChangeTracker.Clear();

foreach (var c in db.Customers.Include(c => c.Profile).OrderBy(c => c.Name))
    Console.WriteLine($"{c.Name} : {c.Profile?.City ?? "(pas de profil)"}");

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public CustomerProfile? Profile { get; set; } // 0 ou 1 profil
}

public class CustomerProfile
{
    public int Id { get; set; }
    public string Phone { get; set; } = "";
    public string City { get; set; } = "";
    public int CustomerId { get; set; }            // la clé étrangère est ICI
    public Customer Customer { get; set; } = null!;
}

public class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `Alice : Lyon
Bob : (pas de profil)`,
      steps: [
        "<code>public CustomerProfile? Profile</code> : navigation de référence nullable côté principal. Un client peut ne pas avoir de profil.",
        "<code>public int CustomerId</code> : la FK est dans <code>CustomerProfile</code>. EF en déduit que le profil est le dépendant, sans aucune configuration.",
        "<code>Profile = new CustomerProfile { ... }</code> : comme pour les commandes, ajouter le client ajoute aussi son profil, et EF remplit <code>CustomerId</code>.",
        "<code>db.Customers.Include(c =&gt; c.Profile)</code> : on demande à EF de charger le profil avec le client (on verra <code>Include</code> en détail deux leçons plus loin).",
        "<code>c.Profile?.City ?? \"(pas de profil)\"</code> : pour Bob, <code>Profile</code> vaut <code>null</code>, donc on affiche le texte par défaut."
      ]
    },
    {
      title: "La configuration explicite et l'index unique",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
var script = db.Database.GenerateCreateScript();
// On n'affiche que la partie qui concerne CustomerProfiles
Console.WriteLine(script[script.IndexOf("CREATE TABLE [CustomerProfiles]")..].Trim());

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public CustomerProfile? Profile { get; set; }
}
public class CustomerProfile
{
    public int Id { get; set; }
    public string Phone { get; set; } = "";
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerProfile> CustomerProfiles => Set<CustomerProfile>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Customer>()
            .HasOne(c => c.Profile)              // un client a un profil
            .WithOne(p => p.Customer)            // un profil a un client
            .HasForeignKey<CustomerProfile>(p => p.CustomerId); // <T> : qui porte la FK
        modelBuilder.Entity<CustomerProfile>().Property(p => p.Phone).HasMaxLength(20);
    }
}`,
      output: `CREATE TABLE [CustomerProfiles] (
    [Id] int NOT NULL IDENTITY,
    [Phone] nvarchar(20) NOT NULL,
    [CustomerId] int NOT NULL,
    CONSTRAINT [PK_CustomerProfiles] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_CustomerProfiles_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([Id]) ON DELETE CASCADE
);
GO


CREATE UNIQUE INDEX [IX_CustomerProfiles_CustomerId] ON [CustomerProfiles] ([CustomerId]);
GO`,
      steps: [
        "<code>script[script.IndexOf(\"CREATE TABLE [CustomerProfiles]\")..]</code> : on coupe le script pour ne garder que la table qui nous intéresse (la syntaxe <code>[début..]</code> prend la fin de la chaîne).",
        "<code>.HasOne(c =&gt; c.Profile).WithOne(p =&gt; p.Customer)</code> : les deux côtés sont « un ».",
        "<code>.HasForeignKey&lt;CustomerProfile&gt;(p =&gt; p.CustomerId)</code> : le type générique désigne la classe qui porte la FK. Sans lui, EF ne saurait pas de quel côté la mettre.",
        "<code>ON DELETE CASCADE</code> : le profil est un dépendant obligatoire, il disparaît avec son client.",
        "<code>CREATE UNIQUE INDEX</code> : c'est cet index unique qui garantit « un seul profil par client » au niveau de la base."
      ],
      explain: "Le mot UNIQUE dans le script est toute la différence avec un un-à-plusieurs."
    },
    {
      title: "Remplacer un profil, et en ajouter un de trop",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Customers.Add(new Customer { Name = "Alice", Profile = new() { Phone = "0611111111" } });
db.SaveChanges();
db.ChangeTracker.Clear();

// 1. Remplacer le profil : on charge l'ancien, puis on en met un nouveau
var alice = db.Customers.Include(c => c.Profile).Single();
alice.Profile = new CustomerProfile { Phone = "0622222222" };
db.SaveChanges(); // DELETE de l'ancien profil + INSERT du nouveau
Console.WriteLine($"Profils : {db.CustomerProfiles.Count()}, téléphone : {alice.Profile.Phone}");

// 2. Insérer un 2e profil pour le même client : l'index unique refuse
db.ChangeTracker.Clear();
db.CustomerProfiles.Add(new CustomerProfile { Phone = "0633333333", CustomerId = alice.Id });
try { db.SaveChanges(); }
catch (DbUpdateException ex) { Console.WriteLine(ex.InnerException!.Message.Split(". ")[0]); }

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public CustomerProfile? Profile { get; set; }
}
public class CustomerProfile
{
    public int Id { get; set; }
    public string Phone { get; set; } = "";
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerProfile> CustomerProfiles => Set<CustomerProfile>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `Profils : 1, téléphone : 0622222222
Cannot insert duplicate key row in object 'dbo.CustomerProfiles' with unique index 'IX_CustomerProfiles_CustomerId'`,
      steps: [
        "<code>Profile = new() { Phone = \"0611111111\" }</code> : <code>new()</code> sans nom de type, C# le déduit de la propriété (<code>CustomerProfile</code>).",
        "<code>db.Customers.Include(c =&gt; c.Profile).Single()</code> : on charge Alice <strong>avec</strong> son profil actuel, pour que EF sache qu'il existe.",
        "<code>alice.Profile = new CustomerProfile { ... };</code> : l'ancien profil n'a plus de parent. Comme il est obligatoire, EF le supprime au <code>SaveChanges()</code> puis insère le nouveau.",
        "<code>db.ChangeTracker.Clear();</code> : on oublie ce que le contexte sait, sinon EF « réparerait » la relation en mémoire au lieu d'envoyer un INSERT en double.",
        "<code>db.CustomerProfiles.Add(... CustomerId = alice.Id ...)</code> : on force un deuxième profil pour Alice.",
        "<code>Cannot insert duplicate key row...</code> : SQL Server refuse grâce à l'index unique, EF lève une <code>DbUpdateException</code>."
      ],
      explain: "La règle « un seul profil par client » est garantie deux fois : par EF en mémoire, et par l'index unique en base."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire depuis le profil",
      prompt: `<p>Avec le modèle de l'exemple 3, charge le profil d'Alice <strong>en partant du profil</strong> (<code>db.CustomerProfiles</code>) et affiche le nom du client et son téléphone.</p>`,
      hint: `<p>La navigation <code>Customer</code> du profil se charge aussi avec <code>Include</code>.</p>`,
      solution: `var profile = db.CustomerProfiles
    .Include(p => p.Customer)
    .Single(p => p.Customer.Name == "Alice");
Console.WriteLine($"{profile.Customer.Name} : {profile.Phone}");`
    },
    {
      level: "moyen",
      title: "Supprimer un client et son profil",
      prompt: `<p>Toujours avec le modèle de l'exemple 3 : supprime Alice et vérifie que son profil a disparu avec elle. Affiche le nombre de clients et de profils avant et après.</p>`,
      hint: `<p>La FK du profil est obligatoire : la suppression est en cascade par défaut (<code>ON DELETE CASCADE</code>).</p>`,
      solution: `Console.WriteLine($"Avant : {db.Customers.Count()} client(s), {db.CustomerProfiles.Count()} profil(s)");

var alice = db.Customers.Single(c => c.Name == "Alice");
db.Customers.Remove(alice);
db.SaveChanges(); // SQL Server supprime le profil grâce à ON DELETE CASCADE

Console.WriteLine($"Après : {db.Customers.Count()} client(s), {db.CustomerProfiles.Count()} profil(s)");
// Avant : 1 client(s), 1 profil(s)
// Après : 0 client(s), 0 profil(s)`
    },
    {
      level: "difficile",
      title: "Clé primaire partagée",
      prompt: `<p>Transforme <code>CustomerProfile</code> pour qu'il n'ait <strong>plus de colonne Id</strong> : sa clé primaire doit être <code>CustomerId</code>, qui reste aussi la clé étrangère vers le client. Configure-le en Fluent API, enregistre un profil, relis-le avec son client et affiche le script de la table pour vérifier.</p>`,
      hint: `<p>Deux appels : <code>Entity&lt;CustomerProfile&gt;().HasKey(p =&gt; p.CustomerId)</code>, puis la relation avec <code>HasForeignKey&lt;CustomerProfile&gt;(p =&gt; p.CustomerId)</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Customers.Add(new Customer { Name = "Alice", Profile = new() { Phone = "0611111111" } });
db.SaveChanges();
db.ChangeTracker.Clear();

var profile = db.CustomerProfiles.Include(p => p.Customer).Single();
Console.WriteLine($"Profil {profile.CustomerId} -> {profile.Customer.Name}, {profile.Phone}");
var script = db.Database.GenerateCreateScript();
Console.WriteLine(script[script.IndexOf("CREATE TABLE [CustomerProfiles]")..].Trim());
// PRIMARY KEY ([CustomerId]) et FOREIGN KEY ([CustomerId]) sur la même colonne

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public CustomerProfile? Profile { get; set; }
}
public class CustomerProfile
{
    public int CustomerId { get; set; } // à la fois clé primaire ET clé étrangère
    public string Phone { get; set; } = "";
    public Customer Customer { get; set; } = null!;
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<CustomerProfile> CustomerProfiles => Set<CustomerProfile>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<CustomerProfile>().HasKey(p => p.CustomerId);
        modelBuilder.Entity<Customer>()
            .HasOne(c => c.Profile)
            .WithOne(p => p.Customer)
            .HasForeignKey<CustomerProfile>(p => p.CustomerId);
    }
}`
    }
  ],
  quiz: [
    {
      q: `En un-à-un, comment EF sait-il quelle table porte la clé étrangère ?`,
      options: ["Grâce à la propriété FK présente d'un seul côté, ou à <code>HasForeignKey&lt;T&gt;</code>", "C'est toujours la table créée en premier", "Il crée une FK des deux côtés"],
      answer: 0,
      why: `Les deux côtés sont « un », EF ne peut donc pas utiliser la règle du côté « plusieurs ». Il regarde où se trouve la propriété FK, et sinon tu le lui dis avec <code>HasForeignKey&lt;T&gt;</code>.`
    },
    {
      q: `Qu'est-ce qui empêche, en base, d'avoir deux profils pour le même client ?`,
      options: ["La propriété de navigation <code>Profile</code>", "La suppression en cascade", "L'index unique sur <code>CustomerId</code>"],
      answer: 2,
      why: `La navigation n'existe qu'en C#. Côté SQL Server, c'est l'index <code>UNIQUE</code> sur la FK qui refuse un deuxième profil.`
    },
    {
      q: `Tu charges un client avec son profil puis écris <code>client.Profile = new CustomerProfile()</code>. Que fait <code>SaveChanges()</code> ?`,
      options: ["Il lève une erreur d'index unique", "Il supprime l'ancien profil et insère le nouveau", "Il garde les deux profils"],
      answer: 1,
      why: `L'ancien profil devient orphelin. Comme sa FK est obligatoire, EF le supprime puis insère le nouveau. L'erreur d'index unique n'arrive que si EF ne connaît pas l'ancien profil (non chargé).`
    }
  ],
  project: `<p><strong>OrderFlow : le profil client.</strong> Ajoute une entité <code>CustomerProfile</code> (<code>Id</code>, <code>Phone</code> en <code>nvarchar(20)</code>, <code>ShippingAddress</code> en <code>nvarchar(300)</code>, <code>CustomerId</code>) et la navigation <code>Customer.Profile</code> nullable. Configure la relation un-à-un dans <code>OrderFlowDbContext</code> avec <code>HasForeignKey&lt;CustomerProfile&gt;</code>. Génère la migration <code>AddCustomerProfile</code> et vérifie qu'elle contient bien un <code>unique: true</code> sur l'index de <code>CustomerId</code>.</p>`,
  resources: [
    { label: "Relations un-à-un (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/modeling/relationships/one-to-one" }
  ]
});

// =====================================================================
// 3. Relation plusieurs-à-plusieurs
// =====================================================================
window.COURSE.push({
  key: "ef-many-to-many",
  title: "Relation plusieurs-à-plusieurs",
  summary: "Tu sauras relier des produits à des catégories avec une table de jointure, la laisser gérer par EF ou la déclarer toi-même quand elle porte des données.",
  objectives: [
    "Comprendre pourquoi un plusieurs-à-plusieurs a besoin d'une table de jointure",
    "Déclarer deux collections et laisser EF créer la table de jointure",
    "Renommer la table de jointure avec UsingEntity",
    "Utiliser une entité de jointure explicite quand le lien a ses propres données"
  ],
  analogy: `<p>Pense aux <strong>élèves et aux cours</strong> d'un lycée. Un élève suit plusieurs cours, et un cours a plusieurs élèves. On ne peut pas écrire « le cours » sur la fiche de l'élève (il y en a plusieurs), ni « l'élève » sur la fiche du cours. Alors on tient une <strong>feuille d'inscriptions</strong> à part : une ligne par couple (élève, cours).</p>
<p>Et si on veut noter la date d'inscription ou la note finale, c'est sur cette feuille qu'on l'écrit : elle devient une vraie fiche à elle seule.</p>`,
  lesson: `<h3>Pourquoi une troisième table ?</h3>
<p>Dans OrderFlow, un produit peut être rangé dans plusieurs catégories (un clavier est dans « Bureau » et « Informatique »), et une catégorie contient plusieurs produits. C'est une relation <strong>plusieurs-à-plusieurs</strong>. Impossible de la stocker avec une seule clé étrangère : une colonne ne contient qu'une valeur.</p>
<p>La solution SQL classique est une <strong>table de jointure</strong> : une table qui ne contient que des couples (ProductId, CategoryId). Chaque ligne dit « ce produit est dans cette catégorie ».</p>
<pre class="diagram">
 Products       ProductCategories  Categories
               (ProductsId,
                CategoriesId)
 1 Clavier   &lt;--  (1, 1)  --&gt;  1 Bureau
 1 Clavier   &lt;--  (1, 2)  --&gt;  2 Informatique
 2 Agrafeuse &lt;--  (2, 1)  --&gt;  1 Bureau
</pre>

<h3>La version simple : deux collections, et c'est tout</h3>
<p>Avec EF Core, tu n'as même pas besoin de créer une classe pour la table de jointure. Il suffit de mettre une collection de chaque côté : <code>List&lt;Category&gt; Categories</code> dans <code>Product</code> et <code>List&lt;Product&gt; Products</code> dans <code>Category</code>. EF voit deux collections qui se répondent et crée tout seul la table de jointure. Ces navigations qui « sautent » par-dessus la table de jointure s'appellent des <strong>skip navigations</strong>.</p>
<p>Par défaut, la table s'appelle <code>CategoryProduct</code> (les deux noms de classes, par ordre alphabétique) et ses colonnes <code>CategoriesId</code> et <code>ProductsId</code>. Sa clé primaire est le couple des deux colonnes : impossible de mettre deux fois le même produit dans la même catégorie.</p>
<div class="flow"><span>product.Categories.Add(cat)</span><span>SaveChanges()</span><span>INSERT dans la table de jointure</span></div>
<p>Pour ajouter ou retirer un lien, tu manipules simplement la collection : <code>Add</code> crée une ligne de jointure, <code>Remove</code> la supprime. Le produit et la catégorie, eux, restent en place.</p>

<h3>Renommer la table de jointure</h3>
<p>Le nom <code>CategoryProduct</code> ne te plaît pas ? En Fluent API, <code>HasMany(...).WithMany(...)</code> décrit la relation, et <code>UsingEntity("ProductCategories")</code> donne le nom de la table. Tu n'écris toujours aucune classe pour elle.</p>

<h3>Quand le lien porte des données</h3>
<p>Parfois, le lien lui-même a des informations. Exemple : quelle est la catégorie <em>principale</em> du produit ? Ou mieux, un exemple que tu connais déjà : une <strong>commande</strong> contient plusieurs <strong>produits</strong>, un produit apparaît dans plusieurs commandes, et chaque lien a une <strong>quantité</strong> et un <strong>prix unitaire</strong>. C'est exactement <code>OrderLine</code> !</p>
<p>Dans ce cas, tu crées une vraie classe pour la jointure (on parle d'<strong>entité de jointure explicite</strong>). Elle a deux relations un-à-plusieurs : <code>Order → OrderLines</code> et <code>Product → OrderLines</code>.</p>
<div class="compare"><div><h4>Jointure implicite</h4><p>Pas de classe, juste deux collections. Parfait quand le lien est un simple « appartient à » (produits et catégories).</p></div><div><h4>Entité de jointure</h4><p>Une vraie classe avec ses propriétés. Obligatoire dès que le lien a ses propres données (quantité, date, rôle).</p></div></div>
<div class="tip">Un bon test : si tu as envie d'ajouter une colonne sur le lien (« depuis quand ? », « combien ? »), il te faut une entité de jointure explicite. Passer de l'une à l'autre plus tard demande une migration, donc pose-toi la question tôt.</div>
<div class="note">Avec une entité de jointure explicite, sa clé est souvent composite (les deux FK) : <code>HasKey(pc =&gt; new { pc.ProductId, pc.CategoryId })</code>. Pour <code>OrderLine</code>, on garde un <code>Id</code> à part, car un même produit pourrait apparaître sur deux lignes d'une commande (avec deux prix différents, par exemple).</div>`,
  examples: [
    {
      title: "Produits et catégories, sans classe de jointure",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();

var office = new Category { Name = "Bureau" };
var tech = new Category { Name = "Informatique" };
db.Products.Add(new Product { Name = "Clavier", Categories = [office, tech] });
db.Products.Add(new Product { Name = "Agrafeuse", Categories = [office] });
db.SaveChanges();
db.ChangeTracker.Clear();

foreach (var c in db.Categories.Include(c => c.Products).OrderBy(c => c.Name))
    Console.WriteLine($"{c.Name} : {string.Join(", ", c.Products.Select(p => p.Name).Order())}");

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Category> Categories { get; set; } = []; // plusieurs catégories
}

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Product> Products { get; set; } = [];    // plusieurs produits
}

public class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `Bureau : Agrafeuse, Clavier
Informatique : Clavier`,
      steps: [
        "<code>List&lt;Category&gt; Categories</code> et <code>List&lt;Product&gt; Products</code> : deux collections qui se répondent. EF en déduit un plusieurs-à-plusieurs.",
        "<code>Categories = [office, tech]</code> : le clavier est relié aux deux catégories. La catégorie <code>office</code> est le <em>même objet</em> pour les deux produits.",
        "<code>db.SaveChanges();</code> : EF insère 2 produits, 2 catégories (une seule fois chacune) et 3 lignes dans la table de jointure.",
        "<code>db.Categories.Include(c =&gt; c.Products)</code> : on charge chaque catégorie avec ses produits ; EF fait la jointure pour toi.",
        "<code>c.Products.Select(p =&gt; p.Name).Order()</code> : ici on est en LINQ to Objects sur une liste en mémoire, pour afficher les noms triés."
      ],
      explain: "Tu n'as jamais écrit le mot « jointure » : EF gère la table cachée."
    },
    {
      title: "Nommer la table de jointure",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
var script = db.Database.GenerateCreateScript();
Console.WriteLine(script[script.IndexOf("CREATE TABLE [ProductCategories]")..].Trim());

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Category> Categories { get; set; } = [];
}
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Product> Products { get; set; } = [];
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.Entity<Product>()
            .HasMany(p => p.Categories)
            .WithMany(c => c.Products)
            .UsingEntity("ProductCategories"); // nom de la table de jointure
}`,
      output: `CREATE TABLE [ProductCategories] (
    [CategoriesId] int NOT NULL,
    [ProductsId] int NOT NULL,
    CONSTRAINT [PK_ProductCategories] PRIMARY KEY ([CategoriesId], [ProductsId]),
    CONSTRAINT [FK_ProductCategories_Categories_CategoriesId] FOREIGN KEY ([CategoriesId]) REFERENCES [Categories] ([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ProductCategories_Products_ProductsId] FOREIGN KEY ([ProductsId]) REFERENCES [Products] ([Id]) ON DELETE CASCADE
);
GO


CREATE INDEX [IX_ProductCategories_ProductsId] ON [ProductCategories] ([ProductsId]);
GO`,
      steps: [
        "<code>.HasMany(p =&gt; p.Categories).WithMany(c =&gt; c.Products)</code> : « plusieurs » des deux côtés, d'où <code>HasMany</code> + <code>WithMany</code>.",
        "<code>.UsingEntity(\"ProductCategories\")</code> : on ne fait que nommer la table. Sans cette ligne, elle s'appellerait <code>CategoryProduct</code>.",
        "<code>PRIMARY KEY ([CategoriesId], [ProductsId])</code> : une clé composite. Le même couple ne peut pas exister deux fois.",
        "<code>ON DELETE CASCADE</code> (deux fois) : supprimer un produit ou une catégorie supprime ses liens, pas l'autre côté. Supprimer « Bureau » ne supprime aucun produit.",
        "<code>CREATE INDEX [IX_ProductCategories_ProductsId]</code> : la clé primaire commence par <code>CategoriesId</code>, donc EF ajoute un index pour chercher vite dans l'autre sens."
      ]
    },
    {
      title: "OrderLine : une jointure qui porte des données",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using System.Globalization;
using Microsoft.EntityFrameworkCore;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture; // point décimal partout
using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
var order = new Order();
order.Lines.Add(new OrderLine { Product = new() { Name = "Clavier" }, Quantity = 1, UnitPrice = 49.90m });
order.Lines.Add(new OrderLine { Product = new() { Name = "Souris" }, Quantity = 3, UnitPrice = 19.90m });
db.Orders.Add(order);
db.SaveChanges();
db.ChangeTracker.Clear();

var saved = db.Orders.Include(o => o.Lines).ThenInclude(l => l.Product).Single();
foreach (var line in saved.Lines)
    Console.WriteLine($"{line.Quantity} x {line.Product.Name} à {line.UnitPrice} €");
Console.WriteLine($"Total : {saved.Lines.Sum(l => l.Quantity * l.UnitPrice)} €");

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
}
public class Order
{
    public int Id { get; set; }
    public List<OrderLine> Lines { get; set; } = [];
}
public class OrderLine // entité de jointure Order <-> Product, avec ses propres données
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int Quantity { get; set; }
    [Precision(10, 2)] public decimal UnitPrice { get; set; }
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `1 x Clavier à 49.90 €
3 x Souris à 19.90 €
Total : 109.60 €`,
      steps: [
        "<code>CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;</code> : les décimaux s'affichent avec un point, quelle que soit la langue de ta machine.",
        "<code>public class OrderLine</code> : une vraie classe pour le lien, avec deux FK (<code>OrderId</code>, <code>ProductId</code>) et ses données (<code>Quantity</code>, <code>UnitPrice</code>).",
        "<code>[Precision(10, 2)]</code> : un attribut EF qui donne la colonne <code>decimal(10,2)</code> du schéma OrderFlow.",
        "<code>new OrderLine { Product = new() { Name = \"Clavier\" }, ... }</code> : on crée le produit au passage ; EF l'insère avant la ligne et remplit <code>ProductId</code>.",
        "<code>.Include(o =&gt; o.Lines).ThenInclude(l =&gt; l.Product)</code> : on charge les lignes, puis pour chaque ligne son produit. <code>ThenInclude</code> descend d'un niveau.",
        "<code>saved.Lines.Sum(l =&gt; l.Quantity * l.UnitPrice)</code> : 1 × 49.90 + 3 × 19.90 = 109.60."
      ],
      explain: "Une commande et ses produits, c'est un plusieurs-à-plusieurs dont le lien (la ligne) a ses propres données."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ajouter une catégorie à un produit existant",
      prompt: `<p>Avec le modèle de l'exemple 1, crée une catégorie « Promo » puis ajoute-la à l'<strong>Agrafeuse</strong> déjà en base. Affiche ensuite les catégories de l'agrafeuse.</p>`,
      hint: `<p>Charge le produit avec <code>Include(p =&gt; p.Categories)</code>, puis fais <code>product.Categories.Add(...)</code> et <code>SaveChanges()</code>.</p>`,
      solution: `var stapler = db.Products.Include(p => p.Categories).Single(p => p.Name == "Agrafeuse");
stapler.Categories.Add(new Category { Name = "Promo" });
db.SaveChanges(); // INSERT de la catégorie + INSERT dans la table de jointure

Console.WriteLine(string.Join(", ", stapler.Categories.Select(c => c.Name)));
// Bureau, Promo`
    },
    {
      level: "moyen",
      title: "Retirer un lien sans rien supprimer d'autre",
      prompt: `<p>Toujours avec l'exemple 1 : retire la catégorie « Informatique » du <strong>Clavier</strong>. Vérifie ensuite que la catégorie existe toujours en base, mais qu'elle ne contient plus aucun produit.</p>`,
      hint: `<p><code>Remove</code> sur la collection supprime seulement la ligne de jointure. Charge le produit avec ses catégories avant.</p>`,
      solution: `var keyboard = db.Products.Include(p => p.Categories).Single(p => p.Name == "Clavier");
var tech = keyboard.Categories.Single(c => c.Name == "Informatique");
keyboard.Categories.Remove(tech);
db.SaveChanges(); // un seul DELETE, dans la table de jointure

var check = db.Categories.Include(c => c.Products).Single(c => c.Name == "Informatique");
Console.WriteLine($"{check.Name} existe, {check.Products.Count} produit(s)");
// Informatique existe, 0 produit(s)`
    },
    {
      level: "difficile",
      title: "La catégorie principale",
      prompt: `<p>On veut savoir quelle est la catégorie <strong>principale</strong> de chaque produit. Remplace la jointure implicite par une entité de jointure explicite <code>ProductCategory</code> (<code>ProductId</code>, <code>CategoryId</code>, <code>IsPrimary</code>) avec une clé composite. Crée un clavier dans « Informatique » (principale) et « Bureau », puis affiche la catégorie principale de chaque produit avec une projection.</p>`,
      hint: `<p>Chaque côté a maintenant une <code>List&lt;ProductCategory&gt;</code>. Dans le <code>Select</code>, cherche <code>p.ProductCategories.Where(pc =&gt; pc.IsPrimary).Select(pc =&gt; pc.Category.Name).FirstOrDefault()</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();

var office = new Category { Name = "Bureau" };
var tech = new Category { Name = "Informatique" };
db.Products.Add(new Product
{
    Name = "Clavier",
    ProductCategories = [new() { Category = tech, IsPrimary = true }, new() { Category = office }]
});
db.SaveChanges();

var rows = db.Products
    .Select(p => new
    {
        p.Name,
        Primary = p.ProductCategories.Where(pc => pc.IsPrimary).Select(pc => pc.Category.Name).FirstOrDefault()
    })
    .ToList();
foreach (var r in rows)
    Console.WriteLine($"{r.Name} : catégorie principale = {r.Primary}");
// Clavier : catégorie principale = Informatique

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<ProductCategory> ProductCategories { get; set; } = [];
}
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<ProductCategory> ProductCategories { get; set; } = [];
}
public class ProductCategory // entité de jointure explicite
{
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public bool IsPrimary { get; set; } // la donnée en plus
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.Entity<ProductCategory>().HasKey(pc => new { pc.ProductId, pc.CategoryId }); // clé composite
}`
    }
  ],
  quiz: [
    {
      q: `Pourquoi une relation plusieurs-à-plusieurs a-t-elle besoin d'une table de jointure ?`,
      options: ["Parce que SQL Server l'impose pour les performances", "Parce qu'une colonne FK ne peut contenir qu'une seule valeur", "Parce que EF ne sait pas faire de JOIN"],
      answer: 1,
      why: `Une clé étrangère contient un seul Id. Pour relier une ligne à plusieurs autres <em>dans les deux sens</em>, il faut une table qui stocke les couples d'Id.`
    },
    {
      q: `Que fait <code>product.Categories.Remove(cat)</code> suivi de <code>SaveChanges()</code> ?`,
      options: ["Il supprime la catégorie de la base", "Il supprime le produit", "Il supprime seulement la ligne dans la table de jointure"],
      answer: 2,
      why: `Retirer un élément d'une skip navigation supprime le lien, pas les entités. Le produit et la catégorie restent en base.`
    },
    {
      q: `Dans quel cas faut-il une entité de jointure explicite ?`,
      options: ["Quand le lien porte ses propres données (quantité, date...)", "Dès qu'il y a plus de 100 lignes", "Quand les deux tables ont des clés <code>int</code>"],
      answer: 0,
      why: `Une jointure implicite ne contient que les deux FK. Dès que tu veux stocker une information sur le lien lui-même, comme la quantité d'une <code>OrderLine</code>, il te faut une vraie classe.`
    },
    {
      q: `Sans configuration, comment s'appelle la table de jointure entre <code>Product</code> et <code>Category</code> ?`,
      options: ["<code>ProductCategories</code>", "<code>CategoryProduct</code>", "<code>Products_Categories</code>"],
      answer: 1,
      why: `Par convention, EF assemble les deux noms de classes par ordre alphabétique : <code>CategoryProduct</code>. Pour un autre nom, utilise <code>UsingEntity(\"...\")</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : les catégories.</strong> Ajoute une entité <code>Category</code> (<code>Id</code>, <code>Name</code> en <code>nvarchar(100)</code>) et les collections <code>Product.Categories</code> / <code>Category.Products</code>. Dans <code>OrderFlowDbContext</code>, nomme la table de jointure <code>ProductCategories</code> avec <code>UsingEntity</code>. Vérifie aussi que <code>OrderLine</code> est bien configurée comme une entité de jointure entre <code>Order</code> et <code>Product</code> (deux FK, <code>Quantity</code>, <code>UnitPrice</code> en <code>decimal(10,2)</code>). Génère la migration <code>AddCategories</code>.</p>`,
  resources: [
    { label: "Relations plusieurs-à-plusieurs (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/modeling/relationships/many-to-many" }
  ]
});

// =====================================================================
// 4. Charger les données liées
// =====================================================================
window.COURSE.push({
  key: "ef-loading",
  title: "Charger les données liées : Include, chargement explicite et lazy loading",
  summary: "Tu sauras charger les commandes d'un client au bon moment, avec la bonne méthode, et repérer le fameux problème N+1.",
  objectives: [
    "Comprendre pourquoi une navigation est vide par défaut",
    "Charger les données liées d'avance avec Include et ThenInclude",
    "Charger à la demande avec le chargement explicite",
    "Reconnaître le lazy loading et le piège des requêtes N+1"
  ],
  analogy: `<p>Tu commandes au restaurant. Le <strong>chargement anticipé</strong> (<code>Include</code>), c'est le menu complet : entrée, plat et dessert arrivent ensemble. Le <strong>chargement explicite</strong>, c'est appeler le serveur quand tu décides de prendre un dessert. Le <strong>lazy loading</strong>, c'est un serveur qui court en cuisine chaque fois que tu regardes une assiette vide.</p>
<p>Pour une personne, le troisième est pratique. Pour une table de cinquante, le serveur fait cinquante allers-retours : c'est le problème N+1.</p>`,
  lesson: `<h3>Par défaut, EF ne charge que ce que tu demandes</h3>
<p>Quand tu écris <code>db.Customers.Single(c =&gt; c.Name == "Alice")</code>, EF envoie un <code>SELECT</code> sur la table <code>Customers</code>, et rien d'autre. La propriété <code>alice.Orders</code> existe, mais elle est <strong>vide</strong> : EF n'est pas allé chercher les commandes. Ce n'est pas un bug, c'est voulu : charger toutes les données liées à chaque requête serait beaucoup trop lourd.</p>
<p>Attention au piège : une liste vide ne veut pas dire « ce client n'a pas de commandes ». Ça peut vouloir dire « personne ne les a chargées ». Il existe trois façons de les charger.</p>
<table>
<tr><th>Méthode</th><th>Quand les données arrivent</th><th>Nombre de requêtes</th></tr>
<tr><td>Chargement anticipé (<code>Include</code>)</td><td>Avec la requête principale</td><td>1 (avec un JOIN)</td></tr>
<tr><td>Chargement explicite (<code>Entry(...).Load()</code>)</td><td>Quand tu appelles <code>Load()</code></td><td>1 de plus, au moment choisi</td></tr>
<tr><td>Lazy loading (chargement paresseux)</td><td>Au premier accès à la propriété</td><td>1 de plus par objet parcouru</td></tr>
</table>

<h3>Include : le chargement anticipé</h3>
<p><code>Include(c =&gt; c.Orders)</code> dit à EF : « charge aussi les commandes, dans la même requête ». EF ajoute un <code>LEFT JOIN</code> et remplit la liste. C'est la méthode la plus courante, à utiliser quand tu sais <strong>d'avance</strong> que tu auras besoin des données liées.</p>
<p>Pour descendre plus bas, enchaîne <code>ThenInclude</code> : <code>Include(o =&gt; o.Lines).ThenInclude(l =&gt; l.Product)</code> charge les lignes, puis le produit de chaque ligne. Et pour ne charger qu'une partie d'une collection, tu peux filtrer dans l'<code>Include</code> : <code>Include(c =&gt; c.Orders.Where(o =&gt; o.Status == "Paid"))</code>. C'est l'<strong>Include filtré</strong>.</p>
<div class="flow"><span>Customers</span><span>Include(Orders)</span><span>ThenInclude(Lines)</span><span>ThenInclude(Product)</span></div>
<div class="tip">Chaque <code>Include</code> sur une collection ajoute un JOIN qui multiplie les lignes renvoyées (un client avec 10 commandes de 10 lignes = 100 lignes). Si tu enchaînes plusieurs collections, ajoute <code>.AsSplitQuery()</code> : EF fera une requête par collection au lieu d'un énorme JOIN.</div>

<h3>Le chargement explicite</h3>
<p>Parfois, tu ne sais qu'après coup si tu as besoin des données liées. Tu as déjà le client en mémoire ; tu demandes alors : <code>db.Entry(alice).Collection(c =&gt; c.Orders).Load()</code>. EF envoie une requête ciblée et remplit la liste. Pour une navigation de référence, c'est <code>Reference(o =&gt; o.Customer).Load()</code>.</p>
<p>Bonus : <code>.Query()</code> te donne une requête LINQ sur la collection, sans la charger. <code>db.Entry(alice).Collection(c =&gt; c.Orders).Query().Count()</code> envoie un simple <code>COUNT</code> en base. Parfait pour afficher « 12 commandes » sans en charger aucune.</p>

<h3>Le lazy loading et le problème N+1</h3>
<p>Le <strong>lazy loading</strong> charge une navigation automatiquement, la première fois que ton code la lit. Il faut l'activer : package <code>Microsoft.EntityFrameworkCore.Proxies</code>, <code>UseLazyLoadingProxies()</code>, et des navigations <code>virtual</code>. EF crée alors des <strong>proxies</strong> : des classes dérivées des tiennes, générées à l'exécution, qui interceptent l'accès à <code>Orders</code> pour lancer la requête.</p>
<p>C'est confortable, mais dangereux. Une boucle sur 100 clients qui affiche <code>c.Orders.Count</code> envoie 1 requête pour les clients, puis <strong>1 requête par client</strong> : 101 allers-retours. C'est le <strong>problème N+1</strong>, l'une des premières causes de lenteur dans les applications EF.</p>
<pre class="diagram">
 Include (1 requête)       Lazy loading (N+1)
 SELECT ... LEFT JOIN      SELECT clients        (1)
 -&gt; tout arrive            SELECT commandes c=1  (+1)
                           SELECT commandes c=2  (+1)
                           ... une par client
</pre>
<div class="note">En pro, la plupart des équipes <strong>n'activent pas</strong> le lazy loading, surtout dans une API : les requêtes cachées sont difficiles à repérer et le contexte doit rester ouvert. Préfère <code>Include</code>, ou mieux encore une projection avec <code>Select</code> (leçon suivante), qui ne charge que les colonnes utiles. Et active les logs SQL en développement pour voir combien de requêtes part chaque écran.</div>

<h3>Voir le SQL envoyé</h3>
<p>Deux outils t'aident à vérifier ce que fait EF. <code>query.ToQueryString()</code> renvoie le SQL d'une requête LINQ sans l'exécuter. Et <code>LogTo</code> dans <code>OnConfiguring</code> affiche chaque commande au moment où elle part : c'est ce qu'on utilise dans les exemples 2 et 3 pour compter les requêtes.</p>`,
  examples: [
    {
      title: "Sans Include, avec Include",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Customers.Add(new Customer { Name = "Alice", Orders = [new Order(), new Order()] });
db.SaveChanges();
db.ChangeTracker.Clear();

// Sans Include : EF ne charge QUE le client
var a1 = db.Customers.Single(c => c.Name == "Alice");
Console.WriteLine($"Sans Include : {a1.Orders.Count} commande(s)");
db.ChangeTracker.Clear();

// Avec Include : EF charge le client ET ses commandes
var query = db.Customers.Include(c => c.Orders).Where(c => c.Name == "Alice");
var a2 = query.Single();
Console.WriteLine($"Avec Include : {a2.Orders.Count} commande(s)");
Console.WriteLine(query.ToQueryString());

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Order> Orders { get; set; } = [];
}
public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `Sans Include : 0 commande(s)
Avec Include : 2 commande(s)
SELECT [c].[Id], [c].[Name], [o].[Id], [o].[CustomerId]
FROM [Customers] AS [c]
LEFT JOIN [Orders] AS [o] ON [c].[Id] = [o].[CustomerId]
WHERE [c].[Name] = N'Alice'
ORDER BY [c].[Id]`,
      steps: [
        "<code>db.ChangeTracker.Clear();</code> : après l'insertion, on vide la mémoire du contexte. Sinon EF relierait les commandes déjà en mémoire et fausserait la démo.",
        "<code>db.Customers.Single(c =&gt; c.Name == \"Alice\")</code> : un SELECT sur <code>Customers</code> seulement. <code>a1.Orders</code> reste une liste vide : 0 commande.",
        "<code>db.Customers.Include(c =&gt; c.Orders)</code> : on demande les commandes en plus. La requête n'est pas encore exécutée, on construit juste la question.",
        "<code>query.Single()</code> : la requête part ; <code>a2.Orders</code> contient bien les 2 commandes.",
        "<code>query.ToQueryString()</code> : affiche le SQL. Le <code>LEFT JOIN</code> ramène les commandes ; LEFT pour garder aussi les clients sans commande.",
        "<code>ORDER BY [c].[Id]</code> : EF trie par client pour pouvoir regrouper les lignes du JOIN et reconstruire chaque liste <code>Orders</code>."
      ],
      explain: "Une navigation vide ne prouve rien : vérifie toujours que tu l'as chargée."
    },
    {
      title: "Chargement explicite, avec le SQL affiché",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

using (var setup = new OrderFlowDbContext())
{
    setup.Database.EnsureDeleted();
    setup.Database.EnsureCreated();
    setup.Customers.Add(new Customer { Name = "Alice", Orders = [new() { Status = "Paid" }, new() { Status = "Pending" }] });
    setup.SaveChanges();
}

using var db = new OrderFlowDbContext(logSql: true);
var alice = db.Customers.Single();                       // requête 1
var paid = db.Entry(alice).Collection(c => c.Orders)
    .Query().Count(o => o.Status == "Paid");             // requête 2 : un COUNT, rien n'est chargé
db.Entry(alice).Collection(c => c.Orders).Load();        // requête 3 : charge les commandes
Console.WriteLine($"{alice.Name} : {paid} payée(s) sur {alice.Orders.Count}");

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Order> Orders { get; set; } = [];
}
public class Order
{
    public int Id { get; set; }
    public string Status { get; set; } = "Pending";
    public int CustomerId { get; set; }
}
public class OrderFlowDbContext(bool logSql = false) : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
        if (logSql) // affiche chaque requête SQL juste avant son envoi
            options.LogTo(Console.WriteLine, [RelationalEventId.CommandExecuting], LogLevel.Debug, DbContextLoggerOptions.None);
    }
}`,
      output: `Executing DbCommand [Parameters=[], CommandType='Text', CommandTimeout='30']
SELECT TOP(2) [c].[Id], [c].[Name]
FROM [Customers] AS [c]
Executing DbCommand [Parameters=[@p='?' (DbType = Int32)], CommandType='Text', CommandTimeout='30']
SELECT COUNT(*)
FROM [Orders] AS [o]
WHERE [o].[CustomerId] = @p AND [o].[Status] = N'Paid'
Executing DbCommand [Parameters=[@p='?' (DbType = Int32)], CommandType='Text', CommandTimeout='30']
SELECT [o].[Id], [o].[CustomerId], [o].[Status]
FROM [Orders] AS [o]
WHERE [o].[CustomerId] = @p
Alice : 1 payée(s) sur 2`,
      steps: [
        "<code>class OrderFlowDbContext(bool logSql = false)</code> : un constructeur principal avec une option. Le contexte <code>setup</code> prépare les données sans log ; le second, <code>db</code>, affiche le SQL.",
        "<code>options.LogTo(Console.WriteLine, [RelationalEventId.CommandExecuting], ...)</code> : on n'écoute qu'un seul événement, « une commande SQL va partir », et on l'écrit dans la console. <code>DbContextLoggerOptions.None</code> retire la date et la catégorie.",
        "<code>db.Customers.Single()</code> : <code>TOP(2)</code> car <code>Single</code> doit vérifier qu'il n'y a pas un deuxième résultat.",
        "<code>.Query().Count(o =&gt; o.Status == \"Paid\")</code> : une requête <code>COUNT</code> sur les commandes d'Alice. Aucune commande n'est chargée en mémoire.",
        "<code>.Collection(c =&gt; c.Orders).Load()</code> : cette fois les commandes sont chargées et rangées dans <code>alice.Orders</code>.",
        "<code>@p='?'</code> : la valeur du paramètre (l'Id d'Alice) est masquée par défaut dans les logs, pour ne pas y écrire de données sensibles."
      ]
    },
    {
      title: "Lazy loading : le problème N+1 en direct",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
// dotnet add package Microsoft.EntityFrameworkCore.Proxies
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

using (var setup = new OrderFlowDbContext())
{
    setup.Database.EnsureDeleted();
    setup.Database.EnsureCreated();
    setup.Customers.AddRange(
        new Customer { Name = "Alice", Orders = [new(), new()] },
        new Customer { Name = "Bob", Orders = [new()] });
    setup.SaveChanges();
}

using var db = new OrderFlowDbContext(logSql: true);
foreach (var c in db.Customers.ToList())                      // 1 requête pour les clients...
    Console.WriteLine($"-> {c.Name} : {c.Orders.Count} commande(s)"); // ...+ 1 par client !

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public virtual List<Order> Orders { get; set; } = []; // virtual : le proxy peut l'intercepter
}
public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
}
public class OrderFlowDbContext(bool logSql = false) : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True")
               .UseLazyLoadingProxies(); // active le lazy loading
        if (logSql)
            options.LogTo(Console.WriteLine, [RelationalEventId.CommandExecuting], LogLevel.Debug, DbContextLoggerOptions.None);
    }
}`,
      output: `Executing DbCommand [Parameters=[], CommandType='Text', CommandTimeout='30']
SELECT [c].[Id], [c].[Name]
FROM [Customers] AS [c]
Executing DbCommand [Parameters=[@p='?' (DbType = Int32)], CommandType='Text', CommandTimeout='30']
SELECT [o].[Id], [o].[CustomerId]
FROM [Orders] AS [o]
WHERE [o].[CustomerId] = @p
-> Alice : 2 commande(s)
Executing DbCommand [Parameters=[@p='?' (DbType = Int32)], CommandType='Text', CommandTimeout='30']
SELECT [o].[Id], [o].[CustomerId]
FROM [Orders] AS [o]
WHERE [o].[CustomerId] = @p
-> Bob : 1 commande(s)`,
      steps: [
        "<code>.UseLazyLoadingProxies()</code> : vient du package <code>Proxies</code>. EF générera des sous-classes de tes entités pour intercepter les navigations.",
        "<code>public virtual List&lt;Order&gt; Orders</code> : <code>virtual</code> est obligatoire, c'est ce qui permet au proxy de remplacer la propriété.",
        "<code>db.Customers.ToList()</code> : une seule requête pour les clients, sans leurs commandes.",
        "<code>c.Orders.Count</code> : la première lecture de <code>Orders</code> déclenche, sans prévenir, une requête pour ce client.",
        "Dans la sortie, chaque client provoque son propre SELECT : 1 + 2 = 3 requêtes. Avec 1 000 clients, ce serait 1 001 requêtes.",
        "Correction : supprime <code>UseLazyLoadingProxies()</code> et écris <code>db.Customers.Include(c =&gt; c.Orders).ToList()</code> : une seule requête."
      ],
      explain: "Le code a l'air innocent : seuls les logs révèlent les requêtes cachées."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Le détail d'une commande",
      prompt: `<p>Avec le modèle de l'exemple 3 de la leçon précédente (<code>Order</code>, <code>OrderLine</code>, <code>Product</code>), écris une requête qui charge la commande n° 1 avec ses lignes et le produit de chaque ligne, puis affiche « quantité x nom ».</p>`,
      hint: `<p><code>Include</code> pour les lignes, <code>ThenInclude</code> pour le produit, puis <code>Single(o =&gt; o.Id == 1)</code>.</p>`,
      solution: `var order = db.Orders
    .Include(o => o.Lines)
        .ThenInclude(l => l.Product)
    .Single(o => o.Id == 1);

foreach (var line in order.Lines)
    Console.WriteLine($"{line.Quantity} x {line.Product.Name}");`
    },
    {
      level: "moyen",
      title: "Seulement les commandes payées",
      prompt: `<p>Avec le modèle de l'exemple 2 (commandes avec un <code>Status</code>), charge tous les clients avec <strong>uniquement</strong> leurs commandes payées, en une seule requête. Affiche le SQL avec <code>ToQueryString()</code> et repère où se trouve le filtre.</p>`,
      hint: `<p>C'est un Include filtré : on met le <code>Where</code> <em>à l'intérieur</em> de l'<code>Include</code>.</p>`,
      solution: `var query = db.Customers
    .Include(c => c.Orders.Where(o => o.Status == "Paid"));
Console.WriteLine(query.ToQueryString()); // le filtre est dans la sous-requête du LEFT JOIN

foreach (var c in query)
    Console.WriteLine($"{c.Name} : {c.Orders.Count} commande(s) payée(s)");
// Alice : 1 commande(s) payée(s)`
    },
    {
      level: "difficile",
      title: "Corriger le N+1",
      prompt: `<p>Reprends l'exemple 3 (lazy loading activé, logs SQL). Réécris la boucle pour qu'elle affiche la même chose avec <strong>une seule requête</strong>, <em>sans</em> charger les commandes en mémoire. Vérifie le nombre de requêtes dans les logs.</p>`,
      hint: `<p>Tu n'as besoin que du nom et du nombre de commandes : une projection <code>Select(c =&gt; new { c.Name, OrderCount = c.Orders.Count })</code> est traduite en un seul SELECT avec un <code>COUNT</code>.</p>`,
      solution: `using var db = new OrderFlowDbContext(logSql: true);
var rows = db.Customers
    .Select(c => new { c.Name, OrderCount = c.Orders.Count })
    .ToList(); // UNE seule requête, quel que soit le nombre de clients
foreach (var r in rows)
    Console.WriteLine($"-> {r.Name} : {r.OrderCount} commande(s)");

// Log :
// SELECT [c].[Name], (
//     SELECT COUNT(*)
//     FROM [Orders] AS [o]
//     WHERE [c].[Id] = [o].[CustomerId]) AS [OrderCount]
// FROM [Customers] AS [c]
// -> Alice : 2 commande(s)
// -> Bob : 1 commande(s)`
    }
  ],
  quiz: [
    {
      q: `Tu charges un client avec <code>db.Customers.Find(1)</code>. Que contient <code>client.Orders</code> (sans lazy loading) ?`,
      options: ["Toutes ses commandes", "Une liste vide (ou seulement les commandes déjà suivies par le contexte)", "<code>null</code>, toujours"],
      answer: 1,
      why: `EF ne charge pas les navigations sans qu'on le lui demande. La liste est vide, sauf si le contexte suit déjà certaines commandes en mémoire. Ça ne veut pas dire que le client n'a pas de commandes.`
    },
    {
      q: `Quelle méthode charge le produit de chaque ligne d'une commande, dans la même requête ?`,
      options: ["<code>Include(o =&gt; o.Lines).ThenInclude(l =&gt; l.Product)</code>", "<code>Include(o =&gt; o.Lines).Include(l =&gt; l.Product)</code>", "<code>Entry(o).Reference(l =&gt; l.Product).Load()</code>"],
      answer: 0,
      why: `<code>ThenInclude</code> descend d'un niveau à partir de l'<code>Include</code> précédent. Un second <code>Include</code> repart de <code>Order</code>, où <code>Product</code> n'existe pas.`
    },
    {
      q: `Qu'est-ce que le problème N+1 ?`,
      options: ["Une requête qui renvoie une ligne de trop", "Une erreur quand N dépasse 1", "1 requête pour la liste, puis 1 requête par élément pour ses données liées"],
      answer: 2,
      why: `C'est le piège typique du lazy loading dans une boucle : chaque élément déclenche sa propre requête. Avec 500 éléments, on fait 501 allers-retours vers la base.`
    },
    {
      q: `Comment savoir combien de requêtes SQL part ton code ?`,
      options: ["Ce n'est pas possible avec EF Core", "Activer <code>LogTo</code> dans <code>OnConfiguring</code>", "Compter les <code>Include</code>"],
      answer: 1,
      why: `<code>LogTo</code> affiche chaque commande SQL envoyée. <code>ToQueryString()</code> montre le SQL d'une requête, mais seuls les logs révèlent les requêtes cachées (lazy loading, chargement explicite).`
    }
  ],
  project: `<p><strong>OrderFlow : le détail d'une commande.</strong> Crée une classe <code>OrderQueries</code> qui reçoit un <code>OrderFlowDbContext</code> et ajoute une méthode <code>Order? GetOrderDetails(int orderId)</code> qui charge en une seule requête la commande, son client, ses lignes et le produit de chaque ligne. Active <code>LogTo</code> en développement et vérifie dans la console qu'une seule requête part. N'active pas le lazy loading dans OrderFlow.</p>`,
  resources: [
    { label: "Charger les données associées (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/querying/related-data/" },
    { label: "Journalisation simple avec LogTo (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/logging-events-diagnostics/simple-logging" }
  ]
});

// =====================================================================
// 5. Requêtes LINQ to Entities et projections
// =====================================================================
window.COURSE.push({
  key: "ef-linq-queries",
  title: "Requêtes LINQ to Entities et projections avec Select",
  summary: "Tu sauras écrire des requêtes LINQ que EF traduit en bon SQL : filtrer, trier, paginer, agréger, et ne ramener que les colonnes utiles avec Select.",
  objectives: [
    "Comprendre comment une requête LINQ devient du SQL, et à quel moment elle part",
    "Filtrer, trier et paginer avec Where, OrderBy, Skip et Take",
    "Projeter vers un DTO avec Select pour ne lire que l'utile",
    "Agréger avec Count, Sum et GroupBy, et éviter les méthodes non traduisibles"
  ],
  analogy: `<p>Imagine que tu demandes un renseignement à un <strong>archiviste</strong>. Tu peux lui dire « apporte-moi tous les cartons, je trierai » : il revient avec un chariot énorme. Ou tu lui dis « dans le carton des commandes payées, recopie-moi juste le numéro et le nom du client » : il revient avec une feuille.</p>
<p>LINQ to Entities, c'est ta demande ; SQL Server, c'est l'archiviste. Plus ta demande est précise, moins il y a à transporter.</p>`,
  lesson: `<h3>LINQ to Entities : du C# traduit en SQL</h3>
<p>Tu connais LINQ sur des listes en mémoire depuis la partie 1 : c'est <strong>LINQ to Objects</strong>. Sur un <code>DbSet</code>, c'est la même syntaxe, mais un tout autre fonctionnement : <strong>LINQ to Entities</strong>. Tes <code>Where</code> et <code>OrderBy</code> ne s'exécutent pas en C# : EF lit ta requête comme un arbre d'expressions, la traduit en SQL et l'envoie à SQL Server.</p>
<p>Le type change aussi : <code>db.Products.Where(...)</code> renvoie un <code>IQueryable&lt;Product&gt;</code>, pas un <code>IEnumerable</code>. Un <code>IQueryable</code>, c'est une <strong>requête en construction</strong>, pas encore des données. C'est comme un <code>Observable</code> d'Angular : rien ne se passe tant que personne ne s'abonne.</p>
<div class="flow"><span>LINQ (IQueryable)</span><span>Traduction par EF</span><span>SQL envoyé</span><span>Objets C#</span></div>

<h3>À quel moment la requête part-elle ?</h3>
<p>La requête est exécutée seulement quand tu as besoin des résultats. On appelle ça l'<strong>exécution différée</strong>.</p>
<table>
<tr><th>Construisent la requête (rien ne part)</th><th>Exécutent la requête</th></tr>
<tr><td><code>Where</code>, <code>OrderBy</code>, <code>Select</code>, <code>Skip</code>, <code>Take</code>, <code>Include</code>, <code>GroupBy</code></td><td><code>ToList()</code>, <code>ToArray()</code>, <code>First()</code>, <code>Single()</code>, <code>Count()</code>, <code>Any()</code>, <code>Sum()</code>, un <code>foreach</code></td></tr>
</table>
<p>Grâce à ça, tu peux construire une requête par étapes, par exemple ajouter un <code>Where</code> seulement si l'utilisateur a rempli un filtre. Dans une API, utilise les versions asynchrones : <code>ToListAsync()</code>, <code>FirstOrDefaultAsync()</code>, <code>CountAsync()</code>.</p>
<div class="tip">Ne fais jamais <code>db.Products.ToList().Where(...)</code> : le <code>ToList()</code> ramène <strong>toute la table</strong> en mémoire, puis le filtre se fait en C#. Mets toujours <code>Where</code>, <code>OrderBy</code> et <code>Take</code> <em>avant</em> la méthode qui exécute.</div>

<h3>Filtrer, trier, paginer</h3>
<p><code>Where</code> devient un <code>WHERE</code>, <code>OrderBy</code> un <code>ORDER BY</code>, <code>Skip</code> et <code>Take</code> deviennent <code>OFFSET ... FETCH NEXT</code>. Les variables C# que tu utilises dans la requête (un prix maximum, un numéro de page) deviennent des <strong>paramètres SQL</strong> : pas de risque d'injection, et SQL Server peut réutiliser son plan d'exécution.</p>
<p>Pour paginer, trie toujours avant <code>Skip</code> : sans <code>OrderBy</code>, l'ordre des lignes n'est pas garanti et une page pourrait contenir des doublons.</p>

<h3>Select : la projection, ton réflexe par défaut</h3>
<p>Quand tu lis une entité complète, EF ramène <strong>toutes ses colonnes</strong> et la suit dans le change tracker. Pour un écran en lecture seule, c'est du gaspillage. Avec <code>Select</code>, tu choisis exactement ce que tu veux, souvent dans un <strong>DTO</strong> (<em>Data Transfer Object</em>, un petit objet fait pour transporter des données, souvent un <code>record</code>).</p>
<p>Bonus : dans un <code>Select</code>, tu peux traverser les navigations (<code>o.Customer.Name</code>) <strong>sans Include</strong>. EF ajoute lui-même le JOIN et ne lit que la colonne demandée.</p>
<div class="compare"><div><h4>Entité complète</h4><p><code>db.Orders.Include(o =&gt; o.Customer).ToList()</code> : toutes les colonnes des deux tables, objets suivis par le contexte.</p></div><div><h4>Projection</h4><p><code>db.Orders.Select(o =&gt; new OrderRow(o.Id, o.Customer.Name))</code> : deux colonnes, aucun suivi, JOIN automatique.</p></div></div>
<p>Si tu as besoin d'entités complètes mais en lecture seule, ajoute <code>AsNoTracking()</code> : EF ne les suit pas et la requête est plus légère. Une projection vers un DTO n'est jamais suivie, <code>AsNoTracking()</code> y est inutile.</p>

<h3>Agrégats et GroupBy</h3>
<p><code>Count</code>, <code>Sum</code>, <code>Average</code>, <code>Max</code>, <code>Any</code> sont calculés <strong>par SQL Server</strong> : tu reçois un seul nombre, pas les lignes. <code>GroupBy</code> suivi d'un <code>Select</code> devient un <code>GROUP BY</code> : parfait pour « nombre de commandes par statut ».</p>
<p>Limite importante : EF ne sait traduire que ce qu'il connaît (opérateurs C#, méthodes de <code>string</code> courantes comme <code>Contains</code> ou <code>StartsWith</code>, propriétés de dates…). Si tu appelles <strong>ta propre méthode</strong> dans un <code>Where</code>, EF lève une <code>InvalidOperationException</code> « could not be translated ». La solution : écrire la condition directement dans la lambda.</p>
<div class="note">En pro, une règle simple : <strong>toute requête de lecture qui alimente un écran ou une réponse d'API passe par un Select vers un DTO</strong>. Tu n'exposes pas tes entités, tu lis moins de données, et tu évites les boucles infinies de sérialisation (client → commandes → client…).</div>`,
  examples: [
    {
      title: "Filtrer, trier, paginer et voir le SQL",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using System.Globalization;
using Microsoft.EntityFrameworkCore;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;
using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Products.AddRange(
    new Product { Name = "Clavier", Price = 49.90m, Stock = 10 },
    new Product { Name = "Souris", Price = 19.90m, Stock = 0 },
    new Product { Name = "Écran", Price = 189.00m, Stock = 4 },
    new Product { Name = "Câble USB", Price = 9.90m, Stock = 50 },
    new Product { Name = "Casque", Price = 39.90m, Stock = 7 });
db.SaveChanges();

decimal maxPrice = 50m;
int page = 0, pageSize = 2;               // page 0 = la première page
var query = db.Products
    .Where(p => p.Price <= maxPrice && p.Stock > 0) // filtre
    .OrderBy(p => p.Price)                           // tri
    .Skip(page * pageSize).Take(pageSize);           // pagination

Console.WriteLine(query.ToQueryString());           // rien n'est encore exécuté ici
foreach (var p in query)                            // l'exécution a lieu ici
    Console.WriteLine($"{p.Name} : {p.Price}");

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    [Precision(10, 2)] public decimal Price { get; set; }
    public int Stock { get; set; }
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `DECLARE @maxPrice decimal(10,2) = 50.0;
DECLARE @p int = 0;
DECLARE @p2 int = 2;

SELECT [p].[Id], [p].[Name], [p].[Price], [p].[Stock]
FROM [Products] AS [p]
WHERE [p].[Price] <= @maxPrice AND [p].[Stock] > 0
ORDER BY [p].[Price]
OFFSET @p ROWS FETCH NEXT @p2 ROWS ONLY
Câble USB : 9.90
Casque : 39.90`,
      steps: [
        "<code>var query = db.Products.Where(...)...</code> : on construit un <code>IQueryable&lt;Product&gt;</code>. Aucune requête n'est envoyée à cette ligne.",
        "<code>p.Price &lt;= maxPrice &amp;&amp; p.Stock &gt; 0</code> : le <code>&amp;&amp;</code> devient <code>AND</code>. La variable <code>maxPrice</code> devient le paramètre <code>@maxPrice</code>.",
        "<code>.Skip(page * pageSize).Take(pageSize)</code> : traduit en <code>OFFSET @p ROWS FETCH NEXT @p2 ROWS ONLY</code>. Avec <code>page = 1</code>, tu obtiendrais la page suivante (Clavier).",
        "<code>query.ToQueryString()</code> : affiche le SQL avec les paramètres déclarés en tête, sans exécuter la requête.",
        "<code>foreach (var p in query)</code> : c'est ici que la requête part. La souris (stock 0) et l'écran (trop cher) sont exclus par SQL Server, pas par C#."
      ],
      explain: "Tout le travail de filtre, de tri et de découpage est fait par la base : seules deux lignes voyagent."
    },
    {
      title: "Projection vers un DTO, JOIN automatique",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
var alice = new Customer { Name = "Alice", Email = "alice@example.com" };
db.Orders.AddRange(
    new Order { Customer = alice, OrderDate = new DateTime(2026, 11, 2), Status = "Paid" },
    new Order { Customer = alice, OrderDate = new DateTime(2026, 11, 5), Status = "Pending" });
db.SaveChanges();

var query = db.Orders
    .Where(o => o.Status == "Paid")
    .Select(o => new OrderRow(o.Id, o.Customer.Name, o.Customer.Email)); // pas d'Include !
Console.WriteLine(query.ToQueryString());
foreach (var row in query)
    Console.WriteLine(row);

record OrderRow(int Id, string CustomerName, string CustomerEmail); // un DTO
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
}
public class Order
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public string Status { get; set; } = "Pending";
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `SELECT [o].[Id], [c].[Name], [c].[Email]
FROM [Orders] AS [o]
INNER JOIN [Customers] AS [c] ON [o].[CustomerId] = [c].[Id]
WHERE [o].[Status] = N'Paid'
OrderRow { Id = 1, CustomerName = Alice, CustomerEmail = alice@example.com }`,
      steps: [
        "<code>record OrderRow(int Id, string CustomerName, string CustomerEmail);</code> : le DTO. Un record positionnel, compact, avec un <code>ToString()</code> lisible offert.",
        "<code>.Select(o =&gt; new OrderRow(o.Id, o.Customer.Name, o.Customer.Email))</code> : on traverse la navigation <code>Customer</code> sans <code>Include</code>.",
        "<code>INNER JOIN [Customers]</code> : EF a ajouté le JOIN tout seul. INNER, car la relation est obligatoire (<code>int CustomerId</code>).",
        "<code>SELECT [o].[Id], [c].[Name], [c].[Email]</code> : trois colonnes seulement. <code>OrderDate</code>, <code>Status</code> et les autres ne sont pas lues.",
        "<code>Console.WriteLine(row);</code> : affiche le record grâce à son <code>ToString()</code> généré."
      ],
      explain: "Moins de colonnes, pas de suivi, pas d'Include à penser : la projection est la façon la plus efficace de lire."
    },
    {
      title: "GroupBy, Any, et une méthode non traduisible",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Orders.AddRange(new Order { Status = OrderStatus.Paid }, new Order { Status = OrderStatus.Paid },
                   new Order { Status = OrderStatus.Pending }, new Order { Status = OrderStatus.Shipped });
db.SaveChanges();

// GroupBy + Count : SQL Server fait le calcul, on ne reçoit que 3 lignes
var stats = db.Orders
    .GroupBy(o => o.Status)
    .Select(g => new { Status = g.Key, Count = g.Count() })
    .OrderByDescending(x => x.Count).ThenBy(x => x.Status)
    .ToList();
foreach (var s in stats)
    Console.WriteLine($"{s.Status} : {s.Count}");

Console.WriteLine($"Une commande annulée ? {db.Orders.Any(o => o.Status == OrderStatus.Cancelled)}");

// Une méthode C# à toi : EF ne sait pas la traduire en SQL
try { db.Orders.Where(o => Rules.IsUrgent(o)).ToList(); }
catch (InvalidOperationException) { Console.WriteLine("IsUrgent ne peut pas être traduite en SQL"); }

static class Rules { public static bool IsUrgent(Order o) => o.Status == OrderStatus.Paid; }

public enum OrderStatus { Pending, Paid, Shipped, Cancelled }
public class Order
{
    public int Id { get; set; }
    public OrderStatus Status { get; set; }
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void ConfigureConventions(ModelConfigurationBuilder builder)
        => builder.Properties<OrderStatus>().HaveConversion<string>().HaveMaxLength(20); // "Paid" en base
}`,
      output: `Paid : 2
Pending : 1
Shipped : 1
Une commande annulée ? False
IsUrgent ne peut pas être traduite en SQL`,
      steps: [
        "<code>builder.Properties&lt;OrderStatus&gt;().HaveConversion&lt;string&gt;()</code> : l'enum est stocké en texte (<code>nvarchar(20)</code>), comme dans le schéma OrderFlow.",
        "<code>.GroupBy(o =&gt; o.Status).Select(g =&gt; new { Status = g.Key, Count = g.Count() })</code> : traduit en <code>SELECT Status, COUNT(*) ... GROUP BY Status</code>. <code>g.Key</code> est la valeur commune du groupe.",
        "<code>.OrderByDescending(x =&gt; x.Count).ThenBy(x =&gt; x.Status)</code> : tri principal par nombre, puis par statut pour départager les égalités.",
        "<code>db.Orders.Any(...)</code> : devient un <code>EXISTS</code> en SQL. On reçoit juste <code>True</code> ou <code>False</code>.",
        "<code>Rules.IsUrgent(o)</code> : EF ne peut pas regarder à l'intérieur de ta méthode C#, il ne sait donc pas la convertir en SQL. Il lève une <code>InvalidOperationException</code> au lieu de charger toute la table en cachette.",
        "La correction : écrire la condition dans la lambda, <code>Where(o =&gt; o.Status == OrderStatus.Paid)</code>."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Les trois produits les plus chers",
      prompt: `<p>Avec le modèle de l'exemple 1, affiche le <strong>nom</strong> des trois produits les plus chers, du plus cher au moins cher. Ne ramène que la colonne <code>Name</code>.</p>`,
      hint: `<p><code>OrderByDescending</code>, puis <code>Take(3)</code>, puis <code>Select(p =&gt; p.Name)</code>.</p>`,
      solution: `var names = db.Products
    .OrderByDescending(p => p.Price)
    .Take(3)
    .Select(p => p.Name)
    .ToList();
Console.WriteLine(string.Join(", ", names)); // Écran, Clavier, Casque`
    },
    {
      level: "moyen",
      title: "Une recherche avec filtres optionnels",
      prompt: `<p>Écris une méthode <code>List&lt;string&gt; Search(OrderFlowDbContext db, string? text, decimal? maxPrice)</code> qui renvoie les noms des produits triés par nom. Chaque filtre ne s'applique que s'il est renseigné. Teste avec <code>("C", null)</code> puis <code>(null, 20m)</code>.</p>`,
      hint: `<p>Pars de <code>IQueryable&lt;Product&gt; query = db.Products;</code> et ajoute les <code>Where</code> dans des <code>if</code>. Rien ne part avant le <code>ToList()</code>.</p>`,
      solution: `Console.WriteLine(string.Join(", ", Search(db, "C", null)));  // Câble USB, Casque, Clavier, Écran (Contains ignore la casse avec SQL Server)
Console.WriteLine(string.Join(", ", Search(db, null, 20m))); // Câble USB, Souris

List<string> Search(OrderFlowDbContext db, string? text, decimal? maxPrice)
{
    IQueryable<Product> query = db.Products;
    if (!string.IsNullOrWhiteSpace(text))
        query = query.Where(p => p.Name.Contains(text)); // LIKE '%...%'
    if (maxPrice is not null)
        query = query.Where(p => p.Price <= maxPrice);
    return query.OrderBy(p => p.Name).Select(p => p.Name).ToList(); // une seule requête
}`
    },
    {
      level: "difficile",
      title: "Le classement des clients",
      prompt: `<p>Avec un modèle <code>Customer</code> → <code>Orders</code> → <code>Lines</code> (<code>Quantity</code>, <code>UnitPrice</code>), écris <strong>une seule requête</strong> qui renvoie, pour chaque client ayant dépensé quelque chose, son nom et le total de ses achats, du plus gros au plus petit. Aucune entité ne doit être chargée en mémoire.</p>`,
      hint: `<p>Dans le <code>Select</code> : <code>c.Orders.SelectMany(o =&gt; o.Lines).Sum(l =&gt; l.Quantity * l.UnitPrice)</code>. Tu peux ensuite filtrer et trier sur la propriété projetée.</p>`,
      solution: `using System.Globalization;
using Microsoft.EntityFrameworkCore;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;
using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Customers.AddRange(
    new Customer { Name = "Alice", Orders = [new() { Lines = [new() { Quantity = 2, UnitPrice = 10m }] },
                                             new() { Lines = [new() { Quantity = 1, UnitPrice = 30m }] }] },
    new Customer { Name = "Bob", Orders = [new() { Lines = [new() { Quantity = 1, UnitPrice = 80m }] }] },
    new Customer { Name = "Chloé" });
db.SaveChanges();

var ranking = db.Customers
    .Select(c => new
    {
        c.Name,
        Total = c.Orders.SelectMany(o => o.Lines).Sum(l => l.Quantity * l.UnitPrice)
    })
    .Where(x => x.Total > 0)
    .OrderByDescending(x => x.Total)
    .ToList();
foreach (var r in ranking)
    Console.WriteLine($"{r.Name} : {r.Total:0.00} €");
// Bob : 80.00 €
// Alice : 50.00 €

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<Order> Orders { get; set; } = [];
}
public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public List<OrderLine> Lines { get; set; } = [];
}
public class OrderLine
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int Quantity { get; set; }
    [Precision(10, 2)] public decimal UnitPrice { get; set; }
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`
    }
  ],
  quiz: [
    {
      q: `À quel moment la requête <code>var q = db.Products.Where(p =&gt; p.Stock &gt; 0);</code> est-elle envoyée à SQL Server ?`,
      options: ["Dès cette ligne", "Quand on parcourt <code>q</code> ou qu'on appelle <code>ToList()</code>, <code>Count()</code>…", "Jamais, il faut appeler <code>SaveChanges()</code>"],
      answer: 1,
      why: `<code>Where</code> ne fait que construire un <code>IQueryable</code>. L'exécution est différée jusqu'à ce qu'on ait besoin des résultats. <code>SaveChanges()</code> sert à écrire, pas à lire.`
    },
    {
      q: `Pourquoi <code>db.Products.ToList().Where(p =&gt; p.Price &lt; 10)</code> est-il une mauvaise idée ?`,
      options: ["Ça ne compile pas", "Le filtre est ignoré", "Toute la table est chargée en mémoire, puis filtrée en C#"],
      answer: 2,
      why: `<code>ToList()</code> exécute la requête sans filtre : toutes les lignes voyagent. Le <code>Where</code> qui suit est du LINQ to Objects. Il faut filtrer <em>avant</em> d'exécuter.`
    },
    {
      q: `Dans <code>db.Orders.Select(o =&gt; new { o.Id, o.Customer.Name })</code>, faut-il un <code>Include(o =&gt; o.Customer)</code> ?`,
      options: ["Non, EF ajoute le JOIN tout seul dans une projection", "Oui, sinon <code>Name</code> vaut <code>null</code>", "Oui, sinon une exception est levée"],
      answer: 0,
      why: `Dans un <code>Select</code>, EF traduit toute l'expression en SQL, navigations comprises. <code>Include</code> ne sert qu'à remplir les navigations d'<em>entités</em> renvoyées en entier.`
    },
    {
      q: `Tu écris <code>Where(p =&gt; MyHelper.IsCheap(p))</code> avec ta propre méthode statique. Que se passe-t-il ?`,
      options: ["EF lit le code de la méthode et le traduit", "EF lève une <code>InvalidOperationException</code> : expression non traduisible", "EF charge toute la table et filtre en mémoire, en silence"],
      answer: 1,
      why: `EF ne voit qu'un appel à une méthode inconnue et ne peut pas en faire du SQL. Depuis EF Core 3, il refuse plutôt que de tout charger en cachette. Écris la condition directement dans la lambda.`
    }
  ],
  project: `<p><strong>OrderFlow : les requêtes de lecture.</strong> Dans <code>OrderQueries</code>, ajoute deux méthodes asynchrones qui renvoient des DTO (des <code>record</code>) : <code>SearchProductsAsync(string? text, decimal? maxPrice, int page, int pageSize)</code> qui renvoie des <code>ProductListItem(int Id, string Name, decimal Price, bool InStock)</code> triés par nom et paginés ; et <code>GetCustomerSummariesAsync()</code> qui renvoie <code>CustomerSummary(string Name, int OrderCount, decimal TotalSpent)</code>. Utilise <code>Select</code>, <code>ToListAsync()</code>, et vérifie chaque requête avec <code>ToQueryString()</code>.</p>`,
  resources: [
    { label: "Interroger des données avec EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/querying/" },
    { label: "Opérateurs de requête complexes (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/querying/complex-query-operators" }
  ]
});

// =====================================================================
// 6. SQL brut avec FromSql et SqlQuery
// =====================================================================
window.COURSE.push({
  key: "ef-raw-sql",
  title: "Quand LINQ ne suffit pas : SQL brut avec FromSql et SqlQuery",
  summary: "Tu sauras écrire toi-même du SQL dans EF Core quand LINQ ne suffit pas, sans jamais ouvrir la porte à l'injection SQL.",
  objectives: [
    "Lire des entités avec FromSql et continuer la requête en LINQ",
    "Lire des types non mappés ou de simples valeurs avec SqlQuery",
    "Exécuter une commande (UPDATE, DELETE) avec ExecuteSql",
    "Comprendre pourquoi FromSqlRaw avec concaténation est dangereux"
  ],
  analogy: `<p>LINQ, c'est un <strong>GPS</strong> : tu donnes la destination, il calcule l'itinéraire. Dans 95 % des cas, il fait mieux que toi. Mais parfois tu connais un raccourci qu'il ignore, alors tu prends le volant toi-même.</p>
<p>Le SQL brut, c'est conduire sans GPS : tu vas où tu veux, mais tu es responsable de la route. Et la première règle de sécurité, c'est de ne jamais laisser un inconnu (la saisie d'un utilisateur) tenir le volant.</p>`,
  lesson: `<h3>Pourquoi écrire du SQL soi-même ?</h3>
<p>LINQ couvre l'immense majorité des besoins. Mais il arrive que tu veuilles : appeler une <strong>procédure stockée</strong> existante, utiliser une fonction propre à SQL Server (recherche plein texte, fonctions de fenêtrage), ou reprendre une requête SQL déjà optimisée par un DBA. Pour ces cas, EF Core te laisse écrire du SQL, tout en gardant les avantages d'EF (paramètres, mapping vers tes classes).</p>
<table>
<tr><th>Méthode</th><th>Pour quoi faire</th><th>Renvoie</th></tr>
<tr><td><code>db.Products.FromSql($"...")</code></td><td>Lire des <strong>entités</strong> de ton modèle</td><td><code>IQueryable&lt;Product&gt;</code></td></tr>
<tr><td><code>db.Database.SqlQuery&lt;T&gt;($"...")</code></td><td>Lire un type <strong>non mappé</strong> (DTO) ou une valeur simple</td><td><code>IQueryable&lt;T&gt;</code></td></tr>
<tr><td><code>db.Database.ExecuteSql($"...")</code></td><td>Exécuter une <strong>commande</strong> (UPDATE, DELETE, EXEC…)</td><td>Nombre de lignes touchées</td></tr>
</table>

<h3>FromSql : du SQL qui renvoie des entités</h3>
<p><code>FromSql</code> prend une <strong>chaîne interpolée</strong> (<code>$"..."</code>). Ce détail est essentiel : EF ne colle pas tes valeurs dans le texte, il transforme chaque <code>{variable}</code> en <strong>paramètre SQL</strong> (<code>@p0</code>). C'est exactement la protection que tu avais avec <code>SqlParameter</code> en ADO.NET, mais automatique.</p>
<p>Deux règles à respecter. Le SQL doit renvoyer <strong>toutes les colonnes</strong> de l'entité, avec les mêmes noms (<code>SELECT *</code> ou la liste complète). Et tu peux <strong>continuer en LINQ</strong> derrière : <code>.Where()</code>, <code>.OrderBy()</code>, <code>.Include()</code>. EF place alors ton SQL dans une sous-requête.</p>
<div class="flow"><span>FromSql($"... {x}")</span><span>{x} devient @p0</span><span>.OrderBy(...) en LINQ</span><span>SELECT ... FROM (ton SQL)</span></div>
<p>Exception : une procédure stockée (<code>EXEC ...</code>) ne peut pas être placée dans une sous-requête. Après <code>FromSql($"EXEC ...")</code>, appelle <code>AsEnumerable()</code> ou <code>ToList()</code> avant toute autre opération : la suite se fera en C#.</p>

<h3>SqlQuery : pour tout le reste</h3>
<p>Et si le résultat ne correspond à aucune entité ? Par exemple un nom de produit et la valeur de son stock. <code>db.Database.SqlQuery&lt;T&gt;</code> lit n'importe quel type : un <code>record</code> DTO (les noms de colonnes doivent correspondre aux noms des propriétés), ou un type simple comme <code>int</code> ou <code>decimal</code>.</p>
<p>Pour une valeur simple, nomme la colonne <code>Value</code> (<code>SELECT COUNT(*) AS Value ...</code>) : EF s'en sert quand il doit composer ta requête avec du LINQ, par exemple pour un <code>.Single()</code> ou un <code>.Sum()</code>.</p>

<h3>ExecuteSql : les commandes</h3>
<p>Pour un <code>UPDATE</code> ou un <code>DELETE</code> en masse, <code>db.Database.ExecuteSql($"...")</code> envoie la commande directement et renvoie le <strong>nombre de lignes touchées</strong>. Attention : ça passe à côté du change tracker. Les entités déjà chargées en mémoire ne voient pas le changement.</p>
<div class="tip">Avant d'écrire un UPDATE en SQL brut, regarde <code>ExecuteUpdate</code> et <code>ExecuteDelete</code> : ils font la même chose en LINQ, par exemple <code>db.Products.Where(p =&gt; p.Stock &lt; 5).ExecuteUpdate(s =&gt; s.SetProperty(p =&gt; p.Stock, p =&gt; p.Stock + 20))</code>.</div>

<h3>Le danger : FromSqlRaw et la concaténation</h3>
<p>Il existe aussi <code>FromSqlRaw</code>, <code>SqlQueryRaw</code> et <code>ExecuteSqlRaw</code>, qui prennent une chaîne <strong>normale</strong>. Elles existent pour les cas où le SQL lui-même est dynamique (un nom de colonne choisi dans une liste fermée, par exemple). Le piège : si tu y concatènes une saisie utilisateur (<code>"... WHERE Name = '" + search + "'"</code>), cette saisie devient du <strong>code SQL</strong>. C'est l'<strong>injection SQL</strong>, que tu as déjà vue avec ADO.NET.</p>
<div class="compare"><div><h4>FromSql($"... {search}")</h4><p>La chaîne interpolée est découpée par EF : <code>search</code> devient un paramètre. Sûr.</p></div><div><h4>FromSqlRaw("..." + search)</h4><p>Le texte est collé tel quel dans le SQL. Une saisie comme <code>x' OR 1=1 --</code> renvoie toute la table.</p></div></div>
<div class="note">Le compilateur t'aide : EF Core affiche l'avertissement <strong>EF1003</strong> quand il voit une concaténation dans <code>FromSqlRaw</code>. Traite-le comme une erreur. En revue de code, toute méthode <code>...Raw</code> mérite une question : « pourquoi pas la version interpolée ? ».</div>`,
  examples: [
    {
      title: "FromSql, puis on continue en LINQ",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Products.AddRange(new Product { Name = "Clavier", Stock = 10 },
                     new Product { Name = "Souris", Stock = 0 },
                     new Product { Name = "Casque", Stock = 7 });
db.SaveChanges();

int minStock = 5;
var query = db.Products
    .FromSql($"SELECT * FROM Products WHERE Stock >= {minStock}") // {minStock} devient un paramètre
    .OrderBy(p => p.Name);                                         // on continue en LINQ
Console.WriteLine(query.ToQueryString());
foreach (var p in query)
    Console.WriteLine($"{p.Name} ({p.Stock})");

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Stock { get; set; }
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `DECLARE p0 int = 5;

SELECT [p].[Id], [p].[Name], [p].[Stock]
FROM (
    SELECT * FROM Products WHERE Stock >= @p0
) AS [p]
ORDER BY [p].[Name]
Casque (7)
Clavier (10)`,
      steps: [
        "<code>.FromSql($\"SELECT * FROM Products WHERE Stock &gt;= {minStock}\")</code> : une chaîne interpolée. EF reçoit le texte et la valeur séparément.",
        "<code>WHERE Stock &gt;= @p0</code> : dans le SQL envoyé, <code>{minStock}</code> est devenu le paramètre <code>@p0</code>. (<code>ToQueryString</code> affiche sa déclaration sans le <code>@</code>, c'est juste un détail d'affichage.)",
        "<code>SELECT *</code> : la requête renvoie toutes les colonnes de <code>Products</code>, comme l'exige <code>FromSql</code>.",
        "<code>.OrderBy(p =&gt; p.Name)</code> : on compose en LINQ. EF met ton SQL dans une sous-requête <code>FROM ( ... ) AS [p]</code> et ajoute l'<code>ORDER BY</code> autour.",
        "<code>foreach (var p in query)</code> : la requête part ici. Les résultats sont de vraies entités <code>Product</code>, suivies par le contexte."
      ],
      explain: "Ton SQL et LINQ cohabitent : tu écris à la main seulement la partie que LINQ ne sait pas faire."
    },
    {
      title: "SqlQuery : un DTO et une valeur simple",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using System.Globalization;
using Microsoft.EntityFrameworkCore;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;
using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Products.AddRange(new Product { Name = "Clavier", Price = 49.90m, Stock = 10 },
                     new Product { Name = "Souris", Price = 19.90m, Stock = 0 },
                     new Product { Name = "Casque", Price = 39.90m, Stock = 7 });
db.SaveChanges();

// 1. Vers un type NON mappé : les noms de colonnes = les noms des propriétés
var values = db.Database
    .SqlQuery<StockValue>($"SELECT Name, Price * Stock AS Total FROM Products WHERE Stock > 0")
    .OrderByDescending(v => v.Total)
    .ToList();
foreach (var v in values)
    Console.WriteLine($"{v.Name} : {v.Total} €");

// 2. Une simple valeur : la colonne doit s'appeler Value
int outOfStock = db.Database
    .SqlQuery<int>($"SELECT COUNT(*) AS Value FROM Products WHERE Stock = 0")
    .Single();
Console.WriteLine($"Produits en rupture : {outOfStock}");

record StockValue(string Name, decimal Total);
public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    [Precision(10, 2)] public decimal Price { get; set; }
    public int Stock { get; set; }
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `Clavier : 499.00 €
Casque : 279.30 €
Produits en rupture : 1`,
      steps: [
        "<code>record StockValue(string Name, decimal Total);</code> : un DTO qui n'est pas dans le <code>DbContext</code>. Aucune table <code>StockValue</code> n'existe.",
        "<code>db.Database.SqlQuery&lt;StockValue&gt;(...)</code> : on passe par <code>Database</code>, pas par un <code>DbSet</code>, puisque ce n'est pas une entité.",
        "<code>Price * Stock AS Total</code> : l'alias <code>Total</code> correspond à la propriété du record. Sans alias, EF ne saurait pas où mettre la valeur.",
        "<code>.OrderByDescending(v =&gt; v.Total)</code> : on compose en LINQ, ton SQL devient une sous-requête, comme avec <code>FromSql</code>.",
        "<code>SqlQuery&lt;int&gt;($\"SELECT COUNT(*) AS Value ...\")</code> : pour un type simple, la colonne s'appelle <code>Value</code>, car EF compose le <code>.Single()</code> autour."
      ]
    },
    {
      title: "Injection SQL : FromSqlRaw contre FromSql, puis ExecuteSql",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Products.AddRange(new Product { Name = "Clavier", Stock = 10 },
                     new Product { Name = "Souris", Stock = 0 },
                     new Product { Name = "Casque", Stock = 7 });
db.SaveChanges();

string search = "x' OR 1=1 --"; // saisie malveillante d'un utilisateur

// DANGER : concaténation, la saisie devient du code SQL
var bad = db.Products.FromSqlRaw("SELECT * FROM Products WHERE Name = '" + search + "'").ToList();
Console.WriteLine($"FromSqlRaw concaténé : {bad.Count} produit(s) renvoyé(s) !");

// SÛR : FromSql transforme {search} en paramètre, c'est juste du texte
var good = db.Products.FromSql($"SELECT * FROM Products WHERE Name = {search}").ToList();
Console.WriteLine($"FromSql : {good.Count} produit(s)");

// ExecuteSql : une commande (UPDATE, DELETE...), renvoie le nombre de lignes touchées
int restock = 20;
int rows = db.Database.ExecuteSql($"UPDATE Products SET Stock = Stock + {restock} WHERE Stock < 5");
Console.WriteLine($"{rows} produit(s) réapprovisionné(s)");

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Stock { get; set; }
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`,
      output: `FromSqlRaw concaténé : 3 produit(s) renvoyé(s) !
FromSql : 0 produit(s)
1 produit(s) réapprovisionné(s)`,
      steps: [
        "<code>string search = \"x' OR 1=1 --\";</code> : ce qu'un attaquant taperait dans un champ de recherche.",
        "<code>FromSqlRaw(\"... WHERE Name = '\" + search + \"'\")</code> : le SQL devient <code>WHERE Name = 'x' OR 1=1 --'</code>. <code>1=1</code> est toujours vrai et <code>--</code> commente la fin : toute la table sort. À la compilation, EF affiche l'avertissement EF1003.",
        "<code>FromSql($\"... WHERE Name = {search}\")</code> : <code>search</code> devient un paramètre. SQL Server cherche un produit qui s'appelle littéralement <code>x' OR 1=1 --</code> : aucun.",
        "<code>db.Database.ExecuteSql($\"UPDATE ... {restock} ...\")</code> : une commande, elle aussi paramétrée. Elle renvoie 1 : seule la souris avait moins de 5 en stock.",
        "Pas de <code>SaveChanges()</code> après <code>ExecuteSql</code> : la commande part immédiatement, sans passer par le change tracker."
      ],
      explain: "La seule différence visible est un $ et deux accolades : c'est toute la différence entre une faille et un code sûr."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Chercher un produit par son nom",
      prompt: `<p>Avec le modèle de l'exemple 1, demande un nom de produit à l'utilisateur avec <code>Console.ReadLine()</code> et cherche-le avec <code>FromSql</code>. Affiche son stock, ou « introuvable ».</p>`,
      hint: `<p><code>FromSql($"SELECT * FROM Products WHERE Name = {name}")</code> puis <code>FirstOrDefault()</code>.</p>`,
      solution: `Console.Write("Produit : ");
string name = Console.ReadLine() ?? "";

var product = db.Products
    .FromSql($"SELECT * FROM Products WHERE Name = {name}") // paramètre : aucune injection possible
    .FirstOrDefault();

Console.WriteLine(product is null ? "introuvable" : $"{product.Name} : {product.Stock} en stock");`
    },
    {
      level: "moyen",
      title: "La valeur du stock, deux façons",
      prompt: `<p>Avec le modèle de l'exemple 2, calcule la valeur totale du stock (somme de <code>Price * Stock</code>) d'abord avec <code>SqlQuery&lt;decimal&gt;</code>, puis avec LINQ. Affiche les deux résultats et vérifie qu'ils sont égaux.</p>`,
      hint: `<p>En SQL : <code>SELECT SUM(Price * Stock) AS Value FROM Products</code>. En LINQ : <code>db.Products.Sum(p =&gt; p.Price * p.Stock)</code>.</p>`,
      solution: `decimal fromSql = db.Database
    .SqlQuery<decimal>($"SELECT SUM(Price * Stock) AS Value FROM Products")
    .Single();
decimal fromLinq = db.Products.Sum(p => p.Price * p.Stock);

Console.WriteLine($"SQL : {fromSql:0.00}, LINQ : {fromLinq:0.00}, égaux : {fromSql == fromLinq}");
// SQL : 778.30, LINQ : 778.30, égaux : True`
    },
    {
      level: "difficile",
      title: "Appeler une procédure stockée",
      prompt: `<p>Crée une procédure stockée <code>GetLowStock</code> qui prend un paramètre <code>@threshold int</code> et renvoie les produits dont le stock est inférieur au seuil. Crée-la avec <code>ExecuteSql</code> (dans un vrai projet, ce serait dans une migration), puis appelle-la avec <code>FromSql</code> et affiche les produits triés par stock.</p>`,
      hint: `<p>Une procédure ne peut pas être mise en sous-requête : appelle <code>AsEnumerable()</code> juste après <code>FromSql</code>, puis trie en C#.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Database.EnsureDeleted();
db.Database.EnsureCreated();
db.Products.AddRange(new Product { Name = "Clavier", Stock = 10 },
                     new Product { Name = "Souris", Stock = 0 },
                     new Product { Name = "Casque", Stock = 3 });
db.SaveChanges();

// Création de la procédure (en vrai : dans une migration)
db.Database.ExecuteSql($"""
    CREATE PROCEDURE GetLowStock @threshold int AS
    SELECT * FROM Products WHERE Stock < @threshold
    """);

int threshold = 5;
var low = db.Products
    .FromSql($"EXEC GetLowStock @threshold = {threshold}")
    .AsEnumerable()                 // la suite se fait en C#, pas en SQL
    .OrderBy(p => p.Stock)
    .ToList();
foreach (var p in low)
    Console.WriteLine($"{p.Name} : {p.Stock}");
// Souris : 0
// Casque : 3

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Stock { get; set; }
}
public class OrderFlowDbContext : DbContext
{
    public DbSet<Product> Products => Set<Product>();
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
}`
    }
  ],
  quiz: [
    {
      q: `Que devient <code>{minStock}</code> dans <code>FromSql($"... WHERE Stock &gt;= {minStock}")</code> ?`,
      options: ["Le texte de la valeur, collé dans le SQL", "Un paramètre SQL (<code>@p0</code>)", "Une erreur : il faut utiliser <code>SqlParameter</code>"],
      answer: 1,
      why: `<code>FromSql</code> reçoit une chaîne interpolée (<code>FormattableString</code>) : EF voit le texte et les valeurs séparément, et transforme chaque valeur en paramètre. C'est ce qui protège de l'injection.`
    },
    {
      q: `Tu veux lire un résultat qui ne correspond à aucune entité (nom + total). Quelle méthode utiliser ?`,
      options: ["<code>db.Database.SqlQuery&lt;MonDto&gt;(...)</code>", "<code>db.Products.FromSql(...)</code>", "<code>db.Database.ExecuteSql(...)</code>"],
      answer: 0,
      why: `<code>FromSql</code> renvoie forcément des entités du <code>DbSet</code>, et <code>ExecuteSql</code> ne renvoie qu'un nombre de lignes. <code>SqlQuery&lt;T&gt;</code> lit n'importe quel type, tant que les noms de colonnes correspondent.`
    },
    {
      q: `Pourquoi <code>FromSqlRaw("... Name = '" + saisie + "'")</code> est-il dangereux ?`,
      options: ["Il est plus lent que <code>FromSql</code>", "Il ne fonctionne pas avec SQL Server", "La saisie devient du code SQL : c'est une injection SQL"],
      answer: 2,
      why: `La concaténation colle le texte tel quel dans la requête. Une saisie comme <code>x' OR 1=1 --</code> change le sens du SQL. Avec une chaîne interpolée dans <code>FromSql</code>, la saisie reste une simple valeur.`
    },
    {
      q: `Après <code>db.Database.ExecuteSql($"UPDATE Products SET Stock = 0")</code>, faut-il appeler <code>SaveChanges()</code> ?`,
      options: ["Oui, sinon rien n'est écrit", "Non, la commande est exécutée immédiatement", "Oui, mais seulement dans une transaction"],
      answer: 1,
      why: `<code>ExecuteSql</code> envoie la commande tout de suite et renvoie le nombre de lignes touchées. Il ne passe pas par le change tracker, donc <code>SaveChanges()</code> n'a rien à voir avec lui.`
    }
  ],
  project: `<p><strong>OrderFlow : les cas spéciaux.</strong> Dans <code>OrderQueries</code>, ajoute <code>GetLowStockProductsAsync(int threshold)</code> qui utilise <code>FromSql</code> (paramétré) puis <code>OrderBy</code> en LINQ, et <code>GetStockValueAsync()</code> qui utilise <code>SqlQuery&lt;decimal&gt;</code> avec une colonne <code>Value</code>. Ajoute ensuite dans un service <code>ProductService</code> une méthode <code>RestockAsync(int threshold, int quantity)</code> avec <code>ExecuteSqlAsync</code> qui renvoie le nombre de produits réapprovisionnés. Vérifie qu'aucun appel <code>...Raw</code> n'existe dans ton code (et qu'il n'y a aucun avertissement EF1003).</p>`,
  resources: [
    { label: "Requêtes SQL (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/querying/sql-queries" },
    { label: "ExecuteUpdate et ExecuteDelete (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/saving/execute-insert-update-delete" }
  ]
});
