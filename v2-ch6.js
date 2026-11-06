window.COURSE = window.COURSE || [];

// ===================== 6.1 Lire et écrire des fichiers =====================
window.COURSE.push({
  key: "l-files",
  title: "6.1 Lire et écrire des fichiers",
  summary: "Tu sauras créer, lire, compléter et parcourir des fichiers texte et CSV en C#, sans laisser de fichier ouvert et en gérant les erreurs courantes.",
  objectives: [
    "Écrire et lire un fichier avec la classe File",
    "Choisir entre ReadAllLines et ReadLines",
    "Construire des chemins propres avec Path et Directory",
    "Lire et écrire un petit CSV"
  ],
  analogy: `<p>Un fichier, c'est comme un cahier rangé dans une armoire. <code>File.WriteAllText</code>, c'est arracher toutes les pages et réécrire le cahier en entier. <code>File.AppendAllText</code>, c'est écrire à la suite de la dernière page. Et <code>ReadLines</code>, c'est lire le cahier page par page au lieu de tout photocopier d'un coup.</p>`,
  lesson: `
<h3>Le fichier en une ligne : la classe File</h3>
<p>En JavaScript côté navigateur, tu n'as pas accès au disque. En Node.js, tu utilises le module <code>fs</code>. En C#, c'est la classe statique <code>File</code> (dans <code>System.IO</code>, déjà importé par défaut). Elle fait le travail en une seule ligne : elle ouvre le fichier, lit ou écrit, puis le referme toute seule.</p>
<table>
<tr><th>Méthode</th><th>Ce qu'elle fait</th></tr>
<tr><td><code>File.WriteAllText(path, text)</code></td><td>Crée le fichier ou l'écrase complètement</td></tr>
<tr><td><code>File.AppendAllText(path, text)</code></td><td>Ajoute à la fin (crée le fichier s'il n'existe pas)</td></tr>
<tr><td><code>File.ReadAllText(path)</code></td><td>Renvoie tout le contenu en une seule <code>string</code></td></tr>
<tr><td><code>File.WriteAllLines(path, lines)</code></td><td>Écrit un tableau de lignes</td></tr>
<tr><td><code>File.Exists(path)</code></td><td>Renvoie <code>true</code> si le fichier existe</td></tr>
</table>
<p>Par défaut, .NET lit et écrit en <strong>UTF-8</strong> (l'encodage qui gère les accents et les emojis, comme sur le web). Tu peux le préciser avec un dernier paramètre, par exemple <code>Encoding.UTF8</code> (dans <code>System.Text</code>), mais ce n'est presque jamais nécessaire.</p>

<h3>Tout charger ou lire ligne par ligne</h3>
<p><code>File.ReadAllLines</code> renvoie un <code>string[]</code> : tout le fichier est chargé en mémoire d'un coup. <code>File.ReadLines</code> renvoie un <code>IEnumerable&lt;string&gt;</code> : les lignes sont lues une par une, au moment où ta boucle <code>foreach</code> les demande. C'est la même idée que l'exécution différée de LINQ vue au chapitre 5.</p>
<div class="compare">
<div><h4>ReadAllLines</h4><p>Tout le fichier en mémoire. Pratique pour un petit fichier, accès par index (<code>lines[3]</code>). Dangereux pour un fichier de 2 Go.</p></div>
<div><h4>ReadLines</h4><p>Une ligne à la fois. Mémoire constante, même pour un énorme fichier. Compatible avec LINQ (<code>Skip</code>, <code>Where</code>, <code>Take</code>).</p></div>
</div>
<pre class="diagram">
ReadAllLines            ReadLines
+--------------+        +--------+
| ligne 1      |        | ligne 1| -- traitée, oubliée
| ligne 2      |        +--------+
| ligne 3      |        | ligne 2| -- traitée, oubliée
| ...          |        +--------+
| ligne 999999 |        | ...    |
+--------------+        +--------+
tout en mémoire         une ligne en mémoire
</pre>

<h3>Les chemins : Path et Directory</h3>
<p>N'écris jamais un chemin à la main avec des <code>/</code> ou des <code>\\</code> : Windows et Linux n'utilisent pas le même séparateur. <code>Path.Combine("data", "livres.csv")</code> choisit le bon. Un chemin <strong>relatif</strong> (sans lecteur ni racine) part du dossier courant : avec <code>dotnet run</code>, c'est en général le dossier du projet.</p>
<div class="flow"><span>Path.Combine</span><span>Directory.CreateDirectory</span><span>File.WriteAllText</span><span>Directory.GetFiles</span></div>
<p><code>Directory.CreateDirectory</code> crée un dossier (et ses parents) et ne fait rien s'il existe déjà. <code>Directory.GetFiles(folder, "*.csv")</code> liste les fichiers qui correspondent au motif. <code>Path.GetFileName</code> extrait juste le nom du fichier d'un chemin complet.</p>

<h3>StreamWriter et StreamReader : écrire petit à petit</h3>
<p>Quand tu écris beaucoup de lignes une par une, ouvrir et fermer le fichier à chaque ligne serait lent. Un <strong>flux</strong> (stream) garde le fichier ouvert pendant que tu écris. <code>StreamWriter</code> écrit, <code>StreamReader</code> lit. Comme ils tiennent le fichier ouvert, ils sont <code>IDisposable</code> : tu les mets dans un <code>using</code> (vu au chapitre 4) pour que le fichier soit fermé, même en cas d'exception.</p>
<div class="tip">Un fichier ouvert par un <code>StreamWriter</code> est verrouillé. Si tu essaies de le relire avant la fin du bloc <code>using</code>, tu obtiens une <code>IOException</code>. Ferme d'abord, relis ensuite.</div>

<h3>Les erreurs courantes</h3>
<p>Le disque est un monde extérieur : il peut te dire non. Les exceptions à connaître :</p>
<table>
<tr><th>Exception</th><th>Quand</th></tr>
<tr><td><code>FileNotFoundException</code></td><td>Le fichier à lire n'existe pas</td></tr>
<tr><td><code>DirectoryNotFoundException</code></td><td>Le dossier du chemin n'existe pas</td></tr>
<tr><td><code>UnauthorizedAccessException</code></td><td>Pas le droit (dossier système, fichier en lecture seule)</td></tr>
<tr><td><code>IOException</code></td><td>Fichier déjà ouvert par un autre programme</td></tr>
</table>
<p>Vérifier avec <code>File.Exists</code> avant de lire, c'est bien pour un cas normal (« pas encore de sauvegarde »). Mais garde un <code>try/catch</code> : le fichier peut disparaître entre la vérification et la lecture.</p>

<h3>Un CSV tout simple</h3>
<p>Un CSV, c'est du texte : une ligne par enregistrement, des valeurs séparées par un caractère (souvent <code>;</code> en France). Pour lire : <code>line.Split(';')</code>. Pour écrire : <code>string.Join(";", values)</code>. Ça suffit tant que tes valeurs ne contiennent pas elles-mêmes de <code>;</code>. Pour de vrais CSV complexes, on utilise une bibliothèque dédiée.</p>
<p>Enfin, presque toutes ces méthodes ont une version asynchrone (<code>ReadAllTextAsync</code>, <code>WriteAllTextAsync</code>…) : on les verra en 6.4.</p>
`,
  examples: [
    {
      title: "Écrire, ajouter et relire un fichier",
      code: `string path = "notes.txt";

// WriteAllText écrase le fichier s'il existe déjà
File.WriteAllText(path, "Première ligne\\n");
File.AppendAllText(path, "Deuxième ligne\\n");

string content = File.ReadAllText(path);
Console.Write(content);

Console.WriteLine($"notes.txt existe ? {File.Exists(path)}");
Console.WriteLine($"absent.txt existe ? {File.Exists("absent.txt")}");`,
      output: `Première ligne
Deuxième ligne
notes.txt existe ? True
absent.txt existe ? False`,
      steps: [
        "<code>string path = \"notes.txt\";</code> : un chemin relatif, le fichier sera créé dans le dossier courant.",
        "<code>File.WriteAllText(path, …)</code> : crée le fichier (ou l'écrase) et y écrit la première ligne. <code>\\n</code> est le retour à la ligne.",
        "<code>File.AppendAllText(path, …)</code> : ajoute la deuxième ligne à la suite, sans effacer la première.",
        "<code>File.ReadAllText(path)</code> : récupère tout le contenu dans une seule chaîne.",
        "<code>Console.Write(content)</code> : <code>Write</code> et pas <code>WriteLine</code>, car le texte se termine déjà par un retour à la ligne.",
        "<code>File.Exists(…)</code> : renvoie <code>True</code> ou <code>False</code> sans lever d'exception."
      ],
      explain: "Tu peux relancer le programme autant de fois que tu veux : WriteAllText repart de zéro à chaque fois, donc l'affichage reste le même."
    },
    {
      title: "Dossier, StreamWriter et lecture ligne par ligne",
      code: `string folder = Path.Combine("data", "logs");
Directory.CreateDirectory(folder); // ne fait rien s'il existe déjà
string path = Path.Combine(folder, "jour.log");

using (var writer = new StreamWriter(path))
{
    for (int i = 1; i <= 3; i++)
        writer.WriteLine($"Événement {i}");
} // ici le fichier est fermé

foreach (string line in File.ReadLines(path))
    Console.WriteLine($"> {line}");

foreach (string file in Directory.GetFiles(folder, "*.log"))
    Console.WriteLine(Path.GetFileName(file));`,
      output: `> Événement 1
> Événement 2
> Événement 3
jour.log`,
      steps: [
        "<code>Path.Combine(\"data\", \"logs\")</code> : construit <code>data/logs</code> ou <code>data\\logs</code> selon le système.",
        "<code>Directory.CreateDirectory(folder)</code> : crée les deux dossiers d'un coup s'ils n'existent pas.",
        "<code>using (var writer = new StreamWriter(path))</code> : ouvre le fichier en écriture pour toute la durée du bloc.",
        "<code>writer.WriteLine(…)</code> : écrit une ligne dans le fichier ouvert, sans le refermer à chaque fois.",
        "<code>}</code> : fin du bloc <code>using</code>, <code>Dispose</code> est appelé, le fichier est fermé et les données écrites sur le disque.",
        "<code>File.ReadLines(path)</code> : lit les lignes une par une pendant la boucle.",
        "<code>Directory.GetFiles(folder, \"*.log\")</code> puis <code>Path.GetFileName(file)</code> : liste les fichiers .log et n'affiche que leur nom."
      ],
      explain: "Si tu avais lu le fichier à l'intérieur du bloc using, il aurait encore été ouvert par le StreamWriter : ferme toujours avant de relire."
    },
    {
      title: "Un mini CSV et une erreur gérée",
      code: `string[] lines =
[
    "Titre;Auteur;Annee",
    "Dune;Herbert;1965",
    "Fondation;Asimov;1951"
];
File.WriteAllLines("livres.csv", lines);

string newLine = string.Join(";", "Le Hobbit", "Tolkien", "1937");
File.AppendAllLines("livres.csv", [newLine]);

foreach (string line in File.ReadLines("livres.csv").Skip(1))
{
    string[] parts = line.Split(';');
    Console.WriteLine($"{parts[0]} ({parts[2]}) par {parts[1]}");
}

try
{
    File.ReadAllText("introuvable.csv");
}
catch (FileNotFoundException)
{
    Console.WriteLine("Erreur : fichier introuvable");
}`,
      output: `Dune (1965) par Herbert
Fondation (1951) par Asimov
Le Hobbit (1937) par Tolkien
Erreur : fichier introuvable`,
      steps: [
        "<code>string[] lines = [ … ];</code> : un en-tête puis deux livres, valeurs séparées par <code>;</code>.",
        "<code>File.WriteAllLines(\"livres.csv\", lines)</code> : écrit chaque élément du tableau sur sa propre ligne.",
        "<code>string.Join(\";\", …)</code> : assemble les valeurs en une ligne CSV <code>Le Hobbit;Tolkien;1937</code>.",
        "<code>File.AppendAllLines(…, [newLine])</code> : ajoute cette ligne à la fin du fichier.",
        "<code>File.ReadLines(…).Skip(1)</code> : LINQ sur un fichier, on saute la ligne d'en-tête.",
        "<code>line.Split(';')</code> : découpe la ligne en un tableau de 3 cases, lues par index.",
        "<code>catch (FileNotFoundException)</code> : on attrape précisément l'erreur « fichier absent » au lieu de laisser le programme planter."
      ],
      explain: "Split et Join suffisent pour un CSV simple ; dès que les valeurs peuvent contenir le séparateur ou des guillemets, passe à une bibliothèque spécialisée."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Liste de courses",
      prompt: "<p>Écris trois articles de courses dans <code>courses.txt</code> (un par ligne) avec <code>File.WriteAllLines</code>, puis relis le fichier avec <code>File.ReadAllLines</code> et affiche <code>3 articles</code> suivi de chaque article précédé d'un tiret.</p>",
      hint: "<p><code>ReadAllLines</code> renvoie un <code>string[]</code> : sa propriété <code>Length</code> donne le nombre de lignes.</p>",
      solution: `File.WriteAllLines("courses.txt", ["Pain", "Lait", "Pommes"]);

string[] items = File.ReadAllLines("courses.txt");
Console.WriteLine($"{items.Length} articles");
foreach (string item in items)
    Console.WriteLine($"- {item}");`
    },
    {
      level: "moyen",
      title: "Journal horodaté",
      prompt: "<p>Écris une méthode <code>Log(string message)</code> qui ajoute une ligne <code>[INFO] message</code> au fichier <code>logs/app.log</code> (crée le dossier si besoin). Appelle-la trois fois, puis affiche le nombre de lignes du fichier en le lisant avec <code>File.ReadLines</code> et <code>Count()</code>.</p>",
      hint: "<p>Construis le chemin avec <code>Path.Combine</code>, appelle <code>Directory.CreateDirectory</code> dans la méthode et utilise <code>File.AppendAllText</code> avec un <code>Environment.NewLine</code> à la fin.</p>",
      solution: `string logPath = Path.Combine("logs", "app.log");
Directory.CreateDirectory("logs");
File.Delete(logPath); // repart de zéro (aucune erreur si le fichier est absent)

Log("Démarrage");
Log("Chargement du catalogue");
Log("Arrêt");

Console.WriteLine($"{File.ReadLines(logPath).Count()} lignes dans le journal");

void Log(string message)
{
    Directory.CreateDirectory("logs");
    File.AppendAllText(logPath, $"[INFO] {message}{Environment.NewLine}");
}`
    },
    {
      level: "difficile",
      title: "Moyenne depuis un CSV",
      prompt: "<p>Crée un fichier <code>notes.csv</code> avec un en-tête <code>Nom;Note</code> et quatre élèves. Relis-le en ignorant l'en-tête, convertis chaque note avec <code>int.Parse</code> et affiche la meilleure note avec le nom de l'élève, puis la moyenne arrondie à l'entier. Si le fichier n'existe pas, affiche un message au lieu de planter.</p>",
      hint: "<p>Transforme chaque ligne en tuple <code>(string Name, int Score)</code> avec <code>Select</code>, puis utilise <code>MaxBy</code> et <code>Average</code> vus en LINQ.</p>",
      solution: `File.WriteAllLines("notes.csv", ["Nom;Note", "Lina;14", "Hugo;9", "Sami;17", "Emma;12"]);

if (!File.Exists("notes.csv"))
{
    Console.WriteLine("Pas de fichier de notes");
    return;
}

var students = File.ReadLines("notes.csv")
    .Skip(1)
    .Select(line => line.Split(';'))
    .Select(parts => (Name: parts[0], Score: int.Parse(parts[1])))
    .ToList();

var best = students.MaxBy(s => s.Score);
Console.WriteLine($"Meilleure note : {best.Name} avec {best.Score}");
Console.WriteLine($"Moyenne : {Math.Round(students.Average(s => s.Score))}");`
    }
  ],
  quiz: [
    {
      q: "Tu dois analyser un fichier de logs de 3 Go. Quelle méthode choisis-tu ?",
      options: ["<code>File.ReadAllText</code>", "<code>File.ReadLines</code>", "<code>File.ReadAllLines</code>"],
      answer: 1,
      why: "<code>ReadLines</code> lit une ligne à la fois, la mémoire reste faible. <code>ReadAllText</code> et <code>ReadAllLines</code> chargeraient les 3 Go d'un coup en mémoire."
    },
    {
      q: "Que fait <code>File.WriteAllText(\"a.txt\", \"Bonjour\")</code> si <code>a.txt</code> contient déjà du texte ?",
      options: ["Il lève une <code>IOException</code>", "Il ajoute « Bonjour » à la fin", "Il remplace tout le contenu par « Bonjour »"],
      answer: 2,
      why: "<code>WriteAllText</code> écrase le fichier. Pour ajouter à la fin, c'est <code>AppendAllText</code>. Aucune exception n'est levée si le fichier existe."
    },
    {
      q: "Pourquoi utiliser <code>Path.Combine(\"data\", \"livres.csv\")</code> plutôt que <code>\"data\\\\livres.csv\"</code> ?",
      options: ["Pour que le séparateur soit correct sur Windows comme sur Linux", "Parce que les chaînes avec antislash sont interdites en C#", "Pour créer le dossier automatiquement"],
      answer: 0,
      why: "<code>Path.Combine</code> utilise le séparateur du système. Il ne crée aucun dossier : c'est le rôle de <code>Directory.CreateDirectory</code>."
    },
    {
      q: "Pourquoi place-t-on un <code>StreamWriter</code> dans un <code>using</code> ?",
      options: ["Pour qu'il écrive plus vite", "Pour que le fichier soit fermé à coup sûr, même en cas d'exception", "Parce que sinon le code ne compile pas"],
      answer: 1,
      why: "Le <code>using</code> appelle <code>Dispose</code>, qui vide le tampon et ferme le fichier. Sans lui le code compile, mais le fichier peut rester verrouillé ou incomplet."
    }
  ],
  project: "<p>Ajoute à ta Bibliothèque une méthode <code>SaveCatalogCsv(List&lt;Book&gt; books, string path)</code> qui écrit un en-tête <code>Isbn;Title;Author;Year</code> puis une ligne par livre avec <code>string.Join</code>. Écris aussi <code>LoadCatalogCsv(string path)</code> qui relit le fichier avec <code>File.ReadLines(path).Skip(1)</code> et <code>Split(';')</code>, et renvoie une liste vide si le fichier n'existe pas encore.</p>",
  resources: [
    { label: "E/S de fichier et de flux (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/io/" }
  ]
});

