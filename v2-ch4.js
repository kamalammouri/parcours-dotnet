window.COURSE = window.COURSE || [];

// =====================================================================
// 4.1 Types valeur et types référence
// =====================================================================
window.COURSE.push({
  key: "l-value-reference",
  title: "Types valeur et types référence",
  summary: "Tu sauras prédire ce qui se passe quand tu copies une variable ou que tu la passes à une méthode.",
  objectives: [
    "Distinguer un type valeur d'un type référence",
    "Comprendre la pile et le tas avec un schéma simple",
    "Prévoir l'effet d'une copie et d'un passage en paramètre",
    "Expliquer pourquoi string se comporte comme une valeur"
  ],
  analogy: `<p>Imagine que tu donnes à un ami une <strong>photocopie</strong> d'une recette. S'il griffonne dessus, ta feuille à toi ne bouge pas : c'est un <strong>type valeur</strong>.</p>
<p>Maintenant, tu lui donnes l'<strong>adresse de ta maison</strong>. S'il va repeindre la porte, c'est bien <em>ta</em> porte qui change : vous avez tous les deux l'adresse de la même maison. C'est un <strong>type référence</strong>.</p>`,
  lesson: `<h3>Deux familles de types</h3>
<p>En C#, chaque type appartient à une de deux familles. Un <strong>type valeur</strong> contient directement sa donnée : la variable <em>est</em> la valeur. Un <strong>type référence</strong> contient une <em>adresse</em> (on dit une <strong>référence</strong>) qui pointe vers l'objet rangé ailleurs en mémoire.</p>
<p>Bonne nouvelle : tu connais déjà ce principe en JavaScript. Un <code>number</code> ou un <code>boolean</code> se copie, alors qu'un objet <code>{}</code> ou un tableau se partage. C# fonctionne pareil, avec des règles plus explicites.</p>

<h3>La pile et le tas, en simple</h3>
<p>Le programme range ses données dans deux zones de mémoire. La <strong>pile</strong> (en anglais <em>stack</em>) est un petit espace très rapide, rangé comme une pile d'assiettes : chaque méthode y pose ses variables locales et les retire en se terminant. Le <strong>tas</strong> (en anglais <em>heap</em>) est un grand entrepôt où vivent les objets créés avec <code>new</code>.</p>
<pre class="diagram">
  PILE (variables locales)     TAS (objets)
 +--------------------+      +-------------------+
 | a      = 5         |      |                   |
 | b      = 5         |      |  Counter          |
 | first  = @1000 ----+-----&gt;|  { Value = 10 }   |
 | second = @1000 ----+-----&gt;|  (adresse @1000)  |
 +--------------------+      +-------------------+
</pre>
<p>Sur ce schéma, <code>a</code> et <code>b</code> ont chacun leur propre 5. En revanche, <code>first</code> et <code>second</code> contiennent la même adresse : ils désignent un seul et même objet. C'est une simplification (un int dans un objet vit aussi sur le tas), mais elle suffit pour raisonner juste.</p>

<h3>Copier un int ou copier une référence</h3>
<p>Quand tu écris <code>int b = a;</code>, C# copie la valeur. Modifier <code>b</code> ensuite ne touche pas <code>a</code>. Quand tu écris <code>var second = first;</code> avec un objet, C# copie seulement l'adresse. Modifier <code>second.Value</code> modifie donc l'objet que <code>first</code> voit aussi.</p>
<div class="compare"><div><h4>Type valeur</h4><p>La copie duplique la donnée. Deux variables, deux valeurs indépendantes.</p></div><div><h4>Type référence</h4><p>La copie duplique l'adresse. Deux variables, un seul objet partagé.</p></div></div>

<h3>Passer une variable à une méthode</h3>
<p>Par défaut, C# passe toujours une <strong>copie</strong> de la variable à la méthode. Pour un int, la méthode reçoit une copie du nombre : elle ne peut pas changer l'original. Pour un objet, elle reçoit une copie de l'adresse : elle peut donc <strong>modifier l'objet</strong> (changer une propriété), mais si elle <strong>réassigne</strong> son paramètre avec <code>new</code>, elle ne fait que changer sa copie locale de l'adresse. L'appelant ne voit rien. (Pour changer la variable de l'appelant, tu as vu <code>ref</code> au chapitre 2.)</p>

<h3>Qui est valeur, qui est référence ?</h3>
<table>
<tr><th>Famille</th><th>Types</th><th>À la copie</th></tr>
<tr><td>Valeur</td><td><code>int</code>, <code>double</code>, <code>decimal</code>, <code>bool</code>, <code>char</code>, <code>DateTime</code>, les <code>struct</code>, les <code>enum</code></td><td>La donnée est dupliquée</td></tr>
<tr><td>Référence</td><td>les <code>class</code>, <code>string</code>, les tableaux (<code>int[]</code>), les <code>record</code>, les interfaces</td><td>Seule l'adresse est dupliquée</td></tr>
</table>
<div class="tip">Un tableau est toujours un type référence, même s'il contient des int. <code>int[] copy = numbers;</code> ne copie pas les nombres : les deux variables pointent vers le même tableau.</div>

<h3>Le cas particulier de string</h3>
<p><code>string</code> est un type référence, mais il se comporte comme une valeur car il est <strong>immuable</strong> : une fois créée, une chaîne ne change jamais. Quand tu écris <code>s2 += "on";</code>, C# fabrique une <em>nouvelle</em> chaîne et met sa nouvelle adresse dans <code>s2</code>. <code>s1</code> garde l'ancienne. Et <code>==</code> sur deux string compare le texte, pas les adresses. C'est exactement ce que tu connais en JS.</p>
<div class="note">En entretien, on te demandera souvent « où vit un int ? ». La réponse précise : un type valeur vit là où il est déclaré. Variable locale : sur la pile. Champ d'un objet : dans l'objet, donc sur le tas. Ce qui compte vraiment, c'est la sémantique de copie.</div>`,
  examples: [
    {
      title: "Copier un int, copier un objet",
      code: `// Copie d'un type valeur
int a = 5;
int b = a;   // b reçoit une copie de 5
b = 10;
Console.WriteLine($"a = {a}, b = {b}");

// Copie d'un type référence
var first = new Counter { Value = 5 };
var second = first;   // second reçoit la même adresse
second.Value = 10;
Console.WriteLine($"first = {first.Value}, second = {second.Value}");
Console.WriteLine(ReferenceEquals(first, second));

class Counter
{
    public int Value { get; set; }
}`,
      output: `a = 5, b = 10
first = 10, second = 10
True`,
      steps: [
        "<code>int b = a;</code> : la valeur 5 est copiée dans <code>b</code>. Les deux variables sont indépendantes.",
        "<code>b = 10;</code> : seul <code>b</code> change, <code>a</code> vaut toujours 5.",
        "<code>var second = first;</code> : on copie l'adresse de l'objet, pas l'objet lui-même.",
        "<code>second.Value = 10;</code> : on modifie l'unique objet, donc <code>first.Value</code> vaut aussi 10.",
        "<code>ReferenceEquals(first, second)</code> : renvoie <code>True</code> car les deux variables pointent vers le même objet."
      ],
      explain: "Même code, deux comportements : tout dépend de la famille du type."
    },
    {
      title: "Modifier l'objet ou réassigner le paramètre",
      code: `var box = new Box { Value = 1 };
Change(box);
Console.WriteLine($"Après Change : {box.Value}");
Replace(box);
Console.WriteLine($"Après Replace : {box.Value}");

int n = 1;
Increment(n);
Console.WriteLine($"Après Increment : {n}");

// La méthode modifie l'objet pointé
void Change(Box b) { b.Value = 2; }

// La méthode change seulement sa copie de l'adresse
void Replace(Box b) { b = new Box { Value = 99 }; }

// La méthode reçoit une copie du nombre
void Increment(int x) { x++; }

class Box
{
    public int Value { get; set; }
}`,
      output: `Après Change : 2
Après Replace : 2
Après Increment : 1`,
      steps: [
        "<code>Change(box);</code> : la méthode reçoit une copie de l'adresse et modifie l'objet. L'appelant voit 2.",
        "<code>b = new Box { Value = 99 };</code> : dans <code>Replace</code>, on fait pointer la copie locale vers un nouvel objet. <code>box</code> ne bouge pas.",
        "<code>Increment(n);</code> : <code>x</code> est une copie de <code>n</code>. <code>x++</code> ne touche pas <code>n</code>.",
        "<code>void Change(Box b)</code> : ces fonctions locales sont déclarées après le code qui les appelle, c'est permis dans Program.cs."
      ]
    },
    {
      title: "string : référence mais immuable",
      code: `string s1 = "chat";
string s2 = s1;    // même adresse pour l'instant
s2 += "on";        // crée une NOUVELLE chaîne
Console.WriteLine(s1);
Console.WriteLine(s2);

string s3 = "CHAT".ToLowerInvariant(); // autre objet, même texte
Console.WriteLine(s1 == s3);              // compare le texte
Console.WriteLine(ReferenceEquals(s1, s3)); // compare les adresses`,
      output: `chat
chaton
True
False`,
      steps: [
        "<code>string s2 = s1;</code> : les deux variables pointent vers la même chaîne \"chat\".",
        "<code>s2 += \"on\";</code> : une chaîne ne peut pas changer, donc C# en crée une nouvelle \"chaton\" et la range dans <code>s2</code>.",
        "<code>Console.WriteLine(s1);</code> : <code>s1</code> pointe toujours vers \"chat\".",
        "<code>s1 == s3</code> : pour <code>string</code>, <code>==</code> compare le contenu, d'où <code>True</code>.",
        "<code>ReferenceEquals(s1, s3)</code> : ce sont deux objets distincts en mémoire, d'où <code>False</code>."
      ],
      explain: "Grâce à l'immuabilité, tu peux manipuler les string comme des valeurs sans te soucier des adresses."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Prédire l'affichage",
      prompt: `<p>Sans exécuter, devine ce qu'affiche ce code, puis vérifie : <code>double x = 3.5; double y = x; y = 0; Console.WriteLine(x);</code>. Écris ensuite la même chose avec un tableau <code>int[] t1 = [1, 2]; int[] t2 = t1; t2[0] = 9;</code> et affiche <code>t1[0]</code>.</p>`,
      hint: `<p><code>double</code> est un type valeur, un tableau est un type référence.</p>`,
      solution: `double x = 3.5;
double y = x;
y = 0;
Console.WriteLine(x == 3.5); // True : x n'a pas bougé

int[] t1 = [1, 2];
int[] t2 = t1;   // même tableau
t2[0] = 9;
Console.WriteLine(t1[0]); // 9`
    },
    {
      level: "moyen",
      title: "Une méthode qui modifie un joueur",
      prompt: `<p>Crée une classe <code>Player</code> avec une propriété <code>Score</code>. Écris une méthode <code>AddBonus(Player p)</code> qui ajoute 10 au score, et une méthode <code>AddBonusToInt(int score)</code> qui fait <code>score += 10</code>. Appelle les deux et affiche les résultats pour montrer la différence.</p>`,
      hint: `<p>Mets le code d'appel en haut, les fonctions locales ensuite, et la classe tout en bas.</p>`,
      solution: `var player = new Player { Score = 5 };
AddBonus(player);
Console.WriteLine(player.Score); // 15

int score = 5;
AddBonusToInt(score);
Console.WriteLine(score); // 5

void AddBonus(Player p) { p.Score += 10; }
void AddBonusToInt(int s) { s += 10; }

class Player
{
    public int Score { get; set; }
}`
    },
    {
      level: "difficile",
      title: "Copier vraiment un objet",
      prompt: `<p>Avec la classe <code>Player</code> (propriétés <code>Name</code> et <code>Score</code>), écris une méthode <code>Clone()</code> dans la classe qui renvoie un <strong>nouvel</strong> objet avec les mêmes valeurs. Prouve avec <code>ReferenceEquals</code> que le clone est un objet différent, et que modifier le clone ne change pas l'original.</p>`,
      hint: `<p><code>Clone()</code> fait simplement <code>return new Player { Name = Name, Score = Score };</code>.</p>`,
      solution: `var original = new Player { Name = "Alice", Score = 10 };
var copy = original.Clone();
copy.Score = 99;

Console.WriteLine(ReferenceEquals(original, copy)); // False
Console.WriteLine(original.Score); // 10
Console.WriteLine(copy.Score);     // 99

class Player
{
    public string Name { get; set; } = "";
    public int Score { get; set; }

    public Player Clone() => new Player { Name = Name, Score = Score };
}`
    }
  ],
  quiz: [
    {
      q: `Après <code>var b = a;</code> où <code>a</code> est un objet d'une <code>class</code>, que contient <code>b</code> ?`,
      options: ["Une copie complète de l'objet", "La même adresse que <code>a</code>", "<code>null</code>"],
      answer: 1,
      why: `Une variable de type référence contient une adresse : la copier duplique l'adresse, pas l'objet. Il n'y a donc qu'un seul objet partagé.`
    },
    {
      q: `Lequel de ces types est un type <strong>référence</strong> ?`,
      options: ["<code>bool</code>", "<code>DateTime</code>", "<code>int[]</code>", "<code>double</code>"],
      answer: 2,
      why: `Tous les tableaux sont des types référence, même un tableau d'int. <code>bool</code>, <code>double</code> et <code>DateTime</code> sont des types valeur.`
    },
    {
      q: `Une méthode reçoit un objet <code>b</code> et fait <code>b = new Box();</code>. Que voit l'appelant ?`,
      options: ["Rien ne change pour lui", "Sa variable pointe vers le nouvel objet", "Une erreur de compilation"],
      answer: 0,
      why: `La méthode a reçu une copie de l'adresse. Réassigner cette copie ne touche pas la variable de l'appelant. Seule la modification de l'objet (<code>b.Value = …</code>) serait visible.`
    },
    {
      q: `Pourquoi <code>string</code> se comporte-t-il comme une valeur ?`,
      options: ["Parce que c'est un type valeur", "Parce qu'il est rangé sur la pile", "Parce qu'il est immuable"],
      answer: 2,
      why: `<code>string</code> est bien un type référence, mais aucune opération ne modifie une chaîne existante : chaque « modification » crée une nouvelle chaîne. Le piège : croire que c'est un type valeur.`
    }
  ],
  resources: [
    { label: "Types valeur (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/value-types" },
    { label: "Types référence (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/keywords/reference-types" }
  ]
});

