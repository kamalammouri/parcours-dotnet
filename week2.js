window.COURSE = window.COURSE || [];

/* ===================== JOUR 8 ===================== */
window.COURSE.push({
  day: 8, week: 2,
  title: "Pipeline ASP.NET Core, middleware et injection de dépendances",
  summary: "Comprendre comment une requête traverse ASP.NET Core et comment les services sont créés et partagés.",
  objectives: [
    "Expliquer le rôle de WebApplicationBuilder, WebApplication et du pipeline de middlewares",
    "Écrire un middleware inline et un middleware en classe",
    "Choisir le bon lifetime (Singleton, Scoped, Transient) et éviter les dépendances captives"
  ],
  lesson: `
<h3>Le modèle d'hébergement</h3>
<p>Une application ASP.NET Core démarre en deux temps. D'abord <code>WebApplication.CreateBuilder(args)</code> prépare la configuration, le logging et le conteneur de services (<code>builder.Services</code>). Ensuite <code>builder.Build()</code> fige le conteneur et renvoie un <code>WebApplication</code> sur lequel on décrit le pipeline HTTP et les endpoints. Tout ce qui touche aux services doit être fait <strong>avant</strong> <code>Build()</code>, tout ce qui touche aux requêtes <strong>après</strong>.</p>

<h3>Le pipeline de middlewares</h3>
<p>Un middleware est une fonction qui reçoit le <code>HttpContext</code> et un délégué <code>next</code>. Il peut agir avant d'appeler <code>next</code>, après, ou court-circuiter la chaîne en n'appelant pas <code>next</code> (par exemple pour renvoyer un 401). Les middlewares s'exécutent dans l'ordre où ils sont enregistrés à l'aller, puis dans l'ordre inverse au retour : c'est une pile, comme les interceptors HTTP d'Angular.</p>
<ul>
  <li><code>app.Use(...)</code> ajoute un middleware qui appelle normalement <code>next</code>.</li>
  <li><code>app.Run(...)</code> ajoute un middleware terminal (il n'y a pas de suivant).</li>
  <li><code>app.UseMiddleware&lt;T&gt;()</code> enregistre une classe middleware par convention : un constructeur qui reçoit <code>RequestDelegate next</code> et une méthode <code>InvokeAsync(HttpContext)</code>.</li>
</ul>
<p>L'ordre recommandé pour les middlewares intégrés est : gestion d'exceptions, HTTPS/HSTS, fichiers statiques, routing, CORS, authentification, autorisation, puis les endpoints. Depuis .NET 6, <code>UseRouting</code> et <code>UseEndpoints</code> sont ajoutés automatiquement, mais l'ordre relatif de <code>UseCors</code>, <code>UseAuthentication</code> et <code>UseAuthorization</code> reste de ta responsabilité.</p>

<h3>L'injection de dépendances (DI)</h3>
<p>ASP.NET Core embarque un conteneur DI. On enregistre une abstraction et son implémentation, puis le framework fournit l'instance aux constructeurs, aux paramètres des endpoints Minimal API et à la méthode <code>InvokeAsync</code> des middlewares.</p>
<ul>
  <li><strong>Singleton</strong> : une seule instance pour toute la vie de l'application. Doit être thread-safe.</li>
  <li><strong>Scoped</strong> : une instance par requête HTTP. C'est le lifetime du <code>DbContext</code>.</li>
  <li><strong>Transient</strong> : une nouvelle instance à chaque résolution. Pour les services légers et sans état.</li>
</ul>
<p>Depuis .NET 8, les <strong>keyed services</strong> permettent d'enregistrer plusieurs implémentations sous des clés (<code>AddKeyedSingleton&lt;IPaymentGateway, StripeGateway&gt;("stripe")</code>) et de les récupérer avec <code>[FromKeyedServices("stripe")]</code>.</p>

<h3>Pièges courants</h3>
<ul>
  <li><strong>Dépendance captive</strong> : un Singleton qui reçoit un service Scoped le garde à vie. Le DbContext devient partagé entre requêtes et entre threads : corruption de données garantie. En environnement Development, ASP.NET Core active <code>ValidateScopes</code> et lève une exception au démarrage ; en Production, non.</li>
  <li><strong>Écrire dans la réponse après <code>next</code></strong> : si le corps a déjà commencé à être envoyé, modifier les en-têtes lève une exception. Positionne les en-têtes avant <code>next</code> ou via <code>context.Response.OnStarting</code>.</li>
  <li><strong>Middleware en classe avec une dépendance Scoped dans le constructeur</strong> : la classe middleware est créée une seule fois. Injecte les services Scoped dans <code>InvokeAsync</code>, pas dans le constructeur.</li>
  <li><strong><code>BuildServiceProvider()</code> appelé à la main</strong> dans <code>Program.cs</code> : cela crée un second conteneur avec ses propres singletons. Presque toujours une erreur.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : sache expliquer pourquoi le DbContext est Scoped (unité de travail par requête, pas thread-safe), comment résoudre un service Scoped depuis un Singleton ou un <code>BackgroundService</code> (<code>IServiceScopeFactory.CreateScope()</code>), et pourquoi l'ordre des middlewares est une source fréquente de bugs de sécurité (autorisation placée avant authentification, CORS placé après).</div>
`,
  examples: [
    {
      title: "Program.cs minimal avec un middleware de mesure",
      code: `using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Enregistrement des services : AVANT Build()
builder.Services.AddSingleton<IClock, SystemClock>();

var app = builder.Build();

// Middleware inline : mesure la durée de chaque requête
app.Use(async (context, next) =>
{
    var start = Stopwatch.GetTimestamp();
    await next(context); // on laisse passer la requête
    var elapsed = Stopwatch.GetElapsedTime(start);
    app.Logger.LogInformation("{Method} {Path} -> {Status} en {Elapsed:0.0} ms",
        context.Request.Method, context.Request.Path,
        context.Response.StatusCode, elapsed.TotalMilliseconds);
});

// Le service est injecté directement dans le paramètre de l'endpoint
app.MapGet("/time", (IClock clock) => new { now = clock.UtcNow });

app.Run();

public interface IClock { DateTimeOffset UtcNow { get; } }
public sealed class SystemClock : IClock { public DateTimeOffset UtcNow => DateTimeOffset.UtcNow; }`,
      explain: `Le middleware entoure tout le reste du pipeline : le code après <code>await next(context)</code> s'exécute au retour, quand le code de statut est connu.`
    },
    {
      title: "Middleware en classe : identifiant de corrélation",
      code: `public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    private const string HeaderName = "X-Correlation-Id";

    // Les services Scoped s'injectent ici, pas dans le constructeur
    public async Task InvokeAsync(HttpContext context, ILogger<CorrelationIdMiddleware> logger)
    {
        var correlationId = context.Request.Headers[HeaderName].FirstOrDefault()
                            ?? Guid.NewGuid().ToString("N");

        // On écrit l'en-tête AVANT next, tant que la réponse n'a pas démarré
        context.Response.Headers[HeaderName] = correlationId;

        // Toutes les lignes de log de la requête porteront CorrelationId
        using (logger.BeginScope(new Dictionary<string, object> { ["CorrelationId"] = correlationId }))
        {
            await next(context);
        }
    }
}

// Dans Program.cs
// app.UseMiddleware<CorrelationIdMiddleware>();`,
      explain: `Le constructeur principal (C# 12) reçoit <code>next</code>. La classe est instanciée une seule fois : elle ne doit pas stocker d'état lié à une requête.`
    },
    {
      title: "Visualiser les trois lifetimes",
      code: `var builder = WebApplication.CreateBuilder(args);

builder.Services.AddTransient<TransientId>();
builder.Services.AddScoped<ScopedId>();
builder.Services.AddSingleton<SingletonId>();

var app = builder.Build();

// Chaque type est injecté deux fois dans la même requête
app.MapGet("/lifetimes", (TransientId t1, TransientId t2,
                          ScopedId s1, ScopedId s2,
                          SingletonId g1, SingletonId g2) => new
{
    transient = new[] { t1.Value, t2.Value }, // deux valeurs différentes
    scoped    = new[] { s1.Value, s2.Value }, // identiques dans la requête
    singleton = new[] { g1.Value, g2.Value }  // identiques pour toujours
});

app.Run();

public abstract class OperationId { public Guid Value { get; } = Guid.NewGuid(); }
public sealed class TransientId : OperationId { }
public sealed class ScopedId : OperationId { }
public sealed class SingletonId : OperationId { }`,
      explain: `Appelle <code>/lifetimes</code> deux fois : seule la valeur Singleton reste la même d'une requête à l'autre.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "En-tête de version",
      prompt: `Ajoute un middleware inline qui ajoute l'en-tête <code>X-Api-Version: 1.0</code> à toutes les réponses.`,
      hint: `Écris l'en-tête avant d'appeler <code>next</code>, sinon la réponse risque d'être déjà partie.`,
      solution: `app.Use(async (context, next) =>
{
    context.Response.Headers["X-Api-Version"] = "1.0";
    await next(context);
});`
    },
    {
      level: "moyen",
      title: "Clé d'API obligatoire",
      prompt: `Écris une classe <code>ApiKeyMiddleware</code> qui lit la clé attendue dans la configuration (<code>ApiKey</code>) et renvoie <code>401</code> si l'en-tête <code>X-Api-Key</code> est absent ou faux. Les requêtes vers <code>/health</code> doivent passer sans clé.`,
      hint: `Injecte <code>IConfiguration</code> dans le constructeur (c'est un Singleton). Court-circuite le pipeline en n'appelant pas <code>next</code>. Compare les clés avec <code>CryptographicOperations.FixedTimeEquals</code> pour éviter les attaques temporelles.`,
      solution: `using System.Security.Cryptography;
using System.Text;

public sealed class ApiKeyMiddleware(RequestDelegate next, IConfiguration configuration)
{
    private readonly byte[] _expected =
        Encoding.UTF8.GetBytes(configuration["ApiKey"] ?? throw new InvalidOperationException("ApiKey manquante"));

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/health"))
        {
            await next(context);
            return;
        }

        var provided = Encoding.UTF8.GetBytes(context.Request.Headers["X-Api-Key"].ToString());
        if (!CryptographicOperations.FixedTimeEquals(provided, _expected))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            await context.Response.WriteAsJsonAsync(new { error = "Clé d'API invalide" });
            return; // on n'appelle pas next : court-circuit
        }

        await next(context);
    }
}

// Program.cs
// app.UseMiddleware<ApiKeyMiddleware>();`
    },
    {
      level: "difficile",
      title: "Corriger une dépendance captive",
      prompt: `Le code suivant enregistre <code>PriceCache</code> en Singleton, mais il reçoit <code>IProductRepository</code> qui est Scoped (il utilise un DbContext). Explique le bug puis corrige-le sans changer le lifetime de <code>PriceCache</code>.<br><code>public sealed class PriceCache(IProductRepository repository) { ... }</code>`,
      hint: `Un Singleton ne doit jamais garder un service Scoped. Injecte <code>IServiceScopeFactory</code> et crée un scope à chaque rafraîchissement du cache.`,
      solution: `using System.Collections.Concurrent;

// Bug : le repository (et son DbContext) serait créé une seule fois et partagé
// entre toutes les requêtes et tous les threads. Le DbContext n'est pas thread-safe.

public sealed class PriceCache(IServiceScopeFactory scopeFactory)
{
    private readonly ConcurrentDictionary<int, decimal> _prices = new();

    public async Task<decimal> GetPriceAsync(int productId, CancellationToken ct)
    {
        if (_prices.TryGetValue(productId, out var cached))
            return cached;

        // Un scope éphémère : le repository et le DbContext vivent le temps de ce bloc
        await using var scope = scopeFactory.CreateAsyncScope();
        var repository = scope.ServiceProvider.GetRequiredService<IProductRepository>();
        var price = await repository.GetPriceAsync(productId, ct);

        _prices[productId] = price;
        return price;
    }
}

public interface IProductRepository
{
    Task<decimal> GetPriceAsync(int productId, CancellationToken ct);
}

// builder.Services.AddScoped<IProductRepository, EfProductRepository>();
// builder.Services.AddSingleton<PriceCache>();`
    }
  ],
  project: `<p>Crée le projet <code>OrderFlow.Api</code> avec <code>dotnet new web -n OrderFlow.Api</code>, ajoute-le à la solution et référence <code>OrderFlow.Domain</code>.</p>
<ul>
  <li>Enregistre un <code>IOrderRepository</code> en mémoire (Singleton, basé sur <code>ConcurrentDictionary&lt;Guid, Order&gt;</code>).</li>
  <li>Ajoute le <code>CorrelationIdMiddleware</code> et le middleware de mesure.</li>
  <li>Expose <code>GET /orders</code> et <code>GET /orders/{id}</code>.</li>
  <li>Écris dans un <code>NOTES.md</code> l'ordre de ton pipeline et pourquoi.</li>
</ul>`,
  resources: [
    { label: "Middleware ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/middleware/" },
    { label: "Injection de dépendances dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/dependency-injection" },
    { label: "Injection de dépendances .NET (lifetimes)", url: "https://learn.microsoft.com/dotnet/core/extensions/dependency-injection" }
  ]
});

