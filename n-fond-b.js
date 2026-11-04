window.COURSE = window.COURSE || [];

/* ============================================================
   Jour 11 — Collections en détail
   ============================================================ */
window.COURSE.push({
  key: "f-collections",
  title: "Collections en détail",
  summary: "Connaître chaque collection de .NET, son coût réel et savoir laquelle exposer dans une API publique.",
  objectives: [
    "Utiliser tableaux, tableaux multidimensionnels et tableaux en escalier",
    "Maîtriser List<T>, Dictionary<TKey,TValue> et HashSet<T> et leurs méthodes principales",
    "Connaître Queue, Stack, LinkedList, PriorityQueue, SortedDictionary et SortedSet",
    "Choisir une collection selon la complexité de ses opérations (Big-O)",
    "Exposer la bonne interface (IEnumerable, IReadOnlyList…) dans une classe publique",
    "Éviter le piège de la modification d'une collection pendant un foreach"
  ],
  lesson: `
<h3>Pourquoi autant de collections ?</h3>
<p>En TypeScript, tu utilises presque toujours <code>Array</code>, parfois <code>Map</code> et <code>Set</code>. En C#, la bibliothèque standard (namespace <code>System.Collections.Generic</code>) propose une dizaine de collections. Ce n'est pas du luxe : chacune est optimisée pour un usage. Chercher un élément dans une <code>List&lt;T&gt;</code> de 1 million d'éléments parcourt toute la liste ; le chercher dans un <code>Dictionary&lt;TKey,TValue&gt;</code> prend un temps quasi constant. Choisir la mauvaise collection est l'une des causes les plus fréquentes de lenteur dans une application .NET.</p>
<table>
<tr><th>TypeScript</th><th>C#</th><th>Remarque</th></tr>
<tr><td><code>number[]</code></td><td><code>int[]</code> ou <code>List&lt;int&gt;</code></td><td>un tableau C# a une taille fixe, une List grandit</td></tr>
<tr><td><code>Map&lt;K, V&gt;</code></td><td><code>Dictionary&lt;TKey,TValue&gt;</code></td><td>accès par clé en O(1)</td></tr>
<tr><td><code>Set&lt;T&gt;</code></td><td><code>HashSet&lt;T&gt;</code></td><td>éléments uniques, opérations ensemblistes</td></tr>
<tr><td><code>ReadonlyArray&lt;T&gt;</code></td><td><code>IReadOnlyList&lt;T&gt;</code></td><td>vue en lecture seule</td></tr>
</table>

<h3>Les tableaux</h3>
<p>Un tableau (<code>int[]</code>) a une taille fixée à la création. C'est la structure la plus rapide et la plus compacte en mémoire, mais on ne peut ni ajouter ni retirer d'élément. Il existe deux formes à plusieurs dimensions :</p>
<ul>
<li><strong>Tableau multidimensionnel</strong> <code>int[,]</code> : une vraie grille rectangulaire (toutes les lignes ont la même longueur). On y accède avec <code>grid[ligne, colonne]</code> et on lit les dimensions avec <code>GetLength(0)</code> et <code>GetLength(1)</code>.</li>
<li><strong>Tableau en escalier</strong> (<em>jagged</em>) <code>int[][]</code> : un tableau de tableaux, chaque ligne peut avoir sa propre longueur. On y accède avec <code>jagged[ligne][colonne]</code>.</li>
</ul>
<p>Dans le code métier, on utilise rarement les tableaux directement : on préfère <code>List&lt;T&gt;</code>. Les tableaux restent utiles pour les données de taille connue, les performances et l'interopérabilité.</p>

<h3>List&lt;T&gt; : la collection par défaut</h3>
<p><code>List&lt;T&gt;</code> est un tableau qui grandit tout seul. En interne, elle possède un tableau d'une certaine <strong>capacité</strong> (<code>Capacity</code>) et un nombre d'éléments réellement utilisés (<code>Count</code>). Quand le tableau est plein, la liste en alloue un deux fois plus grand et recopie tout. Si tu connais la taille finale, passe-la au constructeur : <code>new List&lt;Order&gt;(10_000)</code> évite plusieurs copies.</p>
<ul>
<li><code>Add</code> ajoute à la fin (rapide), <code>Insert(index, x)</code> insère au milieu (décale tous les éléments suivants : lent sur une grosse liste).</li>
<li><code>Remove(x)</code> retire la première occurrence, <code>RemoveAt(i)</code> par index, <code>RemoveAll(predicate)</code> tout ce qui correspond.</li>
<li><code>Find</code>, <code>FindIndex</code>, <code>FindAll</code>, <code>Exists</code>, <code>Contains</code> : recherche linéaire (parcours complet).</li>
<li><code>Sort()</code> trie sur place ; <code>Sort((a, b) =&gt; a.Price.CompareTo(b.Price))</code> avec ta propre comparaison ; <code>BinarySearch</code> recherche en O(log n) sur une liste <em>déjà triée</em>.</li>
</ul>

<h3>Dictionary&lt;TKey,TValue&gt; : l'accès par clé</h3>
<p>Le dictionnaire range ses éléments selon le <strong>hash</strong> de la clé (<code>GetHashCode()</code>), puis vérifie l'égalité avec <code>Equals()</code>. C'est ce qui lui permet de retrouver une valeur en temps quasi constant.</p>
<ul>
<li><code>dict[key] = value</code> ajoute ou remplace ; <code>dict.Add(key, value)</code> lève une <code>ArgumentException</code> si la clé existe déjà ; <code>TryAdd</code> renvoie <code>false</code> au lieu de lever.</li>
<li>Lire <code>dict[key]</code> sur une clé absente lève <code>KeyNotFoundException</code>. Utilise <code>TryGetValue(key, out var value)</code> : une seule recherche au lieu de deux (<code>ContainsKey</code> puis l'indexeur).</li>
<li>Pour des clés texte insensibles à la casse : <code>new Dictionary&lt;string, int&gt;(StringComparer.OrdinalIgnoreCase)</code>.</li>
<li><strong>Piège :</strong> une clé doit être immuable. Si tu modifies un objet après l'avoir utilisé comme clé et que son hash change, le dictionnaire ne le retrouve plus. Les <code>record</code>, les <code>string</code>, les <code>int</code> et les <code>Guid</code> font de bonnes clés.</li>
</ul>

<h3>HashSet&lt;T&gt; : l'unicité et les ensembles</h3>
<p><code>HashSet&lt;T&gt;</code> stocke des éléments uniques et répond à <code>Contains</code> en O(1). <code>Add</code> renvoie <code>false</code> si l'élément est déjà présent : pratique pour détecter les doublons. Il offre les opérations ensemblistes : <code>UnionWith</code> (union), <code>IntersectWith</code> (intersection), <code>ExceptWith</code> (différence), <code>SymmetricExceptWith</code>, <code>IsSubsetOf</code>, <code>Overlaps</code>. Attention : ces méthodes modifient l'ensemble sur lequel on les appelle.</p>

<h3>Les collections spécialisées</h3>
<table>
<tr><th>Collection</th><th>Principe</th><th>Usage typique</th></tr>
<tr><td><code>Queue&lt;T&gt;</code></td><td>FIFO : <code>Enqueue</code> / <code>Dequeue</code> / <code>Peek</code></td><td>file de traitements, tâches en attente</td></tr>
<tr><td><code>Stack&lt;T&gt;</code></td><td>LIFO : <code>Push</code> / <code>Pop</code> / <code>Peek</code></td><td>annuler/rétablir, parcours en profondeur</td></tr>
<tr><td><code>LinkedList&lt;T&gt;</code></td><td>liste doublement chaînée</td><td>insertions/suppressions fréquentes au milieu quand on a déjà le nœud</td></tr>
<tr><td><code>PriorityQueue&lt;TElement,TPriority&gt;</code></td><td>sort l'élément de plus petite priorité d'abord</td><td>tickets urgents, planification</td></tr>
<tr><td><code>SortedDictionary&lt;TKey,TValue&gt;</code></td><td>dictionnaire toujours trié par clé (arbre)</td><td>affichage ordonné, plages de clés</td></tr>
<tr><td><code>SortedSet&lt;T&gt;</code></td><td>ensemble toujours trié</td><td>classements, <code>Min</code>/<code>Max</code> rapides</td></tr>
</table>

<h3>Les collection expressions</h3>
<p>Depuis C# 12, une syntaxe unique initialise n'importe quelle collection : <code>int[] a = [1, 2, 3];</code>, <code>List&lt;string&gt; names = ["Ana", "Bob"];</code>, et l'opérateur de décomposition <code>..</code> concatène : <code>int[] all = [..a, ..b, 99];</code>. C'est l'équivalent du spread <code>[...a, ...b]</code> de JavaScript. <code>[]</code> crée une collection vide.</p>

<h3>Quelle interface exposer ?</h3>
<p>Les collections implémentent une hiérarchie d'interfaces. Ce que tu exposes dans une signature publique est un <strong>contrat</strong> : plus il est restreint, plus tu restes libre de changer l'implémentation.</p>
<table>
<tr><th>Interface</th><th>Ce qu'elle permet</th><th>Quand l'exposer</th></tr>
<tr><td><code>IEnumerable&lt;T&gt;</code></td><td>parcourir (foreach, LINQ)</td><td>paramètre d'entrée le plus souple</td></tr>
<tr><td><code>IReadOnlyCollection&lt;T&gt;</code></td><td>parcourir + <code>Count</code></td><td>quand l'appelant a besoin de la taille</td></tr>
<tr><td><code>IReadOnlyList&lt;T&gt;</code></td><td>+ accès par index</td><td>retour de méthode, propriété d'un agrégat</td></tr>
<tr><td><code>IReadOnlyDictionary&lt;TKey,TValue&gt;</code></td><td>lecture par clé</td><td>exposer un dictionnaire sans permettre de l'éditer</td></tr>
<tr><td><code>ICollection&lt;T&gt;</code> / <code>IList&lt;T&gt;</code></td><td>+ ajout/suppression</td><td>rarement : seulement si l'appelant doit modifier</td></tr>
</table>
<p>Règle pratique : <strong>accepte large</strong> (<code>IEnumerable&lt;T&gt;</code> en paramètre) et <strong>retourne précis mais en lecture seule</strong> (<code>IReadOnlyList&lt;T&gt;</code>). Dans une entité, garde une <code>List&lt;T&gt;</code> privée et expose-la en <code>IReadOnlyList&lt;T&gt;</code> : personne ne peut ajouter une ligne de commande sans passer par ta méthode <code>AddLine</code>, qui vérifie les règles.</p>

<h3>Complexité des opérations</h3>
<table>
<tr><th>Opération</th><th>List&lt;T&gt;</th><th>Dictionary / HashSet</th><th>SortedDictionary / SortedSet</th><th>LinkedList&lt;T&gt;</th></tr>
<tr><td>Ajout à la fin</td><td>O(1) amorti</td><td>O(1)</td><td>O(log n)</td><td>O(1)</td></tr>
<tr><td>Accès par index</td><td>O(1)</td><td>—</td><td>—</td><td>O(n)</td></tr>
<tr><td>Recherche d'un élément</td><td>O(n)</td><td>O(1)</td><td>O(log n)</td><td>O(n)</td></tr>
<tr><td>Insertion au milieu</td><td>O(n)</td><td>—</td><td>O(log n)</td><td>O(1) si on a le nœud</td></tr>
<tr><td>Suppression</td><td>O(n)</td><td>O(1)</td><td>O(log n)</td><td>O(1) si on a le nœud</td></tr>
</table>
<p>Un <code>list.Contains(x)</code> dans une boucle sur une autre liste donne du O(n×m) : avec 10 000 éléments de chaque côté, c'est 100 millions de comparaisons. Mettre la seconde liste dans un <code>HashSet</code> ramène le tout à O(n+m).</p>

<h3>Le piège du foreach</h3>
<p>Modifier une collection pendant qu'on la parcourt avec <code>foreach</code> lève <code>InvalidOperationException: Collection was modified</code>. Solutions : <code>list.RemoveAll(predicate)</code>, une boucle <code>for</code> qui part de la fin, ou parcourir une copie (<code>foreach (var x in list.ToList())</code>).</p>

<h3>Lecture seule, immuable et figée : trois choses différentes</h3>
<p>Exposer une <code>IReadOnlyList&lt;T&gt;</code> empêche l'appelant de modifier la liste, mais la liste elle-même peut toujours changer : si ta classe ajoute un élément, l'appelant le voit. Ce n'est qu'une <strong>vue</strong>. Trois niveaux existent :</p>
<ul>
<li><strong>Vue en lecture seule</strong> : <code>IReadOnlyList&lt;T&gt;</code> ou <code>list.AsReadOnly()</code>. Gratuit, mais le contenu peut évoluer derrière.</li>
<li><strong>Collection immuable</strong> (<code>System.Collections.Immutable</code>) : <code>ImmutableList&lt;T&gt;</code>, <code>ImmutableDictionary&lt;TKey,TValue&gt;</code>. Toute « modification » renvoie une nouvelle collection et l'ancienne ne change jamais. Idéal pour partager des données entre threads sans verrou.</li>
<li><strong>Collection figée</strong> (.NET 8+) : <code>FrozenDictionary&lt;TKey,TValue&gt;</code> et <code>FrozenSet&lt;T&gt;</code>, créées avec <code>ToFrozenDictionary()</code>. Leur construction est plus lente, mais la lecture est la plus rapide possible. Parfaites pour des données de référence chargées une fois au démarrage (liste des pays, codes TVA) puis lues des millions de fois.</li>
</ul>
<p>Enfin, garde en tête que les collections standard ne sont <strong>pas thread-safe</strong> : deux threads qui écrivent dans le même <code>Dictionary</code> peuvent le corrompre. Le module sur la concurrence présentera <code>ConcurrentDictionary</code> et les autres collections du namespace <code>System.Collections.Concurrent</code>.</p>

<div class="note">En revue de code, un senior repère trois choses : une recherche dans une List à l'intérieur d'une boucle (à remplacer par un HashSet ou un Dictionary), une collection interne exposée en <code>List&lt;T&gt;</code> publique (n'importe qui peut la modifier et contourner les règles métier), et des dictionnaires de chaînes sans <code>StringComparer</code> explicite. Préciser la capacité initiale quand la taille est connue est un petit gain gratuit.</div>
`,
  examples: [
    {
      title: "Tableaux simples, multidimensionnels et en escalier",
      code: `// Tableau simple : taille fixe
int[] scores = [12, 15, 9, 18];
Console.WriteLine($"Premier : {scores[0]}, taille : {scores.Length}");

// Tableau multidimensionnel : grille rectangulaire 3 x 4
int[,] grid = new int[3, 4];
for (int row = 0; row < grid.GetLength(0); row++)
    for (int col = 0; col < grid.GetLength(1); col++)
        grid[row, col] = row * 10 + col;

Console.WriteLine($"grid[2, 3] = {grid[2, 3]}"); // 23

// Tableau en escalier : chaque ligne a sa propre longueur
int[][] jagged =
[
    [1],
    [1, 1],
    [1, 2, 1],
    [1, 3, 3, 1]
];
foreach (int[] line in jagged)
    Console.WriteLine(string.Join(" ", line));

// Tri et recherche dans un tableau
Array.Sort(scores);
Console.WriteLine(string.Join(", ", scores)); // 9, 12, 15, 18
Console.WriteLine(Array.IndexOf(scores, 15)); // 2`,
      explain: "<code>int[,]</code> est une seule grille en mémoire ; <code>int[][]</code> est un tableau de tableaux indépendants, comme un tableau de tableaux en JavaScript."
    },
    {
      title: "List<T> : ajout, recherche, suppression, tri",
      code: `List<string> products = new(capacity: 8) { "Clavier", "Souris", "Écran" };

products.Add("Webcam");
products.Insert(0, "Casque");          // décale tous les éléments
Console.WriteLine($"Count={products.Count}, Capacity={products.Capacity}");

string? firstLong = products.Find(p => p.Length > 6);
int index = products.FindIndex(p => p == "Souris");
Console.WriteLine($"Premier nom long : {firstLong}, index de Souris : {index}");

products.Remove("Écran");              // première occurrence
products.RemoveAll(p => p.StartsWith('C'));
Console.WriteLine(string.Join(", ", products)); // Souris, Webcam

// Tri avec une comparaison personnalisée (par longueur puis alphabétique)
List<string> words = ["banane", "kiwi", "ananas", "figue"];
words.Sort((a, b) =>
{
    int byLength = a.Length.CompareTo(b.Length);
    return byLength != 0 ? byLength : string.CompareOrdinal(a, b);
});
Console.WriteLine(string.Join(", ", words)); // kiwi, figue, ananas, banane

// BinarySearch exige une liste triée
List<int> sorted = [3, 8, 15, 42, 99];
Console.WriteLine(sorted.BinarySearch(42)); // 3`,
      explain: "<code>Find</code> renvoie <code>null</code> (ou la valeur par défaut) si rien ne correspond, d'où le type <code>string?</code>."
    },
    {
      title: "Dictionary : TryGetValue, TryAdd et comparateur",
      code: `// Stock par référence produit, insensible à la casse
var stock = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase)
{
    ["KB-01"] = 12,
    ["MS-02"] = 0
};

stock["SC-03"] = 5;                    // ajoute
stock["kb-01"] += 3;                   // même clé que "KB-01"
bool added = stock.TryAdd("MS-02", 99); // false : la clé existe déjà

// Une seule recherche au lieu de ContainsKey + indexeur
if (stock.TryGetValue("SC-03", out int quantity))
    Console.WriteLine($"SC-03 : {quantity} en stock");

// Lire une clé absente avec l'indexeur lève KeyNotFoundException
try
{
    Console.WriteLine(stock["XX-99"]);
}
catch (KeyNotFoundException)
{
    Console.WriteLine("Référence inconnue");
}

// Valeur par défaut si absente
int webcams = stock.GetValueOrDefault("WC-04", 0);

foreach (var (reference, qty) in stock)   // déconstruction de KeyValuePair
    Console.WriteLine($"{reference} -> {qty}");

Console.WriteLine($"Ajout de MS-02 : {added}, webcams : {webcams}");`,
      explain: "<code>foreach (var (k, v) in dict)</code> déconstruit chaque <code>KeyValuePair</code>. L'ordre de parcours d'un Dictionary n'est pas garanti : ne t'appuie jamais dessus."
    },
    {
      title: "HashSet, Queue, Stack et PriorityQueue",
      code: `// HashSet : unicité et opérations ensemblistes
HashSet<string> monday = ["ana", "bob", "chloe"];
HashSet<string> tuesday = ["bob", "david"];

Console.WriteLine(monday.Add("ana"));     // false : déjà présent

var both = new HashSet<string>(monday);
both.IntersectWith(tuesday);              // modifie "both"
Console.WriteLine($"Les deux jours : {string.Join(", ", both)}"); // bob

var onlyMonday = new HashSet<string>(monday);
onlyMonday.ExceptWith(tuesday);
Console.WriteLine($"Lundi seulement : {string.Join(", ", onlyMonday)}");

// Queue : premier arrivé, premier servi
Queue<string> jobs = new();
jobs.Enqueue("facture-1");
jobs.Enqueue("facture-2");
Console.WriteLine(jobs.Dequeue());       // facture-1

// Stack : dernier arrivé, premier servi
Stack<string> history = new();
history.Push("page-accueil");
history.Push("page-produit");
Console.WriteLine(history.Pop());        // page-produit

// PriorityQueue : la plus petite priorité sort d'abord
PriorityQueue<string, int> tickets = new();
tickets.Enqueue("Question sur une facture", 3);
tickets.Enqueue("Site en panne", 1);
tickets.Enqueue("Demande de fonctionnalité", 5);

while (tickets.TryDequeue(out string? ticket, out int priority))
    Console.WriteLine($"[{priority}] {ticket}");`,
      explain: "La <code>PriorityQueue</code> n'est pas triée quand on la parcourt : seul l'ordre de sortie (<code>Dequeue</code>) respecte la priorité."
    },
    {
      title: "Exposer une collection en lecture seule et éviter le piège du foreach",
      code: `var cart = new Cart();
cart.Add("Clavier", 49.90m);
cart.Add("Souris", 19.90m);
cart.Add("Tapis", 9.90m);

// cart.Items.Add(...) ne compile pas : IReadOnlyList n'a pas de méthode Add
Console.WriteLine($"{cart.Items.Count} articles, total {cart.Total:C}");

cart.RemoveCheaperThan(15m);
Console.WriteLine(string.Join(", ", cart.Items.Select(i => i.Name)));

public record CartItem(string Name, decimal Price);

public class Cart
{
    // La liste reste privée : seules les méthodes de Cart la modifient
    private readonly List<CartItem> _items = [];

    public IReadOnlyList<CartItem> Items => _items;
    public decimal Total => _items.Sum(i => i.Price);

    public void Add(string name, decimal price)
    {
        if (price <= 0) throw new ArgumentOutOfRangeException(nameof(price));
        _items.Add(new CartItem(name, price));
    }

    public void RemoveCheaperThan(decimal limit)
    {
        // FAUX : foreach + Remove lève InvalidOperationException
        // foreach (var item in _items) if (item.Price < limit) _items.Remove(item);

        // JUSTE : RemoveAll fait le travail en une passe
        _items.RemoveAll(i => i.Price < limit);
    }
}`,
      explain: "C'est le modèle à reproduire dans tes entités : <code>List&lt;T&gt;</code> privée, <code>IReadOnlyList&lt;T&gt;</code> publique, et des méthodes qui protègent les règles métier."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Compter les mots d'un texte",
      prompt: "<p>Écris une méthode <code>Dictionary&lt;string, int&gt; CountWords(string text)</code> qui compte les occurrences de chaque mot, sans tenir compte de la casse ni de la ponctuation simple (<code>. , ; ! ?</code>). Affiche ensuite les mots triés par nombre d'occurrences décroissant.</p>",
      hint: "<p>Utilise <code>text.Split(separateurs, StringSplitOptions.RemoveEmptyEntries)</code>, un dictionnaire créé avec <code>StringComparer.OrdinalIgnoreCase</code>, et pour incrémenter : <code>dict[word] = dict.GetValueOrDefault(word) + 1</code>.</p>",
      solution: `var counts = CountWords("Le chat dort. Le chien dort aussi ! Le chat ?");

foreach (var (word, count) in counts.OrderByDescending(kv => kv.Value).ThenBy(kv => kv.Key))
    Console.WriteLine($"{word} : {count}");

static Dictionary<string, int> CountWords(string text)
{
    char[] separators = [' ', '.', ',', ';', '!', '?'];
    var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

    foreach (string word in text.Split(separators, StringSplitOptions.RemoveEmptyEntries))
        counts[word] = counts.GetValueOrDefault(word) + 1;

    return counts;
}
// Affiche : Le : 3, chat : 2, dort : 2, aussi : 1, chien : 1`
    },
    {
      level: "moyen",
      title: "Annuler et rétablir avec deux piles",
      prompt: "<p>Crée une classe <code>TextEditor</code> qui contient un texte. Elle expose <code>Type(string s)</code> (ajoute du texte), <code>Undo()</code> et <code>Redo()</code>. Un nouveau <code>Type</code> après un <code>Undo</code> vide l'historique de rétablissement, comme dans un vrai éditeur. Expose <code>CanUndo</code> et <code>CanRedo</code>.</p>",
      hint: "<p>Deux <code>Stack&lt;string&gt;</code> : une pile des états précédents (undo) et une pile des états annulés (redo). Avant chaque modification, empile l'état courant dans undo.</p>",
      solution: `var editor = new TextEditor();
editor.Type("Bonjour");
editor.Type(" le monde");
editor.Undo();
Console.WriteLine(editor.Text);   // Bonjour
editor.Redo();
Console.WriteLine(editor.Text);   // Bonjour le monde
editor.Undo();
editor.Type(" à tous");
Console.WriteLine(editor.Text);   // Bonjour à tous
Console.WriteLine(editor.CanRedo); // False

public class TextEditor
{
    private readonly Stack<string> _undo = new();
    private readonly Stack<string> _redo = new();

    public string Text { get; private set; } = "";
    public bool CanUndo => _undo.Count > 0;
    public bool CanRedo => _redo.Count > 0;

    public void Type(string s)
    {
        _undo.Push(Text);
        _redo.Clear();          // une nouvelle saisie invalide le "rétablir"
        Text += s;
    }

    public void Undo()
    {
        if (!CanUndo) return;
        _redo.Push(Text);
        Text = _undo.Pop();
    }

    public void Redo()
    {
        if (!CanRedo) return;
        _undo.Push(Text);
        Text = _redo.Pop();
    }
}`
    },
    {
      level: "difficile",
      title: "Cache LRU en O(1)",
      prompt: "<p>Implémente un cache <code>LruCache&lt;TKey, TValue&gt;</code> de capacité fixe. <code>Get(key)</code> renvoie la valeur (ou <code>false</code> via un <code>TryGet</code>) et marque l'élément comme récemment utilisé. <code>Put(key, value)</code> ajoute ou met à jour ; si la capacité est dépassée, l'élément utilisé le moins récemment est retiré. Toutes les opérations doivent être en O(1).</p>",
      hint: "<p>Combine une <code>LinkedList&lt;(TKey Key, TValue Value)&gt;</code> (l'ordre d'utilisation : le plus récent en tête) et un <code>Dictionary&lt;TKey, LinkedListNode&lt;...&gt;&gt;</code> qui pointe directement vers le nœud. Déplacer un nœud dont on a la référence coûte O(1).</p>",
      solution: `var cache = new LruCache<string, int>(capacity: 2);
cache.Put("a", 1);
cache.Put("b", 2);
cache.TryGet("a", out _);   // "a" devient le plus récent
cache.Put("c", 3);          // retire "b", le moins récemment utilisé

Console.WriteLine(cache.TryGet("b", out _));        // False
Console.WriteLine(cache.TryGet("a", out int a) ? a : -1); // 1
Console.WriteLine(cache.TryGet("c", out int c) ? c : -1); // 3

public class LruCache<TKey, TValue> where TKey : notnull
{
    private readonly int _capacity;
    private readonly Dictionary<TKey, LinkedListNode<(TKey Key, TValue Value)>> _map;
    private readonly LinkedList<(TKey Key, TValue Value)> _order = new();

    public LruCache(int capacity)
    {
        ArgumentOutOfRangeException.ThrowIfNegativeOrZero(capacity);
        _capacity = capacity;
        _map = new(capacity);
    }

    public bool TryGet(TKey key, out TValue value)
    {
        if (_map.TryGetValue(key, out var node))
        {
            // Remet le nœud en tête : O(1) car on a la référence
            _order.Remove(node);
            _order.AddFirst(node);
            value = node.Value.Value;
            return true;
        }
        value = default!;
        return false;
    }

    public void Put(TKey key, TValue value)
    {
        if (_map.TryGetValue(key, out var existing))
        {
            _order.Remove(existing);
            _map.Remove(key);
        }
        else if (_map.Count == _capacity)
        {
            // Le moins récent est en queue de liste
            var last = _order.Last!;
            _order.RemoveLast();
            _map.Remove(last.Value.Key);
        }

        var node = _order.AddFirst((key, value));
        _map[key] = node;
    }
}`
    }
  ],
  project: `
<p><strong>Démarrage du fil rouge OrderFlow.</strong> OrderFlow est l'API de gestion de commandes que tu vas construire jusqu'à la fin du parcours. Aujourd'hui, tu poses le domaine dans une application console.</p>
<ol>
<li>Crée une solution : <code>dotnet new sln -n OrderFlow</code>, puis <code>dotnet new classlib -n OrderFlow.Domain</code> et <code>dotnet new console -n OrderFlow.ConsoleApp</code>, ajoute les deux projets à la solution et une référence de la console vers le domaine.</li>
<li>Dans <code>OrderFlow.Domain</code>, crée :
<ul>
<li><code>enum OrderStatus { Draft, Submitted, Paid, Shipped, Cancelled }</code></li>
<li><code>Customer</code> (Id, Name, Email) et <code>Product</code> (Id, Name, UnitPrice, Stock)</li>
<li><code>OrderLine</code> en <code>record</code> (ProductId, Quantity, UnitPrice) avec une propriété calculée <code>Total</code></li>
<li><code>Order</code> avec une <code>List&lt;OrderLine&gt;</code> privée exposée en <code>IReadOnlyList&lt;OrderLine&gt;</code>, une méthode <code>AddLine</code> qui refuse une quantité nulle et fusionne les lignes d'un même produit, et une propriété <code>Total</code></li>
</ul></li>
<li>Crée une classe <code>Catalog</code> qui stocke les produits dans un <code>Dictionary&lt;int, Product&gt;</code> et expose <code>TryGetProduct(int id, out Product product)</code> et <code>IReadOnlyCollection&lt;Product&gt; All</code>.</li>
<li>Dans la console, remplis un catalogue de 5 produits, crée une commande de 3 lignes et affiche son détail et son total.</li>
</ol>
<pre><code>public sealed class Order
{
    private readonly List&lt;OrderLine&gt; _lines = [];

    public int Id { get; }
    public int CustomerId { get; }
    public OrderStatus Status { get; private set; } = OrderStatus.Draft;
    public IReadOnlyList&lt;OrderLine&gt; Lines =&gt; _lines;
    public decimal Total =&gt; _lines.Sum(l =&gt; l.Total);
    // ...
}</code></pre>
`,
  resources: [
    { label: "Collections et structures de données (.NET)", url: "https://learn.microsoft.com/dotnet/standard/collections/" },
    { label: "Collection expressions (C#)", url: "https://learn.microsoft.com/dotnet/csharp/language-reference/operators/collection-expressions" },
    { label: "Dictionary<TKey,TValue>", url: "https://learn.microsoft.com/dotnet/api/system.collections.generic.dictionary-2" },
    { label: "PriorityQueue<TElement,TPriority>", url: "https://learn.microsoft.com/dotnet/api/system.collections.generic.priorityqueue-2" }
  ]
});

