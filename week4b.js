window.COURSE = window.COURSE || [];

/* ===================== JOUR 27 ===================== */
window.COURSE.push({
  day: 27, week: 4,
  title: "SignalR et aperçu de gRPC",
  summary: "Pousser des événements en temps réel vers le front Angular avec SignalR, et savoir quand choisir gRPC.",
  objectives: [
    "Créer un hub SignalR fortement typé et l'exposer de façon sécurisée",
    "Envoyer des notifications depuis un handler grâce à IHubContext",
    "Consommer le hub depuis Angular avec @microsoft/signalr et gérer la reconnexion",
    "Comprendre le modèle gRPC (contrat .proto, HTTP/2, streaming) et ses cas d'usage"
  ],
  lesson: `
<h3>Pourquoi SignalR</h3>
<p>Une API REST répond aux requêtes du client : le serveur ne peut pas prendre l'initiative. Pour afficher le changement de statut d'une commande sans que l'utilisateur rafraîchisse la page, il faut un canal ouvert du serveur vers le navigateur. SignalR fournit ce canal et choisit lui-même le meilleur transport : <strong>WebSockets</strong> en priorité, puis <strong>Server-Sent Events</strong>, puis <strong>Long Polling</strong>. Ton code ne change pas selon le transport.</p>

<h3>Le hub</h3>
<p>Un <code>Hub</code> est la classe qui reçoit les appels des clients et peut appeler des méthodes côté client. En production, préfère un hub <strong>fortement typé</strong> : <code>Hub&lt;IOrderClient&gt;</code>. L'interface décrit les méthodes que le serveur peut invoquer chez le client. Tu évites ainsi les chaînes magiques comme <code>SendAsync("OrderUpdated", …)</code> où une faute de frappe passe en silence.</p>
<ul>
  <li><code>Clients.All</code> : tous les clients connectés.</li>
  <li><code>Clients.User(userId)</code> : toutes les connexions d'un utilisateur authentifié (il peut avoir plusieurs onglets).</li>
  <li><code>Clients.Group("customer-42")</code> : un groupe nommé que tu gères avec <code>Groups.AddToGroupAsync</code>.</li>
  <li><code>Clients.Caller</code> / <code>Clients.Others</code> : l'appelant, ou tout le monde sauf lui.</li>
</ul>

<h3>Pousser depuis l'extérieur du hub</h3>
<p>Dans OrderFlow, la notification ne part pas d'un appel client mais d'un handler CQRS (<code>ConfirmOrderHandler</code>) ou d'un <code>BackgroundService</code>. On injecte alors <code>IHubContext&lt;OrderHub, IOrderClient&gt;</code>. Pour respecter la Clean Architecture, la couche Application ne connaît qu'une interface <code>IOrderNotifier</code> ; l'implémentation SignalR vit dans la couche API ou Infrastructure.</p>

<h3>Authentification</h3>
<p>Un navigateur ne peut pas ajouter d'en-tête <code>Authorization</code> à une connexion WebSocket. Le client SignalR envoie donc le JWT dans la query string (<code>access_token</code>). Côté serveur, il faut lire ce paramètre dans <code>JwtBearerEvents.OnMessageReceived</code>, uniquement pour le chemin du hub. Ensuite <code>[Authorize]</code> sur le hub et <code>Context.UserIdentifier</code> fonctionnent comme d'habitude.</p>

<h3>Pièges fréquents</h3>
<ul>
  <li><strong>Hub sans état</strong> : une instance de hub est créée pour chaque appel. Ne stocke jamais d'état dans un champ du hub.</li>
  <li><strong>CORS</strong> : SignalR a besoin de <code>AllowCredentials()</code>, donc d'origines explicites (<code>WithOrigins</code>), jamais <code>AllowAnyOrigin</code>.</li>
  <li><strong>Reconnexion</strong> : <code>withAutomaticReconnect()</code> rétablit la connexion, mais les messages émis pendant la coupure sont <strong>perdus</strong>. Le client doit recharger l'état via l'API REST après <code>onreconnected</code>.</li>
  <li><strong>Plusieurs instances</strong> : derrière un load balancer, un message émis par l'instance A n'atteint pas les clients connectés à B. Il faut un backplane Redis (<code>AddStackExchangeRedis</code>) ou Azure SignalR Service, et des sessions sticky si WebSockets n'est pas garanti.</li>
  <li><strong>Groupes non persistés</strong> : l'appartenance à un groupe disparaît à la déconnexion. Réinscris le client dans <code>OnConnectedAsync</code>.</li>
</ul>

<h3>Aperçu de gRPC</h3>
<p>gRPC est un framework RPC fondé sur <strong>HTTP/2</strong> et <strong>Protocol Buffers</strong>. Tu écris d'abord le contrat dans un fichier <code>.proto</code> ; les outils génèrent le serveur et le client C#. Les messages binaires sont compacts, le typage est strict, et gRPC gère quatre modes : unaire, streaming serveur, streaming client et bidirectionnel.</p>
<ul>
  <li><strong>Bon choix</strong> : communication entre microservices internes, faible latence, contrats partagés entre équipes et langages.</li>
  <li><strong>Mauvais choix</strong> : API publique consommée par un navigateur. Les navigateurs n'exposent pas les trames HTTP/2 nécessaires ; il faut gRPC-Web et un proxy. Pour Angular, REST + SignalR reste plus simple.</li>
</ul>

<div class="note"><strong>Niveau senior.</strong> SignalR n'est pas un bus de messages : la livraison est « au plus une fois », sans persistance ni rejeu. Traite chaque notification comme un simple signal (« la commande 42 a changé ») et laisse le client relire la source de vérité via l'API. Tu évites ainsi les incohérences après une coupure et tu gardes des messages petits. Si tu as besoin de garanties de livraison, utilise un vrai broker (RabbitMQ, Service Bus) en amont, et SignalR seulement pour le dernier kilomètre vers l'écran.</div>
`,
  examples: [
    {
      title: "Hub fortement typé et notification depuis un handler",
      code: `// OrderFlow.Api/Realtime/OrderHub.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

public interface IOrderClient
{
    Task OrderStatusChanged(OrderStatusChangedMessage message);
}

public sealed record OrderStatusChangedMessage(Guid OrderId, string Status);

[Authorize]
public sealed class OrderHub : Hub<IOrderClient>
{
    // Chaque client rejoint le groupe de son propre compte à la connexion
    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier;
        if (userId is not null)
            await Groups.AddToGroupAsync(Context.ConnectionId, "customer-" + userId);
        await base.OnConnectedAsync();
    }
}

// Couche Application : abstraction, aucune dépendance à SignalR
public interface IOrderNotifier
{
    Task StatusChangedAsync(Guid customerId, Guid orderId, string status, CancellationToken ct);
}

// Couche Api : implémentation SignalR
public sealed class SignalROrderNotifier(IHubContext<OrderHub, IOrderClient> hub) : IOrderNotifier
{
    public Task StatusChangedAsync(Guid customerId, Guid orderId, string status, CancellationToken ct) =>
        hub.Clients.Group("customer-" + customerId)
           .OrderStatusChanged(new OrderStatusChangedMessage(orderId, status));
}

// Program.cs
builder.Services.AddSignalR();
builder.Services.AddScoped<IOrderNotifier, SignalROrderNotifier>();
builder.Services.AddCors(o => o.AddPolicy("front", p => p
    .WithOrigins("http://localhost:4200")
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

app.UseCors("front");
app.MapHub<OrderHub>("/hubs/orders");`,
      explain: `Le handler <code>ConfirmOrderHandler</code> appelle <code>IOrderNotifier</code> sans rien savoir de SignalR. <code>Context.UserIdentifier</code> vient par défaut du claim <code>NameIdentifier</code> du JWT.`
    },
    {
      title: "Client Angular avec @microsoft/signalr",
      code: `// npm install @microsoft/signalr
// src/app/core/order-realtime.service.ts
import { Injectable, OnDestroy, inject, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';

export interface OrderStatusChangedMessage {
  orderId: string;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class OrderRealtimeService implements OnDestroy {
  private auth = inject(AuthService);
  private connection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:5001/hubs/orders', {
      // Le JWT part dans la query string : les WebSockets n'acceptent pas d'en-tête
      accessTokenFactory: () => this.auth.token() ?? ''
    })
    .withAutomaticReconnect()
    .build();

  readonly lastChange = signal<OrderStatusChangedMessage | null>(null);
  readonly reconnected = signal(0);

  async start(): Promise<void> {
    // Le nom doit correspondre à la méthode de IOrderClient (insensible à la casse)
    this.connection.on('OrderStatusChanged', (msg: OrderStatusChangedMessage) =>
      this.lastChange.set(msg));

    // Après une coupure, les messages manqués sont perdus : on signale qu'il faut recharger
    this.connection.onreconnected(() => this.reconnected.update(n => n + 1));

    await this.connection.start();
  }

  ngOnDestroy(): void {
    this.connection.stop();
  }
}`,
      explain: `Les composants lisent le signal <code>lastChange</code> et relancent un <code>GET /api/orders/{id}</code>. Le signal <code>reconnected</code> déclenche un rechargement complet de la liste.`
    },
    {
      title: "Service gRPC minimal",
      code: `// Protos/inventory.proto
syntax = "proto3";
option csharp_namespace = "OrderFlow.Inventory";

service Inventory {
  rpc CheckStock (StockRequest) returns (StockReply);
}

message StockRequest {
  string product_id = 1;
  int32 quantity = 2;
}

message StockReply {
  bool available = 1;
  int32 in_stock = 2;
}

// .csproj du serveur
// <PackageReference Include="Grpc.AspNetCore" Version="2.*" />
// <Protobuf Include="Protos\\inventory.proto" GrpcServices="Server" />

// Services/InventoryService.cs
using Grpc.Core;

public sealed class InventoryService(IStockRepository stock) : Inventory.InventoryBase
{
    public override async Task<StockReply> CheckStock(StockRequest request, ServerCallContext context)
    {
        var inStock = await stock.GetQuantityAsync(request.ProductId, context.CancellationToken);
        return new StockReply { Available = inStock >= request.Quantity, InStock = inStock };
    }
}

// Program.cs
builder.Services.AddGrpc();
app.MapGrpcService<InventoryService>();`,
      explain: `Le client C# est généré avec <code>GrpcServices="Client"</code> et s'enregistre avec <code>AddGrpcClient&lt;Inventory.InventoryClient&gt;</code>. Les champs <code>product_id</code> deviennent <code>ProductId</code> en C#.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Diffuser la création d'une commande",
      prompt: `<p>Crée un hub <code>DashboardHub</code> fortement typé avec une méthode client <code>OrderCreated(Guid orderId, decimal total)</code>. Quand une commande est créée, notifie <strong>tous</strong> les clients connectés. Côté Angular, affiche un compteur des commandes reçues.</p>`,
      hint: `<p>Utilise <code>IHubContext&lt;DashboardHub, IDashboardClient&gt;</code> et <code>Clients.All</code>. Côté client, <code>connection.on('OrderCreated', …)</code> reçoit les arguments dans l'ordre.</p>`,
      solution: `// Serveur
public interface IDashboardClient
{
    Task OrderCreated(Guid orderId, decimal total);
}

public sealed class DashboardHub : Hub<IDashboardClient> { }

public sealed class CreateOrderHandler(
    IOrderRepository orders,
    IHubContext<DashboardHub, IDashboardClient> dashboard)
{
    public async Task<Guid> Handle(CreateOrderCommand cmd, CancellationToken ct)
    {
        var order = Order.Create(cmd.CustomerId, cmd.Lines);
        await orders.AddAsync(order, ct);
        // Notifier après la sauvegarde, jamais avant
        await dashboard.Clients.All.OrderCreated(order.Id, order.Total);
        return order.Id;
    }
}

// Program.cs
app.MapHub<DashboardHub>("/hubs/dashboard");

// Angular
import { Component, OnInit, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-dashboard',
  template: '<p>Commandes reçues : {{ count() }}</p>'
})
export class DashboardComponent implements OnInit {
  count = signal(0);
  private connection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:5001/hubs/dashboard')
    .withAutomaticReconnect()
    .build();

  async ngOnInit() {
    this.connection.on('OrderCreated', (orderId: string, total: number) =>
      this.count.update(c => c + 1));
    await this.connection.start();
  }
}

// Remarque : pour rester en Clean Architecture, remplace IHubContext dans le handler
// par une interface IDashboardNotifier définie dans Application.`
    },
    {
      level: "moyen",
      title: "Notifications ciblées par client",
      prompt: `<p>Seul le propriétaire d'une commande doit recevoir <code>OrderStatusChanged</code>. Protège le hub avec <code>[Authorize]</code>, inscris chaque connexion dans un groupe <code>customer-{id}</code> et envoie la notification uniquement à ce groupe. Explique pourquoi <code>Clients.User</code> serait aussi une option.</p>`,
      hint: `<p><code>OnConnectedAsync</code> + <code>Context.UserIdentifier</code>. <code>Clients.User(id)</code> cible toutes les connexions d'un utilisateur, sans gérer de groupe.</p>`,
      solution: `[Authorize]
public sealed class OrderHub : Hub<IOrderClient>
{
    public override async Task OnConnectedAsync()
    {
        // UserIdentifier = claim NameIdentifier (sub) du JWT
        var userId = Context.UserIdentifier
            ?? throw new HubException("Utilisateur non identifié");
        await Groups.AddToGroupAsync(Context.ConnectionId, GroupFor(userId));
        await base.OnConnectedAsync();
    }

    public static string GroupFor(string customerId) => "customer-" + customerId;
}

public sealed class SignalROrderNotifier(IHubContext<OrderHub, IOrderClient> hub) : IOrderNotifier
{
    public Task StatusChangedAsync(Guid customerId, Guid orderId, string status, CancellationToken ct) =>
        hub.Clients.Group(OrderHub.GroupFor(customerId.ToString()))
           .OrderStatusChanged(new OrderStatusChangedMessage(orderId, status));
}

// Alternative sans groupe :
// hub.Clients.User(customerId.ToString()).OrderStatusChanged(...)
// Clients.User suffit quand la cible est exactement un utilisateur.
// Les groupes deviennent utiles pour des audiences métier :
// "warehouse-paris", "admins", "order-42-watchers", etc.
// Pas besoin de RemoveFromGroupAsync à la déconnexion : SignalR nettoie seul.`
    },
    {
      level: "difficile",
      title: "JWT sur WebSocket et resynchronisation après coupure",
      prompt: `<p>Configure l'authentification JWT pour que le hub accepte le token passé dans <code>access_token</code>, uniquement sur <code>/hubs</code>. Côté Angular, après une reconnexion, recharge la liste des commandes via l'API et affiche un bandeau « connexion perdue » pendant la coupure.</p>`,
      hint: `<p><code>JwtBearerEvents.OnMessageReceived</code> : lis <code>context.Request.Query["access_token"]</code> et vérifie <code>context.HttpContext.Request.Path.StartsWithSegments("/hubs")</code>. Côté client : <code>onreconnecting</code>, <code>onreconnected</code>, <code>onclose</code>.</p>`,
      solution: `// Program.cs (serveur)
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        builder.Configuration.Bind("Jwt", options);
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var token = context.Request.Query["access_token"];
                // Ne lire la query string que pour le hub : ailleurs, un token dans l'URL
                // finirait dans les logs et l'historique du navigateur
                if (!string.IsNullOrEmpty(token) &&
                    context.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                {
                    context.Token = token;
                }
                return Task.CompletedTask;
            }
        };
    });

// Angular
import { Injectable, inject, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { OrderStore } from './order.store';

@Injectable({ providedIn: 'root' })
export class OrderRealtimeService {
  private auth = inject(AuthService);
  private store = inject(OrderStore);

  readonly state = signal<'connected' | 'reconnecting' | 'disconnected'>('disconnected');

  private connection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/orders', { accessTokenFactory: () => this.auth.token() ?? '' })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .build();

  async start() {
    this.connection.on('OrderStatusChanged', (msg: { orderId: string; status: string }) =>
      this.store.refreshOne(msg.orderId));

    this.connection.onreconnecting(() => this.state.set('reconnecting'));

    this.connection.onreconnected(async () => {
      this.state.set('connected');
      // Les messages émis pendant la coupure sont perdus : on relit la source de vérité
      await this.store.reloadAll();
    });

    this.connection.onclose(() => this.state.set('disconnected'));

    await this.connection.start();
    this.state.set('connected');
  }
}

// Template du bandeau
// @if (realtime.state() !== 'connected') {
//   <div class="banner">Connexion temps réel perdue, reconnexion en cours…</div>
// }

// Remarque : accessTokenFactory est rappelé à chaque (re)connexion,
// donc un token rafraîchi entre-temps est bien utilisé.`
    }
  ],
  project: `<p><strong>OrderFlow : notifications temps réel.</strong></p>
<ul>
  <li>Ajoute <code>OrderHub</code> (avec <code>[Authorize]</code>) et <code>IOrderNotifier</code> dans Application, implémenté avec SignalR dans Api.</li>
  <li>Le job de traitement asynchrone (jour 23) appelle <code>IOrderNotifier</code> quand une commande passe à <code>Shipped</code>.</li>
  <li>Dans le front Angular, affiche un toast au changement de statut et recharge la liste après une reconnexion.</li>
  <li>Bonus : écris un test d'intégration avec <code>WebApplicationFactory</code> et le client .NET <code>Microsoft.AspNetCore.SignalR.Client</code> qui vérifie qu'un client reçoit bien le message.</li>
</ul>`,
  resources: [
    { label: "Introduction à SignalR (Microsoft Learn)", url: "https://learn.microsoft.com/aspnet/core/signalr/introduction" },
    { label: "Hubs SignalR", url: "https://learn.microsoft.com/aspnet/core/signalr/hubs" },
    { label: "gRPC sur .NET", url: "https://learn.microsoft.com/aspnet/core/grpc/" }
  ]
});

