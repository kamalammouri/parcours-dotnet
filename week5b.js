window.COURSE = window.COURSE || [];

// ───────────────────────────── J33 ─────────────────────────────
window.COURSE.push({
  day: 33, week: 5,
  title: "Design patterns créationnels et structurels",
  summary: "Factory, Builder, Singleton, Adapter, Decorator, Facade et Proxy : les reconnaître dans .NET et les écrire en C# moderne.",
  objectives: [
    "Expliquer ce qu'est un design pattern et savoir quand il apporte quelque chose",
    "Écrire Factory Method, Abstract Factory et Builder en C# moderne",
    "Préférer AddSingleton de la DI à un Singleton écrit à la main",
    "Envelopper une API externe avec un Adapter et ajouter un cache avec un Decorator",
    "Reconnaître Facade et Proxy dans les bibliothèques .NET que tu utilises déjà"
  ],
  lesson: `<p><em>Prérequis : à faire après J15 (SOLID et Clean Architecture) si tu veux, sinon après J30.</em></p>
<h3>Qu'est-ce qu'un design pattern ?</h3>
<p>Un design pattern est une solution éprouvée à un problème de conception qui revient souvent. Le terme vient du livre du « Gang of Four » (GoF, 1994), qui en décrit 23, classés en trois familles : <strong>créationnels</strong> (comment créer des objets), <strong>structurels</strong> (comment assembler des objets) et <strong>comportementaux</strong> (comment les objets collaborent, vu au J34).</p>
<p>Un pattern n'est pas une bibliothèque à installer, c'est un <strong>vocabulaire</strong>. Dire « on met un Decorator de cache autour du repository » permet à toute l'équipe de comprendre la structure en une phrase. Retiens toujours la paire <strong>problème → solution</strong> : si tu n'as pas le problème, tu n'as pas besoin du pattern.</p>
<p>Bonne nouvelle : en .NET moderne, beaucoup de patterns sont déjà intégrés au framework, en particulier grâce à l'injection de dépendances. Ton travail consiste souvent à les reconnaître plutôt qu'à les réécrire.</p>

<h3>Factory Method et Abstract Factory</h3>
<p><strong>Problème :</strong> le code appelant ne doit pas savoir quelle classe concrète instancier (par exemple, choisir un exporteur CSV ou PDF selon un paramètre). <strong>Solution :</strong> une méthode (ou une classe) dont le rôle est de créer l'objet et de renvoyer une abstraction.</p>
<ul>
<li><strong>Factory Method</strong> : une méthode qui renvoie une interface, par exemple <code>IExporter Create(ExportFormat format)</code>.</li>
<li><strong>Abstract Factory</strong> : une interface qui crée une <em>famille</em> d'objets cohérents (par exemple un fournisseur de paiement qui crée à la fois son client HTTP et son validateur de webhooks).</li>
</ul>
<p>Dans .NET : <code>IServiceProvider</code> est une factory géante, <code>IHttpClientFactory</code> crée des <code>HttpClient</code> configurés, <code>ILoggerFactory</code> crée des loggers. Avant d'écrire une factory, demande-toi si la DI ne le fait pas déjà.</p>

<h3>Builder</h3>
<p><strong>Problème :</strong> un objet a beaucoup de paramètres optionnels, et un constructeur à 9 arguments devient illisible. <strong>Solution :</strong> un objet intermédiaire qui accumule la configuration avec des méthodes chaînées (<em>fluent</em>), puis un <code>Build()</code> qui valide et crée l'objet final.</p>
<p>Dans .NET : <code>StringBuilder</code>, <code>WebApplication.CreateBuilder()</code>, <code>ModelBuilder</code> d'EF Core, <code>UriBuilder</code>. En C# moderne, un <code>record</code> avec des propriétés <code>init</code> et l'expression <code>with</code> remplace souvent un Builder simple. Garde le Builder quand il faut <strong>valider</strong> la combinaison ou construire par étapes. Il est aussi très utile dans les tests (« test data builders »).</p>

<h3>Singleton</h3>
<p><strong>Problème :</strong> il ne doit exister qu'une seule instance d'un service (cache, horloge, configuration). Le Singleton classique (constructeur privé, champ <code>static</code>, propriété <code>Instance</code>) pose deux soucis : il est difficile à remplacer dans les tests, et il cache une dépendance globale.</p>
<p>En .NET moderne, on écrit une classe normale et on l'enregistre avec <code>builder.Services.AddSingleton&lt;IClock, SystemClock&gt;()</code>. La DI garantit l'instance unique et tu gardes l'injection par constructeur. Attention : un singleton est partagé par tous les threads, donc son état mutable doit être thread-safe (voir J31).</p>

<h3>Adapter</h3>
<p><strong>Problème :</strong> tu dois utiliser une API externe (SDK de paiement, ancien service SOAP) dont l'interface ne correspond pas à la tienne. <strong>Solution :</strong> une classe qui implémente <em>ton</em> interface et traduit les appels vers l'API externe. Ton domaine reste propre et ne dépend pas du SDK. Le jour où tu changes de fournisseur, tu écris un nouvel adapter et rien d'autre ne bouge. C'est le cœur de l'architecture hexagonale (« ports et adapters »).</p>

<h3>Decorator</h3>
<p><strong>Problème :</strong> ajouter un comportement transverse (log, cache, retry, métriques) sans modifier la classe d'origine. <strong>Solution :</strong> une classe qui implémente la même interface, reçoit l'implémentation réelle dans son constructeur et ajoute son comportement avant ou après l'appel. Les decorators s'empilent comme des poupées russes.</p>
<p>Dans .NET : les <code>DelegatingHandler</code> de <code>HttpClient</code> forment une chaîne de decorators, et <code>BufferedStream</code> décore un <code>Stream</code>. La DI native ne sait pas décorer automatiquement : on enregistre à la main avec une factory, ou on utilise la bibliothèque <strong>Scrutor</strong> et sa méthode <code>Decorate&lt;TInterface, TDecorator&gt;()</code>.</p>

<h3>Facade et Proxy</h3>
<ul>
<li><strong>Facade</strong> : une interface simple devant un sous-système compliqué. Exemple : un <code>CheckoutService.PlaceOrder()</code> qui orchestre stock, paiement, e-mail et facture. <code>File.ReadAllText</code> est une facade sur <code>FileStream</code> + <code>StreamReader</code>.</li>
<li><strong>Proxy</strong> : un objet qui se fait passer pour l'objet réel pour contrôler l'accès (chargement paresseux, cache, contrôle de droits, appel distant). <code>Lazy&lt;T&gt;</code> est un proxy de chargement différé, et les proxies de lazy loading d'EF Core en sont un autre exemple. Proxy et Decorator ont la même structure : le Proxy <em>contrôle l'accès</em>, le Decorator <em>ajoute du comportement</em>.</li>
</ul>

<h3>Récapitulatif</h3>
<table>
<thead><tr><th>Pattern</th><th>Problème résolu</th><th>Déjà dans .NET</th><th>Quand l'éviter</th></tr></thead>
<tbody>
<tr><td>Factory Method</td><td>Choisir la classe concrète à créer</td><td><code>IHttpClientFactory</code>, <code>ILoggerFactory</code></td><td>Une seule implémentation : un simple <code>new</code> suffit</td></tr>
<tr><td>Abstract Factory</td><td>Créer une famille d'objets cohérents</td><td><code>DbProviderFactory</code></td><td>Une seule famille d'objets</td></tr>
<tr><td>Builder</td><td>Construire un objet complexe par étapes</td><td><code>StringBuilder</code>, <code>WebApplicationBuilder</code></td><td>Un <code>record</code> avec <code>init</code> suffit</td></tr>
<tr><td>Singleton</td><td>Une seule instance partagée</td><td><code>AddSingleton</code></td><td>Toujours à la main : passe par la DI</td></tr>
<tr><td>Adapter</td><td>Traduire une interface externe</td><td><code>StreamReader</code> (octets → texte)</td><td>Tu contrôles déjà les deux interfaces</td></tr>
<tr><td>Decorator</td><td>Ajouter un comportement sans modifier</td><td><code>DelegatingHandler</code>, <code>BufferedStream</code></td><td>Le comportement concerne une seule méthode</td></tr>
<tr><td>Facade</td><td>Simplifier un sous-système</td><td><code>File</code>, <code>HttpClient.GetFromJsonAsync</code></td><td>La facade devient une God class</td></tr>
<tr><td>Proxy</td><td>Contrôler l'accès à un objet</td><td><code>Lazy&lt;T&gt;</code>, proxies EF Core</td><td>Chargement paresseux qui cache des requêtes N+1</td></tr>
</tbody>
</table>
<div class="note">En entretien et en revue de code, un senior ne cite pas des patterns pour impressionner. Il nomme le problème d'abord (« on doit changer de fournisseur de paiement sans toucher au domaine »), puis la solution (« un Adapter derrière une interface IPaymentGateway »). Et il sait dire quand le pattern est inutile : une interface avec une seule implémentation et aucun test qui la remplace, c'est du code en plus pour rien.</div>`,
  examples: [
    {
      title: "Factory Method : choisir un exporteur",
      code: `public enum ExportFormat { Csv, Json }

public interface IExporter
{
    string Export(IReadOnlyList<Order> orders);
}

public sealed class CsvExporter : IExporter
{
    public string Export(IReadOnlyList<Order> orders) =>
        string.Join(Environment.NewLine, orders.Select(o => $"{o.Id};{o.Total}"));
}

public sealed class JsonExporter : IExporter
{
    public string Export(IReadOnlyList<Order> orders) =>
        System.Text.Json.JsonSerializer.Serialize(orders);
}

public static class ExporterFactory
{
    // La factory centralise le choix de la classe concrète
    public static IExporter Create(ExportFormat format) => format switch
    {
        ExportFormat.Csv => new CsvExporter(),
        ExportFormat.Json => new JsonExporter(),
        _ => throw new ArgumentOutOfRangeException(nameof(format))
    };
}

public record Order(int Id, decimal Total);

// Utilisation
var orders = new List<Order> { new(1, 49.90m), new(2, 120m) };
IExporter exporter = ExporterFactory.Create(ExportFormat.Csv);
Console.WriteLine(exporter.Export(orders));`,
      explain: "Le <code>switch</code> expression rend la factory compacte. Le code appelant ne connaît que <code>IExporter</code>."
    },
    {
      title: "Builder fluent avec validation",
      code: `public sealed record EmailMessage(string To, string Subject, string Body, IReadOnlyList<string> Cc);

public sealed class EmailBuilder
{
    private string? _to;
    private string _subject = "(sans objet)";
    private string _body = "";
    private readonly List<string> _cc = [];

    public EmailBuilder To(string to) { _to = to; return this; }
    public EmailBuilder Subject(string subject) { _subject = subject; return this; }
    public EmailBuilder Body(string body) { _body = body; return this; }
    public EmailBuilder Cc(string cc) { _cc.Add(cc); return this; }

    public EmailMessage Build()
    {
        // Le Builder valide la combinaison avant de créer l'objet
        if (string.IsNullOrWhiteSpace(_to))
            throw new InvalidOperationException("Le destinataire est obligatoire.");
        return new EmailMessage(_to, _subject, _body, _cc.ToList());
    }
}

// Utilisation
var mail = new EmailBuilder()
    .To("client@example.com")
    .Subject("Commande confirmée")
    .Body("Merci pour votre commande.")
    .Cc("support@example.com")
    .Build();

Console.WriteLine(mail);`,
      explain: "Chaque méthode renvoie <code>this</code> pour permettre le chaînage. <code>Build()</code> est le seul endroit où l'objet final est créé et validé."
    },
    {
      title: "Adapter autour d'un SDK de paiement externe",
      code: `// Notre interface (le « port »), définie par notre domaine
public interface IPaymentGateway
{
    Task<PaymentResult> ChargeAsync(decimal amount, string currency, string cardToken, CancellationToken ct);
}

public record PaymentResult(bool Success, string? TransactionId, string? Error);

// Le SDK externe, qu'on ne peut pas modifier (montant en centimes, exceptions...)
public sealed class AcmePayClient
{
    public Task<AcmeCharge> CreateChargeAsync(long amountInCents, string iso, string source) =>
        Task.FromResult(new AcmeCharge("ch_" + Guid.NewGuid().ToString("N")[..8], "succeeded"));
}
public record AcmeCharge(string Id, string Status);

// L'adapter traduit notre interface vers celle du SDK
public sealed class AcmePayAdapter(AcmePayClient client) : IPaymentGateway
{
    public async Task<PaymentResult> ChargeAsync(decimal amount, string currency, string cardToken, CancellationToken ct)
    {
        var cents = (long)Math.Round(amount * 100, MidpointRounding.AwayFromZero);
        var charge = await client.CreateChargeAsync(cents, currency.ToUpperInvariant(), cardToken);
        return charge.Status == "succeeded"
            ? new PaymentResult(true, charge.Id, null)
            : new PaymentResult(false, null, $"Paiement refusé : {charge.Status}");
    }
}

// Utilisation
IPaymentGateway gateway = new AcmePayAdapter(new AcmePayClient());
var result = await gateway.ChargeAsync(49.90m, "eur", "tok_visa", CancellationToken.None);
Console.WriteLine(result);`,
      explain: "Le domaine manipule des <code>decimal</code> et un <code>PaymentResult</code>. Les centimes et les statuts texte du SDK restent enfermés dans l'adapter."
    },
    {
      title: "Decorator de cache enregistré dans la DI",
      code: `using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;

public record Product(int Id, string Name, decimal Price);

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id);
}

public sealed class ProductRepository : IProductRepository
{
    public Task<Product?> GetByIdAsync(int id)
    {
        Console.WriteLine($"Requête base de données pour le produit {id}");
        return Task.FromResult<Product?>(new Product(id, "Clavier", 59m));
    }
}

// Le decorator implémente la même interface et enveloppe l'implémentation réelle
public sealed class CachedProductRepository(IProductRepository inner, IMemoryCache cache) : IProductRepository
{
    public Task<Product?> GetByIdAsync(int id) =>
        cache.GetOrCreateAsync($"product:{id}", entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
            return inner.GetByIdAsync(id);
        });
}

var services = new ServiceCollection();
services.AddMemoryCache();
services.AddScoped<ProductRepository>();
// Enregistrement manuel du decorator (avec Scrutor : services.Decorate<IProductRepository, CachedProductRepository>())
services.AddScoped<IProductRepository>(sp =>
    new CachedProductRepository(sp.GetRequiredService<ProductRepository>(), sp.GetRequiredService<IMemoryCache>()));

using var provider = services.BuildServiceProvider();
var repo = provider.GetRequiredService<IProductRepository>();
await repo.GetByIdAsync(1); // passe par la base
await repo.GetByIdAsync(1); // servi par le cache, aucun message affiché`,
      explain: "Le code qui demande <code>IProductRepository</code> ne sait pas qu'il y a un cache. Le second appel n'affiche rien car il ne touche pas la base."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Remplacer un Singleton maison par la DI",
      prompt: `<p>Voici un Singleton écrit à la main :</p>
<pre><code>public sealed class AppClock
{
    public static AppClock Instance { get; } = new();
    private AppClock() { }
    public DateTime Now =&gt; DateTime.UtcNow;
}</code></pre>
<p>Réécris-le pour qu'il soit injectable et testable : une interface <code>IClock</code>, une implémentation, un enregistrement <code>AddSingleton</code>, et une fausse horloge pour les tests.</p>`,
      hint: `<p>Depuis .NET 8, le framework fournit déjà <code>TimeProvider</code> (<code>TimeProvider.System</code>) et, pour les tests, <code>FakeTimeProvider</code> dans le paquet Microsoft.Extensions.TimeProvider.Testing. Écris ta propre version pour comprendre, puis note l'alternative.</p>`,
      solution: `using Microsoft.Extensions.DependencyInjection;

public interface IClock
{
    DateTime UtcNow { get; }
}

public sealed class SystemClock : IClock
{
    public DateTime UtcNow => DateTime.UtcNow;
}

// Horloge figée pour les tests
public sealed class FixedClock(DateTime now) : IClock
{
    public DateTime UtcNow { get; } = now;
}

public sealed class InvoiceService(IClock clock)
{
    public bool IsOverdue(DateTime dueDate) => clock.UtcNow > dueDate;
}

// Enregistrement : la DI garantit l'instance unique
var services = new ServiceCollection();
services.AddSingleton<IClock, SystemClock>();
services.AddScoped<InvoiceService>();

// Test : on injecte l'horloge figée
var service = new InvoiceService(new FixedClock(new DateTime(2026, 1, 15)));
Console.WriteLine(service.IsOverdue(new DateTime(2026, 1, 10))); // True

// Alternative intégrée à .NET 8+ : services.AddSingleton(TimeProvider.System);
// puis injecter TimeProvider et appeler GetUtcNow().`
    },
    {
      level: "moyen",
      title: "Decorator de log autour d'un service",
      prompt: `<p>Tu as une interface <code>IOrderService</code> avec une méthode <code>Task&lt;int&gt; PlaceOrderAsync(int customerId, decimal total)</code>. Écris un <code>LoggingOrderService</code> qui enveloppe l'implémentation réelle, logue l'entrée, la durée et une éventuelle exception (puis relance l'exception). Enregistre-le dans la DI sans modifier <code>OrderService</code>.</p>`,
      hint: `<p>Utilise <code>Stopwatch.StartNew()</code> et un bloc <code>try/catch</code> avec <code>throw;</code> (et non <code>throw ex;</code>, qui perd la pile d'appels). Pour la DI, enregistre la classe concrète puis l'interface avec une factory.</p>`,
      solution: `using System.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public interface IOrderService
{
    Task<int> PlaceOrderAsync(int customerId, decimal total);
}

public sealed class OrderService : IOrderService
{
    public Task<int> PlaceOrderAsync(int customerId, decimal total)
    {
        if (total <= 0) throw new ArgumentException("Le total doit être positif.", nameof(total));
        return Task.FromResult(Random.Shared.Next(1000, 9999));
    }
}

public sealed class LoggingOrderService(IOrderService inner, ILogger<LoggingOrderService> logger) : IOrderService
{
    public async Task<int> PlaceOrderAsync(int customerId, decimal total)
    {
        logger.LogInformation("PlaceOrder client {CustomerId}, total {Total}", customerId, total);
        var sw = Stopwatch.StartNew();
        try
        {
            var id = await inner.PlaceOrderAsync(customerId, total);
            logger.LogInformation("Commande {OrderId} créée en {Elapsed} ms", id, sw.ElapsedMilliseconds);
            return id;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Échec de PlaceOrder après {Elapsed} ms", sw.ElapsedMilliseconds);
            throw; // on relance sans perdre la pile d'appels
        }
    }
}

var services = new ServiceCollection();
services.AddLogging(b => b.AddConsole());
services.AddScoped<OrderService>();
services.AddScoped<IOrderService>(sp => new LoggingOrderService(
    sp.GetRequiredService<OrderService>(),
    sp.GetRequiredService<ILogger<LoggingOrderService>>()));

using var provider = services.BuildServiceProvider();
var orders = provider.GetRequiredService<IOrderService>();
await orders.PlaceOrderAsync(42, 99.90m);`
    },
    {
      level: "difficile",
      title: "Proxy paresseux et Facade de checkout",
      prompt: `<p>Deux parties :</p>
<ol>
<li>Écris un <code>LazyReportGenerator</code> (Proxy) qui implémente <code>IReportGenerator</code> mais ne crée le vrai <code>HeavyReportGenerator</code> (lent à construire) qu'au premier appel de <code>Generate()</code>, de façon thread-safe.</li>
<li>Écris une Facade <code>CheckoutFacade</code> avec une seule méthode <code>PlaceOrderAsync(Cart cart)</code> qui orchestre : réservation du stock (<code>IInventory</code>), paiement (<code>IPaymentGateway</code>) et envoi d'e-mail (<code>IEmailSender</code>). Si le paiement échoue, le stock doit être libéré.</li>
</ol>`,
      hint: `<p>Pour le Proxy, <code>Lazy&lt;T&gt;</code> est thread-safe par défaut (<code>LazyThreadSafetyMode.ExecutionAndPublication</code>). Pour la Facade, pense à un <code>try/catch</code> autour du paiement pour la compensation.</p>`,
      solution: `// 1. Proxy paresseux
public interface IReportGenerator { string Generate(int month); }

public sealed class HeavyReportGenerator : IReportGenerator
{
    public HeavyReportGenerator()
    {
        Console.WriteLine("Chargement des modèles de rapport (lent)...");
        Thread.Sleep(1000);
    }
    public string Generate(int month) => $"Rapport du mois {month}";
}

public sealed class LazyReportGenerator : IReportGenerator
{
    // Lazy<T> est thread-safe par défaut : une seule création même avec plusieurs threads
    private readonly Lazy<IReportGenerator> _real = new(() => new HeavyReportGenerator());
    public string Generate(int month) => _real.Value.Generate(month);
}

// 2. Facade de checkout
public record CartLine(int ProductId, int Quantity);
public record Cart(int CustomerId, string Email, IReadOnlyList<CartLine> Lines, decimal Total, string CardToken);
public record PaymentResult(bool Success, string? TransactionId, string? Error);

public interface IInventory
{
    Task<Guid> ReserveAsync(IReadOnlyList<CartLine> lines);
    Task ReleaseAsync(Guid reservationId);
}
public interface IPaymentGateway { Task<PaymentResult> ChargeAsync(decimal amount, string cardToken); }
public interface IEmailSender { Task SendAsync(string to, string subject, string body); }

public sealed class CheckoutFacade(IInventory inventory, IPaymentGateway payment, IEmailSender email)
{
    public async Task<PaymentResult> PlaceOrderAsync(Cart cart)
    {
        var reservationId = await inventory.ReserveAsync(cart.Lines);
        PaymentResult result;
        try
        {
            result = await payment.ChargeAsync(cart.Total, cart.CardToken);
        }
        catch
        {
            await inventory.ReleaseAsync(reservationId); // compensation
            throw;
        }

        if (!result.Success)
        {
            await inventory.ReleaseAsync(reservationId);
            return result;
        }

        await email.SendAsync(cart.Email, "Commande confirmée", $"Transaction {result.TransactionId}");
        return result;
    }
}`
    }
  ],
  project: `<p><strong>OrderFlow : Adapter de paiement et Decorator de cache.</strong></p>
<ol>
<li>Dans <code>OrderFlow.Application</code>, crée l'interface <code>IPaymentGateway</code> (le port). Dans <code>OrderFlow.Infrastructure</code>, écris un <code>FakeStripeAdapter</code> qui simule un SDK externe (montants en centimes, statuts texte) et le traduit vers ton <code>PaymentResult</code>.</li>
<li>Ajoute un <code>CachedProductRepository</code> qui décore ton <code>IProductRepository</code> avec <code>HybridCache</code> ou <code>IMemoryCache</code> (5 minutes). Invalide l'entrée quand un produit est modifié.</li>
<li>Enregistre le decorator dans <code>Program.cs</code>, soit à la main avec une factory, soit avec Scrutor (<code>services.Decorate&lt;IProductRepository, CachedProductRepository&gt;()</code>).</li>
<li>Écris un test d'intégration qui vérifie que deux lectures consécutives ne font qu'une seule requête SQL.</li>
</ol>`,
  resources: [
    { label: "Catalogue des design patterns (Refactoring Guru)", url: "https://refactoring.guru/design-patterns/catalog" },
    { label: "Injection de dépendances dans .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/dependency-injection" },
    { label: "IHttpClientFactory et DelegatingHandler", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/http-requests" },
    { label: "Lazy<T> et l'initialisation différée", url: "https://learn.microsoft.com/fr-fr/dotnet/framework/performance/lazy-initialization" }
  ]
});

// ───────────────────────────── J34 ─────────────────────────────
window.COURSE.push({
  day: 34, week: 5,
  title: "Design patterns comportementaux",
  summary: "Strategy, Observer, Command, Chain of Responsibility, Template Method, State, Mediator et Specification appliqués à une API de commandes.",
  objectives: [
    "Remplacer un switch qui grossit par une Strategy injectée avec les keyed services",
    "Utiliser les events C# pour Observer et reconnaître le pipeline middleware comme une Chain of Responsibility",
    "Modéliser le cycle de vie d'une commande avec le pattern State",
    "Encapsuler une règle métier réutilisable avec le pattern Specification",
    "Choisir entre Command, Mediator et un simple appel de méthode"
  ],
  lesson: `<p><em>Prérequis : à faire après J15 si tu veux, sinon après J30. Le J16 (CQRS et handlers) aide pour Command et Mediator.</em></p>
<h3>Strategy</h3>
<p><strong>Problème :</strong> un algorithme varie selon le contexte (calcul des frais de livraison standard, express, retrait en magasin), et le <code>switch</code> grossit à chaque nouveau cas. <strong>Solution :</strong> une interface par algorithme (<code>IShippingStrategy</code>), une classe par variante, et le code appelant choisit la stratégie au lieu de contenir tous les cas. C'est le principe ouvert/fermé (J15) en action : ajouter une variante = ajouter une classe.</p>
<p>Depuis .NET 8, les <strong>keyed services</strong> rendent Strategy très simple : <code>AddKeyedScoped&lt;IShippingStrategy, ExpressShipping&gt;("express")</code> à l'enregistrement, puis <code>[FromKeyedServices("express")]</code> dans un constructeur ou <code>sp.GetRequiredKeyedService&lt;IShippingStrategy&gt;(key)</code> quand la clé arrive à l'exécution.</p>
<p>Une alternative légère : un <code>Func&lt;Order, decimal&gt;</code> ou un dictionnaire de délégués. Si chaque stratégie tient en une ligne et n'a pas de dépendances, un délégué suffit.</p>

<h3>Observer</h3>
<p><strong>Problème :</strong> plusieurs objets doivent réagir à un changement sans que l'émetteur les connaisse. En C#, Observer est intégré au langage : les <code>event</code> avec <code>EventHandler&lt;T&gt;</code>. <code>IObservable&lt;T&gt;</code> et <code>IObserver&lt;T&gt;</code> existent aussi (base de Rx.NET) pour les flux d'événements. Dans une application web, les domain events (J19) et les notifications MediatR sont des Observer en mémoire, et un bus de messages (J23) est un Observer distribué.</p>
<p>Piège classique : un abonné qui ne se désabonne pas (<code>-=</code>) d'un événement d'un objet qui vit plus longtemps provoque une fuite mémoire.</p>

<h3>Command</h3>
<p><strong>Problème :</strong> représenter une action comme un objet pour la mettre en file, la journaliser, la rejouer ou l'annuler. Un <code>record PlaceOrderCommand(...)</code> envoyé à un handler (J16) est exactement ce pattern. Les jobs Hangfire et les messages RabbitMQ aussi. Ajoute une méthode <code>Undo()</code> quand tu as besoin d'annulation (éditeur, actions d'administration).</p>

<h3>Chain of Responsibility</h3>
<p><strong>Problème :</strong> une requête doit traverser une série de traitements, chacun pouvant agir ou arrêter la chaîne. Tu l'utilises tous les jours : le <strong>pipeline middleware d'ASP.NET Core</strong>. Chaque middleware reçoit <code>next</code> et décide de l'appeler ou non (l'authentification renvoie 401 sans appeler la suite). Les <code>DelegatingHandler</code> de <code>HttpClient</code> et les pipeline behaviors de MediatR (validation, log, transaction) suivent le même schéma.</p>

<h3>Template Method</h3>
<p><strong>Problème :</strong> plusieurs classes suivent les mêmes étapes, avec des détails différents. Une classe abstraite définit l'algorithme dans une méthode non virtuelle et laisse des méthodes <code>abstract</code> ou <code>virtual</code> à redéfinir. <code>BackgroundService</code> en est un exemple : il gère le démarrage et l'arrêt, et toi tu écris seulement <code>ExecuteAsync</code>. Ce pattern repose sur l'héritage : préfère Strategy (composition) quand les variantes doivent se combiner.</p>

<h3>State</h3>
<p><strong>Problème :</strong> le comportement d'un objet dépend de son état, et chaque méthode commence par <code>if (Status == ...)</code>. Une commande ne peut être payée que si elle est en attente, expédiée que si elle est payée, et annulée que si elle n'est pas expédiée. <strong>Solution :</strong> une classe par état, qui sait quelles transitions sont permises. Pour un cycle de vie simple, une table de transitions (dictionnaire <code>(état, action) → nouvel état</code>) dans l'agrégat est souvent plus lisible qu'une hiérarchie de classes. Pour un workflow complexe, une bibliothèque comme Stateless existe.</p>

<h3>Mediator</h3>
<p><strong>Problème :</strong> beaucoup d'objets se parlent directement, ce qui crée un réseau de dépendances. Un médiateur centralise les échanges : chacun parle au médiateur, qui transmet. MediatR porte ce nom, mais dans une API il sert surtout de dispatcher de commandes. Rappel du J16 : MediatR est passé sous licence commerciale, et un simple <code>ICommandHandler&lt;TCommand&gt;</code> injecté directement fait souvent l'affaire.</p>

<h3>Specification</h3>
<p><strong>Problème :</strong> une règle métier (« commande éligible au remboursement ») est dupliquée dans plusieurs requêtes et dans le code. <strong>Solution :</strong> un objet qui encapsule la règle sous forme d'<code>Expression&lt;Func&lt;T, bool&gt;&gt;</code>. Il est utilisable en mémoire (compilé) et traduisible en SQL par EF Core (dans <code>Where</code>). Les spécifications se combinent avec <code>And</code>, <code>Or</code> et <code>Not</code>.</p>

<h3>Récapitulatif</h3>
<table>
<thead><tr><th>Pattern</th><th>Problème résolu</th><th>Déjà dans .NET</th><th>Quand l'éviter</th></tr></thead>
<tbody>
<tr><td>Strategy</td><td>Algorithme interchangeable</td><td>Keyed services, <code>IComparer&lt;T&gt;</code></td><td>Deux cas stables : un <code>if</code> suffit</td></tr>
<tr><td>Observer</td><td>Réagir à un événement sans couplage</td><td><code>event</code>, <code>IObservable&lt;T&gt;</code></td><td>Un seul abonné connu : un appel direct</td></tr>
<tr><td>Command</td><td>Action sous forme d'objet</td><td>Handlers, messages, jobs</td><td>Pas de file, de log ni d'annulation</td></tr>
<tr><td>Chain of Responsibility</td><td>Traitements successifs et interruptibles</td><td>Middleware, <code>DelegatingHandler</code></td><td>Un seul traitement</td></tr>
<tr><td>Template Method</td><td>Même squelette, détails différents</td><td><code>BackgroundService</code></td><td>Variantes à combiner : Strategy</td></tr>
<tr><td>State</td><td>Comportement selon l'état</td><td>(Stateless, bibliothèque externe)</td><td>Deux états : un booléen</td></tr>
<tr><td>Mediator</td><td>Découpler des objets qui se parlent</td><td>(MediatR, sous licence)</td><td>Un handler par commande injecté directement</td></tr>
<tr><td>Specification</td><td>Règle métier réutilisable et traduisible en SQL</td><td><code>Expression&lt;Func&lt;T, bool&gt;&gt;</code></td><td>Règle utilisée une seule fois</td></tr>
</tbody>
</table>
<h3>Comment choisir</h3>
<p>Ces patterns se ressemblent : tous déplacent une décision hors d'un gros bloc de code. Pour choisir, pars de la question que tu te poses :</p>
<ul>
<li>« <strong>Comment</strong> calculer ceci ? » La réponse varie selon un paramètre : <strong>Strategy</strong>.</li>
<li>« <strong>Qui</strong> doit être prévenu ? » Plusieurs réactions indépendantes à un fait : <strong>Observer</strong> (ou domain events).</li>
<li>« <strong>Quoi</strong> faire, et quand ? » Une action à mettre en file, rejouer ou annuler : <strong>Command</strong>.</li>
<li>« <strong>Par où</strong> passe la requête ? » Une suite d'étapes qui peuvent s'arrêter : <strong>Chain of Responsibility</strong>.</li>
<li>« <strong>Que</strong> puis-je faire maintenant ? » Les actions dépendent de l'état : <strong>State</strong>.</li>
<li>« <strong>Lesquels</strong> correspondent ? » Une règle de sélection réutilisée : <strong>Specification</strong>.</li>
</ul>
<p>Plusieurs patterns se combinent souvent dans le même flux : un endpoint reçoit une Command, la traite à travers une chaîne de behaviors, applique une Strategy de calcul, fait évoluer le State de l'agrégat et publie un événement que des Observers consomment.</p>
<div class="note">Un senior repère les patterns comportementaux dans le code existant avant d'en ajouter. Le pipeline middleware est déjà une chaîne, les events sont déjà des observers, la DI avec keyed services fait déjà office de registre de stratégies. Le signal pour introduire Strategy ou State n'est pas « c'est élégant », c'est « ce switch a changé trois fois ce mois-ci ».</div>`,
  examples: [
    {
      title: "Strategy avec keyed services (.NET 8+)",
      code: `using Microsoft.Extensions.DependencyInjection;

public record Order(decimal Subtotal, double WeightKg);

public interface IShippingStrategy
{
    decimal Compute(Order order);
}

public sealed class StandardShipping : IShippingStrategy
{
    public decimal Compute(Order order) => order.Subtotal >= 50m ? 0m : 4.90m;
}

public sealed class ExpressShipping : IShippingStrategy
{
    public decimal Compute(Order order) => 9.90m + (decimal)order.WeightKg * 1.5m;
}

public sealed class PickupShipping : IShippingStrategy
{
    public decimal Compute(Order order) => 0m;
}

var services = new ServiceCollection();
services.AddKeyedSingleton<IShippingStrategy, StandardShipping>("standard");
services.AddKeyedSingleton<IShippingStrategy, ExpressShipping>("express");
services.AddKeyedSingleton<IShippingStrategy, PickupShipping>("pickup");
using var provider = services.BuildServiceProvider();

var order = new Order(42m, 2.0);
foreach (var mode in new[] { "standard", "express", "pickup" })
{
    // La clé arrive à l'exécution (choix de l'utilisateur)
    var strategy = provider.GetRequiredKeyedService<IShippingStrategy>(mode);
    Console.WriteLine($"{mode} : {strategy.Compute(order)} EUR");
}

// Dans un endpoint Minimal API, on peut aussi injecter une clé fixe :
// app.MapGet("/express", ([FromKeyedServices("express")] IShippingStrategy s) => ...);`,
      explain: "Ajouter un mode de livraison revient à écrire une classe et une ligne d'enregistrement. Le code appelant ne change pas."
    },
    {
      title: "Observer avec les events C#",
      code: `public sealed class OrderPaidEventArgs(int orderId, decimal amount) : EventArgs
{
    public int OrderId { get; } = orderId;
    public decimal Amount { get; } = amount;
}

public sealed class PaymentProcessor
{
    // L'émetteur ne connaît pas ses abonnés
    public event EventHandler<OrderPaidEventArgs>? OrderPaid;

    public void Pay(int orderId, decimal amount)
    {
        Console.WriteLine($"Paiement de la commande {orderId} : {amount} EUR");
        OrderPaid?.Invoke(this, new OrderPaidEventArgs(orderId, amount));
    }
}

var processor = new PaymentProcessor();

EventHandler<OrderPaidEventArgs> sendEmail = (_, e) => Console.WriteLine($"E-mail envoyé pour {e.OrderId}");
EventHandler<OrderPaidEventArgs> updateStats = (_, e) => Console.WriteLine($"Statistiques : +{e.Amount} EUR");

processor.OrderPaid += sendEmail;
processor.OrderPaid += updateStats;
processor.Pay(1001, 89.90m);

// Se désabonner évite les fuites mémoire quand l'abonné vit moins longtemps que l'émetteur
processor.OrderPaid -= sendEmail;
processor.Pay(1002, 15m);`,
      explain: "L'opérateur <code>?.Invoke</code> évite une exception quand personne n'est abonné. Le second paiement n'envoie plus d'e-mail."
    },
    {
      title: "State : cycle de vie d'une commande avec table de transitions",
      code: `public enum OrderStatus { Pending, Paid, Shipped, Delivered, Cancelled }
public enum OrderAction { Pay, Ship, Deliver, Cancel }

public sealed class Order
{
    // Table de transitions : (état actuel, action) -> nouvel état
    private static readonly Dictionary<(OrderStatus, OrderAction), OrderStatus> Transitions = new()
    {
        [(OrderStatus.Pending, OrderAction.Pay)] = OrderStatus.Paid,
        [(OrderStatus.Pending, OrderAction.Cancel)] = OrderStatus.Cancelled,
        [(OrderStatus.Paid, OrderAction.Ship)] = OrderStatus.Shipped,
        [(OrderStatus.Paid, OrderAction.Cancel)] = OrderStatus.Cancelled,
        [(OrderStatus.Shipped, OrderAction.Deliver)] = OrderStatus.Delivered,
    };

    public OrderStatus Status { get; private set; } = OrderStatus.Pending;

    public bool CanApply(OrderAction action) => Transitions.ContainsKey((Status, action));

    public void Apply(OrderAction action)
    {
        if (!Transitions.TryGetValue((Status, action), out var next))
            throw new InvalidOperationException($"Action {action} impossible depuis l'état {Status}.");
        Status = next;
    }
}

var order = new Order();
order.Apply(OrderAction.Pay);
order.Apply(OrderAction.Ship);
Console.WriteLine(order.Status);                     // Shipped
Console.WriteLine(order.CanApply(OrderAction.Cancel)); // False : déjà expédiée`,
      explain: "Toutes les règles de transition sont lisibles au même endroit. Pour ajouter un état, on ajoute des lignes à la table, sans toucher aux méthodes."
    },
    {
      title: "Specification combinable et traduisible en SQL",
      code: `using System.Linq.Expressions;

public record Order(int Id, decimal Total, DateTime CreatedAt, bool IsShipped);

public abstract class Specification<T>
{
    public abstract Expression<Func<T, bool>> ToExpression();

    public bool IsSatisfiedBy(T candidate) => ToExpression().Compile()(candidate);

    public Specification<T> And(Specification<T> other) => new AndSpecification<T>(this, other);
}

public sealed class AndSpecification<T>(Specification<T> left, Specification<T> right) : Specification<T>
{
    public override Expression<Func<T, bool>> ToExpression()
    {
        var l = left.ToExpression();
        var r = right.ToExpression();
        var param = Expression.Parameter(typeof(T));
        var body = Expression.AndAlso(
            Expression.Invoke(l, param),
            Expression.Invoke(r, param));
        return Expression.Lambda<Func<T, bool>>(body, param);
    }
}

public sealed class NotShippedSpec : Specification<Order>
{
    public override Expression<Func<Order, bool>> ToExpression() => o => !o.IsShipped;
}

public sealed class RecentSpec(DateTime since) : Specification<Order>
{
    public override Expression<Func<Order, bool>> ToExpression() => o => o.CreatedAt >= since;
}

var orders = new List<Order>
{
    new(1, 50m, DateTime.UtcNow.AddDays(-2), false),
    new(2, 80m, DateTime.UtcNow.AddDays(-40), false),
    new(3, 20m, DateTime.UtcNow.AddDays(-1), true),
};

var refundable = new NotShippedSpec().And(new RecentSpec(DateTime.UtcNow.AddDays(-30)));

// En mémoire
foreach (var o in orders.Where(refundable.IsSatisfiedBy))
    Console.WriteLine($"Remboursable : {o.Id}");

// Avec EF Core : db.Orders.Where(refundable.ToExpression()) est traduit en SQL`,
      explain: "La règle « non expédiée et récente » existe à un seul endroit. <code>Expression.Invoke</code> est supporté par EF Core ; pour des combinaisons plus complexes, on réécrit les paramètres avec un <code>ExpressionVisitor</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Du switch à la Strategy",
      prompt: `<p>Refactore ce calcul de remise en Strategy (une interface, trois classes, un dictionnaire ou des keyed services pour choisir) :</p>
<pre><code>decimal Discount(string customerType, decimal total) =&gt; customerType switch
{
    "regular" =&gt; 0m,
    "vip" =&gt; total * 0.10m,
    "employee" =&gt; total * 0.30m,
    _ =&gt; throw new ArgumentException("Type inconnu")
};</code></pre>`,
      hint: `<p>Un <code>Dictionary&lt;string, IDiscountStrategy&gt;</code> avec <code>StringComparer.OrdinalIgnoreCase</code> suffit en console. En API, utilise <code>AddKeyedSingleton</code>.</p>`,
      solution: `public interface IDiscountStrategy
{
    decimal Compute(decimal total);
}

public sealed class RegularDiscount : IDiscountStrategy { public decimal Compute(decimal total) => 0m; }
public sealed class VipDiscount : IDiscountStrategy { public decimal Compute(decimal total) => total * 0.10m; }
public sealed class EmployeeDiscount : IDiscountStrategy { public decimal Compute(decimal total) => total * 0.30m; }

public sealed class DiscountCalculator
{
    private readonly Dictionary<string, IDiscountStrategy> _strategies = new(StringComparer.OrdinalIgnoreCase)
    {
        ["regular"] = new RegularDiscount(),
        ["vip"] = new VipDiscount(),
        ["employee"] = new EmployeeDiscount(),
    };

    public decimal Discount(string customerType, decimal total) =>
        _strategies.TryGetValue(customerType, out var strategy)
            ? strategy.Compute(total)
            : throw new ArgumentException($"Type de client inconnu : {customerType}", nameof(customerType));
}

var calculator = new DiscountCalculator();
Console.WriteLine(calculator.Discount("VIP", 200m));      // 20
Console.WriteLine(calculator.Discount("employee", 200m)); // 60

// Version DI :
// services.AddKeyedSingleton<IDiscountStrategy, VipDiscount>("vip");
// sp.GetRequiredKeyedService<IDiscountStrategy>(customerType)`
    },
    {
      level: "moyen",
      title: "Middleware de mesure : une Chain of Responsibility",
      prompt: `<p>Écris un middleware ASP.NET Core <code>RequestTimingMiddleware</code> qui mesure la durée de chaque requête et ajoute un en-tête <code>X-Elapsed-Ms</code> à la réponse. Ajoute un second middleware qui court-circuite la chaîne (renvoie 503 sans appeler <code>next</code>) si un fichier <code>maintenance.flag</code> existe. Explique dans un commentaire pourquoi l'ordre d'enregistrement compte.</p>`,
      hint: `<p>Les en-têtes doivent être ajoutés avant que la réponse ne commence à être envoyée : utilise <code>context.Response.OnStarting(...)</code>.</p>`,
      solution: `using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// L'ordre compte : chaque middleware enveloppe ceux enregistrés après lui.
// La mesure est placée en premier pour inclure aussi le temps du middleware de maintenance.
app.UseMiddleware<RequestTimingMiddleware>();
app.UseMiddleware<MaintenanceMiddleware>();

app.MapGet("/", () => "OrderFlow est en ligne");
app.Run();

public sealed class RequestTimingMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var sw = Stopwatch.StartNew();
        context.Response.OnStarting(() =>
        {
            context.Response.Headers["X-Elapsed-Ms"] = sw.ElapsedMilliseconds.ToString();
            return Task.CompletedTask;
        });
        await next(context); // maillon suivant de la chaîne
    }
}

public sealed class MaintenanceMiddleware(RequestDelegate next, IWebHostEnvironment env)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var flag = Path.Combine(env.ContentRootPath, "maintenance.flag");
        if (File.Exists(flag))
        {
            // On court-circuite la chaîne : next n'est pas appelé
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await context.Response.WriteAsync("Maintenance en cours");
            return;
        }
        await next(context);
    }
}`
    },
    {
      level: "difficile",
      title: "Pattern State avec une classe par état",
      prompt: `<p>Réécris le cycle de vie de la commande (Pending → Paid → Shipped → Delivered, annulation possible avant expédition) avec <strong>une classe par état</strong> : une classe abstraite <code>OrderState</code> avec les méthodes <code>Pay</code>, <code>Ship</code>, <code>Deliver</code>, <code>Cancel</code> qui lèvent une exception par défaut, et des sous-classes qui redéfinissent uniquement les transitions permises. L'agrégat <code>Order</code> délègue à son état courant. Ajoute une méthode <code>AllowedActions()</code> utile pour afficher les boutons côté Angular.</p>`,
      hint: `<p>Chaque méthode d'état renvoie le nouvel état. Les états n'ont pas de données propres : ils peuvent être des singletons <code>static readonly</code>.</p>`,
      solution: `public abstract class OrderState
{
    public abstract string Name { get; }

    public virtual OrderState Pay() => throw Invalid("payer");
    public virtual OrderState Ship() => throw Invalid("expédier");
    public virtual OrderState Deliver() => throw Invalid("livrer");
    public virtual OrderState Cancel() => throw Invalid("annuler");

    public IReadOnlyList<string> AllowedActions()
    {
        var actions = new List<string>();
        void TryAdd(string name, Func<OrderState> action)
        {
            try { action(); actions.Add(name); } catch (InvalidOperationException) { }
        }
        TryAdd("pay", Pay);
        TryAdd("ship", Ship);
        TryAdd("deliver", Deliver);
        TryAdd("cancel", Cancel);
        return actions;
    }

    private InvalidOperationException Invalid(string action) =>
        new($"Impossible de {action} une commande à l'état {Name}.");

    // Les états sans données peuvent être partagés
    public static readonly OrderState Pending = new PendingState();
    public static readonly OrderState Paid = new PaidState();
    public static readonly OrderState Shipped = new ShippedState();
    public static readonly OrderState Delivered = new DeliveredState();
    public static readonly OrderState Cancelled = new CancelledState();

    private sealed class PendingState : OrderState
    {
        public override string Name => "Pending";
        public override OrderState Pay() => Paid;
        public override OrderState Cancel() => Cancelled;
    }
    private sealed class PaidState : OrderState
    {
        public override string Name => "Paid";
        public override OrderState Ship() => Shipped;
        public override OrderState Cancel() => Cancelled;
    }
    private sealed class ShippedState : OrderState
    {
        public override string Name => "Shipped";
        public override OrderState Deliver() => Delivered;
    }
    private sealed class DeliveredState : OrderState { public override string Name => "Delivered"; }
    private sealed class CancelledState : OrderState { public override string Name => "Cancelled"; }
}

public sealed class Order
{
    public OrderState State { get; private set; } = OrderState.Pending;

    public void Pay() => State = State.Pay();
    public void Ship() => State = State.Ship();
    public void Deliver() => State = State.Deliver();
    public void Cancel() => State = State.Cancel();
}

var order = new Order();
Console.WriteLine(string.Join(", ", order.State.AllowedActions())); // pay, cancel
order.Pay();
order.Ship();
Console.WriteLine(order.State.Name);                                // Shipped
Console.WriteLine(string.Join(", ", order.State.AllowedActions())); // deliver

// Note : AllowedActions par exceptions est simple mais lent. En production,
// préfère des propriétés CanPay, CanShip... ou la table de transitions de l'exemple.`
    }
  ],
  project: `<p><strong>OrderFlow : Strategy pour la livraison et State pour la commande.</strong></p>
<ol>
<li>Crée <code>IShippingCostStrategy</code> avec trois implémentations (<code>standard</code>, <code>express</code>, <code>pickup</code>) enregistrées avec <code>AddKeyedScoped</code>. Le mode de livraison arrive dans la commande <code>PlaceOrderCommand</code>, et le handler résout la stratégie avec <code>GetRequiredKeyedService</code>. Renvoie une erreur 400 claire si le mode est inconnu.</li>
<li>Déplace les règles de transition de <code>OrderStatus</code> dans l'agrégat <code>Order</code> (table de transitions ou classes d'état). Supprime tous les <code>if (order.Status == ...)</code> des handlers.</li>
<li>Expose <code>GET /orders/{id}/actions</code> qui renvoie les actions permises. Côté Angular, affiche uniquement les boutons correspondants.</li>
<li>Écris un test unitaire par transition interdite (par exemple : livrer une commande non expédiée doit échouer).</li>
</ol>`,
  resources: [
    { label: "Patterns comportementaux (Refactoring Guru)", url: "https://refactoring.guru/design-patterns/behavioral-patterns" },
    { label: "Keyed services dans l'injection de dépendances", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/dependency-injection#keyed-services" },
    { label: "Middleware ASP.NET Core", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/middleware/" },
    { label: "Events en C#", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/events/" }
  ]
});

// ───────────────────────────── J35 ─────────────────────────────
window.COURSE.push({
  day: 35, week: 5,
  title: "Patterns en pratique et anti-patterns",
  summary: "Savoir quand ne pas utiliser un pattern, trancher le débat Repository sur EF Core, reconnaître les anti-patterns et refactorer un service réel.",
  objectives: [
    "Juger si un pattern apporte de la valeur ou seulement de la complexité",
    "Argumenter pour ou contre un Repository et un Unit of Work au-dessus d'EF Core",
    "Utiliser Null Object, Result et Options aux bons endroits",
    "Reconnaître God class, Service Locator, modèle anémique, singleton mutable et primitive obsession",
    "Refactorer un service plein de if/switch vers Strategy et State, étape par étape"
  ],
  lesson: `<p><em>Prérequis : J33 et J34. Cette journée est la plus proche de ce qu'on attend d'un senior en revue de code.</em></p>
<h3>Quand ne pas utiliser un pattern</h3>
<p>Le principal risque après avoir appris les patterns, c'est d'en mettre partout. Chaque pattern ajoute des fichiers, des indirections et du vocabulaire à apprendre pour le prochain développeur. Il doit donc rembourser ce coût. Trois questions avant d'en introduire un :</p>
<ul>
<li><strong>Le problème existe-t-il aujourd'hui ?</strong> « Au cas où on changerait de base de données » n'est pas un problème présent. C'est le principe YAGNI (<em>You Aren't Gonna Need It</em>).</li>
<li><strong>Y a-t-il déjà plus d'une variante ?</strong> Une interface avec une seule implémentation, jamais remplacée dans les tests, est une indirection inutile.</li>
<li><strong>Le framework le fait-il déjà ?</strong> La DI, le pipeline middleware, <code>IOptions</code>, <code>HybridCache</code> et EF Core couvrent beaucoup de patterns.</li>
</ul>
<p>La règle de trois est un bon garde-fou : à la première occurrence, écris le code ; à la deuxième, tolère la duplication ; à la troisième, extrais l'abstraction. Tu sais alors ce qui varie vraiment.</p>

<h3>Repository et Unit of Work au-dessus d'EF Core : le débat</h3>
<p><code>DbContext</code> <em>est</em> déjà un Unit of Work (il suit les changements et les enregistre en une transaction avec <code>SaveChangesAsync</code>), et chaque <code>DbSet&lt;T&gt;</code> <em>est</em> déjà un repository. Ajouter un <code>IRepository&lt;T&gt;</code> générique avec <code>GetAll</code>, <code>Add</code>, <code>Update</code> et <code>Delete</code> par-dessus apporte souvent peu, et fait perdre <code>Include</code>, les projections et <code>AsNoTracking</code>.</p>
<p>Ce qui se défend vraiment :</p>
<ul>
<li><strong>Pas de repository générique.</strong> Côté lecture (queries CQRS), utilise le <code>DbContext</code> directement avec des projections.</li>
<li><strong>Un repository par agrégat</strong> (DDD, J19) côté écriture, avec des méthodes métier : <code>GetWithLinesAsync(orderId)</code>, <code>Add(order)</code>. Il protège la frontière de l'agrégat et garde le domaine indépendant d'EF Core.</li>
<li><strong>Tests :</strong> préfère des tests d'intégration avec une vraie base (Testcontainers, J18) à des mocks de repository qui ne vérifient pas tes requêtes LINQ.</li>
</ul>
<p>En entretien, la bonne réponse n'est pas « toujours » ni « jamais », c'est d'expliquer ce compromis.</p>

<h3>Null Object, Result et Options</h3>
<ul>
<li><strong>Null Object</strong> : une implémentation qui ne fait rien, pour éviter des <code>if (x != null)</code> partout. Dans .NET : <code>NullLogger.Instance</code>, <code>Stream.Null</code>, <code>Array.Empty&lt;T&gt;()</code>. Renvoie une collection vide plutôt que <code>null</code>.</li>
<li><strong>Result pattern</strong> (rappel J20) : renvoyer <code>Result&lt;T&gt;</code> pour les échecs <em>attendus</em> (validation, stock insuffisant) et réserver les exceptions aux situations exceptionnelles (base indisponible).</li>
<li><strong>Options pattern</strong> (rappel J12) : une classe de configuration fortement typée, liée avec <code>AddOptions&lt;T&gt;().BindConfiguration(...).ValidateDataAnnotations().ValidateOnStart()</code>. Elle remplace les chaînes magiques <code>configuration["Smtp:Host"]</code> dispersées dans le code.</li>
</ul>

<h3>Les anti-patterns à reconnaître en revue de code</h3>
<ul>
<li><strong>God class</strong> : un <code>OrderService</code> de 2 000 lignes qui fait tout. Symptômes : 15 dépendances dans le constructeur, des régions, des méthodes privées qui ne partagent rien. Remède : découper par cas d'usage (un handler par commande).</li>
<li><strong>Service Locator</strong> : injecter <code>IServiceProvider</code> et appeler <code>GetService</code> au milieu du code métier. Les dépendances deviennent invisibles et les erreurs apparaissent à l'exécution. Exceptions légitimes : les factories et le code d'infrastructure.</li>
<li><strong>Modèle anémique</strong> : des entités avec seulement des propriétés publiques <code>{ get; set; }</code>, et toutes les règles dans des services. N'importe qui peut écrire <code>order.Status = Delivered</code>. Remède : setters privés et méthodes métier (J19).</li>
<li><strong>Singleton à état mutable</strong> : un service enregistré en singleton qui garde une <code>List&lt;T&gt;</code> ou l'utilisateur courant dans un champ. Il fuit des données entre requêtes et n'est pas thread-safe. Il y a aussi la <em>captive dependency</em> : un singleton qui reçoit un service scoped (par exemple <code>DbContext</code>).</li>
<li><strong>Primitive obsession</strong> : tout est <code>string</code>, <code>int</code> ou <code>decimal</code>. Rien n'empêche d'inverser <code>customerId</code> et <code>orderId</code>. Remède : des value objects (<code>readonly record struct OrderId(Guid Value)</code>, <code>record Money(decimal Amount, string Currency)</code>).</li>
</ul>

<h3>Récapitulatif</h3>
<table>
<thead><tr><th>Pattern / anti-pattern</th><th>Problème</th><th>Dans .NET</th><th>Quand l'éviter / le corriger</th></tr></thead>
<tbody>
<tr><td>Repository générique</td><td>Abstraire l'accès aux données</td><td><code>DbSet&lt;T&gt;</code> le fait déjà</td><td>Presque toujours au-dessus d'EF Core</td></tr>
<tr><td>Repository par agrégat</td><td>Protéger la frontière DDD</td><td>Méthodes métier sur <code>DbContext</code></td><td>CRUD simple sans règles</td></tr>
<tr><td>Null Object</td><td>Supprimer les vérifications de null</td><td><code>NullLogger</code>, <code>Stream.Null</code></td><td>Quand l'absence doit être signalée</td></tr>
<tr><td>Result</td><td>Échecs attendus explicites</td><td>(<code>ProblemDetails</code> côté HTTP)</td><td>Erreurs vraiment exceptionnelles</td></tr>
<tr><td>Options</td><td>Configuration typée et validée</td><td><code>IOptions&lt;T&gt;</code></td><td>Jamais : toujours préférable aux chaînes</td></tr>
<tr><td>Service Locator</td><td>Dépendances cachées</td><td><code>IServiceProvider</code> injecté</td><td>À corriger par l'injection par constructeur</td></tr>
<tr><td>God class</td><td>Trop de responsabilités</td><td>–</td><td>À découper par cas d'usage</td></tr>
<tr><td>Primitive obsession</td><td>Types trop faibles</td><td><code>record struct</code></td><td>À corriger par des value objects</td></tr>
</tbody>
</table>
<h3>Questions d'entretien sur les patterns</h3>
<ol>
<li><strong>Quelle différence entre Decorator et Proxy ?</strong> Même structure (même interface, enveloppe l'objet réel). Le Decorator ajoute un comportement (log, cache), le Proxy contrôle l'accès (chargement différé, droits, appel distant).</li>
<li><strong>Pourquoi éviter le Singleton classique en .NET ?</strong> Il crée une dépendance globale cachée et rend les tests difficiles. <code>AddSingleton</code> donne la même garantie d'instance unique avec l'injection par constructeur.</li>
<li><strong>Strategy ou Template Method ?</strong> Strategy repose sur la composition et se change à l'exécution ; Template Method repose sur l'héritage et se fixe à la compilation. On préfère généralement Strategy.</li>
<li><strong>Où vois-tu Chain of Responsibility dans ASP.NET Core ?</strong> Dans le pipeline middleware : chaque middleware appelle <code>next</code> ou court-circuite. Aussi dans les <code>DelegatingHandler</code> de <code>HttpClient</code>.</li>
<li><strong>Faut-il un repository au-dessus d'EF Core ?</strong> Pas de repository générique : <code>DbSet</code> en est déjà un et <code>DbContext</code> est un Unit of Work. Un repository par agrégat côté écriture se justifie en DDD.</li>
<li><strong>Qu'est-ce que le Service Locator et pourquoi est-ce un anti-pattern ?</strong> Récupérer ses dépendances via <code>IServiceProvider</code> au lieu de les recevoir. Elles deviennent invisibles et les erreurs n'apparaissent qu'à l'exécution.</li>
<li><strong>Qu'est-ce qu'une captive dependency ?</strong> Un service à durée de vie longue (singleton) qui garde une référence vers un service plus court (scoped, comme <code>DbContext</code>). On la détecte avec <code>ValidateScopes</code> et <code>ValidateOnBuild</code>.</li>
<li><strong>Comment implémenter Strategy avec la DI native ?</strong> Avec les keyed services (.NET 8+) : <code>AddKeyedScoped</code>, puis <code>[FromKeyedServices]</code> ou <code>GetRequiredKeyedService</code> quand la clé est dynamique.</li>
<li><strong>Qu'est-ce que la primitive obsession ?</strong> Représenter des concepts métier par des types primitifs. On la corrige avec des value objects, par exemple <code>readonly record struct OrderId(Guid Value)</code>.</li>
<li><strong>Quand refuses-tu d'ajouter un pattern ?</strong> Quand il n'y a qu'une variante, que le problème est hypothétique ou que le framework le fait déjà. Chaque abstraction doit rembourser son coût de lecture.</li>
</ol>
<div class="note">Le niveau senior se voit autant à ce qu'on retire qu'à ce qu'on ajoute. En revue de code, propose de supprimer une interface inutile ou un repository générique avec la même assurance que tu proposerais d'ajouter un Decorator. Justifie toujours par un coût concret : « cette abstraction n'a qu'une implémentation et cache l'Include dont la requête a besoin ».</div>`,
  examples: [
    {
      title: "Repository par agrégat plutôt que générique",
      code: `using Microsoft.EntityFrameworkCore;

public sealed class Order
{
    private readonly List<OrderLine> _lines = [];
    public Guid Id { get; private set; } = Guid.NewGuid();
    public IReadOnlyList<OrderLine> Lines => _lines;
    public void AddLine(int productId, int quantity, decimal unitPrice) =>
        _lines.Add(new OrderLine(productId, quantity, unitPrice));
}
public sealed record OrderLine(int ProductId, int Quantity, decimal UnitPrice);

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();
}

// À éviter : IRepository<T> générique qui cache Include et AsNoTracking
// public interface IRepository<T> { IEnumerable<T> GetAll(); void Add(T e); ... }

// Préférable : une interface par agrégat, avec des méthodes métier
public interface IOrderRepository
{
    Task<Order?> GetWithLinesAsync(Guid id, CancellationToken ct);
    void Add(Order order);
}

public sealed class OrderRepository(AppDbContext db) : IOrderRepository
{
    public Task<Order?> GetWithLinesAsync(Guid id, CancellationToken ct) =>
        db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id, ct);

    public void Add(Order order) => db.Orders.Add(order);
}

// Le DbContext reste le Unit of Work : le handler appelle db.SaveChangesAsync(ct) une fois.
// Côté lecture (queries), on utilise db.Orders.AsNoTracking().Select(...) directement.`,
      explain: "Le repository n'expose que ce dont le domaine a besoin. Les lectures passent par des projections directes, et <code>SaveChangesAsync</code> reste l'unique point de validation."
    },
    {
      title: "Null Object : un notifier qui ne fait rien",
      code: `public interface INotifier
{
    Task NotifyAsync(string message);
}

public sealed class SlackNotifier : INotifier
{
    public Task NotifyAsync(string message)
    {
        Console.WriteLine($"[Slack] {message}");
        return Task.CompletedTask;
    }
}

// Null Object : même contrat, aucun effet
public sealed class NullNotifier : INotifier
{
    public static readonly NullNotifier Instance = new();
    private NullNotifier() { }
    public Task NotifyAsync(string message) => Task.CompletedTask;
}

public sealed class OrderProcessor(INotifier notifier)
{
    public async Task ProcessAsync(int orderId)
    {
        Console.WriteLine($"Traitement de la commande {orderId}");
        await notifier.NotifyAsync($"Commande {orderId} traitée"); // aucun if (notifier != null)
    }
}

var slackEnabled = false; // viendrait de la configuration
INotifier notifier = slackEnabled ? new SlackNotifier() : NullNotifier.Instance;
await new OrderProcessor(notifier).ProcessAsync(7);`,
      explain: "Le code métier n'a plus de vérification de null. En DI, enregistre <code>NullNotifier</code> quand la fonctionnalité est désactivée."
    },
    {
      title: "Primitive obsession corrigée par des value objects",
      code: `// Avant : rien n'empêche d'inverser les deux identifiants
// void Ship(Guid orderId, Guid customerId, decimal amount, string currency)

public readonly record struct OrderId(Guid Value)
{
    public static OrderId New() => new(Guid.NewGuid());
    public override string ToString() => Value.ToString();
}

public readonly record struct CustomerId(Guid Value);

public sealed record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount), "Montant négatif.");
        if (currency.Length != 3) throw new ArgumentException("Code devise ISO attendu.", nameof(currency));
        Amount = amount;
        Currency = currency.ToUpperInvariant();
    }

    public Money Add(Money other) =>
        other.Currency == Currency
            ? new Money(Amount + other.Amount, Currency)
            : throw new InvalidOperationException("Devises différentes.");
}

static void Ship(OrderId orderId, CustomerId customerId, Money amount) =>
    Console.WriteLine($"Expédition {orderId} pour {customerId.Value} : {amount.Amount} {amount.Currency}");

var order = OrderId.New();
var customer = new CustomerId(Guid.NewGuid());
Ship(order, customer, new Money(49.90m, "eur"));
// Ship(customer, order, ...) ne compile plus : l'erreur est détectée par le compilateur`,
      explain: "Les <code>readonly record struct</code> ne coûtent quasiment rien en mémoire et donnent l'égalité par valeur. Avec EF Core, on les mappe avec des value converters ou des complex types."
    },
    {
      title: "Détecter un singleton à état mutable et une captive dependency",
      code: `using Microsoft.Extensions.DependencyInjection;

// Anti-pattern : singleton qui stocke un état par requête
public sealed class CurrentUserHolder
{
    public string? UserName { get; set; } // partagé par TOUTES les requêtes : fuite de données
}

public sealed class ScopedThing { }

// Anti-pattern : singleton qui capture un service scoped
public sealed class ReportCache(ScopedThing scoped) { }

var services = new ServiceCollection();
services.AddSingleton<CurrentUserHolder>();
services.AddScoped<ScopedThing>();
services.AddSingleton<ReportCache>();

// ValidateScopes détecte la captive dependency au moment de la résolution
// (ASP.NET Core l'active automatiquement en environnement Development)
using var provider = services.BuildServiceProvider(new ServiceProviderOptions
{
    ValidateScopes = true,
    ValidateOnBuild = true
});`,
      explain: "Avec <code>ValidateOnBuild</code>, la construction échoue avec un message clair : un service singleton ne peut pas consommer un service scoped. Pour l'utilisateur courant, utilise un service scoped ou <code>IHttpContextAccessor</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Repérer les anti-patterns",
      prompt: `<p>Liste les anti-patterns présents dans ce code et propose une correction pour chacun :</p>
<pre><code>public class OrderManager
{
    private readonly IServiceProvider _sp;
    public static List&lt;string&gt; Errors = new();
    public OrderManager(IServiceProvider sp) =&gt; _sp = sp;

    public void Process(string orderId, string customerId, decimal amount, string currency)
    {
        var db = _sp.GetService&lt;AppDbContext&gt;();
        var order = db!.Orders.Find(orderId);
        order!.Status = "Shipped";
        if (amount &lt; 0) Errors.Add("Montant négatif");
        db.SaveChanges();
    }
}</code></pre>`,
      hint: `<p>Cherche au moins cinq problèmes : la façon d'obtenir les dépendances, l'état statique, les types des paramètres, la façon de changer le statut, les appels synchrones et le traitement des erreurs.</p>`,
      solution: `/*
Anti-patterns relevés :
1. Service Locator : IServiceProvider injecté puis GetService dans le code métier.
   -> Injecter AppDbContext (ou IOrderRepository) par le constructeur.
2. État statique mutable : public static List<string> Errors, partagé par tous les threads et requêtes.
   -> Renvoyer un Result avec les erreurs.
3. Primitive obsession : orderId, customerId en string, amount + currency séparés.
   -> OrderId, CustomerId (record struct) et Money.
4. Modèle anémique : order.Status = "Shipped" assigné de l'extérieur, en chaîne de caractères.
   -> Méthode métier order.Ship() avec enum OrderStatus et transitions contrôlées.
5. Validation après l'action et erreur ignorée : on enregistre même si le montant est négatif.
   -> Valider avant, et arrêter le traitement.
6. Appels synchrones (Find, SaveChanges) et null-forgiving (!) qui masquent un NullReferenceException.
   -> FindAsync / SaveChangesAsync et gestion explicite du "non trouvé".
*/

public sealed class ShipOrderHandler(IOrderRepository orders, AppDbContext db)
{
    public async Task<Result> HandleAsync(OrderId orderId, CancellationToken ct)
    {
        var order = await orders.GetAsync(orderId, ct);
        if (order is null) return Result.Failure("Commande introuvable.");

        var shipped = order.Ship(); // la règle de transition vit dans l'agrégat
        if (!shipped.IsSuccess) return shipped;

        await db.SaveChangesAsync(ct);
        return Result.Success();
    }
}

public readonly record struct OrderId(Guid Value);

public sealed record Result(bool IsSuccess, string? Error)
{
    public static Result Success() => new(true, null);
    public static Result Failure(string error) => new(false, error);
}

public interface IOrderRepository { Task<Order?> GetAsync(OrderId id, CancellationToken ct); }

public enum OrderStatus { Pending, Paid, Shipped }
public sealed class Order
{
    public OrderStatus Status { get; private set; }
    public Result Ship()
    {
        if (Status != OrderStatus.Paid) return Result.Failure("Seule une commande payée peut être expédiée.");
        Status = OrderStatus.Shipped;
        return Result.Success();
    }
}

public sealed class AppDbContext : Microsoft.EntityFrameworkCore.DbContext { }`
    },
    {
      level: "moyen",
      title: "Options pattern validé au démarrage",
      prompt: `<p>Le code lit la configuration SMTP avec <code>configuration["Smtp:Host"]</code> et <code>int.Parse(configuration["Smtp:Port"]!)</code> à plusieurs endroits. Remplace-le par une classe <code>SmtpOptions</code> liée à la section <code>Smtp</code>, validée au démarrage (hôte obligatoire, port entre 1 et 65535, expéditeur au format e-mail), puis injecte-la dans un <code>EmailSender</code>.</p>`,
      hint: `<p>Utilise les attributs de <code>System.ComponentModel.DataAnnotations</code> et la chaîne <code>AddOptions&lt;T&gt;().BindConfiguration("Smtp").ValidateDataAnnotations().ValidateOnStart()</code>.</p>`,
      solution: `using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOptions<SmtpOptions>()
    .BindConfiguration(SmtpOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart(); // l'application refuse de démarrer si la config est invalide

builder.Services.AddSingleton<EmailSender>();

var app = builder.Build();
app.MapPost("/test-email", (EmailSender sender) => sender.Describe());
app.Run();

public sealed class SmtpOptions
{
    public const string SectionName = "Smtp";

    [Required]
    public string Host { get; init; } = "";

    [Range(1, 65535)]
    public int Port { get; init; } = 587;

    [Required, EmailAddress]
    public string From { get; init; } = "";

    public bool UseSsl { get; init; } = true;
}

public sealed class EmailSender(IOptions<SmtpOptions> options)
{
    private readonly SmtpOptions _smtp = options.Value;

    public string Describe() => $"Envoi via {_smtp.Host}:{_smtp.Port} depuis {_smtp.From} (SSL : {_smtp.UseSsl})";
}

/* appsettings.json :
{
  "Smtp": { "Host": "smtp.example.com", "Port": 587, "From": "noreply@example.com" }
}
*/`
    },
    {
      level: "difficile",
      title: "Refactorer un OrderService vers Strategy et State",
      prompt: `<p>Voici un extrait typique d'un <code>OrderService</code> qui a grossi pendant deux ans :</p>
<pre><code>public decimal Checkout(Order o, string shipping, string customerType)
{
    if (o.Status != "Pending") throw new Exception("Statut invalide");
    decimal total = o.Lines.Sum(l =&gt; l.Price * l.Qty);
    if (customerType == "vip") total *= 0.9m;
    else if (customerType == "employee") total *= 0.7m;
    decimal fee;
    switch (shipping)
    {
        case "standard": fee = total &gt;= 50 ? 0 : 4.9m; break;
        case "express": fee = 9.9m; break;
        case "pickup": fee = 0; break;
        default: throw new Exception("Livraison inconnue");
    }
    o.Status = "Paid";
    return total + fee;
}</code></pre>
<p>Refactore-le en plusieurs étapes, sans changer le comportement : (1) écris des tests de caractérisation, (2) extrais la remise et la livraison en Strategy, (3) déplace la transition de statut dans l'agrégat avec un enum, (4) remplace les <code>Exception</code> génériques par un Result.</p>`,
      hint: `<p>Commence <strong>toujours</strong> par les tests qui figent le comportement actuel (y compris les cas limites : total à exactement 50, type de client inconnu). Fais ensuite un petit changement à la fois et relance les tests après chacun.</p>`,
      solution: `// Étape 1 : tests de caractérisation (xUnit), écrits AVANT le refactoring
// [Theory]
// [InlineData("regular", "standard", 40, 44.9)]
// [InlineData("regular", "standard", 50, 50)]   // seuil exact : livraison offerte
// [InlineData("vip", "express", 100, 99.9)]     // 90 + 9.9
// [InlineData("employee", "pickup", 100, 70)]
// public void Checkout_keeps_behavior(string type, string shipping, decimal subtotal, decimal expected) { ... }
// Attention : dans l'ancien code, la livraison gratuite dépend du total APRÈS remise. On le conserve.

// Étape 2 : Strategy pour la remise et la livraison
public interface IDiscountStrategy { decimal Apply(decimal subtotal); }
public sealed class NoDiscount : IDiscountStrategy { public decimal Apply(decimal s) => s; }
public sealed class VipDiscount : IDiscountStrategy { public decimal Apply(decimal s) => s * 0.9m; }
public sealed class EmployeeDiscount : IDiscountStrategy { public decimal Apply(decimal s) => s * 0.7m; }

public interface IShippingStrategy { decimal Fee(decimal total); }
public sealed class StandardShipping : IShippingStrategy { public decimal Fee(decimal t) => t >= 50 ? 0 : 4.9m; }
public sealed class ExpressShipping : IShippingStrategy { public decimal Fee(decimal t) => 9.9m; }
public sealed class PickupShipping : IShippingStrategy { public decimal Fee(decimal t) => 0m; }

// Étape 3 : la transition vit dans l'agrégat
public enum OrderStatus { Pending, Paid }
public sealed record OrderLine(decimal Price, int Qty);

public sealed class Order(IReadOnlyList<OrderLine> lines)
{
    public IReadOnlyList<OrderLine> Lines { get; } = lines;
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public decimal Subtotal => Lines.Sum(l => l.Price * l.Qty);

    public Result<decimal> MarkPaid(decimal amount)
    {
        if (Status != OrderStatus.Pending) return Result<decimal>.Fail("Seule une commande en attente peut être payée.");
        Status = OrderStatus.Paid;
        return Result<decimal>.Ok(amount);
    }
}

// Étape 4 : Result à la place des exceptions génériques
public sealed record Result<T>(bool IsSuccess, T? Value, string? Error)
{
    public static Result<T> Ok(T value) => new(true, value, null);
    public static Result<T> Fail(string error) => new(false, default, error);
}

// Le service ne fait plus qu'orchestrer
public sealed class CheckoutService
{
    // ponytail: dictionnaires en dur, passer aux keyed services quand les stratégies ont des dépendances
    private static readonly Dictionary<string, IDiscountStrategy> Discounts = new()
    {
        ["regular"] = new NoDiscount(), ["vip"] = new VipDiscount(), ["employee"] = new EmployeeDiscount()
    };
    private static readonly Dictionary<string, IShippingStrategy> Shippings = new()
    {
        ["standard"] = new StandardShipping(), ["express"] = new ExpressShipping(), ["pickup"] = new PickupShipping()
    };

    public Result<decimal> Checkout(Order order, string shipping, string customerType)
    {
        if (!Shippings.TryGetValue(shipping, out var ship))
            return Result<decimal>.Fail($"Mode de livraison inconnu : {shipping}");

        // L'ancien code appliquait "pas de remise" pour un type inconnu : comportement conservé
        var discount = Discounts.GetValueOrDefault(customerType, new NoDiscount());

        var total = discount.Apply(order.Subtotal);
        return order.MarkPaid(total + ship.Fee(total));
    }
}

// Vérification rapide
var service = new CheckoutService();
var result = service.Checkout(new Order([new OrderLine(25m, 4)]), "express", "vip");
Console.WriteLine(result); // IsSuccess = True, Value = 99.9`
    }
  ],
  project: `<p><strong>OrderFlow : revue des patterns du projet.</strong></p>
<ol>
<li>Fais l'inventaire de toutes les abstractions du projet : interfaces, decorators, stratégies, repositories, handlers. Pour chacune, note dans un tableau du README : le problème qu'elle résout, le nombre d'implémentations, et si un test la remplace.</li>
<li>Supprime celles qui n'apportent rien : interface avec une seule implémentation jamais remplacée, repository générique, factory qui ne fait qu'un <code>new</code>. Relance tous les tests après chaque suppression.</li>
<li>Vérifie l'absence d'anti-patterns : aucun <code>IServiceProvider</code> injecté dans le code métier, aucun singleton avec un état par requête (<code>ValidateOnBuild = true</code> en Development), aucun setter public de <code>Status</code>.</li>
<li>Remplace au moins un identifiant primitif par un value object (<code>OrderId</code> en <code>readonly record struct</code>) avec un value converter EF Core.</li>
<li>Rédige un ADR court : « Repository par agrégat côté écriture, DbContext direct côté lecture ».</li>
</ol>`,
  resources: [
    { label: "Anti-patterns et code smells (Refactoring Guru)", url: "https://refactoring.guru/refactoring/smells" },
    { label: "Pattern Options dans .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/options" },
    { label: "Concevoir la couche de persistance (microservices .NET)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design" },
    { label: "Recommandations sur l'injection de dépendances", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/dependency-injection-guidelines" }
  ]
});