/* ============================================================
   Jour 12 — Génériques en détail
   ============================================================ */
window.COURSE.push({
  key: "f-generics",
  title: "Génériques en détail",
  summary: "Écrire du code réutilisable et typé avec les génériques, leurs contraintes et la variance.",
  objectives: [
    "Comprendre ce que les génériques résolvent par rapport à object et aux casts",
    "Écrire des méthodes, classes et interfaces génériques",
    "Utiliser les contraintes where pour exprimer ce que T doit savoir faire",
    "Connaître default(T), l'inférence de type et le comportement des membres static",
    "Comprendre la covariance (out) et la contravariance (in)",
    "Savoir en quoi les génériques C# diffèrent de ceux de TypeScript"
  ],
  lesson: `
<h3>Le problème que les génériques résolvent</h3>
<p>Avant les génériques (C# 2.0), une collection comme <code>ArrayList</code> stockait des <code>object</code>. On pouvait y mettre n'importe quoi, et il fallait caster à la lecture : <code>int x = (int)list[0];</code>. Deux problèmes : une erreur de type n'apparaissait qu'à l'exécution (<code>InvalidCastException</code>), et chaque <code>int</code> stocké était <strong>boxé</strong>, c'est-à-dire copié dans un objet sur le tas, ce qui coûte de la mémoire et du temps.</p>
<p>Un type générique prend un <strong>paramètre de type</strong> : <code>List&lt;int&gt;</code> ne contient que des <code>int</code>, sans cast ni boxing, et le compilateur refuse <code>list.Add("texte")</code>. Tu connais déjà le principe en TypeScript avec <code>Array&lt;number&gt;</code> ou <code>Promise&lt;User&gt;</code>.</p>

<h3>Méthodes génériques et inférence</h3>
<p>Une méthode générique déclare son paramètre de type après son nom : <code>static void Swap&lt;T&gt;(ref T a, ref T b)</code>. À l'appel, le compilateur <strong>infère</strong> généralement <code>T</code> à partir des arguments : <code>Swap(ref x, ref y)</code> suffit. On précise <code>T</code> explicitement quand il ne peut pas être déduit, par exemple quand il n'apparaît que dans le type de retour : <code>JsonSerializer.Deserialize&lt;Order&gt;(json)</code>.</p>

<h3>Classes et interfaces génériques</h3>
<p>Une classe générique paramètre tout son comportement : <code>Result&lt;T&gt;</code> transporte soit une valeur de type <code>T</code>, soit une erreur ; <code>InMemoryRepository&lt;T&gt;</code> stocke n'importe quelle entité. Une interface générique décrit un contrat paramétré : <code>IRepository&lt;T&gt;</code>, <code>IComparer&lt;T&gt;</code>, <code>IEnumerable&lt;T&gt;</code>. Il peut y avoir plusieurs paramètres : <code>Dictionary&lt;TKey, TValue&gt;</code>. Par convention, ils commencent par <code>T</code>.</p>

<h3>Les contraintes</h3>
<p>Sans contrainte, le compilateur ne sait rien de <code>T</code> : tu ne peux appeler que les méthodes de <code>object</code>. Une contrainte <code>where</code> déclare ce que <code>T</code> doit être ou savoir faire, et débloque l'utilisation de ces capacités.</p>
<table>
<tr><th>Contrainte</th><th>Signification</th><th>Exemple d'usage</th></tr>
<tr><td><code>where T : class</code></td><td>type référence</td><td>pouvoir renvoyer <code>null</code></td></tr>
<tr><td><code>where T : struct</code></td><td>type valeur non nullable</td><td><code>T?</code> devient un <code>Nullable&lt;T&gt;</code></td></tr>
<tr><td><code>where T : new()</code></td><td>constructeur public sans paramètre</td><td>écrire <code>new T()</code></td></tr>
<tr><td><code>where T : notnull</code></td><td>type non nullable</td><td>clés de dictionnaire</td></tr>
<tr><td><code>where T : IEntity</code></td><td>implémente une interface</td><td>accéder à <code>entity.Id</code></td></tr>
<tr><td><code>where T : BaseEntity</code></td><td>hérite d'une classe</td><td>utiliser les membres de la base</td></tr>
<tr><td><code>where T : unmanaged</code></td><td>type valeur sans référence</td><td>code bas niveau, <code>Span</code>, interop</td></tr>
<tr><td><code>where T : IComparable&lt;T&gt;</code></td><td>comparable à lui-même</td><td>trouver un maximum</td></tr>
</table>
<p>On combine les contraintes : <code>where T : class, IEntity, new()</code> (<code>new()</code> toujours en dernier), et chaque paramètre a sa propre clause : <code>where TKey : notnull where TValue : class</code>.</p>

<h3>default(T)</h3>
<p>Quand tu dois renvoyer « rien » pour un <code>T</code> quelconque, tu ne peux pas écrire <code>null</code> (si <code>T</code> est un <code>int</code>, ça n'a pas de sens). <code>default(T)</code>, ou simplement <code>default</code>, vaut <code>null</code> pour un type référence, <code>0</code> pour un nombre, <code>false</code> pour un booléen. Avec les types nullables activés, le type de retour s'écrit <code>T?</code> pour signaler que la valeur peut être absente.</p>

<h3>Génériques et membres static</h3>
<p>Chaque type générique <strong>fermé</strong> (<code>Counter&lt;int&gt;</code>, <code>Counter&lt;string&gt;</code>) est un type distinct pour le runtime, avec ses propres champs <code>static</code>. Un compteur statique dans <code>Counter&lt;T&gt;</code> est donc séparé pour chaque <code>T</code>. C'est parfois utile (un cache par type), souvent surprenant.</p>

<h3>Covariance et contravariance</h3>
<p>Un <code>string</code> est un <code>object</code>. Mais une <code>List&lt;string&gt;</code> n'est pas une <code>List&lt;object&gt;</code> : sinon on pourrait y ajouter un <code>int</code> via la référence <code>List&lt;object&gt;</code> et casser la liste. En revanche :</p>
<ul>
<li><strong>Covariance (<code>out T</code>)</strong> : si une interface ne fait que <em>produire</em> des <code>T</code>, la conversion vers un type plus général est sûre. <code>IEnumerable&lt;out T&gt;</code> est covariante : un <code>IEnumerable&lt;string&gt;</code> peut être utilisé comme un <code>IEnumerable&lt;object&gt;</code>, car on ne peut qu'en lire.</li>
<li><strong>Contravariance (<code>in T</code>)</strong> : si une interface ou un délégué ne fait que <em>consommer</em> des <code>T</code>, la conversion inverse est sûre. <code>Action&lt;in T&gt;</code> : une <code>Action&lt;object&gt;</code> (qui sait traiter n'importe quel objet) peut servir là où on attend une <code>Action&lt;string&gt;</code>.</li>
</ul>
<p>Moyen mnémotechnique : <code>out</code> = ce qui sort (retours), <code>in</code> = ce qui entre (paramètres). La variance ne s'applique qu'aux interfaces et aux délégués, et seulement pour des types référence.</p>

<h3>Generic math (aperçu)</h3>
<p>Depuis .NET 7, les types numériques implémentent des interfaces comme <code>INumber&lt;T&gt;</code>. On peut enfin écrire une seule méthode <code>Sum&lt;T&gt;(IEnumerable&lt;T&gt; values) where T : INumber&lt;T&gt;</code> qui fonctionne pour <code>int</code>, <code>decimal</code> et <code>double</code>, en utilisant <code>T.Zero</code> et l'opérateur <code>+</code>. Tu en auras rarement besoin dans du code métier, mais c'est bon à connaître.</p>

<h3>C# et TypeScript : la grande différence</h3>
<table>
<tr><th></th><th>TypeScript</th><th>C#</th></tr>
<tr><td>À l'exécution</td><td>types <strong>effacés</strong> : le JavaScript généré ne connaît plus <code>T</code></td><td>types <strong>réifiés</strong> : <code>typeof(T)</code> et <code>List&lt;int&gt;</code> existent au runtime</td></tr>
<tr><td>Vérifier le type</td><td>impossible de tester <code>x instanceof T</code></td><td><code>x is T</code> fonctionne</td></tr>
<tr><td>Contraintes</td><td><code>T extends Base</code> (structurel)</td><td><code>where T : Base</code> (nominal : il faut vraiment hériter/implémenter)</td></tr>
<tr><td>Types valeur</td><td>sans objet</td><td><code>List&lt;int&gt;</code> stocke de vrais int, sans boxing</td></tr>
</table>

<h3>Les génériques que tu utilises déjà</h3>
<p>Tu n'as pas attendu ce cours pour utiliser des génériques : ils sont partout dans .NET. Les reconnaître aide à lire les signatures de la documentation.</p>
<table>
<tr><th>Type ou méthode</th><th>Paramètres de type</th><th>Ce que T représente</th></tr>
<tr><td><code>List&lt;T&gt;</code>, <code>HashSet&lt;T&gt;</code></td><td>un</td><td>le type des éléments</td></tr>
<tr><td><code>Dictionary&lt;TKey,TValue&gt;</code></td><td>deux</td><td>la clé et la valeur</td></tr>
<tr><td><code>Func&lt;T, TResult&gt;</code>, <code>Action&lt;T&gt;</code></td><td>un à seize</td><td>paramètres et retour d'une fonction</td></tr>
<tr><td><code>Task&lt;T&gt;</code></td><td>un</td><td>le résultat d'une opération asynchrone (comme <code>Promise&lt;T&gt;</code>)</td></tr>
<tr><td><code>Nullable&lt;T&gt;</code> (écrit <code>T?</code>)</td><td>un</td><td>un type valeur qui peut être absent</td></tr>
<tr><td><code>Enumerable.Where&lt;TSource&gt;</code></td><td>un</td><td>le type des éléments filtrés</td></tr>
<tr><td><code>ILogger&lt;T&gt;</code>, <code>IOptions&lt;T&gt;</code></td><td>un</td><td>la catégorie de log, la classe de configuration (tu les verras avec ASP.NET Core)</td></tr>
</table>

<h3>Les pièges courants</h3>
<ul>
<li><strong><code>T?</code> sans contrainte</strong> : pour un type référence, <code>T?</code> signifie « peut être null » ; pour un type valeur sans contrainte <code>struct</code>, il ne devient pas un <code>Nullable&lt;T&gt;</code> et <code>default</code> vaut 0. Si la distinction compte, ajoute la contrainte <code>class</code> ou <code>struct</code>.</li>
<li><strong>Comparer deux <code>T</code> avec <code>==</code></strong> ne compile pas sans contrainte, et avec <code>where T : class</code> il compare les références. Utilise <code>EqualityComparer&lt;T&gt;.Default.Equals(a, b)</code>, qui respecte les <code>Equals</code> redéfinis et les records.</li>
<li><strong>Caster vers <code>T</code></strong> : <code>(T)value</code> sur un <code>object</code> fonctionne, mais si tu as souvent besoin de <code>typeof(T) == typeof(int)</code> pour changer de comportement, c'est que la méthode ne devrait pas être générique.</li>
<li><strong>Nommage</strong> : <code>T</code> seul quand il n'y a qu'un paramètre évident, sinon un nom parlant préfixé par T : <code>TEntity</code>, <code>TKey</code>, <code>TResponse</code>.</li>
</ul>

<div class="note">Les génériques doivent supprimer de la duplication réelle, pas en anticiper une imaginaire. Un <code>Repository&lt;T&gt;</code> générique est pratique pour un CRUD en mémoire, mais avec EF Core, un repository générique qui ne fait que recopier <code>DbSet&lt;T&gt;</code> n'apporte rien : tu en reparleras dans le module EF Core. Une bonne contrainte rend l'intention lisible : <code>where T : IEntity</code> dit immédiatement à quoi sert la classe.</div>
`,
  examples: [
    {
      title: "ArrayList contre List<T> : cast et boxing",
      code: `using System.Collections;

// Avant les génériques : tout est object
ArrayList legacy = new();
legacy.Add(42);          // boxing : l'int est copié dans un objet sur le tas
legacy.Add("oups");      // accepté sans broncher

int total = 0;
try
{
    foreach (object item in legacy)
        total += (int)item;   // cast obligatoire, plante sur "oups"
}
catch (InvalidCastException ex)
{
    Console.WriteLine($"Erreur à l'exécution : {ex.Message}");
}

// Avec les génériques : vérifié à la compilation, sans boxing
List<int> numbers = [42, 8];
// numbers.Add("oups");  // erreur de compilation CS1503
foreach (int n in numbers)
    total += n;          // aucun cast

Console.WriteLine(total);`,
      explain: "Le générique déplace l'erreur de l'exécution vers la compilation : c'est tout l'intérêt."
    },
    {
      title: "Méthodes génériques, inférence et contraintes",
      code: `int a = 1, b = 2;
Swap(ref a, ref b);                       // T inféré : int
Console.WriteLine($"a={a}, b={b}");

Console.WriteLine(Max([3, 17, 8]));        // 17
Console.WriteLine(Max(["kiwi", "banane"])); // kiwi (ordre alphabétique)

string? missing = FirstOrDefaultWhere(new[] { "a", "bb" }, s => s.Length > 5);
Console.WriteLine(missing ?? "(aucun)");

var p = Create<Product>();                 // T explicite : impossible à inférer
Console.WriteLine(p.Name);

static void Swap<T>(ref T x, ref T y) => (x, y) = (y, x);

// IComparable<T> donne accès à CompareTo
static T Max<T>(IEnumerable<T> items) where T : IComparable<T>
{
    using var e = items.GetEnumerator();
    if (!e.MoveNext()) throw new InvalidOperationException("Séquence vide");
    T max = e.Current;
    while (e.MoveNext())
        if (e.Current.CompareTo(max) > 0) max = e.Current;
    return max;
}

// default : null pour un type référence, 0 pour un int...
static T? FirstOrDefaultWhere<T>(IEnumerable<T> items, Func<T, bool> predicate)
{
    foreach (T item in items)
        if (predicate(item)) return item;
    return default;
}

// new() autorise "new T()"
static T Create<T>() where T : new() => new T();

public class Product
{
    public string Name { get; set; } = "Produit sans nom";
}`,
      explain: "<code>Create&lt;Product&gt;()</code> doit préciser <code>T</code> car aucun argument ne permet de le deviner."
    },
    {
      title: "Une classe générique : Result<T>",
      code: `Result<decimal> ok = Divide(10, 4);
Result<decimal> ko = Divide(10, 0);

Console.WriteLine(ok.IsSuccess ? $"Résultat : {ok.Value}" : ok.Error);
Console.WriteLine(ko.IsSuccess ? $"Résultat : {ko.Value}" : ko.Error);

static Result<decimal> Divide(decimal x, decimal y) =>
    y == 0 ? Result<decimal>.Failure("Division par zéro") : Result<decimal>.Success(x / y);

public sealed class Result<T>
{
    private readonly T? _value;

    private Result(T? value, string? error)
    {
        _value = value;
        Error = error;
    }

    public bool IsSuccess => Error is null;
    public string? Error { get; }

    // Lire Value sur un échec est une erreur de programmation
    public T Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException($"Pas de valeur : {Error}");

    public static Result<T> Success(T value) => new(value, null);
    public static Result<T> Failure(string error) => new(default, error);
}`,
      explain: "Le même type <code>Result&lt;T&gt;</code> servira pour <code>Result&lt;Order&gt;</code>, <code>Result&lt;Customer&gt;</code>, etc. Les constructeurs privés forcent le passage par <code>Success</code> ou <code>Failure</code>."
    },
    {
      title: "Interface générique et repository en mémoire",
      code: `var customers = new InMemoryRepository<Customer>();
customers.Add(new Customer(1, "Ana"));
customers.Add(new Customer(2, "Bob"));

var products = new InMemoryRepository<Product>();
products.Add(new Product(10, "Clavier", 49.90m));

Console.WriteLine(customers.GetById(2)?.Name);           // Bob
Console.WriteLine(customers.Find(c => c.Name.StartsWith('A')).Count); // 1
Console.WriteLine(products.GetById(99) is null);         // True

public interface IEntity
{
    int Id { get; }
}

public record Customer(int Id, string Name) : IEntity;
public record Product(int Id, string Name, decimal Price) : IEntity;

public interface IRepository<T> where T : IEntity
{
    void Add(T entity);
    T? GetById(int id);
    IReadOnlyList<T> Find(Func<T, bool> predicate);
}

public class InMemoryRepository<T> : IRepository<T> where T : class, IEntity
{
    private readonly Dictionary<int, T> _items = [];

    public void Add(T entity)
    {
        // La contrainte IEntity rend entity.Id accessible
        if (!_items.TryAdd(entity.Id, entity))
            throw new InvalidOperationException($"{typeof(T).Name} {entity.Id} existe déjà");
    }

    public T? GetById(int id) => _items.GetValueOrDefault(id);

    public IReadOnlyList<T> Find(Func<T, bool> predicate) =>
        _items.Values.Where(predicate).ToList();
}`,
      explain: "<code>typeof(T).Name</code> affiche « Customer » ou « Product » : en TypeScript, ce serait impossible car <code>T</code> n'existe plus à l'exécution."
    },
    {
      title: "Static par type fermé, variance et generic math",
      code: `using System.Numerics;

// Un champ static par type fermé
Counter<int>.Increment();
Counter<int>.Increment();
Counter<string>.Increment();
Console.WriteLine($"int : {Counter<int>.Count}, string : {Counter<string>.Count}"); // 2 et 1

// Covariance : IEnumerable<out T>
IEnumerable<string> names = ["Ana", "Bob"];
IEnumerable<object> objects = names;      // autorisé : on ne fait que lire
// List<object> list = new List<string>(); // interdit : on pourrait y ajouter un int

// Contravariance : Action<in T>
Action<object> log = o => Console.WriteLine($"LOG {o}");
Action<string> logText = log;             // autorisé : log sait traiter tout objet
logText("bonjour");

// Generic math : une seule méthode pour tous les types numériques
Console.WriteLine(Sum([1, 2, 3]));            // 6
Console.WriteLine(Sum([1.5m, 2.25m]));        // 3,75
Console.WriteLine(objects.Count());

static T Sum<T>(IEnumerable<T> values) where T : INumber<T>
{
    T total = T.Zero;
    foreach (T v in values) total += v;
    return total;
}

public static class Counter<T>
{
    public static int Count { get; private set; }
    public static void Increment() => Count++;
}`,
      explain: "<code>T.Zero</code> est un membre statique abstrait d'interface, une fonctionnalité de C# 11 qui rend le generic math possible."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Une paire générique",
      prompt: "<p>Crée un <code>record Pair&lt;TFirst, TSecond&gt;(TFirst First, TSecond Second)</code> avec une méthode <code>Swap()</code> qui renvoie une <code>Pair&lt;TSecond, TFirst&gt;</code>. Écris ensuite une méthode générique <code>Pair&lt;T, T&gt; MinMax&lt;T&gt;(IEnumerable&lt;T&gt; items)</code> qui renvoie le minimum et le maximum d'une séquence.</p>",
      hint: "<p>Pour comparer, ajoute la contrainte <code>where T : IComparable&lt;T&gt;</code>. Pense à refuser une séquence vide.</p>",
      solution: `var p = new Pair<string, int>("âge", 42);
Console.WriteLine(p.Swap());                 // Pair { First = 42, Second = âge }

var range = MinMax([7, 3, 19, 11]);
Console.WriteLine($"{range.First} - {range.Second}"); // 3 - 19

static Pair<T, T> MinMax<T>(IEnumerable<T> items) where T : IComparable<T>
{
    using var e = items.GetEnumerator();
    if (!e.MoveNext()) throw new ArgumentException("Séquence vide", nameof(items));

    T min = e.Current, max = e.Current;
    while (e.MoveNext())
    {
        if (e.Current.CompareTo(min) < 0) min = e.Current;
        if (e.Current.CompareTo(max) > 0) max = e.Current;
    }
    return new Pair<T, T>(min, max);
}

public record Pair<TFirst, TSecond>(TFirst First, TSecond Second)
{
    public Pair<TSecond, TFirst> Swap() => new(Second, First);
}`
    },
    {
      level: "moyen",
      title: "Ta propre pile générique",
      prompt: "<p>Implémente <code>MyStack&lt;T&gt;</code> sans utiliser <code>Stack&lt;T&gt;</code> ni <code>List&lt;T&gt;</code> : un tableau interne qui double de taille quand il est plein. Méthodes : <code>Push</code>, <code>Pop</code> (lève <code>InvalidOperationException</code> si vide), <code>TryPeek(out T value)</code>, propriété <code>Count</code>. Fais en sorte que la classe soit utilisable dans un <code>foreach</code> (du sommet vers le bas).</p>",
      hint: "<p>Implémente <code>IEnumerable&lt;T&gt;</code> avec <code>yield return</code>. Utilise <code>Array.Resize</code> pour grandir. Après un <code>Pop</code>, remets la case à <code>default</code> pour ne pas retenir l'objet en mémoire.</p>",
      solution: `using System.Collections;

var stack = new MyStack<string>();
stack.Push("a");
stack.Push("b");
stack.Push("c");
Console.WriteLine(string.Join(", ", stack)); // c, b, a
Console.WriteLine(stack.Pop());              // c
Console.WriteLine(stack.TryPeek(out var top) ? top : "vide"); // b
Console.WriteLine(stack.Count);              // 2

public class MyStack<T> : IEnumerable<T>
{
    private T[] _items = new T[4];

    public int Count { get; private set; }

    public void Push(T item)
    {
        if (Count == _items.Length)
            Array.Resize(ref _items, _items.Length * 2);
        _items[Count++] = item;
    }

    public T Pop()
    {
        if (Count == 0) throw new InvalidOperationException("La pile est vide");
        T item = _items[--Count];
        _items[Count] = default!;   // libère la référence pour le GC
        return item;
    }

    public bool TryPeek(out T value)
    {
        if (Count == 0)
        {
            value = default!;
            return false;
        }
        value = _items[Count - 1];
        return true;
    }

    public IEnumerator<T> GetEnumerator()
    {
        for (int i = Count - 1; i >= 0; i--)
            yield return _items[i];
    }

    IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
}`
    },
    {
      level: "difficile",
      title: "Repository générique avec un identifiant générique",
      prompt: "<p>Généralise le repository : <code>IEntity&lt;TId&gt;</code> expose <code>TId Id</code>, et <code>InMemoryRepository&lt;T, TId&gt;</code> fonctionne aussi bien avec des identifiants <code>int</code> que <code>Guid</code> ou <code>string</code>. Ajoute <code>Update(T entity)</code> qui renvoie un <code>Result&lt;T&gt;</code> (échec si l'entité n'existe pas) et <code>GetPage(int page, int size)</code> qui renvoie une page triée par Id. Teste avec <code>Customer</code> (Id <code>int</code>) et <code>Coupon</code> (Id <code>string</code>).</p>",
      hint: "<p>Il faut <code>where TId : notnull, IComparable&lt;TId&gt;</code> (clé de dictionnaire et tri) et <code>where T : IEntity&lt;TId&gt;</code>. Réutilise un <code>Result&lt;T&gt;</code> simple.</p>",
      solution: `var customers = new InMemoryRepository<Customer, int>();
customers.Add(new Customer(2, "Bob"));
customers.Add(new Customer(1, "Ana"));
customers.Add(new Customer(3, "Chloé"));

var updated = customers.Update(new Customer(2, "Bob Martin"));
var missing = customers.Update(new Customer(42, "Inconnu"));
Console.WriteLine(updated.IsSuccess);   // True
Console.WriteLine(missing.Error);       // Customer 42 introuvable

foreach (var c in customers.GetPage(page: 1, size: 2))
    Console.WriteLine(c);               // Ana puis Bob Martin

var coupons = new InMemoryRepository<Coupon, string>();
coupons.Add(new Coupon("NOEL10", 10));
Console.WriteLine(coupons.GetById("NOEL10")?.Percent); // 10

public interface IEntity<TId> where TId : notnull
{
    TId Id { get; }
}

public record Customer(int Id, string Name) : IEntity<int>;
public record Coupon(string Id, int Percent) : IEntity<string>;

public sealed record Result<T>(T? Value, string? Error)
{
    public bool IsSuccess => Error is null;
    public static Result<T> Success(T value) => new(value, null);
    public static Result<T> Failure(string error) => new(default, error);
}

public class InMemoryRepository<T, TId>
    where T : class, IEntity<TId>
    where TId : notnull, IComparable<TId>
{
    private readonly Dictionary<TId, T> _items = [];

    public void Add(T entity)
    {
        if (!_items.TryAdd(entity.Id, entity))
            throw new InvalidOperationException($"{typeof(T).Name} {entity.Id} existe déjà");
    }

    public T? GetById(TId id) => _items.GetValueOrDefault(id);

    public Result<T> Update(T entity)
    {
        if (!_items.ContainsKey(entity.Id))
            return Result<T>.Failure($"{typeof(T).Name} {entity.Id} introuvable");

        _items[entity.Id] = entity;
        return Result<T>.Success(entity);
    }

    public IReadOnlyList<T> GetPage(int page, int size)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(page, 1);
        ArgumentOutOfRangeException.ThrowIfLessThan(size, 1);

        return _items.Values
            .OrderBy(e => e.Id)
            .Skip((page - 1) * size)
            .Take(size)
            .ToList();
    }
}`
    }
  ],
  project: `
<p><strong>OrderFlow : des briques génériques réutilisables.</strong></p>
<ol>
<li>Ajoute dans <code>OrderFlow.Domain</code> une classe <code>Result&lt;T&gt;</code> (succès avec valeur ou échec avec message), plus une version non générique <code>Result</code> pour les opérations qui ne renvoient rien.</li>
<li>Crée l'interface <code>IEntity</code> (<code>int Id</code>) et fais-la implémenter par <code>Customer</code>, <code>Product</code> et <code>Order</code>.</li>
<li>Crée <code>IRepository&lt;T&gt;</code> et <code>InMemoryRepository&lt;T&gt; where T : class, IEntity</code> avec <code>Add</code>, <code>GetById</code>, <code>GetAll</code> (en <code>IReadOnlyList&lt;T&gt;</code>), <code>Update</code> et <code>Remove</code>, ces trois dernières renvoyant un <code>Result</code>.</li>
<li>Transforme <code>Order.AddLine</code> pour qu'elle renvoie un <code>Result</code> au lieu de lever une exception sur une quantité invalide, et affiche le message d'erreur dans la console.</li>
<li>Remplace le <code>Catalog</code> d'hier par un <code>InMemoryRepository&lt;Product&gt;</code>.</li>
</ol>
<p>Ces repositories en mémoire seront remplacés par EF Core et ADO.NET dans les modules suivants : c'est pour cela qu'on passe par une interface.</p>
`,
  resources: [
    { label: "Génériques en .NET", url: "https://learn.microsoft.com/dotnet/standard/generics/" },
    { label: "Contraintes sur les paramètres de type", url: "https://learn.microsoft.com/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters" },
    { label: "Covariance et contravariance dans les génériques", url: "https://learn.microsoft.com/dotnet/standard/generics/covariance-and-contravariance" },
    { label: "Generic math", url: "https://learn.microsoft.com/dotnet/standard/generics/math" }
  ]
});

