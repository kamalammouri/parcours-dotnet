window.COURSE = window.COURSE || [];

// =====================================================================
// 6.x Préparer un entretien de développeur .NET senior
// =====================================================================
window.COURSE.push({
  key: "prod-interview",
  title: "Préparer un entretien de développeur .NET senior",
  summary: "Tu sauras répondre clairement aux questions classiques d'un entretien .NET senior, thème par thème, et appuyer tes réponses sur OrderFlow.",
  objectives: [
    "Connaître les questions types par thème : C#, mémoire, async, EF Core, ASP.NET Core, architecture",
    "Structurer une réponse courte : définition, exemple, piège, compromis",
    "Illustrer chaque réponse avec un cas vécu sur OrderFlow",
    "Préparer l'exercice de conception (system design) sans paniquer"
  ],
  analogy: `<p>Un entretien, c'est comme un <strong>examen du permis de conduire</strong>. L'examinateur ne veut pas que tu récites le code de la route : il veut te voir <em>conduire</em>, expliquer pourquoi tu ralentis à ce carrefour, et réagir à l'imprévu.</p>
<p>Pour un poste senior, c'est pareil : on attend moins une définition parfaite qu'un <strong>raisonnement</strong> (« ça dépend de… ») appuyé sur des situations que tu as réellement vécues.</p>`,
  lesson: `<h3>Ce qu'on attend d'un senior</h3>
<p>Un junior sait <em>comment</em> faire. Un senior sait <em>pourquoi</em>, <em>quand ne pas le faire</em> et <em>ce que ça coûte</em>. Chaque question technique est un prétexte pour vérifier ça. Le recruteur creuse toujours avec « et si… ? » jusqu'à trouver la limite de ce que tu connais.</p>
<p>Bonne nouvelle : tu as construit OrderFlow de A à Z. Tu as donc des exemples concrets pour chaque thème. Une réponse avec « dans mon projet, j'ai eu ce problème et voilà ce que j'ai fait » vaut dix définitions.</p>

<h3>La structure d'une bonne réponse</h3>
<div class="flow"><span>Définition en 1 phrase</span><span>Exemple concret</span><span>Piège courant</span><span>Compromis</span></div>
<p>Vise 1 à 2 minutes par réponse. Si tu ne sais pas, dis-le et raisonne à voix haute : « je ne l'ai jamais utilisé, mais je suppose que… parce que… ». C'est bien mieux qu'une réponse inventée.</p>

<h3>C# et mémoire</h3>
<table>
<tr><th>Question</th><th>Réponse attendue (résumé)</th></tr>
<tr><td>Class, struct ou record ?</td><td><code>class</code> : identité, référence. <code>struct</code> : petite valeur copiée (≤ 16 octets, immuable). <code>record</code> : égalité par valeur et <code>with</code>, idéal pour les DTO et value objects.</td></tr>
<tr><td><code>IEnumerable&lt;T&gt;</code> ou <code>IQueryable&lt;T&gt;</code> ?</td><td>Le premier s'exécute en mémoire, le second est traduit en SQL. Appeler <code>AsEnumerable()</code> trop tôt rapatrie toute la table.</td></tr>
<tr><td>Que fait le garbage collector ?</td><td>Il libère les objets du tas devenus inaccessibles, par générations (0, 1, 2). Les objets de plus de 85 000 octets vont dans le LOH. Moins d'allocations = moins de pauses.</td></tr>
<tr><td>À quoi sert <code>IDisposable</code> ?</td><td>Libérer une ressource non gérée (connexion, fichier) au bon moment, avec <code>using</code>. Le GC ne s'en charge pas.</td></tr>
</table>

<h3>Async</h3>
<table>
<tr><th>Question</th><th>Réponse attendue (résumé)</th></tr>
<tr><td>Async rend-il le code plus rapide ?</td><td>Non : il libère le thread pendant l'attente d'une E/S. Le serveur absorbe plus de requêtes, chaque requête n'est pas plus rapide.</td></tr>
<tr><td>Pourquoi éviter <code>.Result</code> ?</td><td>Il bloque un thread (et peut provoquer un deadlock avec un contexte de synchronisation). Async de bout en bout.</td></tr>
<tr><td>Pourquoi éviter <code>async void</code> ?</td><td>Impossible d'attendre la méthode, et une exception fait tomber le processus. Seule exception : les gestionnaires d'événements.</td></tr>
<tr><td>À quoi sert le <code>CancellationToken</code> ?</td><td>Arrêter un travail devenu inutile (client parti, timeout). On le propage jusqu'à EF Core et <code>HttpClient</code>.</td></tr>
</table>

<h3>EF Core et ASP.NET Core</h3>
<table>
<tr><th>Question</th><th>Réponse attendue (résumé)</th></tr>
<tr><td>C'est quoi le problème N+1 ?</td><td>Une requête pour la liste, puis une par élément. Correction : <code>Include</code> ou une projection <code>Select</code> vers un DTO.</td></tr>
<tr><td>Pourquoi <code>AsNoTracking</code> ?</td><td>En lecture seule, EF ne suit pas les entités : moins de mémoire, plus rapide.</td></tr>
<tr><td>Durées de vie en DI ?</td><td>Singleton (une instance), scoped (une par requête, ex. <code>DbContext</code>), transient (une par injection). Piège : la <em>captive dependency</em>, un singleton qui garde un scoped.</td></tr>
<tr><td>Middleware ou filtre ?</td><td>Le middleware voit toutes les requêtes (comme un intercepteur Angular). Le filtre ne concerne que MVC et connaît l'action appelée.</td></tr>
</table>

<h3>Architecture et conception</h3>
<p>Questions fréquentes : « pourquoi une Clean Architecture ? » (le domaine ne dépend de rien, on teste sans base), « monolithe ou microservices ? » (monolithe modulaire d'abord, on découpe quand une équipe ou une charge l'exige), « comment éviter de créer deux fois une commande ? » (clé d'idempotence, contrainte unique en base).</p>
<p>L'exercice de <strong>system design</strong> (« concevez OrderFlow pour 1 000 commandes par seconde ») suit toujours le même chemin :</p>
<div class="flow"><span>Clarifier le besoin</span><span>Estimer la charge</span><span>Schéma simple</span><span>Goulots</span><span>Compromis</span></div>
<div class="tip">Ne commence jamais par dessiner Kafka et Kubernetes. Commence par une API et une base, chiffre la charge, puis ajoute cache, file de messages ou réplicas <em>seulement</em> là où le chiffre le justifie.</div>
<div class="note">Prépare 3 histoires vraies au format STAR (Situation, Tâche, Action, Résultat) : un bug difficile, une décision technique que tu as défendue, une erreur que tu as faite et ce que tu en as appris. Elles servent pour toutes les questions comportementales.</div>`,
  examples: [
    {
      title: "Question C# : énumérer deux fois une requête LINQ",
      code: `// Question : « Que se passe-t-il si on énumère deux fois une requête LINQ ? »
int calls = 0;
List<int> prices = [10, 25, 40, 5];

IEnumerable<int> expensive = prices.Where(p =>
{
    calls++;          // compte chaque test du filtre
    return p > 20;
});

Console.WriteLine($"Avant énumération : {calls} appel(s)");
Console.WriteLine($"Count = {expensive.Count()}");
Console.WriteLine($"Sum = {expensive.Sum()}");
Console.WriteLine($"Après deux énumérations : {calls} appels");

calls = 0;
List<int> cached = expensive.ToList(); // on matérialise une seule fois
Console.WriteLine($"Count = {cached.Count}, Sum = {cached.Sum()}");
Console.WriteLine($"Avec ToList : {calls} appels");`,
      output: `Avant énumération : 0 appel(s)
Count = 2
Sum = 65
Après deux énumérations : 8 appels
Count = 2, Sum = 65
Avec ToList : 4 appels`,
      steps: [
        `<code>prices.Where(...)</code> : rien ne s'exécute encore. LINQ prépare une « recette » : c'est l'exécution différée.`,
        `<code>expensive.Count()</code> : la recette tourne une première fois, le filtre est appelé 4 fois.`,
        `<code>expensive.Sum()</code> : elle tourne une deuxième fois, encore 4 appels, d'où 8 au total.`,
        `<code>expensive.ToList()</code> : on exécute une seule fois et on garde le résultat en mémoire.`,
        `Avec EF Core, chaque énumération d'un <code>IQueryable</code> serait une requête SQL : c'est la réponse que le recruteur attend.`
      ],
      explain: "Réponse type : « l'exécution est différée, chaque énumération rejoue la requête ; je matérialise avec ToList quand je dois la parcourir plusieurs fois »."
    },
    {
      title: "Question C# : class ou record ?",
      code: `// Question : « Différence entre une class et un record ? »
var c1 = new CustomerClass("Alice", "alice@mail.com");
var c2 = new CustomerClass("Alice", "alice@mail.com");
Console.WriteLine($"class  : c1 == c2 -> {c1 == c2}");

var r1 = new CustomerRecord("Alice", "alice@mail.com");
var r2 = new CustomerRecord("Alice", "alice@mail.com");
Console.WriteLine($"record : r1 == r2 -> {r1 == r2}");

var r3 = r1 with { Email = "alice@pro.com" }; // copie modifiée
Console.WriteLine(r3);
Console.WriteLine($"r1 inchangé : {r1.Email}");

class CustomerClass(string name, string email)
{
    public string Name { get; } = name;
    public string Email { get; } = email;
}

record CustomerRecord(string Name, string Email);`,
      output: `class  : c1 == c2 -> False
record : r1 == r2 -> True
CustomerRecord { Name = Alice, Email = alice@pro.com }
r1 inchangé : alice@mail.com`,
      steps: [
        `<code>c1 == c2</code> : pour une classe, <code>==</code> compare les adresses. Deux objets distincts donnent <code>False</code>.`,
        `<code>r1 == r2</code> : un record compare ses propriétés une à une. Mêmes valeurs, donc <code>True</code>.`,
        `<code>r1 with { Email = ... }</code> : crée une copie avec une propriété changée, l'original ne bouge pas.`,
        `<code>Console.WriteLine(r3)</code> : le record génère aussi un <code>ToString()</code> lisible.`,
        `<code>record CustomerRecord(...)</code> : une ligne suffit grâce au constructeur principal.`
      ],
      explain: "Réponse type : « record pour les données (DTO, value objects), class pour les entités qui ont une identité et un cycle de vie »."
    },
    {
      title: "Question DI : la captive dependency",
      code: `// dotnet add package Microsoft.Extensions.DependencyInjection
// Question : « Qu'est-ce qu'une captive dependency ? »
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddScoped<OrderDbSession>();     // une instance par requête
services.AddSingleton<PriceCache>();      // une instance pour toute l'appli

// ValidateScopes : ce que fait ASP.NET Core en Development
var provider = services.BuildServiceProvider(new ServiceProviderOptions
{
    ValidateScopes = true
});

try
{
    var cache = provider.GetRequiredService<PriceCache>();
}
catch (InvalidOperationException ex)
{
    Console.WriteLine(ex.Message);
}

class OrderDbSession { }

// Le singleton capture un service scoped : il le garderait à vie
class PriceCache(OrderDbSession session)
{
    public OrderDbSession Session { get; } = session;
}`,
      output: `Cannot consume scoped service 'OrderDbSession' from singleton 'PriceCache'.`,
      steps: [
        `<code>services.AddScoped&lt;OrderDbSession&gt;()</code> : dans une API, une nouvelle instance par requête HTTP, comme un <code>DbContext</code>.`,
        `<code>services.AddSingleton&lt;PriceCache&gt;()</code> : une seule instance, créée une fois et gardée jusqu'à l'arrêt.`,
        `<code>class PriceCache(OrderDbSession session)</code> : le singleton réclame un scoped dans son constructeur. Il le garderait pour toujours, partagé entre toutes les requêtes.`,
        `<code>ValidateScopes = true</code> : le conteneur vérifie les durées de vie et refuse ce montage.`,
        `<code>catch (InvalidOperationException ex)</code> : on affiche le message, celui que tu verrais au démarrage de l'API en Development.`
      ],
      explain: "Réponse type : « un service ne doit dépendre que de services qui vivent au moins aussi longtemps que lui ; sinon j'injecte IServiceScopeFactory et je crée un scope »."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ta fiche de révision",
      prompt: `<p>Pour chacun des 6 thèmes (C#, mémoire, async, EF Core, ASP.NET Core, architecture), écris <strong>une</strong> question et ta réponse en 3 phrases maximum : définition, exemple tiré d'OrderFlow, piège. Lis-les à voix haute en te chronométrant : moins de 90 secondes chacune.</p>`,
      hint: `<p>Reprends les tableaux de la leçon, mais remplace chaque exemple générique par un endroit précis de ton code (un endpoint, une requête, un service).</p>`,
      solution: `Exemple pour le thème EF Core :

Q : Qu'est-ce que le problème N+1 ?
R : Une requête charge la liste, puis une requête part pour chaque élément.
Dans OrderFlow, GET /api/orders chargeait les lignes de chaque commande
dans une boucle : 51 requêtes pour 50 commandes.
Je l'ai corrigé avec une projection Select vers OrderDto :
une seule requête SQL avec jointure.`
    },
    {
      level: "moyen",
      title: "Corriger une captive dependency",
      prompt: `<p>Reprends l'exemple 3. Le <code>PriceCache</code> doit rester singleton, mais il a besoin d'un <code>OrderDbSession</code> de temps en temps. Corrige-le en injectant <code>IServiceScopeFactory</code> et en créant un scope dans une méthode <code>Refresh()</code>. Affiche « Rafraîchi » pour prouver que ça marche avec <code>ValidateScopes = true</code>.</p>`,
      hint: `<p><code>using var scope = scopeFactory.CreateScope();</code> puis <code>scope.ServiceProvider.GetRequiredService&lt;OrderDbSession&gt;()</code>.</p>`,
      solution: `// dotnet add package Microsoft.Extensions.DependencyInjection
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddScoped<OrderDbSession>();
services.AddSingleton<PriceCache>();

var provider = services.BuildServiceProvider(new ServiceProviderOptions
{
    ValidateScopes = true
});

provider.GetRequiredService<PriceCache>().Refresh();

class OrderDbSession { }

class PriceCache(IServiceScopeFactory scopeFactory)
{
    public void Refresh()
    {
        // Un scope court, ouvert et fermé pour ce travail seulement
        using var scope = scopeFactory.CreateScope();
        var session = scope.ServiceProvider.GetRequiredService<OrderDbSession>();
        Console.WriteLine("Rafraîchi");
    }
}`
    },
    {
      level: "difficile",
      title: "Simuler un system design",
      prompt: `<p>Sujet : « OrderFlow doit encaisser un pic de 1 000 commandes par seconde pendant les soldes ». En 15 minutes, écris : 2 questions de clarification, une estimation de charge, un schéma en texte, les 2 goulots principaux et un compromis assumé.</p>`,
      hint: `<p>Pense à ce qui coûte cher par commande : l'écriture SQL et la vérification du stock. Que peut-on faire plus tard, de façon asynchrone ?</p>`,
      solution: `Clarifier : les commandes doivent-elles être confirmées immédiatement ?
Quelle durée de pic (minutes ou heures) ?

Charge : 1 000 commandes/s x 3 lignes = ~4 000 INSERT/s au pic.

Schéma :
Client -> Load balancer -> API (3 réplicas) -> SQL Server
                              |
                              +-> file de messages -> Worker (paiement, email)

Goulots :
1. Écritures SQL : transactions courtes, index sur OrderLines.OrderId.
2. Stock : décrément atomique (UPDATE ... WHERE Stock >= @qty).

Compromis : la commande est acceptée (202, statut Pending) puis traitée
par le worker. On gagne en débit, on perd la confirmation immédiate.`
    }
  ],
  quiz: [
    {
      q: `Un recruteur demande : « async/await rend-il une API plus rapide ? ». Quelle est la meilleure réponse ?`,
      options: ["Oui, chaque requête s'exécute en parallèle", "Non, mais le serveur traite plus de requêtes car les threads sont libérés pendant les E/S", "Oui, car le code tourne sur plusieurs cœurs"],
      answer: 1,
      why: `Async libère le thread pendant l'attente (base, réseau). Le débit global augmente, pas la vitesse d'une requête. Le piège : confondre asynchronisme et parallélisme.`
    },
    {
      q: `Quelle correction règle un problème N+1 dans EF Core ?`,
      options: ["Ajouter <code>AsNoTracking()</code>", "Appeler <code>ToList()</code> dans la boucle", "Charger les données liées avec <code>Include</code> ou une projection <code>Select</code>"],
      answer: 2,
      why: `<code>Include</code> ou une projection produisent une seule requête avec jointure. <code>AsNoTracking</code> allège le suivi mais garde le même nombre de requêtes.`
    },
    {
      q: `Un service singleton reçoit un <code>DbContext</code> dans son constructeur. Comment s'appelle ce problème ?`,
      options: ["Une captive dependency", "Un deadlock", "Une fuite de connexion LOH"],
      answer: 0,
      why: `Le singleton « capture » un service scoped et le garde pour toute la vie de l'application, partagé entre requêtes. ASP.NET Core le détecte en Development grâce à <code>ValidateScopes</code>.`
    },
    {
      q: `En system design, par quoi commences-tu ?`,
      options: ["Choisir Kafka et Kubernetes", "Clarifier le besoin et estimer la charge", "Écrire le code du contrôleur"],
      answer: 1,
      why: `Sans chiffres, impossible de justifier un composant. On part d'un schéma simple (API + base) et on n'ajoute une brique que là où la charge l'exige.`
    }
  ],
  project: `<p><strong>OrderFlow comme portfolio.</strong> Ouvre ton projet et repère 3 endroits que tu montrerais en entretien : un problème de performance corrigé (ex. N+1 sur <code>/api/orders</code>), une décision d'architecture (ex. Clean Architecture et tests), un point de production (ex. health checks ou logs structurés). Pour chacun, note le fichier, le problème de départ et ta solution, en 4 lignes. Tu as ta « histoire technique » prête à raconter.</p>`,
  resources: [
    { label: "Injection de dépendances dans ASP.NET Core", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/dependency-injection" },
    { label: "Programmation asynchrone avec async et await", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/asynchronous-programming/" }
  ]
});

// =====================================================================
// Bonus : Performance
// =====================================================================
window.COURSE.push({
  key: "bon-performance",
  title: "Performance : mesurer avec BenchmarkDotNet, Span<T> et allocations",
  summary: "Tu sauras mesurer le coût réel d'un bout de code avec BenchmarkDotNet et réduire ses allocations grâce à Span<T>.",
  objectives: [
    "Écrire et lancer un benchmark BenchmarkDotNet en Release",
    "Lire les colonnes Mean, Ratio et Allocated",
    "Découper une chaîne sans allocation avec ReadOnlySpan<char>",
    "Savoir quand optimiser, et surtout quand ne pas le faire"
  ],
  analogy: `<p>Tu veux savoir quel chemin est le plus court pour aller au travail. Faire le trajet <strong>une seule fois</strong> ne prouve rien : un feu rouge, un bouchon, et la mesure est faussée. Il faut le refaire de nombreuses fois, aux mêmes conditions, et comparer les moyennes.</p>
<p>BenchmarkDotNet fait exactement ça pour ton code. Et <code>Span&lt;T&gt;</code>, c'est comme <strong>lire un passage d'un livre avec un marque-page</strong> au lieu de photocopier la page : tu regardes le même papier, sans rien dupliquer.</p>`,
  lesson: `<h3>Règle n°1 : mesurer avant d'optimiser</h3>
<p>Ton intuition sur la performance se trompe souvent. Le code qui « a l'air lent » ne l'est parfois pas, et le vrai goulot est ailleurs (souvent une requête SQL). Avant de toucher au code, on <strong>mesure</strong>. Après la modification, on mesure encore pour prouver le gain.</p>
<div class="flow"><span>Mesurer</span><span>Trouver le goulot</span><span>Corriger</span><span>Remesurer</span></div>
<p>Un <code>Stopwatch</code> autour d'une boucle donne des chiffres peu fiables : le JIT n'a pas encore compilé le code, le GC passe au mauvais moment, le mode Debug désactive les optimisations. <strong>BenchmarkDotNet</strong> règle tout ça : échauffement, nombreuses itérations, statistiques.</p>

<h3>BenchmarkDotNet en pratique</h3>
<p>C'est un package NuGet. Tu écris une classe publique, tu marques chaque méthode à comparer avec <code>[Benchmark]</code>, et tu lances <code>BenchmarkRunner.Run&lt;TaClasse&gt;()</code>. L'attribut <code>[MemoryDiagnoser]</code> ajoute les colonnes d'allocations. <code>[Params]</code> rejoue chaque mesure avec plusieurs tailles d'entrée.</p>
<div class="tip">Lance toujours avec <code>dotnet run -c Release</code>. En Debug, BenchmarkDotNet refuse de tourner : les chiffres n'auraient aucun sens. Et ferme les applications lourdes pendant la mesure.</div>
<table>
<tr><th>Colonne</th><th>Ce qu'elle dit</th></tr>
<tr><td><code>Mean</code></td><td>Temps moyen d'un appel (ns = nanoseconde, μs = microseconde)</td></tr>
<tr><td><code>Ratio</code></td><td>Comparaison avec la méthode <code>Baseline = true</code> (0,14 = 7 fois plus rapide)</td></tr>
<tr><td><code>Gen0</code></td><td>Nombre de passages du GC génération 0 pour 1 000 appels</td></tr>
<tr><td><code>Allocated</code></td><td>Mémoire allouée sur le tas par appel</td></tr>
</table>

<h3>Pourquoi les allocations comptent</h3>
<p>Chaque <code>new</code>, chaque <code>Substring</code>, chaque <code>Split</code> crée un objet sur le tas. Un objet seul ne coûte presque rien. Mais une API qui traite 1 000 requêtes par seconde et alloue 50 Ko par requête force le garbage collector à travailler sans arrêt. Résultat : des pauses et une latence qui grimpe.</p>
<pre class="diagram">
 "ORD-2026-00042"  (une seule chaîne sur le tas)
  |   |    |
  |   |    +-- span[9..]   -&gt; vue "00042"
  |   +------- Slice(4, 4) -&gt; vue "2026"
  +----------- span[..3]   -&gt; vue "ORD"

 Substring : 3 nouvelles chaînes
 Span      : 0 nouvelle chaîne, 3 vues
</pre>

<h3>Span&lt;T&gt; : une vue sans copie</h3>
<p><code>Span&lt;T&gt;</code> (et sa version lecture seule <code>ReadOnlySpan&lt;T&gt;</code>) est une <strong>fenêtre</strong> sur une zone de mémoire existante : un tableau, une chaîne, un buffer. Découper un span (<code>Slice</code>, ou les plages <code>[..3]</code>) ne copie rien. Beaucoup d'API l'acceptent directement : <code>int.Parse</code>, <code>SequenceEqual</code>, <code>StartsWith</code>.</p>
<p>Comme c'est un <code>ref struct</code>, il vit uniquement sur la pile. Conséquence : pas de span dans un champ de classe, ni dans une méthode <code>async</code>, ni dans une lambda capturée. Pour ces cas, il existe <code>Memory&lt;T&gt;</code>, son cousin qui peut vivre sur le tas.</p>
<div class="compare"><div><h4>string + Substring</h4><p>Simple, lisible, une nouvelle chaîne à chaque découpe. Parfait pour 99 % du code.</p></div><div><h4>ReadOnlySpan&lt;char&gt;</h4><p>Zéro allocation, un peu plus verbeux. Pour les chemins appelés des milliers de fois par seconde.</p></div></div>

<h3>Où chercher en premier</h3>
<p>Dans une API comme OrderFlow, les gains énormes viennent rarement des micro-optimisations. Vérifie d'abord : requêtes N+1, <code>AsNoTracking</code> en lecture, pagination, cache, appels réseau en série. Ensuite seulement, sur un chemin chaud mesuré, viennent <code>StringBuilder</code>, <code>Span&lt;T&gt;</code> et <code>ArrayPool&lt;T&gt;</code>.</p>
<div class="note">En production, on mesure avec des outils de profilage : <code>dotnet-counters</code> (GC, requêtes par seconde en direct), <code>dotnet-trace</code> (où le CPU passe son temps), ou le profileur de Visual Studio. BenchmarkDotNet sert ensuite à comparer deux versions d'une méthode isolée.</div>`,
  examples: [
    {
      title: "Premier benchmark : concaténation contre StringBuilder",
      code: `// dotnet add package BenchmarkDotNet
// Lancer avec : dotnet run -c Release
using System.Text;
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;

BenchmarkRunner.Run<OrderLabelBenchmarks>();

[MemoryDiagnoser] // ajoute les colonnes d'allocations
public class OrderLabelBenchmarks
{
    [Params(10, 100)]
    public int Lines; // nombre de lignes de commande

    [Benchmark(Baseline = true)]
    public string Concat()
    {
        string label = "";
        for (int i = 0; i < Lines; i++)
            label += $"L{i};";       // nouvelle chaîne à chaque tour
        return label;
    }

    [Benchmark]
    public string Builder()
    {
        var sb = new StringBuilder();
        for (int i = 0; i < Lines; i++)
            sb.Append('L').Append(i).Append(';');
        return sb.ToString();
    }
}`,
      output: `(sortie raccourcie au tableau final ; les temps varient selon la machine)

| Method  | Lines | Mean        | Ratio | Gen0   | Allocated |
|-------- |------ |------------:|------:|-------:|----------:|
| Concat  | 10    |  1,013.0 ns |  1.00 | 0.1383 |     872 B |
| Builder | 10    |    331.0 ns |  0.33 | 0.0467 |     296 B |
|         |       |             |       |        |           |
| Concat  | 100   | 21,241.7 ns |  1.01 | 7.0801 |   44432 B |
| Builder | 100   |  2,897.0 ns |  0.14 | 0.3586 |    2264 B |`,
      steps: [
        `<code>BenchmarkRunner.Run&lt;OrderLabelBenchmarks&gt;()</code> : lance toutes les méthodes marquées, avec échauffement et des milliers d'itérations.`,
        `<code>[MemoryDiagnoser]</code> : ajoute <code>Gen0</code> et <code>Allocated</code>, indispensables pour parler d'allocations.`,
        `<code>[Params(10, 100)]</code> : chaque méthode est mesurée avec 10 puis 100 lignes. On voit comment le coût grandit.`,
        `<code>[Benchmark(Baseline = true)]</code> : <code>Concat</code> sert de référence, son <code>Ratio</code> vaut 1.`,
        `<code>label += ...</code> : une chaîne étant immuable, chaque tour recopie tout le texte. À 100 lignes : 44 Ko alloués.`,
        `<code>sb.Append(...)</code> : un seul buffer qui grandit. 7 fois plus rapide et 20 fois moins de mémoire à 100 lignes.`
      ],
      explain: "Remarque : à 10 lignes l'écart est faible en valeur absolue (moins d'une microseconde). Optimiser n'a de sens que si ce code est appelé très souvent."
    },
    {
      title: "Lire une référence de commande avec ReadOnlySpan<char>",
      code: `// Lire "ORD-2026-00042" sans créer de sous-chaînes
string reference = "ORD-2026-00042";

ReadOnlySpan<char> span = reference.AsSpan();
ReadOnlySpan<char> prefix = span[..3];      // "ORD" : une vue, pas une copie
ReadOnlySpan<char> yearPart = span.Slice(4, 4);
ReadOnlySpan<char> numberPart = span[9..];

int year = int.Parse(yearPart);   // int.Parse accepte un span
int number = int.Parse(numberPart);

Console.WriteLine($"Préfixe : {prefix.ToString()}");
Console.WriteLine($"Année : {year}, numéro : {number}");
Console.WriteLine(prefix.SequenceEqual("ORD"));`,
      output: `Préfixe : ORD
Année : 2026, numéro : 42
True`,
      steps: [
        `<code>reference.AsSpan()</code> : crée une vue sur toute la chaîne. Aucune copie.`,
        `<code>span[..3]</code> : les 3 premiers caractères, avec la syntaxe de plage que tu connais des tableaux.`,
        `<code>span.Slice(4, 4)</code> : 4 caractères à partir de l'indice 4, soit « 2026 ».`,
        `<code>int.Parse(yearPart)</code> : la conversion lit directement dans la vue, sans passer par une <code>string</code>.`,
        `<code>prefix.ToString()</code> : ici on crée volontairement une chaîne pour l'afficher. Une interpolation ne sait pas lire un span directement.`,
        `<code>prefix.SequenceEqual("ORD")</code> : compare le contenu sans allouer.`
      ]
    },
    {
      title: "Compter les octets alloués : Split contre Span",
      code: `// Compter les octets alloués par deux façons de parser
string csv = "12;7;30;5;48;3";

ParseWithSplit(csv);                // échauffement (JIT)
ParseWithSpan(csv);

long before = GC.GetAllocatedBytesForCurrentThread();
int total1 = ParseWithSplit(csv);
long splitBytes = GC.GetAllocatedBytesForCurrentThread() - before;

before = GC.GetAllocatedBytesForCurrentThread();
int total2 = ParseWithSpan(csv);
long spanBytes = GC.GetAllocatedBytesForCurrentThread() - before;

Console.WriteLine($"Totaux : {total1} et {total2}");
Console.WriteLine($"Split alloue de la mémoire : {splitBytes > 0}");
Console.WriteLine($"Span alloue : {spanBytes} octet(s)");

static int ParseWithSplit(string text)
{
    int sum = 0;
    foreach (string part in text.Split(';')) // tableau + 6 chaînes
        sum += int.Parse(part);
    return sum;
}

static int ParseWithSpan(string text)
{
    int sum = 0;
    foreach (Range r in text.AsSpan().Split(';')) // aucune chaîne créée
        sum += int.Parse(text.AsSpan()[r]);
    return sum;
}`,
      output: `Totaux : 105 et 105
Split alloue de la mémoire : True
Span alloue : 0 octet(s)`,
      steps: [
        `<code>ParseWithSplit(csv);</code> en premier : un appel d'échauffement pour que la compilation JIT ne pollue pas la mesure.`,
        `<code>GC.GetAllocatedBytesForCurrentThread()</code> : le compteur d'octets alloués par le thread. La différence avant/après donne le coût d'un appel.`,
        `<code>text.Split(';')</code> : crée un tableau et 6 petites chaînes, donc des allocations.`,
        `<code>text.AsSpan().Split(';')</code> : renvoie seulement des plages (<code>Range</code>), c'est-à-dire des positions de début et de fin.`,
        `<code>text.AsSpan()[r]</code> : applique la plage pour obtenir une vue sur le nombre, lue directement par <code>int.Parse</code>.`
      ],
      explain: "Les deux méthodes donnent le même résultat ; seule la seconde n'alloue rien. C'est un outil rapide pour vérifier une intuition avant d'écrire un vrai benchmark."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire un tableau de résultats",
      prompt: `<p>Dans le tableau de l'exemple 1 (100 lignes), calcule combien de fois <code>Builder</code> est plus rapide que <code>Concat</code>, et combien de fois il alloue moins. Écris un petit programme qui fait ces deux divisions et affiche le résultat arrondi à l'entier.</p>`,
      hint: `<p>21 241,7 / 2 897,0 pour le temps, 44 432 / 2 264 pour la mémoire. <code>Math.Round</code> arrondit.</p>`,
      solution: `double speed = 21241.7 / 2897.0;
double memory = 44432.0 / 2264.0;

Console.WriteLine($"Plus rapide : x{Math.Round(speed)}");   // x7
Console.WriteLine($"Moins de mémoire : x{Math.Round(memory)}"); // x20`
    },
    {
      level: "moyen",
      title: "Valider un code produit sans allocation",
      prompt: `<p>Les codes produit d'OrderFlow ont la forme <code>PRD-1234</code>. Écris <code>static bool IsValidProductCode(ReadOnlySpan&lt;char&gt; code)</code> qui vérifie : longueur 8, préfixe <code>PRD-</code>, puis 4 chiffres. Teste avec <code>"PRD-1234"</code>, <code>"PRD-12A4"</code> et <code>"ABC-1234"</code>.</p>`,
      hint: `<p><code>code.StartsWith("PRD-")</code> fonctionne sur un span, et <code>char.IsAsciiDigit(c)</code> teste un chiffre. Un <code>foreach</code> parcourt un span.</p>`,
      solution: `Console.WriteLine(IsValidProductCode("PRD-1234")); // True
Console.WriteLine(IsValidProductCode("PRD-12A4")); // False
Console.WriteLine(IsValidProductCode("ABC-1234")); // False

static bool IsValidProductCode(ReadOnlySpan<char> code)
{
    if (code.Length != 8 || !code.StartsWith("PRD-"))
        return false;

    foreach (char c in code[4..])
    {
        if (!char.IsAsciiDigit(c))
            return false;
    }
    return true;
}`
    },
    {
      level: "difficile",
      title: "Benchmarker ta propre méthode",
      prompt: `<p>Écris un benchmark qui compare deux façons d'extraire le numéro de <code>"ORD-2026-00042"</code> : <code>int.Parse(reference.Substring(9))</code> et <code>int.Parse(reference.AsSpan(9))</code>. Ajoute <code>[MemoryDiagnoser]</code>, lance en Release et explique la colonne <code>Allocated</code>.</p>`,
      hint: `<p>Mets la chaîne dans un champ de la classe pour que le compilateur ne la traite pas comme une constante. Attends-toi à 0 octet pour la version span.</p>`,
      solution: `// dotnet add package BenchmarkDotNet
// dotnet run -c Release
using BenchmarkDotNet.Attributes;
using BenchmarkDotNet.Running;

BenchmarkRunner.Run<ReferenceBenchmarks>();

[MemoryDiagnoser]
public class ReferenceBenchmarks
{
    private readonly string _reference = "ORD-2026-00042";

    [Benchmark(Baseline = true)]
    public int WithSubstring() => int.Parse(_reference.Substring(9));

    [Benchmark]
    public int WithSpan() => int.Parse(_reference.AsSpan(9));
}

// Allocated : quelques dizaines d'octets pour WithSubstring
// (la sous-chaîne "00042"), 0 B pour WithSpan.`
    }
  ],
  quiz: [
    {
      q: `Pourquoi lancer un benchmark avec <code>-c Release</code> ?`,
      options: ["Pour activer les optimisations du compilateur et du JIT, sinon les mesures n'ont pas de sens", "Pour afficher plus de colonnes", "Parce que le mode Debug est plus rapide"],
      answer: 0,
      why: `En Debug, beaucoup d'optimisations sont désactivées : tu mesurerais un code qui ne tournera jamais en production. BenchmarkDotNet refuse d'ailleurs de tourner en Debug.`
    },
    {
      q: `Que fait <code>span.Slice(4, 4)</code> sur un <code>ReadOnlySpan&lt;char&gt;</code> ?`,
      options: ["Il copie 4 caractères dans une nouvelle chaîne", "Il modifie la chaîne d'origine", "Il crée une vue sur 4 caractères, sans copie"],
      answer: 2,
      why: `Un span est une fenêtre sur la mémoire existante. Découper la fenêtre ne copie rien, d'où zéro allocation.`
    },
    {
      q: `Où ne peux-tu PAS utiliser un <code>Span&lt;T&gt;</code> ?`,
      options: ["Dans une variable locale", "Dans un champ de classe ou une méthode <code>async</code>", "En paramètre d'une méthode"],
      answer: 1,
      why: `Span est un <code>ref struct</code> : il ne vit que sur la pile. Une classe ou une méthode async (dont l'état est stocké sur le tas) ne peut pas le garder. On utilise alors <code>Memory&lt;T&gt;</code>.`
    },
    {
      q: `Ton API OrderFlow est lente. Quelle est la première chose à faire ?`,
      options: ["Remplacer toutes les string par des Span", "Mesurer pour trouver le vrai goulot (souvent la base de données)", "Passer en .NET Native AOT"],
      answer: 1,
      why: `Sans mesure, tu risques d'optimiser un code qui ne pèse rien. Dans une API, le goulot est très souvent une requête SQL (N+1, pas d'index), pas la manipulation de chaînes.`
    }
  ],
  project: `<p><strong>OrderFlow : un benchmark sur un chemin chaud.</strong> Crée un projet console <code>OrderFlow.Benchmarks</code> qui référence ton projet Domain. Mesure la méthode qui calcule le total d'une commande (<code>Order.Total</code>) pour 10 et 1 000 lignes avec <code>[Params]</code> et <code>[MemoryDiagnoser]</code>. Compare une version LINQ (<code>Lines.Sum(l =&gt; l.Quantity * l.UnitPrice)</code>) à une boucle <code>foreach</code>, et note dans le README si le gain justifie de changer le code.</p>`,
  resources: [
    { label: "Utilisation de Span et Memory (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/memory-and-spans/" },
    { label: "Documentation BenchmarkDotNet", url: "https://benchmarkdotnet.org/articles/overview.html" }
  ]
});

// =====================================================================
// Bonus : SignalR
// =====================================================================
window.COURSE.push({
  key: "bon-signalr",
  title: "Temps réel avec SignalR",
  summary: "Tu sauras pousser des notifications en temps réel depuis l'API OrderFlow vers des clients connectés avec SignalR.",
  objectives: [
    "Comprendre la différence entre requête/réponse et push serveur",
    "Créer un hub et l'exposer avec MapHub",
    "Envoyer un message depuis un endpoint avec IHubContext",
    "Écouter les messages depuis un client .NET et cibler un groupe"
  ],
  analogy: `<p>Le HTTP classique, c'est comme <strong>aller relever ta boîte aux lettres</strong> : tu dois te déplacer pour savoir s'il y a du courrier. Si tu y vas toutes les 5 secondes, tu t'épuises pour rien.</p>
<p>SignalR, c'est le <strong>coup de fil</strong> : la ligne reste ouverte, et c'est le serveur qui t'appelle dès qu'il y a du nouveau. « Ta commande 42 vient d'être expédiée ! »</p>`,
  lesson: `<h3>Le problème : le serveur ne peut pas parler en premier</h3>
<p>En HTTP, c'est toujours le client qui demande et le serveur qui répond. Pour qu'un écran Angular affiche une nouvelle commande dès qu'elle arrive, la solution naïve est le <strong>polling</strong> : redemander <code>GET /api/orders</code> toutes les 5 secondes. C'est lent (jusqu'à 5 secondes de retard) et coûteux (des milliers de requêtes inutiles).</p>
<div class="compare"><div><h4>Polling</h4><p>Le client redemande sans cesse. Beaucoup de requêtes vides, du retard.</p></div><div><h4>Push (SignalR)</h4><p>Une connexion reste ouverte. Le serveur envoie le message à l'instant où l'événement arrive.</p></div></div>

<h3>Ce que fait SignalR</h3>
<p><strong>SignalR</strong> est une bibliothèque d'ASP.NET Core pour le temps réel. Elle choisit pour toi le meilleur transport : <strong>WebSocket</strong> (une connexion bidirectionnelle permanente) si possible, sinon Server-Sent Events ou long polling. Tu n'écris jamais de code réseau : tu appelles des méthodes.</p>
<p>La pièce centrale est le <strong>hub</strong> : une classe qui hérite de <code>Hub</code>. Les clients s'y connectent par une URL, par exemple <code>/hubs/orders</code>. Le serveur peut appeler une méthode chez les clients, et les clients peuvent appeler une méthode du hub.</p>
<pre class="diagram">
 Angular  ----POST /api/orders----&gt;  API OrderFlow
                                        |
                              IHubContext&lt;OrderHub&gt;
                                        |
       +-------------+-----------------+
       v             v                 v
  Écran admin   Écran entrepôt    Client console
  "OrderCreated" reçu par tous les connectés
</pre>

<h3>Trois façons de choisir les destinataires</h3>
<table>
<tr><th>Code</th><th>Qui reçoit</th></tr>
<tr><td><code>Clients.All</code></td><td>Tous les clients connectés</td></tr>
<tr><td><code>Clients.Group("customer-7")</code></td><td>Les connexions ajoutées à ce groupe</td></tr>
<tr><td><code>Clients.User(userId)</code></td><td>Toutes les connexions d'un utilisateur authentifié</td></tr>
</table>
<p>Un <strong>groupe</strong> est une simple étiquette : une connexion y entre avec <code>Groups.AddToGroupAsync</code>. C'est idéal pour « prévenir uniquement le client concerné par cette commande ». Une même connexion peut appartenir à plusieurs groupes, et un groupe vide disparaît tout seul.</p>

<h3>Envoyer depuis ailleurs que le hub</h3>
<p>Le plus souvent, l'événement naît dans un endpoint ou un service : une commande est créée, payée, expédiée. Tu n'as pas besoin du hub lui-même : tu injectes <code>IHubContext&lt;OrderHub&gt;</code>, comme n'importe quel service, et tu appelles <code>Clients.All.SendAsync("OrderCreated", order)</code>.</p>
<div class="tip">Le nom du message (<code>"OrderCreated"</code>) est une chaîne : une faute de frappe et le client n'entend rien, sans erreur. Utilise un <strong>hub fortement typé</strong> (<code>Hub&lt;IOrderClient&gt;</code>) pour que le compilateur vérifie les noms.</div>

<h3>Côté client</h3>
<p>En Angular, tu utilises le package npm <code>@microsoft/signalr</code> ; en .NET, <code>Microsoft.AspNetCore.SignalR.Client</code>. Le principe est le même : construire la connexion, s'abonner avec <code>On</code>, puis démarrer avec <code>StartAsync</code>. <code>WithAutomaticReconnect()</code> relance la connexion après une coupure réseau.</p>
<p>Côté Angular, le code ressemble beaucoup : <code>new HubConnectionBuilder().withUrl('/hubs/orders').withAutomaticReconnect().build()</code>, puis <code>connection.on('OrderCreated', order =&gt; ...)</code> dans un service injectable, que tes composants écoutent comme n'importe quel observable.</p>
<p>Pour sécuriser un hub, on ajoute <code>[Authorize]</code> sur la classe : le client envoie son jeton JWT (via <code>accessTokenFactory</code> côté JavaScript, car un WebSocket ne permet pas d'en-tête <code>Authorization</code> depuis le navigateur).</p>
<div class="note">Avec plusieurs instances de l'API derrière un load balancer, un message envoyé par l'instance A n'atteint pas les clients connectés à l'instance B. Il faut un <em>backplane</em> (Redis avec <code>AddStackExchangeRedis</code>) ou Azure SignalR Service. Et SignalR ne garantit pas la livraison : après une reconnexion, le client doit recharger l'état par un appel REST.</div>`,
  examples: [
    {
      title: "Un hub et un endpoint qui diffuse",
      code: `// Fichier : Program.cs (projet OrderFlow.Api)
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();               // 1. enregistre SignalR

var app = builder.Build();
app.MapHub<OrderHub>("/hubs/orders");          // 2. expose le hub

// 3. un endpoint REST qui prévient tous les clients connectés
app.MapPost("/api/orders", async (CreateOrder dto, IHubContext<OrderHub> hub) =>
{
    var order = new OrderCreated(42, dto.CustomerName, dto.Total);
    await hub.Clients.All.SendAsync("OrderCreated", order);
    return Results.Created($"/api/orders/{order.Id}", order);
});

app.Run();

public class OrderHub : Hub { }   // vide : le serveur parle, les clients écoutent

public record CreateOrder(string CustomerName, decimal Total);
public record OrderCreated(int Id, string CustomerName, decimal Total);`,
      output: `HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/orders/42

{"id":42,"customerName":"Alice","total":59.90}`,
      steps: [
        `<code>builder.Services.AddSignalR();</code> : enregistre les services SignalR dans la DI. Aucun package à ajouter, c'est inclus dans ASP.NET Core.`,
        `<code>app.MapHub&lt;OrderHub&gt;("/hubs/orders");</code> : les clients se connecteront à cette URL.`,
        `<code>IHubContext&lt;OrderHub&gt; hub</code> : injecté dans l'endpoint, il permet d'envoyer des messages hors du hub.`,
        `<code>hub.Clients.All.SendAsync("OrderCreated", order);</code> : appelle la méthode <code>OrderCreated</code> chez tous les clients, avec l'objet sérialisé en JSON.`,
        `<code>public class OrderHub : Hub { }</code> : un hub peut être vide si seul le serveur envoie.`,
        `La sortie est la réponse à <code>POST /api/orders</code> avec le corps <code>{"customerName":"Alice","total":59.90}</code>.`
      ]
    },
    {
      title: "Un client console qui écoute",
      code: `// dotnet add package Microsoft.AspNetCore.SignalR.Client
using System.Globalization;
using Microsoft.AspNetCore.SignalR.Client;

var connection = new HubConnectionBuilder()
    .WithUrl("http://localhost:5080/hubs/orders")
    .WithAutomaticReconnect()          // se reconnecte tout seul
    .Build();

// S'abonner AVANT de démarrer la connexion
connection.On<OrderCreated>("OrderCreated", order =>
{
    string total = order.Total.ToString("0.00", CultureInfo.InvariantCulture);
    Console.WriteLine($"Nouvelle commande #{order.Id} de {order.CustomerName} : {total} €");
});

await connection.StartAsync();
Console.WriteLine($"Connecté ({connection.State}). En attente...");

Console.ReadLine();                    // garde le programme ouvert
await connection.StopAsync();

record OrderCreated(int Id, string CustomerName, decimal Total);`,
      output: `Connecté (Connected). En attente...
Nouvelle commande #42 de Alice : 59.90 €`,
      steps: [
        `<code>new HubConnectionBuilder().WithUrl(...)</code> : décrit la connexion vers le hub de l'API (lancée sur le port 5080).`,
        `<code>.WithAutomaticReconnect()</code> : en cas de coupure, le client réessaie après 0, 2, 10 puis 30 secondes.`,
        `<code>connection.On&lt;OrderCreated&gt;("OrderCreated", ...)</code> : le gestionnaire appelé à chaque message de ce nom. Le JSON est désérialisé en <code>OrderCreated</code>.`,
        `<code>await connection.StartAsync();</code> : ouvre la connexion (WebSocket ici). L'état passe à <code>Connected</code>.`,
        `<code>Console.ReadLine();</code> : sans cette ligne, le programme se terminerait aussitôt. La deuxième ligne de sortie apparaît quand quelqu'un appelle <code>POST /api/orders</code>.`
      ],
      explain: "Le client n'a rien demandé : c'est le serveur qui a poussé le message dès la création de la commande."
    },
    {
      title: "Hub fortement typé et groupe par client",
      code: `// Fichier : Program.cs (OrderFlow.Api)
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSignalR();
var app = builder.Build();
app.MapHub<OrderHub>("/hubs/orders");

// Seul le client concerné est prévenu du changement de statut
app.MapPost("/api/orders/{id:int}/ship", async (int id, IHubContext<OrderHub, IOrderClient> hub) =>
{
    int customerId = 7; // en vrai : lu dans la commande en base
    await hub.Clients.Group($"customer-{customerId}").OrderStatusChanged(id, "Shipped");
    return Results.NoContent();
});

app.Run();

// Les méthodes que le SERVEUR peut appeler chez le client
public interface IOrderClient
{
    Task OrderStatusChanged(int orderId, string status);
}

// Hub fortement typé : plus de chaîne "OrderStatusChanged" à taper à la main
public class OrderHub : Hub<IOrderClient>
{
    // Appelée PAR le client pour suivre ses commandes
    public Task FollowCustomer(int customerId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, $"customer-{customerId}");
}`,
      output: `HTTP/1.1 204 No Content`,
      steps: [
        `<code>public interface IOrderClient</code> : décrit les messages que le serveur envoie. Le nom de la méthode devient le nom du message.`,
        `<code>class OrderHub : Hub&lt;IOrderClient&gt;</code> : le hub est maintenant typé. <code>Clients.All</code> expose directement <code>OrderStatusChanged(...)</code>.`,
        `<code>FollowCustomer(int customerId)</code> : une méthode que le client appelle avec <code>connection.InvokeAsync("FollowCustomer", 7)</code>.`,
        `<code>Groups.AddToGroupAsync(Context.ConnectionId, ...)</code> : range cette connexion dans le groupe <code>customer-7</code>.`,
        `<code>IHubContext&lt;OrderHub, IOrderClient&gt;</code> : la version typée du contexte, pour envoyer depuis un endpoint.`,
        `<code>Clients.Group(...).OrderStatusChanged(id, "Shipped")</code> : seules les connexions du groupe reçoivent le message. Le compilateur vérifie le nom et les paramètres.`
      ],
      explain: "En production, vérifie dans FollowCustomer que l'utilisateur connecté a bien le droit de suivre ce client, sinon n'importe qui pourrait écouter les commandes des autres."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Annoncer une annulation",
      prompt: `<p>Dans l'exemple 1, ajoute un endpoint <code>POST /api/orders/{id:int}/cancel</code> qui envoie le message <code>"OrderCancelled"</code> à tous les clients avec l'identifiant de la commande, puis renvoie <code>204 No Content</code>.</p>`,
      hint: `<p>Même modèle que <code>POST /api/orders</code> : injecte <code>IHubContext&lt;OrderHub&gt;</code> et appelle <code>SendAsync</code> avec le nom du message et l'id.</p>`,
      solution: `app.MapPost("/api/orders/{id:int}/cancel", async (int id, IHubContext<OrderHub> hub) =>
{
    // ... ici on passerait la commande en Cancelled en base
    await hub.Clients.All.SendAsync("OrderCancelled", id);
    return Results.NoContent();
});`
    },
    {
      level: "moyen",
      title: "Un client qui suit un seul client",
      prompt: `<p>Écris un client console pour le hub de l'exemple 3. Il s'abonne à <code>OrderStatusChanged</code> (paramètres <code>int</code> et <code>string</code>), démarre la connexion, puis appelle <code>FollowCustomer</code> avec l'id 7. Il affiche « Commande 12 : Shipped » quand il reçoit le message.</p>`,
      hint: `<p><code>connection.On&lt;int, string&gt;("OrderStatusChanged", (id, status) =&gt; ...)</code> et <code>await connection.InvokeAsync("FollowCustomer", 7);</code>.</p>`,
      solution: `// dotnet add package Microsoft.AspNetCore.SignalR.Client
using Microsoft.AspNetCore.SignalR.Client;

var connection = new HubConnectionBuilder()
    .WithUrl("http://localhost:5080/hubs/orders")
    .WithAutomaticReconnect()
    .Build();

connection.On<int, string>("OrderStatusChanged", (id, status) =>
    Console.WriteLine($"Commande {id} : {status}"));

await connection.StartAsync();
await connection.InvokeAsync("FollowCustomer", 7); // rejoint le groupe customer-7
Console.WriteLine("Je suis le client 7.");

Console.ReadLine();`
    },
    {
      level: "difficile",
      title: "Rejoindre à nouveau le groupe après reconnexion",
      prompt: `<p>Après une reconnexion automatique, la connexion reçoit un <strong>nouvel</strong> identifiant : elle n'est plus dans le groupe <code>customer-7</code>. Complète le client de l'exercice précédent pour rappeler <code>FollowCustomer</code> à chaque reconnexion, et afficher l'état.</p>`,
      hint: `<p>L'événement <code>connection.Reconnected</code> reçoit le nouvel identifiant de connexion et attend une fonction qui renvoie une <code>Task</code>.</p>`,
      solution: `// dotnet add package Microsoft.AspNetCore.SignalR.Client
using Microsoft.AspNetCore.SignalR.Client;

const int customerId = 7;

var connection = new HubConnectionBuilder()
    .WithUrl("http://localhost:5080/hubs/orders")
    .WithAutomaticReconnect()
    .Build();

connection.On<int, string>("OrderStatusChanged", (id, status) =>
    Console.WriteLine($"Commande {id} : {status}"));

connection.Reconnecting += error =>
{
    Console.WriteLine("Connexion perdue, tentative...");
    return Task.CompletedTask;
};

connection.Reconnected += async newConnectionId =>
{
    // Nouvelle connexion = plus dans aucun groupe : on se réinscrit
    await connection.InvokeAsync("FollowCustomer", customerId);
    Console.WriteLine("Reconnecté et réinscrit au groupe.");
};

await connection.StartAsync();
await connection.InvokeAsync("FollowCustomer", customerId);
Console.ReadLine();`
    }
  ],
  quiz: [
    {
      q: `Quel transport SignalR préfère-t-il quand le navigateur et le serveur le permettent ?`,
      options: ["Le long polling", "WebSocket", "Server-Sent Events"],
      answer: 1,
      why: `WebSocket offre une connexion bidirectionnelle permanente et légère. SignalR ne se replie sur SSE ou le long polling que si WebSocket n'est pas disponible.`
    },
    {
      q: `Comment envoyer un message aux clients depuis un endpoint REST ?`,
      options: ["En créant <code>new OrderHub()</code>", "En injectant <code>IHubContext&lt;OrderHub&gt;</code>", "En appelant le client avec <code>HttpClient</code>"],
      answer: 1,
      why: `Un hub est créé par SignalR pour chaque appel : on ne l'instancie jamais soi-même. <code>IHubContext</code> est le service prévu pour envoyer depuis l'extérieur du hub.`
    },
    {
      q: `Quel est l'intérêt de <code>Hub&lt;IOrderClient&gt;</code> ?`,
      options: ["Le compilateur vérifie les noms et paramètres des messages", "Les messages sont chiffrés", "Les clients se reconnectent plus vite"],
      answer: 0,
      why: `Avec un hub non typé, le nom du message est une chaîne et une faute passe inaperçue. L'interface transforme chaque message en méthode C# vérifiée à la compilation.`
    },
    {
      q: `L'API tourne sur 3 instances. Un client connecté à l'instance B ne reçoit pas les messages envoyés par A. Pourquoi ?`,
      options: ["Le client n'a pas appelé <code>StartAsync</code>", "WebSocket ne marche pas derrière un load balancer", "Chaque instance ne connaît que ses propres connexions : il faut un backplane (Redis) ou Azure SignalR Service"],
      answer: 2,
      why: `Les connexions sont gardées en mémoire par chaque instance. Un backplane relaie les messages entre instances pour que tous les clients les reçoivent.`
    }
  ],
  project: `<p><strong>OrderFlow en direct.</strong> Ajoute un <code>OrderHub</code> fortement typé à l'API et appelle <code>OrderStatusChanged</code> à chaque changement de statut d'une commande (<code>Pending</code> → <code>Paid</code> → <code>Shipped</code>), depuis le service qui fait la transition. Protège le hub avec <code>[Authorize]</code> et fais rejoindre à chaque utilisateur le groupe de son propre client uniquement.</p>`,
  resources: [
    { label: "Vue d'ensemble d'ASP.NET Core SignalR", url: "https://learn.microsoft.com/fr-fr/aspnet/core/signalr/introduction" },
    { label: "Client .NET SignalR", url: "https://learn.microsoft.com/fr-fr/aspnet/core/signalr/dotnet-client" }
  ]
});

// =====================================================================
// Bonus : gRPC
// =====================================================================
window.COURSE.push({
  key: "bon-grpc",
  title: "Aperçu de gRPC",
  summary: "Tu sauras ce qu'est gRPC, quand le préférer à REST, et appeler un service gRPC OrderFlow depuis un client .NET.",
  objectives: [
    "Lire et écrire un contrat .proto simple",
    "Implémenter un service gRPC dans ASP.NET Core",
    "Appeler ce service avec le client généré",
    "Choisir entre REST et gRPC selon la situation"
  ],
  analogy: `<p>REST avec JSON, c'est comme envoyer une <strong>lettre manuscrite</strong> : tout le monde peut la lire, mais elle est longue et il faut la déchiffrer.</p>
<p>gRPC, c'est un <strong>formulaire administratif pré-imprimé</strong> : chaque case a un numéro, les deux parties ont le même modèle sous les yeux. On ne remplit que des valeurs, c'est compact, rapide à traiter, et impossible de se tromper de case.</p>`,
  lesson: `<h3>gRPC en une phrase</h3>
<p><strong>gRPC</strong> est une façon d'appeler une méthode située sur un autre serveur comme si elle était locale. Tu écris <code>await client.GetOrderAsync(request)</code>, et gRPC s'occupe du réseau. Il a été créé par Google et il est intégré à ASP.NET Core.</p>
<p>Il repose sur deux choses : <strong>HTTP/2</strong> pour le transport (plusieurs appels sur une seule connexion, en-têtes compressés) et <strong>Protocol Buffers</strong> (« protobuf ») pour les données, un format binaire bien plus compact que JSON.</p>

<h3>Le contrat d'abord : le fichier .proto</h3>
<p>Tout part d'un fichier <code>.proto</code> qui décrit les <strong>services</strong> (les méthodes appelables) et les <strong>messages</strong> (les données échangées). Chaque champ a un type et un <strong>numéro</strong> unique. C'est ce numéro, pas le nom, qui circule sur le réseau.</p>
<div class="flow"><span>orders.proto</span><span>Grpc.Tools génère le C#</span><span>Serveur : classe de base</span><span>Client : classe d'appel</span></div>
<p>À la compilation, le package <code>Grpc.Tools</code> lit le <code>.proto</code> et génère des classes C#. Côté serveur, tu hérites d'une classe de base et tu écris le corps des méthodes. Côté client, tu obtiens une classe prête à l'emploi. C'est un peu comme générer un client TypeScript à partir d'un fichier OpenAPI.</p>
<div class="tip">Ne change jamais le numéro d'un champ existant et ne réutilise jamais un numéro supprimé : les anciens clients liraient la mauvaise donnée. Pour faire évoluer un message, on <strong>ajoute</strong> des champs avec de nouveaux numéros.</div>

<h3>REST ou gRPC ?</h3>
<table>
<tr><th>Critère</th><th>REST + JSON</th><th>gRPC</th></tr>
<tr><td>Format</td><td>Texte lisible</td><td>Binaire compact</td></tr>
<tr><td>Contrat</td><td>Optionnel (OpenAPI)</td><td>Obligatoire (<code>.proto</code>)</td></tr>
<tr><td>Navigateur</td><td>Natif</td><td>Pas directement (il faut gRPC-Web)</td></tr>
<tr><td>Streaming</td><td>Limité</td><td>Natif, dans les deux sens</td></tr>
<tr><td>Usage typique</td><td>API publique, front Angular</td><td>Communication entre services internes</td></tr>
</table>
<p>Pour OrderFlow, le front Angular continue de parler REST. gRPC devient intéressant si, demain, un service interne (par exemple un service d'entrepôt) appelle l'API des milliers de fois par seconde.</p>

<h3>Quatre façons d'appeler</h3>
<p>Un <code>rpc</code> n'est pas forcément « une question, une réponse ». Le mot-clé <code>stream</code> devant un message change le type d'appel :</p>
<table>
<tr><th>Type</th><th>Déclaration</th><th>Exemple OrderFlow</th></tr>
<tr><td>Unaire</td><td><code>rpc GetOrder (Req) returns (Reply)</code></td><td>Lire une commande</td></tr>
<tr><td>Streaming serveur</td><td><code>returns (stream Reply)</code></td><td>Suivre les statuts d'une commande en continu</td></tr>
<tr><td>Streaming client</td><td><code>rpc Import (stream Line)</code></td><td>Envoyer un gros import de lignes</td></tr>
<tr><td>Bidirectionnel</td><td><code>stream</code> des deux côtés</td><td>Une conversation continue entre deux services</td></tr>
</table>
<p>Dans un premier temps, l'appel unaire couvre l'essentiel des besoins. Garde le streaming en tête pour les gros volumes ou le suivi en direct.</p>

<h3>Les erreurs en gRPC</h3>
<p>gRPC n'utilise pas les codes HTTP 404 ou 500 dans ton code. Il a ses propres <strong>codes de statut</strong> : <code>NotFound</code>, <code>InvalidArgument</code>, <code>PermissionDenied</code>, <code>Unavailable</code>… Côté serveur, tu lances une <code>RpcException</code> ; côté client, tu l'attrapes et tu lis <code>StatusCode</code>.</p>
<pre class="diagram">
 Client                          Serveur
 GetOrderAsync(Id = 7) --HTTP/2--&gt; GetOrder()
                                   commande absente
   RpcException     &lt;--statut---  throw RpcException
   StatusCode = NotFound          (NotFound, "...")
</pre>
<div class="note">gRPC brille aussi pour le <em>streaming</em> : un serveur peut envoyer un flux continu de messages (<code>returns (stream OrderReply)</code>), consommé côté client avec <code>await foreach</code>. Pense aussi aux <em>deadlines</em> : passe toujours <code>deadline: DateTime.UtcNow.AddSeconds(5)</code> à un appel, sinon un service lent bloque toute la chaîne.</div>`,
  examples: [
    {
      title: "Le contrat orders.proto",
      code: `// Fichier : Protos/orders.proto (le contrat, partagé client et serveur)
syntax = "proto3";

option csharp_namespace = "OrderFlow.Grpc";

package orders;

// Le service : la liste des méthodes appelables
service OrderService {
  rpc GetOrder (GetOrderRequest) returns (OrderReply);
}

// Les messages : chaque champ a un type et un numéro unique
message GetOrderRequest {
  int32 id = 1;
}

message OrderReply {
  int32 id = 1;
  string customer_name = 2;
  string status = 3;
  int64 total_cents = 4;   // l'argent en centimes : pas de double
}`,
      output: ``,
      steps: [
        `<code>syntax = "proto3";</code> : la version actuelle du langage protobuf.`,
        `<code>option csharp_namespace = "OrderFlow.Grpc";</code> : le namespace des classes C# générées.`,
        `<code>rpc GetOrder (GetOrderRequest) returns (OrderReply);</code> : une méthode qui reçoit un message et en renvoie un autre.`,
        `<code>int32 id = 1;</code> : un champ entier portant le numéro 1. Le numéro identifie le champ sur le réseau.`,
        `<code>string customer_name = 2;</code> : en C#, le générateur produira la propriété <code>CustomerName</code>.`,
        `<code>int64 total_cents = 4;</code> : protobuf n'a pas de type <code>decimal</code>. Pour un montant, on transmet des centimes entiers plutôt qu'un <code>double</code> imprécis.`
      ],
      explain: "Dans le .csproj du serveur, on déclare le fichier avec <code>&lt;Protobuf Include=\"Protos/orders.proto\" GrpcServices=\"Server\" /&gt;</code> ; côté client, <code>GrpcServices=\"Client\"</code>."
    },
    {
      title: "Le service côté serveur",
      code: `// Fichier : Services/OrderGrpcService.cs
using Grpc.Core;
using OrderFlow.Grpc;

// OrderService.OrderServiceBase est générée à partir du .proto
public class OrderGrpcService : OrderService.OrderServiceBase
{
    public override Task<OrderReply> GetOrder(GetOrderRequest request, ServerCallContext context)
    {
        if (request.Id != 42)
            throw new RpcException(new Status(StatusCode.NotFound, $"Commande {request.Id} introuvable"));

        return Task.FromResult(new OrderReply
        {
            Id = request.Id,
            CustomerName = "Alice",
            Status = "Paid",
            TotalCents = 5990
        });
    }
}

// Fichier : Program.cs (serveur)
// dotnet add package Grpc.AspNetCore
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);

// gRPC exige HTTP/2 : ici en clair sur le port 5090, pour la démo locale
builder.WebHost.ConfigureKestrel(k =>
    k.ListenLocalhost(5090, o => o.Protocols = HttpProtocols.Http2));

builder.Services.AddGrpc();

var app = builder.Build();
app.MapGrpcService<OrderGrpcService>();
app.Run();`,
      output: ``,
      steps: [
        `<code>class OrderGrpcService : OrderService.OrderServiceBase</code> : on hérite de la classe générée et on redéfinit ses méthodes.`,
        `<code>override Task&lt;OrderReply&gt; GetOrder(...)</code> : la signature vient du <code>.proto</code>. <code>ServerCallContext</code> donne accès aux en-têtes, à la deadline et au <code>CancellationToken</code>.`,
        `<code>throw new RpcException(new Status(StatusCode.NotFound, ...))</code> : l'équivalent gRPC d'un 404.`,
        `<code>k.ListenLocalhost(5090, o =&gt; o.Protocols = HttpProtocols.Http2)</code> : gRPC a besoin d'HTTP/2. Sans HTTPS, il faut l'imposer explicitement sur un port.`,
        `<code>builder.Services.AddGrpc();</code> puis <code>app.MapGrpcService&lt;OrderGrpcService&gt;();</code> : même logique que <code>AddSignalR</code> et <code>MapHub</code>.`
      ],
      explain: "En vrai, le service injecterait OrderFlowDbContext dans son constructeur, exactement comme un endpoint REST."
    },
    {
      title: "Le client console",
      code: `// Fichier : Program.cs (client console)
// dotnet add package Grpc.Net.Client
// dotnet add package Google.Protobuf
// dotnet add package Grpc.Tools
using Grpc.Core;
using Grpc.Net.Client;
using OrderFlow.Grpc;

using var channel = GrpcChannel.ForAddress("http://localhost:5090");
var client = new OrderService.OrderServiceClient(channel); // classe générée

OrderReply order = await client.GetOrderAsync(new GetOrderRequest { Id = 42 });
Console.WriteLine($"#{order.Id} {order.CustomerName} {order.Status} {order.TotalCents} centimes");

try
{
    await client.GetOrderAsync(new GetOrderRequest { Id = 7 });
}
catch (RpcException ex)
{
    Console.WriteLine($"{ex.StatusCode} : {ex.Status.Detail}");
}`,
      output: `#42 Alice Paid 5990 centimes
NotFound : Commande 7 introuvable`,
      steps: [
        `<code>GrpcChannel.ForAddress(...)</code> : la connexion HTTP/2 vers le serveur. On la crée une fois et on la réutilise.`,
        `<code>new OrderService.OrderServiceClient(channel)</code> : le client généré à partir du <code>.proto</code> (copié dans le projet client).`,
        `<code>await client.GetOrderAsync(...)</code> : un appel réseau qui ressemble à un appel de méthode. Une version <code>Async</code> est générée pour chaque <code>rpc</code>.`,
        `<code>order.TotalCents</code> : les noms en <code>snake_case</code> du proto deviennent du <code>PascalCase</code> en C#.`,
        `<code>catch (RpcException ex)</code> : l'erreur du serveur arrive avec son code (<code>NotFound</code>) et son message.`
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ajouter un champ au contrat",
      prompt: `<p>Ajoute au message <code>OrderReply</code> un champ <code>order_date</code> de type <code>string</code> (date au format ISO). Quel numéro lui donnes-tu, et quel nom aura la propriété C# générée ?</p>`,
      hint: `<p>Les numéros 1 à 4 sont déjà pris. On n'en réutilise jamais un.</p>`,
      solution: `message OrderReply {
  int32 id = 1;
  string customer_name = 2;
  string status = 3;
  int64 total_cents = 4;
  string order_date = 5;   // nouveau champ, nouveau numéro
}

// Propriété C# générée : OrderDate
// Côté serveur : OrderDate = DateTime.UtcNow.ToString("O")`
    },
    {
      level: "moyen",
      title: "Valider l'entrée",
      prompt: `<p>Dans <code>GetOrder</code>, si <code>request.Id</code> est inférieur ou égal à 0, lance une <code>RpcException</code> avec le code <code>InvalidArgument</code> et le message « L'identifiant doit être positif ». Côté client, appelle avec <code>Id = -1</code> et affiche le code reçu.</p>`,
      hint: `<p>Place ce test avant celui du <code>NotFound</code> : une entrée invalide n'est pas une commande absente.</p>`,
      solution: `// Serveur : début de GetOrder
if (request.Id <= 0)
    throw new RpcException(new Status(StatusCode.InvalidArgument, "L'identifiant doit être positif"));

// Client
try
{
    await client.GetOrderAsync(new GetOrderRequest { Id = -1 });
}
catch (RpcException ex)
{
    Console.WriteLine(ex.StatusCode); // InvalidArgument
}`
    },
    {
      level: "difficile",
      title: "Un appel avec deadline",
      prompt: `<p>Passe une deadline de 2 secondes à l'appel client. Côté serveur, simule un traitement lent avec <code>await Task.Delay(5000, context.CancellationToken)</code> (la méthode devient <code>async</code>). Attrape l'exception côté client et affiche son code.</p>`,
      hint: `<p>Le paramètre s'appelle <code>deadline</code> et attend un <code>DateTime</code> UTC. Le code attendu est <code>DeadlineExceeded</code>.</p>`,
      solution: `// Serveur
public override async Task<OrderReply> GetOrder(GetOrderRequest request, ServerCallContext context)
{
    // Le token est annulé quand la deadline du client expire
    await Task.Delay(5000, context.CancellationToken);
    return new OrderReply { Id = request.Id, CustomerName = "Alice", Status = "Paid" };
}

// Client
try
{
    await client.GetOrderAsync(
        new GetOrderRequest { Id = 42 },
        deadline: DateTime.UtcNow.AddSeconds(2));
}
catch (RpcException ex)
{
    Console.WriteLine(ex.StatusCode); // DeadlineExceeded
}`
    }
  ],
  quiz: [
    {
      q: `Dans un message protobuf, qu'est-ce qui identifie un champ sur le réseau ?`,
      options: ["Son nom", "Son numéro", "Sa position dans le fichier"],
      answer: 1,
      why: `Le binaire protobuf contient le numéro du champ, pas son nom. C'est pourquoi on peut renommer un champ sans casser les clients, mais jamais changer son numéro.`
    },
    {
      q: `Quel protocole de transport gRPC exige-t-il ?`,
      options: ["HTTP/1.1", "WebSocket", "HTTP/2"],
      answer: 2,
      why: `gRPC s'appuie sur HTTP/2 (multiplexage, streaming). C'est aussi pour ça qu'un navigateur ne peut pas l'appeler directement sans gRPC-Web.`
    },
    {
      q: `Pour le front Angular d'OrderFlow, que choisir ?`,
      options: ["REST + JSON, natif dans le navigateur", "gRPC, car il est plus rapide", "Les deux obligatoirement"],
      answer: 0,
      why: `Le navigateur ne parle pas gRPC nativement. REST reste le bon choix pour un front. gRPC sert surtout entre services internes.`
    },
    {
      q: `Comment un service gRPC signale-t-il une commande introuvable ?`,
      options: ["Il renvoie <code>null</code>", "Il lance <code>RpcException</code> avec <code>StatusCode.NotFound</code>", "Il renvoie <code>Results.NotFound()</code>"],
      answer: 1,
      why: `gRPC a ses propres codes de statut. <code>Results.NotFound()</code> appartient aux Minimal APIs HTTP, et un message protobuf ne peut pas être <code>null</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : un service de stock en gRPC.</strong> Ajoute un <code>stock.proto</code> avec un service <code>StockService</code> et une méthode <code>CheckStock (CheckStockRequest) returns (CheckStockReply)</code> qui prend un <code>product_id</code> et une <code>quantity</code> et renvoie un booléen <code>available</code> et le <code>stock</code> restant. Implémente-le avec <code>OrderFlowDbContext</code> et appelle-le depuis un petit client console.</p>`,
  resources: [
    { label: "gRPC sur .NET (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/grpc/" },
    { label: "Comparer gRPC et les API HTTP", url: "https://learn.microsoft.com/fr-fr/aspnet/core/grpc/comparison" }
  ]
});

// =====================================================================
// Bonus : .NET Aspire
// =====================================================================
window.COURSE.push({
  key: "bon-aspire",
  title: ".NET Aspire : orchestrer une application distribuée",
  summary: "Tu sauras décrire OrderFlow (API, front, SQL Server) dans un AppHost Aspire et le lancer d'une seule commande avec son tableau de bord.",
  objectives: [
    "Comprendre le rôle de l'AppHost et des ServiceDefaults",
    "Déclarer des ressources (SQL Server, projets) et leurs références",
    "Laisser Aspire injecter chaînes de connexion et adresses",
    "Lire logs, traces et métriques dans le tableau de bord"
  ],
  analogy: `<p>Monter OrderFlow à la main, c'est comme <strong>cuisiner un repas de fête seul</strong> : lancer le four (SQL Server), préparer l'entrée (l'API), le plat (le front), en surveillant tout en même temps et en notant les temps de cuisson sur des post-it.</p>
<p>Aspire, c'est le <strong>chef d'orchestre en cuisine</strong> : tu lui donnes la recette une fois (l'AppHost), il allume chaque poste dans le bon ordre, transmet à chacun ce dont il a besoin, et affiche sur un grand écran ce qui se passe partout.</p>`,
  lesson: `<h3>Le problème : trop de pièces à lancer</h3>
<p>Une vraie application, c'est rarement un seul projet. OrderFlow a déjà une API, une base SQL Server, peut-être un front et un worker demain. En local, il faut tout démarrer dans le bon ordre, recopier les chaînes de connexion et les ports dans chaque <code>appsettings.json</code>, puis chercher les logs dans quatre terminaux différents.</p>
<p><strong>.NET Aspire</strong> (aujourd'hui simplement « Aspire ») répond à ça. C'est un ensemble d'outils pour <strong>décrire</strong> ton application distribuée en C#, la <strong>lancer</strong> d'une commande et l'<strong>observer</strong> dans un tableau de bord.</p>

<h3>Les trois pièces d'Aspire</h3>
<table>
<tr><th>Pièce</th><th>Rôle</th></tr>
<tr><td>AppHost</td><td>Un projet console qui décrit les ressources (bases, conteneurs, projets) et leurs liens. C'est le « plan » de l'application.</td></tr>
<tr><td>ServiceDefaults</td><td>Une bibliothèque partagée qui ajoute à chaque service : OpenTelemetry (logs, traces, métriques), health checks, résilience HTTP et découverte de services.</td></tr>
<tr><td>Intégrations</td><td>Des packages NuGet prêts à l'emploi : <code>Aspire.Hosting.SqlServer</code> côté AppHost, <code>Aspire.Microsoft.EntityFrameworkCore.SqlServer</code> côté API, et des dizaines d'autres (Redis, PostgreSQL, RabbitMQ…).</td></tr>
</table>
<div class="flow"><span>AppHost</span><span>lance SQL (Docker)</span><span>lance l'API</span><span>lance le front</span><span>Tableau de bord</span></div>

<h3>Références : fini les chaînes de connexion recopiées</h3>
<p>Dans l'AppHost, <code>api.WithReference(db)</code> signifie « l'API a besoin de cette base ». Au lancement, Aspire injecte dans l'API une variable d'environnement <code>ConnectionStrings__orderflow</code>. Côté API, <code>builder.AddSqlServerDbContext&lt;OrderFlowDbContext&gt;("orderflow")</code> la lit et configure EF Core, avec health check et traces en prime.</p>
<p>Même idée entre services : <code>web.WithReference(api)</code> permet au front d'appeler <code>https+http://api</code>. Le nom <code>api</code> est résolu en vraie adresse grâce à la <strong>découverte de services</strong>. Plus aucun port codé en dur.</p>
<pre class="diagram">
 AppHost
   sql (conteneur) -- db "orderflow"
                         |  ConnectionStrings__orderflow
                         v
   api (projet) &lt;------- WithReference(db)
     ^
     |  services__api__http__0 = http://localhost:5xxx
   web (projet) -------- WithReference(api)
</pre>
<div class="tip"><code>WithReference</code> transmet l'information, mais ne fait pas attendre. Ajoute <code>WaitFor(db)</code> pour que l'API ne démarre qu'une fois SQL Server prêt, sinon les premières requêtes échouent pendant que le conteneur s'initialise.</div>

<h3>Le tableau de bord</h3>
<p>Lancer l'AppHost (<code>dotnet run</code> dans son dossier, ou <code>aspire run</code> avec la CLI Aspire) ouvre un tableau de bord web. On y voit chaque ressource et son état, les logs de tous les services au même endroit, les <strong>traces distribuées</strong> (une requête qui part du front, passe par l'API et finit en SQL, sur une seule frise) et les métriques. C'est OpenTelemetry, configuré pour toi par ServiceDefaults.</p>
<div class="compare"><div><h4>Sans Aspire</h4><p>4 terminaux, des ports dans des fichiers de config, un <code>docker run</code> à retenir, des logs éparpillés.</p></div><div><h4>Avec Aspire</h4><p>Un <code>dotnet run</code>, des références déclarées en C#, un tableau de bord unique.</p></div></div>

<h3>Ce qu'Aspire n'est pas</h3>
<p>Aspire n'est pas un hébergeur. En développement, il orchestre tout sur ta machine (il faut Docker ou Podman pour les conteneurs). Pour la production, il sait générer des artefacts de déploiement (Docker Compose, Kubernetes, Azure Container Apps), mais tu restes libre de déployer autrement. Une API sans Aspire continue de fonctionner : les ServiceDefaults ne sont que des appels de configuration.</p>
<div class="note">Le vrai gain senior est l'<em>observabilité par défaut</em> : chaque service émet les mêmes traces et métriques dès le premier jour. Les tests d'intégration peuvent aussi démarrer tout l'AppHost avec <code>Aspire.Hosting.Testing</code> pour tester l'API contre une vraie base dans un conteneur.</div>`,
  examples: [
    {
      title: "L'AppHost d'OrderFlow",
      code: `// Fichier : OrderFlow.AppHost/AppHost.cs
// dotnet add package Aspire.Hosting.SqlServer
var builder = DistributedApplication.CreateBuilder(args);

// 1. Une ressource SQL Server (Aspire lance un conteneur Docker)
var sql = builder.AddSqlServer("sql")
                 .WithDataVolume();           // les données survivent au redémarrage
var db = sql.AddDatabase("orderflow");        // nom de la chaîne de connexion

// 2. Notre API, qui reçoit la chaîne de connexion automatiquement
var api = builder.AddProject<Projects.OrderFlow_Api>("api")
                 .WithReference(db)           // injecte ConnectionStrings__orderflow
                 .WaitFor(db);                // attend que la base soit prête

// 3. Un front qui appelle l'API par son nom
builder.AddProject<Projects.OrderFlow_Web>("web")
       .WithReference(api)                    // découverte de service : "api"
       .WaitFor(api)
       .WithExternalHttpEndpoints();

builder.Build().Run();`,
      output: `info: Aspire.Hosting.DistributedApplication[0]
      Aspire version: 13.6.4
info: Aspire.Hosting.DistributedApplication[0]
      Distributed application starting.
info: Aspire.Hosting.DistributedApplication[0]
      Now listening on: https://localhost:17043
info: Aspire.Hosting.DistributedApplication[0]
      Login to the dashboard at https://localhost:17043/login?t=3f9c2a...
info: Aspire.Hosting.DistributedApplication[0]
      Distributed application started. Press Ctrl+C to shut down.`,
      steps: [
        `<code>DistributedApplication.CreateBuilder(args)</code> : le point de départ de l'AppHost, comme <code>WebApplication.CreateBuilder</code> pour une API.`,
        `<code>builder.AddSqlServer("sql").WithDataVolume()</code> : déclare un conteneur SQL Server avec un volume Docker pour garder les données. Le mot de passe est généré et stocké dans les secrets utilisateur.`,
        `<code>sql.AddDatabase("orderflow")</code> : une base dans ce serveur. Son nom devient le nom de la chaîne de connexion.`,
        `<code>AddProject&lt;Projects.OrderFlow_Api&gt;("api")</code> : la classe <code>Projects.OrderFlow_Api</code> est générée grâce à la référence de projet dans le <code>.csproj</code> de l'AppHost.`,
        `<code>.WithReference(db).WaitFor(db)</code> : injecte la chaîne de connexion et attend que la base réponde avant de démarrer l'API.`,
        `<code>.WithExternalHttpEndpoints()</code> : rend le front accessible de l'extérieur une fois déployé. La sortie est un exemple de démarrage (le jeton et le port changent à chaque fois).`
      ],
      explain: "Cet exemple a été compilé ; son exécution nécessite Docker pour le conteneur SQL Server."
    },
    {
      title: "L'API branchée sur Aspire",
      code: `// Fichier : OrderFlow.Api/Program.cs
// dotnet add package Aspire.Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();   // logs, traces, métriques, health checks, résilience

// Lit "ConnectionStrings:orderflow" fournie par l'AppHost
builder.AddSqlServerDbContext<OrderFlowDbContext>("orderflow");

var app = builder.Build();

app.MapDefaultEndpoints();      // /health et /alive (en développement)

app.MapGet("/api/products", async (OrderFlowDbContext db) =>
    await db.Products.OrderBy(p => p.Name).ToListAsync());

app.Run();

public class OrderFlowDbContext(DbContextOptions<OrderFlowDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products => Set<Product>();
}

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }
}`,
      output: `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

[{"id":2,"name":"Clavier","price":49.90,"stock":12},{"id":1,"name":"Souris","price":19.90,"stock":40}]`,
      steps: [
        `<code>builder.AddServiceDefaults();</code> : une méthode d'extension du projet <code>OrderFlow.ServiceDefaults</code>, référencé par l'API. Elle configure OpenTelemetry, les health checks et la résilience des <code>HttpClient</code>.`,
        `<code>builder.AddSqlServerDbContext&lt;OrderFlowDbContext&gt;("orderflow")</code> : remplace <code>AddDbContext</code> + <code>UseSqlServer</code>. Elle ajoute aussi un health check de la base et les traces des requêtes SQL.`,
        `<code>"orderflow"</code> : doit correspondre exactement au nom donné dans <code>sql.AddDatabase("orderflow")</code>.`,
        `<code>app.MapDefaultEndpoints();</code> : expose <code>/health</code> (prêt à servir ?) et <code>/alive</code> (le processus vit-il ?), utilisés par le tableau de bord.`,
        `<code>app.MapGet("/api/products", ...)</code> : un endpoint ordinaire. Rien ne change dans ton code métier.`
      ],
      explain: "Sortie réaliste pour une base contenant deux produits ; l'exemple a été compilé, pas exécuté (pas de Docker sur la machine de test)."
    },
    {
      title: "Un service qui appelle l'API par son nom",
      code: `// Fichier : OrderFlow.Web/Program.cs (un autre service qui appelle l'API)
var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();     // active aussi la découverte de services

// "api" est le NOM de la ressource dans l'AppHost, pas une vraie adresse
builder.Services.AddHttpClient("orderflow-api", client =>
    client.BaseAddress = new Uri("https+http://api"));

var app = builder.Build();
app.MapDefaultEndpoints();

app.MapGet("/", async (IHttpClientFactory factory) =>
{
    var http = factory.CreateClient("orderflow-api");
    string json = await http.GetStringAsync("/api/products");
    return Results.Content(json, "application/json");
});

app.Run();`,
      output: `HTTP/1.1 200 OK
Content-Type: application/json

[{"id":2,"name":"Clavier","price":49.90,"stock":12},{"id":1,"name":"Souris","price":19.90,"stock":40}]`,
      steps: [
        `<code>builder.AddServiceDefaults();</code> : active la découverte de services et la résilience (nouvelles tentatives, timeout) sur tous les <code>HttpClient</code>.`,
        `<code>new Uri("https+http://api")</code> : « essaie HTTPS, sinon HTTP, sur le service nommé <code>api</code> ». Aspire a fourni l'adresse réelle par variable d'environnement.`,
        `<code>AddHttpClient("orderflow-api", ...)</code> : un client nommé, créé par <code>IHttpClientFactory</code>. C'est l'équivalent d'un service Angular qui encapsule <code>HttpClient</code>.`,
        `<code>http.GetStringAsync("/api/products")</code> : l'appel part vers l'API. Dans le tableau de bord, tu verras une seule trace qui traverse les deux services jusqu'à SQL.`
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Lire un AppHost",
      prompt: `<p>Sans exécuter, réponds à partir de l'exemple 1 : combien de ressources le tableau de bord affichera-t-il ? Quel service démarre en dernier, et pourquoi ? Quelle variable d'environnement l'API reçoit-elle pour la base ?</p>`,
      hint: `<p>Compte <code>sql</code>, <code>orderflow</code>, <code>api</code> et <code>web</code>. Suis les <code>WaitFor</code>.</p>`,
      solution: `Ressources : 4 (sql, orderflow, api, web).

Ordre : sql -> orderflow prête -> api (WaitFor(db)) -> web (WaitFor(api)).
web démarre en dernier car il attend que l'API soit saine.

Variable reçue par l'API : ConnectionStrings__orderflow
(lue par builder.AddSqlServerDbContext<OrderFlowDbContext>("orderflow")).`
    },
    {
      level: "moyen",
      title: "Ajouter un cache Redis",
      prompt: `<p>Ajoute à l'AppHost une ressource Redis nommée <code>cache</code> et passe-la à l'API. Côté API, enregistre le cache distribué avec l'intégration Aspire. Écris les deux extraits et les commandes <code>dotnet add package</code>.</p>`,
      hint: `<p>Côté AppHost : <code>builder.AddRedis("cache")</code> (package <code>Aspire.Hosting.Redis</code>). Côté API : <code>builder.AddRedisDistributedCache("cache")</code> (package <code>Aspire.StackExchange.Redis.DistributedCaching</code>).</p>`,
      solution: `// AppHost
// dotnet add package Aspire.Hosting.Redis
var cache = builder.AddRedis("cache");

var api = builder.AddProject<Projects.OrderFlow_Api>("api")
                 .WithReference(db)
                 .WithReference(cache)
                 .WaitFor(db)
                 .WaitFor(cache);

// OrderFlow.Api/Program.cs
// dotnet add package Aspire.StackExchange.Redis.DistributedCaching
builder.AddRedisDistributedCache("cache"); // enregistre IDistributedCache`
    },
    {
      level: "difficile",
      title: "Une trace métier personnalisée",
      prompt: `<p>Dans l'API, crée une <code>ActivitySource</code> nommée comme l'application et enveloppe la création d'une commande dans une activité <code>CreateOrder</code> avec un tag <code>order.customer_id</code>. Explique pourquoi elle apparaît dans le tableau de bord sans configuration supplémentaire.</p>`,
      hint: `<p>Dans ServiceDefaults, le traçage écoute <code>builder.Environment.ApplicationName</code>. Utilise <code>using var activity = source.StartActivity("CreateOrder");</code> puis <code>activity?.SetTag(...)</code>.</p>`,
      solution: `using System.Diagnostics;

// Même nom que l'application : ServiceDefaults écoute déjà cette source
var source = new ActivitySource(builder.Environment.ApplicationName);
builder.Services.AddSingleton(source);

app.MapPost("/api/orders", async (CreateOrderRequest dto, ActivitySource source, OrderFlowDbContext db) =>
{
    using var activity = source.StartActivity("CreateOrder");
    activity?.SetTag("order.customer_id", dto.CustomerId);

    // ... création de la commande ...
    await db.SaveChangesAsync();
    return Results.Created();
});

// Pourquoi ça marche : ServiceDefaults appelle
// tracing.AddSource(builder.Environment.ApplicationName)
// et exporte vers le tableau de bord via OTLP.`
    }
  ],
  quiz: [
    {
      q: `Quel est le rôle de l'AppHost ?`,
      options: ["Héberger l'API en production", "Décrire en C# les ressources de l'application et leurs liens, puis les lancer en local", "Remplacer EF Core"],
      answer: 1,
      why: `L'AppHost est le plan de l'application : il déclare bases, conteneurs et projets, et les orchestre en développement. Ce n'est pas un serveur de production.`
    },
    {
      q: `Que fait <code>api.WithReference(db)</code> ?`,
      options: ["Il injecte la chaîne de connexion de la base dans l'API", "Il crée les tables", "Il fait attendre l'API jusqu'à ce que la base soit prête"],
      answer: 0,
      why: `<code>WithReference</code> transmet l'information (variable <code>ConnectionStrings__orderflow</code>). Attendre la base, c'est le rôle de <code>WaitFor</code>. Créer les tables reste le travail des migrations EF Core.`
    },
    {
      q: `Que vaut l'adresse <code>https+http://api</code> dans un service Aspire ?`,
      options: ["Une adresse invalide", "Le site public api.com", "Le service nommé « api » dans l'AppHost, résolu par la découverte de services"],
      answer: 2,
      why: `La découverte de services remplace le nom logique par l'adresse réelle fournie par Aspire, en préférant HTTPS.`
    },
    {
      q: `Qu'apporte <code>builder.AddServiceDefaults()</code> à un service ?`,
      options: ["Une base de données en mémoire", "OpenTelemetry, health checks, résilience HTTP et découverte de services", "L'authentification JWT"],
      answer: 1,
      why: `Le projet ServiceDefaults regroupe la configuration commune d'observabilité et de résilience, pour que tous les services se comportent pareil.`
    }
  ],
  project: `<p><strong>OrderFlow orchestré.</strong> Ajoute à ta solution un AppHost et un projet ServiceDefaults (<code>dotnet new aspire-apphost</code> et <code>dotnet new aspire-servicedefaults</code>). Déclare SQL Server avec la base <code>orderflow</code> et ton API avec <code>WithReference</code> et <code>WaitFor</code>. Dans l'API, remplace <code>AddDbContext</code> par <code>AddSqlServerDbContext&lt;OrderFlowDbContext&gt;("orderflow")</code>. Lance l'AppHost, appelle <code>GET /api/products</code> et retrouve la trace de la requête SQL dans le tableau de bord.</p>`,
  resources: [
    { label: "Documentation officielle d'Aspire", url: "https://aspire.dev/" },
    { label: "Vue d'ensemble de .NET Aspire (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/aspire/get-started/aspire-overview" }
  ]
});

// =====================================================================
// Bonus : Projet final
// =====================================================================
window.COURSE.push({
  key: "bon-final-project",
  title: "Projet final : durcir l'API OrderFlow",
  summary: "Tu sauras appliquer une checklist de durcissement à l'API OrderFlow : limitation de débit, erreurs propres, en-têtes de sécurité et requêtes idempotentes.",
  objectives: [
    "Passer d'une API qui marche à une API qui résiste aux mauvais usages",
    "Limiter le débit par client avec le rate limiting intégré",
    "Renvoyer des erreurs ProblemDetails sans fuite d'information",
    "Rendre la création de commande idempotente"
  ],
  analogy: `<p>Ton API, c'est une <strong>boutique qui vient d'ouvrir</strong>. Elle fonctionne quand les clients sont polis. Le durcissement, c'est tout ce qu'on ajoute avant l'affluence : un vigile qui limite l'entrée (rate limiting), une serrure sur la réserve (autorisation), un vendeur qui dit « désolé, problème technique » sans montrer le coffre (erreurs propres), et un ticket numéroté pour ne pas encaisser deux fois le même achat (idempotence).</p>`,
  lesson: `<h3>« Ça marche » n'est pas « ça tient »</h3>
<p>Une API de démo répond aux bons appels. Une API de production survit aux mauvais : un client qui boucle, un jeton volé, un champ inattendu dans le JSON, un double clic sur « Commander ». Ce projet final est une <strong>checklist</strong> à appliquer à OrderFlow, point par point, chacun avec un test.</p>
<div class="flow"><span>Sécurité</span><span>Limites</span><span>Erreurs</span><span>Idempotence</span><span>Vérification</span></div>

<h3>La checklist sécurité</h3>
<table>
<tr><th>Point</th><th>Ce qu'on fait</th></tr>
<tr><td>Secrets</td><td>Rien dans <code>appsettings.json</code>. <code>dotnet user-secrets</code> en local, variables d'environnement ou coffre (Key Vault) en production.</td></tr>
<tr><td>Autorisation par défaut</td><td>Une <code>FallbackPolicy</code> qui exige un utilisateur authentifié. Un endpoint oublié est fermé, pas ouvert. Les routes publiques le disent avec <code>AllowAnonymous()</code>.</td></tr>
<tr><td>Accès aux données</td><td>Vérifier que la commande 42 appartient bien à l'utilisateur connecté (sinon faille IDOR, la plus fréquente en API).</td></tr>
<tr><td>Entrées</td><td>Des DTO dédiés, jamais les entités EF. Sans champ <code>Status</code> dans <code>CreateOrderRequest</code>, impossible de créer une commande déjà payée.</td></tr>
<tr><td>Transport</td><td><code>UseHttpsRedirection</code>, <code>UseHsts</code> hors développement, CORS limité aux origines du front.</td></tr>
<tr><td>Erreurs</td><td>ProblemDetails sans stack trace. Le détail va dans les logs, le client reçoit un <code>traceId</code>.</td></tr>
</table>
<div class="tip">Teste chaque point avec une requête qui <em>doit échouer</em> : appel sans jeton, commande d'un autre client, JSON avec un champ <code>status</code>. Un durcissement non testé n'existe pas.</div>

<h3>Limiter le débit</h3>
<p>Le <strong>rate limiting</strong> (limitation de débit) est intégré à ASP.NET Core. Tu déclares une politique avec <code>AddRateLimiter</code>, tu actives le middleware avec <code>UseRateLimiter</code>, et tu l'appliques à un endpoint avec <code>RequireRateLimiting</code>. Quatre algorithmes existent : fenêtre fixe, fenêtre glissante, seau à jetons (<em>token bucket</em>) et concurrence (nombre de requêtes simultanées).</p>
<p>Le point clé est la <strong>partition</strong> : un compteur par client (par utilisateur ou par adresse IP). Une limite globale punirait tout le monde à cause d'un seul client trop bavard. Pense à fixer <code>RejectionStatusCode</code> à 429 : la valeur par défaut est 503, trompeuse.</p>

<h3>Des erreurs propres</h3>
<p><code>AddProblemDetails()</code> + <code>UseExceptionHandler()</code> transforment toute exception non gérée en réponse 500 au format standard <strong>ProblemDetails</strong> (RFC 9457), avec un <code>traceId</code> pour retrouver le log. <code>UseStatusCodePages()</code> fait de même pour les 404 ou 405 sans corps. Le front Angular n'a plus qu'un seul format d'erreur à gérer dans son intercepteur.</p>

<h3>L'idempotence</h3>
<p>Le réseau coupe, le client réessaie, la commande est créée deux fois. La solution standard : le client envoie un en-tête <code>Idempotency-Key</code> (un GUID par intention d'achat). Le serveur mémorise la réponse associée à cette clé et la renvoie telle quelle si la même clé revient.</p>
<pre class="diagram">
 POST + Idempotency-Key: 7f3c --&gt; clé inconnue
                                   crée la commande 101
                                   mémorise 7f3c -&gt; 101
 &lt;-- 201 Created {id:101}

 (le client réessaie)
 POST + Idempotency-Key: 7f3c --&gt; clé connue
 &lt;-- 200 OK {id:101}              rien n'est recréé
</pre>
<div class="note">Le rate limiter intégré compte <em>par instance</em> : avec 3 réplicas, un client obtient 3 fois la limite. Pour un quota strict, place-le dans la passerelle (YARP, API Management) ou dans un compteur partagé (Redis). De même, le cache d'idempotence doit être partagé (Redis, ou une table SQL avec une contrainte unique sur la clé) dès qu'il y a plusieurs instances.</div>`,
  examples: [
    {
      title: "Limiter la création de commandes par adresse IP",
      code: `// Fichier : Program.cs (OrderFlow.Api)
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests; // 503 par défaut
    options.AddPolicy("orders-write", http =>
        // une partition = un compteur par adresse IP
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: http.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 2,                  // 2 requêtes...
                Window = TimeSpan.FromSeconds(10), // ...toutes les 10 secondes
                QueueLimit = 0                     // pas de file d'attente
            }));
});

var app = builder.Build();
app.UseRateLimiter();

app.MapPost("/api/orders", () => Results.Ok(new { message = "Commande créée" }))
   .RequireRateLimiting("orders-write");

app.Run();`,
      output: `HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"message":"Commande créée"}

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"message":"Commande créée"}

HTTP/1.1 429 Too Many Requests
Content-Length: 0`,
      steps: [
        `<code>options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;</code> : le code standard « trop de requêtes ».`,
        `<code>options.AddPolicy("orders-write", http =&gt; ...)</code> : une politique nommée, calculée pour chaque requête.`,
        `<code>RateLimitPartition.GetFixedWindowLimiter(partitionKey: ...)</code> : un compteur séparé par adresse IP. Avec un utilisateur authentifié, on prendrait plutôt son identifiant.`,
        `<code>PermitLimit = 2</code>, <code>Window = TimeSpan.FromSeconds(10)</code> : 2 requêtes par fenêtre de 10 secondes (valeurs basses pour la démo).`,
        `<code>app.UseRateLimiter();</code> puis <code>.RequireRateLimiting("orders-write")</code> : on active le middleware et on applique la politique au seul endpoint d'écriture.`,
        `La sortie montre 3 appels <code>POST /api/orders</code> rapprochés : les deux premiers passent, le troisième est refusé.`
      ]
    },
    {
      title: "Erreurs ProblemDetails et en-têtes de sécurité",
      code: `// Fichier : Program.cs (OrderFlow.Api)
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();   // format d'erreur standard (RFC 9457)

var app = builder.Build();

// En-têtes de sécurité, posés juste avant l'envoi de CHAQUE réponse
app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";
        context.Response.Headers["X-Frame-Options"] = "DENY";
        return Task.CompletedTask;
    });
    await next();
});

app.UseExceptionHandler();   // toute exception -> 500 en ProblemDetails
app.UseStatusCodePages();    // 404, 405... en ProblemDetails aussi

app.MapGet("/api/orders/{id:int}", (int id) =>
{
    if (id == 0)
        throw new InvalidOperationException("Connexion SQL perdue"); // bug simulé
    return Results.Ok(new { id, status = "Pending" });
});

app.Run();`,
      output: `HTTP/1.1 500 Internal Server Error
Content-Type: application/problem+json
X-Content-Type-Options: nosniff
X-Frame-Options: DENY

{"type":"https://tools.ietf.org/html/rfc9110#section-15.6.1","title":"An error occurred while processing your request.","status":500,"traceId":"00-24ba987d09b956edd5875f9c33185d7c-dad79ec051a3cfc6-00"}`,
      steps: [
        `<code>builder.Services.AddProblemDetails();</code> : active la génération de réponses ProblemDetails.`,
        `<code>context.Response.OnStarting(...)</code> : le code s'exécute juste avant l'envoi des en-têtes. Important : le gestionnaire d'exceptions vide les en-têtes déjà posés, alors qu'<code>OnStarting</code> passe après lui.`,
        `<code>app.UseExceptionHandler();</code> : attrape l'exception, la journalise et renvoie un 500 propre.`,
        `<code>app.UseStatusCodePages();</code> : un 404 sans corps devient lui aussi un ProblemDetails.`,
        `La sortie est la réponse à <code>GET /api/orders/0</code> : le message « Connexion SQL perdue » n'apparaît pas, seul le <code>traceId</code> permet de retrouver l'erreur dans les logs.`
      ],
      explain: "Le client ne voit jamais la cause technique, mais le support retrouve tout grâce au traceId."
    },
    {
      title: "Création de commande idempotente",
      code: `// Fichier : Program.cs (OrderFlow.Api)
using Microsoft.Extensions.Caching.Memory;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMemoryCache();
var app = builder.Build();

int nextId = 100; // compteur en mémoire pour la démo (la base en vrai)

app.MapPost("/api/orders", (HttpRequest request, IMemoryCache cache) =>
{
    string? key = request.Headers["Idempotency-Key"];
    if (string.IsNullOrWhiteSpace(key))
        return Results.Problem("En-tête Idempotency-Key obligatoire", statusCode: 400);

    // Déjà vu ? On renvoie la MÊME réponse, sans recréer la commande
    if (cache.TryGetValue(key, out OrderCreated? previous))
        return Results.Ok(previous);

    var order = new OrderCreated(Interlocked.Increment(ref nextId), "Pending");
    cache.Set(key, order, TimeSpan.FromHours(24));
    return Results.Created($"/api/orders/{order.Id}", order);
});

app.Run();

record OrderCreated(int Id, string Status);`,
      output: `HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
Location: /api/orders/101

{"id":101,"status":"Pending"}

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":101,"status":"Pending"}`,
      steps: [
        `<code>request.Headers["Idempotency-Key"]</code> : la clé choisie par le client, la même pour toutes les tentatives d'un même achat.`,
        `<code>Results.Problem(..., statusCode: 400)</code> : sans clé, on refuse avec un ProblemDetails explicite.`,
        `<code>cache.TryGetValue(key, out OrderCreated? previous)</code> : si la clé est connue, on renvoie la commande déjà créée.`,
        `<code>Interlocked.Increment(ref nextId)</code> : incrémente le compteur sans problème si deux requêtes arrivent en même temps.`,
        `<code>cache.Set(key, order, TimeSpan.FromHours(24))</code> : on garde la réponse 24 heures, largement assez pour couvrir les nouvelles tentatives.`,
        `La sortie montre deux <code>POST</code> avec <code>Idempotency-Key: 7f3c</code> : une seule commande (101) est créée.`
      ],
      explain: "En production, la clé est stockée en base dans la même transaction que la commande, avec une contrainte unique : deux requêtes simultanées ne peuvent alors jamais créer deux commandes."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un en-tête Retry-After",
      prompt: `<p>Dans l'exemple 1, quand une requête est refusée, ajoute l'en-tête <code>Retry-After: 10</code> pour dire au client combien de secondes attendre.</p>`,
      hint: `<p><code>options.OnRejected</code> reçoit un contexte avec <code>HttpContext</code> et doit renvoyer un <code>ValueTask</code>.</p>`,
      solution: `builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.OnRejected = (context, cancellationToken) =>
    {
        context.HttpContext.Response.Headers.RetryAfter = "10";
        return ValueTask.CompletedTask;
    };
    // ... AddPolicy("orders-write", ...) comme avant
});`
    },
    {
      level: "moyen",
      title: "Fermer l'API par défaut",
      prompt: `<p>Configure une <code>FallbackPolicy</code> qui exige un utilisateur authentifié sur tous les endpoints, puis ouvre explicitement <code>GET /api/products</code> à tous. Ajoute une authentification JWT Bearer (déjà vue dans la partie 4) pour que le code compile.</p>`,
      hint: `<p><code>AddAuthorizationBuilder().SetFallbackPolicy(...)</code> avec <code>new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build()</code>, et <code>.AllowAnonymous()</code> sur l'endpoint public.</p>`,
      solution: `// dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorizationBuilder()
    .SetFallbackPolicy(new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build());

var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();

// Public : déclaré explicitement
app.MapGet("/api/products", () => Results.Ok(new[] { "Clavier", "Souris" }))
   .AllowAnonymous();

// Fermé par défaut, sans rien écrire : 401 sans jeton
app.MapGet("/api/orders", () => Results.Ok(Array.Empty<string>()));

app.Run();`
    },
    {
      level: "difficile",
      title: "Limite par utilisateur, IP en secours",
      prompt: `<p>Modifie la politique <code>orders-write</code> : si l'utilisateur est authentifié, la partition est son nom (<code>http.User.Identity?.Name</code>) avec 10 requêtes par minute ; sinon, son adresse IP avec 2 requêtes par minute. Utilise un <em>token bucket</em> pour les utilisateurs authentifiés.</p>`,
      hint: `<p>Teste <code>http.User.Identity?.IsAuthenticated == true</code> et renvoie soit <code>RateLimitPartition.GetTokenBucketLimiter</code>, soit <code>GetFixedWindowLimiter</code>. Préfixe les clés (<code>"user:"</code>, <code>"ip:"</code>) pour qu'elles ne se mélangent pas.</p>`,
      solution: `options.AddPolicy("orders-write", http =>
{
    if (http.User.Identity?.IsAuthenticated == true)
    {
        return RateLimitPartition.GetTokenBucketLimiter(
            "user:" + http.User.Identity.Name,
            _ => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 10,                         // rafale max
                TokensPerPeriod = 10,                    // recharge...
                ReplenishmentPeriod = TimeSpan.FromMinutes(1), // ...par minute
                QueueLimit = 0
            });
    }

    return RateLimitPartition.GetFixedWindowLimiter(
        "ip:" + (http.Connection.RemoteIpAddress?.ToString() ?? "unknown"),
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 2,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
});`
    }
  ],
  quiz: [
    {
      q: `Pourquoi partitionner une politique de rate limiting ?`,
      options: ["Pour qu'un seul client bavard ne bloque pas tous les autres", "Pour accélérer les requêtes", "Pour chiffrer les compteurs"],
      answer: 0,
      why: `Avec un compteur global, un client qui boucle épuise la limite pour tout le monde. Une partition par utilisateur ou par IP isole chaque client.`
    },
    {
      q: `Que reçoit le client quand une exception non gérée survient avec <code>UseExceptionHandler</code> et <code>AddProblemDetails</code> ?`,
      options: ["La stack trace complète", "Un 500 ProblemDetails avec un <code>traceId</code>, sans détail technique", "Une page HTML d'erreur"],
      answer: 1,
      why: `Le détail technique reste dans les logs. Le client reçoit un format standard et un identifiant pour que le support retrouve l'erreur.`
    },
    {
      q: `Quel est l'intérêt d'une <code>FallbackPolicy</code> qui exige l'authentification ?`,
      options: ["Elle accélère l'authentification", "Elle remplace le JWT", "Un endpoint oublié est fermé par défaut au lieu d'être ouvert"],
      answer: 2,
      why: `La sécurité par défaut protège contre l'oubli. Seuls les endpoints marqués <code>AllowAnonymous()</code> restent publics.`
    },
    {
      q: `Un client renvoie deux fois le même <code>POST</code> avec la même <code>Idempotency-Key</code>. Que doit faire le serveur ?`,
      options: ["Créer deux commandes", "Renvoyer la réponse de la première requête sans recréer la commande", "Renvoyer 429"],
      answer: 1,
      why: `C'est tout le principe de l'idempotence : la même intention produit le même résultat, peu importe le nombre de tentatives.`
    }
  ],
  project: `<p><strong>Le durcissement complet d'OrderFlow.</strong> Applique à ton API : <code>FallbackPolicy</code> authentifiée (seul <code>GET /api/products</code> reste public), vérification que <code>GET /api/orders/{id}</code> ne renvoie que les commandes du client connecté (404 sinon), rate limiting <code>orders-write</code> partitionné par utilisateur, ProblemDetails partout, en-têtes de sécurité, et <code>Idempotency-Key</code> obligatoire sur <code>POST /api/orders</code> stockée dans une table <code>IdempotencyKeys</code> avec index unique. Écris un test d'intégration qui prouve chaque point.</p>`,
  resources: [
    { label: "Rate limiting dans ASP.NET Core", url: "https://learn.microsoft.com/fr-fr/aspnet/core/performance/rate-limit" },
    { label: "Gérer les erreurs dans les API ASP.NET Core", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/error-handling-api" }
  ]
});

// =====================================================================
// Bonus : Documenter son architecture
// =====================================================================
window.COURSE.push({
  key: "bon-architecture-docs",
  title: "Documenter son architecture (README, ADR, diagrammes)",
  summary: "Tu sauras écrire le README d'OrderFlow, consigner une décision dans un ADR, dessiner un diagramme versionné et faire vérifier l'architecture par un test.",
  objectives: [
    "Écrire un README qui permet de lancer le projet en 5 minutes",
    "Rédiger un ADR (Architecture Decision Record) court",
    "Dessiner un diagramme Mermaid versionné avec le code",
    "Protéger les règles d'architecture avec un test NetArchTest"
  ],
  analogy: `<p>Le code dit <strong>comment</strong> fonctionne ta maison : où passent les tuyaux, où sont les prises. Mais il ne dit pas <strong>pourquoi</strong> le salon est au sud, ni pourquoi tu as choisi le chauffage au sol.</p>
<p>La documentation d'architecture, c'est le <strong>carnet du constructeur</strong> : le plan d'ensemble (diagrammes), la notice pour emménager (README) et le journal des grandes décisions avec leurs raisons (ADR). Le prochain propriétaire, c'est souvent toi dans six mois.</p>`,
  lesson: `<h3>Documenter juste ce qu'il faut</h3>
<p>Une documentation énorme n'est jamais lue ni mise à jour. On vise peu de documents, <strong>dans le dépôt Git</strong>, à côté du code, revus dans les mêmes pull requests. Trois formats couvrent presque tout : le README, les ADR et quelques diagrammes.</p>
<table>
<tr><th>Document</th><th>Question à laquelle il répond</th><th>Lecteur</th></tr>
<tr><td>README.md</td><td>C'est quoi, comment je le lance ?</td><td>Nouvel arrivant, recruteur</td></tr>
<tr><td>docs/adr/*.md</td><td>Pourquoi a-t-on choisi ça ?</td><td>L'équipe, dans 6 mois</td></tr>
<tr><td>Diagrammes</td><td>Comment les pièces s'assemblent ?</td><td>Tout le monde</td></tr>
</table>

<h3>Le README</h3>
<p>Le README est la porte d'entrée. Un bon README d'API tient en un écran : une phrase qui dit ce que fait le projet, les prérequis (.NET 10, SQL Server ou Docker), les commandes pour lancer et tester, la structure des dossiers, et un lien vers les ADR. Test simple : un collègue doit lancer le projet <strong>en 5 minutes sans te poser de question</strong>.</p>
<p>Évite d'y recopier ce que le code dit déjà (la liste de tous les endpoints : Swagger s'en charge). Le README pointe vers les bonnes sources au lieu de les dupliquer, ce qui lui évite de vieillir.</p>
<div class="tip">Copie-colle chaque commande du README dans un terminal vierge avant de valider. Une commande qui ne marche plus est pire qu'une absence de README.</div>

<h3>Les ADR</h3>
<p>Un <strong>ADR</strong> (Architecture Decision Record) est une page qui consigne <em>une</em> décision importante : choisir SQL Server, adopter la Clean Architecture, utiliser Dapper pour les rapports. Le format de Michael Nygard tient en quatre sections :</p>
<div class="flow"><span>Contexte</span><span>Décision</span><span>Statut</span><span>Conséquences</span></div>
<p>Les ADR sont numérotés (<code>0001-</code>, <code>0002-</code>…) et <strong>jamais réécrits</strong>. Si une décision change, on écrit un nouvel ADR qui « remplace » l'ancien, dont le statut passe à <em>Superseded</em>. On garde ainsi l'historique du raisonnement. La section la plus précieuse est <strong>Conséquences</strong> : ce qu'on accepte de perdre.</p>

<h3>Les diagrammes en texte</h3>
<p>Un diagramme dessiné dans un outil graphique vieillit mal : personne ne retrouve le fichier source. <strong>Mermaid</strong> décrit un diagramme en texte, directement dans un fichier Markdown. GitHub, GitLab et Azure DevOps l'affichent comme une image. Il se versionne et se relit en revue comme du code.</p>
<p>Le <strong>modèle C4</strong> propose quatre niveaux de zoom : Contexte (le système et ses utilisateurs), Conteneurs (API, base, front), Composants, Code. Pour OrderFlow, les deux premiers niveaux et un diagramme de séquence du flux de commande suffisent.</p>
<pre class="diagram">
 Niveau 1 Contexte   [Client] -&gt; [OrderFlow] -&gt; [Paiement]
 Niveau 2 Conteneurs [Angular] -&gt; [API] -&gt; [SQL Server]
 Niveau 3 Composants [Endpoints] -&gt; [Services] -&gt; [Repos]
 Niveau 4 Code       (le code lui-même, pas de schéma)
</pre>

<h3>Une documentation qui se vérifie</h3>
<p>Écrire « le Domain ne dépend pas de l'Infrastructure » dans un README, c'est bien. Le <strong>tester</strong>, c'est mieux. La bibliothèque <code>NetArchTest.Rules</code> inspecte les assemblies compilées et vérifie des règles de dépendance dans un test xUnit. Si quelqu'un ajoute un <code>using Microsoft.EntityFrameworkCore;</code> dans le Domain, la CI devient rouge.</p>
<div class="note">En entretien, montrer un dossier <code>docs/adr</code> avec trois décisions bien argumentées impressionne plus qu'un projet techniquement brillant mais muet. C'est la preuve que tu sais expliquer des compromis, la compétence centrale d'un senior.</div>`,
  examples: [
    {
      title: "Un ADR au format Nygard",
      code: `<!-- Fichier : docs/adr/0002-clean-architecture.md -->
# 2. Adopter une Clean Architecture en 4 projets

Date : 2026-10-12

## Statut
Accepté

## Contexte
L'API OrderFlow mélange endpoints, règles métier et accès EF Core
dans les mêmes classes. Les règles (stock, statut de commande) sont
impossibles à tester sans base de données.

## Décision
Découper en 4 projets : Domain, Application, Infrastructure, Api.
Domain ne référence aucun autre projet ni EF Core.
Une règle NetArchTest le vérifie en CI.

## Conséquences
+ Les règles métier sont testées en millisecondes, sans base.
+ Changer d'ORM ne touche que Infrastructure.
- Plus de fichiers et de mapping DTO <-> entités.
- Courbe d'apprentissage pour les nouveaux arrivants.`,
      output: ``,
      steps: [
        `<code># 2. Adopter une Clean Architecture</code> : un numéro et un titre qui énonce la décision, pas le problème.`,
        `<code>## Statut</code> : Proposé, Accepté, Déprécié ou Remplacé par l'ADR n.`,
        `<code>## Contexte</code> : les faits qui ont mené à la décision, sans jugement. Quelqu'un qui n'était pas là doit comprendre.`,
        `<code>## Décision</code> : ce qu'on fait, à l'impératif, et comment on le fait respecter.`,
        `<code>## Conséquences</code> : les gains (+) <strong>et</strong> les coûts (-). Un ADR sans inconvénient n'est pas honnête.`
      ],
      explain: "Une page, cinq minutes de lecture : c'est la bonne taille."
    },
    {
      title: "Un diagramme de séquence Mermaid",
      code: `<!-- Fichier : docs/architecture.md -->
## Création d'une commande

\`\`\`mermaid
sequenceDiagram
    actor C as Client Angular
    participant A as OrderFlow.Api
    participant S as OrderService
    participant DB as SQL Server

    C->>A: POST /api/orders (JWT, Idempotency-Key)
    A->>A: Authentification + rate limiting
    A->>S: CreateOrderAsync(request)
    S->>DB: SELECT Products WHERE Id IN (...)
    alt stock insuffisant
        S-->>A: Erreur métier
        A-->>C: 409 ProblemDetails
    else stock suffisant
        S->>DB: INSERT Orders + OrderLines (transaction)
        S-->>A: OrderDto
        A-->>C: 201 Created + Location
    end
\`\`\``,
      output: ``,
      steps: [
        `<code>\`\`\`mermaid</code> : un bloc de code Markdown avec le langage <code>mermaid</code>. GitHub le transforme en image.`,
        `<code>actor C as Client Angular</code> : déclare les participants dans l'ordre d'affichage, avec un alias court.`,
        `<code>C-&gt;&gt;A: POST /api/orders</code> : une flèche pleine pour un appel, avec son libellé.`,
        `<code>S--&gt;&gt;A: OrderDto</code> : une flèche pointillée pour une réponse.`,
        `<code>alt ... else ... end</code> : deux scénarios alternatifs, ici stock insuffisant ou suffisant.`
      ],
      explain: "Ce diagramme se modifie dans la même pull request que le code du flux : il reste à jour."
    },
    {
      title: "Tester l'architecture avec NetArchTest",
      code: `// Fichier : tests/OrderFlow.ArchitectureTests/ArchitectureTests.cs
// dotnet add package NetArchTest.Rules
using NetArchTest.Rules;
using OrderFlow.Domain;

public class ArchitectureTests
{
    [Fact]
    public void Domain_ne_depend_pas_de_l_infrastructure()
    {
        TestResult result = Types.InAssembly(typeof(Order).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny("OrderFlow.Infrastructure", "Microsoft.EntityFrameworkCore")
            .GetResult();

        // En cas d'échec, on affiche les classes fautives
        Assert.True(result.IsSuccessful,
            "Dépendances interdites : " + string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Les_repositories_sont_dans_l_infrastructure()
    {
        TestResult result = Types.InAssembly(typeof(OrderFlow.Infrastructure.OrderRepository).Assembly)
            .That().HaveNameEndingWith("Repository")
            .Should().ResideInNamespace("OrderFlow.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}`,
      output: `Réussi!  - échec :     0, réussite :     2, ignorée(s) :     0, total :     2, durée : 447 ms - OrderFlow.ArchitectureTests.dll (net10.0)`,
      steps: [
        `<code>Types.InAssembly(typeof(Order).Assembly)</code> : on charge tous les types de l'assembly Domain, en partant d'une de ses classes.`,
        `<code>.ShouldNot().HaveDependencyOnAny(...)</code> : la règle. Aucun type ne doit utiliser ces namespaces.`,
        `<code>.GetResult()</code> : exécute la vérification et renvoie un <code>TestResult</code>.`,
        `<code>result.FailingTypeNames ?? []</code> : la liste des classes qui violent la règle, pour un message d'échec utile.`,
        `<code>.That().HaveNameEndingWith("Repository")</code> : on peut aussi filtrer par convention de nommage avant d'appliquer une règle.`
      ],
      explain: "La règle écrite dans l'ADR 0002 est désormais vérifiée à chaque build de la CI."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Le README d'OrderFlow",
      prompt: `<p>Écris le <code>README.md</code> d'OrderFlow avec ces sections : description en une phrase, prérequis, lancer en local, lancer les tests, structure du projet, décisions d'architecture (lien vers <code>docs/adr</code>).</p>`,
      hint: `<p>Chaque commande dans un bloc de code. Une ligne par dossier dans la structure.</p>`,
      solution: `# OrderFlow

API de prise de commandes (clients, produits, commandes) en ASP.NET Core 10.

## Prérequis
- .NET SDK 10
- SQL Server local ou Docker

## Lancer en local
    dotnet user-secrets set "ConnectionStrings:OrderFlow" "Server=localhost;Database=OrderFlow;Trusted_Connection=True;TrustServerCertificate=True" --project src/OrderFlow.Api
    dotnet ef database update --project src/OrderFlow.Infrastructure --startup-project src/OrderFlow.Api
    dotnet run --project src/OrderFlow.Api

## Tests
    dotnet test

## Structure
- src/OrderFlow.Domain : entités et règles métier
- src/OrderFlow.Application : cas d'usage
- src/OrderFlow.Infrastructure : EF Core, SQL Server
- src/OrderFlow.Api : endpoints HTTP
- tests/ : tests unitaires, d'intégration et d'architecture

## Décisions d'architecture
Voir docs/adr.`
    },
    {
      level: "moyen",
      title: "L'ADR du choix de base",
      prompt: `<p>Rédige l'ADR <code>0001-sql-server.md</code> qui justifie SQL Server pour OrderFlow face à PostgreSQL. Donne au moins deux conséquences positives et deux négatives.</p>`,
      hint: `<p>Contexte possible : l'entreprise a déjà des DBA SQL Server, besoin de transactions fortes pour les commandes. Côté coût : licences en production.</p>`,
      solution: `# 1. Utiliser SQL Server comme base principale

Date : 2026-09-02

## Statut
Accepté

## Contexte
OrderFlow a besoin de transactions ACID (commande + lignes + stock).
L'équipe et les DBA de l'entreprise maîtrisent SQL Server.
PostgreSQL était l'autre option sérieuse.

## Décision
SQL Server 2022, accédé via EF Core (et Dapper pour les rapports).

## Conséquences
+ Compétences et supervision déjà en place.
+ Excellente intégration avec EF Core et les outils .NET.
- Coût de licence en production (hors édition Express).
- Moins portable si on migre vers un cloud sans SQL Server managé.`
    },
    {
      level: "difficile",
      title: "Une règle d'architecture de plus",
      prompt: `<p>Ajoute un test NetArchTest qui vérifie que les classes de l'assembly Application ne dépendent pas d'<code>OrderFlow.Api</code> ni de <code>Microsoft.AspNetCore</code>. Puis ajoute une règle de convention : toutes les classes dont le nom finit par <code>Service</code> dans Application doivent être <code>sealed</code>.</p>`,
      hint: `<p>Prends une classe de l'Application comme point d'entrée (<code>typeof(OrderService).Assembly</code>). Pour la seconde règle : <code>.That().HaveNameEndingWith("Service").And().AreClasses().Should().BeSealed()</code>.</p>`,
      solution: `using NetArchTest.Rules;
using OrderFlow.Application;

public class ApplicationLayerTests
{
    private static readonly System.Reflection.Assembly App = typeof(OrderService).Assembly;

    [Fact]
    public void Application_ignore_le_web()
    {
        var result = Types.InAssembly(App)
            .ShouldNot()
            .HaveDependencyOnAny("OrderFlow.Api", "Microsoft.AspNetCore")
            .GetResult();

        Assert.True(result.IsSuccessful,
            string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Les_services_sont_sealed()
    {
        var result = Types.InAssembly(App)
            .That().HaveNameEndingWith("Service").And().AreClasses()
            .Should().BeSealed()
            .GetResult();

        Assert.True(result.IsSuccessful,
            string.Join(", ", result.FailingTypeNames ?? []));
    }
}`
    }
  ],
  quiz: [
    {
      q: `Une décision consignée dans un ADR change. Que fais-tu ?`,
      options: ["Tu réécris l'ADR existant", "Tu supprimes l'ADR", "Tu écris un nouvel ADR qui remplace l'ancien, dont le statut devient « Remplacé »"],
      answer: 2,
      why: `Les ADR forment un journal : on garde l'historique du raisonnement. Réécrire ou supprimer ferait perdre le « pourquoi » de l'ancienne décision.`
    },
    {
      q: `Quelle section d'un ADR est souvent la plus précieuse ?`,
      options: ["Conséquences, car elle dit aussi ce qu'on accepte de perdre", "La date", "Le titre"],
      answer: 0,
      why: `Les conséquences (positives et négatives) montrent le compromis assumé. C'est ce dont l'équipe a besoin pour remettre en cause la décision plus tard.`
    },
    {
      q: `Pourquoi écrire les diagrammes en Mermaid plutôt que dans un outil de dessin ?`,
      options: ["Ils sont plus jolis", "Ils sont en texte : versionnés, relus en pull request et mis à jour avec le code", "Mermaid génère le code C#"],
      answer: 1,
      why: `Un diagramme en texte vit dans le dépôt Git. On voit ses modifications dans les diffs, ce qui l'empêche de vieillir en silence.`
    },
    {
      q: `Que vérifie un test NetArchTest ?`,
      options: ["Les performances de l'API", "La syntaxe du README", "Les dépendances et conventions entre les types des assemblies compilées"],
      answer: 2,
      why: `NetArchTest inspecte les assemblies et vérifie des règles comme « le Domain ne dépend pas d'EF Core ». L'architecture documentée devient une règle vérifiée en CI.`
    }
  ],
  project: `<p><strong>Le dossier docs d'OrderFlow.</strong> Crée <code>README.md</code> à la racine, <code>docs/adr/0001-sql-server.md</code>, <code>docs/adr/0002-clean-architecture.md</code> et <code>docs/architecture.md</code> avec un diagramme Mermaid des conteneurs (Angular, API, SQL Server) et le diagramme de séquence de la création de commande. Ajoute le projet <code>OrderFlow.ArchitectureTests</code> avec la règle sur le Domain, et vérifie qu'il tourne dans ta CI.</p>`,
  resources: [
    { label: "Architecture Decision Records (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/azure/well-architected/architect-role/architecture-decision-record" },
    { label: "NetArchTest sur GitHub", url: "https://github.com/BenMorris/NetArchTest" }
  ]
});

// =====================================================================
// Bonus : Revue de code de son propre projet
// =====================================================================
window.COURSE.push({
  key: "bon-self-review",
  title: "Faire la revue de code de son propre projet",
  summary: "Tu sauras relire ton propre code OrderFlow avec une méthode et une checklist, faire travailler les analyseurs pour toi, et transformer chaque bug trouvé en test.",
  objectives: [
    "Relire son code avec du recul, en plusieurs passes ciblées",
    "Utiliser une checklist .NET (correction, sécurité, performance, lisibilité)",
    "Activer les analyseurs et traiter les avertissements comme des erreurs",
    "Protéger chaque correction par un test de non-régression"
  ],
  analogy: `<p>Relire son propre texte juste après l'avoir écrit, c'est inutile : ton cerveau lit ce que tu <em>voulais</em> écrire, pas ce qui est écrit. Les écrivains laissent reposer le manuscrit, puis le relisent <strong>avec un crayon rouge et une liste</strong> : une passe pour l'orthographe, une pour le rythme, une pour l'histoire.</p>
<p>La revue de ton propre code, c'est pareil : du recul, plusieurs passes, et une checklist qui pense à ta place.</p>`,
  lesson: `<h3>Pourquoi relire son propre code</h3>
<p>Sur un projet perso comme OrderFlow, personne ne relit tes pull requests. Pourtant, une revue trouve des bugs qu'aucun test n'a vus : un cas limite oublié, une faille d'accès, une requête N+1. Et en entretien, savoir critiquer son propre code est un signe fort de maturité.</p>
<p>La règle d'or : <strong>prends du recul</strong>. Relis le lendemain, ou au moins après une pause. Lis le <em>diff</em> (<code>git diff main</code>) plutôt que les fichiers entiers : tu vois exactement ce qui a changé.</p>

<h3>Une passe par sujet</h3>
<p>Chercher tout à la fois, c'est ne rien trouver. Fais plusieurs passes rapides, chacune avec une seule question en tête.</p>
<div class="flow"><span>Outils automatiques</span><span>Correction</span><span>Sécurité</span><span>Performance</span><span>Lisibilité</span></div>
<table>
<tr><th>Passe</th><th>Questions à se poser</th></tr>
<tr><td>Correction</td><td>Cas limites (0, vide, null, maximum) ? <code>&gt;</code> ou <code>&gt;=</code> ? Montants en <code>decimal</code> ? Dates en UTC ?</td></tr>
<tr><td>Async</td><td>Un <code>.Result</code> ou <code>async void</code> ? Le <code>CancellationToken</code> est-il propagé jusqu'à EF Core ?</td></tr>
<tr><td>Sécurité</td><td>Chaque endpoint est-il protégé ? L'utilisateur a-t-il le droit sur <em>cette</em> ressource ? Un secret dans le code ?</td></tr>
<tr><td>Données</td><td>N+1 ? <code>AsNoTracking</code> en lecture ? Pagination ? Transaction autour des écritures liées ?</td></tr>
<tr><td>Lisibilité</td><td>Les noms disent-ils l'intention ? Une méthode de 80 lignes à découper ? Du code mort ?</td></tr>
</table>

<h3>Laisser les outils faire le travail ingrat</h3>
<p>Avant toute relecture humaine, les outils éliminent les erreurs mécaniques. Le compilateur C# embarque des <strong>analyseurs</strong> (règles <code>CA</code> pour la qualité, <code>IDE</code> pour le style, <code>CS86xx</code> pour les null). Dans un fichier <code>Directory.Build.props</code> à la racine, tu les actives pour tous les projets d'un coup, et <code>TreatWarningsAsErrors</code> empêche un avertissement de passer inaperçu.</p>
<p><code>dotnet format</code> applique le style défini dans <code>.editorconfig</code>, et <code>dotnet format --verify-no-changes</code> fait échouer la CI si le code n'est pas formaté. C'est l'équivalent d'ESLint + Prettier que tu connais côté Angular.</p>
<div class="tip">Active ces règles <strong>au début</strong> d'un projet. Sur un projet existant, active-les une famille à la fois : 400 erreurs d'un coup, et tu abandonnes.</div>

<h3>Chaque bug trouvé devient un test</h3>
<p>Quand la relecture trouve un bug, ne te contente pas de corriger. Écris d'abord un test qui <strong>échoue</strong> à cause du bug, corrige, puis vérifie qu'il passe. Ce test de non-régression garantit que le bug ne reviendra jamais, même après un refactoring.</p>
<pre class="diagram">
 Relecture --&gt; bug trouvé : Stock &gt; quantity
                   |
                   v
 Test rouge : CanOrder(5, 5) attendu true
                   |
                   v
 Correction : Stock &gt;= quantity --&gt; test vert
                   |
                   v
 Commit : "fix: autoriser une commande de tout le stock"
</pre>
<p>Note enfin tes trouvailles dans une liste (un fichier <code>docs/review.md</code> ou des issues GitHub) classée par gravité : <strong>bloquant</strong> (bug, faille), <strong>important</strong> (performance, dette), <strong>détail</strong> (nommage). Tu traites les bloquants tout de suite, le reste par petits lots.</p>
<div class="note">Une bonne revue juge le code, pas l'auteur, et propose une solution concrète. Entraîne-toi à formuler tes remarques comme tu le ferais pour un collègue : « Ici, si <code>quantity</code> vaut 0, la commande passe. Proposition : refuser les quantités ≤ 0 et ajouter un test. »</div>`,
  examples: [
    {
      title: "Trouvaille n°1 : un total calculé en double",
      code: `// Revue : « le total d'une commande est calculé en double »
using System.Globalization;

double[] pricesDouble = [0.10, 0.20, 0.30];
decimal[] pricesDecimal = [0.10m, 0.20m, 0.30m];

double totalDouble = 0;
foreach (double p in pricesDouble) totalDouble += p;

decimal totalDecimal = 0;
foreach (decimal p in pricesDecimal) totalDecimal += p;

var inv = CultureInfo.InvariantCulture;
Console.WriteLine($"double  : {totalDouble.ToString("R", inv)}");
Console.WriteLine($"decimal : {totalDecimal.ToString(inv)}");
Console.WriteLine($"double == 0.6 ? {totalDouble == 0.6}");
Console.WriteLine($"decimal == 0.6m ? {totalDecimal == 0.6m}");`,
      output: `double  : 0.6000000000000001
decimal : 0.60
double == 0.6 ? False
decimal == 0.6m ? True`,
      steps: [
        `<code>double[] pricesDouble = [0.10, 0.20, 0.30];</code> : <code>double</code> stocke les nombres en binaire. 0,1 n'y est pas représentable exactement.`,
        `<code>totalDouble += p</code> : les petites erreurs s'accumulent à chaque addition.`,
        `<code>ToString("R", inv)</code> : affiche toutes les décimales, et révèle le <code>0.6000000000000001</code>.`,
        `<code>totalDouble == 0.6</code> : <code>False</code>. Une comparaison de montants qui échoue, c'est un bug de facturation.`,
        `<code>decimal</code> : stocke les nombres en base 10, exact pour l'argent. C'est le type des colonnes <code>Price</code> et <code>UnitPrice</code> d'OrderFlow.`
      ],
      explain: "Remarque de revue : « Les montants doivent être en decimal de bout en bout (entité, DTO, calculs). »"
    },
    {
      title: "Faire travailler les analyseurs",
      code: `<!-- Fichier : Directory.Build.props (à la racine de la solution) -->
<Project>
  <PropertyGroup>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <AnalysisLevel>latest-recommended</AnalysisLevel>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
  </PropertyGroup>
</Project>

// Fichier : Program.cs
var customer = FindCustomer("bob@mail.com");
Console.WriteLine(customer.Name.ToUpper());

static Customer? FindCustomer(string email) => null;

record Customer(string Name, string Email);`,
      output: `Program.cs(2,19): error CA1304: Le comportement de 'string.ToUpper()' peut varier en fonction des paramètres régionaux de l'utilisateur actuel. Remplacez cet appel dans '<top-level-statements-entry-point>' par un appel à 'string.ToUpper(CultureInfo)'. (https://learn.microsoft.com/dotnet/fundamentals/code-analysis/quality-rules/ca1304)
Program.cs(2,19): error CS8602: Déréférencement d'une éventuelle référence null.
Program.cs(2,33): error CA1311: Spécifiez une culture ou utilisez une version invariante pour éviter toute dépendance implicite par rapport à la culture actuelle (https://learn.microsoft.com/dotnet/fundamentals/code-analysis/quality-rules/ca1311)
Program.cs(6,8): error CA1852: Le type «Customer» peut être scellé, car il n’a aucun sous-type dans son assembly conteneur et n’est pas visible en externe (https://learn.microsoft.com/dotnet/fundamentals/code-analysis/quality-rules/ca1852)`,
      steps: [
        `<code>Directory.Build.props</code> : MSBuild applique ce fichier automatiquement à tous les projets situés en dessous. Une seule configuration pour toute la solution.`,
        `<code>&lt;TreatWarningsAsErrors&gt;true&lt;/TreatWarningsAsErrors&gt;</code> : chaque avertissement bloque la compilation.`,
        `<code>&lt;AnalysisLevel&gt;latest-recommended&lt;/AnalysisLevel&gt;</code> : active le jeu de règles <code>CA</code> recommandé par Microsoft.`,
        `<code>customer.Name</code> : erreur <code>CS8602</code>, <code>FindCustomer</code> peut renvoyer <code>null</code>. Un vrai bug trouvé sans relecture humaine.`,
        `<code>ToUpper()</code> : <code>CA1304</code> et <code>CA1311</code> signalent un résultat qui dépend de la langue du serveur (le fameux « i » turc). <code>ToUpperInvariant()</code> corrige.`,
        `<code>record Customer</code> : <code>CA1852</code> propose de le marquer <code>sealed</code>, une petite optimisation. La sortie montre les erreurs de <code>dotnet build</code>, chemins raccourcis.`
      ],
      explain: "Quatre remarques de revue obtenues en une seconde : garde ton attention pour ce que les outils ne voient pas (logique métier, sécurité)."
    },
    {
      title: "Trouvaille n°2 : un cas limite transformé en test",
      code: `// Fichier : tests/OrderFlow.Tests/StockTests.cs
// Bug trouvé en relecture : "if (product.Stock > quantity)" refusait
// une commande qui prend EXACTEMENT tout le stock.
public class StockTests
{
    [Theory]
    [InlineData(5, 3, true)]   // assez de stock
    [InlineData(5, 5, true)]   // cas limite : tout le stock (le bug)
    [InlineData(5, 6, false)]  // pas assez
    [InlineData(5, 0, false)]  // quantité invalide
    public void CanOrder_respecte_le_stock(int stock, int quantity, bool expected)
    {
        var product = new Product { Name = "Clavier", Price = 49.90m, Stock = stock };

        bool result = product.CanOrder(quantity);

        Assert.Equal(expected, result);
    }
}

public class Product
{
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public int Stock { get; set; }

    // Corrigé : >= au lieu de >, et refus des quantités nulles ou négatives
    public bool CanOrder(int quantity) => quantity > 0 && Stock >= quantity;
}`,
      output: `Réussi!  - échec :     0, réussite :     4, ignorée(s) :     0, total :     4, durée : 287 ms - OrderFlow.Tests.dll (net10.0)`,
      steps: [
        `<code>[Theory]</code> avec plusieurs <code>[InlineData]</code> : un même test exécuté avec 4 jeux de données.`,
        `<code>[InlineData(5, 5, true)]</code> : le cas limite trouvé en relecture. Avec l'ancien code (<code>Stock &gt; quantity</code>), ce cas échouait.`,
        `<code>[InlineData(5, 0, false)]</code> : la relecture a aussi révélé qu'une quantité nulle était acceptée.`,
        `<code>quantity &gt; 0 &amp;&amp; Stock &gt;= quantity</code> : la correction, écrite après avoir vu le test échouer.`,
        `La sortie de <code>dotnet test</code> montre les 4 cas au vert : le bug ne pourra plus revenir sans faire rougir la CI.`
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Trouver les problèmes",
      prompt: `<p>Relis ce code comme en revue et liste au moins 4 problèmes, chacun avec sa gravité (bloquant, important, détail) et une correction :</p><p><code>public async void Cancel(int id) { var o = db.Orders.Find(id); o.Status = "cancelled"; db.SaveChangesAsync(); }</code></p>`,
      hint: `<p>Regarde : le type de retour, le <code>null</code>, l'<code>await</code> manquant, le statut en chaîne, l'absence de vérification de droits.</p>`,
      solution: `1. Bloquant : async void -> impossible d'attendre, une exception fait
   tomber le processus. Utiliser async Task.
2. Bloquant : SaveChangesAsync() sans await -> l'écriture peut ne
   jamais se faire, les erreurs sont perdues.
3. Bloquant : o peut être null (commande inexistante) -> NullReferenceException.
   Renvoyer 404 si null. Utiliser FindAsync.
4. Bloquant : aucune vérification que la commande appartient à l'utilisateur.
5. Important : "cancelled" en chaîne -> utiliser l'enum OrderStatus.Cancelled.
6. Important : pas de règle métier (on ne peut pas annuler une commande Shipped).
7. Détail : o -> order, nom explicite.`
    },
    {
      level: "moyen",
      title: "Configurer la qualité pour toute la solution",
      prompt: `<p>Écris le <code>Directory.Build.props</code> d'OrderFlow (nullable, avertissements en erreurs, analyseurs recommandés, style appliqué au build) et un <code>.editorconfig</code> minimal qui impose <code>var</code> quand le type est évident et des accolades obligatoires. Donne la commande qui vérifie le formatage en CI.</p>`,
      hint: `<p>Les options de style s'écrivent <code>csharp_style_var_when_type_is_apparent = true:warning</code> et <code>csharp_prefer_braces = true:warning</code>.</p>`,
      solution: `<!-- Directory.Build.props -->
<Project>
  <PropertyGroup>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <AnalysisLevel>latest-recommended</AnalysisLevel>
    <EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
  </PropertyGroup>
</Project>

# .editorconfig
root = true

[*.cs]
indent_style = space
indent_size = 4
csharp_style_var_when_type_is_apparent = true:warning
csharp_prefer_braces = true:warning

# En CI :
# dotnet format --verify-no-changes`
    },
    {
      level: "difficile",
      title: "Une revue complète d'un endpoint",
      prompt: `<p>Choisis l'endpoint <code>POST /api/orders</code> de ton OrderFlow. Fais les 5 passes de la leçon et écris le compte rendu dans <code>docs/review.md</code> : au moins un point par passe, classé par gravité. Pour le point le plus grave, écris le test de non-régression avant la correction.</p>`,
      hint: `<p>Points fréquents : <code>CancellationToken</code> non propagé, prix lu depuis le client au lieu de la base, pas de transaction autour du décrément du stock, quantité négative acceptée.</p>`,
      solution: `# Revue de POST /api/orders (2026-11-07)

## Bloquant
- Sécurité : UnitPrice vient du DTO client -> un client peut fixer
  son prix. Correction : lire Product.Price en base.
  Test : CreateOrder_ignore_le_prix_envoye_par_le_client.
- Correction : quantité <= 0 acceptée. Test : [InlineData(0)] -> 400.

## Important
- Données : décrément du stock hors transaction -> survente possible
  en parallèle. Correction : une seule SaveChangesAsync, ou
  UPDATE ... WHERE Stock >= @qty.
- Async : CancellationToken non passé à SaveChangesAsync.
- Performance : un FindAsync par ligne (N+1) ->
  un seul Where(p => ids.Contains(p.Id)).

## Détail
- Lisibilité : méthode de 70 lignes -> extraire BuildOrderLines().

// Test écrit avant la correction (test d'intégration) :
// [Fact]
// public async Task CreateOrder_ignore_le_prix_envoye_par_le_client()
// {
//     var response = await _client.PostAsJsonAsync("/api/orders",
//         new { customerId = 1, lines = new[] { new { productId = 1, quantity = 1, unitPrice = 0.01m } } });
//     var order = await response.Content.ReadFromJsonAsync<OrderDto>();
//     Assert.Equal(49.90m, order!.Total); // le prix de la base, pas 0.01
// }`
    }
  ],
  quiz: [
    {
      q: `Quelle est la meilleure façon de relire son propre code ?`,
      options: ["Juste après l'avoir écrit, tout d'un coup", "Avec du recul, en lisant le diff, en plusieurs passes ciblées", "Seulement si les tests échouent"],
      answer: 1,
      why: `Juste après l'écriture, on lit ce qu'on voulait écrire. Le recul, le diff et une question par passe permettent de voir ce qui est vraiment écrit.`
    },
    {
      q: `Que fait <code>&lt;TreatWarningsAsErrors&gt;true&lt;/TreatWarningsAsErrors&gt;</code> ?`,
      options: ["Il masque les avertissements", "Il corrige automatiquement le code", "Il fait échouer la compilation au moindre avertissement"],
      answer: 2,
      why: `Un avertissement devient bloquant : impossible de l'ignorer ou de le laisser s'accumuler. C'est très efficace avec les avertissements de nullabilité.`
    },
    {
      q: `Ta relecture trouve un bug de cas limite. Quel est le bon ordre ?`,
      options: ["Écrire un test qui échoue, corriger, voir le test passer", "Corriger, puis supprimer le test existant", "Corriger, et compter sur la relecture suivante"],
      answer: 0,
      why: `Le test rouge prouve qu'il capture bien le bug ; le test vert prouve la correction. Il reste ensuite pour empêcher toute régression.`
    },
    {
      q: `Pourquoi <code>decimal</code> plutôt que <code>double</code> pour un prix ?`,
      options: ["<code>decimal</code> est plus rapide", "<code>decimal</code> représente exactement les nombres décimaux, sans erreur d'arrondi binaire", "<code>double</code> ne peut pas avoir de virgule"],
      answer: 1,
      why: `<code>double</code> stocke en binaire : 0,1 + 0,2 + 0,3 ne vaut pas exactement 0,6. <code>decimal</code> travaille en base 10, exact pour l'argent, au prix d'un calcul un peu plus lent.`
    }
  ],
  project: `<p><strong>La grande revue d'OrderFlow.</strong> Ajoute <code>Directory.Build.props</code> et <code>.editorconfig</code> à la racine, corrige toutes les erreurs du build, puis fais les 5 passes sur tout le projet. Note tes trouvailles dans <code>docs/review.md</code> par gravité, traite tous les bloquants avec un test de non-régression chacun, et ouvre une issue GitHub par point important restant. Ajoute <code>dotnet format --verify-no-changes</code> à ta CI.</p>`,
  resources: [
    { label: "Vue d'ensemble de l'analyse du code .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/fundamentals/code-analysis/overview" },
    { label: "dotnet format", url: "https://learn.microsoft.com/fr-fr/dotnet/core/tools/dotnet-format" }
  ]
});
