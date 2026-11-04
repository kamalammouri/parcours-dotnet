window.COURSE = window.COURSE || [];

// ───────────────────────── Jour 15 ─────────────────────────
window.COURSE.push({
  day: 15, week: 3,
  title: "SOLID appliqué et Clean Architecture",
  summary: "Découper OrderFlow en couches dont les dépendances pointent toutes vers le domaine.",
  objectives: [
    "Appliquer les cinq principes SOLID sur du vrai code, pas sur des définitions",
    "Comprendre la règle de dépendance de la Clean Architecture",
    "Restructurer une API monolithique en projets Domain / Application / Infrastructure / Api"
  ],
  lesson: `<h3>SOLID, version pratique</h3>
<p>SOLID n'est pas une checklist à cocher, c'est un ensemble de signaux d'alerte. Chaque principe répond à une douleur concrète que tu as sûrement déjà vécue côté front ou back :</p>
<ul>
<li><strong>S — Single Responsibility</strong> : une classe n'a qu'une raison de changer. Un <code>OrderController</code> qui valide, calcule les taxes, envoie l'e-mail et sauvegarde change pour quatre raisons différentes. Sépare la règle métier (domaine), l'orchestration (application) et la technique (infrastructure).</li>
<li><strong>O — Open/Closed</strong> : ajouter un comportement sans modifier le code existant. En C#, cela passe souvent par une interface et plusieurs implémentations (stratégies de remise, moyens de paiement) plutôt qu'un <code>switch</code> qui grossit.</li>
<li><strong>L — Liskov</strong> : une sous-classe doit pouvoir remplacer sa classe mère sans surprise. Si ta classe dérivée lance <code>NotSupportedException</code> sur une méthode héritée, l'héritage est faux : préfère la composition.</li>
<li><strong>I — Interface Segregation</strong> : des interfaces petites et ciblées. Un <code>IOrderRepository</code> avec 25 méthodes force chaque test à tout simuler.</li>
<li><strong>D — Dependency Inversion</strong> : le code métier dépend d'abstractions qu'il définit lui-même ; l'infrastructure les implémente. C'est la clé de la Clean Architecture.</li>
</ul>
<h3>La règle de dépendance</h3>
<p>La Clean Architecture (Robert C. Martin), proche de l'architecture hexagonale (ports et adaptateurs) et de l'Onion Architecture, organise le code en cercles concentriques. <strong>Les dépendances de code source ne pointent que vers l'intérieur.</strong></p>
<ul>
<li><code>OrderFlow.Domain</code> : entités, value objects, règles métier, événements de domaine. Aucune dépendance NuGet technique (ni EF Core, ni ASP.NET).</li>
<li><code>OrderFlow.Application</code> : cas d'utilisation (créer une commande, annuler, lister), interfaces nécessaires (<code>IOrderRepository</code>, <code>IClock</code>, <code>IEmailSender</code>), DTOs. Dépend uniquement de Domain.</li>
<li><code>OrderFlow.Infrastructure</code> : EF Core, DbContext, implémentations des repositories, envoi d'e-mails, appels HTTP. Dépend de Application (pour implémenter ses interfaces).</li>
<li><code>OrderFlow.Api</code> : endpoints, authentification, composition root (<code>Program.cs</code>). Dépend de Application et Infrastructure (seulement pour l'enregistrement DI).</li>
</ul>
<p>Concrètement, avec la CLI :</p>
<p><code>dotnet new classlib -n OrderFlow.Domain</code>, puis <code>dotnet add OrderFlow.Application reference OrderFlow.Domain</code>, etc. Le compilateur devient ton garde-fou : si Domain ne référence pas EF Core, personne ne pourra y mettre un <code>DbContext</code> par erreur.</p>
<h3>Le composition root</h3>
<p>Chaque couche expose une méthode d'extension <code>AddApplication()</code> / <code>AddInfrastructure(configuration)</code>. <code>Program.cs</code> les appelle. C'est le seul endroit qui connaît toutes les implémentations concrètes.</p>
<h3>Pièges courants</h3>
<ul>
<li><strong>Le domaine anémique</strong> : des entités qui ne sont que des sacs de propriétés <code>{ get; set; }</code>, et toute la logique dans des « services ». Tu as alors les couches sans le bénéfice.</li>
<li><strong>Un repository générique <code>IRepository&lt;T&gt;</code> qui enveloppe EF Core</strong> : EF Core est déjà un Unit of Work + repository. Un wrapper générique ajoute du code sans protéger de rien. Préfère des repositories spécifiques par agrégat, ou utilise le DbContext directement dans les handlers de lecture.</li>
<li><strong>Fuite d'entités EF dans les réponses HTTP</strong> : renvoie des DTOs, sinon tu exposes ton schéma et tu crées des cycles de sérialisation.</li>
<li><strong>Trop de projets</strong> : 4 projets suffisent. Un projet « Shared », « Common », « Contracts », « Core »… dilue les responsabilités.</li>
</ul>
<div class="note"><strong>Niveau senior</strong> : la Clean Architecture a un coût (indirection, fichiers en plus). Un senior sait la justifier — domaine riche, longue durée de vie, plusieurs points d'entrée (API, worker, CLI) — et sait aussi dire non pour un CRUD simple ou un microservice de 500 lignes, où une organisation <em>Vertical Slice</em> (un dossier par fonctionnalité) est souvent plus efficace. En entretien, montre que tu connais les deux et quand choisir chacune.</div>`,
  examples: [
    {
      title: "Dependency Inversion : l'interface vit dans Application",
      code: `// OrderFlow.Application/Abstractions/IOrderRepository.cs
namespace OrderFlow.Application.Abstractions;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken ct);
    void Add(Order order);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct);
}

// OrderFlow.Infrastructure/Persistence/OrderRepository.cs
namespace OrderFlow.Infrastructure.Persistence;

internal sealed class OrderRepository(OrderFlowDbContext db) : IOrderRepository
{
    public Task<Order?> GetByIdAsync(Guid id, CancellationToken ct) =>
        db.Orders.Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id, ct);

    public void Add(Order order) => db.Orders.Add(order);
}`,
      explain: "Application définit ce dont elle a besoin ; Infrastructure s'y conforme. L'implémentation est <code>internal</code> : personne hors d'Infrastructure ne peut en dépendre."
    },
    {
      title: "Composition root avec méthodes d'extension par couche",
      code: `// OrderFlow.Infrastructure/DependencyInjection.cs
public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<OrderFlowDbContext>(o =>
            o.UseNpgsql(config.GetConnectionString("OrderFlow")));

        services.AddScoped<IOrderRepository, OrderRepository>();
        // le DbContext est déjà un Unit of Work
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<OrderFlowDbContext>());
        services.AddSingleton(TimeProvider.System);
        return services;
    }
}

// OrderFlow.Api/Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services
    .AddApplication()
    .AddInfrastructure(builder.Configuration);

var app = builder.Build();
app.MapOrderEndpoints();
app.Run();`,
      explain: "Chaque couche sait s'enregistrer. <code>Program.cs</code> reste court et lisible. <code>TimeProvider</code> (intégré depuis .NET 8) remplace un <code>IClock</code> maison."
    },
    {
      title: "Open/Closed : stratégies de remise",
      code: `public interface IDiscountPolicy
{
    bool AppliesTo(Order order);
    decimal Compute(Order order);
}

public sealed class LoyalCustomerDiscount : IDiscountPolicy
{
    public bool AppliesTo(Order order) => order.Customer.IsLoyal;
    public decimal Compute(Order order) => order.Subtotal * 0.05m;
}

public sealed class BulkDiscount : IDiscountPolicy
{
    public bool AppliesTo(Order order) => order.Lines.Sum(l => l.Quantity) >= 50;
    public decimal Compute(Order order) => order.Subtotal * 0.10m;
}

// Ajouter une remise = ajouter une classe, sans toucher au calculateur
public sealed class DiscountCalculator(IEnumerable<IDiscountPolicy> policies)
{
    public decimal BestDiscount(Order order) =>
        policies.Where(p => p.AppliesTo(order))
                .Select(p => p.Compute(order))
                .DefaultIfEmpty(0m)
                .Max();
}`,
      explain: "Le conteneur DI injecte toutes les implémentations enregistrées via <code>IEnumerable&lt;IDiscountPolicy&gt;</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Repérer les violations SOLID",
      prompt: `<p>Voici une méthode de contrôleur. Liste les responsabilités qu'elle porte et indique pour chacune la couche où elle devrait vivre.</p>
<pre>[HttpPost]
public async Task&lt;IActionResult&gt; Create(CreateOrderRequest req)
{
    if (req.Lines.Count == 0) return BadRequest("Commande vide");
    var order = new Order { CustomerId = req.CustomerId, Status = "Pending" };
    foreach (var l in req.Lines)
    {
        var p = await _db.Products.FindAsync(l.ProductId);
        order.Lines.Add(new OrderLine { ProductId = p.Id, Price = p.Price, Quantity = l.Quantity });
    }
    order.Total = order.Lines.Sum(x =&gt; x.Price * x.Quantity) * 1.2m;
    _db.Orders.Add(order);
    await _db.SaveChangesAsync();
    await new SmtpClient("smtp.local").SendMailAsync("shop@x.fr", "client@x.fr", "Merci", "...");
    return Ok(order);
}</pre>`,
      hint: "<p>Cherche : validation d'entrée, règle métier, calcul, persistance, notification, format de réponse. Remarque aussi le <code>new SmtpClient</code> et le retour d'entité.</p>",
      solution: `// Responsabilités et couche cible :
// 1. Validation de la requête HTTP (liste vide)     -> Api (validation d'entrée) ou Application (validator)
// 2. Invariant "une commande a au moins une ligne"  -> Domain (Order.Create)
// 3. Chargement des produits                         -> Application (handler) via repository/DbContext
// 4. Calcul du total + TVA 20 %                       -> Domain (Order.Total, règle métier)
// 5. Statut en string "Pending"                       -> Domain (enum OrderStatus)
// 6. Persistance                                      -> Infrastructure (repository + UnitOfWork)
// 7. Envoi d'e-mail avec new SmtpClient               -> Infrastructure (IEmailSender), déclenché
//                                                        par un événement de domaine OrderPlaced
// 8. Retour de l'entité                               -> Api doit renvoyer un DTO (OrderResponse)
//
// Violations : S (7 raisons de changer), D (dépend de SmtpClient concret),
// et domaine anémique (Order n'a aucune logique).
// Bug caché : p peut être null (FindAsync) -> NullReferenceException.`
    },
    {
      level: "moyen",
      title: "Créer la solution en 4 projets",
      prompt: `<p>Écris le script <code>dotnet</code> CLI qui crée la solution <code>OrderFlow</code> avec les projets Domain, Application, Infrastructure, Api et un projet de tests, avec <strong>uniquement</strong> les références autorisées par la règle de dépendance.</p>`,
      hint: "<p><code>dotnet new sln</code>, <code>dotnet new classlib</code>, <code>dotnet new webapi</code>, <code>dotnet sln add</code>, <code>dotnet add ... reference ...</code>.</p>",
      solution: `# Script PowerShell / bash
dotnet new sln -n OrderFlow

dotnet new classlib -n OrderFlow.Domain         -o src/OrderFlow.Domain
dotnet new classlib -n OrderFlow.Application    -o src/OrderFlow.Application
dotnet new classlib -n OrderFlow.Infrastructure -o src/OrderFlow.Infrastructure
dotnet new webapi   -n OrderFlow.Api            -o src/OrderFlow.Api
dotnet new xunit    -n OrderFlow.Domain.Tests   -o tests/OrderFlow.Domain.Tests

dotnet sln add src/OrderFlow.Domain src/OrderFlow.Application src/OrderFlow.Infrastructure src/OrderFlow.Api tests/OrderFlow.Domain.Tests

# Règle de dépendance : vers l'intérieur uniquement
dotnet add src/OrderFlow.Application    reference src/OrderFlow.Domain
dotnet add src/OrderFlow.Infrastructure reference src/OrderFlow.Application
dotnet add src/OrderFlow.Api            reference src/OrderFlow.Application src/OrderFlow.Infrastructure
dotnet add tests/OrderFlow.Domain.Tests reference src/OrderFlow.Domain

# Paquets techniques seulement dans Infrastructure
dotnet add src/OrderFlow.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL

dotnet build`
    },
    {
      level: "difficile",
      title: "Test d'architecture automatique",
      prompt: `<p>Écris un test xUnit qui échoue si <code>OrderFlow.Domain</code> référence un assembly dont le nom commence par <code>Microsoft.EntityFrameworkCore</code> ou <code>Microsoft.AspNetCore</code>, et si <code>OrderFlow.Application</code> référence <code>OrderFlow.Infrastructure</code>. N'utilise pas de bibliothèque externe.</p>`,
      hint: "<p><code>typeof(Order).Assembly.GetReferencedAssemblies()</code> renvoie les <code>AssemblyName</code> référencés. Prends un type public de chaque assembly comme ancre.</p>",
      solution: `using System.Reflection;
using OrderFlow.Domain.Orders;
using OrderFlow.Application;

public class ArchitectureTests
{
    private static string[] References(Assembly a) =>
        a.GetReferencedAssemblies().Select(n => n.Name!).ToArray();

    [Theory]
    [InlineData("Microsoft.EntityFrameworkCore")]
    [InlineData("Microsoft.AspNetCore")]
    public void Domain_ne_depend_pas_de_la_technique(string forbiddenPrefix)
    {
        var refs = References(typeof(Order).Assembly);

        var offenders = refs.Where(r => r.StartsWith(forbiddenPrefix)).ToArray();

        Assert.Empty(offenders);
    }

    [Fact]
    public void Application_ne_depend_pas_de_Infrastructure()
    {
        // DependencyInjection est la classe d'extension AddApplication()
        var refs = References(typeof(DependencyInjection).Assembly);

        Assert.DoesNotContain("OrderFlow.Infrastructure", refs);
    }
}
// Note : le test d'Application est surtout utile si quelqu'un ajoute la référence
// de projet ; le compilateur bloque déjà les cycles. Pour des règles plus riches
// (namespaces, suffixes de noms), la bibliothèque NetArchTest fait la même chose
// en plus lisible.`
    }
  ],
  project: `<p><strong>OrderFlow — restructuration.</strong> Découpe <code>OrderFlow.Api</code> (semaine 2) en quatre projets. Déplace les entités <code>Customer</code>, <code>Product</code>, <code>Order</code>, <code>OrderLine</code>, <code>OrderStatus</code> dans Domain, le DbContext et les configurations EF dans Infrastructure, et crée <code>AddApplication()</code> / <code>AddInfrastructure()</code>. Critère de fin : <code>dotnet build</code> passe, l'API répond comme avant, et Domain n'a aucune référence NuGet. Ajoute le test d'architecture de l'exercice difficile.</p>`,
  resources: [
    { label: "Principes d'architecture (Microsoft)", url: "https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/architectural-principles" },
    { label: "Architectures courantes d'applications web", url: "https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures" }
  ]
});