/* ===================== JOUR 9 ===================== */
window.COURSE.push({
  day: 9, week: 2,
  title: "Routing, model binding, validation, ProblemDetails et OpenAPI",
  summary: "Construire une API REST propre avec Minimal API et controllers, des erreurs standardisées et une documentation OpenAPI.",
  objectives: [
    "Organiser les endpoints avec MapGroup, les contraintes de route et TypedResults",
    "Comprendre d'où viennent les paramètres (route, query, body, services)",
    "Renvoyer des erreurs au format ProblemDetails (RFC 9457) et générer un document OpenAPI"
  ],
  lesson: `
<h3>Minimal API ou controllers ?</h3>
<p>Les deux reposent sur le même moteur de routing. Les <strong>Minimal API</strong> (<code>app.MapGet</code>, <code>MapPost</code>...) sont plus légères, plus rapides à démarrer et compatibles AOT. Les <strong>controllers</strong> (<code>[ApiController]</code>, <code>ControllerBase</code>) apportent les filtres MVC et la validation automatique des modèles. Les nouveaux projets Microsoft partent sur Minimal API ; beaucoup d'entreprises ont encore des controllers. Un senior doit être à l'aise avec les deux.</p>

<h3>Routing</h3>
<ul>
  <li>Les paramètres de route se déclarent entre accolades : <code>/orders/{id:guid}</code>. La contrainte (<code>int</code>, <code>guid</code>, <code>alpha</code>, <code>min(1)</code>...) rejette la route si la valeur ne correspond pas : on obtient un 404, pas un 400.</li>
  <li><code>app.MapGroup("/orders")</code> regroupe des endpoints sous un préfixe commun et permet d'y appliquer en une fois <code>RequireAuthorization()</code>, <code>WithTags("Orders")</code>, etc.</li>
  <li><code>WithName("GetOrder")</code> donne un nom à la route, réutilisable pour générer une URL (<code>CreatedAtRoute</code>).</li>
</ul>

<h3>Model binding</h3>
<p>En Minimal API, la source d'un paramètre est déduite : les types simples présents dans la route viennent de la route, les autres types simples viennent de la query string, les types complexes viennent du corps JSON, et les types enregistrés dans le conteneur viennent de la DI. On peut forcer la source avec <code>[FromRoute]</code>, <code>[FromQuery]</code>, <code>[FromBody]</code>, <code>[FromHeader]</code>, <code>[FromServices]</code>. <code>[AsParameters]</code> regroupe plusieurs paramètres dans un record, pratique pour la pagination et les filtres.</p>

<h3>Résultats typés</h3>
<p><code>TypedResults.Ok(dto)</code> renvoie un type précis (<code>Ok&lt;OrderDto&gt;</code>) au lieu de <code>IResult</code>. Combiné au type union <code>Results&lt;Ok&lt;OrderDto&gt;, NotFound&gt;</code>, le compilateur vérifie tes retours et OpenAPI découvre automatiquement les codes possibles. Cela rend aussi les handlers testables sans serveur.</p>

<h3>Validation</h3>
<p>Avec <code>[ApiController]</code>, un modèle invalide (DataAnnotations) renvoie automatiquement un 400 avec un <code>ValidationProblemDetails</code>. En Minimal API, .NET 10 ajoute la validation intégrée : <code>builder.Services.AddValidation()</code> active la validation des DataAnnotations sur les paramètres. Pour des règles métier plus riches, on utilise souvent FluentValidation ou une validation manuelle renvoyant <code>TypedResults.ValidationProblem(errors)</code>.</p>

<h3>ProblemDetails et gestion des erreurs</h3>
<p><code>builder.Services.AddProblemDetails()</code> plus <code>app.UseExceptionHandler()</code> et <code>app.UseStatusCodePages()</code> transforment exceptions et codes d'erreur vides en réponses JSON normalisées (<code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code>, <code>instance</code>). Depuis .NET 8, <code>IExceptionHandler</code> permet de traduire tes exceptions métier en codes HTTP précis.</p>

<h3>OpenAPI</h3>
<p>Depuis .NET 9, le package <code>Microsoft.AspNetCore.OpenApi</code> génère le document nativement : <code>builder.Services.AddOpenApi()</code> et <code>app.MapOpenApi()</code> exposent <code>/openapi/v1.json</code>. Swashbuckle n'est plus inclus dans les templates ; pour une UI, ajoute Scalar ou Swagger UI en Development.</p>

<h3>Pièges courants</h3>
<ul>
  <li>Exposer directement les entités du domaine ou d'EF dans l'API : on fuit le modèle interne et on crée des cycles de sérialisation. Utilise des DTO.</li>
  <li>Renvoyer 200 avec un message d'erreur dans le corps : le front ne peut plus se fier au code HTTP.</li>
  <li>Oublier <code>CancellationToken</code> dans les handlers : ASP.NET Core le lie automatiquement à l'annulation de la requête.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : choisis les codes HTTP avec précision (201 + <code>Location</code> à la création, 204 pour une suppression, 409 pour un conflit de concurrence, 422 pour une règle métier violée), garde un contrat d'erreur unique pour tous les clients et versionne ton API dès qu'un client externe en dépend.</div>
`,
  examples: [
    {
      title: "Groupe d'endpoints avec TypedResults",
      code: `using Microsoft.AspNetCore.Http.HttpResults;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
builder.Services.AddSingleton<IOrderRepository, InMemoryOrderRepository>();

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();

if (app.Environment.IsDevelopment())
    app.MapOpenApi(); // /openapi/v1.json

var orders = app.MapGroup("/orders").WithTags("Orders");

orders.MapGet("/{id:guid}", GetOrder).WithName("GetOrder");
orders.MapPost("/", CreateOrder);

app.Run();

static async Task<Results<Ok<OrderDto>, NotFound>> GetOrder(
    Guid id, IOrderRepository repository, CancellationToken ct)
{
    var order = await repository.FindAsync(id, ct);
    return order is null ? TypedResults.NotFound() : TypedResults.Ok(OrderDto.From(order));
}

static async Task<Created<OrderDto>> CreateOrder(
    CreateOrderRequest request, IOrderRepository repository, CancellationToken ct)
{
    var order = new Order(request.CustomerId);
    await repository.AddAsync(order, ct);
    return TypedResults.Created($"/orders/{order.Id}", OrderDto.From(order));
}

public sealed record CreateOrderRequest(Guid CustomerId);

public sealed record OrderDto(Guid Id, Guid CustomerId, string Status, decimal Total)
{
    public static OrderDto From(Order o) => new(o.Id, o.CustomerId, o.Status.ToString(), o.Total);
}`,
      explain: `Les handlers sont des méthodes statiques : ils se testent unitairement en vérifiant le type de retour (<code>Ok&lt;OrderDto&gt;</code> ou <code>NotFound</code>).`
    },
    {
      title: "Le même endpoint en controller",
      code: `using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public sealed class OrdersController(IOrderRepository repository) : ControllerBase
{
    [HttpGet("{id:guid}", Name = "GetOrderById")]
    [ProducesResponseType<OrderDto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderDto>> Get(Guid id, CancellationToken ct)
    {
        var order = await repository.FindAsync(id, ct);
        if (order is null) return NotFound();
        return OrderDto.From(order);
    }

    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderRequest request, CancellationToken ct)
    {
        // [ApiController] a déjà renvoyé 400 si le modèle est invalide
        var order = new Order(request.CustomerId);
        await repository.AddAsync(order, ct);
        return CreatedAtRoute("GetOrderById", new { id = order.Id }, OrderDto.From(order));
    }
}

// Program.cs
// builder.Services.AddControllers();
// app.MapControllers();`,
      explain: `<code>[ApiController]</code> active l'inférence des sources de binding et le 400 automatique. <code>CreatedAtRoute</code> remplit l'en-tête <code>Location</code>.`
    },
    {
      title: "Pagination avec [AsParameters]",
      code: `public sealed record OrderQuery(int Page = 1, int PageSize = 20, string? Status = null);

orders.MapGet("/", async ([AsParameters] OrderQuery query, IOrderRepository repository, CancellationToken ct) =>
{
    var pageSize = Math.Clamp(query.PageSize, 1, 100); // borne de sécurité
    var items = await repository.ListAsync(query.Status, (query.Page - 1) * pageSize, pageSize, ct);
    return TypedResults.Ok(new { query.Page, pageSize, items });
});

// GET /orders?page=2&pageSize=50&status=Paid`,
      explain: `Les propriétés du record sont lues depuis la query string. Borne toujours la taille de page côté serveur.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Endpoint de suppression",
      prompt: `Ajoute <code>DELETE /orders/{id:guid}</code> qui renvoie <code>204 No Content</code> si la commande existait et <code>404</code> sinon. Utilise <code>Results&lt;NoContent, NotFound&gt;</code>.`,
      hint: `Le repository peut renvoyer un <code>bool</code> indiquant si une ligne a été supprimée.`,
      solution: `orders.MapDelete("/{id:guid}", async Task<Results<NoContent, NotFound>> (
    Guid id, IOrderRepository repository, CancellationToken ct) =>
{
    var deleted = await repository.DeleteAsync(id, ct);
    return deleted ? TypedResults.NoContent() : TypedResults.NotFound();
});`
    },
    {
      level: "moyen",
      title: "Validation manuelle en Minimal API",
      prompt: `Sur <code>POST /orders/{id}/lines</code>, valide la requête <code>AddLineRequest(Guid ProductId, int Quantity)</code> : <code>Quantity</code> entre 1 et 1000, <code>ProductId</code> non vide. Renvoie un <code>ValidationProblem</code> avec un dictionnaire d'erreurs par champ.`,
      hint: `<code>TypedResults.ValidationProblem</code> prend un <code>Dictionary&lt;string, string[]&gt;</code>. Le type de retour peut être <code>Results&lt;Ok&lt;OrderDto&gt;, ValidationProblem, NotFound&gt;</code>.`,
      solution: `public sealed record AddLineRequest(Guid ProductId, int Quantity);

orders.MapPost("/{id:guid}/lines", async Task<Results<Ok<OrderDto>, ValidationProblem, NotFound>> (
    Guid id, AddLineRequest request, IOrderRepository repository, CancellationToken ct) =>
{
    var errors = new Dictionary<string, string[]>();
    if (request.ProductId == Guid.Empty)
        errors[nameof(request.ProductId)] = ["Le produit est obligatoire."];
    if (request.Quantity is < 1 or > 1000)
        errors[nameof(request.Quantity)] = ["La quantité doit être comprise entre 1 et 1000."];

    if (errors.Count > 0)
        return TypedResults.ValidationProblem(errors);

    var order = await repository.FindAsync(id, ct);
    if (order is null)
        return TypedResults.NotFound();

    order.AddLine(request.ProductId, request.Quantity, unitPrice: 10m); // prix réel au jour 10
    await repository.UpdateAsync(order, ct);
    return TypedResults.Ok(OrderDto.From(order));
});`
    },
    {
      level: "difficile",
      title: "Traduire les exceptions métier en ProblemDetails",
      prompt: `Ton domaine lève <code>DomainException</code> (règle métier violée, par exemple « une commande expédiée ne peut plus être modifiée »). Implémente un <code>IExceptionHandler</code> qui la transforme en <code>422 Unprocessable Entity</code> au format ProblemDetails, en laissant les autres exceptions au handler par défaut (500).`,
      hint: `<code>TryHandleAsync</code> renvoie <code>false</code> pour laisser passer l'exception au handler suivant. Enregistre-le avec <code>AddExceptionHandler&lt;T&gt;()</code> et garde <code>AddProblemDetails()</code> et <code>UseExceptionHandler()</code>.`,
      solution: `using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

public sealed class DomainException(string message) : Exception(message);

public sealed class DomainExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not DomainException domainException)
            return false; // pas pour nous : handler par défaut (500)

        httpContext.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;

        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status422UnprocessableEntity,
                Title = "Règle métier violée",
                Detail = domainException.Message
            }
        });
    }
}

// Program.cs
// builder.Services.AddProblemDetails();
// builder.Services.AddExceptionHandler<DomainExceptionHandler>();
// ...
// app.UseExceptionHandler();`
    }
  ],
  project: `<p>Transforme <code>OrderFlow.Api</code> en vraie API REST :</p>
<ul>
  <li>CRUD complet des commandes et ajout/suppression de lignes, avec DTO séparés des entités.</li>
  <li>Groupes <code>/customers</code>, <code>/products</code>, <code>/orders</code> avec <code>WithTags</code>.</li>
  <li><code>AddProblemDetails</code> + <code>DomainExceptionHandler</code>.</li>
  <li><code>AddOpenApi</code> et vérifie le document <code>/openapi/v1.json</code>.</li>
  <li>Écris un fichier <code>OrderFlow.Api.http</code> (format Visual Studio / Rider) qui appelle chaque endpoint.</li>
</ul>`,
  resources: [
    { label: "Vue d'ensemble des Minimal API", url: "https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis" },
    { label: "Routing dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/routing" },
    { label: "Gérer les erreurs dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/error-handling" },
    { label: "Documents OpenAPI dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/openapi/overview" }
  ]
});