// ===================== 6.2 JSON avec System.Text.Json =====================
window.COURSE.push({
  key: "l-json",
  title: "6.2 JSON avec System.Text.Json",
  summary: "Tu sauras transformer tes objets C# en JSON et inversement, régler le format pour Angular, et sauvegarder ou recharger des données dans un fichier JSON.",
  objectives: [
    "Sérialiser et désérialiser un record avec JsonSerializer",
    "Produire du JSON en camelCase lisible par Angular",
    "Contrôler les noms, les champs ignorés et les enums",
    "Gérer un JSON invalide ou vide sans planter"
  ],
  analogy: `<p>Imagine que tu déménages un meuble monté. Tu le démontes et tu le ranges à plat dans un carton avec une notice : c'est la <strong>sérialisation</strong>. À l'arrivée, tu suis la notice pour le remonter : c'est la <strong>désérialisation</strong>. Le JSON, c'est le carton standard que tout le monde sait ouvrir, que ce soit ton API C# ou ton front Angular.</p>`,
  lesson: `
<h3>Le même JSON qu'en JavaScript</h3>
<p>Bonne nouvelle : le JSON ne change pas. C'est exactement le format que tu manipules dans Angular avec <code>HttpClient</code>. Ce qui change, c'est l'outil : en C#, on utilise <code>JsonSerializer</code>, dans l'espace de noms <code>System.Text.Json</code> (inclus dans .NET, rien à installer).</p>
<table>
<tr><th>JavaScript</th><th>C#</th></tr>
<tr><td><code>JSON.stringify(book)</code></td><td><code>JsonSerializer.Serialize(book)</code></td></tr>
<tr><td><code>JSON.parse(text) as Book</code></td><td><code>JsonSerializer.Deserialize&lt;Book&gt;(text)</code></td></tr>
<tr><td><code>JSON.stringify(book, null, 2)</code></td><td><code>WriteIndented = true</code></td></tr>
</table>
<p>Grosse différence avec TypeScript : en TS, <code>as Book</code> ne vérifie rien, c'est juste une promesse faite au compilateur. En C#, <code>Deserialize&lt;Book&gt;</code> construit un vrai objet <code>Book</code> et convertit chaque valeur dans le bon type.</p>
<div class="flow"><span>Objet C#</span><span>Serialize</span><span>Texte JSON</span><span>Deserialize</span><span>Objet C#</span></div>

<h3>Les options : camelCase et indentation</h3>
<p>Par défaut, C# garde le nom des propriétés tel quel : <code>Title</code> devient <code>"Title"</code>. Mais en Angular, tes interfaces utilisent <code>title</code>. On règle ça avec un objet <code>JsonSerializerOptions</code> :</p>
<ul>
<li><code>PropertyNamingPolicy = JsonNamingPolicy.CamelCase</code> : <code>Title</code> devient <code>title</code>.</li>
<li><code>WriteIndented = true</code> : retours à la ligne et indentation, pratique pour un fichier lisible par un humain.</li>
</ul>
<p>Passe les <strong>mêmes options</strong> à <code>Serialize</code> et à <code>Deserialize</code>. Sinon, à la relecture, <code>title</code> ne correspondra pas à <code>Title</code> et ta propriété restera vide. Bonne nouvelle pour plus tard : ASP.NET Core utilise le camelCase par défaut dans ses APIs.</p>
<div class="tip">Crée tes <code>JsonSerializerOptions</code> une seule fois et réutilise-les. Les recréer à chaque appel est inutilement coûteux, car .NET met en cache des informations dans cet objet.</div>

<h3>Personnaliser avec des attributs</h3>
<p>Un <strong>attribut</strong>, c'est une étiquette entre crochets posée sur du code, un peu comme un décorateur <code>@Input()</code> en Angular. <code>System.Text.Json.Serialization</code> en fournit plusieurs :</p>
<table>
<tr><th>Attribut</th><th>Effet</th></tr>
<tr><td><code>[JsonPropertyName("book")]</code></td><td>Force le nom dans le JSON</td></tr>
<tr><td><code>[JsonIgnore]</code></td><td>N'écrit jamais cette propriété (un mot de passe, par exemple)</td></tr>
</table>
<p>Sur un record positionnel, la propriété est générée à partir du paramètre. Il faut donc préciser la cible : <code>[property: JsonIgnore]</code>, sinon l'attribut se pose sur le paramètre et le compilateur refuse.</p>
<p>Pour les enums, .NET écrit par défaut le nombre (<code>0</code>, <code>1</code>…), illisible côté front. Ajoute <code>new JsonStringEnumConverter()</code> dans <code>options.Converters</code> et tu obtiens <code>"Active"</code>.</p>

<h3>Listes et objets imbriqués</h3>
<p>Rien de spécial à faire : une <code>List&lt;Book&gt;</code> devient un tableau JSON, un objet dans un objet devient un objet imbriqué. Le sérialiseur parcourt tout l'arbre.</p>
<pre class="diagram">
Member                  JSON
 +- Name   "Alice"      { "name": "Alice",
 +- Loans  (List)         "loans": [
     +- Loan Dune           { "book": "Dune" },
     +- Loan Fondation      { "book": "Fondation" }
                          ] }
</pre>

<h3>Quand le JSON est mauvais</h3>
<p>Un fichier peut être vide, coupé en deux ou modifié à la main. Deux cas à gérer :</p>
<ul>
<li>Le texte vaut <code>null</code> : <code>Deserialize</code> renvoie <code>null</code>. C'est pour ça que son type de retour est <code>Book?</code>. Le compilateur te force à tester la valeur (nullable activé, chapitre 4).</li>
<li>Le texte n'est pas du JSON valide : <code>Deserialize</code> lève une <code>JsonException</code>. Attrape-la pour afficher un message clair et repartir d'un état vide.</li>
</ul>
<div class="note">En production, un fichier de sauvegarde corrompu ne doit jamais faire planter l'application au démarrage. On attrape <code>JsonException</code>, on journalise l'erreur et on garde une copie du fichier abîmé pour pouvoir l'analyser.</div>

<h3>Sauvegarder et recharger</h3>
<p>Combine la leçon précédente et celle-ci : <code>File.WriteAllText(path, JsonSerializer.Serialize(data, options))</code> pour sauvegarder, <code>JsonSerializer.Deserialize&lt;T&gt;(File.ReadAllText(path), options)</code> pour recharger. Petit détail : par défaut, les caractères accentués sont écrits sous la forme <code>\\u00E9</code> dans le fichier. C'est du JSON parfaitement valide, et la relecture redonne bien « é ».</p>
`,
  examples: [
    {
      title: "Aller-retour d'un record en JSON",
      code: `using System.Text.Json;

var options = new JsonSerializerOptions
{
    WriteIndented = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

var book = new Book("Dune", "Frank Herbert", 1965);
string json = JsonSerializer.Serialize(book, options);
Console.WriteLine(json);

Book? copy = JsonSerializer.Deserialize<Book>(json, options);
Console.WriteLine(copy);
Console.WriteLine(copy == book);

record Book(string Title, string Author, int Year);`,
      output: `{
  "title": "Dune",
  "author": "Frank Herbert",
  "year": 1965
}
Book { Title = Dune, Author = Frank Herbert, Year = 1965 }
True`,
      steps: [
        "<code>using System.Text.Json;</code> : cet espace de noms n'est pas importé par défaut.",
        "<code>new JsonSerializerOptions { … }</code> : JSON indenté et noms en camelCase, comme côté Angular.",
        "<code>JsonSerializer.Serialize(book, options)</code> : transforme le record en texte JSON.",
        "<code>JsonSerializer.Deserialize&lt;Book&gt;(json, options)</code> : reconstruit un <code>Book</code> à partir du texte, avec les mêmes options pour retrouver les noms.",
        "<code>Console.WriteLine(copy)</code> : un record s'affiche joliment grâce à son <code>ToString</code> généré.",
        "<code>copy == book</code> : l'égalité des records compare les valeurs, la copie est donc égale à l'original.",
        "<code>record Book(…)</code> : la déclaration du type, placée en bas du fichier."
      ],
      explain: "Le record est idéal pour le JSON : il est court à écrire, immuable et comparable par valeur."
    },
    {
      title: "Noms personnalisés, champ ignoré, enum et liste",
      code: `using System.Text.Json;
using System.Text.Json.Serialization;

var options = new JsonSerializerOptions
{
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};
options.Converters.Add(new JsonStringEnumConverter());

var member = new Member("Alice", "secret123",
[
    new Loan("Dune", LoanStatus.Active),
    new Loan("Fondation", LoanStatus.Returned)
]);
Console.WriteLine(JsonSerializer.Serialize(member, options));

enum LoanStatus { Active, Returned }

record Loan([property: JsonPropertyName("book")] string BookTitle, LoanStatus Status);

record Member(string Name, [property: JsonIgnore] string Password, List<Loan> Loans);`,
      output: `{"name":"Alice","loans":[{"book":"Dune","status":"Active"},{"book":"Fondation","status":"Returned"}]}`,
      steps: [
        "<code>using System.Text.Json.Serialization;</code> : contient les attributs et <code>JsonStringEnumConverter</code>.",
        "<code>options.Converters.Add(new JsonStringEnumConverter())</code> : les enums s'écrivent en texte au lieu de 0 et 1.",
        "<code>new Member(\"Alice\", \"secret123\", [ … ])</code> : un membre avec une liste de deux emprunts.",
        "<code>Serialize(member, options)</code> : sans <code>WriteIndented</code>, tout tient sur une ligne, comme ce qu'envoie une API.",
        "<code>[property: JsonPropertyName(\"book\")]</code> : <code>BookTitle</code> s'appelle <code>book</code> dans le JSON, l'attribut l'emporte sur le camelCase.",
        "<code>[property: JsonIgnore] string Password</code> : le mot de passe n'apparaît pas du tout dans le résultat.",
        "<code>List&lt;Loan&gt; Loans</code> : la liste devient un tableau JSON d'objets imbriqués."
      ],
      explain: "Le mot clé property: est indispensable sur un record positionnel pour que l'attribut s'applique à la propriété générée."
    },
    {
      title: "Sauvegarder, recharger et survivre à un JSON cassé",
      code: `using System.Text.Json;

var books = new List<Book> { new("Dune", 1965), new("Fondation", 1951) };
File.WriteAllText("catalogue.json", JsonSerializer.Serialize(books));

string text = File.ReadAllText("catalogue.json");
List<Book>? loaded = JsonSerializer.Deserialize<List<Book>>(text);
Console.WriteLine($"Livres chargés : {loaded?.Count ?? 0}");

Book? nothing = JsonSerializer.Deserialize<Book>("null");
Console.WriteLine(nothing is null);

string broken = """{ "Title": "Dune", """;
try
{
    _ = JsonSerializer.Deserialize<Book>(broken);
}
catch (JsonException)
{
    Console.WriteLine("JSON invalide : chargement annulé");
}

record Book(string Title, int Year);`,
      output: `Livres chargés : 2
True
JSON invalide : chargement annulé`,
      steps: [
        "<code>File.WriteAllText(…, JsonSerializer.Serialize(books))</code> : la liste entière est enregistrée en une ligne.",
        "<code>Deserialize&lt;List&lt;Book&gt;&gt;(text)</code> : on précise le type complet attendu, ici une liste de livres.",
        "<code>loaded?.Count ?? 0</code> : si la désérialisation a renvoyé <code>null</code>, on affiche 0 au lieu de planter.",
        "<code>Deserialize&lt;Book&gt;(\"null\")</code> : un JSON qui vaut <code>null</code> donne <code>null</code>, sans exception.",
        "<code>\"\"\"{ \"Title\": \"Dune\", \"\"\"</code> : une chaîne brute (raw string) qui permet d'écrire des guillemets sans les échapper. Le JSON est volontairement incomplet.",
        "<code>catch (JsonException)</code> : le texte invalide lève une <code>JsonException</code>, qu'on transforme en message clair."
      ],
      explain: "Retiens les deux cas : null renvoie null, JSON invalide lève JsonException. Ton code de chargement doit gérer les deux."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un film en JSON",
      prompt: "<p>Déclare un <code>record Movie(string Title, int Year)</code>. Crée un film, sérialise-le en camelCase et indenté, affiche le JSON, puis désérialise-le et affiche le titre.</p>",
      hint: "<p>Utilise les mêmes <code>JsonSerializerOptions</code> pour les deux opérations, et l'opérateur <code>?.</code> car le résultat est nullable.</p>",
      solution: `using System.Text.Json;

var options = new JsonSerializerOptions
{
    WriteIndented = true,
    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
};

string json = JsonSerializer.Serialize(new Movie("Alien", 1979), options);
Console.WriteLine(json);

Movie? movie = JsonSerializer.Deserialize<Movie>(json, options);
Console.WriteLine(movie?.Title);

record Movie(string Title, int Year);`
    },
    {
      level: "moyen",
      title: "Lire la réponse d'une API",
      prompt: "<p>Tu reçois ce JSON (écrit en camelCase par une API) : <code>[{\"name\":\"Lina\",\"role\":\"Admin\"},{\"name\":\"Hugo\",\"role\":\"Reader\"}]</code>. Déclare un enum <code>Role</code> et un record <code>User</code>, désérialise le tableau et affiche chaque utilisateur sous la forme <code>Lina est Admin</code>.</p>",
      hint: "<p>Il faut <code>PropertyNamingPolicy = JsonNamingPolicy.CamelCase</code> pour faire correspondre <code>name</code> et <code>Name</code>, et un <code>JsonStringEnumConverter</code> pour lire <code>\"Admin\"</code>. Écris le JSON dans une chaîne brute <code>\"\"\"…\"\"\"</code>.</p>",
      solution: `using System.Text.Json;
using System.Text.Json.Serialization;

string json = """[{"name":"Lina","role":"Admin"},{"name":"Hugo","role":"Reader"}]""";

var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
options.Converters.Add(new JsonStringEnumConverter());

List<User> users = JsonSerializer.Deserialize<List<User>>(json, options) ?? [];
foreach (User user in users)
    Console.WriteLine($"{user.Name} est {user.Role}");

enum Role { Admin, Reader }

record User(string Name, Role Role);`
    },
    {
      level: "difficile",
      title: "Préférences sauvegardées",
      prompt: "<p>Écris deux méthodes : <code>Save(Settings s)</code> qui écrit <code>settings.json</code> indenté, et <code>Load()</code> qui renvoie les réglages lus, ou des réglages par défaut si le fichier n'existe pas, vaut <code>null</code> ou contient du JSON invalide. Teste : charge (défaut), modifie avec <code>with</code>, sauvegarde, recharge, puis écris un texte invalide dans le fichier et recharge encore.</p>",
      hint: "<p>Dans <code>Load</code>, commence par <code>File.Exists</code>, puis mets <code>Deserialize</code> dans un <code>try/catch (JsonException)</code> et termine par <code>?? Default</code>.</p>",
      solution: `using System.Text.Json;

var options = new JsonSerializerOptions { WriteIndented = true };
var defaults = new Settings("fr", false);
File.Delete("settings.json");

Console.WriteLine(Load());
Save(Load() with { DarkMode = true });
Console.WriteLine(Load());

File.WriteAllText("settings.json", "{ cassé");
Console.WriteLine(Load());

void Save(Settings s) => File.WriteAllText("settings.json", JsonSerializer.Serialize(s, options));

Settings Load()
{
    if (!File.Exists("settings.json")) return defaults;
    try
    {
        return JsonSerializer.Deserialize<Settings>(File.ReadAllText("settings.json"), options) ?? defaults;
    }
    catch (JsonException)
    {
        Console.WriteLine("Fichier corrompu, réglages par défaut");
        return defaults;
    }
}

record Settings(string Language, bool DarkMode);`
    }
  ],
  quiz: [
    {
      q: "Ton front Angular attend <code>{ \"title\": \"Dune\" }</code> mais ton API renvoie <code>{ \"Title\": \"Dune\" }</code>. Que règles-tu ?",
      options: ["<code>WriteIndented = true</code>", "Tu renommes la propriété C# en <code>title</code>", "<code>PropertyNamingPolicy = JsonNamingPolicy.CamelCase</code>"],
      answer: 2,
      why: "La politique camelCase convertit tous les noms automatiquement. Renommer la propriété casserait la convention C# (PascalCase), et <code>WriteIndented</code> ne change que la mise en forme."
    },
    {
      q: "Que se passe-t-il si tu désérialises un texte qui n'est pas du JSON valide ?",
      options: ["Une <code>JsonException</code> est levée", "Le résultat vaut <code>null</code>", "Les propriétés gardent leur valeur par défaut"],
      answer: 0,
      why: "Un JSON mal formé lève une <code>JsonException</code>. On obtient <code>null</code> seulement quand le texte vaut littéralement <code>null</code>."
    },
    {
      q: "Comment empêcher qu'un mot de passe apparaisse dans le JSON d'un record positionnel ?",
      options: ["<code>[JsonIgnore]</code> sur le paramètre", "<code>[property: JsonIgnore]</code> sur le paramètre", "Le déclarer <code>private</code>"],
      answer: 1,
      why: "Sur un record positionnel, il faut cibler la propriété générée avec <code>property:</code>. Sans cible, l'attribut vise le paramètre et ne compile pas, car <code>JsonIgnore</code> ne s'applique pas aux paramètres."
    },
    {
      q: "Sans réglage particulier, comment est écrit <code>LoanStatus.Returned</code> (deuxième valeur de l'enum) ?",
      options: ["<code>\"Returned\"</code>", "<code>\"returned\"</code>", "<code>1</code>"],
      answer: 2,
      why: "Par défaut, un enum est sérialisé par sa valeur numérique. Il faut ajouter <code>JsonStringEnumConverter</code> pour obtenir le texte."
    }
  ],
  project: "<p>Remplace le CSV par du JSON. Crée un record <code>LibraryData(List&lt;Book&gt; Books, List&lt;Loan&gt; Loans)</code> et deux méthodes : <code>SaveLibrary(LibraryData data)</code> écrit <code>library.json</code> (indenté, camelCase, enums en texte) ; <code>LoadLibrary()</code> le relit et renvoie <code>new LibraryData([], [])</code> si le fichier est absent, vaut <code>null</code> ou lève une <code>JsonException</code>. Appelle <code>LoadLibrary</code> au démarrage et <code>SaveLibrary</code> après chaque emprunt.</p>",
  resources: [
    { label: "Sérialisation JSON dans .NET (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/serialization/system-text-json/overview" }
  ]
});

