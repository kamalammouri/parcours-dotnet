window.COURSE = window.COURSE || [];

/* ===================== 5.7 Delegates ===================== */
window.COURSE.push({
  key: "l-delegates",
  title: "5.7 Delegates",
  summary: "Tu sauras ranger une méthode dans une variable, la passer en paramètre et l'appeler plus tard grâce à un delegate.",
  objectives: [
    "Déclarer un type delegate et lui assigner une méthode",
    "Passer une méthode en paramètre pour écrire un filtre réutilisable",
    "Comprendre le multicast avec += et -=",
    "Faire le lien avec les fonctions de première classe de JavaScript"
  ],
  analogy: `<p>Tu appelles un service client, personne n'est libre. On te dit : « Laisse ton numéro, on te rappelle. » Tu ne donnes pas <em>ta personne</em>, tu donnes <em>un moyen de te joindre</em>. Plus tard, quand c'est le bon moment, le service compose ce numéro et c'est toi qui décroches.</p><p>Un delegate, c'est ce numéro de téléphone : une variable qui contient « la méthode à rappeler ». Celui qui la reçoit ne sait pas ce qu'elle fait, il sait juste comment l'appeler.</p>`,
  lesson: `<h3>Une variable qui contient une méthode</h3>
<p>Jusqu'ici, tes variables contenaient des données : un nombre, un texte, un livre. Un <strong>delegate</strong> (en français « délégué ») est un type dont les variables contiennent une <strong>méthode</strong>. Tu peux ranger une méthode dans une variable, la donner à une autre méthode, puis l'appeler quand tu veux.</p>
<p>En JavaScript, tu fais ça tous les jours : les fonctions sont des « citoyens de première classe ». <code>const f = add; f(3, 4);</code> fonctionne tout seul. C# sait faire pareil, mais il veut un <strong>type</strong> : le delegate décrit la forme exacte de la méthode acceptée (ses paramètres et son type de retour).</p>
<div class="compare"><div><h4>TypeScript</h4><p><code>type Operation = (a: number, b: number) =&gt; number;</code><br><code>const op: Operation = add;</code></p></div><div><h4>C#</h4><p><code>delegate int Operation(int a, int b);</code><br><code>Operation op = Add;</code></p></div></div>
<p>Tu vois ? Un delegate, c'est l'équivalent typé d'un type de fonction en TypeScript. La différence : en C#, cette vérification est faite par le compilateur et elle ne disparaît jamais à l'exécution.</p>

<h3>Déclarer, assigner, appeler</h3>
<p>Il y a trois gestes à retenir, toujours dans cet ordre.</p>
<div class="flow"><span>Déclarer la forme : delegate int Operation(int a, int b)</span><span>Assigner : Operation op = Add;</span><span>Appeler : op(3, 4)</span><span>Add s'exécute et renvoie 7</span></div>
<p><strong>Déclarer</strong> : <code>delegate int Operation(int a, int b);</code> crée un nouveau type. Il dit : « j'accepte toute méthode qui prend deux <code>int</code> et renvoie un <code>int</code> ». Le nom des paramètres n'a pas d'importance, seuls leurs types comptent.</p>
<p><strong>Assigner</strong> : <code>Operation op = Add;</code> range la méthode <code>Add</code> dans la variable <code>op</code>. Attention, on écrit <code>Add</code> <em>sans</em> parenthèses : on donne la méthode, on ne l'exécute pas encore.</p>
<p><strong>Appeler</strong> : <code>op(3, 4)</code> s'écrit comme un appel de méthode normal. C# exécute la méthode rangée dedans. Si tu réassignes <code>op = Multiply;</code>, le même appel fait maintenant une multiplication.</p>

<h3>Passer une méthode en paramètre</h3>
<p>Le vrai intérêt, c'est de passer une méthode à une autre méthode. Imagine une méthode <code>Filter</code> qui parcourt une liste de nombres. Au lieu d'écrire une méthode pour « les pairs », une autre pour « les grands », une autre pour « les négatifs », tu écris <strong>un seul</strong> filtre qui reçoit le test à appliquer.</p>
<pre class="diagram">Filter(numbers, IsEven)
   |
   +-- pour chaque n : test(n) ?
           |
           +-- test pointe vers IsEven
           +-- true  -&gt; on garde n
           +-- false -&gt; on ignore n</pre>
<p><code>Filter</code> ne sait pas ce que fait le test. Il sait juste qu'il peut l'appeler avec un <code>int</code> et recevoir un <code>bool</code>. C'est exactement le « numéro de téléphone » de l'analogie : <code>Filter</code> rappelle ta méthode pour chaque nombre.</p>

<h3>Multicast : plusieurs méthodes d'un coup</h3>
<p>Un delegate peut contenir <strong>plusieurs</strong> méthodes. On en ajoute avec <code>+=</code> et on en retire avec <code>-=</code>. Quand tu appelles le delegate, toutes les méthodes s'exécutent, dans l'ordre d'ajout. On appelle ça un delegate <strong>multicast</strong>.</p>
<p>C'est très pratique pour prévenir plusieurs personnes d'un même évènement (un email ET un SMS). On s'en servira à fond dans la leçon sur les events. Pour un delegate qui renvoie une valeur, seule la valeur de la dernière méthode est gardée : le multicast sert surtout aux méthodes <code>void</code>.</p>
<div class="tip">Un delegate qui ne contient aucune méthode vaut <code>null</code>. L'appeler provoque une <code>NullReferenceException</code>. Pour l'appeler seulement s'il contient quelque chose, écris <code>op?.Invoke(3, 4)</code> : <code>Invoke</code> est la forme longue de l'appel, et <code>?.</code> ne fait rien si la variable est <code>null</code>.</div>
<div class="note">En entreprise, on déclare rarement ses propres types delegate. .NET fournit des delegates génériques prêts à l'emploi, <code>Func</code> et <code>Action</code>, que tu découvres dans la leçon suivante. Mais ils fonctionnent exactement comme ce que tu viens de voir : comprendre <code>delegate</code>, c'est comprendre tout le reste.</div>`,
  examples: [
    {
      title: "Ranger une méthode dans une variable",
      code: `// On range une méthode dans une variable
Operation op = Add;
Console.WriteLine(op(3, 4));

op = Multiply;           // même forme, autre méthode
Console.WriteLine(op(3, 4));

static int Add(int a, int b) => a + b;
static int Multiply(int a, int b) => a * b;

// La forme des méthodes acceptées : (int, int) -> int
delegate int Operation(int a, int b);`,
      output: `7
12`,
      steps: [
        "<code>delegate int Operation(int a, int b);</code> (en bas du fichier) déclare un nouveau type : « une méthode qui prend deux <code>int</code> et renvoie un <code>int</code> ».",
        "<code>Operation op = Add;</code> range la méthode <code>Add</code> dans la variable <code>op</code>. Pas de parenthèses : on ne l'exécute pas encore.",
        "<code>op(3, 4)</code> appelle la méthode rangée dans <code>op</code>, donc <code>Add(3, 4)</code>, qui renvoie 7.",
        "<code>op = Multiply;</code> remplace la méthode rangée. <code>Multiply</code> a la même forme, le compilateur accepte.",
        "<code>Console.WriteLine(op(3, 4));</code> exécute maintenant <code>Multiply(3, 4)</code> et affiche 12."
      ],
      explain: "Le même appel <code>op(3, 4)</code> donne deux résultats différents : tout dépend de la méthode rangée dans la variable."
    },
    {
      title: "Un filtre réutilisable",
      code: `int[] numbers = [1, 2, 3, 4, 5, 6];

Print(Filter(numbers, IsEven));
Print(Filter(numbers, IsBig));

// Un seul filtre, le test est passé en paramètre
static List<int> Filter(int[] items, NumberTest test)
{
    var result = new List<int>();
    foreach (var n in items)
        if (test(n)) result.Add(n);
    return result;
}

static bool IsEven(int n) => n % 2 == 0;
static bool IsBig(int n) => n > 4;
static void Print(List<int> list) => Console.WriteLine(string.Join(", ", list));

delegate bool NumberTest(int n);`,
      output: `2, 4, 6
5, 6`,
      steps: [
        "<code>delegate bool NumberTest(int n);</code> décrit un test : il reçoit un nombre et répond vrai ou faux.",
        "<code>static List&lt;int&gt; Filter(int[] items, NumberTest test)</code> reçoit le test comme n'importe quel autre paramètre.",
        "<code>if (test(n)) result.Add(n);</code> appelle le test pour chaque nombre et ne garde que ceux qui répondent <code>true</code>.",
        "<code>Filter(numbers, IsEven)</code> passe la méthode <code>IsEven</code> : on obtient 2, 4, 6.",
        "<code>Filter(numbers, IsBig)</code> réutilise le même filtre avec un autre test : on obtient 5, 6."
      ],
      explain: "Tu as écrit la boucle une seule fois. Pour un nouveau critère, il suffit d'écrire une petite méthode de test."
    },
    {
      title: "Multicast : prévenir par email et par SMS",
      code: `Notify? notify = SendEmail;        // ? : après des -=, il peut devenir null
notify += SendSms;                 // on ajoute une deuxième méthode
notify?.Invoke("Ton livre est disponible");

notify -= SendEmail;               // on retire l'email
notify?.Invoke("Rappel : retour demain");

static void SendEmail(string msg) => Console.WriteLine($"[Email] {msg}");
static void SendSms(string msg) => Console.WriteLine($"[SMS] {msg}");

delegate void Notify(string message);`,
      output: `[Email] Ton livre est disponible
[SMS] Ton livre est disponible
[SMS] Rappel : retour demain`,
      steps: [
        "<code>Notify? notify = SendEmail;</code> crée le delegate avec une première méthode. Le <code>?</code> dit qu'il peut devenir <code>null</code> : si on retire toutes ses méthodes avec <code>-=</code>, il ne contient plus rien.",
        "<code>notify += SendSms;</code> ajoute une deuxième méthode. Le delegate en contient maintenant deux.",
        "<code>notify?.Invoke(\"Ton livre est disponible\")</code> appelle les deux méthodes, dans l'ordre d'ajout : email puis SMS. Le <code>?.</code> évite l'erreur si le delegate est vide.",
        "<code>notify -= SendEmail;</code> retire l'email de la liste.",
        "Le second appel n'exécute plus que <code>SendSms</code>."
      ],
      explain: "C'est le principe des abonnements, que tu retrouveras dans la leçon sur les events."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Crier ou chuchoter",
      prompt: "<p>Déclare un delegate <code>TextTransform</code> qui prend un <code>string</code> et renvoie un <code>string</code>. Écris deux méthodes : <code>Shout</code> (met en majuscules et ajoute <code>\" !\"</code>) et <code>Whisper</code> (met en minuscules et ajoute <code>\"...\"</code>). Range-les tour à tour dans une variable <code>TextTransform</code> et affiche le résultat pour <code>\"Bonjour\"</code>.</p>",
      hint: "<p>Utilise <code>ToUpper()</code> et <code>ToLower()</code>. Le delegate se déclare en bas du fichier : <code>delegate string TextTransform(string s);</code>.</p>",
      solution: `TextTransform transform = Shout;
Console.WriteLine(transform("Bonjour"));   // BONJOUR !

transform = Whisper;
Console.WriteLine(transform("Bonjour"));   // bonjour...

static string Shout(string s) => s.ToUpper() + " !";
static string Whisper(string s) => s.ToLower() + "...";

delegate string TextTransform(string s);`
    },
    {
      level: "moyen",
      title: "Appliquer une transformation à un tableau",
      prompt: "<p>Écris une méthode <code>Apply(int[] numbers, NumberChange change)</code> qui renvoie un nouveau tableau où chaque nombre a été transformé par <code>change</code>. Teste-la avec <code>Double</code> (x 2) et <code>Square</code> (au carré) sur <code>[1, 2, 3, 4]</code>.</p>",
      hint: "<p>Crée un tableau résultat de la même taille avec <code>new int[numbers.Length]</code>, puis une boucle <code>for</code> qui remplit <code>result[i] = change(numbers[i])</code>.</p>",
      solution: `int[] numbers = [1, 2, 3, 4];

Console.WriteLine(string.Join(", ", Apply(numbers, Double))); // 2, 4, 6, 8
Console.WriteLine(string.Join(", ", Apply(numbers, Square))); // 1, 4, 9, 16

static int[] Apply(int[] numbers, NumberChange change)
{
    var result = new int[numbers.Length];
    for (int i = 0; i < numbers.Length; i++)
        result[i] = change(numbers[i]);
    return result;
}

static int Double(int x) => x * 2;
static int Square(int x) => x * x;

delegate int NumberChange(int x);`
    },
    {
      level: "difficile",
      title: "Mini-calculatrice",
      prompt: "<p>Range des méthodes dans un <code>Dictionary&lt;string, Operation&gt;</code> : la clé est le symbole (<code>\"+\"</code>, <code>\"-\"</code>, <code>\"*\"</code>), la valeur est la méthode. Parcours le dictionnaire et affiche <code>8 + 2 = 10</code>, <code>8 - 2 = 6</code>, <code>8 * 2 = 16</code>.</p>",
      hint: "<p>Dans l'initialiseur, écris <code>[\"+\"] = Add</code>. Pour parcourir, <code>foreach (var (symbol, op) in operations)</code> découpe chaque paire clé/valeur.</p>",
      solution: `var operations = new Dictionary<string, Operation>
{
    ["+"] = Add,
    ["-"] = Subtract,
    ["*"] = Multiply,
};

foreach (var (symbol, op) in operations)
    Console.WriteLine($"8 {symbol} 2 = {op(8, 2)}");

static int Add(int a, int b) => a + b;
static int Subtract(int a, int b) => a - b;
static int Multiply(int a, int b) => a * b;

delegate int Operation(int a, int b);`
    }
  ],
  quiz: [
    {
      q: "Que contient une variable de type delegate ?",
      options: ["Le résultat d'un appel de méthode", "Une référence vers une ou plusieurs méthodes", "Une copie du code source de la méthode"],
      answer: 1,
      why: "Un delegate pointe vers une méthode (ou plusieurs en multicast) qu'on pourra appeler plus tard. Ce n'est pas le résultat : la méthode n'est pas encore exécutée au moment de l'assignation."
    },
    {
      q: "Quelle ligne range la méthode <code>Add</code> dans <code>op</code> sans l'exécuter ?",
      options: ["<code>Operation op = Add();</code>", "<code>Operation op = \"Add\";</code>", "<code>Operation op = Add;</code>"],
      answer: 2,
      why: "Sans parenthèses, <code>Add</code> désigne la méthode elle-même. Avec <code>Add()</code>, tu l'appellerais (et il manquerait d'ailleurs les arguments). Une chaîne <code>\"Add\"</code> n'est qu'un texte."
    },
    {
      q: "Un delegate <code>notify</code> contient <code>SendEmail</code> puis <code>SendSms</code> (ajoutés avec <code>+=</code>). Que fait <code>notify(\"Salut\")</code> ?",
      options: ["Il appelle <code>SendEmail</code> puis <code>SendSms</code>", "Il appelle seulement <code>SendSms</code>, la dernière ajoutée", "Il provoque une erreur de compilation"],
      answer: 0,
      why: "Un delegate multicast appelle toutes ses méthodes, dans l'ordre d'ajout. <code>+=</code> ajoute, il ne remplace pas : c'est <code>=</code> qui remplacerait."
    },
    {
      q: "Quel est l'équivalent le plus proche d'un delegate en TypeScript ?",
      options: ["Une interface avec des propriétés", "Un type de fonction comme <code>(a: number) =&gt; boolean</code>", "Une classe abstraite"],
      answer: 1,
      why: "Un delegate décrit la signature d'une fonction, exactement comme un type de fonction en TypeScript. Une interface ou une classe abstraite décrivent des objets, pas une fonction seule."
    }
  ],
  resources: [
    { label: "Delegates (guide de programmation C#)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/delegates/" }
  ]
});

