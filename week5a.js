window.COURSE = window.COURSE || [];

window.COURSE.push({
  day: 31, week: 5,
  title: "Concurrence et multithreading",
  summary: "Comprendre ce qui se passe quand plusieurs threads touchent les mêmes données, et choisir le bon outil pour les protéger.",
  objectives: [
    "Expliquer la différence entre processus, thread, ThreadPool et Task",
    "Reproduire une race condition puis la corriger avec lock, Lock ou Interlocked",
    "Reconnaître un deadlock et l'éviter par l'ordre d'acquisition ou un timeout",
    "Utiliser correctement ConcurrentDictionary (et son piège GetOrAdd) et les collections immuables",
    "Paralléliser un calcul CPU avec Parallel.For et PLINQ, et savoir quand ne pas le faire"
  ],
  lesson: `<p><strong>Prérequis :</strong> le jour 17 (async/await). Tu dois être à l'aise avec <code>Task</code> et <code>async/await</code>.</p>

<h3>Processus, threads, ThreadPool et Task</h3>
<p>Un <strong>processus</strong> est ton application lancée : il a sa propre mémoire. À l'intérieur, un ou plusieurs <strong>threads</strong> exécutent du code en parallèle et <strong>partagent la même mémoire</strong>. C'est exactement là que naissent les problèmes : deux threads qui lisent et écrivent la même variable en même temps.</p>
<p>Créer un thread (<code>new Thread(...)</code>) coûte cher : environ 1 Mo de pile et un appel au système. .NET garde donc un <strong>ThreadPool</strong>, un réservoir de threads réutilisables. Une <code>Task</code> n'est pas un thread : c'est une <em>promesse de résultat</em>. <code>Task.Run</code> place du travail sur le ThreadPool ; une <code>Task</code> issue d'un <code>await</code> sur une requête HTTP n'occupe <strong>aucun</strong> thread pendant l'attente.</p>
<table>
<thead><tr><th></th><th>Thread</th><th>Task</th></tr></thead>
<tbody>
<tr><td>Niveau</td><td>Bas niveau, OS</td><td>Abstraction sur le ThreadPool</td></tr>
<tr><td>Coût</td><td>Élevé (pile dédiée)</td><td>Faible</td></tr>
<tr><td>Résultat / exceptions</td><td>À gérer à la main</td><td><code>Task&lt;T&gt;</code>, exceptions propagées par <code>await</code></td></tr>
<tr><td>Quand l'utiliser</td><td>Presque jamais (thread dédié très long)</td><td>Par défaut</td></tr>
</tbody>
</table>
<p>En TypeScript, tu n'as qu'un seul thread (l'event loop) : deux callbacks ne s'exécutent jamais <em>en même temps</em>. En C#, si. C'est le changement mental principal de cette journée.</p>

<h3>La race condition</h3>
<p><code>counter++</code> ressemble à une seule opération, mais le processeur fait trois étapes : <em>lire</em> la valeur, <em>ajouter 1</em>, <em>écrire</em>. Si deux threads lisent 41 en même temps, ils écrivent tous les deux 42 : un incrément est perdu. Avec un million d'incréments en parallèle, tu obtiens un résultat faux et différent à chaque exécution. C'est la <strong>race condition</strong> : le résultat dépend de l'ordre imprévisible d'exécution des threads.</p>
<p>Trois corrections, de la plus légère à la plus générale :</p>
<ul>
<li><strong>Interlocked</strong> : opérations atomiques sur un seul nombre (<code>Increment</code>, <code>Add</code>, <code>Exchange</code>, <code>CompareExchange</code>). Très rapide, mais limité à une variable.</li>
<li><strong>lock</strong> : une section critique où un seul thread entre à la fois. Protège plusieurs variables d'un coup.</li>
<li><strong>Ne rien partager</strong> : chaque thread calcule son résultat local, on combine à la fin (c'est ce que font PLINQ et les surcharges de <code>Parallel.For</code> avec état local).</li>
</ul>

<h3>lock, Monitor et le type Lock</h3>
<p><code>lock (obj) { ... }</code> est un raccourci pour <code>Monitor.Enter</code> / <code>Monitor.Exit</code> dans un <code>try/finally</code>. Le verrou est libéré même en cas d'exception. Depuis .NET 9, utilise le type dédié <code>System.Threading.Lock</code> :</p>
<pre><code>private readonly Lock _gate = new();

public void Add(decimal amount)
{
    lock (_gate) // le compilateur utilise Lock.EnterScope(), plus rapide que Monitor
    {
        _balance += amount;
        _history.Add(amount);
    }
}</code></pre>
<p>Règles d'or : verrouille un objet <code>private readonly</code> dédié, jamais <code>this</code>, un <code>string</code> ou un <code>Type</code> (n'importe quel code pourrait verrouiller le même objet) ; garde la section critique <strong>courte</strong> ; n'appelle jamais de code inconnu (événement, callback) en tenant un verrou. <code>Monitor.TryEnter(obj, timeout)</code> permet d'essayer de prendre un verrou avec un délai maximum.</p>

<h3>Le deadlock</h3>
<p>Le thread 1 tient le verrou A et attend B ; le thread 2 tient B et attend A. Aucun ne lâche : l'application est figée, sans erreur ni log. Les deux parades classiques :</p>
<ul>
<li><strong>Ordre d'acquisition global</strong> : prendre toujours les verrous dans le même ordre (par exemple par Id croissant). C'est la solution à préférer.</li>
<li><strong>Timeout</strong> : <code>Monitor.TryEnter</code> avec délai, puis abandon et nouvelle tentative. Ça transforme un blocage silencieux en erreur visible.</li>
</ul>

<h3>volatile : pourquoi l'éviter</h3>
<p><code>volatile</code> garantit qu'une lecture voit la dernière écriture d'un champ, mais <strong>ne rend pas</strong> <code>x++</code> atomique. Ses règles sont subtiles et presque toujours mal comprises. En pratique : utilise <code>lock</code>, <code>Interlocked</code> ou <code>Volatile.Read/Write</code> si tu sais exactement pourquoi. Si tu écris <code>volatile</code> dans du code métier, c'est probablement une erreur.</p>

<h3>Collections thread-safe et immutabilité</h3>
<p><code>List&lt;T&gt;</code> et <code>Dictionary&lt;K,V&gt;</code> <strong>ne sont pas thread-safe</strong> : deux écritures simultanées peuvent corrompre la structure interne (boucle infinie, exception étrange). Dans <code>System.Collections.Concurrent</code> :</p>
<ul>
<li><code>ConcurrentDictionary&lt;K,V&gt;</code> : <code>GetOrAdd</code>, <code>AddOrUpdate</code>, <code>TryRemove</code> sont atomiques.</li>
<li><code>ConcurrentQueue&lt;T&gt;</code>, <code>ConcurrentStack&lt;T&gt;</code>, <code>ConcurrentBag&lt;T&gt;</code>.</li>
</ul>
<p><strong>Le piège de GetOrAdd</strong> : la factory peut être appelée <em>plusieurs fois</em> pour la même clé si plusieurs threads arrivent en même temps. Une seule valeur est conservée, mais si la factory est coûteuse (requête SQL, appel HTTP), tu la paies plusieurs fois. La parade : stocker un <code>Lazy&lt;T&gt;</code>. Plusieurs <code>Lazy</code> peuvent être créés, mais un seul est conservé et seul celui-là exécute la factory.</p>
<pre><code>var cache = new ConcurrentDictionary&lt;string, Lazy&lt;Config&gt;&gt;();
Config config = cache.GetOrAdd("main", key =&gt; new Lazy&lt;Config&gt;(() =&gt; LoadConfig(key))).Value;</code></pre>
<p>Autre stratégie très efficace : <strong>l'immutabilité</strong>. Un objet qui ne change jamais peut être lu par mille threads sans verrou. Les records sans setter, <code>ImmutableArray&lt;T&gt;</code> et <code>ImmutableDictionary&lt;K,V&gt;</code> (<code>System.Collections.Immutable</code>) en sont la base. Pour « modifier », on construit une nouvelle version et on remplace la référence de façon atomique avec <code>Interlocked.Exchange</code> ou <code>ImmutableInterlocked.Update</code>.</p>
<p><code>ReaderWriterLockSlim</code> permet plusieurs lecteurs simultanés mais un seul écrivain. Il est utile quand les lectures sont très majoritaires, mais il est plus complexe et souvent pas plus rapide qu'un <code>lock</code> court. Mesure avant de l'adopter.</p>

<h3>Parallel.For, Parallel.ForEach et PLINQ</h3>
<p>Pour un travail <strong>CPU-bound</strong> (calcul, compression, traitement d'image), <code>Parallel.For</code> / <code>Parallel.ForEach</code> et <code>.AsParallel()</code> répartissent le travail sur tous les cœurs. Pour un travail <strong>I/O-bound</strong> (HTTP, base de données, fichiers), ils sont le mauvais outil : ils bloquent des threads qui ne font qu'attendre. Utilise <code>async/await</code> avec <code>Task.WhenAll</code> ou <code>Parallel.ForEachAsync</code> (vu au J32).</p>
<table>
<thead><tr><th>Outil</th><th>Pour quoi</th><th>Limite</th></tr></thead>
<tbody>
<tr><td><code>Interlocked</code></td><td>Un compteur, un échange atomique</td><td>Une seule variable</td></tr>
<tr><td><code>lock</code> / <code>Lock</code></td><td>Section critique synchrone</td><td>Pas de <code>await</code> à l'intérieur</td></tr>
<tr><td><code>Concurrent*</code></td><td>Collections partagées</td><td>Les opérations composées restent à protéger</td></tr>
<tr><td>Immuable</td><td>Données lues souvent, modifiées rarement</td><td>Copie à chaque modification</td></tr>
<tr><td><code>Parallel</code> / PLINQ</td><td>Calcul CPU sur une grosse collection</td><td>Inutile, voire nuisible, pour l'I/O</td></tr>
</tbody>
</table>

<h3>Pièges courants</h3>
<ul>
<li>Croire qu'une collection <code>Concurrent</code> rend tout le code sûr : <code>if (!dict.ContainsKey(k)) dict[k] = v;</code> reste une race (deux opérations). Utilise <code>TryAdd</code> ou <code>GetOrAdd</code>.</li>
<li>Paralléliser une petite boucle : le coût de coordination dépasse le gain. Mesure avec <code>Stopwatch</code> ou BenchmarkDotNet.</li>
<li>Modifier une <code>List&lt;T&gt;</code> depuis un <code>Parallel.ForEach</code>.</li>
<li>Faire <code>.Result</code> ou <code>.Wait()</code> sur une <code>Task</code> : risque de deadlock et de famine du ThreadPool.</li>
</ul>

<div class="note">La meilleure synchronisation est celle qu'on n'écrit pas. Avant d'ajouter un <code>lock</code>, demande-toi si l'état doit vraiment être partagé : un objet immuable, une donnée par requête (scoped) ou un seul propriétaire qui reçoit des messages (Channel, vu au J32) suppriment le problème à la source. Et quand tu verrouilles, documente ce que le verrou protège : <code>// _gate protège _balance et _history</code>.</div>`,
  examples: [
    {
      title: "Race condition sur un compteur, puis deux corrections",
      code: `// Bug : counter++ n'est pas atomique (lire, ajouter, écrire)
int counter = 0;
Parallel.For(0, 1_000_000, _ => counter++);
Console.WriteLine($"Sans protection : {counter:N0} (attendu 1 000 000)");

// Correction 1 : opération atomique
int atomic = 0;
Parallel.For(0, 1_000_000, _ => Interlocked.Increment(ref atomic));
Console.WriteLine($"Interlocked     : {atomic:N0}");

// Correction 2 : section critique avec le type Lock (.NET 9+)
var gate = new Lock();
int locked = 0;
Parallel.For(0, 1_000_000, _ =>
{
    lock (gate)
    {
        locked++;
    }
});
Console.WriteLine($"lock            : {locked:N0}");`,
      explain: "Lance-le plusieurs fois : la première ligne change à chaque exécution. <code>Interlocked</code> est le plus rapide pour un seul nombre, <code>lock</code> protège autant de variables que nécessaire."
    },
    {
      title: "Deadlock reproduit, puis évité par l'ordre d'acquisition",
      code: `var a = new object();
var b = new object();

// Bug : T1 prend A puis B, T2 prend B puis A
var t1 = Task.Run(() => { lock (a) { Thread.Sleep(100); lock (b) { Console.WriteLine("T1 terminé"); } } });
var t2 = Task.Run(() => { lock (b) { Thread.Sleep(100); lock (a) { Console.WriteLine("T2 terminé"); } } });

bool finished = Task.WaitAll([t1, t2], TimeSpan.FromSeconds(2));
Console.WriteLine(finished ? "Pas de blocage (chanceux)" : "Deadlock : les deux tâches s'attendent");

// Correction : même ordre partout (A puis B)
var c = new object();
var d = new object();
var t3 = Task.Run(() => { lock (c) { Thread.Sleep(100); lock (d) { Console.WriteLine("T3 terminé"); } } });
var t4 = Task.Run(() => { lock (c) { Thread.Sleep(100); lock (d) { Console.WriteLine("T4 terminé"); } } });
Task.WaitAll(t3, t4);

// Variante défensive : abandonner au lieu de bloquer pour toujours
if (Monitor.TryEnter(a, TimeSpan.FromMilliseconds(500)))
{
    try { Console.WriteLine("Verrou A obtenu"); }
    finally { Monitor.Exit(a); }
}
else
{
    Console.WriteLine("Verrou A indisponible après 500 ms : on abandonne proprement");
}`,
      explain: "Les tâches bloquées restent figées jusqu'à la fin du programme : c'est exactement ce qui arrive en production, sans aucune exception. <code>Monitor.TryEnter</code> transforme ce blocage silencieux en cas géré."
    },
    {
      title: "Le piège de ConcurrentDictionary.GetOrAdd et la parade Lazy<T>",
      code: `using System.Collections.Concurrent;

// Bug : la factory peut être exécutée plusieurs fois pour la même clé
int calls = 0;
var cache = new ConcurrentDictionary<string, string>();
Parallel.For(0, 20, i => cache.GetOrAdd("config", key =>
{
    Interlocked.Increment(ref calls);
    Thread.Sleep(50); // simule une requête coûteuse
    return "valeur";
}));
Console.WriteLine($"Sans Lazy : factory appelée {calls} fois");

// Correction : on stocke un Lazy<T>, une seule exécution garantie
int lazyCalls = 0;
var lazyCache = new ConcurrentDictionary<string, Lazy<string>>();
Parallel.For(0, 20, i =>
{
    string value = lazyCache.GetOrAdd("config", key => new Lazy<string>(() =>
    {
        Interlocked.Increment(ref lazyCalls);
        Thread.Sleep(50);
        return "valeur";
    })).Value;
});
Console.WriteLine($"Avec Lazy : factory appelée {lazyCalls} fois");`,
      explain: "Plusieurs objets <code>Lazy</code> peuvent être créés, mais un seul est stocké, et seul celui-là exécute son code (mode <code>ExecutionAndPublication</code> par défaut)."
    },
    {
      title: "Calcul CPU : séquentiel, PLINQ et Parallel.For avec état local",
      code: `using System.Diagnostics;

static bool IsPrime(int n)
{
    if (n < 2) return false;
    for (int i = 2; (long)i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}

const int Max = 5_000_000;

var sw = Stopwatch.StartNew();
int sequential = Enumerable.Range(1, Max).Count(IsPrime);
Console.WriteLine($"Séquentiel : {sequential} premiers en {sw.ElapsedMilliseconds} ms");

sw.Restart();
int plinq = Enumerable.Range(1, Max).AsParallel().Count(IsPrime);
Console.WriteLine($"PLINQ      : {plinq} premiers en {sw.ElapsedMilliseconds} ms");

// Parallel.For avec un compteur local par thread : un seul Interlocked par thread
sw.Restart();
int total = 0;
Parallel.For(1, Max + 1,
    () => 0,                                         // état local initial
    (n, _, local) => IsPrime(n) ? local + 1 : local, // travail sans partage
    local => Interlocked.Add(ref total, local));     // fusion finale
Console.WriteLine($"Parallel   : {total} premiers en {sw.ElapsedMilliseconds} ms");
Console.WriteLine($"Cœurs disponibles : {Environment.ProcessorCount}");`,
      explain: "Compile en Release (<code>dotnet run -c Release</code>) pour des mesures parlantes. Le gain dépend du nombre de cœurs. Le même code appliqué à des appels HTTP serait une mauvaise idée."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Compteur de vues thread-safe",
      prompt: `<p>La classe suivante est appelée par des centaines de requêtes simultanées et perd des vues. Rends-la thread-safe sans utiliser <code>lock</code>, puis prouve-le avec un <code>Parallel.For</code> de 100 000 appels.</p>
<pre><code>public sealed class PageStats
{
    private long _views;
    private long _uniqueVisitors;
    public void RegisterView(bool isNewVisitor)
    {
        _views++;
        if (isNewVisitor) _uniqueVisitors++;
    }
    public long Views =&gt; _views;
    public long UniqueVisitors =&gt; _uniqueVisitors;
}</code></pre>`,
      hint: `<p><code>Interlocked.Increment(ref champ)</code> pour écrire, <code>Interlocked.Read(ref champ)</code> pour lire un <code>long</code> de façon atomique (important sur une plateforme 32 bits).</p>`,
      solution: `var stats = new PageStats();
Parallel.For(0, 100_000, i => stats.RegisterView(isNewVisitor: i % 10 == 0));
Console.WriteLine($"Vues : {stats.Views} (attendu 100000)");
Console.WriteLine($"Visiteurs uniques : {stats.UniqueVisitors} (attendu 10000)");

public sealed class PageStats
{
    private long _views;
    private long _uniqueVisitors;

    public void RegisterView(bool isNewVisitor)
    {
        Interlocked.Increment(ref _views);
        if (isNewVisitor) Interlocked.Increment(ref _uniqueVisitors);
    }

    public long Views => Interlocked.Read(ref _views);
    public long UniqueVisitors => Interlocked.Read(ref _uniqueVisitors);
}

// Remarque : les deux compteurs sont sûrs individuellement, mais lus ensemble
// ils peuvent être momentanément incohérents. Si l'invariant entre les deux
// compte (ex. ratio exact), il faut un lock autour des deux.`
    },
    {
      level: "moyen",
      title: "Virements bancaires sans deadlock",
      prompt: `<p>Écris une classe <code>Account</code> (Id, Balance) et une méthode <code>Bank.Transfer(from, to, amount)</code> qui verrouille <strong>les deux comptes</strong> pendant le virement. Lance deux tâches qui font chacune 10 000 virements dans des sens opposés (A → B et B → A). Le programme ne doit jamais bloquer et la somme totale doit rester constante. Refuse un virement si le solde est insuffisant.</p>`,
      hint: `<p>Le deadlock vient de l'ordre d'acquisition. Trie les deux comptes par <code>Id</code> avant de verrouiller : <code>var (first, second) = from.Id &lt; to.Id ? (from, to) : (to, from);</code></p>`,
      solution: `var a = new Account(1, 1_000m);
var b = new Account(2, 1_000m);

var t1 = Task.Run(() => { for (int i = 0; i < 10_000; i++) Bank.Transfer(a, b, 1m); });
var t2 = Task.Run(() => { for (int i = 0; i < 10_000; i++) Bank.Transfer(b, a, 1m); });

bool finished = Task.WaitAll([t1, t2], TimeSpan.FromSeconds(10));
Console.WriteLine(finished ? "Terminé sans deadlock" : "Bloqué !");
Console.WriteLine($"A = {a.Balance}, B = {b.Balance}, total = {a.Balance + b.Balance} (attendu 2000)");

public sealed class Account(int id, decimal initialBalance)
{
    public int Id { get; } = id;
    public decimal Balance { get; private set; } = initialBalance;

    // Verrou dédié au compte : protège Balance
    internal Lock Gate { get; } = new();

    internal void Debit(decimal amount) => Balance -= amount;
    internal void Credit(decimal amount) => Balance += amount;
}

public static class Bank
{
    public static bool Transfer(Account from, Account to, decimal amount)
    {
        if (from == to) throw new ArgumentException("Virement vers le même compte");
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));

        // Ordre d'acquisition global : toujours le plus petit Id d'abord
        var (first, second) = from.Id < to.Id ? (from, to) : (to, from);

        lock (first.Gate)
        lock (second.Gate)
        {
            if (from.Balance < amount) return false; // solde insuffisant
            from.Debit(amount);
            to.Credit(amount);
            return true;
        }
    }
}`
    },
    {
      level: "difficile",
      title: "Memoizer thread-safe qui ne met pas les erreurs en cache",
      prompt: `<p>Écris une classe générique <code>Memoizer&lt;TKey, TValue&gt;</code> qui prend une fonction coûteuse <code>Func&lt;TKey, TValue&gt;</code> et expose <code>Get(key)</code>. Contraintes :</p>
<ul>
<li>pour une même clé, la fonction n'est exécutée <strong>qu'une seule fois</strong>, même avec 50 appels simultanés ;</li>
<li>si la fonction lève une exception, l'erreur est propagée à l'appelant mais <strong>n'est pas gardée en cache</strong> : l'appel suivant doit réessayer.</li>
</ul>
<p>Prouve les deux comportements dans un programme console.</p>`,
      hint: `<p><code>ConcurrentDictionary&lt;TKey, Lazy&lt;TValue&gt;&gt;</code>. Attention : un <code>Lazy</code> qui a échoué renvoie la même exception à chaque accès. En cas d'échec, retire ce <code>Lazy</code> précis avec <code>TryRemove(new KeyValuePair&lt;TKey, Lazy&lt;TValue&gt;&gt;(key, lazy))</code> pour ne pas supprimer un <code>Lazy</code> plus récent ajouté entre-temps.</p>`,
      solution: `using System.Collections.Concurrent;

// 1) Une seule exécution par clé
int calls = 0;
var memo = new Memoizer<int, string>(id =>
{
    Interlocked.Increment(ref calls);
    Thread.Sleep(100); // requête lente simulée
    return $"Produit {id}";
});
Parallel.For(0, 50, _ => memo.Get(42));
Console.WriteLine($"Exécutions pour la clé 42 : {calls} (attendu 1)");

// 2) Les erreurs ne sont pas mises en cache
int attempts = 0;
var flaky = new Memoizer<string, int>(key =>
{
    if (Interlocked.Increment(ref attempts) == 1) throw new InvalidOperationException("Panne réseau");
    return key.Length;
});
try { flaky.Get("orders"); }
catch (InvalidOperationException ex) { Console.WriteLine($"1er appel : {ex.Message}"); }
Console.WriteLine($"2e appel : {flaky.Get("orders")} (nouvel essai réussi)");

public sealed class Memoizer<TKey, TValue>(Func<TKey, TValue> factory) where TKey : notnull
{
    private readonly ConcurrentDictionary<TKey, Lazy<TValue>> _cache = new();

    public TValue Get(TKey key)
    {
        var lazy = _cache.GetOrAdd(key, k => new Lazy<TValue>(() => factory(k)));
        try
        {
            return lazy.Value;
        }
        catch
        {
            // Ne retire que CE Lazy : un autre thread a pu déjà en ajouter un nouveau
            _cache.TryRemove(new KeyValuePair<TKey, Lazy<TValue>>(key, lazy));
            throw;
        }
    }
}`
    }
  ],
  project: `<p><strong>Réservation de stock sans survente.</strong> Dans OrderFlow, plusieurs commandes peuvent réserver le même produit au même instant.</p>
<ol>
<li>Crée dans <code>OrderFlow.Infrastructure</code> un <code>InMemoryStockCache</code> (singleton) qui garde le stock disponible par <code>ProductId</code> dans un <code>ConcurrentDictionary&lt;Guid, int&gt;</code>.</li>
<li>Ajoute <code>bool TryReserve(Guid productId, int quantity)</code>. Utilise une boucle <code>TryGetValue</code> + <code>TryUpdate(key, newValue, comparisonValue)</code> (compare-and-swap), ou un <code>Lock</code> par produit, pour ne jamais passer sous zéro.</li>
<li>Écris un test xUnit qui lance 1 000 réservations d'une unité en parallèle sur un produit qui en a 100 : exactement 100 doivent réussir et le stock final doit valoir 0.</li>
<li>Dans un commentaire, note pourquoi ce cache ne suffit pas avec plusieurs instances de l'API, et que la vraie protection reste en base (concurrence optimiste, rappelée au J32).</li>
</ol>`,
  resources: [
    { label: "Bonnes pratiques du threading managé", url: "https://learn.microsoft.com/dotnet/standard/threading/managed-threading-best-practices" },
    { label: "L'instruction lock et le type Lock", url: "https://learn.microsoft.com/dotnet/csharp/language-reference/statements/lock" },
    { label: "Collections thread-safe", url: "https://learn.microsoft.com/dotnet/standard/collections/thread-safe/" },
    { label: "Task Parallel Library (TPL)", url: "https://learn.microsoft.com/dotnet/standard/parallel-programming/task-parallel-library-tpl" }
  ]
});