// ===================== 6.3 Pourquoi l'asynchrone ? =====================
window.COURSE.push({
  key: "l-why-async",
  title: "6.3 Pourquoi l'asynchrone ?",
  summary: "Tu comprendras pourquoi on écrit du code asynchrone, ce que signifie « bloquer un thread » et pourquoi c'est grave dans une API web.",
  objectives: [
    "Distinguer une attente d'entrée/sortie d'un calcul CPU",
    "Comprendre ce qu'est un thread bloqué et le pool de threads",
    "Faire le lien entre Task en C# et Promise en JavaScript",
    "Remplacer Thread.Sleep par await Task.Delay"
  ],
  analogy: `<p>Un serveur de restaurant prend ta commande et la porte en cuisine. Version <strong>synchrone</strong> : il reste planté devant la cuisine pendant les 15 minutes de cuisson, et les autres tables attendent. Version <strong>asynchrone</strong> : il laisse le ticket, va prendre d'autres commandes et servir des boissons, puis revient quand le cuisinier sonne « c'est prêt ». Le plat ne cuit pas plus vite, mais le serveur, lui, n'a jamais perdu son temps.</p>`,
  lesson: `
<h3>Attendre sans rien faire, le vrai problème</h3>
<p>Un programme passe énormément de temps à <strong>attendre</strong> : la réponse d'un serveur, la lecture d'un fichier, le résultat d'une requête SQL. On appelle ça des <strong>entrées/sorties</strong> (I/O, pour Input/Output) : le travail est fait ailleurs (sur le réseau, le disque, la base), ton programme ne fait qu'attendre le résultat.</p>
<p>À l'opposé, il y a le <strong>calcul CPU</strong> : trier un million d'éléments, redimensionner une image, calculer un hash. Là, le processeur travaille vraiment, il n'attend personne.</p>
<table>
<tr><th>Type de travail</th><th>Exemples</th><th>Qui travaille ?</th></tr>
<tr><td>I/O</td><td>Appel HTTP, lecture de fichier, requête SQL</td><td>Le réseau, le disque, la base de données</td></tr>
<tr><td>CPU</td><td>Calcul, tri, compression, traitement d'image</td><td>Ton processeur</td></tr>
</table>
<p>L'asynchrone sert d'abord pour l'I/O : pendant l'attente, au lieu de rester bloqué, ton programme rend la main et peut faire autre chose. Le calcul CPU, lui, on le verra en 6.6.</p>

<h3>C'est quoi un thread ?</h3>
<p>Un <strong>thread</strong> (fil d'exécution), c'est un « travailleur » qui exécute ton code ligne après ligne. Dans l'analogie, c'est le serveur. Un thread coûte cher à créer (de la mémoire, du temps du système), donc .NET en garde une réserve prête à l'emploi : le <strong>pool de threads</strong> (thread pool), comme une équipe de serveurs disponibles.</p>
<p><strong>Bloquer</strong> un thread, c'est l'occuper à ne rien faire : il attend une réponse et ne peut servir personne d'autre. <code>Thread.Sleep(1000)</code> fait exactement ça pendant une seconde.</p>
<div class="compare">
<div><h4>Synchrone (bloquant)</h4><p>Le thread lance la requête, puis attend devant. Pendant l'attente, il est occupé mais inutile.</p></div>
<div><h4>Asynchrone (non bloquant)</h4><p>Le thread lance la requête et retourne au pool. Quand la réponse arrive, un thread (pas forcément le même) reprend la suite.</p></div>
</div>

<h3>Pourquoi c'est grave dans une API web</h3>
<p>Dans une API ASP.NET Core, chaque requête HTTP est traitée par un thread du pool. Imagine 100 requêtes en même temps, chacune attendant 2 secondes une réponse de la base de données.</p>
<div class="flow"><span>Requête HTTP</span><span>Thread du pool</span><span>Appel base de données</span><span>Réponse</span></div>
<p>En synchrone, les 100 threads sont bloqués. La 101e requête attend qu'un thread se libère, et le pool met du temps à en créer de nouveaux : l'API rame alors que le processeur ne fait presque rien. C'est ce qu'on appelle la <strong>famine du pool de threads</strong> (thread pool starvation). En asynchrone, pendant les 2 secondes d'attente, les threads repartent traiter d'autres requêtes : quelques threads suffisent pour des centaines de requêtes.</p>
<pre class="diagram">
Temps (s)      0    1    2    3    4
Synchrone
  thread 1   [req A......][req B......]
             attend A     attend B
Asynchrone
  thread 1   [A][B][C]       [A][B][C]
                lance        reprend
             (attente au réseau, thread libre)
</pre>
<div class="tip">L'asynchrone ne rend pas une opération plus rapide. Une requête de 2 secondes dure toujours 2 secondes. Ce qu'on gagne, c'est que le thread reste disponible pendant ce temps, donc l'application tient beaucoup plus de charge.</div>

<h3>Tu connais déjà : les Promise</h3>
<p>En JavaScript, tout ça t'est familier. Quand tu écris <code>await fetch(url)</code>, le navigateur ne fige pas la page : il lance la requête et revient plus tard. C'est le même modèle en C#.</p>
<table>
<tr><th>JavaScript / TypeScript</th><th>C#</th></tr>
<tr><td><code>Promise&lt;string&gt;</code></td><td><code>Task&lt;string&gt;</code></td></tr>
<tr><td><code>Promise&lt;void&gt;</code></td><td><code>Task</code></td></tr>
<tr><td><code>async function f()</code></td><td><code>async Task F()</code></td></tr>
<tr><td><code>await promise</code></td><td><code>await task</code></td></tr>
<tr><td><code>setTimeout</code> enveloppé dans une Promise</td><td><code>Task.Delay(ms)</code></td></tr>
</table>
<p>Une <code>Task</code>, c'est donc une <strong>promesse de résultat</strong> : une opération en cours qui finira plus tard, avec une valeur ou une erreur. Une différence importante : JavaScript n'a qu'un seul thread, alors que .NET en a plusieurs. On verra en 6.6 ce que ça change.</p>

<h3>Thread.Sleep contre Task.Delay</h3>
<p>Pour simuler une attente dans nos exemples, on a deux outils. <code>Thread.Sleep(ms)</code> bloque le thread : à éviter. <code>await Task.Delay(ms)</code> attend sans bloquer : le thread est libéré pendant le délai. C'est l'équivalent d'un appel réseau, en version simulée, et on va l'utiliser dans tout le chapitre.</p>
<div class="note">Dans une API, un seul <code>Thread.Sleep</code> ou un appel synchrone à la base dans une route très sollicitée suffit à faire tomber les performances sous la charge. La règle pro : de l'I/O, donc du <code>async</code> du contrôleur jusqu'à la base, sans exception.</div>
`,
  examples: [
    {
      title: "Thread.Sleep bloque, Task.Delay laisse faire autre chose",
      code: `using System.Diagnostics;

var sw = Stopwatch.StartNew();
Thread.Sleep(1000); // café : le thread est bloqué
Thread.Sleep(1000); // tartine : on attend la fin du café pour commencer
Console.WriteLine($"Synchrone : ~{sw.Elapsed.TotalSeconds:F0} s");

sw.Restart();
Task coffee = Task.Delay(1000); // on lance le café...
Task toast = Task.Delay(1000);  // ...et la tartine en même temps
await coffee;
await toast;
Console.WriteLine($"Asynchrone : ~{sw.Elapsed.TotalSeconds:F0} s");`,
      output: `Synchrone : ~2 s
Asynchrone : ~1 s`,
      steps: [
        "<code>using System.Diagnostics;</code> : pour <code>Stopwatch</code>, un chronomètre précis.",
        "<code>Thread.Sleep(1000)</code> deux fois : le thread dort une seconde, puis encore une. Rien d'autre ne peut se passer.",
        "<code>sw.Elapsed.TotalSeconds:F0</code> : la durée écoulée, arrondie à la seconde.",
        "<code>Task coffee = Task.Delay(1000);</code> : lance une attente d'une seconde et renvoie tout de suite une <code>Task</code>, sans attendre.",
        "<code>Task toast = Task.Delay(1000);</code> : la deuxième attente démarre pendant que la première court encore.",
        "<code>await coffee; await toast;</code> : on attend la fin des deux. Comme elles se chevauchent, c'est fini au bout d'environ une seconde."
      ],
      explain: "Les durées exactes varient de quelques millisecondes selon la machine, mais on retrouve toujours environ 2 s contre 1 s."
    },
    {
      title: "Le serveur de restaurant en code",
      code: `Console.WriteLine("Commande 1 envoyée en cuisine");
Task dish = CookAsync("Pizza", 1500);

Console.WriteLine("Je prends la commande 2");
Console.WriteLine("Je sers les boissons");

await dish;
Console.WriteLine("Je sers la pizza");

async Task CookAsync(string name, int ms)
{
    await Task.Delay(ms); // la cuisson, simulée
    Console.WriteLine($"Cuisine : {name} prête");
}`,
      output: `Commande 1 envoyée en cuisine
Je prends la commande 2
Je sers les boissons
Cuisine : Pizza prête
Je sers la pizza`,
      steps: [
        "<code>Task dish = CookAsync(\"Pizza\", 1500);</code> : la cuisson démarre et on récupère tout de suite une <code>Task</code>, comme un ticket de commande.",
        "<code>Console.WriteLine(\"Je prends la commande 2\")</code> : le programme n'attend pas la pizza, il continue immédiatement.",
        "<code>await dish;</code> : maintenant on a besoin du plat, on attend la fin de la cuisson sans bloquer le thread.",
        "<code>async Task CookAsync(…)</code> : une méthode asynchrone (on détaille la syntaxe en 6.4). Elle renvoie une <code>Task</code>.",
        "<code>await Task.Delay(ms);</code> : simule 1,5 s de cuisson, puis affiche que le plat est prêt."
      ],
      explain: "Le serveur a fait deux choses utiles pendant la cuisson : c'est tout l'intérêt de l'asynchrone."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Trier I/O et CPU",
      prompt: "<p>Pour chaque tâche, dis si c'est de l'I/O ou du calcul CPU, puis affiche ta réponse avec un <code>Console.WriteLine</code> par ligne : télécharger une image, compresser une vidéo, lire un fichier de configuration, calculer les 1 000 premiers nombres premiers, enregistrer une commande en base de données.</p>",
      hint: "<p>Demande-toi : est-ce mon processeur qui travaille, ou est-ce que j'attends un disque, un réseau ou une base ?</p>",
      solution: `Console.WriteLine("Télécharger une image : I/O (réseau)");
Console.WriteLine("Compresser une vidéo : CPU");
Console.WriteLine("Lire un fichier de configuration : I/O (disque)");
Console.WriteLine("Calculer 1 000 nombres premiers : CPU");
Console.WriteLine("Enregistrer une commande en base : I/O (base de données)");`
    },
    {
      level: "moyen",
      title: "Le petit-déjeuner",
      prompt: "<p>Écris trois méthodes <code>async Task</code> : <code>BoilWaterAsync</code> (2 s), <code>ToastBreadAsync</code> (1 s) et <code>FryEggAsync</code> (1 s), chacune affichant un message à la fin. Lance les trois sans les attendre, affiche <code>Je mets la table</code>, puis attends-les toutes et affiche le temps total arrondi.</p>",
      hint: "<p>Stocke chaque <code>Task</code> dans une variable, puis fais trois <code>await</code> à la suite. Le total doit être proche de la plus longue durée, pas de la somme.</p>",
      solution: `using System.Diagnostics;

var sw = Stopwatch.StartNew();
Task water = BoilWaterAsync();
Task toast = ToastBreadAsync();
Task egg = FryEggAsync();

Console.WriteLine("Je mets la table");
await water;
await toast;
await egg;
Console.WriteLine($"Petit-déjeuner prêt en ~{sw.Elapsed.TotalSeconds:F0} s");

async Task BoilWaterAsync() { await Task.Delay(2000); Console.WriteLine("Eau chaude"); }
async Task ToastBreadAsync() { await Task.Delay(1000); Console.WriteLine("Pain grillé"); }
async Task FryEggAsync() { await Task.Delay(1000); Console.WriteLine("Œuf cuit"); }`
    },
    {
      level: "difficile",
      title: "Mesurer le coût du blocage",
      prompt: "<p>Écris deux versions d'une méthode qui simule un appel à la base de 500 ms : <code>QuerySync()</code> avec <code>Thread.Sleep</code> et <code>QueryAsync()</code> avec <code>Task.Delay</code>. Simule 5 requêtes de chaque façon : 5 appels à la suite pour la version synchrone, 5 tâches lancées ensemble puis attendues pour la version asynchrone. Affiche les deux durées.</p>",
      hint: "<p>Pour la version asynchrone, remplis une <code>List&lt;Task&gt;</code> dans une boucle, puis fais un <code>foreach</code> avec <code>await</code> sur chaque tâche.</p>",
      solution: `using System.Diagnostics;

var sw = Stopwatch.StartNew();
for (int i = 0; i < 5; i++) QuerySync();
Console.WriteLine($"Synchrone : ~{sw.Elapsed.TotalSeconds:F1} s");

sw.Restart();
var tasks = new List<Task>();
for (int i = 0; i < 5; i++) tasks.Add(QueryAsync());
foreach (Task t in tasks) await t;
Console.WriteLine($"Asynchrone : ~{sw.Elapsed.TotalSeconds:F1} s");

void QuerySync() => Thread.Sleep(500);
Task QueryAsync() => Task.Delay(500);`
    }
  ],
  quiz: [
    {
      q: "Ton API attend 2 secondes une réponse de la base. Que t'apporte l'asynchrone ?",
      options: ["La requête prend moins de 2 secondes", "Le thread est libéré pendant l'attente et peut traiter d'autres requêtes", "La requête s'exécute sur le GPU"],
      answer: 1,
      why: "L'attente dure toujours 2 secondes : l'asynchrone ne rend pas la base plus rapide. Il évite de bloquer un thread pour rien, ce qui permet de servir beaucoup plus de requêtes en même temps."
    },
    {
      q: "Quel est l'équivalent C# d'une <code>Promise&lt;number&gt;</code> ?",
      options: ["<code>Task&lt;int&gt;</code>", "<code>Thread&lt;int&gt;</code>", "<code>async int</code>"],
      answer: 0,
      why: "<code>Task&lt;T&gt;</code> représente une opération qui produira une valeur de type <code>T</code> plus tard, comme une Promise. <code>Thread&lt;int&gt;</code> n'existe pas et <code>async int</code> n'est pas un type."
    },
    {
      q: "Lequel de ces travaux profite le moins de <code>async/await</code> seul ?",
      options: ["Appeler une API météo", "Lire un gros fichier sur le disque", "Calculer un million de hash en mémoire"],
      answer: 2,
      why: "Le calcul de hash occupe le processeur en continu : il n'y a aucune attente à libérer. <code>async/await</code> brille pour l'I/O (réseau, disque, base)."
    },
    {
      q: "Que fait <code>Thread.Sleep(1000)</code> dans une route d'API ?",
      options: ["Il libère le thread pendant 1 seconde", "Il met toute l'application en pause", "Il bloque le thread de la requête pendant 1 seconde"],
      answer: 2,
      why: "Le thread reste occupé à ne rien faire. Les autres threads continuent (pas toute l'application), mais sous forte charge, ce gaspillage mène à la famine du pool. <code>await Task.Delay</code> libère le thread."
    }
  ],
  resources: [
    { label: "Programmation asynchrone avec async et await (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/asynchronous-programming/" }
  ]
});

