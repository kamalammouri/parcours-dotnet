window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 3 - Maîtrise d'EF Core
// Chapitre : Suivi des modifications, performance et tests
// =====================================================================

// =====================================================================
// 1. Le change tracker
// =====================================================================
window.COURSE.push({
  key: "ef-change-tracker",
  title: "Le change tracker : comment EF Core sait ce qui a changé",
  summary: "Tu sauras lire l'état d'une entité, comprendre ce que SaveChanges va écrire et mettre à jour une entité proprement à partir d'un DTO.",
  objectives: [
    "Connaître les cinq états d'une entité : Detached, Added, Unchanged, Modified, Deleted",
    "Comprendre comment EF compare les valeurs pour détecter un changement",
    "Savoir quand une requête est suivie ou non (AsNoTracking)",
    "Mettre à jour une entité depuis un DTO sans écraser d'autres colonnes"
  ],
  analogy: `<p>Imagine un <strong>agent d'inventaire</strong> dans un entrepôt. Quand un carton arrive, il le prend en photo et note la photo dans son carnet. Le soir, il refait le tour : il compare chaque carton à sa photo. Ce qui a bougé, il le signale au siège ; le reste, il n'en parle pas.</p>
<p>Le <strong>change tracker</strong> d'EF Core, c'est cet agent. Chaque entité lue est « photographiée ». Au moment de <code>SaveChanges</code>, EF compare et n'envoie à SQL Server que les différences.</p>`,
  lesson: `<h3>Le point de départ de ce chapitre</h3>
<p>Les exemples de ce chapitre réutilisent ton modèle OrderFlow : les classes <code>Customer</code>, <code>Product</code>, <code>Order</code>, <code>OrderLine</code>, l'enum <code>OrderStatus</code> et <code>OrderFlowDbContext</code>, avec la base créée par tes migrations. On suppose que le contexte a deux constructeurs : un sans paramètre (qui utilise la chaîne <code>Server=localhost;Database=OrderFlow;…</code> dans <code>OnConfiguring</code>, pratique en console) et un qui reçoit des <code>DbContextOptions&lt;OrderFlowDbContext&gt;</code> (pour l'API et les tests). Chaque exemple crée ses propres données et fait son ménage, pour que la sortie ne dépende pas de ce qu'il y a déjà dans ta base.</p>

<h3>Une mémoire attachée au DbContext</h3>
<p>Chaque <code>DbContext</code> possède un <strong>change tracker</strong> (en français « suivi des modifications »). C'est une liste des entités qu'il connaît, avec pour chacune un <strong>état</strong> et une copie des valeurs d'origine (on parle de <em>snapshot</em>, un instantané).</p>
<p>Quand tu appelles <code>SaveChanges</code>, EF parcourt cette liste et transforme chaque état en instruction SQL. C'est pour ça que tu n'écris jamais d'<code>UPDATE</code> toi-même : EF le déduit.</p>
<pre class="diagram">
 Entité         État        SaveChanges envoie
 ------------   ---------   ------------------
 new Product    Detached    rien (EF l'ignore)
 après Add      Added       INSERT
 lue en base    Unchanged   rien
 propriété      Modified    UPDATE (colonnes
   changée                  modifiées seulement)
 après Remove   Deleted     DELETE
</pre>
<p>Après un <code>SaveChanges</code> réussi, les entités ajoutées ou modifiées repassent à <code>Unchanged</code> et les entités supprimées deviennent <code>Detached</code> : EF les oublie.</p>

<h3>Comment EF voit qu'une propriété a changé</h3>
<p>Tes classes sont de simples objets C# : elles ne préviennent personne quand tu écris <code>product.Stock = 8</code>. EF compare donc lui-même la valeur actuelle au snapshot. Cette comparaison s'appelle <code>DetectChanges</code>. Tu n'as presque jamais besoin de l'appeler : <code>SaveChanges</code>, <code>Entry()</code> et <code>ChangeTracker.Entries()</code> le font pour toi.</p>
<div class="flow"><span>Requête : EF lit la ligne</span><span>Snapshot des valeurs</span><span>Tu modifies l'objet</span><span>DetectChanges compare</span><span>UPDATE ciblé</span></div>
<p>Avec <code>db.Entry(entity)</code>, tu accèdes à tout ce que le tracker sait : <code>State</code>, et pour chaque propriété <code>OriginalValue</code>, <code>CurrentValue</code> et <code>IsModified</code>. Si tu remets la valeur d'origine, la propriété n'est plus modifiée et rien n'est envoyé.</p>

<h3>Une seule instance par ligne</h3>
<p>Dans un même contexte, si tu lis deux fois le produit n° 12, EF te rend <strong>le même objet</strong>. C'est la <em>résolution d'identité</em> : le tracker garde un dictionnaire « clé → objet ». C'est rassurant (pas deux versions concurrentes du même produit en mémoire), mais ça veut dire aussi qu'un contexte qui vit longtemps accumule des objets et devient lent. Un <code>DbContext</code> doit vivre peu de temps : une requête HTTP, ou une opération métier.</p>

<h3>Suivi ou pas suivi</h3>
<p>Par défaut, toute requête qui renvoie des entités est <strong>suivie</strong>. Si tu veux seulement afficher des données, ajoute <code>AsNoTracking()</code> : EF ne prend pas de snapshot, ne remplit pas le dictionnaire, et l'objet reste <code>Detached</code>. C'est plus rapide et plus léger. Une projection avec <code>Select</code> vers un DTO n'est jamais suivie non plus.</p>
<div class="compare"><div><h4>Requête suivie</h4><p>Pour modifier puis appeler <code>SaveChanges</code>. EF garde un snapshot et résout l'identité.</p></div><div><h4>AsNoTracking</h4><p>Pour lire et afficher. Aucune copie gardée. Modifier l'objet ne sert à rien : <code>SaveChanges</code> ne le voit pas.</p></div></div>

<h3>Le scénario déconnecté : un DTO arrive du front</h3>
<p>Dans une API, la lecture et la modification arrivent dans deux requêtes HTTP différentes, donc deux contextes différents. Quand le front Angular renvoie un DTO, tu as deux options :</p>
<table>
<tr><th>Méthode</th><th>Ce qui part en base</th><th>Risque</th></tr>
<tr><td>Charger l'entité, puis <code>Entry(e).CurrentValues.SetValues(dto)</code></td><td>Seulement les colonnes vraiment changées</td><td>Une lecture de plus (souvent négligeable)</td></tr>
<tr><td>Reconstruire l'entité et appeler <code>Update(e)</code></td><td>Toutes les colonnes</td><td>Les propriétés absentes du DTO sont écrasées par leur valeur par défaut</td></tr>
</table>
<div class="tip"><code>Update()</code> marque <strong>toutes</strong> les propriétés comme modifiées. Si ton DTO ne contient pas <code>CreatedAt</code>, la colonne sera remplacée par <code>0001-01-01</code>. Préfère « charger puis modifier » : c'est plus sûr et EF n'envoie que le nécessaire.</div>
<div class="note">En production, un <code>DbContext</code> n'est pas thread-safe et ne doit jamais être partagé entre deux requêtes en parallèle. Dans ASP.NET Core, <code>AddDbContext</code> l'enregistre en durée de vie <em>scoped</em> (un par requête HTTP). Pour un service singleton ou un worker, injecte <code>IDbContextFactory&lt;OrderFlowDbContext&gt;</code> et crée un contexte court par opération.</div>`,
  examples: [
    {
      title: "Les états d'une entité, pas à pas",
      code: `using var db = new OrderFlowDbContext();

var keyboard = new Product { Name = "Clavier", Price = 49.90m, Stock = 10 };
Console.WriteLine($"1. Créé avec new : {db.Entry(keyboard).State}");

db.Products.Add(keyboard);
Console.WriteLine($"2. Après Add     : {db.Entry(keyboard).State}");

await db.SaveChangesAsync();
Console.WriteLine($"3. Après Save    : {db.Entry(keyboard).State}");

keyboard.Stock = 8;
Console.WriteLine($"4. Stock changé  : {db.Entry(keyboard).State}");

await db.SaveChangesAsync();
db.Products.Remove(keyboard);
Console.WriteLine($"5. Après Remove  : {db.Entry(keyboard).State}");

await db.SaveChangesAsync();
Console.WriteLine($"6. Après Save    : {db.Entry(keyboard).State}");`,
      output: `1. Créé avec new : Detached
2. Après Add     : Added
3. Après Save    : Unchanged
4. Stock changé  : Modified
5. Après Remove  : Deleted
6. Après Save    : Detached`,
      steps: [
        "<code>new Product { … }</code> : un objet C# ordinaire. Le contexte ne le connaît pas encore, il est <code>Detached</code>.",
        "<code>db.Products.Add(keyboard);</code> : le tracker l'enregistre en <code>Added</code>. Aucun SQL n'est encore parti.",
        "<code>await db.SaveChangesAsync();</code> : EF envoie l'<code>INSERT</code>, récupère l'<code>Id</code> généré et passe l'entité en <code>Unchanged</code>.",
        "<code>keyboard.Stock = 8;</code> : <code>db.Entry(keyboard)</code> lance la détection, voit la différence avec le snapshot et passe en <code>Modified</code>.",
        "<code>db.Products.Remove(keyboard);</code> : l'entité passe en <code>Deleted</code>. Le <code>DELETE</code> partira au prochain <code>SaveChanges</code>.",
        "<code>Après Save : Detached</code> : une fois la ligne supprimée, EF oublie l'objet."
      ],
      explain: "Retiens la règle : l'état décide de l'instruction SQL, et rien ne part avant SaveChanges."
    },
    {
      title: "Ce que le tracker retient",
      code: `using Microsoft.EntityFrameworkCore;

// Préparation : un produit en base
int id;
using (var setup = new OrderFlowDbContext())
{
    var mouse = new Product { Name = "Souris", Price = 19.90m, Stock = 25 };
    setup.Products.Add(mouse);
    await setup.SaveChangesAsync();
    id = mouse.Id;
}

using var db = new OrderFlowDbContext();
var a = await db.Products.SingleAsync(p => p.Id == id);
var b = await db.Products.SingleAsync(p => p.Id == id);
Console.WriteLine($"Même objet ? {ReferenceEquals(a, b)}");

a.Stock = 20;
a.Name = "Souris sans fil";
var entry = db.Entry(a);
var stock = entry.Property(p => p.Stock);
Console.WriteLine($"Stock : {stock.OriginalValue} -> {stock.CurrentValue}");
foreach (var prop in entry.Properties.Where(p => p.IsModified))
    Console.WriteLine($"Modifié : {prop.Metadata.Name}");

var c = await db.Products.AsNoTracking().SingleAsync(p => p.Id == id);
Console.WriteLine($"AsNoTracking : {db.Entry(c).State}, même objet ? {ReferenceEquals(a, c)}");
Console.WriteLine($"Entités suivies : {db.ChangeTracker.Entries().Count()}");`,
      output: `Même objet ? True
Stock : 25 -> 20
Modifié : Name
Modifié : Stock
AsNoTracking : Detached, même objet ? False
Entités suivies : 1`,
      steps: [
        "<code>using (var setup = new OrderFlowDbContext())</code> : un premier contexte crée la souris, puis il est jeté. On garde seulement l'<code>Id</code>.",
        "<code>var a = …; var b = …;</code> : deux requêtes identiques dans le même contexte renvoient le même objet, grâce à la résolution d'identité.",
        "<code>entry.Property(p =&gt; p.Stock)</code> : donne accès à <code>OriginalValue</code> (le snapshot, 25) et <code>CurrentValue</code> (20).",
        "<code>entry.Properties.Where(p =&gt; p.IsModified)</code> : seules <code>Name</code> et <code>Stock</code> sont modifiées. L'<code>UPDATE</code> ne contiendra que ces deux colonnes.",
        "<code>AsNoTracking()</code> : EF construit un nouvel objet, ne le suit pas (<code>Detached</code>) et ne le relie pas à <code>a</code>.",
        "<code>ChangeTracker.Entries().Count()</code> : une seule entité est suivie, celle de la première requête."
      ]
    },
    {
      title: "Mettre à jour depuis un DTO : SetValues contre Update",
      code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

using var db = new OrderFlowDbContext();
var lea = new Customer { Name = "Léa", Email = "lea@exemple.fr", CreatedAt = new DateTime(2026, 1, 15) };
db.Customers.Add(lea);
await db.SaveChangesAsync();
db.ChangeTracker.Clear(); // on oublie tout, comme une nouvelle requête HTTP

// Le front renvoie un DTO : seul le nom a changé
var dto = new CustomerDto("Léa Martin", "lea@exemple.fr");

// Méthode 1 : charger, puis copier le DTO
var loaded = await db.Customers.SingleAsync(c => c.Id == lea.Id);
db.Entry(loaded).CurrentValues.SetValues(dto);
Show("Charger + SetValues", db.Entry(loaded));
await db.SaveChangesAsync();
db.ChangeTracker.Clear();

// Méthode 2 : reconstruire l'entité et appeler Update
var rebuilt = new Customer { Id = lea.Id, Name = dto.Name, Email = dto.Email };
db.Customers.Update(rebuilt);
Show("Update", db.Entry(rebuilt));
await db.SaveChangesAsync();

var check = await db.Customers.AsNoTracking().SingleAsync(c => c.Id == lea.Id);
Console.WriteLine($"CreatedAt en base : année {check.CreatedAt.Year}");

db.Customers.Remove(rebuilt); // ménage
await db.SaveChangesAsync();

void Show(string label, EntityEntry entry)
{
    var names = entry.Properties.Where(p => p.IsModified).Select(p => p.Metadata.Name);
    Console.WriteLine($"{label} -> {string.Join(", ", names)}");
}

record CustomerDto(string Name, string Email);`,
      output: `Charger + SetValues -> Name
Update -> CreatedAt, Email, Name
CreatedAt en base : année 1`,
      steps: [
        "<code>db.ChangeTracker.Clear();</code> : vide le tracker, comme si une nouvelle requête HTTP commençait avec un contexte neuf.",
        "<code>db.Entry(loaded).CurrentValues.SetValues(dto);</code> : copie les propriétés du DTO qui ont le même nom (<code>Name</code>, <code>Email</code>). Seul <code>Name</code> a vraiment changé, donc seul <code>Name</code> est marqué.",
        "<code>new Customer { Id = lea.Id, Name = …, Email = … }</code> : un objet reconstruit à la main. <code>CreatedAt</code> n'est pas renseigné, il vaut donc <code>DateTime.MinValue</code>.",
        "<code>db.Customers.Update(rebuilt);</code> : EF ne peut pas savoir ce qui a changé, il marque toutes les propriétés.",
        "<code>CreatedAt en base : année 1</code> : la date d'inscription de Léa a été écrasée. C'est le bug classique d'<code>Update</code>.",
        "<code>void Show(string label, EntityEntry entry)</code> : petite fonction locale qui affiche les propriétés marquées <code>IsModified</code>."
      ],
      explain: "Dans une API, « charger puis SetValues » est le choix par défaut : moins de SQL et aucune colonne écrasée par erreur."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Suivre les états d'une lampe",
      prompt: `<p>Crée un produit « Lampe », ajoute-le, enregistre-le, change son prix, puis appelle <code>db.ChangeTracker.Clear()</code>. Affiche l'état de l'entité après chaque étape. Termine en supprimant la lampe.</p>`,
      hint: `<p>Utilise <code>db.Entry(lamp).State</code>. Après <code>Clear()</code>, le contexte ne connaît plus l'objet.</p>`,
      solution: `using var db = new OrderFlowDbContext();
var lamp = new Product { Name = "Lampe", Price = 30m, Stock = 4 };

db.Products.Add(lamp);
Console.WriteLine(db.Entry(lamp).State); // Added
await db.SaveChangesAsync();
Console.WriteLine(db.Entry(lamp).State); // Unchanged
lamp.Price = 25m;
Console.WriteLine(db.Entry(lamp).State); // Modified
db.ChangeTracker.Clear();
Console.WriteLine(db.Entry(lamp).State); // Detached : EF a tout oublié

db.Products.Remove(lamp); // ménage
await db.SaveChangesAsync();`
    },
    {
      level: "moyen",
      title: "Une mise à jour qui ne fait rien",
      prompt: `<p>Écris une fonction <code>UpdateStockAsync(int id, int newStock)</code> qui charge un produit dans un contexte neuf, change son stock, affiche les propriétés modifiées et renvoie le résultat de <code>SaveChangesAsync()</code>. Appelle-la une fois avec le stock actuel, puis avec une autre valeur. Que constates-tu ?</p>`,
      hint: `<p><code>SaveChangesAsync()</code> renvoie le nombre de lignes écrites. Si la nouvelle valeur est identique au snapshot, la propriété n'est pas marquée.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
var pad = new Product { Name = "Bloc-notes", Price = 3m, Stock = 10 };
db.Products.Add(pad);
await db.SaveChangesAsync();

Console.WriteLine(await UpdateStockAsync(pad.Id, 10)); // 0 : même valeur
Console.WriteLine(await UpdateStockAsync(pad.Id, 7));  // 1

async Task<int> UpdateStockAsync(int id, int newStock)
{
    using var ctx = new OrderFlowDbContext();
    var product = await ctx.Products.SingleAsync(p => p.Id == id);
    product.Stock = newStock;
    var modified = ctx.Entry(product).Properties.Where(p => p.IsModified).Select(p => p.Metadata.Name);
    var list = string.Join(", ", modified);
    Console.WriteLine($"Modifié : {(list == "" ? "rien" : list)}");
    return await ctx.SaveChangesAsync(); // nombre de lignes écrites
}`
    },
    {
      level: "difficile",
      title: "Modifier une seule colonne sans lire la ligne",
      prompt: `<p>Mets le stock d'un produit à 0 <strong>sans le charger</strong> : crée un objet qui ne contient que l'<code>Id</code>, attache-le avec <code>Attach</code>, puis marque uniquement la propriété <code>Stock</code> comme modifiée. Vérifie que le nom du produit n'a pas été effacé.</p>`,
      hint: `<p><code>Attach</code> met l'entité en <code>Unchanged</code>. Ensuite <code>db.Entry(stub).Property(p =&gt; p.Stock).IsModified = true;</code>. Attention : quand tu auras ajouté une <code>RowVersion</code> (leçon sur la concurrence), il faudra aussi fournir sa valeur, sinon EF signalera un conflit.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

int id;
using (var setup = new OrderFlowDbContext())
{
    var cup = new Product { Name = "Tasse", Price = 8m, Stock = 12 };
    setup.Products.Add(cup);
    await setup.SaveChangesAsync();
    id = cup.Id;
}

using var db = new OrderFlowDbContext();
var stub = new Product { Id = id, Stock = 0 }; // objet "bouchon" : seule la clé compte
db.Products.Attach(stub);                       // état Unchanged, aucune requête
db.Entry(stub).Property(p => p.Stock).IsModified = true;
Console.WriteLine($"État : {db.Entry(stub).State}");
Console.WriteLine($"Lignes écrites : {await db.SaveChangesAsync()}"); // UPDATE Products SET Stock = 0

var check = await db.Products.AsNoTracking().SingleAsync(p => p.Id == id);
Console.WriteLine($"{check.Name} : stock {check.Stock}"); // le nom n'a pas été écrasé`
    }
  ],
  quiz: [
    {
      q: `Tu lis un produit, puis tu fais <code>product.Stock = 8;</code>. Quand le SQL part-il ?`,
      options: ["Immédiatement, à l'affectation", "Au prochain <code>SaveChanges</code>", "À la fin du <code>using</code> du contexte"],
      answer: 1,
      why: `Modifier un objet ne fait que changer sa valeur en mémoire. C'est <code>SaveChanges</code> qui compare au snapshot et envoie l'<code>UPDATE</code>. Fermer le contexte sans <code>SaveChanges</code> perd la modification.`
    },
    {
      q: `Que fait <code>db.Customers.Update(customer)</code> sur un objet reconstruit à partir d'un DTO ?`,
      options: ["Il marque toutes les propriétés comme modifiées", "Il compare avec la base et ne marque que les différences", "Il lit la ligne avant d'écrire"],
      answer: 0,
      why: `<code>Update</code> n'a pas de snapshot pour comparer : il marque tout. Les colonnes absentes du DTO sont alors écrasées. Pour ne marquer que les différences, il faut charger l'entité puis utiliser <code>SetValues</code>.`
    },
    {
      q: `Dans quel cas <code>AsNoTracking()</code> est-il le bon choix ?`,
      options: ["Pour modifier puis enregistrer un produit", "Pour supprimer une commande", "Pour afficher une liste de produits en lecture seule"],
      answer: 2,
      why: `Sans suivi, EF ne garde aucun snapshot : c'est plus rapide pour lire. Mais un objet non suivi n'est pas vu par <code>SaveChanges</code>, donc ce n'est pas adapté pour modifier.`
    },
    {
      q: `Dans un même contexte, tu exécutes deux fois <code>SingleAsync(p =&gt; p.Id == 5)</code>. Que vaut <code>ReferenceEquals(a, b)</code> ?`,
      options: ["<code>False</code> : deux requêtes, deux objets", "<code>True</code> : le tracker renvoie la même instance", "Une exception est levée"],
      answer: 1,
      why: `C'est la résolution d'identité : pour une clé donnée, un contexte ne garde qu'un seul objet. Avec <code>AsNoTracking()</code>, tu obtiendrais en revanche deux objets distincts.`
    }
  ],
  project: `<p>Dans OrderFlow, écris <code>CustomerService.UpdateAsync(int id, UpdateCustomerDto dto)</code> où <code>UpdateCustomerDto</code> est un record <code>(string Name, string Email)</code>. La méthode charge le client (renvoie <code>false</code> s'il n'existe pas), applique le DTO avec <code>SetValues</code>, affiche en console les propriétés modifiées, puis enregistre. Vérifie que <code>CreatedAt</code> ne bouge jamais.</p>`,
  resources: [
    { label: "Suivi des modifications dans EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/change-tracking/" },
    { label: "Requêtes avec et sans suivi (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/querying/tracking" }
  ]
});

