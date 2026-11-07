window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 5 - Design patterns
// 1. Les design patterns : des solutions qui ont un nom
// =====================================================================
window.COURSE.push({
  key: "pat-intro",
  title: "Les design patterns : des solutions qui ont un nom",
  summary: "Tu sauras ce qu'est un design pattern, à quoi il sert, et tu reconnaîtras ceux que tu utilises déjà sans le savoir.",
  objectives: [
    "Expliquer ce qu'est un design pattern et ses trois familles",
    "Comprendre les deux idées de base : programmer vers une interface et préférer la composition",
    "Repérer des patterns déjà présents dans .NET et dans Angular",
    "Savoir quand un pattern est utile, et quand il ne l'est pas"
  ],
  analogy: `<p>En cuisine, personne ne réinvente la <strong>pâte brisée</strong> à chaque tarte. Elle a un nom, une recette connue, et quand un chef dit « fais une pâte brisée », toute la brigade sait exactement de quoi il parle.</p>
<p>Un design pattern, c'est pareil : une <strong>recette éprouvée</strong> pour un problème qui revient souvent, avec un nom que tous les développeurs partagent. Dire « on met un décorateur de cache » remplace dix minutes d'explications.</p>`,
  lesson: `<h3>Un problème qui revient, une solution qui a un nom</h3>
<p>Un <strong>design pattern</strong> (en français « patron de conception ») est une solution type à un problème de conception qui revient souvent. Ce n'est pas une bibliothèque à installer ni du code à copier : c'est une <em>façon d'organiser</em> tes classes et tes interfaces.</p>
<p>Le terme a été popularisé en 1994 par le livre <em>Design Patterns</em> de quatre auteurs, qu'on appelle le « Gang of Four » (GoF). Ils ont décrit 23 patterns. Trente ans plus tard, ces noms sont toujours le vocabulaire commun des développeurs, en C#, en Java comme en TypeScript.</p>
<p>Chaque pattern se décrit toujours de la même façon :</p>
<div class="flow"><span>Un nom</span><span>Le problème</span><span>La solution</span><span>Les conséquences</span></div>
<p>Dans ce chapitre, on suivra cet ordre : d'abord le problème (le code qui fait mal), puis la solution, puis l'endroit où .NET l'utilise déjà.</p>

<h3>Trois familles</h3>
<p>Les patterns se rangent en trois familles, selon la question à laquelle ils répondent.</p>
<table>
<tr><th>Famille</th><th>La question</th><th>Patterns du chapitre</th></tr>
<tr><td>Création</td><td>Comment fabriquer des objets ?</td><td>Factory, Builder, Singleton</td></tr>
<tr><td>Structure</td><td>Comment assembler des objets entre eux ?</td><td>Adapter, Facade, Decorator</td></tr>
<tr><td>Comportement</td><td>Comment des objets collaborent et se répartissent le travail ?</td><td>Strategy, Observer, Command, Chain of Responsibility</td></tr>
</table>

<h3>Deux idées derrière presque tous les patterns</h3>
<p><strong>1. Programmer vers une interface.</strong> Le code qui utilise un service ne connaît que son interface (<code>INotifier</code>), pas la classe concrète (<code>EmailNotifier</code>). On peut alors changer la classe sans toucher au code appelant. Tu fais déjà ça en Angular quand un composant dépend d'un service abstrait fourni par l'injecteur.</p>
<p><strong>2. Préférer la composition à l'héritage.</strong> Au lieu d'hériter d'une classe pour en récupérer le comportement, un objet <em>reçoit</em> un autre objet et lui délègue le travail. L'héritage est figé à la compilation ; la composition se change à l'exécution.</p>
<div class="compare"><div><h4>Héritage</h4><p><code>class EmailOrderService : OrderService</code>. Une sous-classe par variante : 3 canaux x 2 formats = 6 classes.</p></div><div><h4>Composition</h4><p><code>new OrderService(notifier)</code>. Une seule classe, on lui passe la pièce dont elle a besoin.</p></div></div>
<p>Tu verras ces deux idées dans chaque leçon de ce chapitre. Une fois qu'elles sont claires, la plupart des patterns deviennent presque évidents.</p>

<h3>Tu en utilises déjà</h3>
<p>Bonne nouvelle : tu as déjà croisé beaucoup de patterns sans les nommer. Le <code>foreach</code> de C# repose sur le pattern <strong>Iterator</strong> (<code>IEnumerable</code> et <code>GetEnumerator</code>). L'injection de dépendances d'ASP.NET Core remplace le Singleton classique. Le pipeline de middlewares est une <strong>Chaîne de responsabilité</strong>. Côté Angular, RxJS est entièrement bâti sur <strong>Observer</strong>, et les intercepteurs HTTP forment une chaîne.</p>
<pre class="diagram">
  Angular                  .NET
  ---------------------    ------------------------
  Observable / Subject  =  event, IObservable&lt;T&gt;
  HttpInterceptor       =  middleware, DelegatingHandler
  providers (DI)        =  AddSingleton / AddScoped
</pre>
<div class="tip">Attention aux faux amis : les <code>@Component</code> et <code>@Injectable</code> d'Angular s'appellent « décorateurs », mais ce sont des annotations. Le pattern Decorator du GoF, qu'on verra plus loin, est tout autre chose : un objet qui en enveloppe un autre.</div>

<h3>Un pattern doit rembourser son coût</h3>
<p>Chaque pattern ajoute des interfaces, des classes et une indirection : le prochain lecteur doit suivre un détour de plus. Il doit donc résoudre un problème <strong>présent</strong>, pas un problème imaginé « au cas où ». Si tu n'as qu'une seule façon d'envoyer un mail et aucune raison d'en changer, un simple appel de méthode suffit.</p>
<div class="note">En revue de code, un senior ne demande pas « quel pattern as-tu utilisé ? » mais « quel problème ce pattern résout-il ici ? ». Si la réponse est vague, le code simple gagne. La dernière leçon du chapitre revient sur ce piège, qu'on appelle parfois la « patternite ».</div>`,
  examples: [
    {
      title: "Programmer vers une interface",
      code: `// Le code appelant ne connaît que l'interface
INotifier[] notifiers = [new EmailNotifier(), new SmsNotifier()];

foreach (var notifier in notifiers)
    notifier.Send("Commande 42 confirmée");

interface INotifier
{
    void Send(string message);
}

class EmailNotifier : INotifier
{
    public void Send(string message) => Console.WriteLine($"[Email] {message}");
}

class SmsNotifier : INotifier
{
    public void Send(string message) => Console.WriteLine($"[SMS] {message}");
}`,
      output: `[Email] Commande 42 confirmée
[SMS] Commande 42 confirmée`,
      steps: [
        "<code>interface INotifier</code> : on décrit <em>ce que</em> fait un notifier (envoyer un message), sans dire <em>comment</em>.",
        "<code>class EmailNotifier : INotifier</code> : chaque classe concrète fournit sa propre version de <code>Send</code>.",
        "<code>INotifier[] notifiers = [...]</code> : le tableau est typé avec l'interface, il accepte n'importe quel notifier.",
        "<code>notifier.Send(...)</code> : la boucle ne sait pas si c'est un mail ou un SMS. Ajouter un <code>SlackNotifier</code> ne demanderait aucune modification ici."
      ],
      explain: "C'est le socle de presque tous les patterns : le code appelant dépend d'un contrat, pas d'une classe."
    },
    {
      title: "Composition : recevoir sa dépendance",
      code: `var fake = new FakeNotifier();
var service = new OrderService(fake);
service.Confirm(42);
service.Confirm(43);
Console.WriteLine($"Messages envoyés : {fake.Sent.Count}");
Console.WriteLine(fake.Sent[0]);

var real = new OrderService(new ConsoleNotifier());
real.Confirm(44);

interface INotifier { void Send(string message); }

class ConsoleNotifier : INotifier
{
    public void Send(string message) => Console.WriteLine($"[Console] {message}");
}

// Un faux pour les tests : il garde les messages en mémoire
class FakeNotifier : INotifier
{
    public List<string> Sent { get; } = [];
    public void Send(string message) => Sent.Add(message);
}

// OrderService reçoit son notifier : il ne le crée pas lui-même
class OrderService(INotifier notifier)
{
    public void Confirm(int orderId) => notifier.Send($"Commande {orderId} confirmée");
}`,
      output: `Messages envoyés : 2
Commande 42 confirmée
[Console] Commande 44 confirmée`,
      steps: [
        "<code>class OrderService(INotifier notifier)</code> : un constructeur principal. Le service reçoit son notifier de l'extérieur, c'est de la composition.",
        "<code>new OrderService(fake)</code> : on lui donne un faux notifier qui ne fait que stocker les messages dans une liste.",
        "<code>fake.Sent.Count</code> : on peut vérifier ce qui a été envoyé sans rien afficher. C'est exactement ce que feront les tests unitaires.",
        "<code>new OrderService(new ConsoleNotifier())</code> : même classe <code>OrderService</code>, autre pièce branchée, autre comportement."
      ],
      explain: "Aucun héritage, aucun if : on change le comportement en changeant l'objet qu'on passe."
    },
    {
      title: "Le pattern Iterator caché dans foreach",
      code: `// foreach marche sur tout ce qui fournit un énumérateur
foreach (var status in Statuses())
    Console.WriteLine(status);

// Ce que foreach fait pour toi, à la main
var enumerator = Statuses().GetEnumerator();
enumerator.MoveNext();
Console.WriteLine($"À la main : {enumerator.Current}");

// yield return fabrique l'itérateur pour toi
IEnumerable<string> Statuses()
{
    yield return "Pending";
    yield return "Paid";
    yield return "Shipped";
}`,
      output: `Pending
Paid
Shipped
À la main : Pending`,
      steps: [
        "<code>IEnumerable&lt;string&gt; Statuses()</code> : la méthode renvoie un objet qu'on peut parcourir, sans dire comment il stocke ses éléments.",
        "<code>yield return \"Pending\";</code> : le compilateur génère une classe itérateur complète à partir de ces lignes.",
        "<code>foreach (var status in Statuses())</code> : <code>foreach</code> appelle <code>GetEnumerator()</code>, puis <code>MoveNext()</code> et <code>Current</code> en boucle.",
        "<code>enumerator.MoveNext();</code> : on fait la même chose à la main pour voir la mécanique : avancer, puis lire <code>Current</code>."
      ],
      explain: "Iterator est un pattern du GoF : parcourir une collection sans connaître sa structure interne. C# l'a intégré au langage."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un nouveau canal sans rien casser",
      prompt: `<p>Reprends le premier exemple et ajoute une classe <code>SlackNotifier</code> qui affiche <code>[Slack] …</code>. Ajoute-la au tableau. Vérifie que la boucle <code>foreach</code> n'a pas besoin de changer.</p>`,
      hint: `<p>Il suffit d'une classe qui implémente <code>INotifier</code> et d'un élément de plus dans le tableau.</p>`,
      solution: `INotifier[] notifiers = [new EmailNotifier(), new SlackNotifier()];

foreach (var notifier in notifiers)
    notifier.Send("Commande 42 confirmée");

interface INotifier { void Send(string message); }

class EmailNotifier : INotifier
{
    public void Send(string message) => Console.WriteLine($"[Email] {message}");
}

class SlackNotifier : INotifier
{
    public void Send(string message) => Console.WriteLine($"[Slack] {message}");
}`
    },
    {
      level: "moyen",
      title: "Un service qui prévient plusieurs canaux",
      prompt: `<p>Écris un <code>OrderService</code> qui reçoit dans son constructeur un <code>IEnumerable&lt;INotifier&gt;</code> et envoie le message de confirmation à <strong>tous</strong> les notifiers. Teste-le avec un notifier console et un faux notifier qui compte les messages.</p>`,
      hint: `<p>Dans <code>Confirm</code>, fais un <code>foreach</code> sur la collection reçue. Le faux notifier peut avoir une propriété <code>public int Count { get; private set; }</code>.</p>`,
      solution: `var fake = new CountingNotifier();
var service = new OrderService([new ConsoleNotifier(), fake]);
service.Confirm(42);
Console.WriteLine($"Le faux a reçu {fake.Count} message(s)"); // 1

interface INotifier { void Send(string message); }

class ConsoleNotifier : INotifier
{
    public void Send(string message) => Console.WriteLine($"[Console] {message}");
}

class CountingNotifier : INotifier
{
    public int Count { get; private set; }
    public void Send(string message) => Count++;
}

class OrderService(IEnumerable<INotifier> notifiers)
{
    public void Confirm(int orderId)
    {
        foreach (var notifier in notifiers)
            notifier.Send($"Commande {orderId} confirmée");
    }
}`
    },
    {
      level: "difficile",
      title: "Ton propre itérateur",
      prompt: `<p>Écris une méthode <code>IEnumerable&lt;int&gt; Countdown(int from)</code> avec <code>yield return</code> qui renvoie <code>from</code>, <code>from - 1</code>… jusqu'à 1. Affiche-la avec <code>foreach</code>, puis prouve que le code n'est exécuté qu'au moment du parcours en ajoutant un <code>Console.WriteLine</code> au début de la méthode.</p>`,
      hint: `<p>Appelle d'abord <code>var c = Countdown(3);</code> et affiche « avant le foreach » : le message de la méthode n'apparaît qu'après.</p>`,
      solution: `var countdown = Countdown(3);
Console.WriteLine("avant le foreach");

foreach (var n in countdown)
    Console.WriteLine(n);

IEnumerable<int> Countdown(int from)
{
    Console.WriteLine("début du compte à rebours");
    for (int i = from; i >= 1; i--)
        yield return i;
}
// avant le foreach
// début du compte à rebours
// 3
// 2
// 1`
    }
  ],
  quiz: [
    {
      q: `Qu'est-ce qu'un design pattern ?`,
      options: ["Un package NuGet à installer", "Une solution type, avec un nom, à un problème de conception fréquent", "Une règle du compilateur C#"],
      answer: 1,
      why: `Un pattern est une façon d'organiser le code, pas une bibliothèque. On l'écrit soi-même (ou on le trouve déjà dans le framework). Le compilateur ne l'impose jamais.`
    },
    {
      q: `Dans quelle famille range-t-on un pattern qui répond à « comment fabriquer des objets ? »`,
      options: ["Comportement", "Structure", "Création"],
      answer: 2,
      why: `Factory, Builder et Singleton sont des patterns de création. Les patterns de structure assemblent des objets, ceux de comportement organisent leur collaboration.`
    },
    {
      q: `Que veut dire « préférer la composition à l'héritage » ?`,
      options: ["Un objet reçoit un autre objet et lui délègue le travail", "Ne jamais utiliser le mot-clé <code>class</code>", "Mettre toutes les méthodes dans une seule classe"],
      answer: 0,
      why: `Avec la composition, on assemble des objets : on peut changer la pièce à l'exécution. L'héritage fige le comportement dans une sous-classe à la compilation.`
    },
    {
      q: `Le <code>@Component</code> d'Angular est-il le pattern Decorator du GoF ?`,
      options: ["Oui, c'est exactement le même concept", "Non, c'est une annotation de métadonnées, pas un objet qui en enveloppe un autre", "Oui, mais seulement en TypeScript"],
      answer: 1,
      why: `Les décorateurs TypeScript ajoutent des métadonnées à une classe. Le pattern Decorator, lui, enveloppe un objet dans un autre qui a la même interface. Même mot, deux idées différentes.`
    }
  ],
  project: `<p><strong>OrderFlow : la carte des patterns.</strong> Ouvre ta solution OrderFlow et crée un fichier <code>docs/patterns.md</code>. Note pour chaque élément où il se trouve et quel pattern il illustre :</p>
<ul>
<li>l'enregistrement des services dans <code>Program.cs</code> (<code>AddScoped</code>, <code>AddSingleton</code>) ;</li>
<li>la suite de <code>app.Use…</code> (middlewares) ;</li>
<li>ton <code>OrderFlowDbContext</code> et ses <code>DbSet</code> ;</li>
<li>les endroits où un <code>switch</code> sur <code>OrderStatus</code> ou sur un mode de livraison commence à grossir.</li>
</ul>
<p>Cette liste te servira de fil conducteur : à chaque leçon, tu appliqueras le pattern à l'un de ces endroits.</p>`,
  resources: [
    { label: "Principes architecturaux (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/modern-web-apps-azure/architectural-principles" },
    { label: "Itérateurs en C# (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/iterators" }
  ]
});

