window.COURSE = window.COURSE || [];

/* ===================== 5.1 List<T> ===================== */
window.COURSE.push({
  key: "l-list",
  title: "List<T> : le tableau qui grandit",
  summary: "Tu sauras créer une List<T>, y ajouter, lire, chercher, trier et retirer des éléments sans tomber dans le piège du foreach.",
  objectives: [
    "Créer une liste et y ajouter des éléments",
    "Lire, chercher, trier et retirer des éléments",
    "Parcourir une liste avec foreach sans la modifier pendant le parcours",
    "Faire le lien avec les méthodes d'un Array JavaScript"
  ],
  analogy: `<p>Une <strong>liste de courses</strong> écrite sur un carnet : tu ajoutes « pain », puis « lait », tu barres le beurre, tu insères « café » tout en haut parce que c'est urgent. Elle n'a pas de taille fixe : elle grandit et rétrécit selon tes besoins.</p><p>Un tableau C# (<code>int[]</code>), c'est plutôt une boîte à œufs : 6 cases, pas une de plus. <code>List&lt;T&gt;</code>, c'est le carnet.</p>`,
  lesson: `
<h3>Le problème du tableau</h3>
<p>Au chapitre 2, tu as vu les tableaux : <code>string[] names = new string[3];</code>. Leur taille est fixée à la création. Si un quatrième nom arrive, il faut créer un nouveau tableau plus grand et tout recopier. Pénible.</p>
<p><code>List&lt;T&gt;</code> règle ce problème. Le <code>T</code> entre chevrons est le <strong>type des éléments</strong> : <code>List&lt;string&gt;</code> est une liste de textes, <code>List&lt;int&gt;</code> une liste d'entiers. On appelle ça un type <strong>générique</strong> (on le détaille en 5.5). Une liste ne mélange jamais les types : le compilateur refuse un <code>int</code> dans une <code>List&lt;string&gt;</code>.</p>

<h3>Créer une liste</h3>
<p>Trois façons courantes, toutes équivalentes au résultat :</p>
<pre class="diagram">List&lt;string&gt; a = new List&lt;string&gt;(); // complet
List&lt;string&gt; b = new();                // type deduit
List&lt;string&gt; c = ["pain", "lait"];     // pre-remplie</pre>
<p>La dernière forme, avec des crochets, s'appelle une <strong>collection expression</strong>. Elle ressemble beaucoup à <code>['pain', 'lait']</code> en JavaScript. <code>[]</code> tout seul crée une liste vide.</p>

<h3>Ajouter, lire, retirer</h3>
<p><code>Add(x)</code> ajoute à la fin, <code>AddRange(autres)</code> ajoute plusieurs éléments d'un coup, <code>Insert(index, x)</code> insère à une position précise et décale le reste. On lit avec un index qui commence à 0 : <code>list[0]</code>. Le nombre d'éléments est dans <code>Count</code> (et non <code>Length</code> comme pour les tableaux).</p>
<pre class="diagram">index :    0       1       2       3
         +-------+-------+-------+-------+
list  :  | Sucre | Pain  | Lait  | Oeufs |
         +-------+-------+-------+-------+
list.Count = 4    list[^1] = "Oeufs" (dernier)</pre>
<p>Pour retirer : <code>Remove(x)</code> enlève la <strong>première</strong> occurrence de la valeur et renvoie <code>true</code> si elle l'a trouvée, <code>RemoveAt(i)</code> enlève à une position, <code>Clear()</code> vide tout. Lire un index qui n'existe pas lève une <code>ArgumentOutOfRangeException</code> : pas de <code>undefined</code> silencieux comme en JS.</p>

<h3>Chercher et trier</h3>
<p><code>Contains(x)</code> répond <code>true</code> ou <code>false</code>. <code>IndexOf(x)</code> donne la position, ou <code>-1</code> si absent (comme en JS). <code>Sort()</code> trie la liste <strong>sur place</strong> pour les types simples (nombres, textes). Attention : contrairement à JS, <code>Sort()</code> sur des nombres les trie bien numériquement, pas comme du texte.</p>

<h3>Parcourir sans se piéger</h3>
<p><code>foreach (string item in list)</code> parcourt la liste du début à la fin. Règle d'or : <strong>on ne modifie pas une liste pendant qu'un foreach la parcourt</strong>. Si tu fais un <code>Remove</code> à l'intérieur, la boucle s'arrête avec une <code>InvalidOperationException</code>. La solution simple : une boucle <code>for</code> qui part de la fin. En retirant un élément, seuls ceux <em>après</em> lui sont décalés, et tu les as déjà traités.</p>
<div class="flow"><span>foreach + Remove</span><span>Exception</span><span>for de la fin vers le début</span><span>OK</span></div>
<div class="tip">Plus tard (leçon 5.8), tu verras <code>RemoveAll</code> avec une lambda, qui fait ça en une ligne. Pour l'instant, la boucle à l'envers est la technique à connaître.</div>

<h3>Côté JavaScript</h3>
<table>
<tr><th>JavaScript (Array)</th><th>C# (List&lt;T&gt;)</th></tr>
<tr><td><code>arr.push(x)</code></td><td><code>list.Add(x)</code></td></tr>
<tr><td><code>arr.push(...autres)</code></td><td><code>list.AddRange(autres)</code></td></tr>
<tr><td><code>arr.splice(i, 0, x)</code></td><td><code>list.Insert(i, x)</code></td></tr>
<tr><td><code>arr.splice(i, 1)</code></td><td><code>list.RemoveAt(i)</code></td></tr>
<tr><td><code>arr.length</code></td><td><code>list.Count</code></td></tr>
<tr><td><code>arr.includes(x)</code></td><td><code>list.Contains(x)</code></td></tr>
<tr><td><code>arr.indexOf(x)</code></td><td><code>list.IndexOf(x)</code></td></tr>
<tr><td><code>arr.sort()</code></td><td><code>list.Sort()</code></td></tr>
<tr><td><code>arr.length = 0</code></td><td><code>list.Clear()</code></td></tr>
</table>
<p>Sous le capot, une liste garde un tableau interne un peu plus grand que nécessaire : c'est sa <strong>capacité</strong> (<code>Capacity</code>), qui double automatiquement quand il n'y a plus de place.</p>
<div class="note">Si tu connais à l'avance le nombre d'éléments (par exemple 10 000 lignes à charger), écris <code>new List&lt;T&gt;(10000)</code> : la liste réserve la place d'un coup et évite plusieurs recopies.</div>
`,
  examples: [
    {
      title: "Remplir et parcourir une liste de courses",
      code: `List<string> courses = new();
courses.Add("Pain");
courses.Add("Lait");
courses.AddRange(["Oeufs", "Beurre"]);
courses.Insert(0, "Sucre"); // tout en haut

Console.WriteLine($"Nombre : {courses.Count}");
Console.WriteLine($"Premier : {courses[0]}");
Console.WriteLine($"Dernier : {courses[courses.Count - 1]}");

foreach (string item in courses)
{
    Console.WriteLine($"- {item}");
}`,
      output: `Nombre : 5
Premier : Sucre
Dernier : Beurre
- Sucre
- Pain
- Lait
- Oeufs
- Beurre`,
      steps: [
        "<code>List&lt;string&gt; courses = new();</code> crée une liste vide de textes. Le type est écrit à gauche, donc <code>new()</code> suffit à droite.",
        "<code>courses.Add(\"Pain\");</code> ajoute un élément à la fin, comme <code>push</code> en JS.",
        "<code>courses.AddRange([\"Oeufs\", \"Beurre\"]);</code> ajoute deux éléments d'un coup, à la fin.",
        "<code>courses.Insert(0, \"Sucre\");</code> insère à l'index 0 : tous les autres éléments sont décalés d'une case.",
        "<code>courses.Count</code> donne 5. Le dernier élément est à l'index <code>Count - 1</code> (on peut aussi écrire <code>courses[^1]</code>).",
        "<code>foreach (string item in courses)</code> parcourt les éléments dans l'ordre."
      ],
      explain: "Une liste se remplit au fil de l'eau : pas besoin de connaître sa taille à l'avance."
    },
    {
      title: "Retirer, chercher et trier",
      code: `List<int> scores = [42, 7, 19, 7, 88];

scores.Remove(7); // retire le PREMIER 7 trouvé
Console.WriteLine(string.Join(", ", scores));

scores.RemoveAt(0); // retire l'élément à l'index 0
Console.WriteLine(string.Join(", ", scores));

Console.WriteLine(scores.Contains(88));
Console.WriteLine(scores.IndexOf(7));
Console.WriteLine(scores.IndexOf(1000));

scores.Sort();
Console.WriteLine(string.Join(", ", scores));

scores.Clear();
Console.WriteLine($"Après Clear : {scores.Count}");`,
      output: `42, 19, 7, 88
19, 7, 88
True
1
-1
7, 19, 88
Après Clear : 0`,
      steps: [
        "<code>List&lt;int&gt; scores = [42, 7, 19, 7, 88];</code> crée une liste pré-remplie avec une collection expression.",
        "<code>scores.Remove(7);</code> enlève seulement le premier 7. Le second reste en place.",
        "<code>string.Join(\", \", scores)</code> colle les éléments avec une virgule : pratique pour afficher une liste.",
        "<code>scores.RemoveAt(0);</code> enlève 42, qui était à l'index 0.",
        "<code>scores.IndexOf(7)</code> renvoie 1 ; <code>IndexOf(1000)</code> renvoie -1 car 1000 est absent.",
        "<code>scores.Sort();</code> trie la liste elle-même, du plus petit au plus grand.",
        "<code>scores.Clear();</code> vide la liste : <code>Count</code> vaut 0."
      ]
    },
    {
      title: "Le piège du foreach et sa correction",
      code: `List<int> numbers = [1, 2, 3, 4, 5, 6];

try
{
    foreach (int n in numbers)
    {
        if (n % 2 == 0) numbers.Remove(n); // interdit pendant un foreach !
    }
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Erreur : {ex.Message}");
}

// La bonne façon : une boucle for qui part de la fin
numbers = [1, 2, 3, 4, 5, 6];
for (int i = numbers.Count - 1; i >= 0; i--)
{
    if (numbers[i] % 2 == 0) numbers.RemoveAt(i);
}
Console.WriteLine(string.Join(", ", numbers));`,
      output: `Erreur : Collection was modified; enumeration operation may not execute.
1, 3, 5`,
      steps: [
        "<code>foreach (int n in numbers)</code> commence le parcours. La liste note qu'elle est « en cours de lecture ».",
        "<code>numbers.Remove(n);</code> retire 2. Au tour suivant, <code>foreach</code> voit que la liste a changé et lève une <code>InvalidOperationException</code>.",
        "<code>catch (InvalidOperationException ex)</code> attrape l'erreur pour afficher son message (en anglais, c'est le texte officiel de .NET).",
        "<code>for (int i = numbers.Count - 1; i &gt;= 0; i--)</code> part du dernier index et remonte vers 0.",
        "<code>numbers.RemoveAt(i);</code> retire l'élément : seuls les éléments après <code>i</code> bougent, et on les a déjà vus. Aucun n'est sauté."
      ],
      explain: "Retenir : on lit avec foreach, on supprime avec un for à l'envers."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ma liste de prénoms",
      prompt: "<p>Crée une <code>List&lt;string&gt;</code> avec trois prénoms. Ajoute un quatrième prénom à la fin, puis insère « Zoé » en première position. Affiche le nombre d'éléments, puis chaque prénom sur une ligne.</p>",
      hint: "<p><code>Add</code> pour la fin, <code>Insert(0, …)</code> pour le début, <code>Count</code> pour le nombre, <code>foreach</code> pour afficher.</p>",
      solution: `List<string> names = ["Alice", "Bob", "Chloé"];
names.Add("David");
names.Insert(0, "Zoé");

Console.WriteLine($"{names.Count} prénoms");
foreach (string name in names)
{
    Console.WriteLine(name);
}`
    },
    {
      level: "moyen",
      title: "Somme et maximum",
      prompt: "<p>À partir de <code>List&lt;int&gt; notes = [12, 15, 8, 19, 11];</code>, calcule avec une seule boucle <code>foreach</code> la somme et la plus grande note. Affiche aussi si la liste contient la note 8, et à quel index.</p>",
      hint: "<p>Initialise <code>max</code> avec <code>notes[0]</code>. Pour la recherche, pense à <code>Contains</code> et <code>IndexOf</code>.</p>",
      solution: `List<int> notes = [12, 15, 8, 19, 11];

int sum = 0;
int max = notes[0];
foreach (int note in notes)
{
    sum += note;
    if (note > max) max = note;
}

Console.WriteLine($"Somme : {sum}");          // 65
Console.WriteLine($"Max : {max}");            // 19
Console.WriteLine(notes.Contains(8));         // True
Console.WriteLine(notes.IndexOf(8));          // 2`
    },
    {
      level: "difficile",
      title: "Nettoyer des températures",
      prompt: "<p>On a <code>List&lt;int&gt; temps = [4, -2, 7, -5, 0, 12, -1];</code>. Retire toutes les valeurs négatives (sans foreach !), trie la liste, puis affiche la plus basse et la plus haute température restantes.</p>",
      hint: "<p>Une boucle <code>for</code> de <code>Count - 1</code> jusqu'à 0 avec <code>RemoveAt</code>. Après <code>Sort()</code>, la plus basse est à l'index 0 et la plus haute à <code>Count - 1</code>.</p>",
      solution: `List<int> temps = [4, -2, 7, -5, 0, 12, -1];

for (int i = temps.Count - 1; i >= 0; i--)
{
    if (temps[i] < 0) temps.RemoveAt(i);
}

temps.Sort();
Console.WriteLine(string.Join(", ", temps));          // 0, 4, 7, 12
Console.WriteLine($"Min : {temps[0]}");               // 0
Console.WriteLine($"Max : {temps[temps.Count - 1]}"); // 12`
    }
  ],
  quiz: [
    {
      q: "Quelle propriété donne le nombre d'éléments d'une <code>List&lt;T&gt;</code> ?",
      options: ["<code>Length</code>", "<code>Count</code>", "<code>Size</code>"],
      answer: 1,
      why: "Une liste utilise <code>Count</code>. <code>Length</code> existe sur les tableaux et les chaînes, d'où le piège ; <code>Size</code> n'existe pas."
    },
    {
      q: "Que fait <code>list.Remove(7)</code> si la liste contient deux fois 7 ?",
      options: ["Elle retire le premier 7 seulement", "Elle retire tous les 7", "Elle lève une exception"],
      answer: 0,
      why: "<code>Remove</code> retire la première occurrence et renvoie <code>true</code>. Pour tout retirer, il faut une boucle (ou <code>RemoveAll</code>, vu plus tard)."
    },
    {
      q: "Tu supprimes des éléments dans un <code>foreach</code> sur cette même liste. Que se passe-t-il ?",
      options: ["Ça marche, mais des éléments sont sautés", "Rien de spécial", "Une <code>InvalidOperationException</code> est levée"],
      answer: 2,
      why: "La liste détecte qu'elle a été modifiée pendant le parcours et lève une exception. En JS, ça saute des éléments en silence ; C# préfère t'arrêter tout de suite."
    },
    {
      q: "Que renvoie <code>list.IndexOf(x)</code> si <code>x</code> est absent ?",
      options: ["<code>null</code>", "<code>-1</code>", "<code>0</code>"],
      answer: 1,
      why: "Comme en JavaScript, -1 signifie « pas trouvé ». 0 serait l'index du premier élément, et un <code>int</code> ne peut pas valoir <code>null</code>."
    }
  ],
  project: "<p>Dans ta Bibliothèque, le catalogue était un tableau <code>Book[]</code>. Remplace-le par une <code>List&lt;Book&gt;</code>. Écris une méthode <code>AddBook(Book book)</code> qui ajoute un livre, et une méthode <code>PrintCatalog()</code> qui affiche chaque titre avec un <code>foreach</code>, précédé du nombre total de livres (<code>Count</code>).</p>",
  resources: [
    { label: "List<T> (documentation Microsoft)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/system.collections.generic.list-1" },
    { label: "Expressions de collection", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/operators/collection-expressions" }
  ]
});

/* ===================== 5.2 Dictionary ===================== */
window.COURSE.push({
  key: "l-dictionary",
  title: "Dictionary<TKey, TValue> : associer une clé à une valeur",
  summary: "Tu sauras ranger des valeurs derrière des clés, les retrouver sans risque avec TryGetValue et compter des occurrences.",
  objectives: [
    "Créer et remplir un dictionnaire",
    "Lire une valeur sans exception grâce à TryGetValue",
    "Parcourir les paires clé/valeur",
    "Compter des occurrences avec un dictionnaire"
  ],
  analogy: `<p>Pense à un <strong>annuaire</strong> : tu cherches « Dupont », tu trouves directement son numéro. Tu ne lis pas l'annuaire page par page depuis le début. Le nom est la <strong>clé</strong>, le numéro est la <strong>valeur</strong>.</p><p>Deux personnes ne peuvent pas avoir exactement la même entrée : chaque clé est unique. Par contre, deux personnes peuvent avoir le même numéro (la même valeur).</p>`,
  lesson: `
<h3>Une clé, une valeur</h3>
<p>Un <code>Dictionary&lt;TKey, TValue&gt;</code> range des <strong>paires</strong> : une clé de type <code>TKey</code> et une valeur de type <code>TValue</code>. Par exemple <code>Dictionary&lt;string, int&gt;</code> associe un texte à un nombre (un fruit et son stock). Chaque clé est unique ; les valeurs, elles, peuvent se répéter.</p>
<p>En TypeScript, tu ferais <code>Record&lt;string, number&gt;</code> ou un <code>Map</code>. Le dictionnaire C# est le cousin direct de <code>Map</code> : n'importe quel type peut servir de clé, et les types sont vérifiés.</p>

<h3>Créer et remplir</h3>
<p>On crée un dictionnaire vide avec <code>new()</code>, ou on l'initialise avec la syntaxe <code>["clé"] = valeur</code> entre accolades. Ensuite, deux façons d'ajouter :</p>
<div class="compare"><div><h4>Add(clé, valeur)</h4><p>Ajoute une nouvelle paire. Si la clé existe déjà, lève une <code>ArgumentException</code>. Utile quand un doublon est une vraie erreur.</p></div><div><h4>dico[clé] = valeur</h4><p>Ajoute la paire si la clé est nouvelle, <strong>remplace</strong> la valeur sinon. Jamais d'exception.</p></div></div>

<h3>Lire sans exploser</h3>
<p>Tu peux lire avec <code>dico["Alice"]</code>. Mais si la clé n'existe pas, C# lève une <code>KeyNotFoundException</code> : pas de <code>undefined</code> comme en JS. Le bon réflexe est <code>TryGetValue</code> : il renvoie <code>true</code> ou <code>false</code>, et dépose la valeur dans une variable <code>out</code> (un paramètre que la méthode remplit pour toi).</p>
<pre class="diagram">if (stock.TryGetValue("kiwis", out int qty))
{
    // trouve : qty contient la valeur
}
else
{
    // absent : qty vaut 0 (valeur par defaut)
}</pre>
<p>Pourquoi tant de prudence ? Parce qu'une clé absente est un cas normal (un utilisateur tape un nom inconnu), pas une erreur grave. On le traite avec un simple <code>if</code>, pas avec une exception.</p>
<p><code>ContainsKey(clé)</code> répond simplement oui ou non. <code>Remove(clé)</code> supprime la paire et renvoie <code>true</code> si elle existait. <code>Count</code> donne le nombre de paires.</p>
<div class="tip">Évite <code>if (dico.ContainsKey(k)) { var v = dico[k]; }</code> : ça fait deux recherches. <code>TryGetValue</code> n'en fait qu'une et dit tout de suite si la clé existe.</div>

<h3>Parcourir les paires</h3>
<p>Un <code>foreach</code> sur un dictionnaire donne des <code>KeyValuePair&lt;TKey, TValue&gt;</code>, avec <code>.Key</code> et <code>.Value</code>. Plus lisible : la <strong>déconstruction</strong>, qui découpe la paire en deux variables, comme la déstructuration <code>const [key, value]</code> de JS.</p>
<pre class="diagram">foreach (var (fruit, qty) in stock)
    Console.WriteLine($"{fruit} : {qty}");</pre>
<p>L'ordre de parcours n'est <strong>pas garanti</strong>. En pratique, il suit souvent l'ordre d'ajout, mais ne compte jamais dessus. Si tu as besoin d'un ordre trié, tu verras <code>SortedDictionary</code> en 5.3.</p>

<h3>Pourquoi c'est si rapide</h3>
<p>Le dictionnaire ne parcourt pas toutes ses paires pour trouver une clé. Il calcule un nombre à partir de la clé (son <strong>hash</strong>, via <code>GetHashCode()</code>) et ce nombre indique directement dans quel tiroir (un <strong>bucket</strong>) regarder.</p>
<pre class="diagram">  "Bob" --GetHashCode()--&gt; 7 --&gt; bucket 7
                                     |
 buckets: [0] [1] [2] ... [7] ...    v
                          ("Bob", "06 55...")

 Avec 10 ou 1 million de cles : une seule
 case a regarder (ou presque).</pre>
<p>Résultat : chercher une clé prend à peu près le même temps qu'il y ait 10 ou un million de paires. Une <code>List</code>, elle, doit comparer élément par élément.</p>
<div class="note">Pour des clés texte saisies par des humains, crée le dictionnaire avec <code>new Dictionary&lt;string, int&gt;(StringComparer.OrdinalIgnoreCase)</code> : « Alice » et « alice » deviennent la même clé.</div>
`,
  examples: [
    {
      title: "Un petit annuaire",
      code: `Dictionary<string, string> phones = new()
{
    ["Alice"] = "06 11 22 33 44",
    ["Bob"] = "06 55 66 77 88"
};

phones.Add("Chloé", "07 12 34 56 78");
phones["Bob"] = "06 00 00 00 00";   // clé existante : remplace
phones["David"] = "07 99 88 77 66"; // clé nouvelle : ajoute

Console.WriteLine(phones["Alice"]);
Console.WriteLine(phones["Bob"]);
Console.WriteLine($"Contacts : {phones.Count}");

try
{
    phones.Add("Alice", "01 01 01 01 01");
}
catch (ArgumentException)
{
    Console.WriteLine("Add : la clé Alice existe déjà");
}`,
      output: `06 11 22 33 44
06 00 00 00 00
Contacts : 4
Add : la clé Alice existe déjà`,
      steps: [
        "<code>Dictionary&lt;string, string&gt; phones = new() { [\"Alice\"] = … }</code> crée le dictionnaire et le pré-remplit avec deux paires.",
        "<code>phones.Add(\"Chloé\", …);</code> ajoute une nouvelle paire.",
        "<code>phones[\"Bob\"] = …;</code> remplace la valeur de Bob, car la clé existe déjà.",
        "<code>phones[\"David\"] = …;</code> ajoute David, car la clé est nouvelle. On a maintenant 4 contacts.",
        "<code>phones.Add(\"Alice\", …);</code> lève une <code>ArgumentException</code> car Alice existe : <code>Add</code> refuse les doublons.",
        "<code>catch (ArgumentException)</code> attrape l'erreur et affiche un message clair."
      ]
    },
    {
      title: "TryGetValue, ContainsKey, Remove et parcours",
      code: `Dictionary<string, int> stock = new()
{
    ["pommes"] = 12,
    ["poires"] = 0,
    ["kiwis"] = 5
};

if (stock.TryGetValue("kiwis", out int kiwis))
    Console.WriteLine($"Kiwis : {kiwis}");

if (!stock.TryGetValue("bananes", out _))
    Console.WriteLine("Pas de bananes en stock");

Console.WriteLine(stock.ContainsKey("poires"));
stock.Remove("poires");
Console.WriteLine(stock.ContainsKey("poires"));

foreach (var (fruit, quantity) in stock)
{
    Console.WriteLine($"{fruit} -> {quantity}");
}`,
      output: `Kiwis : 5
Pas de bananes en stock
True
False
pommes -> 12
kiwis -> 5`,
      steps: [
        "<code>stock.TryGetValue(\"kiwis\", out int kiwis)</code> trouve la clé : renvoie <code>true</code> et met 5 dans <code>kiwis</code>.",
        "<code>stock.TryGetValue(\"bananes\", out _)</code> ne trouve pas la clé : renvoie <code>false</code>, sans exception. Le <code>_</code> veut dire « la valeur ne m'intéresse pas ».",
        "<code>stock.ContainsKey(\"poires\")</code> vaut <code>True</code> : la clé existe, même si sa valeur est 0.",
        "<code>stock.Remove(\"poires\");</code> supprime la paire ; ensuite <code>ContainsKey</code> vaut <code>False</code>.",
        "<code>foreach (var (fruit, quantity) in stock)</code> déconstruit chaque paire en deux variables."
      ]
    },
    {
      title: "Compter les mots d'une phrase",
      code: `string text = "le chat voit le chien et le chat fuit";
string[] words = text.Split(' ');

Dictionary<string, int> counts = new();
foreach (string word in words)
{
    counts.TryGetValue(word, out int current); // 0 si absent
    counts[word] = current + 1;
}

foreach (var (word, count) in counts)
{
    Console.WriteLine($"{word} : {count}");
}`,
      output: `le : 3
chat : 2
voit : 1
chien : 1
et : 1
fuit : 1`,
      steps: [
        "<code>text.Split(' ')</code> découpe la phrase en mots, à chaque espace.",
        "<code>Dictionary&lt;string, int&gt; counts = new();</code> : clé = le mot, valeur = son nombre d'apparitions.",
        "<code>counts.TryGetValue(word, out int current);</code> lit le compteur actuel. Si le mot est nouveau, <code>current</code> vaut 0 (valeur par défaut d'un <code>int</code>).",
        "<code>counts[word] = current + 1;</code> ajoute ou met à jour le compteur. L'indexeur ne lève jamais d'exception en écriture.",
        "<code>foreach (var (word, count) in counts)</code> affiche chaque mot avec son total."
      ],
      explain: "Ce motif « lire le compteur, ajouter 1, réécrire » revient très souvent : statistiques, fréquences, regroupements."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Capitales",
      prompt: "<p>Crée un <code>Dictionary&lt;string, string&gt;</code> qui associe trois pays à leur capitale. Ajoute un quatrième pays avec <code>Add</code>, puis affiche toutes les paires sous la forme « France : Paris ».</p>",
      hint: "<p>Initialise avec <code>[\"France\"] = \"Paris\"</code>, puis parcours avec <code>foreach (var (country, capital) in …)</code>.</p>",
      solution: `Dictionary<string, string> capitals = new()
{
    ["France"] = "Paris",
    ["Italie"] = "Rome",
    ["Japon"] = "Tokyo"
};
capitals.Add("Maroc", "Rabat");

foreach (var (country, capital) in capitals)
{
    Console.WriteLine($"{country} : {capital}");
}`
    },
    {
      level: "moyen",
      title: "Recherche sûre",
      prompt: "<p>Avec un dictionnaire de prix <code>[\"cafe\"] = 2, [\"the\"] = 3</code>, écris une méthode <code>static string PriceOf(Dictionary&lt;string, int&gt; prices, string item)</code> qui renvoie « cafe : 2 € » si l'article existe, ou « cafe : inconnu » sinon. Teste avec un article présent et un absent.</p>",
      hint: "<p>Utilise <code>TryGetValue</code> dans un <code>if</code>, jamais <code>prices[item]</code> directement.</p>",
      solution: `Dictionary<string, int> prices = new()
{
    ["cafe"] = 2,
    ["the"] = 3
};

Console.WriteLine(PriceOf(prices, "the"));      // the : 3 €
Console.WriteLine(PriceOf(prices, "chocolat")); // chocolat : inconnu

static string PriceOf(Dictionary<string, int> prices, string item)
{
    if (prices.TryGetValue(item, out int price))
        return $"{item} : {price} €";
    return $"{item} : inconnu";
}`
    },
    {
      level: "difficile",
      title: "Compter les lettres",
      prompt: "<p>Compte combien de fois chaque lettre apparaît dans <code>\"banana\"</code> avec un <code>Dictionary&lt;char, int&gt;</code>. Affiche ensuite la lettre la plus fréquente et son nombre.</p>",
      hint: "<p>Un <code>foreach (char c in word)</code> parcourt les lettres. Pour trouver la plus fréquente, parcours les paires en gardant la meilleure dans deux variables.</p>",
      solution: `string word = "banana";
Dictionary<char, int> counts = new();

foreach (char c in word)
{
    counts.TryGetValue(c, out int current);
    counts[c] = current + 1;
}

char best = ' ';
int bestCount = 0;
foreach (var (letter, count) in counts)
{
    if (count > bestCount)
    {
        best = letter;
        bestCount = count;
    }
}

Console.WriteLine($"{best} apparaît {bestCount} fois"); // a apparaît 3 fois`
    }
  ],
  quiz: [
    {
      q: "Que se passe-t-il avec <code>dico.Add(\"Alice\", 1)</code> si la clé « Alice » existe déjà ?",
      options: ["La valeur est remplacée", "Rien, l'appel est ignoré", "Une <code>ArgumentException</code> est levée"],
      answer: 2,
      why: "<code>Add</code> refuse les doublons et lève une exception. C'est l'indexeur <code>dico[\"Alice\"] = 1</code> qui remplace la valeur sans erreur."
    },
    {
      q: "Quelle est la façon recommandée de lire une clé qui peut être absente ?",
      options: ["<code>TryGetValue</code>", "<code>dico[clé]</code> dans un try/catch", "<code>dico[clé] ?? 0</code>"],
      answer: 0,
      why: "<code>TryGetValue</code> fait une seule recherche et ne lève jamais d'exception. <code>dico[clé]</code> lève <code>KeyNotFoundException</code> avant que <code>??</code> puisse agir, et un try/catch pour un cas normal est lent et lourd."
    },
    {
      q: "Que donne un <code>foreach</code> sur un <code>Dictionary&lt;string, int&gt;</code> ?",
      options: ["Seulement les clés", "Des <code>KeyValuePair&lt;string, int&gt;</code>", "Seulement les valeurs"],
      answer: 1,
      why: "Chaque élément est une paire avec <code>.Key</code> et <code>.Value</code>, qu'on peut déconstruire en <code>var (key, value)</code>. Pour n'avoir que les clés, il existe <code>dico.Keys</code>."
    },
    {
      q: "Pourquoi chercher une clé dans un dictionnaire est-il rapide ?",
      options: ["Les clés sont triées", "Le hash de la clé indique directement où regarder", "Le dictionnaire est petit"],
      answer: 1,
      why: "Le hash de la clé désigne un bucket : on ne regarde qu'une case au lieu de tout parcourir. Les clés d'un <code>Dictionary</code> ne sont pas triées (c'est le rôle de <code>SortedDictionary</code>)."
    }
  ],
  project: "<p>Ajoute à ta Bibliothèque un index <code>Dictionary&lt;string, Book&gt;</code> où la clé est l'ISBN. Dans <code>AddBook</code>, ajoute le livre à la fois dans la liste et dans l'index (utilise <code>TryAdd</code> ou <code>ContainsKey</code> pour refuser un ISBN en double). Écris <code>FindByIsbn(string isbn)</code> qui renvoie <code>Book?</code> grâce à <code>TryGetValue</code>.</p>",
  resources: [
    { label: "Dictionary<TKey,TValue> (documentation Microsoft)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/system.collections.generic.dictionary-2" }
  ]
});

/* ===================== 5.3 HashSet, Queue, Stack ===================== */
window.COURSE.push({
  key: "l-other-collections",
  title: "HashSet, Queue, Stack et autres",
  summary: "Tu sauras choisir un HashSet pour éviter les doublons, une Queue pour traiter dans l'ordre d'arrivée et une Stack pour revenir en arrière.",
  objectives: [
    "Éviter les doublons avec HashSet<T>",
    "Gérer une file d'attente avec Queue<T> (premier arrivé, premier servi)",
    "Gérer une pile avec Stack<T> (dernier arrivé, premier sorti)",
    "Connaître l'existence de LinkedList, SortedDictionary et PriorityQueue"
  ],
  analogy: `<p>Trois scènes du quotidien. Une <strong>liste d'invités</strong> à l'entrée d'une soirée : on ne peut pas être inscrit deux fois (HashSet). La <strong>caisse du supermarché</strong> : le premier arrivé est le premier servi (Queue). Une <strong>pile d'assiettes</strong> : tu poses la dernière au-dessus et c'est elle que tu reprends en premier (Stack).</p>`,
  lesson: `
<h3>HashSet&lt;T&gt; : jamais de doublon</h3>
<p>Un <code>HashSet&lt;T&gt;</code> est un <strong>ensemble</strong> : chaque valeur y est présente au plus une fois. Il fonctionne comme les clés d'un dictionnaire (avec un hash), donc <code>Contains</code> est très rapide, même avec des millions d'éléments. C'est l'équivalent du <code>Set</code> de JavaScript.</p>
<p>Détail pratique : <code>Add</code> renvoie un <code>bool</code>. <code>true</code> si la valeur a été ajoutée, <code>false</code> si elle était déjà là. Pas d'exception, juste une réponse.</p>
<p>Il sait aussi faire des opérations d'ensembles, qui <strong>modifient</strong> le set sur lequel on les appelle :</p>
<table>
<tr><th>Méthode</th><th>Résultat</th><th>Exemple {1,2,3} et {2,3,4}</th></tr>
<tr><td><code>UnionWith</code></td><td>tout ce qui est dans l'un ou l'autre</td><td>{1,2,3,4}</td></tr>
<tr><td><code>IntersectWith</code></td><td>seulement ce qui est commun</td><td>{2,3}</td></tr>
<tr><td><code>ExceptWith</code></td><td>retire ce qui est dans l'autre</td><td>{1}</td></tr>
</table>
<p>Un HashSet n'a pas d'index : <code>set[0]</code> n'existe pas, et l'ordre n'est pas garanti.</p>

<h3>Queue&lt;T&gt; : la file d'attente</h3>
<p>Une <code>Queue&lt;T&gt;</code> (file) suit la règle <strong>FIFO</strong> : <em>First In, First Out</em>, premier entré, premier sorti. <code>Enqueue(x)</code> place quelqu'un au bout de la file, <code>Dequeue()</code> sert (et retire) celui qui est devant, <code>Peek()</code> regarde qui est devant sans le retirer.</p>
<pre class="diagram">  Enqueue --&gt; [ Chloe | Bob | Alice ] --&gt; Dequeue
              (arrive)          (servie en 1er)

  Ordre d'entree : Alice, Bob, Chloe
  Ordre de sortie : Alice, Bob, Chloe</pre>
<p>Comme pour le dictionnaire, il n'y a pas d'index : on ne peut pas « doubler » dans la file. On ne voit que la tête, et on sert dans l'ordre. Usages typiques : traiter des commandes, des messages, des impressions, dans l'ordre d'arrivée.</p>

<h3>Stack&lt;T&gt; : la pile</h3>
<p>Une <code>Stack&lt;T&gt;</code> (pile) suit la règle <strong>LIFO</strong> : <em>Last In, First Out</em>, dernier entré, premier sorti. <code>Push(x)</code> pose sur le dessus, <code>Pop()</code> reprend (et retire) le dessus, <code>Peek()</code> regarde le dessus.</p>
<pre class="diagram">  Push      Pop
   |         ^
   v         |
 +-------------+
 |  assiette 3 |  &lt;- dessus : sort en 1er
 |  assiette 2 |
 |  assiette 1 |  &lt;- posee en 1er, sort en dernier
 +-------------+</pre>
<p>L'usage roi : le bouton <strong>Annuler</strong> (Ctrl+Z). À chaque action, on empile l'état précédent ; pour annuler, on dépile le plus récent. Le bouton « Précédent » d'un navigateur fonctionne pareil.</p>
<div class="tip"><code>Dequeue()</code>, <code>Pop()</code> et <code>Peek()</code> lèvent une <code>InvalidOperationException</code> si la collection est vide. Vérifie <code>Count &gt; 0</code> ou utilise <code>TryDequeue</code>, <code>TryPop</code>, <code>TryPeek</code>, sur le même modèle que <code>TryGetValue</code>.</div>

<h3>Les autres, en bref</h3>
<p><code>LinkedList&lt;T&gt;</code> est une chaîne de maillons où chacun connaît son voisin : insérer au milieu est rapide, mais l'accès par index n'existe pas. <code>SortedDictionary&lt;TKey, TValue&gt;</code> est un dictionnaire qui garde ses clés <strong>toujours triées</strong>, un peu plus lent qu'un <code>Dictionary</code>.</p>
<p>Enfin, <code>PriorityQueue&lt;TElement, TPriority&gt;</code> est une file où ce n'est pas l'ordre d'arrivée qui compte, mais la priorité : la plus petite sort en premier, comme aux urgences.</p>
<pre class="diagram">PriorityQueue&lt;string, int&gt; er = new();
er.Enqueue("rhume", 3);
er.Enqueue("fracture", 1);
er.Dequeue(); // "fracture" (priorite 1)</pre>
<div class="flow"><span>Doublons interdits ?</span><span>HashSet</span><span>Ordre d'arrivée ?</span><span>Queue</span></div>
<div class="note">Une Queue ou une Stack rendent ton intention lisible : quand un collègue voit <code>Stack&lt;Command&gt;</code>, il comprend immédiatement « historique à annuler ». Une <code>List</code> qui joue le même rôle oblige à lire tout le code pour le deviner.</div>
`,
  examples: [
    {
      title: "HashSet : pas de doublons et opérations d'ensembles",
      code: `HashSet<string> tags = ["csharp", "dotnet"];

Console.WriteLine(tags.Add("linq"));   // ajouté
Console.WriteLine(tags.Add("csharp")); // déjà présent
Console.WriteLine($"Nombre : {tags.Count}");
Console.WriteLine(tags.Contains("dotnet"));

HashSet<string> others = ["dotnet", "angular"];

HashSet<string> union = new(tags); // copie de tags
union.UnionWith(others);
Console.WriteLine(string.Join(", ", union));

HashSet<string> common = new(tags);
common.IntersectWith(others);
Console.WriteLine(string.Join(", ", common));`,
      output: `True
False
Nombre : 3
True
csharp, dotnet, linq, angular
dotnet`,
      steps: [
        "<code>HashSet&lt;string&gt; tags = [\"csharp\", \"dotnet\"];</code> crée un ensemble avec deux valeurs.",
        "<code>tags.Add(\"linq\")</code> renvoie <code>True</code> : la valeur est nouvelle. <code>tags.Add(\"csharp\")</code> renvoie <code>False</code> : déjà présente, rien ne change.",
        "<code>tags.Count</code> vaut donc 3, et <code>Contains</code> répond très vite.",
        "<code>new(tags)</code> crée une copie : les opérations d'ensembles modifient le set appelé, on garde donc <code>tags</code> intact.",
        "<code>union.UnionWith(others);</code> ajoute <code>angular</code> ; <code>dotnet</code> n'est pas dupliqué.",
        "<code>common.IntersectWith(others);</code> ne garde que ce qui est dans les deux : <code>dotnet</code>."
      ],
      explain: "L'ordre d'affichage d'un HashSet n'est pas garanti : ne t'appuie jamais dessus."
    },
    {
      title: "Queue : la caisse du supermarché",
      code: `Queue<string> checkout = new();
checkout.Enqueue("Alice");
checkout.Enqueue("Bob");
checkout.Enqueue("Chloé");

Console.WriteLine($"Prochain : {checkout.Peek()}");

while (checkout.Count > 0)
{
    string client = checkout.Dequeue();
    Console.WriteLine($"Servi : {client}");
}

if (checkout.TryDequeue(out string? next))
    Console.WriteLine(next);
else
    Console.WriteLine("File vide");`,
      output: `Prochain : Alice
Servi : Alice
Servi : Bob
Servi : Chloé
File vide`,
      steps: [
        "<code>checkout.Enqueue(\"Alice\");</code> place Alice au bout de la file. Puis Bob, puis Chloé.",
        "<code>checkout.Peek()</code> regarde qui est devant (Alice) sans la retirer.",
        "<code>while (checkout.Count &gt; 0)</code> boucle tant qu'il reste quelqu'un.",
        "<code>checkout.Dequeue()</code> retire et renvoie la personne en tête : Alice, puis Bob, puis Chloé.",
        "<code>checkout.TryDequeue(out string? next)</code> sur une file vide renvoie <code>false</code> au lieu de lever une exception."
      ]
    },
    {
      title: "Stack : un bouton Annuler",
      code: `Stack<string> history = new();
string text = "";

AddText("Bonjour");
AddText(" le");
AddText(" monde");
Console.WriteLine(text);

Undo();
Console.WriteLine(text);
Undo();
Console.WriteLine(text);
Console.WriteLine($"Actions restantes : {history.Count}");

void AddText(string added)
{
    history.Push(text); // on mémorise l'état AVANT la modification
    text += added;
}

void Undo()
{
    if (history.TryPop(out string? previous))
        text = previous;
}`,
      output: `Bonjour le monde
Bonjour le
Bonjour
Actions restantes : 1`,
      steps: [
        "<code>Stack&lt;string&gt; history = new();</code> crée la pile des états précédents.",
        "<code>history.Push(text);</code> dans <code>AddText</code> empile le texte tel qu'il était avant l'ajout : d'abord <code>\"\"</code>, puis <code>\"Bonjour\"</code>, puis <code>\"Bonjour le\"</code>.",
        "<code>text += added;</code> applique la modification.",
        "<code>history.TryPop(out string? previous)</code> dans <code>Undo</code> reprend l'état le plus récent : <code>\"Bonjour le\"</code>, puis <code>\"Bonjour\"</code>.",
        "<code>history.Count</code> vaut 1 : il reste l'état vide du tout début, on pourrait encore annuler une fois."
      ],
      explain: "Dernier état empilé, premier état restauré : c'est exactement le comportement LIFO."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Visiteurs uniques",
      prompt: "<p>On reçoit les visites <code>[\"ana\", \"leo\", \"ana\", \"max\", \"leo\"]</code>. Ajoute-les une par une dans un <code>HashSet&lt;string&gt;</code> et affiche « nouveau » ou « déjà vu » selon le résultat de <code>Add</code>. Affiche enfin le nombre de visiteurs uniques.</p>",
      hint: "<p><code>if (visitors.Add(name))</code> : <code>Add</code> renvoie <code>true</code> seulement la première fois.</p>",
      solution: `string[] visits = ["ana", "leo", "ana", "max", "leo"];
HashSet<string> visitors = new();

foreach (string name in visits)
{
    if (visitors.Add(name))
        Console.WriteLine($"{name} : nouveau");
    else
        Console.WriteLine($"{name} : déjà vu");
}

Console.WriteLine($"Visiteurs uniques : {visitors.Count}"); // 3`
    },
    {
      level: "moyen",
      title: "File d'impression",
      prompt: "<p>Simule une imprimante : ajoute trois documents dans une <code>Queue&lt;string&gt;</code>. Imprime le premier (affiche « Impression : … »), puis ajoute un quatrième document. Imprime ensuite tout le reste, dans l'ordre.</p>",
      hint: "<p><code>Enqueue</code> pour ajouter, <code>Dequeue</code> pour imprimer, une boucle <code>while (queue.Count &gt; 0)</code> pour vider la file.</p>",
      solution: `Queue<string> printer = new();
printer.Enqueue("facture.pdf");
printer.Enqueue("cv.docx");
printer.Enqueue("photo.png");

Console.WriteLine($"Impression : {printer.Dequeue()}"); // facture.pdf
printer.Enqueue("contrat.pdf");

while (printer.Count > 0)
{
    Console.WriteLine($"Impression : {printer.Dequeue()}");
}
// cv.docx, photo.png, contrat.pdf`
    },
    {
      level: "difficile",
      title: "Parenthèses équilibrées",
      prompt: "<p>Écris <code>static bool IsBalanced(string s)</code> qui vérifie que les parenthèses <code>(</code> et crochets <code>[</code> d'un texte sont bien fermés dans le bon ordre. <code>\"([])\"</code> est valide, <code>\"([)]\"</code> et <code>\"((\"</code> ne le sont pas.</p>",
      hint: "<p>Empile chaque ouvrant. Sur un fermant, la pile ne doit pas être vide et le dessus doit être l'ouvrant correspondant. À la fin, la pile doit être vide.</p>",
      solution: `Console.WriteLine(IsBalanced("([])"));  // True
Console.WriteLine(IsBalanced("([)]"));  // False
Console.WriteLine(IsBalanced("(("));    // False

static bool IsBalanced(string s)
{
    Stack<char> open = new();
    foreach (char c in s)
    {
        if (c == '(' || c == '[')
        {
            open.Push(c);
        }
        else if (c == ')' || c == ']')
        {
            char expected = c == ')' ? '(' : '[';
            if (!open.TryPop(out char top) || top != expected)
                return false;
        }
    }
    return open.Count == 0;
}`
    }
  ],
  quiz: [
    {
      q: "Que renvoie <code>set.Add(x)</code> si <code>x</code> est déjà dans le <code>HashSet</code> ?",
      options: ["<code>false</code>", "Une exception", "<code>true</code>"],
      answer: 0,
      why: "<code>Add</code> renvoie <code>false</code> et ne change rien. Contrairement à <code>Dictionary.Add</code>, un HashSet ne lève pas d'exception pour un doublon."
    },
    {
      q: "Dans une <code>Queue</code>, on fait <code>Enqueue(1)</code>, <code>Enqueue(2)</code>, <code>Enqueue(3)</code>. Que renvoie <code>Dequeue()</code> ?",
      options: ["3", "2", "1"],
      answer: 2,
      why: "Une file est FIFO : le premier entré (1) sort en premier. Si tu as répondu 3, tu pensais à une <code>Stack</code> (LIFO)."
    },
    {
      q: "Quelle collection choisir pour un historique « Annuler » ?",
      options: ["<code>Queue&lt;T&gt;</code>", "<code>Stack&lt;T&gt;</code>", "<code>HashSet&lt;T&gt;</code>"],
      answer: 1,
      why: "On annule toujours la dernière action en premier : c'est LIFO, donc une pile. Une file annulerait la plus ancienne action, et un HashSet n'a pas d'ordre."
    },
    {
      q: "Que se passe-t-il si on appelle <code>Pop()</code> sur une <code>Stack</code> vide ?",
      options: ["Ça renvoie <code>null</code>", "Une <code>InvalidOperationException</code> est levée", "Ça renvoie la valeur par défaut"],
      answer: 1,
      why: "<code>Pop</code> sur une pile vide lève une exception. Pour éviter ça : tester <code>Count</code> ou utiliser <code>TryPop</code>, qui renvoie simplement <code>false</code>."
    }
  ],
  project: "<p>Dans ta Bibliothèque, quand un livre est déjà emprunté, les membres peuvent le réserver. Ajoute à <code>Book</code> une propriété <code>Queue&lt;Member&gt; Reservations</code>. Écris <code>Reserve(Member member)</code> qui fait un <code>Enqueue</code>, et <code>Return()</code> qui, au retour du livre, fait un <code>TryDequeue</code> et affiche « Le livre est maintenant prêté à … » (ou « Le livre est disponible » si personne n'attend).</p>",
  resources: [
    { label: "Types de collections couramment utilisés", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/collections/commonly-used-collection-types" },
    { label: "HashSet<T> (documentation Microsoft)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/system.collections.generic.hashset-1" }
  ]
});

/* ===================== 5.4 Choisir sa collection et IEnumerable ===================== */
window.COURSE.push({
  key: "l-choose-collection",
  title: "Choisir sa collection et IEnumerable",
  summary: "Tu sauras choisir la bonne collection selon ton besoin, et exposer tes données avec la bonne interface (IEnumerable, IReadOnlyList…).",
  objectives: [
    "Choisir une collection selon le besoin",
    "Comprendre ce que garantit IEnumerable<T> et les interfaces au-dessus",
    "Exposer une collection en lecture seule depuis une classe",
    "Créer une séquence simple avec yield return"
  ],
  analogy: `<p>Quand tu loues une voiture, l'agence te promet « une citadine, 5 places » sans te dire la marque exacte. Tu sais ce que tu peux faire avec, c'est tout ce qui compte.</p><p>Les interfaces de collections font pareil : <code>IEnumerable&lt;T&gt;</code> promet seulement « tu peux me parcourir ». Derrière, ce peut être un tableau, une liste ou un ensemble : celui qui l'utilise n'a pas besoin de le savoir.</p>`,
  lesson: `
<h3>Quelle collection pour quel besoin ?</h3>
<p>Tu connais maintenant plusieurs collections. Pour choisir, pose-toi une seule question : <strong>qu'est-ce que je vais faire le plus souvent avec ?</strong></p>
<table>
<tr><th>Mon besoin</th><th>Collection</th></tr>
<tr><td>Une suite d'éléments dans un ordre, accès par position</td><td><code>List&lt;T&gt;</code></td></tr>
<tr><td>Taille fixe connue d'avance</td><td><code>T[]</code> (tableau)</td></tr>
<tr><td>Retrouver une valeur à partir d'une clé</td><td><code>Dictionary&lt;TKey, TValue&gt;</code></td></tr>
<tr><td>Savoir si un élément est présent, sans doublons</td><td><code>HashSet&lt;T&gt;</code></td></tr>
<tr><td>Traiter dans l'ordre d'arrivée</td><td><code>Queue&lt;T&gt;</code></td></tr>
<tr><td>Revenir au plus récent (annuler)</td><td><code>Stack&lt;T&gt;</code></td></tr>
<tr><td>Clés toujours triées</td><td><code>SortedDictionary&lt;TKey, TValue&gt;</code></td></tr>
</table>
<p>Dans le doute, commence par <code>List&lt;T&gt;</code>. C'est le bon choix dans une grande majorité des cas.</p>

<h3>Le coût des opérations</h3>
<p>« Rapide » veut dire ici : le temps reste à peu près le même quelle que soit la taille. « Lent » veut dire : plus il y a d'éléments, plus c'est long, car il faut tout parcourir ou tout décaler.</p>
<table>
<tr><th>Opération</th><th>List</th><th>Dictionary / HashSet</th><th>Queue / Stack</th></tr>
<tr><td>Ajouter</td><td>rapide (à la fin)</td><td>rapide</td><td>rapide</td></tr>
<tr><td>Lire par index</td><td>rapide</td><td>impossible</td><td>impossible</td></tr>
<tr><td>Chercher une valeur (<code>Contains</code>)</td><td>lent</td><td>rapide</td><td>lent</td></tr>
<tr><td>Retirer au début / au milieu</td><td>lent (décalage)</td><td>rapide</td><td>rapide (au bon bout)</td></tr>
</table>
<div class="tip">Le piège classique : une <code>List</code> de 100 000 éléments avec un <code>Contains</code> dans une boucle. Si tu cherches souvent, mets les éléments dans un <code>HashSet</code> ou un <code>Dictionary</code>.</div>

<h3>Les interfaces : ce que la collection promet</h3>
<p>Une <strong>interface</strong> (vue au chapitre 3) est un contrat. Toutes les collections en implémentent plusieurs, empilées comme des niveaux de promesses :</p>
<pre class="diagram">IEnumerable&lt;T&gt;            on peut faire foreach
 |
 +-- IReadOnlyCollection&lt;T&gt;   + Count
 |    |
 |    +-- IReadOnlyList&lt;T&gt;    + lire [index]
 |
 +-- ICollection&lt;T&gt;           + Count, Add, Remove,
      |                          Contains, Clear
      +-- IList&lt;T&gt;             + [index], Insert,
                                 RemoveAt

List&lt;T&gt; et T[] implementent tout ca.
IReadOnlyDictionary&lt;K,V&gt; : lecture d'un dictionnaire.</pre>
<p><code>IEnumerable&lt;T&gt;</code> est la promesse minimale : « tu peux me parcourir ». C'est elle qui rend <code>foreach</code> possible. Si une méthode accepte un <code>IEnumerable&lt;int&gt;</code>, on peut lui passer un tableau, une liste, un HashSet, une Queue… Elle est donc plus réutilisable.</p>
<div class="compare"><div><h4>En paramètre</h4><p>Demande le <strong>minimum</strong> dont tu as besoin : souvent <code>IEnumerable&lt;T&gt;</code>. Ta méthode accepte plus de choses.</p></div><div><h4>En retour / propriété</h4><p>Donne le <strong>minimum de pouvoir</strong> : <code>IReadOnlyList&lt;T&gt;</code> plutôt que <code>List&lt;T&gt;</code>. Personne ne modifie tes données dans ton dos.</p></div></div>

<h3>Protéger les données d'une classe</h3>
<p>Si une classe expose <code>public List&lt;Book&gt; Books</code>, n'importe qui peut faire <code>library.Books.Clear()</code> et vider ta bibliothèque. La bonne pratique : garder la <code>List</code> en <code>private</code>, et exposer une propriété de type <code>IReadOnlyList&lt;Book&gt;</code>. On peut lire, compter, parcourir, accéder par index, mais pas ajouter ni supprimer. Pour modifier, on passe par des méthodes de la classe, qui peuvent valider.</p>
<p>C'est comme <code>readonly Book[]</code> ou <code>ReadonlyArray&lt;Book&gt;</code> en TypeScript, mais vérifié par le compilateur C#.</p>
<div class="note">Un appelant malin peut retransformer un <code>IReadOnlyList</code> en <code>List</code> avec un cast. Pour une protection totale, renvoie <code>_books.AsReadOnly()</code> : c'est une vue en lecture seule, impossible à modifier même avec un cast.</div>

<h3>Créer sa propre séquence avec yield return</h3>
<p><code>yield return</code> permet d'écrire une méthode qui renvoie un <code>IEnumerable&lt;T&gt;</code> élément par élément, sans créer de liste. Chaque <code>yield return</code> « donne » une valeur au <code>foreach</code> qui demande la suivante. C'est l'équivalent des générateurs <code>function*</code> et <code>yield</code> de JavaScript.</p>
<div class="flow"><span>foreach demande</span><span>la méthode avance jusqu'au yield</span><span>valeur donnée</span><span>pause</span></div>
`,
  examples: [
    {
      title: "Un paramètre IEnumerable accepte tout",
      code: `int[] array = [1, 2, 3];
List<int> list = [10, 20];
HashSet<int> set = [5, 5, 6];

Console.WriteLine(Sum(array));
Console.WriteLine(Sum(list));
Console.WriteLine(Sum(set));

static int Sum(IEnumerable<int> numbers)
{
    int total = 0;
    foreach (int n in numbers)
    {
        total += n;
    }
    return total;
}`,
      output: `6
30
11`,
      steps: [
        "<code>static int Sum(IEnumerable&lt;int&gt; numbers)</code> demande seulement « quelque chose qu'on peut parcourir ».",
        "<code>foreach (int n in numbers)</code> est la seule opération utilisée : c'est exactement ce que promet <code>IEnumerable</code>.",
        "<code>Sum(array)</code> et <code>Sum(list)</code> fonctionnent : tableau et liste implémentent <code>IEnumerable&lt;int&gt;</code>.",
        "<code>HashSet&lt;int&gt; set = [5, 5, 6];</code> ne garde qu'un seul 5 : la somme vaut 5 + 6 = 11."
      ],
      explain: "Demander l'interface la plus simple rend une méthode utilisable avec toutes les collections."
    },
    {
      title: "Exposer une liste en lecture seule",
      code: `var team = new Team();
team.Add("Alice");
team.Add("Bob");
team.Add("   "); // refusé par la validation

IReadOnlyList<string> members = team.Members;
Console.WriteLine($"{members.Count} membres, premier : {members[0]}");
// members.Add("Pirate"); // ne compile pas : pas de Add

foreach (string m in members)
{
    Console.WriteLine(m);
}

class Team
{
    private readonly List<string> _members = [];

    public IReadOnlyList<string> Members => _members;

    public void Add(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return;
        _members.Add(name);
    }
}`,
      output: `2 membres, premier : Alice
Alice
Bob`,
      steps: [
        "<code>private readonly List&lt;string&gt; _members = [];</code> : la vraie liste est cachée dans la classe.",
        "<code>public IReadOnlyList&lt;string&gt; Members =&gt; _members;</code> expose la même liste, mais vue à travers une interface sans <code>Add</code> ni <code>Remove</code>.",
        "<code>public void Add(string name)</code> est le seul moyen d'ajouter : il refuse les noms vides.",
        "<code>team.Add(\"   \");</code> est ignoré par la validation : il n'y a que 2 membres.",
        "<code>members.Count</code> et <code>members[0]</code> restent disponibles : on peut lire tout ce qu'on veut."
      ]
    },
    {
      title: "Des séquences avec yield return",
      code: `Console.WriteLine(string.Join(" ", EvenNumbers(10)));

foreach (string line in Countdown(3))
{
    Console.WriteLine(line);
}

static IEnumerable<int> EvenNumbers(int max)
{
    for (int i = 0; i <= max; i += 2)
    {
        yield return i;
    }
}

static IEnumerable<string> Countdown(int from)
{
    for (int i = from; i > 0; i--)
    {
        yield return $"{i}...";
    }
    yield return "Décollage !";
}`,
      output: `0 2 4 6 8 10
3...
2...
1...
Décollage !`,
      steps: [
        "<code>static IEnumerable&lt;int&gt; EvenNumbers(int max)</code> annonce qu'elle renvoie une séquence d'entiers.",
        "<code>yield return i;</code> donne une valeur, puis la méthode se met en pause jusqu'à ce qu'on demande la suivante.",
        "<code>string.Join(\" \", EvenNumbers(10))</code> parcourt toute la séquence et colle les valeurs avec un espace.",
        "<code>yield return \"Décollage !\";</code> : on peut avoir plusieurs <code>yield return</code>, ici un dernier après la boucle.",
        "<code>foreach (string line in Countdown(3))</code> consomme la séquence valeur par valeur. Aucune liste n'a été créée."
      ],
      explain: "yield return est parfait pour produire une suite de valeurs à la demande, sans tout stocker."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Le bon outil",
      prompt: "<p>Pour chaque besoin, choisis une collection et écris une ligne de déclaration C# : (1) les numéros de téléphone par nom ; (2) les adresses e-mail déjà inscrites à une newsletter ; (3) les tickets de support à traiter dans l'ordre d'arrivée ; (4) les 12 mois de l'année.</p>",
      hint: "<p>Clé → valeur, présence sans doublon, ordre d'arrivée, taille fixe.</p>",
      solution: `Dictionary<string, string> phonesByName = new();   // (1) clé -> valeur
HashSet<string> subscribedEmails = new();           // (2) présence, pas de doublon
Queue<string> supportTickets = new();               // (3) FIFO
string[] months = new string[12];                   // (4) taille fixe

Console.WriteLine(months.Length); // 12`
    },
    {
      level: "moyen",
      title: "Moyenne universelle",
      prompt: "<p>Écris <code>static double Average(IEnumerable&lt;int&gt; values)</code> qui calcule la moyenne avec un <code>foreach</code> (renvoie 0 si la séquence est vide). Appelle-la avec un tableau, une <code>List&lt;int&gt;</code> et une <code>Queue&lt;int&gt;</code>.</p>",
      hint: "<p>Compte les éléments toi-même dans la boucle : <code>IEnumerable</code> n'a pas de <code>Count</code>. Pense à convertir en <code>double</code> avant de diviser.</p>",
      solution: `int[] a = [10, 20];
List<int> b = [1, 2, 3, 4];
Queue<int> c = new();
c.Enqueue(7);

Console.WriteLine(Average(a)); // 15
Console.WriteLine(Average(b)); // 2.5 (ou 2,5 selon la culture)
Console.WriteLine(Average(c)); // 7

static double Average(IEnumerable<int> values)
{
    int sum = 0;
    int count = 0;
    foreach (int v in values)
    {
        sum += v;
        count++;
    }
    return count == 0 ? 0 : (double)sum / count;
}`
    },
    {
      level: "difficile",
      title: "Une playlist protégée",
      prompt: "<p>Crée une classe <code>Playlist</code> qui garde une <code>List&lt;string&gt;</code> privée de titres. Elle expose <code>IReadOnlyList&lt;string&gt; Songs</code>, une méthode <code>Add(string title)</code> qui refuse les doublons, et une méthode <code>IEnumerable&lt;string&gt; Shuffle()</code> qui renvoie avec <code>yield return</code> d'abord les titres d'index pair, puis ceux d'index impair.</p>",
      hint: "<p>Pour les doublons, <code>_songs.Contains(title)</code> suffit ici. Pour <code>Shuffle</code>, deux boucles <code>for</code> : <code>i = 0; i += 2</code>, puis <code>i = 1; i += 2</code>.</p>",
      solution: `var playlist = new Playlist();
playlist.Add("A");
playlist.Add("B");
playlist.Add("C");
playlist.Add("A"); // refusé

Console.WriteLine(playlist.Songs.Count);                  // 3
Console.WriteLine(string.Join(", ", playlist.Shuffle())); // A, C, B

class Playlist
{
    private readonly List<string> _songs = [];

    public IReadOnlyList<string> Songs => _songs;

    public void Add(string title)
    {
        if (!_songs.Contains(title)) _songs.Add(title);
    }

    public IEnumerable<string> Shuffle()
    {
        for (int i = 0; i < _songs.Count; i += 2) yield return _songs[i];
        for (int i = 1; i < _songs.Count; i += 2) yield return _songs[i];
    }
}`
    }
  ],
  quiz: [
    {
      q: "Que garantit une valeur de type <code>IEnumerable&lt;T&gt;</code> ?",
      options: ["Qu'on peut la parcourir avec <code>foreach</code>", "Qu'on peut lire un élément par index", "Qu'on connaît son nombre d'éléments"],
      answer: 0,
      why: "<code>IEnumerable&lt;T&gt;</code> promet seulement le parcours. <code>Count</code> arrive avec <code>IReadOnlyCollection</code>/<code>ICollection</code>, et l'index avec <code>IReadOnlyList</code>/<code>IList</code>."
    },
    {
      q: "Tu dois vérifier très souvent si un identifiant est déjà connu parmi 100 000. Que choisis-tu ?",
      options: ["<code>List&lt;int&gt;</code> avec <code>Contains</code>", "<code>Queue&lt;int&gt;</code>", "<code>HashSet&lt;int&gt;</code>"],
      answer: 2,
      why: "Le <code>Contains</code> d'un HashSet est rapide quelle que soit la taille. Celui d'une List parcourt les éléments un par un : lent à cette échelle."
    },
    {
      q: "Quelle propriété est la plus adaptée pour exposer les livres d'une classe <code>Library</code> ?",
      options: ["<code>public List&lt;Book&gt; Books</code>", "<code>public IReadOnlyList&lt;Book&gt; Books</code>", "<code>public Book[] Books</code>"],
      answer: 1,
      why: "<code>IReadOnlyList</code> permet de lire et parcourir sans pouvoir ajouter ni supprimer. Une <code>List</code> publique (ou un tableau, dont on peut changer les cases) laisse n'importe qui modifier les données."
    },
    {
      q: "Que fait <code>yield return</code> dans une méthode qui renvoie <code>IEnumerable&lt;T&gt;</code> ?",
      options: ["Il termine la méthode et renvoie une liste complète", "Il donne une valeur à l'appelant puis met la méthode en pause", "Il ajoute la valeur dans une List cachée"],
      answer: 1,
      why: "Chaque <code>yield return</code> fournit une valeur ; la méthode reprend là où elle s'était arrêtée quand on demande la suivante. Aucune liste n'est construite."
    }
  ],
  project: "<p>Dans ta classe <code>Library</code>, rends la <code>List&lt;Book&gt;</code> privée (<code>_books</code>) et expose <code>public IReadOnlyList&lt;Book&gt; Books =&gt; _books;</code>. Vérifie que <code>library.Books.Add(…)</code> ne compile plus, et que l'ajout passe uniquement par <code>AddBook</code>. Bonus : une méthode <code>IEnumerable&lt;Book&gt; AvailableBooks()</code> qui renvoie avec <code>yield return</code> les livres non empruntés.</p>",
  resources: [
    { label: "Choisir une classe de collection", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/collections/selecting-a-collection-class" },
    { label: "Instruction yield", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/yield" }
  ]
});

/* ===================== 5.5 Génériques ===================== */
window.COURSE.push({
  key: "l-generics",
  title: "Les génériques : écrire du code pour n'importe quel type",
  summary: "Tu sauras écrire des méthodes et des classes génériques avec <T>, et comprendre pourquoi List<T> fonctionne avec tous les types.",
  objectives: [
    "Comprendre le problème que résolvent les génériques",
    "Écrire une méthode générique et une classe générique",
    "Utiliser plusieurs paramètres de type et default(T)",
    "Comparer avec les génériques de TypeScript"
  ],
  analogy: `<p>Un <strong>moule à gâteau réglable</strong> : la forme est toujours la même, mais tu choisis ce que tu mets dedans, chocolat, citron ou pomme. Tu n'achètes pas un moule par parfum.</p><p>Une classe générique, c'est ce moule : le code est écrit une fois, et le <code>T</code> est le parfum que tu choisis au moment de l'utiliser.</p>`,
  lesson: `
<h3>Le problème</h3>
<p>Imagine une classe <code>IntBox</code> qui contient un <code>int</code>. Demain, il te faut la même chose pour un <code>string</code>. Tu copies la classe en <code>StringBox</code>. Puis <code>BookBox</code>… Le code est dupliqué, et chaque correction de bug est à faire partout.</p>
<p>Autre idée : une seule <code>Box</code> qui contient un <code>object</code> (le type dont dérivent tous les autres). Ça marche, mais tu perds la vérification du compilateur. Il faut caster à chaque lecture : <code>(int)box.Content</code>. Et si quelqu'un y a mis un texte, ça plante à l'exécution.</p>
<div class="compare"><div><h4>Dupliquer</h4><p>Typé, mais une classe par type. Beaucoup de copier-coller.</p></div><div><h4>object</h4><p>Une seule classe, mais des casts partout et des erreurs découvertes trop tard.</p></div></div>

<h3>La solution : le paramètre de type &lt;T&gt;</h3>
<p>Un <strong>générique</strong> est un type ou une méthode qui prend un <strong>paramètre de type</strong>, noté entre chevrons. On écrit <code>class Box&lt;T&gt;</code> et, dans la classe, <code>T</code> remplace le vrai type. Quand on utilise la classe, on choisit : <code>Box&lt;int&gt;</code>, <code>Box&lt;string&gt;</code>. Le compilateur vérifie tout, sans aucun cast.</p>
<div class="flow"><span>class Box&lt;T&gt;</span><span>Box&lt;int&gt;</span><span>T devient int partout</span><span>vérifié à la compilation</span></div>
<p>Par convention, le paramètre s'appelle <code>T</code> quand il n'y en a qu'un. Avec plusieurs, on les nomme en commençant par T : <code>TKey</code>, <code>TValue</code>. Tu les connais déjà : <code>List&lt;T&gt;</code>, <code>Dictionary&lt;TKey, TValue&gt;</code>, <code>Queue&lt;T&gt;</code>… toutes les collections de ce chapitre sont des génériques.</p>

<h3>Méthodes génériques</h3>
<p>Une méthode peut aussi avoir son propre <code>&lt;T&gt;</code>, placé juste après son nom : <code>static void PrintAll&lt;T&gt;(IEnumerable&lt;T&gt; items)</code>. À l'appel, tu peux écrire <code>PrintAll&lt;int&gt;(numbers)</code>, mais en général le compilateur <strong>devine</strong> <code>T</code> à partir des arguments : <code>PrintAll(numbers)</code> suffit. C'est l'<strong>inférence de type</strong>, comme en TypeScript.</p>

<h3>default(T) : la valeur « vide » de T</h3>
<p>Dans du code générique, on ne sait pas si <code>T</code> sera un <code>int</code> ou un <code>string</code>. Pour obtenir une valeur par défaut, on écrit <code>default(T)</code>, ou simplement <code>default</code> quand le type est évident :</p>
<table>
<tr><th>T</th><th>default(T)</th></tr>
<tr><td><code>int</code>, <code>double</code></td><td><code>0</code></td></tr>
<tr><td><code>bool</code></td><td><code>false</code></td></tr>
<tr><td><code>string</code>, une classe</td><td><code>null</code></td></tr>
<tr><td>un struct</td><td>tous ses champs à leur valeur par défaut</td></tr>
</table>

<h3>Différence avec TypeScript</h3>
<p>En TypeScript, les génériques disparaissent à la compilation : dans le JavaScript produit, <code>Array&lt;string&gt;</code> n'est qu'un <code>Array</code>. En C#, le type existe <strong>vraiment à l'exécution</strong>. Une <code>List&lt;int&gt;</code> est un type différent d'une <code>List&lt;string&gt;</code>, et le code peut le savoir avec <code>typeof(T)</code>.</p>
<pre class="diagram">TypeScript              C#
----------              --
List&lt;T&gt; --compile--&gt;    List&lt;T&gt; --compile--&gt;
  Array (T efface)        List&lt;int&gt;  (T garde)
                          List&lt;string&gt;
typeof x : "object"     typeof(T).Name : "Int32"</pre>
<p>Bonus : une <code>List&lt;int&gt;</code> stocke de vrais <code>int</code> côte à côte, sans les emballer dans des objets (pas de <em>boxing</em>, vu au chapitre 4). C'est plus rapide et plus économe en mémoire.</p>
<div class="tip">Si tu te retrouves à écrire <code>object</code> puis à caster, demande-toi si un <code>&lt;T&gt;</code> ne ferait pas mieux l'affaire.</div>
<div class="note">Le type <code>Result&lt;T&gt;</code> (succès avec une valeur, ou échec avec un message) est un motif très répandu dans les API .NET modernes pour signaler une erreur attendue sans lever d'exception.</div>
`,
  examples: [
    {
      title: "Méthodes génériques : Swap et PrintAll",
      code: `List<int> numbers = [1, 2, 3];
Swap(numbers, 0, 2);
PrintAll(numbers);

List<string> words = ["gauche", "milieu", "droite"];
Swap(words, 0, 2);
PrintAll(words);

PrintAll<char>(['a', 'b']); // T écrit explicitement

static void Swap<T>(List<T> items, int i, int j)
{
    T temp = items[i];
    items[i] = items[j];
    items[j] = temp;
}

static void PrintAll<T>(IEnumerable<T> items)
{
    foreach (T item in items)
    {
        Console.Write($"[{item}]");
    }
    Console.WriteLine();
}`,
      output: `[3][2][1]
[droite][milieu][gauche]
[a][b]`,
      steps: [
        "<code>static void Swap&lt;T&gt;(List&lt;T&gt; items, int i, int j)</code> : le <code>&lt;T&gt;</code> après le nom déclare le paramètre de type de la méthode.",
        "<code>T temp = items[i];</code> : à l'intérieur, <code>T</code> s'utilise comme n'importe quel type.",
        "<code>Swap(numbers, 0, 2);</code> : le compilateur déduit <code>T = int</code> grâce à <code>numbers</code>. Pas besoin d'écrire <code>Swap&lt;int&gt;</code>.",
        "<code>Swap(words, 0, 2);</code> : la même méthode fonctionne avec <code>T = string</code>.",
        "<code>PrintAll&lt;char&gt;(['a', 'b']);</code> : on peut aussi préciser <code>T</code> à la main quand c'est utile."
      ],
      explain: "Une seule méthode, écrite une fois, typée correctement pour chaque appel."
    },
    {
      title: "Classes génériques : Box<T> et Result<T>",
      code: `var intBox = new Box<int>(42);
var textBox = new Box<string>("bonjour");
Console.WriteLine(intBox.Content + 1);      // pas de cast
Console.WriteLine(textBox.Content.ToUpper());
Result<int> ok = Result<int>.Success(10);
Result<int> ko = Result<int>.Failure("Division par zéro");
Console.WriteLine(ok.IsSuccess ? $"OK : {ok.Value}" : ok.Error);
Console.WriteLine(ko.IsSuccess ? $"OK : {ko.Value}" : ko.Error);
Console.WriteLine($"Valeur par défaut : {ko.Value}");

class Box<T>
{
    public T Content { get; }
    public Box(T content) { Content = content; }
}

class Result<T>
{
    public bool IsSuccess { get; }
    public T? Value { get; }
    public string? Error { get; }

    private Result(bool ok, T? value, string? error)
    {
        IsSuccess = ok; Value = value; Error = error;
    }

    public static Result<T> Success(T value) { return new(true, value, null); }
    public static Result<T> Failure(string error) { return new(false, default, error); }
}`,
      output: `43
BONJOUR
OK : 10
Division par zéro
Valeur par défaut : 0`,
      steps: [
        "<code>class Box&lt;T&gt;</code> déclare une classe générique ; <code>public T Content</code> aura le type choisi à la création.",
        "<code>new Box&lt;int&gt;(42)</code> : <code>Content</code> est un <code>int</code>, donc <code>intBox.Content + 1</code> marche sans cast.",
        "<code>textBox.Content.ToUpper()</code> : ici <code>Content</code> est un <code>string</code>, le compilateur le sait.",
        "<code>Result&lt;int&gt;.Success(10)</code> crée un résultat réussi qui porte une valeur.",
        "<code>new(false, default, error)</code> dans <code>Failure</code> : <code>default</code> donne la valeur vide de <code>T</code>, ici 0 pour un <code>int</code>.",
        "<code>ok.IsSuccess ? … : ok.Error</code> choisit quoi afficher selon le succès ou l'échec."
      ]
    },
    {
      title: "Plusieurs paramètres et type à l'exécution",
      code: `var entry = new Pair<string, int>("pommes", 12);
Console.WriteLine($"{entry.First} -> {entry.Second}");

Describe(42);
Describe("texte");
Describe(new List<bool>());

Console.WriteLine(DefaultOf<int>());
Console.WriteLine(DefaultOf<string>() is null);

static void Describe<T>(T value)
{
    Console.WriteLine($"T = {typeof(T).Name}");
}

static T? DefaultOf<T>()
{
    return default;
}

class Pair<TFirst, TSecond>
{
    public TFirst First { get; }
    public TSecond Second { get; }
    public Pair(TFirst first, TSecond second) { First = first; Second = second; }
}`,
      output: `pommes -> 12
T = Int32
T = String
T = List\`1
0
True`,
      steps: [
        "<code>class Pair&lt;TFirst, TSecond&gt;</code> prend deux paramètres de type, comme <code>Dictionary&lt;TKey, TValue&gt;</code>.",
        "<code>new Pair&lt;string, int&gt;(\"pommes\", 12)</code> : <code>First</code> est un <code>string</code>, <code>Second</code> un <code>int</code>.",
        "<code>typeof(T).Name</code> lit le vrai type à l'exécution : <code>Int32</code> (le nom .NET de <code>int</code>), <code>String</code>…",
        "<code>List`1</code> est le nom interne de <code>List&lt;T&gt;</code> : le <code>`1</code> signifie « un paramètre de type ».",
        "<code>DefaultOf&lt;int&gt;()</code> renvoie 0 et <code>DefaultOf&lt;string&gt;()</code> renvoie <code>null</code> : <code>default</code> s'adapte à <code>T</code>."
      ],
      explain: "Contrairement à TypeScript, le type T n'est pas effacé : C# le connaît pendant l'exécution."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Premier élément",
      prompt: "<p>Écris une méthode générique <code>static T First&lt;T&gt;(List&lt;T&gt; items)</code> qui renvoie le premier élément. Teste-la avec une liste d'entiers et une liste de textes, sans préciser <code>T</code> à l'appel.</p>",
      hint: "<p>Le corps tient en une ligne : <code>return items[0];</code>. L'inférence de type s'occupe du reste.</p>",
      solution: `List<int> numbers = [5, 8, 13];
List<string> names = ["Ada", "Linus"];

Console.WriteLine(First(numbers)); // 5
Console.WriteLine(First(names));   // Ada

static T First<T>(List<T> items)
{
    return items[0];
}`
    },
    {
      level: "moyen",
      title: "Compter une valeur",
      prompt: "<p>Écris <code>static int CountOf&lt;T&gt;(IEnumerable&lt;T&gt; items, T target)</code> qui compte combien de fois <code>target</code> apparaît. Teste avec des <code>int</code> et des <code>string</code>.</p>",
      hint: "<p>Avec un <code>T</code> quelconque, l'opérateur <code>==</code> n'est pas autorisé. Utilise <code>EqualityComparer&lt;T&gt;.Default.Equals(a, b)</code>, ou <code>Equals(item, target)</code>.</p>",
      solution: `Console.WriteLine(CountOf([1, 2, 1, 3, 1], 1));           // 3
Console.WriteLine(CountOf(["a", "b", "a"], "a"));           // 2

static int CountOf<T>(IEnumerable<T> items, T target)
{
    int count = 0;
    foreach (T item in items)
    {
        if (EqualityComparer<T>.Default.Equals(item, target)) count++;
    }
    return count;
}`
    },
    {
      level: "difficile",
      title: "Une pile générique maison",
      prompt: "<p>Crée ta propre classe <code>SimpleStack&lt;T&gt;</code> basée sur une <code>List&lt;T&gt;</code> privée, avec <code>Push(T item)</code>, <code>bool TryPop(out T? item)</code> (renvoie <code>false</code> et <code>default</code> si vide) et une propriété <code>Count</code>. Teste-la avec des <code>string</code>.</p>",
      hint: "<p>Le dessus de la pile est le dernier élément de la liste : index <code>Count - 1</code>. Dans le cas vide, écris <code>item = default;</code> avant <code>return false;</code>.</p>",
      solution: `var stack = new SimpleStack<string>();
stack.Push("a");
stack.Push("b");

while (stack.TryPop(out string? value))
{
    Console.WriteLine(value); // b puis a
}
Console.WriteLine(stack.Count); // 0

class SimpleStack<T>
{
    private readonly List<T> _items = [];

    public int Count => _items.Count;

    public void Push(T item)
    {
        _items.Add(item);
    }

    public bool TryPop(out T? item)
    {
        if (_items.Count == 0)
        {
            item = default;
            return false;
        }
        item = _items[_items.Count - 1];
        _items.RemoveAt(_items.Count - 1);
        return true;
    }
}`
    }
  ],
  quiz: [
    {
      q: "Quel problème principal les génériques résolvent-ils ?",
      options: ["Ils rendent le code plus rapide à écrire au clavier", "Ils évitent de dupliquer du code ou de passer par <code>object</code> et des casts", "Ils permettent de mélanger les types dans une même liste"],
      answer: 1,
      why: "Un générique écrit le code une fois tout en gardant la vérification de type. Il n'autorise pas le mélange : une <code>List&lt;int&gt;</code> refuse un <code>string</code>."
    },
    {
      q: "Que vaut <code>default(T)</code> quand <code>T</code> est <code>string</code> ?",
      options: ["<code>\"\"</code> (texte vide)", "<code>0</code>", "<code>null</code>"],
      answer: 2,
      why: "<code>string</code> est un type référence : sa valeur par défaut est <code>null</code>. Le piège <code>\"\"</code> est tentant, mais une chaîne vide est une vraie valeur."
    },
    {
      q: "Avec <code>static void PrintAll&lt;T&gt;(IEnumerable&lt;T&gt; items)</code>, comment l'appeler avec une <code>List&lt;int&gt;</code> ?",
      options: ["<code>PrintAll(list)</code> suffit", "Il faut obligatoirement écrire <code>PrintAll&lt;int&gt;(list)</code>", "Il faut caster : <code>PrintAll((object)list)</code>"],
      answer: 0,
      why: "Le compilateur déduit <code>T = int</code> à partir de l'argument (inférence). Écrire <code>&lt;int&gt;</code> est permis mais pas obligatoire."
    },
    {
      q: "Quelle différence majeure entre les génériques C# et TypeScript ?",
      options: ["TypeScript n'a pas de génériques", "En C#, le type <code>T</code> existe encore à l'exécution", "En C#, on ne peut avoir qu'un seul paramètre de type"],
      answer: 1,
      why: "TypeScript efface les types à la compilation ; C# les conserve, d'où <code>typeof(T)</code>. Et C# accepte plusieurs paramètres, comme <code>Dictionary&lt;TKey, TValue&gt;</code>."
    }
  ],
  project: "<p>Ta Bibliothèque a maintenant du code presque identique pour stocker les livres et les membres. Crée une classe générique <code>InMemoryRepository&lt;T&gt;</code> avec une <code>List&lt;T&gt;</code> privée, une méthode <code>Add(T item)</code> et une propriété <code>IReadOnlyList&lt;T&gt; All</code>. Utilise-la deux fois : <code>InMemoryRepository&lt;Book&gt;</code> et <code>InMemoryRepository&lt;Member&gt;</code>. (Pour chercher par <code>Id</code>, il faudra une contrainte : c'est la leçon suivante.)</p>",
  resources: [
    { label: "Génériques en C# (documentation Microsoft)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/fundamentals/types/generics" }
  ]
});

/* ===================== 5.6 Contraintes génériques ===================== */
window.COURSE.push({
  key: "l-generic-constraints",
  title: "Contraintes génériques : exiger quelque chose de T",
  summary: "Tu sauras restreindre un paramètre de type avec where pour pouvoir appeler ses méthodes en toute sécurité.",
  objectives: [
    "Comprendre pourquoi on ne peut appeler que ce que T garantit",
    "Utiliser where T : class, struct, new(), notnull, une interface ou une classe de base",
    "Écrire Max<T> et un Repository<T> avec contraintes",
    "Connaître IComparable<T> et IEquatable<T>"
  ],
  analogy: `<p>Une offre d'emploi dit « candidat quelconque » : tu ne peux rien lui confier de précis. Si elle dit « candidat <strong>titulaire du permis B</strong> », tu peux lui demander de conduire la camionnette, c'est garanti.</p><p>Une contrainte générique, c'est ce prérequis : <code>where T : IComparable&lt;T&gt;</code> veut dire « n'importe quel type, à condition qu'il sache se comparer ».</p>`,
  lesson: `
<h3>Pourquoi des contraintes ?</h3>
<p>Dans une méthode générique, <code>T</code> peut être <strong>n'importe quoi</strong>. Le compilateur ne te laisse donc utiliser que ce qui existe pour tous les types : <code>ToString()</code>, <code>Equals()</code>… et c'est à peu près tout. Si tu écris <code>a.CompareTo(b)</code> ou <code>item.Id</code>, il refuse : rien ne garantit que <code>T</code> possède ces membres.</p>
<p>Une <strong>contrainte</strong> se déclare avec le mot-clé <code>where</code>, après la signature. Elle limite les types acceptés pour <code>T</code>, et en échange tu as le droit d'utiliser ce qu'elle garantit.</p>
<div class="flow"><span>T quelconque</span><span>where T : IComparable&lt;T&gt;</span><span>a.CompareTo(b) autorisé</span></div>
<p>C'est l'équivalent exact du <code>extends</code> de TypeScript : <code>function max&lt;T extends Comparable&gt;(…)</code>.</p>

<h3>Les contraintes disponibles</h3>
<table>
<tr><th>Contrainte</th><th>Signifie</th><th>Permet</th></tr>
<tr><td><code>where T : class</code></td><td>T est un type référence</td><td>utiliser <code>null</code> avec <code>T?</code></td></tr>
<tr><td><code>where T : struct</code></td><td>T est un type valeur (int, struct…)</td><td>ne jamais être <code>null</code></td></tr>
<tr><td><code>where T : new()</code></td><td>T a un constructeur sans paramètre</td><td>écrire <code>new T()</code></td></tr>
<tr><td><code>where T : notnull</code></td><td>T n'est pas un type nullable</td><td>servir de clé (comme <code>Dictionary</code>)</td></tr>
<tr><td><code>where T : IComparable&lt;T&gt;</code></td><td>T implémente l'interface</td><td>appeler les méthodes de l'interface</td></tr>
<tr><td><code>where T : Animal</code></td><td>T est Animal ou en hérite</td><td>utiliser les membres d'<code>Animal</code></td></tr>
</table>

<h3>Plusieurs contraintes</h3>
<p>On les sépare par des virgules, dans un ordre imposé : d'abord <code>class</code>/<code>struct</code>/<code>notnull</code> (ou une classe de base), puis les interfaces, et <code>new()</code> toujours en dernier.</p>
<pre class="diagram">class Repository&lt;T&gt;
    where T : class, IEntity, new()
              |      |        |
              |      |        +-- toujours en dernier
              |      +-- interfaces
              +-- class / struct / base en premier</pre>
<p>S'il y a plusieurs paramètres de type, chacun a sa ligne <code>where</code> : <code>where TKey : notnull where TValue : class</code>.</p>

<h3>Les interfaces génériques du framework</h3>
<p>Deux interfaces reviennent sans cesse dans les contraintes :</p>
<div class="compare"><div><h4>IComparable&lt;T&gt;</h4><p>Méthode <code>CompareTo(other)</code> : renvoie un nombre négatif si plus petit, 0 si égal, positif si plus grand. Implémentée par <code>int</code>, <code>string</code>, <code>DateTime</code>… C'est elle qu'utilise <code>List.Sort()</code>.</p></div><div><h4>IEquatable&lt;T&gt;</h4><p>Méthode <code>Equals(other)</code> typée : dit si deux valeurs sont égales, sans passer par <code>object</code>. Les <code>record</code> l'implémentent automatiquement.</p></div></div>
<p>Tes propres classes peuvent implémenter <code>IComparable&lt;T&gt;</code> : elles deviennent alors utilisables avec <code>Max&lt;T&gt;</code>, <code>Sort()</code> et toute méthode qui exige cette contrainte.</p>

<h3>Le motif Repository</h3>
<p>Un <strong>repository</strong> (dépôt) est une classe qui range et retrouve des entités : <code>Add</code>, <code>GetById</code>, <code>GetAll</code>. Pour retrouver par identifiant, il faut que chaque <code>T</code> ait un <code>Id</code>. On crée donc une petite interface <code>IEntity</code> avec une propriété <code>Id</code>, et on contraint : <code>where T : IEntity</code>. Le même code sert alors pour les livres, les membres, les produits…</p>
<div class="tip">N'ajoute une contrainte que si tu en as besoin dans le corps de la méthode. Chaque contrainte réduit les types acceptés : trop contraindre rend le code moins réutilisable.</div>
<div class="note">Le repository générique est exactement ce que tu retrouveras plus tard avec Entity Framework et l'injection de dépendances : une interface <code>IRepository&lt;T&gt;</code>, une implémentation en mémoire pour les tests, une autre branchée sur la base de données.</div>
`,
  examples: [
    {
      title: "Max<T> avec IComparable<T>",
      code: `List<int> ages = [4, 17, 9, 2];

Console.WriteLine(Max(3, 8));
Console.WriteLine(Max("pomme", "banane"));
Console.WriteLine(MaxOf(ages));

static T Max<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) >= 0 ? a : b;
}

static T MaxOf<T>(List<T> items) where T : IComparable<T>
{
    T best = items[0];
    foreach (T item in items)
    {
        if (item.CompareTo(best) > 0) best = item;
    }
    return best;
}`,
      output: `8
pomme
17`,
      steps: [
        "<code>where T : IComparable&lt;T&gt;</code> : seuls les types qui savent se comparer sont acceptés.",
        "<code>a.CompareTo(b) &gt;= 0</code> est autorisé grâce à la contrainte. Sans elle, le compilateur refuse <code>CompareTo</code>.",
        "<code>Max(3, 8)</code> : <code>int</code> implémente <code>IComparable&lt;int&gt;</code>, résultat 8.",
        "<code>Max(\"pomme\", \"banane\")</code> : les textes se comparent dans l'ordre alphabétique, « pomme » vient après « banane ».",
        "<code>MaxOf(ages)</code> parcourt la liste en gardant le plus grand trouvé : 17."
      ],
      explain: "Écrire <code>Max(new object(), new object())</code> ne compilerait pas : <code>object</code> n'implémente pas <code>IComparable&lt;object&gt;</code>."
    },
    {
      title: "Un repository générique avec IEntity",
      code: `var repo = new InMemoryRepository<Product>();
repo.Add(new Product(1, "Clavier"));
repo.Add(new Product(2, "Souris"));

Product? found = repo.GetById(2);
Console.WriteLine(found?.Name ?? "introuvable");
Console.WriteLine(repo.GetById(99)?.Name ?? "introuvable");
Console.WriteLine($"Total : {repo.Count}");

interface IEntity
{
    int Id { get; }
}

record Product(int Id, string Name) : IEntity;

class InMemoryRepository<T> where T : class, IEntity
{
    private readonly Dictionary<int, T> _items = new();
    public int Count => _items.Count;
    public void Add(T item)
    {
        _items[item.Id] = item; // item.Id existe grâce à IEntity
    }

    public T? GetById(int id)
    {
        return _items.TryGetValue(id, out T? item) ? item : null;
    }
}`,
      output: `Souris
introuvable
Total : 2`,
      steps: [
        "<code>interface IEntity { int Id { get; } }</code> : le contrat « j'ai un identifiant ».",
        "<code>record Product(int Id, string Name) : IEntity;</code> : le record a une propriété <code>Id</code>, il respecte donc le contrat.",
        "<code>where T : class, IEntity</code> : deux contraintes. <code>IEntity</code> donne accès à <code>item.Id</code>, <code>class</code> autorise à renvoyer <code>null</code>.",
        "<code>_items[item.Id] = item;</code> range l'entité dans un dictionnaire, indexée par son <code>Id</code>.",
        "<code>_items.TryGetValue(id, out T? item) ? item : null</code> renvoie l'entité ou <code>null</code> si l'identifiant est inconnu.",
        "<code>found?.Name ?? \"introuvable\"</code> : <code>?.</code> évite l'erreur sur <code>null</code>, <code>??</code> fournit un texte de secours."
      ]
    },
    {
      title: "new() et classe de base",
      code: `List<Counter> counters = CreateMany<Counter>(3);
Console.WriteLine($"{counters.Count} compteurs créés");

Introduce(new Dog { Name = "Rex" });
Introduce(new Cat { Name = "Mia" });

static List<T> CreateMany<T>(int count) where T : new()
{
    List<T> items = [];
    for (int i = 0; i < count; i++) items.Add(new T());
    return items;
}

static void Introduce<T>(T animal) where T : Animal
{
    Console.WriteLine($"{animal.Name} dit {animal.Speak()}");
}

class Counter { public int Value { get; set; } }

abstract class Animal
{
    public string Name { get; set; } = "";
    public abstract string Speak();
}

class Dog : Animal { public override string Speak() { return "Wouf"; } }
class Cat : Animal { public override string Speak() { return "Miaou"; } }`,
      output: `3 compteurs créés
Rex dit Wouf
Mia dit Miaou`,
      steps: [
        "<code>where T : new()</code> garantit un constructeur sans paramètre : on peut donc écrire <code>new T()</code>.",
        "<code>CreateMany&lt;Counter&gt;(3)</code> fabrique 3 objets <code>Counter</code>. Ici on écrit <code>T</code> car aucun argument ne permet de le deviner.",
        "<code>where T : Animal</code> : <code>T</code> doit être <code>Animal</code> ou une classe qui en hérite.",
        "<code>animal.Name</code> et <code>animal.Speak()</code> sont utilisables car tout <code>Animal</code> les possède.",
        "<code>Introduce(new Cat { … })</code> : chaque animal répond avec sa propre version de <code>Speak</code> (polymorphisme, vu au chapitre 3)."
      ]
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Le plus petit",
      prompt: "<p>Écris <code>static T Min&lt;T&gt;(T a, T b) where T : IComparable&lt;T&gt;</code> et teste-la avec deux nombres et deux textes.</p>",
      hint: "<p>C'est <code>Max</code> à l'envers : renvoie <code>a</code> si <code>a.CompareTo(b) &lt;= 0</code>.</p>",
      solution: `Console.WriteLine(Min(10, 4));          // 4
Console.WriteLine(Min("zèbre", "ane"));  // ane

static T Min<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) <= 0 ? a : b;
}`
    },
    {
      level: "moyen",
      title: "Une classe comparable",
      prompt: "<p>Crée un <code>record Score(string Player, int Points)</code> qui implémente <code>IComparable&lt;Score&gt;</code> en comparant les points. Réutilise ta méthode <code>Max&lt;T&gt;</code> pour afficher le meilleur de deux scores.</p>",
      hint: "<p>Dans <code>CompareTo(Score? other)</code>, délègue à <code>Points.CompareTo(other.Points)</code>. Si <code>other</code> est <code>null</code>, renvoie 1 (on est plus grand que rien).</p>",
      solution: `var best = Max(new Score("Ana", 120), new Score("Leo", 95));
Console.WriteLine($"{best.Player} : {best.Points}"); // Ana : 120

static T Max<T>(T a, T b) where T : IComparable<T>
{
    return a.CompareTo(b) >= 0 ? a : b;
}

record Score(string Player, int Points) : IComparable<Score>
{
    public int CompareTo(Score? other)
    {
        if (other is null) return 1;
        return Points.CompareTo(other.Points);
    }
}`
    },
    {
      level: "difficile",
      title: "Repository complet",
      prompt: "<p>Reprends <code>InMemoryRepository&lt;T&gt; where T : class, IEntity</code> et ajoute : <code>bool Remove(int id)</code>, <code>IReadOnlyList&lt;T&gt; GetAll()</code> et une méthode <code>Add</code> qui lève une <code>InvalidOperationException</code> si l'<code>Id</code> existe déjà. Teste avec deux types différents (par exemple <code>Product</code> et <code>Customer</code>).</p>",
      hint: "<p><code>Dictionary.TryAdd</code> renvoie <code>false</code> si la clé existe : parfait pour détecter le doublon. Pour <code>GetAll</code>, copie les valeurs dans une <code>List&lt;T&gt;</code> avec un <code>foreach</code> sur <code>_items.Values</code>.</p>",
      solution: `var products = new InMemoryRepository<Product>();
products.Add(new Product(1, "Clavier"));
products.Add(new Product(2, "Souris"));
Console.WriteLine(products.Remove(1));        // True
Console.WriteLine(products.GetAll().Count);   // 1

var customers = new InMemoryRepository<Customer>();
customers.Add(new Customer(7, "Ada"));
try
{
    customers.Add(new Customer(7, "Bob"));
}
catch (InvalidOperationException ex)
{
    Console.WriteLine(ex.Message);            // Id 7 déjà utilisé
}

interface IEntity { int Id { get; } }
record Product(int Id, string Name) : IEntity;
record Customer(int Id, string Name) : IEntity;

class InMemoryRepository<T> where T : class, IEntity
{
    private readonly Dictionary<int, T> _items = new();

    public void Add(T item)
    {
        if (!_items.TryAdd(item.Id, item))
            throw new InvalidOperationException($"Id {item.Id} déjà utilisé");
    }

    public bool Remove(int id)
    {
        return _items.Remove(id);
    }

    public IReadOnlyList<T> GetAll()
    {
        List<T> all = [];
        foreach (T item in _items.Values) all.Add(item);
        return all;
    }
}`
    }
  ],
  quiz: [
    {
      q: "Sans contrainte, pourquoi <code>a.CompareTo(b)</code> ne compile-t-il pas dans <code>Max&lt;T&gt;(T a, T b)</code> ?",
      options: ["Parce que <code>CompareTo</code> n'existe que pour <code>int</code>", "Parce que rien ne garantit que <code>T</code> possède <code>CompareTo</code>", "Parce que les méthodes génériques ne peuvent pas appeler de méthodes"],
      answer: 1,
      why: "Le compilateur n'autorise que ce que <code>T</code> garantit. <code>where T : IComparable&lt;T&gt;</code> apporte cette garantie. <code>CompareTo</code> existe d'ailleurs aussi pour <code>string</code>, <code>DateTime</code>…"
    },
    {
      q: "Quelle contrainte permet d'écrire <code>new T()</code> ?",
      options: ["<code>where T : class</code>", "<code>where T : notnull</code>", "<code>where T : new()</code>"],
      answer: 2,
      why: "<code>new()</code> garantit un constructeur public sans paramètre. <code>class</code> dit seulement que T est un type référence : une classe peut très bien n'avoir que des constructeurs avec paramètres."
    },
    {
      q: "Quelle écriture est correcte ?",
      options: ["<code>where T : class, IEntity, new()</code>", "<code>where T : new(), class, IEntity</code>", "<code>where T : IEntity, class</code>"],
      answer: 0,
      why: "L'ordre est imposé : <code>class</code>/<code>struct</code> (ou classe de base) d'abord, puis les interfaces, et <code>new()</code> en dernier. Les deux autres ne compilent pas."
    },
    {
      q: "Dans un <code>InMemoryRepository&lt;T&gt;</code>, à quoi sert <code>where T : IEntity</code> ?",
      options: ["À rendre la classe plus rapide", "À pouvoir lire <code>item.Id</code> pour n'importe quel <code>T</code>", "À interdire les types valeur"],
      answer: 1,
      why: "<code>IEntity</code> garantit la propriété <code>Id</code>, indispensable pour retrouver un élément. Interdire les types valeur, c'est le rôle de <code>where T : class</code>."
    }
  ],
  project: "<p>Fais évoluer le repository de ta Bibliothèque : crée une interface <code>IEntity</code> avec <code>int Id { get; }</code>, fais-la implémenter par <code>Book</code> et <code>Member</code>, puis contrains <code>InMemoryRepository&lt;T&gt; where T : class, IEntity</code>. Ajoute <code>GetById(int id)</code> (qui renvoie <code>T?</code>) et <code>Remove(int id)</code>. Utilise un seul code pour <code>InMemoryRepository&lt;Book&gt;</code> et <code>InMemoryRepository&lt;Member&gt;</code>.</p>",
  resources: [
    { label: "Contraintes sur les paramètres de type", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters" },
    { label: "IComparable<T> (documentation Microsoft)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/system.icomparable-1" }
  ]
});
