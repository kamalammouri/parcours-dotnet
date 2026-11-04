window.COURSE = window.COURSE || [];

// ───────────────────────── B5 ─────────────────────────
window.COURSE.push({
  day: 5, week: 0,
  title: "POO partie 2 : polymorphisme et interfaces",
  summary: "Traiter des objets différents de la même façon grâce au polymorphisme et aux interfaces, et savoir choisir entre interface, classe abstraite et composition.",
  objectives: [
    "Utiliser le polymorphisme : une List<Shape> dont chaque élément calcule sa propre aire",
    "Déclarer et implémenter des interfaces, y compris plusieurs à la fois et en implémentation explicite",
    "Choisir entre classe abstraite et interface avec un critère clair",
    "Préférer la composition à l'héritage quand la relation n'est pas « est un »",
    "Tester un type avec is, as et le pattern matching simple"
  ],
  lesson: `<h3>Le polymorphisme : un appel, plusieurs comportements</h3>
<p>Hier (B4), tu as vu l'héritage et <code>virtual</code>/<code>override</code>. Le polymorphisme est la récompense : tu manipules des objets à travers leur type de base, et chacun exécute <em>sa propre</em> version de la méthode. Le code qui appelle ne connaît pas le type réel, et n'a pas besoin de le connaître.</p>
<pre><code>abstract class Shape { public abstract double Area(); }
class Circle(double r) : Shape { public override double Area() =&gt; Math.PI * r * r; }
class Square(double side) : Shape { public override double Area() =&gt; side * side; }

List&lt;Shape&gt; shapes = [new Circle(1), new Square(2)];
foreach (var s in shapes) Console.WriteLine(s.Area()); // chaque forme calcule la sienne</code></pre>
<p>Ajouter un <code>Triangle</code> demain ne change pas la boucle : c'est le principe ouvert/fermé en action. En TypeScript, tu obtiens le même effet, mais C# le vérifie à la compilation : une classe qui hérite de <code>Shape</code> sans implémenter <code>Area()</code> ne compile pas.</p>

<h3>Les interfaces : un contrat sans implémentation</h3>
<p>Une interface décrit <em>ce qu'un type sait faire</em>, pas comment. Par convention, son nom commence par <code>I</code>.</p>
<pre><code>public interface IPrintable { void Print(); }
public interface IPriced { decimal Price { get; } }

public class Product(string name, decimal price) : IPrintable, IPriced
{
    public decimal Price =&gt; price;
    public void Print() =&gt; Console.WriteLine($"{name} : {price} €");
}</code></pre>
<p>Différences avec TypeScript à bien retenir :</p>
<ul>
<li><strong>Typage nominal, pas structurel.</strong> En TS, un objet qui « a la bonne forme » satisfait une interface. En C#, la classe doit <em>déclarer</em> qu'elle implémente l'interface (<code>: IPrintable</code>). Avoir une méthode <code>Print()</code> ne suffit pas.</li>
<li><strong>Les interfaces existent à l'exécution.</strong> Tu peux écrire <code>if (obj is IPrintable p)</code>, ce qui est impossible en TS où les interfaces disparaissent à la compilation.</li>
<li><strong>Une classe hérite d'une seule classe mais peut implémenter plusieurs interfaces.</strong></li>
</ul>

<h3>Implémentation explicite</h3>
<p>Si deux interfaces ont un membre de même nom, ou si tu veux cacher un membre de l'API publique de la classe, tu peux l'implémenter explicitement : il n'est alors accessible qu'à travers l'interface.</p>
<pre><code>class Report : IPrintable
{
    void IPrintable.Print() =&gt; Console.WriteLine("Rapport");
}
var r = new Report();
// r.Print();            // erreur de compilation
((IPrintable)r).Print(); // OK</code></pre>

<h3>Membres par défaut (aperçu)</h3>
<p>Depuis C# 8, une interface peut fournir une implémentation par défaut d'une méthode. C'est surtout utile aux auteurs de bibliothèques pour ajouter une méthode à une interface sans casser ceux qui l'implémentent déjà. Dans ton code d'application, reste sur des interfaces sans implémentation : c'est plus lisible.</p>

<h3>Classe abstraite ou interface ?</h3>
<table>
<thead><tr><th>Question</th><th>Classe abstraite</th><th>Interface</th></tr></thead>
<tbody>
<tr><td>Relation</td><td>« est un » (un Cercle <em>est une</em> Forme)</td><td>« sait faire » (un Produit <em>sait s'imprimer</em>)</td></tr>
<tr><td>Code partagé</td><td>Oui : champs, constructeurs, méthodes communes</td><td>Non (sauf membres par défaut, à éviter)</td></tr>
<tr><td>État (champs)</td><td>Oui</td><td>Non</td></tr>
<tr><td>Combien par classe</td><td>Une seule</td><td>Autant que tu veux</td></tr>
<tr><td>Tests / injection</td><td>Moins pratique</td><td>Idéal pour substituer une fausse implémentation</td></tr>
</tbody>
</table>
<p>Règle simple : commence par une interface. Passe à une classe abstraite seulement si plusieurs classes partagent réellement du code et de l'état.</p>

<h3>Composition plutôt qu'héritage</h3>
<p>L'héritage est une relation forte : la classe fille hérite de <em>tout</em>, y compris de ce dont elle n'a pas besoin, et un changement dans la classe mère se propage partout. Quand la relation est « a un » plutôt que « est un », compose :</p>
<pre><code>// Mauvais : une Voiture n'est pas un Moteur
class Car : Engine { }

// Bon : une Voiture a un Moteur
class Car(IEngine engine) { public void Start() =&gt; engine.Start(); }</code></pre>
<p>Avec la composition, tu peux remplacer le moteur (électrique, thermique) sans toucher à <code>Car</code>. Ce sera la base de l'injection de dépendances au jour 8.</p>

<h3>is, as et pattern matching</h3>
<ul>
<li><code>obj is Circle</code> renvoie un <code>bool</code>.</li>
<li><code>obj is Circle c</code> teste <em>et</em> déclare une variable typée : c'est la forme à utiliser.</li>
<li><code>obj as Circle</code> renvoie l'objet converti ou <code>null</code> (uniquement pour les types référence).</li>
<li>Le <code>switch</code> sur le type : <code>shape switch { Circle c =&gt; …, Square s =&gt; …, _ =&gt; … }</code>.</li>
</ul>
<p>Attention : si tu écris beaucoup de <code>if (x is A) … else if (x is B)</code>, c'est souvent le signe qu'une méthode virtuelle ou une interface manque. Le polymorphisme évite ces chaînes de tests.</p>

<div class="note">En entreprise, on code « contre des interfaces » : un service dépend de <code>IEmailSender</code>, pas de <code>SmtpEmailSender</code>. Cela permet de changer d'implémentation et de tester avec un faux. Mais pas d'interface « au cas où » : une interface avec une seule implémentation et aucun test qui la remplace n'apporte rien. Et les hiérarchies d'héritage de plus de deux niveaux sont presque toujours une erreur de conception.</div>`,
  examples: [
    {
      title: "Polymorphisme : une liste de formes",
      code: `abstract class Shape
{
    public abstract string Name { get; }
    public abstract double Area();

    // Méthode commune à toutes les formes
    public override string ToString() => $"{Name} : {Area():F2}";
}

class Circle(double radius) : Shape
{
    public override string Name => "Cercle";
    public override double Area() => Math.PI * radius * radius;
}

class Rectangle(double width, double height) : Shape
{
    public override string Name => "Rectangle";
    public override double Area() => width * height;
}

class Triangle(double b, double h) : Shape
{
    public override string Name => "Triangle";
    public override double Area() => b * h / 2;
}

List<Shape> shapes = [new Circle(1), new Rectangle(2, 3), new Triangle(4, 5)];

double total = 0;
foreach (var shape in shapes)
{
    Console.WriteLine(shape); // appelle ToString(), qui appelle la bonne Area()
    total += shape.Area();
}
Console.WriteLine($"Aire totale : {total:F2}");`,
      explain: "La boucle ne connaît que <code>Shape</code>. Ajouter une forme ne demande aucune modification de la boucle."
    },
    {
      title: "Plusieurs interfaces et implémentation explicite",
      code: `interface IPrintable { void Print(); }
interface IExportable { string Export(); }
interface ILogger { void Print(); } // même nom de méthode que IPrintable

class Invoice(string number, decimal amount) : IPrintable, IExportable, ILogger
{
    // Implémentation normale : accessible directement
    public void Print() => Console.WriteLine($"Facture {number} : {amount} €");

    public string Export() => $"{number};{amount}";

    // Implémentation explicite : seulement via ILogger
    void ILogger.Print() => Console.WriteLine($"[LOG] facture {number} imprimée");
}

var invoice = new Invoice("F-001", 120.50m);
invoice.Print();                     // version IPrintable
((ILogger)invoice).Print();          // version ILogger
Console.WriteLine(invoice.Export());

// Une variable de type interface ne voit que le contrat
IExportable exportable = invoice;
Console.WriteLine(exportable.Export());
// exportable.Print(); // erreur : IExportable ne déclare pas Print`,
      explain: "Une classe peut implémenter plusieurs interfaces. L'implémentation explicite règle les conflits de noms."
    },
    {
      title: "Composition : un moteur interchangeable",
      code: `interface IEngine
{
    string Start();
}

class PetrolEngine : IEngine
{
    public string Start() => "Vroum (essence)";
}

class ElectricEngine : IEngine
{
    public string Start() => "Bzzz (électrique)";
}

// La voiture A un moteur, elle n'EST PAS un moteur
class Car(string model, IEngine engine)
{
    public void Start() => Console.WriteLine($"{model} démarre : {engine.Start()}");
}

new Car("Clio", new PetrolEngine()).Start();
new Car("Zoé", new ElectricEngine()).Start();`,
      explain: "Le comportement varie selon l'objet injecté, sans hiérarchie de classes <code>PetrolCar</code> / <code>ElectricCar</code>."
    },
    {
      title: "is, as et switch sur le type",
      code: `object[] items = [42, "bonjour", 3.14, new List<int> { 1, 2 }, null!];

foreach (var item in items)
{
    // Pattern matching : teste et déclare la variable en une fois
    if (item is string text)
        Console.WriteLine($"Chaîne de {text.Length} caractères");

    // Expression switch sur le type
    string description = item switch
    {
        int n when n > 10 => $"grand entier {n}",
        int n => $"petit entier {n}",
        double d => $"double {d}",
        List<int> list => $"liste de {list.Count} éléments",
        null => "null",
        _ => $"autre : {item.GetType().Name}"
    };
    Console.WriteLine(description);
}

// as : renvoie null si la conversion échoue (pas d'exception)
object o = "texte";
var maybeList = o as List<int>;
Console.WriteLine(maybeList is null ? "pas une liste" : "une liste");`,
      explain: "<code>is Type variable</code> est la forme moderne. <code>as</code> sert surtout quand tu veux un <code>null</code> plutôt qu'une exception."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Des animaux qui parlent",
      prompt: "<p>Crée une classe abstraite <code>Animal</code> avec une propriété <code>Name</code> et une méthode abstraite <code>Speak()</code> qui renvoie une <code>string</code>. Crée <code>Dog</code>, <code>Cat</code> et <code>Cow</code>. Mets-les dans une <code>List&lt;Animal&gt;</code> et affiche « Rex dit : Wouf », etc.</p>",
      hint: "<p>Utilise un constructeur primaire dans <code>Animal</code> : <code>abstract class Animal(string name)</code>, puis <code>class Dog(string name) : Animal(name)</code>.</p>",
      solution: `abstract class Animal(string name)
{
    public string Name => name;
    public abstract string Speak();
}

class Dog(string name) : Animal(name) { public override string Speak() => "Wouf"; }
class Cat(string name) : Animal(name) { public override string Speak() => "Miaou"; }
class Cow(string name) : Animal(name) { public override string Speak() => "Meuh"; }

List<Animal> animals = [new Dog("Rex"), new Cat("Félix"), new Cow("Marguerite")];

foreach (var animal in animals)
    Console.WriteLine($"{animal.Name} dit : {animal.Speak()}");`
    },
    {
      level: "moyen",
      title: "Moyens de paiement",
      prompt: "<p>Déclare une interface <code>IPaymentMethod</code> avec <code>string Name { get; }</code> et <code>bool Pay(decimal amount)</code>. Implémente <code>CreditCard</code> (plafond de 1 000 €), <code>Paypal</code> (solde initial passé au constructeur, diminue à chaque paiement) et <code>Cash</code> (toujours accepté). Écris une méthode <code>Checkout(IPaymentMethod method, decimal amount)</code> qui affiche le résultat, et teste-la avec les trois.</p>",
      hint: "<p><code>Paypal</code> a un état (le solde) : utilise un champ privé modifiable. <code>Checkout</code> ne doit connaître que l'interface.</p>",
      solution: `interface IPaymentMethod
{
    string Name { get; }
    bool Pay(decimal amount);
}

class CreditCard : IPaymentMethod
{
    private const decimal Limit = 1000m;
    public string Name => "Carte bancaire";
    public bool Pay(decimal amount) => amount <= Limit;
}

class Paypal(decimal initialBalance) : IPaymentMethod
{
    private decimal _balance = initialBalance;
    public string Name => "PayPal";

    public bool Pay(decimal amount)
    {
        if (amount > _balance) return false;
        _balance -= amount;
        return true;
    }
}

class Cash : IPaymentMethod
{
    public string Name => "Espèces";
    public bool Pay(decimal amount) => true;
}

static void Checkout(IPaymentMethod method, decimal amount)
{
    var ok = method.Pay(amount);
    Console.WriteLine($"{method.Name} - {amount} € : {(ok ? "accepté" : "refusé")}");
}

var paypal = new Paypal(100m);
Checkout(new CreditCard(), 1500m); // refusé
Checkout(new CreditCard(), 200m);  // accepté
Checkout(paypal, 80m);             // accepté
Checkout(paypal, 80m);             // refusé, solde = 20
Checkout(new Cash(), 5000m);       // accepté`
    },
    {
      level: "difficile",
      title: "Remplacer un héritage par de la composition",
      prompt: "<p>On te donne ce code : <code>class Employee</code>, puis <code>class Manager : Employee</code>, <code>class Developer : Employee</code>, <code>class ManagerDeveloper : Manager</code> qui recopie le code du développeur. Réécris-le avec une seule classe <code>Employee</code> qui possède une liste de rôles <code>IRole</code> (chaque rôle a un <code>Title</code> et une méthode <code>decimal Bonus(decimal salary)</code>). Le bonus total est la somme des bonus des rôles. Manager : 10 % du salaire. Développeur : 500 € fixe. Affiche le bonus d'un employé qui cumule les deux rôles.</p>",
      hint: "<p><code>class Employee(string name, decimal salary, List&lt;IRole&gt; roles)</code>. La somme peut se faire avec une boucle <code>foreach</code> (LINQ viendra au jour 4).</p>",
      solution: `interface IRole
{
    string Title { get; }
    decimal Bonus(decimal salary);
}

class ManagerRole : IRole
{
    public string Title => "Manager";
    public decimal Bonus(decimal salary) => salary * 0.10m;
}

class DeveloperRole : IRole
{
    public string Title => "Développeur";
    public decimal Bonus(decimal salary) => 500m;
}

class Employee(string name, decimal salary, List<IRole> roles)
{
    public decimal TotalBonus()
    {
        decimal total = 0;
        foreach (var role in roles)
            total += role.Bonus(salary);
        return total;
    }

    public void Describe()
    {
        var titles = string.Join(" + ", roles.Select(r => r.Title));
        Console.WriteLine($"{name} ({titles}) : bonus {TotalBonus()} €");
    }
}

// Un employé peut cumuler les rôles sans nouvelle classe
new Employee("Alice", 4000m, [new ManagerRole(), new DeveloperRole()]).Describe(); // 900 €
new Employee("Bob", 3000m, [new DeveloperRole()]).Describe();                       // 500 €
// Ajouter un rôle "Formateur" = une nouvelle classe IRole, rien d'autre à changer`
    }
  ],
  project: `<p><strong>Bibliothèque : l'interface <code>IBorrowable</code>.</strong></p>
<ul>
<li>Crée l'interface <code>IBorrowable</code> avec <code>bool IsAvailable { get; }</code>, <code>int MaxLoanDays { get; }</code>, <code>void Borrow()</code> et <code>void Return()</code>.</li>
<li>Fais implémenter <code>IBorrowable</code> par <code>Book</code> (21 jours) et <code>Magazine</code> (7 jours), qui héritent toujours de <code>Media</code>.</li>
<li>Ajoute une classe <code>Dvd</code> qui hérite de <code>Media</code> mais n'est <em>pas</em> empruntable (consultation sur place).</li>
<li>Dans <code>Library</code>, ajoute une méthode <code>ListBorrowable()</code> qui parcourt tous les médias et n'affiche que ceux qui sont <code>IBorrowable</code> et disponibles (utilise <code>is IBorrowable b</code>).</li>
<li>Dans le menu console, l'option « Emprunter » appelle <code>Borrow()</code> sans savoir si c'est un livre ou un magazine.</li>
</ul>`,
  resources: [
    { label: "Interfaces (guide C#)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/types/interfaces" },
    { label: "Polymorphisme", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/object-oriented/polymorphism" },
    { label: "Pattern matching", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/functional/pattern-matching" }
  ]
});

// ───────────────────────── B6 ─────────────────────────
window.COURSE.push({
  day: 6, week: 0,
  title: "Types valeur, types référence : class, struct, record",
  summary: "Comprendre ce qui est copié et ce qui est partagé, puis choisir sans hésiter entre class, struct, record et record struct.",
  objectives: [
    "Expliquer la différence entre type valeur et type référence avec la pile et le tas",
    "Prédire le résultat d'une copie ou d'un passage en paramètre",
    "Comparer l'égalité par référence (class) et par valeur (record, struct)",
    "Utiliser record, with, la déconstruction et le ToString généré",
    "Choisir le bon type : class, record, struct, record struct ou readonly record struct"
  ],
  lesson: `<h3>Deux familles de types</h3>
<p>En C#, chaque type appartient à une de ces deux familles. C'est la notion la plus importante de la semaine, car elle détermine ce qui se passe quand tu écris <code>b = a</code>.</p>
<ul>
<li><strong>Types valeur</strong> : <code>int</code>, <code>double</code>, <code>bool</code>, <code>decimal</code>, <code>DateTime</code>, les <code>enum</code>, les <code>struct</code> et les <code>record struct</code>. La variable <em>contient directement la donnée</em>.</li>
<li><strong>Types référence</strong> : <code>string</code>, les tableaux, <code>List&lt;T&gt;</code>, les <code>class</code> et les <code>record</code> (record class). La variable contient <em>l'adresse</em> d'un objet situé ailleurs en mémoire.</li>
</ul>

<h3>La pile et le tas, version simple</h3>
<p>Imagine deux zones de mémoire :</p>
<ul>
<li>La <strong>pile</strong> (stack) : petite, très rapide, nettoyée automatiquement quand la méthode se termine. Les variables locales y vivent.</li>
<li>Le <strong>tas</strong> (heap) : grand, géré par le ramasse-miettes (GC). Les objets créés avec <code>new</code> d'une <code>class</code> y vivent.</li>
</ul>
<p>Pour un <code>int x = 5</code>, la case de <code>x</code> contient 5. Pour <code>var p = new Person()</code>, la case de <code>p</code> contient une flèche vers l'objet <code>Person</code> sur le tas. (Précision : une struct dans un champ de classe vit sur le tas avec cette classe. Retiens surtout le comportement de copie, c'est lui qui compte.)</p>

<h3>Copie : ce qui change tout</h3>
<pre><code>struct PointS { public int X; }
class PointC { public int X; }

var s1 = new PointS { X = 1 };
var s2 = s1;   // copie de la VALEUR
s2.X = 99;
Console.WriteLine(s1.X); // 1  : s1 n'a pas bougé

var c1 = new PointC { X = 1 };
var c2 = c1;   // copie de la RÉFÉRENCE : deux flèches vers le même objet
c2.X = 99;
Console.WriteLine(c1.X); // 99 : c'est le même objet</code></pre>
<p>Si tu viens de JavaScript : les objets JS se comportent comme des <code>class</code> C# (on partage la référence), et les nombres comme des types valeur. La nouveauté, c'est que C# te laisse créer tes propres types valeur avec <code>struct</code>.</p>

<h3>Passage en paramètre</h3>
<p>Par défaut, C# passe toujours <em>une copie de la variable</em>. Pour un type valeur, la méthode reçoit une copie de la donnée et ne peut pas modifier l'original. Pour un type référence, la méthode reçoit une copie de la flèche : elle peut modifier l'objet pointé, mais pas faire pointer ta variable ailleurs. Les mots-clés <code>ref</code> et <code>out</code> permettent de passer la variable elle-même, mais tu en auras rarement besoin.</p>

<h3>L'égalité : par référence ou par valeur</h3>
<ul>
<li><code>class</code> : <code>==</code> compare les <em>adresses</em>. Deux objets <code>new Person("Ana")</code> avec le même contenu sont différents.</li>
<li><code>record</code>, <code>struct</code>, <code>record struct</code> : l'égalité compare <em>le contenu</em>. Deux <code>record</code> avec les mêmes valeurs sont égaux.</li>
</ul>

<h3>Le record : une classe faite pour les données</h3>
<pre><code>public record Person(string FirstName, string LastName);</code></pre>
<p>Cette seule ligne génère : un constructeur, des propriétés <code>init</code> (modifiables seulement à la création), l'égalité par valeur (<code>Equals</code>, <code>==</code>, <code>GetHashCode</code>), un <code>ToString()</code> lisible (<code>Person { FirstName = Ana, LastName = Diaz }</code>) et une méthode <code>Deconstruct</code>.</p>
<ul>
<li><strong>with</strong> : crée une copie avec quelques propriétés changées. <code>var p2 = p1 with { LastName = "Martin" };</code> Le record d'origine ne change pas : c'est l'esprit immuable, comme le spread <code>{ ...p1, lastName: "Martin" }</code> en TypeScript.</li>
<li><strong>Déconstruction</strong> : <code>var (first, last) = p1;</code></li>
<li>Un <code>record</code> reste un <strong>type référence</strong> (c'est une classe). Seule l'égalité change.</li>
</ul>

<h3>record struct et readonly record struct</h3>
<p><code>record struct</code> donne les mêmes avantages (égalité, ToString, with) sur un type valeur. Attention : un <code>record struct</code> positionnel est <em>modifiable</em> par défaut. Ajoute <code>readonly</code> pour le rendre immuable : <code>public readonly record struct Money(decimal Amount, string Currency);</code></p>

<h3>Le grand tableau comparatif</h3>
<table>
<thead><tr><th></th><th>class</th><th>struct</th><th>record (class)</th><th>record struct</th><th>readonly record struct</th></tr></thead>
<tbody>
<tr><td>Famille</td><td>référence</td><td>valeur</td><td>référence</td><td>valeur</td><td>valeur</td></tr>
<tr><td><code>b = a</code></td><td>partage l'objet</td><td>copie</td><td>partage l'objet</td><td>copie</td><td>copie</td></tr>
<tr><td>Égalité <code>==</code></td><td>même adresse</td><td>non défini par défaut (<code>Equals</code> compare les champs)</td><td>même contenu</td><td>même contenu</td><td>même contenu</td></tr>
<tr><td>Immuable par défaut</td><td>non</td><td>non</td><td>oui (positionnel, <code>init</code>)</td><td>non</td><td>oui</td></tr>
<tr><td><code>with</code></td><td>non</td><td>oui</td><td>oui</td><td>oui</td><td>oui</td></tr>
<tr><td>ToString lisible</td><td>non (nom du type)</td><td>non</td><td>oui</td><td>oui</td><td>oui</td></tr>
<tr><td>Héritage</td><td>oui</td><td>non</td><td>oui (entre records)</td><td>non</td><td>non</td></tr>
<tr><td>Peut être null</td><td>oui</td><td>non (sauf <code>T?</code>)</td><td>oui</td><td>non</td><td>non</td></tr>
</tbody>
</table>

<h3>Quand utiliser quoi</h3>
<ul>
<li><strong>class</strong> : une <em>entité</em> qui a une identité et évolue dans le temps. Un client reste le même client même s'il change d'adresse. Exemples : <code>Customer</code>, <code>Order</code>, <code>Library</code>, un service.</li>
<li><strong>record</strong> : une donnée définie par son contenu. Exemples : un DTO d'API (<code>CreateOrderRequest</code>), un <em>value object</em> (<code>Address</code>, <code>Isbn</code>), un résultat, un message. Deux adresses identiques sont la même adresse.</li>
<li><strong>readonly record struct</strong> : un petit type mathématique ou de mesure, de quelques champs, très utilisé. Exemples : <code>Money</code>, <code>Point</code>, <code>Temperature</code>, <code>Coordinates</code>.</li>
<li><strong>struct</strong> classique : rare dans le code d'application. Réservé à l'optimisation de performance.</li>
</ul>
<p>Si tu hésites : <code>class</code> pour ce qui a un cycle de vie, <code>record</code> pour tout le reste.</p>

<h3>Le boxing, en bref</h3>
<p>Quand un type valeur est rangé dans une variable de type <code>object</code> ou d'interface, C# le copie dans une « boîte » sur le tas : c'est le <em>boxing</em>. <code>object o = 42;</code> crée une allocation. Ce n'est pas grave ponctuellement, mais dans une boucle chaude cela coûte. Les génériques (<code>List&lt;int&gt;</code>) évitent ce problème, contrairement à l'ancien <code>ArrayList</code>.</p>

<div class="note">Le bug classique en entreprise : un objet de type <code>class</code> partagé entre deux parties du code, modifié par l'une, et l'autre voit le changement sans s'y attendre. Les records immuables suppriment cette famille de bugs. Pratique pro : DTO et value objects en <code>record</code>, entités en <code>class</code> avec des setters privés, et jamais de <code>struct</code> modifiable (copies silencieuses et modifications perdues).</div>`,
  examples: [
    {
      title: "Copie d'un type valeur vs copie d'un type référence",
      code: `var a = new PointStruct(1, 2);
var b = a;          // copie complète
b.X = 100;
Console.WriteLine($"struct : a.X = {a.X}, b.X = {b.X}"); // 1 et 100

var c = new PointClass(1, 2);
var d = c;          // même objet
d.X = 100;
Console.WriteLine($"class  : c.X = {c.X}, d.X = {d.X}"); // 100 et 100

// Passage en paramètre
void Move(PointStruct p) => p.X = -1; // modifie une copie
void MoveRef(PointClass p) => p.X = -1; // modifie l'objet partagé

Move(a);
MoveRef(c);
Console.WriteLine($"après Move : a.X = {a.X}, c.X = {c.X}"); // 1 et -1

struct PointStruct(int x, int y)
{
    public int X = x;
    public int Y = y;
}

class PointClass(int x, int y)
{
    public int X = x;
    public int Y = y;
}`,
      explain: "Exécute ce programme et vérifie chaque valeur affichée avant de lire la suite. Les déclarations de types se placent après les instructions de haut niveau."
    },
    {
      title: "Égalité : class vs record",
      code: `var c1 = new PersonClass("Ana", "Diaz");
var c2 = new PersonClass("Ana", "Diaz");
Console.WriteLine(c1 == c2);           // False : deux objets différents
Console.WriteLine(c1);                 // PersonClass (nom du type seulement)

var r1 = new PersonRecord("Ana", "Diaz");
var r2 = new PersonRecord("Ana", "Diaz");
Console.WriteLine(r1 == r2);           // True : même contenu
Console.WriteLine(ReferenceEquals(r1, r2)); // False : ce sont bien deux objets
Console.WriteLine(r1);                 // PersonRecord { FirstName = Ana, LastName = Diaz }

// Les records fonctionnent bien comme clés de dictionnaire ou dans un HashSet
var set = new HashSet<PersonRecord> { r1, r2 };
Console.WriteLine(set.Count);          // 1

class PersonClass(string firstName, string lastName)
{
    public string FirstName { get; } = firstName;
    public string LastName { get; } = lastName;
}

record PersonRecord(string FirstName, string LastName);`,
      explain: "Le record génère <code>Equals</code>, <code>GetHashCode</code>, <code>==</code> et <code>ToString</code> à partir de ses propriétés."
    },
    {
      title: "with, déconstruction et immutabilité",
      code: `var address = new Address("10 rue de Paris", "Lyon", "69001");

// address.City = "Nice"; // erreur : les propriétés sont init-only

// with crée une NOUVELLE instance
var moved = address with { City = "Nice", ZipCode = "06000" };
Console.WriteLine(address); // l'original n'a pas changé
Console.WriteLine(moved);

// Déconstruction
var (street, city, zip) = moved;
Console.WriteLine($"{street} / {city} / {zip}");

// Un record peut avoir des membres en plus
Console.WriteLine(moved.Format());

record Address(string Street, string City, string ZipCode)
{
    public string Format() => $"{Street}, {ZipCode} {City}";
}`,
      explain: "<code>with</code> est l'équivalent de <code>{ ...address, city: 'Nice' }</code> en TypeScript."
    },
    {
      title: "readonly record struct pour un type mathématique",
      code: `var price = new Money(19.99m, "EUR");
var shipping = new Money(5m, "EUR");

var total = price + shipping;
Console.WriteLine(total);                       // Money { Amount = 24.99, Currency = EUR }
Console.WriteLine(total == new Money(24.99m, "EUR")); // True

// Erreur métier détectée tout de suite
try
{
    var bad = price + new Money(10m, "USD");
}
catch (InvalidOperationException ex)
{
    Console.WriteLine(ex.Message);
}

readonly record struct Money(decimal Amount, string Currency)
{
    public static Money operator +(Money a, Money b)
    {
        if (a.Currency != b.Currency)
            throw new InvalidOperationException($"Devises différentes : {a.Currency} et {b.Currency}");
        return new Money(a.Amount + b.Amount, a.Currency);
    }
}`,
      explain: "Petit, immuable, comparé par valeur, sans allocation sur le tas : le cas idéal pour un <code>readonly record struct</code>."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Prédire les résultats",
      prompt: `<p>Sans exécuter le code, écris ce qu'affiche chaque ligne, puis vérifie :</p>
<pre><code>int x = 10; int y = x; y++;
Console.WriteLine(x);

int[] t1 = [1, 2, 3]; int[] t2 = t1; t2[0] = 99;
Console.WriteLine(t1[0]);

string s1 = "abc"; string s2 = s1; s2 += "d";
Console.WriteLine(s1);

var p1 = new P(1); var p2 = new P(1);
Console.WriteLine(p1 == p2);

record P(int V);</code></pre>`,
      hint: "<p>Les tableaux sont des types référence. Les <code>string</code> aussi, mais elles sont immuables : <code>+=</code> crée une nouvelle chaîne.</p>",
      solution: `// 10    : int est un type valeur, y est une copie
// 99    : un tableau est un type référence, t1 et t2 pointent sur le même tableau
// abc   : string est un type référence MAIS immuable ; s2 += "d" crée une nouvelle chaîne
// True  : un record compare par valeur

int x = 10; int y = x; y++;
Console.WriteLine(x);      // 10

int[] t1 = [1, 2, 3]; int[] t2 = t1; t2[0] = 99;
Console.WriteLine(t1[0]);  // 99

string s1 = "abc"; string s2 = s1; s2 += "d";
Console.WriteLine(s1);     // abc

var p1 = new P(1); var p2 = new P(1);
Console.WriteLine(p1 == p2); // True

record P(int V);`
    },
    {
      level: "moyen",
      title: "Choisir le bon type",
      prompt: `<p>Pour chacun de ces concepts, choisis <code>class</code>, <code>record</code> ou <code>readonly record struct</code>, justifie en une phrase, puis écris la déclaration :</p>
<ol>
<li>Un client de boutique en ligne (id, nom, email modifiable)</li>
<li>La requête HTTP de création d'un produit (nom, prix, catégorie)</li>
<li>Une coordonnée GPS (latitude, longitude)</li>
<li>Une adresse postale</li>
<li>Un panier qui accumule des articles</li>
</ol>`,
      hint: "<p>Pose-toi la question : « deux instances avec le même contenu sont-elles la même chose ? » Si oui, record. Si l'objet a une identité et change dans le temps, class.</p>",
      solution: `// 1. Client : entité avec une identité (Id), qui évolue → class
class Customer(Guid id, string name, string email)
{
    public Guid Id { get; } = id;
    public string Name { get; private set; } = name;
    public string Email { get; private set; } = email;

    public void ChangeEmail(string newEmail) => Email = newEmail;
}

// 2. Requête d'API : simple transport de données → record
record CreateProductRequest(string Name, decimal Price, string Category);

// 3. Coordonnée GPS : petit type mathématique, immuable → readonly record struct
readonly record struct GeoPoint(double Latitude, double Longitude);

// 4. Adresse : value object, définie par son contenu → record
record Address(string Street, string City, string ZipCode, string Country);

// 5. Panier : état qui change (on ajoute/retire des articles) → class
class Cart
{
    private readonly List<CartItem> _items = [];
    public IReadOnlyList<CartItem> Items => _items;
    public void Add(CartItem item) => _items.Add(item);
}

// Une ligne de panier est une donnée → record
record CartItem(string ProductName, int Quantity, decimal UnitPrice);`
    },
    {
      level: "difficile",
      title: "Le piège de la struct modifiable",
      prompt: `<p>Ce code ne fait pas ce qu'on attend. Explique pourquoi, puis corrige-le de deux façons : (a) en transformant <code>Counter</code> en class, (b) en le gardant en type valeur mais immuable (<code>readonly record struct</code>) avec une méthode <code>Increment()</code> qui renvoie un nouveau compteur.</p>
<pre><code>var counters = new List&lt;Counter&gt; { new Counter() };
var c = counters[0];
c.Value++;
Console.WriteLine(counters[0].Value); // on attend 1

struct Counter { public int Value; }</code></pre>`,
      hint: "<p><code>counters[0]</code> renvoie une <em>copie</em> de la struct. Pour la version (b), il faut réaffecter l'élément de la liste.</p>",
      solution: `// Pourquoi : Counter est une struct (type valeur).
// var c = counters[0] copie la valeur ; c.Value++ modifie la copie.
// L'élément dans la liste vaut toujours 0. C'est une modification perdue silencieuse.

// (a) En class : c et counters[0] désignent le même objet
var list1 = new List<CounterClass> { new CounterClass() };
var c1 = list1[0];
c1.Value++;
Console.WriteLine(list1[0].Value); // 1

// (b) Type valeur immuable : on remplace explicitement l'élément
var list2 = new List<CounterValue> { new CounterValue(0) };
list2[0] = list2[0].Increment();
Console.WriteLine(list2[0].Value); // 1
// list2[0].Value++; // ne compile pas : la struct est readonly, le piège est impossible

class CounterClass { public int Value; }

readonly record struct CounterValue(int Value)
{
    public CounterValue Increment() => this with { Value = Value + 1 };
}`
    }
  ],
  project: `<p><strong>Bibliothèque : records pour les données.</strong></p>
<ul>
<li>Crée <code>record Isbn(string Value)</code> avec une validation dans le constructeur : 13 chiffres, sinon <code>ArgumentException</code>. Indice : <code>record Isbn { public string Value { get; } public Isbn(string value) { … Value = value; } }</code>.</li>
<li>Remplace la propriété <code>string Isbn</code> de <code>Book</code> par ce type.</li>
<li>Crée <code>record Loan(Isbn Isbn, string MemberId, DateOnly StartDate, DateOnly DueDate)</code>.</li>
<li>Garde <code>Book</code>, <code>Member</code> et <code>Library</code> en <code>class</code> : ce sont des entités.</li>
<li>Dans le <code>Main</code>, démontre la différence : deux <code>Isbn</code> avec la même valeur sont égaux, deux <code>Book</code> créés avec les mêmes données ne le sont pas.</li>
<li>Prolonge un emprunt avec <code>with</code> : <code>var extended = loan with { DueDate = loan.DueDate.AddDays(7) };</code> et affiche les deux emprunts.</li>
</ul>`,
  resources: [
    { label: "Records (référence C#)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/record" },
    { label: "Types structure (struct)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/struct" },
    { label: "Types valeur", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/value-types" },
    { label: "Choisir entre class et struct", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/design-guidelines/choosing-between-class-and-struct" }
  ]
});

// ───────────────────────── B7 ─────────────────────────
window.COURSE.push({
  day: 7, week: 0,
  title: "Enums, null, exceptions et chaînes",
  summary: "Les outils du quotidien : enums, gestion du null, exceptions et manipulation de chaînes, puis le bilan de la semaine 0.",
  objectives: [
    "Déclarer et utiliser des enums, et reconnaître un enum [Flags]",
    "Gérer null avec int?, string?, ?., ?? et ??= et lire les avertissements du compilateur",
    "Lever et intercepter des exceptions correctement, sans les avaler",
    "Manipuler les chaînes : méthodes utiles, comparaison, StringBuilder",
    "Faire le bilan de la semaine 0 avant d'attaquer le jour 1"
  ],
  lesson: `<h3>Les enums</h3>
<p>Un <code>enum</code> est un ensemble de constantes nommées. Il remplace les « chaînes magiques » et les entiers sans signification.</p>
<pre><code>public enum OrderStatus { Pending, Paid, Shipped, Cancelled }

var status = OrderStatus.Paid;
Console.WriteLine(status);        // Paid
Console.WriteLine((int)status);   // 1
var parsed = Enum.Parse&lt;OrderStatus&gt;("Shipped");</code></pre>
<p>Contrairement aux enums TypeScript, un enum C# est un <strong>type valeur</strong> basé sur un entier, et la conversion depuis un entier n'est pas vérifiée : <code>(OrderStatus)42</code> compile. Utilise <code>Enum.IsDefined</code> ou <code>Enum.TryParse</code> pour valider une valeur qui vient de l'extérieur.</p>
<p>Le <code>switch</code> sur un enum est très lisible :</p>
<pre><code>string label = status switch
{
    OrderStatus.Pending =&gt; "En attente",
    OrderStatus.Paid =&gt; "Payée",
    _ =&gt; "Autre"
};</code></pre>
<p><strong>[Flags] (aperçu)</strong> : quand plusieurs valeurs peuvent être combinées, on utilise des puissances de 2 et l'opérateur <code>|</code>. Exemple : <code>Permissions.Read | Permissions.Write</code>, puis <code>perms.HasFlag(Permissions.Write)</code>.</p>

<h3>null et les types nullables</h3>
<p>Deux cas à distinguer :</p>
<ul>
<li><strong>Types valeur</strong> : un <code>int</code> ne peut pas être null. <code>int?</code> (raccourci de <code>Nullable&lt;int&gt;</code>) peut l'être. Propriétés utiles : <code>HasValue</code>, <code>Value</code>, <code>GetValueOrDefault()</code>.</li>
<li><strong>Types référence</strong> : avec les <em>nullable reference types</em> (activés par défaut dans les nouveaux projets), <code>string</code> signifie « jamais null » et <code>string?</code> signifie « peut être null ». C'est une vérification du compilateur, comme <code>strictNullChecks</code> en TypeScript : elle produit des <strong>avertissements</strong>, pas des erreurs à l'exécution.</li>
</ul>
<p>Les opérateurs, que tu connais déjà en TypeScript :</p>
<ul>
<li><code>a?.B</code> : accès conditionnel, renvoie null si <code>a</code> est null.</li>
<li><code>a ?? b</code> : valeur de repli si <code>a</code> est null.</li>
<li><code>a ??= b</code> : affecte <code>b</code> seulement si <code>a</code> est null.</li>
<li><code>a!</code> : « je sais que ce n'est pas null ». Il fait taire l'avertissement sans rien vérifier : à utiliser très rarement.</li>
</ul>
<p>Avertissements courants : <strong>CS8618</strong> (propriété non nullable non initialisée à la sortie du constructeur), <strong>CS8602</strong> (déréférencement d'une valeur possiblement null), <strong>CS8604</strong> (argument possiblement null). Traite-les comme des erreurs : ce sont des <code>NullReferenceException</code> en attente.</p>

<h3>Les exceptions</h3>
<p>Une exception signale qu'une opération <em>ne peut pas</em> se dérouler normalement. La syntaxe ressemble à JavaScript, avec des types d'exception précis :</p>
<pre><code>try
{
    var n = int.Parse(input);
}
catch (FormatException ex)
{
    Console.WriteLine($"Pas un nombre : {ex.Message}");
}
finally
{
    Console.WriteLine("Toujours exécuté");
}</code></pre>
<table>
<thead><tr><th>Exception</th><th>Quand la lever</th></tr></thead>
<tbody>
<tr><td><code>ArgumentException</code></td><td>Un argument a une valeur invalide</td></tr>
<tr><td><code>ArgumentNullException</code></td><td>Un argument est null alors qu'il ne devrait pas</td></tr>
<tr><td><code>ArgumentOutOfRangeException</code></td><td>Valeur hors des bornes (quantité négative…)</td></tr>
<tr><td><code>InvalidOperationException</code></td><td>L'objet n'est pas dans le bon état (emprunter un livre déjà emprunté)</td></tr>
<tr><td><code>KeyNotFoundException</code></td><td>Clé absente d'un dictionnaire</td></tr>
<tr><td><code>NotSupportedException</code></td><td>Opération non prise en charge</td></tr>
</tbody>
</table>
<p>Les helpers modernes évitent du code répétitif : <code>ArgumentNullException.ThrowIfNull(name);</code>, <code>ArgumentException.ThrowIfNullOrWhiteSpace(title);</code>, <code>ArgumentOutOfRangeException.ThrowIfNegative(quantity);</code>.</p>
<p>Règles importantes :</p>
<ul>
<li><strong>N'avale jamais une exception</strong> : un <code>catch { }</code> vide cache les bugs.</li>
<li>Intercepte seulement ce que tu sais traiter, au bon endroit (souvent tout en haut : menu, contrôleur).</li>
<li>Pour relancer, écris <code>throw;</code> et pas <code>throw ex;</code>, qui efface la pile d'appels d'origine.</li>
<li>Pour un cas prévisible, préfère une méthode <code>TryXxx</code> : <code>int.TryParse(input, out var n)</code> plutôt que <code>try { int.Parse(...) }</code>.</li>
</ul>

<h3>Les chaînes</h3>
<p>Une <code>string</code> est immuable : chaque modification crée une nouvelle chaîne. Méthodes utiles : <code>Trim()</code>, <code>ToUpperInvariant()</code>, <code>Contains()</code>, <code>StartsWith()</code>, <code>Replace()</code>, <code>Split()</code>, <code>string.Join()</code>, <code>string.IsNullOrWhiteSpace()</code>, <code>PadLeft()</code>, <code>Substring()</code> ou les plages <code>s[..3]</code>.</p>
<ul>
<li><strong>Interpolation</strong> : <code>$"Total : {total:C}"</code> avec des formats (<code>:F2</code>, <code>:C</code>, <code>:yyyy-MM-dd</code>).</li>
<li><strong>Comparaison</strong> : <code>==</code> compare le contenu (pas les références, contrairement aux autres classes). Pour ignorer la casse : <code>string.Equals(a, b, StringComparison.OrdinalIgnoreCase)</code>, plutôt que <code>a.ToLower() == b.ToLower()</code>.</li>
<li><strong>StringBuilder</strong> : pour construire une chaîne dans une boucle. Concaténer 10 000 fois avec <code>+=</code> crée 10 000 chaînes intermédiaires.</li>
</ul>

<h3>Bilan de la semaine 0</h3>
<p>Tu sais maintenant : écrire un programme console, utiliser les types et les collections de base, créer des classes avec propriétés et constructeurs, utiliser l'héritage, le polymorphisme et les interfaces, distinguer types valeur et types référence, choisir entre class et record, et gérer null et les erreurs. Le jour 1 reprend tout cela plus en profondeur (outillage <code>dotnet</code>, organisation d'une solution, puis records, génériques et LINQ). Si un point de cette semaine reste flou, refais l'exercice difficile correspondant avant de continuer.</p>

<div class="note">En production, une exception non gérée doit remonter jusqu'à un gestionnaire global qui la journalise ; on ne met pas des <code>try/catch</code> dans chaque méthode. Les exceptions sont réservées à l'exceptionnel : pour un cas métier prévisible (stock insuffisant, livre déjà emprunté), beaucoup d'équipes renvoient un résultat explicite plutôt qu'une exception (tu verras le Result pattern au jour 20). Et active <code>&lt;TreatWarningsAsErrors&gt;</code> pour les avertissements de nullabilité sur un nouveau projet.</div>`,
  examples: [
    {
      title: "Enum, switch et [Flags]",
      code: `var order = OrderStatus.Shipped;

string label = order switch
{
    OrderStatus.Pending => "En attente de paiement",
    OrderStatus.Paid => "Payée",
    OrderStatus.Shipped => "Expédiée",
    OrderStatus.Cancelled => "Annulée",
    _ => throw new ArgumentOutOfRangeException(nameof(order))
};
Console.WriteLine(label);

// Parcourir toutes les valeurs
foreach (var s in Enum.GetValues<OrderStatus>())
    Console.WriteLine($"{(int)s} = {s}");

// Valider une saisie utilisateur
if (Enum.TryParse<OrderStatus>("paid", ignoreCase: true, out var parsed))
    Console.WriteLine($"Lu : {parsed}");

// [Flags] : combinaison de valeurs
var perms = Permissions.Read | Permissions.Write;
Console.WriteLine(perms);                              // Read, Write
Console.WriteLine(perms.HasFlag(Permissions.Delete));  // False

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

[Flags]
enum Permissions
{
    None = 0,
    Read = 1,
    Write = 2,
    Delete = 4
}`,
      explain: "Le <code>_ =&gt; throw</code> final signale tout de suite une valeur imprévue au lieu de l'ignorer."
    },
    {
      title: "Gérer null proprement",
      code: `int? age = null;
Console.WriteLine(age.HasValue);              // False
Console.WriteLine(age ?? 18);                 // 18
Console.WriteLine(age.GetValueOrDefault());   // 0

User? user = FindUser("bob");                 // peut renvoyer null

// ?. puis ?? : pas de NullReferenceException
string city = user?.Address?.City ?? "inconnue";
Console.WriteLine($"Ville : {city}");

// Le compilateur suit les tests de null
if (user is not null)
    Console.WriteLine(user.Name);             // aucun avertissement ici

// ??= : initialisation paresseuse
List<string>? tags = null;
tags ??= [];
tags.Add("nouveau");
Console.WriteLine(tags.Count);

static User? FindUser(string name) =>
    name == "ana" ? new User("ana", new Address("Lyon")) : null;

record Address(string City);
record User(string Name, Address? Address);`,
      explain: "<code>Address?</code> dit clairement « l'adresse est facultative ». Le compilateur t'oblige à gérer ce cas."
    },
    {
      title: "Exceptions : lever, intercepter, ne pas avaler",
      code: `var account = new BankAccount(100m);

try
{
    account.Withdraw(30m);
    account.Withdraw(-5m);   // ArgumentOutOfRangeException
}
catch (ArgumentOutOfRangeException ex)
{
    Console.WriteLine($"Montant invalide : {ex.Message}");
}

try
{
    account.Withdraw(500m);  // InvalidOperationException
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Opération impossible : {ex.Message}");
}
finally
{
    Console.WriteLine($"Solde final : {account.Balance} €");
}

// Cas prévisible : TryParse plutôt qu'une exception
Console.Write("Montant : ");
if (decimal.TryParse(Console.ReadLine(), out var amount))
    Console.WriteLine($"Vous avez saisi {amount}");
else
    Console.WriteLine("Saisie invalide");

class BankAccount(decimal initialBalance)
{
    public decimal Balance { get; private set; } = initialBalance;

    public void Withdraw(decimal amount)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);

        if (amount > Balance)
            throw new InvalidOperationException($"Solde insuffisant ({Balance} €) pour retirer {amount} €");

        Balance -= amount;
    }
}`,
      explain: "Chaque <code>catch</code> cible un type précis. Les helpers <code>ThrowIfXxx</code> remplacent les <code>if … throw</code> répétitifs."
    },
    {
      title: "Chaînes, comparaison et StringBuilder",
      code: `using System.Text;

string raw = "  Clean Code, Refactoring ,The Pragmatic Programmer  ";

// Découper, nettoyer, recomposer
string[] titles = raw.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
Console.WriteLine(string.Join(" | ", titles));

// Comparaison sans tenir compte de la casse
bool same = string.Equals("dotnet", "DotNet", StringComparison.OrdinalIgnoreCase);
Console.WriteLine(same); // True

// Méthodes courantes
string title = titles[2];
Console.WriteLine(title.ToUpperInvariant());
Console.WriteLine(title.StartsWith("The"));
Console.WriteLine(title[..7]);                    // "The Pra"
Console.WriteLine(string.IsNullOrWhiteSpace("  ")); // True

// Formats dans l'interpolation
decimal price = 1234.5m;
Console.WriteLine($"Prix : {price:F2} - Date : {DateTime.Now:yyyy-MM-dd}");

// StringBuilder pour construire un texte dans une boucle
var sb = new StringBuilder();
for (int i = 1; i <= 5; i++)
    sb.AppendLine($"Ligne {i}".PadRight(10, '.') + i * i);
Console.Write(sb.ToString());`,
      explain: "<code>StringComparison.OrdinalIgnoreCase</code> est plus correct et plus rapide que <code>ToLower()</code> des deux côtés."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Jours de la semaine",
      prompt: "<p>Crée un enum <code>WorkDay</code> (Monday à Sunday). Écris une méthode <code>IsWeekend(WorkDay day)</code> avec une expression <code>switch</code>. Demande un jour à l'utilisateur (texte), convertis-le avec <code>Enum.TryParse</code> sans tenir compte de la casse, et affiche « week-end », « semaine » ou « jour inconnu ».</p>",
      hint: "<p>Un pattern <code>or</code> est possible : <code>WorkDay.Saturday or WorkDay.Sunday =&gt; true</code>.</p>",
      solution: `Console.Write("Jour (en anglais) : ");
string? input = Console.ReadLine();

if (Enum.TryParse<WorkDay>(input, ignoreCase: true, out var day) && Enum.IsDefined(day))
    Console.WriteLine(IsWeekend(day) ? "week-end" : "semaine");
else
    Console.WriteLine("jour inconnu");

static bool IsWeekend(WorkDay day) => day switch
{
    WorkDay.Saturday or WorkDay.Sunday => true,
    _ => false
};

enum WorkDay { Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday }

// Note : Enum.IsDefined écarte les saisies numériques hors bornes comme "42",
// que TryParse accepte.`
    },
    {
      level: "moyen",
      title: "Saisie robuste",
      prompt: "<p>Écris une méthode <code>int ReadInt(string prompt, int min, int max)</code> qui redemande la saisie tant qu'elle n'est pas un entier compris entre <code>min</code> et <code>max</code>, sans utiliser <code>try/catch</code>. Elle lève une <code>ArgumentException</code> si <code>min &gt; max</code>. Utilise-la pour demander un âge (0-120) puis une quantité (1-99), et gère le cas où <code>Console.ReadLine()</code> renvoie null (fin d'entrée).</p>",
      hint: "<p><code>int.TryParse</code> accepte un <code>string?</code>. Pour la fin d'entrée, une <code>InvalidOperationException</code> est un bon choix.</p>",
      solution: `int age = ReadInt("Âge", 0, 120);
int quantity = ReadInt("Quantité", 1, 99);
Console.WriteLine($"Âge {age}, quantité {quantity}");

static int ReadInt(string prompt, int min, int max)
{
    if (min > max)
        throw new ArgumentException($"min ({min}) doit être inférieur ou égal à max ({max})");

    while (true)
    {
        Console.Write($"{prompt} ({min}-{max}) : ");
        string? line = Console.ReadLine();

        if (line is null)
            throw new InvalidOperationException("Fin de l'entrée standard");

        if (int.TryParse(line, out int value) && value >= min && value <= max)
            return value;

        Console.WriteLine("Valeur invalide, recommence.");
    }
}`
    },
    {
      level: "difficile",
      title: "Analyseur de lignes CSV",
      prompt: `<p>On reçoit des lignes au format <code>nom;email;age</code>. Écris un programme qui :</p>
<ul>
<li>parse chaque ligne en <code>record Contact(string Name, string? Email, int? Age)</code> (email et âge facultatifs : champ vide = null) ;</li>
<li>lève une <code>FormatException</code> avec un message clair si la ligne n'a pas 3 champs, si le nom est vide ou si l'âge n'est pas un nombre ;</li>
<li>traite toutes les lignes, compte les erreurs sans arrêter le traitement, et affiche à la fin un rapport construit avec un <code>StringBuilder</code> ;</li>
<li>affiche « email : non renseigné » grâce à <code>??</code>.</li>
</ul>
<p>Lignes de test : <code>"Ana;ana@mail.com;31"</code>, <code>"Bob;;"</code>, <code>";x@y.z;20"</code>, <code>"Zoé;zoe@mail.com;abc"</code>, <code>"incomplet;1"</code>.</p>`,
      hint: "<p>Intercepte la <code>FormatException</code> dans la boucle, pas dans la méthode de parsing : la méthode signale l'erreur, l'appelant décide quoi en faire.</p>",
      solution: `using System.Text;

string[] lines =
[
    "Ana;ana@mail.com;31",
    "Bob;;",
    ";x@y.z;20",
    "Zoé;zoe@mail.com;abc",
    "incomplet;1"
];

var report = new StringBuilder();
int ok = 0, errors = 0;

for (int i = 0; i < lines.Length; i++)
{
    try
    {
        var c = ParseContact(lines[i]);
        ok++;
        report.AppendLine($"{c.Name} - email : {c.Email ?? "non renseigné"} - âge : {c.Age?.ToString() ?? "?"}");
    }
    catch (FormatException ex)
    {
        errors++;
        report.AppendLine($"Ligne {i + 1} ignorée : {ex.Message}");
    }
}

report.AppendLine($"Total : {ok} contacts, {errors} erreurs");
Console.Write(report.ToString());

static Contact ParseContact(string line)
{
    string[] parts = line.Split(';');
    if (parts.Length != 3)
        throw new FormatException($"3 champs attendus, {parts.Length} trouvés dans \\"{line}\\"");

    string name = parts[0].Trim();
    if (name.Length == 0)
        throw new FormatException("le nom est obligatoire");

    string? email = string.IsNullOrWhiteSpace(parts[1]) ? null : parts[1].Trim();

    int? age = null;
    if (!string.IsNullOrWhiteSpace(parts[2]))
    {
        if (!int.TryParse(parts[2], out int parsed))
            throw new FormatException($"âge invalide : \\"{parts[2]}\\"");
        age = parsed;
    }

    return new Contact(name, email, age);
}

record Contact(string Name, string? Email, int? Age);`
    }
  ],
  project: `<p><strong>Bibliothèque : version finale de la semaine 0.</strong></p>
<ul>
<li>Ajoute <code>enum LoanStatus { Active, Returned, Overdue }</code> et une propriété <code>Status</code> dans les emprunts (ou une méthode qui la calcule à partir de la date de retour prévue).</li>
<li>Dans <code>Library.Borrow(...)</code>, lève une <code>InvalidOperationException</code> si le média n'est pas empruntable, déjà emprunté, ou si le membre a déjà 3 emprunts actifs. Utilise <code>ArgumentNullException.ThrowIfNull</code> pour les paramètres.</li>
<li><code>FindBook(Isbn isbn)</code> renvoie <code>Book?</code> : gère le résultat null dans le menu avec un message clair.</li>
<li>Le menu console (ajouter un livre, lister, emprunter, rendre, afficher les retards, quitter) lit les saisies avec <code>TryParse</code> et intercepte les <code>InvalidOperationException</code> et <code>ArgumentException</code> au niveau du menu seulement, en affichant le message à l'utilisateur.</li>
<li>Option « Rapport » : construis la liste des emprunts en retard avec un <code>StringBuilder</code>.</li>
<li>Vérifie qu'il ne reste aucun avertissement de nullabilité à la compilation (<code>dotnet build</code>).</li>
</ul>
<p>Garde ce projet : tu le compareras à OrderFlow à la fin de la semaine 1.</p>`,
  resources: [
    { label: "Types énumération", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/enum" },
    { label: "Types référence nullables", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/nullable-references" },
    { label: "Exceptions et gestion des exceptions", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/exceptions/" },
    { label: "Chaînes en C#", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/strings/" }
  ]
});
