window.COURSE = window.COURSE || [];

window.COURSE.push({
  key: "e-tracking",
  title: "Change tracker, SaveChanges et transactions",
  summary: "Comprendre comment EF Core suit tes entités, ce qui se passe vraiment dans SaveChanges, et comment maîtriser les transactions et la durée de vie du DbContext.",
  objectives: [
    "Connaître les cinq états d'une entité et lire le ChangeTracker",
    "Choisir entre requête suivie, AsNoTracking et AsNoTrackingWithIdentityResolution",
    "Mettre à jour une entité à partir d'un DTO reçu par une API (scénario déconnecté)",
    "Expliquer ce que fait SaveChanges : unité de travail, batching, transaction implicite",
    "Écrire des transactions explicites avec savepoints, compatibles avec EnableRetryOnFailure",
    "Gérer correctement la durée de vie du DbContext (scoped, IDbContextFactory)"
  ],
  lesson: `<h3>Le change tracker : la mémoire du DbContext</h3>
<p>Quand tu charges une entité avec une requête classique, EF Core ne te rend pas seulement un objet : il garde une <em>copie des valeurs d'origine</em> (le snapshot) et associe à l'objet un état. Au moment de <code>SaveChanges</code>, il compare les valeurs actuelles au snapshot et génère uniquement les commandes SQL nécessaires. C'est ce mécanisme qu'on appelle le <strong>change tracker</strong>. Il n'existe rien d'équivalent en ADO.NET ou Dapper : là-bas, c'est toi qui décides quel <code>UPDATE</code> envoyer.</p>
<p>Chaque entité connue du contexte possède l'un des cinq états de l'énumération <code>EntityState</code> :</p>
<table>
<thead><tr><th>État</th><th>Signification</th><th>Effet au SaveChanges</th></tr></thead>
<tbody>
<tr><td><code>Detached</code></td><td>Le contexte ne connaît pas l'objet</td><td>Rien</td></tr>
<tr><td><code>Unchanged</code></td><td>Chargée ou attachée, aucune modification détectée</td><td>Rien</td></tr>
<tr><td><code>Added</code></td><td>Nouvelle entité (<code>Add</code>)</td><td><code>INSERT</code></td></tr>
<tr><td><code>Modified</code></td><td>Au moins une propriété a changé</td><td><code>UPDATE</code> des colonnes modifiées</td></tr>
<tr><td><code>Deleted</code></td><td>Marquée pour suppression (<code>Remove</code>)</td><td><code>DELETE</code></td></tr>
</tbody>
</table>
<p>Tu peux inspecter le contexte à tout moment avec <code>context.ChangeTracker.Entries()</code> (ou <code>Entries&lt;Order&gt;()</code>) et, en débogage, <code>context.ChangeTracker.DebugView.LongView</code>, qui affiche chaque entité, son état et ses valeurs modifiées. C'est l'outil numéro un quand un <code>SaveChanges</code> ne fait pas ce que tu attends.</p>

<h3>DetectChanges : quand EF compare les valeurs</h3>
<p>Par défaut, EF n'est pas notifié quand tu modifies une propriété : il compare les valeurs au snapshot lors de l'appel à <code>DetectChanges()</code>. Cette méthode est appelée automatiquement par <code>SaveChanges</code>, par <code>Entries()</code>, et <code>Entry(e)</code> fait une détection locale pour l'entité demandée. Tu n'as presque jamais besoin de l'appeler toi-même. En revanche, sur un contexte qui suit des dizaines de milliers d'entités, chaque <code>DetectChanges</code> coûte cher : c'est l'une des raisons pour lesquelles on évite les contextes à longue durée de vie et les imports massifs via le change tracker.</p>

<h3>Requêtes suivies ou non suivies</h3>
<p>Une requête suivie (le comportement par défaut) enregistre chaque entité retournée dans le change tracker et applique la <strong>résolution d'identité</strong> : si la même ligne apparaît deux fois, tu obtiens la même instance. C'est indispensable si tu comptes modifier les entités, mais c'est du travail inutile pour une lecture pure.</p>
<ul>
<li><code>AsNoTracking()</code> : aucun suivi, aucune résolution d'identité. Le plus rapide, idéal pour les lectures d'API. Attention : avec un <code>Include</code>, un même client peut être matérialisé en plusieurs instances.</li>
<li><code>AsNoTrackingWithIdentityResolution()</code> : pas de suivi, mais un même enregistrement donne une seule instance dans le résultat. Utile pour un graphe en lecture où l'identité compte (sérialisation d'un graphe, comparaisons par référence).</li>
<li><code>UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking)</code> dans la configuration : rend le non-suivi par défaut pour tout le contexte. Certaines équipes le font sur un contexte dédié à la lecture.</li>
</ul>
<p>Règle simple : une requête qui alimente une réponse HTTP en lecture est en <code>AsNoTracking</code>, et le mieux reste une projection <code>Select</code> vers un DTO, qui n'est jamais suivie.</p>

<h3>Le scénario déconnecté : un DTO arrive dans l'API</h3>
<p>Dans une API, l'entité n'a pas été chargée par le contexte de la requête courante : le client envoie un JSON, tu reçois un DTO. Trois approches existent.</p>
<ol>
<li><strong>Charger puis modifier</strong> (recommandé par défaut) : <code>FindAsync</code>, tu copies les champs du DTO, <code>SaveChanges</code>. EF ne met à jour que les colonnes réellement modifiées, tu peux valider les règles métier sur l'entité, et tu détectes un 404 naturellement. Coût : un aller-retour en lecture.</li>
<li><strong>Update</strong> : <code>context.Update(entity)</code> attache l'entité en état <code>Modified</code> et marque <em>toutes</em> les colonnes comme modifiées, y compris celles que le client n'a pas envoyées. Dangereux si le DTO est partiel : tu écrases des valeurs avec <code>null</code> ou 0. <code>Update</code> parcourt aussi le graphe et attache les entités liées.</li>
<li><strong>Attach + propriétés ciblées</strong> : <code>Attach</code> place l'entité en <code>Unchanged</code>, puis <code>Entry(e).Property(x =&gt; x.Status).IsModified = true</code> marque uniquement certaines colonnes. Un seul aller-retour, un <code>UPDATE</code> minimal, mais aucune vérification d'existence (0 ligne affectée si l'id n'existe pas) et aucune validation métier sur l'état complet.</li>
</ol>
<p>Note que <code>Entry(e).State = EntityState.Modified</code> ne touche que l'entité racine, alors que <code>Update</code> parcourt le graphe. Ce détail explique beaucoup de bugs du type « mes lignes de commande ont été réinsérées ».</p>

<h3>Ce que fait réellement SaveChanges</h3>
<p><code>SaveChanges</code> implémente le pattern <strong>Unit of Work</strong> : toutes les modifications accumulées sont envoyées ensemble.</p>
<ul>
<li>Il appelle <code>DetectChanges</code>, puis calcule l'ordre des commandes en fonction des clés étrangères (le parent est inséré avant ses enfants, les enfants supprimés avant le parent).</li>
<li>Il regroupe les commandes en <strong>batchs</strong> : sur SQL Server, plusieurs <code>INSERT</code>/<code>UPDATE</code> partent dans un seul aller-retour (taille configurable avec <code>MaxBatchSize</code>).</li>
<li>Il ouvre une <strong>transaction implicite</strong> si aucune n'est en cours : soit tout passe, soit rien. Tu n'as pas besoin de transaction explicite pour un seul <code>SaveChanges</code>.</li>
<li>Il récupère les valeurs générées par la base (identité, <code>rowversion</code>, valeurs par défaut) et met à jour tes objets.</li>
<li>Il passe les entités en <code>Unchanged</code> (et retire du suivi celles qui ont été supprimées).</li>
</ul>
<p>Conséquence directe : appeler <code>SaveChanges</code> dans une boucle détruit ces avantages (une transaction et un aller-retour par itération).</p>

<h3>Transactions explicites et savepoints</h3>
<p>Il te faut une transaction explicite dès que plusieurs <code>SaveChanges</code>, ou un mélange EF + SQL brut + Dapper, doivent réussir ou échouer ensemble. Exemple typique : passer une commande, décrémenter le stock, puis écrire un message d'outbox.</p>
<pre><code>await using var tx = await db.Database.BeginTransactionAsync(ct);
// ... plusieurs SaveChangesAsync ...
await tx.CommitAsync(ct);</code></pre>
<p>Si le bloc lève une exception avant <code>CommitAsync</code>, le <code>Dispose</code> annule la transaction. Les <strong>savepoints</strong> (<code>CreateSavepointAsync</code>, <code>RollbackToSavepointAsync</code>) permettent d'annuler une partie du travail sans tout perdre. EF Core crée d'ailleurs automatiquement un savepoint avant chaque <code>SaveChanges</code> exécuté à l'intérieur d'une transaction explicite.</p>

<h3>Résilience : EnableRetryOnFailure et ExecutionStrategy</h3>
<p>En production (surtout Azure SQL), on active <code>EnableRetryOnFailure()</code> pour rejouer automatiquement les opérations qui échouent sur une erreur transitoire. Piège : avec une stratégie de retry active, une transaction ouverte par l'utilisateur lève une <code>InvalidOperationException</code>, car EF ne peut pas rejouer seul un bloc qu'il ne contrôle pas. La solution est d'envelopper <em>tout</em> le bloc transactionnel dans <code>db.Database.CreateExecutionStrategy().ExecuteAsync(...)</code> : en cas d'échec transitoire, le bloc complet est rejoué. Il doit donc être rejouable : on recharge les données à l'intérieur du bloc, et on évite les effets de bord externes (appel HTTP, envoi d'email) à l'intérieur.</p>

<h3>Durée de vie du DbContext</h3>
<p>Un <code>DbContext</code> est léger, pas thread-safe, et conçu pour une <strong>unité de travail courte</strong>. Dans ASP.NET Core, <code>AddDbContext</code> l'enregistre en <em>scoped</em> : une instance par requête HTTP. Les erreurs classiques :</p>
<ul>
<li>Injecter le contexte dans un singleton ou un <code>BackgroundService</code> : il vit trop longtemps, accumule des entités et finit par être utilisé en parallèle.</li>
<li>Lancer plusieurs requêtes en parallèle sur le même contexte (<code>Task.WhenAll</code>) : EF lève « A second operation was started on this context instance ».</li>
<li>Garder un contexte ouvert pendant toute une application de bureau : le snapshot grossit et les données deviennent périmées.</li>
</ul>
<p>Pour ces cas, utilise <code>IDbContextFactory&lt;T&gt;</code> (<code>AddDbContextFactory</code> ou <code>AddPooledDbContextFactory</code>) : tu crées un contexte court avec <code>await factory.CreateDbContextAsync()</code> et tu le libères avec <code>await using</code>, un par unité de travail ou par tâche parallèle.</p>

<div class="note">Un senior sait lire le SQL produit par <code>SaveChanges</code> et le justifier. Prends l'habitude d'activer <code>LogTo(Console.WriteLine, LogLevel.Information)</code> en développement, et pose-toi trois questions à chaque écriture : combien d'allers-retours ? quelles colonnes sont mises à jour ? dans quelle transaction ? Dans une API, préfère « charger puis modifier » par défaut ; réserve <code>Attach</code> + <code>IsModified</code> aux chemins très chauds où tu as mesuré le gain. N'utilise <code>Update</code> sur un graphe venant du client que si tu maîtrises exactement ce qu'il contient.</div>

<h3>Pièges fréquents</h3>
<ul>
<li>Croire que <code>Update</code> ne met à jour que les champs envoyés : il met à jour toutes les colonnes.</li>
<li>Oublier <code>await</code> sur <code>SaveChangesAsync</code> puis disposer le contexte : écriture perdue ou exception.</li>
<li>Mélanger requête suivie et <code>Attach</code> d'une instance de même clé : « The instance of entity type cannot be tracked because another instance with the same key value is already being tracked ».</li>
<li>Ouvrir une transaction explicite pour un seul <code>SaveChanges</code> : inutile, il est déjà transactionnel.</li>
<li>Mettre un appel HTTP externe dans un bloc rejoué par l'ExecutionStrategy : l'appel peut partir deux fois.</li>
</ul>`,
  examples: [
    {
      title: "Observer les états avec le ChangeTracker",
      code: `using Microsoft.EntityFrameworkCore;

await using var db = new OrderFlowDbContext();

var product = await db.Products.FirstAsync(p => p.Sku == "KB-001");
Console.WriteLine(db.Entry(product).State); // Unchanged

product.Price = 59.90m;
// Entry() déclenche une détection des changements pour cette entité
Console.WriteLine(db.Entry(product).State); // Modified
Console.WriteLine(db.Entry(product).Property(p => p.Price).OriginalValue); // ancien prix

var category = new Category { Name = "Audio" };
db.Categories.Add(category);                 // Added

foreach (var entry in db.ChangeTracker.Entries())
    Console.WriteLine($"{entry.Metadata.ClrType.Name} -> {entry.State}");

// Vue détaillée, très utile en débogage
Console.WriteLine(db.ChangeTracker.DebugView.LongView);

await db.SaveChangesAsync();
// SQL généré (un seul aller-retour, dans une transaction implicite) :
// UPDATE [Products] SET [Price] = @p0 WHERE [Id] = @p1;
// INSERT INTO [Categories] ([Name]) OUTPUT INSERTED.[Id] VALUES (@p2);
Console.WriteLine(db.Entry(product).State); // Unchanged`,
      explain: "Seule la colonne <code>Price</code> apparaît dans l'<code>UPDATE</code> : EF a comparé les valeurs au snapshot. Après <code>SaveChangesAsync</code>, tout repasse en <code>Unchanged</code>."
    },
    {
      title: "Trois façons de mettre à jour depuis un DTO",
      code: `public sealed record UpdateProductDto(string Name, decimal Price);

public sealed class ProductWriter(OrderFlowDbContext db)
{
    // 1. Charger puis modifier : recommandé par défaut
    public async Task<bool> UpdateAsync(int id, UpdateProductDto dto, CancellationToken ct)
    {
        var product = await db.Products.FindAsync([id], ct);
        if (product is null) return false;          // 404 naturel

        product.Name = dto.Name;
        product.Price = dto.Price;                  // règles métier possibles ici
        await db.SaveChangesAsync(ct);              // UPDATE des seules colonnes modifiées
        return true;
    }

    // 2. Update : toutes les colonnes passent en Modified (dangereux avec un DTO partiel)
    public async Task UpdateAllColumnsAsync(Product product, CancellationToken ct)
    {
        db.Products.Update(product);
        await db.SaveChangesAsync(ct);
        // UPDATE [Products] SET [CategoryId]=@p0, [Name]=@p1, [Price]=@p2, [Sku]=@p3, [Stock]=@p4 WHERE [Id]=@p5
    }

    // 3. Attach + propriétés ciblées : un seul aller-retour, UPDATE minimal
    public async Task<bool> UpdatePriceOnlyAsync(int id, decimal price, CancellationToken ct)
    {
        var product = new Product { Id = id, Price = price };
        db.Products.Attach(product);                          // Unchanged
        db.Entry(product).Property(p => p.Price).IsModified = true;
        try
        {
            await db.SaveChangesAsync(ct);                    // UPDATE [Products] SET [Price]=@p0 WHERE [Id]=@p1
            return true;
        }
        catch (DbUpdateConcurrencyException)
        {
            return false;                                     // 0 ligne affectée : l'id n'existe pas
        }
    }
}`,
      explain: "La méthode 3 lève une <code>DbUpdateConcurrencyException</code> si aucune ligne n'est affectée, car EF s'attend à modifier exactement une ligne. Il faut l'intercepter si l'id peut ne pas exister."
    },
    {
      title: "Lecture : AsNoTracking et résolution d'identité",
      code: `// Lecture pure pour une API : pas de suivi
var orders = await db.Orders
    .AsNoTracking()
    .Include(o => o.Customer)
    .Where(o => o.Status == OrderStatus.Pending)
    .ToListAsync();

// Si un même client a 3 commandes : 3 instances Customer différentes
var distinctCustomers = orders.Select(o => o.Customer).Distinct().Count();

// Même requête, une seule instance par client
var orders2 = await db.Orders
    .AsNoTrackingWithIdentityResolution()
    .Include(o => o.Customer)
    .Where(o => o.Status == OrderStatus.Pending)
    .ToListAsync();

// Le mieux pour une API : une projection, jamais suivie
var dtos = await db.Orders
    .Where(o => o.Status == OrderStatus.Pending)
    .Select(o => new { o.Id, CustomerName = o.Customer.Name, Total = o.Lines.Sum(l => l.Quantity * l.UnitPrice) })
    .ToListAsync();`,
      explain: "<code>Distinct()</code> compare ici les références : avec <code>AsNoTracking</code> le compte peut être plus élevé que le nombre réel de clients."
    },
    {
      title: "Transaction explicite compatible avec EnableRetryOnFailure",
      code: `// Program.cs
builder.Services.AddDbContext<OrderFlowDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow"),
        sql => sql.EnableRetryOnFailure(maxRetryCount: 5)));

// Service
public async Task<int> PlaceOrderAsync(int customerId, int productId, int quantity, CancellationToken ct)
{
    var strategy = db.Database.CreateExecutionStrategy();

    // Tout le bloc est rejoué en cas d'erreur transitoire : il doit être rejouable
    return await strategy.ExecuteAsync(async () =>
    {
        db.ChangeTracker.Clear(); // repartir d'un état propre si le bloc est rejoué
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var product = await db.Products.SingleAsync(p => p.Id == productId, ct);
        if (product.Stock < quantity) throw new InvalidOperationException("Stock insuffisant");
        product.Stock -= quantity;

        var order = new Order { CustomerId = customerId, Status = OrderStatus.Pending, CreatedAt = DateTime.UtcNow };
        order.Lines.Add(new OrderLine { ProductId = productId, Quantity = quantity, UnitPrice = product.Price });
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        await tx.CreateSavepointAsync("AfterOrder", ct);
        try
        {
            db.Add(new OutboxMessage { Type = "OrderPlaced", Payload = order.Id.ToString() });
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            // On garde la commande, on annule seulement l'écriture d'outbox
            await tx.RollbackToSavepointAsync("AfterOrder", ct);
        }

        await tx.CommitAsync(ct);
        return order.Id;
    });
}`,
      explain: "Sans <code>CreateExecutionStrategy().ExecuteAsync</code>, <code>BeginTransactionAsync</code> lèverait une exception dès que <code>EnableRetryOnFailure</code> est actif. Dans un vrai projet, on ne masquerait pas l'échec de l'outbox : l'exemple illustre seulement les savepoints."
    },
    {
      title: "IDbContextFactory pour un BackgroundService et du parallélisme",
      code: `builder.Services.AddDbContextFactory<OrderFlowDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")));

public sealed class StockAlertWorker(IDbContextFactory<OrderFlowDbContext> factory, ILogger<StockAlertWorker> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            // Un contexte neuf et court à chaque cycle
            await using var db = await factory.CreateDbContextAsync(stoppingToken);
            var lowStock = await db.Products.AsNoTracking()
                .Where(p => p.Stock < 5)
                .Select(p => p.Sku)
                .ToListAsync(stoppingToken);
            logger.LogWarning("Stock bas : {Skus}", string.Join(", ", lowStock));
        }
    }
}

// Requêtes en parallèle : un contexte par tâche
async Task<(int Orders, int Customers)> CountAsync(IDbContextFactory<OrderFlowDbContext> factory)
{
    async Task<int> Count<T>(Func<OrderFlowDbContext, IQueryable<T>> query)
    {
        await using var db = await factory.CreateDbContextAsync();
        return await query(db).CountAsync();
    }
    var t1 = Count(db => db.Orders);
    var t2 = Count(db => db.Customers);
    await Task.WhenAll(t1, t2);
    return (t1.Result, t2.Result);
}`,
      explain: "Avec un seul contexte partagé, <code>Task.WhenAll</code> lèverait « A second operation was started on this context instance »."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Afficher l'état des entités",
      prompt: "<p>Écris une méthode <code>PrintTracker(DbContext db)</code> qui affiche, pour chaque entité suivie, son type, son état et, pour les entités <code>Modified</code>, la liste des propriétés modifiées avec l'ancienne et la nouvelle valeur.</p>",
      hint: "<p><code>entry.Properties</code> donne des <code>PropertyEntry</code> avec <code>IsModified</code>, <code>OriginalValue</code> et <code>CurrentValue</code>.</p>",
      solution: `using Microsoft.EntityFrameworkCore;

static void PrintTracker(DbContext db)
{
    db.ChangeTracker.DetectChanges();
    foreach (var entry in db.ChangeTracker.Entries())
    {
        Console.WriteLine($"{entry.Metadata.ClrType.Name} : {entry.State}");
        if (entry.State != EntityState.Modified) continue;

        foreach (var prop in entry.Properties.Where(p => p.IsModified))
            Console.WriteLine($"  {prop.Metadata.Name} : {prop.OriginalValue} -> {prop.CurrentValue}");
    }
}`
    },
    {
      level: "moyen",
      title: "PATCH du statut d'une commande",
      prompt: "<p>Implémente un endpoint <code>PATCH /orders/{id}/status</code> qui reçoit <code>{ \"status\": \"Shipped\" }</code>. Il doit : renvoyer 404 si la commande n'existe pas, refuser (409) de passer une commande <code>Cancelled</code> à un autre statut, et générer un <code>UPDATE</code> sur la seule colonne <code>Status</code>.</p>",
      hint: "<p>Ici, la règle métier impose de connaître le statut actuel : charge la commande (sans ses lignes), modifie la propriété, EF ne mettra à jour que cette colonne.</p>",
      solution: `public sealed record UpdateStatusDto(OrderStatus Status);

app.MapPatch("/orders/{id:int}/status", async (int id, UpdateStatusDto dto, OrderFlowDbContext db, CancellationToken ct) =>
{
    var order = await db.Orders.FindAsync([id], ct);
    if (order is null) return Results.NotFound();

    if (order.Status == OrderStatus.Cancelled && dto.Status != OrderStatus.Cancelled)
        return Results.Conflict(new { error = "Une commande annulée ne peut plus changer de statut." });

    order.Status = dto.Status;
    await db.SaveChangesAsync(ct);
    // UPDATE [Orders] SET [Status] = @p0 WHERE [Id] = @p1;
    return Results.NoContent();
});`
    },
    {
      level: "difficile",
      title: "Synchroniser les lignes d'une commande depuis un DTO",
      prompt: "<p>Le client envoie la liste complète des lignes d'une commande : <code>record OrderLineDto(int? Id, int ProductId, int Quantity)</code>. Écris <code>SyncLinesAsync(int orderId, List&lt;OrderLineDto&gt; lines)</code> qui ajoute les nouvelles lignes (Id null), met à jour les quantités existantes et supprime les lignes absentes du DTO, le tout en un seul <code>SaveChanges</code>. Le prix unitaire d'une nouvelle ligne vient du produit en base.</p>",
      hint: "<p>Charge la commande avec <code>Include(o =&gt; o.Lines)</code>. Fais trois passes : suppressions, mises à jour, ajouts. Charge les prix des nouveaux produits en une seule requête avec <code>Contains</code>.</p>",
      solution: `public sealed record OrderLineDto(int? Id, int ProductId, int Quantity);

public async Task<bool> SyncLinesAsync(int orderId, List<OrderLineDto> lines, CancellationToken ct)
{
    var order = await db.Orders.Include(o => o.Lines).SingleOrDefaultAsync(o => o.Id == orderId, ct);
    if (order is null) return false;

    var incomingIds = lines.Where(l => l.Id is not null).Select(l => l.Id!.Value).ToHashSet();

    // 1. Suppressions : lignes en base absentes du DTO
    foreach (var line in order.Lines.Where(l => !incomingIds.Contains(l.Id)).ToList())
        db.Remove(line);

    // 2. Mises à jour
    foreach (var dto in lines.Where(l => l.Id is not null))
    {
        var line = order.Lines.SingleOrDefault(l => l.Id == dto.Id)
                   ?? throw new InvalidOperationException($"Ligne {dto.Id} inconnue pour la commande {orderId}");
        line.Quantity = dto.Quantity;
    }

    // 3. Ajouts : prix chargés en une seule requête
    var newProductIds = lines.Where(l => l.Id is null).Select(l => l.ProductId).Distinct().ToList();
    var prices = await db.Products
        .Where(p => newProductIds.Contains(p.Id))
        .ToDictionaryAsync(p => p.Id, p => p.Price, ct);

    foreach (var dto in lines.Where(l => l.Id is null))
        order.Lines.Add(new OrderLine { ProductId = dto.ProductId, Quantity = dto.Quantity, UnitPrice = prices[dto.ProductId] });

    await db.SaveChangesAsync(ct); // DELETE + UPDATE + INSERT dans une seule transaction implicite
    return true;
}`
    }
  ],
  project: "<p>Dans <code>OrderFlow.Data.Ef</code> :</p><ul><li>Ajoute <code>OrderService.UpdateShippingAsync(int orderId, UpdateShippingDto dto)</code> qui met à jour l'adresse de livraison et les notes d'une commande depuis un DTO, en utilisant « charger puis modifier ». Vérifie dans les logs que seules les colonnes modifiées partent dans l'<code>UPDATE</code>.</li><li>Écris <code>PlaceOrderAsync</code> : vérification et décrément du stock, création de la commande et de ses lignes, le tout dans une transaction explicite enveloppée dans <code>CreateExecutionStrategy().ExecuteAsync</code>, avec <code>EnableRetryOnFailure</code> activé.</li><li>Remplace tout usage d'<code>OrderFlowDbContext</code> dans un singleton ou un worker par <code>IDbContextFactory&lt;OrderFlowDbContext&gt;</code>.</li></ul>",
  resources: [
    { label: "Change tracking dans EF Core", url: "https://learn.microsoft.com/ef/core/change-tracking/" },
    { label: "Entités déconnectées", url: "https://learn.microsoft.com/ef/core/saving/disconnected-entities" },
    { label: "Utiliser les transactions", url: "https://learn.microsoft.com/ef/core/saving/transactions" },
    { label: "Résilience de connexion (ExecutionStrategy)", url: "https://learn.microsoft.com/ef/core/miscellaneous/connection-resiliency" },
    { label: "Durée de vie et configuration du DbContext", url: "https://learn.microsoft.com/ef/core/dbcontext-configuration/" }
  ]
});

