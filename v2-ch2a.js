window.COURSE = window.COURSE || [];

/* ===================== 2.1 Variables et nombres ===================== */
window.COURSE.push({
  key: "l-variables-numbers",
  title: "2.1 Variables et nombres",
  summary: "Tu sauras déclarer des variables typées et choisir le bon type de nombre (int, long, double, decimal) sans tomber dans les pièges de calcul.",
  objectives: [
    "Déclarer une variable et lui affecter une valeur",
    "Choisir entre int, long, double, float et decimal",
    "Éviter le piège de la division entière",
    "Utiliser decimal pour manipuler de l'argent"
  ],
  analogy: `<p>Imagine un déménagement. Chaque carton porte une étiquette : « livres », « vaisselle », « vêtements ». Tu ne ranges pas une assiette dans le carton « livres ».</p>
<p>En C#, une variable est ce carton : elle a un <strong>nom</strong> (l'étiquette), un <strong>type</strong> (ce qu'elle a le droit de contenir) et une <strong>valeur</strong> (ce qu'il y a dedans). Le type est écrit une fois pour toutes, et le compilateur vérifie que tu le respectes.</p>`,
  lesson: `<h3>Une variable, c'est une boîte typée</h3>
<p>Une <strong>variable</strong> est un nom qui désigne une valeur en mémoire. En C#, on écrit d'abord le type, puis le nom, puis éventuellement la valeur : <code>int year = 1943;</code>. Le point-virgule termine l'instruction, il est obligatoire.</p>
<p>On peut <strong>déclarer</strong> (créer la boîte) et <strong>affecter</strong> (mettre une valeur) en deux temps : <code>int pages;</code> puis <code>pages = 96;</code>. Ensuite, on peut changer la valeur autant de fois qu'on veut, mais jamais le type.</p>
<div class="flow"><span>Type : int</span><span>Nom : year</span><span>Valeur : 1943</span></div>

<h3>Typage statique : la différence avec TypeScript</h3>
<p>En TypeScript, les types disparaissent après la compilation : à l'exécution, c'est du JavaScript sans types. En C#, le type <strong>reste</strong> jusqu'à l'exécution. C'est ce qu'on appelle le <strong>typage statique</strong> : chaque variable a un type fixé dès l'écriture du code.</p>
<div class="compare"><div><h4>TypeScript</h4><p><code>let year: number = 1943;</code><br>Un seul type <code>number</code> pour tous les nombres. Le type est une aide, contournable avec <code>any</code>.</p></div><div><h4>C#</h4><p><code>int year = 1943;</code><br>Plusieurs types de nombres selon le besoin. Écrire <code>year = "abc";</code> ne compile pas, point final.</p></div></div>

<h3>Les types de nombres</h3>
<p>TypeScript n'a qu'un type <code>number</code>. C# en propose plusieurs, car chacun a une taille et une précision différentes.</p>
<table>
<tr><th>Type</th><th>Taille</th><th>Plage (environ)</th><th>Usage</th></tr>
<tr><td><code>int</code></td><td>4 octets</td><td>± 2,1 milliards</td><td>Le choix par défaut pour les entiers : âges, quantités, années</td></tr>
<tr><td><code>long</code></td><td>8 octets</td><td>± 9,2 × 10<sup>18</sup></td><td>Très grands entiers : population mondiale, tailles de fichiers</td></tr>
<tr><td><code>double</code></td><td>8 octets</td><td>± 10<sup>308</sup>, 15-16 chiffres</td><td>Nombres à virgule « scientifiques » : mesures, distances</td></tr>
<tr><td><code>float</code></td><td>4 octets</td><td>± 10<sup>38</sup>, 6-9 chiffres</td><td>Rare en gestion : jeux vidéo, graphisme</td></tr>
<tr><td><code>decimal</code></td><td>16 octets</td><td>28-29 chiffres exacts</td><td>L'argent et tout calcul qui doit tomber juste</td></tr>
</table>
<p>Les <strong>littéraux</strong> (valeurs écrites en dur) ont des suffixes : <code>3.5</code> est un <code>double</code>, <code>3.5m</code> un <code>decimal</code>, <code>2.5f</code> un <code>float</code>. Le tiret bas sert de séparateur lisible : <code>1_000_000</code> vaut un million.</p>

<h3>Les opérateurs et le piège de la division</h3>
<p>Les opérateurs sont ceux que tu connais : <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code> et <code>%</code> (le reste de la division). Mais attention : quand les deux nombres sont des entiers, <code>/</code> fait une <strong>division entière</strong>. Le résultat est un entier, la partie après la virgule est jetée.</p>
<pre class="diagram">7 / 2    -&gt; 3     (int / int = int)
7 % 2    -&gt; 1     (le reste)
7 / 2.0  -&gt; 3.5   (int / double = double)
7.0 / 2  -&gt; 3.5</pre>
<div class="tip">En JavaScript, <code>7 / 2</code> vaut <code>3.5</code>. En C#, <code>7 / 2</code> vaut <code>3</code>. Si tu veux un résultat à virgule, au moins un des deux nombres doit être à virgule.</div>
<p>Si un calcul dépasse la plage d'un type, on parle de <strong>dépassement</strong> (overflow) : par défaut, un <code>int</code> trop grand « fait le tour » et devient négatif, sans erreur. D'où l'intérêt de <code>long</code> pour les très grandes valeurs.</p>

<h3>decimal pour l'argent</h3>
<p>Le type <code>double</code> stocke les nombres en binaire. Certaines valeurs simples comme 0,1 ne peuvent pas être représentées exactement, comme 1/3 ne s'écrit pas exactement en décimal (0,3333…). Résultat : <code>0.1 + 0.2</code> donne <code>0.30000000000000004</code>, exactement comme en JavaScript.</p>
<p>Le type <code>decimal</code> calcule en base 10 : <code>0.1m + 0.2m</code> donne bien <code>0.3</code>. Il est un peu plus lent, mais pour un prix ou un solde, l'exactitude passe avant tout.</p>

<h3>Raccourcis d'écriture</h3>
<p><code>count++</code> ajoute 1, <code>count--</code> retire 1. <code>total += 5</code> est la forme courte de <code>total = total + 5</code> ; il existe aussi <code>-=</code>, <code>*=</code> et <code>/=</code>. C'est identique à JavaScript.</p>
<div class="note">En entreprise, la règle est simple : <code>int</code> pour compter, <code>decimal</code> pour l'argent, <code>double</code> pour mesurer. Un montant stocké en <code>double</code> finit toujours par créer un centime d'écart dans une facture.</div>`,
  examples: [
    {
      title: "Les variables d'un livre",
      code: `// Une fiche de livre avec des variables typées
string title = "Le Petit Prince";
int year = 1943;
int pages;          // déclaration seule
pages = 96;         // affectation plus tard

Console.WriteLine(title);
Console.WriteLine(year);

pages = pages + 4;  // on change la valeur, pas le type
Console.WriteLine(pages);`,
      output: `Le Petit Prince
1943
100`,
      steps: [
        "<code>string title = \"Le Petit Prince\";</code> : on crée une boîte de type texte et on y met le titre.",
        "<code>int year = 1943;</code> : une boîte de type entier pour l'année.",
        "<code>int pages;</code> puis <code>pages = 96;</code> : déclaration d'abord, affectation ensuite. Les deux formes sont valides.",
        "<code>Console.WriteLine(title);</code> : affiche la valeur de la variable, suivie d'un retour à la ligne.",
        "<code>pages = pages + 4;</code> : on lit l'ancienne valeur (96), on ajoute 4 et on range le résultat (100) dans la même boîte."
      ],
      explain: "Une variable peut changer de valeur autant de fois que tu veux, mais son type reste celui de la déclaration."
    },
    {
      title: "Division entière et reste",
      code: `using System.Globalization;

// Affichage des nombres à virgule avec un point, quelle que soit la langue du PC
CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

int a = 7;
int b = 2;

Console.WriteLine(a / b);    // int / int : division entière
Console.WriteLine(a % b);    // le reste
Console.WriteLine(a / 2.0);  // un double dans le calcul : vraie division
Console.WriteLine(7.0 / 2);

int max = int.MaxValue;
Console.WriteLine(max);
Console.WriteLine(max + 1);  // dépassement : on fait le tour`,
      output: `3
1
3.5
3.5
2147483647
-2147483648`,
      steps: [
        "<code>CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;</code> : sur un PC en français, <code>3.5</code> s'afficherait <code>3,5</code>. Cette ligne fixe un affichage neutre avec un point.",
        "<code>a / b</code> : deux <code>int</code>, donc division entière. 7 / 2 donne 3, la partie 0,5 est jetée.",
        "<code>a % b</code> : le reste de la division de 7 par 2, soit 1.",
        "<code>a / 2.0</code> : <code>2.0</code> est un <code>double</code>, le calcul se fait donc en <code>double</code> et donne 3.5.",
        "<code>int.MaxValue</code> : la plus grande valeur possible d'un <code>int</code>.",
        "<code>max + 1</code> : on dépasse la plage, la valeur repart du plus petit <code>int</code>, sans aucune erreur."
      ],
      explain: "Retiens le réflexe : dès que tu divises deux entiers, demande-toi si tu veux vraiment perdre la virgule."
    },
    {
      title: "decimal pour l'argent, ++ et +=",
      code: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

double d = 0.1 + 0.2;
decimal m = 0.1m + 0.2m;
Console.WriteLine(d);
Console.WriteLine(m);

decimal price = 12.50m;
int quantity = 3;
decimal total = price * quantity;
Console.WriteLine(total);

int borrowed = 0;
borrowed++;        // +1
borrowed += 10;    // +10
Console.WriteLine(borrowed);

long readers = 8_000_000_000;
Console.WriteLine(readers);`,
      output: `0.30000000000000004
0.3
37.50
11
8000000000`,
      steps: [
        "<code>double d = 0.1 + 0.2;</code> : en binaire, 0,1 et 0,2 ne sont pas exacts, d'où la petite erreur affichée.",
        "<code>decimal m = 0.1m + 0.2m;</code> : le suffixe <code>m</code> crée des <code>decimal</code>, le calcul tombe juste.",
        "<code>decimal total = price * quantity;</code> : un <code>decimal</code> multiplié par un <code>int</code> donne un <code>decimal</code>. Le <code>decimal</code> garde ses deux chiffres après la virgule : <code>37.50</code>.",
        "<code>borrowed++;</code> puis <code>borrowed += 10;</code> : 0 devient 1, puis 11.",
        "<code>long readers = 8_000_000_000;</code> : 8 milliards ne tient pas dans un <code>int</code>, il faut un <code>long</code>. Les <code>_</code> rendent le nombre lisible."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Fiche d'un livre",
      prompt: "<p>Déclare trois variables pour un livre : son titre (<code>string</code>), son nombre de pages (<code>int</code>) et son poids en kilos (<code>double</code>, par exemple <code>0.35</code>). Affiche-les chacune sur une ligne.</p>",
      hint: "<p>Le littéral <code>0.35</code> est déjà un <code>double</code>, pas besoin de suffixe.</p>",
      solution: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

string title = "Dune";
int pages = 412;
double weight = 0.35;

Console.WriteLine(title);
Console.WriteLine(pages);
Console.WriteLine(weight);`
    },
    {
      level: "moyen",
      title: "Ranger des livres en cartons",
      prompt: "<p>Tu as <code>47</code> livres et un carton contient <code>10</code> livres. Calcule et affiche le nombre de cartons pleins, puis le nombre de livres qui restent hors carton.</p>",
      hint: "<p>La division entière <code>/</code> donne les cartons pleins, le reste <code>%</code> donne les livres en trop.</p>",
      solution: `int books = 47;
int perBox = 10;

int fullBoxes = books / perBox;   // 4
int leftover = books % perBox;    // 7

Console.WriteLine($"Cartons pleins : {fullBoxes}");
Console.WriteLine($"Livres restants : {leftover}");`
    },
    {
      level: "difficile",
      title: "Le panier de la librairie",
      prompt: "<p>Un client achète 3 livres à <code>9.99</code> euros et 2 livres à <code>14.50</code> euros. Calcule le total avec le bon type, ajoute <code>4.90</code> euros de livraison avec <code>+=</code>, puis affiche le résultat.</p>",
      hint: "<p>C'est de l'argent : utilise <code>decimal</code> et n'oublie pas le suffixe <code>m</code> sur chaque prix.</p>",
      solution: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

decimal cheapPrice = 9.99m;
decimal bigPrice = 14.50m;

decimal total = cheapPrice * 3 + bigPrice * 2;  // 29.97 + 29.00
total += 4.90m;                                  // livraison

Console.WriteLine(total);  // 63.87`
    }
  ],
  quiz: [
    {
      q: "<p>Que vaut <code>7 / 2</code> en C# quand les deux nombres sont des <code>int</code> ?</p>",
      options: ["<code>3.5</code>", "<code>3</code>", "<code>4</code>"],
      answer: 1,
      why: "Entre deux entiers, <code>/</code> fait une division entière : la partie décimale est jetée (pas d'arrondi), donc 3. <code>3.5</code> est le résultat JavaScript, ou celui de <code>7 / 2.0</code> en C#."
    },
    {
      q: "<p>Quel type choisir pour le prix d'un livre ?</p>",
      options: ["<code>double</code>", "<code>float</code>", "<code>decimal</code>"],
      answer: 2,
      why: "<code>decimal</code> calcule en base 10 et ne crée pas d'erreurs d'arrondi sur les centimes. <code>double</code> et <code>float</code> sont binaires : <code>0.1 + 0.2</code> n'y donne pas exactement <code>0.3</code>."
    },
    {
      q: "<p>Que se passe-t-il avec <code>int year = 1943;</code> puis <code>year = \"1943\";</code> ?</p>",
      options: ["Le code ne compile pas", "<code>year</code> devient un texte", "Le texte est converti en nombre automatiquement"],
      answer: 0,
      why: "C# est typé statiquement : <code>year</code> est un <code>int</code> pour toujours. Le compilateur refuse d'y ranger un <code>string</code>, contrairement à JavaScript où une variable peut changer de type."
    },
    {
      q: "<p>Quel littéral est un <code>decimal</code> ?</p>",
      options: ["<code>2.5f</code>", "<code>2.5m</code>", "<code>2.5</code>"],
      answer: 1,
      why: "Le suffixe <code>m</code> (pour « money ») crée un <code>decimal</code>. <code>2.5f</code> est un <code>float</code> et <code>2.5</code> sans suffixe est un <code>double</code>."
    }
  ],
  project: `<p><strong>Bibliothèque, étape 1.</strong> Crée un projet console <code>Library</code>. Dans <code>Program.cs</code>, déclare les variables d'un livre : <code>title</code> (<code>string</code>), <code>year</code> (<code>int</code>) et <code>price</code> (<code>decimal</code>, avec le suffixe <code>m</code>). Affiche-les, puis applique une remise de 2 euros au prix avec <code>-=</code> et affiche le nouveau prix.</p>`,
  resources: [
    { label: "Types numériques intégraux (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/integral-numeric-types" },
    { label: "Types numériques à virgule flottante (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types" }
  ]
});

