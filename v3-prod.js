window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 6 - Mise en production
// Chapitre : Mettre une API en production
// =====================================================================

// =====================================================================
// 6.1 Mettre en cache
// =====================================================================
window.COURSE.push({
  key: "prod-caching",
  title: "Mettre en cache : IMemoryCache, HybridCache et output caching",
  summary: "Tu sauras éviter de recalculer ou de relire la base à chaque requête, en choisissant le bon cache et en l'invalidant au bon moment.",
  objectives: [
    "Comprendre ce qu'est un cache et quand il est utile",
    "Utiliser IMemoryCache avec GetOrCreate et une expiration",
    "Utiliser HybridCache pour un cache mémoire + distribué protégé contre les appels simultanés",
    "Mettre en cache des réponses HTTP entières avec l'output caching et les invalider par tag"
  ],
  analogy: `<p>Au restaurant, le serveur ne court pas en cuisine à chaque fois qu'un client demande la carte des desserts : il en garde quelques exemplaires <strong>à portée de main</strong>. C'est un cache.</p>
<p>Le jour où le chef change un dessert, il faut <strong>jeter les vieilles cartes</strong> et en imprimer de nouvelles. Sinon les clients commandent un plat qui n'existe plus. C'est l'invalidation, la partie difficile du cache.</p>`,
  lesson: `<h3>Pourquoi un cache ?</h3>
<p>Dans OrderFlow, la liste des produits est lue des centaines de fois par minute, mais elle change peut-être deux fois par jour. Relire SQL Server à chaque requête, c'est payer un aller-retour réseau et une requête pour obtenir exactement le même résultat. Un <strong>cache</strong> est une zone de stockage rapide où l'on garde une copie d'une donnée pour la resservir sans la recalculer.</p>
<div class="flow"><span>Requête</span><span>Dans le cache ?</span><span>Oui : réponse immédiate</span><span>Non : base puis cache</span></div>
<p>Ce schéma s'appelle le <strong>cache-aside</strong> : on regarde d'abord dans le cache ; si la donnée n'y est pas (un <em>cache miss</em>), on la lit à la source et on la range dans le cache pour la prochaine fois (le prochain sera un <em>cache hit</em>).</p>

<h3>IMemoryCache : le cache dans la mémoire du processus</h3>
<p><code>IMemoryCache</code> range les objets dans la RAM de ton API. C'est très rapide, mais chaque instance de l'API a son propre cache, et tout est perdu au redémarrage. On l'enregistre avec <code>builder.Services.AddMemoryCache()</code> puis on l'injecte comme n'importe quel service, comme un service Angular fourni en <code>providedIn: 'root'</code>.</p>
<p>La méthode clé est <code>GetOrCreate(clé, fabrique)</code> : si la clé existe, elle renvoie la valeur ; sinon elle appelle ta fabrique, stocke le résultat et le renvoie. Dans la fabrique, tu fixes la durée de vie : <code>AbsoluteExpirationRelativeToNow</code> (expire après X minutes quoi qu'il arrive) ou <code>SlidingExpiration</code> (expire si personne ne la lit pendant X minutes).</p>

<h3>HybridCache : deux niveaux et une protection</h3>
<p>Quand l'API tourne sur plusieurs serveurs, chacun a sa mémoire : un cache <strong>distribué</strong> (Redis, SQL Server…) permet de partager les données. <code>HybridCache</code> (package <code>Microsoft.Extensions.Caching.Hybrid</code>) combine les deux : un niveau 1 en mémoire locale et un niveau 2 distribué si tu en as configuré un. Sans cache distribué, il fonctionne en mémoire seule, ce qui est parfait pour démarrer.</p>
<pre class="diagram">
 Requête --&gt; [ L1 : mémoire locale ] --hit--&gt; réponse
                   | miss
                   v
             [ L2 : Redis (optionnel) ] --hit--&gt; réponse
                   | miss
                   v
             [ Base SQL ] --&gt; remplit L2 et L1
</pre>
<p>Son gros avantage : la <strong>protection contre la ruée</strong> (en anglais <em>cache stampede</em>). Si 100 requêtes demandent le même produit absent du cache au même moment, <code>IMemoryCache</code> peut lancer 100 requêtes SQL. <code>HybridCache</code> n'en lance qu'une seule et fait attendre les 99 autres. Il gère aussi les <strong>tags</strong> : tu étiquettes des entrées (<code>"products"</code>) et tu les invalides toutes d'un coup avec <code>RemoveByTagAsync</code>.</p>

<h3>Output caching : mettre en cache la réponse HTTP entière</h3>
<p>Les deux caches précédents stockent des <em>données</em>. L'<strong>output caching</strong> stocke la <em>réponse HTTP complète</em> (statut, en-têtes, corps). Ton handler n'est même plus exécuté. On l'active avec <code>AddOutputCache()</code> et <code>UseOutputCache()</code>, puis <code>.CacheOutput()</code> sur un endpoint. Par défaut, il ne met en cache que les GET qui renvoient 200 et ignore les requêtes authentifiées, par sécurité.</p>
<table>
<tr><th>Outil</th><th>Ce qu'il stocke</th><th>Idéal pour</th></tr>
<tr><td><code>IMemoryCache</code></td><td>Un objet, dans la RAM locale</td><td>Une seule instance, données simples</td></tr>
<tr><td><code>HybridCache</code></td><td>Un objet, mémoire + distribué</td><td>Le choix par défaut en .NET 10, plusieurs instances</td></tr>
<tr><td>Output caching</td><td>La réponse HTTP entière</td><td>Endpoints publics en lecture (catalogue)</td></tr>
</table>

<h3>Invalider : le vrai travail</h3>
<p>Un cache qui n'est jamais vidé finit par mentir. Deux stratégies se complètent : une <strong>expiration</strong> (la donnée meurt toute seule après quelques minutes) et une <strong>invalidation explicite</strong> quand tu modifies la donnée (après un <code>PUT /api/products/5</code>, tu supprimes la clé <code>product:5</code> ou le tag <code>products</code>).</p>
<div class="tip">Construis tes clés de façon prévisible et unique : <code>product:{id}</code>, <code>customer:{id}:orders</code>. Et ne mets jamais en cache une donnée propre à un utilisateur sous une clé partagée : un client verrait les commandes d'un autre.</div>
<div class="note">En production, mesure avant de cacher : un cache ajoute de la complexité (données périmées, mémoire consommée, bugs d'invalidation). Commence par les lectures fréquentes et peu changeantes, fixe toujours une expiration, et surveille le taux de hit.</div>`,
  examples: [
    {
      title: "IMemoryCache et GetOrCreate",
      code: `// dotnet add package Microsoft.Extensions.Caching.Memory
using Microsoft.Extensions.Caching.Memory;

var cache = new MemoryCache(new MemoryCacheOptions());
int dbCalls = 0;

for (int i = 1; i <= 3; i++)
{
    string product = GetProduct(1);
    Console.WriteLine($"Appel {i} : {product} (base appelée {dbCalls} fois)");
}

cache.Remove("product:1"); // on invalide après une modification
GetProduct(1);
Console.WriteLine($"Après Remove : base appelée {dbCalls} fois");

string GetProduct(int id) =>
    cache.GetOrCreate($"product:{id}", entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);
        dbCalls++; // simule la requête SQL
        return $"Clavier #{id}";
    })!;`,
      output: `Appel 1 : Clavier #1 (base appelée 1 fois)
Appel 2 : Clavier #1 (base appelée 1 fois)
Appel 3 : Clavier #1 (base appelée 1 fois)
Après Remove : base appelée 2 fois`,
      steps: [
        "<code>new MemoryCache(new MemoryCacheOptions())</code> : dans une API, tu ferais <code>AddMemoryCache()</code> puis tu injecterais <code>IMemoryCache</code>. Ici on le crée à la main pour un exemple console.",
        "<code>cache.GetOrCreate($\"product:{id}\", entry =&gt; …)</code> : au premier appel la clé n'existe pas, donc la fabrique s'exécute ; aux suivants, la valeur est servie depuis la mémoire.",
        "<code>entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5);</code> : l'entrée sera supprimée automatiquement dans 5 minutes.",
        "<code>dbCalls++;</code> : on compte les « requêtes SQL ». Trois appels, une seule lecture en base.",
        "<code>cache.Remove(\"product:1\");</code> : l'invalidation explicite. L'appel suivant relit la base, d'où 2.",
        "<code>})!;</code> : <code>GetOrCreate</code> renvoie un type nullable ; le <code>!</code> dit au compilateur qu'ici la valeur n'est jamais null."
      ]
    },
    {
      title: "HybridCache : une seule requête pour dix appels simultanés",
      code: `// dotnet add package Microsoft.Extensions.Caching.Hybrid
using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddHybridCache(options =>
{
    options.DefaultEntryOptions = new HybridCacheEntryOptions
    {
        Expiration = TimeSpan.FromMinutes(5),          // cache distribué
        LocalCacheExpiration = TimeSpan.FromMinutes(1) // mémoire locale
    };
});
var cache = services.BuildServiceProvider().GetRequiredService<HybridCache>();
int dbCalls = 0;

// 10 requêtes simultanées pour le même produit
var tasks = Enumerable.Range(0, 10).Select(_ => GetProductAsync(1).AsTask());
ProductDto[] results = await Task.WhenAll(tasks);
Console.WriteLine($"{results.Length} réponses, base appelée {dbCalls} fois");
Console.WriteLine($"{results[0].Name} #{results[0].Id}");

await cache.RemoveByTagAsync("products"); // invalide tout le groupe
await GetProductAsync(1);
Console.WriteLine($"Après RemoveByTagAsync : base appelée {dbCalls} fois");

ValueTask<ProductDto> GetProductAsync(int id) =>
    cache.GetOrCreateAsync(
        $"product:{id}",
        async ct =>
        {
            Interlocked.Increment(ref dbCalls);
            await Task.Delay(100, ct); // simule une requête SQL lente
            return new ProductDto(id, "Clavier", 49.90m);
        },
        tags: ["products"]);

record ProductDto(int Id, string Name, decimal Price);`,
      output: `10 réponses, base appelée 1 fois
Clavier #1
Après RemoveByTagAsync : base appelée 2 fois`,
      steps: [
        "<code>services.AddHybridCache(…)</code> : enregistre <code>HybridCache</code> dans l'injection de dépendances. Dans une API, c'est <code>builder.Services.AddHybridCache()</code>.",
        "<code>Expiration</code> / <code>LocalCacheExpiration</code> : deux durées, une pour le niveau distribué, une (plus courte) pour la mémoire locale.",
        "<code>Enumerable.Range(0, 10).Select(…)</code> : on lance 10 lectures en même temps, comme 10 utilisateurs qui ouvrent la même fiche produit.",
        "<code>Interlocked.Increment(ref dbCalls)</code> : un compteur sûr même si plusieurs threads l'incrémentent. Il ne passe qu'à 1 : la protection contre la ruée a fait attendre les 9 autres appels.",
        "<code>tags: [\"products\"]</code> : l'entrée est étiquetée. <code>RemoveByTagAsync(\"products\")</code> invalide toutes les entrées qui portent ce tag.",
        "<code>ValueTask&lt;ProductDto&gt;</code> : <code>GetOrCreateAsync</code> renvoie un <code>ValueTask</code>, plus léger qu'un <code>Task</code> quand la valeur est déjà en cache. <code>.AsTask()</code> le convertit pour <code>Task.WhenAll</code>."
      ],
      explain: "Pour ajouter Redis plus tard, il suffit d'enregistrer AddStackExchangeRedisCache : HybridCache l'utilise automatiquement comme niveau 2, sans changer ton code."
    },
    {
      title: "Output caching sur un endpoint, invalidé par tag",
      code: `// Fichier : Program.cs (projet web, aucun package à ajouter)
using Microsoft.AspNetCore.OutputCaching;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOutputCache(options =>
{
    // Une politique nommée : 60 s, étiquetée "products"
    options.AddPolicy("Products", p => p.Expire(TimeSpan.FromSeconds(60)).Tag("products"));
});

var app = builder.Build();
app.UseOutputCache();

int executions = 0;

app.MapGet("/api/products", () =>
{
    executions++; // compte les vraies exécutions du handler
    return new { executions, items = new[] { "Clavier", "Souris" } };
}).CacheOutput("Products");

app.MapPost("/api/products", async (IOutputCacheStore store, CancellationToken ct) =>
{
    // ... on enregistrerait le produit ici ...
    await store.EvictByTagAsync("products", ct); // vide les réponses en cache
    return Results.Created();
});

app.Run();`,
      output: `GET /api/products
HTTP/1.1 200 OK
{"executions":1,"items":["Clavier","Souris"]}

GET /api/products
HTTP/1.1 200 OK
Age: 0
{"executions":1,"items":["Clavier","Souris"]}

POST /api/products
HTTP/1.1 201 Created

GET /api/products
HTTP/1.1 200 OK
{"executions":2,"items":["Clavier","Souris"]}`,
      steps: [
        "<code>options.AddPolicy(\"Products\", p =&gt; p.Expire(…).Tag(\"products\"))</code> : une politique réutilisable, avec une durée de 60 s et un tag.",
        "<code>app.UseOutputCache();</code> : le middleware qui intercepte les requêtes et répond depuis le cache quand c'est possible.",
        "<code>.CacheOutput(\"Products\")</code> : seul cet endpoint est mis en cache, avec la politique nommée.",
        "Deuxième <code>GET</code> : <code>executions</code> vaut toujours 1 et l'en-tête <code>Age</code> apparaît. Le handler n'a pas tourné, la réponse vient du cache.",
        "<code>store.EvictByTagAsync(\"products\", ct)</code> : après une écriture, on jette toutes les réponses étiquetées. Le GET suivant réexécute le handler (2)."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une expiration glissante",
      prompt: `<p>Reprends l'exemple <code>IMemoryCache</code> et remplace l'expiration absolue par une <code>SlidingExpiration</code> de 2 minutes. Ajoute une clé <code>"categories"</code> qui renvoie le tableau <code>["Clavier", "Souris"]</code> et affiche son nombre d'éléments deux fois en vérifiant que la fabrique ne s'exécute qu'une fois.</p>`,
      hint: `<p><code>entry.SlidingExpiration = TimeSpan.FromMinutes(2);</code>. Utilise un compteur comme <code>dbCalls</code>.</p>`,
      solution: `using Microsoft.Extensions.Caching.Memory;

var cache = new MemoryCache(new MemoryCacheOptions());
int calls = 0;

string[] GetCategories() =>
    cache.GetOrCreate("categories", entry =>
    {
        entry.SlidingExpiration = TimeSpan.FromMinutes(2);
        calls++;
        return new[] { "Clavier", "Souris" };
    })!;

Console.WriteLine(GetCategories().Length); // 2
Console.WriteLine(GetCategories().Length); // 2
Console.WriteLine($"Fabrique appelée {calls} fois"); // 1`
    },
    {
      level: "moyen",
      title: "Invalider un seul produit",
      prompt: `<p>Avec <code>HybridCache</code>, écris <code>GetProductAsync(int id)</code> (clé <code>product:{id}</code>, tag <code>products</code>) et <code>UpdatePriceAsync(int id)</code> qui simule la mise à jour puis appelle <code>RemoveAsync</code> sur la seule clé du produit. Montre que lire le produit 1 après la mise à jour relit la base, mais pas le produit 2.</p>`,
      hint: `<p>Utilise un <code>Dictionary&lt;int, int&gt;</code> pour compter les lectures en base par produit. <code>await cache.RemoveAsync($"product:{id}");</code></p>`,
      solution: `using Microsoft.Extensions.Caching.Hybrid;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddHybridCache();
var cache = services.BuildServiceProvider().GetRequiredService<HybridCache>();
var reads = new Dictionary<int, int> { [1] = 0, [2] = 0 };

await GetProductAsync(1);
await GetProductAsync(2);
await UpdatePriceAsync(1);
await GetProductAsync(1);
await GetProductAsync(2);
Console.WriteLine($"Produit 1 lu {reads[1]} fois, produit 2 lu {reads[2]} fois"); // 2 et 1

ValueTask<string> GetProductAsync(int id) =>
    cache.GetOrCreateAsync($"product:{id}", ct =>
    {
        reads[id]++;
        return ValueTask.FromResult($"Produit {id}");
    }, tags: ["products"]);

async Task UpdatePriceAsync(int id)
{
    // ... UPDATE Products SET Price = ... WHERE Id = id ...
    await cache.RemoveAsync($"product:{id}");
}`
    },
    {
      level: "difficile",
      title: "Varier le cache selon un paramètre",
      prompt: `<p>Dans une API, ajoute <code>GET /api/products?category=…</code> mis en cache 30 secondes. Sans précaution, la réponse de <code>category=clavier</code> pourrait-elle être servie pour <code>category=souris</code> ? Utilise <code>SetVaryByQuery("category")</code> dans la politique pour en être sûr, et renvoie la catégorie et un compteur d'exécutions.</p>`,
      hint: `<p>Dans la politique : <code>p.Expire(TimeSpan.FromSeconds(30)).SetVaryByQuery("category")</code>. Par défaut l'output cache varie déjà sur toute la query string ; le dire explicitement protège contre un changement de politique.</p>`,
      solution: `var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOutputCache(options =>
{
    options.AddPolicy("ByCategory", p => p
        .Expire(TimeSpan.FromSeconds(30))
        .SetVaryByQuery("category")
        .Tag("products"));
});
var app = builder.Build();
app.UseOutputCache();

int executions = 0;
app.MapGet("/api/products", (string? category) =>
{
    executions++;
    return new { category, executions };
}).CacheOutput("ByCategory");

app.Run();
// GET ?category=clavier -> {"category":"clavier","executions":1}
// GET ?category=souris  -> {"category":"souris","executions":2}
// GET ?category=clavier -> {"category":"clavier","executions":1} (depuis le cache)`
    }
  ],
  quiz: [
    {
      q: `Quel est le principal avantage de <code>HybridCache</code> sur <code>IMemoryCache</code> quand 50 requêtes demandent la même clé absente ?`,
      options: ["Il répond avant même que la base soit lue", "Il n'exécute la fabrique qu'une fois et fait attendre les autres", "Il refuse les 49 requêtes en trop"],
      answer: 1,
      why: `C'est la protection contre la ruée (cache stampede) : un seul appel à la source, les autres attendent son résultat. <code>IMemoryCache.GetOrCreate</code> peut lancer la fabrique plusieurs fois en parallèle.`
    },
    {
      q: `Avec l'output caching, que se passe-t-il lors d'un cache hit ?`,
      options: ["Le handler s'exécute mais la base n'est pas lue", "Le handler ne s'exécute pas du tout", "La réponse est renvoyée sans corps"],
      answer: 1,
      why: `L'output caching stocke la réponse HTTP complète : le middleware la renvoie directement, ton code n'est pas appelé. C'est pour ça que le compteur <code>executions</code> ne bouge pas.`
    },
    {
      q: `Tu modifies le prix du produit 5. Que dois-tu faire avec le cache ?`,
      options: ["Rien, l'expiration s'en chargera toujours à temps", "Redémarrer l'API", "Supprimer la clé <code>product:5</code> (ou le tag concerné)"],
      answer: 2,
      why: `Sans invalidation explicite, les clients verraient l'ancien prix jusqu'à l'expiration. L'expiration est un filet de sécurité, pas la stratégie principale après une écriture.`
    },
    {
      q: `Pourquoi l'output caching ignore-t-il par défaut les requêtes authentifiées ?`,
      options: ["Pour ne pas servir à un utilisateur une réponse calculée pour un autre", "Parce que les tokens JWT sont trop longs", "Parce que le cache ne sait pas lire les en-têtes"],
      answer: 0,
      why: `Une réponse authentifiée contient souvent des données personnelles. La partager via un cache commun serait une fuite de données. Ce comportement par défaut est une protection.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow</strong> : ajoute <code>builder.Services.AddHybridCache()</code> et fais passer <code>GET /api/products/{id}</code> par <code>GetOrCreateAsync</code> avec la clé <code>product:{id}</code> et le tag <code>products</code>. Dans <code>PUT</code> et <code>DELETE /api/products/{id}</code>, appelle <code>RemoveAsync</code> sur la clé. Enfin, active l'output caching (60 s, tag <code>products</code>) sur <code>GET /api/products</code> et vide-le avec <code>EvictByTagAsync</code> dans <code>POST</code>, <code>PUT</code> et <code>DELETE</code>.</p>`,
  resources: [
    { label: "Bibliothèque HybridCache (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/performance/caching/hybrid" },
    { label: "Intergiciel de mise en cache de sortie (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/performance/caching/output" }
  ]
});

// =====================================================================
// 6.2 Tâches de fond avec BackgroundService
// =====================================================================
window.COURSE.push({
  key: "prod-background",
  title: "Tâches de fond avec BackgroundService",
  summary: "Tu sauras faire tourner une tâche répétitive dans ton API (nettoyage, relance, synchronisation) avec BackgroundService, sans bloquer les requêtes et en s'arrêtant proprement.",
  objectives: [
    "Comprendre ce qu'est un hosted service et le cycle de vie de l'hôte",
    "Écrire un BackgroundService avec PeriodicTimer",
    "Respecter le CancellationToken pour un arrêt propre",
    "Utiliser un service scoped (comme un DbContext) depuis une tâche de fond"
  ],
  analogy: `<p>Dans un magasin, les caissiers servent les clients (ce sont tes requêtes HTTP). Pendant ce temps, un employé fait le <strong>tour des rayons toutes les heures</strong> pour retirer les produits périmés. Personne ne le lui demande à chaque fois : il travaille en arrière-plan, à son rythme.</p>
<p>À la fermeture, le directeur annonce « on ferme ». L'employé <strong>finit son rayon et range son chariot</strong> au lieu de tout laisser en plan. C'est exactement le rôle du <code>CancellationToken</code>.</p>`,
  lesson: `<h3>Un travail qui ne dépend d'aucune requête</h3>
<p>Certaines tâches n'attendent pas qu'un utilisateur appelle un endpoint : annuler les commandes <code>Pending</code> de plus de 24 heures, relancer les paiements échoués, purger des fichiers temporaires. Il faut du code qui tourne <strong>en boucle, en arrière-plan</strong>, dans le même processus que l'API.</p>
<p>En ASP.NET Core, tout tourne dans un <strong>hôte</strong> (en anglais <em>host</em>) : l'objet qui démarre l'application, gère la configuration, l'injection de dépendances, les logs, et arrête tout proprement. Un <strong>hosted service</strong> est un service que l'hôte démarre au lancement et arrête à la fermeture. <code>BackgroundService</code> est la classe de base qui rend ça simple.</p>

<h3>Écrire un BackgroundService</h3>
<p>Tu hérites de <code>BackgroundService</code> et tu écris une seule méthode : <code>ExecuteAsync(CancellationToken stoppingToken)</code>. L'hôte l'appelle au démarrage. Tu l'enregistres avec <code>builder.Services.AddHostedService&lt;MyWorker&gt;()</code>. C'est tout.</p>
<div class="flow"><span>app.Run()</span><span>StartAsync</span><span>ExecuteAsync tourne</span><span>Ctrl+C / arrêt</span><span>stoppingToken annulé</span></div>
<p>Pour répéter une action à intervalle régulier, utilise <code>PeriodicTimer</code> : <code>await timer.WaitForNextTickAsync(stoppingToken)</code> attend le prochain « tic » sans bloquer de thread. C'est l'équivalent asynchrone d'un <code>setInterval</code>, mais en plus sûr : si un passage dure plus longtemps que l'intervalle, les tics ne s'empilent pas.</p>

<h3>Le CancellationToken : savoir s'arrêter</h3>
<p>Quand l'API s'arrête (déploiement, redémarrage du conteneur, Ctrl+C), l'hôte <strong>annule</strong> le <code>stoppingToken</code>. Ton code doit le transmettre à chaque appel asynchrone (<code>Task.Delay</code>, requêtes EF Core, <code>HttpClient</code>…). Ces appels lèvent alors une <code>OperationCanceledException</code>, ce qui fait sortir la boucle rapidement.</p>
<p>L'hôte n'attend pas éternellement : par défaut 30 secondes en .NET 10 (<code>HostOptions.ShutdownTimeout</code>). Au-delà, le processus est coupé, travail fini ou pas.</p>

<h3>Le piège du DbContext</h3>
<p>Un hosted service est un <strong>singleton</strong> : une seule instance pour toute la vie de l'application. Or ton <code>OrderFlowDbContext</code> est <strong>scoped</strong> : une instance par requête HTTP. Tu ne peux pas l'injecter directement dans le constructeur du worker : le conteneur refuse (« Cannot consume scoped service from singleton »), et ce serait de toute façon un DbContext qui vivrait des semaines.</p>
<pre class="diagram">
 PendingOrdersCleaner (singleton, vit toujours)
   |
   |-- passage 1 : CreateScope() --&gt; DbContext #1 --&gt; Dispose
   |-- passage 2 : CreateScope() --&gt; DbContext #2 --&gt; Dispose
   '-- passage 3 : CreateScope() --&gt; DbContext #3 --&gt; Dispose
</pre>
<p>La solution : injecter <code>IServiceScopeFactory</code>, et à chaque passage créer un <strong>scope</strong> (une « mini-requête »), y récupérer le DbContext, travailler, puis libérer le scope avec <code>using</code>.</p>

<h3>Une exception ne doit pas tout arrêter</h3>
<p>Depuis .NET 6, si <code>ExecuteAsync</code> laisse échapper une exception, l'hôte <strong>arrête toute l'application</strong> (c'est le comportement par défaut de <code>BackgroundServiceExceptionBehavior.StopHost</code>). Une panne SQL passagère ne doit pas tuer ton API : entoure chaque passage d'un <code>try/catch</code>, logue l'erreur et attends le passage suivant.</p>
<div class="tip">Dans un <code>BackgroundService</code>, la règle d'or tient en trois points : un <code>try/catch</code> par passage, un scope par passage, et le <code>stoppingToken</code> transmis partout.</div>
<div class="note">Si ton API tourne sur 3 instances, ton worker tourne 3 fois : trois nettoyages en parallèle. Pour un traitement qui ne doit s'exécuter qu'une fois, écris des requêtes idempotentes (un <code>UPDATE … WHERE Status = 'Pending'</code> se rejoue sans dégâts) ou utilise un planificateur dédié (Hangfire, Quartz.NET, une Azure Function minutée).</div>`,
  examples: [
    {
      title: "Un worker qui tourne à intervalle régulier",
      code: `// dotnet add package Microsoft.Extensions.Hosting
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var builder = Host.CreateApplicationBuilder(args);
builder.Logging.ClearProviders(); // console propre pour la démo
builder.Services.AddHostedService<HeartbeatService>();

await builder.Build().RunAsync(); // bloque jusqu'à l'arrêt de l'hôte
Console.WriteLine("Hôte arrêté proprement");

class HeartbeatService(IHostApplicationLifetime lifetime) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(200));
        int tick = 0;
        try
        {
            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                tick++;
                Console.WriteLine($"Tic {tick}");
                if (tick == 3) lifetime.StopApplication(); // simule un Ctrl+C
            }
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("Arrêt demandé, je range mes affaires");
        }
    }
}`,
      output: `Tic 1
Tic 2
Tic 3
Arrêt demandé, je range mes affaires
Hôte arrêté proprement`,
      steps: [
        "<code>Host.CreateApplicationBuilder(args)</code> : crée un hôte générique sans serveur web. Dans une API, <code>WebApplication.CreateBuilder</code> fait la même chose avec Kestrel en plus.",
        "<code>builder.Services.AddHostedService&lt;HeartbeatService&gt;();</code> : l'hôte démarrera ce service au lancement.",
        "<code>class HeartbeatService(IHostApplicationLifetime lifetime) : BackgroundService</code> : un constructeur primaire reçoit le service qui permet de piloter le cycle de vie.",
        "<code>new PeriodicTimer(TimeSpan.FromMilliseconds(200))</code> : un tic toutes les 200 ms (en vrai, plutôt toutes les minutes ou heures).",
        "<code>lifetime.StopApplication();</code> : demande l'arrêt, exactement comme un Ctrl+C. L'hôte annule alors le <code>stoppingToken</code>.",
        "<code>catch (OperationCanceledException)</code> : <code>WaitForNextTickAsync</code> lève cette exception quand le jeton est annulé. On l'attrape pour terminer proprement.",
        "<code>await builder.Build().RunAsync();</code> : rend la main seulement quand tous les services sont arrêtés, d'où le dernier message."
      ]
    },
    {
      title: "Un scope par passage pour utiliser un service scoped",
      code: `// dotnet add package Microsoft.Extensions.Hosting
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var builder = Host.CreateApplicationBuilder(args);
builder.Logging.ClearProviders();
builder.Services.AddScoped<IOrderRepository, FakeOrderRepository>(); // comme un DbContext
builder.Services.AddHostedService<PendingOrdersCleaner>();
await builder.Build().RunAsync();

class PendingOrdersCleaner(IServiceScopeFactory scopeFactory, IHostApplicationLifetime lifetime)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(100));
        for (int run = 1; run <= 2 && await timer.WaitForNextTickAsync(stoppingToken); run++)
        {
            try
            {
                using var scope = scopeFactory.CreateScope(); // un scope par passage
                var repo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
                int count = await repo.CancelPendingOlderThanAsync(TimeSpan.FromHours(24));
                Console.WriteLine($"Passage {run} : {count} commande(s) annulée(s)");
            }
            catch (Exception ex) // une erreur ne doit pas tuer le service
            {
                Console.WriteLine($"Passage {run} en échec : {ex.Message}");
            }
        }
        lifetime.StopApplication(); // pour terminer la démo
    }
}

interface IOrderRepository { Task<int> CancelPendingOlderThanAsync(TimeSpan age); }

class FakeOrderRepository : IOrderRepository
{
    static int s_pending = 3;
    public FakeOrderRepository() => Console.WriteLine("  (nouveau repository)");
    public Task<int> CancelPendingOlderThanAsync(TimeSpan age)
    {
        int count = s_pending;
        s_pending = 0;
        return Task.FromResult(count);
    }
}`,
      output: `  (nouveau repository)
Passage 1 : 3 commande(s) annulée(s)
  (nouveau repository)
Passage 2 : 0 commande(s) annulée(s)`,
      steps: [
        "<code>AddScoped&lt;IOrderRepository, FakeOrderRepository&gt;()</code> : le repository est scoped, comme un vrai repository EF Core qui reçoit le DbContext.",
        "<code>PendingOrdersCleaner(IServiceScopeFactory scopeFactory, …)</code> : on n'injecte pas le repository, mais la fabrique de scopes, qui est un singleton.",
        "<code>using var scope = scopeFactory.CreateScope();</code> : un scope neuf à chaque passage. Le message « nouveau repository » apparaît deux fois : une instance par passage.",
        "<code>scope.ServiceProvider.GetRequiredService&lt;IOrderRepository&gt;()</code> : on résout le service <em>dans</em> le scope. À la fin du bloc, le scope et ses services sont libérés.",
        "<code>catch (Exception ex)</code> : si un passage échoue, on le note et on continue. Sans ce bloc, l'exception arrêterait toute l'API.",
        "<code>run &lt;= 2 &amp;&amp; await timer.WaitForNextTickAsync(stoppingToken)</code> : la démo s'arrête après deux passages. En vrai, on boucle tant que l'application vit."
      ],
      explain: "La vraie version d'OrderFlow ferait un ExecuteUpdateAsync sur les commandes Pending trop anciennes, avec exactement la même structure."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un worker qui compte jusqu'à 5",
      prompt: `<p>Écris un <code>BackgroundService</code> nommé <code>CounterService</code> qui affiche <code>Compteur : 1</code>… <code>Compteur : 5</code> à 100 ms d'intervalle avec un <code>PeriodicTimer</code>, puis arrête l'application.</p>`,
      hint: `<p>Injecte <code>IHostApplicationLifetime</code> et appelle <code>StopApplication()</code> après la boucle.</p>`,
      solution: `using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var builder = Host.CreateApplicationBuilder(args);
builder.Logging.ClearProviders();
builder.Services.AddHostedService<CounterService>();
await builder.Build().RunAsync();

class CounterService(IHostApplicationLifetime lifetime) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(100));
        for (int i = 1; i <= 5 && await timer.WaitForNextTickAsync(stoppingToken); i++)
        {
            Console.WriteLine($"Compteur : {i}");
        }
        lifetime.StopApplication();
    }
}`
    },
    {
      level: "moyen",
      title: "Survivre à un passage en erreur",
      prompt: `<p>Écris un worker qui fait 4 passages. Le passage 2 lève une <code>InvalidOperationException("Base indisponible")</code>. Fais en sorte que le worker affiche l'erreur et continue avec les passages 3 et 4.</p>`,
      hint: `<p>Mets le <code>try/catch</code> <strong>dans</strong> la boucle, autour du travail d'un passage, pas autour de toute la boucle.</p>`,
      solution: `using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

var builder = Host.CreateApplicationBuilder(args);
builder.Logging.ClearProviders();
builder.Services.AddHostedService<RetryingWorker>();
await builder.Build().RunAsync();

class RetryingWorker(IHostApplicationLifetime lifetime) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(100));
        for (int run = 1; run <= 4 && await timer.WaitForNextTickAsync(stoppingToken); run++)
        {
            try
            {
                if (run == 2) throw new InvalidOperationException("Base indisponible");
                Console.WriteLine($"Passage {run} : OK");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Passage {run} : erreur ({ex.Message}), on continue");
            }
        }
        lifetime.StopApplication();
    }
}`
    },
    {
      level: "difficile",
      title: "Annuler les vieilles commandes avec EF Core",
      prompt: `<p>Écris la méthode <code>ExecuteAsync</code> d'un <code>PendingOrdersCleaner</code> pour OrderFlow : toutes les 10 minutes, crée un scope, récupère <code>OrderFlowDbContext</code>, et passe en <code>Cancelled</code> toutes les commandes <code>Pending</code> dont <code>OrderDate</code> a plus de 24 heures, en une seule requête SQL. Logue le nombre de commandes annulées avec <code>ILogger</code>.</p>`,
      hint: `<p><code>ExecuteUpdateAsync(s =&gt; s.SetProperty(o =&gt; o.Status, OrderStatus.Cancelled), stoppingToken)</code> renvoie le nombre de lignes modifiées. Utilise <code>DateTime.UtcNow.AddHours(-24)</code>.</p>`,
      solution: `class PendingOrdersCleaner(IServiceScopeFactory scopeFactory, ILogger<PendingOrdersCleaner> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(10));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<OrderFlowDbContext>();
                var limit = DateTime.UtcNow.AddHours(-24);

                int count = await db.Orders
                    .Where(o => o.Status == OrderStatus.Pending && o.OrderDate < limit)
                    .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, OrderStatus.Cancelled),
                        stoppingToken);

                logger.LogInformation("{Count} commande(s) Pending annulée(s)", count);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Échec du nettoyage des commandes");
            }
        }
    }
}
// Dans Program.cs : builder.Services.AddHostedService<PendingOrdersCleaner>();`
    }
  ],
  quiz: [
    {
      q: `Quelle méthode dois-tu écrire quand tu hérites de <code>BackgroundService</code> ?`,
      options: ["<code>Main</code>", "<code>RunAsync</code>", "<code>ExecuteAsync</code>"],
      answer: 2,
      why: `<code>ExecuteAsync(CancellationToken)</code> est la seule méthode abstraite : l'hôte l'appelle au démarrage. <code>RunAsync</code> est la méthode de l'hôte, pas du service.`
    },
    {
      q: `Pourquoi ne pas injecter <code>OrderFlowDbContext</code> directement dans le constructeur d'un hosted service ?`,
      options: ["Le hosted service est singleton et le DbContext est scoped", "Un DbContext ne peut pas être utilisé en asynchrone", "Les hosted services n'ont pas accès à l'injection de dépendances"],
      answer: 0,
      why: `Un singleton qui garde un service scoped le ferait vivre toute la vie de l'application : le conteneur l'interdit. On injecte <code>IServiceScopeFactory</code> et on crée un scope par passage.`
    },
    {
      q: `Que se passe-t-il par défaut si une exception sort de <code>ExecuteAsync</code> ?`,
      options: ["Elle est ignorée et le service redémarre", "L'hôte arrête toute l'application", "Seule la requête HTTP en cours échoue"],
      answer: 1,
      why: `Depuis .NET 6, le comportement par défaut est <code>StopHost</code> : l'application entière s'arrête. D'où le <code>try/catch</code> par passage.`
    },
    {
      q: `À quoi sert le <code>stoppingToken</code> ?`,
      options: ["À signaler au worker que l'application s'arrête", "À limiter le nombre de tics par minute", "À authentifier le worker auprès de la base"],
      answer: 0,
      why: `L'hôte l'annule à l'arrêt. En le transmettant à tous tes appels asynchrones, ton worker s'interrompt vite et proprement au lieu d'être coupé brutalement.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow</strong> : crée <code>Workers/PendingOrdersCleaner.cs</code> (exercice difficile) et enregistre-le avec <code>AddHostedService</code>. Lis l'intervalle depuis la configuration (<code>"Cleanup:IntervalMinutes": 10</code> dans <code>appsettings.json</code>) avec <code>IOptions</code>, pour pouvoir le raccourcir à 1 minute en développement.</p>`,
  resources: [
    { label: "Tâches en arrière-plan avec des services hébergés (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/host/hosted-services" }
  ]
});

// =====================================================================
// 6.3 Files de messages
// =====================================================================
window.COURSE.push({
  key: "prod-messaging",
  title: "Files de messages : découpler avec une queue",
  summary: "Tu sauras répondre vite à l'utilisateur en déléguant le travail lent à une file de messages, en mémoire avec Channel puis avec un vrai broker comme RabbitMQ ou Azure Service Bus.",
  objectives: [
    "Comprendre le modèle producteur / file / consommateur",
    "Utiliser System.Threading.Channels pour une file en mémoire",
    "Brancher un Channel entre un endpoint et un BackgroundService",
    "Savoir quand passer à RabbitMQ ou Azure Service Bus et ce que ça change"
  ],
  analogy: `<p>Dans une boulangerie, la vendeuse prend ta commande de gâteau d'anniversaire, te donne un <strong>ticket</strong> et sert déjà le client suivant. Le ticket part sur une <strong>pique à tickets</strong> en cuisine, où le pâtissier les prend un par un, à son rythme.</p>
<p>La vendeuse n'attend pas que le gâteau soit fait. Si le pâtissier est débordé, les tickets s'accumulent sur la pique, mais personne n'est perdu. La pique, c'est la <strong>file de messages</strong>.</p>`,
  lesson: `<h3>Le problème : tout faire pendant la requête</h3>
<p>Quand un client passe une commande dans OrderFlow, il faut l'enregistrer, mais aussi envoyer un e-mail de confirmation, prévenir l'entrepôt, mettre à jour des statistiques. Si tout ça se fait dans le handler <code>POST /api/orders</code>, l'utilisateur attend plusieurs secondes. Pire : si le serveur d'e-mails est en panne, la commande échoue alors qu'elle était valide.</p>
<p>L'idée : n'effectuer pendant la requête que l'essentiel (enregistrer la commande), puis <strong>déposer un message</strong> « commande 42 passée » dans une file. Un autre composant lira ce message plus tard et fera le reste. On dit que les deux parties sont <strong>découplées</strong> : elles ne se connaissent pas et ne travaillent pas au même rythme.</p>
<div class="flow"><span>POST /api/orders</span><span>Producteur : dépose OrderPlaced</span><span>File</span><span>Consommateur : envoie l'e-mail</span></div>

<h3>Le vocabulaire</h3>
<p>Le <strong>producteur</strong> écrit des messages. Le <strong>consommateur</strong> les lit et les traite. La <strong>file</strong> (en anglais <em>queue</em>) les garde entre les deux, dans l'ordre d'arrivée. Un <strong>message</strong> est un petit objet de données, souvent un <code>record</code> immuable qui décrit un fait passé : <code>OrderPlaced</code>, <code>PaymentFailed</code>.</p>
<p>Côté HTTP, la bonne réponse n'est plus <code>201 Created</code> pour un traitement qui continue en arrière-plan, mais souvent <code>202 Accepted</code> : « j'ai bien reçu, c'est en cours ».</p>

<h3>System.Threading.Channels : une file en mémoire</h3>
<p>.NET fournit une file asynchrone toute prête : <code>Channel&lt;T&gt;</code>. Elle a deux côtés : <code>channel.Writer</code> pour écrire (<code>WriteAsync</code>, <code>TryWrite</code>, <code>Complete</code>) et <code>channel.Reader</code> pour lire (<code>ReadAsync</code>, <code>ReadAllAsync</code>). Si tu connais RxJS, imagine un <code>Subject</code> où chaque valeur n'est consommée qu'une fois et où le lecteur attend s'il n'y a rien.</p>
<div class="compare"><div><h4>CreateUnbounded</h4><p>Pas de limite. Simple, mais si le consommateur est trop lent, la mémoire grossit sans fin.</p></div><div><h4>CreateBounded(100)</h4><p>Taille maximale. Quand la file est pleine, <code>WriteAsync</code> attend une place : c'est la <strong>contre-pression</strong> (en anglais <em>backpressure</em>).</p></div></div>
<p>Dans une API, le schéma classique : le <code>Channel</code> est enregistré en <strong>singleton</strong>, l'endpoint écrit dedans, et un <code>BackgroundService</code> (leçon précédente) lit en boucle avec <code>await foreach (var msg in reader.ReadAllAsync(stoppingToken))</code>.</p>

<h3>La limite d'une file en mémoire</h3>
<p>Un <code>Channel</code> vit dans la RAM de ton processus. Si l'API redémarre, <strong>les messages en attente sont perdus</strong>. Et si tu as 3 instances de l'API, chacune a sa propre file. Pour des tâches non critiques (un log, un recalcul de statistiques), c'est acceptable. Pour un e-mail de confirmation ou un paiement, il faut un <strong>broker</strong> de messages.</p>

<h3>Un vrai broker : RabbitMQ, Azure Service Bus</h3>
<p>Un <strong>broker</strong> est un serveur dédié aux messages. RabbitMQ (open source, souvent en Docker) et Azure Service Bus (service managé dans Azure) sont les plus courants dans le monde .NET. Le principe reste le même (producteur, file, consommateur), mais le broker apporte :</p>
<table>
<tr><th>Garantie</th><th>Ce que ça veut dire</th></tr>
<tr><td>Persistance</td><td>Les messages sont écrits sur disque : un redémarrage ne les perd pas.</td></tr>
<tr><td>Acquittement (<em>ack</em>)</td><td>Le consommateur confirme quand il a fini. S'il plante avant, le message est redonné à un autre.</td></tr>
<tr><td>Dead-letter queue</td><td>Après N échecs, le message part dans une file « poubelle » à inspecter, au lieu de boucler.</td></tr>
<tr><td>Plusieurs consommateurs</td><td>Tes 3 instances se partagent le travail d'une même file.</td></tr>
</table>
<p>Dans le code, tu utiliserais le client du broker (<code>RabbitMQ.Client</code>, <code>Azure.Messaging.ServiceBus</code>) ou une bibliothèque qui les enveloppe, comme MassTransit ou Wolverine. On ne le fait pas tourner ici car il faut un serveur, mais tout ce que tu apprends avec <code>Channel</code> se transpose.</p>
<div class="tip">Un broker livre « au moins une fois » : le même message peut arriver deux fois (le consommateur a fini mais n'a pas eu le temps d'acquitter). Ton traitement doit être <strong>idempotent</strong> : traiter deux fois <code>OrderPlaced(42)</code> ne doit pas envoyer deux e-mails. Garde par exemple la liste des messages déjà traités.</div>
<div class="note">Piège classique : enregistrer la commande en base puis publier le message. Si l'API plante entre les deux, la commande existe mais personne n'est prévenu. Le pattern <strong>Outbox</strong> règle ça : on écrit le message dans une table <code>OutboxMessages</code> dans la même transaction que la commande, et un worker le publie ensuite vers le broker.</div>`,
  examples: [
    {
      title: "Un producteur et un consommateur avec Channel",
      code: `using System.Threading.Channels;

// Une file en mémoire, sans limite de taille
Channel<string> channel = Channel.CreateUnbounded<string>();

// Le producteur dépose des messages et s'en va
for (int i = 1; i <= 3; i++)
{
    await channel.Writer.WriteAsync($"commande {i}");
}
channel.Writer.Complete(); // « il n'y aura plus rien »
Console.WriteLine($"Producteur : 3 messages déposés, {channel.Reader.Count} en attente");

// Le consommateur lit jusqu'à ce que la file soit vide ET fermée
await foreach (string message in channel.Reader.ReadAllAsync())
{
    Console.WriteLine($"Consommateur : je traite {message}");
}
Console.WriteLine("Consommateur : file terminée");`,
      output: `Producteur : 3 messages déposés, 3 en attente
Consommateur : je traite commande 1
Consommateur : je traite commande 2
Consommateur : je traite commande 3
Consommateur : file terminée`,
      steps: [
        "<code>Channel.CreateUnbounded&lt;string&gt;()</code> : crée une file de chaînes sans limite de taille.",
        "<code>await channel.Writer.WriteAsync(…)</code> : le producteur dépose un message. Il ne sait pas qui le lira, ni quand.",
        "<code>channel.Writer.Complete();</code> : on signale qu'aucun message ne viendra plus. Sans ça, le consommateur attendrait indéfiniment.",
        "<code>channel.Reader.Count</code> : trois messages patientent dans la file.",
        "<code>await foreach (… in channel.Reader.ReadAllAsync())</code> : lit les messages dans l'ordre d'arrivée et s'arrête quand la file est vide <em>et</em> complétée."
      ]
    },
    {
      title: "File bornée et contre-pression",
      code: `using System.Threading.Channels;

// File bornée : 2 messages maximum
var channel = Channel.CreateBounded<int>(new BoundedChannelOptions(2)
{
    FullMode = BoundedChannelFullMode.Wait, // le producteur attend s'il n'y a plus de place
    SingleReader = true
});

Console.WriteLine($"Dépôt 1 : {channel.Writer.TryWrite(1)}");
Console.WriteLine($"Dépôt 2 : {channel.Writer.TryWrite(2)}");
Console.WriteLine($"Dépôt 3 : {channel.Writer.TryWrite(3)} (file pleine)");

// WriteAsync attend qu'une place se libère
ValueTask pending = channel.Writer.WriteAsync(3);
Console.WriteLine($"Écriture terminée ? {pending.IsCompleted}");

int first = await channel.Reader.ReadAsync(); // le consommateur libère une place
await pending;
Console.WriteLine($"Lu : {first}, la commande 3 est maintenant dans la file");
Console.WriteLine($"En attente : {channel.Reader.Count}");`,
      output: `Dépôt 1 : True
Dépôt 2 : True
Dépôt 3 : False (file pleine)
Écriture terminée ? False
Lu : 1, la commande 3 est maintenant dans la file
En attente : 2`,
      steps: [
        "<code>new BoundedChannelOptions(2)</code> : la file ne peut contenir que 2 messages.",
        "<code>FullMode = BoundedChannelFullMode.Wait</code> : quand elle est pleine, l'écriture asynchrone attend. Les autres modes jettent le plus ancien ou le plus récent message.",
        "<code>SingleReader = true</code> : on promet qu'un seul consommateur lira, ce qui permet à .NET d'optimiser.",
        "<code>TryWrite(3)</code> : écriture immédiate ou rien. La file est pleine, donc <code>False</code>.",
        "<code>channel.Writer.WriteAsync(3)</code> : cette fois l'écriture est en attente (<code>IsCompleted</code> vaut <code>False</code>). C'est la contre-pression : le producteur ralentit au rythme du consommateur.",
        "<code>await channel.Reader.ReadAsync()</code> : lire le message 1 libère une place, l'écriture en attente se termine."
      ]
    },
    {
      title: "Endpoint producteur, BackgroundService consommateur",
      code: `// Fichier : Program.cs (projet web)
using System.Threading.Channels;

var builder = WebApplication.CreateBuilder(args);
// Une seule file pour toute l'application : singleton
builder.Services.AddSingleton(Channel.CreateBounded<OrderPlaced>(100));
builder.Services.AddHostedService<OrderEmailWorker>();
var app = builder.Build();

app.MapPost("/api/orders", async (CreateOrder dto, Channel<OrderPlaced> channel, CancellationToken ct) =>
{
    int orderId = 42; // ... la commande serait enregistrée en base ici ...
    await channel.Writer.WriteAsync(new OrderPlaced(orderId, dto.Email), ct);
    // On répond tout de suite, l'e-mail partira en arrière-plan
    return Results.Accepted($"/api/orders/{orderId}", new { orderId, status = "Pending" });
});

app.Run();

class OrderEmailWorker(Channel<OrderPlaced> channel, ILogger<OrderEmailWorker> logger)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var evt in channel.Reader.ReadAllAsync(stoppingToken))
        {
            await Task.Delay(500, stoppingToken); // simule l'envoi d'un e-mail
            logger.LogInformation("E-mail envoyé à {Email} pour la commande {OrderId}",
                evt.Email, evt.OrderId);
        }
    }
}

record CreateOrder(string Email);
record OrderPlaced(int OrderId, string Email);`,
      output: `POST /api/orders  {"email":"alice@example.com"}
HTTP/1.1 202 Accepted
Location: /api/orders/42
{"orderId":42,"status":"Pending"}

(console de l'API, une demi-seconde plus tard)
info: OrderEmailWorker[0]
      E-mail envoyé à alice@example.com pour la commande 42`,
      steps: [
        "<code>AddSingleton(Channel.CreateBounded&lt;OrderPlaced&gt;(100))</code> : la même file est partagée par l'endpoint et le worker. Bornée à 100 pour ne pas exploser la mémoire.",
        "<code>Channel&lt;OrderPlaced&gt; channel</code> dans les paramètres du handler : injecté par la DI, comme un service.",
        "<code>await channel.Writer.WriteAsync(new OrderPlaced(…), ct);</code> : le handler dépose le message en quelques microsecondes.",
        "<code>Results.Accepted(…)</code> : réponse <code>202</code> avec l'en-tête <code>Location</code> où le client pourra suivre la commande.",
        "<code>await foreach (var evt in channel.Reader.ReadAllAsync(stoppingToken))</code> : le worker attend les messages tant que l'application tourne. Sa boucle se termine quand le jeton est annulé.",
        "<code>logger.LogInformation(…)</code> : le message de log apparaît après la réponse HTTP, preuve que le travail est bien découplé."
      ],
      explain: "Si tu remplaces Channel par Azure Service Bus, l'endpoint appellerait ServiceBusSender.SendMessageAsync et le worker un ServiceBusProcessor : la structure du code ne change presque pas."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Producteur et consommateur en parallèle",
      prompt: `<p>Crée un <code>Channel&lt;int&gt;</code> non borné. Lance un consommateur avec <code>Task.Run</code> qui additionne tous les nombres reçus. Le producteur écrit les nombres de 1 à 10 puis complète la file. Affiche la somme (55) après <code>await</code> du consommateur.</p>`,
      hint: `<p>Le consommateur peut renvoyer un <code>Task&lt;int&gt;</code> : <code>Task.Run(async () =&gt; { int sum = 0; await foreach (…) sum += n; return sum; })</code>.</p>`,
      solution: `using System.Threading.Channels;

var channel = Channel.CreateUnbounded<int>();

Task<int> consumer = Task.Run(async () =>
{
    int sum = 0;
    await foreach (int n in channel.Reader.ReadAllAsync())
        sum += n;
    return sum;
});

for (int i = 1; i <= 10; i++)
    await channel.Writer.WriteAsync(i);
channel.Writer.Complete();

Console.WriteLine($"Somme : {await consumer}"); // Somme : 55`
    },
    {
      level: "moyen",
      title: "Deux consommateurs se partagent le travail",
      prompt: `<p>Crée une file de 6 messages <code>"tâche 1"</code> à <code>"tâche 6"</code>. Lance <strong>deux</strong> consommateurs (A et B) qui lisent la même file. Chacun compte combien de messages il a traités. Vérifie que le total vaut 6 : chaque message n'est lu qu'une seule fois.</p>`,
      hint: `<p>Écris une fonction locale <code>async Task&lt;int&gt; Consume(string name)</code> et lance-la deux fois avant d'écrire les messages. L'ordre des affichages peut varier : c'est normal.</p>`,
      solution: `using System.Threading.Channels;

var channel = Channel.CreateUnbounded<string>();

Task<int> a = Consume("A");
Task<int> b = Consume("B");

for (int i = 1; i <= 6; i++)
    await channel.Writer.WriteAsync($"tâche {i}");
channel.Writer.Complete();

int[] counts = await Task.WhenAll(a, b);
Console.WriteLine($"Total traité : {counts.Sum()}"); // 6

async Task<int> Consume(string name)
{
    int count = 0;
    await foreach (string msg in channel.Reader.ReadAllAsync())
    {
        await Task.Delay(10); // simule un traitement
        count++;
    }
    Console.WriteLine($"{name} a traité {count} message(s)");
    return count;
}`
    },
    {
      level: "difficile",
      title: "Un consommateur idempotent",
      prompt: `<p>Simule un broker qui livre « au moins une fois » : écris dans un <code>Channel&lt;OrderPlaced&gt;</code> les messages 1, 2, 2, 3 (le 2 est livré deux fois). Écris un consommateur qui n'envoie qu'un e-mail par commande en gardant un <code>HashSet&lt;int&gt;</code> des commandes déjà traitées, et qui affiche <code>doublon ignoré</code> pour le second 2.</p>`,
      hint: `<p><code>HashSet.Add</code> renvoie <code>false</code> si l'élément est déjà présent : c'est le test parfait. En production, ce « déjà traité » serait stocké en base, pas en mémoire.</p>`,
      solution: `using System.Threading.Channels;

var channel = Channel.CreateUnbounded<OrderPlaced>();
foreach (int id in new[] { 1, 2, 2, 3 })
    await channel.Writer.WriteAsync(new OrderPlaced(id));
channel.Writer.Complete();

var processed = new HashSet<int>();
await foreach (var evt in channel.Reader.ReadAllAsync())
{
    if (!processed.Add(evt.OrderId))
    {
        Console.WriteLine($"Commande {evt.OrderId} : doublon ignoré");
        continue;
    }
    Console.WriteLine($"Commande {evt.OrderId} : e-mail envoyé");
}

record OrderPlaced(int OrderId);
// Commande 1 : e-mail envoyé
// Commande 2 : e-mail envoyé
// Commande 2 : doublon ignoré
// Commande 3 : e-mail envoyé`
    }
  ],
  quiz: [
    {
      q: `Que fait <code>channel.Writer.Complete()</code> ?`,
      options: ["Il vide la file", "Il signale qu'aucun nouveau message n'arrivera", "Il attend que tous les messages soient traités"],
      answer: 1,
      why: `<code>Complete</code> ferme le côté écriture. Le consommateur lit encore les messages restants, puis <code>ReadAllAsync</code> se termine. Il ne vide rien et n'attend rien.`
    },
    {
      q: `Quel est le principal risque d'un <code>Channel</code> en mémoire pour envoyer les e-mails de confirmation ?`,
      options: ["Les messages en attente sont perdus si l'API redémarre", "Il ne peut contenir que des chaînes", "Il est plus lent qu'un broker"],
      answer: 0,
      why: `La file vit dans la RAM du processus. Un redémarrage ou un crash efface les messages non traités. Un broker persiste les messages sur disque.`
    },
    {
      q: `Quel code de statut HTTP convient pour « commande reçue, traitement en cours en arrière-plan » ?`,
      options: ["<code>200 OK</code>", "<code>204 No Content</code>", "<code>202 Accepted</code>"],
      answer: 2,
      why: `<code>202 Accepted</code> signifie que la demande est acceptée mais pas encore terminée. On ajoute souvent un en-tête <code>Location</code> pour suivre l'avancement.`
    },
    {
      q: `Pourquoi un consommateur branché sur RabbitMQ ou Service Bus doit-il être idempotent ?`,
      options: ["Parce que les messages arrivent dans le désordre", "Parce qu'un même message peut être livré plus d'une fois", "Parce que le broker supprime les messages après lecture"],
      answer: 1,
      why: `La garantie habituelle est « au moins une fois » : si l'acquittement se perd, le message est relivré. Traiter deux fois ne doit pas avoir d'effet en double.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow</strong> : crée le record <code>OrderPlaced(int OrderId, string CustomerEmail)</code>, enregistre un <code>Channel&lt;OrderPlaced&gt;</code> borné (capacité 500) en singleton, et fais écrire <code>POST /api/orders</code> dedans juste après le <code>SaveChangesAsync</code>. Ajoute un <code>OrderConfirmationWorker</code> qui lit la file et logue l'envoi de l'e-mail. Note dans un commentaire <code>// TODO</code> l'endroit où un broker et une table Outbox remplaceraient le Channel.</p>`,
  resources: [
    { label: "System.Threading.Channels (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/channels" },
    { label: "Qu'est-ce qu'Azure Service Bus ? (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/azure/service-bus-messaging/service-bus-messaging-overview" }
  ]
});

// =====================================================================
// 6.4 Résilience
// =====================================================================
window.COURSE.push({
  key: "prod-resilience",
  title: "Résilience : retry, timeout et circuit breaker",
  summary: "Tu sauras protéger ton API contre les pannes passagères des services qu'elle appelle, avec des retries, des timeouts et un circuit breaker configurés en quelques lignes.",
  objectives: [
    "Distinguer une panne passagère d'une panne durable",
    "Configurer un retry avec backoff exponentiel et jitter",
    "Comprendre les trois états d'un circuit breaker",
    "Ajouter AddStandardResilienceHandler à un HttpClient typé"
  ],
  analogy: `<p>Tu appelles un ami et ça sonne occupé. Tu ne raccroches pas définitivement : tu <strong>réessaies</strong> dans une minute, puis dans cinq (retry avec attente croissante). Si ça ne répond pas au bout de 30 secondes, tu <strong>raccroches</strong> au lieu d'attendre la nuit entière (timeout).</p>
<p>Et si ton ami t'a dit « je suis en avion toute la journée », tu arrêtes d'appeler pendant quelques heures : inutile de t'épuiser, et inutile de saturer sa messagerie. C'est le <strong>disjoncteur</strong> (circuit breaker).</p>`,
  lesson: `<h3>Les appels réseau échouent, c'est normal</h3>
<p>OrderFlow appelle des services externes : un service de taux de change, une passerelle de paiement, un transporteur. Sur un réseau, des erreurs <strong>passagères</strong> (en anglais <em>transient</em>) arrivent tout le temps : un serveur redémarre, une connexion est coupée, un service répond <code>503</code> pendant deux secondes. La <strong>résilience</strong>, c'est la capacité de ton API à encaisser ces incidents sans tomber en panne elle-même.</p>
<p>.NET 10 fournit tout ce qu'il faut avec le package <code>Microsoft.Extensions.Http.Resilience</code>. Il s'appuie sur <strong>Polly</strong>, la bibliothèque de référence, dont la partie de base s'appelle <code>Polly.Core</code>.</p>

<h3>Retry : réessayer intelligemment</h3>
<p>Un <strong>retry</strong> relance l'appel après un échec. Mais pas n'importe comment. On ne réessaie que les erreurs passagères : <code>408</code>, <code>429</code>, les <code>5xx</code>, les erreurs réseau. Un <code>400 Bad Request</code> échouera toujours : le réessayer ne sert à rien.</p>
<p>On attend entre deux essais, de plus en plus longtemps : c'est le <strong>backoff exponentiel</strong> (100 ms, 200 ms, 400 ms…). On ajoute un peu de hasard, le <strong>jitter</strong>, pour que mille clients ne réessaient pas tous à la même milliseconde et n'écrasent pas le service qui se relève.</p>
<div class="flow"><span>Essai 1 : 503</span><span>attente 100 ms</span><span>Essai 2 : 503</span><span>attente 200 ms</span><span>Essai 3 : 200 OK</span></div>
<div class="tip">On ne réessaie sans risque que les opérations <strong>idempotentes</strong> (GET, PUT, DELETE). Réessayer un <code>POST /payments</code> peut débiter le client deux fois. Pour ces appels, on désactive le retry ou on envoie une clé d'idempotence que le service sait reconnaître.</div>

<h3>Timeout : ne pas attendre indéfiniment</h3>
<p>Un service qui ne répond pas est pire qu'un service qui répond « erreur » : chaque requête en attente occupe de la mémoire et une connexion. Un <strong>timeout</strong> coupe l'appel après un délai. Le gestionnaire standard en pose deux : un par tentative (10 s par défaut) et un global pour toutes les tentatives réunies (30 s par défaut).</p>

<h3>Circuit breaker : arrêter de frapper un service à terre</h3>
<p>Si le service de paiement est en panne pour 10 minutes, réessayer chaque requête trois fois triple la charge sur un service déjà malade, et fait attendre tous tes utilisateurs. Le <strong>circuit breaker</strong> (disjoncteur) observe les échecs. Au-delà d'un seuil, il <strong>s'ouvre</strong> : les appels suivants échouent immédiatement, sans même toucher le réseau.</p>
<pre class="diagram">
          trop d'échecs
 FERMÉ ----------------------&gt; OUVERT
 (appels normaux)              (tout est refusé,
   ^                            BrokenCircuitException)
   |                                |
   | appel test réussi              | après BreakDuration
   |                                v
   +-------------------------- SEMI-OUVERT
        (échec : retour à OUVERT)  (un appel test passe)
</pre>
<p>Les réglages : <code>FailureRatio</code> (proportion d'échecs, ex. 0,5), <code>MinimumThroughput</code> (nombre minimal d'appels avant de juger), <code>SamplingDuration</code> (fenêtre d'observation) et <code>BreakDuration</code> (durée de coupure).</p>

<h3>Tout ensemble : AddStandardResilienceHandler</h3>
<p>Tu as vu les <code>HttpClient</code> typés dans la partie 4. Sur un client typé, une seule ligne ajoute un pipeline complet et bien réglé :</p>
<table>
<tr><th>Ordre</th><th>Stratégie</th><th>Réglage par défaut</th></tr>
<tr><td>1</td><td>Limiteur de débit</td><td>1 000 requêtes simultanées</td></tr>
<tr><td>2</td><td>Timeout total</td><td>30 s</td></tr>
<tr><td>3</td><td>Retry</td><td>3 essais, exponentiel avec jitter, 2 s de base</td></tr>
<tr><td>4</td><td>Circuit breaker</td><td>10 % d'échecs sur 30 s, coupure de 5 s</td></tr>
<tr><td>5</td><td>Timeout par tentative</td><td>10 s</td></tr>
</table>
<p>C'est l'équivalent côté serveur d'un intercepteur Angular qui ferait <code>retry</code> et <code>timeout</code> avec RxJS, mais déjà écrit et testé. Tu personnalises avec une lambda : <code>.AddStandardResilienceHandler(o =&gt; o.Retry.MaxRetryAttempts = 5)</code>. Pour un pipeline entièrement sur mesure, il existe <code>AddResilienceHandler("nom", builder =&gt; …)</code>.</p>
<div class="note">La résilience ne remplace pas une réponse claire. Quand tout a échoué (circuit ouvert, timeout), attrape l'exception dans ton endpoint et renvoie un <code>503 Service Unavailable</code> en ProblemDetails, ou une valeur de repli (par exemple le dernier taux de change connu, depuis le cache). Et surveille les retries dans tes métriques : beaucoup de retries, c'est un service malade.</div>`,
  examples: [
    {
      title: "Un retry avec backoff exponentiel (Polly.Core)",
      code: `// dotnet add package Polly.Core
using Polly;
using Polly.Retry;

var pipeline = new ResiliencePipelineBuilder()
    .AddRetry(new RetryStrategyOptions
    {
        MaxRetryAttempts = 3,
        Delay = TimeSpan.FromMilliseconds(100),
        BackoffType = DelayBackoffType.Exponential, // 100 ms, 200 ms, 400 ms
        UseJitter = false, // true en prod ; false ici pour des délais prévisibles
        ShouldHandle = new PredicateBuilder().Handle<HttpRequestException>(),
        OnRetry = args =>
        {
            Console.WriteLine($"  -> nouvel essai dans {args.RetryDelay.TotalMilliseconds} ms");
            return default;
        }
    })
    .Build();

int attempt = 0;
string rate = await pipeline.ExecuteAsync(async ct =>
{
    attempt++;
    Console.WriteLine($"Tentative {attempt}");
    await Task.Delay(10, ct); // simule l'appel réseau
    if (attempt < 3) throw new HttpRequestException("503 Service Unavailable");
    return "1 EUR = 1.08 USD";
});
Console.WriteLine($"Résultat : {rate}");`,
      output: `Tentative 1
  -> nouvel essai dans 100 ms
Tentative 2
  -> nouvel essai dans 200 ms
Tentative 3
Résultat : 1 EUR = 1.08 USD`,
      steps: [
        "<code>new ResiliencePipelineBuilder()</code> : on construit un <strong>pipeline</strong>, une suite de stratégies qui enveloppent ton code.",
        "<code>MaxRetryAttempts = 3</code> : jusqu'à 3 nouvelles tentatives après le premier essai, donc 4 appels maximum.",
        "<code>BackoffType = DelayBackoffType.Exponential</code> : le délai double à chaque fois à partir de <code>Delay</code>.",
        "<code>ShouldHandle = new PredicateBuilder().Handle&lt;HttpRequestException&gt;()</code> : on ne réessaie que ce type d'erreur. Une autre exception remonte tout de suite.",
        "<code>OnRetry = args =&gt; …</code> : appelé avant chaque nouvelle tentative ; idéal pour loguer. <code>return default;</code> renvoie un <code>ValueTask</code> déjà terminé.",
        "<code>pipeline.ExecuteAsync(async ct =&gt; …)</code> : le code protégé. Les deux premiers essais échouent, le troisième réussit : l'appelant ne voit que le résultat."
      ]
    },
    {
      title: "Un circuit breaker qui s'ouvre et se referme",
      code: `// dotnet add package Polly.Core
using Polly;
using Polly.CircuitBreaker;

var pipeline = new ResiliencePipelineBuilder()
    .AddCircuitBreaker(new CircuitBreakerStrategyOptions
    {
        FailureRatio = 0.5,                          // 50 % d'échecs...
        MinimumThroughput = 3,                       // ...sur au moins 3 appels...
        SamplingDuration = TimeSpan.FromSeconds(10), // ...dans les 10 dernières secondes
        BreakDuration = TimeSpan.FromSeconds(1),     // on coupe pendant 1 s
        OnOpened = _ => { Console.WriteLine("  >> disjoncteur OUVERT"); return default; },
        OnHalfOpened = _ => { Console.WriteLine("  >> disjoncteur SEMI-OUVERT"); return default; },
        OnClosed = _ => { Console.WriteLine("  >> disjoncteur FERMÉ"); return default; }
    })
    .Build();

for (int i = 1; i <= 5; i++)
{
    try
    {
        await pipeline.ExecuteAsync(_ => throw new HttpRequestException("service en panne"));
    }
    catch (BrokenCircuitException)
    {
        Console.WriteLine($"Appel {i} : refusé immédiatement, le service n'est pas appelé");
    }
    catch (HttpRequestException)
    {
        Console.WriteLine($"Appel {i} : échec du service");
    }
}

await Task.Delay(TimeSpan.FromSeconds(1.2)); // on attend la fin de la coupure
await pipeline.ExecuteAsync(_ => { Console.WriteLine("Appel test : succès"); return default; });`,
      output: `Appel 1 : échec du service
Appel 2 : échec du service
  >> disjoncteur OUVERT
Appel 3 : échec du service
Appel 4 : refusé immédiatement, le service n'est pas appelé
Appel 5 : refusé immédiatement, le service n'est pas appelé
  >> disjoncteur SEMI-OUVERT
Appel test : succès
  >> disjoncteur FERMÉ`,
      steps: [
        "<code>FailureRatio = 0.5</code> et <code>MinimumThroughput = 3</code> : le disjoncteur ne juge qu'à partir de 3 appels, et s'ouvre si au moins la moitié a échoué.",
        "Appels 1 et 2 : deux échecs, mais pas encore 3 appels observés. Le disjoncteur reste fermé.",
        "Appel 3 : troisième échec, le seuil est atteint. Le disjoncteur s'ouvre (le message <code>OUVERT</code> s'affiche pendant le traitement de cet échec), puis l'exception de l'appel 3 remonte normalement.",
        "Appels 4 et 5 : <code>BrokenCircuitException</code>. Le code protégé n'est même pas exécuté : réponse instantanée, zéro charge sur le service.",
        "<code>await Task.Delay(TimeSpan.FromSeconds(1.2));</code> : après <code>BreakDuration</code>, le prochain appel passe en <strong>semi-ouvert</strong> pour tester le service.",
        "<code>Appel test : succès</code> : le test réussit, le disjoncteur se <strong>referme</strong> et le trafic normal reprend."
      ]
    },
    {
      title: "AddStandardResilienceHandler sur un HttpClient typé",
      code: `// dotnet add package Microsoft.Extensions.Http.Resilience
using System.Net;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddHttpClient<ExchangeRateClient>(c => c.BaseAddress = new Uri("https://rates.example"))
    .ConfigurePrimaryHttpMessageHandler(() => new FlakyHandler()) // faux service instable
    .AddStandardResilienceHandler(options =>
    {
        options.Retry.MaxRetryAttempts = 3;
        options.Retry.Delay = TimeSpan.FromMilliseconds(50); // 2 s par défaut
    });

var client = services.BuildServiceProvider().GetRequiredService<ExchangeRateClient>();
Console.WriteLine($"Taux USD : {await client.GetRateAsync("USD")}");

class ExchangeRateClient(HttpClient http)
{
    public Task<string> GetRateAsync(string currency) => http.GetStringAsync($"/rates/{currency}");
}

// Répond 503 deux fois, puis 200
class FlakyHandler : HttpMessageHandler
{
    private int _calls;

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        _calls++;
        var status = _calls < 3 ? HttpStatusCode.ServiceUnavailable : HttpStatusCode.OK;
        Console.WriteLine($"Appel HTTP n°{_calls} : {(int)status}");
        return Task.FromResult(new HttpResponseMessage(status) { Content = new StringContent("1.08") });
    }
}`,
      output: `Appel HTTP n°1 : 503
Appel HTTP n°2 : 503
Appel HTTP n°3 : 200
Taux USD : 1.08`,
      steps: [
        "<code>services.AddHttpClient&lt;ExchangeRateClient&gt;(…)</code> : un client typé, comme dans une API. Dans <code>Program.cs</code>, ce serait <code>builder.Services.AddHttpClient…</code>.",
        "<code>.ConfigurePrimaryHttpMessageHandler(() =&gt; new FlakyHandler())</code> : pour la démo, on remplace le vrai réseau par un faux handler qui répond 503 deux fois. Ne le fais pas en production.",
        "<code>.AddStandardResilienceHandler(options =&gt; …)</code> : ajoute tout le pipeline (timeouts, retry, circuit breaker). On raccourcit juste le délai de retry pour la démo.",
        "<code>http.GetStringAsync(…)</code> : le code du client ne sait rien de la résilience. Les deux 503 sont absorbés par le pipeline.",
        "<code>Appel HTTP n°3 : 200</code> : la troisième tentative réussit, l'appelant reçoit <code>1.08</code> comme si de rien n'était."
      ],
      explain: "Une ligne dans Program.cs, et tous les appels du client typé sont protégés. Le code métier reste propre."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un timeout",
      prompt: `<p>Avec <code>Polly.Core</code>, crée un pipeline avec <code>.AddTimeout(TimeSpan.FromMilliseconds(200))</code>. Exécute un code qui fait <code>await Task.Delay(1000, ct)</code> et attrape l'exception <code>TimeoutRejectedException</code> (namespace <code>Polly.Timeout</code>) pour afficher <code>Trop long, abandon</code>.</p>`,
      hint: `<p>Le délai doit recevoir le <code>ct</code> fourni par le pipeline : c'est lui que le timeout annule.</p>`,
      solution: `using Polly;
using Polly.Timeout;

var pipeline = new ResiliencePipelineBuilder()
    .AddTimeout(TimeSpan.FromMilliseconds(200))
    .Build();

try
{
    await pipeline.ExecuteAsync(async ct => await Task.Delay(1000, ct));
    Console.WriteLine("Terminé");
}
catch (TimeoutRejectedException)
{
    Console.WriteLine("Trop long, abandon");
}`
    },
    {
      level: "moyen",
      title: "Ne pas réessayer un 400",
      prompt: `<p>Écris un pipeline de retry (3 tentatives, 50 ms) qui ne réessaie que si l'exception est une <code>HttpRequestException</code> dont le <code>StatusCode</code> vaut <code>503</code>. Teste avec une fonction qui lève une erreur 400 : un seul appel doit être fait.</p>`,
      hint: `<p><code>new PredicateBuilder().Handle&lt;HttpRequestException&gt;(ex =&gt; ex.StatusCode == HttpStatusCode.ServiceUnavailable)</code>. Le constructeur <code>new HttpRequestException(message, inner, statusCode)</code> permet de fixer le code.</p>`,
      solution: `using System.Net;
using Polly;
using Polly.Retry;

var pipeline = new ResiliencePipelineBuilder()
    .AddRetry(new RetryStrategyOptions
    {
        MaxRetryAttempts = 3,
        Delay = TimeSpan.FromMilliseconds(50),
        ShouldHandle = new PredicateBuilder()
            .Handle<HttpRequestException>(ex => ex.StatusCode == HttpStatusCode.ServiceUnavailable)
    })
    .Build();

int calls = 0;
try
{
    await pipeline.ExecuteAsync(_ =>
    {
        calls++;
        throw new HttpRequestException("Requête invalide", null, HttpStatusCode.BadRequest);
    });
}
catch (HttpRequestException ex)
{
    Console.WriteLine($"{(int?)ex.StatusCode} après {calls} appel(s)"); // 400 après 1 appel(s)
}`
    },
    {
      level: "difficile",
      title: "Un 503 propre quand tout a échoué",
      prompt: `<p>Dans une API, écris l'endpoint <code>GET /api/orders/{id}/total-in/{currency}</code> qui appelle <code>ExchangeRateClient.GetRateAsync</code> (protégé par <code>AddStandardResilienceHandler</code>). Si l'appel échoue malgré la résilience (<code>HttpRequestException</code>, <code>BrokenCircuitException</code> ou <code>TimeoutRejectedException</code>), renvoie un <code>503</code> en ProblemDetails avec un titre clair.</p>`,
      hint: `<p>Les trois exceptions peuvent être attrapées ensemble avec un filtre : <code>catch (Exception ex) when (ex is HttpRequestException or BrokenCircuitException or TimeoutRejectedException)</code>. Puis <code>Results.Problem(title: …, statusCode: 503)</code>.</p>`,
      solution: `// Fichier : Program.cs (extrait)
using Polly.CircuitBreaker;
using Polly.Timeout;

builder.Services.AddHttpClient<ExchangeRateClient>(c =>
        c.BaseAddress = new Uri(builder.Configuration["ExchangeRates:BaseUrl"]!))
    .AddStandardResilienceHandler();

app.MapGet("/api/orders/{id:int}/total-in/{currency}",
    async (int id, string currency, ExchangeRateClient rates) =>
{
    decimal totalEur = 99.90m; // ... calculé depuis la commande en base ...
    try
    {
        decimal rate = await rates.GetRateAsync(currency);
        return Results.Ok(new { id, currency, total = Math.Round(totalEur * rate, 2) });
    }
    catch (Exception ex) when (ex is HttpRequestException
                                  or BrokenCircuitException
                                  or TimeoutRejectedException)
    {
        return Results.Problem(
            title: "Service de taux de change indisponible",
            detail: "Réessaie dans quelques instants.",
            statusCode: StatusCodes.Status503ServiceUnavailable);
    }
});`
    }
  ],
  quiz: [
    {
      q: `Pourquoi ajouter du <strong>jitter</strong> au délai de retry ?`,
      options: ["Pour que les clients ne réessaient pas tous au même instant", "Pour rendre les tests plus rapides", "Pour réessayer les erreurs 400"],
      answer: 0,
      why: `Sans jitter, mille clients qui échouent ensemble réessaient ensemble, ce qui recrée un pic sur un service qui se relève. Le hasard étale les tentatives.`
    },
    {
      q: `Le circuit breaker est <strong>ouvert</strong>. Que se passe-t-il quand ton code fait un appel ?`,
      options: ["L'appel est mis en file d'attente", "L'appel échoue immédiatement sans toucher le service", "L'appel est réessayé jusqu'à ce que le service réponde"],
      answer: 1,
      why: `Circuit ouvert = <code>BrokenCircuitException</code> immédiate. C'est tout l'intérêt : protéger le service malade et répondre vite à tes utilisateurs.`
    },
    {
      q: `Quelle requête est dangereuse à réessayer automatiquement ?`,
      options: ["<code>GET /api/products</code>", "<code>DELETE /api/carts/5</code>", "<code>POST /api/payments</code>"],
      answer: 2,
      why: `Un POST de paiement n'est pas idempotent : si le premier essai a réussi mais que la réponse s'est perdue, le retry débite une seconde fois. GET et DELETE donnent le même résultat s'ils sont rejoués.`
    },
    {
      q: `Que fait <code>AddStandardResilienceHandler()</code> sur un <code>HttpClient</code> ?`,
      options: ["Il ajoute un pipeline complet : limiteur, timeouts, retry et circuit breaker", "Il ajoute seulement un retry de 3 tentatives", "Il met en cache les réponses HTTP"],
      answer: 0,
      why: `C'est un pipeline préréglé de cinq stratégies. Tu peux ajuster chaque réglage avec la lambda d'options. Il ne fait aucun cache.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow</strong> : crée le client typé <code>ExchangeRateClient</code> (URL de base dans <code>appsettings.json</code>), protège-le avec <code>AddStandardResilienceHandler()</code> en réduisant le timeout total à 10 secondes, et ajoute l'endpoint de l'exercice difficile. Bonus : en cas d'échec, renvoie le dernier taux connu depuis le <code>HybridCache</code> de la leçon sur le cache, avec un champ <code>"stale": true</code>.</p>`,
  resources: [
    { label: "Créer des applications HTTP résilientes (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/resilience/http-resilience" },
    { label: "Introduction au développement d'applications résilientes (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/resilience/" }
  ]
});

// =====================================================================
// 6.5 Observabilité
// =====================================================================
window.COURSE.push({
  key: "prod-observability",
  title: "Observabilité : logs, métriques, traces et health checks",
  summary: "Tu sauras rendre ton API observable en production : des logs structurés, des métriques, des traces distribuées avec OpenTelemetry, et des health checks pour l'orchestrateur.",
  objectives: [
    "Distinguer logs, métriques et traces, et à quelle question chacun répond",
    "Écrire des logs structurés avec des niveaux et des scopes",
    "Exposer métriques et traces avec OpenTelemetry",
    "Ajouter des health checks live et ready"
  ],
  analogy: `<p>Une voiture a trois façons de te parler. Le <strong>carnet d'entretien</strong> raconte ce qui s'est passé, événement par événement : ce sont les <strong>logs</strong>. Le <strong>tableau de bord</strong> montre des chiffres en continu (vitesse, température, essence) : ce sont les <strong>métriques</strong>. Le <strong>GPS</strong> retrace ton trajet étape par étape avec la durée de chaque tronçon : ce sont les <strong>traces</strong>.</p>
<p>Et le voyant « moteur OK » au démarrage, c'est le <strong>health check</strong>.</p>`,
  lesson: `<h3>Pourquoi observer ?</h3>
<p>En développement, tu as le débogueur et les points d'arrêt. En production, tu n'as rien de tout ça : l'API tourne sur un serveur distant, sur plusieurs instances, avec des milliers de requêtes. Quand un client dit « ma commande a échoué à 14 h 32 », il faut pouvoir répondre <em>pourquoi</em> sans reproduire le bug. L'<strong>observabilité</strong>, c'est la capacité à comprendre ce qui se passe à l'intérieur de ton système en regardant ce qu'il émet.</p>
<table>
<tr><th>Signal</th><th>Question</th><th>Exemple</th></tr>
<tr><td>Logs</td><td>Que s'est-il passé ?</td><td>« Paiement refusé pour la commande 42 »</td></tr>
<tr><td>Métriques</td><td>Combien, à quel rythme ?</td><td>120 commandes/min, 2 % d'erreurs 500</td></tr>
<tr><td>Traces</td><td>Où le temps est-il passé ?</td><td>POST /orders : 800 ms dont 650 ms en SQL</td></tr>
</table>

<h3>Logs structurés</h3>
<p>Tu as déjà vu <code>ILogger&lt;T&gt;</code>. Le point clé : écris des <strong>logs structurés</strong> avec des paramètres nommés, jamais des chaînes interpolées. <code>logger.LogInformation("Commande {OrderId} payée", id)</code> garde <code>OrderId</code> comme un champ séparé : tu pourras ensuite filtrer « tous les logs de la commande 42 » dans ton outil. Avec <code>$"Commande {id} payée"</code>, tu n'as qu'une chaîne de texte.</p>
<p>Chaque log a un <strong>niveau</strong> : <code>Trace</code>, <code>Debug</code>, <code>Information</code>, <code>Warning</code>, <code>Error</code>, <code>Critical</code>. En production, on garde en général <code>Information</code> et au-dessus, réglé dans <code>appsettings.json</code> sous <code>Logging:LogLevel</code>. Un <strong>scope</strong> (<code>BeginScope</code>) attache un contexte à tous les logs d'un bloc, par exemple l'identifiant de la commande.</p>
<div class="tip">Ne logue jamais de mot de passe, de token, de numéro de carte ni de donnée personnelle inutile. Les logs sont lus par beaucoup de monde et gardés longtemps.</div>

<h3>Métriques et traces : les API de .NET</h3>
<p>.NET a ses propres types pour émettre ces signaux, sans dépendance externe. Pour les métriques : <code>Meter</code> et ses instruments, comme <code>Counter&lt;T&gt;</code> (un compteur qui ne fait que monter) ou <code>Histogram&lt;T&gt;</code> (une distribution de valeurs, comme des durées). Pour les traces : <code>ActivitySource</code> crée des <code>Activity</code>, que le reste du monde appelle des <strong>spans</strong>. Une span a un nom, une durée, des tags, et un parent.</p>
<pre class="diagram">
 Trace 4bf92f...  POST /api/orders           800 ms
 |-- span  Validate                           20 ms
 |-- span  SQL INSERT Orders                 650 ms
 '-- span  HTTP POST payments.example        120 ms
</pre>
<p>ASP.NET Core, <code>HttpClient</code> et EF Core émettent déjà leurs propres traces et métriques. Toi, tu ajoutes les tiennes pour le métier : nombre de commandes passées, montant moyen, durée du calcul des frais de port.</p>

<h3>OpenTelemetry : collecter et exporter</h3>
<p><strong>OpenTelemetry</strong> (souvent abrégé OTel) est un standard ouvert pour collecter logs, métriques et traces et les envoyer vers n'importe quel outil : Grafana, Jaeger, Prometheus, Azure Monitor, Datadog… Le protocole d'envoi s'appelle <strong>OTLP</strong>. Ton code n'est donc pas lié à un fournisseur.</p>
<div class="flow"><span>Ton API (Meter, ActivitySource, ILogger)</span><span>SDK OpenTelemetry</span><span>Export OTLP</span><span>Grafana, Jaeger, Azure Monitor…</span></div>
<p>En .NET, on configure tout dans <code>Program.cs</code> avec <code>builder.Services.AddOpenTelemetry()</code>, puis <code>WithTracing</code>, <code>WithMetrics</code>, <code>WithLogging</code> et <code>UseOtlpExporter()</code>. L'adresse du collecteur se donne par la variable d'environnement <code>OTEL_EXPORTER_OTLP_ENDPOINT</code>. En local, le tableau de bord .NET Aspire (une image Docker) affiche tout ça très simplement.</p>

<h3>Health checks : « es-tu en vie ? es-tu prêt ? »</h3>
<p>Un orchestrateur (Docker, Kubernetes, Azure App Service) interroge régulièrement ton API pour savoir si elle va bien. On distingue deux questions. <strong>Live</strong> : le processus tourne-t-il ? Si non, on le redémarre. <strong>Ready</strong> : peut-il servir des requêtes (base joignable, cache chaud) ? Si non, on ne lui envoie plus de trafic, sans le redémarrer.</p>
<p>On les ajoute avec <code>AddHealthChecks()</code> et <code>MapHealthChecks("/health/…")</code>. Pour vérifier SQL Server, le package <code>Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore</code> fournit <code>.AddDbContextCheck&lt;OrderFlowDbContext&gt;()</code>.</p>
<div class="note">Ne mets pas la base de données dans le check <em>live</em> : si SQL Server tombe, l'orchestrateur redémarrerait en boucle toutes tes instances, ce qui n'aide en rien. La base va dans <em>ready</em>. Et ajoute un <code>traceId</code> dans tes réponses d'erreur ProblemDetails : le support pourra retrouver la trace exacte à partir de la réclamation d'un client.</div>`,
  examples: [
    {
      title: "Logs structurés, niveaux et scope",
      code: `// dotnet add package Microsoft.Extensions.Logging.Console
using Microsoft.Extensions.Logging;

using (var factory = LoggerFactory.Create(b => b
    .AddSimpleConsole(o => { o.SingleLine = true; o.IncludeScopes = true; })
    .SetMinimumLevel(LogLevel.Information)))
{
    ILogger logger = factory.CreateLogger("OrderFlow.Orders");

    logger.LogDebug("Détail technique : invisible car le minimum est Information");

    using (logger.BeginScope("Commande {OrderId}", 42))
    {
        logger.LogInformation("Paiement accepté pour {LineCount} ligne(s)", 3);
        logger.LogWarning("Stock faible pour le produit {ProductId} : {Stock} restant(s)", 7, 2);
    }

    var error = new TimeoutException("SQL timeout");
    logger.LogError(error, "Échec d'enregistrement de la commande {OrderId}", 43);
} // Dispose vide le tampon : tous les logs sont écrits`,
      output: `info: OrderFlow.Orders[0] => Commande 42 Paiement accepté pour 3 ligne(s)
warn: OrderFlow.Orders[0] => Commande 42 Stock faible pour le produit 7 : 2 restant(s)
fail: OrderFlow.Orders[0] Échec d'enregistrement de la commande 43 System.TimeoutException: SQL timeout`,
      steps: [
        "<code>LoggerFactory.Create(…)</code> : en console on crée la fabrique à la main ; dans une API, elle est déjà configurée et tu injectes <code>ILogger&lt;T&gt;</code>.",
        "<code>o.SingleLine = true; o.IncludeScopes = true;</code> : un log par ligne, avec le scope affiché après <code>=&gt;</code>.",
        "<code>SetMinimumLevel(LogLevel.Information)</code> : le <code>LogDebug</code> est filtré, il n'apparaît pas.",
        "<code>logger.BeginScope(\"Commande {OrderId}\", 42)</code> : tous les logs du bloc <code>using</code> portent ce contexte. Le dernier log, hors du bloc, ne l'a pas.",
        "<code>\"Stock faible pour le produit {ProductId} : {Stock} restant(s)\", 7, 2</code> : les valeurs remplacent les paramètres <em>dans l'ordre</em>. Les noms servent de champs pour la recherche.",
        "<code>logger.LogError(error, …)</code> : l'exception se passe en premier argument, jamais concaténée dans le message, pour garder sa stack trace."
      ]
    },
    {
      title: "Une métrique et des traces avec les API de .NET",
      code: `using System.Diagnostics;
using System.Diagnostics.Metrics;

// Ce que ton code expose (OpenTelemetry sait le lire)
var meter = new Meter("OrderFlow");
Counter<int> ordersPlaced = meter.CreateCounter<int>("orderflow.orders.placed");
var source = new ActivitySource("OrderFlow");

// Deux écouteurs qui jouent le rôle d'OpenTelemetry pour la démo
using var meterListener = new MeterListener();
meterListener.InstrumentPublished = (instrument, listener) =>
{
    if (instrument.Meter.Name == "OrderFlow") listener.EnableMeasurementEvents(instrument);
};
meterListener.SetMeasurementEventCallback<int>((instrument, value, tags, _) =>
    Console.WriteLine($"[métrique] {instrument.Name} +{value} ({tags[0].Key}={tags[0].Value})"));
meterListener.Start();

ActivitySource.AddActivityListener(new ActivityListener
{
    ShouldListenTo = s => s.Name == "OrderFlow",
    Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllData,
    ActivityStopped = a =>
        Console.WriteLine($"[trace] {a.DisplayName} fini, parent : {a.Parent?.DisplayName ?? "aucun"}")
});

// Le code métier instrumenté
using (Activity? activity = source.StartActivity("PlaceOrder"))
{
    activity?.SetTag("order.id", 42);
    using (source.StartActivity("SaveToDatabase"))
    {
        await Task.Delay(20); // simule SQL
    }
    ordersPlaced.Add(1, new KeyValuePair<string, object?>("payment", "card"));
}`,
      output: `[trace] SaveToDatabase fini, parent : PlaceOrder
[métrique] orderflow.orders.placed +1 (payment=card)
[trace] PlaceOrder fini, parent : aucun`,
      steps: [
        "<code>new Meter(\"OrderFlow\")</code> et <code>CreateCounter&lt;int&gt;(…)</code> : on déclare un compteur. Le nom suit la convention <code>application.objet.action</code>.",
        "<code>new ActivitySource(\"OrderFlow\")</code> : la source des traces de l'application. C'est ce nom que l'on donnera à <code>AddSource</code> dans OpenTelemetry.",
        "<code>MeterListener</code> et <code>ActivityListener</code> : dans une vraie API, c'est OpenTelemetry qui écoute. Ici on écoute nous-mêmes pour voir ce qui est émis.",
        "<code>source.StartActivity(\"PlaceOrder\")</code> : démarre une span. Elle renvoie <code>null</code> si personne n'écoute, d'où le <code>?.</code> sur <code>SetTag</code>.",
        "<code>source.StartActivity(\"SaveToDatabase\")</code> dans le bloc : .NET la rattache automatiquement à la span courante, qui devient son parent.",
        "<code>ordersPlaced.Add(1, …)</code> : incrémente le compteur avec un tag <code>payment=card</code>, pour pouvoir découper la métrique par moyen de paiement."
      ],
      explain: "Les spans se terminent de l'intérieur vers l'extérieur : l'enfant SaveToDatabase s'affiche avant son parent PlaceOrder."
    },
    {
      title: "OpenTelemetry et health checks dans l'API",
      code: `// Fichier : Program.cs (projet web)
// dotnet add package OpenTelemetry.Extensions.Hosting
// dotnet add package OpenTelemetry.Instrumentation.AspNetCore
// dotnet add package OpenTelemetry.Instrumentation.Http
// dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
using Microsoft.Extensions.Diagnostics.HealthChecks;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService("OrderFlow.Api"))
    .WithTracing(t => t.AddAspNetCoreInstrumentation()
                       .AddHttpClientInstrumentation()
                       .AddSource("OrderFlow"))
    .WithMetrics(m => m.AddAspNetCoreInstrumentation()
                       .AddHttpClientInstrumentation()
                       .AddMeter("OrderFlow"))
    .WithLogging()
    .UseOtlpExporter(); // envoie tout vers OTEL_EXPORTER_OTLP_ENDPOINT

builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy(), tags: ["live"])
    .AddCheck("database", () => HealthCheckResult.Healthy("SQL Server répond"), tags: ["ready"]);

var app = builder.Build();

// live : le processus tourne ; ready : il peut servir des requêtes
app.MapHealthChecks("/health/live", new() { Predicate = c => c.Tags.Contains("live") });
app.MapHealthChecks("/health/ready", new() { Predicate = c => c.Tags.Contains("ready") });

app.Run();`,
      output: `GET /health/ready
HTTP/1.1 200 OK
Content-Type: text/plain
Cache-Control: no-store, no-cache

Healthy`,
      steps: [
        "<code>AddOpenTelemetry().ConfigureResource(r =&gt; r.AddService(\"OrderFlow.Api\"))</code> : donne un nom à ton service ; c'est ce nom que tu verras dans Grafana ou Jaeger.",
        "<code>.WithTracing(t =&gt; t.AddAspNetCoreInstrumentation()…AddSource(\"OrderFlow\"))</code> : collecte les traces des requêtes entrantes, des appels <code>HttpClient</code> sortants, et de ton <code>ActivitySource</code> maison.",
        "<code>.WithMetrics(…AddMeter(\"OrderFlow\"))</code> : même principe pour les métriques, dont ton compteur <code>orderflow.orders.placed</code>.",
        "<code>.WithLogging()</code> puis <code>.UseOtlpExporter()</code> : les logs <code>ILogger</code> partent aussi vers le collecteur, avec le <code>traceId</code> de la requête en cours. Sans collecteur, l'API fonctionne quand même.",
        "<code>.AddCheck(\"database\", …, tags: [\"ready\"])</code> : un check factice pour la démo. En vrai : <code>.AddDbContextCheck&lt;OrderFlowDbContext&gt;(tags: [\"ready\"])</code>.",
        "<code>Predicate = c =&gt; c.Tags.Contains(\"live\")</code> : chaque endpoint n'exécute que les checks de son tag. <code>/health/live</code> répond aussi <code>Healthy</code> ; un check en échec donnerait <code>503 Unhealthy</code>."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Corriger des logs mal écrits",
      prompt: `<p>Réécris ces trois lignes en logs structurés corrects : <code>logger.LogInformation($"Client {id} connecté");</code>, <code>logger.LogError("Erreur : " + ex.Message);</code> et <code>logger.LogInformation($"Login avec le mot de passe {password}");</code>.</p>`,
      hint: `<p>Paramètres nommés, exception en premier argument, et la troisième ligne ne doit tout simplement pas exister telle quelle.</p>`,
      solution: `// 1. Paramètre nommé au lieu d'une interpolation
logger.LogInformation("Client {CustomerId} connecté", id);

// 2. L'exception en premier argument : stack trace conservée
logger.LogError(ex, "Erreur pendant la connexion du client {CustomerId}", id);

// 3. Jamais de mot de passe dans un log : on logue seulement l'événement
logger.LogInformation("Tentative de connexion pour {Email}", email);`
    },
    {
      level: "moyen",
      title: "Un histogramme de montants",
      prompt: `<p>Ajoute à l'exemple des métriques un <code>Histogram&lt;double&gt;</code> nommé <code>orderflow.orders.amount</code> (unité <code>"EUR"</code>). Enregistre trois commandes de 19.9, 54.5 et 120 avec <code>Record</code>, et écoute-les avec un <code>MeterListener</code> qui affiche chaque valeur.</p>`,
      hint: `<p><code>meter.CreateHistogram&lt;double&gt;("orderflow.orders.amount", unit: "EUR")</code>. Le callback se règle avec <code>SetMeasurementEventCallback&lt;double&gt;</code>. Utilise <code>CultureInfo.InvariantCulture</code> pour l'affichage.</p>`,
      solution: `using System.Diagnostics.Metrics;
using System.Globalization;

var meter = new Meter("OrderFlow");
Histogram<double> amounts = meter.CreateHistogram<double>("orderflow.orders.amount", unit: "EUR");

using var listener = new MeterListener();
listener.InstrumentPublished = (instrument, l) =>
{
    if (instrument.Meter.Name == "OrderFlow") l.EnableMeasurementEvents(instrument);
};
listener.SetMeasurementEventCallback<double>((instrument, value, tags, _) =>
    Console.WriteLine($"{instrument.Name} = {value.ToString(CultureInfo.InvariantCulture)} {instrument.Unit}"));
listener.Start();

amounts.Record(19.9);
amounts.Record(54.5);
amounts.Record(120);
// orderflow.orders.amount = 19.9 EUR
// orderflow.orders.amount = 54.5 EUR
// orderflow.orders.amount = 120 EUR`
    },
    {
      level: "difficile",
      title: "Un health check personnalisé",
      prompt: `<p>Écris une classe <code>DiskSpaceHealthCheck : IHealthCheck</code> qui renvoie <code>Healthy</code> s'il reste plus de 1 Go libre sur le disque courant, <code>Degraded</code> entre 500 Mo et 1 Go, et <code>Unhealthy</code> en dessous. Enregistre-la avec le tag <code>ready</code>.</p>`,
      hint: `<p><code>new DriveInfo(Path.GetPathRoot(AppContext.BaseDirectory)!).AvailableFreeSpace</code> donne l'espace libre en octets. Enregistrement : <code>.AddCheck&lt;DiskSpaceHealthCheck&gt;("disk", tags: ["ready"])</code>.</p>`,
      solution: `using Microsoft.Extensions.Diagnostics.HealthChecks;

class DiskSpaceHealthCheck : IHealthCheck
{
    private const long OneGb = 1024L * 1024 * 1024;

    public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        var drive = new DriveInfo(Path.GetPathRoot(AppContext.BaseDirectory)!);
        long free = drive.AvailableFreeSpace;
        string detail = $"{free / (1024 * 1024)} Mo libres";

        HealthCheckResult result = free switch
        {
            > OneGb => HealthCheckResult.Healthy(detail),
            > OneGb / 2 => HealthCheckResult.Degraded(detail),
            _ => HealthCheckResult.Unhealthy(detail)
        };
        return Task.FromResult(result);
    }
}

// Dans Program.cs :
// builder.Services.AddHealthChecks()
//     .AddCheck<DiskSpaceHealthCheck>("disk", tags: ["ready"]);`
    }
  ],
  quiz: [
    {
      q: `Tu veux savoir combien de commandes sont passées par minute. Quel signal utilises-tu ?`,
      options: ["Un log par commande", "Une métrique (compteur)", "Une trace"],
      answer: 1,
      why: `Une question « combien, à quel rythme » appelle une métrique. Compter des logs fonctionne, mais coûte beaucoup plus cher en stockage et en calcul.`
    },
    {
      q: `Pourquoi préférer <code>LogInformation("Commande {OrderId}", id)</code> à <code>LogInformation($"Commande {id}")</code> ?`,
      options: ["C'est plus rapide à taper", "L'interpolation ne compile pas dans un log", "<code>OrderId</code> devient un champ sur lequel on peut filtrer"],
      answer: 2,
      why: `Le log structuré garde le nom et la valeur séparément. Ton outil de logs peut alors chercher <code>OrderId = 42</code>. L'interpolation produit une simple chaîne (et calcule le texte même si le niveau est filtré).`
    },
    {
      q: `La base de données est en panne. Quel health check doit échouer ?`,
      options: ["<code>ready</code> seulement", "<code>live</code> seulement", "Les deux"],
      answer: 0,
      why: `<code>ready</code> en échec retire l'instance du trafic. Si <code>live</code> échouait aussi, l'orchestrateur redémarrerait l'API en boucle, ce qui ne répare pas la base.`
    },
    {
      q: `Quel est l'intérêt principal d'OpenTelemetry ?`,
      options: ["Il remplace ILogger", "Un standard unique pour collecter et exporter vers n'importe quel outil", "Il stocke lui-même les logs dans SQL Server"],
      answer: 1,
      why: `OpenTelemetry collecte ce que ton code émet (via <code>ILogger</code>, <code>Meter</code>, <code>ActivitySource</code>) et l'exporte en OTLP. Tu changes d'outil sans toucher ton code.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow</strong> : ajoute OpenTelemetry comme dans l'exemple 3, crée une classe <code>OrderFlowMetrics</code> (singleton) qui expose le compteur <code>orderflow.orders.placed</code> et l'histogramme <code>orderflow.orders.amount</code>, et appelle-la dans <code>POST /api/orders</code>. Ajoute <code>/health/live</code> et <code>/health/ready</code> avec <code>AddDbContextCheck&lt;OrderFlowDbContext&gt;</code>. Pour voir le résultat en local : <code>docker run --rm -p 18888:18888 -p 4317:18889 mcr.microsoft.com/dotnet/aspire-dashboard</code>, puis <code>OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317</code>.</p>`,
  resources: [
    { label: "Observabilité .NET avec OpenTelemetry (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/diagnostics/observability-with-otel" },
    { label: "Contrôles d'intégrité dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/host-and-deploy/health-checks" }
  ]
});

// =====================================================================
// 6.6 Docker
// =====================================================================
window.COURSE.push({
  key: "prod-docker",
  title: "Conteneuriser l'API avec Docker",
  summary: "Tu sauras écrire un Dockerfile multi-étapes pour OrderFlow, lancer l'API et SQL Server avec Docker Compose, et configurer le conteneur par variables d'environnement.",
  objectives: [
    "Comprendre la différence entre image et conteneur",
    "Écrire un Dockerfile multi-étapes optimisé pour .NET 10",
    "Configurer l'API dans un conteneur avec des variables d'environnement",
    "Lancer l'API et SQL Server ensemble avec Docker Compose"
  ],
  analogy: `<p>Un <strong>conteneur maritime</strong> a toujours la même forme, qu'il transporte des bananes ou des voitures. Le port, le bateau et le camion n'ont pas besoin de savoir ce qu'il y a dedans : ils savent tous manipuler une boîte standard.</p>
<p>Docker fait pareil avec ton API : tu la ranges, avec tout ce dont elle a besoin, dans une boîte standard. Elle tourne ensuite de la même façon sur ton PC, sur le serveur de test et en production. Fini le « ça marche sur ma machine ».</p>`,
  lesson: `<h3>Image et conteneur</h3>
<p>Une <strong>image</strong> est un modèle figé : un système de fichiers minimal (un petit Linux), le runtime .NET et ton application publiée. Un <strong>conteneur</strong> est une image <em>en cours d'exécution</em>, isolée du reste de la machine. Une image peut lancer plusieurs conteneurs, comme une classe peut créer plusieurs objets.</p>
<div class="compare"><div><h4>Image</h4><p>Le plan, en lecture seule. On la construit avec <code>docker build</code>, on la stocke dans un registre (Docker Hub, GitHub Container Registry, Azure Container Registry).</p></div><div><h4>Conteneur</h4><p>L'instance qui tourne. On le lance avec <code>docker run</code>, on l'arrête, on le jette, on en relance un neuf.</p></div></div>
<p>Contrairement à une machine virtuelle, un conteneur ne démarre pas un système d'exploitation complet : il partage le noyau de la machine hôte. Il démarre donc en une seconde et pèse quelques centaines de Mo.</p>

<h3>Le Dockerfile, couche par couche</h3>
<p>Un <strong>Dockerfile</strong> est la recette de l'image. Chaque instruction (<code>FROM</code>, <code>COPY</code>, <code>RUN</code>…) crée une <strong>couche</strong>. Docker met chaque couche en cache : si rien n'a changé depuis le dernier build, il la réutilise. D'où une astuce importante : copier d'abord les <code>.csproj</code> et faire le <code>dotnet restore</code>, <em>puis</em> copier le reste du code. Tant que tes dépendances NuGet ne changent pas, la restauration (lente) n'est pas refaite.</p>

<h3>Le build multi-étapes</h3>
<p>Pour compiler, il faut le SDK .NET complet (près de 1 Go). Pour exécuter, le runtime ASP.NET suffit (environ 230 Mo). Un <strong>build multi-étapes</strong> utilise deux images dans le même Dockerfile : la première compile, la seconde ne récupère que le résultat publié.</p>
<pre class="diagram">
 Étape "build"  (sdk:10.0, ~900 Mo)
   COPY *.csproj -&gt; restore -&gt; COPY . -&gt; publish
                                          |
                          /app/publish    | COPY --from=build
                                          v
 Étape "final"  (aspnet:10.0, ~230 Mo)
   OrderFlow.Api.dll + dépendances  --&gt; image livrée
</pre>
<p>L'image finale ne contient ni le SDK, ni ton code source, ni les outils de compilation : elle est plus légère et offre moins de surface d'attaque.</p>

<h3>Ce que les images .NET font pour toi</h3>
<p>Depuis .NET 8, les images officielles écoutent sur le port <strong>8080</strong> (et non plus 80) et fournissent un utilisateur non privilégié nommé <code>app</code>, accessible via la variable <code>$APP_UID</code>. Écrire <code>USER $APP_UID</code> dans ton Dockerfile évite de faire tourner l'API en <code>root</code> : si quelqu'un trouve une faille, il a beaucoup moins de droits.</p>
<p>Ajoute aussi un fichier <code>.dockerignore</code> à côté du Dockerfile, pour ne pas envoyer à Docker les dossiers <code>bin/</code>, <code>obj/</code>, <code>.git/</code>, <code>node_modules/</code> ni tes fichiers de secrets locaux. Le build est plus rapide et l'image plus propre.</p>

<h3>Configurer le conteneur</h3>
<p>On ne reconstruit pas l'image pour changer de base de données. La même image va en test et en production ; seule la <strong>configuration</strong> change, via des variables d'environnement. ASP.NET Core les lit automatiquement et elles écrasent <code>appsettings.json</code>. Le double tiret bas <code>__</code> remplace les deux-points : <code>ConnectionStrings__OrderFlow</code> correspond à <code>ConnectionStrings:OrderFlow</code>.</p>
<table>
<tr><th>Variable</th><th>Rôle</th></tr>
<tr><td><code>ASPNETCORE_ENVIRONMENT</code></td><td><code>Production</code> par défaut dans le conteneur</td></tr>
<tr><td><code>ConnectionStrings__OrderFlow</code></td><td>La chaîne de connexion SQL Server</td></tr>
<tr><td><code>ASPNETCORE_HTTP_PORTS</code></td><td>Le port d'écoute (8080 par défaut)</td></tr>
</table>
<div class="tip">Ne mets jamais un mot de passe dans le Dockerfile (<code>ENV</code>) ni dans <code>appsettings.json</code> : il serait gravé dans l'image et visible par quiconque la télécharge. Passe-le au lancement, ou via un gestionnaire de secrets (Azure Key Vault, secrets Kubernetes).</div>

<h3>Docker Compose : plusieurs conteneurs ensemble</h3>
<p>OrderFlow a besoin de SQL Server. <strong>Docker Compose</strong> décrit plusieurs conteneurs dans un fichier <code>compose.yaml</code> et les lance d'une commande : <code>docker compose up</code>. Les conteneurs d'un même fichier partagent un réseau et se trouvent par leur nom de service : l'API se connecte à <code>Server=db</code>.</p>
<div class="note">Le SDK .NET sait aussi construire une image sans Dockerfile : <code>dotnet publish -t:PublishContainer</code>. C'est pratique pour démarrer. Le Dockerfile reste utile dès que tu veux maîtriser chaque couche, et c'est ce que tu rencontreras dans la plupart des équipes.</div>`,
  examples: [
    {
      title: "Un Dockerfile multi-étapes pour OrderFlow",
      code: `# Fichier : Dockerfile (à la racine, à côté du dossier OrderFlow.Api)

# ---------- Étape 1 : compiler avec le SDK ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# D'abord les .csproj seuls : la restauration reste en cache
# tant qu'ils ne changent pas (copie aussi ceux des projets référencés)
COPY OrderFlow.Api/OrderFlow.Api.csproj OrderFlow.Api/
RUN dotnet restore OrderFlow.Api/OrderFlow.Api.csproj

# Puis tout le code source
COPY . .
RUN dotnet publish OrderFlow.Api/OrderFlow.Api.csproj -c Release -o /app/publish --no-restore

# ---------- Étape 2 : exécuter avec le runtime seul ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "OrderFlow.Api.dll"]`,
      output: `$ docker build -t orderflow-api:1.0 .
[+] Building 52.4s (14/14) FINISHED
 => [internal] load build definition from Dockerfile               0.0s
 => [internal] load .dockerignore                                  0.0s
 => [build 1/6] FROM mcr.microsoft.com/dotnet/sdk:10.0            18.9s
 => [final 1/3] FROM mcr.microsoft.com/dotnet/aspnet:10.0          6.2s
 => [build 3/6] COPY OrderFlow.Api/OrderFlow.Api.csproj OrderF...  0.1s
 => [build 4/6] RUN dotnet restore OrderFlow.Api/OrderFlow.Api.cs 11.7s
 => [build 5/6] COPY . .                                           0.2s
 => [build 6/6] RUN dotnet publish OrderFlow.Api/OrderFlow.Api.c  14.8s
 => [final 3/3] COPY --from=build /app/publish .                   0.1s
 => exporting to image                                             0.4s
 => => naming to docker.io/library/orderflow-api:1.0               0.0s

$ docker run -d -p 8080:8080 --name orderflow orderflow-api:1.0
7c41e0b2d9a5f3c8e61b0a4d2f7e9c1b5a3d8f6e2c0b4a7d9e1f3c5b7a9d2e4f

$ curl http://localhost:8080/health/live
Healthy`,
      steps: [
        "<code>FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build</code> : la première étape part de l'image du SDK et s'appelle <code>build</code>.",
        "<code>COPY OrderFlow.Api/OrderFlow.Api.csproj OrderFlow.Api/</code> puis <code>RUN dotnet restore</code> : seul le .csproj est copié. Si tu modifies un fichier .cs, cette couche reste en cache et la restauration n'est pas refaite.",
        "<code>COPY . .</code> puis <code>RUN dotnet publish … -o /app/publish --no-restore</code> : on copie le code et on publie en Release dans <code>/app/publish</code>.",
        "<code>FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final</code> : on repart d'une image neuve, avec le runtime seulement.",
        "<code>COPY --from=build /app/publish .</code> : on ne récupère de l'étape 1 que le résultat publié.",
        "<code>USER $APP_UID</code> : l'API tourne avec l'utilisateur non privilégié <code>app</code> fourni par l'image.",
        "<code>EXPOSE 8080</code> et <code>ENTRYPOINT [\"dotnet\", \"OrderFlow.Api.dll\"]</code> : le port documenté et la commande lancée au démarrage. <code>-p 8080:8080</code> au <code>docker run</code> relie le port du PC à celui du conteneur."
      ],
      explain: "Au deuxième build, si seul le code C# a changé, les étapes FROM et restore affichent CACHED : le build passe de 50 s à une quinzaine de secondes."
    },
    {
      title: "L'API et SQL Server avec Docker Compose",
      code: `# Fichier : compose.yaml (à côté du Dockerfile)
# Le mot de passe vient du fichier .env (jamais commité) : SA_PASSWORD=...
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      ASPNETCORE_ENVIRONMENT: Production
      ConnectionStrings__OrderFlow: "Server=db;Database=OrderFlow;User Id=sa;Password=\${SA_PASSWORD};TrustServerCertificate=True"
    depends_on:
      db:
        condition: service_healthy

  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_SA_PASSWORD: \${SA_PASSWORD}
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \\"$$MSSQL_SA_PASSWORD\\" -C -Q 'SELECT 1' || exit 1"]
      interval: 10s
      retries: 10
      start_period: 20s
    volumes:
      - sqldata:/var/opt/mssql

volumes:
  sqldata:`,
      output: `$ docker compose up -d --build
[+] Running 4/4
 ✔ Network orderflow_default   Created                      0.1s
 ✔ Volume "orderflow_sqldata"  Created                      0.0s
 ✔ Container orderflow-db-1    Healthy                     21.4s
 ✔ Container orderflow-api-1   Started                     21.6s

$ docker compose ps
NAME              IMAGE                                        STATUS                    PORTS
orderflow-api-1   orderflow-api                                Up 8 seconds              0.0.0.0:8080->8080/tcp
orderflow-db-1    mcr.microsoft.com/mssql/server:2022-latest   Up 30 seconds (healthy)   1433/tcp`,
      steps: [
        "<code>services:</code> : deux services, <code>api</code> et <code>db</code>. Compose crée un réseau commun où chacun est joignable par son nom.",
        "<code>build: .</code> : l'image de l'API est construite à partir du Dockerfile du dossier courant.",
        "<code>ConnectionStrings__OrderFlow: \"Server=db;…\"</code> : la variable d'environnement écrase la chaîne de <code>appsettings.json</code>. <code>Server=db</code> désigne le conteneur SQL Server.",
        "<code>\${SA_PASSWORD}</code> : Compose remplace cette valeur par celle du fichier <code>.env</code>. Le mot de passe n'apparaît pas dans le fichier versionné.",
        "<code>healthcheck:</code> : Compose lance <code>sqlcmd … SELECT 1</code> toutes les 10 s pour savoir si SQL Server est prêt. Le <code>$$</code> évite que Compose interprète le <code>$</code> lui-même.",
        "<code>depends_on: db: condition: service_healthy</code> : l'API ne démarre qu'une fois la base déclarée en bonne santé.",
        "<code>volumes: - sqldata:/var/opt/mssql</code> : les fichiers de la base sont gardés dans un volume. <code>docker compose down</code> ne les efface pas (seul <code>down -v</code> le ferait)."
      ]
    },
    {
      title: "Les variables d'environnement écrasent appsettings.json",
      code: `// dotnet add package Microsoft.Extensions.Configuration.EnvironmentVariables
using Microsoft.Extensions.Configuration;

// Ce que fait « docker run -e ConnectionStrings__OrderFlow=... »
Environment.SetEnvironmentVariable("ConnectionStrings__OrderFlow",
    "Server=db;Database=OrderFlow;User Id=sa;Password=***;TrustServerCertificate=True");

var config = new ConfigurationBuilder()
    .AddInMemoryCollection(new Dictionary<string, string?>
    {
        // Ce que contiendrait appsettings.json
        ["ConnectionStrings:OrderFlow"] = "Server=localhost;Database=OrderFlow;Trusted_Connection=True",
        ["Logging:LogLevel:Default"] = "Information"
    })
    .AddEnvironmentVariables() // ajoutée APRÈS : elle gagne
    .Build();

Console.WriteLine(config.GetConnectionString("OrderFlow"));
Console.WriteLine(config["Logging:LogLevel:Default"]);`,
      output: `Server=db;Database=OrderFlow;User Id=sa;Password=***;TrustServerCertificate=True
Information`,
      steps: [
        "<code>Environment.SetEnvironmentVariable(\"ConnectionStrings__OrderFlow\", …)</code> : on simule ce que Docker fait au lancement du conteneur.",
        "<code>AddInMemoryCollection(…)</code> : joue le rôle de <code>appsettings.json</code>. Les clés utilisent <code>:</code> pour la hiérarchie.",
        "<code>.AddEnvironmentVariables()</code> : chaque source ajoutée plus tard écrase les précédentes. <code>__</code> est traduit en <code>:</code>.",
        "<code>config.GetConnectionString(\"OrderFlow\")</code> : lit <code>ConnectionStrings:OrderFlow</code>. C'est la valeur de la variable d'environnement qui sort.",
        "<code>config[\"Logging:LogLevel:Default\"]</code> : aucune variable ne la redéfinit, donc la valeur de « appsettings » est conservée."
      ],
      explain: "WebApplication.CreateBuilder fait exactement cet empilement pour toi : appsettings.json, appsettings.{Environnement}.json, user-secrets en développement, puis variables d'environnement et arguments de ligne de commande."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Écrire le .dockerignore",
      prompt: `<p>Écris le fichier <code>.dockerignore</code> d'OrderFlow. Il doit exclure les dossiers de compilation, le dépôt Git, les dossiers de l'IDE, le front Angular s'il est dans le même dépôt (<code>node_modules</code>), et le fichier <code>.env</code> qui contient le mot de passe.</p>`,
      hint: `<p>La syntaxe ressemble à celle de <code>.gitignore</code>. <code>**/bin/</code> exclut tous les dossiers <code>bin</code>, à n'importe quelle profondeur.</p>`,
      solution: `# Fichier : .dockerignore
**/bin/
**/obj/
.git/
.vs/
.vscode/
.idea/
**/node_modules/
.env
**/*.user
**/appsettings.Development.json`
    },
    {
      level: "moyen",
      title: "Changer le port d'écoute",
      prompt: `<p>Tu dois faire écouter l'API sur le port <code>5000</code> dans le conteneur, et l'exposer sur le port <code>9000</code> de ta machine. Quelles lignes changes-tu dans le Dockerfile, et quelle commande <code>docker run</code> écris-tu ?</p>`,
      hint: `<p>La variable <code>ASPNETCORE_HTTP_PORTS</code> règle le port d'écoute de Kestrel. Dans <code>-p A:B</code>, A est le port de ta machine, B celui du conteneur.</p>`,
      solution: `# Dans l'étape final du Dockerfile
ENV ASPNETCORE_HTTP_PORTS=5000
EXPOSE 5000

# Lancement : port 9000 de la machine -> port 5000 du conteneur
# docker run -d -p 9000:5000 --name orderflow orderflow-api:1.0
# curl http://localhost:9000/health/live`
    },
    {
      level: "difficile",
      title: "Un Dockerfile pour une solution à plusieurs projets",
      prompt: `<p>OrderFlow est maintenant découpé en <code>OrderFlow.Domain</code>, <code>OrderFlow.Infrastructure</code> et <code>OrderFlow.Api</code> (l'API référence les deux autres). Adapte l'étape <code>build</code> du Dockerfile pour garder le cache de restauration. Puis explique en commentaire comment l'orchestrateur vérifiera que le conteneur est en vie.</p>`,
      hint: `<p>Copie les trois <code>.csproj</code> avant le <code>restore</code>, en gardant la même arborescence de dossiers. Pour la santé : l'image aspnet ne contient ni <code>curl</code> ni <code>wget</code>.</p>`,
      solution: `FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY OrderFlow.Domain/OrderFlow.Domain.csproj OrderFlow.Domain/
COPY OrderFlow.Infrastructure/OrderFlow.Infrastructure.csproj OrderFlow.Infrastructure/
COPY OrderFlow.Api/OrderFlow.Api.csproj OrderFlow.Api/
RUN dotnet restore OrderFlow.Api/OrderFlow.Api.csproj

COPY . .
RUN dotnet publish OrderFlow.Api/OrderFlow.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
USER $APP_UID
EXPOSE 8080
ENTRYPOINT ["dotnet", "OrderFlow.Api.dll"]

# Santé du conteneur : l'image aspnet n'a ni curl ni wget.
# Le plus simple est de laisser l'orchestrateur appeler /health/live :
# sonde HTTP « liveness » de Kubernetes, « Health check » d'Azure App Service.
# Sinon, installe curl dans l'étape final (USER root, apt-get install, puis USER $APP_UID).`
    }
  ],
  quiz: [
    {
      q: `Quel est l'intérêt principal d'un build multi-étapes ?`,
      options: ["Compiler plus vite", "Obtenir une image finale sans SDK ni code source, plus légère", "Pouvoir lancer plusieurs conteneurs"],
      answer: 1,
      why: `L'étape de build utilise le SDK ; l'étape finale ne copie que le résultat publié sur l'image runtime. Moins de poids, moins de surface d'attaque.`
    },
    {
      q: `Pourquoi copier les <code>.csproj</code> et faire <code>dotnet restore</code> avant de copier le reste du code ?`,
      options: ["Pour profiter du cache de couches quand seul le code change", "Parce que <code>dotnet publish</code> refuse sinon", "Pour réduire la taille de l'image finale"],
      answer: 0,
      why: `Docker réutilise une couche si ses entrées n'ont pas changé. Les .csproj changent rarement : la restauration NuGet reste en cache et les builds deviennent bien plus rapides.`
    },
    {
      q: `Quelle variable d'environnement définit la chaîne de connexion <code>OrderFlow</code> dans le conteneur ?`,
      options: ["<code>ConnectionStrings:OrderFlow</code>", "<code>ORDERFLOW_CONNECTION</code>", "<code>ConnectionStrings__OrderFlow</code>"],
      answer: 2,
      why: `Dans les variables d'environnement, <code>__</code> remplace <code>:</code> (les deux-points ne sont pas autorisés partout). ASP.NET Core traduit automatiquement.`
    },
    {
      q: `Dans <code>compose.yaml</code>, comment l'API joint-elle le conteneur SQL Server ?`,
      options: ["Par <code>localhost</code>", "Par le nom du service, ici <code>db</code>", "Par l'adresse IP de ta machine"],
      answer: 1,
      why: `Compose crée un réseau où chaque service est joignable par son nom. Dans le conteneur de l'API, <code>localhost</code> désigne l'API elle-même, pas la base.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow</strong> : ajoute à la racine le <code>Dockerfile</code> (adapté à tes projets), le <code>.dockerignore</code>, le <code>compose.yaml</code> et un fichier <code>.env</code> (ajouté à <code>.gitignore</code>). Lance <code>docker compose up -d --build</code>, applique les migrations EF Core vers <code>Server=localhost,1433</code>, puis vérifie <code>http://localhost:8080/health/ready</code> et <code>GET /api/products</code>.</p>`,
  resources: [
    { label: "Conteneuriser une application .NET (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/docker/build-container" },
    { label: "Conteneuriser une application .NET avec dotnet publish (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/containers/sdk-publish" }
  ]
});

// =====================================================================
// 6.7 CI/CD avec GitHub Actions
// =====================================================================
window.COURSE.push({
  key: "prod-cicd",
  title: "Intégration et déploiement continus avec GitHub Actions",
  summary: "Tu sauras écrire un workflow GitHub Actions qui compile et teste OrderFlow à chaque push, publie l'image Docker et la déploie en production après validation.",
  objectives: [
    "Comprendre la différence entre intégration continue et déploiement continu",
    "Lire et écrire un workflow : déclencheurs, jobs, steps, actions",
    "Publier une image Docker dans GitHub Container Registry",
    "Protéger le déploiement en production avec un environnement et des secrets"
  ],
  analogy: `<p>Dans une usine automobile, chaque voiture passe par une <strong>chaîne de contrôle</strong> : freins testés, phares vérifiés, peinture inspectée. Si un contrôle échoue, la voiture sort de la chaîne et ne part jamais chez le client.</p>
<p>Ton code, c'est la voiture. À chaque <code>git push</code>, la chaîne se met en route toute seule : compiler, tester, emballer, livrer. Et le dernier poste, la livraison au client, peut demander la <strong>signature d'un responsable</strong>.</p>`,
  lesson: `<h3>CI et CD</h3>
<p>L'<strong>intégration continue</strong> (CI, <em>Continuous Integration</em>) consiste à compiler et tester automatiquement chaque modification poussée sur le dépôt. Le but : détecter un problème quelques minutes après l'avoir créé, pas trois semaines plus tard. Le <strong>déploiement continu</strong> (CD, <em>Continuous Delivery/Deployment</em>) prolonge la chaîne : la version validée est emballée et livrée sur un serveur, sans manipulation manuelle.</p>
<div class="flow"><span>git push</span><span>Build + tests</span><span>Image Docker</span><span>Validation</span><span>Production</span></div>

<h3>Le vocabulaire de GitHub Actions</h3>
<p>GitHub Actions lit des fichiers YAML rangés dans <code>.github/workflows/</code> de ton dépôt. Chaque fichier est un <strong>workflow</strong>.</p>
<table>
<tr><th>Mot</th><th>Signification</th></tr>
<tr><td><code>on</code></td><td>Les <strong>déclencheurs</strong> : un push, une pull request, un horaire, un clic manuel (<code>workflow_dispatch</code>)</td></tr>
<tr><td><code>jobs</code></td><td>Des blocs de travail. Par défaut ils tournent en parallèle ; <code>needs</code> les enchaîne</td></tr>
<tr><td><code>runs-on</code></td><td>Le <strong>runner</strong> : la machine virtuelle neuve qui exécute le job (<code>ubuntu-latest</code>)</td></tr>
<tr><td><code>steps</code></td><td>Les étapes d'un job, exécutées dans l'ordre</td></tr>
<tr><td><code>uses</code></td><td>Appelle une <strong>action</strong> toute faite (<code>actions/checkout@v4</code>)</td></tr>
<tr><td><code>run</code></td><td>Lance une commande shell (<code>dotnet test</code>)</td></tr>
</table>
<p>Le runner part de zéro à chaque exécution : il faut récupérer le code (<code>actions/checkout</code>) et installer le SDK (<code>actions/setup-dotnet</code>). Si une étape échoue (code de sortie différent de 0), le job s'arrête et devient rouge.</p>

<h3>La CI d'OrderFlow</h3>
<p>Le cœur est simple : <code>dotnet restore</code>, <code>dotnet build</code>, <code>dotnet test</code>. On compile en <code>Release</code>, comme en production. On lance le workflow sur chaque push vers <code>main</code> et sur chaque pull request. Dans les paramètres du dépôt, une <strong>règle de protection de branche</strong> interdit ensuite de fusionner une pull request tant que la CI n'est pas verte. C'est le même principe que le <code>ng test</code> et le <code>ng build</code> qui tournent sur le dépôt de ton front.</p>

<h3>Publier l'image</h3>
<p>Une fois les tests passés sur <code>main</code>, un second job construit l'image Docker de la leçon précédente et la pousse dans un <strong>registre</strong>. GitHub en fournit un : <strong>GitHub Container Registry</strong> (<code>ghcr.io</code>). Le job s'authentifie avec <code>GITHUB_TOKEN</code>, un jeton créé automatiquement pour chaque exécution ; il suffit de lui donner la permission <code>packages: write</code>.</p>
<p>On étiquette l'image avec l'identifiant du commit (<code>github.sha</code>). Ainsi, chaque image correspond exactement à un état du code, et revenir en arrière consiste à redéployer l'image du commit précédent.</p>

<h3>Déployer sans risque</h3>
<p>Le dernier job déploie. Deux protections sont essentielles. Les <strong>secrets</strong> (identifiants Azure, chaînes de connexion) se rangent dans <em>Settings &gt; Secrets and variables &gt; Actions</em> et se lisent avec <code>\${{ secrets.NOM }}</code> : GitHub les masque dans les journaux. Les <strong>environnements</strong> (<code>environment: production</code>) permettent d'exiger l'approbation d'une personne avant que le job ne démarre.</p>
<div class="tip">Épingle la version des actions (<code>@v4</code>) et donne à chaque job le minimum de <code>permissions</code>. Un workflow est du code qui a accès à tes secrets : traite-le avec le même soin que le reste.</div>
<div class="note">Pour se connecter à Azure, préfère l'authentification <strong>OIDC</strong> (fédération d'identité, <code>permissions: id-token: write</code>) à un secret contenant un mot de passe : GitHub obtient un jeton temporaire à chaque exécution, il n'y a plus de secret longue durée à faire tourner. Et termine toujours le déploiement par un appel au health check : si la nouvelle version ne répond pas, le workflow échoue et tu le sais tout de suite.</div>`,
  examples: [
    {
      title: "La CI : compiler et tester à chaque push",
      code: `# Fichier : .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 10.0.x

      - name: Restaurer les packages
        run: dotnet restore

      - name: Compiler
        run: dotnet build --no-restore -c Release

      - name: Tester
        run: dotnet test --no-build -c Release --logger trx --results-directory TestResults

      - name: Garder les résultats de tests
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: TestResults`,
      output: `CI #27 : push sur main (a3f9c21)
✓ build-and-test   1m 18s
  ✓ Set up job
  ✓ Run actions/checkout@v4
  ✓ Run actions/setup-dotnet@v4
  ✓ Restaurer les packages
  ✓ Compiler
      Build succeeded.
          0 Warning(s)
          0 Error(s)
  ✓ Tester
      Passed!  - Failed:     0, Passed:    42, Skipped:     0, Total:    42, Duration: 3 s - OrderFlow.Tests.dll (net10.0)
  ✓ Garder les résultats de tests
  ✓ Complete job`,
      steps: [
        "<code>on: push / pull_request</code> : le workflow se déclenche sur un push vers <code>main</code> et sur toute pull request qui vise <code>main</code>.",
        "<code>runs-on: ubuntu-latest</code> : une machine Linux neuve, fournie par GitHub, pour chaque exécution.",
        "<code>uses: actions/checkout@v4</code> : récupère le code du dépôt sur le runner.",
        "<code>uses: actions/setup-dotnet@v4</code> avec <code>dotnet-version: 10.0.x</code> : installe la dernière version 10.0 du SDK.",
        "<code>run: dotnet build --no-restore -c Release</code> puis <code>dotnet test --no-build</code> : chaque étape réutilise le travail de la précédente au lieu de le refaire.",
        "<code>if: always()</code> : cette étape s'exécute même si les tests ont échoué, pour que tu puisses télécharger le rapport et voir lesquels."
      ]
    },
    {
      title: "Publier l'image Docker dans GitHub Container Registry",
      code: `# Fichier : .github/workflows/ci.yml (suite, dans jobs:)
  docker:
    needs: build-and-test                 # seulement si la CI est verte
    if: github.ref == 'refs/heads/main'   # pas pour les pull requests
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write                     # droit de pousser dans ghcr.io
    env:
      IMAGE: ghcr.io/mon-compte/orderflow-api   # en minuscules
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
            \${{ env.IMAGE }}:\${{ github.sha }}
            \${{ env.IMAGE }}:latest`,
      output: `CI #28 : push sur main (b7e0d44)
✓ build-and-test   1m 15s
✓ docker           2m 03s
  ✓ Run docker/login-action@v3
      Login Succeeded!
  ✓ Run docker/build-push-action@v6
      #14 pushing ghcr.io/mon-compte/orderflow-api:b7e0d44f1c2a9e8b3d6f5a4c7e1b0d9a8f2c3e6b
      #14 pushing ghcr.io/mon-compte/orderflow-api:latest
      #14 DONE 6.8s`,
      steps: [
        "<code>needs: build-and-test</code> : ce job attend le premier et ne démarre que s'il a réussi.",
        "<code>if: github.ref == 'refs/heads/main'</code> : sur une pull request, on teste, mais on ne publie pas d'image.",
        "<code>permissions: packages: write</code> : le minimum nécessaire pour écrire dans le registre de GitHub.",
        "<code>IMAGE: ghcr.io/mon-compte/orderflow-api</code> : remplace <code>mon-compte</code> par ton nom d'utilisateur ou d'organisation GitHub, <strong>en minuscules</strong> (le registre refuse les majuscules).",
        "<code>password: \${{ secrets.GITHUB_TOKEN }}</code> : le jeton créé automatiquement pour cette exécution. Rien à configurer.",
        "<code>tags: \${{ env.IMAGE }}:\${{ github.sha }}</code> : l'image porte l'identifiant du commit, plus l'étiquette <code>latest</code> pour la plus récente."
      ]
    },
    {
      title: "Déployer en production avec approbation",
      code: `# Fichier : .github/workflows/ci.yml (suite, dans jobs:)
  deploy:
    needs: docker
    runs-on: ubuntu-latest
    environment: production   # approbation manuelle réglée dans Settings > Environments
    permissions:
      id-token: write         # connexion à Azure par OIDC, sans mot de passe
      contents: read
    steps:
      - uses: azure/login@v2
        with:
          client-id: \${{ secrets.AZURE_CLIENT_ID }}
          tenant-id: \${{ secrets.AZURE_TENANT_ID }}
          subscription-id: \${{ secrets.AZURE_SUBSCRIPTION_ID }}

      - uses: azure/webapps-deploy@v3
        with:
          app-name: orderflow-api
          images: ghcr.io/mon-compte/orderflow-api:\${{ github.sha }}

      - name: Vérifier que la nouvelle version répond
        run: >
          curl --fail --silent --retry 10 --retry-delay 6 --retry-all-errors
          https://orderflow-api.azurewebsites.net/health/ready`,
      output: `CI #28 : push sur main (b7e0d44)
✓ build-and-test   1m 15s
✓ docker           2m 03s
⏸ deploy           En attente d'approbation (environnement production)
   kamal a approuvé le déploiement
✓ deploy           1m 41s
  ✓ Run azure/login@v2
      Login successful.
  ✓ Run azure/webapps-deploy@v3
      Successfully deployed web package to App Service.
  ✓ Vérifier que la nouvelle version répond
      Healthy`,
      steps: [
        "<code>needs: docker</code> : on ne déploie qu'une image qui a été construite et publiée avec succès.",
        "<code>environment: production</code> : si l'environnement exige un relecteur, le job reste en pause jusqu'à son approbation. Les secrets de l'environnement ne sont accessibles qu'à ce moment-là.",
        "<code>permissions: id-token: write</code> : autorise le job à demander un jeton OIDC que Azure accepte à la place d'un mot de passe.",
        "<code>uses: azure/login@v2</code> : connexion à Azure avec trois identifiants non secrets en soi, mais rangés en secrets par habitude.",
        "<code>uses: azure/webapps-deploy@v3</code> avec <code>images: …:\${{ github.sha }}</code> : on déploie l'image <em>exacte</em> qui vient d'être testée.",
        "<code>curl --fail … /health/ready</code> : <code>--fail</code> fait échouer la commande si la réponse n'est pas un succès ; les <code>--retry</code> laissent une minute à l'application pour démarrer."
      ],
      explain: "Pour revenir en arrière, il suffit de relancer le job deploy d'une exécution précédente : il redéploie l'image de ce commit-là."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lancer la CI à la main",
      prompt: `<p>Modifie le bloc <code>on:</code> de la CI pour qu'on puisse aussi la lancer à la main depuis l'onglet <em>Actions</em> de GitHub, et qu'elle ne se déclenche pas quand seul un fichier Markdown (<code>*.md</code>) a changé.</p>`,
      hint: `<p>Le déclencheur manuel s'appelle <code>workflow_dispatch</code>. Pour ignorer des fichiers : <code>paths-ignore</code>.</p>`,
      solution: `on:
  push:
    branches: [main]
    paths-ignore: ['**.md']
  pull_request:
    branches: [main]
    paths-ignore: ['**.md']
  workflow_dispatch:`
    },
    {
      level: "moyen",
      title: "Mettre en cache les packages NuGet",
      prompt: `<p>Chaque exécution télécharge à nouveau tous les packages NuGet. Active le cache intégré à <code>actions/setup-dotnet</code>. Il a besoin d'un fichier de verrouillage <code>packages.lock.json</code> : comment le générer ?</p>`,
      hint: `<p>Option <code>cache: true</code> de <code>setup-dotnet</code>. Le fichier de verrouillage se génère avec la propriété MSBuild <code>RestorePackagesWithLockFile</code>.</p>`,
      solution: `# Dans chaque .csproj (ou dans Directory.Build.props) :
# <PropertyGroup>
#   <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
# </PropertyGroup>
# puis dotnet restore et commit des fichiers packages.lock.json

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 10.0.x
          cache: true
          cache-dependency-path: '**/packages.lock.json'

      - name: Restaurer les packages
        run: dotnet restore --locked-mode`
    },
    {
      level: "difficile",
      title: "Tester avec un vrai SQL Server dans la CI",
      prompt: `<p>Tes tests d'intégration ont besoin d'un SQL Server. Ajoute au job <code>build-and-test</code> un <strong>service container</strong> SQL Server 2022, et passe la chaîne de connexion aux tests par une variable d'environnement <code>ConnectionStrings__OrderFlow</code>. Le mot de passe vient d'un secret <code>CI_SA_PASSWORD</code>.</p>`,
      hint: `<p>Sous le job : <code>services: sqlserver: image: … ports: - 1433:1433 env: …</code>. Le runner joint le service via <code>localhost,1433</code>.</p>`,
      solution: `  build-and-test:
    runs-on: ubuntu-latest
    services:
      sqlserver:
        image: mcr.microsoft.com/mssql/server:2022-latest
        env:
          ACCEPT_EULA: "Y"
          MSSQL_SA_PASSWORD: \${{ secrets.CI_SA_PASSWORD }}
        ports:
          - 1433:1433
    env:
      ConnectionStrings__OrderFlow: "Server=localhost,1433;Database=OrderFlow_Tests;User Id=sa;Password=\${{ secrets.CI_SA_PASSWORD }};TrustServerCertificate=True"
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: 10.0.x
      - run: dotnet test -c Release`
    }
  ],
  quiz: [
    {
      q: `Que fait <code>needs: build-and-test</code> sur un job ?`,
      options: ["Il copie les fichiers du job build-and-test", "Il attend la réussite de build-and-test avant de démarrer", "Il lance build-and-test une seconde fois"],
      answer: 1,
      why: `Sans <code>needs</code>, les jobs tournent en parallèle. Avec, le job attend le succès de celui qu'il cite et ne démarre pas s'il a échoué.`
    },
    {
      q: `Où ranger le mot de passe d'une base de production utilisé par un workflow ?`,
      options: ["Dans un secret GitHub, lu avec <code>\${{ secrets.NOM }}</code>", "En clair dans le YAML, le dépôt étant privé", "Dans <code>appsettings.json</code>"],
      answer: 0,
      why: `Les secrets sont chiffrés, masqués dans les journaux et jamais visibles dans l'historique Git. Un dépôt privé peut devenir public, être cloné ou fuiter.`
    },
    {
      q: `Pourquoi étiqueter l'image Docker avec <code>github.sha</code> plutôt qu'avec <code>latest</code> seulement ?`,
      options: ["Parce que <code>latest</code> est interdit sur ghcr.io", "Pour que l'image soit plus petite", "Pour savoir exactement quel code tourne et pouvoir revenir en arrière"],
      answer: 2,
      why: `<code>latest</code> change à chaque publication. L'identifiant du commit est unique et stable : il relie l'image à un état précis du code, et redéployer l'ancien SHA est un retour arrière fiable.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow</strong> : crée <code>.github/workflows/ci.yml</code> avec les trois jobs (<code>build-and-test</code>, <code>docker</code>, <code>deploy</code>). Si tu n'as pas d'abonnement Azure, garde seulement les deux premiers. Dans les réglages du dépôt, ajoute une règle de protection sur <code>main</code> qui exige que <code>build-and-test</code> soit vert avant toute fusion, puis ouvre une pull request avec un test volontairement cassé pour voir la CI bloquer.</p>`,
  resources: [
    { label: "GitHub Actions et .NET (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/devops/github-actions-overview" },
    { label: "Documentation GitHub Actions", url: "https://docs.github.com/fr/actions" }
  ]
});

// =====================================================================
// 6.8 Checklist de mise en production
// =====================================================================
window.COURSE.push({
  key: "prod-checklist",
  title: "La checklist avant de mettre en production",
  summary: "Tu sauras vérifier, point par point, qu'une API comme OrderFlow est prête pour la production : configuration, sécurité, base de données, observabilité, résilience et déploiement.",
  objectives: [
    "Passer en revue une API avec une checklist de production complète",
    "Valider la configuration au démarrage avec ValidateOnStart",
    "Configurer le pipeline HTTP pour la production (erreurs, HSTS, proxy, arrêt propre)",
    "Appliquer les migrations EF Core de façon sûre au déploiement"
  ],
  analogy: `<p>Avant chaque décollage, même après dix mille vols, le pilote déroule sa <strong>checklist</strong> : carburant, volets, instruments, portes. Ce n'est pas qu'il ait oublié comment piloter : c'est que la mémoire humaine flanche sous la pression, et qu'un oubli coûte cher.</p>
<p>Mettre une API en production, c'est pareil. La liste qui suit ne t'apprend presque rien de nouveau : elle t'empêche d'oublier.</p>`,
  lesson: `<h3>Pourquoi une checklist ?</h3>
<p>Tout au long du cours, tu as vu chaque brique séparément : configuration, EF Core, sécurité, tests, cache, logs, Docker. En production, une seule brique oubliée suffit à provoquer un incident : une stack trace envoyée au client, une migration qui verrouille une table, un secret dans le dépôt. Cette leçon rassemble tout dans une liste à dérouler avant chaque première mise en production, puis à relire à chaque évolution importante.</p>
<div class="flow"><span>Configuration</span><span>Sécurité</span><span>Données</span><span>Observabilité</span><span>Déploiement</span></div>

<h3>1. Configuration et secrets</h3>
<table>
<tr><th>Point</th><th>Comment le vérifier</th></tr>
<tr><td>Aucun secret dans le dépôt</td><td>Chercher <code>Password=</code>, clés d'API, tokens dans Git ; utiliser user-secrets en dev, variables d'environnement ou Key Vault en prod</td></tr>
<tr><td>Configuration validée au démarrage</td><td><code>ValidateDataAnnotations().ValidateOnStart()</code> sur chaque classe d'options</td></tr>
<tr><td>Bon environnement</td><td><code>ASPNETCORE_ENVIRONMENT=Production</code>, un <code>appsettings.Production.json</code> sans secret</td></tr>
</table>
<p>Valider la configuration au démarrage, c'est la règle « échouer tôt » : mieux vaut une API qui refuse de démarrer pendant le déploiement (et que la CI arrête) qu'une API qui démarre et plante au premier paiement, à 3 h du matin.</p>

<h3>2. Sécurité</h3>
<p>Les erreurs non gérées renvoient un <strong>ProblemDetails</strong> générique, jamais une stack trace (<code>UseExceptionHandler</code>). HTTPS est imposé et <code>UseHsts</code> est actif. CORS n'autorise que l'origine du front Angular. Chaque endpoint a son autorisation, et chaque requête « mes commandes » filtre bien par l'utilisateur connecté. Le rate limiting protège le login et les endpoints coûteux. Les dépendances n'ont pas de vulnérabilité connue : <code>dotnet list package --vulnerable</code>.</p>
<p>Si l'API est derrière un proxy (load balancer, ingress Kubernetes, App Service), c'est lui qui reçoit le HTTPS et transmet en HTTP. Sans <code>UseForwardedHeaders</code>, ton API croit que la requête est en HTTP et voit l'IP du proxy au lieu de celle du client : redirections incorrectes, rate limiting faussé.</p>

<h3>3. Base de données</h3>
<p>Les migrations EF Core ne s'appliquent <strong>pas</strong> au démarrage de l'API avec <code>Database.Migrate()</code> : avec trois instances qui démarrent en même temps, trois migrations se battent. On les applique une seule fois, comme étape du déploiement, avec un <strong>bundle de migrations</strong> (un exécutable généré par <code>dotnet ef migrations bundle</code>) ou un script SQL relu. Vérifie aussi les index sur les colonnes filtrées, la pagination de toutes les listes, et les <strong>sauvegardes</strong> : une sauvegarde jamais restaurée n'est pas une sauvegarde.</p>

<h3>4. Observabilité et résilience</h3>
<p>Niveau de logs à <code>Information</code> (et <code>Warning</code> pour <code>Microsoft.AspNetCore</code>), logs structurés sans donnée sensible, OpenTelemetry branché, health checks <code>live</code> et <code>ready</code>. Côté résilience : chaque <code>HttpClient</code> sortant a son <code>AddStandardResilienceHandler</code>, chaque <code>BackgroundService</code> son <code>try/catch</code>, et les données lues souvent sont en cache avec une expiration.</p>

<h3>5. Déploiement et exploitation</h3>
<p>L'image Docker est construite par la CI, étiquetée avec le commit, et tourne en utilisateur non privilégié. Le déploiement se termine par un appel au health check. Un <strong>retour arrière</strong> est possible en une action. Enfin, l'arrêt est propre : à chaque déploiement, l'ancienne version reçoit un signal d'arrêt ; ASP.NET Core termine alors les requêtes en cours pendant <code>HostOptions.ShutdownTimeout</code> avant de s'éteindre.</p>
<div class="tip">Imprime cette liste, ou mieux, transforme-la en modèle de pull request (<code>.github/pull_request_template.md</code>) avec des cases à cocher : la revue devient systématique.</div>
<div class="note">Une checklist n'est jamais finie. Après chaque incident, pose la question « quel point de la liste l'aurait évité ? » et ajoute-le. C'est le principe des <em>post-mortems</em> sans recherche de coupable : on améliore le système, pas les reproches.</div>`,
  examples: [
    {
      title: "Refuser de démarrer avec une configuration invalide",
      code: `// Fichier : Program.cs (projet web)
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Options;

var builder = WebApplication.CreateBuilder(args);
builder.Logging.ClearProviders();

// Simule un appsettings.Production.json mal rempli
builder.Configuration["Payment:ApiUrl"] = "pas-une-url";

builder.Services.AddOptions<PaymentOptions>()
    .Bind(builder.Configuration.GetSection("Payment"))
    .ValidateDataAnnotations()
    .ValidateOnStart(); // vérifie au démarrage, pas au premier paiement

try
{
    await using var app = builder.Build();
    await app.StartAsync();
    Console.WriteLine("Démarrage OK");
}
catch (OptionsValidationException ex)
{
    Console.WriteLine("Démarrage refusé :");
    foreach (string failure in ex.Failures) Console.WriteLine($"- {failure}");
}

class PaymentOptions
{
    [Required, Url] public string ApiUrl { get; set; } = "";
    [Required] public string ApiKey { get; set; } = "";
}`,
      output: `Démarrage refusé :
- DataAnnotation validation failed for 'PaymentOptions' members: 'ApiUrl' with the error: 'The ApiUrl field is not a valid fully-qualified http, https, or ftp URL.'.
- DataAnnotation validation failed for 'PaymentOptions' members: 'ApiKey' with the error: 'The ApiKey field is required.'.`,
      steps: [
        "<code>builder.Configuration[\"Payment:ApiUrl\"] = \"pas-une-url\";</code> : on simule une erreur de configuration ; <code>ApiKey</code>, lui, est carrément absent.",
        "<code>AddOptions&lt;PaymentOptions&gt;().Bind(…)</code> : relie la section <code>Payment</code> à la classe, comme tu l'as vu avec <code>IOptions</code>.",
        "<code>.ValidateDataAnnotations()</code> : applique les attributs <code>[Required]</code> et <code>[Url]</code> de la classe.",
        "<code>.ValidateOnStart()</code> : sans cette ligne, la validation n'aurait lieu qu'au premier accès à <code>IOptions&lt;PaymentOptions&gt;.Value</code>, donc au premier paiement d'un client.",
        "<code>await app.StartAsync();</code> : le démarrage lève <code>OptionsValidationException</code>. En vrai, on ne l'attrape pas : l'API s'arrête et le déploiement échoue, ce qui est exactement le but.",
        "<code>ex.Failures</code> : la liste de toutes les erreurs, pas seulement la première. On corrige tout d'un coup."
      ]
    },
    {
      title: "Un Program.cs prêt pour la production",
      code: `// Fichier : Program.cs (projet web)
using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();   // erreurs au format standard
builder.Services.AddHealthChecks();     // + AddDbContextCheck<OrderFlowDbContext>()
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    // L'API est derrière un proxy (load balancer, ingress) qui fait le HTTPS
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownIPNetworks.Clear(); // à restreindre au réseau du proxy si tu le connais
    o.KnownProxies.Clear();
});
builder.Services.Configure<HostOptions>(o => o.ShutdownTimeout = TimeSpan.FromSeconds(30));

var app = builder.Build();

app.UseForwardedHeaders();
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler(); // pas de stack trace envoyée au client
    app.UseHsts();
}

app.MapHealthChecks("/health/ready");
app.MapGet("/api/orders/{id:int}", (int id) =>
    id == 13 ? throw new InvalidOperationException("Connexion SQL perdue (Server=prod-sql-01)")
             : Results.Ok(new { id, status = "Pending" }));

app.Run();`,
      output: `GET /api/orders/13   (ASPNETCORE_ENVIRONMENT=Production)
HTTP/1.1 500 Internal Server Error
Content-Type: application/problem+json
{"type":"https://tools.ietf.org/html/rfc9110#section-15.6.1","title":"An error occurred while processing your request.","status":500,"traceId":"00-45dbae7f35884567e0e31825cb4b726b-9f1fe40fd25ff68a-00"}

GET /api/orders/7
HTTP/1.1 200 OK
{"id":7,"status":"Pending"}`,
      steps: [
        "<code>AddProblemDetails()</code> : toutes les erreurs sortent au format <code>application/problem+json</code>, avec un <code>traceId</code> pour retrouver la trace.",
        "<code>Configure&lt;ForwardedHeadersOptions&gt;(…)</code> : on fait confiance aux en-têtes <code>X-Forwarded-For</code> et <code>X-Forwarded-Proto</code> du proxy. Vider <code>KnownIPNetworks</code> accepte tous les proxys : à restreindre si ton API est joignable directement.",
        "<code>Configure&lt;HostOptions&gt;(o =&gt; o.ShutdownTimeout = …)</code> : à l'arrêt, l'API a 30 secondes pour finir les requêtes et les tâches de fond en cours.",
        "<code>app.UseForwardedHeaders();</code> : en premier dans le pipeline, pour que tous les middlewares suivants voient le vrai schéma et la vraie IP du client.",
        "<code>UseExceptionHandler()</code> et <code>UseHsts()</code> hors développement : le message « Server=prod-sql-01 » reste dans les logs serveur et n'atteint jamais le client.",
        "Réponse à <code>/api/orders/13</code> : un 500 générique avec <code>traceId</code>. Le support retrouve l'erreur détaillée dans les logs grâce à cet identifiant."
      ]
    },
    {
      title: "Appliquer les migrations avec un bundle",
      code: `# Dans la CI : fabriquer un exécutable qui contient toutes les migrations
dotnet tool install --global dotnet-ef
dotnet ef migrations bundle \\
    --project OrderFlow.Api \\
    --configuration Release \\
    --self-contained -r linux-x64 \\
    --output efbundle

# Au déploiement, AVANT de démarrer la nouvelle version de l'API
./efbundle --connection "$ORDERFLOW_CONNECTION"`,
      output: `$ dotnet ef migrations bundle --project OrderFlow.Api --configuration Release --self-contained -r linux-x64 --output efbundle
Build started...
Build succeeded.
Building bundle...
Done. Migrations Bundle: /home/runner/work/orderflow/orderflow/efbundle

$ ./efbundle --connection "$ORDERFLOW_CONNECTION"
Applying migration '20261102143012_AddOrderRowVersion'.
Applying migration '20261105091544_AddProductStockIndex'.
Done.`,
      steps: [
        "<code>dotnet tool install --global dotnet-ef</code> : installe l'outil EF Core sur le runner de la CI.",
        "<code>dotnet ef migrations bundle</code> : compile un exécutable autonome qui embarque toutes les migrations du projet.",
        "<code>--self-contained -r linux-x64</code> : le bundle n'a pas besoin du SDK .NET pour tourner sur la machine de déploiement Linux.",
        "<code>./efbundle --connection \"$ORDERFLOW_CONNECTION\"</code> : applique uniquement les migrations manquantes, en lisant la table <code>__EFMigrationsHistory</code>. La chaîne vient d'un secret, jamais du script.",
        "Ordre du déploiement : migrations d'abord, nouvelle version ensuite. Écris donc des migrations <strong>compatibles</strong> avec l'ancienne version (ajouter une colonne nullable plutôt que renommer), car elle tourne encore pendant quelques instants."
      ],
      explain: "Pour une base sensible, génère plutôt un script avec dotnet ef migrations script --idempotent et fais-le relire avant de l'exécuter."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Trouver les failles",
      prompt: `<p>Voici un extrait d'<code>appsettings.json</code> et de <code>Program.cs</code> d'une API en production. Liste au moins quatre problèmes : <code>"ConnectionStrings": { "OrderFlow": "Server=prod;User Id=sa;Password=P@ss123" }</code>, <code>"Logging": { "LogLevel": { "Default": "Trace" } }</code>, <code>app.UseDeveloperExceptionPage();</code> sans condition, et <code>policy.AllowAnyOrigin()</code> dans CORS.</p>`,
      hint: `<p>Pense secrets, volume de logs, fuite d'informations et origine des appels.</p>`,
      solution: `// 1. Mot de passe en clair dans appsettings.json, et compte sa :
//    -> variable d'environnement ou Key Vault, compte SQL dédié avec droits minimaux.
// 2. LogLevel Trace en production : volume énorme, coût, données sensibles possibles
//    -> "Default": "Information", "Microsoft.AspNetCore": "Warning".
// 3. UseDeveloperExceptionPage sans condition : stack trace envoyée aux clients
//    -> if (!app.Environment.IsDevelopment()) app.UseExceptionHandler();
// 4. AllowAnyOrigin : n'importe quel site peut appeler l'API depuis un navigateur
//    -> policy.WithOrigins("https://orderflow.example.com")`
    },
    {
      level: "moyen",
      title: "Valider des options avec une règle maison",
      prompt: `<p>Ajoute une classe <code>CleanupOptions</code> avec <code>IntervalMinutes</code> (int). Valide au démarrage qu'elle est comprise entre 1 et 1440 avec <code>[Range]</code>, et ajoute avec <code>.Validate(…)</code> une règle maison : en production, l'intervalle doit être d'au moins 5 minutes.</p>`,
      hint: `<p><code>.Validate(o =&gt; condition, "message")</code> ajoute une règle libre. Tu as accès à <code>builder.Environment.IsProduction()</code> au moment de l'enregistrement.</p>`,
      solution: `using System.ComponentModel.DataAnnotations;

var builder = WebApplication.CreateBuilder(args);
bool isProduction = builder.Environment.IsProduction();

builder.Services.AddOptions<CleanupOptions>()
    .Bind(builder.Configuration.GetSection("Cleanup"))
    .ValidateDataAnnotations()
    .Validate(o => !isProduction || o.IntervalMinutes >= 5,
        "En production, Cleanup:IntervalMinutes doit valoir au moins 5.")
    .ValidateOnStart();

var app = builder.Build();
app.Run();

class CleanupOptions
{
    [Range(1, 1440)]
    public int IntervalMinutes { get; set; } = 10;
}`
    },
    {
      level: "difficile",
      title: "Un modèle de pull request « prêt pour la prod »",
      prompt: `<p>Écris le fichier <code>.github/pull_request_template.md</code> d'OrderFlow : une checklist en cases à cocher, regroupée par thème (configuration, sécurité, données, observabilité, déploiement), avec au moins trois points par thème tirés de la leçon.</p>`,
      hint: `<p>Une case à cocher Markdown s'écrit <code>- [ ] texte</code>. GitHub préremplit la description de chaque nouvelle pull request avec ce fichier.</p>`,
      solution: `## Description
<!-- Que change cette PR, et pourquoi ? -->

## Checklist production

### Configuration
- [ ] Aucun secret ajouté au dépôt (appsettings, code, Dockerfile)
- [ ] Les nouvelles options sont validées avec ValidateOnStart
- [ ] Les nouvelles clés sont documentées pour chaque environnement

### Sécurité
- [ ] Les nouveaux endpoints ont une autorisation explicite
- [ ] Les données sont filtrées par utilisateur connecté (pas de BOLA)
- [ ] Les entrées sont validées, les erreurs renvoient un ProblemDetails

### Données
- [ ] La migration est compatible avec la version en cours d'exécution
- [ ] Les nouvelles colonnes filtrées ont un index
- [ ] Les nouvelles listes sont paginées

### Observabilité et résilience
- [ ] Logs structurés, sans donnée sensible
- [ ] Métrique ou trace ajoutée pour la nouvelle fonctionnalité
- [ ] Les appels HTTP sortants ont un handler de résilience

### Déploiement
- [ ] La CI est verte (build, tests, image Docker)
- [ ] Les health checks couvrent la nouvelle dépendance
- [ ] Le retour arrière est possible sans perte de données`
    }
  ],
  quiz: [
    {
      q: `Pourquoi éviter <code>Database.Migrate()</code> au démarrage de l'API en production ?`,
      options: ["Parce que la méthode n'existe qu'en développement", "Parce que plusieurs instances démarrent ensemble et appliqueraient les migrations en même temps", "Parce qu'elle supprime les données"],
      answer: 1,
      why: `Plusieurs instances qui migrent en parallèle peuvent se bloquer ou échouer, et l'API démarre avec des droits de modification du schéma. On migre une seule fois, comme étape du déploiement.`
    },
    {
      q: `Que garantit <code>ValidateOnStart()</code> ?`,
      options: ["Que la configuration est rechargée à chaud", "Que les secrets sont chiffrés", "Qu'une configuration invalide empêche l'API de démarrer"],
      answer: 2,
      why: `Sans elle, la validation est paresseuse : elle n'a lieu qu'au premier accès aux options. Avec, l'erreur apparaît au déploiement, pas devant un client.`
    },
    {
      q: `Ton API est derrière un load balancer qui gère le HTTPS. Que se passe-t-il sans <code>UseForwardedHeaders</code> ?`,
      options: ["L'API voit l'IP du proxy et croit que la requête est en HTTP", "Les requêtes sont refusées", "Rien, le proxy s'occupe de tout"],
      answer: 0,
      why: `Le proxy transmet en HTTP depuis sa propre IP. Sans lire <code>X-Forwarded-For</code> et <code>X-Forwarded-Proto</code>, l'API génère de mauvaises URL de redirection et le rate limiting par IP traite tous les clients comme un seul.`
    },
    {
      q: `En production, une exception non gérée doit renvoyer au client…`,
      options: ["la stack trace complète pour aider au débogage", "un ProblemDetails générique avec un <code>traceId</code>", "une page HTML d'erreur"],
      answer: 1,
      why: `La stack trace révèle des noms de serveurs, de tables et de fichiers. Le client reçoit un message neutre et un <code>traceId</code> ; le détail reste dans les logs, retrouvable grâce à cet identifiant.`
    }
  ],
  project: `<p>Dernière étape d'<strong>OrderFlow</strong> : déroule la checklist sur ton API. Ajoute <code>ValidateOnStart</code> à toutes tes classes d'options, mets à jour <code>Program.cs</code> comme dans l'exemple 2, ajoute l'étape « bundle de migrations » au workflow avant le job <code>deploy</code>, et crée le modèle de pull request. Puis note dans le <code>README.md</code> ce qui reste à faire avant une vraie mise en production : c'est ta propre liste de dette technique.</p>`,
  resources: [
    { label: "Configurer ASP.NET Core pour fonctionner avec des serveurs proxy (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/host-and-deploy/proxy-load-balancer" },
    { label: "Appliquer les migrations EF Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/ef/core/managing-schemas/migrations/applying" }
  ]
});
