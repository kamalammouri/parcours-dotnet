window.COURSE = window.COURSE || [];

/* ===================================================================
   Jour 43 : Gestion des erreurs, filtres et logging
   =================================================================== */
window.COURSE.push({
  key: "w-errors-logging",
  title: "Gestion des erreurs, filtres et logging",
  summary: "Transformer chaque erreur en réponse ProblemDetails propre, choisir entre filtre, middleware et endpoint filter, et produire des logs structurés exploitables en production.",
  objectives: [
    "Centraliser la gestion des exceptions avec UseExceptionHandler et IExceptionHandler",
    "Choisir entre exceptions métier et Result pattern pour les erreurs attendues",
    "Savoir quand utiliser un filtre MVC, un endpoint filter ou un middleware",
    "Écrire des logs structurés avec ILogger<T>, des scopes et Serilog",
    "Savoir ce qu'il ne faut jamais écrire dans un log"
  ],
  lesson: `
<h3>Pourquoi centraliser la gestion des erreurs</h3>
<p>Une API sans stratégie d'erreur renvoie un peu de tout : une page HTML d'erreur, un <code>500</code> vide, une chaîne de caractères, parfois une stack trace complète avec le nom de la base et les chemins du serveur. Le front Angular ne peut rien en faire, et un attaquant y lit l'architecture de ton système. L'objectif du jour : <strong>une seule forme de réponse d'erreur</strong> pour toute l'API, quel que soit l'endroit où l'erreur est née.</p>
<p>Cette forme existe déjà : <strong>ProblemDetails</strong> (RFC 9457, qui remplace la RFC 7807). C'est un JSON standard avec <code>type</code>, <code>title</code>, <code>status</code>, <code>detail</code>, <code>instance</code> et des extensions libres (par exemple <code>traceId</code> ou <code>errors</code> pour la validation). Le content-type est <code>application/problem+json</code>.</p>
<pre><code>{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Commande introuvable",
  "status": 404,
  "detail": "La commande 42 n'existe pas.",
  "instance": "GET /api/orders/42",
  "traceId": "00-4bf92f...-01"
}</code></pre>

<h3>Le trio AddProblemDetails, UseExceptionHandler, IExceptionHandler</h3>
<p>Depuis .NET 8, la recette officielle tient en trois lignes dans <code>Program.cs</code> :</p>
<ul>
  <li><code>builder.Services.AddProblemDetails()</code> enregistre <code>IProblemDetailsService</code>, le service qui sait écrire un ProblemDetails dans la réponse. Il est aussi utilisé par <code>UseStatusCodePages</code> et par les erreurs de validation.</li>
  <li><code>builder.Services.AddExceptionHandler&lt;GlobalExceptionHandler&gt;()</code> enregistre ta classe qui implémente <code>IExceptionHandler</code>. Elle est enregistrée en <strong>singleton</strong> : n'y injecte pas de service scoped (comme le <code>DbContext</code>).</li>
  <li><code>app.UseExceptionHandler()</code> place le middleware en <strong>tout début</strong> de pipeline. Il attrape toute exception non gérée qui remonte des middlewares suivants et appelle tes handlers dans l'ordre d'enregistrement.</li>
</ul>
<p><code>IExceptionHandler</code> n'a qu'une méthode : <code>ValueTask&lt;bool&gt; TryHandleAsync(HttpContext, Exception, CancellationToken)</code>. Tu renvoies <code>true</code> si tu as écrit la réponse, <code>false</code> pour laisser le handler suivant (ou le comportement par défaut) s'en occuper. Tu peux donc enregistrer plusieurs handlers spécialisés : un pour les <code>ValidationException</code>, un pour les erreurs métier, un dernier « attrape-tout » qui renvoie un 500 générique.</p>

<h3>Exceptions métier ou Result pattern ?</h3>
<p>Il existe deux familles d'erreurs. Les erreurs <strong>inattendues</strong> (base indisponible, bug, <code>NullReferenceException</code>) doivent rester des exceptions : tu ne peux rien faire d'autre que logger et renvoyer un 500. Les erreurs <strong>attendues</strong> (commande introuvable, stock insuffisant, transition de statut interdite) font partie du métier. Deux écoles :</p>
<table>
  <thead><tr><th>Approche</th><th>Principe</th><th>Avantages</th><th>Inconvénients</th></tr></thead>
  <tbody>
    <tr><td>Exceptions métier</td><td><code>throw new NotFoundException(...)</code>, traduite en 404 par l'exception handler</td><td>Code linéaire, peu de cérémonie, très répandu en entreprise</td><td>Le flux de contrôle est caché, une exception coûte cher (stack trace), la signature ne dit pas ce qui peut échouer</td></tr>
    <tr><td>Result pattern</td><td>La méthode renvoie <code>Result&lt;Order&gt;</code> avec succès ou erreur typée</td><td>Les erreurs sont explicites et testables, pas de coût d'exception</td><td>Plus verbeux, il faut convertir chaque <code>Result</code> en réponse HTTP</td></tr>
  </tbody>
</table>
<p>En pratique, beaucoup d'équipes combinent : Result pattern dans la couche Application pour les cas métier, exceptions pour l'imprévu. Ce qui compte, c'est d'<strong>être cohérent dans tout le projet</strong>. Si tu choisis les exceptions métier, crée une petite hiérarchie (<code>DomainException</code> avec <code>NotFoundException</code>, <code>ConflictException</code>, <code>ForbiddenException</code>) et un seul handler qui fait la correspondance avec les codes HTTP.</p>

<h3>UseStatusCodePages et la stack trace</h3>
<p>Quand un endpoint renvoie un <code>404</code> ou un <code>405</code> sans corps (route inexistante, méthode non autorisée), le client reçoit une réponse vide. <code>app.UseStatusCodePages()</code> combiné à <code>AddProblemDetails()</code> remplit automatiquement ces réponses avec un ProblemDetails.</p>
<p>Règle absolue : <strong>jamais de stack trace dans la réponse en production</strong>. Le <code>DeveloperExceptionPage</code> est activé par défaut uniquement en environnement Development, c'est très bien ainsi. Dans ton handler, n'écris pas <code>exception.Message</code> dans <code>detail</code> pour les erreurs 500 : le message d'une <code>SqlException</code> contient des noms de tables et parfois des valeurs. Renvoie un message générique et le <code>traceId</code>, qui permet de retrouver le détail dans les logs.</p>

<h3>Filtres MVC, endpoint filters et middleware</h3>
<p>Le traitement transversal d'une requête peut se faire à trois niveaux. Le choix dépend de ce dont tu as besoin de connaître.</p>
<table>
  <thead><tr><th>Mécanisme</th><th>S'applique à</th><th>Connaît</th><th>Cas d'usage typiques</th></tr></thead>
  <tbody>
    <tr><td>Middleware</td><td>Toutes les requêtes du pipeline</td><td>Seulement <code>HttpContext</code></td><td>Gestion d'exceptions, CorrelationId, en-têtes de sécurité, logging des requêtes</td></tr>
    <tr><td>Filtre MVC</td><td>Actions de controllers</td><td>L'action, ses arguments liés, le <code>ModelState</code>, le résultat</td><td>Validation, audit, transformation de résultat, cache par action</td></tr>
    <tr><td>Endpoint filter</td><td>Endpoints Minimal API (et groupes)</td><td>Les arguments de l'endpoint</td><td>Validation des arguments, contrôle d'accès fin, mesure de temps</td></tr>
  </tbody>
</table>
<p>Les filtres MVC s'exécutent dans un ordre précis autour de l'action : <strong>Authorization</strong> → <strong>Resource</strong> → <strong>Action</strong> (avant et après l'action) → <strong>Exception</strong> (si l'action lève) → <strong>Result</strong> (autour de l'écriture du résultat). Pour un filtre qui a besoin de services injectés, implémente <code>IAsyncActionFilter</code> et applique-le avec <code>[ServiceFilter(typeof(MonFiltre))]</code> (le filtre doit être enregistré dans la DI) ou <code>[TypeFilter(typeof(MonFiltre))]</code> (créé à la volée, sans enregistrement). Préfère la version <strong>async</strong> de chaque interface : n'implémente jamais la version synchrone et asynchrone dans la même classe.</p>
<p>Les exception filters MVC existent, mais pour une API moderne, le <code>IExceptionHandler</code> global est plus simple : il couvre aussi les Minimal APIs et les middlewares.</p>

<h3>Logger correctement avec ILogger&lt;T&gt;</h3>
<p>Injecte <code>ILogger&lt;OrdersController&gt;</code> : le type générique devient la <strong>catégorie</strong> du log, ce qui permet de régler le niveau par namespace dans <code>appsettings.json</code>. Les niveaux, du plus bavard au plus grave : <code>Trace</code>, <code>Debug</code>, <code>Information</code>, <code>Warning</code>, <code>Error</code>, <code>Critical</code>.</p>
<p>Le point le plus important : le <strong>logging structuré</strong>. Écris <code>logger.LogInformation("Commande {OrderId} créée pour {CustomerId}", order.Id, customerId)</code> et <strong>jamais</strong> <code>logger.LogInformation($"Commande {order.Id} créée")</code>. Avec le template, le fournisseur de logs reçoit le message <em>et</em> les propriétés <code>OrderId</code> et <code>CustomerId</code> séparément. Dans Seq, Elastic ou Application Insights, tu peux alors filtrer <code>OrderId = 42</code>. Avec l'interpolation, tu n'as qu'une chaîne, tu perds la recherche et tu paies la construction de la chaîne même si le niveau est désactivé.</p>
<p>Les <strong>scopes</strong> (<code>using (logger.BeginScope(...))</code>) ajoutent des propriétés à tous les logs écrits dans un bloc, par exemple l'id de la commande pendant tout son traitement.</p>
<pre><code>"Logging": {
  "LogLevel": {
    "Default": "Information",
    "Microsoft.AspNetCore": "Warning",
    "Microsoft.EntityFrameworkCore.Database.Command": "Warning"
  }
}</code></pre>

<h3>Serilog et le CorrelationId</h3>
<p>Le logging intégré suffit pour démarrer, mais la plupart des projets d'entreprise utilisent <strong>Serilog</strong> (package <code>Serilog.AspNetCore</code>). Il remplace le fournisseur, garde l'API <code>ILogger&lt;T&gt;</code>, se configure depuis <code>appsettings.json</code> et propose des <em>sinks</em> pour la console, les fichiers, Seq, Elastic, etc. <code>app.UseSerilogRequestLogging()</code> écrit une seule ligne propre par requête (méthode, chemin, statut, durée) au lieu des nombreuses lignes de Microsoft.AspNetCore.</p>
<p>Un <strong>CorrelationId</strong> est un identifiant unique par requête, repris de l'en-tête <code>X-Correlation-Id</code> s'il arrive du front ou d'un autre service, ou généré sinon. Un petit middleware le pousse dans le <code>LogContext</code> de Serilog et le renvoie dans la réponse : tous les logs de la requête le portent, et tu peux suivre un appel de bout en bout.</p>
<p>Pour les chemins très fréquents, le <strong>source generator LoggerMessage</strong> (<code>[LoggerMessage(...)] static partial void ...</code>) génère à la compilation un code de log sans allocation ni boxing. C'est la pratique recommandée par Microsoft pour le code chaud.</p>

<h3>Ce qu'il ne faut jamais logger</h3>
<ul>
  <li>Mots de passe, même en échec de connexion</li>
  <li>Tokens JWT, refresh tokens, clés d'API, chaînes de connexion</li>
  <li>Données personnelles (email, téléphone, adresse) sauf nécessité et base légale : le RGPD s'applique aussi aux logs</li>
  <li>Numéros de carte bancaire, IBAN</li>
  <li>Le corps complet des requêtes et réponses en production</li>
</ul>
<p>Piège courant : logger un objet entier (<code>{@Customer}</code> avec Serilog) qui contient un champ sensible. Logge des identifiants, pas des objets.</p>

<div class="note">Un senior pense aux logs comme à un outil d'exploitation, pas de débogage. Pour chaque log, demande-toi qui va le lire à 3 h du matin et ce dont il aura besoin : un identifiant pour retrouver l'objet, le CorrelationId pour suivre la requête, un niveau juste (une commande introuvable n'est pas une <code>Error</code>, c'est un 404 normal). Trop de logs <code>Error</code> déclenchent des alertes pour rien et l'équipe finit par les ignorer. Et dans la réponse HTTP, renvoie toujours le <code>traceId</code> : c'est le lien entre le message que l'utilisateur te transmet et la ligne de log qui explique le problème.</div>
`,
  examples: [
    {
      title: "Exceptions métier et handler global vers ProblemDetails",
      code: `// Domain/Exceptions.cs
namespace OrderFlow.Domain;

public abstract class DomainException(string message) : Exception(message);
public sealed class NotFoundException(string resource, object id)
    : DomainException($"{resource} {id} introuvable.");
public sealed class ConflictException(string message) : DomainException(message);

// Api/GlobalExceptionHandler.cs
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using OrderFlow.Domain;

namespace OrderFlow.Api;

public sealed class GlobalExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (status, title, detail) = exception switch
        {
            NotFoundException e => (StatusCodes.Status404NotFound, "Ressource introuvable", e.Message),
            ConflictException e => (StatusCodes.Status409Conflict, "Conflit", e.Message),
            // Erreur imprévue : message générique, jamais exception.Message
            _ => (StatusCodes.Status500InternalServerError, "Erreur interne",
                  "Une erreur inattendue est survenue. Communique le traceId au support.")
        };

        if (status >= 500)
            logger.LogError(exception, "Erreur non gérée sur {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);
        else
            logger.LogInformation("Erreur métier {Status} : {Message}", status, exception.Message);

        httpContext.Response.StatusCode = status;
        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = status,
                Title = title,
                Detail = detail,
                Instance = $"{httpContext.Request.Method} {httpContext.Request.Path}"
            }
        });
    }
}

// Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails(options =>
{
    // Ajoute le traceId à TOUS les ProblemDetails (validation, 404 de routage, etc.)
    options.CustomizeProblemDetails = ctx =>
        ctx.ProblemDetails.Extensions["traceId"] = ctx.HttpContext.TraceIdentifier;
});
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();

app.UseExceptionHandler();   // en premier : attrape tout ce qui suit
app.UseStatusCodePages();    // remplit les 404/405 vides avec un ProblemDetails

app.MapGet("/api/orders/{id:int}", (int id) =>
{
    if (id != 1) throw new NotFoundException("Commande", id);
    return Results.Ok(new { Id = 1, Status = "Pending" });
});

app.Run();`,
      explain: "Le <code>switch</code> sur le type d'exception est le seul endroit qui connaît la correspondance entre erreurs métier et codes HTTP. Les erreurs 500 sont loggées en <code>Error</code> avec l'exception complète, les erreurs métier en <code>Information</code>."
    },
    {
      title: "Action filter async avec injection (controllers)",
      code: `using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace OrderFlow.Api.Filters;

// Mesure la durée de chaque action et signale les actions lentes
public sealed class SlowActionFilter(ILogger<SlowActionFilter> logger) : IAsyncActionFilter
{
    private static readonly TimeSpan Threshold = TimeSpan.FromMilliseconds(500);

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var sw = Stopwatch.StartNew();
        var executed = await next();   // exécute l'action (et les filtres suivants)
        sw.Stop();

        if (sw.Elapsed > Threshold)
        {
            logger.LogWarning("Action lente {Action} : {ElapsedMs} ms",
                context.ActionDescriptor.DisplayName, sw.ElapsedMilliseconds);
        }

        if (executed.Exception is not null && !executed.ExceptionHandled)
        {
            // On ne gère pas l'exception ici : le IExceptionHandler global s'en charge
            logger.LogDebug("L'action {Action} a levé une exception", context.ActionDescriptor.DisplayName);
        }
    }
}

// Program.cs
// builder.Services.AddScoped<SlowActionFilter>();            // requis pour ServiceFilter
// builder.Services.AddControllers(o => o.Filters.Add<SlowActionFilter>()); // ou en global

[ApiController]
[Route("api/[controller]")]
[ServiceFilter(typeof(SlowActionFilter))]   // résolu depuis la DI
public sealed class ProductsController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        await Task.Delay(600, ct); // simule une requête lente
        return Ok(Array.Empty<object>());
    }
}`,
      explain: "<code>await next()</code> sépare le code « avant » et « après » l'action. <code>ServiceFilter</code> exige que le filtre soit enregistré dans la DI ; <code>TypeFilter</code> le crée à la volée et accepte des arguments supplémentaires."
    },
    {
      title: "Endpoint filter pour les Minimal APIs",
      code: `namespace OrderFlow.Api.Filters;

// Refuse les identifiants négatifs ou nuls avant d'atteindre le handler
public sealed class PositiveIdFilter : IEndpointFilter
{
    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        // Les arguments sont dans l'ordre de la signature du handler
        if (context.Arguments.OfType<int>().Any(id => id <= 0))
        {
            return TypedResults.Problem(
                title: "Identifiant invalide",
                detail: "L'identifiant doit être strictement positif.",
                statusCode: StatusCodes.Status400BadRequest);
        }

        return await next(context);
    }
}

// Program.cs
var orders = app.MapGroup("/api/orders")
    .AddEndpointFilter<PositiveIdFilter>()   // s'applique à tout le groupe
    .WithTags("Orders");

orders.MapGet("/{id:int}", (int id) => TypedResults.Ok(new { Id = id }));

orders.MapDelete("/{id:int}", (int id) => TypedResults.NoContent())
    .AddEndpointFilter(async (ctx, next) =>
    {
        // Filtre inline : trace la suppression
        var logger = ctx.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("Suppression demandée pour la commande {OrderId}", ctx.GetArgument<int>(0));
        return await next(ctx);
    });`,
      explain: "Un endpoint filter peut court-circuiter la requête en renvoyant directement un résultat, sans appeler <code>next</code>. Appliqué sur un <code>MapGroup</code>, il couvre tous les endpoints du groupe."
    },
    {
      title: "Logging structuré, scopes et LoggerMessage",
      code: `namespace OrderFlow.Application;

public sealed class OrderService(ILogger<OrderService> logger)
{
    public void Confirm(int orderId, int customerId)
    {
        // Le scope ajoute OrderId à TOUS les logs du bloc
        using (logger.BeginScope(new Dictionary<string, object> { ["OrderId"] = orderId }))
        {
            // Correct : template + paramètres → propriétés filtrables
            logger.LogInformation("Confirmation de la commande pour le client {CustomerId}", customerId);

            // À éviter : interpolation → une simple chaîne, plus de propriété OrderId
            // logger.LogInformation($"Confirmation de la commande {orderId}");

            Log.OrderConfirmed(logger, orderId, 3);
        }
    }
}

// Logs générés à la compilation : aucune allocation si le niveau est désactivé
internal static partial class Log
{
    [LoggerMessage(EventId = 1001, Level = LogLevel.Information,
        Message = "Commande {OrderId} confirmée avec {LineCount} lignes")]
    public static partial void OrderConfirmed(ILogger logger, int orderId, int lineCount);

    [LoggerMessage(EventId = 1002, Level = LogLevel.Warning,
        Message = "Stock insuffisant pour le produit {ProductId} : demandé {Requested}, disponible {Available}")]
    public static partial void InsufficientStock(ILogger logger, int productId, int requested, int available);
}`,
      explain: "Les scopes ne sont affichés que si le fournisseur les supporte : avec la console par défaut, active <code>IncludeScopes</code> ; Serilog les capture automatiquement grâce à <code>Enrich.FromLogContext()</code>."
    },
    {
      title: "Serilog et middleware CorrelationId",
      code: `// dotnet add package Serilog.AspNetCore
using Serilog;
using Serilog.Context;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, services, config) => config
    .ReadFrom.Configuration(context.Configuration) // niveaux et sinks depuis appsettings.json
    .ReadFrom.Services(services)
    .Enrich.FromLogContext()                        // indispensable pour CorrelationId et les scopes
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {CorrelationId} {Message:lj}{NewLine}{Exception}"));

var app = builder.Build();

// Middleware CorrelationId : avant tout le reste pour que tous les logs le portent
app.Use(async (context, next) =>
{
    const string header = "X-Correlation-Id";
    var correlationId = context.Request.Headers[header].FirstOrDefault() ?? Guid.NewGuid().ToString("N");

    context.Response.Headers[header] = correlationId;
    using (LogContext.PushProperty("CorrelationId", correlationId))
    {
        await next(context);
    }
});

app.UseSerilogRequestLogging(); // une ligne par requête : méthode, chemin, statut, durée

app.MapGet("/ping", (ILogger<Program> logger) =>
{
    logger.LogInformation("Ping reçu");
    return "pong";
});

app.Run();

/* appsettings.json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": { "Microsoft.AspNetCore": "Warning" }
    }
  }
}
Pour Seq : dotnet add package Serilog.Sinks.Seq puis .WriteTo.Seq("http://localhost:5341")
Pour un fichier : Serilog.Sinks.File puis .WriteTo.File("logs/orderflow-.log", rollingInterval: RollingInterval.Day)
*/`,
      explain: "Le CorrelationId est repris de l'en-tête s'il arrive du front, sinon généré. Le front Angular peut l'envoyer avec un interceptor HTTP pour relier une action utilisateur aux logs du serveur."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un handler dédié aux erreurs de validation",
      prompt: "<p>Crée une exception <code>ValidationFailedException</code> qui contient un dictionnaire <code>IDictionary&lt;string, string[]&gt; Errors</code>. Écris un second <code>IExceptionHandler</code>, enregistré <strong>avant</strong> le handler global, qui la transforme en <code>400</code> avec un <code>ValidationProblemDetails</code> et renvoie <code>false</code> pour toutes les autres exceptions.</p>",
      hint: "<p><code>ValidationProblemDetails</code> accepte le dictionnaire dans son constructeur. Les handlers sont appelés dans l'ordre d'enregistrement : le premier qui renvoie <code>true</code> arrête la chaîne.</p>",
      solution: `using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

public sealed class ValidationFailedException(IDictionary<string, string[]> errors)
    : Exception("La validation a échoué.")
{
    public IDictionary<string, string[]> Errors { get; } = errors;
}

public sealed class ValidationExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken ct)
    {
        if (exception is not ValidationFailedException validation)
            return false; // laisse le handler suivant s'en occuper

        httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ValidationProblemDetails(validation.Errors)
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Données invalides"
            }
        });
    }
}

// Program.cs : l'ordre compte
// builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
// builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// Test rapide
// app.MapPost("/api/test", () =>
// {
//     throw new ValidationFailedException(new Dictionary<string, string[]>
//     {
//         ["Quantity"] = ["La quantité doit être positive."]
//     });
// });`
    },
    {
      level: "moyen",
      title: "Filtre d'audit des modifications",
      prompt: "<p>Écris un <code>IAsyncActionFilter</code> nommé <code>AuditFilter</code> qui, pour les requêtes <code>POST</code>, <code>PUT</code>, <code>PATCH</code> et <code>DELETE</code> uniquement, logge après l'action : l'utilisateur (<code>User.Identity.Name</code> ou « anonyme »), l'action, les noms des arguments (pas leurs valeurs) et le code de statut final. Si l'action lève une exception, logge un <code>Warning</code> sans gérer l'exception. Applique-le globalement.</p>",
      hint: "<p>Le statut final se lit dans <code>context.HttpContext.Response.StatusCode</code> après <code>await next()</code>. Les arguments sont dans <code>context.ActionArguments</code>. Ne logge pas les valeurs : elles peuvent contenir des données sensibles.</p>",
      solution: `using Microsoft.AspNetCore.Mvc.Filters;

public sealed class AuditFilter(ILogger<AuditFilter> logger) : IAsyncActionFilter
{
    private static readonly HashSet<string> AuditedMethods =
        new(StringComparer.OrdinalIgnoreCase) { "POST", "PUT", "PATCH", "DELETE" };

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        if (!AuditedMethods.Contains(context.HttpContext.Request.Method))
        {
            await next();
            return;
        }

        var user = context.HttpContext.User.Identity?.Name ?? "anonyme";
        var action = context.ActionDescriptor.DisplayName;
        var argumentNames = string.Join(", ", context.ActionArguments.Keys); // noms seulement

        var executed = await next();

        if (executed.Exception is not null && !executed.ExceptionHandled)
        {
            logger.LogWarning("Audit : {User} a tenté {Action} ({Arguments}) et l'action a échoué",
                user, action, argumentNames);
            return; // on ne marque pas l'exception comme gérée
        }

        logger.LogInformation("Audit : {User} a exécuté {Action} ({Arguments}) → {StatusCode}",
            user, action, argumentNames, context.HttpContext.Response.StatusCode);
    }
}

// Program.cs
// builder.Services.AddControllers(options => options.Filters.Add<AuditFilter>());
// Avec Filters.Add<T>(), le filtre est créé par la DI à chaque requête : pas besoin de l'enregistrer.`
    },
    {
      level: "difficile",
      title: "Result pattern converti automatiquement en réponse HTTP",
      prompt: "<p>Implémente un type <code>Result&lt;T&gt;</code> avec une erreur typée <code>Error(string Code, string Message, ErrorType Type)</code> où <code>ErrorType</code> vaut <code>NotFound</code>, <code>Conflict</code> ou <code>Validation</code>. Écris une méthode d'extension <code>ToHttpResult()</code> qui renvoie <code>200</code> avec la valeur en cas de succès et un ProblemDetails avec le bon statut (404, 409, 400) sinon, en ajoutant <code>code</code> dans les extensions. Utilise-la dans un endpoint Minimal API qui confirme une commande.</p>",
      hint: "<p>Un <code>switch</code> sur <code>ErrorType</code> donne le statut. <code>TypedResults.Problem</code> accepte un dictionnaire <code>extensions</code>. Ajoute des conversions implicites depuis <code>T</code> et depuis <code>Error</code> pour écrire <code>return order;</code> ou <code>return OrderErrors.NotFound(id);</code>.</p>",
      solution: `public enum ErrorType { NotFound, Conflict, Validation }

public sealed record Error(string Code, string Message, ErrorType Type);

public readonly struct Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess => Error is null;

    private Result(T value) { Value = value; Error = null; }
    private Result(Error error) { Value = default; Error = error; }

    public static implicit operator Result<T>(T value) => new(value);
    public static implicit operator Result<T>(Error error) => new(error);
}

public static class ResultExtensions
{
    public static IResult ToHttpResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
            return TypedResults.Ok(result.Value);

        var error = result.Error!;
        var status = error.Type switch
        {
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };

        return TypedResults.Problem(
            title: error.Code,
            detail: error.Message,
            statusCode: status,
            extensions: new Dictionary<string, object?> { ["code"] = error.Code });
    }
}

public static class OrderErrors
{
    public static Error NotFound(int id) => new("Order.NotFound", $"La commande {id} n'existe pas.", ErrorType.NotFound);
    public static Error AlreadyConfirmed(int id) => new("Order.AlreadyConfirmed", $"La commande {id} est déjà confirmée.", ErrorType.Conflict);
}

public sealed record OrderDto(int Id, string Status);

public sealed class OrderService
{
    private readonly Dictionary<int, string> _orders = new() { [1] = "Pending", [2] = "Confirmed" };

    public Result<OrderDto> Confirm(int id)
    {
        if (!_orders.TryGetValue(id, out var status))
            return OrderErrors.NotFound(id);
        if (status == "Confirmed")
            return OrderErrors.AlreadyConfirmed(id);

        _orders[id] = "Confirmed";
        return new OrderDto(id, "Confirmed");
    }
}

// Program.cs
// builder.Services.AddSingleton<OrderService>();
// app.MapPost("/api/orders/{id:int}/confirm", (int id, OrderService service) =>
//     service.Confirm(id).ToHttpResult());
// POST /api/orders/1/confirm → 200 ; de nouveau → 409 ; /api/orders/99/confirm → 404`
    }
  ],
  project: "<p>Dans <strong>OrderFlow.Api</strong> :</p><ul><li>Crée <code>NotFoundException</code> et <code>ConflictException</code> dans OrderFlow.Domain et remplace les <code>return NotFound()</code> dispersés dans les controllers par ces exceptions ou par le Result pattern (choisis une approche et tiens-toi-y).</li><li>Ajoute un <code>GlobalExceptionHandler</code>, <code>AddProblemDetails</code> avec le <code>traceId</code> et <code>UseStatusCodePages</code>. Vérifie avec Scalar ou un fichier <code>.http</code> qu'une commande inexistante renvoie un 404 en <code>application/problem+json</code>.</li><li>Installe Serilog, configure-le depuis <code>appsettings.json</code>, ajoute le middleware CorrelationId et <code>UseSerilogRequestLogging</code>.</li><li>Côté Angular, ajoute un interceptor qui envoie un <code>X-Correlation-Id</code> et affiche le <code>title</code> du ProblemDetails dans un toast en cas d'erreur.</li></ul>",
  resources: [
    { label: "Gérer les erreurs dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/error-handling" },
    { label: "Gérer les erreurs dans les API web", url: "https://learn.microsoft.com/aspnet/core/web-api/handle-errors" },
    { label: "Filtres dans ASP.NET Core MVC", url: "https://learn.microsoft.com/aspnet/core/mvc/controllers/filters" },
    { label: "Filtres dans les Minimal APIs", url: "https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis/min-api-filters" },
    { label: "Logging dans .NET et ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/logging/" },
    { label: "Source generator LoggerMessage", url: "https://learn.microsoft.com/dotnet/core/extensions/logger-message-generator" },
    { label: "Serilog.AspNetCore (GitHub)", url: "https://github.com/serilog/serilog-aspnetcore" }
  ]
});