// =====================================================================
// 2. SaveChanges et transactions
// =====================================================================
window.COURSE.push({
  key: "ef-savechanges-transactions",
  title: "SaveChanges et transactions",
  summary: "Tu sauras ce que fait exactement SaveChanges, pourquoi il est « tout ou rien », et quand ouvrir toi-même une transaction.",
  objectives: [
    "Comprendre que SaveChanges enregistre tout un graphe en une seule transaction",
    "Interpréter la valeur renvoyée et l'exception DbUpdateException",
    "Ouvrir, valider et annuler une transaction explicite",
    "Connaître le piège des transactions avec EnableRetryOnFailure"
  ],
  analogy: `<p>Pense à un <strong>panier en ligne</strong>. Tu y mets un écran, un câble et une adresse de livraison. Quand tu cliques sur « Payer », soit toute la commande passe, soit rien ne passe : tu ne veux pas être débité de l'écran sans le câble.</p>
<p><code>SaveChanges</code>, c'est ce bouton « Payer » : toutes les modifications en attente partent ensemble, ou aucune. Et quand ton achat se fait en plusieurs étapes, tu ouvres toi-même une <strong>transaction</strong> pour garder ce « tout ou rien ».</p>`,
  lesson: `<h3>Ce que fait SaveChanges</h3>
<p><code>SaveChanges</code> (ou sa version asynchrone <code>SaveChangesAsync</code>) lit le change tracker, puis :</p>
<div class="flow"><span>DetectChanges</span><span>Ordonne les INSERT / UPDATE / DELETE</span><span>Ouvre une transaction</span><span>Envoie le SQL par lots</span><span>Valide et met à jour les états</span></div>
<p>EF s'occupe de l'ordre : il insère le client avant la commande, et la commande avant ses lignes, car les clés étrangères l'exigent. Il récupère aussi les <code>Id</code> générés par SQL Server et les recopie dans tes objets et dans les clés étrangères (<code>OrderLine.OrderId</code>). On appelle ça le <em>fix-up</em>.</p>
<p>La méthode renvoie un <code>int</code> : le nombre de lignes écrites en base. Zéro veut dire qu'il n'y avait rien à enregistrer.</p>

<h3>Tout ou rien</h3>
<p>Un seul appel à <code>SaveChanges</code> est toujours <strong>atomique</strong> : EF l'enveloppe dans une transaction. Si une seule instruction échoue (email en double, clé étrangère invalide…), SQL Server annule tout ce qui a été écrit pendant cet appel, et EF lève une <code>DbUpdateException</code>. L'erreur SQL précise se trouve dans <code>InnerException</code>, une <code>SqlException</code> avec un <code>Number</code> (2601 ou 2627 pour un doublon sur un index unique, 547 pour une contrainte de clé étrangère).</p>
<div class="tip">Après une <code>DbUpdateException</code>, les entités restent dans le tracker avec leur état (<code>Added</code>, <code>Modified</code>…). Si tu réessaies <code>SaveChanges</code> sans rien corriger, tu reprends la même erreur. Corrige l'entité fautive, ou vide le tracker avec <code>ChangeTracker.Clear()</code>.</div>

<h3>Quand ouvrir une transaction toi-même</h3>
<p>La plupart du temps, un seul <code>SaveChanges</code> suffit : construis tout ton graphe (commande + lignes + mise à jour du stock), puis enregistre une fois. Tu as besoin d'une <strong>transaction explicite</strong> quand ton opération fait <em>plusieurs</em> appels : deux <code>SaveChanges</code>, un <code>SaveChanges</code> plus un <code>ExecuteUpdate</code>, ou une requête Dapper au milieu.</p>
<pre class="diagram">
 BeginTransaction
   |
   +-- SaveChanges #1  (stock décrémenté)
   |
   +-- vérification métier
   |
   +-- SaveChanges #2  (commande créée)
   |
 Commit  -&gt; tout devient visible
 Rollback -&gt; tout est annulé
</pre>
<p>Avec <code>await using var tx = await db.Database.BeginTransactionAsync();</code>, chaque <code>SaveChanges</code> suivant s'exécute dans cette transaction au lieu d'en créer une. Rien n'est définitif tant que tu n'as pas appelé <code>CommitAsync()</code>. Si tu sors du bloc sans valider (exception, <code>return</code>), le <code>Dispose</code> annule automatiquement.</p>
<table>
<tr><th>Méthode</th><th>Rôle</th></tr>
<tr><td><code>BeginTransactionAsync()</code></td><td>Ouvre la transaction sur la connexion du contexte</td></tr>
<tr><td><code>CommitAsync()</code></td><td>Rend toutes les écritures définitives</td></tr>
<tr><td><code>RollbackAsync()</code></td><td>Annule tout depuis le début de la transaction</td></tr>
<tr><td><code>CreateSavepointAsync("nom")</code></td><td>Pose un point de retour partiel à l'intérieur de la transaction</td></tr>
</table>

<h3>Le tracker ne revient pas en arrière</h3>
<p>Un <code>Rollback</code> annule les écritures <strong>en base</strong>, pas les objets en mémoire. Après un rollback, ton produit a toujours son stock décrémenté en C#, et le tracker le croit <code>Unchanged</code>. Le plus simple : après un rollback, vide le tracker (<code>ChangeTracker.Clear()</code>) ou jette le contexte.</p>
<div class="note">Si tu actives <code>EnableRetryOnFailure</code> (recommandé avec Azure SQL), EF peut rejouer une opération après une coupure réseau. Il refuse alors les transactions ouvertes à la main, car il ne saurait pas quoi rejouer. La solution : <code>var strategy = db.Database.CreateExecutionStrategy();</code> puis <code>await strategy.ExecuteAsync(async () =&gt; { /* Begin, SaveChanges, Commit */ });</code>. Tout le bloc devient l'unité rejouée.</div>`,
  examples: [
    {
      title: "Un seul SaveChanges pour tout un graphe",
      code: `using var db = new OrderFlowDbContext();

var customer = new Customer { Name = "Hugo", Email = "hugo@exemple.fr", CreatedAt = DateTime.UtcNow };
var screen = new Product { Name = "Écran", Price = 189m, Stock = 5 };
var cable = new Product { Name = "Câble HDMI", Price = 9.90m, Stock = 50 };

var order = new Order
{
    Customer = customer,
    OrderDate = DateTime.UtcNow,
    Status = OrderStatus.Pending,
    Lines =
    [
        new OrderLine { Product = screen, Quantity = 1, UnitPrice = screen.Price },
        new OrderLine { Product = cable, Quantity = 2, UnitPrice = cable.Price }
    ]
};
db.Orders.Add(order); // un seul Add : EF suit tout le graphe

Console.WriteLine($"Avant : order.Id = {order.Id}");
int rows = await db.SaveChangesAsync();
Console.WriteLine($"Lignes écrites : {rows}");
Console.WriteLine($"Après : order.Id rempli ? {order.Id > 0}");
Console.WriteLine($"Clés étrangères posées ? {order.Lines.All(l => l.OrderId == order.Id)}");

db.RemoveRange(customer, screen, cable); // ménage (la cascade supprime commande et lignes)
Console.WriteLine($"Suppression : {await db.SaveChangesAsync()} lignes");`,
      output: `Avant : order.Id = 0
Lignes écrites : 6
Après : order.Id rempli ? True
Clés étrangères posées ? True
Suppression : 6 lignes`,
      steps: [
        "<code>var order = new Order { Customer = customer, … Lines = [ … ] };</code> : on construit tout le graphe en mémoire : un client, deux produits, une commande et deux lignes.",
        "<code>db.Orders.Add(order);</code> : EF parcourt les navigations et marque tous les objets reliés en <code>Added</code>.",
        "<code>Avant : order.Id = 0</code> : tant que l'<code>INSERT</code> n'est pas fait, SQL Server n'a pas encore généré la clé.",
        "<code>int rows = await db.SaveChangesAsync();</code> : 6 lignes (1 client + 2 produits + 1 commande + 2 lignes), dans le bon ordre et dans une seule transaction.",
        "<code>order.Lines.All(l =&gt; l.OrderId == order.Id)</code> : le fix-up a recopié la clé générée dans chaque ligne.",
        "<code>db.RemoveRange(customer, screen, cable);</code> : la commande et ses lignes sont suivies et dépendent de ces objets, EF les supprime aussi : 6 lignes."
      ],
      explain: "Construis le graphe complet, puis appelle SaveChanges une fois : c'est plus simple et déjà atomique."
    },
    {
      title: "Tout ou rien : un doublon annule tout l'appel",
      code: `using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
var nina = new Customer { Name = "Nina", Email = "nina@exemple.fr", CreatedAt = DateTime.UtcNow };
db.Customers.Add(nina);
await db.SaveChangesAsync();

// Deux nouveaux clients, le second réutilise l'email de Nina
db.Customers.Add(new Customer { Name = "Omar", Email = "omar@exemple.fr", CreatedAt = DateTime.UtcNow });
db.Customers.Add(new Customer { Name = "Faux", Email = "nina@exemple.fr", CreatedAt = DateTime.UtcNow });

try
{
    await db.SaveChangesAsync();
}
catch (DbUpdateException ex) when (ex.InnerException is SqlException sql)
{
    Console.WriteLine($"Échec : {ex.GetType().Name}, erreur SQL {sql.Number}");
}

db.ChangeTracker.Clear(); // on jette les entités restées en Added
bool omarSaved = await db.Customers.AnyAsync(c => c.Email == "omar@exemple.fr");
Console.WriteLine($"Omar a-t-il été enregistré ? {omarSaved}");

db.Customers.Remove(nina); // ménage
await db.SaveChangesAsync();`,
      output: `Échec : DbUpdateException, erreur SQL 2601
Omar a-t-il été enregistré ? False`,
      steps: [
        "<code>db.Customers.Add(nina); await db.SaveChangesAsync();</code> : Nina est enregistrée normalement.",
        "<code>db.Customers.Add(… \"omar@exemple.fr\" …); db.Customers.Add(… \"nina@exemple.fr\" …);</code> : deux ajouts en attente, le second viole l'index unique sur <code>Email</code>.",
        "<code>catch (DbUpdateException ex) when (ex.InnerException is SqlException sql)</code> : on filtre pour récupérer l'erreur SQL d'origine. 2601 signifie « doublon sur un index unique ».",
        "<code>db.ChangeTracker.Clear();</code> : les deux clients sont restés en <code>Added</code> dans le tracker, on les oublie.",
        "<code>Omar a-t-il été enregistré ? False</code> : même si son <code>INSERT</code> était valide, il a été annulé avec le reste."
      ]
    },
    {
      title: "Transaction explicite autour de deux étapes",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
var lamp = new Product { Name = "Lampe", Price = 35m, Stock = 3 };
db.Products.Add(lamp);
await db.SaveChangesAsync();

await PlaceOrder(quantity: 2); // assez de stock
await PlaceOrder(quantity: 5); // pas assez de stock

db.ChangeTracker.Clear();
var final = await db.Products.SingleAsync(p => p.Id == lamp.Id);
Console.WriteLine($"Stock final : {final.Stock}");

async Task PlaceOrder(int quantity)
{
    await using var tx = await db.Database.BeginTransactionAsync();
    var product = await db.Products.SingleAsync(p => p.Id == lamp.Id);
    product.Stock -= quantity;
    await db.SaveChangesAsync(); // 1er SaveChanges, dans la transaction

    if (product.Stock < 0)
    {
        await tx.RollbackAsync(); // annule tout ce qui a été écrit depuis Begin
        db.ChangeTracker.Clear();
        Console.WriteLine($"Commande de {quantity} : annulée");
        return;
    }
    // ... ici, un 2e SaveChanges créerait la commande
    await tx.CommitAsync();
    Console.WriteLine($"Commande de {quantity} : validée, stock = {product.Stock}");
}`,
      output: `Commande de 2 : validée, stock = 1
Commande de 5 : annulée
Stock final : 1`,
      steps: [
        "<code>await using var tx = await db.Database.BeginTransactionAsync();</code> : ouvre la transaction. Le <code>await using</code> garantit l'annulation si on sort sans valider.",
        "<code>product.Stock -= quantity; await db.SaveChangesAsync();</code> : l'<code>UPDATE</code> part en base, mais il reste provisoire tant que la transaction n'est pas validée.",
        "<code>if (product.Stock &lt; 0)</code> : la règle métier est vérifiée <em>après</em> l'écriture. Pour 5 lampes, le stock passerait à -4.",
        "<code>await tx.RollbackAsync(); db.ChangeTracker.Clear();</code> : on annule en base, puis on vide le tracker qui croit encore au stock -4.",
        "<code>await tx.CommitAsync();</code> : pour 2 lampes, tout est validé et devient visible pour les autres connexions.",
        "<code>Stock final : 1</code> : seule la première commande a laissé une trace."
      ],
      explain: "Une transaction explicite sert quand l'opération fait plusieurs allers-retours qui doivent réussir ou échouer ensemble."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Compter les lignes écrites",
      prompt: `<p>Ajoute trois produits avec <code>AddRange</code> et affiche la valeur renvoyée par <code>SaveChangesAsync()</code>. Modifie le stock d'un seul produit et affiche à nouveau la valeur. Supprime enfin les trois produits et affiche le résultat.</p>`,
      hint: `<p>Tu dois obtenir 3, puis 1, puis 3.</p>`,
      solution: `using var db = new OrderFlowDbContext();
var items = new[]
{
    new Product { Name = "Règle", Price = 2m, Stock = 30 },
    new Product { Name = "Compas", Price = 6m, Stock = 12 },
    new Product { Name = "Équerre", Price = 3m, Stock = 20 }
};
db.Products.AddRange(items);
Console.WriteLine($"Ajout : {await db.SaveChangesAsync()} lignes");       // 3

items[0].Stock = 25;
Console.WriteLine($"Modification : {await db.SaveChangesAsync()} ligne"); // 1

db.Products.RemoveRange(items);
Console.WriteLine($"Suppression : {await db.SaveChangesAsync()} lignes"); // 3`
    },
    {
      level: "moyen",
      title: "Un message clair pour un email déjà pris",
      prompt: `<p>Écris <code>RegisterAsync(string name, string email)</code> qui ajoute un client et renvoie « inscrit » ou « cet email est déjà utilisé ». Ne capture que l'erreur de doublon, pas toutes les <code>DbUpdateException</code>.</p>`,
      hint: `<p>Un filtre <code>when (ex.InnerException is SqlException { Number: 2601 or 2627 })</code> fait le tri. 2627 correspond à une contrainte <code>UNIQUE</code>, 2601 à un index unique.</p>`,
      solution: `using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

Console.WriteLine(await RegisterAsync("Iris", "iris@exemple.fr"));
Console.WriteLine(await RegisterAsync("Iris 2", "iris@exemple.fr"));

async Task<string> RegisterAsync(string name, string email)
{
    using var db = new OrderFlowDbContext();
    db.Customers.Add(new Customer { Name = name, Email = email, CreatedAt = DateTime.UtcNow });
    try
    {
        await db.SaveChangesAsync();
        return $"{name} : inscrit";
    }
    catch (DbUpdateException ex) when (ex.InnerException is SqlException { Number: 2601 or 2627 })
    {
        return $"{name} : cet email est déjà utilisé";
    }
}`
    },
    {
      level: "difficile",
      title: "Client et commande, ou rien",
      prompt: `<p>Écris <code>CreateOrderAsync(name, email, quantity)</code> qui, dans une transaction explicite, crée d'abord le client (premier <code>SaveChanges</code>), puis une commande de <code>quantity</code> téléviseurs à 900 (second <code>SaveChanges</code>). Si le total dépasse 1000, annule tout : le client ne doit pas rester en base.</p>`,
      hint: `<p>Après le premier <code>SaveChanges</code>, <code>customer.Id</code> est rempli. Calcule le total avec <code>order.Lines.Sum(l =&gt; l.Quantity * l.UnitPrice)</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
var tv = new Product { Name = "Téléviseur", Price = 900m, Stock = 3 };
db.Products.Add(tv);
await db.SaveChangesAsync();

Console.WriteLine(await CreateOrderAsync("Max", "max@exemple.fr", quantity: 2)); // 1800 : refusé

async Task<string> CreateOrderAsync(string name, string email, int quantity)
{
    await using var tx = await db.Database.BeginTransactionAsync();
    var customer = new Customer { Name = name, Email = email, CreatedAt = DateTime.UtcNow };
    db.Customers.Add(customer);
    await db.SaveChangesAsync(); // 1er SaveChanges : le client a maintenant un Id

    var order = new Order { CustomerId = customer.Id, OrderDate = DateTime.UtcNow,
        Lines = [new() { ProductId = tv.Id, Quantity = quantity, UnitPrice = tv.Price }] };
    db.Orders.Add(order);
    await db.SaveChangesAsync(); // 2e SaveChanges

    if (order.Lines.Sum(l => l.Quantity * l.UnitPrice) > 1000m)
    {
        await tx.RollbackAsync(); // ni client ni commande ne restent en base
        db.ChangeTracker.Clear();
        return "Refusé : total supérieur à 1000";
    }
    await tx.CommitAsync();
    return "Commande créée";
}`
    }
  ],
  quiz: [
    {
      q: `Un <code>SaveChanges</code> contient 3 <code>INSERT</code>. Le troisième viole une clé étrangère. Que reste-t-il en base ?`,
      options: ["Les deux premiers <code>INSERT</code>", "Rien du tout", "Les trois, le dernier avec une clé vide"],
      answer: 1,
      why: `Chaque appel à <code>SaveChanges</code> est enveloppé dans une transaction : un seul échec annule tout l'appel. C'est pour ça qu'on dit qu'il est atomique.`
    },
    {
      q: `Quand as-tu vraiment besoin de <code>BeginTransactionAsync</code> ?`,
      options: ["À chaque <code>SaveChanges</code>, par sécurité", "Pour lire des données", "Quand une opération fait plusieurs appels qui doivent réussir ensemble"],
      answer: 2,
      why: `Un seul <code>SaveChanges</code> est déjà transactionnel. La transaction explicite sert à regrouper plusieurs appels (deux <code>SaveChanges</code>, un <code>ExecuteUpdate</code>, du Dapper…).`
    },
    {
      q: `Après <code>RollbackAsync()</code>, que contient ton objet <code>product</code> en mémoire ?`,
      options: ["Les valeurs modifiées, le tracker n'est pas annulé", "Les valeurs d'origine, EF les a restaurées", "<code>null</code>"],
      answer: 0,
      why: `Le rollback agit sur la base, pas sur tes objets C#. Il faut vider le tracker ou recharger l'entité pour retrouver un état cohérent.`
    },
    {
      q: `Que renvoie <code>SaveChangesAsync()</code> ?`,
      options: ["L'Id de la dernière entité ajoutée", "Le nombre de lignes écrites en base", "<code>true</code> si tout s'est bien passé"],
      answer: 1,
      why: `C'est un <code>Task&lt;int&gt;</code> : le nombre de lignes insérées, modifiées ou supprimées. En cas d'échec, ce n'est pas <code>false</code> : une exception est levée.`
    }
  ],
  project: `<p>Dans OrderFlow, écris <code>OrderService.PlaceOrderAsync(int customerId, List&lt;(int ProductId, int Quantity)&gt; items)</code>. Dans une transaction explicite : charge les produits, vérifie que chaque stock suffit, décrémente les stocks, crée la commande en <code>Pending</code> avec ses lignes (<code>UnitPrice</code> = prix actuel du produit), puis valide. Si un stock est insuffisant, annule tout et renvoie un message d'erreur clair.</p>`,
  resources: [
    { label: "Enregistrement de base avec SaveChanges (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/saving/basic" },
    { label: "Utilisation des transactions (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/saving/transactions" }
  ]
});

