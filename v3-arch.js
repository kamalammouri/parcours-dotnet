window.COURSE = window.COURSE || [];

// =====================================================================
// Partie 5 - Architecture d'une application
// 5.1 SOLID (1/2)
// =====================================================================
window.COURSE.push({
  key: "arc-solid-1",
  title: "SOLID (1/2) : responsabilité unique et ouvert/fermé",
  summary: "Tu sauras découper une classe qui fait trop de choses et ajouter un comportement sans modifier le code existant.",
  objectives: [
    "Comprendre ce que veut dire SOLID et à quoi ça sert",
    "Repérer une classe qui a plusieurs raisons de changer",
    "Découper une classe selon le principe de responsabilité unique",
    "Remplacer un switch qui grossit par des stratégies (ouvert/fermé)"
  ],
  analogy: `<p>Dans un restaurant, le cuisinier cuisine, le serveur sert et le caissier encaisse. Si une seule personne faisait les trois, chaque changement (nouvelle carte, nouveau terminal de paiement) la perturberait entièrement. C'est la <strong>responsabilité unique</strong>.</p>
<p>Et quand le chef ajoute un plat, il n'a pas besoin de reconstruire la cuisine : il ajoute une recette. La cuisine est <strong>fermée</strong> aux travaux, mais <strong>ouverte</strong> aux nouvelles recettes. C'est le principe <strong>ouvert/fermé</strong>.</p>`,
  lesson: `<h3>SOLID, c'est quoi ?</h3>
<p><strong>SOLID</strong> est un acronyme qui regroupe cinq principes de conception orientée objet. Ce ne sont pas des lois : ce sont des repères pour écrire du code facile à modifier, à tester et à comprendre. On les voit en deux leçons : <strong>S</strong> et <strong>O</strong> ici, <strong>L</strong>, <strong>I</strong> et <strong>D</strong> dans la suivante.</p>
<table>
<tr><th>Lettre</th><th>Principe</th><th>En une phrase</th></tr>
<tr><td>S</td><td>Single Responsibility</td><td>Une classe a une seule raison de changer.</td></tr>
<tr><td>O</td><td>Open/Closed</td><td>On ajoute du comportement sans modifier le code existant.</td></tr>
<tr><td>L</td><td>Liskov Substitution</td><td>Un enfant peut remplacer son parent sans surprise.</td></tr>
<tr><td>I</td><td>Interface Segregation</td><td>Des petites interfaces plutôt qu'une grosse.</td></tr>
<tr><td>D</td><td>Dependency Inversion</td><td>On dépend d'abstractions, pas de détails.</td></tr>
</table>

<h3>S : une seule raison de changer</h3>
<p>Le principe de <strong>responsabilité unique</strong> (SRP) ne dit pas « une classe = une méthode ». Il dit : une classe ne doit avoir qu'<strong>une seule raison de changer</strong>. Une « raison de changer », c'est une personne ou un besoin qui peut demander une modification : le comptable (règles de calcul), le designer (format d'affichage), l'administrateur de la base (stockage).</p>
<p>Prends un <code>OrderService</code> qui calcule le total, affiche le ticket et écrit en base. Trois personnes différentes peuvent te demander de le modifier. À chaque fois, tu risques de casser les deux autres parties. Et pour tester le calcul, tu dois aussi faire tourner l'affichage et la base.</p>
<div class="flow"><span>OrderService fait tout</span><span>3 raisons de changer</span><span>OrderCalculator + ReceiptPrinter + OrderRepository</span></div>
<p>La solution : découper en trois classes, chacune avec une seule responsabilité. Le code d'appel les assemble. Tu connais déjà ce réflexe en Angular : un composant affiche, un service appelle l'API, un pipe formate.</p>
<div class="tip">Le test rapide : décris ta classe en une phrase. Si tu dois dire « et » (« elle calcule le total <em>et</em> envoie l'email <em>et</em>… »), elle a probablement trop de responsabilités.</div>

<h3>O : ouvert à l'extension, fermé à la modification</h3>
<p>Le principe <strong>ouvert/fermé</strong> (OCP) dit qu'on doit pouvoir <strong>ajouter</strong> un comportement sans <strong>modifier</strong> le code qui marche déjà. Le symptôme classique de la violation : un <code>switch</code> ou une série de <code>if</code> sur un type, qui grossit à chaque nouvelle demande.</p>
<div class="compare"><div><h4>Avant (fermé à l'extension)</h4><p><code>switch (discountType)</code> avec un <code>case</code> par remise. Nouvelle remise = on rouvre <code>Checkout</code>, on ajoute un <code>case</code>, on reteste tout.</p></div><div><h4>Après (ouvert à l'extension)</h4><p>Une interface <code>IDiscountPolicy</code> et une classe par remise. Nouvelle remise = une nouvelle classe. <code>Checkout</code> ne bouge pas.</p></div></div>
<p>Ce découpage s'appelle le pattern <strong>Strategy</strong> : chaque façon de faire (chaque stratégie) vit dans sa propre classe, et le code principal reçoit celle qu'il doit utiliser. Le polymorphisme (une interface, plusieurs implémentations) est l'outil qui rend OCP possible.</p>

<h3>Ne pas en faire trop</h3>
<p>Ces principes ont un coût : plus de classes, plus de fichiers. Une application de 200 lignes n'a pas besoin de dix interfaces. La bonne approche : écrire simple, puis découper <strong>quand la deuxième ou la troisième variante arrive</strong>, ou quand un test devient pénible à écrire. On appelle ça refactorer au bon moment.</p>
<pre class="diagram">
  Taille du besoin   Bonne réponse
  ----------------   ----------------------------
  1 cas              un if, c'est très bien
  2 cas              un if/else, on surveille
  3 cas et plus      une interface + 3 classes
</pre>
<div class="note">En revue de code, un senior ne cite pas « SRP » ou « OCP » pour faire savant. Il dit : « si demain on ajoute le paiement par virement, combien de fichiers faut-il toucher ? ». Si la réponse est « un nouveau fichier et une ligne d'enregistrement », le design est bon.</div>`,
  examples: [
    {
      title: "Avant : une classe qui fait tout",
      code: `using System.Globalization;

var service = new OrderService();
service.Checkout("Alice", [("Clavier", 49.90m, 2), ("Souris", 19.90m, 1)]);

// Une seule classe qui calcule, affiche ET enregistre
class OrderService
{
    public void Checkout(string customer, List<(string Name, decimal Price, int Qty)> lines)
    {
        // 1. Règle métier : le calcul du total
        decimal total = 0;
        foreach (var line in lines)
            total += line.Price * line.Qty;

        // 2. Présentation : le ticket
        Console.WriteLine($"Client : {customer}");
        Console.WriteLine($"Total : {total.ToString("0.00", CultureInfo.InvariantCulture)} EUR");

        // 3. Persistance : l'enregistrement (simulé)
        Console.WriteLine($"INSERT INTO Orders VALUES ('{customer}', {total.ToString(CultureInfo.InvariantCulture)})");
    }
}`,
      output: `Client : Alice
Total : 119.70 EUR
INSERT INTO Orders VALUES ('Alice', 119.70)`,
      steps: [
        "<code>service.Checkout(\"Alice\", [...])</code> : on passe une liste de tuples (nom, prix, quantité) grâce à une expression de collection.",
        "<code>total += line.Price * line.Qty;</code> : la règle métier est noyée au milieu du reste.",
        "<code>Console.WriteLine($\"Total : ...\")</code> : l'affichage est mélangé au calcul. Impossible de calculer un total sans rien afficher.",
        "<code>INSERT INTO Orders ...</code> : l'accès aux données est aussi dans la même méthode.",
        "Trois raisons de changer dans une seule classe : le calcul, le format du ticket, le stockage."
      ],
      explain: "Ça marche, mais pour tester le calcul il faut subir l'affichage et la base."
    },
    {
      title: "Après : trois classes, trois responsabilités",
      code: `using System.Globalization;

var lines = new List<OrderLine> { new("Clavier", 49.90m, 2), new("Souris", 19.90m, 1) };

var calculator = new OrderCalculator();
var printer = new ReceiptPrinter();
var repository = new InMemoryOrderRepository();

decimal total = calculator.Total(lines);
printer.Print("Alice", total);
repository.Save("Alice", total);
Console.WriteLine($"Commandes enregistrées : {repository.Count}");

record OrderLine(string Name, decimal Price, int Quantity);

// Change si les règles de calcul changent
class OrderCalculator
{
    public decimal Total(IEnumerable<OrderLine> lines) => lines.Sum(l => l.Price * l.Quantity);
}

// Change si le format du ticket change
class ReceiptPrinter
{
    public void Print(string customer, decimal total) =>
        Console.WriteLine($"{customer} doit {total.ToString("0.00", CultureInfo.InvariantCulture)} EUR");
}

// Change si la façon de stocker change
class InMemoryOrderRepository
{
    private readonly List<(string Customer, decimal Total)> _orders = [];
    public int Count => _orders.Count;
    public void Save(string customer, decimal total) => _orders.Add((customer, total));
}`,
      output: `Alice doit 119.70 EUR
Commandes enregistrées : 1`,
      steps: [
        "<code>record OrderLine(...)</code> : un petit type pour porter une ligne, plus lisible qu'un tuple.",
        "<code>class OrderCalculator</code> : ne fait que calculer. On peut le tester avec une simple assertion, sans console ni base.",
        "<code>class ReceiptPrinter</code> : ne fait qu'afficher. Si le designer veut un autre format, on ne touche qu'ici.",
        "<code>class InMemoryOrderRepository</code> : ne fait que stocker. Demain, on le remplace par une version EF Core.",
        "<code>decimal total = calculator.Total(lines);</code> : le code d'appel assemble les trois briques dans l'ordre."
      ],
      explain: "Plus de classes, mais chacune est petite, testable et ne change que pour une seule raison."
    },
    {
      title: "Ouvert/fermé : des remises en stratégies",
      code: `using System.Globalization;

IDiscountPolicy[] policies = [new NoDiscount(), new LoyaltyDiscount(), new BulkDiscount()];

foreach (var policy in policies)
{
    var checkout = new Checkout(policy);
    decimal total = checkout.Total(amount: 200m, itemCount: 12);
    Console.WriteLine($"{policy.Name,-8} : {total.ToString("0.00", CultureInfo.InvariantCulture)}");
}

interface IDiscountPolicy
{
    string Name { get; }
    decimal Apply(decimal amount, int itemCount);
}

class NoDiscount : IDiscountPolicy
{
    public string Name => "Aucune";
    public decimal Apply(decimal amount, int itemCount) => amount;
}

class LoyaltyDiscount : IDiscountPolicy
{
    public string Name => "Fidélité";
    public decimal Apply(decimal amount, int itemCount) => amount * 0.95m;
}

// Ajoutée plus tard, SANS toucher à Checkout
class BulkDiscount : IDiscountPolicy
{
    public string Name => "Volume";
    public decimal Apply(decimal amount, int itemCount) => itemCount >= 10 ? amount - 20m : amount;
}

// Fermé à la modification : il ne connaît que l'interface
class Checkout(IDiscountPolicy policy)
{
    public decimal Total(decimal amount, int itemCount) => policy.Apply(amount, itemCount);
}`,
      output: `Aucune   : 200.00
Fidélité : 190.00
Volume   : 180.00`,
      steps: [
        "<code>interface IDiscountPolicy</code> : le contrat commun à toutes les remises.",
        "<code>class LoyaltyDiscount : IDiscountPolicy</code> : chaque remise est une classe à part, c'est une stratégie.",
        "<code>class BulkDiscount</code> : une nouvelle remise s'ajoute avec un nouveau fichier. Aucun code existant n'est modifié.",
        "<code>class Checkout(IDiscountPolicy policy)</code> : un constructeur principal (primary constructor). <code>Checkout</code> reçoit la stratégie et ne sait pas laquelle c'est.",
        "<code>{policy.Name,-8}</code> : aligne le nom à gauche sur 8 caractères pour un affichage en colonne."
      ],
      explain: "Le switch a disparu : ajouter une remise ne demande plus de rouvrir Checkout."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Séparer calcul et affichage",
      prompt: `<p>Cette classe calcule la moyenne de notes <strong>et</strong> l'affiche : <code>class Report { public void Show(int[] grades) { double avg = grades.Average(); Console.WriteLine($"Moyenne : {avg}"); } }</code>. Découpe-la en <code>GradeCalculator</code> (renvoie la moyenne) et <code>ReportPrinter</code> (affiche). Teste avec les notes 12, 15 et 18.</p>`,
      hint: `<p><code>GradeCalculator</code> a une méthode <code>double Average(int[] grades)</code> qui ne fait aucun <code>Console.WriteLine</code>.</p>`,
      solution: `var calculator = new GradeCalculator();
var printer = new ReportPrinter();

double average = calculator.Average([12, 15, 18]);
printer.Print(average); // Moyenne : 15

class GradeCalculator
{
    public double Average(int[] grades) => grades.Average();
}

class ReportPrinter
{
    public void Print(double average) => Console.WriteLine($"Moyenne : {average}");
}`
    },
    {
      level: "moyen",
      title: "Ajouter une remise sans toucher à Checkout",
      prompt: `<p>Reprends l'exemple des remises. Ajoute une stratégie <code>FixedCouponDiscount</code> qui reçoit un montant dans son constructeur et le retire du total, sans jamais descendre sous zéro. Vérifie que <code>Checkout</code> n'a pas eu besoin d'être modifié.</p>`,
      hint: `<p><code>Math.Max(0m, amount - coupon)</code> évite un total négatif.</p>`,
      solution: `var checkout = new Checkout(new FixedCouponDiscount(15m));
Console.WriteLine(checkout.Total(40m, 1)); // 25
Console.WriteLine(checkout.Total(10m, 1)); // 0

interface IDiscountPolicy
{
    string Name { get; }
    decimal Apply(decimal amount, int itemCount);
}

class FixedCouponDiscount(decimal coupon) : IDiscountPolicy
{
    public string Name => "Coupon";
    public decimal Apply(decimal amount, int itemCount) => Math.Max(0m, amount - coupon);
}

class Checkout(IDiscountPolicy policy)
{
    public decimal Total(decimal amount, int itemCount) => policy.Apply(amount, itemCount);
}`
    },
    {
      level: "difficile",
      title: "Remplacer un switch de livraison",
      prompt: `<p>Ce code calcule les frais de port : <code>switch (mode) { case "standard": return 4.90m; case "express": return 9.90m; case "relay": return 2.90m; }</code>. Remplace-le par une interface <code>IShippingMethod</code> (propriétés <code>Code</code> et <code>Cost</code>) et une classe <code>ShippingCalculator</code> qui reçoit toutes les méthodes et les range dans un dictionnaire par code. Un code inconnu doit lever une <code>ArgumentException</code>.</p>`,
      hint: `<p>Dans le constructeur : <code>_methods = methods.ToDictionary(m =&gt; m.Code);</code>. Puis <code>TryGetValue</code> dans la méthode de calcul.</p>`,
      solution: `var calculator = new ShippingCalculator([new Standard(), new Express(), new Relay()]);
Console.WriteLine(calculator.CostFor("express") == 9.90m); // True

try { calculator.CostFor("drone"); }
catch (ArgumentException ex) { Console.WriteLine(ex.Message); }

interface IShippingMethod
{
    string Code { get; }
    decimal Cost { get; }
}

class Standard : IShippingMethod { public string Code => "standard"; public decimal Cost => 4.90m; }
class Express : IShippingMethod { public string Code => "express"; public decimal Cost => 9.90m; }
class Relay : IShippingMethod { public string Code => "relay"; public decimal Cost => 2.90m; }

class ShippingCalculator(IEnumerable<IShippingMethod> methods)
{
    private readonly Dictionary<string, IShippingMethod> _methods = methods.ToDictionary(m => m.Code);

    public decimal CostFor(string code) =>
        _methods.TryGetValue(code, out var method)
            ? method.Cost
            : throw new ArgumentException($"Mode de livraison inconnu : {code}");
}`
    }
  ],
  quiz: [
    {
      q: `Que dit vraiment le principe de responsabilité unique ?`,
      options: ["Une classe ne doit avoir qu'une seule méthode", "Une classe ne doit avoir qu'une seule raison de changer", "Une classe ne doit dépendre d'aucune autre"],
      answer: 1,
      why: `Une classe peut avoir plusieurs méthodes, du moment qu'elles servent le même besoin. Le piège « une seule méthode » mène à un découpage absurde.`
    },
    {
      q: `Quel symptôme indique le plus souvent une violation du principe ouvert/fermé ?`,
      options: ["Une classe avec un constructeur principal", "Une méthode async", "Un <code>switch</code> sur un type qu'on rallonge à chaque nouveau besoin"],
      answer: 2,
      why: `Chaque nouveau cas oblige à rouvrir et retester la même méthode. Une interface avec une classe par cas permet d'ajouter sans modifier.`
    },
    {
      q: `Comment s'appelle le pattern où chaque variante d'un comportement vit dans sa propre classe derrière une interface ?`,
      options: ["Strategy", "Singleton", "Repository"],
      answer: 0,
      why: `Strategy encapsule chaque façon de faire dans une classe interchangeable. Repository sert à l'accès aux données, Singleton à n'avoir qu'une instance.`
    },
    {
      q: `Tu as un seul type de remise dans toute l'application. Que fais-tu ?`,
      options: ["Une interface et une classe, au cas où", "Un calcul simple, et tu découperas quand une deuxième ou troisième remise arrivera", "Un switch avec un seul case"],
      answer: 1,
      why: `Les principes SOLID ont un coût. On découpe quand le besoin de variation apparaît vraiment, pas par anticipation.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow</strong>, ouvre le code qui crée une commande (<code>POST /api/orders</code>). Note sur un papier chaque responsabilité : lecture de la requête HTTP, vérification du stock, calcul du total, écriture EF Core, réponse.</p>
<ul><li>Extrais le calcul du total dans une classe <code>OrderPricing</code> (méthode <code>decimal Total(IEnumerable&lt;OrderLine&gt; lines)</code>) et écris deux tests xUnit dessus.</li>
<li>Ajoute une interface <code>IDiscountPolicy</code> avec <code>NoDiscount</code> et <code>LoyaltyDiscount</code> (5 % si le client a déjà 3 commandes payées), et enregistre la stratégie dans l'injection de dépendances.</li></ul>`,
  resources: [
    { label: "Principes d'architecture (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/modern-web-apps-azure/architectural-principles" }
  ]
});

// =====================================================================
// 5.2 SOLID (2/2)
// =====================================================================
window.COURSE.push({
  key: "arc-solid-2",
  title: "SOLID (2/2) : Liskov, ségrégation des interfaces, inversion des dépendances",
  summary: "Tu sauras écrire des héritages sans surprise, des interfaces à la bonne taille, et faire dépendre ton code métier d'abstractions.",
  objectives: [
    "Reconnaître une violation du principe de Liskov",
    "Découper une interface trop large en petites interfaces",
    "Inverser une dépendance avec une interface et l'injection",
    "Faire le lien avec l'injection de dépendances d'ASP.NET Core"
  ],
  analogy: `<p>Une prise électrique est le meilleur exemple. Ta lampe ne dépend pas de la centrale nucléaire ni du barrage : elle dépend de la <strong>prise</strong>, un contrat standard. On peut changer de fournisseur sans changer de lampe : c'est l'<strong>inversion des dépendances</strong>.</p>
<p>Et si un adaptateur promet d'être une prise mais fait sauter les plombs quand on branche un sèche-cheveux, il trahit le contrat : c'est une violation de <strong>Liskov</strong>.</p>`,
  lesson: `<h3>L : un enfant remplace son parent sans surprise</h3>
<p>Le principe de <strong>substitution de Liskov</strong> (LSP, du nom de la chercheuse Barbara Liskov) dit : partout où le code attend un type de base, on doit pouvoir passer n'importe quel type dérivé <strong>sans changer le comportement attendu</strong>. Si une classe enfant lève une exception là où le parent promettait de marcher, ou ignore silencieusement un appel, elle viole LSP.</p>
<p>Exemple : une classe abstraite <code>PaymentMethod</code> déclare <code>Refund()</code>. La carte bancaire rembourse, mais la carte cadeau lève <code>NotSupportedException</code>. Tout code qui boucle sur des <code>PaymentMethod</code> peut exploser. Le problème n'est pas dans la boucle : c'est l'abstraction qui ment.</p>
<div class="tip">Signes d'une violation de Liskov : une méthode redéfinie qui lève <code>NotSupportedException</code> ou <code>NotImplementedException</code>, une méthode redéfinie vide, ou un code appelant obligé de tester <code>if (x is GiftCardPayment)</code>.</div>
<p>La correction : revoir l'abstraction. Si tous les paiements ne sont pas remboursables, « remboursable » est une capacité à part : une interface <code>IRefundable</code> que seules certaines classes implémentent.</p>

<h3>I : des interfaces à la bonne taille</h3>
<p>Le principe de <strong>ségrégation des interfaces</strong> (ISP) dit qu'une classe ne doit pas dépendre de méthodes qu'elle n'utilise pas. Une grosse interface <code>IOrderStore</code> avec <code>GetAll</code>, <code>Add</code>, <code>Delete</code>, <code>Export</code>… oblige un simple rapport de ventes à « connaître » la suppression.</p>
<div class="compare"><div><h4>Une grosse interface</h4><p><code>IOrderStore</code> : 8 méthodes. Le rapport n'en utilise qu'une, mais un faux pour les tests doit en implémenter 8.</p></div><div><h4>Des petites interfaces</h4><p><code>IOrderReader</code> et <code>IOrderWriter</code>. Le rapport reçoit seulement <code>IOrderReader</code>. Une même classe peut implémenter les deux.</p></div></div>

<h3>D : dépendre d'abstractions</h3>
<p>Le principe d'<strong>inversion des dépendances</strong> (DIP) a deux parties. Un : le code de haut niveau (les règles métier) ne doit pas dépendre du code de bas niveau (base de données, email, fichiers) ; les deux dépendent d'une <strong>abstraction</strong>, en général une interface. Deux : cette abstraction appartient au haut niveau, c'est lui qui dit ce dont il a besoin.</p>
<pre class="diagram">
  Sans inversion        Avec inversion

  OrderService          OrderService
       |                     |
       v                     v
  SmtpEmailSender       INotifier (interface)
                             ^
                             | implémente
                        SmtpEmailSender
</pre>
<p>Regarde le sens des flèches : à droite, <code>SmtpEmailSender</code> pointe vers le haut, vers l'interface. La dépendance a été <strong>inversée</strong> : c'est le détail technique qui s'adapte au métier, et non l'inverse.</p>

<h3>DIP et injection de dépendances</h3>
<p>Ne confonds pas les deux. L'<strong>inversion</strong> est un principe de conception (dépendre d'une interface). L'<strong>injection</strong> est une technique : on <em>donne</em> la dépendance à la classe, souvent par son constructeur, au lieu qu'elle fasse <code>new</code> elle-même. Le <strong>conteneur</strong> d'ASP.NET Core (<code>builder.Services.AddScoped&lt;INotifier, EmailNotifier&gt;()</code>) automatise l'injection. C'est exactement ce que tu fais en Angular avec <code>inject(OrderService)</code> ou un provider.</p>
<div class="flow"><span>Interface dans le métier</span><span>Implémentation dans l'infrastructure</span><span>Assemblage dans Program.cs</span></div>
<p>Le gros bénéfice : les tests. Pour tester <code>OrderService</code>, tu lui passes un faux <code>INotifier</code> qui enregistre les messages en mémoire, ou un substitut NSubstitute. Pas de vrai serveur d'email.</p>
<div class="note">Un piège très courant : <code>DateTime.Now</code> au milieu du code métier. C'est une dépendance cachée vers l'horloge du système, impossible à contrôler en test. Depuis .NET 8, injecte <code>TimeProvider</code> (classe abstraite fournie par .NET) et utilise <code>TimeProvider.System</code> en production.</div>`,
  examples: [
    {
      title: "Liskov : la carte cadeau qui trahit le contrat",
      code: `List<PaymentMethod> payments = [new CardPayment(), new GiftCardPayment()];

foreach (var payment in payments)
{
    try
    {
        payment.Refund(30m);
    }
    catch (NotSupportedException ex)
    {
        Console.WriteLine($"Surprise : {ex.Message}");
    }
}

abstract class PaymentMethod
{
    public abstract void Refund(decimal amount);
}

class CardPayment : PaymentMethod
{
    public override void Refund(decimal amount) =>
        Console.WriteLine($"Carte remboursée de {amount} EUR");
}

// Viole Liskov : promet Refund mais refuse de le faire
class GiftCardPayment : PaymentMethod
{
    public override void Refund(decimal amount) =>
        throw new NotSupportedException("une carte cadeau ne se rembourse pas");
}`,
      output: `Carte remboursée de 30 EUR
Surprise : une carte cadeau ne se rembourse pas`,
      steps: [
        "<code>abstract class PaymentMethod</code> : le parent promet que tout paiement sait se rembourser.",
        "<code>CardPayment.Refund</code> : respecte la promesse.",
        "<code>GiftCardPayment.Refund</code> : lève une exception. L'enfant ne peut pas remplacer le parent sans surprise.",
        "<code>catch (NotSupportedException ex)</code> : le code appelant doit se protéger contre un cas que l'abstraction ne laissait pas prévoir.",
        "La vraie correction n'est pas le <code>try/catch</code> : c'est de sortir <code>Refund</code> dans une interface <code>IRefundable</code> (voir l'exercice moyen)."
      ]
    },
    {
      title: "Ségrégation : le rapport ne voit que la lecture",
      code: `var store = new InMemoryOrderStore();
store.Add(new Order(1, 120m));
store.Add(new Order(2, 80m));
store.Add(new Order(3, 45m));
store.Delete(3);

var report = new SalesReport(store); // on lui donne seulement la vue "lecture"
Console.WriteLine($"Chiffre d'affaires : {report.Revenue()} EUR");

record Order(int Id, decimal Total);

interface IOrderReader
{
    IReadOnlyList<Order> GetAll();
}

interface IOrderWriter
{
    void Add(Order order);
    void Delete(int id);
}

// Une classe peut implémenter les deux petites interfaces
class InMemoryOrderStore : IOrderReader, IOrderWriter
{
    private readonly List<Order> _orders = [];
    public IReadOnlyList<Order> GetAll() => _orders;
    public void Add(Order order) => _orders.Add(order);
    public void Delete(int id) => _orders.RemoveAll(o => o.Id == id);
}

// Le rapport ne peut ni ajouter ni supprimer
class SalesReport(IOrderReader reader)
{
    public decimal Revenue() => reader.GetAll().Sum(o => o.Total);
}`,
      output: `Chiffre d'affaires : 200 EUR`,
      steps: [
        "<code>interface IOrderReader</code> et <code>interface IOrderWriter</code> : deux petites interfaces au lieu d'une grosse.",
        "<code>class InMemoryOrderStore : IOrderReader, IOrderWriter</code> : une classe C# peut implémenter plusieurs interfaces.",
        "<code>store.Delete(3);</code> : la commande 3 est retirée, il reste 120 + 80.",
        "<code>class SalesReport(IOrderReader reader)</code> : le rapport déclare n'avoir besoin que de lire. Son faux de test n'aura qu'une méthode.",
        "<code>new SalesReport(store)</code> : on passe le store complet, mais vu à travers <code>IOrderReader</code>."
      ]
    },
    {
      title: "Inversion : le métier dépend d'une interface",
      code: `// Production : la vraie implémentation
var service = new OrderService(new ConsoleNotifier());
service.Confirm(42);

// Test : une fausse implémentation, sans rien afficher
var fake = new FakeNotifier();
var tested = new OrderService(fake);
tested.Confirm(7);
Console.WriteLine($"Messages capturés par le faux : {fake.Sent.Count}");
Console.WriteLine($"Contenu : {fake.Sent[0]}");

// L'abstraction appartient au métier
interface INotifier
{
    void Send(string message);
}

// Haut niveau : la règle métier ne connaît que l'interface
class OrderService(INotifier notifier)
{
    public void Confirm(int orderId) => notifier.Send($"Commande {orderId} confirmée");
}

// Bas niveau : des détails interchangeables
class ConsoleNotifier : INotifier
{
    public void Send(string message) => Console.WriteLine($"[console] {message}");
}

class FakeNotifier : INotifier
{
    public List<string> Sent { get; } = [];
    public void Send(string message) => Sent.Add(message);
}`,
      output: `[console] Commande 42 confirmée
Messages capturés par le faux : 1
Contenu : Commande 7 confirmée`,
      steps: [
        "<code>interface INotifier</code> : le contrat dont le métier a besoin, rien de plus.",
        "<code>class OrderService(INotifier notifier)</code> : la dépendance arrive par le constructeur. <code>OrderService</code> ne fait jamais <code>new ConsoleNotifier()</code>.",
        "<code>new OrderService(new ConsoleNotifier())</code> : en production, on branche la vraie implémentation.",
        "<code>new OrderService(fake)</code> : en test, on branche un faux qui garde les messages dans une liste.",
        "<code>fake.Sent[0]</code> : on peut vérifier ce que le service a envoyé, sans console ni serveur."
      ],
      explain: "Dans une API, c'est le conteneur d'ASP.NET Core qui fait ces new à ta place."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une imprimante qui ne scanne pas",
      prompt: `<p>L'interface <code>IMachine</code> déclare <code>Print(string doc)</code>, <code>Scan()</code> et <code>Fax(string number)</code>. Une <code>SimplePrinter</code> ne sait qu'imprimer. Découpe <code>IMachine</code> en <code>IPrinter</code>, <code>IScanner</code> et <code>IFax</code>, puis écris <code>SimplePrinter</code> et une <code>OfficeMachine</code> qui implémente les trois.</p>`,
      hint: `<p>Une classe peut implémenter plusieurs interfaces : <code>class OfficeMachine : IPrinter, IScanner, IFax</code>.</p>`,
      solution: `IPrinter printer = new SimplePrinter();
printer.Print("facture.pdf");

var office = new OfficeMachine();
office.Print("devis.pdf");
office.Scan();

interface IPrinter { void Print(string doc); }
interface IScanner { void Scan(); }
interface IFax { void Fax(string number); }

class SimplePrinter : IPrinter
{
    public void Print(string doc) => Console.WriteLine($"Impression de {doc}");
}

class OfficeMachine : IPrinter, IScanner, IFax
{
    public void Print(string doc) => Console.WriteLine($"Impression de {doc}");
    public void Scan() => Console.WriteLine("Numérisation");
    public void Fax(string number) => Console.WriteLine($"Fax vers {number}");
}`
    },
    {
      level: "moyen",
      title: "Corriger la carte cadeau",
      prompt: `<p>Reprends l'exemple de Liskov. Remplace la classe abstraite par deux interfaces : <code>IPayment</code> (méthode <code>Pay</code>) et <code>IRefundable</code> (méthode <code>Refund</code>). La carte bancaire implémente les deux, la carte cadeau seulement <code>IPayment</code>. Écris une méthode <code>RefundAll(IEnumerable&lt;IRefundable&gt; items)</code> : plus aucune exception possible.</p>`,
      hint: `<p>Le compilateur t'empêche désormais de passer une carte cadeau à <code>RefundAll</code> : l'erreur est détectée avant l'exécution.</p>`,
      solution: `var card = new CardPayment();
var gift = new GiftCardPayment();
card.Pay(30m);
gift.Pay(20m);

RefundAll([card]); // RefundAll([gift]) ne compile pas

void RefundAll(IEnumerable<IRefundable> items)
{
    foreach (var item in items)
        item.Refund(30m);
}

interface IPayment { void Pay(decimal amount); }
interface IRefundable { void Refund(decimal amount); }

class CardPayment : IPayment, IRefundable
{
    public void Pay(decimal amount) => Console.WriteLine($"Carte : paiement de {amount}");
    public void Refund(decimal amount) => Console.WriteLine($"Carte : remboursement de {amount}");
}

class GiftCardPayment : IPayment
{
    public void Pay(decimal amount) => Console.WriteLine($"Carte cadeau : paiement de {amount}");
}`
    },
    {
      level: "difficile",
      title: "Injecter l'horloge",
      prompt: `<p>La classe <code>OrderService</code> a une méthode <code>bool CanCancel(DateTimeOffset orderDate)</code> qui renvoie <code>true</code> si la commande a moins de 24 heures. Elle utilise <code>DateTimeOffset.UtcNow</code> en dur. Injecte un <code>TimeProvider</code> par le constructeur, puis écris une classe <code>FixedTimeProvider</code> (qui hérite de <code>TimeProvider</code> et redéfinit <code>GetUtcNow()</code>) pour vérifier les deux cas sans attendre 24 heures.</p>`,
      hint: `<p><code>public override DateTimeOffset GetUtcNow() =&gt; now;</code> suffit. En production : <code>new OrderService(TimeProvider.System)</code>.</p>`,
      solution: `var now = new DateTimeOffset(2026, 3, 10, 12, 0, 0, TimeSpan.Zero);
var service = new OrderService(new FixedTimeProvider(now));

Console.WriteLine(service.CanCancel(now.AddHours(-2)));  // True
Console.WriteLine(service.CanCancel(now.AddHours(-30))); // False

class OrderService(TimeProvider clock)
{
    public bool CanCancel(DateTimeOffset orderDate) =>
        clock.GetUtcNow() - orderDate < TimeSpan.FromHours(24);
}

// Une horloge figée pour les tests
class FixedTimeProvider(DateTimeOffset now) : TimeProvider
{
    public override DateTimeOffset GetUtcNow() => now;
}`
    }
  ],
  quiz: [
    {
      q: `Une classe dérivée redéfinit une méthode pour lever <code>NotSupportedException</code>. Quel principe est probablement violé ?`,
      options: ["Ségrégation des interfaces", "Substitution de Liskov", "Responsabilité unique"],
      answer: 1,
      why: `L'enfant ne peut plus remplacer le parent sans surprise : c'est la définition d'une violation de Liskov. La correction passe souvent par une interface plus petite (ce qui rejoint ISP).`
    },
    {
      q: `Ton rapport de ventes ne fait que lire des commandes. Que doit-il recevoir ?`,
      options: ["<code>IOrderReader</code>", "<code>IOrderStore</code> avec toutes les méthodes", "Le <code>DbContext</code> directement"],
      answer: 0,
      why: `Selon ISP, une classe ne dépend que de ce qu'elle utilise. Recevoir l'interface complète ou le DbContext l'expose à des opérations dont elle n'a pas besoin.`
    },
    {
      q: `Dans l'inversion des dépendances, à qui appartient l'interface <code>INotifier</code> ?`,
      options: ["À l'infrastructure, qui sait envoyer des emails", "Au framework ASP.NET Core", "Au code métier, qui exprime son besoin"],
      answer: 2,
      why: `C'est le haut niveau qui définit le contrat ; le bas niveau l'implémente. C'est ce qui « inverse » le sens de la dépendance.`
    },
    {
      q: `Quelle est la différence entre inversion et injection de dépendances ?`,
      options: ["Aucune, ce sont des synonymes", "L'inversion est un principe de conception, l'injection est une technique pour fournir la dépendance", "L'injection n'existe qu'en Angular"],
      answer: 1,
      why: `On peut injecter une classe concrète sans rien inverser, et inverser sans conteneur (en faisant les new à la main dans Program.cs). Les deux vont souvent ensemble.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow</strong> :</p>
<ul><li>Si ton <code>IOrderRepository</code> a beaucoup de méthodes, sépare la lecture (<code>IOrderReader</code> : <code>GetByIdAsync</code>, <code>ListAsync</code>) de l'écriture (<code>IOrderWriter</code> : <code>AddAsync</code>). Une même classe EF Core peut implémenter les deux.</li>
<li>Remplace chaque <code>DateTime.UtcNow</code> du code de commande par un <code>TimeProvider</code> injecté (<code>builder.Services.AddSingleton(TimeProvider.System);</code>), et utilise-le pour remplir <code>OrderDate</code>.</li>
<li>Crée une interface <code>IOrderNotifier</code> avec une implémentation qui écrit dans les logs, appelée quand une commande passe à <code>Paid</code>.</li></ul>`,
  resources: [
    { label: "Injection de dépendances dans .NET (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/core/extensions/dependency-injection" },
    { label: "Principes d'architecture (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/modern-web-apps-azure/architectural-principles" }
  ]
});

// =====================================================================
// 5.3 Organiser en couches
// =====================================================================
window.COURSE.push({
  key: "arc-layers",
  title: "Organiser en couches : présentation, métier, données",
  summary: "Tu sauras ranger ton code en trois couches, faire circuler les données de l'une à l'autre et repérer une logique rangée au mauvais endroit.",
  objectives: [
    "Nommer les trois couches classiques et leur rôle",
    "Respecter le sens des appels : présentation, puis métier, puis données",
    "Utiliser des DTO pour ne pas exposer les entités",
    "Retrouver ces couches dans une API ASP.NET Core"
  ],
  analogy: `<p>Pense à une <strong>banque</strong>. Au guichet, le conseiller t'accueille et prend ta demande (présentation). Dans les bureaux, un analyste vérifie les règles : solde suffisant, plafond respecté (métier). Au sous-sol, le coffre-fort range l'argent (données).</p>
<p>Tu ne descends jamais toi-même au coffre, et le coffre ne te dit pas bonjour. Chaque étage a son métier et ne parle qu'à l'étage voisin.</p>`,
  lesson: `<h3>Pourquoi des couches ?</h3>
<p>Quand tout le code est dans les contrôleurs, une même méthode lit la requête HTTP, vérifie les règles, écrit le SQL et formate la réponse. Ça marche au début. Puis il faut réutiliser une règle dans un job de nuit, changer de base, ou tester un calcul : tout est collé ensemble.</p>
<p>L'<strong>architecture en couches</strong> (on dit aussi <em>n-tier</em>) range le code en étages. Chaque couche a un rôle précis et n'appelle que la couche en dessous. C'est l'application directe du principe de responsabilité unique, à l'échelle de toute l'application.</p>

<h3>Les trois couches classiques</h3>
<table>
<tr><th>Couche</th><th>Rôle</th><th>Exemples dans OrderFlow</th></tr>
<tr><td>Présentation</td><td>Parler à l'extérieur : lire l'entrée, renvoyer la sortie</td><td>Endpoints, contrôleurs, DTO de requête et de réponse, codes HTTP</td></tr>
<tr><td>Métier (<em>business</em>)</td><td>Appliquer les règles</td><td><code>OrderService</code> : stock suffisant, statut valide, calcul du total</td></tr>
<tr><td>Données (<em>data access</em>)</td><td>Lire et écrire le stockage</td><td><code>OrderFlowDbContext</code>, repositories, requêtes SQL</td></tr>
</table>
<div class="flow"><span>Requête HTTP</span><span>Présentation</span><span>Métier</span><span>Données</span><span>SQL Server</span></div>
<p>La règle d'or : <strong>les appels descendent, jamais ne remontent</strong>. Un endpoint appelle un service, un service appelle un repository. Un repository n'appelle jamais un contrôleur, et un service ne renvoie jamais un <code>IActionResult</code>.</p>

<h3>Ce qui ne doit pas être au mauvais étage</h3>
<p>Quelques erreurs reviennent tout le temps. Un <code>if (product.Stock &lt; quantity)</code> dans le contrôleur : c'est une règle métier, elle doit descendre dans le service. Un <code>return NotFound()</code> dans le service : c'est du HTTP, il doit remonter dans la présentation. Un service qui construit du SQL à la main : c'est l'affaire de la couche données.</p>
<div class="tip">Question à te poser devant chaque ligne : « si je remplaçais l'API par une application console, cette ligne serait-elle encore utile ? ». Si oui, ce n'est pas de la présentation.</div>

<h3>Les DTO : des objets pour voyager</h3>
<p>Un <strong>DTO</strong> (<em>Data Transfer Object</em>) est un petit objet sans logique, fait pour transporter des données entre couches ou vers l'extérieur. Pourquoi ne pas renvoyer directement l'entité EF Core <code>Product</code> ? Parce qu'elle peut contenir des champs internes (prix d'achat, marge), des relations qui bouclent en JSON, et que chaque renommage en base casserait ton contrat d'API. Le DTO est la vitrine, l'entité est l'arrière-boutique.</p>
<div class="compare"><div><h4>Entité</h4><p><code>Product</code> : tous les champs de la table, y compris internes. Vit dans les couches métier et données.</p></div><div><h4>DTO</h4><p><code>ProductDto</code> : seulement ce que le client doit voir. Un <code>record</code> est parfait pour ça. Vit à la frontière.</p></div></div>
<p>C'est l'équivalent de tes interfaces TypeScript côté Angular : <code>ProductDto</code> en C# et <code>interface ProductDto</code> en TypeScript décrivent le même contrat JSON.</p>

<h3>Les limites du modèle en couches</h3>
<p>Dans la version classique, le métier dépend de la couche données : <code>ProductService</code> fait <code>new ProductRepository()</code> ou reçoit la classe concrète. La base de données est donc au centre, et tes règles dépendent d'un détail technique. Pour tester le service, il te faut la base.</p>
<pre class="diagram">
  Couches classiques

  [ Présentation ]
         |
         v
  [   Métier     ]
         |
         v
  [   Données    ]  &lt;- tout repose sur la base
</pre>
<p>La leçon suivante retourne cette dernière flèche avec l'inversion des dépendances : c'est l'idée de la Clean Architecture.</p>
<div class="note">Dans une API, garde des endpoints <strong>fins</strong> : lire la requête, appeler un service, traduire le résultat en code HTTP. Si un endpoint dépasse une dizaine de lignes, une règle métier s'y cache sûrement.</div>`,
  examples: [
    {
      title: "Trois couches dans une console",
      code: `using System.Globalization;

// Assemblage : de la couche la plus basse à la plus haute
var ui = new ProductConsoleUi(new ProductService(new ProductRepository()));

ui.Create("Clavier", 49.90m);
ui.Create("Câble", -3m);
ui.ShowAll();

// ===== Présentation : dialogue avec l'utilisateur =====
class ProductConsoleUi(ProductService service)
{
    public void Create(string name, decimal price)
    {
        try { Console.WriteLine($"Créé : #{service.Create(name, price).Id} {name}"); }
        catch (ArgumentException ex) { Console.WriteLine($"Refusé : {ex.Message}"); }
    }

    public void ShowAll() => service.GetAll().ToList().ForEach(p =>
        Console.WriteLine($"- {p.Name} : {p.Price.ToString("0.00", CultureInfo.InvariantCulture)} EUR"));
}

// ===== Métier : les règles =====
class ProductService(ProductRepository repository)
{
    public Product Create(string name, decimal price)
    {
        if (price <= 0) throw new ArgumentException("le prix doit être positif");
        return repository.Add(new Product { Name = name, Price = price });
    }
    public IReadOnlyList<Product> GetAll() => repository.GetAll();
}

// ===== Données : stocker et relire =====
class ProductRepository
{
    private readonly List<Product> _items = [];
    public Product Add(Product p) { p.Id = _items.Count + 1; _items.Add(p); return p; }
    public IReadOnlyList<Product> GetAll() => _items;
}

class Product { public int Id { get; set; } public string Name { get; set; } = ""; public decimal Price { get; set; } }`,
      output: `Créé : #1 Clavier
Refusé : le prix doit être positif
- Clavier : 49.90 EUR`,
      steps: [
        "<code>new ProductConsoleUi(new ProductService(new ProductRepository()))</code> : on construit de bas en haut, chaque couche reçoit celle du dessous.",
        "<code>ProductConsoleUi</code> : la présentation transforme le résultat ou l'erreur en texte. Elle ne contient aucune règle.",
        "<code>if (price &lt;= 0) throw ...</code> : la règle métier vit dans le service. Une API ou un job l'appliqueraient de la même façon.",
        "<code>ProductRepository.Add</code> : la couche données attribue l'Id et range le produit. Elle ne vérifie rien.",
        "<code>ui.Create(\"Câble\", -3m)</code> : le service refuse, la présentation affiche « Refusé »."
      ],
      explain: "Remplace la console par une API : seule la classe ProductConsoleUi change."
    },
    {
      title: "Un DTO pour ne pas exposer l'entité",
      code: `using System.Globalization;

var entity = new Product { Id = 1, Name = "Clavier", Price = 49.90m, PurchasePrice = 31.20m, Stock = 0 };

ProductDto dto = ProductMapper.ToDto(entity);
Console.WriteLine($"Id={dto.Id} Name={dto.Name} Price={dto.Price.ToString(CultureInfo.InvariantCulture)} InStock={dto.InStock}");

// Entité : la ligne de la table, avec des champs internes
class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public decimal PurchasePrice { get; set; } // ne doit jamais sortir
    public int Stock { get; set; }
}

// DTO : uniquement ce que le client doit voir
record ProductDto(int Id, string Name, decimal Price, bool InStock);

static class ProductMapper
{
    public static ProductDto ToDto(Product p) => new(p.Id, p.Name, p.Price, p.Stock > 0);
}`,
      output: `Id=1 Name=Clavier Price=49.90 InStock=False`,
      steps: [
        "<code>class Product</code> : l'entité contient <code>PurchasePrice</code>, une donnée interne à l'entreprise.",
        "<code>record ProductDto(...)</code> : le DTO ne garde que quatre informations, sans le prix d'achat.",
        "<code>p.Stock &gt; 0</code> : le DTO peut aussi simplifier : le client voit « en stock oui/non », pas la quantité exacte.",
        "<code>static class ProductMapper</code> : la conversion est écrite une fois, au même endroit. Pas besoin de bibliothèque de mapping pour ça."
      ]
    },
    {
      title: "Les mêmes couches dans une API",
      code: `// Fichier : Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<ProductRepository>(); // données (en mémoire pour l'exemple)
builder.Services.AddScoped<ProductService>();       // métier
var app = builder.Build();

// Présentation : HTTP seulement, aucune règle ici
app.MapPost("/api/products", (CreateProductRequest req, ProductService service) =>
{
    var product = service.Create(req.Name, req.Price);
    return product is null
        ? Results.BadRequest(new { error = "Le prix doit être positif" })
        : Results.Created($"/api/products/{product.Id}", new ProductDto(product.Id, product.Name, product.Price));
});
app.Run();

record CreateProductRequest(string Name, decimal Price);
record ProductDto(int Id, string Name, decimal Price);

class ProductService(ProductRepository repository)
{
    public Product? Create(string name, decimal price) =>
        price <= 0 ? null : repository.Add(new Product { Name = name, Price = price });
}

class ProductRepository
{
    private readonly List<Product> _items = [];
    public Product Add(Product p) { p.Id = _items.Count + 1; _items.Add(p); return p; }
}

class Product { public int Id { get; set; } public string Name { get; set; } = ""; public decimal Price { get; set; } }`,
      output: `HTTP/1.1 201 Created
Location: /api/products/1

{"id":1,"name":"Clavier","price":49.90}`,
      steps: [
        "<code>builder.Services.AddScoped&lt;ProductService&gt;()</code> : le conteneur d'injection fabriquera le service et lui passera le repository.",
        "<code>app.MapPost(\"/api/products\", ...)</code> : l'endpoint lit le JSON dans <code>CreateProductRequest</code> et appelle le service.",
        "<code>product is null ? Results.BadRequest(...)</code> : la traduction en code HTTP reste dans la présentation.",
        "<code>new ProductDto(...)</code> : on renvoie un DTO, jamais l'entité.",
        "Réponse à <code>POST /api/products</code> avec <code>{\"name\":\"Clavier\",\"price\":49.90}</code> : un 201 avec l'en-tête <code>Location</code>."
      ],
      explain: "Le service ne connaît pas HTTP : il renvoie null, c'est l'endpoint qui décide du 400."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Trier les lignes par couche",
      prompt: `<p>Pour chaque ligne, indique sa couche (présentation, métier ou données) : <code>return Results.NotFound();</code> ; <code>if (order.Status != OrderStatus.Pending) throw …</code> ; <code>await db.Orders.FindAsync(id);</code> ; <code>var req = await JsonSerializer.DeserializeAsync…</code> ; <code>total = lines.Sum(l =&gt; l.Quantity * l.UnitPrice);</code>. Écris la réponse sous forme de commentaires.</p>`,
      hint: `<p>Tout ce qui parle HTTP ou JSON est en présentation, tout ce qui touche la base est en données, le reste (règles, calculs) est métier.</p>`,
      solution: `// return Results.NotFound();                  -> présentation (HTTP)
// if (order.Status != OrderStatus.Pending) ... -> métier (règle)
// await db.Orders.FindAsync(id);               -> données (EF Core)
// JsonSerializer.DeserializeAsync(...)         -> présentation (format d'entrée)
// total = lines.Sum(...)                       -> métier (calcul)
Console.WriteLine("Présentation : 2, métier : 2, données : 1");`
    },
    {
      level: "moyen",
      title: "Sortir une règle du contrôleur",
      prompt: `<p>Un endpoint fait : <code>if (quantity &gt; product.Stock) return Results.BadRequest("Stock insuffisant"); product.Stock -= quantity;</code>. Crée une classe <code>StockService</code> avec une méthode <code>bool TryReserve(Product product, int quantity)</code> qui contient la règle. Teste-la dans une console avec un stock de 5 et deux réservations de 3.</p>`,
      hint: `<p>La méthode renvoie <code>false</code> sans rien modifier si le stock est insuffisant, sinon elle décrémente et renvoie <code>true</code>.</p>`,
      solution: `var product = new Product { Name = "Clavier", Stock = 5 };
var stock = new StockService();

Console.WriteLine(stock.TryReserve(product, 3)); // True
Console.WriteLine(stock.TryReserve(product, 3)); // False
Console.WriteLine(product.Stock);                // 2

class StockService
{
    public bool TryReserve(Product product, int quantity)
    {
        if (quantity <= 0 || quantity > product.Stock) return false;
        product.Stock -= quantity;
        return true;
    }
}

class Product
{
    public string Name { get; set; } = "";
    public int Stock { get; set; }
}`
    },
    {
      level: "difficile",
      title: "Un DTO de commande",
      prompt: `<p>À partir des classes <code>Order</code> (Id, CustomerId, Status, liste de <code>OrderLine</code>) et <code>OrderLine</code> (ProductId, Quantity, UnitPrice), écris un <code>record OrderDto(int Id, string Status, int LineCount, decimal Total)</code> et un mapper. Le statut doit sortir en texte (<code>"Pending"</code>), et le total être calculé. Affiche le DTO d'une commande de deux lignes.</p>`,
      hint: `<p><code>order.Status.ToString()</code> donne le nom de la valeur d'enum. <code>Sum(l =&gt; l.Quantity * l.UnitPrice)</code> calcule le total.</p>`,
      solution: `using System.Globalization;

var order = new Order { Id = 12, CustomerId = 3 };
order.Lines.Add(new OrderLine { ProductId = 1, Quantity = 2, UnitPrice = 10.50m });
order.Lines.Add(new OrderLine { ProductId = 2, Quantity = 1, UnitPrice = 4.00m });

var dto = OrderMapper.ToDto(order);
Console.WriteLine($"{dto.Id} {dto.Status} {dto.LineCount} {dto.Total.ToString(CultureInfo.InvariantCulture)}");
// 12 Pending 2 25.00

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

class Order
{
    public int Id { get; set; }
    public int CustomerId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public List<OrderLine> Lines { get; } = [];
}

class OrderLine
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}

record OrderDto(int Id, string Status, int LineCount, decimal Total);

static class OrderMapper
{
    public static OrderDto ToDto(Order o) =>
        new(o.Id, o.Status.ToString(), o.Lines.Count, o.Lines.Sum(l => l.Quantity * l.UnitPrice));
}`
    }
  ],
  quiz: [
    {
      q: `Dans quelle couche doit se trouver la règle « on ne peut pas commander plus que le stock » ?`,
      options: ["Présentation", "Métier", "Données"],
      answer: 1,
      why: `C'est une règle de l'entreprise : elle doit s'appliquer quel que soit le point d'entrée (API, console, job). La présentation ne fait que traduire le refus en 400.`
    },
    {
      q: `Pourquoi renvoyer un DTO plutôt que l'entité EF Core ?`,
      options: ["Pour ne pas exposer de champs internes et garder un contrat d'API stable", "Parce qu'une entité ne peut pas être sérialisée en JSON", "Parce que les DTO sont plus rapides"],
      answer: 0,
      why: `Une entité se sérialise, mais elle expose tout (prix d'achat, relations) et lie ton contrat public à ton schéma de base. Le DTO est un contrat choisi.`
    },
    {
      q: `Un <code>ProductService</code> renvoie <code>Results.NotFound()</code>. Qu'en penses-tu ?`,
      options: ["C'est correct, le service connaît le résultat", "C'est obligatoire dans une Minimal API", "C'est du HTTP dans la couche métier : le service devrait renvoyer null ou un résultat, l'endpoint choisit le code"],
      answer: 2,
      why: `Le métier ne doit pas connaître HTTP. Sinon, impossible de réutiliser le service dans un job ou une console.`
    },
    {
      q: `Quelle est la principale faiblesse des couches classiques ?`,
      options: ["Il y a trop de couches", "Le métier dépend de la couche données, donc de la base", "La présentation ne peut pas appeler le métier"],
      answer: 1,
      why: `La flèche métier vers données rend les règles dépendantes d'un détail technique. La Clean Architecture inverse cette dépendance.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow.Api</strong>, sans encore créer de nouveaux projets :</p>
<ul><li>Crée trois dossiers : <code>Endpoints</code> (ou <code>Controllers</code>), <code>Services</code> et <code>Data</code>. Range <code>OrderFlowDbContext</code> dans <code>Data</code>.</li>
<li>Crée <code>OrderService</code> et <code>ProductService</code> et déplaces-y toute règle trouvée dans les endpoints (stock suffisant, statut modifiable, calcul du total).</li>
<li>Crée des DTO <code>ProductDto</code>, <code>OrderDto</code> et <code>CreateOrderRequest</code> en <code>record</code> : aucun endpoint ne doit plus renvoyer une entité EF Core.</li></ul>`,
  resources: [
    { label: "Architectures courantes des applications web (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures" }
  ]
});

// =====================================================================
// 5.4 La Clean Architecture
// =====================================================================
window.COURSE.push({
  key: "arc-clean",
  title: "La Clean Architecture",
  summary: "Tu sauras découper OrderFlow en quatre projets (Domain, Application, Infrastructure, Api) qui respectent la règle de dépendance, et le vérifier par un test.",
  objectives: [
    "Comprendre la règle de dépendance : tout pointe vers le centre",
    "Connaître le rôle des projets Domain, Application, Infrastructure et Api",
    "Créer la solution et ses références avec la CLI dotnet",
    "Protéger l'architecture avec un test automatique"
  ],
  analogy: `<p>Pense à un <strong>oignon</strong>. Au cœur, les règles de ton métier : ce qu'est une commande, quand on peut l'annuler. Autour, les cas d'usage : « passer une commande ». Tout à l'extérieur, la peau : la base de données, le web, les emails.</p>
<p>On peut changer la peau (passer de SQL Server à PostgreSQL, d'une API REST à gRPC) sans toucher au cœur. Le cœur, lui, ignore totalement qu'il y a une peau.</p>`,
  lesson: `<h3>L'idée en une phrase</h3>
<p>La <strong>Clean Architecture</strong> (popularisée par Robert C. Martin, alias « Uncle Bob ») pousse l'inversion des dépendances à l'échelle de toute l'application. Le métier est au centre et <strong>ne dépend de rien</strong>. La base de données, le framework web et les services externes sont des détails à la périphérie, qui dépendent du centre. Tu trouveras aussi les noms proches d'architecture hexagonale ou en oignon : même idée.</p>

<h3>La règle de dépendance</h3>
<p>Une seule règle compte : <strong>les dépendances pointent vers l'intérieur</strong>. Un cercle intérieur ne connaît jamais le nom d'une classe d'un cercle extérieur. Le domaine ne fait pas <code>using Microsoft.EntityFrameworkCore;</code>. Les cas d'usage ne connaissent pas <code>HttpContext</code>.</p>
<pre class="diagram">
 +------------------------------------------+
 | Api (endpoints, Program.cs)              |
 |  +------------------------------------+  |
 |  | Infrastructure (EF Core, email)    |  |
 |  |  +------------------------------+  |  |
 |  |  | Application (cas d'usage,    |  |  |
 |  |  |  interfaces IOrderRepository)|  |  |
 |  |  |  +------------------------+  |  |  |
 |  |  |  | Domain (Order, règles) |  |  |  |
 |  |  |  +------------------------+  |  |  |
 |  |  +------------------------------+  |  |
 |  +------------------------------------+  |
 +------------------------------------------+
     les flèches pointent vers le centre
</pre>
<p>Mais alors, comment un cas d'usage enregistre-t-il une commande s'il ne connaît pas EF Core ? Par l'inversion des dépendances : Application déclare une interface <code>IOrderRepository</code> (on l'appelle un <strong>port</strong>), et Infrastructure fournit la classe qui l'implémente avec EF Core (un <strong>adaptateur</strong>). C'est l'Api, au démarrage, qui branche les deux.</p>

<h3>Les quatre projets d'OrderFlow</h3>
<table>
<tr><th>Projet</th><th>Contient</th><th>Référence</th></tr>
<tr><td><code>OrderFlow.Domain</code></td><td>Entités (<code>Order</code>, <code>Product</code>), enums, value objects, règles métier</td><td>Rien</td></tr>
<tr><td><code>OrderFlow.Application</code></td><td>Cas d'usage (handlers), DTO, interfaces (<code>IOrderRepository</code>, <code>IEmailSender</code>)</td><td>Domain</td></tr>
<tr><td><code>OrderFlow.Infrastructure</code></td><td><code>OrderFlowDbContext</code>, migrations, repositories EF Core, envoi d'emails</td><td>Application</td></tr>
<tr><td><code>OrderFlow.Api</code></td><td>Endpoints, middleware, <code>Program.cs</code> (composition)</td><td>Application, Infrastructure</td></tr>
</table>
<p>Voici l'arborescence de la solution :</p>
<pre class="diagram">
OrderFlow/
|-- OrderFlow.slnx
|-- src/
|   |-- OrderFlow.Domain/
|   |   |-- Orders/Order.cs, OrderLine.cs
|   |   |-- Products/Product.cs
|   |   +-- Customers/Customer.cs
|   |-- OrderFlow.Application/
|   |   |-- Abstractions/IOrderRepository.cs
|   |   +-- Orders/PlaceOrder.cs, GetOrder.cs
|   |-- OrderFlow.Infrastructure/
|   |   |-- Persistence/OrderFlowDbContext.cs
|   |   |-- Persistence/OrderRepository.cs
|   |   |-- Migrations/
|   |   +-- DependencyInjection.cs
|   +-- OrderFlow.Api/
|       |-- Endpoints/OrderEndpoints.cs
|       +-- Program.cs
+-- tests/
    |-- OrderFlow.Domain.Tests/
    |-- OrderFlow.Application.Tests/
    +-- OrderFlow.ArchitectureTests/
</pre>
<h3>Le trajet d'une requête</h3>
<p>Suivons un <code>POST /api/orders</code>. L'endpoint (Api) lit le JSON et appelle le cas d'usage <code>PlaceOrder</code> (Application). Celui-ci charge les produits via <code>IProductRepository</code>, demande à l'entité <code>Order</code> (Domain) d'ajouter les lignes en respectant ses règles, puis enregistre via <code>IOrderRepository</code>. À l'exécution, ces interfaces sont des classes EF Core (Infrastructure) injectées par le conteneur. Le code d'Application, lui, n'a jamais vu EF Core.</p>
<div class="flow"><span>Api : endpoint</span><span>Application : PlaceOrder</span><span>Domain : Order.AddLine</span><span>Infrastructure : EF Core</span></div>
<p>Depuis .NET 10, <code>dotnet new sln</code> crée un fichier <code>.slnx</code> : le nouveau format de solution, en XML lisible, qui remplace l'ancien <code>.sln</code>.</p>
<div class="tip">Chaque couche peut offrir une méthode d'extension d'enregistrement, par exemple <code>services.AddInfrastructure(configuration)</code> dans Infrastructure. <code>Program.cs</code> reste alors très court : il appelle <code>AddApplication()</code> puis <code>AddInfrastructure()</code>.</div>

<h3>Ce que tu gagnes, ce que tu paies</h3>
<div class="compare"><div><h4>Gains</h4><p>Le domaine et les cas d'usage se testent sans base ni serveur. La technique (EF Core, fournisseur d'email) se change sans toucher aux règles. Le compilateur interdit les mauvaises références.</p></div><div><h4>Coûts</h4><p>Quatre projets au lieu d'un, plus d'interfaces, plus de fichiers à parcourir. Pour un petit CRUD sans règles, c'est souvent trop.</p></div></div>
<p>Les références entre projets sont ta meilleure protection : si Domain ne référence pas Infrastructure, il est <strong>impossible</strong> d'y écrire <code>using OrderFlow.Infrastructure;</code>. Un test d'architecture ajoute un filet de sécurité pour les dépendances à des packages (par exemple EF Core dans Domain).</p>
<div class="note">Une variante très répandue est le découpage <strong>par fonctionnalité</strong> (<em>vertical slices</em>) : un dossier <code>Orders/PlaceOrder</code> qui contient la requête, le handler et l'endpoint. Elle se combine bien avec la Clean Architecture : les couches pour les dépendances, les fonctionnalités pour ranger les fichiers.</div>`,
  examples: [
    {
      title: "Créer la solution en quatre projets",
      code: `# Dans un terminal, dans un dossier vide OrderFlow/
dotnet new sln -n OrderFlow
dotnet new classlib -n OrderFlow.Domain -o src/OrderFlow.Domain
dotnet new classlib -n OrderFlow.Application -o src/OrderFlow.Application
dotnet new classlib -n OrderFlow.Infrastructure -o src/OrderFlow.Infrastructure
dotnet new webapi -n OrderFlow.Api -o src/OrderFlow.Api
dotnet new xunit -n OrderFlow.ArchitectureTests -o tests/OrderFlow.ArchitectureTests

dotnet sln add src/OrderFlow.Domain src/OrderFlow.Application src/OrderFlow.Infrastructure src/OrderFlow.Api tests/OrderFlow.ArchitectureTests

# Les références : toujours vers l'intérieur
dotnet add src/OrderFlow.Application reference src/OrderFlow.Domain
dotnet add src/OrderFlow.Infrastructure reference src/OrderFlow.Application
dotnet add src/OrderFlow.Api reference src/OrderFlow.Application src/OrderFlow.Infrastructure
dotnet add tests/OrderFlow.ArchitectureTests reference src/OrderFlow.Domain src/OrderFlow.Application src/OrderFlow.Infrastructure

dotnet sln list`,
      output: `Projet(s)
---------
src\\OrderFlow.Api\\OrderFlow.Api.csproj
src\\OrderFlow.Application\\OrderFlow.Application.csproj
src\\OrderFlow.Domain\\OrderFlow.Domain.csproj
src\\OrderFlow.Infrastructure\\OrderFlow.Infrastructure.csproj
tests\\OrderFlow.ArchitectureTests\\OrderFlow.ArchitectureTests.csproj`,
      steps: [
        "<code>dotnet new sln -n OrderFlow</code> : crée <code>OrderFlow.slnx</code>, le fichier qui regroupe les projets.",
        "<code>dotnet new classlib</code> : Domain, Application et Infrastructure sont des bibliothèques de classes, pas des programmes.",
        "<code>dotnet new webapi</code> : seul le projet Api est exécutable ; c'est lui qui démarre le serveur.",
        "<code>dotnet add ... reference ...</code> : chaque référence suit la règle de dépendance. Domain n'en a aucune.",
        "<code>dotnet sln list</code> : affiche les projets de la solution (le SDK répond en français si ton système est en français)."
      ],
      explain: "Le paquet EF Core s'installera dans Infrastructure uniquement : dotnet add src/OrderFlow.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer."
    },
    {
      title: "Les quatre couches simulées dans un seul fichier",
      code: `using OrderFlow.Application;
using OrderFlow.Infrastructure;

// ===== Api : la composition, le seul endroit qui connaît tout le monde =====
IOrderRepository repository = new InMemoryOrderRepository();
var placeOrder = new PlaceOrderUseCase(repository);
int id = placeOrder.Execute(customerId: 7, total: 120m);
Console.WriteLine($"Commande {id} créée pour le client {repository.GetById(id)!.CustomerId}");

namespace OrderFlow.Domain
{
    public class Order(int customerId, decimal total)
    {
        public int Id { get; set; }
        public int CustomerId { get; } = customerId;
        public decimal Total { get; } = total;
    }
}

namespace OrderFlow.Application
{
    using OrderFlow.Domain;
    // Le port : déclaré par Application, implémenté ailleurs
    public interface IOrderRepository { void Add(Order order); Order? GetById(int id); }

    public class PlaceOrderUseCase(IOrderRepository repository)
    {
        public int Execute(int customerId, decimal total)
        {
            var order = new Order(customerId, total);
            repository.Add(order);
            return order.Id;
        }
    }
}

namespace OrderFlow.Infrastructure
{
    using OrderFlow.Application;
    using OrderFlow.Domain;
    // L'adaptateur : ici une liste, en vrai EF Core
    public class InMemoryOrderRepository : IOrderRepository
    {
        private readonly List<Order> _orders = [];
        public void Add(Order order) { order.Id = _orders.Count + 1; _orders.Add(order); }
        public Order? GetById(int id) => _orders.Find(o => o.Id == id);
    }
}`,
      output: `Commande 1 créée pour le client 7`,
      steps: [
        "<code>namespace OrderFlow.Domain { ... }</code> : chaque bloc <code>namespace</code> joue le rôle d'un projet. Domain ne contient aucun <code>using</code>.",
        "<code>public interface IOrderRepository</code> : le port est déclaré dans Application, à côté du cas d'usage qui en a besoin.",
        "<code>PlaceOrderUseCase(IOrderRepository repository)</code> : le cas d'usage ne sait pas si les commandes vont en mémoire ou dans SQL Server.",
        "<code>class InMemoryOrderRepository : IOrderRepository</code> : Infrastructure dépend d'Application pour implémenter le port.",
        "<code>IOrderRepository repository = new InMemoryOrderRepository();</code> : en haut du fichier, la partie Api branche l'adaptateur sur le port."
      ],
      explain: "Dans une vraie solution, ces blocs sont quatre projets et ce sont les références qui interdisent les mauvaises flèches."
    },
    {
      title: "Un test qui protège l'architecture",
      code: `// Fichier : tests/OrderFlow.ArchitectureTests/LayerTests.cs
using OrderFlow.Application;
using OrderFlow.Domain;

namespace OrderFlow.ArchitectureTests;

public class LayerTests
{
    // Les noms des assemblies que référence le projet contenant ce type
    private static string[] ReferencesOf(Type marker) =>
        marker.Assembly.GetReferencedAssemblies()
              .Select(a => a.Name!)
              .ToArray();

    [Fact]
    public void Domain_ne_depend_de_personne()
    {
        var refs = ReferencesOf(typeof(Order));
        Assert.DoesNotContain("OrderFlow.Application", refs);
        Assert.DoesNotContain("OrderFlow.Infrastructure", refs);
        Assert.DoesNotContain("Microsoft.EntityFrameworkCore", refs);
    }

    [Fact]
    public void Application_ne_depend_pas_de_Infrastructure()
    {
        var refs = ReferencesOf(typeof(IOrderRepository));
        Assert.DoesNotContain("OrderFlow.Infrastructure", refs);
    }
}`,
      output: `Réussi!  - échec :     0, réussite :     2, ignorée(s) :     0, total :     2, durée : 1 s - OrderFlow.ArchitectureTests.dll (net10.0)`,
      steps: [
        "<code>typeof(Order).Assembly</code> : on récupère l'assembly (la DLL) du projet Domain à partir d'un de ses types.",
        "<code>GetReferencedAssemblies()</code> : la liste des DLL dont cette DLL a besoin pour fonctionner.",
        "<code>Assert.DoesNotContain(\"Microsoft.EntityFrameworkCore\", refs)</code> : si quelqu'un utilise EF Core dans Domain, le test échoue.",
        "<code>Application_ne_depend_pas_de_Infrastructure</code> : même vérification pour la couche Application.",
        "La sortie est la dernière ligne de <code>dotnet test</code> lancée à la racine de la solution."
      ],
      explain: "Le compilateur n'inscrit une référence que si un type est réellement utilisé : le test détecte donc les vraies dépendances. Des bibliothèques comme NetArchTest offrent des règles plus riches."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Placer chaque classe",
      prompt: `<p>Dans quel projet ranges-tu : <code>OrderStatus</code>, <code>OrderFlowDbContext</code>, <code>IEmailSender</code>, <code>SmtpEmailSender</code>, <code>OrderEndpoints</code>, <code>PlaceOrderHandler</code>, la migration <code>InitialCreate</code> ? Réponds en commentaires.</p>`,
      hint: `<p>Une interface vit avec celui qui en a besoin (Application). Son implémentation technique vit dans Infrastructure.</p>`,
      solution: `// OrderStatus        -> OrderFlow.Domain
// OrderFlowDbContext -> OrderFlow.Infrastructure
// IEmailSender       -> OrderFlow.Application (le port)
// SmtpEmailSender    -> OrderFlow.Infrastructure (l'adaptateur)
// OrderEndpoints     -> OrderFlow.Api
// PlaceOrderHandler  -> OrderFlow.Application
// InitialCreate      -> OrderFlow.Infrastructure (Migrations/)
Console.WriteLine("7 classes rangées");`
    },
    {
      level: "moyen",
      title: "Ajouter un port pour l'email",
      prompt: `<p>Dans l'exemple « quatre couches dans un seul fichier », ajoute dans Application une interface <code>IOrderNotifier</code> (méthode <code>void OrderPlaced(int orderId)</code>), passe-la au cas d'usage, et ajoute dans Infrastructure une <code>ConsoleOrderNotifier</code>. Le cas d'usage appelle le notifier après l'enregistrement.</p>`,
      hint: `<p>Le constructeur principal devient <code>PlaceOrderUseCase(IOrderRepository repository, IOrderNotifier notifier)</code>.</p>`,
      solution: `using OrderFlow.Application;
using OrderFlow.Infrastructure;

var useCase = new PlaceOrderUseCase(new InMemoryOrderRepository(), new ConsoleOrderNotifier());
useCase.Execute(7, 120m); // Notification : commande 1 passée

namespace OrderFlow.Domain
{
    public class Order(int customerId, decimal total)
    {
        public int Id { get; set; }
        public int CustomerId { get; } = customerId;
        public decimal Total { get; } = total;
    }
}

namespace OrderFlow.Application
{
    using OrderFlow.Domain;

    public interface IOrderRepository { void Add(Order order); }
    public interface IOrderNotifier { void OrderPlaced(int orderId); }

    public class PlaceOrderUseCase(IOrderRepository repository, IOrderNotifier notifier)
    {
        public int Execute(int customerId, decimal total)
        {
            var order = new Order(customerId, total);
            repository.Add(order);
            notifier.OrderPlaced(order.Id);
            return order.Id;
        }
    }
}

namespace OrderFlow.Infrastructure
{
    using OrderFlow.Application;
    using OrderFlow.Domain;

    public class InMemoryOrderRepository : IOrderRepository
    {
        private readonly List<Order> _orders = [];
        public void Add(Order order) { order.Id = _orders.Count + 1; _orders.Add(order); }
    }

    public class ConsoleOrderNotifier : IOrderNotifier
    {
        public void OrderPlaced(int orderId) => Console.WriteLine($"Notification : commande {orderId} passée");
    }
}`
    },
    {
      level: "difficile",
      title: "Une méthode d'extension par couche",
      prompt: `<p>Dans OrderFlow.Infrastructure, écris une classe statique <code>DependencyInjection</code> avec une méthode d'extension <code>AddInfrastructure(this IServiceCollection services, IConfiguration configuration)</code> qui enregistre <code>OrderFlowDbContext</code> (chaîne de connexion <code>"OrderFlow"</code>) et <code>IOrderRepository</code> → <code>OrderRepository</code>. Montre ensuite le <code>Program.cs</code> de l'Api qui l'utilise.</p>`,
      hint: `<p>Il faut les packages <code>Microsoft.EntityFrameworkCore.SqlServer</code> dans Infrastructure. <code>configuration.GetConnectionString("OrderFlow")</code> lit la section <code>ConnectionStrings</code>.</p>`,
      solution: `// Fichier : src/OrderFlow.Infrastructure/DependencyInjection.cs
// dotnet add src/OrderFlow.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OrderFlow.Application.Abstractions;
using OrderFlow.Infrastructure.Persistence;

namespace OrderFlow.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<OrderFlowDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("OrderFlow")));
        services.AddScoped<IOrderRepository, OrderRepository>();
        return services;
    }
}

// Fichier : src/OrderFlow.Api/Program.cs
// using OrderFlow.Infrastructure;
// var builder = WebApplication.CreateBuilder(args);
// builder.Services.AddInfrastructure(builder.Configuration);
// var app = builder.Build();
// app.MapOrderEndpoints();
// app.Run();`
    }
  ],
  quiz: [
    {
      q: `Que dit la règle de dépendance de la Clean Architecture ?`,
      options: ["Les dépendances pointent vers l'extérieur, vers la base", "Les dépendances pointent vers l'intérieur, vers le domaine", "Chaque couche peut référencer toutes les autres"],
      answer: 1,
      why: `Le domaine est au centre et ne dépend de rien. Les couches extérieures (Infrastructure, Api) dépendent des couches intérieures, jamais l'inverse.`
    },
    {
      q: `Où se trouve l'interface <code>IOrderRepository</code> ?`,
      options: ["Dans Application, qui exprime son besoin", "Dans Infrastructure, à côté d'EF Core", "Dans Api"],
      answer: 0,
      why: `C'est un port : le cas d'usage le déclare, Infrastructure l'implémente. S'il était dans Infrastructure, Application devrait référencer Infrastructure et la règle serait cassée.`
    },
    {
      q: `Quel projet référence le package <code>Microsoft.EntityFrameworkCore.SqlServer</code> ?`,
      options: ["Domain", "Application", "Infrastructure"],
      answer: 2,
      why: `EF Core est un détail technique : il reste à la périphérie. Domain et Application doivent pouvoir compiler sans lui.`
    },
    {
      q: `Pourquoi l'Api référence-t-elle Infrastructure alors qu'elle n'utilise que les cas d'usage ?`,
      options: ["Pour hériter de ses classes", "Parce que Program.cs est la racine de composition qui branche les adaptateurs sur les ports", "C'est une erreur à corriger"],
      answer: 1,
      why: `Quelqu'un doit dire « IOrderRepository = OrderRepository ». C'est le rôle du point d'entrée, au démarrage, via le conteneur d'injection.`
    }
  ],
  project: `<p>Restructure <strong>OrderFlow</strong> en Clean Architecture :</p>
<ul><li>Crée la solution <code>OrderFlow.slnx</code> avec les projets <code>OrderFlow.Domain</code>, <code>OrderFlow.Application</code>, <code>OrderFlow.Infrastructure</code>, <code>OrderFlow.Api</code> et leurs références (voir l'exemple 1).</li>
<li>Déplace <code>Customer</code>, <code>Product</code>, <code>Order</code>, <code>OrderLine</code> et <code>OrderStatus</code> dans Domain ; les services et DTO dans Application ; <code>OrderFlowDbContext</code>, les configurations et les migrations dans Infrastructure. Si une entité porte des attributs EF Core, remplace-les par des configurations <code>IEntityTypeConfiguration&lt;T&gt;</code> dans Infrastructure.</li>
<li>Ajoute <code>AddInfrastructure()</code> et le projet <code>OrderFlow.ArchitectureTests</code> avec le test de l'exemple 3. Lance <code>dotnet ef migrations list --project src/OrderFlow.Infrastructure --startup-project src/OrderFlow.Api</code> pour vérifier que les migrations sont toujours trouvées.</li></ul>`,
  resources: [
    { label: "Architectures courantes des applications web (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures" }
  ]
});

// =====================================================================
// 5.5 CQRS
// =====================================================================
window.COURSE.push({
  key: "arc-cqrs",
  title: "CQRS : séparer lectures et écritures avec des handlers",
  summary: "Tu sauras séparer les commandes (qui modifient) des requêtes (qui lisent), écrire un handler par cas d'usage et ajouter un comportement commun avec un décorateur.",
  objectives: [
    "Distinguer une commande d'une requête",
    "Écrire des handlers à la main avec deux petites interfaces",
    "Ajouter un comportement transversal (log, validation) avec un décorateur",
    "Brancher les handlers dans une API ASP.NET Core"
  ],
  analogy: `<p>Dans un restaurant, il y a deux circuits. Le <strong>bon de commande</strong> part en cuisine : il change quelque chose (un plat est préparé, le stock baisse). La <strong>carte</strong> sert à consulter : la lire ne change rien en cuisine.</p>
<p>Personne n'imprime la carte en interrogeant le chef à chaque client : elle est préparée pour être lue vite. CQRS, c'est organiser ton code avec ces deux circuits séparés.</p>`,
  lesson: `<h3>Commande ou requête ?</h3>
<p>Le principe de départ est simple : une méthode doit soit <strong>faire</strong> quelque chose, soit <strong>répondre</strong> à une question, jamais les deux. Une <strong>commande</strong> (<em>command</em>) modifie l'état : passer une commande, annuler, payer. Une <strong>requête</strong> (<em>query</em>) lit sans rien modifier : afficher une commande, lister les commandes d'un client.</p>
<p><strong>CQRS</strong> (<em>Command Query Responsibility Segregation</em>) applique cette séparation à toute l'application : les écritures et les lectures passent par des chemins différents, avec des modèles différents.</p>
<div class="compare"><div><h4>Côté écriture (commandes)</h4><p>Charge l'entité, applique les règles métier, enregistre. Utilise le modèle riche (<code>Order</code> avec ses méthodes) et le suivi d'EF Core.</p></div><div><h4>Côté lecture (requêtes)</h4><p>Projette directement vers un DTO avec <code>Select</code> et <code>AsNoTracking</code>, ou avec Dapper. Aucune règle, juste la forme exacte que l'écran attend.</p></div></div>
<p>Pas besoin de deux bases de données : dans 90 % des projets, les deux côtés lisent et écrivent dans la même base SQL Server. La séparation est d'abord dans le code.</p>

<h3>Un handler par cas d'usage</h3>
<p>Au lieu d'un gros <code>OrderService</code> avec quinze méthodes, on écrit une petite classe par cas d'usage : un <strong>handler</strong> (« celui qui traite »). La commande est un <code>record</code> qui décrit l'intention (<code>PlaceOrderCommand</code>), le handler contient le code qui l'exécute (<code>PlaceOrderHandler</code>).</p>
<p>Deux petites interfaces génériques suffisent : <code>ICommandHandler&lt;TCommand, TResult&gt;</code> et <code>IQueryHandler&lt;TQuery, TResult&gt;</code>. Chaque handler est court, a une seule responsabilité, et se teste seul.</p>
<div class="flow"><span>PlaceOrderCommand (record)</span><span>PlaceOrderHandler</span><span>Order + base</span><span>Id créé</span></div>
<p>Si tu as utilisé NgRx en Angular, l'idée est proche : des actions qui déclenchent des modifications d'un côté, des sélecteurs qui lisent l'état de l'autre.</p>

<h3>Les comportements communs : les décorateurs</h3>
<p>Logguer chaque commande, la valider, l'entourer d'une transaction : ces besoins concernent <em>tous</em> les handlers. Plutôt que de copier ce code partout, on écrit un <strong>décorateur</strong> : une classe qui implémente la même interface, reçoit le vrai handler, et ajoute du code avant et après l'appel. C'est le même principe que les intercepteurs <code>HttpInterceptor</code> d'Angular, ou les middlewares d'ASP.NET Core.</p>
<pre class="diagram">
  Appel
    |
    v
  LoggingDecorator      "début PlaceOrder"
    |
    v
  ValidationDecorator   refuse si invalide
    |
    v
  PlaceOrderHandler     le vrai travail
</pre>

<h3>Et MediatR ?</h3>
<p>Beaucoup de projets .NET utilisent la bibliothèque <strong>MediatR</strong> : on envoie la commande à un médiateur (<code>mediator.Send(command)</code>) qui trouve le bon handler, et les décorateurs s'appellent des <em>pipeline behaviors</em>. Attention : depuis 2025, MediatR est sous licence commerciale (payante pour les entreprises au-delà d'une certaine taille). <strong>Wolverine</strong> est une alternative libre, plus complète (messagerie, files). Ici, on écrit les handlers à la main : une vingtaine de lignes, aucune dépendance, et tu comprends exactement ce qui se passe.</p>
<table>
<tr><th>Option</th><th>Avantage</th><th>Inconvénient</th></tr>
<tr><td>Handlers à la main</td><td>Aucune dépendance, explicite, gratuit</td><td>Tu enregistres chaque handler dans l'injection</td></tr>
<tr><td>MediatR</td><td>Très répandu, pipeline intégré</td><td>Licence commerciale depuis 2025, indirection</td></tr>
<tr><td>Wolverine</td><td>Libre, messagerie et files incluses</td><td>Plus de concepts à apprendre</td></tr>
</table>
<div class="tip">Une commande renvoie le minimum : rien, un Id, ou un résultat succès/échec. Si ton handler de commande renvoie un gros DTO pour l'affichage, tu mélanges les deux côtés.</div>
<div class="note">Ne fais pas de CQRS « par principe » sur un CRUD simple. Il brille quand les lectures et les écritures ont des besoins différents : écrans de recherche riches d'un côté, règles métier complexes de l'autre. Commence par des handlers séparés dans la même base, c'est déjà 80 % du bénéfice.</div>`,
  examples: [
    {
      title: "Une commande, une requête, deux handlers",
      code: `using System.Globalization;

var store = new OrderStore();
var placeOrder = new PlaceOrderHandler(store);
var getOrder = new GetOrderSummaryHandler(store);

var command = new PlaceOrderCommand(7, [new(1, 2, 49.90m), new(2, 1, 19.90m)]);
int id = await placeOrder.HandleAsync(command, CancellationToken.None);

var summary = await getOrder.HandleAsync(new GetOrderSummaryQuery(id), CancellationToken.None);
Console.WriteLine($"#{summary!.Id} : {summary.LineCount} lignes, {summary.Total.ToString("0.00", CultureInfo.InvariantCulture)} EUR");

interface ICommandHandler<TCommand, TResult> { Task<TResult> HandleAsync(TCommand command, CancellationToken ct); }
interface IQueryHandler<TQuery, TResult> { Task<TResult> HandleAsync(TQuery query, CancellationToken ct); }

// Écriture : une intention, des règles, une modification
record PlaceOrderCommand(int CustomerId, List<LineInput> Lines);
record LineInput(int ProductId, int Quantity, decimal UnitPrice);

class PlaceOrderHandler(OrderStore store) : ICommandHandler<PlaceOrderCommand, int>
{
    public Task<int> HandleAsync(PlaceOrderCommand command, CancellationToken ct)
    {
        if (command.Lines.Count == 0) throw new ArgumentException("Commande vide");
        int id = store.Orders.Count + 1;
        store.Orders.Add(new StoredOrder(id, command.CustomerId, command.Lines));
        return Task.FromResult(id);
    }
}

// Lecture : une question, une projection, aucune modification
record GetOrderSummaryQuery(int OrderId);
record OrderSummary(int Id, int LineCount, decimal Total);

class GetOrderSummaryHandler(OrderStore store) : IQueryHandler<GetOrderSummaryQuery, OrderSummary?>
{
    public Task<OrderSummary?> HandleAsync(GetOrderSummaryQuery query, CancellationToken ct) =>
        Task.FromResult(store.Orders
            .Where(o => o.Id == query.OrderId)
            .Select(o => new OrderSummary(o.Id, o.Lines.Count, o.Lines.Sum(l => l.Quantity * l.UnitPrice)))
            .FirstOrDefault());
}

record StoredOrder(int Id, int CustomerId, List<LineInput> Lines);
class OrderStore { public List<StoredOrder> Orders { get; } = []; }`,
      output: `#1 : 2 lignes, 119.70 EUR`,
      steps: [
        "<code>interface ICommandHandler&lt;TCommand, TResult&gt;</code> : le contrat de tous les handlers d'écriture. Son jumeau <code>IQueryHandler</code> sert à la lecture.",
        "<code>record PlaceOrderCommand(...)</code> : la commande est une donnée qui décrit l'intention, sans aucune logique.",
        "<code>class PlaceOrderHandler</code> : vérifie la règle (pas de commande vide), enregistre et renvoie seulement l'Id.",
        "<code>.Select(o =&gt; new OrderSummary(...))</code> : la requête projette directement vers la forme attendue. Avec EF Core, ce <code>Select</code> deviendrait une requête SQL ciblée.",
        "<code>Task.FromResult(...)</code> : nos handlers sont asynchrones comme les vrais (EF Core), même si l'exemple travaille en mémoire."
      ],
      explain: "Deux classes courtes, chacune avec un seul rôle : écrire ou lire."
    },
    {
      title: "Un décorateur de log autour de n'importe quel handler",
      code: `// Le vrai handler, enveloppé par un décorateur
ICommandHandler<CancelOrderCommand, bool> handler =
    new LoggingDecorator<CancelOrderCommand, bool>(new CancelOrderHandler());

await handler.HandleAsync(new CancelOrderCommand(42), CancellationToken.None);
await handler.HandleAsync(new CancelOrderCommand(-1), CancellationToken.None);

interface ICommandHandler<TCommand, TResult> { Task<TResult> HandleAsync(TCommand command, CancellationToken ct); }

record CancelOrderCommand(int OrderId);

class CancelOrderHandler : ICommandHandler<CancelOrderCommand, bool>
{
    public Task<bool> HandleAsync(CancelOrderCommand command, CancellationToken ct)
    {
        Console.WriteLine($"  -> annulation de la commande {command.OrderId}");
        return Task.FromResult(command.OrderId > 0);
    }
}

// Ajoute un comportement autour de N'IMPORTE QUEL handler de commande
class LoggingDecorator<TCommand, TResult>(ICommandHandler<TCommand, TResult> inner)
    : ICommandHandler<TCommand, TResult>
{
    public async Task<TResult> HandleAsync(TCommand command, CancellationToken ct)
    {
        Console.WriteLine($"[log] début : {command}");
        var result = await inner.HandleAsync(command, ct);
        Console.WriteLine($"[log] fin {typeof(TCommand).Name} -> {result}");
        return result;
    }
}`,
      output: `[log] début : CancelOrderCommand { OrderId = 42 }
  -> annulation de la commande 42
[log] fin CancelOrderCommand -> True
[log] début : CancelOrderCommand { OrderId = -1 }
  -> annulation de la commande -1
[log] fin CancelOrderCommand -> False`,
      steps: [
        "<code>class LoggingDecorator&lt;TCommand, TResult&gt;</code> : il implémente la même interface que les handlers, donc on peut le mettre à leur place.",
        "<code>(ICommandHandler&lt;TCommand, TResult&gt; inner)</code> : il reçoit le vrai handler à envelopper.",
        "<code>Console.WriteLine($\"[log] début : {command}\")</code> : un record s'affiche avec ses valeurs, pratique pour les logs.",
        "<code>await inner.HandleAsync(command, ct)</code> : le décorateur délègue le vrai travail, puis loggue le résultat.",
        "<code>new LoggingDecorator&lt;...&gt;(new CancelOrderHandler())</code> : le handler ne sait pas qu'il est loggué. On pourrait empiler un décorateur de validation de la même façon."
      ],
      explain: "C'est exactement ce que MediatR appelle un pipeline behavior, sans la bibliothèque."
    },
    {
      title: "Brancher les handlers dans l'API",
      code: `// Fichier : Program.cs (les records et handlers de l'exemple 1 sont dans leurs propres fichiers)
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<OrderStore>();
builder.Services.AddScoped<ICommandHandler<PlaceOrderCommand, int>, PlaceOrderHandler>();
builder.Services.AddScoped<IQueryHandler<GetOrderSummaryQuery, OrderSummary?>, GetOrderSummaryHandler>();
var app = builder.Build();

// Écriture : POST -> une commande
app.MapPost("/api/orders", async (PlaceOrderCommand command,
    ICommandHandler<PlaceOrderCommand, int> handler, CancellationToken ct) =>
{
    int id = await handler.HandleAsync(command, ct);
    return Results.Created($"/api/orders/{id}", new { id });
});

// Lecture : GET -> une requête
app.MapGet("/api/orders/{id:int}", async (int id,
    IQueryHandler<GetOrderSummaryQuery, OrderSummary?> handler, CancellationToken ct) =>
    await handler.HandleAsync(new GetOrderSummaryQuery(id), ct) is { } summary
        ? Results.Ok(summary)
        : Results.NotFound());

app.Run();`,
      output: `POST /api/orders
HTTP/1.1 201 Created
Location: /api/orders/1

{"id":1}

GET /api/orders/1
HTTP/1.1 200 OK

{"id":1,"lineCount":2,"total":119.70}`,
      steps: [
        "<code>AddScoped&lt;ICommandHandler&lt;PlaceOrderCommand, int&gt;, PlaceOrderHandler&gt;()</code> : on enregistre chaque handler sous son interface, comme n'importe quel service.",
        "<code>app.MapPost(\"/api/orders\", async (PlaceOrderCommand command, ...)</code> : le JSON du corps devient directement la commande.",
        "<code>ICommandHandler&lt;PlaceOrderCommand, int&gt; handler</code> : le handler est injecté dans l'endpoint par le conteneur.",
        "<code>is { } summary</code> : un motif qui teste « non null » et nomme la valeur en même temps.",
        "Corps envoyé au POST : <code>{\"customerId\":7,\"lines\":[{\"productId\":1,\"quantity\":2,\"unitPrice\":49.90},{\"productId\":2,\"quantity\":1,\"unitPrice\":19.90}]}</code>."
      ],
      explain: "Les endpoints ne contiennent plus aucune logique : ils traduisent HTTP en commande ou en requête."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Commande ou requête ?",
      prompt: `<p>Classe chacun de ces cas d'usage en commande ou en requête, et propose le nom du <code>record</code> : afficher le détail d'une commande ; annuler une commande ; lister les produits en rupture ; changer l'email d'un client ; calculer le chiffre d'affaires du mois. Réponds en commentaires.</p>`,
      hint: `<p>Pose-toi une seule question : est-ce que l'état de la base change ?</p>`,
      solution: `// Afficher le détail d'une commande -> requête  : GetOrderDetailsQuery
// Annuler une commande              -> commande : CancelOrderCommand
// Lister les produits en rupture    -> requête  : ListOutOfStockProductsQuery
// Changer l'email d'un client       -> commande : ChangeCustomerEmailCommand
// Chiffre d'affaires du mois        -> requête  : GetMonthlyRevenueQuery
Console.WriteLine("2 commandes, 3 requêtes");`
    },
    {
      level: "moyen",
      title: "Lister les commandes d'un client",
      prompt: `<p>En reprenant <code>OrderStore</code> et <code>StoredOrder</code> de l'exemple 1, écris <code>ListCustomerOrdersQuery(int CustomerId)</code> et son handler qui renvoie une <code>List&lt;OrderSummary&gt;</code> triée par Id décroissant. Teste avec deux commandes du client 7 et une du client 8.</p>`,
      hint: `<p><code>Where</code>, puis <code>OrderByDescending(o =&gt; o.Id)</code>, puis <code>Select</code> vers <code>OrderSummary</code>, puis <code>ToList()</code>.</p>`,
      solution: `var store = new OrderStore();
store.Orders.Add(new StoredOrder(1, 7, [new(1, 1, 10m)]));
store.Orders.Add(new StoredOrder(2, 8, [new(1, 3, 10m)]));
store.Orders.Add(new StoredOrder(3, 7, [new(2, 2, 5m)]));

var handler = new ListCustomerOrdersHandler(store);
var orders = await handler.HandleAsync(new ListCustomerOrdersQuery(7), CancellationToken.None);
foreach (var o in orders)
    Console.WriteLine($"#{o.Id} : {o.LineCount} ligne(s)"); // #3 puis #1

interface IQueryHandler<TQuery, TResult> { Task<TResult> HandleAsync(TQuery query, CancellationToken ct); }

record ListCustomerOrdersQuery(int CustomerId);
record OrderSummary(int Id, int LineCount, decimal Total);
record LineInput(int ProductId, int Quantity, decimal UnitPrice);
record StoredOrder(int Id, int CustomerId, List<LineInput> Lines);
class OrderStore { public List<StoredOrder> Orders { get; } = []; }

class ListCustomerOrdersHandler(OrderStore store) : IQueryHandler<ListCustomerOrdersQuery, List<OrderSummary>>
{
    public Task<List<OrderSummary>> HandleAsync(ListCustomerOrdersQuery query, CancellationToken ct) =>
        Task.FromResult(store.Orders
            .Where(o => o.CustomerId == query.CustomerId)
            .OrderByDescending(o => o.Id)
            .Select(o => new OrderSummary(o.Id, o.Lines.Count, o.Lines.Sum(l => l.Quantity * l.UnitPrice)))
            .ToList());
}`
    },
    {
      level: "difficile",
      title: "Un décorateur de validation",
      prompt: `<p>Crée une interface <code>IValidator&lt;T&gt;</code> avec <code>IEnumerable&lt;string&gt; Validate(T item)</code>. Écris un <code>ValidationDecorator&lt;TCommand, TResult&gt;</code> qui reçoit le handler et un validateur, lève une <code>ArgumentException</code> avec toutes les erreurs jointes par <code>"; "</code> s'il y en a, et sinon appelle le handler. Teste avec <code>CancelOrderCommand</code> et un validateur qui refuse un Id négatif ou nul.</p>`,
      hint: `<p><code>var errors = validator.Validate(command).ToList(); if (errors.Count &gt; 0) throw new ArgumentException(string.Join("; ", errors));</code></p>`,
      solution: `ICommandHandler<CancelOrderCommand, bool> handler =
    new ValidationDecorator<CancelOrderCommand, bool>(new CancelOrderHandler(), new CancelOrderValidator());

Console.WriteLine(await handler.HandleAsync(new CancelOrderCommand(42), CancellationToken.None)); // True
try
{
    await handler.HandleAsync(new CancelOrderCommand(0), CancellationToken.None);
}
catch (ArgumentException ex)
{
    Console.WriteLine($"Invalide : {ex.Message}");
}

interface ICommandHandler<TCommand, TResult> { Task<TResult> HandleAsync(TCommand command, CancellationToken ct); }
interface IValidator<T> { IEnumerable<string> Validate(T item); }

record CancelOrderCommand(int OrderId);

class CancelOrderHandler : ICommandHandler<CancelOrderCommand, bool>
{
    public Task<bool> HandleAsync(CancelOrderCommand command, CancellationToken ct) => Task.FromResult(true);
}

class CancelOrderValidator : IValidator<CancelOrderCommand>
{
    public IEnumerable<string> Validate(CancelOrderCommand c)
    {
        if (c.OrderId <= 0) yield return "OrderId doit être positif";
    }
}

class ValidationDecorator<TCommand, TResult>(ICommandHandler<TCommand, TResult> inner, IValidator<TCommand> validator)
    : ICommandHandler<TCommand, TResult>
{
    public Task<TResult> HandleAsync(TCommand command, CancellationToken ct)
    {
        var errors = validator.Validate(command).ToList();
        if (errors.Count > 0) throw new ArgumentException(string.Join("; ", errors));
        return inner.HandleAsync(command, ct);
    }
}`
    }
  ],
  quiz: [
    {
      q: `Que doit renvoyer un handler de <strong>commande</strong>, idéalement ?`,
      options: ["Le minimum : rien, un Id ou un succès/échec", "Le DTO complet utilisé par l'écran", "La liste de toutes les commandes"],
      answer: 0,
      why: `Une commande modifie l'état. Si l'écran a besoin de données, il les demande ensuite avec une requête. Renvoyer un gros DTO mélange les deux côtés.`
    },
    {
      q: `CQRS impose-t-il deux bases de données ?`,
      options: ["Oui, toujours", "Oui, mais seulement avec MediatR", "Non, la séparation peut être seulement dans le code, sur une même base"],
      answer: 2,
      why: `Deux bases (une pour l'écriture, une optimisée pour la lecture) existent dans des systèmes très chargés, mais ce n'est pas obligatoire. La plupart des projets séparent seulement les modèles et les handlers.`
    },
    {
      q: `Comment ajouter un log à tous les handlers sans modifier chacun d'eux ?`,
      options: ["En héritant d'une classe de base <code>LoggedHandler</code>", "Avec un décorateur qui implémente la même interface et enveloppe le handler", "Avec un <code>static</code> partagé"],
      answer: 1,
      why: `Le décorateur ajoute un comportement autour du handler sans le toucher. C'est l'équivalent des pipeline behaviors de MediatR ou des intercepteurs Angular.`
    },
    {
      q: `Pourquoi ce cours écrit-il les handlers à la main plutôt qu'avec MediatR ?`,
      options: ["Parce que MediatR ne fonctionne pas avec .NET 10", "Parce que MediatR est sous licence commerciale depuis 2025 et qu'une vingtaine de lignes suffisent", "Parce que les handlers sont interdits avec MediatR"],
      answer: 1,
      why: `MediatR fonctionne, mais sa licence a changé. Écrire les deux interfaces soi-même évite une dépendance et montre qu'il n'y a pas de magie. Wolverine est une alternative libre.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow.Application</strong> :</p>
<ul><li>Crée un dossier <code>Abstractions</code> avec <code>ICommandHandler&lt;TCommand, TResult&gt;</code> et <code>IQueryHandler&lt;TQuery, TResult&gt;</code>.</li>
<li>Range par fonctionnalité : <code>Orders/PlaceOrder.cs</code> (record + handler), <code>Orders/CancelOrder.cs</code>, <code>Orders/GetOrderById.cs</code>, <code>Products/ListProducts.cs</code>. Les requêtes utilisent <code>AsNoTracking()</code> et <code>Select</code> vers un DTO.</li>
<li>Ajoute une méthode <code>AddApplication()</code> qui enregistre tous les handlers, et un <code>LoggingDecorator</code> qui utilise <code>ILogger</code> au lieu de la console.</li>
<li>Dans OrderFlow.Api, fais en sorte que chaque endpoint de <code>/api/orders</code> appelle un handler et rien d'autre.</li></ul>`,
  resources: [
    { label: "Modèle CQRS (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/azure/architecture/patterns/cqrs" },
    { label: "Appliquer CQRS et DDD simplifiés (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/apply-simplified-microservice-cqrs-ddd-patterns" }
  ]
});

// =====================================================================
// 5.6 DDD tactique
// =====================================================================
window.COURSE.push({
  key: "arc-ddd",
  title: "DDD tactique : entités, value objects, agrégats",
  summary: "Tu sauras modéliser ton domaine avec des entités, des value objects et un agrégat Order qui protège ses propres règles.",
  objectives: [
    "Distinguer une entité d'un value object",
    "Écrire un value object auto-validant avec un record",
    "Construire un agrégat qui garantit ses invariants",
    "Reconnaître un modèle anémique et l'enrichir"
  ],
  analogy: `<p>Ta <strong>carte d'identité</strong> a un numéro unique : même si tu changes d'adresse ou de coiffure, c'est toujours toi. C'est une <strong>entité</strong>. Un <strong>billet de 20 €</strong>, lui, n'a pas d'identité qui compte : deux billets de 20 € se valent. C'est un <strong>value object</strong>.</p>
<p>Et une <strong>voiture</strong> est un agrégat : tu ne changes pas une roue en parlant directement à la roue, tu passes par le garagiste qui vérifie que tout reste cohérent.</p>`,
  lesson: `<h3>DDD en deux mots</h3>
<p>Le <strong>Domain-Driven Design</strong> (DDD, conception pilotée par le domaine, livre d'Eric Evans en 2003) propose de mettre le <strong>métier</strong> au centre du code. Il a deux faces. Le DDD <em>stratégique</em> découpe un grand système en zones cohérentes et pousse à utiliser les mots des experts métier dans le code. Le DDD <em>tactique</em>, l'objet de cette leçon, donne des briques pour écrire le domaine : entités, value objects, agrégats.</p>
<p>Ces briques vivent dans le projet <code>OrderFlow.Domain</code> de ta Clean Architecture.</p>

<h3>Entité : une identité qui dure</h3>
<p>Une <strong>entité</strong> est définie par son <strong>identité</strong>, pas par ses valeurs. Un client dont on change le nom reste le même client : son <code>Id</code> ne bouge pas. Deux entités sont égales si elles ont le même Id. Elles ont un cycle de vie : créées, modifiées, parfois supprimées. Dans OrderFlow : <code>Customer</code>, <code>Product</code>, <code>Order</code>.</p>

<h3>Value object : une valeur qui se suffit</h3>
<p>Un <strong>value object</strong> (objet valeur) est défini <strong>uniquement par ses valeurs</strong>. Deux <code>Money(49.90, "EUR")</code> sont interchangeables. Un value object est <strong>immuable</strong> (on le remplace, on ne le modifie pas) et <strong>auto-validant</strong> : impossible de créer un <code>Email</code> sans arobase ou un montant négatif. Le <code>record</code> C# est parfait : égalité par valeur intégrée.</p>
<div class="compare"><div><h4>Entité</h4><p>Identité (Id), égalité par Id, modifiable via ses méthodes, cycle de vie. Ex. : <code>Customer</code>, <code>Order</code>.</p></div><div><h4>Value object</h4><p>Pas d'Id, égalité par valeurs, immuable, se valide à la création. Ex. : <code>Money</code>, <code>Email</code>, <code>Address</code>.</p></div></div>
<p>Le gain : au lieu de passer des <code>string</code> et des <code>decimal</code> partout en espérant qu'ils soient valides, tu passes des <code>Email</code> et des <code>Money</code> qui le sont forcément. On appelle le défaut inverse l'<em>obsession des types primitifs</em>.</p>

<h3>Agrégat : un gardien de cohérence</h3>
<p>Un <strong>agrégat</strong> est un groupe d'objets qui doivent rester cohérents ensemble, avec une <strong>racine</strong> (<em>aggregate root</em>) qui est la seule porte d'entrée. <code>Order</code> est la racine, <code>OrderLine</code> fait partie de l'agrégat. On n'ajoute jamais une ligne en manipulant directement la liste : on appelle <code>order.AddLine(...)</code>, qui vérifie les règles.</p>
<pre class="diagram">
  Agrégat Order
  +--------------------------------+
  | Order (racine)                 |
  |   Status, CustomerId           |
  |   AddLine() Pay() Cancel()     |
  |   +----------+  +----------+   |
  |   |OrderLine |  |OrderLine |   |
  |   +----------+  +----------+   |
  +--------------------------------+
    CustomerId : référence par Id
    vers l'agrégat Customer
</pre>
<p>Ces règles toujours vraies s'appellent des <strong>invariants</strong> : « une commande payée ne reçoit plus de lignes », « une quantité est positive », « on ne paie pas une commande vide ». La racine les garantit, quel que soit le code qui l'appelle. Trois règles pratiques : on modifie un agrégat uniquement par sa racine ; une transaction modifie un seul agrégat ; un agrégat en référence un autre <strong>par son Id</strong> (<code>CustomerId</code>), pas par l'objet.</p>
<div class="tip">Pour protéger la liste des lignes, garde un champ privé <code>List&lt;OrderLine&gt; _lines</code> et expose <code>IReadOnlyList&lt;OrderLine&gt; Lines =&gt; _lines.AsReadOnly();</code>. Les setters sont <code>private</code>. EF Core sait remplir les champs privés et les setters privés.</div>

<h3>Modèle anémique ou modèle riche</h3>
<p>Un <strong>modèle anémique</strong> est une entité qui n'a que des propriétés publiques <code>get; set;</code>, toutes les règles étant dans des services. N'importe qui peut écrire <code>order.Status = OrderStatus.Paid</code> sans vérifier quoi que ce soit. Un <strong>modèle riche</strong> met les règles dans l'entité : <code>order.Pay()</code>. Le service applicatif (le handler) devient très court : charger, appeler la méthode, enregistrer.</p>
<div class="note">Le DDD tactique coûte du code. Pour une table de référence (pays, catégories), une entité anémique suffit. Réserve le modèle riche aux zones où les règles sont nombreuses et chères à rater, comme les commandes et les paiements.</div>`,
  examples: [
    {
      title: "Des value objects avec des records",
      code: `using System.Globalization;

var a = new Money(49.90m, "EUR");
var b = new Money(49.90m, "EUR");
Console.WriteLine(a == b);                       // égalité par valeur
Console.WriteLine(a.Add(new Money(10m, "EUR"))); // une NOUVELLE valeur

var email = Email.Create("  Alice@Example.COM ");
Console.WriteLine(email.Value);

try { Email.Create("pas-un-email"); }
catch (ArgumentException ex) { Console.WriteLine(ex.Message); }

sealed record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        if (amount < 0) throw new ArgumentException("Montant négatif");
        if (currency.Length != 3) throw new ArgumentException("Devise sur 3 lettres");
        (Amount, Currency) = (amount, currency);
    }

    public Money Add(Money other) => other.Currency == Currency
        ? new Money(Amount + other.Amount, Currency)
        : throw new InvalidOperationException("Devises différentes");

    public override string ToString() => $"{Amount.ToString("0.00", CultureInfo.InvariantCulture)} {Currency}";
}

sealed record Email
{
    public string Value { get; }
    private Email(string value) => Value = value;

    public static Email Create(string raw)
    {
        var value = raw.Trim().ToLowerInvariant();
        return value.Contains('@') ? new Email(value) : throw new ArgumentException($"Email invalide : {raw}");
    }
}`,
      output: `True
59.90 EUR
alice@example.com
Email invalide : pas-un-email`,
      steps: [
        "<code>sealed record Money</code> : un record compare toutes ses propriétés, donc <code>a == b</code> vaut <code>True</code>.",
        "<code>if (amount &lt; 0) throw ...</code> : le constructeur refuse les valeurs invalides. Un <code>Money</code> qui existe est forcément valide.",
        "<code>{ get; }</code> sans <code>init</code> : même <code>with</code> ne peut pas contourner la validation.",
        "<code>Add</code> renvoie un nouveau <code>Money</code> : un value object ne se modifie pas.",
        "<code>private Email(string value)</code> et <code>Email.Create</code> : une méthode de fabrique nettoie (espaces, majuscules) puis valide."
      ]
    },
    {
      title: "Une entité : l'égalité par identité",
      code: `var c1 = new Customer(1, "Alice");
var c2 = new Customer(1, "Alice");
var c3 = new Customer(2, "Alice");

c2.Rename("Alice Martin");

Console.WriteLine(c1.Equals(c2)); // même Id, même client
Console.WriteLine(c1.Equals(c3)); // même nom, autre client
Console.WriteLine(c2.Name);

class Customer
{
    public int Id { get; }
    public string Name { get; private set; }

    public Customer(int id, string name) => (Id, Name) = (id, name);

    public void Rename(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName)) throw new ArgumentException("Nom obligatoire");
        Name = newName.Trim();
    }

    // Deux entités sont égales si elles ont le même Id
    public override bool Equals(object? obj) => obj is Customer other && other.Id == Id;
    public override int GetHashCode() => Id.GetHashCode();
}`,
      output: `True
False
Alice Martin`,
      steps: [
        "<code>public string Name { get; private set; }</code> : le nom ne se change que par une méthode de la classe.",
        "<code>Rename(string newName)</code> : la modification passe par une méthode qui vérifie la règle, au lieu d'un setter public.",
        "<code>Equals(object? obj)</code> : on compare les Id. <code>c1</code> et <code>c2</code> ont des noms différents mais sont le même client.",
        "<code>GetHashCode()</code> : à redéfinir avec <code>Equals</code>, pour que les dictionnaires et <code>HashSet</code> fonctionnent.",
        "<code>class</code> et non <code>record</code> : un record comparerait toutes les valeurs, ce qui est faux pour une entité."
      ]
    },
    {
      title: "L'agrégat Order protège ses règles",
      code: `using System.Globalization;

var order = new Order(customerId: 7);
order.AddLine(productId: 1, quantity: 2, unitPrice: 49.90m);
order.AddLine(productId: 1, quantity: 1, unitPrice: 49.90m); // même produit : on cumule
order.AddLine(productId: 2, quantity: 1, unitPrice: 19.90m);
Console.WriteLine($"{order.Lines.Count} lignes, total {order.Total.ToString("0.00", CultureInfo.InvariantCulture)}");

order.Pay();
try { order.AddLine(3, 1, 5m); }
catch (InvalidOperationException ex) { Console.WriteLine($"Refusé : {ex.Message}"); }
Console.WriteLine(order.Status);

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

class Order(int customerId)
{
    private readonly List<OrderLine> _lines = [];
    public int CustomerId { get; } = customerId;
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();
    public decimal Total => _lines.Sum(l => l.Quantity * l.UnitPrice);

    public void AddLine(int productId, int quantity, decimal unitPrice)
    {
        if (Status != OrderStatus.Pending) throw new InvalidOperationException("commande déjà payée");
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity));
        var existing = _lines.Find(l => l.ProductId == productId);
        if (existing is not null) existing.Increase(quantity);
        else _lines.Add(new OrderLine(productId, quantity, unitPrice));
    }

    public void Pay()
    {
        if (_lines.Count == 0) throw new InvalidOperationException("commande vide");
        Status = Status == OrderStatus.Pending ? OrderStatus.Paid : throw new InvalidOperationException("déjà traitée");
    }
}

class OrderLine(int productId, int quantity, decimal unitPrice)
{
    public int ProductId { get; } = productId;
    public int Quantity { get; private set; } = quantity;
    public decimal UnitPrice { get; } = unitPrice;
    internal void Increase(int quantity) => Quantity += quantity;
}`,
      output: `2 lignes, total 169.60
Refusé : commande déjà payée
Paid`,
      steps: [
        "<code>private readonly List&lt;OrderLine&gt; _lines</code> : la liste réelle est privée. Dehors, on ne voit que <code>Lines</code> en lecture seule.",
        "<code>AddLine(...)</code> : la seule porte pour ajouter une ligne. Elle vérifie le statut et la quantité, et cumule si le produit est déjà présent.",
        "<code>internal void Increase</code> : seule la racine (dans le même projet) peut modifier une ligne.",
        "<code>Pay()</code> : la transition de statut est une méthode métier qui refuse une commande vide ou déjà traitée.",
        "<code>Status { get; private set; }</code> : personne ne peut écrire <code>order.Status = OrderStatus.Paid</code> depuis l'extérieur.",
        "<code>order.AddLine(3, 1, 5m)</code> après <code>Pay()</code> : l'agrégat refuse, l'invariant est protégé."
      ],
      explain: "Le handler PlaceOrder devient : charger les produits, créer l'Order, appeler AddLine, enregistrer."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un value object Quantity",
      prompt: `<p>Écris un <code>sealed record Quantity</code> avec une propriété <code>Value</code> (int) qui refuse 0, les nombres négatifs et les valeurs au-delà de 1000. Ajoute une méthode <code>Add(Quantity other)</code> qui renvoie une nouvelle quantité. Vérifie que <code>new Quantity(2) == new Quantity(2)</code>.</p>`,
      hint: `<p>Utilise <code>ArgumentOutOfRangeException</code> dans le constructeur si <code>value &lt; 1 || value &gt; 1000</code>.</p>`,
      solution: `var q = new Quantity(2);
Console.WriteLine(q == new Quantity(2));  // True
Console.WriteLine(q.Add(new Quantity(3)).Value); // 5

try { new Quantity(0); }
catch (ArgumentOutOfRangeException) { Console.WriteLine("Quantité refusée"); }

sealed record Quantity
{
    public int Value { get; }

    public Quantity(int value)
    {
        if (value < 1 || value > 1000) throw new ArgumentOutOfRangeException(nameof(value));
        Value = value;
    }

    public Quantity Add(Quantity other) => new(Value + other.Value);
}`
    },
    {
      level: "moyen",
      title: "Un client avec un Email",
      prompt: `<p>Reprends <code>Email</code> de l'exemple 1. Écris une entité <code>Customer</code> (Id, Name, Email de type <code>Email</code>) avec une méthode <code>ChangeEmail(Email newEmail)</code>. Comme le paramètre est un <code>Email</code>, il est déjà valide : la méthode n'a rien à vérifier. Affiche l'email avant et après.</p>`,
      hint: `<p>Le type fait le travail : <code>ChangeEmail(Email newEmail) =&gt; Email = newEmail;</code>.</p>`,
      solution: `var customer = new Customer(1, "Alice", Email.Create("alice@old.com"));
Console.WriteLine(customer.Email.Value);
customer.ChangeEmail(Email.Create("Alice@New.com"));
Console.WriteLine(customer.Email.Value); // alice@new.com

class Customer(int id, string name, Email email)
{
    public int Id { get; } = id;
    public string Name { get; private set; } = name;
    public Email Email { get; private set; } = email;

    public void ChangeEmail(Email newEmail) => Email = newEmail;
}

sealed record Email
{
    public string Value { get; }
    private Email(string value) => Value = value;

    public static Email Create(string raw)
    {
        var value = raw.Trim().ToLowerInvariant();
        return value.Contains('@') ? new Email(value) : throw new ArgumentException($"Email invalide : {raw}");
    }
}`
    },
    {
      level: "difficile",
      title: "Annuler et expédier",
      prompt: `<p>Ajoute à l'agrégat <code>Order</code> de l'exemple 3 deux méthodes : <code>Ship()</code> (seulement depuis <code>Paid</code>) et <code>Cancel()</code> (possible depuis <code>Pending</code> ou <code>Paid</code>, interdit une fois <code>Shipped</code>). Ajoute aussi <code>RemoveLine(int productId)</code>, permis seulement en <code>Pending</code>. Écris un scénario qui teste un refus.</p>`,
      hint: `<p>Un <code>switch</code> sur <code>Status</code> rend les transitions lisibles : <code>Status = Status switch { OrderStatus.Pending or OrderStatus.Paid =&gt; OrderStatus.Cancelled, _ =&gt; throw ... };</code></p>`,
      solution: `var order = new Order(7);
order.AddLine(1, 2, 10m);
order.Pay();
order.Ship();
try { order.Cancel(); }
catch (InvalidOperationException ex) { Console.WriteLine(ex.Message); } // déjà expédiée
Console.WriteLine(order.Status); // Shipped

enum OrderStatus { Pending, Paid, Shipped, Cancelled }

class Order(int customerId)
{
    private readonly List<OrderLine> _lines = [];
    public int CustomerId { get; } = customerId;
    public OrderStatus Status { get; private set; } = OrderStatus.Pending;
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();

    public void AddLine(int productId, int quantity, decimal unitPrice)
    {
        EnsurePending();
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity));
        _lines.Add(new OrderLine(productId, quantity, unitPrice));
    }

    public void RemoveLine(int productId)
    {
        EnsurePending();
        _lines.RemoveAll(l => l.ProductId == productId);
    }

    public void Pay()
    {
        EnsurePending();
        if (_lines.Count == 0) throw new InvalidOperationException("commande vide");
        Status = OrderStatus.Paid;
    }

    public void Ship() => Status = Status == OrderStatus.Paid
        ? OrderStatus.Shipped
        : throw new InvalidOperationException("seule une commande payée peut être expédiée");

    public void Cancel() => Status = Status switch
    {
        OrderStatus.Pending or OrderStatus.Paid => OrderStatus.Cancelled,
        _ => throw new InvalidOperationException("commande déjà expédiée ou annulée")
    };

    private void EnsurePending()
    {
        if (Status != OrderStatus.Pending) throw new InvalidOperationException("commande non modifiable");
    }
}

record OrderLine(int ProductId, int Quantity, decimal UnitPrice);`
    }
  ],
  quiz: [
    {
      q: `Deux objets <code>Money(10, "EUR")</code> créés séparément sont-ils égaux ?`,
      options: ["Oui, un value object est défini par ses valeurs", "Non, ce sont deux objets différents en mémoire", "Seulement s'ils ont le même Id"],
      answer: 0,
      why: `Un value object n'a pas d'identité : seules les valeurs comptent. Avec un <code>record</code>, C# génère cette égalité par valeur.`
    },
    {
      q: `Pourquoi <code>Customer</code> est-il une entité et pas un value object ?`,
      options: ["Parce qu'il a beaucoup de propriétés", "Parce qu'il garde son identité même quand ses valeurs changent", "Parce qu'il est stocké en base"],
      answer: 1,
      why: `Un client qui change de nom ou d'email reste le même client. C'est l'identité (l'Id) qui le définit. Une adresse ou un montant, eux, sont des valeurs.`
    },
    {
      q: `Comment ajouter une ligne à une commande dans un modèle riche ?`,
      options: ["<code>order.Lines.Add(new OrderLine(...))</code>", "<code>db.OrderLines.Add(...)</code> directement", "<code>order.AddLine(...)</code>, la racine vérifie les règles"],
      answer: 2,
      why: `On passe toujours par la racine de l'agrégat, qui garantit les invariants (statut, quantité). Exposer la liste en écriture permettrait de les contourner.`
    },
    {
      q: `Comment l'agrégat <code>Order</code> doit-il référencer le client ?`,
      options: ["Par son Id : <code>CustomerId</code>", "En contenant l'objet <code>Customer</code> complet et en le modifiant", "Il ne doit pas le référencer"],
      answer: 0,
      why: `Chaque agrégat est une frontière de cohérence. Référencer par Id évite de charger et modifier deux agrégats dans la même opération.`
    }
  ],
  project: `<p>Enrichis <strong>OrderFlow.Domain</strong> :</p>
<ul><li>Transforme <code>Order</code> en agrégat : champ privé <code>_lines</code>, setters privés, méthodes <code>AddLine</code>, <code>RemoveLine</code>, <code>Pay</code>, <code>Ship</code>, <code>Cancel</code> qui respectent les statuts Pending, Paid, Shipped, Cancelled.</li>
<li>Crée les value objects <code>Email</code> (pour <code>Customer</code>) et <code>Money</code>. Dans Infrastructure, mappe <code>Email</code> avec une conversion EF Core : <code>builder.Property(c =&gt; c.Email).HasConversion(e =&gt; e.Value, v =&gt; Email.Create(v)).HasMaxLength(200);</code>.</li>
<li>Indique à EF Core d'utiliser le champ privé : <code>builder.Navigation(o =&gt; o.Lines).UsePropertyAccessMode(PropertyAccessMode.Field);</code>, puis vérifie avec une migration que le schéma <code>Orders</code> / <code>OrderLines</code> n'a pas changé.</li>
<li>Écris des tests xUnit sur l'agrégat : ajout après paiement refusé, annulation après expédition refusée.</li></ul>`,
  resources: [
    { label: "Concevoir un modèle de domaine DDD (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/ddd-oriented-microservice" },
    { label: "Implémenter des objets valeur (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/implement-value-objects" }
  ]
});

// =====================================================================
// 5.7 Erreurs métier : exceptions ou Result
// =====================================================================
window.COURSE.push({
  key: "arc-result",
  title: "Gérer les erreurs métier : exceptions ou Result pattern",
  summary: "Tu sauras choisir entre exception et Result, écrire un petit type Result et traduire les erreurs métier en réponses HTTP ProblemDetails.",
  objectives: [
    "Distinguer une erreur métier attendue d'une erreur inattendue",
    "Écrire un type Result<T> minimal avec une erreur typée",
    "Traduire une erreur métier en code HTTP au même endroit",
    "Choisir une convention et s'y tenir dans tout le projet"
  ],
  analogy: `<p>Au distributeur de billets, « solde insuffisant » n'est pas une panne : c'est une <strong>réponse normale</strong>, prévue, affichée proprement à l'écran. C'est le rôle d'un <strong>Result</strong>.</p>
<p>Si la machine prend feu, en revanche, on ne l'affiche pas comme un message : on coupe tout et on appelle un technicien. C'est le rôle d'une <strong>exception</strong>.</p>`,
  lesson: `<h3>Deux familles d'erreurs</h3>
<p>Toutes les erreurs ne se ressemblent pas. Une <strong>erreur métier attendue</strong> fait partie du fonctionnement normal : commande introuvable, stock insuffisant, commande déjà payée. Une <strong>erreur inattendue</strong> signale un problème technique ou un bug : base de données injoignable, <code>NullReferenceException</code>, disque plein.</p>
<table>
<tr><th>Situation</th><th>Famille</th><th>Outil conseillé</th></tr>
<tr><td>Commande introuvable, déjà payée, stock insuffisant</td><td>Métier, attendue</td><td>Result (ou exception métier)</td></tr>
<tr><td>Données de requête invalides</td><td>Validation, attendue</td><td>Result ou validation en entrée (400)</td></tr>
<tr><td>SQL Server ne répond pas, bug, timeout</td><td>Technique, inattendue</td><td>Exception, gérée globalement (500)</td></tr>
</table>

<h3>Option 1 : les exceptions métier</h3>
<p>C'est l'approche la plus simple : on lève une <code>OrderNotFoundException</code> ou une <code>InvalidOperationException</code>, et un gestionnaire global (<code>IExceptionHandler</code>, vu dans la partie API) la traduit en 404 ou 409. Le code reste court. Les inconvénients : la signature <code>decimal Pay(int id)</code> ne dit pas qu'elle peut échouer, l'appelant peut oublier le <code>catch</code>, et lever une exception coûte cher (capture de la pile d'appels) quand c'est fréquent.</p>

<h3>Option 2 : le Result pattern</h3>
<p>Le <strong>Result pattern</strong> renvoie l'échec comme une <strong>valeur</strong>. La méthode renvoie un <code>Result&lt;decimal&gt;</code> qui contient soit la valeur, soit une <code>Error</code>. L'échec est visible dans la signature : impossible d'ignorer qu'il peut arriver. C'est proche de ce que tu fais en TypeScript avec un type <code>{ ok: true, value } | { ok: false, error }</code>.</p>
<div class="flow"><span>Handler</span><span>Result : succès ou Error</span><span>Endpoint</span><span>200 ou ProblemDetails</span></div>
<p>Une <code>Error</code> porte un <strong>code</strong> stable (<code>"Order.AlreadyPaid"</code>), un <strong>message</strong> lisible et un <strong>type</strong> (NotFound, Conflict, Validation) qui servira à choisir le code HTTP. Le code stable est précieux côté Angular : le front peut afficher un message adapté sans analyser le texte.</p>
<div class="compare"><div><h4>Exceptions</h4><p>Peu de code, signature muette, coût à l'exécution, flux de contrôle caché. Très bien pour l'inattendu.</p></div><div><h4>Result</h4><p>Un peu plus de code, échec explicite dans la signature, pas de coût caché. Très bien pour le métier attendu.</p></div></div>

<h3>Traduire en HTTP au même endroit</h3>
<p>La traduction <code>Error</code> vers HTTP se fait une seule fois, dans une méthode d'extension de la couche Api : NotFound devient 404, Conflict 409, Validation 400. La réponse suit le format standard <strong>ProblemDetails</strong> (RFC 9457) avec <code>Results.Problem(...)</code>, et le code d'erreur voyage dans une extension <code>code</code>. Le handler ne connaît jamais HTTP : la règle de dépendance est respectée.</p>
<div class="tip">Ne mélange pas les deux styles pour le même type d'erreur. Choisis une convention pour le projet (par exemple : Result pour le métier, exceptions pour le technique) et écris-la dans le README de l'équipe.</div>

<h3>Écrire son Result ou prendre une bibliothèque ?</h3>
<p>Un Result minimal tient en vingt lignes, et c'est ce que nous écrivons. Des bibliothèques comme <strong>ErrorOr</strong>, <strong>FluentResults</strong> ou <strong>OneOf</strong> ajoutent des méthodes pratiques (<code>Match</code>, enchaînements, listes d'erreurs). Elles ne sont pas nécessaires pour commencer.</p>
<div class="note">Un Result ne remplace pas le gestionnaire global d'exceptions : il le complète. Garde <code>IExceptionHandler</code> pour transformer toute exception imprévue en 500 propre avec un <code>traceId</code>, sans jamais exposer la pile d'appels au client.</div>`,
  examples: [
    {
      title: "Version exceptions",
      code: `var service = new PaymentService();

foreach (var id in new[] { 1, 2, 99 })
{
    try
    {
        decimal amount = service.Pay(id);
        Console.WriteLine($"#{id} payée : {amount} EUR");
    }
    catch (OrderNotFoundException ex) { Console.WriteLine($"#{id} -> 404 : {ex.Message}"); }
    catch (InvalidOperationException ex) { Console.WriteLine($"#{id} -> 409 : {ex.Message}"); }
}

class OrderNotFoundException(int id) : Exception($"commande {id} introuvable");

class PaymentService
{
    private readonly Dictionary<int, (decimal Total, bool Paid)> _orders = new()
    {
        [1] = (120m, false),
        [2] = (80m, true),
    };

    // La signature ne dit pas que ça peut échouer
    public decimal Pay(int id)
    {
        if (!_orders.TryGetValue(id, out var order)) throw new OrderNotFoundException(id);
        if (order.Paid) throw new InvalidOperationException($"commande {id} déjà payée");
        _orders[id] = (order.Total, true);
        return order.Total;
    }
}`,
      output: `#1 payée : 120 EUR
#2 -> 409 : commande 2 déjà payée
#99 -> 404 : commande 99 introuvable`,
      steps: [
        "<code>class OrderNotFoundException(int id) : Exception(...)</code> : une exception métier dédiée, déclarée avec un constructeur principal.",
        "<code>public decimal Pay(int id)</code> : rien dans la signature n'indique les deux cas d'échec.",
        "<code>throw new InvalidOperationException(...)</code> : l'erreur interrompt la méthode et remonte jusqu'au premier <code>catch</code> compatible.",
        "<code>catch (OrderNotFoundException ex)</code> : l'appelant doit connaître les types d'exception pour choisir le bon code. Dans une API, ce rôle revient au gestionnaire global."
      ],
      explain: "Ça fonctionne, mais oublier un catch transforme une erreur métier normale en 500."
    },
    {
      title: "Version Result",
      code: `var service = new PaymentService();

foreach (var id in new[] { 1, 2, 99 })
{
    Result<decimal> result = service.Pay(id);
    Console.WriteLine(result.IsSuccess
        ? $"#{id} payée : {result.Value} EUR"
        : $"#{id} refusée [{result.Error!.Code}] {result.Error.Message}");
}

enum ErrorType { NotFound, Conflict, Validation }
record Error(string Code, string Message, ErrorType Type);

sealed class Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess => Error is null;

    private Result(T? value, Error? error) => (Value, Error) = (value, error);

    // Conversions implicites : on écrit "return valeur;" ou "return erreur;"
    public static implicit operator Result<T>(T value) => new(value, null);
    public static implicit operator Result<T>(Error error) => new(default, error);
}

static class OrderErrors
{
    public static Error NotFound(int id) => new("Order.NotFound", $"Commande {id} introuvable", ErrorType.NotFound);
    public static Error AlreadyPaid(int id) => new("Order.AlreadyPaid", $"Commande {id} déjà payée", ErrorType.Conflict);
}

class PaymentService
{
    private readonly Dictionary<int, (decimal Total, bool Paid)> _orders = new() { [1] = (120m, false), [2] = (80m, true) };

    public Result<decimal> Pay(int id)
    {
        if (!_orders.TryGetValue(id, out var order)) return OrderErrors.NotFound(id);
        if (order.Paid) return OrderErrors.AlreadyPaid(id);
        _orders[id] = (order.Total, true);
        return order.Total;
    }
}`,
      output: `#1 payée : 120 EUR
#2 refusée [Order.AlreadyPaid] Commande 2 déjà payée
#99 refusée [Order.NotFound] Commande 99 introuvable`,
      steps: [
        "<code>record Error(string Code, string Message, ErrorType Type)</code> : une erreur est une simple valeur, avec un code stable pour le front.",
        "<code>sealed class Result&lt;T&gt;</code> : contient soit une valeur, soit une erreur. <code>IsSuccess</code> dit lequel.",
        "<code>implicit operator Result&lt;T&gt;(T value)</code> : permet d'écrire <code>return order.Total;</code> sans <code>Result.Success(...)</code>.",
        "<code>static class OrderErrors</code> : toutes les erreurs du domaine Order sont rangées au même endroit.",
        "<code>public Result&lt;decimal&gt; Pay(int id)</code> : la signature annonce clairement que l'opération peut échouer.",
        "<code>result.IsSuccess ? ... : ...</code> : l'appelant est obligé de regarder le résultat pour obtenir la valeur."
      ],
      explain: "Aucun try/catch : les échecs prévus sont des valeurs comme les autres."
    },
    {
      title: "Traduire une Error en ProblemDetails",
      code: `// Fichier : Program.cs (Result, Error, OrderErrors et PaymentService de l'exemple 2)
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddSingleton<PaymentService>();
var app = builder.Build();

app.MapPost("/api/orders/{id:int}/pay", (int id, PaymentService service) =>
{
    var result = service.Pay(id);
    return result.IsSuccess
        ? Results.Ok(new { id, paid = result.Value })
        : result.Error!.ToProblem();
});

app.Run();

static class ErrorHttpExtensions
{
    // Une seule traduction Error -> HTTP pour toute l'API
    public static IResult ToProblem(this Error error) => Results.Problem(
        statusCode: error.Type switch
        {
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            _ => StatusCodes.Status400BadRequest
        },
        title: error.Message,
        extensions: new Dictionary<string, object?> { ["code"] = error.Code });
}`,
      output: `POST /api/orders/1/pay
HTTP/1.1 200 OK

{"id":1,"paid":120}

POST /api/orders/1/pay
HTTP/1.1 409 Conflict
Content-Type: application/problem+json

{"type":"https://tools.ietf.org/html/rfc9110#section-15.5.10","title":"Commande 1 déjà payée","status":409,"code":"Order.AlreadyPaid","traceId":"00-7f13955cc4f5828028472933a8d586c0-5c6f13134f3d1b22-00"}`,
      steps: [
        "<code>builder.Services.AddProblemDetails()</code> : active le format ProblemDetails standard pour les réponses d'erreur.",
        "<code>return result.IsSuccess ? Results.Ok(...) : result.Error!.ToProblem();</code> : l'endpoint ne fait que traduire, il ne contient aucune règle.",
        "<code>public static IResult ToProblem(this Error error)</code> : une méthode d'extension, écrite une seule fois pour toute l'API.",
        "<code>error.Type switch { ... }</code> : le type de l'erreur choisit le code HTTP (404, 409, 400).",
        "<code>extensions: ... [\"code\"] = error.Code</code> : le code stable est ajouté au JSON, pour que le front Angular réagisse sans lire le message.",
        "Le deuxième appel sur la même commande renvoie 409. <code>AddProblemDetails</code> ajoute aussi un <code>traceId</code> (différent à chaque appel) pour retrouver la requête dans les logs."
      ],
      explain: "Le handler ignore HTTP ; l'Api traduit. La règle de dépendance de la Clean Architecture est respectée."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Réserver du stock avec un Result",
      prompt: `<p>Avec <code>Result&lt;T&gt;</code>, <code>Error</code> et <code>ErrorType</code> de l'exemple 2, écris une fonction <code>Result&lt;int&gt; Reserve(int stock, int quantity)</code> qui renvoie le stock restant, ou une erreur <code>"Stock.Insufficient"</code> de type Conflict si la quantité dépasse le stock. Teste les deux cas.</p>`,
      hint: `<p>Grâce aux conversions implicites : <code>return stock - quantity;</code> ou <code>return new Error(...);</code>.</p>`,
      solution: `var ok = Reserve(10, 3);
var ko = Reserve(2, 5);
Console.WriteLine(ok.IsSuccess ? $"Reste {ok.Value}" : ok.Error!.Code); // Reste 7
Console.WriteLine(ko.IsSuccess ? $"Reste {ko.Value}" : ko.Error!.Code); // Stock.Insufficient

Result<int> Reserve(int stock, int quantity)
{
    if (quantity > stock)
        return new Error("Stock.Insufficient", $"Stock insuffisant : {stock} disponible(s)", ErrorType.Conflict);
    return stock - quantity;
}

enum ErrorType { NotFound, Conflict, Validation }
record Error(string Code, string Message, ErrorType Type);

sealed class Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess => Error is null;
    private Result(T? value, Error? error) => (Value, Error) = (value, error);
    public static implicit operator Result<T>(T value) => new(value, null);
    public static implicit operator Result<T>(Error error) => new(default, error);
}`
    },
    {
      level: "moyen",
      title: "Ajouter Match au Result",
      prompt: `<p>Ajoute à <code>Result&lt;T&gt;</code> une méthode <code>TOut Match&lt;TOut&gt;(Func&lt;T, TOut&gt; onSuccess, Func&lt;Error, TOut&gt; onFailure)</code>. Elle appelle la bonne fonction selon le cas. Réécris la boucle de l'exemple 2 avec <code>Match</code> au lieu de l'opérateur ternaire.</p>`,
      hint: `<p><code>IsSuccess ? onSuccess(Value!) : onFailure(Error!)</code></p>`,
      solution: `Result<decimal> ok = 120m;
Result<decimal> ko = new Error("Order.NotFound", "Commande 99 introuvable", ErrorType.NotFound);

foreach (var result in new[] { ok, ko })
{
    string text = result.Match(
        value => $"payée : {value} EUR",
        error => $"refusée : {error.Message}");
    Console.WriteLine(text);
}

enum ErrorType { NotFound, Conflict, Validation }
record Error(string Code, string Message, ErrorType Type);

sealed class Result<T>
{
    public T? Value { get; }
    public Error? Error { get; }
    public bool IsSuccess => Error is null;
    private Result(T? value, Error? error) => (Value, Error) = (value, error);
    public static implicit operator Result<T>(T value) => new(value, null);
    public static implicit operator Result<T>(Error error) => new(default, error);

    public TOut Match<TOut>(Func<T, TOut> onSuccess, Func<Error, TOut> onFailure) =>
        IsSuccess ? onSuccess(Value!) : onFailure(Error!);
}`
    },
    {
      level: "difficile",
      title: "Un Result sans valeur pour Cancel",
      prompt: `<p>Certaines commandes ne renvoient rien (annuler). Écris une classe non générique <code>Result</code> avec <code>Result.Success()</code> et une conversion implicite depuis <code>Error</code>. Puis écris <code>Result Cancel(OrderStatus status)</code> qui renvoie une erreur <code>"Order.CannotCancel"</code> (Conflict) si le statut est <code>Shipped</code> ou <code>Cancelled</code>. Teste les quatre statuts.</p>`,
      hint: `<p>Une propriété statique <code>public static Result Success() =&gt; new(null);</code> et le constructeur privé <code>Result(Error? error)</code>.</p>`,
      solution: `foreach (var status in Enum.GetValues<OrderStatus>())
{
    var result = Cancel(status);
    Console.WriteLine($"{status} : {(result.IsSuccess ? "annulée" : result.Error!.Code)}");
}

Result Cancel(OrderStatus status) => status switch
{
    OrderStatus.Pending or OrderStatus.Paid => Result.Success(),
    _ => new Error("Order.CannotCancel", $"Impossible d'annuler une commande {status}", ErrorType.Conflict)
};

enum OrderStatus { Pending, Paid, Shipped, Cancelled }
enum ErrorType { NotFound, Conflict, Validation }
record Error(string Code, string Message, ErrorType Type);

sealed class Result
{
    public Error? Error { get; }
    public bool IsSuccess => Error is null;
    private Result(Error? error) => Error = error;

    public static Result Success() => new(null);
    public static implicit operator Result(Error error) => new(error);
}`
    }
  ],
  quiz: [
    {
      q: `SQL Server ne répond plus pendant une commande. Que fais-tu ?`,
      options: ["Tu renvoies un <code>Result</code> avec une erreur Conflict", "Tu laisses l'exception remonter jusqu'au gestionnaire global, qui renvoie un 500", "Tu l'ignores et renvoies 200"],
      answer: 1,
      why: `C'est une erreur technique, inattendue : le métier ne peut rien y faire. Le gestionnaire global la logue et renvoie un 500 propre. Le Result est réservé aux échecs métier prévus.`
    },
    {
      q: `Quel est le principal avantage du Result pattern ?`,
      options: ["Il rend l'échec visible dans la signature de la méthode", "Il remplace complètement les exceptions", "Il rend le code plus court"],
      answer: 0,
      why: `<code>Result&lt;decimal&gt; Pay(int id)</code> annonce qu'il peut échouer : l'appelant ne peut pas l'ignorer. Il ne remplace pas les exceptions techniques, et il ajoute un peu de code.`
    },
    {
      q: `Où traduis-tu une <code>Error</code> de type Conflict en code HTTP 409 ?`,
      options: ["Dans le handler d'Application", "Dans l'entité <code>Order</code>", "Dans la couche Api, une seule fois, avec une méthode d'extension"],
      answer: 2,
      why: `Application et Domain ne connaissent pas HTTP. La traduction se fait à la frontière, au même endroit pour toute l'API.`
    },
    {
      q: `À quoi sert le <code>Code</code> stable d'une erreur, comme <code>"Order.AlreadyPaid"</code> ?`,
      options: ["À remplacer le code HTTP", "À permettre au front et aux tests de reconnaître l'erreur sans analyser le message", "À rien, le message suffit"],
      answer: 1,
      why: `Un message peut être traduit ou reformulé ; le code, lui, ne bouge pas. Le front Angular peut s'y fier pour afficher le bon texte.`
    }
  ],
  project: `<p>Dans <strong>OrderFlow</strong> :</p>
<ul><li>Ajoute dans OrderFlow.Application (ou un petit dossier <code>Common</code> du Domain) les types <code>Error</code>, <code>ErrorType</code>, <code>Result</code> et <code>Result&lt;T&gt;</code>, et une classe <code>OrderErrors</code> (NotFound, AlreadyPaid, CannotCancel, InsufficientStock).</li>
<li>Fais renvoyer un <code>Result</code> à <code>PlaceOrderHandler</code>, <code>PayOrderHandler</code> et <code>CancelOrderHandler</code> au lieu de lever des exceptions métier.</li>
<li>Dans OrderFlow.Api, écris l'extension <code>ToProblem()</code> et utilise-la dans tous les endpoints de commande. Garde le <code>IExceptionHandler</code> global pour les erreurs inattendues.</li>
<li>Écris un test d'intégration qui paie deux fois la même commande et vérifie le 409 avec <code>"code":"Order.AlreadyPaid"</code>.</li></ul>`,
  resources: [
    { label: "Bonnes pratiques pour les exceptions (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/exceptions/best-practices-for-exceptions" },
    { label: "Gérer les erreurs dans ASP.NET Core (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/aspnet/core/fundamentals/error-handling" }
  ]
});