// ===================== 6.4 async, await et Task =====================
window.COURSE.push({
  key: "l-async-await",
  title: "6.4 async, await et Task",
  summary: "Tu sauras écrire et enchaîner tes propres méthodes asynchrones, utiliser les API async de .NET et éviter les pièges qui bloquent ou font disparaître des erreurs.",
  objectives: [
    "Déclarer des méthodes async qui renvoient Task ou une valeur",
    "Comprendre ce qui se passe au moment d'un await",
    "Utiliser File.ReadAllTextAsync et HttpClient",
    "Éviter async void, .Result et .Wait()"
  ],
  analogy: `<p>Quand tu commandes au comptoir d'une boulangerie très demandée, on te donne un numéro et tu vas t'asseoir. Le numéro, c'est la <code>Task</code> : il ne contient pas encore ton sandwich, mais il le représente. <code>await</code>, c'est « je m'occupe d'autre chose, appelle-moi quand mon numéro est prêt ». Rester debout devant le comptoir en fixant la vendeuse, c'est <code>.Result</code> : tu bloques la file.</p>`,
  lesson: `
<h3>Déclarer une méthode asynchrone</h3>
<p>Une méthode asynchrone a trois marques : le mot clé <code>async</code>, un type de retour <code>Task</code> ou <code>Task&lt;T&gt;</code>, et au moins un <code>await</code> à l'intérieur. Par convention, son nom se termine par <strong>Async</strong>.</p>
<table>
<tr><th>Version synchrone</th><th>Version asynchrone</th></tr>
<tr><td><code>void Save()</code></td><td><code>async Task SaveAsync()</code></td></tr>
<tr><td><code>string Load()</code></td><td><code>async Task&lt;string&gt; LoadAsync()</code></td></tr>
<tr><td><code>return text;</code></td><td><code>return text;</code> (le même !)</td></tr>
</table>
<p>Remarque : dans une méthode <code>async Task&lt;string&gt;</code>, tu écris <code>return text;</code> avec une <code>string</code>, pas une <code>Task</code>. Le compilateur emballe la valeur pour toi. Et l'appelant, avec <code>await</code>, la déballe : <code>string text = await LoadAsync();</code>.</p>

<h3>Ce qui se passe vraiment à l'await</h3>
<p>Quand l'exécution arrive sur <code>await</code> et que l'opération n'est pas encore terminée, la méthode <strong>rend la main</strong> à son appelant en lui donnant une <code>Task</code> « pas encore finie ». Quand l'opération se termine, la méthode <strong>reprend</strong> juste après l'<code>await</code>, avec toutes ses variables locales intactes.</p>
<div class="flow"><span>Code avant l'await</span><span>Opération lancée, la méthode rend la main</span><span>Le thread fait autre chose</span><span>Reprise après l'await</span></div>
<p>Le compilateur réalise ce tour de magie en transformant ta méthode en une petite <strong>machine à états</strong> (un objet qui se souvient de l'endroit où il s'est arrêté). Tu n'as pas à t'en occuper : tu écris du code qui se lit de haut en bas, comme du code synchrone.</p>

<h3>Les API asynchrones de .NET</h3>
<p>.NET propose une version <code>Async</code> de presque toutes les opérations d'I/O :</p>
<ul>
<li><code>File.ReadAllTextAsync</code>, <code>File.WriteAllTextAsync</code>, <code>File.ReadAllLinesAsync</code> pour les fichiers ;</li>
<li><code>HttpClient.GetStringAsync</code> pour appeler une URL, comme <code>fetch</code> en JS ;</li>
<li>plus tard, <code>ToListAsync</code> et <code>SaveChangesAsync</code> avec Entity Framework Core.</li>
</ul>
<p>Pour enchaîner des appels, il suffit de mettre les <code>await</code> les uns après les autres : chaque ligne attend la précédente, exactement comme une suite de <code>await</code> en TypeScript.</p>

<h3>Main peut être asynchrone</h3>
<p>Avec les top-level statements, tu peux écrire <code>await</code> directement dans <code>Program.cs</code>. Le compilateur génère pour toi un <code>Main</code> qui renvoie une <code>Task</code>. Dans une application à l'ancienne, tu écrirais <code>static async Task Main()</code>.</p>

<h3>Les deux pièges à connaître</h3>
<p><strong>Piège 1 : <code>async void</code>.</strong> Une méthode <code>async void</code> ne renvoie pas de <code>Task</code> : impossible de l'attendre, et si elle lève une exception, personne ne peut l'attraper et l'application peut planter. Seule exception : les gestionnaires d'événements (events, chapitre 5), dont la signature impose <code>void</code>.</p>
<p><strong>Piège 2 : <code>.Result</code> et <code>.Wait()</code>.</strong> Ces deux membres attendent une <code>Task</code> en <strong>bloquant</strong> le thread. Tu perds tout l'intérêt de l'asynchrone, et dans certains contextes (anciennes applications ASP.NET, WinForms, WPF), tu provoques un blocage définitif : le thread attend la tâche, et la tâche attend de reprendre sur ce même thread.</p>
<div class="tip">La règle d'or : <strong>async all the way</strong>. Dès qu'une méthode appelle du code asynchrone, elle devient elle-même <code>async</code> et l'appelant fait <code>await</code>, et ainsi de suite jusqu'en haut. Jamais de <code>.Result</code> ni de <code>.Wait()</code> pour « raccrocher » au synchrone.</div>
<pre class="diagram">
Controller     async Task&lt;IActionResult&gt;
   | await
Service        async Task&lt;Book&gt;
   | await
Repository     async Task&lt;Book&gt;
   | await
Base de données (I/O)
</pre>

<h3>Le tableau de correspondance</h3>
<table>
<tr><th>TypeScript</th><th>C#</th></tr>
<tr><td><code>async function load(): Promise&lt;string&gt;</code></td><td><code>async Task&lt;string&gt; LoadAsync()</code></td></tr>
<tr><td><code>async function save(): Promise&lt;void&gt;</code></td><td><code>async Task SaveAsync()</code></td></tr>
<tr><td><code>const text = await load();</code></td><td><code>string text = await LoadAsync();</code></td></tr>
<tr><td><code>await fetch(url).then(r =&gt; r.text())</code></td><td><code>await http.GetStringAsync(url)</code></td></tr>
<tr><td><code>try { await … } catch (e) { }</code></td><td><code>try { await … } catch (Exception e) { }</code></td></tr>
</table>
<div class="note">En production, on ne crée pas un <code>HttpClient</code> par requête avec <code>new</code> : sous forte charge, on épuise les connexions réseau. Dans ASP.NET Core, on le reçoit par injection de dépendances via <code>IHttpClientFactory</code>. Pour un petit programme console, une seule instance suffit.</div>
`,
  examples: [
    {
      title: "Écrire et enchaîner ses propres méthodes async",
      code: `Console.WriteLine("Début");
string member = await GetMemberAsync(42);
int loans = await CountLoansAsync(member);
Console.WriteLine($"{member} a {loans} emprunts");
Console.WriteLine("Fin");

async Task<string> GetMemberAsync(int id)
{
    await Task.Delay(500); // simule un appel à la base
    return $"Membre#{id}";
}

async Task<int> CountLoansAsync(string member)
{
    await Task.Delay(300); // simule un deuxième appel
    return 3;
}`,
      output: `Début
Membre#42 a 3 emprunts
Fin`,
      steps: [
        "<code>string member = await GetMemberAsync(42);</code> : on attend le membre. <code>await</code> transforme la <code>Task&lt;string&gt;</code> en <code>string</code>.",
        "<code>int loans = await CountLoansAsync(member);</code> : le deuxième appel a besoin du résultat du premier, on les enchaîne.",
        "<code>async Task&lt;string&gt; GetMemberAsync(int id)</code> : <code>async</code>, retour <code>Task&lt;string&gt;</code> et suffixe <code>Async</code>.",
        "<code>await Task.Delay(500);</code> : simule une attente réseau sans bloquer.",
        "<code>return $\"Membre#{id}\";</code> : on renvoie une simple <code>string</code>, le compilateur l'emballe dans la <code>Task</code>.",
        "<code>async Task&lt;int&gt; CountLoansAsync(…)</code> : même principe avec un entier."
      ],
      explain: "Le code se lit comme du synchrone, mais le thread est libre pendant chaque Task.Delay."
    },
    {
      title: "Voir la méthode rendre la main puis reprendre",
      code: `Task work = WorkAsync();
Console.WriteLine("2. Le programme continue pendant l'attente");
await work;
Console.WriteLine("4. Le programme reprend après WorkAsync");

async Task WorkAsync()
{
    Console.WriteLine("1. WorkAsync commence");
    await Task.Delay(500);
    Console.WriteLine("3. WorkAsync reprend après son await");
}`,
      output: `1. WorkAsync commence
2. Le programme continue pendant l'attente
3. WorkAsync reprend après son await
4. Le programme reprend après WorkAsync`,
      steps: [
        "<code>Task work = WorkAsync();</code> : on appelle la méthode sans <code>await</code>. Elle s'exécute normalement jusqu'à son premier <code>await</code>.",
        "<code>Console.WriteLine(\"1. …\")</code> : affiché tout de suite, c'est du code avant l'<code>await</code>.",
        "<code>await Task.Delay(500);</code> : le délai n'est pas fini, donc <code>WorkAsync</code> rend la main et renvoie une <code>Task</code> non terminée.",
        "<code>Console.WriteLine(\"2. …\")</code> : l'appelant continue pendant que le délai s'écoule.",
        "<code>await work;</code> : l'appelant attend à son tour. Au bout de 500 ms, <code>WorkAsync</code> reprend et affiche le 3.",
        "<code>Console.WriteLine(\"4. …\")</code> : la <code>Task</code> est terminée, l'appelant reprend."
      ],
      explain: "Un appel async s'exécute de façon synchrone jusqu'au premier await sur une opération pas encore terminée : c'est là qu'il rend la main."
    },
    {
      title: "Fichier et HTTP en asynchrone",
      code: `await File.WriteAllTextAsync("message.txt", "Bonjour en asynchrone !");
string text = await File.ReadAllTextAsync("message.txt");
Console.WriteLine(text);

using var http = new HttpClient();
try
{
    string html = await http.GetStringAsync("https://example.com");
    Console.WriteLine($"Page reçue : {html.Length} caractères");
}
catch (HttpRequestException ex)
{
    Console.WriteLine($"Réseau indisponible : {ex.Message}");
}`,
      output: `Bonjour en asynchrone !
Page reçue : 577 caractères`,
      steps: [
        "<code>await File.WriteAllTextAsync(…)</code> : la version asynchrone de <code>WriteAllText</code>, à attendre avec <code>await</code>.",
        "<code>string text = await File.ReadAllTextAsync(…)</code> : renvoie une <code>Task&lt;string&gt;</code>, l'<code>await</code> donne la <code>string</code>.",
        "<code>using var http = new HttpClient();</code> : le client HTTP de .NET (<code>System.Net.Http</code> est importé par défaut). Il est <code>IDisposable</code>.",
        "<code>await http.GetStringAsync(\"https://example.com\")</code> : télécharge la page sous forme de texte, comme <code>fetch(url).then(r =&gt; r.text())</code>.",
        "<code>catch (HttpRequestException ex)</code> : pas de réseau, nom de domaine introuvable, erreur HTTP… on affiche un message au lieu de planter."
      ],
      explain: "La deuxième ligne de sortie est indicative : le nombre de caractères dépend de la page renvoyée par le site au moment de l'exécution."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Ma première méthode qui renvoie une valeur",
      prompt: "<p>Écris <code>async Task&lt;int&gt; GetTemperatureAsync(string city)</code> qui attend 500 ms puis renvoie <code>city.Length * 3</code>. Appelle-la pour <code>Paris</code> et affiche <code>Paris : 15 °C</code>.</p>",
      hint: "<p>Utilise <code>await Task.Delay(500);</code> puis <code>return</code> un simple <code>int</code>.</p>",
      solution: `int temperature = await GetTemperatureAsync("Paris");
Console.WriteLine($"Paris : {temperature} °C");

async Task<int> GetTemperatureAsync(string city)
{
    await Task.Delay(500);
    return city.Length * 3;
}`
    },
    {
      level: "moyen",
      title: "Copier un fichier en majuscules",
      prompt: "<p>Écris <code>async Task&lt;int&gt; CopyUpperAsync(string source, string target)</code> qui lit toutes les lignes de <code>source</code> en asynchrone, les met en majuscules, les écrit dans <code>target</code> et renvoie le nombre de lignes copiées. Teste-la avec un petit fichier créé juste avant.</p>",
      hint: "<p><code>File.ReadAllLinesAsync</code> renvoie un <code>Task&lt;string[]&gt;</code> ; <code>File.WriteAllLinesAsync</code> accepte un <code>IEnumerable&lt;string&gt;</code>, donc un <code>Select(l =&gt; l.ToUpper())</code> convient.</p>",
      solution: `await File.WriteAllLinesAsync("source.txt", ["dune", "fondation", "ubik"]);

int count = await CopyUpperAsync("source.txt", "cible.txt");
Console.WriteLine($"{count} lignes copiées");
Console.WriteLine(await File.ReadAllTextAsync("cible.txt"));

async Task<int> CopyUpperAsync(string source, string target)
{
    string[] lines = await File.ReadAllLinesAsync(source);
    await File.WriteAllLinesAsync(target, lines.Select(l => l.ToUpper()));
    return lines.Length;
}`
    },
    {
      level: "difficile",
      title: "Réparer un code bloquant",
      prompt: "<p>Ce code fonctionne mais bloque des threads et utilise <code>async void</code> :</p><pre>void Run()\n{\n    string data = LoadAsync().Result;\n    Process(data);\n}\nasync void Process(string data)\n{\n    await Task.Delay(200);\n    Console.WriteLine(data.ToUpper());\n}\nasync Task&lt;string&gt; LoadAsync()\n{\n    await Task.Delay(200);\n    return \"données\";\n}</pre><p>Réécris-le en « async all the way » : plus de <code>.Result</code>, plus d'<code>async void</code>, et le programme principal attend bien la fin.</p>",
      hint: "<p><code>Run</code> devient <code>RunAsync</code> qui renvoie une <code>Task</code> ; <code>Process</code> devient <code>ProcessAsync</code> qui renvoie une <code>Task</code> et qu'on attend avec <code>await</code>.</p>",
      solution: `await RunAsync();
Console.WriteLine("Terminé");

async Task RunAsync()
{
    string data = await LoadAsync();
    await ProcessAsync(data);
}

async Task ProcessAsync(string data)
{
    await Task.Delay(200);
    Console.WriteLine(data.ToUpper());
}

async Task<string> LoadAsync()
{
    await Task.Delay(200);
    return "données";
}`
    }
  ],
  quiz: [
    {
      q: "Dans <code>async Task&lt;int&gt; CountAsync()</code>, que doit-on écrire pour renvoyer 5 ?",
      options: ["<code>return Task.FromResult(5);</code>", "<code>return 5;</code>", "<code>return await 5;</code>"],
      answer: 1,
      why: "Dans une méthode <code>async</code>, on renvoie directement la valeur : le compilateur l'emballe dans la <code>Task&lt;int&gt;</code>. <code>Task.FromResult</code> ne compile pas ici, et on ne peut pas faire <code>await</code> sur un entier."
    },
    {
      q: "Que se passe-t-il quand une méthode atteint un <code>await</code> sur une opération pas encore terminée ?",
      options: ["Elle rend la main à l'appelant et reprendra plus tard au même endroit", "Elle bloque le thread jusqu'à la fin de l'opération", "Elle recommence depuis le début quand l'opération est finie"],
      answer: 0,
      why: "La méthode est mise en pause, l'appelant récupère une <code>Task</code> non terminée, et la suite s'exécute après l'<code>await</code> une fois l'opération finie. Bloquer le thread, c'est ce que fait <code>.Result</code>."
    },
    {
      q: "Quand peut-on écrire <code>async void</code> ?",
      options: ["Quand la méthode ne renvoie rien", "Jamais, ça ne compile pas", "Pour un gestionnaire d'événement"],
      answer: 2,
      why: "Ça compile, mais on ne peut ni l'attendre ni attraper ses exceptions. Une méthode qui ne renvoie rien doit renvoyer <code>Task</code>. Le seul cas légitime est le gestionnaire d'événement, dont la signature impose <code>void</code>."
    },
    {
      q: "Pourquoi éviter <code>LoadAsync().Result</code> ?",
      options: ["Parce que <code>Result</code> renvoie toujours <code>null</code>", "Parce que ça bloque le thread et peut provoquer un blocage définitif", "Parce que ça lance la tâche deux fois"],
      answer: 1,
      why: "<code>.Result</code> donne bien la valeur, mais en bloquant le thread jusqu'à la fin, ce qui annule l'intérêt de l'asynchrone et peut créer un deadlock dans certaines applications. Utilise <code>await</code>."
    }
  ],
  project: "<p>Rends le chargement de ta Bibliothèque asynchrone : transforme <code>LoadLibrary()</code> en <code>async Task&lt;LibraryData&gt; LoadLibraryAsync()</code> avec <code>File.ReadAllTextAsync</code>, et <code>SaveLibrary</code> en <code>async Task SaveLibraryAsync(LibraryData data)</code> avec <code>File.WriteAllTextAsync</code>. Dans <code>Program.cs</code>, remplace les appels par des <code>await</code>, sans aucun <code>.Result</code>.</p>",
  resources: [
    { label: "Modèle de programmation asynchrone des tâches (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/asynchronous-programming/task-asynchronous-programming-model" }
  ]
});