window.COURSE.push({
  key: "e-concurrency-sql",
  title: "Concurrence, SQL brut et opérations en masse",
  summary: "Protéger tes données contre les écritures concurrentes, sortir de LINQ quand c'est nécessaire sans ouvrir de faille, et modifier des milliers de lignes sans les charger.",
  objectives: [
    "Mettre en place la concurrence optimiste avec rowversion et IsConcurrencyToken",
    "Résoudre une DbUpdateConcurrencyException (client wins, store wins, fusion)",
    "Écrire du SQL brut paramétré avec FromSql, SqlQuery et ExecuteSql",
    "Appeler une procédure stockée depuis EF Core",
    "Utiliser ExecuteUpdateAsync et ExecuteDeleteAsync en connaissant leurs limites",
    "Mapper une vue SQL avec une entité sans clé"
  ],
  lesson: `<h3>Le problème : la mise à jour perdue</h3>
<p>Deux administrateurs ouvrent la fiche du même produit. Le premier passe le stock de 10 à 8 et enregistre. Le second, qui voit toujours 10, passe le prix de 50 à 45 et enregistre. Si ton code fait « charger puis modifier » sur des requêtes HTTP séparées, ou utilise <code>Update</code> avec toutes les colonnes, la seconde écriture peut écraser silencieusement la première : c'est la <strong>mise à jour perdue</strong> (lost update). Plus grave encore : deux commandes simultanées lisent un stock de 1, toutes deux le décrémentent, et tu vends un produit que tu n'as plus.</p>
<p>Deux familles de solutions existent :</p>
<table>
<thead><tr><th>Approche</th><th>Principe</th><th>Quand l'utiliser</th></tr></thead>
<tbody>
<tr><td>Pessimiste</td><td>Verrouiller la ligne pendant la lecture (<code>UPDLOCK</code>, transaction <code>Serializable</code>)</td><td>Conflits très fréquents, sections très courtes</td></tr>
<tr><td>Optimiste</td><td>Ne rien verrouiller, mais vérifier à l'écriture que la ligne n'a pas changé</td><td>Le cas général des applications web</td></tr>
</tbody>
</table>
<p>EF Core supporte nativement la concurrence <strong>optimiste</strong>, et c'est celle que tu utiliseras dans 95 % des cas.</p>

<h3>Concurrence optimiste avec rowversion</h3>
<p>Sur SQL Server, le type <code>rowversion</code> est un compteur de 8 octets que le moteur incrémente automatiquement à chaque modification de la ligne. On le mappe sur une propriété <code>byte[]</code> avec l'attribut <code>[Timestamp]</code> ou avec <code>IsRowVersion()</code> en Fluent API. EF ajoute alors la colonne dans la clause <code>WHERE</code> de chaque <code>UPDATE</code> et <code>DELETE</code> :</p>
<pre><code>UPDATE [Products] SET [Stock] = @p0
OUTPUT INSERTED.[RowVersion]
WHERE [Id] = @p1 AND [RowVersion] = @p2;</code></pre>
<p>Si quelqu'un a modifié la ligne entre-temps, la version ne correspond plus, aucune ligne n'est affectée, et EF lève une <code>DbUpdateConcurrencyException</code>. Après un succès, EF relit la nouvelle version (le <code>OUTPUT</code>) et met à jour ta propriété.</p>
<p>Si tu ne veux pas de colonne technique, tu peux marquer une ou plusieurs propriétés métier comme jetons de concurrence avec <code>IsConcurrencyToken()</code> (ou <code>[ConcurrencyCheck]</code>) : EF vérifie leur valeur d'origine dans le <code>WHERE</code>. C'est toi qui dois alors faire évoluer la valeur (un <code>Guid</code> régénéré à chaque écriture, par exemple). C'est l'approche à utiliser sur les bases qui n'ont pas de <code>rowversion</code>.</p>

<h3>Concurrence dans une API : faire voyager la version</h3>
<p>Dans une API, le contexte qui écrit n'est pas celui qui a lu. Il faut donc que le client renvoie la version qu'il a reçue. On l'expose dans le DTO de lecture (souvent en Base64, ou dans un en-tête <code>ETag</code>), le client la renvoie avec sa modification, et on l'injecte comme <em>valeur d'origine</em> avant d'enregistrer :</p>
<pre><code>db.Entry(product).Property(p =&gt; p.RowVersion).OriginalValue = dto.RowVersion;</code></pre>
<p>C'est l'étape qu'on oublie le plus souvent : si tu charges le produit puis appliques la modification sans réinjecter la version du client, EF compare avec la version qu'il vient de lire, et le conflit n'est jamais détecté. On répond ensuite <code>409 Conflict</code> (ou <code>412 Precondition Failed</code> avec <code>If-Match</code>) quand l'exception survient.</p>

<h3>Résoudre un conflit</h3>
<p><code>DbUpdateConcurrencyException.Entries</code> contient les entrées en échec. Pour chacune, tu as accès à trois jeux de valeurs : <code>CurrentValues</code> (ce que tu voulais écrire), <code>OriginalValues</code> (ce que tu croyais être en base) et <code>GetDatabaseValuesAsync()</code> (ce qui est réellement en base). Trois stratégies :</p>
<ul>
<li><strong>Store wins</strong> (la base gagne) : on abandonne la modification et on recharge (<code>entry.ReloadAsync()</code>), puis on informe l'utilisateur.</li>
<li><strong>Client wins</strong> (le client gagne) : on recopie les valeurs de la base dans <code>OriginalValues</code> (<code>entry.OriginalValues.SetValues(dbValues)</code>) pour aligner la version, puis on relance <code>SaveChanges</code>. On écrase délibérément l'autre modification.</li>
<li><strong>Fusion</strong> : on compare propriété par propriété. Si l'autre utilisateur a modifié le prix et toi le stock, on peut combiner les deux. Si vous avez modifié la même propriété, on applique une règle métier ou on renvoie le conflit à l'utilisateur.</li>
</ul>
<p>Dans une API, la stratégie la plus saine est souvent de ne pas résoudre automatiquement : renvoyer 409 avec les valeurs actuelles et laisser le client décider. Pour des compteurs (stock), on préfère une mise à jour atomique côté SQL, voir plus bas.</p>

<h3>SQL brut sans injection</h3>
<p>Quand LINQ ne suffit pas (fonction SQL spécifique, requête CTE complexe, indice de requête), EF Core te laisse écrire du SQL. Les API à connaître :</p>
<table>
<thead><tr><th>API</th><th>Retour</th><th>Paramétrage</th></tr></thead>
<tbody>
<tr><td><code>DbSet.FromSql($"...")</code></td><td>Entités suivies, composables avec LINQ</td><td>Interpolation convertie en paramètres</td></tr>
<tr><td><code>FromSqlInterpolated</code></td><td>Idem (ancien nom, toujours valide)</td><td>Idem</td></tr>
<tr><td><code>FromSqlRaw("...", params)</code></td><td>Entités</td><td>À toi de passer les paramètres : risque d'injection si tu concatènes</td></tr>
<tr><td><code>Database.SqlQuery&lt;T&gt;($"...")</code></td><td>Scalaires ou types non mappés (DTO)</td><td>Interpolation paramétrée</td></tr>
<tr><td><code>Database.ExecuteSqlAsync($"...")</code></td><td>Nombre de lignes affectées</td><td>Interpolation paramétrée</td></tr>
</tbody>
</table>
<p>Le point crucial : <code>FromSql</code>, <code>SqlQuery</code> et <code>ExecuteSql</code> prennent un <code>FormattableString</code>. Chaque valeur interpolée devient un <code>DbParameter</code>, pas du texte collé dans la requête : <code>FromSql($"... WHERE Sku = {sku}")</code> est sûr. À l'inverse, <code>FromSqlRaw("... WHERE Sku = '" + sku + "'")</code> est une injection SQL. Si tu dois construire une chaîne avant l'appel, l'interpolation est perdue : la chaîne finale n'est plus un <code>FormattableString</code>. Les noms de tables ou de colonnes ne peuvent jamais être paramétrés : il faut les valider avec une liste blanche.</p>
<p>Une requête <code>FromSql</code> qui commence par <code>SELECT</code> est composable : EF l'enveloppe en sous-requête, ce qui permet d'ajouter <code>Where</code>, <code>OrderBy</code> ou <code>Include</code> derrière. Un appel de procédure stockée (<code>EXEC</code>) n'est pas composable : ajoute <code>AsEnumerable()</code> avant tout opérateur LINQ pour le faire côté client.</p>

<h3>Opérations en masse : ExecuteUpdate et ExecuteDelete</h3>
<p>Augmenter de 5 % le prix de toute une catégorie avec le change tracker oblige à charger chaque produit, modifier chaque objet, puis envoyer autant d'<code>UPDATE</code>. Depuis EF Core 7, <code>ExecuteUpdateAsync</code> et <code>ExecuteDeleteAsync</code> traduisent la requête LINQ en une seule instruction SQL exécutée immédiatement :</p>
<pre><code>await db.Products.Where(p =&gt; p.CategoryId == 3)
    .ExecuteUpdateAsync(s =&gt; s.SetProperty(p =&gt; p.Price, p =&gt; p.Price * 1.05m));</code></pre>
<p>C'est extrêmement efficace, mais il faut connaître les conséquences :</p>
<ul>
<li>Le <strong>change tracker est contourné</strong> : les entités déjà chargées dans le contexte gardent leurs anciennes valeurs. Recharge-les ou utilise un contexte neuf.</li>
<li>L'appel est <strong>exécuté immédiatement</strong>, sans attendre <code>SaveChanges</code>, et hors de sa transaction implicite. Pour le combiner avec d'autres écritures de façon atomique, ouvre une transaction explicite.</li>
<li>Les <strong>interceptors de SaveChanges</strong> (audit, soft delete, horodatage) ne sont pas déclenchés, ni les règles écrites dans tes entités.</li>
<li>La concurrence optimiste n'est pas vérifiée automatiquement : ajoute la condition toi-même dans le <code>Where</code> si besoin.</li>
</ul>
<p>Pour décrémenter un stock sans survente, c'est l'outil idéal : <code>Where(p =&gt; p.Id == id &amp;&amp; p.Stock &gt;= qty).ExecuteUpdateAsync(...)</code> renvoie 1 si le stock suffisait, 0 sinon, sans aucune fenêtre de concurrence.</p>

<h3>Entités sans clé et vues SQL</h3>
<p>Une vue SQL de reporting (chiffre d'affaires par mois, par exemple) n'a pas de clé primaire. On la mappe sur une entité sans clé avec <code>HasNoKey()</code> (ou <code>[Keyless]</code>) et <code>ToView("vw_MonthlySales")</code>. Ces entités ne sont jamais suivies et ne peuvent pas être modifiées par <code>SaveChanges</code>. La vue doit exister en base : on la crée dans une migration avec <code>migrationBuilder.Sql(...)</code>. Pour une requête ponctuelle vers un DTO, <code>Database.SqlQuery&lt;T&gt;</code> évite même de déclarer l'entité dans le modèle.</p>

<div class="note">Un senior choisit le bon niveau d'outil : LINQ pour le cas général, <code>ExecuteUpdate</code> pour les écritures massives ou atomiques, SQL brut paramétré pour les requêtes que LINQ traduit mal, Dapper ou ADO.NET pour un reporting très spécifique. Sur la concurrence, il sait expliquer la différence entre « détecter un conflit » (rowversion, 409) et « rendre l'opération atomique » (<code>UPDATE ... WHERE Stock &gt;= @qty</code>). Pour un stock, seule la seconde garantit l'absence de survente sans retry côté client.</div>

<h3>Pièges fréquents</h3>
<ul>
<li>Exposer <code>RowVersion</code> dans le DTO mais ne jamais le réinjecter dans <code>OriginalValue</code> : la concurrence ne fonctionne pas.</li>
<li>Construire une chaîne avec <code>$"..."</code> dans une variable <code>string</code> puis la passer à <code>FromSqlRaw</code> : l'interpolation devient de la concaténation et ouvre une injection.</li>
<li>Composer avec LINQ derrière un <code>EXEC</code> : erreur SQL, il faut <code>AsEnumerable()</code>.</li>
<li>Oublier qu'<code>ExecuteDelete</code> ignore le soft delete et l'audit : la ligne disparaît vraiment.</li>
<li>Utiliser <code>ExecuteUpdate</code> puis lire une entité déjà suivie : tu vois l'ancienne valeur.</li>
</ul>`,
  examples: [
    {
      title: "Mapper une rowversion et provoquer un conflit",
      code: `using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Sku { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public int CategoryId { get; set; }

    [Timestamp] // ou modelBuilder.Entity<Product>().Property(p => p.RowVersion).IsRowVersion();
    public byte[] RowVersion { get; set; } = [];
}

// Simulation de deux utilisateurs avec deux contextes
await using var dbA = new OrderFlowDbContext();
await using var dbB = new OrderFlowDbContext();

var pA = await dbA.Products.SingleAsync(p => p.Sku == "KB-001");
var pB = await dbB.Products.SingleAsync(p => p.Sku == "KB-001");

pA.Stock -= 2;
await dbA.SaveChangesAsync();
// UPDATE [Products] SET [Stock] = @p0 OUTPUT INSERTED.[RowVersion]
// WHERE [Id] = @p1 AND [RowVersion] = @p2;

pB.Price = 45m;
try
{
    await dbB.SaveChangesAsync(); // la RowVersion de pB est périmée : 0 ligne affectée
}
catch (DbUpdateConcurrencyException ex)
{
    Console.WriteLine($"Conflit sur {ex.Entries.Count} entité(s)");
}`,
      explain: "Le second <code>UPDATE</code> ne trouve aucune ligne avec l'ancienne version : EF transforme ce « 0 ligne affectée » en exception."
    },
    {
      title: "Concurrence dans une API avec résolution par fusion",
      code: `public sealed record ProductDto(int Id, string Name, decimal Price, int Stock, string Version);
public sealed record UpdateProductDto(string Name, decimal Price, int Stock, string Version);

app.MapPut("/products/{id:int}", async (int id, UpdateProductDto dto, OrderFlowDbContext db, CancellationToken ct) =>
{
    var product = await db.Products.FindAsync([id], ct);
    if (product is null) return Results.NotFound();

    // Étape indispensable : comparer avec la version que le client avait reçue
    db.Entry(product).Property(p => p.RowVersion).OriginalValue = Convert.FromBase64String(dto.Version);

    product.Name = dto.Name;
    product.Price = dto.Price;
    product.Stock = dto.Stock;

    try
    {
        await db.SaveChangesAsync(ct);
        return Results.Ok(new ProductDto(product.Id, product.Name, product.Price, product.Stock,
            Convert.ToBase64String(product.RowVersion)));
    }
    catch (DbUpdateConcurrencyException ex)
    {
        var entry = ex.Entries.Single();
        var dbValues = await entry.GetDatabaseValuesAsync(ct);
        if (dbValues is null) return Results.NotFound(); // supprimé entre-temps

        // Store wins : on renvoie l'état actuel, le client décide
        var current = (Product)dbValues.ToObject();
        return Results.Conflict(new ProductDto(current.Id, current.Name, current.Price, current.Stock,
            Convert.ToBase64String(current.RowVersion)));
    }
});

// Variante "client wins" (à utiliser consciemment) :
// entry.OriginalValues.SetValues(dbValues);   // aligne la version sur la base
// await db.SaveChangesAsync(ct);              // écrase l'autre modification`,
      explain: "La version voyage en Base64 dans le DTO. Sans la ligne <code>OriginalValue</code>, EF comparerait avec la version qu'il vient de lire et le conflit ne serait jamais détecté."
    },
    {
      title: "SQL brut paramétré : FromSql, SqlQuery, ExecuteSql",
      code: `string sku = "KB-001";       // peut venir de l'utilisateur
int minStock = 5;

// 1. Entités, paramétré automatiquement, composable avec LINQ
var products = await db.Products
    .FromSql($"SELECT * FROM Products WHERE Sku = {sku}")
    .AsNoTracking()
    .Include(p => p.Category)
    .ToListAsync();
// SQL : SELECT ... FROM (SELECT * FROM Products WHERE Sku = @p0) AS [p] LEFT JOIN [Categories] ...

// 2. Type non mappé (EF Core 8+) : un simple DTO
public sealed record SalesByCategory(string Category, decimal Revenue);

var sales = await db.Database.SqlQuery<SalesByCategory>($"""
    SELECT c.Name AS Category, SUM(l.Quantity * l.UnitPrice) AS Revenue
    FROM OrderLines l
    JOIN Products p ON p.Id = l.ProductId
    JOIN Categories c ON c.Id = p.CategoryId
    GROUP BY c.Name
    """).ToListAsync();

// 3. Scalaire : la colonne doit s'appeler Value pour pouvoir composer
var lowStockCount = await db.Database
    .SqlQuery<int>($"SELECT COUNT(*) AS Value FROM Products WHERE Stock < {minStock}")
    .SingleAsync();

// 4. Commande sans résultat
int affected = await db.Database.ExecuteSqlAsync(
    $"UPDATE Products SET Stock = 0 WHERE Stock < 0");

// DANGER : concaténation = injection SQL
// var bad = db.Products.FromSqlRaw("SELECT * FROM Products WHERE Sku = '" + sku + "'");
// Correct avec Raw : paramètres explicites
var ok = db.Products.FromSqlRaw("SELECT * FROM Products WHERE Sku = {0}", sku);`,
      explain: "Dans <code>FromSqlRaw</code>, la syntaxe <code>{0}</code> crée aussi un paramètre. Seule la concaténation de texte est dangereuse."
    },
    {
      title: "Appeler une procédure stockée",
      code: `// Migration qui crée la procédure
public partial class AddTopCustomersProc : Migration
{
    protected override void Up(MigrationBuilder mb) => mb.Sql("""
        CREATE OR ALTER PROCEDURE dbo.GetTopCustomers @Top INT
        AS
        SELECT TOP (@Top) c.Id, c.Name, SUM(l.Quantity * l.UnitPrice) AS Total
        FROM Customers c
        JOIN Orders o ON o.CustomerId = c.Id
        JOIN OrderLines l ON l.OrderId = o.Id
        GROUP BY c.Id, c.Name
        ORDER BY Total DESC
        """);

    protected override void Down(MigrationBuilder mb) => mb.Sql("DROP PROCEDURE dbo.GetTopCustomers");
}

public sealed record TopCustomer(int Id, string Name, decimal Total);

int top = 10;
var best = await db.Database
    .SqlQuery<TopCustomer>($"EXEC dbo.GetTopCustomers @Top = {top}")
    .ToListAsync();

// EXEC n'est pas composable : filtrer côté client après AsEnumerable()
var bigOnes = (await db.Database
        .SqlQuery<TopCustomer>($"EXEC dbo.GetTopCustomers @Top = {top}")
        .ToListAsync())
    .Where(c => c.Total > 1000)
    .ToList();

// Procédure qui modifie des données
await db.Database.ExecuteSqlAsync($"EXEC dbo.ArchiveOldOrders @Before = {DateTime.UtcNow.AddYears(-2)}");`,
      explain: "Pour une procédure, on matérialise d'abord (<code>ToListAsync</code>) puis on filtre en mémoire, car SQL Server ne peut pas envelopper un <code>EXEC</code> dans un <code>SELECT</code>."
    },
    {
      title: "ExecuteUpdate, ExecuteDelete et vue sans clé",
      code: `// Hausse de prix en masse : une seule instruction, aucune entité chargée
int updated = await db.Products
    .Where(p => p.CategoryId == 3)
    .ExecuteUpdateAsync(s => s
        .SetProperty(p => p.Price, p => p.Price * 1.05m)
        .SetProperty(p => p.Name, p => p.Name + " (2026)"));
// UPDATE [p] SET [p].[Price] = [p].[Price] * 1.05, [p].[Name] = [p].[Name] + N' (2026)'
// FROM [Products] AS [p] WHERE [p].[CategoryId] = 3

// Décrément de stock atomique : pas de survente possible
int reserved = await db.Products
    .Where(p => p.Id == productId && p.Stock >= quantity)
    .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - quantity));
if (reserved == 0) throw new InvalidOperationException("Stock insuffisant");

// Suppression en masse (contourne le soft delete et les interceptors)
await db.Orders
    .Where(o => o.Status == OrderStatus.Cancelled && o.CreatedAt < DateTime.UtcNow.AddYears(-3))
    .ExecuteDeleteAsync();

// Vue SQL mappée sur une entité sans clé
public sealed class MonthlySales
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal Revenue { get; set; }
}

// OnModelCreating
modelBuilder.Entity<MonthlySales>(b =>
{
    b.HasNoKey();
    b.ToView("vw_MonthlySales");
});

var last12 = await db.Set<MonthlySales>()
    .OrderByDescending(s => s.Year).ThenByDescending(s => s.Month)
    .Take(12)
    .ToListAsync();`,
      explain: "Le décrément atomique remplace la séquence « lire, vérifier, écrire » : la vérification du stock et la mise à jour se font dans la même instruction SQL."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ajouter une rowversion et l'exposer",
      prompt: "<p>Ajoute une propriété <code>RowVersion</code> sur <code>Customer</code> configurée en Fluent API, génère la migration, et modifie <code>GET /customers/{id}</code> pour renvoyer la version en Base64 dans le DTO et dans l'en-tête <code>ETag</code>.</p>",
      hint: "<p><code>IsRowVersion()</code> en Fluent API. Pour l'en-tête : <code>httpContext.Response.Headers.ETag</code>, avec la valeur entre guillemets.</p>",
      solution: `// Entité
public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public byte[] RowVersion { get; set; } = [];
}

// Configuration
public sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> b) => b.Property(c => c.RowVersion).IsRowVersion();
}

// dotnet ef migrations add AddCustomerRowVersion

public sealed record CustomerDto(int Id, string Name, string Email, string Version);

app.MapGet("/customers/{id:int}", async (int id, OrderFlowDbContext db, HttpContext http, CancellationToken ct) =>
{
    var c = await db.Customers.AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
    if (c is null) return Results.NotFound();

    var version = Convert.ToBase64String(c.RowVersion);
    http.Response.Headers.ETag = $"\\"{version}\\"";
    return Results.Ok(new CustomerDto(c.Id, c.Name, c.Email, version));
});`
    },
    {
      level: "moyen",
      title: "Recherche sécurisée avec tri dynamique",
      prompt: "<p>Écris <code>SearchProductsAsync(string term, string sortColumn)</code> en SQL brut : recherche <code>LIKE</code> sur le nom, tri par la colonne demandée. La colonne de tri vient de l'utilisateur. Le code ne doit permettre aucune injection.</p>",
      hint: "<p>Le terme de recherche peut être un paramètre interpolé. Un nom de colonne ne peut pas l'être : valide-le contre une liste blanche, puis utilise <code>FromSqlRaw</code> avec un paramètre explicite pour le terme.</p>",
      solution: `private static readonly Dictionary<string, string> AllowedSorts = new(StringComparer.OrdinalIgnoreCase)
{
    ["name"] = "Name",
    ["price"] = "Price",
    ["stock"] = "Stock"
};

public async Task<List<Product>> SearchProductsAsync(string term, string sortColumn, CancellationToken ct)
{
    if (!AllowedSorts.TryGetValue(sortColumn, out var column))
        throw new ArgumentException($"Tri non autorisé : {sortColumn}", nameof(sortColumn));

    // Le nom de colonne vient de la liste blanche, le terme reste un paramètre
    var sql = "SELECT * FROM Products WHERE Name LIKE {0} ORDER BY " + column;
    return await db.Products
        .FromSqlRaw(sql, "%" + term + "%")
        .AsNoTracking()
        .ToListAsync(ct);
}

// Remarque : la même chose en LINQ pur est souvent plus simple
// db.Products.Where(p => EF.Functions.Like(p.Name, "%" + term + "%"))`
    },
    {
      level: "difficile",
      title: "Réservation de stock sans survente",
      prompt: "<p>Écris <code>ReserveAsync(int orderId)</code> : pour chaque ligne de la commande, réserve le stock du produit. Si un seul produit manque, rien ne doit être réservé et la commande reste <code>Pending</code>. Sinon la commande passe en <code>Confirmed</code>. Utilise <code>ExecuteUpdateAsync</code> pour les décréments et garantis l'atomicité de l'ensemble.</p>",
      hint: "<p><code>ExecuteUpdate</code> s'exécute immédiatement, hors de <code>SaveChanges</code> : ouvre une transaction explicite, et annule-la dès qu'un décrément renvoie 0. Pense à l'ExecutionStrategy si le retry est activé.</p>",
      solution: `public async Task<bool> ReserveAsync(int orderId, CancellationToken ct)
{
    var strategy = db.Database.CreateExecutionStrategy();
    return await strategy.ExecuteAsync(async () =>
    {
        db.ChangeTracker.Clear();
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        var order = await db.Orders.Include(o => o.Lines).SingleAsync(o => o.Id == orderId, ct);
        if (order.Status != OrderStatus.Pending) return false;

        foreach (var line in order.Lines)
        {
            var rows = await db.Products
                .Where(p => p.Id == line.ProductId && p.Stock >= line.Quantity)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - line.Quantity), ct);

            if (rows == 0)
            {
                await tx.RollbackAsync(ct); // annule aussi les décréments déjà faits
                return false;
            }
        }

        order.Status = OrderStatus.Confirmed;
        await db.SaveChangesAsync(ct); // participe à la même transaction
        await tx.CommitAsync(ct);
        return true;
    });
}`
    }
  ],
  project: "<p>Dans <code>OrderFlow.Data.Ef</code> :</p><ul><li>Ajoute <code>RowVersion</code> sur <code>Product</code>, expose-la dans <code>ProductDto</code> et gère le 409 sur <code>PUT /products/{id}</code>.</li><li>Remplace la logique « lire le stock puis le décrémenter » de <code>PlaceOrderAsync</code> par un décrément atomique avec <code>ExecuteUpdateAsync</code>.</li><li>Ajoute un endpoint d'administration <code>POST /categories/{id}/price-increase</code> qui applique un pourcentage à tous les produits de la catégorie en une seule instruction, et renvoie le nombre de produits modifiés.</li><li>Crée la vue <code>vw_MonthlySales</code> dans une migration et expose <code>GET /reports/monthly-sales</code>.</li></ul>",
  resources: [
    { label: "Gestion des conflits de concurrence", url: "https://learn.microsoft.com/ef/core/saving/concurrency" },
    { label: "Requêtes SQL brutes", url: "https://learn.microsoft.com/ef/core/querying/sql-queries" },
    { label: "ExecuteUpdate et ExecuteDelete", url: "https://learn.microsoft.com/ef/core/saving/execute-insert-update-delete" },
    { label: "Types d'entités sans clé", url: "https://learn.microsoft.com/ef/core/modeling/keyless-entity-types" }
  ]
});

