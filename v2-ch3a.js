window.COURSE = window.COURSE || [];

/* ===================== 3.1 Classe et objet ===================== */
window.COURSE.push({
  key: "l-class-object",
  title: "3.1 Classe et objet",
  summary: "Tu sauras déclarer une classe, créer plusieurs objets avec new et leur donner des méthodes.",
  objectives: [
    "Comprendre la différence entre une classe (le modèle) et un objet (l'exemplaire)",
    "Déclarer une classe et créer des objets avec new et new()",
    "Écrire une méthode d'instance et utiliser this",
    "Savoir que deux variables peuvent désigner le même objet"
  ],
  analogy: `<p>Une <strong>classe</strong>, c'est le <strong>plan d'architecte</strong> d'une maison : il décrit les pièces, les portes, les fenêtres. Mais on ne peut pas habiter un plan.</p>
<p>Un <strong>objet</strong>, c'est une <strong>maison construite</strong> à partir de ce plan. Avec un seul plan, on peut construire dix maisons. Chacune a sa propre couleur de volets : repeindre l'une ne change pas les autres.</p>`,
  lesson: `<h3>Pourquoi des classes ?</h3>
<p>Jusqu'ici, tu as manipulé des variables isolées : un titre, un auteur, une année. Dès qu'on a plusieurs livres, ça devient vite le désordre. Une <strong>classe</strong> regroupe des données et les actions qui vont avec, sous un seul nom.</p>
<p>En C#, presque tout ton code vivra dans des classes. C'est la brique de base de la <strong>programmation orientée objet</strong> (POO) : on modélise le programme avec des « choses » (un livre, un membre, un emprunt) qui ont des données et des comportements.</p>

<h3>Déclarer une classe</h3>
<p>On écrit le mot-clé <code>class</code>, un nom en <strong>PascalCase</strong> (chaque mot commence par une majuscule), puis des accolades :</p>
<pre class="diagram">class Book
{
    public string Title = "";
    public int Pages;
}</pre>
<p><code>Title</code> et <code>Pages</code> sont des <strong>champs</strong> : des variables qui appartiennent à chaque objet. Le mot <code>public</code> veut dire « utilisable depuis l'extérieur de la classe » (on détaillera en 3.4). On met <code>= ""</code> pour que le titre ne soit jamais <code>null</code>, car le mode nullable est activé.</p>
<div class="tip">Dans un <code>Program.cs</code> avec des top-level statements, le code exécutable doit être <strong>en haut</strong> et les classes <strong>en bas</strong>. Sinon, le compilateur refuse.</div>

<h3>Créer des objets avec new</h3>
<p>Le plan ne suffit pas : il faut construire. C'est le rôle de <code>new</code>, qui réserve la mémoire et fabrique un objet tout neuf. On dit aussi une <strong>instance</strong> de la classe.</p>
<p>Il existe deux écritures. <code>var book = new Book();</code> : le type est déduit de la droite. <code>Book book = new();</code> : c'est le <strong>new() ciblé</strong>, le type est déduit de la gauche. Les deux sont équivalentes, choisis celle qui se lit le mieux.</p>
<p>Chaque objet a <strong>ses propres</strong> valeurs de champs. Deux livres créés avec <code>new</code> sont deux maisons distinctes :</p>
<pre class="diagram"> Variables         Mémoire
 ---------         -----------------------
 a  --------&gt;  [ Book                  ]
               [ Title = "Dune"        ]
               [ Pages = 412           ]

 b  --------&gt;  [ Book                  ]
               [ Title = "Le Petit..." ]
               [ Pages = 96            ]</pre>

<h3>Méthodes d'instance et this</h3>
<p>Une classe peut aussi contenir des <strong>méthodes</strong> : des actions que l'objet sait faire. Une méthode d'instance travaille sur <strong>l'objet qui l'appelle</strong>. Quand tu écris <code>a.Describe()</code>, la méthode lit les champs de <code>a</code> ; avec <code>b.Describe()</code>, ceux de <code>b</code>.</p>
<p>Dans la méthode, le mot-clé <code>this</code> désigne justement « l'objet courant ». <code>this.Title</code> et <code>Title</code> veulent dire la même chose. On écrit <code>this</code> surtout quand un paramètre porte le même nom qu'un champ, pour lever l'ambiguïté.</p>

<h3>Et par rapport à TypeScript ?</h3>
<div class="compare"><div><h4>TypeScript</h4><p><code>class Book { title = ""; describe() { … } }</code>, puis <code>new Book()</code>. Dans une méthode, <code>this</code> est obligatoire pour lire un champ.</p></div><div><h4>C#</h4><p>Même idée, mais chaque champ a un type, les noms publics sont en PascalCase, et <code>this</code> est facultatif. Pas de souci de <code>this</code> perdu dans un callback.</p></div></div>
<p>Autre différence : en TypeScript, un objet littéral <code>{ title: "Dune" }</code> peut passer pour un <code>Book</code> s'il a la bonne forme. En C#, non : un objet est un <code>Book</code> uniquement s'il a été créé avec <code>new Book</code>.</p>

<h3>Aperçu : les références</h3>
<p>Une variable de type classe ne contient pas l'objet lui-même, mais une <strong>référence</strong> : une sorte d'adresse qui pointe vers l'objet. Si tu écris <code>var second = first;</code>, tu copies l'adresse, pas la maison. Les deux variables désignent alors le même objet, et une modification via l'une se voit via l'autre.</p>
<p>C'est exactement comme les objets en JavaScript. On approfondira valeur et référence au chapitre 4.</p>`,
  examples: [
    {
      title: "Une première classe",
      code: `var book = new Book();
book.Title = "Dune";
book.Author = "Frank Herbert";
Console.WriteLine($"{book.Title} de {book.Author}");

class Book
{
    public string Title = "";
    public string Author = "";
}`,
      output: `Dune de Frank Herbert`,
      steps: [
        "<code>var book = new Book();</code> : on construit un objet <code>Book</code> et on garde sa référence dans <code>book</code>.",
        "<code>book.Title = \"Dune\";</code> : on remplit le champ <code>Title</code> de cet objet avec le point <code>.</code>.",
        "<code>Console.WriteLine(...)</code> : on lit les deux champs pour les afficher.",
        "<code>class Book { ... }</code> : la déclaration de la classe, placée en bas du fichier."
      ],
      explain: "La classe décrit la forme, l'objet porte les vraies valeurs."
    },
    {
      title: "Deux objets indépendants et une méthode",
      code: `Book a = new();
a.Title = "Dune";
a.Pages = 412;
var b = new Book();
b.Title = "Le Petit Prince";
b.Pages = 96;
a.Describe();
b.Describe();
Console.WriteLine(a.IsLong());
Console.WriteLine(b.IsLong());

class Book
{
    public string Title = "";
    public int Pages;

    public void Describe()
    {
        Console.WriteLine($"{this.Title} ({this.Pages} pages)");
    }

    public bool IsLong()
    {
        return Pages > 300;
    }
}`,
      output: `Dune (412 pages)
Le Petit Prince (96 pages)
True
False`,
      steps: [
        "<code>Book a = new();</code> : le <code>new()</code> ciblé, le type vient de la gauche.",
        "<code>var b = new Book();</code> : un deuxième objet, avec ses propres champs.",
        "<code>a.Describe();</code> : la méthode s'exécute sur <code>a</code>, donc <code>this</code> vaut <code>a</code>.",
        "<code>this.Title</code> : le titre de l'objet courant ; on aurait pu écrire juste <code>Title</code>.",
        "<code>return Pages &gt; 300;</code> : <code>IsLong</code> renvoie un <code>bool</code> calculé à partir du champ de l'objet."
      ],
      explain: "La même méthode donne des résultats différents selon l'objet qui l'appelle."
    },
    {
      title: "Deux variables, un seul objet",
      code: `var first = new Book();
first.Title = "Dune";
var second = first;            // copie de la référence, pas de l'objet
second.Title = "Dune (poche)";
Console.WriteLine(first.Title);

var third = new Book();
third.Title = "Dune (poche)";
Console.WriteLine(first == second);
Console.WriteLine(first == third);

class Book
{
    public string Title = "";
}`,
      output: `Dune (poche)
True
False`,
      steps: [
        "<code>var second = first;</code> : <code>second</code> pointe vers le même objet que <code>first</code>.",
        "<code>second.Title = ...</code> : on modifie l'unique objet, donc <code>first.Title</code> change aussi.",
        "<code>first == second</code> : <code>True</code>, c'est la même référence.",
        "<code>first == third</code> : <code>False</code>, même titre mais deux objets différents en mémoire."
      ],
      explain: "Pour une classe, == compare par défaut les références, pas le contenu."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un chien qui aboie",
      prompt: `<p>Crée une classe <code>Dog</code> avec un champ <code>Name</code> et une méthode <code>Bark()</code> qui affiche <code>Rex : Wouf !</code> (avec le nom du chien). Crée un chien et fais-le aboyer.</p>`,
      hint: `<p>Dans <code>Bark</code>, utilise une chaîne interpolée <code>$"{Name} : Wouf !"</code>.</p>`,
      solution: `var dog = new Dog();
dog.Name = "Rex";
dog.Bark();

class Dog
{
    public string Name = "";

    public void Bark()
    {
        Console.WriteLine($"{Name} : Wouf !");
    }
}`
    },
    {
      level: "moyen",
      title: "Deux rectangles",
      prompt: `<p>Crée une classe <code>Rectangle</code> avec les champs <code>Width</code> et <code>Height</code> (<code>int</code>) et une méthode <code>Area()</code> qui renvoie la surface. Crée deux rectangles différents et affiche leurs surfaces.</p>`,
      hint: `<p><code>Area</code> renvoie un <code>int</code> : <code>return Width * Height;</code>.</p>`,
      solution: `Rectangle small = new();
small.Width = 2;
small.Height = 3;
var big = new Rectangle();
big.Width = 10;
big.Height = 5;
Console.WriteLine(small.Area()); // 6
Console.WriteLine(big.Area());   // 50

class Rectangle
{
    public int Width;
    public int Height;

    public int Area()
    {
        return Width * Height;
    }
}`
    },
    {
      level: "difficile",
      title: "Compteurs partagés ou pas",
      prompt: `<p>Crée une classe <code>Counter</code> avec un champ <code>Value</code> et une méthode <code>Increment()</code>. Crée <code>c1</code>, puis <code>c2 = c1</code>, puis <code>c3 = new Counter()</code>. Incrémente <code>c1</code> deux fois et <code>c3</code> une fois. Prédis les valeurs de <code>c1</code>, <code>c2</code> et <code>c3</code> avant d'exécuter.</p>`,
      hint: `<p><code>c2</code> n'est pas un nouvel objet : c'est une deuxième étiquette sur <code>c1</code>.</p>`,
      solution: `var c1 = new Counter();
var c2 = c1;
var c3 = new Counter();
c1.Increment();
c1.Increment();
c3.Increment();
Console.WriteLine(c1.Value); // 2
Console.WriteLine(c2.Value); // 2 (même objet que c1)
Console.WriteLine(c3.Value); // 1

class Counter
{
    public int Value;

    public void Increment()
    {
        Value++;
    }
}`
    }
  ],
  quiz: [
    {
      q: `Quelle phrase décrit le mieux la relation entre classe et objet ?`,
      options: [
        `La classe est le modèle, l'objet est un exemplaire construit à partir de ce modèle`,
        `L'objet est le modèle, la classe est un exemplaire`,
        `Ce sont deux mots pour la même chose`
      ],
      answer: 0,
      why: `La classe décrit la forme (le plan), et <code>new</code> fabrique des objets (les maisons). On peut créer autant d'objets qu'on veut à partir d'une seule classe.`
    },
    {
      q: `Que fait <code>Book b = new();</code> ?`,
      options: [
        `Ça ne compile pas, il manque le nom de la classe après <code>new</code>`,
        `Ça crée un nouvel objet <code>Book</code>, le type est déduit de la déclaration à gauche`,
        `Ça crée une variable <code>b</code> qui vaut <code>null</code>`
      ],
      answer: 1,
      why: `C'est le <code>new()</code> ciblé : le compilateur lit le type <code>Book</code> à gauche. C'est équivalent à <code>var b = new Book();</code>.`
    },
    {
      q: `Après <code>var y = x;</code> (où <code>x</code> est un objet <code>Book</code>), on écrit <code>y.Title = "A";</code>. Que vaut <code>x.Title</code> ?`,
      options: [
        `Son ancienne valeur, car <code>y</code> est une copie`,
        `Une erreur de compilation`,
        `<code>"A"</code>, car <code>x</code> et <code>y</code> désignent le même objet`
      ],
      answer: 2,
      why: `Avec une classe, on copie la référence, pas l'objet. Il n'existe qu'un seul livre, vu par deux variables.`
    },
    {
      q: `Dans une méthode d'instance, que désigne <code>this</code> ?`,
      options: [
        `La classe elle-même`,
        `L'objet sur lequel la méthode a été appelée`,
        `Le dernier objet créé avec <code>new</code>`
      ],
      answer: 1,
      why: `Dans <code>a.Describe()</code>, <code>this</code> vaut <code>a</code>. Il ne désigne pas la classe : on parlera des membres de la classe elle-même avec <code>static</code> en 3.5.`
    }
  ],
  project: `<p><strong>Bibliothèque, étape 1.</strong> Crée un projet console <code>Library</code>. Dans <code>Program.cs</code>, déclare une classe <code>Book</code> avec les champs <code>Title</code>, <code>Author</code> (<code>string</code>) et <code>Year</code> (<code>int</code>), et une méthode <code>Describe()</code> qui affiche <code>Dune - Frank Herbert (1965)</code>. Crée deux livres et appelle <code>Describe()</code> sur chacun.</p>`,
  resources: [
    { label: "Classes en C# (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/types/classes" }
  ]
});

