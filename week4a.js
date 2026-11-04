window.COURSE = window.COURSE || [];

/* ===================== JOUR 22 : CACHING ===================== */
window.COURSE.push({
  day: 22, week: 4,
  title: "Caching : IMemoryCache, Redis, HybridCache et output caching",
  summary: "Accélérer les lectures sans servir de données fausses : choisir le bon niveau de cache et gérer l'invalidation.",
  objectives: [
    "Distinguer cache mémoire, cache distribué, HybridCache et output caching",
    "Éviter le cache stampede et gérer l'expiration et l'invalidation",
    "Mettre en cache les lectures d'OrderFlow avec HybridCache et des tags"
  ],
  lesson: `
<h3>Pourquoi mettre en cache</h3>
<p>Un cache échange de la <strong>fraîcheur</strong> contre de la <strong>vitesse</strong>. Avant d'en ajouter un, mesure : si une requête SQL prend 3 ms, le cache ne t'apportera presque rien et ajoutera un risque de données périmées. Le cache sert pour les lectures fréquentes, coûteuses et tolérantes à un léger retard : catalogue produits, référentiels, agrégats de tableau de bord.</p>

<h3>Les quatre outils d'ASP.NET Core</h3>
<ul>
  <li><code>IMemoryCache</code> : en mémoire du processus. Très rapide, mais chaque instance a sa propre copie et tout est perdu au redémarrage.</li>
  <li><code>IDistributedCache</code> : interface vers un cache externe (Redis, SQL Server). Partagé entre instances, mais il faut sérialiser en <code>byte[]</code> et chaque lecture est un appel réseau.</li>
  <li><code>HybridCache</code> (package <code>Microsoft.Extensions.Caching.Hybrid</code>, stable depuis .NET 9) : combine un niveau L1 en mémoire et un niveau L2 distribué, sérialise pour toi, et surtout <strong>protège contre le stampede</strong> : si 100 requêtes demandent la même clé absente, une seule exécute la fabrique, les 99 autres attendent le résultat. Il gère aussi les <strong>tags</strong> pour invalider un groupe d'entrées.</li>
  <li><strong>Output caching</strong> (<code>AddOutputCache</code> / <code>CacheOutput()</code>) : met en cache la <em>réponse HTTP entière</em> côté serveur. Idéal pour des endpoints GET publics. À ne pas confondre avec le response caching, qui pilote seulement les en-têtes <code>Cache-Control</code> pour le navigateur et les proxys.</li>
</ul>
<p>En pratique, sur un nouveau projet, commence par <code>HybridCache</code> pour les données et par l'output caching pour les endpoints publics. Utilise <code>IMemoryCache</code> directement seulement pour des cas très locaux.</p>

<h3>Expiration</h3>
<ul>
  <li><strong>Absolue</strong> : l'entrée expire après une durée fixe (ex. 5 min). Simple et prévisible.</li>
  <li><strong>Glissante</strong> (<code>SlidingExpiration</code>) : prolongée à chaque lecture. Attention : une entrée lue en permanence ne se rafraîchit jamais. Combine-la toujours avec une expiration absolue.</li>
  <li>Avec <code>HybridCache</code>, <code>Expiration</code> concerne le L2 et <code>LocalCacheExpiration</code> le L1. Mets un L1 plus court que le L2 pour limiter l'écart entre instances.</li>
</ul>

<h3>Invalidation</h3>
<p>« Il n'y a que deux choses difficiles en informatique : l'invalidation du cache et le nommage. » Trois stratégies :</p>
<ul>
  <li><strong>TTL seul</strong> : on accepte des données périmées pendant N minutes. Le plus simple.</li>
  <li><strong>Invalidation explicite</strong> : après une écriture, on appelle <code>RemoveAsync(key)</code> ou <code>RemoveByTagAsync(tag)</code>.</li>
  <li><strong>Événements</strong> : un domain event « OrderCreated » déclenche l'invalidation. C'est plus découplé et ça s'intègre bien au CQRS : les commands invalident, les queries lisent.</li>
</ul>

<h3>Clés de cache</h3>
<p>Une clé doit contenir <em>tout</em> ce qui fait varier le résultat : identifiant, utilisateur ou tenant, langue, page. Un oubli classique : mettre en cache « la liste de mes commandes » avec la clé <code>orders</code>, et servir les commandes d'un client à un autre. C'est une <strong>fuite de données</strong>, pas seulement un bug.</p>

<h3>Pièges courants</h3>
<ul>
  <li>Mettre en cache une entité EF Core suivie (tracked) : tu partages un objet mutable entre requêtes. Cache des DTO immuables (records).</li>
  <li>Cacher <code>null</code> sans le vouloir, ou au contraire ne jamais cacher l'absence et laisser une clé inexistante frapper la base à chaque appel.</li>
  <li>Oublier que <code>IMemoryCache</code> n'est pas partagé : avec 3 instances derrière un load balancer, une invalidation locale ne touche qu'une seule instance.</li>
  <li>Output caching sur un endpoint authentifié : par défaut il ne met pas en cache les requêtes avec <code>Authorization</code>, et c'est voulu.</li>
</ul>

<div class="note"><strong>Niveau senior :</strong> un senior sait dire pourquoi il <em>n'ajoute pas</em> de cache. Il mesure d'abord (temps de réponse, charge de la base), définit pour chaque donnée la durée de péremption acceptable avec le métier, et prévoit l'observabilité : taux de hit/miss, et une manière de vider le cache en production sans redéployer.</div>
`,
  examples: [
    {
      title: "HybridCache avec Redis en L2",
      code: `// Program.cs
// dotnet add package Microsoft.Extensions.Caching.Hybrid
// dotnet add package Microsoft.Extensions.Caching.StackExchangeRedis
builder.Services.AddStackExchangeRedisCache(o =>
    o.Configuration = builder.Configuration.GetConnectionString("redis"));

builder.Services.AddHybridCache(o =>
{
    o.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(10),          // L2 (Redis)
        LocalCacheExpiration = TimeSpan.FromMinutes(1)  // L1 (mémoire)
    };
});

// Service de lecture
public sealed class ProductQueries(HybridCache cache, AppDbContext db)
{
    public async Task<ProductDto?> GetAsync(int id, CancellationToken ct) =>
        await cache.GetOrCreateAsync(
            $"product:{id}",
            async token => await db.Products
                .AsNoTracking()
                .Where(p => p.Id == id)
                .Select(p => new ProductDto(p.Id, p.Name, p.Price))
                .FirstOrDefaultAsync(token),
            tags: ["products"],
            cancellationToken: ct);
}

public sealed record ProductDto(int Id, string Name, decimal Price);`,
      explain: "<p>Si Redis n'est pas enregistré, HybridCache fonctionne quand même avec le L1 seul. La fabrique n'est exécutée qu'une fois par clé même sous forte concurrence.</p>"
    },
    {
      title: "Invalidation par tag après une écriture",
      code: `public sealed class UpdateProductPriceHandler(AppDbContext db, HybridCache cache)
{
    public async Task Handle(int id, decimal price, CancellationToken ct)
    {
        var product = await db.Products.FindAsync([id], ct)
            ?? throw new KeyNotFoundException($"Produit {id} introuvable");

        product.ChangePrice(price);
        await db.SaveChangesAsync(ct);

        // On invalide l'entrée précise et toutes les listes taguées "products"
        await cache.RemoveAsync($"product:{id}", ct);
        await cache.RemoveByTagAsync("products", ct);
    }
}`,
      explain: "<p>On invalide <em>après</em> le <code>SaveChangesAsync</code> : si la sauvegarde échoue, le cache reste cohérent avec la base.</p>"
    },
    {
      title: "Output caching sur un endpoint public",
      code: `builder.Services.AddOutputCache(o =>
{
    o.AddPolicy("catalog", p => p
        .Expire(TimeSpan.FromSeconds(30))
        .SetVaryByQuery("page", "category")
        .Tag("catalog"));
});

var app = builder.Build();
app.UseOutputCache();

app.MapGet("/api/catalog", async (int page, string? category, CatalogQueries q, CancellationToken ct)
        => await q.ListAsync(page, category, ct))
   .CacheOutput("catalog");

// Invalidation : IOutputCacheStore.EvictByTagAsync("catalog", ct)`,
      explain: "<p><code>SetVaryByQuery</code> fait partie de la clé : sans lui, la page 2 renverrait la page 1.</p>"
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Cache mémoire d'un référentiel",
      prompt: "<p>Écris un service <code>CountryService</code> qui renvoie la liste des pays depuis la base et la met en cache avec <code>IMemoryCache</code> pendant 1 heure (expiration absolue).</p>",
      hint: "<p>Utilise <code>GetOrCreateAsync</code> et <code>entry.AbsoluteExpirationRelativeToNow</code>.</p>",
      solution: `public sealed class CountryService(IMemoryCache cache, AppDbContext db)
{
    private const string Key = "countries:all";

    public async Task<IReadOnlyList<CountryDto>> GetAllAsync(CancellationToken ct)
    {
        var result = await cache.GetOrCreateAsync(Key, async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            return await db.Countries
                .AsNoTracking()
                .OrderBy(c => c.Name)
                .Select(c => new CountryDto(c.Code, c.Name))
                .ToListAsync(ct);
        });
        return result!;
    }
}

public sealed record CountryDto(string Code, string Name);

// Program.cs
builder.Services.AddMemoryCache();
builder.Services.AddScoped<CountryService>();`
    },
    {
      level: "moyen",
      title: "Clé de cache par utilisateur",
      prompt: "<p>Crée un endpoint <code>GET /api/me/orders</code> qui renvoie les commandes de l'utilisateur connecté, mises en cache 2 minutes avec <code>HybridCache</code>. Assure-toi qu'aucun utilisateur ne voit les commandes d'un autre et que la création d'une commande invalide son cache.</p>",
      hint: "<p>Mets l'identifiant utilisateur (claim <code>sub</code>) dans la clé et dans un tag <code>orders:user:{id}</code>.</p>",
      solution: `app.MapGet("/api/me/orders", async (ClaimsPrincipal user, HybridCache cache, AppDbContext db, CancellationToken ct) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? user.FindFirstValue("sub")
                 ?? throw new UnauthorizedAccessException();

    var orders = await cache.GetOrCreateAsync(
        $"orders:user:{userId}",
        async token => await db.Orders
            .AsNoTracking()
            .Where(o => o.CustomerId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new OrderSummaryDto(o.Id, o.Total, o.Status.ToString()))
            .ToListAsync(token),
        new HybridCacheEntryOptions { Expiration = TimeSpan.FromMinutes(2) },
        tags: [$"orders:user:{userId}"],
        cancellationToken: ct);

    return Results.Ok(orders);
}).RequireAuthorization();

// Dans le handler de CreateOrder, après SaveChangesAsync :
await cache.RemoveByTagAsync($"orders:user:{command.CustomerId}", ct);

public sealed record OrderSummaryDto(Guid Id, decimal Total, string Status);`
    },
    {
      level: "difficile",
      title: "Prouver la protection anti-stampede",
      prompt: "<p>Écris un test xUnit qui lance 50 appels concurrents à <code>HybridCache.GetOrCreateAsync</code> sur la même clé avec une fabrique lente (200 ms) et vérifie que la fabrique n'est exécutée qu'<strong>une seule fois</strong>. Compare ensuite avec un <code>IMemoryCache.GetOrCreateAsync</code> naïf.</p>",
      hint: "<p>Construis un <code>ServiceCollection</code>, appelle <code>AddHybridCache()</code>, compte les appels avec <code>Interlocked.Increment</code> et lance les tâches avec <code>Task.WhenAll</code>.</p>",
      solution: `public class StampedeTests
{
    [Fact]
    public async Task HybridCache_runs_factory_once_under_concurrency()
    {
        var services = new ServiceCollection();
        services.AddHybridCache();
        var cache = services.BuildServiceProvider().GetRequiredService<HybridCache>();

        var calls = 0;
        async ValueTask<string> Factory(CancellationToken ct)
        {
            Interlocked.Increment(ref calls);
            await Task.Delay(200, ct);
            return "value";
        }

        var tasks = Enumerable.Range(0, 50)
            .Select(_ => cache.GetOrCreateAsync("key", Factory).AsTask());
        var results = await Task.WhenAll(tasks);

        Assert.All(results, r => Assert.Equal("value", r));
        Assert.Equal(1, calls);
    }

    [Fact]
    public async Task MemoryCache_may_run_factory_many_times()
    {
        var cache = new MemoryCache(new MemoryCacheOptions());
        var calls = 0;

        var tasks = Enumerable.Range(0, 50).Select(_ => cache.GetOrCreateAsync("key", async _ =>
        {
            Interlocked.Increment(ref calls);
            await Task.Delay(200);
            return "value";
        }));
        await Task.WhenAll(tasks);

        // IMemoryCache ne verrouille pas : la fabrique tourne souvent plusieurs fois
        Assert.True(calls > 1, $"Appels : {calls}");
    }
}`
    }
  ],
  project: "<p><strong>OrderFlow :</strong> ajoute <code>HybridCache</code> dans la couche Infrastructure (avec Redis lancé via Docker : <code>docker run -p 6379:6379 redis:7</code>). Mets en cache la query <code>GetProductById</code> et la liste du catalogue avec le tag <code>products</code>. Dans les commands qui modifient un produit, invalide le tag après <code>SaveChangesAsync</code>. Ajoute l'output caching sur l'endpoint public du catalogue consommé par ton front Angular, puis mesure le temps de réponse avant et après.</p>",
  resources: [
    { label: "Caching dans ASP.NET Core (vue d'ensemble)", url: "https://learn.microsoft.com/aspnet/core/performance/caching/overview" },
    { label: "Bibliothèque HybridCache", url: "https://learn.microsoft.com/aspnet/core/performance/caching/hybrid" },
    { label: "Output caching middleware", url: "https://learn.microsoft.com/aspnet/core/performance/caching/output" }
  ]
});