window.COURSE.push({
  key: "e-advanced-modeling",
  title: "Modélisation avancée",
  summary: "Value objects, héritage, filtres globaux, propriétés d'ombre, interceptors et colonnes JSON : les outils qui permettent à EF Core de suivre un vrai modèle métier.",
  objectives: [
    "Mapper des value objects avec owned types ou complex types et savoir lequel choisir",
    "Choisir entre TPH, TPT et TPC pour une hiérarchie d'héritage",
    "Mettre en place un soft delete et un filtre multi-tenant avec les global query filters",
    "Utiliser des shadow properties pour les colonnes techniques",
    "Écrire un SaveChangesInterceptor d'audit et un DbCommandInterceptor de requêtes lentes",
    "Stocker des données en JSON et des collections primitives, définir des conventions globales"
  ],
  lesson: `<h3>Value objects : owned types ou complex types</h3>
<p>En DDD (vu en semaine 3), un <strong>value object</strong> n'a pas d'identité propre : une <code>Address</code> ou un <code>Money</code> se définit uniquement par ses valeurs. Deux adresses identiques sont interchangeables. En base, on ne veut pas de table <code>Addresses</code> avec un id : on veut des colonnes <code>ShippingAddress_Street</code>, <code>ShippingAddress_City</code> dans la table <code>Orders</code>. EF Core propose deux mécanismes.</p>
<p>Les <strong>owned types</strong> (<code>OwnsOne</code>, <code>OwnsMany</code>) existent depuis EF Core 2. Ils sont stockés dans la table du propriétaire (ou dans une table séparée pour <code>OwnsMany</code>). Leur défaut : EF les traite en interne comme des entités avec une clé cachée. Ils ont donc une sémantique d'identité, tu ne peux pas partager une même instance entre deux propriétaires, et un <code>record</code> immuable demande des contorsions.</p>
<p>Les <strong>complex types</strong> (<code>ComplexProperty</code>, ou l'attribut <code>[ComplexType]</code>), apparus avec EF Core 8, ont une vraie sémantique de valeur : pas de clé cachée, comparaison par valeur, compatibles avec les <code>record</code> immuables qu'on remplace par une nouvelle instance. Les dernières versions d'EF Core ont élargi leur support (complex types optionnels, collections stockées en JSON). Vérifie les possibilités de ta version dans la page « What's new » avant de t'appuyer sur ces fonctions récentes.</p>
<table>
<thead><tr><th>Critère</th><th>Owned type</th><th>Complex type</th></tr></thead>
<tbody>
<tr><td>Sémantique</td><td>Entité déguisée (clé cachée)</td><td>Valeur pure</td></tr>
<tr><td>Records immuables</td><td>Possible mais fragile</td><td>Naturel</td></tr>
<tr><td>Partager une instance</td><td>Interdit</td><td>Autorisé</td></tr>
<tr><td>Collections</td><td><code>OwnsMany</code> (table séparée ou JSON)</td><td>Selon la version, via JSON</td></tr>
<tr><td>Recommandation</td><td>Code existant, collections</td><td>Nouveau value object simple</td></tr>
</tbody>
</table>

<p>Il existe une troisième option pour un value object qui ne contient qu'<strong>une seule valeur</strong> (un <code>Sku</code>, un <code>Email</code>, un <code>OrderId</code> fortement typé) : la <strong>value conversion</strong>, vue au jour sur la modélisation. <code>HasConversion(v =&gt; v.Value, s =&gt; new Sku(s))</code> stocke la valeur dans une colonne simple, sans préfixe de nom. Elle a une limite : EF ne voit pas l'intérieur de l'objet, donc tu ne peux pas écrire <code>p.Sku.Value.StartsWith("KB")</code> dans une requête et espérer une traduction en SQL. Règle pratique : value conversion pour un type à une valeur, complex type pour un type à plusieurs valeurs, owned type pour les cas que les complex types ne couvrent pas encore dans ta version.</p>

<h3>L'héritage : TPH, TPT, TPC</h3>
<p>Imagine une hiérarchie de paiements : <code>Payment</code> abstrait, puis <code>CardPayment</code> (4 derniers chiffres), <code>BankTransferPayment</code> (IBAN) et <code>PayPalPayment</code> (email). EF Core propose trois stratégies de mapping.</p>
<ul>
<li><strong>TPH</strong> (Table Per Hierarchy, par défaut) : une seule table <code>Payments</code> avec toutes les colonnes de toutes les classes, plus une colonne <strong>discriminateur</strong> qui indique le type de chaque ligne. Les colonnes propres à une sous-classe sont nullables.</li>
<li><strong>TPT</strong> (Table Per Type) : une table pour la base et une table par sous-classe, reliées par la clé primaire. Lire un paiement demande une jointure, et une requête sur <code>Payment</code> joint toutes les tables.</li>
<li><strong>TPC</strong> (Table Per Concrete type, EF Core 7+) : une table complète par classe concrète, sans table de base. Lire une sous-classe se fait sans jointure, mais une requête sur la base fait un <code>UNION ALL</code>, et les identifiants doivent être uniques sur toutes les tables (EF utilise une séquence).</li>
</ul>
<table>
<thead><tr><th>Stratégie</th><th>Lecture d'un type précis</th><th>Lecture polymorphe</th><th>Schéma</th><th>Quand la choisir</th></tr></thead>
<tbody>
<tr><td>TPH</td><td>Rapide (un filtre)</td><td>Rapide (une table)</td><td>Colonnes nullables, table large</td><td>Par défaut, la plus performante en général</td></tr>
<tr><td>TPT</td><td>Une jointure</td><td>Jointures sur toutes les tables</td><td>Normalisé, propre</td><td>Rarement : quand le schéma normalisé est imposé</td></tr>
<tr><td>TPC</td><td>Rapide (une table)</td><td><code>UNION ALL</code></td><td>Colonnes non nulles, ids partagés</td><td>On lit surtout des types précis</td></tr>
</tbody>
</table>
<p>L'équipe EF recommande TPH par défaut, TPC si tu requêtes surtout des types concrets, et TPT seulement s'il est imposé par un schéma existant.</p>

<h3>Global query filters : soft delete et multi-tenant</h3>
<p>Un <strong>filtre global</strong> (<code>HasQueryFilter</code>) est une condition ajoutée automatiquement à toutes les requêtes sur un type d'entité, y compris dans les <code>Include</code>. Deux usages classiques :</p>
<ul>
<li><strong>Soft delete</strong> : on ne supprime plus les lignes, on positionne <code>IsDeleted = true</code>. Le filtre <code>p =&gt; !p.IsDeleted</code> masque les lignes supprimées partout. On intercepte les suppressions pour les transformer en mise à jour (voir l'interceptor plus bas).</li>
<li><strong>Multi-tenant</strong> : chaque ligne porte un <code>TenantId</code> et le filtre compare avec le tenant courant, lu depuis une propriété du <code>DbContext</code> alimentée par un service scoped (le tenant de l'utilisateur connecté).</li>
</ul>
<p><code>IgnoreQueryFilters()</code> désactive le filtre pour une requête : pour un écran d'administration ou une restauration. Les versions récentes d'EF Core permettent de <strong>nommer</strong> les filtres pour n'en désactiver qu'un seul. Sinon, tu dois combiner les deux conditions dans un seul <code>HasQueryFilter</code>, car un second appel remplace le premier. Attention : un filtre sur une entité requise dans une relation peut faire disparaître le parent d'un <code>Include</code>. Rends la navigation optionnelle ou filtre aussi le parent.</p>

<h3>Shadow properties</h3>
<p>Une <strong>shadow property</strong> est une colonne qui existe dans le modèle EF et dans la table, mais pas dans ta classe C#. C'est idéal pour les colonnes techniques qui ne concernent pas le domaine : <code>CreatedAt</code>, <code>UpdatedAt</code>, <code>CreatedBy</code>. On la déclare avec <code>Property&lt;DateTime&gt;("CreatedAt")</code>, on la lit et l'écrit via <code>Entry(e).Property("CreatedAt")</code>, et on l'utilise dans une requête avec <code>EF.Property&lt;DateTime&gt;(o, "CreatedAt")</code>. Les clés étrangères sans propriété dans la classe sont d'ailleurs déjà des shadow properties.</p>

<h3>Interceptors</h3>
<p>Les <strong>interceptors</strong> permettent d'exécuter du code autour des opérations d'EF Core. Ils s'enregistrent avec <code>AddInterceptors(...)</code> dans la configuration, et peuvent venir de la DI.</p>
<ul>
<li><code>SaveChangesInterceptor</code> : avant ou après <code>SaveChanges</code>. C'est l'endroit idéal pour l'audit (remplir <code>CreatedAt</code>, <code>UpdatedAt</code>, <code>CreatedBy</code>), le soft delete (transformer <code>Deleted</code> en <code>Modified</code> avec <code>IsDeleted = true</code>), ou la publication d'événements de domaine.</li>
<li><code>DbCommandInterceptor</code> : autour de chaque commande SQL. Utile pour journaliser les requêtes lentes (<code>eventData.Duration</code>), ajouter un commentaire ou un indice de requête.</li>
<li><code>DbConnectionInterceptor</code> et <code>DbTransactionInterceptor</code> : à l'ouverture des connexions (par exemple pour injecter un jeton Azure AD) et autour des transactions.</li>
</ul>
<p>Rappel du jour précédent : <code>ExecuteUpdate</code> et <code>ExecuteDelete</code> ne passent pas par <code>SaveChanges</code>, donc pas par ces interceptors.</p>

<h3>Colonnes JSON et collections primitives</h3>
<p>EF Core sait stocker un objet ou une collection dans une seule colonne JSON avec <code>OwnsOne(..., b =&gt; b.ToJson())</code>, tout en permettant de filtrer sur ses propriétés en LINQ : EF traduit ces filtres en <code>JSON_VALUE</code> sur SQL Server. C'est pratique pour des métadonnées semi-structurées (options d'une commande, préférences d'un client). Depuis EF Core 8, une propriété de type <code>List&lt;string&gt;</code> ou <code>int[]</code> est mappée automatiquement sur une colonne JSON, et <code>Contains</code> se traduit en <code>OPENJSON</code>. N'en abuse pas : ce qui est requêté souvent, indexé ou relié à d'autres tables mérite de vraies colonnes.</p>

<h3>Conventions personnalisées</h3>
<p>Plutôt que de répéter <code>HasPrecision(18, 2)</code> sur chaque <code>decimal</code>, on définit des règles globales dans <code>ConfigureConventions</code> : <code>Properties&lt;decimal&gt;().HavePrecision(18, 2)</code>, <code>Properties&lt;string&gt;().HaveMaxLength(200)</code>, ou une conversion pour tous les types d'un value object (<code>Properties&lt;Sku&gt;().HaveConversion&lt;SkuConverter&gt;()</code>). La configuration spécifique d'une entité reste prioritaire sur ces conventions. Pour des règles plus fines (nommage en snake_case, par exemple), EF Core permet d'écrire des conventions de modèle complètes en implémentant des interfaces comme <code>IModelFinalizingConvention</code>.</p>

<div class="note">Un senior utilise ces outils pour garder le domaine propre : les value objects en complex types, les colonnes techniques en shadow properties, et les règles transverses (audit, soft delete, tenant) dans des interceptors et des filtres plutôt que copiées dans chaque service. Il connaît aussi leurs angles morts : les filtres globaux sont contournés par le SQL brut et par <code>IgnoreQueryFilters</code>, les interceptors par <code>ExecuteUpdate</code>. Une isolation multi-tenant critique se double donc d'une protection en base (Row-Level Security sur SQL Server).</div>

<h3>Pièges fréquents</h3>
<ul>
<li>Appeler <code>HasQueryFilter</code> deux fois sur la même entité : le second appel remplace le premier, sauf avec des filtres nommés.</li>
<li>Oublier qu'un index unique doit tenir compte du soft delete (<code>HasFilter("[IsDeleted] = 0")</code>), sinon on ne peut plus recréer un produit avec le même SKU.</li>
<li>Choisir TPT par goût du schéma normalisé, puis découvrir des requêtes à cinq jointures.</li>
<li>Mettre en JSON des données qu'on filtre et trie en permanence.</li>
<li>Lire l'utilisateur courant via <code>IHttpContextAccessor</code> dans un interceptor singleton sans gérer le cas hors requête HTTP (worker, migrations).</li>
</ul>`,
  examples: [
    {
      title: "Value objects Money et Address en complex types",
      code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public sealed record Money(decimal Amount, string Currency)
{
    public static Money Eur(decimal amount) => new(amount, "EUR");
    public Money Add(Money other) =>
        other.Currency == Currency ? this with { Amount = Amount + other.Amount }
                                   : throw new InvalidOperationException("Devises différentes");
}

public sealed record Address(string Street, string City, string PostalCode, string Country);

public class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public OrderStatus Status { get; set; }
    public Address ShippingAddress { get; set; } = null!;
    public Money Total { get; set; } = Money.Eur(0);
    public List<OrderLine> Lines { get; } = [];
}

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.ComplexProperty(o => o.ShippingAddress, a =>
        {
            a.Property(x => x.Street).HasMaxLength(200);
            a.Property(x => x.City).HasMaxLength(100);
            a.Property(x => x.PostalCode).HasMaxLength(20);
            a.Property(x => x.Country).HasMaxLength(2);
        });
        b.ComplexProperty(o => o.Total, m =>
        {
            m.Property(x => x.Amount).HasColumnName("TotalAmount").HasPrecision(18, 2);
            m.Property(x => x.Currency).HasColumnName("TotalCurrency").HasMaxLength(3);
        });
    }
}

// Table générée : Orders(Id, CustomerId, Status, ShippingAddress_Street, ShippingAddress_City,
//                        ShippingAddress_PostalCode, ShippingAddress_Country, TotalAmount, TotalCurrency)

// Utilisation : on remplace la valeur, on ne la modifie pas
order.ShippingAddress = order.ShippingAddress with { City = "Lyon" };
var parisOrders = await db.Orders.Where(o => o.ShippingAddress.City == "Paris").ToListAsync();`,
      explain: "Les records immuables s'utilisent naturellement : on remplace la valeur avec <code>with</code>, et EF détecte le changement en comparant les valeurs."
    },
    {
      title: "Héritage : TPH par défaut, TPC en une ligne",
      code: `public abstract class Payment
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaidAt { get; set; }
}
public sealed class CardPayment : Payment { public string Last4 { get; set; } = ""; }
public sealed class BankTransferPayment : Payment { public string Iban { get; set; } = ""; }
public sealed class PayPalPayment : Payment { public string PayerEmail { get; set; } = ""; }