/* ===================================================================
   Jour 45 : CRUD complet
   =================================================================== */
window.COURSE.push({
  key: "w-crud-advanced",
  title: "CRUD complet : pagination, filtres, tri, PATCH et fichiers",
  summary: "Passer d'un CRUD de démonstration à des endpoints de production : listes paginées et filtrées, tri sûr, mises à jour partielles, concurrence avec ETag, suppression logique et gestion des fichiers.",
  objectives: [
    "Paginer une liste avec des bornes et renvoyer le total, puis passer à la pagination keyset",
    "Composer des filtres et un tri dynamiques sans ouvrir de faille",
    "Choisir entre PUT et PATCH et implémenter une mise à jour partielle",
    "Gérer la concurrence avec ETag, If-Match et RowVersion",
    "Recevoir, valider, stocker et renvoyer des fichiers en toute sécurité"
  ],
  lesson: `
<h3>Pourquoi un endpoint de liste ne renvoie jamais tout</h3>
<p>Le premier <code>GET /api/orders</code> qu'on écrit fait souvent <code>return await db.Orders.ToListAsync()</code>. Avec 50 commandes de test, tout va bien. Avec 2 millions de lignes en production, l'endpoint charge tout en mémoire, sérialise des centaines de mégaoctets et fait tomber le serveur. C'est le risque n° 4 de l'OWASP API Security Top 10 : la <strong>consommation de ressources non bornée</strong>. Toute liste doit être paginée, avec une taille de page <strong>bornée côté serveur</strong> : le client propose <code>pageSize=500</code>, le serveur applique au plus 100.</p>

<h3>Pagination par offset</h3>
<p>La pagination classique utilise <code>Skip((page - 1) * pageSize).Take(pageSize)</code>, que EF Core traduit en <code>OFFSET ... ROWS FETCH NEXT ... ROWS ONLY</code> sur SQL Server. Trois règles :</p>
<ul>
  <li><strong>Toujours un <code>OrderBy</code></strong> avant <code>Skip</code> : sans tri, SQL Server ne garantit aucun ordre et une ligne peut apparaître sur deux pages. EF Core affiche d'ailleurs un avertissement.</li>
  <li><strong>Un tri déterministe</strong> : si tu tries par date et que deux commandes ont la même date, ajoute <code>ThenBy(o =&gt; o.Id)</code>.</li>
  <li><strong>Le total</strong> (<code>CountAsync</code>) permet au front d'afficher « page 3 sur 120 ». Il coûte une seconde requête : sur de très grosses tables, on le rend optionnel.</li>
</ul>
<p>Le résultat se renvoie dans un objet enveloppe <code>PagedResponse&lt;T&gt;</code> avec <code>Items</code>, <code>Page</code>, <code>PageSize</code>, <code>TotalCount</code> et <code>TotalPages</code>. Une autre convention met les métadonnées dans des en-têtes (<code>X-Total-Count</code>, <code>Link</code>). Le corps est plus simple à consommer depuis Angular ; si tu utilises des en-têtes, pense à les exposer dans la politique CORS avec <code>WithExposedHeaders</code>, sinon le navigateur les masque.</p>

<h3>Pagination keyset pour les gros volumes</h3>
<p>Avec <code>OFFSET</code>, SQL Server doit lire et jeter toutes les lignes précédentes : la page 10 000 est très lente. La <strong>pagination keyset</strong> (ou « par curseur ») remplace le numéro de page par la dernière clé vue : <code>Where(o =&gt; o.Id &gt; lastId).OrderBy(o =&gt; o.Id).Take(pageSize)</code>. Avec un index sur la colonne, chaque page coûte le même prix. En contrepartie, on ne peut pas sauter directement à la page 500 : c'est parfait pour un défilement infini ou un export, moins pour une grille paginée classique.</p>
<table>
  <thead><tr><th>Critère</th><th>Offset (page/pageSize)</th><th>Keyset (curseur)</th></tr></thead>
  <tbody>
    <tr><td>Performance sur les pages lointaines</td><td>Se dégrade</td><td>Constante (avec index)</td></tr>
    <tr><td>Aller à la page N</td><td>Oui</td><td>Non</td></tr>
    <tr><td>Stabilité si des lignes sont insérées</td><td>Doublons ou lignes sautées possibles</td><td>Stable</td></tr>
    <tr><td>Usage typique</td><td>Grille d'administration</td><td>Défilement infini, export, synchronisation</td></tr>
  </tbody>
</table>

<h3>Filtres, recherche et tri dynamiques</h3>
<p>Un <code>IQueryable</code> n'est exécuté qu'au moment de <code>ToListAsync</code>. Tu peux donc le <strong>composer</strong> : ajouter un <code>Where</code> seulement si le paramètre est renseigné. EF Core génère une seule requête SQL avec uniquement les conditions utiles. Regroupe les paramètres dans un objet (<code>OrderQuery</code>) lié avec <code>[FromQuery]</code> en controller ou <code>[AsParameters]</code> en Minimal API.</p>
<p>Pour la recherche texte, <code>Contains</code> devient <code>LIKE '%texte%'</code> : simple, mais il ne peut pas utiliser d'index. <code>StartsWith</code> devient <code>LIKE 'texte%'</code> et peut l'utiliser. Pour une vraie recherche plein texte, SQL Server propose le full-text search (<code>EF.Functions.Contains</code>).</p>
<p>Le <strong>tri dynamique</strong> est un piège classique. Construire une clause <code>ORDER BY</code> à partir d'une chaîne envoyée par le client, c'est ouvrir la porte à l'injection SQL ou au tri sur une colonne non indexée qui écroule la base. La bonne pratique : une <strong>liste blanche</strong> de champs autorisés, traduite par un <code>switch</code> en expressions LINQ typées. Tout champ inconnu donne un <code>400</code>, ou le tri par défaut.</p>

<h3>PUT ou PATCH</h3>
<p><strong>PUT</strong> remplace la ressource entière : le client envoie tous les champs, et un champ absent est remis à sa valeur par défaut. C'est simple et idempotent. <strong>PATCH</strong> modifie seulement certains champs. Deux formats existent :</p>
<ul>
  <li><strong>JSON Merge Patch</strong> (RFC 7396) : on envoie un JSON partiel. En C#, on le représente par un DTO dont toutes les propriétés sont nullables : <code>null</code> signifie « ne pas toucher ». Limite : on ne peut pas distinguer « ne pas toucher » et « mettre à null ». Pour ce cas rare, on ajoute un champ explicite ou on utilise JSON Patch.</li>
  <li><strong>JSON Patch</strong> (RFC 6902) : on envoie une liste d'opérations (<code>replace</code>, <code>add</code>, <code>remove</code>). Historiquement, ASP.NET Core le supportait seulement avec Newtonsoft.Json ; .NET 10 ajoute un support basé sur System.Text.Json (package <code>Microsoft.AspNetCore.JsonPatch.SystemTextJson</code>). C'est puissant mais plus complexe à valider.</li>
</ul>
<p>Dans la majorité des APIs métier, le DTO à champs optionnels est le meilleur compromis : facile à valider, facile à documenter et naturel côté Angular.</p>

<h3>Concurrence : ETag, If-Match et RowVersion</h3>
<p>Deux utilisateurs ouvrent la même commande. Le premier change l'adresse et enregistre, puis le second change la quantité et enregistre : la modification du premier est écrasée sans que personne ne le sache. C'est le problème de la <strong>mise à jour perdue</strong>.</p>
<p>La solution HTTP est l'<strong>ETag</strong>, une version de la ressource renvoyée dans l'en-tête <code>ETag</code> du <code>GET</code>. Pour modifier, le client renvoie cette valeur dans <code>If-Match</code>. Si la ressource a changé entre-temps, le serveur répond <code>412 Precondition Failed</code>. Côté base, on utilise une colonne <code>rowversion</code> de SQL Server (propriété <code>byte[]</code> marquée <code>[Timestamp]</code> ou <code>IsRowVersion()</code>) : SQL Server l'incrémente à chaque modification et EF Core l'ajoute dans le <code>WHERE</code> de l'<code>UPDATE</code>. Si aucune ligne n'est modifiée, EF lève <code>DbUpdateConcurrencyException</code>. L'ETag est simplement la <code>RowVersion</code> encodée en Base64.</p>

<h3>Suppression logique</h3>
<p>Supprimer physiquement une commande casse l'historique, la comptabilité et parfois des obligations légales. La <strong>suppression logique</strong> ajoute <code>IsDeleted</code> (et souvent <code>DeletedAt</code>, <code>DeletedBy</code>). Le <code>DELETE</code> HTTP passe le flag à <code>true</code>, et un <strong>filtre de requête global</strong> EF Core (<code>HasQueryFilter(o =&gt; !o.IsDeleted)</code>) masque ces lignes dans toutes les requêtes. <code>IgnoreQueryFilters()</code> permet de les retrouver pour un écran d'administration. Pense aux index uniques : un email « supprimé » bloque la réutilisation de l'email, sauf avec un index filtré.</p>

<h3>Upload et téléchargement de fichiers</h3>
<p>Un fichier reçu est une <strong>donnée non fiable</strong>. Les règles :</p>
<ul>
  <li><strong>Limiter la taille</strong> : Kestrel accepte 30 Mo par défaut. Abaisse la limite par endpoint (<code>[RequestSizeLimit]</code>) et vérifie <code>file.Length</code>.</li>
  <li><strong>Valider le type par le contenu</strong> : l'extension et le <code>Content-Type</code> sont choisis par le client. Vérifie les premiers octets (« magic numbers » : <code>FF D8 FF</code> pour JPEG, <code>89 50 4E 47</code> pour PNG) et une liste blanche d'extensions.</li>
  <li><strong>Ne jamais utiliser le nom envoyé</strong> pour stocker : il peut contenir <code>../../</code> (path traversal) ou écraser un fichier existant. Génère un nom (<code>Guid</code>) et garde le nom d'origine en base, seulement pour l'affichage.</li>
  <li><strong>Stocker hors de <code>wwwroot</code></strong>, ou mieux dans un stockage objet (Azure Blob Storage, S3). La base ne garde que le chemin ou la clé.</li>
</ul>
<p>En Minimal API, un paramètre <code>IFormFile</code> active la protection antiforgery depuis .NET 8. Pour une API appelée avec un JWT (pas de cookie), on la désactive sur l'endpoint avec <code>.DisableAntiforgery()</code>. Pour renvoyer un fichier : <code>Results.File(stream, contentType, fileName)</code> ou <code>File(...)</code> dans un controller. Pour un export volumineux, <strong>streame</strong> la réponse ligne par ligne avec <code>AsAsyncEnumerable()</code> au lieu de construire tout le fichier en mémoire.</p>

<h3>Pièges courants</h3>
<ul>
  <li>Compter avec <code>query.Count()</code> <em>après</em> <code>Skip</code>/<code>Take</code> : le total vaut alors au plus <code>pageSize</code>.</li>
  <li>Appliquer la pagination en mémoire (<code>ToListAsync()</code> puis <code>Skip</code>) : toute la table est chargée avant d'être découpée.</li>
  <li>Renvoyer <code>200</code> avec une liste vide pour une page au-delà de la dernière, sans <code>TotalCount</code> : le front ne sait pas s'il doit revenir en arrière.</li>
  <li>Accepter un <code>PUT</code> partiel : un champ oublié par le client efface silencieusement la donnée en base.</li>
</ul>

<div class="note">Un senior conçoit l'endpoint de liste en pensant au jour où la table aura 10 millions de lignes. Il borne <code>pageSize</code>, impose un tri déterministe, vérifie que chaque filtre et chaque tri autorisé est couvert par un index, et ajoute <code>AsNoTracking()</code> avec une projection <code>Select</code> vers un DTO plutôt que de charger des entités complètes. Sur les mises à jour, il se pose la question de la concurrence avant qu'un client ne signale des modifications « qui disparaissent ».</div>
`,
  examples: [
    {
      title: "Liste paginée, filtrée et triée avec liste blanche",
      code: `using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

public sealed record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount)
{
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

// Paramètres de requête : ?page=2&pageSize=20&status=Pending&customer=dup&sort=-createdAt
public sealed record OrderQuery(
    int Page = 1,
    int PageSize = 20,
    OrderStatus? Status = null,
    string? Customer = null,
    DateTime? From = null,
    string? Sort = null);

public sealed record OrderListItem(int Id, string CustomerName, OrderStatus Status, DateTime CreatedAt, decimal Total);

public static class OrderListEndpoint
{
    private const int MaxPageSize = 100;

    public static async Task<Results<Ok<PagedResponse<OrderListItem>>, ProblemHttpResult>> Handle(
        [AsParameters] OrderQuery q, OrderFlowDbContext db, CancellationToken ct)
    {
        var page = Math.Max(1, q.Page);
        var pageSize = Math.Clamp(q.PageSize, 1, MaxPageSize); // borne côté serveur

        IQueryable<Order> query = db.Orders.AsNoTracking();

        // Filtres ajoutés seulement s'ils sont renseignés
        if (q.Status is not null)
            query = query.Where(o => o.Status == q.Status);
        if (!string.IsNullOrWhiteSpace(q.Customer))
            query = query.Where(o => o.Customer.Name.StartsWith(q.Customer)); // LIKE 'dup%'
        if (q.From is not null)
            query = query.Where(o => o.CreatedAt >= q.From);

        // Tri par liste blanche : jamais de chaîne SQL construite depuis l'entrée
        IOrderedQueryable<Order>? sorted = q.Sort switch
        {
            null or "" or "-createdAt" => query.OrderByDescending(o => o.CreatedAt),
            "createdAt" => query.OrderBy(o => o.CreatedAt),
            "total" => query.OrderBy(o => o.Lines.Sum(l => l.Quantity * l.UnitPrice)),
            "-total" => query.OrderByDescending(o => o.Lines.Sum(l => l.Quantity * l.UnitPrice)),
            "customer" => query.OrderBy(o => o.Customer.Name),
            _ => null
        };
        if (sorted is null)
            return TypedResults.Problem($"Tri '{q.Sort}' non autorisé.", statusCode: 400);

        var total = await query.CountAsync(ct);
        var items = await sorted
            .ThenBy(o => o.Id)                      // tri déterministe
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderListItem(          // projection : seulement les colonnes utiles
                o.Id, o.Customer.Name, o.Status, o.CreatedAt,
                o.Lines.Sum(l => l.Quantity * l.UnitPrice)))
            .ToListAsync(ct);

        return TypedResults.Ok(new PagedResponse<OrderListItem>(items, page, pageSize, total));
    }
}

// Program.cs
// app.MapGet("/api/orders", OrderListEndpoint.Handle).WithTags("Orders");`,
      explain: "La requête de comptage et la requête de page partagent les mêmes filtres. <code>[AsParameters]</code> lie chaque propriété du record depuis la query string. La projection <code>Select</code> évite de charger les entités et leurs relations."
    },
    {
      title: "Pagination keyset pour un défilement infini",
      code: `using Microsoft.EntityFrameworkCore;

public sealed record CursorPage<T>(IReadOnlyList<T> Items, string? NextCursor);

public sealed record ProductItem(int Id, string Name, decimal Price);

public static class ProductFeedEndpoint
{
    // GET /api/products/feed?after=1234&limit=50
    public static async Task<IResult> Handle(int? after, int? limit, OrderFlowDbContext db, CancellationToken ct)
    {
        var take = Math.Clamp(limit ?? 50, 1, 200);
        var lastId = after ?? 0;

        // WHERE Id > @lastId ORDER BY Id : utilise la clé primaire, coût constant
        var items = await db.Products.AsNoTracking()
            .Where(p => p.Id > lastId)
            .OrderBy(p => p.Id)
            .Take(take + 1)                // un élément de plus pour savoir s'il reste une page
            .Select(p => new ProductItem(p.Id, p.Name, p.Price))
            .ToListAsync(ct);

        var hasMore = items.Count > take;
        if (hasMore) items.RemoveAt(items.Count - 1);

        var next = hasMore ? items[^1].Id.ToString() : null;
        return Results.Ok(new CursorPage<ProductItem>(items, next));
    }
}

// Côté Angular : on rappelle l'API avec ?after=<nextCursor> tant que nextCursor n'est pas null.`,
      explain: "Demander <code>take + 1</code> éléments évite une requête de comptage : s'il en revient un de plus, il existe une page suivante. Pour un tri par date, le curseur combine la date et l'id : <code>Where(o =&gt; o.CreatedAt &lt; d || (o.CreatedAt == d &amp;&amp; o.Id &lt; id))</code>."
    },
    {
      title: "PATCH avec DTO optionnel, ETag et If-Match",
      code: `using Microsoft.EntityFrameworkCore;

// Entité : RowVersion géré par SQL Server (colonne rowversion)
public sealed class Customer
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public string? Phone { get; set; }
    public string? ShippingAddress { get; set; }
    [System.ComponentModel.DataAnnotations.Timestamp]
    public byte[] RowVersion { get; set; } = [];
}

// null = « ne pas modifier »
public sealed record CustomerPatch(string? Name, string? Phone, string? ShippingAddress);

public static class CustomerEndpoints
{
    public static void Map(WebApplication app)
    {
        app.MapGet("/api/customers/{id:int}", async (int id, HttpContext http, OrderFlowDbContext db) =>
        {
            var c = await db.Customers.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (c is null) return Results.NotFound();

            http.Response.Headers.ETag = ToETag(c.RowVersion);
            return Results.Ok(new { c.Id, c.Name, c.Phone, c.ShippingAddress });
        });

        app.MapPatch("/api/customers/{id:int}", async (int id, CustomerPatch patch, HttpContext http, OrderFlowDbContext db) =>
        {
            var ifMatch = http.Request.Headers.IfMatch.ToString();
            if (string.IsNullOrEmpty(ifMatch))
                return Results.Problem("L'en-tête If-Match est obligatoire.", statusCode: 428);

            var c = await db.Customers.FirstOrDefaultAsync(x => x.Id == id);
            if (c is null) return Results.NotFound();

            // On indique à EF la version que le client avait lue
            db.Entry(c).Property(x => x.RowVersion).OriginalValue = FromETag(ifMatch);

            if (patch.Name is not null) c.Name = patch.Name.Trim();
            if (patch.Phone is not null) c.Phone = patch.Phone;
            if (patch.ShippingAddress is not null) c.ShippingAddress = patch.ShippingAddress;

            try
            {
                await db.SaveChangesAsync(); // UPDATE ... WHERE Id = @id AND RowVersion = @original
            }
            catch (DbUpdateConcurrencyException)
            {
                return Results.Problem("La ressource a été modifiée par quelqu'un d'autre. Recharge-la.",
                    statusCode: StatusCodes.Status412PreconditionFailed);
            }

            http.Response.Headers.ETag = ToETag(c.RowVersion); // nouvelle version
            return Results.NoContent();
        });
    }

    private static string ToETag(byte[] rowVersion) => $"\\"{Convert.ToBase64String(rowVersion)}\\"";
    private static byte[] FromETag(string etag) => Convert.FromBase64String(etag.Trim('"'));
}`,
      explain: "Un ETag est une chaîne entre guillemets, d'où les <code>\\\"</code>. Le <code>428 Precondition Required</code> force les clients à envoyer <code>If-Match</code> ; le <code>412</code> signale une modification concurrente. Une valeur Base64 invalide lèverait <code>FormatException</code> : en production, valide-la et renvoie un 400."
    },
    {
      title: "Suppression logique avec filtre global",
      code: `using Microsoft.EntityFrameworkCore;

public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTime? DeletedAt { get; set; }
}

public sealed class Product : ISoftDeletable
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public decimal Price { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}

public sealed class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Masque les produits supprimés dans TOUTES les requêtes
        modelBuilder.Entity<Product>().HasQueryFilter(p => !p.IsDeleted);
        // Index filtré : le nom reste unique parmi les produits actifs seulement
        modelBuilder.Entity<Product>().HasIndex(p => p.Name).IsUnique().HasFilter("[IsDeleted] = 0");
    }
}

// Endpoints
// app.MapDelete("/api/products/{id:int}", async (int id, OrderFlowDbContext db) =>
// {
//     var p = await db.Products.FindAsync(id);
//     if (p is null) return Results.NotFound();
//     p.IsDeleted = true;
//     p.DeletedAt = DateTime.UtcNow;
//     await db.SaveChangesAsync();
//     return Results.NoContent();
// });
//
// Écran d'administration : retrouver aussi les produits supprimés
// app.MapGet("/api/admin/products/deleted", (OrderFlowDbContext db) =>
//     db.Products.IgnoreQueryFilters().Where(p => p.IsDeleted).ToListAsync())
//   .RequireAuthorization("Admin");`,
      explain: "<code>FindAsync</code> respecte aussi le filtre global : un produit déjà supprimé renvoie <code>null</code>, donc un second <code>DELETE</code> donne 404. Certaines équipes préfèrent renvoyer 204 pour rendre le <code>DELETE</code> idempotent."
    },
    {
      title: "Upload d'image validée, téléchargement et export CSV en streaming",
      code: `using System.Globalization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public static class FileEndpoints
{
    private const long MaxBytes = 2 * 1024 * 1024; // 2 Mo
    private static readonly Dictionary<string, (string Ext, byte[] Magic)> Allowed = new()
    {
        ["image/jpeg"] = (".jpg", [0xFF, 0xD8, 0xFF]),
        ["image/png"] = (".png", [0x89, 0x50, 0x4E, 0x47])
    };

    public static void Map(WebApplication app, string storageRoot)
    {
        app.MapPost("/api/products/{id:int}/image", async (int id, IFormFile file, OrderFlowDbContext db) =>
        {
            if (file.Length is 0 or > MaxBytes)
                return Results.Problem("Le fichier doit faire entre 1 octet et 2 Mo.", statusCode: 400);

            // Le Content-Type est fourni par le client : on vérifie aussi les premiers octets
            if (!Allowed.TryGetValue(file.ContentType, out var rule))
                return Results.Problem("Seuls JPEG et PNG sont acceptés.", statusCode: 415);

            var header = new byte[rule.Magic.Length];
            await using (var s = file.OpenReadStream())
                await s.ReadExactlyAsync(header);
            if (!header.AsSpan().SequenceEqual(rule.Magic))
                return Results.Problem("Le contenu ne correspond pas au type annoncé.", statusCode: 415);

            var product = await db.Products.FindAsync(id);
            if (product is null) return Results.NotFound();

            // Nom généré : jamais file.FileName (path traversal, écrasement)
            var storedName = $"{Guid.NewGuid():N}{rule.Ext}";
            Directory.CreateDirectory(storageRoot);
            await using (var target = File.Create(Path.Combine(storageRoot, storedName)))
                await file.CopyToAsync(target);

            product.ImageFile = storedName;
            await db.SaveChangesAsync();
            return Results.Created($"/api/products/{id}/image", new { storedName });
        })
        .DisableAntiforgery()                           // API appelée avec un JWT, pas de cookie
        .WithMetadata(new RequestSizeLimitAttribute(MaxBytes + 64 * 1024)); // corps multipart un peu plus gros

        app.MapGet("/api/products/{id:int}/image", async (int id, OrderFlowDbContext db) =>
        {
            var p = await db.Products.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id);
            if (p?.ImageFile is null) return Results.NotFound();

            var path = Path.Combine(storageRoot, p.ImageFile);
            var type = p.ImageFile.EndsWith(".png") ? "image/png" : "image/jpeg";
            return Results.File(File.OpenRead(path), type); // le stream est fermé par le framework
        });

        // Export CSV : écrit ligne par ligne, mémoire constante même pour 1 million de lignes
        app.MapGet("/api/orders/export", async (HttpContext http, OrderFlowDbContext db, CancellationToken ct) =>
        {
            http.Response.ContentType = "text/csv; charset=utf-8";
            http.Response.Headers.ContentDisposition = "attachment; filename=orders.csv";

            await using var writer = new StreamWriter(http.Response.Body);
            await writer.WriteLineAsync("Id;Customer;Status;CreatedAt");

            await foreach (var o in db.Orders.AsNoTracking()
                .OrderBy(o => o.Id)
                .Select(o => new { o.Id, Customer = o.Customer.Name, o.Status, o.CreatedAt })
                .AsAsyncEnumerable().WithCancellation(ct))
            {
                // Échappement CSV minimal : guillemets doublés
                var name = o.Customer.Replace("\\"", "\\"\\"");
                await writer.WriteLineAsync(
                    $"{o.Id};\\"{name}\\";{o.Status};{o.CreatedAt.ToString("O", CultureInfo.InvariantCulture)}");
            }
        });
    }
}`,
      explain: "La propriété <code>ImageFile</code> est ajoutée à <code>Product</code>. Pour une vraie application, stocke dans Azure Blob Storage et protège aussi l'export avec une autorisation et un rate limiting. Attention à l'injection CSV : une cellule qui commence par <code>=</code> peut être interprétée comme une formule par Excel."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Pagination des produits avec bornes",
      prompt: "<p>Écris un endpoint <code>GET /api/products?page=&amp;pageSize=</code> qui renvoie un <code>PagedResponse&lt;ProductItem&gt;</code> trié par nom puis par id. La page minimale est 1, la taille par défaut 20 et la taille maximale 50. Ajoute un filtre optionnel <code>minPrice</code>.</p>",
      hint: "<p><code>Math.Max</code> et <code>Math.Clamp</code> pour les bornes. Applique le filtre <em>avant</em> <code>CountAsync</code> pour que le total soit juste.</p>",
      solution: `using Microsoft.EntityFrameworkCore;

public sealed record ProductItem(int Id, string Name, decimal Price);
public sealed record PagedResponse<T>(IReadOnlyList<T> Items, int Page, int PageSize, int TotalCount);

// Program.cs
app.MapGet("/api/products", async (int? page, int? pageSize, decimal? minPrice,
    OrderFlowDbContext db, CancellationToken ct) =>
{
    var p = Math.Max(1, page ?? 1);
    var size = Math.Clamp(pageSize ?? 20, 1, 50);

    var query = db.Products.AsNoTracking();
    if (minPrice is not null)
        query = query.Where(x => x.Price >= minPrice);

    var total = await query.CountAsync(ct);
    var items = await query
        .OrderBy(x => x.Name).ThenBy(x => x.Id)
        .Skip((p - 1) * size)
        .Take(size)
        .Select(x => new ProductItem(x.Id, x.Name, x.Price))
        .ToListAsync(ct);

    return Results.Ok(new PagedResponse<ProductItem>(items, p, size, total));
});`
    },
    {
      level: "moyen",
      title: "Tri multi-champs par liste blanche",
      prompt: "<p>Écris une méthode d'extension <code>ApplySort(this IQueryable&lt;Order&gt; query, string? sort)</code> qui accepte une liste séparée par des virgules, par exemple <code>status,-createdAt</code> (le <code>-</code> signifie décroissant). Champs autorisés : <code>status</code>, <code>createdAt</code>, <code>customer</code>. Un champ inconnu lève <code>ArgumentException</code>. Termine toujours par un tri sur <code>Id</code>.</p>",
      hint: "<p>Le premier champ utilise <code>OrderBy</code>/<code>OrderByDescending</code>, les suivants <code>ThenBy</code>/<code>ThenByDescending</code>. Une méthode générique privée qui prend une <code>Expression&lt;Func&lt;Order, TKey&gt;&gt;</code> évite de dupliquer le code.</p>",
      solution: `using System.Linq.Expressions;

public static class OrderSortExtensions
{
    public static IOrderedQueryable<Order> ApplySort(this IQueryable<Order> query, string? sort)
    {
        IOrderedQueryable<Order>? ordered = null;
        var fields = (sort ?? "-createdAt").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        foreach (var raw in fields)
        {
            var desc = raw.StartsWith('-');
            var name = desc ? raw[1..] : raw;

            ordered = name.ToLowerInvariant() switch
            {
                "status" => Order(query, ordered, o => o.Status, desc),
                "createdat" => Order(query, ordered, o => o.CreatedAt, desc),
                "customer" => Order(query, ordered, o => o.Customer.Name, desc),
                _ => throw new ArgumentException($"Tri non autorisé : {name}", nameof(sort))
            };
        }

        // Tri final déterministe
        return ordered is null ? query.OrderBy(o => o.Id) : ordered.ThenBy(o => o.Id);
    }

    private static IOrderedQueryable<Order> Order<TKey>(
        IQueryable<Order> source, IOrderedQueryable<Order>? ordered,
        Expression<Func<Order, TKey>> key, bool desc)
    {
        if (ordered is null)
            return desc ? source.OrderByDescending(key) : source.OrderBy(key);
        return desc ? ordered.ThenByDescending(key) : ordered.ThenBy(key);
    }
}

// Utilisation dans l'endpoint
// try { var items = await query.ApplySort(q.Sort).Skip(...).Take(...).ToListAsync(ct); }
// catch (ArgumentException ex) { return Results.Problem(ex.Message, statusCode: 400); }`
    },
    {
      level: "difficile",
      title: "Upload sécurisé testable avec un service de stockage",
      prompt: "<p>Extrais la logique d'upload dans un service <code>IFileStorage</code> avec une implémentation disque <code>LocalFileStorage</code> (méthodes <code>SaveAsync(Stream, string extension, CancellationToken)</code> qui renvoie le nom stocké, et <code>OpenRead(string name)</code>). Écris un validateur statique <code>ImageValidator.Validate(IFormFile)</code> qui renvoie un message d'erreur ou <code>null</code> (taille, type, magic numbers). <code>OpenRead</code> doit refuser tout nom qui ne correspond pas exactement au format généré (32 caractères hexadécimaux + <code>.jpg</code> ou <code>.png</code>), pour bloquer le path traversal.</p>",
      hint: "<p>Une <code>Regex</code> <code>^[a-f0-9]{32}\\.(jpg|png)$</code> valide le nom. Une interface est justifiée ici : on veut pouvoir passer à Azure Blob Storage sans toucher aux endpoints, et utiliser un faux stockage en test.</p>",
      solution: `using System.Text.RegularExpressions;

public interface IFileStorage
{
    Task<string> SaveAsync(Stream content, string extension, CancellationToken ct);
    Stream OpenRead(string storedName);
}

public sealed partial class LocalFileStorage(IConfiguration config) : IFileStorage
{
    private readonly string _root = config["Storage:Root"] ?? Path.Combine(AppContext.BaseDirectory, "uploads");

    [GeneratedRegex("^[a-f0-9]{32}\\\\.(jpg|png)$")]
    private static partial Regex StoredNamePattern();

    public async Task<string> SaveAsync(Stream content, string extension, CancellationToken ct)
    {
        if (extension is not (".jpg" or ".png"))
            throw new ArgumentException("Extension non autorisée.", nameof(extension));

        Directory.CreateDirectory(_root);
        var name = $"{Guid.NewGuid():N}{extension}";
        await using var target = File.Create(Path.Combine(_root, name));
        await content.CopyToAsync(target, ct);
        return name;
    }

    public Stream OpenRead(string storedName)
    {
        // Bloque "../../appsettings.json" et tout nom non généré par nous
        if (!StoredNamePattern().IsMatch(storedName))
            throw new ArgumentException("Nom de fichier invalide.", nameof(storedName));
        return File.OpenRead(Path.Combine(_root, storedName));
    }
}

public static class ImageValidator
{
    public const long MaxBytes = 2 * 1024 * 1024;

    private static readonly Dictionary<string, (string Ext, byte[] Magic)> Rules = new()
    {
        ["image/jpeg"] = (".jpg", [0xFF, 0xD8, 0xFF]),
        ["image/png"] = (".png", [0x89, 0x50, 0x4E, 0x47])
    };

    public static (string? Error, string? Extension) Validate(IFormFile file)
    {
        if (file.Length == 0) return ("Le fichier est vide.", null);
        if (file.Length > MaxBytes) return ("Le fichier dépasse 2 Mo.", null);
        if (!Rules.TryGetValue(file.ContentType, out var rule)) return ("Seuls JPEG et PNG sont acceptés.", null);

        Span<byte> header = stackalloc byte[4];
        using var s = file.OpenReadStream();
        var read = s.Read(header);
        if (read < rule.Magic.Length || !header[..rule.Magic.Length].SequenceEqual(rule.Magic))
            return ("Le contenu ne correspond pas au type annoncé.", null);

        return (null, rule.Ext);
    }
}

// Program.cs
// builder.Services.AddSingleton<IFileStorage, LocalFileStorage>();
// app.MapPost("/api/products/{id:int}/image", async (int id, IFormFile file, IFileStorage storage,
//     OrderFlowDbContext db, CancellationToken ct) =>
// {
//     var (error, ext) = ImageValidator.Validate(file);
//     if (error is not null) return Results.Problem(error, statusCode: 400);
//     var product = await db.Products.FindAsync([id], ct);
//     if (product is null) return Results.NotFound();
//     await using var stream = file.OpenReadStream();
//     product.ImageFile = await storage.SaveAsync(stream, ext!, ct);
//     await db.SaveChangesAsync(ct);
//     return Results.NoContent();
// }).DisableAntiforgery();`
    }
  ],
  project: "<p>Dans <strong>OrderFlow.Api</strong> :</p><ul><li>Remplace <code>GET /api/orders</code> par une liste paginée (taille max 100), filtrable par statut, client et période, triable par liste blanche, avec projection vers <code>OrderListItem</code>.</li><li>Ajoute un index SQL Server sur <code>(Status, CreatedAt)</code> via une migration et vérifie le plan d'exécution de la requête générée.</li><li>Ajoute une colonne <code>RowVersion</code> à <code>Order</code> et protège le <code>PATCH /api/orders/{id}</code> avec <code>If-Match</code>.</li><li>Implémente la suppression logique des produits avec un filtre global.</li><li>Ajoute l'upload d'image produit (JPEG/PNG, 2 Mo max, magic numbers) et l'endpoint qui renvoie l'image.</li><li>Côté Angular, affiche la liste des commandes avec <code>mat-paginator</code> ou équivalent en lisant <code>totalCount</code>.</li></ul>",
  resources: [
    { label: "Pagination avec EF Core (offset et keyset)", url: "https://learn.microsoft.com/ef/core/querying/pagination" },
    { label: "Gestion des conflits de concurrence avec EF Core", url: "https://learn.microsoft.com/ef/core/saving/concurrency" },
    { label: "Filtres de requête globaux EF Core", url: "https://learn.microsoft.com/ef/core/querying/filters" },
    { label: "Upload de fichiers dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/mvc/models/file-uploads" },
    { label: "OWASP API Security Top 10", url: "https://owasp.org/API-Security/" }
  ]
});

