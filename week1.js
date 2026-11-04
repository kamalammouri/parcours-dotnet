window.COURSE = window.COURSE || [];

// ───────────────────────── JOUR 1 ─────────────────────────
window.COURSE.push({
  day: 1, week: 1,
  title: "SDK, CLI dotnet et système de types",
  summary: "Installer .NET 10, comprendre une solution et la différence entre types valeur et types référence.",
  objectives: [
    "Créer, compiler et lancer une solution avec la CLI <code>dotnet</code>",
    "Lire un fichier <code>.csproj</code> et comprendre le rôle de la <code>.sln</code>",
    "Distinguer types valeur (stack, copie) et types référence (heap, partage)"
  ],
  lesson: `<h3>Le paysage .NET en 2026</h3>
<p>.NET est un runtime (le CLR) plus une bibliothèque standard (la BCL) et des outils (le SDK). Ton code C# est compilé en <strong>IL</strong> (Intermediate Language), stocké dans une assembly <code>.dll</code>. Au lancement, le compilateur <strong>JIT</strong> transforme l'IL en code machine, méthode par méthode. Il existe aussi la compilation <strong>Native AOT</strong>, qui produit un exécutable natif sans JIT, utile pour les conteneurs et les fonctions serverless.</p>
<p>Le « .NET Framework » 4.x est l'ancienne version, liée à Windows. Le .NET moderne (8, 9, 10…) est multiplateforme et open source. Les versions paires sont LTS (support 3 ans) : <strong>.NET 10 est la cible de ce cours</strong>.</p>

<h3>La CLI dotnet</h3>
<p>Tout passe par la commande <code>dotnet</code>, comme <code>npm</code> ou <code>ng</code> côté front :</p>
<ul>
<li><code>dotnet new console -n OrderFlow.App</code> : crée un projet à partir d'un template (<code>dotnet new list</code> pour les voir).</li>
<li><code>dotnet new sln</code> puis <code>dotnet sln add</code> : crée une solution et y ajoute des projets.</li>
<li><code>dotnet add reference</code> : référence un projet depuis un autre ; <code>dotnet add package</code> : ajoute un paquet NuGet.</li>
<li><code>dotnet build</code>, <code>dotnet run</code>, <code>dotnet test</code>, <code>dotnet watch</code> (rechargement à chaud).</li>
</ul>
<p>Une <strong>solution</strong> (<code>.sln</code>, ou le nouveau format <code>.slnx</code>) regroupe plusieurs projets. Un <strong>projet</strong> (<code>.csproj</code>) produit une assembly. Le <code>.csproj</code> moderne est court : <code>TargetFramework</code>, <code>Nullable</code>, <code>ImplicitUsings</code> et les références. Les fichiers <code>.cs</code> du dossier sont inclus automatiquement.</p>

<h3>Types valeur et types référence</h3>
<p>C'est la notion la plus importante du jour. Un <strong>type valeur</strong> (<code>int</code>, <code>double</code>, <code>bool</code>, <code>DateTime</code>, <code>decimal</code>, tout <code>struct</code> et <code>enum</code>) contient directement sa donnée. Une affectation <strong>copie</strong> la valeur. Un <strong>type référence</strong> (<code>class</code>, <code>string</code>, tableaux, <code>record</code> class, délégués) est alloué sur le tas managé ; la variable contient une référence. Une affectation copie la <em>référence</em> : deux variables pointent vers le même objet.</p>
<p>Simplification courante : « valeur = pile, référence = tas ». C'est vrai pour les variables locales, mais un <code>int</code> qui est un champ d'une classe vit dans l'objet, donc sur le tas. Retiens surtout la sémantique : <strong>copie ou partage</strong>.</p>
<p><code>string</code> est un type référence <strong>immuable</strong> : toute « modification » crée une nouvelle chaîne. Pour concaténer en boucle, utilise <code>StringBuilder</code>.</p>

<h3>Inférence, constantes et argent</h3>
<p><code>var</code> laisse le compilateur déduire le type : le typage reste statique. Pour l'argent, utilise toujours <code>decimal</code> (base 10), jamais <code>double</code> : <code>0.1 + 0.2</code> n'est pas égal à <code>0.3</code> en <code>double</code>.</p>

<h3>Pièges courants</h3>
<ul>
<li>Croire que passer un objet à une méthode le copie : la méthode peut le modifier.</li>
<li>Modifier une copie d'un <code>struct</code> dans une liste et s'étonner que l'original ne change pas.</li>
<li>Comparer des <code>double</code> avec <code>==</code>.</li>
<li>Oublier que <code>Nullable</code> est activé par défaut : les avertissements sont là pour t'aider, ne les ignore pas.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : sache expliquer le boxing. Quand un type valeur est converti en <code>object</code> ou en interface, le runtime l'emballe dans un objet sur le tas. Dans une boucle chaude, cela crée des allocations et de la pression sur le GC. Les génériques (<code>List&lt;int&gt;</code>) évitent le boxing, contrairement à l'ancien <code>ArrayList</code>. Active aussi <code>&lt;TreatWarningsAsErrors&gt;true&lt;/TreatWarningsAsErrors&gt;</code> dans un <code>Directory.Build.props</code> pour toute la solution.</div>`,
  examples: [
    {
      title: "Créer la solution OrderFlow en CLI",
      code: `# Solution et projets
dotnet new sln -n OrderFlow
dotnet new classlib -n OrderFlow.Domain
dotnet new console -n OrderFlow.App
dotnet sln add OrderFlow.Domain OrderFlow.App
dotnet add OrderFlow.App reference OrderFlow.Domain

# Compiler et lancer
dotnet build
dotnet run --project OrderFlow.App`,
      explain: "La console référence le projet <code>Domain</code>. Tout le code métier ira dans <code>Domain</code>, sans dépendance technique."
    },
    {
      title: "Copie contre partage",
      code: `// Program.cs (top-level statements)
var p1 = new PointStruct(1, 2);
var p2 = p1;          // copie de la valeur
p2.X = 99;
Console.WriteLine(p1.X); // 1

var c1 = new PointClass { X = 1, Y = 2 };
var c2 = c1;          // copie de la référence
c2.X = 99;
Console.WriteLine(c1.X); // 99

// Argent : toujours decimal
Console.WriteLine(0.1 + 0.2 == 0.3);    // False
Console.WriteLine(0.1m + 0.2m == 0.3m); // True

struct PointStruct(int x, int y)
{
    public int X = x;
    public int Y = y;
}

class PointClass
{
    public int X { get; set; }
    public int Y { get; set; }
}`,
      explain: "Le <code>struct</code> est copié à l'affectation, la classe est partagée. Le suffixe <code>m</code> désigne un littéral <code>decimal</code>."
    },
    {
      title: "Un .csproj moderne",
      code: `<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>Exe</OutputType>
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  <ItemGroup>
    <ProjectReference Include="..\\OrderFlow.Domain\\OrderFlow.Domain.csproj" />
  </ItemGroup>
</Project>`,
      explain: "<code>ImplicitUsings</code> importe automatiquement <code>System</code>, <code>System.Linq</code>, etc. <code>Nullable</code> active l'analyse des références nulles."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Calcul de TVA",
      prompt: "Écris une app console qui lit un prix HT au clavier, applique 20&nbsp;% de TVA et affiche le prix TTC arrondi à 2 décimales.",
      hint: "<code>Console.ReadLine()</code> renvoie <code>string?</code>. Utilise <code>decimal.TryParse</code> et <code>Math.Round(value, 2)</code>.",
      solution: `Console.Write("Prix HT : ");
var input = Console.ReadLine();

if (!decimal.TryParse(input, out var ht))
{
    Console.WriteLine("Montant invalide.");
    return;
}

const decimal VatRate = 0.20m;
var ttc = Math.Round(ht * (1 + VatRate), 2);
Console.WriteLine($"Prix TTC : {ttc:F2}");`
    },
    {
      level: "moyen",
      title: "Prouver le boxing",
      prompt: "Écris un programme qui ajoute 1&nbsp;000&nbsp;000 d'entiers dans une <code>List&lt;object&gt;</code> puis dans une <code>List&lt;int&gt;</code>, et affiche la mémoire allouée dans chaque cas.",
      hint: "<code>GC.GetAllocatedBytesForCurrentThread()</code> donne le nombre d'octets alloués par le thread courant. Mesure avant et après.",
      solution: `const int N = 1_000_000;

long before = GC.GetAllocatedBytesForCurrentThread();
var boxed = new List<object>(N);
for (int i = 0; i < N; i++) boxed.Add(i); // boxing à chaque Add
long boxedBytes = GC.GetAllocatedBytesForCurrentThread() - before;

before = GC.GetAllocatedBytesForCurrentThread();
var ints = new List<int>(N);
for (int i = 0; i < N; i++) ints.Add(i);  // pas de boxing
long intBytes = GC.GetAllocatedBytesForCurrentThread() - before;

Console.WriteLine($"List<object> : {boxedBytes:N0} octets");
Console.WriteLine($"List<int>    : {intBytes:N0} octets");
// List<object> alloue ~24 Mo de plus : un objet de 24 octets par int.`
    },
    {
      level: "difficile",
      title: "Struct mutable dans une liste",
      prompt: "Explique et corrige : <code>var list = new List&lt;Counter&gt; { new() }; list[0].Value++;</code> ne compile pas si <code>Counter</code> est un <code>struct</code>. Propose deux corrections et dis laquelle tu préfères.",
      hint: "L'indexeur de <code>List&lt;T&gt;</code> renvoie une <em>copie</em> du struct. Pense à l'immutabilité ou à <code>CollectionsMarshal.AsSpan</code>.",
      solution: `using System.Runtime.InteropServices;

var list = new List<Counter> { new(0) };

// Correction 1 (préférée) : struct immuable, on remplace l'élément
list[0] = list[0] with { Value = list[0].Value + 1 };

// Correction 2 (perf, avancé) : modifier en place via un Span
var span = CollectionsMarshal.AsSpan(list);
span[0].Value++;

Console.WriteLine(list[0].Value); // 2

// Le compilateur refuse list[0].Value++ car l'indexeur renvoie
// une copie temporaire : la modification serait perdue.
record struct Counter(int Value)
{
    public int Value { get; set; } = Value;
}`
    }
  ],
  project: `<p>Crée la solution <strong>OrderFlow</strong> avec deux projets : <code>OrderFlow.Domain</code> (classlib) et <code>OrderFlow.App</code> (console). Ajoute un <code>Directory.Build.props</code> à la racine avec <code>Nullable</code>, <code>TreatWarningsAsErrors</code> et <code>net10.0</code>. Initialise un dépôt Git avec un <code>.gitignore</code> (<code>dotnet new gitignore</code>). L'app affiche « OrderFlow v0.1 ».</p>`,
  resources: [
    { label: "Vue d'ensemble de la CLI .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/core/tools/" },
    { label: "Types valeur (référence C#)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/value-types" },
    { label: "Tour du langage C#", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/tour-of-csharp/" }
  ]
});

// ───────────────────────── JOUR 2 ─────────────────────────
window.COURSE.push({
  day: 2, week: 1,
  title: "Classes, records, structs, interfaces et pattern matching",
  summary: "Modéliser un domaine métier avec les bons outils objet de C# moderne.",
  objectives: [
    "Choisir entre <code>class</code>, <code>record</code> et <code>struct</code>",
    "Utiliser les primary constructors, propriétés <code>init</code> et <code>required</code>",
    "Écrire du pattern matching avec <code>switch</code> expressions"
  ],
  lesson: `<h3>Classes et encapsulation</h3>
<p>Une classe regroupe état et comportement. En C#, on expose l'état via des <strong>propriétés</strong> (<code>get</code> / <code>set</code> / <code>init</code>) plutôt que des champs publics. Les modificateurs d'accès sont <code>public</code>, <code>internal</code> (visible dans l'assembly, par défaut pour une classe), <code>protected</code> et <code>private</code> (par défaut pour un membre).</p>
<p>Le <strong>primary constructor</strong> (C# 12) déclare les paramètres directement sur la classe : <code>public class Customer(string name)</code>. Les paramètres sont accessibles dans tout le corps, mais ce ne sont pas des propriétés : il faut les exposer explicitement si besoin.</p>
<p><code>required</code> oblige l'appelant à initialiser une propriété dans l'initialiseur d'objet. <code>init</code> autorise l'affectation uniquement à la construction.</p>

<h3>Records</h3>
<p>Un <code>record</code> est une classe pensée pour les <strong>données</strong> : égalité par valeur (deux records avec les mêmes valeurs sont égaux), <code>ToString</code> lisible, déconstruction et copie non destructive avec <code>with</code>. <code>record struct</code> donne la même chose en type valeur. Les records positionnels (<code>record Money(decimal Amount, string Currency)</code>) sont parfaits pour les <strong>value objects</strong> et les DTO.</p>

<h3>Structs</h3>
<p>Réserve <code>struct</code> aux petites valeurs (moins de 16 octets environ), immuables et souvent copiées : coordonnées, identifiants typés. Ajoute <code>readonly</code> pour garantir l'immutabilité.</p>

<h3>Interfaces et héritage</h3>
<p>Une classe hérite d'<strong>une seule</strong> classe mais implémente plusieurs interfaces. Préfère la <strong>composition</strong> et les interfaces à l'héritage profond. <code>abstract</code> définit une classe incomplète ; <code>virtual</code>/<code>override</code> permet la redéfinition ; <code>sealed</code> l'interdit (et aide le JIT). Les interfaces peuvent avoir des implémentations par défaut, à utiliser avec parcimonie.</p>

<h3>Pattern matching</h3>
<p>C# permet de tester la forme d'une valeur :</p>
<ul>
<li>Type pattern : <code>if (shape is Circle c)</code></li>
<li>Property pattern : <code>order is { Status: OrderStatus.Paid, Total: &gt; 100 }</code></li>
<li>Relational et logique : <code>x is &gt;= 0 and &lt; 10</code>, <code>not null</code></li>
<li>List pattern : <code>args is [var first, ..]</code></li>
</ul>
<p>La <strong>switch expression</strong> renvoie une valeur et le compilateur avertit si un cas n'est pas couvert.</p>

<h3>Pièges courants</h3>
<ul>
<li>Utiliser un <code>record</code> pour une entité avec identité (une commande qui change d'état) : l'égalité par valeur devient trompeuse.</li>
<li>Exposer des <code>List&lt;T&gt;</code> publiques modifiables : expose <code>IReadOnlyList&lt;T&gt;</code>.</li>
<li>Oublier que le primary constructor d'une classe capture le paramètre : le modifier change l'état.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : distingue <strong>entité</strong> (identité stable, état mutable contrôlé par des méthodes métier) et <strong>value object</strong> (défini par ses valeurs, immuable). Une entité ne doit jamais pouvoir être mise dans un état invalide : constructeur qui valide, setters privés, méthodes comme <code>order.Pay()</code> au lieu de <code>order.Status = ...</code>. On appelle « modèle anémique » une classe faite uniquement de getters/setters ; c'est l'anti-pattern à éviter dans un domaine riche.</div>`,
  examples: [
    {
      title: "Record value object avec validation",
      code: `namespace OrderFlow.Domain;

public sealed record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount));
        ArgumentException.ThrowIfNullOrWhiteSpace(currency);
        Amount = amount;
        Currency = currency.ToUpperInvariant();
    }

    public static Money operator +(Money a, Money b) =>
        a.Currency == b.Currency
            ? new Money(a.Amount + b.Amount, a.Currency)
            : throw new InvalidOperationException("Devises différentes.");
}

// Utilisation
// var a = new Money(10, "eur");
// var b = new Money(10, "EUR");
// Console.WriteLine(a == b); // True : égalité par valeur`,
      explain: "Le constructeur garantit qu'une instance de <code>Money</code> est toujours valide. L'égalité par valeur vient gratuitement du <code>record</code>."
    },
    {
      title: "Entité avec primary constructor et required",
      code: `namespace OrderFlow.Domain;

public sealed class Customer(Guid id, string email)
{
    public Guid Id { get; } = id;
    public string Email { get; private set; } = email;
    public required string Name { get; init; }

    public void ChangeEmail(string newEmail)
    {
        if (!newEmail.Contains('@'))
            throw new ArgumentException("Email invalide.", nameof(newEmail));
        Email = newEmail;
    }
}

// var c = new Customer(Guid.NewGuid(), "a@b.fr") { Name = "Alice" };
// Sans Name, le compilateur refuse : propriété required.`,
      explain: "L'email ne change que via une méthode métier qui valide. <code>Name</code> est obligatoire à la création."
    },
    {
      title: "Switch expression et patterns",
      code: `public enum OrderStatus { Draft, Placed, Paid, Shipped, Cancelled }

public static class ShippingRules
{
    public static decimal ShippingCost(OrderStatus status, decimal total, string country) =>
        (status, total, country) switch
        {
            (OrderStatus.Cancelled, _, _) => 0m,
            (_, >= 100m, "FR") => 0m,          // livraison offerte
            (_, _, "FR") => 4.90m,
            (_, _, "BE" or "LU") => 7.90m,
            _ => 14.90m
        };

    public static string Describe(object value) => value switch
    {
        null => "rien",
        int n when n < 0 => "entier négatif",
        int n => $"entier {n}",
        string { Length: 0 } => "chaîne vide",
        string s => $"texte de {s.Length} caractères",
        int[] [var first, ..] => $"tableau commençant par {first}",
        _ => value.GetType().Name
    };
}`,
      explain: "Tuple pattern, relational pattern (<code>&gt;= 100m</code>), <code>or</code>, property pattern et list pattern dans le même exemple."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Record Address",
      prompt: "Crée un <code>record Address(string Street, string City, string ZipCode)</code>. Crée une adresse, puis une copie avec une autre ville via <code>with</code>, et affiche les deux ainsi que le résultat de leur comparaison.",
      hint: "<code>var b = a with { City = \"Lyon\" };</code>",
      solution: `var a = new Address("1 rue de la Paix", "Paris", "75002");
var b = a with { City = "Lyon", ZipCode = "69001" };

Console.WriteLine(a);       // Address { Street = ..., City = Paris, ... }
Console.WriteLine(b);
Console.WriteLine(a == b);  // False
Console.WriteLine(a == (b with { City = "Paris", ZipCode = "75002" })); // True

public record Address(string Street, string City, string ZipCode);`
    },
    {
      level: "moyen",
      title: "Hiérarchie de paiements",
      prompt: "Modélise trois moyens de paiement (<code>CardPayment</code> avec les 4 derniers chiffres, <code>PayPalPayment</code> avec un email, <code>BankTransfer</code> avec un IBAN). Écris une méthode <code>Fee(Payment p)</code> avec une switch expression : carte 1,5&nbsp;%, PayPal 2,9&nbsp;% + 0,25&nbsp;€, virement 0.",
      hint: "Une classe de base <code>abstract record Payment(decimal Amount)</code> et trois records dérivés.",
      solution: `decimal Fee(Payment p) => p switch
{
    CardPayment c => Math.Round(c.Amount * 0.015m, 2),
    PayPalPayment pp => Math.Round(pp.Amount * 0.029m + 0.25m, 2),
    BankTransfer => 0m,
    _ => throw new NotSupportedException(p.GetType().Name)
};

Payment[] payments =
[
    new CardPayment(100m, "4242"),
    new PayPalPayment(100m, "a@b.fr"),
    new BankTransfer(100m, "FR76...")
];

foreach (var p in payments)
    Console.WriteLine($"{p.GetType().Name} : {Fee(p)} EUR");

public abstract record Payment(decimal Amount);
public sealed record CardPayment(decimal Amount, string Last4) : Payment(Amount);
public sealed record PayPalPayment(decimal Amount, string Email) : Payment(Amount);
public sealed record BankTransfer(decimal Amount, string Iban) : Payment(Amount);`
    },
    {
      level: "difficile",
      title: "Machine à états de commande",
      prompt: "Écris une classe <code>Order</code> avec un <code>Status</code> en lecture seule et les méthodes <code>Place()</code>, <code>Pay()</code>, <code>Ship()</code>, <code>Cancel()</code>. Les transitions invalides lèvent <code>InvalidOperationException</code>. On ne peut annuler qu'avant l'expédition.",
      hint: "Centralise les transitions autorisées dans une méthode privée <code>TransitionTo(OrderStatus next)</code> qui utilise une switch expression sur le tuple <code>(Status, next)</code>.",
      solution: `var order = new Order();
order.Place();
order.Pay();
order.Ship();
Console.WriteLine(order.Status); // Shipped

try { order.Cancel(); }
catch (InvalidOperationException ex) { Console.WriteLine(ex.Message); }

public enum OrderStatus { Draft, Placed, Paid, Shipped, Cancelled }

public sealed class Order
{
    public Guid Id { get; } = Guid.NewGuid();
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;

    public void Place() => TransitionTo(OrderStatus.Placed);
    public void Pay() => TransitionTo(OrderStatus.Paid);
    public void Ship() => TransitionTo(OrderStatus.Shipped);
    public void Cancel() => TransitionTo(OrderStatus.Cancelled);

    private void TransitionTo(OrderStatus next)
    {
        var allowed = (Status, next) switch
        {
            (OrderStatus.Draft, OrderStatus.Placed) => true,
            (OrderStatus.Placed, OrderStatus.Paid) => true,
            (OrderStatus.Paid, OrderStatus.Shipped) => true,
            (OrderStatus.Draft or OrderStatus.Placed or OrderStatus.Paid,
             OrderStatus.Cancelled) => true,
            _ => false
        };

        if (!allowed)
            throw new InvalidOperationException(
                $"Transition {Status} -> {next} interdite.");

        Status = next;
    }
}`
    }
  ],
  project: `<p>Dans <code>OrderFlow.Domain</code>, crée : <code>Money</code> (record value object), <code>Customer</code> (entité), <code>Product</code> (Id, Name, Price en <code>Money</code>, Stock), <code>OrderStatus</code> (enum) et <code>Order</code> avec la machine à états de l'exercice difficile. Aucune propriété ne doit avoir de setter public. Depuis la console, crée un client, deux produits et fais passer une commande par tous les statuts.</p>`,
  resources: [
    { label: "Records (référence C#)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/record" },
    { label: "Pattern matching", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/functional/pattern-matching" },
    { label: "Primary constructors (tutoriel)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/whats-new/tutorials/primary-constructors" }
  ]
});

// ───────────────────────── JOUR 3 ─────────────────────────
window.COURSE.push({
  day: 3, week: 1,
  title: "Nullable reference types, génériques et exceptions",
  summary: "Écrire du code sûr face au null, réutilisable grâce aux génériques et robuste face aux erreurs.",
  objectives: [
    "Exploiter les nullable reference types et les opérateurs <code>?.</code>, <code>??</code>, <code>??=</code>",
    "Écrire des classes et méthodes génériques avec contraintes",
    "Lever, attraper et concevoir des exceptions correctement"
  ],
  lesson: `<h3>Nullable reference types (NRT)</h3>
<p>Avec <code>&lt;Nullable&gt;enable&lt;/Nullable&gt;</code>, le compilateur considère que <code>string</code> ne peut <strong>pas</strong> être null, et que <code>string?</code> peut l'être. C'est une analyse statique : à l'exécution, rien ne change, mais tu reçois des avertissements quand tu déréférences une valeur peut-être nulle. Comme <code>strictNullChecks</code> en TypeScript.</p>
<ul>
<li><code>a?.B</code> : renvoie null si <code>a</code> est null.</li>
<li><code>a ?? b</code> : <code>b</code> si <code>a</code> est null. <code>x ??= y</code> : affecte si null.</li>
<li><code>a!</code> : l'opérateur « null-forgiving » qui fait taire le compilateur. À éviter, c'est un mensonge au compilateur.</li>
<li><code>ArgumentNullException.ThrowIfNull(arg)</code> : garde en début de méthode publique.</li>
</ul>
<p>Pour les types valeur, <code>int?</code> est un vrai type différent (<code>Nullable&lt;int&gt;</code>) avec <code>HasValue</code> et <code>Value</code>.</p>

<h3>Génériques</h3>
<p>Les génériques permettent d'écrire un code une fois pour plusieurs types, sans perdre le typage ni boxer. Exemple : <code>List&lt;T&gt;</code>, <code>Dictionary&lt;TKey, TValue&gt;</code>. Tu peux écrire tes propres classes et méthodes génériques et les restreindre avec des <strong>contraintes</strong> :</p>
<ul>
<li><code>where T : class</code> / <code>struct</code> / <code>notnull</code></li>
<li><code>where T : IEntity</code> : doit implémenter une interface</li>
<li><code>where T : new()</code> : doit avoir un constructeur sans paramètre</li>
</ul>
<p>Contrairement à Java, les génériques .NET sont <strong>réifiés</strong> : <code>typeof(T)</code> fonctionne à l'exécution et le JIT génère du code spécialisé pour chaque type valeur.</p>
<p>La <strong>variance</strong> : <code>IEnumerable&lt;out T&gt;</code> est covariante (un <code>IEnumerable&lt;string&gt;</code> peut servir de <code>IEnumerable&lt;object&gt;</code>), <code>Action&lt;in T&gt;</code> est contravariante.</p>

<h3>Exceptions</h3>
<p>Une exception signale qu'une méthode ne peut pas faire ce que son nom promet. On utilise <code>try</code> / <code>catch</code> / <code>finally</code>. Règles :</p>
<ul>
<li>Attrape les exceptions <strong>spécifiques</strong> que tu sais traiter. Un <code>catch (Exception)</code> ne se justifie qu'en bordure (middleware global, boucle de worker).</li>
<li>Pour relancer, écris <code>throw;</code> et non <code>throw ex;</code>, qui écrase la stack trace.</li>
<li>Les filtres <code>catch (HttpRequestException ex) when (ex.StatusCode == ...)</code> évitent de dérouler la pile inutilement.</li>
<li>Crée tes propres exceptions métier (<code>DomainException</code>) quand l'appelant doit les distinguer.</li>
<li>Les exceptions coûtent cher : ne les utilise pas pour le contrôle de flux normal (préférer <code>TryParse</code>).</li>
</ul>

<h3>Pièges courants</h3>
<ul>
<li>Saupoudrer des <code>!</code> pour supprimer les avertissements.</li>
<li>Avaler une exception avec un <code>catch {}</code> vide : l'erreur disparaît silencieusement.</li>
<li>Logger et relancer à chaque couche : la même erreur apparaît cinq fois dans les logs.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : choisis consciemment entre exception et <strong>Result pattern</strong>. Les cas prévus du métier (stock insuffisant, email déjà pris) peuvent être retournés comme résultats typés ; les cas imprévus (base indisponible, bug) restent des exceptions. On y reviendra semaine 3. Sache aussi lire les attributs d'analyse de null comme <code>[NotNullWhen(true)]</code>, utilisés par <code>TryGetValue</code> et <code>string.IsNullOrEmpty</code>.</div>`,
  examples: [
    {
      title: "Gérer le null proprement",
      code: `using System.Diagnostics.CodeAnalysis;

Customer? found = FindCustomer("bob@x.fr");

// Accès sécurisé
Console.WriteLine(found?.Name ?? "inconnu");

// Le compilateur sait que customer n'est pas null dans le if
if (TryFindCustomer("alice@x.fr", out var customer))
    Console.WriteLine(customer.Name.ToUpper());

static Customer? FindCustomer(string email) =>
    email == "alice@x.fr" ? new Customer("Alice") : null;

static bool TryFindCustomer(string email, [NotNullWhen(true)] out Customer? customer)
{
    customer = FindCustomer(email);
    return customer is not null;
}

record Customer(string Name);`,
      explain: "<code>[NotNullWhen(true)]</code> informe le compilateur que <code>customer</code> est non nul quand la méthode renvoie <code>true</code>."
    },
    {
      title: "Repository générique avec contrainte",
      code: `public interface IEntity
{
    Guid Id { get; }
}

public sealed class InMemoryRepository<T> where T : class, IEntity
{
    private readonly Dictionary<Guid, T> _items = [];

    public void Add(T item)
    {
        ArgumentNullException.ThrowIfNull(item);
        if (!_items.TryAdd(item.Id, item))
            throw new InvalidOperationException($"{typeof(T).Name} {item.Id} existe déjà.");
    }

    public T? GetById(Guid id) => _items.GetValueOrDefault(id);

    public IReadOnlyCollection<T> GetAll() => _items.Values;
}

public sealed record Product(Guid Id, string Name) : IEntity;

// var repo = new InMemoryRepository<Product>();
// repo.Add(new Product(Guid.NewGuid(), "Clavier"));`,
      explain: "La contrainte <code>IEntity</code> garantit l'accès à <code>Id</code>. <code>typeof(T).Name</code> marche grâce aux génériques réifiés."
    },
    {
      title: "Exception métier et filtre",
      code: `public sealed class DomainException(string message) : Exception(message);

public static class Stock
{
    public static int Reserve(int available, int requested)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(requested);
        if (requested > available)
            throw new DomainException($"Stock insuffisant : {available} restants.");
        return available - requested;
    }
}

// Appel
try
{
    var left = Stock.Reserve(available: 3, requested: 5);
}
catch (DomainException ex) when (ex.Message.StartsWith("Stock"))
{
    Console.WriteLine($"Erreur métier : {ex.Message}");
}
finally
{
    Console.WriteLine("Toujours exécuté.");
}`,
      explain: "<code>ThrowIfNegativeOrZero</code> est un helper de garde intégré à .NET. Le filtre <code>when</code> s'évalue avant de dérouler la pile."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Nom d'affichage",
      prompt: "Écris <code>string DisplayName(string? firstName, string? lastName)</code> qui renvoie « Prénom Nom », juste l'un des deux s'il manque, ou « Anonyme » si les deux sont nuls ou vides. Pas d'avertissement nullable.",
      hint: "<code>string.IsNullOrWhiteSpace</code> et l'opérateur <code>??</code>. Un tableau plus <code>string.Join</code> simplifie le cas général.",
      solution: `Console.WriteLine(DisplayName("Ada", "Lovelace")); // Ada Lovelace
Console.WriteLine(DisplayName(null, "Turing"));    // Turing
Console.WriteLine(DisplayName(" ", null));        // Anonyme

static string DisplayName(string? firstName, string? lastName)
{
    var parts = new[] { firstName, lastName }
        .Where(p => !string.IsNullOrWhiteSpace(p))
        .Select(p => p!.Trim());

    var name = string.Join(" ", parts);
    return name.Length > 0 ? name : "Anonyme";
}`
    },
    {
      level: "moyen",
      title: "Méthode générique MaxBy",
      prompt: "Écris une méthode générique <code>T? MaxOrDefault&lt;T&gt;(IEnumerable&lt;T&gt; items) where T : IComparable&lt;T&gt;</code> qui renvoie le plus grand élément, ou <code>default</code> si la séquence est vide, sans utiliser LINQ.",
      hint: "Utilise un <code>enumerator</code> : <code>MoveNext()</code> pour le premier élément, puis compare avec <code>CompareTo</code>.",
      solution: `Console.WriteLine(MaxOrDefault(new[] { 3, 9, 2 }));          // 9
Console.WriteLine(MaxOrDefault(new[] { "pomme", "kiwi" }));  // pomme
Console.WriteLine(MaxOrDefault(Array.Empty<int>()));         // 0

static T? MaxOrDefault<T>(IEnumerable<T> items) where T : IComparable<T>
{
    ArgumentNullException.ThrowIfNull(items);
    using var e = items.GetEnumerator();
    if (!e.MoveNext()) return default;

    var max = e.Current;
    while (e.MoveNext())
    {
        if (e.Current.CompareTo(max) > 0)
            max = e.Current;
    }
    return max;
}`
    },
    {
      level: "difficile",
      title: "Type Result&lt;T&gt;",
      prompt: "Implémente un <code>Result&lt;T&gt;</code> immuable avec <code>Success(T value)</code>, <code>Failure(string error)</code>, <code>IsSuccess</code>, et une méthode <code>Match&lt;TOut&gt;(Func&lt;T, TOut&gt; onSuccess, Func&lt;string, TOut&gt; onFailure)</code>. Utilise-le pour une fonction <code>ParseQuantity(string input)</code> qui refuse les valeurs non numériques et hors de 1 à 100.",
      hint: "Un constructeur privé et deux méthodes statiques de fabrique. Les propriétés <code>Value</code> et <code>Error</code> sont nullables en interne.",
      solution: `foreach (var input in new[] { "5", "abc", "500" })
{
    var message = ParseQuantity(input).Match(
        q => $"OK : {q}",
        err => $"Erreur : {err}");
    Console.WriteLine(message);
}

static Result<int> ParseQuantity(string input)
{
    if (!int.TryParse(input, out var q))
        return Result<int>.Failure($"'{input}' n'est pas un nombre.");
    if (q is < 1 or > 100)
        return Result<int>.Failure("La quantité doit être entre 1 et 100.");
    return Result<int>.Success(q);
}

public sealed class Result<T>
{
    private readonly T? _value;
    private readonly string? _error;

    private Result(T? value, string? error, bool isSuccess)
    {
        _value = value;
        _error = error;
        IsSuccess = isSuccess;
    }

    public bool IsSuccess { get; }

    public static Result<T> Success(T value) => new(value, null, true);
    public static Result<T> Failure(string error) => new(default, error, false);

    public TOut Match<TOut>(Func<T, TOut> onSuccess, Func<string, TOut> onFailure) =>
        IsSuccess ? onSuccess(_value!) : onFailure(_error!);
}`
    }
  ],
  project: `<p>Ajoute à <code>OrderFlow.Domain</code> une interface <code>IEntity</code>, une <code>DomainException</code> et un <code>InMemoryRepository&lt;T&gt;</code>. Ajoute à <code>Order</code> une liste privée d'<code>OrderLine</code> (ProductId, Quantity, UnitPrice) exposée en <code>IReadOnlyList&lt;OrderLine&gt;</code>, et une méthode <code>AddLine(Product, int quantity)</code> qui lève une <code>DomainException</code> si la commande n'est plus en <code>Draft</code> ou si le stock est insuffisant. Corrige tous les avertissements nullable.</p>`,
  resources: [
    { label: "Nullable reference types", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/nullable-references" },
    { label: "Génériques en .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/generics/" },
    { label: "Bonnes pratiques pour les exceptions", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/exceptions/best-practices-for-exceptions" }
  ]
});

// ───────────────────────── JOUR 4 ─────────────────────────
window.COURSE.push({
  day: 4, week: 1,
  title: "Collections et LINQ",
  summary: "Manipuler des données en mémoire avec les bonnes collections et LINQ, en comprenant l'exécution différée.",
  objectives: [
    "Choisir la bonne collection : <code>List</code>, <code>Dictionary</code>, <code>HashSet</code>, <code>Queue</code>",
    "Écrire des requêtes LINQ : filtre, projection, tri, regroupement, jointure",
    "Comprendre l'exécution différée et <code>IEnumerable</code> contre <code>IQueryable</code>"
  ],
  lesson: `<h3>Les collections essentielles</h3>
<ul>
<li><code>T[]</code> : taille fixe, le plus rapide.</li>
<li><code>List&lt;T&gt;</code> : tableau dynamique, accès par index en O(1), recherche en O(n).</li>
<li><code>Dictionary&lt;TKey, TValue&gt;</code> : accès par clé en O(1). Utilise <code>TryGetValue</code> plutôt que <code>ContainsKey</code> suivi de l'indexeur.</li>
<li><code>HashSet&lt;T&gt;</code> : unicité et test d'appartenance en O(1).</li>
<li><code>Queue&lt;T&gt;</code>, <code>Stack&lt;T&gt;</code>, <code>PriorityQueue&lt;TElement, TPriority&gt;</code>.</li>
<li><code>ImmutableList&lt;T&gt;</code>, <code>FrozenDictionary&lt;K,V&gt;</code> (lecture seule optimisée pour les données qui ne changent plus).</li>
</ul>
<p>Les <strong>collection expressions</strong> (C# 12) unifient l'initialisation : <code>int[] a = [1, 2, 3];</code>, <code>List&lt;int&gt; b = [..a, 4];</code>.</p>

<h3>LINQ</h3>
<p>LINQ (Language Integrated Query) ajoute des méthodes d'extension sur <code>IEnumerable&lt;T&gt;</code> : <code>Where</code>, <code>Select</code>, <code>OrderBy</code>, <code>GroupBy</code>, <code>Join</code>, <code>Any</code>, <code>All</code>, <code>Sum</code>, <code>First</code>, <code>Single</code>, <code>Distinct</code>, <code>Chunk</code>, <code>DistinctBy</code>, <code>MaxBy</code>, <code>CountBy</code>, <code>AggregateBy</code>… Si tu connais <code>map</code>/<code>filter</code>/<code>reduce</code> en JavaScript, tu connais déjà l'idée : <code>Select</code> = map, <code>Where</code> = filter, <code>Aggregate</code> = reduce.</p>
<p><code>First</code> lève une exception si la séquence est vide ; <code>FirstOrDefault</code> renvoie <code>default</code>. <code>Single</code> lève aussi s'il y a plus d'un élément : utilise-le quand l'unicité est une règle.</p>

<h3>Exécution différée</h3>
<p>La plupart des opérateurs LINQ ne font <strong>rien</strong> quand on les appelle : ils construisent une requête. Elle s'exécute à l'énumération (<code>foreach</code>, <code>ToList()</code>, <code>Count()</code>, <code>First()</code>…). Conséquences :</p>
<ul>
<li>Énumérer deux fois une requête l'exécute deux fois (avertissement « possible multiple enumeration »).</li>
<li>Si la source change entre la définition et l'exécution, le résultat change.</li>
<li>Pour figer le résultat, matérialise avec <code>ToList()</code> ou <code>ToArray()</code>.</li>
</ul>

<h3>IEnumerable contre IQueryable</h3>
<p><code>IEnumerable&lt;T&gt;</code> exécute les lambdas en mémoire, en C#. <code>IQueryable&lt;T&gt;</code> (EF Core) reçoit des <strong>arbres d'expression</strong> que le fournisseur traduit en SQL. Si tu appelles <code>AsEnumerable()</code> ou <code>ToList()</code> trop tôt, tout le filtrage suivant se fait en mémoire après avoir chargé toute la table. Tu le verras en semaine 2.</p>

<h3>Pièges courants</h3>
<ul>
<li><code>list.Count() &gt; 0</code> au lieu de <code>list.Count &gt; 0</code> ou <code>Any()</code>.</li>
<li><code>Where(...).First()</code> au lieu de <code>First(predicate)</code> (équivalent, mais plus verbeux).</li>
<li>Recherche en O(n²) avec <code>list.Contains</code> dans une boucle : passe par un <code>HashSet</code> ou un <code>ToDictionary</code>.</li>
<li>Modifier une liste pendant qu'on l'énumère : <code>InvalidOperationException</code>.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : sache écrire un opérateur LINQ maison avec <code>yield return</code> et explique qu'il est différé. Sache aussi qu'en code chaud, LINQ alloue (enumerators, closures) : une boucle <code>for</code> sur un <code>Span&lt;T&gt;</code> peut être bien plus rapide. Mesure avant d'optimiser (BenchmarkDotNet, semaine 4).</div>`,
  examples: [
    {
      title: "Requêtes LINQ sur des commandes",
      code: `Order[] orders =
[
    new(1, "Alice", "FR", new(2026, 1, 5), 120m),
    new(2, "Bob",   "BE", new(2026, 1, 7), 45m),
    new(3, "Alice", "FR", new(2026, 2, 1), 80m),
    new(4, "Chloé", "FR", new(2026, 2, 3), 300m),
    new(5, "Bob",   "BE", new(2026, 2, 9), 15m),
];

// Filtre + tri + projection
var bigOrders = orders
    .Where(o => o.Total >= 100)
    .OrderByDescending(o => o.Total)
    .Select(o => $"#{o.Id} {o.Customer} {o.Total:C}");

// Regroupement : total par client
var totals = orders
    .GroupBy(o => o.Customer)
    .Select(g => new { Customer = g.Key, Count = g.Count(), Sum = g.Sum(o => o.Total) })
    .OrderByDescending(x => x.Sum);

foreach (var t in totals)
    Console.WriteLine($"{t.Customer} : {t.Count} commandes, {t.Sum} EUR");

// Opérateurs récents
var best = orders.MaxBy(o => o.Total);              // commande la plus chère
var perCountry = orders.CountBy(o => o.Country);    // FR:3, BE:2
var byMonth = orders.ToLookup(o => o.Date.Month);

// En top-level statements, les types se déclarent après le code
record Order(int Id, string Customer, string Country, DateOnly Date, decimal Total);`,
      explain: "<code>CountBy</code> et <code>AggregateBy</code> sont arrivés avec .NET 9 et évitent un <code>GroupBy</code> complet."
    },
    {
      title: "Exécution différée démontrée",
      code: `var numbers = new List<int> { 1, 2, 3 };

var query = numbers.Where(n =>
{
    Console.WriteLine($"test {n}");
    return n > 1;
});

Console.WriteLine("Requête définie, rien d'exécuté.");
numbers.Add(4);                 // la source change

var result = query.ToList();    // exécution ici : teste 1, 2, 3, 4
Console.WriteLine(string.Join(", ", result)); // 2, 3, 4

// Opérateur maison différé
static IEnumerable<T> EveryOther<T>(IEnumerable<T> source)
{
    var keep = true;
    foreach (var item in source)
    {
        if (keep) yield return item;
        keep = !keep;
    }
}

Console.WriteLine(string.Join(", ", EveryOther(numbers))); // 1, 3`,
      explain: "Rien n'est évalué avant <code>ToList()</code>, donc l'élément 4 ajouté après coup est inclus."
    },
    {
      title: "Jointure et dictionnaire",
      code: `Product[] products = [new(1, "Clavier", 49m), new(2, "Souris", 25m)];
Line[] lines = [new(10, 1, 2), new(10, 2, 1), new(11, 2, 3)];

// Join LINQ
var detail = lines.Join(products,
    l => l.ProductId,
    p => p.Id,
    (l, p) => new { l.OrderId, p.Name, Amount = l.Qty * p.Price });

// Équivalent plus efficace pour de gros volumes : dictionnaire
var byId = products.ToDictionary(p => p.Id);
var totalPerOrder = lines
    .GroupBy(l => l.OrderId)
    .ToDictionary(g => g.Key, g => g.Sum(l => l.Qty * byId[l.ProductId].Price));

foreach (var (orderId, total) in totalPerOrder)
    Console.WriteLine($"Commande {orderId} : {total} EUR");

record Product(int Id, string Name, decimal Price);
record Line(int OrderId, int ProductId, int Qty);`,
      explain: "Un <code>ToDictionary</code> transforme une recherche en O(n) en accès O(1)."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Mots fréquents",
      prompt: "Avec la phrase <code>\"le chat et le chien et le lapin\"</code>, affiche chaque mot et son nombre d'occurrences, du plus fréquent au moins fréquent.",
      hint: "<code>Split(' ')</code>, puis <code>CountBy</code> ou <code>GroupBy</code>, puis <code>OrderByDescending</code>.",
      solution: `var text = "le chat et le chien et le lapin";

var counts = text
    .Split(' ', StringSplitOptions.RemoveEmptyEntries)
    .CountBy(w => w)
    .OrderByDescending(kv => kv.Value)
    .ThenBy(kv => kv.Key);

foreach (var (word, count) in counts)
    Console.WriteLine($"{word} : {count}");
// le : 3, et : 2, chat : 1, chien : 1, lapin : 1`
    },
    {
      level: "moyen",
      title: "Chiffre d'affaires mensuel",
      prompt: "À partir du tableau <code>orders</code> de l'exemple 1, calcule pour chaque mois : le nombre de commandes, le CA total, le panier moyen et le meilleur client (celui qui a dépensé le plus ce mois-là).",
      hint: "<code>GroupBy(o =&gt; o.Date.Month)</code>, puis à l'intérieur un second <code>GroupBy</code> par client combiné à <code>MaxBy</code>.",
      solution: `Order[] orders =
[
    new(1, "Alice", "FR", new(2026, 1, 5), 120m),
    new(2, "Bob",   "BE", new(2026, 1, 7), 45m),
    new(3, "Alice", "FR", new(2026, 2, 1), 80m),
    new(4, "Chloé", "FR", new(2026, 2, 3), 300m),
    new(5, "Bob",   "BE", new(2026, 2, 9), 15m),
];

var report = orders
    .GroupBy(o => o.Date.Month)
    .OrderBy(g => g.Key)
    .Select(g => new
    {
        Month = g.Key,
        Count = g.Count(),
        Revenue = g.Sum(o => o.Total),
        Average = Math.Round(g.Average(o => o.Total), 2),
        BestCustomer = g.GroupBy(o => o.Customer)
                        .MaxBy(c => c.Sum(o => o.Total))!.Key
    });

foreach (var r in report)
    Console.WriteLine($"Mois {r.Month} : {r.Count} cmd, CA {r.Revenue}, moyen {r.Average}, top {r.BestCustomer}");

record Order(int Id, string Customer, string Country, DateOnly Date, decimal Total);`
    },
    {
      level: "difficile",
      title: "Opérateur Batch maison",
      prompt: "Sans utiliser <code>Chunk</code>, écris un opérateur différé <code>IEnumerable&lt;T[]&gt; Batch&lt;T&gt;(this IEnumerable&lt;T&gt; source, int size)</code>. Il doit valider <code>size</code> <em>immédiatement</em> (pas à la première énumération) et fonctionner sur une séquence infinie.",
      hint: "Une méthode avec <code>yield</code> ne s'exécute qu'à l'énumération, y compris la validation. Sépare en deux : une méthode publique qui valide, et un itérateur local privé.",
      solution: `var infinite = Naturals();
foreach (var batch in infinite.Batch(3).Take(3))
    Console.WriteLine(string.Join(", ", batch));
// 0, 1, 2 / 3, 4, 5 / 6, 7, 8

try { _ = Naturals().Batch(0); }   // lève tout de suite
catch (ArgumentOutOfRangeException) { Console.WriteLine("size invalide"); }

static IEnumerable<int> Naturals()
{
    for (var i = 0; ; i++) yield return i;
}

public static class BatchExtensions
{
    public static IEnumerable<T[]> Batch<T>(this IEnumerable<T> source, int size)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(size);
        return Iterator(source, size);

        static IEnumerable<T[]> Iterator(IEnumerable<T> source, int size)
        {
            var buffer = new List<T>(size);
            foreach (var item in source)
            {
                buffer.Add(item);
                if (buffer.Count == size)
                {
                    yield return buffer.ToArray();
                    buffer.Clear();
                }
            }
            if (buffer.Count > 0)
                yield return buffer.ToArray();
        }
    }
}`
    }
  ],
  project: `<p>Ajoute à <code>OrderFlow.Domain</code> une propriété calculée <code>Order.Total</code> (somme des lignes avec LINQ). Dans la console, génère 50 commandes de démonstration (clients et produits aléatoires avec <code>Random.Shared</code>) et affiche : le CA par statut, les 3 meilleurs clients, les produits jamais commandés, et le panier moyen par mois. Écris au moins 20 requêtes LINQ différentes au total.</p>`,
  resources: [
    { label: "Vue d'ensemble de LINQ", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/linq/" },
    { label: "Collection expressions", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/collection-expressions" },
    { label: "Collections et structures de données", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/collections/" }
  ]
});

// ───────────────────────── JOUR 5 ─────────────────────────
window.COURSE.push({
  day: 5, week: 1,
  title: "Délégués, lambdas, événements et méthodes d'extension",
  summary: "Traiter les fonctions comme des valeurs et étendre des types sans les modifier.",
  objectives: [
    "Utiliser <code>Func</code>, <code>Action</code>, <code>Predicate</code> et les lambdas",
    "Comprendre les closures et leurs pièges",
    "Déclarer et consommer des événements, écrire des méthodes d'extension"
  ],
  lesson: `<h3>Délégués</h3>
<p>Un <strong>délégué</strong> est un type qui représente une méthode : sa signature (paramètres, retour). C'est l'équivalent typé d'une fonction passée en argument en JavaScript. Les délégués génériques prédéfinis couvrent presque tous les cas :</p>
<ul>
<li><code>Action&lt;T1, T2&gt;</code> : prend des paramètres, ne renvoie rien.</li>
<li><code>Func&lt;T1, TResult&gt;</code> : le dernier paramètre de type est le retour.</li>
<li><code>Predicate&lt;T&gt;</code> : équivaut à <code>Func&lt;T, bool&gt;</code>.</li>
</ul>
<p>Un délégué peut être <strong>multicast</strong> : <code>+=</code> ajoute une méthode à sa liste d'invocation.</p>

<h3>Lambdas et closures</h3>
<p>Une lambda <code>(x, y) =&gt; x + y</code> crée un délégué (ou un arbre d'expression si la cible est <code>Expression&lt;Func&lt;...&gt;&gt;</code>, comme dans EF Core). Depuis C# 10, une lambda a un type naturel : <code>var add = (int a, int b) =&gt; a + b;</code>. Elle peut avoir des paramètres par défaut (C# 12).</p>
<p>Une lambda qui utilise une variable extérieure crée une <strong>closure</strong> : le compilateur déplace la variable dans une classe cachée, et la lambda capture la <em>variable</em>, pas sa valeur. Le mot-clé <code>static</code> devant une lambda (<code>static x =&gt; x * 2</code>) interdit la capture et évite une allocation.</p>

<h3>Événements</h3>
<p>Un <code>event</code> est un délégué protégé : seuls la classe propriétaire peut le déclencher, les autres peuvent seulement s'abonner (<code>+=</code>) ou se désabonner (<code>-=</code>). Convention .NET : <code>event EventHandler&lt;TArgs&gt; Something;</code> et une méthode <code>OnSomething</code> qui appelle <code>Something?.Invoke(this, args)</code>.</p>
<p>Les événements C# sont synchrones : chaque abonné s'exécute à la suite, sur le même thread. Une exception chez un abonné interrompt les suivants.</p>

<h3>Méthodes d'extension</h3>
<p>Une méthode statique dans une classe statique, dont le premier paramètre est préfixé par <code>this</code>, peut être appelée comme si elle appartenait au type : <code>"abc".Truncate(2)</code>. C'est ce qui fait marcher LINQ. Elle n'a accès qu'aux membres publics et n'est visible que si son namespace est importé.</p>
<p>C# 14 introduit les <strong>extension members</strong> (blocs <code>extension(...)</code>) qui permettent aussi des propriétés d'extension ; la forme classique avec <code>this</code> reste la plus répandue et c'est celle qu'on utilise ici.</p>

<h3>Pièges courants</h3>
<ul>
<li>Oublier de se désabonner d'un événement : l'émetteur garde une référence vers l'abonné, qui ne sera jamais collecté (fuite mémoire classique).</li>
<li>Capturer une variable de boucle <code>for</code> dans une lambda exécutée plus tard (avec <code>foreach</code>, chaque itération a sa propre variable depuis C# 5).</li>
<li>Abuser des méthodes d'extension sur <code>object</code> ou <code>string</code> : elles polluent l'IntelliSense de tout le projet.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : sache expliquer la différence entre <code>Func&lt;Order, bool&gt;</code> et <code>Expression&lt;Func&lt;Order, bool&gt;&gt;</code>. Le premier est du code compilé, exécuté en mémoire ; le second est une structure de données que EF Core lit pour générer du SQL. C'est pour cela qu'une méthode C# arbitraire dans un <code>Where</code> EF Core peut échouer à la traduction. Pour les événements entre composants faiblement couplés, on préfère souvent un médiateur ou un bus de messages à des <code>event</code> C#.</div>`,
  examples: [
    {
      title: "Func, Action et composition",
      code: `Func<decimal, decimal> addVat = price => price * 1.20m;
Func<decimal, decimal> applyDiscount = price => price * 0.90m;
Action<string> log = msg => Console.WriteLine($"[{DateTime.Now:T}] {msg}");

// Composer des fonctions
static Func<T, T> Compose<T>(params Func<T, T>[] steps) =>
    input => steps.Aggregate(input, (acc, step) => step(acc));

var pipeline = Compose(applyDiscount, addVat);
log($"Prix final : {pipeline(100m)}"); // 108.00

// Lambda statique : pas de capture, pas d'allocation
Func<int, int> square = static x => x * x;

// Type naturel et paramètre par défaut (C# 12)
var greet = (string name = "inconnu") => $"Bonjour {name}";
Console.WriteLine(greet());`,
      explain: "<code>Aggregate</code> applique chaque fonction au résultat de la précédente : c'est un mini-pipeline de middlewares."
    },
    {
      title: "Événement typé",
      code: `public sealed class StockChangedEventArgs(string sku, int newStock) : EventArgs
{
    public string Sku { get; } = sku;
    public int NewStock { get; } = newStock;
}

public sealed class Inventory
{
    private readonly Dictionary<string, int> _stock = [];

    public event EventHandler<StockChangedEventArgs>? StockLow;

    public void Set(string sku, int qty)
    {
        _stock[sku] = qty;
        if (qty < 5)
            StockLow?.Invoke(this, new StockChangedEventArgs(sku, qty));
    }
}

// Abonnement
// var inv = new Inventory();
// EventHandler<StockChangedEventArgs> handler =
//     (_, e) => Console.WriteLine($"Alerte : {e.Sku} = {e.NewStock}");
// inv.StockLow += handler;
// inv.Set("KB-01", 2);   // déclenche l'alerte
// inv.StockLow -= handler; // toujours se désabonner`,
      explain: "Le <code>?.Invoke</code> protège du cas sans abonné. Garder le handler dans une variable permet de se désabonner."
    },
    {
      title: "Méthodes d'extension",
      code: `namespace OrderFlow.Domain.Extensions;

public static class StringExtensions
{
    public static string Truncate(this string value, int max) =>
        value.Length <= max ? value : string.Concat(value.AsSpan(0, max), "…");
}

public static class EnumerableExtensions
{
    // Filtre conditionnel : pratique pour les filtres de recherche optionnels
    public static IEnumerable<T> WhereIf<T>(
        this IEnumerable<T> source, bool condition, Func<T, bool> predicate) =>
        condition ? source.Where(predicate) : source;
}

// using OrderFlow.Domain.Extensions;
// "Clavier mécanique sans fil".Truncate(10);  // "Clavier mé…"
// orders.WhereIf(country is not null, o => o.Country == country);`,
      explain: "<code>WhereIf</code> est un classique des API de recherche avec filtres optionnels."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Calculatrice par dictionnaire",
      prompt: "Crée un <code>Dictionary&lt;string, Func&lt;double, double, double&gt;&gt;</code> avec les opérateurs <code>+ - * /</code>. Lis une expression du type <code>12 * 3</code> et affiche le résultat. Gère l'opérateur inconnu.",
      hint: "<code>Split(' ')</code> donne trois parties. <code>TryGetValue</code> pour l'opérateur.",
      solution: `var ops = new Dictionary<string, Func<double, double, double>>
{
    ["+"] = (a, b) => a + b,
    ["-"] = (a, b) => a - b,
    ["*"] = (a, b) => a * b,
    ["/"] = (a, b) => b == 0 ? throw new DivideByZeroException() : a / b,
};

Console.Write("Expression : ");
var parts = (Console.ReadLine() ?? "").Split(' ', StringSplitOptions.RemoveEmptyEntries);

if (parts.Length != 3
    || !double.TryParse(parts[0], out var left)
    || !double.TryParse(parts[2], out var right))
{
    Console.WriteLine("Format attendu : 12 * 3");
}
else if (!ops.TryGetValue(parts[1], out var op))
{
    Console.WriteLine($"Opérateur inconnu : {parts[1]}");
}
else
{
    Console.WriteLine(op(left, right));
}`
    },
    {
      level: "moyen",
      title: "Le piège de la closure",
      prompt: "Exécute ce code et explique le résultat, puis corrige-le pour afficher 0, 1, 2 :<br><code>var actions = new List&lt;Action&gt;(); for (var i = 0; i &lt; 3; i++) actions.Add(() =&gt; Console.WriteLine(i)); actions.ForEach(a =&gt; a());</code>",
      hint: "Il n'y a qu'une seule variable <code>i</code> pour toute la boucle <code>for</code>. Crée une copie locale dans le corps de la boucle.",
      solution: `var actions = new List<Action>();

for (var i = 0; i < 3; i++)
    actions.Add(() => Console.WriteLine(i));
actions.ForEach(a => a()); // 3, 3, 3 : les lambdas partagent le même i

actions.Clear();
for (var i = 0; i < 3; i++)
{
    var copy = i;                  // une nouvelle variable par itération
    actions.Add(() => Console.WriteLine(copy));
}
actions.ForEach(a => a()); // 0, 1, 2

// foreach crée déjà une variable par itération :
actions.Clear();
foreach (var n in Enumerable.Range(0, 3))
    actions.Add(() => Console.WriteLine(n));
actions.ForEach(a => a()); // 0, 1, 2`
    },
    {
      level: "difficile",
      title: "Pipeline de middlewares",
      prompt: "Reproduis le principe du pipeline ASP.NET Core : un <code>delegate Task RequestDelegate(Context ctx)</code> et une classe <code>PipelineBuilder</code> avec <code>Use(Func&lt;RequestDelegate, RequestDelegate&gt; middleware)</code> et <code>Build()</code>. Ajoute un middleware de log (avant/après), un middleware qui bloque si <code>ctx.User</code> est nul, et un handler final.",
      hint: "<code>Build</code> part du handler final et enveloppe les middlewares dans l'ordre <strong>inverse</strong> : <code>next = middleware(next)</code>.",
      solution: `var pipeline = new PipelineBuilder()
    .Use(next => async ctx =>
    {
        Console.WriteLine($"-> {ctx.Path}");
        await next(ctx);
        Console.WriteLine($"<- {ctx.Path} ({ctx.StatusCode})");
    })
    .Use(next => ctx =>
    {
        if (ctx.User is null)
        {
            ctx.StatusCode = 401;
            return Task.CompletedTask; // court-circuit
        }
        return next(ctx);
    })
    .Build(ctx =>
    {
        ctx.StatusCode = 200;
        Console.WriteLine($"   handler pour {ctx.User}");
        return Task.CompletedTask;
    });

await pipeline(new Context("/orders", "alice"));
await pipeline(new Context("/orders", null));

public delegate Task RequestDelegate(Context ctx);

public sealed class Context(string path, string? user)
{
    public string Path { get; } = path;
    public string? User { get; } = user;
    public int StatusCode { get; set; }
}

public sealed class PipelineBuilder
{
    private readonly List<Func<RequestDelegate, RequestDelegate>> _middlewares = [];

    public PipelineBuilder Use(Func<RequestDelegate, RequestDelegate> middleware)
    {
        _middlewares.Add(middleware);
        return this;
    }

    public RequestDelegate Build(RequestDelegate terminal)
    {
        var next = terminal;
        for (var i = _middlewares.Count - 1; i >= 0; i--)
            next = _middlewares[i](next);
        return next;
    }
}`
    }
  ],
  project: `<p>Crée dans <code>OrderFlow.Domain</code> un mini <strong>event bus</strong> en mémoire : <code>EventBus</code> avec <code>Subscribe&lt;TEvent&gt;(Action&lt;TEvent&gt; handler)</code> qui renvoie un <code>IDisposable</code> (pour se désabonner) et <code>Publish&lt;TEvent&gt;(TEvent evt)</code>. Définis les événements <code>OrderPlaced</code>, <code>OrderPaid</code> et <code>OrderShipped</code> (records). Dans la console, abonne un « service email » et un « service stock » qui affichent un message à chaque événement.</p>`,
  resources: [
    { label: "Expressions lambda", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/lambda-expressions" },
    { label: "Délégués", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/delegates/" },
    { label: "Méthodes d'extension", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/extension-methods" }
  ]
});

// ───────────────────────── JOUR 6 ─────────────────────────
window.COURSE.push({
  day: 6, week: 1,
  title: "async/await, Task et CancellationToken",
  summary: "Écrire du code asynchrone correct, annulable et sans deadlock.",
  objectives: [
    "Comprendre ce que fait réellement <code>await</code>",
    "Lancer des tâches en parallèle avec <code>Task.WhenAll</code> et limiter la concurrence",
    "Propager un <code>CancellationToken</code> et éviter les pièges classiques"
  ],
  lesson: `<h3>Pourquoi l'asynchrone</h3>
<p>Une requête HTTP ou une requête SQL passe l'essentiel de son temps à <strong>attendre</strong> une réponse réseau. En synchrone, le thread est bloqué pendant ce temps. En asynchrone, le thread est rendu au pool et peut servir d'autres requêtes : c'est ce qui permet à un serveur ASP.NET Core de tenir des milliers de requêtes simultanées avec peu de threads. L'asynchrone sert les opérations <strong>I/O</strong> ; pour du calcul CPU, on parle de parallélisme (<code>Parallel.ForEach</code>, <code>Task.Run</code>).</p>

<h3>Task et await</h3>
<p>Une <code>Task</code> représente une opération en cours (comme une <code>Promise</code> en JavaScript). <code>Task&lt;T&gt;</code> renvoie une valeur. Une méthode <code>async</code> est réécrite par le compilateur en <strong>machine à états</strong>. À chaque <code>await</code> sur une tâche non terminée, la méthode rend la main ; quand la tâche finit, la suite reprend (sur un thread du pool en ASP.NET Core).</p>
<p>Différence importante avec JavaScript : .NET est multi-thread. La suite d'un <code>await</code> peut s'exécuter sur un autre thread que le début.</p>

<h3>Parallèle avec WhenAll</h3>
<p>Deux <code>await</code> successifs s'exécutent l'un après l'autre. Pour lancer plusieurs opérations en même temps, démarre les tâches puis attends-les ensemble avec <code>await Task.WhenAll(t1, t2)</code> (équivalent de <code>Promise.all</code>). <code>Task.WhenAny</code> attend la première. Pour limiter la concurrence (ne pas lancer 10&nbsp;000 requêtes d'un coup), utilise <code>Parallel.ForEachAsync</code> avec <code>MaxDegreeOfParallelism</code> ou un <code>SemaphoreSlim</code>.</p>

<h3>CancellationToken</h3>
<p>Un <code>CancellationToken</code> permet d'annuler proprement une opération : client HTTP qui se déconnecte, timeout, arrêt de l'application. Règle : <strong>toute méthode async publique accepte un <code>CancellationToken</code></strong> en dernier paramètre et le transmet à tout ce qu'elle appelle. En ASP.NET Core, le framework fournit le token de la requête. On crée un timeout avec <code>new CancellationTokenSource(TimeSpan.FromSeconds(5))</code>.</p>

<h3>Pièges courants</h3>
<ul>
<li><strong><code>.Result</code> ou <code>.Wait()</code></strong> : bloque un thread et peut provoquer un deadlock dans les contextes avec <code>SynchronizationContext</code> (WinForms, WPF, ancien ASP.NET). « Async all the way » : de bout en bout.</li>
<li><strong><code>async void</code></strong> : impossible à attendre, et une exception fait planter le processus. Réservé aux gestionnaires d'événements UI.</li>
<li>Oublier <code>await</code> : la tâche part en « fire and forget » et ses exceptions sont perdues.</li>
<li><code>Task.Run</code> dans une API ASP.NET Core pour « rendre async » du code synchrone : tu prends juste un autre thread du pool.</li>
<li>Créer un <code>new HttpClient()</code> par requête : épuisement des sockets. Utilise <code>IHttpClientFactory</code> (semaine 2) ou une instance partagée.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : sache expliquer <code>ConfigureAwait(false)</code>. Il indique de ne pas reprendre sur le contexte capturé. En ASP.NET Core il n'y a pas de <code>SynchronizationContext</code>, donc c'est sans effet dans le code applicatif, mais c'est une bonne pratique dans les <strong>bibliothèques</strong> réutilisables. Connais aussi <code>ValueTask</code> : il évite une allocation quand le résultat est souvent disponible tout de suite (cache), mais il ne doit être attendu qu'une seule fois. Par défaut, renvoie <code>Task</code>.</div>`,
  examples: [
    {
      title: "Séquentiel contre parallèle",
      code: `using System.Diagnostics;

var sw = Stopwatch.StartNew();
await GetPriceAsync("A");
await GetPriceAsync("B");
await GetPriceAsync("C");
Console.WriteLine($"Séquentiel : {sw.ElapsedMilliseconds} ms"); // ~1500

sw.Restart();
var tasks = new[] { "A", "B", "C" }.Select(sku => GetPriceAsync(sku));
decimal[] prices = await Task.WhenAll(tasks);
Console.WriteLine($"Parallèle : {sw.ElapsedMilliseconds} ms");  // ~500
Console.WriteLine(string.Join(", ", prices));

static async Task<decimal> GetPriceAsync(string sku, CancellationToken ct = default)
{
    await Task.Delay(500, ct);   // simule un appel réseau
    return sku.Length * 10m;
}`,
      explain: "Les trois tâches démarrent au <code>Select</code> (matérialisé par <code>WhenAll</code>) et s'attendent en même temps."
    },
    {
      title: "HttpClient, timeout et annulation",
      code: `using System.Net.Http.Json;

using var http = new HttpClient { BaseAddress = new Uri("https://jsonplaceholder.typicode.com/") };
using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));

try
{
    var todo = await http.GetFromJsonAsync<Todo>("todos/1", cts.Token);
    Console.WriteLine(todo);
}
catch (OperationCanceledException)
{
    Console.WriteLine("Annulé ou délai dépassé.");
}
catch (HttpRequestException ex)
{
    Console.WriteLine($"Erreur HTTP : {ex.StatusCode}");
}

record Todo(int Id, string Title, bool Completed);`,
      explain: "<code>GetFromJsonAsync</code> désérialise directement le JSON. Le token annule l'appel au bout de 3 secondes."
    },
    {
      title: "Limiter la concurrence",
      code: `var ids = Enumerable.Range(1, 20);
var results = new System.Collections.Concurrent.ConcurrentBag<string>();

await Parallel.ForEachAsync(ids,
    new ParallelOptions { MaxDegreeOfParallelism = 4 },
    async (id, ct) =>
    {
        await Task.Delay(200, ct);          // appel lent simulé
        results.Add($"commande {id} traitée");
    });

Console.WriteLine($"{results.Count} commandes traitées, 4 à la fois maximum.");`,
      explain: "<code>Parallel.ForEachAsync</code> traite au plus 4 éléments en même temps. <code>ConcurrentBag</code> est sûr entre threads, contrairement à <code>List</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Compte à rebours annulable",
      prompt: "Écris <code>CountdownAsync(int seconds, CancellationToken ct)</code> qui affiche un nombre par seconde. Dans <code>Main</code>, annule automatiquement au bout de 3 secondes et affiche « Annulé » au lieu de planter.",
      hint: "<code>Task.Delay(1000, ct)</code> lève <code>OperationCanceledException</code> quand le token est annulé.",
      solution: `using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));

try
{
    await CountdownAsync(10, cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("Annulé");
}

static async Task CountdownAsync(int seconds, CancellationToken ct)
{
    for (var i = seconds; i > 0; i--)
    {
        Console.WriteLine(i);
        await Task.Delay(1000, ct);
    }
    Console.WriteLine("Terminé");
}`
    },
    {
      level: "moyen",
      title: "Le plus rapide gagne",
      prompt: "Trois fournisseurs renvoient un prix avec des délais aléatoires (200 à 1500 ms). Récupère la première réponse avec <code>Task.WhenAny</code>, affiche-la, puis annule les deux autres.",
      hint: "Un seul <code>CancellationTokenSource</code> partagé. Après <code>WhenAny</code>, appelle <code>cts.Cancel()</code>. <code>await</code> la tâche gagnante pour récupérer sa valeur.",
      solution: `using var cts = new CancellationTokenSource();

var providers = new[] { "Alpha", "Beta", "Gamma" };
var tasks = providers.Select(p => QuoteAsync(p, cts.Token)).ToList();

var winner = await Task.WhenAny(tasks);
var (name, price) = await winner;
Console.WriteLine($"Gagnant : {name} à {price} EUR");

cts.Cancel(); // les autres s'arrêtent

try { await Task.WhenAll(tasks); }
catch (OperationCanceledException) { Console.WriteLine("Autres fournisseurs annulés."); }

static async Task<(string Name, decimal Price)> QuoteAsync(string name, CancellationToken ct)
{
    var delay = Random.Shared.Next(200, 1500);
    await Task.Delay(delay, ct);
    Console.WriteLine($"{name} a répondu en {delay} ms");
    return (name, Random.Shared.Next(90, 110));
}`
    },
    {
      level: "difficile",
      title: "Retry avec backoff exponentiel",
      prompt: "Écris <code>Task&lt;T&gt; RetryAsync&lt;T&gt;(Func&lt;CancellationToken, Task&lt;T&gt;&gt; action, int maxAttempts, CancellationToken ct)</code> qui réessaie en cas de <code>HttpRequestException</code>, avec une attente de 200 ms, 400 ms, 800 ms… plus un peu d'aléatoire (jitter). Les autres exceptions et l'annulation ne doivent pas être réessayées.",
      hint: "Une boucle <code>for</code> avec un filtre <code>catch (HttpRequestException) when (attempt &lt; maxAttempts)</code>. Délai : <code>200 * 2^(attempt-1)</code> plus <code>Random.Shared.Next(0, 100)</code>.",
      solution: `var calls = 0;
var result = await RetryAsync(async ct =>
{
    calls++;
    await Task.Delay(50, ct);
    if (calls < 3) throw new HttpRequestException($"échec {calls}");
    return "réponse OK";
}, maxAttempts: 5, CancellationToken.None);

Console.WriteLine($"{result} après {calls} tentatives");

static async Task<T> RetryAsync<T>(
    Func<CancellationToken, Task<T>> action, int maxAttempts, CancellationToken ct)
{
    ArgumentOutOfRangeException.ThrowIfNegativeOrZero(maxAttempts);

    for (var attempt = 1; ; attempt++)
    {
        try
        {
            return await action(ct);
        }
        catch (HttpRequestException ex) when (attempt < maxAttempts)
        {
            var delay = 200 * (int)Math.Pow(2, attempt - 1) + Random.Shared.Next(0, 100);
            Console.WriteLine($"Tentative {attempt} échouée ({ex.Message}), nouvel essai dans {delay} ms");
            await Task.Delay(delay, ct);
        }
    }
}
// En production, on utilisera Polly / Microsoft.Extensions.Http.Resilience (semaine 3).`
    }
  ],
  project: `<p>Crée une interface <code>IOrderRepository</code> asynchrone (<code>AddAsync</code>, <code>GetByIdAsync</code>, <code>ListAsync</code>, toutes avec <code>CancellationToken</code>) et une implémentation en mémoire qui simule 100 ms de latence. Ajoute un <code>IExchangeRateService</code> qui appelle une vraie API publique de taux de change avec <code>HttpClient</code> et un timeout de 3 secondes. Dans la console, convertis le total de 10 commandes en USD en parallèle avec <code>Task.WhenAll</code>.</p>`,
  resources: [
    { label: "Programmation asynchrone avec async et await", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/asynchronous-programming/" },
    { label: "Annulation dans les threads managés", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/threading/cancellation-in-managed-threads" },
    { label: "Recommandations HttpClient", url: "https://learn.microsoft.com/fr-fr/dotnet/fundamentals/networking/http/httpclient-guidelines" }
  ]
});

// ───────────────────────── JOUR 7 ─────────────────────────
window.COURSE.push({
  day: 7, week: 1,
  title: "Révision : GC, IDisposable et synthèse de la semaine",
  summary: "Consolider la semaine et comprendre la gestion mémoire et des ressources en .NET.",
  objectives: [
    "Expliquer le fonctionnement du garbage collector (générations, LOH)",
    "Implémenter <code>IDisposable</code> et <code>IAsyncDisposable</code> correctement avec <code>using</code>",
    "Relire et refactorer le code de la semaine"
  ],
  lesson: `<h3>Ce qu'il faut retenir de la semaine</h3>
<ul>
<li>Types valeur (copie) et types référence (partage) ; <code>decimal</code> pour l'argent.</li>
<li><code>record</code> pour les value objects et DTO, <code>class</code> pour les entités, méthodes métier plutôt que setters publics.</li>
<li>Nullable activé, gardes en début de méthode, exceptions spécifiques, <code>throw;</code> pour relancer.</li>
<li>LINQ est différé : matérialiser au bon moment, éviter les recherches en O(n²).</li>
<li>Délégués et lambdas : attention aux closures et aux abonnements aux événements.</li>
<li>Async de bout en bout, jamais <code>.Result</code>, toujours un <code>CancellationToken</code>.</li>
</ul>

<h3>Le garbage collector</h3>
<p>Le GC libère automatiquement les objets du tas managé qui ne sont plus atteignables depuis une <strong>racine</strong> (variables locales actives, champs statiques, références tenues par le runtime). Il est <strong>générationnel</strong>, car la plupart des objets meurent jeunes :</p>
<ul>
<li><strong>Gen 0</strong> : objets récents, collectée très souvent et très vite.</li>
<li><strong>Gen 1</strong> : tampon entre les objets jeunes et anciens.</li>
<li><strong>Gen 2</strong> : objets de longue durée (caches, singletons). Collecte complète, plus coûteuse.</li>
<li><strong>LOH</strong> (Large Object Heap) : objets de 85&nbsp;000 octets ou plus, collectés avec la gen 2 et non compactés par défaut. Allouer de gros tableaux en boucle est coûteux : réutilise-les avec <code>ArrayPool&lt;T&gt;</code>.</li>
</ul>
<p>Lors d'une collecte, le GC peut suspendre les threads applicatifs. Côté serveur, ASP.NET Core utilise le mode <strong>Server GC</strong> (un tas par cœur) avec collecte concurrente en arrière-plan. N'appelle jamais <code>GC.Collect()</code> dans du code applicatif.</p>

<h3>IDisposable et using</h3>
<p>Le GC gère la mémoire, pas les <strong>ressources non managées</strong> : connexions, fichiers, sockets, handles. Les types qui en possèdent implémentent <code>IDisposable</code>. On garantit l'appel à <code>Dispose()</code> avec <code>using</code> :</p>
<ul>
<li>Déclaration : <code>using var stream = File.OpenRead(path);</code> libère à la fin du bloc englobant.</li>
<li>Bloc : <code>using (var x = ...) { }</code> pour une portée plus courte.</li>
<li>Asynchrone : <code>await using</code> pour les types <code>IAsyncDisposable</code> (connexions de base de données, <code>DbContext</code>).</li>
</ul>
<p>Si ta classe possède un champ <code>IDisposable</code>, elle doit elle-même être <code>IDisposable</code> et le libérer. Le <strong>finaliseur</strong> (<code>~MyClass()</code>) n'est nécessaire que si tu manipules directement des handles natifs, ce qui est rare : utilise plutôt <code>SafeHandle</code>.</p>

<h3>Pièges courants</h3>
<ul>
<li>Fuite mémoire par événement non désabonné ou par cache statique qui grossit sans limite.</li>
<li>Disposer un objet qu'on ne possède pas (un objet injecté par l'injection de dépendances, par exemple).</li>
<li>Utiliser un objet après <code>Dispose</code> : lever <code>ObjectDisposedException</code> via <code>ObjectDisposedException.ThrowIf(_disposed, this)</code>.</li>
</ul>

<div class="note"><strong>Niveau senior</strong> : en entretien, on te demandera souvent « comment trouves-tu une fuite mémoire ? ». Réponse attendue : observer la mémoire avec <code>dotnet-counters</code> (taille de la gen 2 qui grandit), capturer un dump avec <code>dotnet-dump</code> ou <code>dotnet-gcdump</code>, puis analyser quels objets dominent et quelles racines les retiennent (Visual Studio, PerfView). Causes typiques : événements, caches statiques, singletons qui capturent des services scoped, timers non arrêtés.</div>`,
  examples: [
    {
      title: "Observer les générations",
      code: `var shortLived = new object();
Console.WriteLine($"Nouvel objet : gen {GC.GetGeneration(shortLived)}"); // 0

GC.Collect(); // uniquement pour la démonstration !
Console.WriteLine($"Après 1 collecte : gen {GC.GetGeneration(shortLived)}"); // 1

GC.Collect();
Console.WriteLine($"Après 2 collectes : gen {GC.GetGeneration(shortLived)}"); // 2

var big = new byte[100_000]; // >= 85 000 octets : LOH
Console.WriteLine($"Gros tableau : gen {GC.GetGeneration(big)}"); // 2 (LOH)

Console.WriteLine($"Collectes gen0={GC.CollectionCount(0)} gen1={GC.CollectionCount(1)} gen2={GC.CollectionCount(2)}");
GC.KeepAlive(shortLived);`,
      explain: "Un objet survivant à une collecte est promu à la génération suivante. Les gros objets sont alloués directement dans le LOH, rapporté comme gen 2."
    },
    {
      title: "Implémenter IDisposable et IAsyncDisposable",
      code: `public sealed class OrderExportWriter : IDisposable, IAsyncDisposable
{
    private readonly StreamWriter _writer;
    private bool _disposed;

    public OrderExportWriter(string path) => _writer = new StreamWriter(path);

    public async Task WriteLineAsync(string line, CancellationToken ct = default)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        await _writer.WriteLineAsync(line.AsMemory(), ct);
    }

    public void Dispose()
    {
        if (_disposed) return;
        _writer.Dispose();
        _disposed = true;
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed) return;
        await _writer.DisposeAsync();
        _disposed = true;
    }
}

// Utilisation
// await using var export = new OrderExportWriter("orders.csv");
// await export.WriteLineAsync("Id;Total");
// libéré automatiquement en sortie de portée`,
      explain: "Classe <code>sealed</code> : pas besoin du pattern complet <code>Dispose(bool)</code>. Le flag <code>_disposed</code> rend <code>Dispose</code> idempotent."
    },
    {
      title: "Réutiliser des tampons avec ArrayPool",
      code: `using System.Buffers;

var pool = ArrayPool<byte>.Shared;
byte[] buffer = pool.Rent(100_000); // peut renvoyer un tableau plus grand
try
{
    // utiliser uniquement buffer[0..100_000]
    buffer.AsSpan(0, 100_000).Fill(0xFF);
    Console.WriteLine($"Taille louée : {buffer.Length}");
}
finally
{
    pool.Return(buffer); // toujours rendre, même en cas d'exception
}`,
      explain: "Louer et rendre un tampon évite d'allouer un gros tableau dans le LOH à chaque appel."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Mini-quiz de la semaine",
      prompt: `Réponds sans regarder le cours, puis vérifie en exécutant le code de la solution :<ol>
<li>Que vaut <code>a.X</code> après <code>var b = a; b.X = 5;</code> si <code>a</code> est un <code>struct</code> avec <code>X = 1</code> ?</li>
<li>Deux <code>record</code> avec les mêmes valeurs sont-ils égaux avec <code>==</code> ?</li>
<li>Quand s'exécute <code>numbers.Where(n =&gt; n &gt; 2)</code> ?</li>
<li>Quelle est la différence entre <code>throw;</code> et <code>throw ex;</code> ?</li>
<li>Pourquoi éviter <code>async void</code> ?</li></ol>`,
      hint: "Chaque question correspond à un jour de la semaine (1 à 6). Relis le paragraphe « Pièges courants » du jour concerné.",
      solution: `// 1. struct : copie, a.X vaut toujours 1
var a = new P { X = 1 };
var b = a; b.X = 5;
Console.WriteLine($"1. {a.X}"); // 1

// 2. record : égalité par valeur
Console.WriteLine($"2. {new R(1) == new R(1)}"); // True

// 3. exécution différée : à l'énumération (ToList, foreach, Count...)
var numbers = new List<int> { 1, 2, 3 };
var q = numbers.Where(n => n > 2);
numbers.Add(10);
Console.WriteLine($"3. {q.Count()}"); // 2 : 10 est inclus

// 4. throw; conserve la stack trace d'origine, throw ex; la remplace.
// 5. async void : non attendable, une exception non gérée tue le processus.

struct P { public int X; }
record R(int V);`
    },
    {
      level: "moyen",
      title: "Trouver la fuite",
      prompt: "Le code suivant fuit : chaque <code>Dashboard</code> créé reste en mémoire. Explique pourquoi et corrige-le en rendant <code>Dashboard</code> <code>IDisposable</code>.<br><code>class PriceFeed { public event Action&lt;decimal&gt;? PriceChanged; }</code><br><code>class Dashboard { public Dashboard(PriceFeed feed) =&gt; feed.PriceChanged += OnPrice; void OnPrice(decimal p) { } }</code>",
      hint: "L'événement du <code>PriceFeed</code> (qui vit longtemps) garde une référence vers chaque <code>Dashboard</code> via le délégué.",
      solution: `var feed = new PriceFeed();

for (var i = 0; i < 3; i++)
{
    using var dashboard = new Dashboard(feed);
    feed.Publish(100 + i);
} // Dispose désabonne : le dashboard devient collectable

Console.WriteLine($"Abonnés restants : {feed.SubscriberCount}"); // 0

public sealed class PriceFeed
{
    public event Action<decimal>? PriceChanged;
    public int SubscriberCount => PriceChanged?.GetInvocationList().Length ?? 0;
    public void Publish(decimal price) => PriceChanged?.Invoke(price);
}

public sealed class Dashboard : IDisposable
{
    private readonly PriceFeed _feed;

    public Dashboard(PriceFeed feed)
    {
        _feed = feed;
        _feed.PriceChanged += OnPrice;
    }

    private void OnPrice(decimal price) => Console.WriteLine($"Prix : {price}");

    public void Dispose() => _feed.PriceChanged -= OnPrice;
}`
    },
    {
      level: "difficile",
      title: "Refactor complet",
      prompt: `Refactore ce code en appliquant tout ce que tu as vu cette semaine (types, nullable, LINQ, async, using, exceptions) :<br><code>public class Svc { public List&lt;dynamic&gt; orders = new List&lt;dynamic&gt;(); public double GetTotal(string c) { double t = 0; foreach (var o in orders) { if (o.Customer == c) t = t + o.Amount; } return t; } public void Save(string path) { var w = new StreamWriter(path); foreach (var o in orders) w.WriteLine(o.Customer + ";" + o.Amount); w.Close(); } }</code>`,
      hint: "Problèmes : <code>dynamic</code>, <code>double</code> pour de l'argent, champ public mutable, boucle au lieu de LINQ, <code>StreamWriter</code> non protégé par <code>using</code>, I/O synchrone, aucune validation.",
      solution: `var service = new OrderService();
service.Add(new OrderRecord("alice", 120.50m));
service.Add(new OrderRecord("bob", 30m));
service.Add(new OrderRecord("alice", 9.50m));

Console.WriteLine(service.GetTotal("alice")); // 130.00
await service.SaveAsync("orders.csv");

public sealed record OrderRecord(string Customer, decimal Amount);

public sealed class OrderService
{
    private readonly List<OrderRecord> _orders = [];

    public IReadOnlyList<OrderRecord> Orders => _orders;

    public void Add(OrderRecord order)
    {
        ArgumentNullException.ThrowIfNull(order);
        ArgumentOutOfRangeException.ThrowIfNegative(order.Amount);
        _orders.Add(order);
    }

    public decimal GetTotal(string customer)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(customer);
        return _orders
            .Where(o => string.Equals(o.Customer, customer, StringComparison.OrdinalIgnoreCase))
            .Sum(o => o.Amount);
    }

    public async Task SaveAsync(string path, CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(path);
        await using var writer = new StreamWriter(path);
        foreach (var o in _orders)
            await writer.WriteLineAsync($"{o.Customer};{o.Amount}".AsMemory(), ct);
    }
}`
    }
  ],
  project: `<p>Fais une <strong>revue de code</strong> de tout <code>OrderFlow.Domain</code> comme si c'était le code d'un collègue. Liste au moins 5 améliorations dans un fichier <code>REVIEW.md</code>, puis applique-les. Ajoute un export CSV asynchrone des commandes (<code>await using</code>) et vérifie qu'aucun avertissement ne reste au <code>dotnet build</code>. Rattrape les tâches fil rouge non terminées des jours 1 à 6 : la semaine 2 transformera ce domaine en API web.</p>`,
  resources: [
    { label: "Notions de base du garbage collection", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/garbage-collection/fundamentals" },
    { label: "Implémenter une méthode Dispose", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/garbage-collection/implementing-dispose" },
    { label: "Déboguer une fuite de mémoire", url: "https://learn.microsoft.com/fr-fr/dotnet/core/diagnostics/debug-memory-leak" }
  ]
});