// OnModelCreating : TPH avec discriminateur explicite
modelBuilder.Entity<Payment>()
    .HasDiscriminator<string>("PaymentType")
    .HasValue<CardPayment>("card")
    .HasValue<BankTransferPayment>("transfer")
    .HasValue<PayPalPayment>("paypal");
modelBuilder.Entity<CardPayment>();
modelBuilder.Entity<BankTransferPayment>();
modelBuilder.Entity<PayPalPayment>();
// Table Payments(Id, OrderId, Amount, PaidAt, PaymentType, Last4 NULL, Iban NULL, PayerEmail NULL)

// Variante TPC (une table par classe concrète, ids issus d'une séquence)
// modelBuilder.Entity<Payment>().UseTpcMappingStrategy();
// Variante TPT
// modelBuilder.Entity<Payment>().UseTptMappingStrategy();

// Requêtes
var all = await db.Set<Payment>().Where(p => p.OrderId == 42).ToListAsync(); // polymorphe
var cards = await db.Set<Payment>().OfType<CardPayment>().ToListAsync();
// TPH : SELECT ... FROM Payments WHERE PaymentType = N'card'

foreach (var p in all)
{
    var label = p switch
    {
        CardPayment c => $"Carte ****{c.Last4}",
        BankTransferPayment t => $"Virement {t.Iban}",
        PayPalPayment pp => $"PayPal {pp.PayerEmail}",
        _ => "Inconnu"
    };
    Console.WriteLine($"{p.Amount} : {label}");
}`,
      explain: "EF instancie la bonne sous-classe pour chaque ligne grâce au discriminateur. Le changement de stratégie ne modifie que la configuration, pas les requêtes."
    },
    {
      title: "Soft delete et multi-tenant avec des filtres globaux",
      code: `public interface ISoftDeletable { bool IsDeleted { get; set; } }
public interface ITenantOwned { string TenantId { get; set; } }

public class Product : ISoftDeletable, ITenantOwned
{
    public int Id { get; set; }
    public string Sku { get; set; } = "";
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public bool IsDeleted { get; set; }
    public string TenantId { get; set; } = "";
}

public interface ITenantProvider { string TenantId { get; } }

public class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options, ITenantProvider tenant)
    : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
    public string TenantId => tenant.TenantId;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Un seul filtre qui combine les deux règles (un second HasQueryFilter remplacerait le premier)
        modelBuilder.Entity<Product>()
            .HasQueryFilter(p => !p.IsDeleted && p.TenantId == TenantId);

        // Index unique qui ignore les lignes supprimées
        modelBuilder.Entity<Product>()
            .HasIndex(p => new { p.TenantId, p.Sku })
            .IsUnique()
            .HasFilter("[IsDeleted] = 0");
    }
}

// Requêtes : le filtre est appliqué partout automatiquement
var visible = await db.Products.ToListAsync();
// WHERE [p].[IsDeleted] = CAST(0 AS bit) AND [p].[TenantId] = @TenantId

// Écran d'administration : voir aussi les produits supprimés
var withDeleted = await db.Products.IgnoreQueryFilters()
    .Where(p => p.TenantId == db.TenantId)   // attention : le filtre tenant a aussi sauté
    .ToListAsync();`,
      explain: "<code>TenantId</code> est lu à chaque exécution de requête depuis l'instance courante du contexte : EF le paramètre, il n'est pas figé dans le modèle."
    },
    {
      title: "Shadow properties et interceptor d'audit avec soft delete",
      code: `using Microsoft.EntityFrameworkCore.Diagnostics;

// OnModelCreating : colonnes techniques absentes des classes
foreach (var type in modelBuilder.Model.GetEntityTypes().Where(t => !t.IsOwned() && t.ClrType != typeof(MonthlySales)))
{
    modelBuilder.Entity(type.ClrType).Property<DateTime>("CreatedAt");
    modelBuilder.Entity(type.ClrType).Property<DateTime?>("UpdatedAt");
    modelBuilder.Entity(type.ClrType).Property<string?>("UpdatedBy").HasMaxLength(100);
}

public interface ICurrentUser { string? Name { get; } }

public sealed class AuditInterceptor(TimeProvider clock, ICurrentUser user) : SaveChangesInterceptor
{
    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct = default)
    {
        if (eventData.Context is not { } db) return base.SavingChangesAsync(eventData, result, ct);
        var now = clock.GetUtcNow().UtcDateTime;

        foreach (var entry in db.ChangeTracker.Entries())
        {
            // Soft delete : une suppression devient une mise à jour
            if (entry is { State: EntityState.Deleted, Entity: ISoftDeletable soft })
            {
                entry.State = EntityState.Modified;
                soft.IsDeleted = true;
            }

            if (entry.Metadata.FindProperty("CreatedAt") is null) continue;
            if (entry.State == EntityState.Added)
                entry.Property("CreatedAt").CurrentValue = now;
            if (entry.State is EntityState.Added or EntityState.Modified)
            {
                entry.Property("UpdatedAt").CurrentValue = now;
                entry.Property("UpdatedBy").CurrentValue = user.Name ?? "system";
            }
        }
        return base.SavingChangesAsync(eventData, result, ct);
    }
}