/* ===================== JOUR 23 : BACKGROUND JOBS & MESSAGING ===================== */
window.COURSE.push({
  day: 23, week: 4,
  title: "Background jobs et messaging : BackgroundService, Hangfire, RabbitMQ/MassTransit",
  summary: "Sortir le travail lent de la requête HTTP et faire communiquer des services de manière fiable.",
  objectives: [
    "Écrire un BackgroundService correct (scopes DI, annulation, erreurs)",
    "Choisir entre BackgroundService, Channel, Hangfire et un broker de messages",
    "Publier et consommer des événements avec MassTransit sur RabbitMQ"
  ],
  lesson: `
<h3>Pourquoi sortir le travail de la requête</h3>
<p>Envoyer un e-mail, générer un PDF ou appeler un service externe lent ne doit pas bloquer la réponse HTTP. L'utilisateur reçoit un <code>202 Accepted</code> ou un <code>201 Created</code> tout de suite, et le travail se fait en arrière-plan. Il faut alors répondre à trois questions : que se passe-t-il si le processus redémarre ? si le traitement échoue ? si deux instances tournent en même temps ?</p>

<h3>BackgroundService</h3>
<p><code>BackgroundService</code> (dans <code>Microsoft.Extensions.Hosting</code>) est une classe de base pour une tâche longue qui démarre avec l'application. Tu surcharges <code>ExecuteAsync(CancellationToken stoppingToken)</code> et tu l'enregistres avec <code>AddHostedService&lt;T&gt;()</code>.</p>
<ul>
  <li>Un hosted service est un <strong>singleton</strong>. Tu ne peux pas y injecter un <code>DbContext</code> (scoped). Injecte <code>IServiceScopeFactory</code> et crée un scope par itération.</li>
  <li>Respecte <code>stoppingToken</code> : passe-le à chaque appel async et sors de la boucle quand il est annulé.</li>
  <li>Utilise <code>PeriodicTimer</code> plutôt que <code>Task.Delay</code> dans une boucle : il ne dérive pas et s'annule proprement.</li>
  <li>Depuis .NET 8, une exception non gérée dans <code>ExecuteAsync</code> <strong>arrête l'hôte</strong> par défaut (<code>BackgroundServiceExceptionBehavior.StopHost</code>). Entoure chaque itération d'un <code>try/catch</code> qui logue.</li>
</ul>

<h3>Channel : une file en mémoire</h3>
<p><code>System.Threading.Channels</code> fournit une file producteur/consommateur très performante. L'endpoint écrit dans le channel, un <code>BackgroundService</code> lit. C'est simple et rapide, mais <strong>tout est perdu si le processus s'arrête</strong>. À réserver aux tâches qu'on peut perdre ou rejouer.</p>

<h3>Hangfire : jobs persistants</h3>
<p>Hangfire stocke les jobs en base (SQL Server, PostgreSQL, Redis). Il gère les retries, les jobs planifiés (<code>BackgroundJob.Schedule</code>), récurrents (<code>RecurringJob.AddOrUpdate</code> avec une expression cron) et fournit un tableau de bord. C'est un bon choix pour une application monolithique qui a besoin de jobs fiables sans broker.</p>

<h3>Messaging : RabbitMQ et MassTransit</h3>
<p>Quand plusieurs services doivent réagir à un même fait (« une commande a été passée »), on passe par un <strong>broker</strong> : RabbitMQ, Azure Service Bus, Kafka. On distingue :</p>
<ul>
  <li><strong>Command</strong> : « fais ceci », un seul destinataire (<code>Send</code>).</li>
  <li><strong>Event</strong> : « ceci s'est produit », zéro ou plusieurs abonnés (<code>Publish</code>).</li>
</ul>
<p><strong>MassTransit</strong> est une abstraction au-dessus des brokers : sérialisation, topologie, retries, redelivery, sagas, outbox. Attention à la licence : <strong>MassTransit v9 passe sous licence commerciale</strong>, la <strong>v8 reste open source</strong> (Apache 2.0) et maintenue un temps. Vérifie la politique de ton entreprise ; les alternatives sont Wolverine, Rebus, ou le client RabbitMQ directement.</p>

<h3>Fiabilité : at-least-once et idempotence</h3>
<p>Les brokers garantissent en général une livraison <strong>au moins une fois</strong>. Ton consommateur peut donc recevoir deux fois le même message : il doit être <strong>idempotent</strong> (vérifier qu'il n'a pas déjà traité ce <code>MessageId</code>, ou faire une opération naturellement idempotente).</p>
<p>Autre problème : tu sauvegardes la commande en base, puis tu publies l'événement… et le processus plante entre les deux. Le <strong>pattern Outbox</strong> règle ça : l'événement est écrit dans une table de la même transaction que la commande, puis un processus l'envoie au broker. MassTransit fournit un outbox EF Core prêt à l'emploi.</p>

<h3>Pièges courants</h3>
<ul>
  <li>Utiliser <code>Task.Run</code> dans un contrôleur pour « faire en arrière-plan » : pas de scope DI valide, pas de gestion d'arrêt, exceptions perdues.</li>
  <li>Partager un <code>DbContext</code> entre itérations d'un worker : il grossit et finit par renvoyer des données périmées.</li>
  <li>Deux instances qui exécutent le même job planifié : il faut un verrou distribué ou un outil qui le gère (Hangfire le fait).</li>
</ul>

<div class="note"><strong>Niveau senior :</strong> ne commence pas par un broker. Un monolithe bien découpé avec Hangfire ou un outbox simple suffit souvent. Introduis RabbitMQ quand tu as réellement plusieurs services ou un besoin de découplage fort, et prévois dès le départ idempotence, dead-letter queue et monitoring de la longueur des files.</div>
`,
  examples: [
    {
      title: "BackgroundService périodique avec scope DI",
      code: `public sealed class ExpiredCartCleaner(
    IServiceScopeFactory scopeFactory,
    ILogger<ExpiredCartCleaner> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                // Un scope par itération : DbContext neuf à chaque fois
                await using var scope = scopeFactory.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                var limit = DateTime.UtcNow.AddHours(-24);
                var deleted = await db.Carts
                    .Where(c => c.UpdatedAt < limit)
                    .ExecuteDeleteAsync(stoppingToken);

                logger.LogInformation("{Count} paniers expirés supprimés", deleted);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // On logue et on continue : une erreur ne doit pas arrêter l'hôte
                logger.LogError(ex, "Échec du nettoyage des paniers");
            }
        }
    }
}

// Program.cs
builder.Services.AddHostedService<ExpiredCartCleaner>();`,
      explain: "<p><code>WaitForNextTickAsync</code> lève <code>OperationCanceledException</code> à l'arrêt de l'application, ce qui sort proprement de la boucle.</p>"
    },
    {
      title: "File en mémoire avec Channel",
      code: `public sealed record EmailJob(string To, string Subject, string Body);

// Program.cs
builder.Services.AddSingleton(Channel.CreateBounded<EmailJob>(new BoundedChannelOptions(1000)
{
    FullMode = BoundedChannelFullMode.Wait // contre-pression si la file est pleine
}));
builder.Services.AddHostedService<EmailWorker>();

app.MapPost("/api/contact", async (ContactRequest req, Channel<EmailJob> channel, CancellationToken ct) =>
{
    await channel.Writer.WriteAsync(new EmailJob("support@orderflow.dev", req.Subject, req.Message), ct);
    return Results.Accepted();
});

public sealed class EmailWorker(Channel<EmailJob> channel, IEmailSender sender, ILogger<EmailWorker> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var job in channel.Reader.ReadAllAsync(stoppingToken))
        {
            try { await sender.SendAsync(job.To, job.Subject, job.Body, stoppingToken); }
            catch (Exception ex) { logger.LogError(ex, "Envoi échoué vers {To}", job.To); }
        }
    }
}`,
      explain: "<p>Un channel <em>borné</em> évite de saturer la mémoire si le consommateur est plus lent que les producteurs. Les messages en file sont perdus au redémarrage.</p>"
    },
    {
      title: "Publier et consommer un événement avec MassTransit (v8)",
      code: `// dotnet add package MassTransit.RabbitMQ --version 8.*
public sealed record OrderPlaced(Guid OrderId, string CustomerId, decimal Total);

// Program.cs
builder.Services.AddMassTransit(x =>
{
    x.AddConsumer<SendOrderConfirmationConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h => { h.Username("guest"); h.Password("guest"); });
        cfg.UseMessageRetry(r => r.Intervals(500, 2000, 5000)); // 3 nouvelles tentatives
        cfg.ConfigureEndpoints(context);
    });
});

// Publication dans un handler
public sealed class PlaceOrderHandler(AppDbContext db, IPublishEndpoint publisher)
{
    public async Task<Guid> Handle(PlaceOrder cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.CustomerId, cmd.Lines);
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        await publisher.Publish(new OrderPlaced(order.Id, order.CustomerId, order.Total), ct);
        return order.Id;
    }
}

// Consommateur
public sealed class SendOrderConfirmationConsumer(IEmailSender sender) : IConsumer<OrderPlaced>
{
    public async Task Consume(ConsumeContext<OrderPlaced> context)
    {
        var msg = context.Message;
        await sender.SendAsync(msg.CustomerId, "Commande confirmée",
            $"Votre commande {msg.OrderId} de {msg.Total:C} est confirmée.", context.CancellationToken);
    }
}`,
      explain: "<p>Ici, si le processus plante entre <code>SaveChangesAsync</code> et <code>Publish</code>, l'événement est perdu. L'exercice difficile corrige ça avec l'outbox.</p>"
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Worker de heartbeat",
      prompt: "<p>Écris un <code>BackgroundService</code> qui logue « OrderFlow vivant » toutes les 30 secondes avec <code>PeriodicTimer</code> et s'arrête proprement à l'arrêt de l'application.</p>",
      hint: "<p>La boucle <code>while (await timer.WaitForNextTickAsync(stoppingToken))</code> suffit.</p>",
      solution: `public sealed class HeartbeatService(ILogger<HeartbeatService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
                logger.LogInformation("OrderFlow vivant à {Time}", DateTimeOffset.UtcNow);
        }
        catch (OperationCanceledException)
        {
            logger.LogInformation("Heartbeat arrêté");
        }
    }
}

// Program.cs
builder.Services.AddHostedService<HeartbeatService>();`
    },
    {
      level: "moyen",
      title: "Job récurrent Hangfire",
      prompt: "<p>Configure Hangfire avec stockage PostgreSQL (ou SQL Server). Crée un job récurrent quotidien à 2 h du matin qui calcule le chiffre d'affaires de la veille et l'enregistre dans une table <code>DailyRevenue</code>. Protège le tableau de bord pour qu'il ne soit accessible qu'aux administrateurs.</p>",
      hint: "<p><code>RecurringJob.AddOrUpdate&lt;T&gt;(id, x =&gt; x.RunAsync(), Cron.Daily(2))</code>. Pour le dashboard, implémente <code>IDashboardAuthorizationFilter</code>.</p>",
      solution: `// dotnet add package Hangfire.AspNetCore
// dotnet add package Hangfire.PostgreSql
builder.Services.AddHangfire(c => c
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(o => o.UseNpgsqlConnection(builder.Configuration.GetConnectionString("db"))));
builder.Services.AddHangfireServer();
builder.Services.AddScoped<DailyRevenueJob>();

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
app.UseHangfireDashboard("/jobs", new DashboardOptions
{
    Authorization = [new AdminOnlyFilter()]
});

RecurringJob.AddOrUpdate<DailyRevenueJob>(
    "daily-revenue",
    job => job.RunAsync(CancellationToken.None),
    Cron.Daily(2),
    new RecurringJobOptions { TimeZone = TimeZoneInfo.Utc });

public sealed class DailyRevenueJob(AppDbContext db)
{
    public async Task RunAsync(CancellationToken ct)
    {
        var day = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var start = day.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var end = start.AddDays(1);

        var total = await db.Orders
            .Where(o => o.CreatedAt >= start && o.CreatedAt < end)
            .SumAsync(o => o.Total, ct);

        // Idempotent : on remplace la ligne du jour si le job est rejoué
        var existing = await db.DailyRevenues.FindAsync([day], ct);
        if (existing is null) db.DailyRevenues.Add(new DailyRevenue(day, total));
        else existing.Total = total;

        await db.SaveChangesAsync(ct);
    }
}

public sealed class AdminOnlyFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) =>
        context.GetHttpContext().User.IsInRole("Admin");
}`
    },
    {
      level: "difficile",
      title: "Outbox et consommateur idempotent",
      prompt: "<p>Rends la publication de <code>OrderPlaced</code> fiable : configure l'<strong>outbox transactionnel EF Core</strong> de MassTransit pour que l'événement soit enregistré dans la même transaction que la commande. Rends ensuite le consommateur idempotent avec une table <code>ProcessedMessages</code>.</p>",
      hint: "<p><code>x.AddEntityFrameworkOutbox&lt;AppDbContext&gt;(o =&gt; { o.UsePostgres(); o.UseBusOutbox(); })</code> et ajoute les entités outbox au modèle avec <code>modelBuilder.AddTransactionalOutboxEntities()</code>. Côté consommateur, <code>context.MessageId</code> identifie le message.</p>",
      solution: `// Program.cs (MassTransit v8 + MassTransit.EntityFrameworkCore)
builder.Services.AddMassTransit(x =>
{
    x.AddEntityFrameworkOutbox<AppDbContext>(o =>
    {
        o.UsePostgres();          // ou o.UseSqlServer();
        o.UseBusOutbox();         // Publish écrit dans la table outbox, pas dans RabbitMQ
        o.QueryDelay = TimeSpan.FromSeconds(1);
    });

    x.AddConsumer<SendOrderConfirmationConsumer>();
    x.UsingRabbitMq((ctx, cfg) => cfg.ConfigureEndpoints(ctx));
});

// AppDbContext
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.AddInboxStateEntity();
    modelBuilder.AddOutboxMessageEntity();
    modelBuilder.AddOutboxStateEntity();
    modelBuilder.Entity<ProcessedMessage>().HasKey(m => m.MessageId);
    base.OnModelCreating(modelBuilder);
}

// Handler : Publish puis SaveChanges => commande + message dans la même transaction
public sealed class PlaceOrderHandler(AppDbContext db, IPublishEndpoint publisher)
{
    public async Task<Guid> Handle(PlaceOrder cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.CustomerId, cmd.Lines);
        db.Orders.Add(order);
        await publisher.Publish(new OrderPlaced(order.Id, order.CustomerId, order.Total), ct);
        await db.SaveChangesAsync(ct);
        return order.Id;
    }
}

// Consommateur idempotent
public sealed record ProcessedMessage(Guid MessageId, DateTime ProcessedAt);

public sealed class SendOrderConfirmationConsumer(AppDbContext db, IEmailSender sender)
    : IConsumer<OrderPlaced>
{
    public async Task Consume(ConsumeContext<OrderPlaced> context)
    {
        var id = context.MessageId ?? throw new InvalidOperationException("MessageId manquant");
        if (await db.Set<ProcessedMessage>().AnyAsync(m => m.MessageId == id))
            return; // déjà traité : on ignore le doublon

        var msg = context.Message;
        await sender.SendAsync(msg.CustomerId, "Commande confirmée",
            $"Commande {msg.OrderId} confirmée.", context.CancellationToken);

        db.Add(new ProcessedMessage(id, DateTime.UtcNow));
        await db.SaveChangesAsync(context.CancellationToken);
    }
}
// Note : MassTransit propose aussi un inbox (UseEntityFrameworkOutbox sur l'endpoint)
// qui fait cette déduplication pour toi.`
    }
  ],
  project: "<p><strong>OrderFlow :</strong> lance RabbitMQ (<code>docker run -p 5672:5672 -p 15672:15672 rabbitmq:4-management</code>). Quand une commande est créée, publie <code>OrderPlaced</code> via l'outbox EF Core. Ajoute un consommateur qui envoie l'e-mail de confirmation (un faux <code>IEmailSender</code> qui logue suffit) et un <code>BackgroundService</code> qui annule les commandes impayées depuis plus de 30 minutes. L'endpoint de création renvoie <code>201</code> sans attendre l'e-mail.</p>",
  resources: [
    { label: "Tâches en arrière-plan avec hosted services", url: "https://learn.microsoft.com/aspnet/core/fundamentals/host/hosted-services" },
    { label: "System.Threading.Channels", url: "https://learn.microsoft.com/dotnet/core/extensions/channels" },
    { label: "Documentation MassTransit", url: "https://masstransit.io/documentation/concepts" },
    { label: "Documentation Hangfire", url: "https://docs.hangfire.io/" }
  ]
});