// =====================================================================
// 2. Créer des objets : Factory et Builder
// =====================================================================
window.COURSE.push({
  key: "pat-factory-builder",
  title: "Créer des objets : Factory et Builder",
  summary: "Tu sauras centraliser la création d'objets dans une fabrique et construire pas à pas un objet complexe avec un builder.",
  objectives: [
    "Remplacer des new dispersés par une fabrique (Factory)",
    "Utiliser une méthode de fabrique statique pour valider à la création",
    "Écrire un Builder fluide qui vérifie l'objet avant de le livrer",
    "Reconnaître Factory et Builder dans .NET"
  ],
  analogy: `<p>Quand tu commandes une voiture, tu ne vas pas dans l'usine choisir les vis : tu dis « une citadine, essence », et l'<strong>usine</strong> (la fabrique) sait quelle chaîne de montage lancer. Tu ne connais même pas le nom des pièces.</p>
<p>Pour un <strong>sandwich sur mesure</strong>, en revanche, tu dis les ingrédients un par un : « pain complet, poulet, sans oignon ». Le vendeur l'assemble au fur et à mesure et te le donne seulement quand il est complet. C'est le <strong>Builder</strong>.</p>`,
  lesson: `<h3>Le problème : des new partout</h3>
<p>Imagine OrderFlow qui exporte les commandes en CSV ou en JSON. Le premier réflexe est d'écrire un <code>if (format == "csv") new CsvExporter() else …</code> dans le contrôleur. Puis le même <code>if</code> dans le service d'envoi par mail. Puis dans la tâche planifiée. Le jour où tu ajoutes Excel, il faut retrouver et modifier les trois endroits.</p>
<p>Le mot-clé <code>new</code> te lie à une classe concrète. Quand le choix de cette classe dépend d'une donnée (un format, un pays, un type de client), il vaut mieux le faire <strong>à un seul endroit</strong>.</p>

<h3>La solution : une fabrique</h3>
<p>Une <strong>Factory</strong> (fabrique) est un objet ou une méthode dont le seul rôle est de créer d'autres objets. Le code appelant lui donne une information (« csv ») et reçoit une interface (<code>IExporter</code>). Il ne sait jamais quelle classe a été instanciée.</p>
<div class="flow"><span>Appelant : \"csv\"</span><span>ExporterFactory.Create</span><span>new CsvExporter()</span><span>IExporter</span></div>
<p>En C#, une <strong>expression switch</strong> rend la fabrique très courte. Et si le format est inconnu, c'est la fabrique qui lève l'erreur, une seule fois, avec un message clair.</p>
<p>Le livre du GoF distingue « Factory Method » et « Abstract Factory ». Pour débuter, retiens l'idée commune : <strong>un endroit dédié décide quelle classe créer</strong>.</p>

<h3>La méthode de fabrique statique</h3>
<p>Une variante très courante : une méthode <code>static</code> dans la classe elle-même, comme <code>Order.Create(customerId)</code>. On rend le constructeur <code>private</code>, et <code>Create</code> devient la seule porte d'entrée. Avantages : un nom parlant, et une validation garantie. Impossible de créer une commande sans client.</p>
<p>Tu en utilises tous les jours dans .NET : <code>TimeSpan.FromMinutes(90)</code>, <code>Guid.NewGuid()</code>, <code>Task.FromResult(42)</code>, <code>WebApplication.CreateBuilder(args)</code>. Et avec la DI, <code>IHttpClientFactory.CreateClient()</code> ou <code>ILoggerFactory.CreateLogger()</code> sont de vraies fabriques.</p>

<h3>Le Builder : construire pas à pas</h3>
<p>Autre problème : un objet complexe, avec beaucoup de parties optionnelles. Un constructeur à huit paramètres est illisible (<code>new Order(7, null, true, 0, …)</code> : qui sait ce que veut dire <code>true</code> ?). Le <strong>Builder</strong> sépare la construction en petites étapes nommées, puis livre l'objet fini avec <code>Build()</code>.</p>
<p>Chaque méthode du builder renvoie <code>this</code>, ce qui permet de les enchaîner : c'est une <strong>API fluide</strong>. Et <code>Build()</code> est le bon endroit pour vérifier que l'objet est complet avant de le livrer.</p>
<pre class="diagram">
  new OrderBuilder()
     .ForCustomer(7)        --&gt; mémorise le client
     .AddLine(...)          --&gt; ajoute une ligne
     .AddLine(...)          --&gt; ajoute une ligne
     .Build()               --&gt; vérifie, puis crée Order
</pre>

<h3>Builder dans .NET</h3>
<table>
<tr><th>Builder</th><th>Ce qu'il construit</th></tr>
<tr><td><code>StringBuilder</code></td><td>une <code>string</code>, morceau par morceau</td></tr>
<tr><td><code>WebApplication.CreateBuilder(args)</code></td><td>l'application ASP.NET Core, livrée par <code>builder.Build()</code></td></tr>
<tr><td><code>DbContextOptionsBuilder</code></td><td>les options de ton <code>OrderFlowDbContext</code></td></tr>
<tr><td><code>UriBuilder</code></td><td>une <code>Uri</code> à partir de ses parties</td></tr>
</table>
<div class="tip">En C#, beaucoup de petits objets n'ont pas besoin de builder : un <code>record</code> avec un initialiseur d'objet (<code>new Product { Name = "Clavier", Price = 49.90m }</code>) et <code>with</code> font déjà le travail. Garde le builder pour les objets qui ont des règles de cohérence ou beaucoup d'étapes.</div>
<div class="note">Dans les tests, les builders brillent : un <code>OrderBuilder</code> avec des valeurs par défaut valides permet d'écrire <code>new OrderBuilder().WithStatus(OrderStatus.Paid).Build()</code> et de ne préciser que ce qui compte pour le test. On appelle ça un « test data builder ».</div>`,
  examples: [
    {
      title: "Une fabrique d'exporteurs",
      code: `foreach (var format in new[] { "csv", "json", "xml" })
{
    try
    {
        IExporter exporter = ExporterFactory.Create(format);
        Console.WriteLine(exporter.Export(["Clavier", "Souris"]));
    }
    catch (NotSupportedException ex)
    {
        Console.WriteLine($"Erreur : {ex.Message}");
    }
}

interface IExporter { string Export(string[] items); }

class CsvExporter : IExporter
{
    public string Export(string[] items) => string.Join(";", items);
}

class JsonExporter : IExporter
{
    public string Export(string[] items) =>
        "[" + string.Join(",", items.Select(i => $"\\"{i}\\"")) + "]";
}

// La fabrique : le seul endroit qui connaît les classes concrètes
static class ExporterFactory
{
    public static IExporter Create(string format) => format switch
    {
        "csv" => new CsvExporter(),
        "json" => new JsonExporter(),
        _ => throw new NotSupportedException($"Format inconnu : {format}")
    };
}`,
      output: `Clavier;Souris
["Clavier","Souris"]
Erreur : Format inconnu : xml`,
      steps: [
        "<code>interface IExporter</code> : le contrat commun à tous les exporteurs.",
        "<code>static class ExporterFactory</code> : la fabrique. C'est le seul fichier qui écrit <code>new CsvExporter()</code> ou <code>new JsonExporter()</code>.",
        "<code>format switch { ... }</code> : l'expression switch associe chaque format à une classe. Le cas <code>_</code> attrape tout le reste.",
        "<code>IExporter exporter = ExporterFactory.Create(format);</code> : l'appelant reçoit une interface et ne sait pas quelle classe se cache derrière.",
        "<code>catch (NotSupportedException ex)</code> : pour \"xml\", la fabrique lève une erreur claire au lieu de renvoyer <code>null</code>."
      ],
      explain: "Ajouter Excel = une classe de plus et une ligne dans le switch. Aucun appelant ne change."
    },
    {
      title: "Une méthode de fabrique statique qui valide",
      code: `var order = Order.Create(customerId: 7);
Console.WriteLine($"Commande du client {order.CustomerId} : {order.Status}");

try
{
    Order.Create(customerId: 0);
}
catch (ArgumentException ex)
{
    Console.WriteLine(ex.Message);
}

// Des méthodes de fabrique que .NET te fournit
Console.WriteLine(TimeSpan.FromMinutes(90));
Console.WriteLine(Guid.Empty);

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

class Order
{
    public int CustomerId { get; }
    public OrderStatus Status { get; private set; }

    // Constructeur privé : on passe forcément par Create
    private Order(int customerId)
    {
        CustomerId = customerId;
        Status = OrderStatus.Pending;
    }

    public static Order Create(int customerId)
    {
        if (customerId <= 0)
            throw new ArgumentException("Le client est obligatoire.", nameof(customerId));
        return new Order(customerId);
    }
}`,
      output: `Commande du client 7 : Pending
Le client est obligatoire. (Parameter 'customerId')
01:30:00
00000000-0000-0000-0000-000000000000`,
      steps: [
        "<code>private Order(int customerId)</code> : le constructeur est privé. Écrire <code>new Order(7)</code> hors de la classe ne compile pas.",
        "<code>public static Order Create(int customerId)</code> : la seule porte d'entrée. Elle vérifie la règle métier avant de créer l'objet.",
        "<code>throw new ArgumentException(..., nameof(customerId))</code> : .NET ajoute le nom du paramètre au message, d'où <code>(Parameter 'customerId')</code>.",
        "<code>Order.Create(customerId: 7)</code> : un argument nommé rend l'appel lisible.",
        "<code>TimeSpan.FromMinutes(90)</code> et <code>Guid.Empty</code> : des fabriques et instances prêtes à l'emploi du framework."
      ],
      explain: "Une commande sans client ne peut tout simplement pas exister : la règle est garantie par la structure du code."
    },
    {
      title: "Un Builder fluide avec validation",
      code: `using System.Globalization;
CultureInfo.CurrentCulture = CultureInfo.InvariantCulture; // point décimal partout

var order = new OrderBuilder()
    .ForCustomer(7)
    .AddLine("Clavier", 2, 49.90m)
    .AddLine("Souris", 1, 19.90m)
    .Build();
Console.WriteLine($"Client {order.CustomerId}, {order.Lines.Count} lignes, total {order.Total}");

try { new OrderBuilder().ForCustomer(7).Build(); }
catch (InvalidOperationException ex) { Console.WriteLine(ex.Message); }

record OrderLine(string Product, int Quantity, decimal UnitPrice);

record Order(int CustomerId, IReadOnlyList<OrderLine> Lines)
{
    public decimal Total => Lines.Sum(l => l.Quantity * l.UnitPrice);
}

class OrderBuilder
{
    private int _customerId;
    private readonly List<OrderLine> _lines = [];

    public OrderBuilder ForCustomer(int id) { _customerId = id; return this; }

    public OrderBuilder AddLine(string product, int quantity, decimal price)
    {
        _lines.Add(new OrderLine(product, quantity, price));
        return this;
    }

    public Order Build()
    {
        if (_customerId <= 0) throw new InvalidOperationException("Client manquant.");
        if (_lines.Count == 0) throw new InvalidOperationException("Une commande doit avoir au moins une ligne.");
        return new Order(_customerId, _lines.ToList());
    }
}`,
      output: `Client 7, 2 lignes, total 119.70
Une commande doit avoir au moins une ligne.`,
      steps: [
        "<code>CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;</code> : on fixe la culture pour afficher <code>119.70</code> avec un point, quel que soit le réglage de la machine.",
        "<code>public OrderBuilder ForCustomer(int id) { ...; return this; }</code> : chaque étape renvoie le builder lui-même, ce qui permet d'enchaîner les appels.",
        "<code>.AddLine(\"Clavier\", 2, 49.90m)</code> : chaque appel ajoute une ligne. Le builder accumule l'état dans ses champs privés.",
        "<code>public Order Build()</code> : vérifie les règles (client, au moins une ligne), puis crée l'objet final.",
        "<code>_lines.ToList()</code> : on donne une copie de la liste à la commande, pour qu'un appel ultérieur à <code>AddLine</code> ne la modifie pas.",
        "<code>new OrderBuilder().ForCustomer(7).Build()</code> : sans ligne, <code>Build()</code> refuse de livrer une commande incomplète."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ajouter un format à la fabrique",
      prompt: `<p>Reprends <code>ExporterFactory</code> et ajoute un <code>TextExporter</code> qui renvoie les éléments un par ligne, préfixés par <code>- </code>. Enregistre-le sous le format <code>"txt"</code> et teste-le.</p>`,
      hint: `<p><code>string.Join(Environment.NewLine, items.Select(i =&gt; "- " + i))</code> fait le travail.</p>`,
      solution: `Console.WriteLine(ExporterFactory.Create("txt").Export(["Clavier", "Souris"]));
// - Clavier
// - Souris

interface IExporter { string Export(string[] items); }

class CsvExporter : IExporter
{
    public string Export(string[] items) => string.Join(";", items);
}

class TextExporter : IExporter
{
    public string Export(string[] items) =>
        string.Join(Environment.NewLine, items.Select(i => "- " + i));
}

static class ExporterFactory
{
    public static IExporter Create(string format) => format switch
    {
        "csv" => new CsvExporter(),
        "txt" => new TextExporter(),
        _ => throw new NotSupportedException($"Format inconnu : {format}")
    };
}`
    },
    {
      level: "moyen",
      title: "Product.Create avec validation",
      prompt: `<p>Écris une classe <code>Product</code> (<code>Name</code>, <code>Price</code>, <code>Stock</code>) avec un constructeur privé et une méthode <code>static Product Create(string name, decimal price, int stock)</code>. Elle refuse un nom vide, un prix négatif ou nul et un stock négatif avec une <code>ArgumentException</code>. Teste un cas valide et un cas invalide.</p>`,
      hint: `<p><code>string.IsNullOrWhiteSpace(name)</code> détecte un nom vide. Pense à <code>nameof(price)</code> dans l'exception.</p>`,
      solution: `var keyboard = Product.Create("Clavier", 49.90m, 10);
Console.WriteLine(keyboard.Name);

try
{
    Product.Create("Souris", -5m, 3);
}
catch (ArgumentException ex)
{
    Console.WriteLine(ex.Message);
}

class Product
{
    public string Name { get; }
    public decimal Price { get; }
    public int Stock { get; }

    private Product(string name, decimal price, int stock)
    {
        Name = name;
        Price = price;
        Stock = stock;
    }

    public static Product Create(string name, decimal price, int stock)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Le nom est obligatoire.", nameof(name));
        if (price <= 0)
            throw new ArgumentException("Le prix doit être positif.", nameof(price));
        if (stock < 0)
            throw new ArgumentException("Le stock ne peut pas être négatif.", nameof(stock));
        return new Product(name, price, stock);
    }
}`
    },
    {
      level: "difficile",
      title: "Un builder de données de test",
      prompt: `<p>Écris un <code>CustomerBuilder</code> pour les tests : par défaut il produit un client valide (<code>Name = "Alice"</code>, <code>Email = "alice@example.com"</code>). Les méthodes <code>WithName</code> et <code>WithEmail</code> permettent de changer une seule valeur. <code>Build()</code> renvoie un <code>record Customer(string Name, string Email)</code> et refuse un email sans <code>@</code>.</p>`,
      hint: `<p>Initialise les champs privés avec les valeurs par défaut. Ainsi <code>new CustomerBuilder().Build()</code> fonctionne sans aucun appel.</p>`,
      solution: `var alice = new CustomerBuilder().Build();
var bob = new CustomerBuilder().WithName("Bob").WithEmail("bob@example.com").Build();
Console.WriteLine(alice);
Console.WriteLine(bob);

try
{
    new CustomerBuilder().WithEmail("pas-un-email").Build();
}
catch (InvalidOperationException ex)
{
    Console.WriteLine(ex.Message);
}

record Customer(string Name, string Email);

class CustomerBuilder
{
    private string _name = "Alice";
    private string _email = "alice@example.com";

    public CustomerBuilder WithName(string name) { _name = name; return this; }
    public CustomerBuilder WithEmail(string email) { _email = email; return this; }

    public Customer Build()
    {
        if (!_email.Contains('@'))
            throw new InvalidOperationException($"Email invalide : {_email}");
        return new Customer(_name, _email);
    }
}`
    }
  ],
  quiz: [
    {
      q: `Quel problème une Factory résout-elle d'abord ?`,
      options: ["Le choix de la classe concrète est répété à plusieurs endroits", "Le programme est trop lent", "Une classe a trop de propriétés"],
      answer: 0,
      why: `La fabrique centralise la décision « quelle classe créer ». Un objet avec beaucoup de parties à assembler, c'est plutôt le terrain du Builder.`
    },
    {
      q: `Pourquoi rendre le constructeur <code>private</code> quand on a une méthode <code>static Create</code> ?`,
      options: ["Pour aller plus vite", "Pour que tout le monde passe par <code>Create</code> et sa validation", "C'est obligatoire en C#"],
      answer: 1,
      why: `Si le constructeur reste public, on peut contourner <code>Create</code> et créer un objet invalide. Le rendre privé garantit que la validation s'applique toujours.`
    },
    {
      q: `Pourquoi chaque méthode d'un builder fluide renvoie-t-elle <code>this</code> ?`,
      options: ["Pour créer un nouveau builder à chaque appel", "Pour libérer la mémoire", "Pour pouvoir enchaîner les appels avec des points"],
      answer: 2,
      why: `Renvoyer <code>this</code> permet d'écrire <code>.ForCustomer(7).AddLine(...).Build()</code>. C'est le même objet builder qui accumule les informations.`
    },
    {
      q: `Lequel de ces types .NET est un Builder ?`,
      options: ["<code>StringBuilder</code>", "<code>List&lt;T&gt;</code>", "<code>Console</code>"],
      answer: 0,
      why: `<code>StringBuilder</code> assemble une chaîne morceau par morceau, puis la livre avec <code>ToString()</code>. <code>List&lt;T&gt;</code> est une collection, <code>Console</code> une classe utilitaire.`
    }
  ],
  project: `<p><strong>OrderFlow : créer des commandes valides.</strong></p>
<ul>
<li>Dans <code>Order</code>, rends le constructeur <code>private</code> (EF Core sait utiliser un constructeur privé sans paramètre) et ajoute <code>public static Order Create(int customerId)</code> qui met <code>Status = OrderStatus.Pending</code> et <code>OrderDate = DateTime.UtcNow</code>.</li>
<li>Remplace le <code>if</code> de l'export dans ton contrôleur par une <code>OrderExporterFactory</code> qui renvoie un <code>IOrderExporter</code> pour <code>csv</code> et <code>json</code>, et un 400 si le format est inconnu.</li>
<li>Dans le projet de tests, crée un <code>OrderBuilder</code> avec des valeurs par défaut valides : tu t'en serviras dans le chapitre sur les tests.</li>
</ul>`,
  resources: [
    { label: "Classe StringBuilder (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/system.text.stringbuilder" },
    { label: "Expression switch (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/switch-expression" }
  ]
});

// =====================================================================
// 3. Singleton : le pattern et sa version moderne avec la DI
// =====================================================================
window.COURSE.push({
  key: "pat-singleton-di",
  title: "Singleton : le pattern et sa version moderne avec la DI",
  summary: "Tu sauras écrire un Singleton classique, comprendre pourquoi on l'évite aujourd'hui, et obtenir le même résultat proprement avec AddSingleton.",
  objectives: [
    "Écrire un Singleton thread-safe avec Lazy<T>",
    "Expliquer les défauts du Singleton classique (état global, tests difficiles)",
    "Choisir entre Singleton, Scoped et Transient dans la DI",
    "Éviter la « captive dependency »"
  ],
  analogy: `<p>Dans une entreprise, il n'y a qu'<strong>une seule machine à café</strong>, et tout le monde l'utilise. Le Singleton classique, c'est la machine vissée au mur dans le couloir : impossible d'en mettre une autre, même pour la tester.</p>
<p>La version moderne, c'est le <strong>service des achats</strong> qui décide : « il y aura une seule machine, et je la livre à chaque étage ». Les employés ne savent pas d'où elle vient ; si un jour on veut une machine de test, on change juste la livraison.</p>`,
  lesson: `<h3>Le problème : une seule instance partagée</h3>
<p>Certains objets n'ont de sens qu'en un seul exemplaire : la configuration chargée au démarrage, un cache mémoire, un compteur de statistiques. En créer un par appel gaspillerait de la mémoire, ou pire, donnerait des valeurs différentes selon l'endroit du code.</p>
<p>Le pattern <strong>Singleton</strong> garantit deux choses : il n'existe <strong>qu'une seule instance</strong> de la classe, et tout le monde peut y accéder par un point unique.</p>

<h3>Le Singleton classique</h3>
<p>La recette tient en trois points : un constructeur <code>private</code> (personne ne peut faire <code>new</code>), un champ <code>static</code> qui garde l'instance unique, et une propriété <code>static Instance</code> pour la récupérer.</p>
<p>Le piège, c'est le <strong>multi-thread</strong> : si deux threads demandent l'instance au même moment, on peut en créer deux. <code>Lazy&lt;T&gt;</code> règle ça : il crée l'objet au premier accès à <code>.Value</code>, une seule fois, de façon sûre (on dit <em>thread-safe</em>).</p>
<pre class="diagram">
  AppSettings.Instance  --+
  AppSettings.Instance  --+--&gt;  [ Lazy ] --&gt; [ AppSettings ]
  AppSettings.Instance  --+     crée 1 fois   (unique)
</pre>

<h3>Pourquoi on l'évite aujourd'hui</h3>
<p>Le Singleton classique est devenu un anti-pattern dans la plupart des projets, pour trois raisons :</p>
<ul>
<li><strong>Dépendance cachée</strong> : une classe qui appelle <code>AppSettings.Instance</code> au milieu d'une méthode ne le dit pas dans son constructeur. Il faut lire tout le code pour le découvrir.</li>
<li><strong>Tests difficiles</strong> : impossible de remplacer l'instance par un faux pour un test. Et son état survit d'un test à l'autre.</li>
<li><strong>État global</strong> : n'importe qui peut le modifier, de n'importe où. Les bugs deviennent difficiles à tracer.</li>
</ul>

<h3>La version moderne : AddSingleton</h3>
<p>Avec l'injection de dépendances (DI), c'est le <strong>conteneur</strong> qui garantit l'instance unique. Tu écris une classe tout à fait normale (constructeur public, aucun <code>static</code>), et tu l'enregistres avec <code>services.AddSingleton&lt;T&gt;()</code>. Les classes qui en ont besoin la reçoivent dans leur constructeur. C'est exactement le <code>providedIn: 'root'</code> d'Angular : un service unique pour toute l'application, fourni par l'injecteur.</p>
<div class="compare"><div><h4>Singleton classique</h4><p><code>AppSettings.Instance</code> appelé partout. Unicité codée dans la classe. Impossible à remplacer en test.</p></div><div><h4>Singleton par la DI</h4><p><code>AddSingleton&lt;AppSettings&gt;()</code> une fois. La classe reste normale. En test, on passe ce qu'on veut au constructeur.</p></div></div>

<h3>Les trois durées de vie</h3>
<table>
<tr><th>Enregistrement</th><th>Une instance…</th><th>Exemple OrderFlow</th></tr>
<tr><td><code>AddSingleton</code></td><td>pour toute l'application</td><td>cache des produits, <code>TimeProvider</code></td></tr>
<tr><td><code>AddScoped</code></td><td>par scope, c'est-à-dire par requête HTTP</td><td><code>OrderFlowDbContext</code>, services métier</td></tr>
<tr><td><code>AddTransient</code></td><td>à chaque fois qu'on la demande</td><td>petits objets légers et sans état</td></tr>
</table>
<p>Dans .NET, tu croises aussi des singletons « statiques » assumés, parce qu'ils sont sans état ou thread-safe : <code>StringComparer.Ordinal</code>, <code>ArrayPool&lt;T&gt;.Shared</code>, <code>TimeProvider.System</code>, <code>EqualityComparer&lt;T&gt;.Default</code>.</p>

<h3>Le piège : la captive dependency</h3>
<p>Un singleton vit toute la durée de l'application. S'il reçoit un service <em>scoped</em> (comme le <code>DbContext</code>) dans son constructeur, il le garde prisonnier pour toujours : le même <code>DbContext</code> servira à toutes les requêtes, de tous les utilisateurs, en parallèle. C'est la <strong>captive dependency</strong>. Règle simple : un service ne doit dépendre que de services qui vivent <strong>au moins aussi longtemps</strong> que lui.</p>
<div class="tip">En environnement Development, ASP.NET Core active <code>ValidateScopes</code> et détecte ce piège au démarrage. Et un singleton est partagé par toutes les requêtes en même temps : s'il a un état modifiable, protège-le (<code>ConcurrentDictionary</code>, <code>lock</code>) ou, mieux, rends-le immuable.</div>`,
  examples: [
    {
      title: "Le Singleton classique avec Lazy<T>",
      code: `var a = AppSettings.Instance;
var b = AppSettings.Instance;

Console.WriteLine(ReferenceEquals(a, b));
Console.WriteLine($"Instances créées : {AppSettings.Created}");
Console.WriteLine(a.Currency);

sealed class AppSettings
{
    // Lazy crée l'objet au premier accès, une seule fois, même avec plusieurs threads
    private static readonly Lazy<AppSettings> _instance = new(() => new AppSettings());

    public static AppSettings Instance => _instance.Value;
    public static int Created { get; private set; }

    public string Currency { get; } = "EUR";

    // Personne d'autre ne peut écrire new AppSettings()
    private AppSettings() => Created++;
}`,
      output: `True
Instances créées : 1
EUR`,
      steps: [
        "<code>sealed class AppSettings</code> : <code>sealed</code> interdit l'héritage, qui permettrait de contourner l'unicité.",
        "<code>private AppSettings()</code> : le constructeur privé empêche tout <code>new</code> depuis l'extérieur. Il compte ses appels dans <code>Created</code>.",
        "<code>new(() =&gt; new AppSettings())</code> : on donne à <code>Lazy</code> la recette de création, sans l'exécuter tout de suite.",
        "<code>_instance.Value</code> : au premier accès, <code>Lazy</code> exécute la recette ; ensuite il renvoie toujours le même objet.",
        "<code>ReferenceEquals(a, b)</code> : <code>True</code>, les deux variables désignent la même instance, créée une seule fois."
      ],
      explain: "Ça marche, mais chaque classe qui appelle AppSettings.Instance cache cette dépendance."
    },
    {
      title: "Singleton, Scoped et Transient dans la DI",
      code: `// dotnet add package Microsoft.Extensions.DependencyInjection
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddSingleton<Catalog>();   // une seule pour toute l'appli
services.AddScoped<Cart>();         // une par scope (= une par requête HTTP)
services.AddTransient<Ticket>();    // une nouvelle à chaque demande
using var provider = services.BuildServiceProvider();

for (int request = 1; request <= 2; request++)
{
    using var scope = provider.CreateScope();   // simule une requête
    var sp = scope.ServiceProvider;
    var catalog = sp.GetRequiredService<Catalog>().Id;
    var carts = $"{sp.GetRequiredService<Cart>().Id}/{sp.GetRequiredService<Cart>().Id}";
    var tickets = $"{sp.GetRequiredService<Ticket>().Id}/{sp.GetRequiredService<Ticket>().Id}";
    Console.WriteLine($"Requête {request} : Catalog {catalog}, Cart {carts}, Ticket {tickets}");
}

// Chaque classe numérote ses instances
class Catalog { static int _n; public int Id { get; } = ++_n; }
class Cart { static int _n; public int Id { get; } = ++_n; }
class Ticket { static int _n; public int Id { get; } = ++_n; }`,
      output: `Requête 1 : Catalog 1, Cart 1/1, Ticket 1/2
Requête 2 : Catalog 1, Cart 2/2, Ticket 3/4`,
      steps: [
        "<code>services.AddSingleton&lt;Catalog&gt;();</code> : <code>Catalog</code> est une classe ordinaire. C'est le conteneur qui décide qu'il n'en existera qu'une.",
        "<code>provider.CreateScope()</code> : on simule une requête HTTP. ASP.NET Core crée un scope pour chaque requête.",
        "<code>Catalog 1</code> deux fois : le singleton est le même dans toutes les requêtes.",
        "<code>Cart 1/1</code> puis <code>Cart 2/2</code> : le scoped est le même <em>dans</em> une requête, mais nouveau à chaque requête.",
        "<code>Ticket 1/2</code> puis <code>Ticket 3/4</code> : le transient est recréé à chaque <code>GetRequiredService</code>.",
        "<code>static int _n; ... = ++_n;</code> : un compteur par classe pour numéroter les instances créées."
      ],
      explain: "Dans une vraie API, tu n'appelles jamais GetRequiredService : tu reçois les services dans ton constructeur."
    },
    {
      title: "La captive dependency détectée",
      code: `// dotnet add package Microsoft.Extensions.DependencyInjection
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddScoped<OrderFlowDb>();     // une par requête
services.AddSingleton<PriceCache>();   // vit toute l'application... et garde OrderFlowDb !

// ValidateScopes est activé automatiquement par ASP.NET Core en Development
using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateScopes = true });

try
{
    provider.GetRequiredService<PriceCache>();
}
catch (InvalidOperationException ex)
{
    Console.WriteLine(ex.Message);
}

class OrderFlowDb { }

class PriceCache(OrderFlowDb db)
{
    public OrderFlowDb Db { get; } = db;
}`,
      output: `Cannot consume scoped service 'OrderFlowDb' from singleton 'PriceCache'.`,
      steps: [
        "<code>services.AddScoped&lt;OrderFlowDb&gt;();</code> : la base doit vivre le temps d'une requête, comme un <code>DbContext</code>.",
        "<code>class PriceCache(OrderFlowDb db)</code> : le singleton demande un service scoped dans son constructeur. Il le garderait prisonnier à vie.",
        "<code>new ServiceProviderOptions { ValidateScopes = true }</code> : on demande au conteneur de vérifier les durées de vie.",
        "<code>provider.GetRequiredService&lt;PriceCache&gt;()</code> : le conteneur refuse et lève une <code>InvalidOperationException</code> avec un message explicite."
      ],
      explain: "La correction : rendre PriceCache scoped, ou lui injecter IServiceScopeFactory pour ouvrir un scope court quand il a besoin de la base."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Prouver l'unicité",
      prompt: `<p>Écris un Singleton classique <code>IdGenerator</code> avec <code>Lazy&lt;T&gt;</code> et une méthode <code>int Next()</code> qui renvoie 1, 2, 3… Appelle <code>IdGenerator.Instance.Next()</code> trois fois depuis trois variables différentes et vérifie que les numéros se suivent.</p>`,
      hint: `<p>Le compteur est un champ d'instance : comme il n'y a qu'une instance, il est partagé.</p>`,
      solution: `var g1 = IdGenerator.Instance;
var g2 = IdGenerator.Instance;
Console.WriteLine(g1.Next()); // 1
Console.WriteLine(g2.Next()); // 2
Console.WriteLine(IdGenerator.Instance.Next()); // 3

sealed class IdGenerator
{
    private static readonly Lazy<IdGenerator> _instance = new(() => new IdGenerator());
    public static IdGenerator Instance => _instance.Value;

    private int _current;
    private IdGenerator() { }

    // Interlocked rend l'incrément sûr si plusieurs threads l'appellent
    public int Next() => Interlocked.Increment(ref _current);
}`
    },
    {
      level: "moyen",
      title: "Du Singleton classique à la DI",
      prompt: `<p>Transforme <code>IdGenerator</code> en classe normale (constructeur public, pas de <code>static</code>). Enregistre-la avec <code>AddSingleton</code>, enregistre un <code>OrderService</code> en <code>AddTransient</code> qui la reçoit dans son constructeur, puis résous deux <code>OrderService</code> et montre qu'ils partagent le même générateur.</p>`,
      hint: `<p><code>class OrderService(IdGenerator ids) { public int NewOrderId() =&gt; ids.Next(); }</code></p>`,
      solution: `// dotnet add package Microsoft.Extensions.DependencyInjection
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddSingleton<IdGenerator>();
services.AddTransient<OrderService>();
using var provider = services.BuildServiceProvider();

var s1 = provider.GetRequiredService<OrderService>();
var s2 = provider.GetRequiredService<OrderService>();
Console.WriteLine(ReferenceEquals(s1, s2)); // False : transient
Console.WriteLine(s1.NewOrderId()); // 1
Console.WriteLine(s2.NewOrderId()); // 2 : même générateur

class IdGenerator
{
    private int _current;
    public int Next() => Interlocked.Increment(ref _current);
}

class OrderService(IdGenerator ids)
{
    public int NewOrderId() => ids.Next();
}`
    },
    {
      level: "difficile",
      title: "Réparer une captive dependency",
      prompt: `<p>Reprends le troisième exemple. Corrige <code>PriceCache</code> sans changer sa durée de vie : injecte-lui <code>IServiceScopeFactory</code> et, dans une méthode <code>Refresh()</code>, ouvre un scope, récupère <code>OrderFlowDb</code>, affiche un message, puis ferme le scope. Vérifie que deux appels utilisent deux bases différentes.</p>`,
      hint: `<p><code>using var scope = scopeFactory.CreateScope();</code> puis <code>scope.ServiceProvider.GetRequiredService&lt;OrderFlowDb&gt;()</code>.</p>`,
      solution: `// dotnet add package Microsoft.Extensions.DependencyInjection
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddScoped<OrderFlowDb>();
services.AddSingleton<PriceCache>();
using var provider = services.BuildServiceProvider(new ServiceProviderOptions { ValidateScopes = true });

var cache = provider.GetRequiredService<PriceCache>();
cache.Refresh(); // base 1
cache.Refresh(); // base 2

class OrderFlowDb { static int _n; public int Id { get; } = ++_n; }

class PriceCache(IServiceScopeFactory scopeFactory)
{
    public void Refresh()
    {
        // Un scope court, ouvert puis fermé à chaque rafraîchissement
        using var scope = scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<OrderFlowDb>();
        Console.WriteLine($"Rafraîchissement avec la base {db.Id}");
    }
}`
    }
  ],
  quiz: [
    {
      q: `Pourquoi utiliser <code>Lazy&lt;T&gt;</code> dans un Singleton classique ?`,
      options: ["Pour créer une instance par thread", "Pour créer l'instance une seule fois, au premier accès, même avec plusieurs threads", "Pour que l'instance soit supprimée automatiquement"],
      answer: 1,
      why: `<code>Lazy&lt;T&gt;</code> est thread-safe par défaut : même si deux threads lisent <code>.Value</code> en même temps, la fabrique n'est exécutée qu'une fois.`
    },
    {
      q: `Quel est le principal défaut du Singleton classique ?`,
      options: ["Il consomme trop de mémoire", "Il ne fonctionne pas en .NET 10", "C'est une dépendance cachée et globale, difficile à remplacer dans un test"],
      answer: 2,
      why: `Une classe qui appelle <code>X.Instance</code> ne le déclare nulle part, et on ne peut pas lui fournir un faux. La DI règle ces deux problèmes.`
    },
    {
      q: `Ton <code>OrderFlowDbContext</code> doit vivre le temps d'une requête HTTP. Quel enregistrement ?`,
      options: ["<code>AddScoped</code>", "<code>AddSingleton</code>", "<code>AddTransient</code>"],
      answer: 0,
      why: `Scoped = une instance par requête. C'est d'ailleurs ce que fait <code>AddDbContext</code> par défaut. En singleton, un même contexte serait partagé par toutes les requêtes en parallèle.`
    },
    {
      q: `Qu'est-ce qu'une « captive dependency » ?`,
      options: ["Un service qui ne peut pas être injecté", "Un service à durée de vie longue qui garde un service à durée de vie plus courte", "Une dépendance privée d'une classe"],
      answer: 1,
      why: `Un singleton qui reçoit un service scoped le garde à vie : le scoped n'est plus jamais renouvelé. ValidateScopes détecte ce cas.`
    }
  ],
  project: `<p><strong>OrderFlow : revoir les durées de vie.</strong></p>
<ul>
<li>Cherche dans ta solution tout <code>static</code> qui garde un état (<code>static List</code>, <code>static Dictionary</code>, <code>X.Instance</code>). Transforme-le en classe normale enregistrée avec <code>AddSingleton</code>.</li>
<li>Ajoute un <code>ProductCache</code> singleton qui garde les produits en mémoire dans un <code>ConcurrentDictionary&lt;int, Product&gt;</code>. Pour charger depuis la base, il utilise <code>IServiceScopeFactory</code> (jamais <code>OrderFlowDbContext</code> directement dans son constructeur).</li>
<li>Remplace les <code>DateTime.UtcNow</code> de tes services par un <code>TimeProvider</code> injecté (<code>services.AddSingleton(TimeProvider.System)</code>) : tu pourras fixer l'heure dans les tests.</li>
</ul>`,
  resources: [
    { label: "Injection de dépendances dans .NET (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/dependency-injection" },
    { label: "Recommandations pour l'injection de dépendances (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/dependency-injection-guidelines" }
  ]
});

// =====================================================================
// 4. Adapter et Facade : brancher et simplifier
// =====================================================================
window.COURSE.push({
  key: "pat-adapter-facade",
  title: "Adapter et Facade : brancher et simplifier",
  summary: "Tu sauras brancher une bibliothèque externe sur ton interface avec un Adapter, et cacher un enchaînement compliqué derrière une Facade.",
  objectives: [
    "Écrire un Adapter qui traduit une API externe vers ton interface",
    "Écrire une Facade qui offre une méthode simple pour un processus en plusieurs étapes",
    "Distinguer Adapter, Facade et Decorator",
    "Reconnaître ces deux patterns dans .NET"
  ],
  analogy: `<p>En voyage à Londres, ton chargeur a une prise française et le mur une prise anglaise. Tu ne changes ni le chargeur ni le mur : tu mets un <strong>adaptateur</strong> entre les deux. C'est l'<strong>Adapter</strong>.</p>
<p>À l'hôtel, tu demandes un taxi à la <strong>réception</strong>. La réceptionniste appelle la compagnie, vérifie l'adresse, note la course sur ta chambre. Toi, tu as dit une phrase. La réception est une <strong>Facade</strong> : un guichet simple devant plusieurs services.</p>`,
  lesson: `<h3>Le problème de l'Adapter : deux prises incompatibles</h3>
<p>OrderFlow a défini son interface de paiement : <code>IPaymentGateway.Pay(int orderId, decimal amount)</code> qui renvoie <code>true</code> ou <code>false</code>. Ton entreprise signe avec un prestataire qui fournit un SDK : <code>SubmitPayment(string reference, long amountInCents)</code> qui renvoie un code numérique (0 = OK). Les noms, les types et la convention de retour sont différents.</p>
<p>Tu ne peux pas modifier le SDK (ce n'est pas ton code). Et tu ne veux pas que tout OrderFlow parle en centimes et en codes d'erreur du prestataire : le jour où tu changes de prestataire, tout serait à réécrire.</p>

<h3>La solution : une classe qui traduit</h3>
<p>Un <strong>Adapter</strong> est une petite classe qui implémente <em>ton</em> interface et appelle l'objet externe à l'intérieur. Son seul travail : traduire. Les euros deviennent des centimes, le numéro de commande devient une référence <code>ORD-42</code>, le code 0 devient <code>true</code>.</p>
<div class="flow"><span>OrderService</span><span>IPaymentGateway</span><span>LegacyPayAdapter</span><span>LegacyPaySdk</span></div>
<p>Le reste d'OrderFlow ne voit que <code>IPaymentGateway</code>. Changer de prestataire, c'est écrire un nouvel adaptateur et changer une ligne d'enregistrement dans la DI. On appelle aussi ça une <strong>couche anticorruption</strong> : le vocabulaire étranger s'arrête à la frontière.</p>

<h3>Le problème de la Facade : trop d'étapes à connaître</h3>
<p>Passer une commande dans OrderFlow, c'est : réserver le stock, débiter le paiement, envoyer un mail de confirmation, dans cet ordre, et s'arrêter si le stock manque. Si chaque contrôleur (API, back-office, import de fichier) refait cet enchaînement, il y aura forcément un endroit où l'ordre est faux ou une étape oubliée.</p>

<h3>La solution : un guichet unique</h3>
<p>Une <strong>Facade</strong> (façade) est une classe qui offre une méthode simple, comme <code>PlaceOrder(...)</code>, et qui orchestre les sous-systèmes à l'intérieur. Les appelants ne connaissent plus que la façade. Les sous-systèmes restent disponibles pour qui en a vraiment besoin : la façade simplifie, elle n'interdit rien.</p>
<pre class="diagram">
  Contrôleur API ---+
  Back-office    ---+--&gt; CheckoutFacade.PlaceOrder()
  Import CSV     ---+         |
                              +--&gt; StockService
                              +--&gt; PaymentService
                              +--&gt; MailService
</pre>
<p>En pratique, dans une API ASP.NET Core, ton « service applicatif » (<code>OrderService.PlaceOrderAsync</code>) joue très souvent ce rôle de façade devant le <code>DbContext</code>, le paiement et les notifications.</p>

<h3>Où les croiser dans .NET</h3>
<table>
<tr><th>Type .NET</th><th>Pattern</th><th>Ce qu'il fait</th></tr>
<tr><td><code>StreamReader</code></td><td>Adapter</td><td>transforme un <code>Stream</code> (des octets) en <code>TextReader</code> (du texte)</td></tr>
<tr><td><code>ReadOnlyCollection&lt;T&gt;</code></td><td>Adapter</td><td>présente une <code>IList&lt;T&gt;</code> modifiable comme une collection en lecture seule</td></tr>
<tr><td><code>File.ReadAllText</code></td><td>Facade</td><td>ouvre le fichier, détecte l'encodage, lit tout, ferme : une ligne au lieu de cinq</td></tr>
<tr><td><code>HttpClient.GetFromJsonAsync</code></td><td>Facade</td><td>envoie la requête, vérifie le statut et désérialise le JSON</td></tr>
</table>
<p>Côté Angular, un service qui enveloppe une bibliothèque de cartes ou de graphiques pour exposer trois méthodes à tes composants, c'est aussi un adaptateur ou une façade.</p>

<h3>Ne pas confondre</h3>
<div class="compare"><div><h4>Adapter</h4><p>Change l'<strong>interface</strong> d'un objet pour qu'il rentre dans la tienne. Un objet enveloppé, une interface différente.</p></div><div><h4>Facade</h4><p>Offre une interface <strong>plus simple</strong> devant <strong>plusieurs</strong> objets. Ne traduit pas, orchestre.</p></div></div>
<p>Le Decorator, qu'on verra juste après, enveloppe aussi un objet, mais garde <em>la même</em> interface et ajoute un comportement.</p>
<div class="tip">Une façade doit rester mince : elle coordonne, elle ne contient pas les règles métier. Si ta façade grossit jusqu'à 1 000 lignes, elle est devenue une « God class » (on en reparle dans la leçon sur les anti-patterns).</div>`,
  examples: [
    {
      title: "Un Adapter autour d'un SDK de paiement",
      code: `IPaymentGateway gateway = new LegacyPayAdapter(new LegacyPaySdk());

Console.WriteLine(gateway.Pay(orderId: 42, amount: 59.90m) ? "Paiement accepté" : "Paiement refusé");
Console.WriteLine(gateway.Pay(orderId: 43, amount: 0m) ? "Paiement accepté" : "Paiement refusé");

// Notre interface : ce qu'OrderFlow veut
interface IPaymentGateway
{
    bool Pay(int orderId, decimal amount);
}

// Le SDK externe : on ne peut pas le modifier
class LegacyPaySdk
{
    public int SubmitPayment(string reference, long amountInCents)
    {
        Console.WriteLine($"[SDK] {reference} : {amountInCents} centimes");
        return amountInCents > 0 ? 0 : 51; // 0 = OK, sinon code d'erreur
    }
}

// L'adaptateur traduit l'un vers l'autre
class LegacyPayAdapter(LegacyPaySdk sdk) : IPaymentGateway
{
    public bool Pay(int orderId, decimal amount)
    {
        long cents = (long)(amount * 100);
        int code = sdk.SubmitPayment($"ORD-{orderId}", cents);
        return code == 0;
    }
}`,
      output: `[SDK] ORD-42 : 5990 centimes
Paiement accepté
[SDK] ORD-43 : 0 centimes
Paiement refusé`,
      steps: [
        "<code>interface IPaymentGateway</code> : le contrat qu'OrderFlow a choisi, avec ses propres types (euros en <code>decimal</code>, résultat en <code>bool</code>).",
        "<code>class LegacyPaySdk</code> : la classe externe, avec ses conventions (centimes, référence texte, code numérique).",
        "<code>class LegacyPayAdapter(LegacyPaySdk sdk) : IPaymentGateway</code> : l'adaptateur implémente notre interface et reçoit le SDK.",
        "<code>long cents = (long)(amount * 100);</code> : la traduction des euros en centimes, à un seul endroit.",
        "<code>return code == 0;</code> : le code du prestataire devient un simple <code>bool</code>. Le reste du programme ne connaît jamais le code 51."
      ],
      explain: "Changer de prestataire = écrire un autre adaptateur. Le code qui appelle Pay ne bouge pas."
    },
    {
      title: "Une Facade pour passer commande",
      code: `var checkout = new CheckoutFacade(new StockService(), new PaymentService(), new MailService());
checkout.PlaceOrder("Clavier", 2, "alice@example.com");
Console.WriteLine("---");
checkout.PlaceOrder("Écran", 9, "bob@example.com");

class StockService
{
    public bool Reserve(string product, int qty)
    {
        bool ok = qty <= 5;
        Console.WriteLine(ok ? $"Stock : {qty} x {product} réservés" : $"Stock : pas assez de {product}");
        return ok;
    }
}

class PaymentService
{
    public string Charge(decimal amount) { Console.WriteLine($"Paiement : {amount} EUR débités"); return "PAY-001"; }
}

class MailService
{
    public void Send(string to, string text) => Console.WriteLine($"Mail à {to} : {text}");
}

// La façade : une méthode simple, l'ordre des étapes est géré à l'intérieur
class CheckoutFacade(StockService stock, PaymentService payment, MailService mail)
{
    public void PlaceOrder(string product, int qty, string email)
    {
        if (!stock.Reserve(product, qty)) return;
        var paymentId = payment.Charge(qty * 25m);
        mail.Send(email, $"Commande payée ({paymentId})");
    }
}`,
      output: `Stock : 2 x Clavier réservés
Paiement : 50 EUR débités
Mail à alice@example.com : Commande payée (PAY-001)
---
Stock : pas assez de Écran`,
      steps: [
        "<code>StockService</code>, <code>PaymentService</code>, <code>MailService</code> : trois sous-systèmes, chacun avec sa propre API.",
        "<code>class CheckoutFacade(...)</code> : la façade reçoit les trois services et les cache derrière une seule méthode.",
        "<code>if (!stock.Reserve(product, qty)) return;</code> : la règle « on s'arrête si le stock manque » est écrite une seule fois.",
        "<code>payment.Charge(qty * 25m)</code> puis <code>mail.Send(...)</code> : l'ordre des étapes est garanti par la façade.",
        "<code>checkout.PlaceOrder(\"Écran\", 9, ...)</code> : le stock refuse, donc ni paiement ni mail."
      ],
      explain: "Le contrôleur, le back-office et l'import n'ont plus qu'une ligne à écrire, et ne peuvent plus se tromper d'ordre."
    },
    {
      title: "File.ReadAllText, une façade de .NET",
      code: `using System.Text;

var path = Path.Combine(Path.GetTempPath(), "orderflow-demo.txt");
File.WriteAllText(path, "Commande 42 : Pending");

// Sans façade : on assemble les pièces soi-même
using (var stream = new FileStream(path, FileMode.Open, FileAccess.Read))
using (var reader = new StreamReader(stream, Encoding.UTF8)) // adaptateur : octets -> texte
{
    Console.WriteLine($"À la main : {reader.ReadToEnd()}");
}

// Avec la façade : une ligne
Console.WriteLine($"Façade : {File.ReadAllText(path)}");

File.Delete(path);`,
      output: `À la main : Commande 42 : Pending
Façade : Commande 42 : Pending`,
      steps: [
        "<code>File.WriteAllText(path, ...)</code> : on prépare un petit fichier dans le dossier temporaire.",
        "<code>new FileStream(path, FileMode.Open, FileAccess.Read)</code> : ouvre le fichier comme un flux d'octets.",
        "<code>new StreamReader(stream, Encoding.UTF8)</code> : un adaptateur qui transforme ces octets en texte, avec le bon encodage.",
        "<code>using (...)</code> : il faut penser à fermer le flux et le lecteur, sinon le fichier reste verrouillé.",
        "<code>File.ReadAllText(path)</code> : la façade fait tout ça pour toi, ouverture et fermeture comprises."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Adapter un thermomètre américain",
      prompt: `<p>OrderFlow surveille la température de l'entrepôt avec l'interface <code>ITemperatureSensor { double ReadCelsius(); }</code>. Le capteur acheté fournit une classe <code>UsSensor</code> avec <code>double GetFahrenheit()</code> qui renvoie 68. Écris l'adaptateur et affiche la température en Celsius.</p>`,
      hint: `<p>Celsius = (Fahrenheit - 32) * 5 / 9.</p>`,
      solution: `ITemperatureSensor sensor = new UsSensorAdapter(new UsSensor());
Console.WriteLine($"{sensor.ReadCelsius()} °C"); // 20 °C

interface ITemperatureSensor { double ReadCelsius(); }

class UsSensor
{
    public double GetFahrenheit() => 68;
}

class UsSensorAdapter(UsSensor sensor) : ITemperatureSensor
{
    public double ReadCelsius() => (sensor.GetFahrenheit() - 32) * 5 / 9;
}`
    },
    {
      level: "moyen",
      title: "Deux prestataires, une interface",
      prompt: `<p>Ajoute un deuxième prestataire <code>QuickPayClient</code> dont la méthode est <code>string Charge(decimal euros, string orderRef)</code> et renvoie <code>"accepted"</code> ou <code>"declined"</code> (refuse au-delà de 1000 €). Écris son adaptateur vers <code>IPaymentGateway</code>, puis choisis l'adaptateur selon une variable <code>provider</code> et teste les deux.</p>`,
      hint: `<p>Une expression switch sur <code>provider</code> peut renvoyer un <code>IPaymentGateway</code> : c'est une petite fabrique.</p>`,
      solution: `foreach (var provider in new[] { "legacy", "quickpay" })
{
    IPaymentGateway gateway = provider switch
    {
        "legacy" => new LegacyPayAdapter(new LegacyPaySdk()),
        _ => new QuickPayAdapter(new QuickPayClient())
    };
    Console.WriteLine($"{provider} : {gateway.Pay(42, 1500m)}");
}

interface IPaymentGateway { bool Pay(int orderId, decimal amount); }

class LegacyPaySdk
{
    public int SubmitPayment(string reference, long cents) => cents > 0 ? 0 : 51;
}

class QuickPayClient
{
    public string Charge(decimal euros, string orderRef) => euros <= 1000 ? "accepted" : "declined";
}

class LegacyPayAdapter(LegacyPaySdk sdk) : IPaymentGateway
{
    public bool Pay(int orderId, decimal amount) => sdk.SubmitPayment($"ORD-{orderId}", (long)(amount * 100)) == 0;
}

class QuickPayAdapter(QuickPayClient client) : IPaymentGateway
{
    public bool Pay(int orderId, decimal amount) => client.Charge(amount, $"ORD-{orderId}") == "accepted";
}
// legacy : True
// quickpay : False`
    },
    {
      level: "difficile",
      title: "Une façade d'annulation",
      prompt: `<p>Écris une <code>CancellationFacade</code> avec une méthode <code>Cancel(int orderId, string email)</code> qui : rembourse le paiement (<code>PaymentService.Refund</code>), remet le stock (<code>StockService.Release</code>), envoie un mail. Si le remboursement échoue (renvoie <code>false</code>), rien d'autre ne doit se passer et la méthode renvoie <code>false</code>.</p>`,
      hint: `<p>Commence par l'étape qui peut échouer, et sors avec <code>return false</code> avant de toucher au stock.</p>`,
      solution: `var facade = new CancellationFacade(new PaymentService(), new StockService(), new MailService());
Console.WriteLine(facade.Cancel(42, "alice@example.com")); // True
Console.WriteLine(facade.Cancel(-1, "bob@example.com"));   // False

class PaymentService
{
    public bool Refund(int orderId)
    {
        Console.WriteLine($"Remboursement de la commande {orderId}");
        return orderId > 0;
    }
}

class StockService
{
    public void Release(int orderId) => Console.WriteLine($"Stock remis pour la commande {orderId}");
}

class MailService
{
    public void Send(string to, string text) => Console.WriteLine($"Mail à {to} : {text}");
}

class CancellationFacade(PaymentService payment, StockService stock, MailService mail)
{
    public bool Cancel(int orderId, string email)
    {
        if (!payment.Refund(orderId)) return false;
        stock.Release(orderId);
        mail.Send(email, $"Commande {orderId} annulée");
        return true;
    }
}`
    }
  ],
  quiz: [
    {
      q: `Tu dois utiliser une bibliothèque externe dont les méthodes ne correspondent pas à ton interface. Quel pattern ?`,
      options: ["Facade", "Adapter", "Singleton"],
      answer: 1,
      why: `L'Adapter traduit une interface existante (celle de la bibliothèque) vers celle que ton code attend. La Facade simplifie plusieurs objets, elle ne sert pas à faire correspondre deux interfaces.`
    },
    {
      q: `Quelle phrase décrit le mieux une Facade ?`,
      options: ["Une méthode simple qui orchestre plusieurs sous-systèmes", "Une classe qui ajoute du cache autour d'un service", "Une classe qui ne peut avoir qu'une instance"],
      answer: 0,
      why: `La façade offre un point d'entrée simple devant un ensemble compliqué. Ajouter du cache sans changer l'interface, c'est le Decorator ; une seule instance, c'est le Singleton.`
    },
    {
      q: `Pourquoi l'adaptateur est-il utile même si un seul prestataire existe aujourd'hui ?`,
      options: ["Il rend le paiement plus rapide", "Il est obligatoire pour appeler un SDK", "Il empêche le vocabulaire du prestataire (centimes, codes) de se répandre dans tout le code"],
      answer: 2,
      why: `La traduction est concentrée à un seul endroit : le reste d'OrderFlow parle sa propre langue. Ce n'est pas une obligation technique, c'est une protection contre le changement.`
    },
    {
      q: `<code>StreamReader</code> enveloppe un <code>Stream</code> pour lire du texte. C'est…`,
      options: ["une Facade", "un Adapter", "un Builder"],
      answer: 1,
      why: `Il transforme une interface (un flux d'octets) en une autre (un lecteur de texte). C'est la définition de l'Adapter. <code>File.ReadAllText</code>, lui, est une façade qui l'utilise.`
    }
  ],
  project: `<p><strong>OrderFlow : un paiement branchable et un guichet de commande.</strong></p>
<ul>
<li>Crée l'interface <code>IPaymentGateway</code> dans OrderFlow.Domain (ou ton projet métier) avec <code>Task&lt;PaymentResult&gt; PayAsync(int orderId, decimal amount)</code>.</li>
<li>Écris un <code>FakePaymentAdapter</code> qui accepte tout paiement inférieur à 10 000 € : il simule un prestataire tant que tu n'en as pas. Enregistre-le avec <code>AddScoped&lt;IPaymentGateway, FakePaymentAdapter&gt;()</code>.</li>
<li>Crée un <code>CheckoutService.PlaceOrderAsync(customerId, lines)</code> qui joue le rôle de façade : vérifie et décrémente le stock des <code>Products</code>, crée l'<code>Order</code> et ses <code>OrderLines</code>, appelle le paiement, passe le statut à <code>Paid</code> et enregistre avec un seul <code>SaveChangesAsync</code>. Ton endpoint <code>POST /api/orders</code> n'appelle plus que cette méthode.</li>
</ul>`,
  resources: [
    { label: "Classe StreamReader (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/system.io.streamreader" },
    { label: "Modèle Couche anticorruption (Azure Architecture Center)", url: "https://learn.microsoft.com/fr-fr/azure/architecture/patterns/anti-corruption-layer" }
  ]
});

// =====================================================================
// 5. Decorator : ajouter un comportement sans toucher la classe
// =====================================================================
window.COURSE.push({
  key: "pat-decorator",
  title: "Decorator : ajouter un comportement sans toucher la classe",
  summary: "Tu sauras ajouter du cache, des logs ou des mesures autour d'un service existant, sans modifier sa classe, en empilant des décorateurs.",
  objectives: [
    "Expliquer pourquoi l'héritage ne suffit pas pour combiner des comportements",
    "Écrire un décorateur qui implémente la même interface que l'objet qu'il enveloppe",
    "Empiler plusieurs décorateurs et comprendre l'ordre d'exécution",
    "Reconnaître le Decorator dans les Stream, les DelegatingHandler et la DI"
  ],
  analogy: `<p>Pense à un <strong>cadeau</strong>. L'objet est dans une boîte, la boîte dans un papier, le papier entouré d'un ruban. Chaque couche ajoute quelque chose (protection, joli, nœud), mais de l'extérieur, c'est toujours « un cadeau » qu'on tend à quelqu'un.</p>
<p>On peut ajouter ou retirer une couche sans toucher à l'objet. C'est le <strong>Decorator</strong> : des enveloppes successives qui gardent la même forme.</p>`,
  lesson: `<h3>Le problème : ajouter sans modifier</h3>
<p>Ton <code>SqlCatalog</code> lit les produits en base. Tu veux maintenant : mettre en <strong>cache</strong> les résultats, <strong>tracer</strong> chaque appel dans les logs, et peut-être <strong>mesurer</strong> la durée. Première idée : tout écrire dans <code>SqlCatalog</code>. La classe mélange alors SQL, cache, logs et chronomètre. Et pour un test sans cache, il faut un <code>if</code> de plus.</p>
<p>Deuxième idée : l'héritage. <code>CachedSqlCatalog : SqlCatalog</code>, puis <code>LoggedCachedSqlCatalog</code>, puis <code>LoggedSqlCatalog</code> sans cache… Avec 3 comportements optionnels, tu as vite 8 sous-classes. C'est l'<strong>explosion de sous-classes</strong>.</p>

<h3>La solution : envelopper l'objet</h3>
<p>Un <strong>Decorator</strong> est une classe qui :</p>
<ul>
<li>implémente <strong>la même interface</strong> que l'objet décoré (<code>IProductCatalog</code>) ;</li>
<li>reçoit cet objet dans son constructeur (on l'appelle souvent <code>inner</code>, « l'intérieur ») ;</li>
<li>fait son travail <strong>avant et/ou après</strong> avoir appelé <code>inner</code>.</li>
</ul>
<p>Comme le décorateur a la même interface, on peut en empiler autant qu'on veut, dans l'ordre qu'on veut. Le code appelant ne voit qu'un <code>IProductCatalog</code>.</p>
<pre class="diagram">
  appelant
     |  GetName(1)
     v
  [ LoggingCatalog ]   log avant / après
     |
     v
  [ CachingCatalog ]   répond tout seul si déjà en cache
     |
     v
  [ SqlCatalog ]       la vraie lecture en base
</pre>
<p>L'ordre compte. Ici, les logs sont à l'extérieur : on trace <em>tous</em> les appels, même ceux servis par le cache. Mets le cache à l'extérieur, et seuls les appels qui ratent le cache seront tracés.</p>

<h3>Le principe ouvert/fermé</h3>
<p>Le Decorator illustre bien le <strong>principe ouvert/fermé</strong> (le « O » de SOLID) : une classe doit être <em>ouverte à l'extension</em> mais <em>fermée à la modification</em>. Tu ajoutes un comportement en écrivant une nouvelle classe, sans rouvrir <code>SqlCatalog</code>, qui reste testée et stable.</p>

<h3>Tu l'utilises déjà dans .NET</h3>
<table>
<tr><th>Où</th><th>Le décorateur</th><th>Ce qu'il ajoute</th></tr>
<tr><td>Flux</td><td><code>GZipStream</code>, <code>BufferedStream</code>, <code>CryptoStream</code></td><td>compression, tampon, chiffrement autour d'un autre <code>Stream</code></td></tr>
<tr><td><code>HttpClient</code></td><td><code>DelegatingHandler</code></td><td>logs, en-têtes, retry autour du handler suivant (<code>InnerHandler</code>)</td></tr>
<tr><td>Logs</td><td><code>Logger&lt;T&gt;</code></td><td>enveloppe un <code>ILogger</code> créé par la fabrique en lui donnant le nom de la catégorie</td></tr>
</table>
<p>Les <code>DelegatingHandler</code> sont l'équivalent direct des <strong>intercepteurs HTTP d'Angular</strong>, mais côté appels sortants de ton serveur : chaque handler peut lire la requête, appeler le suivant, puis lire la réponse. On les branche avec <code>AddHttpClient&lt;T&gt;().AddHttpMessageHandler&lt;LoggingHandler&gt;()</code>.</p>

<h3>Enregistrer un décorateur dans la DI</h3>
<p>Le conteneur de .NET n'a pas de méthode « décorer ». On enregistre l'interface avec une <strong>fabrique</strong> (une lambda) qui assemble les couches : <code>services.AddScoped&lt;IProductCatalog&gt;(sp =&gt; new CachingCatalog(sp.GetRequiredService&lt;SqlCatalog&gt;()))</code>. La classe réelle est enregistrée sous son propre type, et seule l'interface renvoie la version décorée. La bibliothèque Scrutor ajoute une méthode <code>services.Decorate&lt;IProductCatalog, CachingCatalog&gt;()</code> qui fait la même chose en une ligne.</p>
<div class="tip">Ne confonds pas avec les « décorateurs » TypeScript (<code>@Injectable</code>) ni avec les attributs C# (<code>[HttpGet]</code>) : ce sont des métadonnées posées sur une classe. Le Decorator du GoF est un objet qui en enveloppe un autre, à l'exécution.</div>
<div class="note">Un bon décorateur fait <strong>une seule chose</strong> et ne change pas le sens du résultat. S'il commence à modifier les données renvoyées ou à contenir des règles métier, ce n'est plus un décorateur mais un service caché. Pour du cache en production, regarde <code>HybridCache</code> (.NET 9+), qui gère l'expiration et la protection contre les appels simultanés.</div>`,
  examples: [
    {
      title: "Empiler un cache et des logs",
      code: `IProductCatalog catalog = new LoggingCatalog(new CachingCatalog(new SqlCatalog()));

Console.WriteLine(catalog.GetName(1));
Console.WriteLine(catalog.GetName(1));

interface IProductCatalog { string GetName(int id); }

// La vraie classe : on n'y touche pas
class SqlCatalog : IProductCatalog
{
    public string GetName(int id)
    {
        Console.WriteLine("  [SQL] SELECT Name FROM Products ...");
        return id == 1 ? "Clavier" : "Inconnu";
    }
}

// Décorateur 1 : ajoute un cache
class CachingCatalog(IProductCatalog inner) : IProductCatalog
{
    private readonly Dictionary<int, string> _cache = [];
    public string GetName(int id)
    {
        if (_cache.TryGetValue(id, out var name)) return name;
        return _cache[id] = inner.GetName(id);
    }
}

// Décorateur 2 : ajoute des logs
class LoggingCatalog(IProductCatalog inner) : IProductCatalog
{
    public string GetName(int id)
    {
        Console.WriteLine($"-> GetName({id})");
        var result = inner.GetName(id);
        Console.WriteLine($"<- {result}");
        return result;
    }
}`,
      output: `-> GetName(1)
  [SQL] SELECT Name FROM Products ...
<- Clavier
Clavier
-> GetName(1)
<- Clavier
Clavier`,
      steps: [
        "<code>new LoggingCatalog(new CachingCatalog(new SqlCatalog()))</code> : on emboîte les couches comme des poupées russes. La variable est typée <code>IProductCatalog</code>.",
        "<code>class CachingCatalog(IProductCatalog inner) : IProductCatalog</code> : même interface que l'objet décoré, et l'objet décoré reçu en paramètre.",
        "<code>return _cache[id] = inner.GetName(id);</code> : en cas d'absence, on délègue à <code>inner</code>, on range le résultat et on le renvoie.",
        "<code>Console.WriteLine($\"-&gt; GetName({id})\");</code> : <code>LoggingCatalog</code> agit avant et après l'appel à <code>inner</code>.",
        "Deuxième appel : le log est là, mais pas la ligne <code>[SQL]</code>. Le cache a répondu sans descendre jusqu'à la base."
      ],
      explain: "SqlCatalog ignore tout du cache et des logs : chaque classe a une seule responsabilité."
    },
    {
      title: "Un DelegatingHandler autour de HttpClient",
      code: `var handler = new LoggingHandler { InnerHandler = new FakeApiHandler() };
using var client = new HttpClient(handler) { BaseAddress = new Uri("https://api.example.com/") };

var response = await client.GetAsync("products/1");
Console.WriteLine($"Réponse : {(int)response.StatusCode}");
Console.WriteLine(await response.Content.ReadAsStringAsync());

// Un décorateur de requêtes HTTP : il entoure le handler suivant
class LoggingHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        Console.WriteLine($"-> {request.Method} {request.RequestUri}");
        var response = await base.SendAsync(request, ct);   // appelle InnerHandler
        Console.WriteLine($"<- {(int)response.StatusCode}");
        return response;
    }
}

// Faux serveur : renvoie toujours la même réponse, sans réseau
class FakeApiHandler : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
        Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.OK)
        {
            Content = new StringContent("{\\"id\\":1,\\"name\\":\\"Clavier\\"}")
        });
}`,
      output: `-> GET https://api.example.com/products/1
<- 200
Réponse : 200
{"id":1,"name":"Clavier"}`,
      steps: [
        "<code>class LoggingHandler : DelegatingHandler</code> : .NET fournit la classe de base des décorateurs HTTP. Elle a une propriété <code>InnerHandler</code>.",
        "<code>await base.SendAsync(request, ct)</code> : transmet la requête au handler intérieur. Avant : on lit la requête ; après : on lit la réponse.",
        "<code>class FakeApiHandler : HttpMessageHandler</code> : le dernier maillon. Normalement c'est lui qui parle au réseau ; ici il renvoie une réponse fixe.",
        "<code>new LoggingHandler { InnerHandler = new FakeApiHandler() }</code> : on emboîte les handlers, exactement comme les catalogues de l'exemple précédent.",
        "<code>new HttpClient(handler)</code> : <code>HttpClient</code> ne sait pas qu'il y a un décorateur. Il appelle la couche extérieure."
      ],
      explain: "C'est le même mécanisme que les intercepteurs Angular, pour les appels HTTP que ton API fait vers d'autres services."
    },
    {
      title: "Enregistrer un décorateur dans la DI",
      code: `// dotnet add package Microsoft.Extensions.DependencyInjection
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddSingleton<SqlCatalog>();                    // la vraie classe, sous son type
services.AddSingleton<IProductCatalog>(sp =>            // l'interface renvoie la version décorée
    new CachingCatalog(sp.GetRequiredService<SqlCatalog>()));
using var provider = services.BuildServiceProvider();

var catalog = provider.GetRequiredService<IProductCatalog>();
Console.WriteLine(catalog.GetType().Name);
Console.WriteLine(catalog.GetName(1));
Console.WriteLine(catalog.GetName(1));

interface IProductCatalog { string GetName(int id); }

class SqlCatalog : IProductCatalog
{
    public string GetName(int id)
    {
        Console.WriteLine($"[SQL] lecture du produit {id}");
        return "Clavier";
    }
}

class CachingCatalog(IProductCatalog inner) : IProductCatalog
{
    private readonly Dictionary<int, string> _cache = [];
    public string GetName(int id) =>
        _cache.TryGetValue(id, out var name) ? name : _cache[id] = inner.GetName(id);
}`,
      output: `CachingCatalog
[SQL] lecture du produit 1
Clavier
Clavier`,
      steps: [
        "<code>services.AddSingleton&lt;SqlCatalog&gt;();</code> : la classe réelle est enregistrée sous son propre type, pas sous l'interface.",
        "<code>services.AddSingleton&lt;IProductCatalog&gt;(sp =&gt; ...)</code> : on donne une fabrique au conteneur. Quand quelqu'un demande l'interface, il reçoit le décorateur.",
        "<code>sp.GetRequiredService&lt;SqlCatalog&gt;()</code> : la fabrique récupère la vraie classe et l'enveloppe.",
        "<code>catalog.GetType().Name</code> : le consommateur a demandé <code>IProductCatalog</code> et a reçu un <code>CachingCatalog</code>, sans le savoir.",
        "Le cache est un singleton ici : il survit d'une demande à l'autre. Avec un <code>Dictionary</code> partagé entre requêtes, utilise plutôt un <code>ConcurrentDictionary</code> en vrai."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un décorateur qui compte",
      prompt: `<p>Écris un décorateur <code>CountingCatalog</code> pour <code>IProductCatalog</code> qui compte le nombre d'appels à <code>GetName</code> dans une propriété <code>Calls</code>. Enveloppe un <code>SqlCatalog</code>, appelle trois fois <code>GetName</code> et affiche <code>Calls</code>.</p>`,
      hint: `<p>Incrémente le compteur, puis renvoie <code>inner.GetName(id)</code>.</p>`,
      solution: `var counting = new CountingCatalog(new SqlCatalog());
counting.GetName(1);
counting.GetName(2);
counting.GetName(1);
Console.WriteLine($"Appels : {counting.Calls}"); // 3

interface IProductCatalog { string GetName(int id); }

class SqlCatalog : IProductCatalog
{
    public string GetName(int id) => $"Produit {id}";
}

class CountingCatalog(IProductCatalog inner) : IProductCatalog
{
    public int Calls { get; private set; }

    public string GetName(int id)
    {
        Calls++;
        return inner.GetName(id);
    }
}`
    },
    {
      level: "moyen",
      title: "Un décorateur chronomètre",
      prompt: `<p>Écris un <code>TimingCatalog</code> qui mesure la durée de chaque appel avec <code>System.Diagnostics.Stopwatch</code> et affiche « GetName(1) : lent » si l'appel dépasse 50 ms, sinon « GetName(1) : rapide ». Pour tester, fais un <code>SlowCatalog</code> qui attend 100 ms (<code>Thread.Sleep(100)</code>) pour l'id 1 et répond tout de suite sinon.</p>`,
      hint: `<p><code>var sw = Stopwatch.StartNew();</code> avant l'appel, puis <code>sw.ElapsedMilliseconds</code> après.</p>`,
      solution: `using System.Diagnostics;

IProductCatalog catalog = new TimingCatalog(new SlowCatalog());
catalog.GetName(1); // GetName(1) : lent
catalog.GetName(2); // GetName(2) : rapide

interface IProductCatalog { string GetName(int id); }

class SlowCatalog : IProductCatalog
{
    public string GetName(int id)
    {
        if (id == 1) Thread.Sleep(100);
        return $"Produit {id}";
    }
}

class TimingCatalog(IProductCatalog inner) : IProductCatalog
{
    public string GetName(int id)
    {
        var sw = Stopwatch.StartNew();
        var result = inner.GetName(id);
        sw.Stop();
        Console.WriteLine($"GetName({id}) : {(sw.ElapsedMilliseconds > 50 ? "lent" : "rapide")}");
        return result;
    }
}`
    },
    {
      level: "difficile",
      title: "Un handler qui ajoute un en-tête",
      prompt: `<p>Écris un <code>CorrelationIdHandler : DelegatingHandler</code> qui ajoute l'en-tête <code>X-Correlation-Id</code> à chaque requête (valeur fixe <code>"abc-123"</code> pour le test). Empile-le devant le <code>LoggingHandler</code> de l'exemple et un faux handler qui renvoie dans le corps de la réponse la valeur de l'en-tête reçu. Affiche le corps.</p>`,
      hint: `<p><code>request.Headers.Add("X-Correlation-Id", "abc-123");</code> puis <code>base.SendAsync</code>. Dans le faux handler, lis <code>request.Headers.GetValues("X-Correlation-Id").First()</code>.</p>`,
      solution: `var handler = new CorrelationIdHandler
{
    InnerHandler = new LoggingHandler { InnerHandler = new EchoHandler() }
};
using var client = new HttpClient(handler) { BaseAddress = new Uri("https://api.example.com/") };

var body = await client.GetStringAsync("orders");
Console.WriteLine($"Le serveur a reçu : {body}");

class CorrelationIdHandler : DelegatingHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        request.Headers.Add("X-Correlation-Id", "abc-123");
        return base.SendAsync(request, ct);
    }
}

class LoggingHandler : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
    {
        Console.WriteLine($"-> {request.Method} {request.RequestUri}");
        return await base.SendAsync(request, ct);
    }
}

class EchoHandler : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) =>
        Task.FromResult(new HttpResponseMessage(System.Net.HttpStatusCode.OK)
        {
            Content = new StringContent(request.Headers.GetValues("X-Correlation-Id").First())
        });
}
// -> GET https://api.example.com/orders
// Le serveur a reçu : abc-123`
    }
  ],
  quiz: [
    {
      q: `Qu'est-ce qui caractérise un Decorator ?`,
      options: ["Il hérite de la classe qu'il veut améliorer", "Il implémente la même interface que l'objet qu'il enveloppe et lui délègue le travail", "Il remplace l'objet par un objet d'une autre interface"],
      answer: 1,
      why: `Même interface + objet intérieur reçu au constructeur : c'est ce qui permet d'empiler les décorateurs. Changer d'interface, c'est le rôle de l'Adapter.`
    },
    {
      q: `Avec <code>new LoggingCatalog(new CachingCatalog(new SqlCatalog()))</code>, que se passe-t-il au deuxième appel du même id ?`,
      options: ["Le log s'affiche, mais la base n'est pas interrogée", "Rien ne s'affiche", "La base est interrogée une deuxième fois"],
      answer: 0,
      why: `<code>LoggingCatalog</code> est à l'extérieur : il trace chaque appel. <code>CachingCatalog</code> répond ensuite depuis son dictionnaire, sans appeler <code>SqlCatalog</code>.`
    },
    {
      q: `Lequel de ces types .NET est un décorateur ?`,
      options: ["<code>List&lt;T&gt;</code>", "<code>Console</code>", "<code>GZipStream</code>"],
      answer: 2,
      why: `<code>GZipStream</code> est un <code>Stream</code> qui enveloppe un autre <code>Stream</code> pour compresser ou décompresser ce qui passe : même interface, comportement ajouté.`
    },
    {
      q: `Comment enregistrer un décorateur avec le conteneur DI de base de .NET ?`,
      options: ["Avec l'attribut <code>[Decorator]</code>", "Avec une fabrique : <code>AddScoped&lt;IProductCatalog&gt;(sp =&gt; new CachingCatalog(...))</code>", "Ce n'est pas possible"],
      answer: 1,
      why: `Le conteneur de base n'a pas de méthode dédiée, mais une fabrique (lambda) permet d'assembler les couches. L'attribut <code>[Decorator]</code> n'existe pas ; Scrutor ajoute une méthode <code>Decorate</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : un catalogue décoré.</strong></p>
<ul>
<li>Extrais une interface <code>IProductReader</code> (<code>GetByIdAsync</code>, <code>GetAllAsync</code>) de ton code de lecture des <code>Products</code>, implémentée par <code>EfProductReader</code> qui utilise <code>OrderFlowDbContext</code>.</li>
<li>Écris un <code>CachedProductReader</code> qui utilise <code>IMemoryCache</code> (<code>services.AddMemoryCache()</code>) avec une expiration de 5 minutes, puis un <code>LoggedProductReader</code> qui logge l'id demandé et la durée avec <code>ILogger&lt;LoggedProductReader&gt;</code>.</li>
<li>Enregistre la chaîne avec une fabrique dans <code>Program.cs</code>. Appelle deux fois <code>GET /api/products/1</code> et vérifie dans les logs EF Core qu'une seule requête SQL part.</li>
<li>Bonus : ajoute un <code>DelegatingHandler</code> qui logge les appels sortants de ton futur client HTTP de taux de change.</li>
</ul>`,
  resources: [
    { label: "Middleware de requêtes sortantes HttpClient (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/http-requests#outgoing-request-middleware" },
    { label: "Mise en cache en mémoire (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/performance/caching/memory" }
  ]
});

// =====================================================================
// 6. Strategy : changer d'algorithme à la volée
// =====================================================================
window.COURSE.push({
  key: "pat-strategy",
  title: "Strategy : changer d'algorithme à la volée",
  summary: "Tu sauras remplacer un switch qui grossit par des stratégies interchangeables, en classes, en délégués ou en services nommés de la DI.",
  objectives: [
    "Reconnaître le switch qui grossit et ce qu'il coûte",
    "Extraire chaque variante dans une classe stratégie derrière une interface",
    "Utiliser un délégué (Func) comme stratégie légère",
    "Choisir une stratégie à l'exécution avec les keyed services"
  ],
  analogy: `<p>Pour aller au travail, tu peux prendre le <strong>vélo</strong>, le <strong>métro</strong> ou la <strong>voiture</strong>. Le but est le même (arriver au bureau), seule la manière change. Et tu choisis le matin selon la météo, sans changer de travail ni de domicile.</p>
<p>Chaque moyen de transport est une <strong>stratégie</strong> : interchangeable, choisie au dernier moment, pour un même objectif.</p>`,
  lesson: `<h3>Le problème : le switch qui grossit</h3>
<p>OrderFlow calcule les frais de livraison. Au début, c'est un <code>switch</code> sur le mode : standard, express. Puis on ajoute le retrait en magasin. Puis le point relais. Puis « express gratuit au-delà de 100 € ». Chaque nouvelle règle oblige à rouvrir la même méthode, qui devient longue, et chaque modification risque de casser un cas voisin.</p>
<p>Pire : le même <code>switch</code> sur le mode réapparaît ailleurs (délai estimé, nom affiché, transporteur). Ajouter un mode, c'est modifier quatre méthodes.</p>

<h3>La solution : une classe par algorithme</h3>
<p>Le pattern <strong>Strategy</strong> sort chaque variante dans sa propre classe, derrière une interface commune (<code>IShippingStrategy</code>). L'objet qui les utilise, appelé le <strong>contexte</strong>, garde une référence vers « la stratégie courante » et lui délègue le calcul. On peut changer de stratégie à tout moment, même pendant l'exécution.</p>
<div class="compare"><div><h4>Avant : switch</h4><p>Une méthode connaît tous les modes. Ajouter un mode = modifier la méthode (et ses sœurs).</p></div><div><h4>Après : Strategy</h4><p>Chaque mode est une classe. Ajouter un mode = ajouter une classe et l'enregistrer.</p></div></div>
<pre class="diagram">
  ShippingCalculator ----&gt; IShippingStrategy
     (contexte)               ^      ^      ^
                              |      |      |
                       Standard  Express  Pickup
</pre>
<p>Chaque stratégie est petite, se teste seule, et peut regrouper tout ce qui concerne son mode (coût, délai, transporteur). C'est encore le principe ouvert/fermé : on étend sans modifier.</p>

<h3>La version légère : un délégué</h3>
<p>Quand la stratégie n'est qu'une seule fonction, une interface est parfois trop lourde. En C#, un <strong>délégué</strong> comme <code>Func&lt;decimal, decimal&gt;</code> est une stratégie toute prête : une variable qui contient une fonction. C'est exactement ce que tu fais en TypeScript quand tu passes une fonction en paramètre (<code>array.sort((a, b) =&gt; …)</code>).</p>
<p>D'ailleurs, LINQ est rempli de stratégies : le prédicat de <code>Where</code>, la clé de <code>OrderBy</code>, et les comparateurs. <code>IComparer&lt;T&gt;</code> et <code>IEqualityComparer&lt;T&gt;</code> sont des stratégies du framework : <code>StringComparer.OrdinalIgnoreCase</code> passé à un <code>Dictionary</code> change sa façon de comparer les clés, sans toucher à la classe <code>Dictionary</code>.</p>

<h3>Choisir la stratégie à l'exécution</h3>
<p>Le mode de livraison arrive dans la requête HTTP : il faut trouver la bonne stratégie à partir d'une chaîne. Trois solutions, de la plus simple à la plus intégrée :</p>
<table>
<tr><th>Solution</th><th>Comment</th><th>Quand</th></tr>
<tr><td>Dictionnaire</td><td><code>Dictionary&lt;string, IShippingStrategy&gt;</code></td><td>petit programme, pas de DI</td></tr>
<tr><td>Liste injectée</td><td><code>IEnumerable&lt;IShippingStrategy&gt;</code> + une propriété <code>Code</code> sur chaque stratégie</td><td>toutes versions de .NET</td></tr>
<tr><td>Keyed services (.NET 8+)</td><td><code>AddKeyedScoped&lt;IShippingStrategy, ExpressShipping&gt;("express")</code></td><td>la DI fait le choix par clé</td></tr>
</table>
<p>Le dictionnaire est parfait pour un petit programme ou un test. Dans une API, on préfère laisser le conteneur créer les stratégies : elles peuvent alors recevoir leurs propres dépendances (un client HTTP vers le transporteur, un <code>ILogger</code>, la configuration des tarifs) sans que le code appelant s'en occupe.</p>
<p>Avec les keyed services, un endpoint peut recevoir directement une stratégie précise grâce à l'attribut <code>[FromKeyedServices("express")]</code>, ou la chercher dynamiquement avec <code>GetRequiredKeyedService&lt;IShippingStrategy&gt;(mode)</code>.</p>
<div class="tip">Strategy ne remplace pas <em>tous</em> les switch. Un <code>switch</code> de trois lignes qui ne bouge jamais est parfait tel quel. Le signal pour passer à Strategy : le même switch dans plusieurs méthodes, ou des cas qui grossissent et changent souvent.</div>`,
  examples: [
    {
      title: "Des stratégies de livraison",
      code: `var strategies = new Dictionary<string, IShippingStrategy>
{
    ["standard"] = new StandardShipping(),
    ["express"] = new ExpressShipping(),
    ["pickup"] = new PickupShipping()
};

var calculator = new ShippingCalculator(strategies["standard"]);
Console.WriteLine($"standard : {calculator.Compute(weightKg: 3)} EUR");

calculator.Strategy = strategies["express"];   // on change à la volée
Console.WriteLine($"express : {calculator.Compute(3)} EUR");

calculator.Strategy = strategies["pickup"];
Console.WriteLine($"pickup : {calculator.Compute(3)} EUR");

interface IShippingStrategy { decimal Cost(int weightKg); }

class StandardShipping : IShippingStrategy { public decimal Cost(int weightKg) => 5 + weightKg; }
class ExpressShipping : IShippingStrategy { public decimal Cost(int weightKg) => 15 + weightKg * 2; }
class PickupShipping : IShippingStrategy { public decimal Cost(int weightKg) => 0; }

// Le contexte : il délègue le calcul à la stratégie courante
class ShippingCalculator(IShippingStrategy strategy)
{
    public IShippingStrategy Strategy { get; set; } = strategy;
    public decimal Compute(int weightKg) => Strategy.Cost(weightKg);
}`,
      output: `standard : 8 EUR
express : 21 EUR
pickup : 0 EUR`,
      steps: [
        "<code>interface IShippingStrategy</code> : le contrat commun. Une seule méthode, <code>Cost</code>.",
        "<code>class ExpressShipping : IShippingStrategy</code> : chaque mode de livraison est une petite classe indépendante, facile à tester.",
        "<code>class ShippingCalculator(...)</code> : le contexte. Il ne contient aucun <code>switch</code> : il appelle <code>Strategy.Cost</code>.",
        "<code>calculator.Strategy = strategies[\"express\"];</code> : on remplace l'algorithme pendant l'exécution, sans recréer le calculateur.",
        "<code>new Dictionary&lt;string, IShippingStrategy&gt;</code> : la table qui associe un code (venu d'une requête, par exemple) à sa stratégie."
      ],
      explain: "Ajouter le point relais : une classe de quatre lignes et une entrée dans le dictionnaire."
    },
    {
      title: "Des stratégies déjà dans .NET : comparateurs et délégués",
      code: `string[] products = ["clavier", "Souris", "Badge", "moniteur"];

// Stratégie de comparaison passée à Order
Console.WriteLine(string.Join(", ", products.Order(StringComparer.Ordinal)));
Console.WriteLine(string.Join(", ", products.Order(StringComparer.OrdinalIgnoreCase)));

// Le dictionnaire compare ses clés selon la stratégie reçue
var stock = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase) { ["Clavier"] = 4 };
Console.WriteLine($"Stock de CLAVIER : {stock["CLAVIER"]}");

// Une stratégie sous forme de délégué
Func<decimal, decimal> noDiscount = total => total;
Func<decimal, decimal> blackFriday = total => total * 80 / 100;
Console.WriteLine($"Normal : {Checkout(100m, noDiscount)}");
Console.WriteLine($"Black Friday : {Checkout(100m, blackFriday)}");

decimal Checkout(decimal total, Func<decimal, decimal> discount) => discount(total);`,
      output: `Badge, Souris, clavier, moniteur
Badge, clavier, moniteur, Souris
Stock de CLAVIER : 4
Normal : 100
Black Friday : 80`,
      steps: [
        "<code>products.Order(StringComparer.Ordinal)</code> : <code>Ordinal</code> compare les codes des caractères, donc les majuscules passent avant les minuscules.",
        "<code>StringComparer.OrdinalIgnoreCase</code> : même méthode <code>Order</code>, autre stratégie, autre résultat : la casse est ignorée.",
        "<code>new Dictionary&lt;string, int&gt;(StringComparer.OrdinalIgnoreCase)</code> : le dictionnaire délègue la comparaison des clés, d'où <code>stock[\"CLAVIER\"]</code> qui trouve <code>\"Clavier\"</code>.",
        "<code>Func&lt;decimal, decimal&gt; blackFriday = total =&gt; total * 80 / 100;</code> : une stratégie en une ligne, rangée dans une variable.",
        "<code>Checkout(100m, blackFriday)</code> : la méthode reçoit l'algorithme en paramètre, comme une interface à une seule méthode."
      ],
      explain: "Quand la stratégie tient en une fonction, un délégué suffit. Passe à une interface quand elle a plusieurs méthodes ou des dépendances."
    },
    {
      title: "Choisir la stratégie avec les keyed services",
      code: `// dotnet add package Microsoft.Extensions.DependencyInjection
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddKeyedSingleton<IShippingStrategy, StandardShipping>("standard");
services.AddKeyedSingleton<IShippingStrategy, ExpressShipping>("express");
using var provider = services.BuildServiceProvider();

foreach (var mode in new[] { "standard", "express" })
{
    var strategy = provider.GetRequiredKeyedService<IShippingStrategy>(mode);
    Console.WriteLine($"{mode} : {strategy.Cost(3)} EUR ({strategy.GetType().Name})");
}

try
{
    provider.GetRequiredKeyedService<IShippingStrategy>("drone");
}
catch (InvalidOperationException)
{
    Console.WriteLine("drone : mode de livraison inconnu");
}

interface IShippingStrategy { decimal Cost(int weightKg); }
class StandardShipping : IShippingStrategy { public decimal Cost(int weightKg) => 5 + weightKg; }
class ExpressShipping : IShippingStrategy { public decimal Cost(int weightKg) => 15 + weightKg * 2; }`,
      output: `standard : 8 EUR (StandardShipping)
express : 21 EUR (ExpressShipping)
drone : mode de livraison inconnu`,
      steps: [
        "<code>AddKeyedSingleton&lt;IShippingStrategy, StandardShipping&gt;(\"standard\")</code> : on enregistre plusieurs implémentations de la même interface, chacune avec une clé.",
        "<code>provider.GetRequiredKeyedService&lt;IShippingStrategy&gt;(mode)</code> : le conteneur trouve la stratégie correspondant à la clé.",
        "<code>strategy.GetType().Name</code> : on vérifie quelle classe a été choisie.",
        "<code>catch (InvalidOperationException)</code> : une clé inconnue lève une exception. Dans une API, tu la transformerais en réponse 400.",
        "Dans un endpoint, tu peux aussi écrire <code>[FromKeyedServices(\"express\")] IShippingStrategy strategy</code> en paramètre."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ajouter le point relais",
      prompt: `<p>Ajoute une stratégie <code>RelayShipping</code> au premier exemple : 3 € fixes plus 0,50 € par kg. Ajoute-la au dictionnaire et affiche le coût pour 4 kg (5 EUR attendus).</p>`,
      hint: `<p>Diviser par <code>2m</code> revient à multiplier par 0,5 : <code>3 + weightKg / 2m</code>. Le <code>m</code> force un calcul en <code>decimal</code>.</p>`,
      solution: `var strategies = new Dictionary<string, IShippingStrategy>
{
    ["standard"] = new StandardShipping(),
    ["relay"] = new RelayShipping()
};

var calculator = new ShippingCalculator(strategies["relay"]);
Console.WriteLine($"relay : {calculator.Compute(4)} EUR"); // relay : 5 EUR

interface IShippingStrategy { decimal Cost(int weightKg); }

class StandardShipping : IShippingStrategy { public decimal Cost(int weightKg) => 5 + weightKg; }
class RelayShipping : IShippingStrategy { public decimal Cost(int weightKg) => 3 + weightKg / 2m; }

class ShippingCalculator(IShippingStrategy strategy)
{
    public IShippingStrategy Strategy { get; set; } = strategy;
    public decimal Compute(int weightKg) => Strategy.Cost(weightKg);
}`
    },
    {
      level: "moyen",
      title: "Du switch à la Strategy",
      prompt: `<p>Voici une méthode à refactorer : <code>decimal Discount(string customerType, decimal total) =&gt; customerType switch { "vip" =&gt; total * 20 / 100, "pro" =&gt; total * 10 / 100, _ =&gt; 0 };</code>. Transforme-la en stratégies <code>IDiscountStrategy</code> (une classe par type) choisies via un dictionnaire, avec une stratégie par défaut <code>NoDiscount</code> si le type est inconnu. Teste « vip », « pro » et « autre » sur 200 €.</p>`,
      hint: `<p><code>strategies.GetValueOrDefault(type, new NoDiscount())</code> renvoie la stratégie par défaut quand la clé manque.</p>`,
      solution: `var strategies = new Dictionary<string, IDiscountStrategy>
{
    ["vip"] = new VipDiscount(),
    ["pro"] = new ProDiscount()
};

foreach (var type in new[] { "vip", "pro", "autre" })
{
    var strategy = strategies.GetValueOrDefault(type, new NoDiscount());
    Console.WriteLine($"{type} : remise de {strategy.Discount(200m)} EUR");
}
// vip : remise de 40 EUR
// pro : remise de 20 EUR
// autre : remise de 0 EUR

interface IDiscountStrategy { decimal Discount(decimal total); }

class VipDiscount : IDiscountStrategy { public decimal Discount(decimal total) => total * 20 / 100; }
class ProDiscount : IDiscountStrategy { public decimal Discount(decimal total) => total * 10 / 100; }
class NoDiscount : IDiscountStrategy { public decimal Discount(decimal total) => 0; }`
    },
    {
      level: "difficile",
      title: "Stratégies injectées avec un code",
      prompt: `<p>Sans keyed services : ajoute une propriété <code>string Code { get; }</code> à <code>IShippingStrategy</code>. Enregistre trois stratégies avec <code>AddSingleton&lt;IShippingStrategy, ...&gt;()</code>, puis écris un <code>ShippingService</code> qui reçoit <code>IEnumerable&lt;IShippingStrategy&gt;</code> et expose <code>decimal Quote(string mode, int weightKg)</code>. Il lève une <code>ArgumentException</code> si le mode est inconnu.</p>`,
      hint: `<p>Quand plusieurs classes sont enregistrées pour la même interface, demander <code>IEnumerable&lt;IShippingStrategy&gt;</code> les donne toutes. Construis un dictionnaire avec <code>ToDictionary(s =&gt; s.Code)</code>.</p>`,
      solution: `// dotnet add package Microsoft.Extensions.DependencyInjection
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddSingleton<IShippingStrategy, StandardShipping>();
services.AddSingleton<IShippingStrategy, ExpressShipping>();
services.AddSingleton<IShippingStrategy, PickupShipping>();
services.AddSingleton<ShippingService>();
using var provider = services.BuildServiceProvider();

var shipping = provider.GetRequiredService<ShippingService>();
Console.WriteLine(shipping.Quote("express", 3)); // 21
Console.WriteLine(shipping.Quote("pickup", 3));  // 0

interface IShippingStrategy
{
    string Code { get; }
    decimal Cost(int weightKg);
}

class StandardShipping : IShippingStrategy { public string Code => "standard"; public decimal Cost(int w) => 5 + w; }
class ExpressShipping : IShippingStrategy { public string Code => "express"; public decimal Cost(int w) => 15 + w * 2; }
class PickupShipping : IShippingStrategy { public string Code => "pickup"; public decimal Cost(int w) => 0; }

class ShippingService(IEnumerable<IShippingStrategy> strategies)
{
    private readonly Dictionary<string, IShippingStrategy> _byCode = strategies.ToDictionary(s => s.Code);

    public decimal Quote(string mode, int weightKg) =>
        _byCode.TryGetValue(mode, out var strategy)
            ? strategy.Cost(weightKg)
            : throw new ArgumentException($"Mode inconnu : {mode}", nameof(mode));
}`
    }
  ],
  quiz: [
    {
      q: `Quel signal doit te faire penser au pattern Strategy ?`,
      options: ["Une classe a plus de trois propriétés", "Le même switch sur un « mode » apparaît dans plusieurs méthodes et grossit à chaque évolution", "Une méthode est asynchrone"],
      answer: 1,
      why: `Strategy remplace un choix d'algorithme répété et changeant par des classes interchangeables. Un petit switch stable n'a pas besoin d'être transformé.`
    },
    {
      q: `Dans le pattern Strategy, que fait le « contexte » ?`,
      options: ["Il contient un switch sur toutes les stratégies", "Il hérite de toutes les stratégies", "Il garde une stratégie et lui délègue le travail"],
      answer: 2,
      why: `Le contexte (ici <code>ShippingCalculator</code>) ne connaît que l'interface. Il appelle la stratégie courante, qu'on peut remplacer à tout moment.`
    },
    {
      q: `<code>new Dictionary&lt;string, int&gt;(StringComparer.OrdinalIgnoreCase)</code> est un exemple de…`,
      options: ["Strategy : on passe au dictionnaire sa façon de comparer les clés", "Singleton", "Builder"],
      answer: 0,
      why: `<code>IEqualityComparer&lt;T&gt;</code> est une stratégie : le dictionnaire délègue la comparaison des clés à l'objet reçu, sans que sa propre classe change.`
    },
    {
      q: `Quelle méthode récupère une stratégie enregistrée avec <code>AddKeyedSingleton</code> à partir d'une clé connue à l'exécution ?`,
      options: ["<code>GetService&lt;T&gt;(key)</code>", "<code>GetRequiredKeyedService&lt;T&gt;(key)</code>", "<code>GetKeyed(key)</code>"],
      answer: 1,
      why: `Les keyed services (.NET 8+) ajoutent <code>GetKeyedService</code> et <code>GetRequiredKeyedService</code>. <code>GetService&lt;T&gt;</code> ne prend pas de clé, et <code>GetKeyed</code> n'existe pas.`
    }
  ],
  project: `<p><strong>OrderFlow : les frais de livraison en stratégies.</strong></p>
<ul>
<li>Ajoute un champ <code>ShippingMode</code> (<code>standard</code>, <code>express</code>, <code>pickup</code>) dans la requête de création de commande.</li>
<li>Crée <code>IShippingStrategy</code> avec <code>decimal Cost(Order order)</code> et <code>int EstimatedDays</code>, et une classe par mode. L'express devient gratuit si le total des <code>OrderLines</code> dépasse 100 €.</li>
<li>Enregistre-les avec <code>AddKeyedScoped&lt;IShippingStrategy, ExpressShipping&gt;("express")</code>… et récupère la bonne dans ton <code>CheckoutService</code> avec <code>IServiceProvider.GetRequiredKeyedService</code>. Un mode inconnu renvoie un 400 avec un ProblemDetails.</li>
<li>Ajoute un endpoint <code>GET /api/shipping/quote?mode=express&amp;orderId=1</code> qui renvoie le coût et le délai.</li>
</ul>`,
  resources: [
    { label: "Keyed services dans l'injection de dépendances (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/dependency-injection#keyed-services" },
    { label: "Interface IComparer<T> (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/system.collections.generic.icomparer-1" }
  ]
});

// =====================================================================
// 7. Observer : prévenir ceux qui écoutent (events, IObservable)
// =====================================================================
window.COURSE.push({
  key: "pat-observer",
  title: "Observer : prévenir ceux qui écoutent (events, IObservable)",
  summary: "Tu sauras faire réagir plusieurs parties du programme à un changement, sans que l'émetteur les connaisse, avec les events C# et IObservable<T>.",
  objectives: [
    "Expliquer le couple sujet / abonnés du pattern Observer",
    "Déclarer, déclencher et écouter un event C# avec EventHandler<T>",
    "Se désabonner pour éviter les fuites mémoire",
    "Implémenter IObservable<T> et faire le lien avec RxJS"
  ],
  analogy: `<p>Quand tu t'<strong>abonnes à une chaîne YouTube</strong>, tu n'appelles pas la chaîne tous les jours pour demander « une nouvelle vidéo ? ». C'est la chaîne qui prévient tous ses abonnés quand elle publie. Elle ne sait pas qui ils sont ni ce qu'ils feront de la notification.</p>
<p>Et si tu te désabonnes, tu ne reçois plus rien. Voilà tout le pattern <strong>Observer</strong>.</p>`,
  lesson: `<h3>Le problème : un service qui connaît tout le monde</h3>
<p>Quand une commande OrderFlow est payée, il faut envoyer un mail, mettre à jour les statistiques, prévenir l'entrepôt. Le réflexe : appeler ces trois services à la fin de <code>OrderService.Pay</code>. Résultat, <code>OrderService</code> dépend du mail, des stats et de l'entrepôt. Chaque nouvelle réaction (un webhook, un SMS) oblige à le modifier, alors que le paiement lui-même n'a pas changé.</p>

<h3>La solution : s'abonner</h3>
<p>Le pattern <strong>Observer</strong> inverse la relation. Le <strong>sujet</strong> (<code>OrderService</code>) annonce simplement « une commande a été payée ». Les <strong>observateurs</strong> (ou abonnés) se sont inscrits à l'avance et réagissent. Le sujet ne connaît ni leur nombre ni leur type.</p>
<pre class="diagram">
                      +--&gt; Mailer       (mail)
  OrderService        |
  OrderPaid ----------+--&gt; StockUpdater (entrepôt)
  (le sujet)          |
                      +--&gt; Stats        (tableau de bord)
</pre>
<p>Tu connais très bien ce pattern : c'est le cœur de <strong>RxJS</strong>. Un <code>Subject</code> émet avec <code>next()</code>, les composants font <code>subscribe()</code>, et un <code>@Output()</code> avec <code>EventEmitter</code> est un sujet auquel le parent s'abonne.</p>

<h3>En C# : les events</h3>
<p>C# intègre Observer dans le langage avec le mot-clé <code>event</code>. Trois gestes à connaître :</p>
<table>
<tr><th>Geste</th><th>Code</th><th>Équivalent RxJS</th></tr>
<tr><td>Déclarer</td><td><code>public event EventHandler&lt;OrderPaidEventArgs&gt;? OrderPaid;</code></td><td><code>new Subject&lt;T&gt;()</code></td></tr>
<tr><td>S'abonner / se désabonner</td><td><code>service.OrderPaid += handler;</code> / <code>-= handler;</code></td><td><code>subscribe()</code> / <code>unsubscribe()</code></td></tr>
<tr><td>Déclencher</td><td><code>OrderPaid?.Invoke(this, args);</code></td><td><code>subject.next(value)</code></td></tr>
</table>
<p><code>EventHandler&lt;T&gt;</code> est le type de délégué standard : la méthode abonnée reçoit l'émetteur (<code>object? sender</code>) et les données (<code>T e</code>). Le <code>?.</code> est important : s'il n'y a aucun abonné, l'event vaut <code>null</code>, et on ne déclenche rien. Le mot-clé <code>event</code> protège aussi le sujet : de l'extérieur, on peut seulement faire <code>+=</code> et <code>-=</code>, jamais déclencher l'event ni effacer les abonnés.</p>

<h3>Le piège : oublier de se désabonner</h3>
<p>Quand un objet s'abonne, le sujet garde une référence vers lui. Tant que le sujet vit, l'abonné ne peut pas être libéré par le garbage collector, même si plus personne ne l'utilise. Si le sujet est un singleton, c'est une <strong>fuite mémoire</strong>. C'est exactement le même problème qu'un <code>subscribe()</code> sans <code>unsubscribe()</code> dans un composant Angular.</p>
<div class="tip">Pour pouvoir te désabonner, garde le gestionnaire dans une variable. <code>OrderPaid -= (s, e) =&gt; …</code> avec une nouvelle lambda ne retire rien : c'est un autre objet que celui qui a été ajouté.</div>

<h3>IObservable&lt;T&gt; : le contrat du framework</h3>
<p>.NET fournit aussi deux interfaces : <code>IObservable&lt;T&gt;</code> (le sujet, avec <code>Subscribe</code>) et <code>IObserver&lt;T&gt;</code> (l'abonné, avec <code>OnNext</code>, <code>OnError</code>, <code>OnCompleted</code>). Ce sont les mêmes trois notifications que RxJS (<code>next</code>, <code>error</code>, <code>complete</code>). <code>Subscribe</code> renvoie un <code>IDisposable</code> : appeler <code>Dispose()</code>, ou utiliser <code>using</code>, désabonne. La bibliothèque <strong>Rx.NET</strong> (package <code>System.Reactive</code>) ajoute les opérateurs que tu connais : <code>Where</code>, <code>Select</code>, <code>Throttle</code>…</p>

<h3>Où le croiser dans .NET</h3>
<p><code>INotifyPropertyChanged</code> (les écrans WPF et MAUI se mettent à jour quand une propriété change), <code>IOptionsMonitor&lt;T&gt;.OnChange</code> (réagir quand <code>appsettings.json</code> est modifié), <code>CancellationToken.Register</code> (être prévenu d'une annulation), et tous les événements des contrôles d'interface (<code>Click</code>).</p>
<div class="note">Les events C# sont <strong>synchrones</strong> : les abonnés s'exécutent l'un après l'autre, dans le thread de l'émetteur, et une exception dans l'un empêche les suivants de s'exécuter. Ils sont parfaits à l'intérieur d'un processus. Pour prévenir d'autres services (entrepôt, facturation) de façon fiable, on passe à des <strong>événements de domaine</strong> publiés dans une file de messages : on le verra dans la partie production.</div>`,
  examples: [
    {
      title: "Un event OrderPaid et trois abonnés",
      code: `var service = new OrderService();
var mailer = new Mailer();

service.OrderPaid += mailer.OnOrderPaid;     // abonnement d'une méthode
service.OrderPaid += (sender, e) => Console.WriteLine($"Stats : +{e.Amount} EUR");

service.Pay(42, 120m);

class OrderPaidEventArgs(int orderId, decimal amount) : EventArgs
{
    public int OrderId { get; } = orderId;
    public decimal Amount { get; } = amount;
}

// Le sujet : il ne connaît aucun de ses abonnés
class OrderService
{
    public event EventHandler<OrderPaidEventArgs>? OrderPaid;

    public void Pay(int orderId, decimal amount)
    {
        Console.WriteLine($"Commande {orderId} payée");
        OrderPaid?.Invoke(this, new OrderPaidEventArgs(orderId, amount));
    }
}

class Mailer
{
    public void OnOrderPaid(object? sender, OrderPaidEventArgs e) =>
        Console.WriteLine($"Mail : merci pour la commande {e.OrderId}");
}`,
      output: `Commande 42 payée
Mail : merci pour la commande 42
Stats : +120 EUR`,
      steps: [
        "<code>class OrderPaidEventArgs : EventArgs</code> : les données qui accompagnent la notification. Par convention, le nom finit par <code>EventArgs</code>.",
        "<code>public event EventHandler&lt;OrderPaidEventArgs&gt;? OrderPaid;</code> : le sujet déclare l'event. Le <code>?</code> rappelle qu'il vaut <code>null</code> sans abonné.",
        "<code>service.OrderPaid += mailer.OnOrderPaid;</code> : on abonne une méthode dont la signature correspond (<code>object? sender, OrderPaidEventArgs e</code>).",
        "<code>service.OrderPaid += (sender, e) =&gt; ...</code> : on peut aussi abonner une lambda.",
        "<code>OrderPaid?.Invoke(this, ...)</code> : déclenche l'event. Les abonnés sont appelés dans l'ordre d'inscription."
      ],
      explain: "OrderService n'a aucune référence vers Mailer : ajouter un abonné ne le modifie pas."
    },
    {
      title: "Se désabonner",
      code: `var button = new BuyButton();

EventHandler handlerA = (s, e) => Console.WriteLine("Abonné A notifié");
button.Clicked += handlerA;
button.Clicked += (s, e) => Console.WriteLine("Abonné B notifié");

button.Click();

button.Clicked -= handlerA;                                       // retire bien A
button.Clicked -= (s, e) => Console.WriteLine("Abonné B notifié"); // ne retire rien !
Console.WriteLine("--- après les -= ---");
button.Click();

class BuyButton
{
    public event EventHandler? Clicked;
    public void Click() => Clicked?.Invoke(this, EventArgs.Empty);
}`,
      output: `Abonné A notifié
Abonné B notifié
--- après les -= ---
Abonné B notifié`,
      steps: [
        "<code>EventHandler handlerA = ...</code> : on garde le gestionnaire dans une variable pour pouvoir le retirer plus tard.",
        "<code>public event EventHandler? Clicked;</code> : <code>EventHandler</code> sans type générique, quand il n'y a pas de données à transmettre.",
        "<code>Clicked?.Invoke(this, EventArgs.Empty)</code> : <code>EventArgs.Empty</code> signifie « aucune donnée ».",
        "<code>button.Clicked -= handlerA;</code> : on retire exactement l'objet qu'on avait ajouté. A n'est plus prévenu.",
        "<code>button.Clicked -= (s, e) =&gt; ...</code> : une nouvelle lambda est un nouvel objet, même si son code est identique. B reste abonné."
      ],
      explain: "Un objet qui vit moins longtemps que le sujet doit se désabonner, sinon il reste en mémoire."
    },
    {
      title: "IObservable<T> et IObserver<T>",
      code: `var tracker = new OrderStatusTracker();
var dashboard = tracker.Subscribe(new ConsoleObserver("Dashboard"));
tracker.Subscribe(new ConsoleObserver("Mobile"));

tracker.Publish("Paid");
dashboard.Dispose();          // le dashboard se désabonne
tracker.Publish("Shipped");
tracker.Complete();

class ConsoleObserver(string name) : IObserver<string>
{
    public void OnNext(string value) => Console.WriteLine($"{name} reçoit : {value}");
    public void OnError(Exception error) => Console.WriteLine($"{name} erreur : {error.Message}");
    public void OnCompleted() => Console.WriteLine($"{name} : terminé");
}

class OrderStatusTracker : IObservable<string>
{
    private readonly List<IObserver<string>> _observers = [];

    public IDisposable Subscribe(IObserver<string> observer)
    {
        _observers.Add(observer);
        return new Unsubscriber(() => _observers.Remove(observer));
    }

    public void Publish(string status) { foreach (var o in _observers.ToList()) o.OnNext(status); }
    public void Complete() { foreach (var o in _observers.ToList()) o.OnCompleted(); }

    private sealed class Unsubscriber(Action unsubscribe) : IDisposable
    {
        public void Dispose() => unsubscribe();
    }
}`,
      output: `Dashboard reçoit : Paid
Mobile reçoit : Paid
Mobile reçoit : Shipped
Mobile : terminé`,
      steps: [
        "<code>class ConsoleObserver : IObserver&lt;string&gt;</code> : l'abonné implémente les trois notifications, comme un objet <code>{ next, error, complete }</code> en RxJS.",
        "<code>public IDisposable Subscribe(IObserver&lt;string&gt; observer)</code> : le sujet enregistre l'abonné et renvoie de quoi le désabonner.",
        "<code>new Unsubscriber(() =&gt; _observers.Remove(observer))</code> : un petit objet dont <code>Dispose()</code> retire l'abonné de la liste.",
        "<code>foreach (var o in _observers.ToList())</code> : on parcourt une copie, pour qu'un abonné puisse se désabonner pendant la notification sans casser la boucle.",
        "<code>dashboard.Dispose();</code> : l'équivalent de <code>subscription.unsubscribe()</code>. Le dashboard ne reçoit plus <code>Shipped</code>."
      ],
      explain: "Avec Rx.NET (System.Reactive), un <code>Subject&lt;T&gt;</code> fait tout ce travail pour toi et ajoute les opérateurs LINQ."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un event StockLow",
      prompt: `<p>Écris une classe <code>Product</code> avec <code>Name</code>, <code>Stock</code> et une méthode <code>Remove(int qty)</code>. Quand le stock passe sous 3, elle déclenche un event <code>StockLow</code> (<code>EventHandler</code> sans données). Abonne une lambda qui affiche « Réapprovisionner : » suivi du nom du produit.</p>`,
      hint: `<p>Dans la lambda, <code>sender</code> est le produit : <code>((Product)sender!).Name</code>.</p>`,
      solution: `var keyboard = new Product { Name = "Clavier", Stock = 5 };
keyboard.StockLow += (sender, e) => Console.WriteLine($"Réapprovisionner : {((Product)sender!).Name}");

keyboard.Remove(1); // stock 4 : rien
keyboard.Remove(2); // stock 2 : Réapprovisionner : Clavier

class Product
{
    public string Name { get; set; } = "";
    public int Stock { get; set; }

    public event EventHandler? StockLow;

    public void Remove(int qty)
    {
        Stock -= qty;
        if (Stock < 3)
            StockLow?.Invoke(this, EventArgs.Empty);
    }
}`
    },
    {
      level: "moyen",
      title: "Un statut qui change",
      prompt: `<p>Écris une classe <code>Order</code> avec une propriété <code>Status</code> (enum <code>OrderStatus</code> : Pending, Paid, Shipped, Cancelled) et un event <code>StatusChanged</code> de type <code>EventHandler&lt;StatusChangedEventArgs&gt;</code> qui transporte l'ancien et le nouveau statut. L'event ne doit être déclenché que si le statut change vraiment.</p>`,
      hint: `<p>Écris la propriété avec un champ privé : dans le <code>set</code>, compare avant d'affecter, puis déclenche l'event.</p>`,
      solution: `var order = new Order();
order.StatusChanged += (s, e) => Console.WriteLine($"{e.OldStatus} -> {e.NewStatus}");

order.Status = OrderStatus.Paid;     // Pending -> Paid
order.Status = OrderStatus.Paid;     // rien : pas de changement
order.Status = OrderStatus.Shipped;  // Paid -> Shipped

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

class StatusChangedEventArgs(OrderStatus oldStatus, OrderStatus newStatus) : EventArgs
{
    public OrderStatus OldStatus { get; } = oldStatus;
    public OrderStatus NewStatus { get; } = newStatus;
}

class Order
{
    private OrderStatus _status = OrderStatus.Pending;

    public event EventHandler<StatusChangedEventArgs>? StatusChanged;

    public OrderStatus Status
    {
        get => _status;
        set
        {
            if (value == _status) return;
            var old = _status;
            _status = value;
            StatusChanged?.Invoke(this, new StatusChangedEventArgs(old, value));
        }
    }
}`
    },
    {
      level: "difficile",
      title: "Un abonné qui se désabonne tout seul",
      prompt: `<p>Avec le <code>OrderStatusTracker</code> du troisième exemple, écris un observateur <code>FirstShipmentObserver</code> qui affiche le premier statut <code>"Shipped"</code> reçu puis se désabonne lui-même. Il reçoit l'<code>IDisposable</code> de son abonnement par une méthode <code>Attach(IDisposable subscription)</code>. Publie Paid, Shipped, Shipped et vérifie qu'il n'affiche qu'une fois.</p>`,
      hint: `<p>Dans <code>OnNext</code>, si la valeur vaut <code>"Shipped"</code>, affiche-la puis appelle <code>_subscription?.Dispose()</code>. La copie <code>ToList()</code> du tracker rend ce désabonnement sûr.</p>`,
      solution: `var tracker = new OrderStatusTracker();
var observer = new FirstShipmentObserver();
observer.Attach(tracker.Subscribe(observer));

tracker.Publish("Paid");
tracker.Publish("Shipped");
tracker.Publish("Shipped");
// Première expédition reçue : Shipped (une seule fois)

class FirstShipmentObserver : IObserver<string>
{
    private IDisposable? _subscription;

    public void Attach(IDisposable subscription) => _subscription = subscription;

    public void OnNext(string value)
    {
        if (value != "Shipped") return;
        Console.WriteLine($"Première expédition reçue : {value}");
        _subscription?.Dispose();
    }

    public void OnError(Exception error) { }
    public void OnCompleted() { }
}

class OrderStatusTracker : IObservable<string>
{
    private readonly List<IObserver<string>> _observers = [];

    public IDisposable Subscribe(IObserver<string> observer)
    {
        _observers.Add(observer);
        return new Unsubscriber(() => _observers.Remove(observer));
    }

    public void Publish(string status) { foreach (var o in _observers.ToList()) o.OnNext(status); }

    private sealed class Unsubscriber(Action unsubscribe) : IDisposable
    {
        public void Dispose() => unsubscribe();
    }
}`
    }
  ],
  quiz: [
    {
      q: `Dans le pattern Observer, que sait le sujet de ses abonnés ?`,
      options: ["Leur classe exacte, pour les appeler", "Rien de précis : il notifie une liste d'abonnés qui se sont inscrits", "Il les crée lui-même dans son constructeur"],
      answer: 1,
      why: `C'est tout l'intérêt : le sujet ne dépend pas de ses abonnés. On peut en ajouter sans modifier le sujet.`
    },
    {
      q: `Pourquoi écrire <code>OrderPaid?.Invoke(...)</code> plutôt que <code>OrderPaid.Invoke(...)</code> ?`,
      options: ["Pour exécuter les abonnés en parallèle", "C'est la même chose", "Parce que l'event vaut <code>null</code> quand personne n'est abonné"],
      answer: 2,
      why: `Sans abonné, l'event est <code>null</code> : <code>Invoke</code> sans <code>?.</code> lèverait une <code>NullReferenceException</code>. Les abonnés sont toujours appelés l'un après l'autre, jamais en parallèle.`
    },
    {
      q: `<code>button.Clicked -= (s, e) =&gt; Console.WriteLine("B");</code> retire-t-il un abonné ajouté avec la même lambda ?`,
      options: ["Non, une nouvelle lambda est un autre objet", "Oui, le code est identique", "Oui, mais seulement en mode Release"],
      answer: 0,
      why: `Le désabonnement compare les délégués. Une nouvelle lambda crée un nouveau délégué : rien n'est retiré. Il faut garder le gestionnaire dans une variable.`
    },
    {
      q: `Que renvoie <code>IObservable&lt;T&gt;.Subscribe</code> ?`,
      options: ["Un <code>bool</code> indiquant le succès", "Un <code>IDisposable</code> qui sert à se désabonner", "La valeur courante"],
      answer: 1,
      why: `Comme la <code>Subscription</code> de RxJS, l'<code>IDisposable</code> représente l'abonnement : <code>Dispose()</code> désabonne. On peut donc l'utiliser avec <code>using</code>.`
    }
  ],
  project: `<p><strong>OrderFlow : réagir au paiement.</strong></p>
<ul>
<li>Dans ton <code>CheckoutService</code>, déclare <code>public event EventHandler&lt;OrderPaidEventArgs&gt;? OrderPaid;</code> et déclenche-le après le <code>SaveChangesAsync</code> qui passe la commande en <code>Paid</code>.</li>
<li>Ajoute deux abonnés : un <code>OrderPaidLogger</code> qui écrit dans <code>ILogger</code>, et un <code>SalesCounter</code> singleton qui tient le chiffre d'affaires du jour (avec <code>Interlocked</code> ou un <code>lock</code>).</li>
<li>Expose <code>GET /api/stats/today</code> qui renvoie ce chiffre d'affaires.</li>
<li>Note dans <code>docs/patterns.md</code> la limite de cette approche : si le serveur redémarre, le compteur repart à zéro, et un abonné qui lève une exception bloque les suivants. On la remplacera par des événements de domaine dans la partie production.</li>
</ul>`,
  resources: [
    { label: "Gérer et déclencher des événements (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/events/" },
    { label: "Modèle de conception Observateur (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/events/observer-design-pattern" }
  ]
});

// =====================================================================
// 8. Command et Chain of Responsibility
// =====================================================================
window.COURSE.push({
  key: "pat-command-chain",
  title: "Command et Chain of Responsibility",
  summary: "Tu sauras transformer une action en objet (pour l'annuler, la rejouer ou la mettre en file) et faire passer une requête dans une chaîne de maillons, comme le pipeline de middlewares d'ASP.NET Core.",
  objectives: [
    "Encapsuler une action dans un objet Command avec Execute et Undo",
    "Comprendre le lien entre Command et les commandes CQRS",
    "Construire une chaîne de responsabilité où chaque maillon traite ou transmet",
    "Reconnaître la chaîne dans les middlewares, les DelegatingHandler et les intercepteurs Angular"
  ],
  analogy: `<p>Au restaurant, le serveur ne cuisine pas : il écrit ta <strong>commande sur un ticket</strong> et l'accroche en cuisine. Le ticket peut attendre, être annulé, être refait. L'action « préparer un steak frites » est devenue un objet. C'est le pattern <strong>Command</strong>.</p>
<p>Quand tu appelles un <strong>service client</strong>, le standard filtre, puis le conseiller de niveau 1 essaie de répondre ; s'il ne peut pas, il passe au niveau 2, puis à l'expert. Chacun traite ou transmet. C'est la <strong>Chaîne de responsabilité</strong>.</p>`,
  lesson: `<h3>Command : le problème</h3>
<p>Dans un panier, l'utilisateur ajoute et retire des produits, et veut pouvoir <strong>annuler</strong> sa dernière action. Si les actions sont de simples appels de méthode (<code>cart.Add(...)</code>), il n'en reste aucune trace : impossible de savoir quoi défaire. Même problème pour mettre des actions en <strong>file d'attente</strong>, les <strong>rejouer</strong> ou les <strong>journaliser</strong>.</p>

<h3>Command : la solution</h3>
<p>Le pattern <strong>Command</strong> transforme une action en objet. Cet objet contient tout ce qu'il faut pour l'exécuter (le panier, le produit) et expose une méthode <code>Execute()</code>, souvent accompagnée de <code>Undo()</code>. Comme c'est un objet, on peut le ranger dans une pile d'historique, une file, une base de données.</p>
<div class="flow"><span>Créer la commande</span><span>Execute()</span><span>Empiler dans l'historique</span><span>Pop() puis Undo()</span></div>
<p>Dans une API moderne, tu retrouves l'idée sous le nom <strong>CQRS</strong> (séparer les commandes, qui modifient, des requêtes, qui lisent). Une requête HTTP <code>POST /api/orders</code> devient un <code>record CreateOrderCommand(int CustomerId, ...)</code> traité par un <code>CreateOrderHandler</code>. La commande est une donnée simple et sérialisable ; le handler contient la logique. Des bibliothèques comme MediatR organisent ce découpage, mais un simple handler injecté suffit très bien. Et en WPF ou MAUI, les boutons sont reliés à des objets <code>ICommand</code>.</p>

<h3>Chain of Responsibility : le problème</h3>
<p>Avant de créer une commande, OrderFlow doit vérifier : le client existe, le stock suffit, le montant ne dépasse pas le plafond. Un seul gros bloc de <code>if</code> mélange toutes ces règles, et ajouter une vérification (fraude, pays interdit) oblige à rouvrir ce bloc. On veut plutôt des vérifications indépendantes, qu'on peut ajouter, retirer ou réordonner.</p>

<h3>Chain of Responsibility : la solution</h3>
<p>On crée une <strong>chaîne de maillons</strong> (handlers). Chaque maillon reçoit la requête et décide : soit il la <strong>traite et arrête</strong> la chaîne (on dit qu'il <em>court-circuite</em>), soit il la <strong>passe au suivant</strong>. Celui qui envoie la requête ne parle qu'au premier maillon.</p>
<pre class="diagram">
  requête
    |
    v
 [ CustomerCheck ] --refus--&gt; "client inconnu"
    | ok
    v
 [ StockCheck    ] --refus--&gt; "stock insuffisant"
    | ok
    v
 [ AmountCheck   ] --refus--&gt; "montant trop élevé"
    | ok
    v
  "commande acceptée"
</pre>

<h3>Tu l'utilises déjà : le pipeline de middlewares</h3>
<p>Le pipeline d'ASP.NET Core <em>est</em> une chaîne de responsabilité. Chaque <code>app.Use(async (context, next) =&gt; { ...; await next(context); })</code> est un maillon : il peut agir avant, appeler <code>next</code>, puis agir après. <code>UseAuthentication</code>, <code>UseAuthorization</code>, <code>UseExceptionHandler</code> sont des maillons fournis. Un middleware qui renvoie 401 sans appeler <code>next</code> court-circuite la chaîne : le contrôleur n'est jamais atteint.</p>
<div class="compare"><div><h4>Angular</h4><p><code>intercept(req, next)</code> puis <code>next.handle(req)</code>. Les intercepteurs s'enchaînent sur les requêtes sortantes du navigateur.</p></div><div><h4>ASP.NET Core</h4><p><code>app.Use((context, next) =&gt; ...)</code> puis <code>next(context)</code>. Les middlewares s'enchaînent sur les requêtes entrantes du serveur.</p></div></div>
<p>Les <code>DelegatingHandler</code> de <code>HttpClient</code>, vus avec le Decorator, forment eux aussi une chaîne. La frontière entre les deux patterns est fine : un décorateur appelle <em>toujours</em> l'objet intérieur, un maillon de chaîne peut <em>décider de s'arrêter</em>.</p>
<div class="tip">Dans une chaîne, l'ordre est une règle métier. Dans ASP.NET Core, <code>UseAuthentication()</code> doit venir avant <code>UseAuthorization()</code> : sinon l'autorisation ne sait pas encore qui est l'utilisateur.</div>`,
  examples: [
    {
      title: "Des commandes annulables",
      code: `var cart = new Cart();
var history = new Stack<ICommand>();

Run(new AddItemCommand(cart, "Clavier"));
Run(new AddItemCommand(cart, "Souris"));
Run(new AddItemCommand(cart, "Écran"));
Console.WriteLine($"Panier : {string.Join(", ", cart.Items)}");

history.Pop().Undo();   // annule « Écran »
history.Pop().Undo();   // annule « Souris »
Console.WriteLine($"Après deux annulations : {string.Join(", ", cart.Items)}");
Console.WriteLine($"Actions restantes dans l'historique : {history.Count}");

void Run(ICommand command)
{
    command.Execute();
    history.Push(command);
}

interface ICommand
{
    void Execute();
    void Undo();
}

class Cart { public List<string> Items { get; } = []; }

// Une action devenue objet : on peut la stocker, la rejouer, l'annuler
class AddItemCommand(Cart cart, string item) : ICommand
{
    public void Execute() => cart.Items.Add(item);
    public void Undo() => cart.Items.Remove(item);
}`,
      output: `Panier : Clavier, Souris, Écran
Après deux annulations : Clavier
Actions restantes dans l'historique : 1`,
      steps: [
        "<code>interface ICommand</code> : toute action sait s'exécuter et s'annuler.",
        "<code>class AddItemCommand(Cart cart, string item)</code> : la commande garde tout ce dont elle a besoin (le panier et le produit) pour agir plus tard.",
        "<code>var history = new Stack&lt;ICommand&gt;();</code> : une pile, car on annule toujours la dernière action en premier.",
        "<code>void Run(ICommand command)</code> : exécute la commande puis la range dans l'historique.",
        "<code>history.Pop().Undo();</code> : on retire la dernière commande de la pile et on l'annule. Deux fois : Écran puis Souris disparaissent."
      ],
      explain: "Ctrl+Z dans un éditeur fonctionne exactement comme ça."
    },
    {
      title: "Une chaîne de vérifications",
      code: `var chain = new CustomerCheck();
chain.SetNext(new StockCheck()).SetNext(new AmountCheck());

Console.WriteLine(chain.Handle(new OrderRequest(7, 2, 100)));
Console.WriteLine(chain.Handle(new OrderRequest(0, 2, 100)));
Console.WriteLine(chain.Handle(new OrderRequest(7, 50, 100)));
Console.WriteLine(chain.Handle(new OrderRequest(7, 2, 20000)));

record OrderRequest(int CustomerId, int Quantity, decimal Amount);

abstract class Handler
{
    private Handler? _next;

    public Handler SetNext(Handler next) { _next = next; return next; }

    // Par défaut : on passe au maillon suivant, ou on accepte en bout de chaîne
    public virtual string Handle(OrderRequest r) => _next?.Handle(r) ?? "OK : commande acceptée";
}

class CustomerCheck : Handler
{
    public override string Handle(OrderRequest r) =>
        r.CustomerId <= 0 ? "Refus : client inconnu" : base.Handle(r);
}

class StockCheck : Handler
{
    public override string Handle(OrderRequest r) =>
        r.Quantity > 10 ? "Refus : stock insuffisant" : base.Handle(r);
}

class AmountCheck : Handler
{
    public override string Handle(OrderRequest r) =>
        r.Amount > 10000 ? "Refus : montant à valider par un humain" : base.Handle(r);
}`,
      output: `OK : commande acceptée
Refus : client inconnu
Refus : stock insuffisant
Refus : montant à valider par un humain`,
      steps: [
        "<code>abstract class Handler</code> : la classe de base garde une référence vers le maillon suivant (<code>_next</code>).",
        "<code>SetNext(...)</code> renvoie le maillon ajouté : on peut donc enchaîner <code>.SetNext(a).SetNext(b)</code> pour construire la chaîne.",
        "<code>_next?.Handle(r) ?? \"OK : commande acceptée\"</code> : passer au suivant ; s'il n'y en a plus, toutes les vérifications sont passées.",
        "<code>r.CustomerId &lt;= 0 ? \"Refus : ...\" : base.Handle(r)</code> : chaque maillon traite son cas (et court-circuite), sinon il délègue à la classe de base, donc au suivant.",
        "Ajouter une vérification de fraude = une classe de plus, insérée où on veut dans la chaîne."
      ]
    },
    {
      title: "Un mini pipeline de middlewares",
      code: `// Chaque middleware reçoit la requête et « next », la suite de la chaîne
var middlewares = new List<Action<string, Action>>
{
    (path, next) =>
    {
        Console.WriteLine($"[Log] début {path}");
        next();
        Console.WriteLine($"[Log] fin {path}");
    },
    (path, next) =>
    {
        if (path.StartsWith("/admin")) { Console.WriteLine("[Auth] 403 Forbidden"); return; } // court-circuit
        next();
    }
};

Action<string> endpoint = path => Console.WriteLine($"[Endpoint] 200 OK pour {path}");

// On assemble la chaîne en partant de la fin, comme ASP.NET Core
Action<string> app = endpoint;
for (int i = middlewares.Count - 1; i >= 0; i--)
{
    var middleware = middlewares[i];
    var next = app;
    app = path => middleware(path, () => next(path));
}

app("/api/orders");
app("/admin/users");`,
      output: `[Log] début /api/orders
[Endpoint] 200 OK pour /api/orders
[Log] fin /api/orders
[Log] début /admin/users
[Auth] 403 Forbidden
[Log] fin /admin/users`,
      steps: [
        "<code>List&lt;Action&lt;string, Action&gt;&gt;</code> : chaque middleware est une fonction qui reçoit le chemin et <code>next</code>, la fonction qui appelle la suite.",
        "<code>next();</code> entouré de deux <code>Console.WriteLine</code> : le middleware de log agit avant et après le reste de la chaîne.",
        "<code>if (path.StartsWith(\"/admin\")) { ...; return; }</code> : le middleware d'autorisation n'appelle pas <code>next</code>. L'endpoint n'est jamais atteint.",
        "<code>for (int i = middlewares.Count - 1; i &gt;= 0; i--)</code> : on part de l'endpoint et on enveloppe chaque middleware autour du précédent, du dernier au premier.",
        "<code>var next = app;</code> : on capture la chaîne déjà construite dans une variable locale avant de remplacer <code>app</code>.",
        "Pour <code>/admin/users</code>, le log de fin s'affiche quand même : le court-circuit ne fait que remonter la chaîne."
      ],
      explain: "C'est, en 25 lignes, le mécanisme réel de app.Use dans ASP.NET Core."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une commande de retrait",
      prompt: `<p>Dans le premier exemple, ajoute une <code>RemoveItemCommand</code> qui retire un produit du panier et le remet dans <code>Undo()</code>. Ajoute Clavier et Souris, retire Souris, puis annule le retrait : Souris doit revenir.</p>`,
      hint: `<p><code>Execute</code> fait <code>Remove</code>, <code>Undo</code> fait <code>Add</code> : l'inverse de <code>AddItemCommand</code>.</p>`,
      solution: `var cart = new Cart();
var history = new Stack<ICommand>();

Run(new AddItemCommand(cart, "Clavier"));
Run(new AddItemCommand(cart, "Souris"));
Run(new RemoveItemCommand(cart, "Souris"));
Console.WriteLine(string.Join(", ", cart.Items)); // Clavier

history.Pop().Undo();
Console.WriteLine(string.Join(", ", cart.Items)); // Clavier, Souris

void Run(ICommand command)
{
    command.Execute();
    history.Push(command);
}

interface ICommand { void Execute(); void Undo(); }

class Cart { public List<string> Items { get; } = []; }

class AddItemCommand(Cart cart, string item) : ICommand
{
    public void Execute() => cart.Items.Add(item);
    public void Undo() => cart.Items.Remove(item);
}

class RemoveItemCommand(Cart cart, string item) : ICommand
{
    public void Execute() => cart.Items.Remove(item);
    public void Undo() => cart.Items.Add(item);
}`
    },
    {
      level: "moyen",
      title: "Un maillon anti-fraude",
      prompt: `<p>Ajoute à la chaîne du deuxième exemple un maillon <code>FraudCheck</code> qui refuse les commandes de plus de 5 articles pour un client dont l'id est 13 (« Refus : suspicion de fraude »). Place-le entre <code>CustomerCheck</code> et <code>StockCheck</code> et teste-le.</p>`,
      hint: `<p><code>chain.SetNext(new FraudCheck()).SetNext(new StockCheck()).SetNext(new AmountCheck());</code></p>`,
      solution: `var chain = new CustomerCheck();
chain.SetNext(new FraudCheck()).SetNext(new StockCheck()).SetNext(new AmountCheck());

Console.WriteLine(chain.Handle(new OrderRequest(13, 6, 100))); // Refus : suspicion de fraude
Console.WriteLine(chain.Handle(new OrderRequest(13, 2, 100))); // OK : commande acceptée

record OrderRequest(int CustomerId, int Quantity, decimal Amount);

abstract class Handler
{
    private Handler? _next;
    public Handler SetNext(Handler next) { _next = next; return next; }
    public virtual string Handle(OrderRequest r) => _next?.Handle(r) ?? "OK : commande acceptée";
}

class CustomerCheck : Handler
{
    public override string Handle(OrderRequest r) => r.CustomerId <= 0 ? "Refus : client inconnu" : base.Handle(r);
}

class FraudCheck : Handler
{
    public override string Handle(OrderRequest r) =>
        r.CustomerId == 13 && r.Quantity > 5 ? "Refus : suspicion de fraude" : base.Handle(r);
}

class StockCheck : Handler
{
    public override string Handle(OrderRequest r) => r.Quantity > 10 ? "Refus : stock insuffisant" : base.Handle(r);
}

class AmountCheck : Handler
{
    public override string Handle(OrderRequest r) => r.Amount > 10000 ? "Refus : montant à valider par un humain" : base.Handle(r);
}`
    },
    {
      level: "difficile",
      title: "Un middleware chronomètre",
      prompt: `<p>Dans le mini pipeline du troisième exemple, ajoute en <strong>premier</strong> un middleware qui mesure la durée de toute la requête avec <code>Stopwatch</code> et affiche <code>[Timing] /api/orders traité</code> à la fin (sans afficher les millisecondes, pour que la sortie soit stable). Ajoute aussi un middleware qui renvoie <code>404 Not Found</code> pour tout chemin qui ne commence pas par <code>/api</code> ou <code>/admin</code>.</p>`,
      hint: `<p>L'ordre de la liste est l'ordre d'exécution : le chronomètre en premier, le 404 avant l'endpoint.</p>`,
      solution: `using System.Diagnostics;

var middlewares = new List<Action<string, Action>>
{
    (path, next) =>
    {
        var sw = Stopwatch.StartNew();
        next();
        sw.Stop(); // sw.ElapsedMilliseconds est disponible ici
        Console.WriteLine($"[Timing] {path} traité");
    },
    (path, next) =>
    {
        if (path.StartsWith("/admin")) { Console.WriteLine("[Auth] 403 Forbidden"); return; }
        next();
    },
    (path, next) =>
    {
        if (!path.StartsWith("/api")) { Console.WriteLine("[Routing] 404 Not Found"); return; }
        next();
    }
};

Action<string> app = path => Console.WriteLine($"[Endpoint] 200 OK pour {path}");
for (int i = middlewares.Count - 1; i >= 0; i--)
{
    var middleware = middlewares[i];
    var next = app;
    app = path => middleware(path, () => next(path));
}

app("/api/orders");  // 200 puis [Timing]
app("/admin/users"); // 403 puis [Timing]
app("/inconnu");     // 404 puis [Timing]`
    }
  ],
  quiz: [
    {
      q: `Quel est l'intérêt principal de transformer une action en objet Command ?`,
      options: ["Exécuter le code plus vite", "Pouvoir la stocker, la mettre en file, la journaliser ou l'annuler", "Éviter d'écrire des interfaces"],
      answer: 1,
      why: `Une action devenue objet peut être conservée et manipulée : historique pour Undo, file d'attente, rejeu, journal. Un simple appel de méthode ne laisse aucune trace.`
    },
    {
      q: `Dans une chaîne de responsabilité, que fait un maillon qui ne peut pas traiter la requête ?`,
      options: ["Il lève toujours une exception", "Il recommence au premier maillon", "Il la transmet au maillon suivant"],
      answer: 2,
      why: `Chaque maillon traite son cas ou passe la main. S'il traite et s'arrête, on dit qu'il court-circuite la chaîne.`
    },
    {
      q: `Un middleware ASP.NET Core qui renvoie 401 sans appeler <code>next</code>…`,
      options: ["court-circuite la chaîne : les middlewares suivants et le contrôleur ne sont pas exécutés", "provoque une erreur de compilation", "est quand même suivi par l'exécution du contrôleur"],
      answer: 0,
      why: `Ne pas appeler <code>next</code>, c'est arrêter la chaîne. C'est exactement ce que fait l'autorisation quand l'utilisateur n'a pas le droit.`
    },
    {
      q: `Quelle est la différence clé entre un Decorator et un maillon de Chain of Responsibility ?`,
      options: ["Le Decorator n'a pas d'interface", "Le maillon peut décider de ne pas appeler la suite, le décorateur délègue toujours", "Il n'y en a aucune"],
      answer: 1,
      why: `Les deux enveloppent « la suite », mais un décorateur ajoute un comportement et appelle toujours l'objet intérieur, alors qu'un maillon de chaîne peut traiter seul et s'arrêter.`
    }
  ],
  project: `<p><strong>OrderFlow : une commande CQRS et un middleware maison.</strong></p>
<ul>
<li>Crée <code>record CreateOrderCommand(int CustomerId, List&lt;CreateOrderLine&gt; Lines, string ShippingMode)</code> et un <code>CreateOrderHandler</code> avec une méthode <code>Task&lt;int&gt; HandleAsync(CreateOrderCommand command)</code> qui appelle ton <code>CheckoutService</code>. L'endpoint <code>POST /api/orders</code> ne fait plus que construire la commande et appeler le handler.</li>
<li>Avant le handler, fais passer la commande dans une chaîne de validations : client existant dans <code>Customers</code>, au moins une ligne, stock suffisant dans <code>Products</code>. Le premier refus renvoie un 400 avec le message.</li>
<li>Écris un middleware <code>RequestTimingMiddleware</code> (une classe avec <code>InvokeAsync(HttpContext context)</code> et un <code>RequestDelegate next</code>) qui ajoute l'en-tête <code>X-Elapsed-Ms</code>, et branche-le avec <code>app.UseMiddleware&lt;RequestTimingMiddleware&gt;()</code>. Vérifie l'en-tête dans les outils réseau de ton front Angular.</li>
</ul>`,
  resources: [
    { label: "Intergiciel (middleware) ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/middleware/" },
    { label: "Modèle CQRS (Azure Architecture Center)", url: "https://learn.microsoft.com/fr-fr/azure/architecture/patterns/cqrs" }
  ]
});

// =====================================================================
// 9. Les anti-patterns à reconnaître
// =====================================================================
window.COURSE.push({
  key: "pat-anti",
  title: "Les anti-patterns à reconnaître",
  summary: "Tu sauras reconnaître les anti-patterns les plus fréquents dans un code .NET (God class, Service Locator, primitive obsession, chaînes magiques, patternite) et les corriger simplement.",
  objectives: [
    "Définir ce qu'est un anti-pattern",
    "Repérer God class, Service Locator, primitive obsession et chaînes magiques",
    "Corriger chacun avec une solution vue dans le chapitre",
    "Reconnaître l'excès de patterns et appliquer YAGNI"
  ],
  analogy: `<p>Un anti-pattern, c'est comme le <strong>chatterton sur une fuite</strong> : sur le moment, ça marche, ça paraît même malin. Six mois plus tard, il y a du chatterton partout, l'eau coule derrière, et plus personne n'ose toucher aux tuyaux.</p>
<p>À l'inverse, installer une <strong>usine de traitement des eaux</strong> pour un évier qui goutte, c'est aussi une erreur : trop de solution pour un petit problème.</p>`,
  lesson: `<h3>Qu'est-ce qu'un anti-pattern ?</h3>
<p>Un <strong>anti-pattern</strong> est une solution qui revient souvent, qui semble raisonnable au début, mais qui crée plus de problèmes qu'elle n'en résout. Comme les patterns, ils ont un nom : c'est pratique en revue de code. Dire « attention, c'est un Service Locator » est plus rapide et moins personnel que « ton code est mal fait ».</p>
<p>Cette leçon passe en revue ceux que tu rencontreras le plus dans une API .NET, avec pour chacun le signe qui doit t'alerter et la correction.</p>

<h3>La God class</h3>
<p>Une <strong>God class</strong> (classe « dieu ») sait tout et fait tout : un <code>OrderManager</code> de 2 000 lignes qui valide, calcule les prix, parle à la base, envoie les mails et génère les PDF. Signes : un constructeur à 10 dépendances, des méthodes sans rapport entre elles, des conflits Git dès que deux personnes travaillent.</p>
<p>Correction : découper par responsabilité. Les patterns du chapitre servent justement à ça : Strategy pour les calculs qui varient, Facade mince pour orchestrer, Observer pour les réactions, Chain pour les validations.</p>

<h3>Le Service Locator</h3>
<p>Au lieu de recevoir ses dépendances dans le constructeur, la classe reçoit <code>IServiceProvider</code> et va chercher ce qu'elle veut avec <code>GetRequiredService</code>, au milieu de ses méthodes. Ça ressemble à de la DI, mais les dépendances sont <strong>cachées</strong> : le constructeur ne dit plus rien, les tests doivent configurer tout un conteneur, et un service oublié ne plante qu'au moment précis où la méthode s'exécute, parfois en production.</p>
<div class="compare"><div><h4>Service Locator</h4><p><code>OrderService(IServiceProvider sp)</code> puis <code>sp.GetRequiredService&lt;IEmailSender&gt;()</code> dans une méthode. Dépendance invisible, erreur tardive.</p></div><div><h4>Injection par constructeur</h4><p><code>OrderService(IEmailSender sender)</code>. Dépendance visible, erreur dès la création (et même au démarrage avec <code>ValidateOnBuild</code>).</p></div></div>
<p>Exception acceptée : le code d'infrastructure qui doit créer un scope (le <code>IServiceScopeFactory</code> de la leçon Singleton) ou choisir un keyed service à partir d'une clé dynamique.</p>

<h3>Primitive obsession et chaînes magiques</h3>
<p>La <strong>primitive obsession</strong>, c'est représenter des notions métier par des types de base : un email en <code>string</code>, un prix en <code>decimal</code> sans devise, un statut en <code>string</code>. Rien n'empêche alors de passer un nom à la place d'un email, et la validation est copiée (ou oubliée) à dix endroits. Correction : un petit type dédié, appelé <strong>value object</strong>, qui se valide à la création (<code>Email.Create(...)</code>, vu avec la fabrique statique).</p>
<p>Les <strong>chaînes et nombres magiques</strong> en sont un cas particulier : <code>if (status == "Payed")</code> compile malgré la faute de frappe, <code>if (total &gt; 150)</code> ne dit pas ce que représente 150. Correction : un <code>enum</code> (<code>OrderStatus.Paid</code>), une constante nommée, ou une valeur de configuration.</p>

<h3>Les autres à connaître</h3>
<table>
<tr><th>Anti-pattern</th><th>Signe</th><th>Correction</th></tr>
<tr><td>Singleton à état modifiable</td><td>un <code>static List</code> ou un singleton dont tout le monde modifie les champs</td><td>DI, état immuable ou protégé (<code>ConcurrentDictionary</code>)</td></tr>
<tr><td>Captive dependency</td><td>un singleton qui reçoit un <code>DbContext</code></td><td>durées de vie cohérentes, <code>IServiceScopeFactory</code></td></tr>
<tr><td>Copier-coller</td><td>la même règle à trois endroits, qui divergent</td><td>extraire une méthode ou un type (après la 3e copie)</td></tr>
<tr><td>Async void</td><td><code>async void Save()</code> hors gestionnaire d'event</td><td><code>async Task</code>, sinon les exceptions sont perdues</td></tr>
</table>

<h3>L'excès inverse : la patternite</h3>
<p>Le dernier anti-pattern vient… des patterns eux-mêmes. On l'appelle <strong>Golden Hammer</strong> (« quand on a un marteau en or, tout ressemble à un clou ») ou sur-ingénierie. Signes : une interface pour chaque classe alors qu'il n'y a qu'une implémentation et aucun test qui la remplace, un <code>IRepository&lt;T&gt;</code> générique qui cache un <code>DbContext</code> (qui est déjà un Unit of Work, avec ses <code>DbSet</code> qui sont déjà des repositories), une fabrique pour un seul produit.</p>
<div class="flow"><span>1re fois : écris le code</span><span>2e fois : tolère la copie</span><span>3e fois : extrais l'abstraction</span></div>
<p>C'est la <strong>règle de trois</strong>, cousine du principe <strong>YAGNI</strong> (<em>You Aren't Gonna Need It</em>, « tu n'en auras pas besoin ») : on n'ajoute une abstraction que pour un besoin réel et présent. À la troisième occurrence, tu sais enfin ce qui varie vraiment.</p>
<div class="tip">Le bon réflexe avant d'introduire un pattern : « quel problème concret, présent aujourd'hui, résout-il ? ». S'il n'y a pas de réponse claire, le code simple est le bon choix.</div>
<div class="note">En revue de code, ne te contente pas de nommer l'anti-pattern : propose la plus petite correction possible et explique ce qu'elle apporte (« si tu passes IEmailSender au constructeur, le test n'a plus besoin de monter un conteneur »). Un refactoring proposé par petites étapes passe beaucoup mieux qu'une réécriture.</div>`,
  examples: [
    {
      title: "Primitive obsession : un value object Email",
      code: `var alice = Email.Create("  Alice@Example.com ");
Console.WriteLine(alice);

try
{
    Email.Create("pas-un-email");
}
catch (ArgumentException ex)
{
    Console.WriteLine(ex.Message);
}

// Deux emails égaux par valeur, quelle que soit la casse saisie
Console.WriteLine(Email.Create("bob@example.com") == Email.Create("BOB@example.com"));

// Avant : string email partout, validé (ou pas) à dix endroits
// Après : un type qui ne peut pas contenir une valeur invalide
record Email
{
    public string Value { get; }

    private Email(string value) => Value = value;

    public static Email Create(string input)
    {
        var value = input.Trim().ToLowerInvariant();
        if (!value.Contains('@') || value.StartsWith('@') || value.EndsWith('@'))
            throw new ArgumentException($"Email invalide : {input}");
        return new Email(value);
    }

    public override string ToString() => Value;
}`,
      output: `alice@example.com
Email invalide : pas-un-email
True`,
      steps: [
        "<code>record Email</code> : un record pour avoir l'égalité par valeur gratuitement.",
        "<code>private Email(string value)</code> : le constructeur est privé, on passe obligatoirement par <code>Create</code> (une fabrique statique).",
        "<code>input.Trim().ToLowerInvariant()</code> : on normalise une fois pour toutes : espaces retirés, minuscules.",
        "<code>throw new ArgumentException(...)</code> : un <code>Email</code> invalide ne peut pas exister. Une méthode qui reçoit un <code>Email</code> n'a plus besoin de le vérifier.",
        "<code>Email.Create(\"bob@example.com\") == Email.Create(\"BOB@example.com\")</code> : les deux valeurs normalisées sont identiques, donc <code>True</code>."
      ],
      explain: "Une signature comme Register(string name, Email email) ne peut plus être appelée avec les arguments inversés."
    },
    {
      title: "Service Locator contre injection par constructeur",
      code: `// dotnet add package Microsoft.Extensions.DependencyInjection
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddTransient<OrderServiceLocator>();
services.AddTransient<OrderServiceInjected>();
// Oubli : IEmailSender n'est pas enregistré !
using var provider = services.BuildServiceProvider();

var locator = provider.GetRequiredService<OrderServiceLocator>();
Console.WriteLine("Service Locator : créé sans erreur...");
try { locator.Confirm(42); }
catch (InvalidOperationException ex) { Console.WriteLine($"...mais plante à l'usage : {ex.Message}"); }

try { provider.GetRequiredService<OrderServiceInjected>(); }
catch (InvalidOperationException ex) { Console.WriteLine($"Injection : erreur dès la création : {ex.Message}"); }

interface IEmailSender { void Send(string text); }

// Anti-pattern : la dépendance est cachée dans le corps de la méthode
class OrderServiceLocator(IServiceProvider provider)
{
    public void Confirm(int id) => provider.GetRequiredService<IEmailSender>().Send($"Commande {id}");
}

// Bonne pratique : la dépendance est visible dans le constructeur
class OrderServiceInjected(IEmailSender sender)
{
    public void Confirm(int id) => sender.Send($"Commande {id}");
}`,
      output: `Service Locator : créé sans erreur...
...mais plante à l'usage : No service for type 'IEmailSender' has been registered.
Injection : erreur dès la création : Unable to resolve service for type 'IEmailSender' while attempting to activate 'OrderServiceInjected'.`,
      steps: [
        "<code>class OrderServiceLocator(IServiceProvider provider)</code> : le constructeur ne dit rien de ce dont la classe a besoin.",
        "<code>provider.GetRequiredService&lt;IEmailSender&gt;()</code> : la dépendance est cherchée au moment de l'appel. L'oubli d'enregistrement n'est découvert qu'à cet instant.",
        "<code>class OrderServiceInjected(IEmailSender sender)</code> : la dépendance est déclarée. Le conteneur la vérifie dès qu'il crée l'objet.",
        "<code>provider.GetRequiredService&lt;OrderServiceInjected&gt;()</code> : l'erreur arrive tout de suite, avec un message qui nomme la classe concernée.",
        "Avec <code>new ServiceProviderOptions { ValidateOnBuild = true }</code> (actif par défaut en Development dans ASP.NET Core), l'erreur arriverait même dès le démarrage."
      ],
      explain: "Plus une erreur arrive tôt, moins elle coûte : à la compilation, au démarrage, puis seulement en dernier recours en production."
    },
    {
      title: "Chaînes magiques : la faute de frappe invisible",
      code: `// Avant : un statut en string, la faute de frappe compile sans broncher
string status = "Payed";
Console.WriteLine(status == "Paid" ? "Avec string : à expédier" : "Avec string : rien à faire ?!");

// Après : un enum et une constante nommée
const decimal FreeShippingThreshold = 150m;

var order = new Order(OrderStatus.Paid, 180m);
// OrderStatus.Payed ne compilerait pas : le compilateur connaît les valeurs possibles
var action = order.Status switch
{
    OrderStatus.Pending => "attendre le paiement",
    OrderStatus.Paid => "à expédier",
    OrderStatus.Shipped => "en route",
    OrderStatus.Cancelled => "annulée",
    _ => "statut inconnu"
};
Console.WriteLine($"Avec enum : {action}");
Console.WriteLine($"Livraison offerte : {order.Total >= FreeShippingThreshold}");

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

record Order(OrderStatus Status, decimal Total);`,
      output: `Avec string : rien à faire ?!
Avec enum : à expédier
Livraison offerte : True`,
      steps: [
        "<code>string status = \"Payed\";</code> : la faute (Payed au lieu de Paid) n'est détectée ni par le compilateur ni par les tests qui ne couvrent pas ce cas.",
        "<code>const decimal FreeShippingThreshold = 150m;</code> : le nombre magique 150 reçoit un nom qui explique son rôle.",
        "<code>enum OrderStatus { Pending, Paid, Shipped, Cancelled }</code> : la liste fermée des statuts du schéma OrderFlow.",
        "<code>order.Status switch { ... }</code> : chaque cas est vérifié par le compilateur, et l'IDE propose l'autocomplétion.",
        "<code>_ =&gt; \"statut inconnu\"</code> : un enum peut contenir une valeur hors liste (par un cast), d'où ce cas de sécurité."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Nommer les nombres magiques",
      prompt: `<p>Réécris ce code sans nombre magique : <code>decimal Shipping(decimal total) =&gt; total &gt;= 150 ? 0 : total &gt;= 50 ? 4.90m : 9.90m;</code>. Utilise des constantes nommées et teste avec 30, 80 et 200 €.</p>`,
      hint: `<p>Des noms comme <code>FreeShippingThreshold</code>, <code>ReducedShippingThreshold</code>, <code>ReducedShippingCost</code>, <code>StandardShippingCost</code>.</p>`,
      solution: `const decimal FreeShippingThreshold = 150m;
const decimal ReducedShippingThreshold = 50m;
const decimal ReducedShippingCost = 4.90m;
const decimal StandardShippingCost = 9.90m;

foreach (var total in new[] { 30m, 80m, 200m })
    Console.WriteLine($"{total} -> {Shipping(total)}");
// 30 -> 9,90 (ou 9.90 selon la culture)
// 80 -> 4,90
// 200 -> 0

decimal Shipping(decimal total) =>
    total >= FreeShippingThreshold ? 0
    : total >= ReducedShippingThreshold ? ReducedShippingCost
    : StandardShippingCost;`
    },
    {
      level: "moyen",
      title: "Un value object Money",
      prompt: `<p>Le code d'OrderFlow manipule des <code>decimal</code> sans devise et additionne parfois des euros et des dollars. Écris un <code>record Money(decimal Amount, string Currency)</code> avec une méthode <code>Add(Money other)</code> qui lève une <code>InvalidOperationException</code> si les devises diffèrent. Ajoute une fabrique <code>static Money Euros(decimal amount)</code>.</p>`,
      hint: `<p>Dans <code>Add</code>, compare <code>Currency</code> avec <code>other.Currency</code>, puis renvoie <code>this with { Amount = Amount + other.Amount }</code>.</p>`,
      solution: `var a = Money.Euros(10m);
var b = Money.Euros(5m);
Console.WriteLine(a.Add(b)); // Money { Amount = 15, Currency = EUR }

try
{
    a.Add(new Money(5m, "USD"));
}
catch (InvalidOperationException ex)
{
    Console.WriteLine(ex.Message); // Impossible d'additionner EUR et USD
}

record Money(decimal Amount, string Currency)
{
    public static Money Euros(decimal amount) => new(amount, "EUR");

    public Money Add(Money other)
    {
        if (other.Currency != Currency)
            throw new InvalidOperationException($"Impossible d'additionner {Currency} et {other.Currency}");
        return this with { Amount = Amount + other.Amount };
    }
}`
    },
    {
      level: "difficile",
      title: "Démonter une petite God class",
      prompt: `<p>Voici une classe à découper : <code>OrderManager</code> a une méthode <code>Process(string customerEmail, string shippingMode, decimal total)</code> qui valide l'email avec un <code>Contains('@')</code>, calcule la livraison avec un <code>switch</code> sur <code>"standard"</code>/<code>"express"</code>, puis affiche « Mail envoyé à … ». Réécris-la avec : le value object <code>Email</code>, une <code>IShippingStrategy</code> par mode, et un <code>INotifier</code> injecté. <code>OrderManager</code> ne doit plus contenir ni validation, ni switch, ni <code>Console</code>.</p>`,
      hint: `<p>Le constructeur de <code>OrderManager</code> reçoit un <code>INotifier</code>, et <code>Process</code> reçoit un <code>Email</code> et une <code>IShippingStrategy</code> déjà choisis par l'appelant.</p>`,
      solution: `var manager = new OrderManager(new ConsoleNotifier());
var total = manager.Process(Email.Create("alice@example.com"), new ExpressShipping(), 100m);
Console.WriteLine($"Total avec livraison : {total}"); // 115

interface IShippingStrategy { decimal Cost(decimal total); }
class StandardShipping : IShippingStrategy { public decimal Cost(decimal total) => 5; }
class ExpressShipping : IShippingStrategy { public decimal Cost(decimal total) => 15; }

interface INotifier { void Send(Email to, string text); }
class ConsoleNotifier : INotifier
{
    public void Send(Email to, string text) => Console.WriteLine($"Mail envoyé à {to} : {text}");
}

record Email
{
    public string Value { get; }
    private Email(string value) => Value = value;
    public static Email Create(string input) =>
        input.Contains('@') ? new Email(input.Trim().ToLowerInvariant()) : throw new ArgumentException($"Email invalide : {input}");
    public override string ToString() => Value;
}

// Il ne fait plus qu'orchestrer
class OrderManager(INotifier notifier)
{
    public decimal Process(Email customer, IShippingStrategy shipping, decimal total)
    {
        var grandTotal = total + shipping.Cost(total);
        notifier.Send(customer, $"Votre commande de {grandTotal} EUR est confirmée");
        return grandTotal;
    }
}`
    }
  ],
  quiz: [
    {
      q: `Pourquoi le Service Locator est-il considéré comme un anti-pattern ?`,
      options: ["Il est plus lent que l'injection", "Il cache les dépendances et repousse les erreurs au moment de l'appel", "Il ne fonctionne qu'avec des singletons"],
      answer: 1,
      why: `Le constructeur ne montre plus les dépendances, les tests deviennent lourds, et un service non enregistré n'est découvert qu'à l'exécution de la méthode concernée. La performance n'est pas le problème.`
    },
    {
      q: `Représenter un email par un simple <code>string</code> dans tout le code, c'est…`,
      options: ["de la primitive obsession", "une God class", "un Singleton"],
      answer: 0,
      why: `Une notion métier codée avec un type de base : rien n'empêche une valeur invalide, et la validation se répète. La correction est un value object comme <code>Email</code>.`
    },
    {
      q: `Que dit la règle de trois ?`,
      options: ["Une classe ne doit pas avoir plus de trois méthodes", "Il faut trois tests par méthode", "On extrait une abstraction à la troisième répétition, quand on sait ce qui varie"],
      answer: 2,
      why: `Abstraire trop tôt, c'est deviner. Après trois cas réels, on voit ce qui est commun et ce qui change, et l'abstraction est juste.`
    },
    {
      q: `Lequel est un signe de sur-ingénierie ?`,
      options: ["Un <code>enum</code> pour les statuts de commande", "Une interface pour chaque classe, avec une seule implémentation jamais remplacée", "Un constructeur qui reçoit ses dépendances"],
      answer: 1,
      why: `Une interface sans seconde implémentation ni usage en test n'apporte qu'une indirection. L'enum et l'injection par constructeur sont des bonnes pratiques.`
    }
  ],
  project: `<p><strong>OrderFlow : la revue anti-patterns.</strong> Relis ta solution avec cette liste et corrige au moins trois points :</p>
<ul>
<li>Remplace les statuts écrits en <code>string</code> par l'enum <code>OrderStatus</code> (avec <code>HasConversion&lt;string&gt;()</code> dans <code>OrderFlowDbContext</code> pour garder le texte dans la colonne <code>Status</code>).</li>
<li>Crée le value object <code>Email</code> et utilise-le dans <code>Customer</code> (conversion EF Core vers la colonne <code>Email nvarchar(200)</code>). Une adresse invalide renvoie un 400 dès l'entrée de l'API.</li>
<li>Cherche tout <code>GetRequiredService</code> en dehors de <code>Program.cs</code> : remplace-le par une injection par constructeur, sauf s'il s'agit d'un scope ou d'un keyed service dynamique.</li>
<li>Repère la classe la plus longue de ton projet. Si elle dépasse 300 lignes ou 6 dépendances, note dans <code>docs/patterns.md</code> comment tu la découperais avec les patterns de ce chapitre.</li>
<li>Supprime une interface qui n'a qu'une implémentation et qui n'est utilisée dans aucun test (ou garde-la et écris pourquoi).</li>
</ul>`,
  resources: [
    { label: "Implémenter des objets de valeur (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/implement-value-objects" },
    { label: "Recommandations pour l'injection de dépendances (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/dependency-injection-guidelines" }
  ]
});