/* ===================================================================
   Jour 46 : Documentation OpenAPI et versioning
   =================================================================== */
window.COURSE.push({
  key: "w-openapi-versioning",
  title: "Documentation OpenAPI et versioning",
  summary: "Produire une documentation OpenAPI riche et exploitable, générer le client Angular à partir d'elle, puis faire évoluer l'API sans casser ses consommateurs.",
  objectives: [
    "Générer le document OpenAPI avec Microsoft.AspNetCore.OpenApi et l'afficher avec Scalar",
    "Enrichir la documentation : résumés, réponses, tags, commentaires XML",
    "Déclarer l'authentification JWT dans le document avec un transformer",
    "Générer un client TypeScript pour Angular depuis le document",
    "Versionner une API avec Asp.Versioning et distinguer changements cassants et compatibles"
  ],
  lesson: `
<h3>OpenAPI : le contrat de ton API</h3>
<p>OpenAPI (anciennement Swagger) est une spécification JSON ou YAML qui décrit chaque endpoint : chemin, méthode, paramètres, corps attendu, réponses possibles, schémas des DTOs et mécanisme d'authentification. Ce document est un <strong>contrat</strong> entre le back et ses consommateurs. Il sert à afficher une documentation interactive, à générer des clients typés (TypeScript, C#, Java), à écrire des tests de contrat et à importer l'API dans un gateway comme Azure API Management.</p>
<p>Depuis .NET 9, ASP.NET Core génère le document <strong>nativement</strong> avec le package <code>Microsoft.AspNetCore.OpenApi</code> : <code>builder.Services.AddOpenApi()</code> puis <code>app.MapOpenApi()</code>, qui expose <code>/openapi/v1.json</code>. Le template <code>webapi</code> n'inclut plus Swashbuckle ni d'interface graphique. Pour l'interface, deux choix courants :</p>
<table>
  <thead><tr><th>Outil</th><th>Rôle</th><th>Remarque</th></tr></thead>
  <tbody>
    <tr><td><strong>Scalar</strong> (<code>Scalar.AspNetCore</code>)</td><td>Interface moderne qui lit le document natif</td><td><code>app.MapScalarApiReference()</code>, disponible sur <code>/scalar</code>. Exemples de code générés, test des requêtes.</td></tr>
    <tr><td><strong>Swashbuckle</strong></td><td>Générateur et interface Swagger UI historiques</td><td>Encore très présent dans les projets existants. On peut aussi n'utiliser que son interface sur le document natif.</td></tr>
    <tr><td><strong>Fichiers .http</strong></td><td>Requêtes versionnées dans le dépôt</td><td>Supportés par Visual Studio et VS Code (REST Client), complément idéal.</td></tr>
  </tbody>
</table>
<p>On n'expose généralement l'interface qu'en développement (<code>if (app.Environment.IsDevelopment())</code>). Le document JSON, lui, peut rester accessible si des clients externes en ont besoin, éventuellement protégé par une autorisation.</p>

<h3>Enrichir la documentation</h3>
<p>Un document généré sans effort liste les routes, mais il est pauvre : pas de description, une seule réponse <code>200</code>, des schémas sans exemple. Pour le rendre utile :</p>
<ul>
  <li><strong>Minimal APIs</strong> : <code>.WithName("GetOrderById")</code> (devient l'<code>operationId</code>, donc le nom de méthode du client généré), <code>.WithSummary(...)</code>, <code>.WithDescription(...)</code>, <code>.WithTags("Orders")</code>, <code>.Produces&lt;OrderDto&gt;(200)</code>, <code>.ProducesProblem(404)</code>, <code>.ProducesValidationProblem()</code>.</li>
  <li><strong>TypedResults et <code>Results&lt;...&gt;</code></strong> : un handler qui renvoie <code>Results&lt;Ok&lt;OrderDto&gt;, NotFound&gt;</code> documente automatiquement ses deux réponses. C'est la méthode la plus fiable, car la doc ne peut pas diverger du code.</li>
  <li><strong>Controllers</strong> : <code>[ProducesResponseType&lt;OrderDto&gt;(StatusCodes.Status200OK)]</code>, <code>[ProducesResponseType(StatusCodes.Status404NotFound)]</code>, <code>[EndpointSummary]</code>, <code>[Tags]</code>.</li>
  <li><strong>Commentaires XML</strong> : en .NET 10, avec <code>&lt;GenerateDocumentationFile&gt;true&lt;/GenerateDocumentationFile&gt;</code> dans le <code>.csproj</code>, les <code>/// &lt;summary&gt;</code> des endpoints et des DTOs sont repris dans le document.</li>
</ul>

<h3>Les transformers</h3>
<p>Le générateur natif se personnalise avec des <strong>transformers</strong> : de document (modifier le document entier), d'opération (chaque endpoint) ou de schéma (chaque type). Cas d'usage classique : déclarer le schéma de sécurité <strong>Bearer JWT</strong> pour que Scalar affiche un champ « token » et que le client généré envoie l'en-tête <code>Authorization</code>. Autres usages : ajouter des informations de contact et de licence, ou ajouter l'en-tête <code>X-Correlation-Id</code> à chaque opération.</p>
<p>Attention : .NET 10 utilise la version 2 de la bibliothèque <code>Microsoft.OpenApi</code>, dont les espaces de noms et certains types ont changé par rapport à .NET 9 (par exemple <code>Microsoft.OpenApi.Models</code> disparaît). Les exemples trouvés en ligne pour .NET 9 demandent donc parfois une adaptation.</p>

<h3>Générer le client Angular</h3>
<p>Écrire à la main les interfaces TypeScript et les services HTTP d'Angular, c'est dupliquer le contrat et risquer les divergences. Avec le document OpenAPI, un générateur produit les interfaces des DTOs et un service par tag :</p>
<ul>
  <li><strong>openapi-generator</strong> (générateur <code>typescript-angular</code>) : services injectables Angular avec <code>HttpClient</code>.</li>
  <li><strong>NSwag</strong> : très utilisé dans l'écosystème .NET, génère aussi des clients C#.</li>
  <li><strong>Orval</strong> ou <strong>openapi-typescript</strong> : alternatives plus légères, populaires côté front.</li>
</ul>
<p>La qualité du client dépend directement de la doc : un <code>operationId</code> clair donne une méthode <code>getOrderById()</code> plutôt que <code>apiOrdersIdGet()</code>, et des réponses déclarées donnent des types de retour justes. On peut produire le document au build (<code>Microsoft.Extensions.ApiDescription.Server</code>) et régénérer le client en CI pour détecter toute rupture de contrat.</p>

<h3>Pourquoi versionner</h3>
<p>Ton API a des consommateurs que tu ne contrôles pas toujours : l'application Angular déjà déployée dans les navigateurs, une application mobile qu'on ne met pas à jour du jour au lendemain, un partenaire qui a intégré ton API il y a deux ans. Un <strong>changement cassant</strong> les casse tous en même temps. Le versioning permet de faire cohabiter l'ancienne et la nouvelle version pendant une période de transition.</p>
<table>
  <thead><tr><th>Changement</th><th>Cassant ?</th></tr></thead>
  <tbody>
    <tr><td>Ajouter un endpoint</td><td>Non</td></tr>
    <tr><td>Ajouter un champ optionnel dans une réponse</td><td>Non (si les clients ignorent les champs inconnus)</td></tr>
    <tr><td>Ajouter un paramètre optionnel</td><td>Non</td></tr>
    <tr><td>Renommer ou supprimer un champ</td><td>Oui</td></tr>
    <tr><td>Rendre obligatoire un champ de requête</td><td>Oui</td></tr>
    <tr><td>Changer le type d'un champ (<code>int</code> vers <code>string</code>)</td><td>Oui</td></tr>
    <tr><td>Changer un code de statut ou le format d'erreur</td><td>Oui</td></tr>
    <tr><td>Ajouter une valeur à un enum</td><td>Souvent oui : un client strict peut échouer</td></tr>
  </tbody>
</table>
<p>La meilleure stratégie est d'abord d'<strong>éviter</strong> les changements cassants : ajouter plutôt que modifier, garder l'ancien champ en le marquant obsolète. On ne crée une v2 que lorsque c'est vraiment nécessaire.</p>

<h3>Les stratégies de versioning</h3>
<table>
  <thead><tr><th>Stratégie</th><th>Exemple</th><th>Pour</th><th>Contre</th></tr></thead>
  <tbody>
    <tr><td>Segment d'URL</td><td><code>/api/v2/orders</code></td><td>Visible, facile à tester, à router et à cacher</td><td>L'URL d'une ressource change selon la version</td></tr>
    <tr><td>Query string</td><td><code>/api/orders?api-version=2.0</code></td><td>URL stable, convention des APIs Azure</td><td>Facile à oublier, moins lisible</td></tr>
    <tr><td>En-tête</td><td><code>X-Api-Version: 2</code></td><td>URL propre</td><td>Invisible dans un navigateur, plus dur à tester</td></tr>
    <tr><td>Media type</td><td><code>Accept: application/json;v=2</code></td><td>Le plus « REST »</td><td>Complexe, rarement utilisé en pratique</td></tr>
  </tbody>
</table>
<p>Pour une API consommée par un front Angular et des partenaires, le <strong>segment d'URL</strong> est le choix le plus courant et le plus simple.</p>

<h3>Asp.Versioning</h3>
<p>La bibliothèque officielle de l'équipe .NET s'appelle <strong>Asp.Versioning</strong> : <code>Asp.Versioning.Http</code> pour les Minimal APIs, <code>Asp.Versioning.Mvc</code> pour les controllers, et <code>Asp.Versioning.Mvc.ApiExplorer</code> pour intégrer les versions à la documentation. Elle gère la lecture de la version (URL, query, en-tête), la version par défaut, les versions <strong>dépréciées</strong> et l'en-tête <code>api-supported-versions</code> dans les réponses (avec <code>ReportApiVersions</code>). Quand une version est dépréciée, elle continue de fonctionner, mais elle est annoncée comme telle dans les en-têtes <code>api-deprecated-versions</code> : c'est le signal pour que les clients migrent. Communique aussi une date de fin de support.</p>

<h3>Pièges courants</h3>
<ul>
  <li><strong>Des <code>operationId</code> en double</strong> : deux endpoints avec le même <code>WithName</code> font échouer la génération du document ou produisent un client inutilisable. Choisis une convention (<code>GetOrderById</code>, <code>ListOrders</code>, <code>CreateOrder</code>) et tiens-toi-y.</li>
  <li><strong>Renvoyer <code>IResult</code> ou <code>object</code></strong> sans déclarer les réponses : le document affiche une réponse vide, et le client généré renvoie <code>any</code>. Préfère <code>TypedResults</code> avec <code>Results&lt;...&gt;</code>.</li>
  <li><strong>Exposer les entités EF Core</strong> dans le contrat : chaque colonne ajoutée en base devient un changement visible de l'API, et les relations circulaires produisent des schémas énormes. Le contrat se compose uniquement de DTOs.</li>
  <li><strong>Les enums sérialisés en nombres</strong> : <code>"status": 2</code> n'a aucun sens pour le front. Configure <code>JsonStringEnumConverter</code> dans les options JSON : le document et le client généré utiliseront alors les noms (<code>"Confirmed"</code>).</li>
  <li><strong>Oublier le versioning dans la doc</strong> : sans <code>AddApiExplorer</code> et un document par version, Scalar mélange les endpoints v1 et v2 et le client généré ne sait plus lesquels utiliser.</li>
  <li><strong>Créer une v2 pour un ajout de champ</strong> : c'est un changement compatible. Une nouvelle version se justifie seulement par un vrai changement cassant.</li>
</ul>

<h3>Faire vivre le contrat dans le temps</h3>
<p>Un document qu'on ne regarde jamais finit par mentir. Trois habitudes simples le gardent fiable. D'abord, <strong>générer le fichier au build</strong> et le committer dans le dépôt : chaque pull request montre alors le diff du contrat, et un relecteur voit immédiatement qu'un champ a disparu. Ensuite, <strong>vérifier les ruptures en CI</strong> avec un outil de comparaison de documents OpenAPI (oasdiff, par exemple), qui fait échouer le pipeline si un changement cassant arrive sur une version publiée. Enfin, <strong>publier une politique de dépréciation</strong> : durée de support d'une ancienne version, canal d'annonce, date de retrait. Les partenaires peuvent ainsi planifier leur migration au lieu de la subir.</p>

<div class="note">Un senior traite le document OpenAPI comme un livrable, pas comme un sous-produit. Il le relit à chaque pull request (un diff du fichier JSON révèle immédiatement un changement cassant), il le fait générer en CI et il refuse les endpoints qui n'ont qu'un <code>200</code> documenté. Côté versioning, il sait que chaque version maintenue a un coût : tests, sécurité, bugs à corriger deux fois. Il préfère des évolutions compatibles et ne garde en général que deux versions actives en même temps.</div>
`,
  examples: [
    {
      title: "OpenAPI natif, Scalar et endpoints bien documentés",
      code: `// dotnet add package Microsoft.AspNetCore.OpenApi
// dotnet add package Scalar.AspNetCore
using Microsoft.AspNetCore.Http.HttpResults;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi(); // document "v1" par défaut
builder.Services.AddProblemDetails();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();               // GET /openapi/v1.json
    app.MapScalarApiReference();    // interface sur /scalar
}

var orders = app.MapGroup("/api/orders").WithTags("Orders");

orders.MapGet("/{id:int}", GetById)
    .WithName("GetOrderById")                       // operationId → nom de méthode du client généré
    .WithSummary("Récupère une commande")
    .WithDescription("Renvoie la commande avec ses lignes. 404 si elle n'existe pas.");

orders.MapPost("/", Create)
    .WithName("CreateOrder")
    .WithSummary("Crée une commande")
    .ProducesValidationProblem();                    // documente le 400 de validation

app.Run();

// Results<...> documente automatiquement 200 ET 404 dans le document OpenAPI
static Results<Ok<OrderDto>, NotFound> GetById(int id) =>
    id == 1 ? TypedResults.Ok(new OrderDto(1, "Pending", 120m)) : TypedResults.NotFound();

static Created<OrderDto> Create(CreateOrderRequest request) =>
    TypedResults.Created("/api/orders/2", new OrderDto(2, "Pending", 0m));

/// <summary>Commande telle que renvoyée par l'API.</summary>
/// <param name="Id">Identifiant de la commande.</param>
/// <param name="Status">Statut : Pending, Confirmed, Shipped ou Cancelled.</param>
/// <param name="Total">Montant total TTC en euros.</param>
public sealed record OrderDto(int Id, string Status, decimal Total);

public sealed record CreateOrderRequest(int CustomerId, List<int> ProductIds);

/* .csproj : reprendre les commentaires XML dans le document (.NET 10)
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn>  <!-- pas d'avertissement pour les membres non commentés -->
</PropertyGroup>
*/`,
      explain: "Ouvre <code>/openapi/v1.json</code> pour voir le contrat brut, puis <code>/scalar</code> pour l'interface. Grâce à <code>Results&lt;Ok&lt;OrderDto&gt;, NotFound&gt;</code>, la documentation ne peut pas mentir : si tu ajoutes un cas d'erreur, il faut changer le type de retour."
    },
    {
      title: "Controller documenté avec attributs",
      code: `using Microsoft.AspNetCore.Mvc;

namespace OrderFlow.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Tags("Customers")]
[Produces("application/json")]
public sealed class CustomersController(ICustomerService service) : ControllerBase
{
    /// <summary>Recherche un client par son identifiant.</summary>
    /// <param name="id">Identifiant du client.</param>
    /// <param name="ct">Jeton d'annulation.</param>
    [HttpGet("{id:int}", Name = "GetCustomerById")]
    [EndpointSummary("Récupère un client")]
    [ProducesResponseType<CustomerDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound, "application/problem+json")]
    public async Task<ActionResult<CustomerDto>> GetById(int id, CancellationToken ct)
    {
        var customer = await service.FindAsync(id, ct);
        return customer is null ? NotFound() : Ok(customer);
    }

    /// <summary>Crée un client.</summary>
    [HttpPost]
    [ProducesResponseType<CustomerDto>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<CustomerDto>> Create(CreateCustomerRequest request, CancellationToken ct)
    {
        var created = await service.CreateAsync(request, ct);
        return CreatedAtRoute("GetCustomerById", new { id = created.Id }, created);
    }
}

public sealed record CustomerDto(int Id, string Name, string Email);
public sealed record CreateCustomerRequest(string Name, string Email);

public interface ICustomerService
{
    Task<CustomerDto?> FindAsync(int id, CancellationToken ct);
    Task<CustomerDto> CreateAsync(CreateCustomerRequest request, CancellationToken ct);
}`,
      explain: "Avec <code>[ApiController]</code>, le 400 de validation est automatique, mais il faut le déclarer pour qu'il apparaisse dans la doc. <code>CreatedAtRoute</code> réutilise le nom de route pour produire l'en-tête <code>Location</code>."
    },
    {
      title: "Transformer : déclarer l'authentification JWT",
      code: `// .NET 10 : Microsoft.OpenApi v2 (namespace Microsoft.OpenApi)
// En .NET 9 : using Microsoft.OpenApi.Models; et des types légèrement différents
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info = new OpenApiInfo
        {
            Title = "OrderFlow API",
            Version = "v1",
            Description = "API de gestion des commandes OrderFlow."
        };

        // Déclare le schéma "Bearer" : Scalar affiche un champ pour coller le token
        document.Components ??= new OpenApiComponents();
        document.Components.SecuritySchemes ??= new Dictionary<string, IOpenApiSecurityScheme>();
        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Colle le token JWT obtenu sur /api/auth/login."
        };

        return Task.CompletedTask;
    });
});

/* Si la compilation échoue sur ces types, vérifie la version du package Microsoft.OpenApi
   référencée par ton SDK : les noms ont changé entre la v1 (.NET 9) et la v2 (.NET 10).
   Le principe reste identique : ajouter un SecurityScheme dans document.Components. */`,
      explain: "Un transformer de document s'exécute une fois à la génération. Pour exiger le schéma uniquement sur les endpoints protégés, on ajoute un transformer d'opération qui lit les métadonnées <code>IAuthorizeData</code> de l'endpoint."
    },
    {
      title: "Versioning par URL avec Asp.Versioning (Minimal APIs)",
      code: `// dotnet add package Asp.Versioning.Http
// dotnet add package Asp.Versioning.Mvc.ApiExplorer   (pour la documentation par version)
using Asp.Versioning;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;                       // en-tête api-supported-versions
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
})
.AddApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";                     // groupes "v1", "v2"
    options.SubstituteApiVersionInUrl = true;
});

// Un document OpenAPI par version
builder.Services.AddOpenApi("v1");
builder.Services.AddOpenApi("v2");

var app = builder.Build();
app.MapOpenApi(); // /openapi/v1.json et /openapi/v2.json

var versionSet = app.NewApiVersionSet()
    .HasDeprecatedApiVersion(new ApiVersion(1, 0))          // v1 encore servie mais annoncée dépréciée
    .HasApiVersion(new ApiVersion(2, 0))
    .ReportApiVersions()
    .Build();

var orders = app.MapGroup("/api/v{version:apiVersion}/orders")
    .WithApiVersionSet(versionSet)
    .WithTags("Orders");

// v1 : total en nombre
orders.MapGet("/{id:int}", (int id) => new OrderV1(id, 120m))
    .MapToApiVersion(1, 0);

// v2 : changement cassant, le total devient un objet avec la devise
orders.MapGet("/{id:int}", (int id) => new OrderV2(id, new Money(120m, "EUR")))
    .MapToApiVersion(2, 0);

app.Run();

public sealed record OrderV1(int Id, decimal Total);
public sealed record Money(decimal Amount, string Currency);
public sealed record OrderV2(int Id, Money Total);

// GET /api/v1/orders/1 → { "id": 1, "total": 120 }   + en-tête api-deprecated-versions: 1.0
// GET /api/v2/orders/1 → { "id": 1, "total": { "amount": 120, "currency": "EUR" } }`,
      explain: "Le même chemin est mappé deux fois, et <code>MapToApiVersion</code> choisit le handler selon le segment <code>v{version}</code>. Pour les controllers, on utilise <code>[ApiVersion(\"1.0\", Deprecated = true)]</code>, <code>[ApiVersion(\"2.0\")]</code> et <code>[MapToApiVersion(\"2.0\")]</code> sur les actions."
    },
    {
      title: "Générer et utiliser le client TypeScript dans Angular",
      code: `// 1) Génération (dans le projet Angular), API lancée en local :
//    npx @openapitools/openapi-generator-cli generate \\
//      -i http://localhost:5080/openapi/v1.json \\
//      -g typescript-angular \\
//      -o src/app/api \\
//      --additional-properties=providedInRoot=true,stringEnums=true
//
// 2) Le générateur crée les modèles (OrderDto...) et un service par tag (OrdersService).

// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { BASE_PATH } from './api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    { provide: BASE_PATH, useValue: 'http://localhost:5080' },
  ],
};

// order-detail.component.ts
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { OrdersService, OrderDto } from './api';

@Component({
  selector: 'app-order-detail',
  template: \`@if (order(); as o) { <p>Commande {{ o.id }} : {{ o.total }} €</p> }\`,
})
export class OrderDetailComponent implements OnInit {
  private readonly orders = inject(OrdersService);
  readonly id = input.required<number>();
  readonly order = signal<OrderDto | null>(null);

  ngOnInit(): void {
    // Méthode nommée d'après l'operationId "GetOrderById"
    this.orders.getOrderById(this.id()).subscribe(o => this.order.set(o));
  }
}`,
      explain: "Le nom de la méthode générée vient de l'<code>operationId</code> déclaré avec <code>WithName</code>. Ajoute la commande de génération dans un script <code>npm run api:generate</code> et versionne le résultat ou régénère-le en CI."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Documenter complètement un endpoint de suppression",
      prompt: "<p>Écris un endpoint Minimal API <code>DELETE /api/products/{id}</code> qui renvoie <code>204</code>, <code>404</code> si le produit n'existe pas et <code>409</code> si le produit est utilisé dans une commande. Il doit apparaître dans le document OpenAPI avec un <code>operationId</code> <code>DeleteProduct</code>, un résumé, le tag <code>Products</code> et ses trois réponses.</p>",
      hint: "<p>Utilise un type de retour <code>Results&lt;NoContent, NotFound, Conflict&lt;ProblemDetails&gt;&gt;</code> : les trois réponses sont alors documentées automatiquement.</p>",
      solution: `using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

app.MapDelete("/api/products/{id:int}", DeleteProduct)
    .WithName("DeleteProduct")
    .WithSummary("Supprime un produit")
    .WithDescription("Refuse la suppression (409) si le produit apparaît dans au moins une commande.")
    .WithTags("Products");

static async Task<Results<NoContent, NotFound, Conflict<ProblemDetails>>> DeleteProduct(
    int id, IProductRepository repo, CancellationToken ct)
{
    var product = await repo.FindAsync(id, ct);
    if (product is null)
        return TypedResults.NotFound();

    if (await repo.IsUsedInOrdersAsync(id, ct))
        return TypedResults.Conflict(new ProblemDetails
        {
            Title = "Produit utilisé",
            Detail = $"Le produit {id} figure dans des commandes et ne peut pas être supprimé.",
            Status = StatusCodes.Status409Conflict
        });

    await repo.DeleteAsync(product, ct);
    return TypedResults.NoContent();
}

public interface IProductRepository
{
    Task<Product?> FindAsync(int id, CancellationToken ct);
    Task<bool> IsUsedInOrdersAsync(int id, CancellationToken ct);
    Task DeleteAsync(Product product, CancellationToken ct);
}`
    },
    {
      level: "moyen",
      title: "Transformer d'opération pour l'en-tête de corrélation",
      prompt: "<p>Ajoute un transformer d'opération qui déclare, sur <strong>toutes</strong> les opérations, un en-tête optionnel <code>X-Correlation-Id</code> de type chaîne, avec une description. Vérifie dans Scalar qu'il apparaît sur chaque endpoint.</p>",
      hint: "<p><code>options.AddOperationTransformer((operation, context, ct) =&gt; ...)</code>. Ajoute un <code>OpenApiParameter</code> avec <code>In = ParameterLocation.Header</code> dans <code>operation.Parameters</code>, en l'initialisant s'il est null. En .NET 10 (Microsoft.OpenApi v2), le schéma se déclare avec <code>Type = JsonSchemaType.String</code>.</p>",
      solution: `using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

builder.Services.AddOpenApi(options =>
{
    options.AddOperationTransformer((operation, context, cancellationToken) =>
    {
        operation.Parameters ??= new List<IOpenApiParameter>();
        operation.Parameters.Add(new OpenApiParameter
        {
            Name = "X-Correlation-Id",
            In = ParameterLocation.Header,
            Required = false,
            Description = "Identifiant de corrélation. Généré par le serveur s'il est absent, et renvoyé dans la réponse.",
            Schema = new OpenApiSchema { Type = JsonSchemaType.String }
        });
        return Task.CompletedTask;
    });
});

// En .NET 9 (Microsoft.OpenApi v1) :
//   using Microsoft.OpenApi.Models;
//   operation.Parameters ??= new List<OpenApiParameter>();
//   Schema = new OpenApiSchema { Type = "string" }`
    },
    {
      level: "difficile",
      title: "Faire évoluer un controller en v2 sans casser la v1",
      prompt: "<p>Le controller <code>OrdersController</code> renvoie en v1 <code>{ id, customerName, total }</code>. En v2, il faut renvoyer <code>{ id, customer: { id, name }, total: { amount, currency } }</code>. Avec <code>Asp.Versioning.Mvc</code> et le versioning par URL, fais cohabiter les deux versions dans <strong>le même controller</strong>, marque la v1 comme dépréciée et partage la logique de lecture (une seule requête au service, deux mappings).</p>",
      hint: "<p>Attributs <code>[ApiVersion(\"1.0\", Deprecated = true)]</code> et <code>[ApiVersion(\"2.0\")]</code> sur le controller, route <code>api/v{version:apiVersion}/[controller]</code>, puis <code>[MapToApiVersion(\"1.0\")]</code> et <code>[MapToApiVersion(\"2.0\")]</code> sur deux actions qui appellent le même service.</p>",
      solution: `// dotnet add package Asp.Versioning.Mvc
using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;

// Program.cs
// builder.Services.AddControllers();
// builder.Services.AddApiVersioning(o =>
// {
//     o.DefaultApiVersion = new ApiVersion(1, 0);
//     o.AssumeDefaultVersionWhenUnspecified = true;
//     o.ReportApiVersions = true;
//     o.ApiVersionReader = new UrlSegmentApiVersionReader();
// }).AddMvc();

namespace OrderFlow.Api.Controllers;

[ApiController]
[ApiVersion("1.0", Deprecated = true)]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public sealed class OrdersController(IOrderReader reader) : ControllerBase
{
    [HttpGet("{id:int}")]
    [MapToApiVersion("1.0")]
    [ProducesResponseType<OrderV1Dto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderV1Dto>> GetV1(int id, CancellationToken ct)
    {
        var o = await reader.GetAsync(id, ct);
        return o is null ? NotFound() : new OrderV1Dto(o.Id, o.CustomerName, o.Total);
    }

    [HttpGet("{id:int}")]
    [MapToApiVersion("2.0")]
    [ProducesResponseType<OrderV2Dto>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<OrderV2Dto>> GetV2(int id, CancellationToken ct)
    {
        var o = await reader.GetAsync(id, ct);
        return o is null
            ? NotFound()
            : new OrderV2Dto(o.Id, new CustomerRef(o.CustomerId, o.CustomerName), new MoneyDto(o.Total, o.Currency));
    }
}

// Modèle de lecture partagé : une seule requête, deux contrats
public sealed record OrderReadModel(int Id, int CustomerId, string CustomerName, decimal Total, string Currency);

public interface IOrderReader
{
    Task<OrderReadModel?> GetAsync(int id, CancellationToken ct);
}

public sealed record OrderV1Dto(int Id, string CustomerName, decimal Total);
public sealed record CustomerRef(int Id, string Name);
public sealed record MoneyDto(decimal Amount, string Currency);
public sealed record OrderV2Dto(int Id, CustomerRef Customer, MoneyDto Total);

// GET /api/v1/orders/1 → contrat v1 + en-tête api-deprecated-versions: 1.0
// GET /api/v2/orders/1 → contrat v2`
    }
  ],
  project: "<p>Dans <strong>OrderFlow.Api</strong> :</p><ul><li>Remplace Swashbuckle s'il est présent par <code>Microsoft.AspNetCore.OpenApi</code> + Scalar, et active <code>GenerateDocumentationFile</code>.</li><li>Donne un <code>operationId</code>, un résumé, un tag et toutes les réponses possibles à chaque endpoint. Ajoute le schéma de sécurité Bearer avec un transformer.</li><li>Introduis le versioning par URL : <code>/api/v1/orders</code> garde le contrat actuel (déprécié), <code>/api/v2/orders</code> renvoie le client sous forme d'objet et le total avec sa devise.</li><li>Dans le projet Angular, génère le client avec <code>openapi-generator</code> (script <code>npm run api:generate</code>) et remplace les appels <code>HttpClient</code> écrits à la main par les services générés.</li></ul>",
  resources: [
    { label: "OpenAPI dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/openapi/overview" },
    { label: "Personnaliser les documents OpenAPI (transformers)", url: "https://learn.microsoft.com/aspnet/core/fundamentals/openapi/customize-openapi" },
    { label: "Scalar (GitHub)", url: "https://github.com/scalar/scalar" },
    { label: "Asp.Versioning (GitHub)", url: "https://github.com/dotnet/aspnet-api-versioning" },
    { label: "OpenAPI Generator", url: "https://openapi-generator.tech/" }
  ]
});