/* ===================== JOUR 24 : PERFORMANCE ===================== */
window.COURSE.push({
  day: 24, week: 4,
  title: "Performance : allocations, Span<T>, BenchmarkDotNet et profiling",
  summary: "Mesurer avant d'optimiser, comprendre d'où viennent les allocations et réduire la pression sur le GC.",
  objectives: [
    "Écrire un benchmark fiable avec BenchmarkDotNet et lire ses résultats",
    "Réduire les allocations avec Span<T>, stackalloc, ArrayPool et StringBuilder",
    "Diagnostiquer une application avec dotnet-counters et dotnet-trace"
  ],
  lesson: `
<h3>Règle n°1 : mesurer</h3>
<p>Une optimisation sans mesure est une supposition. Dans une API web, le temps est presque toujours perdu dans les <strong>entrées/sorties</strong> (requêtes SQL N+1, appels HTTP en série, absence d'index) bien avant le CPU. Commence par les traces (jour 25) et les requêtes SQL générées. Les micro-optimisations de cette leçon servent pour le code chaud : parsing, sérialisation, boucles exécutées des millions de fois.</p>

<h3>BenchmarkDotNet</h3>
<p>Mesurer avec un <code>Stopwatch</code> est trompeur : JIT, tiered compilation, GC et bruit du système faussent tout. <strong>BenchmarkDotNet</strong> fait le warm-up, répète les mesures et calcule les statistiques.</p>
<ul>
  <li>Toujours en <strong>Release</strong> (<code>dotnet run -c Release</code>), jamais avec le débogueur attaché.</li>
  <li><code>[MemoryDiagnoser]</code> affiche les octets alloués et le nombre de GC : c'est souvent plus important que le temps.</li>
  <li>Renvoie le résultat de la méthode benchmarkée, sinon le JIT peut supprimer le code « inutile ».</li>
  <li>Lis la colonne <em>Mean</em> avec l'<em>Error</em> et le <em>StdDev</em> : un écart de 2 % avec une erreur de 5 % n'est pas significatif.</li>
</ul>

<h3>Le GC et les allocations</h3>
<p>Chaque <code>new</code> d'un type référence alloue sur le tas managé. Le GC est générationnel : gen0 (objets récents, collecte rapide), gen1, gen2 (objets anciens, collecte coûteuse), et le <strong>LOH</strong> pour les objets de plus de 85 000 octets. Moins tu alloues, moins le GC travaille et plus la latence est stable (moins de pics au p99).</p>
<p>Sources d'allocations cachées : concaténation de chaînes dans une boucle, <code>string.Split</code>, <code>Substring</code>, LINQ sur un chemin chaud (itérateurs et closures), boxing d'un <code>struct</code> vers <code>object</code> ou une interface, lambdas qui capturent des variables.</p>

<h3>Span&lt;T&gt; et Memory&lt;T&gt;</h3>
<p><code>Span&lt;T&gt;</code> est une vue sur une zone mémoire contiguë (tableau, chaîne, pile) <strong>sans copie</strong>. <code>ReadOnlySpan&lt;char&gt;</code> permet de découper une chaîne sans créer de sous-chaînes. C'est un <code>ref struct</code> : il vit uniquement sur la pile, ne peut pas être un champ de classe, ni traverser un <code>await</code>. Pour le code asynchrone, utilise <code>Memory&lt;T&gt;</code>.</p>
<ul>
  <li><code>stackalloc</code> alloue un petit buffer sur la pile (garde-le petit, quelques centaines d'octets).</li>
  <li><code>ArrayPool&lt;T&gt;.Shared</code> loue et rend des tableaux réutilisables pour les gros buffers. Rends-les toujours dans un <code>finally</code>.</li>
  <li>Les API modernes ont des surcharges Span : <code>int.TryParse(ReadOnlySpan&lt;char&gt;)</code>, <code>TryFormat</code>, <code>MemoryExtensions.Split</code>.</li>
</ul>

<h3>Autres leviers simples</h3>
<ul>
  <li><code>StringBuilder</code> pour construire une chaîne en boucle, ou <code>string.Create</code>.</li>
  <li>Dimensionner les collections : <code>new List&lt;T&gt;(capacity)</code>, <code>new Dictionary&lt;K,V&gt;(capacity)</code>.</li>
  <li><code>FrozenDictionary</code> et <code>FrozenSet</code> (System.Collections.Frozen) pour des tables lues souvent et jamais modifiées.</li>
  <li><code>SearchValues&lt;T&gt;</code> pour chercher rapidement un ensemble de caractères.</li>
  <li>Sérialisation JSON avec le source generator de <code>System.Text.Json</code> (<code>JsonSerializerContext</code>).</li>
  <li>Côté EF Core : <code>AsNoTracking</code>, projection en DTO, requêtes compilées pour les requêtes très fréquentes.</li>
</ul>

<h3>Profiler en production</h3>
<p>Les outils globaux <code>dotnet-counters</code> (CPU, allocations par seconde, taille des générations, thread pool), <code>dotnet-trace</code> (trace CPU à ouvrir dans PerfView ou Visual Studio) et <code>dotnet-dump</code> (analyse de fuite mémoire) fonctionnent sans redémarrer l'application. Un thread pool saturé (<em>ThreadPool Queue Length</em> qui monte) indique souvent du code synchrone bloquant (<code>.Result</code>, <code>.Wait()</code>) dans du code async.</p>

<h3>Pièges courants</h3>
<ul>
  <li>Benchmarker en Debug ou avec une seule itération.</li>
  <li>Optimiser un code qui représente 0,1 % du temps total.</li>
  <li>Rendre le code illisible pour gagner quelques nanosecondes sur un chemin froid.</li>
  <li>Oublier de rendre un tableau à l'<code>ArrayPool</code>, ou l'utiliser après l'avoir rendu.</li>
</ul>

<div class="note"><strong>Niveau senior :</strong> tu fixes un objectif chiffré (p95 &lt; 200 ms, allocations &lt; X Mo/s), tu mesures, tu trouves le goulot avec une trace, tu corriges le goulot et tu remesures. Tu gardes le benchmark dans le dépôt pour détecter les régressions. Et tu sais expliquer au métier que la vraie optimisation était souvent un index SQL.</div>
`,
  examples: [
    {
      title: "Premier benchmark : concaténation vs StringBuilder",
      code: `// dotnet new console -n OrderFlow.Benchmarks
// dotnet add package BenchmarkDotNet
// Lancer : dotnet run -c Release
using System.Text;
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;

BenchmarkRunner.Run<StringBenchmarks>();

[MemoryDiagnoser]
public class StringBenchmarks
{
    [Params(10, 1000)]
    public int Count;

    [Benchmark(Baseline = true)]
    public string Concat()
    {
        var s = "";
        for (var i = 0; i < Count; i++) s += i;
        return s;
    }

    [Benchmark]
    public string Builder()
    {
        var sb = new StringBuilder();
        for (var i = 0; i < Count; i++) sb.Append(i);
        return sb.ToString();
    }
}`,
      explain: "<p>Avec <code>Count = 10</code>, la différence est minime. Avec 1000, la concaténation alloue des mégaoctets. Le paramétrage montre que la bonne réponse dépend de la taille.</p>"
    },
    {
      title: "Parser sans allocation avec ReadOnlySpan<char>",
      code: `// Entrée : "SKU-123;4;19.90" => (sku, quantité, prix)
public static class OrderLineParser
{
    // Version naïve : Split alloue un tableau et 3 chaînes
    public static (string Sku, int Qty, decimal Price) ParseSplit(string line)
    {
        var parts = line.Split(';');
        return (parts[0], int.Parse(parts[1]),
                decimal.Parse(parts[2], CultureInfo.InvariantCulture));
    }

    // Version Span : seule la chaîne du SKU est allouée
    public static (string Sku, int Qty, decimal Price) ParseSpan(string line)
    {
        ReadOnlySpan<char> span = line;

        var i = span.IndexOf(';');
        var sku = span[..i];
        span = span[(i + 1)..];

        i = span.IndexOf(';');
        var qty = int.Parse(span[..i]);
        var price = decimal.Parse(span[(i + 1)..], CultureInfo.InvariantCulture);

        return (sku.ToString(), qty, price);
    }
}`,
      explain: "<p>Le découpage <code>span[..i]</code> ne copie rien : c'est juste un pointeur et une longueur. <code>int.Parse</code> accepte directement un span.</p>"
    },
    {
      title: "ArrayPool pour un gros buffer",
      code: `public static async Task<long> CountBytesAsync(Stream stream, CancellationToken ct)
{
    var buffer = ArrayPool<byte>.Shared.Rent(81920); // peut renvoyer un tableau plus grand
    try
    {
        long total = 0;
        int read;
        while ((read = await stream.ReadAsync(buffer.AsMemory(0, 81920), ct)) > 0)
            total += read;
        return total;
    }
    finally
    {
        ArrayPool<byte>.Shared.Return(buffer); // toujours rendre, même en cas d'exception
    }
}`,
      explain: "<p>On utilise <code>Memory&lt;byte&gt;</code> (via <code>AsMemory</code>) car on traverse un <code>await</code>, ce qu'un <code>Span</code> ne peut pas faire.</p>"
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Benchmark LINQ vs boucle",
      prompt: "<p>Écris un benchmark qui compare la somme des nombres pairs d'un tableau de 10 000 <code>int</code> avec LINQ (<code>Where().Sum()</code>) et avec une boucle <code>foreach</code>. Active <code>[MemoryDiagnoser]</code> et note les résultats.</p>",
      hint: "<p>Initialise le tableau dans une méthode <code>[GlobalSetup]</code> pour ne pas mesurer sa création.</p>",
      solution: `[MemoryDiagnoser]
public class SumBenchmarks
{
    private int[] _data = [];

    [GlobalSetup]
    public void Setup() => _data = Enumerable.Range(0, 10_000).ToArray();

    [Benchmark(Baseline = true)]
    public int Linq() => _data.Where(x => x % 2 == 0).Sum();

    [Benchmark]
    public int Loop()
    {
        var sum = 0;
        foreach (var x in _data)
            if (x % 2 == 0) sum += x;
        return sum;
    }
}
// Résultat typique : la boucle est plusieurs fois plus rapide et n'alloue rien ;
// LINQ alloue l'itérateur et le délégué. Sur un chemin froid, garde LINQ (plus lisible).`
    },
    {
      level: "moyen",
      title: "Formater une référence de commande sans allocation intermédiaire",
      prompt: "<p>Une référence de commande a le format <code>ORD-2026-000042</code> (année + numéro sur 6 chiffres). Écris <code>FormatReference(int year, int number)</code> avec <code>string.Create</code> pour n'allouer que la chaîne finale, puis compare avec <code>$\"ORD-{year}-{number:D6}\"</code> dans un benchmark.</p>",
      hint: "<p>La longueur est fixe : 4 + 4 + 1 + 6 = 15. Dans le callback, utilise <code>TryFormat</code> sur des tranches du span.</p>",
      solution: `public static class OrderReference
{
    public static string FormatInterpolated(int year, int number) =>
        $"ORD-{year}-{number:D6}";

    public static string FormatCreate(int year, int number) =>
        string.Create(15, (year, number), static (span, state) =>
        {
            "ORD-".AsSpan().CopyTo(span);
            state.year.TryFormat(span[4..8], out _);
            span[8] = '-';
            state.number.TryFormat(span[9..], out _, "D6");
        });
}

[MemoryDiagnoser]
public class ReferenceBenchmarks
{
    [Benchmark(Baseline = true)]
    public string Interpolated() => OrderReference.FormatInterpolated(2026, 42);

    [Benchmark]
    public string Create() => OrderReference.FormatCreate(2026, 42);
}
// Note : depuis C# 10, l'interpolation utilise DefaultInterpolatedStringHandler et
// est déjà très efficace. L'écart est faible : c'est une bonne leçon sur le fait
// de mesurer avant de complexifier le code.`
    },
    {
      level: "difficile",
      title: "Trouver le goulot d'une API",
      prompt: "<p>Ajoute à OrderFlow un endpoint volontairement lent : il charge toutes les commandes avec leurs lignes sans <code>AsNoTracking</code>, calcule un total en LINQ en mémoire et sérialise le résultat. Utilise <code>dotnet-counters</code> pendant un test de charge (<code>bombardier</code> ou <code>k6</code>), identifie les problèmes, corrige-les et rapporte les chiffres avant/après (requêtes/s, allocations/s, p95).</p>",
      hint: "<p>Installe l'outil : <code>dotnet tool install -g dotnet-counters</code>, puis <code>dotnet-counters monitor -n OrderFlow.Api --counters System.Runtime,Microsoft.AspNetCore.Hosting</code>. Le calcul doit descendre dans SQL.</p>",
      solution: `// AVANT : tout est chargé en mémoire et suivi par le change tracker
app.MapGet("/api/stats/slow", async (AppDbContext db) =>
{
    var orders = await db.Orders.Include(o => o.Lines).ToListAsync();
    var result = orders
        .GroupBy(o => o.CustomerId)
        .Select(g => new { CustomerId = g.Key, Total = g.SelectMany(o => o.Lines).Sum(l => l.Quantity * l.UnitPrice) })
        .ToList();
    return Results.Ok(result);
});

// APRÈS : agrégation faite par la base, aucune entité matérialisée
app.MapGet("/api/stats/fast", async (AppDbContext db, CancellationToken ct) =>
{
    var result = await db.OrderLines
        .GroupBy(l => l.Order.CustomerId)
        .Select(g => new CustomerTotalDto(g.Key, g.Sum(l => l.Quantity * l.UnitPrice)))
        .ToListAsync(ct);
    return Results.Ok(result);
});

public sealed record CustomerTotalDto(string CustomerId, decimal Total);

// Commandes de mesure :
//   dotnet tool install -g dotnet-counters
//   dotnet-counters monitor -n OrderFlow.Api --counters System.Runtime,Microsoft.AspNetCore.Hosting
//   bombardier -c 50 -d 30s https://localhost:5001/api/stats/slow
//   bombardier -c 50 -d 30s https://localhost:5001/api/stats/fast
// À observer : "Allocation Rate", "GC Heap Size", "% Time in GC", "requests-per-second".
// Avec 10 000 commandes, la version rapide divise typiquement les allocations
// par plus de 100 et multiplie le débit. Ajoute aussi un index sur Orders.CustomerId.`
    }
  ],
  project: "<p><strong>OrderFlow :</strong> crée un projet <code>OrderFlow.Benchmarks</code> dans la solution. Benchmarke la fonction de calcul du total d'une commande et le parser d'import CSV des produits, réécris le parser avec <code>ReadOnlySpan&lt;char&gt;</code> et documente le gain dans le README. Lance ensuite <code>dotnet-counters</code> sur l'API pendant que ton front Angular charge la liste des commandes et vérifie qu'il n'y a pas de requête N+1.</p>",
  resources: [
    { label: "Documentation BenchmarkDotNet", url: "https://benchmarkdotnet.org/articles/overview.html" },
    { label: "Utilisation de Span<T> et Memory<T>", url: "https://learn.microsoft.com/dotnet/standard/memory-and-spans/memory-t-usage-guidelines" },
    { label: "dotnet-counters", url: "https://learn.microsoft.com/dotnet/core/diagnostics/dotnet-counters" },
    { label: "Fondamentaux du garbage collector", url: "https://learn.microsoft.com/dotnet/standard/garbage-collection/fundamentals" }
  ]
});