// ===================== 6.5 Annulation et erreurs en asynchrone =====================
window.COURSE.push({
  key: "l-async-cancel-errors",
  title: "6.5 Annulation et erreurs en asynchrone",
  summary: "Tu sauras annuler une opération asynchrone trop longue, poser un délai maximal et attraper proprement les erreurs de tes tâches.",
  objectives: [
    "Annuler une tâche avec CancellationTokenSource et CancellationToken",
    "Poser un timeout avec CancelAfter",
    "Attraper les exceptions d'une méthode async avec try/catch",
    "Repérer les exceptions perdues des tâches non attendues"
  ],
  analogy: `<p>Tu as commandé une pizza par téléphone, mais tes amis ont finalement apporté à manger. Tu rappelles la pizzeria : « annulez ma commande ». Le <code>CancellationTokenSource</code>, c'est ton téléphone : c'est toi qui décides d'annuler. Le <code>CancellationToken</code>, c'est le ticket accroché en cuisine : le pizzaïolo le regarde régulièrement, et s'il voit « annulé », il arrête de préparer. Si personne ne regarde le ticket, la pizza sera quand même faite.</p>`,
  lesson: `
<h3>Pourquoi annuler ?</h3>
<p>Une opération asynchrone peut durer longtemps : un import de fichier énorme, un serveur qui ne répond pas. Il faut pouvoir l'arrêter, soit parce que l'utilisateur a cliqué sur « Annuler », soit parce qu'un délai maximal (un <strong>timeout</strong>) est dépassé. Dans une API, quand le client ferme son navigateur, inutile de continuer à calculer une réponse que personne ne lira.</p>
<p>En JavaScript, tu connais peut-être <code>AbortController</code> avec <code>fetch</code>. C'est le même principe en C#.</p>
<table>
<tr><th>JavaScript</th><th>C#</th><th>Rôle</th></tr>
<tr><td><code>AbortController</code></td><td><code>CancellationTokenSource</code></td><td>Celui qui décide d'annuler</td></tr>
<tr><td><code>controller.signal</code></td><td><code>cts.Token</code></td><td>Le signal qu'on transmet</td></tr>
<tr><td><code>controller.abort()</code></td><td><code>cts.Cancel()</code></td><td>Déclencher l'annulation</td></tr>
<tr><td><code>AbortSignal.timeout(1000)</code></td><td><code>cts.CancelAfter(1000)</code></td><td>Annuler après un délai</td></tr>
</table>

<h3>Passer le token jusqu'en bas</h3>
<p>Le principe est <strong>coopératif</strong> : annuler ne tue pas la tâche de force. Ça lève seulement un drapeau, et chaque méthode doit vérifier ce drapeau ou le transmettre. Les API de .NET acceptent presque toutes un <code>CancellationToken</code> en dernier paramètre : <code>Task.Delay(ms, token)</code>, <code>File.ReadAllTextAsync(path, token)</code>, <code>http.GetStringAsync(url, token)</code>.</p>
<div class="flow"><span>CancellationTokenSource</span><span>Ta méthode (token)</span><span>Sous-méthode (token)</span><span>API .NET (token)</span></div>
<p>La convention : ta méthode asynchrone accepte un paramètre <code>CancellationToken token</code> (souvent avec <code>= default</code>, ce qui veut dire « jamais annulé ») et le passe à <strong>tous</strong> les appels qu'elle fait. Si un maillon de la chaîne oublie le token, l'annulation s'arrête là.</p>
<p>Dans une boucle de calcul sans appel asynchrone, tu vérifies toi-même avec <code>token.ThrowIfCancellationRequested()</code> à chaque tour.</p>

<h3>OperationCanceledException</h3>
<p>Quand une opération voit le token annulé, elle lève une <code>OperationCanceledException</code>. Ce n'est pas un bug : c'est la façon normale de dire « je me suis arrêtée comme demandé ». Tu l'attrapes à l'endroit où tu as décidé d'annuler, pour afficher un message calme. <code>Task.Delay</code> lève plus précisément une <code>TaskCanceledException</code>, qui hérite de <code>OperationCanceledException</code> : attraper la classe parente couvre les deux.</p>
<div class="tip">Un <code>CancellationTokenSource</code> est <code>IDisposable</code> (il peut contenir un minuteur) : déclare-le avec <code>using var cts = new CancellationTokenSource();</code>.</div>

<h3>Les erreurs dans une méthode async</h3>
<p>Bonne nouvelle : avec <code>await</code>, les exceptions se comportent comme en synchrone. Si la méthode attendue lève une exception, elle est stockée dans la <code>Task</code>, puis <strong>relancée au moment de l'<code>await</code></strong>. Un <code>try/catch</code> autour de l'<code>await</code> l'attrape, exactement comme en TypeScript.</p>
<p>Le piège, c'est la tâche <strong>jamais attendue</strong> (« fire and forget », lancer et oublier). Si tu écris <code>_ = SaveAsync();</code> sans <code>await</code>, l'exception reste enfermée dans la <code>Task</code> que personne ne regarde : elle est perdue, en silence. C'est l'équivalent d'une Promise rejetée sans <code>catch</code>.</p>
<pre class="diagram">
await SaveAsync()           _ = SaveAsync()
  +-------------+             +-------------+
  | exception   |             | exception   |
  +------+------+             +------+------+
         |                           |
   relancée à l'await          rangée dans la Task
         |                           |
   ton catch l'attrape         personne ne la lit
</pre>

<h3>Plusieurs tâches, plusieurs erreurs : un aperçu</h3>
<p><code>Task.WhenAll(t1, t2)</code> crée une tâche qui se termine quand toutes sont finies (on l'approfondit en 6.8). Si plusieurs échouent, l'<code>await</code> ne relance que la <strong>première</strong> exception. Toutes les autres sont rangées dans la propriété <code>Exception</code> de la tâche, de type <code>AggregateException</code> : une exception qui en contient plusieurs, dans sa liste <code>InnerExceptions</code>.</p>

<h3>Les bonnes pratiques</h3>
<table>
<tr><th>À faire</th><th>À éviter</th></tr>
<tr><td>Accepter un <code>CancellationToken</code> et le transmettre partout</td><td>Ignorer le token reçu</td></tr>
<tr><td><code>try/catch</code> autour de l'<code>await</code></td><td>Lancer une tâche sans jamais l'attendre</td></tr>
<tr><td>Attraper <code>OperationCanceledException</code> là où on annule</td><td>Traiter une annulation comme une erreur grave</td></tr>
<tr><td><code>CancelAfter</code> pour les appels externes</td><td>Attendre indéfiniment un serveur qui ne répond pas</td></tr>
<tr><td><code>using var cts = …</code></td><td>Oublier de libérer le <code>CancellationTokenSource</code></td></tr>
</table>
<div class="note">Dans ASP.NET Core, une action de contrôleur peut recevoir un <code>CancellationToken</code> en paramètre : il est annulé automatiquement si le client se déconnecte. On le transmet ensuite jusqu'à EF Core (<code>ToListAsync(token)</code>) pour arrêter les requêtes SQL devenues inutiles.</div>
`,
  examples: [
    {
      title: "Un import arrêté par un timeout",
      code: `using var cts = new CancellationTokenSource();
cts.CancelAfter(TimeSpan.FromSeconds(1)); // délai maximal : 1 s

try
{
    await ImportAsync(10, cts.Token);
    Console.WriteLine("Import terminé");
}
catch (OperationCanceledException)
{
    Console.WriteLine("Import annulé : trop long");
}

async Task ImportAsync(int count, CancellationToken token)
{
    for (int i = 1; i <= count; i++)
    {
        await Task.Delay(400, token); // le token descend jusqu'ici
        Console.WriteLine($"Livre {i} importé");
    }
}`,
      output: `Livre 1 importé
Livre 2 importé
Import annulé : trop long`,
      steps: [
        "<code>using var cts = new CancellationTokenSource();</code> : la source d'annulation, libérée en fin de programme.",
        "<code>cts.CancelAfter(TimeSpan.FromSeconds(1));</code> : l'annulation se déclenchera toute seule au bout d'une seconde.",
        "<code>await ImportAsync(10, cts.Token);</code> : on transmet le token à la méthode.",
        "<code>async Task ImportAsync(int count, CancellationToken token)</code> : la méthode accepte le token en dernier paramètre, c'est la convention.",
        "<code>await Task.Delay(400, token);</code> : chaque livre prend 400 ms. Au 3e livre (vers 1 000 ms), le token est annulé et <code>Task.Delay</code> lève une exception.",
        "<code>catch (OperationCanceledException)</code> : on attrape l'annulation et on affiche un message, au lieu d'un plantage."
      ],
      explain: "Le nombre de livres importés avant l'annulation dépend du minutage : en général 2, mais une machine très chargée peut afficher une ligne de moins."
    },
    {
      title: "try/catch autour d'un await, et l'exception perdue",
      code: `try
{
    await LoadAsync("inconnu");
}
catch (InvalidOperationException ex)
{
    Console.WriteLine($"Attrapée : {ex.Message}");
}

_ = LoadAsync("oublié"); // pas d'await : l'exception est perdue
await Task.Delay(300);
Console.WriteLine("Fin du programme, aucune trace de la 2e erreur");

async Task LoadAsync(string title)
{
    await Task.Delay(100);
    throw new InvalidOperationException($"Livre '{title}' introuvable");
}`,
      output: `Attrapée : Livre 'inconnu' introuvable
Fin du programme, aucune trace de la 2e erreur`,
      steps: [
        "<code>await LoadAsync(\"inconnu\");</code> : la méthode lève une exception après 100 ms ; elle est relancée à l'<code>await</code>.",
        "<code>catch (InvalidOperationException ex)</code> : le <code>try/catch</code> fonctionne comme en synchrone.",
        "<code>_ = LoadAsync(\"oublié\");</code> : on lance la tâche et on jette la <code>Task</code> (le <code>_</code> signifie « je ne m'en sers pas »).",
        "<code>await Task.Delay(300);</code> : on laisse le temps à la deuxième tâche d'échouer.",
        "<code>Console.WriteLine(\"Fin …\")</code> : rien n'a été affiché pour la deuxième erreur. Elle est restée dans une <code>Task</code> que personne n'a attendue.",
        "<code>throw new InvalidOperationException(…)</code> : dans une méthode <code>async</code>, l'exception est rangée dans la <code>Task</code> renvoyée."
      ],
      explain: "Une tâche qui peut échouer doit toujours être attendue quelque part, sinon ses erreurs disparaissent en silence."
    },
    {
      title: "Aperçu : plusieurs erreurs avec Task.WhenAll",
      code: `Task all = Task.WhenAll(FailAsync("A", 100), FailAsync("B", 200));
try
{
    await all;
}
catch (Exception ex)
{
    Console.WriteLine($"L'await relance : {ex.Message}");
    foreach (Exception inner in all.Exception!.InnerExceptions)
        Console.WriteLine($"- {inner.Message}");
}

async Task FailAsync(string name, int ms)
{
    await Task.Delay(ms);
    throw new InvalidOperationException($"Échec {name}");
}`,
      output: `L'await relance : Échec A
- Échec A
- Échec B`,
      steps: [
        "<code>Task.WhenAll(FailAsync(\"A\", 100), FailAsync(\"B\", 200))</code> : une tâche qui attend les deux. Elles échoueront toutes les deux.",
        "<code>await all;</code> : l'<code>await</code> relance une seule exception, celle de la première tâche de la liste.",
        "<code>catch (Exception ex)</code> : <code>ex.Message</code> vaut donc <code>Échec A</code>.",
        "<code>all.Exception!.InnerExceptions</code> : la propriété <code>Exception</code> de la tâche est une <code>AggregateException</code> qui contient toutes les erreurs. Le <code>!</code> dit au compilateur qu'elle n'est pas nulle ici.",
        "<code>foreach (…) Console.WriteLine(…)</code> : on affiche chaque erreur, ici A et B."
      ],
      explain: "Retiens juste l'idée pour l'instant : await montre la première erreur, Task.Exception les garde toutes. On s'en resservira en 6.8."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Annuler une attente",
      prompt: "<p>Crée un <code>CancellationTokenSource</code> avec <code>CancelAfter(500)</code>, puis fais <code>await Task.Delay(3000, cts.Token)</code>. Attrape l'annulation et affiche <code>Attente annulée</code>.</p>",
      hint: "<p><code>CancelAfter</code> accepte aussi un nombre de millisecondes. Attrape <code>OperationCanceledException</code>.</p>",
      solution: `using var cts = new CancellationTokenSource();
cts.CancelAfter(500);

try
{
    await Task.Delay(3000, cts.Token);
    Console.WriteLine("Attente terminée");
}
catch (OperationCanceledException)
{
    Console.WriteLine("Attente annulée");
}`
    },
    {
      level: "moyen",
      title: "Un calcul annulable",
      prompt: "<p>Écris <code>long SumSlowly(int n, CancellationToken token)</code> (synchrone) qui additionne les nombres de 1 à <code>n</code> en appelant <code>token.ThrowIfCancellationRequested()</code> à chaque tour. Appelle-la avec un token déjà annulé (fais <code>cts.Cancel()</code> avant) et vérifie que l'annulation est bien détectée, puis avec un token neuf et affiche la somme pour <code>n = 100</code>.</p>",
      hint: "<p>Utilise <code>CancellationToken.None</code> pour un token qui n'est jamais annulé.</p>",
      solution: `using var cts = new CancellationTokenSource();
cts.Cancel();

try
{
    SumSlowly(1_000_000, cts.Token);
}
catch (OperationCanceledException)
{
    Console.WriteLine("Calcul annulé dès le premier tour");
}

Console.WriteLine($"Somme : {SumSlowly(100, CancellationToken.None)}");

long SumSlowly(int n, CancellationToken token)
{
    long total = 0;
    for (int i = 1; i <= n; i++)
    {
        token.ThrowIfCancellationRequested();
        total += i;
    }
    return total;
}`
    },
    {
      level: "difficile",
      title: "Téléchargement avec timeout et erreurs",
      prompt: "<p>Écris <code>async Task&lt;string&gt; DownloadAsync(string url, CancellationToken token)</code> qui simule un téléchargement : elle attend 800 ms (avec le token) et lève une <code>HttpRequestException</code> si l'URL contient <code>\"erreur\"</code>. Écris ensuite <code>async Task TryDownloadAsync(string url, int timeoutMs)</code> qui crée son propre timeout et affiche l'un de ces trois messages : <code>OK : …</code>, <code>Timeout : …</code> ou <code>Erreur : …</code>. Teste trois cas.</p>",
      hint: "<p>Dans <code>TryDownloadAsync</code>, mets deux blocs <code>catch</code> : un pour <code>OperationCanceledException</code>, un pour <code>HttpRequestException</code>.</p>",
      solution: `await TryDownloadAsync("site/livres", 2000);
await TryDownloadAsync("site/lent", 300);
await TryDownloadAsync("site/erreur", 2000);

async Task TryDownloadAsync(string url, int timeoutMs)
{
    using var cts = new CancellationTokenSource(timeoutMs);
    try
    {
        string content = await DownloadAsync(url, cts.Token);
        Console.WriteLine($"OK : {content}");
    }
    catch (OperationCanceledException)
    {
        Console.WriteLine($"Timeout : {url}");
    }
    catch (HttpRequestException ex)
    {
        Console.WriteLine($"Erreur : {ex.Message}");
    }
}

async Task<string> DownloadAsync(string url, CancellationToken token)
{
    await Task.Delay(800, token);
    if (url.Contains("erreur"))
        throw new HttpRequestException($"{url} a répondu 500");
    return $"contenu de {url}";
}`
    }
  ],
  quiz: [
    {
      q: "Tu appelles <code>cts.Cancel()</code>, mais ta méthode ne reçoit pas le token et ne le transmet à personne. Que se passe-t-il ?",
      options: ["La méthode est arrêtée de force", "Rien : la méthode continue jusqu'au bout", "Une exception est levée immédiatement dans la méthode"],
      answer: 1,
      why: "L'annulation est coopérative : elle ne fait que lever un drapeau. Si personne ne regarde le token, rien ne s'arrête. C'est pour ça qu'il faut le transmettre jusqu'en bas."
    },
    {
      q: "Quelle exception attraper pour gérer une annulation ?",
      options: ["<code>OperationCanceledException</code>", "<code>TimeoutException</code>", "<code>AggregateException</code>"],
      answer: 0,
      why: "Les opérations annulées lèvent <code>OperationCanceledException</code> (ou sa sous-classe <code>TaskCanceledException</code>). <code>TimeoutException</code> n'est pas levée par <code>CancelAfter</code>, et <code>AggregateException</code> sert à regrouper plusieurs erreurs."
    },
    {
      q: "Une méthode async lancée avec <code>_ = SendMailAsync();</code> lève une exception. Que se passe-t-il ?",
      options: ["Le programme plante immédiatement", "L'exception est relancée à la ligne suivante", "L'exception reste dans la Task et passe inaperçue"],
      answer: 2,
      why: "Sans <code>await</code>, personne n'observe la <code>Task</code> : l'exception est stockée dedans et perdue. Le programme continue comme si de rien n'était, d'où le danger."
    },
    {
      q: "Deux tâches échouent dans un <code>await Task.WhenAll(t1, t2)</code>. Que reçoit ton <code>catch</code> ?",
      options: ["Une <code>AggregateException</code> avec les deux erreurs", "La première exception seulement", "Aucune exception"],
      answer: 1,
      why: "L'<code>await</code> relance la première exception. Pour les voir toutes, il faut lire la propriété <code>Exception</code> de la tâche renvoyée par <code>WhenAll</code>, qui est une <code>AggregateException</code>."
    }
  ],
  project: "<p>Ajoute un import de livres annulable à ta Bibliothèque : <code>async Task&lt;int&gt; ImportBooksAsync(string jsonPath, CancellationToken token)</code> lit un fichier JSON de livres avec <code>File.ReadAllTextAsync(jsonPath, token)</code>, puis ajoute chaque livre au catalogue avec un <code>await Task.Delay(200, token)</code> pour simuler un traitement lent. Dans <code>Program.cs</code>, lance l'import avec un <code>CancelAfter</code> de 1 seconde et affiche combien de livres ont été importés ou <code>Import annulé</code>.</p>",
  resources: [
    { label: "Annulation dans les threads managés (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/threading/cancellation-in-managed-threads" }
  ]
});