// ───────────────────────── Jour 16 ─────────────────────────
window.COURSE.push({
  day: 16, week: 3,
  title: "CQRS, handlers et pipeline behaviors",
  summary: "Séparer les écritures (commands) des lectures (queries) et ajouter validation et logs de façon transversale.",
  objectives: [
    "Distinguer command et query, et savoir pourquoi les séparer",
    "Écrire des handlers avec MediatR ou avec un dispatcher maison",
    "Ajouter des comportements transversaux (validation, logging) sans toucher aux handlers"
  ],
  lesson: `<h3>CQRS en une phrase</h3>
<p><strong>Command Query Responsibility Segregation</strong> : une opération soit modifie l'état (command), soit renvoie des données (query), jamais les deux. Au niveau applicatif, cela donne une classe par cas d'utilisation : <code>PlaceOrderCommand</code> + <code>PlaceOrderHandler</code>, <code>GetOrderByIdQuery</code> + <code>GetOrderByIdHandler</code>.</p>
<p>CQRS n'implique <strong>pas</strong> deux bases de données ni l'event sourcing. Ce sont des options pour des cas extrêmes. Dans 90 % des projets, CQRS signifie simplement : les commandes passent par le modèle de domaine (agrégats, invariants), les requêtes lisent directement la base avec des projections optimisées (<code>Select</code> vers un DTO, <code>AsNoTracking</code>, voire Dapper).</p>
<h3>Pourquoi c'est utile</h3>
<ul>
<li>Chaque handler est petit, testable et a une seule raison de changer (SRP).</li>
<li>Les lectures ne chargent plus des agrégats complets avec leurs <code>Include</code> : elles projettent exactement les colonnes nécessaires.</li>
<li>Les comportements transversaux (validation, logs, transactions, métriques) se branchent une fois pour toutes les requêtes.</li>
</ul>
<h3>MediatR… et sa licence</h3>
<p>MediatR a longtemps été le choix par défaut. <strong>Depuis 2025, les nouvelles versions de MediatR (comme AutoMapper) sont sous licence commerciale</strong> : gratuites pour certains usages (petites structures, open source), payantes pour la plupart des entreprises. Vérifie la licence avant de l'introduire chez un client. Les anciennes versions sous licence Apache restent utilisables mais ne reçoivent plus d'évolutions.</p>
<p>Bonne nouvelle : un dispatcher maison fait 30 lignes. L'idée tient dans deux interfaces : <code>ICommandHandler&lt;TCommand, TResult&gt;</code> et <code>IQueryHandler&lt;TQuery, TResult&gt;</code>, enregistrées dans le conteneur DI. Le endpoint injecte directement le handler dont il a besoin. Tu perds le « découplage » de <code>mediator.Send()</code>, mais tu gagnes en lisibilité : « Go to definition » mène directement au code.</p>
<h3>Les pipeline behaviors</h3>
<p>Un behavior entoure l'exécution du handler, comme un middleware ASP.NET Core mais au niveau applicatif. Avec MediatR, on implémente <code>IPipelineBehavior&lt;TRequest, TResponse&gt;</code>. Sans MediatR, on utilise le pattern <strong>Decorator</strong> : une classe qui implémente la même interface et enveloppe le handler réel (la bibliothèque Scrutor offre <code>services.Decorate(...)</code>, ou tu l'écris à la main).</p>
<p>Behaviors classiques : <strong>validation</strong> (FluentValidation, toujours sous licence Apache), <strong>logging</strong> avec durée, <strong>transaction</strong> pour les commandes uniquement.</p>
<h3>Pièges courants</h3>
<ul>
<li><strong>Handler qui appelle un autre handler</strong> via le mediator : tu recrées un graphe d'appels invisible. Extrais plutôt un service de domaine.</li>
<li><strong>Query qui modifie l'état</strong> (mise à jour d'un compteur de vues) : c'est une commande déguisée.</li>
<li><strong>Commande qui renvoie l'agrégat complet</strong> : renvoie l'identifiant créé ou un résultat minimal ; le client relira via une query.</li>
<li><strong>Un behavior de transaction appliqué aux queries</strong> : coût inutile. Filtre sur une interface marqueur <code>ICommand</code>.</li>
<li><strong>Un dossier « Commands » et un dossier « Queries » géants</strong> : range plutôt par fonctionnalité (<code>Orders/PlaceOrder.cs</code> contient la commande, son validator et son handler), pour trouver tout le cas d'usage au même endroit.</li>
</ul>
<div class="note"><strong>Niveau senior</strong> : sache expliquer que MediatR n'est pas CQRS. CQRS est un principe de séparation ; MediatR est un outil de dispatch en mémoire. On peut faire du CQRS sans MediatR, et utiliser MediatR sans faire de CQRS. Si on te demande « faut-il MediatR ? », la bonne réponse parle de besoins (behaviors transversaux, nombre de cas d'usage), de licence et du coût d'indirection, pas de mode.</div>`,
  examples: [
    {
      title: "Dispatcher maison : interfaces et handler de commande",
      code: `// OrderFlow.Application/Abstractions/Messaging.cs
public interface ICommand<TResult>;
public interface IQuery<TResult>;

public interface ICommandHandler<in TCommand, TResult> where TCommand : ICommand<TResult>
{
    Task<TResult> Handle(TCommand command, CancellationToken ct);
}

public interface IQueryHandler<in TQuery, TResult> where TQuery : IQuery<TResult>
{
    Task<TResult> Handle(TQuery query, CancellationToken ct);
}

// OrderFlow.Application/Orders/PlaceOrder.cs
public sealed record PlaceOrderCommand(Guid CustomerId, IReadOnlyList<PlaceOrderLine> Lines)
    : ICommand<Guid>;

public sealed record PlaceOrderLine(Guid ProductId, int Quantity);

internal sealed class PlaceOrderHandler(
    IOrderRepository orders,
    IProductRepository products,
    IUnitOfWork uow,
    TimeProvider clock) : ICommandHandler<PlaceOrderCommand, Guid>
{
    public async Task<Guid> Handle(PlaceOrderCommand cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.CustomerId, clock.GetUtcNow());
        foreach (var line in cmd.Lines)
        {
            var product = await products.GetByIdAsync(line.ProductId, ct)
                ?? throw new InvalidOperationException("Produit inconnu");
            order.AddLine(product.Id, product.Price, line.Quantity);
        }
        orders.Add(order);
        await uow.SaveChangesAsync(ct);
        return order.Id;
    }
}`,
      explain: "Aucune dépendance externe. Le endpoint injecte <code>ICommandHandler&lt;PlaceOrderCommand, Guid&gt;</code> directement. Au jour 20, on remplacera l'exception par un <code>Result</code>."
    },
    {
      title: "Query : projection directe, sans agrégat",
      code: `public sealed record GetOrderByIdQuery(Guid Id) : IQuery<OrderDto?>;

public sealed record OrderDto(Guid Id, string Status, decimal Total, int LineCount);

// Dans Infrastructure : la query lit la base directement
internal sealed class GetOrderByIdHandler(OrderFlowDbContext db)
    : IQueryHandler<GetOrderByIdQuery, OrderDto?>
{
    public Task<OrderDto?> Handle(GetOrderByIdQuery q, CancellationToken ct) =>
        db.Orders
          .AsNoTracking()
          .Where(o => o.Id == q.Id)
          .Select(o => new OrderDto(
              o.Id,
              o.Status.ToString(),
              o.Lines.Sum(l => l.UnitPrice * l.Quantity),
              o.Lines.Count))
          .FirstOrDefaultAsync(ct);
}

// Endpoint
app.MapGet("/orders/{id:guid}", async (
    Guid id,
    IQueryHandler<GetOrderByIdQuery, OrderDto?> handler,
    CancellationToken ct) =>
{
    var dto = await handler.Handle(new GetOrderByIdQuery(id), ct);
    return dto is null ? Results.NotFound() : Results.Ok(dto);
});`,
      explain: "EF Core traduit la projection en un seul SELECT avec un SUM et un COUNT : pas d'<code>Include</code>, pas de tracking. Placer ce handler dans Infrastructure est un compromis pragmatique courant."
    },
    {
      title: "Behavior de logging en Decorator (et équivalent MediatR)",
      code: `// Sans MediatR : Decorator
internal sealed class LoggingCommandHandler<TCommand, TResult>(
    ICommandHandler<TCommand, TResult> inner,
    ILogger<LoggingCommandHandler<TCommand, TResult>> logger)
    : ICommandHandler<TCommand, TResult> where TCommand : ICommand<TResult>
{
    public async Task<TResult> Handle(TCommand command, CancellationToken ct)
    {
        var name = typeof(TCommand).Name;
        var start = Stopwatch.GetTimestamp();
        try
        {
            return await inner.Handle(command, ct);
        }
        finally
        {
            logger.LogInformation("{Command} exécutée en {Elapsed} ms",
                name, Stopwatch.GetElapsedTime(start).TotalMilliseconds);
        }
    }
}

// Enregistrement avec Scrutor :
// services.Decorate(typeof(ICommandHandler<,>), typeof(LoggingCommandHandler<,>));

// Avec MediatR (licence à vérifier) : même idée
public sealed class LoggingBehavior<TRequest, TResponse>(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request,
        RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        logger.LogInformation("Début {Request}", typeof(TRequest).Name);
        var response = await next();
        logger.LogInformation("Fin {Request}", typeof(TRequest).Name);
        return response;
    }
}`,
      explain: "Le message de log utilise des placeholders nommés (<code>{Command}</code>), pas l'interpolation : c'est ce qui rend les logs structurés et indexables."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Command ou query ?",
      prompt: `<p>Classe chaque opération en command ou query, et corrige celles qui mélangent les deux :</p>
<ol><li>Lister les commandes d'un client</li><li>Annuler une commande</li><li>Récupérer un produit et incrémenter son compteur de vues</li><li>Créer un client et renvoyer le client complet avec ses commandes</li><li>Calculer le total d'un panier sans le sauvegarder</li></ol>`,
      hint: "<p>La question : est-ce que l'état persistant change ? Un calcul sans effet de bord est une query.</p>",
      solution: `// 1. Query  : GetCustomerOrdersQuery(Guid CustomerId) -> IReadOnlyList<OrderSummaryDto>
// 2. Command: CancelOrderCommand(Guid OrderId)         -> Result
// 3. Mélange ! Séparer en :
//      GetProductQuery(Guid Id) -> ProductDto
//      RecordProductViewCommand(Guid Id)  (souvent asynchrone, via un événement ou une file)
// 4. Mélange côté retour : la commande renvoie seulement l'Id créé
//      CreateCustomerCommand(...) -> Guid
//    puis le client appelle GetCustomerQuery(id) s'il a besoin du détail.
// 5. Query  : ComputeCartTotalQuery(lines) -> decimal (aucun effet de bord)`
    },
    {
      level: "moyen",
      title: "Enregistrer tous les handlers automatiquement",
      prompt: `<p>Écris la méthode <code>AddApplication(this IServiceCollection services)</code> qui scanne l'assembly Application et enregistre en <code>Scoped</code> chaque classe implémentant <code>ICommandHandler&lt;,&gt;</code> ou <code>IQueryHandler&lt;,&gt;</code>, sans bibliothèque externe.</p>`,
      hint: "<p><code>typeof(X).Assembly.GetTypes()</code>, filtre sur <code>!IsAbstract</code>, puis <code>GetInterfaces()</code> avec <code>IsGenericType</code> et <code>GetGenericTypeDefinition()</code>.</p>",
      solution: `public static class DependencyInjection
{
    private static readonly Type[] HandlerInterfaces =
        [typeof(ICommandHandler<,>), typeof(IQueryHandler<,>)];

    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var types = typeof(DependencyInjection).Assembly.GetTypes()
            .Where(t => t is { IsClass: true, IsAbstract: false, IsGenericTypeDefinition: false });

        foreach (var type in types)
        {
            var handlerInterfaces = type.GetInterfaces()
                .Where(i => i.IsGenericType &&
                            HandlerInterfaces.Contains(i.GetGenericTypeDefinition()));

            foreach (var service in handlerInterfaces)
                services.AddScoped(service, type);
        }
        return services;
    }
}
// IsGenericTypeDefinition: false exclut les décorateurs génériques ouverts
// (LoggingCommandHandler<,>) qui ne doivent pas être enregistrés comme handlers.
// Note : les handlers de query placés dans Infrastructure doivent être scannés
// par AddInfrastructure avec le même code.`
    },
    {
      level: "difficile",
      title: "Decorator de validation",
      prompt: `<p>Écris un décorateur <code>ValidationCommandHandler&lt;TCommand, TResult&gt;</code> qui récupère tous les <code>IValidator&lt;TCommand&gt;</code> (FluentValidation) depuis la DI, les exécute, et lance une <code>ValidationException</code> regroupant toutes les erreurs avant d'appeler le handler. Écris aussi un validator pour <code>PlaceOrderCommand</code> (au moins une ligne, quantité entre 1 et 100).</p>`,
      hint: "<p>Injecte <code>IEnumerable&lt;IValidator&lt;TCommand&gt;&gt;</code> : s'il est vide, appelle directement le handler. <code>ValidateAsync</code> renvoie un <code>ValidationResult</code> avec <code>Errors</code>.</p>",
      solution: `using FluentValidation;

internal sealed class ValidationCommandHandler<TCommand, TResult>(
    ICommandHandler<TCommand, TResult> inner,
    IEnumerable<IValidator<TCommand>> validators)
    : ICommandHandler<TCommand, TResult> where TCommand : ICommand<TResult>
{
    public async Task<TResult> Handle(TCommand command, CancellationToken ct)
    {
        if (!validators.Any())
            return await inner.Handle(command, ct);

        var context = new ValidationContext<TCommand>(command);
        var results = await Task.WhenAll(validators.Select(v => v.ValidateAsync(context, ct)));
        var failures = results.SelectMany(r => r.Errors).ToList();

        if (failures.Count > 0)
            throw new ValidationException(failures);

        return await inner.Handle(command, ct);
    }
}

public sealed class PlaceOrderCommandValidator : AbstractValidator<PlaceOrderCommand>
{
    public PlaceOrderCommandValidator()
    {
        RuleFor(c => c.CustomerId).NotEmpty();
        RuleFor(c => c.Lines).NotEmpty().WithMessage("La commande doit contenir au moins une ligne.");
        RuleForEach(c => c.Lines).ChildRules(line =>
        {
            line.RuleFor(l => l.ProductId).NotEmpty();
            line.RuleFor(l => l.Quantity).InclusiveBetween(1, 100);
        });
    }
}

// Enregistrement :
// services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
// services.Decorate(typeof(ICommandHandler<,>), typeof(ValidationCommandHandler<,>));
// Ordre : le dernier Decorate enveloppe les précédents (logging -> validation -> handler).`
    }
  ],
  project: `<p><strong>OrderFlow — CQRS.</strong> Transforme chaque endpoint en command ou query : <code>PlaceOrder</code>, <code>CancelOrder</code>, <code>GetOrderById</code>, <code>GetCustomerOrders</code> (paginée). Choisis entre MediatR et le dispatcher maison et note ta justification dans le README (licence, besoins). Ajoute les décorateurs de logging et de validation. Critère de fin : aucun endpoint ne touche le DbContext directement.</p>`,
  resources: [
    { label: "CQRS et DDD dans un microservice (Microsoft)", url: "https://learn.microsoft.com/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/" },
    { label: "Implémenter les lectures CQRS", url: "https://learn.microsoft.com/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/cqrs-microservice-reads" },
    { label: "MediatR (dépôt et licence)", url: "https://github.com/jbogard/MediatR" }
  ]
});