/* ===================== 3.2 Champs et propriétés ===================== */
window.COURSE.push({
  key: "l-fields-properties",
  title: "3.2 Champs et propriétés",
  summary: "Tu sauras exposer les données d'un objet avec des propriétés, en lecture seule ou avec validation.",
  objectives: [
    "Distinguer un champ d'une propriété",
    "Écrire des auto-propriétés, en lecture seule, avec private set ou init",
    "Écrire une propriété calculée et une propriété qui valide sa valeur",
    "Appliquer les conventions de nommage C#"
  ],
  analogy: `<p>Un <strong>champ</strong>, c'est le coffre-fort d'une banque. Une <strong>propriété</strong>, c'est le guichet devant ce coffre.</p>
<p>Le client ne touche jamais l'argent directement : il passe par le guichetier, qui vérifie la demande. Vu de l'extérieur, c'est simple (« je dépose », « je consulte »), mais derrière le guichet, la banque peut contrôler, refuser ou noter chaque opération.</p>`,
  lesson: `<h3>Le champ : la variable de l'objet</h3>
<p>En 3.1, tu as écrit <code>public string Title = "";</code>. C'est un <strong>champ</strong> : une variable rangée dans chaque objet. Le problème d'un champ <code>public</code>, c'est que n'importe qui peut y écrire n'importe quoi, par exemple une année <code>-5</code>. Et si un jour tu veux ajouter une vérification, tu devras changer tout le code qui l'utilise.</p>
<p>En C#, la règle pro est simple : <strong>les champs restent privés</strong>, et on expose les données avec des <strong>propriétés</strong>.</p>

<h3>La propriété : get et set</h3>
<p>Une propriété ressemble à un champ quand on l'utilise (<code>book.Title = "Dune"</code>), mais c'est en réalité une paire de petites méthodes : <code>get</code> (lire) et <code>set</code> (écrire). Dans le <code>set</code>, le mot-clé <code>value</code> contient la valeur qu'on essaie d'affecter.</p>
<p>Tu connais déjà ça en TypeScript avec <code>get title()</code> et <code>set title(v)</code>. La différence : en C#, c'est la façon <strong>normale</strong> d'exposer une donnée, pas une option rare.</p>

<h3>L'auto-propriété</h3>
<p>Le plus souvent, on n'a rien à vérifier. On écrit alors une <strong>auto-propriété</strong> : <code>public string Title { get; set; } = "";</code>. Le compilateur crée tout seul un champ caché derrière. On a la simplicité d'un champ, et on pourra ajouter de la logique plus tard sans casser le code appelant.</p>
<p>On peut ensuite régler qui a le droit d'écrire :</p>
<table>
<tr><th>Écriture</th><th>Lecture</th><th>Écriture autorisée</th></tr>
<tr><td><code>{ get; set; }</code></td><td>partout</td><td>partout</td></tr>
<tr><td><code>{ get; private set; }</code></td><td>partout</td><td>seulement dans la classe</td></tr>
<tr><td><code>{ get; init; }</code></td><td>partout</td><td>seulement à la création de l'objet</td></tr>
<tr><td><code>{ get; }</code></td><td>partout</td><td>à la déclaration ou dans le constructeur</td></tr>
</table>
<p><code>init</code> se remplit avec la syntaxe <code>new Book { Isbn = "..." }</code>, qu'on verra en détail en 3.3. Ensuite, la valeur est figée.</p>

<h3>La propriété calculée</h3>
<p>Certaines propriétés ne stockent rien : elles calculent leur valeur à chaque lecture à partir d'autres données. On les écrit avec une flèche : <code>public string Label =&gt; $"{Title} ({Year})";</code>. Pas de <code>set</code>, puisqu'il n'y a rien à stocker.</p>

<h3>Champ privé et validation</h3>
<p>Quand on veut contrôler la valeur, on écrit la propriété « en entier », avec un champ privé derrière. Par convention, ce champ s'appelle <code>_title</code> (tiret bas + camelCase). On l'appelle le <strong>champ de stockage</strong> (backing field).</p>
<div class="flow"><span>book.Year = 3000</span><span>set reçoit value</span><span>vérification</span><span>_year modifié ou refusé</span></div>
<p>Le code extérieur ne voit que <code>Year</code>. Il ne sait pas qu'il y a un champ <code>_year</code> derrière, et il n'a pas besoin de le savoir.</p>
<div class="tip">Ne confonds pas : le <strong>champ</strong> stocke la donnée (privé, <code>_camelCase</code>), la <strong>propriété</strong> la protège et l'expose (public, <code>PascalCase</code>).</div>

<h3>Conventions de nommage</h3>
<table>
<tr><th>Élément</th><th>Convention</th><th>Exemple</th></tr>
<tr><td>Classe, méthode, propriété</td><td>PascalCase</td><td><code>Book</code>, <code>Describe()</code>, <code>Title</code></td></tr>
<tr><td>Champ privé</td><td>_camelCase</td><td><code>_title</code></td></tr>
<tr><td>Variable locale, paramètre</td><td>camelCase</td><td><code>book</code>, <code>newTitle</code></td></tr>
<tr><td>Constante</td><td>PascalCase</td><td><code>MaxLoans</code></td></tr>
</table>
<p>En TypeScript, on écrit <code>book.title</code> ; en C#, c'est <code>book.Title</code>. Ce simple détail rend ton code « C# natif » aux yeux d'un relecteur.</p>
<div class="note">Depuis C# 14, le mot-clé <code>field</code> permet d'accéder au champ caché d'une auto-propriété sans le déclarer : <code>public string Title { get; set =&gt; field = value.Trim(); } = "";</code>. Pratique pour une petite règle ; pour une logique plus riche, le champ privé explicite reste plus lisible.</div>`,
  examples: [
    {
      title: "Auto-propriétés, private set et init",
      code: `var book = new Book { Isbn = "978-2266320481" };
book.Title = "Dune";
book.Borrow();
Console.WriteLine($"{book.Title} - {book.Isbn} - empruntée {book.LoanCount} fois");
// book.Isbn = "autre";   // erreur : init, seulement à la création
// book.LoanCount = 10;   // erreur : le set est privé

class Book
{
    public string Title { get; set; } = "";
    public string Isbn { get; init; } = "";
    public int LoanCount { get; private set; }

    public void Borrow()
    {
        LoanCount++;
    }
}`,
      output: `Dune - 978-2266320481 - empruntée 1 fois`,
      steps: [
        "<code>new Book { Isbn = ... }</code> : on fixe <code>Isbn</code> pendant la création, le seul moment permis par <code>init</code>.",
        "<code>book.Title = \"Dune\";</code> : <code>Title</code> a un <code>set</code> public, on peut l'écrire n'importe quand.",
        "<code>book.Borrow();</code> : seule la classe peut modifier <code>LoanCount</code>, via sa propre méthode.",
        "<code>public int LoanCount { get; private set; }</code> : lisible partout, modifiable seulement à l'intérieur.",
        "<code>// book.LoanCount = 10;</code> : décommente cette ligne pour voir l'erreur de compilation."
      ],
      explain: "On choisit le niveau d'écriture propriété par propriété."
    },
    {
      title: "Propriété calculée et lecture seule",
      code: `var book = new Book();
book.Title = "Dune";
book.Year = 1965;
Console.WriteLine(book.Label);
Console.WriteLine(book.IsClassic);
Console.WriteLine(book.Library);

class Book
{
    public string Title { get; set; } = "";
    public int Year { get; set; }
    public string Library { get; } = "Médiathèque centrale";

    public string Label => $"{Title} ({Year})";
    public bool IsClassic => Year < 1970;
}`,
      output: `Dune (1965)
True
Médiathèque centrale`,
      steps: [
        "<code>public string Library { get; } = ...</code> : lecture seule, valeur fixée à la déclaration.",
        "<code>public string Label =&gt; ...</code> : calculée à chaque lecture, rien n'est stocké.",
        "<code>public bool IsClassic =&gt; Year &lt; 1970;</code> : une propriété calculée peut renvoyer n'importe quel type.",
        "<code>Console.WriteLine(book.Label);</code> : on la lit comme une donnée normale, sans parenthèses."
      ]
    },
    {
      title: "Champ privé et validation",
      code: `var book = new Book();
book.Title = "  Dune  ";
Console.WriteLine($"[{book.Title}]");
book.Year = 3000;
Console.WriteLine(book.Year);

class Book
{
    private string _title = "";
    private int _year;
    public string Title
    {
        get { return _title; }
        set { _title = value.Trim(); }
    }

    public int Year
    {
        get => _year;
        set
        {
            if (value < 0 || value > 2100)
            {
                Console.WriteLine($"Année refusée : {value}");
                return;
            }
            _year = value;
        }
    }
}`,
      output: `[Dune]
Année refusée : 3000
0`,
      steps: [
        "<code>private string _title = \"\";</code> : le champ de stockage, invisible de l'extérieur.",
        "<code>set { _title = value.Trim(); }</code> : <code>value</code> vaut <code>\"  Dune  \"</code>, on enlève les espaces avant de stocker.",
        "<code>get =&gt; _year;</code> : un <code>get</code> peut aussi s'écrire avec une flèche.",
        "<code>if (value &lt; 0 || value &gt; 2100)</code> : 3000 est refusé, on affiche un message et on sort sans modifier.",
        "<code>Console.WriteLine(book.Year);</code> : <code>_year</code> n'a jamais changé, il vaut toujours 0 (valeur par défaut d'un <code>int</code>)."
      ],
      explain: "En 3.8, on remplacera le message par une vraie erreur (exception)."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un profil de membre",
      prompt: `<p>Crée une classe <code>Member</code> avec deux auto-propriétés : <code>Name</code> (<code>string</code>) et <code>Email</code> (<code>string</code>). Crée un membre, remplis ses propriétés et affiche <code>Alice &lt;alice@mail.com&gt;</code>.</p>`,
      hint: `<p>N'oublie pas <code>= "";</code> après <code>{ get; set; }</code> pour éviter l'avertissement nullable.</p>`,
      solution: `var member = new Member();
member.Name = "Alice";
member.Email = "alice@mail.com";
Console.WriteLine($"{member.Name} <{member.Email}>");

class Member
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
}`
    },
    {
      level: "moyen",
      title: "Un prix TTC calculé",
      prompt: `<p>Crée une classe <code>Product</code> avec <code>Name</code>, <code>PriceExclTax</code> (<code>decimal</code>) et une propriété calculée <code>PriceInclTax</code> qui vaut le prix HT multiplié par <code>1.2m</code>. Affiche le prix TTC d'un produit à <code>10m</code>.</p>`,
      hint: `<p>Une propriété calculée s'écrit <code>public decimal PriceInclTax =&gt; ...;</code>. Le suffixe <code>m</code> indique un <code>decimal</code>.</p>`,
      solution: `var pen = new Product();
pen.Name = "Stylo";
pen.PriceExclTax = 10m;
Console.WriteLine(pen.PriceInclTax); // 12,0 ou 12.0 selon la culture

class Product
{
    public string Name { get; set; } = "";
    public decimal PriceExclTax { get; set; }
    public decimal PriceInclTax => PriceExclTax * 1.2m;
}`
    },
    {
      level: "difficile",
      title: "Une note entre 0 et 20",
      prompt: `<p>Crée une classe <code>Grade</code> avec un champ privé <code>_value</code> et une propriété <code>Value</code> qui ramène toute valeur trop basse à 0 et toute valeur trop haute à 20. Ajoute une propriété calculée <code>IsPassing</code> (vrai si la note est au moins 10). Teste avec 25, puis -3, puis 12.</p>`,
      hint: `<p>Dans le <code>set</code>, utilise <code>if</code>/<code>else if</code> sur <code>value</code>, ou <code>Math.Clamp(value, 0, 20)</code>.</p>`,
      solution: `var grade = new Grade();
grade.Value = 25;
Console.WriteLine(grade.Value);     // 20
grade.Value = -3;
Console.WriteLine(grade.Value);     // 0
grade.Value = 12;
Console.WriteLine(grade.IsPassing); // True

class Grade
{
    private int _value;

    public int Value
    {
        get => _value;
        set => _value = Math.Clamp(value, 0, 20);
    }

    public bool IsPassing => _value >= 10;
}`
    }
  ],
  quiz: [
    {
      q: `Pourquoi préfère-t-on une propriété à un champ public ?`,
      options: [
        `Parce qu'une propriété est plus rapide`,
        `Parce qu'un champ ne peut pas contenir de <code>string</code>`,
        `Parce qu'on peut ajouter une vérification plus tard sans changer le code qui l'utilise`
      ],
      answer: 2,
      why: `Une propriété est un point de contrôle : le code appelant écrit toujours <code>book.Year = ...</code>, même si on ajoute une validation dans le <code>set</code>. Ce n'est pas une question de vitesse.`
    },
    {
      q: `Avec <code>public int LoanCount { get; private set; }</code>, qui peut modifier <code>LoanCount</code> ?`,
      options: [
        `Uniquement le code à l'intérieur de la classe`,
        `Tout le monde`,
        `Personne, jamais`
      ],
      answer: 0,
      why: `La lecture est publique, mais l'écriture est réservée à la classe, par exemple dans une méthode <code>Borrow()</code>.`
    },
    {
      q: `Que représente <code>value</code> dans un <code>set</code> ?`,
      options: [
        `L'ancienne valeur de la propriété`,
        `La nouvelle valeur qu'on essaie d'affecter`,
        `Le champ privé caché`
      ],
      answer: 1,
      why: `Dans <code>book.Year = 3000</code>, <code>value</code> vaut 3000. L'ancienne valeur est dans le champ de stockage, pas dans <code>value</code>.`
    },
    {
      q: `Quelle est la différence entre <code>{ get; init; }</code> et <code>{ get; set; }</code> ?`,
      options: [
        `Aucune`,
        `<code>init</code> ne permet d'écrire la valeur qu'à la création de l'objet`,
        `<code>init</code> rend la propriété privée`
      ],
      answer: 1,
      why: `Avec <code>init</code>, on peut écrire <code>new Book { Isbn = "..." }</code>, mais plus <code>book.Isbn = "..."</code> ensuite. La propriété reste lisible partout.`
    }
  ],
  project: `<p><strong>Bibliothèque, étape 2.</strong> Remplace les champs de <code>Book</code> par des propriétés <code>Title</code>, <code>Author</code> et <code>Year</code>. <code>Title</code> et <code>Author</code> enlèvent les espaces autour avec <code>Trim()</code>. <code>Year</code> refuse (avec un message) toute année inférieure à 1450 ou supérieure à 2100. Ajoute une propriété calculée <code>Label</code> qui renvoie <code>Dune - Frank Herbert (1965)</code>.</p>`,
  resources: [
    { label: "Propriétés (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/properties" }
  ]
});