// ===================== 6.6 Threads et race conditions =====================
window.COURSE.push({
  key: "l-threads-race",
  title: "6.6 Threads et race conditions",
  summary: "Tu sauras exécuter un calcul lourd en arrière-plan avec Task.Run et reconnaître une race condition, ce bug où plusieurs threads se marchent dessus.",
  objectives: [
    "Comprendre ce qu'est un thread et le pool de threads",
    "Déléguer un calcul CPU avec Task.Run",
    "Expliquer pourquoi deux threads qui modifient la même variable donnent un résultat faux",
    "Corriger un compteur partagé avec Interlocked ou des données locales"
  ],
  analogy: `<p>Un supermarché ouvre plusieurs caisses : chaque caissier est un <strong>thread</strong>, et tous travaillent en même temps. Tant que chacun s'occupe de sa propre caisse, tout va bien. Maintenant imagine qu'ils notent tous leurs ventes sur un seul tableau blanc : deux caissiers lisent « 100 », ajoutent chacun 1 et écrivent « 101 ». Il y a eu deux ventes, mais le tableau n'en compte qu'une. C'est une <strong>race condition</strong>.</p>`,
  lesson: `
<h3>Un thread, un fil d'exécution</h3>
<p>Un <strong>thread</strong> exécute des instructions l'une après l'autre. Ton ordinateur a plusieurs cœurs de processeur : plusieurs threads peuvent donc avancer <strong>vraiment en même temps</strong>. C'est une grande différence avec JavaScript, qui n'a qu'un seul thread pour ton code : en JS, deux fonctions ne s'exécutent jamais au même instant, donc ce bug n'existe pas.</p>
<p>En C#, tu peux créer un thread à la main avec <code>new Thread(…)</code>, mais c'est rare aujourd'hui : c'est coûteux et verbeux. On utilise plutôt le <strong>pool de threads</strong> (thread pool), la réserve de threads gérée par .NET, à travers les <code>Task</code>.</p>
<table>
<tr><th>Outil</th><th>Usage</th></tr>
<tr><td><code>new Thread(…)</code></td><td>Rare : un thread dédié de très longue durée</td></tr>
<tr><td><code>ThreadPool</code></td><td>Bas niveau, utilisé par .NET en coulisses</td></tr>
<tr><td><code>Task.Run(…)</code></td><td>Le bon choix : exécute du code sur un thread du pool et renvoie une <code>Task</code></td></tr>
</table>

<h3>Task.Run pour le calcul CPU</h3>
<p>En 6.3, on a vu que <code>async/await</code> sert à l'I/O. Pour un calcul lourd (CPU), il n'y a rien à attendre : il faut un thread qui travaille. <code>Task.Run(() =&gt; Calcul())</code> envoie le calcul sur un thread du pool et te rend une <code>Task</code> que tu peux attendre avec <code>await</code>. Pendant ce temps, le thread de départ reste libre (très utile dans une application avec une interface graphique, qui ne doit pas se figer).</p>
<div class="tip">N'enveloppe pas de l'I/O dans <code>Task.Run</code> : <code>Task.Run(() =&gt; File.ReadAllText(path))</code> bloque quand même un thread du pool. Utilise directement <code>File.ReadAllTextAsync</code>. <code>Task.Run</code>, c'est pour le calcul.</div>

<h3>La race condition</h3>
<p>Une <strong>race condition</strong> (situation de compétition), c'est un bug qui apparaît quand plusieurs threads accèdent à la même donnée en même temps et qu'au moins un d'eux la modifie. Le résultat dépend de qui arrive en premier : il est faux et change d'une exécution à l'autre. C'est ce qui le rend si sournois : ton test peut passer dix fois et échouer la onzième.</p>

<h3>Pourquoi counter++ n'est pas sûr</h3>
<p><code>counter++</code> ressemble à une seule opération, mais le processeur fait trois étapes : <strong>lire</strong> la valeur, <strong>ajouter</strong> 1, <strong>écrire</strong> le résultat. Si deux threads font ces étapes en même temps, ils peuvent lire la même valeur.</p>
<div class="flow"><span>Lire counter</span><span>Ajouter 1</span><span>Écrire counter</span></div>
<pre class="diagram">
counter = 10
Thread A               Thread B
lit 10
                       lit 10
calcule 11
                       calcule 11
écrit 11
                       écrit 11
counter = 11   (2 incréments, 1 seul compté)
</pre>
<p>Répète ça un million de fois avec deux threads : tu perds des milliers d'incréments, et un nombre différent à chaque exécution.</p>

<h3>Données partagées ou données locales</h3>
<p>La race condition demande une donnée <strong>partagée</strong> et <strong>modifiée</strong>. Une variable locale déclarée à l'intérieur de la lambda n'appartient qu'au thread qui l'exécute : aucun risque. Une variable déclarée dehors et utilisée dans la lambda (une variable <strong>capturée</strong>, comme une closure en JS) est partagée par tous les threads.</p>
<div class="compare">
<div><h4>Partagée (risque)</h4><p>Un champ, une variable capturée, une <code>List</code> commune modifiée par plusieurs tâches.</p></div>
<div><h4>Locale (sûre)</h4><p>Une variable déclarée dans la lambda ou la méthode : chaque thread a la sienne.</p></div>
</div>
<p>D'où une première stratégie : chaque tâche calcule son propre résultat dans une variable locale et le <strong>renvoie</strong>, puis on additionne les résultats à la fin.</p>

<h3>Première correction : Interlocked</h3>
<p>La classe <code>Interlocked</code> fournit des opérations <strong>atomiques</strong> : le processeur les exécute d'un bloc, sans qu'un autre thread puisse se glisser au milieu. <code>Interlocked.Increment(ref counter)</code> fait lire-ajouter-écrire en une seule étape indivisible. Le mot clé <code>ref</code> passe la variable elle-même (pas une copie de sa valeur), pour que la méthode puisse la modifier.</p>
<div class="note">Interlocked est parfait pour un compteur ou un total, mais il ne protège qu'une seule variable à la fois. Dès que tu dois modifier plusieurs données ensemble de façon cohérente (retirer un livre du stock ET l'ajouter aux emprunts), il te faut un verrou : c'est la leçon suivante.</div>
`,
  examples: [
    {
      title: "Un calcul lourd avec Task.Run",
      code: `Console.WriteLine("Calcul lancé en arrière-plan");
Task<long> sumTask = Task.Run(() => SumUpTo(100_000_000));

Console.WriteLine("Le programme reste libre pendant ce temps");
long sum = await sumTask;
Console.WriteLine($"Somme : {sum}");

static long SumUpTo(int n)
{
    long total = 0;
    for (int i = 1; i <= n; i++)
        total += i;
    return total;
}`,
      output: `Calcul lancé en arrière-plan
Le programme reste libre pendant ce temps
Somme : 5000000050000000`,
      steps: [
        "<code>Task.Run(() =&gt; SumUpTo(100_000_000))</code> : le calcul part sur un thread du pool. On récupère une <code>Task&lt;long&gt;</code>.",
        "<code>Console.WriteLine(\"Le programme reste libre …\")</code> : affiché sans attendre la fin du calcul.",
        "<code>long sum = await sumTask;</code> : on attend le résultat, sans bloquer le thread courant.",
        "<code>static long SumUpTo(int n)</code> : un calcul purement CPU, aucune attente d'I/O.",
        "<code>long total = 0;</code> : une variable locale, propre à ce calcul. Le <code>long</code> est nécessaire, la somme dépasse la capacité d'un <code>int</code>."
      ],
      explain: "Task.Run est l'outil du calcul CPU : il confie le travail à un autre thread et te rend une Task à attendre."
    },
    {
      title: "La race condition en direct",
      code: `int counter = 0;

Task a = Task.Run(() =>
{
    for (int i = 0; i < 1_000_000; i++) counter++;
});
Task b = Task.Run(() =>
{
    for (int i = 0; i < 1_000_000; i++) counter++;
});

await a;
await b;
Console.WriteLine($"Attendu : 2000000, obtenu : {counter}");`,
      output: `Attendu : 2000000, obtenu : 1187436`,
      steps: [
        "<code>int counter = 0;</code> : une variable déclarée dehors, donc partagée par les deux lambdas.",
        "<code>Task a = Task.Run(() =&gt; { … counter++; });</code> : un premier thread incrémente un million de fois.",
        "<code>Task b = Task.Run(…)</code> : un second thread fait la même chose, en même temps.",
        "<code>counter++</code> : lire, ajouter 1, écrire. Quand les deux threads lisent la même valeur, un incrément est perdu.",
        "<code>await a; await b;</code> : on attend la fin des deux tâches avant d'afficher."
      ],
      explain: "Le nombre obtenu est faux et change à chaque exécution : le tien sera différent, parfois proche de 2 000 000, parfois très loin."
    },
    {
      title: "Deux corrections : Interlocked et données locales",
      code: `int counter = 0;

Task a = Task.Run(() =>
{
    for (int i = 0; i < 1_000_000; i++) Interlocked.Increment(ref counter);
});
Task b = Task.Run(() =>
{
    for (int i = 0; i < 1_000_000; i++) Interlocked.Increment(ref counter);
});
await a;
await b;
Console.WriteLine($"Avec Interlocked : {counter}");

Task<int> c = Task.Run(() => CountLocally(1_000_000));
Task<int> d = Task.Run(() => CountLocally(1_000_000));
Console.WriteLine($"Avec des données locales : {await c + await d}");

static int CountLocally(int n)
{
    int local = 0; // chaque thread a sa propre variable
    for (int i = 0; i < n; i++) local++;
    return local;
}`,
      output: `Avec Interlocked : 2000000
Avec des données locales : 2000000`,
      steps: [
        "<code>Interlocked.Increment(ref counter)</code> : l'incrément devient atomique, aucun thread ne peut s'intercaler.",
        "<code>ref counter</code> : on passe la variable elle-même, pour qu'<code>Increment</code> la modifie.",
        "<code>Console.WriteLine($\"Avec Interlocked : {counter}\")</code> : le total est enfin exact.",
        "<code>Task.Run(() =&gt; CountLocally(1_000_000))</code> : chaque tâche compte dans son coin et renvoie son résultat.",
        "<code>int local = 0;</code> : une variable locale, invisible pour l'autre thread. Aucune donnée partagée, donc aucune course.",
        "<code>await c + await d</code> : on additionne les deux résultats une fois les tâches terminées."
      ],
      explain: "Les données locales sont souvent la meilleure solution : pas de partage, pas de bug, et c'est même plus rapide qu'un compteur partagé."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Calcul en arrière-plan",
      prompt: "<p>Avec <code>Task.Run</code>, compte combien de nombres entre 1 et 10 000 000 sont divisibles par 7. Pendant le calcul, affiche <code>Calcul en cours…</code>, puis affiche le résultat.</p>",
      hint: "<p>Utilise une variable locale dans la lambda et renvoie-la : <code>Task.Run(() =&gt; { int count = 0; …; return count; })</code>.</p>",
      solution: `Task<int> task = Task.Run(() =>
{
    int count = 0;
    for (int i = 1; i <= 10_000_000; i++)
        if (i % 7 == 0) count++;
    return count;
});

Console.WriteLine("Calcul en cours…");
Console.WriteLine($"Divisibles par 7 : {await task}");`
    },
    {
      level: "moyen",
      title: "Trouver le bug",
      prompt: "<p>Ce code lance 4 tâches qui ajoutent chacune 250 000 au total, mais le résultat est faux :</p><pre>long total = 0;\nvar tasks = new List&lt;Task&gt;();\nfor (int t = 0; t &lt; 4; t++)\n    tasks.Add(Task.Run(() =&gt; { for (int i = 0; i &lt; 250_000; i++) total += 1; }));\nforeach (Task task in tasks) await task;\nConsole.WriteLine(total);</pre><p>Explique le problème dans un commentaire et corrige-le avec <code>Interlocked.Add</code>.</p>",
      hint: "<p><code>total += 1</code> est un lire-modifier-écrire sur une variable partagée. <code>Interlocked.Add(ref total, 1)</code> fonctionne aussi avec un <code>long</code>.</p>",
      solution: `// Problème : total est partagé par les 4 tâches et "total += 1"
// fait lire / ajouter / écrire : des incréments se perdent.
long total = 0;
var tasks = new List<Task>();
for (int t = 0; t < 4; t++)
    tasks.Add(Task.Run(() =>
    {
        for (int i = 0; i < 250_000; i++) Interlocked.Add(ref total, 1);
    }));
foreach (Task task in tasks) await task;
Console.WriteLine(total); // 1000000`
    },
    {
      level: "difficile",
      title: "Découper le travail sans partage",
      prompt: "<p>Calcule la somme des carrés des nombres de 1 à 2 000 000 en découpant le travail en 4 tranches de 500 000, chacune calculée par une tâche <code>Task.Run</code> avec une variable locale. Additionne les 4 résultats et vérifie que tu obtiens la même valeur qu'un calcul sur un seul thread.</p>",
      hint: "<p>Écris une méthode <code>long SumSquares(long from, long to)</code>. Dans la boucle de création, copie l'indice dans une variable locale (<code>int part = p;</code>) avant de l'utiliser dans la lambda.</p>",
      solution: `const int parts = 4;
const long size = 500_000;

var tasks = new List<Task<long>>();
for (int p = 0; p < parts; p++)
{
    int part = p; // copie locale pour la lambda
    tasks.Add(Task.Run(() => SumSquares(part * size + 1, (part + 1) * size)));
}

long parallelSum = 0;
foreach (Task<long> task in tasks) parallelSum += await task;

long singleSum = SumSquares(1, parts * size);
Console.WriteLine($"Parallèle : {parallelSum}");
Console.WriteLine($"Un thread : {singleSum}");
Console.WriteLine($"Identiques : {parallelSum == singleSum}");

static long SumSquares(long from, long to)
{
    long total = 0;
    for (long i = from; i <= to; i++) total += i * i;
    return total;
}`
    }
  ],
  quiz: [
    {
      q: "Pourquoi <code>counter++</code> exécuté par deux threads peut-il perdre des incréments ?",
      options: ["Parce que <code>++</code> est interdit dans une lambda", "Parce que c'est lire, ajouter, écrire : deux threads peuvent lire la même valeur", "Parce que <code>int</code> déborde au-delà d'un million"],
      answer: 1,
      why: "<code>counter++</code> n'est pas atomique. Si deux threads lisent 10 en même temps, ils écrivent tous les deux 11. Un <code>int</code> va jusqu'à plus de 2 milliards, aucun débordement ici."
    },
    {
      q: "Quel outil choisir pour un traitement d'image lourd qui ne doit pas figer le programme ?",
      options: ["<code>Task.Run</code>", "<code>await Task.Delay</code>", "<code>async void</code>"],
      answer: 0,
      why: "Le traitement d'image est du calcul CPU : <code>Task.Run</code> le confie à un thread du pool. <code>Task.Delay</code> ne fait qu'attendre, et <code>async void</code> est à éviter."
    },
    {
      q: "Laquelle de ces variables ne peut PAS provoquer de race condition ?",
      options: ["Un champ d'une classe modifié par plusieurs tâches", "Une variable déclarée avant <code>Task.Run</code> et modifiée dans la lambda", "Une variable déclarée à l'intérieur de la lambda"],
      answer: 2,
      why: "Une variable déclarée dans la lambda est locale au thread qui l'exécute. Les deux autres sont partagées entre les threads, donc à risque dès qu'on les modifie."
    },
    {
      q: "Que garantit <code>Interlocked.Increment(ref x)</code> ?",
      options: ["Que <code>x</code> ne dépassera jamais sa valeur maximale", "Que l'incrément se fait en une seule étape indivisible", "Que plusieurs variables sont modifiées ensemble de façon cohérente"],
      answer: 1,
      why: "L'opération est atomique : aucun autre thread ne peut s'intercaler. Mais elle ne protège qu'une variable ; pour plusieurs données liées, il faut un <code>lock</code>."
    }
  ],
  resources: [
    { label: "Classe Interlocked (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/api/system.threading.interlocked" },
    { label: "Thread pool managé (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/threading/the-managed-thread-pool" }
  ]
});