// ───────────────────────── Jour 17 ─────────────────────────
window.COURSE.push({
  day: 17, week: 3,
  title: "Tests unitaires : xUnit, NSubstitute, Shouldly",
  summary: "Écrire des tests rapides, lisibles et utiles pour le domaine et les handlers.",
  objectives: [
    "Structurer un test avec Arrange / Act / Assert et bien le nommer",
    "Utiliser Fact, Theory, fixtures et doubles de test",
    "Savoir quoi tester (comportement) et quoi ne pas tester (implémentation)"
  ],
  lesson: `<h3>L'écosystème de test .NET</h3>
<ul>
<li><strong>xUnit</strong> : le framework le plus utilisé (aussi NUnit et MSTest). La v3 est la version actuelle ; <code>dotnet new xunit</code> crée un projet prêt à l'emploi. On lance les tests avec <code>dotnet test</code>.</li>
<li><strong>Doubles de test</strong> : NSubstitute (syntaxe concise) ou Moq. Note : Moq a connu en 2023 une polémique (collecte d'e-mails via SponsorLink, retirée depuis) ; beaucoup d'équipes ont migré vers NSubstitute.</li>
<li><strong>Assertions</strong> : <strong>FluentAssertions est passé sous licence commerciale à partir de la v8</strong> (la v7 reste sous Apache 2.0). Alternatives gratuites : <strong>Shouldly</strong> (<code>total.ShouldBe(42m)</code>) ou simplement les asserts xUnit (<code>Assert.Equal</code>). Vérifie la version utilisée chez ton client.</li>
</ul>
<h3>Anatomie d'un bon test</h3>
<p>Un test se lit en trois blocs : <strong>Arrange</strong> (préparer), <strong>Act</strong> (une seule action), <strong>Assert</strong> (vérifier le résultat). Nomme-le d'après le comportement : <code>AddLine_quand_commande_annulee_lance_exception</code> ou <code>Method_Scenario_ExpectedResult</code>. Un test qui échoue doit dire ce qui est cassé sans ouvrir le code.</p>
<h3>Fact et Theory</h3>
<p><code>[Fact]</code> est un test sans paramètre. <code>[Theory]</code> avec <code>[InlineData]</code>, <code>[MemberData]</code> ou <code>[ClassData]</code> exécute le même test sur plusieurs jeux de données, parfait pour les règles métier (seuils, bornes).</p>
<h3>Cycle de vie et fixtures</h3>
<p>xUnit crée <strong>une nouvelle instance de la classe de test pour chaque test</strong>. Le constructeur sert donc de « setup », et <code>IDisposable</code> / <code>IAsyncLifetime</code> de « teardown ». Pour partager un objet coûteux (base de données, serveur) entre les tests d'une classe : <code>IClassFixture&lt;T&gt;</code> ; entre plusieurs classes : <code>ICollectionFixture&lt;T&gt;</code>.</p>
<h3>Quoi tester ?</h3>
<ul>
<li><strong>Le domaine en priorité</strong> : invariants, calculs, transitions d'état. Aucun mock nécessaire, ce sont les tests les plus rentables.</li>
<li><strong>Les handlers</strong> : avec des doubles pour les dépendances externes (repository, e-mail, horloge).</li>
<li><strong>Pas les getters/setters, pas EF Core</strong> : tester qu'EF sauvegarde est le rôle des tests d'intégration (jour 18).</li>
</ul>
<h3>Le temps, ennemi des tests</h3>
<p>Un code qui appelle <code>DateTime.UtcNow</code> n'est pas testable de façon déterministe. Injecte <code>TimeProvider</code> ; en test, utilise <code>FakeTimeProvider</code> (paquet <code>Microsoft.Extensions.TimeProvider.Testing</code>) et avance le temps avec <code>Advance(...)</code>.</p>
<h3>Pièges courants</h3>
<ul>
<li><strong>Sur-mocker</strong> : vérifier que <code>Add</code> a été appelé exactement une fois avec tel argument teste l'implémentation, pas le comportement. Au moindre refactor, tout casse.</li>
<li><strong>Mocker ce qu'on ne possède pas</strong> (<code>DbContext</code>, <code>HttpClient</code>) : utilise un vrai substitut (base réelle, <code>HttpMessageHandler</code> factice).</li>
<li><strong>Plusieurs Act dans un test</strong> : découpe.</li>
<li><strong>Tests dépendants de l'ordre</strong> ou d'un état statique partagé.</li>
<li><code>async void</code> dans un test : xUnit ne l'attend pas ; utilise <code>async Task</code>.</li>
</ul>
<div class="note"><strong>Niveau senior</strong> : la couverture de code est un indicateur, pas un objectif. 100 % de couverture avec des tests qui vérifient des mocks ne protège de rien. Ce qui compte : des tests qui échouent quand le comportement casse et qui passent quand on refactore. Si un refactor sans changement de comportement casse 30 tests, ce sont les tests qui sont mal écrits. Sache aussi parler de la pyramide (beaucoup d'unitaires, des intégrations ciblées, peu d'E2E) et de son évolution récente vers le « trophée » qui valorise davantage les tests d'intégration.</div>`,
  examples: [
    {
      title: "Tester le domaine : Fact et Theory",
      code: `using Shouldly;
using OrderFlow.Domain.Orders;

public class OrderTests
{
    private static readonly DateTimeOffset Now = new(2026, 11, 4, 10, 0, 0, TimeSpan.Zero);

    [Fact]
    public void AddLine_ajoute_la_ligne_et_met_a_jour_le_total()
    {
        // Arrange
        var order = Order.Create(Guid.NewGuid(), Now);

        // Act
        order.AddLine(Guid.NewGuid(), unitPrice: 12.50m, quantity: 4);

        // Assert
        order.Lines.Count.ShouldBe(1);
        order.Total.ShouldBe(50m);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-3)]
    [InlineData(101)]
    public void AddLine_avec_quantite_invalide_lance_exception(int quantity)
    {
        var order = Order.Create(Guid.NewGuid(), Now);

        Should.Throw<ArgumentOutOfRangeException>(
            () => order.AddLine(Guid.NewGuid(), 10m, quantity));
    }

    [Fact]
    public void Cancel_sur_commande_expediee_est_refuse()
    {
        var order = Order.Create(Guid.NewGuid(), Now);
        order.AddLine(Guid.NewGuid(), 10m, 1);
        order.Ship();

        // version sans Shouldly, avec les asserts xUnit
        Assert.Throws<InvalidOperationException>(() => order.Cancel());
        Assert.Equal(OrderStatus.Shipped, order.Status);
    }
}`,
      explain: "Aucun mock : le domaine est du C# pur. Ces tests tournent en millisecondes."
    },
    {
      title: "Tester un handler avec NSubstitute et FakeTimeProvider",
      code: `using NSubstitute;
using Microsoft.Extensions.Time.Testing;
using Shouldly;

public class PlaceOrderHandlerTests
{
    private readonly IOrderRepository _orders = Substitute.For<IOrderRepository>();
    private readonly IProductRepository _products = Substitute.For<IProductRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();
    private readonly FakeTimeProvider _clock = new(new DateTimeOffset(2026, 11, 4, 9, 0, 0, TimeSpan.Zero));

    private PlaceOrderHandler CreateSut() => new(_orders, _products, _uow, _clock);

    [Fact]
    public async Task Handle_cree_et_sauvegarde_la_commande()
    {
        var product = Product.Create("Clavier", 49.90m);
        _products.GetByIdAsync(product.Id, Arg.Any<CancellationToken>()).Returns(product);
        Order? saved = null;
        _orders.Add(Arg.Do<Order>(o => saved = o));

        var cmd = new PlaceOrderCommand(Guid.NewGuid(), [new PlaceOrderLine(product.Id, 2)]);

        var id = await CreateSut().Handle(cmd, CancellationToken.None);

        saved.ShouldNotBeNull();
        saved.Id.ShouldBe(id);
        saved.Total.ShouldBe(99.80m);
        saved.CreatedAt.ShouldBe(_clock.GetUtcNow());
        await _uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}`,
      explain: "On vérifie l'état de la commande produite (comportement) et un seul appel d'interaction significatif : la sauvegarde. <code>Arg.Do</code> capture l'argument passé."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Theory sur le calcul de remise",
      prompt: `<p>La règle métier : remise de 0 % sous 100 €, 5 % de 100 € à 499,99 €, 10 % à partir de 500 €. Écris la méthode statique <code>Discount.RateFor(decimal subtotal)</code> et un <code>[Theory]</code> qui teste les bornes.</p>`,
      hint: "<p>Les bugs se cachent aux bornes : teste 99.99, 100, 499.99 et 500. <code>[InlineData]</code> n'accepte pas <code>decimal</code> directement : passe des <code>double</code> ou des <code>string</code> et convertis.</p>",
      solution: `public static class Discount
{
    public static decimal RateFor(decimal subtotal) => subtotal switch
    {
        < 0m => throw new ArgumentOutOfRangeException(nameof(subtotal)),
        < 100m => 0m,
        < 500m => 0.05m,
        _ => 0.10m
    };
}

public class DiscountTests
{
    [Theory]
    [InlineData("0", "0")]
    [InlineData("99.99", "0")]
    [InlineData("100", "0.05")]
    [InlineData("499.99", "0.05")]
    [InlineData("500", "0.10")]
    [InlineData("10000", "0.10")]
    public void RateFor_respecte_les_paliers(string subtotal, string expected)
    {
        var rate = Discount.RateFor(decimal.Parse(subtotal, CultureInfo.InvariantCulture));

        Assert.Equal(decimal.Parse(expected, CultureInfo.InvariantCulture), rate);
    }

    [Fact]
    public void RateFor_refuse_un_montant_negatif() =>
        Assert.Throws<ArgumentOutOfRangeException>(() => Discount.RateFor(-1m));
}`
    },
    {
      level: "moyen",
      title: "Tester une règle dépendante du temps",
      prompt: `<p>Ajoute à <code>Order</code> une méthode <code>CanBeCancelled(TimeProvider clock)</code> : une commande peut être annulée seulement si elle est <code>Pending</code> et créée il y a moins de 24 h. Écris trois tests avec <code>FakeTimeProvider</code> : 23 h 59 après (vrai), 24 h après (faux), commande expédiée (faux).</p>`,
      hint: "<p><code>var clock = new FakeTimeProvider(start); clock.Advance(TimeSpan.FromHours(24));</code></p>",
      solution: `// Domain
public bool CanBeCancelled(TimeProvider clock) =>
    Status == OrderStatus.Pending &&
    clock.GetUtcNow() - CreatedAt < TimeSpan.FromHours(24);

// Tests
public class OrderCancellationTests
{
    private static readonly DateTimeOffset Start = new(2026, 11, 4, 8, 0, 0, TimeSpan.Zero);

    private static Order NewOrder()
    {
        var order = Order.Create(Guid.NewGuid(), Start);
        order.AddLine(Guid.NewGuid(), 10m, 1);
        return order;
    }

    [Fact]
    public void Annulable_juste_avant_24h()
    {
        var clock = new FakeTimeProvider(Start);
        clock.Advance(TimeSpan.FromHours(24) - TimeSpan.FromMinutes(1));

        Assert.True(NewOrder().CanBeCancelled(clock));
    }

    [Fact]
    public void Non_annulable_a_24h_pile()
    {
        var clock = new FakeTimeProvider(Start);
        clock.Advance(TimeSpan.FromHours(24));

        Assert.False(NewOrder().CanBeCancelled(clock));
    }

    [Fact]
    public void Non_annulable_si_expediee()
    {
        var clock = new FakeTimeProvider(Start);
        var order = NewOrder();
        order.Ship();

        Assert.False(order.CanBeCancelled(clock));
    }
}`
    },
    {
      level: "difficile",
      title: "Réécrire un test fragile",
      prompt: `<p>Ce test casse à chaque refactor. Explique pourquoi et réécris-le pour qu'il teste le comportement :</p>
<pre>[Fact]
public async Task Test1()
{
    var repo = new Mock&lt;IOrderRepository&gt;();
    var uow = new Mock&lt;IUnitOfWork&gt;();
    var order = Order.Create(Guid.NewGuid(), DateTimeOffset.UtcNow);
    repo.Setup(r =&gt; r.GetByIdAsync(order.Id, It.IsAny&lt;CancellationToken&gt;())).ReturnsAsync(order);
    var sut = new CancelOrderHandler(repo.Object, uow.Object);
    await sut.Handle(new CancelOrderCommand(order.Id), default);
    repo.Verify(r =&gt; r.GetByIdAsync(order.Id, It.IsAny&lt;CancellationToken&gt;()), Times.Once);
    repo.VerifyNoOtherCalls();
    uow.Verify(u =&gt; u.SaveChangesAsync(It.IsAny&lt;CancellationToken&gt;()), Times.Once);
}</pre>`,
      hint: "<p>Que vérifie vraiment ce test ? Il ne regarde jamais l'état de la commande. Il utilise aussi l'heure réelle et a un nom qui ne dit rien.</p>",
      solution: `// Problèmes :
// - Nom "Test1" : n'indique pas le comportement attendu.
// - Il vérifie les appels (GetByIdAsync une fois, VerifyNoOtherCalls) : si le handler
//   ajoute un appel légitime (ex. vérification d'existence), le test casse alors
//   que le comportement est correct.
// - Il ne vérifie PAS l'essentiel : que la commande est bien annulée.
// - DateTimeOffset.UtcNow : non déterministe.
// - Aucun test du cas d'erreur (commande introuvable).

public class CancelOrderHandlerTests
{
    private static readonly DateTimeOffset Now = new(2026, 11, 4, 10, 0, 0, TimeSpan.Zero);
    private readonly IOrderRepository _orders = Substitute.For<IOrderRepository>();
    private readonly IUnitOfWork _uow = Substitute.For<IUnitOfWork>();

    [Fact]
    public async Task Handle_annule_une_commande_en_attente_et_sauvegarde()
    {
        var order = Order.Create(Guid.NewGuid(), Now);
        order.AddLine(Guid.NewGuid(), 10m, 1);
        _orders.GetByIdAsync(order.Id, Arg.Any<CancellationToken>()).Returns(order);

        await new CancelOrderHandler(_orders, _uow).Handle(new CancelOrderCommand(order.Id), default);

        order.Status.ShouldBe(OrderStatus.Cancelled);
        await _uow.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_commande_introuvable_ne_sauvegarde_rien()
    {
        _orders.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Order?)null);

        await Should.ThrowAsync<InvalidOperationException>(() =>
            new CancelOrderHandler(_orders, _uow).Handle(new CancelOrderCommand(Guid.NewGuid()), default));

        await _uow.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}`
    }
  ],
  project: `<p><strong>OrderFlow — tests unitaires.</strong> Crée <code>OrderFlow.Domain.Tests</code> et <code>OrderFlow.Application.Tests</code>. Couvre : création de commande, ajout de ligne (bornes de quantité), calcul du total, transitions <code>Pending → Paid → Shipped</code> et <code>Cancelled</code> interdites, et les handlers <code>PlaceOrder</code> / <code>CancelOrder</code>. Remplace tout <code>DateTime.UtcNow</code> par <code>TimeProvider</code>. Objectif : au moins 20 tests, tous sous la seconde avec <code>dotnet test</code>.</p>`,
  resources: [
    { label: "Tests unitaires avec dotnet test et xUnit", url: "https://learn.microsoft.com/dotnet/core/testing/unit-testing-with-dotnet-test" },
    { label: "Bonnes pratiques des tests unitaires (.NET)", url: "https://learn.microsoft.com/dotnet/core/testing/unit-testing-best-practices" },
    { label: "Documentation NSubstitute", url: "https://nsubstitute.github.io/" }
  ]
});