/* ===================== JOUR 10 ===================== */
window.COURSE.push({
  day: 10, week: 2,
  title: "EF Core : DbContext, mapping, relations et migrations",
  summary: "Persister le domaine OrderFlow dans une base relationnelle avec EF Core et faire évoluer le schéma par migrations.",
  objectives: [
    "Configurer un DbContext et l'enregistrer dans la DI",
    "Mapper entités, relations un-à-plusieurs, enums et décimaux avec la Fluent API",
    "Créer, appliquer et relire des migrations"
  ],
  lesson: `
<h3>Ce qu'est EF Core</h3>
<p>Entity Framework Core est l'ORM officiel de .NET. Il traduit des requêtes LINQ en SQL, matérialise les lignes en objets et suit les modifications pour générer les <code>INSERT</code>, <code>UPDATE</code> et <code>DELETE</code> au moment de <code>SaveChangesAsync</code>. Un <code>DbContext</code> représente une <strong>unité de travail</strong> : une session avec la base, de courte durée, non thread-safe. Chaque <code>DbSet&lt;T&gt;</code> est un point d'entrée pour interroger une table.</p>

<h3>Choisir un provider</h3>
<ul>
  <li>SQL Server : package <code>Microsoft.EntityFrameworkCore.SqlServer</code>, méthode <code>UseSqlServer</code>.</li>
  <li>PostgreSQL : package <code>Npgsql.EntityFrameworkCore.PostgreSQL</code>, méthode <code>UseNpgsql</code>.</li>
  <li>SQLite : pratique pour les démos, à éviter pour les tests d'intégration (comportement différent du vrai serveur).</li>
</ul>
<p>Pour les migrations, il faut aussi <code>Microsoft.EntityFrameworkCore.Design</code> dans le projet de démarrage et l'outil <code>dotnet-ef</code> (<code>dotnet tool install --global dotnet-ef</code>).</p>

<h3>Configurer le modèle</h3>
<p>EF Core applique des <strong>conventions</strong> : une propriété <code>Id</code> devient la clé primaire, une propriété <code>CustomerId</code> à côté d'une navigation <code>Customer</code> devient la clé étrangère. Pour tout le reste, on utilise la <strong>Fluent API</strong> dans <code>OnModelCreating</code>, de préférence découpée en classes <code>IEntityTypeConfiguration&lt;T&gt;</code> chargées par <code>modelBuilder.ApplyConfigurationsFromAssembly(...)</code>. Les attributs (<code>[MaxLength]</code>, <code>[Required]</code>) fonctionnent aussi, mais ils polluent le domaine avec des détails de persistance.</p>
<ul>
  <li>Les <code>decimal</code> doivent avoir une précision explicite : <code>HasPrecision(18, 2)</code>. Sans cela, SQL Server prévient d'une troncature possible.</li>
  <li>Les enums sont stockés en entier par défaut. <code>HasConversion&lt;string&gt;()</code> les stocke en texte, plus lisible et plus robuste quand on réordonne l'enum.</li>
  <li>Une collection privée (<code>_lines</code>) exposée en <code>IReadOnlyList</code> se mappe via la navigation publique : EF Core découvre le champ de stockage par convention.</li>
</ul>

<h3>Les relations</h3>
<p>Un client a plusieurs commandes, une commande a plusieurs lignes. On configure depuis un côté : <code>HasMany(o =&gt; o.Lines).WithOne().HasForeignKey(l =&gt; l.OrderId).OnDelete(DeleteBehavior.Cascade)</code>. Les lignes appartiennent à la commande (agrégat) : on les supprime avec elle. Une commande ne doit en revanche pas disparaître quand on supprime un produit : <code>DeleteBehavior.Restrict</code>.</p>

<h3>Les migrations</h3>
<pre>dotnet ef migrations add InitialCreate --project OrderFlow.Infrastructure --startup-project OrderFlow.Api
dotnet ef database update --project OrderFlow.Infrastructure --startup-project OrderFlow.Api
dotnet ef migrations script --idempotent -o migrate.sql</pre>
<p>Une migration est une classe C# avec <code>Up</code> et <code>Down</code>, plus un snapshot du modèle. Relis toujours le code généré : un renommage de propriété peut être interprété comme une suppression puis un ajout de colonne, donc une perte de données.</p>

<h3>Pièges courants</h3>
<ul>
  <li>Appeler <code>Database.Migrate()</code> au démarrage en production avec plusieurs instances : deux instances migrent en même temps. Préfère un script SQL idempotent ou un bundle (<code>dotnet ef migrations bundle</code>) exécuté dans le pipeline de déploiement.</li>
  <li>Mettre la chaîne de connexion en dur : elle va dans la configuration (jour 12) et les secrets.</li>
  <li>Enregistrer le DbContext en Singleton : il doit rester Scoped (c'est le cas par défaut avec <code>AddDbContext</code>).</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : sache défendre où vit le DbContext (projet Infrastructure, pas Domain), pourquoi on garde le domaine sans attributs EF, comment tu déploies les migrations sans interruption (ajouter une colonne nullable, déployer, remplir, puis rendre obligatoire) et quand <code>AddDbContextPool</code> apporte un gain.</div>
`,
  examples: [
    {
      title: "Entités du domaine OrderFlow",
      code: `public enum OrderStatus { Draft, Placed, Paid, Shipped, Cancelled }

public sealed class Customer
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public required string Name { get; set; }
    public required string Email { get; set; }
}

public sealed class Product
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public required string Sku { get; set; }
    public required string Name { get; set; }
    public decimal UnitPrice { get; set; }
    public int Stock { get; set; }
}

public sealed class Order
{
    private readonly List<OrderLine> _lines = [];

    private Order() { } // constructeur pour EF Core
    public Order(Guid customerId) => CustomerId = customerId;

    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid CustomerId { get; private set; }
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
    public IReadOnlyList<OrderLine> Lines => _lines;
    public decimal Total => _lines.Sum(l => l.UnitPrice * l.Quantity);

    public void AddLine(Guid productId, int quantity, decimal unitPrice)
    {
        if (Status != OrderStatus.Draft)
            throw new DomainException("Seule une commande en brouillon peut être modifiée.");
        _lines.Add(new OrderLine(Id, productId, quantity, unitPrice));
    }
}

public sealed class OrderLine
{
    private OrderLine() { }
    public OrderLine(Guid orderId, Guid productId, int quantity, decimal unitPrice)
        => (OrderId, ProductId, Quantity, UnitPrice) = (orderId, productId, quantity, unitPrice);

    public int Id { get; private set; }
    public Guid OrderId { get; private set; }
    public Guid ProductId { get; private set; }
    public int Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
}`,
      explain: `Le domaine ne connaît pas EF Core. Les constructeurs privés sans paramètre permettent à EF de matérialiser les objets ; les setters privés protègent les invariants.`
    },
    {
      title: "DbContext et configurations Fluent",
      code: `using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public sealed class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options) : DbContext(options)
{
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(OrderFlowDbContext).Assembly);
}

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Status).HasConversion<string>().HasMaxLength(20);
        builder.Ignore(o => o.Total); // calculé, pas stocké

        builder.HasOne<Customer>()
               .WithMany()
               .HasForeignKey(o => o.CustomerId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Lines)
               .WithOne()
               .HasForeignKey(l => l.OrderId)
               .OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class OrderLineConfiguration : IEntityTypeConfiguration<OrderLine>
{
    public void Configure(EntityTypeBuilder<OrderLine> builder)
    {
        builder.ToTable("order_lines");
        builder.Property(l => l.UnitPrice).HasPrecision(18, 2);
        builder.HasOne<Product>().WithMany().HasForeignKey(l => l.ProductId).OnDelete(DeleteBehavior.Restrict);
    }
}`,
      explain: `Chaque entité a sa classe de configuration. <code>ApplyConfigurationsFromAssembly</code> les découvre toutes, ce qui garde <code>OnModelCreating</code> court.`
    },
    {
      title: "Enregistrement et premier endpoint persistant",
      code: `// appsettings.Development.json
// { "ConnectionStrings": { "OrderFlow": "Host=localhost;Database=orderflow;Username=app;Password=app" } }

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<OrderFlowDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("OrderFlow")));
// SQL Server : options.UseSqlServer(...)

var app = builder.Build();

app.MapPost("/customers", async (CreateCustomerRequest request, OrderFlowDbContext db, CancellationToken ct) =>
{
    var customer = new Customer { Name = request.Name, Email = request.Email };
    db.Customers.Add(customer);
    await db.SaveChangesAsync(ct); // un seul INSERT
    return TypedResults.Created($"/customers/{customer.Id}", customer);
});

app.Run();

public sealed record CreateCustomerRequest(string Name, string Email);

// Terminal :
// dotnet ef migrations add InitialCreate
// dotnet ef database update`,
      explain: `<code>AddDbContext</code> enregistre le contexte en Scoped. Pour lancer PostgreSQL rapidement : <code>docker run -e POSTGRES_USER=app -e POSTGRES_PASSWORD=app -p 5432:5432 postgres</code>.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Configurer Product",
      prompt: `Écris <code>ProductConfiguration</code> : table <code>products</code>, <code>Sku</code> obligatoire de 32 caractères max avec un index unique, <code>Name</code> de 200 caractères max, <code>UnitPrice</code> en précision 18,2.`,
      hint: `<code>builder.HasIndex(p =&gt; p.Sku).IsUnique()</code>.`,
      solution: `public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");
        builder.Property(p => p.Sku).IsRequired().HasMaxLength(32);
        builder.HasIndex(p => p.Sku).IsUnique();
        builder.Property(p => p.Name).IsRequired().HasMaxLength(200);
        builder.Property(p => p.UnitPrice).HasPrecision(18, 2);
    }
}`
    },
    {
      level: "moyen",
      title: "Données de référence",
      prompt: `Ajoute trois produits de départ avec <code>HasData</code>, puis crée la migration correspondante. Pourquoi faut-il des identifiants fixes ?`,
      hint: `Avec <code>HasData</code>, EF compare les valeurs entre deux migrations : un <code>Guid.NewGuid()</code> générerait une nouvelle ligne à chaque migration. Utilise des Guid littéraux et un type anonyme si les setters sont privés.`,
      solution: `// Dans ProductConfiguration.Configure
builder.HasData(
    new { Id = Guid.Parse("8f1c2a51-6a3e-4c2e-9d1b-1a2b3c4d5e01"), Sku = "KB-001", Name = "Clavier", UnitPrice = 49.90m, Stock = 100 },
    new { Id = Guid.Parse("8f1c2a51-6a3e-4c2e-9d1b-1a2b3c4d5e02"), Sku = "MS-001", Name = "Souris", UnitPrice = 19.90m, Stock = 250 },
    new { Id = Guid.Parse("8f1c2a51-6a3e-4c2e-9d1b-1a2b3c4d5e03"), Sku = "SC-027", Name = "Écran 27 pouces", UnitPrice = 229.00m, Stock = 30 });

// Terminal :
// dotnet ef migrations add SeedProducts
// Les identifiants sont fixes pour que la migration suivante ne supprime pas
// puis ne recrée pas les lignes : EF compare les données du snapshot.`
    },
    {
      level: "difficile",
      title: "Créer une commande complète en une transaction",
      prompt: `Écris <code>POST /orders</code> qui reçoit <code>CreateOrderRequest(Guid CustomerId, List&lt;LineRequest&gt; Lines)</code>. Vérifie que le client existe, charge tous les produits demandés <strong>en une seule requête</strong>, refuse les produits inconnus (400), prend le prix depuis la base (jamais depuis le client) et enregistre la commande et ses lignes en un seul <code>SaveChangesAsync</code>.`,
      hint: `<code>db.Products.Where(p =&gt; ids.Contains(p.Id)).ToDictionaryAsync(p =&gt; p.Id, ct)</code>. Un seul <code>SaveChangesAsync</code> est déjà transactionnel.`,
      solution: `public sealed record LineRequest(Guid ProductId, int Quantity);
public sealed record CreateOrderRequest(Guid CustomerId, List<LineRequest> Lines);

app.MapPost("/orders", async Task<Results<Created<OrderDto>, ValidationProblem, NotFound>> (
    CreateOrderRequest request, OrderFlowDbContext db, CancellationToken ct) =>
{
    if (!await db.Customers.AnyAsync(c => c.Id == request.CustomerId, ct))
        return TypedResults.NotFound();

    var ids = request.Lines.Select(l => l.ProductId).Distinct().ToList();
    var products = await db.Products
        .Where(p => ids.Contains(p.Id))
        .ToDictionaryAsync(p => p.Id, ct); // une seule requête SQL

    var unknown = ids.Where(id => !products.ContainsKey(id)).ToList();
    if (unknown.Count > 0)
        return TypedResults.ValidationProblem(new Dictionary<string, string[]>
        {
            ["Lines"] = [$"Produits inconnus : {string.Join(", ", unknown)}"]
        });

    var order = new Order(request.CustomerId);
    foreach (var line in request.Lines)
        order.AddLine(line.ProductId, line.Quantity, products[line.ProductId].UnitPrice);

    db.Orders.Add(order);
    await db.SaveChangesAsync(ct); // INSERT commande + lignes dans une transaction

    return TypedResults.Created($"/orders/{order.Id}", OrderDto.From(order));
});`
    }
  ],
  project: `<p>Remplace le repository en mémoire par EF Core :</p>
<ul>
  <li>Crée <code>OrderFlow.Infrastructure</code> avec le DbContext et les configurations ; le domaine reste sans référence à EF.</li>
  <li>Lance PostgreSQL (ou SQL Server) avec Docker, crée la migration <code>InitialCreate</code> et applique-la.</li>
  <li>Ouvre la base avec un client SQL et vérifie les tables, index et clés étrangères générés.</li>
  <li>Implémente <code>POST /orders</code> de l'exercice difficile.</li>
</ul>`,
  resources: [
    { label: "Documentation EF Core", url: "https://learn.microsoft.com/ef/core/" },
    { label: "Relations dans EF Core", url: "https://learn.microsoft.com/ef/core/modeling/relationships" },
    { label: "Migrations EF Core", url: "https://learn.microsoft.com/ef/core/managing-schemas/migrations/" }
  ]
});