// =====================================================================
// 3. Concurrence
// =====================================================================
window.COURSE.push({
  key: "ef-concurrency",
  title: "Conflits de concurrence : rowversion et DbUpdateConcurrencyException",
  summary: "Tu sauras détecter que deux personnes ont modifié la même ligne en même temps, et choisir comment résoudre le conflit.",
  objectives: [
    "Comprendre le problème de la mise à jour perdue",
    "Ajouter une colonne rowversion comme jeton de concurrence",
    "Intercepter DbUpdateConcurrencyException et résoudre le conflit",
    "Faire voyager la version dans une API pour renvoyer un 409"
  ],
  analogy: `<p>Deux collègues modifient le même <strong>document partagé hors ligne</strong>. Le premier enregistre. Le second enregistre ensuite et, sans le savoir, écrase le travail du premier. C'est la <strong>mise à jour perdue</strong>.</p>
<p>Pour l'éviter, chaque version du document porte un <strong>numéro</strong>. Au moment d'enregistrer, on vérifie : « suis-je bien parti de la dernière version ? ». Si le numéro a changé entre-temps, on refuse et on prévient l'utilisateur. Le <code>rowversion</code> de SQL Server, c'est ce numéro.</p>`,
  lesson: `<h3>Le problème : la mise à jour perdue</h3>
<p>Dans OrderFlow, Alice et Bob ouvrent le même produit dans le back-office. Alice vend 3 chaises et enregistre le stock à 7. Bob, qui avait encore l'ancienne version à l'écran, baisse le prix. Sans protection, son <code>UPDATE</code> passe : on ne sait même pas qu'il travaillait sur des données périmées. Avec un stock ou un solde, ce genre d'erreur coûte de l'argent.</p>
<pre class="diagram">
 Temps   Alice                 Bob
 -----   -------------------   -------------------
  t1     lit Chaise (v1)       lit Chaise (v1)
  t2     Stock = 7, Save
         -&gt; base passe en v2
  t3                           Price = 69, Save
                               WHERE RowVersion = v1
                               -&gt; 0 ligne : conflit !
</pre>

<h3>La solution d'EF : la concurrence optimiste</h3>
<p>On dit « optimiste » parce qu'on ne bloque personne : on parie que les conflits sont rares, et on les <strong>détecte</strong> au moment d'écrire. Pour ça, on ajoute à l'entité un <strong>jeton de concurrence</strong>. Sur SQL Server, le meilleur jeton est une colonne <code>rowversion</code> : un nombre de 8 octets que SQL Server change automatiquement à chaque modification de la ligne.</p>
<p>Côté C#, c'est une propriété <code>byte[]</code> marquée <code>[Timestamp]</code>, ou configurée avec <code>.IsRowVersion()</code> dans <code>OnModelCreating</code>. Ensuite, une migration ajoute la colonne.</p>
<div class="flow"><span>Lecture : EF garde la version v1</span><span>UPDATE … WHERE Id = @id AND RowVersion = v1</span><span>1 ligne : OK, nouvelle version lue</span><span>0 ligne : DbUpdateConcurrencyException</span></div>
<p>Tu n'as rien à écrire dans tes requêtes : EF ajoute tout seul la condition sur la version dans chaque <code>UPDATE</code> et chaque <code>DELETE</code>. Si SQL Server répond « 0 ligne modifiée », EF en déduit que quelqu'un est passé avant et lève <code>DbUpdateConcurrencyException</code>.</p>

<h3>Résoudre un conflit</h3>
<p>L'exception contient <code>Entries</code> : les entités en conflit. Pour chacune, tu peux lire trois jeux de valeurs : ce que tu veux écrire (<code>CurrentValues</code>), ce que tu avais lu (<code>OriginalValues</code>) et ce qu'il y a maintenant en base (<code>await entry.GetDatabaseValuesAsync()</code>). Trois stratégies existent :</p>
<table>
<tr><th>Stratégie</th><th>Comment</th><th>Quand</th></tr>
<tr><td>La base gagne</td><td><code>await entry.ReloadAsync()</code>, puis tu abandonnes ou tu demandes à l'utilisateur</td><td>Formulaires d'édition : on affiche les nouvelles valeurs</td></tr>
<tr><td>Rejouer la règle</td><td>Relire, réappliquer le calcul (stock - 1), réessayer</td><td>Opérations automatiques comme un décrément de stock</td></tr>
<tr><td>Le client gagne</td><td><code>entry.OriginalValues.SetValues(dbValues)</code> puis <code>SaveChanges</code></td><td>Rarement : on écrase sciemment l'autre modification</td></tr>
</table>
<div class="tip">Un « client gagne » sans réfléchir revient à désactiver la protection. Réserve-le aux cas où écraser est vraiment le comportement voulu.</div>

<h3>Dans une API : faire voyager la version</h3>
<p>Dans une API, la lecture et l'écriture se font dans deux requêtes HTTP. Le contexte de l'écriture relit le produit, donc il aurait la <em>dernière</em> version : le conflit ne serait jamais détecté. Il faut donc que le front renvoie la version qu'il avait lue. Le DTO de lecture expose <code>RowVersion</code> (sérialisée en base64 dans le JSON), le front la renvoie dans le <code>PUT</code>, et le serveur la place dans <code>OriginalValue</code> avant d'enregistrer. En cas d'exception, l'API répond <code>409 Conflict</code> et Angular peut afficher « Ce produit a été modifié, recharge la page ».</p>
<div class="note">Le <code>rowversion</code> protège toute la ligne. Si tu veux seulement protéger une colonne précise (par exemple <code>Email</code>), utilise <code>.IsConcurrencyToken()</code> sur cette propriété : EF ajoutera <code>AND Email = @ancien</code> à l'<code>UPDATE</code>. Et pour un simple décrément de stock, une instruction atomique <code>UPDATE … SET Stock = Stock - 1 WHERE Stock &gt;= 1</code> (leçon suivante) évite carrément le conflit.</div>`,
  examples: [
    {
      title: "Provoquer un conflit avec deux contextes",
      code: `using Microsoft.EntityFrameworkCore;

int id;
using (var setup = new OrderFlowDbContext())
{
    var chair = new Product { Name = "Chaise", Price = 79m, Stock = 10 };
    setup.Products.Add(chair);
    await setup.SaveChangesAsync();
    id = chair.Id;
}

// Deux utilisateurs ouvrent le même produit en même temps
using var alice = new OrderFlowDbContext();
using var bob = new OrderFlowDbContext();
var forAlice = await alice.Products.SingleAsync(p => p.Id == id);
var forBob = await bob.Products.SingleAsync(p => p.Id == id);

forAlice.Stock = 7;               // Alice vend 3 chaises
await alice.SaveChangesAsync();   // OK : la rowversion change en base
Console.WriteLine("Alice : enregistré");

forBob.Price = 69m;               // Bob baisse le prix, avec une version périmée
try
{
    await bob.SaveChangesAsync();
    Console.WriteLine("Bob : enregistré");
}
catch (DbUpdateConcurrencyException ex)
{
    Console.WriteLine($"Bob : conflit ! {ex.Entries.Count} entité concernée");
    Console.WriteLine($"Entité : {ex.Entries[0].Metadata.ClrType.Name}");
}`,
      output: `Alice : enregistré
Bob : conflit ! 1 entité concernée
Entité : Product`,
      steps: [
        "<code>using var alice = …; using var bob = …;</code> : deux contextes, comme deux requêtes HTTP de deux utilisateurs différents.",
        "<code>forAlice / forBob</code> : chacun lit le produit et garde la même version dans son snapshot.",
        "<code>await alice.SaveChangesAsync();</code> : l'<code>UPDATE</code> trouve la ligne avec la bonne version. SQL Server génère une nouvelle version.",
        "<code>forBob.Price = 69m;</code> : Bob modifie une autre colonne, mais à partir d'une version périmée.",
        "<code>catch (DbUpdateConcurrencyException ex)</code> : l'<code>UPDATE</code> de Bob contient <code>WHERE RowVersion = ancienne</code> et touche 0 ligne. EF lève l'exception.",
        "<code>ex.Entries[0].Metadata.ClrType.Name</code> : on retrouve quelle entité est en conflit."
      ],
      explain: "Il suffit d'ajouter la propriété RowVersion : EF fait tout le reste."
    },
    {
      title: "Résoudre en relisant puis en rejouant la règle métier",
      code: `using Microsoft.EntityFrameworkCore;

using var setup = new OrderFlowDbContext();
var desk = new Product { Name = "Bureau", Price = 250m, Stock = 4 };
setup.Products.Add(desk);
await setup.SaveChangesAsync();

using var db = new OrderFlowDbContext();
var mine = await db.Products.SingleAsync(p => p.Id == desk.Id);

desk.Stock = 2;                   // quelqu'un d'autre vend 2 bureaux
await setup.SaveChangesAsync();

mine.Stock -= 1;                  // je vends 1 bureau, je crois qu'il en reste 3
for (int attempt = 1; ; attempt++)
{
    try
    {
        await db.SaveChangesAsync();
        Console.WriteLine($"Tentative {attempt} : enregistré, stock = {mine.Stock}");
        break;
    }
    catch (DbUpdateConcurrencyException ex)
    {
        var entry = ex.Entries.Single();
        var dbValues = await entry.GetDatabaseValuesAsync();
        int stockInDb = dbValues!.GetValue<int>(nameof(Product.Stock));
        Console.WriteLine($"Tentative {attempt} : conflit, stock réel = {stockInDb}");

        entry.OriginalValues.SetValues(dbValues); // je prends la nouvelle version
        mine.Stock = stockInDb - 1;               // et je rejoue ma règle métier
    }
}`,
      output: `Tentative 1 : conflit, stock réel = 2
Tentative 2 : enregistré, stock = 1`,
      steps: [
        "<code>desk.Stock = 2; await setup.SaveChangesAsync();</code> : un autre contexte vend 2 bureaux pendant qu'on travaille.",
        "<code>mine.Stock -= 1;</code> : on croit qu'il en reste 4, on écrit 3. Ce serait faux.",
        "<code>for (int attempt = 1; ; attempt++)</code> : une boucle de tentatives. On en sort avec <code>break</code> quand l'enregistrement réussit.",
        "<code>await entry.GetDatabaseValuesAsync()</code> : relit la ligne actuelle en base, avec sa nouvelle version.",
        "<code>entry.OriginalValues.SetValues(dbValues);</code> : notre snapshot devient la version actuelle. Le prochain <code>UPDATE</code> visera donc la bonne version.",
        "<code>mine.Stock = stockInDb - 1;</code> : on rejoue la règle « vendre 1 » sur la vraie valeur : 2 - 1 = 1."
      ],
      explain: "En production, limite le nombre de tentatives (3 par exemple) pour ne pas boucler à l'infini sur une ligne très disputée."
    },
    {
      title: "Dans un endpoint PUT : renvoyer 409 Conflict",
      code: `using Microsoft.EntityFrameworkCore;

using var setup = new OrderFlowDbContext();
var bag = new Product { Name = "Sac", Price = 40m, Stock = 12 };
setup.Products.Add(bag);
await setup.SaveChangesAsync();

// Deux onglets du back-office lisent le produit : même version
var tabA = new UpdatePriceDto(45m, bag.RowVersion);
var tabB = new UpdatePriceDto(42m, bag.RowVersion);

Console.WriteLine($"Onglet A : {await UpdatePrice(bag.Id, tabA)}");
Console.WriteLine($"Onglet B : {await UpdatePrice(bag.Id, tabB)}");

// Ce que ferait un endpoint PUT /api/products/{id}/price
async Task<string> UpdatePrice(int id, UpdatePriceDto dto)
{
    using var db = new OrderFlowDbContext(); // un contexte neuf par requête
    var product = await db.Products.SingleOrDefaultAsync(p => p.Id == id);
    if (product is null) return "404 Not Found";

    // On compare avec la version que le client avait lue, pas celle qu'on vient de lire
    db.Entry(product).Property(p => p.RowVersion).OriginalValue = dto.RowVersion;
    product.Price = dto.Price;
    try
    {
        await db.SaveChangesAsync();
        return "200 OK";
    }
    catch (DbUpdateConcurrencyException)
    {
        return "409 Conflict : le produit a changé, recharge-le";
    }
}

record UpdatePriceDto(decimal Price, byte[] RowVersion);`,
      output: `Onglet A : 200 OK
Onglet B : 409 Conflict : le produit a changé, recharge-le`,
      steps: [
        "<code>new UpdatePriceDto(45m, bag.RowVersion)</code> : chaque onglet garde la version qu'il a lue, comme le ferait le front Angular.",
        "<code>using var db = new OrderFlowDbContext();</code> : chaque appel simule une requête HTTP avec son propre contexte.",
        "<code>db.Entry(product).Property(p =&gt; p.RowVersion).OriginalValue = dto.RowVersion;</code> : la ligne clé. On remplace la version relue par celle du client.",
        "<code>Onglet A : 200 OK</code> : sa version est la bonne, l'enregistrement passe et la version change en base.",
        "<code>Onglet B : 409 Conflict</code> : il envoie l'ancienne version, l'<code>UPDATE</code> touche 0 ligne.",
        "<code>record UpdatePriceDto(decimal Price, byte[] RowVersion);</code> : en JSON, un <code>byte[]</code> est sérialisé en chaîne base64."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ajouter la RowVersion à Product",
      prompt: `<p>Ajoute une propriété <code>RowVersion</code> à la classe <code>Product</code> avec l'annotation <code>[Timestamp]</code>, puis écris les deux commandes qui créent la migration et mettent la base à jour.</p>`,
      hint: `<p>Le type est <code>byte[]</code>. L'annotation se trouve dans <code>System.ComponentModel.DataAnnotations</code>.</p>`,
      solution: `// Fichier : Product.cs
using System.ComponentModel.DataAnnotations;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }

    [Timestamp] // équivaut à .IsRowVersion() dans OnModelCreating
    public byte[] RowVersion { get; set; } = [];
}

// Puis dans le terminal :
// dotnet ef migrations add AddProductRowVersion
// dotnet ef database update`
    },
    {
      level: "moyen",
      title: "La base gagne",
      prompt: `<p>Provoque un conflit sur un ventilateur : un contexte change le stock, l'autre change le prix avec une version périmée. Dans le <code>catch</code>, applique la stratégie « la base gagne » avec <code>ReloadAsync()</code> et affiche le stock relu.</p>`,
      hint: `<p><code>ReloadAsync()</code> relit la ligne, remplace les valeurs courantes et d'origine, et repasse l'entité en <code>Unchanged</code>. Ta modification de prix est perdue, c'est voulu.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var setup = new OrderFlowDbContext();
var fan = new Product { Name = "Ventilateur", Price = 40m, Stock = 6 };
setup.Products.Add(fan);
await setup.SaveChangesAsync();

using var db = new OrderFlowDbContext();
var mine = await db.Products.SingleAsync(p => p.Id == fan.Id);

fan.Stock = 1;                  // un autre utilisateur passe avant moi
await setup.SaveChangesAsync();

mine.Price = 35m;
try
{
    await db.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException ex)
{
    await ex.Entries.Single().ReloadAsync(); // "la base gagne" : on relit et on abandonne
    Console.WriteLine($"Conflit : stock relu depuis la base = {mine.Stock}");
}`
    },
    {
      level: "difficile",
      title: "Un helper de nouvelle tentative",
      prompt: `<p>Écris <code>SaveWithRetryAsync(DbContext ctx, Action applyChange, int maxAttempts = 3)</code> : il applique la modification, enregistre, et en cas de conflit relit les entités concernées puis rejoue <code>applyChange</code>. Après <code>maxAttempts</code> échecs, l'exception doit remonter.</p>`,
      hint: `<p>Un filtre <code>catch (DbUpdateConcurrencyException ex) when (attempt &lt; maxAttempts)</code> laisse passer l'exception à la dernière tentative.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
var kettle = new Product { Name = "Bouilloire", Price = 30m, Stock = 10 };
db.Products.Add(kettle);
await db.SaveChangesAsync();

await SaveWithRetryAsync(db, () => kettle.Stock -= 1);
Console.WriteLine($"Stock : {kettle.Stock}");

// Applique la modification, enregistre, et rejoue tout en cas de conflit
async Task SaveWithRetryAsync(DbContext ctx, Action applyChange, int maxAttempts = 3)
{
    applyChange();
    for (int attempt = 1; ; attempt++)
    {
        try
        {
            await ctx.SaveChangesAsync();
            return;
        }
        catch (DbUpdateConcurrencyException ex) when (attempt < maxAttempts)
        {
            foreach (var entry in ex.Entries)
                await entry.ReloadAsync(); // valeurs fraîches + nouvelle rowversion
            applyChange();                 // on rejoue la règle métier
        }
    }
}`
    }
  ],
  quiz: [
    {
      q: `Comment EF détecte-t-il un conflit avec une <code>RowVersion</code> ?`,
      options: ["Il relit la ligne avant chaque <code>UPDATE</code>", "Il pose un verrou sur la ligne dès la lecture", "Il ajoute <code>AND RowVersion = @ancienne</code> et vérifie le nombre de lignes touchées"],
      answer: 2,
      why: `C'est la concurrence optimiste : aucun verrou, aucune lecture en plus. Si l'<code>UPDATE</code> touche 0 ligne, la version a changé, donc quelqu'un est passé avant.`
    },
    {
      q: `Dans une API, pourquoi le front doit-il renvoyer la <code>RowVersion</code> qu'il a lue ?`,
      options: ["Parce que le serveur relit le produit et aurait sinon la dernière version", "Pour que SQL Server puisse la recalculer", "Parce que <code>SaveChanges</code> refuse une entité sans version"],
      answer: 0,
      why: `Le contexte du <code>PUT</code> relit la ligne : sans la version du client, il comparerait la dernière version avec elle-même et ne verrait jamais de conflit.`
    },
    {
      q: `Quel code HTTP renvoyer quand <code>DbUpdateConcurrencyException</code> est levée sur un <code>PUT</code> ?`,
      options: ["<code>404 Not Found</code>", "<code>409 Conflict</code>", "<code>500 Internal Server Error</code>"],
      answer: 1,
      why: `409 signifie que la requête est en conflit avec l'état actuel de la ressource. Le client peut recharger et réessayer. Un 500 ferait croire à un bug du serveur.`
    }
  ],
  project: `<p>Ajoute <code>RowVersion</code> sur <code>Product</code> et crée la migration <code>AddProductRowVersion</code>. Expose la version dans <code>ProductDto</code>, puis écris <code>ProductService.UpdatePriceAsync(int id, decimal price, byte[] rowVersion)</code> qui renvoie <code>Updated</code>, <code>NotFound</code> ou <code>Conflict</code> (un petit enum). Tu le brancheras sur <code>PUT /api/products/{id}</code> dans la partie API.</p>`,
  resources: [
    { label: "Gestion des conflits d'accès concurrentiel (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/saving/concurrency" }
  ]
});

// =====================================================================
// 4. ExecuteUpdate et ExecuteDelete
// =====================================================================
window.COURSE.push({
  key: "ef-bulk",
  title: "Modifications en masse : ExecuteUpdate et ExecuteDelete",
  summary: "Tu sauras modifier ou supprimer des milliers de lignes en une seule instruction SQL, sans les charger en mémoire.",
  objectives: [
    "Comprendre pourquoi la boucle « charger, modifier, SaveChanges » est lente en masse",
    "Écrire un ExecuteUpdate avec un ou plusieurs SetProperty",
    "Supprimer en masse avec ExecuteDelete",
    "Connaître les pièges : tracker non mis à jour, pas de SaveChanges, pas de cascade EF"
  ],
  analogy: `<p>Le gérant d'un magasin veut baisser de 20 % le prix de tous les pulls. Il peut prendre chaque pull, enlever l'étiquette, en coller une nouvelle, et le remettre en rayon : c'est la boucle avec <code>SaveChanges</code>.</p>
<p>Ou il peut afficher une seule pancarte au-dessus du rayon : « -20 % sur tous les pulls ». C'est <code>ExecuteUpdate</code> : une seule consigne, appliquée directement par SQL Server, sans rien sortir du rayon.</p>`,
  lesson: `<h3>Le coût de la méthode classique</h3>
<p>Avec ce que tu connais, augmenter le prix de 10 000 produits demande : une requête qui ramène les 10 000 lignes, 10 000 objets en mémoire suivis par le tracker, puis un <code>SaveChanges</code> qui envoie 10 000 <code>UPDATE</code> (regroupés par lots, mais quand même). C'est beaucoup de réseau et de mémoire pour une règle qu'une seule phrase SQL exprime.</p>
<div class="compare"><div><h4>Charger + SaveChanges</h4><p>SELECT de toutes les lignes, objets en mémoire, un UPDATE par ligne. Passe par le tracker, donc par la RowVersion et les intercepteurs de sauvegarde.</p></div><div><h4>ExecuteUpdate / ExecuteDelete</h4><p>Une seule instruction <code>UPDATE … WHERE …</code> ou <code>DELETE … WHERE …</code>. Rien n'est chargé, rien n'est suivi.</p></div></div>

<h3>ExecuteUpdate : une instruction UPDATE en LINQ</h3>
<p>Disponibles depuis EF Core 7, <code>ExecuteUpdateAsync</code> et <code>ExecuteDeleteAsync</code> s'appellent sur un <code>IQueryable</code>. Tu décris les lignes visées avec <code>Where</code>, puis les colonnes à changer avec <code>SetProperty</code> :</p>
<div class="flow"><span>db.Products</span><span>.Where(filtre)</span><span>.ExecuteUpdateAsync(SetProperty…)</span><span>UPDATE … SET … WHERE …</span><span>nombre de lignes</span></div>
<p><code>SetProperty</code> prend deux lambdas : la propriété à modifier, et la nouvelle valeur. Cette valeur peut être une constante (<code>OrderStatus.Cancelled</code>) ou une expression calculée à partir de la ligne elle-même (<code>p =&gt; p.Price * 0.8m</code>). Tu peux enchaîner plusieurs <code>SetProperty</code>. La méthode renvoie le nombre de lignes touchées.</p>
<p>Nouveauté d'EF Core 10 : tu peux écrire le corps entre accolades et ajouter un <code>SetProperty</code> sous condition, avec un simple <code>if</code>. Avant, il fallait construire un arbre d'expressions à la main.</p>

<h3>ExecuteDelete : supprimer sans charger</h3>
<p><code>ExecuteDeleteAsync()</code> transforme ta requête en <code>DELETE FROM … WHERE …</code>. Pas besoin de <code>Remove</code> ni de <code>SaveChanges</code>. Les cascades définies <strong>dans la base</strong> (le <code>ON DELETE CASCADE</code> créé par tes migrations) s'appliquent normalement : supprimer une commande supprime ses lignes.</p>

<h3>Les pièges à connaître</h3>
<table>
<tr><th>Piège</th><th>Conséquence</th><th>Parade</th></tr>
<tr><td>Le tracker n'est pas prévenu</td><td>Un produit déjà chargé garde son ancien stock en mémoire</td><td>Relis les données ou fais <code>ChangeTracker.Clear()</code> après l'opération</td></tr>
<tr><td>Exécution immédiate</td><td>Pas besoin de <code>SaveChanges</code>, et pas de transaction commune avec lui</td><td>Ouvre une transaction explicite si tu mélanges les deux</td></tr>
<tr><td>Pas de logique EF</td><td>Pas de contrôle de <code>RowVersion</code>, pas d'intercepteur de <code>SaveChanges</code>, pas de cascade gérée par EF</td><td>Réserve-le aux règles simples et sûres</td></tr>
<tr><td>Où est le filtre ?</td><td>Un <code>Where</code> oublié modifie toute la table</td><td>Teste d'abord la requête avec <code>ToQueryString()</code> ou un <code>CountAsync()</code></td></tr>
</table>
<div class="tip">Un <code>ExecuteUpdate</code> sans <code>Where</code> modifie <strong>toutes</strong> les lignes de la table, sans confirmation. Écris toujours le <code>Where</code> en premier.</div>

<h3>Un usage idéal : le décrément atomique</h3>
<p>Pour réserver du stock, la méthode « lire le stock, vérifier, écrire » laisse une fenêtre où deux clients achètent le dernier article. Avec <code>Where(p =&gt; p.Id == id &amp;&amp; p.Stock &gt;= qty).ExecuteUpdateAsync(s =&gt; s.SetProperty(p =&gt; p.Stock, p =&gt; p.Stock - qty))</code>, SQL Server vérifie et décrémente dans la <em>même</em> instruction. Si la méthode renvoie 1, la réservation est faite ; 0, le stock ne suffisait pas. Pas de conflit possible, pas de boucle de tentatives.</p>
<div class="note">Pour des imports de centaines de milliers de lignes (insertion), <code>ExecuteUpdate</code> ne sert pas : regarde <code>SqlBulkCopy</code> (vu dans la partie ADO.NET) ou des bibliothèques spécialisées. <code>ExecuteUpdate</code> et <code>ExecuteDelete</code> brillent pour les règles « toutes les lignes qui… ».</div>`,
  examples: [
    {
      title: "Réassort et nettoyage en une instruction",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Products.AddRange(
    new Product { Name = "Promo-Stylo", Price = 2m, Stock = 0 },
    new Product { Name = "Promo-Cahier", Price = 4m, Stock = 3 },
    new Product { Name = "Promo-Gomme", Price = 1m, Stock = 1 });
await db.SaveChangesAsync();

// Réassort : +50 pour chaque produit "Promo-" presque épuisé
int updated = await db.Products
    .Where(p => p.Name.StartsWith("Promo-") && p.Stock < 2)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock + 50));
Console.WriteLine($"Produits réassortis : {updated}");

// Piège : les objets déjà suivis n'ont pas bougé
var pen = db.Products.Local.Single(p => p.Name == "Promo-Stylo");
Console.WriteLine($"En mémoire : {pen.Stock}");

var fresh = await db.Products.AsNoTracking().SingleAsync(p => p.Id == pen.Id);
Console.WriteLine($"En base : {fresh.Stock}");

// Ménage en une seule instruction DELETE
int deleted = await db.Products.Where(p => p.Name.StartsWith("Promo-")).ExecuteDeleteAsync();
Console.WriteLine($"Produits supprimés : {deleted}");`,
      output: `Produits réassortis : 2
En mémoire : 0
En base : 50
Produits supprimés : 3`,
      steps: [
        "<code>db.Products.AddRange(…)</code> : trois produits de test, dont deux avec un stock inférieur à 2.",
        "<code>.Where(p =&gt; p.Name.StartsWith(\"Promo-\") &amp;&amp; p.Stock &lt; 2)</code> : le filtre devient la clause <code>WHERE</code>.",
        "<code>s.SetProperty(p =&gt; p.Stock, p =&gt; p.Stock + 50)</code> : la nouvelle valeur est calculée par SQL Server, ligne par ligne.",
        "<code>Produits réassortis : 2</code> : la méthode renvoie le nombre de lignes touchées, sans <code>SaveChanges</code>.",
        "<code>En mémoire : 0</code> : le stylo suivi par le contexte n'a pas été mis à jour. Le tracker ignore ce qu'a fait <code>ExecuteUpdate</code>.",
        "<code>ExecuteDeleteAsync()</code> : un seul <code>DELETE</code> pour les trois produits."
      ],
      explain: "Après une opération en masse, ne fais plus confiance aux objets déjà chargés : relis-les."
    },
    {
      title: "EF Core 10 : un SetProperty ajouté sous condition",
      code: `using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

var options = new DbContextOptionsBuilder<OrderFlowDbContext>()
    .UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True")
    .AddInterceptors(new SqlPrinter()) // affiche chaque UPDATE/DELETE envoyé
    .Options;
using var db = new OrderFlowDbContext(options);

db.Products.AddRange(
    new Product { Name = "Soldes-Pull", Price = 30m, Stock = 4 },
    new Product { Name = "Soldes-Bonnet", Price = 12m, Stock = 9 });
await db.SaveChangesAsync(); // INSERT : non affiché par SqlPrinter

bool endOfSeries = true; // valeur connue seulement à l'exécution

int count = await db.Products
    .Where(p => p.Name.StartsWith("Soldes-"))
    .ExecuteUpdateAsync(s =>
    {
        s.SetProperty(p => p.Price, p => p.Price * 0.8m); // -20 %
        if (endOfSeries) // EF Core 10 : setter ajouté sous condition
            s.SetProperty(p => p.Stock, 0);
    });
Console.WriteLine($"Produits soldés : {count}");

await db.Products.Where(p => p.Name.StartsWith("Soldes-")).ExecuteDeleteAsync(); // ménage

class SqlPrinter : DbCommandInterceptor
{
    public override ValueTask<InterceptionResult<int>> NonQueryExecutingAsync(
        DbCommand command, CommandEventData eventData, InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        Console.WriteLine(command.CommandText);
        return base.NonQueryExecutingAsync(command, eventData, result, cancellationToken);
    }
}`,
      output: `UPDATE [p]
SET [p].[Price] = [p].[Price] * 0.8,
    [p].[Stock] = @p
FROM [Products] AS [p]
WHERE [p].[Name] LIKE N'Soldes-%'
Produits soldés : 2
DELETE FROM [p]
FROM [Products] AS [p]
WHERE [p].[Name] LIKE N'Soldes-%'`,
      steps: [
        "<code>.AddInterceptors(new SqlPrinter())</code> : un intercepteur est une classe qu'EF appelle avant chaque commande SQL. Ici il affiche le texte des <code>UPDATE</code> et <code>DELETE</code>.",
        "<code>new OrderFlowDbContext(options)</code> : on utilise le constructeur qui reçoit des options, pour ajouter l'intercepteur.",
        "<code>.ExecuteUpdateAsync(s =&gt; { … })</code> : depuis EF Core 10, le corps peut être un bloc avec des instructions normales.",
        "<code>if (endOfSeries) s.SetProperty(p =&gt; p.Stock, 0);</code> : la colonne <code>Stock</code> n'est ajoutée au <code>SET</code> que si la condition est vraie.",
        "<code>UPDATE [p] SET … WHERE [p].[Name] LIKE N'Soldes-%'</code> : un seul <code>UPDATE</code> pour tous les produits concernés. <code>StartsWith</code> est traduit en <code>LIKE</code>.",
        "<code>class SqlPrinter : DbCommandInterceptor</code> : on redéfinit <code>NonQueryExecutingAsync</code>, appelée pour les commandes qui ne renvoient pas de lignes."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Supprimer les produits épuisés",
      prompt: `<p>Ajoute trois produits « Test-1 », « Test-2 », « Test-3 », dont deux avec un stock à 0. Supprime en une instruction les produits « Test- » dont le stock vaut 0 et affiche le nombre de suppressions. Fais le ménage à la fin.</p>`,
      hint: `<p>Combine <code>Where(p =&gt; p.Name.StartsWith(\"Test-\") &amp;&amp; p.Stock == 0)</code> et <code>ExecuteDeleteAsync()</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Products.AddRange(
    new Product { Name = "Test-1", Price = 1m, Stock = 0 },
    new Product { Name = "Test-2", Price = 1m, Stock = 5 },
    new Product { Name = "Test-3", Price = 1m, Stock = 0 });
await db.SaveChangesAsync();

int deleted = await db.Products
    .Where(p => p.Name.StartsWith("Test-") && p.Stock == 0)
    .ExecuteDeleteAsync();
Console.WriteLine($"Supprimés : {deleted}"); // 2

await db.Products.Where(p => p.Name.StartsWith("Test-")).ExecuteDeleteAsync(); // ménage`
    },
    {
      level: "moyen",
      title: "Augmenter les petits prix de 5 %",
      prompt: `<p>Augmente de 5 % le prix de tous les produits qui coûtent moins de 10, en une seule instruction SQL, et affiche le nombre de produits modifiés.</p>`,
      hint: `<p>La nouvelle valeur se calcule à partir de l'ancienne : <code>s.SetProperty(p =&gt; p.Price, p =&gt; p.Price * 1.05m)</code>. Le suffixe <code>m</code> indique un <code>decimal</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
decimal threshold = 10m;

int updated = await db.Products
    .Where(p => p.Price < threshold)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Price, p => p.Price * 1.05m));
Console.WriteLine($"Produits augmentés de 5 % : {updated}");`
    },
    {
      level: "difficile",
      title: "Le grand ménage des commandes",
      prompt: `<p>Écris <code>CleanUpOrdersAsync(OrderFlowDbContext ctx, DateTime now)</code> qui, dans une transaction : passe en <code>Cancelled</code> les commandes <code>Pending</code> de plus de 30 jours, puis supprime les commandes <code>Cancelled</code> de plus d'un an. Renvoie les deux nombres dans un tuple.</p>`,
      hint: `<p>Deux appels <code>Execute…</code> font deux allers-retours : la transaction explicite garantit que les deux réussissent ou échouent ensemble. Les lignes de commande partent avec la commande grâce au <code>ON DELETE CASCADE</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
var (cancelled, purged) = await CleanUpOrdersAsync(db, DateTime.UtcNow);
Console.WriteLine($"Annulées : {cancelled}, purgées : {purged}");

async Task<(int Cancelled, int Purged)> CleanUpOrdersAsync(OrderFlowDbContext ctx, DateTime now)
{
    await using var tx = await ctx.Database.BeginTransactionAsync();

    int cancelled = await ctx.Orders
        .Where(o => o.Status == OrderStatus.Pending && o.OrderDate < now.AddDays(-30))
        .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, OrderStatus.Cancelled));

    // ON DELETE CASCADE (créé par la migration) supprime aussi les lignes
    int purged = await ctx.Orders
        .Where(o => o.Status == OrderStatus.Cancelled && o.OrderDate < now.AddYears(-1))
        .ExecuteDeleteAsync();

    await tx.CommitAsync();
    return (cancelled, purged);
}`
    }
  ],
  quiz: [
    {
      q: `Après <code>ExecuteUpdateAsync</code>, faut-il appeler <code>SaveChanges</code> ?`,
      options: ["Oui, sinon rien n'est écrit", "Non, l'instruction est déjà exécutée", "Oui, mais seulement dans une transaction"],
      answer: 1,
      why: `<code>ExecuteUpdate</code> et <code>ExecuteDelete</code> envoient leur SQL immédiatement. Ils ne passent pas du tout par le change tracker.`
    },
    {
      q: `Un produit est chargé et suivi, puis un <code>ExecuteUpdate</code> change son stock en base. Que vaut le stock de l'objet en mémoire ?`,
      options: ["L'ancienne valeur", "La nouvelle valeur, EF le synchronise", "0"],
      answer: 0,
      why: `Le tracker n'est pas prévenu des opérations en masse. Il faut relire l'entité (ou vider le tracker) pour voir la nouvelle valeur.`
    },
    {
      q: `Pourquoi <code>Where(p =&gt; p.Stock &gt;= qty).ExecuteUpdateAsync(… p.Stock - qty …)</code> est-il sûr pour réserver du stock ?`,
      options: ["Parce qu'EF vérifie la RowVersion", "Parce qu'il pose un verrou sur toute la table", "Parce que la vérification et le décrément se font dans la même instruction SQL"],
      answer: 2,
      why: `SQL Server évalue le <code>WHERE</code> et applique le <code>SET</code> de façon atomique sur chaque ligne. Deux clients ne peuvent pas prendre le même dernier article. Attention : <code>ExecuteUpdate</code> ne vérifie justement pas la <code>RowVersion</code>.`
    },
    {
      q: `Quel est le risque principal d'<code>ExecuteDeleteAsync()</code> ?`,
      options: ["Il charge toute la table en mémoire", "Sans <code>Where</code>, il vide toute la table", "Il ne fonctionne qu'avec une transaction"],
      answer: 1,
      why: `<code>db.Products.ExecuteDeleteAsync()</code> devient <code>DELETE FROM Products</code>. Aucun chargement, aucune confirmation : le filtre est ta seule protection.`
    }
  ],
  project: `<p>Dans OrderFlow, remplace la vérification et le décrément de stock de <code>PlaceOrderAsync</code> par un décrément atomique : <code>ExecuteUpdateAsync</code> avec <code>Where(p =&gt; p.Id == id &amp;&amp; p.Stock &gt;= qty)</code>, dans la transaction existante. Si une ligne renvoie 0, annule toute la commande. Ajoute aussi <code>OrderService.CancelStalePendingOrdersAsync(TimeSpan age)</code> qui annule en une instruction les commandes <code>Pending</code> trop anciennes et renvoie leur nombre.</p>`,
  resources: [
    { label: "ExecuteUpdate et ExecuteDelete (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/saving/execute-insert-update-delete" }
  ]
});