/* ============================================================
   Jour 15 — LINQ avancé
   ============================================================ */
window.COURSE.push({
  key: "f-linq-advanced",
  title: "LINQ avancé",
  summary: "Regrouper, joindre, aplatir et comprendre l'exécution différée avant de passer à EF Core.",
  objectives: [
    "Lire et écrire la syntaxe requête et la syntaxe méthode",
    "Maîtriser GroupBy, ToLookup, Join, GroupJoin et la jointure externe gauche",
    "Utiliser SelectMany, Zip, DistinctBy, MinBy/MaxBy, Chunk et Aggregate",
    "Choisir entre First, Single et FirstOrDefault, et entre Any et Count",
    "Comprendre l'exécution différée et le coût des énumérations multiples",
    "Distinguer IEnumerable et IQueryable, et écrire ses propres opérateurs avec yield"
  ],
  lesson: `
<h3>Deux syntaxes pour la même chose</h3>
<p>LINQ s'écrit de deux façons. La <strong>syntaxe méthode</strong> enchaîne des méthodes d'extension avec des lambdas : <code>orders.Where(o =&gt; o.Total &gt; 100).Select(o =&gt; o.Id)</code>. La <strong>syntaxe requête</strong> ressemble à du SQL : <code>from o in orders where o.Total &gt; 100 select o.Id</code>. Le compilateur traduit la seconde en la première : le résultat est identique. En pratique, la syntaxe méthode domine ; la syntaxe requête reste plus lisible pour les jointures et les <code>let</code> (variables intermédiaires). Certains opérateurs (<code>Take</code>, <code>Distinct</code>, <code>Count</code>) n'existent qu'en syntaxe méthode.</p>

<h3>Regrouper : GroupBy et ToLookup</h3>
<p><code>GroupBy(o =&gt; o.CustomerId)</code> produit une séquence de groupes <code>IGrouping&lt;TKey, TElement&gt;</code> : chaque groupe a une propriété <code>Key</code> et se parcourt comme une collection. On enchaîne souvent un <code>Select</code> pour calculer un agrégat par groupe : <code>.Select(g =&gt; new { CustomerId = g.Key, Total = g.Sum(o =&gt; o.Total) })</code>. Une surcharge permet aussi de regrouper sur une clé composite : <code>GroupBy(o =&gt; new { o.CustomerId, o.Status })</code>.</p>
<p><code>ToLookup</code> fait la même chose mais <strong>immédiatement</strong> et produit une structure indexée : <code>lookup[customerId]</code> renvoie les éléments du groupe, ou une séquence vide si la clé n'existe pas (pas d'exception, contrairement à un dictionnaire).</p>

<h3>Joindre : Join, GroupJoin et jointure gauche</h3>
<ul>
<li><code>Join</code> est une <strong>jointure interne</strong> : seuls les éléments qui ont une correspondance des deux côtés sortent.</li>
<li><code>GroupJoin</code> associe à chaque élément de gauche la <em>collection</em> de ses correspondances à droite (éventuellement vide) : c'est la base de la jointure externe.</li>
<li><strong>Jointure externe gauche</strong> (tous les clients, même sans commande) : la forme classique est <code>GroupJoin</code> + <code>SelectMany</code> + <code>DefaultIfEmpty()</code>. Depuis .NET 10, les opérateurs <code>LeftJoin</code> et <code>RightJoin</code> l'écrivent directement.</li>
</ul>

<h3>Aplatir, combiner et découper</h3>
<table>
<tr><th>Opérateur</th><th>Rôle</th><th>Équivalent JS</th></tr>
<tr><td><code>SelectMany</code></td><td>aplatit une collection de collections (toutes les lignes de toutes les commandes)</td><td><code>flatMap</code></td></tr>
<tr><td><code>Zip</code></td><td>combine deux séquences élément par élément</td><td>—</td></tr>
<tr><td><code>Distinct</code> / <code>DistinctBy</code></td><td>retire les doublons (par valeur / par clé)</td><td><code>new Set()</code></td></tr>
<tr><td><code>MinBy</code> / <code>MaxBy</code></td><td>l'élément qui a la plus petite / plus grande clé</td><td><code>reduce</code></td></tr>
<tr><td><code>Chunk</code></td><td>découpe en paquets de taille fixe</td><td>—</td></tr>
<tr><td><code>Aggregate</code></td><td>réduction générale avec un accumulateur</td><td><code>reduce</code></td></tr>
</table>

<h3>First, Single et leurs variantes</h3>
<table>
<tr><th>Méthode</th><th>0 élément</th><th>1 élément</th><th>plusieurs</th><th>Quand l'utiliser</th></tr>
<tr><td><code>First</code></td><td>exception</td><td>l'élément</td><td>le premier</td><td>il y en a forcément au moins un</td></tr>
<tr><td><code>FirstOrDefault</code></td><td><code>default</code></td><td>l'élément</td><td>le premier</td><td>il peut ne pas y en avoir</td></tr>
<tr><td><code>Single</code></td><td>exception</td><td>l'élément</td><td>exception</td><td>il doit y en avoir exactement un (recherche par clé unique)</td></tr>
<tr><td><code>SingleOrDefault</code></td><td><code>default</code></td><td>l'élément</td><td>exception</td><td>zéro ou un, jamais plus</td></tr>
</table>
<p><code>Single</code> vérifie qu'il n'y a pas de second élément : il parcourt donc plus loin. Son intérêt est de révéler une donnée incohérente (deux clients avec le même e-mail) au lieu de la masquer.</p>
<p>Pour tester l'existence, utilise <code>Any()</code> et non <code>Count() &gt; 0</code> : <code>Any</code> s'arrête au premier élément trouvé, <code>Count()</code> parcourt tout. Sur une <code>List</code>, préfère la propriété <code>Count</code> (gratuite) à la méthode <code>Count()</code>.</p>

<h3>Exécution différée</h3>
<p>Une requête LINQ n'est pas un résultat : c'est une <strong>recette</strong>. <code>var expensive = orders.Where(o =&gt; o.Total &gt; 100);</code> n'exécute rien. Le filtrage a lieu au moment où l'on énumère (<code>foreach</code>, <code>ToList</code>, <code>Count</code>, <code>First</code>…). Conséquences :</p>
<ul>
<li>si la source change entre la définition et l'énumération, le résultat reflète la source <em>au moment de l'énumération</em> ;</li>
<li>chaque énumération <strong>ré-exécute</strong> toute la chaîne : appeler <code>Count()</code> puis faire un <code>foreach</code> calcule deux fois. Avec EF Core, ce sera deux requêtes SQL ;</li>
<li>pour figer un résultat, matérialise-le avec <code>ToList()</code>, <code>ToArray()</code> ou <code>ToDictionary()</code>.</li>
</ul>
<p>Les opérateurs <code>Where</code>, <code>Select</code>, <code>Take</code> sont différés et en streaming ; <code>OrderBy</code> et <code>GroupBy</code> sont différés mais doivent lire toute la source avant de produire le premier élément ; <code>ToList</code>, <code>Sum</code>, <code>Count</code>, <code>First</code> sont immédiats.</p>

<h3>IEnumerable contre IQueryable : la préparation d'EF Core</h3>
<p><code>IEnumerable&lt;T&gt;</code> exécute LINQ <strong>en mémoire</strong>, en C# : ses méthodes prennent des délégués <code>Func&lt;T, bool&gt;</code>, du code compilé. <code>IQueryable&lt;T&gt;</code>, utilisé par EF Core, prend des <code>Expression&lt;Func&lt;T, bool&gt;&gt;</code> : un <strong>arbre d'expressions</strong>, c'est-à-dire une description de la lambda sous forme de données. Le fournisseur (EF Core) analyse cet arbre et le traduit en SQL. C'est pourquoi :</p>
<ul>
<li>tant que tu restes en <code>IQueryable</code>, le filtre part en <code>WHERE</code> côté base ;</li>
<li>un <code>AsEnumerable()</code> ou un <code>ToList()</code> trop tôt rapatrie toute la table puis filtre en mémoire ;</li>
<li>une méthode C# personnalisée dans un <code>Where</code> peut être impossible à traduire en SQL : EF Core lève alors une exception.</li>
</ul>

<h3>Écrire ses propres opérateurs</h3>
<p>Un opérateur LINQ n'est qu'une méthode d'extension sur <code>IEnumerable&lt;T&gt;</code>. Avec <code>yield return</code>, le compilateur génère un itérateur qui produit les éléments à la demande : ton opérateur est automatiquement différé et en streaming, comme les opérateurs standard.</p>

<h3>Les pièges qui reviennent en revue de code</h3>
<ul>
<li><strong>Deux <code>OrderBy</code> à la suite</strong> : <code>.OrderBy(o =&gt; o.Status).OrderBy(o =&gt; o.Date)</code> trie uniquement par date, le premier tri est écrasé. Le tri secondaire s'écrit <code>.OrderBy(o =&gt; o.Status).ThenBy(o =&gt; o.Date)</code> (et <code>ThenByDescending</code>).</li>
<li><strong>Agrégats sur une séquence vide</strong> : <code>Sum()</code> renvoie 0, mais <code>Average()</code>, <code>Min()</code> et <code>Max()</code> sur des nombres non nullables lèvent <code>InvalidOperationException</code>. Projette vers un type nullable (<code>Max(o =&gt; (decimal?)o.Total)</code>) ou teste avec <code>Any()</code> avant.</li>
<li><strong>Effets de bord dans un <code>Select</code></strong> : modifier un objet ou écrire dans la console dans une lambda LINQ est une mauvaise idée, car l'exécution différée rend le moment (et le nombre de fois) imprévisible. LINQ sert à interroger ; pour agir, utilise un <code>foreach</code>.</li>
<li><strong>Requête dans une boucle</strong> : <code>foreach (var c in customers) { var count = orders.Count(o =&gt; o.CustomerId == c.Id); }</code> parcourt toutes les commandes pour chaque client (O(n×m)). Un <code>ToLookup</code> ou un <code>GroupBy</code> préalable ramène à une seule passe. Avec EF Core, c'est le fameux problème N+1 : une requête SQL par client.</li>
<li><strong>Éléments null</strong> : <code>orders.Select(o =&gt; o.Customer.Name)</code> plante si un <code>Customer</code> est null. Filtre avant (<code>Where(o =&gt; o.Customer is not null)</code>) ou utilise <code>?.</code>.</li>
</ul>

<h3>Lisibilité : let, découpage et nommage</h3>
<p>Une chaîne LINQ de quinze opérateurs est difficile à relire et à déboguer. Découpe-la en variables intermédiaires bien nommées (<code>var paidOrders = ...; var revenueByCustomer = ...;</code>) : grâce à l'exécution différée, cela ne coûte rien, la requête n'est toujours exécutée qu'une fois à la fin. En syntaxe requête, <code>let</code> nomme un calcul intermédiaire réutilisé plusieurs fois dans la même requête. Pour déboguer, un <code>ToList()</code> temporaire permet d'inspecter une étape dans le débogueur.</p>

<div class="note">Les deux erreurs LINQ les plus coûteuses en production sont l'énumération multiple d'une requête (le même calcul ou la même requête SQL exécuté plusieurs fois) et la matérialisation prématurée (un <code>ToList()</code> avant le <code>Where</code> sur un <code>IQueryable</code>, qui charge une table entière en mémoire). Quand une méthode reçoit un <code>IEnumerable&lt;T&gt;</code> et doit le parcourir plusieurs fois, matérialise-le une fois au début, ou demande directement un <code>IReadOnlyList&lt;T&gt;</code>.</div>
`,
  examples: [
    {
      title: "Jeu de données et regroupements (GroupBy, ToLookup)",
      code: `List<Customer> customers =
[
    new(1, "Ana", "Paris"),
    new(2, "Bob", "Lyon"),
    new(3, "Chloé", "Paris"),
    new(4, "David", "Nantes")
];

List<Order> orders =
[
    new(100, 1, "Paid", 120m),
    new(101, 1, "Paid", 80m),
    new(102, 2, "Cancelled", 45m),
    new(103, 3, "Paid", 300m),
    new(104, 3, "Draft", 15m)
];

// Total payé par client (syntaxe méthode)
var totals = orders
    .Where(o => o.Status == "Paid")
    .GroupBy(o => o.CustomerId)
    .Select(g => new { CustomerId = g.Key, Count = g.Count(), Total = g.Sum(o => o.Total) })
    .OrderByDescending(x => x.Total);

foreach (var t in totals)
    Console.WriteLine($"Client {t.CustomerId} : {t.Count} commande(s), {t.Total} €");

// Même regroupement en syntaxe requête
var byCity = from c in customers
             group c by c.City into g
             orderby g.Key
             select new { City = g.Key, Names = string.Join(", ", g.Select(c => c.Name)) };

foreach (var city in byCity)
    Console.WriteLine($"{city.City} : {city.Names}");

// ToLookup : exécution immédiate, clé absente = séquence vide
ILookup<int, Order> ordersByCustomer = orders.ToLookup(o => o.CustomerId);
Console.WriteLine(ordersByCustomer[3].Count());   // 2
Console.WriteLine(ordersByCustomer[4].Count());   // 0, pas d'exception

record Customer(int Id, string Name, string City);
record Order(int Id, int CustomerId, string Status, decimal Total);`,
      explain: "Les types anonymes (<code>new { ... }</code>) sont pratiques pour des résultats intermédiaires locaux. Pour un résultat qui sort de la méthode, crée un record."
    },
    {
      title: "Jointures : interne, groupée et externe gauche",
      code: `List<Customer> customers = [new(1, "Ana"), new(2, "Bob"), new(3, "Chloé")];
List<Order> orders = [new(100, 1, 120m), new(101, 1, 80m), new(102, 3, 300m)];

// Join : jointure interne (Bob disparaît : il n'a pas de commande)
var inner = customers.Join(orders,
    c => c.Id, o => o.CustomerId,
    (c, o) => $"{c.Name} -> commande {o.Id}");
Console.WriteLine(string.Join(" | ", inner));

// GroupJoin : chaque client avec la liste de ses commandes
var grouped = customers.GroupJoin(orders,
    c => c.Id, o => o.CustomerId,
    (c, os) => new { c.Name, Count = os.Count(), Total = os.Sum(o => o.Total) });
foreach (var g in grouped)
    Console.WriteLine($"{g.Name} : {g.Count} commande(s), {g.Total} €");

// Jointure externe gauche, forme classique (syntaxe requête)
var left = from c in customers
           join o in orders on c.Id equals o.CustomerId into os
           from o in os.DefaultIfEmpty()
           select $"{c.Name} : {(o is null ? "aucune commande" : $"commande {o.Id}")}";
Console.WriteLine(string.Join(" | ", left));

// Depuis .NET 10 : opérateur LeftJoin dédié
var left10 = customers.LeftJoin(orders,
    c => c.Id, o => o.CustomerId,
    (c, o) => $"{c.Name}:{o?.Id.ToString() ?? "-"}");
Console.WriteLine(string.Join(" | ", left10));

record Customer(int Id, string Name);
record Order(int Id, int CustomerId, decimal Total);`,
      explain: "Dans la jointure gauche, <code>o</code> vaut <code>null</code> pour les clients sans commande : n'oublie pas de le tester."
    },
    {
      title: "SelectMany, Zip, DistinctBy, MinBy, Chunk, Aggregate",
      code: `List<Order> orders =
[
    new(100, [new("Clavier", 1, 49.90m), new("Souris", 2, 19.90m)]),
    new(101, [new("Écran", 1, 199m), new("Souris", 1, 19.90m)])
];

// SelectMany : toutes les lignes de toutes les commandes
var allLines = orders.SelectMany(o => o.Lines).ToList();
Console.WriteLine($"{allLines.Count} lignes au total");

// DistinctBy : un exemplaire par produit
var distinctProducts = allLines.DistinctBy(l => l.Product).Select(l => l.Product);
Console.WriteLine(string.Join(", ", distinctProducts));

// MinBy / MaxBy : l'élément, pas seulement la valeur
OrderLine biggest = allLines.MaxBy(l => l.Quantity * l.UnitPrice)!;
Console.WriteLine($"Plus grosse ligne : {biggest.Product}");

// Zip : associer deux séquences
string[] days = ["lun", "mar", "mer"];
int[] sales = [12, 30, 7];
foreach (var (day, count) in days.Zip(sales))
    Console.WriteLine($"{day} : {count}");

// Chunk : paquets de 2
foreach (int[] batch in Enumerable.Range(1, 5).Chunk(2))
    Console.WriteLine($"[{string.Join(", ", batch)}]");   // [1, 2] [3, 4] [5]

// Aggregate : réduction avec accumulateur (ici le produit)
long factorial = Enumerable.Range(1, 10).Aggregate(1L, (acc, n) => acc * n);
Console.WriteLine(factorial);   // 3628800

record OrderLine(string Product, int Quantity, decimal UnitPrice);
record Order(int Id, List<OrderLine> Lines);`,
      explain: "<code>SelectMany</code> est l'opérateur à retenir : il sert partout où il y a une relation un-à-plusieurs (commandes et lignes, utilisateurs et rôles)."
    },
    {
      title: "Exécution différée et énumération multiple",
      code: `List<int> numbers = [1, 2, 3];
int evaluations = 0;

// Rien n'est exécuté ici : on définit une recette
IEnumerable<int> query = numbers.Where(n =>
{
    evaluations++;
    return n > 1;
});

numbers.Add(4);   // la requête verra cet élément

Console.WriteLine(query.Count());              // 3 : 2, 3, 4
Console.WriteLine($"Évaluations : {evaluations}"); // 4

foreach (int n in query) { }                    // ré-exécute tout
Console.WriteLine($"Évaluations : {evaluations}"); // 8

// Matérialiser une seule fois
List<int> snapshot = query.ToList();
Console.WriteLine($"Évaluations : {evaluations}"); // 12
Console.WriteLine(snapshot.Count);
Console.WriteLine(snapshot.Count);              // plus aucune évaluation
Console.WriteLine($"Évaluations : {evaluations}"); // 12

// Any() s'arrête au premier élément, Count() parcourt tout
var big = Enumerable.Range(1, 10_000_000);
Console.WriteLine(big.Any(n => n > 5));         // instantané
Console.WriteLine(big.Count(n => n > 5) > 0);   // parcourt 10 millions d'éléments`,
      explain: "Remplace mentalement le compteur par une requête SQL : avec EF Core, chaque énumération d'un <code>IQueryable</code> est un aller-retour vers la base."
    },
    {
      title: "Opérateurs maison avec yield, et Func contre Expression",
      code: `using System.Linq.Expressions;

var products = new[] { "Clavier", "Souris", "Écran", "Webcam" };

bool onlyLong = true;
var result = products
    .WhereIf(onlyLong, p => p.Length > 5)   // filtre conditionnel
    .Batch(2);                              // paquets de 2

foreach (var batch in result)
    Console.WriteLine(string.Join(" + ", batch));

// Func : du code compilé, exécutable mais opaque
Func<int, bool> isAdult = age => age >= 18;
Console.WriteLine(isAdult(20));

// Expression : une description de la lambda, qu'EF Core sait traduire en SQL
Expression<Func<int, bool>> isAdultExpr = age => age >= 18;
Console.WriteLine(isAdultExpr.Body);          // (age >= 18)
Console.WriteLine(isAdultExpr.Body.NodeType); // GreaterThanOrEqual
Console.WriteLine(isAdultExpr.Compile()(16)); // False

public static class MyLinqExtensions
{
    // Applique le filtre seulement si la condition est vraie (pratique pour les filtres de recherche)
    public static IEnumerable<T> WhereIf<T>(this IEnumerable<T> source, bool condition, Func<T, bool> predicate) =>
        condition ? source.Where(predicate) : source;

    // Équivalent maison de Chunk, différé grâce à yield
    public static IEnumerable<IReadOnlyList<T>> Batch<T>(this IEnumerable<T> source, int size)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(size, 1);
        var bucket = new List<T>(size);
        foreach (T item in source)
        {
            bucket.Add(item);
            if (bucket.Count == size)
            {
                yield return bucket;
                bucket = new List<T>(size);
            }
        }
        if (bucket.Count > 0) yield return bucket;
    }
}`,
      explain: "La même lambda <code>age =&gt; age &gt;= 18</code> devient soit du code (<code>Func</code>), soit des données (<code>Expression</code>) selon le type de la variable. C'est le mécanisme qui permet à EF Core de générer du SQL."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Chiffre d'affaires par statut",
      prompt: "<p>À partir d'une liste de commandes <code>record Order(int Id, string Status, decimal Total)</code>, affiche pour chaque statut le nombre de commandes, le total et le panier moyen (arrondi à 2 décimales), triés par total décroissant. Écris la requête en syntaxe méthode, puis en syntaxe requête.</p>",
      hint: "<p><code>GroupBy(o =&gt; o.Status)</code>, puis <code>Count()</code>, <code>Sum</code> et <code>Average</code> sur chaque groupe. <code>Math.Round(x, 2)</code> pour l'arrondi.</p>",
      solution: `List<Order> orders =
[
    new(1, "Paid", 120m), new(2, "Paid", 80m), new(3, "Cancelled", 45m),
    new(4, "Draft", 15m), new(5, "Paid", 300m), new(6, "Draft", 20m)
];

// Syntaxe méthode
var stats = orders
    .GroupBy(o => o.Status)
    .Select(g => new
    {
        Status = g.Key,
        Count = g.Count(),
        Total = g.Sum(o => o.Total),
        Average = Math.Round(g.Average(o => o.Total), 2)
    })
    .OrderByDescending(s => s.Total);

foreach (var s in stats)
    Console.WriteLine($"{s.Status,-10} {s.Count} cmd  {s.Total,8} €  moy. {s.Average} €");

// Syntaxe requête
var stats2 = from o in orders
             group o by o.Status into g
             let total = g.Sum(o => o.Total)
             orderby total descending
             select new { Status = g.Key, Count = g.Count(), Total = total, Average = Math.Round(g.Average(o => o.Total), 2) };

Console.WriteLine(stats2.Count());

record Order(int Id, string Status, decimal Total);`
    },
    {
      level: "moyen",
      title: "Rapport clients avec jointure gauche",
      prompt: "<p>Avec des clients et des commandes, produis un rapport qui liste <strong>tous</strong> les clients (même ceux sans commande) avec leur nombre de commandes, leur total et la date de leur dernière commande (ou « jamais »). Affiche ensuite séparément la liste des clients qui n'ont jamais commandé, en une seule requête LINQ.</p>",
      hint: "<p><code>GroupJoin</code> donne directement, pour chaque client, la collection (éventuellement vide) de ses commandes. Pour la dernière date, utilise <code>Max</code> sur une séquence de <code>DateOnly?</code> : <code>os.Select(o =&gt; (DateOnly?)o.Date).Max()</code> renvoie <code>null</code> si la séquence est vide.</p>",
      solution: `List<Customer> customers = [new(1, "Ana"), new(2, "Bob"), new(3, "Chloé")];
List<Order> orders =
[
    new(100, 1, new DateOnly(2026, 9, 1), 120m),
    new(101, 1, new DateOnly(2026, 10, 15), 80m),
    new(102, 3, new DateOnly(2026, 10, 2), 300m)
];

var report = customers
    .GroupJoin(orders, c => c.Id, o => o.CustomerId, (c, os) => new
    {
        c.Name,
        Count = os.Count(),
        Total = os.Sum(o => o.Total),
        LastOrder = os.Select(o => (DateOnly?)o.Date).Max()
    })
    .OrderByDescending(r => r.Total)
    .ToList();   // matérialisé une fois, réutilisé deux fois

foreach (var r in report)
    Console.WriteLine($"{r.Name,-6} {r.Count} cmd  {r.Total,6} €  dernière : {r.LastOrder?.ToString("dd/MM/yyyy") ?? "jamais"}");

var neverOrdered = report.Where(r => r.Count == 0).Select(r => r.Name);
Console.WriteLine($"Jamais commandé : {string.Join(", ", neverOrdered)}"); // Bob

record Customer(int Id, string Name);
record Order(int Id, int CustomerId, DateOnly Date, decimal Total);`
    },
    {
      level: "difficile",
      title: "Opérateurs SlidingWindow et RunningTotal",
      prompt: "<p>Écris deux méthodes d'extension différées avec <code>yield return</code> :</p><ul><li><code>SlidingWindow&lt;T&gt;(int size)</code> qui produit toutes les fenêtres glissantes de taille <code>size</code> (pour 1,2,3,4 et size=2 : [1,2] [2,3] [3,4]) ;</li><li><code>RunningTotal()</code> sur <code>IEnumerable&lt;decimal&gt;</code> qui produit le cumul progressif.</li></ul><p>Utilise-les pour calculer la moyenne mobile sur 3 jours d'une série de ventes. Démontre ensuite que tes opérateurs sont bien différés : la source ne doit pas être lue tant qu'on n'énumère pas.</p>",
      hint: "<p>Pour la fenêtre, une <code>Queue&lt;T&gt;</code> : on enfile, on défile quand elle dépasse <code>size</code>, on produit une copie (<code>ToArray()</code>) dès qu'elle est pleine. Attention : la validation des arguments dans une méthode <code>yield</code> est elle aussi différée ; pour qu'elle soit immédiate, sépare la méthode publique (qui valide) d'une fonction locale itératrice.</p>",
      solution: `decimal[] sales = [100m, 120m, 90m, 150m, 130m];

var movingAverage = sales.SlidingWindow(3).Select(w => Math.Round(w.Average(), 2));
Console.WriteLine(string.Join(" ; ", movingAverage));   // 103,33 ; 120 ; 123,33

Console.WriteLine(string.Join(" ; ", sales.RunningTotal())); // 100 ; 220 ; 310 ; 460 ; 590

// Preuve de l'exécution différée
int reads = 0;
IEnumerable<decimal> Source()
{
    foreach (var s in sales) { reads++; yield return s; }
}
var lazy = Source().SlidingWindow(2);
Console.WriteLine($"Lectures avant énumération : {reads}");   // 0
var first = lazy.First();
Console.WriteLine($"Lectures après First() : {reads}");       // 2

// La validation est immédiate grâce à la fonction locale
try { sales.SlidingWindow(0); }
catch (ArgumentOutOfRangeException) { Console.WriteLine("size invalide détecté tout de suite"); }

public static class WindowExtensions
{
    public static IEnumerable<T[]> SlidingWindow<T>(this IEnumerable<T> source, int size)
    {
        ArgumentNullException.ThrowIfNull(source);
        ArgumentOutOfRangeException.ThrowIfLessThan(size, 1);
        return Iterate();

        IEnumerable<T[]> Iterate()
        {
            var window = new Queue<T>(size);
            foreach (T item in source)
            {
                window.Enqueue(item);
                if (window.Count > size) window.Dequeue();
                if (window.Count == size) yield return window.ToArray();
            }
        }
    }

    public static IEnumerable<decimal> RunningTotal(this IEnumerable<decimal> source)
    {
        decimal total = 0;
        foreach (decimal value in source)
        {
            total += value;
            yield return total;
        }
    }
}`
    }
  ],
  project: `
<p><strong>OrderFlow : les rapports.</strong> Crée dans <code>OrderFlow.Domain</code> une classe statique <code>OrderReports</code> qui prend des <code>IReadOnlyList</code> de clients, produits et commandes et expose :</p>
<ol>
<li><code>RevenueByCustomer()</code> : chiffre d'affaires des commandes payées par client, <strong>y compris</strong> les clients à 0 € (jointure gauche), trié par montant décroissant, dans un record <code>CustomerRevenue(string CustomerName, int OrderCount, decimal Revenue)</code>.</li>
<li><code>TopProducts(int count)</code> : les produits les plus vendus en quantité, via <code>SelectMany</code> sur les lignes, avec le montant total vendu.</li>
<li><code>RevenueByMonth()</code> : CA par mois (clé composite année + mois), trié chronologiquement.</li>
<li><code>OrdersWithoutLines()</code> : une détection d'anomalie avec <code>Any</code>.</li>
</ol>
<p>Ajoute une date de création à <code>Order</code>, génère une cinquantaine de commandes de test dans la console et affiche les quatre rapports. Vérifie que chaque rapport ne parcourt les données qu'une fois (pas d'énumération multiple).</p>
`,
  resources: [
    { label: "LINQ : vue d'ensemble", url: "https://learn.microsoft.com/dotnet/csharp/linq/" },
    { label: "Opérations de jointure (LINQ)", url: "https://learn.microsoft.com/dotnet/csharp/linq/standard-query-operators/join-operations" },
    { label: "Regroupement de données (LINQ)", url: "https://learn.microsoft.com/dotnet/csharp/linq/standard-query-operators/grouping-data" },
    { label: "Arbres d'expressions", url: "https://learn.microsoft.com/dotnet/csharp/advanced-topics/expression-trees/" }
  ]
});