/* ===================== JOUR 11 ===================== */
window.COURSE.push({
  day: 11, week: 2,
  title: "EF Core avancé : tracking, N+1, transactions et concurrence",
  summary: "Écrire des requêtes EF Core rapides et sûres, et savoir lire le SQL généré.",
  objectives: [
    "Distinguer les requêtes avec et sans tracking, et projeter vers des DTO",
    "Détecter et corriger le problème N+1",
    "Gérer transactions, opérations en masse et conflits de concurrence"
  ],
  lesson: `
<h3>Le change tracker</h3>
<p>Par défaut, chaque entité chargée est suivie par le <code>DbContext</code> : EF garde une copie de ses valeurs d'origine et, au <code>SaveChangesAsync</code>, compare pour générer les <code>UPDATE</code>. C'est pratique pour modifier, coûteux pour lire. Pour une lecture seule, ajoute <code>AsNoTracking()</code>, ou mieux, projette directement vers un DTO avec <code>Select</code> : EF ne suit pas les types non-entités et ne lit que les colonnes demandées.</p>

<h3>Le problème N+1</h3>
<p>Il apparaît quand on charge une liste puis qu'on fait une requête par élément pour ses enfants. Avec 200 commandes, on obtient 201 allers-retours vers la base. Les causes classiques : une boucle qui appelle la base, ou le lazy loading activé. Les corrections :</p>
<ul>
  <li><code>Include(o =&gt; o.Lines)</code> charge les enfants dans la même requête (jointure).</li>
  <li>Une projection <code>Select(o =&gt; new { o.Id, Lines = o.Lines.Select(...) })</code> laisse EF générer une requête optimale.</li>
  <li><code>AsSplitQuery()</code> découpe en plusieurs requêtes quand plusieurs <code>Include</code> de collections provoquent une explosion cartésienne.</li>
</ul>

<h3>Voir le SQL</h3>
<p><code>query.ToQueryString()</code> renvoie le SQL d'une requête sans l'exécuter. Pour tout voir, active les logs : <code>options.LogTo(Console.WriteLine, LogLevel.Information)</code>, ou la catégorie <code>Microsoft.EntityFrameworkCore.Database.Command</code> dans la configuration de logging. <code>EnableSensitiveDataLogging()</code> affiche les valeurs des paramètres : uniquement en développement.</p>

<h3>Opérations en masse</h3>
<p><code>ExecuteUpdateAsync</code> et <code>ExecuteDeleteAsync</code> (depuis EF Core 7) exécutent un seul <code>UPDATE</code> ou <code>DELETE</code> en base sans charger les entités. Attention : ils contournent le change tracker et ne déclenchent pas ta logique de domaine ni les intercepteurs de <code>SaveChanges</code>.</p>

<h3>Transactions</h3>
<p>Un <code>SaveChangesAsync</code> est déjà atomique. On ouvre une transaction explicite (<code>await db.Database.BeginTransactionAsync(ct)</code>) seulement quand plusieurs <code>SaveChangesAsync</code> ou des <code>ExecuteUpdateAsync</code> doivent réussir ou échouer ensemble. Si tu actives la résilience (<code>EnableRetryOnFailure</code>), une transaction manuelle doit être enveloppée dans <code>db.Database.CreateExecutionStrategy().ExecuteAsync(...)</code>.</p>

<h3>Concurrence optimiste</h3>
<p>Deux utilisateurs modifient la même commande : sans protection, le dernier écrase le premier. On ajoute un <strong>jeton de concurrence</strong> : sous SQL Server une colonne <code>rowversion</code> (<code>[Timestamp] byte[]</code> ou <code>IsRowVersion()</code>), et de façon portable une propriété marquée <code>IsConcurrencyToken()</code> que l'on change à chaque modification. EF ajoute alors <code>WHERE Version = @original</code> à l'<code>UPDATE</code> ; si aucune ligne n'est touchée, il lève <code>DbUpdateConcurrencyException</code>, que l'API traduit en <code>409 Conflict</code>.</p>

<h3>Pièges courants</h3>
<ul>
  <li>Appeler <code>ToList()</code> trop tôt puis filtrer en mémoire : tout la table est rapatriée.</li>
  <li>Utiliser une méthode C# non traduisible dans un <code>Where</code> : EF lève une exception de traduction. C'est voulu ; ne la contourne pas en matérialisant tout.</li>
  <li>Pagination par <code>Skip</code> sur de gros volumes : coût proportionnel à la profondeur. Préfère la pagination par curseur (keyset).</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : lis le SQL de chaque requête importante, connais ses index, et sache expliquer le compromis entre requête unique (jointures, duplication des lignes parent) et requêtes découpées (plusieurs allers-retours, cohérence non garantie sans transaction). Pour les écrans de lecture complexes, n'hésite pas à sortir d'EF (SQL brut ou Dapper, jour 14).</div>
`,
  examples: [
    {
      title: "N+1 puis correction",
      code: `// MAUVAIS : 1 requête pour les commandes + 1 requête par commande
var orders = await db.Orders.AsNoTracking().ToListAsync(ct);
foreach (var order in orders)
{
    var count = await db.Set<OrderLine>().CountAsync(l => l.OrderId == order.Id, ct);
    Console.WriteLine($"{order.Id} : {count} lignes");
}

// BON : une seule requête, projection vers ce dont l'écran a besoin
var summaries = await db.Orders
    .Where(o => o.Status == OrderStatus.Placed)
    .OrderByDescending(o => o.CreatedAt)
    .Select(o => new OrderSummaryDto(
        o.Id,
        o.CreatedAt,
        o.Lines.Count,
        o.Lines.Sum(l => l.UnitPrice * l.Quantity)))
    .ToListAsync(ct);

public sealed record OrderSummaryDto(Guid Id, DateTimeOffset CreatedAt, int LineCount, decimal Total);`,
      explain: `La projection est traduite en une seule requête SQL avec sous-requêtes ; aucune entité n'est suivie.`
    },
    {
      title: "Lire le SQL généré",
      code: `// Program.cs (Development uniquement)
builder.Services.AddDbContext<OrderFlowDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("OrderFlow"));
    if (builder.Environment.IsDevelopment())
    {
        options.LogTo(Console.WriteLine, LogLevel.Information);
        options.EnableSensitiveDataLogging();
    }
});

// Ailleurs : afficher le SQL d'une requête sans l'exécuter
var query = db.Orders
    .Include(o => o.Lines)
    .Where(o => o.CustomerId == customerId);

Console.WriteLine(query.ToQueryString());

// Plusieurs collections incluses : éviter l'explosion cartésienne
var heavy = await query.AsSplitQuery().ToListAsync(ct);`,
      explain: `<code>ToQueryString()</code> est l'outil le plus rapide pour comprendre ce qu'EF envoie réellement à la base.`
    },
    {
      title: "Concurrence optimiste portable",
      code: `// Dans Order
public Guid Version { get; private set; } = Guid.NewGuid();
public void Place()
{
    if (Status != OrderStatus.Draft) throw new DomainException("Commande déjà passée.");
    Status = OrderStatus.Placed;
    Version = Guid.NewGuid(); // nouvelle version à chaque modification
}

// Dans OrderConfiguration
builder.Property(o => o.Version).IsConcurrencyToken();

// Endpoint : le client renvoie la version qu'il a lue
app.MapPost("/orders/{id:guid}/place", async Task<Results<NoContent, NotFound, Conflict<string>>> (
    Guid id, Guid version, OrderFlowDbContext db, CancellationToken ct) =>
{
    var order = await db.Orders.FirstOrDefaultAsync(o => o.Id == id, ct);
    if (order is null) return TypedResults.NotFound();

    // On indique à EF la version connue du client
    db.Entry(order).Property(o => o.Version).OriginalValue = version;
    order.Place();

    try
    {
        await db.SaveChangesAsync(ct); // UPDATE ... WHERE Id = @id AND Version = @version
        return TypedResults.NoContent();
    }
    catch (DbUpdateConcurrencyException)
    {
        return TypedResults.Conflict("La commande a été modifiée par quelqu'un d'autre. Recharge-la.");
    }
});`,
      explain: `Sous SQL Server, une colonne <code>rowversion</code> (<code>IsRowVersion()</code>) évite de gérer la version à la main.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lecture sans tracking",
      prompt: `Réécris cette requête pour qu'elle ne suive aucune entité et ne lise que le nom et l'email des clients dont l'email se termine par <code>@acme.com</code> :<br><code>var customers = await db.Customers.ToListAsync(); var acme = customers.Where(c =&gt; c.Email.EndsWith("@acme.com"));</code>`,
      hint: `Filtre avant <code>ToListAsync</code> et projette avec <code>Select</code>.`,
      solution: `var acme = await db.Customers
    .Where(c => c.Email.EndsWith("@acme.com")) // traduit en LIKE '%@acme.com'
    .Select(c => new { c.Name, c.Email })      // projection : pas de tracking
    .ToListAsync(ct);`
    },
    {
      level: "moyen",
      title: "Pagination par curseur",
      prompt: `Écris <code>GET /orders/feed?after={createdAt}&amp;afterId={id}&amp;size=50</code> qui renvoie les commandes triées par <code>CreatedAt</code> décroissant puis <code>Id</code>, en utilisant une pagination par curseur au lieu de <code>Skip</code>. Renvoie aussi le curseur de la page suivante.`,
      hint: `Condition : <code>o.CreatedAt &lt; after || (o.CreatedAt == after &amp;&amp; o.Id.CompareTo(afterId) &lt; 0)</code>. Un index sur <code>(CreatedAt, Id)</code> rend la requête rapide quelle que soit la profondeur.`,
      solution: `app.MapGet("/orders/feed", async (DateTimeOffset? after, Guid? afterId, int size, OrderFlowDbContext db, CancellationToken ct) =>
{
    size = Math.Clamp(size, 1, 100);
    var query = db.Orders.AsNoTracking();

    if (after is not null && afterId is not null)
    {
        var a = after.Value;
        var id = afterId.Value;
        query = query.Where(o => o.CreatedAt < a || (o.CreatedAt == a && o.Id.CompareTo(id) < 0));
    }

    var items = await query
        .OrderByDescending(o => o.CreatedAt).ThenByDescending(o => o.Id)
        .Take(size)
        .Select(o => new { o.Id, o.CreatedAt, o.Status })
        .ToListAsync(ct);

    var last = items.LastOrDefault();
    return TypedResults.Ok(new
    {
        items,
        next = last is null ? null : new { after = last.CreatedAt, afterId = last.Id }
    });
});

// Dans OrderConfiguration :
// builder.HasIndex(o => new { o.CreatedAt, o.Id });`
    },
    {
      level: "difficile",
      title: "Annulation en masse et remise en stock",
      prompt: `Écris un service <code>CancelStaleOrdersAsync</code> qui annule toutes les commandes <code>Placed</code> de plus de 7 jours et remet en stock les quantités de leurs lignes. Les deux opérations doivent être atomiques et ne pas charger les entités en mémoire.`,
      hint: `Une transaction explicite autour de deux <code>ExecuteUpdateAsync</code>. Mets d'abord à jour le stock (tant que les commandes sont encore <code>Placed</code>), puis le statut. Enveloppe le tout dans la stratégie d'exécution si le retry est activé.`,
      solution: `public sealed class StaleOrderCleaner(OrderFlowDbContext db, TimeProvider clock)
{
    public async Task<int> CancelStaleOrdersAsync(CancellationToken ct)
    {
        var limit = clock.GetUtcNow().AddDays(-7);
        var strategy = db.Database.CreateExecutionStrategy();

        return await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await db.Database.BeginTransactionAsync(ct);

            var stale = db.Orders.Where(o => o.Status == OrderStatus.Placed && o.CreatedAt < limit);

            // 1. Remise en stock : un seul UPDATE avec sous-requête
            await db.Products.ExecuteUpdateAsync(s => s.SetProperty(
                p => p.Stock,
                p => p.Stock + db.Set<OrderLine>()
                    .Where(l => l.ProductId == p.Id && stale.Any(o => o.Id == l.OrderId))
                    .Sum(l => l.Quantity)), ct);

            // 2. Changement de statut : un seul UPDATE
            var cancelled = await stale.ExecuteUpdateAsync(
                s => s.SetProperty(o => o.Status, OrderStatus.Cancelled), ct);

            await transaction.CommitAsync(ct);
            return cancelled;
        });
    }
}

// Limite : met à jour toutes les lignes produits ; filtrer les produits concernés si la table est grosse.
// builder.Services.AddSingleton(TimeProvider.System);
// builder.Services.AddScoped<StaleOrderCleaner>();`
    }
  ],
  project: `<p>Audite les requêtes d'<code>OrderFlow.Api</code> :</p>
<ul>
  <li>Active <code>LogTo</code> en Development et appelle chaque endpoint : note le nombre de requêtes SQL par appel.</li>
  <li>Toutes les lectures passent par des projections ou <code>AsNoTracking</code>.</li>
  <li>Ajoute la concurrence optimiste sur <code>Order</code> et renvoie <code>409</code> en cas de conflit.</li>
  <li>Ajoute l'endpoint <code>/orders/feed</code> avec son index et vérifie le plan d'exécution (<code>EXPLAIN</code> sous PostgreSQL).</li>
</ul>`,
  resources: [
    { label: "Requêtes avec ou sans tracking", url: "https://learn.microsoft.com/ef/core/querying/tracking" },
    { label: "Charger les données liées", url: "https://learn.microsoft.com/ef/core/querying/related-data/" },
    { label: "Gérer les conflits de concurrence", url: "https://learn.microsoft.com/ef/core/saving/concurrency" },
    { label: "Performance EF Core", url: "https://learn.microsoft.com/ef/core/performance/" }
  ]
});