// ───────────────────────── Jour 18 ─────────────────────────
window.COURSE.push({
  day: 18, week: 3,
  title: "Tests d'intégration : WebApplicationFactory et Testcontainers",
  summary: "Tester l'API de bout en bout en mémoire, contre une vraie base PostgreSQL dans Docker.",
  objectives: [
    "Démarrer l'API en mémoire avec WebApplicationFactory",
    "Lancer une vraie base de données jetable avec Testcontainers",
    "Gérer l'authentification, l'isolation des données et la vitesse des tests"
  ],
  lesson: `<h3>Pourquoi des tests d'intégration ?</h3>
<p>Les tests unitaires ne voient pas : la traduction LINQ vers SQL, les migrations, la configuration DI, le routing, la sérialisation JSON, l'authentification. Un test d'intégration envoie une vraie requête HTTP à ton API et vérifie la réponse et la base. C'est souvent le test qui attrape le plus de vrais bugs par ligne écrite.</p>
<h3>WebApplicationFactory</h3>
<p>Le paquet <code>Microsoft.AspNetCore.Mvc.Testing</code> fournit <code>WebApplicationFactory&lt;TEntryPoint&gt;</code>. Il démarre ton <code>Program.cs</code> réel avec un serveur en mémoire (<code>TestServer</code>) : pas de port, pas de réseau. <code>factory.CreateClient()</code> renvoie un <code>HttpClient</code> branché dessus.</p>
<p>Avec les top-level statements, la classe <code>Program</code> est générée en <code>internal</code>. Ajoute <code>public partial class Program;</code> à la fin de <code>Program.cs</code> pour que le projet de test puisse l'utiliser.</p>
<p>On surcharge <code>ConfigureWebHost</code> pour remplacer des services : <code>builder.ConfigureTestServices(services =&gt; ...)</code> s'exécute <strong>après</strong> l'enregistrement de l'application, donc tes remplacements gagnent.</p>
<h3>Pourquoi pas la base en mémoire ?</h3>
<p>Le provider <code>UseInMemoryDatabase</code> d'EF Core n'est pas une base relationnelle : pas de transactions réelles, pas de contraintes, pas de SQL. Microsoft lui-même déconseille de l'utiliser pour tester. SQLite en mémoire est mieux, mais diffère encore de PostgreSQL ou SQL Server. La solution moderne : <strong>Testcontainers</strong>.</p>
<h3>Testcontainers</h3>
<p><code>Testcontainers.PostgreSql</code> (ou <code>.MsSql</code>) démarre un conteneur Docker au début des tests et le détruit à la fin. Il faut Docker sur la machine (Docker Desktop) et sur la CI (disponible sur les runners Linux de GitHub Actions). On combine avec <code>IAsyncLifetime</code> : <code>InitializeAsync</code> démarre le conteneur, <code>DisposeAsync</code> l'arrête.</p>
<h3>Isoler les données entre tests</h3>
<ul>
<li><strong>Un conteneur par classe de tests</strong> (<code>IClassFixture</code>) ou partagé via <code>ICollectionFixture</code> : démarrer PostgreSQL prend quelques secondes, ne le fais pas par test.</li>
<li><strong>Nettoyer entre les tests</strong> : la bibliothèque <strong>Respawn</strong> vide les tables intelligemment (ordre des clés étrangères) en quelques millisecondes.</li>
<li>Ou utiliser des données uniques par test (identifiants générés), et ne jamais dépendre du nombre total de lignes.</li>
</ul>
<h3>L'authentification en test</h3>
<p>Ton API exige un JWT. Deux options : générer un vrai token signé avec une clé de test, ou enregistrer un <code>AuthenticationHandler</code> de test qui authentifie toujours un utilisateur fictif. La seconde est plus simple et teste quand même tes policies d'autorisation.</p>
<h3>Pièges courants</h3>
<ul>
<li>Oublier d'appliquer les migrations sur la base du conteneur : appelle <code>db.Database.MigrateAsync()</code> au démarrage de la fixture.</li>
<li>Tests parallèles qui partagent la même base sans nettoyage : résultats aléatoires. xUnit exécute les <em>collections</em> en parallèle, pas les tests d'une même classe.</li>
<li>Remplacer trop de services : si tu mockes la base, l'horloge et le repository, ce n'est plus un test d'intégration.</li>
<li>Vérifier uniquement le code HTTP : vérifie aussi le corps et l'état en base.</li>
<li>Oublier Docker en CI : sur GitHub Actions, utilise un runner <code>ubuntu-latest</code> (Docker préinstallé) ; les runners Windows ne lancent pas de conteneurs Linux.</li>
</ul>
<div class="note"><strong>Niveau senior</strong> : un senior pense à la durée de la suite. Partage les conteneurs, réutilise la factory, nettoie avec Respawn plutôt que de recréer la base, et sépare les tests lents dans un projet dédié lancé en CI. Une suite d'intégration de 40 secondes est acceptable ; 10 minutes, personne ne la lance en local, et elle perd sa valeur.</div>`,
  examples: [
    {
      title: "Factory avec PostgreSQL Testcontainers",
      code: `using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;

public sealed class OrderFlowApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .Build();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureTestServices(services =>
        {
            // remplace le DbContext configuré par l'application
            services.RemoveAll<DbContextOptions<OrderFlowDbContext>>();
            services.AddDbContext<OrderFlowDbContext>(o => o.UseNpgsql(_db.GetConnectionString()));
        });
    }

    public async ValueTask InitializeAsync()
    {
        await _db.StartAsync();
        using var scope = Services.CreateScope();
        var ctx = scope.ServiceProvider.GetRequiredService<OrderFlowDbContext>();
        await ctx.Database.MigrateAsync();
    }

    public override async ValueTask DisposeAsync()
    {
        await _db.DisposeAsync();
        await base.DisposeAsync();
    }
}
// Avec xUnit v3, IAsyncLifetime utilise ValueTask ; en xUnit v2 c'était Task.
// Program.cs doit se terminer par : public partial class Program;`,
      explain: "Le conteneur démarre une fois pour toute la classe de test. <code>RemoveAll</code> vient de <code>Microsoft.Extensions.DependencyInjection.Extensions</code>."
    },
    {
      title: "Un test d'intégration complet",
      code: `using System.Net;
using System.Net.Http.Json;
using Shouldly;

public class OrdersEndpointsTests(OrderFlowApiFactory factory) : IClassFixture<OrderFlowApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Post_order_puis_get_renvoie_la_commande()
    {
        var productId = await SeedProductAsync("Écran 27 pouces", 229m);

        var post = await _client.PostAsJsonAsync("/orders", new
        {
            customerId = Guid.NewGuid(),
            lines = new[] { new { productId, quantity = 2 } }
        });

        post.StatusCode.ShouldBe(HttpStatusCode.Created);
        var location = post.Headers.Location!;

        var dto = await _client.GetFromJsonAsync<OrderDto>(location);
        dto.ShouldNotBeNull();
        dto.Total.ShouldBe(458m);
        dto.Status.ShouldBe("Pending");
    }

    [Fact]
    public async Task Post_order_vide_renvoie_400_problem_details()
    {
        var post = await _client.PostAsJsonAsync("/orders", new { customerId = Guid.NewGuid(), lines = Array.Empty<object>() });

        post.StatusCode.ShouldBe(HttpStatusCode.BadRequest);
        post.Content.Headers.ContentType!.MediaType.ShouldBe("application/problem+json");
    }

    private async Task<Guid> SeedProductAsync(string name, decimal price)
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OrderFlowDbContext>();
        var product = Product.Create(name, price);
        db.Products.Add(product);
        await db.SaveChangesAsync();
        return product.Id;
    }
}`,
      explain: "Le test traverse tout : routing, validation, handler, EF Core, PostgreSQL réel, sérialisation. Les données sont propres à chaque test (Guid unique)."
    },
    {
      title: "Handler d'authentification de test",
      code: `using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

public sealed class TestAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder) : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    public const string Scheme = "Test";

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // en-tête optionnel pour simuler des rôles différents
        var role = Request.Headers["X-Test-Role"].FirstOrDefault() ?? "Customer";
        Claim[] claims =
        [
            new(ClaimTypes.NameIdentifier, "11111111-1111-1111-1111-111111111111"),
            new(ClaimTypes.Role, role)
        ];
        var principal = new ClaimsPrincipal(new ClaimsIdentity(claims, Scheme));
        return Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal, Scheme)));
    }
}

// Dans ConfigureTestServices :
// services.AddAuthentication(TestAuthHandler.Scheme)
//         .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.Scheme, _ => { });`,
      explain: "Les policies d'autorisation (<code>RequireRole(\"Admin\")</code>) restent testées : seule la vérification du token est court-circuitée."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Premier test avec WebApplicationFactory",
      prompt: `<p>Ajoute un endpoint <code>/health</code> (<code>app.MapHealthChecks("/health")</code>) et écris un test qui vérifie qu'il renvoie 200 avec le corps <code>Healthy</code>, en utilisant <code>WebApplicationFactory&lt;Program&gt;</code> sans Testcontainers.</p>`,
      hint: "<p>N'oublie pas <code>public partial class Program;</code> et la référence au paquet <code>Microsoft.AspNetCore.Mvc.Testing</code>.</p>",
      solution: `// Program.cs
builder.Services.AddHealthChecks();
// ...
app.MapHealthChecks("/health");
app.Run();

public partial class Program;

// Test
using Microsoft.AspNetCore.Mvc.Testing;

public class HealthTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Health_renvoie_Healthy()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/health");

        response.EnsureSuccessStatusCode();
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync());
    }
}`
    },
    {
      level: "moyen",
      title: "Tester l'autorisation par rôle",
      prompt: `<p>L'endpoint <code>POST /orders/{id}/ship</code> exige le rôle <code>Admin</code>. Avec le <code>TestAuthHandler</code> de l'exemple, écris deux tests : un client reçoit 403, un admin reçoit 204.</p>`,
      hint: "<p>Ajoute l'en-tête <code>X-Test-Role</code> sur la requête avec <code>HttpRequestMessage</code> ou <code>client.DefaultRequestHeaders</code>. Il faut d'abord créer une commande payée.</p>",
      solution: `public class ShipOrderTests(OrderFlowApiFactory factory) : IClassFixture<OrderFlowApiFactory>
{
    private async Task<HttpResponseMessage> ShipAs(string role, Guid orderId)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, $"/orders/{orderId}/ship");
        request.Headers.Add("X-Test-Role", role);
        return await factory.CreateClient().SendAsync(request);
    }

    private async Task<Guid> SeedPaidOrderAsync()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OrderFlowDbContext>();
        var order = Order.Create(Guid.NewGuid(), DateTimeOffset.UtcNow);
        order.AddLine(Guid.NewGuid(), 10m, 1);
        order.MarkAsPaid();
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return order.Id;
    }

    [Fact]
    public async Task Client_ne_peut_pas_expedier()
    {
        var id = await SeedPaidOrderAsync();

        var response = await ShipAs("Customer", id);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Admin_peut_expedier()
    {
        var id = await SeedPaidOrderAsync();

        var response = await ShipAs("Admin", id);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
// Note : la factory doit enregistrer TestAuthHandler dans ConfigureTestServices.`
    },
    {
      level: "difficile",
      title: "Nettoyage avec Respawn et collection partagée",
      prompt: `<p>Transforme <code>OrderFlowApiFactory</code> pour qu'elle soit partagée par <strong>toutes</strong> les classes de tests (une seule base pour la suite) et qu'elle expose <code>ResetDatabaseAsync()</code> basé sur Respawn. Chaque classe de test doit appeler ce nettoyage avant chaque test.</p>`,
      hint: "<p><code>[CollectionDefinition(\"Api\")]</code> + <code>ICollectionFixture&lt;OrderFlowApiFactory&gt;</code>, puis <code>[Collection(\"Api\")]</code> sur les classes. Respawn : <code>Respawner.CreateAsync(connection, new RespawnerOptions { DbAdapter = DbAdapter.Postgres, ... })</code>. Les classes de test peuvent implémenter <code>IAsyncLifetime</code>.</p>",
      solution: `using Npgsql;
using Respawn;

public sealed class OrderFlowApiFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _db = new PostgreSqlBuilder().WithImage("postgres:17-alpine").Build();
    private Respawner _respawner = null!;
    private NpgsqlConnection _connection = null!;

    // ... ConfigureWebHost identique à l'exemple ...

    public async ValueTask InitializeAsync()
    {
        await _db.StartAsync();
        using (var scope = Services.CreateScope())
            await scope.ServiceProvider.GetRequiredService<OrderFlowDbContext>().Database.MigrateAsync();

        _connection = new NpgsqlConnection(_db.GetConnectionString());
        await _connection.OpenAsync();
        _respawner = await Respawner.CreateAsync(_connection, new RespawnerOptions
        {
            DbAdapter = DbAdapter.Postgres,
            SchemasToInclude = ["public"],
            TablesToIgnore = ["__EFMigrationsHistory"]
        });
    }

    public Task ResetDatabaseAsync() => _respawner.ResetAsync(_connection);

    public override async ValueTask DisposeAsync()
    {
        await _connection.DisposeAsync();
        await _db.DisposeAsync();
        await base.DisposeAsync();
    }
}

[CollectionDefinition("Api")]
public sealed class ApiCollection : ICollectionFixture<OrderFlowApiFactory>;

[Collection("Api")]
public class OrdersEndpointsTests(OrderFlowApiFactory factory) : IAsyncLifetime
{
    private readonly HttpClient _client = factory.CreateClient();

    // appelé avant chaque test (xUnit crée une instance par test)
    public async ValueTask InitializeAsync() => await factory.ResetDatabaseAsync();
    public ValueTask DisposeAsync() => ValueTask.CompletedTask;

    [Fact]
    public async Task Liste_vide_au_depart()
    {
        var orders = await _client.GetFromJsonAsync<List<OrderDto>>("/orders");
        Assert.Empty(orders!);
    }
}
// Conséquence : les classes de la collection "Api" s'exécutent en séquence
// (une seule base partagée), ce qui rend Respawn sûr.`
    }
  ],
  project: `<p><strong>OrderFlow — tests d'intégration.</strong> Crée <code>OrderFlow.Api.IntegrationTests</code> avec la factory Testcontainers partagée et Respawn. Couvre : création de commande (201 + Location), lecture (200 / 404), validation (400 ProblemDetails), autorisation (401 sans auth, 403 mauvais rôle), annulation. Vérifie au moins une fois l'état en base. Lance tout avec <code>dotnet test</code> et note la durée totale dans le README.</p>`,
  resources: [
    { label: "Tests d'intégration dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/test/integration-tests" },
    { label: "Choisir une stratégie de test avec EF Core", url: "https://learn.microsoft.com/ef/core/testing/choosing-a-testing-strategy" },
    { label: "Testcontainers pour .NET", url: "https://dotnet.testcontainers.org/" }
  ]
});