/* ===================== 3.3 Constructeurs ===================== */
window.COURSE.push({
  key: "l-constructors",
  title: "3.3 Constructeurs",
  summary: "Tu sauras écrire des constructeurs pour que chaque objet soit valide dès sa création.",
  objectives: [
    "Comprendre à quoi sert un constructeur",
    "Écrire plusieurs constructeurs et les chaîner avec this(...)",
    "Utiliser les initialiseurs d'objet et les primary constructors",
    "Connaître l'ordre d'exécution lors d'un new"
  ],
  analogy: `<p>Quand tu achètes une voiture neuve, elle sort de l'usine <strong>prête à rouler</strong> : roues montées, plein fait, numéro de série gravé. Tu ne reçois pas une carcasse vide en espérant penser à tout monter toi-même.</p>
<p>Le <strong>constructeur</strong>, c'est la chaîne de montage : il garantit qu'un objet est complet et cohérent dès qu'il existe.</p>`,
  lesson: `<h3>Le rôle du constructeur</h3>
<p>Jusqu'ici, on créait un livre vide avec <code>new Book()</code>, puis on remplissait ses propriétés une par une. Rien n'empêchait d'oublier le titre. Un <strong>constructeur</strong> est une méthode spéciale, appelée automatiquement par <code>new</code>, qui reçoit les données indispensables et prépare l'objet.</p>
<p>Il porte <strong>le même nom que la classe</strong> et n'a <strong>pas de type de retour</strong> (même pas <code>void</code>).</p>

<h3>Le constructeur implicite</h3>
<p>Si tu n'écris aucun constructeur, C# en fournit un invisible, sans paramètre, qui ne fait rien de spécial. C'est lui que tu appelais avec <code>new Book()</code>. Attention : dès que tu écris <strong>un</strong> constructeur toi-même, ce constructeur implicite disparaît. <code>new Book()</code> ne compile plus si tu ne le redéclares pas.</p>

<h3>Constructeur avec paramètres</h3>
<p>On déclare les paramètres comme pour une méthode, puis on les range dans les propriétés. Comme ça, les propriétés peuvent être en lecture seule (<code>{ get; }</code>) : elles sont fixées une fois pour toutes dans le constructeur.</p>
<p>C'est l'équivalent du <code>constructor(title: string)</code> de TypeScript. Par convention, le paramètre est en camelCase (<code>title</code>) et la propriété en PascalCase (<code>Title</code>), ce qui évite toute confusion.</p>

<h3>Surcharge et chaînage avec this(...)</h3>
<p>Une classe peut avoir <strong>plusieurs constructeurs</strong>, tant que leurs paramètres diffèrent : c'est la <strong>surcharge</strong>. Pour ne pas dupliquer le code, un constructeur court peut appeler un constructeur complet avec <code>: this(...)</code>, placé juste après sa parenthèse.</p>
<p>Le constructeur appelé par <code>this(...)</code> s'exécute <strong>en premier</strong>, puis le corps du constructeur court. TypeScript n'a pas de vraie surcharge de constructeur : on y utilise plutôt des paramètres optionnels. C# accepte aussi les paramètres optionnels, mais le chaînage reste très courant.</p>

<h3>Initialiseur d'objet</h3>
<p>Autre façon de remplir un objet : <code>new Book { Title = "Dune", Year = 1965 }</code>. C'est un raccourci qui appelle le constructeur sans paramètre, puis affecte les propriétés une par une. C'est aussi le seul moyen de remplir une propriété <code>init</code> (vu en 3.2).</p>
<div class="compare"><div><h4>Constructeur</h4><p>Les données sont <strong>obligatoires</strong> : impossible de créer l'objet sans elles. Idéal pour ce qui est indispensable.</p></div><div><h4>Initialiseur d'objet</h4><p>Les données sont <strong>facultatives</strong> : on remplit ce qu'on veut. Idéal pour des réglages optionnels.</p></div></div>

<h3>Primary constructor (C# 12)</h3>
<p>Une syntaxe plus courte place les paramètres directement après le nom de la classe : <code>class Member(string name, int maxLoans)</code>. Ces paramètres sont disponibles partout dans la classe. Deux usages très différents :</p>
<ul>
<li><strong>Initialiser une propriété</strong> : <code>public string Name { get; } = name;</code>. La valeur est copiée dans une vraie propriété, visible de l'extérieur.</li>
<li><strong>Capturer le paramètre</strong> : l'utiliser directement dans une méthode, comme <code>maxLoans</code>. Le compilateur le garde en mémoire dans un champ caché, mais il n'est <strong>pas</strong> accessible de l'extérieur (pas de <code>member.maxLoans</code>) et il reste modifiable dans la classe.</li>
</ul>
<p>Ça ressemble aux paramètres de constructeur TypeScript (<code>constructor(private name: string)</code>), avec une nuance : en C#, un paramètre capturé ne devient jamais une propriété publique tout seul.</p>
<div class="tip">Si tu veux exposer la donnée, déclare une propriété <code>= name;</code>. N'utilise pas en plus le paramètre <code>name</code> dans tes méthodes : tu aurais deux copies, et le compilateur te le signale par un avertissement.</div>

<h3>Ordre d'exécution</h3>
<p>Quand tu écris <code>new Book("Dune") { Year = 1965 }</code>, voici ce qui se passe, dans l'ordre :</p>
<div class="flow"><span>new réserve la mémoire</span><span>initialiseurs des champs et propriétés</span><span>corps du constructeur</span><span>initialiseur d'objet { }</span><span>objet prêt</span></div>
<p>Donc une valeur écrite dans <code>{ Year = 1965 }</code> écrase celle que le constructeur aurait mise. (En 3.9, l'héritage ajoutera une étape : le constructeur de la classe parente.)</p>`,
  examples: [
    {
      title: "Un constructeur avec paramètres",
      code: `var book = new Book("Dune", "Frank Herbert", 1965);
Console.WriteLine(book.Describe());
// var empty = new Book(); // erreur : plus de constructeur sans paramètre

class Book
{
    public string Title { get; }
    public string Author { get; }
    public int Year { get; }

    public Book(string title, string author, int year)
    {
        Title = title;
        Author = author;
        Year = year;
    }

    public string Describe()
    {
        return $"{Title}, {Author} ({Year})";
    }
}`,
      output: `Dune, Frank Herbert (1965)`,
      steps: [
        "<code>new Book(\"Dune\", \"Frank Herbert\", 1965)</code> : <code>new</code> appelle le constructeur avec trois arguments.",
        "<code>public Book(string title, string author, int year)</code> : même nom que la classe, pas de type de retour.",
        "<code>Title = title;</code> : on range le paramètre (camelCase) dans la propriété (PascalCase).",
        "<code>public string Title { get; }</code> : lecture seule, mais assignable dans le constructeur.",
        "<code>// var empty = new Book();</code> : le constructeur implicite a disparu, cette ligne ne compilerait pas."
      ],
      explain: "Impossible désormais d'avoir un livre sans titre."
    },
    {
      title: "Surcharge et chaînage avec this(...)",
      code: `var a = new Book("Dune", "Frank Herbert");
var b = new Book("Fondation");
Console.WriteLine($"{a.Title} / {a.Author}");
Console.WriteLine($"{b.Title} / {b.Author}");

class Book
{
    public string Title { get; }
    public string Author { get; }

    public Book(string title, string author)
    {
        Console.WriteLine($"Constructeur complet : {title}");
        Title = title;
        Author = author;
    }

    public Book(string title) : this(title, "Auteur inconnu")
    {
        Console.WriteLine("Constructeur court terminé");
    }
}`,
      output: `Constructeur complet : Dune
Constructeur complet : Fondation
Constructeur court terminé
Dune / Frank Herbert
Fondation / Auteur inconnu`,
      steps: [
        "<code>new Book(\"Dune\", \"Frank Herbert\")</code> : deux arguments, c'est le constructeur complet qui est choisi.",
        "<code>new Book(\"Fondation\")</code> : un seul argument, c'est le constructeur court.",
        "<code>: this(title, \"Auteur inconnu\")</code> : le constructeur court délègue d'abord au constructeur complet.",
        "<code>Console.WriteLine(\"Constructeur court terminé\");</code> : son propre corps s'exécute seulement après.",
        "Les deux dernières lignes de la sortie montrent que <code>Author</code> a bien reçu sa valeur par défaut."
      ]
    },
    {
      title: "Initialiseur d'objet et primary constructor",
      code: `var book = new Book { Title = "Dune", Year = 1965 };
Console.WriteLine($"{book.Title} ({book.Year})");

var member = new Member("Alice", 3);
Console.WriteLine($"{member.Name} peut emprunter : {member.CanBorrow(2)}");
Console.WriteLine($"{member.Name} peut emprunter : {member.CanBorrow(3)}");

class Book
{
    public string Title { get; set; } = "";
    public int Year { get; set; }
}

// Primary constructor : les paramètres suivent le nom de la classe
class Member(string name, int maxLoans)
{
    public string Name { get; } = name;   // copié dans une propriété publique

    public bool CanBorrow(int currentLoans)
    {
        return currentLoans < maxLoans;   // paramètre capturé, privé
    }
}`,
      output: `Dune (1965)
Alice peut emprunter : True
Alice peut emprunter : False`,
      steps: [
        "<code>new Book { Title = \"Dune\", Year = 1965 }</code> : constructeur implicite, puis affectation des deux propriétés.",
        "<code>class Member(string name, int maxLoans)</code> : un primary constructor, sans méthode <code>Member(...)</code> à écrire.",
        "<code>public string Name { get; } = name;</code> : le paramètre initialise une propriété visible de l'extérieur.",
        "<code>return currentLoans &lt; maxLoans;</code> : <code>maxLoans</code> est capturé ; on ne pourrait pas écrire <code>member.maxLoans</code>.",
        "<code>member.CanBorrow(3)</code> : 3 n'est pas strictement inférieur à 3, donc <code>False</code>."
      ],
      explain: "Le primary constructor raccourcit beaucoup les petites classes."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un point obligatoire",
      prompt: `<p>Crée une classe <code>Point</code> avec deux propriétés en lecture seule <code>X</code> et <code>Y</code> (<code>int</code>), remplies par un constructeur. Crée le point (3, 4) et affiche <code>(3, 4)</code>.</p>`,
      hint: `<p>Propriétés <code>{ get; }</code> + un constructeur <code>public Point(int x, int y)</code>.</p>`,
      solution: `var p = new Point(3, 4);
Console.WriteLine($"({p.X}, {p.Y})");

class Point
{
    public int X { get; }
    public int Y { get; }

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }
}`
    },
    {
      level: "moyen",
      title: "Deux façons de créer un utilisateur",
      prompt: `<p>Crée une classe <code>User</code> avec <code>Name</code> et <code>Role</code>. Écris un constructeur complet <code>User(string name, string role)</code> et un constructeur court <code>User(string name)</code> qui donne le rôle <code>"lecteur"</code> en chaînant avec <code>this(...)</code>.</p>`,
      hint: `<p>La syntaxe est <code>public User(string name) : this(name, "lecteur") { }</code>.</p>`,
      solution: `var admin = new User("Alice", "admin");
var reader = new User("Bob");
Console.WriteLine($"{admin.Name} : {admin.Role}"); // Alice : admin
Console.WriteLine($"{reader.Name} : {reader.Role}"); // Bob : lecteur

class User
{
    public string Name { get; }
    public string Role { get; }

    public User(string name, string role)
    {
        Name = name;
        Role = role;
    }

    public User(string name) : this(name, "lecteur") { }
}`
    },
    {
      level: "difficile",
      title: "Un compte avec primary constructor",
      prompt: `<p>Écris <code>class Account(string owner, decimal overdraftLimit)</code> avec une propriété publique <code>Owner</code> initialisée depuis <code>owner</code>, et une méthode <code>CanWithdraw(decimal balance, decimal amount)</code> qui utilise le paramètre capturé <code>overdraftLimit</code> : le retrait est possible si <code>balance - amount</code> reste supérieur ou égal à <code>-overdraftLimit</code>. Teste avec un découvert autorisé de 100.</p>`,
      hint: `<p><code>return balance - amount &gt;= -overdraftLimit;</code></p>`,
      solution: `var account = new Account("Alice", 100m);
Console.WriteLine(account.Owner);                    // Alice
Console.WriteLine(account.CanWithdraw(50m, 120m));   // True  (-70)
Console.WriteLine(account.CanWithdraw(50m, 200m));   // False (-150)

class Account(string owner, decimal overdraftLimit)
{
    public string Owner { get; } = owner;

    public bool CanWithdraw(decimal balance, decimal amount)
    {
        return balance - amount >= -overdraftLimit;
    }
}`
    }
  ],
  quiz: [
    {
      q: `Tu as écrit un constructeur <code>Book(string title)</code>. Que se passe-t-il avec <code>new Book()</code> ?`,
      options: [
        `Ça compile : C# garde toujours un constructeur sans paramètre`,
        `Erreur de compilation : le constructeur implicite n'existe plus`,
        `Ça crée un livre avec un titre <code>null</code>`
      ],
      answer: 1,
      why: `Le constructeur implicite n'est fourni que si tu n'en écris aucun. Pour garder <code>new Book()</code>, il faut le déclarer toi-même.`
    },
    {
      q: `Avec <code>public Book(string t) : this(t, "?") { Console.WriteLine("B"); }</code>, quel code s'exécute en premier ?`,
      options: [
        `Le corps du constructeur appelé par <code>this(...)</code>`,
        `<code>Console.WriteLine("B")</code>`,
        `Les deux en même temps`
      ],
      answer: 0,
      why: `<code>this(...)</code> passe d'abord la main au constructeur ciblé ; le corps du constructeur court s'exécute ensuite.`
    },
    {
      q: `Dans <code>class Member(string name)</code>, si une méthode utilise directement <code>name</code>, que peut-on dire ?`,
      options: [
        `<code>name</code> devient une propriété publique <code>member.name</code>`,
        `C'est une erreur de compilation`,
        `<code>name</code> est capturé : il reste disponible dans la classe, mais invisible de l'extérieur`
      ],
      answer: 2,
      why: `Un paramètre capturé est stocké dans un champ caché privé. Pour l'exposer, il faut une propriété explicite comme <code>public string Name { get; } = name;</code>.`
    },
    {
      q: `Dans <code>new Book("Dune") { Year = 1965 }</code>, quand <code>Year = 1965</code> est-il appliqué ?`,
      options: [
        `Avant le constructeur`,
        `Après le corps du constructeur`,
        `Jamais, on ne peut pas combiner les deux`
      ],
      answer: 1,
      why: `L'initialiseur d'objet s'exécute en dernier, une fois le constructeur terminé. Il peut donc écraser une valeur posée par le constructeur.`
    }
  ],
  project: `<p><strong>Bibliothèque, étape 3.</strong> Ajoute à <code>Book</code> un constructeur <code>Book(string title, string author, int year)</code> qui passe par tes propriétés (pour profiter de la validation de l'étape 2). Ajoute un second constructeur <code>Book(string title, string author)</code> qui chaîne avec <code>this(...)</code> en mettant l'année 2000 par défaut. Crée trois livres avec ces constructeurs.</p>`,
  resources: [
    { label: "Constructeurs (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/constructors" }
  ]
});