/* ===================== JOUR 25 : OBSERVABILITÉ & ASPIRE ===================== */
window.COURSE.push({
  day: 25, week: 4,
  title: "Observabilité : OpenTelemetry, health checks et .NET Aspire",
  summary: "Savoir ce qui se passe en production grâce aux logs, métriques et traces, et orchestrer l'environnement local avec Aspire.",
  objectives: [
    "Comprendre les trois piliers : logs, métriques, traces distribuées",
    "Instrumenter une API avec OpenTelemetry et créer ses propres métriques et spans",
    "Ajouter des health checks et orchestrer OrderFlow avec .NET Aspire"
  ],
  lesson: `
<h3>Les trois piliers</h3>
<ul>
  <li><strong>Logs</strong> : des événements horodatés. En .NET, on écrit avec <code>ILogger</code> en <strong>logging structuré</strong> (<code>logger.LogInformation("Commande {OrderId} créée", id)</code>) : <code>OrderId</code> devient un champ interrogeable, pas un bout de texte.</li>
  <li><strong>Métriques</strong> : des valeurs agrégées dans le temps (requêtes/s, latence p95, commandes créées). Peu coûteuses, idéales pour les alertes.</li>
  <li><strong>Traces</strong> : le parcours d'une requête à travers les services. Une trace est un arbre de <em>spans</em> ; chaque span a une durée, des attributs et un parent. Le contexte est propagé par l'en-tête HTTP <code>traceparent</code> (standard W3C).</li>
</ul>

<h3>OpenTelemetry en .NET</h3>
<p>OpenTelemetry (OTel) est le standard ouvert pour produire ces données et les envoyer à n'importe quel backend (Jaeger, Grafana Tempo/Prometheus/Loki, Azure Monitor, Datadog…) via le protocole <strong>OTLP</strong>. .NET s'appuie sur ses propres API natives, qu'OTel collecte :</p>
<ul>
  <li><code>System.Diagnostics.ActivitySource</code> et <code>Activity</code> pour les traces (une <code>Activity</code> = un span).</li>
  <li><code>System.Diagnostics.Metrics.Meter</code> pour les métriques (<code>Counter</code>, <code>Histogram</code>, <code>UpDownCounter</code>).</li>
  <li><code>ILogger</code> pour les logs.</li>
</ul>
<p>Les bibliothèques d'instrumentation (<code>OpenTelemetry.Instrumentation.AspNetCore</code>, <code>.Http</code>, <code>.EntityFrameworkCore</code> ou les packages Npgsql/SqlClient) créent automatiquement les spans pour les requêtes entrantes, les appels <code>HttpClient</code> et les requêtes SQL. Tu ajoutes tes propres spans pour les étapes métier importantes.</p>

<h3>Health checks</h3>
<p><code>AddHealthChecks()</code> et <code>MapHealthChecks("/health")</code> exposent l'état de l'application. Distingue deux sondes :</p>
<ul>
  <li><strong>Liveness</strong> (<code>/alive</code>) : le processus répond. Si elle échoue, l'orchestrateur redémarre le conteneur. Elle ne doit <em>pas</em> dépendre de la base, sinon une panne de base provoque des redémarrages en boucle.</li>
  <li><strong>Readiness</strong> (<code>/health</code>) : l'application peut servir du trafic (base, Redis, broker joignables). Si elle échoue, on retire l'instance du load balancer.</li>
</ul>
<p>N'expose pas le détail des dépendances publiquement : c'est une information utile à un attaquant.</p>

<h3>.NET Aspire</h3>
<p>.NET Aspire est une pile pour développer des applications distribuées. Il apporte :</p>
<ul>
  <li>un projet <strong>AppHost</strong> qui décrit en C# ton système (API, front, PostgreSQL, Redis, RabbitMQ) et le lance en local, conteneurs compris, avec un seul <code>dotnet run</code> ;</li>
  <li>un projet <strong>ServiceDefaults</strong> qui configure en une ligne OpenTelemetry, les health checks, la résilience HTTP et la découverte de services ;</li>
  <li>un <strong>dashboard</strong> local qui affiche logs, traces et métriques de tous les services en temps réel ;</li>
  <li>des <strong>intégrations</strong> (packages <code>Aspire.Hosting.*</code> côté AppHost, <code>Aspire.*</code> côté client) qui injectent les chaînes de connexion automatiquement.</li>
</ul>
<p>Aspire peut aussi orchestrer ton front : <code>AddNpmApp</code> (ou <code>AddJavaScriptApp</code> selon la version) lance l'application Angular et lui passe l'URL de l'API. Aspire ne remplace pas ta plateforme de production, mais il peut générer les manifestes de déploiement (Azure Container Apps, Kubernetes, Docker Compose).</p>

<h3>Pièges courants</h3>
<ul>
  <li>Logs par interpolation (<code>$"Commande {id}"</code>) : tu perds la structure et tu alloues même si le niveau est désactivé.</li>
  <li>Logger des données sensibles (mots de passe, tokens, données personnelles).</li>
  <li>Métriques à forte cardinalité : mettre l'<code>userId</code> en tag d'une métrique crée une série par utilisateur et fait exploser le backend. Les identifiants vont dans les traces et les logs.</li>
  <li>Échantillonnage à 100 % des traces en production à fort trafic : coûteux. Utilise un sampler.</li>
</ul>

<div class="note"><strong>Niveau senior :</strong> l'observabilité se conçoit avant l'incident. Définis des SLO (ex. 99,5 % des requêtes en moins de 300 ms), alerte sur les symptômes vus par l'utilisateur (taux d'erreur, latence) plutôt que sur le CPU, et assure-toi qu'un <code>traceId</code> relie le log d'erreur, la trace et la requête du front.</div>
`,
  examples: [
    {
      title: "Configurer OpenTelemetry sans Aspire",
      code: `// dotnet add package OpenTelemetry.Extensions.Hosting
// dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
// dotnet add package OpenTelemetry.Instrumentation.AspNetCore
// dotnet add package OpenTelemetry.Instrumentation.Http
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService("orderflow-api"))
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddSource(OrderFlowTelemetry.SourceName))
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddRuntimeInstrumentation()
        .AddMeter(OrderFlowTelemetry.MeterName))
    .UseOtlpExporter(); // lit OTEL_EXPORTER_OTLP_ENDPOINT

builder.Logging.AddOpenTelemetry(o =>
{
    o.IncludeFormattedMessage = true;
    o.IncludeScopes = true;
});

// Jaeger en local : docker run -p 16686:16686 -p 4317:4317 jaegertracing/all-in-one
// puis OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317`,
      explain: "<p>Une seule configuration pour les trois piliers. L'exporteur OTLP te laisse changer de backend sans toucher au code.</p>"
    },
    {
      title: "Spans et métriques métier",
      code: `public static class OrderFlowTelemetry
{
    public const string SourceName = "OrderFlow";
    public const string MeterName = "OrderFlow";

    public static readonly ActivitySource Source = new(SourceName);
    private static readonly Meter Meter = new(MeterName);

    public static readonly Counter<long> OrdersPlaced =
        Meter.CreateCounter<long>("orderflow.orders.placed", unit: "{order}");

    public static readonly Histogram<double> OrderAmount =
        Meter.CreateHistogram<double>("orderflow.order.amount", unit: "EUR");
}

public sealed class PlaceOrderHandler(AppDbContext db, ILogger<PlaceOrderHandler> logger)
{
    public async Task<Guid> Handle(PlaceOrder cmd, CancellationToken ct)
    {
        using var activity = OrderFlowTelemetry.Source.StartActivity("PlaceOrder");
        activity?.SetTag("order.lines", cmd.Lines.Count);

        var order = Order.Create(cmd.CustomerId, cmd.Lines);
        db.Orders.Add(order);
        await db.SaveChangesAsync(ct);

        activity?.SetTag("order.id", order.Id);
        // Tags à faible cardinalité seulement sur les métriques
        OrderFlowTelemetry.OrdersPlaced.Add(1, new KeyValuePair<string, object?>("channel", cmd.Channel));
        OrderFlowTelemetry.OrderAmount.Record((double)order.Total);

        logger.LogInformation("Commande {OrderId} créée pour {Total}", order.Id, order.Total);
        return order.Id;
    }
}`,
      explain: "<p><code>StartActivity</code> renvoie <code>null</code> si personne n'écoute : d'où le <code>?.</code>, et un coût quasi nul quand le tracing est désactivé.</p>"
    },
    {
      title: "AppHost Aspire pour OrderFlow",
      code: `// OrderFlow.AppHost/AppHost.cs
var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres").WithDataVolume();
var db = postgres.AddDatabase("orderflowdb");
var redis = builder.AddRedis("redis");
var rabbit = builder.AddRabbitMQ("rabbit").WithManagementPlugin();

var api = builder.AddProject<Projects.OrderFlow_Api>("api")
    .WithReference(db).WaitFor(db)
    .WithReference(redis)
    .WithReference(rabbit).WaitFor(rabbit)
    .WithHttpHealthCheck("/health");

builder.AddNpmApp("web", "../orderflow-web", "start")
    .WithReference(api)
    .WithHttpEndpoint(env: "PORT")
    .WithExternalHttpEndpoints();

builder.Build().Run();

// OrderFlow.Api/Program.cs
var app = WebApplication.CreateBuilder(args);
app.AddServiceDefaults();                          // OTel + health + résilience
app.AddNpgsqlDbContext<AppDbContext>("orderflowdb"); // chaîne injectée par l'AppHost
app.AddRedisDistributedCache("redis");`,
      explain: "<p>Les noms (<code>\"orderflowdb\"</code>, <code>\"redis\"</code>) relient l'AppHost aux intégrations clientes. Un <code>dotnet run</code> sur l'AppHost démarre tout et ouvre le dashboard. Selon ta version d'Aspire, <code>AddNpmApp</code> peut s'appeler <code>AddJavaScriptApp</code>.</p>"
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Health checks liveness et readiness",
      prompt: "<p>Ajoute deux endpoints : <code>/alive</code> qui ne vérifie que le processus et <code>/health</code> qui vérifie aussi la base PostgreSQL. Utilise des tags pour séparer les checks.</p>",
      hint: "<p><code>AddCheck(\"self\", () =&gt; HealthCheckResult.Healthy(), tags: [\"live\"])</code> et un <code>Predicate</code> dans <code>HealthCheckOptions</code>.</p>",
      solution: `// dotnet add package AspNetCore.HealthChecks.NpgSql
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
    .AddNpgSql(builder.Configuration.GetConnectionString("db")!, name: "postgres", tags: ["ready"]);

var app = builder.Build();

// Liveness : uniquement le check "self"
app.MapHealthChecks("/alive", new HealthCheckOptions
{
    Predicate = c => c.Tags.Contains("live")
});

// Readiness : tous les checks
app.MapHealthChecks("/health");`
    },
    {
      level: "moyen",
      title: "Métrique des commandes annulées",
      prompt: "<p>Ajoute un compteur <code>orderflow.orders.cancelled</code> avec un tag <code>reason</code> (valeurs limitées : <code>customer</code>, <code>payment_timeout</code>, <code>stock</code>). Incrémente-le dans le handler d'annulation et vérifie la valeur avec <code>dotnet-counters monitor --counters OrderFlow</code> ou dans le dashboard Aspire.</p>",
      hint: "<p>Utilise un <code>enum</code> pour la raison afin de garantir une cardinalité faible, et convertis-le en chaîne pour le tag.</p>",
      solution: `public enum CancelReason { Customer, PaymentTimeout, Stock }

public static partial class OrderFlowTelemetry
{
    public static readonly Counter<long> OrdersCancelled =
        Meter.CreateCounter<long>("orderflow.orders.cancelled", unit: "{order}",
            description: "Nombre de commandes annulées");

    public static string ToTag(this CancelReason reason) => reason switch
    {
        CancelReason.Customer => "customer",
        CancelReason.PaymentTimeout => "payment_timeout",
        CancelReason.Stock => "stock",
        _ => "unknown"
    };
}

public sealed class CancelOrderHandler(AppDbContext db)
{
    public async Task Handle(Guid orderId, CancelReason reason, CancellationToken ct)
    {
        var order = await db.Orders.FindAsync([orderId], ct)
            ?? throw new KeyNotFoundException();
        order.Cancel();
        await db.SaveChangesAsync(ct);

        OrderFlowTelemetry.OrdersCancelled.Add(1,
            new KeyValuePair<string, object?>("reason", reason.ToTag()));
    }
}
// Vérification : dotnet-counters monitor -n OrderFlow.Api --counters OrderFlow
// (penser à .AddMeter("OrderFlow") dans la config OTel pour l'export)`
    },
    {
      level: "difficile",
      title: "Trace de bout en bout avec le front Angular",
      prompt: "<p>Fais en sorte que l'API renvoie le <code>traceId</code> courant dans l'en-tête <code>X-Trace-Id</code> et dans les réponses <code>ProblemDetails</code>. Côté Angular, affiche ce <code>traceId</code> dans le message d'erreur pour que le support puisse retrouver la trace. Vérifie qu'un appel HTTP sortant de l'API vers un autre service apparaît comme enfant dans la même trace.</p>",
      hint: "<p><code>Activity.Current?.TraceId.ToString()</code> dans un middleware. Pour <code>ProblemDetails</code>, utilise <code>AddProblemDetails(o =&gt; o.CustomizeProblemDetails = ...)</code>. Côté Angular, un <code>HttpInterceptor</code> lit l'en-tête (pense à l'exposer via CORS).</p>",
      solution: `// API - Program.cs
builder.Services.AddProblemDetails(o => o.CustomizeProblemDetails = ctx =>
{
    ctx.ProblemDetails.Extensions["traceId"] =
        Activity.Current?.TraceId.ToString() ?? ctx.HttpContext.TraceIdentifier;
});

builder.Services.AddCors(o => o.AddPolicy("web", p => p
    .WithOrigins("http://localhost:4200")
    .AllowAnyHeader().AllowAnyMethod()
    .WithExposedHeaders("X-Trace-Id"))); // sinon Angular ne voit pas l'en-tête

var app = builder.Build();
app.UseCors("web");
app.UseExceptionHandler();

app.Use(async (ctx, next) =>
{
    ctx.Response.OnStarting(() =>
    {
        var traceId = Activity.Current?.TraceId.ToString();
        if (traceId is not null) ctx.Response.Headers["X-Trace-Id"] = traceId;
        return Task.CompletedTask;
    });
    await next();
});

// Appel sortant : AddHttpClientInstrumentation propage traceparent automatiquement,
// le span du HttpClient sera enfant du span de la requête entrante.
builder.Services.AddHttpClient<PaymentClient>(c => c.BaseAddress = new Uri("https://payments.local"));

// Angular - trace-id.interceptor.ts
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

export const traceIdInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const traceId = err.headers?.get('X-Trace-Id') ?? err.error?.traceId;
      notify.error('Une erreur est survenue. Référence : ' + (traceId ?? 'inconnue'));
      return throwError(() => err);
    })
  );
};
// app.config.ts : provideHttpClient(withInterceptors([traceIdInterceptor]))`
    }
  ],
  project: "<p><strong>OrderFlow :</strong> crée les projets <code>OrderFlow.AppHost</code> et <code>OrderFlow.ServiceDefaults</code> (<code>dotnet new aspire-apphost</code> et <code>dotnet new aspire-servicedefaults</code>). Déclare PostgreSQL, Redis, RabbitMQ, l'API et ton front Angular dans l'AppHost. Ajoute une <code>ActivitySource</code> et deux métriques métier (commandes créées, montant). Lance l'AppHost, crée une commande depuis le front et retrouve dans le dashboard Aspire la trace complète : requête HTTP, requête SQL, publication RabbitMQ et consommation.</p>",
  resources: [
    { label: "Observabilité .NET avec OpenTelemetry", url: "https://learn.microsoft.com/dotnet/core/diagnostics/observability-with-otel" },
    { label: "Health checks dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/host-and-deploy/health-checks" },
    { label: "Vue d'ensemble de .NET Aspire", url: "https://learn.microsoft.com/dotnet/aspire/get-started/aspire-overview" },
    { label: "Créer des métriques en .NET", url: "https://learn.microsoft.com/dotnet/core/diagnostics/metrics-instrumentation" }
  ]
});