// =====================================================================
// 5. Modélisation avancée
// =====================================================================
window.COURSE.push({
  key: "ef-advanced-modeling",
  title: "Modélisation avancée : owned types, value converters, héritage",
  summary: "Tu sauras ranger un petit objet valeur dans les colonnes de son propriétaire, convertir un type C# pour la base et mapper une hiérarchie de classes.",
  objectives: [
    "Mapper un objet valeur (une adresse) avec OwnsOne",
    "Écrire un value converter avec HasConversion",
    "Choisir entre TPH, TPT et TPC pour une hiérarchie de classes",
    "Lire le schéma généré pour vérifier ses choix"
  ],
  analogy: `<p>Pense à un <strong>formulaire papier</strong>. L'adresse n'a pas sa propre fiche : c'est un <strong>bloc de cases</strong> (rue, ville, code postal) imprimé dans le formulaire du client. C'est un <em>owned type</em>.</p>
<p>Un <strong>value converter</strong>, c'est le traducteur au guichet : tu parles en « référence de commande », il écrit une simple chaîne sur le formulaire, et inversement. Et l'<strong>héritage</strong>, c'est le choix entre un seul formulaire « Paiement » avec une case à cocher « carte ou virement », ou un formulaire par type de paiement.</p>`,
  lesson: `<h3>Les objets valeur</h3>
<p>Un <strong>objet valeur</strong> (en anglais <em>value object</em>) est un petit type défini par ses valeurs, sans identité propre : une adresse, une somme d'argent, une référence. Deux adresses identiques sont interchangeables. En C#, un <code>record</code> est parfait pour ça : il est immuable et compare par valeur.</p>
<p>Dans OrderFlow, une adresse de livraison n'a pas besoin de sa propre table ni de son propre <code>Id</code>. On veut juste des colonnes <code>Street</code>, <code>City</code>, <code>ZipCode</code> dans la table du propriétaire. EF Core propose deux outils pour ça.</p>

<h3>Owned types avec OwnsOne</h3>
<p><code>modelBuilder.Entity&lt;Customer&gt;().OwnsOne(c =&gt; c.ShippingAddress)</code> déclare que l'adresse « appartient » au client. Par défaut, ses propriétés deviennent des colonnes préfixées : <code>ShippingAddress_City</code>. Tu peux les renommer avec <code>HasColumnName</code>. L'adresse est toujours chargée avec le client, et tu peux filtrer dessus en LINQ : <code>Where(c =&gt; c.ShippingAddress.City == "Lyon")</code>.</p>
<pre class="diagram">
 C#                          Table Customers
 Customer                    +-------------------------+
  Id ----------------------&gt; | Id                      |
  Name --------------------&gt; | Name                    |
  ShippingAddress            | ShippingAddress_Street  |
    Street ----------------&gt; |                         |
    City ------------------&gt; | ShippingAddress_City    |
    ZipCode ---------------&gt; | ShippingAddress_ZipCode |
                             +-------------------------+
</pre>
<p>Avec <code>OwnsMany</code>, une collection d'objets possédés est rangée dans une table séparée (ou dans une colonne JSON avec <code>ToJson()</code>).</p>
<div class="note">EF Core propose aussi les <em>complex types</em> (<code>ComplexProperty(c =&gt; c.ShippingAddress)</code>), pensés exprès pour les objets valeur : ils ne sont pas suivis comme des entités, ce qui évite des pièges des owned types (un même objet partagé entre deux entités, par exemple). Depuis EF Core 10, ils gèrent aussi les valeurs optionnelles et le stockage JSON. Pour un nouveau projet, c'est souvent le meilleur choix ; le schéma en base est le même.</div>

<h3>Value converters : traduire un type pour la base</h3>
<p>SQL Server ne connaît que ses types : <code>nvarchar</code>, <code>int</code>, <code>decimal</code>… Un <strong>value converter</strong> dit à EF comment passer d'un type C# à un type SQL et retour. Tu en as déjà utilisé un : <code>HasConversion&lt;string&gt;()</code> sur <code>OrderStatus</code> stocke <code>"Paid"</code> au lieu de 1.</p>
<div class="flow"><span>OrderRef("CMD-42")</span><span>r =&gt; r.Value</span><span>nvarchar 'CMD-42'</span><span>v =&gt; new OrderRef(v)</span><span>OrderRef("CMD-42")</span></div>
<p>Pour ton propre type, tu donnes deux lambdas : <code>HasConversion(r =&gt; r.Value, v =&gt; new OrderRef(v))</code>. EF convertit aussi les paramètres de tes requêtes : <code>Where(o =&gt; o.Reference == new OrderRef("CMD-42"))</code> fonctionne.</p>
<div class="tip">Une conversion est opaque pour SQL : <code>Where(o =&gt; o.Reference.Value.StartsWith("CMD"))</code> ne peut pas être traduit, car la colonne ne contient pas d'objet. Compare des objets entiers, ou garde une propriété <code>string</code> simple si tu dois chercher dedans.</div>

<h3>L'héritage : trois stratégies</h3>
<p>Quand tu as une classe de base abstraite <code>Payment</code> et des classes filles <code>CardPayment</code> et <code>TransferPayment</code>, EF peut les ranger de trois façons :</p>
<table>
<tr><th>Stratégie</th><th>Tables</th><th>Avantage</th><th>Inconvénient</th></tr>
<tr><td>TPH (par défaut) : <em>table per hierarchy</em></td><td>Une seule table avec une colonne discriminante</td><td>Requêtes rapides, aucune jointure</td><td>Colonnes des filles forcément nullables</td></tr>
<tr><td>TPT : <em>table per type</em></td><td>Une table pour la base + une par fille</td><td>Schéma « propre », colonnes non nulles</td><td>Jointures à chaque requête, plus lent</td></tr>
<tr><td>TPC : <em>table per concrete type</em></td><td>Une table complète par fille</td><td>Pas de jointure pour un type précis</td><td>Requêtes polymorphes en <code>UNION</code>, clés à partager</td></tr>
</table>
<p>Avec TPH, EF ajoute une colonne <strong>discriminante</strong> (par défaut <code>Discriminator</code>) qui contient le nom du type. À la lecture, il crée le bon objet C#. Tu peux nommer cette colonne et ses valeurs avec <code>HasDiscriminator&lt;string&gt;("PaymentType").HasValue&lt;CardPayment&gt;("Card")</code>. Pour TPT ou TPC, appelle <code>UseTptMappingStrategy()</code> ou <code>UseTpcMappingStrategy()</code> sur la classe de base.</p>
<p>Commence par TPH : c'est le plus performant et le plus simple. Passe à TPT seulement si les classes filles ont beaucoup de colonnes différentes et que des colonnes nullables te gênent vraiment.</p>`,
  examples: [
    {
      title: "Une adresse possédée par le client",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new ShopDbContext();
await db.Database.EnsureDeletedAsync(); // base de démo jetable
await db.Database.EnsureCreatedAsync();

db.Customers.Add(new Customer
{
    Name = "Léa",
    ShippingAddress = new Address("12 rue des Lilas", "Lyon", "69003")
});
await db.SaveChangesAsync();
db.ChangeTracker.Clear();

var lea = await db.Customers.SingleAsync();
Console.WriteLine($"{lea.Name} habite à {lea.ShippingAddress.City}");

var columns = await db.Database.SqlQueryRaw<string>(
    "SELECT COLUMN_NAME AS Value FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Customers'")
    .ToListAsync();
Console.WriteLine($"Colonnes : {string.Join(", ", columns)}");

public record Address(string Street, string City, string ZipCode);

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public Address ShippingAddress { get; set; } = null!;
}

public class ShopDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    protected override void OnConfiguring(DbContextOptionsBuilder o) =>
        o.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder b) =>
        b.Entity<Customer>().OwnsOne(c => c.ShippingAddress);
}`,
      output: `Léa habite à Lyon
Colonnes : Id, Name, ShippingAddress_Street, ShippingAddress_City, ShippingAddress_ZipCode`,
      steps: [
        "<code>Database=OrderFlowDemo</code> : les exemples de cette leçon utilisent un petit contexte à part et une base de démo jetable, pour ne pas toucher à OrderFlow.",
        "<code>EnsureDeletedAsync() / EnsureCreatedAsync()</code> : supprime puis recrée la base de démo à partir du modèle, sans migration. À réserver aux démos et aux tests.",
        "<code>public record Address(string Street, string City, string ZipCode);</code> : l'objet valeur, sans <code>Id</code>.",
        "<code>b.Entity&lt;Customer&gt;().OwnsOne(c =&gt; c.ShippingAddress);</code> : l'adresse est rangée dans la table <code>Customers</code>.",
        "<code>lea.ShippingAddress.City</code> : l'adresse est chargée automatiquement avec le client, sans <code>Include</code>.",
        "<code>SqlQueryRaw&lt;string&gt;(\"SELECT COLUMN_NAME AS Value …\")</code> : on lit le schéma réel. Une requête vers un type simple doit nommer sa colonne <code>Value</code>."
      ],
      explain: "Une seule table, trois colonnes préfixées : l'adresse n'existe pas en dehors de son client."
    },
    {
      title: "Value converters : une référence et un enum",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new ShopDbContext();
await db.Database.EnsureDeletedAsync();
await db.Database.EnsureCreatedAsync();

db.Orders.Add(new Order { Reference = new OrderRef("CMD-2026-0042"), Status = OrderStatus.Paid });
await db.SaveChangesAsync();

// Ce qui est réellement stocké dans les colonnes
var raw = await db.Database.SqlQueryRaw<string>(
    "SELECT Reference + ' | ' + Status AS Value FROM Orders").SingleAsync();
Console.WriteLine($"En base : {raw}");

// On filtre avec le type C#, EF convertit le paramètre
var found = await db.Orders.SingleAsync(o => o.Reference == new OrderRef("CMD-2026-0042"));
Console.WriteLine($"En C# : {found.Reference.Value} ({found.Status})");

public record OrderRef(string Value);
public enum OrderStatus { Pending, Paid, Shipped, Cancelled }
public class Order
{
    public int Id { get; set; }
    public OrderRef Reference { get; set; } = null!;
    public OrderStatus Status { get; set; }
}

public class ShopDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnConfiguring(DbContextOptionsBuilder o) =>
        o.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Order>().Property(o => o.Reference)
            .HasConversion(r => r.Value, v => new OrderRef(v)) // C# -> SQL, SQL -> C#
            .HasMaxLength(20);
        b.Entity<Order>().Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
    }
}`,
      output: `En base : CMD-2026-0042 | Paid
En C# : CMD-2026-0042 (Paid)`,
      steps: [
        "<code>public record OrderRef(string Value);</code> : un type dédié évite de confondre une référence de commande avec n'importe quelle chaîne.",
        "<code>.HasConversion(r =&gt; r.Value, v =&gt; new OrderRef(v))</code> : la première lambda va de C# vers SQL, la seconde de SQL vers C#.",
        "<code>.HasConversion&lt;string&gt;()</code> sur <code>Status</code> : le convertisseur intégré range l'enum sous forme de texte.",
        "<code>SELECT Reference + ' | ' + Status</code> : en base, ce ne sont que deux <code>nvarchar</code> lisibles.",
        "<code>o.Reference == new OrderRef(\"CMD-2026-0042\")</code> : EF convertit aussi la valeur du filtre avant de l'envoyer en paramètre."
      ]
    },
    {
      title: "Héritage TPH : une table pour tous les paiements",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new ShopDbContext();
await db.Database.EnsureDeletedAsync();
await db.Database.EnsureCreatedAsync();
db.Payments.AddRange(
    new CardPayment { Amount = 59m, Last4 = "4242" },
    new TransferPayment { Amount = 120m, Iban = "FR76 3000 6000 0112" },
    new CardPayment { Amount = 15m, Last4 = "1881" });
await db.SaveChangesAsync();
db.ChangeTracker.Clear();
foreach (var p in await db.Payments.OrderBy(p => p.Amount).ToListAsync())
    Console.WriteLine(p switch
    {
        CardPayment c => $"Carte ****{c.Last4}",
        TransferPayment t => $"Virement depuis {t.Iban}",
        _ => "?"
    });
int cards = await db.Payments.OfType<CardPayment>().CountAsync();
Console.WriteLine($"Paiements par carte : {cards}");
var kinds = await db.Database.SqlQueryRaw<string>(
    "SELECT DISTINCT PaymentType AS Value FROM Payments").ToListAsync();
Console.WriteLine($"Discriminateur : {string.Join(", ", kinds.Order())}");

public abstract class Payment { public int Id { get; set; } public decimal Amount { get; set; } }
public class CardPayment : Payment { public string Last4 { get; set; } = ""; }
public class TransferPayment : Payment { public string Iban { get; set; } = ""; }

public class ShopDbContext : DbContext
{
    public DbSet<Payment> Payments => Set<Payment>();
    protected override void OnConfiguring(DbContextOptionsBuilder o) =>
        o.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Payment>().Property(p => p.Amount).HasPrecision(10, 2);
        b.Entity<Payment>().HasDiscriminator<string>("PaymentType") // une seule table
            .HasValue<CardPayment>("Card").HasValue<TransferPayment>("Transfer");
    }
}`,
      output: `Carte ****1881