/* ===================== JOUR 12 ===================== */
window.COURSE.push({
  day: 12, week: 2,
  title: "Configuration, Options pattern, logging et environnements",
  summary: "Externaliser toute la configuration, la valider au démarrage et produire des logs structurés exploitables.",
  objectives: [
    "Comprendre l'ordre des sources de configuration et les environnements",
    "Lier et valider une section de configuration avec le pattern Options",
    "Écrire des logs structurés avec ILogger et Serilog"
  ],
  lesson: `
<h3>Les sources de configuration</h3>
<p><code>WebApplication.CreateBuilder</code> charge par défaut, dans cet ordre : <code>appsettings.json</code>, <code>appsettings.{Environment}.json</code>, les <strong>user secrets</strong> (en Development seulement), les variables d'environnement, puis les arguments de ligne de commande. La dernière source qui définit une clé gagne. Les clés sont hiérarchiques avec <code>:</code> (<code>Jwt:Key</code>) ; dans une variable d'environnement, on remplace <code>:</code> par deux underscores (<code>Jwt__Key</code>), ce qui est la façon standard de configurer un conteneur Docker ou Kubernetes.</p>

<h3>Les environnements</h3>
<p>La variable <code>ASPNETCORE_ENVIRONMENT</code> (ou <code>DOTNET_ENVIRONMENT</code>) vaut <code>Development</code>, <code>Staging</code>, <code>Production</code> ou une valeur à toi. Sans valeur, c'est <code>Production</code>. Dans le code : <code>app.Environment.IsDevelopment()</code>. En local, elle est définie par <code>Properties/launchSettings.json</code>.</p>

<h3>Les secrets</h3>
<p>Ne jamais committer de mot de passe ou de clé. En local : <code>dotnet user-secrets init</code> puis <code>dotnet user-secrets set "Jwt:Key" "..."</code> ; les valeurs sont stockées dans ton profil utilisateur, hors du dépôt. En production : variables d'environnement injectées par la plateforme, ou un coffre (Azure Key Vault, AWS Secrets Manager) branché comme source de configuration.</p>

<h3>Le pattern Options</h3>
<p>Plutôt que de lire <code>configuration["Orders:MaxLines"]</code> partout, on lie une section à une classe typée et on l'injecte. Trois interfaces :</p>
<ul>
  <li><code>IOptions&lt;T&gt;</code> : lu une fois, Singleton. Le cas le plus courant.</li>
  <li><code>IOptionsSnapshot&lt;T&gt;</code> : relu à chaque requête (Scoped), prend en compte les modifications du fichier.</li>
  <li><code>IOptionsMonitor&lt;T&gt;</code> : Singleton avec notification de changement (<code>OnChange</code>), utilisable dans les services Singleton.</li>
</ul>
<p><code>AddOptions&lt;T&gt;().Bind(...).ValidateDataAnnotations().ValidateOnStart()</code> fait échouer l'application <strong>au démarrage</strong> si la configuration est invalide, au lieu d'échouer à la première requête en production.</p>

<h3>Le logging</h3>
<p><code>ILogger&lt;T&gt;</code> est injecté partout. Utilise des <strong>message templates</strong> : <code>logger.LogInformation("Commande {OrderId} payée", order.Id)</code>, jamais d'interpolation <code>$"..."</code>. Le template permet aux outils (Seq, Elastic, Application Insights) d'indexer <code>OrderId</code> comme un champ et de regrouper les messages identiques. Les niveaux : Trace, Debug, Information, Warning, Error, Critical ; on les règle par catégorie dans la section <code>Logging:LogLevel</code>.</p>
<p>Serilog est le choix le plus répandu pour envoyer les logs vers fichiers, Seq ou Elastic. Il se branche via <code>Serilog.AspNetCore</code> et se configure depuis <code>appsettings.json</code>. <code>UseSerilogRequestLogging()</code> remplace les nombreux logs de requête par une seule ligne récapitulative.</p>
<p>Pour les chemins très sollicités, le générateur de source <code>[LoggerMessage]</code> produit des méthodes de log sans allocation.</p>

<h3>Pièges courants</h3>
<ul>
  <li>Logger des données sensibles (mots de passe, tokens, données personnelles) : risque RGPD et de fuite.</li>
  <li>Injecter <code>IOptionsSnapshot</code> dans un Singleton : dépendance captive, exception au démarrage en Development.</li>
  <li>Oublier que <code>appsettings.Development.json</code> n'est pas lu en Production : une valeur absente devient <code>null</code> sans bruit, d'où l'intérêt de <code>ValidateOnStart</code>.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : une application bien configurée démarre ou refuse de démarrer, jamais entre les deux. Valide toute la configuration au démarrage, sépare les réglages (fichiers versionnés) des secrets (coffre), et pense aux logs comme à une API : des noms de champs stables, un identifiant de corrélation et des niveaux justes, pour qu'un incident se diagnostique en minutes.</div>
`,
  examples: [
    {
      title: "Options typées et validées au démarrage",
      code: `using System.ComponentModel.DataAnnotations;

// appsettings.json
// "OrderRules": { "MaxLinesPerOrder": 50, "DraftExpirationDays": 7, "Currency": "EUR" }

public sealed class OrderRulesOptions
{
    public const string SectionName = "OrderRules";

    [Range(1, 500)]
    public int MaxLinesPerOrder { get; init; }

    [Range(1, 90)]
    public int DraftExpirationDays { get; init; }

    [Required, StringLength(3, MinimumLength = 3)]
    public string Currency { get; init; } = "";
}

// Program.cs
builder.Services.AddOptions<OrderRulesOptions>()
    .Bind(builder.Configuration.GetSection(OrderRulesOptions.SectionName))
    .ValidateDataAnnotations()
    .ValidateOnStart(); // l'application ne démarre pas si la config est invalide

// Utilisation
public sealed class OrderService(IOptions<OrderRulesOptions> options)
{
    private readonly OrderRulesOptions _rules = options.Value;

    public void EnsureCanAddLine(Order order)
    {
        if (order.Lines.Count >= _rules.MaxLinesPerOrder)
            throw new DomainException($"Maximum {_rules.MaxLinesPerOrder} lignes par commande.");
    }
}`,
      explain: `Sans <code>ValidateOnStart</code>, la validation ne s'exécute qu'au premier accès à <code>options.Value</code>.`
    },
    {
      title: "Serilog configuré depuis appsettings.json",
      code: `// dotnet add package Serilog.AspNetCore
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, loggerConfiguration) =>
    loggerConfiguration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console());

var app = builder.Build();

app.UseSerilogRequestLogging(); // une ligne par requête : méthode, chemin, statut, durée

app.MapPost("/orders/{id:guid}/pay", (Guid id, ILogger<Program> logger) =>
{
    // Template : OrderId devient un champ indexable
    logger.LogInformation("Paiement reçu pour la commande {OrderId}", id);
    return TypedResults.NoContent();
});

app.Run();

// appsettings.json
// "Serilog": {
//   "MinimumLevel": {
//     "Default": "Information",
//     "Override": { "Microsoft.AspNetCore": "Warning", "Microsoft.EntityFrameworkCore": "Warning" }
//   }
// }`,
      explain: `<code>Enrich.FromLogContext()</code> ajoute aux logs les propriétés posées par <code>BeginScope</code>, comme le <code>CorrelationId</code> du jour 8.`
    },
    {
      title: "Logs à haute performance avec [LoggerMessage]",
      code: `public static partial class OrderLogs
{
    [LoggerMessage(Level = LogLevel.Information, Message = "Commande {OrderId} passée par le client {CustomerId} pour {Total} EUR")]
    public static partial void OrderPlaced(this ILogger logger, Guid orderId, Guid customerId, decimal total);

    [LoggerMessage(Level = LogLevel.Warning, Message = "Stock insuffisant pour le produit {ProductId} : demandé {Requested}, disponible {Available}")]
    public static partial void StockTooLow(this ILogger logger, Guid productId, int requested, int available);
}

// Utilisation
logger.OrderPlaced(order.Id, order.CustomerId, order.Total);`,
      explain: `Le générateur de source écrit le code de log à la compilation : pas de boxing ni de parsing du template à l'exécution.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Chaîne de connexion par variable d'environnement",
      prompt: `Ta chaîne de connexion est lue avec <code>GetConnectionString("OrderFlow")</code>. Écris la variable d'environnement qui la surcharge dans un conteneur Docker, et la commande <code>user-secrets</code> équivalente en local.`,
      hint: `<code>GetConnectionString("X")</code> lit la clé <code>ConnectionStrings:X</code>.`,
      solution: `// Variable d'environnement (Docker, Kubernetes, Azure App Service...)
// ConnectionStrings__OrderFlow=Host=db;Database=orderflow;Username=app;Password=secret

// En local, hors du dépôt Git :
// dotnet user-secrets init
// dotnet user-secrets set "ConnectionStrings:OrderFlow" "Host=localhost;Database=orderflow;Username=app;Password=app"`
    },
    {
      level: "moyen",
      title: "Validation croisée d'options",
      prompt: `Ajoute à <code>OrderRulesOptions</code> les propriétés <code>MinOrderAmount</code> et <code>FreeShippingThreshold</code>. Fais échouer le démarrage si <code>FreeShippingThreshold</code> est inférieur à <code>MinOrderAmount</code>, avec un message clair.`,
      hint: `Les DataAnnotations ne comparent pas deux propriétés. Utilise <code>.Validate(o =&gt; condition, "message")</code> dans la chaîne <code>AddOptions</code>.`,
      solution: `public sealed class OrderRulesOptions
{
    public const string SectionName = "OrderRules";

    [Range(1, 500)] public int MaxLinesPerOrder { get; init; }
    [Range(0, 10_000)] public decimal MinOrderAmount { get; init; }
    [Range(0, 10_000)] public decimal FreeShippingThreshold { get; init; }
}

builder.Services.AddOptions<OrderRulesOptions>()
    .Bind(builder.Configuration.GetSection(OrderRulesOptions.SectionName))
    .ValidateDataAnnotations()
    .Validate(o => o.FreeShippingThreshold >= o.MinOrderAmount,
        "OrderRules:FreeShippingThreshold doit être supérieur ou égal à OrderRules:MinOrderAmount.")
    .ValidateOnStart();`
    },
    {
      level: "difficile",
      title: "Options rechargeables dans un Singleton",
      prompt: `Un service Singleton <code>MaintenanceGate</code> doit bloquer les commandes quand <code>Maintenance:Enabled</code> passe à <code>true</code> dans <code>appsettings.json</code>, <strong>sans redémarrer</strong> l'application, et logger chaque changement. Écris le service, son enregistrement et un middleware qui renvoie <code>503</code> sur les routes <code>/orders</code> pendant la maintenance.`,
      hint: `Seul <code>IOptionsMonitor&lt;T&gt;</code> convient à un Singleton. <code>CurrentValue</code> donne la valeur à jour ; <code>OnChange</code> renvoie un <code>IDisposable</code> à libérer.`,
      solution: `public sealed class MaintenanceOptions
{
    public bool Enabled { get; init; }
    public string Message { get; init; } = "Maintenance en cours";
}

public sealed class MaintenanceGate : IDisposable
{
    private readonly IOptionsMonitor<MaintenanceOptions> _monitor;
    private readonly IDisposable? _subscription;

    public MaintenanceGate(IOptionsMonitor<MaintenanceOptions> monitor, ILogger<MaintenanceGate> logger)
    {
        _monitor = monitor;
        _subscription = monitor.OnChange(o =>
            logger.LogWarning("Mode maintenance : {Enabled}", o.Enabled));
    }

    public MaintenanceOptions Current => _monitor.CurrentValue;

    public void Dispose() => _subscription?.Dispose();
}

// Program.cs
builder.Services.Configure<MaintenanceOptions>(builder.Configuration.GetSection("Maintenance"));
builder.Services.AddSingleton<MaintenanceGate>();

var app = builder.Build();

app.Use(async (context, next) =>
{
    var gate = context.RequestServices.GetRequiredService<MaintenanceGate>();
    if (gate.Current.Enabled && context.Request.Path.StartsWithSegments("/orders"))
    {
        context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
        context.Response.Headers.RetryAfter = "120";
        await context.Response.WriteAsJsonAsync(new { error = gate.Current.Message });
        return;
    }
    await next(context);
});

// appsettings.json est rechargé automatiquement (reloadOnChange vaut true par défaut).`
    }
  ],
  project: `<p>Externalise toute la configuration d'<code>OrderFlow.Api</code> :</p>
<ul>
  <li>Chaîne de connexion dans les user secrets, plus aucune valeur sensible dans le dépôt.</li>
  <li><code>OrderRulesOptions</code> validées au démarrage et utilisées par le service de commandes.</li>
  <li>Serilog vers la console, avec <code>UseSerilogRequestLogging</code> et le <code>CorrelationId</code> du jour 8 dans chaque log.</li>
  <li>Un <code>appsettings.Production.json</code> qui réduit le niveau de log à <code>Warning</code> pour EF Core et ASP.NET Core.</li>
</ul>`,
  resources: [
    { label: "Configuration dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/configuration/" },
    { label: "Pattern Options dans .NET", url: "https://learn.microsoft.com/dotnet/core/extensions/options" },
    { label: "Stockage sécurisé des secrets en développement", url: "https://learn.microsoft.com/aspnet/core/security/app-secrets" },
    { label: "Logging dans .NET", url: "https://learn.microsoft.com/dotnet/core/extensions/logging" }
  ]
});