// ===================== 6.7 lock et collections thread-safe =====================
window.COURSE.push({
  key: "l-lock-concurrent",
  title: "6.7 lock et collections thread-safe",
  summary: "Tu sauras protéger des données partagées avec lock, éviter les deadlocks, et utiliser les collections concurrentes de .NET à la place d'un verrou fait main.",
  objectives: [
    "Protéger une section critique avec lock et un objet de verrou privé",
    "Comprendre et éviter un deadlock",
    "Utiliser SemaphoreSlim quand il faut un await dans la zone protégée",
    "Choisir ConcurrentDictionary et ConcurrentQueue"
  ],
  analogy: `<p>Dans certains cafés, les toilettes ferment à clé et la clé est accrochée au comptoir. Une seule personne peut la prendre : les autres attendent qu'elle revienne. C'est exactement un <code>lock</code>. La clé, c'est l'objet de verrou ; les toilettes, c'est le code protégé. Et si quelqu'un garde la clé une heure dans sa poche, tout le monde fait la queue : un verrou se garde le moins longtemps possible.</p>`,
  lesson: `
<h3>lock : un seul thread à la fois</h3>
<p>En 6.6, <code>Interlocked</code> protégeait une seule variable. Mais souvent, il faut faire plusieurs choses d'un bloc : « vérifier qu'il reste un exemplaire, puis le retirer ». Si deux threads vérifient en même temps, ils voient tous les deux « 1 exemplaire » et l'empruntent tous les deux. Ce bloc qui ne doit jamais être exécuté par deux threads à la fois s'appelle une <strong>section critique</strong>.</p>
<p>L'instruction <code>lock (verrou) { … }</code> garantit qu'un seul thread à la fois exécute le bloc. Les autres attendent à l'entrée. Le verrou est rendu automatiquement à la sortie du bloc, même en cas d'exception.</p>
<div class="flow"><span>Prendre la clé</span><span>Vérifier puis modifier</span><span>Rendre la clé</span></div>

<h3>Quel objet utiliser comme verrou ?</h3>
<p>Le verrou est un objet dédié, <strong>privé</strong> et en lecture seule. Privé, pour qu'aucun code extérieur ne puisse le verrouiller et te bloquer. Depuis .NET 9, il existe un type fait pour ça : <code>System.Threading.Lock</code>, plus clair et un peu plus rapide.</p>
<table>
<tr><th>Version</th><th>Déclaration</th></tr>
<tr><td>.NET 9 et plus (recommandé)</td><td><code>private readonly Lock _lock = new();</code></td></tr>
<tr><td>Avant .NET 9</td><td><code>private readonly object _lock = new();</code></td></tr>
<tr><td>À éviter</td><td><code>lock (this)</code>, <code>lock (typeof(…))</code>, <code>lock (\"texte\")</code> : visibles par tout le monde</td></tr>
</table>
<p>Règle importante : <strong>toutes</strong> les lectures et écritures de la donnée partagée passent par le même verrou. Un seul accès oublié, et la protection ne sert à rien.</p>
<div class="tip">Garde le verrou court : pas de calcul lourd, pas d'appel réseau, pas d'affichage dans le <code>lock</code>. Prépare tout avant, verrouille juste le temps de lire ou modifier la donnée, puis relâche.</div>

<h3>Le deadlock, ou l'étreinte fatale</h3>
<p>Un <strong>deadlock</strong> (interblocage), c'est quand deux threads s'attendent mutuellement pour toujours. Le thread A tient le verrou 1 et veut le verrou 2 ; le thread B tient le verrou 2 et veut le verrou 1. Aucun ne lâche ce qu'il a : le programme se fige, sans erreur ni message.</p>
<pre class="diagram">
Thread A                     Thread B
tient  [verrou 1]            tient  [verrou 2]
veut   [verrou 2] ...        veut   [verrou 1] ...
       |                            |
       +---- attend B ----+  +-- attend A ----+
                  pour toujours
</pre>
<p>Pour l'éviter : prends un seul verrou à la fois quand c'est possible ; si tu dois en prendre plusieurs, prends-les <strong>toujours dans le même ordre</strong> partout dans le code ; et n'appelle pas de code inconnu (un event, une méthode virtuelle) pendant que tu tiens un verrou.</p>

<h3>Pas d'await dans un lock</h3>
<p>Le compilateur refuse <code>await</code> à l'intérieur d'un <code>lock</code>. La raison : un <code>lock</code> appartient à un thread, alors qu'après un <code>await</code>, la suite peut reprendre sur un autre thread. Si tu as besoin d'attendre de l'I/O dans une section protégée (écrire dans un fichier partagé, par exemple), utilise <code>SemaphoreSlim(1, 1)</code> : un compteur qui laisse passer une seule tâche à la fois et qui sait attendre de façon asynchrone.</p>
<div class="compare">
<div><h4>lock</h4><p>Code synchrone, très court. Rendu automatique à la fin du bloc. Pas d'<code>await</code> possible.</p></div>
<div><h4>SemaphoreSlim(1, 1)</h4><p><code>await sem.WaitAsync()</code> pour entrer, <code>sem.Release()</code> dans un <code>finally</code> pour sortir. <code>await</code> autorisé à l'intérieur.</p></div>
</div>

<h3>Les collections concurrentes</h3>
<p>Une <code>List&lt;T&gt;</code> ou un <code>Dictionary&lt;K, V&gt;</code> classique n'est <strong>pas</strong> thread-safe : deux ajouts simultanés peuvent corrompre la collection. Plutôt que de tout entourer de <code>lock</code>, utilise celles de <code>System.Collections.Concurrent</code>, conçues pour plusieurs threads :</p>
<table>
<tr><th>Collection</th><th>Méthodes clés</th></tr>
<tr><td><code>ConcurrentDictionary&lt;K, V&gt;</code></td><td><code>GetOrAdd</code>, <code>AddOrUpdate</code>, <code>TryAdd</code>, <code>TryRemove</code></td></tr>
<tr><td><code>ConcurrentQueue&lt;T&gt;</code></td><td><code>Enqueue</code>, <code>TryDequeue</code> (premier entré, premier sorti)</td></tr>
<tr><td><code>ConcurrentBag&lt;T&gt;</code></td><td><code>Add</code>, <code>TryTake</code> (sans ordre)</td></tr>
</table>
<p>Ce qui compte, ce sont les méthodes « tout en un » : <code>AddOrUpdate</code> lit et met à jour en une seule opération sûre. Si tu écris <code>if (!dict.ContainsKey(k)) dict[k] = 1;</code>, tu recrées la race condition du « vérifier puis agir », même avec une collection concurrente.</p>

<h3>L'immutabilité, la meilleure protection</h3>
<p>Une donnée qu'on ne modifie jamais peut être lue par mille threads sans aucun risque. Les <code>record</code> immuables du chapitre 4 sont donc tes alliés : au lieu de modifier un objet partagé, on crée une nouvelle version avec <code>with</code>. Moins il y a de données partagées et modifiables, moins il y a de verrous à écrire.</p>
<div class="note">Ordre de préférence d'un pro : pas de partage (données locales) ; puis des données immuables ; puis une collection concurrente ; puis <code>Interlocked</code> pour un simple compteur ; et seulement en dernier un <code>lock</code> écrit à la main, toujours court.</div>
`,
  examples: [
    {
      title: "Vérifier puis agir sous verrou",
      code: `var office = new TicketOffice(100);

var buyers = new List<Task<bool>>();
for (int i = 0; i < 150; i++)
    buyers.Add(Task.Run(() => office.TryBuy()));

bool[] results = await Task.WhenAll(buyers);
Console.WriteLine($"Billets vendus : {results.Count(ok => ok)}");
Console.WriteLine($"Billets restants : {office.Remaining}");

class TicketOffice
{
    private readonly Lock _lock = new();
    private int _remaining;

    public TicketOffice(int tickets) => _remaining = tickets;

    public int Remaining { get { lock (_lock) return _remaining; } }

    public bool TryBuy()
    {
        lock (_lock)
        {
            if (_remaining == 0) return false; // vérifier...
            _remaining--;                      // ...puis agir, sans interruption
            return true;
        }
    }
}`,
      output: `Billets vendus : 100
Billets restants : 0`,
      steps: [
        "<code>buyers.Add(Task.Run(() =&gt; office.TryBuy()))</code> : 150 acheteurs essaient d'acheter en même temps sur des threads du pool.",
        "<code>bool[] results = await Task.WhenAll(buyers);</code> : on attend tous les achats et on récupère leurs résultats (détaillé en 6.8).",
        "<code>private readonly Lock _lock = new();</code> : l'objet de verrou, privé, du type <code>Lock</code> de .NET 9+.",
        "<code>lock (_lock) { … }</code> : un seul thread à la fois peut vérifier et décrémenter.",
        "<code>if (_remaining == 0) return false;</code> : sans verrou, deux threads pourraient voir 1 billet restant et le vendre deux fois.",
        "<code>get { lock (_lock) return _remaining; }</code> : même la lecture passe par le verrou, pour toujours lire une valeur à jour."
      ],
      explain: "Quel que soit l'ordre d'arrivée des acheteurs, on vend exactement 100 billets : jamais plus, jamais moins."
    },
    {
      title: "ConcurrentDictionary et ConcurrentQueue",
      code: `using System.Collections.Concurrent;

var views = new ConcurrentDictionary<string, int>();
string[] visits = ["Dune", "Fondation", "Dune", "Dune", "Hobbit", "Fondation"];

await Task.WhenAll(visits.Select(title => Task.Run(() =>
    views.AddOrUpdate(title, 1, (_, old) => old + 1))));

foreach (var (title, count) in views.OrderBy(v => v.Key))
    Console.WriteLine($"{title} : {count}");

var cache = new ConcurrentDictionary<string, string>();
Console.WriteLine(cache.GetOrAdd("Dune", t => $"Fiche de {t}"));
Console.WriteLine(cache.GetOrAdd("Dune", t => "jamais utilisé"));

var returns = new ConcurrentQueue<string>();
returns.Enqueue("Dune");
returns.Enqueue("Hobbit");
while (returns.TryDequeue(out string? book))
    Console.WriteLine($"Retour traité : {book}");`,
      output: `Dune : 3
Fondation : 2
Hobbit : 1
Fiche de Dune
Fiche de Dune
Retour traité : Dune
Retour traité : Hobbit`,
      steps: [
        "<code>using System.Collections.Concurrent;</code> : l'espace de noms des collections thread-safe.",
        "<code>visits.Select(title =&gt; Task.Run(…))</code> : une tâche par visite, toutes lancées en même temps.",
        "<code>views.AddOrUpdate(title, 1, (_, old) =&gt; old + 1)</code> : ajoute 1 si la clé est nouvelle, sinon calcule la nouvelle valeur à partir de l'ancienne, en une opération sûre.",
        "<code>views.OrderBy(v =&gt; v.Key)</code> : un dictionnaire n'a pas d'ordre garanti, on trie pour un affichage stable.",
        "<code>cache.GetOrAdd(\"Dune\", t =&gt; …)</code> : la clé est absente, la lambda crée la valeur. Au second appel, la clé existe : la valeur déjà stockée est renvoyée et la lambda n'est pas appelée.",
        "<code>returns.TryDequeue(out string? book)</code> : retire le premier élément de la file s'il y en a un, et renvoie <code>false</code> quand elle est vide."
      ],
      explain: "Avec un Dictionary classique, les six mises à jour simultanées pourraient perdre des vues ou corrompre la collection."
    },
    {
      title: "SemaphoreSlim : une section protégée avec await",
      code: `var gate = new SemaphoreSlim(1, 1); // une seule tâche à la fois
int saves = 0;

await Task.WhenAll(SaveAsync("A"), SaveAsync("B"), SaveAsync("C"));
Console.WriteLine($"Sauvegardes : {saves}");

async Task SaveAsync(string name)
{
    await gate.WaitAsync(); // attend son tour sans bloquer de thread
    try
    {
        await Task.Delay(100); // impossible dans un lock, autorisé ici
        saves++;
        Console.WriteLine($"Sauvegarde {name} terminée");
    }
    finally
    {
        gate.Release(); // rend la place, même en cas d'exception
    }
}`,
      output: `Sauvegarde A terminée
Sauvegarde B terminée
Sauvegarde C terminée
Sauvegardes : 3`,
      steps: [
        "<code>new SemaphoreSlim(1, 1)</code> : une place disponible sur un maximum de une, c'est un verrou compatible avec <code>await</code>.",
        "<code>await gate.WaitAsync();</code> : A prend la place ; B et C attendent leur tour sans bloquer de thread.",
        "<code>await Task.Delay(100);</code> : une attente asynchrone dans la zone protégée, ce qu'un <code>lock</code> refuserait à la compilation.",
        "<code>saves++;</code> : sans danger ici, une seule tâche à la fois passe dans ce bloc.",
        "<code>finally { gate.Release(); }</code> : la place est toujours rendue. Si on l'oublie, les autres tâches attendent pour toujours."
      ],
      explain: "Les sauvegardes passent l'une après l'autre (environ 300 ms au total) ; l'ordre A, B, C est le plus courant mais n'est pas garanti."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Un compte bancaire protégé",
      prompt: "<p>Crée une classe <code>Account</code> avec un solde privé, un verrou <code>Lock</code> et une méthode <code>Deposit(int amount)</code> protégée par <code>lock</code>. Lance 10 tâches qui déposent chacune 100 fois 1 €, puis affiche le solde (1000).</p>",
      hint: "<p>Ajoute une propriété <code>Balance</code> qui lit le solde sous le même verrou.</p>",
      solution: `var account = new Account();
var tasks = new List<Task>();
for (int t = 0; t < 10; t++)
    tasks.Add(Task.Run(() =>
    {
        for (int i = 0; i < 100; i++) account.Deposit(1);
    }));
await Task.WhenAll(tasks);
Console.WriteLine($"Solde : {account.Balance} €");

class Account
{
    private readonly Lock _lock = new();
    private int _balance;

    public int Balance { get { lock (_lock) return _balance; } }

    public void Deposit(int amount)
    {
        lock (_lock) { _balance += amount; }
    }
}`
    },
    {
      level: "moyen",
      title: "Compter les mots en parallèle",
      prompt: "<p>Voici des phrases : <code>[\"le chat dort\", \"le chien court\", \"le chat court\"]</code>. Lance une tâche par phrase qui découpe la phrase en mots et compte chaque mot dans un <code>ConcurrentDictionary&lt;string, int&gt;</code>. Affiche ensuite les mots triés par ordre alphabétique avec leur nombre.</p>",
      hint: "<p>Dans chaque tâche : <code>foreach (string word in sentence.Split(' ')) counts.AddOrUpdate(word, 1, (_, n) =&gt; n + 1);</code></p>",
      solution: `using System.Collections.Concurrent;

string[] sentences = ["le chat dort", "le chien court", "le chat court"];
var counts = new ConcurrentDictionary<string, int>();

await Task.WhenAll(sentences.Select(sentence => Task.Run(() =>
{
    foreach (string word in sentence.Split(' '))
        counts.AddOrUpdate(word, 1, (_, n) => n + 1);
})));

foreach (var (word, count) in counts.OrderBy(c => c.Key))
    Console.WriteLine($"{word} : {count}");`
    },
    {
      level: "difficile",
      title: "Deux verrous, toujours dans le même ordre",
      prompt: "<p>Écris une méthode <code>Transfer(Wallet from, Wallet to, int amount)</code> qui déplace de l'argent entre deux portefeuilles, chacun ayant son propre verrou. Pour éviter le deadlock quand A envoie à B pendant que B envoie à A, prends toujours les verrous dans l'ordre croissant de l'<code>Id</code> du portefeuille. Lance 1 000 transferts A vers B et 1 000 de B vers A en parallèle, puis vérifie que le total des deux soldes n'a pas changé.</p>",
      hint: "<p>Calcule <code>var first = from.Id &lt; to.Id ? from : to;</code> et <code>var second = …</code>, puis imbrique <code>lock (first.Sync) { lock (second.Sync) { … } }</code>.</p>",
      solution: `var a = new Wallet(1, 1000);
var b = new Wallet(2, 1000);

Task ab = Task.Run(() => { for (int i = 0; i < 1000; i++) Transfer(a, b, 1); });
Task ba = Task.Run(() => { for (int i = 0; i < 1000; i++) Transfer(b, a, 1); });
await Task.WhenAll(ab, ba);

Console.WriteLine($"A : {a.Balance}, B : {b.Balance}, total : {a.Balance + b.Balance}");

static void Transfer(Wallet from, Wallet to, int amount)
{
    // Toujours le plus petit Id en premier : pas d'attente croisée possible
    Wallet first = from.Id < to.Id ? from : to;
    Wallet second = from.Id < to.Id ? to : from;
    lock (first.Sync)
    {
        lock (second.Sync)
        {
            from.Balance -= amount;
            to.Balance += amount;
        }
    }
}

class Wallet
{
    public Wallet(int id, int balance)
    {
        Id = id;
        Balance = balance;
    }

    public int Id { get; }
    public int Balance { get; set; }
    public Lock Sync { get; } = new();
}`
    }
  ],
  quiz: [
    {
      q: "Quel objet est le meilleur choix comme verrou dans une classe en .NET 10 ?",
      options: ["<code>this</code>", "<code>private readonly Lock _lock = new();</code>", "Une chaîne <code>\"verrou\"</code>"],
      answer: 1,
      why: "Un objet <code>Lock</code> privé et dédié ne peut être verrouillé que par ta classe. <code>this</code> et les chaînes sont visibles par d'autres codes, qui pourraient prendre le même verrou et te bloquer."
    },
    {
      q: "Deux threads restent figés pour toujours : chacun tient un verrou et attend celui de l'autre. Comment s'appelle ce problème ?",
      options: ["Une race condition", "Une famine du pool de threads", "Un deadlock"],
      answer: 2,
      why: "C'est un deadlock (interblocage). Une race condition donne un résultat faux mais ne fige rien. Pour l'éviter, prends toujours les verrous dans le même ordre."
    },
    {
      q: "Tu dois écrire de façon asynchrone dans un fichier partagé, une tâche à la fois. Que choisis-tu ?",
      options: ["<code>SemaphoreSlim(1, 1)</code> avec <code>WaitAsync</code> et <code>Release</code>", "<code>lock</code> autour du <code>await</code>", "<code>Interlocked.Increment</code>"],
      answer: 0,
      why: "Un <code>await</code> dans un <code>lock</code> ne compile pas. <code>SemaphoreSlim(1, 1)</code> joue le rôle de verrou asynchrone. <code>Interlocked</code> ne protège qu'une variable numérique."
    },
    {
      q: "Pourquoi <code>if (!dict.ContainsKey(k)) dict[k] = 1;</code> reste risqué même avec un <code>ConcurrentDictionary</code> ?",
      options: ["Parce que <code>ContainsKey</code> n'existe pas sur cette collection", "Parce qu'un autre thread peut ajouter la clé entre la vérification et l'écriture", "Parce que l'indexeur lève toujours une exception"],
      answer: 1,
      why: "Chaque appel est sûr individuellement, mais pas l'enchaînement « vérifier puis agir ». Les méthodes <code>GetOrAdd</code> et <code>AddOrUpdate</code> font les deux en une seule opération."
    }
  ],
  project: "<p>Rends l'emprunt de ta Bibliothèque thread-safe. Dans ta classe <code>Library</code>, ajoute <code>private readonly Lock _lock = new();</code> et protège <code>Borrow(string isbn, int memberId)</code> : sous le verrou, vérifie que le livre est disponible, marque-le emprunté et ajoute l'emprunt. Teste en lançant 20 tâches qui empruntent le même livre en même temps : une seule doit réussir. Bonus : stocke les compteurs d'emprunts par livre dans un <code>ConcurrentDictionary&lt;string, int&gt;</code> avec <code>AddOrUpdate</code>.</p>",
  resources: [
    { label: "Instruction lock (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/language-reference/statements/lock" },
    { label: "Collections thread-safe (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/collections/thread-safe/" }
  ]
});