/* ============================================================
   Jour 16 — Fichiers, flux et JSON
   ============================================================ */
window.COURSE.push({
  key: "f-files-json",
  title: "Fichiers, flux et JSON",
  summary: "Lire et écrire des fichiers proprement, en streaming, et maîtriser System.Text.Json.",
  objectives: [
    "Manipuler fichiers, dossiers et chemins avec File, Directory, Path et FileInfo",
    "Choisir entre lecture complète et lecture en streaming",
    "Utiliser StreamReader/StreamWriter avec using et gérer les encodages",
    "Lire et écrire un CSV simple et connaître ses limites",
    "Maîtriser System.Text.Json : options, attributs, enums, records, JsonNode",
    "Gérer les exceptions d'entrée/sortie et utiliser les API asynchrones"
  ],
  lesson: `
<h3>Les classes de System.IO</h3>
<table>
<tr><th>Classe</th><th>Rôle</th><th>Exemples</th></tr>
<tr><td><code>File</code></td><td>méthodes statiques sur un fichier</td><td><code>Exists</code>, <code>ReadAllText</code>, <code>WriteAllLines</code>, <code>Copy</code>, <code>Delete</code></td></tr>
<tr><td><code>Directory</code></td><td>méthodes statiques sur un dossier</td><td><code>CreateDirectory</code>, <code>EnumerateFiles</code>, <code>Exists</code></td></tr>
<tr><td><code>Path</code></td><td>manipulation de chemins (sans toucher au disque)</td><td><code>Combine</code>, <code>GetExtension</code>, <code>GetFileNameWithoutExtension</code>, <code>GetTempPath</code></td></tr>
<tr><td><code>FileInfo</code> / <code>DirectoryInfo</code></td><td>objet qui représente un fichier/dossier</td><td><code>Length</code>, <code>LastWriteTime</code>, <code>Extension</code></td></tr>
</table>
<p><strong>Ne concatène jamais des chemins à la main</strong> avec <code>+ "/" +</code> : utilise <code>Path.Combine("data", "exports", "orders.json")</code>, qui met le bon séparateur selon le système (Windows ou Linux, important si ton API tourne dans un conteneur Docker Linux). <code>Directory.CreateDirectory</code> ne plante pas si le dossier existe déjà : appelle-le sans tester avant.</p>

<h3>Lire tout d'un coup ou en streaming</h3>
<ul>
<li><code>File.ReadAllText</code> et <code>File.ReadAllLines</code> chargent tout le fichier en mémoire. Parfait pour un fichier de configuration de quelques Ko.</li>
<li><code>File.ReadLines</code> renvoie un <code>IEnumerable&lt;string&gt;</code> <strong>différé</strong> : les lignes sont lues une par une pendant l'énumération. On peut traiter un journal de 5 Go avec une mémoire constante, et l'enchaîner avec LINQ (<code>File.ReadLines(path).Where(...).Take(10)</code> s'arrête après 10 résultats).</li>
<li>Même logique en écriture : <code>File.WriteAllText</code> pour un petit contenu, un <code>StreamWriter</code> pour écrire au fil de l'eau.</li>
</ul>

<h3>Les flux et using</h3>
<p>Un <code>Stream</code> représente une suite d'octets qu'on lit ou écrit progressivement : fichier (<code>FileStream</code>), mémoire (<code>MemoryStream</code>), réseau, corps d'une requête HTTP. <code>StreamReader</code> et <code>StreamWriter</code> ajoutent la conversion octets ↔ texte. Un flux ouvert garde une ressource du système (un descripteur de fichier) : il faut le fermer, même en cas d'exception. C'est le rôle de <code>using</code> :</p>
<pre><code>using var writer = new StreamWriter(path);
writer.WriteLine("ligne");
// writer.Dispose() est appelé automatiquement à la fin du bloc</code></pre>
<p>Oublier <code>using</code> laisse le fichier verrouillé (sous Windows, impossible de le supprimer) et peut perdre les dernières données encore en mémoire tampon.</p>

<h3>Les encodages</h3>
<p>Un fichier texte n'est qu'une suite d'octets : l'<strong>encodage</strong> dit comment les convertir en caractères. .NET utilise UTF-8 par défaut, ce qui est le bon choix. Les problèmes viennent des fichiers produits par d'autres outils, typiquement un CSV exporté d'Excel sous Windows en Windows-1252 : les accents deviennent des « Ã© ». On précise alors l'encodage à la lecture. Le <strong>BOM</strong> (Byte Order Mark) est une signature de 3 octets en tête de fichier UTF-8 : Excel en a besoin pour reconnaître l'UTF-8 dans un CSV, d'autres outils le refusent.</p>

<h3>CSV : simple en apparence</h3>
<p>Un CSV basique se lit avec <code>line.Split(',')</code>. Mais dès qu'un champ contient une virgule, un guillemet ou un saut de ligne (une adresse, un commentaire), il est entouré de guillemets et le <code>Split</code> casse tout. Pour un format maîtrisé de bout en bout, le <code>Split</code> suffit ; pour des fichiers venant de l'extérieur, utilise une bibliothèque comme CsvHelper. Pense aussi au séparateur : en France, Excel utilise le point-virgule et la virgule comme séparateur décimal. Formate les nombres avec <code>CultureInfo.InvariantCulture</code> pour éviter les surprises.</p>

<h3>System.Text.Json</h3>
<p><code>System.Text.Json</code> est le sérialiseur intégré à .NET, celui qu'ASP.NET Core utilise pour tes API. Deux méthodes principales : <code>JsonSerializer.Serialize(obj)</code> et <code>JsonSerializer.Deserialize&lt;T&gt;(json)</code>.</p>
<table>
<tr><th>Besoin</th><th>Solution</th></tr>
<tr><td>Noms en camelCase</td><td><code>PropertyNamingPolicy = JsonNamingPolicy.CamelCase</code>, ou <code>new JsonSerializerOptions(JsonSerializerDefaults.Web)</code></td></tr>
<tr><td>JSON indenté lisible</td><td><code>WriteIndented = true</code></td></tr>
<tr><td>Renommer une propriété</td><td><code>[JsonPropertyName("order_id")]</code></td></tr>
<tr><td>Exclure une propriété</td><td><code>[JsonIgnore]</code></td></tr>
<tr><td>Enum en texte plutôt qu'en nombre</td><td><code>JsonStringEnumConverter</code> dans <code>Converters</code></td></tr>
<tr><td>Ignorer les valeurs nulles</td><td><code>DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull</code></td></tr>
<tr><td>Nom insensible à la casse en lecture</td><td><code>PropertyNameCaseInsensitive = true</code> (inclus dans les defaults Web)</td></tr>
</table>
<p>Les <code>record</code> se sérialisent et se désérialisent directement, via leur constructeur. <code>Deserialize</code> renvoie un <code>T?</code> : le JSON <code>null</code> donne <code>null</code>. Un JSON invalide lève <code>JsonException</code>.</p>
<p><strong>Différence avec JavaScript :</strong> <code>JSON.parse</code> accepte tout et renvoie un objet sans type. Ici, tu désérialises vers un type précis ; les propriétés inconnues sont ignorées par défaut et les propriétés absentes gardent leur valeur par défaut. Les champs <code>required</code> d'un type sont vérifiés et provoquent une erreur s'ils manquent.</p>
<p><strong>Source generation (aperçu) :</strong> par défaut, le sérialiseur découvre tes types par réflexion à l'exécution. Avec une classe <code>partial</code> dérivée de <code>JsonSerializerContext</code> et l'attribut <code>[JsonSerializable(typeof(Order))]</code>, le code de sérialisation est généré à la compilation : démarrage plus rapide et compatibilité Native AOT.</p>

<h3>JSON sans type : JsonNode et JsonDocument</h3>
<p>Quand tu ne connais pas la structure à l'avance (réponse d'une API tierce, configuration libre), <code>JsonNode.Parse</code> donne un arbre modifiable qu'on navigue comme en JavaScript : <code>node["customer"]?["email"]?.GetValue&lt;string&gt;()</code>. <code>JsonDocument</code> est la version en lecture seule, plus économe en mémoire ; il doit être disposé (<code>using</code>).</p>

<h3>Exceptions et asynchrone</h3>
<p>Les opérations sur fichiers échouent pour des raisons hors de ton contrôle : <code>FileNotFoundException</code>, <code>DirectoryNotFoundException</code>, <code>UnauthorizedAccessException</code> (droits), <code>IOException</code> (fichier verrouillé par un autre processus, disque plein). Tester <code>File.Exists</code> avant de lire ne suffit pas : le fichier peut disparaître entre le test et la lecture. Le bon réflexe est d'attraper l'exception précise là où tu sais quoi en faire. Toutes les méthodes ont une version asynchrone (<code>ReadAllTextAsync</code>, <code>WriteAllTextAsync</code>, <code>JsonSerializer.SerializeAsync</code> sur un flux) : dans une API web, utilise-les pour ne pas bloquer un thread pendant les I/O.</p>

<h3>Lire sa configuration JSON à la main</h3>
<p>Une application a presque toujours un fichier de configuration. Avant de découvrir <code>IConfiguration</code> et <code>appsettings.json</code> avec ASP.NET Core, il est instructif de le faire soi-même : on définit un record qui décrit la configuration (<code>record AppSettings(string ConnectionString, int MaxLinesPerOrder, string[] Features)</code>), on le désérialise au démarrage, et on <strong>valide</strong> immédiatement les valeurs obligatoires. Une configuration invalide doit faire échouer l'application au démarrage avec un message clair, plutôt que de provoquer une erreur obscure trois heures plus tard au premier usage. C'est exactement ce que feront les <em>Options</em> d'ASP.NET Core avec <code>ValidateOnStart()</code>.</p>

<h3>Écrire sans corrompre le fichier</h3>
<p>Si le programme plante au milieu d'un <code>File.WriteAllText</code>, le fichier peut rester à moitié écrit : la configuration ou les données précédentes sont perdues. La technique classique consiste à écrire dans un fichier temporaire du même dossier, puis à le renommer : <code>File.Move(tempPath, finalPath, overwrite: true)</code>. Sur un même disque, le renommage est quasi atomique : on a soit l'ancien fichier, soit le nouveau, jamais un mélange.</p>

<h3>Sécurité : le chemin vient-il de l'utilisateur ?</h3>
<p>Dans une API, il est tentant d'écrire <code>Path.Combine(uploadsDir, request.FileName)</code>. Si le nom envoyé est <code>../../appsettings.json</code>, tu lis ou écrases un fichier hors du dossier prévu : c'est une attaque par <em>path traversal</em>. Ne fais jamais confiance à un nom de fichier fourni par un client : garde seulement <code>Path.GetFileName(nom)</code>, ou mieux, génère toi-même le nom (un <code>Guid</code>) et stocke le nom d'origine à part. Vérifie aussi que le chemin final obtenu avec <code>Path.GetFullPath</code> commence bien par le dossier autorisé.</p>

<div class="note">Crée tes <code>JsonSerializerOptions</code> une fois et réutilise-les (champ <code>static readonly</code>) : le sérialiseur met en cache des métadonnées par instance d'options, et en créer une nouvelle à chaque appel est une fuite de performance classique. Pour de gros volumes, sérialise directement dans un flux (<code>SerializeAsync(stream, data)</code>) plutôt que de construire une énorme chaîne en mémoire.</div>
`,
  examples: [
    {
      title: "Chemins, dossiers et informations de fichier",
      code: `// Un dossier de travail dans le répertoire temporaire du système
string root = Path.Combine(Path.GetTempPath(), "orderflow-demo");
string exports = Path.Combine(root, "exports");
Directory.CreateDirectory(exports);   // pas d'erreur si le dossier existe

string file = Path.Combine(exports, "commandes-2026-11.csv");
File.WriteAllText(file, "Id,Total" + Environment.NewLine + "1,120.50");

Console.WriteLine(Path.GetFileName(file));                  // commandes-2026-11.csv
Console.WriteLine(Path.GetFileNameWithoutExtension(file));  // commandes-2026-11
Console.WriteLine(Path.GetExtension(file));                 // .csv

var info = new FileInfo(file);
Console.WriteLine($"{info.Length} octets, modifié le {info.LastWriteTime:g}");

// Lister les fichiers CSV du dossier
foreach (string csv in Directory.EnumerateFiles(exports, "*.csv"))
    Console.WriteLine($"Trouvé : {Path.GetFileName(csv)}");

// Copier puis supprimer
string backup = Path.ChangeExtension(file, ".bak");
File.Copy(file, backup, overwrite: true);
File.Delete(backup);
Console.WriteLine(File.Exists(backup)); // False`,
      explain: "<code>Path.GetTempPath()</code> fonctionne sous Windows comme sous Linux. <code>Path.Combine</code> choisit le bon séparateur."
    },
    {
      title: "Lecture en streaming et écriture avec StreamWriter",
      code: `using System.Text;

string path = Path.Combine(Path.GetTempPath(), "app.log");

// Écriture progressive : using garantit la fermeture du fichier
using (var writer = new StreamWriter(path, append: false, Encoding.UTF8))
{
    for (int i = 1; i <= 10_000; i++)
    {
        string level = i % 100 == 0 ? "ERROR" : i % 10 == 0 ? "WARN" : "INFO";
        writer.WriteLine($"2026-11-04 10:{i % 60:00}:00 {level} Message {i}");
    }
}

// ReadLines : une ligne à la fois en mémoire, combinable avec LINQ
var firstErrors = File.ReadLines(path)
    .Where(line => line.Contains(" ERROR "))
    .Take(3);   // la lecture s'arrête dès qu'on a 3 erreurs

foreach (string line in firstErrors)
    Console.WriteLine(line);

// Comptage par niveau sans charger le fichier
var counts = File.ReadLines(path)
    .GroupBy(line => line.Split(' ')[2])
    .Select(g => $"{g.Key}: {g.Count()}");
Console.WriteLine(string.Join(", ", counts));

// Lecture manuelle avec StreamReader
using var reader = new StreamReader(path);
string? header = reader.ReadLine();
Console.WriteLine($"Première ligne : {header}");`,
      explain: "Le bloc <code>using (...) { }</code> ferme le fichier avant la lecture qui suit. La forme courte <code>using var</code> ferme à la fin de la méthode."
    },
    {
      title: "System.Text.Json : options, attributs, enums et records",
      code: `using System.Text.Json;
using System.Text.Json.Serialization;

var order = new Order(
    Id: 100,
    CustomerEmail: "ana@example.com",
    Status: OrderStatus.Paid,
    Lines: [new OrderLine("Clavier", 1, 49.90m), new OrderLine("Souris", 2, 19.90m)])
{
    InternalNote = "client VIP"
};

string json = JsonSerializer.Serialize(order, JsonConfig.Options);
Console.WriteLine(json);

// Retour en objet typé
Order? back = JsonSerializer.Deserialize<Order>(json, JsonConfig.Options);
Console.WriteLine($"{back!.Lines.Count} lignes, statut {back.Status}, note : {back.InternalNote ?? "(ignorée)"}");

// JSON invalide
try
{
    JsonSerializer.Deserialize<Order>("{ pas du json ", JsonConfig.Options);
}
catch (JsonException ex)
{
    Console.WriteLine($"JSON invalide : {ex.Message}");
}

public enum OrderStatus { Draft, Paid, Shipped }

public record OrderLine(string Product, int Quantity, decimal UnitPrice);

public record Order(
    [property: JsonPropertyName("order_id")] int Id,
    string CustomerEmail,
    OrderStatus Status,
    List<OrderLine> Lines)
{
    // Hors du constructeur : une propriété ignorée ne peut pas être un paramètre de désérialisation
    [JsonIgnore]
    public string? InternalNote { get; init; }
}

public static class JsonConfig
{
    // Créées une seule fois et réutilisées
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter() },
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
}`,
      explain: "Sur un record positionnel, l'attribut doit cibler la propriété générée : <code>[property: JsonPropertyName(...)]</code>. <code>JsonSerializerDefaults.Web</code> active le camelCase et la lecture insensible à la casse, comme ASP.NET Core."
    },
    {
      title: "JsonNode : lire et modifier un JSON sans type",
      code: `using System.Text.Json;
using System.Text.Json.Nodes;

string config = """
{
  "app": { "name": "OrderFlow", "version": "1.4.2" },
  "features": ["export", "coupons"],
  "limits": { "maxLinesPerOrder": 50 }
}
""";

JsonNode root = JsonNode.Parse(config)!;

// Navigation façon JavaScript, avec ?. pour les nœuds absents
string name = root["app"]?["name"]?.GetValue<string>() ?? "inconnu";
int maxLines = root["limits"]?["maxLinesPerOrder"]?.GetValue<int>() ?? 10;
int timeout = root["limits"]?["timeoutSeconds"]?.GetValue<int>() ?? 30; // absent : valeur par défaut
Console.WriteLine($"{name} : {maxLines} lignes max, timeout {timeout}s");

foreach (JsonNode? feature in root["features"]!.AsArray())
    Console.WriteLine($"Fonctionnalité : {feature}");

// Modification de l'arbre puis réécriture
root["limits"]!["timeoutSeconds"] = 60;
root["features"]!.AsArray().Add("invoices");
Console.WriteLine(root.ToJsonString(new JsonSerializerOptions { WriteIndented = true }));

// JsonDocument : lecture seule, à disposer
using JsonDocument doc = JsonDocument.Parse(config);
string version = doc.RootElement.GetProperty("app").GetProperty("version").GetString()!;
Console.WriteLine($"Version : {version}");`,
      explain: "La chaîne brute <code>\"\"\"...\"\"\"</code> (raw string literal) évite d'échapper les guillemets du JSON."
    },
    {
      title: "Asynchrone, flux JSON et gestion des erreurs",
      code: `using System.Text.Json;

string path = Path.Combine(Path.GetTempPath(), "products.json");
List<Product> products = [new(1, "Clavier", 49.90m), new(2, "Souris", 19.90m)];

// Sérialisation directement dans le fichier, sans chaîne intermédiaire
await using (FileStream output = File.Create(path))
{
    await JsonSerializer.SerializeAsync(output, products, Json.Options);
}

var loaded = await LoadProductsAsync(path);
Console.WriteLine($"{loaded.Count} produits chargés");

var none = await LoadProductsAsync(Path.Combine(Path.GetTempPath(), "absent.json"));
Console.WriteLine($"{none.Count} produit chargé depuis un fichier absent");

static async Task<List<Product>> LoadProductsAsync(string path)
{
    try
    {
        await using FileStream input = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<List<Product>>(input, Json.Options) ?? [];
    }
    catch (FileNotFoundException)
    {
        Console.WriteLine($"Fichier absent : {Path.GetFileName(path)}, liste vide");
        return [];
    }
    catch (JsonException ex)
    {
        // Un fichier corrompu ne doit pas être confondu avec un fichier vide
        throw new InvalidDataException($"Le fichier {path} n'est pas un JSON valide", ex);
    }
}

public record Product(int Id, string Name, decimal Price);

public static class Json
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web);
}`,
      explain: "<code>await using</code> dispose le flux de façon asynchrone. On attrape le fichier absent (cas attendu) mais on transforme le JSON corrompu en erreur explicite : l'avaler ferait perdre des données sans prévenir."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Statistiques d'un fichier texte",
      prompt: "<p>Écris un programme qui prend un chemin de fichier et affiche le nombre de lignes, de mots et de caractères, ainsi que la ligne la plus longue. Si le fichier n'existe pas, affiche un message clair au lieu de planter. Le programme doit fonctionner sur un fichier de plusieurs Go sans le charger en mémoire.</p>",
      hint: "<p><code>File.ReadLines</code> pour le streaming, une seule boucle <code>foreach</code> pour tout calculer en une passe, et un <code>catch (FileNotFoundException)</code>.</p>",
      solution: `string path = Path.Combine(Path.GetTempPath(), "demo.txt");
File.WriteAllLines(path, ["Bonjour le monde", "C# et .NET", "Une ligne un peu plus longue que les autres"]);

PrintStats(path);
PrintStats(Path.Combine(Path.GetTempPath(), "nexiste-pas.txt"));

static void PrintStats(string path)
{
    try
    {
        int lines = 0, words = 0;
        long chars = 0;
        string longest = "";

        // Une seule passe, une ligne en mémoire à la fois
        foreach (string line in File.ReadLines(path))
        {
            lines++;
            chars += line.Length;
            words += line.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
            if (line.Length > longest.Length) longest = line;
        }

        Console.WriteLine($"{lines} lignes, {words} mots, {chars} caractères");
        Console.WriteLine($"Ligne la plus longue : {longest}");
    }
    catch (FileNotFoundException)
    {
        Console.WriteLine($"Le fichier {path} est introuvable.");
    }
    catch (UnauthorizedAccessException)
    {
        Console.WriteLine($"Accès refusé au fichier {path}.");
    }
}`
    },
    {
      level: "moyen",
      title: "Convertir un CSV en JSON",
      prompt: "<p>Un fichier <code>products.csv</code> contient un en-tête et des lignes <code>Id;Name;Price;Category</code> (séparateur point-virgule, prix avec un point décimal). Lis-le en records <code>Product</code>, ignore les lignes invalides en affichant leur numéro et la raison, puis écris un fichier <code>products.json</code> indenté en camelCase, regroupé par catégorie : <code>{ \"informatique\": [ ... ], ... }</code>.</p>",
      hint: "<p><code>decimal.TryParse(text, NumberStyles.Number, CultureInfo.InvariantCulture, out var price)</code> évite le piège de la virgule française. <code>Skip(1)</code> saute l'en-tête. Un <code>Dictionary&lt;string, List&lt;Product&gt;&gt;</code> se sérialise en objet JSON.</p>",
      solution: `using System.Globalization;
using System.Text.Json;

string dir = Path.Combine(Path.GetTempPath(), "csv-demo");
Directory.CreateDirectory(dir);
string csvPath = Path.Combine(dir, "products.csv");
File.WriteAllLines(csvPath,
[
    "Id;Name;Price;Category",
    "1;Clavier;49.90;informatique",
    "2;Souris;19.90;informatique",
    "3;Chaise;abc;mobilier",
    "4;Bureau;249;mobilier",
    "5;Lampe"
]);

var products = new List<Product>();
int lineNumber = 0;
foreach (string line in File.ReadLines(csvPath).Skip(1))
{
    lineNumber++;
    string[] parts = line.Split(';');
    if (parts.Length != 4)
    {
        Console.WriteLine($"Ligne {lineNumber + 1} ignorée : {parts.Length} colonnes au lieu de 4");
        continue;
    }
    if (!int.TryParse(parts[0], out int id) ||
        !decimal.TryParse(parts[2], NumberStyles.Number, CultureInfo.InvariantCulture, out decimal price))
    {
        Console.WriteLine($"Ligne {lineNumber + 1} ignorée : identifiant ou prix invalide");
        continue;
    }
    products.Add(new Product(id, parts[1], price, parts[3]));
}

Dictionary<string, List<Product>> byCategory = products
    .GroupBy(p => p.Category)
    .ToDictionary(g => g.Key, g => g.ToList());

var options = new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true };
string jsonPath = Path.Combine(dir, "products.json");
await File.WriteAllTextAsync(jsonPath, JsonSerializer.Serialize(byCategory, options));

Console.WriteLine($"{products.Count} produits exportés dans {jsonPath}");
Console.WriteLine(await File.ReadAllTextAsync(jsonPath));

public record Product(int Id, string Name, decimal Price, string Category);`
    },
    {
      level: "difficile",
      title: "Analyse d'un gros journal en streaming",
      prompt: "<p>Un journal applicatif contient des lignes au format <code>2026-11-04T10:15:00 LEVEL Source Message</code>. Écris une méthode asynchrone <code>AnalyzeAsync(string path)</code> qui, <strong>en une seule passe et en streaming</strong>, calcule le nombre de lignes par niveau, les 3 sources qui produisent le plus d'erreurs, la première et la dernière date, et le nombre de lignes mal formées. Elle écrit le résultat dans un fichier JSON à côté du journal (<code>app.log.summary.json</code>) et le renvoie. Elle doit accepter un <code>CancellationToken</code>.</p>",
      hint: "<p><code>File.ReadLinesAsync(path, token)</code> renvoie un <code>IAsyncEnumerable&lt;string&gt;</code> à parcourir avec <code>await foreach</code>. <code>line.Split(' ', 4)</code> limite le découpage à 4 morceaux. Les compteurs sont des <code>Dictionary</code> ; le tri des sources se fait à la fin, sur le petit dictionnaire.</p>",
      solution: `using System.Globalization;
using System.Text.Json;

string log = Path.Combine(Path.GetTempPath(), "app.log");
var random = new Random(42);
string[] levels = ["INFO", "INFO", "INFO", "WARN", "ERROR"];
string[] sources = ["Api", "Db", "Payment", "Mailer"];
await using (var writer = new StreamWriter(log))
{
    var start = new DateTime(2026, 11, 4, 8, 0, 0);
    for (int i = 0; i < 50_000; i++)
        await writer.WriteLineAsync($"{start.AddSeconds(i):s} {levels[random.Next(5)]} {sources[random.Next(4)]} message {i}");
    await writer.WriteLineAsync("ligne cassée");
}

using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
LogSummary summary = await AnalyzeAsync(log, cts.Token);
Console.WriteLine(JsonSerializer.Serialize(summary, new JsonSerializerOptions { WriteIndented = true }));

static async Task<LogSummary> AnalyzeAsync(string path, CancellationToken token)
{
    var byLevel = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
    var errorsBySource = new Dictionary<string, int>();
    DateTime? first = null, last = null;
    int malformed = 0;

    await foreach (string line in File.ReadLinesAsync(path, token))
    {
        string[] parts = line.Split(' ', 4);
        if (parts.Length < 4 ||
            !DateTime.TryParse(parts[0], CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime date))
        {
            malformed++;
            continue;
        }

        first ??= date;
        last = date;
        byLevel[parts[1]] = byLevel.GetValueOrDefault(parts[1]) + 1;
        if (parts[1] == "ERROR")
            errorsBySource[parts[2]] = errorsBySource.GetValueOrDefault(parts[2]) + 1;
    }

    var summary = new LogSummary(
        byLevel,
        errorsBySource.OrderByDescending(kv => kv.Value).Take(3).Select(kv => kv.Key).ToList(),
        first,
        last,
        malformed);

    string output = path + ".summary.json";
    await using FileStream stream = File.Create(output);
    await JsonSerializer.SerializeAsync(stream, summary, new JsonSerializerOptions(JsonSerializerDefaults.Web) { WriteIndented = true }, token);
    return summary;
}

public record LogSummary(
    Dictionary<string, int> LinesByLevel,
    List<string> TopErrorSources,
    DateTime? FirstEntry,
    DateTime? LastEntry,
    int MalformedLines);`
    }
  ],
  project: `
<p><strong>OrderFlow : export et import des commandes.</strong> Crée dans <code>OrderFlow.ConsoleApp</code> (ou un nouveau projet <code>OrderFlow.Infrastructure</code>) une classe <code>OrderFileStore</code> :</p>
<ol>
<li><code>ExportJsonAsync(IEnumerable&lt;Order&gt; orders, string path)</code> : sérialisation dans un flux, camelCase, statut en texte, options partagées en <code>static readonly</code>.</li>
<li><code>ImportJsonAsync(string path)</code> : renvoie un <code>Result&lt;IReadOnlyList&lt;Order&gt;&gt;</code> (échec explicite si le fichier est corrompu, liste vide si absent). Comme <code>Order</code> a une liste de lignes privée, passe par un DTO <code>OrderFileDto</code> (record) pour la sérialisation et reconstruis l'entité via <code>AddLine</code> : c'est le premier mapping DTO ↔ entité du parcours.</li>
<li><code>ExportCsvAsync</code> : un fichier à plat, une ligne par ligne de commande (<code>OrderId;Date;Customer;Product;Quantity;UnitPrice</code>), nombres en culture invariante, avec BOM UTF-8 pour qu'Excel affiche correctement les accents.</li>
<li>Dans la console : exporte les commandes de test, réimporte le JSON et vérifie que les totaux sont identiques avant et après.</li>
</ol>
<pre><code>public record OrderFileDto(int Id, int CustomerId, DateTime CreatedAt, string Status, List&lt;OrderLineDto&gt; Lines);
public record OrderLineDto(int ProductId, int Quantity, decimal UnitPrice);</code></pre>
`,
  resources: [
    { label: "Entrées/sorties de fichiers et de flux", url: "https://learn.microsoft.com/dotnet/standard/io/" },
    { label: "Sérialisation JSON avec System.Text.Json", url: "https://learn.microsoft.com/dotnet/standard/serialization/system-text-json/overview" },
    { label: "Personnaliser les noms et valeurs de propriétés", url: "https://learn.microsoft.com/dotnet/standard/serialization/system-text-json/customize-properties" },
    { label: "Utiliser JsonNode (DOM JSON)", url: "https://learn.microsoft.com/dotnet/standard/serialization/system-text-json/use-dom" }
  ]
});