/* ===================== JOUR 13 ===================== */
window.COURSE.push({
  day: 13, week: 2,
  title: "Authentification JWT, autorisation par policies et CORS",
  summary: "Sécuriser OrderFlow.Api avec des tokens JWT, des règles d'autorisation et l'ouvrir proprement au front Angular.",
  objectives: [
    "Différencier authentification et autorisation et les placer correctement dans le pipeline",
    "Émettre et valider des JWT, puis écrire des policies et une autorisation par ressource",
    "Configurer CORS pour un front Angular et envoyer le token depuis un interceptor"
  ],
  lesson: `
<h3>Authentification et autorisation</h3>
<p>L'<strong>authentification</strong> répond à « qui es-tu ? » : un handler lit une preuve (cookie, token) et construit un <code>ClaimsPrincipal</code> (<code>HttpContext.User</code>). L'<strong>autorisation</strong> répond à « as-tu le droit ? » : elle évalue des policies sur ce principal. Dans le pipeline : <code>UseAuthentication()</code> puis <code>UseAuthorization()</code>, toujours dans cet ordre. Un utilisateur non authentifié reçoit <code>401</code> ; un utilisateur authentifié sans droit reçoit <code>403</code>.</p>

<h3>Les JWT</h3>
<p>Un JSON Web Token est composé de trois parties encodées en Base64Url : en-tête, contenu (les <strong>claims</strong> : <code>sub</code>, <code>email</code>, <code>role</code>, <code>exp</code>...) et signature. Le serveur vérifie la signature, l'émetteur (<code>iss</code>), l'audience (<code>aud</code>) et l'expiration. Le contenu est lisible par n'importe qui : n'y mets jamais de secret. Le package <code>Microsoft.AspNetCore.Authentication.JwtBearer</code> fournit le handler de validation.</p>
<ul>
  <li>Durée courte pour le token d'accès (5 à 15 minutes), et un refresh token stocké côté serveur pour en obtenir un nouveau.</li>
  <li>En entreprise, on délègue souvent l'émission à un fournisseur d'identité (Entra ID, Keycloak, Auth0) : l'API ne fait que valider, avec <code>options.Authority</code>.</li>
  <li>ASP.NET Core Identity gère utilisateurs, hachage des mots de passe et verrouillage. Depuis .NET 8, <code>AddIdentityApiEndpoints&lt;TUser&gt;()</code> et <code>MapIdentityApi&lt;TUser&gt;()</code> exposent register/login prêts à l'emploi.</li>
</ul>

<h3>Les policies</h3>
<p>Une policy regroupe des exigences : rôle, claim, ou logique sur mesure. On l'applique avec <code>RequireAuthorization("NomPolicy")</code> sur un endpoint ou un groupe, ou <code>[Authorize(Policy = "...")]</code> sur un controller. <code>AllowAnonymous()</code> ouvre un endpoint précis dans un groupe protégé. Pour une règle qui dépend de la donnée (« seul le propriétaire voit sa commande »), on écrit un <code>AuthorizationHandler&lt;TRequirement, TResource&gt;</code> et on l'appelle via <code>IAuthorizationService.AuthorizeAsync(user, resource, policy)</code>.</p>

<h3>CORS</h3>
<p>Ton front Angular sur <code>http://localhost:4200</code> appelle l'API sur un autre port : c'est une autre origine. Le navigateur envoie une requête préliminaire <code>OPTIONS</code> et bloque la réponse si l'API n'autorise pas l'origine. CORS est une protection <strong>du navigateur</strong>, pas de l'API : il n'empêche pas un script serveur ou Postman d'appeler ton API. On déclare une policy avec les origines exactes, puis <code>app.UseCors("Front")</code> <strong>avant</strong> l'authentification.</p>

<h3>Pièges courants</h3>
<ul>
  <li><code>AllowAnyOrigin()</code> avec <code>AllowCredentials()</code> : interdit par la spécification, et dangereux.</li>
  <li>Clé de signature HMAC trop courte ou committée : il faut au moins 256 bits pour HS256, stockée en secret.</li>
  <li>Désactiver <code>ValidateLifetime</code> ou <code>ValidateAudience</code> « pour que ça marche » en développement, puis l'oublier.</li>
  <li>Stocker le token dans <code>localStorage</code> expose au vol par XSS. Pour une SPA du même domaine, un cookie <code>HttpOnly</code> ou le pattern BFF est plus sûr ; le Bearer reste courant pour les API consommées par plusieurs clients.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : sache expliquer 401 contre 403, la rotation des clés de signature, pourquoi l'autorisation doit se faire côté serveur même si le front masque les boutons, et la différence entre un rôle (grossier) et une autorisation par ressource (le propriétaire de la commande). Le contrôle d'accès cassé est en tête du classement OWASP.</div>
`,
  examples: [
    {
      title: "Valider les JWT et protéger les endpoints",
      code: `// dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

var jwt = builder.Configuration.GetSection("Jwt");
var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)); // >= 32 octets, en secret

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwt["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("Admin", policy => policy.RequireRole("admin"))
    .AddPolicy("CanManageProducts", policy => policy.RequireClaim("permission", "products:write"));

builder.Services.AddCors(options => options.AddPolicy("Front", policy =>
    policy.WithOrigins("http://localhost:4200")
          .AllowAnyHeader()
          .AllowAnyMethod()));

var app = builder.Build();

app.UseCors("Front");      // avant l'authentification
app.UseAuthentication();
app.UseAuthorization();

var orders = app.MapGroup("/orders").RequireAuthorization();          // tout le groupe exige un utilisateur
var products = app.MapGroup("/products");
products.MapGet("/", () => "catalogue public").AllowAnonymous();
products.MapPost("/", () => TypedResults.Created()).RequireAuthorization("CanManageProducts");

app.Run();`,
      explain: `Les valeurs <code>Jwt:Issuer</code>, <code>Jwt:Audience</code> et <code>Jwt:Key</code> viennent de la configuration du jour 12 (la clé dans les user secrets).`
    },
    {
      title: "Émettre un token (endpoint de login de démonstration)",
      code: `// dotnet add package Microsoft.IdentityModel.JsonWebTokens
using System.Security.Claims;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;

app.MapPost("/auth/login", async (LoginRequest request, IUserStore users, IConfiguration config) =>
{
    var user = await users.ValidateAsync(request.Email, request.Password); // mot de passe haché, jamais en clair
    if (user is null)
        return Results.Unauthorized();

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
    var descriptor = new SecurityTokenDescriptor
    {
        Issuer = config["Jwt:Issuer"],
        Audience = config["Jwt:Audience"],
        Expires = DateTime.UtcNow.AddMinutes(15),
        SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256),
        Subject = new ClaimsIdentity(
        [
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            .. user.Roles.Select(r => new Claim(ClaimTypes.Role, r))
        ])
    };

    var token = new JsonWebTokenHandler().CreateToken(descriptor);
    return Results.Ok(new { accessToken = token, expiresIn = 900 });
}).AllowAnonymous();

public sealed record LoginRequest(string Email, string Password);`,
      explain: `En production, préfère ASP.NET Core Identity ou un fournisseur d'identité ; cet endpoint sert à comprendre ce que contient un token.`
    },
    {
      title: "Côté Angular : interceptor qui ajoute le token",
      code: `// auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).accessToken();
  // On n'envoie le token qu'à notre API
  if (!token || !req.url.startsWith('https://localhost:7001')) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }));
};

// app.config.ts
import { provideHttpClient, withInterceptors } from '@angular/common/http';

export const appConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))]
};`,
      explain: `Le filtre sur l'URL évite d'envoyer le token à un service tiers. L'origine <code>http://localhost:4200</code> doit figurer dans la policy CORS de l'API.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire l'utilisateur courant",
      prompt: `Écris <code>GET /me</code>, protégé, qui renvoie l'identifiant (<code>sub</code>), l'email et les rôles de l'utilisateur connecté.`,
      hint: `Un paramètre de type <code>ClaimsPrincipal</code> est lié automatiquement à <code>HttpContext.User</code>. Le handler JWT transforme <code>sub</code> en <code>ClaimTypes.NameIdentifier</code> par défaut.`,
      solution: `using System.Security.Claims;

app.MapGet("/me", (ClaimsPrincipal user) => new
{
    id = user.FindFirstValue(ClaimTypes.NameIdentifier),
    email = user.FindFirstValue(ClaimTypes.Email),
    roles = user.FindAll(ClaimTypes.Role).Select(c => c.Value)
}).RequireAuthorization();`
    },
    {
      level: "moyen",
      title: "Policy combinée",
      prompt: `Crée une policy <code>CanCancelOrder</code> : l'utilisateur doit avoir le rôle <code>support</code> <strong>ou</strong> le rôle <code>admin</code>, <strong>et</strong> un claim <code>mfa</code> égal à <code>true</code>. Applique-la à <code>POST /orders/{id}/cancel</code>.`,
      hint: `<code>RequireRole("support", "admin")</code> accepte l'un ou l'autre. Les exigences ajoutées à la même policy se cumulent (ET).`,
      solution: `builder.Services.AddAuthorizationBuilder()
    .AddPolicy("CanCancelOrder", policy => policy
        .RequireAuthenticatedUser()
        .RequireRole("support", "admin")   // l'un OU l'autre
        .RequireClaim("mfa", "true"));     // ET authentification forte

orders.MapPost("/{id:guid}/cancel", async (Guid id, OrderFlowDbContext db, CancellationToken ct) =>
{
    var updated = await db.Orders
        .Where(o => o.Id == id && o.Status != OrderStatus.Shipped)
        .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, OrderStatus.Cancelled), ct);
    return updated == 1 ? Results.NoContent() : Results.NotFound();
}).RequireAuthorization("CanCancelOrder");`
    },
    {
      level: "difficile",
      title: "Autorisation par ressource : le client ne voit que ses commandes",
      prompt: `Un utilisateur avec le rôle <code>customer</code> possède un claim <code>customer_id</code>. Il ne doit pouvoir lire que ses propres commandes ; un <code>admin</code> lit tout. Implémente un <code>AuthorizationHandler</code> par ressource et utilise-le dans <code>GET /orders/{id}</code> (renvoie <code>404</code> plutôt que <code>403</code> pour ne pas révéler l'existence de la commande).`,
      hint: `<code>AuthorizationHandler&lt;OrderOwnerRequirement, Order&gt;</code>, une policy qui contient ce requirement, puis <code>await authorization.AuthorizeAsync(user, order, "OrderOwner")</code> dans le handler de l'endpoint.`,
      solution: `using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

public sealed class OrderOwnerRequirement : IAuthorizationRequirement { }

public sealed class OrderOwnerHandler : AuthorizationHandler<OrderOwnerRequirement, Order>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, OrderOwnerRequirement requirement, Order order)
    {
        if (context.User.IsInRole("admin"))
        {
            context.Succeed(requirement);
        }
        else if (Guid.TryParse(context.User.FindFirstValue("customer_id"), out var customerId)
                 && customerId == order.CustomerId)
        {
            context.Succeed(requirement);
        }
        // sinon : on ne fait rien, la policy échoue
        return Task.CompletedTask;
    }
}

// Program.cs
builder.Services.AddSingleton<IAuthorizationHandler, OrderOwnerHandler>();
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("OrderOwner", policy => policy.AddRequirements(new OrderOwnerRequirement()));

orders.MapGet("/{id:guid}", async (Guid id, ClaimsPrincipal user, IAuthorizationService authorization,
                                   OrderFlowDbContext db, CancellationToken ct) =>
{
    var order = await db.Orders.AsNoTracking().Include(o => o.Lines).FirstOrDefaultAsync(o => o.Id == id, ct);
    if (order is null)
        return Results.NotFound();

    var result = await authorization.AuthorizeAsync(user, order, "OrderOwner");
    return result.Succeeded ? Results.Ok(OrderDto.From(order)) : Results.NotFound(); // 404 : on ne révèle rien
});`
    }
  ],
  project: `<p>Sécurise <code>OrderFlow.Api</code> et branche ton front Angular :</p>
<ul>
  <li>Authentification JWT (clé dans les user secrets), endpoint <code>/auth/login</code> de démonstration ou <code>MapIdentityApi</code>.</li>
  <li>Groupe <code>/orders</code> protégé, catalogue produits en lecture anonyme, écriture réservée à une policy.</li>
  <li>Autorisation par ressource sur la lecture d'une commande.</li>
  <li>Policy CORS pour <code>http://localhost:4200</code> et interceptor Angular ; vérifie dans l'onglet Réseau la requête <code>OPTIONS</code> puis l'appel avec l'en-tête <code>Authorization</code>.</li>
</ul>`,
  resources: [
    { label: "Vue d'ensemble de l'authentification", url: "https://learn.microsoft.com/aspnet/core/security/authentication/" },
    { label: "Autorisation par policies", url: "https://learn.microsoft.com/aspnet/core/security/authorization/policies" },
    { label: "Activer CORS dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/security/cors" }
  ]
});