// Program.cs
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<AuditInterceptor>();
builder.Services.AddDbContext<OrderFlowDbContext>((sp, o) => o
    .UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow"))
    .AddInterceptors(sp.GetRequiredService<AuditInterceptor>()));

// Requête sur une shadow property
var recent = await db.Orders
    .Where(o => EF.Property<DateTime>(o, "CreatedAt") > DateTime.UtcNow.AddDays(-7))
    .ToListAsync();`,
      explain: "L'interceptor est scoped pour pouvoir recevoir l'utilisateur de la requête courante. <code>db.Remove(product)</code> produit désormais un <code>UPDATE ... SET IsDeleted = 1</code>."
    },
    {
      title: "Requêtes lentes, colonnes JSON, collections primitives et conventions",
      code: `using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;

// 1. Journaliser les requêtes de plus de 300 ms
public sealed class SlowQueryInterceptor(ILogger<SlowQueryInterceptor> logger) : DbCommandInterceptor
{
    private static readonly TimeSpan Threshold = TimeSpan.FromMilliseconds(300);

    public override ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command, CommandExecutedEventData eventData, DbDataReader result, CancellationToken ct = default)
    {
        if (eventData.Duration > Threshold)
            logger.LogWarning("Requête lente ({Ms} ms) : {Sql}", eventData.Duration.TotalMilliseconds, command.CommandText);
        return base.ReaderExecutedAsync(command, eventData, result, ct);
    }
}

// 2. Colonne JSON et collection primitive
public sealed class OrderOptions
{
    public bool GiftWrap { get; set; }
    public string? GiftMessage { get; set; }
    public string? DeliverySlot { get; set; }
}

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public List<string> Tags { get; set; } = [];        // colonne JSON automatique (EF Core 8+)
}

// Dans OrderConfiguration : b.OwnsOne(o => o.Options, o => o.ToJson());
var gifts = await db.Orders.Where(o => o.Options.GiftWrap).ToListAsync();
// WHERE CAST(JSON_VALUE([o].[Options], '$.GiftWrap') AS bit) = CAST(1 AS bit)
var vips = await db.Customers.Where(c => c.Tags.Contains("vip")).ToListAsync();
// WHERE N'vip' IN (SELECT [t].[value] FROM OPENJSON([c].[Tags]) WITH ([value] nvarchar(max) '$') AS [t])

// 3. Conventions globales dans le DbContext
protected override void ConfigureConventions(ModelConfigurationBuilder b)
{
    b.Properties<decimal>().HavePrecision(18, 2);
    b.Properties<string>().HaveMaxLength(200);   // une configuration explicite d'entité reste prioritaire
    b.Properties<DateTime>().HaveColumnType("datetime2");
}`,
      explain: "Avec la convention de longueur, toutes les chaînes deviennent <code>nvarchar(200)</code> au lieu de <code>nvarchar(max)</code>, ce qui les rend indexables. Une colonne qui doit rester longue se configure explicitement."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Value object Email",
      prompt: "<p>Crée un <code>record Email</code> qui valide son format dans son constructeur (présence d'un <code>@</code>, longueur maximale 254) et mappe-le sur <code>Customer.Email</code> en complex type, dans une colonne nommée <code>Email</code>.</p>",
      hint: "<p>Utilise un record avec un constructeur explicite qui lève une <code>ArgumentException</code>. Dans la configuration : <code>ComplexProperty(c =&gt; c.Email, e =&gt; e.Property(x =&gt; x.Value).HasColumnName(\"Email\"))</code>.</p>",
      solution: `public sealed record Email
{
    public string Value { get; }

    public Email(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.Contains('@') || value.Length > 254)
            throw new ArgumentException($"Email invalide : {value}", nameof(value));
        Value = value.Trim().ToLowerInvariant();
    }

    public override string ToString() => Value;
}

public class Customer
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public Email Email { get; set; } = null!;
}

public sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> b)
    {
        b.ComplexProperty(c => c.Email, e =>
            e.Property(x => x.Value).HasColumnName("Email").HasMaxLength(254).IsRequired());
    }
}

// Remarque : un value object à une seule valeur peut aussi se mapper
// avec une value conversion : b.Property(c => c.Email).HasConversion(e => e.Value, v => new Email(v));`
    },
    {
      level: "moyen",
      title: "Corbeille : restaurer un produit supprimé",
      prompt: "<p>Avec le soft delete mis en place dans les exemples, écris deux endpoints : <code>GET /admin/products/trash</code> qui liste les produits supprimés du tenant courant, et <code>POST /admin/products/{id}/restore</code> qui les restaure. Vérifie que la restauration échoue proprement (409) si un produit actif utilise déjà le même SKU.</p>",
      hint: "<p>Il faut <code>IgnoreQueryFilters()</code>, mais cela retire aussi le filtre tenant : remets la condition sur <code>TenantId</code> à la main. Pour le conflit, l'index unique filtré lève une <code>DbUpdateException</code> ; tu peux aussi vérifier avant avec <code>AnyAsync</code>.</p>",
      solution: `app.MapGet("/admin/products/trash", async (OrderFlowDbContext db, CancellationToken ct) =>
    await db.Products.IgnoreQueryFilters()
        .Where(p => p.TenantId == db.TenantId && p.IsDeleted)
        .Select(p => new { p.Id, p.Sku, p.Name })
        .ToListAsync(ct));

app.MapPost("/admin/products/{id:int}/restore", async (int id, OrderFlowDbContext db, CancellationToken ct) =>
{
    var product = await db.Products.IgnoreQueryFilters()
        .SingleOrDefaultAsync(p => p.Id == id && p.TenantId == db.TenantId && p.IsDeleted, ct);
    if (product is null) return Results.NotFound();

    // Vérification lisible ; l'index unique filtré reste le garde-fou en cas de course
    if (await db.Products.AnyAsync(p => p.Sku == product.Sku, ct))
        return Results.Conflict(new { error = $"Un produit actif utilise déjà le SKU {product.Sku}." });

    product.IsDeleted = false;
    try
    {
        await db.SaveChangesAsync(ct);
    }
    catch (DbUpdateException)
    {
        return Results.Conflict(new { error = $"Un produit actif utilise déjà le SKU {product.Sku}." });
    }
    return Results.NoContent();
});`
    },
    {
      level: "difficile",
      title: "Journal d'audit des modifications",
      prompt: "<p>Écris un <code>SaveChangesInterceptor</code> qui, pour chaque entité modifiée, ajoute une ligne dans une table <code>AuditLogs</code> (<code>EntityName</code>, <code>EntityId</code>, <code>Action</code>, <code>Changes</code> en JSON avec ancienne et nouvelle valeur, <code>ChangedBy</code>, <code>ChangedAt</code>). Les lignes d'audit doivent être enregistrées dans la même transaction que les modifications. Pour les entités ajoutées, l'id n'est connu qu'après l'insertion : gère ce cas.</p>",
      hint: "<p>Dans <code>SavingChangesAsync</code>, calcule les audits et ajoute-les au contexte : ils partent dans le même <code>SaveChanges</code>, donc dans la même transaction. Pour les entités <code>Added</code>, garde une référence à l'<code>EntityEntry</code> et complète l'id dans <code>SavedChangesAsync</code>, puis fais un second <code>SaveChanges</code>, ou accepte une transaction explicite autour des deux.</p>",
      solution: `using System.Text.Json;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

public sealed class AuditLog
{
    public long Id { get; set; }
    public string EntityName { get; set; } = "";
    public string EntityId { get; set; } = "";
    public string Action { get; set; } = "";
    public string Changes { get; set; } = "";
    public string ChangedBy { get; set; } = "";
    public DateTime ChangedAt { get; set; }
}

public sealed class AuditLogInterceptor(ICurrentUser user, TimeProvider clock) : SaveChangesInterceptor
{
    // Audits en attente d'un id (entités ajoutées)
    private readonly List<(EntityEntry Entry, AuditLog Log)> _pending = [];

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData, InterceptionResult<int> result, CancellationToken ct = default)
    {
        if (eventData.Context is not { } db) return base.SavingChangesAsync(eventData, result, ct);
        _pending.Clear();
        var now = clock.GetUtcNow().UtcDateTime;

        var entries = db.ChangeTracker.Entries()
            .Where(e => e.Entity is not AuditLog && e.State is EntityState.Added or EntityState.Modified or EntityState.Deleted)
            .ToList();

        foreach (var entry in entries)
        {
            var changes = entry.Properties
                .Where(p => entry.State != EntityState.Modified || p.IsModified)
                .ToDictionary(
                    p => p.Metadata.Name,
                    p => new
                    {
                        Old = entry.State == EntityState.Added ? null : p.OriginalValue,
                        New = entry.State == EntityState.Deleted ? null : p.CurrentValue
                    });

            var log = new AuditLog
            {
                EntityName = entry.Metadata.ClrType.Name,
                EntityId = KeyOf(entry),
                Action = entry.State.ToString(),
                Changes = JsonSerializer.Serialize(changes),
                ChangedBy = user.Name ?? "system",
                ChangedAt = now
            };
            db.Add(log); // part dans le même SaveChanges, donc la même transaction

            if (entry.State == EntityState.Added) _pending.Add((entry, log));
        }
        return base.SavingChangesAsync(eventData, result, ct);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData, int result, CancellationToken ct = default)
    {
        if (_pending.Count > 0 && eventData.Context is { } db)
        {
            // Les ids générés sont maintenant connus
            foreach (var (entry, log) in _pending) log.EntityId = KeyOf(entry);
            _pending.Clear();
            // Limite : second aller-retour hors de la première transaction implicite.
            // Si l'atomicité compte, l'appelant enveloppe SaveChanges dans une transaction explicite.
            await db.SaveChangesAsync(ct);
        }
        return await base.SavedChangesAsync(eventData, result, ct);
    }

    private static string KeyOf(EntityEntry entry) =>
        string.Join(",", entry.Metadata.FindPrimaryKey()!.Properties.Select(p => entry.Property(p.Name).CurrentValue));
}

// Enregistrement : scoped, car il garde un état par contexte
// builder.Services.AddScoped<AuditLogInterceptor>();
// o.AddInterceptors(sp.GetRequiredService<AuditLogInterceptor>());`
    }
  ],
  project: "<p>Dans <code>OrderFlow.Data.Ef</code> :</p><ul><li>Transforme <code>Money</code> (prix produit, prix unitaire des lignes, total de commande) et <code>Address</code> (adresse de livraison) en records mappés en complex types. Génère la migration et vérifie le nom des colonnes.</li><li>Ajoute le soft delete sur <code>Product</code> et <code>Customer</code> avec un filtre global, un index unique filtré sur le SKU, et l'interceptor qui transforme les suppressions.</li><li>Ajoute les shadow properties <code>CreatedAt</code>, <code>UpdatedAt</code>, <code>UpdatedBy</code> sur toutes les entités et l'interceptor d'audit qui les remplit.</li><li>Enregistre le <code>SlowQueryInterceptor</code> avec un seuil lu depuis la configuration.</li></ul>",
  resources: [
    { label: "Owned entity types", url: "https://learn.microsoft.com/ef/core/modeling/owned-entities" },
    { label: "Complex types (nouveautés EF Core 8)", url: "https://learn.microsoft.com/ef/core/what-is-new/ef-core-8.0/whatsnew" },
    { label: "Héritage : TPH, TPT, TPC", url: "https://learn.microsoft.com/ef/core/modeling/inheritance" },
    { label: "Global query filters", url: "https://learn.microsoft.com/ef/core/querying/filters" },
    { label: "Shadow properties", url: "https://learn.microsoft.com/ef/core/modeling/shadow-properties" },
    { label: "Interceptors", url: "https://learn.microsoft.com/ef/core/logging-events-diagnostics/interceptors" },
    { label: "Conventions de modèle", url: "https://learn.microsoft.com/ef/core/modeling/bulk-configuration" }
  ]
});