/* ===================== JOUR 28 ===================== */
window.COURSE.push({
  day: 28, week: 4,
  title: "Projet final : durcissement de l'API",
  summary: "Sécuriser, limiter et versionner l'API OrderFlow pour qu'elle tienne en production.",
  objectives: [
    "Appliquer une checklist de sécurité ASP.NET Core (secrets, autorisation par défaut, en-têtes, CORS)",
    "Configurer le rate limiting intégré avec des partitions par utilisateur",
    "Versionner l'API sans casser les clients existants",
    "Rendre les POST idempotents et poser des limites de taille et de durée"
  ],
  lesson: `
<h3>Le passage du « ça marche » au « ça tient »</h3>
<p>Une API de démo répond aux bons appels. Une API de production survit aux mauvais : un client qui boucle, un token volé, un champ inattendu dans le JSON, un double clic sur « Payer ». Le durcissement consiste à fermer ces portes une par une. Cette journée est une checklist à appliquer au fil rouge.</p>

<h3>Sécurité : la checklist</h3>
<ul>
  <li><strong>Secrets</strong> : aucun mot de passe ni clé dans <code>appsettings.json</code>. En local, <code>dotnet user-secrets</code> ; en production, variables d'environnement ou Azure Key Vault.</li>
  <li><strong>Autorisation par défaut</strong> : définis une <code>FallbackPolicy</code> qui exige un utilisateur authentifié. Un endpoint oublié est alors fermé, pas ouvert. Les routes publiques le déclarent explicitement avec <code>AllowAnonymous()</code>.</li>
  <li><strong>Autorisation métier</strong> : être authentifié ne suffit pas. Vérifie que la commande 42 appartient bien à l'utilisateur (sinon faille IDOR, la plus courante en API).</li>
  <li><strong>Overposting</strong> : n'expose jamais tes entités EF en entrée. Un DTO <code>CreateOrderRequest</code> sans champ <code>Status</code> empêche un client de créer une commande déjà « payée ».</li>
  <li><strong>Erreurs</strong> : <code>ProblemDetails</code> sans stack trace en production. La trace va dans les logs, avec un <code>traceId</code> renvoyé au client.</li>
  <li><strong>Transport</strong> : <code>UseHttpsRedirection</code> et <code>UseHsts</code> hors développement. En-têtes <code>X-Content-Type-Options: nosniff</code> et <code>X-Frame-Options</code>.</li>
  <li><strong>CORS</strong> : origines explicites, jamais <code>AllowAnyOrigin</code> avec des credentials.</li>
  <li><strong>Limites</strong> : taille maximale du corps de requête, timeout de requête (<code>AddRequestTimeouts</code>), pagination obligatoire avec un <code>pageSize</code> plafonné.</li>
</ul>

<h3>Rate limiting intégré</h3>
<p>Depuis .NET 7, <code>Microsoft.AspNetCore.RateLimiting</code> est inclus. Quatre algorithmes :</p>
<ul>
  <li><strong>Fixed window</strong> : N requêtes par fenêtre fixe. Simple, mais autorise des pics en bord de fenêtre.</li>
  <li><strong>Sliding window</strong> : fenêtre découpée en segments, lisse les pics.</li>
  <li><strong>Token bucket</strong> : des jetons se rechargent à débit constant. Autorise des rafales courtes.</li>
  <li><strong>Concurrency</strong> : limite le nombre de requêtes <em>simultanées</em>, utile pour un endpoint coûteux (export PDF).</li>
</ul>
<p>L'important est la <strong>partition</strong> : une limite globale punit tout le monde à cause d'un seul client. Avec <code>PartitionedRateLimiter</code>, chaque utilisateur (ou IP pour les anonymes) a son propre compteur. Mets <code>RejectionStatusCode = 429</code> (la valeur par défaut est 503, trompeuse) et renvoie un en-tête <code>Retry-After</code>.</p>

<h3>Versioning d'API</h3>
<p>Dès qu'un client externe (ton front, une app mobile, un partenaire) consomme l'API, tu ne peux plus renommer un champ librement. Le package <code>Asp.Versioning.Http</code> (anciennement Microsoft.AspNetCore.Mvc.Versioning) gère les versions par segment d'URL (<code>/api/v2/orders</code>), en-tête ou query string. Le segment d'URL est le plus lisible et le plus simple à mettre en cache.</p>
<ul>
  <li>Une modification <strong>additive</strong> (nouveau champ optionnel) ne demande pas de nouvelle version.</li>
  <li>Une modification <strong>cassante</strong> (champ renommé, supprimé, type changé, sémantique modifiée) en demande une.</li>
  <li>Marque l'ancienne version comme dépréciée, annonce une date de fin, puis supprime-la.</li>
</ul>

<h3>Idempotence</h3>
<p>Le réseau coupe, le client réessaie, la commande est créée deux fois. La solution standard : le client envoie un en-tête <code>Idempotency-Key</code> (un GUID par intention). Le serveur mémorise la réponse associée à cette clé et la renvoie telle quelle en cas de répétition.</p>

<div class="note"><strong>Niveau senior.</strong> Le rate limiter intégré compte <em>par instance</em>. Avec trois réplicas derrière un load balancer, un client obtient trois fois la limite. Pour une limite stricte et globale, place-la dans l'API gateway (YARP, Azure API Management, Nginx) ou dans un compteur partagé (Redis). Le limiteur in-process reste utile comme protection locale contre la surcharge. Sache aussi expliquer la différence entre <em>protéger le serveur</em> (concurrency, timeouts) et <em>faire respecter un quota commercial</em> (par client, centralisé).</div>
`,
  examples: [
    {
      title: "Rate limiting partitionné par utilisateur",
      code: `using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Limite globale : un compteur par utilisateur, ou par IP si anonyme
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(http =>
    {
        var key = http.User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? http.Connection.RemoteIpAddress?.ToString()
                  ?? "unknown";
        return RateLimitPartition.GetSlidingWindowLimiter(key, _ => new SlidingWindowRateLimiterOptions
        {
            PermitLimit = 100,
            Window = TimeSpan.FromMinutes(1),
            SegmentsPerWindow = 6,
            QueueLimit = 0
        });
    });

    // Politique nommée, plus stricte, pour un endpoint coûteux
    options.AddConcurrencyLimiter("exports", o =>
    {
        o.PermitLimit = 2;
        o.QueueLimit = 5;
        o.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
    });

    options.OnRejected = (context, ct) =>
    {
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            context.HttpContext.Response.Headers.RetryAfter =
                ((int)retryAfter.TotalSeconds).ToString();
        return ValueTask.CompletedTask;
    };
});

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter(); // après l'authentification pour connaître l'utilisateur

app.MapGet("/api/orders/export", ExportOrders).RequireRateLimiting("exports");`,
      explain: `<code>UseRateLimiter</code> doit venir après <code>UseAuthentication</code>, sinon <code>http.User</code> est vide et tout le monde tombe dans la partition IP.`
    },
    {
      title: "Versioning avec Asp.Versioning.Http",
      code: `// dotnet add package Asp.Versioning.Http
using Asp.Versioning;

builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true; // en-têtes api-supported-versions / api-deprecated-versions
    options.ApiVersionReader = new UrlSegmentApiVersionReader();
});

var app = builder.Build();

var versions = app.NewApiVersionSet()
    .HasDeprecatedApiVersion(new ApiVersion(1))
    .HasApiVersion(new ApiVersion(2))
    .ReportApiVersions()
    .Build();

var orders = app.MapGroup("/api/v{version:apiVersion}/orders")
    .WithApiVersionSet(versions);

// v1 : total en decimal simple
orders.MapGet("/{id:guid}", async (Guid id, ISender sender) =>
        Results.Ok(await sender.Send(new GetOrderV1Query(id))))
    .MapToApiVersion(1);

// v2 : total en objet Money { amount, currency }, changement cassant
orders.MapGet("/{id:guid}", async (Guid id, ISender sender) =>
        Results.Ok(await sender.Send(new GetOrderV2Query(id))))
    .MapToApiVersion(2);`,
      explain: `Les deux versions partagent le domaine et ne diffèrent que par la query et le DTO de sortie. Garde la logique métier hors des endpoints pour que maintenir v1 coûte peu.`
    },
    {
      title: "Autorisation par défaut et en-têtes de sécurité",
      code: `builder.Services.AddAuthorizationBuilder()
    // Tout endpoint sans attribut exige un utilisateur authentifié
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build())
    .AddPolicy("admin", p => p.RequireRole("Admin"));

builder.Services.AddProblemDetails();
builder.Services.AddRequestTimeouts(o =>
    o.DefaultPolicy = new RequestTimeoutPolicy { Timeout = TimeSpan.FromSeconds(10) });
builder.WebHost.ConfigureKestrel(k => k.Limits.MaxRequestBodySize = 1_000_000); // 1 Mo

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    app.UseHsts();
}
app.UseHttpsRedirection();

app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers.XContentTypeOptions = "nosniff";
    headers.XFrameOptions = "DENY";
    headers["Referrer-Policy"] = "no-referrer";
    await next();
});

app.UseAuthentication();
app.UseAuthorization();
app.UseRequestTimeouts();

app.MapGet("/health", () => Results.Ok()).AllowAnonymous();
app.MapDelete("/api/orders/{id:guid}", DeleteOrder).RequireAuthorization("admin");`,
      explain: `Avec la <code>FallbackPolicy</code>, oublier <code>RequireAuthorization</code> ne crée plus de faille. Les endpoints publics sont visibles d'un coup d'œil grâce à <code>AllowAnonymous()</code>.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Premier limiteur",
      prompt: `<p>Ajoute une politique <code>fixed</code> de 10 requêtes par 10 secondes sur <code>GET /api/products</code>. Vérifie avec une boucle (PowerShell, curl ou un fichier <code>.http</code>) que la 11<sup>e</sup> requête renvoie 429.</p>`,
      hint: `<p><code>options.AddFixedWindowLimiter("fixed", …)</code> puis <code>.RequireRateLimiting("fixed")</code>. N'oublie pas <code>RejectionStatusCode</code> et <code>app.UseRateLimiter()</code>.</p>`,
      solution: `builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("fixed", o =>
    {
        o.PermitLimit = 10;
        o.Window = TimeSpan.FromSeconds(10);
        o.QueueLimit = 0; // pas de file d'attente : rejet immédiat
    });
});

var app = builder.Build();
app.UseRateLimiter();

app.MapGet("/api/products", (AppDbContext db) => db.Products.AsNoTracking().Take(50).ToListAsync())
   .RequireRateLimiting("fixed");

// Test PowerShell :
// 1..12 | ForEach-Object {
//   try { (Invoke-WebRequest https://localhost:5001/api/products).StatusCode }
//   catch { $_.Exception.Response.StatusCode.value__ }
// }
// Résultat attendu : dix fois 200, puis 429 429.

// Attention : cette limite est globale à tous les clients.
// Voir l'exercice suivant pour la partitionner.`
    },
    {
      level: "moyen",
      title: "Limite par utilisateur sur la création de commande",
      prompt: `<p>Crée une politique <code>orders-write</code> : 5 créations de commande par minute <strong>par utilisateur</strong> (token bucket), 2 par minute par IP pour les anonymes. Renvoie <code>Retry-After</code>. Écris un test d'intégration qui envoie 6 POST avec le même utilisateur et vérifie le 429.</p>`,
      hint: `<p><code>options.AddPolicy("orders-write", http =&gt; …)</code> accepte une fonction qui renvoie une <code>RateLimitPartition</code>. Dans le test, un <code>AuthenticationHandler</code> de test injecte l'utilisateur.</p>`,
      solution: `builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("orders-write", http =>
    {
        var userId = http.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is not null)
        {
            return RateLimitPartition.GetTokenBucketLimiter("user:" + userId, _ =>
                new TokenBucketRateLimiterOptions
                {
                    TokenLimit = 5,
                    TokensPerPeriod = 5,
                    ReplenishmentPeriod = TimeSpan.FromMinutes(1),
                    QueueLimit = 0,
                    AutoReplenishment = true
                });
        }

        var ip = http.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        return RateLimitPartition.GetFixedWindowLimiter("ip:" + ip, _ =>
            new FixedWindowRateLimiterOptions
            {
                PermitLimit = 2,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            });
    });

    options.OnRejected = (ctx, _) =>
    {
        if (ctx.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retry))
            ctx.HttpContext.Response.Headers.RetryAfter = ((int)retry.TotalSeconds).ToString();
        return ValueTask.CompletedTask;
    };
});

app.MapPost("/api/orders", CreateOrder).RequireRateLimiting("orders-write");

// Test d'intégration (xUnit)
public sealed class RateLimitTests(OrderFlowFactory factory) : IClassFixture<OrderFlowFactory>
{
    [Fact]
    public async Task Sixth_order_in_a_minute_is_rejected()
    {
        var client = factory.CreateClientAs(userId: "user-1"); // helper du jour 18
        var body = new { lines = new[] { new { productId = Guid.NewGuid(), quantity = 1 } } };

        for (var i = 0; i < 5; i++)
        {
            var ok = await client.PostAsJsonAsync("/api/orders", body);
            Assert.NotEqual(HttpStatusCode.TooManyRequests, ok.StatusCode);
        }

        var rejected = await client.PostAsJsonAsync("/api/orders", body);
        Assert.Equal(HttpStatusCode.TooManyRequests, rejected.StatusCode);
    }
}

// Note : RetryAfter n'est fourni que par certains limiteurs (token bucket, fenêtres).
// Le limiteur de concurrence n'en donne pas.`
    },
    {
      level: "difficile",
      title: "POST idempotent avec Idempotency-Key",
      prompt: `<p>Écris un <code>IEndpointFilter</code> réutilisable qui rend un endpoint POST idempotent : si l'en-tête <code>Idempotency-Key</code> a déjà été vu pour cet utilisateur, renvoie la réponse mémorisée (statut + corps) au lieu de rejouer le handler. Stocke-la 24 h dans <code>IDistributedCache</code>. Gère l'absence de clé (400) et indique la limite de ta solution face à deux requêtes simultanées.</p>`,
      hint: `<p>La clé de cache combine l'utilisateur et la clé reçue. Le filtre appelle <code>next(context)</code>, récupère un résultat <code>IValueHttpResult</code> + <code>IStatusCodeHttpResult</code>, le sérialise, puis le stocke. Pour la concurrence, pense à une contrainte d'unicité en base.</p>`,
      solution: `using System.Security.Claims;
using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;

public sealed record CachedResponse(int StatusCode, string? Json);

public sealed class IdempotencyFilter(IDistributedCache cache) : IEndpointFilter
{
    private static readonly DistributedCacheEntryOptions Ttl =
        new() { AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24) };

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext ctx, EndpointFilterDelegate next)
    {
        var http = ctx.HttpContext;
        var key = http.Request.Headers["Idempotency-Key"].ToString();
        if (!Guid.TryParse(key, out _))
            return Results.Problem("En-tête Idempotency-Key (GUID) obligatoire.", statusCode: 400);

        var userId = http.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";
        var cacheKey = "idem:" + userId + ":" + key;

        var cached = await cache.GetStringAsync(cacheKey, http.RequestAborted);
        if (cached is not null)
        {
            var previous = JsonSerializer.Deserialize<CachedResponse>(cached)!;
            http.Response.Headers["Idempotent-Replayed"] = "true";
            return previous.Json is null
                ? Results.StatusCode(previous.StatusCode)
                : Results.Content(previous.Json, "application/json", statusCode: previous.StatusCode);
        }

        var result = await next(ctx);

        // On ne mémorise que les succès : une erreur 5xx doit pouvoir être retentée
        var status = (result as IStatusCodeHttpResult)?.StatusCode ?? 200;
        if (status < 500)
        {
            var value = (result as IValueHttpResult)?.Value;
            var json = value is null ? null : JsonSerializer.Serialize(value, JsonSerializerOptions.Web);
            await cache.SetStringAsync(cacheKey,
                JsonSerializer.Serialize(new CachedResponse(status, json)), Ttl, http.RequestAborted);
        }

        return result;
    }
}

// Program.cs
builder.Services.AddStackExchangeRedisCache(o => o.Configuration = builder.Configuration.GetConnectionString("redis"));

app.MapPost("/api/orders", CreateOrder)
   .AddEndpointFilter<IdempotencyFilter>()
   .RequireRateLimiting("orders-write");

// Limite : deux requêtes identiques arrivant en même temps passent toutes les deux
// la lecture du cache avant que l'une n'écrive. Solutions :
// 1. Stocker la clé dans la table Orders avec un index unique (IdempotencyKey, CustomerId) :
//    la seconde insertion échoue (DbUpdateException) et on renvoie la commande existante.
// 2. Poser un verrou Redis (SET NX avec expiration) avant d'appeler next().
// La solution 1 est la plus robuste car la garantie vient de la base, source de vérité.`
    }
  ],
  project: `<p><strong>OrderFlow : passage en mode production.</strong> Applique et coche la checklist :</p>
<ul>
  <li><code>FallbackPolicy</code> authentifiée, vérification de propriété sur <code>GET/PUT /orders/{id}</code> (renvoie 404, pas 403, pour ne pas révéler l'existence).</li>
  <li>Secrets déplacés dans <code>user-secrets</code> et variables d'environnement Docker.</li>
  <li>Rate limiting global par utilisateur + politique <code>orders-write</code>.</li>
  <li>Versioning <code>/api/v1</code> ; crée une <code>v2</code> de <code>GET /orders/{id}</code> qui renvoie le total sous forme <code>Money</code>.</li>
  <li>Filtre d'idempotence sur <code>POST /orders</code>, avec index unique en base.</li>
  <li>Timeouts, taille maximale de requête, en-têtes de sécurité, <code>pageSize</code> plafonné à 100.</li>
</ul>`,
  resources: [
    { label: "Rate limiting dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/performance/rate-limit" },
    { label: "Sécurité ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/security/" },
    { label: "Asp.Versioning (GitHub)", url: "https://github.com/dotnet/aspnet-api-versioning" },
    { label: "OWASP API Security Top 10", url: "https://owasp.org/API-Security/" }
  ]
});