/* ===================== JOUR 14 ===================== */
window.COURSE.push({
  day: 14, week: 2,
  title: "Révision de la semaine 2 et Dapper face à EF Core",
  summary: "Consolider ASP.NET Core et EF Core, puis savoir quand écrire du SQL à la main avec Dapper.",
  objectives: [
    "Relier les notions de la semaine dans un parcours complet de requête",
    "Écrire des requêtes Dapper paramétrées, avec multi-mapping",
    "Choisir entre EF Core, SQL brut via EF et Dapper selon le cas"
  ],
  lesson: `
<h3>Révision : le trajet d'une requête</h3>
<p>Suis <code>POST /orders</code> de bout en bout et vérifie que tu sais expliquer chaque étape :</p>
<ul>
  <li>Le navigateur envoie un <code>OPTIONS</code> (CORS), puis la requête avec <code>Authorization: Bearer ...</code>.</li>
  <li>Le middleware d'exceptions entoure tout ; le middleware de corrélation pose un identifiant dans les logs.</li>
  <li>L'authentification construit <code>HttpContext.User</code> ; l'autorisation évalue la policy du groupe.</li>
  <li>Le routing choisit l'endpoint ; le model binding désérialise le corps JSON ; la validation renvoie <code>400</code> si besoin.</li>
  <li>La DI fournit un <code>DbContext</code> Scoped et des options validées au démarrage.</li>
  <li>EF Core charge les produits en une requête, le domaine applique ses règles (<code>DomainException</code> traduite en <code>422</code>), <code>SaveChangesAsync</code> écrit tout en une transaction.</li>
  <li>L'endpoint renvoie <code>201 Created</code> avec <code>Location</code> ; Serilog écrit une ligne récapitulative.</li>
</ul>

<h3>Questions de contrôle</h3>
<ul>
  <li>Que se passe-t-il si <code>UseAuthorization</code> est placé avant <code>UseAuthentication</code> ?</li>
  <li>Pourquoi un <code>DbContext</code> ne doit-il jamais être Singleton ?</li>
  <li>Différence entre <code>IOptions</code>, <code>IOptionsSnapshot</code> et <code>IOptionsMonitor</code> ?</li>
  <li>Comment détecter un N+1 dans ton API ?</li>
  <li>Quand renvoyer <code>409</code> plutôt que <code>422</code> ?</li>
</ul>

<h3>Dapper : un micro-ORM</h3>
<p>Dapper ajoute des méthodes d'extension à <code>DbConnection</code> : tu écris le SQL, Dapper exécute et mappe les colonnes vers tes objets par nom. Pas de change tracking, pas de migrations, pas de traduction LINQ. Les méthodes principales :</p>
<ul>
  <li><code>QueryAsync&lt;T&gt;</code> pour une liste, <code>QuerySingleOrDefaultAsync&lt;T&gt;</code> pour une ligne, <code>ExecuteScalarAsync&lt;T&gt;</code> pour une valeur.</li>
  <li><code>ExecuteAsync</code> pour <code>INSERT</code>/<code>UPDATE</code>/<code>DELETE</code>, renvoie le nombre de lignes touchées.</li>
  <li>Les paramètres se passent par un objet anonyme : <code>new { customerId }</code> devient <code>@customerId</code>. C'est ce qui protège de l'injection SQL.</li>
  <li>Le <strong>multi-mapping</strong> (<code>QueryAsync&lt;Order, OrderLine, Order&gt;</code> avec <code>splitOn</code>) reconstruit un parent et ses enfants à partir d'une jointure.</li>
</ul>

<h3>SQL brut sans quitter EF Core</h3>
<p>EF Core sait aussi exécuter du SQL : <code>db.Database.SqlQuery&lt;T&gt;($"...")</code> mappe vers un type non-entité (depuis EF Core 8), <code>FromSql</code> part d'un <code>DbSet</code>, <code>ExecuteSql</code> exécute une commande. Avec une chaîne interpolée, chaque valeur devient un paramètre SQL ; <code>FromSqlRaw</code> avec concaténation de chaînes ouvre l'injection SQL.</p>

<h3>Comment choisir</h3>
<ul>
  <li><strong>EF Core</strong> pour les écritures et la logique métier : change tracking, transactions, migrations, concurrence.</li>
  <li><strong>Dapper ou SQL brut</strong> pour les lectures complexes (rapports, agrégations, CTE, fonctions spécifiques au moteur) et les chemins très sollicités.</li>
  <li>Les deux cohabitent très bien : même connexion (<code>db.Database.GetDbConnection()</code>), même transaction si nécessaire. C'est un découpage CQRS léger que tu formaliseras en semaine 3.</li>
</ul>

<h3>Pièges courants</h3>
<ul>
  <li>Concaténer une valeur utilisateur dans le SQL Dapper : injection SQL. Toujours des paramètres.</li>
  <li>Colonnes mal nommées : Dapper mappe par nom ; utilise des alias (<code>AS "Total"</code>) et attention à la casse sous PostgreSQL.</li>
  <li>Oublier que le SQL écrit à la main n'est pas vérifié à la compilation : couvre-le par des tests d'intégration (jour 18).</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : un senior ne défend pas un outil, il choisit selon le cas et mesure. Sois capable de montrer un écran lent, son SQL généré par EF, le plan d'exécution, et la version Dapper ou l'index qui le corrige, chiffres à l'appui.</div>
`,
  examples: [
    {
      title: "Lecture simple avec Dapper",
      code: `// dotnet add package Dapper
using Dapper;
using Npgsql;

public sealed record CustomerOrderRow(Guid Id, DateTimeOffset CreatedAt, string Status, decimal Total);

public sealed class OrderReadRepository(IConfiguration configuration)
{
    private readonly string _connectionString = configuration.GetConnectionString("OrderFlow")!;

    public async Task<IReadOnlyList<CustomerOrderRow>> ListForCustomerAsync(Guid customerId, CancellationToken ct)
    {
        const string sql = """
            SELECT o."Id", o."CreatedAt", o."Status",
                   COALESCE(SUM(l."UnitPrice" * l."Quantity"), 0) AS "Total"
            FROM orders o
            LEFT JOIN order_lines l ON l."OrderId" = o."Id"
            WHERE o."CustomerId" = @customerId
            GROUP BY o."Id", o."CreatedAt", o."Status"
            ORDER BY o."CreatedAt" DESC
            """;

        await using var connection = new NpgsqlConnection(_connectionString);
        var rows = await connection.QueryAsync<CustomerOrderRow>(
            new CommandDefinition(sql, new { customerId }, cancellationToken: ct));
        return rows.AsList();
    }
}`,
      explain: `Le chaîne brute <code>"""</code> (C# 11) évite d'échapper les guillemets PostgreSQL. <code>CommandDefinition</code> transmet le <code>CancellationToken</code>.`
    },
    {
      title: "Multi-mapping : une commande et ses lignes",
      code: `public sealed class OrderView
{
    public Guid Id { get; init; }
    public string Status { get; init; } = "";
    public List<LineView> Lines { get; } = [];
}

public sealed record LineView(int LineId, Guid ProductId, int Quantity, decimal UnitPrice);

public async Task<OrderView?> GetAsync(Guid orderId, CancellationToken ct)
{
    const string sql = """
        SELECT o."Id", o."Status",
               l."Id" AS "LineId", l."ProductId", l."Quantity", l."UnitPrice"
        FROM orders o
        LEFT JOIN order_lines l ON l."OrderId" = o."Id"
        WHERE o."Id" = @orderId
        """;

    await using var connection = new NpgsqlConnection(_connectionString);
    OrderView? result = null;

    await connection.QueryAsync<OrderView, LineView?, OrderView>(
        new CommandDefinition(sql, new { orderId }, cancellationToken: ct),
        (order, line) =>
        {
            result ??= order;              // la même commande revient sur chaque ligne
            if (line is not null) result.Lines.Add(line);
            return result;
        },
        splitOn: "LineId");                // la colonne où commence le second objet

    return result;
}`,
      explain: `Chaque ligne SQL contient la commande et une ligne de commande ; la fonction de mapping regroupe les lignes sous un seul parent.`
    },
    {
      title: "Le même besoin en SQL brut avec EF Core",
      code: `public sealed record TopProductRow(Guid ProductId, string Name, int Quantity);

// Les valeurs interpolées deviennent des paramètres SQL : pas d'injection possible
var since = DateTimeOffset.UtcNow.AddDays(-30);
var top = await db.Database.SqlQuery<TopProductRow>($"""
    SELECT p."Id" AS "ProductId", p."Name", SUM(l."Quantity")::int AS "Quantity"
    FROM order_lines l
    JOIN orders o ON o."Id" = l."OrderId"
    JOIN products p ON p."Id" = l."ProductId"
    WHERE o."CreatedAt" >= {since}
    GROUP BY p."Id", p."Name"
    ORDER BY "Quantity" DESC
    LIMIT 10
    """).ToListAsync(ct);`,
      explain: `<code>SqlQuery&lt;T&gt;</code> reçoit un <code>FormattableString</code> : <code>{since}</code> devient <code>@p0</code>. N'utilise jamais <code>SqlQueryRaw</code> avec une chaîne concaténée.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Compter avec Dapper",
      prompt: `Écris une méthode Dapper qui renvoie le nombre de commandes ayant un statut donné.`,
      hint: `<code>ExecuteScalarAsync&lt;int&gt;</code> et un paramètre <code>@status</code>. Le statut est stocké en texte (jour 10).`,
      solution: `public async Task<int> CountByStatusAsync(OrderStatus status, CancellationToken ct)
{
    const string sql = """SELECT COUNT(*)::int FROM orders WHERE "Status" = @status""";

    await using var connection = new NpgsqlConnection(_connectionString);
    return await connection.ExecuteScalarAsync<int>(
        new CommandDefinition(sql, new { status = status.ToString() }, cancellationToken: ct));
}`
    },
    {
      level: "moyen",
      title: "Trouver et corriger l'injection SQL",
      prompt: `Ce code est vulnérable. Explique l'attaque avec un exemple de valeur pour <code>name</code>, puis corrige-le.<br><code>var sql = "SELECT * FROM products WHERE \\"Name\\" LIKE '%" + name + "%'"; var rows = await connection.QueryAsync&lt;Product&gt;(sql);</code>`,
      hint: `Le motif <code>%</code> fait partie de la valeur du paramètre, pas du SQL. Et évite <code>SELECT *</code>.`,
      solution: `// Attaque : name = "' OR 1=1; DROP TABLE products; --"
// Le SQL devient : ... LIKE '%' OR 1=1; DROP TABLE products; --%'

public async Task<IReadOnlyList<ProductRow>> SearchAsync(string name, CancellationToken ct)
{
    const string sql = """
        SELECT "Id", "Sku", "Name", "UnitPrice"
        FROM products
        WHERE "Name" ILIKE @pattern
        ORDER BY "Name"
        LIMIT 50
        """;

    await using var connection = new NpgsqlConnection(_connectionString);
    var rows = await connection.QueryAsync<ProductRow>(
        new CommandDefinition(sql, new { pattern = "%" + name + "%" }, cancellationToken: ct));
    return rows.AsList();
}

public sealed record ProductRow(Guid Id, string Sku, string Name, decimal UnitPrice);`
    },
    {
      level: "difficile",
      title: "Rapport de ventes mensuel",
      prompt: `Écris <code>GET /reports/sales?year=2026</code> qui renvoie, pour chaque mois, le nombre de commandes payées, le chiffre d'affaires et le panier moyen, avec les mois sans vente à zéro. Utilise Dapper et une seule requête SQL. Protège l'endpoint avec la policy <code>Admin</code>.`,
      hint: `Sous PostgreSQL, <code>generate_series(1, 12)</code> produit les 12 mois et un <code>LEFT JOIN</code> garde les mois vides. Calcule le total par commande dans une CTE avant d'agréger par mois.`,
      solution: `public sealed record MonthlySalesRow(int Month, int Orders, decimal Revenue, decimal AverageBasket);

app.MapGet("/reports/sales", async (int year, IConfiguration configuration, CancellationToken ct) =>
{
    const string sql = """
        WITH paid AS (
            SELECT o."Id", EXTRACT(MONTH FROM o."CreatedAt")::int AS month,
                   SUM(l."UnitPrice" * l."Quantity") AS total
            FROM orders o
            JOIN order_lines l ON l."OrderId" = o."Id"
            WHERE o."Status" = 'Paid'
              AND o."CreatedAt" >= make_date(@year, 1, 1)
              AND o."CreatedAt" <  make_date(@year + 1, 1, 1)
            GROUP BY o."Id", month
        )
        SELECT m AS "Month",
               COUNT(p."Id")::int AS "Orders",
               COALESCE(SUM(p.total), 0) AS "Revenue",
               COALESCE(ROUND(AVG(p.total), 2), 0) AS "AverageBasket"
        FROM generate_series(1, 12) AS m
        LEFT JOIN paid p ON p.month = m
        GROUP BY m
        ORDER BY m
        """;

    await using var connection = new NpgsqlConnection(configuration.GetConnectionString("OrderFlow"));
    var rows = await connection.QueryAsync<MonthlySalesRow>(
        new CommandDefinition(sql, new { year }, cancellationToken: ct));
    return TypedResults.Ok(rows);
}).RequireAuthorization("Admin");

// Le filtre sur une plage de dates (et non EXTRACT(YEAR ...) = @year)
// permet à un index sur "CreatedAt" d'être utilisé.`
    }
  ],
  project: `<p>Bilan de la semaine sur <code>OrderFlow.Api</code> :</p>
<ul>
  <li>Réécris l'endpoint de liste des commandes d'un client en Dapper et compare temps de réponse et SQL avec la version EF Core (même jeu de données, quelques milliers de commandes).</li>
  <li>Ajoute le rapport de ventes mensuel.</li>
  <li>Réponds par écrit aux questions de contrôle de la leçon dans <code>NOTES.md</code>.</li>
  <li>Fais une revue de ton propre code : DTO partout, aucun secret dans le dépôt, toutes les lectures sans tracking, codes HTTP justes.</li>
</ul>`,
  resources: [
    { label: "Requêtes SQL avec EF Core", url: "https://learn.microsoft.com/ef/core/querying/sql-queries" },
    { label: "Performance EF Core", url: "https://learn.microsoft.com/ef/core/performance/" },
    { label: "Environnements ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/environments" }
  ]
});
