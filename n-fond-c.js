window.COURSE = window.COURSE || [];
window.COURSE.push({
  key: "f-access-static",
  title: "Modificateurs d'accès, static, const et readonly",
  summary: "Contrôler qui voit quoi dans ton code, savoir ce qui appartient à la classe ou à l'objet, et choisir entre const, readonly et static readonly sans hésiter.",
  objectives: [
    "Connaître les 7 niveaux d'accès de C# et lire la matrice de visibilité",
    "Savoir ce qu'est un assembly et pourquoi internal existe",
    "Connaître l'accès par défaut de chaque élément et appliquer la règle du moindre accès",
    "Distinguer membre static et membre d'instance, et écrire une classe static et un constructeur statique",
    "Choisir entre const, readonly, static readonly et init",
    "Éviter les pièges : état static mutable, public const et versioning, readonly qui ne rend pas un objet immuable"
  ],
  lesson: `
<h3>1. Pourquoi contrôler l'accès ?</h3>
<p>En B3, tu as écrit des classes avec <code>public</code> et <code>private</code> un peu par réflexe. Aujourd'hui, on rend ce choix conscient. Un modificateur d'accès dit <strong>quel code a le droit d'utiliser</strong> un type ou un membre. Moins un membre est visible, moins il y a de code qui peut en dépendre, et plus tu peux le modifier sans rien casser. C'est la base de l'encapsulation, que B4 approfondira.</p>
<p>Pour comprendre deux de ces modificateurs, il faut d'abord savoir ce qu'est un <strong>assembly</strong>. Un assembly est le fichier produit par la compilation d'un projet : un <code>.dll</code> (bibliothèque) ou un <code>.exe</code>. Règle simple : <strong>un projet = un assembly</strong>. Si ta solution contient <code>Library.Domain</code> et <code>Library.Console</code>, tu as deux assemblies.</p>

<h3>2. Les 7 niveaux d'accès</h3>
<table>
<thead><tr><th>Modificateur</th><th>Même classe</th><th>Classe dérivée, même assembly</th><th>Autre classe, même assembly</th><th>Classe dérivée, autre assembly</th><th>Autre classe, autre assembly</th></tr></thead>
<tbody>
<tr><td><code>public</code></td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td><code>protected internal</code></td><td>✓</td><td>✓</td><td>✓</td><td>✓</td><td>✗</td></tr>
<tr><td><code>internal</code></td><td>✓</td><td>✓</td><td>✓</td><td>✗</td><td>✗</td></tr>
<tr><td><code>protected</code></td><td>✓</td><td>✓</td><td>✗</td><td>✓</td><td>✗</td></tr>
<tr><td><code>private protected</code></td><td>✓</td><td>✓</td><td>✗</td><td>✗</td><td>✗</td></tr>
<tr><td><code>private</code></td><td>✓</td><td>✗</td><td>✗</td><td>✗</td><td>✗</td></tr>
<tr><td><code>file</code> (C# 11, types seulement)</td><td colspan="5">Le type n'est visible que dans le fichier source où il est déclaré.</td></tr>
</tbody>
</table>
<p>Deux combinaisons prêtent souvent à confusion :</p>
<ul>
<li><code>protected internal</code> = protected <strong>OU</strong> internal : accessible partout dans l'assembly, plus dans les classes dérivées des autres assemblies.</li>
<li><code>private protected</code> = protected <strong>ET</strong> internal : accessible seulement dans les classes dérivées situées dans le même assembly.</li>
</ul>
<p><code>file</code> sert surtout aux générateurs de code et aux petits types utilitaires qui ne doivent jamais sortir d'un fichier. Tu l'utiliseras rarement.</p>

<h3>3. L'accès par défaut</h3>
<p>Quand tu n'écris rien, C# choisit pour toi, toujours le niveau le plus restrictif qui a du sens :</p>
<table>
<thead><tr><th>Élément</th><th>Accès par défaut</th></tr></thead>
<tbody>
<tr><td>Classe, struct, record, interface, enum de premier niveau</td><td><code>internal</code></td></tr>
<tr><td>Membre d'une classe ou d'une struct (champ, méthode, propriété)</td><td><code>private</code></td></tr>
<tr><td>Type imbriqué dans une classe</td><td><code>private</code></td></tr>
<tr><td>Membre d'une interface</td><td><code>public</code></td></tr>
<tr><td>Valeur d'un enum</td><td>toujours <code>public</code></td></tr>
</tbody>
</table>
<p>Bonne pratique : écris quand même le modificateur. <code>private int _count;</code> est plus clair que <code>int _count;</code>, même si c'est équivalent.</p>

<h3>4. La règle du moindre accès</h3>
<p>Commence par <code>private</code> et n'élargis que si un autre code en a vraiment besoin. Une propriété peut avoir un accès différent pour la lecture et l'écriture : <code>public decimal Balance { get; private set; }</code> se lit partout mais ne se modifie que depuis la classe. C'est le schéma le plus courant pour protéger un état.</p>
<p>Pour tester du code <code>internal</code> depuis un projet de tests, ajoute dans le projet testé l'attribut <code>[assembly: InternalsVisibleTo("Library.Tests")]</code>, ou dans le .csproj l'élément <code>&lt;InternalsVisibleTo Include="Library.Tests" /&gt;</code>. Ne rends pas une classe publique juste pour la tester.</p>
<p><strong>Accessibilité incohérente.</strong> Une méthode <code>public</code> ne peut pas retourner ou recevoir un type moins visible qu'elle. Si <code>LoanRules</code> est <code>internal</code>, <code>public LoanRules GetRules()</code> provoque l'erreur CS0050 (type de retour) et <code>public void Apply(LoanRules rules)</code> l'erreur CS0051 (type de paramètre). La solution : rendre la méthode <code>internal</code>, ou le type <code>public</code>.</p>

<h3>5. TypeScript → C#</h3>
<table>
<thead><tr><th>TypeScript</th><th>C#</th><th>Différence importante</th></tr></thead>
<tbody>
<tr><td><code>public</code> (par défaut)</td><td><code>public</code></td><td>En C#, le défaut d'un membre est <code>private</code>, pas <code>public</code>.</td></tr>
<tr><td><code>private</code></td><td><code>private</code></td><td>Le <code>private</code> de TS disparaît à l'exécution ; celui de C# est appliqué par le runtime.</td></tr>
<tr><td><code>#field</code></td><td><code>private</code></td><td>C'est le <code>#</code> de JS qui ressemble le plus au <code>private</code> de C#.</td></tr>
<tr><td><code>protected</code></td><td><code>protected</code></td><td>Même idée.</td></tr>
<tr><td>(rien)</td><td><code>internal</code></td><td>TS n'a pas d'équivalent : le plus proche est « ne pas exporter depuis le module ».</td></tr>
<tr><td><code>readonly</code></td><td><code>readonly</code></td><td>Même idée : assignable à la déclaration ou dans le constructeur.</td></tr>
<tr><td><code>static</code></td><td><code>static</code></td><td>Même idée, mais C# a aussi les classes <code>static</code> entières.</td></tr>
<tr><td><code>const x = 1</code></td><td><code>const int X = 1;</code></td><td>Le <code>const</code> de JS empêche seulement la réaffectation d'une variable. Celui de C# est une valeur gravée à la compilation.</td></tr>
</tbody>
</table>

<h3>6. static : à la classe ou à l'objet ?</h3>
<p>Un membre <strong>d'instance</strong> appartient à chaque objet : chaque <code>Book</code> a son propre <code>Title</code>. Un membre <strong>static</strong> appartient à la classe elle-même et n'existe qu'en un seul exemplaire, partagé par tous :</p>
<pre><code>Book.CreatedCount   → 1 seule valeur, rangée avec le type Book
book1.Title         → "Dune"
book2.Title         → "Fondation"   (chaque objet a la sienne)</code></pre>
<p>On appelle un membre static par le nom du type : <code>Book.CreatedCount</code>, <code>Math.Max(a, b)</code>. Une méthode static n'a pas de <code>this</code> : elle ne peut pas lire les champs d'instance sans recevoir un objet en paramètre.</p>
<p><strong>Classe static.</strong> <code>static class</code> déclare une classe qui ne contient que des membres static : on ne peut ni l'instancier ni en hériter. <code>Math</code>, <code>Console</code>, <code>File</code> et toutes les classes de méthodes d'extension sont static. C'est le bon choix pour des fonctions utilitaires sans état.</p>
<p><strong>Constructeur statique.</strong> <code>static Book() { ... }</code> s'exécute <strong>une seule fois</strong>, automatiquement, avant le premier accès à un membre static ou la première création d'objet. Il ne prend pas de paramètres et n'a pas de modificateur d'accès. S'il lève une exception, elle est enveloppée dans une <code>TypeInitializationException</code>, et le type devient inutilisable jusqu'à l'arrêt du programme. Garde-le donc très simple.</p>
<p><strong>using static.</strong> <code>using static System.Math;</code> permet d'écrire <code>Max(a, b)</code> au lieu de <code>Math.Max(a, b)</code>. À utiliser avec modération pour garder le code lisible.</p>
<p><strong>Fonctions locales et lambdas static.</strong> <code>static int Double(int x) =&gt; x * 2;</code> déclaré dans une méthode, ou une lambda <code>static x =&gt; x * 2</code>, garantit qu'elles ne capturent aucune variable de l'extérieur. Le compilateur te prévient si tu en captures une par erreur.</p>

<h3>7. Le piège de l'état static mutable</h3>
<p>Un champ static modifiable est une <strong>variable globale</strong>. Dans une application console, ça passe. Dans une API ASP.NET Core, c'est un bug : toutes les requêtes de tous les utilisateurs partagent la même valeur. Si tu ranges « le panier courant » dans un champ static, l'utilisateur A voit le panier de l'utilisateur B. Les tests en souffrent aussi : un test modifie la valeur, le suivant hérite de l'état. Et sans verrou, deux threads qui écrivent en même temps corrompent la valeur (jours 19 et 20).</p>
<p>Règle : <strong>static pour ce qui ne change pas</strong> (constantes, fonctions pures, caches en lecture seule), <strong>instance pour l'état</strong>. Ne mets pas tout en static « pour simplifier » : tu perdras la testabilité et, plus tard, l'injection de dépendances.</p>

<h3>8. const, readonly, static readonly et init</h3>
<table>
<thead><tr><th></th><th><code>const</code></th><th><code>readonly</code></th><th><code>static readonly</code></th><th><code>init</code> (propriété)</th></tr></thead>
<tbody>
<tr><td>Quand la valeur est fixée</td><td>À la compilation</td><td>À la construction de l'objet</td><td>Au premier accès au type, une fois</td><td>À la création de l'objet (initialiseur)</td></tr>
<tr><td>Où l'assigner</td><td>Uniquement à la déclaration</td><td>Déclaration ou constructeur</td><td>Déclaration ou constructeur statique</td><td>Constructeur ou <code>new X { P = ... }</code></td></tr>
<tr><td>Par instance ou par type</td><td>Par type (implicitement static)</td><td>Par instance</td><td>Par type</td><td>Par instance</td></tr>
<tr><td>Types autorisés</td><td>Nombres, <code>decimal</code>, <code>bool</code>, <code>char</code>, <code>string</code>, enum, <code>null</code></td><td>Tous</td><td>Tous</td><td>Tous</td></tr>
<tr><td>Exemple</td><td><code>const int MaxLoans = 3;</code></td><td><code>private readonly Guid _id;</code></td><td><code>static readonly TimeSpan LoanDuration = TimeSpan.FromDays(21);</code></td><td><code>public string Isbn { get; init; }</code></td></tr>
</tbody>
</table>
<p><code>const DateTime</code> ou <code>const TimeSpan</code> ne compilent pas : ces valeurs se calculent à l'exécution. C'est exactement le cas d'usage de <code>static readonly</code>. Une constante peut aussi être locale à une méthode : <code>const int pageSize = 20;</code>.</p>
<p><strong>Piège de versioning.</strong> Le compilateur <strong>recopie</strong> la valeur d'une <code>const</code> dans chaque assembly qui l'utilise. Si <code>Library.Domain</code> expose <code>public const int MaxLoans = 3;</code> et que tu passes à 5, les autres projets garderont 3 tant qu'ils ne sont pas recompilés. Une <code>public static readonly</code> est lue à l'exécution et n'a pas ce problème. Réserve <code>public const</code> aux valeurs qui ne changeront jamais (π, nombre de jours par semaine).</p>
<p><strong>readonly ne rend pas l'objet immuable.</strong> <code>private readonly List&lt;Book&gt; _books = [];</code> empêche de remplacer la liste par une autre, mais <code>_books.Add(...)</code> fonctionne toujours. <code>readonly</code> protège la <em>référence</em>, pas le contenu. Pour exposer une collection en lecture seule, retourne un <code>IReadOnlyList&lt;Book&gt;</code>. Pour une vraie immuabilité, utilise <code>ImmutableArray&lt;T&gt;</code> ou <code>ImmutableList&lt;T&gt;</code>.</p>
<p>Sur une struct, <code>readonly struct</code> rend tous ses champs readonly, et un membre <code>readonly</code> promet de ne pas modifier l'état. C'est ce qui rend <code>readonly record struct</code> (B6) si pratique pour les petites valeurs.</p>

<div class="note">En revue de code, un senior regarde d'abord la surface publique : chaque <code>public</code> est un engagement que d'autres équipes vont utiliser. Les réflexes : classes <code>internal</code> par défaut dans les projets d'implémentation, <code>sealed</code> sauf si l'héritage est prévu (jour suivant), <code>private set</code> ou <code>init</code> plutôt que <code>set</code>, aucun champ static mutable, et <code>static readonly</code> plutôt que <code>public const</code> pour tout ce qui pourrait évoluer.</div>

<h3>9. Fiche mémo : quel mot-clé utiliser ?</h3>
<ul>
<li>Utilisé seulement dans la classe → <code>private</code>.</li>
<li>Utilisé par d'autres classes du même projet → <code>internal</code>.</li>
<li>Fait partie de l'API de la bibliothèque → <code>public</code>.</li>
<li>Prévu pour être utilisé ou redéfini par les classes enfants → <code>protected</code>.</li>
<li>Valeur littérale qui ne changera jamais → <code>const</code>.</li>
<li>Valeur fixe mais calculée (date, objet, durée) → <code>static readonly</code>.</li>
<li>Valeur propre à chaque objet, fixée à la création → <code>readonly</code> ou propriété <code>init</code>.</li>
<li>Fonction sans état → méthode <code>static</code>, dans une <code>static class</code> si elles sont nombreuses.</li>
</ul>

<h3>10. Questions d'entretien classiques</h3>
<ol>
<li><strong>Différence entre const et readonly ?</strong> const est fixé à la compilation, implicitement static, limité aux types simples et recopié chez les appelants. readonly est fixé à l'exécution, dans le constructeur, et peut être de n'importe quel type.</li>
<li><strong>Accès par défaut d'une classe et de ses membres ?</strong> La classe est internal, ses membres sont private.</li>
<li><strong>protected internal ou private protected ?</strong> Le premier est un OU (assembly ou dérivées), le second un ET (dérivées du même assembly).</li>
<li><strong>Un constructeur statique peut-il avoir des paramètres ?</strong> Non. Il n'a ni paramètres ni modificateur d'accès, et il s'exécute une seule fois, au premier usage du type.</li>
<li><strong>Classe static ou singleton ?</strong> La classe static ne peut ni implémenter d'interface ni être injectée ou remplacée dans un test. Un singleton (enregistré via la DI, voir le module 4) le peut.</li>
<li><strong>Pourquoi un champ static mutable pose-t-il problème dans une API ?</strong> Il est partagé par toutes les requêtes et tous les threads, ce qui provoque des fuites de données entre utilisateurs et des accès concurrents non protégés.</li>
</ol>
`,
  examples: [
    {
      title: "La matrice d'accès en action",
      code: `// Program.cs : les lignes en commentaire ne compilent pas
var account = new Account();
account.Owner = "Kamal";           // public : OK partout
account.Reference = "ACC-001";     // internal : OK, même assembly
// account.Balance = 100;          // erreur : le set est private
// account.ComputeFees();          // erreur : protected
Console.WriteLine($"{account.Owner} : {account.Balance} €");

var savings = new SavingsAccount();
savings.AddInterest();
Console.WriteLine($"Épargne : {savings.Balance} €");

public class Account
{
    public string Owner { get; set; } = "";
    internal string Reference { get; set; } = "";
    public decimal Balance { get; private set; }

    private decimal _fees = 2m;                       // seulement ici
    protected decimal ComputeFees() => _fees;         // ici + classes dérivées
    private protected void Credit(decimal amount)     // dérivées du même assembly
        => Balance += amount;
}

public class SavingsAccount : Account
{
    public void AddInterest()
    {
        Credit(10m);                     // OK : private protected, même assembly
        decimal fees = ComputeFees();    // OK : protected, classe dérivée
        // _fees = 0;                    // erreur : private à Account
        Console.WriteLine($"Frais : {fees} €");
    }
}`,
      explain: "Commente et décommente les lignes en erreur pour lire le message du compilateur. Le set privé de <code>Balance</code> force à passer par une méthode de la classe pour la modifier."
    },
    {
      title: "internal entre deux projets",
      code: `// ===== Projet Library.Domain : fichier LateFeeCalculator.cs =====
// Pour donner accès aux tests, ajouter dans Library.Domain.csproj :
// <ItemGroup><InternalsVisibleTo Include="Library.Tests" /></ItemGroup>
namespace Library.Domain;

public class LoanService
{
    // public : l'API que les autres projets utilisent
    public decimal GetLateFee(int daysLate) => LateFeeCalculator.Compute(daysLate);
}

// internal : un détail d'implémentation, invisible hors de Library.Domain
internal static class LateFeeCalculator
{
    internal static decimal Compute(int daysLate) => daysLate <= 0 ? 0m : daysLate * 0.50m;
}

// ===== Projet Library.Console (référence Library.Domain) : Program.cs =====
using Library.Domain;

var service = new LoanService();
Console.WriteLine($"Pénalité pour 4 jours : {service.GetLateFee(4):C}");

// LateFeeCalculator.Compute(4);
// erreur CS0122 : 'LateFeeCalculator' est inaccessible en raison de son niveau de protection`,
      explain: "Crée les deux projets avec <code>dotnet new classlib</code> et <code>dotnet new console</code>, puis <code>dotnet add reference</code>. <code>LateFeeCalculator</code> peut changer librement : aucun autre projet ne peut en dépendre."
    },
    {
      title: "static : compteur, classe static et constructeur statique",
      code: `using static System.Math;

var a = new Book("Dune");
var b = new Book("Fondation");
Console.WriteLine($"Livres créés : {Book.CreatedCount}");   // 2
Console.WriteLine($"Prix TTC : {PriceTools.WithVat(10m)}");
Console.WriteLine($"Max : {Max(3, 7)}");                     // grâce à using static

public class Book
{
    public static int CreatedCount { get; private set; }     // partagé par tous
    private static readonly DateTime _loadedAt;

    public string Title { get; }                              // propre à chaque livre

    static Book()                                             // une seule fois
    {
        _loadedAt = DateTime.Now;
        Console.WriteLine($"Type Book initialisé à {_loadedAt:T}");
    }

    public Book(string title)
    {
        Title = title;
        CreatedCount++;
    }
}

public static class PriceTools                                // pas d'instance possible
{
    public const decimal VatRate = 0.20m;
    public static decimal WithVat(decimal price) => Round(price * (1 + VatRate), 2);
}`,
      explain: "Le message du constructeur statique s'affiche avant la création du premier livre, puis plus jamais. <code>new PriceTools()</code> ne compile pas : une classe static ne s'instancie pas."
    },
    {
      title: "const, readonly, static readonly et le piège de la liste",
      code: `var library = new Library("Médiathèque centrale");
library.Add("Dune");
Console.WriteLine($"{library.Name} : max {Library.MaxLoans} prêts, durée {Library.LoanDuration.TotalDays} jours");
Console.WriteLine($"Créée le {library.CreatedOn:d}");

// library.Books.Add("Hack");   // erreur : IReadOnlyList n'a pas de Add
Console.WriteLine($"Livres : {string.Join(", ", library.Books)}");

public class Library
{
    public const int MaxLoans = 3;                                     // compilation
    public static readonly TimeSpan LoanDuration = TimeSpan.FromDays(21); // exécution, une fois
    // public const TimeSpan Bad = TimeSpan.FromDays(21);              // erreur : pas une constante

    public string Name { get; }
    public DateOnly CreatedOn { get; }
    private readonly List<string> _books = [];                         // la référence est figée...

    public IReadOnlyList<string> Books => _books;                       // ...donc on expose en lecture seule

    public Library(string name)
    {
        Name = name;
        CreatedOn = DateOnly.FromDateTime(DateTime.Today);
        // _books = new List<string>();   // autorisé ici (constructeur), interdit ailleurs
    }

    public void Add(string title)
    {
        _books.Add(title);       // readonly n'empêche pas de modifier le contenu
        // _books = [];          // erreur : on ne peut pas réassigner hors du constructeur
    }
}`,
      explain: "<code>readonly</code> fige la référence vers la liste, pas son contenu. C'est le type exposé, <code>IReadOnlyList</code>, qui empêche les appelants d'ajouter des livres."
    },
    {
      title: "Le piège de l'état static mutable",
      code: `// Simulation de deux requêtes HTTP traitées l'une après l'autre
BadCart.Items.Add("Livre de Kamal");
Console.WriteLine($"Requête de Sara voit : {string.Join(", ", BadCart.Items)}");
// Sara voit le panier de Kamal : fuite de données entre utilisateurs

// Correction : un objet par utilisateur (ou par requête)
var kamalCart = new Cart();
var saraCart = new Cart();
kamalCart.Add("Livre de Kamal");
Console.WriteLine($"Panier de Sara : {saraCart.Items.Count} article(s)");   // 0

public static class BadCart
{
    public static List<string> Items { get; } = [];   // global, partagé par tous
}

public class Cart
{
    private readonly List<string> _items = [];
    public IReadOnlyList<string> Items => _items;
    public void Add(string item) => _items.Add(item);
}`,
      explain: "Dans une vraie API, les deux requêtes arrivent en même temps sur des threads différents : le bug devient aléatoire et en plus la <code>List</code> peut se corrompre. Gardez l'état dans des instances."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Verrouiller un compte bancaire",
      prompt: `<p>Voici une classe trop ouverte :</p><pre><code>class BankAccount
{
    public string Owner;
    public decimal Balance;
    public void Deposit(decimal amount) { Balance += amount; }
}</code></pre><p>Réécris-la pour que : <code>Owner</code> soit fixé à la création et ne change plus ; <code>Balance</code> se lise partout mais ne se modifie que par <code>Deposit</code> ; un dépôt inférieur à une constante <code>MinDeposit</code> de 10 € lève une <code>ArgumentOutOfRangeException</code>. La classe doit être publique.</p>`,
      hint: `<p>Propriété avec <code>{ get; }</code> assignée dans le constructeur, <code>{ get; private set; }</code> pour le solde, et <code>public const decimal MinDeposit = 10m;</code>.</p>`,
      solution: `var account = new BankAccount("Kamal");
account.Deposit(50m);
Console.WriteLine($"{account.Owner} : {account.Balance} €");
try { account.Deposit(5m); }
catch (ArgumentOutOfRangeException ex) { Console.WriteLine(ex.Message); }

public class BankAccount
{
    public const decimal MinDeposit = 10m;

    public string Owner { get; }
    public decimal Balance { get; private set; }

    public BankAccount(string owner)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(owner);
        Owner = owner;
    }

    public void Deposit(decimal amount)
    {
        if (amount < MinDeposit)
            throw new ArgumentOutOfRangeException(nameof(amount), $"Dépôt minimum : {MinDeposit} €");
        Balance += amount;
    }
}`
    },
    {
      level: "moyen",
      title: "Identifiants et conversions",
      prompt: `<p>Écris :</p><ol><li>une classe <code>Product</code> dont chaque instance reçoit un <code>Id</code> unique (1, 2, 3…) attribué automatiquement à la création et non modifiable, avec une propriété static <code>Count</code> en lecture seule depuis l'extérieur ;</li><li>une classe static <code>TemperatureConverter</code> avec une constante <code>AbsoluteZeroCelsius = -273.15</code> et deux méthodes <code>ToFahrenheit</code> et <code>ToCelsius</code> qui refusent toute température sous le zéro absolu.</li></ol><p>Crée trois produits et affiche leurs Id et le compteur.</p>`,
      hint: `<p>Un champ <code>private static int _nextId</code> incrémenté dans le constructeur, un <code>Id</code> en <code>{ get; }</code>. Formule : F = C × 9 / 5 + 32.</p>`,
      solution: `var p1 = new Product("Clavier");
var p2 = new Product("Souris");
var p3 = new Product("Écran");
Console.WriteLine($"{p1.Id} {p2.Id} {p3.Id} - total : {Product.Count}");
Console.WriteLine(TemperatureConverter.ToFahrenheit(100));   // 212
Console.WriteLine(TemperatureConverter.ToCelsius(32));       // 0

public class Product
{
    private static int _nextId = 1;
    public static int Count { get; private set; }

    public int Id { get; }
    public string Name { get; }

    public Product(string name)
    {
        Name = name;
        Id = _nextId++;
        Count++;
    }
}

public static class TemperatureConverter
{
    public const double AbsoluteZeroCelsius = -273.15;
    private const double AbsoluteZeroFahrenheit = -459.67;

    public static double ToFahrenheit(double celsius)
    {
        if (celsius < AbsoluteZeroCelsius)
            throw new ArgumentOutOfRangeException(nameof(celsius));
        return celsius * 9 / 5 + 32;
    }

    public static double ToCelsius(double fahrenheit)
    {
        if (fahrenheit < AbsoluteZeroFahrenheit)
            throw new ArgumentOutOfRangeException(nameof(fahrenheit));
        return (fahrenheit - 32) * 5 / 9;
    }
}
// Remarque : _nextId++ n'est pas thread-safe. Le jour 19 montre Interlocked.Increment.`
    },
    {
      level: "difficile",
      title: "Une configuration vraiment immuable",
      prompt: `<p>Crée une classe <code>LibrarySettings</code> :</p><ul><li>propriétés <code>Name</code> (string), <code>MaxLoans</code> (int) et <code>OpeningDays</code> (liste de <code>DayOfWeek</code>), impossibles à modifier après création, y compris le contenu de la liste ;</li><li>constructeur <code>private</code> : on crée une instance uniquement via une méthode static <code>Create</code> qui valide les données (nom non vide, MaxLoans entre 1 et 10, au moins un jour) ;</li><li>une instance par défaut <code>Default</code> partagée, créée une seule fois.</li></ul><p>Prouve dans Program.cs qu'un appelant ne peut pas modifier la liste reçue, même s'il caste ou modifie la liste qu'il a passée à <code>Create</code>.</p>`,
      hint: `<p><code>public static readonly LibrarySettings Default = Create(...)</code>. Copie la liste reçue dans un <code>ImmutableArray&lt;DayOfWeek&gt;</code> (<code>System.Collections.Immutable</code>, inclus dans .NET) : une copie défensive protège contre les modifications de l'appelant.</p>`,
      solution: `using System.Collections.Immutable;

var days = new List<DayOfWeek> { DayOfWeek.Monday, DayOfWeek.Wednesday };
var settings = LibrarySettings.Create("Annexe nord", 5, days);

days.Add(DayOfWeek.Sunday);   // l'appelant modifie SA liste...
Console.WriteLine($"Jours d'ouverture : {string.Join(", ", settings.OpeningDays)}");   // ...pas d'effet

// settings.OpeningDays.Add(DayOfWeek.Friday);   // erreur : ImmutableArray n'a pas de Add qui modifie
if (settings.OpeningDays is IList<DayOfWeek> list)
{
    try { list.Add(DayOfWeek.Friday); }
    catch (NotSupportedException) { Console.WriteLine("Cast puis Add : refusé"); }
}

Console.WriteLine($"Défaut : {LibrarySettings.Default.Name}, {LibrarySettings.Default.MaxLoans} prêts");

public sealed class LibrarySettings
{
    public static readonly LibrarySettings Default =
        Create("Médiathèque", 3, [DayOfWeek.Tuesday, DayOfWeek.Saturday]);

    public string Name { get; }
    public int MaxLoans { get; }
    public ImmutableArray<DayOfWeek> OpeningDays { get; }

    private LibrarySettings(string name, int maxLoans, ImmutableArray<DayOfWeek> openingDays)
    {
        Name = name;
        MaxLoans = maxLoans;
        OpeningDays = openingDays;
    }

    public static LibrarySettings Create(string name, int maxLoans, IEnumerable<DayOfWeek> openingDays)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentOutOfRangeException.ThrowIfLessThan(maxLoans, 1);
        ArgumentOutOfRangeException.ThrowIfGreaterThan(maxLoans, 10);

        var days = openingDays.Distinct().ToImmutableArray();   // copie défensive
        if (days.IsEmpty)
            throw new ArgumentException("Au moins un jour d'ouverture est requis.", nameof(openingDays));

        return new LibrarySettings(name, maxLoans, days);
    }
}`
    }
  ],
  project: `<p><strong>Bibliothèque : verrouiller les classes de B3.</strong></p>
<ul>
<li>Dans <code>Book</code>, rends <code>Isbn</code> et <code>Title</code> non modifiables après création (<code>{ get; }</code> ou <code>init</code>), et passe la disponibilité en <code>public bool IsAvailable { get; private set; }</code> avec des méthodes <code>MarkAsBorrowed()</code> et <code>MarkAsReturned()</code>.</li>
<li>Ajoute dans <code>Book</code> un compteur <code>public static int CreatedCount { get; private set; }</code> incrémenté dans le constructeur, et affiche-le à la fin du programme.</li>
<li>Dans <code>Library</code>, ajoute <code>public const int MaxLoans = 3;</code> et <code>public static readonly TimeSpan LoanDuration = TimeSpan.FromDays(21);</code>. Calcule la date de retour d'un emprunt avec <code>LoanDuration</code>.</li>
<li>Expose la liste des livres en <code>IReadOnlyList&lt;Book&gt;</code> et garde la <code>List&lt;Book&gt;</code> en <code>private readonly</code>.</li>
<li>Déplace la validation de l'ISBN dans une classe <code>internal static class IsbnValidator</code>, puis vérifie qu'aucune ligne de <code>Program.cs</code> n'a besoin d'un membre public de plus que nécessaire.</li>
</ul>`,
  resources: [
    { label: "Modificateurs d'accès (guide C#)", url: "https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/access-modifiers" },
    { label: "Classes statiques et membres de classe statique", url: "https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/static-classes-and-static-class-members" },
    { label: "Constructeurs statiques", url: "https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/static-constructors" },
    { label: "Le mot-clé readonly", url: "https://learn.microsoft.com/dotnet/csharp/language-reference/keywords/readonly" },
    { label: "Le mot-clé const", url: "https://learn.microsoft.com/dotnet/csharp/language-reference/keywords/const" }
  ]
});