Carte ****4242
Virement depuis FR76 3000 6000 0112
Paiements par carte : 2
Discriminateur : Card, Transfer`,
      steps: [
        "<code>public abstract class Payment</code> : la classe de base. Les filles ajoutent chacune leur propriété (<code>Last4</code>, <code>Iban</code>).",
        "<code>HasDiscriminator&lt;string&gt;(\"PaymentType\").HasValue&lt;CardPayment&gt;(\"Card\")…</code> : la colonne discriminante et la valeur stockée pour chaque type.",
        "<code>db.Payments.OrderBy(p =&gt; p.Amount).ToListAsync()</code> : une requête sur la base renvoie des objets du bon type concret.",
        "<code>p switch { CardPayment c =&gt; …, TransferPayment t =&gt; … }</code> : le pattern matching de C# reconnaît le type réel de chaque objet.",
        "<code>OfType&lt;CardPayment&gt;()</code> : traduit en <code>WHERE PaymentType = N'Card'</code>.",
        "<code>Discriminateur : Card, Transfer</code> : les valeurs réellement stockées dans la colonne."
      ],
      explain: "TPH : une table, aucune jointure. Les colonnes Last4 et Iban sont nullables, car chaque ligne n'en utilise qu'une."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une adresse de livraison sur la commande",
      prompt: `<p>Dans un contexte de démo, ajoute une adresse de livraison possédée par <code>Order</code>, avec des colonnes nommées <code>ShipStreet</code>, <code>ShipCity</code> et <code>ShipZipCode</code>. Enregistre une commande pour Nantes, puis compte les commandes livrées à Nantes.</p>`,
      hint: `<p><code>OwnsOne</code> accepte une seconde lambda pour configurer les propriétés possédées : <code>a.Property(x =&gt; x.City).HasColumnName(\"ShipCity\")</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new ShopDbContext();
await db.Database.EnsureDeletedAsync();
await db.Database.EnsureCreatedAsync();

db.Orders.Add(new Order { ShippingAddress = new Address("3 quai Est", "Nantes", "44000") });
await db.SaveChangesAsync();
db.ChangeTracker.Clear();

var nantes = await db.Orders.CountAsync(o => o.ShippingAddress.City == "Nantes");
Console.WriteLine($"Commandes livrées à Nantes : {nantes}");

public record Address(string Street, string City, string ZipCode);

public class Order
{
    public int Id { get; set; }
    public Address ShippingAddress { get; set; } = null!;
}

public class ShopDbContext : DbContext
{
    public DbSet<Order> Orders => Set<Order>();
    protected override void OnConfiguring(DbContextOptionsBuilder o) =>
        o.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder b) =>
        b.Entity<Order>().OwnsOne(o => o.ShippingAddress, a =>
        {
            a.Property(x => x.Street).HasColumnName("ShipStreet").HasMaxLength(200);
            a.Property(x => x.City).HasColumnName("ShipCity").HasMaxLength(100);
            a.Property(x => x.ZipCode).HasColumnName("ShipZipCode").HasMaxLength(10);
        });
}`
    },
    {
      level: "moyen",
      title: "Un type Email normalisé",
      prompt: `<p>Crée un record <code>Email</code> dont le constructeur met la valeur en minuscules et retire les espaces. Mappe <code>Customer.Email</code> avec un value converter, enregistre <code>\"  Lea@Exemple.FR \"</code> et affiche ce qui est réellement stocké.</p>`,
      hint: `<p>La normalisation se fait dans le constructeur du record : le converter <code>v =&gt; new Email(v)</code> et le code C# passent tous les deux par lui.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new ShopDbContext();
await db.Database.EnsureDeletedAsync();
await db.Database.EnsureCreatedAsync();

db.Customers.Add(new Customer { Email = new Email("  Lea@Exemple.FR ") });
await db.SaveChangesAsync();

var stored = await db.Database.SqlQueryRaw<string>("SELECT Email AS Value FROM Customers").SingleAsync();
Console.WriteLine(stored); // lea@exemple.fr

public record Email
{
    public string Value { get; }
    public Email(string value) => Value = value.Trim().ToLowerInvariant();
}

public class Customer
{
    public int Id { get; set; }
    public Email Email { get; set; } = null!;
}

public class ShopDbContext : DbContext
{
    public DbSet<Customer> Customers => Set<Customer>();
    protected override void OnConfiguring(DbContextOptionsBuilder o) =>
        o.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder b) =>
        b.Entity<Customer>().Property(c => c.Email)
            .HasConversion(e => e.Value, v => new Email(v))
            .HasMaxLength(200);
}`
    },
    {
      level: "difficile",
      title: "Passer les paiements en TPT",
      prompt: `<p>Reprends la hiérarchie <code>Payment</code> / <code>CardPayment</code> / <code>TransferPayment</code> et mappe-la en TPT, avec les tables <code>CardPayments</code> et <code>TransferPayments</code>. Affiche la liste des tables créées.</p>`,
      hint: `<p><code>b.Entity&lt;Payment&gt;().UseTptMappingStrategy();</code> puis <code>ToTable</code> sur chaque fille. Les tables se lisent dans <code>INFORMATION_SCHEMA.TABLES</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new ShopDbContext();
await db.Database.EnsureDeletedAsync();
await db.Database.EnsureCreatedAsync();

var tables = await db.Database.SqlQueryRaw<string>(
    "SELECT TABLE_NAME AS Value FROM INFORMATION_SCHEMA.TABLES").ToListAsync();
Console.WriteLine(string.Join(", ", tables.Order())); // CardPayments, Payments, TransferPayments

public abstract class Payment { public int Id { get; set; } public decimal Amount { get; set; } }
public class CardPayment : Payment { public string Last4 { get; set; } = ""; }
public class TransferPayment : Payment { public string Iban { get; set; } = ""; }

public class ShopDbContext : DbContext
{
    public DbSet<Payment> Payments => Set<Payment>();
    protected override void OnConfiguring(DbContextOptionsBuilder o) =>
        o.UseSqlServer("Server=localhost;Database=OrderFlowDemo;Trusted_Connection=True;TrustServerCertificate=True");
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Payment>().UseTptMappingStrategy(); // une table par type
        b.Entity<Payment>().Property(p => p.Amount).HasPrecision(10, 2);
        b.Entity<CardPayment>().ToTable("CardPayments");
        b.Entity<TransferPayment>().ToTable("TransferPayments");
    }
}`
    }
  ],
  quiz: [
    {
      q: `Avec <code>OwnsOne(c =&gt; c.ShippingAddress)</code>, où sont rangées les données de l'adresse ?`,
      options: ["Dans une table <code>Addresses</code> avec une clé étrangère", "Dans des colonnes de la table <code>Customers</code>", "Dans une colonne JSON"],
      answer: 1,
      why: `Par défaut, un owned type est « aplati » dans la table de son propriétaire, avec des colonnes préfixées. Une colonne JSON demande <code>ToJson()</code> explicitement.`
    },
    {
      q: `Que fait <code>HasConversion(r =&gt; r.Value, v =&gt; new OrderRef(v))</code> ?`,
      options: ["Il crée une table <code>OrderRefs</code>", "Il valide le format de la référence", "Il traduit <code>OrderRef</code> en chaîne pour SQL, et inversement à la lecture"],
      answer: 2,
      why: `Un value converter est un couple de fonctions : vers le type SQL, et depuis le type SQL. Il ne valide rien tout seul et ne crée aucune table.`
    },
    {
      q: `Quelle stratégie d'héritage EF Core utilise-t-il par défaut ?`,
      options: ["TPH : une table avec une colonne discriminante", "TPT : une table par type", "TPC : une table par type concret"],
      answer: 0,
      why: `TPH est le choix par défaut, et souvent le plus rapide : aucune jointure. TPT et TPC s'activent avec <code>UseTptMappingStrategy()</code> ou <code>UseTpcMappingStrategy()</code>.`
    }
  ],
  project: `<p>Dans OrderFlow, crée le record <code>Address(string Street, string City, string ZipCode)</code> et ajoute <code>Order.ShippingAddress</code>, mappée avec <code>OwnsOne</code> (ou <code>ComplexProperty</code>) et des colonnes <code>ShipStreet</code>, <code>ShipCity</code>, <code>ShipZipCode</code>. Génère la migration <code>AddShippingAddress</code>, lis le fichier généré pour vérifier les noms de colonnes, puis applique-la. Vérifie au passage que <code>Status</code> est bien stocké en texte.</p>`,
  resources: [
    { label: "Types d'entités détenus (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/modeling/owned-entities" },
    { label: "Conversions de valeurs (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/modeling/value-conversions" }
  ]
});