/* ===================================================================
   Jour 48 : Sécuriser l'API et consommer d'autres APIs
   =================================================================== */
window.COURSE.push({
  key: "w-security-httpclient",
  title: "Sécuriser l'API et consommer d'autres APIs",
  summary: "Configurer CORS, HTTPS, rate limiting et en-têtes de sécurité en connaissant l'OWASP API Security Top 10, puis appeler des APIs externes proprement avec IHttpClientFactory et la résilience.",
  objectives: [
    "Configurer CORS pour un front Angular et comprendre le préflight",
    "Protéger l'API avec HTTPS, HSTS, des limites de taille et des en-têtes de sécurité",
    "Mettre en place le rate limiting intégré par utilisateur ou par IP",
    "Relier chaque risque de l'OWASP API Security Top 10 à une protection concrète",
    "Consommer une API externe avec un client typé, des timeouts et la résilience standard"
  ],
  lesson: `
<h3>CORS : ce que c'est vraiment</h3>
<p>CORS (Cross-Origin Resource Sharing) est souvent mal compris. Ce n'est <strong>pas</strong> une protection de ton API : c'est le <strong>navigateur</strong> qui applique la règle « same-origin » et refuse de laisser du JavaScript lire une réponse venant d'une autre origine (schéma + domaine + port), sauf si le serveur l'autorise par des en-têtes <code>Access-Control-Allow-*</code>. Un appel depuis Postman, curl ou un autre serveur ignore complètement CORS. Ton front Angular sur <code>http://localhost:4200</code> et ton API sur <code>https://localhost:7080</code> sont deux origines différentes : sans politique CORS, le navigateur bloque les réponses.</p>
<p>Pour les requêtes « non simples » (méthode <code>PUT</code>/<code>DELETE</code>/<code>PATCH</code>, en-tête <code>Authorization</code> ou <code>Content-Type: application/json</code>), le navigateur envoie d'abord une requête <strong>préflight</strong> <code>OPTIONS</code> pour demander l'autorisation. Le middleware CORS y répond ; si elle échoue, la vraie requête n'est jamais envoyée. Dans les outils de développement, cherche toujours l'<code>OPTIONS</code> en échec quand « CORS ne marche pas ».</p>
<p>Règles de configuration :</p>
<ul>
  <li>Liste <strong>explicite</strong> d'origines (<code>WithOrigins</code>), lue depuis la configuration pour avoir des valeurs différentes en dev et en prod.</li>
  <li><code>AllowAnyOrigin()</code> est <strong>interdit</strong> avec <code>AllowCredentials()</code> : la spécification l'interdit et ASP.NET Core lève une exception. Ne contourne pas avec <code>SetIsOriginAllowed(_ =&gt; true)</code>, qui autorise n'importe quel site à faire des requêtes avec les cookies de tes utilisateurs.</li>
  <li><code>AllowCredentials()</code> n'est nécessaire que pour les cookies. Avec un JWT envoyé dans l'en-tête <code>Authorization</code>, tu n'en as pas besoin.</li>
  <li><code>WithExposedHeaders(...)</code> pour que le front puisse lire des en-têtes personnalisés (<code>X-Total-Count</code>, <code>ETag</code>, <code>X-Correlation-Id</code>).</li>
  <li><code>app.UseCors()</code> se place avant <code>UseAuthentication</code> et <code>UseAuthorization</code>.</li>
</ul>

<h3>HTTPS, HSTS et limites de taille</h3>
<p><code>app.UseHttpsRedirection()</code> redirige le HTTP vers le HTTPS, et <code>app.UseHsts()</code> (hors développement) envoie l'en-tête <code>Strict-Transport-Security</code> qui oblige le navigateur à n'utiliser que le HTTPS pendant une durée donnée. Derrière un reverse proxy ou un load balancer qui termine le TLS, configure <code>UseForwardedHeaders</code> pour que l'API sache que la requête d'origine était en HTTPS.</p>
<p>Kestrel accepte par défaut des corps de requête jusqu'à 30 Mo. Pour une API qui ne reçoit que du JSON de quelques kilo-octets, abaisse <code>MaxRequestBodySize</code> globalement et augmente-le seulement sur les endpoints d'upload. C'est une protection simple contre la saturation mémoire.</p>

<h3>Rate limiting intégré</h3>
<p>Depuis .NET 7, ASP.NET Core inclut un middleware de limitation de débit (<code>AddRateLimiter</code>, <code>UseRateLimiter</code>). Il protège contre les abus, le scraping, les attaques par force brute sur la connexion et les clients mal écrits qui bouclent. Quatre algorithmes :</p>
<table>
  <thead><tr><th>Algorithme</th><th>Principe</th><th>Quand l'utiliser</th></tr></thead>
  <tbody>
    <tr><td>Fixed window</td><td>N requêtes par fenêtre fixe (100 par minute)</td><td>Simple, quotas classiques. Pic possible à la frontière de deux fenêtres.</td></tr>
    <tr><td>Sliding window</td><td>Fenêtre découpée en segments qui glissent</td><td>Lisse les pics de la fenêtre fixe</td></tr>
    <tr><td>Token bucket</td><td>Un seau de jetons qui se remplit à vitesse constante</td><td>Autorise des rafales courtes tout en limitant la moyenne</td></tr>
    <tr><td>Concurrency</td><td>Nombre maximal de requêtes <em>simultanées</em></td><td>Protéger un endpoint coûteux (export, rapport)</td></tr>
  </tbody>
</table>
<p>Une limite globale pour tout le monde n'a pas de sens : un seul client abusif bloquerait tous les autres. On <strong>partitionne</strong> donc par utilisateur authentifié, ou par IP pour les anonymes, avec <code>RateLimitPartition</code>. Quand la limite est atteinte, renvoie <code>429 Too Many Requests</code> avec l'en-tête <code>Retry-After</code> (par défaut, le middleware renvoie un 503, d'où l'importance de <code>RejectionStatusCode</code>). Attention : derrière un proxy, l'IP vue par l'API est celle du proxy, il faut les forwarded headers. Et avec plusieurs instances de l'API, chaque instance a ses propres compteurs en mémoire : pour une limite stricte globale, on la place plutôt dans le gateway (Azure API Management, YARP, Nginx).</p>

<h3>OWASP API Security Top 10 (2023)</h3>
<table>
  <thead><tr><th>Risque</th><th>Exemple dans OrderFlow</th><th>Protection</th></tr></thead>
  <tbody>
    <tr><td>API1 · Broken Object Level Authorization (BOLA)</td><td><code>GET /api/orders/42</code> renvoie la commande d'un autre client</td><td>Toujours filtrer par l'utilisateur courant : <code>Where(o =&gt; o.Id == id &amp;&amp; o.CustomerId == currentUserId)</code></td></tr>
    <tr><td>API2 · Broken Authentication</td><td>Tokens sans expiration, login sans limite d'essais</td><td>JWT courts, validation complète, rate limiting sur le login</td></tr>
    <tr><td>API3 · Broken Object Property Level Authorization</td><td>Le client envoie <code>"isAdmin": true</code> ou lit le coût d'achat d'un produit</td><td>DTOs dédiés en entrée et en sortie, jamais l'entité EF exposée</td></tr>
    <tr><td>API4 · Unrestricted Resource Consumption</td><td><code>pageSize=1000000</code>, upload de 2 Go</td><td>Pagination bornée, limites de taille, rate limiting, timeouts</td></tr>
    <tr><td>API5 · Broken Function Level Authorization</td><td>Un client simple appelle <code>DELETE /api/admin/products</code></td><td>Policies d'autorisation sur chaque endpoint, autorisation par défaut</td></tr>
    <tr><td>API6 · Unrestricted Access to Sensitive Business Flows</td><td>Un bot réserve tout le stock d'une promotion</td><td>Limites métier, détection d'automatisation</td></tr>
    <tr><td>API7 · Server Side Request Forgery (SSRF)</td><td>L'API télécharge une image depuis une URL fournie par le client</td><td>Liste blanche de domaines, refuser les IP internes</td></tr>
    <tr><td>API8 · Security Misconfiguration</td><td>Stack traces en prod, CORS ouvert, Scalar public</td><td>Configuration par environnement, en-têtes de sécurité, revue</td></tr>
    <tr><td>API9 · Improper Inventory Management</td><td>Une v1 oubliée et non patchée reste en ligne</td><td>Inventaire des versions, dépréciation et fin de vie planifiées</td></tr>
    <tr><td>API10 · Unsafe Consumption of APIs</td><td>Faire confiance aveuglément à la réponse de l'API de taux de change</td><td>Valider les réponses externes, timeouts, HTTPS</td></tr>
  </tbody>
</table>
<p>Le n° 1, BOLA, est de loin la faille la plus fréquente dans les APIs réelles. L'authentification dit <em>qui</em> appelle ; elle ne dit pas si cette personne a le droit de voir <em>cette</em> commande.</p>

<h3>Secrets et en-têtes de sécurité</h3>
<p>Une chaîne de connexion ou une clé d'API ne doit jamais être dans <code>appsettings.json</code> versionné. En développement, utilise <code>dotnet user-secrets</code> (stocké hors du dépôt, dans le profil utilisateur). En production : variables d'environnement (<code>ConnectionStrings__Default</code>, le double underscore remplace le <code>:</code>), Azure Key Vault ou le gestionnaire de secrets de ta plateforme. Et si un secret a été commité, il est compromis : il faut le <strong>changer</strong>, pas seulement le supprimer du dépôt.</p>
<p>Quelques en-têtes de réponse utiles même pour une API JSON : <code>X-Content-Type-Options: nosniff</code>, <code>X-Frame-Options: DENY</code> (ou <code>Content-Security-Policy: frame-ancestors 'none'</code>), <code>Referrer-Policy: no-referrer</code>. Retire aussi l'en-tête <code>Server: Kestrel</code> avec <code>AddServerHeader = false</code>.</p>

<h3>Consommer une API externe : IHttpClientFactory</h3>
<p>Écrire <code>using var client = new HttpClient()</code> à chaque appel est un bug classique : chaque instance ouvre ses propres connexions, et les sockets restent en état <code>TIME_WAIT</code> après la libération. Sous charge, le serveur épuise ses ports (« socket exhaustion »). À l'inverse, un <code>HttpClient</code> statique unique ne voit jamais les changements DNS.</p>
<p><code>IHttpClientFactory</code> résout les deux problèmes : il recycle les handlers HTTP sous-jacents et te donne des instances <code>HttpClient</code> légères. Trois styles :</p>
<ul>
  <li><strong>Client par défaut</strong> : <code>factory.CreateClient()</code>.</li>
  <li><strong>Client nommé</strong> : <code>AddHttpClient("rates", c =&gt; ...)</code> puis <code>factory.CreateClient("rates")</code>.</li>
  <li><strong>Client typé</strong> (recommandé) : une classe <code>ExchangeRateClient(HttpClient http)</code> enregistrée avec <code>AddHttpClient&lt;ExchangeRateClient&gt;(...)</code>. Le reste de l'application dépend de cette classe métier, pas des détails HTTP. Un client typé est enregistré en transient : ne l'injecte pas dans un singleton.</li>
</ul>
<p>Les extensions <code>GetFromJsonAsync</code>, <code>PostAsJsonAsync</code> et <code>ReadFromJsonAsync</code> (namespace <code>System.Net.Http.Json</code>) gèrent la sérialisation. Vérifie le statut avant de désérialiser : <code>GetFromJsonAsync</code> lève <code>HttpRequestException</code> sur un statut d'erreur, et pour lire un ProblemDetails renvoyé par l'autre API, utilise <code>GetAsync</code> puis inspecte la réponse.</p>

<h3>Timeouts et résilience</h3>
<p>Le timeout par défaut d'un <code>HttpClient</code> est de 100 secondes : beaucoup trop pour une API qui répond à un utilisateur. Une dépendance lente immobilise tes threads et tes connexions, puis ton API devient lente à son tour. Le package <code>Microsoft.Extensions.Http.Resilience</code> fournit <code>AddStandardResilienceHandler()</code>, un pipeline préconfiguré : limitation du débit sortant, timeout total, retries avec backoff exponentiel et jitter, circuit breaker et timeout par tentative. Les retries ne concernent que les erreurs transitoires (5xx, 408, 429, erreurs réseau) et respectent le <code>Retry-After</code>.</p>
<p>Attention aux retries sur les requêtes non idempotentes : rejouer un <code>POST</code> de paiement peut débiter deux fois. Désactive-les pour ces appels ou utilise une clé d'idempotence acceptée par le fournisseur.</p>

<div class="note">Un senior part du principe que tout ce qui vient de l'extérieur est hostile ou en panne. Les requêtes entrantes peuvent être forgées : il vérifie l'appartenance de chaque ressource (BOLA), borne chaque entrée et limite le débit. Les APIs appelées tomberont : il fixe des timeouts courts, ajoute la résilience, prévoit un comportement dégradé (taux de change en cache, message clair) et ne laisse jamais une dépendance lente faire tomber tout le service.</div>
`,
  examples: [
    {
      title: "CORS pour Angular piloté par la configuration",
      code: `var builder = WebApplication.CreateBuilder(args);

// appsettings.Development.json : "Cors": { "AllowedOrigins": [ "http://localhost:4200" ] }
// appsettings.Production.json  : "Cors": { "AllowedOrigins": [ "https://app.orderflow.fr" ] }
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins(allowedOrigins)                         // jamais AllowAnyOrigin en prod
        .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")
        .WithHeaders("Authorization", "Content-Type", "If-Match", "X-Correlation-Id")
        .WithExposedHeaders("ETag", "X-Correlation-Id", "Retry-After") // lisibles par le front
        .SetPreflightMaxAge(TimeSpan.FromMinutes(10)));     // le navigateur met le préflight en cache
    // JWT dans l'en-tête Authorization : pas besoin de AllowCredentials()
});

builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("Frontend");      // avant l'authentification
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/orders", () => Results.Ok(Array.Empty<object>())).RequireAuthorization();

app.Run();`,
      explain: "Si le navigateur affiche une erreur CORS, regarde d'abord la requête <code>OPTIONS</code> dans l'onglet Réseau : une origine mal orthographiée (avec un <code>/</code> final, ou <code>http</code> au lieu de <code>https</code>) est la cause la plus fréquente."
    },
    {
      title: "Rate limiting par utilisateur, 429 et Retry-After",
      code: `using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests; // 503 par défaut

    // Politique générale : token bucket par utilisateur, ou par IP si anonyme
    options.AddPolicy("per-user", httpContext =>
    {
        var key = httpContext.User.Identity?.IsAuthenticated == true
            ? "user:" + httpContext.User.Identity.Name
            : "ip:" + httpContext.Connection.RemoteIpAddress;

        return RateLimitPartition.GetTokenBucketLimiter(key, _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 30,                              // rafale maximale
            TokensPerPeriod = 10,                         // 10 jetons rendus...
            ReplenishmentPeriod = TimeSpan.FromSeconds(10), // ...toutes les 10 s
            QueueLimit = 0,
            AutoReplenishment = true
        });
    });

    // Login : 5 essais par minute et par IP contre la force brute
    options.AddPolicy("login", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            "login:" + httpContext.Connection.RemoteIpAddress,
            _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));

    // Export coûteux : 2 exécutions simultanées au maximum
    options.AddConcurrencyLimiter("export", o => { o.PermitLimit = 2; o.QueueLimit = 0; });

    options.OnRejected = (context, cancellationToken) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
        {
            context.HttpContext.Response.Headers.RetryAfter =
                ((int)retryAfter.TotalSeconds).ToString(CultureInfo.InvariantCulture);
        }
        return ValueTask.CompletedTask;
    };
});

var app = builder.Build();
app.UseRateLimiter();

app.MapPost("/api/auth/login", () => Results.Ok()).RequireRateLimiting("login");
app.MapGet("/api/orders/export", () => Results.Ok()).RequireRateLimiting("export");

app.MapGroup("/api")
   .RequireRateLimiting("per-user")
   .MapGet("/products", () => Results.Ok(Array.Empty<object>()));

app.Run();`,
      explain: "Si <code>UseAuthentication</code> est utilisé, place <code>UseRateLimiter</code> après lui pour que <code>User</code> soit renseigné lors du partitionnement. Les compteurs sont en mémoire : avec plusieurs instances, la limite réelle est multipliée par le nombre d'instances."
    },
    {
      title: "Durcissement : en-têtes, taille des requêtes, BOLA",
      code: `using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options =>
{
    options.AddServerHeader = false;                    // retire "Server: Kestrel"
    options.Limits.MaxRequestBodySize = 1 * 1024 * 1024; // 1 Mo pour le JSON (30 Mo par défaut)
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
    app.UseHsts();                                      // Strict-Transport-Security
app.UseHttpsRedirection();

// En-têtes de sécurité sur toutes les réponses
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "no-referrer";
    headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";
    await next(context);
});

// BOLA : on vérifie que la commande appartient à l'utilisateur connecté
app.MapGet("/api/me/orders/{id:int}", async (int id, ClaimsPrincipal user, OrderFlowDbContext db) =>
{
    var customerId = int.Parse(user.FindFirstValue("customer_id")!);

    var order = await db.Orders.AsNoTracking()
        .Where(o => o.Id == id && o.CustomerId == customerId)   // le filtre de propriété
        .Select(o => new { o.Id, o.Status, o.CreatedAt })        // DTO : pas l'entité
        .FirstOrDefaultAsync();

    // 404 plutôt que 403 : ne révèle pas que la commande existe
    return order is null ? Results.NotFound() : Results.Ok(order);
}).RequireAuthorization();

app.Run();`,
      explain: "La <code>Content-Security-Policy</code> stricte convient à une API qui ne sert que du JSON. Si la même application sert aussi Scalar ou des pages, il faut l'assouplir pour ces chemins."
    },
    {
      title: "Client typé vers une API de taux de change avec résilience",
      code: `// dotnet add package Microsoft.Extensions.Http.Resilience
using System.Net;
using System.Net.Http.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient<ExchangeRateClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ExchangeRates:BaseUrl"]!);
    client.DefaultRequestHeaders.Add("Accept", "application/json");
})
.AddStandardResilienceHandler(options =>
{
    // Timeout total (toutes tentatives) et par tentative : bien en dessous des 100 s par défaut
    options.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(10);
    options.AttemptTimeout.Timeout = TimeSpan.FromSeconds(3);
    options.Retry.MaxRetryAttempts = 2;
});

var app = builder.Build();

app.MapGet("/api/orders/{id:int}/total", async (int id, string currency, ExchangeRateClient rates, CancellationToken ct) =>
{
    const decimal totalEur = 120m; // en vrai : lu depuis la base
    var rate = await rates.GetRateAsync("EUR", currency, ct);
    return rate is null
        ? Results.Problem("Service de taux de change indisponible, réessaie plus tard.", statusCode: 503)
        : Results.Ok(new { Amount = Math.Round(totalEur * rate.Value, 2), Currency = currency });
});

app.Run();

public sealed record RateResponse(string Base, Dictionary<string, decimal> Rates);

public sealed class ExchangeRateClient(HttpClient http, ILogger<ExchangeRateClient> logger)
{
    public async Task<decimal?> GetRateAsync(string from, string to, CancellationToken ct)
    {
        try
        {
            using var response = await http.GetAsync($"latest?base={from}&symbols={to}", ct);

            if (response.StatusCode == HttpStatusCode.NotFound)
                return null;
            response.EnsureSuccessStatusCode();

            var body = await response.Content.ReadFromJsonAsync<RateResponse>(ct);

            // API10 : on ne fait pas confiance aveuglément à la réponse externe
            if (body?.Rates is null || !body.Rates.TryGetValue(to, out var rate) || rate <= 0)
            {
                logger.LogWarning("Réponse inattendue de l'API de taux pour {From}->{To}", from, to);
                return null;
            }
            return rate;
        }
        catch (Exception ex) when (ex is HttpRequestException or TimeoutException
                                       or Polly.Timeout.TimeoutRejectedException
                                       or Polly.CircuitBreaker.BrokenCircuitException)
        {
            logger.LogError(ex, "Échec de l'appel à l'API de taux pour {From}->{To}", from, to);
            return null; // comportement dégradé plutôt qu'un 500
        }
    }
}`,
      explain: "Le pipeline standard inclut retry, circuit breaker et timeouts. Le timeout total de la résilience doit rester inférieur à <code>HttpClient.Timeout</code> (100 s par défaut), sinon c'est ce dernier qui coupe en premier. Les exceptions Polly viennent du package de résilience, qui dépend de Polly."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Corriger une configuration CORS dangereuse",
      prompt: "<p>Voici une configuration trouvée dans un projet : <code>policy.SetIsOriginAllowed(_ =&gt; true).AllowAnyHeader().AllowAnyMethod().AllowCredentials()</code>. Explique en une phrase pourquoi elle est dangereuse, puis réécris-la pour autoriser seulement <code>https://app.orderflow.fr</code> et <code>http://localhost:4200</code> (ce dernier en développement uniquement), avec l'API qui utilise des JWT dans l'en-tête <code>Authorization</code>.</p>",
      hint: "<p>Avec <code>AllowCredentials</code>, n'importe quel site visité par un utilisateur connecté peut appeler l'API avec ses cookies. Avec un JWT en en-tête, <code>AllowCredentials</code> est inutile. <code>builder.Environment.IsDevelopment()</code> permet d'ajouter l'origine locale.</p>",
      solution: `// Danger : SetIsOriginAllowed(_ => true) + AllowCredentials() revient à autoriser
// N'IMPORTE QUEL site à envoyer des requêtes authentifiées (cookies) et à lire les réponses.

var origins = new List<string> { "https://app.orderflow.fr" };
if (builder.Environment.IsDevelopment())
    origins.Add("http://localhost:4200");

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins([.. origins])
        .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")
        .WithHeaders("Authorization", "Content-Type"));
    // Pas de AllowCredentials() : le JWT est envoyé dans l'en-tête Authorization
});

// app.UseCors("Frontend"); avant UseAuthentication()`
    },
    {
      level: "moyen",
      title: "Rate limiting différencié par rôle",
      prompt: "<p>Crée une politique <code>tiered</code> en fenêtre glissante : les utilisateurs du rôle <code>Partner</code> ont droit à 600 requêtes par minute, les autres utilisateurs authentifiés à 120, et les anonymes à 30 par IP. La fenêtre est découpée en 6 segments. Les requêtes rejetées doivent renvoyer un ProblemDetails JSON avec le statut 429.</p>",
      hint: "<p><code>RateLimitPartition.GetSlidingWindowLimiter(key, _ =&gt; new SlidingWindowRateLimiterOptions { ... })</code>. Choisis la limite avec <code>User.IsInRole</code>. Dans <code>OnRejected</code>, écris la réponse avec <code>context.HttpContext.Response.WriteAsJsonAsync</code>.</p>",
      solution: `using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Mvc;

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("tiered", httpContext =>
    {
        var user = httpContext.User;
        var (key, limit) = user.Identity?.IsAuthenticated == true
            ? (user.IsInRole("Partner") ? ("partner:" + user.Identity.Name, 600) : ("user:" + user.Identity.Name, 120))
            : ("ip:" + httpContext.Connection.RemoteIpAddress, 30);

        return RateLimitPartition.GetSlidingWindowLimiter(key, _ => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = limit,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 6,
            QueueLimit = 0
        });
    });

    options.OnRejected = async (context, cancellationToken) =>
    {
        var problem = new ProblemDetails
        {
            Status = StatusCodes.Status429TooManyRequests,
            Title = "Trop de requêtes",
            Detail = "Tu as dépassé ton quota. Réessaie dans quelques secondes."
        };
        context.HttpContext.Response.ContentType = "application/problem+json";
        await context.HttpContext.Response.WriteAsJsonAsync(problem, cancellationToken);
    };
});

// app.UseAuthentication();
// app.UseAuthorization();
// app.UseRateLimiter();
// app.MapGroup("/api").RequireRateLimiting("tiered");`
    },
    {
      level: "difficile",
      title: "Client d'API partenaire avec token, cache et résilience",
      prompt: "<p>Une API partenaire exige un token obtenu par <code>POST /oauth/token</code> (client credentials), valable 1 heure. Écris un <code>DelegatingHandler</code> nommé <code>PartnerTokenHandler</code> qui ajoute <code>Authorization: Bearer ...</code> à chaque requête, met le token en cache dans <code>IMemoryCache</code> jusqu'à une minute avant son expiration, et utilise un client nommé distinct pour obtenir le token. Enregistre un client typé <code>PartnerClient</code> qui utilise ce handler et la résilience standard.</p>",
      hint: "<p>Un <code>DelegatingHandler</code> s'enregistre en transient et s'ajoute avec <code>AddHttpMessageHandler&lt;T&gt;()</code>. Pour le token, utilise <code>IHttpClientFactory.CreateClient(\"partner-auth\")</code> afin de ne pas boucler à travers ton propre handler. <code>GetOrCreateAsync</code> sur <code>IMemoryCache</code> avec <code>AbsoluteExpirationRelativeToNow</code>.</p>",
      solution: `using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;

public sealed record TokenResponse(
    [property: JsonPropertyName("access_token")] string AccessToken,
    [property: JsonPropertyName("expires_in")] int ExpiresIn);

public sealed class PartnerTokenHandler(
    IHttpClientFactory factory, IMemoryCache cache, IConfiguration config) : DelegatingHandler
{
    private const string CacheKey = "partner-token";

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        var token = await cache.GetOrCreateAsync(CacheKey, async entry =>
        {
            // Client séparé : ne passe PAS par ce handler (sinon boucle infinie)
            var auth = factory.CreateClient("partner-auth");
            using var response = await auth.PostAsync("oauth/token", new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = config["Partner:ClientId"]!,
                ["client_secret"] = config["Partner:ClientSecret"]!   // depuis user-secrets / Key Vault
            }), ct);
            response.EnsureSuccessStatusCode();

            var body = await response.Content.ReadFromJsonAsync<TokenResponse>(ct)
                       ?? throw new InvalidOperationException("Réponse de token vide.");

            // Expire une minute avant le partenaire pour éviter un token mort en vol
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(Math.Max(30, body.ExpiresIn - 60));
            return body.AccessToken;
        });

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return await base.SendAsync(request, ct);
    }
}

public sealed record PartnerStock(string Sku, int Quantity);

public sealed class PartnerClient(HttpClient http)
{
    public Task<PartnerStock?> GetStockAsync(string sku, CancellationToken ct) =>
        http.GetFromJsonAsync<PartnerStock>($"api/stock/{Uri.EscapeDataString(sku)}", ct);
}

// Program.cs
// var partnerBase = new Uri(builder.Configuration["Partner:BaseUrl"]!);
// builder.Services.AddMemoryCache();
// builder.Services.AddTransient<PartnerTokenHandler>();
//
// builder.Services.AddHttpClient("partner-auth", c => c.BaseAddress = partnerBase);
//
// builder.Services.AddHttpClient<PartnerClient>(c => c.BaseAddress = partnerBase)
//     .AddHttpMessageHandler<PartnerTokenHandler>()   // ajoute le token
//     .AddStandardResilienceHandler();                 // retries, timeouts, circuit breaker`
    }
  ],
  project: "<p>Dans <strong>OrderFlow.Api</strong> :</p><ul><li>Configure une politique CORS <code>Frontend</code> lue depuis la configuration (<code>http://localhost:4200</code> en dev) et expose <code>ETag</code> et <code>X-Correlation-Id</code>.</li><li>Ajoute le rate limiting : token bucket par utilisateur sur <code>/api</code>, fenêtre fixe de 5 essais par minute sur le login, limite de concurrence sur l'export CSV, réponses 429 avec <code>Retry-After</code>.</li><li>Ajoute HSTS hors développement, les en-têtes de sécurité, la limite de 1 Mo sur les corps JSON, et vérifie que chaque endpoint <code>/api/me/...</code> filtre bien par le client connecté (BOLA).</li><li>Déplace la chaîne de connexion SQL Server dans <code>dotnet user-secrets</code>.</li><li>Crée un client typé <code>ExchangeRateClient</code> avec <code>AddStandardResilienceHandler</code> et un endpoint qui affiche le total d'une commande dans une autre devise, avec un 503 propre si le service est indisponible.</li></ul>",
  resources: [
    { label: "Activer CORS dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/security/cors" },
    { label: "Rate limiting dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/performance/rate-limit" },
    { label: "Stockage sécurisé des secrets en développement", url: "https://learn.microsoft.com/aspnet/core/security/app-secrets" },
    { label: "OWASP API Security Top 10", url: "https://owasp.org/API-Security/" },
    { label: "IHttpClientFactory dans .NET", url: "https://learn.microsoft.com/dotnet/core/extensions/httpclient-factory" },
    { label: "Résilience des applications HTTP", url: "https://learn.microsoft.com/dotnet/core/resilience/http-resilience" }
  ]
});