/* ===================== 3.4 Modificateurs d'accès ===================== */
window.COURSE.push({
  key: "l-access-modifiers",
  title: "3.4 Modificateurs d'accès",
  summary: "Tu sauras choisir qui a le droit de voir chaque classe et chaque membre de ton code.",
  objectives: [
    "Connaître public, private, protected, internal et leurs combinaisons",
    "Savoir ce qu'est un assembly",
    "Connaître les accès par défaut",
    "Appliquer la règle du moindre accès"
  ],
  analogy: `<p>Pense à un immeuble de bureaux. Le <strong>hall d'accueil</strong> est ouvert à tous (public). Ton <strong>bureau</strong> fermé à clé, toi seul y entres (private). La <strong>salle de pause</strong> est réservée aux employés de l'entreprise, quel que soit leur service (internal).</p>
<p>Le <strong>coffre de famille</strong> se transmet aux héritiers (protected). Chaque porte a un badge différent, et on ne distribue jamais plus de badges que nécessaire.</p>`,
  lesson: `<h3>À quoi servent les modificateurs ?</h3>
<p>Un <strong>modificateur d'accès</strong> est un mot placé devant une classe ou un membre (champ, propriété, méthode) pour dire <strong>qui a le droit de l'utiliser</strong>. Tu en as déjà croisé deux : <code>public</code> et <code>private</code>.</p>
<p>C'est le compilateur qui vérifie : si tu utilises un membre interdit, le code ne compile pas (erreur <code>CS0122</code>, « inaccessible en raison de son niveau de protection »). L'idée : cacher les détails internes pour pouvoir les changer sans casser le reste.</p>

<h3>Un assembly, c'est quoi ?</h3>
<p>Quand tu compiles un projet (<code>.csproj</code>), tu obtiens un fichier <code>.dll</code> ou <code>.exe</code>. Ce fichier s'appelle un <strong>assembly</strong>. Pour simplifier : <strong>un projet = un assembly</strong>. Une solution peut contenir plusieurs projets, par exemple <code>Library.Core</code> (la logique) et <code>Library.Console</code> (l'application).</p>
<p>Certains modificateurs parlent justement de cette frontière : « visible dans le même projet » ou « visible depuis un autre projet ».</p>

<h3>Les modificateurs, un par un</h3>
<ul>
<li><code>public</code> : accessible partout, même depuis un autre projet.</li>
<li><code>private</code> : accessible uniquement dans la classe qui le déclare.</li>
<li><code>protected</code> : la classe elle-même et ses <strong>classes dérivées</strong> (les classes qui en héritent). On verra l'héritage en 3.9 ; retiens juste que c'est « privé, mais partagé avec les enfants ».</li>
<li><code>internal</code> : accessible partout <strong>dans le même projet</strong>, invisible depuis un autre projet.</li>
<li><code>protected internal</code> : <code>protected</code> <strong>ou</strong> <code>internal</code> (le plus large des deux).</li>
<li><code>private protected</code> : <code>protected</code> <strong>et</strong> <code>internal</code> (les classes dérivées, mais seulement dans le même projet).</li>
<li><code>file</code> : uniquement pour un type (une classe), visible seulement <strong>dans le fichier</strong> où il est déclaré.</li>
</ul>

<h3>La matrice d'accès</h3>
<table>
<tr><th>Modificateur</th><th>Même classe</th><th>Classe dérivée</th><th>Même projet</th><th>Autre projet</th></tr>
<tr><td><code>public</code></td><td>✓</td><td>✓</td><td>✓</td><td>✓</td></tr>
<tr><td><code>protected internal</code></td><td>✓</td><td>✓</td><td>✓</td><td>✗ (sauf classe dérivée)</td></tr>
<tr><td><code>internal</code></td><td>✓</td><td>✓ (même projet)</td><td>✓</td><td>✗</td></tr>
<tr><td><code>protected</code></td><td>✓</td><td>✓</td><td>✗</td><td>✗ (sauf classe dérivée)</td></tr>
<tr><td><code>private protected</code></td><td>✓</td><td>✓ (même projet)</td><td>✗</td><td>✗</td></tr>
<tr><td><code>private</code></td><td>✓</td><td>✗</td><td>✗</td><td>✗</td></tr>
</table>
<p>La colonne « Même projet » parle d'une classe quelconque du projet, qui n'hérite pas. Dans la vraie vie, tu utiliseras surtout <code>public</code>, <code>private</code>, <code>internal</code> et <code>protected</code>. Les deux combinaisons sont rares.</p>

<h3>L'accès par défaut</h3>
<p>Si tu n'écris rien, C# choisit l'option la plus fermée raisonnable :</p>
<div class="compare"><div><h4>Classe sans modificateur</h4><p><code>class Book</code> = <code>internal class Book</code>. Visible dans le projet, pas ailleurs.</p></div><div><h4>Membre sans modificateur</h4><p><code>string _code;</code> = <code>private string _code;</code>. Visible seulement dans la classe.</p></div></div>
<div class="tip">C'est l'inverse de TypeScript, où un membre sans mot-clé est <strong>public</strong>. En C#, oublier <code>public</code> rend le membre privé, d'où des erreurs « inaccessible » au début.</div>

<h3>La règle du moindre accès</h3>
<p>Commence toujours par le plus fermé (<code>private</code>), et n'ouvre que si quelqu'un en a vraiment besoin. Tout ce qui est <code>public</code> devient une promesse : d'autres l'utilisent, et tu ne pourras plus le modifier librement. Ce qui est privé, tu peux le renommer ou le réécrire sans risque.</p>

<h3>Comparaison avec TypeScript</h3>
<p>TypeScript a <code>public</code>, <code>private</code> et <code>protected</code>, mais ils ne sont vérifiés qu'à la compilation : dans le JavaScript produit, tout redevient accessible. Seuls les champs <code>#private</code> sont vraiment privés à l'exécution. En C#, <code>private</code> est respecté par le compilateur <strong>et</strong> par le runtime. Et TypeScript n'a pas d'équivalent à <code>internal</code>, car la notion d'assembly n'existe pas : le plus proche serait « ne pas exporter » depuis un module.</p>`,
  examples: [
    {
      title: "Un champ privé protégé par une méthode publique",
      code: `var card = new LibraryCard("Alice");
card.AddPoints(10);
card.AddPoints(-50);   // refusé par la méthode
Console.WriteLine(card.Describe());
// card._points = 999; // erreur CS0122 : '_points' est inaccessible

class LibraryCard
{
    private int _points;           // visible seulement ici
    public string Owner { get; }   // visible partout

    public LibraryCard(string owner)
    {
        Owner = owner;
    }

    public void AddPoints(int points)
    {
        if (points > 0) _points += points;
    }

    public string Describe() => $"{Owner} : {_points} points";
}`,
      output: `Alice : 10 points`,
      steps: [
        "<code>private int _points;</code> : personne en dehors de <code>LibraryCard</code> ne peut lire ou écrire ce champ.",
        "<code>public void AddPoints(int points)</code> : la seule porte d'entrée, qui ignore les valeurs négatives.",
        "<code>card.AddPoints(-50);</code> : la condition <code>points &gt; 0</code> est fausse, rien ne change.",
        "<code>public string Describe() =&gt; ...</code> : une méthode publique a le droit de lire <code>_points</code>, car elle est dans la classe.",
        "<code>// card._points = 999;</code> : décommente-la pour voir l'erreur <code>CS0122</code>."
      ]
    },
    {
      title: "Les accès par défaut",
      code: `var book = new Book();
Console.WriteLine(book.Code());
// Console.WriteLine(book._secret); // erreur : private par défaut

class Book                        // rien écrit = internal
{
    string _secret = "B-042";     // rien écrit = private

    public string Code() => Format(_secret);

    string Format(string raw)     // rien écrit = private
    {
        return $"[{raw}]";
    }
}`,
      output: `[B-042]`,
      steps: [
        "<code>class Book</code> : sans modificateur, la classe est <code>internal</code>, utilisable partout dans ce projet.",
        "<code>string _secret = \"B-042\";</code> : sans modificateur, le champ est <code>private</code>.",
        "<code>string Format(string raw)</code> : une méthode d'aide privée, détail interne de la classe.",
        "<code>public string Code() =&gt; Format(_secret);</code> : seule <code>Code</code> est exposée ; elle utilise librement les membres privés."
      ],
      explain: "Écrire private explicitement reste conseillé : c'est plus lisible, même si c'est le défaut."
    },
    {
      title: "Une classe visible dans un seul fichier",
      code: `var formatter = new TitleFormatter();
Console.WriteLine(formatter.Shout("dune"));
Console.WriteLine(formatter.Shout("fondation"));

// file : ce type n'existe que dans Program.cs.
// Un autre fichier peut déclarer sa propre classe TitleFormatter sans conflit.
file class TitleFormatter
{
    public string Shout(string text)
    {
        return text.ToUpper() + " !";
    }
}`,
      output: `DUNE !
FONDATION !`,
      steps: [
        "<code>file class TitleFormatter</code> : la classe est invisible depuis les autres fichiers du projet.",
        "<code>var formatter = new TitleFormatter();</code> : le code du même fichier peut l'utiliser normalement.",
        "<code>public string Shout(...)</code> : le membre est public, mais il ne peut pas être plus visible que sa classe.",
        "<code>text.ToUpper() + \" !\"</code> : on met en majuscules et on ajoute un point d'exclamation."
      ],
      explain: "file sert surtout aux petites classes d'aide qu'on ne veut partager avec personne."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Cacher un mot de passe",
      prompt: `<p>Crée une classe <code>User</code> avec une propriété publique <code>Login</code> et un champ privé <code>_password</code>, rempli par le constructeur. Ajoute une méthode publique <code>CheckPassword(string attempt)</code> qui renvoie <code>true</code> si c'est le bon. Vérifie que <code>user._password</code> ne compile pas.</p>`,
      hint: `<p>Compare avec <code>attempt == _password</code>.</p>`,
      solution: `var user = new User("alice", "s3cret");
Console.WriteLine(user.CheckPassword("1234"));   // False
Console.WriteLine(user.CheckPassword("s3cret")); // True
// Console.WriteLine(user._password); // erreur CS0122

class User
{
    private readonly string _password;
    public string Login { get; }

    public User(string login, string password)
    {
        Login = login;
        _password = password;
    }

    public bool CheckPassword(string attempt) => attempt == _password;
}`
    },
    {
      level: "moyen",
      title: "Trouver les accès par défaut",
      prompt: `<p>Sans exécuter, indique l'accès réel de chaque élément : <code>class Shelf</code>, <code>int _capacity;</code>, <code>void Clear()</code>, <code>public int Count</code>. Puis réécris la classe en rendant chaque accès explicite.</p>`,
      hint: `<p>Classe sans mot-clé : <code>internal</code>. Membre sans mot-clé : <code>private</code>.</p>`,
      solution: `var shelf = new Shelf();
Console.WriteLine(shelf.Count);

internal class Shelf              // était implicite
{
    private int _capacity = 10;   // était implicite
    public int Count { get; private set; }

    private void Clear()          // était implicite
    {
        Count = 0;
        _capacity = 10;
    }
}`
    },
    {
      level: "difficile",
      title: "Verrouiller une classe Thermostat",
      prompt: `<p>Écris une classe <code>Thermostat</code> où la température cible est lisible par tous mais modifiable uniquement par deux méthodes publiques <code>Up()</code> et <code>Down()</code> (un degré à la fois, entre 15 et 25). Le calcul de bornes doit être une méthode <strong>privée</strong> <code>Clamp</code>. Choisis le moindre accès pour chaque membre.</p>`,
      hint: `<p>Propriété <code>{ get; private set; }</code>, et <code>Up()</code> appelle <code>Clamp(Target + 1)</code>.</p>`,
      solution: `var thermostat = new Thermostat();
for (int i = 0; i < 10; i++) thermostat.Up();
Console.WriteLine(thermostat.Target); // 25
thermostat.Down();
Console.WriteLine(thermostat.Target); // 24

class Thermostat
{
    public int Target { get; private set; } = 20;

    public void Up() => Target = Clamp(Target + 1);
    public void Down() => Target = Clamp(Target - 1);

    private int Clamp(int value) => Math.Clamp(value, 15, 25);
}`
    }
  ],
  quiz: [
    {
      q: `Quel est l'accès d'un membre déclaré sans modificateur dans une classe C# ?`,
      options: [
        `<code>public</code>, comme en TypeScript`,
        `<code>internal</code>`,
        `<code>private</code>`
      ],
      answer: 2,
      why: `En C#, un membre sans mot-clé est <code>private</code>. C'est la classe elle-même qui est <code>internal</code> par défaut. Le piège vient de TypeScript, où le défaut est public.`
    },
    {
      q: `Un membre <code>internal</code> est accessible…`,
      options: [
        `depuis tout le code du même projet (assembly)`,
        `seulement depuis la classe et ses classes dérivées`,
        `depuis n'importe quel projet`
      ],
      answer: 0,
      why: `<code>internal</code> trace la frontière au niveau du projet compilé. Un autre projet qui référence le tien ne le voit pas.`
    },
    {
      q: `Que veut dire la règle du moindre accès ?`,
      options: [
        `Tout mettre en <code>public</code> pour éviter les erreurs de compilation`,
        `Donner l'accès le plus fermé possible, et n'ouvrir que si c'est nécessaire`,
        `Ne jamais utiliser <code>public</code>`
      ],
      answer: 1,
      why: `Ce qui est public devient une promesse difficile à changer. On part de <code>private</code> et on élargit au besoin ; il faut bien sûr du public pour que la classe serve à quelque chose.`
    }
  ],
  project: `<p><strong>Bibliothèque, étape 4.</strong> Passe en revue <code>Book</code> : les champs de stockage (<code>_title</code>, <code>_year</code>…) doivent être <code>private</code>, les propriétés lisibles par tous. Rends les setters privés (<code>private set</code>) si plus personne ne doit changer un livre après sa création. Écris explicitement chaque modificateur, et vérifie qu'une ligne comme <code>book._year = -1;</code> ne compile plus.</p>`,
  resources: [
    { label: "Modificateurs d'accès (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/access-modifiers" }
  ]
});