// ───────────────────────── Jour 19 ─────────────────────────
window.COURSE.push({
  day: 19, week: 3,
  title: "DDD tactique : agrégats, value objects, domain events",
  summary: "Faire de Order un vrai agrégat qui protège ses règles, avec des value objects et des événements de domaine.",
  objectives: [
    "Modéliser un agrégat avec une racine et des invariants protégés",
    "Créer des value objects immuables avec des records",
    "Publier et traiter des domain events après la sauvegarde"
  ],
  lesson: `<h3>Stratégique et tactique</h3>
<p>Le <strong>Domain-Driven Design</strong> (Eric Evans) a deux volets. Le volet <em>stratégique</em> (bounded contexts, langage omniprésent, context mapping) découpe un système en zones cohérentes. Le volet <em>tactique</em>, l'objet d'aujourd'hui, donne des briques pour coder un domaine riche : entités, value objects, agrégats, domain events, repositories.</p>
<h3>Entité et value object</h3>
<ul>
<li><strong>Entité</strong> : a une identité qui persiste dans le temps. Deux commandes avec les mêmes lignes restent deux commandes différentes. Égalité par <code>Id</code>.</li>
<li><strong>Value object</strong> : défini uniquement par ses valeurs, immuable, sans identité. <code>Money(10, "EUR")</code> égale toujours <code>Money(10, "EUR")</code>. En C#, un <code>record</code> (ou <code>readonly record struct</code>) donne l'égalité par valeur gratuitement.</li>
</ul>
<p>Les value objects éliminent l'<em>obsession des primitifs</em> : au lieu de <code>decimal price</code> qui peut être négatif et sans devise, un <code>Money</code> qui valide à la construction. Une adresse e-mail invalide ne peut plus exister dans le système.</p>
<h3>L'agrégat</h3>
<p>Un agrégat est un groupe d'objets traités comme une unité de cohérence. <code>Order</code> est la <strong>racine</strong> ; <code>OrderLine</code> en fait partie. Règles :</p>
<ul>
<li>On ne modifie l'agrégat <strong>que par sa racine</strong> : <code>order.AddLine(...)</code>, jamais <code>order.Lines.Add(...)</code>. La collection est exposée en <code>IReadOnlyCollection</code>.</li>
<li>Les invariants sont vérifiés dans la racine : quantité positive, pas d'ajout sur une commande expédiée, transitions de statut valides.</li>
<li>Les setters sont <code>private</code>. La création passe par une méthode de fabrique (<code>Order.Create</code>) qui garantit un état valide.</li>
<li>Un agrégat en référence un autre <strong>par son identifiant</strong> (<code>CustomerId</code>), pas par une navigation vers l'objet <code>Customer</code>.</li>
<li>Une transaction modifie <strong>un seul agrégat</strong>. Les effets sur les autres passent par des événements.</li>
</ul>
<h3>Domain events</h3>
<p>Un événement de domaine décrit un fait passé : <code>OrderPlaced</code>, <code>OrderCancelled</code>. L'agrégat l'enregistre dans une liste interne ; après <code>SaveChanges</code>, l'infrastructure les publie à des handlers (envoyer l'e-mail, réserver le stock). Le domaine ne connaît ni SMTP ni la file de messages.</p>
<p>Deux moments de publication possibles : <strong>avant</strong> le commit (même transaction, cohérence forte, mais un handler lent bloque) ou <strong>après</strong> (plus simple, mais si le process meurt entre les deux, l'événement est perdu). Pour une fiabilité totale, on utilise le pattern <strong>Outbox</strong> : l'événement est écrit dans une table de la même transaction, puis un worker le publie (semaine 4).</p>
<h3>EF Core et le domaine riche</h3>
<p>EF Core sait mapper ce modèle : champs privés (<code>HasField</code> / <code>UsePropertyAccessMode</code>), constructeurs privés sans paramètres, value objects via <strong>complex types</strong> (<code>ComplexProperty</code>, depuis EF Core 8) ou <code>OwnsOne</code>, et conversions de valeur pour les identifiants typés.</p>
<h3>Pièges courants</h3>
<ul>
<li><strong>Agrégats trop gros</strong> : un <code>Customer</code> qui contient toutes ses commandes charge des milliers de lignes et crée des conflits de concurrence. Garde-les petits.</li>
<li><strong>Collection publique mutable</strong> : <code>public List&lt;OrderLine&gt; Lines { get; set; }</code> contourne tous les invariants.</li>
<li><strong>Value object mutable</strong> : un record avec <code>set</code> perd tout son intérêt.</li>
<li><strong>DDD partout</strong> : pour une table de référentiel (pays, devises), un CRUD simple suffit.</li>
</ul>
<div class="note"><strong>Niveau senior</strong> : la question à se poser pour délimiter un agrégat est « quelles règles doivent être vraies immédiatement, dans la même transaction ? ». Ce qui peut être cohérent quelques secondes plus tard (stock, points de fidélité) sort de l'agrégat et passe par des événements : c'est la cohérence à terme (<em>eventual consistency</em>). Savoir argumenter cette frontière avec le métier vaut plus que connaître les patterns par cœur.</div>`,
  examples: [
    {
      title: "Value objects avec des records",
      code: `namespace OrderFlow.Domain.Common;

public sealed record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        ArgumentOutOfRangeException.ThrowIfNegative(amount);
        ArgumentException.ThrowIfNullOrWhiteSpace(currency);
        if (currency.Length != 3) throw new ArgumentException("Code ISO 4217 attendu", nameof(currency));
        Amount = decimal.Round(amount, 2);
        Currency = currency.ToUpperInvariant();
    }

    public static Money Zero(string currency) => new(0m, currency);

    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency) throw new InvalidOperationException("Devises différentes");
        return new Money(a.Amount + b.Amount, a.Currency);
    }

    public Money Times(int quantity) => new(Amount * quantity, Currency);

    public override string ToString() => $"{Amount:0.00} {Currency}";
}

// Identifiant typé : impossible de passer un ProductId à la place d'un OrderId
public readonly record struct OrderId(Guid Value)
{
    public static OrderId New() => new(Guid.CreateVersion7());
}`,
      explain: "<code>new Money(10, \"eur\") == new Money(10m, \"EUR\")</code> vaut <code>true</code>. <code>Guid.CreateVersion7()</code> (.NET 9+) génère des GUID triables par date, meilleurs pour les index."
    },
    {
      title: "L'agrégat Order",
      code: `namespace OrderFlow.Domain.Orders;

public sealed class Order : AggregateRoot
{
    private readonly List<OrderLine> _lines = [];

    public OrderId Id { get; private set; }
    public Guid CustomerId { get; private set; }
    public OrderStatus Status { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public IReadOnlyCollection<OrderLine> Lines => _lines.AsReadOnly();

    public Money Total => _lines.Aggregate(Money.Zero("EUR"), (sum, l) => sum + l.LineTotal);

    private Order() { } // pour EF Core

    public static Order Create(Guid customerId, DateTimeOffset now) => new()
    {
        Id = OrderId.New(),
        CustomerId = customerId,
        Status = OrderStatus.Pending,
        CreatedAt = now
    };

    public void AddLine(Guid productId, Money unitPrice, int quantity)
    {
        EnsureStatus(OrderStatus.Pending, "Impossible de modifier une commande validée");
        ArgumentOutOfRangeException.ThrowIfLessThan(quantity, 1);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(quantity, 100);

        var existing = _lines.FirstOrDefault(l => l.ProductId == productId);
        if (existing is not null) existing.Increase(quantity);
        else _lines.Add(new OrderLine(productId, unitPrice, quantity));
    }

    public void Place()
    {
        EnsureStatus(OrderStatus.Pending, "Commande déjà passée");
        if (_lines.Count == 0) throw new InvalidOperationException("Commande vide");
        Status = OrderStatus.Placed;
        Raise(new OrderPlaced(Id, CustomerId, Total));
    }

    public void Cancel()
    {
        if (Status is OrderStatus.Shipped or OrderStatus.Cancelled)
            throw new InvalidOperationException($"Annulation impossible au statut {Status}");
        Status = OrderStatus.Cancelled;
        Raise(new OrderCancelled(Id));
    }

    private void EnsureStatus(OrderStatus expected, string message)
    {
        if (Status != expected) throw new InvalidOperationException(message);
    }
}

public sealed class OrderLine
{
    public Guid ProductId { get; private set; }
    public Money UnitPrice { get; private set; } = null!;
    public int Quantity { get; private set; }
    public Money LineTotal => UnitPrice.Times(Quantity);

    private OrderLine() { }
    internal OrderLine(Guid productId, Money unitPrice, int quantity) =>
        (ProductId, UnitPrice, Quantity) = (productId, unitPrice, quantity);

    internal void Increase(int quantity) => Quantity += quantity;
}`,
      explain: "Le constructeur d'<code>OrderLine</code> est <code>internal</code> : seul l'agrégat peut créer des lignes. Aucun setter public : l'état ne change que par des méthodes nommées selon le métier."
    },
    {
      title: "Domain events : enregistrement et publication après SaveChanges",
      code: `// Domain
public interface IDomainEvent;
public sealed record OrderPlaced(OrderId OrderId, Guid CustomerId, Money Total) : IDomainEvent;
public sealed record OrderCancelled(OrderId OrderId) : IDomainEvent;

public abstract class AggregateRoot
{
    private readonly List<IDomainEvent> _events = [];
    public IReadOnlyList<IDomainEvent> DomainEvents => _events;
    protected void Raise(IDomainEvent e) => _events.Add(e);
    public void ClearDomainEvents() => _events.Clear();
}

// Application
public interface IDomainEventHandler<in TEvent> where TEvent : IDomainEvent
{
    Task Handle(TEvent e, CancellationToken ct);
}

// Infrastructure : le DbContext publie après le commit
public sealed class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options, IServiceProvider sp)
    : DbContext(options), IUnitOfWork
{
    public DbSet<Order> Orders => Set<Order>();

    public override async Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        var aggregates = ChangeTracker.Entries<AggregateRoot>().Select(e => e.Entity).ToList();
        var events = aggregates.SelectMany(a => a.DomainEvents).ToList();
        aggregates.ForEach(a => a.ClearDomainEvents());

        var result = await base.SaveChangesAsync(ct);

        foreach (var e in events)
        {
            var handlerType = typeof(IDomainEventHandler<>).MakeGenericType(e.GetType());
            foreach (dynamic handler in sp.GetServices(handlerType))
                await handler.Handle((dynamic)e, ct);
        }
        return result;
    }
}
// ponytail: publication après commit, un événement peut être perdu si le process meurt ;
// passer à l'Outbox (semaine 4) quand la fiabilité compte.`,
      explain: "Le domaine lève des faits, l'infrastructure décide quand et comment les diffuser. <code>dynamic</code> évite un dispatcher par réflexion plus verbeux."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Value object Email",
      prompt: `<p>Crée un value object <code>Email</code> : refuse une valeur vide ou sans <code>@</code>, normalise en minuscules et sans espaces autour. Vérifie que deux <code>Email</code> construits avec <code>" Kamal@Test.FR "</code> et <code>"kamal@test.fr"</code> sont égaux.</p>`,
      hint: "<p>Un <code>sealed record</code> avec une seule propriété et une validation dans le constructeur. <code>System.Net.Mail.MailAddress.TryCreate</code> existe pour une validation plus sérieuse.</p>",
      solution: `public sealed record Email
{
    public string Value { get; }

    public Email(string value)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(value);
        var normalized = value.Trim().ToLowerInvariant();
        if (!System.Net.Mail.MailAddress.TryCreate(normalized, out _))
            throw new ArgumentException("Adresse e-mail invalide", nameof(value));
        Value = normalized;
    }

    public override string ToString() => Value;
}

public class EmailTests
{
    [Fact]
    public void Deux_emails_normalises_sont_egaux() =>
        Assert.Equal(new Email(" Kamal@Test.FR "), new Email("kamal@test.fr"));

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("pas-un-email")]
    public void Email_invalide_est_refuse(string value) =>
        Assert.ThrowsAny<ArgumentException>(() => new Email(value));
}`
    },
    {
      level: "moyen",
      title: "Machine à états du statut",
      prompt: `<p>Ajoute à <code>Order</code> les méthodes <code>MarkAsPaid()</code> et <code>Ship()</code>. Transitions autorisées : <code>Pending → Placed → Paid → Shipped</code>, et <code>Cancelled</code> depuis <code>Pending</code>, <code>Placed</code> ou <code>Paid</code>. Centralise les transitions dans une seule table plutôt que des <code>if</code> dispersés, et écris un <code>[Theory]</code> qui teste les transitions interdites.</p>`,
      hint: "<p>Un <code>static readonly Dictionary&lt;OrderStatus, OrderStatus[]&gt;</code> des transitions autorisées, et une méthode privée <code>TransitionTo(OrderStatus next)</code>.</p>",
      solution: `public enum OrderStatus { Pending, Placed, Paid, Shipped, Cancelled }

// Dans Order
private static readonly Dictionary<OrderStatus, OrderStatus[]> Allowed = new()
{
    [OrderStatus.Pending]   = [OrderStatus.Placed, OrderStatus.Cancelled],
    [OrderStatus.Placed]    = [OrderStatus.Paid, OrderStatus.Cancelled],
    [OrderStatus.Paid]      = [OrderStatus.Shipped, OrderStatus.Cancelled],
    [OrderStatus.Shipped]   = [],
    [OrderStatus.Cancelled] = []
};

public static bool CanTransition(OrderStatus from, OrderStatus to) => Allowed[from].Contains(to);

private void TransitionTo(OrderStatus next)
{
    if (!CanTransition(Status, next))
        throw new InvalidOperationException($"Transition {Status} -> {next} interdite");
    Status = next;
}

public void MarkAsPaid() => TransitionTo(OrderStatus.Paid);
public void Ship() => TransitionTo(OrderStatus.Shipped);
public void Cancel() { TransitionTo(OrderStatus.Cancelled); Raise(new OrderCancelled(Id)); }

// Tests
public class OrderStatusTests
{
    [Theory]
    [InlineData(OrderStatus.Pending, OrderStatus.Paid)]
    [InlineData(OrderStatus.Pending, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Placed, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Shipped, OrderStatus.Cancelled)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Pending)]
    public void Transitions_interdites(OrderStatus from, OrderStatus to) =>
        Assert.False(Order.CanTransition(from, to));

    [Theory]
    [InlineData(OrderStatus.Pending, OrderStatus.Placed)]
    [InlineData(OrderStatus.Placed, OrderStatus.Paid)]
    [InlineData(OrderStatus.Paid, OrderStatus.Shipped)]
    [InlineData(OrderStatus.Paid, OrderStatus.Cancelled)]
    public void Transitions_autorisees(OrderStatus from, OrderStatus to) =>
        Assert.True(Order.CanTransition(from, to));
}`
    },
    {
      level: "difficile",
      title: "Mapper l'agrégat avec EF Core",
      prompt: `<p>Écris la configuration EF Core (<code>IEntityTypeConfiguration&lt;Order&gt;</code>) pour : la clé <code>OrderId</code> (conversion vers <code>Guid</code>), le statut stocké en texte, les lignes dans une table <code>order_lines</code> accessibles via le champ privé <code>_lines</code>, et <code>UnitPrice</code> (<code>Money</code>) en deux colonnes. Ignore la propriété calculée <code>Total</code> et la liste d'événements.</p>`,
      hint: "<p><code>HasConversion(id =&gt; id.Value, v =&gt; new OrderId(v))</code>, <code>HasConversion&lt;string&gt;()</code>, <code>OwnsMany</code> pour les lignes avec <code>Navigation(...).UsePropertyAccessMode(PropertyAccessMode.Field)</code>, <code>OwnsOne</code> pour <code>Money</code> à l'intérieur.</p>",
      solution: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> b)
    {
        b.ToTable("orders");

        b.HasKey(o => o.Id);
        b.Property(o => o.Id).HasConversion(id => id.Value, v => new OrderId(v));

        b.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
        b.Property(o => o.CustomerId).IsRequired();
        b.HasIndex(o => o.CustomerId);

        b.Ignore(o => o.Total);
        b.Ignore(o => o.DomainEvents);

        // OrderLine fait partie de l'agrégat : entité possédée, pas de DbSet propre
        b.OwnsMany(o => o.Lines, lines =>
        {
            lines.ToTable("order_lines");
            lines.WithOwner().HasForeignKey("OrderId");
            lines.Property<int>("Id");      // clé technique fantôme
            lines.HasKey("Id");
            lines.Property(l => l.ProductId).IsRequired();
            lines.Property(l => l.Quantity).IsRequired();
            lines.Ignore(l => l.LineTotal);

            lines.OwnsOne(l => l.UnitPrice, money =>
            {
                money.Property(m => m.Amount).HasColumnName("unit_price").HasPrecision(18, 2);
                money.Property(m => m.Currency).HasColumnName("currency").HasMaxLength(3);
            });
        });

        // EF passe par le champ _lines au lieu de la propriété en lecture seule
        b.Navigation(o => o.Lines).UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
// Dans le DbContext : modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderFlowDbContext).Assembly);
// Avec OwnsMany, les lignes sont chargées automatiquement avec la commande (pas besoin d'Include).`
    }
  ],
  project: `<p><strong>OrderFlow — domaine riche.</strong> Transforme <code>Order</code> en agrégat : setters privés, <code>Order.Create</code>, collection en lecture seule, machine à états, value object <code>Money</code>, identifiant typé <code>OrderId</code>. Ajoute les événements <code>OrderPlaced</code> et <code>OrderCancelled</code> avec un handler qui journalise (l'e-mail viendra plus tard). Crée une migration EF et vérifie que les tests des jours 17 et 18 passent toujours.</p>`,
  resources: [
    { label: "Concevoir un microservice orienté DDD", url: "https://learn.microsoft.com/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice" },
    { label: "Implémenter les value objects", url: "https://learn.microsoft.com/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/implement-value-objects" },
    { label: "Domain events : conception et implémentation", url: "https://learn.microsoft.com/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/domain-events-design-implementation" }
  ]
});