// =====================================================================
// 6. Performance
// =====================================================================
window.COURSE.push({
  key: "ef-performance",
  title: "Performance : N+1, AsNoTracking, split queries",
  summary: "Tu sauras compter les requêtes envoyées par EF, repérer le problème N+1 et choisir entre projection, AsNoTracking et split query.",
  objectives: [
    "Mesurer avant d'optimiser en comptant les requêtes SQL",
    "Reconnaître et corriger le problème N+1",
    "Lire moins de données avec Select et AsNoTracking",
    "Éviter l'explosion cartésienne avec AsSplitQuery"
  ],
  analogy: `<p>Tu dois acheter 20 articles au supermarché. Tu peux faire 20 allers-retours entre la maison et le magasin, un par article : c'est le <strong>N+1</strong>. Ou tu fais une liste et un seul trajet.</p>
<p>Et si tu ne veux que le prix d'un produit, inutile de rapporter le produit entier : tu notes le prix. C'est la <strong>projection</strong>. Avec une base de données, chaque aller-retour coûte du temps réseau : moins de trajets, des sacs plus légers.</p>`,
  lesson: `<h3>Règle n° 1 : mesurer</h3>
<p>Ne devine jamais ce qu'EF envoie : regarde. Deux outils simples : <code>query.ToQueryString()</code> affiche le SQL d'une requête sans l'exécuter, et <code>LogTo</code> dans la configuration du contexte affiche ou compte chaque commande. Avec <code>.LogTo(_ =&gt; queries++, [RelationalEventId.CommandExecuted])</code>, tu obtiens un compteur de requêtes : c'est le meilleur détecteur de problèmes.</p>
<div class="flow"><span>Compter les requêtes</span><span>Lire le SQL</span><span>Corriger</span><span>Recompter</span></div>

<h3>Le problème N+1</h3>
<p>Tu charges une liste de N commandes (1 requête), puis, dans une boucle, tu lis les lignes de chaque commande (N requêtes). Total : N+1. Avec 5 commandes, ça passe inaperçu ; avec 500 commandes et 20 ms de réseau, la page met 10 secondes. Le piège : le code a l'air parfaitement normal, et en développement avec trois lignes de test, tout est rapide.</p>
<pre class="diagram">
 N+1                         Projection / Include
 ---------------------       ---------------------
 SELECT Orders     (1)       SELECT o.Id,
 SELECT Lines #1   (2)         COUNT(lines) ...
 SELECT Lines #2   (3)       FROM Orders o
 ...                         (1 seule requête)
 SELECT Lines #N   (N+1)
</pre>
<p>Les corrections : <code>Include(o =&gt; o.Lines)</code> pour charger les lignes avec les commandes, ou mieux, une <strong>projection</strong> <code>Select</code> qui ne ramène que ce que l'écran affiche. Règle simple : <strong>pas de requête dans une boucle</strong>.</p>
<div class="tip">Si tu as activé le <em>lazy loading</em> (chargement paresseux), chaque accès à <code>order.Lines</code> déclenche une requête en silence : le N+1 devient invisible dans le code. C'est pour ça qu'il est désactivé par défaut et qu'on le déconseille dans une API.</div>

<h3>Lire moins : projection et AsNoTracking</h3>
<p>Une projection <code>Select(o =&gt; new { o.Id, LineCount = o.Lines.Count })</code> a trois avantages : SQL Server ne renvoie que les colonnes utiles, les calculs (compte, somme) sont faits par la base, et le résultat n'est jamais suivi par le tracker. Pour une liste à afficher, c'est presque toujours le meilleur choix.</p>
<p>Quand tu as besoin d'entités complètes mais en lecture seule, ajoute <code>AsNoTracking()</code> : pas de snapshot, pas de résolution d'identité, moins de mémoire. Tu peux même en faire le défaut d'un contexte avec <code>UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)</code>.</p>
<table>
<tr><th>Besoin</th><th>Outil</th></tr>
<tr><td>Afficher une liste, un résumé</td><td><code>Select</code> vers un DTO</td></tr>
<tr><td>Lire des entités complètes sans les modifier</td><td><code>AsNoTracking()</code></td></tr>
<tr><td>Modifier puis enregistrer</td><td>Requête suivie (par défaut)</td></tr>
<tr><td>Charger une entité et ses collections</td><td><code>Include</code>, éventuellement <code>AsSplitQuery()</code></td></tr>
</table>

<h3>Include et l'explosion cartésienne</h3>
<p>Quand tu fais <code>Include(c =&gt; c.Orders).ThenInclude(o =&gt; o.Lines)</code>, EF écrit une seule requête avec des <code>LEFT JOIN</code>. Le résultat SQL contient une ligne par ligne de commande, et les colonnes du client sont <strong>répétées</strong> sur chacune. Avec deux collections au même niveau (par exemple <code>Orders</code> et <code>Addresses</code>), les lignes se multiplient entre elles : 100 commandes × 10 adresses = 1 000 lignes pour un seul client. C'est l'<em>explosion cartésienne</em>.</p>
<p><code>AsSplitQuery()</code> demande à EF d'envoyer une requête par collection, puis de recoller les morceaux en mémoire. Plus d'allers-retours, mais beaucoup moins de données dupliquées.</p>
<div class="compare"><div><h4>Requête unique (défaut)</h4><p>1 aller-retour. Idéale pour peu de lignes ou une seule collection. Données du parent répétées.</p></div><div><h4>AsSplitQuery</h4><p>1 requête par niveau. Idéale pour plusieurs collections volumineuses. Attention : les requêtes ne sont pas lues au même instant exact.</p></div></div>
<div class="note">Les autres leviers, à sortir après mesure : un index sur les colonnes de tes <code>Where</code> et <code>OrderBy</code> (<code>HasIndex</code> dans le modèle), la pagination par clé (<code>Where(p =&gt; p.Id &gt; lastId).Take(20)</code>) plutôt que <code>Skip</code> sur de grosses tables, le <em>pooling</em> de contextes (<code>AddDbContextPool</code>) et les requêtes compilées (<code>EF.CompileAsyncQuery</code>) pour les chemins très sollicités.</div>`,
  examples: [
    {
      title: "Le N+1 compté puis corrigé par une projection",
      code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

int queries = 0;
var options = new DbContextOptionsBuilder<OrderFlowDbContext>()
    .UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True")
    .LogTo(_ => queries++, [RelationalEventId.CommandExecuted]) // +1 par commande SQL
    .Options;
using var db = new OrderFlowDbContext(options);

// Données de démo : un client, 5 commandes d'une ligne
var pen = new Product { Name = "Stylo", Price = 1m, Stock = 100 };
var tom = new Customer { Name = "Tom", Email = "tom@exemple.fr", CreatedAt = DateTime.UtcNow };
for (int i = 0; i < 5; i++)
    tom.Orders.Add(new Order { OrderDate = DateTime.UtcNow, Lines = [new() { Product = pen, Quantity = 1, UnitPrice = 1m }] });
db.Customers.Add(tom);
await db.SaveChangesAsync();
db.ChangeTracker.Clear();

// N+1 : 1 requête pour la liste, puis 1 requête par commande
queries = 0;
var orders = await db.Orders.Where(o => o.CustomerId == tom.Id).ToListAsync();
foreach (var order in orders)
    order.Lines = await db.OrderLines.Where(l => l.OrderId == order.Id).ToListAsync();
Console.WriteLine($"Boucle N+1 : {queries} requêtes");

// Projection : SQL Server calcule tout en une fois
queries = 0;
var summaries = await db.Orders
    .Where(o => o.CustomerId == tom.Id)
    .Select(o => new { o.Id, LineCount = o.Lines.Count, Total = o.Lines.Sum(l => l.Quantity * l.UnitPrice) })
    .ToListAsync();
Console.WriteLine($"Projection : {queries} requête pour {summaries.Count} commandes");

// Ménage : la cascade SQL supprime les commandes et leurs lignes
await db.Customers.Where(c => c.Id == tom.Id).ExecuteDeleteAsync();
await db.Products.Where(p => p.Id == pen.Id).ExecuteDeleteAsync();`,
      output: `Boucle N+1 : 6 requêtes
Projection : 1 requête pour 5 commandes`,
      steps: [
        "<code>.LogTo(_ =&gt; queries++, [RelationalEventId.CommandExecuted])</code> : à chaque commande SQL exécutée, EF appelle la lambda. Ici, elle incrémente un compteur.",
        "<code>for (int i = 0; i &lt; 5; i++) tom.Orders.Add(…)</code> : 5 commandes d'une ligne pour le même client, enregistrées en un seul <code>SaveChanges</code>.",
        "<code>foreach (var order in orders) order.Lines = await db.OrderLines.Where(…).ToListAsync();</code> : une requête par commande, dans la boucle. C'est le N+1 : 1 + 5 = 6.",
        "<code>.Select(o =&gt; new { o.Id, LineCount = o.Lines.Count, Total = … })</code> : le comptage et la somme sont traduits en SQL, dans la même requête.",
        "<code>Projection : 1 requête pour 5 commandes</code> : le nombre de requêtes ne dépend plus du nombre de commandes.",
        "<code>ExecuteDeleteAsync()</code> : le ménage, en profitant du <code>ON DELETE CASCADE</code> pour les commandes et les lignes."
      ],
      explain: "Avec 500 commandes, la boucle ferait 501 requêtes, la projection toujours 1."
    },
    {
      title: "AsNoTracking : lire sans être suivi",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
db.Products.AddRange(
    new Product { Name = "Lot-A", Price = 3m, Stock = 1 },
    new Product { Name = "Lot-B", Price = 4m, Stock = 2 },
    new Product { Name = "Lot-C", Price = 5m, Stock = 3 });
await db.SaveChangesAsync();
db.ChangeTracker.Clear();

// Lecture suivie : EF garde une copie de chaque produit
var tracked = await db.Products.Where(p => p.Name.StartsWith("Lot-")).ToListAsync();
Console.WriteLine($"Suivie     : {db.ChangeTracker.Entries().Count()} entités en mémoire");
db.ChangeTracker.Clear();

// Lecture seule : EF ne garde rien
var readOnly = await db.Products.AsNoTracking().Where(p => p.Name.StartsWith("Lot-")).ToListAsync();
Console.WriteLine($"NoTracking : {db.ChangeTracker.Entries().Count()} entité en mémoire");

// Conséquence : modifier un objet non suivi ne sauvegarde rien
readOnly[0].Stock = 99;
Console.WriteLine($"SaveChanges : {await db.SaveChangesAsync()} ligne modifiée");

await db.Products.Where(p => p.Name.StartsWith("Lot-")).ExecuteDeleteAsync(); // ménage`,
      output: `Suivie     : 3 entités en mémoire
NoTracking : 0 entité en mémoire
SaveChanges : 0 ligne modifiée`,
      steps: [
        "<code>db.Products.Where(…).ToListAsync()</code> : requête suivie. Le tracker garde un snapshot de chacun des 3 produits.",
        "<code>db.ChangeTracker.Clear();</code> : on repart d'un tracker vide pour comparer honnêtement.",
        "<code>.AsNoTracking()</code> : les 3 produits sont créés, mais le tracker ne garde rien.",
        "<code>readOnly[0].Stock = 99;</code> : on modifie un objet que le contexte ne connaît pas.",
        "<code>SaveChanges : 0 ligne modifiée</code> : rien n'est enregistré. AsNoTracking, c'est pour lire, pas pour modifier."
      ]
    },
    {
      title: "Requête unique ou split query",
      code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

int queries = 0;
var options = new DbContextOptionsBuilder<OrderFlowDbContext>()
    .UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True")
    .LogTo(_ => queries++, [RelationalEventId.CommandExecuted])
    .Options;
using var db = new OrderFlowDbContext(options);

// Un client, 3 commandes de 4 lignes = 12 lignes
var ink = new Product { Name = "Encre", Price = 8m, Stock = 100 };
var zoe = new Customer { Name = "Zoé", Email = "zoe@exemple.fr", CreatedAt = DateTime.UtcNow };
for (int i = 0; i < 3; i++)
    zoe.Orders.Add(new Order { OrderDate = DateTime.UtcNow,
        Lines = [.. Enumerable.Range(1, 4).Select(q => new OrderLine { Product = ink, Quantity = q, UnitPrice = 8m })] });
db.Customers.Add(zoe);
await db.SaveChangesAsync();
db.ChangeTracker.Clear();

var single = db.Customers.AsNoTracking().Where(c => c.Id == zoe.Id)
    .Include(c => c.Orders).ThenInclude(o => o.Lines);
queries = 0;
var a = await single.SingleAsync();
Console.WriteLine($"Requête unique : {queries} requête, {a.Orders.Sum(o => o.Lines.Count)} lignes");

queries = 0;
var b = await single.AsSplitQuery().SingleAsync();
Console.WriteLine($"Split query    : {queries} requêtes, {b.Orders.Sum(o => o.Lines.Count)} lignes");

await db.Customers.Where(c => c.Id == zoe.Id).ExecuteDeleteAsync(); // ménage
await db.Products.Where(p => p.Id == ink.Id).ExecuteDeleteAsync();`,
      output: `Requête unique : 1 requête, 12 lignes
Split query    : 3 requêtes, 12 lignes`,
      steps: [
        "<code>Lines = [.. Enumerable.Range(1, 4).Select(…)]</code> : chaque commande reçoit 4 lignes. Le <code>..</code> étale la séquence dans l'expression de collection.",
        "<code>.Include(c =&gt; c.Orders).ThenInclude(o =&gt; o.Lines)</code> : on charge le client, ses commandes et leurs lignes.",
        "<code>await single.SingleAsync()</code> : une seule requête avec deux <code>LEFT JOIN</code>. Elle renvoie 12 lignes SQL, et le nom du client y est répété 12 fois.",
        "<code>single.AsSplitQuery()</code> : trois requêtes (clients, commandes, lignes), sans duplication.",
        "<code>12 lignes</code> dans les deux cas : le résultat en C# est identique, seule la façon de l'obtenir change."
      ],
      explain: "Mesure les deux sur tes vraies données : la requête unique gagne souvent pour peu de lignes, la split query pour de grosses collections."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une liste de produits légère",
      prompt: `<p>Affiche le nom et le stock des produits en stock, triés par nom, en ne lisant que ces deux colonnes. Affiche ensuite le nombre d'entités suivies par le contexte.</p>`,
      hint: `<p>Une projection <code>Select(p =&gt; new { p.Name, p.Stock })</code> n'est jamais suivie : le compteur doit valoir 0.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();

// Avant : entités complètes suivies, alors qu'on ne fait qu'afficher
// var products = await db.Products.Where(p => p.Stock > 0).ToListAsync();

// Après : seulement les colonnes utiles, rien n'est suivi
var items = await db.Products
    .Where(p => p.Stock > 0)
    .OrderBy(p => p.Name)
    .Select(p => new { p.Name, p.Stock }) // type anonyme : jamais suivi
    .ToListAsync();

foreach (var p in items)
    Console.WriteLine($"{p.Name} : {p.Stock}");
Console.WriteLine($"Entités suivies : {db.ChangeTracker.Entries().Count()}"); // 0`
    },
    {
      level: "moyen",
      title: "Chasser un N+1 sur le client",
      prompt: `<p>Écris une boucle qui affiche les 10 premières commandes avec le nom de leur client, en lisant le client dans la boucle. Compte les requêtes avec <code>LogTo</code>. Corrige ensuite avec <code>Include</code> et recompte.</p>`,
      hint: `<p>Avant : 1 requête pour les commandes, plus 1 par commande. Après : une seule requête avec jointure.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

int queries = 0;
var options = new DbContextOptionsBuilder<OrderFlowDbContext>()
    .UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True")
    .LogTo(_ => queries++, [RelationalEventId.CommandExecuted])
    .Options;
using var db = new OrderFlowDbContext(options);

// Avant : 1 requête + 1 par commande pour lire le client
var orders = await db.Orders.AsNoTracking().OrderBy(o => o.Id).Take(10).ToListAsync();
foreach (var o in orders)
{
    var customer = await db.Customers.AsNoTracking().SingleAsync(c => c.Id == o.CustomerId);
    Console.WriteLine($"Commande {o.Id} : {customer.Name}");
}
Console.WriteLine($"Avant : {queries} requêtes");

// Après : une seule requête avec jointure
queries = 0;
var withCustomer = await db.Orders.AsNoTracking().Include(o => o.Customer)
    .OrderBy(o => o.Id).Take(10).ToListAsync();
foreach (var o in withCustomer)
    Console.WriteLine($"Commande {o.Id} : {o.Customer.Name}");
Console.WriteLine($"Après : {queries} requête");`
    },
    {
      level: "difficile",
      title: "Statistiques clients en une requête",
      prompt: `<p>Affiche, pour chaque client, son nombre de commandes et le nombre total d'articles commandés, trié du plus gros acheteur au plus petit. Tout doit être calculé par SQL Server, en une seule requête.</p>`,
      hint: `<p><code>c.Orders.Count</code> et <code>c.Orders.SelectMany(o =&gt; o.Lines).Sum(l =&gt; l.Quantity)</code> se traduisent en sous-requêtes. Vérifie avec <code>ToQueryString()</code>.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();

var stats = await db.Customers
    .Select(c => new
    {
        c.Name,
        OrderCount = c.Orders.Count,
        Units = c.Orders.SelectMany(o => o.Lines).Sum(l => l.Quantity)
    })
    .OrderByDescending(x => x.Units)
    .ToListAsync(); // une seule requête SQL, avec des sous-requêtes

foreach (var s in stats)
    Console.WriteLine($"{s.Name} : {s.OrderCount} commandes, {s.Units} articles");`
    }
  ],
  quiz: [
    {
      q: `Une page charge 200 commandes, puis lit les lignes de chacune dans une boucle. Combien de requêtes ?`,
      options: ["1", "200", "201"],
      answer: 2,
      why: `1 requête pour la liste, plus 1 par commande : c'est le N+1. Une projection ou un <code>Include</code> ramène ça à 1 (ou quelques-unes avec une split query).`
    },
    {
      q: `Quel est l'intérêt principal d'une projection <code>Select</code> vers un DTO ?`,
      options: ["Ne lire que les colonnes utiles, sans suivi", "Activer le lazy loading", "Permettre de modifier puis d'enregistrer le DTO"],
      answer: 0,
      why: `La projection réduit les données transférées et laisse SQL Server faire les calculs. Un DTO n'est pas une entité : il n'est pas suivi et ne peut pas être enregistré par <code>SaveChanges</code>.`
    },
    {
      q: `Quand <code>AsSplitQuery()</code> est-il utile ?`,
      options: ["Pour une requête sans <code>Include</code>", "Quand plusieurs collections incluses font exploser le nombre de lignes", "Pour réduire le nombre d'allers-retours"],
      answer: 1,
      why: `La split query évite l'explosion cartésienne en envoyant une requête par collection. Elle fait donc <em>plus</em> d'allers-retours, en échange de beaucoup moins de données dupliquées.`
    },
    {
      q: `Quelle est la première chose à faire face à un endpoint lent ?`,
      options: ["Ajouter <code>AsNoTracking()</code> partout", "Passer à Dapper", "Mesurer : compter les requêtes et lire le SQL"],
      answer: 2,
      why: `Sans mesure, tu risques d'optimiser le mauvais endroit. Le compteur de requêtes et le SQL révèlent tout de suite un N+1, une colonne inutile ou un index manquant.`
    }
  ],
  project: `<p>Dans OrderFlow, ajoute un compteur de requêtes avec <code>LogTo</code> dans ta configuration de développement. Écris <code>OrderService.GetOrderSummariesAsync(int customerId)</code> qui renvoie une liste de <code>OrderSummaryDto(int Id, DateTime OrderDate, string Status, int LineCount, decimal Total)</code> en une seule requête projetée. Passe aussi toutes tes méthodes de lecture de produits en <code>AsNoTracking()</code> ou en projection.</p>`,
  resources: [
    { label: "Performances d'EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/performance/" },
    { label: "Requêtes uniques et fractionnées (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/querying/single-split-queries" }
  ]
});