/* ===================== JOUR 26 : DOCKER & CI/CD ===================== */
window.COURSE.push({
  day: 26, week: 4,
  title: "Docker, CI/CD avec GitHub Actions et déploiement",
  summary: "Construire une image légère et sûre, automatiser build et tests à chaque push, et déployer sans intervention manuelle.",
  objectives: [
    "Écrire un Dockerfile multi-stage optimisé pour une API .NET 10",
    "Mettre en place un pipeline GitHub Actions : restore, build, tests, image",
    "Gérer la configuration, les secrets et les migrations EF Core au déploiement"
  ],
  lesson: `
<h3>Pourquoi conteneuriser</h3>
<p>Une image Docker embarque l'application et son runtime : elle se comporte pareil sur ton poste, en CI et en production. C'est aussi l'unité de déploiement de la plupart des plateformes (Azure Container Apps, Kubernetes, AWS ECS, Fly, Render…).</p>

<h3>Dockerfile multi-stage</h3>
<p>Le principe : une première étape utilise l'image <strong>SDK</strong> (lourde, avec le compilateur) pour restaurer et publier ; l'étape finale part de l'image <strong>runtime ASP.NET</strong> (légère) et ne copie que le résultat de <code>dotnet publish</code>.</p>
<ul>
  <li><strong>Cache des couches</strong> : copie d'abord les <code>.csproj</code> et lance <code>dotnet restore</code>, puis copie le reste du code. Tant que les dépendances ne changent pas, le restore est mis en cache.</li>
  <li><strong>Utilisateur non root</strong> : les images .NET 8+ fournissent l'utilisateur <code>app</code> ; ajoute <code>USER $APP_UID</code>. Le port par défaut est <code>8080</code>.</li>
  <li><strong>Images plus petites</strong> : les variantes <code>-alpine</code>, <code>-noble-chiseled</code> (Ubuntu sans shell ni gestionnaire de paquets) réduisent la taille et la surface d'attaque.</li>
  <li>Un fichier <code>.dockerignore</code> exclut <code>bin/</code>, <code>obj/</code>, <code>.git</code>, <code>node_modules</code>.</li>
</ul>
<p>Alternative sans Dockerfile : <code>dotnet publish /t:PublishContainer</code> construit directement une image grâce au SDK. Pratique, mais le Dockerfile reste la référence à connaître.</p>

<h3>Configuration et secrets</h3>
<p>ASP.NET Core lit la configuration depuis les variables d'environnement : <code>ConnectionStrings__Db</code> correspond à <code>ConnectionStrings:Db</code> (double underscore = deux-points). <strong>Aucun secret dans l'image ni dans le dépôt</strong> : utilise les secrets GitHub en CI, et un coffre (Azure Key Vault, AWS Secrets Manager) ou les secrets de la plateforme en production. En local, <code>dotnet user-secrets</code>.</p>

<h3>CI/CD avec GitHub Actions</h3>
<p>Un workflow est un fichier YAML dans <code>.github/workflows/</code>. Il se déclenche sur un événement (<code>push</code>, <code>pull_request</code>), contient des <em>jobs</em> composés d'<em>étapes</em>. Un pipeline typique :</p>
<ul>
  <li><strong>CI</strong> (à chaque PR) : <code>actions/checkout</code>, <code>actions/setup-dotnet</code>, <code>dotnet restore</code>, <code>dotnet build --no-restore -c Release</code>, <code>dotnet test --no-build</code>. Les tests d'intégration avec Testcontainers fonctionnent sur les runners Ubuntu, Docker y étant disponible.</li>
  <li><strong>CD</strong> (sur <code>main</code>) : construire l'image, la pousser dans un registre (GitHub Container Registry <code>ghcr.io</code>, Azure Container Registry), puis déployer.</li>
</ul>
<p>Tague les images avec le SHA du commit, pas seulement <code>latest</code> : tu sais exactement quel code tourne et tu peux revenir en arrière.</p>

<h3>Migrations EF Core en production</h3>
<p>Évite <code>Database.Migrate()</code> au démarrage de l'API : avec plusieurs instances, elles migrent en même temps, et l'API a besoin de droits DDL. Préfère :</p>
<ul>
  <li>un <strong>script SQL idempotent</strong> : <code>dotnet ef migrations script --idempotent</code>, relu puis appliqué par le pipeline ;</li>
  <li>ou un <strong>migration bundle</strong> : <code>dotnet ef migrations bundle</code> produit un exécutable qui applique les migrations, lancé comme étape du déploiement.</li>
</ul>
<p>Et rends les migrations compatibles avec l'ancienne version du code (ajouter une colonne nullable d'abord, la rendre obligatoire plus tard) pour permettre un déploiement sans interruption.</p>

<h3>Pièges courants</h3>
<ul>
  <li>Copier tout le dossier avant le restore : chaque modification de code invalide le cache et relance le téléchargement des packages.</li>
  <li>Exécuter le conteneur en root, ou exposer le port 80 alors que .NET 8+ écoute sur 8080.</li>
  <li>Oublier <code>ASPNETCORE_ENVIRONMENT</code> : l'application tourne en <code>Production</code> par défaut dans le conteneur, ce qui est correct, mais il faut que la config de production existe.</li>
  <li>Un pipeline qui déploie même si les tests échouent : le job de déploiement doit dépendre du job de tests (<code>needs:</code>).</li>
</ul>

<div class="note"><strong>Niveau senior :</strong> un bon pipeline est rapide (cache NuGet, jobs en parallèle), reproductible (versions de SDK fixées via <code>global.json</code>), sûr (scan de vulnérabilités avec <code>dotnet list package --vulnerable</code>, permissions minimales du <code>GITHUB_TOKEN</code>) et réversible (rollback vers l'image du commit précédent en une action).</div>
`,
  examples: [
    {
      title: "Dockerfile multi-stage pour OrderFlow.Api",
      code: `# Dockerfile (à la racine de la solution)
# ---- Étape 1 : build ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copier uniquement les projets pour profiter du cache du restore
COPY OrderFlow.slnx ./
COPY src/OrderFlow.Domain/OrderFlow.Domain.csproj src/OrderFlow.Domain/
COPY src/OrderFlow.Application/OrderFlow.Application.csproj src/OrderFlow.Application/
COPY src/OrderFlow.Infrastructure/OrderFlow.Infrastructure.csproj src/OrderFlow.Infrastructure/
COPY src/OrderFlow.Api/OrderFlow.Api.csproj src/OrderFlow.Api/
RUN dotnet restore src/OrderFlow.Api/OrderFlow.Api.csproj

# Copier le reste et publier
COPY . .
RUN dotnet publish src/OrderFlow.Api/OrderFlow.Api.csproj -c Release -o /app/publish --no-restore

# ---- Étape 2 : runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "OrderFlow.Api.dll"]

# .dockerignore
# **/bin
# **/obj
# .git
# **/node_modules

# Build et lancement :
# docker build -t orderflow-api .
# docker run -p 8080:8080 -e ConnectionStrings__Db="Host=host.docker.internal;Database=orderflow;Username=postgres;Password=postgres" orderflow-api`,
      explain: "<p>L'image finale ne contient ni SDK ni code source. <code>$APP_UID</code> est une variable fournie par l'image Microsoft. Si ta solution est au format <code>.sln</code>, adapte la ligne correspondante.</p>"
    },
    {
      title: "Workflow GitHub Actions : CI puis image",
      code: `# .github/workflows/ci.yml
name: ci

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read
  packages: write

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '10.0.x'
          cache: true
          cache-dependency-path: '**/packages.lock.json'
      - run: dotnet restore
      - run: dotnet build --no-restore -c Release
      - run: dotnet test --no-build -c Release --logger trx --results-directory TestResults
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: TestResults

  image:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: |
            ghcr.io/\${{ github.repository }}/api:\${{ github.sha }}
            ghcr.io/\${{ github.repository }}/api:latest`,
      explain: "<p><code>needs: test</code> garantit qu'aucune image n'est publiée si les tests échouent. Le cache NuGet exige des <code>packages.lock.json</code> (<code>RestorePackagesWithLockFile</code> dans le <code>Directory.Build.props</code>) ; sans eux, retire les deux lignes de cache.</p>"
    },
    {
      title: "docker-compose pour tester l'image en local",
      code: `# compose.yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: orderflow
    ports: ["5432:5432"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10

  api:
    build: .
    ports: ["8080:8080"]
    environment:
      ASPNETCORE_ENVIRONMENT: Development
      ConnectionStrings__Db: Host=db;Database=orderflow;Username=postgres;Password=postgres
    depends_on:
      db:
        condition: service_healthy

# docker compose up --build`,
      explain: "<p>Dans le réseau Compose, l'API joint la base par son nom de service (<code>db</code>). <code>condition: service_healthy</code> attend que PostgreSQL soit prêt.</p>"
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Réduire la taille de l'image",
      prompt: "<p>Construis l'image du premier exemple et note sa taille (<code>docker images</code>). Remplace l'image runtime par la variante <code>10.0-noble-chiseled</code> (ou <code>10.0-alpine</code>), reconstruis et compare. Pourquoi ne peux-tu plus faire <code>docker exec -it ... sh</code> avec chiseled ?</p>",
      hint: "<p>Seule la ligne <code>FROM ... AS final</code> change. Les images chiseled n'ont pas de shell.</p>",
      solution: `# Seule l'étape finale change
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled AS final
WORKDIR /app
COPY --from=build /app/publish .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "OrderFlow.Api.dll"]

# Comparaison :
# docker build -t orderflow-api:full .
# (modifier le FROM)
# docker build -t orderflow-api:chiseled .
# docker images orderflow-api
# L'image chiseled est nettement plus légère (souvent environ deux fois moins).
#
# Pourquoi pas de "sh" : une image chiseled ne contient ni shell, ni gestionnaire
# de paquets, ni outils. Moins de surface d'attaque et moins de CVE à corriger.
# Pour déboguer : docker debug, ou une image de debug séparée, ou les logs/traces.`
    },
    {
      level: "moyen",
      title: "Tests d'intégration et couverture dans la CI",
      prompt: "<p>Modifie le job <code>test</code> pour : fixer la version du SDK via <code>global.json</code>, collecter la couverture avec <code>--collect:\"XPlat Code Coverage\"</code>, et faire échouer le pipeline si un package a une vulnérabilité connue.</p>",
      hint: "<p><code>actions/setup-dotnet</code> accepte <code>global-json-file</code>. <code>dotnet list package --vulnerable --include-transitive</code> affiche les vulnérabilités ; il faut tester sa sortie.</p>",
      solution: `# global.json (racine du dépôt)
# {
#   "sdk": { "version": "10.0.100", "rollForward": "latestFeature" }
# }

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          global-json-file: global.json
      - run: dotnet restore
      - name: Vérifier les vulnérabilités
        run: |
          dotnet list package --vulnerable --include-transitive 2>&1 | tee vuln.txt
          if grep -q -i "has the following vulnerable packages" vuln.txt; then
            echo "Packages vulnérables détectés"
            exit 1
          fi
      - run: dotnet build --no-restore -c Release
      - name: Tests (Testcontainers utilise le Docker du runner)
        run: dotnet test --no-build -c Release --collect:"XPlat Code Coverage" --results-directory TestResults
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: coverage
          path: TestResults/**/coverage.cobertura.xml`
    },
    {
      level: "difficile",
      title: "Migrations avec un bundle EF Core dans le pipeline",
      prompt: "<p>Ajoute un job <code>deploy</code> qui dépend de <code>image</code>, utilise l'environnement GitHub <code>production</code> (avec approbation manuelle), génère un <code>migration bundle</code> EF Core, l'exécute contre la base de production avec une chaîne de connexion stockée dans les secrets, puis déploie l'image taguée avec le SHA. Explique pourquoi l'ordre migrations puis déploiement impose des migrations rétrocompatibles.</p>",
      hint: "<p><code>dotnet tool install --global dotnet-ef</code>, puis <code>dotnet ef migrations bundle --project src/OrderFlow.Infrastructure --startup-project src/OrderFlow.Api -o efbundle</code> et <code>./efbundle --connection \"...\"</code>. Le déploiement peut être une commande <code>az containerapp update</code>.</p>",
      solution: `  deploy:
    needs: image
    runs-on: ubuntu-latest
    environment: production   # approbation manuelle configurée dans les settings du dépôt
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          global-json-file: global.json

      - name: Générer le bundle de migrations
        run: |
          dotnet tool install --global dotnet-ef
          dotnet ef migrations bundle \\
            --project src/OrderFlow.Infrastructure \\
            --startup-project src/OrderFlow.Api \\
            --configuration Release \\
            --self-contained -r linux-x64 \\
            -o efbundle

      - name: Appliquer les migrations
        run: ./efbundle --connection "\${{ secrets.PROD_DB_CONNECTION }}"

      - uses: azure/login@v2
        with:
          creds: \${{ secrets.AZURE_CREDENTIALS }}

      - name: Déployer l'image du commit
        run: |
          az containerapp update \\
            --name orderflow-api \\
            --resource-group orderflow-rg \\
            --image ghcr.io/\${{ github.repository }}/api:\${{ github.sha }}

# Pourquoi des migrations rétrocompatibles :
# entre l'étape "Appliquer les migrations" et la fin du déploiement, l'ANCIENNE
# version de l'API tourne encore sur le NOUVEAU schéma. Si la migration supprime
# ou renomme une colonne que l'ancien code lit, la production plante pendant
# quelques minutes. On procède donc en deux temps (expand/contract) :
#  1. ajouter la nouvelle colonne (nullable), déployer le code qui écrit les deux ;
#  2. dans un déploiement suivant, supprimer l'ancienne colonne.
# Un rollback de l'image reste alors possible sans toucher à la base.`
    }
  ],
  project: "<p><strong>OrderFlow :</strong> ajoute un <code>Dockerfile</code> multi-stage et un <code>.dockerignore</code>, un <code>compose.yaml</code> (API + PostgreSQL + Redis) et un workflow GitHub Actions qui build et teste à chaque PR, puis publie l'image sur <code>ghcr.io</code> taguée avec le SHA sur <code>main</code>. Ajoute un second workflow pour ton front Angular (<code>npm ci</code>, <code>ng test --watch=false</code>, <code>ng build</code>). Bonus : déploie l'API sur Azure Container Apps (offre gratuite) ou un autre hébergeur de conteneurs et applique les migrations via un bundle EF Core.</p>",
  resources: [
    { label: "Conteneuriser une application .NET", url: "https://learn.microsoft.com/dotnet/core/docker/build-container" },
    { label: "Images Docker .NET (registre Microsoft)", url: "https://mcr.microsoft.com/product/dotnet/aspnet/about" },
    { label: "Construire et tester .NET avec GitHub Actions", url: "https://docs.github.com/actions/use-cases-and-examples/building-and-testing/building-and-testing-net" },
    { label: "Appliquer les migrations EF Core", url: "https://learn.microsoft.com/ef/core/managing-schemas/migrations/applying" }
  ]
});