// =====================================================================
// 4.2 struct
// =====================================================================
window.COURSE.push({
  key: "l-struct",
  title: "struct",
  summary: "Tu sauras déclarer une struct, savoir quand l'utiliser et éviter le piège de la copie modifiée.",
  objectives: [
    "Déclarer une struct avec un constructeur",
    "Voir que l'affectation copie toute la struct",
    "Utiliser readonly struct pour une petite valeur immuable",
    "Reconnaître le piège de la copie et le boxing"
  ],
  analogy: `<p>Une <code>struct</code>, c'est comme un <strong>billet de 10 €</strong>. Tu ne te soucies pas de savoir <em>quel</em> billet tu as : seul son montant compte. Si tu donnes une copie parfaite du billet à quelqu'un, il en a un à lui, et ce qu'il en fait ne touche pas le tien.</p>`,
  lesson: `<h3>Une struct, c'est un petit type valeur</h3>
<p>Une <code>struct</code> se déclare presque comme une classe : des champs, des propriétés, des méthodes, un constructeur. La grande différence : c'est un <strong>type valeur</strong>. Chaque variable contient sa propre copie complète des données, comme un <code>int</code>.</p>
<p>D'ailleurs, <code>int</code>, <code>double</code> ou <code>DateTime</code> sont eux-mêmes des struct définies par .NET. En créant ta struct, tu fabriques ton propre « petit type de base », par exemple <code>Point</code> ou <code>Money</code>.</p>

<h3>L'affectation copie tout</h3>
<p>Avec <code>var p2 = p1;</code>, C# copie <strong>tous les champs</strong> de <code>p1</code> dans <code>p2</code>. Les deux variables sont ensuite totalement indépendantes. Avec une classe, tu aurais eu deux variables pour un seul objet.</p>
<pre class="diagram">
  class Point                 struct Point
  p1 ---&gt; [ X=1, Y=2 ]        p1 = [ X=1,   Y=2 ]
  p2 ----^  (un objet)        p2 = [ X=100, Y=2 ]
                              (deux copies)
</pre>

<h3>Ce qu'une struct ne fait pas</h3>
<p>Une struct <strong>ne peut pas hériter</strong> d'une autre struct ou d'une classe, et personne ne peut hériter d'elle. Elle peut en revanche implémenter des interfaces. Elle n'est jamais <code>null</code> (sauf si tu écris <code>Point?</code>, on le verra en 4.6) : une struct non initialisée vaut sa <strong>valeur par défaut</strong>, tous les champs à zéro.</p>

<h3>readonly struct : la bonne habitude</h3>
<p>En ajoutant <code>readonly</code> devant <code>struct</code>, tu interdis toute modification après la construction. Le compilateur vérifie que tous les champs sont en lecture seule. Pour changer une valeur, on renvoie une <em>nouvelle</em> struct, comme <code>a.Add(b)</code> qui renvoie un nouveau <code>Money</code>. C'est simple et ça évite tous les pièges de copie.</p>
<div class="compare"><div><h4>Utilise une struct si…</h4><p>la donnée est petite (quelques champs), représente une valeur pure (coordonnées, montant, couleur) et ne change pas.</p></div><div><h4>Préfère une classe si…</h4><p>l'objet a une identité, est gros, doit être partagé ou modifié, ou a besoin d'héritage.</p></div></div>

<h3>Le piège : modifier une copie</h3>
<p>Quand tu lis une struct depuis une <code>List</code> ou une propriété, tu obtiens une <strong>copie</strong>. Écrire <code>points[0].X = 5;</code> ne compile même pas : le compilateur sait que tu modifierais une copie jetable. Et si tu passes par une variable (<code>var p = points[0]; p.X = 5;</code>), seule la copie change, la liste garde l'ancienne valeur. Il faut remettre la copie : <code>points[0] = p;</code>.</p>
<div class="tip">Si une struct est <code>readonly</code>, ce piège disparaît : on ne peut tout simplement pas la modifier, on la remplace.</div>

<h3>Le boxing en une phrase</h3>
<p>Le <strong>boxing</strong>, c'est quand une struct est rangée dans une variable de type <code>object</code> (ou une interface) : .NET la copie dans une « boîte » sur le tas, et cette boîte vit ensuite sa vie séparément.</p>
<pre class="diagram">
  PILE                     TAS
  p     = [ X=0 ]          +-------------+
  boxed = @2000 ---------&gt; | boîte       |
                           | [ X=50 ]    |
                           +-------------+
  object boxed = p;  =&gt; copie dans une boîte
</pre>
<div class="note">Le boxing coûte une allocation sur le tas. Dans une boucle chaude, il peut ralentir ton code : c'est une des raisons pour lesquelles les génériques (chapitre 5) existent.</div>`,
  examples: [
    {
      title: "Une struct Point se copie",
      code: `var p1 = new Point(1, 2);
var p2 = p1;      // copie complète des champs
p2.X = 100;
Console.WriteLine($"p1 = ({p1.X}, {p1.Y})");
Console.WriteLine($"p2 = ({p2.X}, {p2.Y})");

struct Point
{
    public int X;
    public int Y;

    public Point(int x, int y)
    {
        X = x;
        Y = y;
    }
}`,
      output: `p1 = (1, 2)
p2 = (100, 2)`,
      steps: [
        "<code>struct Point</code> : on déclare un type valeur avec deux champs publics.",
        "<code>public Point(int x, int y)</code> : le constructeur remplit les champs, comme pour une classe.",
        "<code>var p2 = p1;</code> : X et Y sont copiés dans une nouvelle zone. <code>p2</code> est indépendant.",
        "<code>p2.X = 100;</code> : seule la copie change, <code>p1</code> garde (1, 2)."
      ],
      explain: "Remplace struct par class : p1 afficherait aussi 100."
    },
    {
      title: "Une readonly struct Money",
      code: `var price = new Money(1500, "EUR");
var total = price.Add(new Money(250, "EUR"));
Console.WriteLine(price);
Console.WriteLine(total);

// Montant en centimes : pas d'erreur d'arrondi
readonly struct Money
{
    public int Cents { get; }
    public string Currency { get; }

    public Money(int cents, string currency)
    {
        Cents = cents;
        Currency = currency;
    }

    // On ne modifie pas : on renvoie une nouvelle valeur
    public Money Add(Money other) => new Money(Cents + other.Cents, Currency);

    public override string ToString() => $"{Cents / 100}.{Cents % 100:D2} {Currency}";
}`,
      output: `15.00 EUR
17.50 EUR`,
      steps: [
        "<code>readonly struct Money</code> : toutes les propriétés doivent être en lecture seule, sinon erreur de compilation.",
        "<code>public int Cents { get; }</code> : une propriété sans <code>set</code>, remplie seulement par le constructeur.",
        "<code>Add(Money other)</code> : au lieu de modifier <code>price</code>, on crée un nouveau <code>Money</code>.",
        "<code>{Cents % 100:D2}</code> : le format <code>D2</code> force deux chiffres, donc 0 devient \"00\".",
        "<code>Console.WriteLine(price);</code> : appelle notre <code>ToString()</code>. <code>price</code> vaut toujours 15.00."
      ]
    },
    {
      title: "Le piège de la List et le boxing",
      code: `var points = new List<Point> { new Point(1, 1) };

var p = points[0];  // p est une COPIE
p.X = 50;
Console.WriteLine(points[0].X); // la liste n'a pas changé

points[0] = p;      // on remet la copie dans la liste
Console.WriteLine(points[0].X);

object boxed = p;   // boxing : copie dans une boîte sur le tas
p.X = 0;
Console.WriteLine(((Point)boxed).X); // la boîte garde 50

struct Point
{
    public int X;
    public int Y;
    public Point(int x, int y) { X = x; Y = y; }
}`,
      output: `1
50
50`,
      steps: [
        "<code>var p = points[0];</code> : lire une struct dans une liste renvoie une copie.",
        "<code>p.X = 50;</code> : on modifie la copie, la liste contient toujours X = 1.",
        "<code>points[0] = p;</code> : on remplace l'élément par la copie modifiée. Maintenant la liste a 50.",
        "<code>object boxed = p;</code> : le boxing copie <code>p</code> dans une boîte. Modifier <code>p</code> ensuite ne touche pas la boîte.",
        "<code>((Point)boxed).X</code> : on « déballe » (unboxing) pour relire la valeur : 50."
      ],
      explain: "Écrire directement points[0].X = 50; ne compile pas (erreur CS1612) : le compilateur te protège."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une struct Temperature",
      prompt: `<p>Déclare une <code>readonly struct Temperature</code> avec une propriété <code>Celsius</code> (int) et une propriété calculée <code>Fahrenheit</code> qui renvoie <code>Celsius * 9 / 5 + 32</code>. Crée une température de 20 °C et affiche les deux valeurs.</p>`,
      hint: `<p>Une propriété calculée s'écrit <code>public int Fahrenheit =&gt; Celsius * 9 / 5 + 32;</code>.</p>`,
      solution: `var t = new Temperature(20);
Console.WriteLine($"{t.Celsius} °C = {t.Fahrenheit} °F"); // 20 °C = 68 °F

readonly struct Temperature
{
    public int Celsius { get; }
    public int Fahrenheit => Celsius * 9 / 5 + 32;

    public Temperature(int celsius) { Celsius = celsius; }
}`
    },
    {
      level: "moyen",
      title: "Déplacer un point sans le modifier",
      prompt: `<p>Écris une <code>readonly struct Point</code> (X, Y) avec une méthode <code>Move(int dx, int dy)</code> qui renvoie un <strong>nouveau</strong> point. Crée un point (0, 0), déplace-le deux fois, et affiche l'original et le résultat.</p>`,
      hint: `<p><code>public Point Move(int dx, int dy) =&gt; new Point(X + dx, Y + dy);</code></p>`,
      solution: `var start = new Point(0, 0);
var end = start.Move(3, 4).Move(1, 1);
Console.WriteLine($"start = ({start.X}, {start.Y})"); // (0, 0)
Console.WriteLine($"end = ({end.X}, {end.Y})");       // (4, 5)

readonly struct Point
{
    public int X { get; }
    public int Y { get; }
    public Point(int x, int y) { X = x; Y = y; }
    public Point Move(int dx, int dy) => new Point(X + dx, Y + dy);
}`
    },
    {
      level: "difficile",
      title: "Corriger le piège de la liste",
      prompt: `<p>Tu as une <code>List&lt;Counter&gt;</code> où <code>Counter</code> est une struct mutable avec un champ <code>Value</code>. Écris une boucle <code>for</code> qui ajoute 1 à chaque compteur de la liste <strong>pour de vrai</strong>, puis affiche les valeurs.</p>`,
      hint: `<p>Lis l'élément dans une variable, modifie-la, puis réécris-la à l'index <code>i</code>.</p>`,
      solution: `var counters = new List<Counter> { new Counter { Value = 1 }, new Counter { Value = 5 } };

for (int i = 0; i < counters.Count; i++)
{
    var c = counters[i]; // copie
    c.Value++;
    counters[i] = c;     // on remet la copie
}

foreach (var c in counters)
    Console.WriteLine(c.Value); // 2 puis 6

struct Counter
{
    public int Value;
}`
    }
  ],
  quiz: [
    {
      q: `Que fait <code>var p2 = p1;</code> si <code>Point</code> est une <code>struct</code> ?`,
      options: ["Copie tous les champs dans p2", "p2 pointe vers le même point que p1", "Erreur : il faut appeler new"],
      answer: 0,
      why: `Une struct est un type valeur : l'affectation duplique les données. Le partage d'objet, c'est le comportement des classes.`
    },
    {
      q: `Une struct peut-elle hériter d'une autre struct ?`,
      options: ["Oui, avec <code>: BaseStruct</code>", "Oui, si elle est <code>readonly</code>", "Non, mais elle peut implémenter des interfaces"],
      answer: 2,
      why: `Les struct n'ont pas d'héritage. Elles peuvent seulement implémenter des interfaces. <code>readonly</code> n'y change rien.`
    },
    {
      q: `Quel est le meilleur candidat pour une <code>readonly struct</code> ?`,
      options: ["Un client avec historique de commandes", "Une coordonnée GPS (latitude, longitude)", "Une connexion à une base de données"],
      answer: 1,
      why: `Une coordonnée est petite, immuable et n'a pas d'identité : c'est une valeur pure. Un client a une identité et grossit, une connexion est une ressource : ce sont des classes.`
    },
    {
      q: `Qu'est-ce que le boxing ?`,
      options: ["Convertir une classe en struct", "Copier une struct dans une boîte sur le tas quand on la range dans un <code>object</code>", "Protéger une struct avec <code>readonly</code>"],
      answer: 1,
      why: `Le boxing se produit quand un type valeur est traité comme un <code>object</code> ou une interface : .NET alloue une boîte sur le tas et y copie la valeur.`
    }
  ],
  resources: [
    { label: "Types structure (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/struct" }
  ]
});