/* ===================== JOUR 29 ===================== */
window.COURSE.push({
  day: 29, week: 4,
  title: "Documentation et architecture du projet",
  summary: "Rendre OrderFlow compréhensible en dix minutes : README, ADR, diagrammes, OpenAPI et tests d'architecture.",
  objectives: [
    "Écrire un README qui permet de lancer le projet en une commande",
    "Consigner les décisions importantes dans des ADR",
    "Produire des diagrammes C4 et de séquence en Mermaid",
    "Garantir les règles d'architecture avec des tests automatisés"
  ],
  lesson: `
<h3>Pourquoi un senior documente</h3>
<p>Le code dit <em>ce que</em> fait le système. Il ne dit pas <em>pourquoi</em> il est construit ainsi, ni ce qui a été écarté. Six mois plus tard, sans cette trace, quelqu'un « simplifie » un choix délibéré et réintroduit le bug qu'il évitait. Un senior laisse derrière lui un projet qu'un nouveau venu comprend sans lui. C'est aussi ce que regarde un recruteur qui ouvre ton GitHub : il passe deux minutes sur le README avant de lire une seule ligne de C#.</p>

<h3>Le README</h3>
<p>Un bon README répond dans l'ordre aux questions du lecteur :</p>
<ul>
  <li><strong>Quoi</strong> : deux phrases sur le problème résolu.</li>
  <li><strong>Lancer</strong> : prérequis et <em>une seule</em> commande (<code>dotnet run --project src/OrderFlow.AppHost</code> avec Aspire, ou <code>docker compose up</code>).</li>
  <li><strong>Architecture</strong> : un diagramme et un paragraphe par couche.</li>
  <li><strong>Décisions</strong> : lien vers le dossier <code>docs/adr</code>.</li>
  <li><strong>Tests</strong> : comment les lancer, ce qu'ils couvrent.</li>
  <li><strong>Limites et suite</strong> : ce qui n'est pas fait et pourquoi. Cette section montre ta maturité plus que toutes les autres.</li>
</ul>

<h3>Les ADR (Architecture Decision Records)</h3>
<p>Un ADR est un court fichier Markdown, numéroté, qui consigne <strong>une</strong> décision. Le format de Michael Nygard tient en cinq rubriques : <em>Titre</em>, <em>Statut</em> (proposé, accepté, remplacé par ADR-00X), <em>Contexte</em> (les contraintes et forces en présence), <em>Décision</em>, <em>Conséquences</em> (positives <strong>et</strong> négatives). On ne modifie pas un ADR accepté : on en écrit un nouveau qui le remplace. L'historique des raisonnements reste ainsi intact.</p>
<p>Pour OrderFlow, candidats évidents : PostgreSQL plutôt que SQL Server, Clean Architecture, MediatR ou handlers maison, JWT plutôt que cookies, RabbitMQ pour les jobs.</p>

<h3>Les diagrammes : le modèle C4</h3>
<p>Le modèle C4 propose quatre niveaux de zoom. En pratique, les deux premiers suffisent presque toujours :</p>
<ul>
  <li><strong>Contexte</strong> : le système, ses utilisateurs et les systèmes externes (paiement, e-mail).</li>
  <li><strong>Conteneurs</strong> : les unités déployables (front Angular, API, worker, PostgreSQL, Redis, RabbitMQ) et leurs protocoles.</li>
  <li>Composants et code : à réserver aux zones complexes.</li>
</ul>
<p>GitHub et la plupart des outils affichent nativement les blocs <strong>Mermaid</strong>. Les diagrammes vivent donc dans le dépôt, versionnés avec le code, au lieu de dormir dans un fichier binaire que personne ne met à jour. Un diagramme de séquence du flux principal (création de commande) vaut plus que dix pages de texte.</p>

<h3>La documentation d'API</h3>
<p>En .NET 10, <code>Microsoft.AspNetCore.OpenApi</code> génère le document OpenAPI (<code>AddOpenApi</code> / <code>MapOpenApi</code>). Une interface comme Scalar (<code>Scalar.AspNetCore</code>) l'affiche. Enrichis chaque endpoint avec <code>WithSummary</code>, <code>WithDescription</code>, <code>Produces</code> et <code>ProducesProblem</code> : le front peut alors générer son client TypeScript à partir du contrat.</p>

<h3>La documentation exécutable : tests d'architecture</h3>
<p>Une règle écrite dans le README (« le Domain ne dépend de rien ») finit toujours par être violée. Une règle écrite dans un test casse la CI le jour où elle l'est. Les bibliothèques <code>NetArchTest.Rules</code> ou <code>ArchUnitNET</code> vérifient les dépendances entre assemblies, les conventions de nommage et la visibilité des types.</p>

<h3>Présenter le projet en entretien</h3>
<p>Prépare un récit de trois minutes : le problème, l'architecture en un schéma, <strong>deux décisions et leurs compromis</strong>, un problème rencontré et comment tu l'as diagnostiqué, ce que tu ferais autrement. Les recruteurs seniors cherchent du jugement, pas une liste de technologies.</p>

<h3>Pièges</h3>
<ul>
  <li>Documenter ce que le code dit déjà (« la méthode GetOrder récupère une commande »).</li>
  <li>Un diagramme trop détaillé, donc périmé en une semaine.</li>
  <li>Un README qui demande dix étapes manuelles pour démarrer.</li>
</ul>

<div class="note"><strong>Niveau senior.</strong> La meilleure documentation est celle que la machine vérifie : tests d'architecture, contrat OpenAPI testé, <code>docker compose</code> ou AppHost Aspire qui démarre tout. Garde la prose pour ce que la machine ne peut pas exprimer : le <em>pourquoi</em>, les compromis et les options écartées. Un ADR qui liste honnêtement ses inconvénients inspire plus confiance qu'une architecture présentée comme parfaite.</div>
`,
  examples: [
    {
      title: "Modèle de README pour OrderFlow",
      code: `# OrderFlow

API de gestion de commandes : création, paiement, expédition, notifications temps réel.
Projet d'apprentissage .NET 10 en Clean Architecture.

## Démarrer

Prérequis : .NET 10 SDK, Docker Desktop.

~~~bash
dotnet run --project src/OrderFlow.AppHost
~~~

Le dashboard Aspire s'ouvre et démarre PostgreSQL, Redis, RabbitMQ, l'API et le worker.
Documentation de l'API : https://localhost:5001/scalar

## Architecture

~~~mermaid
flowchart LR
  Front[Angular] -- REST + SignalR --> Api[OrderFlow.Api]
  Api --> App[Application<br/>CQRS handlers]
  App --> Domain[Domain]
  Infra[Infrastructure<br/>EF Core, Redis, RabbitMQ] --> App
  Worker[OrderFlow.Worker] --> App
~~~

- Domain : agrégats Order et Customer, value objects, événements. Aucune dépendance.
- Application : commandes et requêtes, validation, interfaces (IOrderRepository, IOrderNotifier).
- Infrastructure : EF Core (PostgreSQL), cache Redis, messagerie.
- Api : endpoints minimal API, authentification JWT, SignalR.

Décisions : voir docs/adr.

## Tests

~~~bash
dotnet test
~~~

- Unitaires : règles du domaine et handlers.
- Intégration : WebApplicationFactory + Testcontainers (PostgreSQL réel).
- Architecture : NetArchTest vérifie les dépendances entre couches.

## Limites connues

- Le rate limiting est par instance, pas global.
- Pas de saga pour le paiement : une panne entre paiement et confirmation demande une reprise manuelle.
- Prochaine étape : outbox pattern pour fiabiliser la publication des événements.`,
      explain: `Les blocs de code utilisent <code>~~~</code>, équivalent Markdown des triples backticks. La section « Limites connues » est souvent celle qui impressionne le plus en entretien.`
    },
    {
      title: "Un ADR au format Nygard",
      code: `# ADR-003 : Handlers CQRS sans MediatR

Date : 2026-11-28
Statut : accepté

## Contexte

L'application compte une vingtaine de cas d'usage. Nous voulons séparer commandes et
requêtes et appliquer validation et logging de façon transversale.
MediatR est passé sous licence commerciale à partir de la version 13. L'équipe est
composée de développeurs habitués à l'injection de dépendances classique.

## Décision

Chaque cas d'usage est une classe Handler injectée directement dans l'endpoint.
Les comportements transversaux (validation, logging) sont des décorateurs enregistrés
avec Scrutor, ou des endpoint filters côté API.

## Conséquences

Positives :
- Aucune dépendance tierce ni question de licence.
- Navigation directe dans l'IDE : Ctrl+clic de l'endpoint vers le handler.
- Moins de magie pour un nouveau venu.

Négatives :
- Un peu plus de code d'enregistrement DI.
- Pas de publication d'événements in-process clé en main : à écrire nous-mêmes
  (environ 30 lignes) si le besoin apparaît.

Options écartées : MediatR (licence, indirection), Wolverine (trop d'apprentissage pour le besoin).`,
      explain: `Les conséquences négatives et les options écartées sont la partie la plus utile d'un ADR. Fichier à placer dans <code>docs/adr/003-handlers-sans-mediatr.md</code>.`
    },
    {
      title: "Tests d'architecture avec NetArchTest",
      code: `// dotnet add tests/OrderFlow.ArchitectureTests package NetArchTest.Rules
using NetArchTest.Rules;

public sealed class LayerTests
{
    private const string Application = "OrderFlow.Application";
    private const string Infrastructure = "OrderFlow.Infrastructure";
    private const string Api = "OrderFlow.Api";

    [Fact]
    public void Domain_has_no_dependency_on_other_layers()
    {
        var result = Types.InAssembly(typeof(OrderFlow.Domain.Orders.Order).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny(Application, Infrastructure, Api)
            .GetResult();

        Assert.True(result.IsSuccessful, Describe(result));
    }

    [Fact]
    public void Application_does_not_depend_on_infrastructure_or_ef()
    {
        var result = Types.InAssembly(typeof(OrderFlow.Application.AssemblyMarker).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny(Infrastructure, Api, "Microsoft.EntityFrameworkCore")
            .GetResult();

        Assert.True(result.IsSuccessful, Describe(result));
    }

    private static string Describe(TestResult result) =>
        "Types en infraction : " + string.Join(", ", result.FailingTypeNames ?? []);
}`,
      explain: `Ces tests tournent en CI comme les autres. Le message liste les types fautifs, ce qui rend la correction immédiate.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Écrire l'ADR de la base de données",
      prompt: `<p>Rédige <code>docs/adr/001-postgresql.md</code> au format Nygard pour justifier le choix de PostgreSQL dans OrderFlow. Inclus au moins deux conséquences négatives et une option écartée.</p>`,
      hint: `<p>Pense au coût, à l'hébergement (conteneur, Azure Database for PostgreSQL), au provider EF Core Npgsql, aux types JSONB, et aux habitudes d'une équipe venant de SQL Server.</p>`,
      solution: `# ADR-001 : PostgreSQL comme base principale

Date : 2026-11-10
Statut : accepté

## Contexte

OrderFlow a besoin d'une base relationnelle transactionnelle : commandes, lignes,
clients, stock. Le projet tourne en conteneurs (Docker, Aspire) en local et en CI,
et doit pouvoir être hébergé chez plusieurs fournisseurs cloud.
Certaines données (adresses, métadonnées de paiement) ont une structure variable.
Le budget d'hébergement est limité.

## Décision

Nous utilisons PostgreSQL 17 avec le provider EF Core Npgsql.

## Conséquences

Positives :
- Gratuit et open source, image Docker officielle légère, démarrage rapide en CI
  avec Testcontainers.
- Disponible en service managé chez tous les grands clouds.
- Type JSONB indexable pour les données semi-structurées, sans seconde base.

Négatives :
- L'équipe connaît mieux SQL Server : courbe d'apprentissage sur les outils
  (psql, pgAdmin) et sur certaines différences (casse des identifiants, séquences).
- Quelques fonctions EF Core se traduisent différemment : les requêtes brutes SQL
  ne sont pas portables vers SQL Server.

Options écartées :
- SQL Server : coût de licence en production, image Docker plus lourde.
- MongoDB : le modèle commande/lignes/stock est relationnel et demande des transactions.`
    },
    {
      level: "moyen",
      title: "Diagramme de séquence du flux de commande",
      prompt: `<p>Écris en Mermaid le diagramme de séquence de <code>POST /api/v1/orders</code> : front Angular, API (authentification, rate limiting, filtre d'idempotence), handler, base, publication vers RabbitMQ, worker, notification SignalR. Fais apparaître le cas où la clé d'idempotence est déjà connue.</p>`,
      hint: `<p><code>sequenceDiagram</code>, <code>participant</code>, flèches <code>-&gt;&gt;</code> (synchrone) et <code>--&gt;&gt;</code> (réponse), bloc <code>alt … else … end</code> pour les branches.</p>`,
      solution: `sequenceDiagram
    autonumber
    participant F as Front Angular
    participant A as OrderFlow.Api
    participant C as Redis
    participant H as CreateOrderHandler
    participant DB as PostgreSQL
    participant MQ as RabbitMQ
    participant W as Worker
    participant S as SignalR Hub

    F->>A: POST /api/v1/orders (JWT, Idempotency-Key)
    A->>A: Authentification + rate limiting
    A->>C: GET idem:user:key
    alt Clé déjà vue
        C-->>A: réponse mémorisée
        A-->>F: 201 Created (Idempotent-Replayed: true)
    else Nouvelle clé
        A->>H: Handle(CreateOrderCommand)
        H->>DB: INSERT Order + Outbox (même transaction)
        DB-->>H: OK
        H-->>A: OrderId
        A->>C: SET idem:user:key (24 h)
        A-->>F: 201 Created + Location
        DB-)MQ: Outbox relay publie OrderCreated
        MQ-)W: OrderCreated
        W->>DB: Réserver le stock, statut = Confirmed
        W->>S: StatusChanged(customer, order, Confirmed)
        S-)F: OrderStatusChanged
        F->>A: GET /api/v1/orders/{id}
    end

// Remarques :
// - "-)" représente un message asynchrone.
// - Le front relit la commande après le signal SignalR (signal, pas donnée).
// - L'outbox garantit que l'événement n'est publié que si la commande est en base.`
    },
    {
      level: "difficile",
      title: "Faire respecter l'architecture et les conventions",
      prompt: `<p>Écris une suite de tests d'architecture qui vérifie :</p>
<ul>
  <li>le Domain ne dépend d'aucune autre couche ni d'EF Core ;</li>
  <li>l'Api ne référence pas directement l'Infrastructure, sauf <code>Program</code> (composition root) ;</li>
  <li>toute classe dont le nom se termine par <code>Handler</code> dans Application est <code>sealed</code> et non publique hors de son espace de noms <code>…Features</code> ;</li>
  <li>les entités du Domain n'ont pas de setter public.</li>
</ul>
<p>Pour la dernière règle, NetArchTest ne suffit pas : utilise la réflexion.</p>`,
      hint: `<p>NetArchTest : <code>That().HaveNameEndingWith("Handler").Should().BeSealed()</code>, <code>ResideInNamespaceContaining</code>, <code>That().DoNotHaveName("Program")</code>. Réflexion : <code>GetProperties()</code> puis <code>SetMethod?.IsPublic</code>.</p>`,
      solution: `using System.Reflection;
using NetArchTest.Rules;

public sealed class ArchitectureTests
{
    private static readonly Assembly Domain = typeof(OrderFlow.Domain.Orders.Order).Assembly;
    private static readonly Assembly Application = typeof(OrderFlow.Application.AssemblyMarker).Assembly;
    private static readonly Assembly Api = typeof(Program).Assembly;

    [Fact]
    public void Domain_is_pure()
    {
        var result = Types.InAssembly(Domain)
            .ShouldNot()
            .HaveDependencyOnAny(
                "OrderFlow.Application", "OrderFlow.Infrastructure", "OrderFlow.Api",
                "Microsoft.EntityFrameworkCore")
            .GetResult();

        Assert.True(result.IsSuccessful, Fail(result));
    }

    [Fact]
    public void Api_uses_infrastructure_only_in_composition_root()
    {
        var result = Types.InAssembly(Api)
            .That().DoNotHaveName("Program")
            .ShouldNot().HaveDependencyOn("OrderFlow.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful, Fail(result));
    }

    [Fact]
    public void Handlers_are_sealed_and_live_in_features()
    {
        var result = Types.InAssembly(Application)
            .That().HaveNameEndingWith("Handler")
            .Should().BeSealed()
            .And().ResideInNamespaceContaining(".Features")
            .GetResult();

        Assert.True(result.IsSuccessful, Fail(result));
    }

    [Fact]
    public void Domain_entities_have_no_public_setters()
    {
        var offenders = Domain.GetTypes()
            .Where(t => t.IsClass && !t.IsAbstract && t.Namespace?.StartsWith("OrderFlow.Domain") == true)
            .SelectMany(t => t.GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .Where(p => p.SetMethod is { IsPublic: true } && !IsInitOnly(p))
                .Select(p => t.Name + "." + p.Name))
            .ToList();

        Assert.True(offenders.Count == 0, "Setters publics : " + string.Join(", ", offenders));
    }

    // Un setter "init" est public en IL mais porte le modificateur IsExternalInit
    private static bool IsInitOnly(PropertyInfo p) =>
        p.SetMethod!.ReturnParameter.GetRequiredCustomModifiers()
            .Any(m => m.FullName == "System.Runtime.CompilerServices.IsExternalInit");

    private static string Fail(TestResult r) =>
        "Infractions : " + string.Join(", ", r.FailingTypeNames ?? []);
}

// Remarque : la règle "Api ne dépend pas d'Infrastructure" suppose que l'Api appelle
// une méthode d'extension AddInfrastructure() définie dans Infrastructure, depuis Program.
// Program dépend donc d'Infrastructure, et c'est la seule exception autorisée.`
    }
  ],
  project: `<p><strong>OrderFlow : documentation finale.</strong></p>
<ul>
  <li>README complet sur le modèle de l'exemple, avec démarrage en une commande vérifié sur une machine vierge (ou un conteneur).</li>
  <li>Au moins 4 ADR : base de données, architecture, CQRS, authentification.</li>
  <li><code>docs/architecture.md</code> : diagramme C4 contexte + conteneurs et diagramme de séquence de la création de commande.</li>
  <li>OpenAPI enrichi (<code>WithSummary</code>, <code>ProducesProblem</code>) et interface Scalar.</li>
  <li>Projet <code>OrderFlow.ArchitectureTests</code> branché dans la CI.</li>
  <li>Prépare ton récit de présentation de trois minutes et chronomètre-le.</li>
</ul>`,
  resources: [
    { label: "Architecture Decision Records", url: "https://adr.github.io/" },
    { label: "Le modèle C4", url: "https://c4model.com/" },
    { label: "OpenAPI dans ASP.NET Core", url: "https://learn.microsoft.com/aspnet/core/fundamentals/openapi/overview" },
    { label: "NetArchTest (GitHub)", url: "https://github.com/BenMorris/NetArchTest" },
    { label: "Diagrammes Mermaid", url: "https://mermaid.js.org/" }
  ]
});