// =====================================================================
// 7. Tester du code qui utilise EF Core
// =====================================================================
window.COURSE.push({
  key: "ef-testing",
  title: "Tester du code qui utilise EF Core",
  summary: "Tu sauras écrire des tests xUnit qui vérifient ton code EF Core contre un vrai SQL Server, et pourquoi le fournisseur InMemory peut te mentir.",
  objectives: [
    "Choisir une stratégie de test : InMemory, SQLite ou vrai SQL Server",
    "Préparer une base de test avec une fixture xUnit",
    "Isoler les tests entre eux",
    "Repérer les différences de comportement du fournisseur InMemory"
  ],
  analogy: `<p>Un pilote d'essai ne teste pas un nouvel avion dans un jeu vidéo. Le simulateur est pratique pour s'entraîner, mais il ne reproduit pas tout : la vraie turbulence, le vrai poids. Pour valider l'avion, il faut le vrai ciel.</p>
<p>Le fournisseur <strong>InMemory</strong>, c'est le simulateur : rapide, mais il ignore les index uniques, les transactions, le SQL. Un <strong>vrai SQL Server de test</strong>, c'est le vrai ciel : un peu plus lent à préparer, mais ce qui passe là passera en production.</p>`,
  lesson: `<h3>Pourquoi tester l'accès aux données</h3>
<p>Ton code EF Core contient des règles importantes : un filtre <code>Where</code>, un décrément de stock, une contrainte d'unicité, une transaction. Beaucoup de ces règles vivent <em>dans la base</em> : l'index unique sur <code>Email</code>, la cascade, la <code>RowVersion</code>, la traduction de ton LINQ en SQL. Un test qui ne parle pas à SQL Server ne peut pas les vérifier.</p>
<p>Comme en Angular, où tu remplaces <code>HttpClient</code> par <code>HttpTestingController</code> pour tester un composant, tu peux remplacer le <code>DbContext</code> par un faux pour tester la logique pure. Mais pour le code qui <em>est</em> de l'accès aux données, il faut une vraie base.</p>

<h3>Trois stratégies, de la plus fragile à la plus fiable</h3>
<table>
<tr><th>Stratégie</th><th>Vitesse</th><th>Fidélité</th><th>Limites</th></tr>
<tr><td>Fournisseur InMemory</td><td>Très rapide</td><td>Faible</td><td>Ni SQL, ni contraintes, ni transactions, ni <code>ExecuteUpdate</code></td></tr>
<tr><td>SQLite en mémoire</td><td>Rapide</td><td>Moyenne</td><td>Autre moteur : pas de <code>rowversion</code>, SQL différent de SQL Server</td></tr>
<tr><td>Vrai SQL Server (LocalDB, Docker)</td><td>Correcte</td><td>Totale</td><td>Il faut préparer et nettoyer la base</td></tr>
</table>
<p>Microsoft le dit lui-même dans sa documentation : le fournisseur InMemory est déconseillé pour tester. Avec LocalDB sur ta machine et SQL Server dans Docker en intégration continue, tester contre le vrai moteur est simple et rapide.</p>
<div class="tip">Ne crée pas de mock de <code>DbSet</code> avec NSubstitute pour simuler des requêtes LINQ : c'est long à écrire, et tu testes alors ton mock, pas la traduction SQL. Garde NSubstitute pour les dépendances <em>autour</em> de ta base (un service d'email, une horloge).</div>

<h3>La fixture : préparer la base une fois</h3>
<p>Dans xUnit, une <strong>fixture</strong> est un objet créé une seule fois et partagé entre les tests. C'est l'endroit idéal pour créer la base de test. Une classe de tests la demande en implémentant <code>IClassFixture&lt;DatabaseFixture&gt;</code> : xUnit la crée et la passe au constructeur.</p>
<div class="flow"><span>Fixture : EnsureDeleted + EnsureCreated</span><span>Test 1 : contexte neuf</span><span>Test 2 : contexte neuf</span><span>Assert sur la base</span></div>
<p>Utilise une base dédiée, par exemple <code>OrderFlow_Tests</code>, jamais ta base de développement. <code>EnsureCreated()</code> crée le schéma depuis le modèle ; si tu veux aussi vérifier tes migrations, appelle <code>Migrate()</code> à la place. Chaque test crée son propre contexte avec <code>fixture.CreateContext()</code>, pour ne pas partager de tracker.</p>
<p>Quand plusieurs classes de tests utilisent la même base, xUnit les lance en parallèle : partage alors une seule fixture avec une <strong>collection</strong> (<code>[CollectionDefinition]</code> et <code>ICollectionFixture&lt;DatabaseFixture&gt;</code>), sinon deux fixtures recréent la base en même temps.</p>

<h3>Isoler les tests</h3>
<p>Un bon test ne dépend pas de l'ordre d'exécution. Deux techniques simples :</p>
<pre class="diagram">
 A. Données uniques            B. Transaction annulée
 ------------------            ----------------------
 chaque test crée ses          InitializeAsync :
 propres lignes et ne            BeginTransaction
 lit que celles-ci             test : Add, Save, Assert
 (filtre par Id ou nom)        DisposeAsync :
                                 Rollback -&gt; base propre
</pre>
<p>La technique B est élégante : le test écrit vraiment en base, puis tout est annulé. Elle marche tant que le code testé utilise le même contexte (et donc la même transaction). Pour des suites plus grosses, des outils comme Respawn vident les tables entre deux tests.</p>

<h3>Structure d'un test</h3>
<p>Garde le schéma <strong>Arrange / Act / Assert</strong> : préparer les données, appeler la méthode testée, vérifier le résultat. Pour vérifier ce qui est en base, relis la donnée : <code>await db.Entry(product).ReloadAsync()</code> ou une requête <code>AsNoTracking()</code>. Sinon tu risques de lire l'objet en mémoire, qui n'a peut-être pas été écrit, ou qui n'a pas vu un <code>ExecuteUpdate</code>.</p>
<div class="note">En intégration continue, la bibliothèque Testcontainers démarre un SQL Server jetable dans Docker au début des tests (<code>new MsSqlBuilder().Build()</code>, puis <code>StartAsync()</code>) et le détruit à la fin. Ta fixture n'a qu'à lire sa chaîne de connexion : les tests tournent à l'identique sur ton poste et sur GitHub Actions.</div>`,
  examples: [
    {
      title: "Le service à tester et la fixture de base de test",
      code: `// Fichier : StockService.cs (dans OrderFlow)
using Microsoft.EntityFrameworkCore;

public class StockService(OrderFlowDbContext db)
{
    // Réserve la quantité si le stock suffit, en une seule instruction UPDATE
    public async Task<bool> ReserveAsync(int productId, int quantity) =>
        await db.Products
            .Where(p => p.Id == productId && p.Stock >= quantity)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - quantity)) == 1;
}

// Fichier : DatabaseFixture.cs (dans OrderFlow.Tests)
public class DatabaseFixture
{
    const string Cs = "Server=localhost;Database=OrderFlow_Tests;Trusted_Connection=True;TrustServerCertificate=True";

    public DatabaseFixture()
    {
        using var db = CreateContext();
        db.Database.EnsureDeleted();  // base de test jetable, recréée à chaque lancement
        db.Database.EnsureCreated();  // ou db.Database.Migrate() pour tester tes migrations
    }

    public OrderFlowDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<OrderFlowDbContext>().UseSqlServer(Cs).Options);
}`,
      output: ``,
      steps: [
        "<code>public class StockService(OrderFlowDbContext db)</code> : le contexte arrive par le constructeur (constructeur primaire). Le service ne sait pas s'il parle à la base de dev ou de test.",
        "<code>.Where(p =&gt; p.Id == productId &amp;&amp; p.Stock &gt;= quantity).ExecuteUpdateAsync(…) == 1</code> : le décrément atomique vu avec ExecuteUpdate. Vrai si une ligne a été modifiée.",
        "<code>Database=OrderFlow_Tests</code> : une base réservée aux tests, qu'on peut détruire sans regret.",
        "<code>db.Database.EnsureDeleted(); db.Database.EnsureCreated();</code> : à chaque lancement de la suite, on repart d'un schéma neuf et vide.",
        "<code>public OrderFlowDbContext CreateContext()</code> : chaque test demandera un contexte neuf, configuré avec les options de test."
      ],
      explain: "Ce code ne s'affiche pas : il prépare le terrain pour les tests de l'exemple suivant."
    },
    {
      title: "Deux tests contre un vrai SQL Server",
      code: `// Fichier : StockServiceTests.cs (dans OrderFlow.Tests)
public class StockServiceTests(DatabaseFixture fixture) : IClassFixture<DatabaseFixture>
{
    [Fact]
    public async Task Reserve_decrements_stock_when_enough()
    {
        using var db = fixture.CreateContext();
        var product = new Product { Name = "Tasse", Price = 7m, Stock = 5 };
        db.Products.Add(product);
        await db.SaveChangesAsync();

        bool ok = await new StockService(db).ReserveAsync(product.Id, 3);

        await db.Entry(product).ReloadAsync(); // relit la ligne en base
        Assert.True(ok);
        Assert.Equal(2, product.Stock);
    }

    [Fact]
    public async Task Reserve_refuses_when_not_enough()
    {
        using var db = fixture.CreateContext();
        var product = new Product { Name = "Théière", Price = 25m, Stock = 1 };
        db.Products.Add(product);
        await db.SaveChangesAsync();

        bool ok = await new StockService(db).ReserveAsync(product.Id, 2);

        await db.Entry(product).ReloadAsync();
        Assert.False(ok);
        Assert.Equal(1, product.Stock);
    }
}`,
      output: `Réussi!  - échec :     0, réussite :     2, ignorée(s) :     0, total :     2, durée : 4 s - OrderFlow.Tests.dll (net10.0)`,
      steps: [
        "<code>public class StockServiceTests(DatabaseFixture fixture) : IClassFixture&lt;DatabaseFixture&gt;</code> : xUnit crée la fixture une fois et la passe à chaque instance de la classe.",
        "<code>using var db = fixture.CreateContext();</code> : Arrange. Chaque test crée son propre produit, donc les tests ne se gênent pas.",
        "<code>bool ok = await new StockService(db).ReserveAsync(product.Id, 3);</code> : Act. On appelle le vrai code, qui envoie un vrai <code>UPDATE</code>.",
        "<code>await db.Entry(product).ReloadAsync();</code> : indispensable. <code>ExecuteUpdate</code> ne met pas à jour l'objet suivi, on relit donc la ligne en base.",
        "<code>Assert.True(ok); Assert.Equal(2, product.Stock);</code> : Assert. On vérifie la valeur renvoyée et l'effet en base.",
        "<code>Reserve_refuses_when_not_enough</code> : le cas d'échec est aussi important que le cas nominal. Le stock doit rester à 1."
      ],
      explain: "Lance-les avec dotnet test : la durée affichée dépend de ta machine, le premier lancement crée la base."
    },
    {
      title: "Le piège du fournisseur InMemory",
      code: `// dotnet add package Microsoft.EntityFrameworkCore.InMemory
using Microsoft.EntityFrameworkCore;

var inMemory = new DbContextOptionsBuilder<OrderFlowDbContext>()
    .UseInMemoryDatabase("Tests").Options;
var sqlServer = new DbContextOptionsBuilder<OrderFlowDbContext>()
    .UseSqlServer("Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True").Options;

await Compare("Email en double ", async db =>
{
    db.Customers.Add(new Customer { Name = "Ana", Email = "ana@exemple.fr" });
    db.Customers.Add(new Customer { Name = "Ana bis", Email = "ana@exemple.fr" });
    await db.SaveChangesAsync();
});
await Compare("ExecuteDelete   ", db => db.Products.Where(p => p.Name == "Inconnu").ExecuteDeleteAsync());
await Compare("Transaction     ", db => db.Database.BeginTransactionAsync());

// Lance la même action sur les deux fournisseurs et compare
async Task Compare(string label, Func<OrderFlowDbContext, Task> action) =>
    Console.WriteLine($"{label}: InMemory = {await Outcome(inMemory, action)}, SQL Server = {await Outcome(sqlServer, action)}");

async Task<string> Outcome(DbContextOptions<OrderFlowDbContext> options, Func<OrderFlowDbContext, Task> action)
{
    using var db = new OrderFlowDbContext(options);
    try
    {
        await action(db);
        return "OK";
    }
    catch (Exception ex)
    {
        return ex.GetType().Name;
    }
}`,
      output: `Email en double : InMemory = OK, SQL Server = DbUpdateException
ExecuteDelete   : InMemory = InvalidOperationException, SQL Server = OK
Transaction     : InMemory = InvalidOperationException, SQL Server = OK`,
      steps: [
        "<code>UseInMemoryDatabase(\"Tests\")</code> : une « base » qui n'est qu'une collection d'objets en mémoire. Aucun SQL n'est produit.",
        "<code>Func&lt;OrderFlowDbContext, Task&gt; action</code> : chaque scénario est une fonction qu'on exécute sur les deux fournisseurs.",
        "<code>Email en double</code> : InMemory ignore l'index unique et accepte les deux clients. Un test « l'email doit être unique » passerait à tort.",
        "<code>ExecuteDelete</code> : InMemory ne sait pas exécuter une instruction en masse. Ton vrai code planterait en test.",
        "<code>Transaction</code> : par défaut, InMemory refuse les transactions et lève une exception.",
        "<code>catch (Exception ex) { return ex.GetType().Name; }</code> : on affiche le type d'erreur pour comparer d'un coup d'œil."
      ],
      explain: "Un test qui passe avec InMemory ne prouve pas que ton code marche avec SQL Server."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un produit qui n'existe pas",
      prompt: `<p>Ajoute dans <code>StockServiceTests</code> un test qui vérifie que <code>ReserveAsync</code> renvoie <code>false</code> pour un <code>productId</code> inexistant.</p>`,
      hint: `<p>Aucune ligne ne correspond au <code>Where</code>, donc <code>ExecuteUpdateAsync</code> renvoie 0. Un Id négatif n'existe jamais avec une colonne identity.</p>`,
      solution: `// Fichier : StockServiceTests.cs (nouvelle méthode dans la classe existante)
[Fact]
public async Task Reserve_returns_false_for_unknown_product()
{
    using var db = fixture.CreateContext();

    bool ok = await new StockService(db).ReserveAsync(productId: -1, quantity: 1);

    Assert.False(ok); // aucune ligne ne correspond : 0 ligne modifiée
}`
    },
    {
      level: "moyen",
      title: "Tester l'unicité de l'email",
      prompt: `<p>Écris un test qui enregistre un client, puis tente d'en enregistrer un second avec le même email, et vérifie qu'une <code>DbUpdateException</code> est levée.</p>`,
      hint: `<p><code>await Assert.ThrowsAsync&lt;DbUpdateException&gt;(() =&gt; db.SaveChangesAsync());</code>. Ce test n'a de sens qu'avec un vrai SQL Server.</p>`,
      solution: `// Fichier : StockServiceTests.cs (nouvelle méthode ; ajoute using Microsoft.EntityFrameworkCore;)
[Fact]
public async Task Customer_email_must_be_unique()
{
    using var db = fixture.CreateContext();
    db.Customers.Add(new Customer { Name = "Eva", Email = "eva@test.fr", CreatedAt = DateTime.UtcNow });
    await db.SaveChangesAsync();

    db.Customers.Add(new Customer { Name = "Eva 2", Email = "eva@test.fr", CreatedAt = DateTime.UtcNow });

    // Avec le fournisseur InMemory, ce test échouerait : il ignore les index uniques
    await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
}`
    },
    {
      level: "difficile",
      title: "Isoler les tests par transaction",
      prompt: `<p>Crée une collection xUnit <code>Database</code> qui partage la fixture, puis une classe <code>IsolatedTests</code> qui ouvre une transaction avant chaque test et l'annule après. Écris deux tests qui prouvent qu'un produit ajouté dans l'un n'est pas visible dans l'autre.</p>`,
      hint: `<p><code>IAsyncLifetime</code> fournit <code>InitializeAsync</code> (avant chaque test) et <code>DisposeAsync</code> (après). xUnit crée une nouvelle instance de la classe pour chaque test.</p>`,
      solution: `// Fichier : DatabaseCollection.cs
// Une seule base pour toutes les classes marquées [Collection("Database")]
// (ajoute aussi [Collection("Database")] sur StockServiceTests et retire son IClassFixture)
[CollectionDefinition("Database")]
public class DatabaseCollection : ICollectionFixture<DatabaseFixture> { }

// Fichier : IsolatedTests.cs
using Microsoft.EntityFrameworkCore;

[Collection("Database")]
public class IsolatedTests(DatabaseFixture fixture) : IAsyncLifetime
{
    private readonly OrderFlowDbContext _db = fixture.CreateContext();

    // Avant chaque test : on ouvre une transaction
    public async Task InitializeAsync() => await _db.Database.BeginTransactionAsync();

    // Après chaque test : on ne valide jamais, la base revient à son état initial
    public async Task DisposeAsync()
    {
        await _db.Database.RollbackTransactionAsync();
        await _db.DisposeAsync();
    }

    [Fact]
    public async Task Added_product_is_visible_inside_the_test()
    {
        _db.Products.Add(new Product { Name = "Isolé", Price = 1m, Stock = 1 });
        await _db.SaveChangesAsync();

        Assert.Equal(1, await _db.Products.CountAsync(p => p.Name == "Isolé"));
    }

    [Fact]
    public async Task Previous_test_left_nothing_behind()
    {
        Assert.Equal(0, await _db.Products.CountAsync(p => p.Name == "Isolé"));
    }
}`
    }
  ],
  quiz: [
    {
      q: `Pourquoi le fournisseur InMemory est-il déconseillé pour tester ton code EF Core ?`,
      options: ["Il est trop lent", "Il ne se comporte pas comme SQL Server : ni contraintes, ni transactions, ni SQL", "Il n'est pas compatible avec xUnit"],
      answer: 1,
      why: `InMemory est rapide, mais il ignore tout ce que fait la vraie base. Un test peut passer alors que le même code échoue en production.`
    },
    {
      q: `À quoi sert <code>IClassFixture&lt;DatabaseFixture&gt;</code> ?`,
      options: ["À créer la fixture une fois et la partager entre les tests de la classe", "À créer une nouvelle base pour chaque test", "À lancer les tests dans l'ordre"],
      answer: 0,
      why: `xUnit crée une nouvelle instance de la classe de tests pour chaque test, mais la fixture n'est créée qu'une fois. C'est donc là qu'on prépare la base, une seule fois.`
    },
    {
      q: `Dans un test, après un <code>ExecuteUpdateAsync</code>, pourquoi appeler <code>ReloadAsync()</code> avant l'assertion ?`,
      options: ["Pour valider la transaction", "Pour libérer la connexion", "Parce que l'objet en mémoire n'a pas vu la modification faite en base"],
      answer: 2,
      why: `<code>ExecuteUpdate</code> ne touche pas au tracker. Sans relecture, tu vérifierais l'ancienne valeur en mémoire et le test échouerait (ou pire, passerait pour une mauvaise raison).`
    }
  ],
  project: `<p>Crée le projet <code>OrderFlow.Tests</code> (<code>dotnet new xunit</code>) avec une référence vers OrderFlow. Ajoute la <code>DatabaseFixture</code> sur la base <code>OrderFlow_Tests</code> partagée par une collection, puis écris au moins quatre tests : réservation de stock réussie et refusée, email unique, et conflit de concurrence sur <code>Product</code> (deux contextes, une <code>DbUpdateConcurrencyException</code> attendue).</p>`,
  resources: [
    { label: "Tester du code qui utilise EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/testing/" },
    { label: "Choisir une stratégie de test (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/testing/choosing-a-testing-strategy" }
  ]
});