window.COURSE.push({
  key: "e-performance",
  title: "Performance d'EF Core",
  summary: "Mesurer avant d'optimiser, puis appliquer les corrections qui comptent vraiment : projections, index, pagination keyset, split queries, pooling et requêtes compilées.",
  objectives: [
    "Mesurer une requête : SQL généré, durée, plan d'exécution, Query Store",
    "Réduire les données transférées avec des projections et AsNoTracking",
    "Remplacer la pagination par offset par une pagination keyset",
    "Ajouter les bons index depuis le modèle EF (HasIndex, index couvrants, filtrés)",
    "Utiliser compiled queries et DbContext pooling en connaissant leur gain réel",
    "Éviter les pièges d'écriture : SaveChanges en boucle, Include en cascade, grandes listes Contains"
  ],
  lesson: `<h3>Règle n° 1 : mesurer d'abord</h3>
<p>La plupart des problèmes de performance avec EF Core ne viennent pas d'EF lui-même, mais du SQL qu'on lui fait générer : trop de colonnes, trop de lignes, trop d'allers-retours, ou un index manquant. Avant de toucher au code, il faut voir.</p>
<ul>
<li><strong>Le SQL généré</strong> : <code>LogTo(Console.WriteLine, LogLevel.Information)</code> en développement, ou la catégorie <code>Microsoft.EntityFrameworkCore.Database.Command</code> dans la configuration de logging. Chaque commande est affichée avec sa durée. <code>ToQueryString()</code> sur un <code>IQueryable</code> donne le SQL sans l'exécuter.</li>
<li><strong>Les durées en contexte</strong> : un outil comme MiniProfiler, ou les traces OpenTelemetry vues au jour consacré à l'observabilité, montrent combien de requêtes part chaque requête HTTP. C'est là qu'on repère les N+1.</li>
<li><strong>Le plan d'exécution</strong> : copie le SQL dans SSMS ou Azure Data Studio, active « Inclure le plan d'exécution réel ». Un <em>Index Scan</em> ou <em>Clustered Index Scan</em> sur une grosse table, un <em>Key Lookup</em> répété ou un avertissement d'index manquant indiquent le problème.</li>
<li><strong>Query Store</strong> (SQL Server 2016+) : enregistre l'historique des requêtes et de leurs plans en production. On y trouve les requêtes les plus coûteuses et les régressions de plan, sans rien changer à l'application.</li>
</ul>
<p>Prends une mesure de référence, change une seule chose, remesure. Une optimisation qui ne se mesure pas est une supposition.</p>

<h3>Lire moins de données</h3>
<p>Charger une entité complète alors que l'écran affiche trois champs coûte du réseau, de la mémoire, du temps de matérialisation, et le suivi du change tracker. La <strong>projection</strong> (<code>Select</code> vers un DTO) est l'optimisation la plus rentable d'EF Core : SQL ne lit que les colonnes demandées, aucune entité n'est suivie, et les sous-collections deviennent des agrégats calculés côté SQL (<code>Count()</code>, <code>Sum()</code>) au lieu d'être chargées. Quand tu as vraiment besoin d'entités en lecture seule, ajoute <code>AsNoTracking()</code>.</p>

<p>Attention aussi à <strong>l'évaluation côté client</strong>. Depuis EF Core 3, une expression non traduisible dans un <code>Where</code> lève une exception au lieu d'être exécutée silencieusement en mémoire. C'est une protection, mais on la contourne souvent par réflexe avec un <code>AsEnumerable()</code> ou un <code>ToList()</code> placé trop tôt : la requête charge alors toute la table avant de filtrer. Avant d'ajouter un <code>AsEnumerable()</code>, cherche une écriture traduisible (<code>EF.Functions.Like</code>, une plage de dates au lieu de <code>.Date</code>, une propriété calculée stockée en colonne).</p>

<h3>Pagination : offset ou keyset</h3>
<p>La pagination classique <code>Skip((page - 1) * size).Take(size)</code> se traduit en <code>OFFSET ... FETCH</code>. Pour la page 5 000, SQL Server doit lire et jeter 100 000 lignes avant de renvoyer les 20 suivantes : le coût augmente avec le numéro de page. De plus, si des lignes sont insérées pendant que l'utilisateur pagine, il voit des doublons ou en saute.</p>
<p>La <strong>pagination keyset</strong> (ou par curseur) mémorise la dernière clé vue et demande les lignes suivantes : <code>Where(p =&gt; p.Id &gt; lastId).OrderBy(p =&gt; p.Id).Take(20)</code>. Avec un index sur la clé de tri, le coût est constant quelle que soit la profondeur. Pour un tri non unique (par date), on trie sur deux colonnes (date, puis id) et la condition devient <code>date &gt; lastDate || (date == lastDate &amp;&amp; id &gt; lastId)</code>. Limite : on ne peut pas sauter directement à la page 37, ce qui convient au défilement infini et aux API.</p>

<h3>Les index, depuis le modèle</h3>
<p>EF crée automatiquement un index sur chaque clé étrangère, pas sur les colonnes que tu filtres ou tries. Déclare-les avec <code>HasIndex</code> : <code>IsUnique()</code> pour une contrainte métier (SKU), plusieurs colonnes pour un filtre composé (l'ordre compte : la colonne la plus filtrée en premier), <code>IncludeProperties</code> (SQL Server) pour un <strong>index couvrant</strong> qui évite le <em>Key Lookup</em>, et <code>HasFilter</code> pour un index filtré (par exemple seulement les commandes en attente). Chaque index accélère les lectures mais ralentit les écritures et occupe de l'espace : on les ajoute pour des requêtes réelles et mesurées.</p>

<h3>Include, explosion cartésienne et split queries</h3>
<p>Un <code>Include</code> de plusieurs collections au même niveau (<code>Include(o =&gt; o.Lines).Include(o =&gt; o.Payments)</code>) produit des jointures qui multiplient les lignes : 20 lignes × 5 paiements = 100 lignes renvoyées pour une seule commande. C'est l'<strong>explosion cartésienne</strong>, et EF émet un avertissement dans les logs. <code>AsSplitQuery()</code> envoie une requête par collection, ce qui supprime la duplication au prix de plusieurs allers-retours et d'une cohérence moindre si les données changent entre deux requêtes. Mieux encore : ne pas charger de graphe du tout et projeter ce dont l'écran a besoin.</p>

<h3>Allers-retours : N+1, chargement en lot et écritures</h3>
<ul>
<li><strong>N+1</strong> : une requête pour la liste, puis une par élément (chargement paresseux, ou requête dans une boucle). La correction : une projection, un <code>Include</code>, ou un chargement en lot.</li>
<li><strong>Chargement en lot</strong> : si tu as une liste d'ids, une seule requête <code>Where(p =&gt; ids.Contains(p.Id))</code> puis un dictionnaire en mémoire, plutôt qu'un <code>FindAsync</code> par id.</li>
<li><strong>Grandes listes Contains</strong> : EF ne colle pas les valeurs dans le SQL. Selon la version, il envoie la liste sous forme de paramètre JSON (<code>OPENJSON</code>) ou de plusieurs paramètres. Au-delà de quelques milliers de valeurs, la requête devient coûteuse : découpe en lots, ou passe par une table temporaire ou un table-valued parameter en ADO.NET.</li>
<li><strong>SaveChanges dans une boucle</strong> : une transaction et un aller-retour par élément. Ajoute tout, puis un seul <code>SaveChanges</code>. Pour des dizaines de milliers de lignes, découpe en lots avec un <code>ChangeTracker.Clear()</code> entre deux, ou utilise <code>SqlBulkCopy</code>.</li>
<li><strong>Mises à jour massives</strong> : <code>ExecuteUpdateAsync</code>, vu au jour 33.</li>
</ul>

<h3>Compiled queries et DbContext pooling</h3>
<p>À chaque exécution, EF doit traduire l'arbre d'expression LINQ en SQL. Il met ce travail en cache, mais calcule quand même une clé de cache à partir de l'arbre. <code>EF.CompileAsyncQuery</code> fait ce travail une seule fois et renvoie un délégué réutilisable. Le gain est réel mais modeste (quelques microsecondes par appel) : il ne compte que pour des requêtes simples exécutées des milliers de fois par seconde.</p>
<p><code>AddDbContextPool</code> réutilise les instances de <code>DbContext</code> au lieu de les créer à chaque requête HTTP : moins d'allocations et de travail d'initialisation. Contraintes : le contexte ne doit pas garder d'état propre à une requête dans ses champs, puisqu'il est réinitialisé puis réutilisé. Un tenant injecté par le constructeur ne fonctionne donc pas tel quel avec le pooling. On peut le combiner avec <code>AddPooledDbContextFactory</code>.</p>

<table>
<thead><tr><th>Symptôme</th><th>Cause probable</th><th>Correction</th></tr></thead>
<tbody>
<tr><td>Des dizaines de requêtes identiques par appel HTTP</td><td>N+1 (lazy loading, requête dans une boucle)</td><td>Projection ou <code>Include</code>, chargement en lot</td></tr>
<tr><td>Une requête renvoie des milliers de lignes pour un seul objet</td><td>Explosion cartésienne (plusieurs <code>Include</code> de collections)</td><td><code>AsSplitQuery()</code> ou projection</td></tr>
<tr><td>Les pages profondes sont de plus en plus lentes</td><td>Pagination par <code>OFFSET</code></td><td>Pagination keyset avec index</td></tr>
<tr><td>Le plan montre un scan de table</td><td>Index manquant sur le filtre ou le tri</td><td><code>HasIndex</code> sur les bonnes colonnes</td></tr>
<tr><td>Le plan montre beaucoup de Key Lookup</td><td>Index non couvrant</td><td><code>IncludeProperties</code> ou projection plus étroite</td></tr>
<tr><td>Forte consommation mémoire en lecture</td><td>Entités complètes suivies</td><td>Projection ou <code>AsNoTracking</code></td></tr>
<tr><td>Import très lent</td><td><code>SaveChanges</code> par élément, change tracker énorme</td><td>Lots + <code>ChangeTracker.Clear()</code>, ou <code>SqlBulkCopy</code></td></tr>
<tr><td>Filtre non traduit, données chargées puis filtrées</td><td>Méthode C# non traduisible après un <code>AsEnumerable</code></td><td>Réécrire le filtre en expression traduisible</td></tr>
</tbody>
</table>

<div class="note">Un senior raisonne en allers-retours, en lignes et en colonnes, pas en « EF est lent ». Face à un endpoint lent, il ouvre les logs ou la trace, compte les requêtes, copie la plus coûteuse dans SSMS, lit le plan, puis corrige dans cet ordre : nombre de requêtes, volume de données, index, et seulement à la fin les micro-optimisations (compiled queries, pooling). Il sait aussi quand sortir d'EF pour un chemin précis (Dapper, <code>SqlBulkCopy</code>) sans réécrire toute la couche d'accès aux données.</div>

<h3>Pièges fréquents</h3>
<ul>
<li>Optimiser sans mesurer, par exemple en compilant toutes les requêtes alors que le problème est un index manquant.</li>
<li>Activer le lazy loading « pour simplifier », puis sérialiser des entités en JSON : chaque navigation déclenche une requête.</li>
<li>Appeler <code>ToList()</code> trop tôt, puis filtrer et paginer en mémoire.</li>
<li>Paginer sans <code>OrderBy</code> : ordre non garanti, résultats instables d'une page à l'autre.</li>
<li>Ajouter des index sur toutes les colonnes : chaque écriture devient plus lente.</li>
</ul>`,
  examples: [
    {
      title: "Voir et mesurer le SQL",
      code: `// Program.cs : SQL et durée dans les logs de développement
builder.Services.AddDbContext<OrderFlowDbContext>(o =>
{
    o.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow"));
    if (builder.Environment.IsDevelopment())
        o.LogTo(Console.WriteLine, LogLevel.Information)
         .EnableSensitiveDataLogging(); // valeurs des paramètres : jamais en production
});

// Obtenir le SQL sans exécuter la requête
var query = db.Orders
    .Where(o => o.Status == OrderStatus.Pending)
    .OrderByDescending(o => o.CreatedAt)
    .Select(o => new { o.Id, o.CreatedAt, Customer = o.Customer.Name });

Console.WriteLine(query.ToQueryString());
// DECLARE @__status_0 int = 0;
// SELECT [o].[Id], [o].[CreatedAt], [c].[Name] AS [Customer]
// FROM [Orders] AS [o]
// INNER JOIN [Customers] AS [c] ON [o].[CustomerId] = [c].[Id]
// WHERE [o].[Status] = @__status_0
// ORDER BY [o].[CreatedAt] DESC

// Dans SSMS : coller le SQL, Ctrl+M (plan réel), exécuter, chercher les scans et Key Lookup
// Query Store : requêtes les plus coûteuses
// SELECT TOP 10 qt.query_sql_text, rs.avg_duration, rs.count_executions
// FROM sys.query_store_query_text qt
// JOIN sys.query_store_query q ON q.query_text_id = qt.query_text_id
// JOIN sys.query_store_plan p ON p.query_id = q.query_id
// JOIN sys.query_store_runtime_stats rs ON rs.plan_id = p.plan_id
// ORDER BY rs.avg_duration DESC;`,
      explain: "<code>ToQueryString()</code> est aussi très utile dans un test unitaire pour vérifier qu'une requête est bien traduite en SQL et non évaluée côté client."
    },
    {
      title: "Projection contre entités complètes",
      code: `// Avant : graphe complet suivi, toutes les colonnes, lignes dupliquées par les jointures
var orders = await db.Orders
    .Include(o => o.Customer)
    .Include(o => o.Lines).ThenInclude(l => l.Product)
    .Where(o => o.Status == OrderStatus.Pending)
    .ToListAsync();
var view = orders.Select(o => new
{
    o.Id,
    Customer = o.Customer.Name,
    Total = o.Lines.Sum(l => l.Quantity * l.UnitPrice),
    Items = o.Lines.Count
});

// Après : SQL calcule tout, 4 colonnes par commande, rien n'est suivi
public sealed record PendingOrderDto(int Id, string Customer, decimal Total, int Items);

var dtos = await db.Orders
    .Where(o => o.Status == OrderStatus.Pending)
    .Select(o => new PendingOrderDto(
        o.Id,
        o.Customer.Name,
        o.Lines.Sum(l => l.Quantity * l.UnitPrice),
        o.Lines.Count))
    .ToListAsync();
// SELECT [o].[Id], [c].[Name],
//   (SELECT COALESCE(SUM(CAST([o0].[Quantity] AS decimal(18,2)) * [o0].[UnitPrice]), 0.0) FROM [OrderLines] AS [o0] WHERE [o].[Id] = [o0].[OrderId]),
//   (SELECT COUNT(*) FROM [OrderLines] AS [o1] WHERE [o].[Id] = [o1].[OrderId])
// FROM [Orders] AS [o] INNER JOIN [Customers] AS [c] ON ...`,
      explain: "Sur 1 000 commandes de 10 lignes, la première version transfère environ 10 000 lignes larges, la seconde 1 000 lignes de 4 colonnes."
    },
    {
      title: "Pagination keyset avec curseur",
      code: `public sealed record ProductPage(List<ProductListItem> Items, string? NextCursor);
public sealed record ProductListItem(int Id, string Name, decimal Price, DateTime CreatedAt);

// Tri par date de création décroissante, puis id pour départager
public async Task<ProductPage> GetPageAsync(string? cursor, int size, CancellationToken ct)
{
    IQueryable<Product> query = db.Products.AsNoTracking();

    if (cursor is not null)
    {
        var parts = cursor.Split('_');
        var lastDate = new DateTime(long.Parse(parts[0]), DateTimeKind.Utc);
        var lastId = int.Parse(parts[1]);
        query = query.Where(p => p.CreatedAt < lastDate || (p.CreatedAt == lastDate && p.Id < lastId));
    }

    var items = await query
        .OrderByDescending(p => p.CreatedAt).ThenByDescending(p => p.Id)
        .Take(size + 1) // une ligne de plus pour savoir s'il reste une page
        .Select(p => new ProductListItem(p.Id, p.Name, p.Price, p.CreatedAt))
        .ToListAsync(ct);

    string? next = null;
    if (items.Count > size)
    {
        items.RemoveAt(size);
        var last = items[^1];
        next = $"{last.CreatedAt.Ticks}_{last.Id}";
    }
    return new ProductPage(items, next);
}

// Index qui sert exactement ce tri
// modelBuilder.Entity<Product>().HasIndex(p => new { p.CreatedAt, p.Id }).IsDescending(true, true);`,
      explain: "Le coût reste constant à la page 1 comme à la page 10 000. Le curseur est opaque pour le client : dans une vraie API, on l'encode en Base64. Ici, <code>CreatedAt</code> est une vraie propriété de l'entité, pas une shadow property."
    },
    {
      title: "Index, split query, compiled query et pooling",
      code: `// 1. Index depuis le modèle
modelBuilder.Entity<Product>(b =>
{
    b.HasIndex(p => p.Sku).IsUnique();
    b.HasIndex(p => new { p.CategoryId, p.Price })     // filtre par catégorie, tri par prix
     .IncludeProperties(p => new { p.Name, p.Stock }); // index couvrant (SQL Server)
});
modelBuilder.Entity<Order>()
    .HasIndex(o => o.CreatedAt)
    .HasFilter("[Status] = 0");                        // seulement les commandes en attente

// 2. Plusieurs collections : split query
var order = await db.Orders
    .Include(o => o.Lines)
    .Include(o => o.Payments)
    .AsSplitQuery()
    .SingleAsync(o => o.Id == id);
// 3 requêtes : Orders, OrderLines, Payments (au lieu d'une jointure lignes x paiements)

// 3. Compiled query pour un chemin très chaud
public static class ProductQueries
{
    public static readonly Func<OrderFlowDbContext, string, Task<Product?>> BySku =
        EF.CompileAsyncQuery((OrderFlowDbContext db, string sku) =>
            db.Products.AsNoTracking().FirstOrDefault(p => p.Sku == sku));
}
var product = await ProductQueries.BySku(db, "KB-001");

// 4. Pooling des contextes (le DbContext ne doit pas garder d'état par requête)
builder.Services.AddDbContextPool<OrderFlowDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("OrderFlow")), poolSize: 256);`,
      explain: "<code>IncludeProperties</code> et <code>HasFilter</code> sont spécifiques au provider SQL Server. Mesure chaque changement : la compiled query et le pooling n'apportent un gain visible que sous forte charge."
    },
    {
      title: "Écritures en lot et chargement en lot",
      code: `// Mauvais : un aller-retour et une transaction par produit
foreach (var row in csvRows)
{
    db.Products.Add(new Product { Sku = row.Sku, Name = row.Name, Price = row.Price });
    await db.SaveChangesAsync();
}

// Mieux : lots de 1 000, change tracker vidé entre les lots
const int batchSize = 1000;
foreach (var chunk in csvRows.Chunk(batchSize))
{
    db.Products.AddRange(chunk.Select(r => new Product { Sku = r.Sku, Name = r.Name, Price = r.Price }));
    await db.SaveChangesAsync();   // INSERT regroupés en batchs SQL
    db.ChangeTracker.Clear();      // évite un DetectChanges de plus en plus coûteux
}

// Chargement en lot au lieu d'un FindAsync par ligne
var skus = csvRows.Select(r => r.Sku).Distinct().ToList();
var existing = new Dictionary<string, Product>();
foreach (var part in skus.Chunk(2000))   // listes Contains raisonnables
{
    var found = await db.Products.Where(p => part.Contains(p.Sku)).ToListAsync();
    foreach (var p in found) existing[p.Sku] = p;
}

foreach (var row in csvRows)
{
    if (existing.TryGetValue(row.Sku, out var p)) p.Price = row.Price;   // mise à jour
    else db.Products.Add(new Product { Sku = row.Sku, Name = row.Name, Price = row.Price });
}
await db.SaveChangesAsync();
// Pour des centaines de milliers de lignes : SqlBulkCopy (module ADO.NET) dans une table de staging, puis MERGE`,
      explain: "<code>Chunk</code> (.NET 6+) découpe une séquence en tableaux de taille fixe : pratique pour les lots d'écriture comme pour les listes <code>Contains</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Trouver le N+1",
      prompt: "<p>Ce code liste les clients et le nombre de leurs commandes. Active les logs, compte les requêtes envoyées pour 50 clients, puis réécris-le pour n'envoyer qu'une seule requête.</p><pre><code>var customers = await db.Customers.ToListAsync();\nforeach (var c in customers)\n{\n    var count = await db.Orders.CountAsync(o =&gt; o.CustomerId == c.Id);\n    Console.WriteLine($\"{c.Name} : {count}\");\n}</code></pre>",
      hint: "<p>51 requêtes : 1 pour les clients, puis 1 par client. Une projection avec <code>c.Orders.Count()</code> fait le comptage côté SQL.</p>",
      solution: `// 1 requête au lieu de 51
var rows = await db.Customers
    .Select(c => new { c.Name, OrderCount = c.Orders.Count() })
    .ToListAsync();

foreach (var r in rows)
    Console.WriteLine($"{r.Name} : {r.OrderCount}");

// SELECT [c].[Name], (SELECT COUNT(*) FROM [Orders] AS [o] WHERE [c].[Id] = [o].[CustomerId]) AS [OrderCount]
// FROM [Customers] AS [c]`
    },
    {
      level: "moyen",
      title: "Pagination keyset sur les commandes d'un client",
      prompt: "<p>Écris <code>GET /customers/{id}/orders?after={cursor}&amp;size=20</code> qui renvoie les commandes du client de la plus récente à la plus ancienne, avec une pagination keyset sur <code>(CreatedAt, Id)</code>, un curseur encodé en Base64 et l'index adapté.</p>",
      hint: "<p>Le filtre client fait partie de l'index : <code>HasIndex(o =&gt; new { o.CustomerId, o.CreatedAt, o.Id })</code>. Encode le curseur avec <code>Convert.ToBase64String(Encoding.UTF8.GetBytes(...))</code>.</p>",
      solution: `using System.Text;

public sealed record OrderItem(int Id, DateTime CreatedAt, OrderStatus Status);
public sealed record OrderPage(List<OrderItem> Items, string? Next);

// Index : modelBuilder.Entity<Order>().HasIndex(o => new { o.CustomerId, o.CreatedAt, o.Id });

app.MapGet("/customers/{id:int}/orders", async (int id, string? after, int? size, OrderFlowDbContext db, CancellationToken ct) =>
{
    var take = Math.Clamp(size ?? 20, 1, 100);
    var query = db.Orders.AsNoTracking().Where(o => o.CustomerId == id);

    if (!string.IsNullOrEmpty(after))
    {
        var parts = Encoding.UTF8.GetString(Convert.FromBase64String(after)).Split('_');
        var lastDate = new DateTime(long.Parse(parts[0]), DateTimeKind.Utc);
        var lastId = int.Parse(parts[1]);
        query = query.Where(o => o.CreatedAt < lastDate || (o.CreatedAt == lastDate && o.Id < lastId));
    }

    var items = await query
        .OrderByDescending(o => o.CreatedAt).ThenByDescending(o => o.Id)
        .Take(take + 1)
        .Select(o => new OrderItem(o.Id, o.CreatedAt, o.Status))
        .ToListAsync(ct);

    string? next = null;
    if (items.Count > take)
    {
        items.RemoveAt(take);
        var last = items[^1];
        next = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{last.CreatedAt.Ticks}_{last.Id}"));
    }
    return Results.Ok(new OrderPage(items, next));
});`
    },
    {
      level: "difficile",
      title: "Audit de performance d'un tableau de bord",
      prompt: "<p>Ce service alimente un tableau de bord et met 4 secondes avec 20 000 commandes. Identifie au moins quatre problèmes, puis réécris-le pour qu'il fasse au plus trois requêtes SQL légères.</p><pre><code>public async Task&lt;DashboardDto&gt; GetAsync()\n{\n    var orders = await db.Orders.Include(o =&gt; o.Lines).Include(o =&gt; o.Payments).ToListAsync();\n    var today = orders.Where(o =&gt; o.CreatedAt.Date == DateTime.UtcNow.Date).ToList();\n    var revenue = today.Sum(o =&gt; o.Lines.Sum(l =&gt; l.Quantity * l.UnitPrice));\n    var pending = orders.Count(o =&gt; o.Status == OrderStatus.Pending);\n    var top = orders.SelectMany(o =&gt; o.Lines).GroupBy(l =&gt; l.ProductId)\n        .OrderByDescending(g =&gt; g.Sum(l =&gt; l.Quantity)).Take(5)\n        .Select(g =&gt; db.Products.Find(g.Key)!.Name).ToList();\n    return new DashboardDto(today.Count, revenue, pending, top);\n}</code></pre>",
      hint: "<p>Problèmes : tout est chargé puis filtré en mémoire, explosion cartésienne lignes × paiements, change tracker plein, <code>Find</code> dans une boucle (N+1), filtre sur la date non indexable. Calcule chaque indicateur côté SQL avec une plage de dates <code>[début, fin[</code> au lieu de <code>.Date</code>.</p>",
      solution: `public sealed record DashboardDto(int OrdersToday, decimal RevenueToday, int Pending, List<string> TopProducts);

public async Task<DashboardDto> GetAsync(CancellationToken ct)
{
    // Plage indexable au lieu de CreatedAt.Date (qui empêche l'utilisation d'un index)
    var start = DateTime.UtcNow.Date;
    var end = start.AddDays(1);

    // Requête 1 : indicateurs du jour et commandes en attente, agrégés côté SQL
    var stats = await db.Orders
        .GroupBy(_ => 1)
        .Select(g => new
        {
            OrdersToday = g.Count(o => o.CreatedAt >= start && o.CreatedAt < end),
            Pending = g.Count(o => o.Status == OrderStatus.Pending)
        })
        .SingleOrDefaultAsync(ct);

    // Requête 2 : chiffre d'affaires du jour
    var revenue = await db.Set<OrderLine>()
        .Where(l => l.Order.CreatedAt >= start && l.Order.CreatedAt < end)
        .SumAsync(l => (decimal?)l.Quantity * l.UnitPrice, ct) ?? 0m;

    // Requête 3 : top 5 produits avec leur nom, en une seule requête (plus de Find en boucle)
    var top = await db.Set<OrderLine>()
        .GroupBy(l => new { l.ProductId, l.Product.Name })
        .OrderByDescending(g => g.Sum(l => l.Quantity))
        .Take(5)
        .Select(g => g.Key.Name)
        .ToListAsync(ct);

    return new DashboardDto(stats?.OrdersToday ?? 0, revenue, stats?.Pending ?? 0, top);
}

// Index utiles : Orders(CreatedAt), Orders(Status), OrderLines(ProductId) INCLUDE (Quantity)
// Problèmes corrigés :
// 1. Chargement de toute la table puis filtrage en mémoire
// 2. Explosion cartésienne Lines x Payments (Payments ne servait à rien)
// 3. Toutes les entités suivies par le change tracker
// 4. N+1 avec db.Products.Find dans le Select
// 5. CreatedAt.Date non indexable (et évalué en mémoire)`
    }
  ],
  project: "<p>Dans <code>OrderFlow.Data.Ef</code>, active les logs SQL et identifie les trois endpoints les plus lents d'OrderFlow (par exemple la liste des commandes, le détail d'une commande et la recherche de produits). Pour chacun, note dans un fichier <code>docs/perf.md</code> : le nombre de requêtes, la durée et le plan avant correction, la correction appliquée (projection, index, keyset, split query) et les mêmes mesures après. Passe la liste des produits en pagination keyset et ajoute les index correspondants dans une migration.</p>",
  resources: [
    { label: "Performance d'EF Core : vue d'ensemble", url: "https://learn.microsoft.com/ef/core/performance/" },
    { label: "Diagnostiquer les problèmes de performance", url: "https://learn.microsoft.com/ef/core/performance/performance-diagnosis" },
    { label: "Requêtes efficaces", url: "https://learn.microsoft.com/ef/core/performance/efficient-querying" },
    { label: "Mises à jour efficaces", url: "https://learn.microsoft.com/ef/core/performance/efficient-updating" },
    { label: "Sujets avancés (pooling, compiled queries)", url: "https://learn.microsoft.com/ef/core/performance/advanced-performance-topics" },
    { label: "Pagination", url: "https://learn.microsoft.com/ef/core/querying/pagination" },
    { label: "Requêtes uniques et fractionnées", url: "https://learn.microsoft.com/ef/core/querying/single-split-queries" }
  ]
});