/* ===================== JOUR 30 ===================== */
window.COURSE.push({
  day: 30, week: 4,
  title: "Préparation à l'entretien senior .NET",
  summary: "Les questions techniques qui reviennent en entretien senior, avec des réponses structurées et un exercice de system design.",
  objectives: [
    "Répondre avec précision aux questions classiques sur async, DI, EF Core, LINQ et le GC",
    "Structurer une réponse : définition, exemple, compromis",
    "Mener un exercice de system design de bout en bout",
    "Savoir défendre, et critiquer, ses propres choix d'architecture"
  ],
  lesson: `
<h3>Ce qu'on attend d'un senior</h3>
<p>Un entretien senior ne vérifie pas que tu connais la syntaxe. Il vérifie que tu sais <strong>pourquoi</strong> une chose fonctionne, <strong>quand</strong> elle casse et <strong>quel compromis</strong> tu acceptes. Structure chaque réponse en trois temps : une définition courte, un exemple concret tiré d'un projet (OrderFlow fera l'affaire), puis la limite ou le compromis. Dire « ça dépend » est acceptable à condition de dire <em>de quoi</em>.</p>

<h3>Task et ValueTask</h3>
<p><code>Task</code> est une classe : chaque appel asynchrone qui ne se termine pas immédiatement alloue un objet. <code>ValueTask</code> est une struct qui peut contenir directement le résultat quand l'opération se termine de façon synchrone (lecture en cache, buffer déjà rempli), sans allocation. Contreparties : une <code>ValueTask</code> ne doit être attendue <strong>qu'une seule fois</strong>, ne doit pas être attendue en parallèle et ne se combine pas avec <code>Task.WhenAll</code> sans conversion via <code>AsTask()</code>. Règle : <code>Task</code> par défaut, <code>ValueTask</code> sur un chemin chaud mesuré où le résultat synchrone est fréquent.</p>

<h3>ConfigureAwait(false)</h3>
<p>Après un <code>await</code>, la continuation reprend par défaut sur le <code>SynchronizationContext</code> capturé (le thread UI en WPF, la requête dans l'ancien ASP.NET). <code>ConfigureAwait(false)</code> renonce à ce retour. <strong>ASP.NET Core n'a pas de SynchronizationContext</strong> : dans le code applicatif, il ne change rien. Il reste recommandé dans les <strong>bibliothèques</strong> qui peuvent être utilisées depuis une application UI, pour éviter les deadlocks quand un appelant bloque avec <code>.Result</code>.</p>

<h3>Lifetimes DI et captive dependency</h3>
<p><strong>Transient</strong> : une nouvelle instance à chaque résolution. <strong>Scoped</strong> : une par requête HTTP (ou par scope créé). <strong>Singleton</strong> : une pour toute l'application. La <em>captive dependency</em> survient quand un singleton reçoit un service scoped : celui-ci est capturé et vit aussi longtemps que l'application. Avec un <code>DbContext</code>, cela donne un contexte partagé entre requêtes, non thread-safe, qui grossit sans fin. En développement, <code>ValidateScopes</code> lève une exception au démarrage. La correction : injecter <code>IServiceScopeFactory</code> et créer un scope par unité de travail.</p>

<h3>N+1 avec EF Core</h3>
<p>On charge 100 commandes, puis on accède à <code>order.Customer</code> dans une boucle : avec le lazy loading, cela fait 1 + 100 requêtes. Solutions : <code>Include</code> (eager loading), ou mieux une <strong>projection</strong> avec <code>Select</code> vers un DTO, qui ne lit que les colonnes utiles. Attention à l'explosion cartésienne quand on inclut plusieurs collections : <code>AsSplitQuery()</code> la résout. Pour détecter le problème : logs SQL d'EF Core, ou traces OpenTelemetry qui montrent les requêtes répétées.</p>

<h3>IEnumerable et IQueryable</h3>
<p><code>IEnumerable&lt;T&gt;</code> exécute LINQ <strong>en mémoire</strong>, avec des delegates. <code>IQueryable&lt;T&gt;</code> construit un <strong>arbre d'expression</strong> que le provider (EF Core) traduit en SQL. Le piège : passer d'un <code>IQueryable</code> à un <code>IEnumerable</code> trop tôt (méthode qui renvoie <code>IEnumerable</code>, appel à <code>AsEnumerable</code> ou <code>ToList</code>) fait que le <code>Where</code> suivant s'exécute après avoir chargé toute la table.</p>

<h3>Le garbage collector</h3>
<p>Le GC .NET est générationnel. Les objets naissent en <strong>génération 0</strong>, collectée souvent et vite. Les survivants passent en gen 1, puis en gen 2, collectée rarement et coûteuse. Les objets de plus de <strong>85 000 octets</strong> vont directement dans le <strong>Large Object Heap</strong>, collecté avec la gen 2 et non compacté par défaut, d'où un risque de fragmentation. Leviers : réduire les allocations sur les chemins chauds (<code>Span&lt;T&gt;</code>, <code>ArrayPool&lt;T&gt;</code>, <code>StringBuilder</code>), éviter les gros tableaux temporaires, et choisir le mode Server GC pour les services.</p>

<h3>Quand ne pas utiliser Clean Architecture ou MediatR</h3>
<p>Pour un CRUD simple, un microservice de quelques endpoints ou un prototype, quatre projets et des handlers pour chaque lecture sont un coût sans bénéfice. Une <em>vertical slice architecture</em> (un dossier par fonctionnalité) ou une simple API minimale avec EF Core suffit. MediatR ajoute une indirection qui gêne la navigation dans le code ; il se justifie quand ses pipeline behaviors servent réellement (validation, transactions, logging transversaux). Un senior sait adapter l'architecture à la taille du problème.</p>

<h3>System design : la méthode</h3>
<ul>
  <li>Clarifier les exigences fonctionnelles et non fonctionnelles (volume, latence, disponibilité, cohérence).</li>
  <li>Estimer les ordres de grandeur (requêtes par seconde, volume de données).</li>
  <li>Proposer une architecture simple, puis la faire évoluer face aux contraintes.</li>
  <li>Traiter explicitement les pannes : que se passe-t-il si la base, le broker ou le paiement tombent ?</li>
</ul>

<div class="note"><strong>Niveau senior.</strong> La phrase qui fait la différence est souvent « voici comment je le mesurerais ». Avant d'optimiser avec <code>ValueTask</code> ou <code>Span</code>, cite BenchmarkDotNet, dotnet-counters ou les traces. Avant de choisir des microservices, parle de l'équipe et du déploiement. Et dis clairement ce que tu ne sais pas : inventer une réponse est bien pire qu'un « je ne l'ai jamais utilisé, voici comment je chercherais ».</div>
`,
  examples: [
    {
      title: "Captive dependency et correction",
      code: `// MAUVAIS : un singleton capture un DbContext scoped
public sealed class StockCache(AppDbContext db) // AppDbContext est Scoped
{
    public Task<int> GetAsync(Guid productId) =>
        db.Products.Where(p => p.Id == productId).Select(p => p.Stock).FirstAsync();
}
builder.Services.AddSingleton<StockCache>();
// En développement : InvalidOperationException
// "Cannot consume scoped service 'AppDbContext' from singleton 'StockCache'."

// BON : le singleton crée un scope par opération
public sealed class StockCache(IServiceScopeFactory scopes)
{
    public async Task<int> GetAsync(Guid productId, CancellationToken ct)
    {
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.Products
            .Where(p => p.Id == productId)
            .Select(p => p.Stock)
            .FirstAsync(ct);
    }
}

// Activer la validation hors développement aussi (utile en CI)
builder.Host.UseDefaultServiceProvider(o =>
{
    o.ValidateScopes = true;
    o.ValidateOnBuild = true;
});`,
      explain: `Une alternative propre est <code>IDbContextFactory&lt;AppDbContext&gt;</code> (enregistré avec <code>AddDbContextFactory</code>), qui crée un contexte court à la demande.`
    },
    {
      title: "N+1 et IQueryable : avant / après",
      code: `// N+1 : une requête pour les commandes, puis une par client (lazy loading)
var orders = await db.Orders.Where(o => o.CreatedAt >= since).ToListAsync(ct);
foreach (var o in orders)
    Console.WriteLine(o.Customer.Name); // requête SQL à chaque tour

// Filtre exécuté en mémoire : la méthode renvoie IEnumerable
IEnumerable<Order> All() => db.Orders;            // perd IQueryable
var big = All().Where(o => o.Total > 1000).ToList(); // SELECT * FROM Orders, puis filtre en C#

// Correct : projection, une seule requête, seulement les colonnes utiles
var rows = await db.Orders
    .AsNoTracking()
    .Where(o => o.CreatedAt >= since && o.Total > 1000)
    .OrderByDescending(o => o.CreatedAt)
    .Select(o => new OrderRow(o.Id, o.Customer.Name, o.Total, o.Lines.Count))
    .Take(100)
    .ToListAsync(ct);

public sealed record OrderRow(Guid Id, string CustomerName, decimal Total, int LineCount);

// Plusieurs collections incluses : éviter l'explosion cartésienne
var full = await db.Orders
    .Include(o => o.Lines)
    .Include(o => o.Payments)
    .AsSplitQuery()
    .FirstAsync(o => o.Id == id, ct);`,
      explain: `La projection produit un seul <code>SELECT</code> avec jointure et un <code>COUNT</code> en sous-requête. Vérifie toujours le SQL généré avec <code>ToQueryString()</code> ou les logs.`
    },
    {
      title: "ValueTask sur un chemin chaud",
      code: `public sealed class PriceProvider(IPriceApi api)
{
    private readonly ConcurrentDictionary<Guid, decimal> _cache = new();

    // Le plus souvent, le prix est en cache : retour synchrone, aucune allocation
    public ValueTask<decimal> GetPriceAsync(Guid productId, CancellationToken ct)
    {
        if (_cache.TryGetValue(productId, out var price))
            return ValueTask.FromResult(price);

        return new ValueTask<decimal>(LoadAsync(productId, ct));
    }

    private async Task<decimal> LoadAsync(Guid productId, CancellationToken ct)
    {
        var price = await api.FetchPriceAsync(productId, ct);
        _cache[productId] = price;
        return price;
    }
}

// Usage correct : attendre une seule fois
var price = await provider.GetPriceAsync(id, ct);

// Usage INCORRECT : attendre deux fois la même ValueTask
// var vt = provider.GetPriceAsync(id, ct);
// var a = await vt;
// var b = await vt; // comportement indéfini

// Besoin de combiner ? Convertir d'abord
// await Task.WhenAll(ids.Select(i => provider.GetPriceAsync(i, ct).AsTask()));`,
      explain: `Le gain n'existe que si le cas synchrone est fréquent. Mesure avec BenchmarkDotNet (<code>[MemoryDiagnoser]</code>) avant de généraliser.`
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Question : IEnumerable ou IQueryable ?",
      prompt: `<p>Le recruteur montre ce code et demande ce qui ne va pas :</p>
<pre>public IEnumerable&lt;Order&gt; GetOrders() =&gt; _db.Orders;
var recent = repo.GetOrders().Where(o =&gt; o.CreatedAt &gt; DateTime.UtcNow.AddDays(-7)).Take(20).ToList();</pre>
<p>Formule ta réponse comme en entretien, en moins de deux minutes.</p>`,
      hint: `<p>Où s'exécutent <code>Where</code> et <code>Take</code> ? Que contient la requête SQL envoyée ? Quelles sont les deux corrections possibles ?</p>`,
      solution: `Réponse modèle :

"Le repository renvoie IEnumerable<Order>. Le Where et le Take qui suivent ne sont donc
plus des opérateurs IQueryable : ce sont ceux de LINQ to Objects, qui travaillent
en mémoire avec des delegates.

Conséquence : EF Core exécute SELECT * FROM Orders sans filtre, matérialise et suit
(tracking) toutes les lignes de la table, puis C# filtre les sept derniers jours et
garde 20 éléments. Avec un million de commandes, on charge un million d'entités pour
en afficher vingt : mémoire, temps de réponse et charge base explosent.

IEnumerable exécute en mémoire. IQueryable construit un arbre d'expression que le
provider traduit en SQL, ici WHERE CreatedAt > @p ORDER BY ... LIMIT 20 (TOP 20).

Deux corrections :
1. Mettre le filtre dans le repository, avec une méthode dédiée :
   GetRecentOrdersAsync(int days, int take, CancellationToken ct)
   qui fait Where/OrderBy/Take puis ToListAsync. C'est ce que je préfère : le repository
   expose des intentions métier et on ne laisse pas fuir IQueryable dans toute l'appli.
2. Renvoyer IQueryable<Order>, ce qui corrige la performance mais rend la couche
   d'accès aux données poreuse : n'importe quel appelant peut écrire une requête non
   traduisible ou non indexée.

J'ajouterais aussi AsNoTracking pour une lecture, un OrderBy avant Take pour un
résultat déterministe, et je vérifierais le SQL avec les logs ou ToQueryString()."`
    },
    {
      level: "moyen",
      title: "Question : un bug qui n'arrive qu'en production",
      prompt: `<p>« Notre API renvoie parfois l'exception <em>A second operation was started on this context instance before a previous operation completed</em>, et la mémoire augmente toute la journée. Le service <code>NotificationService</code> est enregistré en singleton et reçoit un <code>IOrderRepository</code>. » Diagnostique et propose une correction, ainsi qu'une prévention durable.</p>`,
      hint: `<p>Quel est le lifetime de <code>IOrderRepository</code> et du <code>DbContext</code> qu'il contient ? Pourquoi l'erreur n'apparaît-elle pas en développement ? Que font <code>ValidateScopes</code> et <code>ValidateOnBuild</code> ?</p>`,
      solution: `Réponse modèle :

"C'est une captive dependency. IOrderRepository est Scoped et contient un DbContext
Scoped. En l'injectant dans un singleton, on capture une seule instance de repository,
donc un seul DbContext, pour toute la vie de l'application.

Cela explique les deux symptômes :
- L'exception : DbContext n'est pas thread-safe. Deux requêtes HTTP concurrentes
  utilisent le même contexte via le singleton, et EF Core détecte une seconde opération
  avant la fin de la première.
- La mémoire : le change tracker de ce contexte accumule toutes les entités chargées
  depuis le démarrage, sans jamais être libéré.

Pourquoi pas en développement ? En Development, ASP.NET Core active ValidateScopes et
aurait levé une exception au démarrage ou à la première résolution. Je suppose donc
que la résolution passe par un chemin non validé, ou que l'environnement local n'est
pas Development, ou que la charge locale n'a jamais produit d'appels concurrents.

Correction :
- Si NotificationService n'a pas besoin d'être singleton : l'enregistrer en Scoped.
- Sinon (par exemple un BackgroundService, toujours singleton) : injecter
  IServiceScopeFactory et créer un scope par unité de travail :
    await using var scope = scopes.CreateAsyncScope();
    var repo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
  ou utiliser IDbContextFactory<AppDbContext>.

Prévention :
- UseDefaultServiceProvider(o => { o.ValidateScopes = true; o.ValidateOnBuild = true; })
  dans tous les environnements, ou au moins en CI.
- Un test d'intégration qui construit l'hôte (WebApplicationFactory) : ValidateOnBuild
  fait échouer le test si un graphe de dépendances est invalide.
- En code review, toute injection dans un singleton ou un hosted service est un point
  d'attention."`
    },
    {
      level: "difficile",
      title: "System design : OrderFlow à grande échelle",
      prompt: `<p>« Concevez le système de commandes d'un e-commerçant : 10 000 commandes par minute lors des soldes, paiement par un prestataire externe, notification du client en temps réel, aucune commande ne doit être perdue ni facturée deux fois. » Tu as 30 minutes : exigences, estimations, architecture, gestion des pannes, évolutions.</p>`,
      hint: `<p>Pense : idempotence, outbox, broker, workers scalables, saga ou machine à états pour le paiement, cache du catalogue, backplane SignalR, observabilité. Commence simple et explique ce que tu ajoutes et pourquoi.</p>`,
      solution: `Réponse modèle (structure à suivre à l'oral) :

1. Clarifier les exigences
- Fonctionnel : créer une commande, réserver le stock, payer, confirmer, notifier.
- Non fonctionnel : pic de 10 000 commandes/min, aucune perte, pas de double facturation,
  latence de création perçue < 300 ms, disponibilité élevée pendant les soldes.
- Question à poser : le paiement doit-il être synchrone pour l'utilisateur ? Je propose
  que non : la commande est acceptée (202/201 "en attente"), puis confirmée.

2. Estimations
- 10 000/min = environ 170 commandes/s, prévoir 500/s de marge (x3).
- Lectures catalogue beaucoup plus nombreuses : 20 à 50 fois plus, donc cache obligatoire.
- 170 écritures/s est très raisonnable pour un PostgreSQL bien indexé : pas besoin de
  sharding au départ. Le vrai risque est le pic de contention sur le stock.

3. Architecture
- Front -> API gateway (TLS, rate limiting global par client) -> API Orders (stateless,
  plusieurs instances, autoscaling).
- POST /orders avec Idempotency-Key. Index unique (CustomerId, IdempotencyKey) en base :
  un double clic ou un retry réseau ne crée jamais deux commandes.
- Dans la même transaction : INSERT Order (statut Pending) + INSERT dans une table Outbox.
- Un relay lit l'outbox et publie OrderCreated sur RabbitMQ (ou Azure Service Bus).
  Cela évite le "dual write" : si la base valide, l'événement finira par partir.
- Workers consommateurs, scalables horizontalement :
  a) Stock : réservation avec UPDATE ... SET Stock = Stock - @q WHERE Stock >= @q
     (atomique, pas de survente), ou concurrence optimiste.
  b) Paiement : appel au prestataire avec une clé d'idempotence = OrderId, pour que
     le prestataire refuse une double facturation même si on réessaie.
- La commande suit une machine à états (Pending -> StockReserved -> Paid -> Confirmed,
  ou -> Cancelled). C'est une saga orchestrée : en cas d'échec du paiement,
  compensation = libérer le stock.
- Consommateurs idempotents : table ProcessedMessages (MessageId unique), car le broker
  garantit "au moins une fois", donc des doublons possibles.
- Notification : chaque transition publie OrderStatusChanged ; un service SignalR
  (Azure SignalR Service ou backplane Redis) pousse au groupe du client. Le front relit
  l'état via l'API à réception et après reconnexion.
- Catalogue et prix : lectures servies par Redis / HybridCache, invalidation sur
  événement ProductUpdated.

4. Pannes
- Base indisponible : l'API renvoie 503, rien n'est accepté, donc rien n'est perdu.
  Réplica en lecture et basculement managé.
- Broker indisponible : les événements restent dans l'outbox et partent au retour.
- Prestataire de paiement lent : timeouts + retries avec backoff (Polly, résilience
  .NET), circuit breaker ; les commandes restent Pending, puis job de réconciliation
  qui interroge le prestataire pour les commandes bloquées.
- Worker qui plante en plein traitement : message non acquitté, relivré, traitement
  idempotent.
- Messages toxiques : dead-letter queue + alerte.

5. Observabilité
- OpenTelemetry : traces de bout en bout (API -> broker -> worker), métriques
  (commandes/s par statut, durée de la saga, profondeur des files), logs structurés
  avec OrderId. Alertes sur la profondeur de file et le taux de Pending > 5 min.

6. Évolutions et compromis
- Si la contention sur le stock devient le goulot : réservation par lots, ou stock
  découpé par entrepôt.
- Si le volume grandit d'un ordre de grandeur : partitionner les commandes par client,
  séparer la lecture (CQRS avec modèle de lecture dénormalisé).
- Compromis assumé : cohérence à terme entre la commande et le paiement ; l'utilisateur
  voit "en cours de confirmation" quelques secondes. En échange : résilience au pic et
  aucune perte.
- Je ne partirais pas sur des microservices dès le départ : un monolithe modulaire
  (API + workers dans la même solution, modules séparés) déployé en plusieurs
  instances couvre ce besoin, et on extrait un module quand une équipe ou une
  contrainte de scalabilité le justifie.`
    }
  ],
  project: `<p><strong>Bilan et préparation finale.</strong></p>
<ul>
  <li>Relis tes notes des 29 jours et écris une fiche d'une page par semaine.</li>
  <li>Réponds à voix haute, chronométré, à chaque question de cette leçon. Enregistre-toi une fois et écoute.</li>
  <li>Fais l'exercice de system design sur papier en 30 minutes, puis compare avec la réponse modèle.</li>
  <li>Prépare trois questions à poser au recruteur (organisation de l'équipe, déploiement, dette technique).</li>
  <li>Publie OrderFlow sur GitHub avec le README du jour 29 et épingle-le sur ton profil.</li>
</ul>`,
  resources: [
    { label: "Injection de dépendances dans .NET", url: "https://learn.microsoft.com/dotnet/core/extensions/dependency-injection" },
    { label: "Chargement des données liées (EF Core)", url: "https://learn.microsoft.com/ef/core/querying/related-data/" },
    { label: "Fondamentaux du garbage collector", url: "https://learn.microsoft.com/dotnet/standard/garbage-collection/fundamentals" },
    { label: "ConfigureAwait FAQ (blog .NET)", url: "https://devblogs.microsoft.com/dotnet/configureawait-faq/" }
  ]
});