// =====================================================================
// 8. EF Core, Dapper ou ADO.NET
// =====================================================================
window.COURSE.push({
  key: "ef-vs-dapper",
  title: "Choisir entre EF Core, Dapper et ADO.NET",
  summary: "Tu sauras quel outil d'accès aux données choisir selon le besoin, et comment les faire cohabiter dans la même application.",
  objectives: [
    "Comparer ADO.NET, Dapper et EF Core sur la même requête",
    "Connaître les forces et les limites de chacun",
    "Utiliser Dapper sur la connexion et la transaction d'EF Core",
    "Écrire un rapport SQL avec SqlQuery sans quitter EF Core"
  ],
  analogy: `<p>Pour te déplacer, tu as trois options. Le <strong>vélo</strong> (ADO.NET) : tu fais tout toi-même, tu contrôles chaque mouvement, mais c'est fatigant sur de longues distances. La <strong>voiture manuelle</strong> (Dapper) : tu conduis toi-même (tu écris le SQL), mais le moteur fait l'effort (le mapping). La <strong>voiture avec GPS et boîte automatique</strong> (EF Core) : tu dis où tu veux aller, elle s'occupe du reste.</p>
<p>Personne ne prend le même véhicule pour tous les trajets. Dans une vraie application, on combine souvent la voiture automatique pour le quotidien et la manuelle pour quelques trajets précis.</p>`,
  lesson: `<h3>Trois niveaux d'abstraction</h3>
<p>Tu connais maintenant les trois outils. Ils ne sont pas concurrents : ils sont empilés. EF Core et Dapper utilisent tous les deux ADO.NET (<code>SqlConnection</code>, <code>SqlCommand</code>) en dessous.</p>
<pre class="diagram">
 +------------------------------------------+
 | EF Core : LINQ, tracker, migrations      |
 +------------------------------------------+
 | Dapper : ton SQL + mapping automatique   |
 +------------------------------------------+
 | ADO.NET : SqlConnection, SqlCommand,     |
 |           SqlDataReader                  |
 +------------------------------------------+
 | SQL Server                               |
 +------------------------------------------+
</pre>

<h3>Les forces de chacun</h3>
<table>
<tr><th></th><th>ADO.NET</th><th>Dapper</th><th>EF Core</th></tr>
<tr><td>Qui écrit le SQL ?</td><td>Toi</td><td>Toi</td><td>EF (depuis LINQ)</td></tr>
<tr><td>Mapping vers tes objets</td><td>À la main, colonne par colonne</td><td>Automatique</td><td>Automatique, avec relations</td></tr>
<tr><td>Suivi des modifications</td><td>Non</td><td>Non</td><td>Oui</td></tr>
<tr><td>Migrations du schéma</td><td>Non</td><td>Non</td><td>Oui</td></tr>
<tr><td>Concurrence, transactions</td><td>À la main</td><td>À la main</td><td>Intégrées</td></tr>
<tr><td>Quantité de code</td><td>Beaucoup</td><td>Peu</td><td>Très peu</td></tr>
</table>
<p>Côté vitesse brute, les écarts sont aujourd'hui faibles : EF Core en <code>AsNoTracking</code> avec une projection est très proche de Dapper. La vraie différence se joue sur le <strong>SQL envoyé</strong> : une mauvaise requête est lente quel que soit l'outil.</p>

<h3>Quand choisir quoi</h3>
<div class="compare"><div><h4>EF Core par défaut</h4><p>CRUD, règles métier, relations, migrations, concurrence. C'est 90 % du code d'une API comme OrderFlow.</p></div><div><h4>Dapper ou SQL brut en renfort</h4><p>Rapports complexes, requêtes déjà écrites par un DBA, fonctions SQL Server avancées (CTE récursives, fenêtrage), points chauds mesurés.</p></div></div>
<p>Dapper a aussi un coût caché : ton SQL est une simple chaîne. Si tu renommes une colonne dans une migration, le compilateur ne dit rien et l'erreur n'apparaît qu'à l'exécution. Avec EF Core, le même renommage casse la compilation de tes requêtes LINQ, ce qui est bien plus sûr. C'est pour ça qu'on garde Dapper pour quelques requêtes ciblées, bien couvertes par des tests.</p>
<p>ADO.NET pur reste utile pour des besoins très bas niveau : <code>SqlBulkCopy</code> pour insérer des centaines de milliers de lignes, la lecture en flux d'un énorme résultat, ou un outil sans aucune dépendance. Tu n'écriras presque jamais un CRUD complet avec.</p>
<div class="tip">Dans tous les cas, ne concatène jamais une valeur dans une chaîne SQL. ADO.NET : <code>Parameters.AddWithValue</code>. Dapper : un objet anonyme <code>new { prefix }</code>. EF Core : <code>SqlQuery($"… {email}")</code>, où l'interpolation est transformée en paramètre (alors que <code>SqlQueryRaw</code> avec une chaîne concaténée est vulnérable).</div>

<h3>Avant de sortir Dapper : SqlQuery</h3>
<p>Depuis EF Core 8, <code>db.Database.SqlQuery&lt;T&gt;($"…")</code> exécute ton SQL et remplit n'importe quel type, même s'il n'est pas une entité du modèle. Pour un rapport ponctuel, ça évite d'ajouter un package. Les colonnes doivent porter le nom des propriétés (ou des paramètres du record).</p>

<h3>Faire cohabiter EF Core et Dapper</h3>
<p>Dapper ajoute des méthodes d'extension (<code>QueryAsync</code>, <code>ExecuteAsync</code>, <code>ExecuteScalarAsync</code>) sur n'importe quelle <code>DbConnection</code>. Or <code>db.Database.GetDbConnection()</code> te donne justement celle du contexte. Si tu as ouvert une transaction avec EF, passe-la à Dapper avec <code>tx.GetDbTransaction()</code> : les deux outils travaillent alors dans la même transaction et un rollback annule tout.</p>
<div class="flow"><span>BeginTransaction (EF)</span><span>SaveChanges (EF)</span><span>ExecuteAsync (Dapper, même tx)</span><span>Commit ou Rollback commun</span></div>
<div class="note">En entretien, la bonne réponse n'est jamais « EF est lent » ou « Dapper est mieux ». Explique que tu pars sur EF Core pour la productivité et la sécurité (tracker, concurrence, migrations), que tu mesures, et que tu descends d'un niveau (projection, <code>SqlQuery</code>, Dapper) seulement là où la mesure le justifie. Et que les écritures restent de préférence dans EF, pour garder une seule source de vérité sur les règles.</div>`,
  examples: [
    {
      title: "La même requête avec les trois outils",
      code: `// dotnet add package Dapper
using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

const string cs = "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True";
const string prefix = "Cmp-";
using var db = new OrderFlowDbContext();
db.Products.AddRange(new Product { Name = "Cmp-Agenda", Price = 12m, Stock = 2 },
                     new Product { Name = "Cmp-Classeur", Price = 3m, Stock = 40 });
await db.SaveChangesAsync();

// 1. ADO.NET : tout à la main
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();
await using var cmd = new SqlCommand("SELECT Name, Stock FROM Products WHERE Name LIKE @p + '%' AND Stock < 5", conn);
cmd.Parameters.AddWithValue("@p", prefix);
await using (var reader = await cmd.ExecuteReaderAsync())
    while (await reader.ReadAsync())
        Console.WriteLine($"ADO.NET : {reader.GetString(0)} ({reader.GetInt32(1)})");

// 2. Dapper : ton SQL, le mapping est automatique
var rows = await conn.QueryAsync<LowStock>(
    "SELECT Name, Stock FROM Products WHERE Name LIKE @prefix + '%' AND Stock < 5", new { prefix });
foreach (var r in rows) Console.WriteLine($"Dapper  : {r.Name} ({r.Stock})");

// 3. EF Core : du LINQ, EF écrit le SQL
var items = await db.Products.Where(p => p.Name.StartsWith(prefix) && p.Stock < 5)
    .Select(p => new LowStock(p.Name, p.Stock)).ToListAsync();
foreach (var i in items) Console.WriteLine($"EF Core : {i.Name} ({i.Stock})");

await db.Products.Where(p => p.Name.StartsWith(prefix)).ExecuteDeleteAsync(); // ménage

record LowStock(string Name, int Stock);`,
      output: `ADO.NET : Cmp-Agenda (2)
Dapper  : Cmp-Agenda (2)
EF Core : Cmp-Agenda (2)`,
      steps: [
        "<code>new SqlCommand(\"SELECT … WHERE Name LIKE @p + '%' AND Stock &lt; 5\", conn)</code> : ADO.NET. Tu écris le SQL et tu déclares chaque paramètre.",
        "<code>reader.GetString(0)</code>, <code>reader.GetInt32(1)</code> : tu lis chaque colonne par sa position et son type. Une erreur d'ordre se voit seulement à l'exécution.",
        "<code>conn.QueryAsync&lt;LowStock&gt;(…, new { prefix })</code> : Dapper. Même SQL, mais les paramètres viennent d'un objet anonyme et le mapping vers le record est automatique.",
        "<code>db.Products.Where(…).Select(p =&gt; new LowStock(p.Name, p.Stock))</code> : EF Core. Pas de SQL à écrire, le compilateur vérifie les noms de propriétés.",
        "<code>record LowStock(string Name, int Stock);</code> : le même type de résultat pour les trois. Dapper remplit le record via son constructeur.",
        "<code>ExecuteDeleteAsync()</code> : le ménage des deux produits de démo."
      ],
      explain: "Même résultat, trois niveaux d'effort : c'est toute la différence entre les outils."
    },
    {
      title: "Dapper dans la transaction d'EF Core",
      code: `// dotnet add package Dapper
using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

using var db = new OrderFlowDbContext();
await using var tx = await db.Database.BeginTransactionAsync();

// Écriture avec EF Core (dans la transaction)
var tea = new Product { Name = "Thé vert", Price = 6m, Stock = 30 };
db.Products.Add(tea);
await db.SaveChangesAsync();

// Lecture avec Dapper sur LA MÊME connexion et LA MÊME transaction
var conn = db.Database.GetDbConnection();
var dbTx = tx.GetDbTransaction();
int stock = await conn.ExecuteScalarAsync<int>(
    "SELECT Stock FROM Products WHERE Id = @id", new { id = tea.Id }, dbTx);
Console.WriteLine($"Dapper voit le produit non validé : stock = {stock}");

await tx.RollbackAsync(); // on annule tout : EF et Dapper ensemble
db.ChangeTracker.Clear();
bool exists = await db.Products.AnyAsync(p => p.Id == tea.Id);
Console.WriteLine($"Après rollback, le produit existe ? {exists}");`,
      output: `Dapper voit le produit non validé : stock = 30
Après rollback, le produit existe ? False`,
      steps: [
        "<code>await using var tx = await db.Database.BeginTransactionAsync();</code> : EF ouvre la connexion et la transaction.",
        "<code>db.Products.Add(tea); await db.SaveChangesAsync();</code> : l'<code>INSERT</code> part, mais reste provisoire.",
        "<code>var conn = db.Database.GetDbConnection();</code> : la connexion ADO.NET qu'utilise le contexte.",
        "<code>var dbTx = tx.GetDbTransaction();</code> : la transaction ADO.NET cachée derrière celle d'EF. Il faut la passer à Dapper, sinon SQL Server refuse la commande.",
        "<code>conn.ExecuteScalarAsync&lt;int&gt;(…, new { id = tea.Id }, dbTx)</code> : Dapper lit dans la même transaction, il voit donc la ligne pas encore validée.",
        "<code>await tx.RollbackAsync();</code> : un seul rollback annule le travail des deux outils."
      ]
    },
    {
      title: "Un rapport SQL sans quitter EF Core",
      code: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();
var bob = new Customer { Name = "Bob", Email = "bob@exemple.fr", CreatedAt = DateTime.UtcNow };
var mug = new Product { Name = "Mug", Price = 10m, Stock = 50 };
bob.Orders.Add(new Order { OrderDate = DateTime.UtcNow, Status = OrderStatus.Paid,
    Lines = [new() { Product = mug, Quantity = 3, UnitPrice = 10m }] });
bob.Orders.Add(new Order { OrderDate = DateTime.UtcNow, Status = OrderStatus.Paid,
    Lines = [new() { Product = mug, Quantity = 2, UnitPrice = 10m }] });
db.Customers.Add(bob);
await db.SaveChangesAsync();

// Un rapport écrit en SQL, lu dans un type qui n'est pas une entité
string email = "bob@exemple.fr";
var report = await db.Database.SqlQuery<CustomerSales>($"""
    SELECT c.Name, COUNT(DISTINCT o.Id) AS OrderCount, SUM(l.Quantity) AS Units
    FROM Customers c
    JOIN Orders o ON o.CustomerId = c.Id
    JOIN OrderLines l ON l.OrderId = o.Id
    WHERE c.Email = {email}
    GROUP BY c.Name
    """).ToListAsync();

foreach (var r in report)
    Console.WriteLine($"{r.Name} : {r.OrderCount} commandes, {r.Units} articles");

await db.Customers.Where(c => c.Id == bob.Id).ExecuteDeleteAsync(); // ménage
await db.Products.Where(p => p.Id == mug.Id).ExecuteDeleteAsync();

record CustomerSales(string Name, int OrderCount, int Units);`,
      output: `Bob : 2 commandes, 5 articles`,
      steps: [
        "<code>bob.Orders.Add(…)</code> : deux commandes payées, de 3 et 2 mugs.",
        "<code>db.Database.SqlQuery&lt;CustomerSales&gt;($\"\"\" … \"\"\")</code> : une chaîne brute interpolée sur plusieurs lignes. Pratique pour du SQL lisible.",
        "<code>WHERE c.Email = {email}</code> : EF transforme l'interpolation en paramètre <code>@p0</code>. Aucun risque d'injection SQL.",
        "<code>COUNT(DISTINCT o.Id) AS OrderCount, SUM(l.Quantity) AS Units</code> : les alias correspondent aux paramètres du record.",
        "<code>record CustomerSales(string Name, int OrderCount, int Units);</code> : un type de résultat qui n'est pas une entité et n'a pas de <code>DbSet</code>.",
        "<code>.ToListAsync()</code> : la requête est exécutée et le résultat n'est pas suivi."
      ],
      explain: "Pour un rapport ponctuel, SqlQuery suffit souvent : pas de nouveau package, même connexion, même configuration."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une première requête Dapper",
      prompt: `<p>Avec Dapper, affiche le nom de tous les produits dont le stock est au moins 10, triés par nom. Le seuil doit être passé en paramètre.</p>`,
      hint: `<p><code>conn.QueryAsync&lt;string&gt;(sql, new { minStock })</code> : le nom de la propriété anonyme correspond au paramètre <code>@minStock</code>.</p>`,
      solution: `// dotnet add package Dapper
using Dapper;
using Microsoft.Data.SqlClient;

await using var conn = new SqlConnection(
    "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True");

int minStock = 10;
var names = await conn.QueryAsync<string>(
    "SELECT Name FROM Products WHERE Stock >= @minStock ORDER BY Name", new { minStock });

foreach (var name in names)
    Console.WriteLine(name);`
    },
    {
      level: "moyen",
      title: "Le même rapport en LINQ et en SQL",
      prompt: `<p>Calcule le nombre d'articles vendus par statut de commande, une fois avec LINQ (<code>GroupBy</code>), une fois avec <code>SqlQuery</code>. Affiche les deux résultats et compare-les.</p>`,
      hint: `<p>En LINQ, groupe les lignes par <code>l.Order.Status</code>. En SQL, fais la jointure <code>OrderLines</code> / <code>Orders</code> et un <code>GROUP BY o.Status</code>. Le statut est stocké en texte, d'où un <code>string</code> dans le record.</p>`,
      solution: `using Microsoft.EntityFrameworkCore;

using var db = new OrderFlowDbContext();

// Version LINQ : EF écrit le GROUP BY
var linq = await db.OrderLines
    .GroupBy(l => l.Order.Status)
    .Select(g => new { Status = g.Key, Units = g.Sum(l => l.Quantity) })
    .ToListAsync();
foreach (var s in linq.OrderBy(s => s.Status.ToString()))
    Console.WriteLine($"LINQ : {s.Status} = {s.Units}");

// Version SQL : tu écris le GROUP BY toi-même
var sql = await db.Database.SqlQuery<StatusSales>($"""
    SELECT o.Status, SUM(l.Quantity) AS Units
    FROM OrderLines l JOIN Orders o ON o.Id = l.OrderId
    GROUP BY o.Status
    """).ToListAsync();
foreach (var s in sql.OrderBy(s => s.Status))
    Console.WriteLine($"SQL  : {s.Status} = {s.Units}");

record StatusSales(string Status, int Units);`
    },
    {
      level: "difficile",
      title: "Dapper et EF Core dans une même commande",
      prompt: `<p>Dans une transaction EF Core, décrémente le stock d'un produit avec un <code>UPDATE</code> Dapper protégé par <code>Stock &gt;= 1</code>. Si une ligne a été modifiée, crée la commande avec EF Core et valide ; sinon, annule et affiche « Rupture de stock ».</p>`,
      hint: `<p><code>ExecuteAsync</code> de Dapper renvoie le nombre de lignes modifiées. N'oublie pas de lui passer <code>tx.GetDbTransaction()</code>.</p>`,
      solution: `// dotnet add package Dapper
using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

using var db = new OrderFlowDbContext();
var product = await db.Products.AsNoTracking().FirstAsync(p => p.Stock > 0);
var customer = await db.Customers.AsNoTracking().FirstAsync();

await using var tx = await db.Database.BeginTransactionAsync();

// Dapper : décrément atomique écrit à la main
int rows = await db.Database.GetDbConnection().ExecuteAsync(
    "UPDATE Products SET Stock = Stock - 1 WHERE Id = @id AND Stock >= 1",
    new { id = product.Id }, tx.GetDbTransaction());

if (rows == 1)
{
    // EF Core : création de la commande, dans la même transaction
    db.Orders.Add(new Order { CustomerId = customer.Id, OrderDate = DateTime.UtcNow,
        Lines = [new() { ProductId = product.Id, Quantity = 1, UnitPrice = product.Price }] });
    await db.SaveChangesAsync();
    await tx.CommitAsync();
    Console.WriteLine("Commande créée");
}
else
{
    await tx.RollbackAsync();
    Console.WriteLine("Rupture de stock");
}`
    }
  ],
  quiz: [
    {
      q: `Qu'est-ce que Dapper apporte par rapport à ADO.NET pur ?`,
      options: ["Il génère le SQL à partir de LINQ", "Il mappe automatiquement les colonnes vers tes objets", "Il suit les modifications des objets"],
      answer: 1,
      why: `Avec Dapper, tu écris toujours ton SQL, mais tu n'as plus à lire le <code>SqlDataReader</code> colonne par colonne. Le LINQ et le suivi sont des fonctionnalités d'EF Core.`
    },
    {
      q: `Pour un nouveau projet d'API avec CRUD, relations et migrations, quel choix par défaut ?`,
      options: ["ADO.NET pour la performance", "Dapper partout", "EF Core, en descendant d'un niveau là où la mesure le justifie"],
      answer: 2,
      why: `EF Core couvre l'essentiel avec très peu de code (tracker, concurrence, migrations). Dapper ou <code>SqlQuery</code> viennent en renfort sur des requêtes précises, après mesure.`
    },
    {
      q: `Comment faire participer une requête Dapper à une transaction ouverte par EF Core ?`,
      options: ["Passer <code>tx.GetDbTransaction()</code> à la méthode Dapper", "Ouvrir une nouvelle <code>SqlConnection</code>", "Appeler <code>SaveChanges</code> avant Dapper"],
      answer: 0,
      why: `Dapper doit utiliser la connexion du contexte (<code>GetDbConnection()</code>) <em>et</em> la transaction ADO.NET sous-jacente. Une nouvelle connexion serait hors de la transaction.`
    },
    {
      q: `Laquelle de ces écritures est protégée contre l'injection SQL ?`,
      options: ["<code>SqlQueryRaw&lt;T&gt;(\"… WHERE Email = '\" + email + \"'\")</code>", "<code>SqlQuery&lt;T&gt;($\"… WHERE Email = {email}\")</code>", "Les deux"],
      answer: 1,
      why: `<code>SqlQuery</code> transforme chaque valeur interpolée en paramètre SQL. Avec <code>SqlQueryRaw</code> et une concaténation, la valeur est collée telle quelle dans le SQL : c'est la porte ouverte à l'injection.`
    }
  ],
  project: `<p>Ajoute à OrderFlow un <code>ReportService</code> avec une méthode <code>GetMonthlySalesAsync(int year)</code> qui renvoie, pour chaque mois, le nombre de commandes payées et le chiffre d'affaires. Écris-la d'abord en LINQ, puis avec <code>SqlQuery</code> (ou Dapper sur la connexion du contexte). Compare le SQL généré et le temps d'exécution, et note ton choix en commentaire dans le code.</p>`,
  resources: [
    { label: "Requêtes SQL avec EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/querying/sql-queries" },
    { label: "Requêtes efficaces avec EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/performance/efficient-querying" }
  ]
});
