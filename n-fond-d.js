window.COURSE = window.COURSE || [];
window.COURSE.push({
  key: "f-class-keywords",
  title: "abstract, virtual, override, sealed, new, partial et required",
  summary: "Maîtriser les mots-clés qui contrôlent l'héritage et la construction des classes, savoir lesquels se combinent et pourquoi, et répondre aux questions d'entretien qui tombent à chaque fois.",
  objectives: [
    "Concevoir une hiérarchie avec des classes et des membres abstraits, y compris une classe intermédiaire qui reste abstraite",
    "Utiliser virtual, override et base correctement, et éviter l'appel virtuel dans un constructeur",
    "Sceller une classe ou un override, et savoir pourquoi c'est un bon réflexe par défaut",
    "Expliquer la différence entre new (masquage) et override avec un exemple qui le prouve",
    "Reconnaître l'usage légitime de partial et rendre des membres obligatoires avec required et init",
    "Lire et corriger les erreurs du compilateur sur les combinaisons interdites"
  ],
  lesson: `<p>Au jour B4, tu as vu l'héritage et les classes abstraites en bref. Aujourd'hui, on prend chaque mot-clé séparément, on regarde tous ses cas d'usage et toutes les erreurs qu'il peut provoquer. Ce sont des questions qu'on te posera en entretien, et des décisions que tu prendras chaque semaine en écrivant du code.</p>

<h3>1. abstract : une classe faite pour être héritée</h3>
<p>Une classe <code>abstract</code> représente un concept incomplet : on ne peut pas l'instancier avec <code>new</code> (erreur <code>CS0144</code>). Elle peut pourtant contenir tout ce qu'une classe normale contient : des champs, des propriétés, des méthodes concrètes et des constructeurs. Comme personne ne peut l'instancier directement, on déclare son constructeur <code>protected</code> : il n'est appelé que par les classes dérivées, via <code>: base(...)</code>.</p>
<p>Un membre <code>abstract</code> (méthode, propriété, indexeur, événement) n'a <strong>pas de corps</strong> : il se termine par un point-virgule. Écrire un corps donne l'erreur <code>CS0500</code>. Il est implicitement virtuel, et toute classe dérivée concrète <strong>doit</strong> le redéfinir avec <code>override</code>, sinon <code>CS0534</code>. Une classe qui contient un membre abstrait doit elle-même être abstraite (<code>CS0513</code>).</p>
<p>Une classe intermédiaire peut rester abstraite : <code>Shape</code> (abstraite) → <code>Polygon</code> (abstraite, implémente une partie) → <code>Rectangle</code> (concrète, implémente le reste). Seule la dernière classe de la chaîne doit avoir tout implémenté.</p>
<pre><code>public abstract class Shape
{
    protected Shape(string name) =&gt; Name = name; // appelé seulement par les dérivées
    public string Name { get; }
    public abstract double Area();                // pas de corps
    public override string ToString() =&gt; $"{Name} : {Area():N2}";
}</code></pre>

<h3>2. virtual et override : un comportement par défaut qu'on peut remplacer</h3>
<p>En C#, une méthode n'est <strong>pas</strong> redéfinissable par défaut. Il faut le dire explicitement avec <code>virtual</code> dans la classe de base. La classe dérivée la remplace avec <code>override</code>, et peut appeler la version de base avec <code>base.Method()</code>. Essayer de faire <code>override</code> sur une méthode non virtuelle donne <code>CS0506</code>.</p>
<p>Les propriétés, indexeurs et événements peuvent aussi être virtuels. En revanche, ne peuvent pas être virtuels : les membres <code>static</code> (<code>CS0112</code>), les membres <code>private</code> (<code>CS0621</code>), et les champs (seuls les membres avec du code peuvent être redéfinis).</p>
<p>Les trois méthodes de <code>object</code> que tu redéfiniras le plus souvent sont <code>ToString()</code>, <code>Equals(object?)</code> et <code>GetHashCode()</code>. Règle absolue : si tu redéfinis <code>Equals</code>, redéfinis <code>GetHashCode</code> de façon cohérente, sinon ton objet se comportera mal dans un <code>Dictionary</code> ou un <code>HashSet</code>. Les records le font pour toi.</p>
<p><strong>Le piège de l'appel virtuel dans un constructeur.</strong> En C#, l'ordre de construction d'un objet dérivé est : initialiseurs de champs de la dérivée, puis constructeur de la base, puis corps du constructeur de la dérivée. Si le constructeur de base appelle une méthode virtuelle, c'est déjà la version <code>override</code> de la dérivée qui s'exécute, alors que le corps de son constructeur n'a pas encore tourné. Les champs qu'il devait remplir valent encore <code>null</code> ou <code>0</code>. L'exemple 2 le démontre. Règle : n'appelle jamais de membre virtuel ou abstrait depuis un constructeur.</p>

<h3>3. sealed : fermer la porte à l'héritage</h3>
<p>Une classe <code>sealed</code> ne peut pas être héritée (<code>CS0509</code>). <code>string</code> est scellée, comme beaucoup de types du framework. Sur un membre, <code>sealed override</code> stoppe la chaîne : la classe dérivée suivante ne peut plus redéfinir ce membre (<code>CS0239</code>).</p>
<p>Pourquoi sceller par défaut ? Une classe ouverte à l'héritage est une promesse : tes futurs changements internes ne doivent pas casser les classes dérivées que d'autres ont écrites. Concevoir pour l'héritage demande du travail (documenter les points d'extension, choisir ce qui est virtuel). Si tu ne l'as pas fait, scelle. L'analyseur <code>CA1852</code> signale d'ailleurs les types <code>internal</code> que rien n'hérite dans l'assembly et propose de les sceller. Tu peux toujours retirer <code>sealed</code> plus tard, alors que l'ajouter casse le code des autres.</p>

<h3>4. new contre override : masquer n'est pas redéfinir</h3>
<p>Si une classe dérivée déclare un membre avec le même nom qu'un membre de la base <strong>sans</strong> <code>override</code>, elle le <em>masque</em>. Le compilateur avertit (<code>CS0108</code>, ou <code>CS0114</code> si le membre de base est virtuel). Le mot-clé <code>new</code> supprime l'avertissement mais ne change rien au comportement : la méthode appelée dépend alors du <strong>type de la variable</strong>, pas du type réel de l'objet.</p>
<table>
<thead><tr><th>Code</th><th>Avec override</th><th>Avec new</th></tr></thead>
<tbody>
<tr><td><code>Derived d = new Derived(); d.Speak();</code></td><td>Derived</td><td>Derived</td></tr>
<tr><td><code>Base b = new Derived(); b.Speak();</code></td><td><strong>Derived</strong></td><td><strong>Base</strong></td></tr>
<tr><td><code>List&lt;Base&gt;</code> parcourue avec <code>foreach</code></td><td>Derived pour chaque dérivée</td><td>Base partout</td></tr>
</tbody>
</table>
<p>Avec <code>new</code>, le polymorphisme est cassé : le même objet se comporte différemment selon la variable qui le référence. C'est presque toujours une erreur de conception. Le seul usage légitime est de masquer un membre d'une classe de base que tu ne contrôles pas (une bibliothèque) qui a ajouté un membre du même nom que le tien.</p>

<h3>5. partial : une classe écrite en plusieurs fichiers</h3>
<p><code>partial</code> permet de répartir la déclaration d'une classe, d'une struct, d'une interface ou d'un record sur plusieurs fichiers. Le compilateur les fusionne en un seul type. Les <strong>méthodes partielles</strong> ont une déclaration dans une partie et une implémentation dans une autre. Sans modificateur d'accès, elles doivent renvoyer <code>void</code> et peuvent rester sans implémentation (l'appel est alors supprimé). Avec un modificateur d'accès (C# 9), l'implémentation est obligatoire. C# 13 ajoute les <strong>propriétés partielles</strong>, et C# 14 les constructeurs et événements partiels.</p>
<p>L'usage réel de <code>partial</code>, c'est le <strong>code généré</strong> : un générateur (source generator, designer WinForms, Blazor) écrit une moitié de la classe, toi l'autre, et personne n'écrase le travail de l'autre. Exemples dans .NET : <code>[GeneratedRegex]</code> sur une méthode partielle pour une regex compilée au build, <code>[LoggerMessage]</code> pour un logging performant, les générateurs <code>System.Text.Json</code>. N'utilise pas <code>partial</code> pour découper une classe de 2 000 lignes : c'est cacher le problème. Découpe-la en plusieurs classes.</p>

<h3>6. required et init : des objets toujours complets</h3>
<p>Une propriété <code>init</code> ne peut être affectée que pendant l'initialisation de l'objet (constructeur ou initialiseur <code>{ ... }</code>), puis elle devient en lecture seule. <code>required</code> (C# 11) ajoute une obligation : l'appelant <strong>doit</strong> l'affecter dans l'initialiseur, sinon le compilateur refuse (<code>CS9035</code>). C'est l'équivalent des propriétés non optionnelles d'une interface TypeScript.</p>
<pre><code>public sealed class Member
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public DateOnly JoinedOn { get; init; } = DateOnly.FromDateTime(DateTime.Today);
}
var m = new Member { Name = "Sara", Email = "sara@example.com" }; // OK
// var x = new Member { Name = "Sara" };  // CS9035 : Email est requis</code></pre>
<p>Si un constructeur affecte lui-même tous les membres requis, marque-le avec <code>[SetsRequiredMembers]</code> (namespace <code>System.Diagnostics.CodeAnalysis</code>) pour que l'appelant n'ait plus à les fournir. Comparé à un paramètre de constructeur, <code>required</code> rend l'appel lisible (on voit le nom de chaque valeur) et fonctionne bien avec <code>with</code> sur les records. Le constructeur reste préférable quand il doit valider la combinaison des valeurs.</p>

<h3>7. Comparaison avec TypeScript</h3>
<table>
<thead><tr><th>Notion</th><th>TypeScript</th><th>C#</th></tr></thead>
<tbody>
<tr><td>Classe abstraite</td><td><code>abstract class</code></td><td><code>abstract class</code>, même idée</td></tr>
<tr><td>Méthode redéfinissable</td><td>Toutes, par défaut</td><td>Seulement si <code>virtual</code> ou <code>abstract</code></td></tr>
<tr><td>Redéfinir</td><td><code>override</code> optionnel (obligatoire avec <code>noImplicitOverride</code>, TS 4.3)</td><td><code>override</code> obligatoire</td></tr>
<tr><td>Interdire l'héritage</td><td>Impossible</td><td><code>sealed</code></td></tr>
<tr><td>Masquage</td><td>N'existe pas</td><td><code>new</code> (à éviter)</td></tr>
<tr><td>Classe en plusieurs fichiers</td><td>N'existe pas</td><td><code>partial</code></td></tr>
<tr><td>Propriété obligatoire</td><td><code>name: string</code> dans un type</td><td><code>required</code></td></tr>
</tbody>
</table>

<h3>8. Fiche mémo</h3>
<table>
<thead><tr><th>Mot-clé</th><th>S'applique à</th><th>Effet</th><th>Exemple dans .NET</th></tr></thead>
<tbody>
<tr><td><code>abstract</code></td><td>classe, méthode, propriété, indexeur, événement</td><td>Non instanciable / doit être redéfini</td><td><code>Stream</code>, <code>DbConnection</code></td></tr>
<tr><td><code>virtual</code></td><td>méthode, propriété, indexeur, événement</td><td>Redéfinissable, avec une implémentation par défaut</td><td><code>object.ToString()</code></td></tr>
<tr><td><code>override</code></td><td>membre hérité virtuel ou abstrait</td><td>Remplace l'implémentation</td><td><code>ToString()</code> de tes classes</td></tr>
<tr><td><code>sealed</code></td><td>classe, override</td><td>Interdit l'héritage / la redéfinition suivante</td><td><code>string</code></td></tr>
<tr><td><code>new</code> (modificateur)</td><td>tout membre</td><td>Masque le membre de base</td><td>Rare, à éviter</td></tr>
<tr><td><code>partial</code></td><td>classe, struct, interface, record, méthode, propriété</td><td>Déclaration répartie</td><td><code>[GeneratedRegex]</code></td></tr>
<tr><td><code>required</code></td><td>propriété, champ</td><td>Affectation obligatoire à la création</td><td>DTOs, options</td></tr>
<tr><td><code>init</code></td><td>accesseur de propriété</td><td>Modifiable seulement à l'initialisation</td><td>Records positionnels</td></tr>
</tbody>
</table>
<p><strong>Combinaisons interdites</strong> (à connaître pour lire les erreurs) :</p>
<table>
<thead><tr><th>Combinaison</th><th>Erreur</th><th>Pourquoi</th></tr></thead>
<tbody>
<tr><td><code>abstract sealed class</code> ou <code>abstract static class</code></td><td>CS0418</td><td>Une classe abstraite doit pouvoir être héritée</td></tr>
<tr><td><code>private virtual</code> / <code>private abstract</code></td><td>CS0621</td><td>Une dérivée ne voit pas un membre privé</td></tr>
<tr><td><code>static virtual</code> / <code>static override</code> dans une classe</td><td>CS0112</td><td>Le polymorphisme passe par l'instance (les <code>static abstract</code> ne sont permis que dans les interfaces, C# 11)</td></tr>
<tr><td>Membre abstrait dans une classe non abstraite</td><td>CS0513</td><td>La classe serait instanciable avec un trou</td></tr>
<tr><td><code>override</code> d'une méthode non virtuelle</td><td>CS0506</td><td>La base ne l'autorise pas</td></tr>
<tr><td>Hériter d'une classe <code>sealed</code></td><td>CS0509</td><td>C'est le but de <code>sealed</code></td></tr>
<tr><td>Hériter d'une classe <code>static</code></td><td>CS0709</td><td>Une classe statique est implicitement scellée</td></tr>
</tbody>
</table>

<div class="note">Dans une base de code professionnelle, le réflexe est : <strong>sealed par défaut</strong>, <strong>composition plutôt qu'héritage</strong>, et <code>virtual</code> seulement là où tu as volontairement prévu un point d'extension (et que tu l'as documenté). Une hiérarchie de plus de deux ou trois niveaux est un signal d'alerte en revue de code. Pour les DTOs et les options, <code>required</code> + <code>init</code> remplace avantageusement les constructeurs à rallonge. Et quand tu vois <code>new</code> devant une méthode, demande toujours pourquoi.</div>

<h3>Questions d'entretien</h3>
<ol>
<li><strong>Classe abstraite ou interface ?</strong> Une classe abstraite partage de l'état et du code, avec un seul héritage possible. Une interface définit un contrat, et une classe peut en implémenter plusieurs. On choisit l'interface pour une capacité (<code>IDisposable</code>), la classe abstraite pour une base commune avec du code (<code>Stream</code>).</li>
<li><strong>Peut-on hériter d'une classe static ?</strong> Non (CS0709) : elle est implicitement abstraite et scellée.</li>
<li><strong>Peut-on redéfinir une méthode non virtuelle ?</strong> Non (CS0506). On peut seulement la masquer avec <code>new</code>, ce qui ne donne pas de polymorphisme.</li>
<li><strong>Différence entre new et override ?</strong> <code>override</code> : la méthode appelée dépend du type réel de l'objet. <code>new</code> : elle dépend du type de la variable.</li>
<li><strong>Quand sceller une classe ?</strong> Par défaut, dès qu'elle n'est pas conçue pour l'héritage. Bonus : le JIT peut dévirtualiser les appels.</li>
<li><strong>Une classe abstraite peut-elle avoir un constructeur ?</strong> Oui, généralement <code>protected</code>, appelé par les dérivées via <code>base(...)</code>.</li>
<li><strong>Pourquoi ne pas appeler une méthode virtuelle dans un constructeur ?</strong> L'override s'exécute avant le corps du constructeur de la dérivée, sur un objet à moitié initialisé.</li>
<li><strong>À quoi sert partial en pratique ?</strong> À combiner du code généré et du code écrit à la main dans le même type, sans que la régénération écrase ton code.</li>
</ol>`,
  examples: [
    {
      title: "Chaîne abstraite : Shape → Polygon → Rectangle",
      code: `// Une classe intermédiaire peut rester abstraite
List<Shape> shapes = [new Rectangle(3, 4), new Circle(1.5)];
foreach (var s in shapes)
    Console.WriteLine(s); // ToString() appelle Area() redéfinie

// var oops = new Shape("x"); // CS0144 : impossible d'instancier une classe abstraite

public abstract class Shape
{
    // protected : seules les classes dérivées peuvent l'appeler
    protected Shape(string name) => Name = name;

    public string Name { get; }

    // Membre abstrait : pas de corps, override obligatoire
    public abstract double Area();

    public override string ToString() => $"{Name} : aire {Area():N2}";
}

// Toujours abstraite : implémente une partie seulement
public abstract class Polygon : Shape
{
    protected Polygon(string name, int sides) : base(name) => Sides = sides;
    public int Sides { get; }
    public abstract double Perimeter();
}

// Concrète : doit tout implémenter (Area et Perimeter)
public sealed class Rectangle(double width, double height) : Polygon("Rectangle", 4)
{
    public override double Area() => width * height;
    public override double Perimeter() => 2 * (width + height);
}

public sealed class Circle(double radius) : Shape("Cercle")
{
    public override double Area() => Math.PI * radius * radius;
}`,
      explain: "<code>Polygon</code> ajoute un membre abstrait sans implémenter <code>Area</code> : elle reste abstraite. <code>Rectangle</code>, dernière de la chaîne, implémente tout. Si tu retires <code>Perimeter</code> de <code>Rectangle</code>, le compilateur affiche CS0534."
    },
    {
      title: "Le piège : appel virtuel dans un constructeur",
      code: `var report = new SalesReport("Ventes T1");
// Affiche : Titre : (null) -- le champ n'était pas encore rempli !
Console.WriteLine(report.Header);

public abstract class Report
{
    public string Header { get; }

    protected Report()
    {
        // MAUVAIS : appelle l'override de la classe dérivée
        // avant que le corps de son constructeur ait tourné
        Header = BuildHeader();
    }

    protected abstract string BuildHeader();
}

public sealed class SalesReport : Report
{
    private readonly string _title;

    public SalesReport(string title) // : base() s'exécute AVANT cette ligne
    {
        _title = title;
    }

    protected override string BuildHeader() => "Titre : " + (_title ?? "(null)");
}

// Correction : passer la valeur au constructeur de base,
// ou construire l'en-tête à la demande (propriété calculée) :
// public string Header => BuildHeader();`,
      explain: "Ordre de construction en C# : initialiseurs de champs de la dérivée, puis constructeur de la base, puis corps du constructeur de la dérivée. Ici <code>_title</code> est affecté dans le corps, donc il vaut encore <code>null</code> quand la base appelle <code>BuildHeader()</code>."
    },
    {
      title: "new contre override : la preuve",
      code: `Animal a1 = new Dog();   // variable de type base, objet Dog
Dog d = new Dog();       // variable de type dérivé

Console.WriteLine(a1.Speak()); // Ouaf      (override : type réel)
Console.WriteLine(a1.Move());  // Se déplace (new : type de la variable !)
Console.WriteLine(d.Speak());  // Ouaf
Console.WriteLine(d.Move());   // Court

List<Animal> zoo = [new Dog(), new Animal()];
foreach (var x in zoo)
    Console.WriteLine($"{x.Speak()} / {x.Move()}");
// Ouaf / Se déplace
// ... / Se déplace

public class Animal
{
    public virtual string Speak() => "...";
    public string Move() => "Se déplace"; // non virtuelle
}

public class Dog : Animal
{
    public override string Speak() => "Ouaf";

    // Sans 'new' : avertissement CS0108. Avec 'new' : plus d'avertissement,
    // mais le comportement reste du masquage, pas du polymorphisme.
    public new string Move() => "Court";
}`,
      explain: "Le même objet <code>Dog</code> répond « Court » ou « Se déplace » selon la variable qui le référence. C'est exactement ce qu'on veut éviter : utilise <code>virtual</code>/<code>override</code> si le comportement doit varier."
    },
    {
      title: "sealed et sealed override",
      code: `PaymentMethod p = new PremiumCard();
Console.WriteLine(p.Fee(100m)); // 1,00 (CreditCard), pas modifiable plus bas

public abstract class PaymentMethod
{
    public abstract decimal Fee(decimal amount);
    public virtual string Label => "Paiement";
}

public class CreditCard : PaymentMethod
{
    // sealed override : les classes dérivées de CreditCard
    // ne pourront plus redéfinir Fee
    public sealed override decimal Fee(decimal amount) => amount * 0.01m;
    public override string Label => "Carte";
}

// Classe scellée : personne ne peut en hériter
public sealed class PremiumCard : CreditCard
{
    // public override decimal Fee(decimal amount) => 0m; // CS0239 : Fee est scellée
    public override string Label => "Carte premium"; // Label reste redéfinissable
}

// public class SuperPremium : PremiumCard { } // CS0509 : PremiumCard est sealed`,
      explain: "<code>sealed override</code> verrouille une méthode précise tout en laissant la classe ouverte. <code>sealed</code> sur la classe ferme tout. Dé-commente les lignes pour voir CS0239 et CS0509."
    },
    {
      title: "required, init, SetsRequiredMembers et partial",
      code: `using System.Diagnostics.CodeAnalysis;
using System.Text.RegularExpressions;

var a = new Author { FirstName = "Ada", LastName = "Lovelace" };
var b = new Author("Grace", "Hopper"); // le constructeur fournit tout
// var c = new Author { FirstName = "Alan" }; // CS9035 : LastName est requis

Console.WriteLine(a.FullName);
Console.WriteLine(Validators.IsIsbn("978-2-07-036822-8")); // True

public sealed class Author
{
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public string FullName => FirstName + " " + LastName;

    public Author() { }

    // Ce constructeur affecte tous les membres required :
    // l'appelant n'a plus à les mettre dans l'initialiseur
    [SetsRequiredMembers]
    public Author(string firstName, string lastName)
    {
        FirstName = firstName;
        LastName = lastName;
    }
}

// partial : le générateur de regex de .NET écrit l'autre moitié au build
public static partial class Validators
{
    [GeneratedRegex(@"^97[89]-?\\d{1,5}-?\\d{1,7}-?\\d{1,7}-?[\\dX]$")]
    private static partial Regex IsbnRegex();

    public static bool IsIsbn(string value) => IsbnRegex().IsMatch(value);
}`,
      explain: "<code>required</code> force l'appelant à fournir les valeurs. <code>[SetsRequiredMembers]</code> le dispense quand un constructeur s'en charge. <code>[GeneratedRegex]</code> est l'usage typique de <code>partial</code> : tu déclares la méthode, le générateur l'implémente."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Corriger les erreurs du compilateur",
      prompt: `<p>Ce code ne compile pas. Trouve les 4 erreurs, donne leur numéro (CSxxxx) et corrige-les sans changer l'intention.</p>
<pre><code>public class Vehicle
{
    public abstract int Wheels();
    private virtual string Brand() =&gt; "?";
}
public sealed class Car : Vehicle
{
    public override int Wheels() =&gt; 4;
}
public class SportsCar : Car { }
var v = new Vehicle();</code></pre>`,
      hint: "<p>Regarde : une classe avec un membre abstrait, un membre virtuel privé, l'héritage d'une classe scellée, l'instanciation d'une classe abstraite (une fois la première erreur corrigée).</p>",
      solution: `// Erreurs :
// 1. CS0513 : Wheels est abstraite dans une classe non abstraite -> rendre Vehicle abstraite
// 2. CS0621 : un membre virtual ne peut pas être private -> protected virtual
// 3. CS0509 : SportsCar hérite de Car qui est sealed -> retirer sealed de Car (ou ne pas hériter)
// 4. CS0144 : on ne peut pas instancier Vehicle (abstraite) -> instancier une classe concrète

Vehicle v = new SportsCar();
Console.WriteLine($"{v.Wheels()} roues");

public abstract class Vehicle
{
    public abstract int Wheels();
    protected virtual string Brand() => "?";
}

public class Car : Vehicle
{
    public override int Wheels() => 4;
}

public sealed class SportsCar : Car
{
    protected override string Brand() => "Sport";
}`
    },
    {
      level: "moyen",
      title: "Hiérarchie de notifications",
      prompt: `<p>Crée une hiérarchie de notifications :</p>
<ul>
<li><code>Notification</code> abstraite, avec un constructeur <code>protected</code> qui reçoit le destinataire, une méthode abstraite <code>Send(string message)</code> qui renvoie le texte envoyé, et une méthode virtuelle <code>Format(string message)</code> qui renvoie le message tel quel.</li>
<li><code>EmailNotification</code> scellée, qui redéfinit <code>Format</code> pour ajouter une signature en appelant la version de base.</li>
<li><code>SmsNotification</code> scellée, qui tronque le message à 20 caractères dans <code>Format</code>.</li>
</ul>
<p>Parcours une <code>List&lt;Notification&gt;</code> et affiche le résultat de <code>Send</code> pour chacune.</p>`,
      hint: "<p><code>Send</code> peut être implémentée dans chaque dérivée en appelant <code>Format(message)</code>. Pour l'email : <code>base.Format(message) + \" -- L'équipe\"</code>.</p>",
      solution: `List<Notification> notifications =
[
    new EmailNotification("sara@example.com"),
    new SmsNotification("+33600000000"),
];

foreach (var n in notifications)
    Console.WriteLine(n.Send("Votre commande a été expédiée aujourd'hui"));

public abstract class Notification
{
    protected Notification(string recipient) => Recipient = recipient;

    public string Recipient { get; }

    public abstract string Send(string message);

    public virtual string Format(string message) => message;
}

public sealed class EmailNotification(string email) : Notification(email)
{
    public override string Format(string message) => base.Format(message) + " -- L'équipe";

    public override string Send(string message) => $"[Email à {Recipient}] {Format(message)}";
}

public sealed class SmsNotification(string phone) : Notification(phone)
{
    public override string Format(string message) =>
        message.Length <= 20 ? message : message[..20] + "...";

    public override string Send(string message) => $"[SMS à {Recipient}] {Format(message)}";
}`
    },
    {
      level: "difficile",
      title: "Template Method sûr : sans appel virtuel dans le constructeur",
      prompt: `<p>On veut une classe de base <code>Importer</code> qui définit l'algorithme d'import en 3 étapes : <code>Read</code> (abstraite, renvoie des lignes), <code>Validate</code> (virtuelle, par défaut ignore les lignes vides), <code>Save</code> (abstraite). La méthode publique <code>Run()</code> enchaîne les étapes et ne doit <strong>pas</strong> être redéfinissable.</p>
<p>Contraintes :</p>
<ul>
<li>Aucune méthode virtuelle ou abstraite appelée dans un constructeur.</li>
<li><code>CsvImporter</code> scellée : <code>Read</code> découpe une chaîne CSV reçue au constructeur, <code>Validate</code> appelle la base puis retire en plus les lignes qui commencent par <code>#</code>, <code>Save</code> mémorise les lignes dans une liste exposée en <code>IReadOnlyList&lt;string&gt;</code>.</li>
<li>Une propriété <code>required</code> <code>Source</code> (nom de la source, pour le log).</li>
</ul>
<p>Explique en commentaire pourquoi <code>Run()</code> n'est ni <code>virtual</code> ni <code>abstract</code>.</p>`,
      hint: "<p><code>Run()</code> est une méthode publique non virtuelle : c'est le « Template Method ». Les étapes sont <code>protected abstract</code> / <code>protected virtual</code>. Pour découper : <code>csv.Split('\\n')</code> puis <code>Trim()</code>.</p>",
      solution: `var importer = new CsvImporter("titre;auteur\\n\\n# commentaire\\nDune;Herbert\\n")
{
    Source = "catalogue.csv",
};

importer.Run();
foreach (var line in importer.Saved)
    Console.WriteLine(line);

public abstract class Importer
{
    public required string Source { get; init; }

    // Run n'est ni virtual ni abstract : c'est l'algorithme fixe (Template Method).
    // Les dérivées personnalisent les étapes, jamais l'ordre ni le log.
    public void Run()
    {
        Console.WriteLine($"Import depuis {Source}...");
        var rows = Read();
        var valid = Validate(rows);
        Save(valid);
        Console.WriteLine($"{valid.Count} ligne(s) importée(s).");
    }

    protected abstract IReadOnlyList<string> Read();

    protected virtual List<string> Validate(IReadOnlyList<string> rows) =>
        rows.Where(r => !string.IsNullOrWhiteSpace(r)).ToList();

    protected abstract void Save(IReadOnlyList<string> rows);
}

public sealed class CsvImporter : Importer
{
    private readonly string _csv;
    private readonly List<string> _saved = [];

    // Le constructeur se contente de stocker : aucun appel virtuel ici
    public CsvImporter(string csv) => _csv = csv;

    public IReadOnlyList<string> Saved => _saved;

    protected override IReadOnlyList<string> Read() =>
        _csv.Split('\\n').Select(l => l.Trim()).ToList();

    protected override List<string> Validate(IReadOnlyList<string> rows) =>
        base.Validate(rows).Where(r => !r.StartsWith('#')).ToList();

    protected override void Save(IReadOnlyList<string> rows) => _saved.AddRange(rows);
}`
    }
  ],
  project: `<p>Reprends le mini-projet <strong>Bibliothèque</strong> du jour B4 (<code>Media</code> → <code>Book</code> / <code>Magazine</code>) et rends la hiérarchie propre :</p>
<ul>
<li><code>Media</code> devient <code>abstract</code>, avec un constructeur <code>protected</code> (titre, année), une méthode abstraite <code>CalculateLateFee(int daysLate)</code> et une méthode virtuelle <code>Describe()</code>.</li>
<li><code>Book</code> et <code>Magazine</code> deviennent <code>sealed</code>. <code>Book</code> facture 0,50 € par jour de retard, <code>Magazine</code> 0,20 €. <code>Book.Describe()</code> appelle <code>base.Describe()</code> et ajoute l'auteur.</li>
<li><code>Member</code> utilise des propriétés <code>required</code> + <code>init</code> pour <code>Name</code> et <code>Email</code>, avec un constructeur <code>[SetsRequiredMembers]</code> en plus.</li>
<li>Crée une classe <code>partial Library</code> en deux fichiers : <code>Library.cs</code> (ton code) et <code>Library.Generated.cs</code> (un « code généré » simulé qui contient la liste des genres en constantes). Ajoute un commentaire en tête du second fichier : « Fichier généré, ne pas modifier ».</li>
<li>Vérifie qu'aucun constructeur n'appelle de méthode virtuelle.</li>
</ul>`,
  resources: [
    { label: "abstract (référence C#)", url: "https://learn.microsoft.com/dotnet/csharp/language-reference/keywords/abstract" },
    { label: "virtual (référence C#)", url: "https://learn.microsoft.com/dotnet/csharp/language-reference/keywords/virtual" },
    { label: "sealed (référence C#)", url: "https://learn.microsoft.com/dotnet/csharp/language-reference/keywords/sealed" },
    { label: "Savoir quand utiliser override et new", url: "https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/knowing-when-to-use-override-and-new-keywords" },
    { label: "Classes et méthodes partielles", url: "https://learn.microsoft.com/dotnet/csharp/programming-guide/classes-and-structs/partial-classes-and-methods" },
    { label: "required (référence C#)", url: "https://learn.microsoft.com/dotnet/csharp/language-reference/keywords/required" }
  ]
});