// ───────────────────────── Jour 20 ─────────────────────────
window.COURSE.push({
  day: 20, week: 3,
  title: "Gestion d'erreurs, Result pattern et résilience",
  summary: "Distinguer erreurs métier et pannes, renvoyer des ProblemDetails propres et survivre aux appels externes instables.",
  objectives: [
    "Mettre en place une gestion d'erreurs globale avec IExceptionHandler et ProblemDetails",
    "Remplacer les exceptions métier attendues par un type Result",
    "Rendre les appels HTTP sortants résilients avec Microsoft.Extensions.Http.Resilience"
  ],
  lesson: `<h3>Deux familles d'erreurs</h3>
<ul>
<li><strong>Erreurs attendues</strong> (métier) : produit introuvable, stock insuffisant, commande déjà expédiée. Elles font partie du flux normal et le client doit pouvoir réagir (400, 404, 409).</li>
<li><strong>Erreurs inattendues</strong> (techniques) : base indisponible, bug, timeout. On les journalise avec la stack trace et on renvoie un 500 générique, sans détails internes.</li>
</ul>
<p>Utiliser des exceptions pour les deux est courant mais a un coût : une exception est lente (capture de la pile), invisible dans la signature de la méthode, et pousse à des <code>try/catch</code> partout. Le <strong>Result pattern</strong> rend l'échec explicite dans le type de retour.</p>
<h3>Le Result pattern</h3>
<p>Un handler renvoie <code>Result&lt;Guid&gt;</code> : soit un succès avec une valeur, soit un échec avec une <code>Error</code> (code, message, type). L'appelant est obligé de regarder. Des bibliothèques existent (ErrorOr, FluentResults, OneOf), mais un type maison de 40 lignes suffit largement et évite une dépendance.</p>
<p>Où garder les exceptions ? Pour les violations d'invariants qui indiquent un bug du programmeur (argument null, état impossible) et pour les pannes techniques. Le domaine peut continuer à lancer <code>ArgumentException</code> sur des entrées invalides, tandis que les handlers convertissent les cas métier en <code>Result</code>.</p>
<h3>Gestion globale dans ASP.NET Core</h3>
<p>Depuis .NET 8, la méthode recommandée :</p>
<ul>
<li><code>builder.Services.AddProblemDetails()</code> : toutes les erreurs sortent au format standard <strong>RFC 9457</strong> (<code>application/problem+json</code>) avec <code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code>, <code>instance</code>.</li>
<li><code>IExceptionHandler</code> : une ou plusieurs classes enregistrées avec <code>AddExceptionHandler&lt;T&gt;()</code> qui transforment une exception en réponse. Elles sont appelées dans l'ordre d'enregistrement jusqu'à ce que l'une renvoie <code>true</code>.</li>
<li><code>app.UseExceptionHandler()</code> branche le middleware.</li>
</ul>
<p>Ajoute un <code>traceId</code> dans les ProblemDetails : le support pourra retrouver le log exact.</p>
<h3>La résilience des appels sortants</h3>
<p>Un service externe (paiement, transporteur) finit toujours par échouer. <strong>Polly</strong> est la bibliothèque de référence ; Microsoft l'intègre via <code>Microsoft.Extensions.Http.Resilience</code>. Une ligne, <code>.AddStandardResilienceHandler()</code> sur un <code>HttpClient</code> typé, ajoute un pipeline éprouvé :</p>
<ul>
<li><strong>Rate limiter</strong> : limite le nombre de requêtes simultanées.</li>
<li><strong>Timeout total</strong> : borne la durée de l'opération, retries compris.</li>
<li><strong>Retry</strong> avec backoff exponentiel et jitter, sur les erreurs transitoires (5xx, 408, 429).</li>
<li><strong>Circuit breaker</strong> : après trop d'échecs, coupe les appels un moment pour laisser le service récupérer.</li>
<li><strong>Timeout par tentative</strong>.</li>
</ul>
<p>Le paquet ancien <code>Microsoft.Extensions.Http.Polly</code> est déprécié au profit de celui-ci.</p>
<h3>Pièges courants</h3>
<ul>
<li><code>catch (Exception) { }</code> vide : l'erreur disparaît, les données peuvent être corrompues en silence.</li>
<li>Renvoyer <code>ex.Message</code> ou la stack trace au client : fuite d'informations.</li>
<li>Retry sur une opération <strong>non idempotente</strong> (un POST de paiement) : risque de double débit. Utilise une clé d'idempotence ou ne retente pas.</li>
<li>Retries empilés à chaque couche : 3 × 3 × 3 = 27 appels sur un service déjà en difficulté.</li>
<li><code>throw ex;</code> au lieu de <code>throw;</code> : la stack trace d'origine est perdue.</li>
</ul>
<div class="note"><strong>Niveau senior</strong> : la résilience se conçoit avec des chiffres. Combien de temps l'utilisateur peut-il attendre ? Quel est le SLA du fournisseur ? Le timeout total doit être inférieur à celui de l'appelant, sinon tes retries continuent pour une requête déjà abandonnée. Sache aussi expliquer que le circuit breaker protège surtout le <em>service appelé</em> et tes propres threads, et qu'un fallback (valeur en cache, mode dégradé) est souvent plus utile qu'un retry de plus.</div>`,
  examples: [
    {
      title: "Un type Result minimal",
      code: `namespace OrderFlow.Application.Common;

public enum ErrorType { Validation, NotFound, Conflict, Forbidden }

public sealed record Error(string Code, string Message, ErrorType Type)
{
    public static Error NotFound(string code, string message) => new(code, message, ErrorType.NotFound);
    public static Error Conflict(string code, string message) => new(code, message, ErrorType.Conflict);
    public static Error Validation(string code, string message) => new(code, message, ErrorType.Validation);
}

public sealed class Result<T>
{
    private readonly T? _value;

    private Result(T value) { _value = value; IsSuccess = true; }
    private Result(Error error) { Error = error; }

    public bool IsSuccess { get; }
    public Error? Error { get; }
    public T Value => IsSuccess ? _value! : throw new InvalidOperationException("Résultat en échec");

    public static Result<T> Success(T value) => new(value);
    public static Result<T> Failure(Error error) => new(error);

    // permet : return order.Id;  ou  return OrderErrors.NotFound;
    public static implicit operator Result<T>(T value) => Success(value);
    public static implicit operator Result<T>(Error error) => Failure(error);

    public TOut Match<TOut>(Func<T, TOut> onSuccess, Func<Error, TOut> onFailure) =>
        IsSuccess ? onSuccess(_value!) : onFailure(Error!);
}

public static class OrderErrors
{
    public static readonly Error NotFound = Error.NotFound("Order.NotFound", "Commande introuvable.");
    public static readonly Error AlreadyShipped = Error.Conflict("Order.AlreadyShipped", "La commande est déjà expédiée.");
}`,
      explain: "Les conversions implicites gardent les handlers lisibles. Les erreurs sont des valeurs nommées, réutilisables et testables."
    },
    {
      title: "Handler avec Result et conversion en réponse HTTP",
      code: `public sealed record CancelOrderCommand(OrderId OrderId) : ICommand<Result<OrderId>>;

internal sealed class CancelOrderHandler(IOrderRepository orders, IUnitOfWork uow)
    : ICommandHandler<CancelOrderCommand, Result<OrderId>>
{
    public async Task<Result<OrderId>> Handle(CancelOrderCommand cmd, CancellationToken ct)
    {
        var order = await orders.GetByIdAsync(cmd.OrderId, ct);
        if (order is null) return OrderErrors.NotFound;
        if (order.Status == OrderStatus.Shipped) return OrderErrors.AlreadyShipped;

        order.Cancel();
        await uow.SaveChangesAsync(ct);
        return order.Id;
    }
}

// OrderFlow.Api/ResultExtensions.cs
public static class ResultExtensions
{
    public static IResult ToProblem(this Error error) => Results.Problem(
        statusCode: error.Type switch
        {
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Forbidden => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError
        },
        title: error.Code,
        detail: error.Message);
}

// Endpoint
app.MapPost("/orders/{id:guid}/cancel", async (
    Guid id, ICommandHandler<CancelOrderCommand, Result<OrderId>> handler, CancellationToken ct) =>
{
    var result = await handler.Handle(new CancelOrderCommand(new OrderId(id)), ct);
    return result.Match(_ => Results.NoContent(), error => error.ToProblem());
});`,
      explain: "Le handler ne connaît pas HTTP ; l'API traduit chaque <code>ErrorType</code> en code de statut, une seule fois."
    },
    {
      title: "IExceptionHandler global et HttpClient résilient",
      code: `// OrderFlow.Api/GlobalExceptionHandler.cs
internal sealed class GlobalExceptionHandler(
    IProblemDetailsService problemDetails,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var (status, title) = ex switch
        {
            FluentValidation.ValidationException => (StatusCodes.Status400BadRequest, "Requête invalide"),
            OperationCanceledException => (499, "Requête annulée"),
            _ => (StatusCodes.Status500InternalServerError, "Une erreur inattendue est survenue")
        };

        if (status >= 500)
            logger.LogError(ex, "Exception non gérée sur {Path}", ctx.Request.Path);

        ctx.Response.StatusCode = status;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = ctx,
            Exception = ex,
            ProblemDetails = { Status = status, Title = title }
        });
    }
}

// Program.cs
builder.Services.AddProblemDetails(o => o.CustomizeProblemDetails = c =>
    c.ProblemDetails.Extensions["traceId"] = Activity.Current?.Id ?? c.HttpContext.TraceIdentifier);
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Client HTTP typé vers le transporteur, avec le pipeline standard Polly
builder.Services.AddHttpClient<IShippingClient, ShippingClient>(c =>
        c.BaseAddress = new Uri(builder.Configuration["Shipping:BaseUrl"]!))
    .AddStandardResilienceHandler(o =>
    {
        o.Retry.MaxRetryAttempts = 3;
        o.AttemptTimeout.Timeout = TimeSpan.FromSeconds(2);
        o.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(10);
    });

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();`,
      explain: "Le message renvoyé au client est générique ; le détail reste dans les logs, reliés par le <code>traceId</code>. Le pipeline de résilience nécessite le paquet <code>Microsoft.Extensions.Http.Resilience</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Convertir un handler en Result",
      prompt: `<p>Réécris <code>PlaceOrderHandler</code> (jour 16) pour qu'il renvoie <code>Result&lt;OrderId&gt;</code> au lieu de lancer <code>InvalidOperationException("Produit inconnu")</code>. Ajoute l'erreur <code>ProductErrors.NotFound(Guid id)</code> avec un message qui contient l'identifiant.</p>`,
      hint: "<p>Une méthode statique qui construit l'<code>Error</code> à la demande. Grâce à la conversion implicite, <code>return ProductErrors.NotFound(line.ProductId);</code> compile.</p>",
      solution: `public static class ProductErrors
{
    public static Error NotFound(Guid id) =>
        Error.NotFound("Product.NotFound", $"Le produit {id} est introuvable.");
}

public sealed record PlaceOrderCommand(Guid CustomerId, IReadOnlyList<PlaceOrderLine> Lines)
    : ICommand<Result<OrderId>>;

internal sealed class PlaceOrderHandler(
    IOrderRepository orders, IProductRepository products, IUnitOfWork uow, TimeProvider clock)
    : ICommandHandler<PlaceOrderCommand, Result<OrderId>>
{
    public async Task<Result<OrderId>> Handle(PlaceOrderCommand cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.CustomerId, clock.GetUtcNow());

        foreach (var line in cmd.Lines)
        {
            var product = await products.GetByIdAsync(line.ProductId, ct);
            if (product is null) return ProductErrors.NotFound(line.ProductId);
            order.AddLine(product.Id, product.Price, line.Quantity);
        }

        order.Place();
        orders.Add(order);
        await uow.SaveChangesAsync(ct);
        return order.Id;
    }
}

// Test
[Fact]
public async Task Produit_inconnu_renvoie_NotFound()
{
    var products = Substitute.For<IProductRepository>();
    products.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns((Product?)null);
    var sut = new PlaceOrderHandler(Substitute.For<IOrderRepository>(), products,
        Substitute.For<IUnitOfWork>(), TimeProvider.System);

    var result = await sut.Handle(new PlaceOrderCommand(Guid.NewGuid(), [new(Guid.NewGuid(), 1)]), default);

    Assert.False(result.IsSuccess);
    Assert.Equal("Product.NotFound", result.Error!.Code);
}`
    },
    {
      level: "moyen",
      title: "Exception de concurrence en 409",
      prompt: `<p>Deux utilisateurs modifient la même commande en même temps. Ajoute un jeton de concurrence sur <code>Order</code> (PostgreSQL : colonne système <code>xmin</code>) et un second <code>IExceptionHandler</code> qui transforme <code>DbUpdateConcurrencyException</code> en <strong>409 Conflict</strong> avec un message clair. Il doit être enregistré avant le handler global.</p>`,
      hint: "<p>Npgsql : <code>b.Property&lt;uint&gt;(\"Version\").IsRowVersion();</code> mappe <code>xmin</code>. Un <code>IExceptionHandler</code> renvoie <code>false</code> s'il ne gère pas l'exception, et le suivant est appelé.</p>",
      solution: `// Configuration EF (Npgsql) : xmin comme jeton de concurrence optimiste
b.Property<uint>("Version").IsRowVersion();

// OrderFlow.Api/ConcurrencyExceptionHandler.cs
internal sealed class ConcurrencyExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception ex, CancellationToken ct)
    {
        if (ex is not DbUpdateConcurrencyException)
            return false; // laisse la main au handler suivant

        ctx.Response.StatusCode = StatusCodes.Status409Conflict;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = ctx,
            Exception = ex,
            ProblemDetails =
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Conflit de modification",
                Detail = "La commande a été modifiée par quelqu'un d'autre. Rechargez-la puis réessayez."
            }
        });
    }
}

// Program.cs : l'ordre compte, du plus spécifique au plus général
builder.Services.AddExceptionHandler<ConcurrencyExceptionHandler>();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();`
    },
    {
      level: "difficile",
      title: "Tester la résilience d'un client HTTP",
      prompt: `<p>Écris un test qui prouve que <code>ShippingClient</code> configuré avec <code>AddStandardResilienceHandler</code> réessaie : un <code>HttpMessageHandler</code> factice renvoie 503 deux fois puis 200. Le test vérifie que l'appel réussit et que le handler a reçu 3 requêtes. Réduis les délais pour que le test soit rapide.</p>`,
      hint: "<p>Construis un <code>ServiceCollection</code>, enregistre le client avec <code>AddHttpClient</code>, ajoute <code>.ConfigurePrimaryHttpMessageHandler(() =&gt; fake)</code> puis <code>.AddStandardResilienceHandler(o =&gt; o.Retry.Delay = TimeSpan.Zero)</code>.</p>",
      solution: `using System.Net;
using Microsoft.Extensions.DependencyInjection;

public sealed class FlakyHandler(int failuresBeforeSuccess) : HttpMessageHandler
{
    public int Calls { get; private set; }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        Calls++;
        var status = Calls <= failuresBeforeSuccess ? HttpStatusCode.ServiceUnavailable : HttpStatusCode.OK;
        return Task.FromResult(new HttpResponseMessage(status) { Content = new StringContent("{}") });
    }
}

public interface IShippingClient { Task<bool> PingAsync(CancellationToken ct); }

public sealed class ShippingClient(HttpClient http) : IShippingClient
{
    public async Task<bool> PingAsync(CancellationToken ct) =>
        (await http.GetAsync("/ping", ct)).IsSuccessStatusCode;
}

public class ShippingResilienceTests
{
    [Fact]
    public async Task Reessaie_sur_503_puis_reussit()
    {
        var fake = new FlakyHandler(failuresBeforeSuccess: 2);
        var services = new ServiceCollection();
        services.AddHttpClient<IShippingClient, ShippingClient>(c => c.BaseAddress = new Uri("https://shipping.test"))
            .ConfigurePrimaryHttpMessageHandler(() => fake)
            .AddStandardResilienceHandler(o =>
            {
                o.Retry.MaxRetryAttempts = 3;
                o.Retry.Delay = TimeSpan.Zero;      // test rapide
                o.Retry.UseJitter = false;
            });

        using var provider = services.BuildServiceProvider();
        var client = provider.GetRequiredService<IShippingClient>();

        var ok = await client.PingAsync(CancellationToken.None);

        Assert.True(ok);
        Assert.Equal(3, fake.Calls);
    }

    [Fact]
    public async Task Abandonne_apres_le_nombre_maximal_de_tentatives()
    {
        var fake = new FlakyHandler(failuresBeforeSuccess: int.MaxValue);
        var services = new ServiceCollection();
        services.AddHttpClient<IShippingClient, ShippingClient>(c => c.BaseAddress = new Uri("https://shipping.test"))
            .ConfigurePrimaryHttpMessageHandler(() => fake)
            .AddStandardResilienceHandler(o => { o.Retry.MaxRetryAttempts = 2; o.Retry.Delay = TimeSpan.Zero; });

        using var provider = services.BuildServiceProvider();

        var ok = await provider.GetRequiredService<IShippingClient>().PingAsync(default);

        Assert.False(ok);
        Assert.Equal(3, fake.Calls); // 1 appel initial + 2 retries
    }
}`
    }
  ],
  project: `<p><strong>OrderFlow — robustesse.</strong> Passe tous les handlers de commande en <code>Result</code> et mappe les erreurs en ProblemDetails. Ajoute <code>GlobalExceptionHandler</code>, <code>ConcurrencyExceptionHandler</code> et le <code>traceId</code>. Crée un <code>ShippingClient</code> typé (vers un faux service, par exemple un endpoint de l'API qui échoue une fois sur deux) avec <code>AddStandardResilienceHandler</code>. Mets à jour les tests d'intégration : 404, 409 et 500 renvoient tous <code>application/problem+json</code>.</p>`,
  resources: [
    { label: "Gérer les erreurs dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/error-handling" },
    { label: "Gérer les erreurs dans les API web", url: "https://learn.microsoft.com/aspnet/core/web-api/handle-errors" },
    { label: "Créer des applications HTTP résilientes", url: "https://learn.microsoft.com/dotnet/core/resilience/http-resilience" }
  ]
});