/* ===================== 2.2 Texte : char et string ===================== */
window.COURSE.push({
  key: "l-text-basics",
  title: "2.2 Texte : char et string",
  summary: "Tu sauras manipuler du texte en C# : caractères, chaînes, interpolation, caractères d'échappement et chaînes verbatim.",
  objectives: [
    "Distinguer char (un caractère) et string (un texte)",
    "Construire un texte par concaténation et par interpolation",
    "Écrire des caractères spéciaux avec les séquences d'échappement",
    "Comprendre qu'une string ne se modifie jamais"
  ],
  analogy: `<p>Pense à un collier de perles. Chaque perle est une lettre : c'est un <code>char</code>. Le collier entier est un <code>string</code>.</p>
<p>Une fois le collier fermé, on ne retire plus une perle au milieu. Si tu veux un autre collier, tu en fabriques un nouveau, et l'ancien reste intact. C'est exactement ce qui se passe avec une <code>string</code> en C#.</p>`,
  lesson: `<h3>char et string : guillemets simples ou doubles</h3>
<p>En JavaScript, <code>'a'</code> et <code>"a"</code> sont la même chose. En C#, non ! Les guillemets <strong>simples</strong> créent un <code>char</code> : un seul caractère, comme <code>'K'</code>. Les guillemets <strong>doubles</strong> créent un <code>string</code> : un texte de zéro, un ou plusieurs caractères, comme <code>"Kamal"</code>.</p>
<div class="compare"><div><h4>char</h4><p><code>char initial = 'K';</code><br>Exactement un caractère, entre apostrophes.</p></div><div><h4>string</h4><p><code>string name = "Kamal";</code><br>Un texte, entre guillemets doubles. <code>""</code> est la chaîne vide.</p></div></div>
<div class="tip">Écrire <code>string name = 'Kamal';</code> ne compile pas : entre apostrophes, C# attend un seul caractère.</div>

<h3>Assembler du texte</h3>
<p>La <strong>concaténation</strong> colle des morceaux avec <code>+</code> : <code>"Bonjour " + name</code>. Ça marche, mais ça devient vite illisible avec beaucoup de morceaux.</p>
<p>L'<strong>interpolation</strong> est l'équivalent des template strings de TypeScript. On met un <code>$</code> devant les guillemets, puis les valeurs entre accolades : <code>$"Bonjour {name} !"</code>. Entre les accolades, on peut écrire n'importe quelle expression, par exemple un calcul.</p>
<div class="compare"><div><h4>TypeScript</h4><p>Backticks et <code>$</code> + accolades autour de la variable :<br>« Bonjour <code>$</code><code>{name}</code> »</p></div><div><h4>C#</h4><p><code>$</code> devant les guillemets, accolades seules :<br><code>$"Bonjour {name}"</code></p></div></div>
<p>Avec l'interpolation, pas besoin de convertir les nombres en texte : <code>$"Il a {age} ans"</code> fonctionne directement avec un <code>int</code>. C'est aussi le cas avec <code>+</code> : dès qu'un des morceaux est un <code>string</code>, C# transforme l'autre en texte. Mais l'interpolation reste plus lisible et évite les espaces oubliés entre les morceaux.</p>
<p>La propriété <code>Length</code> donne le nombre de caractères : <code>"Dune".Length</code> vaut 4. Attention, c'est <code>Length</code> avec une majuscule, comme toutes les propriétés en C#. En TypeScript, c'était <code>length</code> en minuscules.</p>

<h3>Les caractères d'échappement</h3>
<p>Certains caractères ne peuvent pas s'écrire directement dans une chaîne : un retour à la ligne, une tabulation, ou un guillemet (qui fermerait la chaîne). On les écrit avec une <strong>séquence d'échappement</strong> : un antislash suivi d'une lettre. Ce sont les mêmes qu'en JavaScript.</p>
<table>
<tr><th>Séquence</th><th>Signification</th></tr>
<tr><td><code>\\n</code></td><td>Retour à la ligne</td></tr>
<tr><td><code>\\t</code></td><td>Tabulation</td></tr>
<tr><td><code>\\"</code></td><td>Un guillemet double dans le texte</td></tr>
<tr><td><code>\\\\</code></td><td>Un antislash</td></tr>
</table>

<h3>Chaînes verbatim et raw (aperçu)</h3>
<p>Un chemin Windows comme <code>C:\\livres\\dune.txt</code> demande de doubler chaque antislash. La chaîne <strong>verbatim</strong>, préfixée par <code>@</code>, désactive l'échappement : <code>@"C:\\livres\\dune.txt"</code> s'écrit tel quel.</p>
<p>La chaîne <strong>raw</strong> (brute), entourée de trois guillemets <code>"""</code>, accepte même des guillemets à l'intérieur sans rien échapper. Pratique pour du JSON ou du SQL : <code>"""{ "title": "Dune" }"""</code>. On y reviendra en détail dans la leçon 2.13.</p>

<h3>Une string ne change jamais</h3>
<p>Une <code>string</code> est <strong>immuable</strong> : une fois créée, son contenu ne bouge plus. Une méthode comme <code>ToUpper()</code> ne modifie pas la chaîne, elle en <strong>renvoie une nouvelle</strong>. C'est le même comportement qu'en JavaScript.</p>
<pre class="diagram">string s = "dune";
s.ToUpper();      // nouvelle chaine "DUNE"
                  // ... jetee aussitot !
s = s.ToUpper();  // s pointe vers "DUNE"

  s ---X--&gt; "dune"   (ancienne, abandonnee)
  s -------&gt; "DUNE"  (nouvelle)</pre>
<div class="note">Concaténer des milliers de fois dans une boucle crée des milliers de chaînes intermédiaires. Pour ce cas précis, les pros utilisent <code>StringBuilder</code>, vu en 2.13.</div>`,
  examples: [
    {
      title: "char, string, concaténation et Length",
      code: `char initial = 'K';
string firstName = "Kamal";

// Concaténation avec +
string greeting = "Bonjour " + firstName + " !";
Console.WriteLine(greeting);
Console.WriteLine(initial);
Console.WriteLine(firstName.Length);

// Immuable : ToUpper renvoie une nouvelle chaîne
string title = "dune";
title.ToUpper();
Console.WriteLine(title);
title = title.ToUpper();
Console.WriteLine(title);`,
      output: `Bonjour Kamal !
K
5
dune
DUNE`,
      steps: [
        "<code>char initial = 'K';</code> : un seul caractère, entre apostrophes.",
        "<code>\"Bonjour \" + firstName + \" !\"</code> : on colle trois morceaux pour former une nouvelle chaîne.",
        "<code>firstName.Length</code> : le nombre de caractères de \"Kamal\", soit 5.",
        "<code>title.ToUpper();</code> : crée \"DUNE\" mais on ne la range nulle part, elle est perdue. <code>title</code> vaut toujours \"dune\".",
        "<code>title = title.ToUpper();</code> : cette fois on range la nouvelle chaîne dans la variable."
      ],
      explain: "Avec les strings, une méthode ne modifie rien : pense toujours à récupérer ce qu'elle renvoie."
    },
    {
      title: "Interpolation",
      code: `string title = "Dune";
int year = 1965;
int age = 2026 - year;

Console.WriteLine($"{title} est paru en {year}.");
Console.WriteLine($"Il a {age} ans.");
// Une expression directement dans les accolades
Console.WriteLine($"Calcul direct : {2026 - year} ans");
Console.WriteLine($"Le titre fait {title.Length} lettres.");`,
      output: `Dune est paru en 1965.
Il a 61 ans.
Calcul direct : 61 ans
Le titre fait 4 lettres.`,
      steps: [
        "<code>$\"{title} est paru en {year}.\"</code> : le <code>$</code> active l'interpolation, chaque <code>{…}</code> est remplacé par la valeur.",
        "<code>int age = 2026 - year;</code> : un simple calcul rangé dans une variable.",
        "<code>{2026 - year}</code> : on peut mettre un calcul directement entre les accolades.",
        "<code>{title.Length}</code> : ou une propriété, ou un appel de méthode."
      ]
    },
    {
      title: "Échappement, verbatim et raw",
      code: `Console.WriteLine("Titre :\\tDune");
Console.WriteLine("Ligne 1\\nLigne 2");
Console.WriteLine("Il a dit \\"bonjour\\"");
Console.WriteLine("C:\\\\livres\\\\dune.txt");

// Verbatim : l'antislash est un caractère normal
Console.WriteLine(@"C:\\livres\\dune.txt");

// Raw : les guillemets passent sans échappement
string json = """{ "title": "Dune" }""";
Console.WriteLine(json);`,
      output: `Titre :\tDune
Ligne 1
Ligne 2
Il a dit "bonjour"
C:\\livres\\dune.txt
C:\\livres\\dune.txt
{ "title": "Dune" }`,
      steps: [
        "<code>\\t</code> : insère une tabulation entre « Titre : » et « Dune ».",
        "<code>\\n</code> : coupe la ligne, d'où deux lignes affichées pour une seule instruction.",
        "<code>\\\"</code> : un guillemet qui fait partie du texte au lieu de fermer la chaîne.",
        "<code>\\\\</code> : chaque antislash doit être doublé dans une chaîne normale.",
        "<code>@\"C:\\livres\\dune.txt\"</code> : avec <code>@</code>, plus besoin de doubler, le résultat est le même.",
        "<code>\"\"\"{ \"title\": \"Dune\" }\"\"\"</code> : la chaîne raw garde les guillemets intérieurs tels quels."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Carte de membre",
      prompt: "<p>Déclare un <code>char</code> pour l'initiale du prénom et un <code>string</code> pour le nom de famille. Affiche par interpolation une ligne comme <code>Membre : K. Ammouri</code>.</p>",
      hint: "<p>Dans <code>$\"…\"</code>, tu peux mettre un <code>char</code> entre accolades comme n'importe quelle valeur.</p>",
      solution: `char initial = 'K';
string lastName = "Ammouri";

Console.WriteLine($"Membre : {initial}. {lastName}");`
    },
    {
      level: "moyen",
      title: "Étiquette sur deux lignes",
      prompt: "<p>Avec <strong>un seul</strong> <code>Console.WriteLine</code>, affiche le titre d'un livre sur une ligne, puis sur la ligne suivante une tabulation suivie du nombre de lettres du titre.</p>",
      hint: "<p>Combine l'interpolation, <code>\\n</code>, <code>\\t</code> et la propriété <code>Length</code>.</p>",
      solution: `string title = "Fondation";

Console.WriteLine($"{title}\\n\\t{title.Length} lettres");`
    },
    {
      level: "difficile",
      title: "Chemin et citation",
      prompt: "<p>Affiche le chemin <code>D:\\bibliotheque\\romans</code> de deux façons (chaîne normale puis verbatim), puis la phrase <code>Le livre \"Dune\" est disponible</code> en construisant le titre avec une variable.</p>",
      hint: "<p>Dans une chaîne interpolée normale, un guillemet s'écrit <code>\\\"</code>.</p>",
      solution: `string title = "Dune";

Console.WriteLine("D:\\\\bibliotheque\\\\romans");
Console.WriteLine(@"D:\\bibliotheque\\romans");
Console.WriteLine($"Le livre \\"{title}\\" est disponible");`
    }
  ],
  quiz: [
    {
      q: "<p>Laquelle de ces lignes compile ?</p>",
      options: ["<code>char c = \"A\";</code>", "<code>string s = 'Dune';</code>", "<code>char c = 'A';</code>"],
      answer: 2,
      why: "Un <code>char</code> s'écrit entre apostrophes et contient un seul caractère. <code>\"A\"</code> est un <code>string</code> (même d'une lettre), et <code>'Dune'</code> n'est pas valide car il y a plusieurs caractères entre apostrophes."
    },
    {
      q: "<p>Après <code>string s = \"dune\"; s.ToUpper();</code>, que vaut <code>s</code> ?</p>",
      options: ["<code>\"dune\"</code>", "<code>\"DUNE\"</code>", "<code>null</code>"],
      answer: 0,
      why: "Une <code>string</code> est immuable : <code>ToUpper()</code> renvoie une nouvelle chaîne, que l'on n'a rangée nulle part. Il fallait écrire <code>s = s.ToUpper();</code>."
    },
    {
      q: "<p>Quel est l'équivalent C# de la template string TypeScript qui affiche « Bonjour » suivi de la variable <code>name</code> ?</p>",
      options: ["<code>\"Bonjour {name}\"</code>", "<code>$\"Bonjour {name}\"</code>", "<code>@\"Bonjour {name}\"</code>"],
      answer: 1,
      why: "C'est le <code>$</code> qui active l'interpolation. Sans lui, <code>{name}</code> reste du texte brut. Le <code>@</code> crée une chaîne verbatim, qui désactive l'échappement mais n'interpole rien."
    }
  ],
  resources: [
    { label: "Chaînes et littéraux de chaîne (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/strings/" },
    { label: "Interpolation de chaînes (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/tokens/interpolated" }
  ]
});

/* ===================== 2.3 Booléens et opérateurs ===================== */
window.COURSE.push({
  key: "l-bool-operators",
  title: "2.3 Booléens et opérateurs",
  summary: "Tu sauras écrire des conditions avec bool, les opérateurs de comparaison et logiques, et l'opérateur ternaire, sans les réflexes truthy/falsy de JavaScript.",
  objectives: [
    "Utiliser le type bool et les opérateurs de comparaison",
    "Combiner des conditions avec &&, || et !",
    "Comprendre le court-circuit et la priorité des opérateurs",
    "Éviter les pièges venus de JavaScript (truthy, ===)"
  ],
  analogy: `<p>Pense à un interrupteur : il est soit allumé, soit éteint. Jamais « un peu allumé ».</p>
<p>Un <code>bool</code> est cet interrupteur : <code>true</code> ou <code>false</code>, rien d'autre. En JavaScript, on peut brancher n'importe quoi sur l'interrupteur (un nombre, un texte vide…) et il « devine ». C# refuse de deviner : il veut un vrai interrupteur.</p>`,
  lesson: `<h3>Le type bool</h3>
<p>Le type <code>bool</code> n'a que deux valeurs : <code>true</code> et <code>false</code>. On l'obtient presque toujours en <strong>comparant</strong> deux valeurs : <code>bool available = stock &gt; 0;</code>. La variable contient alors le résultat de la question « le stock est-il supérieur à zéro ? ».</p>
<p>Petit détail : <code>Console.WriteLine(true)</code> affiche <code>True</code>, avec une majuscule. Dans le code, en revanche, on écrit toujours <code>true</code> et <code>false</code> en minuscules. Par convention, on nomme une variable booléenne comme une question à laquelle on répond par oui ou non : <code>isEmpty</code>, <code>hasCard</code>, <code>canBorrow</code>.</p>

<h3>Les opérateurs de comparaison</h3>
<table>
<tr><th>Opérateur</th><th>Signification</th><th>Exemple (stock = 3)</th></tr>
<tr><td><code>==</code></td><td>égal à</td><td><code>stock == 3</code> → true</td></tr>
<tr><td><code>!=</code></td><td>différent de</td><td><code>stock != 3</code> → false</td></tr>
<tr><td><code>&lt;</code> / <code>&gt;</code></td><td>strictement inférieur / supérieur</td><td><code>stock &lt; 5</code> → true</td></tr>
<tr><td><code>&lt;=</code> / <code>&gt;=</code></td><td>inférieur / supérieur ou égal</td><td><code>stock &gt;= 3</code> → true</td></tr>
</table>
<div class="tip">Il n'y a <strong>pas</strong> de <code>===</code> en C#. Comme les types sont stricts, <code>==</code> ne fait jamais de conversion surprise : <code>3 == "3"</code> ne compile même pas.</div>

<h3>Les opérateurs logiques</h3>
<p>On combine des conditions avec trois opérateurs : <code>&amp;&amp;</code> (ET : les deux doivent être vraies), <code>||</code> (OU : au moins une vraie) et <code>!</code> (NON : inverse la valeur).</p>
<table>
<tr><th>A</th><th>B</th><th>A &amp;&amp; B</th><th>A || B</th><th>!A</th></tr>
<tr><td>true</td><td>true</td><td>true</td><td>true</td><td>false</td></tr>
<tr><td>true</td><td>false</td><td>false</td><td>true</td><td>false</td></tr>
<tr><td>false</td><td>true</td><td>false</td><td>true</td><td>true</td></tr>
<tr><td>false</td><td>false</td><td>false</td><td>false</td><td>true</td></tr>
</table>

<h3>Le court-circuit</h3>
<p>C# évalue de gauche à droite et s'arrête dès que le résultat est connu. Avec <code>&amp;&amp;</code>, si la gauche est fausse, la droite n'est même pas lue. Avec <code>||</code>, si la gauche est vraie, pareil. C'est le même comportement qu'en JavaScript.</p>
<div class="flow"><span>name != null</span><span>false ?</span><span>Stop : résultat false</span></div>
<p>C'est très utile pour se protéger : dans <code>name != null &amp;&amp; name.Length &gt; 3</code>, on ne lit <code>Length</code> que si <code>name</code> existe vraiment.</p>

<h3>Priorité des opérateurs</h3>
<p>Comme en maths, certains opérateurs passent avant d'autres. Dans l'ordre : <code>!</code>, puis les calculs (<code>*</code> <code>/</code> avant <code>+</code> <code>-</code>), puis les comparaisons, puis <code>&amp;&amp;</code>, puis <code>||</code>. Donc <code>a || b &amp;&amp; c</code> se lit <code>a || (b &amp;&amp; c)</code>. Dans le doute, mets des parenthèses : c'est gratuit et plus lisible.</p>

<h3>Pas de truthy ni de falsy</h3>
<p>En JavaScript, <code>if (count)</code> est accepté : 0, <code>""</code> et <code>null</code> sont « faux ». En C#, une condition doit être un <code>bool</code>, point. <code>if (count)</code> avec un <code>int</code> provoque une erreur de compilation. Il faut écrire la question en entier : <code>if (count &gt; 0)</code>.</p>
<div class="compare"><div><h4>JavaScript</h4><p><code>if (count)</code><br><code>if (name)</code><br>Le moteur devine.</p></div><div><h4>C#</h4><p><code>if (count &gt; 0)</code><br><code>if (name != null)</code><br>Tu écris la question.</p></div></div>

<h3>L'opérateur ternaire</h3>
<p>Le ternaire choisit entre deux valeurs selon une condition : <code>condition ? siVrai : siFaux</code>. Exactement comme en TypeScript. Les deux valeurs doivent être d'un type compatible.</p>
<div class="note">Un ternaire doit rester lisible sur une ligne. Dès qu'on commence à les imbriquer, un <code>if</code> ou un <code>switch</code> (leçons 2.6 et 2.7) est plus clair pour le collègue qui relira.</div>`,
  examples: [
    {
      title: "Comparer et ranger le résultat",
      code: `int stock = 3;

bool available = stock > 0;
bool isEmpty = stock == 0;

Console.WriteLine(available);
Console.WriteLine(isEmpty);
Console.WriteLine(stock != 5);
Console.WriteLine(stock <= 3);`,
      output: `True
False
True
True`,
      steps: [
        "<code>bool available = stock &gt; 0;</code> : la comparaison produit <code>true</code>, rangé dans un <code>bool</code>.",
        "<code>bool isEmpty = stock == 0;</code> : <code>==</code> compare (alors que <code>=</code> affecte). Ici <code>false</code>.",
        "<code>Console.WriteLine(available);</code> : un <code>bool</code> s'affiche <code>True</code> ou <code>False</code>, avec une majuscule.",
        "<code>stock != 5</code> et <code>stock &lt;= 3</code> : on peut afficher directement le résultat d'une comparaison."
      ]
    },
    {
      title: "Combiner des conditions",
      code: `int age = 17;
bool hasCard = true;

bool canBorrow = age >= 18 || hasCard;
bool adultWithCard = age >= 18 && hasCard;

Console.WriteLine(canBorrow);
Console.WriteLine(adultWithCard);
Console.WriteLine(!hasCard);

// Parenthèses pour lever le doute
bool special = (age < 12 || age > 65) && hasCard;
Console.WriteLine(special);`,
      output: `True
False
False
False`,
      steps: [
        "<code>age &gt;= 18 || hasCard</code> : 17 n'est pas ≥ 18 (false), mais <code>hasCard</code> est vrai : OU donne <code>true</code>.",
        "<code>age &gt;= 18 &amp;&amp; hasCard</code> : ET demande les deux, la première est fausse, donc <code>false</code>.",
        "<code>!hasCard</code> : NON inverse <code>true</code> en <code>false</code>.",
        "<code>(age &lt; 12 || age &gt; 65) &amp;&amp; hasCard</code> : la parenthèse vaut false (17 n'est ni enfant ni senior), donc tout est <code>false</code>."
      ]
    },
    {
      title: "Court-circuit, ternaire et absence de truthy",
      code: `int count = 0;
// if (count) { }   // erreur : un int n'est pas un bool

bool hasBooks = count > 0;
string message = hasBooks ? "Des livres sont disponibles" : "Rayon vide";
Console.WriteLine(message);

string? name = null;
// Court-circuit : name.Length n'est jamais lu car name vaut null
bool longName = name != null && name.Length > 3;
Console.WriteLine(longName);

string label = count == 1 ? "livre" : "livres";
Console.WriteLine($"{count} {label}");`,
      output: `Rayon vide
False
0 livres`,
      steps: [
        "<code>// if (count) { }</code> : en commentaire, car cette ligne ne compilerait pas. Une condition C# doit être un <code>bool</code>.",
        "<code>hasBooks ? \"…\" : \"Rayon vide\"</code> : <code>hasBooks</code> vaut <code>false</code>, le ternaire renvoie la seconde valeur.",
        "<code>string? name = null;</code> : le <code>?</code> indique que la variable a le droit de valoir <code>null</code> (aucune valeur).",
        "<code>name != null &amp;&amp; name.Length &gt; 3</code> : la gauche est fausse, C# s'arrête là et ne touche pas à <code>name.Length</code>, ce qui aurait planté.",
        "<code>count == 1 ? \"livre\" : \"livres\"</code> : un usage classique du ternaire pour accorder un mot."
      ],
      explain: "Le court-circuit n'est pas qu'une optimisation : c'est une protection contre les erreurs."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Livre récent ?",
      prompt: "<p>Déclare <code>int year = 2019;</code>. Range dans un <code>bool</code> le fait que le livre soit paru en 2020 ou après, puis affiche-le.</p>",
      hint: "<p>Utilise <code>&gt;=</code>.</p>",
      solution: `int year = 2019;
bool isRecent = year >= 2020;

Console.WriteLine(isRecent);  // False`
    },
    {
      level: "moyen",
      title: "Peut-on emprunter ?",
      prompt: "<p>Un membre peut emprunter s'il a moins de 5 emprunts en cours <strong>et</strong> aucune amende. Avec <code>int loans = 4;</code> et <code>bool hasFine = false;</code>, calcule <code>canBorrow</code> et affiche-le.</p>",
      hint: "<p>« aucune amende » s'écrit <code>!hasFine</code>.</p>",
      solution: `int loans = 4;
bool hasFine = false;

bool canBorrow = loans < 5 && !hasFine;
Console.WriteLine(canBorrow);  // True`
    },
    {
      level: "difficile",
      title: "Message d'emprunt",
      prompt: "<p>Reprends l'exercice précédent et affiche, grâce au ternaire, <code>Emprunt accepté</code> ou <code>Emprunt refusé</code>. Puis, avec <code>string? memberName = null;</code>, affiche si le nom contient plus de 2 caractères, sans planter.</p>",
      hint: "<p>Pour le nom, vérifie d'abord <code>!= null</code> puis utilise <code>&amp;&amp;</code> pour profiter du court-circuit.</p>",
      solution: `int loans = 4;
bool hasFine = false;
bool canBorrow = loans < 5 && !hasFine;

string message = canBorrow ? "Emprunt accepté" : "Emprunt refusé";
Console.WriteLine(message);

string? memberName = null;
bool validName = memberName != null && memberName.Length > 2;
Console.WriteLine(validName);  // False, sans erreur`
    }
  ],
  quiz: [
    {
      q: "<p>Avec <code>int count = 3;</code>, que se passe-t-il avec <code>if (count) { … }</code> ?</p>",
      options: ["La condition est vraie car 3 n'est pas 0", "Le code ne compile pas", "La condition est fausse"],
      answer: 1,
      why: "C# n'a pas de notion de truthy/falsy : une condition doit être un <code>bool</code>. Il faut écrire <code>if (count &gt; 0)</code>. Le raisonnement « 3 n'est pas 0 » est celui de JavaScript."
    },
    {
      q: "<p>Dans <code>a || b &amp;&amp; c</code>, quelle partie est évaluée en premier ?</p>",
      options: ["<code>a || b</code>", "Tout de gauche à droite sans priorité", "<code>b &amp;&amp; c</code>"],
      answer: 2,
      why: "<code>&amp;&amp;</code> est prioritaire sur <code>||</code>, donc l'expression se lit <code>a || (b &amp;&amp; c)</code>. Pour éviter le doute, ajoute des parenthèses."
    },
    {
      q: "<p>Quel opérateur compare deux valeurs en C# ?</p>",
      options: ["<code>==</code>", "<code>===</code>", "<code>=</code>"],
      answer: 0,
      why: "<code>==</code> compare. <code>===</code> n'existe pas en C# (inutile, car il n'y a pas de conversion implicite surprise), et <code>=</code> est l'affectation."
    },
    {
      q: "<p>Que vaut <code>string? s = null; bool ok = s != null &amp;&amp; s.Length &gt; 0;</code> ?</p>",
      options: ["Le programme plante", "<code>false</code>", "<code>true</code>"],
      answer: 1,
      why: "Grâce au court-circuit, <code>s.Length</code> n'est jamais évalué : la gauche est fausse, donc tout est <code>false</code> sans erreur. Sans le test de gauche, on aurait une erreur."
    }
  ],
  resources: [
    { label: "Opérateurs logiques booléens (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/boolean-logical-operators" },
    { label: "Opérateurs de comparaison (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/comparison-operators" }
  ]
});

/* ===================== 2.4 var, const et conversions ===================== */
window.COURSE.push({
  key: "l-var-const-conversions",
  title: "2.4 var, const et conversions",
  summary: "Tu sauras utiliser var et const à bon escient et convertir une valeur d'un type à un autre, notamment un texte en nombre avec TryParse.",
  objectives: [
    "Comprendre que var reste typé statiquement",
    "Déclarer une constante avec const",
    "Distinguer conversion implicite et cast explicite",
    "Convertir un texte en nombre en toute sécurité avec TryParse"
  ],
  analogy: `<p>Verser de l'eau d'un petit verre dans une grande carafe, c'est sans risque : tout rentre. C'est une conversion <strong>implicite</strong>, C# la fait tout seul.</p>
<p>Verser une carafe dans un petit verre, c'est autre chose : une partie peut déborder. C# exige que tu le dises clairement, c'est le <strong>cast explicite</strong>. Et transformer un papier où est écrit « 1965 » en vrai nombre, c'est une <strong>lecture</strong> : le papier pourrait aussi dire « abc ».</p>`,
  lesson: `<h3>var : l'inférence de type</h3>
<p>Avec <code>var</code>, tu laisses le compilateur deviner le type à partir de la valeur : <code>var year = 1965;</code> crée un <code>int</code>. C'est de l'<strong>inférence</strong> : le type est déduit, mais il est fixé pour toujours. Écrire ensuite <code>year = "abc";</code> ne compile pas.</p>
<div class="compare"><div><h4>var en JavaScript</h4><p>Ancienne façon de déclarer une variable. Aucun type : elle peut contenir un nombre puis un texte.</p></div><div><h4>var en C#</h4><p>Raccourci d'écriture. La variable a un type précis, déduit de la valeur. C'est plutôt l'équivalent de <code>let x = 5</code> en TypeScript, qui infère <code>number</code>.</p></div></div>
<p>Comme le type vient de la valeur, <code>var</code> exige une valeur immédiate : <code>var x;</code> seul ne compile pas. Utilise <code>var</code> quand le type saute aux yeux à droite du <code>=</code>. Quand il n'est pas évident, écris le type en entier.</p>

<h3>const : une valeur gravée</h3>
<p><code>const int MaxBooks = 5;</code> déclare une <strong>constante</strong> : sa valeur est connue dès la compilation et ne peut jamais changer. On ne peut y mettre que des valeurs simples écrites en dur (nombres, textes, booléens), pas le résultat d'un calcul fait à l'exécution.</p>
<div class="tip">Le <code>const</code> de JavaScript empêche seulement de réaffecter la variable, et accepte n'importe quelle valeur, même calculée. Le <code>const</code> de C# est plus strict. On verra son cousin <code>readonly</code> en 3.7.</div>

<h3>Conversions implicites et explicites</h3>
<p>Quand la conversion ne peut rien perdre, C# la fait tout seul : c'est une conversion <strong>implicite</strong>. Un <code>int</code> rentre toujours dans un <code>long</code> ou un <code>double</code>.</p>
<p>Quand la conversion peut perdre de l'information, il faut un <strong>cast</strong> : le type cible entre parenthèses, <code>(int)3.9</code>. Le cast vers un entier <strong>tronque</strong> : il coupe la partie décimale sans arrondir, donc <code>(int)3.9</code> vaut 3.</p>
<pre class="diagram">  int  --------&gt; long     implicite (rien a perdre)
  int  --------&gt; double   implicite
  double --(int)--&gt; int   cast explicite : 3.9 -&gt; 3
  string --Parse--&gt; int   lecture : "42" -&gt; 42</pre>
<p><code>Convert.ToInt32(3.9)</code>, lui, <strong>arrondit</strong> au plus proche et donne 4. Choisis selon ce que tu veux : couper ou arrondir.</p>

<h3>Du texte vers un nombre : Parse et TryParse</h3>
<p>Un cast ne transforme pas un texte en nombre : <code>(int)"42"</code> ne compile pas. Pour lire un nombre dans un texte, on utilise <code>int.Parse("42")</code>. Mais si le texte est <code>"abc"</code>, <code>Parse</code> lance une <strong>exception</strong> (une erreur qui arrête le programme si personne ne la gère).</p>
<p><code>int.TryParse</code> est la version prudente. Elle renvoie un <code>bool</code> qui dit si la lecture a réussi, et dépose le nombre lu dans une variable marquée <code>out</code> (un paramètre de sortie, détaillé en 2.12). On peut déclarer cette variable directement dans l'appel : <code>int.TryParse(text, out int year)</code>, ou <code>out var year</code>.</p>
<div class="flow"><span>Texte saisi</span><span>int.TryParse</span><span>true + nombre</span><span>ou false + 0</span></div>

<h3>Du nombre vers le texte : ToString</h3>
<p>Toute valeur a une méthode <code>ToString()</code> qui la transforme en texte. On peut lui passer un <strong>format</strong> : <code>"F2"</code> pour deux décimales, <code>"N0"</code> pour séparer les milliers. Le résultat dépend de la langue du PC (virgule ou point), d'où l'usage de <code>CultureInfo.InvariantCulture</code> dans nos exemples.</p>
<div class="note">Toute donnée qui vient de l'extérieur (clavier, fichier, formulaire, API) est suspecte. Le réflexe pro : <code>TryParse</code> pour les entrées utilisateur, <code>Parse</code> seulement quand le texte vient de ton propre code et ne peut pas être faux.</div>`,
  examples: [
    {
      title: "var et const",
      code: `var title = "Dune";     // string
var year = 1965;         // int
var price = 9.99m;       // decimal
const int MaxBooks = 5;  // constante

// GetType().Name affiche le vrai type .NET
Console.WriteLine(title.GetType().Name);
Console.WriteLine(year.GetType().Name);
Console.WriteLine(price.GetType().Name);
Console.WriteLine($"Maximum : {MaxBooks} livres");

// year = "1965";   // erreur : year est un int
// MaxBooks = 6;    // erreur : une constante ne change pas`,
      output: `String
Int32
Decimal
Maximum : 5 livres`,
      steps: [
        "<code>var title = \"Dune\";</code> : le compilateur voit un texte et fixe le type <code>string</code>.",
        "<code>var price = 9.99m;</code> : grâce au suffixe <code>m</code>, le type déduit est <code>decimal</code>.",
        "<code>const int MaxBooks = 5;</code> : une constante, son nom s'écrit en PascalCase par convention.",
        "<code>GetType().Name</code> : affiche le nom .NET du type. <code>int</code> est un alias de <code>Int32</code>, <code>string</code> de <code>String</code>.",
        "<code>// year = \"1965\";</code> : décommente cette ligne et le compilateur refusera. <code>var</code> ne veut pas dire « sans type »."
      ]
    },
    {
      title: "Conversions implicites, cast et Convert",
      code: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

int pages = 300;
long bigPages = pages;     // implicite
double ratio = pages;      // implicite

double rating = 3.9;
int truncated = (int)rating;              // cast : coupe
int rounded = Convert.ToInt32(rating);    // arrondit

Console.WriteLine(bigPages);
Console.WriteLine(ratio);
Console.WriteLine(truncated);
Console.WriteLine(rounded);

decimal price = 9.5m;
Console.WriteLine(price.ToString("F2"));
Console.WriteLine(1234567.ToString("N0"));`,
      output: `300
300
3
4
9.50
1,234,567`,
      steps: [
        "<code>long bigPages = pages;</code> : un <code>int</code> rentre toujours dans un <code>long</code>, aucune syntaxe spéciale.",
        "<code>double ratio = pages;</code> : même chose vers <code>double</code>. Il s'affiche <code>300</code>, sans décimales inutiles.",
        "<code>(int)rating</code> : cast explicite, 3.9 devient 3. La partie décimale est coupée, pas arrondie.",
        "<code>Convert.ToInt32(rating)</code> : arrondit au plus proche, 3.9 devient 4.",
        "<code>price.ToString(\"F2\")</code> : format à deux décimales, <code>9.50</code>.",
        "<code>1234567.ToString(\"N0\")</code> : séparateur de milliers, zéro décimale. En culture invariante, le séparateur est la virgule."
      ]
    },
    {
      title: "Parse et TryParse",
      code: `string input = "1965";
int year = int.Parse(input);
Console.WriteLine(year + 1);

string bad = "abc";
// int.Parse(bad) lancerait une FormatException
bool ok = int.TryParse(bad, out int value);
Console.WriteLine(ok);
Console.WriteLine(value);

bool ok2 = int.TryParse("2001", out var other);
string message = ok2 ? $"Année lue : {other}" : "Saisie invalide";
Console.WriteLine(message);`,
      output: `1966
False
0
Année lue : 2001`,
      steps: [
        "<code>int.Parse(input)</code> : transforme le texte \"1965\" en nombre 1965. On peut alors calculer : 1966.",
        "<code>// int.Parse(bad)</code> : avec \"abc\", <code>Parse</code> lance une exception et le programme s'arrête.",
        "<code>int.TryParse(bad, out int value)</code> : ne plante jamais. Renvoie <code>false</code> et met 0 dans <code>value</code>.",
        "<code>out var other</code> : même chose avec <code>var</code>, le type <code>int</code> est déduit.",
        "<code>ok2 ? … : …</code> : le ternaire de la leçon 2.3 choisit le message selon la réussite."
      ],
      explain: "TryParse transforme une erreur possible en simple booléen à tester."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Constante de durée d'emprunt",
      prompt: "<p>Déclare une constante <code>LoanDays</code> valant 21 et une variable <code>var weeks</code> qui vaut <code>LoanDays / 7</code>. Affiche les deux.</p>",
      hint: "<p>21 / 7 est une division entière qui tombe juste.</p>",
      solution: `const int LoanDays = 21;
var weeks = LoanDays / 7;

Console.WriteLine($"Durée : {LoanDays} jours, soit {weeks} semaines");`
    },
    {
      level: "moyen",
      title: "Note moyenne",
      prompt: "<p>Un livre a reçu un total de <code>17</code> points sur <code>4</code> avis. Calcule la moyenne en <code>double</code> (sans perdre la virgule), puis affiche-la avec deux décimales et aussi tronquée en entier.</p>",
      hint: "<p>Convertis un des deux entiers en <code>double</code> avant de diviser : <code>(double)total / count</code>.</p>",
      solution: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

int total = 17;
int count = 4;

double average = (double)total / count;   // 4.25
int stars = (int)average;                  // 4

Console.WriteLine(average.ToString("F2"));
Console.WriteLine(stars);`
    },
    {
      level: "difficile",
      title: "Lire des années",
      prompt: "<p>On a trois textes : <code>\"1984\"</code>, <code>\"vingt\"</code> et <code>\" 2010 \"</code>. Pour chacun, utilise <code>int.TryParse</code> et affiche soit <code>OK : 1984</code>, soit <code>Invalide : vingt</code>.</p>",
      hint: "<p>Un ternaire par texte suffit. <code>TryParse</code> accepte les espaces autour du nombre.</p>",
      solution: `string a = "1984";
string b = "vingt";
string c = " 2010 ";

bool okA = int.TryParse(a, out int yearA);
Console.WriteLine(okA ? $"OK : {yearA}" : $"Invalide : {a}");

bool okB = int.TryParse(b, out int yearB);
Console.WriteLine(okB ? $"OK : {yearB}" : $"Invalide : {b}");

bool okC = int.TryParse(c, out int yearC);
Console.WriteLine(okC ? $"OK : {yearC}" : $"Invalide : {c}");`
    }
  ],
  quiz: [
    {
      q: "<p>Après <code>var count = 10;</code>, peut-on écrire <code>count = \"dix\";</code> ?</p>",
      options: ["Oui, var accepte tous les types", "Oui, mais avec un avertissement", "Non, count est un int pour toujours"],
      answer: 2,
      why: "<code>var</code> déduit le type une fois pour toutes (ici <code>int</code>). C'est le <code>var</code> de JavaScript qui accepte de changer de type, pas celui de C#."
    },
    {
      q: "<p>Que vaut <code>(int)7.8</code> ?</p>",
      options: ["<code>7</code>", "<code>8</code>", "Erreur de compilation"],
      answer: 0,
      why: "Le cast vers un entier tronque : il coupe la partie décimale sans arrondir. Pour arrondir, utilise <code>Convert.ToInt32(7.8)</code> qui donne 8."
    },
    {
      q: "<p>Que fait <code>int.Parse(\"abc\")</code> ?</p>",
      options: ["Renvoie 0", "Lance une exception", "Renvoie false"],
      answer: 1,
      why: "<code>Parse</code> lance une <code>FormatException</code> quand le texte n'est pas un nombre. C'est <code>TryParse</code> qui renvoie <code>false</code> et met 0 dans la variable <code>out</code>."
    }
  ],
  project: `<p><strong>Bibliothèque, étape 2.</strong> Remplace l'année écrite en dur par une saisie : prépare une variable <code>string yearText = "1943";</code> (on lira le clavier à la leçon suivante), convertis-la avec <code>int.TryParse(yearText, out int year)</code>, puis affiche l'année lue ou le message <code>Année invalide</code> grâce à un ternaire. Teste avec <code>"abc"</code>.</p>`,
  resources: [
    { label: "Casts et conversions de type (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/types/casting-and-type-conversions" },
    { label: "Convertir une chaîne en nombre (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/types/how-to-convert-a-string-to-a-number" }
  ]
});

/* ===================== 2.5 Lire et écrire dans la console ===================== */
window.COURSE.push({
  key: "l-console-io",
  title: "2.5 Lire et écrire dans la console",
  summary: "Tu sauras afficher des textes bien formatés, lire ce que l'utilisateur tape et valider une saisie numérique, jusqu'à écrire une petite calculatrice.",
  objectives: [
    "Afficher avec Console.Write et Console.WriteLine",
    "Lire une saisie avec Console.ReadLine et gérer le null",
    "Redemander un nombre tant que la saisie est invalide",
    "Formater et aligner des valeurs, ajouter de la couleur"
  ],
  analogy: `<p>La console, c'est un guichet. Tu poses une question à travers la vitre (<code>Write</code>), la personne écrit sa réponse sur un papier et te la tend (<code>ReadLine</code>).</p>
<p>Ce papier contient toujours du <strong>texte</strong>, même si la personne a écrit un nombre. Parfois elle ne tend rien du tout. Et si elle écrit n'importe quoi, tu lui demandes poliment de recommencer.</p>`,
  lesson: `<h3>Écrire : Write et WriteLine</h3>
<p><code>Console.WriteLine(x)</code> affiche <code>x</code> puis passe à la ligne, comme <code>console.log</code>. <code>Console.Write(x)</code> affiche sans passer à la ligne : parfait pour poser une question et laisser le curseur juste après.</p>
<div class="compare"><div><h4>Console.Write</h4><p><code>Write("Titre : ")</code><br>Le curseur reste sur la même ligne.</p></div><div><h4>Console.WriteLine</h4><p><code>WriteLine("Dune")</code><br>Le texte puis un retour à la ligne.</p></div></div>

<h3>Lire : ReadLine renvoie un string?</h3>
<p><code>Console.ReadLine()</code> attend que l'utilisateur tape une ligne et appuie sur Entrée, puis renvoie ce texte. Son type est <code>string?</code> : un texte, <strong>ou</strong> <code>null</code> si plus rien ne peut être lu (par exemple quand l'entrée est redirigée depuis un fichier terminé).</p>
<p>Attention : si l'utilisateur tape <code>42</code>, tu reçois le texte <code>"42"</code>, pas le nombre 42. <code>"42" + 1</code> donnerait d'ailleurs <code>"421"</code>, exactement comme en JavaScript avec la valeur d'un champ <code>input</code>. Il faudra donc convertir.</p>
<p>Le <code>?</code> vient du mode <strong>nullable</strong> activé dans les projets modernes : le compilateur te prévient si tu utilises une valeur qui peut être <code>null</code> sans l'avoir vérifiée. On approfondira au chapitre 4.</p>
<div class="flow"><span>Write : question</span><span>ReadLine : string?</span><span>TryParse</span><span>Nombre valide</span></div>

<h3>Valider une saisie numérique</h3>
<p><code>ReadLine</code> renvoie du texte. Pour obtenir un nombre, on combine ce qu'on a vu en 2.4 : <code>int.TryParse</code>. Bonne nouvelle, <code>TryParse</code> accepte un <code>string?</code> et renvoie simplement <code>false</code> si on lui donne <code>null</code>.</p>
<p>Pour redemander tant que c'est faux, on utilise une boucle <code>while</code> (« tant que »), détaillée en 2.8. Lis-la ainsi : « tant que la lecture échoue, afficher un message et relire ». À la sortie de la boucle, tu as la garantie que la variable contient un vrai nombre : plus besoin de le revérifier ensuite.</p>
<pre class="diagram">while (!int.TryParse(Console.ReadLine(), out a))
{
    Console.Write("Pas un nombre : ");
}
// ici, a contient forcement un nombre valide</pre>

<h3>Formater et aligner</h3>
<p>Dans une interpolation, on peut ajouter un <strong>format</strong> après deux-points et une <strong>largeur</strong> après une virgule.</p>
<table>
<tr><th>Écriture</th><th>Effet</th><th>Résultat</th></tr>
<tr><td><code>{price:F2}</code></td><td>Deux décimales</td><td><code>9.50</code></td></tr>
<tr><td><code>{title,-10}</code></td><td>Largeur 10, aligné à gauche</td><td><code>Dune      </code></td></tr>
<tr><td><code>{price,8:F2}</code></td><td>Largeur 8, aligné à droite, 2 décimales</td><td><code>    9.50</code></td></tr>
</table>
<p>Une largeur négative aligne à gauche, positive à droite. Idéal pour afficher des colonnes propres. Si la valeur est plus longue que la largeur demandée, elle n'est pas coupée : elle déborde simplement, et la colonne se décale. Choisis donc une largeur un peu plus grande que la plus longue valeur attendue. Les autres formats courants sont <code>N0</code> (séparateur de milliers), <code>D3</code> (entier sur 3 chiffres, complété par des zéros : <code>007</code>) et <code>P0</code> (pourcentage). Comme en 2.4, <code>CultureInfo.InvariantCulture</code> garantit un point décimal sur tous les PC.</p>

<h3>Effacer et colorer</h3>
<p><code>Console.Clear()</code> efface l'écran. <code>Console.ForegroundColor = ConsoleColor.Green;</code> change la couleur du texte qui suit, et <code>Console.ResetColor()</code> remet les couleurs d'origine. Pense toujours à remettre la couleur, sinon tout le reste du programme sera vert.</p>
<div class="tip">La couleur et <code>Clear</code> n'apparaissent que dans un vrai terminal. Dans une sortie redirigée vers un fichier, seul le texte reste.</div>
<div class="note">Dans une vraie application, la saisie est toujours validée au plus près de l'entrée, puis le reste du code travaille avec des valeurs sûres. C'est le même principe qu'un formulaire Angular avec ses validateurs : on ne laisse jamais une donnée brute traverser tout le programme.</div>`,
  examples: [
    {
      title: "Afficher un tableau aligné",
      code: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

string title = "Dune";
decimal price = 9.5m;

Console.Write("Livre : ");
Console.WriteLine(title);
Console.WriteLine($"Prix : {price:F2} EUR");
Console.WriteLine();

Console.WriteLine($"{"Titre",-12}|{"Prix",8}");
Console.WriteLine($"{"Dune",-12}|{9.5m,8:F2}");
Console.WriteLine($"{"Fondation",-12}|{12m,8:F2}");`,
      output: `Livre : Dune
Prix : 9.50 EUR

Titre       |    Prix
Dune        |    9.50
Fondation   |   12.00`,
      steps: [
        "<code>Console.Write(\"Livre : \");</code> : pas de retour à la ligne, le titre s'affiche juste après.",
        "<code>{price:F2}</code> : le format <code>F2</code> force deux décimales, <code>9.5</code> devient <code>9.50</code>.",
        "<code>Console.WriteLine();</code> : sans argument, affiche une ligne vide.",
        "<code>{\"Titre\",-12}</code> : la valeur occupe 12 caractères, alignée à gauche, complétée par des espaces.",
        "<code>{9.5m,8:F2}</code> : largeur 8 alignée à droite et deux décimales. Les colonnes tombent pile."
      ]
    },
    {
      title: "Lire le prénom de l'utilisateur",
      code: `Console.Write("Ton prénom : ");
string? name = Console.ReadLine();

// ReadLine peut renvoyer null : on prévoit une valeur par défaut
string safeName = name != null ? name : "inconnu";

Console.WriteLine($"Bonjour {safeName} !");
Console.WriteLine($"Ton prénom a {safeName.Length} lettres.");`,
      output: `Ton prénom : Kamal
Bonjour Kamal !
Ton prénom a 5 lettres.`,
      steps: [
        "<code>Console.Write(\"Ton prénom : \");</code> : la question, le curseur attend sur la même ligne.",
        "<code>string? name = Console.ReadLine();</code> : l'utilisateur tape <code>Kamal</code> puis Entrée. Le type est <code>string?</code> car le résultat peut être <code>null</code>.",
        "<code>name != null ? name : \"inconnu\"</code> : un ternaire pour garantir un texte non null.",
        "<code>safeName.Length</code> : sans risque, car <code>safeName</code> ne peut pas être null."
      ],
      explain: "La sortie montre une session type : « Kamal » est ce que l'utilisateur a tapé."
    },
    {
      title: "Petite calculatrice avec validation",
      code: `Console.Write("Premier nombre : ");
int a;
while (!int.TryParse(Console.ReadLine(), out a))
{
    Console.Write("Pas un nombre, recommence : ");
}

Console.Write("Second nombre : ");
int b;
while (!int.TryParse(Console.ReadLine(), out b))
{
    Console.Write("Pas un nombre, recommence : ");
}

Console.WriteLine($"{a} + {b} = {a + b}");
Console.WriteLine($"{a} x {b} = {a * b}");

Console.ForegroundColor = ConsoleColor.Green;
Console.WriteLine("Terminé !");
Console.ResetColor();`,
      output: `Premier nombre : douze
Pas un nombre, recommence : 12
Second nombre : 5
12 + 5 = 17
12 x 5 = 60
Terminé !`,
      steps: [
        "<code>int a;</code> : on déclare la variable avant la boucle, <code>TryParse</code> la remplira.",
        "<code>while (!int.TryParse(Console.ReadLine(), out a))</code> : on lit une ligne et on essaie de la convertir. Le <code>!</code> signifie : tant que ça échoue…",
        "<code>Console.Write(\"Pas un nombre, recommence : \");</code> : … on affiche un message, puis la boucle relit. Ici « douze » est refusé, « 12 » est accepté.",
        "<code>{a + b}</code> et <code>{a * b}</code> : à ce stade, <code>a</code> et <code>b</code> sont forcément des nombres valides.",
        "<code>Console.ForegroundColor = ConsoleColor.Green;</code> : le texte suivant s'affiche en vert dans le terminal.",
        "<code>Console.ResetColor();</code> : on remet les couleurs d'origine."
      ],
      explain: "Session type : « douze », « 12 » et « 5 » sont les saisies de l'utilisateur."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Saluer un membre",
      prompt: "<p>Demande le nom d'un membre avec <code>Console.Write</code>, lis-le avec <code>Console.ReadLine</code>, puis affiche <code>Bienvenue à la bibliothèque, …</code>.</p>",
      hint: "<p>Le résultat de <code>ReadLine</code> est un <code>string?</code> ; l'interpolation affiche simplement rien s'il vaut null.</p>",
      solution: `Console.Write("Nom du membre : ");
string? name = Console.ReadLine();

Console.WriteLine($"Bienvenue à la bibliothèque, {name} !");`
    },
    {
      level: "moyen",
      title: "Saisir un nombre de pages",
      prompt: "<p>Demande un nombre de pages et redemande tant que la saisie n'est pas un entier. Affiche ensuite le temps de lecture en minutes, à raison de 2 minutes par page.</p>",
      hint: "<p>Reprends la boucle <code>while (!int.TryParse(Console.ReadLine(), out pages))</code> de l'exemple.</p>",
      solution: `Console.Write("Nombre de pages : ");
int pages;
while (!int.TryParse(Console.ReadLine(), out pages))
{
    Console.Write("Entier attendu, recommence : ");
}

Console.WriteLine($"Temps de lecture : {pages * 2} minutes");`
    },
    {
      level: "difficile",
      title: "Ticket de caisse",
      prompt: "<p>Demande un prix (un <code>decimal</code>) et une quantité (un <code>int</code>), avec validation pour les deux. Affiche un ticket aligné : le libellé sur 10 caractères à gauche, le montant sur 8 caractères à droite avec 2 décimales, pour le prix unitaire et le total. Le total s'affiche en jaune.</p>",
      hint: "<p><code>decimal.TryParse</code> existe aussi. Passe-lui <code>NumberStyles.Number</code> et <code>CultureInfo.InvariantCulture</code> pour accepter le point décimal partout.</p>",
      solution: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

Console.Write("Prix unitaire : ");
decimal price;
while (!decimal.TryParse(Console.ReadLine(), NumberStyles.Number, CultureInfo.InvariantCulture, out price))
{
    Console.Write("Prix invalide (ex : 9.99) : ");
}

Console.Write("Quantité : ");
int quantity;
while (!int.TryParse(Console.ReadLine(), out quantity))
{
    Console.Write("Quantité invalide : ");
}

Console.WriteLine($"{"Prix",-10}{price,8:F2}");
Console.ForegroundColor = ConsoleColor.Yellow;
Console.WriteLine($"{"Total",-10}{price * quantity,8:F2}");
Console.ResetColor();`
    }
  ],
  quiz: [
    {
      q: "<p>Quel est le type de retour de <code>Console.ReadLine()</code> ?</p>",
      options: ["<code>string?</code>", "<code>int</code>", "<code>string</code>, jamais null"],
      answer: 0,
      why: "<code>ReadLine</code> renvoie toujours du texte, ou <code>null</code> quand il n'y a plus rien à lire : d'où <code>string?</code>. Même si l'utilisateur tape 42, tu reçois le texte \"42\", à convertir avec <code>TryParse</code>."
    },
    {
      q: "<p>Que produit <code>$\"[{\"Dune\",-6}]\"</code> ?</p>",
      options: ["<code>[  Dune]</code>", "<code>[Dune  ]</code>", "<code>[Dune]</code>"],
      answer: 1,
      why: "Une largeur négative aligne à gauche : \"Dune\" (4 caractères) est complété par 2 espaces à droite. Une largeur positive (<code>,6</code>) aurait mis les espaces à gauche."
    },
    {
      q: "<p>Pourquoi utiliser <code>Console.Write</code> plutôt que <code>WriteLine</code> pour poser une question ?</p>",
      options: ["Write est plus rapide", "WriteLine ne peut pas afficher de texte avec des espaces", "Pour que la saisie se fasse sur la même ligne que la question"],
      answer: 2,
      why: "<code>Write</code> ne passe pas à la ligne : le curseur attend juste après « Ton prénom : ». Les deux méthodes ont les mêmes performances et affichent le même texte."
    }
  ],
  project: `<p><strong>Bibliothèque, étape 3.</strong> Affiche un menu avec un titre en couleur :<br><code>1. Lister les livres</code><br><code>2. Ajouter un livre</code><br><code>3. Quitter</code><br>Puis lis le choix de l'utilisateur avec <code>Console.ReadLine()</code> et redemande tant que <code>int.TryParse</code> échoue. Affiche enfin <code>Tu as choisi : …</code>. Remplace aussi le <code>yearText</code> de l'étape 2 par une vraie saisie.</p>`,
  resources: [
    { label: "Classe Console (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/system.console" },
    { label: "Mise en forme composite (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/base-types/composite-formatting" }
  ]
});

/* ===================== 2.6 Conditions : if et else ===================== */
window.COURSE.push({
  key: "l-if-else",
  title: "2.6 Conditions : if et else",
  summary: "Tu sauras faire prendre des décisions à ton programme avec if, else if et else, et garder ton code lisible grâce aux retours anticipés.",
  objectives: [
    "Écrire un if, un else et une chaîne de else if",
    "Toujours délimiter les blocs avec des accolades",
    "Combiner des conditions avec && et ||",
    "Remplacer des if imbriqués par des retours anticipés"
  ],
  analogy: `<p>Pense à un aiguillage de train. Le train arrive à une bifurcation : si le signal est vert, il part à gauche, sinon à droite. Il ne peut pas prendre les deux voies.</p>
<p>Une chaîne de <code>else if</code>, c'est une suite d'aiguillages : le train prend la première voie dont le signal est vert, et ignore toutes les suivantes.</p>`,
  lesson: `<h3>if et else</h3>
<p><code>if</code> exécute un bloc seulement si sa condition vaut <code>true</code>. <code>else</code> exécute un autre bloc dans le cas contraire. La condition est entre parenthèses et doit être un <code>bool</code> : souviens-toi, pas de truthy en C# (leçon 2.3).</p>
<pre class="diagram">if (stock &gt; 0)
{
    Console.WriteLine("Disponible");
}
else
{
    Console.WriteLine("Rupture");
}</pre>

<h3>else if : plusieurs cas</h3>
<p>Pour plus de deux cas, on enchaîne des <code>else if</code>. C# teste les conditions dans l'ordre et exécute <strong>uniquement le premier</strong> bloc dont la condition est vraie. Les suivants sont ignorés, même s'ils sont vrais aussi. L'ordre compte donc beaucoup.</p>
<div class="flow"><span>age &lt; 12 ?</span><span>sinon age &lt; 18 ?</span><span>sinon age &lt; 65 ?</span><span>sinon : Senior</span></div>
<p>Dans cet exemple, si <code>age</code> vaut 15, le premier test échoue, le deuxième réussit : on affiche « Adolescent » et on sort. On n'a pas besoin d'écrire <code>age &gt;= 12 &amp;&amp; age &lt; 18</code>, car on sait déjà que le premier test a échoué.</p>

<h3>Toujours des accolades</h3>
<p>C# permet d'omettre les accolades quand le bloc ne contient qu'une ligne. C'est un piège classique : si tu ajoutes une deuxième ligne plus tard, elle ne fera <strong>pas</strong> partie du <code>if</code>, même si l'indentation le laisse croire.</p>
<div class="compare"><div><h4>Risqué</h4><p><code>if (stock == 0)</code><br><code>&nbsp;&nbsp;Alert();</code><br><code>&nbsp;&nbsp;Log();</code> ← toujours exécuté !</p></div><div><h4>Sûr</h4><p><code>if (stock == 0)</code><br><code>{</code> <code>Alert();</code> <code>Log();</code> <code>}</code><br>Les deux lignes sont dans le bloc.</p></div></div>
<div class="tip">Mets toujours les accolades, même pour une seule ligne. Par convention en C#, l'accolade ouvrante va sur sa propre ligne (contrairement au style courant en TypeScript).</div>

<h3>Conditions combinées</h3>
<p>Tout ce qu'on a vu en 2.3 s'utilise dans un <code>if</code> : <code>if (total &gt;= 50m || isMember)</code>, <code>if (loans &lt; 5 &amp;&amp; !hasFine)</code>. Quand une condition devient longue, range-la dans une variable <code>bool</code> au nom parlant : <code>bool canBorrow = …; if (canBorrow) { … }</code>. Le code se lit alors comme une phrase.</p>
<p>Évite aussi d'écrire <code>if (isMember == true)</code> : <code>isMember</code> est déjà un <code>bool</code>, <code>if (isMember)</code> suffit. Et pour le contraire, <code>if (!isMember)</code> se lit « si ce n'est pas un membre ».</p>

<h3>Imbrication vs retours anticipés</h3>
<p>Quand on vérifie plusieurs choses à la suite, on est tenté d'imbriquer les <code>if</code>. Le code part alors en escalier vers la droite et devient difficile à suivre.</p>
<pre class="diagram">IMBRIQUE                  RETOURS ANTICIPES
if (texte non vide)       if (texte vide)  -&gt; stop
  if (nombre valide)      if (pas nombre)  -&gt; stop
    if (annee ok)         if (annee futur) -&gt; stop
      traitement          traitement</pre>
<p>La technique des <strong>retours anticipés</strong> (guard clauses, « clauses de garde ») inverse la logique : on teste d'abord les cas d'erreur, et on sort immédiatement avec <code>return</code>. Le traitement principal reste tout en bas, sans indentation. Dans un programme à top-level statements, <code>return;</code> termine simplement le programme.</p>
<div class="note">Les guard clauses sont la norme dans le code .NET professionnel, en particulier au début des méthodes : on valide les paramètres, on sort tôt en cas de problème, et le « chemin heureux » se lit d'une traite.</div>`,
  examples: [
    {
      title: "Catégorie d'âge",
      code: `int age = 15;

if (age < 12)
{
    Console.WriteLine("Enfant");
}
else if (age < 18)
{
    Console.WriteLine("Adolescent");
}
else if (age < 65)
{
    Console.WriteLine("Adulte");
}
else
{
    Console.WriteLine("Senior");
}`,
      output: `Adolescent`,
      steps: [
        "<code>int age = 15;</code> : la valeur à tester.",
        "<code>if (age &lt; 12)</code> : 15 n'est pas inférieur à 12, ce bloc est sauté.",
        "<code>else if (age &lt; 18)</code> : 15 est inférieur à 18, on affiche « Adolescent ».",
        "<code>else if (age &lt; 65)</code> : jamais testé, car un bloc a déjà été exécuté.",
        "<code>else</code> : le cas par défaut, quand aucune condition n'est vraie."
      ],
      explain: "Une seule branche s'exécute : la première dont la condition est vraie."
    },
    {
      title: "Frais de livraison",
      code: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

decimal total = 42.00m;
bool isMember = true;
decimal shipping;

if (total >= 50m)
{
    shipping = 0m;
}
else if (isMember)
{
    shipping = 2.50m;
}
else
{
    shipping = 4.90m;
}

Console.WriteLine($"Frais de livraison : {shipping:F2}");
Console.WriteLine($"Total à payer : {total + shipping:F2}");`,
      output: `Frais de livraison : 2.50
Total à payer : 44.50`,
      steps: [
        "<code>decimal shipping;</code> : déclarée sans valeur. Le compilateur vérifie que chaque branche lui en donne une avant son utilisation.",
        "<code>if (total &gt;= 50m)</code> : 42 &lt; 50, pas de livraison gratuite.",
        "<code>else if (isMember)</code> : <code>isMember</code> est déjà un <code>bool</code>, pas besoin d'écrire <code>== true</code>.",
        "<code>else</code> : tarif normal pour les non-membres. Sans ce <code>else</code>, <code>shipping</code> pourrait rester vide et le code ne compilerait pas.",
        "<code>{total + shipping:F2}</code> : le calcul et le format dans la même accolade."
      ]
    },
    {
      title: "Valider une année avec des retours anticipés",
      code: `string? input = "1990";

if (string.IsNullOrWhiteSpace(input))
{
    Console.WriteLine("Saisie vide");
    return;
}

if (!int.TryParse(input, out int year))
{
    Console.WriteLine("Ce n'est pas un nombre");
    return;
}

if (year > 2026)
{
    Console.WriteLine("Année dans le futur");
    return;
}

Console.WriteLine($"Année valide : {year}");`,
      output: `Année valide : 1990`,
      steps: [
        "<code>string.IsNullOrWhiteSpace(input)</code> : vrai si le texte est null, vide ou ne contient que des espaces. Première garde.",
        "<code>return;</code> : dans un programme top-level, termine le programme immédiatement.",
        "<code>if (!int.TryParse(input, out int year))</code> : deuxième garde. Si la conversion réussit, <code>year</code> reste utilisable après le <code>if</code>.",
        "<code>if (year &gt; 2026)</code> : troisième garde, une règle métier.",
        "<code>Console.WriteLine($\"Année valide : {year}\");</code> : le chemin heureux, sans aucune indentation. Change <code>input</code> en <code>\"abc\"</code> pour voir une garde agir."
      ],
      explain: "Chaque garde élimine un cas d'erreur ; ce qui reste en bas est forcément valide."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Livre épais ou fin",
      prompt: "<p>Avec <code>int pages = 520;</code>, affiche <code>Pavé</code> si le livre a plus de 400 pages, sinon <code>Lecture rapide</code>.</p>",
      hint: "<p>Un <code>if</code> et un <code>else</code>, avec accolades.</p>",
      solution: `int pages = 520;

if (pages > 400)
{
    Console.WriteLine("Pavé");
}
else
{
    Console.WriteLine("Lecture rapide");
}`
    },
    {
      level: "moyen",
      title: "Calcul de l'amende",
      prompt: "<p>Un livre rendu en retard coûte : rien jusqu'à 0 jour de retard, 0,50 € par jour jusqu'à 10 jours, et un forfait de 10 € au-delà. Avec <code>int lateDays = 6;</code>, calcule et affiche l'amende avec deux décimales.</p>",
      hint: "<p>Un <code>if</code> / <code>else if</code> / <code>else</code>, et <code>decimal</code> pour l'argent.</p>",
      solution: `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

int lateDays = 6;
decimal fine;

if (lateDays <= 0)
{
    fine = 0m;
}
else if (lateDays <= 10)
{
    fine = lateDays * 0.50m;
}
else
{
    fine = 10m;
}

Console.WriteLine($"Amende : {fine:F2} EUR");  // 3.00`
    },
    {
      level: "difficile",
      title: "Autoriser un emprunt",
      prompt: "<p>Lis au clavier le nombre d'emprunts en cours d'un membre. Avec des retours anticipés : si la saisie n'est pas un nombre, affiche <code>Saisie invalide</code> ; si le nombre est négatif, <code>Nombre impossible</code> ; s'il vaut 5 ou plus, <code>Limite atteinte</code>. Sinon affiche combien d'emprunts il peut encore faire.</p>",
      hint: "<p>Trois <code>if</code> successifs avec <code>return;</code>, puis le message final sans indentation.</p>",
      solution: `const int MaxLoans = 5;

Console.Write("Emprunts en cours : ");
if (!int.TryParse(Console.ReadLine(), out int loans))
{
    Console.WriteLine("Saisie invalide");
    return;
}

if (loans < 0)
{
    Console.WriteLine("Nombre impossible");
    return;
}

if (loans >= MaxLoans)
{
    Console.WriteLine("Limite atteinte");
    return;
}

Console.WriteLine($"Encore {MaxLoans - loans} emprunt(s) possible(s)");`
    }
  ],
  quiz: [
    {
      q: "<p>Avec <code>int age = 70;</code>, que s'affiche-t-il ?<br><code>if (age &gt; 18) { WriteLine(\"Adulte\"); } else if (age &gt; 65) { WriteLine(\"Senior\"); }</code></p>",
      options: ["Senior", "Adulte et Senior", "Adulte"],
      answer: 2,
      why: "Seule la première condition vraie s'exécute : 70 &gt; 18, donc « Adulte », et le <code>else if</code> n'est jamais testé. Pour obtenir « Senior », il faut tester le cas le plus précis (<code>age &gt; 65</code>) en premier."
    },
    {
      q: "<p>Pourquoi mettre des accolades même autour d'une seule instruction ?</p>",
      options: ["Pour qu'une ligne ajoutée plus tard soit bien dans le bloc", "Sinon le code ne compile pas", "Pour que le programme soit plus rapide"],
      answer: 0,
      why: "Sans accolades, seule la première instruction appartient au <code>if</code>. Une ligne ajoutée ensuite s'exécuterait toujours, même si l'indentation fait croire le contraire. Le code compile sans accolades et la vitesse est identique."
    },
    {
      q: "<p>Qu'est-ce qu'une guard clause (retour anticipé) ?</p>",
      options: ["Un <code>else</code> placé à la fin d'une chaîne", "Un test d'un cas d'erreur suivi d'une sortie immédiate", "Un <code>if</code> imbriqué dans un autre"],
      answer: 1,
      why: "On teste d'abord le cas invalide et on sort aussitôt (<code>return</code>). Cela évite justement les <code>if</code> imbriqués en escalier et laisse le traitement principal sans indentation."
    }
  ],
  project: `<p><strong>Bibliothèque, étape 4.</strong> Après la lecture du choix du menu (étape 3), traite-le avec une chaîne <code>if</code> / <code>else if</code> / <code>else</code> : <code>1</code> affiche les informations du livre, <code>2</code> affiche <code>Ajout bientôt disponible</code>, <code>3</code> affiche <code>Au revoir !</code>, tout autre nombre affiche <code>Choix inconnu</code> en rouge.</p>`,
  resources: [
    { label: "Instructions de sélection : if et switch (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/selection-statements" }
  ]
});

/* ===================== 2.7 switch et switch expression ===================== */
window.COURSE.push({
  key: "l-switch",
  title: "2.7 switch et switch expression",
  summary: "Tu sauras choisir entre plusieurs cas avec l'instruction switch et avec la switch expression, plus courte, et utiliser des patterns simples comme < 100 ou or.",
  objectives: [
    "Écrire un switch classique avec case, break et default",
    "Écrire une switch expression avec => et _",
    "Utiliser les patterns relationnels et les mots-clés and / or",
    "Savoir quand préférer if ou switch"
  ],
  analogy: `<p>Pense à un standard téléphonique : « Tapez 1 pour les prêts, 2 pour les inscriptions, 3 pour parler à un conseiller ». Chaque touche mène à un service précis, et toute autre touche mène au message « choix non reconnu ».</p>
<p>Le <code>switch</code> est ce standard : une valeur en entrée, une liste de cas possibles, et un cas « par défaut » pour tout le reste.</p>`,
  lesson: `<h3>Le switch classique</h3>
<p>Le <code>switch</code> compare une valeur à une liste de <code>case</code>. Quand un cas correspond, ses instructions s'exécutent jusqu'au <code>break</code>, qui sort du switch. Le <code>default</code> attrape toutes les valeurs non prévues.</p>
<pre class="diagram">switch (choice)
{
    case "1":
        Console.WriteLine("Lister");
        break;
    case "2":
    case "3":           // deux cas, un seul bloc
        Console.WriteLine("Emprunt");
        break;
    default:
        Console.WriteLine("Inconnu");
        break;
}</pre>
<p>Pour regrouper plusieurs valeurs, on empile les <code>case</code> sans rien entre eux, comme <code>"2"</code> et <code>"3"</code> ci-dessus. Le switch fonctionne sur les entiers, les <code>char</code>, les <code>string</code> et bien d'autres types. Sur les textes, la comparaison respecte la casse : <code>"q"</code> et <code>"Q"</code> sont deux cas différents.</p>

<h3>Différence avec le switch de JavaScript</h3>
<div class="compare"><div><h4>JavaScript</h4><p>Oublier <code>break</code> est permis : l'exécution « tombe » dans le cas suivant (fall-through). Source de bugs silencieux.</p></div><div><h4>C#</h4><p>Un cas qui contient du code <strong>doit</strong> se terminer par <code>break</code> (ou <code>return</code>). Sinon : erreur de compilation. Pas de chute accidentelle.</p></div></div>
<div class="tip">Le seul regroupement autorisé en C#, ce sont des <code>case</code> vides empilés. Dès qu'un cas contient une instruction, il lui faut son <code>break</code>.</div>

<h3>La switch expression</h3>
<p>Très souvent, un switch sert juste à <strong>choisir une valeur</strong>. La switch expression (C# 8 et plus) le fait en beaucoup moins de lignes. On écrit la valeur, le mot <code>switch</code>, puis des lignes <code>cas =&gt; résultat</code> séparées par des virgules.</p>
<pre class="diagram">string action = choice switch
{
    "1" =&gt; "Lister les livres",
    "2" =&gt; "Ajouter un livre",
    _   =&gt; "Choix inconnu"
};</pre>
<p>Le <code>_</code> (appelé « discard ») joue le rôle du <code>default</code> : il attrape tout le reste. Pas de <code>break</code>, pas de <code>case</code>, et le tout est une expression : on peut la ranger dans une variable ou la mettre dans un <code>return</code>. N'oublie pas le point-virgule après l'accolade fermante.</p>
<div class="flow"><span>Valeur</span><span>Teste chaque cas dans l'ordre</span><span>Premier qui correspond</span><span>Résultat</span></div>

<h3>Les patterns simples</h3>
<p>Un <strong>pattern</strong> (motif) décrit une forme de valeur à reconnaître. Au-delà de l'égalité stricte, on peut écrire :</p>
<table>
<tr><th>Pattern</th><th>Signification</th></tr>
<tr><td><code>&lt; 100</code></td><td>toute valeur inférieure à 100 (pattern relationnel)</td></tr>
<tr><td><code>&gt;= 100 and &lt; 400</code></td><td>entre 100 inclus et 400 exclu</td></tr>
<tr><td><code>"q" or "Q"</code></td><td>l'une ou l'autre valeur</td></tr>
<tr><td><code>not 0</code></td><td>tout sauf 0</td></tr>
<tr><td><code>_</code></td><td>n'importe quoi</td></tr>
</table>
<p>Les mots-clés <code>and</code>, <code>or</code> et <code>not</code> s'écrivent en toutes lettres <strong>dans les patterns</strong>. Ailleurs, on garde <code>&amp;&amp;</code>, <code>||</code> et <code>!</code>. Comme pour <code>else if</code>, les cas sont testés dans l'ordre : mets les plus précis en premier, et <code>_</code> toujours en dernier.</p>

<h3>if ou switch ?</h3>
<table>
<tr><th>Situation</th><th>Choix conseillé</th></tr>
<tr><td>Une ou deux conditions, souvent sur des variables différentes</td><td><code>if</code> / <code>else</code></td></tr>
<tr><td>Une seule valeur comparée à plusieurs cas</td><td><code>switch</code></td></tr>
<tr><td>Chaque cas produit juste une valeur</td><td>switch expression</td></tr>
<tr><td>Chaque cas exécute plusieurs instructions</td><td>switch classique</td></tr>
</table>
<div class="note">Dans le code moderne, la switch expression est devenue la norme pour traduire une valeur en une autre (un code de statut en message, une catégorie en tarif). Si aucun cas ne correspond et qu'il n'y a pas de <code>_</code>, le compilateur t'avertit, et une exception est lancée à l'exécution : garde toujours un cas par défaut.</div>`,
  examples: [
    {
      title: "switch classique sur un choix de menu",
      code: `string choice = "2";

switch (choice)
{
    case "1":
        Console.WriteLine("Lister les livres");
        break;
    case "2":
    case "3":
        Console.WriteLine("Gérer un emprunt");
        break;
    default:
        Console.WriteLine("Choix inconnu");
        break;
}`,
      output: `Gérer un emprunt`,
      steps: [
        "<code>switch (choice)</code> : la valeur comparée aux différents cas.",
        "<code>case \"1\":</code> : ne correspond pas à \"2\", ce bloc est ignoré.",
        "<code>case \"2\": case \"3\":</code> : deux <code>case</code> empilés partagent le même bloc. \"2\" correspond.",
        "<code>break;</code> : obligatoire, il sort du switch. Sans lui, le code ne compile pas.",
        "<code>default:</code> : exécuté seulement si aucun cas ne correspond."
      ]
    },
    {
      title: "switch expression avec or et _",
      code: `string choice = "q";

string action = choice switch
{
    "1" => "Lister les livres",
    "2" => "Ajouter un livre",
    "q" or "Q" => "Quitter",
    _ => "Choix inconnu"
};

Console.WriteLine(action);`,
      output: `Quitter`,
      steps: [
        "<code>choice switch { … }</code> : la valeur testée vient avant le mot <code>switch</code>.",
        "<code>\"1\" =&gt; \"Lister les livres\",</code> : un cas, une flèche, un résultat, une virgule.",
        "<code>\"q\" or \"Q\" =&gt; \"Quitter\",</code> : le pattern <code>or</code> accepte les deux valeurs. \"q\" correspond.",
        "<code>_ =&gt; \"Choix inconnu\"</code> : le cas par défaut, toujours en dernier.",
        "<code>};</code> : l'expression entière est une affectation, elle se termine par un point-virgule."
      ],
      explain: "Huit lignes de switch classique tiennent ici en quatre cas lisibles."
    },
    {
      title: "Patterns relationnels",
      code: `int pages = 350;

string size = pages switch
{
    < 100 => "Court",
    >= 100 and < 400 => "Moyen",
    _ => "Long"
};
Console.WriteLine($"{pages} pages : {size}");

int age = 70;
int fee = age switch
{
    < 12 => 0,
    >= 65 => 5,
    _ => 10
};
Console.WriteLine($"Abonnement : {fee} EUR");`,
      output: `350 pages : Moyen
Abonnement : 5 EUR`,
      steps: [
        "<code>&lt; 100 =&gt; \"Court\"</code> : un pattern relationnel, vrai pour toute valeur inférieure à 100. 350 ne correspond pas.",
        "<code>&gt;= 100 and &lt; 400</code> : deux patterns combinés par <code>and</code>. 350 correspond, donc \"Moyen\".",
        "<code>_ =&gt; \"Long\"</code> : tout le reste, c'est-à-dire 400 et plus.",
        "<code>int fee = age switch { … }</code> : le résultat peut être de n'importe quel type, ici un <code>int</code>.",
        "<code>&gt;= 65 =&gt; 5</code> : 70 n'est pas &lt; 12 mais est ≥ 65, l'abonnement senior coûte 5."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Jour de fermeture",
      prompt: "<p>Avec <code>int day = 7;</code> (1 = lundi … 7 = dimanche), écris un switch classique qui affiche <code>Fermé</code> pour 1 et 7, <code>Ouvert</code> pour 2 à 6, et <code>Jour invalide</code> sinon.</p>",
      hint: "<p>Empile les <code>case</code> qui partagent le même bloc, et n'oublie aucun <code>break</code>.</p>",
      solution: `int day = 7;

switch (day)
{
    case 1:
    case 7:
        Console.WriteLine("Fermé");
        break;
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
        Console.WriteLine("Ouvert");
        break;
    default:
        Console.WriteLine("Jour invalide");
        break;
}`
    },
    {
      level: "moyen",
      title: "Genre d'un livre",
      prompt: "<p>Avec <code>string code = \"SF\";</code>, utilise une switch expression pour obtenir le libellé : <code>\"ROM\"</code> → Roman, <code>\"SF\"</code> ou <code>\"FAN\"</code> → Imaginaire, <code>\"BD\"</code> → Bande dessinée, sinon Autre. Affiche le résultat.</p>",
      hint: "<p>Utilise <code>or</code> pour regrouper SF et FAN, et <code>_</code> pour le reste.</p>",
      solution: `string code = "SF";

string genre = code switch
{
    "ROM" => "Roman",
    "SF" or "FAN" => "Imaginaire",
    "BD" => "Bande dessinée",
    _ => "Autre"
};

Console.WriteLine(genre);  // Imaginaire`
    },
    {
      level: "difficile",
      title: "Durée d'emprunt selon l'âge",
      prompt: "<p>Lis l'âge d'un membre au clavier (avec <code>TryParse</code> et un retour anticipé si invalide). Avec une switch expression et des patterns relationnels, détermine la durée d'emprunt : moins de 0 ou plus de 120 → 0 jour (âge impossible), moins de 12 → 14 jours, de 12 à 64 → 21 jours, 65 et plus → 28 jours. Affiche la durée, ou <code>Âge impossible</code> si elle vaut 0.</p>",
      hint: "<p>Le premier cas peut s'écrire <code>&lt; 0 or &gt; 120 =&gt; 0</code>. Ensuite, un <code>if</code> pour le message final.</p>",
      solution: `Console.Write("Âge : ");
if (!int.TryParse(Console.ReadLine(), out int age))
{
    Console.WriteLine("Saisie invalide");
    return;
}

int days = age switch
{
    < 0 or > 120 => 0,
    < 12 => 14,
    < 65 => 21,
    _ => 28
};

if (days == 0)
{
    Console.WriteLine("Âge impossible");
}
else
{
    Console.WriteLine($"Durée d'emprunt : {days} jours");
}`
    }
  ],
  quiz: [
    {
      q: "<p>En C#, que se passe-t-il si un <code>case</code> contenant une instruction n'a pas de <code>break</code> ?</p>",
      options: ["L'exécution continue dans le case suivant", "Le code ne compile pas", "Le switch s'arrête quand même"],
      answer: 1,
      why: "C# interdit le fall-through implicite : un cas non vide doit finir par <code>break</code> (ou <code>return</code>). Continuer dans le case suivant, c'est le comportement de JavaScript."
    },
    {
      q: "<p>Dans une switch expression, quel symbole remplace <code>default</code> ?</p>",
      options: ["<code>_</code>", "<code>*</code>", "<code>else</code>"],
      answer: 0,
      why: "Le discard <code>_</code> correspond à n'importe quelle valeur. Il se place en dernier, sinon il attraperait tout avant les autres cas."
    },
    {
      q: "<p>Avec <code>int n = 100;</code>, que vaut <code>n switch { &lt; 100 =&gt; \"A\", &lt;= 200 =&gt; \"B\", _ =&gt; \"C\" }</code> ?</p>",
      options: ["<code>\"A\"</code>", "<code>\"C\"</code>", "<code>\"B\"</code>"],
      answer: 2,
      why: "100 n'est pas strictement inférieur à 100, le premier cas échoue. 100 est bien ≤ 200, donc \"B\". Attention à la différence entre <code>&lt;</code> et <code>&lt;=</code>."
    },
    {
      q: "<p>Quel outil est le plus adapté pour traduire un code de genre (\"ROM\", \"SF\"…) en libellé ?</p>",
      options: ["Une suite de <code>if</code> imbriqués", "Une switch expression", "Un ternaire imbriqué"],
      answer: 1,
      why: "Une seule valeur comparée à plusieurs cas, et chaque cas produit juste une valeur : c'est exactement le rôle de la switch expression. Des <code>if</code> ou des ternaires imbriqués seraient bien moins lisibles."
    }
  ],
  project: `<p><strong>Bibliothèque, étape 5.</strong> Remplace la chaîne de <code>if</code> de l'étape 4 par une switch expression qui transforme le choix en message : <code>1 =&gt; …</code>, <code>2 =&gt; …</code>, <code>3 =&gt; "Au revoir !"</code>, <code>_ =&gt; "Choix inconnu"</code>. Ajoute aussi une switch expression qui classe le livre selon son année : avant 1950 « Classique », de 1950 à 1999 « Moderne », après « Contemporain ».</p>`,
  resources: [
    { label: "Expression switch (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/switch-expression" },
    { label: "Critères spéciaux (patterns) (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/patterns" }
  ]
});