/* ===================== 3.5 Membres static ===================== */
window.COURSE.push({
  key: "l-static-members",
  title: "3.5 Membres static",
  summary: "Tu sauras créer des champs et méthodes qui appartiennent à la classe plutôt qu'à chaque objet.",
  objectives: [
    "Comprendre la différence entre membre d'instance et membre static",
    "Écrire un compteur d'instances avec un champ static",
    "Appeler une méthode static via le nom de la classe",
    "Éviter le piège de l'état static partagé"
  ],
  analogy: `<p>Dans une bibliothèque, chaque livre porte <strong>sa propre étiquette</strong> avec son titre et sa cote : c'est une donnée d'instance, une par livre.</p>
<p>À l'accueil, il y a <strong>un seul compteur</strong> qui affiche le nombre total de livres du fonds. Il n'est collé sur aucun livre en particulier : il appartient à la bibliothèque entière. C'est une donnée <strong>static</strong>.</p>`,
  lesson: `<h3>Instance ou classe ?</h3>
<p>Tout ce que tu as écrit jusqu'ici était un membre <strong>d'instance</strong> : chaque objet a sa propre copie de <code>Title</code>, et on appelle <code>book.Describe()</code> sur un objet précis.</p>
<p>Le mot-clé <code>static</code> change ça : un membre <code>static</code> <strong>appartient à la classe elle-même</strong>, pas à un objet. Il en existe <strong>un seul exemplaire</strong>, partagé par tout le programme, même si tu n'as créé aucun objet.</p>
<pre class="diagram"> Classe Book (une seule fois)
 +--------------------------+
 | static Count = 3         |
 +--------------------------+

 Objets (un exemplaire chacun)
 +--------------+  +--------------+  +--------------+
 | Title "Dune" |  | Title "Fond."|  | Title "Hyp." |
 | Number 1     |  | Number 2     |  | Number 3     |
 +--------------+  +--------------+  +--------------+</pre>

<h3>Le champ static : un compteur d'instances</h3>
<p>Exemple classique : compter combien de livres ont été créés. Si le compteur était un champ normal, chaque livre aurait le sien, toujours à 1. Avec <code>static</code>, tous les constructeurs incrémentent <strong>le même</strong> compteur.</p>
<p>On le déclare comme d'habitude, avec <code>static</code> en plus : <code>public static int Count { get; private set; }</code>. Et on le lit avec le <strong>nom de la classe</strong> : <code>Book.Count</code>, pas <code>book.Count</code>.</p>

<h3>La méthode static</h3>
<p>Une méthode <code>static</code> est une action qui n'a pas besoin d'un objet particulier. Tu en utilises déjà plein : <code>Console.WriteLine(...)</code>, <code>Math.Max(3, 8)</code>, <code>int.Parse("42")</code>. Tu n'as jamais écrit <code>new Math()</code> : on appelle directement la méthode sur la classe.</p>
<p>Tu peux écrire les tiennes, par exemple <code>Book.IsValidYear(1965)</code> : vérifier une année ne dépend d'aucun livre précis. En TypeScript, c'est exactement <code>static isValidYear()</code> appelé avec <code>Book.isValidYear()</code>.</p>

<h3>Ce qu'une méthode static ne peut pas faire</h3>
<p>Une méthode <code>static</code> n'est appelée sur aucun objet. Donc <strong>il n'y a pas de <code>this</code></strong> : impossible de lire <code>Title</code> ou d'appeler <code>Describe()</code>, car « le titre de qui ? ». Le compilateur refuse avec l'erreur <code>CS0120</code> (« une référence d'objet est requise ») ou <code>CS0026</code> si tu écris <code>this</code>.</p>
<div class="compare"><div><h4>Membre d'instance</h4><p>Peut utiliser les membres d'instance <strong>et</strong> les membres static. Appel : <code>book.Describe()</code>.</p></div><div><h4>Membre static</h4><p>Peut utiliser uniquement les autres membres static (ou un objet reçu en paramètre). Appel : <code>Book.IsValidYear(1965)</code>.</p></div></div>
<p>L'inverse fonctionne : une méthode d'instance peut lire un champ static, comme le constructeur qui fait <code>Count++</code>.</p>

<h3>Le piège : l'état static partagé</h3>
<p>Comme un champ static est unique, tout le monde le modifie en même temps. Si tu mets une liste en <code>static</code> dans une classe <code>Shelf</code>, toutes les étagères partageront <strong>la même</strong> liste : ajouter un livre sur l'une le fait apparaître sur toutes.</p>
<div class="tip">Avant d'écrire <code>static</code> sur un champ, demande-toi : « cette donnée est-elle vraiment unique pour tout le programme ? ». Si chaque objet doit avoir la sienne, c'est un champ d'instance.</div>
<p>Ce partage pose aussi problème avec plusieurs threads (plusieurs tâches en parallèle) et dans les tests automatisés, où un test peut laisser des traces pour le suivant. On en reparlera en 3.6.</p>
<div class="note">En entreprise, les champs <code>static</code> modifiables sont rares. On garde <code>static</code> surtout pour des méthodes « pures » (qui calculent un résultat sans rien modifier) et pour des constantes, qu'on verra en 3.7.</div>`,
  examples: [
    {
      title: "Un compteur d'instances",
      code: `var a = new Book("Dune");
var b = new Book("Fondation");
var c = new Book("Hypérion");
Console.WriteLine($"Livres créés : {Book.Count}");
Console.WriteLine($"{b.Title} est le livre n°{b.Number}");

class Book
{
    public static int Count { get; private set; }  // un seul pour toute la classe
    public string Title { get; }                   // un par livre
    public int Number { get; }                     // un par livre

    public Book(string title)
    {
        Title = title;
        Count++;
        Number = Count;
    }
}`,
      output: `Livres créés : 3
Fondation est le livre n°2`,
      steps: [
        "<code>public static int Count { get; private set; }</code> : une seule valeur, rangée dans la classe.",
        "<code>Count++;</code> : chaque constructeur incrémente le même compteur partagé.",
        "<code>Number = Count;</code> : on copie la valeur actuelle dans une propriété d'instance, propre à chaque livre.",
        "<code>Book.Count</code> : on lit un membre static via le nom de la classe.",
        "<code>b.Number</code> : vaut 2, car <code>b</code> a été créé en deuxième."
      ]
    },
    {
      title: "Des méthodes static",
      code: `Console.WriteLine(Math.Max(12, 7));
int year = int.Parse("1965");
Console.WriteLine(year + 1);
Console.WriteLine(Book.IsValidYear(1965));
Console.WriteLine(Book.IsValidYear(3000));

class Book
{
    public static bool IsValidYear(int year)
    {
        return year >= 1450 && year <= 2100;
    }
}`,
      output: `12
1966
True
False`,
      steps: [
        "<code>Math.Max(12, 7)</code> : méthode static de .NET, appelée sur la classe <code>Math</code>.",
        "<code>int.Parse(\"1965\")</code> : méthode static du type <code>int</code>, qui convertit le texte en nombre.",
        "<code>public static bool IsValidYear(int year)</code> : notre propre méthode static, qui n'a besoin d'aucun livre.",
        "<code>Book.IsValidYear(3000)</code> : on l'appelle sans jamais faire <code>new Book()</code>."
      ],
      explain: "Une méthode qui ne lit aucune donnée d'objet est une bonne candidate pour static."
    },
    {
      title: "Le piège de l'état partagé",
      code: `var a = new Shelf();
var b = new Shelf();
a.Add("Dune");
b.Add("Fondation");
Console.WriteLine(a.Count());
Console.WriteLine(b.Count());

class Shelf
{
    // Piège : static = une seule liste pour TOUTES les étagères
    private static List<string> _books = new();

    public void Add(string title) => _books.Add(title);
    public int Count() => _books.Count;

    // public static void Show() => Console.WriteLine(this.Count());
    // erreur CS0026 : this est interdit dans un membre static
}`,
      output: `2
2`,
      steps: [
        "<code>private static List&lt;string&gt; _books</code> : la liste est rangée dans la classe, pas dans chaque étagère.",
        "<code>a.Add(\"Dune\");</code> puis <code>b.Add(\"Fondation\");</code> : les deux ajouts vont dans la même liste.",
        "<code>a.Count()</code> et <code>b.Count()</code> : les deux étagères affichent 2, alors qu'on attendait 1 chacune.",
        "<code>// public static void Show() ...</code> : une méthode static ne peut pas utiliser <code>this</code>.",
        "Correction : enlever <code>static</code> sur <code>_books</code> pour que chaque étagère ait sa propre liste."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un convertisseur de températures",
      prompt: `<p>Crée une classe <code>Temperature</code> avec une méthode static <code>ToFahrenheit(double celsius)</code> qui renvoie <code>celsius * 9 / 5 + 32</code>. Affiche la conversion de 100 °C sans créer d'objet.</p>`,
      hint: `<p>Appelle <code>Temperature.ToFahrenheit(100)</code>.</p>`,
      solution: `Console.WriteLine(Temperature.ToFahrenheit(100)); // 212

class Temperature
{
    public static double ToFahrenheit(double celsius)
    {
        return celsius * 9 / 5 + 32;
    }
}`
    },
    {
      level: "moyen",
      title: "Des identifiants uniques",
      prompt: `<p>Crée une classe <code>Ticket</code> avec un champ static privé <code>_nextId</code> qui démarre à 1, et une propriété d'instance <code>Id</code>. Chaque nouveau ticket reçoit l'identifiant suivant. Crée trois tickets et affiche leurs <code>Id</code>.</p>`,
      hint: `<p>Dans le constructeur : <code>Id = _nextId;</code> puis <code>_nextId++;</code>.</p>`,
      solution: `var t1 = new Ticket();
var t2 = new Ticket();
var t3 = new Ticket();
Console.WriteLine($"{t1.Id} {t2.Id} {t3.Id}"); // 1 2 3

class Ticket
{
    private static int _nextId = 1;
    public int Id { get; }

    public Ticket()
    {
        Id = _nextId;
        _nextId++;
    }
}`
    },
    {
      level: "difficile",
      title: "Trouver et corriger l'erreur",
      prompt: `<p>Ce code ne compile pas : <code>class Book { public string Title { get; set; } = ""; public static string Shout() =&gt; Title.ToUpper(); }</code>. Explique pourquoi, puis propose deux corrections : l'une qui rend la méthode non static, l'autre qui garde <code>static</code> mais reçoit un livre en paramètre.</p>`,
      hint: `<p>Une méthode static n'a pas de <code>this</code> : de quel livre viendrait <code>Title</code> ?</p>`,
      solution: `var book = new Book { Title = "Dune" };
Console.WriteLine(book.Shout());          // DUNE
Console.WriteLine(Book.ShoutOf(book));    // DUNE

class Book
{
    public string Title { get; set; } = "";

    // Correction 1 : méthode d'instance, elle a accès à Title
    public string Shout() => Title.ToUpper();

    // Correction 2 : méthode static qui reçoit l'objet en paramètre
    public static string ShoutOf(Book book) => book.Title.ToUpper();
}`
    }
  ],
  quiz: [
    {
      q: `Combien d'exemplaires d'un champ <code>static</code> existent si on crée 50 objets ?`,
      options: [
        `50, un par objet`,
        `Un seul, partagé par toute la classe`,
        `Aucun tant qu'on n'appelle pas une méthode static`
      ],
      answer: 1,
      why: `Un champ static appartient à la classe, pas aux objets. Le nombre d'objets créés ne change rien : il y en a toujours un seul.`
    },
    {
      q: `Pourquoi une méthode <code>static</code> ne peut-elle pas lire <code>Title</code>, une propriété d'instance ?`,
      options: [
        `Parce que <code>Title</code> est forcément privé`,
        `Parce qu'il faudrait la déclarer <code>public</code>`,
        `Parce qu'elle n'est appelée sur aucun objet : il n'y a pas de <code>this</code>`
      ],
      answer: 2,
      why: `<code>Title</code> existe une fois par livre. Sans objet courant, le compilateur ne sait pas de quel livre il s'agit. La visibilité n'a rien à voir.`
    },
    {
      q: `Comment appelle-t-on la méthode static <code>IsValidYear</code> de la classe <code>Book</code> ?`,
      options: [
        `<code>Book.IsValidYear(1965)</code>`,
        `<code>new Book().IsValidYear(1965)</code>`,
        `<code>this.IsValidYear(1965)</code>`
      ],
      answer: 0,
      why: `En C#, un membre static s'appelle via le nom de la classe. Passer par un objet provoque une erreur de compilation (contrairement à Java).`
    }
  ],
  project: `<p><strong>Bibliothèque, étape 5.</strong> Ajoute à <code>Book</code> une propriété <code>public static int TotalBooks { get; private set; }</code>, incrémentée dans le constructeur. Transforme ta vérification d'année en méthode <code>public static bool IsValidYear(int year)</code>, utilisée par le <code>set</code> de <code>Year</code>. Crée trois livres puis affiche <code>Livres dans le fonds : 3</code>.</p>`,
  resources: [
    { label: "Mot-clé static (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/static" }
  ]
});

/* ===================== 3.6 Classes static et constructeur static ===================== */
window.COURSE.push({
  key: "l-static-classes",
  title: "3.6 Classes static et constructeur static",
  summary: "Tu sauras écrire une classe utilitaire static, un constructeur static, et savoir quand éviter static.",
  objectives: [
    "Déclarer une classe static et connaître ses limites",
    "Écrire une classe utilitaire de méthodes d'aide",
    "Comprendre quand s'exécute un constructeur static",
    "Utiliser using static et savoir quand ne pas utiliser static"
  ],
  analogy: `<p>Une <strong>classe static</strong>, c'est une <strong>boîte à outils</strong> accrochée au mur de l'atelier. Il n'y en a qu'une, tout le monde s'en sert, et on ne fabrique pas une nouvelle boîte à chaque fois qu'on a besoin d'un tournevis.</p>
<p>Le <strong>constructeur static</strong>, c'est le gardien qui ouvre l'atelier le matin : il le fait une seule fois, juste avant l'arrivée du premier ouvrier.</p>`,
  lesson: `<h3>La classe static</h3>
<p>En 3.5, tu as vu des membres static dans une classe normale. Parfois, une classe ne contient <strong>que</strong> des membres static : elle n'a aucune donnée propre à un objet. On la déclare alors avec <code>static class</code>.</p>
<p>Le compilateur impose alors trois règles :</p>
<ul>
<li>tous ses membres doivent être <code>static</code> ;</li>
<li>on ne peut pas faire <code>new</code> dessus (erreur <code>CS0712</code>) ;</li>
<li>on ne peut pas en hériter (l'héritage arrive en 3.9).</li>
</ul>
<p>Tu en utilises déjà : <code>Math</code> et <code>Console</code> sont des classes static. C'est pour ça que tu écris <code>Console.WriteLine</code> sans jamais créer de console.</p>

<h3>La classe utilitaire</h3>
<p>L'usage le plus courant : regrouper des petites fonctions d'aide, par exemple <code>StringHelpers.Initials("Frank Herbert")</code>. En TypeScript, tu ferais un fichier <code>string-helpers.ts</code> qui exporte des fonctions. En C#, une fonction ne peut pas vivre seule hors d'une classe : la classe static joue ce rôle de « module de fonctions ».</p>
<div class="compare"><div><h4>Classe normale</h4><p>Données + comportement. On crée des objets avec <code>new</code>. Exemple : <code>Book</code>.</p></div><div><h4>Classe static</h4><p>Seulement du comportement (ou des réglages globaux). Jamais de <code>new</code>. Exemple : <code>Math</code>.</p></div></div>

<h3>Le constructeur static</h3>
<p>Un constructeur normal prépare un objet. Un <strong>constructeur static</strong> prépare <strong>la classe</strong> : il initialise ses champs static. Il s'écrit <code>static Book() { … }</code>, sans modificateur d'accès et <strong>sans paramètre</strong>.</p>
<p>Tu ne l'appelles jamais toi-même : .NET l'exécute automatiquement, <strong>une seule fois</strong>, juste avant la première utilisation de la classe (premier accès à un membre static ou premier <code>new</code>).</p>
<div class="flow"><span>Programme démarre</span><span>1er accès à LibraryConfig</span><span>constructeur static (1 fois)</span><span>membre utilisé</span></div>
<p>Il sert quand l'initialisation demande plusieurs lignes : lire un réglage, remplir une table de correspondance, etc. On peut en mettre un dans une classe static ou dans une classe normale.</p>
<div class="tip">Si un constructeur static lève une erreur, la classe devient inutilisable pour toute la durée du programme. Garde-le court et sans risque.</div>

<h3>using static</h3>
<p>Quand tu utilises beaucoup une classe static, tu peux importer ses membres en haut du fichier : <code>using static System.Math;</code>. Ensuite, tu écris <code>Max(3, 8)</code> au lieu de <code>Math.Max(3, 8)</code>. C'est proche de <code>import { max } from "./math"</code> en TypeScript. À utiliser avec modération : on ne voit plus d'où vient la méthode.</p>

<h3>Quand NE PAS utiliser static</h3>
<p>Le static est tentant (« pas besoin de créer d'objet ! »), mais il a deux défauts sérieux :</p>
<ul>
<li><strong>L'état global</strong> : un champ static modifiable est visible et modifiable de partout. Impossible de savoir qui l'a changé, et c'est dangereux quand plusieurs tâches tournent en parallèle.</li>
<li><strong>Difficile à tester</strong> : un appel static est « gravé » dans le code. On ne peut pas le remplacer par une version factice pendant un test, par exemple pour ne pas envoyer de vrais e-mails.</li>
</ul>
<p>Règle simple : static pour des fonctions pures (même entrée, même sortie, aucun effet de bord) et des constantes. Pour tout ce qui garde un état ou parle au monde extérieur (fichiers, base de données, réseau), crée une classe normale.</p>
<div class="note">Dans ASP.NET Core, ce rôle de « service unique partagé » est tenu par l'injection de dépendances (comme les services <code>providedIn: 'root'</code> d'Angular). On obtient une seule instance, mais remplaçable dans les tests. Tu le verras dans les modules suivants.</div>`,
  examples: [
    {
      title: "Une classe utilitaire",
      code: `Console.WriteLine(StringHelpers.Initials("Frank Herbert"));
Console.WriteLine(StringHelpers.Truncate("Le Seigneur des anneaux", 10));
Console.WriteLine(StringHelpers.Truncate("Dune", 10));
// var helpers = new StringHelpers(); // erreur CS0712

static class StringHelpers
{
    public static string Initials(string fullName)
    {
        var result = "";
        foreach (var part in fullName.Split(' '))
            result += part[0];
        return result.ToUpper();
    }

    public static string Truncate(string text, int max)
    {
        return text.Length <= max ? text : text.Substring(0, max) + "...";
    }
}`,
      output: `FH
Le Seigneu...
Dune`,
      steps: [
        "<code>static class StringHelpers</code> : une classe qui ne contient que des méthodes static.",
        "<code>fullName.Split(' ')</code> : découpe le nom en mots ; <code>part[0]</code> prend la première lettre de chacun.",
        "<code>text.Substring(0, max) + \"...\"</code> : garde les 10 premiers caractères puis ajoute des points de suspension.",
        "<code>StringHelpers.Truncate(\"Dune\", 10)</code> : texte assez court, il est renvoyé tel quel.",
        "<code>// var helpers = new StringHelpers();</code> : interdit, on ne crée jamais d'objet d'une classe static."
      ]
    },
    {
      title: "Le constructeur static",
      code: `Console.WriteLine("Début du programme");
Console.WriteLine(LibraryConfig.Name);
Console.WriteLine(LibraryConfig.OpeningHour);

static class LibraryConfig
{
    public static string Name { get; }
    public static int OpeningHour { get; }

    static LibraryConfig()
    {
        Console.WriteLine("Constructeur static exécuté");
        Name = "Médiathèque centrale";
        OpeningHour = 9;
    }
}`,
      output: `Début du programme
Constructeur static exécuté
Médiathèque centrale
9`,
      steps: [
        "<code>Console.WriteLine(\"Début du programme\");</code> : la classe n'a pas encore servi, rien n'est initialisé.",
        "<code>LibraryConfig.Name</code> : premier accès, .NET lance d'abord le constructeur static.",
        "<code>static LibraryConfig()</code> : pas de <code>public</code>, pas de paramètre, exécuté une seule fois.",
        "<code>LibraryConfig.OpeningHour</code> : deuxième accès, le constructeur static ne repasse pas."
      ],
      explain: "Le message du constructeur n'apparaît qu'une fois, juste avant le premier usage."
    },
    {
      title: "using static",
      code: `using static System.Math;
using static System.Console;

WriteLine(Max(3, 8));
WriteLine(Abs(-5));
WriteLine(Pow(2, 10));`,
      output: `8
5
1024`,
      steps: [
        "<code>using static System.Math;</code> : importe les membres static de <code>Math</code>.",
        "<code>using static System.Console;</code> : idem pour <code>Console</code>, on peut écrire <code>WriteLine</code> seul.",
        "<code>Max(3, 8)</code> : équivaut à <code>Math.Max(3, 8)</code>.",
        "<code>Pow(2, 10)</code> : 2 puissance 10, renvoie un <code>double</code> qui s'affiche <code>1024</code>."
      ],
      explain: "Les using doivent être placés tout en haut du fichier, avant le code."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une boîte à outils de calcul",
      prompt: `<p>Crée une classe static <code>MathHelpers</code> avec deux méthodes : <code>IsEven(int n)</code> (vrai si pair) et <code>Square(int n)</code>. Affiche <code>IsEven(4)</code> et <code>Square(7)</code>.</p>`,
      hint: `<p>Un nombre est pair si <code>n % 2 == 0</code>.</p>`,
      solution: `Console.WriteLine(MathHelpers.IsEven(4)); // True
Console.WriteLine(MathHelpers.Square(7)); // 49

static class MathHelpers
{
    public static bool IsEven(int n) => n % 2 == 0;
    public static int Square(int n) => n * n;
}`
    },
    {
      level: "moyen",
      title: "Une table de genres",
      prompt: `<p>Crée une classe static <code>Genres</code> avec une propriété static <code>All</code> (un tableau de <code>string</code>) remplie dans un constructeur static avec <code>"Roman"</code>, <code>"BD"</code> et <code>"Science"</code>. Ajoute une méthode <code>Exists(string genre)</code>. Affiche un message dans le constructeur static pour vérifier qu'il ne s'exécute qu'une fois.</p>`,
      hint: `<p><code>Array.IndexOf(All, genre) &gt;= 0</code> indique si le genre est dans le tableau.</p>`,
      solution: `Console.WriteLine(Genres.Exists("BD"));     // Init des genres, puis True
Console.WriteLine(Genres.Exists("Poésie")); // False

static class Genres
{
    public static string[] All { get; }

    static Genres()
    {
        Console.WriteLine("Init des genres");
        All = new[] { "Roman", "BD", "Science" };
    }

    public static bool Exists(string genre) => Array.IndexOf(All, genre) >= 0;
}`
    },
    {
      level: "difficile",
      title: "Static ou pas ?",
      prompt: `<p>Pour chacune de ces classes, dis si elle devrait être static, et pourquoi : (1) <code>PriceFormatter</code> qui transforme un nombre en texte « 12,50 € » ; (2) <code>ShoppingCart</code> qui garde la liste des articles d'un client ; (3) <code>EmailSender</code> qui envoie de vrais e-mails. Écris ensuite la version static de la première.</p>`,
      hint: `<p>Cherche : y a-t-il un état propre à chaque usage ? Un effet sur le monde extérieur ?</p>`,
      solution: `// (1) PriceFormatter : static OK, fonction pure, aucun état.
// (2) ShoppingCart : pas static, chaque client a son propre panier (état).
// (3) EmailSender : pas static, effet extérieur, on veut le remplacer dans les tests.
Console.WriteLine(PriceFormatter.Format(12.5m));

static class PriceFormatter
{
    public static string Format(decimal amount)
    {
        var culture = System.Globalization.CultureInfo.GetCultureInfo("fr-FR");
        return amount.ToString("0.00", culture) + " €";
    }
}`
    }
  ],
  quiz: [
    {
      q: `Que se passe-t-il avec <code>new Math()</code> ?`,
      options: [
        `Ça crée un objet <code>Math</code> vide`,
        `Erreur de compilation : <code>Math</code> est une classe static`,
        `Ça fonctionne seulement avec <code>using static</code>`
      ],
      answer: 1,
      why: `On ne peut jamais instancier une classe static. Ses membres s'utilisent directement via le nom de la classe.`
    },
    {
      q: `Quand le constructeur static d'une classe s'exécute-t-il ?`,
      options: [
        `Au démarrage du programme, pour toutes les classes`,
        `À chaque <code>new</code>`,
        `Une seule fois, juste avant la première utilisation de la classe`
      ],
      answer: 2,
      why: `.NET le déclenche automatiquement au premier accès, et jamais plus ensuite. Ce n'est pas au démarrage du programme, ni à chaque objet.`
    },
    {
      q: `Pourquoi éviter de mettre l'accès à la base de données dans une classe static ?`,
      options: [
        `Parce qu'on ne peut pas la remplacer facilement par une version factice dans les tests`,
        `Parce qu'une classe static ne peut pas contenir de méthode qui renvoie une valeur`,
        `Parce que static est plus lent`
      ],
      answer: 0,
      why: `Un appel static est figé dans le code. Une classe normale injectée peut être remplacée dans un test. La performance n'est pas le problème.`
    }
  ],
  resources: [
    { label: "Classes static et membres static (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/static-classes-and-static-class-members" }
  ]
});

/* ===================== 3.7 const, readonly et static readonly ===================== */
window.COURSE.push({
  key: "l-const-readonly",
  title: "3.7 const, readonly et static readonly",
  summary: "Tu sauras choisir entre const, readonly et static readonly pour des valeurs qui ne doivent pas changer.",
  objectives: [
    "Déclarer une constante avec const et connaître ses limites",
    "Utiliser readonly pour une valeur fixée par objet",
    "Utiliser static readonly pour une valeur calculée une fois",
    "Éviter les pièges de readonly sur une liste et de public const"
  ],
  analogy: `<p>Une <strong>const</strong>, c'est un nombre <strong>gravé dans le marbre</strong> à la fabrication : « 7 jours dans une semaine ». Il est connu avant même que l'usine tourne.</p>
<p>Un <strong>readonly</strong>, c'est le <strong>numéro de série</strong> d'un appareil : chacun a le sien, inscrit une fois à la sortie de l'usine, puis plus jamais modifié. Un <strong>static readonly</strong>, c'est la <strong>date d'ouverture</strong> du magasin : unique pour tous, mais connue seulement le jour où il ouvre.</p>`,
  lesson: `<h3>const : connu à la compilation</h3>
<p>Une <strong>constante</strong> est une valeur que le compilateur connaît déjà quand il lit ton code : <code>public const int MaxLoans = 3;</code>. Elle ne peut jamais changer.</p>
<p>Trois choses à savoir :</p>
<ul>
<li>elle est <strong>implicitement static</strong> : on écrit <code>Library.MaxLoans</code>, et on ne met pas le mot <code>static</code> ;</li>
<li>elle n'accepte que des <strong>types simples</strong> : nombres, <code>bool</code>, <code>char</code>, <code>string</code> ;</li>
<li>la valeur doit être écrite « en dur » : <code>DateTime.Now</code> ou <code>new List&lt;string&gt;()</code> sont refusés, car ils ne sont connus qu'à l'exécution.</li>
</ul>
<p>Une <code>const</code> peut aussi être locale à une méthode : <code>const int max = 10;</code>.</p>

<h3>readonly : fixé une fois par objet</h3>
<p>Un champ <code>readonly</code> ne peut être assigné qu'à <strong>deux endroits</strong> : à sa déclaration, ou dans le constructeur. Après, il est figé. Contrairement à <code>const</code>, il accepte <strong>n'importe quel type</strong> et sa valeur peut être <strong>différente pour chaque objet</strong> : chaque emprunt a sa propre date de retour.</p>
<p>C'est le même esprit qu'une propriété <code>{ get; }</code> vue en 3.2. En pratique : <code>readonly</code> pour les champs privés, <code>{ get; }</code> pour ce qui est public.</p>

<h3>static readonly : calculé une fois, à l'exécution</h3>
<p>Que faire pour une valeur unique et partagée, mais qu'on ne peut pas écrire en <code>const</code>, comme une durée <code>TimeSpan.FromDays(21)</code> ? On combine : <code>public static readonly TimeSpan LoanDuration = TimeSpan.FromDays(21);</code>.</p>
<p>La valeur est calculée <strong>une seule fois</strong>, au premier usage de la classe (comme un constructeur static, vu en 3.6), puis elle ne bouge plus.</p>

<h3>Le grand comparatif</h3>
<table>
<tr><th></th><th><code>const</code></th><th><code>readonly</code></th><th><code>static readonly</code></th></tr>
<tr><td>Valeur fixée</td><td>à la compilation</td><td>à l'exécution (déclaration ou constructeur)</td><td>à l'exécution, une seule fois</td></tr>
<tr><td>Appartient à</td><td>la classe (implicitement static)</td><td>chaque objet</td><td>la classe</td></tr>
<tr><td>Types acceptés</td><td>nombres, bool, char, string</td><td>tous</td><td>tous</td></tr>
<tr><td>Exemple</td><td><code>MaxLoans = 3</code></td><td><code>DueDate</code> d'un emprunt</td><td><code>LoanDuration</code></td></tr>
</table>

<h3>Piège n°1 : readonly sur une liste</h3>
<p><code>readonly</code> bloque la <strong>variable</strong>, pas l'objet vers lequel elle pointe. Avec <code>readonly List&lt;string&gt; Titles</code>, tu ne peux pas remplacer la liste par une autre, mais tu peux toujours appeler <code>Titles.Add(...)</code> ou <code>Titles.Clear()</code>.</p>
<pre class="diagram"> Titles (readonly)       la liste en mémoire
 +-------------+        +--------------------+
 | référence --|-------&gt;| "Dune"             |
 +-------------+        | "Fondation"        |
   figée                | (Add/Clear permis) |
                        +--------------------+</pre>
<p>Pour vraiment protéger le contenu, il faudra exposer la liste en lecture seule : c'est l'objet de la leçon 3.8.</p>
<div class="tip">C'est exactement comme <code>const</code> en JavaScript : <code>const list = []</code> interdit <code>list = autre</code>, mais autorise <code>list.push(...)</code>.</div>

<h3>Piège n°2 : public const et les versions</h3>
<p>Imagine un projet A (une bibliothèque de code) avec <code>public const int MaxLoans = 3;</code>, utilisé par un projet B. À la compilation de B, le compilateur <strong>recopie directement</strong> la valeur 3 dans le code de B. Si A passe ensuite à 5 et que B n'est pas recompilé, B continue d'utiliser 3 sans le savoir.</p>
<p>Avec <code>static readonly</code>, B lit la valeur dans A au moment de l'exécution : il voit toujours la bonne. Règle : <code>public const</code> seulement pour des valeurs vraiment éternelles (nombre de jours d'une semaine), sinon <code>static readonly</code>.</p>

<h3>Et le const de JavaScript ?</h3>
<p>Attention au faux ami. En JS/TS, <code>const</code> veut dire « cette variable ne sera pas réaffectée », quelle que soit la valeur, même calculée. Le <code>const</code> de C# est bien plus strict : une valeur simple connue à la compilation. L'équivalent du <code>const</code> JS pour un champ, c'est plutôt <code>readonly</code>.</p>`,
  examples: [
    {
      title: "Des constantes",
      code: `Console.WriteLine(Library.MaxLoans);
Console.WriteLine(Library.Name);
int remaining = Library.MaxLoans - 1;
Console.WriteLine($"Il reste {remaining} emprunts possibles");

class Library
{
    public const int MaxLoans = 3;
    public const string Name = "Médiathèque";
    // public const DateTime Opening = DateTime.Now; // erreur : pas connu à la compilation
}`,
      output: `3
Médiathèque
Il reste 2 emprunts possibles`,
      steps: [
        "<code>public const int MaxLoans = 3;</code> : valeur écrite en dur, connue du compilateur.",
        "<code>Library.MaxLoans</code> : on y accède via la classe, car une <code>const</code> est implicitement static.",
        "<code>public const string Name</code> : une <code>string</code> peut être constante.",
        "<code>// public const DateTime Opening = DateTime.Now;</code> : refusé, la date n'est connue qu'à l'exécution."
      ]
    },
    {
      title: "readonly et static readonly",
      code: `var loan = new Loan("Dune", new DateTime(2026, 3, 1));
Console.WriteLine(loan.Title);
Console.WriteLine(loan.DueDate.ToString("yyyy-MM-dd"));
Console.WriteLine(Loan.Duration.TotalDays);

class Loan
{
    public static readonly TimeSpan Duration = TimeSpan.FromDays(21);
    public readonly string Title;
    public readonly DateTime DueDate;

    public Loan(string title, DateTime start)
    {
        Title = title;
        DueDate = start + Duration;   // assigné une fois, dans le constructeur
    }

    // public void Extend() { DueDate = DueDate.AddDays(7); } // erreur CS0191
}`,
      output: `Dune
2026-03-22
21`,
      steps: [
        "<code>public static readonly TimeSpan Duration</code> : une durée unique pour tous les emprunts, calculée à l'exécution.",
        "<code>public readonly DateTime DueDate;</code> : chaque emprunt a sa propre date de retour.",
        "<code>DueDate = start + Duration;</code> : le constructeur est l'un des deux seuls endroits où l'assigner.",
        "<code>ToString(\"yyyy-MM-dd\")</code> : 1er mars + 21 jours = 22 mars, dans un format fixe.",
        "<code>// public void Extend() ...</code> : modifier un <code>readonly</code> hors du constructeur est refusé (<code>CS0191</code>)."
      ]
    },
    {
      title: "Le piège de la liste readonly",
      code: `var shelf = new Shelf();
shelf.Titles.Add("Dune");
shelf.Titles.Add("Fondation");
Console.WriteLine(shelf.Titles.Count);
shelf.Titles.Clear();
Console.WriteLine(shelf.Titles.Count);
// shelf.Titles = new List<string>(); // erreur : le champ est readonly

class Shelf
{
    public readonly List<string> Titles = new();
}`,
      output: `2
0`,
      steps: [
        "<code>public readonly List&lt;string&gt; Titles = new();</code> : la référence vers la liste est figée.",
        "<code>shelf.Titles.Add(\"Dune\");</code> : autorisé, on modifie le contenu, pas la référence.",
        "<code>shelf.Titles.Clear();</code> : autorisé aussi, la liste est vidée.",
        "<code>// shelf.Titles = new List&lt;string&gt;();</code> : seul le remplacement de la liste est interdit."
      ],
      explain: "readonly protège la variable, pas l'objet : on corrigera ça en 3.8."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Des constantes de jeu",
      prompt: `<p>Crée une classe <code>Game</code> avec deux constantes : <code>MaxPlayers = 4</code> et <code>Title = "Quiz .NET"</code>. Affiche <code>Quiz .NET : 4 joueurs maximum</code>.</p>`,
      hint: `<p><code>public const int MaxPlayers = 4;</code>, puis <code>Game.MaxPlayers</code>.</p>`,
      solution: `Console.WriteLine($"{Game.Title} : {Game.MaxPlayers} joueurs maximum");

class Game
{
    public const int MaxPlayers = 4;
    public const string Title = "Quiz .NET";
}`
    },
    {
      level: "moyen",
      title: "Un identifiant figé",
      prompt: `<p>Crée une classe <code>Order</code> avec un champ <code>readonly</code> <code>Reference</code> (<code>string</code>) rempli dans le constructeur à partir d'un numéro : <code>"CMD-" + number</code>. Ajoute un champ <code>static readonly</code> <code>Prefix</code> égal à <code>"CMD-"</code> et utilise-le. Crée deux commandes et affiche leurs références.</p>`,
      hint: `<p><code>Reference = Prefix + number;</code> dans le constructeur.</p>`,
      solution: `var o1 = new Order(1);
var o2 = new Order(2);
Console.WriteLine(o1.Reference); // CMD-1
Console.WriteLine(o2.Reference); // CMD-2

class Order
{
    public static readonly string Prefix = "CMD-";
    public readonly string Reference;

    public Order(int number)
    {
        Reference = Prefix + number;
    }
}`
    },
    {
      level: "difficile",
      title: "Choisir le bon mot-clé",
      prompt: `<p>Pour chaque valeur, choisis <code>const</code>, <code>readonly</code> ou <code>static readonly</code>, puis écris une classe <code>Library</code> qui les contient : (1) le nombre de jours dans une semaine ; (2) la date de création de chaque carte de membre ; (3) la date du jour de lancement du programme ; (4) le nom d'une carte, différent pour chaque carte.</p>`,
      hint: `<p>Connu à la compilation ? Une valeur par objet ? Une valeur unique calculée à l'exécution ?</p>`,
      solution: `var card = new MemberCard("Alice");
Console.WriteLine(Library.DaysPerWeek);   // 7
Console.WriteLine(card.Owner);            // Alice
Console.WriteLine(card.CreatedAt <= DateTime.Now); // True

class Library
{
    public const int DaysPerWeek = 7;                          // (1) const
    public static readonly DateTime StartedAt = DateTime.Now;  // (3) static readonly
}

class MemberCard
{
    public readonly DateTime CreatedAt = DateTime.Now;         // (2) readonly
    public readonly string Owner;                              // (4) readonly

    public MemberCard(string owner)
    {
        Owner = owner;
    }
}`
    }
  ],
  quiz: [
    {
      q: `Laquelle de ces déclarations ne compile pas ?`,
      options: [
        `<code>public const int Max = 3;</code>`,
        `<code>public static readonly DateTime Start = DateTime.Now;</code>`,
        `<code>public const DateTime Start = DateTime.Now;</code>`
      ],
      answer: 2,
      why: `Une <code>const</code> doit être connue à la compilation et d'un type simple. <code>DateTime.Now</code> n'est connu qu'à l'exécution : il faut <code>static readonly</code>.`
    },
    {
      q: `Avec <code>public readonly List&lt;string&gt; Titles = new();</code>, que peut faire le code extérieur ?`,
      options: [
        `Rien du tout, la liste est entièrement protégée`,
        `Ajouter ou retirer des éléments, mais pas remplacer la liste`,
        `Remplacer la liste, mais pas ajouter d'éléments`
      ],
      answer: 1,
      why: `<code>readonly</code> fige la référence, pas le contenu. <code>Add</code> et <code>Clear</code> restent possibles : c'est le piège classique.`
    },
    {
      q: `Où peut-on assigner un champ <code>readonly</code> ?`,
      options: [
        `À sa déclaration ou dans un constructeur`,
        `N'importe où dans la classe`,
        `Uniquement à sa déclaration`
      ],
      answer: 0,
      why: `Ce sont les deux seuls endroits permis. Une méthode ordinaire qui tente de le modifier provoque l'erreur <code>CS0191</code>.`
    },
    {
      q: `Pourquoi préférer <code>static readonly</code> à <code>public const</code> pour une valeur qui pourrait changer un jour ?`,
      options: [
        `Parce que <code>const</code> est plus lent`,
        `Parce que <code>const</code> ne peut pas être public`,
        `Parce que la valeur d'une <code>const</code> est recopiée dans les projets qui l'utilisent, qui ne voient pas un changement sans recompilation`
      ],
      answer: 2,
      why: `Le compilateur colle la valeur d'une <code>const</code> directement dans le code des projets utilisateurs. Un <code>static readonly</code> est lu à l'exécution, donc toujours à jour.`
    }
  ],
  project: `<p><strong>Bibliothèque, étape 6.</strong> Crée une classe <code>LibraryRules</code> avec <code>public const int MaxLoans = 3;</code> et <code>public static readonly TimeSpan LoanDuration = TimeSpan.FromDays(21);</code>. Écris une petite classe <code>Loan</code> avec des champs <code>readonly</code> <code>Book</code> et <code>DueDate</code>, où <code>DueDate</code> est calculée dans le constructeur à partir de <code>LoanDuration</code>. Affiche la date de retour d'un emprunt commencé aujourd'hui.</p>`,
  resources: [
    { label: "Mot-clé readonly (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/readonly" },
    { label: "Mot-clé const (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/const" }
  ]
});

/* ===================== 3.8 Encapsulation ===================== */
window.COURSE.push({
  key: "l-encapsulation",
  title: "3.8 Encapsulation",
  summary: "Tu sauras protéger l'état d'un objet pour qu'il respecte toujours ses règles métier.",
  objectives: [
    "Comprendre ce qu'est un invariant",
    "Remplacer des setters publics par des méthodes métier",
    "Exposer une collection en lecture seule avec IReadOnlyList",
    "Valider dans le constructeur et lever une ArgumentException"
  ],
  analogy: `<p>Face à un <strong>distributeur de boissons</strong>, tu appuies sur des boutons : « insérer une pièce », « choisir un soda ». Tu n'ouvres jamais la machine pour prendre les pièces ou changer les prix toi-même.</p>
<p>Grâce à ça, la machine garantit ses règles : pas de boisson sans paiement, jamais de stock négatif. L'<strong>encapsulation</strong>, c'est ça : des boutons bien choisis à l'extérieur, et un mécanisme protégé à l'intérieur.</p>`,
  lesson: `<h3>Protéger l'état de l'objet</h3>
<p>L'<strong>état</strong> d'un objet, c'est l'ensemble de ses données à un instant donné : le solde d'un compte, la liste des emprunts d'un membre. L'<strong>encapsulation</strong> consiste à cacher cet état et à n'offrir que des opérations contrôlées pour le modifier.</p>
<p>Tu as déjà tous les outils : <code>private</code> (3.4), <code>private set</code> (3.2), les constructeurs (3.3), <code>readonly</code> (3.7). Cette leçon montre comment les assembler.</p>

<h3>Les invariants</h3>
<p>Un <strong>invariant</strong> est une règle qui doit être vraie <strong>tout le temps</strong>, pendant toute la vie de l'objet. Par exemple : « un solde ne devient jamais négatif » ou « un membre n'a jamais plus de 3 emprunts ».</p>
<p>Si n'importe quel code peut écrire <code>account.Balance = -150</code>, l'invariant ne tient que si <strong>tous</strong> les développeurs y pensent partout. Avec l'encapsulation, la règle est écrite <strong>à un seul endroit</strong> : dans la classe. Personne ne peut la contourner.</p>

<h3>Des méthodes métier plutôt que des setters</h3>
<p>Une propriété <code>{ get; set; }</code> publique, c'est une porte ouverte. On la remplace par <code>{ get; private set; }</code> et par des <strong>méthodes métier</strong> qui portent un nom du domaine : <code>Deposit</code>, <code>Withdraw</code>, <code>Borrow</code>. Chaque méthode vérifie la règle avant de modifier l'état.</p>
<div class="compare"><div><h4>Avant</h4><p><code>public decimal Balance { get; set; }</code><br>N'importe qui écrit n'importe quelle valeur. Les règles sont éparpillées (ou oubliées) dans le code appelant.</p></div><div><h4>Après</h4><p><code>public decimal Balance { get; private set; }</code> + <code>Deposit()</code> / <code>Withdraw()</code><br>Une seule porte d'entrée, qui vérifie toujours.</p></div></div>
<p>Bonus : le code appelant devient plus lisible. <code>account.Withdraw(50)</code> dit ce qui se passe ; <code>account.Balance -= 50</code> ne dit rien de l'intention.</p>

<h3>Valider dès la création</h3>
<p>Un objet doit être valide <strong>dès sa naissance</strong>. Le constructeur vérifie donc ses paramètres, et refuse de créer l'objet s'ils sont mauvais. Pour refuser, on <strong>lève une exception</strong> : <code>throw new ArgumentException("message", nameof(param));</code>.</p>
<p>Une exception, c'est un signal d'erreur qui interrompt le code en cours. Si personne ne la « rattrape », le programme s'arrête et affiche le message. On apprendra à les rattraper au chapitre 4 ; pour l'instant, retiens qu'elle empêche un objet invalide d'exister. <code>nameof(param)</code> écrit le nom du paramètre en texte, sans risque de faute de frappe.</p>
<div class="flow"><span>new Account("", -10)</span><span>constructeur vérifie</span><span>ArgumentException</span><span>aucun objet créé</span></div>

<h3>Exposer une collection en lecture seule</h3>
<p>On a vu en 3.7 que <code>readonly</code> sur une liste n'empêche pas d'ajouter des éléments. La solution : garder la vraie liste en <code>private</code>, et exposer seulement une <strong>vue en lecture seule</strong> de type <code>IReadOnlyList&lt;T&gt;</code>.</p>
<pre class="diagram"> Extérieur                 Classe Member
 member.Loans  --(lire)--&gt; IReadOnlyList
                               |
                               v
 Borrow("Dune") --(règle)--&gt; _loans (List, private)</pre>
<p><code>IReadOnlyList&lt;T&gt;</code> est une <strong>interface</strong> (un contrat, vu en 3.13) qui n'offre que la lecture : <code>Count</code>, l'accès par index <code>[0]</code>, le parcours avec <code>foreach</code>. Pas de <code>Add</code>, pas de <code>Clear</code>. Pour ajouter, on doit passer par <code>Borrow</code>, qui vérifie la règle.</p>
<div class="tip">C'est l'équivalent du <code>ReadonlyArray&lt;T&gt;</code> de TypeScript. Côté Angular, c'est la même idée qu'un service qui garde un <code>signal</code> privé et n'expose que sa version <code>asReadonly()</code>.</div>

<h3>La démarche de refactoring</h3>
<p>Pour encapsuler une classe existante : 1) repère les règles métier ; 2) passe les setters en <code>private</code> ; 3) crée une méthode métier par action ; 4) valide dans le constructeur ; 5) remplace les listes publiques par <code>IReadOnlyList&lt;T&gt;</code>. Le compilateur te montrera tous les endroits à corriger.</p>
<div class="note">Un appelant malin pourrait faire <code>(List&lt;string&gt;)member.Loans</code> pour retrouver la vraie liste. Pour une protection totale, expose <code>_loans.AsReadOnly()</code>, une enveloppe qui refuse toute modification. Dans la plupart des projets, <code>IReadOnlyList&lt;T&gt;</code> suffit : l'encapsulation protège contre les erreurs, pas contre la malveillance.</div>`,
  examples: [
    {
      title: "Avant : un état sans protection",
      code: `var account = new BadAccount();
account.Balance = 100;
account.Balance -= 250;   // personne ne nous arrête
Console.WriteLine(account.Balance);

class BadAccount
{
    public decimal Balance { get; set; }
}`,
      output: `-150`,
      steps: [
        "<code>public decimal Balance { get; set; }</code> : lecture et écriture libres, depuis n'importe où.",
        "<code>account.Balance = 100;</code> : on met le solde à 100.",
        "<code>account.Balance -= 250;</code> : rien ne vérifie, le solde passe à -150.",
        "<code>Console.WriteLine(account.Balance);</code> : l'invariant « jamais négatif » est cassé."
      ],
      explain: "La règle métier n'existe nulle part dans le code."
    },
    {
      title: "Après : setter privé et méthodes métier",
      code: `var account = new Account("Alice", 100m);
account.Deposit(50m);
Console.WriteLine(account.Withdraw(500m));
Console.WriteLine(account.Withdraw(120m));
Console.WriteLine($"{account.Owner} : {account.Balance}");

class Account
{
    public string Owner { get; }
    public decimal Balance { get; private set; }
    public Account(string owner, decimal initialBalance)
    {
        if (initialBalance < 0)
            throw new ArgumentException("Le solde initial ne peut pas être négatif.", nameof(initialBalance));
        Owner = owner;
        Balance = initialBalance;
    }

    public void Deposit(decimal amount)
    {
        if (amount > 0) Balance += amount;
    }

    public bool Withdraw(decimal amount)
    {
        if (amount <= 0 || amount > Balance) return false;
        Balance -= amount;
        return true;
    }
}`,
      output: `False
True
Alice : 30`,
      steps: [
        "<code>public decimal Balance { get; private set; }</code> : lisible par tous, modifiable seulement par la classe.",
        "<code>throw new ArgumentException(...)</code> : le constructeur refuse un solde initial négatif, aucun objet invalide n'est créé.",
        "<code>account.Deposit(50m);</code> : le solde passe de 100 à 150.",
        "<code>account.Withdraw(500m)</code> : 500 dépasse le solde, la méthode refuse et renvoie <code>False</code>.",
        "<code>account.Withdraw(120m)</code> : autorisé, il reste 30 ; le solde ne peut jamais devenir négatif."
      ],
      explain: "La règle est écrite une seule fois, dans la classe, et personne ne peut la contourner."
    },
    {
      title: "Une collection en lecture seule",
      code: `var member = new Member("Alice");
member.Borrow("Dune");
member.Borrow("Fondation");
Console.WriteLine(string.Join(", ", member.Loans));
Console.WriteLine(member.Loans.Count);
// member.Loans.Add("Hypérion"); // erreur : IReadOnlyList n'a pas de Add

class Member
{
    private readonly List<string> _loans = new();

    public string Name { get; }
    public IReadOnlyList<string> Loans => _loans;

    public Member(string name)
    {
        Name = name;
    }

    public void Borrow(string title) => _loans.Add(title);
}`,
      output: `Dune, Fondation
2`,
      steps: [
        "<code>private readonly List&lt;string&gt; _loans</code> : la vraie liste, cachée et jamais remplacée.",
        "<code>public IReadOnlyList&lt;string&gt; Loans =&gt; _loans;</code> : une vue en lecture seule sur la même liste.",
        "<code>member.Borrow(\"Dune\");</code> : la seule façon d'ajouter passe par une méthode de la classe.",
        "<code>string.Join(\", \", member.Loans)</code> : on peut lire et parcourir la liste librement.",
        "<code>// member.Loans.Add(...)</code> : refusé à la compilation, la vue n'offre aucune méthode d'écriture."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un compteur qui ne descend pas sous zéro",
      prompt: `<p>Crée une classe <code>StockItem</code> avec une propriété <code>Quantity</code> (<code>{ get; private set; }</code>) et deux méthodes : <code>Add(int n)</code> et <code>Remove(int n)</code>. <code>Remove</code> renvoie <code>false</code> et ne fait rien si le stock est insuffisant.</p>`,
      hint: `<p>Dans <code>Remove</code> : <code>if (n &gt; Quantity) return false;</code>.</p>`,
      solution: `var item = new StockItem();
item.Add(5);
Console.WriteLine(item.Remove(8)); // False
Console.WriteLine(item.Remove(3)); // True
Console.WriteLine(item.Quantity);  // 2

class StockItem
{
    public int Quantity { get; private set; }

    public void Add(int n)
    {
        if (n > 0) Quantity += n;
    }

    public bool Remove(int n)
    {
        if (n <= 0 || n > Quantity) return false;
        Quantity -= n;
        return true;
    }
}`
    },
    {
      level: "moyen",
      title: "Un produit valide dès sa création",
      prompt: `<p>Crée une classe <code>Product</code> avec <code>Name</code> et <code>Price</code> en lecture seule. Le constructeur lève une <code>ArgumentException</code> si le nom est vide ou si le prix est négatif. Ajoute une méthode <code>ApplyDiscount(decimal percent)</code> qui refuse (exception) un pourcentage hors de 0 à 50 ; <code>Price</code> doit donc avoir un <code>private set</code>.</p>`,
      hint: `<p><code>string.IsNullOrWhiteSpace(name)</code> détecte un nom vide ou composé d'espaces.</p>`,
      solution: `var book = new Product("Dune", 20m);
book.ApplyDiscount(10m);
Console.WriteLine(book.Price); // 18
// new Product("", 5m);        // ArgumentException
// book.ApplyDiscount(80m);    // ArgumentException

class Product
{
    public string Name { get; }
    public decimal Price { get; private set; }

    public Product(string name, decimal price)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Le nom est obligatoire.", nameof(name));
        if (price < 0)
            throw new ArgumentException("Le prix ne peut pas être négatif.", nameof(price));
        Name = name;
        Price = price;
    }

    public void ApplyDiscount(decimal percent)
    {
        if (percent < 0 || percent > 50)
            throw new ArgumentException("Remise entre 0 et 50 %.", nameof(percent));
        Price -= Price * percent / 100;
    }
}`
    },
    {
      level: "difficile",
      title: "Refactorer une playlist",
      prompt: `<p>Voici une classe mal encapsulée : <code>class Playlist { public List&lt;string&gt; Songs = new(); }</code>. Règles métier : pas de doublon, 5 morceaux maximum. Réécris-la avec une liste privée, une propriété <code>IReadOnlyList&lt;string&gt; Songs</code> et une méthode <code>bool Add(string song)</code> qui protège ces deux règles.</p>`,
      hint: `<p><code>_songs.Contains(song)</code> détecte un doublon ; <code>_songs.Count &gt;= 5</code> détecte une playlist pleine.</p>`,
      solution: `var playlist = new Playlist();
Console.WriteLine(playlist.Add("Song A")); // True
Console.WriteLine(playlist.Add("Song A")); // False (doublon)
for (int i = 1; i <= 6; i++) playlist.Add($"Track {i}");
Console.WriteLine(playlist.Songs.Count);   // 5

class Playlist
{
    private const int MaxSongs = 5;
    private readonly List<string> _songs = new();

    public IReadOnlyList<string> Songs => _songs;

    public bool Add(string song)
    {
        if (_songs.Count >= MaxSongs || _songs.Contains(song)) return false;
        _songs.Add(song);
        return true;
    }
}`
    }
  ],
  quiz: [
    {
      q: `Qu'est-ce qu'un invariant ?`,
      options: [
        `Une variable qui ne change jamais de valeur`,
        `Une règle qui doit rester vraie pendant toute la vie de l'objet`,
        `Un champ <code>const</code>`
      ],
      answer: 1,
      why: `Un invariant n'est pas une valeur figée : le solde change, mais la règle « jamais négatif » reste toujours vraie. L'encapsulation sert à la garantir.`
    },
    {
      q: `Pourquoi exposer <code>IReadOnlyList&lt;string&gt;</code> plutôt que la <code>List&lt;string&gt;</code> elle-même ?`,
      options: [
        `Pour que l'extérieur puisse lire la liste sans pouvoir la modifier sans passer par les règles de la classe`,
        `Parce que <code>IReadOnlyList</code> est plus rapide`,
        `Parce qu'une <code>List</code> ne peut pas être publique`
      ],
      answer: 0,
      why: `La vue en lecture seule n'a ni <code>Add</code> ni <code>Clear</code>. Toute modification passe donc par une méthode métier qui vérifie les règles.`
    },
    {
      q: `Que fait <code>throw new ArgumentException("...", nameof(amount))</code> dans un constructeur ?`,
      options: [
        `Il affiche un avertissement et crée quand même l'objet`,
        `Il met la valeur de <code>amount</code> à zéro`,
        `Il interrompt la création : aucun objet invalide n'est créé`
      ],
      answer: 2,
      why: `Lever une exception arrête le constructeur. L'objet n'existe jamais dans un état invalide. <code>nameof(amount)</code> ajoute juste le nom du paramètre au message.`
    }
  ],
  project: `<p><strong>Bibliothèque, étape 7.</strong> Crée une classe <code>Member</code> avec <code>Name</code> (validé dans le constructeur : <code>ArgumentException</code> si vide), une liste privée <code>_loans</code> de <code>Book</code> exposée en <code>IReadOnlyList&lt;Book&gt; Loans</code>, et une méthode <code>bool Borrow(Book book)</code> qui refuse l'emprunt si le membre a déjà <code>LibraryRules.MaxLoans</code> livres ou s'il a déjà ce livre. Ajoute <code>bool Return(Book book)</code>. Teste en essayant d'emprunter 4 livres.</p>`,
  resources: [
    { label: "Programmation orientée objet en C# (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/object-oriented/" }
  ]
});