// ===================== 6.8 Lancer des tâches en parallèle =====================
window.COURSE.push({
  key: "l-parallel-tasks",
  title: "6.8 Lancer des tâches en parallèle",
  summary: "Tu sauras lancer plusieurs opérations en même temps, attendre toutes ou la première, limiter le nombre d'appels simultanés et paralléliser un calcul.",
  objectives: [
    "Attendre plusieurs tâches et récupérer leurs résultats avec Task.WhenAll",
    "Réagir à la première tâche terminée et poser un timeout avec Task.WhenAny",
    "Limiter le parallélisme avec SemaphoreSlim et Parallel.ForEachAsync",
    "Savoir quand ne pas paralléliser"
  ],
  analogy: `<p>Tu prépares un repas : pâtes, sauce et salade. En séquentiel, tu fais les pâtes, puis la sauce, puis la salade : 45 minutes. En parallèle, tu mets l'eau à chauffer, la sauce à mijoter, et tu coupes la salade pendant ce temps : 20 minutes, la durée de la plus longue tâche. Mais tu n'as que quatre feux : lancer dix casseroles en même temps ne marche pas. Il faut limiter le nombre de choses en cours.</p>`,
  lesson: `
<h3>Séquentiel ou parallèle</h3>
<p>Quand tu écris trois <code>await</code> à la suite, chaque appel attend la fin du précédent : les durées s'additionnent. C'est nécessaire quand un appel a besoin du résultat du précédent. Mais si les appels sont <strong>indépendants</strong> (trois API différentes, trois fichiers), tu peux les lancer tous d'abord, puis les attendre ensemble : la durée totale devient celle du plus lent.</p>
<pre class="diagram">
Séquentiel (1 s + 1 s + 1 s = ~3 s)
A [====]
B       [====]
C             [====]

Parallèle (~1 s, la durée du plus lent)
A [====]
B [====]
C [====]
  0    1    2    3   secondes
</pre>

<h3>Task.WhenAll : attendre tout le monde</h3>
<p><code>Task.WhenAll(t1, t2, t3)</code> renvoie une tâche qui se termine quand toutes sont finies. Avec des <code>Task&lt;T&gt;</code>, l'<code>await</code> te donne directement un tableau <code>T[]</code> des résultats, <strong>dans l'ordre des tâches</strong> passées (pas dans l'ordre où elles ont fini). C'est l'équivalent exact de <code>Promise.all</code>.</p>
<p>Tu peux aussi lui passer une liste, très pratique avec LINQ : <code>await Task.WhenAll(ids.Select(id =&gt; LoadAsync(id)))</code>. Rappel de la leçon 6.5 : si plusieurs tâches échouent, l'<code>await</code> relance la première exception.</p>

<h3>Task.WhenAny : le premier qui répond</h3>
<p><code>Task.WhenAny(t1, t2)</code> se termine dès que <strong>l'une</strong> des tâches est finie, et te renvoie cette tâche-là. C'est l'équivalent de <code>Promise.race</code>. Deux usages courants :</p>
<ul>
<li>interroger deux serveurs miroirs et garder la réponse la plus rapide ;</li>
<li>poser un timeout : <code>WhenAny(appel, Task.Delay(500))</code>, et si c'est le délai qui gagne, on abandonne l'attente.</li>
</ul>
<div class="tip">Attention : <code>WhenAny</code> n'arrête pas les autres tâches, elles continuent en arrière-plan. Pour les stopper vraiment, passe-leur un <code>CancellationToken</code> et annule-le (leçon 6.5).</div>

<h3>Limiter le nombre d'appels simultanés</h3>
<p>Lancer 10 000 appels HTTP d'un coup, c'est surcharger le serveur distant (qui risque de te bloquer) et ta propre machine. On limite le <strong>degré de parallélisme</strong> (le nombre de tâches en cours en même temps). Deux outils :</p>
<table>
<tr><th>Outil</th><th>Principe</th></tr>
<tr><td><code>SemaphoreSlim(4)</code></td><td>Un compteur de 4 places : chaque tâche fait <code>await sem.WaitAsync()</code> avant l'appel et <code>sem.Release()</code> après. La 5e attend qu'une place se libère.</td></tr>
<tr><td><code>Parallel.ForEachAsync</code></td><td>Parcourt une collection en lançant le corps de boucle en parallèle, avec <code>MaxDegreeOfParallelism</code> dans un <code>ParallelOptions</code>.</td></tr>
</table>
<p>En 6.7, <code>SemaphoreSlim(1, 1)</code> laissait passer une seule tâche. Ici, on lui donne plusieurs places : c'est le même outil, réglé différemment.</p>

<h3>Parallel.For pour le calcul CPU</h3>
<p>Pour du calcul pur, <code>Parallel.For(0, n, i =&gt; …)</code> répartit les itérations d'une boucle sur tous les cœurs du processeur. Pas d'<code>await</code> ici : c'est synchrone, et la méthode rend la main quand toutes les itérations sont faites. Les règles de 6.6 et 6.7 s'appliquent : chaque itération doit travailler sur ses propres données (par exemple, sa propre case <code>results[i]</code> d'un tableau).</p>
<div class="compare">
<div><h4>I/O (réseau, fichiers, base)</h4><p><code>Task.WhenAll</code>, <code>Parallel.ForEachAsync</code>, <code>SemaphoreSlim</code></p></div>
<div><h4>Calcul CPU</h4><p><code>Parallel.For</code>, <code>Parallel.ForEach</code>, <code>Task.Run</code></p></div>
</div>

<h3>Quand ne PAS paralléliser</h3>
<ul>
<li>Quand les opérations dépendent l'une de l'autre (il faut l'utilisateur avant ses commandes).</li>
<li>Quand le travail est minuscule : lancer des tâches coûte plus cher que de faire 100 additions.</li>
<li>Avec un <code>DbContext</code> d'EF Core, qui n'accepte qu'une opération à la fois (tu le verras bientôt).</li>
<li>Quand tout le monde modifie la même donnée : les verrous annulent le gain.</li>
</ul>

<h3>Récapitulatif du chapitre et suite</h3>
<div class="flow"><span>Fichiers et JSON</span><span>async / await</span><span>Annulation et erreurs</span><span>Threads et verrous</span><span>Parallélisme</span></div>
<p>Tu sais maintenant lire et écrire des données, les sérialiser en JSON, attendre de l'I/O sans bloquer, annuler, protéger des données partagées et lancer plusieurs opérations à la fois. C'est exactement le quotidien d'une API ASP.NET Core : chaque action de contrôleur est <code>async</code>, reçoit un <code>CancellationToken</code>, appelle la base avec <code>await</code> et renvoie du JSON en camelCase. Prochaine étape : SQL Server.</p>
<div class="note">En API, on parallélise surtout les appels sortants indépendants (deux services externes, par exemple) avec <code>Task.WhenAll</code>, toujours avec une limite et un timeout. On n'utilise presque jamais <code>Parallel.For</code> dans une requête web : le serveur sert déjà plusieurs requêtes en parallèle, et monopoliser tous les cœurs pour une seule pénaliserait les autres.</div>
`,
  examples: [
    {
      title: "Séquentiel contre Task.WhenAll",
      code: `using System.Diagnostics;

var sw = Stopwatch.StartNew();
int a = await GetStockAsync("Dune");
int b = await GetStockAsync("Fondation");
int c = await GetStockAsync("Hobbit");
Console.WriteLine($"Séquentiel : {a + b + c} exemplaires en ~{sw.Elapsed.TotalSeconds:F0} s");

sw.Restart();
int[] stocks = await Task.WhenAll(
    GetStockAsync("Dune"),
    GetStockAsync("Fondation"),
    GetStockAsync("Hobbit"));
Console.WriteLine($"Parallèle : {stocks.Sum()} exemplaires en ~{sw.Elapsed.TotalSeconds:F0} s");
Console.WriteLine($"Résultats dans l'ordre : {string.Join(", ", stocks)}");

async Task<int> GetStockAsync(string title)
{
    await Task.Delay(1000); // simule un appel à un service
    return title.Length;
}`,
      output: `Séquentiel : 19 exemplaires en ~3 s
Parallèle : 19 exemplaires en ~1 s
Résultats dans l'ordre : 4, 9, 6`,
      steps: [
        "<code>int a = await GetStockAsync(\"Dune\");</code> puis b et c : trois attentes l'une après l'autre, environ 3 secondes.",
        "<code>Task.WhenAll(GetStockAsync(…), …)</code> : les trois appels démarrent immédiatement, avant toute attente.",
        "<code>int[] stocks = await …</code> : l'<code>await</code> renvoie un tableau des trois résultats, au bout d'environ 1 seconde.",
        "<code>stocks.Sum()</code> : on retrouve le même total, 4 + 9 + 6 = 19.",
        "<code>string.Join(\", \", stocks)</code> : les résultats sont dans l'ordre des tâches passées à <code>WhenAll</code>.",
        "<code>return title.Length;</code> : un faux stock pour la démonstration, le nombre de lettres du titre."
      ],
      explain: "Les durées peuvent varier de quelques millisecondes, mais on retrouve toujours environ 3 s contre 1 s."
    },
    {
      title: "Task.WhenAny : le plus rapide et le timeout",
      code: `Task<string> mirrorA = FetchAsync("Serveur A", 300);
Task<string> mirrorB = FetchAsync("Serveur B", 800);
Task<string> winner = await Task.WhenAny(mirrorA, mirrorB);
Console.WriteLine($"Premier à répondre : {await winner}");

Task<string> slowCall = FetchAsync("Serveur lent", 2000);
Task timeout = Task.Delay(500);
if (await Task.WhenAny(slowCall, timeout) == timeout)
    Console.WriteLine("Timeout : on abandonne l'attente");
else
    Console.WriteLine(await slowCall);

async Task<string> FetchAsync(string server, int ms)
{
    await Task.Delay(ms); // simule le temps de réponse
    return server;
}`,
      output: `Premier à répondre : Serveur A
Timeout : on abandonne l'attente`,
      steps: [
        "<code>FetchAsync(\"Serveur A\", 300)</code> et <code>FetchAsync(\"Serveur B\", 800)</code> : deux appels lancés en même temps.",
        "<code>await Task.WhenAny(mirrorA, mirrorB)</code> : renvoie la tâche qui a fini en premier, ici A au bout de 300 ms.",
        "<code>await winner</code> : la tâche est terminée, cet <code>await</code> récupère sa valeur immédiatement.",
        "<code>Task timeout = Task.Delay(500);</code> : un minuteur qui sert de délai maximal.",
        "<code>await Task.WhenAny(slowCall, timeout) == timeout</code> : si le minuteur finit avant l'appel, on compare les références des tâches et on sait que c'est un timeout.",
        "<code>else Console.WriteLine(await slowCall);</code> : la branche prise quand l'appel répond à temps."
      ],
      explain: "Après le timeout, slowCall continue de tourner en arrière-plan : en vrai code, on lui passerait un CancellationToken pour l'arrêter."
    },
    {
      title: "Parallel.ForEachAsync limité et Parallel.For",
      code: `using System.Collections.Concurrent;

string[] titles = ["Ubik", "Dune", "Solaris", "Hobbit", "Fondation"];
var availability = new ConcurrentDictionary<string, bool>();
var options = new ParallelOptions { MaxDegreeOfParallelism = 2 };

await Parallel.ForEachAsync(titles, options, async (title, token) =>
{
    await Task.Delay(300, token); // simule l'appel au service
    availability[title] = title.Length % 2 == 0;
});

foreach (var (title, free) in availability.OrderBy(p => p.Key, StringComparer.Ordinal))
    Console.WriteLine($"{title} : {(free ? "disponible" : "emprunté")}");

long[] squares = new long[8];
Parallel.For(0, squares.Length, i => squares[i] = (long)i * i);
Console.WriteLine(string.Join(" ", squares));`,
      output: `Dune : disponible
Fondation : emprunté
Hobbit : disponible
Solaris : emprunté
Ubik : disponible
0 1 4 9 16 25 36 49`,
      steps: [
        "<code>new ParallelOptions { MaxDegreeOfParallelism = 2 }</code> : au maximum deux vérifications en cours en même temps.",
        "<code>Parallel.ForEachAsync(titles, options, async (title, token) =&gt; { … })</code> : le corps de boucle est asynchrone et reçoit un token d'annulation.",
        "<code>availability[title] = …</code> : les résultats arrivent dans le désordre, donc on les range dans un <code>ConcurrentDictionary</code> thread-safe.",
        "<code>OrderBy(p =&gt; p.Key, StringComparer.Ordinal)</code> : on trie pour un affichage stable, quel que soit l'ordre d'arrivée.",
        "<code>Parallel.For(0, squares.Length, i =&gt; squares[i] = (long)i * i)</code> : les 8 calculs sont répartis sur les cœurs.",
        "<code>squares[i]</code> : chaque itération écrit dans sa propre case, aucune donnée partagée, aucun verrou nécessaire."
      ],
      explain: "Les vérifications s'exécutent dans un ordre variable (environ 900 ms au total, par paquets de deux), mais le tri rend l'affichage identique à chaque fois."
    }
  ],
  exercises: [
    {
      level: "facile",
      title: "Trois chargements en parallèle",
      prompt: "<p>Écris <code>async Task&lt;string&gt; LoadAsync(string name, int ms)</code> qui attend <code>ms</code> millisecondes puis renvoie <code>name</code>. Charge <code>profil</code> (400 ms), <code>commandes</code> (700 ms) et <code>favoris</code> (300 ms) en parallèle avec <code>Task.WhenAll</code>, puis affiche les trois résultats séparés par des virgules.</p>",
      hint: "<p><code>string[] results = await Task.WhenAll(…);</code> puis <code>string.Join(\", \", results)</code>.</p>",
      solution: `string[] results = await Task.WhenAll(
    LoadAsync("profil", 400),
    LoadAsync("commandes", 700),
    LoadAsync("favoris", 300));

Console.WriteLine(string.Join(", ", results)); // profil, commandes, favoris

async Task<string> LoadAsync(string name, int ms)
{
    await Task.Delay(ms);
    return name;
}`
    },
    {
      level: "moyen",
      title: "Pas plus de 3 appels à la fois",
      prompt: "<p>Tu dois appeler un service pour 10 identifiants, mais il n'accepte que 3 appels simultanés. Avec un <code>SemaphoreSlim(3)</code>, écris <code>CallAsync(int id)</code> qui attend sa place, simule un appel de 200 ms, puis rend sa place. Suis le nombre d'appels en cours avec <code>Interlocked</code> et affiche le maximum observé, qui ne doit jamais dépasser 3.</p>",
      hint: "<p>Juste après <code>WaitAsync</code>, fais <code>int now = Interlocked.Increment(ref running);</code> et mets à jour le maximum sous un petit <code>lock</code>. N'oublie pas <code>Interlocked.Decrement</code> et <code>Release</code> dans le <code>finally</code>.</p>",
      solution: `var sem = new SemaphoreSlim(3);
var maxLock = new Lock();
int running = 0;
int maxRunning = 0;

await Task.WhenAll(Enumerable.Range(1, 10).Select(CallAsync));
Console.WriteLine($"Maximum d'appels simultanés : {maxRunning}");

async Task CallAsync(int id)
{
    await sem.WaitAsync();
    try
    {
        int now = Interlocked.Increment(ref running);
        lock (maxLock) { maxRunning = Math.Max(maxRunning, now); }
        await Task.Delay(200); // l'appel simulé
    }
    finally
    {
        Interlocked.Decrement(ref running);
        sem.Release();
    }
}`
    },
    {
      level: "difficile",
      title: "Le plus rapide, avec un délai maximal",
      prompt: "<p>Écris <code>async Task&lt;string?&gt; FirstOrTimeoutAsync(Task&lt;string&gt;[] calls, int timeoutMs)</code> qui renvoie le résultat du premier appel terminé, ou <code>null</code> si aucun n'a répondu avant le délai. Teste avec trois appels simulés (900, 400 et 1200 ms) et un délai de 1 000 ms, puis avec un délai de 200 ms.</p>",
      hint: "<p>Construis d'abord <code>Task&lt;string&gt; first = Task.WhenAny(calls).Unwrap();</code> (<code>Unwrap</code> transforme le <code>Task&lt;Task&lt;string&gt;&gt;</code> en <code>Task&lt;string&gt;</code>), puis fais un <code>WhenAny</code> entre <code>first</code> et <code>Task.Delay(timeoutMs)</code>.</p>",
      solution: `Console.WriteLine(await FirstOrTimeoutAsync(MakeCalls(), 1000) ?? "Aucune réponse");
Console.WriteLine(await FirstOrTimeoutAsync(MakeCalls(), 200) ?? "Aucune réponse");

Task<string>[] MakeCalls() =>
[
    FetchAsync("Paris", 900),
    FetchAsync("Lyon", 400),
    FetchAsync("Lille", 1200)
];

async Task<string?> FirstOrTimeoutAsync(Task<string>[] calls, int timeoutMs)
{
    Task<string> first = Task.WhenAny(calls).Unwrap();
    Task timeout = Task.Delay(timeoutMs);
    if (await Task.WhenAny(first, timeout) == timeout)
        return null;
    return await first;
}

async Task<string> FetchAsync(string server, int ms)
{
    await Task.Delay(ms);
    return $"Réponse de {server}";
}`
    }
  ],
  quiz: [
    {
      q: "Trois appels indépendants durent 1 s, 2 s et 3 s. Combien de temps prend <code>await Task.WhenAll(…)</code> ?",
      options: ["Environ 6 s", "Environ 3 s", "Environ 1 s"],
      answer: 1,
      why: "Les trois appels tournent en même temps, donc on attend le plus lent : environ 3 s. 6 s, c'est la version séquentielle avec trois <code>await</code> à la suite ; 1 s, c'est seulement le plus rapide (<code>WhenAny</code>)."
    },
    {
      q: "Dans quel ordre <code>await Task.WhenAll(t1, t2, t3)</code> renvoie-t-il les résultats ?",
      options: ["Dans l'ordre où les tâches se sont terminées", "Dans un ordre aléatoire", "Dans l'ordre où les tâches ont été passées"],
      answer: 2,
      why: "Le tableau suit l'ordre des tâches données à <code>WhenAll</code>, comme <code>Promise.all</code> en JS, quel que soit l'ordre de fin."
    },
    {
      q: "Après <code>await Task.WhenAny(call, Task.Delay(500))</code>, le délai a gagné. Que devient <code>call</code> ?",
      options: ["Il continue de s'exécuter en arrière-plan", "Il est annulé automatiquement", "Il lève une <code>TimeoutException</code>"],
      answer: 0,
      why: "<code>WhenAny</code> se contente de te prévenir : il n'arrête rien. Pour stopper l'appel, il faut lui avoir passé un <code>CancellationToken</code> et l'annuler."
    },
    {
      q: "Dans quel cas vaut-il mieux NE PAS paralléliser ?",
      options: ["Pour appeler trois API externes indépendantes", "Quand chaque appel a besoin du résultat du précédent", "Pour vérifier la disponibilité de 50 livres auprès d'un service"],
      answer: 1,
      why: "Si les opérations dépendent l'une de l'autre, elles doivent s'enchaîner. Les deux autres cas sont des appels indépendants, parfaits pour <code>WhenAll</code> ou <code>Parallel.ForEachAsync</code> avec une limite."
    }
  ],
  project: "<p>Ajoute à ta Bibliothèque un service simulé <code>async Task&lt;bool&gt; IsAvailableAtPartnerAsync(string isbn, CancellationToken token)</code> qui attend entre 200 et 800 ms (avec <code>Random.Shared.Next</code>) puis renvoie une disponibilité. Écris ensuite <code>CheckManyAsync(IEnumerable&lt;string&gt; isbns)</code> qui interroge ce service pour tous les livres avec <code>Parallel.ForEachAsync</code> (<code>MaxDegreeOfParallelism = 3</code>), range les réponses dans un <code>ConcurrentDictionary&lt;string, bool&gt;</code> et affiche la liste triée des livres disponibles, avec un <code>CancelAfter</code> de 3 secondes pour l'ensemble.</p>",
  resources: [
    { label: "Démarrer plusieurs tâches asynchrones et les traiter à mesure qu'elles se terminent (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/csharp/asynchronous-programming/start-multiple-async-tasks-and-process-them-as-they-complete" },
    { label: "Bibliothèque parallèle de tâches (Microsoft Learn)", url: "https://learn.microsoft.com/fr-fr/dotnet/standard/parallel-programming/task-parallel-library-tpl" }
  ]
});