window.COURSE.push({
  day: 32, week: 5,
  title: "Concurrence asynchrone et coordination",
  summary: "Limiter, enchaîner et annuler des opérations asynchrones concurrentes, et éviter les pièges de concurrence propres à ASP.NET Core.",
  objectives: [
    "Remplacer un lock par SemaphoreSlim dans du code async et limiter le nombre d'appels simultanés",
    "Construire un pipeline producteur/consommateur avec System.Threading.Channels",
    "Produire et consommer un flux avec IAsyncEnumerable et le rendre annulable",
    "Orchestrer des tâches avec Parallel.ForEachAsync, Task.WhenAll, Task.WhenAny et des timeouts",
    "Identifier les problèmes de concurrence typiques d'une API ASP.NET Core"
  ],
  lesson: `<p><strong>Prérequis :</strong> le jour 19 (concurrence et multithreading). <code>BackgroundService</code>, utilisé dans la partie Channels, est approfondi au jour 58 : ici, il suffit de savoir que c'est une tâche qui tourne en arrière-plan dans l'application.</p>

<h3>Pourquoi on ne peut pas faire await dans un lock</h3>
<p>Un <code>lock</code> appartient au <em>thread</em> qui l'a pris. Après un <code>await</code>, la suite du code peut reprendre sur <strong>un autre thread</strong>, qui ne possède pas le verrou. Le compilateur refuse donc <code>await</code> dans un <code>lock</code> (erreur CS1996). La solution est <code>SemaphoreSlim</code>, qui ne dépend pas du thread et propose <code>WaitAsync</code> :</p>
<pre><code>private readonly SemaphoreSlim _gate = new(1, 1); // 1 seul à la fois = verrou async

public async Task RefreshAsync(CancellationToken ct)
{
    await _gate.WaitAsync(ct);
    try
    {
        _data = await LoadAsync(ct);
    }
    finally
    {
        _gate.Release(); // toujours dans finally
    }
}</code></pre>

<h3>SemaphoreSlim pour limiter le débit</h3>
<p>Avec un compteur supérieur à 1, <code>SemaphoreSlim</code> devient un <strong>limiteur</strong> : <code>new SemaphoreSlim(5)</code> laisse passer au maximum 5 opérations à la fois. C'est l'outil classique pour ne pas lancer 1 000 appels HTTP simultanés vers un partenaire qui accepte 5 connexions. Pense au <code>Release()</code> dans un <code>finally</code> : un seul oubli, et le sémaphore « perd » une place définitivement.</p>

<h3>Channels : producteur / consommateur</h3>
<p><code>System.Threading.Channels</code> fournit une file asynchrone thread-safe. Un ou plusieurs <strong>producteurs</strong> écrivent (<code>Writer.WriteAsync</code>), un ou plusieurs <strong>consommateurs</strong> lisent (<code>Reader.ReadAllAsync</code>). Quand le producteur a fini, il appelle <code>Writer.Complete()</code> et les boucles <code>await foreach</code> des consommateurs se terminent proprement.</p>
<ul>
<li><strong>Unbounded</strong> (<code>Channel.CreateUnbounded</code>) : pas de limite. Si les consommateurs sont plus lents, la mémoire grossit sans fin.</li>
<li><strong>Bounded</strong> (<code>Channel.CreateBounded(capacité)</code>) : quand la file est pleine, <code>WriteAsync</code> attend. C'est la <strong>backpressure</strong> : le producteur ralentit au rythme des consommateurs. Choix par défaut en production.</li>
</ul>
<p>Dans ASP.NET Core, le schéma typique : un endpoint écrit un message dans un Channel singleton et répond tout de suite <code>202 Accepted</code> ; un <code>BackgroundService</code> lit le Channel et fait le travail lent.</p>
<pre><code>public sealed class OrderQueue
{
    private readonly Channel&lt;Guid&gt; _channel = Channel.CreateBounded&lt;Guid&gt;(100);
    public ValueTask EnqueueAsync(Guid id, CancellationToken ct) =&gt; _channel.Writer.WriteAsync(id, ct);
    public IAsyncEnumerable&lt;Guid&gt; ReadAllAsync(CancellationToken ct) =&gt; _channel.Reader.ReadAllAsync(ct);
}

public sealed class OrderProcessor(OrderQueue queue, IServiceScopeFactory scopes) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var id in queue.ReadAllAsync(stoppingToken))
        {
            using var scope = scopes.CreateScope(); // un DbContext neuf par message
            var handler = scope.ServiceProvider.GetRequiredService&lt;IProcessOrder&gt;();
            await handler.HandleAsync(id, stoppingToken);
        }
    }
}</code></pre>
<p>Limite à connaître : un Channel vit en mémoire. Si le processus redémarre, les messages en attente sont perdus. Pour des messages qui ne doivent jamais se perdre, il faut un broker (RabbitMQ, J23) ou le pattern outbox.</p>

<h3>IAsyncEnumerable : des flux asynchrones</h3>
<p>Une méthode <code>async IAsyncEnumerable&lt;T&gt;</code> peut faire <code>await</code> <em>et</em> <code>yield return</code> : elle produit les éléments au fur et à mesure (page par page depuis une API, ligne par ligne depuis la base) au lieu de tout charger en mémoire. On la consomme avec <code>await foreach</code>. EF Core expose ce mode avec <code>AsAsyncEnumerable()</code>, et ASP.NET Core sait renvoyer un <code>IAsyncEnumerable&lt;T&gt;</code> en JSON en streaming.</p>
<p>Pour l'annulation, ajoute un paramètre <code>CancellationToken</code> marqué <code>[EnumeratorCancellation]</code> : le jeton passé via <code>.WithCancellation(token)</code> par l'appelant y arrive automatiquement.</p>

<h3>Orchestrer plusieurs tâches</h3>
<table>
<thead><tr><th>Besoin</th><th>Outil</th></tr></thead>
<tbody>
<tr><td>Lancer N appels et attendre tous les résultats</td><td><code>Task.WhenAll</code></td></tr>
<tr><td>Traiter une grosse liste avec au plus K appels en parallèle</td><td><code>Parallel.ForEachAsync</code> + <code>MaxDegreeOfParallelism</code></td></tr>
<tr><td>Prendre le premier résultat disponible</td><td><code>Task.WhenAny</code>, puis annuler les autres</td></tr>
<tr><td>Abandonner après un délai</td><td><code>CancellationTokenSource.CancelAfter</code> ou <code>task.WaitAsync(timeout)</code></td></tr>
<tr><td>Limiter un endroit précis du code</td><td><code>SemaphoreSlim</code></td></tr>
<tr><td>Découpler producteurs et consommateurs</td><td><code>Channel&lt;T&gt;</code></td></tr>
</tbody>
</table>
<p>Attention à <code>Task.WhenAll</code> sur 10 000 éléments : il lance <em>tout</em> en même temps. Pour un grand nombre d'éléments, <code>Parallel.ForEachAsync</code> plafonne naturellement la concurrence. Note aussi que <code>Task.WhenAny</code> n'annule rien : les tâches perdantes continuent tant que tu ne leur envoies pas un <code>CancellationToken</code> annulé.</p>

<h3>Concurrence dans ASP.NET Core</h3>
<ul>
<li><strong>DbContext n'est pas thread-safe.</strong> Deux requêtes EF lancées en parallèle sur le même <code>DbContext</code> (<code>Task.WhenAll</code> sur deux <code>ToListAsync</code>) lèvent « A second operation was started on this context ». Fais-les en séquence, ou crée un contexte par opération avec <code>IDbContextFactory&lt;T&gt;</code>.</li>
<li><strong>Les singletons sont partagés par toutes les requêtes.</strong> Un champ <code>List&lt;T&gt;</code> ou <code>Dictionary</code> modifiable dans un singleton est une race condition en attente. Utilise des collections concurrentes, de l'immuable, ou passe le service en scoped.</li>
<li><strong>Captive dependency.</strong> Un singleton qui reçoit un service scoped (comme un <code>DbContext</code>) le garde à vie : il est alors partagé entre requêtes et threads. Dans un singleton ou un <code>BackgroundService</code>, crée un scope par unité de travail avec <code>IServiceScopeFactory</code>.</li>
<li><strong>Plusieurs instances de l'API.</strong> Un <code>lock</code> ne protège qu'un seul processus. Dès que tu as deux instances derrière un load balancer, la vraie protection se fait en base.</li>
</ul>

<h3>Rappel : concurrence optimiste en base</h3>
<p>Deux utilisateurs modifient la même commande. Avec une propriété <code>[Timestamp] public byte[] RowVersion { get; set; }</code> (SQL Server) ou un jeton configuré avec <code>IsConcurrencyToken()</code>, EF Core ajoute <code>WHERE RowVersion = @ancienne</code> à l'<code>UPDATE</code>. Si quelqu'un a modifié la ligne entre-temps, aucune ligne n'est mise à jour et EF lève <code>DbUpdateConcurrencyException</code>. Tu réponds alors <code>409 Conflict</code> ou tu recharges et réessaies.</p>

<h3>Questions d'entretien fréquentes</h3>
<ul>
<li>Pourquoi <code>await</code> est-il interdit dans un <code>lock</code>, et que mets-tu à la place ?</li>
<li>Différence entre un Channel bounded et unbounded ? Qu'est-ce que la backpressure ?</li>
<li>Comment limiter à 10 le nombre d'appels HTTP simultanés ?</li>
<li>Pourquoi ne pas utiliser <code>Parallel.ForEach</code> pour des appels HTTP ?</li>
<li>Que se passe-t-il si on utilise un DbContext dans un singleton ?</li>
</ul>

<div class="note">En entretien comme en revue de code, la question senior n'est pas « quel outil de synchronisation ? » mais « où vit cet état, combien d'instances le partagent, et que se passe-t-il si le processus redémarre ? ». Un <code>SemaphoreSlim</code> ou un Channel règle la concurrence <em>dans un processus</em>. Entre plusieurs instances, il faut la base (concurrence optimiste, contraintes d'unicité), un verrou distribué ou un broker de messages.</div>`,
  examples: [
    {
      title: "SemaphoreSlim : limiter à 3 appels simultanés",
      code: `var throttle = new SemaphoreSlim(3); // au plus 3 appels en même temps
var stats = new object();
int current = 0, max = 0;

async Task CallPartnerApiAsync(int id)
{
    await throttle.WaitAsync();
    try
    {
        lock (stats) { current++; max = Math.Max(max, current); } // pas d'await dans ce lock
        Console.WriteLine($"Appel {id} démarré ({current} en cours)");
        await Task.Delay(300); // simule un appel HTTP
    }
    finally
    {
        lock (stats) { current--; }
        throttle.Release(); // toujours dans finally
    }
}

await Task.WhenAll(Enumerable.Range(1, 10).Select(id => CallPartnerApiAsync(id)));
Console.WriteLine($"Concurrence maximale observée : {max} (limite 3)");

// Ce code ne compile pas : CS1996, await interdit dans un lock
// lock (stats) { await Task.Delay(10); }`,
      explain: "Sans le sémaphore, les 10 appels partiraient en même temps. Le <code>lock</code> sert ici seulement à mettre à jour les statistiques : il ne contient aucun <code>await</code>."
    },
    {
      title: "Channel bounded : un producteur, trois consommateurs",
      code: `using System.Threading.Channels;

var channel = Channel.CreateBounded<int>(new BoundedChannelOptions(5)
{
    FullMode = BoundedChannelFullMode.Wait // le producteur attend quand la file est pleine
});

var producer = Task.Run(async () =>
{
    for (int i = 1; i <= 20; i++)
    {
        await channel.Writer.WriteAsync(i);
        Console.WriteLine($"Produit : commande {i}");
    }
    channel.Writer.Complete(); // signale la fin aux consommateurs
});

var consumers = Enumerable.Range(1, 3).Select(workerId => Task.Run(async () =>
{
    await foreach (var orderId in channel.Reader.ReadAllAsync())
    {
        await Task.Delay(150); // traitement lent
        Console.WriteLine($"   Worker {workerId} a traité la commande {orderId}");
    }
})).ToArray();

await producer;
await Task.WhenAll(consumers);
Console.WriteLine("Toutes les commandes sont traitées");`,
      explain: "Observe la sortie : le producteur avance vite au début, puis il est freiné à la vitesse des consommateurs une fois la file pleine (5 éléments). C'est la backpressure."
    },
    {
      title: "IAsyncEnumerable annulable avec un timeout",
      code: `using System.Runtime.CompilerServices;

using var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(1)); // on abandonne après 1 seconde

try
{
    await foreach (var orderId in GetOrdersPageByPageAsync().WithCancellation(cts.Token))
    {
        Console.WriteLine($"Commande {orderId}");
    }
}
catch (OperationCanceledException)
{
    Console.WriteLine("Lecture arrêtée : délai dépassé");
}

// Simule une API paginée : chaque page arrive après 300 ms
static async IAsyncEnumerable<int> GetOrdersPageByPageAsync(
    [EnumeratorCancellation] CancellationToken ct = default)
{
    for (int page = 0; ; page++)
    {
        await Task.Delay(300, ct); // le jeton annule l'attente en cours
        for (int i = 1; i <= 3; i++)
            yield return page * 3 + i;
    }
}`,
      explain: "Grâce à <code>[EnumeratorCancellation]</code>, le jeton passé par <code>WithCancellation</code> arrive dans la méthode. Les éléments sont affichés dès qu'ils arrivent, sans attendre la fin du flux."
    },
    {
      title: "Parallel.ForEachAsync, WhenAny et WaitAsync",
      code: `using System.Collections.Concurrent;

// 1) Traiter 12 produits, au plus 4 en parallèle
var results = new ConcurrentBag<string>(); // List<T> ne serait pas sûre ici
await Parallel.ForEachAsync(Enumerable.Range(1, 12),
    new ParallelOptions { MaxDegreeOfParallelism = 4 },
    async (id, ct) =>
    {
        await Task.Delay(Random.Shared.Next(100, 400), ct);
        results.Add($"produit {id}");
    });
Console.WriteLine($"{results.Count} produits synchronisés");

// 2) Timeout avec WhenAny
async Task<string> SlowServiceAsync()
{
    await Task.Delay(3000);
    return "réponse lente";
}

var call = SlowServiceAsync();
var first = await Task.WhenAny(call, Task.Delay(500));
Console.WriteLine(first == call ? await call : "WhenAny : timeout après 500 ms");

// 3) Même idée, plus lisible (.NET 6+)
try
{
    var response = await SlowServiceAsync().WaitAsync(TimeSpan.FromMilliseconds(500));
    Console.WriteLine(response);
}
catch (TimeoutException)
{
    Console.WriteLine("WaitAsync : timeout après 500 ms");
}`,
      explain: "Ni <code>WhenAny</code> ni <code>WaitAsync</code> n'arrêtent l'opération lente : ils arrêtent seulement d'<em>attendre</em>. Pour vraiment l'interrompre, passe-lui un <code>CancellationToken</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Corriger l'erreur CS1996 dans un cache de jeton",
      prompt: `<p>Ce code ne compile pas, et il doit garantir qu'un seul appel à <code>FetchTokenAsync</code> a lieu même si 50 requêtes demandent le jeton en même temps.</p>
<pre><code>public sealed class TokenProvider
{
    private readonly object _gate = new();
    private string? _token;
    private DateTime _expiresAt;

    public async Task&lt;string&gt; GetTokenAsync()
    {
        lock (_gate)
        {
            if (_token is null || DateTime.UtcNow &gt;= _expiresAt)
            {
                _token = await FetchTokenAsync(); // CS1996
                _expiresAt = DateTime.UtcNow.AddMinutes(5);
            }
            return _token;
        }
    }
}</code></pre>
<p>Corrige-le, puis prouve avec 50 appels simultanés que le jeton n'est récupéré qu'une fois.</p>`,
      hint: `<p><code>SemaphoreSlim(1, 1)</code>, <code>await _gate.WaitAsync()</code>, et <code>Release()</code> dans un <code>finally</code>.</p>`,
      solution: `var provider = new TokenProvider();
var tokens = await Task.WhenAll(Enumerable.Range(0, 50).Select(_ => provider.GetTokenAsync()));
Console.WriteLine($"Jetons distincts : {tokens.Distinct().Count()} (attendu 1)");
Console.WriteLine($"Appels au serveur : {provider.FetchCount} (attendu 1)");

public sealed class TokenProvider
{
    private readonly SemaphoreSlim _gate = new(1, 1); // _gate protège _token et _expiresAt
    private string? _token;
    private DateTime _expiresAt;
    private int _fetchCount;

    public int FetchCount => _fetchCount;

    public async Task<string> GetTokenAsync(CancellationToken ct = default)
    {
        await _gate.WaitAsync(ct);
        try
        {
            if (_token is null || DateTime.UtcNow >= _expiresAt)
            {
                _token = await FetchTokenAsync(ct);
                _expiresAt = DateTime.UtcNow.AddMinutes(5);
            }
            return _token;
        }
        finally
        {
            _gate.Release();
        }
    }

    private async Task<string> FetchTokenAsync(CancellationToken ct)
    {
        Interlocked.Increment(ref _fetchCount);
        await Task.Delay(200, ct); // simule l'appel au serveur d'identité
        return Guid.NewGuid().ToString("N");
    }
}`
    },
    {
      level: "moyen",
      title: "Pipeline de commandes avec Channel",
      prompt: `<p>Écris un programme console avec :</p>
<ul>
<li>un record <code>Order(int Id, decimal Total)</code> ;</li>
<li>un producteur qui génère 100 commandes dans un Channel <strong>bounded</strong> de capacité 10 ;</li>
<li>3 consommateurs qui « traitent » chaque commande (20 ms) et additionnent le chiffre d'affaires ;</li>
<li>à la fin, l'affichage du nombre de commandes traitées (100) et du total exact.</li>
</ul>
<p>Attention : le total est un <code>decimal</code>, et <code>Interlocked</code> ne gère pas ce type.</p>`,
      hint: `<p>Compte avec <code>Interlocked.Increment</code>. Pour le <code>decimal</code>, chaque consommateur peut garder un sous-total local, puis l'ajouter sous un <code>lock</code> à la fin de sa boucle. N'oublie pas <code>Writer.Complete()</code>, sinon les consommateurs attendent pour toujours.</p>`,
      solution: `using System.Threading.Channels;

var channel = Channel.CreateBounded<Order>(10);
int processed = 0;
decimal revenue = 0m;
var revenueGate = new Lock(); // protège revenue

var producer = Task.Run(async () =>
{
    for (int i = 1; i <= 100; i++)
        await channel.Writer.WriteAsync(new Order(i, i * 10m));
    channel.Writer.Complete();
});

var consumers = Enumerable.Range(1, 3).Select(_ => Task.Run(async () =>
{
    decimal localTotal = 0m; // sous-total sans partage
    await foreach (var order in channel.Reader.ReadAllAsync())
    {
        await Task.Delay(20); // traitement simulé
        localTotal += order.Total;
        Interlocked.Increment(ref processed);
    }
    lock (revenueGate) { revenue += localTotal; } // une seule fusion par consommateur
})).ToArray();

await producer;
await Task.WhenAll(consumers);

Console.WriteLine($"Commandes traitées : {processed} (attendu 100)");
Console.WriteLine($"Chiffre d'affaires : {revenue} (attendu 50500)");

record Order(int Id, decimal Total);`
    },
    {
      level: "difficile",
      title: "Le miroir le plus rapide, avec annulation et timeout global",
      prompt: `<p>Un fichier est disponible sur trois miroirs (eu, us, asia) aux temps de réponse variables. Écris <code>FetchFastestAsync(mirrors, timeout)</code> qui :</p>
<ul>
<li>interroge les trois miroirs en parallèle ;</li>
<li>renvoie la <strong>première réponse réussie</strong> et <strong>annule</strong> les appels encore en cours ;</li>
<li>ignore un miroir qui échoue et attend les autres ;</li>
<li>lève une <code>TimeoutException</code> si aucun miroir n'a répondu dans le délai.</li>
</ul>
<p>Teste avec des délais de 300, 100 et 500 ms (résultat attendu : us), puis avec un timeout de 50 ms.</p>`,
      hint: `<p>Un seul <code>CancellationTokenSource(timeout)</code> partagé par tous les appels. Boucle sur <code>Task.WhenAny</code> en retirant la tâche terminée de la liste ; si elle a réussi (<code>IsCompletedSuccessfully</code>), appelle <code>cts.Cancel()</code> et renvoie son résultat.</p>`,
      solution: `(string Name, int DelayMs)[] mirrors = [("eu", 300), ("us", 100), ("asia", 500)];

Console.WriteLine(await FetchFastestAsync(mirrors, TimeSpan.FromSeconds(2)));

try
{
    await FetchFastestAsync(mirrors, TimeSpan.FromMilliseconds(50));
}
catch (TimeoutException ex)
{
    Console.WriteLine(ex.Message);
}

static async Task<string> FetchFromMirrorAsync(string mirror, int delayMs, CancellationToken ct)
{
    await Task.Delay(delayMs, ct); // l'annulation interrompt l'attente
    Console.WriteLine($"  {mirror} a répondu");
    return $"Fichier reçu depuis {mirror}";
}

static async Task<string> FetchFastestAsync(
    IReadOnlyList<(string Name, int DelayMs)> mirrors, TimeSpan timeout)
{
    using var cts = new CancellationTokenSource(timeout); // timeout global
    var pending = mirrors
        .Select(m => FetchFromMirrorAsync(m.Name, m.DelayMs, cts.Token))
        .ToList();

    while (pending.Count > 0)
    {
        var done = await Task.WhenAny(pending);
        pending.Remove(done);

        if (done.IsCompletedSuccessfully)
        {
            cts.Cancel(); // on arrête les miroirs plus lents
            return await done;
        }
        // échec ou annulation de ce miroir : on attend les suivants
    }

    throw new TimeoutException($"Aucun miroir n'a répondu en {timeout.TotalMilliseconds} ms");
}`
    }
  ],
  project: `<p><strong>File de traitement des commandes et export en streaming.</strong></p>
<ol>
<li>Crée un <code>OrderProcessingQueue</code> singleton qui encapsule un <code>Channel.CreateBounded&lt;Guid&gt;(100)</code>.</li>
<li>Modifie <code>POST /orders/{id}/confirm</code> : il écrit l'Id dans la file et renvoie <code>202 Accepted</code> au lieu de traiter la commande dans la requête.</li>
<li>Écris un <code>OrderProcessingWorker : BackgroundService</code> qui lit la file avec <code>await foreach</code>, crée un scope par commande (<code>IServiceScopeFactory</code>) et appelle le handler de confirmation. Logue les erreurs sans arrêter la boucle.</li>
<li>Ajoute <code>GET /orders/export</code> qui renvoie un <code>IAsyncEnumerable&lt;OrderDto&gt;</code> lu avec <code>AsAsyncEnumerable()</code> d'EF Core. Vérifie dans les outils réseau d'Angular ou avec <code>curl</code> que la réponse arrive en streaming.</li>
<li>Ajoute un <code>RowVersion</code> sur <code>Order</code>, attrape <code>DbUpdateConcurrencyException</code> dans le handler de mise à jour et renvoie <code>409 Conflict</code>.</li>
</ol>`,
  resources: [
    { label: "System.Threading.Channels", url: "https://learn.microsoft.com/dotnet/core/extensions/channels" },
    { label: "SemaphoreSlim", url: "https://learn.microsoft.com/dotnet/api/system.threading.semaphoreslim" },
    { label: "Générer et consommer des flux asynchrones", url: "https://learn.microsoft.com/dotnet/csharp/asynchronous-programming/generate-consume-asynchronous-stream" },
    { label: "Services scoped dans un BackgroundService", url: "https://learn.microsoft.com/dotnet/core/extensions/scoped-service" },
    { label: "Gestion des conflits de concurrence avec EF Core", url: "https://learn.microsoft.com/ef/core/saving/concurrency" }
  ]
});