/* ===================== 5.8 Lambdas, Func et Action ===================== */
window.COURSE.push({
  key: "l-lambdas",
  title: "5.8 Lambdas, Func et Action",
  summary: "Tu sauras écrire des lambdas, les ranger dans des Func, Action ou Predicate et les passer aux méthodes de List<T>.",
  objectives: [
    "Écrire une lambda courte et une lambda à bloc",
    "Choisir entre Func, Action et Predicate",
    "Utiliser FindAll, RemoveAll, ForEach et Sort avec des lambdas",
    "Repérer le piège de la capture de variable dans une boucle"
  ],
  analogy: `<p>Dans la leçon précédente, pour donner un numéro à rappeler, il fallait d'abord créer une fiche contact complète (une méthode avec un nom). Une lambda, c'est le numéro griffonné sur un post-it : rapide, sans nom, écrit pile à l'endroit où on en a besoin.</p><p>Et <code>Func</code> / <code>Action</code>, ce sont des post-its déjà imprimés avec les bonnes cases : plus besoin de dessiner ton propre formulaire (ton propre <code>delegate</code>) à chaque fois.</p>`,
  lesson: `<h3>La lambda : une méthode sans nom</h3>
<p>Une <strong>lambda</strong> est une petite méthode anonyme, écrite directement là où on l'utilise. Bonne nouvelle : tu la connais déjà, ce sont les <em>arrow functions</em> de TypeScript. La syntaxe est presque identique.</p>
<div class="compare"><div><h4>TypeScript</h4><p><code>const twice = (x: number) =&gt; x * 2;</code></p></div><div><h4>C#</h4><p><code>Func&lt;int, int&gt; twice = x =&gt; x * 2;</code></p></div></div>
<p>À gauche de <code>=&gt;</code>, les paramètres. À droite, ce que la lambda renvoie. Avec un seul paramètre, pas besoin de parenthèses : <code>x =&gt; x * 2</code>. Avec plusieurs ou aucun, on les met : <code>(a, b) =&gt; a + b</code>, <code>() =&gt; 42</code>.</p>
<p>Si le corps a besoin de plusieurs instructions, on ouvre un <strong>bloc</strong> avec des accolades et on écrit <code>return</code>, comme en TypeScript : <code>score =&gt; { if (score &gt;= 10) return "reçu"; return "recalé"; }</code>.</p>

<h3>Func, Action, Predicate : les delegates tout prêts</h3>
<p>Tu te souviens de <code>delegate int Operation(int a, int b);</code> ? En pratique on ne déclare presque jamais ses propres delegates : .NET fournit des types <strong>génériques</strong> prêts à l'emploi. Le dernier type entre chevrons de <code>Func</code> est toujours le type de retour.</p>
<table>
<tr><th>Type</th><th>Ce qu'il représente</th><th>Exemple</th></tr>
<tr><td><code>Func&lt;T, TResult&gt;</code></td><td>Reçoit un <code>T</code>, <strong>renvoie</strong> un <code>TResult</code></td><td><code>Func&lt;int, int&gt; twice = x =&gt; x * 2;</code></td></tr>
<tr><td><code>Func&lt;T1, T2, TResult&gt;</code></td><td>Deux paramètres, une valeur de retour</td><td><code>Func&lt;int, int, int&gt; add = (a, b) =&gt; a + b;</code></td></tr>
<tr><td><code>Action&lt;T&gt;</code></td><td>Reçoit un <code>T</code>, ne renvoie <strong>rien</strong> (<code>void</code>)</td><td><code>Action&lt;string&gt; log = m =&gt; Console.WriteLine(m);</code></td></tr>
<tr><td><code>Predicate&lt;T&gt;</code></td><td>Reçoit un <code>T</code>, renvoie un <code>bool</code> (un test)</td><td><code>Predicate&lt;int&gt; isEven = n =&gt; n % 2 == 0;</code></td></tr>
</table>
<p>Moyen mnémotechnique : <strong>Func</strong> calcule quelque chose, <strong>Action</strong> fait quelque chose, <strong>Predicate</strong> répond oui ou non. <code>Predicate&lt;T&gt;</code> est équivalent à <code>Func&lt;T, bool&gt;</code> ; les anciennes méthodes de <code>List&lt;T&gt;</code> l'utilisent, LINQ préfère <code>Func&lt;T, bool&gt;</code>.</p>

<h3>Les lambdas avec List&lt;T&gt;</h3>
<p><code>List&lt;T&gt;</code> possède plusieurs méthodes qui attendent une lambda. C'est l'équivalent de <code>filter</code>, <code>forEach</code> ou <code>sort</code> sur un tableau JavaScript.</p>
<div class="flow"><span>prices</span><span>FindAll(p =&gt; p &lt; 10)</span><span>nouvelle liste filtrée</span></div>
<ul>
<li><code>FindAll(p =&gt; p &lt; 10)</code> renvoie une <strong>nouvelle</strong> liste avec les éléments qui passent le test.</li>
<li><code>RemoveAll(p =&gt; p &gt; 25)</code> supprime les éléments <strong>de la liste elle-même</strong> et renvoie combien ont été retirés.</li>
<li><code>ForEach(p =&gt; Console.WriteLine(p))</code> exécute une action sur chaque élément.</li>
<li><code>Sort((a, b) =&gt; b.CompareTo(a))</code> trie la liste sur place. La lambda compare deux éléments et renvoie un nombre négatif, zéro ou positif, comme le <code>compareFn</code> de <code>Array.sort</code>.</li>
</ul>

<h3>La capture de variables (closure)</h3>
<p>Une lambda peut utiliser une variable déclarée <strong>en dehors</strong> d'elle. On dit qu'elle la <strong>capture</strong>, et l'ensemble s'appelle une <em>closure</em>, exactement comme en JavaScript. Elle ne capture pas une copie, mais la variable elle-même : si la lambda modifie <code>counter</code>, c'est le vrai <code>counter</code> qui change.</p>
<pre class="diagram">int counter = 0;        [counter : 0]
                              ^
Action inc = () =&gt; counter++; |
                              |
inc(); inc();   la lambda pointe vers la
                même variable -&gt; [counter : 2]</pre>
<div class="tip">Piège classique : dans une boucle <code>for</code>, il n'existe qu'<strong>une seule</strong> variable <code>i</code> pour tous les tours. Des lambdas créées dans la boucle et exécutées après verront toutes la dernière valeur de <code>i</code>. Solution : copie <code>i</code> dans une variable locale à l'intérieur de la boucle (<code>int copy = i;</code>). Les boucles <code>foreach</code>, elles, créent une nouvelle variable à chaque tour : pas de piège.</div>
<div class="note">Garde tes lambdas courtes. Au-delà de deux ou trois lignes, donne un nom à la logique avec une vraie méthode et passe son nom : <code>prices.FindAll(IsOnSale)</code>. Le code se lit comme une phrase, et la méthode se teste toute seule.</div>`,
  examples: [
    {
      title: "Func, Action et Predicate",
      code: `Func<int, int> twice = x => x * 2;
Func<int, int, int> add = (a, b) => a + b;
Action<string> greet = name => Console.WriteLine($"Bonjour {name} !");
Predicate<int> isEven = n => n % 2 == 0;

// Une lambda à bloc : plusieurs instructions et un return
Func<int, string> grade = score =>
{
    if (score >= 10) return "reçu";
    return "recalé";
};

Console.WriteLine(twice(21));
Console.WriteLine(add(3, 4));
greet("Kamal");
Console.WriteLine(isEven(7));
Console.WriteLine(grade(12));`,
      output: `42
7
Bonjour Kamal !
False
reçu`,
      steps: [
        "<code>Func&lt;int, int&gt; twice = x =&gt; x * 2;</code> : reçoit un <code>int</code>, renvoie un <code>int</code>. Le dernier type est le retour.",
        "<code>Func&lt;int, int, int&gt; add = (a, b) =&gt; a + b;</code> : deux paramètres, donc des parenthèses.",
        "<code>Action&lt;string&gt; greet = ...</code> : ne renvoie rien, elle se contente d'afficher.",
        "<code>Predicate&lt;int&gt; isEven = n =&gt; n % 2 == 0;</code> : un test qui répond <code>true</code> ou <code>false</code>. 7 est impair, d'où <code>False</code>.",
        "<code>Func&lt;int, string&gt; grade = score =&gt; { ... };</code> : lambda à bloc, avec des <code>return</code> explicites. 12 donne <code>reçu</code>."
      ]
    },
    {
      title: "Les lambdas au service de List<T>",
      code: `var prices = new List<int> { 12, 5, 30, 8, 21 };

var cheap = prices.FindAll(p => p < 10);
Console.WriteLine($"Petits prix : {string.Join(", ", cheap)}");

int removed = prices.RemoveAll(p => p > 25);
Console.WriteLine($"Retirés : {removed}");

prices.Sort((a, b) => b.CompareTo(a));   // ordre décroissant
prices.ForEach(p => Console.WriteLine($"- {p}"));`,
      output: `Petits prix : 5, 8
Retirés : 1
- 21
- 12
- 8
- 5`,
      steps: [
        "<code>prices.FindAll(p =&gt; p &lt; 10)</code> crée une nouvelle liste avec 5 et 8. <code>prices</code> n'est pas modifiée.",
        "<code>prices.RemoveAll(p =&gt; p &gt; 25)</code> retire 30 de <code>prices</code> et renvoie 1 (un élément retiré).",
        "<code>prices.Sort((a, b) =&gt; b.CompareTo(a))</code> : on compare <code>b</code> à <code>a</code> (et non l'inverse) pour trier du plus grand au plus petit.",
        "<code>prices.ForEach(p =&gt; ...)</code> affiche chaque prix restant : 21, 12, 8, 5."
      ],
      explain: "Retiens la différence : <code>FindAll</code> crée une nouvelle liste, <code>RemoveAll</code> et <code>Sort</code> modifient la liste existante."
    },
    {
      title: "Closure et piège de la boucle for",
      code: `int counter = 0;
Action increment = () => counter++;
increment();
increment();
Console.WriteLine($"counter = {counter}");

var actions = new List<Action>();
for (int i = 0; i < 3; i++)
{
    actions.Add(() => Console.WriteLine($"piège : {i}"));
    int copy = i;                        // une nouvelle variable par tour
    actions.Add(() => Console.WriteLine($"copie : {copy}"));
}
foreach (var action in actions) action();`,
      output: `counter = 2
piège : 3
copie : 0
piège : 3
copie : 1
piège : 3
copie : 2`,
      steps: [
        "<code>Action increment = () =&gt; counter++;</code> capture la variable <code>counter</code> elle-même, pas sa valeur.",
        "Après deux appels, <code>counter</code> vaut vraiment 2 : la lambda a modifié la variable d'origine.",
        "<code>actions.Add(() =&gt; ... {i})</code> : toutes ces lambdas partagent le même <code>i</code>. Quand elles s'exécutent, la boucle est finie et <code>i</code> vaut 3.",
        "<code>int copy = i;</code> crée une nouvelle variable à chaque tour. Chaque lambda capture la sienne : 0, 1, 2.",
        "<code>foreach (var action in actions) action();</code> exécute les lambdas seulement maintenant, après la boucle."
      ],
      explain: "Une lambda se souvient de la variable, pas de la valeur au moment où tu l'as écrite."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Convertisseur de températures",
      prompt: "<p>Crée une <code>Func&lt;double, double&gt;</code> nommée <code>toFahrenheit</code> (formule : <code>c * 9 / 5 + 32</code>) et une <code>Action&lt;double&gt;</code> nommée <code>show</code> qui affiche <code>\"20 °C = 68 °F\"</code>. Teste avec 20 et 100.</p>",
      hint: "<p>Dans <code>show</code>, tu peux appeler <code>toFahrenheit</code> : une lambda peut utiliser une autre lambda capturée.</p>",
      solution: `Func<double, double> toFahrenheit = c => c * 9 / 5 + 32;
Action<double> show = c => Console.WriteLine($"{c} °C = {toFahrenheit(c)} °F");

show(20);    // 20 °C = 68 °F
show(100);   // 100 °C = 212 °F`
    },
    {
      level: "moyen",
      title: "Ranger une liste de titres",
      prompt: "<p>Pars de <code>[\"Dune\", \"Le Hobbit\", \"Fondation\", \"Les Robots\", \"Neuromancien\"]</code>. Avec des lambdas : affiche les titres de plus de 8 caractères (<code>FindAll</code>), supprime ceux qui commencent par <code>\"Le\"</code> (<code>RemoveAll</code>), trie le reste du plus court au plus long (<code>Sort</code>) et affiche-le avec <code>ForEach</code>.</p>",
      hint: "<p><code>t.StartsWith(\"Le\")</code> teste le début. Pour trier par longueur : <code>(a, b) =&gt; a.Length.CompareTo(b.Length)</code>.</p>",
      solution: `var titles = new List<string> { "Dune", "Le Hobbit", "Fondation", "Les Robots", "Neuromancien" };

var longOnes = titles.FindAll(t => t.Length > 8);
Console.WriteLine(string.Join(", ", longOnes)); // Le Hobbit, Fondation, Les Robots, Neuromancien

titles.RemoveAll(t => t.StartsWith("Le"));
titles.Sort((a, b) => a.Length.CompareTo(b.Length));
titles.ForEach(t => Console.WriteLine(t));      // Dune, Fondation, Neuromancien`
    },
    {
      level: "difficile",
      title: "Une fabrique de compteurs",
      prompt: "<p>Écris une méthode <code>MakeCounter()</code> qui renvoie une <code>Func&lt;int&gt;</code>. Chaque appel de cette <code>Func</code> renvoie le nombre suivant (1, 2, 3…). Crée deux compteurs <code>a</code> et <code>b</code> : ils doivent compter chacun de leur côté.</p>",
      hint: "<p>Déclare <code>int count = 0;</code> dans <code>MakeCounter</code>, puis renvoie <code>() =&gt; ++count</code>. Chaque appel de <code>MakeCounter</code> crée une nouvelle variable <code>count</code>.</p>",
      solution: `var a = MakeCounter();
var b = MakeCounter();

Console.WriteLine(a()); // 1
Console.WriteLine(a()); // 2
Console.WriteLine(b()); // 1 : b a son propre count

static Func<int> MakeCounter()
{
    int count = 0;
    return () => ++count;   // la lambda capture count
}`
    }
  ],
  quiz: [
    {
      q: "Quel type choisir pour une lambda qui reçoit un <code>Book</code> et ne renvoie rien ?",
      options: ["<code>Func&lt;Book&gt;</code>", "<code>Predicate&lt;Book&gt;</code>", "<code>Action&lt;Book&gt;</code>"],
      answer: 2,
      why: "<code>Action&lt;T&gt;</code> reçoit un <code>T</code> et renvoie <code>void</code>. <code>Func&lt;Book&gt;</code> ne reçoit rien et <em>renvoie</em> un <code>Book</code> : le dernier type de <code>Func</code> est toujours le retour."
    },
    {
      q: "Dans <code>Func&lt;string, int, bool&gt;</code>, quel est le type de retour ?",
      options: ["<code>bool</code>", "<code>string</code>", "<code>int</code>"],
      answer: 0,
      why: "Le dernier paramètre de type d'un <code>Func</code> est le retour. Ici, la fonction reçoit un <code>string</code> et un <code>int</code>, et renvoie un <code>bool</code>."
    },
    {
      q: "Que fait <code>list.RemoveAll(x =&gt; x &lt; 0)</code> ?",
      options: ["Renvoie une nouvelle liste sans les négatifs, l'originale ne change pas", "Supprime les négatifs de <code>list</code> et renvoie combien ont été retirés", "Supprime tous les éléments si l'un d'eux est négatif"],
      answer: 1,
      why: "<code>RemoveAll</code> modifie la liste sur place et renvoie un <code>int</code>. C'est <code>FindAll</code> qui crée une nouvelle liste sans toucher l'originale."
    },
    {
      q: "Trois lambdas créées dans <code>for (int i = 0; i &lt; 3; i++)</code> affichent <code>i</code>. Exécutées après la boucle, elles affichent :",
      options: ["0, 1, 2", "3, 3, 3", "Une erreur de compilation"],
      answer: 1,
      why: "La boucle <code>for</code> n'a qu'une variable <code>i</code>, capturée par toutes les lambdas. À la fin, elle vaut 3. Pour obtenir 0, 1, 2, copie <code>i</code> dans une variable locale à chaque tour."
    }
  ],
  project: `<p><strong>Bibliothèque : recherche avec un critère.</strong></p>
<p>Dans ta classe <code>Library</code>, ajoute une méthode <code>List&lt;Book&gt; Search(Func&lt;Book, bool&gt; criteria)</code> qui parcourt le catalogue et renvoie les livres pour lesquels <code>criteria(book)</code> vaut <code>true</code>.</p>
<ul>
<li>Teste-la avec trois critères différents, écrits en lambdas : par auteur (<code>b =&gt; b.Author == "Asimov"</code>), avant 1960, et prix inférieur à 10.</li>
<li>Bonus : range tes critères dans un <code>Dictionary&lt;string, Func&lt;Book, bool&gt;&gt;</code> (« classiques », « petits prix »…) et affiche un menu qui les liste.</li>
</ul>`,
  resources: [
    { label: "Expressions lambda", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/lambda-expressions" }
  ]
});

/* ===================== 5.9 Events ===================== */
window.COURSE.push({
  key: "l-events",
  title: "5.9 Events",
  summary: "Tu sauras déclarer un event, t'y abonner, t'en désabonner et le déclencher pour qu'un objet prévienne les autres.",
  objectives: [
    "Déclarer un event avec Action<T> ou EventHandler<TEventArgs>",
    "S'abonner avec += et se désabonner avec -=",
    "Déclencher un event en toute sécurité avec ?.Invoke",
    "Expliquer pourquoi on préfère un event à un delegate public"
  ],
  analogy: `<p>Tu t'abonnes à la newsletter de ta librairie. Tu ne passes pas tous les jours demander « Du nouveau ? » : c'est la librairie qui t'écrit quand il se passe quelque chose. Tu peux te désabonner quand tu veux.</p><p>Et surtout, toi, l'abonné, tu ne peux pas envoyer la newsletter aux autres à la place de la librairie. Seule la librairie décide quand elle part. C'est exactement ce que garantit un <code>event</code> en C#.</p>`,
  lesson: `<h3>Un objet qui prévient les autres</h3>
<p>Souvent, un objet doit prévenir d'autres objets qu'il s'est passé quelque chose : un livre vient d'être rendu, un paiement a échoué, un fichier est prêt. Il ne veut pas connaître ceux qui l'écoutent, il veut juste dire « ça y est ». C'est le rôle d'un <strong>event</strong> (évènement).</p>
<p>Un event, c'est un delegate multicast de la leçon 5.7, avec une protection en plus. On y retrouve les mêmes gestes : <code>+=</code> pour ajouter une méthode, <code>-=</code> pour la retirer, un appel pour toutes les exécuter.</p>
<div class="flow"><span>Library.Return(\"Dune\")</span><span>BookReturned?.Invoke(...)</span><span>Abonné 1 : l'accueil</span><span>Abonné 2 : un membre</span></div>

<h3>Déclarer et déclencher un event</h3>
<p>Dans la classe qui prévient (on l'appelle l'<strong>émetteur</strong>), on déclare l'event avec le mot-clé <code>event</code> devant un type delegate. Le plus simple est <code>Action&lt;T&gt;</code> : <code>public event Action&lt;string&gt;? BookReturned;</code>. Le <code>?</code> rappelle que l'event vaut <code>null</code> tant que personne ne s'est abonné.</p>
<p>Pour le déclencher, l'émetteur écrit <code>BookReturned?.Invoke(title);</code>. Le <code>?.</code> évite l'erreur si personne n'écoute : sans abonné, il ne se passe simplement rien. Par convention, on déclenche l'event <em>après</em> avoir fait le travail (le livre est bien rendu, puis on prévient).</p>

<h3>S'abonner et se désabonner</h3>
<p>Côté <strong>abonné</strong>, on donne une méthode ou une lambda avec <code>+=</code> : <code>library.BookReturned += title =&gt; Console.WriteLine(title);</code>. Pour se désabonner, on utilise <code>-=</code> avec <strong>la même</strong> méthode. Avec une lambda écrite directement, c'est impossible : chaque lambda écrite est un nouvel objet. Si tu prévois de te désabonner, passe une méthode nommée ou range la lambda dans une variable.</p>
<pre class="diagram">Library (émetteur)
  event BookReturned
     |
     +--&gt; Accueil.OnReturned      (abonné)
     +--&gt; Alice.OnBookReturned    (abonnée)
     x--  Bob s'est désabonné avec -=</pre>

<h3>EventHandler&lt;TEventArgs&gt; : la convention .NET</h3>
<p>Dans le code .NET « officiel », les events suivent un modèle standard : <code>EventHandler&lt;TEventArgs&gt;</code>. La méthode abonnée reçoit deux paramètres : <code>sender</code> (l'objet qui a déclenché l'event, de type <code>object?</code>) et <code>e</code>, un objet qui transporte les informations. Cet objet est une classe qui hérite de <code>EventArgs</code>, par exemple <code>BookReturnedEventArgs</code> avec une propriété <code>Title</code>.</p>
<table>
<tr><th>Forme</th><th>Signature de l'abonné</th><th>Quand l'utiliser</th></tr>
<tr><td><code>event Action&lt;string&gt;</code></td><td><code>void (string title)</code></td><td>Code interne, petits projets, apprentissage</td></tr>
<tr><td><code>event EventHandler&lt;BookReturnedEventArgs&gt;</code></td><td><code>void (object? sender, BookReturnedEventArgs e)</code></td><td>Bibliothèques, API publiques, code d'équipe</td></tr>
</table>
<p>L'avantage de la convention : tout développeur .NET la reconnaît, et ajouter une information plus tard (la date du retour, par exemple) ne casse pas les abonnés existants. Il suffit d'ajouter une propriété dans la classe d'arguments.</p>

<h3>Pourquoi pas un simple delegate public ?</h3>
<p>Tu pourrais écrire <code>public Action&lt;string&gt;? BookReturned;</code> sans le mot <code>event</code>. Ça marcherait… trop bien. N'importe quel code extérieur pourrait :</p>
<ul>
<li>écrire <code>library.BookReturned = null;</code> et effacer tous les abonnés d'un coup ;</li>
<li>appeler <code>library.BookReturned(\"Dune\")</code> et faire croire qu'un livre a été rendu.</li>
</ul>
<p>Le mot-clé <code>event</code> verrouille tout ça : de l'extérieur, on ne peut <strong>que</strong> faire <code>+=</code> et <code>-=</code>. Seule la classe émettrice peut déclencher l'event. C'est la newsletter : tu t'abonnes, mais tu n'envoies pas.</p>
<div class="compare"><div><h4>Côté front</h4><p><code>button.addEventListener(\"click\", fn)</code>, ou <code>@Output() returned = new EventEmitter&lt;string&gt;()</code> dans Angular.</p></div><div><h4>Côté C#</h4><p><code>library.BookReturned += fn;</code> et <code>public event Action&lt;string&gt;? BookReturned;</code></p></div></div>
<p>Si tu connais les <code>Observable</code> de RxJS : un event C# est la version simple et synchrone, sans opérateurs (pas de <code>map</code>, <code>filter</code>…) ni notion de fin de flux.</p>
<div class="tip">Les abonnés sont appelés de façon <strong>synchrone</strong>, l'un après l'autre, pendant l'appel à <code>Invoke</code>. Si un abonné lève une exception, les suivants ne sont pas appelés et l'exception remonte jusqu'à l'émetteur.</div>
<div class="note">Un abonné qui oublie de se désabonner reste référencé par l'émetteur : il ne peut pas être libéré de la mémoire tant que l'émetteur vit. Pour des objets de courte durée abonnés à un objet qui vit longtemps, pense toujours au <code>-=</code>.</div>`,
  examples: [
    {
      title: "Un event simple avec Action<string>",
      code: `var library = new Library();

// Deux abonnés, sous forme de lambdas
library.BookReturned += title => Console.WriteLine($"Accueil : {title} est de retour");
library.BookReturned += title => Console.WriteLine($"Stats : +1 retour ({title})");

library.Return("Dune");

class Library
{
    // L'event : de l'extérieur, on ne peut que faire += ou -=
    public event Action<string>? BookReturned;

    public void Return(string title)
    {
        Console.WriteLine($"Retour enregistré : {title}");
        BookReturned?.Invoke(title);   // on prévient les abonnés
    }
}`,
      output: `Retour enregistré : Dune
Accueil : Dune est de retour
Stats : +1 retour (Dune)`,
      steps: [
        "<code>public event Action&lt;string&gt;? BookReturned;</code> déclare l'event. Il vaut <code>null</code> tant que personne ne s'abonne.",
        "<code>library.BookReturned += title =&gt; ...</code> abonne une lambda. On en abonne deux.",
        "<code>library.Return(\"Dune\")</code> fait d'abord son travail : il affiche « Retour enregistré ».",
        "<code>BookReturned?.Invoke(title);</code> appelle tous les abonnés, dans l'ordre d'abonnement.",
        "Seule la classe <code>Library</code> peut écrire <code>BookReturned?.Invoke</code> : depuis <code>Program.cs</code>, le compilateur refuserait."
      ]
    },
    {
      title: "EventHandler<TEventArgs>, abonnement et désabonnement",
      code: `var library = new Library();
var alice = new Member("Alice");

library.BookReturned += alice.OnBookReturned;
library.Return("Dune");

library.BookReturned -= alice.OnBookReturned;
library.Return("Fondation");     // plus personne n'écoute

class BookReturnedEventArgs(string title) : EventArgs
{
    public string Title { get; } = title;
}

class Library
{
    public event EventHandler<BookReturnedEventArgs>? BookReturned;

    public void Return(string title)
    {
        Console.WriteLine($"Retour : {title}");
        BookReturned?.Invoke(this, new BookReturnedEventArgs(title));
    }
}

class Member(string name)
{
    public void OnBookReturned(object? sender, BookReturnedEventArgs e)
        => Console.WriteLine($"{name} est prévenue : {e.Title} est disponible");
}`,
      output: `Retour : Dune
Alice est prévenue : Dune est disponible
Retour : Fondation`,
      steps: [
        "<code>class BookReturnedEventArgs(string title) : EventArgs</code> : la « boîte » qui transporte les infos de l'event, ici le titre.",
        "<code>public event EventHandler&lt;BookReturnedEventArgs&gt;? BookReturned;</code> suit la convention .NET.",
        "<code>BookReturned?.Invoke(this, new BookReturnedEventArgs(title));</code> : <code>this</code> devient le <code>sender</code>, puis les arguments.",
        "<code>library.BookReturned += alice.OnBookReturned;</code> abonne une méthode nommée, avec la bonne signature <code>(object? sender, BookReturnedEventArgs e)</code>.",
        "<code>library.BookReturned -= alice.OnBookReturned;</code> fonctionne parce qu'on retire exactement la même méthode.",
        "Le second <code>Return</code> n'a plus d'abonné : <code>?.Invoke</code> ne fait rien, sans erreur."
      ],
      explain: "Une méthode nommée se désabonne facilement ; une lambda écrite directement, non."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Le réveil",
      prompt: "<p>Crée une classe <code>Alarm</code> avec un event <code>public event Action? Ring;</code> et une méthode <code>Trigger()</code> qui affiche <code>\"DRING !\"</code> puis déclenche l'event. Abonne deux lambdas (« Je me lève », « Je fais le café ») et appelle <code>Trigger()</code>.</p>",
      hint: "<p><code>Action</code> sans chevrons = aucun paramètre. La lambda s'écrit donc <code>() =&gt; Console.WriteLine(...)</code>.</p>",
      solution: `var alarm = new Alarm();
alarm.Ring += () => Console.WriteLine("Je me lève");
alarm.Ring += () => Console.WriteLine("Je fais le café");

alarm.Trigger();

class Alarm
{
    public event Action? Ring;

    public void Trigger()
    {
        Console.WriteLine("DRING !");
        Ring?.Invoke();
    }
}`
    },
    {
      level: "moyen",
      title: "Seuil atteint",
      prompt: "<p>Crée une classe <code>Counter</code> avec une propriété <code>Value</code>, une méthode <code>Increment()</code> et un event <code>Action&lt;int&gt;? ThresholdReached</code>. L'event se déclenche quand <code>Value</code> atteint 3 (et seulement à ce moment-là). Appelle <code>Increment()</code> cinq fois.</p>",
      hint: "<p>Dans <code>Increment()</code> : <code>Value++;</code> puis <code>if (Value == 3) ThresholdReached?.Invoke(Value);</code>.</p>",
      solution: `var counter = new Counter();
counter.ThresholdReached += value => Console.WriteLine($"Seuil atteint : {value}");

for (int i = 0; i < 5; i++)
    counter.Increment();

Console.WriteLine($"Valeur finale : {counter.Value}");

class Counter
{
    public int Value { get; private set; }
    public event Action<int>? ThresholdReached;

    public void Increment()
    {
        Value++;
        if (Value == 3) ThresholdReached?.Invoke(Value);
    }
}`
    },
    {
      level: "difficile",
      title: "Prévenu une seule fois",
      prompt: "<p>Reprends <code>Library</code> avec <code>EventHandler&lt;BookReturnedEventArgs&gt;</code>. Crée un membre qui veut être prévenu <strong>uniquement</strong> du premier retour : dans sa méthode de réception, il affiche le message puis se désabonne lui-même. Rends trois livres et vérifie qu'il n'est prévenu qu'une fois.</p>",
      hint: "<p>Le membre a besoin de connaître la bibliothèque pour se désabonner : passe-la au constructeur, abonne-toi dans le constructeur et écris <code>library.BookReturned -= OnBookReturned;</code> dans le handler.</p>",
      solution: `var library = new Library();
var bob = new OneShotMember("Bob", library);

library.Return("Dune");
library.Return("Fondation");
library.Return("Le Hobbit");

class BookReturnedEventArgs(string title) : EventArgs
{
    public string Title { get; } = title;
}

class Library
{
    public event EventHandler<BookReturnedEventArgs>? BookReturned;

    public void Return(string title)
    {
        Console.WriteLine($"Retour : {title}");
        BookReturned?.Invoke(this, new BookReturnedEventArgs(title));
    }
}

class OneShotMember
{
    private readonly string _name;
    private readonly Library _library;

    public OneShotMember(string name, Library library)
    {
        _name = name;
        _library = library;
        _library.BookReturned += OnBookReturned;
    }

    private void OnBookReturned(object? sender, BookReturnedEventArgs e)
    {
        Console.WriteLine($"{_name} est prévenu : {e.Title}");
        _library.BookReturned -= OnBookReturned;   // une seule fois
    }
}`
    }
  ],
  quiz: [
    {
      q: "Depuis <code>Program.cs</code>, que peut-on faire avec <code>library.BookReturned</code> si c'est un <code>event</code> ?",
      options: ["Seulement <code>+=</code> et <code>-=</code>", "<code>+=</code>, <code>-=</code> et l'appeler avec <code>Invoke</code>", "Tout, y compris lui assigner <code>null</code>"],
      answer: 0,
      why: "Le mot-clé <code>event</code> limite l'extérieur à l'abonnement et au désabonnement. Seule la classe qui déclare l'event peut le déclencher ou le remettre à <code>null</code>."
    },
    {
      q: "Pourquoi écrire <code>BookReturned?.Invoke(title)</code> plutôt que <code>BookReturned(title)</code> ?",
      options: ["C'est plus rapide à l'exécution", "Pour ne pas planter quand personne n'est abonné (l'event vaut <code>null</code>)", "Pour appeler les abonnés en parallèle"],
      answer: 1,
      why: "Sans abonné, l'event vaut <code>null</code> et l'appeler directement lève une <code>NullReferenceException</code>. <code>?.</code> n'appelle rien dans ce cas. Les abonnés sont toujours appelés l'un après l'autre, jamais en parallèle."
    },
    {
      q: "Tu t'es abonné avec <code>lib.BookReturned += t =&gt; Console.WriteLine(t);</code>. Que fait <code>lib.BookReturned -= t =&gt; Console.WriteLine(t);</code> ?",
      options: ["Il désabonne la lambda, puisqu'elle est identique", "Il désabonne tous les abonnés", "Rien : c'est une nouvelle lambda, différente de la première"],
      answer: 2,
      why: "Chaque lambda écrite crée un nouvel objet delegate. <code>-=</code> cherche exactement le même, ne le trouve pas, et ne fait rien. Pour pouvoir te désabonner, utilise une méthode nommée ou une variable."
    },
    {
      q: "Avec <code>EventHandler&lt;BookReturnedEventArgs&gt;</code>, que représente <code>sender</code> ?",
      options: ["L'abonné qui reçoit l'event", "L'objet qui a déclenché l'event", "Le titre du livre rendu"],
      answer: 1,
      why: "<code>sender</code> est l'émetteur, passé avec <code>this</code> dans <code>Invoke(this, ...)</code>. Le titre est dans <code>e.Title</code>, l'objet d'arguments."
    }
  ],
  project: `<p><strong>Bibliothèque : prévenir la file d'attente.</strong></p>
<p>Quand un livre est emprunté, d'autres membres peuvent le réserver. Ajoute à <code>Library</code> :</p>
<ul>
<li>un <code>Dictionary&lt;string, Queue&lt;string&gt;&gt;</code> : pour chaque titre, la file des membres qui attendent (méthode <code>Reserve(title, memberName)</code>) ;</li>
<li>un event <code>public event Action&lt;string, string&gt;? BookAvailableFor;</code> (titre, nom du membre) ;</li>
<li>une méthode <code>Return(title)</code> qui, s'il y a quelqu'un dans la file, retire le premier membre avec <code>Dequeue()</code> et déclenche l'event.</li>
</ul>
<p>Dans <code>Program.cs</code>, abonne une lambda qui affiche <code>« Alice, Dune est disponible pour toi ! »</code>. Fais réserver Alice puis Bob, rends le livre deux fois, et vérifie l'ordre des messages.</p>`,
  resources: [
    { label: "Events (guide de programmation C#)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/events/" }
  ]
});

/* ===================== 5.10 LINQ : filtrer, transformer, trier ===================== */
window.COURSE.push({
  key: "l-linq-filter",
  title: "5.10 LINQ : filtrer, transformer, trier",
  summary: "Tu sauras interroger une collection avec LINQ : filtrer avec Where, transformer avec Select, trier avec OrderBy et enchaîner le tout.",
  objectives: [
    "Filtrer, transformer et trier une collection avec Where, Select et OrderBy",
    "Récupérer un élément avec First, FirstOrDefault ou Single",
    "Paginer avec Skip/Take et tester avec Any/All",
    "Lire et écrire un pipeline LINQ, et reconnaître la syntaxe de requête"
  ],
  analogy: `<p>Imagine une chaîne de tri au bureau de poste. Les lettres passent sur un tapis : un premier poste écarte celles qui ne sont pas pour Paris, un deuxième colle une étiquette, un troisième les range par code postal. Chaque poste fait une seule chose simple.</p><p>LINQ, c'est ce tapis roulant : tu enchaînes des petites étapes (filtrer, transformer, trier) et les éléments passent de l'une à l'autre.</p>`,
  lesson: `<h3>LINQ : des requêtes sur tes collections</h3>
<p><strong>LINQ</strong> (Language Integrated Query, « requêtes intégrées au langage ») est un ensemble de méthodes pour interroger n'importe quelle collection : <code>List&lt;T&gt;</code>, tableau, <code>Dictionary</code>… Elles se trouvent dans l'espace de noms <code>System.Linq</code>, importé automatiquement dans les projets .NET récents.</p>
<p>Tu connais déjà l'idée : <code>filter</code>, <code>map</code> et <code>sort</code> sur les tableaux JavaScript. LINQ fait pareil, avec d'autres noms.</p>
<table>
<tr><th>JavaScript</th><th>LINQ (C#)</th><th>Rôle</th></tr>
<tr><td><code>filter(b =&gt; ...)</code></td><td><code>Where(b =&gt; ...)</code></td><td>Garder les éléments qui passent le test</td></tr>
<tr><td><code>map(b =&gt; ...)</code></td><td><code>Select(b =&gt; ...)</code></td><td>Transformer chaque élément</td></tr>
<tr><td><code>sort((a, b) =&gt; ...)</code></td><td><code>OrderBy(b =&gt; b.Year)</code></td><td>Trier selon une clé</td></tr>
<tr><td><code>find(b =&gt; ...)</code></td><td><code>FirstOrDefault(b =&gt; ...)</code></td><td>Trouver le premier élément</td></tr>
<tr><td><code>some</code> / <code>every</code></td><td><code>Any</code> / <code>All</code></td><td>Répondre oui ou non</td></tr>
</table>
<p>Différence importante : LINQ ne modifie <strong>jamais</strong> la collection de départ. Chaque méthode produit une nouvelle séquence, de type <code>IEnumerable&lt;T&gt;</code>. Pour obtenir une vraie liste à la fin, on appelle <code>ToList()</code>.</p>

<h3>Where, Select, OrderBy : le trio de base</h3>
<p>Dans toute cette partie, on travaille avec un petit catalogue de livres : <code>record Book(string Title, string Author, int Year, decimal Price, string Genre)</code>.</p>
<ul>
<li><code>Where(b =&gt; b.Genre == "SF")</code> garde les livres de science-fiction.</li>
<li><code>Select(b =&gt; b.Title)</code> transforme chaque livre en son titre : on passe d'une séquence de <code>Book</code> à une séquence de <code>string</code>.</li>
<li><code>Select(b =&gt; new { b.Title, b.Year })</code> crée un <strong>type anonyme</strong> : un petit objet sans nom de classe, pratique pour ne garder que quelques champs (comme <code>({ title, year })</code> en JS).</li>
<li><code>OrderBy(b =&gt; b.Year)</code> trie du plus petit au plus grand, <code>OrderByDescending</code> dans l'autre sens. Pour départager les égalités, on enchaîne <code>ThenBy</code> ou <code>ThenByDescending</code>.</li>
</ul>

<h3>Un pipeline se lit de haut en bas</h3>
<p>On enchaîne les méthodes avec un point, une par ligne. Chaque étape reçoit le résultat de la précédente.</p>
<div class="flow"><span>books</span><span>Where : genre SF</span><span>OrderBy : année</span><span>Select : texte</span><span>ToList</span></div>
<p>L'ordre compte. Filtrer d'abord, puis trier, c'est trier moins d'éléments. Et après un <code>Select(b =&gt; b.Title)</code>, tu n'as plus que des <code>string</code> : impossible ensuite de filtrer sur <code>b.Year</code>.</p>

<h3>Récupérer un seul élément</h3>
<table>
<tr><th>Méthode</th><th>Aucun élément</th><th>Plusieurs éléments</th></tr>
<tr><td><code>First(...)</code></td><td>Exception</td><td>Renvoie le premier</td></tr>
<tr><td><code>FirstOrDefault(...)</code></td><td>Renvoie <code>null</code> (ou 0 pour un <code>int</code>)</td><td>Renvoie le premier</td></tr>
<tr><td><code>Single(...)</code></td><td>Exception</td><td>Exception</td></tr>
</table>
<p><code>Single</code> sert à affirmer « il y en a exactement un », par exemple pour une recherche par identifiant. <code>FirstOrDefault</code> est le plus courant : pense ensuite à tester le <code>null</code>.</p>

<h3>Paginer, dédoublonner, vérifier</h3>
<p><code>Skip(3)</code> saute les 3 premiers éléments, <code>Take(3)</code> en garde 3 : ensemble, ils font une pagination (page 2 de 3 livres). <code>Distinct()</code> retire les doublons. <code>Any(...)</code> répond « au moins un ? » et <code>All(...)</code> « tous ? ».</p>
<div class="tip">Pour savoir si une séquence contient au moins un élément, écris <code>books.Any(b =&gt; b.Price &gt; 20)</code>, pas <code>books.Where(b =&gt; b.Price &gt; 20).Count() &gt; 0</code>. <code>Any</code> s'arrête dès qu'il trouve un élément ; <code>Count</code> parcourt tout.</div>

<h3>La syntaxe de requête</h3>
<p>LINQ existe aussi sous une forme qui ressemble à SQL : <code>from b in books where b.Year &lt; 1940 orderby b.Year select b.Title</code>. Le compilateur la traduit en appels <code>Where</code>, <code>OrderBy</code>, <code>Select</code>. Les deux formes donnent le même résultat. Tu la croiseras dans du code existant, mais la syntaxe « méthodes » est la plus utilisée aujourd'hui : c'est celle de ce cours.</p>
<div class="note">Écris une méthode LINQ par ligne, alignées sur le point. Un pipeline de cinq étapes reste lisible comme une recette ; le même sur une seule ligne devient illisible et difficile à déboguer.</div>`,
  examples: [
    {
      title: "Where, OrderBy, Select : un premier pipeline",
      code: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

var sfByYear = books
    .Where(b => b.Genre == "SF")           // filtrer
    .OrderBy(b => b.Year)                  // trier
    .Select(b => $"{b.Year} - {b.Title}")  // transformer
    .ToList();                             // matérialiser

foreach (var line in sfByYear)
    Console.WriteLine(line);

record Book(string Title, string Author, int Year, decimal Price, string Genre);`,
      output: `1950 - Les Robots
1951 - Fondation
1965 - Dune`,
      steps: [
        "<code>record Book(...)</code> (en bas) décrit un livre ; <code>books</code> contient notre catalogue de 7 livres.",
        "<code>.Where(b =&gt; b.Genre == \"SF\")</code> ne garde que les 3 livres de science-fiction.",
        "<code>.OrderBy(b =&gt; b.Year)</code> les trie par année croissante.",
        "<code>.Select(b =&gt; $\"{b.Year} - {b.Title}\")</code> transforme chaque <code>Book</code> en <code>string</code>.",
        "<code>.ToList()</code> produit une vraie <code>List&lt;string&gt;</code> que l'on parcourt avec <code>foreach</code>."
      ]
    },
    {
      title: "Un seul élément, pagination, Any, All, Distinct",
      code: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

Console.WriteLine(books.First(b => b.Author == "Tolkien").Title);
var rowling = books.FirstOrDefault(b => b.Author == "Rowling");
Console.WriteLine(rowling is null ? "Aucun Rowling" : rowling.Title);
Console.WriteLine(books.Single(b => b.Year == 1965).Title);

var page2 = books.OrderBy(b => b.Title).Skip(3).Take(3).Select(b => b.Title);
Console.WriteLine($"Page 2 : {string.Join(", ", page2)}");

Console.WriteLine($"Un livre à plus de 13 ? {books.Any(b => b.Price > 13)}");
Console.WriteLine($"Tous après 1940 ? {books.All(b => b.Year > 1940)}");
Console.WriteLine(string.Join(", ", books.Select(b => b.Author).Distinct()));

record Book(string Title, string Author, int Year, decimal Price, string Genre);`,
      output: `Le Hobbit
Aucun Rowling
Dune
Page 2 : Le Hobbit, Le Silmarillion, Les Robots
Un livre à plus de 13 ? True
Tous après 1940 ? False
Herbert, Asimov, Tolkien, Christie`,
      steps: [
        "<code>books.First(b =&gt; b.Author == \"Tolkien\")</code> renvoie le premier Tolkien du catalogue : <em>Le Hobbit</em>.",
        "<code>FirstOrDefault(...)</code> ne trouve aucun Rowling et renvoie <code>null</code> au lieu de planter ; on teste avec <code>is null</code>.",
        "<code>Single(b =&gt; b.Year == 1965)</code> : il y a exactement un livre de 1965, sinon ce serait une exception.",
        "<code>OrderBy(b =&gt; b.Title).Skip(3).Take(3)</code> : on trie par titre, on saute les 3 premiers, on garde les 3 suivants.",
        "<code>Any(b =&gt; b.Price &gt; 13)</code> est vrai grâce au Silmarillion ; <code>All(b =&gt; b.Year &gt; 1940)</code> est faux.",
        "<code>Select(b =&gt; b.Author).Distinct()</code> donne chaque auteur une seule fois, dans l'ordre d'apparition."
      ]
    },
    {
      title: "Type anonyme, ThenBy et syntaxe de requête",
      code: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

var cards = books
    .OrderBy(b => b.Genre)
    .ThenByDescending(b => b.Price)
    .Select(b => new { b.Title, b.Genre, Label = b.Price > 9 ? "cher" : "abordable" });

foreach (var card in cards)
    Console.WriteLine($"{card.Genre} | {card.Title} | {card.Label}");

// La même idée en syntaxe de requête
var old = from b in books
          where b.Year < 1940
          orderby b.Year
          select b.Title;
Console.WriteLine(string.Join(", ", old));

record Book(string Title, string Author, int Year, decimal Price, string Genre);`,
      output: `Fantasy | Le Silmarillion | cher
Fantasy | Le Hobbit | cher
Policier | Mort sur le Nil | abordable
Policier | ABC contre Poirot | abordable
SF | Dune | cher
SF | Fondation | abordable
SF | Les Robots | abordable
ABC contre Poirot, Le Hobbit, Mort sur le Nil`,
      steps: [
        "<code>.OrderBy(b =&gt; b.Genre)</code> trie par genre : Fantasy, Policier, SF.",
        "<code>.ThenByDescending(b =&gt; b.Price)</code> départage les livres d'un même genre : le plus cher d'abord.",
        "<code>new { b.Title, b.Genre, Label = ... }</code> crée un type anonyme avec trois propriétés. <code>Label</code> est calculé avec l'opérateur ternaire.",
        "<code>card.Genre</code>, <code>card.Title</code> : le compilateur connaît les propriétés du type anonyme, avec l'autocomplétion.",
        "<code>from b in books where ... orderby ... select b.Title</code> : la syntaxe de requête, traduite en <code>Where</code>, <code>OrderBy</code>, <code>Select</code>.",
        "Pour les deux livres de 1937, <code>orderby</code> garde l'ordre d'origine du catalogue : le tri de LINQ est stable."
      ],
      explain: "Méthodes ou syntaxe de requête : le résultat est le même, choisis la forme la plus lisible pour ton équipe."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Les petits prix",
      prompt: "<p>Avec le catalogue de 7 livres de la leçon, affiche les titres des livres à moins de 10, du moins cher au plus cher, au format <code>\"6 - Les Robots\"</code>.</p>",
      hint: "<p><code>Where</code> pour le prix, <code>OrderBy</code> sur <code>Price</code>, puis <code>Select</code> pour formater.</p>",
      solution: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

var cheap = books
    .Where(b => b.Price < 10)
    .OrderBy(b => b.Price)
    .Select(b => $"{b.Price} - {b.Title}");

foreach (var line in cheap)
    Console.WriteLine(line);   // 4 - ABC..., 6 - Les Robots, 8 - Mort..., 9 - Fondation

record Book(string Title, string Author, int Year, decimal Price, string Genre);`
    },
    {
      level: "moyen",
      title: "Deux auteurs triés",
      prompt: "<p>Affiche les livres d'Asimov et de Tolkien, triés par auteur puis par année, au format <code>\"Asimov - 1950 - Les Robots\"</code>. Utilise un type anonyme <code>new { b.Author, b.Year, b.Title }</code> dans le <code>Select</code>.</p>",
      hint: "<p>Dans le <code>Where</code>, combine deux conditions avec <code>||</code>. Puis <code>OrderBy(b =&gt; b.Author).ThenBy(b =&gt; b.Year)</code>.</p>",
      solution: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

var selection = books
    .Where(b => b.Author == "Asimov" || b.Author == "Tolkien")
    .OrderBy(b => b.Author)
    .ThenBy(b => b.Year)
    .Select(b => new { b.Author, b.Year, b.Title });

foreach (var s in selection)
    Console.WriteLine($"{s.Author} - {s.Year} - {s.Title}");

record Book(string Title, string Author, int Year, decimal Price, string Genre);`
    },
    {
      level: "difficile",
      title: "Une méthode de pagination",
      prompt: "<p>Écris une méthode <code>static List&lt;string&gt; GetPage(List&lt;Book&gt; books, int page, int size)</code> qui renvoie les titres de la page demandée (page 1 = les premiers), triés par titre. Affiche les pages 1, 2 et 3 avec une taille de 3. Affiche aussi si au moins un livre coûte plus de 20 (<code>Any</code>).</p>",
      hint: "<p>Pour la page <code>page</code>, on saute <code>(page - 1) * size</code> éléments, puis on en prend <code>size</code>.</p>",
      solution: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

for (int page = 1; page <= 3; page++)
    Console.WriteLine($"Page {page} : {string.Join(", ", GetPage(books, page, 3))}");

Console.WriteLine($"Plus de 20 ? {books.Any(b => b.Price > 20)}");   // False

static List<string> GetPage(List<Book> books, int page, int size) =>
    books.OrderBy(b => b.Title)
         .Skip((page - 1) * size)
         .Take(size)
         .Select(b => b.Title)
         .ToList();

record Book(string Title, string Author, int Year, decimal Price, string Genre);`
    }
  ],
  quiz: [
    {
      q: "Quel est l'équivalent LINQ du <code>map</code> de JavaScript ?",
      options: ["<code>Where</code>", "<code>Select</code>", "<code>ForEach</code>"],
      answer: 1,
      why: "<code>Select</code> transforme chaque élément en autre chose, comme <code>map</code>. <code>Where</code> correspond à <code>filter</code>."
    },
    {
      q: "Que se passe-t-il si <code>Single(b =&gt; b.Author == \"Asimov\")</code> trouve deux livres ?",
      options: ["Il renvoie le premier", "Il renvoie <code>null</code>", "Il lève une exception"],
      answer: 2,
      why: "<code>Single</code> exige exactement un résultat : zéro ou plusieurs provoquent une exception. Pour prendre le premier sans se poser de question, c'est <code>First</code> ou <code>FirstOrDefault</code>."
    },
    {
      q: "Après <code>books.Where(b =&gt; b.Price &lt; 10)</code>, que devient la liste <code>books</code> ?",
      options: ["Elle est inchangée : LINQ produit une nouvelle séquence", "Elle ne contient plus que les livres à moins de 10", "Elle est vidée"],
      answer: 0,
      why: "LINQ ne modifie jamais la collection source. Le résultat est une nouvelle séquence. C'est différent de <code>RemoveAll</code>, qui modifie la liste."
    },
    {
      q: "Comment obtenir les livres 4 à 6 d'une liste triée ?",
      options: ["<code>Take(3).Skip(3)</code>", "<code>Skip(3).Take(3)</code>", "<code>Skip(4).Take(6)</code>"],
      answer: 1,
      why: "On saute d'abord les 3 premiers, puis on garde les 3 suivants. <code>Take(3).Skip(3)</code> garde 3 éléments puis les saute tous : résultat vide."
    }
  ],
  project: `<p><strong>Bibliothèque : écran de statistiques (partie 1).</strong></p>
<p>Ajoute une méthode <code>ShowCatalogStats()</code> à ta <code>Library</code> qui affiche, uniquement avec LINQ :</p>
<ul>
<li>le catalogue trié par auteur puis par titre ;</li>
<li>les 3 livres les plus récents ;</li>
<li>la liste des genres disponibles, sans doublon ;</li>
<li>« Oui » ou « Non » : y a-t-il au moins un livre publié avant 1950 ?</li>
</ul>`,
  resources: [
    { label: "Vue d'ensemble de LINQ", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/linq/" },
    { label: "Opérateurs de requête standard", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/linq/standard-query-operators/" }
  ]
});

/* ===================== 5.11 LINQ : compter, agréger, regrouper ===================== */
window.COURSE.push({
  key: "l-linq-aggregate",
  title: "5.11 LINQ : compter, agréger, regrouper",
  summary: "Tu sauras calculer des totaux, des moyennes et des extrêmes avec LINQ, et regrouper des données avec GroupBy pour produire des rapports.",
  objectives: [
    "Calculer avec Count, Sum, Average, Min, Max, MinBy et MaxBy",
    "Regrouper avec GroupBy et utiliser Key et le contenu du groupe",
    "Construire un résumé par groupe et un dictionnaire avec ToDictionary",
    "Découper une séquence en paquets avec Chunk"
  ],
  analogy: `<p>Tu vides un sac de pièces sur la table. Tu peux les compter, faire le total, trouver la plus grosse : ce sont les agrégations, elles réduisent un tas à <strong>un seul nombre</strong>.</p><p>Tu peux aussi faire des petites piles : une pile de 1 €, une pile de 2 €, une pile de 50 centimes. C'est un regroupement. Ensuite, tu comptes chaque pile : « trois pièces de 2 € ». C'est exactement <code>GroupBy</code> suivi d'un <code>Count</code>.</p>`,
  lesson: `<h3>Réduire une séquence à une valeur</h3>
<p>Les <strong>agrégations</strong> parcourent toute une séquence et renvoient une seule valeur. On les utilise pour les tableaux de bord : nombre de livres, valeur totale du stock, prix moyen.</p>
<table>
<tr><th>Méthode</th><th>Renvoie</th><th>Exemple</th></tr>
<tr><td><code>Count()</code></td><td>Le nombre d'éléments (avec ou sans condition)</td><td><code>books.Count(b =&gt; b.Genre == "SF")</code></td></tr>
<tr><td><code>Sum(...)</code></td><td>La somme</td><td><code>books.Sum(b =&gt; b.Price)</code></td></tr>
<tr><td><code>Average(...)</code></td><td>La moyenne</td><td><code>books.Average(b =&gt; b.Price)</code></td></tr>
<tr><td><code>Min(...)</code> / <code>Max(...)</code></td><td>La plus petite / plus grande <strong>valeur</strong></td><td><code>books.Min(b =&gt; b.Year)</code> donne 1936</td></tr>
<tr><td><code>MinBy(...)</code> / <code>MaxBy(...)</code></td><td>L'<strong>élément</strong> qui a la plus petite / grande valeur</td><td><code>books.MaxBy(b =&gt; b.Price)</code> donne le livre</td></tr>
</table>
<p>La nuance <code>Max</code> / <code>MaxBy</code> est importante : <code>Max(b =&gt; b.Price)</code> renvoie <em>un prix</em> (14), <code>MaxBy(b =&gt; b.Price)</code> renvoie <em>le livre</em> le plus cher. En JavaScript, tu aurais écrit un <code>reduce</code> pour ça.</p>
<div class="tip"><code>Average</code>, <code>Min</code> et <code>Max</code> sur une séquence <strong>vide</strong> de nombres lèvent une exception. Vérifie avec <code>Any()</code> avant si la liste peut être vide. <code>Sum</code> et <code>Count</code>, eux, renvoient simplement 0. Et sur une <code>List&lt;T&gt;</code>, préfère la propriété <code>Count</code> (sans parenthèses) quand tu n'as pas de condition.</div>
<p>Pour les cas plus rares, <code>Aggregate</code> est le <code>reduce</code> de LINQ : il combine les éléments deux par deux avec ta lambda. Par exemple <code>names.Aggregate((acc, n) =&gt; acc + " &amp; " + n)</code> colle des noms entre eux. Tu t'en serviras peu : les méthodes dédiées sont plus lisibles.</p>

<h3>GroupBy : faire des piles</h3>
<p><code>GroupBy(b =&gt; b.Genre)</code> range les livres en <strong>groupes</strong> selon une clé. Le résultat est une séquence de groupes. Chaque groupe a une propriété <code>Key</code> (la valeur commune, ici le genre) et se parcourt comme une liste : il contient les livres de ce genre.</p>
<pre class="diagram">books.GroupBy(b =&gt; b.Genre)

  Key = "SF"       -&gt; Dune, Fondation, Les Robots
  Key = "Fantasy"  -&gt; Le Hobbit, Le Silmarillion
  Key = "Policier" -&gt; Mort sur le Nil, ABC contre Poirot</pre>
<p>Les groupes apparaissent dans l'ordre où leur clé est rencontrée pour la première fois. Si tu veux un ordre précis, ajoute un <code>OrderBy</code> après.</p>

<h3>Du groupe au résumé</h3>
<p>La plupart du temps, on ne veut pas lister le contenu des groupes, mais un <strong>résumé</strong> : une ligne par groupe. On enchaîne alors un <code>Select</code> qui transforme chaque groupe en petit objet, en utilisant les agrégations sur le groupe lui-même.</p>
<div class="flow"><span>books</span><span>GroupBy : genre</span><span>Select : Key, Count(), Average(...)</span><span>une ligne par genre</span></div>
<p>C'est l'équivalent du <code>GROUP BY</code> de SQL avec <code>COUNT</code> et <code>AVG</code>. Bonne nouvelle : quand tu utiliseras Entity Framework Core plus tard, ce même code LINQ sera traduit en vraie requête SQL.</p>

<h3>ToDictionary, ToLookup et Chunk</h3>
<p><code>ToDictionary(clé, valeur)</code> transforme une séquence en <code>Dictionary</code>. Combiné à <code>GroupBy</code>, il donne une table « auteur → nombre de livres » où l'on peut chercher directement : <code>perAuthor["Asimov"]</code>. Attention, chaque clé doit être unique, sinon c'est une exception.</p>
<p><code>ToLookup</code>, en une phrase : c'est un <code>GroupBy</code> exécuté tout de suite et rangé comme un dictionnaire dont chaque clé donne plusieurs éléments.</p>
<p>Enfin, <code>Chunk(3)</code> découpe une séquence en paquets de 3 éléments (le dernier peut être plus petit). Pratique pour afficher un catalogue par pages ou envoyer des données par lots.</p>
<div class="note">Dans un rapport, nomme les propriétés de tes types anonymes (<code>Genre = g.Key</code>, <code>Count = g.Count()</code>) : le code qui affiche le résultat devient lisible, et si un jour tu remplaces le type anonyme par un <code>record</code>, il n'y aura presque rien à changer.</div>`,
  examples: [
    {
      title: "Compter et calculer",
      code: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

Console.WriteLine($"Livres : {books.Count}");
Console.WriteLine($"Livres SF : {books.Count(b => b.Genre == "SF")}");
Console.WriteLine($"Valeur totale : {books.Sum(b => b.Price)}");
Console.WriteLine($"Prix moyen : {books.Average(b => b.Price)}");
Console.WriteLine($"Plus ancien : {books.Min(b => b.Year)}");
Console.WriteLine($"Prix max : {books.Max(b => b.Price)}");
Console.WriteLine($"Le plus cher : {books.MaxBy(b => b.Price)?.Title}");
Console.WriteLine($"Le moins cher : {books.MinBy(b => b.Price)?.Title}");

var authors = books.Select(b => b.Author).Distinct().Aggregate((acc, a) => acc + " & " + a);
Console.WriteLine(authors);

record Book(string Title, string Author, int Year, decimal Price, string Genre);`,
      output: `Livres : 7
Livres SF : 3
Valeur totale : 63
Prix moyen : 9
Plus ancien : 1936
Prix max : 14
Le plus cher : Le Silmarillion
Le moins cher : ABC contre Poirot
Herbert & Asimov & Tolkien & Christie`,
      steps: [
        "<code>books.Count</code> est la propriété de la liste : 7 livres. <code>books.Count(b =&gt; ...)</code> est la méthode LINQ avec condition : 3 livres SF.",
        "<code>books.Sum(b =&gt; b.Price)</code> additionne les prix : 63. <code>Average</code> divise par 7 : 9.",
        "<code>books.Min(b =&gt; b.Year)</code> et <code>Max(b =&gt; b.Price)</code> renvoient des <strong>valeurs</strong> : 1936 et 14.",
        "<code>books.MaxBy(b =&gt; b.Price)?.Title</code> renvoie le <strong>livre</strong> le plus cher, dont on lit le titre. Le <code>?.</code> protège du cas où la liste serait vide.",
        "<code>Aggregate((acc, a) =&gt; acc + \" &amp; \" + a)</code> colle les auteurs deux par deux, comme un <code>reduce</code>."
      ]
    },
    {
      title: "GroupBy : parcourir les groupes",
      code: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

foreach (var group in books.GroupBy(b => b.Genre))
{
    Console.WriteLine($"{group.Key} ({group.Count()} livres)");
    foreach (var book in group)
        Console.WriteLine($"  - {book.Title}");
}

record Book(string Title, string Author, int Year, decimal Price, string Genre);`,
      output: `SF (3 livres)
  - Dune
  - Fondation
  - Les Robots
Fantasy (2 livres)
  - Le Hobbit
  - Le Silmarillion
Policier (2 livres)
  - Mort sur le Nil
  - ABC contre Poirot`,
      steps: [
        "<code>books.GroupBy(b =&gt; b.Genre)</code> range les livres en trois groupes, un par genre.",
        "<code>group.Key</code> est la valeur commune du groupe : <code>\"SF\"</code>, puis <code>\"Fantasy\"</code>, puis <code>\"Policier\"</code>.",
        "<code>group.Count()</code> : un groupe est une séquence, on peut lui appliquer toutes les méthodes LINQ.",
        "<code>foreach (var book in group)</code> parcourt les livres du groupe, dans leur ordre d'origine.",
        "L'ordre des groupes suit la première apparition de chaque genre dans le catalogue."
      ]
    },
    {
      title: "Rapports : par auteur, par genre, par paquets",
      code: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

var perAuthor = books.GroupBy(b => b.Author).ToDictionary(g => g.Key, g => g.Count());
Console.WriteLine($"Asimov : {perAuthor["Asimov"]} livres");

var avgByGenre = books
    .GroupBy(b => b.Genre)
    .Select(g => new { Genre = g.Key, Count = g.Count(), Avg = g.Average(b => b.Price) })
    .OrderByDescending(r => r.Avg);
foreach (var row in avgByGenre)
    Console.WriteLine($"{row.Genre} : {row.Count} livres, prix moyen {row.Avg}");

foreach (var page in books.Select(b => b.Title).Chunk(3))
    Console.WriteLine(string.Join(" | ", page));

record Book(string Title, string Author, int Year, decimal Price, string Genre);`,
      output: `Asimov : 2 livres
Fantasy : 2 livres, prix moyen 12
SF : 3 livres, prix moyen 9
Policier : 2 livres, prix moyen 6
Dune | Fondation | Les Robots
Le Hobbit | Le Silmarillion | Mort sur le Nil
ABC contre Poirot`,
      steps: [
        "<code>GroupBy(b =&gt; b.Author).ToDictionary(g =&gt; g.Key, g =&gt; g.Count())</code> construit un dictionnaire auteur → nombre de livres.",
        "<code>perAuthor[\"Asimov\"]</code> lit directement la valeur : 2.",
        "<code>.Select(g =&gt; new { Genre = g.Key, Count = g.Count(), Avg = g.Average(b =&gt; b.Price) })</code> transforme chaque groupe en une ligne de résumé.",
        "<code>.OrderByDescending(r =&gt; r.Avg)</code> trie le rapport : le genre le plus cher en premier.",
        "<code>.Chunk(3)</code> découpe les 7 titres en paquets de 3, 3 et 1. Chaque paquet est un tableau <code>string[]</code>."
      ],
      explain: "Ces trois rapports tiennent en quelques lignes : c'est toute la force de LINQ."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Le rayon policier",
      prompt: "<p>Avec le catalogue de la leçon, affiche le nombre de livres policiers et la valeur totale du rayon policier.</p>",
      hint: "<p>Filtre d'abord avec <code>Where</code>, puis applique <code>Count()</code> et <code>Sum(b =&gt; b.Price)</code> sur le résultat.</p>",
      solution: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

var crime = books.Where(b => b.Genre == "Policier").ToList();
Console.WriteLine($"Policiers : {crime.Count}");                 // 2
Console.WriteLine($"Valeur : {crime.Sum(b => b.Price)}");       // 12

record Book(string Title, string Author, int Year, decimal Price, string Genre);`
    },
    {
      level: "moyen",
      title: "Nombre de livres par auteur",
      prompt: "<p>Affiche le nombre de livres par auteur, du plus grand nombre au plus petit, puis par nom d'auteur en cas d'égalité. Format : <code>\"Asimov : 2\"</code>.</p>",
      hint: "<p><code>GroupBy</code>, puis <code>Select(g =&gt; new { Author = g.Key, Count = g.Count() })</code>, puis <code>OrderByDescending</code> et <code>ThenBy</code>.</p>",
      solution: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

var report = books
    .GroupBy(b => b.Author)
    .Select(g => new { Author = g.Key, Count = g.Count() })
    .OrderByDescending(r => r.Count)
    .ThenBy(r => r.Author);

foreach (var r in report)
    Console.WriteLine($"{r.Author} : {r.Count}");
// Asimov : 2, Christie : 2, Tolkien : 2, Herbert : 1

record Book(string Title, string Author, int Year, decimal Price, string Genre);`
    },
    {
      level: "difficile",
      title: "Fiche complète par genre",
      prompt: "<p>Pour chaque genre (trié par nom), affiche une ligne : nombre de livres, année du plus ancien et titre du plus cher. Exemple : <code>\"Fantasy : 2 livres, depuis 1937, phare : Le Silmarillion\"</code>.</p>",
      hint: "<p>Dans le <code>Select</code> du groupe : <code>g.Min(b =&gt; b.Year)</code> pour l'année, <code>g.MaxBy(b =&gt; b.Price)!.Title</code> pour le titre (un groupe n'est jamais vide, le <code>!</code> est sûr ici).</p>",
      solution: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

var sheets = books
    .GroupBy(b => b.Genre)
    .OrderBy(g => g.Key)
    .Select(g => new
    {
        Genre = g.Key,
        Count = g.Count(),
        Oldest = g.Min(b => b.Year),
        Star = g.MaxBy(b => b.Price)!.Title,   // un groupe n'est jamais vide
    });

foreach (var s in sheets)
    Console.WriteLine($"{s.Genre} : {s.Count} livres, depuis {s.Oldest}, phare : {s.Star}");

record Book(string Title, string Author, int Year, decimal Price, string Genre);`
    }
  ],
  quiz: [
    {
      q: "Quelle différence entre <code>books.Max(b =&gt; b.Price)</code> et <code>books.MaxBy(b =&gt; b.Price)</code> ?",
      options: ["Aucune, ce sont deux noms pour la même méthode", "<code>Max</code> renvoie le livre, <code>MaxBy</code> renvoie le prix", "<code>Max</code> renvoie le prix le plus haut, <code>MaxBy</code> renvoie le livre qui a ce prix"],
      answer: 2,
      why: "<code>Max</code> renvoie une valeur (un <code>decimal</code>), <code>MaxBy</code> renvoie l'élément entier (un <code>Book</code>). C'est le piège inverse de la deuxième option."
    },
    {
      q: "Dans <code>books.GroupBy(b =&gt; b.Author)</code>, que contient <code>group.Key</code> ?",
      options: ["Le nom de l'auteur commun au groupe", "Le nombre de livres du groupe", "Le premier livre du groupe"],
      answer: 0,
      why: "<code>Key</code> est la valeur de regroupement, ici l'auteur. Le nombre s'obtient avec <code>group.Count()</code> et les livres en parcourant le groupe."
    },
    {
      q: "Que se passe-t-il avec <code>emptyList.Average(b =&gt; b.Price)</code> sur une liste vide ?",
      options: ["Il renvoie 0", "Il lève une exception", "Il renvoie <code>null</code>"],
      answer: 1,
      why: "La moyenne d'aucun nombre n'a pas de sens : <code>Average</code> (comme <code>Min</code> et <code>Max</code>) lève une <code>InvalidOperationException</code>. <code>Sum</code> et <code>Count</code>, eux, renvoient 0."
    },
    {
      q: "Que produit <code>new[] { 1, 2, 3, 4, 5 }.Chunk(2)</code> ?",
      options: ["Les 2 premiers éléments : [1, 2]", "Des paquets : [1, 2], [3, 4], [5]", "Deux paquets : [1, 2, 3] et [4, 5]"],
      answer: 1,
      why: "<code>Chunk(2)</code> découpe en paquets de 2 éléments maximum ; le dernier paquet contient ce qui reste. Pour juste prendre les 2 premiers, c'est <code>Take(2)</code>."
    }
  ],
  project: `<p><strong>Bibliothèque : écran de statistiques (partie 2).</strong></p>
<p>Complète <code>ShowCatalogStats()</code> avec un vrai tableau de bord :</p>
<ul>
<li>nombre total de livres, valeur totale et prix moyen du catalogue ;</li>
<li>le livre le plus ancien et le plus cher (avec <code>MinBy</code> / <code>MaxBy</code>) ;</li>
<li>pour chaque genre : nombre de livres et prix moyen, trié du genre le plus fourni au moins fourni ;</li>
<li>un <code>Dictionary&lt;string, int&gt;</code> auteur → nombre de livres, construit avec <code>ToDictionary</code>.</li>
</ul>
<p>Protège les moyennes : si le catalogue est vide, affiche « Catalogue vide » au lieu de planter.</p>`,
  resources: [
    { label: "Regroupement de données (LINQ)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/linq/standard-query-operators/grouping-data" }
  ]
});

/* ===================== 5.12 LINQ : joindre et exécution différée ===================== */
window.COURSE.push({
  key: "l-linq-join-deferred",
  title: "5.12 LINQ : joindre et exécution différée",
  summary: "Tu sauras relier deux collections avec Join et GroupJoin, aplatir avec SelectMany, et comprendre quand une requête LINQ s'exécute vraiment.",
  objectives: [
    "Relier livres et emprunts avec Join",
    "Faire une jointure gauche avec GroupJoin et aplatir avec SelectMany",
    "Expliquer l'exécution différée et la forcer avec ToList ou Count",
    "Éviter le piège de l'énumération multiple"
  ],
  analogy: `<p>Une requête LINQ, c'est une recette de cuisine écrite sur une fiche. Écrire la recette ne fait pas cuire le gâteau. Le gâteau n'est préparé qu'au moment où quelqu'un dit « on mange » (un <code>foreach</code>, un <code>ToList</code>).</p><p>Conséquence : si tu changes les ingrédients dans le placard entre l'écriture et la cuisson, le gâteau utilisera les nouveaux. Et si tu demandes deux fois le gâteau, la recette est refaite deux fois.</p>`,
  lesson: `<h3>Relier deux collections avec Join</h3>
<p>Dans une vraie application, les données sont réparties dans plusieurs collections : les livres d'un côté, les emprunts de l'autre. Un emprunt connaît le titre du livre, mais pas son auteur. Pour afficher « Dune (Herbert) emprunté par Alice », il faut <strong>relier</strong> les deux listes : c'est une <strong>jointure</strong>, comme le <code>JOIN</code> de SQL.</p>
<p><code>Join</code> prend quatre arguments : la deuxième collection, la clé côté première, la clé côté deuxième, et ce qu'on fabrique avec chaque paire trouvée.</p>
<pre class="diagram">books                       loans
+-----------+---------+     +-----------+--------+
| Title     | Author  |     | BookTitle | Member |
+-----------+---------+     +-----------+--------+
| Dune      | Herbert |&lt;---&gt;| Dune      | Alice  |
| Fondation | Asimov  |&lt;---&gt;| Fondation | Alice  |
| Le Hobbit | Tolkien |&lt;---&gt;| Le Hobbit | Bob    |
| Les Robots| Asimov  |  (pas d'emprunt : absent)
+-----------+---------+     +-----------+--------+</pre>
<p><code>Join</code> ne garde que les livres qui ont au moins un emprunt correspondant. C'est une <strong>jointure interne</strong> (<code>INNER JOIN</code>). Les livres jamais empruntés disparaissent du résultat.</p>

<h3>Jointure gauche : garder tout le monde</h3>
<p>Pour un état du stock, on veut <strong>tous</strong> les livres, empruntés ou non. C'est une <strong>jointure gauche</strong> (<code>LEFT JOIN</code>). En LINQ classique, on utilise <code>GroupJoin</code> : pour chaque livre, il fournit la liste (éventuellement vide) de ses emprunts. Il suffit ensuite de tester si cette liste est vide.</p>
<div class="compare"><div><h4>Join (interne)</h4><p>Une ligne par paire livre + emprunt. Les livres sans emprunt sont absents.</p></div><div><h4>GroupJoin (gauche)</h4><p>Une ligne par livre, avec la liste de ses emprunts. Liste vide = livre disponible.</p></div></div>

<h3>SelectMany : aplatir</h3>
<p><code>SelectMany</code> sert quand chaque élément contient lui-même une collection, et que tu veux une seule liste à plat. Par exemple, des étagères qui contiennent chacune des livres : <code>shelves.SelectMany(s =&gt; s)</code> donne tous les livres, toutes étagères confondues. C'est le <code>flatMap</code> de JavaScript.</p>

<h3>L'exécution différée</h3>
<p>Voici le point le plus surprenant de LINQ. Quand tu écris <code>var cheap = books.Where(b =&gt; b.Price &lt; 8);</code>, <strong>rien n'est calculé</strong>. <code>cheap</code> ne contient pas de livres : il contient la <em>recette</em> pour les trouver. On appelle ça l'<strong>exécution différée</strong>.</p>
<div class="flow"><span>Écrire la requête : rien ne se passe</span><span>Modifier la source</span><span>foreach / ToList : exécution maintenant</span><span>Résultat avec les données du moment</span></div>
<p>La requête s'exécute seulement quand on <strong>parcourt</strong> le résultat : avec un <code>foreach</code>, ou avec une méthode qui a besoin de toutes les valeurs. <code>ToList()</code>, <code>ToArray()</code>, <code>ToDictionary()</code>, <code>Count()</code>, <code>Sum()</code>, <code>First()</code>… provoquent une <strong>exécution immédiate</strong>.</p>
<table>
<tr><th>Différées (renvoient une recette)</th><th>Immédiates (calculent tout de suite)</th></tr>
<tr><td><code>Where</code>, <code>Select</code>, <code>OrderBy</code>, <code>Join</code>, <code>GroupBy</code>, <code>Skip</code>, <code>Take</code></td><td><code>ToList</code>, <code>ToArray</code>, <code>Count</code>, <code>Sum</code>, <code>First</code>, <code>Any</code>, <code>Max</code></td></tr>
</table>

<h3>Le piège de l'énumération multiple</h3>
<p>Puisque la requête est une recette, la parcourir deux fois l'exécute <strong>deux fois</strong>. Sur une petite liste, c'est juste du travail en double. Mais si la recette lit un fichier, appelle une base de données ou fait un calcul coûteux, tu paies deux fois, et tu peux même obtenir deux résultats différents si la source a changé entre-temps.</p>
<div class="tip">Si tu vas utiliser un résultat LINQ plusieurs fois (le compter, puis l'afficher, puis le filtrer), appelle <code>ToList()</code> une fois et réutilise la liste. Une requête parcourue une seule fois peut rester différée.</div>

<h3>IEnumerable et IQueryable</h3>
<p>Tout ce que tu as vu fonctionne sur <code>IEnumerable&lt;T&gt;</code> : des données déjà en mémoire, et des lambdas exécutées par C#. Il existe un cousin, <code>IQueryable&lt;T&gt;</code>, utilisé pour les bases de données. Là, ta requête LINQ est traduite en SQL et exécutée par la base. Même syntaxe, mais un moteur différent : on verra ça en détail avec Entity Framework Core.</p>
<div class="note">L'exécution différée devient critique avec une base de données : une requête parcourue deux fois, c'est deux allers-retours vers le serveur. Prends dès maintenant le réflexe de savoir, pour chaque variable LINQ, si c'est une recette ou un résultat.</div>`,
  examples: [
    {
      title: "Join : livres et emprunts",
      code: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};
var loans = new List<Loan> { new("Dune", "Alice"), new("Le Hobbit", "Bob"), new("Fondation", "Alice") };

var borrowed = books.Join(loans,
    book => book.Title,         // clé côté livres
    loan => loan.BookTitle,     // clé côté emprunts
    (book, loan) => $"{book.Title} ({book.Author}) -> {loan.Member}");

foreach (var line in borrowed)
    Console.WriteLine(line);

record Book(string Title, string Author, int Year, decimal Price, string Genre);
record Loan(string BookTitle, string Member);`,
      output: `Dune (Herbert) -> Alice
Fondation (Asimov) -> Alice
Le Hobbit (Tolkien) -> Bob`,
      steps: [
        "<code>record Loan(string BookTitle, string Member)</code> : un emprunt connaît le titre du livre et le nom du membre.",
        "<code>books.Join(loans, ...)</code> : on part des livres et on cherche les emprunts correspondants.",
        "<code>book =&gt; book.Title</code> et <code>loan =&gt; loan.BookTitle</code> : les deux clés à comparer. Quand elles sont égales, on a une paire.",
        "<code>(book, loan) =&gt; $\"...\"</code> fabrique une ligne avec des infos des deux côtés.",
        "Le résultat suit l'ordre des livres. Les 4 livres sans emprunt n'apparaissent pas : c'est une jointure interne."
      ]
    },
    {
      title: "Jointure gauche avec GroupJoin, et SelectMany",
      code: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
};
var loans = new List<Loan> { new("Dune", "Alice"), new("Le Hobbit", "Bob") };

var stock = books.GroupJoin(loans,
    book => book.Title,
    loan => loan.BookTitle,
    (book, bookLoans) => $"{book.Title} : {(bookLoans.Any() ? "chez " + bookLoans.First().Member : "disponible")}");
foreach (var line in stock)
    Console.WriteLine(line);

// SelectMany : aplatir des étagères en une seule liste
string[][] shelves = [["Dune", "Fondation"], ["Le Hobbit"], []];
Console.WriteLine(string.Join(", ", shelves.SelectMany(shelf => shelf)));

record Book(string Title, string Author, int Year, decimal Price, string Genre);
record Loan(string BookTitle, string Member);`,
      output: `Dune : chez Alice
Fondation : disponible
Les Robots : disponible
Le Hobbit : chez Bob
Dune, Fondation, Le Hobbit`,
      steps: [
        "<code>books.GroupJoin(loans, ...)</code> : mêmes clés que <code>Join</code>, mais on reçoit chaque livre avec <strong>tous</strong> ses emprunts.",
        "<code>(book, bookLoans) =&gt; ...</code> : <code>bookLoans</code> est une séquence, vide si le livre n'est pas emprunté.",
        "<code>bookLoans.Any() ? \"chez \" + ... : \"disponible\"</code> choisit le texte. Les parenthèses autour du ternaire sont obligatoires dans une interpolation.",
        "Résultat : une ligne par livre, même pour ceux sans emprunt. C'est une jointure gauche.",
        "<code>shelves.SelectMany(shelf =&gt; shelf)</code> transforme un tableau de tableaux en une seule séquence de titres. L'étagère vide n'ajoute rien."
      ]
    },
    {
      title: "Exécution différée et énumération multiple",
      code: `var numbers = new List<int> { 1, 2, 3 };

var bigOnes = numbers.Where(n => n > 1);            // une recette
var snapshot = numbers.Where(n => n > 1).ToList();  // un résultat

numbers.Add(10);

Console.WriteLine($"Différée : {string.Join(", ", bigOnes)}");
Console.WriteLine($"Immédiate : {string.Join(", ", snapshot)}");

// Piège : chaque parcours relance la recette
var noisy = numbers.Where(n =>
{
    Console.WriteLine($"  test de {n}");
    return n > 2;
});
Console.WriteLine($"Count = {noisy.Count()}");
Console.WriteLine($"Count = {noisy.Count()}");`,
      output: `Différée : 2, 3, 10
Immédiate : 2, 3
  test de 1
  test de 2
  test de 3
  test de 10
Count = 2
  test de 1
  test de 2
  test de 3
  test de 10
Count = 2`,
      steps: [
        "<code>var bigOnes = numbers.Where(n =&gt; n &gt; 1);</code> : aucun nombre n'est testé ici, on garde la recette.",
        "<code>var snapshot = ... .ToList();</code> : <code>ToList</code> exécute la requête tout de suite. <code>snapshot</code> contient 2 et 3, figés.",
        "<code>numbers.Add(10);</code> modifie la source <strong>après</strong> l'écriture des deux requêtes.",
        "<code>string.Join(\", \", bigOnes)</code> parcourt la recette maintenant : elle voit le 10. <code>snapshot</code>, lui, n'a pas bougé.",
        "<code>noisy.Count()</code> appelé deux fois : la lambda est exécutée deux fois sur les 4 nombres. On voit les « test de » en double.",
        "Correction : <code>var result = noisy.ToList();</code> une fois, puis <code>result.Count</code> autant de fois que tu veux."
      ],
      explain: "Une variable LINQ sans ToList est une recette : elle reflète l'état de la source au moment où on la parcourt."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Emprunts avec le prix",
      prompt: "<p>Avec les 7 livres de la leçon et les emprunts <code>(\"Dune\", \"Alice\")</code>, <code>(\"Mort sur le Nil\", \"Chloé\")</code>, fais un <code>Join</code> qui affiche <code>\"Alice a emprunté Dune (12)\"</code>.</p>",
      hint: "<p>Les clés sont <code>book.Title</code> et <code>loan.BookTitle</code>. Dans le résultat, tu as accès à <code>book.Price</code> et à <code>loan.Member</code>.</p>",
      solution: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};
var loans = new List<Loan> { new("Dune", "Alice"), new("Mort sur le Nil", "Chloé") };

var lines = books.Join(loans,
    book => book.Title,
    loan => loan.BookTitle,
    (book, loan) => $"{loan.Member} a emprunté {book.Title} ({book.Price})");

foreach (var line in lines)
    Console.WriteLine(line);

record Book(string Title, string Author, int Year, decimal Price, string Genre);
record Loan(string BookTitle, string Member);`
    },
    {
      level: "moyen",
      title: "Les livres jamais empruntés",
      prompt: "<p>Avec <code>GroupJoin</code>, affiche uniquement les titres des livres qui n'ont <strong>aucun</strong> emprunt. Emprunts : Dune (Alice), Le Hobbit (Bob), Dune (Chloé).</p>",
      hint: "<p>Dans le <code>GroupJoin</code>, fabrique un type anonyme <code>new { book.Title, Count = bookLoans.Count() }</code>, puis filtre avec <code>Where(x =&gt; x.Count == 0)</code>.</p>",
      solution: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};
var loans = new List<Loan> { new("Dune", "Alice"), new("Le Hobbit", "Bob"), new("Dune", "Chloé") };

var neverBorrowed = books
    .GroupJoin(loans, b => b.Title, l => l.BookTitle,
        (book, bookLoans) => new { book.Title, Count = bookLoans.Count() })
    .Where(x => x.Count == 0)
    .Select(x => x.Title);

Console.WriteLine(string.Join(", ", neverBorrowed));
// Fondation, Les Robots, Le Silmarillion, Mort sur le Nil, ABC contre Poirot

record Book(string Title, string Author, int Year, decimal Price, string Genre);
record Loan(string BookTitle, string Member);`
    },
    {
      level: "difficile",
      title: "Listes d'envies",
      prompt: "<p>Chaque membre a une liste d'envies : <code>record Reader(string Name, List&lt;string&gt; Wishlist)</code>. Avec trois lecteurs (dont des titres en commun), affiche : tous les titres demandés sans doublon (<code>SelectMany</code> + <code>Distinct</code>), puis le titre le plus demandé. Range le résultat aplati dans une liste une seule fois pour ne pas le recalculer.</p>",
      hint: "<p><code>var all = readers.SelectMany(r =&gt; r.Wishlist).ToList();</code> puis <code>all.Distinct()</code> et <code>all.GroupBy(t =&gt; t).MaxBy(g =&gt; g.Count())</code>.</p>",
      solution: `var readers = new List<Reader>
{
    new("Alice", ["Dune", "Fondation"]),
    new("Bob", ["Dune", "Le Hobbit"]),
    new("Chloé", ["Dune", "Fondation", "Les Robots"]),
};

// ToList : on aplatit une seule fois, puis on réutilise
var all = readers.SelectMany(r => r.Wishlist).ToList();

Console.WriteLine($"Demandés : {string.Join(", ", all.Distinct())}");

var top = all.GroupBy(title => title).MaxBy(g => g.Count());
Console.WriteLine($"Le plus demandé : {top?.Key} ({top?.Count()} fois)");   // Dune (3 fois)

record Reader(string Name, List<string> Wishlist);`
    }
  ],
  quiz: [
    {
      q: "Un livre n'a aucun emprunt. Apparaît-il dans le résultat de <code>books.Join(loans, ...)</code> ?",
      options: ["Oui, avec un emprunt vide", "Non, <code>Join</code> ne garde que les paires qui correspondent", "Oui, mais seulement à la fin du résultat"],
      answer: 1,
      why: "<code>Join</code> est une jointure interne : sans correspondance, pas de ligne. Pour garder tous les livres, utilise <code>GroupJoin</code> (jointure gauche)."
    },
    {
      q: "<code>var q = list.Where(x =&gt; x &gt; 0);</code> puis <code>list.Add(5);</code> puis <code>foreach (var x in q)</code>. Le 5 est-il parcouru ?",
      options: ["Oui, la requête s'exécute au moment du <code>foreach</code>", "Non, la requête a été calculée à la première ligne", "Ça provoque une exception"],
      answer: 0,
      why: "Grâce à l'exécution différée, <code>q</code> est une recette exécutée lors du <code>foreach</code>, avec l'état actuel de la liste. Avec <code>.ToList()</code> à la première ligne, le 5 n'aurait pas été vu."
    },
    {
      q: "Laquelle de ces méthodes exécute la requête immédiatement ?",
      options: ["<code>Select</code>", "<code>OrderBy</code>", "<code>Count</code>"],
      answer: 2,
      why: "<code>Count</code> doit tout parcourir pour renvoyer un nombre : exécution immédiate. <code>Select</code> et <code>OrderBy</code> renvoient une nouvelle recette, exécutée plus tard."
    },
    {
      q: "Quel est l'équivalent JavaScript de <code>SelectMany</code> ?",
      options: ["<code>map</code>", "<code>flatMap</code>", "<code>reduce</code>"],
      answer: 1,
      why: "<code>SelectMany</code> transforme chaque élément en collection puis aplatit le tout, exactement comme <code>flatMap</code>. <code>map</code> (donc <code>Select</code>) garderait des collections imbriquées."
    }
  ],
  project: `<p><strong>Bibliothèque : les emprunts en cours.</strong></p>
<p>Tes emprunts stockent un identifiant de membre : <code>record Loan(string BookTitle, int MemberId, DateOnly DueDate)</code>, et tes membres : <code>record Member(int Id, string Name)</code>.</p>
<ul>
<li>Écris <code>ShowCurrentLoans()</code> qui fait un <code>Join</code> entre emprunts et membres (sur <code>MemberId</code> / <code>Id</code>) et affiche <code>« Dune - Alice - à rendre le 12/11 »</code>, trié par date de retour.</li>
<li>Ajoute un second <code>Join</code> avec le catalogue pour afficher aussi l'auteur.</li>
<li>Écris <code>ShowStock()</code> avec <code>GroupJoin</code> : chaque livre, avec « disponible » ou le nom de l'emprunteur.</li>
</ul>`,
  resources: [
    { label: "Opérations de jointure (LINQ)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/linq/standard-query-operators/join-operations" }
  ]
});

/* ===================== 5.13 Méthodes d'extension ===================== */
window.COURSE.push({
  key: "l-extension-methods",
  title: "5.13 Méthodes d'extension",
  summary: "Tu sauras ajouter tes propres méthodes à des types existants, y compris écrire ta propre méthode LINQ.",
  objectives: [
    "Écrire une méthode d'extension avec une classe static et le mot-clé this",
    "Comprendre que LINQ est construit avec des méthodes d'extension",
    "Écrire une extension LINQ avec yield return",
    "Appliquer les bonnes pratiques : namespace, usage modéré"
  ],
  analogy: `<p>Tu as un smartphone. Tu ne peux pas ouvrir la coque pour ajouter une puce, mais tu peux installer une application : elle apparaît sur l'écran d'accueil, comme si elle avait toujours été là.</p><p>Une méthode d'extension, c'est cette application : tu ne modifies pas la classe <code>string</code> (impossible, ce n'est pas ton code), mais <code>"Dune".Truncate(10)</code> apparaît dans l'autocomplétion comme une vraie méthode.</p>`,
  lesson: `<h3>Ajouter une méthode à un type qui n'est pas à toi</h3>
<p>Tu aimerais écrire <code>title.Truncate(10)</code> pour couper un titre trop long. Mais <code>string</code> est une classe de .NET : tu ne peux pas la modifier, ni en hériter (elle est <code>sealed</code>). La solution habituelle serait une méthode utilitaire : <code>TextHelper.Truncate(title, 10)</code>. Ça marche, mais ça se lit moins bien.</p>
<p>Une <strong>méthode d'extension</strong> te permet d'écrire <code>title.Truncate(10)</code> sans toucher à <code>string</code>. C'est une méthode statique normale, avec une syntaxe spéciale qui permet de l'appeler comme si elle faisait partie du type.</p>

<h3>La recette : static + this</h3>
<p>Trois règles, pas une de plus :</p>
<ul>
<li>la méthode est dans une classe <code>static</code> (non générique, de premier niveau) ;</li>
<li>la méthode elle-même est <code>static</code> ;</li>
<li>son premier paramètre est précédé du mot-clé <code>this</code> : c'est le type que tu étends.</li>
</ul>
<p><code>public static string Truncate(this string text, int maxLength)</code> se lit : « j'ajoute <code>Truncate</code> à tous les <code>string</code> ; l'objet sur lequel on l'appelle arrive dans <code>text</code> ».</p>
<div class="flow"><span>title.Truncate(10)</span><span>Le compilateur réécrit</span><span>StringExtensions.Truncate(title, 10)</span></div>
<p>Ce n'est que du sucre syntaxique : le compilateur transforme l'appel en appel statique classique. La méthode n'a donc accès qu'aux membres <strong>publics</strong> du type. Elle ne peut pas lire ses champs privés.</p>
<div class="compare"><div><h4>TypeScript</h4><p>Pour ajouter une méthode à <code>String</code>, il faudrait modifier <code>String.prototype</code> : déconseillé, cela touche tout le programme.</p></div><div><h4>C#</h4><p>L'extension est visible seulement là où son namespace est importé avec <code>using</code>. Aucun type n'est réellement modifié.</p></div></div>

<h3>LINQ est fait de méthodes d'extension</h3>
<p>Surprise : tu utilises des méthodes d'extension depuis trois leçons. <code>Where</code>, <code>Select</code>, <code>OrderBy</code>… sont toutes déclarées dans la classe statique <code>System.Linq.Enumerable</code>, sous la forme <code>public static IEnumerable&lt;T&gt; Where&lt;T&gt;(this IEnumerable&lt;T&gt; source, Func&lt;T, bool&gt; predicate)</code>.</p>
<p>Elles étendent l'interface <code>IEnumerable&lt;T&gt;</code>. Voilà pourquoi elles marchent sur une liste, un tableau, un dictionnaire, un <code>HashSet</code> : tous implémentent cette interface. Et voilà pourquoi, sans <code>using System.Linq;</code> (importé automatiquement dans les projets récents), elles disparaissent de l'autocomplétion.</p>

<h3>Écrire ta propre méthode LINQ</h3>
<p>Tu peux donc écrire tes propres opérateurs LINQ. Par exemple <code>WhereNotNull()</code>, qui retire les <code>null</code> d'une séquence. On combine trois choses déjà vues : une extension sur <code>IEnumerable&lt;T?&gt;</code>, un générique avec contrainte (<code>where T : class</code>), et <code>yield return</code> pour produire les éléments un par un.</p>
<pre class="diagram">names.WhereNotNull()
  |
  foreach item in source
     null    -&gt; ignoré
     "Alice" -&gt; yield return "Alice"
     ...
  -&gt; IEnumerable&lt;string&gt; (sans null)</pre>
<p>Grâce à <code>yield return</code>, ta méthode respecte l'exécution différée, comme les vraies méthodes LINQ : rien ne s'exécute avant que quelqu'un parcoure le résultat. Et elle s'enchaîne naturellement avec <code>Where</code>, <code>Select</code>…</p>

<h3>Et C# 14 ?</h3>
<p>C# 14 ajoute les <strong>extension members</strong> : dans la classe statique, un bloc <code>extension(string text) { ... }</code> permet de déclarer aussi des <em>propriétés</em> d'extension, et pas seulement des méthodes. La syntaxe <code>this</code> que tu viens d'apprendre reste valable et c'est celle que tu croiseras le plus.</p>
<div class="tip">Si le type possède déjà une méthode avec le même nom et les mêmes paramètres, c'est <strong>toujours</strong> la méthode du type qui gagne : ton extension est silencieusement ignorée. Choisis des noms qui n'existent pas déjà.</div>
<div class="note">Bonnes pratiques : regroupe tes extensions par type étendu (<code>StringExtensions</code>, <code>BookExtensions</code>), dans un namespace dédié pour qu'elles n'apparaissent que là où on les importe. N'en abuse pas : une extension doit être générale et sans surprise. Si elle a besoin de l'état interne d'une classe que tu possèdes, c'est une vraie méthode de cette classe qu'il faut écrire.</div>`,
  examples: [
    {
      title: "Truncate : étendre string",
      code: `string title = "Le Seigneur des anneaux";

Console.WriteLine(title.Truncate(10));
Console.WriteLine("Dune".Truncate(10));
Console.WriteLine(StringExtensions.Truncate(title, 5));   // appel classique

static class StringExtensions
{
    public static string Truncate(this string text, int maxLength)
    {
        if (text.Length <= maxLength) return text;
        return text[..maxLength] + "...";
    }
}`,
      output: `Le Seigneu...
Dune
Le Se...`,
      steps: [
        "<code>static class StringExtensions</code> : les extensions vivent dans une classe statique.",
        "<code>public static string Truncate(this string text, int maxLength)</code> : le <code>this</code> devant le premier paramètre fait de <code>Truncate</code> une extension de <code>string</code>.",
        "<code>text[..maxLength]</code> prend les <code>maxLength</code> premiers caractères (un « range », comme <code>slice(0, n)</code> en JS).",
        "<code>title.Truncate(10)</code> : <code>title</code> arrive dans <code>text</code>, 10 dans <code>maxLength</code>.",
        "<code>\"Dune\".Truncate(10)</code> : le texte est assez court, il est renvoyé tel quel.",
        "<code>StringExtensions.Truncate(title, 5)</code> : la même méthode appelée de façon classique. C'est ce que le compilateur génère en coulisses."
      ]
    },
    {
      title: "Ta propre méthode LINQ : WhereNotNull",
      code: `string?[] names = ["Alice", null, "Bob", null, "Claire"];

var upper = names
    .WhereNotNull()                 // notre extension
    .Select(n => n.ToUpper());      // n est un string, plus un string?

foreach (var name in upper)
    Console.WriteLine(name);

static class EnumerableExtensions
{
    public static IEnumerable<T> WhereNotNull<T>(this IEnumerable<T?> source)
        where T : class
    {
        foreach (var item in source)
            if (item is not null)
                yield return item;
    }
}`,
      output: `ALICE
BOB
CLAIRE`,
      steps: [
        "<code>string?[] names</code> : un tableau dont les cases peuvent être <code>null</code>.",
        "<code>this IEnumerable&lt;T?&gt; source</code> : on étend toute séquence d'éléments éventuellement nuls.",
        "<code>where T : class</code> : la contrainte (leçon 5.6) limite <code>T</code> aux types référence, pour que <code>T?</code> ait un sens.",
        "<code>if (item is not null) yield return item;</code> : on produit seulement les éléments non nuls, un par un.",
        "<code>.WhereNotNull().Select(n =&gt; n.ToUpper())</code> : notre méthode s'enchaîne avec LINQ, et le type de retour <code>IEnumerable&lt;T&gt;</code> dit au compilateur que <code>n</code> n'est plus nul."
      ]
    },
    {
      title: "Des extensions d'affichage pour Book",
      code: `var books = new List<Book>
{
    new("Dune", "Herbert", 1965, 12m, "SF"),
    new("Fondation", "Asimov", 1951, 9m, "SF"),
    new("Les Robots", "Asimov", 1950, 6m, "SF"),
    new("Le Hobbit", "Tolkien", 1937, 10m, "Fantasy"),
    new("Le Silmarillion", "Tolkien", 1977, 14m, "Fantasy"),
    new("Mort sur le Nil", "Christie", 1937, 8m, "Policier"),
    new("ABC contre Poirot", "Christie", 1936, 4m, "Policier"),
};

foreach (var card in books.Where(b => b.IsClassic()).Select(b => b.ToCard()))
    Console.WriteLine(card);

static class BookExtensions
{
    public static string ToCard(this Book book) =>
        $"[{book.Genre}] {book.Title}, {book.Author} ({book.Year})";

    public static bool IsClassic(this Book book) => book.Year < 1940;
}

record Book(string Title, string Author, int Year, decimal Price, string Genre);`,
      output: `[Fantasy] Le Hobbit, Tolkien (1937)
[Policier] Mort sur le Nil, Christie (1937)
[Policier] ABC contre Poirot, Christie (1936)`,
      steps: [
        "<code>static class BookExtensions</code> regroupe les extensions du type <code>Book</code>.",
        "<code>public static string ToCard(this Book book)</code> : une fiche d'affichage, sans toucher au <code>record Book</code>.",
        "<code>public static bool IsClassic(this Book book) =&gt; book.Year &lt; 1940;</code> : une règle métier lisible.",
        "<code>books.Where(b =&gt; b.IsClassic())</code> : l'extension s'utilise dans une lambda comme une vraie méthode.",
        "<code>.Select(b =&gt; b.ToCard())</code> transforme chaque livre classique en texte."
      ],
      explain: "Le record <code>Book</code> reste simple (des données), l'affichage vit à côté."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Pair ou impair",
      prompt: "<p>Écris une extension <code>IsEven()</code> sur <code>int</code> qui renvoie <code>true</code> si le nombre est pair. Teste-la avec <code>4.IsEven()</code> et <code>7.IsEven()</code>.</p>",
      hint: "<p>Classe <code>static class IntExtensions</code>, méthode <code>public static bool IsEven(this int n) =&gt; n % 2 == 0;</code>.</p>",
      solution: `Console.WriteLine(4.IsEven());   // True
Console.WriteLine(7.IsEven());   // False

static class IntExtensions
{
    public static bool IsEven(this int n) => n % 2 == 0;
}`
    },
    {
      level: "moyen",
      title: "Les initiales",
      prompt: "<p>Écris une extension <code>ToInitials()</code> sur <code>string</code> : <code>\"Jean Paul Sartre\".ToInitials()</code> renvoie <code>\"J.P.S.\"</code>. Ignore les espaces en trop.</p>",
      hint: "<p><code>text.Split(' ', StringSplitOptions.RemoveEmptyEntries)</code> découpe en mots, puis <code>Select(w =&gt; char.ToUpper(w[0]) + \".\")</code> et <code>string.Concat(...)</code> pour recoller.</p>",
      solution: `Console.WriteLine("Jean Paul Sartre".ToInitials());    // J.P.S.
Console.WriteLine("  agatha   christie ".ToInitials()); // A.C.

static class StringExtensions
{
    public static string ToInitials(this string text) =>
        string.Concat(text
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Select(word => char.ToUpper(word[0]) + "."));
}`
    },
    {
      level: "difficile",
      title: "Un élément sur n",
      prompt: "<p>Écris une extension LINQ générique <code>EveryNth&lt;T&gt;(this IEnumerable&lt;T&gt; source, int n)</code> qui renvoie un élément sur <code>n</code> (le 1er, le (n+1)e…) avec <code>yield return</code>. Teste-la sur les nombres de 1 à 10 avec <code>n = 3</code> (résultat : 1, 4, 7, 10), puis enchaîne un <code>Select</code>.</p>",
      hint: "<p>Garde un compteur <code>int index = 0;</code> dans la boucle <code>foreach</code> : <code>if (index % n == 0) yield return item; index++;</code>.</p>",
      solution: `var numbers = Enumerable.Range(1, 10);

Console.WriteLine(string.Join(", ", numbers.EveryNth(3)));                    // 1, 4, 7, 10
Console.WriteLine(string.Join(", ", numbers.EveryNth(3).Select(x => x * 10))); // 10, 40, 70, 100

static class EnumerableExtensions
{
    public static IEnumerable<T> EveryNth<T>(this IEnumerable<T> source, int n)
    {
        int index = 0;
        foreach (var item in source)
        {
            if (index % n == 0)
                yield return item;
            index++;
        }
    }
}`
    }
  ],
  quiz: [
    {
      q: "Qu'est-ce qui transforme une méthode statique en méthode d'extension ?",
      options: ["Le mot-clé <code>this</code> devant le premier paramètre", "Le mot-clé <code>extension</code> devant la méthode", "Le fait que la classe hérite du type étendu"],
      answer: 0,
      why: "C'est <code>this</code> sur le premier paramètre, dans une classe <code>static</code>, qui fait l'extension. Pas besoin d'héritage : c'est justement l'intérêt, on étend même des types <code>sealed</code> comme <code>string</code>."
    },
    {
      q: "Pourquoi <code>Where</code> fonctionne-t-il à la fois sur une <code>List&lt;T&gt;</code> et sur un tableau ?",
      options: ["Parce que <code>List&lt;T&gt;</code> et les tableaux héritent de la même classe <code>Linq</code>", "Parce que <code>Where</code> est une extension de <code>IEnumerable&lt;T&gt;</code>, que les deux implémentent", "Parce que le compilateur convertit les tableaux en listes"],
      answer: 1,
      why: "<code>Where</code> est déclaré dans <code>System.Linq.Enumerable</code> comme extension de <code>IEnumerable&lt;T&gt;</code>. Tout type qui implémente cette interface en profite, sans conversion."
    },
    {
      q: "Une méthode d'extension peut-elle lire un champ <code>private</code> du type qu'elle étend ?",
      options: ["Oui, elle fait partie du type", "Oui, si elle est dans le même fichier", "Non, c'est une méthode statique extérieure : elle ne voit que ce qui est public"],
      answer: 2,
      why: "Le compilateur réécrit l'appel en <code>MaClasse.Methode(objet)</code> : c'est du code extérieur au type. Elle n'a donc accès qu'à ses membres publics (ou <code>internal</code> dans le même projet)."
    }
  ],
  project: `<p><strong>Bibliothèque : extensions d'affichage.</strong></p>
<p>Crée un fichier <code>BookExtensions.cs</code> avec une classe <code>static class BookExtensions</code> dans le namespace <code>Library.Display</code> :</p>
<ul>
<li><code>ToShortLine()</code> : <code>« Dune (Herbert, 1965) »</code> ;</li>
<li><code>ToCard()</code> : une fiche de plusieurs lignes avec titre, auteur, année, genre et prix ;</li>
<li><code>IsAffordable(decimal budget)</code> : vrai si le prix est inférieur ou égal au budget.</li>
</ul>
<p>Remplace tous les <code>Console.WriteLine</code> de livres de ton projet par ces extensions, et ajoute une extension LINQ <code>Affordable(this IEnumerable&lt;Book&gt; books, decimal budget)</code> écrite avec <code>yield return</code>.</p>`,
  resources: [
    { label: "Méthodes d'extension (guide de programmation C#)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/classes-and-structs/extension-methods" }
  ]
});
