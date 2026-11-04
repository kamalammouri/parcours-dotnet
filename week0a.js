window.COURSE = window.COURSE || [];

// ───────────────────────── B1 ─────────────────────────
window.COURSE.push({
  day: 1, week: 0,
  title: "Premier programme, variables et types",
  summary: "Installer le SDK, écrire ton premier programme console et comprendre les types de base de C#.",
  objectives: [
    "Créer, compiler et lancer une application console avec la CLI dotnet",
    "Déclarer des variables avec les types primitifs, var et const",
    "Convertir des valeurs (cast, Parse, TryParse, Convert) sans planter",
    "Afficher du texte avec l'interpolation de chaînes"
  ],
  lesson: `
<h3>1. Installer et créer un projet</h3>
<p>Installe le <strong>SDK .NET 10</strong> (pas seulement le runtime), puis vérifie avec <code>dotnet --version</code>. Comme éditeur, prends Visual Studio 2022/2026 (Community, gratuit), JetBrains Rider ou VS Code avec l'extension <em>C# Dev Kit</em>.</p>
<pre><code>dotnet new console -n Hello
cd Hello
dotnet run</code></pre>
<p>La commande crée deux fichiers : <code>Hello.csproj</code> (l'équivalent de <code>package.json</code> : version de .NET, dépendances NuGet) et <code>Program.cs</code> (ton code). <code>dotnet run</code> compile puis exécute. Contrairement à TypeScript qui est transpilé en JavaScript, C# est compilé en <strong>IL</strong> (Intermediate Language), un bytecode que le runtime .NET transforme en code machine au lancement (compilation JIT).</p>

<h3>2. Top-level statements et Main</h3>
<p>Le <code>Program.cs</code> généré contient une seule ligne : <code>Console.WriteLine("Hello, World!");</code>. C'est un <em>top-level statement</em> : le compilateur génère pour toi la classe et la méthode <code>Main</code>, le point d'entrée du programme. Dans du code plus ancien, tu verras la forme complète :</p>
<pre><code>class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Hello, World!");
    }
}</code></pre>
<p>Les deux sont équivalents. Un seul fichier du projet peut contenir des top-level statements.</p>

<h3>3. Lire et écrire dans la console</h3>
<p><code>Console.WriteLine(x)</code> écrit puis passe à la ligne, <code>Console.Write(x)</code> écrit sans retour à la ligne. <code>Console.ReadLine()</code> lit une ligne tapée par l'utilisateur et renvoie un <code>string?</code> : le <code>?</code> signifie que la valeur peut être <code>null</code> (par exemple si l'entrée est fermée). On y reviendra, retiens pour l'instant que le compilateur te prévient quand une valeur peut être nulle.</p>

<h3>4. Variables et types primitifs</h3>
<p>C# est <strong>statiquement typé</strong>, comme TypeScript en mode strict, mais le typage existe aussi à l'exécution : impossible de mettre une chaîne dans un <code>int</code>, même en forçant.</p>
<table>
<thead><tr><th>TypeScript</th><th>C#</th><th>Remarque</th></tr></thead>
<tbody>
<tr><td><code>number</code></td><td><code>int</code>, <code>long</code></td><td>Entiers 32 et 64 bits</td></tr>
<tr><td><code>number</code></td><td><code>double</code></td><td>Virgule flottante, rapide mais imprécis (0.1 + 0.2)</td></tr>
<tr><td><code>number</code></td><td><code>decimal</code></td><td>Précis en base 10 : pour l'argent (suffixe <code>m</code>)</td></tr>
<tr><td><code>boolean</code></td><td><code>bool</code></td><td><code>true</code> / <code>false</code></td></tr>
<tr><td>(aucun)</td><td><code>char</code></td><td>Un seul caractère, entre apostrophes : <code>'A'</code></td></tr>
<tr><td><code>string</code></td><td><code>string</code></td><td>Entre guillemets doubles uniquement</td></tr>
<tr><td><code>let x = 5</code></td><td><code>var x = 5;</code></td><td>Type déduit, mais fixé à la compilation</td></tr>
<tr><td><code>const</code></td><td><code>const</code></td><td>En C#, seulement pour des valeurs connues à la compilation</td></tr>
</tbody>
</table>
<p>Les suffixes indiquent le type d'un littéral : <code>10L</code> (long), <code>3.5</code> (double par défaut), <code>19.99m</code> (decimal), <code>1.5f</code> (float). <code>var</code> n'est <strong>pas</strong> le <code>any</code> de TypeScript : <code>var age = 30;</code> déclare un <code>int</code> et il le restera.</p>

<h3>5. Conversions</h3>
<ul>
<li><strong>Conversion implicite</strong> quand il n'y a pas de perte : <code>int</code> vers <code>long</code> ou vers <code>double</code>.</li>
<li><strong>Cast explicite</strong> quand il peut y avoir une perte : <code>(int)3.9</code> donne <code>3</code> (tronqué, pas arrondi).</li>
<li><strong>Depuis une chaîne</strong> : <code>int.Parse("42")</code> lance une exception si le texte est invalide ; <code>int.TryParse(texte, out int n)</code> renvoie <code>false</code> au lieu de planter. Pour une saisie utilisateur, utilise toujours <code>TryParse</code>.</li>
<li><code>Convert.ToInt32(x)</code> fonctionne sur beaucoup de types et renvoie 0 pour <code>null</code> ; <code>x.ToString()</code> fait le chemin inverse.</li>
</ul>

<h3>6. Opérateurs et chaînes</h3>
<p>Les opérateurs sont ceux de JavaScript, avec une différence majeure : <code>7 / 2</code> vaut <strong>3</strong> car c'est une division entière entre deux <code>int</code>. Écris <code>7 / 2.0</code> ou <code>7.0 / 2</code> pour obtenir 3.5. Le modulo <code>%</code>, <code>++</code>, <code>+=</code>, <code>&amp;&amp;</code>, <code>||</code> et <code>!</code> fonctionnent comme en JS. Il n'y a pas de <code>===</code> : <code>==</code> compare déjà sans conversion implicite surprise.</p>
<p>L'interpolation s'écrit avec un <code>$</code> devant la chaîne : <code>$"Bonjour {name}, tu as {age} ans"</code>. Tu peux formater dans les accolades : <code>{price:C}</code> (monnaie), <code>{ratio:P1}</code> (pourcentage), <code>{value:F2}</code> (2 décimales). Une chaîne verbatim <code>@"C:\\dossier"</code> ignore les séquences d'échappement.</p>

<h3>7. Commentaires</h3>
<p><code>//</code> pour une ligne, <code>/* ... */</code> pour un bloc, et <code>///</code> pour la documentation XML d'une méthode ou d'une classe : l'IDE l'affiche en info-bulle.</p>

<h3>Pièges courants</h3>
<ul>
<li>Oublier le <code>;</code> en fin d'instruction : il est obligatoire en C#.</li>
<li>Utiliser <code>double</code> pour des montants : <code>0.1 + 0.2</code> ne vaut pas exactement <code>0.3</code>. Utilise <code>decimal</code>.</li>
<li>Utiliser des apostrophes pour une chaîne : <code>'abc'</code> ne compile pas, c'est réservé au <code>char</code>.</li>
<li>Appeler <code>int.Parse</code> sur une saisie utilisateur : une faute de frappe et le programme s'arrête.</li>
</ul>

<div class="note">En entreprise, une saisie externe (console, formulaire, fichier, API) n'est jamais fiable. On la valide avec <code>TryParse</code> et on gère le cas d'échec explicitement, plutôt que de laisser une exception arrêter le programme. Et on choisit le type selon le domaine : <code>decimal</code> pour l'argent, <code>int</code> pour un compteur, <code>long</code> pour un identifiant pouvant dépasser 2 milliards.</div>
`,
  examples: [
    {
      title: "Bonjour interactif",
      code: `// Program.cs : top-level statements
Console.Write("Comment t'appelles-tu ? ");
string? name = Console.ReadLine();

// ?? : valeur de repli si name est null
Console.WriteLine($"Bonjour {name ?? "inconnu"} !");`,
      explain: "<code>ReadLine()</code> renvoie <code>string?</code>. L'opérateur <code>??</code> (comme en TypeScript) fournit une valeur par défaut."
    },
    {
      title: "Les types primitifs et leurs pièges",
      code: `int count = 7;
long population = 8_100_000_000L;   // _ pour la lisibilité
double ratio = 0.1 + 0.2;
decimal price = 0.1m + 0.2m;
bool isActive = true;
char grade = 'A';
var city = "Lyon";                  // déduit : string

Console.WriteLine(count / 2);       // 3 : division entière
Console.WriteLine(count / 2.0);     // 3.5
Console.WriteLine(ratio == 0.3);    // False !
Console.WriteLine(price == 0.3m);   // True
Console.WriteLine($"Population mondiale : {population:N0}, ville : {city}");
Console.WriteLine($"{grade} {isActive}");`,
      explain: "Exécute-le et observe les deux surprises : la division entière et l'imprécision de <code>double</code>."
    },
    {
      title: "Convertir une saisie sans planter",
      code: `Console.Write("Ton âge : ");
string? input = Console.ReadLine();

if (int.TryParse(input, out int age))
{
    Console.WriteLine($"Dans 10 ans, tu auras {age + 10} ans.");
}
else
{
    Console.WriteLine($"\\"{input}\\" n'est pas un nombre valide.");
}

// Cast explicite : tronque, n'arrondit pas
double temperature = 21.9;
int rounded = (int)temperature;              // 21
int properlyRounded = (int)Math.Round(temperature); // 22
Console.WriteLine($"{rounded} / {properlyRounded}");`,
      explain: "<code>out int age</code> déclare la variable dans l'appel : elle est remplie si la conversion réussit."
    },
    {
      title: "Formats d'affichage",
      code: `decimal total = 1234.5m;
double rate = 0.1875;
DateTime now = DateTime.Now;

Console.WriteLine($"Total : {total:C}");        // monnaie selon la culture
Console.WriteLine($"Total : {total:F2} EUR");   // 2 décimales
Console.WriteLine($"Taux : {rate:P1}");         // 18,8 %
Console.WriteLine($"Date : {now:dd/MM/yyyy HH:mm}");
Console.WriteLine($"Aligné : [{"abc",8}] [{"abc",-8}]");`,
      explain: "Le format suit la culture de la machine (virgule en français). <code>,8</code> aligne à droite sur 8 caractères."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Convertisseur Celsius vers Fahrenheit",
      prompt: "<p>Demande une température en Celsius, puis affiche-la en Fahrenheit avec une décimale. Formule : <code>F = C × 9 / 5 + 32</code>.</p>",
      hint: "<p>Utilise <code>double.TryParse</code>, et attention : <code>9 / 5</code> entre deux entiers vaut 1.</p>",
      solution: `Console.Write("Température en °C : ");
if (double.TryParse(Console.ReadLine(), out double celsius))
{
    double fahrenheit = celsius * 9.0 / 5.0 + 32;
    Console.WriteLine($"{celsius} °C = {fahrenheit:F1} °F");
}
else
{
    Console.WriteLine("Valeur invalide.");
}`
    },
    {
      level: "moyen",
      title: "Calcul d'une facture",
      prompt: "<p>Demande un prix unitaire HT et une quantité. Affiche le total HT, la TVA (20 %) et le total TTC au format monétaire. Le programme doit afficher un message clair si l'une des saisies est invalide.</p>",
      hint: "<p>Prix en <code>decimal</code> (constante <code>0.20m</code>), quantité en <code>int</code>. Combine les deux <code>TryParse</code> avec <code>&amp;&amp;</code>.</p>",
      solution: `const decimal VatRate = 0.20m;

Console.Write("Prix unitaire HT : ");
string? priceInput = Console.ReadLine();
Console.Write("Quantité : ");
string? quantityInput = Console.ReadLine();

if (decimal.TryParse(priceInput, out decimal unitPrice) &&
    int.TryParse(quantityInput, out int quantity) &&
    quantity > 0)
{
    decimal totalHt = unitPrice * quantity;
    decimal vat = totalHt * VatRate;
    Console.WriteLine($"Total HT  : {totalHt:C}");
    Console.WriteLine($"TVA 20 %  : {vat:C}");
    Console.WriteLine($"Total TTC : {totalHt + vat:C}");
}
else
{
    Console.WriteLine("Saisie invalide : prix décimal et quantité entière positive attendus.");
}`
    },
    {
      level: "difficile",
      title: "Décomposer une durée",
      prompt: "<p>Demande un nombre de secondes (il peut dépasser 2 milliards). Affiche l'équivalent en jours, heures, minutes et secondes, par exemple <code>3 j 04 h 05 min 09 s</code>.</p>",
      hint: "<p>Utilise <code>long</code>, la division entière <code>/</code> et le modulo <code>%</code>. Le format <code>{h:D2}</code> affiche toujours deux chiffres.</p>",
      solution: `Console.Write("Nombre de secondes : ");
if (!long.TryParse(Console.ReadLine(), out long total) || total < 0)
{
    Console.WriteLine("Entier positif attendu.");
    return; // dans les top-level statements, return quitte le programme
}

long days = total / 86_400;
long hours = total % 86_400 / 3_600;
long minutes = total % 3_600 / 60;
long seconds = total % 60;

Console.WriteLine($"{days} j {hours:D2} h {minutes:D2} min {seconds:D2} s");

// Vérification avec la bibliothèque standard
var check = TimeSpan.FromSeconds(total);
Console.WriteLine($"TimeSpan : {check.Days} j {check.Hours:D2}:{check.Minutes:D2}:{check.Seconds:D2}");`
    }
  ],
  project: `<p><strong>Mini-projet Bibliothèque, étape 1.</strong> Crée l'application console <code>dotnet new console -n Library</code>. Le programme demande le titre, l'auteur, l'année de publication et le prix d'un livre, puis affiche une fiche récapitulative :</p>
<pre><code>=== Fiche livre ===
Titre  : Clean Code
Auteur : Robert C. Martin
Année  : 2008 (il y a 18 ans)
Prix   : 32,90 €</code></pre>
<p>Contraintes : l'année est un <code>int</code> validé par <code>TryParse</code>, le prix un <code>decimal</code>. L'âge du livre est calculé avec <code>DateTime.Now.Year</code>.</p>`,
  resources: [
    { label: "Tutoriel : créer une application console .NET", url: "https://learn.microsoft.com/fr-fr/dotnet/core/tutorials/with-visual-studio-code" },
    { label: "Types numériques intégraux", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/integral-numeric-types" },
    { label: "Interpolation de chaînes", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/tokens/interpolated" }
  ]
});

// ───────────────────────── B2 ─────────────────────────
window.COURSE.push({
  day: 2, week: 0,
  title: "Conditions, boucles, méthodes et collections",
  summary: "Contrôler le déroulement du programme, découper le code en méthodes et manipuler tableaux, listes et dictionnaires.",
  objectives: [
    "Écrire des conditions avec if, switch et les switch expressions",
    "Choisir la bonne boucle (for, foreach, while, do/while)",
    "Écrire des méthodes avec paramètres par défaut, nommés, surcharge et out",
    "Utiliser tableaux, List&lt;T&gt; et Dictionary&lt;TKey, TValue&gt;"
  ],
  lesson: `
<h3>1. Conditions</h3>
<p><code>if</code>, <code>else if</code> et <code>else</code> s'écrivent comme en JavaScript, mais la condition doit être un vrai <code>bool</code> : <code>if (count)</code> ne compile pas, il faut écrire <code>if (count &gt; 0)</code>. Pas de valeurs « truthy » ou « falsy ». L'opérateur ternaire <code>condition ? a : b</code> existe aussi.</p>
<p>Le <code>switch</code> classique ressemble à celui de JS, avec une règle stricte : chaque <code>case</code> non vide doit se terminer par <code>break</code> ou <code>return</code>. Il n'y a pas de « fall-through » involontaire. C# moderne propose surtout la <strong>switch expression</strong>, qui renvoie une valeur :</p>
<pre><code>string label = score switch
{
    &gt;= 90 =&gt; "Excellent",
    &gt;= 50 =&gt; "Validé",
    _ =&gt; "À revoir"   // _ = tous les autres cas
};</code></pre>
<p>C'est plus court et le compilateur signale les cas oubliés. Préfère-la dès que chaque branche produit une valeur.</p>

<h3>2. Boucles</h3>
<ul>
<li><code>for (int i = 0; i &lt; 10; i++)</code> quand tu as besoin de l'index.</li>
<li><code>foreach (var item in collection)</code> pour parcourir une collection : c'est le <code>for...of</code> de JavaScript. On ne peut pas modifier la collection (ajout, suppression) pendant un <code>foreach</code>.</li>
<li><code>while (condition)</code> tant que la condition est vraie ; <code>do { } while (condition);</code> exécute au moins une fois, pratique pour un menu.</li>
<li><code>break</code> sort de la boucle, <code>continue</code> passe directement au tour suivant.</li>
</ul>

<h3>3. Méthodes</h3>
<p>Une méthode déclare le type de retour avant son nom (<code>void</code> si elle ne renvoie rien) et le type de chaque paramètre :</p>
<pre><code>static decimal ApplyDiscount(decimal price, decimal rate = 0.10m)
{
    return price * (1 - rate);
}</code></pre>
<p>Une méthode d'une seule expression peut s'écrire avec <code>=&gt;</code> : <code>static int Square(int x) =&gt; x * x;</code>. Par convention, les noms de méthodes sont en <strong>PascalCase</strong> (<code>ApplyDiscount</code>), les variables et paramètres en <strong>camelCase</strong>.</p>
<ul>
<li><strong>Valeurs par défaut</strong> : <code>rate = 0.10m</code> rend le paramètre optionnel.</li>
<li><strong>Paramètres nommés</strong> : <code>ApplyDiscount(price: 100m, rate: 0.2m)</code>, utile pour la lisibilité quand il y a plusieurs paramètres du même type.</li>
<li><strong>Surcharge</strong> : plusieurs méthodes peuvent porter le même nom si leurs paramètres diffèrent (<code>Print(int)</code>, <code>Print(string)</code>). Ce n'est pas possible en TypeScript sans union de types.</li>
<li><strong>out</strong> : un paramètre que la méthode doit remplir, c'est le principe de <code>TryParse</code>. <strong>ref</strong> passe une variable existante par référence pour qu'elle puisse être modifiée. Utilise-les rarement : renvoyer une valeur est presque toujours plus clair.</li>
</ul>
<p>Dans un fichier à top-level statements, les méthodes déclarées en bas du fichier (<em>fonctions locales</em>) sont utilisables partout dans ce fichier.</p>

<h3>4. Collections de base</h3>
<table>
<thead><tr><th>TypeScript</th><th>C#</th><th>Quand l'utiliser</th></tr></thead>
<tbody>
<tr><td><code>number[]</code> (taille fixe)</td><td><code>int[]</code></td><td>Taille connue et figée : <code>new int[5]</code> ou <code>[1, 2, 3]</code></td></tr>
<tr><td><code>Array&lt;string&gt;</code> + <code>push</code></td><td><code>List&lt;string&gt;</code></td><td>Liste qui grandit : <code>Add</code>, <code>Remove</code>, <code>Count</code></td></tr>
<tr><td><code>Map&lt;string, number&gt;</code></td><td><code>Dictionary&lt;string, int&gt;</code></td><td>Recherche rapide par clé</td></tr>
<tr><td><code>arr.length</code></td><td><code>array.Length</code> / <code>list.Count</code></td><td>Attention au nom différent</td></tr>
</tbody>
</table>
<p>Depuis C# 12, on initialise les collections avec des crochets : <code>List&lt;string&gt; names = ["Ana", "Bob"];</code>. Pour un dictionnaire, <code>dict[key]</code> lance une exception si la clé n'existe pas. Utilise <code>dict.TryGetValue(key, out var value)</code> ou <code>dict.ContainsKey(key)</code> pour tester sans risque.</p>

<h3>Pièges courants</h3>
<ul>
<li>Accéder à <code>array[array.Length]</code> : les index vont de 0 à <code>Length - 1</code>, sinon tu obtiens une <code>IndexOutOfRangeException</code>.</li>
<li>Supprimer des éléments d'une liste dans un <code>foreach</code> : <code>InvalidOperationException</code>. Utilise <code>list.RemoveAll(...)</code> ou une boucle <code>for</code> à l'envers.</li>
<li>Comparer des chaînes sans tenir compte de la casse : <code>"Oui" == "oui"</code> vaut <code>false</code>. Utilise <code>string.Equals(a, b, StringComparison.OrdinalIgnoreCase)</code>.</li>
</ul>

<div class="note">Une méthode fait une seule chose et son nom le dit (<code>CalculateTotal</code>, <code>PrintMenu</code>). Si tu dois écrire « et » pour la décrire, découpe-la. Préfère les retours anticipés (<em>guard clauses</em> : <code>if (x is null) return;</code>) aux <code>if</code> imbriqués sur trois niveaux : le code relu en revue reste lisible.</div>
`,
  examples: [
    {
      title: "Switch expression et conditions",
      code: `Console.Write("Note sur 100 : ");
if (!int.TryParse(Console.ReadLine(), out int score) || score < 0 || score > 100)
{
    Console.WriteLine("Note invalide.");
    return;
}

string mention = score switch
{
    >= 90 => "Très bien",
    >= 75 => "Bien",
    >= 50 => "Passable",
    _ => "Insuffisant"
};

Console.WriteLine($"Mention : {mention}");
Console.WriteLine(score >= 50 ? "Admis" : "Ajourné");`,
      explain: "La garde en tête de programme élimine les cas invalides, la suite du code n'a plus à s'en soucier."
    },
    {
      title: "Les quatre boucles",
      code: `string[] fruits = ["pomme", "kiwi", "mangue"];

for (int i = 0; i < fruits.Length; i++)
    Console.WriteLine($"{i + 1}. {fruits[i]}");

foreach (var fruit in fruits)
{
    if (fruit == "kiwi") continue;   // saute le kiwi
    Console.WriteLine(fruit.ToUpper());
}

int n = 1;
while (n < 100) n *= 2;
Console.WriteLine($"Première puissance de 2 >= 100 : {n}");

string? answer;
do
{
    Console.Write("Taper 'q' pour quitter : ");
    answer = Console.ReadLine();
} while (answer != "q");`,
      explain: "<code>do/while</code> garantit au moins un passage : c'est le schéma classique d'un menu console."
    },
    {
      title: "Méthodes : défaut, nommés, surcharge, out",
      code: `Console.WriteLine(ApplyDiscount(100m));              // 90
Console.WriteLine(ApplyDiscount(100m, rate: 0.25m)); // 75
Print(42);
Print("quarante-deux");

if (TryDivide(10, 0, out int result))
    Console.WriteLine(result);
else
    Console.WriteLine("Division par zéro évitée.");

static decimal ApplyDiscount(decimal price, decimal rate = 0.10m) => price * (1 - rate);

static void Print(int value) => Console.WriteLine($"Entier : {value}");
static void Print(string value) => Console.WriteLine($"Texte : {value}");

static bool TryDivide(int a, int b, out int result)
{
    if (b == 0)
    {
        result = 0;      // un paramètre out doit toujours être affecté
        return false;
    }
    result = a / b;
    return true;
}`,
      explain: "Les fonctions locales sont déclarées après le code qui les appelle, c'est autorisé."
    },
    {
      title: "List et Dictionary",
      code: `List<string> tasks = ["Installer le SDK", "Lire le cours"];
tasks.Add("Faire les exercices");
tasks.Remove("Lire le cours");
Console.WriteLine($"{tasks.Count} tâches, la première : {tasks[0]}");

Dictionary<string, int> stock = new()
{
    ["pomme"] = 12,
    ["kiwi"] = 0
};
stock["mangue"] = 5;           // ajoute ou remplace
stock["pomme"] -= 2;

foreach (var (fruit, quantity) in stock)
    Console.WriteLine($"{fruit} : {quantity}");

if (stock.TryGetValue("banane", out int bananas))
    Console.WriteLine($"Bananes : {bananas}");
else
    Console.WriteLine("Pas de bananes en stock.");`,
      explain: "<code>foreach (var (cle, valeur) in dict)</code> déstructure chaque paire, comme <code>for (const [k, v] of map)</code> en TS."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "FizzBuzz",
      prompt: "<p>Affiche les nombres de 1 à 30. Remplace les multiples de 3 par <code>Fizz</code>, ceux de 5 par <code>Buzz</code> et ceux de 3 et 5 par <code>FizzBuzz</code>. Utilise une switch expression.</p>",
      hint: "<p>Une switch expression peut porter sur un tuple : <code>(i % 3, i % 5) switch { (0, 0) =&gt; ... }</code>.</p>",
      solution: `for (int i = 1; i <= 30; i++)
{
    string output = (i % 3, i % 5) switch
    {
        (0, 0) => "FizzBuzz",
        (0, _) => "Fizz",
        (_, 0) => "Buzz",
        _ => i.ToString()
    };
    Console.WriteLine(output);
}`
    },
    {
      level: "moyen",
      title: "Statistiques sur des notes",
      prompt: "<p>Écris une méthode <code>static (double Average, int Min, int Max) Stats(List&lt;int&gt; grades)</code> qui calcule la moyenne, le minimum et le maximum avec une boucle <code>foreach</code> (sans LINQ). Demande des notes à l'utilisateur jusqu'à ce qu'il tape une ligne vide, puis affiche le résultat.</p>",
      hint: "<p>Initialise <code>min</code> à <code>int.MaxValue</code> et <code>max</code> à <code>int.MinValue</code>. Une méthode peut renvoyer un tuple : <code>return (avg, min, max);</code>.</p>",
      solution: `List<int> grades = [];
while (true)
{
    Console.Write("Note (vide pour terminer) : ");
    string? line = Console.ReadLine();
    if (string.IsNullOrWhiteSpace(line)) break;

    if (int.TryParse(line, out int grade) && grade is >= 0 and <= 20)
        grades.Add(grade);
    else
        Console.WriteLine("Note entre 0 et 20 attendue.");
}

if (grades.Count == 0)
{
    Console.WriteLine("Aucune note saisie.");
    return;
}

var (average, min, max) = Stats(grades);
Console.WriteLine($"Moyenne {average:F2}, min {min}, max {max}");

static (double Average, int Min, int Max) Stats(List<int> grades)
{
    int sum = 0, min = int.MaxValue, max = int.MinValue;
    foreach (int g in grades)
    {
        sum += g;
        if (g < min) min = g;
        if (g > max) max = g;
    }
    return ((double)sum / grades.Count, min, max);
}`
    },
    {
      level: "difficile",
      title: "Compteur de mots",
      prompt: "<p>Demande une phrase, puis affiche chaque mot et son nombre d'occurrences, sans tenir compte de la casse ni de la ponctuation (<code>.,;!?</code>). Affiche enfin le mot le plus fréquent.</p>",
      hint: "<p><code>text.Split([' ', '.', ',', ';', '!', '?'], StringSplitOptions.RemoveEmptyEntries)</code> découpe la phrase. Un <code>Dictionary&lt;string, int&gt;</code> compte les occurrences.</p>",
      solution: `Console.Write("Phrase : ");
string text = Console.ReadLine() ?? "";

string[] words = text.ToLowerInvariant()
    .Split([' ', '.', ',', ';', '!', '?'], StringSplitOptions.RemoveEmptyEntries);

Dictionary<string, int> counts = [];
foreach (string word in words)
{
    // TryGetValue renvoie 0 si la clé est absente
    counts.TryGetValue(word, out int current);
    counts[word] = current + 1;
}

string? mostFrequent = null;
int best = 0;
foreach (var (word, count) in counts)
{
    Console.WriteLine($"{word} : {count}");
    if (count > best)
    {
        best = count;
        mostFrequent = word;
    }
}

Console.WriteLine(mostFrequent is null
    ? "Aucun mot."
    : $"Mot le plus fréquent : '{mostFrequent}' ({best} fois)");`
    }
  ],
  project: `<p><strong>Mini-projet Bibliothèque, étape 2.</strong> Le programme gère maintenant une <code>List&lt;string&gt;</code> de titres avec un menu en boucle <code>do/while</code> :</p>
<pre><code>1. Ajouter un livre
2. Lister les livres
3. Rechercher un livre
4. Supprimer un livre
0. Quitter</code></pre>
<p>Chaque option est une méthode (<code>AddBook</code>, <code>ListBooks</code>, etc.). Le choix du menu est traité par un <code>switch</code>. La recherche ignore la casse. Bonus : un <code>Dictionary&lt;string, int&gt;</code> compte le nombre d'exemplaires de chaque titre.</p>`,
  resources: [
    { label: "Instructions de sélection (if, switch)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/selection-statements" },
    { label: "Instructions d'itération (for, foreach, while)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/iteration-statements" },
    { label: "Méthodes en C#", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/methods" }
  ]
});

// ───────────────────────── B3 ─────────────────────────
window.COURSE.push({
  day: 3, week: 0,
  title: "Classes, propriétés et constructeurs",
  summary: "Créer tes propres types avec des classes : champs, propriétés, constructeurs, membres static et visibilité.",
  objectives: [
    "Déclarer une classe avec champs, propriétés et méthodes",
    "Choisir entre get/set, init, private set et propriété calculée",
    "Écrire des constructeurs, les chaîner et utiliser un primary constructor",
    "Organiser le code avec namespaces, using et un fichier par classe"
  ],
  lesson: `
<h3>1. Classe et objet</h3>
<p>Une <strong>classe</strong> est un plan : elle décrit les données et le comportement d'un type. Un <strong>objet</strong> (ou instance) est créé à partir de ce plan avec <code>new</code>. C'est le même principe qu'une classe TypeScript, avec un typage plus strict : impossible d'ajouter une propriété à un objet après coup.</p>
<pre><code>var book = new Book("Clean Code", "Robert C. Martin");
Book other = new("Refactoring", "Martin Fowler"); // type déjà connu</code></pre>

<h3>2. Champs et propriétés</h3>
<p>Un <strong>champ</strong> est une variable de la classe, en général <code>private</code> et nommé <code>_camelCase</code>. Une <strong>propriété</strong> expose une donnée à l'extérieur en contrôlant l'accès : c'est l'équivalent des getters et setters de TypeScript, mais c'est la forme standard en C#. On n'expose jamais un champ public.</p>
<table>
<thead><tr><th>Syntaxe</th><th>Lecture</th><th>Écriture</th></tr></thead>
<tbody>
<tr><td><code>public string Title { get; set; }</code></td><td>partout</td><td>partout</td></tr>
<tr><td><code>public string Title { get; init; }</code></td><td>partout</td><td>seulement à la création</td></tr>
<tr><td><code>public int Stock { get; private set; }</code></td><td>partout</td><td>seulement dans la classe</td></tr>
<tr><td><code>public string Title { get; }</code></td><td>partout</td><td>seulement dans le constructeur</td></tr>
<tr><td><code>public bool IsOld =&gt; Year &lt; 2000;</code></td><td>partout</td><td>calculée, jamais stockée</td></tr>
</tbody>
</table>
<p>Une propriété peut aussi avoir une logique : un <code>set</code> qui valide la valeur avant de la stocker dans un champ. Depuis C# 14, le mot-clé <code>field</code> désigne le champ généré automatiquement, ce qui évite de le déclarer à la main :</p>
<pre><code>public decimal Price
{
    get;
    set =&gt; field = value &gt;= 0 ? value : throw new ArgumentOutOfRangeException(nameof(value));
}</code></pre>
<p>Le modificateur <code>required</code> oblige l'appelant à renseigner une propriété dans l'initialiseur d'objet : <code>new Member { Name = "Ana" }</code> ne compile pas si <code>Name</code> est requis et absent.</p>

<h3>3. Constructeurs</h3>
<p>Le constructeur porte le nom de la classe et n'a pas de type de retour. Il garantit qu'un objet est valide dès sa création. Plusieurs constructeurs peuvent coexister (surcharge) et s'appeler entre eux avec <code>: this(...)</code> pour éviter de dupliquer le code :</p>
<pre><code>public Book(string title, string author) : this(title, author, DateTime.Now.Year) { }</code></pre>
<p>Le <strong>primary constructor</strong> (C# 12) déclare les paramètres directement après le nom de la classe : <code>public class Member(string name, string email)</code>. Ces paramètres sont accessibles dans toute la classe. Attention : ce ne sont pas des propriétés. Pour les exposer, déclare une propriété : <code>public string Name { get; } = name;</code>.</p>

<h3>4. Membres static</h3>
<p>Un membre <code>static</code> appartient à la classe elle-même, pas à une instance : <code>Math.Round(...)</code>, <code>int.Parse(...)</code>. Exemples typiques : un compteur partagé, une méthode utilitaire sans état, une constante. Une <code>static class</code> ne contient que des membres statiques et ne peut pas être instanciée.</p>

<h3>5. Modificateurs d'accès</h3>
<ul>
<li><code>public</code> : accessible partout.</li>
<li><code>private</code> : seulement dans la classe. C'est la valeur par défaut des membres.</li>
<li><code>protected</code> : dans la classe et ses classes dérivées (voir B4).</li>
<li><code>internal</code> : dans le même projet (assembly). C'est la valeur par défaut des classes.</li>
</ul>
<p>Règle : commence par le plus restrictif et n'ouvre que ce qui est nécessaire.</p>

<h3>6. Namespaces, using et fichiers</h3>
<p>Un <strong>namespace</strong> regroupe des types, comme un module. La forme moderne s'écrit en une ligne en haut du fichier : <code>namespace Library.Models;</code>. Pour utiliser un type d'un autre namespace, ajoute <code>using Library.Models;</code> (l'équivalent d'un <code>import</code>). Les projets .NET récents activent les <em>implicit usings</em> : <code>System</code>, <code>System.Collections.Generic</code> et quelques autres sont déjà importés. La convention : <strong>une classe par fichier</strong>, fichier nommé comme la classe (<code>Book.cs</code>), namespace aligné sur les dossiers.</p>

<h3>Pièges courants</h3>
<ul>
<li>Laisser une propriété <code>string</code> sans valeur : avec nullable activé, le compilateur avertit. Initialise-la, rends-la <code>required</code> ou déclare-la <code>string?</code>.</li>
<li>Exposer une <code>List&lt;T&gt;</code> modifiable : n'importe qui peut faire <code>library.Books.Clear()</code>. Expose plutôt un <code>IReadOnlyList&lt;T&gt;</code>.</li>
<li>Croire qu'un paramètre de primary constructor est en lecture seule : il peut être réassigné dans la classe.</li>
</ul>

<div class="note">Un objet ne devrait jamais pouvoir exister dans un état invalide. Valide les données dans le constructeur, limite les setters publics (<code>private set</code>, <code>init</code>) et expose des méthodes métier (<code>Borrow()</code>, <code>Return()</code>) plutôt que des propriétés modifiables de l'extérieur. C'est ce qui distingue un modèle métier d'un simple sac de données.</div>
`,
  examples: [
    {
      title: "Une classe complète",
      code: `var book = new Book("Clean Code", "Robert C. Martin", 2008);
book.Price = 32.90m;
Console.WriteLine(book.Describe());
Console.WriteLine($"Ancien ? {book.IsOld}");

public class Book
{
    public string Title { get; }           // fixé par le constructeur
    public string Author { get; }
    public int Year { get; }
    public decimal Price { get; set; }     // modifiable

    public bool IsOld => Year < 2000;      // propriété calculée

    public Book(string title, string author, int year)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Le titre est obligatoire.", nameof(title));
        Title = title;
        Author = author;
        Year = year;
    }

    public string Describe() => $"{Title} ({Year}) par {Author} - {Price:C}";
}`,
      explain: "Dans un fichier à top-level statements, les classes se déclarent après le code exécuté."
    },
    {
      title: "init, required et private set",
      code: `var member = new Member { Name = "Ana", Email = "ana@example.com" };
member.Borrow();
member.Borrow();
Console.WriteLine($"{member.Name} a {member.BorrowedCount} livres.");
// member.Name = "Bob";       // erreur : init seulement à la création
// member.BorrowedCount = 10; // erreur : private set

public class Member
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public int BorrowedCount { get; private set; }

    public void Borrow()
    {
        if (BorrowedCount >= 3)
            throw new InvalidOperationException("Maximum 3 emprunts.");
        BorrowedCount++;
    }
}`,
      explain: "La règle métier « 3 emprunts maximum » ne peut pas être contournée, car seule la classe modifie le compteur."
    },
    {
      title: "Chaînage de constructeurs et primary constructor",
      code: `var a = new Magazine("Programmez!");
var b = new Magazine("MSDN Mag", 42);
Console.WriteLine($"{a.Title} n°{a.Issue} / {b.Title} n°{b.Issue}");

var greeter = new Greeter("Bonjour");
Console.WriteLine(greeter.Greet("Kamal"));

public class Magazine
{
    public string Title { get; }
    public int Issue { get; }

    public Magazine(string title) : this(title, 1) { }  // délègue

    public Magazine(string title, int issue)
    {
        Title = title;
        Issue = issue;
    }
}

// Primary constructor : le paramètre est visible dans toute la classe
public class Greeter(string greeting)
{
    public string Greeting { get; } = greeting;   // exposé en propriété
    public string Greet(string name) => $"{greeting}, {name} !";
}`,
      explain: "Le constructeur à un paramètre délègue au constructeur complet : la logique d'initialisation n'existe qu'une fois."
    },
    {
      title: "Membres static",
      code: `var t1 = new Ticket();
var t2 = new Ticket();
Console.WriteLine($"{t1.Number} {t2.Number} / total : {Ticket.Created}");
Console.WriteLine(PriceHelper.WithVat(100m));

public class Ticket
{
    public static int Created { get; private set; }   // partagé par toutes les instances
    public int Number { get; }

    public Ticket()
    {
        Created++;
        Number = Created;
    }
}

public static class PriceHelper
{
    public const decimal VatRate = 0.20m;
    public static decimal WithVat(decimal price) => price * (1 + VatRate);
}`,
      explain: "<code>Ticket.Created</code> s'appelle sur la classe, <code>t1.Number</code> sur une instance."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Classe Rectangle",
      prompt: "<p>Crée une classe <code>Rectangle</code> avec <code>Width</code> et <code>Height</code> (lecture seule, fixées par le constructeur) et deux propriétés calculées <code>Area</code> et <code>Perimeter</code>. Le constructeur refuse les dimensions négatives ou nulles.</p>",
      hint: "<p>Propriétés <code>{ get; }</code>, propriétés calculées avec <code>=&gt;</code>, et <code>throw new ArgumentOutOfRangeException(...)</code>.</p>",
      solution: `var r = new Rectangle(4, 2.5);
Console.WriteLine($"Aire {r.Area}, périmètre {r.Perimeter}");

public class Rectangle
{
    public double Width { get; }
    public double Height { get; }
    public double Area => Width * Height;
    public double Perimeter => 2 * (Width + Height);

    public Rectangle(double width, double height)
    {
        if (width <= 0) throw new ArgumentOutOfRangeException(nameof(width));
        if (height <= 0) throw new ArgumentOutOfRangeException(nameof(height));
        Width = width;
        Height = height;
    }
}`
    },
    {
      level: "moyen",
      title: "Compte bancaire",
      prompt: "<p>Crée une classe <code>BankAccount</code> avec <code>Owner</code> (init), <code>Balance</code> (private set), et les méthodes <code>Deposit(decimal)</code> et <code>Withdraw(decimal)</code>. Interdis les montants négatifs ou nuls et le découvert. Ajoute un numéro de compte généré automatiquement grâce à un compteur static.</p>",
      hint: "<p>Le compteur static s'incrémente dans le constructeur. <code>Withdraw</code> peut renvoyer un <code>bool</code> ou lever une <code>InvalidOperationException</code>.</p>",
      solution: `var account = new BankAccount { Owner = "Ana" };
account.Deposit(100m);
account.Withdraw(30m);
Console.WriteLine($"{account.Number} {account.Owner} : {account.Balance:C}");

try { account.Withdraw(500m); }
catch (InvalidOperationException ex) { Console.WriteLine(ex.Message); }

public class BankAccount
{
    private static int _nextNumber = 1000;

    public string Number { get; }
    public required string Owner { get; init; }
    public decimal Balance { get; private set; }

    public BankAccount()
    {
        Number = $"FR-{_nextNumber++}";
    }

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Montant positif attendu.");
        Balance += amount;
    }

    public void Withdraw(decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount), "Montant positif attendu.");
        if (amount > Balance) throw new InvalidOperationException("Solde insuffisant.");
        Balance -= amount;
    }
}`
    },
    {
      level: "difficile",
      title: "Panier d'achat encapsulé",
      prompt: "<p>Crée une classe <code>CartLine</code> (produit, prix unitaire, quantité, total calculé) et une classe <code>Cart</code> qui contient une liste privée de lignes. <code>Cart</code> expose <code>Lines</code> en lecture seule (<code>IReadOnlyList&lt;CartLine&gt;</code>), une méthode <code>Add(product, price, quantity)</code> qui augmente la quantité si le produit est déjà présent, <code>Remove(product)</code> et une propriété <code>Total</code>.</p>",
      hint: "<p>Dans <code>CartLine</code>, la quantité a un <code>private set</code> et une méthode <code>Increase(int)</code>. Pour retrouver une ligne, une boucle <code>foreach</code> suffit (LINQ viendra plus tard).</p>",
      solution: `var cart = new Cart();
cart.Add("Clavier", 49.90m, 1);
cart.Add("Souris", 19.90m, 2);
cart.Add("Clavier", 49.90m, 1);   // quantité passe à 2
cart.Remove("Souris");

foreach (var line in cart.Lines)
    Console.WriteLine($"{line.Product} x{line.Quantity} = {line.Total:C}");
Console.WriteLine($"Total : {cart.Total:C}");

public class CartLine(string product, decimal unitPrice, int quantity)
{
    public string Product { get; } = product;
    public decimal UnitPrice { get; } = unitPrice;
    public int Quantity { get; private set; } = quantity;
    public decimal Total => UnitPrice * Quantity;

    public void Increase(int amount) => Quantity += amount;
}

public class Cart
{
    private readonly List<CartLine> _lines = [];

    public IReadOnlyList<CartLine> Lines => _lines;

    public decimal Total
    {
        get
        {
            decimal total = 0;
            foreach (var line in _lines) total += line.Total;
            return total;
        }
    }

    public void Add(string product, decimal unitPrice, int quantity)
    {
        if (quantity <= 0) throw new ArgumentOutOfRangeException(nameof(quantity));
        var existing = Find(product);
        if (existing is not null)
            existing.Increase(quantity);
        else
            _lines.Add(new CartLine(product, unitPrice, quantity));
    }

    public bool Remove(string product)
    {
        var line = Find(product);
        return line is not null && _lines.Remove(line);
    }

    private CartLine? Find(string product)
    {
        foreach (var line in _lines)
            if (string.Equals(line.Product, product, StringComparison.OrdinalIgnoreCase))
                return line;
        return null;
    }
}`
    }
  ],
  project: `<p><strong>Mini-projet Bibliothèque, étape 3.</strong> Remplace la liste de chaînes par de vraies classes, chacune dans son fichier, dans un dossier <code>Models</code> avec <code>namespace Library.Models;</code> :</p>
<ul>
<li><code>Book</code> : <code>Isbn</code>, <code>Title</code>, <code>Author</code>, <code>Year</code> (init ou lecture seule), <code>IsAvailable</code> (private set), méthodes <code>Borrow()</code> et <code>GiveBack()</code> qui refusent une opération impossible.</li>
<li><code>Member</code> : <code>Id</code> généré par un compteur static, <code>Name</code> (required), liste privée des livres empruntés exposée en <code>IReadOnlyList&lt;Book&gt;</code>, 3 emprunts maximum.</li>
<li><code>LibraryCatalog</code> : contient les livres et les membres, avec <code>AddBook</code>, <code>FindByIsbn</code>, <code>Lend(isbn, memberId)</code>.</li>
</ul>
<p>Le menu de l'étape 2 appelle maintenant ces classes au lieu de manipuler des chaînes.</p>`,
  resources: [
    { label: "Classes en C#", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/types/classes" },
    { label: "Propriétés", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/properties" },
    { label: "Modificateurs d'accès", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/access-modifiers" }
  ]
});

// ───────────────────────── B4 ─────────────────────────
window.COURSE.push({
  day: 4, week: 0,
  title: "POO : encapsulation, héritage et classes abstraites",
  summary: "Les piliers de la programmation orientée objet, avec l'encapsulation et l'héritage en détail.",
  objectives: [
    "Expliquer les quatre piliers de la POO avec tes propres mots",
    "Protéger les invariants d'une classe par l'encapsulation",
    "Créer une hiérarchie avec virtual, override, base et sealed",
    "Utiliser une classe abstraite et redéfinir ToString, Equals et GetHashCode"
  ],
  lesson: `
<h3>1. Les quatre piliers en bref</h3>
<ul>
<li><strong>Encapsulation</strong> : cacher l'état interne et n'exposer que des opérations sûres.</li>
<li><strong>Héritage</strong> : une classe dérivée reprend les membres d'une classe de base et peut les spécialiser.</li>
<li><strong>Polymorphisme</strong> : manipuler des objets différents via un type commun, chacun réagissant à sa façon (détaillé en B5).</li>
<li><strong>Abstraction</strong> : décrire <em>ce que</em> fait un objet sans imposer <em>comment</em> (classes abstraites, interfaces).</li>
</ul>

<h3>2. L'encapsulation en détail</h3>
<p>Un <strong>invariant</strong> est une règle toujours vraie pour un objet : un solde jamais négatif, une quantité toujours positive, un e-mail toujours renseigné. L'encapsulation sert à rendre ces règles impossibles à violer :</p>
<ul>
<li>les données sont <code>private</code> ou en <code>private set</code> ;</li>
<li>le constructeur refuse les valeurs invalides ;</li>
<li>les modifications passent par des méthodes qui vérifient les règles (<code>Withdraw</code>, et non <code>Balance = ...</code>).</li>
</ul>
<p>En TypeScript, <code>private</code> n'existe qu'à la compilation : à l'exécution, l'objet JavaScript reste modifiable. En C#, la restriction est appliquée par le runtime. Sans encapsulation, chaque appelant doit connaître et appliquer les règles : la validation est dupliquée partout et finit par être oubliée quelque part.</p>

<h3>3. L'héritage</h3>
<p>On hérite avec <code>:</code> (l'équivalent de <code>extends</code>). C# n'autorise qu'<strong>une seule classe de base</strong>. Le constructeur dérivé appelle celui de la base avec <code>: base(...)</code> :</p>
<pre><code>public class Book : Media
{
    public Book(string title, string author) : base(title) { Author = author; }
}</code></pre>
<table>
<thead><tr><th>TypeScript</th><th>C#</th><th>Rôle</th></tr></thead>
<tbody>
<tr><td><code>extends</code></td><td><code>:</code></td><td>Hériter d'une classe</td></tr>
<tr><td><code>super(...)</code></td><td><code>: base(...)</code></td><td>Appeler le constructeur parent</td></tr>
<tr><td><code>super.method()</code></td><td><code>base.Method()</code></td><td>Appeler la version parente</td></tr>
<tr><td>toute méthode est redéfinissable</td><td><code>virtual</code> + <code>override</code></td><td>Redéfinition explicite et autorisée par la base</td></tr>
<tr><td><code>abstract</code></td><td><code>abstract</code></td><td>Classe non instanciable, méthode sans corps</td></tr>
<tr><td>(aucun)</td><td><code>sealed</code></td><td>Interdit d'hériter ou de redéfinir à nouveau</td></tr>
</tbody>
</table>
<p>Différence majeure avec TypeScript : en C#, une méthode n'est <strong>pas</strong> redéfinissable par défaut. La classe de base doit la marquer <code>virtual</code> et la dérivée doit écrire <code>override</code>. Le mot-clé <code>protected</code> rend un membre visible pour les classes dérivées, mais pas pour le reste du code.</p>

<h3>4. override contre new</h3>
<p>Si une classe dérivée déclare une méthode du même nom sans <code>override</code>, elle la <strong>masque</strong> (le compilateur suggère le mot-clé <code>new</code>). La différence apparaît quand on manipule l'objet via le type de base : avec <code>override</code>, c'est la version dérivée qui s'exécute ; avec <code>new</code>, c'est la version de base. Le masquage est presque toujours une erreur : utilise <code>override</code>.</p>

<h3>5. Classes et méthodes abstraites</h3>
<p>Une classe <code>abstract</code> ne peut pas être instanciée : elle sert de modèle commun. Elle peut contenir du code partagé et des méthodes <code>abstract</code>, sans corps, que chaque classe dérivée <strong>doit</strong> implémenter. Exemple : <code>Media</code> définit <code>Title</code> et une méthode abstraite <code>GetLoanDays()</code> ; un livre se prête 21 jours, un magazine 7.</p>

<h3>6. La classe object</h3>
<p>Tous les types héritent de <code>object</code>, qui fournit trois méthodes virtuelles à connaître :</p>
<ul>
<li><code>ToString()</code> : sa version par défaut affiche le nom du type. Redéfinis-la pour un affichage lisible, utile aussi en débogage.</li>
<li><code>Equals(object?)</code> : pour une classe, compare par défaut les <strong>références</strong>. Deux objets <code>Book</code> avec le même ISBN ne sont pas égaux tant que tu ne redéfinis pas <code>Equals</code>.</li>
<li><code>GetHashCode()</code> : utilisé par <code>Dictionary</code> et <code>HashSet</code>. Si tu redéfinis <code>Equals</code>, tu <strong>dois</strong> redéfinir <code>GetHashCode</code> avec les mêmes champs, sinon les collections se comportent mal.</li>
</ul>
<p>Le jour suivant, tu verras que les <code>record</code> génèrent ces méthodes automatiquement.</p>

<h3>Pièges courants</h3>
<ul>
<li>Oublier <code>virtual</code> dans la base : <code>override</code> ne compile pas.</li>
<li>Appeler une méthode virtuelle dans le constructeur de la base : la version dérivée s'exécute avant que le constructeur dérivé ait initialisé ses champs.</li>
<li>Construire des hiérarchies profondes (5 niveaux) : chaque modification de la base casse les dérivées. Au-delà de deux niveaux, demande-toi si la composition ne serait pas plus simple.</li>
</ul>

<div class="note">« Préférer la composition à l'héritage. » L'héritage exprime une relation « est un » (un livre <em>est un</em> média). S'il s'agit d'une relation « a un » ou « utilise un » (un membre <em>a</em> une adresse), on met un objet en propriété au lieu d'hériter. En revue de code, une classe de base créée uniquement pour partager deux méthodes utilitaires est un signal d'alerte. Et marque <code>sealed</code> les classes qui ne sont pas conçues pour être dérivées.</div>
`,
  examples: [
    {
      title: "Encapsulation et invariant",
      code: `var stock = new StockItem("Câble USB", 10);
stock.Remove(4);
stock.Add(2);
Console.WriteLine($"{stock.Name} : {stock.Quantity}");

try { stock.Remove(50); }
catch (InvalidOperationException ex) { Console.WriteLine(ex.Message); }

public class StockItem
{
    // Invariant : Quantity >= 0, toujours
    public string Name { get; }
    public int Quantity { get; private set; }

    public StockItem(string name, int quantity)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentOutOfRangeException.ThrowIfNegative(quantity);
        Name = name;
        Quantity = quantity;
    }

    public void Add(int amount)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);
        Quantity += amount;
    }

    public void Remove(int amount)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(amount);
        if (amount > Quantity)
            throw new InvalidOperationException($"Stock insuffisant : {Quantity} disponibles.");
        Quantity -= amount;
    }
}`,
      explain: "Les helpers <code>ThrowIfNegative</code> et consorts (.NET 8+) rendent les validations courtes et uniformes."
    },
    {
      title: "Héritage, virtual, override et base",
      code: `var employee = new Employee("Ana", 3000m);
var manager = new Manager("Bob", 4000m, 500m);

Console.WriteLine(employee.Describe());
Console.WriteLine(manager.Describe());

public class Employee
{
    public string Name { get; }
    protected decimal BaseSalary { get; }   // visible par les dérivées

    public Employee(string name, decimal baseSalary)
    {
        Name = name;
        BaseSalary = baseSalary;
    }

    public virtual decimal MonthlyPay() => BaseSalary;
    public string Describe() => $"{Name} : {MonthlyPay():C}";
}

public sealed class Manager : Employee
{
    private readonly decimal _bonus;

    public Manager(string name, decimal baseSalary, decimal bonus) : base(name, baseSalary)
    {
        _bonus = bonus;
    }

    // Réutilise le calcul parent, puis ajoute la prime
    public override decimal MonthlyPay() => base.MonthlyPay() + _bonus;
}`,
      explain: "<code>Describe</code> est écrite une seule fois dans la base et appelle la bonne version de <code>MonthlyPay</code>."
    },
    {
      title: "override contre new",
      code: `Animal a1 = new Dog();
Animal a2 = new Cat();

Console.WriteLine(a1.Speak());   // Wouf : override
Console.WriteLine(a2.Speak());   // ... : new masque, la version de base s'exécute
Console.WriteLine(((Cat)a2).Speak()); // Miaou, seulement via le type Cat

public class Animal
{
    public virtual string Speak() => "...";
}

public class Dog : Animal
{
    public override string Speak() => "Wouf";
}

public class Cat : Animal
{
    public new string Speak() => "Miaou";   // masquage : à éviter
}`,
      explain: "Via une variable de type <code>Animal</code>, seul <code>override</code> donne le comportement attendu."
    },
    {
      title: "Classe abstraite et méthodes d'object",
      code: `Shape[] shapes = [new Circle(1), new Square(2)];
foreach (var shape in shapes)
    Console.WriteLine(shape);   // appelle ToString()

var p1 = new Point(1, 2);
var p2 = new Point(1, 2);
Console.WriteLine(p1 == p2);       // False : références différentes
Console.WriteLine(p1.Equals(p2));  // True : Equals redéfini
var set = new HashSet<Point> { p1, p2 };
Console.WriteLine(set.Count);      // 1 grâce à GetHashCode

public abstract class Shape
{
    public abstract double Area();   // chaque forme doit l'implémenter
    public override string ToString() => $"{GetType().Name} d'aire {Area():F2}";
}

public class Circle(double radius) : Shape
{
    public override double Area() => Math.PI * radius * radius;
}

public class Square(double side) : Shape
{
    public override double Area() => side * side;
}

public class Point(int x, int y)
{
    public int X { get; } = x;
    public int Y { get; } = y;

    public override bool Equals(object? obj) => obj is Point other && X == other.X && Y == other.Y;
    public override int GetHashCode() => HashCode.Combine(X, Y);
}`,
      explain: "<code>new Shape()</code> ne compile pas. <code>HashCode.Combine</code> calcule un hash correct à partir de plusieurs champs."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Véhicules",
      prompt: "<p>Crée une classe <code>Vehicle</code> avec <code>Brand</code> et une méthode virtuelle <code>Describe()</code>. Crée <code>Car</code> (nombre de portes) et <code>Motorcycle</code> (avec ou sans side-car) qui redéfinissent <code>Describe()</code> en réutilisant la version de base. Affiche une liste de véhicules.</p>",
      hint: "<p><code>public override string Describe() =&gt; $\"{base.Describe()}, 5 portes\";</code></p>",
      solution: `List<Vehicle> garage = [new Car("Peugeot", 5), new Motorcycle("Ducati", false)];
foreach (var v in garage)
    Console.WriteLine(v.Describe());

public class Vehicle(string brand)
{
    public string Brand { get; } = brand;
    public virtual string Describe() => $"Véhicule {Brand}";
}

public class Car(string brand, int doors) : Vehicle(brand)
{
    public int Doors { get; } = doors;
    public override string Describe() => $"{base.Describe()}, voiture {Doors} portes";
}

public class Motorcycle(string brand, bool hasSidecar) : Vehicle(brand)
{
    public bool HasSidecar { get; } = hasSidecar;
    public override string Describe() =>
        $"{base.Describe()}, moto {(HasSidecar ? "avec" : "sans")} side-car";
}`
    },
    {
      level: "moyen",
      title: "Formes abstraites",
      prompt: "<p>Crée une classe abstraite <code>Shape</code> avec deux méthodes abstraites <code>Area()</code> et <code>Perimeter()</code>, et un <code>ToString()</code> commun. Implémente <code>Rectangle</code>, <code>Circle</code> et <code>Triangle</code> (trois côtés, aire avec la formule de Héron). Le constructeur de <code>Triangle</code> refuse un triangle impossible. Affiche la forme de plus grande aire.</p>",
      hint: "<p>Héron : <code>s = (a + b + c) / 2</code>, aire = <code>Math.Sqrt(s * (s - a) * (s - b) * (s - c))</code>. Un triangle est possible si chaque côté est inférieur à la somme des deux autres.</p>",
      solution: `List<Shape> shapes = [new Rectangle(3, 4), new Circle(2), new Triangle(3, 4, 5)];

Shape largest = shapes[0];
foreach (var shape in shapes)
{
    Console.WriteLine(shape);
    if (shape.Area() > largest.Area()) largest = shape;
}
Console.WriteLine($"La plus grande : {largest.GetType().Name}");

public abstract class Shape
{
    public abstract double Area();
    public abstract double Perimeter();
    public override string ToString() =>
        $"{GetType().Name} : aire {Area():F2}, périmètre {Perimeter():F2}";
}

public class Rectangle(double width, double height) : Shape
{
    public override double Area() => width * height;
    public override double Perimeter() => 2 * (width + height);
}

public class Circle(double radius) : Shape
{
    public override double Area() => Math.PI * radius * radius;
    public override double Perimeter() => 2 * Math.PI * radius;
}

public class Triangle : Shape
{
    private readonly double _a, _b, _c;

    public Triangle(double a, double b, double c)
    {
        if (a <= 0 || b <= 0 || c <= 0 || a >= b + c || b >= a + c || c >= a + b)
            throw new ArgumentException("Ces côtés ne forment pas un triangle.");
        (_a, _b, _c) = (a, b, c);
    }

    public override double Perimeter() => _a + _b + _c;
    public override double Area()
    {
        double s = Perimeter() / 2;
        return Math.Sqrt(s * (s - _a) * (s - _b) * (s - _c));
    }
}`
    },
    {
      level: "difficile",
      title: "Égalité métier d'un produit",
      prompt: "<p>Crée une classe <code>Product</code> identifiée par son <code>Sku</code> (code article, insensible à la casse), avec <code>Name</code> et <code>Price</code>. Deux produits avec le même SKU doivent être considérés égaux, même si le nom ou le prix diffère. Redéfinis <code>Equals</code>, <code>GetHashCode</code>, <code>ToString</code> et les opérateurs <code>==</code> et <code>!=</code>. Prouve que ça marche avec un <code>HashSet&lt;Product&gt;</code> et un <code>Dictionary&lt;Product, int&gt;</code>.</p>",
      hint: "<p>Normalise le SKU dans le constructeur avec <code>ToUpperInvariant()</code>, ou utilise <code>StringComparer.OrdinalIgnoreCase.GetHashCode(Sku)</code>. Les opérateurs : <code>public static bool operator ==(Product? a, Product? b) =&gt; Equals(a, b);</code></p>",
      solution: `var p1 = new Product("abc-001", "Clavier", 49.90m);
var p2 = new Product("ABC-001", "Clavier mécanique", 59.90m);

Console.WriteLine(p1 == p2);          // True : même SKU
Console.WriteLine(p1.Equals(p2));     // True

var set = new HashSet<Product> { p1, p2 };
Console.WriteLine(set.Count);         // 1

var stock = new Dictionary<Product, int> { [p1] = 10 };
Console.WriteLine(stock[p2]);         // 10 : retrouvé via p2
Console.WriteLine(p2);

public sealed class Product
{
    public string Sku { get; }
    public string Name { get; }
    public decimal Price { get; }

    public Product(string sku, string name, decimal price)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(sku);
        ArgumentOutOfRangeException.ThrowIfNegative(price);
        Sku = sku.Trim().ToUpperInvariant();   // normalisé une fois pour toutes
        Name = name;
        Price = price;
    }

    public override bool Equals(object? obj) => obj is Product other && Sku == other.Sku;
    public override int GetHashCode() => Sku.GetHashCode();
    public override string ToString() => $"[{Sku}] {Name} - {Price:C}";

    public static bool operator ==(Product? left, Product? right) => Equals(left, right);
    public static bool operator !=(Product? left, Product? right) => !Equals(left, right);
}`
    }
  ],
  project: `<p><strong>Mini-projet Bibliothèque, étape 4.</strong> La bibliothèque prête aussi des magazines et des DVD. Crée une classe abstraite <code>Media</code> (<code>Id</code>, <code>Title</code>, <code>Year</code>, <code>IsAvailable</code> en private set, <code>Borrow()</code>, <code>GiveBack()</code>) avec une méthode abstraite <code>int LoanDays()</code>.</p>
<ul>
<li><code>Book : Media</code> ajoute <code>Author</code> et <code>Isbn</code>, prêt de 21 jours.</li>
<li><code>Magazine : Media</code> ajoute <code>IssueNumber</code>, prêt de 7 jours.</li>
<li><code>Dvd : Media</code> ajoute <code>DurationMinutes</code>, prêt de 14 jours.</li>
</ul>
<p>Chaque classe redéfinit <code>ToString()</code>. Deux médias sont égaux s'ils ont le même <code>Id</code> (redéfinis <code>Equals</code> et <code>GetHashCode</code> dans <code>Media</code>). Le catalogue stocke une seule <code>List&lt;Media&gt;</code>, et l'option « Emprunter » affiche la date de retour prévue calculée avec <code>LoanDays()</code>.</p>`,
  resources: [
    { label: "Programmation orientée objet en C#", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/tutorials/oop" },
    { label: "Héritage en C#", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/object-oriented/inheritance" },
    { label: "Classes abstraites et sealed", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/abstract-and-sealed-classes-and-class-members" }
  ]
});