window.COURSE.push({
  key: "e-testing-synthesis",
  title: "Tester EF Core et choisir son outil d'accès aux données",
  summary: "Tester ton code d'accès aux données contre un vrai SQL Server, trancher le débat Repository, et savoir quand utiliser ADO.NET, Dapper ou EF Core, seuls ou ensemble.",
  objectives: [
    "Comparer les stratégies de test : InMemory, SQLite, Testcontainers",
    "Écrire des tests d'intégration EF Core avec Testcontainers SQL Server et Respawn",
    "Tester des requêtes et vérifier leur traduction SQL",
    "Argumenter sur Repository et Unit of Work au-dessus d'EF Core",
    "Choisir entre ADO.NET, Dapper et EF Core, et les combiner dans un même projet",
    "Réviser le module avec une checklist et des questions d'entretien"
  ],
  lesson: `<h3>Pourquoi tester l'accès aux données</h3>
<p>Une requête LINQ qui compile n'est pas une requête qui fonctionne. Elle peut ne pas se traduire en SQL, être traduite autrement que prévu, violer une contrainte ou un index unique, ou dépendre d'un filtre global oublié. Ces erreurs n'apparaissent qu'au contact d'une vraie base. Tester ta couche de données, c'est vérifier quatre choses : le mapping (le modèle correspond au schéma et les migrations s'appliquent), les requêtes (elles renvoient les bonnes lignes), les écritures (contraintes, cascades, concurrence) et les règles transverses (soft delete, tenant, audit).</p>

<h3>Les stratégies, de la pire à la meilleure</h3>
<table>
<thead><tr><th>Stratégie</th><th>Avantages</th><th>Problèmes</th><th>Verdict</th></tr></thead>
<tbody>
<tr><td>Mocker <code>DbSet</code></td><td>Aucune base</td><td>Teste LINQ to Objects, pas la traduction SQL ; très fragile</td><td>À éviter</td></tr>
<tr><td>Provider <code>InMemory</code></td><td>Rapide, simple</td><td>Pas de SQL, pas de contraintes relationnelles, pas de transactions, pas de SQL brut ; comportements différents (casse, nulls)</td><td>Déconseillé par l'équipe EF elle-même</td></tr>
<tr><td>SQLite en mémoire</td><td>Vrai moteur SQL, rapide</td><td>Dialecte différent de SQL Server : pas de <code>rowversion</code>, types et fonctions différents, SQL brut incompatible</td><td>Acceptable si la base de production est SQLite</td></tr>
<tr><td>Testcontainers SQL Server</td><td>Le même moteur qu'en production, migrations réelles</td><td>Docker nécessaire, démarrage de quelques secondes</td><td><strong>Recommandé</strong></td></tr>
</tbody>
</table>
<p>Le provider InMemory reste utile pour une chose : tester une logique métier qui utilise le contexte sans rien vérifier côté SQL, et encore, un vrai test unitaire sans base fait souvent mieux. Pour tout ce qui touche aux requêtes et aux écritures, teste contre SQL Server.</p>

<h3>Testcontainers : un SQL Server jetable</h3>
<p><strong>Testcontainers</strong> démarre un conteneur Docker depuis le code de test et le détruit à la fin. Le package <code>Testcontainers.MsSql</code> fournit un <code>MsSqlBuilder</code> qui lance l'image officielle de SQL Server et donne la chaîne de connexion. L'organisation classique avec xUnit :</p>
<ul>
<li>Une <strong>fixture</strong> partagée (<code>IClassFixture</code> ou <code>ICollectionFixture</code>) démarre le conteneur une seule fois et applique les migrations avec <code>Database.MigrateAsync()</code>. Appliquer les vraies migrations teste aussi qu'elles fonctionnent.</li>
<li>Chaque test crée son propre <code>DbContext</code> neuf (jamais celui de l'arrangement pour l'assertion, sinon le change tracker te renvoie l'objet en mémoire au lieu de relire la base).</li>
<li>Entre deux tests, on remet la base dans un état connu. Trois options : supprimer et recréer la base (lent), envelopper chaque test dans une transaction annulée à la fin (rapide, mais incompatible avec du code qui gère ses propres transactions), ou vider les tables avec <strong>Respawn</strong>, qui calcule l'ordre de suppression d'après les clés étrangères et ignore la table <code>__EFMigrationsHistory</code>.</li>
</ul>
<p>Le démarrage d'un conteneur SQL Server prend quelques secondes : partage-le entre les classes de test d'un même assembly avec une collection xUnit, et ne démarre pas un conteneur par test.</p>

<h3>Tester une requête</h3>
<p>Un bon test de requête suit le schéma <em>Arrange</em> (insérer un jeu de données minimal qui contient des cas qui doivent sortir et des cas qui ne doivent pas sortir), <em>Act</em> (exécuter la méthode avec un contexte neuf) et <em>Assert</em> (vérifier le résultat exact). Pour un filtre global, insère une ligne supprimée et vérifie qu'elle n'apparaît pas. Pour une requête critique, tu peux aussi vérifier sa traduction avec <code>ToQueryString()</code> : par exemple, s'assurer qu'elle ne contient pas de jointure inutile. Ne fige pas tout le SQL dans une assertion : il change d'une version d'EF à l'autre.</p>

<h3>Tester les migrations et les règles transverses</h3>
<p>Les migrations sont du code de production : elles s'exécutent une seule fois, sur des données réelles, et une erreur bloque un déploiement. Trois vérifications automatiques à ajouter :</p>
<ul>
<li><strong>Les migrations s'appliquent sur une base vide</strong> : c'est ce que fait déjà la fixture avec <code>MigrateAsync()</code>.</li>
<li><strong>Le modèle et les migrations sont synchronisés</strong> : depuis EF Core 8, <code>db.Database.HasPendingModelChanges()</code> renvoie <code>true</code> si quelqu'un a modifié une entité sans générer de migration. Un test d'une ligne évite de découvrir l'oubli en production. En CI, la commande <code>dotnet ef migrations has-pending-model-changes</code> fait le même contrôle.</li>
<li><strong>Le script idempotent se génère</strong> : <code>dotnet ef migrations script --idempotent</code> dans le pipeline, publié comme artefact de build.</li>
</ul>
<p>Les règles transverses méritent chacune un test dédié, parce qu'elles sont invisibles dans le code appelant : un produit supprimé n'apparaît pas, un utilisateur d'un tenant ne voit pas les données d'un autre, l'interceptor d'audit remplit bien ses colonnes, et un <code>ExecuteDelete</code> contourne bien le soft delete (ce test documente le comportement pour l'équipe). Un test qui échoue ici révèle un problème de sécurité ou de conformité, pas seulement un bug.</p>

<h3>Le débat Repository et Unit of Work</h3>
<p>Beaucoup de projets enveloppent EF Core dans un <code>IRepository&lt;T&gt;</code> générique (<code>GetById</code>, <code>GetAll</code>, <code>Add</code>, <code>Update</code>, <code>Delete</code>) et un <code>IUnitOfWork</code>. C'est souvent une abstraction de trop :</p>
<ul>
<li><code>DbSet&lt;T&gt;</code> est déjà un repository, et <code>DbContext</code> est déjà une unit of work (<code>SaveChanges</code> est transactionnel).</li>
<li>Un repository générique masque les fonctions utiles d'EF (projections, <code>Include</code>, <code>AsNoTracking</code>, <code>ExecuteUpdate</code>). On finit par exposer <code>IQueryable</code>, ce qui annule l'abstraction, ou par ajouter des dizaines de méthodes.</li>
<li>L'argument « on pourra changer d'ORM » se réalise rarement, et l'argument « c'est pour mocker dans les tests » disparaît quand on teste contre une vraie base.</li>
</ul>
<p>Un repository a du sens quand il est <strong>spécifique et orienté domaine</strong>, comme en DDD : <code>IOrderRepository</code> avec <code>GetWithLinesAsync(OrderId)</code> et <code>Add(Order)</code>, qui ne charge que des agrégats complets et isole la couche Application d'EF. Les lectures (côté query du CQRS) peuvent alors utiliser directement le <code>DbContext</code> ou Dapper avec des projections. Ce qu'il faut éviter, c'est le repository générique qui ne fait que recopier <code>DbSet</code>.</p>

<h3>ADO.NET, Dapper ou EF Core</h3>
<table>
<thead><tr><th>Critère</th><th>ADO.NET</th><th>Dapper</th><th>EF Core</th></tr></thead>
<tbody>
<tr><td>Niveau</td><td>Bas niveau : connexion, commande, reader</td><td>Micro-ORM : mappe les résultats SQL en objets</td><td>ORM complet : modèle, LINQ, change tracking, migrations</td></tr>
<tr><td>Qui écrit le SQL</td><td>Toi</td><td>Toi</td><td>EF (ou toi en SQL brut)</td></tr>
<tr><td>Performance brute</td><td>Maximale</td><td>Très proche d'ADO.NET</td><td>Très bonne en lecture projetée sans suivi ; surcoût du suivi</td></tr>
<tr><td>Productivité CRUD</td><td>Faible (beaucoup de code)</td><td>Moyenne</td><td>Élevée</td></tr>
<tr><td>Schéma et migrations</td><td>Scripts SQL à part</td><td>Scripts SQL à part</td><td>Migrations intégrées</td></tr>
<tr><td>Typage des requêtes</td><td>Aucun (chaînes)</td><td>Aucun (chaînes)</td><td>Compilé (LINQ)</td></tr>
<tr><td>Cas d'usage idéal</td><td><code>SqlBulkCopy</code>, table-valued parameters, streaming, outils d'infrastructure</td><td>Reporting, requêtes complexes, lectures très chaudes</td><td>Domaine métier, écritures, CRUD, la majorité du code</td></tr>
</tbody>
</table>
<p>Dans un vrai projet, on les <strong>combine</strong> : EF Core pour le modèle, les écritures et la plupart des lectures, Dapper pour quelques requêtes de reporting écrites à la main, ADO.NET pour les imports massifs. Les trois peuvent partager la même connexion et la même transaction : <code>db.Database.GetDbConnection()</code> renvoie la <code>DbConnection</code> d'EF, et <code>db.Database.CurrentTransaction?.GetDbTransaction()</code> la transaction en cours, à passer à Dapper ou à une <code>SqlCommand</code>.</p>

<h3>Checklist EF Core niveau senior</h3>
<ul>
<li>Lectures d'API en projection ou <code>AsNoTracking</code>, jamais d'entités suivies sérialisées.</li>
<li>Aucun N+1 : vérifié dans les logs ou les traces, pas de lazy loading par défaut.</li>
<li>Chaînes de longueur bornée, <code>decimal</code> avec précision, index sur les filtres et tris réels.</li>
<li>Concurrence optimiste sur les entités modifiées par plusieurs utilisateurs, opérations atomiques pour les compteurs.</li>
<li>SQL brut uniquement paramétré, noms dynamiques en liste blanche.</li>
<li>Transactions explicites seulement quand plusieurs écritures doivent être atomiques, enveloppées dans l'ExecutionStrategy si le retry est actif.</li>
<li>Migrations relues, appliquées en production par script idempotent ou bundle, jamais par <code>Migrate()</code> au démarrage d'instances multiples.</li>
<li><code>DbContext</code> scoped et court ; <code>IDbContextFactory</code> pour les workers et le parallélisme.</li>
<li>Tests d'intégration contre SQL Server (Testcontainers), qui appliquent les vraies migrations.</li>
</ul>

<div class="note">En entretien, on n'attend pas d'un senior qu'il ait un outil préféré, mais qu'il justifie ses choix par des contraintes : volume, fréquence, équipe, maintenabilité. « EF Core pour le domaine et les écritures, Dapper pour ces trois rapports mesurés comme critiques, <code>SqlBulkCopy</code> pour l'import nocturne, et des tests Testcontainers qui protègent les trois » est une réponse de senior. « Je n'utilise jamais EF parce que c'est lent » ou « je mets un repository générique partout » n'en sont pas.</div>

<h3>Questions d'entretien</h3>
<p>Les exemples de ce jour contiennent huit questions classiques sur EF Core avec une réponse modèle. Essaie d'y répondre à voix haute avant de lire la réponse.</p>`,
  examples: [
    {
      title: "Fixture Testcontainers SQL Server avec migrations et Respawn",
      code: `// Packages : xunit, Testcontainers.MsSql, Respawn, Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;
using Respawn;
using Testcontainers.MsSql;

public sealed class SqlServerFixture : IAsyncLifetime
{
    private readonly MsSqlContainer _container = new MsSqlBuilder()
        .WithImage("mcr.microsoft.com/mssql/server:2022-latest")
        .Build();

    private Respawner _respawner = null!;
    public string ConnectionString => _container.GetConnectionString();

    public async Task InitializeAsync()
    {
        await _container.StartAsync();

        // Applique les vraies migrations : on teste aussi qu'elles fonctionnent
        await using (var db = CreateContext())
            await db.Database.MigrateAsync();

        _respawner = await Respawner.CreateAsync(ConnectionString, new RespawnerOptions
        {
            TablesToIgnore = ["__EFMigrationsHistory"]
        });
    }

    public OrderFlowDbContext CreateContext() =>
        new(new DbContextOptionsBuilder<OrderFlowDbContext>()
            .UseSqlServer(ConnectionString)
            .Options);

    // Remet les tables à vide en respectant l'ordre des clés étrangères
    public Task ResetAsync() => _respawner.ResetAsync(ConnectionString);

    public Task DisposeAsync() => _container.DisposeAsync().AsTask();
}

// Un seul conteneur partagé par toutes les classes de la collection
[CollectionDefinition("sql")]
public sealed class SqlCollection : ICollectionFixture<SqlServerFixture>;`,
      explain: "Avec xUnit v3, <code>InitializeAsync</code> et <code>DisposeAsync</code> renvoient <code>ValueTask</code> : adapte les signatures. Si ton DbContext reçoit d'autres dépendances (tenant, interceptors), passe-les aussi dans <code>CreateContext</code>."
    },
    {
      title: "Tester une requête, un filtre global et une contrainte",
      code: `[Collection("sql")]
public sealed class ProductQueriesTests(SqlServerFixture fx) : IAsyncLifetime
{
    public Task InitializeAsync() => fx.ResetAsync();   // base vide avant chaque test
    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task LowStock_returns_only_active_products_under_threshold()
    {
        // Arrange : un cas qui doit sortir, deux qui ne doivent pas
        await using (var db = fx.CreateContext())
        {
            var cat = new Category { Name = "Clavier" };
            db.AddRange(
                new Product { Sku = "A", Name = "Bas", Stock = 2, Price = 10, Category = cat },
                new Product { Sku = "B", Name = "OK", Stock = 50, Price = 10, Category = cat },
                new Product { Sku = "C", Name = "Supprimé", Stock = 1, Price = 10, Category = cat, IsDeleted = true });
            await db.SaveChangesAsync();
        }

        // Act : un contexte neuf, pour relire vraiment la base
        await using var act = fx.CreateContext();
        var result = await new ProductQueries(act).LowStockAsync(threshold: 5);

        // Assert
        Assert.Equal(["A"], result.Select(p => p.Sku));
    }

    [Fact]
    public async Task Duplicate_sku_is_rejected_by_unique_index()
    {
        await using var db = fx.CreateContext();
        var cat = new Category { Name = "Audio" };
        db.AddRange(
            new Product { Sku = "DUP", Name = "1", Price = 1, Category = cat },
            new Product { Sku = "DUP", Name = "2", Price = 1, Category = cat });

        await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }

    [Fact]
    public async Task Search_query_is_translated_without_client_evaluation()
    {
        await using var db = fx.CreateContext();
        var sql = new ProductQueries(db).SearchQuery("clav").ToQueryString();

        Assert.Contains("LIKE", sql);
        Assert.DoesNotContain("JOIN", sql);   // pas de jointure inutile
    }
}`,
      explain: "Le test du filtre global insère volontairement un produit supprimé. Sans lui, un filtre cassé ne serait jamais détecté."
    },
    {
      title: "Repository orienté domaine plutôt que générique",
      code: `// À éviter : recopie de DbSet qui masque les fonctions d'EF
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id);
    Task<List<T>> GetAllAsync();          // charge toute la table...
    void Add(T entity);
    void Update(T entity);                // Update = toutes les colonnes
    void Delete(T entity);
}

// Préférable : un repository par agrégat, avec des intentions métier
public interface IOrderRepository
{
    Task<Order?> GetWithLinesAsync(int orderId, CancellationToken ct);
    void Add(Order order);
}

public sealed class OrderRepository(OrderFlowDbContext db) : IOrderRepository
{
    public Task<Order?> GetWithLinesAsync(int orderId, CancellationToken ct) =>
        db.Orders.Include(o => o.Lines).SingleOrDefaultAsync(o => o.Id == orderId, ct);

    public void Add(Order order) => db.Orders.Add(order);
}

// La unit of work reste le DbContext (ou une interface minimale)
public interface IUnitOfWork { Task<int> SaveChangesAsync(CancellationToken ct); }

// Les lectures (côté query) n'ont pas besoin du repository : projection directe
public sealed class OrderQueries(OrderFlowDbContext db)
{
    public Task<List<OrderSummaryDto>> PendingAsync(CancellationToken ct) =>
        db.Orders.Where(o => o.Status == OrderStatus.Pending)
            .Select(o => new OrderSummaryDto(o.Id, o.Customer.Name, o.Lines.Sum(l => l.Quantity * l.UnitPrice)))
            .ToListAsync(ct);
}`,
      explain: "Le repository d'agrégat garantit qu'une commande est toujours chargée avec ses lignes, ce qui protège les invariants du domaine. Les lectures restent libres d'utiliser toute la puissance d'EF."
    },
    {
      title: "EF Core et Dapper dans la même transaction",
      code: `using Dapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage; // GetDbTransaction()

public sealed record CategoryRevenue(string Category, decimal Revenue, int Orders);

public async Task<List<CategoryRevenue>> CloseDayAsync(DateTime day, CancellationToken ct)
{
    var strategy = db.Database.CreateExecutionStrategy();
    return await strategy.ExecuteAsync(async () =>
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct);

        // 1. Écriture EF Core : passer les commandes du jour en Closed
        await db.Orders
            .Where(o => o.CreatedAt >= day && o.CreatedAt < day.AddDays(1) && o.Status == OrderStatus.Delivered)
            .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, OrderStatus.Closed), ct);

        // 2. Reporting Dapper : même connexion, même transaction
        var connection = db.Database.GetDbConnection();
        var report = (await connection.QueryAsync<CategoryRevenue>(new CommandDefinition("""
            SELECT c.Name AS Category,
                   SUM(l.Quantity * l.UnitPrice) AS Revenue,
                   COUNT(DISTINCT o.Id) AS Orders
            FROM Orders o
            JOIN OrderLines l ON l.OrderId = o.Id
            JOIN Products p ON p.Id = l.ProductId
            JOIN Categories c ON c.Id = p.CategoryId
            WHERE o.CreatedAt >= @Start AND o.CreatedAt < @End AND o.Status = @Status
            GROUP BY c.Name
            ORDER BY Revenue DESC
            """,
            new { Start = day, End = day.AddDays(1), Status = (int)OrderStatus.Closed },
            transaction: tx.GetDbTransaction(),
            cancellationToken: ct))).ToList();

        // 3. Écriture EF du rapport, toujours dans la transaction
        db.Add(new DailyReport { Day = day, Json = System.Text.Json.JsonSerializer.Serialize(report) });
        await db.SaveChangesAsync(ct);

        await tx.CommitAsync(ct);
        return report;
    });
}`,
      explain: "Sans <code>transaction: tx.GetDbTransaction()</code>, SQL Server refuserait la commande Dapper : une commande exécutée sur une connexion qui a une transaction ouverte doit y être rattachée."
    },
    {
      title: "Huit questions d'entretien sur EF Core",
      code: `1. Quelle différence entre IQueryable et IEnumerable avec EF Core ?
   IQueryable construit un arbre d'expression traduit en SQL et exécuté par la base.
   Dès qu'on passe en IEnumerable (AsEnumerable, ToList), la suite s'exécute en mémoire.
   Un Where appliqué après ToList filtre donc côté client, après avoir chargé toute la table.

2. Qu'est-ce que le problème N+1 et comment le détecter ?
   Une requête pour une liste puis une requête par élément (lazy loading, requête en boucle).
   On le voit en comptant les requêtes dans les logs ou une trace OpenTelemetry.
   Corrections : projection, Include, ou chargement en lot avec Contains.

3. AsNoTracking : quand et pourquoi ?
   Pour les lectures qu'on ne modifie pas : pas de snapshot, pas de résolution d'identité,
   moins de mémoire et de CPU. Une projection Select vers un DTO n'est de toute façon jamais suivie.

4. Que fait SaveChanges ?
   DetectChanges, calcul de l'ordre des commandes selon les clés étrangères, envoi en batchs,
   dans une transaction implicite, récupération des valeurs générées, passage en Unchanged.

5. Comment gérer la concurrence ?
   Optimiste avec rowversion (ou IsConcurrencyToken) : EF ajoute la version dans le WHERE et lève
   DbUpdateConcurrencyException si 0 ligne est affectée. Dans une API, le client renvoie la version
   qu'on réinjecte dans OriginalValue, et on répond 409. Pour un compteur : UPDATE atomique conditionnel.

6. Pourquoi ne pas appeler Database.Migrate() au démarrage en production ?
   Plusieurs instances peuvent migrer en même temps, l'application a besoin de droits DDL,
   et un échec de migration empêche le démarrage. On génère un script idempotent
   (dotnet ef migrations script --idempotent) ou un bundle, appliqué par le pipeline de déploiement.

7. Le DbContext est-il thread-safe ? Quelle durée de vie lui donner ?
   Non. Scoped (une instance par requête HTTP), courte. Pour un worker ou du parallélisme,
   IDbContextFactory et un contexte par unité de travail. AddDbContextPool pour réduire le coût de création.

8. Faut-il un repository générique au-dessus d'EF Core ?
   Généralement non : DbSet est déjà un repository et DbContext une unit of work. Un repository
   générique masque projections, Include et ExecuteUpdate. Un repository spécifique par agrégat (DDD)
   reste pertinent pour protéger les invariants du domaine et isoler la couche Application.`,
      explain: "Pour chaque question, un recruteur attend une réponse courte, puis un exemple concret tiré de ton expérience. Prépare un exemple OrderFlow pour chacune."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Test d'un repository",
      prompt: "<p>Avec la fixture Testcontainers des exemples, écris un test qui vérifie que <code>OrderRepository.GetWithLinesAsync</code> renvoie la commande avec toutes ses lignes, et un second qui vérifie qu'il renvoie <code>null</code> pour un id inexistant.</p>",
      hint: "<p>Insère un client, un produit et une commande de deux lignes avec un premier contexte, puis relis avec un second contexte neuf. N'oublie pas d'appeler <code>fx.ResetAsync()</code> avant chaque test.</p>",
      solution: `[Collection("sql")]
public sealed class OrderRepositoryTests(SqlServerFixture fx) : IAsyncLifetime
{
    public Task InitializeAsync() => fx.ResetAsync();
    public Task DisposeAsync() => Task.CompletedTask;

    [Fact]
    public async Task GetWithLines_returns_order_and_all_lines()
    {
        int orderId;
        await using (var db = fx.CreateContext())
        {
            var customer = new Customer { Name = "Ada", Email = "ada@example.com" };
            var product = new Product { Sku = "P1", Name = "Souris", Price = 20, Category = new Category { Name = "Accessoires" } };
            var order = new Order { Customer = customer, Status = OrderStatus.Pending, CreatedAt = DateTime.UtcNow };
            order.Lines.Add(new OrderLine { Product = product, Quantity = 1, UnitPrice = 20 });
            order.Lines.Add(new OrderLine { Product = product, Quantity = 3, UnitPrice = 18 });
            db.Add(order);
            await db.SaveChangesAsync();
            orderId = order.Id;
        }

        await using var read = fx.CreateContext();
        var result = await new OrderRepository(read).GetWithLinesAsync(orderId, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(2, result.Lines.Count);
        Assert.Equal(74m, result.Lines.Sum(l => l.Quantity * l.UnitPrice));
    }

    [Fact]
    public async Task GetWithLines_returns_null_for_unknown_id()
    {
        await using var db = fx.CreateContext();
        var result = await new OrderRepository(db).GetWithLinesAsync(999_999, CancellationToken.None);
        Assert.Null(result);
    }
}`
    },
    {
      level: "moyen",
      title: "Tester la concurrence optimiste",
      prompt: "<p>Écris un test d'intégration qui prouve que deux modifications concurrentes du même produit déclenchent une <code>DbUpdateConcurrencyException</code> sur la seconde, et que la valeur en base est bien celle de la première.</p>",
      hint: "<p>Deux contextes chargent le même produit. Le premier modifie et enregistre. Le second modifie puis <code>Assert.ThrowsAsync</code>. Relis ensuite avec un troisième contexte.</p>",
      solution: `[Fact]
public async Task Second_concurrent_update_fails_and_first_one_wins()
{
    int id;
    await using (var seed = fx.CreateContext())
    {
        var p = new Product { Sku = "RV", Name = "Clavier", Price = 50, Stock = 10, Category = new Category { Name = "Clavier" } };
        seed.Add(p);
        await seed.SaveChangesAsync();
        id = p.Id;
    }

    await using var dbA = fx.CreateContext();
    await using var dbB = fx.CreateContext();
    var a = await dbA.Products.SingleAsync(p => p.Id == id);
    var b = await dbB.Products.SingleAsync(p => p.Id == id);

    a.Stock = 8;
    await dbA.SaveChangesAsync();

    b.Price = 45;
    await Assert.ThrowsAsync<DbUpdateConcurrencyException>(() => dbB.SaveChangesAsync());

    await using var check = fx.CreateContext();
    var final = await check.Products.AsNoTracking().SingleAsync(p => p.Id == id);
    Assert.Equal(8, final.Stock);
    Assert.Equal(50m, final.Price);
}`
    },
    {
      level: "difficile",
      title: "Même requête, trois outils, un benchmark",
      prompt: "<p>Implémente « les 20 produits les plus vendus du mois, avec nom de catégorie et quantité » de trois façons : ADO.NET (<code>SqlCommand</code> + <code>SqlDataReader</code>), Dapper et EF Core en projection <code>AsNoTracking</code>. Écris un test d'intégration qui vérifie que les trois renvoient le même résultat, puis compare-les avec BenchmarkDotNet (vu au jour sur la performance) et rédige trois lignes de conclusion.</p>",
      hint: "<p>Les trois méthodes renvoient la même <code>List&lt;TopProduct&gt;</code>. Utilise le même SQL pour ADO.NET et Dapper. Pour la comparaison dans le test, un tri stable (quantité puis id) est indispensable.</p>",
      solution: `using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

public sealed record TopProduct(int ProductId, string Name, string Category, int Quantity);

public sealed class TopProductsQueries(string connectionString, OrderFlowDbContext db)
{
    private const string Sql = """
        SELECT TOP (20) p.Id AS ProductId, p.Name, c.Name AS Category, SUM(l.Quantity) AS Quantity
        FROM OrderLines l
        JOIN Orders o ON o.Id = l.OrderId
        JOIN Products p ON p.Id = l.ProductId
        JOIN Categories c ON c.Id = p.CategoryId
        WHERE o.CreatedAt >= @Start AND o.CreatedAt < @End
        GROUP BY p.Id, p.Name, c.Name
        ORDER BY Quantity DESC, ProductId
        """;

    public async Task<List<TopProduct>> AdoNetAsync(DateTime start, DateTime end)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        await using var command = new SqlCommand(Sql, connection);
        command.Parameters.Add("@Start", System.Data.SqlDbType.DateTime2).Value = start;
        command.Parameters.Add("@End", System.Data.SqlDbType.DateTime2).Value = end;

        var result = new List<TopProduct>();
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            result.Add(new TopProduct(reader.GetInt32(0), reader.GetString(1), reader.GetString(2), reader.GetInt32(3)));
        return result;
    }

    public async Task<List<TopProduct>> DapperAsync(DateTime start, DateTime end)
    {
        await using var connection = new SqlConnection(connectionString);
        return (await connection.QueryAsync<TopProduct>(Sql, new { Start = start, End = end })).ToList();
    }

    public Task<List<TopProduct>> EfCoreAsync(DateTime start, DateTime end) =>
        db.Set<OrderLine>().AsNoTracking()
            .Where(l => l.Order.CreatedAt >= start && l.Order.CreatedAt < end)
            .GroupBy(l => new { l.ProductId, l.Product.Name, Category = l.Product.Category.Name })
            .Select(g => new TopProduct(g.Key.ProductId, g.Key.Name, g.Key.Category, g.Sum(l => l.Quantity)))
            .OrderByDescending(t => t.Quantity).ThenBy(t => t.ProductId)
            .Take(20)
            .ToListAsync();
}

// Test d'intégration : les trois implémentations sont équivalentes
[Fact]
public async Task Three_implementations_return_the_same_result()
{
    // (insérer un jeu de données avec plusieurs produits et commandes dans le mois)
    await using var db = fx.CreateContext();
    var q = new TopProductsQueries(fx.ConnectionString, db);
    var start = new DateTime(2026, 11, 1, 0, 0, 0, DateTimeKind.Utc);
    var end = start.AddMonths(1);

    var ado = await q.AdoNetAsync(start, end);
    var dapper = await q.DapperAsync(start, end);
    var ef = await q.EfCoreAsync(start, end);

    Assert.Equal(ado, dapper);   // les records se comparent par valeur
    Assert.Equal(ado, ef);
}

// Benchmark (projet console séparé, en Release) :
// [MemoryDiagnoser] public class TopProductsBenchmark
// {
//     [Benchmark(Baseline = true)] public Task AdoNet() => _q.AdoNetAsync(_start, _end);
//     [Benchmark] public Task Dapper() => _q.DapperAsync(_start, _end);
//     [Benchmark] public Task EfCore() => _q.EfCoreAsync(_start, _end);
// }
// Conclusion type : les trois sont dans le même ordre de grandeur car le coût est dominé par SQL Server ;
// ADO.NET et Dapper allouent un peu moins ; EF reste typé et maintenable,
// et se justifie sauf si ce chemin est mesuré comme critique.`
    }
  ],
  project: "<p>Crée le projet <code>OrderFlow.Data.Ef.Tests</code> :</p><ul><li>Fixture Testcontainers SQL Server partagée en collection, migrations appliquées au démarrage, réinitialisation avec Respawn avant chaque test.</li><li>Tests du <code>OrderFlowDbContext</code> : les migrations s'appliquent, l'index unique du SKU est respecté, le soft delete masque les produits supprimés, la rowversion détecte les conflits, l'interceptor d'audit remplit <code>CreatedAt</code> et <code>UpdatedAt</code>.</li><li>Tests des requêtes optimisées au jour précédent (résultat et absence d'évaluation côté client).</li><li>Ajoute ces tests au pipeline CI : les runners GitHub Actions Linux disposent de Docker.</li></ul>",
  resources: [
    { label: "Tester du code qui utilise EF Core", url: "https://learn.microsoft.com/ef/core/testing/" },
    { label: "Choisir une stratégie de test", url: "https://learn.microsoft.com/ef/core/testing/choosing-a-testing-strategy" },
    { label: "Tester contre votre base de production", url: "https://learn.microsoft.com/ef/core/testing/testing-with-the-database" },
    { label: "Testcontainers pour .NET : module MSSQL", url: "https://dotnet.testcontainers.org/modules/mssql/" },
    { label: "Testcontainers", url: "https://testcontainers.com/" }
  ]
});