// ───────────────────────── Jour 21 ─────────────────────────
window.COURSE.push({
  day: 21, week: 3,
  title: "Révision : code review de ton propre projet",
  summary: "Relire OrderFlow comme un senior relirait la PR d'un collègue, puis corriger la dette identifiée.",
  objectives: [
    "Appliquer une grille de revue de code structurée",
    "Consolider les notions de la semaine (architecture, CQRS, tests, DDD, erreurs)",
    "Prioriser et corriger la dette technique"
  ],
  lesson: `<h3>Pourquoi relire son propre code</h3>
<p>La revue de code est le quotidien d'un senior : il en fait plus qu'il n'en écrit. Relire ton projet avec une grille t'entraîne à repérer les problèmes qu'on te demandera de signaler en entretien et en équipe. Fais-le à froid : ouvre le code comme s'il venait de quelqu'un d'autre.</p>
<h3>Grille de revue (dans cet ordre)</h3>
<ol>
<li><strong>Correction</strong> : le code fait-il ce qu'il doit ? Cas limites (liste vide, null, quantité 0, devise différente), concurrence, annulation (<code>CancellationToken</code> propagé partout).</li>
<li><strong>Sécurité</strong> : chaque endpoint a-t-il une autorisation ? Un client peut-il lire la commande d'un autre (contrôle d'appartenance, IDOR) ? Secrets hors du code ? Messages d'erreur sans détails internes ?</li>
<li><strong>Architecture</strong> : la règle de dépendance est-elle respectée ? Le domaine contient-il les règles ou sont-elles dans les handlers ? Les entités fuient-elles dans les réponses HTTP ?</li>
<li><strong>Données</strong> : requêtes N+1, <code>AsNoTracking</code> sur les lectures, index sur les colonnes filtrées, pagination sur les listes.</li>
<li><strong>Tests</strong> : les règles métier critiques sont-elles couvertes ? Les tests vérifient-ils le comportement ou l'implémentation ?</li>
<li><strong>Lisibilité</strong> : noms métier, méthodes courtes, pas de code mort, pas de commentaire qui répète le code.</li>
</ol>
<h3>Outils qui font une partie du travail</h3>
<ul>
<li><strong>Analyseurs Roslyn</strong> : <code>&lt;AnalysisLevel&gt;latest-recommended&lt;/AnalysisLevel&gt;</code> dans un <code>Directory.Build.props</code> active des centaines de règles intégrées au SDK.</li>
<li><code>&lt;TreatWarningsAsErrors&gt;true&lt;/TreatWarningsAsErrors&gt;</code> et <code>&lt;Nullable&gt;enable&lt;/Nullable&gt;</code> sur tous les projets.</li>
<li><code>.editorconfig</code> pour le style, appliqué avec <code>dotnet format</code>.</li>
<li><code>dotnet list package --vulnerable</code> et <code>--outdated</code> pour les dépendances.</li>
<li>Couverture : <code>dotnet test --collect:"XPlat Code Coverage"</code> (coverlet), pour repérer les zones non testées, pas pour viser un chiffre.</li>
</ul>
<h3>Écrire un bon commentaire de revue</h3>
<p>Un commentaire utile dit <strong>quoi</strong>, <strong>pourquoi</strong> et propose <strong>une piste</strong>. Classe-les par gravité : <em>bloquant</em> (bug, faille), <em>important</em> (dette réelle), <em>suggestion</em> (préférence). « Ce n'est pas propre » n'aide personne ; « <code>GetCustomerOrders</code> charge toutes les commandes sans pagination : avec 10 000 commandes la réponse fera plusieurs Mo, ajoute <code>page</code>/<code>pageSize</code> avec une limite à 100 » oui.</p>
<h3>Récapitulatif de la semaine</h3>
<ul>
<li>Clean Architecture : dépendances vers l'intérieur, domaine sans technique.</li>
<li>CQRS : commandes par le domaine, lectures par projection. MediatR optionnel (licence commerciale).</li>
<li>Tests : unitaires sur le domaine, intégration avec une vraie base, comportement plutôt qu'implémentation. FluentAssertions v8 payant, Shouldly ou asserts xUnit gratuits.</li>
<li>DDD : agrégats petits, invariants dans la racine, value objects immuables, événements pour les effets de bord.</li>
<li>Erreurs : Result pour le métier, exceptions pour les pannes, ProblemDetails partout, résilience sur les appels sortants.</li>
</ul>
<h3>Pièges de la revue</h3>
<ul>
<li>Se perdre dans le style (accolades, espaces) : c'est le travail de <code>dotnet format</code>.</li>
<li>Tout corriger d'un coup : priorise, fais des commits séparés.</li>
<li>Refactorer sans tests : écris le test d'abord, puis modifie.</li>
</ul>
<div class="note"><strong>Niveau senior</strong> : la dette technique n'est pas un défaut moral, c'est un emprunt. Un senior la rend visible (liste priorisée avec impact et coût estimés), la rembourse quand elle freine vraiment, et accepte d'en garder quand le coût de correction dépasse le bénéfice. En entretien, raconter une dette que tu as choisi de <em>ne pas</em> corriger, et pourquoi, montre plus de maturité que de dire que ton code est parfait.</div>`,
  examples: [
    {
      title: "Directory.Build.props pour toute la solution",
      code: `<!-- Directory.Build.props à la racine : s'applique à tous les projets -->
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <LangVersion>latest</LangVersion>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <AnalysisLevel>latest-recommended</AnalysisLevel>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
    <!-- version centralisée des paquets NuGet -->
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
</Project>

<!-- Directory.Packages.props : une seule version par paquet -->
<Project>
  <ItemGroup>
    <PackageVersion Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.0.0" />
    <PackageVersion Include="Microsoft.Extensions.Http.Resilience" Version="10.0.0" />
    <PackageVersion Include="xunit.v3" Version="3.1.0" />
    <PackageVersion Include="Shouldly" Version="4.3.0" />
    <PackageVersion Include="NSubstitute" Version="5.3.0" />
  </ItemGroup>
</Project>`,
      explain: "Les <code>.csproj</code> ne gardent alors que <code>&lt;PackageReference Include=\"...\" /&gt;</code> sans version. Les numéros de version sont indicatifs : vérifie les dernières sur nuget.org."
    },
    {
      title: "Exemple de revue : avant / après",
      code: `// AVANT : 5 problèmes
app.MapGet("/customers/{id}/orders", async (Guid id, OrderFlowDbContext db) =>
{
    var orders = await db.Orders.Where(o => o.CustomerId == id).ToListAsync();   // (1)(2)(3)
    return orders;                                                                 // (4)
});                                                                                // (5)

// Revue :
// (1) [important] pas de pagination : réponse illimitée
// (2) [important] tracking EF inutile en lecture
// (3) [suggestion] CancellationToken non propagé
// (4) [important] l'entité est sérialisée : fuite du modèle, cycles possibles
// (5) [bloquant]  aucune autorisation : n'importe qui lit les commandes de n'importe qui (IDOR)

// APRÈS
app.MapGet("/customers/{id:guid}/orders", async (
        Guid id, int page, int pageSize, ClaimsPrincipal user,
        OrderFlowDbContext db, CancellationToken ct) =>
    {
        if (!user.IsInRole("Admin") && user.FindFirstValue(ClaimTypes.NameIdentifier) != id.ToString())
            return Results.Forbid();

        pageSize = Math.Clamp(pageSize, 1, 100);
        page = Math.Max(page, 1);

        var items = await db.Orders.AsNoTracking()
            .Where(o => o.CustomerId == id)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(o => new OrderSummaryDto(o.Id.Value, o.Status.ToString(), o.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(items);
    })
    .RequireAuthorization();`,
      explain: "Chaque remarque est classée par gravité et a une correction concrète. Le contrôle d'appartenance (IDOR) est la faille la plus fréquente dans les API REST."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Quiz de la semaine",
      prompt: `<p>Réponds en une ou deux phrases :</p>
<ol><li>Dans quel projet vit <code>IOrderRepository</code>, et pourquoi ?</li><li>Quelle est la différence entre CQRS et MediatR ?</li><li>Pourquoi ne pas tester avec <code>UseInMemoryDatabase</code> ?</li><li>Entité ou value object : une adresse de livraison ? un client ?</li><li>Pourquoi ne pas retenter automatiquement un POST de paiement ?</li></ol>`,
      hint: "<p>Relis les encadrés « niveau senior » des jours 15 à 20.</p>",
      solution: `// 1. Dans OrderFlow.Application : c'est le cas d'usage qui définit ce dont il a besoin
//    (Dependency Inversion). Infrastructure l'implémente, Application ne dépend pas d'EF.
// 2. CQRS est un principe : séparer écritures et lectures. MediatR est un outil de dispatch
//    en mémoire. On peut faire l'un sans l'autre ; MediatR est désormais sous licence commerciale.
// 3. Ce n'est pas une base relationnelle : pas de vraies transactions, contraintes, ni SQL.
//    Des requêtes qui passent en mémoire échouent en production. -> Testcontainers.
// 4. Adresse : value object (définie par ses valeurs, remplacée en bloc, immuable).
//    Client : entité (identité stable même si son nom ou son adresse change).
// 5. Ce n'est pas idempotent : si la première tentative a réussi mais que la réponse s'est
//    perdue, le retry débite deux fois. Il faut une clé d'idempotence côté fournisseur.`
    },
    {
      level: "moyen",
      title: "Trouver les problèmes",
      prompt: `<p>Fais la revue de ce handler. Liste chaque problème avec sa gravité (bloquant / important / suggestion), puis propose la version corrigée.</p>
<pre>public class ShipOrderHandler(OrderFlowDbContext db, IShippingClient shipping)
{
    public async Task&lt;Order&gt; Handle(Guid orderId)
    {
        try
        {
            var order = db.Orders.Include(o =&gt; o.Lines).First(o =&gt; o.Id.Value == orderId);
            await shipping.CreateLabelAsync(order.Id.Value, CancellationToken.None);
            order.Ship();
            db.SaveChanges();
            return order;
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return null;
        }
    }
}</pre>`,
      hint: "<p>Regarde : appels synchrones, <code>First</code>, ordre des opérations (appel externe avant la vérification du statut), exception avalée, null retourné malgré le type, absence de <code>CancellationToken</code>, entité renvoyée.</p>",
      solution: `// Revue :
// [bloquant]   catch (Exception) qui avale tout et renvoie null : les erreurs disparaissent,
//              l'appelant reçoit null alors que le type promet un Order (warning nullable).
// [bloquant]   shipping.CreateLabelAsync est appelé AVANT order.Ship() : si la commande
//              n'est pas payée, Ship() lance, mais l'étiquette est déjà créée chez le transporteur.
// [important]  First() lance si la commande n'existe pas -> cas métier attendu, doit être un 404.
// [important]  db.SaveChanges() synchrone et CancellationToken.None : bloque un thread, ignore
//              l'annulation de la requête.
// [important]  Console.WriteLine au lieu d'ILogger : invisible en production.
// [important]  renvoie l'entité : fuite du modèle.
// [suggestion] dépend du DbContext concret : passer par IOrderRepository / IUnitOfWork.

public sealed record ShipOrderCommand(OrderId OrderId) : ICommand<Result<OrderId>>;

internal sealed class ShipOrderHandler(
    IOrderRepository orders, IUnitOfWork uow, IShippingClient shipping)
    : ICommandHandler<ShipOrderCommand, Result<OrderId>>
{
    public async Task<Result<OrderId>> Handle(ShipOrderCommand cmd, CancellationToken ct)
    {
        var order = await orders.GetByIdAsync(cmd.OrderId, ct);
        if (order is null) return OrderErrors.NotFound;
        if (!Order.CanTransition(order.Status, OrderStatus.Shipped)) return OrderErrors.NotPaid;

        // l'état est validé avant l'effet externe
        await shipping.CreateLabelAsync(order.Id.Value, ct);
        order.Ship();
        await uow.SaveChangesAsync(ct);
        return order.Id;
    }
}
// Les exceptions techniques remontent jusqu'au GlobalExceptionHandler, qui journalise.
// ponytail: si SaveChanges échoue après la création de l'étiquette, on a une étiquette orpheline ;
// la vraie solution est un événement OrderShipped traité via Outbox (semaine 4).`
    },
    {
      level: "difficile",
      title: "Rapport de dette technique",
      prompt: `<p>Lance sur ton OrderFlow : <code>dotnet build</code> avec <code>latest-recommended</code>, <code>dotnet list package --vulnerable --include-transitive</code>, et la couverture de tests. Produis un fichier <code>TECH-DEBT.md</code> avec au moins 6 éléments, chacun avec : description, impact, effort (S/M/L), décision (corriger maintenant / plus tard / accepter) et justification. Corrige les 2 premiers. Exemple de structure fourni dans la solution.</p>`,
      hint: "<p>Classe par rapport impact / effort : ce qui est fort impact et faible effort passe en premier. « Accepter » est une décision valable si elle est justifiée.</p>",
      solution: `# TECH-DEBT.md — OrderFlow (revue du jour 21)

| # | Problème | Impact | Effort | Décision |
|---|----------|--------|--------|----------|
| 1 | GET /customers/{id}/orders sans contrôle d'appartenance (IDOR) | Fuite de données | S | Corriger maintenant |
| 2 | Liste des commandes sans pagination | Réponses de plusieurs Mo, timeouts | S | Corriger maintenant |
| 3 | Domain events publiés après commit (perte possible) | E-mails non envoyés si crash | M | Plus tard : Outbox, semaine 4 |
| 4 | 14 warnings CA1848 (LoggerMessage) après latest-recommended | Perf de logging mineure | M | Accepter pour l'instant : pas de point chaud mesuré |
| 5 | Pas de test d'intégration sur l'annulation concurrente | Régression 409 non détectée | S | Plus tard (cette semaine) |
| 6 | Paquet transitif signalé vulnérable (à vérifier) | Sécurité | S | Corriger dès que confirmé : mise à jour via Directory.Packages.props |
| 7 | Handlers de query dans Infrastructure | Écart à la Clean Architecture pure | L | Accepter : compromis documenté, lectures plus simples |

## Justifications
- 1 et 2 : faible effort, impact sécurité/production direct -> priorité absolue.
- 4 : la règle CA1848 recommande LoggerMessage source-generated ; utile sur les chemins chauds,
  mais aucun benchmark ne montre de coût aujourd'hui. Revoir au jour 24 (performance).
- 7 : décision d'architecture assumée, notée dans l'ADR docs/adr/0002-queries-in-infrastructure.md.

## Commandes utilisées
dotnet build -warnaserror
dotnet list package --vulnerable --include-transitive
dotnet test --collect:"XPlat Code Coverage"`
    }
  ],
  project: `<p><strong>OrderFlow — revue et consolidation.</strong> Ajoute <code>Directory.Build.props</code> et <code>Directory.Packages.props</code>, active <code>latest-recommended</code> et <code>TreatWarningsAsErrors</code>, puis corrige ou documente chaque warning. Fais la revue complète avec la grille du jour, rédige <code>TECH-DEBT.md</code>, et corrige les éléments « maintenant ». Écris un court ADR (Architecture Decision Record) qui justifie ton choix MediatR ou dispatcher maison. Critère de fin : build sans warning, tous les tests verts, README à jour.</p>`,
  resources: [
    { label: "Vue d'ensemble de l'analyse du code .NET", url: "https://learn.microsoft.com/dotnet/fundamentals/code-analysis/overview" },
    { label: "Gestion centralisée des paquets (NuGet)", url: "https://learn.microsoft.com/nuget/consume-packages/central-package-management" },
    { label: "Personnaliser le build avec Directory.Build.props", url: "https://learn.microsoft.com/visualstudio/msbuild/customize-by-directory" }
  ]
});