// =====================================================================
// 4.3 record
// =====================================================================
window.COURSE.push({
  key: "l-record",
  title: "record",
  summary: "Tu sauras créer des records pour porter des données, les comparer par valeur et les « modifier » avec with.",
  objectives: [
    "Déclarer un record en une ligne avec la syntaxe positionnelle",
    "Comprendre l'égalité par valeur",
    "Créer une copie modifiée avec with et déconstruire un record",
    "Ajouter des membres à un record"
  ],
  analogy: `<p>Pense à une <strong>fiche de bibliothèque en carton</strong> : titre, auteur, année. Deux fiches qui portent exactement les mêmes informations décrivent le même livre, même si ce sont deux cartons différents.</p>
<p>Et pour corriger une fiche, on ne gratte pas : on en recopie une neuve avec la correction. C'est l'esprit du <code>record</code>.</p>`,
  lesson: `<h3>Un record, c'est une classe faite pour les données</h3>
<p>Souvent, une classe sert juste à <strong>transporter des données</strong> : un livre, une adresse, une réponse d'API. Écrire les propriétés, le constructeur, la comparaison et l'affichage à la main est long et répétitif. Le <code>record</code> fait tout ça pour toi.</p>
<p>Un <code>record</code> est un type référence (comme une classe), avec trois bonus générés par le compilateur : l'<strong>égalité par valeur</strong>, un <strong>ToString lisible</strong> et la <strong>copie avec with</strong>.</p>

<h3>La syntaxe positionnelle</h3>
<p>Une seule ligne suffit : <code>record Book(string Title, int Year);</code>. Le compilateur crée un constructeur avec ces deux paramètres et deux propriétés <code>Title</code> et <code>Year</code> en <code>init</code> : on peut les lire, mais pas les modifier après la création. Ces paramètres entre parenthèses s'appellent des <strong>paramètres positionnels</strong>.</p>
<p>En TypeScript, c'est proche d'un <code>type Book = { readonly title: string; readonly year: number }</code>, sauf qu'ici tu as en plus un vrai constructeur et une comparaison intelligente.</p>

<h3>L'égalité par valeur</h3>
<p>Avec une classe, <code>==</code> compare les <strong>adresses</strong> : deux objets créés séparément sont différents, même s'ils contiennent la même chose. Avec un record, <code>==</code> compare les <strong>valeurs de toutes les propriétés</strong>.</p>
<div class="compare"><div><h4>class</h4><p><code>new BookClass("Dune", 1965) == new BookClass("Dune", 1965)</code> donne <code>False</code> : deux objets, deux adresses.</p></div><div><h4>record</h4><p><code>new Book("Dune", 1965) == new Book("Dune", 1965)</code> donne <code>True</code> : mêmes valeurs, donc égaux.</p></div></div>
<p>Et <code>Console.WriteLine(book)</code> affiche <code>Book { Title = Dune, Year = 1965 }</code> au lieu du simple nom du type. Très pratique pour déboguer.</p>

<h3>Immuable et with</h3>
<p>Comme les propriétés sont en <code>init</code>, <code>book.Year = 2000;</code> est une erreur de compilation. Pour obtenir une version modifiée, on utilise l'<strong>expression with</strong> : elle copie le record et change seulement ce que tu indiques.</p>
<div class="flow"><span>original</span><span>with { Year = 2021 }</span><span>nouvelle copie</span></div>
<p>C'est exactement le spread de JS : <code>{ ...original, year: 2021 }</code>. L'original reste intact.</p>
<div class="tip">« Immuable » ne protège que le premier niveau : si un record contient une <code>List</code>, la liste elle-même peut encore être modifiée.</div>

<h3>Déconstruction et corps</h3>
<p>Un record positionnel se <strong>déconstruit</strong> : <code>var (title, year) = book;</code> range chaque propriété dans une variable, comme la déstructuration de JS. Tu peux aussi donner un <strong>corps</strong> au record entre accolades pour ajouter des propriétés supplémentaires ou des méthodes, exactement comme dans une classe.</p>

<h3>record struct et DTO</h3>
<p>Il existe aussi le <code>record struct</code> : les mêmes avantages (égalité, ToString, with), mais en <strong>type valeur</strong>. Avec <code>readonly record struct</code>, il devient immuable. On le compare aux autres types en 4.4.</p>
<p>Les records sont parfaits pour les <strong>DTO</strong> (<em>Data Transfer Object</em> : un objet qui sert seulement à transporter des données entre deux couches, par exemple le JSON envoyé par une API). Tu les retrouveras partout quand tu écriras des APIs ASP.NET Core.</p>
<div class="note">En équipe, la convention est simple : un record pour les données qui circulent (requêtes, réponses, messages, objets de valeur), une classe pour les objets qui ont un comportement et un état qui évolue.</div>`,
  examples: [
    {
      title: "class contre record : l'égalité",
      code: `var c1 = new BookClass("Dune", 1965);
var c2 = new BookClass("Dune", 1965);
Console.WriteLine(c1 == c2);   // compare les adresses

var r1 = new Book("Dune", 1965);
var r2 = new Book("Dune", 1965);
Console.WriteLine(r1 == r2);   // compare les valeurs
Console.WriteLine(r1);         // ToString généré

record Book(string Title, int Year);

class BookClass
{
    public string Title { get; }
    public int Year { get; }

    public BookClass(string title, int year)
    {
        Title = title;
        Year = year;
    }
}`,
      output: `False
True
Book { Title = Dune, Year = 1965 }`,
      steps: [
        "<code>record Book(string Title, int Year);</code> : une ligne remplace la classe <code>BookClass</code> entière, et en fait plus.",
        "<code>c1 == c2</code> : deux objets distincts d'une classe, donc <code>False</code>.",
        "<code>r1 == r2</code> : le record compare Title et Year, identiques, donc <code>True</code>.",
        "<code>Console.WriteLine(r1);</code> : le <code>ToString()</code> généré liste les propriétés et leurs valeurs."
      ]
    },
    {
      title: "with et déconstruction",
      code: `var original = new Book("Dune", 1965);
var reedition = original with { Year = 2021 };

Console.WriteLine(original);
Console.WriteLine(reedition);

var (title, year) = reedition;
Console.WriteLine($"{title} ({year})");

// original.Year = 2000;  // erreur : propriété init

record Book(string Title, int Year);`,
      output: `Book { Title = Dune, Year = 1965 }
Book { Title = Dune, Year = 2021 }
Dune (2021)`,
      steps: [
        "<code>original with { Year = 2021 }</code> : crée une copie de <code>original</code> où seul <code>Year</code> change.",
        "<code>Console.WriteLine(original);</code> : l'original n'a pas bougé, il vaut toujours 1965.",
        "<code>var (title, year) = reedition;</code> : la déconstruction range Title et Year dans deux variables.",
        "<code>// original.Year = 2000;</code> : si tu décommentes, le compilateur refuse, la propriété est en <code>init</code>."
      ],
      explain: "with est l'équivalent C# du spread { ...obj, champ: valeur } de JavaScript."
    },
    {
      title: "Un record avec un corps, et un record struct",
      code: `var book = new Book("Dune", 1965) { Genre = "SF" };
Console.WriteLine(book);
Console.WriteLine(book.AgeIn(2025));

var pos = new Position(3, 4);
Console.WriteLine(pos);

record Book(string Title, int Year)
{
    // propriété en plus, avec une valeur par défaut
    public string Genre { get; init; } = "Inconnu";

    // méthode, comme dans une classe
    public int AgeIn(int currentYear) => currentYear - Year;
}

readonly record struct Position(int X, int Y);`,
      output: `Book { Title = Dune, Year = 1965, Genre = SF }
60
Position { X = 3, Y = 4 }`,
      steps: [
        "<code>record Book(...) { ... }</code> : on ajoute un corps entre accolades pour enrichir le record.",
        "<code>public string Genre { get; init; } = \"Inconnu\";</code> : une propriété supplémentaire, remplie ici avec un initialiseur d'objet <code>{ Genre = \"SF\" }</code>.",
        "<code>Console.WriteLine(book);</code> : le ToString inclut aussi <code>Genre</code> (propriété publique), mais pas les méthodes.",
        "<code>book.AgeIn(2025)</code> : 2025 - 1965 = 60.",
        "<code>readonly record struct Position</code> : un record de type valeur et immuable, avec le même ToString."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un record Member",
      prompt: `<p>Déclare un <code>record Member(string Name, string Email)</code>. Crée deux membres identiques et affiche le résultat de <code>==</code>, puis affiche un des membres.</p>`,
      hint: `<p>Le record se déclare en une ligne, tout en bas du fichier.</p>`,
      solution: `var m1 = new Member("Alice", "alice@mail.com");
var m2 = new Member("Alice", "alice@mail.com");
Console.WriteLine(m1 == m2); // True
Console.WriteLine(m1);       // Member { Name = Alice, Email = alice@mail.com }

record Member(string Name, string Email);`
    },
    {
      level: "moyen",
      title: "Changer d'email avec with",
      prompt: `<p>Reprends <code>Member</code>. Crée un membre, puis une version avec un nouvel email grâce à <code>with</code>. Affiche les deux, puis affiche si elles sont égales. Termine par une déconstruction <code>var (name, email) = …</code>.</p>`,
      hint: `<p><code>var updated = member with { Email = "…" };</code></p>`,
      solution: `var member = new Member("Alice", "alice@mail.com");
var updated = member with { Email = "alice@pro.com" };

Console.WriteLine(member);
Console.WriteLine(updated);
Console.WriteLine(member == updated); // False

var (name, email) = updated;
Console.WriteLine($"{name} : {email}");

record Member(string Name, string Email);`
    },
    {
      level: "difficile",
      title: "Un record avec une méthode",
      prompt: `<p>Crée un <code>record Product(string Name, int PriceCents)</code> avec une propriété <code>Quantity</code> en <code>init</code> (défaut 1) et une méthode <code>Total()</code> qui renvoie le prix total en centimes. Crée un produit à 250 centimes en quantité 4, puis une copie avec une quantité de 10 via <code>with</code>, et affiche les deux totaux.</p>`,
      hint: `<p><code>with</code> fonctionne aussi sur les propriétés du corps : <code>p with { Quantity = 10 }</code>.</p>`,
      solution: `var pens = new Product("Stylo", 250) { Quantity = 4 };
var morePens = pens with { Quantity = 10 };

Console.WriteLine(pens.Total());     // 1000
Console.WriteLine(morePens.Total()); // 2500

record Product(string Name, int PriceCents)
{
    public int Quantity { get; init; } = 1;
    public int Total() => PriceCents * Quantity;
}`
    }
  ],
  quiz: [
    {
      q: `Que compare <code>==</code> entre deux <code>record</code> ?`,
      options: ["Les adresses en mémoire", "Les valeurs de leurs propriétés", "Uniquement la première propriété"],
      answer: 1,
      why: `Le compilateur génère une égalité par valeur qui compare toutes les propriétés. Comparer les adresses, c'est le comportement par défaut des classes.`
    },
    {
      q: `Que fait <code>var b2 = b1 with { Year = 2000 };</code> ?`,
      options: ["Modifie b1 et le copie dans b2", "Crée une copie de b1 avec Year = 2000, b1 ne change pas", "Erreur : un record est immuable"],
      answer: 1,
      why: `<code>with</code> ne modifie jamais l'original : il fabrique une nouvelle instance. C'est justement la façon « autorisée » de changer une valeur sur un record immuable.`
    },
    {
      q: `Avec <code>record Book(string Title, int Year);</code>, que donne <code>book.Year = 2000;</code> ?`,
      options: ["Une erreur de compilation", "Ça fonctionne", "Une exception à l'exécution"],
      answer: 0,
      why: `Les propriétés positionnelles sont en <code>init</code> : on ne peut les fixer qu'à la création. Le compilateur bloque l'affectation avant même l'exécution.`
    },
    {
      q: `Un <code>record</code> (sans le mot struct) est…`,
      options: ["un type valeur", "un type référence", "ni l'un ni l'autre"],
      answer: 1,
      why: `<code>record</code> seul équivaut à <code>record class</code> : c'est un type référence. Pour un type valeur, il faut écrire <code>record struct</code>.`
    }
  ],
  project: `<p><strong>Bibliothèque : un emprunt en record.</strong> Un emprunt est une donnée pure : il ne fait que relier un livre, un membre et des dates. Déclare <code>record Loan(Book Book, Member Member, DateOnly LoanDate, DateOnly DueDate);</code> en réutilisant tes classes <code>Book</code> et <code>Member</code>.</p>
<p>Crée un emprunt d'aujourd'hui (<code>DateOnly.FromDateTime(DateTime.Today)</code>) avec une échéance à 14 jours (<code>AddDays(14)</code>), affiche-le, puis prolonge-le d'une semaine avec <code>with { DueDate = loan.DueDate.AddDays(7) }</code>.</p>`,
  resources: [
    { label: "Records (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/record" }
  ]
});

// =====================================================================
// 4.4 class, struct ou record : choisir
// =====================================================================
window.COURSE.push({
  key: "l-choose-type",
  title: "class, struct ou record : choisir",
  summary: "Tu sauras choisir le bon type (class, struct, record, record struct) pour chaque situation et le justifier en entretien.",
  objectives: [
    "Comparer les cinq façons de déclarer un type",
    "Appliquer un arbre de décision simple",
    "Justifier son choix avec des exemples concrets"
  ],
  analogy: `<p>Choisir un type, c'est comme choisir un contenant. Une <strong>personne</strong> a une identité : même si deux personnes s'appellent Alice, ce ne sont pas les mêmes (class). Une <strong>adresse postale</strong> se définit par son contenu : deux enveloppes avec la même adresse vont au même endroit (record). Un <strong>ticket de caisse</strong> imprimé est petit et ne change plus (readonly record struct).</p>`,
  lesson: `<h3>Cinq options, deux questions</h3>
<p>Tu connais maintenant quatre mots-clés : <code>class</code>, <code>struct</code>, <code>record</code> et <code>record struct</code> (avec sa variante <code>readonly record struct</code>). Pour choisir, deux questions suffisent presque toujours. <strong>Mon objet a-t-il une identité ?</strong> Et <strong>est-ce une petite valeur ?</strong></p>
<p>Un objet a une <strong>identité</strong> quand on le reconnaît par « qui il est » et non par ce qu'il contient. Un client qui change d'adresse reste le même client. Une adresse qui change de rue, en revanche, devient une autre adresse.</p>

<h3>Le grand tableau comparatif</h3>
<table>
<tr><th></th><th>class</th><th>struct</th><th>record</th><th>record struct</th><th>readonly record struct</th></tr>
<tr><td>Famille</td><td>Référence</td><td>Valeur</td><td>Référence</td><td>Valeur</td><td>Valeur</td></tr>
<tr><td>Copie (<code>b = a</code>)</td><td>Adresse partagée</td><td>Données copiées</td><td>Adresse partagée</td><td>Données copiées</td><td>Données copiées</td></tr>
<tr><td>Égalité <code>==</code></td><td>Même objet ?</td><td>Pas de <code>==</code> par défaut</td><td>Mêmes valeurs ?</td><td>Mêmes valeurs ?</td><td>Mêmes valeurs ?</td></tr>
<tr><td>Mutabilité</td><td>Libre</td><td>Libre (ou <code>readonly</code>)</td><td>Immuable (positionnel)</td><td>Mutable (positionnel)</td><td>Immuable</td></tr>
<tr><td>Héritage</td><td>Oui</td><td>Non</td><td>Oui (entre records)</td><td>Non</td><td>Non</td></tr>
<tr><td>Usage typique</td><td>Entité, service</td><td>Petite valeur technique</td><td>DTO, valeur métier</td><td>Rare</td><td>Petite valeur métier</td></tr>
</table>
<div class="tip">Piège classique : un <code>record struct</code> positionnel est <strong>mutable</strong>, contrairement au <code>record</code>. Ajoute <code>readonly</code> pour l'immuabilité.</div>

<h3>L'arbre de décision</h3>
<pre class="diagram">
  Identité ou état qui évolue ?
     |
     +-- oui --&gt; class        (Customer, Library)
     |
     +-- non : c'est une donnée
            |
            Petite (&lt;= 3-4 champs simples) ?
            |
            +-- oui --&gt; readonly record struct
            |           (GeoPoint, Money)
            |
            +-- non --&gt; record
                        (Address, BookDto)
</pre>
<p>Tu remarques que la question de la taille n'arrive qu'en second : c'est voulu. On choisit d'abord selon le <em>sens</em> de l'objet (identité ou donnée), et seulement ensuite selon la performance.</p>
<p>Dans le doute, commence par <code>class</code> pour ce qui vit et évolue, et <code>record</code> pour ce qui transporte des données. Les struct sont une optimisation : on les choisit pour de petites valeurs, pas par défaut.</p>

<h3>Trois exemples concrets</h3>
<p><strong>Customer → class.</strong> Un client a un identifiant, un nom qui peut changer, des commandes. Deux clients nommés Alice ne sont pas le même client : l'égalité par adresse (ou par Id) est la bonne.</p>
<p><strong>Address ou BookDto → record.</strong> Une adresse se définit par sa rue et sa ville. Deux adresses identiques sont égales. Un DTO, lui, fait juste le trajet entre ton API et ton front Angular : pas de comportement, des données.</p>
<p><strong>GeoPoint → readonly record struct.</strong> Deux nombres, aucun comportement, pas d'identité, beaucoup d'instances possibles : une petite valeur copiée à bas coût.</p>

<h3>Questions d'entretien classiques</h3>
<ul>
<li><strong>Différence entre class et struct ?</strong> Référence contre valeur : partage d'adresse contre copie, héritage possible ou non, <code>null</code> possible ou non.</li>
<li><strong>Pourquoi un record pour un DTO ?</strong> Immuable, égalité par valeur, ToString lisible, déclaration en une ligne.</li>
<li><strong>Quand éviter une struct ?</strong> Quand elle est grosse (chaque copie coûte), mutable (piège des copies) ou souvent convertie en <code>object</code> (boxing).</li>
<li><strong>record ou record struct ?</strong> Record par défaut ; record struct pour de petites valeurs très nombreuses.</li>
</ul>
<div class="note">Microsoft recommande d'éviter une struct au-delà d'environ 16 octets (par exemple quatre int) sauf raison mesurée. Au-delà, les copies coûtent plus cher que l'allocation d'une classe.</div>`,
  examples: [
    {
      title: "Identité contre valeur",
      code: `var alice1 = new Customer(1, "Alice");
var alice2 = new Customer(1, "Alice");
Console.WriteLine(alice1 == alice2); // deux clients distincts
alice1.Rename("Alice Martin");
Console.WriteLine(alice1.Name);

var a1 = new Address("10 rue des Lilas", "Lyon");
var a2 = new Address("10 rue des Lilas", "Lyon");
Console.WriteLine(a1 == a2);         // même adresse

var g1 = new GeoPoint(45.76, 4.84);
var g2 = g1;                         // copie de la valeur
Console.WriteLine(g1 == g2);

class Customer
{
    public int Id { get; }
    public string Name { get; private set; }

    public Customer(int id, string name)
    {
        Id = id;
        Name = name;
    }

    public void Rename(string newName) => Name = newName;
}

record Address(string Street, string City);

readonly record struct GeoPoint(double Latitude, double Longitude);`,
      output: `False
Alice Martin
True
True`,
      steps: [
        "<code>class Customer</code> : un client a une identité et un nom qui évolue (<code>Rename</code>), donc une classe.",
        "<code>alice1 == alice2</code> : deux objets différents, même contenu : <code>False</code>. C'est voulu, ce sont deux fiches client.",
        "<code>record Address</code> : une adresse se définit par son contenu, donc <code>a1 == a2</code> vaut <code>True</code>.",
        "<code>readonly record struct GeoPoint</code> : deux double, immuable, copié à l'affectation.",
        "<code>g1 == g2</code> : <code>g2</code> est une copie, les valeurs sont identiques, donc <code>True</code>."
      ]
    },
    {
      title: "Une entité et son DTO",
      code: `var entity = new Book(42, "Dune", 1965);
entity.Borrow();

// On convertit l'entité en DTO avant de l'envoyer au front
var dto = new BookDto(entity.Title, entity.Year, entity.IsAvailable);
Console.WriteLine(dto);

// Entité : identité + état qui change => class
class Book
{
    public int Id { get; }
    public string Title { get; }
    public int Year { get; }
    public bool IsAvailable { get; private set; } = true;

    public Book(int id, string title, int year)
    {
        Id = id;
        Title = title;
        Year = year;
    }

    public void Borrow() => IsAvailable = false;
}

// Données qui voyagent vers le front => record
record BookDto(string Title, int Year, bool IsAvailable);`,
      output: `BookDto { Title = Dune, Year = 1965, IsAvailable = False }`,
      steps: [
        "<code>class Book</code> : l'entité de la bibliothèque, avec un Id et un état (<code>IsAvailable</code>) qui change.",
        "<code>entity.Borrow();</code> : le comportement vit dans la classe, la propriété passe à <code>false</code>.",
        "<code>record BookDto(...)</code> : le DTO ne contient que ce que le front doit voir, sans méthode.",
        "<code>new BookDto(entity.Title, ...)</code> : on copie les données utiles de l'entité vers le DTO.",
        "<code>Console.WriteLine(dto);</code> : le ToString du record affiche tout, <code>bool</code> s'écrit <code>False</code>."
      ],
      explain: "Ce duo entité (class) + DTO (record) est exactement ce que tu feras dans une API ASP.NET Core."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Classer des types",
      prompt: `<p>Pour chacun, choisis class, record ou readonly record struct et écris la déclaration : un <code>Rgb</code> (trois octets de couleur), un <code>ShoppingCart</code> (on y ajoute des articles), un <code>LoginRequest</code> (email et mot de passe envoyés par le front).</p>`,
      hint: `<p>Pose-toi les deux questions : identité/état qui évolue ? petite valeur ?</p>`,
      solution: `var color = new Rgb(255, 128, 0);
var request = new LoginRequest("a@b.com", "secret");
var cart = new ShoppingCart();
cart.Add("Livre");
Console.WriteLine(color);
Console.WriteLine(cart.Count);

// Petite valeur pure
readonly record struct Rgb(byte R, byte G, byte B);

// Données qui voyagent
record LoginRequest(string Email, string Password);

// État qui évolue
class ShoppingCart
{
    private readonly List<string> _items = new();
    public int Count => _items.Count;
    public void Add(string item) => _items.Add(item);
}`
    },
    {
      level: "moyen",
      title: "Le piège du record struct mutable",
      prompt: `<p>Déclare <code>record struct Size(int Width, int Height);</code>, crée une taille et modifie <code>Width</code> directement. Ça compile ? Ajoute ensuite <code>readonly</code> et utilise <code>with</code> pour obtenir une taille plus large.</p>`,
      hint: `<p>Un <code>record struct</code> positionnel génère des propriétés <code>get; set;</code>.</p>`,
      solution: `var s = new Size(10, 20);
var wider = s with { Width = 30 };
Console.WriteLine(s);     // Size { Width = 10, Height = 20 }
Console.WriteLine(wider); // Size { Width = 30, Height = 20 }

// Sans readonly, s.Width = 30; compilait.
// Avec readonly, il faut passer par with.
readonly record struct Size(int Width, int Height);`
    },
    {
      level: "difficile",
      title: "Entité Order et DTO",
      prompt: `<p>Crée une classe <code>Order</code> (Id, liste de lignes, méthode <code>AddLine(string product, int priceCents)</code>, propriété calculée <code>TotalCents</code>) et un <code>record OrderSummaryDto(int Id, int LineCount, int TotalCents)</code>. Ajoute deux lignes et affiche le DTO.</p>`,
      hint: `<p>Stocke les lignes dans une <code>List&lt;int&gt;</code> de prix, ou dans une liste d'un petit record <code>OrderLine</code>.</p>`,
      solution: `var order = new Order(7);
order.AddLine("Livre", 1500);
order.AddLine("Marque-page", 300);

var dto = new OrderSummaryDto(order.Id, order.LineCount, order.TotalCents);
Console.WriteLine(dto); // OrderSummaryDto { Id = 7, LineCount = 2, TotalCents = 1800 }

class Order
{
    private readonly List<OrderLine> _lines = new();
    public int Id { get; }
    public int LineCount => _lines.Count;
    public int TotalCents
    {
        get
        {
            int total = 0;
            foreach (var line in _lines) total += line.PriceCents;
            return total;
        }
    }

    public Order(int id) { Id = id; }
    public void AddLine(string product, int priceCents) => _lines.Add(new OrderLine(product, priceCents));
}

record OrderLine(string Product, int PriceCents);
record OrderSummaryDto(int Id, int LineCount, int TotalCents);`
    }
  ],
  quiz: [
    {
      q: `Un <code>Customer</code> avec un Id, un nom modifiable et des commandes : quel type ?`,
      options: ["readonly record struct", "record", "class"],
      answer: 2,
      why: `Le client a une identité et un état qui évolue : c'est le cas typique de la classe. Un record conviendrait à une simple photo de ses données (un DTO).`
    },
    {
      q: `Lequel est <strong>mutable</strong> par défaut avec la syntaxe positionnelle ?`,
      options: ["<code>record struct</code>", "<code>record</code>", "<code>readonly record struct</code>"],
      answer: 0,
      why: `Le <code>record struct</code> positionnel génère des propriétés avec <code>set</code>. Le <code>record</code> (classe) génère des <code>init</code>, et <code>readonly</code> interdit toute modification.`
    },
    {
      q: `Pourquoi éviter une grosse struct (20 champs) ?`,
      options: ["Elle ne peut pas avoir de constructeur", "Chaque affectation ou passage en paramètre copie les 20 champs", "Elle est stockée deux fois sur le tas"],
      answer: 1,
      why: `Une struct se copie entièrement à chaque affectation. Pour un gros objet, ces copies coûtent plus cher qu'une simple adresse de classe.`
    }
  ],
  project: `<p><strong>Bibliothèque : faire le tri.</strong> Relis tes types : <code>Book</code> et <code>Member</code> ont une identité et un état (disponible, nombre d'emprunts) : ils restent des classes. <code>Loan</code> est un record. Ajoute un <code>record BookSummary(string Title, string Author, bool IsAvailable)</code> et une méthode <code>ToSummary()</code> dans <code>Book</code> pour l'affichage de la liste dans le menu.</p>`,
  resources: [
    { label: "Choisir entre classe et struct (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/design-guidelines/choosing-between-class-and-struct" }
  ]
});

// =====================================================================
// 4.5 Enums
// =====================================================================
window.COURSE.push({
  key: "l-enums",
  title: "Enums",
  summary: "Tu sauras remplacer des chaînes ou des nombres magiques par des enums lisibles et sûrs.",
  objectives: [
    "Déclarer et utiliser un enum",
    "Comprendre la valeur numérique sous-jacente",
    "Convertir un enum depuis et vers du texte",
    "Découvrir [Flags] pour combiner des valeurs"
  ],
  analogy: `<p>Un <strong>feu tricolore</strong> n'a que trois états possibles : rouge, orange, vert. Personne n'imagine un feu « violet ». Un enum, c'est exactement ça : une liste fermée de valeurs nommées, et le compilateur refuse tout le reste.</p>`,
  lesson: `<h3>Une liste de valeurs nommées</h3>
<p>Imagine que tu stockes le statut d'un emprunt dans une <code>string</code> : <code>"active"</code>, <code>"returned"</code>… Une faute de frappe (<code>"retruned"</code>) passe inaperçue jusqu'au bug. Un <strong>enum</strong> (énumération) règle ça : tu déclares une fois la liste des valeurs autorisées, et le compilateur vérifie chaque utilisation.</p>
<p>Déclaration : <code>enum TrafficLight { Red, Orange, Green }</code>. Utilisation : <code>var light = TrafficLight.Red;</code>. L'autocomplétion te propose les trois valeurs, rien d'autre.</p>

<h3>Une valeur numérique cachée</h3>
<p>Sous le capot, un enum est un type valeur basé sur un <code>int</code>. Par défaut, la première valeur vaut 0, la suivante 1, etc. Tu peux choisir les nombres toi-même : <code>enum LoanStatus { Active = 1, Returned = 2, Late = 3 }</code>. C'est utile quand la valeur est stockée en base de données : ajouter une valeur au milieu ne décale plus les autres.</p>
<pre class="diagram">
  enum TrafficLight     nom        valeur
                        Red    =&gt;  0
                        Orange =&gt;  1
                        Green  =&gt;  2

  (int)TrafficLight.Green      =&gt;  2
  (TrafficLight)0              =&gt;  Red
</pre>
<p>On passe de l'un à l'autre avec un <strong>cast</strong> (une conversion explicite) : <code>(int)light</code> ou <code>(TrafficLight)2</code>.</p>

<h3>switch sur un enum</h3>
<p>Comme un enum est une liste fermée, il appelle naturellement un traitement « cas par cas ». Un enum se marie donc parfaitement avec <code>switch</code>. L'<strong>expression switch</strong> (<code>light switch { … }</code>) renvoie directement une valeur selon le cas, et <code>_</code> attrape tout le reste. C'est plus court qu'une suite de <code>if</code> et plus facile à relire.</p>

<h3>Enum et texte</h3>
<table>
<tr><th>Besoin</th><th>Code</th><th>Résultat</th></tr>
<tr><td>Enum vers texte</td><td><code>LoanStatus.Late.ToString()</code></td><td><code>"Late"</code></td></tr>
<tr><td>Texte vers enum (sûr)</td><td><code>Enum.Parse&lt;LoanStatus&gt;("Late")</code></td><td><code>LoanStatus.Late</code>, exception si inconnu</td></tr>
<tr><td>Texte vers enum (incertain)</td><td><code>Enum.TryParse&lt;LoanStatus&gt;(text, out var s)</code></td><td><code>true</code> ou <code>false</code></td></tr>
<tr><td>Toutes les valeurs</td><td><code>Enum.GetValues&lt;LoanStatus&gt;()</code></td><td>un tableau à parcourir</td></tr>
</table>
<p>Tu reconnais le motif <code>Try</code> + <code>out</code> du chapitre 2 avec <code>int.TryParse</code> : même idée. Utilise <code>TryParse</code> dès que le texte vient de l'utilisateur.</p>
<div class="tip"><code>Enum.TryParse</code> accepte aussi les nombres : <code>"42"</code> réussit et donne une valeur 42 qui n'existe pas dans ta liste ! Vérifie avec <code>Enum.IsDefined(status)</code> si l'entrée vient de l'extérieur.</div>

<h3>[Flags] : combiner des valeurs</h3>
<p>Parfois, on veut cumuler plusieurs valeurs : lire <em>et</em> écrire. On marque l'enum avec l'attribut <code>[Flags]</code> et on donne des puissances de 2 (1, 2, 4, 8…). Chaque valeur occupe alors un bit, et l'opérateur <code>|</code> (« ou » bit à bit) les combine : <code>Permission.Read | Permission.Write</code>. Pour tester, <code>HasFlag(Permission.Write)</code>. On creusera si tu en as besoin ; retiens surtout le principe.</p>

<h3>Et en TypeScript ?</h3>
<div class="compare"><div><h4>TypeScript</h4><p><code>enum Light { Red, Green }</code> existe aussi, mais on préfère souvent l'union <code>type Light = "red" | "green"</code> : de simples chaînes vérifiées par le compilateur, qui disparaissent au runtime.</p></div><div><h4>C#</h4><p>Pas d'union de chaînes : l'enum est la solution standard. Il existe vraiment au runtime, c'est un nombre avec un nom, et il est rapide à comparer.</p></div></div>
<div class="note">Quand une API renvoie un enum en JSON, il sort par défaut en nombre (<code>2</code>). Pour envoyer <code>"Late"</code> à ton front Angular, on configure un convertisseur de chaînes (<code>JsonStringEnumConverter</code>). Tu le verras au chapitre 6.</div>`,
  examples: [
    {
      title: "Le feu tricolore",
      code: `var light = TrafficLight.Red;
Console.WriteLine(light);         // le nom
Console.WriteLine((int)light);    // la valeur cachée
Console.WriteLine(Advice(light));
Console.WriteLine(Advice(TrafficLight.Green));

string Advice(TrafficLight l) => l switch
{
    TrafficLight.Red => "Stop",
    TrafficLight.Orange => "Ralentis",
    TrafficLight.Green => "Passe",
    _ => "Feu inconnu"
};

enum TrafficLight { Red, Orange, Green }`,
      output: `Red
0
Stop
Passe`,
      steps: [
        "<code>enum TrafficLight { Red, Orange, Green }</code> : trois valeurs nommées, numérotées 0, 1, 2.",
        "<code>Console.WriteLine(light);</code> : un enum s'affiche avec son nom, pas son nombre.",
        "<code>(int)light</code> : le cast révèle la valeur numérique, ici 0.",
        "<code>l switch { ... }</code> : l'expression switch renvoie le texte correspondant à chaque cas.",
        "<code>_ =&gt; \"Feu inconnu\"</code> : le cas par défaut, pour une valeur castée hors liste."
      ]
    },
    {
      title: "Parse, TryParse et GetValues",
      code: `foreach (var s in Enum.GetValues<LoanStatus>())
    Console.WriteLine($"{(int)s} - {s}");

var parsed = Enum.Parse<LoanStatus>("Returned");
Console.WriteLine(parsed == LoanStatus.Returned);

if (Enum.TryParse<LoanStatus>("Lost", out var status))
    Console.WriteLine($"Statut : {status}");
else
    Console.WriteLine("Statut inconnu : Lost");

enum LoanStatus { Active = 1, Returned = 2, Late = 3 }`,
      output: `1 - Active
2 - Returned
3 - Late
True
Statut inconnu : Lost`,
      steps: [
        "<code>enum LoanStatus { Active = 1, ... }</code> : on fixe nous-mêmes les nombres.",
        "<code>Enum.GetValues&lt;LoanStatus&gt;()</code> : renvoie toutes les valeurs, parfait pour un menu.",
        "<code>Enum.Parse&lt;LoanStatus&gt;(\"Returned\")</code> : convertit le texte en valeur. Un texte inconnu lèverait une exception.",
        "<code>Enum.TryParse&lt;LoanStatus&gt;(\"Lost\", out var status)</code> : \"Lost\" n'existe pas, donc <code>false</code>, sans planter."
      ]
    },
    {
      title: "[Flags] : des permissions combinées",
      code: `var rights = Permission.Read | Permission.Write;
Console.WriteLine(rights);
Console.WriteLine(rights.HasFlag(Permission.Write));
Console.WriteLine(rights.HasFlag(Permission.Delete));

rights |= Permission.Delete;   // on ajoute un droit
Console.WriteLine(rights);
Console.WriteLine((int)rights);

[Flags]
enum Permission
{
    None = 0,
    Read = 1,
    Write = 2,
    Delete = 4
}`,
      output: `Read, Write
True
False
Read, Write, Delete
7`,
      steps: [
        "<code>[Flags]</code> : indique que les valeurs peuvent se combiner. Les valeurs sont des puissances de 2.",
        "<code>Permission.Read | Permission.Write</code> : combine 1 et 2, ce qui donne 3.",
        "<code>Console.WriteLine(rights);</code> : grâce à <code>[Flags]</code>, le ToString liste les noms : <code>Read, Write</code>.",
        "<code>HasFlag(Permission.Write)</code> : teste si le droit est présent.",
        "<code>rights |= Permission.Delete;</code> : ajoute un droit. 1 + 2 + 4 = 7."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Les jours ouvrés",
      prompt: `<p>Déclare un enum <code>WorkDay</code> (Monday à Friday). Parcours toutes ses valeurs avec <code>Enum.GetValues</code> et affiche chaque nom avec son numéro.</p>`,
      hint: `<p><code>foreach (var d in Enum.GetValues&lt;WorkDay&gt;())</code></p>`,
      solution: `foreach (var d in Enum.GetValues<WorkDay>())
    Console.WriteLine($"{(int)d} : {d}");

enum WorkDay { Monday, Tuesday, Wednesday, Thursday, Friday }`
    },
    {
      level: "moyen",
      title: "Tarif selon la taille",
      prompt: `<p>Déclare <code>enum CoffeeSize { Small, Medium, Large }</code> et une méthode <code>PriceCents(CoffeeSize size)</code> avec une expression switch (150, 200, 250). Lis une taille depuis le texte <code>"Large"</code> avec <code>TryParse</code> et affiche son prix, ou un message si le texte est invalide.</p>`,
      hint: `<p><code>if (Enum.TryParse&lt;CoffeeSize&gt;(text, out var size)) …</code></p>`,
      solution: `string text = "Large";
if (Enum.TryParse<CoffeeSize>(text, out var size))
    Console.WriteLine($"{size} : {PriceCents(size)} centimes");
else
    Console.WriteLine($"Taille inconnue : {text}");

int PriceCents(CoffeeSize s) => s switch
{
    CoffeeSize.Small => 150,
    CoffeeSize.Medium => 200,
    CoffeeSize.Large => 250,
    _ => 0
};

enum CoffeeSize { Small, Medium, Large }`
    },
    {
      level: "difficile",
      title: "TryParse et nombres piégés",
      prompt: `<p>Écris une méthode <code>bool TryReadStatus(string text, out LoanStatus status)</code> qui renvoie <code>true</code> seulement si le texte correspond à une valeur réellement définie. Teste-la avec <code>"Late"</code>, <code>"late"</code> (ignore la casse) et <code>"42"</code>.</p>`,
      hint: `<p><code>Enum.TryParse</code> a une surcharge avec <code>ignoreCase: true</code>. Combine-la avec <code>Enum.IsDefined(status)</code>.</p>`,
      solution: `Console.WriteLine(TryReadStatus("Late", out var s1));  // True
Console.WriteLine(TryReadStatus("late", out var s2));  // True
Console.WriteLine(TryReadStatus("42", out var s3));    // False

bool TryReadStatus(string text, out LoanStatus status)
{
    return Enum.TryParse(text, ignoreCase: true, out status)
        && Enum.IsDefined(status);
}

enum LoanStatus { Active = 1, Returned = 2, Late = 3 }`
    }
  ],
  quiz: [
    {
      q: `Que vaut <code>(int)Color.Blue</code> avec <code>enum Color { Red, Green, Blue }</code> ?`,
      options: ["3", "2", "\"Blue\""],
      answer: 1,
      why: `La numérotation commence à 0 : Red = 0, Green = 1, Blue = 2. Le cast <code>(int)</code> donne le nombre, pas le nom.`
    },
    {
      q: `Le texte vient de l'utilisateur. Quelle méthode utiliser ?`,
      options: ["<code>Enum.TryParse</code>", "<code>Enum.Parse</code>", "Un cast <code>(LoanStatus)text</code>"],
      answer: 0,
      why: `<code>TryParse</code> renvoie <code>false</code> au lieu de lever une exception si le texte est invalide. On ne peut pas caster une string en enum.`
    },
    {
      q: `Pourquoi les valeurs d'un enum <code>[Flags]</code> sont-elles 1, 2, 4, 8 ?`,
      options: ["C'est obligatoire pour tous les enums", "Pour que chaque valeur occupe un bit distinct et puisse se combiner", "Pour économiser de la mémoire"],
      answer: 1,
      why: `Avec des puissances de 2, chaque droit correspond à un bit. 1 | 2 = 3 se décompose sans ambiguïté. Avec 1, 2, 3, la valeur 3 serait ambiguë.`
    }
  ],
  project: `<p><strong>Bibliothèque : le statut d'un emprunt.</strong> Ajoute <code>enum LoanStatus { Active = 1, Returned = 2, Late = 3 }</code> et une propriété <code>Status</code> à ton record <code>Loan</code> (par exemple <code>public LoanStatus Status { get; init; } = LoanStatus.Active;</code>). Pour le retour d'un livre, crée la nouvelle version avec <code>loan with { Status = LoanStatus.Returned }</code>, et affiche le statut dans la liste des emprunts avec une expression switch (« en cours », « rendu », « en retard »).</p>`,
  resources: [
    { label: "Types énumération (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/enum" }
  ]
});

// =====================================================================
// 4.6 null et types nullables
// =====================================================================
window.COURSE.push({
  key: "l-null",
  title: "null et types nullables",
  summary: "Tu sauras représenter une absence de valeur sans provoquer de NullReferenceException.",
  objectives: [
    "Comprendre null et la NullReferenceException",
    "Utiliser int? et string? à bon escient",
    "Manier les opérateurs ?. ?? ??= et is null",
    "Écouter les avertissements nullables du compilateur"
  ],
  analogy: `<p><code>null</code>, c'est une <strong>boîte aux lettres sans adresse</strong> : la variable existe, mais elle ne mène nulle part. Si tu essaies d'y déposer une lettre (appeler une méthode dessus), le facteur s'arrête net : c'est le crash.</p>
<p>Le <code>?</code> dans <code>string?</code> est une étiquette sur la boîte : « attention, peut-être vide ». Le compilateur te force alors à vérifier avant de l'ouvrir.</p>`,
  lesson: `<h3>null : l'absence de valeur</h3>
<p>Une variable de type référence peut contenir <code>null</code> : « aucun objet ». C'est utile pour dire « pas trouvé » ou « pas encore renseigné ». Mais si tu utilises cette variable comme si elle pointait vers un objet, le programme plante avec une <strong>NullReferenceException</strong>.</p>
<pre class="diagram">
  string? name = null;
  Console.WriteLine(name.Length);

  Unhandled exception.
  System.NullReferenceException: Object reference
  not set to an instance of an object.
</pre>
<p>C'est l'erreur la plus fréquente en C#, exactement comme <em>Cannot read properties of undefined</em> en JS. Tout ce chapitre sert à l'éviter.</p>

<h3>Les types valeur nullables : int?</h3>
<p>Un <code>int</code> ne peut pas être <code>null</code> : il vaut toujours un nombre (0 par défaut). Mais « âge non renseigné » n'est pas « âge 0 ». On écrit alors <code>int?</code> (raccourci de <code>Nullable&lt;int&gt;</code>) : un int qui peut aussi valoir <code>null</code>. On teste avec <code>age.HasValue</code> et on lit avec <code>age.Value</code>.</p>

<h3>Les types référence nullables : string?</h3>
<p>Dans un projet .NET moderne, le <strong>contexte nullable</strong> est activé (<code>&lt;Nullable&gt;enable&lt;/Nullable&gt;</code> dans le .csproj). Alors <code>string</code> veut dire « jamais null » et <code>string?</code> veut dire « peut être null ». Ce n'est qu'une indication pour le compilateur : il t'avertit (avertissement CS8602 par exemple) si tu déréférences un <code>string?</code> sans vérifier, ou si tu mets <code>null</code> dans un <code>string</code>.</p>
<div class="compare"><div><h4>int?</h4><p>Vrai type différent (<code>Nullable&lt;int&gt;</code>), avec <code>HasValue</code> et <code>Value</code>.</p></div><div><h4>string?</h4><p>Même type <code>string</code>, plus une annotation que le compilateur vérifie. Aucun coût à l'exécution.</p></div></div>
<div class="tip">Traite les avertissements nullables comme des erreurs : chacun signale un crash possible. Beaucoup d'équipes activent <code>&lt;TreatWarningsAsErrors&gt;</code>.</div>

<h3>Les opérateurs anti-null</h3>
<table>
<tr><th>Opérateur</th><th>Exemple</th><th>Sens</th></tr>
<tr><td><code>?.</code></td><td><code>name?.Length</code></td><td>Si <code>name</code> est null, renvoie null au lieu de planter</td></tr>
<tr><td><code>??</code></td><td><code>name ?? "inconnu"</code></td><td>Valeur de secours si c'est null</td></tr>
<tr><td><code>??=</code></td><td><code>name ??= "Kam";</code></td><td>Affecte seulement si c'est null</td></tr>
<tr><td><code>is null</code> / <code>is not null</code></td><td><code>if (book is null)</code></td><td>Le test recommandé</td></tr>
<tr><td><code>!</code></td><td><code>name!.Length</code></td><td>« Fais-moi confiance, ce n'est pas null » : à éviter</td></tr>
</table>
<p>Bonne nouvelle : <code>?.</code>, <code>??</code> et <code>??=</code> s'écrivent et se comportent comme en TypeScript. Seul <code>undefined</code> n'existe pas : C# n'a que <code>null</code>. Une propriété non initialisée vaut null (référence) ou sa valeur par défaut (valeur), jamais « undefined ».</p>
<p>L'opérateur <code>!</code> (dit « null-forgiving ») fait taire l'avertissement sans rien vérifier. Si tu te trompes, c'est le crash. Réserve-le aux cas où tu sais quelque chose que le compilateur ne peut pas savoir.</p>

<h3>Vérifier ses entrées</h3>
<p>Le bon réflexe : ne pas attendre le crash pour s'occuper de null, mais le vérifier le plus tôt possible, à l'entrée d'une méthode ou juste après une recherche. Après un <code>if (book is null) return;</code>, le compilateur sait que <code>book</code> n'est plus null et arrête de t'avertir. Pour une méthode qui peut ne rien trouver, renvoie <code>Book?</code> : la signature dit clairement « vérifie le résultat ».</p>
<div class="flow"><span>FindByTitle renvoie Book?</span><span>if (book is null)</span><span>book utilisable sans risque</span></div>
<div class="note">Préfère <code>is null</code> à <code>== null</code> : une classe peut redéfinir <code>==</code>, alors que <code>is null</code> teste toujours vraiment la référence.</div>`,
  examples: [
    {
      title: "Les opérateurs ?. ?? et ??=",
      code: `string? nickname = null;
Console.WriteLine($"Longueur : [{nickname?.Length}]");
Console.WriteLine(nickname ?? "(aucun)");

nickname ??= "Kam";            // affecté car null
Console.WriteLine(nickname);
Console.WriteLine(nickname.Length);

int? age = null;
Console.WriteLine(age.HasValue);
age ??= 30;
Console.WriteLine(age.Value + 1);`,
      output: `Longueur : []
(aucun)
Kam
3
False
31`,
      steps: [
        "<code>string? nickname = null;</code> : le <code>?</code> annonce que la variable peut être null.",
        "<code>nickname?.Length</code> : comme <code>nickname</code> est null, l'expression vaut null et s'affiche vide.",
        "<code>nickname ?? \"(aucun)\"</code> : valeur de secours quand c'est null.",
        "<code>nickname ??= \"Kam\";</code> : affecte seulement si null. Ensuite le compilateur sait que ce n'est plus null, donc <code>nickname.Length</code> ne donne aucun avertissement.",
        "<code>int? age = null;</code> : un int qui peut être null. <code>HasValue</code> vaut <code>False</code>, puis <code>??=</code> lui donne 30."
      ]
    },
    {
      title: "Une recherche qui renvoie Book?",
      code: `Book[] books = [new Book("Dune", 1965), new Book("Neuromancien", 1984)];

Book? missing = FindByTitle(books, "Fondation");
if (missing is null)
    Console.WriteLine("Introuvable");

Book? dune = FindByTitle(books, "dune");
if (dune is not null)
    Console.WriteLine($"Trouvé : {dune.Title} ({dune.Year})");

Book? FindByTitle(Book[] all, string title)
{
    foreach (var b in all)
    {
        if (b.Title.Equals(title, StringComparison.OrdinalIgnoreCase))
            return b;
    }
    return null; // rien trouvé
}

record Book(string Title, int Year);`,
      output: `Introuvable
Trouvé : Dune (1965)`,
      steps: [
        "<code>Book? FindByTitle(...)</code> : le type de retour prévient l'appelant que le résultat peut être null.",
        "<code>StringComparison.OrdinalIgnoreCase</code> : compare sans tenir compte des majuscules, donc \"dune\" trouve \"Dune\".",
        "<code>return null;</code> : aucun livre ne correspond, on renvoie l'absence de valeur.",
        "<code>if (missing is null)</code> : le test recommandé pour détecter null.",
        "<code>if (dune is not null)</code> : dans ce bloc, le compilateur sait que <code>dune</code> est un vrai livre, sans avertissement."
      ],
      explain: "Si tu écris dune.Title sans le if, le compilateur t'avertit : c'est lui qui t'évite la NullReferenceException."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un prénom par défaut",
      prompt: `<p>Déclare <code>string? firstName = null;</code>. Affiche « Bonjour » suivi du prénom, ou de « inconnu » s'il est null, en une seule ligne avec <code>??</code>. Puis donne-lui la valeur « Léa » avec <code>??=</code> et affiche-le à nouveau.</p>`,
      hint: `<p><code>Console.WriteLine($"Bonjour {firstName ?? "inconnu"}");</code></p>`,
      solution: `string? firstName = null;
Console.WriteLine($"Bonjour {firstName ?? "inconnu"}"); // Bonjour inconnu

firstName ??= "Léa";
Console.WriteLine($"Bonjour {firstName}");             // Bonjour Léa`
    },
    {
      level: "moyen",
      title: "Note facultative",
      prompt: `<p>Crée un tableau <code>int?[] grades = [12, null, 15, null, 9];</code> (null = absent). Calcule la moyenne des notes présentes uniquement et le nombre d'absences.</p>`,
      hint: `<p>Dans la boucle, teste <code>g.HasValue</code> (ou <code>g is not null</code>) puis additionne <code>g.Value</code>.</p>`,
      solution: `int?[] grades = [12, null, 15, null, 9];
int sum = 0, count = 0, absent = 0;

foreach (var g in grades)
{
    if (g.HasValue)
    {
        sum += g.Value;
        count++;
    }
    else
    {
        absent++;
    }
}

Console.WriteLine($"Moyenne : {sum / count}"); // 12
Console.WriteLine($"Absences : {absent}");     // 2`
    },
    {
      level: "difficile",
      title: "Chaîne de ?.",
      prompt: `<p>Crée <code>record Address(string City);</code> et <code>record Member(string Name, Address? Address);</code>. Écris une méthode <code>string CityOf(Member? m)</code> qui renvoie la ville, ou « ville inconnue » si le membre ou son adresse est null, en une seule expression.</p>`,
      hint: `<p>Enchaîne : <code>m?.Address?.City ?? "…"</code>.</p>`,
      solution: `Console.WriteLine(CityOf(new Member("Alice", new Address("Lyon")))); // Lyon
Console.WriteLine(CityOf(new Member("Bob", null)));                 // ville inconnue
Console.WriteLine(CityOf(null));                                    // ville inconnue

string CityOf(Member? m) => m?.Address?.City ?? "ville inconnue";

record Address(string City);
record Member(string Name, Address? Address);`
    }
  ],
  quiz: [
    {
      q: `Que vaut <code>name?.Length</code> si <code>name</code> est null ?`,
      options: ["0", "Une NullReferenceException", "null"],
      answer: 2,
      why: `<code>?.</code> court-circuite : si la partie gauche est null, toute l'expression vaut null (ici un <code>int?</code>). Sans le <code>?</code>, ce serait le crash.`
    },
    {
      q: `Avec le contexte nullable activé, que signifie <code>string</code> sans <code>?</code> ?`,
      options: ["Cette variable ne doit jamais contenir null", "Elle peut contenir null", "C'est un type valeur"],
      answer: 0,
      why: `Avec <code>enable</code>, <code>string</code> annonce « jamais null » et le compilateur t'avertit si tu y mets null. Pour autoriser null, écris <code>string?</code>.`
    },
    {
      q: `Pourquoi éviter l'opérateur <code>!</code> (<code>book!.Title</code>) ?`,
      options: ["Il est plus lent", "Il fait taire l'avertissement sans rien vérifier", "Il transforme null en chaîne vide"],
      answer: 1,
      why: `<code>!</code> dit juste au compilateur « fais-moi confiance ». Si la valeur est vraiment null, tu obtiens quand même une NullReferenceException.`
    },
    {
      q: `Quel est l'équivalent C# de <code>value ?? "défaut"</code> en TypeScript ?`,
      options: ["<code>value || \"défaut\"</code>", "<code>value ?? \"défaut\"</code>", "<code>value ?: \"défaut\"</code>"],
      answer: 1,
      why: `C'est le même opérateur, avec le même sens : la valeur de droite n'est utilisée que si la gauche est null. <code>||</code> n'existe pas sur des chaînes en C#.`
    }
  ],
  project: `<p><strong>Bibliothèque : une recherche sûre.</strong> Ajoute à ta bibliothèque une méthode <code>Book? FindByTitle(string title)</code> qui parcourt les livres et renvoie <code>null</code> si rien ne correspond (compare sans tenir compte de la casse). Dans le menu, ajoute l'option « Rechercher un livre » : lis le titre avec <code>Console.ReadLine()</code> (qui renvoie un <code>string?</code>, utilise <code>?? ""</code>), et affiche « Livre introuvable » si le résultat <code>is null</code>.</p>`,
  resources: [
    { label: "Types référence nullables (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/nullable-references" },
    { label: "Types valeur nullables (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/nullable-value-types" }
  ]
});

// =====================================================================
// 4.7 Exceptions : try, catch, finally
// =====================================================================
window.COURSE.push({
  key: "l-exceptions",
  title: "Exceptions : try, catch, finally",
  summary: "Tu sauras intercepter une erreur avec try/catch, nettoyer avec finally et lire une stack trace.",
  objectives: [
    "Comprendre comment une exception remonte la pile d'appels",
    "Écrire plusieurs catch, du plus précis au plus général",
    "Utiliser un filtre when et un bloc finally",
    "Reconnaître les exceptions courantes"
  ],
  analogy: `<p>Une exception, c'est une <strong>alarme incendie</strong>. Quand elle se déclenche dans une pièce, tout le monde arrête ce qu'il fait. Si personne dans la pièce ne sait gérer, l'alarme remonte à l'étage, puis au rez-de-chaussée. Si personne nulle part ne s'en occupe, on évacue tout le bâtiment : le programme s'arrête.</p>
<p>Le <code>try/catch</code>, c'est l'équipe de sécurité postée à un étage. Le <code>finally</code>, c'est « éteindre les lumières en partant », quoi qu'il arrive.</p>`,
  lesson: `<h3>Une exception interrompt le programme</h3>
<p>Une <strong>exception</strong> est un objet qui signale une erreur à l'exécution : texte impossible à convertir, division par zéro, fichier absent… Quand elle est levée, la ligne en cours s'arrête net. .NET remonte alors la <strong>pile d'appels</strong> (la liste des méthodes en cours, chacune appelée par la précédente) à la recherche d'un <code>catch</code> capable de la gérer.</p>
<div class="flow"><span>ParseAge lève l'exception</span><span>ReadUser ne la gère pas</span><span>Main a un catch</span><span>Le programme continue</span></div>
<p>Si aucune méthode ne l'attrape, le programme s'arrête avec « Unhandled exception » dans la console.</p>

<h3>try / catch</h3>
<p>On met le code risqué dans un bloc <code>try</code>. Si une exception survient, l'exécution saute directement au <code>catch</code> correspondant, puis continue <em>après</em> le bloc entier. Le reste du <code>try</code> n'est pas exécuté. C'est le même principe qu'en JavaScript, avec une différence importante : en C#, on attrape les exceptions <strong>par type</strong>.</p>

<h3>Plusieurs catch, du plus précis au plus général</h3>
<p>Tu peux enchaîner plusieurs blocs <code>catch</code>. .NET prend le <strong>premier</strong> qui correspond, donc on écrit les plus précis d'abord et <code>catch (Exception ex)</code> en dernier (toutes les exceptions héritent de <code>Exception</code>). Dans l'autre ordre, le compilateur refuse : le catch précis ne serait jamais atteint.</p>
<p>Un <strong>filtre</strong> <code>when</code> ajoute une condition : <code>catch (Exception ex) when (ex is FormatException || ex is OverflowException)</code>. Si la condition est fausse, le catch est ignoré et la recherche continue.</p>

<h3>finally : toujours exécuté</h3>
<p>Le bloc <code>finally</code> s'exécute <strong>dans tous les cas</strong> : succès, exception attrapée, exception non attrapée, et même après un <code>return</code> dans le try. On y met le nettoyage : fermer un fichier, arrêter un chronomètre, remettre un état. En 4.9, tu verras que <code>using</code> écrit souvent ce finally pour toi.</p>
<pre class="diagram">
  try { code risqué } --&gt; ok ? ----------+
     |                                   |
     +-- exception --&gt; catch { gérer } --+
                                         v
                              finally { nettoyer }
</pre>

<h3>Les exceptions courantes</h3>
<table>
<tr><th>Exception</th><th>Quand ?</th></tr>
<tr><td><code>FormatException</code></td><td><code>int.Parse("abc")</code> : texte au mauvais format</td></tr>
<tr><td><code>NullReferenceException</code></td><td>Utiliser une variable null (vu en 4.6)</td></tr>
<tr><td><code>ArgumentException</code></td><td>Une méthode reçoit un argument invalide</td></tr>
<tr><td><code>InvalidOperationException</code></td><td>L'opération n'a pas de sens dans l'état actuel</td></tr>
<tr><td><code>IndexOutOfRangeException</code></td><td>Index hors du tableau : <code>t[10]</code> sur 3 cases</td></tr>
<tr><td><code>DivideByZeroException</code></td><td>Division entière par zéro</td></tr>
<tr><td><code>FileNotFoundException</code></td><td>Fichier introuvable (chapitre 6)</td></tr>
</table>

<h3>Lire le message et la stack trace</h3>
<p>Une exception porte un <code>Message</code> (ce qui s'est passé) et une <code>StackTrace</code> (le chemin des appels). Lis la stack trace de haut en bas : la première ligne de <strong>ton</strong> code indique où chercher, avec le fichier et le numéro de ligne.</p>
<pre class="diagram">
System.FormatException: The input string
'abc' was not in a correct format.
  at System.Int32.Parse(String s)
  at Program.ParseAge(String text)
     in Program.cs:line 12
  at Program.Main()
     in Program.cs:line 3
</pre>
<div class="tip">Ne jamais avaler une exception : un <code>catch { }</code> vide cache le bug, le programme continue dans un état faux et personne ne sait pourquoi. Attrape seulement ce que tu sais gérer, et au minimum affiche ou journalise l'erreur.</div>
<div class="note">Pour une saisie utilisateur, <code>int.TryParse</code> reste meilleur que <code>try/catch</code> autour de <code>int.Parse</code> : une saisie invalide est un cas normal, pas exceptionnel. Garde les exceptions pour l'imprévu.</div>`,
  examples: [
    {
      title: "Un premier try/catch",
      code: `string[] inputs = ["42", "abc", "7"];

foreach (var input in inputs)
{
    try
    {
        int n = int.Parse(input);
        Console.WriteLine($"{input} -> {100 / n}");
    }
    catch (FormatException)
    {
        Console.WriteLine($"{input} -> pas un nombre");
    }
}

Console.WriteLine("Fin du programme");`,
      output: `42 -> 2
abc -> pas un nombre
7 -> 14
Fin du programme`,
      steps: [
        "<code>try { ... }</code> : on entoure le code qui peut échouer.",
        "<code>int.Parse(input)</code> : avec \"abc\", une <code>FormatException</code> est levée et la ligne suivante est sautée.",
        "<code>catch (FormatException)</code> : on attrape uniquement ce type d'erreur et on affiche un message.",
        "<code>100 / n</code> : division entière, 100 / 42 = 2 et 100 / 7 = 14.",
        "<code>Console.WriteLine(\"Fin du programme\");</code> : grâce au catch, la boucle continue et le programme va jusqu'au bout."
      ]
    },
    {
      title: "Plusieurs catch et finally",
      code: `Divide("10", "2");
Divide("10", "0");
Divide("dix", "2");

void Divide(string a, string b)
{
    try
    {
        int result = int.Parse(a) / int.Parse(b);
        Console.WriteLine($"Résultat : {result}");
    }
    catch (DivideByZeroException)
    {
        Console.WriteLine("Division par zéro");
    }
    catch (FormatException)
    {
        Console.WriteLine("Format invalide");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Erreur imprévue : {ex.GetType().Name}");
    }
    finally
    {
        Console.WriteLine("-- calcul terminé");
    }
}`,
      output: `Résultat : 5
-- calcul terminé
Division par zéro
-- calcul terminé
Format invalide
-- calcul terminé`,
      steps: [
        "<code>catch (DivideByZeroException)</code> : le cas le plus précis en premier.",
        "<code>catch (FormatException)</code> : un autre cas précis, sans lien avec le premier.",
        "<code>catch (Exception ex)</code> : le filet de sécurité général, toujours en dernier. <code>ex.GetType().Name</code> donne le nom du type.",
        "<code>finally</code> : s'affiche trois fois, que le calcul réussisse ou échoue."
      ],
      explain: "Si tu mets catch (Exception) en premier, le compilateur refuse : les catch suivants seraient inatteignables."
    },
    {
      title: "Un filtre when",
      code: `int[] stock = [3, 0, 5];

// Bug volontaire : <= au lieu de <
for (int i = 0; i <= stock.Length; i++)
{
    try
    {
        Console.WriteLine($"Case {i} : {10 / stock[i]}");
    }
    catch (Exception ex) when (ex is DivideByZeroException || ex is IndexOutOfRangeException)
    {
        Console.WriteLine($"Case {i} : erreur {ex.GetType().Name}");
    }
}`,
      output: `Case 0 : 3
Case 1 : erreur DivideByZeroException
Case 2 : 2
Case 3 : erreur IndexOutOfRangeException`,
      steps: [
        "<code>i &lt;= stock.Length</code> : la boucle va jusqu'à l'index 3, qui n'existe pas (cases 0 à 2).",
        "<code>10 / stock[i]</code> : 10 / 3 = 3, puis division par 0 à l'index 1, puis 10 / 5 = 2.",
        "<code>when (ex is ... || ex is ...)</code> : le filtre regroupe deux types d'erreur dans un seul catch.",
        "<code>stock[3]</code> : lève une <code>IndexOutOfRangeException</code>, elle aussi acceptée par le filtre.",
        "Toute autre exception ne passerait pas le filtre et remonterait plus haut."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Conversion protégée",
      prompt: `<p>Entoure <code>int.Parse("12a")</code> d'un try/catch qui affiche « Saisie invalide » en cas de <code>FormatException</code>, et ajoute un <code>finally</code> qui affiche « Vérification terminée ».</p>`,
      hint: `<p>L'ordre d'affichage sera : le message du catch, puis celui du finally.</p>`,
      solution: `try
{
    int value = int.Parse("12a");
    Console.WriteLine(value);
}
catch (FormatException)
{
    Console.WriteLine("Saisie invalide");
}
finally
{
    Console.WriteLine("Vérification terminée");
}`
    },
    {
      level: "moyen",
      title: "Accès sécurisé à un tableau",
      prompt: `<p>Écris une méthode <code>string GetTitle(string[] titles, int index)</code> qui renvoie le titre, ou « (aucun livre à cette place) » si l'index est hors limites, en attrapant la bonne exception. Teste avec les index 0 et 5.</p>`,
      hint: `<p>L'exception à attraper est <code>IndexOutOfRangeException</code>. Une vérification <code>if</code> serait encore mieux : essaie les deux versions.</p>`,
      solution: `string[] titles = ["Dune", "Neuromancien"];
Console.WriteLine(GetTitle(titles, 0)); // Dune
Console.WriteLine(GetTitle(titles, 5)); // (aucun livre à cette place)

string GetTitle(string[] all, int index)
{
    try
    {
        return all[index];
    }
    catch (IndexOutOfRangeException)
    {
        return "(aucun livre à cette place)";
    }
}`
    },
    {
      level: "difficile",
      title: "Ordre d'exécution avec return",
      prompt: `<p>Écris une méthode <code>int Compute()</code> qui fait <code>return 1;</code> dans le try et affiche « finally » dans le finally. Affiche le résultat dans le programme. Dans quel ordre s'affichent les lignes ? Puis fais lever une exception dans le try et attrape-la dans le programme principal.</p>`,
      hint: `<p>Le finally s'exécute avant que la valeur soit réellement rendue à l'appelant.</p>`,
      solution: `Console.WriteLine($"Résultat : {Compute(false)}");
// Affiche : finally, puis Résultat : 1

try
{
    Compute(true);
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Attrapée dans le programme : {ex.Message}");
}
// Affiche : finally, puis Attrapée dans le programme : Échec

int Compute(bool fail)
{
    try
    {
        if (fail) throw new InvalidOperationException("Échec");
        return 1;
    }
    finally
    {
        Console.WriteLine("finally");
    }
}`
    }
  ],
  quiz: [
    {
      q: `Que se passe-t-il si aucune méthode n'attrape une exception ?`,
      options: ["Elle est ignorée", "Le programme s'arrête (Unhandled exception)", "Le finally la transforme en avertissement"],
      answer: 1,
      why: `L'exception remonte toute la pile d'appels. Sans catch nulle part, .NET arrête le programme et affiche le message et la stack trace.`
    },
    {
      q: `Dans quel ordre écrire les catch ?`,
      options: ["Du plus général au plus précis", "L'ordre n'a pas d'importance", "Du plus précis au plus général"],
      answer: 2,
      why: `.NET prend le premier catch qui correspond. Si <code>catch (Exception)</code> venait en premier, il attraperait tout et les suivants seraient inutiles (le compilateur le refuse d'ailleurs).`
    },
    {
      q: `Quand le bloc <code>finally</code> s'exécute-t-il ?`,
      options: ["Toujours, avec ou sans exception", "Seulement si une exception a eu lieu", "Seulement si tout s'est bien passé"],
      answer: 0,
      why: `<code>finally</code> est garanti : succès, exception attrapée ou non, et même après un <code>return</code>. C'est pour ça qu'on y met le nettoyage.`
    },
    {
      q: `Pourquoi un <code>catch { }</code> vide est-il dangereux ?`,
      options: ["Il ralentit le programme", "Il cache l'erreur : le bug passe inaperçu", "Il ne compile pas"],
      answer: 1,
      why: `Il compile, mais il « avale » l'erreur : le programme continue dans un état incohérent sans aucune trace. Il faut au minimum journaliser.`
    }
  ],
  project: `<p><strong>Bibliothèque : un menu qui ne plante plus.</strong> Ton menu lit un choix avec <code>int.Parse(Console.ReadLine() ?? "")</code> ? Tape « abc » : crash. Entoure la lecture d'un <code>try/catch (FormatException)</code> qui affiche « Choix invalide, tape un numéro » et réaffiche le menu au lieu de quitter. Ajoute un <code>catch (Exception ex)</code> général autour de l'exécution de l'action choisie, qui affiche <code>ex.Message</code>. Bonus : remplace ensuite le premier try/catch par <code>int.TryParse</code> et compare la lisibilité.</p>`,
  resources: [
    { label: "Exceptions et gestion des exceptions (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/exceptions/" },
    { label: "Instructions try, catch, finally (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/exception-handling-statements" }
  ]
});

// =====================================================================
// 4.8 Lancer et créer ses exceptions
// =====================================================================
window.COURSE.push({
  key: "l-custom-exceptions",
  title: "Lancer et créer ses exceptions",
  summary: "Tu sauras lever une exception, la relancer sans perdre d'information et créer tes propres exceptions métier.",
  objectives: [
    "Lever une exception avec throw et les helpers ThrowIf",
    "Relancer correctement avec throw;",
    "Créer une exception métier",
    "Choisir entre exception et Try-pattern"
  ],
  analogy: `<p>Lever une exception, c'est <strong>tirer le signal d'alarme</strong> dans un train : tu le fais quand la situation est anormale et que tu ne peux pas la régler toi-même. Une exception métier, c'est un signal avec une étiquette précise (« livre déjà emprunté ») au lieu d'une sirène générique : celui qui la reçoit sait tout de suite quoi faire.</p>`,
  lesson: `<h3>throw : lever une exception</h3>
<p>Jusqu'ici, tu as attrapé des exceptions levées par .NET. Tu peux aussi en lever toi-même avec <code>throw new …</code> quand ta méthode reçoit quelque chose qu'elle ne peut pas traiter : <code>throw new ArgumentException("Le titre est vide", nameof(title));</code>. Le deuxième argument indique quel paramètre pose problème. <code>nameof(title)</code> donne le texte <code>"title"</code>, et reste juste si tu renommes la variable.</p>
<p>En JS, tu fais <code>throw new Error("…")</code>. En C#, on choisit le <strong>type</strong> d'exception le plus parlant, parce que l'appelant attrape par type.</p>

<h3>Les helpers ThrowIf</h3>
<p>Vérifier les paramètres est si courant que .NET fournit des raccourcis. Une ligne remplace un <code>if</code> + <code>throw</code> :</p>
<ul>
<li><code>ArgumentNullException.ThrowIfNull(book);</code> : lève une <code>ArgumentNullException</code> si <code>book</code> est null.</li>
<li><code>ArgumentOutOfRangeException.ThrowIfNegative(quantity);</code> : lève si le nombre est négatif. Il existe aussi <code>ThrowIfZero</code>, <code>ThrowIfGreaterThan</code>…</li>
<li><code>ArgumentException.ThrowIfNullOrEmpty(title);</code> : pour les chaînes vides.</li>
</ul>
<p>Le nom du paramètre est rempli automatiquement dans <code>ex.ParamName</code>. Ces vérifications au début d'une méthode s'appellent des <strong>clauses de garde</strong>.</p>

<h3>throw; contre throw ex;</h3>
<p>Parfois, tu attrapes une exception pour journaliser, puis tu veux la laisser continuer sa route. Écris <code>throw;</code> tout seul : l'exception repart <strong>intacte</strong>, avec sa stack trace d'origine. Écrire <code>throw ex;</code> la relance comme si elle était née dans ton catch : tu perds la ligne exacte du problème.</p>
<div class="compare"><div><h4>throw;</h4><p>Stack trace conservée : on voit la vraie ligne fautive. C'est la bonne façon.</p></div><div><h4>throw ex;</h4><p>Stack trace remise à zéro sur le catch. L'origine est perdue. À éviter.</p></div></div>

<h3>Créer son exception métier</h3>
<p>Quand une règle de ton domaine est violée, crée un type dédié qui hérite de <code>Exception</code>. Par convention, son nom se termine par <code>Exception</code>. Elle transmet le message au constructeur de base avec <code>: base(message)</code> et peut porter des propriétés utiles (le titre du livre, par exemple).</p>
<pre class="diagram">
  Exception
    +-- ArgumentException
    |     +-- ArgumentNullException
    |     +-- ArgumentOutOfRangeException
    +-- InvalidOperationException
    +-- BookNotAvailableException   (la tienne)
</pre>
<p>L'appelant peut alors écrire <code>catch (BookNotAvailableException ex)</code> et réagir précisément, sans confondre avec une autre erreur.</p>

<h3>Exception ou bool ?</h3>
<p>Une exception est faite pour l'<strong>exceptionnel</strong> : un bug, une règle violée, une ressource indisponible. Si l'échec est un cas normal et fréquent (saisie utilisateur, recherche sans résultat), préfère le <strong>Try-pattern</strong> : une méthode <code>bool TryXxx(…, out résultat)</code>, comme <code>int.TryParse</code>, ou un retour nullable comme en 4.6.</p>
<div class="flow"><span>Échec fréquent et attendu ?</span><span>oui : TryXxx / null</span><span>non : throw</span></div>
<p>Côté performance, en une phrase : lever une exception coûte bien plus cher qu'un simple <code>if</code>, donc on ne s'en sert jamais pour le contrôle de flux normal.</p>

<h3>Bonnes pratiques</h3>
<table>
<tr><th>Fais</th><th>Évite</th></tr>
<tr><td>Le type le plus précis (<code>ArgumentNullException</code>)</td><td><code>throw new Exception("…")</code> générique</td></tr>
<tr><td><code>throw;</code> pour relancer</td><td><code>throw ex;</code></td></tr>
<tr><td>Un message clair qui dit quoi et pourquoi</td><td>« Erreur » sans détail</td></tr>
<tr><td>Vérifier les paramètres au début (ThrowIf…)</td><td>Laisser planter plus loin avec une NullReferenceException</td></tr>
<tr><td>Try-pattern pour les échecs attendus</td><td>Exceptions pour piloter la logique normale</td></tr>
</table>
<div class="note">En API, une exception métier non attrapée devient une erreur 500. On les transforme en réponses propres (404, 409…) dans un gestionnaire d'exceptions global : tu le verras dans le module ASP.NET Core.</div>`,
  examples: [
    {
      title: "Clauses de garde avec ThrowIf",
      code: `try { Console.WriteLine(Price(null, 2)); }
catch (ArgumentNullException ex) { Console.WriteLine($"Paramètre manquant : {ex.ParamName}"); }

try { Console.WriteLine(Price("Dune", -1)); }
catch (ArgumentOutOfRangeException ex) { Console.WriteLine($"Valeur invalide : {ex.ParamName}"); }

Console.WriteLine(Price("Dune", 3));

int Price(string? title, int quantity)
{
    ArgumentNullException.ThrowIfNull(title);
    ArgumentOutOfRangeException.ThrowIfNegative(quantity);
    if (title.Length == 0)
        throw new ArgumentException("Le titre est vide", nameof(title));

    return quantity * 12;
}`,
      output: `Paramètre manquant : title
Valeur invalide : quantity
36`,
      steps: [
        "<code>ArgumentNullException.ThrowIfNull(title);</code> : lève si <code>title</code> est null. Après cette ligne, le compilateur sait qu'il ne l'est plus.",
        "<code>ArgumentOutOfRangeException.ThrowIfNegative(quantity);</code> : lève si la quantité est négative.",
        "<code>throw new ArgumentException(\"…\", nameof(title));</code> : un throw manuel pour une règle sans helper.",
        "<code>ex.ParamName</code> : contient automatiquement le nom du paramètre fautif.",
        "<code>Price(\"Dune\", 3)</code> : les gardes passent, on renvoie 3 × 12 = 36."
      ]
    },
    {
      title: "Une exception métier BookNotAvailableException",
      code: `var library = new Library();
library.Borrow("Dune");

try
{
    library.Borrow("Dune");
}
catch (BookNotAvailableException ex)
{
    Console.WriteLine(ex.Message);
    Console.WriteLine($"Titre concerné : {ex.Title}");
}

class Library
{
    private readonly List<string> _borrowed = new();

    public void Borrow(string title)
    {
        if (_borrowed.Contains(title))
            throw new BookNotAvailableException(title);

        _borrowed.Add(title);
        Console.WriteLine($"« {title} » emprunté");
    }
}

class BookNotAvailableException : Exception
{
    public string Title { get; }

    public BookNotAvailableException(string title)
        : base($"Le livre « {title} » est déjà emprunté.")
    {
        Title = title;
    }
}`,
      output: `« Dune » emprunté
Le livre « Dune » est déjà emprunté.
Titre concerné : Dune`,
      steps: [
        "<code>class BookNotAvailableException : Exception</code> : notre exception hérite de <code>Exception</code>.",
        "<code>: base($\"Le livre …\")</code> : on passe le message au constructeur parent, il deviendra <code>ex.Message</code>.",
        "<code>public string Title { get; }</code> : une information en plus, utile à celui qui attrape.",
        "<code>throw new BookNotAvailableException(title);</code> : la règle métier « un livre ne s'emprunte pas deux fois » est violée.",
        "<code>catch (BookNotAvailableException ex)</code> : l'appelant réagit précisément à ce cas."
      ]
    },
    {
      title: "throw; et le Try-pattern",
      code: `try
{
    Process("abc");
}
catch (FormatException ex)
{
    Console.WriteLine($"Le programme a reçu : {ex.GetType().Name}");
}

Console.WriteLine(TryReadQuantity("12", out int q) ? $"OK : {q}" : "Refusé");
Console.WriteLine(TryReadQuantity("-3", out q) ? $"OK : {q}" : "Refusé");

void Process(string input)
{
    try
    {
        int.Parse(input);
    }
    catch (FormatException)
    {
        Console.WriteLine("Log : saisie invalide");
        throw; // relance la même exception, stack trace intacte
    }
}

// Échec attendu : pas d'exception, un bool
bool TryReadQuantity(string input, out int quantity)
{
    return int.TryParse(input, out quantity) && quantity >= 0;
}`,
      output: `Log : saisie invalide
Le programme a reçu : FormatException
OK : 12
Refusé`,
      steps: [
        "<code>catch (FormatException)</code> dans <code>Process</code> : on journalise sans savoir vraiment gérer l'erreur.",
        "<code>throw;</code> : on relance la même exception, qui remonte jusqu'au catch du programme principal.",
        "<code>bool TryReadQuantity(..., out int quantity)</code> : le Try-pattern renvoie <code>true</code>/<code>false</code> au lieu de lever.",
        "<code>TryReadQuantity(\"-3\", out q)</code> : -3 se convertit, mais la règle <code>quantity &gt;= 0</code> échoue, donc <code>Refusé</code>."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Garde sur un âge",
      prompt: `<p>Écris une méthode <code>void SetAge(int age)</code> qui lève une <code>ArgumentOutOfRangeException</code> si l'âge est négatif (avec le helper <code>ThrowIfNegative</code>), sinon affiche l'âge. Appelle-la avec 30 puis -5 dans un try/catch qui affiche <code>ex.ParamName</code>.</p>`,
      hint: `<p><code>ArgumentOutOfRangeException.ThrowIfNegative(age);</code></p>`,
      solution: `try
{
    SetAge(30);
    SetAge(-5);
}
catch (ArgumentOutOfRangeException ex)
{
    Console.WriteLine($"Paramètre invalide : {ex.ParamName}"); // age
}

void SetAge(int age)
{
    ArgumentOutOfRangeException.ThrowIfNegative(age);
    Console.WriteLine($"Âge : {age}");
}`
    },
    {
      level: "moyen",
      title: "Une exception InsufficientFundsException",
      prompt: `<p>Crée une classe <code>Account</code> avec un solde (int) et une méthode <code>Withdraw(int amount)</code>. Si le solde est insuffisant, lève une <code>InsufficientFundsException</code> qui porte le montant manquant dans une propriété <code>Missing</code>. Attrape-la et affiche le message et le manque.</p>`,
      hint: `<p>Le constructeur de l'exception reçoit le manque et appelle <code>: base($"Il manque {missing} €")</code>.</p>`,
      solution: `var account = new Account(50);
try
{
    account.Withdraw(80);
}
catch (InsufficientFundsException ex)
{
    Console.WriteLine(ex.Message);              // Il manque 30 €
    Console.WriteLine($"Manque : {ex.Missing}"); // 30
}

class Account
{
    public int Balance { get; private set; }
    public Account(int balance) { Balance = balance; }

    public void Withdraw(int amount)
    {
        if (amount > Balance)
            throw new InsufficientFundsException(amount - Balance);
        Balance -= amount;
    }
}

class InsufficientFundsException : Exception
{
    public int Missing { get; }
    public InsufficientFundsException(int missing) : base($"Il manque {missing} €")
    {
        Missing = missing;
    }
}`
    },
    {
      level: "difficile",
      title: "Version Try de Withdraw",
      prompt: `<p>Ajoute à <code>Account</code> une méthode <code>bool TryWithdraw(int amount)</code> qui ne lève pas d'exception : elle renvoie <code>false</code> si le solde est insuffisant. Garde <code>Withdraw</code> qui lève, et fais-la s'appuyer sur <code>TryWithdraw</code> pour ne pas dupliquer la règle. Ajoute aussi une garde <code>ThrowIfNegativeOrZero</code> sur le montant.</p>`,
      hint: `<p><code>public void Withdraw(int amount) { if (!TryWithdraw(amount)) throw new InsufficientFundsException(amount - Balance); }</code></p>`,
      solution: `var account = new Account(50);
Console.WriteLine(account.TryWithdraw(80)); // False
Console.WriteLine(account.TryWithdraw(20)); // True
Console.WriteLine(account.Balance);         // 30

try { account.Withdraw(100); }
catch (InsufficientFundsException ex) { Console.WriteLine(ex.Message); } // Il manque 70 €

class Account
{
    public int Balance { get; private set; }
    public Account(int balance) { Balance = balance; }

    public bool TryWithdraw(int amount)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);
        if (amount > Balance) return false;
        Balance -= amount;
        return true;
    }

    public void Withdraw(int amount)
    {
        if (!TryWithdraw(amount))
            throw new InsufficientFundsException(amount - Balance);
    }
}

class InsufficientFundsException : Exception
{
    public int Missing { get; }
    public InsufficientFundsException(int missing) : base($"Il manque {missing} €")
    {
        Missing = missing;
    }
}`
    }
  ],
  quiz: [
    {
      q: `Pour relancer une exception attrapée sans perdre sa stack trace, on écrit…`,
      options: ["<code>throw ex;</code>", "<code>throw new Exception(ex.Message);</code>", "<code>throw;</code>"],
      answer: 2,
      why: `<code>throw;</code> relance l'exception telle quelle. <code>throw ex;</code> remet la stack trace à zéro, et créer une nouvelle exception perd en plus le type d'origine.`
    },
    {
      q: `Une saisie utilisateur peut souvent être invalide. Que préférer ?`,
      options: ["Un Try-pattern qui renvoie un bool", "Lever une exception à chaque erreur", "Un catch vide"],
      answer: 0,
      why: `Une saisie invalide est un cas normal et fréquent : le Try-pattern est plus clair et bien plus rapide. Les exceptions sont pour l'exceptionnel.`
    },
    {
      q: `Une exception métier doit…`,
      options: ["implémenter l'interface IException", "hériter de <code>Exception</code> et finir par « Exception »", "être une struct pour aller plus vite"],
      answer: 1,
      why: `Toutes les exceptions héritent de <code>Exception</code>, et la convention de nommage est le suffixe <code>Exception</code>. IException n'existe pas.`
    }
  ],
  project: `<p><strong>Bibliothèque : refuser un double emprunt.</strong> Crée <code>BookNotAvailableException</code> (avec une propriété <code>Title</code>). Dans la méthode d'emprunt de ta bibliothèque, ajoute une garde <code>ArgumentNullException.ThrowIfNull(book)</code>, puis lève <code>BookNotAvailableException</code> si le livre est déjà prêté (un emprunt avec <code>LoanStatus.Active</code> existe pour lui). Dans le menu, attrape-la et affiche « Désolé : » suivi du message, sans quitter l'application.</p>`,
  resources: [
    { label: "Bonnes pratiques pour les exceptions (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/exceptions/best-practices-for-exceptions" }
  ]
});

// =====================================================================
// 4.9 Mémoire, GC et using
// =====================================================================
window.COURSE.push({
  key: "l-memory-gc",
  title: "Mémoire, GC et using",
  summary: "Tu sauras comment .NET libère la mémoire tout seul et comment fermer proprement fichiers et connexions avec using.",
  objectives: [
    "Comprendre le rôle du garbage collector et des générations",
    "Distinguer mémoire gérée et ressources non gérées",
    "Utiliser using (bloc et déclaration) avec IDisposable",
    "Implémenter IDisposable simplement"
  ],
  analogy: `<p>Le <strong>garbage collector</strong> (GC), c'est le <strong>service de ramassage</strong> de ta ville. Il passe régulièrement et emporte les objets dont plus personne n'a l'adresse. Tu n'as pas à les jeter toi-même.</p>
<p>Mais il ne s'occupe que des déchets ordinaires. Un <strong>fichier ouvert</strong> ou une <strong>connexion</strong>, c'est comme une voiture de location : il faut la rendre toi-même à l'heure, sinon tu bloques les autres. C'est le rôle de <code>using</code>.</p>`,
  lesson: `<h3>Le garbage collector</h3>
<p>Chaque <code>new</code> réserve de la place sur le tas. En C++, il faudrait libérer cette place à la main, avec le risque d'oublier (fuite mémoire) ou de libérer trop tôt (crash). En .NET, comme en JavaScript, un <strong>garbage collector</strong> (ramasse-miettes) s'en charge : il repère les objets que plus aucune variable ne référence et récupère leur mémoire.</p>
<p>Tu n'appelles donc jamais « delete ». Il te suffit de ne plus garder de référence vers un objet pour qu'il devienne éligible au ramassage.</p>

<h3>Le cycle de vie d'un objet</h3>
<div class="flow"><span>new : allocation sur le tas</span><span>utilisé via des références</span><span>plus aucune référence</span><span>le GC récupère la mémoire</span></div>
<p>Le GC ne passe pas immédiatement : il se déclenche quand il le juge utile, en général quand la mémoire allouée récemment se remplit. Tu ne sais donc pas <em>quand</em> un objet sera ramassé, seulement qu'il le sera.</p>

<h3>Les générations 0, 1 et 2</h3>
<p>Constat de base : la plupart des objets meurent jeunes (une chaîne temporaire, un petit objet de calcul). Le GC range donc les objets par âge pour travailler moins.</p>
<pre class="diagram">
  Gen 0 : objets neufs   -&gt; nettoyée très souvent
     | survit à un passage
     v
  Gen 1 : zone tampon    -&gt; nettoyée moins souvent
     | survit encore
     v
  Gen 2 : objets anciens -&gt; nettoyée rarement
          (caches, config, singletons)
</pre>
<p>Nettoyer la génération 0 est très rapide car elle est petite. Un objet qui survit est « promu » à la génération suivante. Résultat : le GC passe son temps sur les objets jeunes et laisse tranquilles ceux qui durent.</p>
<div class="tip">N'appelle pas <code>GC.Collect()</code> dans du vrai code : le GC choisit mieux que toi le bon moment. On l'utilise seulement pour des démonstrations ou des tests très particuliers.</div>

<h3>Les ressources non gérées et IDisposable</h3>
<p>Le GC gère la <strong>mémoire</strong>. Mais certains objets tiennent aussi une ressource du système d'exploitation : un fichier ouvert, une connexion à une base de données, une socket réseau. On les appelle <strong>ressources non gérées</strong>. Elles sont rares et limitées : il faut les rendre dès qu'on a fini, pas « un jour » quand le GC passera.</p>
<p>Les classes qui tiennent de telles ressources implémentent l'interface <code>IDisposable</code>, qui a une seule méthode : <code>Dispose()</code>. L'appeler, c'est dire « j'ai fini, libère la ressource maintenant ».</p>

<h3>using : Dispose garanti</h3>
<p>Le mot-clé <code>using</code> appelle <code>Dispose()</code> pour toi, même si une exception survient. C'est un <code>try/finally</code> écrit automatiquement.</p>
<div class="compare"><div><h4>using bloc</h4><p><code>using (var f = …) { … }</code> : Dispose à l'accolade fermante. Pratique pour une portée courte et visible.</p></div><div><h4>using déclaration</h4><p><code>using var f = …;</code> : Dispose à la fin du bloc qui contient la variable (méthode, boucle…). Moins d'indentation, c'est la forme la plus courante aujourd'hui.</p></div></div>
<p>Pour les objets dont le nettoyage est asynchrone (certaines connexions), on écrit <code>await using</code> : même principe, version async, que tu verras au chapitre 6.</p>

<h3>Implémenter IDisposable simplement</h3>
<p>Si ta classe <em>contient</em> un objet jetable (un <code>StreamWriter</code>, par exemple), elle devient jetable à son tour : implémente <code>IDisposable</code> et, dans <code>Dispose()</code>, appelle le <code>Dispose()</code> de ce que tu possèdes. Rends la méthode sans danger si on l'appelle deux fois, grâce à un booléen <code>_disposed</code>.</p>
<div class="note">Le « pattern Dispose complet » avec finaliseur (<code>~MyClass()</code>) et <code>Dispose(bool)</code> ne sert que si ta classe manipule directement une ressource native. Dans 99 % du code métier, la version simple suffit, et une classe <code>sealed</code> te dispense du reste.</div>`,
  examples: [
    {
      title: "using bloc et using déclaration",
      code: `Console.WriteLine("Début");

using (var file = new FakeFile("notes.txt"))
{
    file.Write("Bonjour");
} // Dispose appelé ici
Console.WriteLine("Après le bloc using");

using var log = new FakeFile("log.txt");
log.Write("Une ligne");
Console.WriteLine("Fin du programme");
// Dispose de log appelé ici, à la fin du programme

sealed class FakeFile : IDisposable
{
    private readonly string _name;
    private bool _disposed;

    public FakeFile(string name)
    {
        _name = name;
        Console.WriteLine($"Ouverture de {_name}");
    }

    public void Write(string text)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        Console.WriteLine($"{_name} <- {text}");
    }

    public void Dispose()
    {
        if (_disposed) return;   // un deuxième appel ne fait rien
        _disposed = true;
        Console.WriteLine($"Fermeture de {_name}");
    }
}`,
      output: `Début
Ouverture de notes.txt
notes.txt <- Bonjour
Fermeture de notes.txt
Après le bloc using
Ouverture de log.txt
log.txt <- Une ligne
Fin du programme
Fermeture de log.txt`,
      steps: [
        "<code>sealed class FakeFile : IDisposable</code> : notre classe simule un fichier et promet une méthode <code>Dispose()</code>.",
        "<code>using (var file = ...) { ... }</code> : à l'accolade fermante, <code>Dispose()</code> est appelé, d'où « Fermeture de notes.txt » avant « Après le bloc using ».",
        "<code>using var log = ...;</code> : la déclaration using libère <code>log</code> à la fin de sa portée, ici la fin du programme.",
        "<code>if (_disposed) return;</code> : appeler <code>Dispose()</code> deux fois ne pose pas de problème.",
        "<code>ObjectDisposedException.ThrowIf(_disposed, this);</code> : écrire dans un fichier déjà fermé lève une exception claire."
      ],
      explain: "Même si Write levait une exception, using garantirait l'appel à Dispose."
    },
    {
      title: "Observer les générations",
      code: `var book = new object();
Console.WriteLine($"Génération : {GC.GetGeneration(book)}");

GC.Collect(); // uniquement pour la démonstration !
Console.WriteLine($"Génération : {GC.GetGeneration(book)}");

GC.Collect();
Console.WriteLine($"Génération : {GC.GetGeneration(book)}");`,
      output: `Génération : 0
Génération : 1
Génération : 2`,
      steps: [
        "<code>new object()</code> : un objet neuf naît en génération 0.",
        "<code>GC.GetGeneration(book)</code> : indique dans quelle génération se trouve l'objet.",
        "<code>GC.Collect();</code> : force un passage du GC. <code>book</code> est encore utilisé, il survit et passe en génération 1.",
        "Deuxième <code>GC.Collect();</code> : il survit encore et rejoint la génération 2, celle des objets durables."
      ],
      explain: "Dans une vraie application, on laisse le GC décider seul : GC.Collect sert ici à rendre visible ce qui se passe."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un chronomètre jetable",
      prompt: `<p>Crée une classe <code>Chrono</code> qui implémente <code>IDisposable</code> : son constructeur affiche « Départ » et son <code>Dispose()</code> affiche « Arrêt ». Utilise-la dans un bloc <code>using</code> qui affiche « Travail en cours ».</p>`,
      hint: `<p>L'ordre attendu est : Départ, Travail en cours, Arrêt.</p>`,
      solution: `using (var timer = new Chrono())
{
    Console.WriteLine("Travail en cours");
}

sealed class Chrono : IDisposable
{
    public Chrono() => Console.WriteLine("Départ");
    public void Dispose() => Console.WriteLine("Arrêt");
}`
    },
    {
      level: "moyen",
      title: "Dispose même en cas d'erreur",
      prompt: `<p>Reprends <code>Chrono</code>. Dans une déclaration <code>using var</code> à l'intérieur d'une méthode <code>Work()</code>, lève une <code>InvalidOperationException</code>. Attrape-la dans le programme principal. Vérifie que « Arrêt » s'affiche bien <strong>avant</strong> le message du catch.</p>`,
      hint: `<p>La portée de <code>using var</code> est la méthode <code>Work</code> : Dispose est appelé quand l'exception en sort.</p>`,
      solution: `try
{
    Work();
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Erreur attrapée : {ex.Message}");
}
// Affiche : Départ, Arrêt, Erreur attrapée : Panne

void Work()
{
    using var timer = new Chrono();
    throw new InvalidOperationException("Panne");
}

sealed class Chrono : IDisposable
{
    public Chrono() => Console.WriteLine("Départ");
    public void Dispose() => Console.WriteLine("Arrêt");
}`
    },
    {
      level: "difficile",
      title: "Une classe qui possède un jetable",
      prompt: `<p>Crée une classe <code>Logger</code> qui possède un <code>FakeFile</code> (reprends celui de l'exemple, simplifié). <code>Logger</code> doit implémenter <code>IDisposable</code> et, dans son <code>Dispose()</code>, libérer son fichier une seule fois. Utilise <code>Logger</code> avec <code>using var</code> et écris deux lignes.</p>`,
      hint: `<p>Un champ <code>private readonly FakeFile _file;</code> créé dans le constructeur, et <code>_file.Dispose()</code> dans <code>Dispose()</code>, protégé par un booléen.</p>`,
      solution: `using var logger = new Logger("app.log");
logger.Log("Démarrage");
logger.Log("Arrêt");

sealed class Logger : IDisposable
{
    private readonly FakeFile _file;
    private bool _disposed;

    public Logger(string path) { _file = new FakeFile(path); }

    public void Log(string message) => _file.Write(message);

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        _file.Dispose(); // on libère ce qu'on possède
    }
}

sealed class FakeFile : IDisposable
{
    private readonly string _name;
    public FakeFile(string name) { _name = name; Console.WriteLine($"Ouverture de {_name}"); }
    public void Write(string text) => Console.WriteLine($"{_name} <- {text}");
    public void Dispose() => Console.WriteLine($"Fermeture de {_name}");
}`
    }
  ],
  quiz: [
    {
      q: `Quand le GC libère-t-il un objet ?`,
      options: ["Dès la fin de la méthode qui l'a créé", "Quand plus aucune référence ne pointe vers lui, au moment qu'il choisit", "Quand on appelle Dispose()"],
      answer: 1,
      why: `Le GC récupère les objets inaccessibles, mais à un moment qu'il décide. <code>Dispose()</code> libère une ressource (fichier, connexion), pas la mémoire de l'objet.`
    },
    {
      q: `Pourquoi la génération 0 est-elle nettoyée très souvent ?`,
      options: ["Parce que la plupart des objets meurent jeunes", "Parce qu'elle contient les objets les plus gros", "Parce que c'est obligatoire en C#"],
      answer: 0,
      why: `Beaucoup d'objets sont temporaires. Nettoyer souvent la petite génération 0 récupère beaucoup de mémoire pour un coût minime.`
    },
    {
      q: `Avec <code>using var f = new FakeFile("a");</code> dans une méthode, quand Dispose est-il appelé ?`,
      options: ["Immédiatement après la ligne", "Jamais, il faut l'appeler soi-même", "À la fin de la méthode (fin de la portée)"],
      answer: 2,
      why: `La déclaration using libère la variable à la fin du bloc qui la contient, même si une exception survient.`
    },
    {
      q: `Quelle classe doit implémenter IDisposable ?`,
      options: ["Toutes les classes", "Celles qui tiennent une ressource comme un fichier ou une connexion", "Seulement les struct"],
      answer: 1,
      why: `La mémoire ordinaire est gérée par le GC. IDisposable sert aux objets qui détiennent une ressource à rendre explicitement.`
    }
  ],
  resources: [
    { label: "Notions de base du garbage collection (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/garbage-collection/fundamentals" },
    { label: "Instruction using (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/using" }
  ]
});
